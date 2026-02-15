// game/jokerSystem.js

import { gameState } from "./state.js";

/* ================================================= */
/* JOKER DEFINITIONS */
/* ================================================= */

/*
Types:
- movement (player aligned)
- institutional (structural parasites)
- crisis (temporary shocks)
*/

export const ALL_JOKERS = [

    /* ================= MOVEMENT ================= */

    {
        id: "unionWave",
        type: "movement",
        name: "Union Wave",
        description: "+1 Political Capital recovery per round",
        applyRoundStart() {
            gameState.politicalCapital += 1;
        }
    },

    {
        id: "mutualAid",
        type: "movement",
        name: "Mutual Aid Network",
        description: "+1 Wellbeing per round",
        applyRoundStart() {
            gameState.tracks.wellbeing += 1;
        }
    },

    {
        id: "climateSurge",
        type: "movement",
        name: "Climate Surge",
        description: "High-risk planet cards gain +1 planet",
        modifyCard(card, effects) {
            if (card.suit === "planet" && card.risk === "high") {
                effects.planet = (effects.planet || 0) + 1;
            }
        }
    },

    {
        id: "grassrootsMomentum",
        type: "movement",
        name: "Grassroots Momentum",
        description: "+1 momentum when playing community cards",
        onCardPlay(card) {
            if (card.suit === "community") {
                gameState.momentum += 1;
            }
        }
    },


    /* ================= INSTITUTIONAL ================= */

    {
        id: "eliteConsolidation",
        type: "institutional",
        name: "Elite Consolidation",
        description: "-1 max Political Capital",
        applyPersistent() {
            gameState.maxPoliticalCapital =
                Math.max(3, gameState.maxPoliticalCapital - 1);
        }
    },

    {
        id: "mediaCapture",
        type: "institutional",
        name: "Media Capture",
        description: "Random card effect reduced by 1",
        modifyCard(card, effects) {
            const keys = Object.keys(effects);
            if (keys.length === 0) return;
            const k = keys[Math.floor(Math.random() * keys.length)];
            effects[k] -= 1;
        }
    },

    {
        id: "securityState",
        type: "institutional",
        name: "Security State",
        description: "+1 tension on high-risk plays",
        onCardPlay(card) {
            if (card.risk === "high") {
                gameState.tracks.tension += 1;
            }
        }
    },


    /* ================= CRISIS ================= */

    {
        id: "financialShock",
        type: "crisis",
        duration: 2,
        name: "Financial Shock",
        description: "-2 wealth per round",
        applyRoundStart() {
            gameState.tracks.wealth -= 2;
        }
    },

    {
        id: "climateDisaster",
        type: "crisis",
        duration: 2,
        name: "Climate Disaster",
        description: "-2 planet per round",
        applyRoundStart() {
            gameState.tracks.planet -= 2;
        }
    }
];


/* ================================================= */
/* JOKER HELPERS */
/* ================================================= */

export function addJokerById(id) {
    const joker = ALL_JOKERS.find(j => j.id === id);
    if (!joker) return;

    if (joker.type === "movement") {
        gameState.activeJokers.push({ ...joker });
    }

    if (joker.type === "institutional") {
        gameState.institutionalJokers.push({ ...joker });
    }

    if (joker.type === "crisis") {
        gameState.crisisJokers.push({ ...joker });
    }
}


/* ================================================= */
/* APPLY ROUND START EFFECTS */
/* ================================================= */

export function applyRoundStartJokers() {

    [...gameState.activeJokers,
     ...gameState.institutionalJokers,
     ...gameState.crisisJokers].forEach(joker => {

        if (joker.applyRoundStart) {
            joker.applyRoundStart();
        }
    });

    // Crisis decay
    gameState.crisisJokers = gameState.crisisJokers.filter(j => {
        if (j.duration !== undefined) {
            j.duration -= 1;
            return j.duration > 0;
        }
        return true;
    });
}


/* ================================================= */
/* MODIFY CARD EFFECTS */
/* ================================================= */

export function applyCardModifiers(card, effects) {

    [...gameState.activeJokers,
     ...gameState.institutionalJokers].forEach(joker => {

        if (joker.modifyCard) {
            joker.modifyCard(card, effects);
        }
    });
}


/* ================================================= */
/* CARD PLAY TRIGGERS */
/* ================================================= */

export function triggerOnCardPlay(card) {

    [...gameState.activeJokers,
     ...gameState.institutionalJokers].forEach(joker => {

        if (joker.onCardPlay) {
            joker.onCardPlay(card);
        }
    });
}


/* ================================================= */
/* SYSTEM SPAWN LOGIC */
/* ================================================= */

export function evaluateStructuralSpawns() {

    /* Elite concentration trigger */
    if (
        gameState.tracks.wealth > 20 &&
        gameState.tracks.power > gameState.tracks.community &&
        gameState.tracks.tension > 15
    ) {
        addJokerById("eliteConsolidation");
    }

    /* High structural pressure */
    if (gameState.structuralPressure > 15) {
        addJokerById("mediaCapture");
    }

    /* Crisis trigger */
    if (
        gameState.tracks.tension > 25 &&
        gameState.momentum < 5
    ) {
        addJokerById("financialShock");
    }
}


/* ================================================= */
/* MANUAL BLEED (REMOVE PARASITE) */
/* ================================================= */

export function removeInstitutionalJoker(index) {

    if (!gameState.institutionalJokers[index]) return;

    // Bleed cost
    if (gameState.politicalCapital < 3) return;

    gameState.politicalCapital -= 3;
    gameState.tracks.tension += 2;

    gameState.institutionalJokers.splice(index, 1);
}
