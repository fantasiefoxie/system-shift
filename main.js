/* ================================================= */
/* SYSTEM SHIFT – MAIN (HALO BUILD AAA – RESTORED)  */
/* ================================================= */

import { gameState } from "./game/state.js";
import { baseDeck, shuffleDeck, drawCard } from "./game/deck.js";
import { endRound } from "./game/round.js";
import { initLogger, log, exportLog, endRun } from "./game/logger.js";
import { evaluateOutcome } from "./game/outcomeEngine.js";
import { resolveCard } from "./game/effectResolver.js";
import { checkSystemPhases, handleEndingMusic, resetPhaseTracking } from "./game/phaseEngine.js";
import { setSeed } from "./game/rng.js";
import { initAmbientEngine } from "./game/ambientEngine.js";

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

const warningOverlay = document.getElementById("systemWarningOverlay");

const trackElements = {
    care: document.getElementById("track-care"),
    climate: document.getElementById("track-climate"),
    solidarity: document.getElementById("track-solidarity"),
    authority: document.getElementById("track-authority"),
    capital: document.getElementById("track-capital"),
    strain: document.getElementById("track-strain")
};

let endingMusicPlayed = false;

/* ================================================= */
/* START GAME                                       */
/* ================================================= */

function startGame() {

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

    endingMusicPlayed = false;

    gameState.deck = shuffleDeck([...baseDeck]);
    drawHand(gameState.handSize);

    render();
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
        if (!card) break;
        gameState.playerHand.push(card);
    }
}

/* ================================================= */
/* ROUND                                            */
/* ================================================= */

function handleEndRound() {

    if (gameState.gameOver) return;

    endRound();

    if (!gameState.gameOver) {
        drawHand(gameState.handSize);
    }

    render();
}

/* ================================================= */
/* RENDER                                           */
/* ================================================= */

function render() {

    updateStats();
    renderTracks();
    renderHand();
    checkSystemPhases();

    if (gameState.gameOver && !endingMusicPlayed) {

        const ending = evaluateOutcome(gameState);

        handleEndingMusic(ending.type);
        endRun();

        endingMusicPlayed = true;
    }
}

/* ================================================= */
/* UPDATE TOP BAR                                   */
/* ================================================= */

function updateStats() {

    roundStat.textContent = gameState.round;
    surgeStat.textContent = gameState.surge;
    leverageStat.textContent = gameState.leverage;
    pushbackStat.textContent = gameState.pushback?.value || 0;

    /* Top bar state classes */

    leverageStat.parentElement.classList.toggle(
        "low",
        gameState.leverage <= 3
    );

    pushbackStat.parentElement.classList.toggle(
        "critical",
        gameState.pushback?.value >= 15
    );

    warningOverlay.classList.toggle(
        "active",
        gameState.tracks.strain >= 18
    );
}

/* ================================================= */
/* TRACK HALOS                                      */
/* ================================================= */

function renderTracks() {

    Object.entries(trackElements).forEach(([key, el]) => {

        if (!el) return;

        const value = gameState.tracks[key];

        const valueEl = el.querySelector(".halo-value");
        const ring = el.querySelector(".halo-ring");

        if (valueEl) valueEl.textContent = value;

        if (ring) {
            const percent = Math.max(0, Math.min(100, value * 5));
            ring.style.setProperty("--fill", percent + "%");
        }

        /* Threshold state classes */

        el.classList.toggle("high", value >= 15);
        el.classList.toggle("low", value <= 3);

        if (key === "strain") {
            el.classList.toggle("critical", value >= 18);
        }
    });
}

/* ================================================= */
/* HAND / CARDS                                     */
/* ================================================= */

function renderHand() {

    if (!handDiv) return;

    handDiv.innerHTML = "";

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

        document.getElementById("restartBtn")
            .addEventListener("click", startGame);

        return;
    }

    gameState.playerHand.forEach((card, index) => {

        const cardDiv = document.createElement("div");

        /* Add suit class for accent coloring */
        cardDiv.classList.add("card", `suit-${card.suit}`);

        /* Format effects */
        const effectsHTML = Object.entries(card.effects || {})
            .map(([k, v]) => {
                const sign = v > 0 ? "+" : "";
                const cls = v >= 0 ? "pos" : "neg";
                return `<div class="${cls}">${sign}${v} ${capitalize(k)}</div>`;
            })
            .join("");

        cardDiv.innerHTML = `
            <div class="card-title">${card.title}</div>
            <div class="card-cost">Cost: ${card.cost}</div>
            <div class="card-effects">${effectsHTML}</div>
            <button class="play-btn">Play</button>
        `;

        const btn = cardDiv.querySelector(".play-btn");

        if (gameState.leverage < card.cost)
            btn.disabled = true;

        btn.addEventListener("click", () => {
            if (btn.disabled) return;
            resolveCard(index, render);
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
initAmbientEngine();
startGame();