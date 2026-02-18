/* ================================================= */
/* SYSTEM SHIFT – AUDIO MANAGER (v1 STABLE)         */
/* Centralized Sound Engine                         */
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

    /* Endings */
    ecoEnding: "relaxed-scene.mp3",
    ecoNature: "nature-sound.mp3",
    socialistEnding: "the-international.mp3",
    revolutionaryEnding: "heavily-distorted-bellaciao.mp3"
};

/* ------------------------------------------------- */
/* INTERNAL STATE                                    */
/* ------------------------------------------------- */

const audioCache = {};
let masterVolume = 0.6;
let muted = false;

/* Prevent rapid spam */
const lastPlayed = {};
const COOLDOWN_MS = 80;

/* ------------------------------------------------- */
/* LOAD SOUND                                        */
/* ------------------------------------------------- */

function loadSound(key) {

    if (!soundMap[key]) return null;

    if (!audioCache[key]) {

        const audio = new Audio(AUDIO_PATH + soundMap[key]);
        audio.volume = masterVolume;
        audio.preload = "auto";

        audioCache[key] = audio;
    }

    return audioCache[key];
}

/* ------------------------------------------------- */
/* PLAY SOUND                                        */
/* ------------------------------------------------- */

export function playSound(key, options = {}) {

    if (muted) return;
    if (!soundMap[key]) return;

    const now = Date.now();

    /* Simple anti-spam cooldown */
    if (lastPlayed[key] && now - lastPlayed[key] < COOLDOWN_MS) {
        return;
    }

    lastPlayed[key] = now;

    const baseAudio = loadSound(key);
    if (!baseAudio) return;

    /* Clone to allow overlapping micro sounds */
    const audio = baseAudio.cloneNode();

    if (options.volume !== undefined) {
        audio.volume = options.volume;
    } else {
        audio.volume = masterVolume;
    }

    if (options.playbackRate) {
        audio.playbackRate = options.playbackRate;
    }

    audio.play().catch(() => {});
}

/* ------------------------------------------------- */
/* CONTROL METHODS                                   */
/* ------------------------------------------------- */

export function setVolume(value) {
    masterVolume = Math.max(0, Math.min(1, value));
}

export function muteAll() {
    muted = true;
}

export function unmuteAll() {
    muted = false;
}

export function toggleMute() {
    muted = !muted;
}