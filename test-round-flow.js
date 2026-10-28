import assert from "node:assert/strict";
import {
    ROUND_PHASES,
    isPlayablePhase,
    transitionToResolving,
    transitionToAftermath,
    transitionToReady,
    transitionToPlaying,
    getPacingProfile
} from "./game/roundFlow.js";

const ui = { roundPhase: ROUND_PHASES.PLAYING };

assert.equal(isPlayablePhase(ui.roundPhase), true);
assert.equal(transitionToResolving(ui), true);
assert.equal(ui.roundPhase, ROUND_PHASES.RESOLVING);

assert.equal(transitionToResolving(ui), false, "Double-resolve should be blocked");

transitionToAftermath(ui);
assert.equal(ui.roundPhase, ROUND_PHASES.AFTERMATH);
assert.equal(isPlayablePhase(ui.roundPhase), false);

transitionToReady(ui);
assert.equal(ui.roundPhase, ROUND_PHASES.READY);

transitionToPlaying(ui);
assert.equal(ui.roundPhase, ROUND_PHASES.PLAYING);
assert.equal(isPlayablePhase(ui.roundPhase), true);

const standard = getPacingProfile("standard");
const cinematic = getPacingProfile("cinematic");
const fast = getPacingProfile("fast");

assert.equal(standard.aftermathMs > fast.aftermathMs, true);
assert.equal(cinematic.aftermathMs > standard.aftermathMs, true);
assert.equal(fast.readyAutoMs > 0, true);

console.log("test-round-flow.js passed");
