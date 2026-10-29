/* ================================================= */
/* SYSTEM SHIFT - NOTIFICATION CENTER                */
/* Unified stack for toasts, hints, and quick cues   */
/* ================================================= */

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

let stackEl = null;
const liveNotifications = [];

const KIND_CLASS = {
    info: "notification-info",
    positive: "notification-positive",
    warning: "notification-warning",
    critical: "notification-critical"
};

function ensureStack(containerId = "notificationStack") {
    if (stackEl && document.body.contains(stackEl)) return stackEl;

    const existing = document.getElementById(containerId);
    if (existing) {
        stackEl = existing;
        return stackEl;
    }

    const created = document.createElement("div");
    created.id = containerId;
    created.className = "notification-stack";
    document.body.appendChild(created);
    stackEl = created;
    return stackEl;
}

function prune(maxVisible = 4) {
    while (liveNotifications.length > maxVisible) {
        const stale = liveNotifications.shift();
        stale?.remove();
    }
}

export function initNotificationCenter(containerId = "notificationStack") {
    ensureStack(containerId);
}

export function notify({
    kind = "info",
    title = "",
    message = "",
    duration = 2600,
    maxVisible = 4
} = {}) {
    const container = ensureStack();
    const card = document.createElement("div");
    const cssKind = KIND_CLASS[kind] || KIND_CLASS.info;

    card.className = `notification-card ${cssKind}`;
    card.innerHTML = `
        <div class="notification-title">${escapeHtml(title || "Update")}</div>
        <div class="notification-message">${escapeHtml(message || "")}</div>
    `;

    container.prepend(card);
    liveNotifications.unshift(card);
    prune(maxVisible);

    const timeout = Math.max(350, Number(duration) || 2600);
    window.setTimeout(() => {
        card.classList.add("notification-leave");
        window.setTimeout(() => {
            const idx = liveNotifications.indexOf(card);
            if (idx >= 0) liveNotifications.splice(idx, 1);
            card.remove();
        }, 220);
    }, timeout);

    return card;
}
