/* ================================================= */
/* SYSTEM SHIFT – ROUND ENGINE (v9 FINAL HARDENED)  */
/* Structural Strain + Surge + Pushback 2.2         */
/* Fully Safe + Stable + Deterministic              */
/* ================================================= */

import { gameState } from "./state.js";
import { log } from "./logger.js";
import { resetInteractionState } from "./cardInteractions.js";
import { 
    initResourceSystem, 
    applyResourceRecovery, 
    resetResourceState,
    processDelayedEffects 
} from "./resourceManagement.js";
import {
    initOppositionSystem,
    calculateThreatLevels,
    processOppositionResponses,
    checkEscalation,
    updateOppositionLearning,
    resetOppositionState
} from "./oppositionSystem.js";
import {
    initOppositionActions,
    processOppositionPhase
} from "./oppositionActions.js";
import { getCurrentAct } from "./acts.js";
import { addCardToDeck, removeCardFromDeck, removeCardsByTag } from "./deck.js";
import { updateHiddenTracks } from "./hiddenTracks.js";
import { checkMemory } from "./memory.js";
import { checkThresholds } from "./thresholds.js";

/* Track surge changes within round */
let surgeDeltaThisRound = 0;

/* ================================================= */
/* PLAY CARD                                        */
/* ================================================= */

export function playCard(index) {

    if (gameState.playsThisRound >= gameState.maxPlaysPerRound) return;

    const card = gameState.playerHand[index];
    if (!card) return;

    const cost = Number(card.cost) || 0;

    if (gameState.leverage < cost) {
        log("PLAY_FAILED_NOT_ENOUGH_LEVERAGE", {
            required: cost,
            available: gameState.leverage
        });
        return;
    }

    gameState.leverage -= cost;

    log("CARD_PLAYED", {
        id: card.id,
        cost
    });

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

    applyEffects(card.effects || {});

    // Execute onPlay deck modifications
    if (card.onPlay) {
        if (card.onPlay.addCard) {
            addCardToDeck(card.onPlay.addCard);
        }
        if (card.onPlay.removeCard) {
            removeCardFromDeck(card.onPlay.removeCard);
        }
        if (card.onPlay.removeTag) {
            removeCardsByTag(card.onPlay.removeTag);
        }
    }

    /* Structural surge bonus */
    if (card.suit === "authority" || card.suit === "solidarity") {
        gameState.surge += 1;
        surgeDeltaThisRound += 1;
    }

    // Track card in memory (Part 9)
    gameState.memory.cardsPlayed.push(card);
    gameState.memory.maxCare = Math.max(gameState.memory.maxCare, gameState.tracks.care);
    gameState.memory.maxClimate = Math.max(gameState.memory.maxClimate, gameState.tracks.climate);

    gameState.discardPile.push(card);
    gameState.playerHand.splice(index, 1);
    gameState.playsThisRound += 1;
}

/* ================================================= */
/* APPLY EFFECTS                                    */
/* ================================================= */

function applyEffects(effects) {

    for (let key in effects) {

        const value = Number(effects[key]) || 0;
        if (value === 0) continue;

        if (key === "surge") {
            gameState.surge += value;
            surgeDeltaThisRound += value;
            continue;
        }

        if (gameState.tracks[key] !== undefined) {
            gameState.tracks[key] += value;
            if (key === "authority" || key === "capital") {
                gameState.tracks[key] = Math.max(0, gameState.tracks[key]);
            }
        }
    }

    log("EFFECTS_APPLIED", effects);
}

/* ================================================= */
/* STRUCTURAL STRAIN – IMBALANCE MODEL              */
/* ================================================= */

function applyStructuralStrainDrift() {

    const t = gameState.tracks;

    const care = Number(t.care) || 0;
    const climate = Number(t.climate) || 0;
    const solidarity = Number(t.solidarity) || 0;
    const authority = Number(t.authority) || 0;
    const capital = Number(t.capital) || 0;
    const strain = Number(t.strain) || 0;

    const surge = Number(gameState.surge) || 0;

    const social = (care + solidarity) / 2;
    const control = (authority + capital) / 2;
    const imbalance = control - social;
    const powerImbalance = Math.abs(imbalance);

    const ecoDeficit = Math.max(0, 10 - climate);

    let strainDelta = 0;

    /* Power imbalance */
    if (imbalance > 6) strainDelta += 2;
    else if (imbalance < -6) strainDelta += 1;
    else if (powerImbalance >= 3) strainDelta += 1;

    /* Ecological stress */
    if (ecoDeficit >= 5) strainDelta += 2;
    else if (ecoDeficit >= 3) strainDelta += 1;

    /* Harmony bonus */
    if (powerImbalance <= 2 && ecoDeficit === 0) {
        strainDelta -= 2;
    }

    /* Surge stabilization */
    const surgeStability = Math.floor(surge / 5);
    strainDelta -= surgeStability;

    // Apply act modifier
    const currentAct = getCurrentAct(gameState.round);
    if (currentAct && currentAct.modifiers.strainMultiplier) {
        strainDelta = Math.round(strainDelta * currentAct.modifiers.strainMultiplier);
    }

    // Apply difficulty strain multiplier
    if (gameState.difficulty && gameState.difficulty.strainMultiplier) {
        strainDelta = Math.round(strainDelta * gameState.difficulty.strainMultiplier);
    }

    // Strain acceleration: when strain > 14, it drifts faster toward collapse
    if (strain > 14) {
        const acceleration = Math.floor((strain - 14) / 2);
        strainDelta += acceleration;
    }

    let newStrain = strain + strainDelta;
    newStrain = Math.max(0, Math.min(20, newStrain));

    gameState.tracks.strain = newStrain;

    log("STRUCTURAL_STRAIN_IMBALANCE", {
        powerImbalance,
        ecoDeficit,
        surge,
        surgeStability,
        strainDelta,
        resultingStrain: newStrain
    });
}

/* ================================================= */
/* END ROUND                                        */
/* ================================================= */

export function endRound() {

    log("ROUND_ENDING", { round: gameState.round });

    if (gameState.round >= gameState.maxRounds) {
        gameState.gameOver = true;
        log("GAME_OVER", { finalRound: gameState.round });
        return;
    }

    gameState.round += 1;

    // Update current act
    const currentAct = getCurrentAct(gameState.round);
    if (currentAct) {
        gameState.currentAct = currentAct.act;
    }

    /* --------------------------------------------- */
    /* 1. LEVERAGE RECOVERY                         */
    /* --------------------------------------------- */

    const surgeRecoveryBonus =
        Math.ceil(gameState.surge / 2) +
        Math.floor(gameState.surge / 6);

    gameState.leverage = Math.min(
        gameState.maxLeverage,
        gameState.leverage +
        gameState.leverageRecovery +
        surgeRecoveryBonus
    );

    /* --------------------------------------------- */
    /* 2. PUSHBACK SYSTEM                           */
    /* --------------------------------------------- */

    const authority = Number(gameState.tracks.authority) || 0;
    const capital = Number(gameState.tracks.capital) || 0;
    const strain = Number(gameState.tracks.strain) || 0;
    const surge = Number(gameState.surge) || 0;

    gameState.pushback ??= {};
    gameState.pushback.eliteResistance ??= 0;
    gameState.pushback.transitionShock ??= 0;

    const elitePower =
        Math.max(0, authority) +
        Math.max(0, capital);

    let eliteResistanceDelta = 0;

    if (elitePower > 0) {

        eliteResistanceDelta += Math.floor(surge / 4);

        if (strain >= 8 && strain < 18)
            eliteResistanceDelta += 1;

        if (strain >= 20 && eliteResistanceDelta > 0)
            eliteResistanceDelta -= 1;
    }

    let transitionShockDelta = Math.floor(surge / 5);

    if (strain >= 15)
        transitionShockDelta += 1;

    gameState.pushback.eliteResistance =
        Math.max(0, gameState.pushback.eliteResistance + eliteResistanceDelta);

    gameState.pushback.transitionShock =
        Math.max(0, gameState.pushback.transitionShock + transitionShockDelta);

    gameState.pushback.value =
        gameState.pushback.eliteResistance +
        gameState.pushback.transitionShock;

    log("PUSHBACK_UPDATED", {
        eliteResistanceDelta,
        transitionShockDelta,
        eliteResistance: gameState.pushback.eliteResistance,
        transitionShock: gameState.pushback.transitionShock,
        totalPushback: gameState.pushback.value
    });

    /* --------------------------------------------- */
    /* 3. PUSHBACK PHASE EFFECTS                    */
    /* --------------------------------------------- */

    let leveragePenalty = 0;
    let extraStrainDrift = 0;

    if (gameState.pushback.value >= 20) {
        leveragePenalty = 1;
        extraStrainDrift = 1;
    }
    else if (gameState.pushback.value >= 10) {
        leveragePenalty = 1;
    }

    if (leveragePenalty > 0) {
        gameState.leverage =
            Math.max(0, gameState.leverage - leveragePenalty);
    }

    if (extraStrainDrift > 0) {
        gameState.tracks.strain =
            Math.min(20, gameState.tracks.strain + extraStrainDrift);
    }

    log("PUSHBACK_PHASE_EFFECT", {
        pushback: gameState.pushback.value,
        leveragePenalty,
        extraStrainDrift
    });

    /* --------------------------------------------- */
    /* 4. STRUCTURAL STRAIN DRIFT                   */
    /* --------------------------------------------- */

    applyStructuralStrainDrift();

    /* --------------------------------------------- */
    /* 5. SURGE DECAY                               */
    /* --------------------------------------------- */

    if (surgeDeltaThisRound <= 0 && gameState.surge > 0) {
        gameState.surge -= 1;
    }

    surgeDeltaThisRound = 0;

    // Apply act surge bonus
    const actForSurge = getCurrentAct(gameState.round);
    if (actForSurge && actForSurge.modifiers.surgeBonus) {
        gameState.surge += actForSurge.modifiers.surgeBonus;
    }

    /* --------------------------------------------- */
    /* 5b. CAPITAL SNOWBALL                         */
    /* --------------------------------------------- */

    // When capital > 14, it gains +1/round automatically
    if (gameState.tracks.capital > 14) {
        gameState.tracks.capital += 1;
        log("CAPITAL_SNOWBALL", { capital: gameState.tracks.capital });
    }

    /* --------------------------------------------- */
    /* 5c. SOCIAL POWER STRAIN                      */
    /* --------------------------------------------- */

    // High social power generates strain (cost of progress)
    const socialPowerNow = gameState.tracks.care + gameState.tracks.solidarity;
    if (socialPowerNow > 30) {
        const strainFromSocial = Math.floor((socialPowerNow - 30) / 5);
        gameState.tracks.strain = Math.min(20, gameState.tracks.strain + strainFromSocial);
        log("SOCIAL_POWER_STRAIN", { socialPower: socialPowerNow, strainAdded: strainFromSocial });
    }

    /* --------------------------------------------- */
    /* 5d. AUTHORITY RECOVERY                       */
    /* --------------------------------------------- */

    // When authority is very low, it slowly recovers toward 5
    if (gameState.tracks.authority < 5) {
        gameState.tracks.authority += 1;
        log("AUTHORITY_RECOVERY", { authority: gameState.tracks.authority });
    }

    /* --------------------------------------------- */
    /* 6. RESOURCE MANAGEMENT                       */
    /* --------------------------------------------- */
    
    // Apply resource recovery based on game state
    applyResourceRecovery();
    
    // Process any delayed effects
    processDelayedEffects();

    /* --------------------------------------------- */
    /* 6b. HIDDEN TRACKS UPDATE (Part 8)            */
    /* --------------------------------------------- */
    
    updateHiddenTracks();

    /* --------------------------------------------- */
    /* 6c. MEMORY CHECK (Part 9)                    */
    /* --------------------------------------------- */
    
    const memoryResult = checkMemory();
    if (memoryResult) {
        applyEffects(memoryResult.effect);
        log("MEMORY_TRIGGERED", memoryResult);
    }

    /* --------------------------------------------- */
    /* 6d. THRESHOLD CHECK (Part 10)                */
    /* --------------------------------------------- */
    
    checkThresholds();

    /* --------------------------------------------- */
    /* 7. RESET ROUND STATE                         */
    /* --------------------------------------------- */

    gameState.playsThisRound = 0;
    gameState.playerHand = [];
    gameState.tagsPlayedThisRound = [];
    
    /* --------------------------------------------- */
    /* 8. RESET CARD INTERACTIONS                   */
    /* --------------------------------------------- */
    
    resetInteractionState();
    
    /* --------------------------------------------- */
    /* 10. OPPOSITION SYSTEM                        */
    /* --------------------------------------------- */
    
    // Calculate threat levels from player actions
    calculateThreatLevels();
    
    // Process opposition responses
    processOppositionResponses();
    
    // Process opposition actions (cards)
    processOppositionPhase();
    
    // Check for escalation
    checkEscalation();
    
    // Update opposition learning
    updateOppositionLearning();

    /* --------------------------------------------- */
    /* 11. RESET RESOURCE STATE                     */
    /* --------------------------------------------- */
    
    resetResourceState();
}
