import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("=== BALANCE ITERATION TEST ===\n");
console.log("Running simulation...\n");

try {
    const output = execSync('node simulate.js', { encoding: 'utf-8', cwd: __dirname });
    console.log(output);
} catch (error) {
    console.error("Error running simulation:", error.message);
}
