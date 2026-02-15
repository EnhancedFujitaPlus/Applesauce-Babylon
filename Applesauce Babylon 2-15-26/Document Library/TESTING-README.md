# Level 99 - Collision Test Arena
## Testing Guide for ApplesauceCore Level Loading

---

## 📦 WHAT'S INCLUDED

**level99-collision-test.js** - A complete test level that:
- ✅ Tests collision detection
- ✅ Tests hybrid gore system
- ✅ Tests all kill types (grind, trick, combo, impact)
- ✅ Has 4 objectives to complete
- ✅ Spawns enemies in strategic positions
- ✅ Includes visual markers for testing

**index-collision-test.html** - Test harness that:
- ✅ Loads ApplesauceCore
- ✅ Loads the test level
- ✅ Shows live HUD with stats
- ✅ Displays objectives
- ✅ Updates in real-time

---

## 🚀 HOW TO TEST

### Option 1: Quick Test (Recommended)

1. **Place files in your APPLESAUCE directory:**
   ```
   applesauce/
   ├── three.module.js
   ├── applesauce-core-r182-FINAL.js
   ├── applesauce-gore-r182.js
   ├── applesauce-enemies-r182.js
   ├── applesauce-objectives-r182.js
   ├── applesauce-terrain-r182.js
   ├── applesauce-dialogue-r182.js
   ├── applesauce-collision-r182.js        ← NEW
   ├── applesauce-hybrid-gore-r182.js      ← NEW
   ├── applesauce-verlet-gore-test.js      ← NEW
   ├── level99-collision-test.js           ← NEW
   └── index-collision-test.html           ← NEW
   ```

2. **Make sure you've integrated collision module** (see quick-integration-guide.md)

3. **Open `index-collision-test.html` in your browser**

4. **Test the objectives:**
   - Grind on the central rail through enemies
   - Jump off ramps and land on enemies  
   - Build speed and crash into enemies
   - Chain multiple kills for combos

---

### Option 2: Add to Existing Index

If you already have an index.html, just load the level:

```javascript
import level99 from './level99-collision-test.js';

// Load the test level
await game.loadLevel(level99);
```

---

## 🎯 WHAT TO TEST

### 1. Level Loading
- ✅ Does the level load without errors?
- ✅ Are enemies spawned?
- ✅ Are obstacles created?
- ✅ Is terrain generated?

### 2. Collision Detection
- ✅ Do collisions register when skating into enemies?
- ✅ Are different kill types detected?
- ✅ Does combo system work?

### 3. Gore System
- ✅ Does gore appear on kills?
- ✅ Are different gore effects used for different kills?
- ✅ Is Verlet used for grind/trick kills?
- ✅ Is traditional used for ambient kills?

### 4. Performance
- ✅ Is FPS stable (check browser console)?
- ✅ Does hybrid gore adapt to performance?
- ✅ Can you spawn many enemies without lag?

---

## 🎮 TEST SCENARIOS

### Scenario 1: Grind Kill
1. Skate up to the central rail (orange glow)
2. Press Space to grind
3. Grind through the line of enemies
4. **Expected:** Blade-cut gore, grind kill registered

### Scenario 2: Trick Kill
1. Skate toward one of the side ramps
2. Jump off the ramp
3. Land on the enemy below (green ring marker)
4. **Expected:** Crushing gore, trick kill registered

### Scenario 3: Combo Kill
1. Build speed (hold Shift)
2. Skate into the yellow combo zone
3. Quickly kill multiple enemies in succession
4. **Expected:** Combo multiplier increases, brutal gore

### Scenario 4: Impact Kill
1. Build maximum speed (hold W + Shift)
2. Crash into enemies at high speed
3. **Expected:** Explosive gore, impact kill registered

---

## 🐛 TROUBLESHOOTING

### "Level won't load"
**Check:**
- All module files are present
- File paths match your directory structure
- Console for import errors
- Collision module is integrated into core

### "No enemies spawning"
**Check:**
- `applesauce-enemies-r182.js` is loaded
- Enemies module is enabled in core
- Console for spawn errors
- `onLevelStart` is being called

### "Collisions not registering"
**Check:**
- Collision module is initialized
- Collision update is in main loop
- Enemies have `.alive` property
- Console for collision stats: `game.modules.collision.logStats()`

### "No gore appearing"
**Check:**
- Gore module is enabled
- Gore is updating in main loop
- Console for gore errors
- Try: `game.modules.gore.logStats()`

### "Performance issues"
**Check:**
- FPS in console
- Try traditional mode: `game.modules.gore.setPerformanceMode('traditional')`
- Reduce max Verlet gibs: `game.modules.gore.settings.maxVerletGibs = 5`

---

## 📊 CHECKING STATS

Open browser console and type:

```javascript
// View collision stats
game.modules.collision.logStats();

// View gore stats
game.modules.gore.logStats();

// View current state
console.log('Speed:', game.state.speed);
console.log('Grinding:', game.state.grinding);
console.log('Combo:', game.state.combo);
console.log('Score:', game.state.score);

// Check objectives
level99.objectives.forEach(obj => {
    console.log(obj.description, obj.completed ? '✅' : '❌');
});
```

---

## ✅ SUCCESS CRITERIA

Level loading is working if:
- [x] Level loads without console errors
- [x] Player spawns at correct position
- [x] Enemies are visible and positioned correctly
- [x] Rails and obstacles appear
- [x] Collisions trigger gore effects
- [x] Objectives can be completed
- [x] Stats update in HUD

---

## 🎯 EXPECTED CONSOLE OUTPUT

```
🛹 APPLESAUCE Core Engine v4.0 (Three.js r182) initialized
📦 Module registered: terrain
💀 APPLESAUCE Enemies Module initialized
🩸 APPLESAUCE Hybrid Gore Module initialized
   ⚡ Verlet for important kills
   💨 Traditional for performance
💥 APPLESAUCE Collision Module initialized
📦 Loading level: Collision Test Arena
🎬 Calling level onLevelStart...
🎮 Collision Test Arena loaded
📋 Test different kill types:
   • Grind kills - grind on the central rail near enemies
   • Trick kills - jump off ramps and land on enemies
   • Impact kills - build speed and crash into enemies
   • Combo kills - chain multiple kills quickly
🎯 Spawning enemies for grind kill test...
🎯 Spawning enemies for trick kill test...
🎯 Spawning enemies for impact kill test...
🎯 Spawning enemy cluster for combo test...
✨ Test markers added to scene
📊 Module Status:
   Collision: ✅ Active
   Gore: ✅ Active
   Enemies: ✅ Active
✅ Level 99 loaded successfully
🛹 Game started!
```

---

## 💡 TIPS

1. **Watch the console** - Lots of helpful debug output
2. **Use browser dev tools** - Monitor FPS, errors
3. **Test systematically** - One kill type at a time
4. **Check objectives** - They guide you through tests
5. **Experiment** - Try different speeds, angles, tricks

---

## 🎨 LEVEL STRUCTURE EXPLAINED

```javascript
const level = {
    meta: { ... },           // Level info
    scene: { ... },          // Sky, fog colors
    terrain: { ... },        // Ground setup
    playerStart: { ... },    // Spawn position
    obstacles: [ ... ],      // Rails, ramps, boxes
    objectives: [ ... ],     // Test goals
    onLevelStart: fn,        // Spawn enemies, setup
    onLevelUpdate: fn        // Check objectives
};
```

**Key parts:**
- `onLevelStart()` - Runs once when level loads (spawn enemies here)
- `onLevelUpdate()` - Runs every frame (check objectives here)
- `objectives` - Array of test goals with check functions

---

## 🔧 CUSTOMIZATION

Want to modify the test level?

### Add more enemies:
```javascript
core.modules.enemies.spawnEnemy(x, y, z, { type: 'test_dummy' });
```

### Change spawn position:
```javascript
playerStart: {
    x: 10,  // Move right
    y: 2,
    z: 20   // Further back
}
```

### Add more obstacles:
```javascript
{
    type: 'box',
    position: { x: 5, y: 0.5, z: 5 },
    size: { x: 1, y: 1, z: 1 },
    color: 0xff0000
}
```

### Adjust performance:
```javascript
// In onLevelStart:
core.modules.gore.settings.maxVerletGibs = 10;  // Lower = faster
core.modules.gore.setPerformanceMode('traditional');  // Fastest
```

---

## 📝 NOTES

- This level uses **flat terrain** for easy testing
- Enemies are **stationary** to make testing easier
- **Visual markers** show test zones (orange rail, green landing zones, yellow combo zone)
- **Objectives auto-check** and complete when conditions met
- Level announces when **all tests passed**

---

## 🎉 SUCCESS!

If you can:
1. Load the level
2. See enemies spawn
3. Kill enemies and see gore
4. Complete the objectives

**Then your level loading system is working!** 🎯

You're ready to create more complex levels with:
- Multiple enemy types
- Complex terrain
- Story objectives
- Boss fights
- Whatever you want!

---

**Questions?** Check the console output - it's very verbose and will guide you through any issues.
