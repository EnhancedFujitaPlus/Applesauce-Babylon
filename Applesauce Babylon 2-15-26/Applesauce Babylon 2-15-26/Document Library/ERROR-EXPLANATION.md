# Understanding Your Errors 🔍

## Error 1: `Cannot set properties of undefined (setting 'x')` at line 227

### What Happened
The level file was trying to use `new THREE.Vector3()` without importing THREE:

```javascript
// ❌ BROKEN - THREE not imported
export const HighNoonShowdown = {
    onLevelStart(core) {
        // Trying to use THREE without importing it!
        const pos = new THREE.Vector3(x, y, z);
    }
}
```

### Why It Failed
When JavaScript can't find `THREE`, it's `undefined`. When you try to call `new THREE.Vector3()`, it's like doing `new undefined.Vector3()`, which throws "Cannot read property 'Vector3' of undefined".

### The Fix
```javascript
// ✅ FIXED - Import THREE at the top
import * as THREE from './three.module.js';

export const HighNoonShowdown = {
    onLevelStart(core) {
        // Now THREE is available!
        const pos = new THREE.Vector3(x, y, z);
    }
}
```

### Rule of Thumb
**Every file that uses THREE must import it**, even if other files already import it. ES6 modules don't share global scope.

---

## Error 2: `Cannot set properties of null (setting 'innerHTML')` 

### What Happened
The HUD update code was trying to update the objectives list before the game was fully initialized:

```javascript
// ❌ BROKEN - No null checks
setInterval(() => {
    const listEl = document.getElementById('objective-list');
    listEl.innerHTML = objectives.map(...); // listEl might be null!
}, 100);
```

### Why It Failed
The `setInterval` starts running immediately, even before:
1. The game is initialized
2. The objectives module is loaded
3. The objectives array exists

So `game.modules.objectives.objectives` is undefined, and trying to call `.map()` on undefined fails.

### The Fix
```javascript
// ✅ FIXED - Check everything exists first
setInterval(() => {
    if (game && game.modules && game.modules.objectives && game.modules.objectives.objectives) {
        const objectives = game.modules.objectives.objectives;
        const listEl = document.getElementById('objective-list');
        if (listEl) {
            listEl.innerHTML = objectives.map(...).join('');
        }
    }
}, 100);
```

### Rule of Thumb
**Always check if things exist before using them**, especially in:
- setInterval/setTimeout callbacks
- Event handlers
- Async functions
- Module initialization

---

## Common Patterns to Avoid These Errors

### Pattern 1: Import Dependencies
```javascript
// Every file that uses external libraries must import them
import * as THREE from './three.module.js';
import { SomeClass } from './some-module.js';
```

### Pattern 2: Defensive Checks
```javascript
// Check before using
if (core.modules.dialogue && core.modules.dialogue.createNPC) {
    core.modules.dialogue.createNPC(...);
}
```

### Pattern 3: Try-Catch for Safety
```javascript
try {
    const npc = core.modules.dialogue.createNPC(...);
    if (npc) {
        npc.rotation.x = Math.PI / 2;
    }
} catch (error) {
    console.warn('Failed to create NPC:', error);
}
```

### Pattern 4: Optional Chaining (Modern JS)
```javascript
// Modern syntax - stops if any part is null/undefined
const count = game?.modules?.objectives?.objectives?.length ?? 0;
```

---

## What I Fixed

### 1. applesauce-level-wildwest.js
- ✅ Added `import * as THREE from './three.module.js'` at the top
- ✅ Added try-catch around NPC creation
- ✅ Added null checks before accessing NPC properties
- ✅ Added THREE availability check in onLevelStart

### 2. wildwest-level.html
- ✅ Added null checks before accessing DOM elements
- ✅ Added full chain validation for objectives module
- ✅ Added element existence checks before setting innerHTML
- ✅ Better error messages that show which file is missing

---

## Testing Checklist

Before running your game, verify:

1. **Imports**: Every file that uses THREE has `import * as THREE`
2. **File Structure**: All required files are in the right place
3. **Module Checks**: Code checks if modules exist before using them
4. **Console**: Open F12 and watch for errors
5. **Graceful Degradation**: Game doesn't crash if optional features fail

---

## Debug Process

When you see an error:

1. **Read the error message carefully**
   - "Cannot set properties of undefined" → Something is undefined
   - Look at what property it's trying to set (e.g., 'x', 'innerHTML')

2. **Find the line number**
   - Error shows: `file.js:227` → Line 227 in file.js
   - Open that file and look at that line

3. **Trace backwards**
   - What variable is being used?
   - Where does that variable come from?
   - Is it being checked for null/undefined?

4. **Add checks**
   - If something might be undefined, check it first
   - Use try-catch for risky operations
   - Log to console to see what's actually happening

---

## Pro Tips

### Tip 1: Console.log Everything
```javascript
console.log('🎮 Game:', game);
console.log('📦 Modules:', game?.modules);
console.log('🎯 Objectives:', game?.modules?.objectives);
```

### Tip 2: Early Returns
```javascript
onLevelStart(core) {
    if (!THREE) {
        console.error('THREE not loaded!');
        return; // Stop execution if critical dependency missing
    }
    // ... rest of code
}
```

### Tip 3: Default Values
```javascript
const objectives = game?.modules?.objectives?.objectives || [];
// If anything is undefined, use empty array instead
```

### Tip 4: Separate Concerns
```javascript
// Instead of one big function:
function initLevel() {
    try { spawnNPCs(); } catch(e) { console.warn('NPCs failed', e); }
    try { createBuildings(); } catch(e) { console.warn('Buildings failed', e); }
    try { setupTrain(); } catch(e) { console.warn('Train failed', e); }
}
// Now one failure doesn't kill the whole level!
```

---

## Your Errors - Solved! ✅

Both errors are now fixed:

1. **THREE import** - Level file now imports THREE
2. **Null checks** - HTML now validates before accessing properties
3. **Try-catch** - NPC creation wrapped in error handlers
4. **Defensive coding** - Checks added throughout

Your game should now load without crashing! 🎮🤠
