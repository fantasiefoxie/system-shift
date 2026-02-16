/* ================================================= */
/* SYSTEM SHIFT – MAIN (RESEARCH VERSION) */
/* ================================================= */

import { gameState } from "./game/state.js";
import { baseDeck, shuffleDeck, drawCard } from "./game/deck.js";
import { playCard, endRound } from "./game/round.js";
import { checkThresholds, checkPressureReveal } from "./game/pressure.js";
import { checkResistancePhase } from "./game/resistance.js";
import { runSimulation } from "./game/simulation.js";
import { getReflectiveQuestion } from "./game/endings.js";

import {
    initLogger,
    logEvent,
    exportLog
} from "./game/logger.js";


/* ================================================= */
/* DOM REFERENCES */
/* ================================================= */

const startBtn = document.getElementById("startBtn");
const exportBtn = document.getElementById("exportLogsBtn");

const trackGrid = document.getElementById("trackGrid");
const handDiv = document.getElementById("hand");

const roundStat = document.getElementById("roundStat");
const momentumStat = document.getElementById("momentumStat");
const pressureStat = document.getElementById("pressureStat");
const capitalStat = document.getElementById("capitalStat");

let finalResult = null;


/* ================================================= */
/* START GAME */
/* ================================================= */

startBtn.addEventListener("click", () => {

    const seedInput = document.getElementById("seedInput");
    const seed = seedInput.value || Date.now().toString();

    initLogger(seed);

    logEvent("game_started", { seed });

    startGame(seed);
});

if (exportBtn) {
    exportBtn.addEventListener("click", exportLog);
}


function startGame(seed) {

    /* RESET STATE */

    Object.assign(gameState, {
        round: 1,
        gameOver: false,
        shiftProgress: 0,
        resistancePhase: false,
        modifiers: [],
        structuralPressure: 0,
        surfacePressure: 0,
        momentum: 0,
        debtRoundsActive: 0,
        playsThisRound: 0,
        politicalCapital: gameState.maxPoliticalCapital
    });

    finalResult = null;

    gameState.deck = shuffleDeck(baseDeck);
    gameState.discardPile = [];
    gameState.playerHand = [];

    logEvent("deck_initialized", {
        size: gameState.deck.length
    });

    drawHand(gameState.handSize);

    render();
}


/* ================================================= */
/* DRAW HAND */
/* ================================================= */

function drawHand(count) {

    for (let i = 0; i < count; i++) {

        const card = drawCard(gameState);

        if (card) {
            gameState.playerHand.push(card);
        }
    }

    logEvent("hand_drawn", {
        size: gameState.playerHand.length
    });
}


/* ================================================= */
/* RENDER */
/* ================================================= */

function render() {

    if (gameState.gameOver) {
        renderEnding();
        return;
    }

    updateSystemStats();
    renderTracks();
    renderHand();
}


/* ================================================= */
/* SYSTEM STATS */
/* ================================================= */

function updateSystemStats() {

    roundStat.textContent = gameState.round;
    momentumStat.textContent = gameState.momentum;
    pressureStat.textContent = gameState.structuralPressure;
    capitalStat.textContent = gameState.politicalCapital;
}


/* ================================================= */
/* TRACK DISPLAY */
/* ================================================= */

function renderTracks() {

    trackGrid.innerHTML = "";

    Object.entries(gameState.tracks).forEach(([key, value]) => {

        const pill = document.createElement("div");
        pill.classList.add("track-pill", key);

        pill.innerHTML = `
            <div class="pill-label">${capitalize(key)}</div>
            <div class="pill-value">${value}%</div>
        `;

        trackGrid.appendChild(pill);
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


/* ================================================= */
/* HAND */
/* ================================================= */

function renderHand() {

    handDiv.innerHTML = "";

    gameState.playerHand.forEach((card, index) => {

        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card", card.suit);

        cardDiv.innerHTML = `
            <div class="card-title">${card.title}</div>
            <div class="card-cost">Cost: ${card.cost}</div>
            <div class="card-body">
                ${Object.entries(card.effects)
                    .map(([key, value]) => {
                        const cls = value >= 0 ? "effect-positive" : "effect-negative";
                        return `<p class="${cls}">${key}: ${value}</p>`;
                    })
                    .join("")}
            </div>
            <button class="play-btn">Play</button>
        `;

        const playBtn = cardDiv.querySelector(".play-btn");

        playBtn.addEventListener("click", () => {

            logEvent("card_play_attempt", {
                cardId: card.id,
                capitalBefore: gameState.politicalCapital
            });

            playCard(index);

            checkThresholds();
            checkPressureReveal();
            checkResistancePhase();

            logEvent("card_played", {
                cardId: card.id,
                capitalAfter: gameState.politicalCapital
            });

            render();
        });

        handDiv.appendChild(cardDiv);
    });
}


/* ================================================= */
/* ROUND END */
/* ================================================= */

document.addEventListener("keydown", (e) => {

    if (e.key === "r" && !gameState.gameOver) {

        logEvent("round_end_initiated", {
            round: gameState.round
        });

        endRound();

        logEvent("round_ended", {
            round: gameState.round,
            capital: gameState.politicalCapital,
            momentum: gameState.momentum
        });

        drawHand(gameState.handSize);

        render();
    }
});


/* ================================================= */
/* ENDING */
/* ================================================= */

function renderEnding() {

    if (!finalResult) {
        finalResult = runSimulation();
    }

    const result = finalResult;

    const finalState = {
        SSI: result.metrics.SSI,
        EE: result.metrics.EE,
        EV: gameState.tracks.planet,
        momentum: gameState.momentum,
        power: gameState.tracks.power,
        community: gameState.tracks.community,
        structuralPressure: gameState.structuralPressure,
        debtRoundsActive: gameState.debtRoundsActive,
        wealth: gameState.tracks.wealth
    };

    const question = getReflectiveQuestion(finalState);

    trackGrid.innerHTML = `
        <div class="ending-container">
            <h2>End of Era</h2>
            <p>${result.timeline.aftermath}</p>
            <p>${result.timeline.memory}</p>
            <div class="ending-question">${question}</div>
            <button id="restartBtn">Restart</button>
        </div>
    `;

    document.getElementById("restartBtn")
        .addEventListener("click", () => location.reload());

    handDiv.innerHTML = "";

    logEvent("game_ended", {
        metrics: result.metrics
    });
}
