# APPLESAUCE COMPLETE INTEGRATION GUIDE
## How to Load All Your Modules Together

---

## 🎯 What You Have

You now have a working HTML test file, but it uses **simplified inline versions** of the modules. Here's how to integrate your **actual modules** into the system.

---

## 📂 Recommended File Structure

```
applesauce/
├── index.html                           # Your main game file
├── modules/
│   ├── core/
│   │   └── applesauce-core-3.js        # Main engine
│   ├── collision/
│   │   └── applesauce-collision-enhanced.js
│   ├── destruction/
│   │   └── applesauce-destruction-system.js
│   ├── enemies/
│   │   └── applesauce-enemies-enhanced.js
│   ├── weapons/
│   │   └── applesauce-weapons.js
│   ├── gear/
│   │   ├── applesauce-gear-enhanced.js
│   │   └── helmet_loader.js
│   ├── materials/
│   │   ├── applesauce-materials.js
│   │   └── applesauce-level-builder-enhanced.js
│   └── music/
│       └── applesauce-music-MINIMAL.js
├── three.module.js                     # Three.js r182
└── assets/
    ├── music/
    └── textures/
```

---

## 🔧 Step-by-Step Integration

### **Step 1: Replace the Inline Modules**

In your HTML, replace the simplified classes with imports:

```javascript
// REMOVE the simplified inline classes:
// class SimpleCollision { ... }
// class SimpleEnemies { ... }
// class SimpleWeapons { ... }
// class SimpleGear { ... }

// ADD real module imports:
import { ApplesauceCollision } from './modules/collision/applesauce-collision-enhanced.js';
import { ApplesauceEnemies } from './modules/enemies/applesauce-enemies-enhanced.js';
import { ApplesauceWeapons } from './modules/weapons/applesauce-weapons.js';
import { ApplesauceGear } from './modules/gear/applesauce-gear-enhanced.js';
import { ApplesauceMusic } from './modules/music/applesauce-music-MINIMAL.js';
import { ApplesauceDestruction } from './modules/destruction/applesauce-destruction-system.js';
import { ApplesauceMaterials } from './modules/materials/applesauce-materials.js';
import { ApplesauceLevelBuilder } from './modules/materials/applesauce-level-builder-enhanced.js';
```

### **Step 2: Initialize Real Modules**

In the `init()` function, replace the simplified initializations:

```javascript
async function init() {
    updateLoadingStatus('Initializing core engine...');
    const core = new MinimalCore();
    
    updateLoadingStatus('Loading modules...');
    
    // REAL MODULE INITIALIZATION
    core.modules.materials = new ApplesauceMaterials(core);
    core.modules.collision = new ApplesauceCollision(core);
    core.modules.destruction = new ApplesauceDestruction(core);
    core.modules.enemies = new ApplesauceEnemies(core);
    core.modules.weapons = new ApplesauceWeapons(core);
    core.modules.gear = new ApplesauceGear(core);
    core.modules.levelBuilder = new ApplesauceLevelBuilder(core);
    core.modules.music = new ApplesauceMusic(core);
    
    // Initialize in order (some depend on others)
    core.modules.materials.init?.();      // If it has init
    core.modules.collision.init();
    core.modules.destruction.init?.();    // If it has init
    core.modules.weapons.init();
    core.modules.gear.init();
    core.modules.levelBuilder.setAutoCollision(true);  // Auto-register collisions
    
    // ... rest of initialization
}
```

### **Step 3: Add Destruction to Update Loop**

In the `MinimalCore.update()` method, add destruction updates:

```javascript
update() {
    if (this.state.paused) return;
    
    const deltaTime = this.clock.getDelta();
    
    // Core physics
    this.updatePhysics();
    
    // Update modules IN ORDER
    if (this.modules.collision) {
        this.modules.collision.update(this);
    }
    
    if (this.modules.enemies) {
        this.modules.enemies.update(this);
    }
    
    // NEW: Add destruction
    if (this.modules.destruction) {
        this.modules.destruction.update(deltaTime);
        
        // Update destruction HUD
        const stats = this.modules.destruction.getStats();
        const destructionEl = document.getElementById('destruction-stats');
        if (destructionEl) {
            destructionEl.innerHTML = `
                💥 DESTROYED: ${stats.destroyed}/${stats.total}<br>
                🔥 CHAIN: ${stats.maxChain}<br>
                ⚡ MULTIPLIER: ${stats.multiplier.toFixed(1)}x
            `;
        }
    }
    
    if (this.modules.weapons) {
        this.modules.weapons.update(deltaTime);
    }
    
    // Camera and HUD
    this.updateCamera();
    this.updateHUD();
}
```

### **Step 4: Create a Real Level**

Replace the simple enemy spawning with a complete level:

```javascript
// After initialization, load a full level
const TEST_LEVEL = {
    meta: {
        name: "Complete System Test",
        description: "All modules working together"
    },
    
    playerStart: {
        x: 0,
        z: 20
    },
    
    onLevelStart: (core) => {
        const builder = core.modules.levelBuilder;
        const destruction = core.modules.destruction;
        const enemies = core.modules.enemies;
        const gear = core.modules.gear;
        const weapons = core.modules.weapons;
        
        // ===== GEAR SETUP =====
        gear.equipByName('helmet', 'gore_spattered');
        gear.equipByName('jacket', 'demon_hunter');
        gear.equipByName('pants', 'hunter');
        gear.equipByName('shoes', 'demon_steps');
        gear.equipByName('skateboard', 'demon_deck');
        gear.equipByName('weapon', 'fire_rune');
        
        console.log('👕 Gear equipped:', gear.getEquipped());
        console.log('📊 Stats:', gear.getStats());
        
        // ===== WEAPONS SETUP =====
        weapons.equipWeapon('primary', 'magic_missile');
        weapons.equipWeapon('secondary', 'explosion');
        
        // ===== LEVEL BUILDING =====
        
        // Section 1: Starting area with ramps
        builder.createQuarterPipe(-15, -30, 0);
        builder.createQuarterPipe(15, -30, Math.PI);
        
        // Section 2: Grind boxes
        builder.createGrindBox(-8, -50, 6, 1.5, 3);
        builder.createGrindBox(0, -50, 6, 1.5, 3);
        builder.createGrindBox(8, -50, 6, 1.5, 3);
        
        // Section 3: Rails
        builder.createRail(-10, -70, 25, 2);
        builder.createRail(10, -70, 25, 2);
        
        // Section 4: Walls to navigate
        builder.createWall(-20, -100, 10, 5);
        builder.createWall(20, -100, 10, 5);
        
        // ===== DESTRUCTIBLES =====
        
        // Crates in a line
        for (let i = 0; i < 10; i++) {
            destruction.createCrate({
                position: {
                    x: (i - 5) * 3,
                    y: 1,
                    z: -120 - (i * 5)
                }
            });
        }
        
        // Glass windows
        for (let i = 0; i < 5; i++) {
            destruction.createGlass({
                position: {
                    x: -15 + (i * 8),
                    y: 2,
                    z: -150
                }
            });
        }
        
        // Explosive barrels
        destruction.createBarrel({
            position: { x: -10, y: 0.75, z: -170 },
            explosive: true
        });
        destruction.createBarrel({
            position: { x: 0, y: 0.75, z: -170 },
            explosive: true
        });
        destruction.createBarrel({
            position: { x: 10, y: 0.75, z: -170 },
            explosive: true
        });
        
        // Walls to destroy
        for (let i = 0; i < 3; i++) {
            destruction.createWall({
                position: {
                    x: -12 + (i * 12),
                    y: 2.5,
                    z: -200
                }
            });
        }
        
        // ===== ENEMIES =====
        
        // Wave 1: Static targets
        enemies.spawnLine(0, -30, 8, 5, {
            behavior: 'static'
        });
        
        // Wave 2: Chasers
        enemies.spawnCluster(-15, -80, 10, 8, {
            behavior: 'chase'
        });
        
        // Wave 3: Fleers
        enemies.spawnCluster(15, -120, 8, 10, {
            behavior: 'flee'
        });
        
        // Boss
        enemies.spawnBoss({
            position: { x: 0, y: 0, z: -250 },
            health: 2000,
            color: 0xFF0000
        });
        
        console.log('✅ Level loaded!');
        console.log(`   Enemies: ${enemies.getAliveCount()}`);
        console.log(`   Destructibles: ${destruction.objects.length}`);
    }
};

// Load the level
await loadLevel(core, TEST_LEVEL);
```

---

## 🎮 Adding Advanced Features

### **Custom Helmet Loader Integration**

```javascript
import { HelmetLoader } from './modules/gear/helmet_loader.js';

// In your level's onLevelStart:
const helmetLoader = new HelmetLoader(core.scene, core.player);
helmetLoader.loadHelmet();

// Combine with gear system
const customHelmet = {
    name: helmetLoader.currentHelmetData.name || 'Custom Helmet',
    defense: 12,
    bonuses: {
        healthRegen: 3,
        weaponDamage: 1.2
    },
    setName: "Demon Slayer",
    visual: 'custom',
    loader: helmetLoader
};

core.modules.gear.equip('helmet', customHelmet);
```

### **Music System with Real Files**

```javascript
// In onLevelStart or init:
const music = core.modules.music;

music.loadPlaylist('level1', [
    {
        title: "Skate or Die",
        artist: "Your Artist",
        file: "./assets/music/track1.mp3"
    },
    {
        title: "Grind Time",
        artist: "Your Artist",
        file: "./assets/music/track2.mp3"
    },
    {
        title: "Demon Deck",
        artist: "Your Artist",
        file: "./assets/music/track3.mp3"
    }
]);

// Music auto-plays if configured
// Press M to open menu
```

---

## 🐛 Common Integration Issues

### **Issue: "Module not found"**

**Cause:** Incorrect file paths

**Fix:**
```javascript
// Check your file structure matches imports
// If files are in different folders, adjust paths:
import { ApplesauceCollision } from './collision/applesauce-collision-enhanced.js';
// vs
import { ApplesauceCollision } from './modules/collision/applesauce-collision-enhanced.js';
```

### **Issue: "Cannot read property 'update' of undefined"**

**Cause:** Module not initialized

**Fix:**
```javascript
// Make sure to init BEFORE using
core.modules.collision = new ApplesauceCollision(core);
core.modules.collision.init();  // <-- Don't forget!

// Then in update loop, check it exists
if (core.modules.collision) {
    core.modules.collision.update(core);
}
```

### **Issue: Collision not working**

**Cause:** Modules initialized in wrong order

**Fix:**
```javascript
// Initialize in this order:
1. Materials (used by level builder)
2. Collision (needs to exist before others register)
3. Destruction (may use collision)
4. Enemies (registers with collision)
5. Weapons (uses collision for hits)
6. Gear (modifies stats)
7. Level Builder (auto-registers collisions)
```

### **Issue: Weapons don't affect enemies**

**Cause:** Modules not connected

**Fix:**
```javascript
// In init, make sure modules reference each other
core.modules.collision.init();  // This caches enemies module
core.modules.weapons.init();    // This caches collision module

// Check connections
console.log('Collision has enemies?', !!core.modules.collision.enemiesModule);
console.log('Weapons has collision?', !!core.modules.weapons.collision);
```

---

## 📊 Testing Your Integration

### **Test Checklist:**

```javascript
// After loading everything, test each system:

// 1. Core
console.log('✓ Player created?', !!core.player);
console.log('✓ Terrain created?', core.scene.children.length > 3);

// 2. Modules
console.log('✓ Modules loaded:', Object.keys(core.modules));
console.log('✓ Collision active?', !!core.modules.collision);
console.log('✓ Enemies spawned?', core.modules.enemies?.getAliveCount());

// 3. Gear
console.log('✓ Gear equipped:', core.modules.gear?.getEquipped());
console.log('✓ Stats modified:', core.modules.gear?.getStats());

// 4. Weapons
console.log('✓ Primary weapon:', core.modules.weapons?.equipped.primary?.name);
console.log('✓ Secondary weapon:', core.modules.weapons?.equipped.secondary?.name);

// 5. Destruction
console.log('✓ Destructibles:', core.modules.destruction?.objects.length);

// 6. Music
console.log('✓ Playlist loaded:', core.modules.music?.playlist.length);
```

---

## 🎯 Final HTML Template

Here's the complete structure with real modules:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>APPLESAUCE - Full Game</title>
    <!-- Your styles here -->
</head>
<body>
    <!-- Your HUD here -->
    
    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js"
        }
    }
    </script>

    <script type="module">
        import * as THREE from 'three';
        
        // IMPORT ALL REAL MODULES
        import { ApplesauceCollision } from './modules/collision/applesauce-collision-enhanced.js';
        import { ApplesauceDestruction } from './modules/destruction/applesauce-destruction-system.js';
        import { ApplesauceEnemies } from './modules/enemies/applesauce-enemies-enhanced.js';
        import { ApplesauceWeapons } from './modules/weapons/applesauce-weapons.js';
        import { ApplesauceGear } from './modules/gear/applesauce-gear-enhanced.js';
        import { ApplesauceMaterials } from './modules/materials/applesauce-materials.js';
        import { ApplesauceLevelBuilder } from './modules/materials/applesauce-level-builder-enhanced.js';
        import { ApplesauceMusic } from './modules/music/applesauce-music-MINIMAL.js';
        
        // Your MinimalCore class here
        class MinimalCore { ... }
        
        // INIT FUNCTION WITH REAL MODULES
        async function init() {
            const core = new MinimalCore();
            
            // Initialize all modules
            core.modules.materials = new ApplesauceMaterials(core);
            core.modules.collision = new ApplesauceCollision(core);
            core.modules.destruction = new ApplesauceDestruction(core);
            core.modules.enemies = new ApplesauceEnemies(core);
            core.modules.weapons = new ApplesauceWeapons(core);
            core.modules.gear = new ApplesauceGear(core);
            core.modules.levelBuilder = new ApplesauceLevelBuilder(core);
            core.modules.music = new ApplesauceMusic(core);
            
            // Init them
            core.modules.collision.init();
            core.modules.weapons.init();
            core.modules.gear.init();
            
            // Create terrain and player
            core.createTerrain();
            core.createPlayer(0, 10);
            
            // Load your level
            await loadLevel(core, YOUR_LEVEL);
            
            // Start game
            core.start();
        }
        
        window.addEventListener('load', init);
    </script>
</body>
</html>
```

---

## ✅ You're Ready!

Follow these steps and you'll have all systems working together:

1. ✅ Organize files in the recommended structure
2. ✅ Replace simplified inline modules with real imports
3. ✅ Initialize modules in the correct order
4. ✅ Create a complete test level
5. ✅ Test each system individually
6. ✅ Start skating and destroying! 🛹💥

**Everything will work together automatically once properly imported!**
