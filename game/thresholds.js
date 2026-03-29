/* ================================================= */
/* SYSTEM SHIFT – THRESHOLD SYSTEM                  */
/* Dramatic phase shifts at critical track values   */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";

/* ================================================= */
/* THRESHOLD DEFINITIONS                            */
/* ================================================= */

export const thresholds = [
    {
        id: "mass_movement",
        name: "Mass Movement",
        condition: { solidarity: { min: 15 } },
        effect: "solidarity_bonus",
        value: 1,
        persistent: true
    },
    {
        id: "legitimacy_crisis",
        name: "Legitimacy Crisis",
        condition: { authority: { max: 3 } },
        effect: "unlock_radical",
        persistent: true
    },
    {
        id: "climate_emergency",
        name: "Climate Emergency",
        condition: { climate: { max: 5 }, round: { min: 6 } },
        effect: "strain_per_round",
        value: 2,
        persistent: true
    },
    {
        id: "dual_power",
        name: "Dual Power",
        condition: { solidarity: { min: 18 }, authority: { max: 5 } },
        effect: "new_ending",
        ending: "DUAL_POWER_TRANSITION",
        persistent: true
    },
    {
        id: "fascist_threat",
        name: "Fascist Threat",
        condition: { strain: { min: 16 }, capital: { min: 15 }, authority: { min: 12 } },
        effect: "elite_desperation",
        value: 3,
        persistent: true
    },
    {
        id: "economic_collapse",
        name: "Economic Collapse",
        condition: { capital: { max: 3 } },
        effect: "strain_spike",
        value: 5,
        persistent: false
    },
    {
        id: "popular_uprising",
        name: "Popular Uprising",
        condition: { solidarity: { min: 18 }, strain: { min: 15 } },
        effect: "surge_bonus",
        value: 5,
        persistent: false
    },
    {
        id: "green_transition",
        name: "Green Transition",
        condition: { climate: { min: 18 }, care: { min: 15 } },
        effect: "strain_reduction",
        value: -2,
        persistent: true
    }
];

/* ================================================= */
/* EVALUATE CONDITION                               */
/* ================================================= */

function evaluateCondition(condition) {
    const t = gameState.tracks;
    
    for (let [key, range] of Object.entries(condition)) {
        if (key === "round") {
            if (range.min && gameState.round < range.min) return false;
            if (range.max && gameState.round > range.max) return false;
        } else {
            const value = t[key] || 0;
            if (range.min && value < range.min) return false;
            if (range.max && value > range.max) return false;
        }
    }
    
    return true;
}

/* ================================================= */
/* APPLY THRESHOLD EFFECT                           */
/* ================================================= */

function applyThresholdEffect(threshold) {
    switch (threshold.effect) {
        case "solidarity_bonus":
            // Applied in playCard when solidarity cards played
            break;
        case "strain_per_round":
            // Applied in endRound
            break;
        case "surge_bonus":
            gameState.surge += threshold.value;
            break;
        case "strain_spike":
            gameState.tracks.strain = Math.min(20, gameState.tracks.strain + threshold.value); // Balance: clamp to max 20
            break;
        case "elite_desperation":
            // Elite desperation increases opposition intensity
            break;
        case "unlock_radical":
            // Unlock radical cards
            break;
        case "strain_reduction":
            gameState.tracks.strain += threshold.value;
            break;
        case "new_ending":
            // New ending accessible
            break;
    }
    
    log("THRESHOLD_EFFECT_APPLIED", {
        id: threshold.id,
        effect: threshold.effect,
        value: threshold.value
    });
}

/* ================================================= */
/* CHECK THRESHOLDS                                 */
/* Called at end of each round                       */
/* ================================================= */

export function checkThresholds() {
    thresholds.forEach(threshold => {
        if (gameState.activeThresholds.includes(threshold.id)) return;
        
        if (evaluateCondition(threshold.condition)) {
            gameState.activeThresholds.push(threshold.id);
            applyThresholdEffect(threshold);
            log("THRESHOLD_CROSSED", {
                id: threshold.id,
                name: threshold.name,
                effect: threshold.effect
            });
        }
    });
}