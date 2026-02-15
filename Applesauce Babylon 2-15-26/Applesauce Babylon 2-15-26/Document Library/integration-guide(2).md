# APPLESAUCE Hybrid Gore Integration Guide
## Adding Skating-Aware Gore to Your Game

---

## 📦 FILE STRUCTURE

```
applesauce/
├── gore/
│   ├── applesauce-gore1-r182.js       (your existing traditional gore)
│   ├── applesauce-verlet-gore-test.js (new Verlet physics)
│   ├── hybrid-gore-manager.js         (new hybrid manager)
│   └── skating-collision-system.js    (new collision detection)
└── game/
    └── applesauce-main.js             (your main game file)
```

---

## 🚀 STEP 1: IMPORT THE MODULES

```javascript
// In your main game file
import { HybridGoreManager } from './gore/hybrid-gore-manager.js';
import { SkatingCollisionSystem } from './gore/skating-collision-system.js';
```

---

## 🎮 STEP 2: INITIALIZE IN YOUR GAME

```javascript
class ApplesauceGame {
    constructor() {
        this.engine = new GameEngine(); // Your existing engine
        
        // Initialize hybrid gore system
        this.gore = new HybridGoreManager(this.engine);
        
        // Initialize collision system with gore reference
        this.collision = new SkatingCollisionSystem(this.gore);
        
        // Your existing game setup...
        this.player = new Skater();
        this.enemies = [];
    }
}
```

---

## 🛹 STEP 3: UPDATE PLAYER MOVEMENT LOOP

```javascript
update(deltaTime) {
    // Update player physics (your existing code)
    this.player.update(deltaTime);
    
    // NEW: Update collision system with current player state
    this.collision.updateSkaterState(
        this.player.position,
        this.player.velocity,
        this.player.boardOrientation
    );
    
    // NEW: Set trick state
    if (this.player.isTricking) {
        this.collision.setTrickState(true, this.player.currentTrick);
    } else {
        this.collision.setTrickState(false);
    }
    
    // NEW: Set grind state
    if (this.player.isGrinding) {
        this.collision.setGrindState(true, this.player.grindSurface);
    } else {
        this.collision.setGrindState(false);
    }
    
    // NEW: Check for collisions
    const collisions = this.collision.checkCollisions(deltaTime);
    
    // NEW: Update gore systems
    this.gore.update(this.engine, deltaTime);
}
```

---

## 💀 STEP 4: ADD ENEMIES

```javascript
// When spawning enemies
spawnEnemy(position) {
    const enemy = {
        position: position.clone(),
        radius: 0.5,
        health: 100,
        mesh: this.createEnemyMesh() // Your visual mesh
    };
    
    // Add to collision system
    this.collision.addEnemy(enemy.position, enemy.radius, enemy.health);
    
    // Add to your game's enemy list
    this.enemies.push(enemy);
}
```

---

## 🔥 STEP 5: ADD GRIND SURFACES

```javascript
// When creating grind rails/edges
createGrindRail(startPoint, endPoint) {
    const rail = {
        start: startPoint,
        end: endPoint,
        type: 'rail' // or 'edge', 'ledge'
    };
    
    // Add to collision system
    this.collision.addGrindSurface(startPoint, endPoint, 'rail');
    
    // Create visual representation
    this.createRailMesh(startPoint, endPoint);
}

// Each frame, check if player is on grind surface
update(deltaTime) {
    // ... other code ...
    
    const grindSurface = this.collision.checkGrindSurfaces();
    if (grindSurface) {
        this.player.isGrinding = true;
        this.player.grindSurface = grindSurface;
    } else {
        this.player.isGrinding = false;
    }
}
```

---

## ⚙️ STEP 6: CONFIGURE PERFORMANCE

```javascript
// Set performance mode based on platform/settings
if (isMobile) {
    this.gore.setPerformanceMode('traditional');
    this.gore.maxVerletGibs = 5;
} else if (settings.graphics === 'low') {
    this.gore.setPerformanceMode('auto');
    this.gore.maxVerletGibs = 10;
} else {
    this.gore.setPerformanceMode('auto');
    this.gore.maxVerletGibs = 20;
}

// Monitor performance and adjust
update(deltaTime) {
    if (this.fps < 30) {
        // Performance struggling - reduce Verlet usage
        this.gore.maxVerletGibs = Math.max(3, this.gore.maxVerletGibs - 1);
    }
}
```

---

## 🎯 STEP 7: MANUAL GORE TRIGGERS (Optional)

You can also manually trigger gore effects for special events:

```javascript
// When player lands a special trick
onSpecialTrickLand(position) {
    this.gore.createTrickLandingGore(
        position,
        this.player.velocity,
        'McTwist'
    );
}

// When player uses a weapon
onGunFire(position, direction) {
    this.gore.createBulletKill(position, direction, 0.45); // .45 caliber
}

// When something explodes
onExplosion(position, radius) {
    this.gore.createExplosionKill(position, radius);
}

// When swinging board as weapon
onBoardSwing(position, direction, speed) {
    this.collision.swingBoard(position, direction, speed);
}
```

---

## 📊 STEP 8: DEBUG & MONITORING

```javascript
// Add debug display
if (DEBUG_MODE) {
    // Draw collision helpers
    this.collision.debugDraw(this.engine.scene);
    
    // Log stats every second
    setInterval(() => {
        this.gore.logStats();
        console.log('Collision Stats:', this.collision.getStats());
    }, 1000);
}

// Get stats for UI display
update() {
    const stats = this.gore.getStats();
    this.ui.updateGoreStats({
        verletGibs: stats.verletGibs,
        traditionalGibs: stats.traditionalGibs,
        combo: stats.combo,
        fps: this.fps
    });
}
```

---

## 🎨 STEP 9: COMBO SYSTEM INTEGRATION

The hybrid system automatically tracks combos. Here's how to display them:

```javascript
update() {
    const stats = this.gore.getStats();
    
    // Show combo multiplier in UI
    if (stats.combo > 1) {
        this.ui.showCombo(stats.combo);
    }
    
    // Combo affects score
    this.score += this.baseScorePerKill * stats.combo;
}
```

---

## 🧹 STEP 10: CLEANUP

```javascript
// Clear gore when restarting level
restartLevel() {
    this.gore.clear();
    this.collision.clearEnemies();
    // ... rest of your restart code ...
}

// Cleanup on game exit
destroy() {
    this.gore.clear();
    this.collision.clearEnemies();
    // ... rest of your cleanup ...
}
```

---

## 🎯 EXAMPLE: FULL KILL SCENARIO

Here's a complete example of a kill happening:

```javascript
// 1. Player is skating at high speed
this.player.velocity.set(0, 0, -10); // 10 m/s forward

// 2. Player initiates kickflip
this.player.startTrick('kickflip');
this.collision.setTrickState(true, 'kickflip');

// 3. Player lands on enemy
update(deltaTime) {
    // Collision system detects hit
    const collisions = this.collision.checkCollisions(deltaTime);
    
    // Hybrid gore determines this is a TRICK KILL
    // - Uses Verlet physics because it's earned
    // - Creates satisfying crush gore
    // - Spawns blood mist and particles
    // - Updates combo multiplier
    
    // Enemy is marked as dead
    // Visual gore appears
    // Player's combo increases
}
```

---

## ⚡ PERFORMANCE TIPS

### DO:
✅ Use `auto` mode - it's smart about when to use Verlet
✅ Set appropriate `maxVerletGibs` for your target platform
✅ Let the system handle combo tracking automatically
✅ Clear old gore periodically in long sessions

### DON'T:
❌ Force `verlet` mode on low-end devices
❌ Create Verlet gibs for every tiny collision
❌ Keep unlimited blood particles around
❌ Forget to call `update()` every frame

---

## 🎮 CONTROL MAPPING EXAMPLE

```javascript
// Example keyboard/controller mapping
onInput(input) {
    switch(input.type) {
        case 'grind':
            // Player presses grind button on rail
            this.collision.setGrindState(true, this.currentRail);
            break;
            
        case 'trick':
            // Player presses trick buttons
            this.player.startTrick(input.trick);
            this.collision.setTrickState(true, input.trick);
            break;
            
        case 'attack':
            // Player attacks with board
            this.collision.swingBoard(
                this.player.position,
                this.player.boardDirection,
                10
            );
            break;
    }
}
```

---

## 🐛 COMMON ISSUES & FIXES

### Issue: Verlet gibs not appearing
**Fix:** Check that `maxVerletGibs` isn't set too low, and verify gore system is updating

### Issue: Performance drops with many kills
**Fix:** Reduce `maxVerletGibs` or switch to `traditional` mode

### Issue: Grind kills not working
**Fix:** Ensure you're calling `setGrindState(true)` when grinding

### Issue: Combos not increasing
**Fix:** Make sure kills are happening within the `comboTimeout` window (default 3s)

---

## 🎯 TESTING CHECKLIST

Before shipping, test:

- [ ] Grind kills work on rails/edges
- [ ] Trick kills trigger on aerial landings
- [ ] Impact kills happen at high speeds
- [ ] Combo system increases/decreases correctly
- [ ] Performance stays >30 FPS with max gibs
- [ ] Gore clears properly on level restart
- [ ] No memory leaks in long sessions
- [ ] Mobile version uses appropriate settings

---

## 📈 NEXT STEPS

1. **Integrate into your existing game** following steps above
2. **Test different kill scenarios** (grind, trick, impact)
3. **Tune performance settings** for your target platform
4. **Add UI elements** to show combo and gore stats
5. **Create special effects** for high combos
6. **Balance gore intensity** based on gameplay feel

---

## 💡 ADVANCED FEATURES TO ADD

### Blood Decals on Surfaces
```javascript
// Create permanent blood stains
this.gore.traditionalGore.createPermanentBloodStain(
    position,
    size
);
```

### Slow-Mo on Epic Kills
```javascript
if (stats.combo > 3) {
    this.timeScale = 0.3; // Slow motion
    setTimeout(() => this.timeScale = 1.0, 1000);
}
```

### Particle Trails During Grinds
```javascript
if (this.player.isGrinding) {
    this.gore.traditionalGore.createBloodSplatter(
        this.player.position,
        this.player.velocity,
        10
    );
}
```

---

## 🎮 YOU'RE READY!

The hybrid system is designed to integrate smoothly with your existing APPLESAUCE codebase. Start with the basic integration, then add advanced features as needed.

**Key Benefits:**
- Verlet physics for important, earned kills
- Traditional physics for performance
- Automatic combo tracking
- Skating-specific collision detection
- Smart performance management

Now go make some epic skateboarding gore! 🛹💀
