/* ================================================= */
/* SYSTEM SHIFT – STATE (RESEARCH FINAL BUILD) */
/* ================================================= */

import { initLogger } from "./logger.js";

/* ================================================= */
/* TRACK SCALE MODEL */
/* ================================================= */

/*
All core tracks use a 0–100 baseline.

0–30    = Collapse zone
30–50   = Fragile
50–70   = Stable
70–100  = Strong
100+    = Dominant / Overconcentration

Tracks are NOT clamped at 100.
Overflow is intentional.
Negative values are possible in collapse spirals.
*/


export const gameState = {

    /* ================================================= */
    /* RUN METADATA */
    /* ================================================= */

    seed: null,
    version: "research-v1.0.0",
    runStartTimestamp: null,

    /* ================================================= */
    /* CORE PROGRESSION */
    /* ================================================= */

    round: 1,
    maxRounds: 10,
    gameOver: false,

    shiftProgress: 0,
    resistancePhase: false,

    /* ================================================= */
    /* EMERGENCY SYSTEM */
    /* ================================================= */

    emergency: {
        active: false,
        roundsActive: 0,
        performanceScore: 0
    },

    /* ================================================= */
    /* ACTION ECONOMY */
    /* ================================================= */

    playsThisRound: 0,
    maxPlaysPerRound: 3,

    handSize: 5,

    politicalCapital: 10,
    maxPoliticalCapital: 15,
    politicalRecoveryBase: 5,

    /* ================================================= */
    /* JOKER SYSTEM */
    /* ================================================= */

    jokerDeck: [],
    availableJokers: [],
    activeJokers: [],

    parasiteJokers: [],
    purgeCostBase: 5,

    /* ================================================= */
    /* LEGACY MODIFIERS */
    /* ================================================= */

    modifiers: [],

    /* ================================================= */
    /* CORE TRACKS (Percentage Based) */
    /* ================================================= */

    tracks: {
        wellbeing: 50,
        planet: 50,
        community: 50,
        power: 50,
        wealth: 50,
        tension: 20
    },

    /* ================================================= */
    /* PRESSURE SYSTEM */
    /* ================================================= */

    pressure: {
        revealed: false,
        value: 0
    },

    structuralPressure: 0,
    surfacePressure: 0,

    /* ================================================= */
    /* MOVEMENT ENERGY */
    /* ================================================= */

    momentum: 0,
    optimism: 0,

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


/* ================================================= */
/* INITIALIZE RUN */
/* ================================================= */

export function initializeRun(seed) {

    gameState.seed = seed;
    gameState.runStartTimestamp = Date.now();

    initLogger(seed, gameState.version);

    resetState();
}


/* ================================================= */
/* RESET STATE */
/* ================================================= */

export function resetState() {

    gameState.round = 1;
    gameState.gameOver = false;

    gameState.shiftProgress = 0;
    gameState.resistancePhase = false;

    gameState.emergency.active = false;
    gameState.emergency.roundsActive = 0;
    gameState.emergency.performanceScore = 0;

    gameState.politicalCapital = 10;

    gameState.structuralPressure = 0;
    gameState.surfacePressure = 0;

    gameState.momentum = 0;
    gameState.optimism = 0;

    gameState.debtRoundsActive = 0;

    gameState.modifiers = [];
    gameState.activeJokers = [];
    gameState.parasiteJokers = [];
    gameState.availableJokers = [];

    gameState.tracks = {
        wellbeing: 50,
        planet: 50,
        community: 50,
        power: 50,
        wealth: 50,
        tension: 20
    };

    gameState.playerHand = [];
    gameState.deck = [];
    gameState.discardPile = [];
}


/* ================================================= */
/* TRACK STATE HELPER */
/* ================================================= */

export function getTrackState(value) {

    if (value <= 20) return "collapse";
    if (value <= 40) return "fragile";
    if (value <= 70) return "stable";
    if (value <= 100) return "strong";
    return "dominant";
}


/* ================================================= */
/* OPTIMISM CALCULATION */
/* ================================================= */

export function calculateOptimism() {

    const materialStrength =
        (gameState.tracks.wellbeing +
         gameState.tracks.community +
         gameState.tracks.planet) / 3;

    const pressurePenalty =
        gameState.structuralPressure * 1.5;

    const optimismScore =
        materialStrength +
        gameState.momentum -
        pressurePenalty;

    gameState.optimism = optimismScore;

    return optimismScore;
}


/* ================================================= */
/* EMERGENCY TRIGGER CHECK */
/* ================================================= */

export function checkEmergencyTrigger() {

    const collapseCondition =
        gameState.tracks.planet < 20 ||
        gameState.tracks.wellbeing < 20 ||
        gameState.tracks.tension > 80;

    if (collapseCondition && !gameState.emergency.active) {

        gameState.emergency.active = true;
        gameState.emergency.roundsActive = 0;
        gameState.emergency.performanceScore = 0;

        return true;
    }

    return false;
}
