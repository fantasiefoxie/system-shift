import assert from "node:assert/strict";

import { applyComboBonus, applySynergyBonus, applyCounterPenalty } from "./game/cardInteractions.js";
import { gameState } from "./game/state.js";

function resetTracks(care = 10) {
    gameState.tracks = { care, climate: 8, solidarity: 6, authority: 10, capital: 10, strain: 5 };
}

// Combo bonus above 20 clamps to 20.
resetTracks(18);
applyComboBonus({ care: 5 });
assert.equal(gameState.tracks.care, 20, "combo bonus should clamp care to 20");

// Synergy bonus above 20 clamps to 20.
resetTracks(18);
applySynergyBonus({ care: 5 });
assert.equal(gameState.tracks.care, 20, "synergy bonus should clamp care to 20");

// Counter penalty below 0 clamps to 0.
resetTracks(2);
applyCounterPenalty({ care: -5 });
assert.equal(gameState.tracks.care, 0, "counter penalty should clamp care to 0");

// In-range combo mutation applies normally.
resetTracks(10);
applyComboBonus({ care: 2 });
assert.equal(gameState.tracks.care, 12, "in-range combo bonus should apply");

// In-range counter penalty applies normally.
resetTracks(10);
applyCounterPenalty({ care: -2 });
assert.equal(gameState.tracks.care, 8, "in-range counter penalty should apply");

// Authority lower clamp still works (regression for prior behavior).
resetTracks(2);
gameState.tracks.authority = 2;
applyComboBonus({ authority: -5 });
assert.equal(gameState.tracks.authority, 0, "authority should clamp to 0");

console.log("test-card-clamping.js passed");