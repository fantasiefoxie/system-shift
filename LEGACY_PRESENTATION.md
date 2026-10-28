# Legacy Presentation Isolation

The canonical player-facing UX pipeline is now:

- `index.html` layout zones (`command-strip`, `systems-board`, `operations-lore`)
- `main.js` render + round flow state machine
- `game/uiEvents.js` normalized event surface + feed contract
- `game/notificationCenter.js` unified transient notifications

The following modules are explicitly marked deprecated because they are tied to an older track model and are not part of current runtime UX:

- `game/commentary.js`
- `game/pressure.js`
- `game/resistance.js`
- `game/graph.js`
- `game/timeline.js`
- `game/endings.js`

Do not extend these modules for current UX work. Add new presentation behavior through the canonical pipeline above.
