import assert from "node:assert/strict";

// Minimal DOM/storage environment so main.js can load in Node.
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

const { handleEndRound } = await import("./main.js");
const { gameState } = await import("./game/state.js");
import { initResourceSystem } from "./game/resourceManagement.js";
import { initInteractionState } from "./game/cardInteractions.js";
import { initOppositionSystem } from "./game/oppositionSystem.js";
import { initOppositionActions } from "./game/oppositionActions.js";
import { ROUND_PHASES } from "./game/roundFlow.js";

function setupActiveState() {
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
    gameState.ui = { roundPhase: ROUND_PHASES.PLAYING, pacingMode: "standard", orientationMode: "portrait", markerVerbosity: "normal", feed: { items: [], maxItems: 40, markerVerbosity: "normal" } };
    gameState.opposition = undefined;
    initResourceSystem();
    initInteractionState();
    initOppositionSystem();
    initOppositionActions();
}

// Case A: Game already over -> handler returns early, no mutation.
setupActiveState();
gameState.gameOver = true;
gameState.round = 5;
const beforeA = {
    round: gameState.round,
    surge: gameState.surge,
    leverage: gameState.leverage,
    tracks: { ...gameState.tracks },
    resources: { ...gameState.resources },
    playsThisRound: gameState.playsThisRound,
    handLength: gameState.playerHand.length
};
handleEndRound();
assert.equal(gameState.round, beforeA.round, "game-over: round should not change");
assert.equal(gameState.surge, beforeA.surge, "game-over: surge should not change");
assert.equal(gameState.leverage, beforeA.leverage, "game-over: leverage should not change");
assert.deepEqual(gameState.tracks, beforeA.tracks, "game-over: tracks should not change");
assert.deepEqual(gameState.resources, beforeA.resources, "game-over: resources should not change");
assert.equal(gameState.playsThisRound, beforeA.playsThisRound, "game-over: playsThisRound should not change");
assert.equal(gameState.playerHand.length, beforeA.handLength, "game-over: hand should not change");

// Case B: Game still active -> normal transition permitted.
setupActiveState();
const roundBeforeB = gameState.round;
handleEndRound();
// endRound runs (round advances if not game over, or sets gameOver if max round).
// With round 1 < maxRounds 10, round should advance to 2.
assert.equal(gameState.round, roundBeforeB + 1, "active game: round should advance");
assert.equal(gameState.gameOver, false, "active game: should not be game over");

// Case C: Repeated end-round request after game over cannot trigger another transition.
setupActiveState();
gameState.round = gameState.maxRounds;
gameState.gameOver = false;
handleEndRound();
assert.equal(gameState.gameOver, true, "should set game over at max round");
const roundAfterGO = gameState.round;
const surgeAfterGO = gameState.surge;
handleEndRound(); // second request
assert.equal(gameState.round, roundAfterGO, "second handleEndRound should not advance round");
assert.equal(gameState.surge, surgeAfterGO, "second handleEndRound should not change surge");

console.log("test-handleendround-guard.js passed");