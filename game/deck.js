/* ================================================= */
/* SYSTEM SHIFT – DECK SYSTEM (BRICK v2)            */
/* 54 Card Structured Deck                          */
/* ================================================= */

import { shuffle } from "./rng.js";
import { log } from "./logger.js";
import { gameState } from "./state.js";

/* ================================================= */
/* BASE DECK – 50 SUIT CARDS + 4 SYSTEM CARDS      */
/* Enhanced with interaction support                 */
/* ================================================= */

export const baseDeck = [

/* ================= CARE (10) ================= */

{ id: 101, suit: "care", title: "Public Clinic", effects: { care: 2 }, cost: 1, tags: ["reform", "healthcare", "incremental"] },
{ id: 102, suit: "care", title: "Universal Benefit", effects: { care: 3, strain: 2 }, cost: 2, tags: ["reform", "welfare", "moderate"] },
{ id: 103, suit: "care", title: "Universal Healthcare", effects: { care: 4, strain: 3, surge: 1 }, cost: 3, tags: ["reform", "healthcare", "disruptive"], synergy: { if_played_this_round: ["healthcare"], bonus: { care: 1, strain: -1 } } },
{ id: 104, suit: "care", title: "Food Security Act", effects: { care: 3 }, cost: 2, tags: ["reform", "welfare", "incremental"] },
{ id: 105, suit: "care", title: "Mental Health Drive", effects: { care: 2, solidarity: 1 }, cost: 2, tags: ["reform", "healthcare", "incremental"] },
{ id: 106, suit: "care", title: "Pension Reform", effects: { care: 2, capital: -1, strain: 1 }, cost: 2, tags: ["reform", "welfare", "moderate"] },
{ id: 107, suit: "care", title: "Childcare Expansion", effects: { care: 3, strain: 2 }, cost: 2, tags: ["reform", "welfare", "moderate"] },
{ id: 108, suit: "care", title: "Hospital Upgrade", effects: { care: 4 }, cost: 3, tags: ["reform", "healthcare", "moderate"] },
{ id: 109, suit: "care", title: "Worker Safety Law", effects: { care: 2, solidarity: 1 }, cost: 2, tags: ["reform", "labor", "incremental"] },
{ id: 110, suit: "care", title: "Emergency Relief Fund", effects: { care: 2, capital: -1, strain: 1 }, cost: 3, tags: ["reform", "welfare", "moderate"] },

/* ================= CLIMATE (10) ================= */

{ id: 201, suit: "climate", title: "Tree Cover", effects: { climate: 2 }, cost: 1, tags: ["reform", "climate", "incremental"] },
{ id: 202, suit: "climate", title: "Public Transit", effects: { climate: 3, strain: 2 }, cost: 2, tags: ["reform", "climate", "moderate"] },
{ id: 203, suit: "climate", title: "Fossil Exit Plan", effects: { climate: 3, strain: 3, capital: -1 }, cost: 3, tags: ["radical", "climate", "disruptive"], synergy: { if_played_this_round: ["climate"], bonus: { climate: 1 } } },
{ id: 204, suit: "climate", title: "Urban Green Zones", effects: { climate: 2, care: 1 }, cost: 2, tags: ["reform", "climate", "incremental"] },
{ id: 205, suit: "climate", title: "Clean Water Initiative", effects: { climate: 3 }, cost: 2, tags: ["reform", "climate", "incremental"] },
{ id: 206, suit: "climate", title: "Renewable Grid", effects: { climate: 4, strain: 2 }, cost: 3, tags: ["reform", "climate", "moderate"] },
{ id: 207, suit: "climate", title: "Plastic Ban", effects: { climate: 2, strain: 2 }, cost: 1, tags: ["reform", "climate", "moderate"] },
{ id: 208, suit: "climate", title: "Agricultural Reform", effects: { climate: 2, capital: -1, strain: 1 }, cost: 2, tags: ["reform", "climate", "moderate"] },
{ id: 209, suit: "climate", title: "Climate Treaty", effects: { climate: 4, strain: 3 }, cost: 3, tags: ["reform", "climate", "disruptive"] },
{ id: 210, suit: "climate", title: "Rewilding Program", effects: { climate: 3 }, cost: 2, tags: ["reform", "climate", "incremental"] },

/* ================= SOLIDARITY (10) ================= */

{ id: 301, suit: "solidarity", title: "Local Assembly", effects: { solidarity: 2 }, cost: 1, tags: ["grassroots", "organizing", "incremental"] },
{ id: 302, suit: "solidarity", title: "Labor Rights", effects: { solidarity: 3, strain: 2 }, cost: 2, tags: ["grassroots", "labor", "moderate"] },
{ id: 303, suit: "solidarity", title: "General Strike", effects: { solidarity: 4, strain: 3, surge: 2 }, cost: 3, tags: ["radical", "labor", "disruptive"], synergy: { if_played_this_round: ["labor"], bonus: { surge: 1, solidarity: 1 } } },
{ id: 304, suit: "solidarity", title: "Public Forum", effects: { solidarity: 2 }, cost: 1, tags: ["grassroots", "organizing", "incremental"] },
{ id: 305, suit: "solidarity", title: "Union Expansion", effects: { solidarity: 3 }, cost: 2, tags: ["grassroots", "labor", "incremental"] },
{ id: 306, suit: "solidarity", title: "Community Media", effects: { solidarity: 2, authority: -1, strain: 1 }, cost: 2, tags: ["grassroots", "organizing", "moderate"] },
{ id: 307, suit: "solidarity", title: "Housing Cooperative", effects: { solidarity: 2, capital: -1, strain: 1 }, cost: 3, tags: ["grassroots", "housing", "moderate"] },
{ id: 308, suit: "solidarity", title: "Participatory Budget", effects: { solidarity: 4 }, cost: 3, tags: ["grassroots", "organizing", "moderate"] },
{ id: 309, suit: "solidarity", title: "Grassroots Campaign", effects: { solidarity: 2, surge: 1 }, cost: 2, tags: ["grassroots", "organizing", "incremental"] },
{ id: 310, suit: "solidarity", title: "Public Petition Surge", effects: { solidarity: 3, strain: 2 }, cost: 2, tags: ["grassroots", "organizing", "moderate"] },

/* ================= AUTHORITY (10) ================= */

{ id: 401, suit: "authority", title: "Transparency Act", effects: { authority: -1, solidarity: 1 }, cost: 2, tags: ["reform", "institutional", "moderate"] },
{ id: 402, suit: "authority", title: "Anti-Corruption Drive", effects: { authority: -2, care: 1 }, cost: 3, tags: ["reform", "institutional", "moderate"] },
{ id: 403, suit: "authority", title: "Decentralization Reform", effects: { authority: -2, solidarity: 1, strain: 1 }, cost: 3, tags: ["radical", "institutional", "disruptive"], synergy: { if_played_this_round: ["institutional"], bonus: { solidarity: 1 } } },
{ id: 404, suit: "authority", title: "Civic Oversight Board", effects: { authority: -1 }, cost: 2, tags: ["reform", "institutional", "incremental"] },
{ id: 405, suit: "authority", title: "Judicial Reform", effects: { authority: -2 }, cost: 3, tags: ["reform", "institutional", "moderate"] },
{ id: 406, suit: "authority", title: "Open Data Initiative", effects: { authority: -1, care: 1 }, cost: 2, tags: ["reform", "institutional", "incremental"] },
{ id: 407, suit: "authority", title: "Whistleblower Protection", effects: { authority: -1, strain: 2 }, cost: 2, tags: ["reform", "institutional", "moderate"] },
{ id: 408, suit: "authority", title: "Electoral Reform", effects: { authority: -2, solidarity: 1 }, cost: 3, tags: ["reform", "institutional", "moderate"] },
{ id: 409, suit: "authority", title: "Civil Liberties Defense", effects: { authority: -1, strain: 2 }, cost: 2, tags: ["reform", "institutional", "moderate"] },
{ id: 410, suit: "authority", title: "Term Limits Law", effects: { authority: -2 }, cost: 3, tags: ["reform", "institutional", "moderate"] },

/* ================= CAPITAL (10) ================= */

{ id: 501, suit: "capital", title: "Progressive Tax", effects: { capital: -2, care: 1, strain: 1 }, cost: 2, tags: ["reform", "economic", "moderate"] },
{ id: 502, suit: "capital", title: "Corporate Regulation", effects: { capital: -2, strain: 2 }, cost: 2, tags: ["reform", "economic", "moderate"] },
{ id: 503, suit: "capital", title: "Public Banking", effects: { capital: -2, care: 1, strain: 2 }, cost: 3, tags: ["radical", "economic", "disruptive"], synergy: { if_played_this_round: ["economic"], bonus: { care: 1 } } },
{ id: 504, suit: "capital", title: "Minimum Wage Law", effects: { capital: -1, care: 2 }, cost: 2, tags: ["reform", "labor", "incremental"] },
{ id: 505, suit: "capital", title: "Debt Relief Program", effects: { capital: -2, solidarity: 1, strain: 1 }, cost: 2, tags: ["reform", "economic", "moderate"] },
{ id: 506, suit: "capital", title: "Wealth Transparency Act", effects: { capital: -1, authority: -1 }, cost: 2, tags: ["reform", "economic", "moderate"] },
{ id: 507, suit: "capital", title: "Capital Controls", effects: { capital: -3, strain: 3 }, cost: 3, tags: ["radical", "economic", "disruptive"] },
{ id: 508, suit: "capital", title: "Cooperative Investment", effects: { capital: -2, solidarity: 1, strain: 1 }, cost: 3, tags: ["radical", "economic", "moderate"] },
{ id: 509, suit: "capital", title: "Anti-Monopoly Breakup", effects: { capital: -2, authority: -1, strain: 2 }, cost: 4, tags: ["radical", "economic", "disruptive"] },
{ id: 510, suit: "capital", title: "Public Infrastructure Push", effects: { capital: -1, climate: 1, strain: 1 }, cost: 2, tags: ["reform", "economic", "moderate"] },

/* ================= SYSTEM (4) ================= */

{ id: 901, suit: "system", title: "Emergency Spending", effects: { care: 2, strain: 3, capital: -2 }, cost: 2, tags: ["crisis", "systemic"] },
{ id: 902, suit: "system", title: "Security Crackdown", effects: { authority: 3, strain: -2, solidarity: -2 }, cost: 2, tags: ["crisis", "authoritarian"] },
{ id: 903, suit: "system", title: "Capital Injection", effects: { capital: 4, strain: 2 }, cost: 2, tags: ["crisis", "systemic"] },
{ id: 904, suit: "system", title: "National Referendum", effects: { solidarity: 3, strain: 2 }, cost: 3, tags: ["crisis", "democratic"] },

/* ================= NEW: RISK/REWARD CARDS (6) ================= */

{ id: 601, suit: "risk", title: "High-Stakes Gamble", effects: { surge: 3, strain: 4 }, cost: 1, tags: ["gamble", "high-risk"], risk: "high", random: true },
{ id: 602, suit: "risk", title: "Revolutionary Uprising", effects: { solidarity: 5, authority: -3, strain: 5 }, cost: 2, tags: ["gamble", "major"], risk: "high", random: true },
{ id: 603, suit: "risk", title: "Market Crash", effects: { capital: -4, care: -2, surge: 2 }, cost: 1, tags: ["gamble", "crisis"], risk: "high", random: true },
{ id: 604, suit: "risk", title: "Political Scandal", effects: { authority: -4, solidarity: 2, strain: 2 }, cost: 1, tags: ["gamble"], risk: "medium", random: true },
{ id: 605, suit: "risk", title: "Climate Emergency", effects: { climate: -3, strain: 6, surge: 1 }, cost: 1, tags: ["gamble", "crisis"], risk: "high", random: true },
{ id: 606, suit: "risk", title: "Economic Boom", effects: { capital: 3, care: 1, strain: -1 }, cost: 2, tags: ["gamble"], risk: "medium", random: true },

/* ================= NEW: HIDDEN CARDS (4) ================= */

{ id: 701, suit: "hidden", title: "Unknown Policy", effects: {}, cost: 0, tags: ["hidden"], hidden: true, revealCost: 1 },
{ id: 702, suit: "hidden", title: "Secret Initiative", effects: {}, cost: 0, tags: ["hidden"], hidden: true, revealCost: 2 },
{ id: 703, suit: "hidden", title: "Covert Operation", effects: {}, cost: 0, tags: ["hidden"], hidden: true, revealCost: 1 },
{ id: 704, suit: "hidden", title: "Wildcard", effects: {}, cost: 0, tags: ["hidden"], hidden: true, revealCost: 3 },

/* ================= SCOUTING CARDS (5) ================= */

{ id: 705, suit: "system", title: "Investigative Journalism", effects: { authority: -1 }, cost: 2, tags: ["reform", "institutional"], onPlay: { reveal: "next_3_cards" } },
{ id: 706, suit: "system", title: "Intelligence Network", effects: { solidarity: 1 }, cost: 2, tags: ["grassroots", "organizing"], onPlay: { reveal: "hidden_tracks" } },
{ id: 707, suit: "system", title: "Polling Data", effects: {}, cost: 1, tags: ["reform"], onPlay: { reveal: "next_elite_action" } },
{ id: 708, suit: "system", title: "Wildcat Strike", effects: { solidarity: "2-5" }, cost: 2, tags: ["radical", "labor"] },
{ id: 709, suit: "system", title: "Spontaneous Protest", effects: { solidarity: "1-4", strain: "1-3" }, cost: 1, tags: ["grassroots"] },

/* ================= DECK EVOLUTION (10) ================= */

{ id: 801, suit: "system", title: "Nationalize Industry", effects: { capital: -5, authority: 3, strain: 4 }, cost: 4, tags: ["radical", "economic", "disruptive"], onPlay: { removeTag: "capital", addCard: 802 } },
{ id: 802, suit: "system", title: "State Enterprise", effects: { care: 2, capital: 1 }, cost: 2, tags: ["institutional", "economic"] },
{ id: 803, suit: "system", title: "Movement Split", effects: { solidarity: 3, strain: 3 }, cost: 2, tags: ["crisis", "organizing"], onPlay: { addCard: 804 } },
{ id: 804, suit: "system", title: "Internal Conflict", effects: { solidarity: -1, strain: 2 }, cost: 1, tags: ["crisis"] },
{ id: 805, suit: "system", title: "Debt Burden", effects: { leverage: -1, strain: 1 }, cost: 0, tags: ["crisis", "economic"] },
{ id: 806, suit: "system", title: "Radical Wing", effects: { solidarity: 2, strain: 2, surge: 1 }, cost: 2, tags: ["radical", "organizing"] },
{ id: 807, suit: "system", title: "Dual Power", effects: { solidarity: 4, authority: -3, strain: 3 }, cost: 4, tags: ["radical", "organizing", "disruptive"] },
{ id: 808, suit: "system", title: "Popular Assembly", effects: { solidarity: 3, authority: -1 }, cost: 2, tags: ["grassroots", "organizing"] },
{ id: 809, suit: "system", title: "Strike Fund", effects: { solidarity: 2, care: 1 }, cost: 2, tags: ["labor", "organizing"] },
{ id: 810, suit: "system", title: "Mutual Aid Network", effects: { care: 2, solidarity: 1 }, cost: 2, tags: ["grassroots", "organizing"] }

];

/* ================================================= */
/* SHUFFLE                                          */
/* ================================================= */

export function shuffleDeck(deck) {

    const shuffled = shuffle([...deck]);

    log("DECK_SHUFFLED", { size: shuffled.length });

    return shuffled;
}

/* ================================================= */
/* DRAW CARD                                        */
/* ================================================= */

export function drawCard() {

    if (gameState.deck.length === 0) {

        if (gameState.discardPile.length === 0) {
            return null;
        }

        gameState.deck = shuffleDeck(gameState.discardPile);
        gameState.discardPile = [];

        log("DISCARD_RESHUFFLED", {});
    }

    const card = gameState.deck.pop();

    if (card) {
        log("CARD_DRAWN", { id: card.id, title: card.title });
    }

    return card;
}

/* ================================================= */
/* DECK EVOLUTION                                   */
/* ================================================= */

export function addCardToDeck(cardId) {
    const card = baseDeck.find(c => c.id === cardId);
    if (card) {
        gameState.deck.push({ ...card });
        log("CARD_ADDED", { cardId });
    }
}

export function removeCardFromDeck(cardId) {
    const index = gameState.deck.findIndex(c => c.id === cardId);
    if (index !== -1) {
        gameState.deck.splice(index, 1);
        log("CARD_REMOVED", { cardId });
    }
}

export function removeCardsByTag(tag) {
    gameState.deck = gameState.deck.filter(c => !c.tags || !c.tags.includes(tag));
    log("TAG_REMOVED", { tag });
}
