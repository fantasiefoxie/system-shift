import assert from "node:assert/strict";

const store = new Map();
globalThis.localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
};

import { playCard } from "./game/round.js";
import { gameState } from "./game/state.js";
import { initResourceSystem } from "./game/resourceManagement.js";
import { initInteractionState } from "./game/cardInteractions.js";
import { initOppositionSystem } from "./game/oppositionSystem.js";
import { initOppositionActions } from "./game/oppositionActions.js";

function setupState() {
    gameState.round = 1;
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
    gameState.tracks = { care: 8, climate: 8, solidarity: 16, authority: 10, capital: 10, strain: 5 };
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
    gameState.activeThresholds = [];
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

// Activate mass_movement threshold manually (simulating triggered state).
setupState();
gameState.activeThresholds = ["mass_movement"];

// Solidarity card with +1 solidarity effect.
const solCard = { id: 301, suit: "solidarity", title: "Solidarity Card", effects: { solidarity: 1 }, cost: 0, tags: [] };
gameState.playerHand = [solCard];
gameState.leverage = 10;
const before = gameState.tracks.solidarity;
playCard(0);
// base +1 plus bonus +1 = +2
assert.equal(gameState.tracks.solidarity, before + 2, "solidarity card should grant base + bonus");

// Clamp at 20.
setupState();
gameState.activeThresholds = ["mass_movement"];
gameState.tracks.solidarity = 19;
const clampedCard = { id: 302, suit: "solidarity", title: "Solidarity Card", effects: { solidarity: 1 }, cost: 0, tags: [] };
gameState.playerHand = [clampedCard];
gameState.leverage = 10;
playCard(0);
assert.equal(gameState.tracks.solidarity, 20, "solidarity should clamp to 20");

// Inactive threshold: no bonus.
setupState();
gameState.activeThresholds = []; // inactive
const inactiveCard = { id: 303, suit: "solidarity", title: "Solidarity Card", effects: { solidarity: 1 }, cost: 0, tags: [] };
gameState.playerHand = [inactiveCard];
gameState.leverage = 10;
const beforeInactive = gameState.tracks.solidarity;
playCard(0);
assert.equal(gameState.tracks.solidarity, beforeInactive + 1, "inactive threshold should grant only base effect");

// Non-solidarity card: no bonus even if active.
setupState();
gameState.activeThresholds = ["mass_movement"];
const careCard = { id: 101, suit: "care", title: "Care Card", effects: { care: 1 }, cost: 0, tags: [] };
gameState.playerHand = [careCard];
gameState.leverage = 10;
const beforeCare = gameState.tracks.care;
playCard(0);
assert.equal(gameState.tracks.care, beforeCare + 1, "non-solidarity card should not get bonus");

// Activation does not grant an extra bonus: playing a card that pushes solidarity
// to the threshold does not receive the +1 bonus on that same card.
setupState();
gameState.activeThresholds = [];
gameState.tracks.solidarity = 14;
const activatingCard = { id: 306, suit: "solidarity", title: "Activating Card", effects: { solidarity: 1 }, cost: 0, tags: [] };
gameState.playerHand = [activatingCard];
gameState.leverage = 10;
const beforeAct = gameState.tracks.solidarity;
playCard(0);
assert.equal(gameState.tracks.solidarity, beforeAct + 1, "activation card should grant only base effect, no bonus");

// Activation itself does not grant extra (threshold already active scenario handled by above).
// Multiple solidarity cards: each gets at most one bonus.
setupState();
gameState.activeThresholds = ["mass_movement"];
const c1 = { id: 304, suit: "solidarity", title: "Card1", effects: { solidarity: 1 }, cost: 0, tags: [] };
const c2 = { id: 305, suit: "solidarity", title: "Card2", effects: { solidarity: 1 }, cost: 0, tags: [] };
gameState.playerHand = [c1, c2];
gameState.leverage = 10;
const beforeMulti = gameState.tracks.solidarity;
playCard(0);
playCard(0); // now index 0 is c2
assert.equal(gameState.tracks.solidarity, beforeMulti + 4, "two solidarity cards should each get base+bonus");

console.log("test-solidarity-bonus.js passed");