import { gameState } from "./state.js";
import { generateCommentary } from "./commentary.js";

export function checkThresholds() {

    let triggered = false;

    const { wellbeing, planet, community, power, wealth, tension } = gameState.tracks;

    // --- Wealth Concentration ---
    if (wealth >= 18) {
        gameState.tracks.tension += 2;
        gameState.surfacePressure += 1;
        triggered = true;
    }

    // --- Ecological Stress ---
    if (planet <= 5) {
        gameState.tracks.tension += 2;
        gameState.surfacePressure += 2;
        triggered = true;
    }

    // --- Power Centralization ---
    if (power >= 12) {
        gameState.pressure.value += 1;
        gameState.structuralPressure += 1;
        triggered = true;
    }

    // --- Social Breakdown ---
    if (wellbeing <= 4) {
        gameState.tracks.tension += 1;
        gameState.surfacePressure += 1;
        triggered = true;
    }

    // --- Community Fragmentation ---
    if (community <= 3) {
        gameState.tracks.tension += 1;
        triggered = true;
    }

    if (triggered) {
        gameState.immediateSignalsTriggered += 1;
    }
}


export function checkPressureReveal() {

    if (gameState.pressure.revealed) return;

    const { tension, power, wealth } = gameState.tracks;

    if (gameState.round >= 4) {

        if (
            tension >= 15 ||
            power >= 12 ||
            wealth <= 12
        ) {
            gameState.pressure.revealed = true;
            console.log("Pressure Revealed!");
            const message = generateCommentary("pressureReveal");

if (message) {
    window.dispatchEvent(
        new CustomEvent("commentary", { detail: message })
    );
}

        }
    }
}
