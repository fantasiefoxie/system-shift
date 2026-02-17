/* ================================================= */
/* SYSTEM SHIFT – ROUND ENGINE (BRICK v2)           */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";

/* ================================================= */
/* PLAY CARD */
/* ================================================= */

export function playCard(index) {

    if (gameState.playsThisRound >= gameState.maxPlaysPerRound) {
        return;
    }

    const card = gameState.playerHand[index];
    if (!card) return;

    const cost = Number(card.cost) || 0;

    /* Leverage check (formerly Political Capital) */
    if (gameState.leverage < cost) {
        log("PLAY_FAILED_NOT_ENOUGH_LEVERAGE", {
            required: cost,
            available: gameState.leverage
        });
        return;
    }

    /* Deduct leverage safely */
    gameState.leverage =
        Number(gameState.leverage) - cost;

    log("CARD_PLAYED", {
        id: card.id,
        cost
    });

    applyEffects(card.effects);

    /* Surge bonus for structural cards (formerly Momentum) */
    if (card.suit === "authority" || card.suit === "solidarity") {
        gameState.surge += 1;
    }

    /* Move to discard */
    gameState.discardPile.push(card);
    gameState.playerHand.splice(index, 1);
    gameState.playsThisRound += 1;
}

/* ================================================= */
/* APPLY EFFECTS */
/* ================================================= */

function applyEffects(effects) {

    for (let key in effects) {

        const value = Number(effects[key]) || 0;

        /* Surge handling */
        if (key === "surge") {
            gameState.surge += value;
            continue;
        }

        /* Halo updates */
        if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] =
                Number(gameState.tracks[key]) + value;
        }
    }

    log("EFFECTS_APPLIED", effects);
}

/* ================================================= */
/* END ROUND */
/* ================================================= */

export function endRound() {

    log("ROUND_ENDING", {
        round: gameState.round
    });

    /* STOP at maxRounds */
    if (gameState.round >= gameState.maxRounds) {
        gameState.gameOver = true;
        log("GAME_OVER", { finalRound: gameState.round });
        return;
    }

    /* Increment round */
    gameState.round += 1;

    /* Leverage recovery (formerly politicalRecovery) */
    const recovery = Number(gameState.leverageRecovery) || 0;

    gameState.leverage =
        Math.min(
            gameState.maxLeverage,
            Number(gameState.leverage) + recovery
        );

    /* Strain → Pushback (formerly tension → pressure) */
    if (gameState.tracks.strain >= 10) {
        gameState.pushback.value += 1;
    }

    /* Surge decay */
    if (gameState.surge > 0) {
        gameState.surge -= 1;
    }

    /* Reset round state */
    gameState.playsThisRound = 0;
    gameState.playerHand = [];
}