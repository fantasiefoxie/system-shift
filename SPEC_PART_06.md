# PART 6: ARCHETYPES

## 6.1 CREATE: game/archetypes.js

```javascript
/* ================================================= */
/* SYSTEM SHIFT – ARCHETYPES                        */
/* Starting conditions and abilities                */
/* ================================================= */

export const archetypes = {
  labor_union: {
    id: "labor_union",
    name: "Labor Union",
    description: "Worker power through solidarity",
    flavor: "The working class united will never be defeated",
    startingTracks: {
      care: 8, climate: 8, solidarity: 10, 
      authority: 10, capital: 20, strain: 8
    },
    startingDeck: {
      add: [302, 305, 309], // Labor Rights, Union Expansion, Grassroots Campaign
      remove: [201, 207, 210] // Tree Cover, Plastic Ban, Rewilding
    },
    ability: {
      name: "Union Power",
      description: "Solidarity cards cost -1 leverage (minimum 1)",
      type: "cost_reduction",
      condition: { suit: "solidarity" },
      effect: -1
    }
  },
  
  green_movement: {
    id: "green_movement",
    name: "Green Movement",
    description: "Ecological transformation",
    flavor: "There is no planet B",
    startingTracks: {
      care: 8, climate: 12, solidarity: 6,
      authority: 10, capital: 20, strain: 10
    },
    startingDeck: {
      add: [203, 206, 210], // Fossil Exit, Renewable Grid, Rewilding
      remove: [301, 304, 309] // Local Assembly, Public Forum, Grassroots
    },
    ability: {
      name: "Green Synergy",
      description: "Climate cards give +1 care",
      type: "bonus_effect",
      condition: { suit: "climate" },
      effect: { care: 1 }
    }
  },
  
  reformist: {
    id: "reformist",
    name: "Progressive Coalition",
    description: "Incremental institutional change",
    flavor: "Change from within the system",
    startingTracks: {
      care: 10, climate: 8, solidarity: 6,
      authority: 12, capital: 18, strain: 6
    },
    startingDeck: {
      add: [401, 408, 406], // Transparency Act, Electoral Reform, Open Data
      remove: [303, 507, 509] // General Strike, Capital Controls, Anti-Monopoly
    },
    ability: {
      name: "Steady Progress",
      description: "Reform-tagged cards reduce strain by 1",
      type: "strain_reduction",
      condition: { tag: "reform" },
      effect: -1
    }
  },
  
  revolutionary: {
    id: "revolutionary",
    name: "Revolutionary Movement",
    description: "Rapid systemic transformation",
    flavor: "The people united will never be defeated",
    startingTracks: {
      care: 6, climate: 8, solidarity: 8,
      authority: 8, capital: 22, strain: 12
    },
    startingDeck: {
      add: [303, 503, 509], // General Strike, Public Banking, Anti-Monopoly
      remove: [404, 401, 406] // Civic Oversight, Transparency, Open Data
    },
    ability: {
      name: "Revolutionary Momentum",
      description: "Radical-tagged cards give +1 surge",
      type: "surge_bonus",
      condition: { tag: "radical" },
      effect: 1
    }
  }
};
```

## 6.2 CREATE: ui/archetypeSelect.js

```javascript
/* ================================================= */
/* SYSTEM SHIFT – ARCHETYPE SELECTION UI            */
/* ================================================= */

import { archetypes } from "../game/archetypes.js";
import { gameState } from "../game/state.js";

export function showArchetypeSelection(onSelect) {
  const overlay = document.createElement("div");
  overlay.className = "archetype-overlay";
  
  overlay.innerHTML = `
    <div class="archetype-container">
      <h1>Choose Your Movement</h1>
      <div class="archetype-grid">
        ${Object.values(archetypes).map(arch => `
          <div class="archetype-card" data-id="${arch.id}">
            <h2>${arch.name}</h2>
            <p class="archetype-description">${arch.description}</p>
            <p class="archetype-flavor">"${arch.flavor}"</p>
            <div class="archetype-ability">
              <strong>${arch.ability.name}:</strong> ${arch.ability.description}
            </div>
            <button class="select-archetype-btn">Select</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  overlay.querySelectorAll(".select-archetype-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".archetype-card");
      const archetypeId = card.dataset.id;
      overlay.remove();
      onSelect(archetypeId);
    });
  });
}
```

## 6.3 MODIFY: game/state.js

Add after line 12:
```javascript
    selectedArchetype: null,
```

## 6.4 MODIFY: main.js

Add import:
```javascript
import { showArchetypeSelection } from "./ui/archetypeSelect.js";
import { archetypes } from "./game/archetypes.js";
```

Replace startGame function:
```javascript
function startGame() {
    // Show archetype selection first
    showArchetypeSelection((archetypeId) => {
        initializeGame(archetypeId);
    });
}

function initializeGame(archetypeId) {
    const archetype = archetypes[archetypeId];
    const seed = Date.now();

    setSeed(seed);
    initLogger(seed);
    resetPhaseTracking();

    Object.assign(gameState, {
        round: 1,
        gameOver: false,
        playsThisRound: 0,
        leverage: gameState.maxLeverage,
        surge: 0,
        playerHand: [],
        discardPile: [],
        selectedArchetype: archetypeId,
        tracks: { ...archetype.startingTracks }
    });

    previousTrackValues = {};
    endingMusicPlayed = false;

    // Modify deck based on archetype
    let deck = [...baseDeck];
    
    // Remove cards
    archetype.startingDeck.remove.forEach(id => {
        const index = deck.findIndex(c => c.id === id);
        if (index !== -1) deck.splice(index, 1);
    });
    
    // Add extra copies of cards
    archetype.startingDeck.add.forEach(id => {
        const card = baseDeck.find(c => c.id === id);
        if (card) deck.push({ ...card });
    });

    gameState.deck = shuffleDeck(deck);
    drawHand(gameState.handSize);
    render();
}
```

## 6.5 MODIFY: game/round.js - Apply abilities

In playCard function, after calculating cost, add:
```javascript
    // Apply archetype ability - cost reduction
    const archetype = archetypes[gameState.selectedArchetype];
    if (archetype && archetype.ability.type === "cost_reduction") {
        if (card.suit === archetype.ability.condition.suit) {
            cost = Math.max(1, cost + archetype.ability.effect);
        }
    }
```

After applyEffects call, add:
```javascript
    // Apply archetype ability - bonus effects
    const archetype = archetypes[gameState.selectedArchetype];
    if (archetype) {
        if (archetype.ability.type === "bonus_effect") {
            if (card.suit === archetype.ability.condition.suit) {
                applyEffects(archetype.ability.effect);
            }
        }
        if (archetype.ability.type === "strain_reduction") {
            if (card.tags && card.tags.includes(archetype.ability.condition.tag)) {
                gameState.tracks.strain += archetype.ability.effect;
            }
        }
        if (archetype.ability.type === "surge_bonus") {
            if (card.tags && card.tags.includes(archetype.ability.condition.tag)) {
                gameState.surge += archetype.ability.effect;
            }
        }
    }
```

## 6.6 ADD CSS to style.css

```css
.archetype-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.archetype-container {
    max-width: 1200px;
    width: 100%;
}

.archetype-container h1 {
    text-align: center;
    color: #e94560;
    font-size: 36px;
    margin-bottom: 40px;
}

.archetype-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.archetype-card {
    background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
    border: 2px solid #0f3460;
    border-radius: 12px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.archetype-card:hover {
    border-color: #e94560;
    transform: translateY(-4px);
}

.archetype-card h2 {
    color: #e94560;
    margin: 0 0 12px 0;
}

.archetype-description {
    color: #ddd;
    margin: 0 0 8px 0;
}

.archetype-flavor {
    color: #999;
    font-style: italic;
    font-size: 14px;
    margin: 0 0 16px 0;
}

.archetype-ability {
    background: rgba(233, 69, 96, 0.1);
    padding: 12px;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 16px;
}

.select-archetype-btn {
    width: 100%;
    padding: 12px;
    background: #e94560;
    border: none;
    border-radius: 6px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.select-archetype-btn:hover {
    background: #ff5577;
}
```

## 6.7 VERIFICATION

- [ ] Archetype selection shows on start
- [ ] All 4 archetypes selectable
- [ ] Starting tracks apply
- [ ] Deck modifications work
- [ ] Abilities function correctly

**PART 6 COMPLETE**
