import assert from "node:assert/strict";

/* ================================================= */
/* NARRATIVE CHOICE UI REFRESH REGRESSION TEST       */
/* Exercises the real main.js render path through a  */
/* minimal DOM mock, including modal click handling. */
/* ================================================= */

const store = new Map();
globalThis.localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
};

function createClassList() {
    const values = new Set();
    return {
        add(...names) { names.forEach(name => values.add(name)); },
        remove(...names) { names.forEach(name => values.delete(name)); },
        toggle(name, force) {
            const enabled = force === undefined ? !values.has(name) : Boolean(force);
            if (enabled) values.add(name);
            else values.delete(name);
            return enabled;
        },
        contains(name) { return values.has(name); }
    };
}

function createElement(tag = "div") {
    const children = [];
    const listeners = new Map();
    let innerHTML = "";

    const el = {
        tagName: String(tag).toUpperCase(),
        style: {},
        textContent: "",
        dataset: {},
        disabled: false,
        removed: false,
        offsetWidth: 0,
        classList: createClassList(),
        children,
        appendChild(child) {
            children.push(child);
            child.parentElement = el;
            return child;
        },
        prepend(child) {
            children.unshift(child);
            child.parentElement = el;
            return child;
        },
        remove() {
            el.removed = true;
            if (el.parentElement && Array.isArray(el.parentElement.children)) {
                const index = el.parentElement.children.indexOf(el);
                if (index >= 0) el.parentElement.children.splice(index, 1);
            }
        },
        setAttribute(name, value) { el[name] = value; },
        removeAttribute(name) { delete el[name]; },
        addEventListener(type, handler) {
            if (!listeners.has(type)) listeners.set(type, []);
            listeners.get(type).push(handler);
        },
        dispatch(type) {
            (listeners.get(type) || []).forEach(handler => handler({ target: el, currentTarget: el }));
        },
        click() { el.dispatch("click"); },
        querySelector(selector) {
            if (selector.startsWith(".")) {
                const className = selector.slice(1);
                const found = children.find(child =>
                    String(child.className || "").split(/\s+/).includes(className)
                );
                if (found) return found;
                const created = createElement("div");
                created.className = className;
                el.appendChild(created);
                return created;
            }
            return null;
        },
        querySelectorAll(selector) {
            if (el._selectorAll && el._selectorAll[selector]) return el._selectorAll[selector];
            return [];
        }
    };

    Object.defineProperty(el, "className", {
        get() { return el._className || ""; },
        set(value) {
            el._className = String(value);
            el.classList = createClassList();
            el._className.split(/\s+/).filter(Boolean).forEach(name => el.classList.add(name));
        }
    });

    Object.defineProperty(el, "innerHTML", {
        get() { return innerHTML; },
        set(value) {
            innerHTML = String(value);
            const choiceIndexes = [...innerHTML.matchAll(/data-choice="(\d+)"/g)].map(match => match[1]);
            if (choiceIndexes.length > 0) {
                el._selectorAll = {
                    ".narrative-choice": choiceIndexes.map(index => {
                        const button = createElement("button");
                        button.dataset.choice = index;
                        return button;
                    })
                };
            }
        }
    });

    el.parentElement = el;
    return el;
}

const elementCache = new Map();
const resourceIds = new Set(["politicalStat", "socialStat", "momentumStat", "infrastructureStat"]);
function getElement(id) {
    if (!elementCache.has(id)) {
        const el = createElement("div");
        if (id.startsWith("track-")) {
            const value = createElement("div");
            value.className = "halo-value";
            const ring = createElement("div");
            ring.className = "halo-ring";
            el.appendChild(value);
            el.appendChild(ring);
        }
        if (resourceIds.has(id)) {
            const fill = createElement("div");
            fill.className = "resource-fill";
            el.appendChild(fill);
        }
        elementCache.set(id, el);
    }
    return elementCache.get(id);
}

const canvasMock = {
    width: 800,
    height: 600,
    style: {},
    classList: createClassList(),
    getContext: () => ({
        fillRect() {}, clearRect() {}, beginPath() {}, arc() {}, fill() {},
        moveTo() {}, lineTo() {}, stroke() {}
    })
};

const documentBody = createElement("body");
documentBody.contains = () => true;
globalThis.document = {
    querySelectorAll: () => [],
    querySelector: () => createElement("div"),
    getElementById: id => (id === "ambientCanvas" ? canvasMock : getElement(id)),
    body: documentBody,
    createElement: tag => (tag === "canvas" ? canvasMock : createElement(tag)),
    addEventListener() {}
};

globalThis.window = {
    innerWidth: 1280,
    innerHeight: 800,
    addEventListener() {},
    selectDifficulty() {},
    markTutorialComplete() {},
    openAchievementsModal() {},
    negotiate() {},
    closeNegotiationModal() {},
    requestAnimationFrame: () => 0,
    setTimeout: fn => { try { fn(); } catch (e) { /* ignore */ } return 0; },
    clearTimeout: () => {}
};
globalThis.confirm = () => true;
globalThis.alert = () => {};
globalThis.setTimeout = fn => { try { fn(); } catch (e) { /* ignore */ } return 0; };
globalThis.clearTimeout = () => {};
globalThis.requestAnimationFrame = () => 0;
globalThis.Audio = class {
    constructor() { this.play = () => Promise.resolve(); this.pause = () => {}; this.load = () => {}; }
};

const { startGame } = await import("./main.js");
const { gameState } = await import("./game/state.js");
const { narrativeState, triggerStoryBeat } = await import("./game/narrative.js");

const trackValue = id => String(getElement(id).querySelector(".halo-value").textContent);
const lastModal = () => documentBody.children.filter(child =>
    String(child.className || "").split(/\s+/).includes("narrative-modal")
).pop();

/* 1. Fresh game opens the real opening story beat. */
startGame();

let modal = lastModal();
assert.equal(modal.removed, false, "opening narrative modal should be mounted");
assert.equal(modal.querySelectorAll(".narrative-choice").length, 2, "opening beat should offer two choices");
assert.equal(gameState.tracks.solidarity, 6, "fresh game starts with Solidarity 6");
assert.equal(trackValue("track-solidarity"), "6", "fresh render shows Solidarity 6");

/* 2. Opening choice applies immediately to state and visible track. */
const opening = modal.querySelectorAll(".narrative-choice")[0];
opening.click();

assert.equal(gameState.tracks.solidarity, 7, "choice raises Solidarity 6 -> 7");
assert.equal(trackValue("track-solidarity"), "7", "visible Solidarity track refreshes immediately");
assert.equal(modal.removed, true, "narrative modal closes after a choice");
assert.equal(narrativeState.narrativeChoices.length, 1, "choice recorded exactly once");
assert.equal(gameState.ui.feed.items[0].title, "Decision: Build grassroots support", "decision marker appears immediately");

/* 3. Duplicate click / stale event cannot apply the choice again. */
opening.click();
modal.querySelectorAll(".narrative-choice")[1].click();

assert.equal(gameState.tracks.solidarity, 7, "duplicate clicks must not re-apply the choice");
assert.equal(narrativeState.narrativeChoices.length, 1, "duplicate clicks must not record a second choice");
assert.equal(gameState.ui.feed.items.filter(item => item.title === "Decision: Build grassroots support").length, 1, "duplicate clicks must not duplicate the marker");

/* 4. Surge and strain choices refresh their visible indicators immediately. */
triggerStoryBeat("act1_mid");
const midBeat = lastModal();
assert.equal(midBeat.removed, false, "mid-act narrative modal should be mounted");
midBeat.querySelectorAll(".narrative-choice")[0].click();

assert.equal(gameState.surge, 1, "surge choice applies immediately");
assert.equal(String(getElement("surgeStat").textContent), "1", "visible surge stat refreshes immediately");
assert.equal(gameState.tracks.strain, 11, "strain choice applies immediately");
assert.equal(trackValue("track-strain"), "11", "visible strain track refreshes immediately");
assert.equal(midBeat.removed, true, "mid-act modal closes after a choice");

/* 5. Downward track choices also refresh the visible track. */
triggerStoryBeat("act1_end");
const endBeat = lastModal();
endBeat.querySelectorAll(".narrative-choice")[1].click();

assert.equal(gameState.tracks.capital, 19, "capital choice applies immediately");
assert.equal(trackValue("track-capital"), "19", "visible capital track refreshes immediately");
assert.equal(endBeat.removed, true, "act-end modal closes after a choice");

/* 6. Multi-track choice refreshes every affected track. */
triggerStoryBeat("act3_start");
const finalBeat = lastModal();
const careBefore = gameState.tracks.care;
const solidarityBefore = gameState.tracks.solidarity;
finalBeat.querySelectorAll(".narrative-choice")[1].click();

assert.equal(gameState.tracks.care, careBefore + 1, "care choice applies immediately");
assert.equal(gameState.tracks.solidarity, solidarityBefore + 1, "solidarity choice applies immediately");
assert.equal(trackValue("track-care"), String(careBefore + 1), "visible care track refreshes immediately");
assert.equal(trackValue("track-solidarity"), String(solidarityBefore + 1), "visible solidarity track refreshes immediately");

console.log("test-narrative-choice-refresh.js passed");
