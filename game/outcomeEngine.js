/* ================================================= */
/* SYSTEM SHIFT – OUTCOME ENGINE (v1.2 NARRATIVE)   */
/* Ideological Structural Classifier                |
| Enhanced with narrative descriptions             | */
/* ================================================= */

import { getNarrativeSummary } from "./narrative.js";

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
    /* High strain + elites still dominant (5-15%)      */
    /* ------------------------------------------------- */

    if (stress >= 14 && powerGap <= 8) {
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
    /* Elite dominance under stress (5-15%)             */
    /* ------------------------------------------------- */

    if (elitePower > socialPower && stress >= 8) {
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
    /* Climate maxed + social advantage + stable (15-25%) */
    /* ------------------------------------------------- */

    if (ecoScore >= 19 && powerGap > 6 && stress < 14) {
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
    /* Strong redistribution + stable transition (15-25%) */
    /* ------------------------------------------------- */

    if (socialPower >= 25 && powerGap > 4 && stress < 16) {
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
    /* High strain BUT social power wins (10-20%)       */
    /* ------------------------------------------------- */

    if (stress >= 18 && powerGap > 3 && socialPower >= 26) {
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
    /* 6. MANAGED STABILITY                              */
    /* Moderate everything + low strain (10-20%)        */
    /* ------------------------------------------------- */

    if (stress < 12 && Math.abs(powerGap) <= 12 && care >= 8 && climate >= 8) {
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
    /* 7. ECOLOGICAL CONSTRAINT                          */
    /* Climate crisis without social power to respond   */
    /* ------------------------------------------------- */

    if (climate <= 5 && socialPower < 20 && stress >= 10) {
        return {
            type: "ECOLOGICAL CONSTRAINT",
            message:
                "Environmental collapse constrained social progress, as insufficient collective power failed to address the crisis.",
            tags: {
                ecological: true,
                constrained: true
            }
        };
    }

    /* ------------------------------------------------- */
    /* 8. DUAL POWER TRANSITION                          */
    /* Threshold-based ending: parallel institutions     */
    /* ------------------------------------------------- */

    if (gameState.activeThresholds && gameState.activeThresholds.includes("dual_power")) {
        return {
            type: "DUAL POWER TRANSITION",
            message: "Parallel institutions have replaced the old order.",
            tags: { transformative: true, revolutionary: true }
        };
    }

    /* ------------------------------------------------- */
    /* Fallback: SYSTEM DRIFT                            */
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
