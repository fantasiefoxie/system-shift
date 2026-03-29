/* ================================================= */
/* SYSTEM SHIFT – ACT STRUCTURE                     */
/* Three-act dramatic progression                   */
/* ================================================= */

export const acts = {
  1: {
    name: "Building Movement",
    rounds: [1, 2, 3],
    description: "Organize and build capacity",
    modifiers: {
      strainMultiplier: 0.75,
      leverageBonus: 1
    },
    cardFilter: null // All cards available
  },
  2: {
    name: "Confrontation",
    rounds: [4, 5, 6, 7],
    description: "Face elite resistance",
    modifiers: {
      strainMultiplier: 1.25,
      eliteActionChance: 0.9
    },
    cardFilter: null
  },
  3: {
    name: "Resolution",
    rounds: [8, 9, 10],
    description: "Push for transformation",
    modifiers: {
      strainMultiplier: 1.5,
      surgeBonus: 2
    },
    cardFilter: null
  }
};

export function getCurrentAct(round) {
  for (let [actNum, actData] of Object.entries(acts)) {
    if (actData.rounds.includes(round)) {
      return { act: parseInt(actNum), ...actData };
    }
  }
  return null;
}