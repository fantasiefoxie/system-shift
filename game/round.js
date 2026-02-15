// game/round.js

import { gameState } from "./state.js";
import {
    applyCardModifiers,
    triggerOnCardPlay,
    applyRoundStartJokers,
    evaluateStructuralSpawns
} from "./jokerSystem.js";


/* ================================================= */
/* PLAY CARD */
/* ================================================= */

export function playCard(index) {

    if (gameState.playsThisRound >= gameState.maxPlaysPerRound) return;

    const card = gameState.playerHand[index];
    if (!card) return;

    const cost = card.cost || 0;

    if (gameState.politicalCapital < cost) {
        console.log("Not enough Political Capital");
        return;
    }

    // Pay cost
    gameState.politicalCapital -= cost;

    let effectsToApply = { ...card.effects };

    /* --- Joker card modifiers --- */
    applyCardModifiers(card, effectsToApply);

    applyEffects(effectsToApply);

    /* --- Joker on-play triggers --- */
    triggerOnCardPlay(card);

    /* --- Structural progress --- */
    if (card.suit === "power" || card.suit === "community") {
        gameState.shiftProgress += 1;
        gameState.momentum += 1;
    }

    gameState.discardPile.push(card);
    gameState.playerHand.splice(index, 1);
    gameState.playsThisRound += 1;
}


/* ================================================= */
/* APPLY EFFECTS */
/* ================================================= */

function applyEffects(effects) {

    for (let key in effects) {

        if (key === "momentum") {
            gameState.momentum += effects[key];
            continue;
        }

        if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += effects[key];
        }
    }

    /* Surface unrest */
    if (effects.tension && effects.tension > 1) {
        gameState.surfacePressure += 1;
    }
}


/* ================================================= */
/* END ROUND */
/* ================================================= */

export function endRound() {

    gameState.round += 1;

    /* ============================================= */
    /* Political Capital Recovery */
    /* ============================================= */

    let recovery = 3;

    if (gameState.tracks.community > 12) recovery += 1;
    if (gameState.tracks.tension > 20) recovery -= 1;

    gameState.politicalCapital =
        Math.min(
            gameState.maxPoliticalCapital,
            gameState.politicalCapital + recovery
        );

    /* ============================================= */
    /* Optimism Calculation */
    /* ============================================= */

    calculateOptimism();

    /* ============================================= */
    /* Pressure Mechanics */
    /* ============================================= */

    if (gameState.tracks.tension >= 10) {
        gameState.pressure.value += 1;
        gameState.surfacePressure += 1;
    }

    if (gameState.surfacePressure >= 5) {
        gameState.structuralPressure += 1;
        gameState.surfacePressure = 0;
    }

    /* ============================================= */
    /* Instability */
    /* ============================================= */

    applyInstability();

    /* ============================================= */
    /* Gradual Momentum Decay */
    /* ============================================= */

    if (gameState.momentum > 0) {
        gameState.momentum -= 1;
    }

    /* ============================================= */
    /* Joker Round Start Effects */
    /* ============================================= */

    applyRoundStartJokers();

    /* ============================================= */
    /* Structural Joker Spawn */
    /* ============================================= */

    evaluateStructuralSpawns();

    /* ============================================= */
    /* Reset Turn */
    /* ============================================= */

    gameState.playsThisRound = 0;
    gameState.playerHand = [];

    /* Dynamic hand size scaling */
    gameState.handSize = Math.max(
        3,
        Math.floor(gameState.politicalCapital / 2) + 3
    );

    if (gameState.round > gameState.maxRounds) {
        gameState.gameOver = true;
    }
}


/* ================================================= */
/* OPTIMISM SYSTEM */
/* ================================================= */

function calculateOptimism() {

    let score = 0;

    if (gameState.tracks.wellbeing > 12) score += 1;
    if (gameState.tracks.community > 12) score += 1;
    if (gameState.momentum > gameState.structuralPressure) score += 1;

    if (gameState.tracks.tension > 25) score -= 1;
    if (gameState.structuralPressure > 20) score -= 1;

    gameState.optimism = Math.max(0, score);

    /* Optimism boosts cap */
    gameState.maxPoliticalCapital = 8 + gameState.optimism;
}


/* ================================================= */
/* INSTABILITY */
/* ================================================= */

function applyInstability() {

    const tension = gameState.tracks.tension;
    if (tension < 20) return;

    let erosionAmount = 1;
    if (tension >= 30) erosionAmount = 2;
    if (tension >= 40) erosionAmount = 3;

    const eligibleTracks =
        ["wellbeing", "planet", "community", "power", "wealth"];

    let strongestKey = eligibleTracks[0];

    for (let key of eligibleTracks) {
        if (gameState.tracks[key] > gameState.tracks[strongestKey]) {
            strongestKey = key;
        }
    }

    gameState.tracks[strongestKey] =
        Math.max(0, gameState.tracks[strongestKey] - erosionAmount);
}
