const { execSync } = require('child_process');

console.log("=== BALANCE ITERATION TEST ===\n");
console.log("Running simulation...\n");

try {
    const output = execSync('node simulate.js', { encoding: 'utf-8', cwd: __dirname });
    console.log(output);
} catch (error) {
    console.error("Error running simulation:", error.message);
}
