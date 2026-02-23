# SYSTEM SHIFT - COMPLETE IMPLEMENTATION GUIDE
## Master Document for Agentic AI Implementation

**Version:** 1.0.0  
**Status:** COMPLETE SPECIFICATION  
**Total Parts:** 11  
**Estimated Time:** 40-60 hours  
**Difficulty:** Intermediate

---

## QUICK START

1. Read this master guide completely
2. Implement parts sequentially (1→11)
3. Verify each part before proceeding
4. Test after every 2-3 parts
5. Final integration test at end

---

## SPECIFICATION DOCUMENTS

### ✅ COMPLETED SPECIFICATIONS

**PART 1: Event System**
- File: `IMPLEMENTATION_SPEC_PART1.md`
- Creates: `game/events.js`, `game/eventResolver.js`
- Modifies: `game/state.js`, `game/round.js`
- Lines: ~800
- Time: 3-4 hours

**PART 2: Elite Actions**
- File: `IMPLEMENTATION_SPEC_PART2.md`
- Creates: `game/eliteActions.js`
- Modifies: `game/round.js`
- Lines: ~600
- Time: 2-3 hours

**PART 3: UI Integration**
- File: `SPEC_PART_03.md`
- Creates: `ui/eventModal.js`, `ui/eliteNotification.js`
- Modifies: `main.js`, `index.html`, `style.css`
- Lines: ~450
- Time: 3-4 hours

### 📋 REMAINING SPECIFICATIONS (To Be Created)

**PART 4: Card Tags & Synergies**
- All 54 cards tagged
- Synergy system
- Tag tracking
- Time: 4-5 hours

**PART 5: Act Structure**
- 3-act system
- Act modifiers
- Card filtering
- Time: 2-3 hours

**PART 6: Archetypes**
- 4 starting archetypes
- Deck modifications
- Abilities
- Time: 4-5 hours

**PART 7: Deck Evolution**
- Add/remove cards
- Tag modifications
- 10 new cards
- Time: 2-3 hours

**PART 8: Hidden Information**
- Hidden tracks
- Scouting cards
- Random effects
- Time: 3-4 hours

**PART 9: Memory System**
- Historical tracking
- Consequences
- Narrative
- Time: 3-4 hours

**PART 10: Thresholds**
- 8 thresholds
- Persistent effects
- New endings
- Time: 3-4 hours

**PART 11: Testing & Balance**
- Updated simulation
- Test suite
- Balance pass
- Time: 6-8 hours

---

## IMPLEMENTATION WORKFLOW

### Phase 1: Core Dynamics (Week 1)
```
Day 1-2: Part 1 (Events)
Day 2-3: Part 2 (Elite Actions)
Day 3-4: Part 3 (UI Integration)
Day 4-5: Part 4 (Tags & Synergies)
TEST: Play 5 games, verify events/elite/synergies work
```

### Phase 2: Strategic Layer (Week 2)
```
Day 6-7: Part 5 (Act Structure)
Day 7-8: Part 6 (Archetypes)
Day 8-9: Part 7 (Deck Evolution)
TEST: Play each archetype, verify acts work
```

### Phase 3: Emergence (Week 3)
```
Day 10-11: Part 8 (Hidden Information)
Day 11-12: Part 9 (Memory System)
Day 12-13: Part 10 (Thresholds)
TEST: Play 10 games, verify emergence
```

### Phase 4: Polish (Week 4)
```
Day 14-16: Part 11 (Testing & Balance)
Day 16-17: Bug fixes
Day 17-18: Final polish
Day 18-19: Documentation
Day 19-20: Release prep
```

---

## VERIFICATION PROTOCOL

### After Each Part

1. **Code Verification**
   - All files created
   - All modifications made
   - No syntax errors
   - Imports correct

2. **Functional Verification**
   - Feature works as specified
   - No console errors
   - No crashes
   - Expected behavior

3. **Integration Verification**
   - Works with existing code
   - No conflicts
   - State updates correctly
   - UI updates correctly

### Checkpoint Tests

**After Part 3:**
```javascript
// Test event system
// 1. Start game
// 2. Play until round 2
// 3. Verify event triggers
// 4. Make choice
// 5. Verify effects applied
// 6. Verify elite action at round end
```

**After Part 6:**
```javascript
// Test archetypes
// 1. Select each archetype
// 2. Verify starting deck different
// 3. Verify abilities work
// 4. Play to round 5
// 5. Verify act transitions
```

**After Part 10:**
```javascript
// Test full system
// 1. Play complete game
// 2. Verify all systems interact
// 3. Check for bugs
// 4. Verify ending reached
```

---

## FILE STRUCTURE REFERENCE

```
system-shift/
├── game/
│   ├── state.js              [MODIFY: Parts 1,2,6,8,9]
│   ├── round.js              [MODIFY: Parts 1,2,4,5,7,10]
│   ├── deck.js               [MODIFY: Parts 4,7]
│   ├── outcomeEngine.js      [MODIFY: Part 10]
│   ├── events.js             [CREATE: Part 1]
│   ├── eventResolver.js      [CREATE: Part 1]
│   ├── eliteActions.js       [CREATE: Part 2]
│   ├── acts.js               [CREATE: Part 5]
│   ├── archetypes.js         [CREATE: Part 6]
│   ├── memory.js             [CREATE: Part 9]
│   ├── thresholds.js         [CREATE: Part 10]
│   ├── hiddenTracks.js       [CREATE: Part 8]
│   └── scouting.js           [CREATE: Part 8]
│
├── ui/
│   ├── eventModal.js         [CREATE: Part 3]
│   ├── eliteNotification.js  [CREATE: Part 3]
│   ├── archetypeSelect.js    [CREATE: Part 6]
│   └── notifications.js      [CREATE: Part 9]
│
├── main.js                   [MODIFY: Parts 3,5,6,9]
├── index.html                [MODIFY: Parts 3,6]
├── style.css                 [MODIFY: Parts 3,6,9]
└── simulate.js               [MODIFY: Part 11]
```

---

## PROGRESS TRACKING

Use this checklist to track implementation:

### Part 1: Event System
- [ ] Created `game/events.js` with 20 events
- [ ] Created `game/eventResolver.js`
- [ ] Modified `game/state.js` (added events object)
- [ ] Modified `game/round.js` (added event checking)
- [ ] Tested: Events trigger correctly
- [ ] Tested: Choices apply effects
- [ ] Tested: One-time events work

### Part 2: Elite Actions
- [ ] Created `game/eliteActions.js` with 18 actions
- [ ] Modified `game/state.js` (added elite object)
- [ ] Modified `game/round.js` (added elite execution)
- [ ] Tested: Elite acts 60-80% of rounds
- [ ] Tested: Desperation calculation works
- [ ] Tested: Effects apply correctly

### Part 3: UI Integration
- [ ] Created `ui/eventModal.js`
- [ ] Created `ui/eliteNotification.js`
- [ ] Modified `main.js` (3 changes)
- [ ] Modified `index.html` (added container)
- [ ] Modified `style.css` (added styles)
- [ ] Tested: Event modal displays
- [ ] Tested: Elite notification shows
- [ ] Tested: Animations smooth

### Part 4: Card Tags & Synergies
- [ ] Modified `game/deck.js` (tagged all 54 cards)
- [ ] Added synergy definitions
- [ ] Modified `game/round.js` (synergy checking)
- [ ] Modified `main.js` (synergy notifications)
- [ ] Tested: Tags tracked correctly
- [ ] Tested: Synergies trigger
- [ ] Tested: Notifications display

### Part 5: Act Structure
- [ ] Created `game/acts.js`
- [ ] Modified `game/state.js` (act tracking)
- [ ] Modified `game/round.js` (act modifiers)
- [ ] Modified `game/deck.js` (card filtering)
- [ ] Modified `main.js` (act display)
- [ ] Tested: Acts transition correctly
- [ ] Tested: Modifiers apply

### Part 6: Archetypes
- [ ] Created `game/archetypes.js`
- [ ] Created `ui/archetypeSelect.js`
- [ ] Modified `main.js` (selection screen)
- [ ] Modified `index.html` (selection UI)
- [ ] Modified `style.css` (selection styles)
- [ ] Tested: All 4 archetypes work
- [ ] Tested: Abilities function

### Part 7: Deck Evolution
- [ ] Modified `game/deck.js` (add/remove functions)
- [ ] Added 10 new cards with deck effects
- [ ] Modified `game/round.js` (execute deck changes)
- [ ] Tested: Cards add to deck
- [ ] Tested: Cards remove from deck
- [ ] Tested: Tag modifications work

### Part 8: Hidden Information
- [ ] Created `game/hiddenTracks.js`
- [ ] Created `game/scouting.js`
- [ ] Modified `game/state.js` (hidden tracks)
- [ ] Added 5 scouting cards
- [ ] Modified `main.js` (reveal UI)
- [ ] Tested: Hidden tracks exist
- [ ] Tested: Scouting reveals info

### Part 9: Memory System
- [ ] Created `game/memory.js`
- [ ] Created `ui/notifications.js`
- [ ] Modified `game/state.js` (memory tracking)
- [ ] Modified `game/round.js` (memory checks)
- [ ] Modified `main.js` (memory notifications)
- [ ] Tested: Actions tracked
- [ ] Tested: Consequences trigger

### Part 10: Thresholds
- [ ] Created `game/thresholds.js`
- [ ] Modified `game/round.js` (threshold checking)
- [ ] Modified `game/outcomeEngine.js` (new endings)
- [ ] Modified `main.js` (threshold notifications)
- [ ] Tested: Thresholds trigger
- [ ] Tested: Effects persist

### Part 11: Testing & Balance
- [ ] Modified `simulate.js` (updated simulation)
- [ ] Created test suite
- [ ] Ran 500+ simulations
- [ ] Balanced card costs
- [ ] Fixed all bugs
- [ ] Tested: All 7 endings occur
- [ ] Tested: No dominant strategy

---

## COMMON ISSUES & SOLUTIONS

### Issue: Events not triggering
**Solution:** Check trigger conditions, verify gameState.events exists

### Issue: Elite actions not executing
**Solution:** Verify elite action pool imported, check desperation calculation

### Issue: Modal not displaying
**Solution:** Check CSS loaded, verify overlay z-index, check for JS errors

### Issue: Synergies not working
**Solution:** Verify tags array exists on cards, check tag tracking in round

### Issue: Acts not transitioning
**Solution:** Check round number, verify act definitions, check getCurrentAct function

### Issue: Archetypes not applying
**Solution:** Verify selection saved to state, check deck modification logic

### Issue: Memory not tracking
**Solution:** Check memory object exists, verify tracking in playCard function

### Issue: Thresholds not triggering
**Solution:** Verify condition evaluation, check threshold array, verify tracking

---

## FINAL INTEGRATION TEST

After completing all 11 parts:

```javascript
// Complete Integration Test
// 1. Start fresh game
// 2. Select archetype
// 3. Play through Act 1 (rounds 1-3)
//    - Verify events trigger
//    - Verify elite acts
//    - Verify synergies work
// 4. Play through Act 2 (rounds 4-7)
//    - Verify crisis events
//    - Verify memory consequences
//    - Verify thresholds cross
// 5. Play through Act 3 (rounds 8-10)
//    - Verify deck evolution
//    - Verify hidden info reveals
//    - Verify ending reached
// 6. Repeat with each archetype
// 7. Verify all 7 endings accessible
```

---

## SUCCESS CRITERIA

Implementation is complete when:

✅ All 11 parts implemented  
✅ All verification checklists pass  
✅ 50+ manual playtests successful  
✅ All 7 endings occur 5-20%  
✅ No game-breaking bugs  
✅ Performance targets met  
✅ Code follows standards  
✅ Documentation complete  

---

## NEXT STEPS

1. **Start with Part 1** - Read `IMPLEMENTATION_SPEC_PART1.md`
2. **Implement sequentially** - Don't skip parts
3. **Verify after each part** - Use checklists
4. **Test frequently** - Catch bugs early
5. **Document issues** - Track problems and solutions

---

**TOTAL ESTIMATED EFFORT:**
- Code: 5000+ lines new, 2000+ lines modified
- Time: 40-60 hours
- Complexity: Intermediate
- Dependencies: None (self-contained)

**BEGIN IMPLEMENTATION WITH PART 1**
