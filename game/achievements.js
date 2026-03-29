/* ================================================= */
/* SYSTEM SHIFT – ACHIEVEMENTS SYSTEM               */
/* Meta-progression: achievements + unlocks          */
/* ================================================= */

import { log } from "./logger.js";

/* ================================================= */
/* ACHIEVEMENT DEFINITIONS                          */
/* ================================================= */

export const achievements = [
    {
        id: "first_win",
        name: "First Steps",
        desc: "Win your first game",
        condition: s => s.wins >= 1
    },
    {
        id: "five_wins",
        name: "Veteran",
        desc: "Win 5 games",
        condition: s => s.wins >= 5
    },
    {
        id: "transformation",
        name: "True Transformation",
        desc: "Achieve Social Transformation",
        condition: s => (s.endingCounts["SOCIAL TRANSFORMATION"] || 0) >= 1
    },
    {
        id: "ecological",
        name: "Green Future",
        desc: "Achieve Ecological Transition",
        condition: s => (s.endingCounts["ECOLOGICAL TRANSITION"] || 0) >= 1
    },
    {
        id: "dual_power",
        name: "Dual Power",
        desc: "Achieve Dual Power Transition",
        condition: s => (s.endingCounts["DUAL POWER TRANSITION"] || 0) >= 1
    },
    {
        id: "all_endings",
        name: "Historian",
        desc: "Reach all 7 ending types",
        condition: s => Object.keys(s.endingCounts).length >= 7
    },
    {
        id: "speedrun",
        name: "Swift Movement",
        desc: "Win in 7 rounds or fewer",
        condition: s => s.fastestWin !== null && s.fastestWin <= 7
    },
    {
        id: "ten_games",
        name: "Committed",
        desc: "Play 10 games",
        condition: s => s.games >= 10
    },
    {
        id: "hard_win",
        name: "Against All Odds",
        desc: "Win on Hard difficulty",
        condition: s => (s.hardWins || 0) >= 1
    },
    {
        id: "negotiator",
        name: "Diplomat",
        desc: "Successfully negotiate 5 times",
        condition: s => (s.successfulNegotiations || 0) >= 5
    }
];

const UNLOCKS_KEY = "systemshift_unlocks";

const defaultUnlocks = {
    achievements: {},
    unlockedCards: [],
    unlockedArchetypes: []
};

/* ================================================= */
/* GET UNLOCKS                                      */
/* ================================================= */

export function getUnlocks() {
    try {
        const data = localStorage.getItem(UNLOCKS_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.warn("Failed to load unlocks:", e);
    }
    return { ...defaultUnlocks };
}

/* ================================================= */
/* CHECK ACHIEVEMENTS                               */
/* ================================================= */

export function checkAchievements(stats) {
    const unlocks = getUnlocks();
    const newlyUnlocked = [];
    
    achievements.forEach(achievement => {
        // Skip if already unlocked
        if (unlocks.achievements[achievement.id]) return;
        
        // Check condition
        if (achievement.condition(stats)) {
            unlocks.achievements[achievement.id] = {
                unlockedAt: new Date().toISOString()
            };
            newlyUnlocked.push(achievement);
            
            log("ACHIEVEMENT_UNLOCKED", {
                id: achievement.id,
                name: achievement.name
            });
        }
    });
    
    // Save if any new achievements
    if (newlyUnlocked.length > 0) {
        try {
            localStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks));
        } catch (e) {
            console.warn("Failed to save unlocks:", e);
        }
    }
    
    return newlyUnlocked;
}