// game/state.js

export const gameState = {

    /* ================================================= */
    /* CORE PROGRESSION */
    /* ================================================= */

    round: 1,
    maxRounds: 10,
    gameOver: false,

    shiftProgress: 0,
    resistancePhase: false,


    /* ================================================= */
    /* ACTION ECONOMY */
    /* ================================================= */

    playsThisRound: 0,
    maxPlaysPerRound: 3,

    handSize: 5,                  // bigger than plays

    politicalCapital: 5,
    maxPoliticalCapital: 8,
    politicalRecovery: 2,


    /* ================================================= */
    /* MOVEMENT ENERGY */
    /* ================================================= */

    momentum: 0,
    optimism: 0,                  // soft revolutionary energy


    /* ================================================= */
    /* JOKER ECOSYSTEM */
    /* ================================================= */

    jokerDeck: [],                // pool of unlockable jokers
    availableJokers: [],          // jokers offered to player
    activeJokers: [],             // permanent movement jokers

    institutionalJokers: [],      // parasites embedded in system
    crisisJokers: [],             // temporary structural crises


    /* ================================================= */
    /* CORE SYSTEM TRACKS */
    /* ================================================= */

    tracks: {
        wellbeing: 8,
        planet: 8,
        community: 6,
        power: 5,
        wealth: 15,
        tension: 6
    },


    /* ================================================= */
    /* PRESSURE SYSTEM */
    /* ================================================= */

    pressure: {
        revealed: false,
        value: 0
    },

    structuralPressure: 0,        // persistent deep state memory
    surfacePressure: 0,           // volatile unrest layer


    /* ================================================= */
    /* LONG MEMORY */
    /* ================================================= */

    debtRoundsActive: 0,


    /* ================================================= */
    /* INTERNAL COUNTERS */
    /* ================================================= */

    immediateSignalsTriggered: 0,
    strainTokens: 0,


    /* ================================================= */
    /* CARD STATE */
    /* ================================================= */

    playerHand: [],
    deck: [],
    discardPile: []
};
