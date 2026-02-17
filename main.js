/* ================================================= */
/* SYSTEM SHIFT – MAIN (FULL STABLE HALO BUILD AAA) */
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

/* Track Halo Containers */
const trackElements = {
    wellbeing: document.getElementById("track-wellbeing"),
    planet: document.getElementById("track-planet"),
    community: document.getElementById("track-community"),
    power: document.getElementById("track-power"),
    wealth: document.getElementById("track-wealth"),
    tension: document.getElementById("track-tension")
};

let previousTrackValues = {};

/* ================================================= */
/* AMBIENT PARTICLE ENGINE                          */
/* ================================================= */

const ambientCanvas = document.getElementById("ambientCanvas");
const ambientCtx = ambientCanvas?.getContext("2d");

let ambientParticles = [];
let ambientIntensity = 0.3;

function resizeAmbientCanvas() {
    if (!ambientCanvas) return;
    ambientCanvas.width = window.innerWidth;
    ambientCanvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeAmbientCanvas);
resizeAmbientCanvas();

function createAmbientParticles(count) {
    if (!ambientCanvas) return;

    ambientParticles = [];

    for (let i = 0; i < count; i++) {
        ambientParticles.push({
            x: Math.random() * ambientCanvas.width,
            y: Math.random() * ambientCanvas.height,
            radius: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.6 + 0.2,
            angle: Math.random() * Math.PI * 2
        });
    }
}

function updateAmbientIntensity() {
    const tension = gameState.tracks.tension;

    if (tension < 6) ambientIntensity = 0.25;
    else if (tension < 12) ambientIntensity = 0.45;
    else if (tension < 18) ambientIntensity = 0.7;
    else ambientIntensity = 1.0;
}

function animateAmbient() {
    if (!ambientCtx || !ambientCanvas) return;

    ambientCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);

    ambientParticles.forEach(p => {

        p.x += Math.cos(p.angle) * p.speed * ambientIntensity;
        p.y += Math.sin(p.angle) * p.speed * ambientIntensity;

        if (p.x < 0) p.x = ambientCanvas.width;
        if (p.x > ambientCanvas.width) p.x = 0;
        if (p.y < 0) p.y = ambientCanvas.height;
        if (p.y > ambientCanvas.height) p.y = 0;

        const tension = gameState.tracks.tension;

        let color;

        if (tension < 6) color = "rgba(59,130,246,0.35)";
        else if (tension < 12) color = "rgba(148,163,184,0.35)";
        else if (tension < 18) color = "rgba(239,68,68,0.45)";
        else color = "rgba(255,0,0,0.65)";

        ambientCtx.beginPath();
        ambientCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ambientCtx.fillStyle = color;
        ambientCtx.fill();
    });

    requestAnimationFrame(animateAmbient);
}

createAmbientParticles(70);
animateAmbient();

/* ================================================= */
/* ANIMATED VALUE HELPER                            */
/* ================================================= */

function animateValue(el, newValue) {
    if (!el) return;

    const old = parseInt(el.textContent) || 0;
    const diff = newValue - old;

    if (diff === 0) {
        el.textContent = newValue;
        return;
    }

    const steps = 15;
    let current = 0;

    const interval = setInterval(() => {
        current++;
        el.textContent = Math.round(old + (diff * current / steps));
        if (current >= steps) clearInterval(interval);
    }, 15);
}

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

    previousTrackValues = { ...gameState.tracks };

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
    updateAmbientIntensity();
}

/* ================================================= */
/* UPDATE HALO STATS                                */
/* ================================================= */

function updateStats() {

    animateValue(roundStat, gameState.round);
    animateValue(momentumStat, gameState.momentum);
    animateValue(capitalStat, gameState.politicalCapital);

    if (pressureStat) {
        const pressureValue = gameState.pressure?.value || 0;
        animateValue(pressureStat, pressureValue);
    }

    const momentumContainer = momentumStat?.parentElement;
    if (momentumContainer) {
        if (gameState.momentum >= 5) {
            momentumContainer.classList.add("momentum-surge");
        } else {
            momentumContainer.classList.remove("momentum-surge");
        }
    }
}

/* ================================================= */
/* UPDATE TRACK HALOS                               */
/* ================================================= */

function renderTracks() {

    Object.entries(trackElements).forEach(([key, el]) => {

        if (!el) return;

        const value = gameState.tracks[key];
        const previous = previousTrackValues[key] ?? value;

        const valueEl = el.querySelector(".halo-value");
        animateValue(valueEl, value);

        const ring = el.querySelector(".halo-ring");
        if (ring) {
            const percent = Math.min(100, Math.max(0, value * 5));
            ring.style.setProperty("--fill", `${percent}%`);
        }

        if (value > previous) {
            el.classList.add("glow-boost");
            setTimeout(() => {
                el.classList.remove("glow-boost");
            }, 600);
        }

        if (key === "tension") {
            if (value <= 5) el.classList.add("low-tension");
            else el.classList.remove("low-tension");
        }

        previousTrackValues[key] = value;
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

            cardDiv.style.transform = "scale(0.92)";
            setTimeout(() => cardDiv.style.transform = "", 120);

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
        return { type: "SYSTEM COLLAPSE", message: "Escalating tension fractured the transition." };
    }

    if (ecoScore >= 18 && stress < 15) {
        return { type: "ECOLOGICAL TRANSITION", message: "Planetary repair gained structural momentum." };
    }

    if (socialScore >= 22 && stress < 15) {
        return { type: "SOCIAL TRANSFORMATION", message: "Collective welfare reshaped systemic foundations." };
    }

    if (stress < 12) {
        return { type: "MANAGED STABILITY", message: "Reforms slowed collapse without full transformation." };
    }

    return { type: "SYSTEM DRIFT", message: "Partial reform. Power remained intact." };
}

/* ================================================= */
/* AUTO START                                       */
/* ================================================= */

startGame();