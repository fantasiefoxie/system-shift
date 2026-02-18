/* ================================================= */
/* SYSTEM SHIFT – PHASE ENGINE (v4 FINAL LOCKED)    */
/* Threshold Detection + Music Integration          */
/* Deterministic + Safe + Restart-Proof             */
/* ================================================= */

import { gameState } from "./state.js";
import { playSound, playMusic, stopMusic } from "./audioManager.js";

/* ------------------------------------------------- */
/* INTERNAL MEMORY                                  */
/* ------------------------------------------------- */

let previousStrain = 0;
let previousPushback = 0;
let collapseTriggered = false;

/* ================================================= */
/* RESET PHASE MEMORY (call on new game)            */
/* ================================================= */

export function resetPhaseTracking() {

    const strain = Number(gameState?.tracks?.strain) || 0;
    const pushback = Number(gameState?.pushback?.value) || 0;

    previousStrain = strain;
    previousPushback = pushback;
    collapseTriggered = false;
}

/* ================================================= */
/* CHECK PHASE TRANSITIONS                          */
/* ================================================= */

export function checkSystemPhases() {

    const strain =
        Math.max(0, Number(gameState?.tracks?.strain) || 0);

    const pushback =
        Math.max(0, Number(gameState?.pushback?.value) || 0);

    /* Prevent spam once collapse threshold reached */
    if (collapseTriggered) {
        previousStrain = strain;
        previousPushback = pushback;
        return;
    }

    /* ----------------------------- */
    /* STRAIN THRESHOLDS            */
    /* ----------------------------- */

    if (previousStrain < 10 && strain >= 10) {
        playSound("heartbeat");
        pulseScreen("tension");
    }

    if (previousStrain < 15 && strain >= 15) {
        playSound("heartbeat");
        pulseScreen("volatility");
    }

    if (previousStrain < 20 && strain >= 20) {
        playSound("heartbeat", { volume: 0.95 });
        pulseScreen("collapse");
        collapseTriggered = true;
    }

    /* ----------------------------- */
    /* PUSHBACK THRESHOLDS          */
    /* ----------------------------- */

    if (previousPushback < 10 && pushback >= 10) {
        playSound("shutter");
        pulseScreen("pushback");
    }

    if (previousPushback < 20 && pushback >= 20) {
        playSound("bassDrop");
        pulseScreen("systemic");
    }

    previousStrain = strain;
    previousPushback = pushback;
}

/* ================================================= */
/* ENDING MUSIC HANDLER                             */
/* ================================================= */

export function handleEndingMusic(endingType) {

    stopMusic(); // ensure clean transition

    switch (endingType) {

        case "SYSTEM COLLAPSE":
            playSound("flatline");
            playMusic("revolutionaryEnding", {
                loop: true,
                volume: 0.6
            });
            break;

        case "SOCIAL TRANSFORMATION":
            playMusic("socialistEnding", {
                loop: true,
                volume: 0.6
            });
            break;

        case "ECOLOGICAL TRANSITION":
            playMusic("ecoEnding", {
                loop: true,
                volume: 0.55
            });
            break;

        case "MANAGED STABILITY":
            playMusic("ecoNature", {
                loop: true,
                volume: 0.5
            });
            break;

        default:
            /* No background music for neutral endings */
            break;
    }
}

/* ================================================= */
/* SIMPLE VISUAL PULSE                              */
/* ================================================= */

function pulseScreen(mode) {

    const body = document.body;
    if (!body) return;

    body.classList.add(`phase-${mode}`);

    setTimeout(() => {
        body.classList.remove(`phase-${mode}`);
    }, 600);
}