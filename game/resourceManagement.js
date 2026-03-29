/* ================================================= */
/* SYSTEM SHIFT – RESOURCE MANAGEMENT SYSTEM v1.0    */
/* Multi-Resource Economy with Strategic Depth       */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";

/* ================================================= */
/* RESOURCE DEFINITIONS                              */
/* ================================================= */

export const resourceTypes = {
    POLITICAL_CAPITAL: {
        id: "political",
        name: "Political Capital",
        description: "Influence within institutions",
        color: "#f59e0b",
        max: 10,
        recovery: 2
    },
    SOCIAL_CAPITAL: {
        id: "social",
        name: "Social Capital", 
        description: "Trust and legitimacy",
        color: "#3b82f6",
        max: 10,
        recovery: 2
    },
    MOMENTUM: {
        id: "momentum",
        name: "Momentum",
        description: "Collective energy and timing",
        color: "#22c55e",
        max: 15,
        recovery: 1
    },
    INFRASTRUCTURE: {
        id: "infrastructure",
        name: "Infrastructure",
        description: "Permanent capabilities",
        color: "#eab308",
        max: 20,
        recovery: 0 // Permanent, doesn't recover
    }
};

/* ================================================= */
/* INITIALIZATION                                    */
/* ================================================= */

export function initResourceSystem() {
    
    gameState.resources = {
        political: 5,
        social: 5,
        momentum: 0,
        infrastructure: 0
    };

    gameState.resourceState = {
        momentumDecay: true, // Whether momentum decays each round
        infrastructureMaintenance: 0, // Cost to maintain infrastructure
        resourceBonuses: {}, // Temporary bonuses to resources
        resourcePenalties: {} // Temporary penalties to resources
    };

    log("RESOURCE_SYSTEM_INIT", {
        resources: gameState.resources,
        state: gameState.resourceState
    });
}

/* ================================================= */
/* RESOURCE MANAGEMENT                               */
/* ================================================= */

export function getResource(resourceType) {
    return gameState.resources[resourceType] || 0;
}

export function setResource(resourceType, value) {
    const max = resourceTypes[resourceType.toUpperCase()]?.max || 10;
    gameState.resources[resourceType] = Math.max(0, Math.min(max, value));
    
    log("RESOURCE_SET", {
        type: resourceType,
        value: gameState.resources[resourceType],
        max
    });
}

export function addResource(resourceType, amount) {
    const current = getResource(resourceType);
    setResource(resourceType, current + amount);
}

export function consumeResource(resourceType, amount) {
    const current = getResource(resourceType);
    if (current < amount) {
        log("RESOURCE_INSUFFICIENT", {
            type: resourceType,
            required: amount,
            available: current
        });
        return false;
    }
    
    setResource(resourceType, current - amount);
    log("RESOURCE_CONSUMED", {
        type: resourceType,
        amount,
        remaining: getResource(resourceType)
    });
    
    return true;
}

/* ================================================= */
/* MULTI-RESOURCE COST CHECKING                      */
/* ================================================= */

export function canAffordCosts(costs) {
    for (let [resourceType, amount] of Object.entries(costs)) {
        if (getResource(resourceType) < amount) {
            return false;
        }
    }
    return true;
}

export function payCosts(costs) {
    const success = canAffordCosts(costs);
    if (!success) return false;

    for (let [resourceType, amount] of Object.entries(costs)) {
        consumeResource(resourceType, amount);
    }
    
    return true;
}

/* ================================================= */
/* OPPORTUNITY COST MECHANICS                        */
/* ================================================= */

export function applyOpportunityCosts(card) {
    const costs = {};
    
    // Base opportunity costs based on card type
    if (card.suit === "authority" || card.suit === "capital") {
        costs.political = (costs.political || 0) + 1;
    }
    
    if (card.suit === "solidarity" || card.suit === "care") {
        costs.social = (costs.social || 0) + 1;
    }
    
    if (card.tags && card.tags.includes("major")) {
        costs.momentum = (costs.momentum || 0) + 2;
    }
    
    // Risk cards have higher opportunity costs
    if (card.suit === "risk") {
        costs.political = (costs.political || 0) + 1;
        costs.social = (costs.social || 0) + 1;
    }
    
    // Hidden cards have uncertainty cost
    if (card.hidden) {
        costs.momentum = (costs.momentum || 0) + 1;
    }
    
    return costs;
}

/* ================================================= */
/* BURN MECHANICS                                    */
/* ================================================= */

export function applyBurnMechanics(card) {
    const burns = [];
    
    // Major cards may burn resources
    if (card.tags && card.tags.includes("major")) {
        if (Math.random() < 0.3) { // 30% chance to burn
            const burnType = Math.random() < 0.5 ? "political" : "social";
            burns.push({
                type: burnType,
                amount: 1,
                reason: "Major action burn"
            });
        }
    }
    
    // Risk cards have burn potential
    if (card.suit === "risk") {
        if (Math.random() < 0.4) { // 40% chance to burn
            burns.push({
                type: "momentum",
                amount: 2,
                reason: "Risk burn"
            });
        }
    }
    
    // Apply burns
    burns.forEach(burn => {
        const current = getResource(burn.type);
        const amount = Math.min(burn.amount, current);
        setResource(burn.type, current - amount);
        
        log("RESOURCE_BURNED", {
            type: burn.type,
            amount,
            reason: burn.reason
        });
    });
    
    return burns;
}

/* ================================================= */
/* INFRASTRUCTURE SYSTEM                             */
/* ================================================= */

export function buildInfrastructure(amount) {
    const current = getResource("infrastructure");
    const newAmount = current + amount;
    
    // Infrastructure can exceed normal max but has diminishing returns
    gameState.resources.infrastructure = Math.max(0, newAmount);
    
    log("INFRASTRUCTURE_BUILT", {
        amount,
        total: gameState.resources.infrastructure
    });
    
    // Apply maintenance cost
    gameState.resourceState.infrastructureMaintenance = 
        Math.floor(gameState.resources.infrastructure / 5);
}

export function applyInfrastructureMaintenance() {
    const maintenance = gameState.resourceState.infrastructureMaintenance;
    
    if (maintenance > 0) {
        // Maintenance cost comes from political capital first, then social
        let remainingCost = maintenance;
        
        const political = getResource("political");
        if (political >= remainingCost) {
            consumeResource("political", remainingCost);
            remainingCost = 0;
        } else {
            consumeResource("political", political);
            remainingCost -= political;
            
            const social = getResource("social");
            consumeResource("social", Math.min(remainingCost, social));
            remainingCost -= Math.min(remainingCost, social);
        }
        
        log("INFRASTRUCTURE_MAINTENANCE", {
            cost: maintenance,
            remaining: remainingCost
        });
    }
}

/* ================================================= */
/* DYNAMIC RECOVERY SYSTEM                           */
/* ================================================= */

export function calculateDynamicRecovery() {
    const recovery = {
        political: resourceTypes.POLITICAL_CAPITAL.recovery,
        social: resourceTypes.SOCIAL_CAPITAL.recovery,
        momentum: resourceTypes.MOMENTUM.recovery
    };
    
    const tracks = gameState.tracks;
    
    // Political capital recovery based on authority and capital tracks
    if (tracks.authority > 12) {
        recovery.political += 1;
    } else if (tracks.authority < 5) {
        recovery.political -= 1;
    }
    
    // Social capital recovery based on solidarity and care tracks
    if (tracks.solidarity > 12) {
        recovery.social += 1;
    } else if (tracks.solidarity < 5) {
        recovery.social -= 1;
    }
    
    // Momentum recovery based on surge and strain
    if (gameState.surge > 8) {
        recovery.momentum += 2;
    } else if (tracks.strain > 15) {
        recovery.momentum = 0; // No recovery under high strain
    }
    
    // Infrastructure provides passive benefits
    const infraBonus = Math.floor(gameState.resources.infrastructure / 4);
    recovery.political += infraBonus;
    recovery.social += infraBonus;
    
    return recovery;
}

export function applyResourceRecovery() {
    const recovery = calculateDynamicRecovery();
    
    // Apply recovery with caps
    Object.entries(recovery).forEach(([resourceType, amount]) => {
        if (amount > 0) {
            addResource(resourceType, amount);
        }
    });
    
    // Apply momentum decay if enabled
    if (gameState.resourceState.momentumDecay) {
        const momentum = getResource("momentum");
        if (momentum > 0) {
            setResource("momentum", momentum - 1);
        }
    }
    
    // Apply infrastructure maintenance
    applyInfrastructureMaintenance();
    
    log("RESOURCE_RECOVERY", {
        recovery,
        momentumDecay: gameState.resourceState.momentumDecay,
        maintenance: gameState.resourceState.infrastructureMaintenance
    });
}

/* ================================================= */
/* LONG-TERM PLANNING MECHANICS                     */
/* ================================================= */

export function setupDelayedEffect(card, effect) {
    if (!gameState.delayedEffects) {
        gameState.delayedEffects = [];
    }
    
    const delay = card.tags && card.tags.includes("major") ? 2 : 1;
    
    gameState.delayedEffects.push({
        cardId: card.id,
        effect: effect,
        roundsUntilTrigger: delay,
        triggered: false
    });
    
    log("DELAYED_EFFECT_SETUP", {
        cardId: card.id,
        delay,
        effect
    });
}

export function processDelayedEffects() {
    if (!gameState.delayedEffects) return;
    
    const triggeredEffects = [];
    
    gameState.delayedEffects.forEach(effect => {
        effect.roundsUntilTrigger--;
        
        if (effect.roundsUntilTrigger <= 0 && !effect.triggered) {
            effect.triggered = true;
            triggeredEffects.push(effect);
        }
    });
    
    // Apply triggered effects
    triggeredEffects.forEach(effect => {
        applyDelayedEffect(effect.effect);
    });
    
    // Remove triggered effects
    gameState.delayedEffects = gameState.delayedEffects.filter(e => !e.triggered);
    
    if (triggeredEffects.length > 0) {
        log("DELAYED_EFFECTS_TRIGGERED", {
            count: triggeredEffects.length,
            effects: triggeredEffects.map(e => e.effect)
        });
    }
}

function applyDelayedEffect(effect) {
    for (let [key, value] of Object.entries(effect)) {
        if (key === "resources") {
            Object.entries(value).forEach(([resourceType, amount]) => {
                addResource(resourceType, amount);
            });
        } else if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += value;
            if (key === "authority" || key === "capital") {
                gameState.tracks[key] = Math.max(0, gameState.tracks[key]);
            }
        }
    }
}

/* ================================================= */
/* RESOURCE STATE MANAGEMENT                         */
/* ================================================= */

export function resetResourceState() {
    gameState.resourceState.momentumDecay = true;
    gameState.resourceState.infrastructureMaintenance = 0;
    gameState.resourceState.resourceBonuses = {};
    gameState.resourceState.resourcePenalties = {};
}

export function applyResourceModifiers() {
    // Apply temporary bonuses/penalties
    Object.entries(gameState.resourceState.resourceBonuses).forEach(([resourceType, bonus]) => {
        addResource(resourceType, bonus);
    });
    
    Object.entries(gameState.resourceState.resourcePenalties).forEach(([resourceType, penalty]) => {
        consumeResource(resourceType, penalty);
    });
    
    // Clear modifiers after application
    gameState.resourceState.resourceBonuses = {};
    gameState.resourceState.resourcePenalties = {};
}

/* ================================================= */
/* UTILITY FUNCTIONS                                 */
/* ================================================= */

export function getResourceStatus() {
    return {
        current: { ...gameState.resources },
        max: {
            political: resourceTypes.POLITICAL_CAPITAL.max,
            social: resourceTypes.SOCIAL_CAPITAL.max,
            momentum: resourceTypes.MOMENTUM.max,
            infrastructure: resourceTypes.INFRASTRUCTURE.max
        },
        state: { ...gameState.resourceState }
    };
}

export function getEffectiveResourceAmount(resourceType) {
    let amount = getResource(resourceType);
    
    // Apply temporary modifiers
    if (gameState.resourceState.resourceBonuses[resourceType]) {
        amount += gameState.resourceState.resourceBonuses[resourceType];
    }
    
    if (gameState.resourceState.resourcePenalties[resourceType]) {
        amount -= gameState.resourceState.resourcePenalties[resourceType];
    }
    
    return Math.max(0, amount);
}