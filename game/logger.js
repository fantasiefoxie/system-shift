/* ================================================= */
/* SYSTEM SHIFT – RUN LOGGER (v2 STABLE REPLAY)     */
/* Deterministic Run Capture + Export               */
/* ================================================= */

import { getSeed } from "./rng.js";

let currentRun = null;

/* ================================================= */
/* INIT LOGGER                                      */
/* ================================================= */

export function initLogger(seed) {

    currentRun = {
        version: "FRV-2.0",
        seed,
        rngSeed: getSeed(),
        startTime: Date.now(),
        endTime: null,
        events: []
    };

    log("RUN_STARTED", {
        seed,
        rngSeed: currentRun.rngSeed
    });
}

/* ================================================= */
/* LOG EVENT                                        */
/* ================================================= */

export function log(type, payload = {}) {

    if (!currentRun) return;

    currentRun.events.push({
        time: Date.now(),
        type,
        payload
    });
}

/* ================================================= */
/* END RUN (optional hook for future)               */
/* ================================================= */

export function endRun() {

    if (!currentRun) return;

    currentRun.endTime = Date.now();

    log("RUN_ENDED", {
        totalEvents: currentRun.events.length
    });
}

/* ================================================= */
/* EXPORT LOG                                       */
/* ================================================= */

export function exportLog() {

    if (!currentRun) return;

    const safeRun = JSON.parse(JSON.stringify(currentRun));

    const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(safeRun, null, 2));

    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
        "download",
        `system-shift-seed-${safeRun.seed}.json`
    );

    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

/* ================================================= */
/* ACCESS CURRENT RUN (for replay tools later)      */
/* ================================================= */

export function getCurrentRun() {
    return currentRun;
}