/* ================================================= */
/* SYSTEM SHIFT – OPPOSITION ACTIONS v1.0            */
/* Dynamic Opposition Card System                     */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";
import { random, randomInt } from "./rng.js";
import { factions } from "./oppositionSystem.js";

/* ================================================= */
/* OPPOSITION CARD DEFINITIONS                       */
/* ================================================= */

export const oppositionCards = {
    // Elite Interests Cards
    ELITE_TAX_INCREASE: {
        id: "elite_tax_increase",
        title: "Tax Increase on Infrastructure",
        suit: "capital",
        cost: 0,
        effects: {
            infrastructure: -2,
            capital: +1
        },
        description: "Elite interests impose new taxes on infrastructure projects",
        faction: "elite",
        trigger: "infrastructure_gain"
    },

    ELITE_MARKET_CRASH: {
        id: "elite_market_crash", 
        title: "Market Instability",
        suit: "capital",
        cost: 0,
        effects: {
            capital: -3,
            surge: +1
        },
        description: "Financial markets react negatively to progressive policies",
        faction: "elite",
        trigger: "solidarity_gain"
    },

    ELITE_MEDIA_CAMPAIGN: {
        id: "elite_media_campaign",
        title: "Negative Media Campaign",
        suit: "authority",
        cost: 0,
        effects: {
            social: -2,
            authority: +1
        },
        description: "Elite-backed media undermines public trust",
        faction: "elite",
        trigger: "care_gain"
    },

    // Authoritarian Control Cards
    AUTHORITARIAN_SURVEILLANCE: {
        id: "authoritarian_surveillance",
        title: "Expanded Surveillance",
        suit: "authority",
        cost: 0,
        effects: {
            authority: +2,
            momentum: -2,
            strain: +1
        },
        description: "Government expands surveillance to maintain control",
        faction: "authoritarian",
        trigger: "solidarity_gain"
    },

    AUTHORITARIAN_CENSORSHIP: {
        id: "authoritarian_censorship",
        title: "Information Control",
        suit: "authority",
        cost: 0,
        effects: {
            momentum: -3,
            authority: +1,
            surge: +1
        },
        description: "Authorities restrict information flow",
        faction: "authoritarian",
        trigger: "momentum_gain"
    },

    AUTHORITARIAN_MILITARIZATION: {
        id: "authoritarian_militarization",
        title: "Security State Expansion",
        suit: "authority",
        cost: 0,
        effects: {
            authority: +3,
            social: -1,
            strain: +2
        },
        description: "Increased militarization to suppress dissent",
        faction: "authoritarian",
        trigger: "surge_gain"
    },

    // Status Quo Preservation Cards
    STATUS_QUO_BUROCRACY: {
        id: "status_quo_bureaucracy",
        title: "Bureaucratic Obstruction",
        suit: "authority",
        cost: 0,
        effects: {
            infrastructure: -1,
            momentum: -1,
            surge: +1
        },
        description: "Institutional inertia slows down change",
        faction: "statusquo",
        trigger: "infrastructure_gain"
    },

    STATUS_QUO_ECONOMIC_SHOCK: {
        id: "status_quo_economic_shock",
        title: "Economic Disruption",
        suit: "capital",
        cost: 0,
        effects: {
            capital: -2,
            momentum: -1,
            surge: +2
        },
        description: "Market forces react unpredictably to rapid change",
        faction: "statusquo",
        trigger: "rapid_change"
    },

    STATUS_QUO_SOCIAL_DIVISION: {
        id: "status_quo_social_division",
        title: "Social Fragmentation",
        suit: "solidarity",
        cost: 0,
        effects: {
            solidarity: -2,
            social: -1,
            strain: +1
        },
        description: "Rapid change creates social divisions",
        faction: "statusquo",
        trigger: "track_imbalance"
    }
};

/* ================================================= */
/* INITIALIZATION                                    */
/* ================================================= */

export function initOppositionActions() {
    gameState.oppositionDeck = [];
    gameState.oppositionHand = [];
    gameState.oppositionDiscard = [];
    
    log("OPPOSITION_ACTIONS_INIT", {
        totalCards: Object.keys(oppositionCards).length
    });
}

/* ================================================= */
/* CARD GENERATION                                   */
/* ================================================= */

export function generateOppositionCard(factionId, triggerType) {
    const factionCards = Object.values(oppositionCards).filter(
        card => card.faction === factionId && card.trigger === triggerType
    );

    if (factionCards.length === 0) {
        // Fallback to any card from the faction
        const fallbackCards = Object.values(oppositionCards).filter(
            card => card.faction === factionId
        );
        return fallbackCards[randomInt(fallbackCards.length)];
    }

    return factionCards[randomInt(factionCards.length)];
}

/* ================================================= */
/* OPPOSITION TURN                                   */
/* ================================================= */

export function oppositionTurn() {
    if (gameState.gameOver) return;

    const oppositionStatus = getOppositionStatus();
    
    // Only act if there's significant opposition
    if (oppositionStatus.globalPushback < 5) return;

    // Determine which factions are active
    const activeFactions = getActiveFactions();
    
    if (activeFactions.length === 0) return;

    // Each active faction gets a chance to act
    activeFactions.forEach(factionId => {
        const shouldAct = determineFactionAction(factionId);
        
        if (shouldAct) {
            executeFactionAction(factionId);
        }
    });
}

function getActiveFactions() {
    return Object.entries(gameState.opposition?.factions || {})
        .filter(([id, state]) => state?.active)
        .map(([id]) => id);
}

function determineFactionAction(factionId) {
    const factionState = gameState.opposition.factions[factionId];
    const faction = Object.values(factions).find(f => f.id === factionId);

    if (!faction) return false;

    // Base chance increases with threat level
    let actionChance = 0.2 + (factionState.threatLevel / 100);

    // Reduce chance if recently acted
    const timeSinceLast = gameState.round - factionState.lastResponse;
    if (timeSinceLast < 2) {
        actionChance *= 0.3;
    }

    return random() < actionChance;
}

function executeFactionAction(factionId) {
    const faction = Object.values(factions).find(f => f.id === factionId);
    const factionState = gameState.opposition.factions[factionId];

    if (!faction) return;

    // Determine trigger based on recent player actions
    const triggerType = determineTriggerType();

    // Generate appropriate opposition card
    const card = generateOppositionCard(factionId, triggerType);

    if (card) {
        applyOppositionCard(card);

        log("OPPOSITION_ACTION", {
            faction: faction.name,
            card: card.title,
            trigger: card.trigger
        });

        // Update faction state
        factionState.lastResponse = gameState.round;
    }
}

function determineTriggerType() {
    // Analyze recent player actions to determine appropriate trigger
    const tracks = gameState.tracks;
    const resources = gameState.resources;
    
    // Check for recent gains that would trigger opposition
    if (tracks.solidarity > 12) return "solidarity_gain";
    if (tracks.care > 12) return "care_gain";
    if (resources.infrastructure > 8) return "infrastructure_gain";
    if (resources.momentum > 10) return "momentum_gain";
    if (tracks.surge > 8) return "surge_gain";
    
    // Check for imbalances
    const social = (tracks.care + tracks.solidarity) / 2;
    const control = (tracks.authority + tracks.capital) / 2;
    if (Math.abs(control - social) > 6) return "track_imbalance";
    
    // Default to rapid change
    return "rapid_change";
}

/* ================================================= */
/* CARD EFFECTS                                      */
/* ================================================= */

function applyOppositionCard(card) {
    log("OPPOSITION_CARD_PLAYED", {
        card: card.title,
        effects: card.effects
    });

    // Apply card effects to game state
    Object.entries(card.effects).forEach(([key, value]) => {
        if (key === "political") {
            gameState.resources.political = Math.max(0, gameState.resources.political + value);
        } else if (key === "social") {
            gameState.resources.social = Math.max(0, gameState.resources.social + value);
        } else if (key === "momentum") {
            gameState.resources.momentum = Math.max(0, gameState.resources.momentum + value);
        } else if (key === "infrastructure") {
            gameState.resources.infrastructure = Math.max(0, gameState.resources.infrastructure + value);
        } else if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += value;
            // Ensure tracks stay within bounds
            if (key === "authority" || key === "capital") {
                gameState.tracks[key] = Math.max(0, gameState.tracks[key]);
            } else {
                gameState.tracks[key] = Math.max(0, Math.min(20, gameState.tracks[key]));
            }
        }
    });

    // Add to discard pile
    gameState.oppositionDiscard.push(card);
}

/* ================================================= */
/* INTEGRATION WITH ROUND SYSTEM                     */
/* ================================================= */

export function processOppositionPhase() {
    // This function is called during the round processing
    // It allows opposition to act after player actions
    
    if (gameState.round > 1) {
        oppositionTurn();
    }
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

export function getOppositionDeckSize() {
    return gameState.oppositionDeck.length;
}

export function getOppositionHandSize() {
    return gameState.oppositionHand.length;
}

export function getOppositionDiscardSize() {
    return gameState.oppositionDiscard.length;
}

/* ================================================= */
/* TESTING & DEBUG                                   */
/* ================================================= */

export function debugOppositionState() {
    return {
        deckSize: getOppositionDeckSize(),
        handSize: getOppositionHandSize(),
        discardSize: getOppositionDiscardSize(),
        status: getOppositionStatus(),
        factions: gameState.opposition.factions
    };
}

export function simulateOppositionTurn() {
    // For testing purposes - simulates an opposition turn
    const initialPushback = gameState.opposition.globalPushback;
    
    oppositionTurn();
    
    const finalPushback = gameState.opposition.globalPushback;
    
    log("OPPOSITION_SIMULATION", {
        initialPushback,
        finalPushback,
        delta: finalPushback - initialPushback
    });
}