/* ================================================= */
/* SYSTEM SHIFT – CARD INTERACTION SYSTEM v1.0       */
/* Adds combos, synergies, counters, and hidden info */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";

/* ================================================= */
/* CARD INTERACTION DEFINITIONS                      */
/* ================================================= */

export const cardInteractions = {
    /* ================= COMBOS ================= */
    combos: [
        {
            name: "Universal Care Package",
            cards: [101, 104, 108], // Public Clinic + Food Security + Hospital Upgrade
            description: "Healthcare Infrastructure",
            bonus: { care: 3, strain: -2 },
            trigger: "When played in same round"
        },
        {
            name: "Green New Deal",
            cards: [201, 202, 206], // Tree Cover + Public Transit + Renewable Grid
            description: "Eco-Infrastructure",
            bonus: { climate: 4, capital: -1, surge: 1 },
            trigger: "When played in same round"
        },
        {
            name: "Solidarity Network",
            cards: [301, 304, 308], // Local Assembly + Public Forum + Participatory Budget
            description: "Democratic Infrastructure",
            bonus: { solidarity: 4, authority: -1, surge: 2 },
            trigger: "When played in same round"
        },
        {
            name: "Anti-Corruption Sweep",
            cards: [402, 405, 407], // Anti-Corruption + Judicial Reform + Whistleblower Protection
            description: "Institutional Reform",
            bonus: { authority: -3, care: 2, strain: -1 },
            trigger: "When played in same round"
        },
        {
            name: "Wealth Redistribution",
            cards: [501, 505, 508], // Progressive Tax + Debt Relief + Cooperative Investment
            description: "Economic Justice",
            bonus: { capital: -4, care: 2, solidarity: 2 },
            trigger: "When played in same round"
        }
    ],

    /* ================= SYNERGIES ================= */
    synergies: [
        {
            name: "Care & Climate",
            condition: (card1, card2) => 
                (card1.suit === "care" && card2.suit === "climate") ||
                (card1.suit === "climate" && card2.suit === "care"),
            bonus: { care: 1, climate: 1 },
            description: "Health and environment reinforce each other"
        },
        {
            name: "Solidarity & Authority",
            condition: (card1, card2) => 
                (card1.suit === "solidarity" && card2.suit === "authority") ||
                (card1.suit === "authority" && card2.suit === "solidarity"),
            bonus: { solidarity: 1, authority: -1 },
            description: "Democratic oversight reduces authoritarianism"
        },
        {
            name: "Capital & Care",
            condition: (card1, card2) => 
                (card1.suit === "capital" && card2.suit === "care") ||
                (card1.suit === "care" && card2.suit === "capital"),
            bonus: { capital: -1, care: 1 },
            description: "Investment in care reduces capital concentration"
        }
    ],

    /* ================= COUNTERS ================= */
    counters: [
        {
            name: "Elite Resistance",
            condition: (playedCard, targetCard) => 
                playedCard.suit === "capital" && targetCard.suit === "solidarity",
            penalty: { solidarity: -1, surge: -1 },
            description: "Capital interests resist solidarity gains"
        },
        {
            name: "Authoritarian Crackdown",
            condition: (playedCard, targetCard) => 
                playedCard.suit === "authority" && targetCard.suit === "solidarity",
            penalty: { solidarity: -2, strain: 1 },
            description: "Authority suppresses solidarity movements"
        },
        {
            name: "Climate Denial",
            condition: (playedCard, targetCard) => 
                playedCard.suit === "capital" && targetCard.suit === "climate",
            penalty: { climate: -1, strain: 1 },
            description: "Capital interests resist climate action"
        }
    ]
};

/* ================================================= */
/* STATE TRACKING FOR INTERACTIONS                   */
/* ================================================= */

export function initInteractionState() {
    gameState.interactionState = {
        roundCardsPlayed: [], // Cards played this round
        comboTriggers: [],    // Active combo triggers
        synergyPairs: [],     // Active synergy pairs
        counterEffects: [],   // Active counter effects
        hiddenCards: [],      // Face-down cards in hand
        cardKnowledge: {}     // Player knowledge of card effects
    };
}

/* ================================================= */
/* COMBO SYSTEM                                      */
/* ================================================= */

export function checkComboTriggers(card) {
    const results = [];
    
    // Add current card to round tracking
    gameState.interactionState.roundCardsPlayed.push(card.id);
    
    // Check for completed combos
    cardInteractions.combos.forEach(combo => {
        const hasAllCards = combo.cards.every(cardId => 
            gameState.interactionState.roundCardsPlayed.includes(cardId)
        );
        
        if (hasAllCards) {
            results.push({
                type: "combo",
                name: combo.name,
                description: combo.description,
                bonus: combo.bonus,
                trigger: combo.trigger
            });
            
            // Remove cards from tracking to prevent double-triggering
            combo.cards.forEach(cardId => {
                const index = gameState.interactionState.roundCardsPlayed.indexOf(cardId);
                if (index > -1) gameState.interactionState.roundCardsPlayed.splice(index, 1);
            });
        }
    });
    
    return results;
}

export function applyComboBonus(bonus) {
    for (let [key, value] of Object.entries(bonus)) {
        if (key === "surge") {
            gameState.surge += value;
        } else if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += value;
            if (key === "authority" || key === "capital") {
                gameState.tracks[key] = Math.max(0, gameState.tracks[key]);
            }
        }
    }
    
    log("COMBO_BONUS_APPLIED", { bonus });
}

/* ================================================= */
/* SYNERGY SYSTEM                                    */
/* ================================================= */

export function checkSynergies(card) {
    const results = [];
    
    // Check against previously played cards this round
    gameState.interactionState.roundCardsPlayed.forEach(previousCardId => {
        const previousCard = findCardById(previousCardId);
        if (previousCard && previousCard.id !== card.id) {
            
            cardInteractions.synergies.forEach(synergy => {
                if (synergy.condition(card, previousCard)) {
                    results.push({
                        type: "synergy",
                        name: synergy.name,
                        description: synergy.description,
                        bonus: synergy.bonus
                    });
                }
            });
        }
    });
    
    return results;
}

export function applySynergyBonus(bonus) {
    for (let [key, value] of Object.entries(bonus)) {
        if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += value;
            if (key === "authority" || key === "capital") {
                gameState.tracks[key] = Math.max(0, gameState.tracks[key]);
            }
        }
    }
    
    log("SYNERGY_BONUS_APPLIED", { bonus });
}

/* ================================================= */
/* COUNTER SYSTEM                                    */
/* ================================================= */

export function checkCounters(card) {
    const results = [];
    
    // Check against opponent cards (simulated)
    // For now, we'll simulate opponent cards based on current game state
    const opponentCards = simulateOpponentCards();
    
    opponentCards.forEach(opponentCard => {
        cardInteractions.counters.forEach(counter => {
            if (counter.condition(card, opponentCard)) {
                results.push({
                    type: "counter",
                    name: counter.name,
                    description: counter.description,
                    penalty: counter.penalty
                });
            }
        });
    });
    
    return results;
}

function simulateOpponentCards() {
    // Simple simulation based on current game state
    const cards = [];
    
    if (gameState.tracks.capital > 15) {
        cards.push({ suit: "capital", effects: { capital: 2 } });
    }
    
    if (gameState.tracks.authority > 12) {
        cards.push({ suit: "authority", effects: { authority: 2 } });
    }
    
    if (gameState.tracks.strain > 15) {
        cards.push({ suit: "system", effects: { strain: 2 } });
    }
    
    return cards;
}

export function applyCounterPenalty(penalty) {
    for (let [key, value] of Object.entries(penalty)) {
        if (key === "surge") {
            gameState.surge += value;
        } else if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += value;
            gameState.tracks[key] = Math.max(0, gameState.tracks[key]);
        }
    }
    
    log("COUNTER_PENALTY_APPLIED", { penalty });
}

/* ================================================= */
/* HIDDEN INFORMATION SYSTEM                         */
/* ================================================= */

export function addHiddenCards() {
    // Add 2 face-down cards to hand
    const hiddenCount = Math.min(2, 5 - gameState.playerHand.length);
    
    for (let i = 0; i < hiddenCount; i++) {
        const card = drawHiddenCard();
        if (card) {
            gameState.interactionState.hiddenCards.push(card);
            gameState.playerHand.push({
                id: 0, // Hidden card ID
                suit: "hidden",
                title: "Face Down Card",
                effects: {},
                cost: 0,
                hidden: true,
                revealedEffect: card.effects,
                revealedCost: card.cost
            });
        }
    }
}

function drawHiddenCard() {
    if (gameState.deck.length === 0) {
        if (gameState.discardPile.length === 0) return null;
        gameState.deck = shuffleDeck(gameState.discardPile);
        gameState.discardPile = [];
    }
    
    return gameState.deck.pop();
}

export function revealHiddenCard(index) {
    const card = gameState.playerHand[index];
    if (!card || !card.hidden) return null;
    
    const revealedCard = gameState.interactionState.hiddenCards.shift();
    if (!revealedCard) return null;
    
    // Replace hidden card with revealed card
    gameState.playerHand[index] = {
        ...revealedCard,
        hidden: false
    };
    
    log("HIDDEN_CARD_REVEALED", { 
        cardId: revealedCard.id, 
        title: revealedCard.title 
    });
    
    return revealedCard;
}

/* ================================================= */
/* RANDOM EFFECTS SYSTEM                             */
/* ================================================= */

export function applyRandomEffects(card) {
    const effects = { ...card.effects };
    
    // Add random variance to certain effects
    if (card.suit === "system") {
        // System cards have 30% chance of random effects
        if (Math.random() < 0.3) {
            const randomEffect = getRandomSystemEffect();
            Object.assign(effects, randomEffect);
            
            log("RANDOM_EFFECT_TRIGGERED", { 
                cardId: card.id, 
                randomEffect 
            });
        }
    }
    
    return effects;
}

function getRandomSystemEffect() {
    const effects = [
        { strain: Math.floor(Math.random() * 3) - 1 }, // -1 to +2 strain
        { surge: Math.floor(Math.random() * 3) - 1 },  // -1 to +2 surge
        { capital: Math.floor(Math.random() * 3) - 1 }, // -1 to +2 capital
        { authority: Math.floor(Math.random() * 2) - 1 } // -1 to +1 authority
    ];
    
    return effects[Math.floor(Math.random() * effects.length)];
}

/* ================================================= */
/* UTILITY FUNCTIONS                                 */
/* ================================================= */

function findCardById(cardId) {
    // Find card in base deck by ID - simplified lookup
    // Care: 101-110, Climate: 201-210, Solidarity: 301-310, Authority: 401-410, Capital: 501-510, System: 901-904, Risk: 601-606, Hidden: 701-704
    if (cardId >= 101 && cardId <= 110) return { id: cardId, suit: "care" };
    if (cardId >= 201 && cardId <= 210) return { id: cardId, suit: "climate" };
    if (cardId >= 301 && cardId <= 310) return { id: cardId, suit: "solidarity" };
    if (cardId >= 401 && cardId <= 410) return { id: cardId, suit: "authority" };
    if (cardId >= 501 && cardId <= 510) return { id: cardId, suit: "capital" };
    if (cardId >= 901 && cardId <= 904) return { id: cardId, suit: "system" };
    if (cardId >= 601 && cardId <= 606) return { id: cardId, suit: "risk" };
    if (cardId >= 701 && cardId <= 704) return { id: cardId, suit: "hidden" };
    return { id: cardId, suit: "unknown" };
}

export function resetInteractionState() {
    gameState.interactionState.roundCardsPlayed = [];
    gameState.interactionState.comboTriggers = [];
    gameState.interactionState.synergyPairs = [];
    gameState.interactionState.counterEffects = [];
}

/* ================================================= */
/* INTEGRATION HELPERS                               */
/* ================================================= */

export function processCardInteractions(card) {
    const interactions = {
        combos: [],
        synergies: [],
        counters: [],
        randomEffects: null
    };
    
    // Check combos
    interactions.combos = checkComboTriggers(card);
    
    // Check synergies
    interactions.synergies = checkSynergies(card);
    
    // Check counters
    interactions.counters = checkCounters(card);
    
    // Apply random effects
    interactions.randomEffects = applyRandomEffects(card);
    
    return interactions;
}

export function applyAllInteractions(interactions) {
    // Apply combo bonuses
    interactions.combos.forEach(combo => {
        applyComboBonus(combo.bonus);
    });
    
    // Apply synergy bonuses
    interactions.synergies.forEach(synergy => {
        applySynergyBonus(synergy.bonus);
    });
    
    // Apply counter penalties
    interactions.counters.forEach(counter => {
        applyCounterPenalty(counter.penalty);
    });
}