/* ================================================= */
/* SYSTEM SHIFT – OUTCOME ENGINE (v1.1 STABLE)      */
/* Ideological Structural Classifier                */
/* Fully Aligned With Phase + Music System          */
/* ================================================= */

export function evaluateOutcome(gameState) {

    const tracks = gameState?.tracks || {};
    const pushback = gameState?.pushback?.value || 0;

    const care = Number(tracks.care) || 0;
    const climate = Number(tracks.climate) || 0;
    const solidarity = Number(tracks.solidarity) || 0;
    const authority = Number(tracks.authority) || 0;
    const capital = Number(tracks.capital) || 0;
    const strain = Number(tracks.strain) || 0;

    /* ------------------------------------------------- */
    /* DERIVED METRICS                                   */
    /* ------------------------------------------------- */

    const socialPower = care + solidarity;
    const elitePower = authority + capital;
    const powerGap = socialPower - elitePower;

    const ecoScore = climate;
    const stress = strain;

    /* ------------------------------------------------- */
    /* 1. SYSTEM COLLAPSE                                */
    /* High strain + elites still dominant               */
    /* ------------------------------------------------- */

    if (stress >= 20 && powerGap <= 0) {
        return {
            type: "SYSTEM COLLAPSE",
            message:
                "Escalating strain fractured the system while elite power structures remained dominant.",
            tags: {
                collapse: true,
                authoritarian: true
            }
        };
    }

    /* ------------------------------------------------- */
    /* 2. AUTHORITARIAN CONSOLIDATION                    */
    /* Elite dominance under high stress                */
    /* ------------------------------------------------- */

    if (elitePower > socialPower && stress >= 15) {
        return {
            type: "AUTHORITARIAN CONSOLIDATION",
            message:
                "Institutional authority hardened under pressure, absorbing unrest into centralized control.",
            tags: {
                authoritarian: true,
                stabilized: true
            }
        };
    }

    /* ------------------------------------------------- */
    /* 3. ECOLOGICAL TRANSITION                          */
    /* Climate maxed + social advantage + stable        */
    /* ------------------------------------------------- */

    if (ecoScore >= 20 && powerGap > 0 && stress < 18) {
        return {
            type: "ECOLOGICAL TRANSITION",
            message:
                "Planetary repair gained structural momentum through socially anchored transformation.",
            tags: {
                ecological: true,
                transformative: true
            }
        };
    }

    /* ------------------------------------------------- */
    /* 4. SOCIAL TRANSFORMATION                          */
    /* Strong redistribution + stable transition        */
    /* ------------------------------------------------- */

    if (socialPower >= 30 && powerGap > 0 && stress < 18) {
        return {
            type: "SOCIAL TRANSFORMATION",
            message:
                "Collective welfare reshaped systemic foundations, displacing entrenched elite dominance.",
            tags: {
                social: true,
                transformative: true
            }
        };
    }

    /* ------------------------------------------------- */
    /* 5. TURBULENT TRANSFORMATION                       */
    /* High strain BUT social power wins                */
    /* ------------------------------------------------- */

    if (stress >= 18 && powerGap > 0) {
        return {
            type: "TURBULENT TRANSFORMATION",
            message:
                "The transition was volatile and destabilizing, yet structural power shifted toward collective control.",
            tags: {
                transformative: true,
                unstable: true
            }
        };
    }

    /* ------------------------------------------------- */
    /* 6. MANAGED STABILITY (Renamed for Music Sync)    */
    /* Low stress + moderate balance                    */
    /* ------------------------------------------------- */

    if (stress < 12 && Math.abs(powerGap) <= 10) {
        return {
            type: "MANAGED STABILITY",
            message:
                "Incremental reforms stabilized the system without fundamentally redistributing power.",
            tags: {
                reformist: true,
                stable: true
            }
        };
    }

    /* ------------------------------------------------- */
    /* 7. SYSTEM DRIFT (Fallback)                        */
    /* ------------------------------------------------- */

    return {
        type: "SYSTEM DRIFT",
        message:
            "Partial reforms altered surface conditions, but underlying power dynamics persisted.",
        tags: {
            drift: true
        }
    };
}