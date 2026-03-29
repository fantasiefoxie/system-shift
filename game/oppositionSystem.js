/* ================================================= */
/* SYSTEM SHIFT – OPPOSITION SYSTEM v1.0             */
/* Dynamic Faction-Based Pushback & Response System    */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";
import { random, randomInt } from "./rng.js";

/* ================================================= */
/* FACTION DEFINITIONS                               */
/* ================================================= */

export const factions = {
    ELITE_INTERESTS: {
        id: "elite",
        name: "Elite Interests",
        description: "Capital and power preservation",
        color: "#ef4444",
        triggers: {
            solidarity_gain: 0.3,
            care_gain: 0.2,
            capital_loss: 0.4,
            infrastructure_gain: 0.1
        },
        responses: {
            capital_boost: 0.6,
            social_drain: 0.4,
            infrastructure_tax: 0.3
        },
        escalation: {
            threshold: 15,
            maxLevel: 5,
            penaltyMultiplier: 1.2
        }
    },

    AUTHORITARIAN: {
        id: "authoritarian",
        name: "Authoritarian Control",
        description: "Order and control enforcement",
        color: "#f59e0b",
        triggers: {
            solidarity_gain: 0.5,
            surge_gain: 0.3,
            authority_loss: 0.2,
            momentum_gain: 0.4
        },
        responses: {
            authority_boost: 0.7,
            momentum_drain: 0.5,
            strain_increase: 0.4
        },
        escalation: {
            threshold: 12,
            maxLevel: 4,
            penaltyMultiplier: 1.3
        }
    },

    STATUS_QUO: {
        id: "statusquo",
        name: "Status Quo Preservation",
        description: "Stability and predictability",
        color: "#64748b",
        triggers: {
            rapid_change: 0.4,
            infrastructure_gain: 0.3,
            track_imbalance: 0.5,
            momentum_gain: 0.2
        },
        responses: {
            momentum_drain: 0.3,
            infrastructure_decay: 0.2,
            recovery_slow: 0.4
        },
        escalation: {
            threshold: 10,
            maxLevel: 3,
            penaltyMultiplier: 1.1
        }
    }
};

/* ================================================= */
/* INITIALIZATION                                    */
/* ================================================= */

export function initOppositionSystem() {
    gameState.opposition = {
        factions: {},
        globalPushback: 0,
        escalationLevel: 0,
        lastAction: null,
        responseCooldown: 0
    };

    // Initialize each faction
    Object.values(factions).forEach(faction => {
        gameState.opposition.factions[faction.id] = {
            threatLevel: 0,
            influence: 0,
            active: false,
            lastResponse: 0,
            responsePattern: []
        };
    });

    log("OPPOSITION_SYSTEM_INIT", {
        factions: Object.keys(gameState.opposition.factions),
        globalPushback: gameState.opposition.globalPushback
    });
}

/* ================================================= */
/* THREAT CALCULATION                                */
/* ================================================= */

export function calculateThreatLevels() {
    const tracks = gameState.tracks;
    const resources = gameState.resources;
    const surge = gameState.surge;

    // Iterate through faction states instead of faction definitions
    Object.entries(gameState.opposition.factions || {}).forEach(([factionId, factionState]) => {
        // Find the faction definition
        const faction = Object.values(factions).find(f => f.id === factionId);
        
        // Skip if faction not found
        if (!faction) {
            console.warn("Faction definition not found for:", factionId);
            return;
        }
        
        let threat = 0;

        // Calculate threat based on triggers
        if (faction.triggers?.solidarity_gain) {
            threat += tracks.solidarity * faction.triggers.solidarity_gain;
        }

        if (faction.triggers?.care_gain) {
            threat += tracks.care * faction.triggers.care_gain;
        }

        if (faction.triggers?.capital_loss) {
            threat += (20 - tracks.capital) * faction.triggers.capital_loss;
        }

        if (faction.triggers?.infrastructure_gain) {
            threat += resources.infrastructure * faction.triggers.infrastructure_gain;
        }

        if (faction.triggers?.surge_gain) {
            threat += surge * faction.triggers.surge_gain;
        }

        if (faction.triggers?.authority_loss) {
            threat += (20 - tracks.authority) * faction.triggers.authority_loss;
        }

        if (faction.triggers?.momentum_gain) {
            threat += resources.momentum * faction.triggers.momentum_gain;
        }

        if (faction.triggers?.rapid_change) {
            const changeRate = calculateChangeRate();
            threat += changeRate * faction.triggers.rapid_change;
        }

        if (faction.triggers?.track_imbalance) {
            const imbalance = calculateTrackImbalance();
            threat += imbalance * faction.triggers.track_imbalance;
        }

        // Apply escalation multiplier
        const escalation = factionState.threatLevel / (faction.escalation?.threshold || 50);
        const multiplier = Math.min(1 + (escalation * 0.5), 2.0);
        threat *= multiplier;

        // Apply difficulty opposition intensity
        if (gameState.difficulty && gameState.difficulty.oppositionIntensity) {
            threat *= gameState.difficulty.oppositionIntensity;
        }

        // Update faction state
        factionState.threatLevel = Math.max(0, Math.min(100, threat));
        factionState.active = factionState.threatLevel > (faction.escalation?.threshold || 50);

        log("FACTION_THREAT_CALCULATED", {
            faction: faction.name,
            threatLevel: factionState.threatLevel,
            active: factionState.active,
            escalation: escalation
        });
    });
}

function calculateChangeRate() {
    // Calculate rate of change in tracks over recent rounds
    // This is a simplified version - in a full implementation, 
    // you'd track historical values
    const tracks = gameState.tracks;
    const maxTrack = Math.max(...Object.values(tracks));
    const minTrack = Math.min(...Object.values(tracks));
    return maxTrack - minTrack;
}

function calculateTrackImbalance() {
    const tracks = gameState.tracks;
    const social = (tracks.care + tracks.solidarity) / 2;
    const control = (tracks.authority + tracks.capital) / 2;
    return Math.abs(control - social);
}

/* ================================================= */
/* RESPONSE SYSTEM                                   */
/* ================================================= */

export function processOppositionResponses() {
    const currentRound = gameState.round;
    
    // Check if enough time has passed since last response
    if (gameState.opposition.responseCooldown > 0) {
        gameState.opposition.responseCooldown--;
        return;
    }

    let totalResponse = 0;

    // Iterate through faction states instead of faction definitions
    Object.entries(gameState.opposition.factions || {}).forEach(([factionId, factionState]) => {
        // Find the faction definition
        const faction = Object.values(factions).find(f => f.id === factionId);
        
        if (!faction || !factionState) return;
        if (!factionState.active) return;

        // Determine if this faction should respond
        const responseChance = calculateResponseChance(faction, factionState);

        if (random() < responseChance) {
            const response = executeFactionResponse(faction, factionState);
            totalResponse += response;

            // Add cooldown to prevent spam
            gameState.opposition.responseCooldown = 2;

            log("FACTION_RESPONSE", {
                faction: faction.name,
                response: response,
                cooldown: gameState.opposition.responseCooldown
            });
        }
    });

    // Update global pushback
    if (totalResponse > 0) {
        gameState.opposition.globalPushback += totalResponse;
        gameState.pushback.value = Math.max(gameState.pushback.value, gameState.opposition.globalPushback);
    }
}

function calculateResponseChance(faction, factionState) {
    let baseChance = 0.3;
    
    // Increase chance based on threat level
    const threatRatio = factionState.threatLevel / faction.escalation.threshold;
    baseChance += threatRatio * 0.2;
    
    // Decrease chance if recently responded
    const timeSinceLast = gameState.round - factionState.lastResponse;
    if (timeSinceLast < 3) {
        baseChance *= 0.5;
    }
    
    // Apply difficulty opposition intensity to response chance
    if (gameState.difficulty && gameState.difficulty.oppositionIntensity) {
        baseChance *= gameState.difficulty.oppositionIntensity;
    }
    
    return Math.min(baseChance, 0.8);
}

function executeFactionResponse(faction, factionState) {
    const responses = [];

    // Select response based on faction's response patterns
    Object.entries(faction.responses).forEach(([responseType, weight]) => {
        if (random() < weight) {
            responses.push(responseType);
        }
    });

    let totalImpact = 0;

    responses.forEach(responseType => {
        const impact = applyOppositionResponse(responseType, faction);
        totalImpact += impact;
    });

    // Update faction state
    factionState.lastResponse = gameState.round;
    factionState.responsePattern.push({
        round: gameState.round,
        responses: responses,
        impact: totalImpact
    });

    // Limit response pattern history
    if (factionState.responsePattern.length > 10) {
        factionState.responsePattern.shift();
    }

    return totalImpact;
}

function applyOppositionResponse(responseType, faction) {
    let impact = 0;

    switch (responseType) {
        case "capital_boost":
            gameState.tracks.capital += 3;
            impact = 2.0;
            break;
        
        case "social_drain":
            gameState.resources.social = Math.max(0, gameState.resources.social - 2);
            impact = 1.5;
            break;
        
        case "infrastructure_tax":
            gameState.resources.infrastructure = Math.max(0, gameState.resources.infrastructure - 2);
            impact = 1.8;
            break;
        
        case "authority_boost":
            gameState.tracks.authority += 3;
            impact = 2.0;
            break;
        
        case "momentum_drain":
            gameState.resources.momentum = Math.max(0, gameState.resources.momentum - 3);
            impact = 1.5;
            break;
        
        case "strain_increase":
            gameState.tracks.strain += 2;
            impact = 1.8;
            break;
        
        case "infrastructure_decay":
            gameState.resources.infrastructure = Math.max(0, gameState.resources.infrastructure - 2);
            impact = 1.2;
            break;
        
        case "recovery_slow":
            // Reduce resource recovery next round
            gameState.resourceState.recoveryPenalty = 2;
            impact = 1.4;
            break;
    }

    log("OPPOSITION_RESPONSE_APPLIED", {
        faction: faction.name,
        responseType: responseType,
        impact: impact
    });

    return impact;
}

/* ================================================= */
/* ESCALATION SYSTEM                                 */
/* ================================================= */

export function checkEscalation() {
    let maxEscalation = 0;

    Object.entries(gameState.opposition.factions || {}).forEach(([factionId, factionState]) => {
        const faction = Object.values(factions).find(f => f.id === factionId);
        
        if (!faction) return;

        if (factionState.threatLevel >= faction.escalation.threshold) {
            const currentEscalation = Math.floor(factionState.threatLevel / faction.escalation.threshold);
            maxEscalation = Math.max(maxEscalation, currentEscalation);
        }
    });

    if (maxEscalation > gameState.opposition.escalationLevel) {
        gameState.opposition.escalationLevel = maxEscalation;

        log("ESCALATION_LEVEL_INCREASED", {
            newLevel: gameState.opposition.escalationLevel,
            maxLevel: maxEscalation
        });

        // Apply escalation effects
        applyEscalationEffects(maxEscalation);
    }
}

function applyEscalationEffects(level) {
    // Higher escalation levels increase the severity of opposition responses
    const penaltyMultiplier = 1 + (level * 0.1);
    
    log("ESCALATION_EFFECTS_APPLIED", {
        level: level,
        penaltyMultiplier: penaltyMultiplier
    });
}

/* ================================================= */
/* ADAPTIVE LEARNING                                 */
/* ================================================= */

export function updateOppositionLearning() {
    // Analyze player patterns and adjust faction responses
    const playerActions = analyzePlayerPatterns();

    Object.entries(gameState.opposition.factions || {}).forEach(([factionId, factionState]) => {
        const faction = Object.values(factions).find(f => f.id === factionId);

        if (!faction) return;

        // Adjust threat levels based on player behavior
        if (playerActions.favorsSolidarity && faction.id === "authoritarian") {
            factionState.threatLevel = Math.min(100, factionState.threatLevel + 2);
        }

        if (playerActions.buildsInfrastructure && faction.id === "statusquo") {
            factionState.threatLevel = Math.min(100, factionState.threatLevel + 2);
        }

        if (playerActions.increasesCapital && faction.id === "elite") {
            factionState.threatLevel = Math.min(100, factionState.threatLevel + 2);
        }
    });
}

function analyzePlayerPatterns() {
    // Analyze recent player actions to determine patterns
    // This is a simplified version - full implementation would track more history
    
    const tracks = gameState.tracks;
    const resources = gameState.resources;
    
    return {
        favorsSolidarity: tracks.solidarity > 12,
        buildsInfrastructure: resources.infrastructure > 10,
        increasesCapital: tracks.capital > 15,
        createsMomentum: resources.momentum > 8
    };
}

/* ================================================= */
/* UTILITY FUNCTIONS                                 */
/* ================================================= */

export function getOppositionStatus() {
    return {
        globalPushback: gameState.opposition.globalPushback,
        escalationLevel: gameState.opposition.escalationLevel,
        activeFactions: Object.values(gameState.opposition.factions)
            .filter(f => f.active)
            .map(f => f.threatLevel),
        cooldown: gameState.opposition.responseCooldown
    };
}

export function resetOppositionState() {
    gameState.opposition.globalPushback = 0;
    gameState.opposition.escalationLevel = 0;
    gameState.opposition.responseCooldown = 0;
    
    Object.values(gameState.opposition.factions).forEach(faction => {
        faction.threatLevel = 0;
        faction.influence = 0;
        faction.active = false;
        faction.responsePattern = [];
    });
}