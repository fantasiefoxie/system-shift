/* ================================================= */
/* SYSTEM SHIFT – DECK SYSTEM (Research Core v2)    */
/* 54 Card Structured Deck                          */
/* ================================================= */

import { shuffle } from "./rng.js";
import { log } from "./logger.js";
import { gameState } from "./state.js";

/* ================================================= */
/* BASE DECK – 50 SUIT CARDS + 4 SYSTEM CARDS      */
/* ================================================= */

export const baseDeck = [

/* ================= WELLBEING (10) ================= */

{ id: 101, suit: "wellbeing", title: "Public Clinic", effects: { wellbeing: 2 }, cost: 1 },
{ id: 102, suit: "wellbeing", title: "Universal Benefit", effects: { wellbeing: 3, tension: 1 }, cost: 2 },
{ id: 103, suit: "wellbeing", title: "Universal Healthcare", effects: { wellbeing: 4, tension: 2, momentum: 1 }, cost: 3 },
{ id: 104, suit: "wellbeing", title: "Food Security Act", effects: { wellbeing: 3 }, cost: 2 },
{ id: 105, suit: "wellbeing", title: "Mental Health Drive", effects: { wellbeing: 2, community: 1 }, cost: 2 },
{ id: 106, suit: "wellbeing", title: "Pension Reform", effects: { wellbeing: 2, wealth: -1 }, cost: 2 },
{ id: 107, suit: "wellbeing", title: "Childcare Expansion", effects: { wellbeing: 3, tension: 1 }, cost: 2 },
{ id: 108, suit: "wellbeing", title: "Hospital Upgrade", effects: { wellbeing: 4 }, cost: 3 },
{ id: 109, suit: "wellbeing", title: "Worker Safety Law", effects: { wellbeing: 2, community: 1 }, cost: 2 },
{ id: 110, suit: "wellbeing", title: "Emergency Relief Fund", effects: { wellbeing: 3, wealth: -2 }, cost: 3 },

/* ================= PLANET (10) ================= */

{ id: 201, suit: "planet", title: "Tree Cover", effects: { planet: 2 }, cost: 1 },
{ id: 202, suit: "planet", title: "Public Transit", effects: { planet: 3, tension: 1 }, cost: 2 },
{ id: 203, suit: "planet", title: "Fossil Exit Plan", effects: { planet: 4, tension: 2, wealth: -1 }, cost: 3 },
{ id: 204, suit: "planet", title: "Urban Green Zones", effects: { planet: 2, wellbeing: 1 }, cost: 2 },
{ id: 205, suit: "planet", title: "Clean Water Initiative", effects: { planet: 3 }, cost: 2 },
{ id: 206, suit: "planet", title: "Renewable Grid", effects: { planet: 4, tension: 1 }, cost: 3 },
{ id: 207, suit: "planet", title: "Plastic Ban", effects: { planet: 2, tension: 1 }, cost: 1 },
{ id: 208, suit: "planet", title: "Agricultural Reform", effects: { planet: 3, wealth: -1 }, cost: 2 },
{ id: 209, suit: "planet", title: "Climate Treaty", effects: { planet: 4, tension: 2 }, cost: 3 },
{ id: 210, suit: "planet", title: "Rewilding Program", effects: { planet: 3 }, cost: 2 },

/* ================= COMMUNITY (10) ================= */

{ id: 301, suit: "community", title: "Local Assembly", effects: { community: 2 }, cost: 1 },
{ id: 302, suit: "community", title: "Labor Rights", effects: { community: 3, tension: 1 }, cost: 2 },
{ id: 303, suit: "community", title: "General Strike", effects: { community: 4, tension: 2, momentum: 2 }, cost: 3 },
{ id: 304, suit: "community", title: "Public Forum", effects: { community: 2 }, cost: 1 },
{ id: 305, suit: "community", title: "Union Expansion", effects: { community: 3 }, cost: 2 },
{ id: 306, suit: "community", title: "Community Media", effects: { community: 2, power: -1 }, cost: 2 },
{ id: 307, suit: "community", title: "Housing Cooperative", effects: { community: 3, wealth: -1 }, cost: 2 },
{ id: 308, suit: "community", title: "Participatory Budget", effects: { community: 4 }, cost: 3 },
{ id: 309, suit: "community", title: "Grassroots Campaign", effects: { community: 2, momentum: 1 }, cost: 2 },
{ id: 310, suit: "community", title: "Public Petition Surge", effects: { community: 3, tension: 1 }, cost: 2 },

/* ================= POWER (10) ================= */

{ id: 401, suit: "power", title: "Transparency Act", effects: { power: -1, community: 1 }, cost: 2 },
{ id: 402, suit: "power", title: "Anti-Corruption Drive", effects: { power: -2, wellbeing: 1 }, cost: 3 },
{ id: 403, suit: "power", title: "Decentralization Reform", effects: { power: -2, community: 2 }, cost: 3 },
{ id: 404, suit: "power", title: "Civic Oversight Board", effects: { power: -1 }, cost: 2 },
{ id: 405, suit: "power", title: "Judicial Reform", effects: { power: -2 }, cost: 3 },
{ id: 406, suit: "power", title: "Open Data Initiative", effects: { power: -1, wellbeing: 1 }, cost: 2 },
{ id: 407, suit: "power", title: "Whistleblower Protection", effects: { power: -1, tension: 1 }, cost: 2 },
{ id: 408, suit: "power", title: "Electoral Reform", effects: { power: -2, community: 1 }, cost: 3 },
{ id: 409, suit: "power", title: "Civil Liberties Defense", effects: { power: -1, tension: 1 }, cost: 2 },
{ id: 410, suit: "power", title: "Term Limits Law", effects: { power: -2 }, cost: 3 },

/* ================= WEALTH (10) ================= */

{ id: 501, suit: "wealth", title: "Progressive Tax", effects: { wealth: -2, wellbeing: 1 }, cost: 2 },
{ id: 502, suit: "wealth", title: "Corporate Regulation", effects: { wealth: -2, tension: 1 }, cost: 2 },
{ id: 503, suit: "wealth", title: "Public Banking", effects: { wealth: -3, wellbeing: 2 }, cost: 3 },
{ id: 504, suit: "wealth", title: "Minimum Wage Law", effects: { wealth: -1, wellbeing: 2 }, cost: 2 },
{ id: 505, suit: "wealth", title: "Debt Relief Program", effects: { wealth: -2, community: 1 }, cost: 2 },
{ id: 506, suit: "wealth", title: "Wealth Transparency Act", effects: { wealth: -1, power: -1 }, cost: 2 },
{ id: 507, suit: "wealth", title: "Capital Controls", effects: { wealth: -3, tension: 2 }, cost: 3 },
{ id: 508, suit: "wealth", title: "Cooperative Investment", effects: { wealth: -2, community: 2 }, cost: 3 },
{ id: 509, suit: "wealth", title: "Anti-Monopoly Breakup", effects: { wealth: -3, power: -1 }, cost: 3 },
{ id: 510, suit: "wealth", title: "Public Infrastructure Push", effects: { wealth: -2, planet: 1 }, cost: 2 },

/* ================= SYSTEM (4) ================= */

{ id: 901, suit: "system", title: "Emergency Spending", effects: { wellbeing: 2, tension: 2, wealth: -3 }, cost: 2 },
{ id: 902, suit: "system", title: "Security Crackdown", effects: { power: 2, tension: -1, community: -1 }, cost: 2 },
{ id: 903, suit: "system", title: "Capital Injection", effects: { wealth: 3, tension: 2 }, cost: 2 },
{ id: 904, suit: "system", title: "National Referendum", effects: { community: 3, tension: 1 }, cost: 3 }

];

/* ================================================= */
/* SHUFFLE                                          */
/* ================================================= */

export function shuffleDeck(deck) {

    const shuffled = shuffle([...deck]);

    log("DECK_SHUFFLED", {
        size: shuffled.length
    });

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
        log("CARD_DRAWN", {
            id: card.id,
            title: card.title
        });
    }

    return card;
}