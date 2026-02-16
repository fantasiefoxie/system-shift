// game/systemDynamics.js
// =====================================================
// SYSTEM SHIFT v2.0
// Structural Dynamics Engine
// Entropy + Imbalance + Overflow Logic
// =====================================================

import { gameState } from "./state.js";
import { log } from "./logger.js";

/* ===================================================== */
/* IMBALANCE CALCULATION */
/* ===================================================== */

export function calculateImbalance() {

    const t = gameState.tracks;

    const values = [
        t.wellbeing,
        t.planet,
        t.community,
        t.power,
        t.wealth
    ];

    const max = Math.max(...values);
    const min = Math.min(...values);

    const imbalance = max - min;

    gameState.imbalance = imbalance;

    log("imbalance_calculated", { imbalance });

    return imbalance;
}


/* ===================================================== */
/* ENTROPY GENERATION */
/* ===================================================== */

export function updateEntropy() {

    const imbalance = calculateImbalance();
    const tension = gameState.tracks.tension;

    let entropyGain = 0;

    // High imbalance causes entropy
    if (imbalance > 40) entropyGain += 2;
    else if (imbalance > 25) entropyGain += 1;

    // High tension accelerates decay
    if (tension > 60) entropyGain += 2;
    else if (tension > 40) entropyGain += 1;

    // Structural scars worsen entropy
    entropyGain += gameState.structuralScar;

    gameState.entropy += entropyGain;

    log("entropy_update", {
        entropyGain,
        totalEntropy: gameState.entropy
    });

    return entropyGain;
}


/* ===================================================== */
/* OVERFLOW + COLLAPSE MEMORY */
/* ===================================================== */

export function checkTrackExtremes() {

    let overflow = 0;
    let collapse = 0;

    Object.entries(gameState.tracks).forEach(([key, value]) => {

        if (value > 100) {
            overflow += 1;
        }

        if (value < 20) {
            collapse += 1;
        }

    });

    if (overflow > 0) {
        gameState.overflowMemory += overflow;
        gameState.entropy += overflow;
    }

    if (collapse > 0) {
        gameState.collapseMemory += collapse;
        gameState.entropy += collapse * 2;
    }

    log("extreme_check", {
        overflow,
        collapse,
        entropy: gameState.entropy
    });
}


/* ===================================================== */
/* ENTROPY RESOLUTION (YOUR A + LIGHT B CHOICE) */
/* ===================================================== */

export function resolveEntropy() {

    if (gameState.entropy < 10) return;

    // Reform window
    const reformStrength =
        gameState.tracks.community +
        gameState.tracks.wellbeing +
        gameState.momentum;

    if (reformStrength > 160) {

        const reduction = Math.floor(gameState.entropy * 0.5);

        gameState.entropy -= reduction;

        log("entropy_reform_reduction", {
            reduction,
            remainingEntropy: gameState.entropy
        });

        return;
    }

    // If reform weak → structural scar forms
    if (gameState.entropy > 20) {

        gameState.structuralScar += 1;

        log("structural_scar_added", {
            structuralScar: gameState.structuralScar
        });

    }
}


/* ===================================================== */
/* SOFT DECAY (GRADUAL ENTROPY DECAY PER ROUND) */
/* ===================================================== */

export function entropyNaturalDecay() {

    if (gameState.entropy <= 0) return;

    const decay = 1;

    gameState.entropy -= decay;

    log("entropy_natural_decay", {
        decay,
        remainingEntropy: gameState.entropy
    });
}


/* ===================================================== */
/* FULL SYSTEM UPDATE (CALL AT ROUND END) */
/* ===================================================== */

export function runStructuralUpdate() {

    updateEntropy();
    checkTrackExtremes();
    resolveEntropy();
    entropyNaturalDecay();

}
