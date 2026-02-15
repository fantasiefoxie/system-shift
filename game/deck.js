// game/deck.js

/* ================================================= */
/* BASE POLICY DECK */
/* ================================================= */

export const baseDeck = [

    /* ================= WELLBEING ================= */

    { id: 1, suit: "wellbeing", title: "Public Clinic", effects: { wellbeing: 2 }, risk: "low", cost: 1 },

    { id: 2, suit: "wellbeing", title: "Universal Benefit", effects: { wellbeing: 3, tension: 1 }, risk: "medium", cost: 2 },

    { id: 3, suit: "wellbeing", title: "Universal Healthcare", effects: { wellbeing: 4, tension: 2, momentum: 1 }, risk: "high", cost: 3 },

    /* ================= PLANET ================= */

    { id: 4, suit: "planet", title: "Tree Cover", effects: { planet: 2 }, risk: "low", cost: 1 },

    { id: 5, suit: "planet", title: "Public Transit", effects: { planet: 3, tension: 1 }, risk: "medium", cost: 2 },

    { id: 6, suit: "planet", title: "Fossil Exit Plan", effects: { planet: 4, tension: 2, wealth: -1 }, risk: "high", cost: 3 },

    /* ================= COMMUNITY ================= */

    { id: 7, suit: "community", title: "Local Assembly", effects: { community: 2 }, risk: "low", cost: 1 },

    { id: 8, suit: "community", title: "Labor Rights", effects: { community: 3, tension: 1 }, risk: "medium", cost: 2 },

    { id: 9, suit: "community", title: "General Strike", effects: { community: 4, tension: 2, momentum: 2 }, risk: "high", cost: 3 },

    /* ================= POWER ================= */

    { id: 10, suit: "power", title: "Oversight Reform", effects: { power: 2 }, risk: "low", cost: 1 },

    { id: 11, suit: "power", title: "Progressive Tax", effects: { power: 2, wealth: -1, tension: 1 }, risk: "medium", cost: 2 },

    { id: 12, suit: "power", title: "Wealth Tax", effects: { power: 3, wealth: -2, tension: 2 }, risk: "high", cost: 3 },

    /* ================= WEALTH ================= */

    { id: 13, suit: "wealth", title: "Public Investment", effects: { wealth: 2, planet: 1 }, risk: "low", cost: 1 },

    { id: 14, suit: "wealth", title: "Market Deregulation", effects: { wealth: 3, power: 1, tension: 1 }, risk: "medium", cost: 2 },

    { id: 15, suit: "wealth", title: "Privatization Drive", effects: { wealth: 4, power: 2, tension: 2, community: -1 }, risk: "high", cost: 3 }
];


/* ================================================= */
/* JOKER POOL (PERMANENT STRUCTURAL MODIFIERS) */
/* ================================================= */

export const jokerPool = [

    {
        id: "J1",
        name: "Grassroots Engine",
        description: "+1 Momentum whenever you play Community.",
        effect: "communityMomentum"
    },

    {
        id: "J2",
        name: "Media Optics",
        description: "Low risk cards cost 0 Political Capital.",
        effect: "lowRiskFree"
    },

    {
        id: "J3",
        name: "Institutional Insider",
        description: "+1 Power whenever you play a Power card.",
        effect: "powerBonus"
    },

    {
        id: "J4",
        name: "Radical Surge",
        description: "High risk cards gain +1 Momentum.",
        effect: "highRiskMomentum"
    }
];


/* ================================================= */
/* SHUFFLE */
/* ================================================= */

export function shuffleDeck(deck) {
    return [...deck].sort(() => Math.random() - 0.5);
}
