import assert from "node:assert/strict";
import { gameState } from "./game/state.js";
import {
    initEventSurface,
    publishGameEvent,
    getFeedItems,
    snapshotFeedCursor,
    getEventsAfter,
    setFeedCap
} from "./game/uiEvents.js";

initEventSurface();
setFeedCap(3);

const cursor = snapshotFeedCursor();

const eventA = publishGameEvent({
    source: "test",
    severity: "warning",
    title: "Test marker",
    body: "Event mapping should normalize correctly.",
    deltas: { strain: 2, invalid: "x", zero: 0 }
});

assert.equal(typeof eventA.id, "string");
assert.equal(eventA.round, gameState.round);
assert.equal(eventA.source, "test");
assert.equal(eventA.severity, "warning");
assert.deepEqual(eventA.deltas, { strain: 2 });
assert.equal(typeof eventA.forces.movement, "number");
assert.equal(typeof eventA.forces.elite, "number");
assert.equal(typeof eventA.dominantForce, "string");

publishGameEvent({ source: "test", title: "Second marker" });
publishGameEvent({ source: "test", title: "Third marker" });
publishGameEvent({ source: "test", title: "Fourth marker" });

const feed = getFeedItems();
assert.equal(feed.length, 4, "Feed cap enforces a minimum threshold and should retain current markers");
assert.equal(feed[0].title, "Fourth marker");

const after = getEventsAfter(cursor);
assert.equal(after.length, 4, "Cursor query should respect feed cap");

console.log("test-event-surface.js passed");
