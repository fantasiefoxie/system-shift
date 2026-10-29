import assert from "node:assert/strict";

const store = new Map();
globalThis.localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
};

import { applyResourceRecovery } from "./game/resourceManagement.js";
import { gameState } from "./game/state.js";
import { initResourceSystem } from "./game/resourceManagement.js";

function setupState(recoveryPenalty) {
    initResourceSystem();
    gameState.resourceState.recoveryPenalty = recoveryPenalty;
    // Ensure resources at a known baseline.
    gameState.resources.political = 5;
    gameState.resources.social = 5;
    gameState.resources.momentum = 5;
    gameState.resources.infrastructure = 0;
    gameState.tracks = { care: 8, climate: 8, solidarity: 6, authority: 10, capital: 10, strain: 5 };
    gameState.surge = 0;
}

// 1. No penalty: normal recovery applies exactly.
setupState(0);
// Baseline: authority 10 (not >12, not <5) => political recovery 2.
// solidarity 6 (not >12, not <5) => social recovery 2.
// surge 0 (not >8), strain 5 (not >15) => momentum recovery 1.
// infrastructure 0 => infraBonus 0.
// momentumDecay true, momentum starts 0 => recovery +1 then decay -1 => net 0.
// Expected: political 5+2=7, social 5+2=7, momentum 0+1-1=0, infrastructure 0.
const beforeNone = { political: 5, social: 5, momentum: 0, infrastructure: 0 };
gameState.resources = { ...beforeNone };
applyResourceRecovery();
assert.equal(gameState.resources.political, 7, "political should recover by exactly 2 without penalty");
assert.equal(gameState.resources.social, 7, "social should recover by exactly 2 without penalty");
assert.equal(gameState.resources.momentum, 0, "momentum should net 0 (recovery 1 minus decay 1)");
assert.equal(gameState.resources.infrastructure, 0, "infrastructure should remain 0 (no recovery)");
assert.equal(gameState.resourceState.recoveryPenalty || 0, 0, "no penalty should remain 0");

// 2. Penalty of 2 on a resource with exactly 1 normal recovery -> contribution exactly 0.
setupState(2);
// authority 3 (<5) reduces political recovery from 2 to 1.
gameState.tracks.authority = 3;
gameState.resources.political = 5;
gameState.resources.social = 5;
gameState.resources.momentum = 0; // no momentum decay interaction
gameState.resources.infrastructure = 0;
const beforePoly = gameState.resources.political;
applyResourceRecovery();
// political recovery 1 - penalty 2 = 0 (floored) -> no addResource call.
assert.equal(gameState.resources.political, beforePoly, "political recovery contribution should be exactly 0 under penalty");
// Penalty consumed.
assert.equal(gameState.resourceState.recoveryPenalty || 0, 0, "penalty should be consumed");

// 3. Recovery greater than penalty: recovery 5 with penalty 2 -> 3.
setupState(2);
// authority 13 (>12) => political recovery +1; infrastructure 8 => infraBonus +2. Base 2+1+2 = 5.
gameState.tracks.authority = 13;
gameState.resources.infrastructure = 8;
gameState.resources.political = 3;
const beforeGreater = gameState.resources.political;
applyResourceRecovery();
// 5 - 2 = 3 recovery applied; infrastructureMaintenance is 0 (buildInfrastructure not called), so no consumption.
assert.equal(gameState.resources.political, beforeGreater + 3, "recovery 5 minus penalty 2 should net +3");
assert.equal(gameState.resourceState.recoveryPenalty || 0, 0, "penalty consumed");

// 4. Recovery equal to penalty: resulting contribution is 0.
setupState(2);
// authority 3 (<5) => political recovery 1. penalty 2 -> floored 0.
gameState.tracks.authority = 3;
gameState.resources.political = 5;
gameState.resources.infrastructure = 0;
const beforeEqual = gameState.resources.political;
applyResourceRecovery();
assert.equal(gameState.resources.political, beforeEqual, "recovery equal-or-below penalty should contribute 0");

// 5. Penalty clears after one phase: subsequent recovery normal.
setupState(0);
const before5 = gameState.resources.political;
applyResourceRecovery();
assert.equal(gameState.resources.political, before5 + 2, "recovery should apply +2 after penalty consumed");

// 6. Momentum positive recovery under penalty.
setupState(2);
// surge 9 (>8) => momentum recovery +2. penalty 2 -> 0. momentumDecay true, momentum 5>0 -> -1.
gameState.surge = 9;
gameState.resources.momentum = 5;
const beforeMom = gameState.resources.momentum;
applyResourceRecovery();
assert.equal(gameState.resources.momentum, beforeMom, "momentum recovery 3 minus penalty 2 = 1, then decay -1 => net 0");

// 7. Non-stacking: reapply penalty twice.
setupState(2);
gameState.resourceState.recoveryPenalty = 2; // re-apply
applyResourceRecovery();
assert.equal(gameState.resourceState.recoveryPenalty || 0, 0, "penalty consumed after recovery");

// 8. New game starts without stale penalty.
setupState(2);
initResourceSystem();
assert.equal(gameState.resourceState.recoveryPenalty, undefined, "new game should clear recoveryPenalty");

console.log("test-recovery-penalty.js passed");