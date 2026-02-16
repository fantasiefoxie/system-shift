/* ================================================= */
/* SYSTEM SHIFT – LOGGER + SEEDED RNG (RESEARCH) */
/* ================================================= */

/*
This module provides:

• Deterministic seeded random()
• Structured event logging
• Exportable JSON run logs
• Replay-safe architecture

Version: research-v1.0.0
*/


/* ================================================= */
/* INTERNAL STATE */
/* ================================================= */

let _seed = 1;
let _rngState = 1;

let _log = [];
let _meta = {};


/* ================================================= */
/* SEEDED RNG (Mulberry32) */
/* ================================================= */

function mulberry32(a) {
    return function () {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

let _rng = mulberry32(_seed);


/* ================================================= */
/* INITIALIZATION */
/* ================================================= */

export function initLogger(seed, version) {

    _seed = seed || Date.now();
    _rngState = _seed;

    _rng = mulberry32(_seed);

    _log = [];

    _meta = {
        version,
        seed: _seed,
        startTime: Date.now()
    };

    logEvent("run_initialized", {
        seed: _seed,
        version
    });
}


/* ================================================= */
/* SEEDED RANDOM */
/* ================================================= */

export function random() {
    const value = _rng();
    return value;
}


/* ================================================= */
/* EVENT LOGGING */
/* ================================================= */

export function logEvent(type, payload = {}) {

    _log.push({
        timestamp: Date.now(),
        type,
        payload
    });
}


/* ================================================= */
/* EXPORT LOG */
/* ================================================= */

export function exportLog() {

    const runData = {
        meta: {
            ..._meta,
            endTime: Date.now(),
            durationMs: Date.now() - _meta.startTime
        },
        events: _log
    };

    const blob = new Blob(
        [JSON.stringify(runData, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `system_shift_seed_${_meta.seed}.json`;
    a.click();

    URL.revokeObjectURL(url);
}


/* ================================================= */
/* GET CURRENT SEED */
/* ================================================= */

export function getSeed() {
    return _seed;
}
