import { gameState } from "./state.js";

export function generateCommentary(eventType, card = null) {

    const { tracks, pressure, resistancePhase } = gameState;

    const powerGap = tracks.power - tracks.community;
    const highTension = tracks.tension > 30;
    const ecologicalStrain = tracks.planet < 5;
    const wealthLow = tracks.wealth < 5;
    const momentumHigh = gameState.momentum > 8;

    /* ===================== */
    /* HEAVY STRUCTURAL EVENTS */
    /* ===================== */

    if (eventType === "resistance") {
        return build(
            "The structure closed ranks.",
            "Administrative countermeasures hardened. Reform now encounters procedural resistance rather than open debate."
        );
    }

    if (eventType === "pressureReveal") {
        return build(
            "Pressure surfaced.",
            "Institutional stress is no longer abstract. Structural friction now shapes political possibility."
        );
    }

    /* ===================== */
    /* CARD PLAY REACTIONS */
    /* ===================== */

    if (eventType === "cardPlay" && card) {

        // Centralization warning
        if (powerGap > 6 && maybe(0.6)) {
            return build(
                "Centralization accelerating.",
                "Authority is expanding faster than participation. Efficiency rises — but so does fragility."
            );
        }

        // Wealth redistribution tension
        if (card.effects.wealth && card.effects.wealth < 0 && maybe(0.7)) {
            return build(
                "You poked the top.",
                "Redistribution rarely lands quietly. The structure absorbs it — but it remembers."
            );
        }

        // Ecological urgency
        if (ecologicalStrain && maybe(0.6)) {
            return build(
                "The ground is thinning.",
                "Environmental constraint narrows political options. Delay compounds cost."
            );
        }

        // High-risk action
        if (card.risk === "high" && maybe(0.5)) {
            return build(
                "You escalated.",
                "High-risk moves accelerate momentum — and opposition. The response may not be immediate."
            );
        }
    }

    /* ===================== */
    /* ROUND END LIGHT NUDGE */
    /* ===================== */

    if (eventType === "roundEnd") {

        if (resistancePhase && maybe(0.8)) {
            return build(
                "Containment solidified.",
                "Institutional actors adjusted internally. Reform now operates inside narrower corridors."
            );
        }

        if (highTension && maybe(0.7)) {
            return build(
                "The temperature’s rising.",
                "Tension accumulates before rupture. Systems under pressure often tighten before they break."
            );
        }

        if (momentumHigh && maybe(0.6)) {
            return build(
                "Momentum translated.",
                "Collective energy is shifting institutional behavior. Acceleration invites counterforce."
            );
        }

        if (wealthLow && maybe(0.5)) {
            return build(
                "Stability feels thinner.",
                "Short-term correction produced longer-term strain. Structural debt rarely disappears."
            );
        }

        // Light historian tone late game
        if (gameState.round >= 8 && maybe(0.4)) {
            return build(
                "This period tightened.",
                "Structural conditions narrowed the range of viable paths. Each decision now compounds."
            );
        }
    }

    return null;
}

/* ===================== */
/* HELPERS */
/* ===================== */

function build(headline, paragraph) {
    return { headline, paragraph };
}

function maybe(prob) {
    return Math.random() < prob;
}
