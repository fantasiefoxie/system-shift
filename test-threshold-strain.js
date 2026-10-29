import assert from "node:assert/strict";

// Minimal localStorage mock.
const store = new Map();
globalThis.localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
};

import { endRound } from "./game/round.js";
import { gameState } from "./game/state.js";
import { initResourceSystem } from "./game/resourceManagement.js";
import { initInteractionState } from "./game/cardInteractions.js";
import { initOppositionSystem } from "./game/oppositionSystem.js";
import { initOppositionActions } from "./game/oppositionActions.js";

function setupBase(climate, strain, activeThresholds) {
    gameState.round = 6;
    gameState.maxRounds = 10;
    gameState.gameOver = false;
    gameState.currentAct = 1;
    gameState.playsThisRound = 0;
    gameState.maxPlaysPerRound = 3;
    gameState.handSize = 5;
    gameState.leverage = 10;
    gameState.maxLeverage = 10;
    gameState.leverageRecovery = 2;
    gameState.surge = 0;
    gameState.tracks = { care: 8, climate: climate, solidarity: 6, authority: 10, capital: 10, strain: strain };
    gameState.pushback = { revealed: false, eliteResistance: 0, transitionShock: 0, value: 0 };
    gameState.structuralPushback = 0;
    gameState.surfacePushback = 0;
    gameState.playerHand = [];
    gameState.deck = [];
    gameState.discardPile = [];
    gameState.delayedEffects = [];
    gameState.tagsPlayedThisRound = [];
    gameState.hiddenTracks = { eliteCohesion: 10, movementMorale: 10, internationalPressure: 5 };
    gameState.revealed = { hiddenTracks: false, nextCards: [], nextEliteAction: null };
    gameState.activeThresholds = activeThresholds ? [...activeThresholds] : [];
    gameState.negotiation = { usedThisAct: [], history: [] };
    gameState.memory = { maxCare: 8, maxClimate: 8, cardsPlayed: [], eventsChosen: [] };
    gameState.difficulty = { mode: "normal", leverageOffset: 0, strainMultiplier: 1.0, oppositionIntensity: 1.0 };
    gameState.ui = { roundPhase: "PLAYING", pacingMode: "standard", orientationMode: "portrait", markerVerbosity: "normal", feed: { items: [], maxItems: 40, markerVerbosity: "normal" } };
    gameState.opposition = undefined;
    initResourceSystem();
    initInteractionState();
    initOppositionSystem();
    initOppositionActions();
}

function runRound(climate, strain, seedActive) {
    setupBase(climate, strain, seedActive ? ["climate_emergency"] : []);
    const before = gameState.tracks.strain;
    endRound();
    return { before, after: gameState.tracks.strain, delta: gameState.tracks.strain - before, active: gameState.activeThresholds.includes("climate_emergency") };
}

// 1. Isolate the threshold contribution: same climate/strain, differ only by seeded active threshold.
//    The inactive case establishes ordinary structural drift.
const inactive = runRound(8, 10, false);
assert.ok(!inactive.active, "threshold should be inactive with high climate");

const active = runRound(8, 10, true);
assert.ok(active.active, "seeded threshold should remain active");
// The active case must exceed the inactive case by exactly the configured +2.
assert.equal(active.delta - inactive.delta, 2, "threshold should contribute exactly +2 strain on top of drift");

// 2. Activation round: threshold activates and contributes +2 on the same round.
const activation = runRound(4, 10, false);
assert.ok(activation.active, "climate_emergency should activate on round 6 with climate <= 5");

// 3. Clamp at 20: seeded active threshold with high strain.
const clamped = runRound(10, 18, true);
assert.ok(clamped.after <= 20, "strain should never exceed 20");

// 4. Inactive state: high climate, no seeded threshold -> not active, no threshold contribution.
const inactiveHigh = runRound(8, 10, false);
assert.ok(!inactiveHigh.active, "threshold should be inactive with high climate");

console.log("test-threshold-strain.js passed");