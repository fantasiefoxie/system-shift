/* ================================================= */
/* SYSTEM SHIFT – MAIN (FULL STABLE HALO BUILD)     */
/* ================================================= */

import { gameState } from "./game/state.js";
import { baseDeck, shuffleDeck, drawCard } from "./game/deck.js";
import { playCard, endRound } from "./game/round.js";
import { initLogger, log, exportLog } from "./game/logger.js";

/* ================================================= */
/* DOM REFERENCES                                   */
/* ================================================= */

const startBtn = document.getElementById("startBtn");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const exportBtn = document.getElementById("exportLogBtn");

const handDiv = document.getElementById("hand");

/* Halo Stat Elements */
const roundStat = document.getElementById("roundStat");
const momentumStat = document.getElementById("momentumStat");
const capitalStat = document.getElementById("capitalStat");
const pressureStat = document.getElementById("pressureStat");

/* Track Halo Containers (must exist in HTML) */
const trackElements = {
    wellbeing: document.getElementById("track-wellbeing"),
    planet: document.getElementById("track-planet"),
    community: document.getElementById("track-community"),
    power: document.getElementById("track-power"),
    wealth: document.getElementById("track-wealth"),
    tension: document.getElementById("track-tension")
};

/* ================================================= */
/* START GAME                                       */
/* ================================================= */

function startGame() {

    const seed = Date.now().toString();

    initLogger(seed);
    log("GAME_STARTED", { seed });

    Object.assign(gameState, {
        round: 1,
        gameOver: false,
        playsThisRound: 0,
        politicalCapital: gameState.maxPoliticalCapital,
        momentum: 0,
        playerHand: [],
        discardPile: []
    });

    if (nextRoundBtn) nextRoundBtn.disabled = false;

    gameState.deck = shuffleDeck([...baseDeck]);
    log("DECK_INITIALIZED", { size: gameState.deck.length });

    drawHand(gameState.handSize);
    render();
}

if (startBtn) startBtn.addEventListener("click", startGame);
if (exportBtn) exportBtn.addEventListener("click", exportLog);

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

    log("HAND_DRAWN", { size: gameState.playerHand.length });
}

/* ================================================= */
/* ROUND HANDLER                                    */
/* ================================================= */

function handleEndRound() {

    if (gameState.gameOver) return;

    log("ROUND_END_INITIATED", { round: gameState.round });

    endRound();

    if (!gameState.gameOver) {
        drawHand(gameState.handSize);
    } else {
        if (nextRoundBtn) nextRoundBtn.disabled = true;
    }

    render();
}

if (nextRoundBtn) nextRoundBtn.addEventListener("click", handleEndRound);

document.addEventListener("keydown", (e) => {
    if (e.key === "r") handleEndRound();
});

/* ================================================= */
/* RENDER                                           */
/* ================================================= */

function render() {
    updateStats();
    renderTracks();
    renderHand();
}

/* ================================================= */
/* UPDATE HALO STATS                                */
/* ================================================= */

function updateStats() {

    if (roundStat) roundStat.textContent = gameState.round;
    if (momentumStat) momentumStat.textContent = gameState.momentum;
    if (capitalStat) capitalStat.textContent = gameState.politicalCapital;

    if (pressureStat) {
        pressureStat.textContent = gameState.pressure?.value || 0;
    }
}

/* ================================================= */
/* UPDATE TRACK HALOS                               */
/* ================================================= */

function renderTracks() {

    Object.entries(trackElements).forEach(([key, el]) => {

        if (!el) return;

        const value = gameState.tracks[key];

        el.querySelector(".halo-value").textContent = value;

        // Optional: update fill ring
        const ring = el.querySelector(".halo-ring");
        if (ring) {
            const percent = Math.min(100, Math.max(0, value * 5));
            ring.style.setProperty("--fill", `${percent}%`);
        }
    });
}

/* ================================================= */
/* HAND / ENDING                                    */
/* ================================================= */

function renderHand() {

    if (!handDiv) return;

    handDiv.innerHTML = "";

    if (gameState.gameOver) {

        const ending = evaluateEnding();

        handDiv.innerHTML = `
            <div class="game-over">
                <h2>END OF CYCLE</h2>
                <div class="ending-type">${ending.type}</div>
                <div class="ending-message">${ending.message}</div>

                <div class="ending-stats">
                    <div>Wellbeing: ${gameState.tracks.wellbeing}</div>
                    <div>Planet: ${gameState.tracks.planet}</div>
                    <div>Community: ${gameState.tracks.community}</div>
                    <div>Power: ${gameState.tracks.power}</div>
                    <div>Wealth: ${gameState.tracks.wealth}</div>
                    <div>Tension: ${gameState.tracks.tension}</div>
                </div>

                <button id="restartBtn">Restart Cycle</button>
            </div>
        `;

        document.getElementById("restartBtn")
            .addEventListener("click", startGame);

        return;
    }

    gameState.playerHand.forEach((card, index) => {

        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");

        cardDiv.innerHTML = `
            <div class="card-title">${card.title}</div>
            <div class="card-cost">Cost: ${card.cost}</div>
            <div class="card-effects">
                ${Object.entries(card.effects)
                    .map(([k, v]) => {
                        const cls = v >= 0 ? "pos" : "neg";
                        return `<div class="${cls}">${k}: ${v}</div>`;
                    })
                    .join("")}
            </div>
            <button class="play-btn">Play</button>
        `;

        const btn = cardDiv.querySelector(".play-btn");

        if (gameState.politicalCapital < card.cost) {
            btn.disabled = true;
        }

        btn.addEventListener("click", () => {

            log("CARD_PLAY_ATTEMPT", {
                cardId: card.id,
                capitalBefore: gameState.politicalCapital
            });

            playCard(index);

            log("CARD_PLAY_RESOLVED", {
                cardId: card.id,
                capitalAfter: gameState.politicalCapital
            });

            render();
        });

        handDiv.appendChild(cardDiv);
    });
}

/* ================================================= */
/* ENDING LOGIC                                     */
/* ================================================= */

function evaluateEnding() {

    const { wellbeing, planet, community, tension } = gameState.tracks;

    const socialScore = wellbeing + community;
    const ecoScore = planet;
    const stress = tension;

    if (stress >= 18) {
        return {
            type: "SYSTEM COLLAPSE",
            message: "Escalating tension fractured the transition."
        };
    }

    if (ecoScore >= 18 && stress < 15) {
        return {
            type: "ECOLOGICAL TRANSITION",
            message: "Planetary repair gained structural momentum."
        };
    }

    if (socialScore >= 22 && stress < 15) {
        return {
            type: "SOCIAL TRANSFORMATION",
            message: "Collective welfare reshaped systemic foundations."
        };
    }

    if (stress < 12) {
        return {
            type: "MANAGED STABILITY",
            message: "Reforms slowed collapse without full transformation."
        };
    }

    return {
        type: "SYSTEM DRIFT",
        message: "Partial reform. Power remained intact."
    };
}

/* ================================================= */
/* AUTO START                                       */
/* ================================================= */

startGame();