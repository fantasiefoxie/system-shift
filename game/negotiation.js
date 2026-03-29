/* ================================================= */
/* SYSTEM SHIFT – NEGOTIATION SYSTEM                */
/* Once per act, negotiate with a faction           */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";
import { random } from "./rng.js";

/* ================================================= */
/* NEGOTIATION COSTS & SUCCESS RATES                */
/* ================================================= */

const offerConfig = {
    low: { cost: 2, successRate: 0.25, threatReduction: 10 },
    medium: { cost: 4, successRate: 0.50, threatReduction: 20 },
    high: { cost: 6, successRate: 0.75, threatReduction: 35 }
};

/* ================================================= */
/* CAN NEGOTIATE                                    */
/* ================================================= */

export function canNegotiate(factionId) {
    // Check if already negotiated this act
    if (gameState.negotiation?.usedThisAct?.includes(factionId)) {
        return false;
    }
    
    // Check minimum surge
    if (gameState.surge < 2) {
        return false;
    }
    
    // Check faction threat level
    const factionState = gameState.opposition?.factions?.[factionId];
    if (!factionState || factionState.threatLevel <= 0) {
        return false;
    }
    
    return true;
}

/* ================================================= */
/* ATTEMPT NEGOTIATION                              */
/* ================================================= */

export function attemptNegotiation(factionId, offerStrength) {
    const config = offerConfig[offerStrength];
    
    if (!config) {
        return { success: false, factionId, offerStrength, message: "Invalid offer strength." };
    }
    
    // Check if can afford
    if (gameState.surge < config.cost) {
        return { success: false, factionId, offerStrength, message: "Insufficient surge for this offer." };
    }
    
    // Deduct cost
    gameState.surge -= config.cost;
    
    // Mark as used this act
    if (!gameState.negotiation.usedThisAct.includes(factionId)) {
        gameState.negotiation.usedThisAct.push(factionId);
    }
    
    // Roll for success
    const roll = random();
    const success = roll < config.successRate;
    
    const factionState = gameState.opposition?.factions?.[factionId];
    
    if (success) {
        // Reduce threat
        const reduction = config.threatReduction;
        factionState.threatLevel = Math.max(0, factionState.threatLevel - reduction);
        
        // Recalculate active status
        const factionDef = getFactionDefinition(factionId);
        if (factionDef) {
            factionState.active = factionState.threatLevel > (factionDef.escalation?.threshold || 15);
        }
        
        const message = `Negotiation succeeded! ${factionId} threat reduced by ${reduction}.`;
        
        log("NEGOTIATION_SUCCESS", {
            faction: factionId,
            offerStrength,
            costPaid: config.cost,
            threatReduction: reduction,
            newThreatLevel: factionState.threatLevel
        });
        
        // Record in history
        gameState.negotiation.history.push({
            round: gameState.round,
            factionId,
            success: true,
            costPaid: config.cost,
            offerStrength
        });
        
        // Track stat for Diplomat achievement
        try {
            const stats = JSON.parse(localStorage.getItem("systemshift_stats") || "{}");
            stats.successfulNegotiations = (stats.successfulNegotiations || 0) + 1;
            localStorage.setItem("systemshift_stats", JSON.stringify(stats));
        } catch (e) {
            console.warn("Failed to update negotiation stat:", e);
        }
        
        return { success: true, factionId, offerStrength, message };
    } else {
        // Increase threat on failure
        factionState.threatLevel = Math.min(100, factionState.threatLevel + 10);
        
        // Recalculate active status
        const factionDef = getFactionDefinition(factionId);
        if (factionDef) {
            factionState.active = factionState.threatLevel > (factionDef.escalation?.threshold || 15);
        }
        
        const message = `Negotiation failed! ${factionId} threat increased by 10.`;
        
        log("NEGOTIATION_FAILED", {
            faction: factionId,
            offerStrength,
            costPaid: config.cost,
            threatIncrease: 10,
            newThreatLevel: factionState.threatLevel
        });
        
        // Record in history
        gameState.negotiation.history.push({
            round: gameState.round,
            factionId,
            success: false,
            costPaid: config.cost,
            offerStrength
        });
        
        return { success: false, factionId, offerStrength, message };
    }
}

/* ================================================= */
/* RESET NEGOTIATION FOR ACT                        */
/* ================================================= */

export function resetNegotiationForAct() {
    if (gameState.negotiation) {
        gameState.negotiation.usedThisAct = [];
        log("NEGOTIATION_ACT_RESET", { round: gameState.round });
    }
}

/* ================================================= */
/* GET NEGOTIATION STATUS                           */
/* ================================================= */

export function getNegotiationStatus() {
    return {
        usedThisAct: gameState.negotiation?.usedThisAct || [],
        history: gameState.negotiation?.history || []
    };
}

/* ================================================= */
/* HELPER: GET FACTION DEFINITION                   */
/* ================================================= */

function getFactionDefinition(factionId) {
    // Inline faction definitions to avoid circular imports
    const factions = {
        elite: { id: "elite", escalation: { threshold: 15 } },
        authoritarian: { id: "authoritarian", escalation: { threshold: 12 } },
        statusquo: { id: "statusquo", escalation: { threshold: 10 } }
    };
    return factions[factionId] || null;
}