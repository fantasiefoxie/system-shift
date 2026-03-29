/* ================================================= */
/* STANDALONE SIMULATION - Direct Execution         */
/* ================================================= */

// Inline minimal dependencies
let seed = 1;
function setSeed(s) { seed = (s >>> 0) || 1; }
function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
function randomInt(max) { return Math.floor(random() * max); }
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const baseDeck = [
{ id: 101, suit: "care", title: "Public Clinic", effects: { care: 2 }, cost: 1 },
{ id: 102, suit: "care", title: "Universal Benefit", effects: { care: 3, strain: 2 }, cost: 2 },
{ id: 103, suit: "care", title: "Universal Healthcare", effects: { care: 4, strain: 3, surge: 1 }, cost: 3 },
{ id: 104, suit: "care", title: "Food Security Act", effects: { care: 3 }, cost: 2 },
{ id: 105, suit: "care", title: "Mental Health Drive", effects: { care: 2, solidarity: 1 }, cost: 2 },
{ id: 106, suit: "care", title: "Pension Reform", effects: { care: 2, capital: -1, strain: 1 }, cost: 2 },
{ id: 107, suit: "care", title: "Childcare Expansion", effects: { care: 3, strain: 2 }, cost: 2 },
{ id: 108, suit: "care", title: "Hospital Upgrade", effects: { care: 4 }, cost: 3 },
{ id: 109, suit: "care", title: "Worker Safety Law", effects: { care: 2, solidarity: 1 }, cost: 2 },
{ id: 110, suit: "care", title: "Emergency Relief Fund", effects: { care: 2, capital: -1, strain: 1 }, cost: 3 },
{ id: 201, suit: "climate", title: "Tree Cover", effects: { climate: 2 }, cost: 1 },
{ id: 202, suit: "climate", title: "Public Transit", effects: { climate: 3, strain: 2 }, cost: 2 },
{ id: 203, suit: "climate", title: "Fossil Exit Plan", effects: { climate: 3, strain: 3, capital: -1 }, cost: 3 },
{ id: 204, suit: "climate", title: "Urban Green Zones", effects: { climate: 2, care: 1 }, cost: 2 },
{ id: 205, suit: "climate", title: "Clean Water Initiative", effects: { climate: 3 }, cost: 2 },
{ id: 206, suit: "climate", title: "Renewable Grid", effects: { climate: 4, strain: 2 }, cost: 3 },
{ id: 207, suit: "climate", title: "Plastic Ban", effects: { climate: 2, strain: 2 }, cost: 1 },
{ id: 208, suit: "climate", title: "Agricultural Reform", effects: { climate: 2, capital: -1, strain: 1 }, cost: 2 },
{ id: 209, suit: "climate", title: "Climate Treaty", effects: { climate: 4, strain: 3 }, cost: 3 },
{ id: 210, suit: "climate", title: "Rewilding Program", effects: { climate: 3 }, cost: 2 },
{ id: 301, suit: "solidarity", title: "Local Assembly", effects: { solidarity: 2 }, cost: 1 },
{ id: 302, suit: "solidarity", title: "Labor Rights", effects: { solidarity: 3, strain: 2 }, cost: 2 },
{ id: 303, suit: "solidarity", title: "General Strike", effects: { solidarity: 4, strain: 3, surge: 2 }, cost: 3 },
{ id: 304, suit: "solidarity", title: "Public Forum", effects: { solidarity: 2 }, cost: 1 },
{ id: 305, suit: "solidarity", title: "Union Expansion", effects: { solidarity: 3 }, cost: 2 },
{ id: 306, suit: "solidarity", title: "Community Media", effects: { solidarity: 2, authority: -1, strain: 1 }, cost: 2 },
{ id: 307, suit: "solidarity", title: "Housing Cooperative", effects: { solidarity: 2, capital: -1, strain: 1 }, cost: 3 },
{ id: 308, suit: "solidarity", title: "Participatory Budget", effects: { solidarity: 4 }, cost: 3 },
{ id: 309, suit: "solidarity", title: "Grassroots Campaign", effects: { solidarity: 2, surge: 1 }, cost: 2 },
{ id: 310, suit: "solidarity", title: "Public Petition Surge", effects: { solidarity: 3, strain: 2 }, cost: 2 },
{ id: 401, suit: "authority", title: "Transparency Act", effects: { authority: -1, solidarity: 1 }, cost: 2 },
{ id: 402, suit: "authority", title: "Anti-Corruption Drive", effects: { authority: -2, care: 1 }, cost: 3 },
{ id: 403, suit: "authority", title: "Decentralization Reform", effects: { authority: -2, solidarity: 1, strain: 1 }, cost: 3 },
{ id: 404, suit: "authority", title: "Civic Oversight Board", effects: { authority: -1 }, cost: 2 },
{ id: 405, suit: "authority", title: "Judicial Reform", effects: { authority: -2 }, cost: 3 },
{ id: 406, suit: "authority", title: "Open Data Initiative", effects: { authority: -1, care: 1 }, cost: 2 },
{ id: 407, suit: "authority", title: "Whistleblower Protection", effects: { authority: -1, strain: 2 }, cost: 2 },
{ id: 408, suit: "authority", title: "Electoral Reform", effects: { authority: -2, solidarity: 1 }, cost: 3 },
{ id: 409, suit: "authority", title: "Civil Liberties Defense", effects: { authority: -1, strain: 2 }, cost: 2 },
{ id: 410, suit: "authority", title: "Term Limits Law", effects: { authority: -2 }, cost: 3 },
{ id: 501, suit: "capital", title: "Progressive Tax", effects: { capital: -2, care: 1, strain: 1 }, cost: 2 },
{ id: 502, suit: "capital", title: "Corporate Regulation", effects: { capital: -2, strain: 2 }, cost: 2 },
{ id: 503, suit: "capital", title: "Public Banking", effects: { capital: -2, care: 1, strain: 2 }, cost: 3 },
{ id: 504, suit: "capital", title: "Minimum Wage Law", effects: { capital: -1, care: 2 }, cost: 2 },
{ id: 505, suit: "capital", title: "Debt Relief Program", effects: { capital: -2, solidarity: 1, strain: 1 }, cost: 2 },
{ id: 506, suit: "capital", title: "Wealth Transparency Act", effects: { capital: -1, authority: -1 }, cost: 2 },
{ id: 507, suit: "capital", title: "Capital Controls", effects: { capital: -3, strain: 3 }, cost: 3 },
{ id: 508, suit: "capital", title: "Cooperative Investment", effects: { capital: -2, solidarity: 1, strain: 1 }, cost: 3 },
{ id: 509, suit: "capital", title: "Anti-Monopoly Breakup", effects: { capital: -2, authority: -1, strain: 2 }, cost: 4 },
{ id: 510, suit: "capital", title: "Public Infrastructure Push", effects: { capital: -1, climate: 1, strain: 1 }, cost: 2 },
{ id: 901, suit: "system", title: "Emergency Spending", effects: { care: 2, strain: 3, capital: -2 }, cost: 2 },
{ id: 902, suit: "system", title: "Security Crackdown", effects: { authority: 3, strain: -2, solidarity: -2 }, cost: 2 },
{ id: 903, suit: "system", title: "Capital Injection", effects: { capital: 4, strain: 2 }, cost: 2 },
{ id: 904, suit: "system", title: "National Referendum", effects: { solidarity: 3, strain: 2 }, cost: 3 }
];

function simulateGame(gameSeed) {
    setSeed(gameSeed);
    
    const state = {
        round: 1,
        leverage: 10,
        surge: 0,
        tracks: { care: 8, climate: 8, solidarity: 6, authority: 10, capital: 20, strain: 10 },
        pushback: { eliteResistance: 0, transitionShock: 0, value: 0 },
        deck: shuffle([...baseDeck]),
        hand: [],
        discard: [],
        // Part 8: Hidden tracks
        hiddenTracks: { eliteCohesion: 10, movementMorale: 10, internationalPressure: 5 },
        // Part 9: Memory
        memory: { maxCare: 8, maxClimate: 8, cardsPlayed: [] },
        // Part 10: Thresholds
        activeThresholds: []
    };
    
    const cardLog = [];
    let surgeDelta = 0;
    
    while (state.round <= 10) {
        state.hand = [];
        for (let i = 0; i < 5; i++) {
            if (state.deck.length === 0) {
                state.deck = shuffle([...state.discard]);
                state.discard = [];
            }
            if (state.deck.length > 0) state.hand.push(state.deck.pop());
        }
        
        for (let p = 0; p < 3; p++) {
            let best = -1, bestScore = -Infinity;
            for (let i = 0; i < state.hand.length; i++) {
                const c = state.hand[i];
                if (state.leverage < c.cost) continue;
                let s = random() * 3;
                
                // Random strategy shifts (30% chance to play suboptimally)
                if (random() < 0.3) {
                    // Play a random affordable card
                    s = random() * 10;
                } else {
                    // Adaptive strategy based on strain
                    if (state.tracks.strain >= 16) {
                        // Desperate - reduce strain at all costs
                        if (c.effects.strain < 0) s += Math.abs(c.effects.strain) * 8;
                        if (c.effects.strain > 0) s -= c.effects.strain * 10;
                    } else {
                        // Normal transformation strategy with some variation
                        const strategy = random();
                        if (strategy < 0.6) {
                            // 60% - Standard transformation strategy
                            if (c.effects.capital < 0) s += Math.abs(c.effects.capital) * 2;
                            if (c.effects.authority < 0) s += Math.abs(c.effects.authority) * 2;
                            if (c.effects.care > 0) s += c.effects.care * 1.5;
                            if (c.effects.climate > 0) s += c.effects.climate * 1.5;
                            if (c.effects.solidarity > 0) s += c.effects.solidarity * 1.5;
                            if (c.effects.strain > 0) s -= c.effects.strain * 4;
                        } else if (strategy < 0.8) {
                            // 20% - Focus on reducing authority/capital
                            if (c.effects.capital < 0) s += Math.abs(c.effects.capital) * 4;
                            if (c.effects.authority < 0) s += Math.abs(c.effects.authority) * 4;
                            if (c.effects.strain > 0) s -= c.effects.strain * 2;
                        } else {
                            // 20% - Focus on building care/climate
                            if (c.effects.care > 0) s += c.effects.care * 3;
                            if (c.effects.climate > 0) s += c.effects.climate * 3;
                            if (c.effects.strain > 0) s -= c.effects.strain * 6;
                        }
                    }
                }
                
                if (c.suit === "authority" || c.suit === "solidarity") s += 1;
                s -= c.cost * 2;
                if (s > bestScore) { bestScore = s; best = i; }
            }
            if (best === -1) break;
            
            const card = state.hand[best];
            cardLog.push(card.id);
            state.leverage -= card.cost;
            
            for (let k in card.effects) {
                if (k === "surge") { state.surge += card.effects[k]; surgeDelta += card.effects[k]; }
                else if (state.tracks[k] !== undefined) {
                    state.tracks[k] += card.effects[k];
                    if (k === "authority" || k === "capital") state.tracks[k] = Math.max(0, state.tracks[k]);
                }
            }
            
            if (card.suit === "authority" || card.suit === "solidarity") {
                state.surge += 1;
                surgeDelta += 1;
            }
            
            state.discard.push(card);
            state.hand.splice(best, 1);
        }
        
        state.round++;
        const surgeBonus = Math.ceil(state.surge / 2) + Math.floor(state.surge / 6);
        state.leverage = Math.min(10, state.leverage + 2 + surgeBonus);
        
        const elitePower = Math.max(0, state.tracks.authority) + Math.max(0, state.tracks.capital);
        let eliteDelta = 0;
        if (elitePower > 0) {
            eliteDelta += Math.floor(state.surge / 4);
            if (state.tracks.strain >= 8 && state.tracks.strain < 18) eliteDelta += 1;
            if (state.tracks.strain >= 20 && eliteDelta > 0) eliteDelta -= 1;
        }
        let shockDelta = Math.floor(state.surge / 5);
        if (state.tracks.strain >= 15) shockDelta += 1;
        
        state.pushback.eliteResistance = Math.max(0, state.pushback.eliteResistance + eliteDelta);
        state.pushback.transitionShock = Math.max(0, state.pushback.transitionShock + shockDelta);
        state.pushback.value = state.pushback.eliteResistance + state.pushback.transitionShock;
        
        if (state.pushback.value >= 20) { state.leverage = Math.max(0, state.leverage - 1); state.tracks.strain = Math.min(20, state.tracks.strain + 1); }
        else if (state.pushback.value >= 10) state.leverage = Math.max(0, state.leverage - 1);
        
        const social = (state.tracks.care + state.tracks.solidarity) / 2;
        const control = (state.tracks.authority + state.tracks.capital) / 2;
        const imbalance = control - social;
        const powerImb = Math.abs(imbalance);
        const ecoDef = Math.max(0, 10 - state.tracks.climate);
        let strainD = 0;
        if (imbalance > 6) strainD += 2;
        else if (imbalance < -6) strainD += 1;
        else if (powerImb >= 3) strainD += 1;
        if (ecoDef >= 5) strainD += 2;
        else if (ecoDef >= 3) strainD += 1;
        if (powerImb <= 2 && ecoDef === 0) strainD -= 2;
        const surgeStab = Math.floor(state.surge / 5);
        strainD -= surgeStab;
        
        // Strain acceleration: when strain > 16, it drifts faster toward collapse (raised threshold)
        if (state.tracks.strain > 16) {
            strainD += 1;
        }
        
        state.tracks.strain = Math.max(0, Math.min(20, state.tracks.strain + strainD));
        
        // Capital snowball: when capital > 18, it gains +1/round automatically (raised threshold)
        if (state.tracks.capital > 18) {
            state.tracks.capital += 1;
        }
        
        // Social power strain: high social power generates strain (cost of progress) - reduced further
        const socialPowerNow = state.tracks.care + state.tracks.solidarity;
        if (socialPowerNow > 45) {
            state.tracks.strain = Math.min(20, state.tracks.strain + 1);
        }
        
        // Authority recovery: when authority is very low, it slowly recovers toward 8
        if (state.tracks.authority < 8) {
            state.tracks.authority += 1;
        }
        
        // Strain natural decay: strain slowly decreases when not under pressure - increased
        if (state.tracks.strain > 8 && strainD <= 0) {
            state.tracks.strain = Math.max(0, state.tracks.strain - 1);
        }
        
        // Additional strain decay when strain is moderate
        if (state.tracks.strain > 12 && state.tracks.strain <= 16 && random() < 0.3) {
            state.tracks.strain = Math.max(0, state.tracks.strain - 1);
        }
        
        // Part 8: Hidden tracks update
        if (state.tracks.authority + state.tracks.capital < 20) {
            state.hiddenTracks.eliteCohesion = Math.max(0, state.hiddenTracks.eliteCohesion - 1);
        }
        if (state.tracks.care + state.tracks.solidarity > 30) {
            state.hiddenTracks.movementMorale = Math.min(20, state.hiddenTracks.movementMorale + 1);
        }
        state.hiddenTracks.internationalPressure += Math.floor(random() * 3) - 1;
        state.hiddenTracks.internationalPressure = Math.max(0, Math.min(10, state.hiddenTracks.internationalPressure));
        
        // Part 9: Memory checks
        if (state.tracks.care < state.memory.maxCare - 3) {
            // Broken promise
            state.tracks.solidarity = Math.max(0, state.tracks.solidarity - 2);
            state.tracks.strain = Math.min(20, state.tracks.strain + 2);
        }
        const tagCounts = {};
        state.memory.cardsPlayed.forEach(card => {
            if (card.tags) {
                card.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });
        if (Math.max(...Object.values(tagCounts)) >= 5) {
            // Consistent vision
            state.surge += 2;
            state.tracks.solidarity += 1;
        }
        
        // Part 10: Threshold checks
        // mass_movement: solidarity >= 15
        if (!state.activeThresholds.includes("mass_movement") && state.tracks.solidarity >= 15) {
            state.activeThresholds.push("mass_movement");
        }
        // legitimacy_crisis: authority <= 3
        if (!state.activeThresholds.includes("legitimacy_crisis") && state.tracks.authority <= 3) {
            state.activeThresholds.push("legitimacy_crisis");
        }
        // climate_emergency: climate <= 5 AND round >= 6
        if (!state.activeThresholds.includes("climate_emergency") && state.tracks.climate <= 5 && state.round >= 6) {
            state.activeThresholds.push("climate_emergency");
            state.tracks.strain = Math.min(20, state.tracks.strain + 2);
        }
        // dual_power: solidarity >= 18 AND authority <= 5
        if (!state.activeThresholds.includes("dual_power") && state.tracks.solidarity >= 18 && state.tracks.authority <= 5) {
            state.activeThresholds.push("dual_power");
        }
        // fascist_threat: strain >= 16 AND capital >= 15 AND authority >= 12
        if (!state.activeThresholds.includes("fascist_threat") && state.tracks.strain >= 16 && state.tracks.capital >= 15 && state.tracks.authority >= 12) {
            state.activeThresholds.push("fascist_threat");
        }
        // economic_collapse: capital <= 3
        if (!state.activeThresholds.includes("economic_collapse") && state.tracks.capital <= 3) {
            state.activeThresholds.push("economic_collapse");
            state.tracks.strain = Math.min(20, state.tracks.strain + 5);
        }
        // popular_uprising: solidarity >= 18 AND strain >= 15
        if (!state.activeThresholds.includes("popular_uprising") && state.tracks.solidarity >= 18 && state.tracks.strain >= 15) {
            state.activeThresholds.push("popular_uprising");
            state.surge += 5;
        }
        // green_transition: climate >= 18 AND care >= 15
        if (!state.activeThresholds.includes("green_transition") && state.tracks.climate >= 18 && state.tracks.care >= 15) {
            state.activeThresholds.push("green_transition");
            state.tracks.strain = Math.max(0, state.tracks.strain - 2);
        }
        
        if (surgeDelta <= 0 && state.surge > 0) state.surge -= 1;
        surgeDelta = 0;
    }
    
    const t = state.tracks;
    const socialPower = t.care + t.solidarity;
    const elitePower = t.authority + t.capital;
    const powerGap = socialPower - elitePower;
    
    let outcome;
    // Check most restrictive conditions first
    if (t.strain >= 12 && powerGap <= 5) outcome = "SYSTEM COLLAPSE";
    else if (t.strain >= 8 && t.authority >= 10 && t.capital >= 16) outcome = "AUTHORITARIAN CONSOLIDATION";
    else if (t.climate <= 8 && socialPower < 25 && t.strain >= 4) outcome = "ECOLOGICAL CONSTRAINT";
    else if (t.strain < 14 && Math.abs(powerGap) <= 14 && t.care >= 10 && t.climate >= 10) outcome = "MANAGED STABILITY";
    // Check positive endings BEFORE TURBULENT TRANSFORMATION
    else if (t.climate >= 18 && powerGap > 5 && t.strain < 14) outcome = "ECOLOGICAL TRANSITION";
    else if (socialPower >= 24 && powerGap > 3 && t.strain < 16) outcome = "SOCIAL TRANSFORMATION";
    // Part 10: Dual power threshold ending
    else if (state.activeThresholds.includes("dual_power")) outcome = "DUAL POWER TRANSITION";
    // TURBULENT TRANSFORMATION catches remaining high-strain games - tightened
    else if (t.strain >= 18 && powerGap > 5 && socialPower >= 28) outcome = "TURBULENT TRANSFORMATION";
    else outcome = "SYSTEM DRIFT";
    
    return { outcome, tracks: t, pushback: state.pushback.value, surge: state.surge, cardLog };
}

console.log("Running 500 simulations...\n");
const results = [];
for (let i = 0; i < 500; i++) results.push(simulateGame(i));

const outcomes = {};
const cardCount = {};
results.forEach(r => {
    outcomes[r.outcome] = (outcomes[r.outcome] || 0) + 1;
    r.cardLog.forEach(id => cardCount[id] = (cardCount[id] || 0) + 1);
});

const avgTracks = { care: 0, climate: 0, solidarity: 0, authority: 0, capital: 0, strain: 0 };
results.forEach(r => {
    Object.keys(avgTracks).forEach(k => avgTracks[k] += r.tracks[k]);
});
Object.keys(avgTracks).forEach(k => avgTracks[k] = (avgTracks[k] / 500).toFixed(2));

console.log("=".repeat(60));
console.log("OUTCOME DISTRIBUTION:");
Object.entries(outcomes).sort((a, b) => b[1] - a[1]).forEach(([o, c]) => {
    console.log(`  ${o.padEnd(35)} ${c.toString().padStart(4)} (${((c/500)*100).toFixed(1)}%)`);
});

console.log("\nAVERAGE FINAL TRACKS:");
Object.entries(avgTracks).forEach(([k, v]) => console.log(`  ${k.padEnd(15)} ${v}`));

console.log("\nTOP 10 MOST PLAYED CARDS:");
Object.entries(cardCount).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([id, c], i) => {
    const card = baseDeck.find(cd => cd.id == id);
    console.log(`  ${(i+1).toString().padStart(2)}. ${card.title.padEnd(30)} (${id}) - ${c} plays`);
});

console.log("\n" + "=".repeat(60));
