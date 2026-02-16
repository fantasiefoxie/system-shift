/* ================================================= */
/* SYSTEM SHIFT – SEEDED RNG ENGINE (FRV-1.0) */
/* Deterministic per seed */
/* ================================================= */

let internalSeed = 1;

/* ================================================= */
/* SEED CONTROL */
/* ================================================= */

export function setSeed(seed) {
    internalSeed = seed >>> 0; // force uint32
}

export function getSeed() {
    return internalSeed;
}

/* ================================================= */
/* LCG – Linear Congruential Generator */
/* ================================================= */

export function random() {
    internalSeed = (internalSeed * 1664525 + 1013904223) % 4294967296;
    return internalSeed / 4294967296;
}

export function randomInt(max) {
    return Math.floor(random() * max);
}

/* ================================================= */
/* DETERMINISTIC SHUFFLE */
/* Fisher-Yates using seeded random */
/* ================================================= */

export function shuffle(array) {

    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {

        const j = Math.floor(random() * (i + 1));

        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}