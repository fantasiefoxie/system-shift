/* ================================================= */
/* SYSTEM SHIFT – NARRATIVE SYSTEM                  */
/* Story events, flavor text, and emergent narrative */
/* ================================================= */

import { gameState } from "./state.js";
import { getCurrentAct } from "./acts.js";
import { log } from "./logger.js";

/* ================================================= */
/* NARRATIVE STATE                                  */
/* ================================================= */

export const narrativeState = {
    storyBeats: [],
    characterArcs: {},
    factionRelations: {
        elite: 0,
        authoritarian: 0,
        statusquo: 0
    },
    historicalEvents: [],
    currentNarrative: null,
    narrativeChoices: []
};

/* ================================================= */
/* STORY BEATS                                      */
/* ================================================= */

export const storyBeats = {
    // Act 1: Building Movement
    act1_start: {
        id: "act1_start",
        act: 1,
        title: "The Movement Begins",
        description: "You've emerged as a voice for change. The old order watches with curiosity - and concern.",
        choices: [
            { text: "Build grassroots support", effect: { solidarity: 1 } },
            { text: "Seek institutional allies", effect: { authority: -1 } }
        ]
    },
    act1_mid: {
        id: "act1_mid",
        act: 1,
        title: "Growing Momentum",
        description: "Your movement gains visibility. People are listening, but so are those who benefit from the status quo.",
        choices: [
            { text: "Push for rapid change", effect: { surge: 1, strain: 1 } },
            { text: "Build careful consensus", effect: { solidarity: 1 } }
        ]
    },
    act1_end: {
        id: "act1_end",
        act: 1,
        title: "First Resistance",
        description: "The establishment has noticed. Elite interests begin to organize against your movement.",
        choices: [
            { text: "Prepare for confrontation", effect: { surge: 1 } },
            { text: "Seek compromise", effect: { capital: -1 } }
        ]
    },
    
    // Act 2: Confrontation
    act2_start: {
        id: "act2_start",
        act: 2,
        title: "Elite Counterattack",
        description: "Capital interests launch a coordinated campaign against your reforms. Media, money, and power align against you.",
        choices: [
            { text: "Fight fire with fire", effect: { strain: 2, surge: 1 } },
            { text: "Maintain moral high ground", effect: { solidarity: 1 } }
        ]
    },
    act2_mid: {
        id: "act2_mid",
        act: 2,
        title: "Authoritarian Threat",
        description: "Government surveillance increases. Authorities label your movement a threat to stability.",
        choices: [
            { text: "Go underground", effect: { strain: 1 } },
            { text: "Public defiance", effect: { surge: 1, strain: 1 } }
        ]
    },
    act2_end: {
        id: "act2_end",
        act: 2,
        title: "Critical Juncture",
        description: "The system is at breaking point. Your next moves will determine whether transformation happens - or revolution.",
        choices: [
            { text: "Push for revolution", effect: { surge: 2, strain: 3 } },
            { text: "Negotiate transition", effect: { authority: -1, capital: -1 } }
        ]
    },
    
    // Act 3: Resolution
    act3_start: {
        id: "act3_start",
        act: 3,
        title: "Final Push",
        description: "The old order crumbles. Your movement stands at the threshold of transformation.",
        choices: [
            { text: "Sweep away the old", effect: { surge: 2, strain: 2 } },
            { text: "Build bridges", effect: { solidarity: 1, care: 1 } }
        ]
    },
    act3_mid: {
        id: "act3_mid",
        act: 3,
        title: "New Society Emerging",
        description: "A new world takes shape. But with new power comes new challenges and responsibilities.",
        choices: [
            { text: "Consolidate power", effect: { authority: 1 } },
            { text: "Distribute power", effect: { solidarity: 1 } }
        ]
    },
    act3_end: {
        id: "act3_end",
        act: 3,
        title: "Legacy",
        description: "Your movement has changed society. What kind of world have you created?",
        choices: [
            { text: "A just society", effect: { care: 2, solidarity: 1 } },
            { text: "A sustainable world", effect: { climate: 2 } }
        ]
    }
};

/* ================================================= */
/* CARD FLAVOR TEXT                                 */
/* ================================================= */

export const cardFlavorText = {
    // Care Cards
    101: "In the poorest neighborhoods, a clinic opens its doors. No one turned away.",
    102: "Universal benefits aren't charity - they're recognition that we all rise together.",
    103: "Healthcare for all isn't radical - it's civilized. Every other wealthy nation does it.",
    104: "Empty bellies can't fight for justice. Feed the people, empower the movement.",
    105: "Mental health isn't weakness. It's the foundation of a resilient society.",
    106: "Retirement shouldn't be a privilege. It's a promise to those who built the world.",
    107: "Childcare isn't a women's issue - it's an economic necessity and a moral imperative.",
    108: "Hospitals shouldn't be profit centers. They should be temples of healing.",
    109: "Every worker deserves to come home alive. Safety isn't negotiable.",
    110: "When disaster strikes, we don't ask for ID. We help. That's who we are.",
    
    // Climate Cards
    201: "One tree won't save the world. But a million trees? That's a forest. That's hope.",
    202: "Public transit isn't just efficient - it's democratic. Everyone gets to move.",
    203: "Fossil fuels made us rich. Now they'll make us extinct. Time to exit.",
    204: "Green spaces in cities aren't luxuries - they're lungs for concrete jungles.",
    205: "Clean water isn't a commodity. It's a right. Period.",
    206: "The sun doesn't send a bill. The wind doesn't send an invoice. Renewable energy is freedom.",
    207: "We're drowning in plastic. Time to ban the poison and embrace alternatives.",
    208: "Industrial agriculture feeds corporations. Sustainable farming feeds communities.",
    209: "The climate doesn't negotiate. Neither should we. Radical action now.",
    210: "Rewilding isn't giving up land - it's giving back life.",
    
    // Solidarity Cards
    301: "Democracy isn't voting every few years. It's deciding together, every day.",
    302: "Unions built the middle class. They'll rebuild it again.",
    303: "A general strike isn't chaos - it's organized power refusing to cooperate.",
    304: "Public forums aren't just meetings - they're where democracy lives.",
    305: "Union membership isn't declining - it's being suppressed. Time to expand.",
    306: "Corporate media tells corporate stories. Community media tells ours.",
    307: "Housing shouldn't be an investment vehicle. It should be a home.",
    308: "Participatory budgets aren't experimental - they're how democracy should work.",
    309: "Grassroots campaigns don't have corporate sponsors. They have people.",
    310: "Petitions alone don't change laws. But movements that petition do.",
    
    // Authority Cards
    401: "Sunlight is the best disinfectant. Transparency kills corruption.",
    402: "Corruption isn't inevitable - it's a choice. We choose differently.",
    403: "Centralized power concentrates abuse. Decentralization distributes justice.",
    404: "Civic oversight isn't bureaucracy - it's democracy in action.",
    405: "Justice shouldn't be blind - it should be awake, aware, and accountable.",
    406: "Open data isn't just transparency - it's empowerment.",
    407: "Whistleblowers aren't traitors - they're patriots exposing treason.",
    408: "Electoral reform isn't partisan - it's democratic.",
    409: "Civil liberties aren't obstacles - they're foundations.",
    410: "Term limits aren't restrictions - they're renewals.",
    
    // Capital Cards
    501: "Progressive taxation isn't punishment - it's investment in civilization.",
    502: "Corporations aren't people. They don't get human rights.",
    503: "Public banks don't gamble with your money. They invest in your community.",
    504: "Minimum wage isn't a starting point - it's a floor below which no one falls.",
    505: "Debt relief isn't forgiveness - it's recognition that the system was rigged.",
    506: "Wealth transparency isn't invasion - it's accountability.",
    507: "Capital controls aren't restrictions - they're stability.",
    508: "Cooperative investment isn't charity - it's ownership.",
    509: "Monopolies aren't efficient - they're tyrannical.",
    510: "Public infrastructure isn't spending - it's investing in our shared future.",
    
    // System Cards
    901: "Emergency spending isn't reckless - it's necessary when the system fails.",
    902: "Security crackdowns don't create safety - they create fear.",
    903: "Capital injections don't fix inequality - they entrench it.",
    904: "National referendums aren't chaos - they're democracy at scale.",
    
    // Risk Cards
    601: "High-stakes gambling isn't strategy - it's desperation. But sometimes desperation wins.",
    602: "Revolutionary uprisings aren't planned - they're inevitable when injustice becomes unbearable.",
    603: "Market crashes aren't natural disasters - they're systemic failures.",
    604: "Political scandals aren't distractions - they're revelations.",
    605: "Climate emergencies aren't future problems - they're present realities.",
    606: "Economic booms aren't permanent - they're cycles. Enjoy the peak while it lasts.",
    
    // Hidden Cards
    701: "Unknown policies hide unknown consequences. Proceed with caution.",
    702: "Secret initiatives create secret enemies. Transparency is safer.",
    703: "Covert operations have overt blowback. Consider the costs.",
    704: "Wildcards can change everything - or nothing. That's the gamble."
};

/* ================================================= */
/* TRACK NARRATIVE CONTEXT                          */
/* ================================================= */

export const trackNarrative = {
    care: {
        low: "Healthcare and social services crumble. The vulnerable suffer in silence.",
        medium: "Basic needs are met, but the system struggles to keep up with demand.",
        high: "Universal care becomes reality. No one left behind.",
        critical: "Healthcare collapse imminent. The social contract is breaking."
    },
    climate: {
        low: "Environmental destruction accelerates. The planet's fever rises.",
        medium: "Climate action begins, but progress is slow and fragile.",
        high: "Green transformation gains momentum. Hope for the future grows.",
        critical: "Climate tipping points approached. Time is running out."
    },
    solidarity: {
        low: "People divided and conquered. Isolation and fear dominate.",
        medium: "Community bonds strengthen. Collective action becomes possible.",
        high: "Mass movement forms. Power of the people becomes undeniable.",
        critical: "Revolutionary potential realized. Society stands at crossroads."
    },
    authority: {
        low: "Democratic reforms take hold. Power becomes more accountable.",
        medium: "Tension between reform and tradition. The old order resists.",
        high: "Authoritarian crackdown. Dissent becomes dangerous.",
        critical: "Police state emerges. Freedom becomes memory."
    },
    capital: {
        low: "Wealth redistributed. Economic justice becomes reality.",
        medium: "Economic reforms challenge old hierarchies. Resistance grows.",
        high: "Capital concentration accelerates. Inequality becomes entrenched.",
        critical: "Oligarchy solidifies. Democracy becomes plutocracy."
    },
    strain: {
        low: "System stable. Reform possible within existing structures.",
        medium: "Tensions rise. The system creaks under pressure.",
        high: "System stressed. Cracks appear in the old order.",
        critical: "System breaking. Transformation or collapse imminent."
    }
};

/* ================================================= */
/* NARRATIVE FUNCTIONS                              */
/* ================================================= */

export function initNarrative() {
    // Load saved narrative state
    const saved = localStorage.getItem('systemShiftNarrative');
    if (saved) {
        Object.assign(narrativeState, JSON.parse(saved));
    }
    
    // Trigger opening narrative
    triggerStoryBeat("act1_start");
    
    log("NARRATIVE_INITIALIZED", {});
}

export function triggerStoryBeat(beatId) {
    const beat = storyBeats[beatId];
    if (!beat) return;
    
    // Don't repeat story beats
    if (narrativeState.storyBeats.includes(beatId)) return;
    
    narrativeState.storyBeats.push(beatId);
    narrativeState.currentNarrative = beat;
    
    // Show narrative modal
    showNarrativeModal(beat);
    
    log("STORY_BEAT_TRIGGERED", { beatId, title: beat.title });
    
    // Save state
    saveNarrativeState();
}

export function showNarrativeModal(beat) {
    const modal = document.createElement('div');
    modal.className = 'narrative-modal';
    modal.innerHTML = `
        <div class="narrative-content">
            <h3>${beat.title}</h3>
            <p>${beat.description}</p>
            <div class="narrative-choices">
                ${beat.choices.map((choice, index) => `
                    <button class="narrative-choice" data-choice="${index}">
                        ${choice.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelectorAll('.narrative-choice').forEach(btn => {
        btn.addEventListener('click', () => {
            const choiceIndex = parseInt(btn.dataset.choice);
            applyNarrativeChoice(beat, beat.choices[choiceIndex]);
            modal.remove();
        });
    });
}

export function applyNarrativeChoice(beat, choice) {
    // Apply effects
    for (let [key, value] of Object.entries(choice.effect)) {
        if (key === "surge") {
            gameState.surge += value;
        } else if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += value;
            if (key === "authority" || key === "capital") {
                gameState.tracks[key] = Math.max(0, gameState.tracks[key]);
            } else {
                gameState.tracks[key] = Math.max(0, Math.min(20, gameState.tracks[key]));
            }
        }
    }
    
    // Record choice
    narrativeState.narrativeChoices.push({
        beatId: beat.id,
        choice: choice.text,
        effects: choice.effect
    });
    
    log("NARRATIVE_CHOICE_APPLIED", { 
        beat: beat.title, 
        choice: choice.text, 
        effects: choice.effect 
    });
    
    saveNarrativeState();
}

export function getTrackNarrative(track, value) {
    const narrative = trackNarrative[track];
    if (!narrative) return "";
    
    if (value <= 4) return narrative.low;
    if (value <= 10) return narrative.medium;
    if (value <= 16) return narrative.high;
    return narrative.critical;
}

export function getCardFlavor(cardId) {
    return cardFlavorText[cardId] || "";
}

export function checkNarrativeTriggers() {
    const currentAct = getCurrentAct(gameState.round);
    if (!currentAct) return;
    
    // Check for act transitions
    const actStartBeat = `act${currentAct.act}_start`;
    const actMidBeat = `act${currentAct.act}_mid`;
    const actEndBeat = `act${currentAct.act}_end`;
    
    // Trigger act start
    if (gameState.round === currentAct.rounds[0] && 
        !narrativeState.storyBeats.includes(actStartBeat)) {
        triggerStoryBeat(actStartBeat);
    }
    
    // Trigger act mid
    const midRound = currentAct.rounds[Math.floor(currentAct.rounds.length / 2)];
    if (gameState.round === midRound && 
        !narrativeState.storyBeats.includes(actMidBeat)) {
        triggerStoryBeat(actMidBeat);
    }
    
    // Trigger act end
    if (gameState.round === currentAct.rounds[currentAct.rounds.length - 1] && 
        !narrativeState.storyBeats.includes(actEndBeat)) {
        triggerStoryBeat(actEndBeat);
    }
    
    // Check for critical track states
    Object.entries(gameState.tracks).forEach(([track, value]) => {
        if (value >= 18 && !narrativeState.historicalEvents.includes(`${track}_critical`)) {
            narrativeState.historicalEvents.push(`${track}_critical`);
            log("CRITICAL_TRACK_EVENT", { track, value });
        }
    });
}

export function saveNarrativeState() {
    try {
        localStorage.setItem('systemShiftNarrative', JSON.stringify(narrativeState));
    } catch (e) {
        console.warn("Failed to save narrative state:", e);
    }
}

export function getNarrativeSummary() {
    return {
        storyBeats: narrativeState.storyBeats.length,
        choices: narrativeState.narrativeChoices.length,
        historicalEvents: narrativeState.historicalEvents.length,
        currentNarrative: narrativeState.currentNarrative?.title || "None"
    };
}