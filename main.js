/* ================================================= */
/* SYSTEM SHIFT - MAIN UX ORCHESTRATOR               */
/* Atmospheric flow + event surface + round pacing   */
/* ================================================= */

import { gameState } from "./game/state.js";
import { baseDeck, shuffleDeck, drawCard } from "./game/deck.js";
import { endRound } from "./game/round.js";
import { initLogger, exportLog } from "./game/logger.js";
import { evaluateOutcome } from "./game/outcomeEngine.js";
import { resolveCard } from "./game/effectResolver.js";
import { resetPhaseTracking, checkSystemPhases } from "./game/phaseEngine.js";
import { setSeed } from "./game/rng.js";
import { initAmbientEngine } from "./game/ambientEngine.js";
import { initInteractionState, addHiddenCards } from "./game/cardInteractions.js";
import { initResourceSystem } from "./game/resourceManagement.js";
import { initOppositionSystem } from "./game/oppositionSystem.js";
import { initOppositionActions } from "./game/oppositionActions.js";
import { getCurrentAct } from "./game/acts.js";
import {
    initTutorial,
    onGameStart,
    onFirstCardPlay,
    onFirstRound,
    onStrainWarning,
    onFirstSynergy,
    checkContextualTips,
    markTutorialComplete
} from "./game/tutorial.js";
import {
    initNarrative,
    checkNarrativeTriggers,
    getTrackNarrative,
    getCardFlavor,
    getNarrativeSummary
} from "./game/narrative.js";
import { scoutFaction, getScoutResult } from "./game/scouting.js";
import { saveLegacy, getLegacyBonuses, getLegacy } from "./game/memory.js";
import { canNegotiate, attemptNegotiation } from "./game/negotiation.js";
import { checkAchievements, getUnlocks, achievements } from "./game/achievements.js";
import {
    initEventSurface,
    publishGameEvent,
    getFeedItems,
    snapshotFeedCursor,
    getEventsAfter,
    setMarkerVerbosity,
    setFeedCap
} from "./game/uiEvents.js";
import { initNotificationCenter, notify } from "./game/notificationCenter.js";
import { syncAtmosphere } from "./game/audioManager.js";
import {
    ROUND_PHASES,
    isPlayablePhase,
    transitionToResolving,
    transitionToAftermath,
    transitionToReady,
    transitionToPlaying,
    getPacingProfile
} from "./game/roundFlow.js";

const UI_SETTINGS_KEY = "systemshift_ui";
const DEFAULT_UI_SETTINGS = {
    pacingMode: "standard",
    orientationMode: "portrait",
    markerVerbosity: "normal",
    feedCap: 40
};

const handDiv = document.getElementById("hand");
const transitionPanel = document.getElementById("transitionPanel");
const roundPhaseIndicator = document.getElementById("roundPhaseIndicator");
const feedList = document.getElementById("situationFeed");
const feedCount = document.getElementById("feedCount");
const narrativeSummaryCard = document.getElementById("narrativeSummaryCard");
const narrativeArcIndicator = document.getElementById("narrativeArcIndicator");

const nextRoundBtn = document.getElementById("nextRoundBtn");
const exportBtn = document.getElementById("exportLogBtn");
const libraryBtn = document.getElementById("libraryBtn");
const libraryModal = document.getElementById("libraryModal");
const libraryContent = document.getElementById("libraryContent");
const libraryCloseBtn = document.getElementById("libraryCloseBtn");
const statsBtn = document.getElementById("statsBtn");
const statsModal = document.getElementById("statsModal");
const statsContent = document.getElementById("statsContent");
const statsCloseBtn = document.getElementById("statsCloseBtn");
const statsResetBtn = document.getElementById("statsResetBtn");

const settingsBtn = document.getElementById("settingsBtn");
const uiSettingsModal = document.getElementById("uiSettingsModal");
const pacingSelect = document.getElementById("pacingSelect");
const markerVerbositySelect = document.getElementById("markerVerbositySelect");
const settingsSaveBtn = document.getElementById("settingsSaveBtn");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");
const orientationToggleBtn = document.getElementById("orientationToggleBtn");

const roundStat = document.getElementById("roundStat");
const surgeStat = document.getElementById("surgeStat");
const leverageStat = document.getElementById("leverageStat");
const pushbackStat = document.getElementById("pushbackStat");
const playsStat = document.getElementById("playsStat");
const warningOverlay = document.getElementById("systemWarningOverlay");
const politicalStat = document.getElementById("politicalStat");
const socialStat = document.getElementById("socialStat");
const momentumStat = document.getElementById("momentumStat");
const infrastructureStat = document.getElementById("infrastructureStat");

const trackElements = {
    care: document.getElementById("track-care"),
    climate: document.getElementById("track-climate"),
    solidarity: document.getElementById("track-solidarity"),
    authority: document.getElementById("track-authority"),
    capital: document.getElementById("track-capital"),
    strain: document.getElementById("track-strain")
};

const factionElements = {
    elite: {
        threat: document.getElementById("eliteThreat"),
        tooltip: document.getElementById("eliteScoutTooltip")
    },
    authoritarian: {
        threat: document.getElementById("authoritarianThreat"),
        tooltip: document.getElementById("authoritarianScoutTooltip")
    },
    statusquo: {
        threat: document.getElementById("statusquoThreat"),
        tooltip: document.getElementById("statusquoScoutTooltip")
    }
};

let previousTrackValues = {};
let currentNegotiationFaction = null;
let transitionTimer = null;
let readyAutoTimer = null;
let latestRoundSummary = null;
let fitRaf = null;

function normalizeOrientationMode(value) {
    return value === "landscape" ? "landscape" : "portrait";
}

function applyOrientationMode(value) {
    const app = document.getElementById("app");
    if (!app) return;
    const mode = normalizeOrientationMode(value);
    gameState.ui.orientationMode = mode;
    app.classList.toggle("layout-landscape", mode === "landscape");
    app.classList.toggle("layout-portrait", mode !== "landscape");

    if (orientationToggleBtn) {
        orientationToggleBtn.textContent = mode === "landscape"
            ? "Layout: Landscape"
            : "Layout: Portrait";
    }
}

function safeJsonParse(raw, fallback) {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function clearTransitionTimers() {
    if (transitionTimer) {
        clearTimeout(transitionTimer);
        transitionTimer = null;
    }
    if (readyAutoTimer) {
        clearTimeout(readyAutoTimer);
        readyAutoTimer = null;
    }
}

function applyViewportFit() {
    const app = document.getElementById("app");
    if (!app) return;

    if (fitRaf) {
        cancelAnimationFrame(fitRaf);
        fitRaf = null;
    }

    fitRaf = requestAnimationFrame(() => {
        // Simplified viewport fit - just handle fit-tight and fit-ultra classes
        app.classList.remove("fit-tight", "fit-ultra");
        app.style.zoom = "1";
        app.style.transform = "";
        app.style.transformOrigin = "";
        app.style.width = "";
        app.style.height = "";
        app.style.minHeight = "";
        app.style.maxHeight = "";
        app.style.maxWidth = "";
        app.style.margin = "";

        const available = Math.max(0, window.innerHeight);
        let required = app.scrollHeight;
        if (!required) return;

        if (required > available) {
            app.classList.add("fit-tight");
            required = app.scrollHeight;
        }

        if (required > available && available <= 720) {
            app.classList.add("fit-ultra");
            required = app.scrollHeight;
        }

        // Removed scaling logic that was causing rendering issues
        // The CSS classes fit-tight and fit-ultra handle the responsive behavior
    });
}

function snapshotCoreState() {
    return {
        round: gameState.round,
        act: gameState.currentAct,
        leverage: gameState.leverage,
        surge: gameState.surge,
        pushback: gameState.pushback?.value || 0,
        tracks: { ...gameState.tracks },
        resources: { ...gameState.resources }
    };
}

function collectSummaryDeltas(before, after) {
    const deltas = [];
    const keys = [
        ["care", "tracks"],
        ["climate", "tracks"],
        ["solidarity", "tracks"],
        ["authority", "tracks"],
        ["capital", "tracks"],
        ["strain", "tracks"],
        ["surge", "root"],
        ["pushback", "root"],
        ["leverage", "root"]
    ];

    keys.forEach(([key, scope]) => {
        const beforeValue = scope === "tracks" ? before.tracks[key] : before[key];
        const afterValue = scope === "tracks" ? after.tracks[key] : after[key];
        const delta = Number(afterValue) - Number(beforeValue);
        if (!Number.isFinite(delta) || delta === 0) return;

        deltas.push({
            key,
            label: capitalize(key),
            value: delta
        });
    });

    return deltas.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

function buildRoundSummary(before, after, events) {
    const deltas = collectSummaryDeltas(before, after).slice(0, 6);
    const criticalEvent = events.find(evt => evt.severity === "critical");
    const warningEvent = events.find(evt => evt.severity === "warning");

    let body = `Round ${before.round} resolved into Round ${after.round}.`;
    if (criticalEvent) {
        body = criticalEvent.title;
    } else if (warningEvent) {
        body = warningEvent.title;
    } else if (events.length > 0) {
        body = events[events.length - 1].title;
    }

    return {
        fromRound: before.round,
        toRound: after.round,
        fromAct: before.act,
        toAct: after.act,
        body,
        deltas,
        events
    };
}

function renderTransitionPanel(mode, summary) {
    if (!transitionPanel) return;

    const title = mode === "AFTERMATH"
        ? `Aftermath - Round ${summary.toRound}`
        : `Briefing - Round ${summary.toRound}`;
    const actionLabel = mode === "AFTERMATH" ? "Skip" : "Begin Round";
    const deltaHtml = summary.deltas.length > 0
        ? summary.deltas.map(delta => `
            <div class="transition-delta">
                <div class="label">${escapeHtml(delta.label)}</div>
                <div class="value">${delta.value > 0 ? "+" : ""}${delta.value}</div>
            </div>
        `).join("")
        : `<div class="transition-body">No major metric shifts this round.</div>`;

    const headline = mode === "READY" && summary.events.length > 0
        ? summary.events[summary.events.length - 1].title
        : summary.body;

    transitionPanel.innerHTML = `
        <div class="transition-title">${escapeHtml(title)}</div>
        <div class="transition-body">${escapeHtml(headline)}</div>
        <div class="transition-deltas">${deltaHtml}</div>
        <div class="transition-actions">
            <button id="transitionActionBtn">${escapeHtml(actionLabel)}</button>
        </div>
    `;

    transitionPanel.style.display = "flex";

    const actionBtn = document.getElementById("transitionActionBtn");
    if (actionBtn) {
        actionBtn.addEventListener("click", () => {
            if (gameState.ui.roundPhase === ROUND_PHASES.AFTERMATH) {
                enterReadyPhase();
                return;
            }
            if (gameState.ui.roundPhase === ROUND_PHASES.READY) {
                beginRoundPlay();
            }
        });
    }
}

function hideTransitionPanel() {
    if (!transitionPanel) return;
    transitionPanel.style.display = "none";
    transitionPanel.innerHTML = "";
}

function beginRoundPlay() {
    clearTransitionTimers();
    transitionToPlaying(gameState.ui);
    hideTransitionPanel();
    render();
}

function enterReadyPhase() {
    clearTransitionTimers();
    if (!latestRoundSummary || gameState.gameOver) {
        transitionToPlaying(gameState.ui);
        render();
        return;
    }

    transitionToReady(gameState.ui);
    renderTransitionPanel("READY", latestRoundSummary);
    render();

    const profile = getPacingProfile(gameState.ui.pacingMode);
    if (profile.readyAutoMs > 0) {
        readyAutoTimer = setTimeout(() => beginRoundPlay(), profile.readyAutoMs);
    }
}

function updatePhaseUi() {
    if (roundPhaseIndicator) {
        roundPhaseIndicator.textContent = gameState.ui.roundPhase;
    }

    if (nextRoundBtn) {
        const blocked = !isPlayablePhase(gameState.ui.roundPhase) || gameState.gameOver;
        nextRoundBtn.disabled = blocked;
        nextRoundBtn.textContent = gameState.gameOver ? "Cycle Ended" : "End Round";
    }
}

function loadUiSettings() {
    const saved = safeJsonParse(localStorage.getItem(UI_SETTINGS_KEY), DEFAULT_UI_SETTINGS);
    gameState.ui.pacingMode = saved.pacingMode || DEFAULT_UI_SETTINGS.pacingMode;
    gameState.ui.orientationMode = normalizeOrientationMode(saved.orientationMode || DEFAULT_UI_SETTINGS.orientationMode);
    gameState.ui.markerVerbosity = saved.markerVerbosity || DEFAULT_UI_SETTINGS.markerVerbosity;
    setMarkerVerbosity(gameState.ui.markerVerbosity);
    setFeedCap(saved.feedCap || DEFAULT_UI_SETTINGS.feedCap);
    applyOrientationMode(gameState.ui.orientationMode);
}

function saveUiSettings() {
    localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify({
        pacingMode: gameState.ui.pacingMode,
        orientationMode: gameState.ui.orientationMode,
        markerVerbosity: gameState.ui.markerVerbosity,
        feedCap: gameState.ui.feed.maxItems
    }));
}

document.querySelectorAll(".scout-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (!isPlayablePhase(gameState.ui.roundPhase)) return;
        const factionId = btn.getAttribute("data-faction");
        if (scoutFaction(factionId)) {
            render();
        } else {
            notify({
                kind: "warning",
                title: "Scout blocked",
                message: "Need at least 3 surge to scout."
            });
        }
    });
});

window.openNegotiationModal = function(factionId) {
    if (!isPlayablePhase(gameState.ui.roundPhase)) return;
    currentNegotiationFaction = factionId;
    const factionState = gameState.opposition?.factions?.[factionId];
    const factionNames = {
        elite: "Elite Interests",
        authoritarian: "Authoritarian Control",
        statusquo: "Status Quo"
    };

    document.getElementById("negotiationFactionName").textContent = factionNames[factionId] || factionId;
    document.getElementById("negotiationFactionStatus").textContent = `Current threat level: ${Math.round(factionState?.threatLevel || 0)}`;
    document.getElementById("negotiationResult").style.display = "none";
    document.getElementById("negotiationModal").style.display = "flex";
};

window.negotiate = function(offerStrength) {
    if (!currentNegotiationFaction) return;

    const result = attemptNegotiation(currentNegotiationFaction, offerStrength);
    const resultEl = document.getElementById("negotiationResult");

    resultEl.textContent = result.message;
    resultEl.style.display = "block";
    resultEl.className = result.success ? "negotiation-result-success" : "negotiation-result-failure";

    publishGameEvent({
        source: "negotiation",
        severity: result.success ? "positive" : "warning",
        title: result.success ? "Negotiation succeeded" : "Negotiation failed",
        body: result.message
    });

    notify({
        kind: result.success ? "positive" : "warning",
        title: result.success ? "Deal reached" : "Talks collapsed",
        message: result.message
    });

    document.querySelectorAll(".negotiation-options button").forEach(btn => {
        if (!btn.classList.contains("secondary")) btn.disabled = true;
    });

    setTimeout(() => {
        render();
        window.closeNegotiationModal();
    }, 1400);
};

window.closeNegotiationModal = function() {
    document.getElementById("negotiationModal").style.display = "none";
    currentNegotiationFaction = null;
    document.querySelectorAll(".negotiation-options button").forEach(btn => {
        btn.disabled = false;
    });
};

document.querySelectorAll(".negotiate-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const factionId = btn.getAttribute("data-faction");
        if (!canNegotiate(factionId)) {
            notify({
                kind: "warning",
                title: "Negotiation unavailable",
                message: "This faction cannot be negotiated right now."
            });
            return;
        }
        window.openNegotiationModal(factionId);
    });
});

window.openAchievementsModal = function() {
    renderAchievements();
    document.getElementById("achievementsModal").style.display = "flex";
};

window.closeAchievementsModal = function() {
    document.getElementById("achievementsModal").style.display = "none";
};

const achievementsCloseBtn = document.getElementById("achievementsCloseBtn");
if (achievementsCloseBtn) {
    achievementsCloseBtn.addEventListener("click", () => window.closeAchievementsModal());
}

if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
        if (pacingSelect) pacingSelect.value = gameState.ui.pacingMode;
        if (markerVerbositySelect) markerVerbositySelect.value = gameState.ui.markerVerbosity;
        uiSettingsModal.style.display = "flex";
        if (menuPanel) menuPanel.hidden = true;
    });
}

if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener("click", () => {
        uiSettingsModal.style.display = "none";
    });
}

if (settingsSaveBtn) {
    settingsSaveBtn.addEventListener("click", () => {
        gameState.ui.pacingMode = pacingSelect?.value || "standard";
        gameState.ui.markerVerbosity = markerVerbositySelect?.value || "normal";
        setMarkerVerbosity(gameState.ui.markerVerbosity);
        saveUiSettings();
        uiSettingsModal.style.display = "none";
        notify({
            kind: "info",
            title: "Settings updated",
            message: `Pacing: ${gameState.ui.pacingMode}, markers: ${gameState.ui.markerVerbosity}.`
        });
        renderSituationFeed();
    });
}

if (orientationToggleBtn) {
    orientationToggleBtn.addEventListener("click", () => {
        const nextMode = gameState.ui.orientationMode === "landscape" ? "portrait" : "landscape";
        applyOrientationMode(nextMode);
        saveUiSettings();
        notify({
            kind: "info",
            title: "Layout updated",
            message: nextMode === "landscape" ? "Landscape layout enabled." : "Portrait layout enabled."
        });
        applyViewportFit();
    });
}

if (uiSettingsModal) {
    uiSettingsModal.addEventListener("click", event => {
        if (event.target === uiSettingsModal) {
            uiSettingsModal.style.display = "none";
        }
    });
}

if (menuBtn && menuPanel) {
    menuBtn.addEventListener("click", event => {
        event.stopPropagation();
        menuPanel.hidden = !menuPanel.hidden;
        menuBtn.classList.toggle("open", !menuPanel.hidden);
    });

    menuPanel.addEventListener("click", event => {
        const target = event.target;
        if (target instanceof HTMLButtonElement) {
            menuPanel.hidden = true;
            menuBtn.classList.remove("open");
        }
    });

    document.addEventListener("click", event => {
        if (menuPanel.hidden) return;
        const target = event.target;
        if (!(target instanceof Node)) return;
        if (!menuPanel.contains(target) && !menuBtn.contains(target)) {
            menuPanel.hidden = true;
            menuBtn.classList.remove("open");
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !menuPanel.hidden) {
            menuPanel.hidden = true;
            menuBtn.classList.remove("open");
        }
    });
}

function startGame() {
    const seed = Date.now();
    setSeed(seed);
    initLogger(seed);
    resetPhaseTracking();
    initEventSurface();

    const startingLeverage = gameState.maxLeverage + (gameState.difficulty?.leverageOffset || 0);

    Object.assign(gameState, {
        round: 1,
        currentAct: 1,
        gameOver: false,
        playsThisRound: 0,
        leverage: startingLeverage,
        surge: 0,
        playerHand: [],
        discardPile: []
    });

    gameState.ui.roundPhase = ROUND_PHASES.PLAYING;
    clearTransitionTimers();
    hideTransitionPanel();
    latestRoundSummary = null;

    initResourceSystem();
    initInteractionState();
    initOppositionSystem();
    initOppositionActions();
    initTutorial();
    initNarrative();

    previousTrackValues = {};
    gameState.deck = shuffleDeck([...baseDeck]);
    drawHand(gameState.handSize);
    addHiddenCards();

    const bonuses = getLegacyBonuses();
    Object.entries(bonuses).forEach(([track, delta]) => {
        if (gameState.tracks[track] !== undefined) {
            gameState.tracks[track] = Math.max(0, Math.min(20, gameState.tracks[track] + delta));
        }
    });

    publishGameEvent({
        id: "game-start",
        source: "system",
        severity: "info",
        title: "Cycle initiated",
        body: "A new movement chapter begins."
    });

    render();
    renderWorldState();

    setTimeout(() => {
        onGameStart();
        onFirstRound();
    }, 450);
}

function getDefaultStats() {
    return {
        games: 0,
        wins: 0,
        endingCounts: {},
        avgTrackValues: { care: 0, climate: 0, solidarity: 0, authority: 0, capital: 0, strain: 0 },
        cardPlayCounts: {},
        synergyTriggerCount: 0,
        fastestWin: null,
        longestGame: null
    };
}

function recordGameStats(endingType) {
    try {
        const stats = safeJsonParse(localStorage.getItem("systemshift_stats"), getDefaultStats());
        stats.games += 1;

        const isWin = !["SYSTEM COLLAPSE", "AUTHORITARIAN CONSOLIDATION"].includes(endingType);
        if (isWin) {
            stats.wins += 1;
            if (gameState.difficulty?.mode === "hard") {
                stats.hardWins = (stats.hardWins || 0) + 1;
            }
        }

        stats.endingCounts[endingType] = (stats.endingCounts[endingType] || 0) + 1;
        const n = stats.games;
        ["care", "climate", "solidarity", "authority", "capital", "strain"].forEach(key => {
            stats.avgTrackValues[key] = ((stats.avgTrackValues[key] * (n - 1)) + gameState.tracks[key]) / n;
        });

        gameState.memory.cardsPlayed.forEach(card => {
            stats.cardPlayCounts[card.id] = (stats.cardPlayCounts[card.id] || 0) + 1;
        });

        const rounds = gameState.round;
        if (isWin && (stats.fastestWin === null || rounds < stats.fastestWin)) {
            stats.fastestWin = rounds;
        }
        if (stats.longestGame === null || rounds > stats.longestGame) {
            stats.longestGame = rounds;
        }

        localStorage.setItem("systemshift_stats", JSON.stringify(stats));
    } catch (error) {
        console.warn("Failed to record game stats:", error);
    }
}

function renderStats() {
    const stats = safeJsonParse(localStorage.getItem("systemshift_stats"), getDefaultStats());
    const winRate = stats.games > 0 ? ((stats.wins / stats.games) * 100).toFixed(1) : "0.0";

    let html = "";
    html += `<div class="stats-summary">`;
    html += `<div class="stats-summary-row"><span class="stats-label">Total Games</span><span class="stats-value">${stats.games}</span></div>`;
    html += `<div class="stats-summary-row"><span class="stats-label">Wins</span><span class="stats-value">${stats.wins}</span></div>`;
    html += `<div class="stats-summary-row"><span class="stats-label">Win Rate</span><span class="stats-value">${winRate}%</span></div>`;
    html += `</div>`;

    const endingColors = {
        "SOCIAL TRANSFORMATION": "#22c55e",
        "ECOLOGICAL TRANSITION": "#10b981",
        "TURBULENT TRANSFORMATION": "#f59e0b",
        "MANAGED STABILITY": "#3b82f6",
        "SYSTEM DRIFT": "#94a3b8",
        "DUAL POWER TRANSITION": "#a78bfa",
        "SYSTEM COLLAPSE": "#ef4444",
        "AUTHORITARIAN CONSOLIDATION": "#dc2626",
        "ECOLOGICAL CONSTRAINT": "#64748b"
    };

    const maxEndingCount = Math.max(1, ...Object.values(stats.endingCounts));
    html += `<div class="stats-section"><h4 class="stats-section-title">Ending Distribution</h4>`;
    Object.entries(stats.endingCounts).sort((a, b) => b[1] - a[1]).forEach(([ending, count]) => {
        const pct = ((count / stats.games) * 100).toFixed(1);
        const width = (count / maxEndingCount) * 100;
        const color = endingColors[ending] || "#94a3b8";
        html += `<div class="stats-bar-row">`;
        html += `<span class="stats-bar-label">${ending}</span>`;
        html += `<div class="stats-bar-track"><div class="stats-bar-fill" style="width:${width}%;background:${color}"></div></div>`;
        html += `<span class="stats-bar-count">${count} (${pct}%)</span>`;
        html += `</div>`;
    });
    html += `</div>`;

    const topCards = Object.entries(stats.cardPlayCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (topCards.length > 0) {
        html += `<div class="stats-section"><h4 class="stats-section-title">Most Played Cards</h4>`;
        topCards.forEach(([id, count], idx) => {
            const card = baseDeck.find(c => c.id === Number(id));
            const title = card ? card.title : `Card #${id}`;
            html += `<div class="stats-card-row"><span class="stats-card-rank">${idx + 1}.</span><span class="stats-card-title">${title}</span><span class="stats-card-count">${count} plays</span></div>`;
        });
        html += `</div>`;
    }

    html += `<div class="stats-section"><h4 class="stats-section-title">Records</h4>`;
    html += `<div class="stats-summary-row"><span class="stats-label">Fastest Win</span><span class="stats-value">${stats.fastestWin ? `${stats.fastestWin} rounds` : "-"}</span></div>`;
    html += `<div class="stats-summary-row"><span class="stats-label">Longest Game</span><span class="stats-value">${stats.longestGame ? `${stats.longestGame} rounds` : "-"}</span></div>`;
    html += `</div>`;

    statsContent.innerHTML = html;
}

function showStats() {
    renderStats();
    statsModal.style.display = "flex";
}

function hideStats() {
    statsModal.style.display = "none";
}

function resetStats() {
    if (confirm("Are you sure you want to reset all statistics? This cannot be undone.")) {
        localStorage.removeItem("systemshift_stats");
        renderStats();
    }
}

if (statsBtn) statsBtn.addEventListener("click", showStats);
if (statsCloseBtn) statsCloseBtn.addEventListener("click", hideStats);
if (statsResetBtn) statsResetBtn.addEventListener("click", resetStats);
if (statsModal) {
    statsModal.addEventListener("click", event => {
        if (event.target === statsModal) hideStats();
    });
}

function renderLibrary() {
    const playedCards = safeJsonParse(localStorage.getItem("systemshift_played_cards"), []);
    const suitOrder = ["care", "climate", "solidarity", "authority", "capital", "system", "risk", "hidden"];
    const suitLabels = {
        care: "Care",
        climate: "Climate",
        solidarity: "Solidarity",
        authority: "Authority",
        capital: "Capital",
        system: "System",
        risk: "Risk/Reward",
        hidden: "Hidden"
    };

    let html = "";
    suitOrder.forEach(suit => {
        const cards = baseDeck.filter(card => card.suit === suit);
        if (cards.length === 0) return;

        html += `<div class="library-section">`;
        html += `<h4 class="library-section-title">${suitLabels[suit] || suit}</h4>`;
        html += `<div class="library-cards">`;

        cards.forEach(card => {
            const seenClass = playedCards.includes(card.id) ? "library-card-seen" : "library-card-unseen";
            const effectsHTML = Object.entries(card.effects || {}).map(([key, value]) => {
                const sign = value > 0 ? "+" : "";
                const cls = value >= 0 ? "pos" : "neg";
                return `<div class="${cls}">${sign}${value} ${capitalize(key)}</div>`;
            }).join("");

            const tagsHTML = card.tags ? `<div class="library-card-tags">${card.tags.join(", ")}</div>` : "";
            const synergyHTML = card.synergy
                ? `<div class="library-card-synergy">Synergy: ${card.synergy.if_played_this_round.join(", ")}</div>`
                : "";

            html += `
                <div class="library-card ${seenClass} suit-${card.suit}">
                    <div class="card-title">${card.title}</div>
                    <div class="card-cost">Cost: ${card.cost}</div>
                    <div class="card-effects">${effectsHTML}</div>
                    ${tagsHTML}
                    ${synergyHTML}
                </div>
            `;
        });

        html += `</div></div>`;
    });

    libraryContent.innerHTML = html;
}

function showLibrary() {
    renderLibrary();
    libraryModal.style.display = "flex";
}

function hideLibrary() {
    libraryModal.style.display = "none";
}

if (libraryBtn) libraryBtn.addEventListener("click", showLibrary);
if (libraryCloseBtn) libraryCloseBtn.addEventListener("click", hideLibrary);
if (libraryModal) {
    libraryModal.addEventListener("click", event => {
        if (event.target === libraryModal) hideLibrary();
    });
}

function drawHand(count) {
    gameState.playerHand = [];
    for (let i = 0; i < count; i += 1) {
        const card = drawCard();
        if (!card) break;
        gameState.playerHand.push(card);
    }
}

function handleEndRound() {
    if (gameState.gameOver) return;
    if (!transitionToResolving(gameState.ui)) return;

    updatePhaseUi();

    const feedCursor = snapshotFeedCursor();
    const before = snapshotCoreState();
    endRound();
    if (!gameState.gameOver) {
        drawHand(gameState.handSize);
    }
    const after = snapshotCoreState();

    if (gameState.gameOver) {
        transitionToPlaying(gameState.ui);
        hideTransitionPanel();
        render();
        return;
    }

    const events = getEventsAfter(feedCursor);
    latestRoundSummary = buildRoundSummary(before, after, events);

    transitionToAftermath(gameState.ui);
    renderTransitionPanel("AFTERMATH", latestRoundSummary);
    render();

    clearTransitionTimers();
    const profile = getPacingProfile(gameState.ui.pacingMode);
    transitionTimer = setTimeout(() => enterReadyPhase(), profile.aftermathMs);
}

function render() {
    updateStats();
    renderTracksSequenced();
    renderTrackNarratives();
    renderFactions();
    renderHand();
    renderSituationFeed();
    renderNarrativeSummaryCard();
    renderWorldState();
    updatePhaseUi();
    checkSystemPhases();

    if (gameState.tracks.strain >= 15) {
        onStrainWarning();
    }

    checkContextualTips();
    checkNarrativeTriggers();

    if (!gameState.gameOver) {
        const act = getCurrentAct(gameState.round)?.act || gameState.currentAct || 1;
        syncAtmosphere({ act, strain: gameState.tracks.strain });
    }

    applyViewportFit();
}

function renderSituationFeed() {
    if (!feedList) return;
    const items = getFeedItems();
    if (feedCount) feedCount.textContent = `${items.length} markers`;
    const verbosity = gameState.ui.markerVerbosity || "normal";
    const forceLabels = {
        movement: "Movement",
        elite: "Elite",
        authoritarian: "Authoritarian",
        statusquo: "Status Quo"
    };

    if (items.length === 0) {
        feedList.innerHTML = `<div class="feed-empty">No major markers yet.</div>`;
        return;
    }

    feedList.innerHTML = items.map(item => {
        const showBody = verbosity !== "minimal";
        const showDeltas = verbosity === "detailed" || (verbosity === "normal" && Object.keys(item.deltas).length > 0);
        const forceEntries = Object.entries(item.forces || {})
            .filter(([, value]) => Number.isFinite(Number(value)));
        const showForces = verbosity !== "minimal" && forceEntries.length > 0;

        const deltas = Object.entries(item.deltas)
            .map(([key, value]) => `<span class="feed-delta">${value > 0 ? "+" : ""}${value} ${escapeHtml(capitalize(key))}</span>`)
            .join("");

        const forceChips = forceEntries
            .map(([key, value]) => {
                const label = forceLabels[key] || capitalize(key);
                const dominantClass = item.dominantForce === key ? " dominant" : "";
                return `<span class="force-chip force-${escapeHtml(key)}${dominantClass}">${escapeHtml(label)} ${Math.round(Number(value))}</span>`;
            })
            .join("");

        const movement = Number(item.forces?.movement) || 0;
        const regimeEntries = forceEntries.filter(([key]) => key !== "movement");
        const regime = regimeEntries.length
            ? regimeEntries.reduce((sum, [, value]) => sum + Number(value), 0) / regimeEntries.length
            : 0;
        const total = movement + regime;
        const movementPct = total > 0 ? Math.max(8, Math.min(92, Math.round((movement / total) * 100))) : 50;
        const regimePct = 100 - movementPct;
        const dominantLabel = forceLabels[item.dominantForce] || capitalize(item.dominantForce || "movement");

        return `
            <article class="feed-item severity-${escapeHtml(item.severity)}">
                <div class="feed-icon">${escapeHtml(item.icon)}</div>
                <div class="feed-copy">
                    <div class="feed-title">${escapeHtml(item.title)}</div>
                    ${showBody ? `<div class="feed-body">${escapeHtml(item.body)}</div>` : ""}
                    <div class="feed-meta">R${item.round} | ${escapeHtml(item.source)}</div>
                    ${showForces ? `
                        <div class="feed-forces">${forceChips}</div>
                        <div class="feed-force-balance" aria-hidden="true">
                            <span class="balance-movement" style="width:${movementPct}%"></span>
                            <span class="balance-regime" style="width:${regimePct}%"></span>
                        </div>
                        <div class="feed-force-note">Dominant force: ${escapeHtml(dominantLabel)}</div>
                    ` : ""}
                    ${showDeltas && deltas ? `<div class="feed-deltas">${deltas}</div>` : ""}
                </div>
            </article>
        `;
    }).join("");
}

function renderNarrativeSummaryCard() {
    if (!narrativeSummaryCard) return;
    const summary = getNarrativeSummary();
    const arc = summary.currentNarrative || "No active chapter";
    if (narrativeArcIndicator) {
        const compactArc = arc.length > 54 ? `${arc.slice(0, 51)}...` : arc;
        narrativeArcIndicator.textContent = compactArc;
        narrativeArcIndicator.title = arc;
    }
    narrativeSummaryCard.innerHTML = `
        <div class="summary-title">State Of The Movement</div>
        <div class="summary-arc">${escapeHtml(arc)}</div>
        <div class="summary-metrics">
            <span class="summary-pill">Beats ${summary.storyBeats}</span>
            <span class="summary-pill">Choices ${summary.choices}</span>
            <span class="summary-pill">Events ${summary.historicalEvents}</span>
        </div>
    `;
}

function renderFactions() {
    const factions = ["elite", "authoritarian", "statusquo"];
    factions.forEach(factionId => {
        const factionState = gameState.opposition?.factions?.[factionId];
        const elements = factionElements[factionId];
        if (!factionState || !elements) return;

        if (elements.threat) {
            const threat = Math.round(factionState.threatLevel);
            const active = factionState.active;
            elements.threat.textContent = active ? `! ${threat}` : String(threat);
            elements.threat.className = `faction-threat ${active ? "faction-active" : ""}`;
        }

        if (elements.tooltip) {
            const scoutResult = getScoutResult(factionId);
            if (scoutResult) {
                elements.tooltip.textContent = scoutResult;
                elements.tooltip.className = "scout-tooltip scout-tooltip-visible";
            } else {
                elements.tooltip.textContent = "";
                elements.tooltip.className = "scout-tooltip";
            }
        }

        const scoutBtn = document.querySelector(`.scout-btn[data-faction="${factionId}"]`);
        if (scoutBtn) {
            scoutBtn.disabled = gameState.surge < 3 || !isPlayablePhase(gameState.ui.roundPhase);
        }

        const negotiateBtn = document.querySelector(`.negotiate-btn[data-faction="${factionId}"]`);
        if (negotiateBtn) {
            negotiateBtn.disabled = !canNegotiate(factionId) || !isPlayablePhase(gameState.ui.roundPhase);
        }
    });
}

function renderWorldState() {
    const legacy = getLegacy();
    const worldStateEl = document.getElementById("worldState");
    const worldStateText = document.getElementById("worldStateText");
    if (!worldStateEl || !worldStateText) return;

    if (legacy.gamesPlayed > 0) {
        const bonusEntries = Object.entries(legacy.legacyBonuses || {});
        let bonusText = "none";
        if (bonusEntries.length > 0) {
            bonusText = bonusEntries.map(([track, delta]) => `${track} ${delta > 0 ? "+" : ""}${delta}`).join(", ");
        }
        worldStateText.textContent = `Games played: ${legacy.gamesPlayed} | Last ending: ${legacy.lastEnding || "-"} | Legacy: ${bonusText}`;
        worldStateEl.style.display = "block";
    } else {
        worldStateEl.style.display = "none";
    }
}

function updateStats() {
    if (roundStat) roundStat.textContent = gameState.round;
    if (surgeStat) surgeStat.textContent = gameState.surge;
    if (leverageStat) leverageStat.textContent = gameState.leverage;
    if (pushbackStat) pushbackStat.textContent = gameState.pushback?.value || 0;

    const actIndicator = document.getElementById("actIndicator");
    if (actIndicator) {
        const currentAct = getCurrentAct(gameState.round);
        if (currentAct) actIndicator.textContent = `Act ${currentAct.act}: ${currentAct.name}`;
    }

    const playsRemaining = gameState.maxPlaysPerRound - gameState.playsThisRound;
    if (playsStat) {
        playsStat.textContent = `${playsRemaining}/${gameState.maxPlaysPerRound}`;
        playsStat.parentElement.classList.toggle("low", playsRemaining === 0);
    }

    leverageStat?.parentElement.classList.toggle("low", gameState.leverage <= 3);
    pushbackStat?.parentElement.classList.toggle("critical", (gameState.pushback?.value || 0) >= 15);

    if (warningOverlay) {
        warningOverlay.classList.toggle("active", gameState.tracks.strain >= 18);
    }

    updateResourceStats();
}

function updateResourceStats() {
    if (politicalStat) {
        politicalStat.textContent = gameState.resources.political;
        updateResourceBar(politicalStat, gameState.resources.political, 10);
    }
    if (socialStat) {
        socialStat.textContent = gameState.resources.social;
        updateResourceBar(socialStat, gameState.resources.social, 10);
    }
    if (momentumStat) {
        momentumStat.textContent = gameState.resources.momentum;
        updateResourceBar(momentumStat, gameState.resources.momentum, 15);
    }
    if (infrastructureStat) {
        infrastructureStat.textContent = gameState.resources.infrastructure;
        updateResourceBar(infrastructureStat, gameState.resources.infrastructure, 20);
    }
}

function updateResourceBar(statElement, value, max) {
    const bar = statElement.parentElement.querySelector(".resource-fill");
    if (!bar) return;
    const percentage = Math.min(100, (value / max) * 100);
    bar.style.width = `${percentage}%`;
    statElement.parentElement.classList.toggle("low", value <= 2);
    statElement.parentElement.classList.toggle("critical", value === 0);
}

function renderTrackNarratives() {
    Object.entries(trackElements).forEach(([track, el]) => {
        if (!el) return;
        let tooltip = el.querySelector(".track-narrative");
        if (!tooltip) {
            tooltip = document.createElement("div");
            tooltip.className = "track-narrative";
            el.appendChild(tooltip);
        }
        tooltip.textContent = getTrackNarrative(track, gameState.tracks[track]);
    });
}

function renderTracksSequenced() {
    const changedTracks = [];
    const isFirstRender = Object.keys(previousTrackValues).length === 0;

    Object.entries(trackElements).forEach(([key, el]) => {
        if (!el) return;
        const newValue = gameState.tracks[key];
        const oldValue = previousTrackValues[key];
        if (isFirstRender || newValue !== oldValue) {
            changedTracks.push({ key, el, newValue });
        }
    });

    let delay = 0;
    changedTracks.forEach(({ key, el, newValue }) => {
        const isStrain = key === "strain";
        const localDelay = isFirstRender ? 0 : delay;

        setTimeout(() => {
            const valueEl = el.querySelector(".halo-value");
            const ring = el.querySelector(".halo-ring");
            if (valueEl) valueEl.textContent = newValue;
            if (ring) {
                const percent = Math.max(0, Math.min(100, newValue * 5));
                ring.style.setProperty("--fill", `${percent}%`);
            }

            el.classList.toggle("high", newValue >= 15);
            el.classList.toggle("low", newValue <= 3);
            el.classList.toggle("critical", isStrain && newValue >= 18);

            const valueState = newValue >= 15 ? "high" : newValue <= 3 ? "low" : "mid";
            el.setAttribute("data-value", valueState);

            if (!isFirstRender) {
                el.classList.remove("pulse-up");
                void el.offsetWidth;
                el.classList.add("pulse-up");
            }
        }, localDelay);

        if (!isFirstRender) {
            delay += isStrain ? 320 : 180;
        }
    });

    previousTrackValues = { ...gameState.tracks };
}

function renderHand() {
    if (!handDiv) return;
    handDiv.innerHTML = "";

    if (gameState.gameOver) {
        const ending = evaluateOutcome(gameState);
        recordGameStats(ending.type);
        saveLegacy(ending.type);

        const stats = safeJsonParse(localStorage.getItem("systemshift_stats"), {});
        const newAchievements = checkAchievements(stats);
        newAchievements.forEach((achievement, index) => {
            setTimeout(() => showAchievementToast(achievement), index * 650);
        });

        handDiv.innerHTML = `
            <div class="game-over">
                <h2>End Of Cycle</h2>
                <div class="ending-type">${ending.type}</div>
                <div class="ending-message">${ending.message}</div>
                <button id="restartBtn">Restart</button>
            </div>
        `;

        const restartBtn = document.getElementById("restartBtn");
        if (restartBtn) {
            restartBtn.addEventListener("click", () => {
                const modal = document.getElementById("difficultyModal");
                if (modal) modal.style.display = "flex";
            });
        }
        return;
    }

    const isPlayable = isPlayablePhase(gameState.ui.roundPhase);
    gameState.playerHand.forEach((card, index) => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card", `suit-${card.suit}`);

        const effectsHTML = Object.entries(card.effects || {}).map(([key, value]) => {
            const sign = value > 0 ? "+" : "";
            const cls = value >= 0 ? "pos" : "neg";
            return `<div class="${cls}">${sign}${value} ${capitalize(key)}</div>`;
        }).join("");

        const flavor = getCardFlavor(card.id);
        const flavorHtml = flavor ? `<div class="card-flavor">${escapeHtml(flavor)}</div>` : "";

        const canAfford = gameState.leverage >= card.cost;
        const maxPlaysReached = gameState.playsThisRound >= gameState.maxPlaysPerRound;
        const blockedByPhase = !isPlayable;
        const disabled = !canAfford || maxPlaysReached || blockedByPhase;
        const label = blockedByPhase
            ? "Wait"
            : maxPlaysReached
                ? "Max Plays"
                : canAfford
                    ? "Play"
                    : "Need Leverage";

        cardDiv.innerHTML = `
            <div class="card-title">${card.title}</div>
            <div class="card-cost ${!canAfford ? "cost-error" : ""}">Cost: ${card.cost}</div>
            <div class="card-effects">${effectsHTML}</div>
            ${flavorHtml}
            <button class="play-btn" ${disabled ? "disabled" : ""}>${label}</button>
        `;

        const btn = cardDiv.querySelector(".play-btn");
        btn.addEventListener("click", async () => {
            if (btn.disabled || !isPlayablePhase(gameState.ui.roundPhase)) return;
            try {
                await resolveCard(index, render);
                onFirstCardPlay();
                if (card.synergy) onFirstSynergy();
                render();
            } catch (error) {
                console.error("Error playing card:", error);
                notify({
                    kind: "critical",
                    title: "Card resolution failed",
                    message: error.message
                });
            }
        });

        handDiv.appendChild(cardDiv);
    });
}

function renderAchievements() {
    const unlocks = getUnlocks();
    let html = "<div class='achievement-grid'>";
    achievements.forEach(achievement => {
        const unlocked = unlocks.achievements?.[achievement.id];
        if (unlocked) {
            const date = new Date(unlocked.unlockedAt).toLocaleDateString();
            html += `<div class="achievement-card unlocked"><div class="achievement-name">Unlocked: ${achievement.name}</div><div class="achievement-desc">${achievement.desc}</div><div class="achievement-date">${date}</div></div>`;
        } else {
            html += `<div class="achievement-card locked"><div class="achievement-name">Locked: ???</div></div>`;
        }
    });
    html += "</div>";
    document.getElementById("achievementsContent").innerHTML = html;
}

function showAchievementToast(achievement) {
    notify({
        kind: "positive",
        title: `Achievement: ${achievement.name}`,
        message: achievement.desc,
        duration: 3000
    });
}

const difficultyConfigs = {
    easy: { mode: "easy", leverageOffset: 2, strainMultiplier: 0.6, oppositionIntensity: 0.7 },
    normal: { mode: "normal", leverageOffset: 0, strainMultiplier: 1.0, oppositionIntensity: 1.0 },
    hard: { mode: "hard", leverageOffset: -1, strainMultiplier: 1.2, oppositionIntensity: 1.3 }
};

function selectDifficulty(mode) {
    const config = difficultyConfigs[mode];
    if (!config) return;
    gameState.difficulty = { ...config };
    const modal = document.getElementById("difficultyModal");
    if (modal) modal.style.display = "none";
    startGame();
}

window.selectDifficulty = selectDifficulty;
window.markTutorialComplete = markTutorialComplete;

if (exportBtn) exportBtn.addEventListener("click", exportLog);
if (nextRoundBtn) nextRoundBtn.addEventListener("click", handleEndRound);

try {
    initNotificationCenter("notificationStack");
    initAmbientEngine();
    loadUiSettings();
    updatePhaseUi();

    const difficultyModal = document.getElementById("difficultyModal");
    if (difficultyModal) {
        difficultyModal.style.display = "flex";
    } else {
        selectDifficulty("normal");
    }

    window.addEventListener("resize", applyViewportFit);
    applyViewportFit();
} catch (error) {
    console.error("Fatal error:", error);
    const app = document.getElementById("app");
    if (app) {
        const errorDiv = document.createElement("div");
        errorDiv.style.cssText = "position:fixed;top:10px;right:10px;background:#ef4444;color:white;padding:20px;border-radius:8px;z-index:9999;max-width:400px;";
        errorDiv.innerHTML = `<strong>Fatal Error:</strong><br>${escapeHtml(error.message)}`;
        app.appendChild(errorDiv);
    }
}
