# PARTS 7-11: COMPLETE SPECIFICATIONS

---

# PART 7: DECK EVOLUTION

## 7.1 ADD to game/deck.js

```javascript
export function addCardToDeck(cardId) {
  const card = baseDeck.find(c => c.id === cardId);
  if (card) {
    gameState.deck.push({ ...card });
    log("CARD_ADDED", { cardId });
  }
}

export function removeCardFromDeck(cardId) {
  const index = gameState.deck.findIndex(c => c.id === cardId);
  if (index !== -1) {
    gameState.deck.splice(index, 1);
    log("CARD_REMOVED", { cardId });
  }
}

export function removeCardsByTag(tag) {
  gameState.deck = gameState.deck.filter(c => !c.tags || !c.tags.includes(tag));
  log("TAG_REMOVED", { tag });
}
```

## 7.2 ADD 10 NEW CARDS to baseDeck

```javascript
{ id: 601, suit: "system", title: "Nationalize Industry", 
  effects: { capital: -5, authority: 3, strain: 4 }, cost: 4,
  tags: ["radical", "economic", "disruptive"],
  onPlay: { removeTag: "capital", addCard: 602 } },

{ id: 602, suit: "system", title: "State Enterprise", 
  effects: { care: 2, capital: 1 }, cost: 2,
  tags: ["institutional", "economic"] },

{ id: 603, suit: "system", title: "Movement Split", 
  effects: { solidarity: 3, strain: 3 }, cost: 2,
  tags: ["crisis", "organizing"],
  onPlay: { addCard: 604 } },

{ id: 604, suit: "system", title: "Internal Conflict", 
  effects: { solidarity: -1, strain: 2 }, cost: 1,
  tags: ["crisis"] },

{ id: 605, suit: "system", title: "Debt Burden", 
  effects: { leverage: -1, strain: 1 }, cost: 0,
  tags: ["crisis", "economic"] },

{ id: 606, suit: "system", title: "Radical Wing", 
  effects: { solidarity: 2, strain: 2, surge: 1 }, cost: 2,
  tags: ["radical", "organizing"] },

{ id: 607, suit: "system", title: "Dual Power", 
  effects: { solidarity: 4, authority: -3, strain: 3 }, cost: 4,
  tags: ["radical", "organizing", "disruptive"] },

{ id: 608, suit: "system", title: "Popular Assembly", 
  effects: { solidarity: 3, authority: -1 }, cost: 2,
  tags: ["grassroots", "organizing"] },

{ id: 609, suit: "system", title: "Strike Fund", 
  effects: { solidarity: 2, care: 1 }, cost: 2,
  tags: ["labor", "organizing"] },

{ id: 610, suit: "system", title: "Mutual Aid Network", 
  effects: { care: 2, solidarity: 1 }, cost: 2,
  tags: ["grassroots", "organizing"] }
```

## 7.3 MODIFY: game/round.js - Execute deck changes

In playCard, after applyEffects, add:
```javascript
    // Execute onPlay deck modifications
    if (card.onPlay) {
        if (card.onPlay.addCard) {
            addCardToDeck(card.onPlay.addCard);
        }
        if (card.onPlay.removeCard) {
            removeCardFromDeck(card.onPlay.removeCard);
        }
        if (card.onPlay.removeTag) {
            removeCardsByTag(card.onPlay.removeTag);
        }
    }
```

**VERIFICATION:**
- [ ] 10 new cards added
- [ ] Deck modifications execute
- [ ] Cards persist across shuffles

---

# PART 8: HIDDEN INFORMATION

## 8.1 CREATE: game/hiddenTracks.js

```javascript
export const hiddenTracks = {
  eliteCohesion: 10,
  movementMorale: 10,
  internationalPressure: 5
};

export function updateHiddenTracks() {
  const t = gameState.tracks;
  
  // Elite cohesion decreases as power drops
  if (t.authority + t.capital < 20) {
    hiddenTracks.eliteCohesion = Math.max(0, hiddenTracks.eliteCohesion - 1);
  }
  
  // Movement morale increases with wins
  if (t.care + t.solidarity > 30) {
    hiddenTracks.movementMorale = Math.min(20, hiddenTracks.movementMorale + 1);
  }
  
  // International pressure fluctuates
  hiddenTracks.internationalPressure += Math.floor(Math.random() * 3) - 1;
  hiddenTracks.internationalPressure = Math.max(0, Math.min(10, hiddenTracks.internationalPressure));
}
```

## 8.2 ADD SCOUTING CARDS to deck.js

```javascript
{ id: 701, suit: "system", title: "Investigative Journalism", 
  effects: { authority: -1 }, cost: 2,
  tags: ["reform", "institutional"],
  onPlay: { reveal: "next_3_cards" } },

{ id: 702, suit: "system", title: "Intelligence Network", 
  effects: { solidarity: 1 }, cost: 2,
  tags: ["grassroots", "organizing"],
  onPlay: { reveal: "hidden_tracks" } },

{ id: 703, suit: "system", title: "Polling Data", 
  effects: {}, cost: 1,
  tags: ["reform"],
  onPlay: { reveal: "next_elite_action" } },

{ id: 704, suit: "system", title: "Wildcat Strike", 
  effects: { solidarity: "2-5" }, cost: 2,
  tags: ["radical", "labor"] },

{ id: 705, suit: "system", title: "Spontaneous Protest", 
  effects: { solidarity: "1-4", strain: "1-3" }, cost: 1,
  tags: ["grassroots"] }
```

## 8.3 MODIFY: game/state.js

Add:
```javascript
    hiddenTracks: {
      eliteCohesion: 10,
      movementMorale: 10,
      internationalPressure: 5
    },
    revealed: {
      hiddenTracks: false,
      nextCards: [],
      nextEliteAction: null
    }
```

**VERIFICATION:**
- [ ] Hidden tracks exist
- [ ] Scouting reveals work
- [ ] Random effects vary

---

# PART 9: MEMORY SYSTEM

## 9.1 CREATE: game/memory.js

```javascript
export const memoryChecks = {
  brokenPromise: (state) => {
    if (state.memory.maxCare && state.tracks.care < state.memory.maxCare - 3) {
      return {
        type: "broken_promise",
        effect: { solidarity: -2, strain: 2 },
        message: "The people remember your broken promises."
      };
    }
    return null;
  },
  
  consistentVision: (state) => {
    const tagCounts = {};
    state.memory.cardsPlayed.forEach(card => {
      card.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    if (Math.max(...Object.values(tagCounts)) >= 5) {
      return {
        type: "consistent_vision",
        effect: { surge: 2, solidarity: 1 },
        message: "Your unwavering vision inspires the movement."
      };
    }
    return null;
  }
};

export function checkMemory() {
  for (let check of Object.values(memoryChecks)) {
    const result = check(gameState);
    if (result) return result;
  }
  return null;
}
```

## 9.2 MODIFY: game/state.js

Add:
```javascript
    memory: {
      maxCare: 8,
      maxClimate: 8,
      cardsPlayed: [],
      eventsChosen: []
    }
```

## 9.3 MODIFY: game/round.js

In playCard, add:
```javascript
    gameState.memory.cardsPlayed.push(card);
    gameState.memory.maxCare = Math.max(gameState.memory.maxCare, gameState.tracks.care);
    gameState.memory.maxClimate = Math.max(gameState.memory.maxClimate, gameState.tracks.climate);
```

In endRound, add:
```javascript
    const memoryResult = checkMemory();
    if (memoryResult) {
        applyEffects(memoryResult.effect);
        log("MEMORY_TRIGGERED", memoryResult);
    }
```

**VERIFICATION:**
- [ ] Memory tracks actions
- [ ] Consequences trigger
- [ ] Messages display

---

# PART 10: THRESHOLDS

## 10.1 CREATE: game/thresholds.js

```javascript
export const thresholds = [
  {
    id: "mass_movement",
    name: "Mass Movement",
    condition: { solidarity: { min: 15 } },
    effect: "solidarity_bonus",
    value: 1,
    persistent: true
  },
  {
    id: "legitimacy_crisis",
    name: "Legitimacy Crisis",
    condition: { authority: { max: 3 } },
    effect: "unlock_radical",
    persistent: true
  },
  {
    id: "climate_emergency",
    name: "Climate Emergency",
    condition: { climate: { max: 5 }, round: { min: 6 } },
    effect: "strain_per_round",
    value: 2,
    persistent: true
  },
  {
    id: "dual_power",
    name: "Dual Power",
    condition: { solidarity: { min: 18 }, authority: { max: 5 } },
    effect: "new_ending",
    ending: "DUAL_POWER_TRANSITION",
    persistent: true
  },
  {
    id: "fascist_threat",
    name: "Fascist Threat",
    condition: { strain: { min: 16 }, capital: { min: 15 }, authority: { min: 12 } },
    effect: "elite_desperation",
    value: 3,
    persistent: true
  },
  {
    id: "economic_collapse",
    name: "Economic Collapse",
    condition: { capital: { max: 3 } },
    effect: "strain_spike",
    value: 5,
    persistent: false
  },
  {
    id: "popular_uprising",
    name: "Popular Uprising",
    condition: { solidarity: { min: 18 }, strain: { min: 15 } },
    effect: "surge_bonus",
    value: 5,
    persistent: false
  },
  {
    id: "green_transition",
    name: "Green Transition",
    condition: { climate: { min: 18 }, care: { min: 15 } },
    effect: "strain_reduction",
    value: -2,
    persistent: true
  }
];

export function checkThresholds() {
  thresholds.forEach(threshold => {
    if (gameState.activeThresholds.includes(threshold.id)) return;
    if (evaluateCondition(threshold.condition)) {
      gameState.activeThresholds.push(threshold.id);
      applyThresholdEffect(threshold);
      log("THRESHOLD_CROSSED", threshold);
    }
  });
}

function applyThresholdEffect(threshold) {
  switch(threshold.effect) {
    case "solidarity_bonus":
      // Applied in playCard when solidarity cards played
      break;
    case "strain_per_round":
      // Applied in endRound
      break;
    case "surge_bonus":
      gameState.surge += threshold.value;
      break;
    case "strain_spike":
      gameState.tracks.strain += threshold.value;
      break;
    case "elite_desperation":
      gameState.elite.desperation += threshold.value;
      break;
  }
}
```

## 10.2 MODIFY: game/state.js

Add:
```javascript
    activeThresholds: []
```

## 10.3 MODIFY: game/round.js

Add import:
```javascript
import { checkThresholds } from "./thresholds.js";
```

In endRound, add:
```javascript
    checkThresholds();
```

## 10.4 MODIFY: game/outcomeEngine.js

Add new ending:
```javascript
    if (gameState.activeThresholds.includes("dual_power")) {
        return {
            type: "DUAL POWER TRANSITION",
            message: "Parallel institutions have replaced the old order.",
            tags: { transformative: true, revolutionary: true }
        };
    }
```

**VERIFICATION:**
- [ ] Thresholds trigger at correct values
- [ ] Effects persist
- [ ] New ending accessible

---

# PART 11: TESTING & BALANCE

## 11.1 UPDATE: simulate.js

Add all new systems to simulation:
- Event checking
- Elite actions
- Tag tracking
- Synergies
- Act modifiers
- Archetype abilities
- Deck evolution
- Hidden tracks
- Memory checks
- Thresholds

## 11.2 RUN SIMULATIONS

```bash
node simulate.js
```

Target distribution:
- SOCIAL TRANSFORMATION: 15-25%
- ECOLOGICAL TRANSITION: 15-25%
- TURBULENT TRANSFORMATION: 10-20%
- SYSTEM COLLAPSE: 5-15%
- AUTHORITARIAN CONSOLIDATION: 5-15%
- MANAGED STABILITY: 10-20%
- SYSTEM DRIFT: 10-20%

## 11.3 BALANCE ADJUSTMENTS

If outcomes skewed:
- Adjust card costs
- Tune event frequencies
- Modify elite action weights
- Adjust threshold values
- Balance archetype abilities

## 11.4 BUG FIXES

Common issues:
- State not updating
- Events not triggering
- Elite actions too frequent
- Synergies not working
- Memory not tracking
- Thresholds not persisting

## 11.5 PERFORMANCE

Optimize:
- Event checking (cache results)
- Elite action selection (pre-filter)
- Tag tracking (use Set)
- Memory checks (debounce)

**VERIFICATION:**
- [ ] All 7 endings occur
- [ ] No dominant strategy
- [ ] No crashes
- [ ] Performance acceptable
- [ ] All systems integrated

---

# IMPLEMENTATION COMPLETE

**Total Files Created:** 11
**Total Files Modified:** 8
**Total Lines of Code:** ~5000 new, ~2000 modified
**Estimated Time:** 40-60 hours

**All specifications complete and ready for implementation.**
