# PART 5: ACT STRUCTURE

## 5.1 CREATE: game/acts.js

```javascript
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
```

## 5.2 MODIFY: game/state.js

Add after line 12:
```javascript
    currentAct: 1,
```

## 5.3 MODIFY: game/round.js

Add import at top:
```javascript
import { getCurrentAct } from "./acts.js";
```

In applyStructuralStrainDrift function, find line with `let strainDelta = 0;` and add AFTER calculating strainDelta but BEFORE applying it:
```javascript
    // Apply act modifier
    const currentAct = getCurrentAct(gameState.round);
    if (currentAct && currentAct.modifiers.strainMultiplier) {
        strainDelta = Math.round(strainDelta * currentAct.modifiers.strainMultiplier);
    }
```

In endRound function, after leverage recovery section, add:
```javascript
    // Apply act surge bonus
    const currentAct = getCurrentAct(gameState.round);
    if (currentAct && currentAct.modifiers.surgeBonus) {
        gameState.surge += currentAct.modifiers.surgeBonus;
    }
```

At start of endRound, add:
```javascript
    // Update current act
    const currentAct = getCurrentAct(gameState.round);
    if (currentAct) {
        gameState.currentAct = currentAct.act;
    }
```

## 5.4 MODIFY: main.js

Add to updateStats function:
```javascript
    // Display current act
    const actIndicator = document.getElementById("actIndicator");
    if (actIndicator) {
        const currentAct = getCurrentAct(gameState.round);
        if (currentAct) {
            actIndicator.textContent = `Act ${currentAct.act}: ${currentAct.name}`;
        }
    }
```

## 5.5 MODIFY: index.html

Add after round stat in top bar:
```html
<div class="halo-stat">
    <div class="halo-label">Act</div>
    <div id="actIndicator" class="halo-value"></div>
</div>
```

## 5.6 VERIFICATION

- [ ] Acts transition at rounds 4 and 8
- [ ] Strain multiplier applies correctly
- [ ] Surge bonus applies in Act 3
- [ ] Act indicator displays
- [ ] No errors in console

**PART 5 COMPLETE**
