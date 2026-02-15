import { gameState } from "./state.js";

export function checkShiftUnlocks() {

    // Unlock extra draw at 3 shift
    if (
        gameState.shiftProgress >= 3 &&
        !gameState.modifiers.includes("extraDraw")
    ) {
        gameState.modifiers.push("extraDraw");
        console.log("Unlocked: extraDraw");
    }

    // Unlock risk boost at 6 shift
    if (
        gameState.shiftProgress >= 6 &&
        !gameState.modifiers.includes("riskBoost")
    ) {
        gameState.modifiers.push("riskBoost");
        console.log("Unlocked: riskBoost");
    }

    // Unlock momentum shield at 10 shift
    if (
        gameState.shiftProgress >= 10 &&
        !gameState.modifiers.includes("momentumShield")
    ) {
        gameState.modifiers.push("momentumShield");
        console.log("Unlocked: momentumShield");
    }
}
