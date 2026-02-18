/* ================================================= */
/* SYSTEM SHIFT – ROUND ENGINE (BRICK v7)           */
/* Structural Strain + Surge + Pushback 2.0         */
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
    const imbalance = control - social;
    const powerImbalance = Math.abs(imbalance);

    const ecoDeficit = Math.max(0, 10 - climate);

    let strainDelta = 0;

    if (imbalance > 6) strainDelta += 2;         // control dominant
    else if (imbalance < -6) strainDelta += 1;   // social dominant
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
    /* 2. PUSHBACK 2.0 (Elite + Transition Shock)   */
    /* --------------------------------------------- */

    const { authority, capital, strain } = gameState.tracks;
    const surge = gameState.surge;

    /* Ensure internal structure exists */
    gameState.pushback.eliteResistance ??= 0;
    gameState.pushback.transitionShock ??= 0;

    const elitePower =
        Math.max(0, authority) +
        Math.max(0, capital);

    /* ---- Elite Resistance ---- */

    let eliteResistanceDelta = 0;

    if (elitePower > 0) {

        eliteResistanceDelta += Math.floor(surge / 4);

        if (strain >= 8 && strain < 18) {
            eliteResistanceDelta += 1;
        }

        if (strain >= 20 && eliteResistanceDelta > 0) {
            eliteResistanceDelta -= 1;
        }
    }

    /* ---- Transition Shock ---- */

    let transitionShockDelta = 0;

    transitionShockDelta += Math.floor(surge / 5);

    if (strain >= 15) {
        transitionShockDelta += 1;
    }

    /* Apply deltas */

    gameState.pushback.eliteResistance += eliteResistanceDelta;
    gameState.pushback.transitionShock += transitionShockDelta;

    /* Clamp to prevent negatives */

    gameState.pushback.eliteResistance =
        Math.max(0, gameState.pushback.eliteResistance);

    gameState.pushback.transitionShock =
        Math.max(0, gameState.pushback.transitionShock);

    /* Derived UI-compatible pushback */

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
        gameState.leverage = Math.max(
            0,
            gameState.leverage - leveragePenalty
        );
    }

    /* Apply extra structural strain if destabilized */
    if (extraStrainDrift > 0) {
        gameState.tracks.strain = Math.min(
            20,
            gameState.tracks.strain + extraStrainDrift
        );
    }

    log("PUSHBACK_PHASE_EFFECT", {
        pushback: gameState.pushback.value,
        leveragePenalty,
        extraStrainDrift
    });
    /* --------------------------------------------- */
    /* 4. STRUCTURAL STRAIN UPDATE                  */
    /* --------------------------------------------- */

    applyStructuralStrainDrift();

    /* --------------------------------------------- */
    /* 5. SURGE DECAY (SMART)                       */
    /* --------------------------------------------- */

    if (!surgeGainedThisRound && gameState.surge > 0) {
        gameState.surge -= 1;
    }

    surgeGainedThisRound = false;

    /* --------------------------------------------- */
    /* 6. RESET ROUND STATE                         */
    /* --------------------------------------------- */

    gameState.playsThisRound = 0;
    gameState.playerHand = [];
}