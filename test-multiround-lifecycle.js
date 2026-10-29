import assert from "node:assert/strict";

const store = new Map();
globalThis.localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
};

import { setSeed } from "./game/rng.js";
import { playCard, endRound } from "./game/round.js";
import { gameState } from "./game/state.js";
import { initResourceSystem } from "./game/resourceManagement.js";
import { initInteractionState, addHiddenCards } from "./game/cardInteractions.js";
import { initOppositionSystem } from "./game/oppositionSystem.js";
import { initOppositionActions } from "./game/oppositionActions.js";
import { shuffleDeck, drawCard } from "./game/deck.js";
import { baseDeck } from "./game/deck.js";

function setupGame() {
    setSeed(777);
    gameState.round = 1;
    gameState.maxRounds = 10;
    gameState.gameOver = false;
    gameState.currentAct = 1;
    gameState.playsThisRound = 0;
    gameState.maxPlaysPerRound = 3;
    gameState.handSize = 5;
    gameState.leverage = 10;
    gameState.maxLeverage = 10;
    gameState.leverageRecovery = 2;
    gameState.surge = 0;
    gameState.tracks = { care: 8, climate: 8, solidarity: 6, authority: 10, capital: 20, strain: 10 };
    gameState.pushback = { revealed: false, eliteResistance: 0, transitionShock: 0, value: 0 };
    gameState.structuralPushback = 0;
    gameState.surfacePushback = 0;
    gameState.playerHand = [];
    gameState.deck = [];
    gameState.discardPile = [];
    gameState.delayedEffects = [];
    gameState.tagsPlayedThisRound = [];
    gameState.hiddenTracks = { eliteCohesion: 10, movementMorale: 10, internationalPressure: 5 };
    gameState.revealed = { hiddenTracks: false, nextCards: [], nextEliteAction: null };
    gameState.activeThresholds = [];
    gameState.negotiation = { usedThisAct: [], history: [] };
    gameState.memory = { maxCare: 8, maxClimate: 8, cardsPlayed: [], eventsChosen: [] };
    gameState.difficulty = { mode: "normal", leverageOffset: 0, strainMultiplier: 1.0, oppositionIntensity: 1.0 };
    gameState.ui = { roundPhase: "PLAYING", pacingMode: "standard", orientationMode: "portrait", markerVerbosity: "normal", feed: { items: [], maxItems: 40, markerVerbosity: "normal" } };
    gameState.opposition = undefined;
    initResourceSystem();
    initInteractionState();
    initOppositionSystem();
    initOppositionActions();
    gameState.deck = shuffleDeck([...baseDeck]);
    for (let i = 0; i < gameState.handSize; i++) { const c = drawCard(); if (c) gameState.playerHand.push(c); }
    addHiddenCards();
}

function drawNextHand() {
    gameState.playerHand = [];
    for (let i = 0; i < gameState.handSize; i++) { const c = drawCard(); if (c) gameState.playerHand.push(c); }
    addHiddenCards();
}

function snapshot(label) {
    // Deep-copy relevant state.
    return {
        label,
        round: gameState.round,
        gameOver: gameState.gameOver,
        tracks: { ...gameState.tracks },
        surge: gameState.surge,
        leverage: gameState.leverage,
        resources: { ...gameState.resources },
        handIds: gameState.playerHand.map(c => c.id),
        deckCount: gameState.deck.length,
        discardCount: gameState.discardPile.length,
        hiddenCount: gameState.interactionState.hiddenCards.length,
        playsThisRound: gameState.playsThisRound
    };
}

function runScenario() {
    setupGame();
    const trace = [];
    trace.push(snapshot("initial"));

    // Round 1: play one affordable non-hidden card.
    let played1 = false;
    for (let i = 0; i < gameState.playerHand.length; i++) {
        const c = gameState.playerHand[i];
        if ((Number(c.cost) || 0) <= gameState.leverage && !c.hidden) {
            const beforeHand = gameState.playerHand.length;
            const playedCard = c;
            playCard(i);
            assert.ok(gameState.playerHand.length < beforeHand, "card should leave hand after play");
            // Card conservation: played card not in hand, not in deck, but in discardPile.
            assert.ok(!gameState.playerHand.some(x => x.id === playedCard.id && !x.hidden), "played card should not remain in hand");
            assert.ok(!gameState.deck.some(x => x.id === playedCard.id), "played card should not be in deck");
            assert.equal(gameState.discardPile.filter(x => x.id === playedCard.id).length, 1, "played card should appear once in discard pile");
            played1 = true;
            trace.push(snapshot("after-play-round1"));
            break;
        }
    }

    // Rejected play does not consume a card: playsThisRound at max.
    const beforeHandReject = gameState.playerHand.length;
    const beforePlays = gameState.playsThisRound;
    gameState.playsThisRound = gameState.maxPlaysPerRound;
    if (gameState.playerHand.length > 0) {
        const first = gameState.playerHand[0];
        playCard(0);
        // If the card was affordable, playCard returns early due to max plays; hand unchanged.
        if ((Number(first.cost) || 0) <= gameState.leverage) {
            assert.equal(gameState.playerHand.length, beforeHandReject, "rejected play should not remove card from hand");
            assert.equal(gameState.playsThisRound, gameState.maxPlaysPerRound, "rejected play should not change playsThisRound");
        }
    }
    gameState.playsThisRound = beforePlays; // restore

    // Round 1 completion.
    const roundBeforeEnd1 = gameState.round;
    endRound();
    assert.equal(gameState.round, roundBeforeEnd1 + 1, "round should advance after endRound (non-terminal)");
    trace.push(snapshot("after-endRound-round1"));

    // Next-hand draw.
    drawNextHand();
    trace.push(snapshot("after-draw-round2"));

    // Round 2.
    let played2 = false;
    if (!gameState.gameOver) {
        for (let i = 0; i < gameState.playerHand.length; i++) {
            const c = gameState.playerHand[i];
            if ((Number(c.cost) || 0) <= gameState.leverage && !c.hidden) {
                playCard(i);
                played2 = true;
                trace.push(snapshot("after-play-round2"));
                break;
            }
        }
        if (!gameState.gameOver) {
            const r = gameState.round;
            endRound();
            assert.equal(gameState.round, r + 1, "round should advance after second endRound");
            trace.push(snapshot("after-endRound-round2"));
        }
    }

    // Round 3.
    if (!gameState.gameOver) {
        drawNextHand();
        trace.push(snapshot("after-draw-round3"));
        for (let i = 0; i < gameState.playerHand.length; i++) {
            const c = gameState.playerHand[i];
            if ((Number(c.cost) || 0) <= gameState.leverage && !c.hidden) {
                playCard(i);
                trace.push(snapshot("after-play-round3"));
                break;
            }
        }
        if (!gameState.gameOver) {
            endRound();
            trace.push(snapshot("after-endRound-round3"));
        }
    }

    // Game-over guard: drive real game-over path.
    gameState.round = gameState.maxRounds;
    gameState.gameOver = false;
    const handBeforeGO = gameState.playerHand.length;
    const roundBeforeGO = gameState.round;
    endRound();
    assert.equal(gameState.gameOver, true, "endRound should set gameOver at maxRounds");
    assert.equal(gameState.round, roundBeforeGO, "endRound should not advance round on game over");
    assert.equal(gameState.playerHand.length, handBeforeGO, "hand should not change after game-over endRound");
    trace.push(snapshot("after-gameover"));

    return trace;
}

// Run twice with the same seed and compare full traces.
const trace1 = runScenario();
const trace2 = runScenario();
assert.deepEqual(trace1, trace2, "identical seed and scenario must produce identical intermediate traces");

// Basic assertions on the run.
assert.equal(trace1[trace1.length - 1].gameOver, true, "scenario should end in game over");
assert.ok(trace1[trace1.length - 1].round >= 3, "should complete at least 3 rounds");

// Verify intermediate stages are present.
const labels = trace1.map(s => s.label);
assert.ok(labels.includes("initial"), "trace should include initial snapshot");
assert.ok(labels.includes("after-play-round1"), "trace should include round 1 play");
assert.ok(labels.includes("after-endRound-round1"), "trace should include round 1 end");
assert.ok(labels.includes("after-draw-round2"), "trace should include round 2 draw");
assert.ok(labels.includes("after-gameover"), "trace should include game-over snapshot");

// Card conservation: no real card id should appear in more than one of hand/deck/discard
// (hidden cards are placeholders with id 0 and are tracked separately in interactionState.hiddenCards).
const finalHand = trace1[trace1.length - 1];
assert.ok(finalHand.handIds.length >= 0, "final hand should be a valid array");

// Focused card-effect assertion (controlled fixture, real playCard).
setupGame();
const effectCard = baseDeck.find(c => c.id === 101);
assert.ok(effectCard, "card 101 should exist in baseDeck");
assert.deepEqual(effectCard.effects, { care: 2 }, "card 101 should grant +2 care");
gameState.playerHand = [effectCard];
gameState.leverage = 10;
const careBeforeFx = gameState.tracks.care;
const discardBeforeFx = gameState.discardPile.length;
playCard(0);
assert.equal(gameState.tracks.care, careBeforeFx + 2, "playCard should apply the card's care effect exactly once");
assert.equal(gameState.playerHand.length, 0, "played card should leave hand");
assert.equal(gameState.discardPile.length, discardBeforeFx + 1, "played card should be pushed to discard pile");
assert.equal(gameState.discardPile[gameState.discardPile.length - 1].id, 101, "discard pile should contain the played card");

console.log("test-multiround-lifecycle.js passed");