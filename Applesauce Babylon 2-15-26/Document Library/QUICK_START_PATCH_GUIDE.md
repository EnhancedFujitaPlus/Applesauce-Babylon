# QUICK START: PATCHING YOUR EXISTING CODE

## 🎯 IMMEDIATE CHANGES TO MAKE

### STEP 1: Replace your materials.js
Your current materials.js has building functions mixed in. Replace the ENTIRE file with the new clean version:
- **File location**: `engine/applesauce-materials.js`
- **Action**: Replace entire contents with `applesauce-materials.js` (the clean one provided)

### STEP 2: Add the new LevelBuilder module
- **File location**: `engine/applesauce-level-builder.js`
- **Action**: Create this new file with `applesauce-level-builder.js` contents

### STEP 3: Update applesauce-core.js

#### 3a. Add import at the top:
```javascript
// Find this section around line 5-18:
import * as THREE from './three.module.js';
import { ApplesauceGore } from './applesauce-gore.js';
import { ApplesauceDialogue } from './applesauce-dialogue.js';
// ... other imports ...

// ADD THIS LINE:
import { ApplesauceLevelBuilder } from './applesauce-level-builder.js';
```

#### 3b. Add module initialization:
```javascript
// Find this section around line 96-109 in constructor:
this.modules = {
    player: null,
    materials: null,
    gore: null,
    dialogue: null,
    enemies: null,
    objectives: null,
    terrain: null,
    weather: null,
    weapons: null,
    combat: null,
    gear: null,
    music: null
};

// ADD THIS:
this.modules.levelBuilder = null;  // ← ADD THIS LINE
```

#### 3c. Initialize the LevelBuilder:
```javascript
// Find this section around line 131-133:
if (this.config.materialsEnabled) {
    this.modules.materials = new ApplesauceMaterials(this);  // Fix: was .gore
}

// ADD AFTER LINE 133:
if (this.config.levelBuilderEnabled !== false) {
    this.modules.levelBuilder = new ApplesauceLevelBuilder(this);
}
```

**NOTE**: I noticed a bug on line 132 - it says `this.modules.gore = new ApplesauceMaterials(this)` but it should be `this.modules.materials = new ApplesauceMaterials(this)`. Fix that too!

### STEP 4: Update your game.html

Find where you create the game:
```javascript
const game = new ApplesauceCore({
    goreEnabled: true,
    maxSpeed: 1.2,
    // ... other config ...
});
```

**ADD** these two lines:
```javascript
const game = new ApplesauceCore({
    goreEnabled: true,
    maxSpeed: 1.2,
    materialsEnabled: true,      // ← ADD THIS
    levelBuilderEnabled: true,   // ← ADD THIS
    // ... other config ...
});
```

### STEP 5: Update an existing level

Open one of your level files (like `level_16.js`). Find the `onLevelStart` function.

**BEFORE** (old way with mixed responsibilities):
```javascript
onLevelStart: function(core) {
    // Creating obstacles directly with THREE.js
    const railGeo = new THREE.CylinderGeometry(0.15, 0.15, 20);
    const rail = new THREE.Mesh(railGeo, metalMaterial);
    core.scene.add(rail);
    // etc...
}
```

**AFTER** (new way with LevelBuilder):
```javascript
onLevelStart: function(core) {
    const builder = core.modules.levelBuilder;
    
    // Now just tell the builder what you want
    builder.createRail(-10, 30, 25, 2);
    builder.createQuarterPipe(15, 50, Math.PI / 2, 10);
    builder.createCheckpoint(0, 100, 1);
}
```

---

## 🧪 TESTING YOUR CHANGES

### Test 1: Materials Module
Open browser console after loading game:
```javascript
console.log(game.modules.materials);
// Should see: ApplesauceMaterials {materials: {...}, graffitiColors: [...]}
```

### Test 2: LevelBuilder Module
```javascript
console.log(game.modules.levelBuilder);
// Should see: ApplesauceLevelBuilder {core: ..., scene: ..., materials: ...}
```

### Test 3: Create a Rail
In browser console:
```javascript
game.modules.levelBuilder.createRail(0, 50, 20, 2);
// Should see a rail appear in the scene!
```

### Test 4: Check Materials
```javascript
console.log(game.modules.levelBuilder.materials.getMaterial('metal'));
// Should see: MeshStandardMaterial {color: ..., metalness: 0.9, ...}
```

---

## 🐛 COMMON ERRORS & FIXES

### Error: "Cannot read property 'getMaterial' of undefined"
**Problem**: Materials module not initialized before LevelBuilder
**Fix**: Make sure materials init comes BEFORE levelBuilder init in core.js

### Error: "levelBuilder is null"
**Problem**: Config didn't enable it
**Fix**: Add `levelBuilderEnabled: true` to config OR remove the check (it defaults to true)

### Error: "Materials not defined in this scope"
**Problem**: Old level file trying to use materials directly
**Fix**: Use `core.modules.materials.getMaterial('metal')` or better yet, just use the builder

### Error: Rails not grinding
**Problem**: Rails not being added to core.rails array
**Fix**: Already handled in the new LevelBuilder - it automatically adds grindable objects

---

## 📋 VERIFICATION CHECKLIST

After making all changes, verify:

- [ ] ✅ No console errors on page load
- [ ] ✅ `game.modules.materials` exists
- [ ] ✅ `game.modules.levelBuilder` exists
- [ ] ✅ `game.modules.levelBuilder.materials` exists (builder has access to materials)
- [ ] ✅ Level loads without errors
- [ ] ✅ Can see rails/ramps in the scene
- [ ] ✅ Can grind on rails (test by skating into one)
- [ ] ✅ Materials look correct (metal is shiny, wood is brown, etc)

---

## 🚀 NEXT: CREATE YOUR FIRST SPEEDRUN LEVEL

Once everything above works, try this quick test level:

```javascript
// test-speedrun.js
export const test_speedrun = {
    meta: {
        number: 98,
        name: "TEST SPEEDRUN",
        description: "Quick test level"
    },
    
    scene: {
        background: 0x1a1a2e,
        fog: { color: 0x1a1a2e, near: 50, far: 300 }
    },
    
    terrain: {
        type: 'flat',
        width: 100,
        length: 200
    },
    
    playerStart: { x: 0, z: 10 },
    
    onLevelStart: function(core) {
        const b = core.modules.levelBuilder;
        
        // Simple straight course
        b.createRail(-5, 30, 20);
        b.createRail(5, 30, 20);
        b.createCheckpoint(0, 60, 1);
        b.createQuarterPipe(0, 80, 0, 10);
        b.createCheckpoint(0, 120, 2);
        b.createSpeedBoost(0, 140, 0);
        b.createCheckpoint(0, 180, 'finish');
    }
};
```

Load it in game.html:
```javascript
import { test_speedrun } from './levels/test-speedrun.js';
await game.loadLevel(test_speedrun);
```

If you can:
1. See all the obstacles
2. Grind the rails
3. Hit the checkpoints
4. Finish the level

**YOU'RE READY TO BUILD FOR REAL! 🎉**

---

## 💾 FILES SUMMARY

You should now have:

```
/your-project/
├── engine/
│   ├── applesauce-core.js (PATCHED - added levelBuilder)
│   ├── applesauce-materials.js (NEW - clean version)
│   ├── applesauce-level-builder.js (NEW)
│   ├── applesauce-enemies.js (existing)
│   ├── applesauce-gore.js (existing)
│   └── ... (other modules)
│
├── levels/
│   ├── level_16.js (UPDATE to use builder)
│   ├── test-speedrun.js (NEW - for testing)
│   └── level_speedrun_example.js (NEW - full example)
│
└── game.html (PATCHED - added config flags)
```

---

**You're 90% there. Just apply these patches and you'll have a clean, working system!** 🛹💀
