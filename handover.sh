#!/bin/bash
# Usage: bash handover.sh "describe the task here"
# Prints a complete ready-to-paste AI handover block.

TASK="${1:-[DESCRIBE TASK HERE]}"
COMMIT=$(git log --oneline -1)
PATH_="c:/git_projects/system-shift"

cat <<EOF
================================================
SYSTEM SHIFT — AI HANDOVER
================================================
Repo:   $PATH_
Commit: $COMMIT

------------------------------------------------
RULES (read before touching any code)
------------------------------------------------
1. Tracks: clamp all writes to [0,20]
   Math.max(0, Math.min(20, value))

2. RNG: use seededRandom() from game/rng.js
   never Math.random() in game logic

3. Timing: setTimeout/delay() for UI only
   game state transitions must be synchronous

4. localStorage: wrap every read in try/catch
   return safe default on failure

5. Simulation sync: after changing outcomeEngine.js
   or balance values, update simulate.js to match
   re-run: node simulate.js
   verify all 8 endings within target bands:
     SOCIAL TRANSFORMATION        15-25%
     ECOLOGICAL TRANSITION        15-25%
     TURBULENT TRANSFORMATION     10-20%
     MANAGED STABILITY            10-20%
     SYSTEM DRIFT                 10-20%
     SYSTEM COLLAPSE               5-15%
     AUTHORITARIAN CONSOLIDATION   5-15%
     DUAL POWER TRANSITION         5-15%

6. Opposition: use gameState.surge
   not gameState.resources.momentum

7. Thresholds: guard with activeThresholds.includes(id)

8. UI: disable elements on use, clean up dynamic DOM nodes

9. Per-act state: reset negotiation + scouting on act transitions

10. Errors: never crash silently, log + return safe fallback

------------------------------------------------
KNOWN ISSUES (fix if touching related code)
------------------------------------------------
- narrative.js:406 + tutorial.js:144 — localStorage
  writes/reads have no try/catch
- game/negotiation.js — successfulNegotiations stat
  not incremented (Diplomat achievement never fires)
- SYSTEM DRIFT at 7.2% — below 10-20% target
- main.js renderAchievements() duplicates achievement
  definitions already in game/achievements.js

------------------------------------------------
TASK
------------------------------------------------
$TASK

------------------------------------------------
WHEN DONE
------------------------------------------------
- run: node simulate.js (if game logic changed)
- commit with descriptive message
- push to origin main
================================================
EOF
