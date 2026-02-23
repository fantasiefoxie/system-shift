# SYSTEM SHIFT - STRUCTURAL ACTION PLAN
## From Simulation to Living Political Game

**Vision Integration:** Combining original design intent (political education through play) with game design depth (meaningful choices, emergence, drama)

---

## PHASE 0: FOUNDATION AUDIT (Current State)

### ✅ What Works
- **Solid Core Loop**: Card play → track changes → round resolution
- **Clear Theming**: Political transformation is legible
- **Technical Foundation**: Modular architecture, deterministic simulation
- **Audio/Visual Feedback**: Polished presentation layer
- **Balance Infrastructure**: Automated testing pipeline

### ❌ What's Missing
- **Player Agency**: No meaningful strategic choices
- **Narrative Emergence**: Static effects, no story
- **Dynamic Opposition**: Passive resistance only
- **Replayability**: Every game plays identically
- **Emotional Engagement**: Feels like spreadsheet optimization

---

## PHASE 1: CORE GAME LOOP TRANSFORMATION (Weeks 1-2)
**Goal:** Transform from puzzle to game with meaningful choices

### 1.1 Event System (Priority: CRITICAL)
**Why:** Creates dynamic content, uncertainty, and narrative emergence

**Implementation:**
```javascript
// game/events.js
export const eventPool = [
  {
    id: "economic_crisis",
    trigger: { round: 5, capital: { max: 10 } },
    title: "Economic Crisis",
    description: "Capital flight threatens stability.",
    choices: [
      { text: "Austerity", effects: { care: -3, strain: -2, capital: 2 } },
      { text: "Nationalize", effects: { capital: -2, authority: 2, strain: 3 } },
      { text: "Debt", effects: { leverage: -2, strain: 1 }, addCard: "debt_burden" }
    ]
  },
  {
    id: "climate_disaster",
    trigger: { round: 7, climate: { max: 8 } },
    title: "Climate Disaster",
    description: "Floods devastate region.",
    effects: { care: -2, strain: 3, climate: -1 },
    choices: [
      { text: "Emergency Relief", effects: { care: 2, capital: -2 } },
      { text: "Ignore", effects: { solidarity: -2, strain: 2 } }
    ]
  },
  {
    id: "general_strike",
    trigger: { solidarity: { min: 15 }, strain: { min: 12 } },
    title: "Wildcat Strike Erupts",
    description: "Workers walk out demanding change.",
    choices: [
      { text: "Support", effects: { solidarity: 3, authority: -2, surge: 2 } },
      { text: "Negotiate", effects: { care: 2, leverage: -1 } },
      { text: "Suppress", effects: { authority: 2, solidarity: -3, strain: -2 } }
    ]
  }
];

// Add to state.js
gameState.events = {
  triggered: [],
  pending: null
};

// Add to round.js - check events each round
function checkEvents() {
  for (let event of eventPool) {
    if (gameState.events.triggered.includes(event.id)) continue;
    if (evaluateTrigger(event.trigger)) {
      gameState.events.pending = event;
      gameState.events.triggered.push(event.id);
      return true;
    }
  }
  return false;
}
```

**Files to Create:**
- `game/events.js` - Event definitions and trigger logic
- `game/eventResolver.js` - Event choice handling

**Files to Modify:**
- `game/state.js` - Add event tracking
- `game/round.js` - Check events at round start
- `main.js` - Render event modal

**Testing:** 20 events covering all game states

---

### 1.2 Elite Opposition System (Priority: CRITICAL)
**Why:** Creates sense of struggle, forces adaptation

**Implementation:**
```javascript
// game/eliteActions.js
export const eliteActionPool = [
  {
    id: "austerity",
    condition: { capital: { max: 12 }, care: { min: 12 } },
    name: "Austerity Package",
    effects: { care: -2, capital: 2, strain: 2 }
  },
  {
    id: "media_campaign",
    condition: { solidarity: { min: 12 } },
    name: "Media Smear Campaign",
    effects: { solidarity: -2, leverage: -1 }
  },
  {
    id: "capital_strike",
    condition: { capital: { max: 8 } },
    name: "Investment Freeze",
    effects: { leverage: -2, strain: 2 }
  },
  {
    id: "repression",
    condition: { strain: { min: 15 }, authority: { min: 8 } },
    name: "Crackdown",
    effects: { solidarity: -2, authority: 1, strain: -1 }
  }
];

// Add to round.js - elite acts at end of round
function eliteAction() {
  const viable = eliteActionPool.filter(a => evaluateCondition(a.condition));
  if (viable.length === 0) return null;
  
  const action = viable[Math.floor(Math.random() * viable.length)];
  applyEffects(action.effects);
  log("ELITE_ACTION", action);
  return action;
}
```

**Files to Create:**
- `game/eliteActions.js` - Opposition card pool

**Files to Modify:**
- `game/round.js` - Execute elite action each round
- `main.js` - Display elite action notification

**Testing:** Elite should act 60-80% of rounds

---

### 1.3 Card Tags & Synergies (Priority: HIGH)
**Why:** Creates build diversity, rewards strategic coherence

**Implementation:**
```javascript
// Add to deck.js - tag all cards
{ 
  id: 101, 
  suit: "care", 
  title: "Public Clinic",
  tags: ["reform", "healthcare", "incremental"],
  effects: { care: 2 }, 
  cost: 1 
},
{
  id: 303,
  suit: "solidarity",
  title: "General Strike",
  tags: ["radical", "labor", "disruptive"],
  effects: { solidarity: 4, strain: 3, surge: 2 },
  cost: 3,
  synergy: {
    if_played_this_round: ["labor"],
    bonus: { surge: 1, solidarity: 1 }
  }
}

// Add to round.js - track tags played this round
gameState.tagsPlayedThisRound = [];

function playCard(index) {
  const card = gameState.playerHand[index];
  
  // Check synergies
  if (card.synergy) {
    const hasTag = card.synergy.if_played_this_round.some(
      tag => gameState.tagsPlayedThisRound.includes(tag)
    );
    if (hasTag) {
      applyEffects(card.synergy.bonus);
      log("SYNERGY_TRIGGERED", card.synergy);
    }
  }
  
  // Track tags
  if (card.tags) {
    gameState.tagsPlayedThisRound.push(...card.tags);
  }
  
  // ... rest of playCard
}
```

**Tag Categories:**
- **Strategy:** reform, radical, incremental, disruptive
- **Sector:** labor, climate, healthcare, housing
- **Method:** legislative, grassroots, institutional

**Files to Modify:**
- `game/deck.js` - Add tags to all 54 cards
- `game/round.js` - Track tags, check synergies
- `main.js` - Display synergy notifications

**Testing:** 15+ cards with synergies

---

### 1.4 Act Structure (Priority: HIGH)
**Why:** Creates pacing, escalation, dramatic arc

**Implementation:**
```javascript
// game/acts.js
export const acts = {
  1: {
    name: "Building Movement",
    rounds: [1, 2, 3],
    description: "Organize and build capacity",
    modifiers: {
      strainMultiplier: 0.75, // Easier early game
      leverageBonus: 1
    },
    availableCards: ["reform", "incremental"] // Only these tags
  },
  2: {
    name: "Confrontation",
    rounds: [4, 5, 6, 7],
    description: "Face elite resistance",
    modifiers: {
      strainMultiplier: 1.25,
      eliteActionChance: 0.9
    },
    crisisRound: 5, // Forced choice event
    availableCards: "all"
  },
  3: {
    name: "Resolution",
    rounds: [8, 9, 10],
    description: "Push for transformation",
    modifiers: {
      strainMultiplier: 1.5,
      surgeBonus: 2
    },
    availableCards: ["radical", "disruptive"],
    finalPush: true // Round 10 special rules
  }
};

// Add to state.js
gameState.currentAct = 1;

// Add to round.js
function getCurrentAct() {
  for (let [act, data] of Object.entries(acts)) {
    if (data.rounds.includes(gameState.round)) {
      return { act: parseInt(act), ...data };
    }
  }
}
```

**Files to Create:**
- `game/acts.js` - Act definitions and modifiers

**Files to Modify:**
- `game/state.js` - Track current act
- `game/round.js` - Apply act modifiers
- `game/deck.js` - Filter cards by act
- `main.js` - Display act transitions

**Testing:** Each act should feel distinct

---

## PHASE 2: STRATEGIC DEPTH (Weeks 3-4)
**Goal:** Multiple viable paths to victory

### 2.1 Starting Archetypes (Priority: HIGH)
**Why:** Immediate player expression, replayability

**Implementation:**
```javascript
// game/archetypes.js
export const archetypes = {
  labor_union: {
    name: "Labor Union",
    description: "Worker power through solidarity",
    startingTracks: {
      care: 8, climate: 8, solidarity: 10, 
      authority: 10, capital: 20, strain: 8
    },
    startingDeck: {
      add: ["labor_rights", "union_expansion", "strike_fund"],
      remove: ["tree_cover", "plastic_ban"]
    },
    ability: "Solidarity cards cost -1 leverage"
  },
  green_party: {
    name: "Green Movement",
    description: "Ecological transformation",
    startingTracks: {
      care: 8, climate: 12, solidarity: 6,
      authority: 10, capital: 20, strain: 10
    },
    startingDeck: {
      add: ["fossil_exit", "renewable_grid", "rewilding"],
      remove: ["local_assembly", "public_forum"]
    },
    ability: "Climate cards give +1 care"
  },
  reformist: {
    name: "Progressive Coalition",
    description: "Incremental institutional change",
    startingTracks: {
      care: 10, climate: 8, solidarity: 6,
      authority: 12, capital: 18, strain: 6
    },
    startingDeck: {
      add: ["transparency_act", "electoral_reform"],
      remove: ["general_strike", "capital_controls"]
    },
    ability: "Reform-tagged cards reduce strain by 1"
  },
  revolutionary: {
    name: "Revolutionary Movement",
    description: "Rapid systemic transformation",
    startingTracks: {
      care: 6, climate: 8, solidarity: 8,
      authority: 8, capital: 22, strain: 12
    },
    startingDeck: {
      add: ["general_strike", "nationalize", "dual_power"],
      remove: ["civic_oversight", "transparency_act"]
    },
    ability: "Radical-tagged cards give +1 surge"
  }
};
```

**Files to Create:**
- `game/archetypes.js` - Archetype definitions
- `game/archetypeSelector.js` - Selection UI logic

**Files to Modify:**
- `main.js` - Add archetype selection screen
- `game/state.js` - Store selected archetype
- `game/deck.js` - Modify starting deck
- `index.html` - Archetype selection UI

**Testing:** Each archetype should enable unique strategies

---

### 2.2 Deck Evolution (Priority: MEDIUM)
**Why:** Permanent consequences, strategic commitment

**Implementation:**
```javascript
// Add to deck.js
export function addCardToDeck(cardId) {
  const card = baseDeck.find(c => c.id === cardId);
  if (card) {
    gameState.deck.push({ ...card });
    log("CARD_ADDED_TO_DECK", { cardId });
  }
}

export function removeCardFromDeck(cardId) {
  const index = gameState.deck.findIndex(c => c.id === cardId);
  if (index !== -1) {
    gameState.deck.splice(index, 1);
    log("CARD_REMOVED_FROM_DECK", { cardId });
  }
}

// Add cards with deck modification effects
{
  id: 601,
  title: "Nationalize Industry",
  effects: { capital: -5, authority: 3, strain: 4 },
  cost: 4,
  onPlay: {
    removeTags: ["capital"], // Remove all capital-boosting cards
    addCard: "state_enterprise"
  }
},
{
  id: 602,
  title: "Movement Split",
  effects: { solidarity: 3, strain: 3 },
  cost: 2,
  onPlay: {
    duplicateTag: "solidarity", // Add copy of random solidarity card
    addCard: "internal_conflict"
  }
}
```

**Files to Modify:**
- `game/deck.js` - Add/remove card functions
- `game/round.js` - Execute onPlay effects
- Add 10 new cards with deck modification

**Testing:** Deck should evolve meaningfully over game

---

### 2.3 Hidden Information & Scouting (Priority: MEDIUM)
**Why:** Creates uncertainty, rewards information gathering

**Implementation:**
```javascript
// Add to state.js
gameState.hiddenTracks = {
  eliteCohesion: 10, // Affects pushback multiplier
  movementMorale: 10, // Affects surge effectiveness
  internationalPressure: 5 // Random events
};

// Add scouting cards
{
  id: 701,
  title: "Investigative Journalism",
  effects: { authority: -1 },
  cost: 2,
  onPlay: {
    reveal: "next_3_cards" // Show next 3 cards in deck
  }
},
{
  id: 702,
  title: "Intelligence Network",
  effects: { solidarity: 1 },
  cost: 2,
  onPlay: {
    reveal: "hidden_tracks" // Show all hidden values
  }
},
{
  id: 703,
  title: "Polling Data",
  effects: {},
  cost: 1,
  onPlay: {
    reveal: "next_elite_action" // Preview opposition
  }
}

// Add uncertainty to some cards
{
  id: 704,
  title: "Wildcat Strike",
  effects: { solidarity: "2-5" }, // Random based on hidden morale
  cost: 2
}
```

**Files to Create:**
- `game/hiddenTracks.js` - Hidden state management
- `game/scouting.js` - Information reveal logic

**Files to Modify:**
- `game/state.js` - Add hidden tracks
- `game/deck.js` - Add scouting cards
- `main.js` - Display revealed information

**Testing:** Hidden info should create meaningful uncertainty

---

## PHASE 3: NARRATIVE & EMERGENCE (Weeks 5-6)
**Goal:** Games tell unique stories

### 3.1 Historical Memory System (Priority: MEDIUM)
**Why:** Actions have consequences, creates narrative coherence

**Implementation:**
```javascript
// game/memory.js
export const memorySystem = {
  track: {
    brokenPromises: 0, // Reduced care after boosting it
    consistentVision: 0, // Focused on one strategy
    radicalShift: 0, // Changed strategy mid-game
    eliteCompromise: 0 // Boosted authority/capital
  },
  
  checkMemory() {
    // Broken promise: care dropped after being high
    if (gameState.tracks.care < gameState.memory.maxCare - 3) {
      this.track.brokenPromises++;
      return {
        type: "broken_promise",
        effect: { solidarity: -2, strain: 2 },
        message: "The people remember your broken promises."
      };
    }
    
    // Consistent vision: played 5+ cards of same tag
    const tagCounts = {};
    gameState.memory.cardsPlayed.forEach(card => {
      card.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    if (Math.max(...Object.values(tagCounts)) >= 5) {
      this.track.consistentVision++;
      return {
        type: "consistent_vision",
        effect: { surge: 2, solidarity: 1 },
        message: "Your unwavering vision inspires the movement."
      };
    }
  }
};

// Add to state.js
gameState.memory = {
  maxCare: 8,
  maxClimate: 8,
  cardsPlayed: [],
  eventsChosen: []
};
```

**Files to Create:**
- `game/memory.js` - Memory tracking and effects

**Files to Modify:**
- `game/state.js` - Add memory tracking
- `game/round.js` - Check memory each round
- `main.js` - Display memory notifications

**Testing:** Memory should create emergent narrative

---

### 3.2 Feedback Loops & Thresholds (Priority: HIGH)
**Why:** Nonlinear dynamics create emergence

**Implementation:**
```javascript
// game/thresholds.js
export const thresholds = [
  {
    name: "Mass Movement",
    condition: { solidarity: { min: 15 } },
    effect: "All solidarity cards +1 effect",
    persistent: true
  },
  {
    name: "Legitimacy Crisis",
    condition: { authority: { max: 3 } },
    effect: "Unlock radical cards, elite actions more desperate",
    persistent: true
  },
  {
    name: "Climate Emergency",
    condition: { climate: { max: 5 }, round: { min: 6 } },
    effect: "Trigger climate disaster event, +2 strain per round",
    persistent: true
  },
  {
    name: "Dual Power",
    condition: { solidarity: { min: 18 }, authority: { max: 5 } },
    effect: "Parallel institutions emerge, new ending path unlocked",
    persistent: true
  },
  {
    name: "Fascist Threat",
    condition: { strain: { min: 16 }, capital: { min: 15 }, authority: { min: 12 } },
    effect: "Elite consolidation, authoritarian ending likely",
    persistent: true
  }
];

// Add to round.js
function checkThresholds() {
  thresholds.forEach(threshold => {
    if (gameState.activeThresholds.includes(threshold.name)) return;
    if (evaluateCondition(threshold.condition)) {
      gameState.activeThresholds.push(threshold.name);
      applyThresholdEffect(threshold);
      log("THRESHOLD_CROSSED", threshold);
    }
  });
}
```

**Files to Create:**
- `game/thresholds.js` - Threshold definitions

**Files to Modify:**
- `game/state.js` - Track active thresholds
- `game/round.js` - Check thresholds each round
- `game/outcomeEngine.js` - Add new ending paths
- `main.js` - Display threshold notifications

**Testing:** Thresholds should create phase transitions

---

### 3.3 Faction System (Priority: LOW)
**Why:** Internal contradictions create strategic tension

**Implementation:**
```javascript
// game/factions.js
export const factions = {
  labor: {
    name: "Labor Unions",
    loyalty: 10,
    demands: { care: 12, solidarity: 10 },
    conflicts: ["climate"], // Tension with climate faction
    bonus: { solidarity: 1 } // When loyal
  },
  climate: {
    name: "Climate Activists",
    loyalty: 10,
    demands: { climate: 15, care: 8 },
    conflicts: ["labor"],
    bonus: { climate: 1 }
  },
  grassroots: {
    name: "Community Organizers",
    loyalty: 10,
    demands: { solidarity: 12, authority: { max: 8 } },
    conflicts: ["technocrats"],
    bonus: { surge: 1 }
  },
  technocrats: {
    name: "Progressive Technocrats",
    loyalty: 10,
    demands: { care: 10, authority: 8 },
    conflicts: ["grassroots"],
    bonus: { leverage: 1 }
  }
};

// Faction loyalty changes based on actions
function updateFactionLoyalty() {
  Object.values(factions).forEach(faction => {
    let change = 0;
    
    // Check if demands met
    Object.entries(faction.demands).forEach(([track, value]) => {
      if (typeof value === 'number') {
        if (gameState.tracks[track] >= value) change += 1;
        else change -= 1;
      }
    });
    
    // Check conflicts
    faction.conflicts.forEach(conflictFaction => {
      if (factions[conflictFaction].loyalty > faction.loyalty + 3) {
        change -= 1;
      }
    });
    
    faction.loyalty = Math.max(0, Math.min(20, faction.loyalty + change));
  });
}
```

**Files to Create:**
- `game/factions.js` - Faction system

**Files to Modify:**
- `game/state.js` - Track faction loyalty
- `game/round.js` - Update factions each round
- `main.js` - Display faction status

**Testing:** Factions should create meaningful tradeoffs

---

## PHASE 4: POLISH & BALANCE (Week 7)
**Goal:** Refinement and playtesting

### 4.1 Comprehensive Playtesting
- 50+ human playtests
- Track which strategies emerge
- Identify dominant strategies
- Find broken combinations

### 4.2 Balance Pass
- Adjust card costs based on actual play
- Tune event frequencies
- Balance archetype power levels
- Ensure all 7 endings achievable

### 4.3 Tutorial & Onboarding
- Interactive tutorial explaining mechanics
- Tooltips for all systems
- Difficulty modes (easy/normal/hard)

### 4.4 Meta-Progression (Optional)
- Unlock new cards between runs
- Unlock new archetypes
- Achievement system
- Statistics tracking

---

## IMPLEMENTATION ROADMAP

### Week 1: Core Dynamics
- [ ] Event system (20 events)
- [ ] Elite actions (10 actions)
- [ ] Event UI modal
- [ ] Elite action notifications

### Week 2: Strategic Layer
- [ ] Card tags (all 54 cards)
- [ ] Synergy system
- [ ] Act structure
- [ ] Act transition screens

### Week 3: Player Expression
- [ ] 4 starting archetypes
- [ ] Archetype selection UI
- [ ] Archetype abilities
- [ ] Deck evolution (10 cards)

### Week 4: Information & Uncertainty
- [ ] Hidden tracks
- [ ] Scouting cards (5 cards)
- [ ] Random effect cards (5 cards)
- [ ] Information reveal UI

### Week 5: Emergence
- [ ] Memory system
- [ ] Threshold system (8 thresholds)
- [ ] New ending paths
- [ ] Threshold notifications

### Week 6: Narrative Depth
- [ ] Faction system (optional)
- [ ] More events (30 total)
- [ ] More elite actions (20 total)
- [ ] Narrative polish

### Week 7: Polish
- [ ] 50+ playtests
- [ ] Balance adjustments
- [ ] Tutorial
- [ ] Bug fixes

---

## SUCCESS METRICS

### Gameplay Metrics
- **Strategic Diversity**: 4+ viable archetypes with 40%+ win rate each
- **Ending Distribution**: All 7 endings occur in 5-20% of games
- **Replayability**: Players want to play 10+ times
- **Decision Depth**: Players report "hard choices" in 80%+ of games

### Engagement Metrics
- **Session Length**: 15-25 minutes per game
- **Completion Rate**: 80%+ of started games finished
- **Emotional Response**: Players report tension, excitement, triumph/despair

### Educational Metrics
- **Understanding**: Players can explain systemic dynamics
- **Reflection**: Players discuss political implications
- **Retention**: Players remember key concepts after playing

---

## TECHNICAL ARCHITECTURE

### New Files to Create
```
game/
  events.js           - Event definitions
  eventResolver.js    - Event choice handling
  eliteActions.js     - Opposition actions
  acts.js             - Act structure
  archetypes.js       - Starting conditions
  archetypeSelector.js - Selection logic
  memory.js           - Historical tracking
  thresholds.js       - Nonlinear effects
  factions.js         - Faction system (optional)
  hiddenTracks.js     - Hidden information
  scouting.js         - Information reveal
  
ui/
  eventModal.js       - Event choice UI
  archetypeSelect.js  - Archetype selection
  notifications.js    - System notifications
  factionPanel.js     - Faction status display
```

### Files to Modify
```
game/
  state.js            - Add new state tracking
  round.js            - Integrate new systems
  deck.js             - Add tags, new cards
  outcomeEngine.js    - New ending paths
  
main.js               - Integrate UI components
index.html            - New UI elements
style.css             - New component styles
```

---

## RISK MITIGATION

### Technical Risks
- **Complexity Creep**: Implement incrementally, test each system
- **Performance**: Profile after each phase
- **Save/Load**: Implement early for playtesting

### Design Risks
- **Over-Complexity**: Playtest with non-gamers
- **Analysis Paralysis**: Add time pressure or turn limits
- **Dominant Strategy**: Continuous balance iteration

### Scope Risks
- **Feature Bloat**: Phase 3 (factions) is optional
- **Timeline Slip**: Each phase can ship independently
- **Burnout**: Take breaks, celebrate milestones

---

## CONCLUSION

This plan transforms System Shift from an accurate simulation into a compelling game that:

1. **Teaches** political economy through play
2. **Engages** through meaningful choices and uncertainty
3. **Emerges** unique stories from systemic interactions
4. **Rewards** strategic thinking and adaptation
5. **Inspires** reflection on real-world transformation

**The vision:** A game where players don't just learn ABOUT systemic change—they EXPERIENCE the tension, hope, fear, and triumph of building a movement for transformation.

**Next Step:** Begin Phase 1, Week 1 - Event System implementation.
