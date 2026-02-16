/* ================================================= */
/* SYSTEM SHIFT – DECK (RESEARCH SAFE) */
/* ================================================= */

import { random, logEvent } from "./logger.js";


/* ================================================= */
/* BASE POLICY DECK */
/* ================================================= */

export const baseDeck = [

    /* ================= WELLBEING ================= */

    { id: 1, suit: "wellbeing", title: "Public Clinic",
      effects: { wellbeing: 2 }, risk: "low", cost: 1 },

    { id: 2, suit: "wellbeing", title: "Universal Benefit",
      effects: { wellbeing: 3, tension: 1 }, risk: "medium", cost: 2 },

    { id: 3, suit: "wellbeing", title: "Universal Healthcare",
      effects: { wellbeing: 4, tension: 2, momentum: 1 }, risk: "high", cost: 3 },


    /* ================= PLANET ================= */

    { id: 4, suit: "planet", title: "Tree Cover",
      effects: { planet: 2 }, risk: "low", cost: 1 },

    { id: 5, suit: "planet", title: "Public Transit",
      effects: { planet: 3, tension: 1 }, risk: "medium", cost: 2 },

    { id: 6, suit: "planet", title: "Fossil Exit Plan",
      effects: { planet: 4, tension: 2, wealth: -1 }, risk: "high", cost: 3 },


    /* ================= COMMUNITY ================= */

    { id: 7, suit: "community", title: "Local Assembly",
      effects: { community: 2 }, risk: "low", cost: 1 },

    { id: 8, suit: "community", title: "Labor Rights",
      effects: { community: 3, tension: 1 }, risk: "medium", cost: 2 },

    { id: 9, suit: "community", title: "General Strike",
      effects: { community: 4, tension: 2, momentum: 2 }, risk: "high", cost: 3 },


    /* ================= POWER ================= */

    { id: 10, suit: "power", title: "Oversight Reform",
      effects: { power: 2 }, risk: "low", cost: 1 },

    { id: 11, suit: "power", title: "Progressive Tax",
      effects: { power: 2, wealth: -1, tension: 1 }, risk: "medium", cost: 2 },

    { id: 12, suit: "power", title: "Wealth Tax",
      effects: { power: 3, wealth: -2, tension: 2 }, risk: "high", cost: 3 },


    /* ================= WEALTH ================= */

    { id: 13, suit: "wealth", title: "Public Investment",
      effects: { wealth: 2, planet: 1 }, risk: "low", cost: 1 },

    { id: 14, suit: "wealth", title: "Market Deregulation",
      effects: { wealth: 3, power: 1, tension: 1 }, risk: "medium", cost: 2 },

    { id: 15, suit: "wealth", title: "Privatization Drive",
      effects: { wealth: 4, power: 2, tension: 2, community: -1 },
      risk: "high", cost: 3 }
];


/* ================================================= */
/* SHUFFLE – SEEDED */
/* ================================================= */

export function shuffleDeck(deck) {

    const arr = [...deck];

    for (let i = arr.length - 1; i > 0; i--) {

        const j = Math.floor(random() * (i + 1));

        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    logEvent("deck_shuffled", {
        size: arr.length
    });

    return arr;
}


/* ================================================= */
/* DRAW HELPER */
/* ================================================= */

export function drawCard(state) {

    if (state.deck.length === 0) {

        if (state.discardPile.length === 0) {
            return null;
        }

        state.deck = shuffleDeck(state.discardPile);
        state.discardPile = [];

        logEvent("deck_reshuffled", {});
    }

    const card = state.deck.pop();

    if (card) {
        logEvent("card_drawn", {
            cardId: card.id,
            title: card.title
        });
    }

    return card;
}
