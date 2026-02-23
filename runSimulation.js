/* ================================================= */
/* RUN SIMULATION – Node.js Entry Point             */
/* ================================================= */

import { runBalanceSimulation } from "./game/balanceSimulator.js";
import fs from "fs";

console.log("Starting balance simulation...\n");

const results = runBalanceSimulation(500);

console.log("=".repeat(60));
console.log("BALANCE SIMULATION RESULTS (500 games)");
console.log("=".repeat(60));

console.log("\n📊 OUTCOME DISTRIBUTION:");
Object.entries(results.outcomeDistribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([outcome, count]) => {
        const pct = ((count / results.totalGames) * 100).toFixed(1);
        console.log(`  ${outcome.padEnd(35)} ${count.toString().padStart(4)} (${pct}%)`);
    });

console.log("\n📈 AVERAGE FINAL TRACKS:");
Object.entries(results.averageFinalTracks).forEach(([track, value]) => {
    console.log(`  ${track.padEnd(15)} ${value}`);
});

console.log("\n🃏 MOST PLAYED CARDS:");
results.mostPlayedCards.forEach(([cardId, count], i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. Card ${cardId.toString().padStart(3)} - ${count} plays`);
});

console.log("\n🎴 SUIT DISTRIBUTION:");
Object.entries(results.suitDistribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([suit, count]) => {
        console.log(`  ${suit.padEnd(15)} ${count}`);
    });

console.log("\n" + "=".repeat(60));

// Export to JSON
fs.writeFileSync(
    "./simulation-results.json",
    JSON.stringify(results, null, 2)
);

console.log("\n✅ Full results exported to simulation-results.json\n");
