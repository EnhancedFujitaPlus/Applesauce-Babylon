# 🎮 APPLESAUCE Module Path Setup Guide

## The Problem
You're getting "Failed to resolve module specifier" errors because JavaScript ES6 modules are VERY picky about file paths.

## The Solution: Test First, Then Build

### Step 1: Run the Path Test

I've created a **super simple test** that will verify your paths work:

```
📁 YOUR DIRECTORY STRUCTURE SHOULD BE:

your-project/
  └── levels/
      ├── test-minimal.html              ⬅️ Open this in browser
      ├── test-level.js                  ⬅️ Simple test level
      ├── three.module.js                ⬅️ THREE.js library
      └── engine/
          └── applesauce-core-minimal.js ⬅️ Minimal core (no dependencies)
```

### Step 2: Copy Files

1. **Download three.module.js** from Three.js website if you don't have it
2. **Place the test files** in the structure shown above
3. **Open `test-minimal.html`** in your browser
4. **Click "START TEST"**

### Step 3: Read the Results

**✅ If it works:**
- You'll see a flat ground
- A green cube on the right
- A red player you can move with WASD
- Console says "ALL MODULES LOADED SUCCESSFULLY!"

**❌ If it fails:**
- Check the error message on screen
- Open browser console (F12)
- Look for specific file that's missing

---

## Understanding the Import Paths

### In HTML Files:
```javascript
import('./engine/applesauce-core-minimal.js')  // ✅ Looks in engine/ subfolder
import('./test-level.js')                      // ✅ Looks in same folder as HTML
```

### In applesauce-core-minimal.js (inside engine/ folder):
```javascript
import * as THREE from '../three.module.js';   // ✅ Goes UP one folder to levels/
```

### In test-level.js (inside levels/ folder):
```javascript
import * as THREE from './three.module.js';    // ✅ Looks in same folder
```

### Path Prefixes:
- `./file.js` = Same directory
- `../file.js` = Parent directory (go up one level)
- `../../file.js` = Grandparent directory (go up two levels)
- `/file.js` = Root of website

**❌ NEVER use:** `import from 'three'` or `import from 'file.js'` without prefix!

---

## Once the Test Works...

### For Your Full Game:

Your full game structure should be:

```
levels/
  ├── level_circuit_breaker.html
  ├── applesauce-level-racetrack.js
  ├── three.module.js
  └── engine/
      ├── applesauce-core-33.js          ⬅️ Your FULL core
      ├── gore/
      │   └── applesauce-gore.js
      ├── dialogue/
      │   └── applesauce-dialogue.js
      ├── enemies/
      │   └── applesauce-enemies.js
      ├── objectives/
      │   └── applesauce-objectives.js
      ├── terrain/
      │   └── applesauce-terrain-3.js
      ├── pause/
      │   └── applesauce-pause.js
      ├── gear/
      │   └── applesauce-gear.js
      ├── materials/
      │   ├── applesauce-materials.js
      │   └── applesauce-level-builder.js
      ├── music/
      │   └── applesauce-music.js
      ├── weapons/
      │   └── applesauce-weapons.js
      ├── weather/
      │   └── applesauce-weather.js
      ├── combat/
      │   └── applesauce-combat.js
      └── skater/
          └── applesauce-skater.js
```

**The key:** Each module folder needs to exist with its files!

---

## Quick Troubleshooting

### "Cannot find three.module.js"
- ✅ Put `three.module.js` in `levels/` folder
- ✅ Make sure it's named exactly `three.module.js` (not `three.js`)

### "Cannot find applesauce-core"
- ✅ Put it in `levels/engine/` folder
- ✅ Check the filename matches exactly

### "Cannot find applesauce-level-racetrack"
- ✅ Put it in `levels/` folder (same as HTML)
- ✅ Check filename matches

### "Cannot find gore/dialogue/etc modules"
- ✅ These are imported by the FULL core (applesauce-core-33.js)
- ✅ Each needs to be in `levels/engine/[module-name]/`
- ⚠️ Use the MINIMAL core for testing without these!

---

## Common Mistakes

❌ **Putting files in wrong folders**
```
levels/
  ├── engine/
  │   ├── three.module.js     ❌ THREE should be in levels/, not engine/
```

❌ **Wrong path prefix**
```javascript
import * as THREE from 'three.module.js';     // ❌ Missing ./
import * as THREE from '/three.module.js';    // ❌ Wrong prefix
```

❌ **Filename mismatch**
```javascript
import('./applesauce-core.js')                // ❌ File is named applesauce-core-33.js
```

✅ **Correct:**
```
levels/
  ├── three.module.js          ✅ At top level
  └── engine/
      └── core.js              ✅ In subfolder
```

```javascript
import * as THREE from './three.module.js';   // ✅ Correct prefix
import('./engine/core.js');                   // ✅ Matches actual path
```

---

## Testing Checklist

Before running your full game:

1. ✅ Run `test-minimal.html` first
2. ✅ Verify it loads without errors
3. ✅ See the green cube and movable player
4. ✅ Check console shows "ALL MODULES LOADED SUCCESSFULLY!"
5. ✅ Then copy the working structure to your full game

---

## Still Having Issues?

**Use the `test-three-paths.html` file:**
- It automatically tests all possible paths
- Shows you which path works
- Use that path in your imports

**Browser Console (F12):**
- Network tab shows which files failed to load
- Console shows exact error messages
- Look for the first error (others cascade from it)

---

## Why This Matters

Once you get the paths right **once**, you can:
- Reuse the structure for all levels
- Know exactly where to put new files
- Build modular levels efficiently
- Focus on gameplay, not debugging imports!

**The test files eliminate the guesswork. Get them working first! 🎯**
