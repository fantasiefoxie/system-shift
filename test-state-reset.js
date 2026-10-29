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

const { startGame } = await import("./main.js");
const { gameState } = await import("./game/state.js");
const { hiddenTracks } = await import("./game/hiddenTracks.js");
const { narrativeState } = await import("./game/narrative.js");
const { scoutedFactions } = await import("./game/scouting.js");

// First game.
startGame();

// Mutate state to non-default values.
gameState.tracks.care = 19;
gameState.tracks.strain = 19;
gameState.pushback.value = 15;
gameState.pushback.eliteResistance = 7;
gameState.memory.cardsPlayed.push({ id: 999 });
gameState.memory.maxCare = 99;
gameState.delayedEffects.push({ triggered: false, roundsUntilTrigger: 2 });
gameState.tagsPlayedThisRound.push("risk");
gameState.hiddenTracks.eliteCohesion = 0;
hiddenTracks.internationalPressure = 9;
gameState.revealed.hiddenTracks = true;
gameState.activeThresholds.push("dual_power");
gameState.negotiation.history.push({ round: 1 });
gameState.narrative.storyBeats.push("act1_mid");
gameState.ui.feed.items.push({ id: "x" });
gameState.gameOver = true;

const firstTracksRef = gameState.tracks;
const firstMemoryRef = gameState.memory;

// Seed stale persisted narrative from a previous game; a fresh start must ignore it.
store.set("systemShiftNarrative", JSON.stringify({
    storyBeats: ["act3_end"],
    characterArcs: { staleArc: 4 },
    factionRelations: { elite: 9, authoritarian: 9, statusquo: 9 },
    historicalEvents: [{ id: "stale-event" }],
    currentNarrative: { title: "Legacy" },
    narrativeChoices: [{ beatId: "act3_end", choice: "stale", effects: {} }]
}));

// Seed module-level state with non-default values to prove reset occurs.
narrativeState.storyBeats = ["seeded-beat"];
narrativeState.characterArcs = { seeded: 1 };
narrativeState.historicalEvents = ["seeded-event"];
narrativeState.narrativeChoices = [{ beatId: "seeded", choice: "x", effects: {} }];
narrativeState.currentNarrative = { title: "Seeded" };
narrativeState.factionRelations = { elite: 9, authoritarian: 9, statusquo: 9 };
hiddenTracks.eliteCohesion = 0;
hiddenTracks.movementMorale = 0;
hiddenTracks.internationalPressure = 9;
// Seed stale scouting result with expiry beyond the new game's opening round.
scoutedFactions.elite = { intent: "stale", expiresRound: 99, threatLevel: 99, active: true };

// Second game via real startGame().
startGame();

// Tracks reset to defaults.
assert.deepEqual(gameState.tracks, { care: 8, climate: 8, solidarity: 6, authority: 10, capital: 20, strain: 10 }, "tracks reset");
assert.equal(gameState.pushback.value, 0, "pushback.value reset");
assert.equal(gameState.pushback.eliteResistance, 0, "pushback.eliteResistance reset");
assert.deepEqual(gameState.memory, { maxCare: 8, maxClimate: 8, cardsPlayed: [], eventsChosen: [] }, "memory reset");
assert.deepEqual(gameState.delayedEffects, [], "delayedEffects reset");
assert.deepEqual(gameState.tagsPlayedThisRound, [], "tagsPlayedThisRound reset");
assert.equal(gameState.hiddenTracks.eliteCohesion, 10, "gameState.hiddenTracks reset");
assert.equal(hiddenTracks.internationalPressure, 5, "module hiddenTracks reset");
assert.deepEqual(scoutedFactions, {}, "scoutedFactions reset between games");
assert.equal(gameState.revealed.hiddenTracks, false, "revealed reset");
assert.deepEqual(gameState.activeThresholds, [], "activeThresholds reset");
// Module-level narrative state is reset, then act1_start triggers on a fresh start.
assert.deepEqual(narrativeState.storyBeats, ["act1_start"], "narrativeState reset and act1_start triggered");
assert.ok(!narrativeState.historicalEvents.includes("seeded-event"), "seeded narrative event cleared");
assert.ok(!narrativeState.storyBeats.includes("act3_end"), "stale persisted story beats ignored on restart");
assert.equal(narrativeState.currentNarrative.title, "The Movement Begins", "narrativeState currentNarrative reset");
assert.deepEqual(narrativeState.factionRelations, { elite: 0, authoritarian: 0, statusquo: 0 }, "stale persisted faction relations ignored");
assert.equal(narrativeState.narrativeChoices.length, 0, "stale persisted narrative choices ignored");
assert.deepEqual(gameState.negotiation, { usedThisAct: [], history: [] }, "negotiation reset");
assert.deepEqual(gameState.narrative, { storyBeats: [], characterArcs: {}, factionRelations: { elite: 0, authoritarian: 0, statusquo: 0 }, historicalEvents: [], currentNarrative: null, narrativeChoices: [] }, "gameState.narrative reset");
assert.ok(!gameState.ui.feed.items.some(i => i.id === "x"), "previous feed items cleared");
assert.equal(gameState.gameOver, false, "gameOver reset");
assert.equal(gameState.round, 1, "round reset");

// Fresh instances (no shared references).
assert.notEqual(gameState.tracks, firstTracksRef, "tracks is a fresh object");
assert.notEqual(gameState.memory, firstMemoryRef, "memory is a fresh object");
assert.notEqual(gameState.memory.cardsPlayed, firstMemoryRef.cardsPlayed, "cardsPlayed is a fresh array");

console.log("test-state-reset.js passed");