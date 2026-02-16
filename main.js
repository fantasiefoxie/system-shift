/* ================================================= */
/* SYSTEM SHIFT – MAIN (FINAL STABLE + ENDINGS)     */
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

const trackGrid = document.getElementById("trackGrid");
const handDiv = document.getElementById("hand");

const roundStat = document.getElementById("roundStat");
const momentumStat = document.getElementById("momentumStat");
const capitalStat = document.getElementById("capitalStat");

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
/* STATS                                            */
/* ================================================= */

function updateStats() {

    if (roundStat) roundStat.textContent = gameState.round;
    if (momentumStat) momentumStat.textContent = gameState.momentum;
    if (capitalStat) capitalStat.textContent = gameState.politicalCapital;
}

/* ================================================= */
/* TRACKS                                           */
/* ================================================= */

function renderTracks() {

    if (!trackGrid) return;

    trackGrid.innerHTML = "";

    Object.entries(gameState.tracks).forEach(([key, value]) => {

        const pill = document.createElement("div");
        pill.classList.add("track-pill");

        pill.innerHTML = `
            <div class="pill-label">${key}</div>
            <div class="pill-value">${value}</div>
        `;

        trackGrid.appendChild(pill);
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
            </div>
        `;

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
/* ENDING EVALUATION                                */
/* ================================================= */

function evaluateEnding() {

    const { wellbeing, planet, community, wealth, tension } = gameState.tracks;

    const socialScore = wellbeing + community;
    const ecoScore = planet;
    const stress = tension;

    if (stress >= 18) {
        return {
            type: "SYSTEM COLLAPSE",
            message: "Escalating tension fractured the transition. Institutions destabilized."
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
        message: "Partial reform. Power remained largely intact."
    };
}

/* ================================================= */
/* AUTO START                                       */
/* ================================================= */

startGame();