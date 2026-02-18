/* ================================================= */
/* SYSTEM SHIFT – ROUND ENGINE (v9 FINAL HARDENED)  */
/* Structural Strain + Surge + Pushback 2.2         */
/* Fully Safe + Stable + Deterministic              */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";

/* Track surge changes within round */
let surgeDeltaThisRound = 0;

/* ================================================= */
/* PLAY CARD                                        */
/* ================================================= */

export function playCard(index) {

    if (gameState.playsThisRound >= gameState.maxPlaysPerRound) return;

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

    applyEffects(card.effects || {});

    /* Structural surge bonus */
    if (card.suit === "authority" || card.suit === "solidarity") {
        gameState.surge += 1;
        surgeDeltaThisRound += 1;
    }

    gameState.discardPile.push(card);
    gameState.playerHand.splice(index, 1);
    gameState.playsThisRound += 1;
}

/* ================================================= */
/* APPLY EFFECTS                                    */
/* ================================================= */

function applyEffects(effects) {

    for (let key in effects) {

        const value = Number(effects[key]) || 0;
        if (value === 0) continue;

        if (key === "surge") {
            gameState.surge += value;
            surgeDeltaThisRound += value;
            continue;
        }

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

    const t = gameState.tracks;

    const care = Number(t.care) || 0;
    const climate = Number(t.climate) || 0;
    const solidarity = Number(t.solidarity) || 0;
    const authority = Number(t.authority) || 0;
    const capital = Number(t.capital) || 0;
    const strain = Number(t.strain) || 0;

    const surge = Number(gameState.surge) || 0;

    const social = (care + solidarity) / 2;
    const control = (authority + capital) / 2;
    const imbalance = control - social;
    const powerImbalance = Math.abs(imbalance);

    const ecoDeficit = Math.max(0, 10 - climate);

    let strainDelta = 0;

    /* Power imbalance */
    if (imbalance > 6) strainDelta += 2;
    else if (imbalance < -6) strainDelta += 1;
    else if (powerImbalance >= 3) strainDelta += 1;

    /* Ecological stress */
    if (ecoDeficit >= 5) strainDelta += 2;
    else if (ecoDeficit >= 3) strainDelta += 1;

    /* Harmony bonus */
    if (powerImbalance <= 2 && ecoDeficit === 0) {
        strainDelta -= 1;
    }

    /* Surge stabilization */
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

    log("ROUND_ENDING", { round: gameState.round });

    if (gameState.round >= gameState.maxRounds) {
        gameState.gameOver = true;
        log("GAME_OVER", { finalRound: gameState.round });
        return;
    }

    gameState.round += 1;

    /* --------------------------------------------- */
    /* 1. LEVERAGE RECOVERY                         */
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
    /* 2. PUSHBACK SYSTEM                           */
    /* --------------------------------------------- */

    const authority = Number(gameState.tracks.authority) || 0;
    const capital = Number(gameState.tracks.capital) || 0;
    const strain = Number(gameState.tracks.strain) || 0;
    const surge = Number(gameState.surge) || 0;

    gameState.pushback ??= {};
    gameState.pushback.eliteResistance ??= 0;
    gameState.pushback.transitionShock ??= 0;

    const elitePower =
        Math.max(0, authority) +
        Math.max(0, capital);

    let eliteResistanceDelta = 0;

    if (elitePower > 0) {

        eliteResistanceDelta += Math.floor(surge / 4);

        if (strain >= 8 && strain < 18)
            eliteResistanceDelta += 1;

        if (strain >= 20 && eliteResistanceDelta > 0)
            eliteResistanceDelta -= 1;
    }

    let transitionShockDelta = Math.floor(surge / 5);

    if (strain >= 15)
        transitionShockDelta += 1;

    gameState.pushback.eliteResistance =
        Math.max(0, gameState.pushback.eliteResistance + eliteResistanceDelta);

    gameState.pushback.transitionShock =
        Math.max(0, gameState.pushback.transitionShock + transitionShockDelta);

    gameState.pushback.value =
        gameState.pushback.eliteResistance +
        gameState.pushback.transitionShock;

    log("PUSHBACK_UPDATED", {
        eliteResistanceDelta,
        transitionShockDelta,
        eliteResistance: gameState.pushback.eliteResistance,
        transitionShock: gameState.pushback.transitionShock,
        totalPushback: gameState.pushback.value
    });

    /* --------------------------------------------- */
    /* 3. PUSHBACK PHASE EFFECTS                    */
    /* --------------------------------------------- */

    let leveragePenalty = 0;
    let extraStrainDrift = 0;

    if (gameState.pushback.value >= 20) {
        leveragePenalty = 1;
        extraStrainDrift = 1;
    }
    else if (gameState.pushback.value >= 10) {
        leveragePenalty = 1;
    }

    if (leveragePenalty > 0) {
        gameState.leverage =
            Math.max(0, gameState.leverage - leveragePenalty);
    }

    if (extraStrainDrift > 0) {
        gameState.tracks.strain =
            Math.min(20, gameState.tracks.strain + extraStrainDrift);
    }

    log("PUSHBACK_PHASE_EFFECT", {
        pushback: gameState.pushback.value,
        leveragePenalty,
        extraStrainDrift
    });

    /* --------------------------------------------- */
    /* 4. STRUCTURAL STRAIN DRIFT                   */
    /* --------------------------------------------- */

    applyStructuralStrainDrift();

    /* --------------------------------------------- */
    /* 5. SURGE DECAY                               */
    /* --------------------------------------------- */

    if (surgeDeltaThisRound <= 0 && gameState.surge > 0) {
        gameState.surge -= 1;
    }

    surgeDeltaThisRound = 0;

    /* --------------------------------------------- */
    /* 6. RESET ROUND STATE                         */
    /* --------------------------------------------- */

    gameState.playsThisRound = 0;
    gameState.playerHand = [];
}