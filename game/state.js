/* ================================================= */
/* SYSTEM SHIFT – STATE (BRICK FOUNDATION v3)       */
/* Fully Compatible with Round v8 + Phase v2        */
/* ================================================= */

export const gameState = {

    /* ================================================= */
    /* CORE GAME STATE                                  */
    /* ================================================= */

    round: 1,
    maxRounds: 10,
    gameOver: false,

    /* ================================================= */
    /* ACTION ECONOMY                                   */
    /* ================================================= */

    playsThisRound: 0,
    maxPlaysPerRound: 3,
    handSize: 5,

    /* ================================================= */
    /* LEVERAGE (Political Capital Layer)               */
    /* ================================================= */

    leverage: 5,
    maxLeverage: 10,
    leverageRecovery: 2,

    /* ================================================= */
    /* SURGE (Momentum / Structural Energy)             */
    /* ================================================= */

    surge: 0,

    /* ================================================= */
    /* PUSHBACK 2.1 SYSTEM                              */
    /* ================================================= */

    pushback: {
        revealed: false,

        /* Internal Components */
        eliteResistance: 0,
        transitionShock: 0,

        /* Derived Value (UI uses this) */
        value: 0
    },

    /* Legacy placeholders (safe to keep) */
    structuralPushback: 0,
    surfacePushback: 0,

    /* ================================================= */
    /* HALO TRACKS                                      */
    /* ================================================= */

    tracks: {
        care: 8,
        climate: 8,
        solidarity: 6,
        authority: 10,
        capital: 20,
        strain: 10
    },

    /* ================================================= */
    /* CARD SYSTEM                                      */
    /* ================================================= */

    playerHand: [],
    deck: [],
    discardPile: []
};