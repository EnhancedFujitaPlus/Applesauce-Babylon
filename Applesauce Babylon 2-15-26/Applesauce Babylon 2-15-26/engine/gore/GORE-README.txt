GORE SYSTEM - COMPLETE SETUP
=============================

Your gore system is now fully modular and compatible with Three.js r182!

## 📦 WHAT'S INCLUDED:

1. **applesauce-gore-r182.js** - Modular gore system (ES module)
2. **applesauce-core-r182-with-gore.js** - Updated core engine with gore integration
3. **gore-test-demo.html** - Interactive test page to verify everything works
4. **GORE-SYSTEM-GUIDE.txt** - Complete usage documentation

## ✅ WHAT WAS CHANGED:

### applesauce-gore-r182.js
- ✅ Converted to ES module format
- ✅ Added `import * as THREE from './three.module.js'`
- ✅ Added `export class ApplesauceGore`
- ✅ 100% compatible with Three.js r182

### applesauce-core-r182-with-gore.js
- ✅ Added gore module import
- ✅ Auto-initializes gore when `goreEnabled: true`
- ✅ Gore update loop already integrated
- ✅ Added gore effect to lava collision

## 🚀 QUICK START:

### Step 1: File Structure
```
your-game-folder/
├── three.module.js                      ← Three.js r182
├── applesauce-core-r182-with-gore.js    ← Updated core
├── applesauce-gore-r182.js              ← Gore module
├── applesauce-main-menu-modular-r182.html
├── level-01-config.js
└── gore-test-demo.html                  ← Test it here!
```

### Step 2: Test the Gore System
1. Open `gore-test-demo.html` in your browser (with live server)
2. Click the buttons to trigger different gore effects
3. Verify blood particles and body parts appear

### Step 3: Use in Your Game
Replace your old core file with the new one:
- **OLD:** `applesauce-core-r182.js`
- **NEW:** `applesauce-core-r182-with-gore.js`

That's it! Gore is now automatically enabled.

## 🎮 HOW TO USE:

### In Game Initialization:
```javascript
// Gore enabled by default
const game = new ApplesauceCore({
    goreEnabled: true  // Can set to false to disable
});
```

### Trigger Gore Effects:
```javascript
// Blood splatter
game.modules.gore.createBloodSplatter(position, velocity, 30);

// Blood pool
game.modules.gore.createBloodPool(position, 2);

// Body parts
game.modules.gore.createGibs(position, velocity, 5);

// Everything at once!
game.modules.gore.createMassiveSplatter(position, velocity);
```

See **GORE-SYSTEM-GUIDE.txt** for complete examples!

## 🔧 INTEGRATION EXAMPLES:

### Example 1: Player Death
```javascript
function killPlayer(player) {
    if (gameInstance.modules.gore) {
        const pos = player.position.clone();
        const vel = player.velocity.clone();
        gameInstance.modules.gore.createMassiveSplatter(pos, vel);
    }
    // Handle respawn...
}
```

### Example 2: Collision with Obstacle
```javascript
function checkCollisions(player, obstacle) {
    if (collision && gameInstance.modules.gore) {
        const impactPoint = getCollisionPoint();
        const impactVel = player.velocity.clone().multiplyScalar(-0.5);
        gameInstance.modules.gore.createBloodSplatter(impactPoint, impactVel, 40);
    }
}
```

### Example 3: Failed Trick Landing
```javascript
function onHardLanding(player, force) {
    if (force > 0.8 && gameInstance.modules.gore) {
        const pos = player.position.clone();
        const vel = new THREE.Vector3(0, 0.2, 0);
        gameInstance.modules.gore.createBloodSplatter(pos, vel, 15);
        gameInstance.modules.gore.createBloodPool(pos, 1);
    }
}
```

## 🎨 GORE FEATURES:

### Blood Particles:
- Physics simulation (gravity, friction)
- Random spray patterns
- Fade out over time
- Sticks to ground when velocity is low
- Max 2000 particles (auto-managed)

### Blood Pools:
- Ground decals
- Larger and last longer than particles
- Perfect for death scenes

### Body Parts (Gibs):
- Random types: heads, limbs, torsos
- Full physics: tumbling, bouncing
- Cast shadows
- Come to rest on ground

### Massive Splatter:
- Combines all effects
- 50 blood particles
- Large blood pool
- 8 body parts
- Perfect for dramatic deaths!

## 🎯 WHAT'S ALREADY INTEGRATED:

The core engine already handles:
- ✅ Module initialization (when goreEnabled: true)
- ✅ Update loop (gore physics runs every frame)
- ✅ Lava collision (triggers massive splatter)
- ✅ Module cleanup (when clearing levels)

You just need to add gore triggers to your specific collision/death scenarios!

## 🔍 TROUBLESHOOTING:

### Gore not showing?
1. Check `game.modules.gore` is not null
2. Verify `goreEnabled: true` in config
3. Open browser console (F12) for errors
4. Run `gore-test-demo.html` to verify basic setup

### Module import errors?
- Make sure all three files are in the same folder:
  - three.module.js
  - applesauce-core-r182-with-gore.js
  - applesauce-gore-r182.js
- Using live server? (Required for ES modules)

### Gore falls through terrain?
- Check `game.getTerrainHeight()` is working
- Make sure terrain is created before triggering gore

### Performance issues?
- Reduce particle counts (30 → 15)
- Lower maxBloodParticles in gore constructor
- Call `game.modules.gore.clear()` more frequently

## 📝 CODE ARCHITECTURE:

```
applesauce-core-r182-with-gore.js
├── imports THREE from three.module.js
├── imports ApplesauceGore from applesauce-gore-r182.js
└── initializes gore in constructor if enabled

applesauce-gore-r182.js
├── imports THREE from three.module.js
├── exports ApplesauceGore class
└── self-contained gore logic
```

Benefits of this architecture:
- ✅ Modular and maintainable
- ✅ Easy to enable/disable
- ✅ No global variables
- ✅ Clean separation of concerns
- ✅ Easy to add more modules later

## 🎬 NEXT STEPS:

1. **Test:** Run `gore-test-demo.html` to verify it works
2. **Replace:** Swap your old core file with the new one
3. **Add triggers:** Add gore calls to your death/collision code
4. **Customize:** Adjust colors, particle counts, lifetimes
5. **Expand:** Add more gore types (explosions, dismemberment, etc.)

## 📚 MORE INFO:

- **Usage Examples:** See GORE-SYSTEM-GUIDE.txt
- **Test Demo:** Open gore-test-demo.html
- **Module System:** See SETUP-GUIDE-R182-MODULES.txt

## 🛹 FOR YOUR RECORD LABEL:

Since you're making this for artists at South of South Records:

**Content Warning Option:**
```javascript
// Let artists toggle gore
const userSettings = {
    goreEnabled: false  // Artists can set this
};

const game = new ApplesauceCore({
    goreEnabled: userSettings.goreEnabled
});
```

**Rating System:**
You might want to add a content rating display:
- Gore ON = Mature (18+)
- Gore OFF = Teen (13+)

---

Your gore system is ready to use! 🩸🛹

Questions? Check the GORE-SYSTEM-GUIDE.txt or test with gore-test-demo.html!
