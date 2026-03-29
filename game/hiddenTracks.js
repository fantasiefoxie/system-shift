/* ================================================= */
/* SYSTEM SHIFT – HIDDEN TRACKS                     */
/* Invisible state that affects gameplay indirectly */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";

/* ================================================= */
/* HIDDEN TRACKS DEFINITION                         */
/* ================================================= */

export const hiddenTracks = {
    eliteCohesion: 10,
    movementMorale: 10,
    internationalPressure: 5
};

/* ================================================= */
/* UPDATE HIDDEN TRACKS                             */
/* Called at end of each round                       */
/* ================================================= */

export function updateHiddenTracks() {
    const t = gameState.tracks;

    // Elite cohesion decreases as power drops
    if (t.authority + t.capital < 20) {
        hiddenTracks.eliteCohesion = Math.max(0, hiddenTracks.eliteCohesion - 1);
    }

    // Movement morale increases with wins
    if (t.care + t.solidarity > 30) {
        hiddenTracks.movementMorale = Math.min(20, hiddenTracks.movementMorale + 1);
    }

    // International pressure fluctuates
    hiddenTracks.internationalPressure += Math.floor(Math.random() * 3) - 1;
    hiddenTracks.internationalPressure = Math.max(0, Math.min(10, hiddenTracks.internationalPressure));

    log("HIDDEN_TRACKS_UPDATED", {
        eliteCohesion: hiddenTracks.eliteCohesion,
        movementMorale: hiddenTracks.movementMorale,
        internationalPressure: hiddenTracks.internationalPressure
    });
}