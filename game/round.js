/* ================================================= */
/* SYSTEM SHIFT – ROUND ENGINE (BRICK v6 FINAL)     */
/* Structural Strain + Surge + Pushback Integrated  */
/* Smart Surge Decay Integrated                     */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";

/* Track whether surge increased this round */
let surgeGainedThisRound = false;

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

    /* Surge bonus for structural cards */
    if (card.suit === "authority" || card.suit === "solidarity") {
        gameState.surge += 1;
        surgeGainedThisRound = true;
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

        /* Surge handling */
        if (key === "surge") {
            gameState.surge += value;
            surgeGainedThisRound = true;
            continue;
        }

        /* Halo updates */
        if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += value;
        }
    }

    log("EFFECTS_APPLIED", effects);
}

/* ================================================= */
/* STRUCTURAL STRAIN – IMBALANCE MODEL              */
/* ================================================= */

function applyStructuralStrainDrift() {

    const { care, climate, solidarity, authority, capital, strain } = gameState.tracks;
    const surge = gameState.surge;

    const social = (care + solidarity) / 2;
    const control = (authority + capital) / 2;
    const powerImbalance = Math.abs(control - social);

    const ecoDeficit = Math.max(0, 10 - climate);

    let strainDelta = 0;

    if (powerImbalance >= 6) strainDelta += 2;
    else if (powerImbalance >= 3) strainDelta += 1;

    if (ecoDeficit >= 5) strainDelta += 2;
    else if (ecoDeficit >= 3) strainDelta += 1;

    if (powerImbalance <= 2 && ecoDeficit === 0) {
        strainDelta -= 1;
    }

    const surgeStability = Math.floor(surge / 5);
    strainDelta -= surgeStability;

    let newStrain = strain + strainDelta;
    newStrain = Math.max(0, Math.min(20, newStrain));

    gameState.tracks.strain = newStrain;

    log("STRUCTURAL_STRAIN_IMBALANCE", {
        powerImbalance,
        ecoDeficit,
        surge,
        surgeStability,
        strainDelta,
        resultingStrain: newStrain
    });
}

/* ================================================= */
/* END ROUND                                        */
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

    /* --------------------------------------------- */
    /* 1. LEVERAGE RECOVERY (with Surge Bonus)      */
    /* --------------------------------------------- */

    const surgeRecoveryBonus =
        Math.ceil(gameState.surge / 2) +
        Math.floor(gameState.surge / 6);

    gameState.leverage = Math.min(
        gameState.maxLeverage,
        gameState.leverage +
        gameState.leverageRecovery +
        surgeRecoveryBonus
    );

    /* --------------------------------------------- */
    /* 2. PUSHBACK UPDATE                           */
    /* --------------------------------------------- */

    let pushbackIncrease = 0;

    if (gameState.tracks.strain >= 10) {
        pushbackIncrease += 1;
    }

    pushbackIncrease += Math.floor(gameState.surge / 6);

    gameState.pushback.value += pushbackIncrease;

    log("PUSHBACK_UPDATED", {
        increase: pushbackIncrease,
        totalPushback: gameState.pushback.value
    });

    /* --------------------------------------------- */
    /* 3. STRUCTURAL STRAIN UPDATE                  */
    /* --------------------------------------------- */

    applyStructuralStrainDrift();

    /* --------------------------------------------- */
    /* 4. SURGE DECAY (SMART)                       */
    /* --------------------------------------------- */

    if (!surgeGainedThisRound && gameState.surge > 0) {
        gameState.surge -= 1;
    }

    /* Reset surge tracker */
    surgeGainedThisRound = false;

    /* --------------------------------------------- */
    /* 5. RESET ROUND STATE                         */
    /* --------------------------------------------- */

    gameState.playsThisRound = 0;
    gameState.playerHand = [];
}