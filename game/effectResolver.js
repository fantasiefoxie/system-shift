/* ================================================= */
/* SYSTEM SHIFT – EFFECT RESOLVER (v6 INTERACTION)  */
/* Sequential Card Resolution + Card Interactions   */
/* Fully Hardened + Safe                            */
/* ================================================= */

import { gameState } from "./state.js";
import { playCard, applyEffects } from "./round.js";
import { playSound } from "./audioManager.js";
import { notify } from "./notificationCenter.js";
import {
    getResource,
    consumeResource,
    addResource
} from "./resourceManagement.js";
import { 
    processCardInteractions, 
    applyAllInteractions,
    revealHiddenCard,
    addHiddenCards
} from "./cardInteractions.js";

let resolving = false;

function capitalize(text) {
    const value = String(text || "");
    return value.charAt(0).toUpperCase() + value.slice(1);
}

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

        // Handle hidden card reveal
        let resolvedCard = card;
        if (card.hidden) {
            const revealedCard = revealHiddenCard(index);
            if (!revealedCard) {
                notify({
                    kind: "warning",
                    title: "Nothing to reveal",
                    message: "This face-down card has no backing draw. It stays in your hand.",
                    duration: 2400
                });
                return;
            }

            resolvedCard = revealedCard;
            playSound("cardReveal");
            await delay(150);
        }

        const effects = { ...resolvedCard.effects };
        const cost = Number(resolvedCard.cost) || 0;

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

        /* --------------------------------------------- */
        /* 3. Process Card Interactions                 */
        /* --------------------------------------------- */

        const interactions = processCardInteractions(resolvedCard);
        
        // Apply combo bonuses
        interactions.combos.forEach(combo => {
            playSound("combo");
            triggerInteractionFeedback(combo.name, "combo");
        });
        
        // Apply synergy bonuses
        interactions.synergies.forEach(synergy => {
            playSound("synergy");
            triggerInteractionFeedback(synergy.name, "synergy");
        });
        
        // Apply counter penalties
        interactions.counters.forEach(counter => {
            playSound("counter");
            triggerInteractionFeedback(counter.name, "counter");
        });

        // Apply all interaction effects
        applyAllInteractions(interactions);

        // Apply system-card random effect, if one was triggered
        if (interactions.randomEffects && Object.keys(interactions.randomEffects).length > 0) {
            const randomEffect = interactions.randomEffects;
            applyEffects(randomEffect);

            // Notify the player of the random effect outcome
            const changes = Object.entries(randomEffect)
                .filter(([, v]) => Number(v) !== 0)
                .map(([key, value]) => {
                    const v = Number(value) || 0;
                    const sign = v > 0 ? "+" : "";
                    return `${capitalize(key)} ${sign}${v}`;
                });
            if (changes.length > 0) {
                notify({
                    kind: "info",
                    title: "System effect",
                    message: changes.join(", "),
                    duration: 2200
                });
            }

            // Animate affected tracks / top-bar stats
            for (const key in randomEffect) {
                const value = Number(randomEffect[key]) || 0;
                if (value === 0) continue;
                if (key === "surge") {
                    triggerTopBarAnimation("surge", value > 0);
                } else if (gameState.tracks[key] !== undefined) {
                    triggerStatAnimation(key, value > 0);
                }
            }
        }

        if (typeof renderFn === "function") {
            renderFn();
        }

        await delay(70);

        /* --------------------------------------------- */
        /* 4. Animate Effects Sequentially              */
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
        /* 5. Structural Surge Bonus                    */
        /* --------------------------------------------- */

        if (resolvedCard.suit === "authority" || resolvedCard.suit === "solidarity") {
            triggerTopBarAnimation("surge", true);
            await delay(baseDelay + 40);
        }

        /* --------------------------------------------- */
        /* 6. Hidden Card Management                    */
        /* --------------------------------------------- */

        // Add hidden cards if hand is empty after playing
        if (gameState.playerHand.length === 0) {
            addHiddenCards();
        }

        /* --------------------------------------------- */
        /* 7. Final Resolve Impact                      */
        /* --------------------------------------------- */

        if (dramatic) {
            playSound("bassDrop");
            await delay(220);
        } else {
            playSound("tick");
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

function triggerInteractionFeedback(name, type) {
    const kind = type === "counter" ? "warning" : "positive";
    notify({
        kind,
        title: type === "combo" ? "Combo" : type === "synergy" ? "Synergy" : "Counter",
        message: name,
        duration: 1400
    });
}
