# System Shift - Balance Analysis Report

## Simulation Results (500 games)

### Outcome Distribution
- **Turbulent Transformation**: 48.2% (241 games)
- **Ecological Transition**: 26.2% (131 games)  
- **Social Transformation**: 25.6% (128 games)
- **System Collapse**: 0%
- **Authoritarian Consolidation**: 0%
- **Managed Stability**: 0%
- **System Drift**: 0%

### Average Final Tracks
- Care: 25.36
- Climate: 19.49
- Solidarity: 23.68
- Authority: 1.48
- Capital: 11.61
- Strain: 16.96

### Most Played Cards (Top 10)
1. Local Assembly (301) - 463 plays
2. Public Forum (304) - 458 plays
3. Public Clinic (101) - 457 plays
4. Union Expansion (305) - 446 plays
5. Tree Cover (201) - 438 plays
6. Minimum Wage Law (504) - 438 plays
7. Clean Water Initiative (205) - 408 plays
8. Rewilding Program (210) - 404 plays
9. Food Security Act (104) - 402 plays
10. Open Data Initiative (406) - 402 plays

---

## Key Findings

### ✅ Successes
1. **Strain pressure is real** - Average 16.96 (up from 11.22)
2. **Transformation endings viable** - 3 different transformation paths work
3. **Elite power persists** - Authority/Capital stay positive
4. **Cost matters** - Players favor efficient low-cost cards
5. **Strategic depth** - Strain penalties force meaningful choices

### ⚠️ Issues
1. **Missing 4 endings** - Collapse, Authoritarian, Managed Stability, System Drift never occur
2. **AI too conservative** - Avoids high-strain cards completely
3. **Low-cost card dominance** - Cost-1 cards played 2x more than cost-3/4
4. **Transformation bias** - 100% of games end in transformation

---

## Balance Changes Applied

### Starting Conditions
- Authority: 5 → 8
- Capital: 15 → 18
- Strain: 6 → 8
- Max Leverage: 12 → 10

### Card Adjustments
**Increased Costs:**
- Anti-Monopoly Breakup: 3 → 4
- Housing Cooperative: 2 → 3

**Added Strain Penalties (20+ cards):**
- Most transformative cards now cost 1-3 strain
- High-impact cards (Universal Healthcare, General Strike) cost 3 strain

**Reduced Power:**
- Public Banking: capital -3 → -2
- Emergency Relief: care 3 → 2, capital -2 → -1
- Decentralization Reform: solidarity 2 → 1

**Track Floors:**
- Authority/Capital cannot go below 0

---

## Recommendations for Further Balance

### To Enable Missing Endings:

**1. System Collapse (strain ≥20, elites win)**
- Increase base strain drift
- Add "crisis cards" that spike strain
- Reduce surge stabilization effect

**2. Authoritarian Consolidation (elites win, high strain)**
- Add cards that boost authority/capital
- Make Security Crackdown more attractive
- Increase elite resistance scaling

**3. Managed Stability (low strain, balanced)**
- Reward incremental reforms
- Add "stability bonus" cards
- Reduce strain from moderate actions

**4. System Drift (fallback ending)**
- Occurs when transformation incomplete
- May need outcome threshold adjustments

### Card Design Suggestions:
- Add more cost-2 cards with moderate effects
- Create "high risk/high reward" cards
- Add cards that reduce strain but maintain status quo
- Design "elite response" cards that counter transformation

### AI Strategy Improvements:
- Add difficulty modes with different risk tolerances
- Implement "desperate measures" when losing
- Create faction-based strategies (reformist vs revolutionary)

---

## Technical Implementation

### Files Modified:
- `game/deck.js` - Card effects and costs
- `game/state.js` - Starting conditions
- `game/round.js` - Track floor constraints
- `game/balanceSimulator.js` - Automated testing
- `simulate.js` - Standalone simulation script

### Testing Infrastructure:
- 500-game simulation runs in ~2 seconds
- Tracks outcome distribution, card usage, final states
- Exports JSON for detailed analysis
- Browser and Node.js compatible

---

## Conclusion

The rebalancing successfully created **strategic tension** and **meaningful choices**. Strain is now a real constraint, and transformation requires careful management. However, the game currently favors transformation endings too heavily.

**Next priority**: Diversify viable strategies to enable all 7 endings through:
1. Crisis mechanics that can trigger collapse
2. Elite counter-strategies
3. Stability-focused card paths
4. Adjusted outcome thresholds

The simulation infrastructure is now in place for rapid iteration on these changes.
