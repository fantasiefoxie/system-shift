# PART 4: CARD TAGS & SYNERGIES

## 4.1 MODIFY: game/deck.js - Add tags to all 54 cards

Find each card and add tags array. Example:

```javascript
{ id: 101, suit: "care", title: "Public Clinic", effects: { care: 2 }, cost: 1, tags: ["reform", "healthcare", "incremental"] },
```

**COMPLETE TAG ASSIGNMENTS:**

**CARE CARDS (101-110):**
- 101: ["reform", "healthcare", "incremental"]
- 102: ["reform", "welfare", "moderate"]
- 103: ["reform", "healthcare", "disruptive"]
- 104: ["reform", "welfare", "incremental"]
- 105: ["reform", "healthcare", "incremental"]
- 106: ["reform", "welfare", "moderate"]
- 107: ["reform", "welfare", "moderate"]
- 108: ["reform", "healthcare", "moderate"]
- 109: ["reform", "labor", "incremental"]
- 110: ["reform", "welfare", "moderate"]

**CLIMATE CARDS (201-210):**
- 201: ["reform", "climate", "incremental"]
- 202: ["reform", "climate", "moderate"]
- 203: ["radical", "climate", "disruptive"]
- 204: ["reform", "climate", "incremental"]
- 205: ["reform", "climate", "incremental"]
- 206: ["reform", "climate", "moderate"]
- 207: ["reform", "climate", "moderate"]
- 208: ["reform", "climate", "moderate"]
- 209: ["reform", "climate", "disruptive"]
- 210: ["reform", "climate", "incremental"]

**SOLIDARITY CARDS (301-310):**
- 301: ["grassroots", "organizing", "incremental"]
- 302: ["grassroots", "labor", "moderate"]
- 303: ["radical", "labor", "disruptive"]
- 304: ["grassroots", "organizing", "incremental"]
- 305: ["grassroots", "labor", "incremental"]
- 306: ["grassroots", "organizing", "moderate"]
- 307: ["grassroots", "housing", "moderate"]
- 308: ["grassroots", "organizing", "moderate"]
- 309: ["grassroots", "organizing", "incremental"]
- 310: ["grassroots", "organizing", "moderate"]

**AUTHORITY CARDS (401-410):**
- 401: ["reform", "institutional", "moderate"]
- 402: ["reform", "institutional", "moderate"]
- 403: ["radical", "institutional", "disruptive"]
- 404: ["reform", "institutional", "incremental"]
- 405: ["reform", "institutional", "moderate"]
- 406: ["reform", "institutional", "incremental"]
- 407: ["reform", "institutional", "moderate"]
- 408: ["reform", "institutional", "moderate"]
- 409: ["reform", "institutional", "moderate"]
- 410: ["reform", "institutional", "moderate"]

**CAPITAL CARDS (501-510):**
- 501: ["reform", "economic", "moderate"]
- 502: ["reform", "economic", "moderate"]
- 503: ["radical", "economic", "disruptive"]
- 504: ["reform", "labor", "incremental"]
- 505: ["reform", "economic", "moderate"]
- 506: ["reform", "economic", "moderate"]
- 507: ["radical", "economic", "disruptive"]
- 508: ["radical", "economic", "moderate"]
- 509: ["radical", "economic", "disruptive"]
- 510: ["reform", "economic", "moderate"]

**SYSTEM CARDS (901-904):**
- 901: ["crisis", "economic", "disruptive"]
- 902: ["crisis", "repression", "disruptive"]
- 903: ["crisis", "economic", "disruptive"]
- 904: ["crisis", "organizing", "disruptive"]

## 4.2 ADD SYNERGIES: game/deck.js

Add synergy property to these cards:

```javascript
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
},
{ 
  id: 203, 
  suit: "climate", 
  title: "Fossil Exit Plan",
  tags: ["radical", "climate", "disruptive"],
  effects: { climate: 3, strain: 3, capital: -1 },
  cost: 3,
  synergy: {
    if_played_this_round: ["climate"],
    bonus: { climate: 1 }
  }
},
{ 
  id: 503, 
  suit: "capital", 
  title: "Public Banking",
  tags: ["radical", "economic", "disruptive"],
  effects: { capital: -2, care: 1, strain: 2 },
  cost: 3,
  synergy: {
    if_played_this_round: ["economic"],
    bonus: { care: 1 }
  }
},
{ 
  id: 403, 
  suit: "authority", 
  title: "Decentralization Reform",
  tags: ["radical", "institutional", "disruptive"],
  effects: { authority: -2, solidarity: 1, strain: 1 },
  cost: 3,
  synergy: {
    if_played_this_round: ["institutional"],
    bonus: { solidarity: 1 }
  }
},
{ 
  id: 103, 
  suit: "care", 
  title: "Universal Healthcare",
  tags: ["reform", "healthcare", "disruptive"],
  effects: { care: 4, strain: 3, surge: 1 },
  cost: 3,
  synergy: {
    if_played_this_round: ["healthcare"],
    bonus: { care: 1, strain: -1 }
  }
}
```

## 4.3 MODIFY: game/state.js

Add after line 67:
```javascript
    tagsPlayedThisRound: [],
```

## 4.4 MODIFY: game/round.js - Track tags

In playCard function, after line 40, add:
```javascript
    // Track tags played this round
    if (card.tags) {
        gameState.tagsPlayedThisRound.push(...card.tags);
    }
    
    // Check for synergies
    if (card.synergy) {
        const hasTag = card.synergy.if_played_this_round.some(
            tag => gameState.tagsPlayedThisRound.includes(tag)
        );
        if (hasTag) {
            applyEffects(card.synergy.bonus);
            log("SYNERGY_TRIGGERED", { 
                cardId: card.id, 
                bonus: card.synergy.bonus 
            });
        }
    }
```

In endRound function, before line 240, add:
```javascript
    gameState.tagsPlayedThisRound = [];
```

## 4.5 VERIFICATION

- [ ] All 54 cards have tags array
- [ ] 5 cards have synergy definitions
- [ ] Tags tracked in state
- [ ] Synergies trigger correctly
- [ ] Tags reset each round

**PART 4 COMPLETE**
