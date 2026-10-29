import assert from "node:assert/strict";

import { setSeed, getSeed } from "./game/rng.js";
import { applyBurnMechanics } from "./game/resourceManagement.js";
import { applyRandomEffects } from "./game/cardInteractions.js";
import { updateHiddenTracks, hiddenTracks } from "./game/hiddenTracks.js";
import { gameState } from "./game/state.js";

function resetState() {
    gameState.tracks = { care: 10, climate: 10, solidarity: 10, authority: 10, capital: 10, strain: 5 };
    gameState.resources = { political: 5, social: 5, momentum: 2, infrastructure: 0 };
    gameState.round = 3;
    hiddenTracks.eliteCohesion = 10;
    hiddenTracks.movementMorale = 10;
    hiddenTracks.internationalPressure = 5;
}

// 1. applyBurnMechanics determinism
setSeed(12345);
resetState();
const burnsA = applyBurnMechanics({ tags: ["major"], suit: "care" });

setSeed(12345);
resetState();
const burnsB = applyBurnMechanics({ tags: ["major"], suit: "care" });

assert.deepEqual(burnsA, burnsB, "applyBurnMechanics should be deterministic for same seed");
console.log("burn determinism: OK");

// 2. Bounds: burn types and amounts valid
burnsA.forEach(b => {
    assert.ok(["political", "social", "momentum"].includes(b.type), "burn type valid");
    assert.ok(b.amount > 0, "burn amount positive");
});
console.log("burn bounds: OK");

// 3. applyRandomEffects determinism
setSeed(999);
const fx1 = applyRandomEffects({ suit: "system", effects: { solidarity: 1 }, id: 901 });

setSeed(999);
const fx2 = applyRandomEffects({ suit: "system", effects: { solidarity: 1 }, id: 901 });

assert.deepEqual(fx1, fx2, "applyRandomEffects should be deterministic for same seed");
console.log("random-effects determinism: OK");

// 4. updateHiddenTracks determinism
setSeed(777);
resetState();
updateHiddenTracks();
const ip1 = hiddenTracks.internationalPressure;

setSeed(777);
resetState();
updateHiddenTracks();
const ip2 = hiddenTracks.internationalPressure;

assert.equal(ip1, ip2, "updateHiddenTracks should be deterministic for same seed");
assert.ok(ip1 >= 0 && ip1 <= 10, "internationalPressure within bounds");
console.log("hidden-tracks determinism: OK");

// 5. Different seeds can produce different burn outcomes (sequence-level, not per-draw)
const outcomes = new Set();
for (const seed of [1, 2, 3, 4, 5, 10, 42, 100]) {
    setSeed(seed);
    resetState();
    const b = applyBurnMechanics({ tags: ["major", "risk"], suit: "risk" });
    outcomes.add(JSON.stringify(b));
}
assert.ok(outcomes.size > 1, "different seeds should produce varied burn outcomes");
console.log("seed variation (burns): OK, distinct outcome sets =", outcomes.size);

// 6. Math.random not used in these modules (static check done manually)
console.log("test-rng-determinism.js passed");