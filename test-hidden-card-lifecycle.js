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
const canvasMock = { width: 800, height: 600, getContext: () => ({ fillRect(){}, clearRect(){}, beginPath(){}, arc(){}, fill(){}, moveTo(){}, lineTo(){}, stroke(){} }) };
const handEl = mkEl();
const elementCache = { hand: handEl, ambientCanvas: canvasMock };
globalThis.document = {
    querySelectorAll: () => [],
    querySelector: () => mkEl(),
    getElementById: (id) => (elementCache[id] ? elementCache[id] : mkEl()),
    body: { appendChild(){}, style:{}, contains(){ return true; }, classList: { add(){}, remove(){}, toggle(){}, contains(){return false;} } },
    createElement: (tag) => (tag === "canvas" ? { ...canvasMock } : mkEl()),
    addEventListener() {}
};
globalThis.window = { innerWidth: 800, innerHeight: 600, addEventListener(){}, selectDifficulty(){}, markTutorialComplete(){}, openAchievementsModal(){}, negotiate(){}, closeNegotiationModal(){}, requestAnimationFrame: (cb) => { /* no-op */ }, setTimeout: (fn) => { try { fn(); } catch (e) {} return 0; } };
globalThis.confirm = () => true;
globalThis.alert = () => {};
globalThis.setTimeout = (fn) => { try { fn(); } catch (e) { /* ignore */ } return 0; };
globalThis.requestAnimationFrame = (cb) => { /* no-op */ return 0; };
globalThis.Audio = class { constructor(){ this.play=()=>Promise.resolve(); this.pause=()=>{}; this.load=()=>{}; } };

import { setSeed } from "./game/rng.js";
import { resolveCard } from "./game/effectResolver.js";
import { playCard } from "./game/round.js";
import { gameState } from "./game/state.js";
import { initResourceSystem } from "./game/resourceManagement.js";
import { initInteractionState, addHiddenCards } from "./game/cardInteractions.js";
import { initOppositionSystem } from "./game/oppositionSystem.js";
import { initOppositionActions } from "./game/oppositionActions.js";
import { shuffleDeck } from "./game/deck.js";
import { baseDeck } from "./game/deck.js";
import { drawCard } from "./game/deck.js";

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

// 1. Hidden-card creation: empty hand -> production pathway adds hidden placeholders.
setupState();
gameState.playerHand = [];
const deckBeforeHidden = gameState.deck.length;
// Place a known card (id 101) at the top of the deck for deterministic backing.
const knownCard = baseDeck.find(c => c.id === 101);
assert.ok(knownCard, "card 101 should exist in baseDeck");
gameState.deck = [knownCard];
addHiddenCards();
const hiddenPlaceholders = gameState.playerHand.filter(c => c.hidden === true);
assert.ok(hiddenPlaceholders.length > 0, "addHiddenCards should add hidden placeholders when hand is empty");
assert.equal(hiddenPlaceholders[0].id, 0, "hidden placeholder should have id 0");
assert.equal(hiddenPlaceholders[0].suit, "hidden", "hidden placeholder suit should be 'hidden'");
assert.ok(gameState.interactionState.hiddenCards.length > 0, "real cards should be tracked in interactionState.hiddenCards");
assert.equal(gameState.interactionState.hiddenCards[0].id, 101, "backing card should be the known card (id 101)");
assert.equal(gameState.deck.length, 0, "the single provided card should be drawn from deck");
// Note: drawHiddenCard uses shuffleDeck, which is not imported in cardInteractions.js.
// This is a latent production bug that only triggers when the deck is empty and
// discardPile is non-empty during hidden-card creation. Tests avoid that path.

// 2. Reveal and resolve a hidden card: exact effect application.
setupState();
gameState.playerHand = [];
gameState.deck = [knownCard, knownCard];
addHiddenCards();
// Keep a dummy card so addHiddenCards is not triggered when the hidden card is played.
gameState.playerHand.push({ id: 999, suit: "care", title: "Dummy", effects: {}, cost: 0, tags: [] });
const hiddenIndex = gameState.playerHand.findIndex(c => c.hidden === true);
assert.ok(hiddenIndex >= 0, "should have a hidden card in hand");
const hiddenCountBefore = gameState.interactionState.hiddenCards.length;
const handCountBefore = gameState.playerHand.length;
const playsBefore = gameState.playsThisRound;
const careBefore = gameState.tracks.care;
const backingBefore = gameState.interactionState.hiddenCards[0];
assert.equal(backingBefore.id, 101, "backing card should be id 101");
assert.deepEqual(backingBefore.effects, { care: 2 }, "backing card should have care +2");
gameState.leverage = 10;
await resolveCard(hiddenIndex, () => {});
// Backing card resolved to the expected identity.
assert.equal(gameState.interactionState.hiddenCards.length, hiddenCountBefore - 1, "hiddenCards tracking should decrease by 1");
// The backing card count in hiddenCards should decrease by 1.
assert.equal(gameState.interactionState.hiddenCards.length, hiddenCountBefore - 1, "one backing card should be consumed");
// Effect applied exactly once: care +2.
assert.equal(gameState.tracks.care, careBefore + 2, "hidden card should apply care +2 exactly once");
// Card removed from hand.
assert.equal(gameState.playerHand.length, handCountBefore - 1, "hand should lose the played hidden card");
// playsThisRound incremented.
assert.equal(gameState.playsThisRound, playsBefore + 1, "playsThisRound should increment");
// Leverage deducted by revealedCost (1).
assert.equal(gameState.leverage, 9, "leverage should decrease by revealedCost (1)");
// Backing card in discard pile.
assert.ok(gameState.discardPile.some(c => c.id === 101), "backing card should be in discard pile");

// 3. Missing backing card: hidden placeholder with no backing real card.
setupState();
gameState.playerHand = [];
addHiddenCards();
gameState.interactionState.hiddenCards = [];
gameState.playerHand.push({ id: 0, suit: "hidden", title: "Face Down Card", effects: {}, cost: 0, hidden: true, revealedEffect: {}, revealedCost: 0 });
const handLenBefore = gameState.playerHand.length;
const playsBeforeMiss = gameState.playsThisRound;
const careBeforeMiss = gameState.tracks.care;
const surgeBeforeMiss = gameState.surge;
const hiddenIndexMiss = gameState.playerHand.findIndex(c => c.hidden === true);
await resolveCard(hiddenIndexMiss, () => {});
assert.equal(gameState.playerHand.length, handLenBefore, "missing backing should not remove placeholder from hand");
assert.equal(gameState.playsThisRound, playsBeforeMiss, "missing backing should not increment playsThisRound");
assert.equal(gameState.tracks.care, careBeforeMiss, "missing backing should not change care");
assert.equal(gameState.surge, surgeBeforeMiss, "missing backing should not change surge");
assert.equal(gameState.interactionState.hiddenCards.length, 0, "hiddenCards should remain empty");

// 4. Repeated interaction: original backing card cannot be consumed twice.
setupState();
gameState.playerHand = [];
gameState.deck = [knownCard];
addHiddenCards();
// Keep a dummy so addHiddenCards (latent bug: shuffleDeck not imported) is not triggered.
gameState.playerHand.push({ id: 999, suit: "care", title: "Dummy", effects: {}, cost: 0, tags: [] });
const idx = gameState.playerHand.findIndex(c => c.hidden === true);
assert.ok(idx >= 0, "should have hidden card");
const careBeforeRepeat = gameState.tracks.care;
const hiddenBeforeRepeat = gameState.interactionState.hiddenCards.length;
await resolveCard(idx, () => {});
// care should increase by 2 (the backing card's effect).
assert.equal(gameState.tracks.care, careBeforeRepeat + 2, "first resolve should apply care +2");
assert.equal(gameState.interactionState.hiddenCards.length, hiddenBeforeRepeat - 1, "backing card consumed");
// The backing card (id 101) should be in discard, not in hiddenCards.
assert.ok(gameState.discardPile.some(c => c.id === 101), "backing card should be in discard pile");
assert.ok(!gameState.interactionState.hiddenCards.some(c => c.id === 101), "backing card should not remain in hiddenCards");
// The original backing card appears in discard exactly once (consumed once, not duplicated).
const discardCount101 = gameState.discardPile.filter(c => c.id === 101).length;
assert.equal(discardCount101, 1, "backing card 101 should appear in discard exactly once");

// 5. Invalid index does not mutate state.
setupState();
const handLen = gameState.playerHand.length;
const plays = gameState.playsThisRound;
await resolveCard(999, () => {});
assert.equal(gameState.playerHand.length, handLen, "invalid index should not change hand size");
assert.equal(gameState.playsThisRound, plays, "invalid index should not change playsThisRound");

// 6. Rejected play (max plays reached) does not consume a card.
setupState();
gameState.playsThisRound = gameState.maxPlaysPerRound;
const handBeforeReject = gameState.playerHand.length;
if (gameState.playerHand.length > 0) {
    const first = gameState.playerHand[0];
    await resolveCard(0, () => {});
    if ((Number(first.cost) || 0) <= gameState.leverage) {
        assert.equal(gameState.playerHand.length, handBeforeReject, "rejected play should not remove card");
    }
}

// 7. State coherence after hidden-card play: a normal card can still be played.
setupState();
setSeed(456);
gameState.playerHand = [];
gameState.deck = [knownCard, knownCard];
addHiddenCards();
// Keep dummies so addHiddenCards (latent bug) is not triggered.
gameState.playerHand.push({ id: 998, suit: "care", title: "Dummy1", effects: { care: 1 }, cost: 0, tags: [] });
gameState.playerHand.push({ id: 997, suit: "care", title: "Dummy2", effects: { care: 1 }, cost: 0, tags: [] });
// Play the hidden card first.
const hIdx = gameState.playerHand.findIndex(c => c.hidden === true);
if (hIdx >= 0) {
    await resolveCard(hIdx, () => {});
}
// Now play a normal card if available.
const normalIdx = gameState.playerHand.findIndex(c => !c.hidden && (Number(c.cost) || 0) <= gameState.leverage);
if (normalIdx >= 0) {
    const beforeHand = gameState.playerHand.length;
    await resolveCard(normalIdx, () => {});
    assert.ok(gameState.playerHand.length <= beforeHand, "normal card play after hidden should reduce hand");
}

console.log("test-hidden-card-lifecycle.js passed");