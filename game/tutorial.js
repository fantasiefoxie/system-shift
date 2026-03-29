/* ================================================= */
/* SYSTEM SHIFT – TUTORIAL SYSTEM                   */
/* Interactive onboarding and contextual help        */
/* ================================================= */

import { gameState } from "./state.js";
import { getCurrentAct } from "./acts.js";

/* ================================================= */
/* TUTORIAL STATE                                   */
/* ================================================= */

export const tutorialState = {
    enabled: true,
    currentStep: 0,
    completedSteps: [],
    dismissedTips: [],
    firstTimeUser: true,
    showHints: true,
    hintLevel: "normal" // "minimal", "normal", "detailed"
};

/* ================================================= */
/* TUTORIAL STEPS                                   */
/* ================================================= */

export const tutorialSteps = [
    {
        id: "welcome",
        title: "Welcome to System Shift",
        message: "You are a movement leader trying to transform society. Play cards to build care, climate action, solidarity, and reduce authority and capital concentration.",
        trigger: "gameStart",
        priority: 1
    },
    {
        id: "leverage",
        title: "Leverage - Your Political Capital",
        message: "Leverage is your ability to play cards. Each card costs leverage to play. You recover leverage each round.",
        trigger: "firstCardPlay",
        priority: 2
    },
    {
        id: "tracks",
        title: "Track System",
        message: "These 5 tracks represent your movement's impact. Higher care, climate, and solidarity are good. Lower authority and capital are better. Keep strain low!",
        trigger: "firstRound",
        priority: 2
    },
    {
        id: "strain",
        title: "Strain - System Stress",
        message: "Strain represents stress on the system. If strain reaches 20, you lose! Watch the strain ring - it turns red when dangerous.",
        trigger: "strainWarning",
        priority: 3
    },
    {
        id: "synergy",
        title: "Card Synergies",
        message: "Some cards have synergies! Play cards with matching tags to trigger bonus effects. Look for the synergy description on cards.",
        trigger: "firstSynergy",
        priority: 2
    },
    {
        id: "acts",
        title: "Act Structure",
        message: "The game has 3 acts: Building Movement (safe), Confrontation (challenging), and Resolution (high stakes). Plan your strategy accordingly!",
        trigger: "actTransition",
        priority: 2
    },
    {
        id: "opposition",
        title: "Opposition System",
        message: "Factions oppose your movement. As you gain success, they push back harder. Manage their resistance through careful strategy.",
        trigger: "firstOpposition",
        priority: 2
    },
    {
        id: "resources",
        title: "Resource Management",
        message: "You have 4 resources: Political, Social, Momentum, and Infrastructure. Spend them wisely - they're needed for powerful actions!",
        trigger: "firstResourceUse",
        priority: 2
    }
];

/* ================================================= */
/* CONTEXTUAL TIPS                                  */
/* ================================================= */

export const contextualTips = {
    highStrain: {
        title: "High Strain Warning!",
        message: "Strain is getting high. Consider playing cards that reduce strain or avoid disruptive actions.",
        condition: () => gameState.tracks.strain >= 15
    },
    lowLeverage: {
        title: "Low Leverage",
        message: "You're running low on leverage. End the round to recover, or play low-cost cards.",
        condition: () => gameState.leverage <= 2
    },
    synergyAvailable: {
        title: "Synergy Opportunity!",
        message: "You have cards that could trigger synergies! Look for matching tags.",
        condition: () => {
            // Check if any card in hand has synergy and matching tags exist
            return gameState.playerHand.some(card => 
                card.synergy && 
                card.synergy.if_played_this_round.some(tag => 
                    gameState.tagsPlayedThisRound.includes(tag)
                )
            );
        }
    },
    actTransition: {
        title: "Act Transition Coming",
        message: "The game is about to enter a new act. Expect changes in difficulty and opposition!",
        condition: () => {
            const currentAct = getCurrentAct(gameState.round);
            return currentAct && gameState.round === currentAct.rounds[currentAct.rounds.length - 1];
        }
    },
    resourceLow: {
        title: "Resource Running Low",
        message: "One of your resources is getting low. Consider actions that replenish it.",
        condition: () => {
            return gameState.resources.political <= 1 || 
                   gameState.resources.social <= 1 ||
                   gameState.resources.momentum <= 1;
        }
    },
    pushbackHigh: {
        title: "High Pushback",
        message: "Pushback is high! Opposition is strong. Consider strategic retreats or alliance building.",
        condition: () => gameState.pushback?.value >= 15
    }
};

/* ================================================= */
/* TUTORIAL FUNCTIONS                               */
/* ================================================= */

export function initTutorial() {
    // Check if user has completed tutorial before
    const savedTutorial = localStorage.getItem('systemShiftTutorial');
    if (savedTutorial) {
        try {
            const saved = JSON.parse(savedTutorial);
            Object.assign(tutorialState, saved);
        } catch (e) {
            console.warn("Failed to parse tutorial state:", e);
        }
    }
    
    // Show welcome message for new users
    if (tutorialState.firstTimeUser) {
        setTimeout(() => {
            showTutorialStep("welcome");
        }, 1000);
    }
}

export function showTutorialStep(stepId) {
    const step = tutorialSteps.find(s => s.id === stepId);
    if (!step || tutorialState.completedSteps.includes(stepId)) return;
    
    // Show tutorial modal
    const modal = document.createElement('div');
    modal.className = 'tutorial-modal';
    modal.innerHTML = `
        <div class="tutorial-content">
            <h3>${step.title}</h3>
            <p>${step.message}</p>
            <div class="tutorial-buttons">
                <button class="tutorial-btn primary" onclick="this.closest('.tutorial-modal').remove(); markTutorialComplete('${stepId}')">
                    Got it!
                </button>
                <button class="tutorial-btn secondary" onclick="this.closest('.tutorial-modal').remove()">
                    Skip
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Log tutorial shown
    console.log(`Tutorial shown: ${stepId}`);
}

export function markTutorialComplete(stepId) {
    if (!tutorialState.completedSteps.includes(stepId)) {
        tutorialState.completedSteps.push(stepId);
    }
    
    // Save to localStorage
    localStorage.setItem('systemShiftTutorial', JSON.stringify(tutorialState));
    
    console.log(`Tutorial completed: ${stepId}`);
}

export function checkContextualTips() {
    if (!tutorialState.showHints) return;
    
    // Check each contextual tip
    Object.entries(contextualTips).forEach(([tipId, tip]) => {
        if (tutorialState.dismissedTips.includes(tipId)) return;
        
        if (tip.condition()) {
            showContextualTip(tipId, tip);
            tutorialState.dismissedTips.push(tipId);
        }
    });
}

export function showContextualTip(tipId, tip) {
    // Show non-intrusive tip
    const tipElement = document.createElement('div');
    tipElement.className = 'contextual-tip';
    tipElement.innerHTML = `
        <div class="tip-header">
            <span class="tip-icon">💡</span>
            <span class="tip-title">${tip.title}</span>
            <button class="tip-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="tip-message">${tip.message}</div>
    `;
    
    document.body.appendChild(tipElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (tipElement.parentNode) {
            tipElement.remove();
        }
    }, 5000);
}

export function triggerTutorialEvent(eventType) {
    const step = tutorialSteps.find(s => s.trigger === eventType);
    if (step && !tutorialState.completedSteps.includes(step.id)) {
        showTutorialStep(step.id);
    }
}

export function toggleHints(enabled) {
    tutorialState.showHints = enabled;
    localStorage.setItem('systemShiftTutorial', JSON.stringify(tutorialState));
}

export function setHintLevel(level) {
    tutorialState.hintLevel = level;
    localStorage.setItem('systemShiftTutorial', JSON.stringify(tutorialState));
}

export function resetTutorial() {
    tutorialState.completedSteps = [];
    tutorialState.dismissedTips = [];
    tutorialState.firstTimeUser = true;
    localStorage.setItem('systemShiftTutorial', JSON.stringify(tutorialState));
}

/* ================================================= */
/* TUTORIAL TRIGGERS                                */
/* ================================================= */

// Call these from main game code at appropriate moments
export function onGameStart() {
    triggerTutorialEvent("gameStart");
}

export function onFirstCardPlay() {
    triggerTutorialEvent("firstCardPlay");
}

export function onFirstRound() {
    triggerTutorialEvent("firstRound");
}

export function onStrainWarning() {
    triggerTutorialEvent("strainWarning");
}

export function onFirstSynergy() {
    triggerTutorialEvent("firstSynergy");
}

export function onActTransition() {
    triggerTutorialEvent("actTransition");
}

export function onFirstOpposition() {
    triggerTutorialEvent("firstOpposition");
}

export function onFirstResourceUse() {
    triggerTutorialEvent("firstResourceUse");
}