import assert from "node:assert/strict";

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
        classList: makeClassList()
    };
    el.appendChild = (child) => { el.children.push(child); return child; };
    el.prepend = (child) => { el.children.unshift(child); return child; };
    el.querySelector = () => mkEl();
    el.querySelectorAll = () => [];
    el.addEventListener = () => {};
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
const elementCache = { hand: handEl, ambientCanvas: canvasMock };

globalThis.document = {
    querySelectorAll: () => [],
    querySelector: () => mkEl(),
    getElementById: (id) => (elementCache[id] ? elementCache[id] : mkEl()),
    body: { appendChild() {}, style: {}, contains() { return true; }, classList: makeClassList() },
    createElement: (tag) => (tag === "canvas" ? { ...canvasMock } : mkEl()),
    addEventListener() {}
};
globalThis.window = {
    innerWidth: 800,
    innerHeight: 600,
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

// Normal gameplay: the class must be absent and cards must render.
startGame();
assert.equal(handEl.classList.contains("game-over-active"), false,
    "normal gameplay should not apply the game-over layout class");
assert.ok(handEl.children.length > 0, "normal gameplay should render hand cards");

// Game over: renderHand must activate the class and render the ending panel.
gameState.gameOver = true;
renderHand();
assert.equal(handEl.classList.contains("game-over-active"), true,
    "game over should apply the game-over layout class");
assert.match(handEl.innerHTML, /class="game-over"/,
    "game over should render the ending panel");

// Restart: startGame resets gameOver and renderHand must remove the class.
startGame();
assert.equal(gameState.gameOver, false, "restart should clear gameOver");
assert.equal(handEl.classList.contains("game-over-active"), false,
    "restart should remove the game-over layout class");
assert.doesNotMatch(handEl.innerHTML, /class="game-over"/,
    "restart should remove the ending panel");
assert.ok(handEl.children.length > 0, "restart should render the normal hand");

console.log("test-gameover-class.js passed");
