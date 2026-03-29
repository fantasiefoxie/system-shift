# System Shift — Production Readiness System

> Checklist + enforcement rules + compact prompt for maintaining stability, balance, and correctness in System Shift.
> Adapted from AGPRS. Single-player browser game, vanilla JS, zero dependencies.

---

## 1. Production Readiness Checklist

### 1.1 Gameplay Reality vs Dev Illusion
- [ ] Test with suboptimal play (random card selection, ignoring leverage costs)
- [ ] Simulate worst-case state (all tracks at extremes, strain at 20 by round 3)
- [ ] Verify all 8 endings are reachable via distinct strategies
- [ ] Run `node simulate.js` — all endings must hit their target distribution bands

### 1.2 Simulation Balance
- [ ] SOCIAL TRANSFORMATION: 15–25%
- [ ] ECOLOGICAL TRANSITION: 15–25%
- [ ] TURBULENT TRANSFORMATION: 10–20%
- [ ] MANAGED STABILITY: 10–20%
- [ ] SYSTEM DRIFT: 10–20%
- [ ] SYSTEM COLLAPSE: 5–15%
- [ ] AUTHORITARIAN CONSOLIDATION: 5–15%
- [ ] DUAL POWER TRANSITION: 5–15%
- [ ] No ending at 0% (unreachable) or >30% (dominant)
- [ ] Average final track values all within [0, 20]

### 1.3 Game Loop Integrity
- [ ] `simulate.js` outcome logic matches `game/outcomeEngine.js` exactly — no divergence
- [ ] `game/rng.js` seeded RNG used for all random decisions (no `Math.random()` in game logic)
- [ ] Same seed always produces same game outcome
- [ ] `effectResolver.js` delays are UI-only — game state never waits on `setTimeout`
- [ ] `delayedEffects` in `resourceManagement.js` resolve correctly on round boundaries

### 1.4 Track & State Integrity
- [ ] All 6 tracks clamped to [0, 20] everywhere they are modified:
  - `game/round.js` `applyEffects()`
  - `game/oppositionSystem.js` response cases
  - `game/thresholds.js` `applyThresholdEffect()`
  - `simulate.js` simulation loop
- [ ] `gameState.leverage` never goes below 0 or above `maxLeverage`
- [ ] `gameState.surge` never goes below 0
- [ ] `activeThresholds` array never contains duplicates
- [ ] `negotiation.usedThisAct` resets on every act transition

### 1.5 localStorage Integrity
Six keys used — all must be safe to be missing, corrupted, or from an old version:

| Key | Owner | Has try/catch |
|-----|-------|--------------|
| `systemshift_stats` | `main.js` | verify |
| `systemshift_unlocks` | `game/achievements.js` | ✅ |
| `systemshift_legacy` | `game/memory.js` | ✅ |
| `systemshift_played_cards` | `main.js` (Library) | verify |
| `systemShiftNarrative` | `game/narrative.js` | ⚠️ no catch |
| `systemShiftTutorial` | `game/tutorial.js` | ⚠️ no catch |

- [ ] Every `localStorage.getItem` / `JSON.parse` is wrapped in try/catch with a safe default
- [ ] Missing or `null` keys always return a valid default object (never crash on first run)
- [ ] Old schema keys (missing fields) handled via `|| default` fallbacks, not hard errors

### 1.6 Input & UX Responsiveness
- [ ] Cards disable immediately on click — no double-play possible
- [ ] Scout and Negotiate buttons disable when conditions not met (surge < 3, already used this act)
- [ ] Difficulty modal cannot be bypassed (fallback to Normal if modal missing)
- [ ] Restart flows through difficulty modal, not directly into `startGame()`
- [ ] Achievement toasts do not stack infinitely — cap at 3 visible at once

### 1.7 Visual & Audio Feedback
- [ ] Every card play produces visible track change within the same render cycle
- [ ] Opposition actions produce a notification before round ends
- [ ] Faction threat indicators update every round
- [ ] `screen-shake` class is always removed after 600ms (no stuck animation)
- [ ] Particle elements are always removed after burst animation (no DOM leak)
- [ ] Audio context resumes on first user interaction (browser autoplay policy)

### 1.8 Opposition AI Correctness
- [ ] Each faction only acts when `factionState.active === true`
- [ ] `calculateThreatLevels()` called before `processOppositionResponses()` each round
- [ ] Difficulty `oppositionIntensity` applied consistently in both threat and response chance
- [ ] `updateOppositionLearning()` does not produce runaway escalation (threat capped at 100)

### 1.9 New Systems Integration
- [ ] Thresholds fire at most once per game per ID (`activeThresholds` guards this)
- [ ] Scouted results expire correctly — `clearExpiredScouts()` called at round start
- [ ] Memory `checkMemory()` returns at most one consequence per round (early return on first match)
- [ ] Negotiation deducts surge before success/fail roll — cannot over-spend
- [ ] Legacy bonuses from `getLegacyBonuses()` applied to tracks before any round logic runs
- [ ] `saveLegacy()` called exactly once per game end

### 1.10 Browser & Device Compatibility
- [ ] Runs in Chrome, Firefox, and Safari without errors
- [ ] ES module imports work via `python -m http.server` (no file:// protocol)
- [ ] Web Audio API oscillators are cleaned up after use (no AudioContext node leak)
- [ ] Layout is usable at 768px width (mobile breakpoint active)
- [ ] Touch targets (cards, buttons) are at least 44px tall on mobile
- [ ] Modals scroll on small viewports (`overflow-y: auto`)

### 1.11 Error Handling
- [ ] No silent failures — every catch block logs to `console.warn` at minimum
- [ ] Game never enters a state where no cards are playable and round cannot end
- [ ] `evaluateOutcome()` always returns a valid ending (SYSTEM DRIFT as final fallback)
- [ ] `simulate.js` catches and reports per-game errors without halting the full run

### 1.12 Code Hygiene
- [ ] No `Math.random()` calls in `game/` (use seeded RNG from `game/rng.js`)
- [ ] No `setTimeout` / `delay()` calls in game logic files (only in `effectResolver.js` and UI)
- [ ] `simulate.js` outcome conditions kept in sync with `game/outcomeEngine.js` after any change
- [ ] No hardcoded track values — use named constants or comments marked `// Balance:`

---

## 2. Enforcement Rules

**GAME LOOP MUST:**
- Use seeded RNG for all random decisions
- Never branch on `setTimeout` results
- Produce identical output for identical seed + inputs

**TRACKS MUST:**
- Be clamped to [0, 20] at every write site, not just at read time

**LOCALSTORAGE MUST:**
- Default gracefully on missing, malformed, or legacy-schema data
- Never block game start if storage is unavailable (private browsing)

**OPPOSITION MUST:**
- Not reference `gameState.resources.momentum` — use `gameState.surge`
- Apply difficulty multipliers consistently across threat and response

**SIMULATION MUST:**
- Mirror `outcomeEngine.js` logic — divergence is a bug, not a feature
- Be re-run and checked after any balance change to any of:
  `outcomeEngine.js`, `round.js`, `thresholds.js`, `oppositionSystem.js`

**UI MUST:**
- Prevent double-submission on all interactive elements
- Remove all dynamically created DOM nodes (particles, toasts) after use

---

## 3. Failure Conditions (Auto-Reject / Fix Before Commit)

Reject or fix if any of the following is true:

- Any track can exceed 20 or go below 0 in any code path
- `Math.random()` used in `game/` files instead of seeded RNG
- `simulate.js` outcome logic differs from `game/outcomeEngine.js`
- Any `localStorage.getItem` / `JSON.parse` without try/catch
- Game crashes or freezes if localStorage is empty (first run)
- Any ending has 0% occurrence in 500-game simulation
- `setTimeout` used to sequence game state (not just UI animation)
- Surge or leverage can go negative
- Particle or toast DOM nodes accumulate without cleanup
- Audio context created but never suspended/closed

---

## 4. Compact AI Prompt

When modifying System Shift, apply these rules:

1. **Tracks**: clamp all writes to [0, 20] — `Math.max(0, Math.min(20, value))`
2. **RNG**: use `seededRandom()` from `game/rng.js`, never `Math.random()` in game logic
3. **Timing**: `setTimeout`/`delay()` for UI only — game state transitions must be synchronous
4. **localStorage**: wrap every read in try/catch, return safe default on failure
5. **Simulation sync**: after changing `outcomeEngine.js` or balance values, update `simulate.js` to match, re-run 500 games, verify distribution
6. **Opposition**: reference `gameState.surge` not `gameState.resources.momentum`
7. **Thresholds**: guard one-time effects with `activeThresholds.includes(id)` check
8. **UI**: disable interactive elements immediately on use, clean up all dynamic DOM nodes
9. **New systems**: reset per-act state (negotiation, scouting) on act transitions in `round.js`
10. **Error handling**: never crash silently — log to console, return safe fallback

If any rule is unmet: fix it OR explicitly report it with the file and line number.

---

## 5. Deployment Gate

Before tagging a release or sharing publicly:

- [ ] `node simulate.js` — all 8 endings within target bands
- [ ] All track averages within [0, 20] in simulation output
- [ ] No console errors on fresh load (cleared localStorage)
- [ ] All 6 localStorage keys handle missing/malformed data gracefully
- [ ] Cards, Scout, Negotiate buttons cannot be double-triggered
- [ ] Screen shake, particles, toasts clean up after themselves
- [ ] Game playable on mobile at 375px viewport
- [ ] Audio context resumes correctly after first user interaction
- [ ] `simulate.js` outcome logic in sync with `outcomeEngine.js`
- [ ] No `Math.random()` in `game/` directory (grep to verify)
- [ ] No `setTimeout` in game state logic (only UI/animation use is allowed)

---

## 6. Known Outstanding Items

Issues identified during review — not blocking but should be addressed:

| Issue | File | Severity |
|-------|------|----------|
| `localStorage.setItem` in `game/narrative.js` has no try/catch | `game/narrative.js:406` | Medium |
| `localStorage` reads in `game/tutorial.js` have no try/catch | `game/tutorial.js:144-146` | Medium |
| Achievement modal missing Achievements button wire-up in index.html header | `index.html` | Low |
| `successfulNegotiations` stat not incremented in `game/negotiation.js` (Diplomat achievement unusable) | `game/negotiation.js` | Medium |
| SYSTEM DRIFT at 7.2% — below 10–20% target | `simulate.js` / `game/outcomeEngine.js` | Low |
| `renderAchievements()` in main.js duplicates achievement definitions from `game/achievements.js` | `main.js` | Low |
