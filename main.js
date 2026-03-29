/* ================================================= */
/* SYSTEM SHIFT – MAIN (SIMPLIFIED DEBUG)           */
/* ================================================= */

import { gameState } from "./game/state.js";
import { baseDeck, shuffleDeck, drawCard } from "./game/deck.js";
import { endRound } from "./game/round.js";
import { initLogger, log, exportLog } from "./game/logger.js";
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
    onActTransition,
    onFirstOpposition,
    onFirstResourceUse,
    checkContextualTips,
    markTutorialComplete
} from "./game/tutorial.js";
import { 
    initNarrative, 
    checkNarrativeTriggers,
    getTrackNarrative,
    getCardFlavor
} from "./game/narrative.js";

console.log("✓ All modules imported");

/* ================================================= */
/* DOM REFERENCES                                   */
/* ================================================= */

const handDiv = document.getElementById("hand");
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

console.log("✓ DOM references obtained");

let endingMusicPlayed = false;
let previousTrackValues = {};

/* ================================================= */
/* START GAME                                       */
/* ================================================= */

function startGame() {
    console.log("Starting game...");

    const seed = Date.now();
    setSeed(seed);
    initLogger(seed);
    resetPhaseTracking();

    // Apply difficulty to starting leverage
    const startingLeverage = gameState.maxLeverage + (gameState.difficulty?.leverageOffset || 0);

    Object.assign(gameState, {
        round: 1,
        gameOver: false,
        playsThisRound: 0,
        leverage: startingLeverage,
        surge: 0,
        playerHand: [],
        discardPile: []
    });

    initResourceSystem();
    initInteractionState();
    initOppositionSystem();
    initOppositionActions();
    initTutorial();
    initNarrative();

    previousTrackValues = {};
    endingMusicPlayed = false;

    gameState.deck = shuffleDeck([...baseDeck]);
    drawHand(gameState.handSize);

    addHiddenCards();

    console.log("Hand has", gameState.playerHand.length, "cards");

    render();
    console.log("Game started successfully");
    
    // Trigger tutorial event
    setTimeout(() => {
        onGameStart();
        onFirstRound();
    }, 500);
}

if (exportBtn) exportBtn.addEventListener("click", exportLog);
if (nextRoundBtn) nextRoundBtn.addEventListener("click", handleEndRound);

/* ================================================= */
/* STATISTICS                                       */
/* ================================================= */

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
    const stats = JSON.parse(localStorage.getItem("systemshift_stats") || JSON.stringify(getDefaultStats()));
    
    stats.games++;
    const isWin = !["SYSTEM COLLAPSE", "AUTHORITARIAN CONSOLIDATION"].includes(endingType);
    if (isWin) stats.wins++;
    
    stats.endingCounts[endingType] = (stats.endingCounts[endingType] || 0) + 1;
    
    // Running average for track values
    const t = gameState.tracks;
    const n = stats.games;
    ["care", "climate", "solidarity", "authority", "capital", "strain"].forEach(k => {
        stats.avgTrackValues[k] = ((stats.avgTrackValues[k] * (n-1)) + t[k]) / n;
    });
    
    // Card play counts from memory
    gameState.memory.cardsPlayed.forEach(c => {
        stats.cardPlayCounts[c.id] = (stats.cardPlayCounts[c.id] || 0) + 1;
    });
    
    // Fastest/longest
    const rounds = gameState.round;
    if (isWin && (stats.fastestWin === null || rounds < stats.fastestWin)) {
        stats.fastestWin = rounds;
    }
    if (stats.longestGame === null || rounds > stats.longestGame) {
        stats.longestGame = rounds;
    }
    
    localStorage.setItem("systemshift_stats", JSON.stringify(stats));
}

function renderStats() {
    const stats = JSON.parse(localStorage.getItem("systemshift_stats") || JSON.stringify(getDefaultStats()));
    
    let html = "";
    
    // Summary
    const winRate = stats.games > 0 ? ((stats.wins / stats.games) * 100).toFixed(1) : "0.0";
    html += `<div class="stats-summary">`;
    html += `<div class="stats-summary-row"><span class="stats-label">Total Games</span><span class="stats-value">${stats.games}</span></div>`;
    html += `<div class="stats-summary-row"><span class="stats-label">Wins</span><span class="stats-value">${stats.wins}</span></div>`;
    html += `<div class="stats-summary-row"><span class="stats-label">Win Rate</span><span class="stats-value">${winRate}%</span></div>`;
    html += `</div>`;
    
    // Ending distribution bar chart
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
        const barWidth = (count / maxEndingCount) * 100;
        const color = endingColors[ending] || "#94a3b8";
        html += `<div class="stats-bar-row">`;
        html += `<span class="stats-bar-label">${ending}</span>`;
        html += `<div class="stats-bar-track"><div class="stats-bar-fill" style="width:${barWidth}%;background:${color}"></div></div>`;
        html += `<span class="stats-bar-count">${count} (${pct}%)</span>`;
        html += `</div>`;
    });
    html += `</div>`;
    
    // Top 5 cards
    const topCards = Object.entries(stats.cardPlayCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (topCards.length > 0) {
        html += `<div class="stats-section"><h4 class="stats-section-title">Most Played Cards</h4>`;
        topCards.forEach(([id, count], i) => {
            const card = baseDeck.find(c => c.id == id);
            const title = card ? card.title : `Card #${id}`;
            html += `<div class="stats-card-row"><span class="stats-card-rank">${i+1}.</span><span class="stats-card-title">${title}</span><span class="stats-card-count">${count} plays</span></div>`;
        });
        html += `</div>`;
    }
    
    // Fastest/longest
    html += `<div class="stats-section"><h4 class="stats-section-title">Records</h4>`;
    html += `<div class="stats-summary-row"><span class="stats-label">Fastest Win</span><span class="stats-value">${stats.fastestWin ? stats.fastestWin + " rounds" : "—"}</span></div>`;
    html += `<div class="stats-summary-row"><span class="stats-label">Longest Game</span><span class="stats-value">${stats.longestGame ? stats.longestGame + " rounds" : "—"}</span></div>`;
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
if (statsModal) statsModal.addEventListener("click", (e) => {
    if (e.target === statsModal) hideStats();
});

/* ================================================= */
/* CARD LIBRARY                                     */
/* ================================================= */

function renderLibrary() {
    const playedCards = JSON.parse(localStorage.getItem("systemshift_played_cards") || "[]");
    
    // Group cards by suit
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
        const cards = baseDeck.filter(c => c.suit === suit);
        if (cards.length === 0) return;
        
        html += `<div class="library-section">`;
        html += `<h4 class="library-section-title">${suitLabels[suit] || suit}</h4>`;
        html += `<div class="library-cards">`;
        
        cards.forEach(card => {
            const isPlayed = playedCards.includes(card.id);
            const seenClass = isPlayed ? "library-card-seen" : "library-card-unseen";
            
            const effectsHTML = Object.entries(card.effects || {})
                .map(([k, v]) => {
                    const sign = v > 0 ? "+" : "";
                    const cls = v >= 0 ? "pos" : "neg";
                    return `<div class="${cls}">${sign}${v} ${capitalize(k)}</div>`;
                })
                .join("");
            
            const tagsHTML = card.tags ? `<div class="library-card-tags">${card.tags.join(", ")}</div>` : "";
            const synergyHTML = card.synergy ? `<div class="library-card-synergy">Synergy: ${card.synergy.if_played_this_round.join(", ")}</div>` : "";
            
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
if (libraryModal) libraryModal.addEventListener("click", (e) => {
    if (e.target === libraryModal) hideLibrary();
});

/* ================================================= */
/* DRAW HAND                                        */
/* ================================================= */

function drawHand(count) {
    gameState.playerHand = [];
    for (let i = 0; i < count; i++) {
        const card = drawCard();
        if (!card) {
            console.warn("drawCard returned null at index", i);
            break;
        }
        gameState.playerHand.push(card);
    }
    console.log("drawHand complete:", gameState.playerHand.length, "cards");
}

/* ================================================= */
/* ROUND                                            */
/* ================================================= */

function handleEndRound() {
    if (gameState.gameOver) return;
    endRound();
    if (!gameState.gameOver) drawHand(gameState.handSize);
    render();
}

/* ================================================= */
/* RENDER                                           */
/* ================================================= */

function render() {
    console.log("Rendering...");
    updateStats();
    renderTracksSequenced();
    renderHand();
    checkSystemPhases();
    
    // Check for contextual tips
    checkContextualTips();
    
    // Trigger strain warning if needed
    if (gameState.tracks.strain >= 15) {
        onStrainWarning();
    }
    
    // Check narrative triggers
    checkNarrativeTriggers();
}

/* ================================================= */
/* UPDATE TOP BAR                                   */
/* ================================================= */

function updateStats() {
    if (roundStat) roundStat.textContent = gameState.round;
    if (surgeStat) surgeStat.textContent = gameState.surge;
    if (leverageStat) leverageStat.textContent = gameState.leverage;
    if (pushbackStat) pushbackStat.textContent = gameState.pushback?.value || 0;

    // Display current act
    const actIndicator = document.getElementById("actIndicator");
    if (actIndicator) {
        const currentAct = getCurrentAct(gameState.round);
        if (currentAct) {
            actIndicator.textContent = `Act ${currentAct.act}: ${currentAct.name}`;
        }
    }

    const playsRemaining = gameState.maxPlaysPerRound - gameState.playsThisRound;
    if (playsStat) {
        playsStat.textContent = `${playsRemaining}/${gameState.maxPlaysPerRound}`;
        playsStat.parentElement.classList.toggle("low", playsRemaining === 0);
    }

    if (leverageStat) {
        leverageStat.parentElement.classList.toggle("low", gameState.leverage <= 3);
    }

    if (pushbackStat) {
        pushbackStat.parentElement.classList.toggle("critical", gameState.pushback?.value >= 15);
    }

    if (warningOverlay) {
        warningOverlay.classList.toggle("active", gameState.tracks.strain >= 18);
    }

    updateResourceStats();
}

/* ================================================= */
/* UPDATE RESOURCE STATS                            */
/* ================================================= */

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
    const bar = statElement.parentElement.querySelector('.resource-fill');
    if (bar) {
        const percentage = Math.min(100, (value / max) * 100);
        bar.style.width = `${percentage}%`;
        statElement.parentElement.classList.toggle('low', value <= 2);
        statElement.parentElement.classList.toggle('critical', value === 0);
    }
}

/* ================================================= */
/* SEQUENCED TRACK UPDATES                          */
/* ================================================= */

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
                ring.style.setProperty("--fill", percent + "%");
            }

            el.classList.toggle("high", newValue >= 15);
            el.classList.toggle("low", newValue <= 3);

            if (isStrain) {
                el.classList.toggle("critical", newValue >= 18);
            }

            if (!isFirstRender) {
                el.classList.remove("pulse-up");
                void el.offsetWidth;
                el.classList.add("pulse-up");
            }
        }, localDelay);

        if (!isFirstRender) {
            delay += isStrain ? 320 : 200;
        }
    });

    previousTrackValues = { ...gameState.tracks };
}

/* ================================================= */
/* HAND / CARDS                                     */
/* ================================================= */

function renderHand() {
    if (!handDiv) {
        console.error("handDiv not found!");
        return;
    }

    handDiv.innerHTML = "";
    console.log("Rendering hand, cards:", gameState.playerHand.length);

    if (gameState.gameOver) {
        const ending = evaluateOutcome(gameState);
        recordGameStats(ending.type);
        handDiv.innerHTML = `
            <div class="game-over">
                <h2>END OF CYCLE</h2>
                <div class="ending-type">${ending.type}</div>
                <div class="ending-message">${ending.message}</div>
                <button id="restartBtn">Restart</button>
            </div>
        `;
        document.getElementById("restartBtn").addEventListener("click", () => {
            // Show difficulty modal instead of directly starting
            const modal = document.getElementById("difficultyModal");
            if (modal) {
                modal.style.display = "flex";
            } else {
                startGame();
            }
        });
        return;
    }

    gameState.playerHand.forEach((card, index) => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card", `suit-${card.suit}`);

        const effectsHTML = Object.entries(card.effects || {})
            .map(([k, v]) => {
                const sign = v > 0 ? "+" : "";
                const cls = v >= 0 ? "pos" : "neg";
                return `<div class="${cls}">${sign}${v} ${capitalize(k)}</div>`;
            })
            .join("");

        const canAfford = gameState.leverage >= card.cost;
        const maxPlaysReached = gameState.playsThisRound >= gameState.maxPlaysPerRound;

        cardDiv.innerHTML = `
            <div class="card-title">${card.title}</div>
            <div class="card-cost ${!canAfford ? 'cost-error' : ''}">Cost: ${card.cost}</div>
            <div class="card-effects">${effectsHTML}</div>
            <button class="play-btn" ${!canAfford ? 'disabled' : ''}>${!canAfford ? 'Need Leverage' : 'Play'}</button>
        `;

        const btn = cardDiv.querySelector(".play-btn");

        if (maxPlaysReached) {
            btn.disabled = true;
            btn.textContent = 'Max Plays Reached';
        }

        btn.addEventListener("click", () => {
            console.log("Card clicked:", index, card.title);
            console.log("Button disabled:", btn.disabled);
            console.log("Can afford:", canAfford);
            console.log("Max plays reached:", maxPlaysReached);
            console.log("Current leverage:", gameState.leverage);
            console.log("Card cost:", card.cost);
            if (btn.disabled) {
                console.log("Button is disabled, not playing");
                return;
            }
            try {
                console.log("Calling resolveCard...");
                resolveCard(index, render);
            } catch (error) {
                console.error("Error playing card:", error);
                alert("Error playing card: " + error.message);
            }
        });

        handDiv.appendChild(cardDiv);
    });
}

/* ================================================= */
/* HELPERS                                          */
/* ================================================= */

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ================================================= */
/* AUTO START                                       */
/* ================================================= */

// Expose tutorial function to global scope for HTML onclick handlers
window.markTutorialComplete = markTutorialComplete;

/* ================================================= */
/* DIFFICULTY SELECTION                             */
/* ================================================= */

const difficultyConfigs = {
    easy: {
        mode: "easy",
        leverageOffset: 2,
        strainMultiplier: 0.6,
        oppositionIntensity: 0.7
    },
    normal: {
        mode: "normal",
        leverageOffset: 0,
        strainMultiplier: 1.0,
        oppositionIntensity: 1.0
    },
    hard: {
        mode: "hard",
        leverageOffset: -1,
        strainMultiplier: 1.2,
        oppositionIntensity: 1.3
    }
};

function selectDifficulty(mode) {
    const config = difficultyConfigs[mode];
    if (!config) {
        console.error("Unknown difficulty mode:", mode);
        return;
    }

    // Apply difficulty to game state
    gameState.difficulty = { ...config };

    // Hide modal
    const modal = document.getElementById("difficultyModal");
    if (modal) modal.style.display = "none";

    console.log("Difficulty set to:", mode);
    startGame();
}

// Expose to global scope for HTML onclick handlers
window.selectDifficulty = selectDifficulty;

try {
    console.log("Initializing...");
    initAmbientEngine();
    
    // Show difficulty selection modal instead of auto-starting
    const modal = document.getElementById("difficultyModal");
    if (modal) {
        modal.style.display = "flex";
    } else {
        // Fallback: start with normal difficulty
        selectDifficulty("normal");
    }
    console.log("Initialization complete");
} catch (error) {
    console.error("Fatal error:", error);
    const app = document.getElementById('app');
    if (app) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:#ef4444;color:white;padding:20px;border-radius:8px;z-index:9999;max-width:400px;';
        errorDiv.innerHTML = '<strong>Fatal Error:</strong><br>' + error.message;
        app.appendChild(errorDiv);
    }
}
