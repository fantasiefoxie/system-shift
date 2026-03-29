/* ================================================= */
/* SYSTEM SHIFT – SCOUTING SYSTEM                   */
/* Spend surge to reveal faction intent             */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";
import { factions } from "./oppositionSystem.js";

/* ================================================= */
/* SCOUTED FACTIONS STORAGE                         */
/* ================================================= */

export const scoutedFactions = {};

/* ================================================= */
/* FACTION INTENT DESCRIPTIONS                      */
/* ================================================= */

const factionIntents = {
    elite: [
        "Elite interests are preparing to boost Capital reserves.",
        "Elite faction is likely to drain Social resources soon.",
        "Elite interests plan to tax Infrastructure projects.",
        "Elite faction is coordinating a media campaign."
    ],
    authoritarian: [
        "Authoritarian faction is planning to expand Authority.",
        "Authoritarian control is likely to drain Momentum.",
        "Authoritarian faction may increase system Strain.",
        "Authoritarian forces are preparing security measures."
    ],
    statusquo: [
        "Status quo forces are planning bureaucratic obstruction.",
        "Status quo may disrupt Capital or Momentum.",
        "Status quo is likely to fragment Social cohesion.",
        "Status quo forces are coordinating institutional resistance."
    ]
};

/* ================================================= */
/* SCOUT FACTION                                    */
/* ================================================= */

export function scoutFaction(factionId) {
    // Check if player has enough surge
    if (gameState.surge < 3) {
        log("SCOUT_FAILED", { faction: factionId, reason: "insufficient_surge", available: gameState.surge });
        return false;
    }

    // Deduct cost
    gameState.surge -= 3;

    // Get faction state
    const factionState = gameState.opposition?.factions?.[factionId];
    const factionDef = Object.values(factions).find(f => f.id === factionId);

    if (!factionDef || !factionState) {
        log("SCOUT_FAILED", { faction: factionId, reason: "faction_not_found" });
        return false;
    }

    // Generate intent based on faction threat level and active status
    let intent;
    const intents = factionIntents[factionId] || factionIntents.statusquo;
    
    if (factionState.active) {
        // Active faction - more specific intent
        const threatRatio = factionState.threatLevel / (factionDef.escalation?.threshold || 15);
        
        if (threatRatio > 1.5) {
            intent = intents[0]; // Most aggressive intent
        } else if (threatRatio > 1.0) {
            intent = intents[1];
        } else {
            intent = intents[2];
        }
    } else {
        // Inactive faction - general intent
        intent = intents[3] || intents[2];
    }

    // Store scouted result
    scoutedFactions[factionId] = {
        intent: intent,
        expiresRound: gameState.round + 1,
        threatLevel: factionState.threatLevel,
        active: factionState.active
    };

    log("SCOUTED", {
        faction: factionId,
        intent: intent,
        threatLevel: factionState.threatLevel,
        active: factionState.active,
        expiresRound: gameState.round + 1
    });

    return true;
}

/* ================================================= */
/* GET SCOUT RESULT                                 */
/* ================================================= */

export function getScoutResult(factionId) {
    const scout = scoutedFactions[factionId];
    
    if (!scout) return null;
    
    // Check if expired
    if (scout.expiresRound <= gameState.round) {
        delete scoutedFactions[factionId];
        return null;
    }
    
    return scout.intent;
}

/* ================================================= */
/* CLEAR EXPIRED SCOUTS                             */
/* ================================================= */

export function clearExpiredScouts() {
    const currentRound = gameState.round;
    
    Object.keys(scoutedFactions).forEach(factionId => {
        if (scoutedFactions[factionId].expiresRound <= currentRound) {
            log("SCOUT_EXPIRED", { faction: factionId });
            delete scoutedFactions[factionId];
        }
    });
}

/* ================================================= */
/* GET ALL SCOUTED FACTIONS                         */
/* ================================================= */

export function getScoutedFactions() {
    return { ...scoutedFactions };
}

/* ================================================= */
/* RESET SCOUTING                                   */
/* ================================================= */

export function resetScouting() {
    Object.keys(scoutedFactions).forEach(key => {
        delete scoutedFactions[key];
    });
}