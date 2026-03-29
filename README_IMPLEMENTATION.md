# SYSTEM SHIFT - Implementation Guide

## Current State: Fully Playable

System Shift is a narrative-driven, turn-based political simulation card game. Players lead a transformative social movement across 10 rounds and 3 dramatic acts, playing policy cards, managing resources, and navigating adaptive opposition from entrenched interests.

**Session length:** 15-25 minutes | **Tech:** Vanilla JS + HTML/CSS, zero dependencies

---

## Architecture Overview

### Source Files (7,245 lines total)

| Module | File | Lines | Purpose |
|--------|------|------:|---------|
| Entry Point | `main.js` | 418 | Game loop, rendering, input handling |
| Layout | `index.html` | 152 | Semantic HTML with resource/track halos |
| Styling | `style.css` | 970 | Visual system, animations, responsive layout |
| **Core Mechanics** | | | |
| State | `game/state.js` | 125 | Central game state, track values, flags |
| Deck | `game/deck.js` | 144 | 54 policy cards + system/risk/hidden cards |
| Round | `game/round.js` | 377 | Round processing, pushback, leverage recovery |
| Effects | `game/effectResolver.js` | 270 | Card effect application, track clamping |
| Outcomes | `game/outcomeEngine.js` | 145 | 7 ending conditions and resolution |
| Acts | `game/acts.js` | 45 | 3-act structure with modifiers |
| **Strategic Systems** | | | |
| Card Interactions | `game/cardInteractions.js` | 431 | Combos, synergies, counters, hidden/risk cards |
| Resources | `game/resourceManagement.js` | 466 | 4-resource economy (Political, Social, Momentum, Infrastructure) |
| Opposition | `game/oppositionSystem.js` | 472 | 3 adaptive factions (Elite, Authoritarian, Status Quo) |
| Opposition Actions | `game/oppositionActions.js` | 385 | Faction response generation and escalation |
| **Narrative & UX** | | | |
| Narrative | `game/narrative.js` | 415 | Story beats, flavor text, track narratives, choices |
| Tutorial | `game/tutorial.js` | 292 | 8-step tutorial + 6 contextual tips |
| Audio | `game/audioManager.js` | 201 | Dynamic BGM + sound effects |
| Endings | `game/endings.js` | 153 | Ending descriptions and narrative wrap-up |
| Commentary | `game/commentary.js` | 126 | In-game contextual commentary |
| **Simulation & Analysis** | | | |
| System Dynamics | `game/systemDynamics.js` | 183 | Track interaction rules and drift |
| Phase Engine | `game/phaseEngine.js` | 147 | Act transition logic and modifiers |
| Ambient Engine | `game/ambientEngine.js` | 141 | Environmental audio/visual effects |
| Pressure | `game/pressure.js` | 75 | Pushback pressure calculation |
| Resistance | `game/resistance.js` | 86 | Elite resistance modeling |
| Modifiers | `game/modifiers.js` | 31 | Global modifier application |
| **Utilities** | | | |
| RNG | `game/rng.js` | 79 | Seeded random number generation |
| Logger | `game/logger.js` | 92 | Action and event logging |
| Graph | `game/graph.js` | 117 | Track visualization helpers |
| Timeline | `game/timeline.js` | 42 | Round history tracking |
| Simulation | `game/simulation.js` | 193 | Automated game simulation for balance testing |
| Balance Simulator | `game/balanceSimulator.js` | 153 | Batch simulation runner |
| CRI | `game/cri.js` | 111 | Crisis Response Index calculation |
| Joker System | `game/jokerSystem.js` | 208 | Wildcard event system |

---

## Implemented Systems

### 1. Card System
- **54 Policy Cards** across 5 suits (Care, Climate, Solidarity, Authority, Capital — 10 each)
- **4 System Crisis Cards** (Emergency Spending, Security Crackdown, Capital Injection, National Referendum)
- **6 Risk/Reward Cards** with 30-40% random outcome variance
- **4 Hidden Cards** that reveal random effects when played
- Each card has: ID, suit, title, effects (track deltas), leverage cost, tags (3-layer), synergy links, flavor text

### 2. Track System (6 Tracks, 0-20 scale)
| Track | Theme | Low = | High = |
|-------|-------|-------|--------|
| Care | Social welfare | Crumbling services | Universal care |
| Climate | Environmental action | Accelerating destruction | Green transformation |
| Solidarity | Collective power | Division and fear | Mass movement |
| Authority | Institutional control | Democratic reform | Police state |
| Capital | Wealth concentration | Redistribution | Oligarchy |
| Strain | System stress | Stable reform | Collapse imminent |

### 3. Leverage & Action Economy
- Leverage: 0-10, starts at 5, recovers +2/round (act-modified)
- Card costs: 1-4 leverage each
- Max 3 plays per round
- Forces hard choices about card sequencing and resource allocation

### 4. Multi-Resource Economy (4 resources)
| Resource | Max | Start | Recovery | Consumed By |
|----------|-----|-------|----------|-------------|
| Political Capital | 10 | 5 | +2/round | Authority & Capital cards |
| Social Capital | 10 | 5 | +2/round | Care & Solidarity cards |
| Momentum | 15 | 0 | +1/round | Major plays, synergies; decays if unused |
| Infrastructure | 20 | 0 | Permanent | Maintained by Political/Social Capital; provides passive recovery bonuses |

- **Burn mechanic:** 30-40% chance to permanently lose resources on play
- **Opportunity costs:** Different suits drain different resource combinations

### 5. Card Interactions
- **5 Combos** (play specific 3-card sets for major bonuses): Universal Care Package, Green New Deal, Solidarity Network, Anti-Corruption Sweep, Wealth Redistribution
- **5 Synergies** (matching tags in same round trigger auto-bonuses)
- **Hidden card reveals** and **risk card variance** add uncertainty

### 6. Opposition System (3 Factions)
| Faction | Triggers On | Responds With |
|---------|------------|---------------|
| Elite Interests | Solidarity/Care gains, Capital loss | Capital boosts, social drains, infrastructure taxes |
| Authoritarian Control | Solidarity gains, Authority loss, Momentum | Authority boosts, momentum drains, strain increases |
| Status Quo Preservation | Rapid change, Infrastructure gains | Momentum drains, infrastructure decay, recovery slowing |

- Dynamic threat calculation with real-time assessment
- 3-5 escalation levels per faction
- Adaptive learning that adjusts to player strategy
- Factions can coordinate simultaneous responses

### 7. Pushback System (v2.2)
- **Elite Resistance** + **Transition Shock** = combined pushback value
- Escalates with player success, modified by act
- Displayed in top bar as strategic pressure indicator

### 8. Act Structure (3 acts across 10 rounds)
| Act | Rounds | Strain Mult | Special | Feel |
|-----|--------|-------------|---------|------|
| 1: Building Movement | 1-3 | 0.75x | +1 leverage/round | Hope |
| 2: Confrontation | 4-7 | 1.25x | 90% elite action chance | Tension |
| 3: Resolution | 8-10 | 1.5x | +2 surge/round | Urgency |

### 9. Outcome Engine (7 endings)
1. **System Collapse** — High strain + elite dominance
2. **Authoritarian Consolidation** — Elite power + high stress
3. **Ecological Transition** — Climate maxed + social advantage + stability
4. **Social Transformation** — High care/solidarity + social advantage
5. **Turbulent Transformation** — Balanced tracks + moderate strain
6. **Managed Reform** — Moderate improvements across metrics
7. **Ecological Constraint** — Climate crisis without social power

### 10. Narrative System
- **9 Story Beats** across 3 acts with player choices that affect state
- **54 Flavor Texts** — every card has thematic political context
- **Track Narratives** — 4 contextual descriptions per track based on value range
- **Persistent state** via localStorage

### 11. Tutorial & Accessibility
- 8-step interactive tutorial (Welcome → Leverage → Tracks → Strain → Synergy → Acts → Opposition → Resources)
- 6 contextual auto-tips (High Strain, Low Leverage, Synergy Available, Act Transition, Low Resource, High Pushback)
- Full keyboard navigation, ARIA labels, screen reader support, high contrast, reduced motion

### 12. Audio
- Dynamic BGM selection (Calm / Tension / Collapse) based on game state
- Sound effects for card play, combos, opposition, strain warnings, resource changes

---

## Current Balance (500-game simulation)

| Ending | Frequency | Status |
|--------|-----------|--------|
| Turbulent Transformation | 40.8% | Over-represented |
| Social Transformation | 30.4% | Over-represented |
| Ecological Transition | 28.8% | Over-represented |
| System Collapse | <1% | Under-represented |
| Authoritarian Consolidation | <1% | Under-represented |
| Managed Reform | <1% | Under-represented |
| Ecological Constraint | <1% | Under-represented |

**Target:** Each ending between 5-20%. The top 3 dominate; 4 endings are effectively unreachable. This is the primary area needing attention.

---

## Enhancement Roadmap

The following enhancements build on top of existing systems. None require rewriting core mechanics — they layer new behavior onto the current architecture.

### Tier 1: Balance & Polish (Low risk, high impact)

#### 1A. Outcome Rebalancing
**Goal:** Make all 7 endings reachable at 5-20% frequency.
- Adjust threshold ranges in `game/outcomeEngine.js` so that System Collapse, Authoritarian Consolidation, Managed Reform, and Ecological Constraint trigger more frequently
- Tune opposition escalation in `game/oppositionSystem.js` so that unchecked factions can push tracks toward negative endings
- Add strain drift acceleration when Strain > 14 to make System Collapse a real threat
- Add capital snowball effect (Capital > 14 gains +1/round) so Authoritarian Consolidation becomes reachable
- Run simulation batches after each adjustment to verify distribution

#### 1B. Difficulty Modes
**Goal:** Broader player accessibility without touching core logic.
- Add difficulty selector on game start (Easy / Standard / Hard)
- Easy: starting leverage 7, strain mult 0.6x, opposition 70% intensity
- Hard: starting leverage 4, strain mult 1.2x, opposition 130% intensity, faster escalation
- Store as modifier in `game/state.js`, apply in `game/round.js` and `game/oppositionSystem.js`
- Affects only numerical coefficients — no structural changes

#### 1C. Card Codex / Library
**Goal:** Let players learn cards outside of gameplay.
- Add a "Library" button on the main screen that opens a modal
- Display all 54 cards grouped by suit with flavor text, effects, tags, and synergy info
- Mark cards the player has previously played (track in localStorage)
- Minimal UI: reuse existing card styling from `style.css`

### Tier 2: Strategic Depth (Medium effort, extends existing systems)

#### 2A. Archetype Selection
**Goal:** Distinct starting configurations that create different strategic paths.
- 4 archetypes: Reformer (Care focus), Activist (Climate focus), Organizer (Solidarity focus), Technocrat (balanced)
- Each archetype: different starting track values, 2 unique starter cards, adjusted resource pools
- Selection screen before Round 1
- Implemented as a configuration object applied to `game/state.js` during `startGame()`
- No changes to round processing or card mechanics

#### 2B. Threshold Effects
**Goal:** Dramatic phase shifts when tracks cross critical values.
- Define 6-8 threshold triggers (e.g., Strain ≥ 16 → "Emergency Measures" forces immediate opposition action; Solidarity ≥ 16 → "Mass Uprising" grants +3 momentum; Capital ≥ 18 → "Oligarch Lock" blocks Capital reduction for 2 rounds)
- Check thresholds at end of each round in `game/round.js`
- Fire as one-time events per game (tracked in state)
- Display as narrative modal (reuse existing narrative modal from `game/narrative.js`)

#### 2C. Deck Evolution
**Goal:** Cards appear and disappear based on game state.
- Track-gated cards: certain cards only appear in the deck when a track crosses a threshold (e.g., "Revolutionary Council" only available when Solidarity ≥ 12)
- Opposition corruption: when a faction reaches max escalation, they inject 1-2 negative cards into the deck
- Card removal: playing certain combos permanently removes weaker cards from the deck
- Implemented as filters in `game/deck.js` draw logic — existing deck structure unchanged

### Tier 3: Depth & Replayability (Higher effort, new subsystems)

#### 3A. Scouting & Hidden Information
**Goal:** Add an intelligence layer to opposition interactions.
- Spend Momentum to "scout" a faction, revealing their next planned action
- Without scouting, opposition actions are revealed only after they fire
- Add a "Scout" action button alongside card play (costs 3 Momentum, reveals 1 faction's intent)
- Display scouted information as a tooltip on the faction indicator
- New file: `game/scouting.js` (~100 lines), integrated via `game/round.js`

#### 3B. Historical Memory
**Goal:** Cross-game consequences that reward replaying.
- Track key decisions and outcomes across games in localStorage
- Past outcomes influence starting conditions (e.g., after achieving Social Transformation, start next game with +1 Solidarity)
- "Legacy" bonuses: subtle persistent modifiers, not game-breaking
- "World State" display on main menu showing cumulative history
- New file: `game/memory.js` (~150 lines), read during `startGame()`

#### 3C. Negotiation System
**Goal:** Alternative to pure opposition — diplomacy with factions.
- Once per act, player can attempt to negotiate with one faction
- Negotiation costs resources and may partially reduce a faction's escalation
- Risk: failed negotiation increases faction threat
- Uses existing narrative modal for choice presentation
- Adds strategic depth without replacing the opposition system

#### 3D. Statistics & Analytics
**Goal:** Track player performance across sessions.
- Win/loss record by ending type
- Average track values at game end
- Most-played cards, most-triggered synergies
- Fastest/slowest completions
- Display on a "Stats" screen accessible from main menu
- All data in localStorage, no backend required

### Tier 4: Visual & Audio Polish

#### 4A. Enhanced Visual Feedback
- Card glow effects when synergies are available
- Track pulse intensity proportional to value (not just on/off)
- Opposition faction icons with escalation-level indicators
- Screen shake on System Collapse ending
- Particle effects on successful combo triggers

#### 4B. Dynamic Soundtrack Expansion
- Per-faction audio stings when opposition acts
- Victory/defeat ending themes (7 variants)
- Ambient environmental sounds tied to Climate track value
- Audio crossfading between act transitions

#### 4C. Mobile Responsiveness
- Touch-friendly card interactions
- Responsive layout for screens < 768px
- Swipe gestures for card selection
- Condensed track display for small viewports

---

## Implementation Priority

For maximum impact with minimum risk, implement in this order:

```
1A (Outcome Rebalancing)     ← fixes the biggest gameplay gap
    ↓
1B (Difficulty Modes)        ← broadens audience
    ↓
2B (Threshold Effects)       ← adds dramatic moments
    ↓
2A (Archetype Selection)     ← adds replayability
    ↓
2C (Deck Evolution)          ← deepens strategy
    ↓
1C (Card Codex)              ← quality of life
    ↓
3D (Statistics)              ← retention hook
    ↓
3A (Scouting)                ← strategic depth
    ↓
3B (Historical Memory)       ← long-term engagement
    ↓
3C (Negotiation)             ← alternative play style
    ↓
Tier 4 (Polish)              ← visual/audio refinement
```

Each enhancement is independently shippable. No enhancement requires another to function. All build on existing files and patterns.

---

## Development Completed (Phases 1-6)

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Core card system, tracks, leverage, round processing | Complete |
| Phase 2 | Resource management (4-resource economy) | Complete |
| Phase 3 | Card interactions (combos, synergies, hidden/risk cards) | Complete |
| Phase 4 | Opposition system (3 factions, adaptive AI, escalation) | Complete |
| Phase 5A | Tutorial system (8 steps + contextual tips) | Complete |
| Phase 5B | Act structure, pushback v2.2, UI stats bar | Complete |
| Phase 6 | Narrative system (story beats, flavor text, choices) | Complete |

---

## Running the Game

Open `index.html` in a browser. No build step, no server, no dependencies.

### Running Balance Simulations

```bash
node test-balance.js
```

Runs 500 automated games and reports ending distribution.

---

*Last updated: 2026-03-29*
*Version: 2.0.0*
*Status: Playable — Enhancement phase*
