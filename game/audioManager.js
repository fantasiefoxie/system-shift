/* ================================================= */
/* SYSTEM SHIFT – AUDIO MANAGER (v3 FINAL HARDENED) */
/* Centralized Sound + Music Engine                 */
/* Crash-Proof + Spam-Safe + Restart-Safe          */
/* ================================================= */

const AUDIO_PATH = "./assets/audio/";

/* ------------------------------------------------- */
/* SOUND REGISTRY                                   */
/* ------------------------------------------------- */

const soundMap = {

    /* Micro */
    tick: "tick-deepfrozenapps-397275646-2.mp3",
    haloUp: "ui-click-one.mp3",
    haloDown: "error-glitch.mp3",

    /* Capital inversion */
    capitalUp: "error-glitch.mp3",
    capitalDown: "ui-click-one.mp3",

    /* Structural */
    heartbeat: "heartbeat.mp3",
    flatline: "flatline.mp3",
    shutter: "shutter-flash.mp3",
    bassDrop: "bass-drop.mp3",
    recalculation: "cashier-printer.mp3",
    energy: "energy.mp3",
    coins: "coins.mp3",

    /* Card / UI */
    cardFlip: "card-flip.mp3",
    cardStamp: "stamp.mp3",
    button: "button-click.mp3",
    shuffle: "card-swap.mp3",

    /* Surge */
    surgeUp: "ascend.mp3",
    surgeBreak: "crack.mp3",

    /* Card Interactions */
    cardReveal: "card-flip.mp3",
    combo: "ui-click-one.mp3",
    synergy: "energy.mp3",
    counter: "error-glitch.mp3",

    /* Endings / Music */
    ecoEnding: "relaxed-scene.mp3",
    ecoNature: "nature-sound.mp3",
    socialistEnding: "the-international.mp3",
    revolutionaryEnding: "bella-ciao.mp3"
};

/* ------------------------------------------------- */
/* INTERNAL STATE                                   */
/* ------------------------------------------------- */

const audioCache = {};
let masterVolume = 0.6;
let musicVolume = 0.45;
let muted = false;
let currentMusic = null;

/* Anti-spam for rapid micro sounds */
const lastPlayed = {};
const COOLDOWN_MS = 70;

/* ------------------------------------------------- */
/* LOAD SOUND (Safe + Cached)                       */
/* ------------------------------------------------- */

function loadSound(key) {

    if (!soundMap[key]) return null;

    if (!audioCache[key]) {

        const audio = new Audio(AUDIO_PATH + soundMap[key]);
        audio.preload = "auto";

        /* Prevent console crash spam */
        audio.onerror = () => {
            console.warn(`[Audio Missing] ${soundMap[key]}`);
        };

        audioCache[key] = audio;
    }

    return audioCache[key];
}

/* ------------------------------------------------- */
/* PLAY SOUND (Micro FX)                            */
/* ------------------------------------------------- */

export function playSound(key, options = {}) {

    if (muted) return;
    if (!soundMap[key]) return;

    const now = Date.now();

    if (lastPlayed[key] && now - lastPlayed[key] < COOLDOWN_MS) {
        return;
    }

    lastPlayed[key] = now;

    const baseAudio = loadSound(key);
    if (!baseAudio) return;

    try {

        const audio = baseAudio.cloneNode();

        audio.volume = options.volume ?? masterVolume;

        if (options.playbackRate) {
            audio.playbackRate = options.playbackRate;
        }

        audio.play().catch(() => {});

    } catch {
        /* Completely silent fail */
    }
}

/* ------------------------------------------------- */
/* PLAY MUSIC (Looping Background)                  */
/* ------------------------------------------------- */

export function playMusic(key, { loop = true, volume } = {}) {

    if (muted) return;
    if (!soundMap[key]) return;

    stopMusic();

    const baseAudio = loadSound(key);
    if (!baseAudio) return;

    try {

        currentMusic = baseAudio.cloneNode();
        currentMusic.loop = loop;
        currentMusic.volume = volume ?? musicVolume;

        currentMusic.play().catch(() => {});

    } catch {
        currentMusic = null;
    }
}

/* ------------------------------------------------- */
/* STOP MUSIC                                       */
/* ------------------------------------------------- */

export function stopMusic() {

    if (!currentMusic) return;

    try {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    } catch {}

    currentMusic = null;
}

/* ------------------------------------------------- */
/* CONTROL METHODS                                  */
/* ------------------------------------------------- */

export function setVolume(value) {
    masterVolume = Math.max(0, Math.min(1, Number(value) || 0));
}

export function setMusicVolume(value) {

    musicVolume = Math.max(0, Math.min(1, Number(value) || 0));

    if (currentMusic) {
        currentMusic.volume = musicVolume;
    }
}

export function muteAll() {
    muted = true;
    stopMusic();
}

export function unmuteAll() {
    muted = false;
}

export function toggleMute() {
    muted = !muted;
}

/* ================================================= */
/* 4B: DYNAMIC SOUNDTRACK - WEB AUDIO API           */
/* ================================================= */

let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

export function playFactionSting(factionId) {
    if (muted) return;
    
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        
        const now = ctx.currentTime;
        
        if (factionId === 'elite') {
            // Descending minor triad
            [0, 3, 7].forEach((semitone, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 440 * Math.pow(2, semitone / 12);
                gain.gain.setValueAtTime(0.15, now + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
                osc.start(now + i * 0.12);
                osc.stop(now + i * 0.12 + 0.4);
            });
        } else if (factionId === 'authoritarian') {
            // Low drone pulse
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 110;
            osc.type = 'sawtooth';
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else {
            // Neutral two-note motif
            [0, 5].forEach((semitone, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 330 * Math.pow(2, semitone / 12);
                gain.gain.setValueAtTime(0.12, now + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
                osc.start(now + i * 0.15);
                osc.stop(now + i * 0.15 + 0.3);
            });
        }
    } catch (e) { /* silent fail */ }
}

export function playEndingTheme(endingType) {
    if (muted) return;
    
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        
        const now = ctx.currentTime;
        const victory = ["SOCIAL TRANSFORMATION", "ECOLOGICAL TRANSITION", "DUAL POWER TRANSITION"];
        const neutral = ["TURBULENT TRANSFORMATION", "MANAGED STABILITY", "ECOLOGICAL CONSTRAINT", "SYSTEM DRIFT"];
        
        if (victory.includes(endingType)) {
            // Rising major chord progression
            [0, 4, 7, 12].forEach((semitone, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 262 * Math.pow(2, semitone / 12);
                gain.gain.setValueAtTime(0, now + i * 0.4);
                gain.gain.linearRampToValueAtTime(0.1, now + i * 0.4 + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.4 + 2);
                osc.start(now + i * 0.4);
                osc.stop(now + i * 0.4 + 2);
            });
        } else if (neutral.includes(endingType)) {
            // Ambiguous suspended chord
            [0, 5, 10].forEach((semitone, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 294 * Math.pow(2, semitone / 12);
                gain.gain.setValueAtTime(0, now + i * 0.3);
                gain.gain.linearRampToValueAtTime(0.08, now + i * 0.3 + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 1.5);
                osc.start(now + i * 0.3);
                osc.stop(now + i * 0.3 + 1.5);
            });
        } else {
            // Descending minor progression
            [0, -3, -5, -8].forEach((semitone, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 330 * Math.pow(2, semitone / 12);
                gain.gain.setValueAtTime(0, now + i * 0.5);
                gain.gain.linearRampToValueAtTime(0.1, now + i * 0.5 + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.5 + 2);
                osc.start(now + i * 0.5);
                osc.stop(now + i * 0.5 + 2);
            });
        }
    } catch (e) { /* silent fail */ }
}
