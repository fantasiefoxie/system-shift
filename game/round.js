/* ================================================= */
/* SYSTEM SHIFT – ROUND ENGINE (BRICK v4)           */
/* Structural Strain Imbalance Model Integrated     */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";

/* ================================================= */
/* PLAY CARD */
/* ================================================= */

export function playCard(index) {

    if (gameState.playsThisRound >= gameState.maxPlaysPerRound) {
        return;
    }

    const card = gameState.playerHand[index];
    if (!card) return;

    const cost = Number(card.cost) || 0;

    if (gameState.leverage < cost) {
        log("PLAY_FAILED_NOT_ENOUGH_LEVERAGE", {
            required: cost,
            available: gameState.leverage
        });
        return;
    }

    gameState.leverage -= cost;

    log("CARD_PLAYED", {
        id: card.id,
        cost
    });

    applyEffects(card.effects);

    // Surge bonus for structural cards
    if (card.suit === "authority" || card.suit === "solidarity") {
        gameState.surge += 1;
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

        const value = Number(effects[key]) || 0;

        if (key === "surge") {
            gameState.surge += value;
            continue;
        }

        if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += value;
        }
    }

    log("EFFECTS_APPLIED", effects);
}

/* ================================================= */
/* STRUCTURAL STRAIN – IMBALANCE MODEL (v4)         */
/* ================================================= */

function applyStructuralStrainDrift() {

    const { care, climate, solidarity, authority, capital, strain } = gameState.tracks;

    /* --------------------------------------------- */
    /* 1. SOCIAL vs CONTROL IMBALANCE               */
    /* --------------------------------------------- */

    const social = (care + solidarity) / 2;
    const control = (authority + capital) / 2;

    const powerImbalance = Math.abs(control - social);

    /* --------------------------------------------- */
    /* 2. ECOLOGICAL DEFICIT                        */
    /* --------------------------------------------- */

    const ecoDeficit = Math.max(0, 10 - climate);

    /* --------------------------------------------- */
    /* 3. CALCULATE STRAIN DELTA                    */
    /* --------------------------------------------- */

    let strainDelta = 0;

    // Imbalance penalty
    if (powerImbalance >= 6) strainDelta += 2;
    else if (powerImbalance >= 3) strainDelta += 1;

    // Ecological penalty
    if (ecoDeficit >= 5) strainDelta += 2;
    else if (ecoDeficit >= 3) strainDelta += 1;

    // Stability reward
    if (powerImbalance <= 2 && ecoDeficit === 0) {
        strainDelta -= 1;
    }

    /* --------------------------------------------- */
    /* 4. APPLY + CLAMP                             */
    /* --------------------------------------------- */

    let newStrain = strain + strainDelta;

    newStrain = Math.max(0, Math.min(20, newStrain));

    gameState.tracks.strain = newStrain;

    log("STRUCTURAL_STRAIN_IMBALANCE", {
        powerImbalance,
        ecoDeficit,
        strainDelta,
        resultingStrain: newStrain
    });
}

/* ================================================= */
/* END ROUND */
/* ================================================= */

export function endRound() {

    log("ROUND_ENDING", {
        round: gameState.round
    });

    if (gameState.round >= gameState.maxRounds) {
        gameState.gameOver = true;
        log("GAME_OVER", { finalRound: gameState.round });
        return;
    }

    gameState.round += 1;

    // Leverage recovery
    gameState.leverage = Math.min(
        gameState.maxLeverage,
        gameState.leverage + gameState.leverageRecovery
    );

    // Pushback from strain threshold
    if (gameState.tracks.strain >= 10) {
        gameState.pushback.value += 1;
    }

    // ✅ Structural strain imbalance system
    applyStructuralStrainDrift();

    // Surge decay
    if (gameState.surge > 0) {
        gameState.surge -= 1;
    }

    gameState.playsThisRound = 0;
    gameState.playerHand = [];
}