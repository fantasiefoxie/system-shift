import assert from "node:assert/strict";

// Minimal DOM/storage environment so main.js and effectResolver can load.
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

// Triggered case: seed 4 makes applyRandomEffects return { capital: 1 }.
setupState();
setSeed(4);
const triggeredCard = { id: 901, suit: "system", title: "System Card", effects: { care: 1 }, cost: 0, tags: ["system"] };
gameState.playerHand = [triggeredCard, { id: 999, suit: "care", title: "Dummy", effects: {}, cost: 0, tags: [] }];
gameState.leverage = 10;
const beforeCare = gameState.tracks.care;
const beforeCapital = gameState.tracks.capital;
await resolveCard(0, () => {});
assert.equal(gameState.tracks.care, beforeCare + 1, "base care effect should apply once");
assert.equal(gameState.tracks.capital, beforeCapital + 1, "random capital effect should be applied");

// Non-trigger case: non-system card never triggers a random effect.
setupState();
setSeed(4);
const plainCard = { id: 101, suit: "care", title: "Care Card", effects: { care: 1 }, cost: 0, tags: ["care"] };
gameState.playerHand = [plainCard, { id: 998, suit: "care", title: "Dummy", effects: {}, cost: 0, tags: [] }];
gameState.leverage = 10;
const beforeCare2 = gameState.tracks.care;
const beforeCapital2 = gameState.tracks.capital;
await resolveCard(0, () => {});
assert.equal(gameState.tracks.care, beforeCare2 + 1, "base care effect should apply once");
assert.equal(gameState.tracks.capital, beforeCapital2, "non-system card should not apply random effect");

console.log("test-random-effect-application.js passed");