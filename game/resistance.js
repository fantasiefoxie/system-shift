import { gameState } from "./state.js";
import { generateCommentary } from "./commentary.js";


export function checkResistancePhase() {

    // --- Activation Threshold ---
    if (!gameState.resistancePhase && gameState.pressure.value >= 40) {

        activateResistancePhase();
    }

    // --- Escalation Logic ---
    if (gameState.resistancePhase) {

        escalateInstitutionalPushback();
    }
}


function activateResistancePhase() {

    gameState.resistancePhase = true;

    // Core structural clamp
    if (!gameState.modifiers.includes("eliteConsolidation")) {
        gameState.modifiers.push("eliteConsolidation");
    }

    // Counter existing momentum tools
    if (gameState.modifiers.includes("extraDraw") &&
        !gameState.modifiers.includes("bureaucraticSlowdown")) {

        gameState.modifiers.push("bureaucraticSlowdown");
    }

    if (gameState.modifiers.includes("riskBoost") &&
        !gameState.modifiers.includes("securityCrackdown")) {

        gameState.modifiers.push("securityCrackdown");
    }

    // Structural memory rises
    gameState.structuralPressure += 3;
    const message = generateCommentary("resistance");

if (message) {
    window.dispatchEvent(
        new CustomEvent("commentary", { detail: message })
    );
}

    console.log("Resistance Phase Activated");
}


function escalateInstitutionalPushback() {

    // If momentum grows too fast → crackdown increases
    if (gameState.momentum >= 8) {

        if (!gameState.modifiers.includes("securityCrackdown")) {
            gameState.modifiers.push("securityCrackdown");
        }

        gameState.structuralPressure += 1;
    }

    // If structural pressure too high → slow growth
    if (gameState.structuralPressure >= 10) {

        if (!gameState.modifiers.includes("bureaucraticSlowdown")) {
            gameState.modifiers.push("bureaucraticSlowdown");
        }
    }

    // If wealth concentration extreme → entrench elites
    if (gameState.tracks.wealth >= 20) {

        if (!gameState.modifiers.includes("eliteConsolidation")) {
            gameState.modifiers.push("eliteConsolidation");
        }

        gameState.structuralPressure += 1;
    }
}
