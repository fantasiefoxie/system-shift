// game/endings.js

export function getReflectiveQuestion(finalState) {

    const {
        SSI,
        EE,
        EV,
        momentum,
        power,
        community,
        structuralPressure,
        debtRoundsActive,
        wealth
    } = finalState;

    const PC = power - community;

    const rareEquilibrium =
        SSI > 25 &&
        EV > 15 &&
        momentum > 10 &&
        EE < 10 &&
        PC > -5 &&
        PC < 5 &&
        structuralPressure < 15 &&
        debtRoundsActive <= 2;

    const ecologySevere = EV < -30;
    const eliteConsolidation = EE > 20 && PC > 5;
    const fragmentation = SSI < -10;
    const nearAlignment = SSI > 20 && momentum > 8 && !rareEquilibrium;

    // --- Ultra Rare Triggers ---

    if (
        EV > 20 &&
        PC < -5 &&
        community > 30 &&
        structuralPressure < 10
    ) {
        return pickVariant("ultraEcoDecentralized");
    }

    if (
        momentum > 15 &&
        structuralPressure > 30
    ) {
        return pickVariant("ultraMomentumPressure");
    }

    if (
        debtRoundsActive >= 5 &&
        wealth > 0 &&
        EE < 10
    ) {
        return pickVariant("ultraDebtRecovery");
    }

    // --- Core Endings ---

    if (rareEquilibrium)
        return pickVariant("rareEquilibrium");

    if (eliteConsolidation)
        return pickVariant("eliteConsolidation");

    if (debtRoundsActive >= 5 && PC > 5)
        return pickVariant("managedAusterity");

    if (ecologySevere)
        return pickVariant("ecologicalConstraint");

    if (fragmentation)
        return pickVariant("fragmentation");

    if (nearAlignment)
        return pickVariant("contestedReform");

    return pickVariant("managedComfort");
}


// --- Question Bank ---

const questions = {

    eliteConsolidation: [
        "Did you stabilize the system — or did the system stabilize you?",
        "Who adjusted more — you, or the structure?",
        "Was that stability — or containment?"
    ],

    managedAusterity: [
        "Who actually paid for the stability you built?",
        "When budgets tightened, who absorbed the shock?",
        "What did stability cost — and to whom?"
    ],

    ecologicalConstraint: [
        "What did you treat as temporary that was always structural?",
        "What would it have taken to move faster?",
        "When the ground shifts, what holds?"
    ],

    contestedReform: [
        "You shifted the structure. Why did it stop there?",
        "What was missing — alignment or courage?",
        "How close were you to something lasting?"
    ],

    fragmentation: [
        "What holds a system together when pressure rises?",
        "Is decentralization enough without solidarity?",
        "When structure loosens, what replaces it?"
    ],

    rareEquilibrium: [
        "If this alignment was possible once, why not again?",
        "What keeps transformation from becoming tradition?",
        "How long can alignment be sustained?"
    ],

    managedComfort: [
        "Did you change the structure — or just survive inside it?",
        "What would it take to go further?",
        "What did stability postpone?"
    ],

    ultraEcoDecentralized: [
        "What would it take to make this permanent?"
    ],

    ultraMomentumPressure: [
        "When momentum rises, who feels threatened?"
    ],

    ultraDebtRecovery: [
        "What changed — the numbers, or the power behind them?"
    ]
};


function pickVariant(type) {

    const variants = questions[type];

    if (!variants) {
        return "What changed — and what stayed the same?";
    }

    return variants[Math.floor(Math.random() * variants.length)];
}
