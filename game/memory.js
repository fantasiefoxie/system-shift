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