# SYSTEM SHIFT - COMPLETE IMPLEMENTATION SPECIFICATION
## PART 3: UI INTEGRATION - EVENT MODAL & ELITE NOTIFICATIONS

---

## SECTION 3: UI INTEGRATION

### 3.1 FILE CREATION: ui/eventModal.js

**Location:** `c:\git_projects\system-shift\ui\eventModal.js`  
**Purpose:** Event modal UI component with choice buttons  
**Dependencies:** `eventResolver.js`, `state.js`

**EXACT FILE CONTENT:**

```javascript
/* ================================================= */
/* SYSTEM SHIFT – EVENT MODAL UI                    */
/* Modal dialog for event choices                   */
/* ================================================= */

import { resolveEventChoice } from "../game/eventResolver.js";
import { gameState } from "../game/state.js";

/**
 * Create and display event modal
 * @param {object} event - Event object to display
 * @param {function} onComplete - Callback after choice made
 */
export function showEventModal(event, onComplete) {
    
    // Create modal overlay
    const overlay = document.createElement("div");
    overlay.id = "eventModalOverlay";
    overlay.className = "modal-overlay";
    
    // Create modal container
    const modal = document.createElement("div");
    modal.id = "eventModal";
    modal.className = "event-modal";
    
    // Build modal content
    modal.innerHTML = `
        <div class="event-modal-header">
            <h2 class="event-title">${event.title}</h2>
            <div class="event-round">Round ${gameState.round}</div>
        </div>
        
        <div class="event-modal-body">
            <p class="event-description">${event.description}</p>
            ${event.flavor ? `<p class="event-flavor">${event.flavor}</p>` : ''}
            
            ${event.autoEffects ? `
                <div class="event-auto-effects">
                    <strong>Immediate Impact:</strong>
                    ${formatEffects(event.autoEffects)}
                </div>
            ` : ''}
        </div>
        
        <div class="event-modal-choices">
            ${event.choices.map((choice, index) => `
                <button class="event-choice-btn" data-choice="${index}">
                    <div class="choice-text">${choice.text}</div>
                    <div class="choice-effects">${formatEffects(choice.effects)}</div>
                    ${choice.addCard ? `<div class="choice-bonus">+Card: ${choice.addCard}</div>` : ''}
                    ${choice.removeCard ? `<div class="choice-penalty">-Card: ${choice.removeCard}</div>` : ''}
                    ${choice.removeTag ? `<div class="choice-penalty">Remove all "${choice.removeTag}" cards</div>` : ''}
                </button>
            `).join('')}
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add choice button listeners
    const choiceButtons = modal.querySelectorAll(".event-choice-btn");
    choiceButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const choiceIndex = parseInt(btn.dataset.choice);
            handleChoice(event, choiceIndex, overlay, onComplete);
        });
    });
    
    // Animate in
    setTimeout(() => {
        overlay.classList.add("active");
        modal.classList.add("active");
    }, 10);
}

/**
 * Handle choice selection
 */
function handleChoice(event, choiceIndex, overlay, onComplete) {
    
    // Resolve choice
    resolveEventChoice(event, choiceIndex);
    
    // Animate out
    overlay.classList.remove("active");
    const modal = overlay.querySelector(".event-modal");
    modal.classList.remove("active");
    
    // Remove after animation
    setTimeout(() => {
        overlay.remove();
        if (typeof onComplete === "function") {
            onComplete();
        }
    }, 300);
}

/**
 * Format effects for display
 */
function formatEffects(effects) {
    if (!effects) return '';
    
    const parts = [];
    for (let key in effects) {
        const value = effects[key];
        const sign = value > 0 ? '+' : '';
        const className = value > 0 ? 'positive' : 'negative';
        parts.push(`<span class="${className}">${sign}${value} ${capitalize(key)}</span>`);
    }
    return parts.join(', ');
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
```

**END OF FILE: ui/eventModal.js**

---

### 3.2 FILE CREATION: ui/eliteNotification.js

**Location:** `c:\git_projects\system-shift\ui\eliteNotification.js`  
**Purpose:** Elite action notification toast  
**Dependencies:** `state.js`

**EXACT FILE CONTENT:**

```javascript
/* ================================================= */
/* SYSTEM SHIFT – ELITE NOTIFICATION UI             */
/* Toast notification for elite actions             */
/* ================================================= */

import { gameState } from "../game/state.js";

/**
 * Show elite action notification
 * @param {object} action - Elite action object
 */
export function showEliteNotification(action) {
    
    // Create notification element
    const notification = document.createElement("div");
    notification.className = "elite-notification";
    
    notification.innerHTML = `
        <div class="elite-notification-header">
            <span class="elite-icon">⚠️</span>
            <span class="elite-label">Elite Action</span>
        </div>
        <div class="elite-notification-body">
            <div class="elite-action-name">${action.name}</div>
            <div class="elite-action-description">${action.description}</div>
            <div class="elite-action-effects">${formatEffects(action.effects)}</div>
        </div>
    `;
    
    // Add to page
    const container = document.getElementById("notificationContainer") || createNotificationContainer();
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add("active");
    }, 10);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        notification.classList.remove("active");
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

/**
 * Create notification container if doesn't exist
 */
function createNotificationContainer() {
    const container = document.createElement("div");
    container.id = "notificationContainer";
    container.className = "notification-container";
    document.body.appendChild(container);
    return container;
}

/**
 * Format effects for display
 */
function formatEffects(effects) {
    if (!effects) return '';
    
    const parts = [];
    for (let key in effects) {
        const value = effects[key];
        const sign = value > 0 ? '+' : '';
        const className = value > 0 ? 'positive' : 'negative';
        parts.push(`<span class="${className}">${sign}${value} ${capitalize(key)}</span>`);
    }
    return parts.join(' ');
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
```

**END OF FILE: ui/eliteNotification.js**

---

### 3.3 FILE MODIFICATION: main.js - Add imports

Find line 13:
```javascript
import { initAmbientEngine } from "./game/ambientEngine.js";
```

Add IMMEDIATELY AFTER:
```javascript
import { showEventModal } from "./ui/eventModal.js";
import { showEliteNotification } from "./ui/eliteNotification.js";
```

### 3.4 FILE MODIFICATION: main.js - Check pending event

Find render function, replace:
```javascript
function render() {
    updateStats();
    renderTracksSequenced();
    renderHand();
    checkSystemPhases();
```

With:
```javascript
function render() {
    
    // Check for pending event
    if (gameState.events.pending) {
        showEventModal(gameState.events.pending, () => {
            render();
        });
        return;
    }
    
    updateStats();
    renderTracksSequenced();
    renderHand();
    checkSystemPhases();
```

### 3.5 FILE MODIFICATION: main.js - Show elite notification

Find handleEndRound, replace:
```javascript
function handleEndRound() {
    if (gameState.gameOver) return;
    endRound();
    if (!gameState.gameOver) drawHand(gameState.handSize);
    render();
}
```

With:
```javascript
function handleEndRound() {
    if (gameState.gameOver) return;
    endRound();
    
    if (gameState.elite.lastAction) {
        showEliteNotification(gameState.elite.lastAction);
    }
    
    if (!gameState.gameOver) drawHand(gameState.handSize);
    render();
}
```

### 3.6 FILE MODIFICATION: index.html

Before `<script type="module" src="main.js?v=3"></script>`, add:
```html
<div id="notificationContainer" class="notification-container"></div>
```

### 3.7 FILE MODIFICATION: style.css

Add at END of file - see full CSS in complete specification document.

**PART 3 COMPLETE - 2 files created, 3 files modified**
