# Quick Integration Guide
## Adding Collision + Hybrid Gore to ApplesauceCore

---

## 🎯 STEP 1: Add the Imports

At the top of your `applesauce-core-r182-FINAL.js`, add:

```javascript
// Existing imports
import * as THREE from './three.module.js';
import { ApplesauceGore } from './applesauce-gore-r182.js';
import { ApplesauceDialogue } from './applesauce-dialogue-r182.js';
import { ApplesauceEnemies } from './applesauce-enemies-r182.js';
import { ApplesauceObjectives } from './applesauce-objectives-r182.js';
import { ApplesauceTerrain } from './applesauce-terrain-r182.js';

// NEW: Add these
import { ApplesauceCollision } from './applesauce-collision-r182.js';
import { ApplesauceHybridGore } from './applesauce-hybrid-gore-r182.js';  // OPTIONAL
```

---

## 🎯 STEP 2: Register Modules in Constructor

In your `ApplesauceCore` constructor (around line 109), update the modules object:

```javascript
// Module hooks
this.modules = {
    gore: null,
    dialogue: null,
    enemies: null,
    objectives: null,
    terrain: null,
    weather: null,
    collision: null  // ADD THIS
};
```

Then in the initialization section (around line 119):

```javascript
// Initialize terrain module (always enabled)
this.modules.terrain = new ApplesauceTerrain(this);

// OPTION A: Use Hybrid Gore (Recommended)
if (this.config.goreEnabled) {
    this.modules.gore = new ApplesauceHybridGore(this);
}

// OPTION B: Keep original gore (if you prefer)
// if (this.config.goreEnabled) {
//     this.modules.gore = new ApplesauceGore(this);
// }

// ... rest of module initialization ...

// NEW: Add collision module
if (this.config.collisionEnabled !== false) {
    this.modules.collision = new ApplesauceCollision(this);
    this.modules.collision.init();
}
```

---

## 🎯 STEP 3: Update the Main Loop

In your `update()` method (around line 732), add collision update:

```javascript
update() {
    if (this.state.paused) return;
    
    // Core physics
    this.updatePhysics();
    
    // NEW: Add collision check (before gore update)
    if (this.modules.collision && this.modules.collision.update) {
        this.modules.collision.update(this);
    }
    
    // Call module updates
    if (this.modules.enemies && this.modules.enemies.update) {
        this.modules.enemies.update(this);
    }
    
    if (this.modules.gore && this.modules.gore.update) {
        this.modules.gore.update(this);
    }
    
    // ... rest of updates ...
}
```

---

## 🎯 STEP 4: Add Collision Clear to clearLevel()

In `clearLevel()` method (around line 218):

```javascript
clearLevel() {
    // ... existing clear code ...
    
    if (this.modules.objectives) {
        this.modules.objectives.clear();
    }
    
    // NEW: Clear collision
    if (this.modules.collision) {
        this.modules.collision.clear();
    }
    
    if (this.modules.weather) {
        this.modules.weather.clear();
    }
    
    // ... rest of clear code ...
}
```

---

## ✅ DONE! That's It!

The collision system now:
- ✅ Automatically detects enemy collisions
- ✅ Classifies kills (grind/trick/combo/impact)
- ✅ Creates appropriate gore effects
- ✅ Updates combo system
- ✅ Adds score

---

## 🎮 OPTIONAL: Performance Settings

Add to your game config:

```javascript
const game = new ApplesauceCore({
    goreEnabled: true,
    collisionEnabled: true,
    
    // Hybrid Gore settings (optional)
    hybridGore: {
        maxVerletGibs: 15,      // Lower on mobile
        autoPerformance: true,   // Auto-adjust
        targetFPS: 30           // Minimum FPS
    }
});
```

---

## 🎯 OPTIONAL: Manual Collision Calls

You can also manually trigger kills:

```javascript
// Board swing attack (in your controls somewhere)
if (keys['E']) {  // Example: E key for attack
    const direction = new THREE.Vector3(
        Math.sin(this.state.rotation),
        0,
        Math.cos(this.state.rotation)
    );
    
    this.modules.collision.boardSwingAttack(
        this.player.position,
        direction,
        this
    );
}

// Explosion damage (for grenades, etc.)
this.modules.collision.explosionDamage(
    explosionPosition,
    explosionRadius,
    this
);
```

---

## 🩸 OPTIONAL: Hybrid Gore Features

If you're using the hybrid gore module:

```javascript
// Set performance mode manually
this.modules.gore.setPerformanceMode('auto');  // or 'verlet' or 'traditional'

// Get stats
const stats = this.modules.gore.getStats();
console.log(`Verlet gibs: ${stats.verletGibs}`);

// Call skating-specific gore
this.modules.gore.createGrindGore(position, direction, speed);
this.modules.gore.createTrickLandingGore(position, velocity, 'kickflip');
this.modules.gore.createComboGore(position, velocity, comboCount);
```

---

## 📊 Testing

After integration, test:

1. **Spawn enemies** (your existing enemy system)
2. **Skate into them** at different speeds
3. **Try grinding** near enemies
4. **Jump and land** on enemies (trick kills)
5. **Build combos** with successive kills

You should see:
- Different gore based on kill type
- Combo multiplier increasing
- Score going up
- Console logs showing kill types

---

## 🐛 Troubleshooting

**Kills not registering?**
- Make sure enemies are being added through your enemy module
- Check that collision module is initialized with `init()`
- Verify collision radius settings

**No gore appearing?**
- Check that gore module is enabled
- Verify gore module is updating in main loop
- Look for console errors

**Performance issues?**
- Set `maxVerletGibs` lower (try 5-10 on mobile)
- Use `setPerformanceMode('traditional')` to disable Verlet
- Enable `autoPerformance` for automatic adjustment

---

## 🎯 Summary

**Minimal changes needed:**
1. Import 2 new modules
2. Add `collision: null` to modules object
3. Initialize collision module
4. Add collision.update() to main loop
5. Add collision.clear() to clearLevel()

**That's literally it!** The collision system now handles everything automatically. Gore, scoring, combos - all managed for you.

**Collision works with:**
- ✅ Your existing enemy system
- ✅ Your existing gore (traditional or hybrid)
- ✅ Your existing state (grinding, tricks, speed)
- ✅ Your existing scoring system

No other changes needed!
