/* ================================================= */
/* SYSTEM SHIFT – STATE (Research Core Stable)      */
/* ================================================= */

export const gameState = {

    /* CORE */
    round: 1,
    maxRounds: 10,
    gameOver: false,

    /* ACTION ECONOMY */
    playsThisRound: 0,
    maxPlaysPerRound: 3,

    handSize: 5,

    politicalCapital: 5,
    maxPoliticalCapital: 8,
    politicalRecovery: 2,

    /* ENERGY */
    momentum: 0,

    /* PRESSURE */
    pressure: {
        revealed: false,
        value: 0
    },

    structuralPressure: 0,
    surfacePressure: 0,

    /* TRACKS */
    tracks: {
        wellbeing: 8,
        planet: 8,
        community: 6,
        power: 5,
        wealth: 15,
        tension: 6
    },

    /* CARDS */
    playerHand: [],
    deck: [],
    discardPile: []
};