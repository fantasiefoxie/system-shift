/* ================================================= */
/* SYSTEM SHIFT – EFFECT RESOLVER (BRICK v2 AUDIO)  */
/* Sequential Card Resolution + Full Sound Hooks    */
/* ================================================= */

import { gameState } from "./state.js";
import { playCard } from "./round.js";
import { playSound } from "./audioManager.js";

let resolving = false;

/* ------------------------------------------------- */
/* Utility Delay                                     */
/* ------------------------------------------------- */

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ================================================= */
/* MAIN RESOLUTION FUNCTION                          */
/* ================================================= */

export async function resolveCard(index, renderFn) {

    if (resolving) return;
    resolving = true;

    const card = gameState.playerHand[index];
    if (!card) {
        resolving = false;
        return;
    }

    const effects = { ...card.effects };
    const cost = Number(card.cost) || 0;

    /* --------------------------------------------- */
    /* 0. Card Interaction Sound                    */
    /* --------------------------------------------- */

    playSound("cardFlip");

    /* --------------------------------------------- */
    /* 1. Animate Leverage Cost Deduction           */
    /* --------------------------------------------- */

    for (let i = 0; i < cost; i++) {
        triggerTopBarAnimation("leverage", false);
        playSound("tick");
        await delay(90);
    }

    /* --------------------------------------------- */
    /* 2. Execute Actual Game Logic                 */
    /* --------------------------------------------- */

    playCard(index);
    renderFn();

    /* --------------------------------------------- */
    /* 3. Animate Card Effects Sequentially         */
    /* --------------------------------------------- */

    for (let key in effects) {

        const value = Number(effects[key]) || 0;
        const steps = Math.abs(value);

        for (let i = 0; i < steps; i++) {

            triggerStatAnimation(key, value > 0);

            await delay(110);
        }
    }

    /* --------------------------------------------- */
    /* 4. Surge Bonus (Structural Cards)            */
    /* --------------------------------------------- */

    if (card.suit === "authority" || card.suit === "solidarity") {

        triggerTopBarAnimation("surge", true);
        playSound("surgeUp");

        await delay(140);
    }

    /* --------------------------------------------- */
    /* 5. Final Resolve Impact                      */
    /* --------------------------------------------- */

    playSound("energy");

    resolving = false;
}

/* ================================================= */
/* VISUAL + SOUND HELPERS                           */
/* ================================================= */

function triggerStatAnimation(stat, positive) {

    const el = document.querySelector(`#track-${stat}`);
    if (!el) return;

    el.classList.add(positive ? "pulse-up" : "pulse-down");

    setTimeout(() => {
        el.classList.remove("pulse-up", "pulse-down");
    }, 280);

    /* ---------------- SOUND MAPPING -------------- */

    switch (stat) {

        case "capital":
            playSound(positive ? "capitalUp" : "capitalDown");
            break;

        case "strain":
            playSound("heartbeat");
            break;

        case "care":
        case "climate":
        case "solidarity":
        case "authority":
            playSound(positive ? "haloUp" : "haloDown");
            break;

        default:
            playSound("haloUp");
    }
}

function triggerTopBarAnimation(stat, positive) {

    const el = document.getElementById(`${stat}Stat`);
    if (!el) return;

    el.classList.add(positive ? "pulse-up" : "pulse-down");

    setTimeout(() => {
        el.classList.remove("pulse-up", "pulse-down");
    }, 280);

    /* ---------------- TOP BAR SOUND -------------- */

    if (stat === "leverage") {
        playSound(positive ? "coins" : "tick");
    }

    if (stat === "surge") {
        playSound(positive ? "surgeUp" : "surgeBreak");
    }

    if (stat === "pushback") {
        playSound("shutter");
    }
}