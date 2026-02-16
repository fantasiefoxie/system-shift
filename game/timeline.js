import { gameState } from "./state.js";
import { drawGraph } from "./graph.js";

let timeline = [];

export function initTimeline() {
    timeline = [];
}

export function recordEvent(type) {

    timeline.push({
        round: gameState.round,
        type,
        state: structuredClone(gameState.tracks)
    });
}

export function renderTimeline() {

    const container = document.getElementById("timeline");
    if (!container) return;

    container.innerHTML = "";

    timeline.forEach(entry => {

        const block = document.createElement("div");
        block.classList.add("timeline-entry");

        block.innerText =
            `Decade ${entry.round} — ${entry.type}`;

        container.appendChild(block);
    });

    drawGraph(timeline);
}

export function getTimeline() {
    return timeline;
}
