/* ================================================= */
/* SYSTEM SHIFT - TUTORIAL SYSTEM                    */
/* Interactive onboarding and contextual help        */
/* ================================================= */

import { gameState } from "./state.js";
import { getCurrentAct } from "./acts.js";
import { notify } from "./notificationCenter.js";

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.warn("Failed to save tutorial state:", e);
    }
}

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
        message: "These 5 tracks represent your movement's impact. Higher care, climate, and solidarity are good. Lower authority and capital are better. Keep strain low.",
        trigger: "firstRound",
        priority: 2
    },
    {
        id: "strain",
        title: "Strain - System Stress",
        message: "Strain represents stress on the system. High strain can lead to collapse. Watch the strain ring as pressure rises.",
        trigger: "strainWarning",
        priority: 3
    },
    {
        id: "synergy",
        title: "Card Synergies",
        message: "Some cards have synergies. Play cards with matching tags to trigger bonus effects.",
        trigger: "firstSynergy",
        priority: 2
    },
    {
        id: "acts",
        title: "Act Structure",
        message: "The game has 3 acts: Building Movement, Confrontation, and Resolution. Plan your strategy across the arc.",
        trigger: "actTransition",
        priority: 2
    },
    {
        id: "opposition",
        title: "Opposition System",
        message: "Factions oppose your movement. As you gain success, they push back harder.",
        trigger: "firstOpposition",
        priority: 2
    },
    {
        id: "resources",
        title: "Resource Management",
        message: "You have 4 resources: Political, Social, Momentum, and Infrastructure. Spend them wisely for key actions.",
        trigger: "firstResourceUse",
        priority: 2
    }
];

/* ================================================= */
/* CONTEXTUAL TIPS                                  */
/* ================================================= */

export const contextualTips = {
    highStrain: {
        title: "High Strain Warning",
        message: "Strain is high. Consider stabilizing moves before escalation.",
        condition: () => gameState.tracks.strain >= 15
    },
    lowLeverage: {
        title: "Low Leverage",
        message: "Leverage is thin. End the round to recover or play low-cost cards.",
        condition: () => gameState.leverage <= 2
    },
    synergyAvailable: {
        title: "Synergy Opportunity",
        message: "A hand synergy is available if you sequence cards carefully.",
        condition: () => gameState.playerHand.some(card =>
            card.synergy &&
            card.synergy.if_played_this_round.some(tag =>
                gameState.tagsPlayedThisRound.includes(tag)
            )
        )
    },
    actTransition: {
        title: "Act Transition Coming",
        message: "A new act is near. Expect the pressure profile to shift.",
        condition: () => {
            const currentAct = getCurrentAct(gameState.round);
            return currentAct && gameState.round === currentAct.rounds[currentAct.rounds.length - 1];
        }
    },
    resourceLow: {
        title: "Resource Running Low",
        message: "One or more resources are low. Replenish before pushing major actions.",
        condition: () => (
            gameState.resources.political <= 1 ||
            gameState.resources.social <= 1 ||
            gameState.resources.momentum <= 1
        )
    },
    pushbackHigh: {
        title: "High Pushback",
        message: "Pushback is high. Strategic retreat or coalition moves may help.",
        condition: () => gameState.pushback?.value >= 15
    }
};

/* ================================================= */
/* TUTORIAL FUNCTIONS                               */
/* ================================================= */

export function initTutorial() {
    try {
        const savedTutorial = localStorage.getItem("systemShiftTutorial");
        if (savedTutorial) {
            try {
                const saved = JSON.parse(savedTutorial);
                if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
                    if (Array.isArray(saved.completedSteps)) tutorialState.completedSteps = saved.completedSteps;
                    if (Array.isArray(saved.dismissedTips)) tutorialState.dismissedTips = saved.dismissedTips;
                    if (typeof saved.firstTimeUser === 'boolean') tutorialState.firstTimeUser = saved.firstTimeUser;
                    if (typeof saved.showHints === 'boolean') tutorialState.showHints = saved.showHints;
                    if (saved.hintLevel !== undefined) tutorialState.hintLevel = saved.hintLevel;
                    if (typeof saved.enabled === 'boolean') tutorialState.enabled = saved.enabled;
                    if (Number.isFinite(saved.currentStep)) tutorialState.currentStep = saved.currentStep;
                }
            } catch (e) {
                console.warn("Failed to parse tutorial state:", e);
            }
        }
    } catch (e) {
        console.warn("Failed to read tutorial state:", e);
    }

    if (tutorialState.firstTimeUser) {
        setTimeout(() => {
            showTutorialStep("welcome");
        }, 1000);
    }
}

export function showTutorialStep(stepId) {
    const step = tutorialSteps.find(s => s.id === stepId);
    if (!step || tutorialState.completedSteps.includes(stepId)) return;
    if (document.querySelector(".tutorial-modal")) return;

    const modal = document.createElement("div");
    modal.className = "tutorial-modal";
    modal.innerHTML = `
        <div class="tutorial-content">
            <h3>${escapeHtml(step.title)}</h3>
            <p>${escapeHtml(step.message)}</p>
            <div class="tutorial-buttons"></div>
        </div>
    `;

    const buttonContainer = modal.querySelector(".tutorial-buttons");
    const gotItBtn = document.createElement("button");
    gotItBtn.className = "tutorial-btn primary";
    gotItBtn.textContent = "Got it";
    gotItBtn.addEventListener("click", () => {
        modal.remove();
        markTutorialComplete(stepId);
    });

    const skipBtn = document.createElement("button");
    skipBtn.className = "tutorial-btn secondary";
    skipBtn.textContent = "Skip";
    skipBtn.addEventListener("click", () => modal.remove());

    buttonContainer.appendChild(gotItBtn);
    buttonContainer.appendChild(skipBtn);

    document.body.appendChild(modal);
    console.log(`Tutorial shown: ${stepId}`);
}

export function markTutorialComplete(stepId) {
    if (!tutorialState.completedSteps.includes(stepId)) {
        tutorialState.completedSteps.push(stepId);
    }

    safeSetItem("systemShiftTutorial", JSON.stringify(tutorialState));
    console.log(`Tutorial completed: ${stepId}`);
}

export function checkContextualTips() {
    if (!tutorialState.showHints) return;

    Object.entries(contextualTips).forEach(([tipId, tip]) => {
        if (tutorialState.dismissedTips.includes(tipId)) return;

        if (tip.condition()) {
            showContextualTip(tipId, tip);
            tutorialState.dismissedTips.push(tipId);
        }
    });
}

export function showContextualTip(tipId, tip) {
    notify({
        kind: "info",
        title: tip.title,
        message: tip.message,
        duration: 4200
    });
}

export function triggerTutorialEvent(eventType) {
    const step = tutorialSteps.find(s => s.trigger === eventType);
    if (step && !tutorialState.completedSteps.includes(step.id)) {
        showTutorialStep(step.id);
    }
}

export function toggleHints(enabled) {
    tutorialState.showHints = enabled;
    safeSetItem("systemShiftTutorial", JSON.stringify(tutorialState));
}

export function setHintLevel(level) {
    tutorialState.hintLevel = level;
    safeSetItem("systemShiftTutorial", JSON.stringify(tutorialState));
}

export function resetTutorial() {
    tutorialState.completedSteps = [];
    tutorialState.dismissedTips = [];
    tutorialState.firstTimeUser = true;
    safeSetItem("systemShiftTutorial", JSON.stringify(tutorialState));
}

/* ================================================= */
/* TUTORIAL TRIGGERS                                */
/* ================================================= */

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
