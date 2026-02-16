/* ================================================= */
/* SYSTEM SHIFT – JOKER SYSTEM v1.0.0               */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";

/*
JOKER TYPES
-----------
type: "structural"  → permanent modifier
type: "parasite"    → negative systemic force
type: "catalyst"    → emergency amplifier / stabilizer
*/

/* ================================================= */
/* INITIAL JOKER POOL                               */
/* ================================================= */

export function initializeJokers() {

    gameState.jokerDeck = [

        /* ---------------------------- */
        /* STRUCTURAL POSITIVE          */
        /* ---------------------------- */

        {
            id: "solidarity_networks",
            type: "structural",
            name: "Solidarity Networks",
            effect: () => {
                gameState.momentum += 1;
            }
        },

        {
            id: "institutional_memory",
            type: "structural",
            name: "Institutional Memory",
            effect: () => {
                gameState.structuralPressure = Math.max(
                    0,
                    gameState.structuralPressure - 1
                );
            }
        },

        /* ---------------------------- */
        /* PARASITE                    */
        /* ---------------------------- */

        {
            id: "elite_capture",
            type: "parasite",
            name: "Elite Capture",
            effect: () => {
                gameState.parasiteLevel += 1;
            }
        },

        {
            id: "media_distortion",
            type: "parasite",
            name: "Media Distortion",
            effect: () => {
                gameState.tracks.tension += 1;
            }
        },

        /* ---------------------------- */
        /* CATALYST                    */
        /* ---------------------------- */

        {
            id: "grassroots_wave",
            type: "catalyst",
            name: "Grassroots Wave",
            effect: () => {
                if (gameState.momentum > gameState.structuralPressure) {
                    gameState.tracks.community += 2;
                }
            }
        }

    ];

    log("JOKERS_INITIALIZED", {
        count: gameState.jokerDeck.length
    });
}

/* ================================================= */
/* APPLY ACTIVE JOKERS EACH ROUND                   */
/* ================================================= */

export function applyActiveJokers() {

    gameState.activeJokers.forEach(joker => {
        joker.effect();
        log("JOKER_EFFECT_APPLIED", {
            id: joker.id
        });
    });
}

/* ================================================= */
/* PARASITE GROWTH                                  */
/* ================================================= */

export function parasiteGrowthPhase() {

    // Base growth under structural pressure
    if (gameState.structuralPressure > 10) {
        gameState.parasiteLevel += 1;
    }

    // Growth under high wealth concentration
    if (
        gameState.tracks.wealth > 85 &&
        gameState.tracks.power > gameState.tracks.community
    ) {
        gameState.parasiteLevel += 1;
    }

    // Emergency accelerates parasite
    if (gameState.emergencyActive) {
        gameState.parasiteLevel += 1;
    }

    gameState.parasiteLevel = Math.min(50, gameState.parasiteLevel);

    log("PARASITE_GROWTH", {
        parasiteLevel: gameState.parasiteLevel
    });
}

/* ================================================= */
/* BLEED TO PURGE (Manual Strategy)                 */
/* ================================================= */

export function purgeParasite() {

    if (gameState.parasiteLevel <= 0) return false;

    // Cost scales with parasite level
    const cost = Math.min(10, Math.ceil(gameState.parasiteLevel / 3));

    if (gameState.politicalCapital < cost) return false;

    gameState.politicalCapital -= cost;
    gameState.parasiteLevel -= 3;

    gameState.parasiteLevel = Math.max(0, gameState.parasiteLevel);

    log("PARASITE_PURGED", {
        cost,
        parasiteLevel: gameState.parasiteLevel
    });

    return true;
}

/* ================================================= */
/* UNLOCK JOKER                                     */
/* ================================================= */

export function unlockJoker(criteria) {

    const joker = gameState.jokerDeck.find(j => j.id === criteria);

    if (!joker) return;

    gameState.activeJokers.push(joker);

    log("JOKER_UNLOCKED", {
        id: joker.id
    });
}

/* ================================================= */
/* EMERGENCY PERFORMANCE TRACKING                   */
/* ================================================= */

export function evaluateEmergencyPerformance() {

    if (!gameState.emergencyActive) return;

    let score = 0;

    if (gameState.tracks.wellbeing > 50) score += 1;
    if (gameState.tracks.community > 50) score += 1;
    if (gameState.momentum > gameState.structuralPressure) score += 1;

    if (score >= 2) {
        // Boost after emergency
        gameState.momentum += 3;
        gameState.parasiteLevel = Math.max(0, gameState.parasiteLevel - 2);

        log("EMERGENCY_SUCCESS", { score });
    } else {
        // Dip after emergency
        gameState.structuralPressure += 2;
        log("EMERGENCY_FAILURE", { score });
    }

    gameState.emergencyActive = false;
}
