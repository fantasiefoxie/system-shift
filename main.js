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

    Object.assign(gameState, {
        round: 1,
        gameOver: false,
        playsThisRound: 0,
        leverage: gameState.maxLeverage,
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
        handDiv.innerHTML = `
            <div class="game-over">
                <h2>END OF CYCLE</h2>
                <div class="ending-type">${ending.type}</div>
                <div class="ending-message">${ending.message}</div>
                <button id="restartBtn">Restart</button>
            </div>
        `;
        document.getElementById("restartBtn").addEventListener("click", startGame);
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

try {
    console.log("Initializing...");
    initAmbientEngine();
    startGame();
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
