import assert from "node:assert/strict";

import { scoutFaction, scoutedFactions } from "./game/scouting.js";
import { gameState } from "./game/state.js";

// Minimal state for scouting.
gameState.surge = 5;
gameState.opposition = { factions: {} };

// Invalid faction: no surge deduction, returns false.
const surgeBeforeInvalid = gameState.surge;
const resultInvalid = scoutFaction("nonexistent");
assert.equal(resultInvalid, false, "invalid faction should return false");
assert.equal(gameState.surge, surgeBeforeInvalid, "invalid faction must not change surge");

// Set up a valid faction.
gameState.opposition.factions.elite = { threatLevel: 20, active: true };
gameState.round = 3;
gameState.ui = { feed: { items: [] } };
gameState.surge = 5;

const resultValid = scoutFaction("elite");
assert.equal(resultValid, true, "valid faction should return true");
assert.equal(gameState.surge, 2, "valid scout should deduct exactly 3 surge");

// Scouting result must be recorded.
assert.ok(scoutedFactions.elite, "scoutedFactions should contain elite entry");
assert.equal(typeof scoutedFactions.elite.intent, "string", "intent should be a string");
assert.equal(scoutedFactions.elite.threatLevel, 20, "recorded threatLevel should match");
assert.equal(scoutedFactions.elite.active, true, "recorded active flag should match");
assert.equal(scoutedFactions.elite.expiresRound, gameState.round + 1, "expiry should be next round");

// Scouting event must be published.
const scoutEvent = (gameState.ui.feed.items || []).find(e => e.source === "scouting");
assert.ok(scoutEvent, "a scouting event should be published");
assert.equal(scoutEvent.id, `scout-elite-${gameState.round}`, "event id should match faction and round");

// Insufficient surge still returns false without mutation.
gameState.surge = 1;
const beforeLow = gameState.surge;
const resultLow = scoutFaction("elite");
assert.equal(resultLow, false, "insufficient surge should return false");
assert.equal(gameState.surge, beforeLow, "insufficient surge must not change surge");

console.log("test-scouting.js passed");