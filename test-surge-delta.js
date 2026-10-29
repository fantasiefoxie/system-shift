import assert from "node:assert/strict";

// Minimal localStorage mock.
const store = new Map();
globalThis.localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
};

import { endRound, playCard } from "./game/round.js";
import { gameState } from "./game/state.js";
import { initResourceSystem } from "./game/resourceManagement.js";
import { initOppositionSystem } from "./game/oppositionSystem.js";
import { initOppositionActions } from "./game/oppositionActions.js";
import { initInteractionState } from "./game/cardInteractions.js";

// Minimal state setup (no DOM).
function setupGame() {
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
    gameState.surge = 5;
    gameState.tracks = { care: 8, climate: 8, solidarity: 6, authority: 10, capital: 20, strain: 10 };
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

// Game 1: play a surge-granting card, then end at max round (game over).
setupGame();
const authorityCard = { id: 401, suit: "authority", title: "T", effects: { authority: 1 }, cost: 0, tags: [] };
gameState.playerHand.push(authorityCard);
gameState.leverage = 10;
playCard(0); // surge += 1 (authority suit) -> surgeDeltaThisRound = 1
assert.equal(gameState.surge, 6, "surge granted");

gameState.round = gameState.maxRounds;
endRound(); // game over; should reset surgeDeltaThisRound
assert.equal(gameState.gameOver, true, "game over");

// Game 2: no surge gain; end first round; surge should decay by 1.
setupGame();
gameState.surge = 5;
gameState.round = 1;
// ensure no surge gain this round: play nothing
endRound();
// surge decay: surgeDeltaThisRound <= 0 and surge > 0 -> surge -= 1
assert.equal(gameState.surge, 4, "surge should decay by 1 in new game's first round");

console.log("test-surge-delta.js passed");