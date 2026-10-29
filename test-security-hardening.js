import assert from "node:assert/strict";

// Minimal browser-ish environment for module smoke tests.
const storage = new Map();
globalThis.localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); }
};

function makeElement() {
    const el = {
        className: "",
        innerHTML: "",
        textContent: "",
        style: {},
        dataset: {},
        children: [],
        appendChild(child) { this.children.push(child); return child; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        remove() {}
    };
    return el;
}

globalThis.document = {
    body: makeElement(),
    createElement() { return makeElement(); },
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {}
};

const { initNarrative, narrativeState } = await import("./game/narrative.js");
const { initTutorial, tutorialState } = await import("./game/tutorial.js");

// 1. Malformed narrative JSON must not crash initNarrative.
storage.set("systemShiftNarrative", "{not json");
const beforeBeats = narrativeState.storyBeats.length;
initNarrative();
assert.ok(Array.isArray(narrativeState.storyBeats), "storyBeats remains array after malformed JSON");
console.log("narrative malformed-json init: OK");

// 2. Valid narrative JSON still applies known fields.
storage.clear();
const validNarrative = JSON.stringify({
    storyBeats: ["act1_start"],
    historicalEvents: ["care_critical"],
    currentNarrative: { title: "Saved Beat" },
    narrativeChoices: [{ beatId: "act1_start", choice: "x", effects: {} }],
    characterArcs: { a: 1 },
    factionRelations: { elite: 5, authoritarian: 2, statusquo: 1 }
});
storage.set("systemShiftNarrative", validNarrative);
// reset module state manually for a clean apply
narrativeState.storyBeats = [];
narrativeState.historicalEvents = [];
narrativeState.currentNarrative = null;
narrativeState.narrativeChoices = [];
narrativeState.characterArcs = {};
narrativeState.factionRelations = { elite: 0, authoritarian: 0, statusquo: 0 };
initNarrative();
assert.deepEqual(narrativeState.storyBeats, ["act1_start"]);
assert.deepEqual(narrativeState.historicalEvents, ["care_critical"]);
assert.equal(narrativeState.currentNarrative.title, "Saved Beat");
assert.equal(narrativeState.narrativeChoices.length, 1);
assert.equal(narrativeState.factionRelations.elite, 5);
console.log("narrative valid-json init: OK");

// 3. Malformed narrative value (non-object) must not overwrite state.
storage.clear();
storage.set("systemShiftNarrative", JSON.stringify(42));
narrativeState.storyBeats = ["keep"];
initNarrative();
// initNarrative resets runtime state first, then triggers act1_start.
assert.deepEqual(narrativeState.storyBeats, ["act1_start"]);
console.log("narrative non-object-json init: OK");

// 4. Inaccessible storage (getItem throws) must not crash.
const throwingStorage = {
    getItem() { throw new Error("storage blocked"); },
    setItem() { throw new Error("storage blocked"); },
    removeItem() {}
};
globalThis.localStorage = throwingStorage;
// reset
narrativeState.storyBeats = [];
initNarrative();
assert.ok(Array.isArray(narrativeState.storyBeats));
console.log("narrative inaccessible-storage init: OK");

// 5. Tutorial malformed JSON must not crash.
const storage2 = new Map();
globalThis.localStorage = {
    getItem(key) { return storage2.get(key) ?? null; },
    setItem(key, value) { storage2.set(key, String(value)); },
    removeItem(key) { storage2.delete(key); }
};
storage2.set("systemShiftTutorial", "{bad");
tutorialState.completedSteps = [];
tutorialState.firstTimeUser = false;
initTutorial();
assert.deepEqual(tutorialState.completedSteps, []);
// Invalid storage should not be overwritten by init.
assert.equal(storage2.get("systemShiftTutorial"), "{bad");
console.log("tutorial malformed-json init: OK");

// 6. Tutorial valid JSON applies fields.
storage2.clear();
storage2.set("systemShiftTutorial", JSON.stringify({
    completedSteps: ["welcome"],
    dismissedTips: ["tip1"],
    firstTimeUser: false,
    showHints: false,
    hintLevel: "detailed",
    enabled: false,
    currentStep: 7
}));
tutorialState.completedSteps = [];
tutorialState.dismissedTips = [];
tutorialState.firstTimeUser = true;
tutorialState.showHints = true;
tutorialState.hintLevel = "normal";
tutorialState.enabled = true;
tutorialState.currentStep = 0;
initTutorial();
assert.deepEqual(tutorialState.completedSteps, ["welcome"]);
assert.deepEqual(tutorialState.dismissedTips, ["tip1"]);
assert.equal(tutorialState.firstTimeUser, false);
assert.equal(tutorialState.showHints, false);
assert.equal(tutorialState.hintLevel, "detailed");
assert.equal(tutorialState.enabled, false);
assert.equal(tutorialState.currentStep, 7);
console.log("tutorial valid-json init: OK");

// 7. Tutorial inaccessible storage must not crash.
globalThis.localStorage = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() {}
};
tutorialState.completedSteps = [];
initTutorial();
assert.deepEqual(tutorialState.completedSteps, []);
console.log("tutorial inaccessible-storage init: OK");

console.log("test-security-hardening.js passed");