/* ================================================= */
/* SYSTEM SHIFT – MAIN (FULL STABLE HALO BUILD AAA) */
/* ================================================= */

import { gameState } from "./game/state.js";
import { baseDeck, shuffleDeck, drawCard } from "./game/deck.js";
import { playCard, endRound } from "./game/round.js";
import { initLogger, log, exportLog } from "./game/logger.js";
import { evaluateOutcome } from "./game/outcomeEngine.js"; // ✅ NEW
import { resolveCard } from "./game/effectResolver.js";

/* ================================================= */
/* DOM REFERENCES                                   */
/* ================================================= */

const startBtn = document.getElementById("startBtn");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const exportBtn = document.getElementById("exportLogBtn");

const handDiv = document.getElementById("hand");

/* Halo Stat Elements */
const roundStat = document.getElementById("roundStat");
const surgeStat = document.getElementById("surgeStat");
const leverageStat = document.getElementById("leverageStat");
const pushbackStat = document.getElementById("pushbackStat");

/* Overlay + Audio */
const warningOverlay = document.getElementById("systemWarningOverlay");
const bgCalm = document.getElementById("bgCalm");
const bgTension = document.getElementById("bgTension");
const bgCollapse = document.getElementById("bgCollapse");
const sfxLowLeverage = document.getElementById("sfxLowCapital");

let currentMood = "calm";
let audioInitialized = false;
let lowLeverageTriggered = false;

/* ================================================= */
/* SAFE AUDIO UNLOCK SYSTEM                         */
/* ================================================= */

function initAudio() {
    if (audioInitialized) return;

    [bgCalm, bgTension, bgCollapse].forEach(a => {
        if (!a) return;
        a.loop = true;
        a.volume = 0;
        a.play().catch(() => {});
    });

    audioInitialized = true;
}

function fadeAudio(audio, target, speed = 0.004) {
    if (!audio) return;

    const interval = setInterval(() => {
        if (Math.abs(audio.volume - target) < 0.01) {
            audio.volume = target;
            clearInterval(interval);
        } else {
            audio.volume += audio.volume < target ? speed : -speed;
        }
    }, 50);
}

function unlockAudioOnce() {
    if (audioInitialized) return;

    initAudio();
    fadeAudio(bgCalm, 0.6, 0.003);

    document.removeEventListener("click", unlockAudioOnce);
    document.removeEventListener("keydown", unlockAudioOnce);
}

document.addEventListener("click", unlockAudioOnce);
document.addEventListener("keydown", unlockAudioOnce);

/* ================================================= */
/* TRACK HALO CONTAINERS (RENAMED)                  */
/* ================================================= */

const trackElements = {
    care: document.getElementById("track-care"),
    climate: document.getElementById("track-climate"),
    solidarity: document.getElementById("track-solidarity"),
    authority: document.getElementById("track-authority"),
    capital: document.getElementById("track-capital"),
    strain: document.getElementById("track-strain")
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
    const strain = gameState.tracks.strain;

    if (strain < 6) ambientIntensity = 0.25;
    else if (strain < 12) ambientIntensity = 0.45;
    else if (strain < 18) ambientIntensity = 0.7;
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

        const strain = gameState.tracks.strain;

        let color;
        if (strain < 6) color = "rgba(59,130,246,0.35)";
        else if (strain < 12) color = "rgba(148,163,184,0.35)";
        else if (strain < 18) color = "rgba(239,68,68,0.45)";
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
/* SOUNDTRACK SYSTEM                                */
/* ================================================= */

function updateSoundtrack() {

    if (!audioInitialized) return;

    const strain = gameState.tracks.strain;

    if (strain < 12) {
        fadeAudio(bgCalm, 0.65);
        fadeAudio(bgTension, 0.0);
        fadeAudio(bgCollapse, 0.0);
        currentMood = "calm";
    }
    else if (strain < 18) {
        fadeAudio(bgCalm, 0.48);
        fadeAudio(bgTension, 0.18);
        fadeAudio(bgCollapse, 0.0);
        currentMood = "tension";
    }
    else {
        fadeAudio(bgCalm, 0.28);
        fadeAudio(bgTension, 0.30);
        fadeAudio(bgCollapse, 0.50);
        currentMood = "collapse";
    }
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
        leverage: gameState.maxLeverage,
        surge: 0,
        playerHand: [],
        discardPile: []
    });

    previousTrackValues = { ...gameState.tracks };
    lowLeverageTriggered = false;

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
    updateSoundtrack();
}

/* ================================================= */
/* UPDATE HALO STATS                                */
/* ================================================= */

function updateStats() {

    animateValue(roundStat, gameState.round);
    animateValue(surgeStat, gameState.surge);
    animateValue(leverageStat, gameState.leverage);

    if (pushbackStat) {
        const pushbackValue = gameState.pushback?.value || 0;
        animateValue(pushbackStat, pushbackValue);
    }

    if (gameState.leverage <= 2 && !lowLeverageTriggered) {
        if (sfxLowLeverage) sfxLowLeverage.play().catch(() => {});
        lowLeverageTriggered = true;
    }

    if (gameState.leverage > 2) {
        lowLeverageTriggered = false;
    }

    if (warningOverlay) {
        if (gameState.tracks.strain >= 18)
            warningOverlay.classList.add("active");
        else
            warningOverlay.classList.remove("active");
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
            setTimeout(() => el.classList.remove("glow-boost"), 600);
        }

        if (key === "strain") {
            if (value >= 15)
                el.classList.add("danger-mode");
            else
                el.classList.remove("danger-mode");
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

        if (gameState.leverage < card.cost)
            btn.disabled = true;

        btn.addEventListener("click", () => {

            // Prevent spam clicking during resolution
            if (btn.disabled) return;
            btn.disabled = true;

            cardDiv.style.transform = "scale(0.92)";
            setTimeout(() => cardDiv.style.transform = "", 120);

            log("CARD_PLAY_ATTEMPT", {
                cardId: card.id,
                leverageBefore: gameState.leverage
            });

            // NEW: use resolver instead of direct play
            resolveCard(index, () => {

                log("CARD_PLAY_RESOLVED", {
                    cardId: card.id,
                    leverageAfter: gameState.leverage
                });

                render();
            });
        });

        handDiv.appendChild(cardDiv);
    });
}

/* ================================================= */
/* ENDING LOGIC – DELEGATED TO OUTCOME ENGINE       */
/* ================================================= */

function evaluateEnding() {
    return evaluateOutcome(gameState);
}

/* ================================================= */
/* AUTO START                                       */
/* ================================================= */

startGame();