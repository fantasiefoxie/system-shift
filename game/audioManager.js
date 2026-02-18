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
    tick: "tick.mp3",
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
    shuffle: "card-switch.mp3",

    /* Surge */
    surgeUp: "ascend.mp3",
    surgeBreak: "crack.mp3",

    /* Endings / Music */
    ecoEnding: "relaxed-scene.mp3",
    ecoNature: "nature-sound.mp3",
    socialistEnding: "the-international.mp3",
    revolutionaryEnding: "heavily-distorted-bellaciao.mp3"
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