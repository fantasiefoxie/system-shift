import assert from "node:assert/strict";
import fs from "node:fs";

// Minimal DOM/storage environment so main.js can load in Node.
const store = new Map();
globalThis.localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
};

function makeClassList() {
    const classes = new Set();
    return {
        add(...names) { names.forEach(name => classes.add(name)); },
        remove(...names) { names.forEach(name => classes.delete(name)); },
        toggle(name, force) {
            const add = force === undefined ? !classes.has(name) : Boolean(force);
            if (add) classes.add(name); else classes.delete(name);
            return add;
        },
        contains(name) { return classes.has(name); }
    };
}

const mkEl = () => {
    const el = {
        style: {},
        innerHTML: "",
        textContent: "",
        children: [],
        scrollTop: 0,
        removed: false,
        listeners: new Map(),
        classList: makeClassList()
    };
    el.appendChild = (child) => { el.children.push(child); return child; };
    el.prepend = (child) => { el.children.unshift(child); return child; };
    el.querySelector = () => mkEl();
    el.querySelectorAll = () => [];
    el.addEventListener = (type, handler) => {
        if (!el.listeners.has(type)) el.listeners.set(type, []);
        el.listeners.get(type).push(handler);
    };
    el.dispatch = (type) => {
        (el.listeners.get(type) || []).forEach(handler => handler({ target: el, currentTarget: el }));
    };
    el.click = () => el.dispatch("click");
    el.remove = () => { el.removed = true; };
    el.parentElement = el;
    return el;
};

const canvasMock = {
    width: 800,
    height: 600,
    getContext: () => ({
        fillRect() {}, clearRect() {}, beginPath() {}, arc() {},
        fill() {}, moveTo() {}, lineTo() {}, stroke() {}
    })
};

const handEl = mkEl();
const elementCache = new Map([
    ["hand", handEl],
    ["ambientCanvas", canvasMock]
]);
const getElement = (id) => {
    if (!elementCache.has(id)) elementCache.set(id, mkEl());
    return elementCache.get(id);
};

globalThis.document = {
    querySelectorAll: () => [],
    querySelector: () => mkEl(),
    getElementById: getElement,
    body: { appendChild() {}, style: {}, contains() { return true; }, classList: makeClassList() },
    createElement: (tag) => (tag === "canvas" ? { ...canvasMock } : mkEl()),
    addEventListener() {}
};
globalThis.window = {
    innerWidth: 375,
    innerHeight: 812,
    addEventListener() {},
    selectDifficulty() {},
    markTutorialComplete() {},
    openAchievementsModal() {},
    negotiate() {},
    closeNegotiationModal() {},
    requestAnimationFrame() {},
    setTimeout(fn) { try { fn(); } catch (e) {} return 0; }
};
globalThis.confirm = () => true;
globalThis.alert = () => {};
globalThis.setTimeout = (fn) => { try { fn(); } catch (e) {} return 0; };
globalThis.requestAnimationFrame = () => 0;
globalThis.Audio = class {
    constructor() {
        this.play = () => Promise.resolve();
        this.pause = () => {};
        this.load = () => {};
    }
};

const { startGame, renderHand } = await import("./main.js");
const { gameState } = await import("./game/state.js");

const appEl = getElement("app");
const difficultyModal = getElement("difficultyModal");

// Mobile game-over CSS: result panel is surfaced above the systems board.
const css = fs.readFileSync(new URL("./style.css", import.meta.url), "utf8");
const mobileGameOverStart = css.indexOf("/* Mobile game-over:");
assert.ok(mobileGameOverStart >= 0, "mobile game-over rules should exist");
const mobileGameOverCss = css.slice(mobileGameOverStart);
for (const rule of [
    "@media (max-width: 760px)",
    "#app.layout-portrait.game-over-mode",
    "grid-template-rows: auto max-content auto",
    "#app.layout-portrait.game-over-mode .operations-lore",
    "grid-row: 2",
    "#app.layout-portrait.game-over-mode .systems-board",
    "grid-row: 3",
    "#app.layout-portrait.game-over-mode .game-over",
    "padding: 24px 28px"
]) {
    assert.ok(mobileGameOverCss.includes(rule), `mobile game-over CSS should include: ${rule}`);
}
assert.ok(
    css.includes("grid-template-columns: minmax(0, 1fr)") && css.includes("overflow-x: hidden"),
    "game-over hand should keep full width and hide horizontal overflow"
);
assert.ok(
    css.includes("grid-template-columns: repeat(5, minmax(132px, 1fr))") && css.includes("overflow-x: auto"),
    "normal mobile hand should keep horizontal scrolling"
);

// Normal gameplay: the game-over layout must not be active.
startGame();
assert.equal(handEl.classList.contains("game-over-active"), false,
    "normal gameplay should not apply the hand game-over class");
assert.equal(appEl.classList.contains("game-over-mode"), false,
    "normal gameplay should not apply the app game-over class");
assert.ok(handEl.children.length > 0, "normal gameplay should render hand cards");

// Game over: both layout classes apply, the panel renders, and scroll resets to the top.
appEl.scrollTop = 240;
gameState.gameOver = true;
renderHand();
assert.equal(handEl.classList.contains("game-over-active"), true,
    "game over should apply the hand game-over layout class");
assert.equal(appEl.classList.contains("game-over-mode"), true,
    "game over should apply the app game-over layout class");
assert.equal(appEl.scrollTop, 0,
    "game over should reset app scroll so the result panel starts in view");
assert.match(handEl.innerHTML, /class="game-over"/,
    "game over should render the ending panel");
assert.match(handEl.innerHTML, /id="restartBtn"/,
    "game over should render the Restart action");

// Restart action opens difficulty selection, then restores the normal hand.
getElement("restartBtn").click();
assert.equal(difficultyModal.style.display, "flex",
    "Restart should open the difficulty selection");
window.selectDifficulty("normal");
assert.equal(gameState.gameOver, false, "restart should clear gameOver");
assert.equal(handEl.classList.contains("game-over-active"), false,
    "restart should remove the hand game-over class");
assert.equal(appEl.classList.contains("game-over-mode"), false,
    "restart should remove the app game-over class");
assert.doesNotMatch(handEl.innerHTML, /class="game-over"/,
    "restart should remove the ending panel");
assert.ok(handEl.children.length > 0, "restart should render the normal hand");

console.log("test-gameover-class.js passed");
