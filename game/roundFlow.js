/* ================================================= */
/* SYSTEM SHIFT - ROUND FLOW STATE MACHINE           */
/* PLAYING -> RESOLVING -> AFTERMATH -> READY        */
/* ================================================= */

export const ROUND_PHASES = {
    PLAYING: "PLAYING",
    RESOLVING: "RESOLVING",
    AFTERMATH: "AFTERMATH",
    READY: "READY"
};

const PHASE_ORDER = [
    ROUND_PHASES.PLAYING,
    ROUND_PHASES.RESOLVING,
    ROUND_PHASES.AFTERMATH,
    ROUND_PHASES.READY
];

export function normalizeRoundPhase(input) {
    return PHASE_ORDER.includes(input) ? input : ROUND_PHASES.PLAYING;
}

export function isPlayablePhase(phase) {
    return normalizeRoundPhase(phase) === ROUND_PHASES.PLAYING;
}

export function canStartRoundResolution(phase) {
    return normalizeRoundPhase(phase) === ROUND_PHASES.PLAYING;
}

export function setRoundPhase(uiState, phase) {
    uiState.roundPhase = normalizeRoundPhase(phase);
    return uiState.roundPhase;
}

export function transitionToResolving(uiState) {
    if (!canStartRoundResolution(uiState.roundPhase)) return false;
    setRoundPhase(uiState, ROUND_PHASES.RESOLVING);
    return true;
}

export function transitionToAftermath(uiState) {
    setRoundPhase(uiState, ROUND_PHASES.AFTERMATH);
    return uiState.roundPhase;
}

export function transitionToReady(uiState) {
    setRoundPhase(uiState, ROUND_PHASES.READY);
    return uiState.roundPhase;
}

export function transitionToPlaying(uiState) {
    setRoundPhase(uiState, ROUND_PHASES.PLAYING);
    return uiState.roundPhase;
}

export function getPacingProfile(mode) {
    if (mode === "cinematic") {
        return {
            aftermathMs: 2200,
            readyAutoMs: 0
        };
    }

    if (mode === "fast") {
        return {
            aftermathMs: 300,
            readyAutoMs: 220
        };
    }

    return {
        aftermathMs: 1200,
        readyAutoMs: 0
    };
}
