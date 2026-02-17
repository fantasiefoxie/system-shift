/* ================================================= */
/* SYSTEM SHIFT – DECK SYSTEM (BRICK v2)            */
/* 54 Card Structured Deck                          */
/* ================================================= */

import { shuffle } from "./rng.js";
import { log } from "./logger.js";
import { gameState } from "./state.js";

/* ================================================= */
/* BASE DECK – 50 SUIT CARDS + 4 SYSTEM CARDS      */
/* ================================================= */

export const baseDeck = [

/* ================= CARE (10) ================= */

{ id: 101, suit: "care", title: "Public Clinic", effects: { care: 2 }, cost: 1 },
{ id: 102, suit: "care", title: "Universal Benefit", effects: { care: 3, strain: 1 }, cost: 2 },
{ id: 103, suit: "care", title: "Universal Healthcare", effects: { care: 4, strain: 2, surge: 1 }, cost: 3 },
{ id: 104, suit: "care", title: "Food Security Act", effects: { care: 3 }, cost: 2 },
{ id: 105, suit: "care", title: "Mental Health Drive", effects: { care: 2, solidarity: 1 }, cost: 2 },
{ id: 106, suit: "care", title: "Pension Reform", effects: { care: 2, capital: -1 }, cost: 2 },
{ id: 107, suit: "care", title: "Childcare Expansion", effects: { care: 3, strain: 1 }, cost: 2 },
{ id: 108, suit: "care", title: "Hospital Upgrade", effects: { care: 4 }, cost: 3 },
{ id: 109, suit: "care", title: "Worker Safety Law", effects: { care: 2, solidarity: 1 }, cost: 2 },
{ id: 110, suit: "care", title: "Emergency Relief Fund", effects: { care: 3, capital: -2 }, cost: 3 },

/* ================= CLIMATE (10) ================= */

{ id: 201, suit: "climate", title: "Tree Cover", effects: { climate: 2 }, cost: 1 },
{ id: 202, suit: "climate", title: "Public Transit", effects: { climate: 3, strain: 1 }, cost: 2 },
{ id: 203, suit: "climate", title: "Fossil Exit Plan", effects: { climate: 4, strain: 2, capital: -1 }, cost: 3 },
{ id: 204, suit: "climate", title: "Urban Green Zones", effects: { climate: 2, care: 1 }, cost: 2 },
{ id: 205, suit: "climate", title: "Clean Water Initiative", effects: { climate: 3 }, cost: 2 },
{ id: 206, suit: "climate", title: "Renewable Grid", effects: { climate: 4, strain: 1 }, cost: 3 },
{ id: 207, suit: "climate", title: "Plastic Ban", effects: { climate: 2, strain: 1 }, cost: 1 },
{ id: 208, suit: "climate", title: "Agricultural Reform", effects: { climate: 3, capital: -1 }, cost: 2 },
{ id: 209, suit: "climate", title: "Climate Treaty", effects: { climate: 4, strain: 2 }, cost: 3 },
{ id: 210, suit: "climate", title: "Rewilding Program", effects: { climate: 3 }, cost: 2 },

/* ================= SOLIDARITY (10) ================= */

{ id: 301, suit: "solidarity", title: "Local Assembly", effects: { solidarity: 2 }, cost: 1 },
{ id: 302, suit: "solidarity", title: "Labor Rights", effects: { solidarity: 3, strain: 1 }, cost: 2 },
{ id: 303, suit: "solidarity", title: "General Strike", effects: { solidarity: 4, strain: 2, surge: 2 }, cost: 3 },
{ id: 304, suit: "solidarity", title: "Public Forum", effects: { solidarity: 2 }, cost: 1 },
{ id: 305, suit: "solidarity", title: "Union Expansion", effects: { solidarity: 3 }, cost: 2 },
{ id: 306, suit: "solidarity", title: "Community Media", effects: { solidarity: 2, authority: -1 }, cost: 2 },
{ id: 307, suit: "solidarity", title: "Housing Cooperative", effects: { solidarity: 3, capital: -1 }, cost: 2 },
{ id: 308, suit: "solidarity", title: "Participatory Budget", effects: { solidarity: 4 }, cost: 3 },
{ id: 309, suit: "solidarity", title: "Grassroots Campaign", effects: { solidarity: 2, surge: 1 }, cost: 2 },
{ id: 310, suit: "solidarity", title: "Public Petition Surge", effects: { solidarity: 3, strain: 1 }, cost: 2 },

/* ================= AUTHORITY (10) ================= */

{ id: 401, suit: "authority", title: "Transparency Act", effects: { authority: -1, solidarity: 1 }, cost: 2 },
{ id: 402, suit: "authority", title: "Anti-Corruption Drive", effects: { authority: -2, care: 1 }, cost: 3 },
{ id: 403, suit: "authority", title: "Decentralization Reform", effects: { authority: -2, solidarity: 2 }, cost: 3 },
{ id: 404, suit: "authority", title: "Civic Oversight Board", effects: { authority: -1 }, cost: 2 },
{ id: 405, suit: "authority", title: "Judicial Reform", effects: { authority: -2 }, cost: 3 },
{ id: 406, suit: "authority", title: "Open Data Initiative", effects: { authority: -1, care: 1 }, cost: 2 },
{ id: 407, suit: "authority", title: "Whistleblower Protection", effects: { authority: -1, strain: 1 }, cost: 2 },
{ id: 408, suit: "authority", title: "Electoral Reform", effects: { authority: -2, solidarity: 1 }, cost: 3 },
{ id: 409, suit: "authority", title: "Civil Liberties Defense", effects: { authority: -1, strain: 1 }, cost: 2 },
{ id: 410, suit: "authority", title: "Term Limits Law", effects: { authority: -2 }, cost: 3 },

/* ================= CAPITAL (10) ================= */

{ id: 501, suit: "capital", title: "Progressive Tax", effects: { capital: -2, care: 1 }, cost: 2 },
{ id: 502, suit: "capital", title: "Corporate Regulation", effects: { capital: -2, strain: 1 }, cost: 2 },
{ id: 503, suit: "capital", title: "Public Banking", effects: { capital: -3, care: 2 }, cost: 3 },
{ id: 504, suit: "capital", title: "Minimum Wage Law", effects: { capital: -1, care: 2 }, cost: 2 },
{ id: 505, suit: "capital", title: "Debt Relief Program", effects: { capital: -2, solidarity: 1 }, cost: 2 },
{ id: 506, suit: "capital", title: "Wealth Transparency Act", effects: { capital: -1, authority: -1 }, cost: 2 },
{ id: 507, suit: "capital", title: "Capital Controls", effects: { capital: -3, strain: 2 }, cost: 3 },
{ id: 508, suit: "capital", title: "Cooperative Investment", effects: { capital: -2, solidarity: 2 }, cost: 3 },
{ id: 509, suit: "capital", title: "Anti-Monopoly Breakup", effects: { capital: -3, authority: -1 }, cost: 3 },
{ id: 510, suit: "capital", title: "Public Infrastructure Push", effects: { capital: -2, climate: 1 }, cost: 2 },

/* ================= SYSTEM (4) ================= */

{ id: 901, suit: "system", title: "Emergency Spending", effects: { care: 2, strain: 2, capital: -3 }, cost: 2 },
{ id: 902, suit: "system", title: "Security Crackdown", effects: { authority: 2, strain: -1, solidarity: -1 }, cost: 2 },
{ id: 903, suit: "system", title: "Capital Injection", effects: { capital: 3, strain: 2 }, cost: 2 },
{ id: 904, suit: "system", title: "National Referendum", effects: { solidarity: 3, strain: 1 }, cost: 3 }

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