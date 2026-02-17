/* ================================================= */
/* SYSTEM SHIFT – STATE (BRICK FOUNDATION v2)       */
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

    /* LEVERAGE (formerly Political Capital) */
    leverage: 5,
    maxLeverage: 12,
    leverageRecovery: 2,

    /* SURGE (formerly Momentum) */
    surge: 0,

    /* PUSHBACK (formerly Pressure) */
    pushback: {
        revealed: false,
        value: 0
    },

    structuralPushback: 0,
    surfacePushback: 0,

    /* HALOS (formerly tracks) */
    tracks: {
        care: 8,
        climate: 8,
        solidarity: 6,
        authority: 5,
        capital: 15,
        strain: 6
    },

    /* CARDS */
    playerHand: [],
    deck: [],
    discardPile: []
};