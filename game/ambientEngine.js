/* ================================================= */
/* SYSTEM SHIFT – AMBIENT ENGINE (AAA REACTIVE)     */
/* Reactive Strain Particle Atmosphere              */
/* ================================================= */

import { gameState } from "./state.js";

/* ================================================= */
/* INTERNAL STATE                                   */
/* ================================================= */

let canvas;
let ctx;
let particles = [];
let running = false;
let intensity = 0.3;

/* ================================================= */
/* INIT                                             */
/* ================================================= */

export function initAmbientEngine(canvasId = "ambientCanvas") {

    canvas = document.getElementById(canvasId);
    if (!canvas) return;

    ctx = canvas.getContext("2d");
    if (!ctx) return;

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    createParticles(80);

    running = true;
    animate();
}

/* ================================================= */
/* RESIZE                                           */
/* ================================================= */

function resizeCanvas() {
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/* ================================================= */
/* PARTICLE CREATION                                */
/* ================================================= */

function createParticles(count) {

    particles = [];

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 0.6,
            speed: Math.random() * 0.5 + 0.2,
            angle: Math.random() * Math.PI * 2
        });
    }
}

/* ================================================= */
/* STRAIN INTENSITY LOGIC                           */
/* ================================================= */

function updateIntensity() {

    const strain = gameState?.tracks?.strain ?? 0;

    if (strain < 6) intensity = 0.25;
    else if (strain < 12) intensity = 0.45;
    else if (strain < 18) intensity = 0.75;
    else intensity = 1.2;
}

/* ================================================= */
/* COLOR SYSTEM                                     */
/* ================================================= */

function getParticleColor() {

    const strain = gameState?.tracks?.strain ?? 0;
    const climate = gameState?.tracks?.climate ?? 10;

    // Climate-tied color shift (4C: Climate ambient)
    if (climate < 7) {
        // Low climate: darker timbre (darker colors)
        if (strain < 6) return "rgba(30,60,100,0.3)";
        if (strain < 12) return "rgba(80,90,100,0.3)";
        if (strain < 18) return "rgba(180,60,60,0.4)";
        return "rgba(200,30,30,0.55)";
    } else if (climate > 13) {
        // High climate: brighter timbre (brighter colors)
        if (strain < 6) return "rgba(80,160,246,0.4)";
        if (strain < 12) return "rgba(180,190,210,0.4)";
        if (strain < 18) return "rgba(239,100,80,0.5)";
        return "rgba(255,60,60,0.7)";
    }

    // Normal climate
    if (strain < 6) return "rgba(59,130,246,0.35)";
    if (strain < 12) return "rgba(148,163,184,0.35)";
    if (strain < 18) return "rgba(239,68,68,0.45)";
    return "rgba(255,0,0,0.65)";
}

/* ================================================= */
/* ANIMATION LOOP                                   */
/* ================================================= */

function animate() {

    if (!running || !ctx) return;

    updateIntensity();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const color = getParticleColor();

    particles.forEach(p => {

        p.x += Math.cos(p.angle) * p.speed * intensity;
        p.y += Math.sin(p.angle) * p.speed * intensity;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    });

    requestAnimationFrame(animate);
}

/* ================================================= */
/* OPTIONAL CONTROL                                 */
/* ================================================= */

export function stopAmbientEngine() {
    running = false;
}