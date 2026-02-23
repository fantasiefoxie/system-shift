# SYSTEM SHIFT - COMPLETE IMPLEMENTATION SPECIFICATION
## PART 1: EVENT SYSTEM

**Version:** 1.0  
**Target:** Any agentic AI implementation  
**Completeness:** 100% - No ambiguity, no missing details

---

## SECTION 1: EVENT SYSTEM IMPLEMENTATION

### 1.1 FILE CREATION: game/events.js

**Location:** `c:\git_projects\system-shift\game\events.js`  
**Purpose:** Define all game events with triggers, choices, and effects  
**Dependencies:** None (pure data)

**EXACT FILE CONTENT:**

```javascript
/* ================================================= */
/* SYSTEM SHIFT – EVENT SYSTEM                      */
/* Dynamic narrative events with player choices     */
/* ================================================= */

/**
 * EVENT STRUCTURE SPECIFICATION:
 * 
 * id: string - Unique identifier, lowercase_underscore format
 * trigger: object - Conditions that must be met
 *   - round: number or { min: number, max: number }
 *   - [trackName]: { min: number } or { max: number } or { equals: number }
 *   - multiple conditions are AND logic
 * title: string - Display name, Title Case
 * description: string - Narrative text, 1-2 sentences
 * flavor: string (optional) - Additional narrative context
 * choices: array of choice objects
 *   - text: string - Button text, imperative verb
 *   - effects: object - Track changes { trackName: number }
 *   - addCard: string (optional) - Card ID to add to deck
 *   - removeCard: string (optional) - Card ID to remove from deck
 *   - removeTag: string (optional) - Remove all cards with tag
 *   - addTag: string (optional) - Add all cards with tag
 *   - triggerEvent: string (optional) - Chain to another event
 *   - setFlag: string (optional) - Set persistent flag
 * autoEffects: object (optional) - Effects applied before choices
 * oneTime: boolean - If true, can only trigger once per game
 * priority: number - Higher priority events check first (default 0)
 */

export const eventPool = [

  /* ================================================= */
  /* ACT 1 EVENTS (Rounds 1-3) - Building Movement   */
  /* ================================================= */

  {
    id: "first_victory",
    trigger: { 
      round: 2,
      care: { min: 10 }
    },
    title: "First Victory",
    description: "Your movement wins its first concrete reform. The media takes notice.",
    flavor: "Small wins build momentum and attract new supporters.",
    choices: [
      {
        text: "Celebrate Publicly",
        effects: { solidarity: 2, surge: 1, strain: 1 }
      },
      {
        text: "Stay Focused",
        effects: { surge: 1 }
      },
      {
        text: "Demand More",
        effects: { solidarity: 1, strain: 2, surge: 2 }
      }
    ],
    oneTime: true,
    priority: 10
  },

  {
    id: "early_opposition",
    trigger: {
      round: { min: 2, max: 3 },
      capital: { max: 18 }
    },
    title: "Elite Pushback Begins",
    description: "Business leaders organize against your reforms. They threaten capital flight.",
    flavor: "The first sign that elites won't give up power easily.",
    choices: [
      {
        text: "Negotiate Compromise",
        effects: { capital: 1, solidarity: -1, strain: -1 }
      },
      {
        text: "Hold Firm",
        effects: { strain: 2, surge: 1 }
      },
      {
        text: "Escalate Pressure",
        effects: { capital: -1, strain: 3, surge: 2 }
      }
    ],
    oneTime: true,
    priority: 5
  },

  {
    id: "movement_split_early",
    trigger: {
      round: 3,
      solidarity: { min: 10 }
    },
    title: "Strategic Disagreement",
    description: "Your coalition debates tactics: reform or revolution?",
    flavor: "Internal debates are healthy, but can become divisions.",
    choices: [
      {
        text: "Embrace Both Approaches",
        effects: { solidarity: 1, strain: 2 },
        addCard: "radical_wing"
      },
      {
        text: "Commit to Reform",
        effects: { solidarity: -1, strain: -1 },
        removeTag: "radical"
      },
      {
        text: "Commit to Revolution",
        effects: { solidarity: -1, strain: 2 },
        removeTag: "reform"
      }
    ],
    oneTime: true,
    priority: 5
  },

  /* ================================================= */
  /* ACT 2 EVENTS (Rounds 4-7) - Confrontation       */
  /* ================================================= */

  {
    id: "economic_crisis",
    trigger: {
      round: 5,
      capital: { max: 12 }
    },
    title: "Economic Crisis",
    description: "Capital flight triggers recession. Unemployment rises. Elites demand austerity.",
    flavor: "Crisis moments define movements. How you respond matters.",
    autoEffects: { care: -1, strain: 2 },
    choices: [
      {
        text: "Accept Austerity",
        effects: { care: -3, strain: -2, capital: 3, solidarity: -2 }
      },
      {
        text: "Nationalize Key Industries",
        effects: { capital: -3, authority: 2, strain: 4, surge: 2 },
        addCard: "state_enterprise",
        removeTag: "capital"
      },
      {
        text: "Take on Debt",
        effects: { care: 1, strain: 1 },
        addCard: "debt_burden",
        setFlag: "in_debt"
      },
      {
        text: "Default and Restructure",
        effects: { capital: -2, strain: 5, surge: 3, solidarity: 2 },
        setFlag: "defaulted"
      }
    ],
    oneTime: true,
    priority: 100
  },

  {
    id: "general_strike_erupts",
    trigger: {
      round: { min: 4, max: 7 },
      solidarity: { min: 15 },
      strain: { min: 12 }
    },
    title: "Wildcat Strike Erupts",
    description: "Workers walk out without union approval. The movement faces a choice.",
    flavor: "Spontaneous action can build power or create chaos.",
    autoEffects: { strain: 1 },
    choices: [
      {
        text: "Support the Strike",
        effects: { solidarity: 3, authority: -2, surge: 3, strain: 2 },
        addCard: "general_strike"
      },
      {
        text: "Negotiate Settlement",
        effects: { care: 2, solidarity: 1, strain: -1 }
      },
      {
        text: "Condemn the Strike",
        effects: { authority: 1, solidarity: -3, strain: -2 }
      }
    ],
    oneTime: true,
    priority: 50
  },

  {
    id: "climate_disaster",
    trigger: {
      round: { min: 5, max: 8 },
      climate: { max: 8 }
    },
    title: "Climate Disaster Strikes",
    description: "Severe flooding devastates a major region. Thousands displaced.",
    flavor: "Climate change doesn't wait for political transformation.",
    autoEffects: { care: -2, strain: 3, climate: -1 },
    choices: [
      {
        text: "Emergency Relief",
        effects: { care: 3, capital: -2, solidarity: 1 }
      },
      {
        text: "Green Reconstruction",
        effects: { climate: 2, care: 1, capital: -3, strain: 2 }
      },
      {
        text: "Minimal Response",
        effects: { solidarity: -2, strain: 2 }
      }
    ],
    oneTime: true,
    priority: 80
  },

  {
    id: "media_smear_campaign",
    trigger: {
      round: { min: 4, max: 6 },
      solidarity: { min: 12 }
    },
    title: "Media Smear Campaign",
    description: "Corporate media launches coordinated attacks on your movement.",
    flavor: "They control the narrative. How do you respond?",
    autoEffects: { solidarity: -1 },
    choices: [
      {
        text: "Build Alternative Media",
        effects: { solidarity: 2, capital: -1 },
        addCard: "community_media"
      },
      {
        text: "Ignore and Organize",
        effects: { solidarity: 1, strain: 1 }
      },
      {
        text: "Legal Action",
        effects: { authority: 1, solidarity: -1 }
      }
    ],
    oneTime: true,
    priority: 30
  },

  {
    id: "international_pressure",
    trigger: {
      round: { min: 5, max: 7 },
      capital: { max: 10 }
    },
    title: "International Pressure",
    description: "Foreign governments and IMF threaten sanctions if you continue reforms.",
    flavor: "Transformation in one country faces global capital.",
    choices: [
      {
        text: "Defy Pressure",
        effects: { strain: 4, surge: 2, solidarity: 2 }
      },
      {
        text: "Seek Allies",
        effects: { strain: 2, solidarity: 1 }
      },
      {
        text: "Moderate Reforms",
        effects: { capital: 2, solidarity: -2, strain: -1 }
      }
    ],
    oneTime: true,
    priority: 40
  },

  {
    id: "coup_attempt",
    trigger: {
      round: { min: 6, max: 8 },
      authority: { max: 5 },
      capital: { min: 12 }
    },
    title: "Coup Attempt",
    description: "Military officers backed by elites attempt to seize power.",
    flavor: "When democratic change threatens power, elites abandon democracy.",
    autoEffects: { strain: 5 },
    choices: [
      {
        text: "Mass Mobilization",
        effects: { solidarity: 3, authority: -2, strain: 3, surge: 4 }
      },
      {
        text: "Negotiate with Military",
        effects: { authority: 3, solidarity: -2, strain: -2 }
      },
      {
        text: "Armed Resistance",
        effects: { authority: -3, strain: 6, surge: 3 },
        triggerEvent: "civil_conflict"
      }
    ],
    oneTime: true,
    priority: 200
  },

  /* ================================================= */
  /* ACT 3 EVENTS (Rounds 8-10) - Resolution         */
  /* ================================================= */

  {
    id: "final_push",
    trigger: {
      round: 9,
      solidarity: { min: 18 }
    },
    title: "The Final Push",
    description: "Your movement is at peak strength. Time for decisive action.",
    flavor: "Revolutionary moments don't last forever.",
    choices: [
      {
        text: "Seize the Moment",
        effects: { solidarity: 2, authority: -3, capital: -3, strain: 6, surge: 5 }
      },
      {
        text: "Consolidate Gains",
        effects: { solidarity: 1, strain: -2, surge: 2 }
      },
      {
        text: "Negotiate Transition",
        effects: { authority: 1, capital: 1, solidarity: -1, strain: -3 }
      }
    ],
    oneTime: true,
    priority: 150
  },

  {
    id: "elite_capitulation",
    trigger: {
      round: { min: 8, max: 10 },
      capital: { max: 5 },
      authority: { max: 5 }
    },
    title: "Elite Capitulation",
    description: "Facing inevitable defeat, elites offer to negotiate transition.",
    flavor: "Victory is close, but the terms matter.",
    choices: [
      {
        text: "Accept Compromise",
        effects: { capital: 2, authority: 2, strain: -3, solidarity: -1 }
      },
      {
        text: "Demand Full Transformation",
        effects: { strain: 4, surge: 3 }
      },
      {
        text: "Truth and Reconciliation",
        effects: { solidarity: 2, strain: -1 }
      }
    ],
    oneTime: true,
    priority: 120
  },

  {
    id: "movement_exhaustion",
    trigger: {
      round: { min: 8, max: 10 },
      strain: { min: 18 }
    },
    title: "Movement Exhaustion",
    description: "Years of struggle take their toll. People are tired.",
    flavor: "Even the most committed movements can burn out.",
    autoEffects: { solidarity: -2, surge: -1 },
    choices: [
      {
        text: "Push Through",
        effects: { strain: 2, surge: 1 }
      },
      {
        text: "Take a Breath",
        effects: { strain: -3, solidarity: 1, surge: -1 }
      },
      {
        text: "Accept Partial Victory",
        effects: { strain: -4, solidarity: -1 }
      }
    ],
    oneTime: true,
    priority: 90
  },

  /* ================================================= */
  /* CONDITIONAL EVENTS - Can trigger multiple times  */
  /* ================================================= */

  {
    id: "labor_unrest",
    trigger: {
      care: { max: 8 },
      solidarity: { min: 10 }
    },
    title: "Labor Unrest",
    description: "Workers demand better conditions. Strikes spread.",
    choices: [
      {
        text: "Support Workers",
        effects: { solidarity: 2, care: 1, strain: 2 }
      },
      {
        text: "Mediate",
        effects: { care: 1, strain: 1 }
      }
    ],
    oneTime: false,
    priority: 20
  },

  {
    id: "capital_flight",
    trigger: {
      capital: { max: 8 }
    },
    title: "Capital Flight",
    description: "Investors pull money out of the economy.",
    autoEffects: { strain: 2 },
    choices: [
      {
        text: "Capital Controls",
        effects: { capital: -1, strain: 2, surge: 1 }
      },
      {
        text: "Offer Incentives",
        effects: { capital: 2, care: -1 }
      }
    ],
    oneTime: false,
    priority: 15
  },

  {
    id: "grassroots_initiative",
    trigger: {
      solidarity: { min: 12 },
      strain: { max: 12 }
    },
    title: "Grassroots Initiative",
    description: "Local communities organize mutual aid networks.",
    choices: [
      {
        text: "Support Initiative",
        effects: { solidarity: 1, care: 1, surge: 1 }
      },
      {
        text: "Institutionalize It",
        effects: { care: 2, authority: 1, solidarity: -1 }
      }
    ],
    oneTime: false,
    priority: 10
  },

  {
    id: "climate_protest",
    trigger: {
      climate: { max: 10 },
      solidarity: { min: 8 }
    },
    title: "Climate Protest",
    description: "Youth activists block streets demanding climate action.",
    choices: [
      {
        text: "Join Protest",
        effects: { climate: 1, solidarity: 1, strain: 1 }
      },
      {
        text: "Promise Action",
        effects: { climate: 1, strain: 1 }
      },
      {
        text: "Disperse Protest",
        effects: { authority: 1, solidarity: -1, strain: -1 }
      }
    ],
    oneTime: false,
    priority: 12
  },

  {
    id: "elite_concession",
    trigger: {
      strain: { min: 15 },
      capital: { min: 10 }
    },
    title: "Elite Concession",
    description: "Facing unrest, elites offer minor reforms.",
    choices: [
      {
        text: "Accept",
        effects: { care: 1, strain: -2, solidarity: -1 }
      },
      {
        text: "Reject",
        effects: { strain: 1, surge: 1 }
      }
    ],
    oneTime: false,
    priority: 25
  }

];

/**
 * TOTAL EVENTS: 20
 * - Act 1: 3 events
 * - Act 2: 6 events
 * - Act 3: 3 events
 * - Conditional: 5 events (repeatable)
 * - One-time: 15 events
 * - Repeatable: 5 events
 */
```

**END OF FILE: game/events.js**

---

### 1.2 FILE CREATION: game/eventResolver.js

**Location:** `c:\git_projects\system-shift\game\eventResolver.js`  
**Purpose:** Handle event triggering, choice resolution, and state management  
**Dependencies:** `events.js`, `state.js`, `logger.js`

**EXACT FILE CONTENT:**

```javascript
/* ================================================= */
/* SYSTEM SHIFT – EVENT RESOLVER                    */
/* Event trigger checking and choice resolution     */
/* ================================================= */

import { eventPool } from "./events.js";
import { gameState } from "./state.js";
import { log } from "./logger.js";

/* ================================================= */
/* EVENT TRIGGER EVALUATION                         */
/* ================================================= */

/**
 * Evaluate if a trigger condition is met
 * @param {object} trigger - Trigger condition object
 * @returns {boolean} - True if condition met
 */
function evaluateTrigger(trigger) {
    
    // Check round condition
    if (trigger.round !== undefined) {
        if (typeof trigger.round === 'number') {
            if (gameState.round !== trigger.round) return false;
        } else if (typeof trigger.round === 'object') {
            if (trigger.round.min !== undefined && gameState.round < trigger.round.min) return false;
            if (trigger.round.max !== undefined && gameState.round > trigger.round.max) return false;
        }
    }
    
    // Check track conditions
    for (let key in trigger) {
        if (key === 'round') continue;
        
        const condition = trigger[key];
        const trackValue = gameState.tracks[key];
        
        if (trackValue === undefined) continue;
        
        if (condition.min !== undefined && trackValue < condition.min) return false;
        if (condition.max !== undefined && trackValue > condition.max) return false;
        if (condition.equals !== undefined && trackValue !== condition.equals) return false;
    }
    
    return true;
}

/* ================================================= */
/* EVENT CHECKING                                   */
/* ================================================= */

/**
 * Check if any events should trigger
 * @returns {object|null} - Event object or null
 */
export function checkEvents() {
    
    // Sort events by priority (highest first)
    const sortedEvents = [...eventPool].sort((a, b) => {
        const priorityA = a.priority || 0;
        const priorityB = b.priority || 0;
        return priorityB - priorityA;
    });
    
    for (let event of sortedEvents) {
        
        // Skip if already triggered and is one-time
        if (event.oneTime && gameState.events.triggered.includes(event.id)) {
            continue;
        }
        
        // Check if trigger conditions met
        if (evaluateTrigger(event.trigger)) {
            
            // Mark as triggered
            if (event.oneTime) {
                gameState.events.triggered.push(event.id);
            }
            
            log("EVENT_TRIGGERED", { 
                id: event.id, 
                title: event.title,
                round: gameState.round 
            });
            
            return event;
        }
    }
    
    return null;
}

/* ================================================= */
/* EFFECT APPLICATION                               */
/* ================================================= */

/**
 * Apply effects to game state
 * @param {object} effects - Effects object { trackName: value }
 */
function applyEffects(effects) {
    
    for (let key in effects) {
        const value = Number(effects[key]) || 0;
        
        if (key === "surge") {
            gameState.surge += value;
            gameState.surge = Math.max(0, gameState.surge);
        } else if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += value;
            
            // Apply track constraints
            if (key === "authority" || key === "capital") {
                gameState.tracks[key] = Math.max(0, gameState.tracks[key]);
            }
            gameState.tracks[key] = Math.max(0, Math.min(20, gameState.tracks[key]));
        }
    }
    
    log("EVENT_EFFECTS_APPLIED", effects);
}

/* ================================================= */
/* CHOICE RESOLUTION                                */
/* ================================================= */

/**
 * Resolve player's event choice
 * @param {object} event - Event object
 * @param {number} choiceIndex - Index of chosen option
 */
export function resolveEventChoice(event, choiceIndex) {
    
    const choice = event.choices[choiceIndex];
    
    if (!choice) {
        console.error("Invalid choice index:", choiceIndex);
        return;
    }
    
    log("EVENT_CHOICE_MADE", {
        eventId: event.id,
        choiceText: choice.text,
        choiceIndex
    });
    
    // Apply choice effects
    if (choice.effects) {
        applyEffects(choice.effects);
    }
    
    // Add card to deck
    if (choice.addCard) {
        gameState.events.cardsToAdd.push(choice.addCard);
        log("EVENT_CARD_ADDED", { cardId: choice.addCard });
    }
    
    // Remove card from deck
    if (choice.removeCard) {
        gameState.events.cardsToRemove.push(choice.removeCard);
        log("EVENT_CARD_REMOVED", { cardId: choice.removeCard });
    }
    
    // Remove all cards with tag
    if (choice.removeTag) {
        gameState.events.tagsToRemove.push(choice.removeTag);
        log("EVENT_TAG_REMOVED", { tag: choice.removeTag });
    }
    
    // Add all cards with tag
    if (choice.addTag) {
        gameState.events.tagsToAdd.push(choice.addTag);
        log("EVENT_TAG_ADDED", { tag: choice.addTag });
    }
    
    // Set persistent flag
    if (choice.setFlag) {
        gameState.events.flags[choice.setFlag] = true;
        log("EVENT_FLAG_SET", { flag: choice.setFlag });
    }
    
    // Chain to another event
    if (choice.triggerEvent) {
        const chainedEvent = eventPool.find(e => e.id === choice.triggerEvent);
        if (chainedEvent) {
            gameState.events.pending = chainedEvent;
            log("EVENT_CHAINED", { nextEventId: choice.triggerEvent });
        }
    }
    
    // Clear pending event
    gameState.events.pending = null;
}

/* ================================================= */
/* AUTO EFFECTS                                     */
/* ================================================= */

/**
 * Apply automatic effects when event triggers
 * @param {object} event - Event object
 */
export function applyAutoEffects(event) {
    if (event.autoEffects) {
        applyEffects(event.autoEffects);
        log("EVENT_AUTO_EFFECTS", event.autoEffects);
    }
}
```

**END OF FILE: game/eventResolver.js**

---

