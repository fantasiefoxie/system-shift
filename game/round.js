/* ================================================= */
/* SYSTEM SHIFT – ROUND LOGIC (FINAL RESEARCH BUILD) */
/* ================================================= */

import { gameState } from "./state.js";
import { random, logEvent } from "./logger.js";

/* ================================================= */
/* PLAY CARD */
/* ================================================= */

export function playCard(index) {

    if (gameState.playsThisRound >= gameState.maxPlaysPerRound) return;

    const card = gameState.playerHand[index];
    if (!card) return;

    const cost = card.cost || 0;

    if (gameState.politicalCapital < cost) {
        logEvent("insufficient_capital", { required: cost });
        return;
    }

    gameState.politicalCapital -= cost;

    let effectsToApply = { ...card.effects };

    /* ============================= */
    /* APPLY EFFECTS */
    /* ============================= */

    for (let key in effectsToApply) {

        if (key === "momentum") {
            gameState.momentum += effectsToApply[key];
            continue;
        }

        if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += effectsToApply[key];
        }
    }

    /* ============================= */
    /* STRUCTURAL IMPACT */
    /* ============================= */

    if (card.suit === "power" || card.suit === "community") {
        gameState.shiftProgress += 1;
        gameState.momentum += 1;
    }

    /* ============================= */
    /* SURFACE PRESSURE BUILD */
    /* ============================= */

    if (effectsToApply.tension && effectsToApply.tension > 1) {
        gameState.surfacePressure += 1;
    }

    /* ============================= */
    /* DISCARD + TURN ACCOUNTING */
    /* ============================= */

    gameState.discardPile.push(card);
    gameState.playerHand.splice(index, 1);
    gameState.playsThisRound += 1;

    logEvent("card_resolved", {
        card,
        tracks: gameState.tracks,
        capital: gameState.politicalCapital,
        momentum: gameState.momentum
    });
}

/* ================================================= */
/* END ROUND */
/* ================================================= */

export function endRound() {

    logEvent("round_start_resolution", {
        round: gameState.round
    });

    gameState.round += 1;

    /* ================================================= */
    /* POLITICAL CAPITAL RECOVERY */
    /* ================================================= */

    let recovery = 5;

    // Strong community improves recovery
    if (gameState.tracks.community > 70) recovery += 2;

    // High tension reduces recovery
    if (gameState.tracks.tension > 80) recovery -= 2;

    // Structural pressure taxes recovery
    recovery -= Math.floor(gameState.structuralPressure / 20);

    recovery = Math.max(1, recovery);

    gameState.politicalCapital =
        Math.min(
            gameState.maxPoliticalCapital,
            gameState.politicalCapital + recovery
        );

    logEvent("capital_recovered", {
        recovered: recovery,
        newCapital: gameState.politicalCapital
    });

    /* ================================================= */
    /* TENSION → PRESSURE DRIFT */
    /* ================================================= */

    if (gameState.tracks.tension > 60) {
        gameState.pressure.value += 1;
        gameState.surfacePressure += 1;
    }

    /* ================================================= */
    /* SURFACE → STRUCTURAL DRIFT */
    /* ================================================= */

    if (gameState.surfacePressure >= 5) {
        gameState.structuralPressure += 2;
        gameState.surfacePressure = 0;

        logEvent("structural_pressure_increased", {
            structuralPressure: gameState.structuralPressure
        });
    }

    /* ================================================= */
    /* GRADUAL DECAY SYSTEM (WITHIN ROUND DRIFT) */
    /* ================================================= */

    applyNaturalDrift();

    /* ================================================= */
    /* MOMENTUM DECAY */
    /* ================================================= */

    if (gameState.momentum > 0) {
        gameState.momentum -= 1;
    }

    /* ================================================= */
    /* EMERGENCY PERFORMANCE TRACKING */
    /* ================================================= */

    if (gameState.emergency.active) {
        gameState.emergency.roundsActive += 1;
        evaluateEmergencyPerformance();
    }

    /* ================================================= */
    /* RESET ROUND */
    /* ================================================= */

    gameState.playsThisRound = 0;
    gameState.playerHand = [];

    if (gameState.round > gameState.maxRounds) {
        gameState.gameOver = true;
    }

    logEvent("round_end", {
        tracks: gameState.tracks,
        capital: gameState.politicalCapital,
        momentum: gameState.momentum,
        structuralPressure: gameState.structuralPressure
    });
}

/* ================================================= */
/* NATURAL DRIFT SYSTEM */
/* ================================================= */

function applyNaturalDrift() {

    // Wealth concentration drift
    if (gameState.tracks.wealth > 120 && gameState.tracks.tension > 60) {
        gameState.tracks.community -= 2;
        gameState.tracks.power += 1;
    }

    // Ecological degradation drift
    if (gameState.tracks.planet < 40) {
        gameState.tracks.wellbeing -= 1;
    }

    // High tension erosion
    if (gameState.tracks.tension > 80) {

        const erosionTarget = pickStrongestTrack();

        gameState.tracks[erosionTarget] -= 3;

        logEvent("instability_erosion", {
            target: erosionTarget
        });
    }

    // Cap lower bounds
    Object.keys(gameState.tracks).forEach(key => {
        gameState.tracks[key] = Math.max(-50, gameState.tracks[key]);
    });
}

/* ================================================= */
/* EMERGENCY PERFORMANCE SYSTEM */
/* ================================================= */

function evaluateEmergencyPerformance() {

    const emergency = gameState.emergency;

    const materialStrong =
        gameState.tracks.wellbeing > 60 &&
        gameState.tracks.community > 60;

    if (materialStrong) {
        emergency.performanceScore += 2;
    } else {
        emergency.performanceScore -= 1;
    }

    // After 3 rounds, resolve emergency
    if (emergency.roundsActive >= 3) {

        emergency.active = false;

        if (emergency.performanceScore > 3) {

            // Recovery boost
            gameState.tracks.wellbeing += 10;
            gameState.momentum += 5;

            logEvent("emergency_success", {
                boost: true
            });

        } else {

            // Structural dip
            gameState.structuralPressure += 10;
            gameState.tracks.community -= 5;

            logEvent("emergency_failure", {
                penalty: true
            });
        }

        emergency.performanceScore = 0;
        emergency.roundsActive = 0;
    }
}

/* ================================================= */
/* HELPERS */
/* ================================================= */

function pickStrongestTrack() {

    const eligible = ["wellbeing", "planet", "community", "power", "wealth"];

    let strongest = eligible[0];

    for (let key of eligible) {
        if (gameState.tracks[key] > gameState.tracks[strongest]) {
            strongest = key;
        }
    }

    return strongest;
}
