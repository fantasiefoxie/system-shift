/* ================================================= */
/* SYSTEM SHIFT – RUN LOGGER (FRV-1.0 STABLE) */
/* ================================================= */

let currentRun = null;

/* ================================================= */
/* INIT */
/* ================================================= */

export function initLogger(seed) {

    currentRun = {
        version: "FRV-1.0",
        seed,
        startTime: Date.now(),
        events: []
    };

    log("RUN_STARTED", { seed });
}

/* ================================================= */
/* LOG EVENT */
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
/* EXPORT */
/* ================================================= */

export function exportLog() {

    if (!currentRun) return;

    const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(currentRun, null, 2));

    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
        "download",
        `system-shift-seed-${currentRun.seed}.json`
    );

    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}