/* ================================================= */
/* SYSTEM SHIFT - UI EVENT SURFACE                    */
/* Normalized player-facing event stream              */
/* ================================================= */

import { gameState } from "./state.js";

const DEFAULT_MAX_ITEMS = 40;
let sequence = 0;

const severityIcons = {
    info: "i",
    positive: "+",
    warning: "!",
    critical: "!!"
};

const FORCE_KEYS = ["movement", "elite", "authoritarian", "statusquo"];

function ensureFeedState() {
    gameState.ui ??= {};
    gameState.ui.feed ??= {};
    gameState.ui.feed.items ??= [];
    gameState.ui.feed.maxItems ??= DEFAULT_MAX_ITEMS;
    gameState.ui.feed.markerVerbosity ??= "normal";
}

function normalizeSeverity(input) {
    if (input === "positive" || input === "warning" || input === "critical") {
        return input;
    }
    return "info";
}

function normalizeDeltas(deltas) {
    if (!deltas || typeof deltas !== "object") return {};
    const normalized = {};

    Object.entries(deltas).forEach(([key, value]) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed === 0) return;
        normalized[key] = parsed;
    });

    return normalized;
}

function clampForce(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(100, Math.round(parsed)));
}

function deriveForcesFromState() {
    const tracks = gameState.tracks || {};
    const resources = gameState.resources || {};
    const factions = gameState.opposition?.factions || {};

    const movement = clampForce(
        (tracks.solidarity || 0) * 2.4
        + (tracks.care || 0) * 1.1
        + (tracks.climate || 0) * 0.8
        + (resources.momentum || 0) * 2.9
        + (resources.social || 0) * 1.6
        + (resources.political || 0) * 1.3
        + (gameState.surge || 0) * 0.9
        - (tracks.strain || 0) * 1.5
    );

    const elite = clampForce(
        factions.elite?.threatLevel
        ?? ((tracks.capital || 0) * 2.2 + (tracks.authority || 0) * 1.1)
    );

    const authoritarian = clampForce(
        factions.authoritarian?.threatLevel
        ?? ((tracks.authority || 0) * 2.4 + (gameState.pushback?.value || 0) * 1.5)
    );

    const statusquo = clampForce(
        factions.statusquo?.threatLevel
        ?? ((tracks.capital || 0) * 1.3 + (tracks.authority || 0) * 1.1 + (tracks.strain || 0) * 1.2)
    );

    return { movement, elite, authoritarian, statusquo };
}

function normalizeForces(input) {
    const fallback = deriveForcesFromState();
    if (!input || typeof input !== "object") {
        return fallback;
    }

    const normalized = {};
    FORCE_KEYS.forEach(key => {
        const value = input[key];
        normalized[key] = value === undefined ? fallback[key] : clampForce(value);
    });
    return normalized;
}

function getDominantForce(forces) {
    return FORCE_KEYS.reduce((best, key) => {
        if (!best) return key;
        return forces[key] > forces[best] ? key : best;
    }, "");
}

function normalizeEvent(input = {}) {
    ensureFeedState();
    sequence += 1;

    const round = Number.isFinite(Number(input.round))
        ? Number(input.round)
        : Number(gameState.round) || 1;

    const source = String(input.source || "system");
    const severity = normalizeSeverity(input.severity);
    const title = String(input.title || "System update");
    const body = String(input.body || "The situation has shifted.");
    const deltas = normalizeDeltas(input.deltas);
    const forces = normalizeForces(input.forces);
    const dominantForce = String(input.dominantForce || getDominantForce(forces));
    const cause = String(input.cause || source);
    const timestamp = Date.now();
    const id = String(input.id || `${source}-${round}-${sequence}`);

    return {
        id,
        round,
        source,
        severity,
        title,
        body,
        deltas,
        forces,
        dominantForce,
        cause,
        timestamp,
        seq: sequence,
        icon: severityIcons[severity] || severityIcons.info
    };
}

export function initEventSurface() {
    ensureFeedState();
    sequence = 0;
    gameState.ui.feed.items = [];
}

export function publishGameEvent(input = {}) {
    const item = normalizeEvent(input);
    const feed = gameState.ui.feed;

    feed.items.unshift(item);

    const maxItems = Math.max(5, Number(feed.maxItems) || DEFAULT_MAX_ITEMS);
    if (feed.items.length > maxItems) {
        feed.items.length = maxItems;
    }

    return item;
}

export function getFeedItems() {
    ensureFeedState();
    return gameState.ui.feed.items;
}

export function snapshotFeedCursor() {
    return sequence;
}

export function getEventsAfter(cursor) {
    const start = Number(cursor) || 0;
    return getFeedItems()
        .filter(item => item.seq > start)
        .sort((a, b) => a.seq - b.seq);
}

export function setMarkerVerbosity(value) {
    ensureFeedState();
    const allowed = ["minimal", "normal", "detailed"];
    gameState.ui.feed.markerVerbosity = allowed.includes(value) ? value : "normal";
    return gameState.ui.feed.markerVerbosity;
}

export function setFeedCap(cap) {
    ensureFeedState();
    const maxItems = Math.max(5, Number(cap) || DEFAULT_MAX_ITEMS);
    gameState.ui.feed.maxItems = maxItems;
    if (gameState.ui.feed.items.length > maxItems) {
        gameState.ui.feed.items.length = maxItems;
    }
    return maxItems;
}
