/* ================================================= */
/* SYSTEM SHIFT – SEEDED RNG ENGINE (v2 STABLE)     */
/* Deterministic per seed                           */
/* ================================================= */

let internalSeed = 1;

/* ================================================= */
/* SEED CONTROL                                     */
/* ================================================= */

export function setSeed(seed) {

    // Accept string or number
    if (typeof seed === "string") {
        seed = hashStringToUint32(seed);
    }

    internalSeed = (seed >>> 0) || 1;
}

export function getSeed() {
    return internalSeed >>> 0;
}

/* ================================================= */
/* LCG – Linear Congruential Generator              */
/* Numerical Recipes constants                      */
/* ================================================= */

export function random() {

    internalSeed =
        (internalSeed * 1664525 + 1013904223) >>> 0;

    return internalSeed / 4294967296;
}

export function randomInt(max) {

    if (!max || max <= 0) return 0;

    return Math.floor(random() * max);
}

/* ================================================= */
/* DETERMINISTIC SHUFFLE                            */
/* Fisher-Yates using seeded random                 */
/* ================================================= */

export function shuffle(array) {

    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {

        const j = randomInt(i + 1);

        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

/* ================================================= */
/* STRING HASH → UINT32                             */
/* For seed from Date.now() or user input           */
/* ================================================= */

function hashStringToUint32(str) {

    let hash = 2166136261;

    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}