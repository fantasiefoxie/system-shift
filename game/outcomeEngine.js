/* ================================================= */
/* SYSTEM SHIFT – OUTCOME ENGINE (v1.0)             */
/* Ideological Structural Classifier                */
/* ================================================= */

/*
This engine evaluates the final systemic condition.

It does NOT mutate gameState.
It only reads and classifies.

Inputs:
- Halo tracks
- Strain
- Pushback (optional future use)

Outputs:
{
    type: string,
    message: string,
    tags: { ...diagnostic info }
}
*/

export function evaluateOutcome(gameState) {

    const {
        care,
        climate,
        solidarity,
        authority,
        capital,
        strain
    } = gameState.tracks;

    const pushback = gameState.pushback?.value || 0;

    /* ------------------------------------------------- */
    /* DERIVED METRICS                                   */
    /* ------------------------------------------------- */

    const socialPower = care + solidarity;
    const elitePower = authority + capital;
    const powerGap = socialPower - elitePower;

    const ecoScore = climate;
    const stress = strain;

    /* ------------------------------------------------- */
    /* COLLAPSE LOGIC                                    */
    /* True collapse only when strain high AND elites    */
    /* remain dominant (hard fracture scenario)          */
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
    /* AUTHORITARIAN CONSOLIDATION                       */
    /* High elite dominance + rising stress              */
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
    /* ECOLOGICAL TRANSITION                             */
    /* Strong climate recovery + social advantage        */
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
    /* SOCIAL TRANSFORMATION                             */
    /* Strong redistribution & social dominance          */
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
    /* TURBULENT TRANSFORMATION                          */
    /* High strain BUT social dominance achieved         */
    /* This prevents false collapse endings              */
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
    /* MANAGED REFORM                                    */
    /* Low stress + moderate balance                     */
    /* ------------------------------------------------- */

    if (stress < 12 && Math.abs(powerGap) <= 10) {
        return {
            type: "MANAGED REFORM",
            message:
                "Incremental reforms stabilized the system without fundamentally redistributing power.",
            tags: {
                reformist: true,
                stable: true
            }
        };
    }

    /* ------------------------------------------------- */
    /* SYSTEM DRIFT (Fallback)                           */
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