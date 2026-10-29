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

const { renderHand, startGame } = await import("./main.js");
const { gameState } = await import("./game/state.js");

// Helper to set up a completed game-over state without recording twice.
function setupGameOverState(round) {
    gameState.gameOver = true;
    gameState.round = round;
    gameState.tracks = { care: 10, climate: 10, solidarity: 10, authority: 5, capital: 5, strain: 5 };
    gameState.pushback = { value: 2 };
    gameState.memory = { cardsPlayed: [] };
    gameState.difficulty = { mode: "normal" };
    gameState.ui = { roundPhase: "PLAYING" };
}

// 1. First completed game: first render records, second does not.
setupGameOverState(5);
renderHand();
let stats = JSON.parse(store.get("systemshift_stats") || "{}");
const gamesAfterFirst = stats.games || 0;
assert.ok(gamesAfterFirst >= 1, "first render should record a game");

// UI must remain rendered on the second call.
const handDiv = globalThis.document.getElementById("hand");
const htmlAfterFirst = handDiv.innerHTML;
renderHand();
stats = JSON.parse(store.get("systemshift_stats") || "{}");
assert.equal(stats.games, gamesAfterFirst, "repeated render must not record game again");
assert.ok(handDiv.innerHTML.includes("End Of Cycle"), "game-over UI must render on repeated render");

// 2. Real new-game lifecycle reset via startGame().
// startGame() resets the guard internally; do not call resetGameOverRecorded().
store.clear(); // clear stats to make the second game's recording observable
const gamesBeforeSecond = (JSON.parse(store.get("systemshift_stats") || "{}").games) || 0;

// Drive through the real startGame() path.
startGame();
// startGame resets gameOver to false and the guard; simulate the game ending again.
setupGameOverState(9);
renderHand();
stats = JSON.parse(store.get("systemshift_stats") || "{}");
assert.equal(stats.games, gamesBeforeSecond + 1, "new game via startGame() should record once");

// Repeated render of the second game must not record again.
renderHand();
stats = JSON.parse(store.get("systemshift_stats") || "{}");
assert.equal(stats.games, gamesBeforeSecond + 1, "repeated render of new game must not record again");

console.log("test-gameover-guard.js passed");