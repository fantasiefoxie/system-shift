/* ================================================= */
/* SYSTEM SHIFT – CRISIS RISK INDEX ENGINE v1.0.0   */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";

/*
CRI (Crisis Risk Index)
Range: 0 → 150+

Interpretation Bands:
0–25     Stable
26–50    Strained
51–70    Fragile
71–84    Critical
85+      Emergency Trigger
*/

/* ================================================= */
/* PUBLIC FUNCTION                                   */
/* ================================================= */

export function recalculateCRI() {

    const t = gameState.tracks;

    /* --------------------------------------------- */
    /* BASE PRESSURE CONTRIBUTORS                    */
    /* --------------------------------------------- */

    let cri = 0;

    // Tension directly increases CRI
    cri += weighted(t.tension, 0.6);

    // Low wellbeing increases CRI
    cri += inverseWeighted(t.wellbeing, 0.4);

    // Low planet increases CRI
    cri += inverseWeighted(t.planet, 0.4);

    // Low community increases CRI
    cri += inverseWeighted(t.community, 0.5);

    /* --------------------------------------------- */
    /* STRUCTURAL FACTORS                            */
    /* --------------------------------------------- */

    // Structural pressure memory
    cri += gameState.structuralPressure * 0.8;

    // Parasite level amplifies instability
    cri += gameState.parasiteLevel * 0.7;

    /* --------------------------------------------- */
    /* POWER CONCENTRATION DYNAMIC                   */
    /* --------------------------------------------- */

    const powerGap = t.power - t.community;

    if (powerGap > 20) {
        cri += powerGap * 0.3;
    }

    /* --------------------------------------------- */
    /* HIGH WEALTH RISK                              */
    /* --------------------------------------------- */

    if (t.wealth > 90 && t.tension > 50) {
        cri += 5;
    }

    /* --------------------------------------------- */
    /* MOMENTUM STABILIZER                           */
    /* --------------------------------------------- */

    if (gameState.momentum > 0) {
        cri -= gameState.momentum * 0.5;
    }

    /* --------------------------------------------- */
    /* EMERGENCY AMPLIFIER                           */
    /* --------------------------------------------- */

    if (gameState.emergencyActive) {
        cri += 5; // volatility spike
    }

    /* --------------------------------------------- */
    /* FINAL CLAMP                                   */
    /* --------------------------------------------- */

    gameState.cri = Math.max(0, Math.round(cri));

    log("CRI_RECALCULATED", {
        cri: gameState.cri
    });
}

/* ================================================= */
/* HELPERS                                           */
/* ================================================= */

function weighted(value, weight) {
    return value * weight;
}

function inverseWeighted(value, weight) {
    return (100 - value) * weight;
}
