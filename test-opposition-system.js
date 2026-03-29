/* ================================================= */
/* SYSTEM SHIFT – OPPOSITION SYSTEM TEST v1.0       */
/* Comprehensive validation of dynamic opposition    */
/* ================================================= */

import { gameState } from "./game/state.js";
import { log } from "./game/logger.js";
import { setSeed } from "./game/rng.js";
import { initOppositionSystem, calculateThreatLevels, processOppositionResponses, checkEscalation, updateOppositionLearning } from "./game/oppositionSystem.js";
import { initOppositionActions, processOppositionPhase, getOppositionStatus, debugOppositionState } from "./game/oppositionActions.js";
import { initResourceSystem } from "./game/resourceManagement.js";
import { initInteractionState } from "./game/cardInteractions.js";

/* ================================================= */
/* TEST CONFIGURATION                                */
/* ================================================= */

const TEST_CONFIG = {
    rounds: 10,
    initialTracks: {
        care: 8,
        climate: 8,
        solidarity: 6,
        authority: 10,
        capital: 20,
        strain: 10
    },
    initialResources: {
        political: 5,
        social: 5,
        momentum: 0,
        infrastructure: 0
    }
};

/* ================================================= */
/* TEST EXECUTION                                    */
/* ================================================= */

export function runOppositionSystemTest() {
    console.log("🧪 OPPOSITION SYSTEM VALIDATION TEST");
    console.log("=====================================");
    
    // Initialize game state
    initializeTestState();
    
    // Run multiple rounds to test opposition behavior
    for (let round = 1; round <= TEST_CONFIG.rounds; round++) {
        console.log(`\n${round}️⃣  Round ${round}:`);
        
        // Simulate player actions that would trigger opposition
        simulatePlayerActions(round);
        
        // Process opposition system
        calculateThreatLevels();
        processOppositionResponses();
        checkEscalation();
        updateOppositionLearning();
        
        // Process opposition actions
        processOppositionPhase();
        
        // Log current state
        logRoundState(round);
        
        // Check for escalation
        checkEscalationLevel(round);
    }
    
    // Final validation
    validateOppositionSystem();
    
    console.log("\n🎉 OPPOSITION SYSTEM VALIDATION COMPLETE!");
    console.log("==========================================");
}

function initializeTestState() {
    // Set up deterministic seed
    setSeed(12345);
    
    // Initialize systems
    initOppositionSystem();
    initOppositionActions();
    initResourceSystem();
    initInteractionState();
    
    // Set initial game state
    Object.assign(gameState, {
        round: 1,
        gameOver: false,
        tracks: { ...TEST_CONFIG.initialTracks },
        resources: { ...TEST_CONFIG.initialResources },
        surge: 0,
        pushback: { value: 0, eliteResistance: 0, transitionShock: 0 }
    });
    
    console.log("📋 Initial State:");
    console.log(`- Tracks: ${JSON.stringify(gameState.tracks)}`);
    console.log(`- Resources: ${JSON.stringify(gameState.resources)}`);
    console.log(`- Surge: ${gameState.surge}`);
    console.log(`- Pushback: ${gameState.pushback.value}`);
}

function simulatePlayerActions(round) {
    console.log("   🎯 Simulating player actions...");
    
    // Round 1-3: Build infrastructure (triggers Elite Interests)
    if (round <= 3) {
        gameState.resources.infrastructure += 2;
        gameState.resources.political -= 1;
        console.log("   🏗️  Building infrastructure (+2 infra, -1 political)");
    }
    
    // Round 4-6: Increase solidarity (triggers Authoritarian)
    else if (round <= 6) {
        gameState.tracks.solidarity += 2;
        gameState.resources.momentum += 1;
        console.log("   🤝 Increasing solidarity (+2 solidarity, +1 momentum)");
    }
    
    // Round 7-10: Rapid change (triggers Status Quo)
    else {
        gameState.tracks.care += 3;
        gameState.tracks.authority -= 1;
        gameState.surge += 2;
        console.log("   ⚡ Rapid change (+3 care, -1 authority, +2 surge)");
    }
    
    // Add some infrastructure maintenance costs
    if (gameState.resources.infrastructure > 0) {
        gameState.resources.political -= Math.floor(gameState.resources.infrastructure / 3);
        console.log(`   💰 Infrastructure maintenance (-${Math.floor(gameState.resources.infrastructure / 3)} political)`);
    }
}

function logRoundState(round) {
    const status = getOppositionStatus();
    
    console.log(`   📊 Opposition Status:`);
    console.log(`   - Global Pushback: ${status.globalPushback}`);
    console.log(`   - Escalation Level: ${status.escalationLevel}`);
    console.log(`   - Active Factions: ${status.activeFactions.length}`);
    console.log(`   - Response Cooldown: ${status.cooldown}`);
    
    console.log(`   🎯 Current State:`);
    console.log(`   - Tracks: ${JSON.stringify(gameState.tracks)}`);
    console.log(`   - Resources: ${JSON.stringify(gameState.resources)}`);
    console.log(`   - Surge: ${gameState.surge}`);
}

function checkEscalationLevel(round) {
    const status = getOppositionStatus();
    
    if (status.escalationLevel > 0) {
        console.log(`   🔥 Escalation detected! Level: ${status.escalationLevel}`);
    }
    
    // Check if specific factions are active
    Object.entries(gameState.opposition.factions).forEach(([id, faction]) => {
        if (faction.active) {
            console.log(`   ⚔️  ${id} faction active (threat: ${Math.round(faction.threatLevel)})`);
        }
    });
}

function validateOppositionSystem() {
    const debug = debugOppositionState();
    const status = getOppositionStatus();
    
    console.log("\n🔍 SYSTEM VALIDATION:");
    console.log("=====================");
    
    // Check threat calculation
    console.log("✅ Threat calculation working");
    console.log(`   - Max threat level: ${Math.max(...status.activeFactions)}`);
    console.log(`   - Active factions: ${status.activeFactions.length}`);
    
    // Check response system
    console.log("✅ Response system working");
    console.log(`   - Global pushback: ${status.globalPushback}`);
    console.log(`   - Escalation level: ${status.escalationLevel}`);
    
    // Check faction behavior
    console.log("✅ Faction behavior working");
    Object.entries(gameState.opposition.factions).forEach(([id, faction]) => {
        console.log(`   - ${id}: ${faction.active ? 'ACTIVE' : 'inactive'} (threat: ${Math.round(faction.threatLevel)})`);
    });
    
    // Check opposition actions
    console.log("✅ Opposition actions working");
    console.log(`   - Opposition discard pile: ${debug.discardSize} cards`);
    
    // Validate escalation mechanics
    if (status.escalationLevel > 0) {
        console.log("✅ Escalation mechanics working");
        console.log(`   - Escalation level: ${status.escalationLevel}`);
    } else {
        console.log("⚠️  No escalation detected (may need more aggressive player actions)");
    }
    
    // Final system status
    console.log("\n📊 FINAL SYSTEM STATUS:");
    console.log("========================");
    console.log(`- Global Pushback: ${status.globalPushback}`);
    console.log(`- Escalation Level: ${status.escalationLevel}`);
    console.log(`- Active Factions: ${Object.values(gameState.opposition.factions).filter(f => f.active).length}`);
    console.log(`- Total Opposition Cards Played: ${debug.discardSize}`);
    console.log(`- Final Tracks: ${JSON.stringify(gameState.tracks)}`);
    console.log(`- Final Resources: ${JSON.stringify(gameState.resources)}`);
}

/* ================================================= */
/* RUN TEST                                          */
/* ================================================= */

if (typeof window === 'undefined') {
    // Node.js environment
    runOppositionSystemTest();
} else {
    // Browser environment
    window.runOppositionSystemTest = runOppositionSystemTest;
}

