/* ================================================= */
/* BALANCE SIMULATOR – Automated Playtest Runner    */
/* ================================================= */

import { gameState } from "./state.js";
import { baseDeck, shuffleDeck, drawCard } from "./deck.js";
import { playCard, endRound } from "./round.js";
import { evaluateOutcome } from "./outcomeEngine.js";
import { setSeed } from "./rng.js";

export function runBalanceSimulation(iterations = 100) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
        results.push(simulateSingleGame(i));
    }
    
    return analyzeResults(results);
}

function simulateSingleGame(seed) {
    setSeed(seed);
    
    Object.assign(gameState, {
        round: 1,
        gameOver: false,
        playsThisRound: 0,
        leverage: gameState.maxLeverage,
        surge: 0,
        playerHand: [],
        discardPile: [],
        tracks: { care: 8, climate: 8, solidarity: 6, authority: 5, capital: 15, strain: 6 },
        pushback: { revealed: false, eliteResistance: 0, transitionShock: 0, value: 0 }
    });
    
    gameState.deck = shuffleDeck([...baseDeck]);
    
    const cardPlayLog = [];
    
    while (!gameState.gameOver && gameState.round <= gameState.maxRounds) {
        drawHand();
        
        for (let play = 0; play < gameState.maxPlaysPerRound; play++) {
            const cardIndex = selectBestCard();
            if (cardIndex === -1) break;
            
            const card = gameState.playerHand[cardIndex];
            cardPlayLog.push({ round: gameState.round, card: card.id, suit: card.suit });
            playCard(cardIndex);
        }
        
        endRound();
    }
    
    const outcome = evaluateOutcome(gameState);
    
    return {
        seed,
        outcome: outcome.type,
        finalTracks: { ...gameState.tracks },
        finalPushback: gameState.pushback.value,
        finalSurge: gameState.surge,
        cardPlayLog
    };
}

function drawHand() {
    gameState.playerHand = [];
    for (let i = 0; i < gameState.handSize; i++) {
        const card = drawCard();
        if (!card) break;
        gameState.playerHand.push(card);
    }
}

function selectBestCard() {
    let bestIndex = -1;
    let bestScore = -Infinity;
    
    for (let i = 0; i < gameState.playerHand.length; i++) {
        const card = gameState.playerHand[i];
        if (gameState.leverage < card.cost) continue;
        
        const score = evaluateCardValue(card);
        if (score > bestScore) {
            bestScore = score;
            bestIndex = i;
        }
    }
    
    return bestIndex;
}

function evaluateCardValue(card) {
    const t = gameState.tracks;
    let score = 0;
    
    // Prioritize reducing capital/authority
    if (card.effects.capital < 0) score += Math.abs(card.effects.capital) * 3;
    if (card.effects.authority < 0) score += Math.abs(card.effects.authority) * 3;
    
    // Value care/climate/solidarity gains
    if (card.effects.care > 0) score += card.effects.care * 2;
    if (card.effects.climate > 0) score += card.effects.climate * 2;
    if (card.effects.solidarity > 0) score += card.effects.solidarity * 2;
    
    // Penalize strain increases
    if (card.effects.strain > 0) score -= card.effects.strain * 4;
    
    // Surge bonus
    if (card.suit === "authority" || card.suit === "solidarity") score += 2;
    
    // Cost efficiency
    score -= card.cost * 1.5;
    
    return score;
}

function analyzeResults(results) {
    const outcomeCount = {};
    const cardUsage = {};
    const suitUsage = {};
    
    results.forEach(r => {
        outcomeCount[r.outcome] = (outcomeCount[r.outcome] || 0) + 1;
        
        r.cardPlayLog.forEach(log => {
            cardUsage[log.card] = (cardUsage[log.card] || 0) + 1;
            suitUsage[log.suit] = (suitUsage[log.suit] || 0) + 1;
        });
    });
    
    const avgTracks = results.reduce((acc, r) => {
        Object.keys(r.finalTracks).forEach(k => {
            acc[k] = (acc[k] || 0) + r.finalTracks[k];
        });
        return acc;
    }, {});
    
    Object.keys(avgTracks).forEach(k => {
        avgTracks[k] = (avgTracks[k] / results.length).toFixed(2);
    });
    
    return {
        totalGames: results.length,
        outcomeDistribution: outcomeCount,
        averageFinalTracks: avgTracks,
        mostPlayedCards: Object.entries(cardUsage)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10),
        suitDistribution: suitUsage
    };
}
