/* ================================================= */
/* SYSTEM SHIFT – MEMORY SYSTEM                     */
/* Tracks player actions and triggers consequences  */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";

/* ================================================= */
/* MEMORY CHECKS                                    */
/* ================================================= */

export const memoryChecks = {
    brokenPromise: (state) => {
        if (state.memory.maxCare && state.tracks.care < state.memory.maxCare - 3) {
            return {
                type: "broken_promise",
                effect: { solidarity: -2, strain: 2 },
                message: "The people remember your broken promises."
            };
        }
        return null;
    },

    consistentVision: (state) => {
        const tagCounts = {};
        state.memory.cardsPlayed.forEach(card => {
            card.tags?.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        if (Math.max(...Object.values(tagCounts)) >= 5) {
            return {
                type: "consistent_vision",
                effect: { surge: 2, solidarity: 1 },
                message: "Your unwavering vision inspires the movement."
            };
        }
        return null;
    }
};

/* ================================================= */
/* CHECK MEMORY                                     */
/* Called at end of each round                       */
/* ================================================= */

export function checkMemory() {
    for (let check of Object.values(memoryChecks)) {
        const result = check(gameState);
        if (result) return result;
    }
    return null;
}

/* ================================================= */
/* CROSS-GAME LEGACY SYSTEM (3B)                    */
/* Tracks outcomes across games, applies bonuses     */
/* ================================================= */

const LEGACY_KEY = "systemshift_legacy";

const defaultLegacy = {
    gamesPlayed: 0,
    lastEnding: null,
    endingHistory: [],
    legacyBonuses: {}
};

export function loadLegacy() {
    try {
        const data = localStorage.getItem(LEGACY_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.warn("Failed to load legacy data:", e);
    }
    return { ...defaultLegacy };
}

export function saveLegacy(endingType) {
    const legacy = loadLegacy();
    
    legacy.gamesPlayed++;
    legacy.lastEnding = endingType;
    legacy.endingHistory.push(endingType);
    
    // Cap history at last 20 entries
    if (legacy.endingHistory.length > 20) {
        legacy.endingHistory = legacy.endingHistory.slice(-20);
    }
    
    // Recompute legacy bonuses
    legacy.legacyBonuses = computeLegacyBonuses(legacy);
    
    try {
        localStorage.setItem(LEGACY_KEY, JSON.stringify(legacy));
        log("LEGACY_SAVED", { endingType, gamesPlayed: legacy.gamesPlayed, bonuses: legacy.legacyBonuses });
    } catch (e) {
        console.warn("Failed to save legacy data:", e);
    }
    
    return legacy;
}

export function getLegacyBonuses() {
    const legacy = loadLegacy();
    return legacy.legacyBonuses || {};
}

export function getLegacy() {
    return loadLegacy();
}

export function resetLegacy() {
    try {
        localStorage.removeItem(LEGACY_KEY);
        log("LEGACY_RESET", {});
    } catch (e) {
        console.warn("Failed to reset legacy data:", e);
    }
}

function computeLegacyBonuses(legacy) {
    const bonuses = {};
    const recentEndings = legacy.endingHistory.slice(-5);
    
    // SOCIAL TRANSFORMATION → solidarity +1
    if (legacy.lastEnding === "SOCIAL TRANSFORMATION") {
        bonuses.solidarity = 1;
    }
    
    // ECOLOGICAL TRANSITION → climate +1
    if (legacy.lastEnding === "ECOLOGICAL TRANSITION") {
        bonuses.climate = 1;
    }
    
    // DUAL POWER TRANSITION → solidarity +1, authority -1
    if (legacy.lastEnding === "DUAL POWER TRANSITION") {
        bonuses.solidarity = 1;
        bonuses.authority = -1;
    }
    
    // SYSTEM COLLAPSE x2 in last 5 games → strain -1
    const collapseCount = recentEndings.filter(e => e === "SYSTEM COLLAPSE").length;
    if (collapseCount >= 2) {
        bonuses.strain = -1;
    }
    
    // AUTHORITARIAN CONSOLIDATION → authority +1
    if (legacy.lastEnding === "AUTHORITARIAN CONSOLIDATION") {
        bonuses.authority = 1;
    }
    
    return bonuses;
}
