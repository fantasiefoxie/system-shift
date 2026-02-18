/* ================================================= */
/* SYSTEM SHIFT – EFFECT RESOLVER (v5 FINAL STABLE) */
/* Sequential Card Resolution + Tension Scaling     */
/* Fully Hardened + Safe                            */
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

    try {

        const card = gameState.playerHand[index];
        if (!card) return;

        const effects = { ...card.effects };
        const cost = Number(card.cost) || 0;

        const strain = gameState?.tracks?.strain ?? 0;
        const pushback = gameState?.pushback?.value ?? 0;

        const dramatic =
            strain >= 20 ||
            pushback >= 20;

        const baseDelay = dramatic ? 190 : 115;
        const costDelay = dramatic ? 150 : 95;

        /* --------------------------------------------- */
        /* 0. Card Interaction                           */
        /* --------------------------------------------- */

        playSound("cardFlip");
        await delay(70);

        /* --------------------------------------------- */
        /* 1. Animate Leverage Cost Deduction           */
        /* --------------------------------------------- */

        const leverageBefore = gameState.leverage;

        if (leverageBefore < cost) {
            // fail safe — do not animate cost if invalid
            return;
        }

        for (let i = 0; i < cost; i++) {
            triggerTopBarAnimation("leverage", false);
            await delay(costDelay);
        }

        /* --------------------------------------------- */
        /* 2. Execute Real Game Logic                   */
        /* --------------------------------------------- */

        playCard(index);

        if (typeof renderFn === "function") {
            renderFn();
        }

        await delay(70);

        /* --------------------------------------------- */
        /* 3. Animate Effects Sequentially              */
        /* --------------------------------------------- */

        for (let key in effects) {

            const value = Number(effects[key]) || 0;
            const steps = Math.abs(value);

            for (let i = 0; i < steps; i++) {
                triggerStatAnimation(key, value > 0);
                await delay(baseDelay);
            }
        }

        /* --------------------------------------------- */
        /* 4. Structural Surge Bonus                    */
        /* --------------------------------------------- */

        if (card.suit === "authority" || card.suit === "solidarity") {
            triggerTopBarAnimation("surge", true);
            await delay(baseDelay + 40);
        }

        /* --------------------------------------------- */
        /* 5. Final Resolve Impact                      */
        /* --------------------------------------------- */

        if (dramatic) {
            playSound("bassDrop");
            await delay(220);
        } else {
            playSound("energy");
        }

    } finally {
        resolving = false;
    }
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

    switch (stat) {

        case "capital":
            playSound(positive ? "capitalUp" : "capitalDown");
            break;

        case "strain":
            playSound("heartbeat", { volume: 0.75 });
            break;

        case "care":
        case "climate":
        case "solidarity":
        case "authority":
            playSound(positive ? "haloUp" : "haloDown");
            break;

        case "surge":
            playSound(positive ? "surgeUp" : "surgeBreak");
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