// game/graph.js

let canvas;
let ctx;
let visible = false;

let selectedTracks = ["wellbeing", "power", "tension"];

export function initGraph() {

    canvas = document.getElementById("trendCanvas");
    if (!canvas) return;

    ctx = canvas.getContext("2d");
    resize();

    window.addEventListener("resize", resize);
}

function resize() {
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

export function toggleGraph() {

    visible = !visible;
    const panel = document.getElementById("graphPanel");
    if (panel) panel.style.display = visible ? "block" : "none";
}

export function toggleTrack(track) {

    if (selectedTracks.includes(track)) {
        selectedTracks = selectedTracks.filter(t => t !== track);
    } else {
        selectedTracks.push(track);
    }
}

export function drawGraph(timeline) {

    if (!ctx || !visible || timeline.length < 2) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    const maxDecade = timeline.length;

    drawHeatmap(timeline, padding, width, height);

    const colors = {
        wellbeing: "#f5c542",
        planet: "#47c774",
        community: "#4da3ff",
        power: "#ff5c5c",
        wealth: "#b197fc",
        tension: "#ff922b"
    };

    selectedTracks.forEach(track => {

        ctx.beginPath();
        ctx.strokeStyle = colors[track] || "#ffffff";
        ctx.lineWidth = 2;

        timeline.forEach((entry, index) => {

            const x = padding + (index / (maxDecade - 1)) * width;
            const value = entry.state[track] || 0;

            const y =
                padding +
                height -
                (value / 200) * height; // 200% scale

            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();
    });
}

function drawHeatmap(timeline, padding, width, height) {

    ctx.save();

    for (let i = 1; i < timeline.length; i++) {

        const prev = timeline[i - 1].state;
        const current = timeline[i].state;

        let volatility = 0;

        Object.keys(current).forEach(key => {
            volatility += Math.abs(current[key] - prev[key]);
        });

        volatility = Math.min(volatility / 50, 1); // normalize

        const alpha = volatility * 0.25;

        ctx.fillStyle = `rgba(255, 60, 60, ${alpha})`;

        const x = padding + ((i - 1) / (timeline.length - 1)) * width;
        const segmentWidth = width / (timeline.length - 1);

        ctx.fillRect(x, padding, segmentWidth, height);
    }

    ctx.restore();
}
