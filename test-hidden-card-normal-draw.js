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

const { setSeed } = await import("./game/rng.js");
const { gameState } = await import("./game/state.js");
const { baseDeck, drawCard, shuffleDeck } = await import("./game/deck.js");
const { resolveCard } = await import("./game/effectResolver.js");
const { initResourceSystem } = await import("./game/resourceManagement.js");
const { initInteractionState, revealHiddenCard } = await import("./game/cardInteractions.js");
const { initOppositionSystem } = await import("./game/oppositionSystem.js");
const { initOppositionActions } = await import("./game/oppositionActions.js");
const { startGame } = await import("./main.js");

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

const byId = (id) => baseDeck.find(c => c.id === id);
const hidden701 = byId(701);
const hidden702 = byId(702);
const careCard = byId(101);
const careCard2 = byId(104);
assert.ok(hidden701 && hidden702 && careCard && careCard2, "required base deck cards should exist");

/* 1. Hidden cards are part of the normal deck definition. */
setupState();
const hiddenDefinitions = baseDeck.filter(c => c.hidden === true);
assert.deepEqual(hiddenDefinitions.map(c => c.id), [701, 702, 703, 704], "normal deck should contain hidden cards 701-704");
for (const definition of hiddenDefinitions) {
    assert.deepEqual(definition.effects, {}, "hidden deck definitions should not fake their own effects");
    assert.equal(definition.cost, 0, "hidden deck definitions should not fake their own cost");
    assert.equal(typeof definition.revealCost, "number", "hidden deck definition should declare a reveal cost");
}

/* 2. Drawing a hidden card from the normal deck attaches a valid backing card. */
setupState();
gameState.deck = [careCard, hidden701];
const drawnHidden = drawCard();
assert.equal(drawnHidden.id, 701, "the hidden deck card should be drawn");
assert.equal(drawnHidden.hidden, true, "the drawn card should remain face down");
assert.ok(drawnHidden.backingCard, "the drawn hidden card should carry a backing card");
assert.equal(drawnHidden.backingCard.id, 101, "the backing card should be the next real deck card");
assert.equal(drawnHidden.backingCard.hidden, undefined, "a hidden card must never back another hidden card");
assert.equal(gameState.deck.length, 0, "hidden card and its backing should both be removed from the deck");
assert.equal(hidden701.backingCard, undefined, "drawing must not mutate the base deck definition");

/* 3-6. Playing the hidden card reveals the backing and resolves it exactly once. */
setupState();
gameState.deck = [careCard, hidden701];
const hiddenCard = drawCard();
gameState.playerHand.push(hiddenCard);
gameState.playerHand.push({ id: 999, suit: "care", title: "Dummy", effects: {}, cost: 0, tags: [] });

const careBefore = gameState.tracks.care;
const leverageBefore = gameState.leverage;
const playsBefore = gameState.playsThisRound;
const handBefore = gameState.playerHand.length;

await resolveCard(0, () => {});

assert.equal(gameState.tracks.care, careBefore + 2, "revealed backing effect (care +2) should apply exactly once");
assert.equal(gameState.leverage, leverageBefore - 1, "leverage should be spent on the revealed card's actual cost");
assert.equal(gameState.playsThisRound, playsBefore + 1, "revealed card should consume exactly one play");
assert.equal(gameState.playerHand.length, handBefore - 1, "hidden card should leave the hand after resolution");
assert.equal(gameState.discardPile.filter(c => c.id === 101).length, 1, "backing card should be discarded exactly once");
assert.equal(gameState.interactionState.hiddenCards.length, 0, "normal-draw backings should not leak into the placeholder queue");

/* A second interaction cannot reveal or apply the same backing again. */
const careAfterFirstPlay = gameState.tracks.care;
const playsAfterFirstPlay = gameState.playsThisRound;
gameState.playerHand.push({ id: 701, suit: "hidden", title: "Unknown Policy", effects: {}, cost: 0, hidden: true });
const noBackingResult = await resolveCard(gameState.playerHand.length - 1, () => {});
assert.equal(noBackingResult, undefined, "missing backing resolution should return without playing");
assert.equal(gameState.tracks.care, careAfterFirstPlay, "missing backing must not reapply the previous backing effect");
assert.equal(gameState.playsThisRound, playsAfterFirstPlay, "missing backing must not consume a play");
assert.equal(gameState.discardPile.filter(c => c.id === 101).length, 1, "backing card must not be duplicated into the discard pile");

/* 7. Empty backing pool is handled safely and never creates a dead hand card. */
setupState();
gameState.deck = [hidden701];
gameState.discardPile = [];
const emptyPoolDraw = drawCard();
assert.equal(emptyPoolDraw, null, "a hidden card without any backing draw should not be dealt");
assert.equal(gameState.playerHand.length, 0, "no unresolvable hidden card should enter the hand");
assert.equal(gameState.deck.length, 1, "the undrawable hidden card should stay in the deck");
assert.equal(gameState.deck[0].id, 701, "the preserved deck card should still be the hidden card");
assert.equal(gameState.deck[0].backingCard, undefined, "an undrawable hidden card should not gain a fake backing");

setupState();
const bareHidden = { id: 701, suit: "hidden", title: "Unknown Policy", effects: {}, cost: 0, hidden: true };
gameState.playerHand = [bareHidden];
assert.equal(revealHiddenCard(0), null, "revealing without a backing should return null");
assert.equal(gameState.playerHand[0], bareHidden, "failed reveal should leave the face-down card untouched");

/* 8-9. Multiple hidden cards keep independent backings and a consistent deck/hand/discard. */
setupState();
setSeed(2026);
gameState.deck = [careCard2, careCard, hidden702, hidden701];
const firstHidden = drawCard();
const secondHidden = drawCard();
assert.equal(firstHidden.id, 701, "first hidden card should be drawn in deck order");
assert.equal(secondHidden.id, 702, "second hidden card should be drawn in deck order");
assert.equal(firstHidden.backingCard.id, 101, "first hidden card should back onto card 101");
assert.equal(secondHidden.backingCard.id, 104, "second hidden card should back onto card 104");
assert.notEqual(firstHidden.backingCard.id, secondHidden.backingCard.id, "two hidden cards must not share one backing");

gameState.playerHand.push(firstHidden, secondHidden);
gameState.playerHand.push({ id: 998, suit: "care", title: "Dummy 1", effects: {}, cost: 0, tags: [] });
gameState.playerHand.push({ id: 997, suit: "care", title: "Dummy 2", effects: {}, cost: 0, tags: [] });

const careBeforePair = gameState.tracks.care;
const leverageBeforePair = gameState.leverage;
const playsBeforePair = gameState.playsThisRound;
const totalBeforePair = gameState.deck.length + gameState.playerHand.length + gameState.discardPile.length;

await resolveCard(0, () => {});
const secondHiddenIndex = gameState.playerHand.findIndex(c => c.hidden === true);
assert.ok(secondHiddenIndex >= 0, "second hidden card should still be in the hand");
await resolveCard(secondHiddenIndex, () => {});

assert.equal(gameState.tracks.care, careBeforePair + 5, "first and second backing effects should each apply once");
assert.equal(gameState.leverage, leverageBeforePair - 3, "both revealed costs should be charged");
assert.equal(gameState.playsThisRound, playsBeforePair + 2, "each revealed card should consume one play");
assert.equal(gameState.discardPile.filter(c => c.id === 101).length, 1, "first backing should be discarded once");
assert.equal(gameState.discardPile.filter(c => c.id === 104).length, 1, "second backing should be discarded once");
assert.equal(gameState.playerHand.some(c => c.id === 701 || c.id === 702), false, "no hidden wrappers should remain in the hand");
assert.equal(totalBeforePair, gameState.deck.length + gameState.playerHand.length + gameState.discardPile.length, "deck, hand, and discard cardinality should stay consistent");

/* 10. Restart clears hidden-card state and never reuses a stale backing. */
startGame();
const staleHidden = { ...hidden701, id: 69999, title: "Stale Hidden", backingCard: { ...careCard } };
gameState.playerHand.push(staleHidden);
gameState.interactionState.hiddenCards.push({ ...careCard });

startGame();

assert.equal(gameState.interactionState.hiddenCards.length, 0, "restart should clear queued hidden-card backings");
assert.equal(gameState.playerHand.some(c => c.id === 69999), false, "restart should not preserve stale hidden state");
assert.equal(gameState.playerHand.some(c => c.title === staleHidden.title && c.backingCard === staleHidden.backingCard), false, "restart should not preserve stale backing references");
assert.equal(baseDeck.filter(c => c.hidden).every(c => c.backingCard === undefined), true, "base deck hidden definitions should remain backing-free after restart");
assert.equal(shuffleDeck([...baseDeck]).filter(c => c.backingCard).length, 0, "a fresh shuffled deck should start without attached backings");

console.log("test-hidden-card-normal-draw.js passed");
