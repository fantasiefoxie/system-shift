/* ================================================= */
/* SYSTEM SHIFT – ROUND ENGINE (STABLE FIXED)       */
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

    if (gameState.politicalCapital < cost) {
        log("PLAY_FAILED_NOT_ENOUGH_PC", {
            required: cost,
            available: gameState.politicalCapital
        });
        return;
    }

    // Deduct capital safely
    gameState.politicalCapital =
        Number(gameState.politicalCapital) - cost;

    log("CARD_PLAYED", {
        id: card.id,
        cost
    });

    applyEffects(card.effects);

    // Momentum bonus for structural cards
    if (card.suit === "power" || card.suit === "community") {
        gameState.momentum += 1;
    }

    // Move to discard
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

        if (key === "momentum") {
            gameState.momentum += value;
            continue;
        }

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

    // STOP at maxRounds (no Round 11)
    if (gameState.round >= gameState.maxRounds) {
        gameState.gameOver = true;
        log("GAME_OVER", { finalRound: gameState.round });
        return;
    }

    // Increment round
    gameState.round += 1;

    // Capital recovery
    const recovery = Number(gameState.politicalRecovery) || 0;

    gameState.politicalCapital =
        Math.min(
            gameState.maxPoliticalCapital,
            Number(gameState.politicalCapital) + recovery
        );

    // Tension → Pressure
    if (gameState.tracks.tension >= 10) {
        gameState.pressure.value += 1;
    }

    // Momentum decay
    if (gameState.momentum > 0) {
        gameState.momentum -= 1;
    }

    // Reset round state
    gameState.playsThisRound = 0;
    gameState.playerHand = [];
}