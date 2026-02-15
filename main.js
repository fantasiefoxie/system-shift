import { gameState } from "./game/state.js";
import { baseDeck, shuffleDeck } from "./game/deck.js";
import { playCard, endRound } from "./game/round.js";
import { runSimulation } from "./game/simulation.js";
import { getReflectiveQuestion } from "./game/endings.js";
import { generateCommentary } from "./game/commentary.js";
import {
    removeInstitutionalJoker
} from "./game/jokerSystem.js";


/* ================================================= */
/* DOM REFERENCES */
/* ================================================= */

const startBtn = document.getElementById("startBtn");
const trackGrid = document.getElementById("trackGrid");
const handDiv = document.getElementById("hand");

const roundStat = document.getElementById("roundStat");
const momentumStat = document.getElementById("momentumStat");
const pressureStat = document.getElementById("pressureStat");
const pcStat = document.getElementById("pcStat");
const optimismStat = document.getElementById("optimismStat");

const jokerZone = document.getElementById("jokerZone");

let finalResult = null;

startBtn.addEventListener("click", startGame);


/* ================================================= */
/* START / RESET */
/* ================================================= */

function startGame() {

    gameState.round = 1;
    gameState.gameOver = false;
    gameState.shiftProgress = 0;

    gameState.momentum = 0;
    gameState.optimism = 0;

    gameState.politicalCapital = 5;
    gameState.maxPoliticalCapital = 8;

    gameState.structuralPressure = 0;
    gameState.surfacePressure = 0;

    gameState.activeJokers = [];
    gameState.institutionalJokers = [];
    gameState.crisisJokers = [];

    finalResult = null;

    gameState.deck = shuffleDeck([...baseDeck]);
    gameState.playerHand = [];
    gameState.discardPile = [];

    drawCards(gameState.handSize);
    render();
}


/* ================================================= */
/* DRAW */
/* ================================================= */

function drawCards(count) {

    for (let i = 0; i < count; i++) {

        if (gameState.deck.length === 0 && gameState.discardPile.length > 0) {

            gameState.deck = shuffleDeck([...gameState.discardPile]);
            gameState.discardPile = [];

            gameState.tracks.tension += 1;
            gameState.pressure.value += 1;
        }

        const card = gameState.deck.pop();
        if (card) gameState.playerHand.push(card);
    }
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
    renderJokers();
}


/* ================================================= */
/* SYSTEM SNAPSHOT */
/* ================================================= */

function updateSystemStats() {

    roundStat.textContent = gameState.round;
    momentumStat.textContent = gameState.momentum;
    pressureStat.textContent = gameState.structuralPressure;

    pcStat.textContent =
        `${gameState.politicalCapital} / ${gameState.maxPoliticalCapital}`;

    optimismStat.textContent = gameState.optimism;
}


/* ================================================= */
/* TRACK PILLS */
/* ================================================= */

function renderTracks() {

    trackGrid.innerHTML = "";

    Object.entries(gameState.tracks).forEach(([key, value]) => {

        const pill = document.createElement("div");
        pill.classList.add("track-pill", key);

        pill.innerHTML = `
            <div class="pill-label">${capitalize(key)}</div>
            <div class="pill-value">${value}</div>
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
            <div class="risk-badge risk-${card.risk}">
                ${card.risk.toUpperCase()}
            </div>

            <div class="cost-badge">
                COST: ${card.cost}
            </div>

            <div class="card-title">${card.title}</div>

            <div class="card-body">
                ${Object.entries(card.effects)
                    .map(([key, value]) => {
                        const cls = value >= 0
                            ? "effect-positive"
                            : "effect-negative";
                        return `<p class="${cls}">
                            ${key}: ${value}
                        </p>`;
                    })
                    .join("")}
            </div>
        `;

        cardDiv.addEventListener("click", () => {

            playCard(index);

            const commentary =
                generateCommentary("cardPlay", card);

            renderCommentary(commentary);

            render();
        });

        handDiv.appendChild(cardDiv);
    });
}


/* ================================================= */
/* JOKER UI */
/* ================================================= */

function renderJokers() {

    jokerZone.innerHTML = "";

    if (
        gameState.activeJokers.length === 0 &&
        gameState.institutionalJokers.length === 0 &&
        gameState.crisisJokers.length === 0
    ) return;

    const section = document.createElement("div");
    section.classList.add("joker-section");

    /* Movement Jokers */
    gameState.activeJokers.forEach(j => {
        section.appendChild(createJokerCard(j, "movement"));
    });

    /* Institutional Jokers */
    gameState.institutionalJokers.forEach((j, index) => {

        const card = createJokerCard(j, "institutional");

        const bleedBtn = document.createElement("button");
        bleedBtn.textContent = "Bleed (3 PC)";
        bleedBtn.onclick = () => {
            removeInstitutionalJoker(index);
            render();
        };

        card.appendChild(bleedBtn);
        section.appendChild(card);
    });

    /* Crisis Jokers */
    gameState.crisisJokers.forEach(j => {
        section.appendChild(createJokerCard(j, "crisis"));
    });

    jokerZone.appendChild(section);
}

function createJokerCard(joker, type) {

    const div = document.createElement("div");
    div.classList.add("joker-card", type);

    div.innerHTML = `
        <div class="joker-name">${joker.name}</div>
        <div class="joker-desc">${joker.description}</div>
    `;

    return div;
}


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
            <button id="restartBtn">Begin Again</button>
        </div>
    `;

    document.getElementById("restartBtn")
        .addEventListener("click", startGame);

    handDiv.innerHTML = "";
}


/* ================================================= */
/* COMMENTARY */
/* ================================================= */

function renderCommentary(message) {

    if (!message) return;

    const container = document.getElementById("commentary");

    const previous = container.querySelector(".current");
    if (previous) {
        previous.classList.remove("current");
        previous.classList.add("previous");
    }

    const div = document.createElement("div");
    div.classList.add("commentary-block", "current");

    div.innerHTML = `
        <div class="headline">${message.headline}</div>
        <div class="paragraph">${message.paragraph}</div>
    `;

    container.prepend(div);

    setTimeout(() => div.classList.add("show"), 40);
}


/* ================================================= */
/* KEYBOARD */
/* ================================================= */

document.addEventListener("keydown", (e) => {

    if (e.key === "r" && !gameState.gameOver) {

        endRound();

        const commentary =
            generateCommentary("roundEnd");

        renderCommentary(commentary);

        drawCards(gameState.handSize);
        render();
    }
});
