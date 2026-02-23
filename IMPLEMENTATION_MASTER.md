# SYSTEM SHIFT - MASTER IMPLEMENTATION SPECIFICATION
## Complete Technical Blueprint for Agentic AI Implementation

**Version:** 1.0.0  
**Date:** 2024  
**Completeness:** 100% - Zero ambiguity specification  
**Target:** Any agentic AI capable of file operations  
**Estimated Implementation Time:** 40-60 hours

---

## DOCUMENT STRUCTURE

This specification is broken into multiple parts due to size. Each part is complete and can be implemented independently, but they build on each other sequentially.

### Part 1: Event System (COMPLETE)
**File:** `IMPLEMENTATION_SPEC_PART1.md`  
**Contents:**
- 1.1 Event Pool Definition (20 events)
- 1.2 Event Resolver Logic
- 1.3 State Modifications for Events
- 1.4 Round Integration

**Files Created:** 2  
**Files Modified:** 2  
**Lines of Code:** ~800

### Part 2: Elite Actions (COMPLETE)
**File:** `IMPLEMENTATION_SPEC_PART2.md`  
**Contents:**
- 2.1 Elite Action Pool (18 actions)
- 2.2 Elite Action Selection Logic
- 2.3 Desperation Calculation
- 2.4 Action Execution

**Files Created:** 1  
**Files Modified:** 1  
**Lines of Code:** ~600

### Part 3: UI Integration (TO CREATE)
**Contents:**
- 3.1 Event Modal Component
- 3.2 Elite Action Notification
- 3.3 Main.js Integration
- 3.4 HTML Structure
- 3.5 CSS Styling

**Files Created:** 2  
**Files Modified:** 3  
**Lines of Code:** ~1000

### Part 4: Card Tags & Synergies (TO CREATE)
**Contents:**
- 4.1 Tag System Design
- 4.2 All 54 Cards Tagged
- 4.3 Synergy Definitions
- 4.4 Synergy Resolution Logic
- 4.5 Deck Modifications

**Files Created:** 1  
**Files Modified:** 2  
**Lines of Code:** ~400

### Part 5: Act Structure (TO CREATE)
**Contents:**
- 5.1 Act Definitions
- 5.2 Act Modifiers
- 5.3 Card Filtering by Act
- 5.4 Act Transition Logic
- 5.5 UI Display

**Files Created:** 1  
**Files Modified:** 3  
**Lines of Code:** ~300

### Part 6: Archetypes (TO CREATE)
**Contents:**
- 6.1 Four Archetype Definitions
- 6.2 Starting Deck Modifications
- 6.3 Archetype Abilities
- 6.4 Selection UI
- 6.5 Ability Implementation

**Files Created:** 2  
**Files Modified:** 2  
**Lines of Code:** ~600

### Part 7: Deck Evolution (TO CREATE)
**Contents:**
- 7.1 Add/Remove Card Functions
- 7.2 Tag-Based Modifications
- 7.3 10 New Cards with Deck Effects
- 7.4 Integration with Events

**Files Created:** 0  
**Files Modified:** 2  
**Lines of Code:** ~300

### Part 8: Hidden Information (TO CREATE)
**Contents:**
- 8.1 Hidden Track System
- 8.2 Scouting Cards
- 8.3 Random Effect Cards
- 8.4 Information Reveal UI

**Files Created:** 2  
**Files Modified:** 3  
**Lines of Code:** ~500

### Part 9: Memory System (TO CREATE)
**Contents:**
- 9.1 Historical Tracking
- 9.2 Memory Checks
- 9.3 Consequence System
- 9.4 Narrative Generation

**Files Created:** 1  
**Files Modified:** 2  
**Lines of Code:** ~400

### Part 10: Thresholds (TO CREATE)
**Contents:**
- 10.1 Eight Threshold Definitions
- 10.2 Threshold Checking
- 10.3 Persistent Effects
- 10.4 New Ending Paths

**Files Created:** 1  
**Files Modified:** 2  
**Lines of Code:** ~400

### Part 11: Testing & Balance (TO CREATE)
**Contents:**
- 11.1 Updated Simulation
- 11.2 Test Suite
- 11.3 Balance Verification
- 11.4 Bug Fixes

**Files Created:** 1  
**Files Modified:** 1  
**Lines of Code:** ~500

---

## IMPLEMENTATION ORDER

**CRITICAL:** Implement in this exact order. Each phase depends on previous phases.

### Phase 1: Core Dynamics (Week 1)
1. ✅ Part 1: Event System
2. ✅ Part 2: Elite Actions  
3. ⬜ Part 3: UI Integration
4. ⬜ Part 4: Card Tags & Synergies

**Deliverable:** Events and elite actions functional in game

### Phase 2: Strategic Layer (Week 2)
5. ⬜ Part 5: Act Structure
6. ⬜ Part 6: Archetypes
7. ⬜ Part 7: Deck Evolution

**Deliverable:** Multiple viable strategies, replayability

### Phase 3: Emergence (Week 3)
8. ⬜ Part 8: Hidden Information
9. ⬜ Part 9: Memory System
10. ⬜ Part 10: Thresholds

**Deliverable:** Emergent narratives, nonlinear dynamics

### Phase 4: Polish (Week 4)
11. ⬜ Part 11: Testing & Balance

**Deliverable:** Balanced, bug-free game

---

## VERIFICATION CHECKLIST

After implementing each part, verify:

### Part 1 Verification
- [ ] `game/events.js` exists with 20 events
- [ ] `game/eventResolver.js` exists
- [ ] `gameState.events` object exists
- [ ] Events trigger based on conditions
- [ ] Event choices apply effects correctly
- [ ] One-time events only trigger once
- [ ] Repeatable events can trigger multiple times

### Part 2 Verification
- [ ] `game/eliteActions.js` exists with 18 actions
- [ ] `gameState.elite` object exists
- [ ] Elite actions execute 60-80% of rounds
- [ ] Desperation calculation works
- [ ] Weighted selection works
- [ ] Effects apply correctly
- [ ] Suppression level tracks

### Part 3 Verification
- [ ] Event modal displays when event triggers
- [ ] Choice buttons work
- [ ] Elite action notification displays
- [ ] Animations smooth
- [ ] Mobile responsive

### Part 4 Verification
- [ ] All 54 cards have tags
- [ ] Synergies trigger correctly
- [ ] Tag tracking works
- [ ] Synergy notifications display

### Part 5 Verification
- [ ] Act transitions at correct rounds
- [ ] Act modifiers apply
- [ ] Card filtering works
- [ ] Act UI displays

### Part 6 Verification
- [ ] Four archetypes selectable
- [ ] Starting decks modify correctly
- [ ] Abilities function
- [ ] Selection UI works

### Part 7 Verification
- [ ] Cards add to deck
- [ ] Cards remove from deck
- [ ] Tag-based modifications work
- [ ] Deck size changes correctly

### Part 8 Verification
- [ ] Hidden tracks exist
- [ ] Scouting reveals information
- [ ] Random effects vary
- [ ] UI shows revealed info

### Part 9 Verification
- [ ] Memory tracks actions
- [ ] Consequences trigger
- [ ] Narrative coherent
- [ ] Flags persist

### Part 10 Verification
- [ ] Thresholds trigger at correct values
- [ ] Effects persist
- [ ] New endings accessible
- [ ] UI notifications work

### Part 11 Verification
- [ ] All 7 endings occur 5-20%
- [ ] No dominant strategy
- [ ] No game-breaking bugs
- [ ] Performance acceptable

---

## FILE STRUCTURE OVERVIEW

```
system-shift/
├── game/
│   ├── state.js                 [MODIFY - Add event/elite state]
│   ├── round.js                 [MODIFY - Integrate systems]
│   ├── deck.js                  [MODIFY - Add tags, new cards]
│   ├── outcomeEngine.js         [MODIFY - New endings]
│   ├── effectResolver.js        [NO CHANGE]
│   ├── audioManager.js          [NO CHANGE]
│   ├── logger.js                [NO CHANGE]
│   ├── rng.js                   [NO CHANGE]
│   │
│   ├── events.js                [CREATE - Event definitions]
│   ├── eventResolver.js         [CREATE - Event logic]
│   ├── eliteActions.js          [CREATE - Elite actions]
│   ├── acts.js                  [CREATE - Act structure]
│   ├── archetypes.js            [CREATE - Starting conditions]
│   ├── memory.js                [CREATE - Historical tracking]
│   ├── thresholds.js            [CREATE - Nonlinear effects]
│   ├── hiddenTracks.js          [CREATE - Hidden information]
│   └── scouting.js              [CREATE - Info reveal]
│
├── ui/
│   ├── eventModal.js            [CREATE - Event UI]
│   ├── eliteNotification.js    [CREATE - Elite action UI]
│   ├── archetypeSelect.js      [CREATE - Archetype selection]
│   └── notifications.js         [CREATE - System notifications]
│
├── main.js                      [MODIFY - Integrate UI]
├── index.html                   [MODIFY - Add UI elements]
├── style.css                    [MODIFY - Style new components]
│
└── IMPLEMENTATION_SPEC_*.md     [REFERENCE - This document]
```

---

## CODING STANDARDS

All code must follow these standards:

### JavaScript Style
```javascript
// Use ES6 modules
import { thing } from "./file.js";

// Use const/let, never var
const immutable = 5;
let mutable = 10;

// Use arrow functions for callbacks
array.map(item => item.value);

// Use template literals
const message = `Value is ${value}`;

// Use destructuring
const { care, climate } = gameState.tracks;

// Use optional chaining
const value = gameState?.tracks?.care ?? 0;

// Comment sections clearly
/* ================================================= */
/* SECTION NAME                                     */
/* ================================================= */
```

### Naming Conventions
- **Files:** camelCase.js (eventResolver.js)
- **Functions:** camelCase (checkEvents)
- **Variables:** camelCase (eliteAction)
- **Constants:** UPPER_SNAKE_CASE (MAX_ROUNDS)
- **Classes:** PascalCase (EventModal)
- **IDs:** lowercase_underscore (economic_crisis)

### Error Handling
```javascript
// Always validate inputs
if (!card) {
    console.error("Invalid card");
    return;
}

// Use try-catch for async
try {
    await someAsyncFunction();
} catch (error) {
    console.error("Error:", error);
}

// Log important events
log("EVENT_TRIGGERED", { id, round });
```

### Documentation
```javascript
/**
 * Function description
 * @param {type} paramName - Description
 * @returns {type} - Description
 */
function myFunction(paramName) {
    // Implementation
}
```

---

## TESTING PROTOCOL

After each part implementation:

### 1. Unit Test
```javascript
// Test individual functions
console.log("Testing checkEvents...");
const event = checkEvents();
console.assert(event !== undefined, "Event should exist");
```

### 2. Integration Test
```javascript
// Test system integration
console.log("Testing event + elite flow...");
// Play through one round
// Verify event triggers
// Verify elite acts
```

### 3. Simulation Test
```javascript
// Run automated games
node simulate.js
// Verify outcome distribution
// Verify no crashes
```

### 4. Manual Playtest
- Play 5 complete games
- Try different strategies
- Verify UI works
- Check for bugs

---

## COMMON PITFALLS TO AVOID

### 1. State Mutation
❌ **WRONG:**
```javascript
gameState.tracks.care = 10; // Direct mutation
```

✅ **CORRECT:**
```javascript
gameState.tracks.care += value; // Incremental change
gameState.tracks.care = Math.max(0, Math.min(20, gameState.tracks.care)); // Constrain
```

### 2. Missing Null Checks
❌ **WRONG:**
```javascript
const card = gameState.playerHand[index];
applyEffects(card.effects); // Crash if card undefined
```

✅ **CORRECT:**
```javascript
const card = gameState.playerHand[index];
if (!card) return;
applyEffects(card.effects);
```

### 3. Async/Await Errors
❌ **WRONG:**
```javascript
async function doThing() {
    delay(100); // Doesn't wait
}
```

✅ **CORRECT:**
```javascript
async function doThing() {
    await delay(100); // Waits
}
```

### 4. Event Listener Leaks
❌ **WRONG:**
```javascript
button.addEventListener("click", handler); // Every render
```

✅ **CORRECT:**
```javascript
button.removeEventListener("click", handler);
button.addEventListener("click", handler);
```

### 5. Infinite Loops
❌ **WRONG:**
```javascript
while (condition) {
    // No way to exit
}
```

✅ **CORRECT:**
```javascript
let iterations = 0;
while (condition && iterations < 100) {
    iterations++;
}
```

---

## PERFORMANCE TARGETS

- **Load Time:** < 2 seconds
- **Frame Rate:** 60 FPS
- **Memory:** < 100 MB
- **Game Duration:** 15-25 minutes
- **Save/Load:** < 1 second

---

## NEXT STEPS FOR AI AGENT

1. **Read Part 1** (`IMPLEMENTATION_SPEC_PART1.md`)
2. **Implement Part 1** (Event System)
3. **Verify Part 1** (Run checklist)
4. **Read Part 2** (`IMPLEMENTATION_SPEC_PART2.md`)
5. **Implement Part 2** (Elite Actions)
6. **Verify Part 2** (Run checklist)
7. **Request Part 3** (UI Integration)
8. **Continue sequentially**

---

## SUPPORT & CLARIFICATION

If any specification is ambiguous:
1. Check related parts for context
2. Refer to existing code patterns
3. Follow coding standards
4. Ask for clarification with specific line reference

---

## SUCCESS CRITERIA

Implementation is complete when:
- ✅ All 11 parts implemented
- ✅ All verification checklists pass
- ✅ 50+ manual playtests successful
- ✅ All 7 endings occur 5-20%
- ✅ No game-breaking bugs
- ✅ Performance targets met

**Estimated Total:** 5000+ lines of new code, 2000+ lines modified

---

**END OF MASTER SPECIFICATION**

Proceed to Part 1 for detailed implementation instructions.
