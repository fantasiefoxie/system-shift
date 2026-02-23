# SYSTEM SHIFT - COMPLETE IMPLEMENTATION SPECIFICATION
## PART 2: STATE MODIFICATIONS AND ELITE ACTIONS

---

### 1.3 FILE MODIFICATION: game/state.js

**Location:** `c:\git_projects\system-shift\game\state.js`  
**Action:** ADD event tracking to gameState object  
**Line to modify:** After line 67 (after tracks definition)

**EXACT CHANGES:**

Find this section:
```javascript
    tracks: {
        care: 8,
        climate: 8,
        solidarity: 6,
        authority: 10,
        capital: 20,
        strain: 10
    },
```

Add IMMEDIATELY AFTER (before card system section):
```javascript

    /* ================================================= */
    /* EVENT SYSTEM STATE                               */
    /* ================================================= */

    events: {
        triggered: [],        // Array of event IDs that have been triggered
        pending: null,        // Currently active event object
        flags: {},           // Persistent flags set by events { flagName: true }
        cardsToAdd: [],      // Card IDs to add to deck after event
        cardsToRemove: [],   // Card IDs to remove from deck after event
        tagsToAdd: [],       // Tags to add all cards of
        tagsToRemove: []     // Tags to remove all cards of
    },

    /* ================================================= */
    /* ELITE ACTION STATE                               */
    /* ================================================= */

    elite: {
        lastAction: null,     // Last elite action taken
        actionHistory: [],    // Array of all elite actions
        suppressionLevel: 0,  // Accumulated repression (0-10)
        desperation: 0        // How desperate elites are (0-10)
    },
```

**VERIFICATION:**
- gameState.events must exist
- gameState.events.triggered must be empty array
- gameState.events.pending must be null
- gameState.elite must exist

---

### 1.4 FILE MODIFICATION: game/round.js

**Location:** `c:\git_projects\system-shift\game\round.js`  
**Action:** Integrate event checking into round flow  
**Multiple insertion points**

**CHANGE 1: Add imports at top of file**

Find line 7:
```javascript
import { log } from "./logger.js";
```

Add IMMEDIATELY AFTER:
```javascript
import { checkEvents, applyAutoEffects } from "./eventResolver.js";
import { checkEliteAction, executeEliteAction } from "./eliteActions.js";
```

**CHANGE 2: Check events at round start**

Find the `endRound` function (around line 150). Find this line:
```javascript
export function endRound() {

    log("ROUND_ENDING", { round: gameState.round });
```

Add IMMEDIATELY AFTER the log statement:
```javascript

    /* --------------------------------------------- */
    /* 0. CHECK FOR EVENTS                          */
    /* --------------------------------------------- */

    const event = checkEvents();
    if (event) {
        applyAutoEffects(event);
        gameState.events.pending = event;
        // Event will be displayed by UI, round pauses until choice made
        return; // Exit early, resume after event choice
    }
```

**CHANGE 3: Execute elite action at round end**

Find this section (around line 240):
```javascript
    /* --------------------------------------------- */
    /* 6. RESET ROUND STATE                         */
    /* --------------------------------------------- */

    gameState.playsThisRound = 0;
    gameState.playerHand = [];
}
```

Add BEFORE the reset section:
```javascript

    /* --------------------------------------------- */
    /* 6. ELITE ACTION                              */
    /* --------------------------------------------- */

    const eliteAction = checkEliteAction();
    if (eliteAction) {
        executeEliteAction(eliteAction);
        gameState.elite.lastAction = eliteAction;
        gameState.elite.actionHistory.push({
            round: gameState.round,
            action: eliteAction.id
        });
    }

```

**VERIFICATION:**
- Events check before round end logic
- Elite actions execute after strain drift
- Round pauses if event pending

---

## SECTION 2: ELITE ACTION SYSTEM

### 2.1 FILE CREATION: game/eliteActions.js

**Location:** `c:\git_projects\system-shift\game\eliteActions.js`  
**Purpose:** Define elite opposition actions and execution logic  
**Dependencies:** `state.js`, `logger.js`

**EXACT FILE CONTENT:**

```javascript
/* ================================================= */
/* SYSTEM SHIFT – ELITE ACTIONS                     */
/* Dynamic opposition that responds to player       */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";

/**
 * ELITE ACTION STRUCTURE:
 * 
 * id: string - Unique identifier
 * name: string - Display name
 * description: string - What elites are doing
 * condition: object - When this action is viable
 *   - Same format as event triggers
 * effects: object - Track changes
 * weight: number - Probability weight (higher = more likely)
 * desperation: number - Minimum desperation level (0-10)
 */

export const eliteActionPool = [

  /* ================================================= */
  /* ECONOMIC ACTIONS                                 */
  /* ================================================= */

  {
    id: "austerity_package",
    name: "Austerity Package",
    description: "Elites push spending cuts to protect profits.",
    condition: {
      capital: { max: 14 },
      care: { min: 10 }
    },
    effects: {
      care: -2,
      capital: 2,
      strain: 2
    },
    weight: 10,
    desperation: 0
  },

  {
    id: "capital_strike",
    name: "Investment Freeze",
    description: "Businesses halt investment to pressure government.",
    condition: {
      capital: { max: 10 }
    },
    effects: {
      leverage: -2,
      strain: 2,
      capital: 1
    },
    weight: 15,
    desperation: 3
  },

  {
    id: "price_gouging",
    name: "Price Increases",
    description: "Corporations raise prices, blaming reforms.",
    condition: {
      capital: { max: 12 },
      care: { min: 12 }
    },
    effects: {
      care: -1,
      strain: 2,
      solidarity: -1
    },
    weight: 8,
    desperation: 0
  },

  {
    id: "capital_flight",
    name: "Capital Flight",
    description: "Wealthy move assets offshore.",
    condition: {
      capital: { max: 8 }
    },
    effects: {
      capital: -1,
      strain: 3,
      leverage: -1
    },
    weight: 12,
    desperation: 5
  },

  /* ================================================= */
  /* MEDIA & PROPAGANDA                               */
  /* ================================================= */

  {
    id: "media_smear",
    name: "Media Smear Campaign",
    description: "Corporate media attacks movement leaders.",
    condition: {
      solidarity: { min: 12 }
    },
    effects: {
      solidarity: -2,
      leverage: -1
    },
    weight: 10,
    desperation: 2
  },

  {
    id: "fake_news",
    name: "Disinformation Campaign",
    description: "Coordinated spread of false narratives.",
    condition: {
      solidarity: { min: 14 },
      strain: { min: 10 }
    },
    effects: {
      solidarity: -1,
      strain: 1
    },
    weight: 8,
    desperation: 3
  },

  {
    id: "divide_conquer",
    name: "Divide and Conquer",
    description: "Elites exploit divisions within movement.",
    condition: {
      solidarity: { min: 15 }
    },
    effects: {
      solidarity: -2,
      strain: 2
    },
    weight: 12,
    desperation: 4
  },

  /* ================================================= */
  /* POLITICAL ACTIONS                                */
  /* ================================================= */

  {
    id: "lobby_campaign",
    name: "Lobbying Blitz",
    description: "Massive spending to influence politicians.",
    condition: {
      authority: { max: 8 },
      capital: { min: 12 }
    },
    effects: {
      authority: 2,
      capital: -1
    },
    weight: 10,
    desperation: 1
  },

  {
    id: "legal_challenges",
    name: "Legal Obstruction",
    description: "Lawsuits challenge reform legality.",
    condition: {
      care: { min: 12 }
    },
    effects: {
      leverage: -1,
      strain: 1
    },
    weight: 7,
    desperation: 0
  },

  {
    id: "bureaucratic_sabotage",
    name: "Bureaucratic Sabotage",
    description: "Officials slow-walk implementation.",
    condition: {
      authority: { min: 8 }
    },
    effects: {
      care: -1,
      strain: 1
    },
    weight: 6,
    desperation: 2
  },

  /* ================================================= */
  /* REPRESSION                                       */
  /* ================================================= */

  {
    id: "police_crackdown",
    name: "Police Crackdown",
    description: "Violent suppression of protests.",
    condition: {
      strain: { min: 14 },
      authority: { min: 8 }
    },
    effects: {
      solidarity: -2,
      authority: 1,
      strain: -1
    },
    weight: 15,
    desperation: 6
  },

  {
    id: "surveillance_expansion",
    name: "Surveillance State",
    description: "Mass monitoring of activists.",
    condition: {
      solidarity: { min: 14 },
      authority: { min: 10 }
    },
    effects: {
      solidarity: -1,
      authority: 1,
      strain: 1
    },
    weight: 10,
    desperation: 5
  },

  {
    id: "arrest_leaders",
    name: "Arrest Movement Leaders",
    description: "Targeted repression of organizers.",
    condition: {
      solidarity: { min: 16 },
      authority: { min: 10 }
    },
    effects: {
      solidarity: -3,
      authority: 1,
      strain: 2,
      surge: -1
    },
    weight: 20,
    desperation: 7
  },

  {
    id: "martial_law",
    name: "Declare Martial Law",
    description: "Military rule to crush opposition.",
    condition: {
      strain: { min: 18 },
      authority: { min: 12 }
    },
    effects: {
      solidarity: -4,
      authority: 3,
      strain: -3,
      surge: -2
    },
    weight: 25,
    desperation: 9
  },

  /* ================================================= */
  /* CONCESSIONS                                      */
  /* ================================================= */

  {
    id: "token_reform",
    name: "Token Reform",
    description: "Minor concessions to defuse tension.",
    condition: {
      strain: { min: 14 }
    },
    effects: {
      care: 1,
      strain: -2,
      solidarity: -1
    },
    weight: 8,
    desperation: 0
  },

  {
    id: "coopt_leaders",
    name: "Co-opt Leaders",
    description: "Offer positions to movement leaders.",
    condition: {
      solidarity: { min: 14 }
    },
    effects: {
      authority: 1,
      solidarity: -2,
      strain: -1
    },
    weight: 10,
    desperation: 4
  },

  /* ================================================= */
  /* DESPERATE MEASURES                               */
  /* ================================================= */

  {
    id: "foreign_intervention",
    name: "Call for Foreign Intervention",
    description: "Elites invite foreign military support.",
    condition: {
      capital: { max: 5 },
      authority: { max: 5 }
    },
    effects: {
      authority: 4,
      solidarity: -3,
      strain: 5,
      capital: 2
    },
    weight: 30,
    desperation: 10
  },

  {
    id: "scorched_earth",
    name: "Scorched Earth",
    description: "Elites destroy economy rather than lose control.",
    condition: {
      capital: { max: 3 }
    },
    effects: {
      capital: -2,
      care: -3,
      strain: 6
    },
    weight: 25,
    desperation: 10
  }

];

/* ================================================= */
/* ELITE ACTION SELECTION                           */
/* ================================================= */

/**
 * Calculate elite desperation level
 * @returns {number} - Desperation 0-10
 */
function calculateDesperation() {
    const t = gameState.tracks;
    
    let desperation = 0;
    
    // Low elite power increases desperation
    const elitePower = t.authority + t.capital;
    if (elitePower < 15) desperation += 3;
    if (elitePower < 10) desperation += 3;
    if (elitePower < 5) desperation += 4;
    
    // High social power increases desperation
    const socialPower = t.care + t.solidarity;
    if (socialPower > 25) desperation += 2;
    if (socialPower > 30) desperation += 3;
    
    // High strain increases desperation
    if (t.strain > 15) desperation += 2;
    if (t.strain > 18) desperation += 3;
    
    return Math.min(10, desperation);
}

/**
 * Evaluate if elite action condition is met
 * @param {object} condition - Condition object
 * @returns {boolean}
 */
function evaluateCondition(condition) {
    for (let key in condition) {
        const trackValue = gameState.tracks[key];
        if (trackValue === undefined) continue;
        
        const cond = condition[key];
        if (cond.min !== undefined && trackValue < cond.min) return false;
        if (cond.max !== undefined && trackValue > cond.max) return false;
        if (cond.equals !== undefined && trackValue !== cond.equals) return false;
    }
    return true;
}

/**
 * Check if elite should act and select action
 * @returns {object|null} - Elite action or null
 */
export function checkEliteAction() {
    
    // Calculate desperation
    const desperation = calculateDesperation();
    gameState.elite.desperation = desperation;
    
    // 80% chance of elite action
    if (Math.random() > 0.8) {
        log("ELITE_NO_ACTION", { desperation });
        return null;
    }
    
    // Filter viable actions
    const viableActions = eliteActionPool.filter(action => {
        // Check desperation requirement
        if (action.desperation > desperation) return false;
        
        // Check conditions
        if (!evaluateCondition(action.condition)) return false;
        
        return true;
    });
    
    if (viableActions.length === 0) {
        log("ELITE_NO_VIABLE_ACTION", { desperation });
        return null;
    }
    
    // Weighted random selection
    const totalWeight = viableActions.reduce((sum, a) => sum + a.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let action of viableActions) {
        random -= action.weight;
        if (random <= 0) {
            log("ELITE_ACTION_SELECTED", { 
                id: action.id, 
                desperation,
                viableCount: viableActions.length 
            });
            return action;
        }
    }
    
    // Fallback to first viable
    return viableActions[0];
}

/* ================================================= */
/* ELITE ACTION EXECUTION                           */
/* ================================================= */

/**
 * Execute elite action effects
 * @param {object} action - Elite action object
 */
export function executeEliteAction(action) {
    
    log("ELITE_ACTION_EXECUTED", {
        id: action.id,
        name: action.name,
        round: gameState.round
    });
    
    // Apply effects
    for (let key in action.effects) {
        const value = Number(action.effects[key]) || 0;
        
        if (key === "surge") {
            gameState.surge += value;
            gameState.surge = Math.max(0, gameState.surge);
        } else if (key === "leverage") {
            gameState.leverage += value;
            gameState.leverage = Math.max(0, Math.min(gameState.maxLeverage, gameState.leverage));
        } else if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += value;
            
            // Apply constraints
            if (key === "authority" || key === "capital") {
                gameState.tracks[key] = Math.max(0, gameState.tracks[key]);
            }
            gameState.tracks[key] = Math.max(0, Math.min(20, gameState.tracks[key]));
        }
    }
    
    // Increase suppression if repressive action
    if (action.id.includes("crackdown") || action.id.includes("arrest") || action.id.includes("martial")) {
        gameState.elite.suppressionLevel = Math.min(10, gameState.elite.suppressionLevel + 1);
    }
}

/**
 * TOTAL ELITE ACTIONS: 18
 * - Economic: 4 actions
 * - Media: 3 actions
 * - Political: 3 actions
 * - Repression: 4 actions
 * - Concessions: 2 actions
 * - Desperate: 2 actions
 */
```

**END OF FILE: game/eliteActions.js**

---

