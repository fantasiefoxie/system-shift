import assert from "node:assert/strict";

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
const notificationStack = mkEl();
const elementCache = { hand: handEl, ambientCanvas: canvasMock, notificationStack };
const queriedSelectors = [];
const requestedIds = [];
globalThis.document = {
    querySelectorAll: () => [],
    querySelector: (sel) => { queriedSelectors.push(sel); return mkEl(); },
    getElementById: (id) => { requestedIds.push(id); return elementCache[id] ? elementCache[id] : mkEl(); },
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
    gameState.tracks = { care: 8, climate: 8, solidarity: 6, authority: 10, capital: 10, strain: 10 };
    gameState.pushback = { revealed: false, eliteResistance: 0, transitionShock: 0, value: 0 };
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

function resetTrackers() {
    queriedSelectors.length = 0;
    requestedIds.length = 0;
    notificationStack.children.length = 0;
    notificationStack.innerHTML = "";
}

function makeSystemCard() {
    return { id: 901, suit: "system", title: "System Card", effects: { care: 1 }, cost: 0, tags: ["system"] };
}

// Case 1: capital random effect
setupState();
setSeed(4);
resetTrackers();
gameState.playerHand = [makeSystemCard(), { id: 999, suit: "care", title: "Dummy", effects: {}, cost: 0, tags: [] }];
gameState.leverage = 10;
const beforeCapital = gameState.tracks.capital;
await resolveCard(0, () => {});
assert.equal(gameState.tracks.capital, beforeCapital + 1, "capital effect applied once");
assert.ok(notificationStack.children.length > 0, "notification created for capital");
assert.ok(notificationStack.children[0].innerHTML.includes("Capital"), "capital named");
assert.ok(notificationStack.children[0].innerHTML.includes("+1"), "capital magnitude");
assert.ok(queriedSelectors.includes("#track-capital"), "capital track animated");

// Case 2: authority random effect
setupState();
setSeed(3);
resetTrackers();
gameState.playerHand = [makeSystemCard(), { id: 999, suit: "care", title: "Dummy", effects: {}, cost: 0, tags: [] }];
gameState.leverage = 10;
const beforeAuthority = gameState.tracks.authority;
await resolveCard(0, () => {});
assert.equal(gameState.tracks.authority, beforeAuthority - 1, "authority effect applied once");
assert.ok(notificationStack.children.length > 0, "notification created for authority");
assert.ok(notificationStack.children[0].innerHTML.includes("Authority"), "authority named");
assert.ok(queriedSelectors.includes("#track-authority"), "authority track animated");

// Case 3: strain random effect
setupState();
setSeed(6);
resetTrackers();
gameState.playerHand = [makeSystemCard(), { id: 999, suit: "care", title: "Dummy", effects: {}, cost: 0, tags: [] }];
gameState.leverage = 10;
const beforeStrain = gameState.tracks.strain;
await resolveCard(0, () => {});
assert.equal(gameState.tracks.strain, beforeStrain + 1, "strain effect applied once");
assert.ok(notificationStack.children.length > 0, "notification created for strain");
assert.ok(notificationStack.children[0].innerHTML.includes("Strain"), "strain named");
assert.ok(queriedSelectors.includes("#track-strain"), "strain track animated");

// Case 4: surge random effect
setupState();
setSeed(5);
resetTrackers();
gameState.playerHand = [makeSystemCard(), { id: 999, suit: "care", title: "Dummy", effects: {}, cost: 0, tags: [] }];
gameState.leverage = 10;
const beforeSurge = gameState.surge;
await resolveCard(0, () => {});
assert.equal(gameState.surge, beforeSurge - 1, "surge effect applied once");
assert.ok(notificationStack.children.length > 0, "notification created for surge");
assert.ok(notificationStack.children[0].innerHTML.includes("Surge"), "surge named");
assert.ok(requestedIds.includes("surgeStat"), "surge top-bar animated");

// Case 5: system card with no random effect (genuine non-trigger)
setupState();
setSeed(165);
resetTrackers();
gameState.playerHand = [makeSystemCard(), { id: 999, suit: "care", title: "Dummy", effects: {}, cost: 0, tags: [] }];
gameState.leverage = 10;
await resolveCard(0, () => {});
assert.equal(notificationStack.children.length, 0, "no notification when no random effect");

// Case 6: non-system card
setupState();
setSeed(4);
resetTrackers();
const plainCard = { id: 101, suit: "care", title: "Care Card", effects: { care: 1 }, cost: 0, tags: ["care"] };
gameState.playerHand = [plainCard, { id: 998, suit: "care", title: "Dummy", effects: {}, cost: 0, tags: [] }];
gameState.leverage = 10;
await resolveCard(0, () => {});
assert.equal(notificationStack.children.length, 0, "no notification for non-system card");

console.log("test-random-effect-feedback.js passed");