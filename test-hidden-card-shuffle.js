import assert from "node:assert/strict";

// Minimal DOM/storage environment so production modules can load in Node.
const store = new Map();
globalThis.localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
};
const mkEl = () => {
    const el = { style: {}, innerHTML: "", textContent: "", children: [], classList: { toggle(){}, add(){}, remove(){}, contains(){return false;} } };
    el.appendChild = (c) => { el.children.push(c); return c; };
    el.prepend = (c) => { el.children.unshift(c); return c; };
    el.querySelector = () => mkEl();
    el.querySelectorAll = () => [];
    el.addEventListener = () => {};
    el.parentElement = el;
    return el;
};
globalThis.document = {
    querySelectorAll: () => [],
    querySelector: () => mkEl(),
    getElementById: () => mkEl(),
    body: { appendChild(){}, style:{}, contains(){ return true; }, classList: { add(){}, remove(){}, toggle(){}, contains(){return false;} } },
    createElement: mkEl,
    addEventListener() {}
};
globalThis.window = { innerWidth: 800, innerHeight: 600, addEventListener(){}, selectDifficulty(){}, markTutorialComplete(){}, openAchievementsModal(){}, negotiate(){}, closeNegotiationModal(){}, requestAnimationFrame: (cb) => { /* no-op */ }, setTimeout: (fn) => { try { fn(); } catch (e) {} return 0; } };
globalThis.confirm = () => true;
globalThis.alert = () => {};
globalThis.setTimeout = (fn) => { try { fn(); } catch (e) { /* ignore */ } return 0; };
globalThis.requestAnimationFrame = (cb) => { /* no-op */ return 0; };
globalThis.Audio = class { constructor(){ this.play=()=>Promise.resolve(); this.pause=()=>{}; this.load=()=>{}; } };

import { setSeed } from "./game/rng.js";
import { gameState } from "./game/state.js";
import { initResourceSystem } from "./game/resourceManagement.js";
import { initInteractionState, addHiddenCards } from "./game/cardInteractions.js";
import { initOppositionSystem } from "./game/oppositionSystem.js";
import { initOppositionActions } from "./game/oppositionActions.js";
import { baseDeck } from "./game/deck.js";

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

// Test 1: empty deck + populated discard pile -> shuffle and draw.
setupState();
const discardCards = [baseDeck[0], baseDeck[1], baseDeck[2]];
gameState.discardPile = [...discardCards];
gameState.deck = [];
gameState.playerHand = [];
const discardBefore = gameState.discardPile.length;
addHiddenCards();
// Should create up to 2 hidden placeholders (min(2, 5-0)).
assert.ok(gameState.playerHand.length > 0, "hidden placeholders should be created");
const placeholders = gameState.playerHand.filter(c => c.hidden === true);
assert.ok(placeholders.length > 0, "at least one hidden placeholder should exist");
assert.ok(gameState.interactionState.hiddenCards.length > 0, "backing cards should be tracked");
// Discard pile should be consumed (shuffled into deck then drawn).
assert.equal(gameState.discardPile.length, 0, "discard pile should be emptied after shuffle");
// Each placeholder's backing card should be a real card (not id 0).
for (const bc of gameState.interactionState.hiddenCards) {
    assert.ok(bc.id !== 0, "backing card should be a real card, not a placeholder");
}
// No duplicate backing card ids across the consumed set (each draw removes from deck).
const backingIds = gameState.interactionState.hiddenCards.map(c => c.id);
// (hiddenCards may have fewer than placeholders if deck ran out; just check consistency)
assert.ok(gameState.interactionState.hiddenCards.length === placeholders.length,
    "each placeholder should have a corresponding backing card");

// Test 2: empty deck + empty discard -> no cards fabricated.
setupState();
gameState.playerHand = [];
gameState.deck = [];
gameState.discardPile = [];
const handBefore = gameState.playerHand.length;
const hiddenBefore = gameState.interactionState.hiddenCards.length;
addHiddenCards();
assert.equal(gameState.playerHand.length, handBefore, "no placeholders should be created with empty deck and discard");
assert.equal(gameState.interactionState.hiddenCards.length, hiddenBefore, "no backing cards should be tracked");

// Test 3: non-empty deck -> first draw from deck; discard reshuffled only if deck runs out.
setupState();
const knownCard = baseDeck[5];
gameState.playerHand = [];
gameState.deck = [knownCard];
gameState.discardPile = [baseDeck[6], baseDeck[7]];
addHiddenCards();
// First backing card should be the known deck card.
assert.equal(gameState.interactionState.hiddenCards[0].id, knownCard.id, "first backing card should come from the deck");
assert.ok(gameState.interactionState.hiddenCards.length > 0, "backing card should be drawn");

// Test 4: repeated draws do not duplicate a backing card.
setupState();
gameState.playerHand = [];
gameState.deck = [baseDeck[0], baseDeck[1], baseDeck[2], baseDeck[3]];
gameState.discardPile = [];
addHiddenCards();
const firstBacking = [...gameState.interactionState.hiddenCards];
addHiddenCards(); // second call: hand may still have room? hand has up to 2, 5-2=3, so may add more
// Backing cards should not contain duplicates from the same deck consumption.
// (Each drawHiddenCard pops from deck or reshuffles; no card should appear twice in hiddenCards
// unless the deck/discard legitimately contains duplicates, which baseDeck does not.)
const ids = gameState.interactionState.hiddenCards.map(c => c.id);
const uniqueIds = new Set(ids);
assert.equal(ids.length, uniqueIds.size, "backing card ids should be unique (no duplicates)");

console.log("test-hidden-card-shuffle.js passed");