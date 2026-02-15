import { gameState } from "./state.js";

export function runSimulation() {

    const metrics = deriveMetrics();
    const timeline = generateTimeline(metrics);

    return {
        metrics,
        timeline
    };
}

function deriveMetrics() {

    const SSI = gameState.tracks.wellbeing +
                gameState.tracks.community -
                gameState.tracks.tension;

    const EV = gameState.tracks.planet -
               gameState.tracks.tension;

    const PC = gameState.tracks.power -
               gameState.tracks.community;

    const EE = gameState.pressure.value +
               gameState.structuralPressure -
               gameState.shiftProgress;

    const MI = gameState.momentum -
               (gameState.structuralPressure / 2);

    const debtWeight = gameState.debtRoundsActive;

    return { SSI, EV, PC, EE, MI, debtWeight };
}

function generateTimeline(metrics) {

    const drift = (value, weight = 1) => {
        const variance = (Math.random() * 0.2 - 0.1) * weight;
        return value + value * variance;
    };

    const m = {
        SSI: drift(metrics.SSI),
        EV: drift(metrics.EV),
        PC: drift(metrics.PC),
        EE: drift(metrics.EE, 1.5),
        MI: drift(metrics.MI),
        debtWeight: metrics.debtWeight
    };

    return interpretOutcome(m);
}

function interpretOutcome(m) {

    let direction;

    // Rare equilibrium
    if (m.SSI > 25 &&
        m.EV > 15 &&
        m.MI > 10 &&
        m.EE < 10 &&
        m.debtWeight <= 2) {

        direction = "rare";
    }

    else if (m.EE > 20) direction = "elite";

    else if (m.MI > 10 && m.EE < 10) direction = "reform";

    else if (m.EV > 15 && m.SSI > 15) direction = "eco";

    else if (m.SSI < -10) direction = "fragment";

    else direction = "contested";


    let result = {};

    // --- Immediate Aftermath (10–20 years) ---

    if (direction === "elite")
        result.aftermath =
            "Institutional consolidation deepens through administrative normalization and procedural expansion.";

    else if (direction === "reform")
        result.aftermath =
            "Movement-aligned reforms embed within institutional frameworks across multiple sectors.";

    else if (direction === "eco")
        result.aftermath =
            "Ecological restructuring begins redefining policy priorities and economic coordination.";

    else if (direction === "fragment")
        result.aftermath =
            "Structural instability destabilizes governance and weakens shared cohesion.";

    else if (direction === "rare")
        result.aftermath =
            "Institutional and civic alignment produces a rare phase of structural equilibrium.";

    else
        result.aftermath =
            "Competing structural forces prevent decisive transformation.";


    // --- 50–100 Year Institutional Drift ---

    if (direction === "elite")
        result.institutions =
            "Central authority expands gradually through administrative continuity rather than overt rupture.";

    else if (direction === "reform")
        result.institutions =
            "Reformist norms institutionalize, though structural pressure lingers beneath the surface.";

    else if (direction === "eco")
        result.institutions =
            "Environmental governance reshapes regulatory and economic coordination systems.";

    else if (direction === "fragment")
        result.institutions =
            "Institutional coherence weakens unevenly across regions.";

    else if (direction === "rare")
        result.institutions =
            "Institutional frameworks recalibrate toward participatory alignment and adaptive balance.";

    else
        result.institutions =
            "Institutional equilibrium remains tense and adaptive.";


    // --- Social Consequences ---

    if (direction === "elite")
        result.social =
            "Public life becomes structured around managed participation and normalized procedural compliance.";

    else if (direction === "reform")
        result.social =
            "Civic participation expands, though opposition recalibrates within institutional boundaries.";

    else if (direction === "eco")
        result.social =
            "Communities reorganize around sustainability and localized resilience.";

    else if (direction === "fragment")
        result.social =
            "Regional disparities deepen as shared trust erodes.";

    else if (direction === "rare")
        result.social =
            "Civic culture stabilizes around durable structural alignment.";

    else
        result.social =
            "Society adapts without resolving underlying structural tension.";


    // --- Long Memory (500–1000 years equivalent) ---

    if (direction === "elite")
        result.memory =
            "Centuries later, historians mark this era as a consolidation phase of structural power.";

    else if (direction === "reform")
        result.memory =
            "Centuries later, this period is studied as a partial structural turning point.";

    else if (direction === "eco")
        result.memory =
            "Centuries later, ecological recalibration defines civilizational identity.";

    else if (direction === "fragment")
        result.memory =
            "Centuries later, the instability of this era remains a cautionary structural reference.";

    else if (direction === "rare")
        result.memory =
            "Centuries later, this era is referenced as proof that structural alignment was once achievable.";

    else
        result.memory =
            "Centuries later, scholars debate whether this era marked preservation or transformation.";


    return result;
}
