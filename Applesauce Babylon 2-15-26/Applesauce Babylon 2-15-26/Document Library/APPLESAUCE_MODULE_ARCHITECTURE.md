# APPLESAUCE MODULE ARCHITECTURE
## Clean, Modular System Design

---

## 🎯 Module Philosophy

**Each module is INDEPENDENT and COMMUNICATES through Core:**

```
                    ┌─────────────┐
                    │    CORE     │
                    │  (Engine)   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼───┐         ┌───▼───┐         ┌───▼───┐
    │Terrain│         │Weapons│         │ Gear  │
    └───┬───┘         └───┬───┘         └───┬───┘
        │                 │                  │
    Provides          Queries            Modifies
    Ground Height     Collision          Stats
```

**Key Principle:** Modules don't import each other directly - they all connect through Core!

---

## 📦 Core Module Structure

```javascript
class ApplesauceCore {
    constructor() {
        // Three.js basics
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera();
        this.renderer = new THREE.WebGLRenderer();
        
        // Game state
        this.state = {
            speed: 0,
            rotation: 0,
            score: 0,
            health: 100,
            paused: false
            // etc...
        };
        
        // Player
        this.player = null;
        this.deck = null;
        
        // Module registry
        this.modules = {
            terrain: null,
            gore: null,
            weapons: null,
            gear: null,
            enemies: null,
            collision: null,
            destruction: null,
            weather: null,
            dialogue: null,
            pause: null,
            materials: null,
            music: null
        };
        
        // Controls
        this.keys = {};
        this.clock = new THREE.Clock();
    }
    
    // Core provides services to modules
    getTerrainHeight(x, z) {
        return this.modules.terrain?.getHeight(x, z) || 0;
    }
    
    // Update loop delegates to modules
    update() {
        const deltaTime = this.clock.getDelta();
        
        // Update each module (order matters!)
        this.modules.terrain?.update?.(deltaTime);
        this.modules.weather?.update?.(deltaTime);
        this.modules.collision?.update?.(this);
        this.modules.enemies?.update?.(this);
        this.modules.weapons?.update?.(deltaTime);
        this.modules.gear?.update?.(deltaTime);
        this.modules.gore?.update?.(deltaTime);
        this.modules.dialogue?.update?.(deltaTime);
        
        // Core physics
        this.updatePhysics();
        this.updateCamera();
    }
}
```

---

## 🏗️ Module Definitions

### **1. CORE (Engine)**
**Purpose:** Main game loop, scene management, player control  
**Provides:** Scene, camera, player, state, update loop  
**File:** `applesauce-core.js`

```javascript
export class ApplesauceCore {
    constructor() { /* setup */ }
    init() { /* initialize systems */ }
    update() { /* game loop */ }
    start() { /* begin game */ }
}
```

---

### **2. TERRAIN**
**Purpose:** Ground generation, height queries, world building  
**Provides:** `getHeight(x, z)`, terrain meshes  
**Dependencies:** Core only  
**File:** `modules/terrain/applesauce-terrain.js`

```javascript
export class ApplesauceTerrain {
    constructor(core) {
        this.core = core;
    }
    
    generate(config) {
        // Create terrain from config
    }
    
    getHeight(x, z) {
        // Return ground height at position
    }
}
```

**Terrain handles:**
- ✅ Ground mesh generation
- ✅ Height queries for collision
- ✅ Biomes and zones
- ✅ Buildings and roads (if world-building)

**Terrain does NOT handle:**
- ❌ Level objects (ramps, rails) - that's LevelBuilder
- ❌ Enemies - that's Enemies module
- ❌ Destructibles - that's Destruction module

---

### **3. GORE**
**Purpose:** Blood effects, body parts, visual carnage  
**Provides:** Particle effects, blood pools  
**Dependencies:** Core only  
**File:** `modules/gore/applesauce-gore.js`

```javascript
export class ApplesauceGore {
    constructor(core) {
        this.core = core;
        this.particles = [];
    }
    
    createBloodSplatter(position, velocity, intensity) {
        // Create blood particles
    }
    
    update(deltaTime) {
        // Update particle physics
    }
}
```

---

### **4. WEAPONS**
**Purpose:** Attack system, projectiles, damage  
**Provides:** Weapon attacks, hit detection  
**Dependencies:** Core, queries Collision module  
**File:** `modules/weapons/applesauce-weapons.js`

```javascript
export class ApplesauceWeapons {
    constructor(core) {
        this.core = core;
        this.projectiles = [];
    }
    
    init() {
        // Cache reference to collision module
        this.collision = this.core.modules.collision;
    }
    
    attackPrimary() {
        // Fire projectile, check hits via collision
    }
}
```

---

### **5. GEAR**
**Purpose:** Equipment, stat modification  
**Provides:** Stat bonuses to Player and Weapons  
**Dependencies:** Core, modifies state  
**File:** `modules/gear/applesauce-gear.js`

```javascript
export class ApplesauceGear {
    constructor(core) {
        this.core = core;
        this.equipped = {};
        this.stats = {};
    }
    
    equip(slot, item) {
        // Equip item
        this.recalculateStats();
        this.applyStatsToModules();
    }
    
    applyStatsToModules() {
        // Modify core.state.maxSpeed
        // Modify core.modules.weapons damage
    }
}
```

---

### **6. ENEMIES**
**Purpose:** NPC spawning, AI behavior  
**Provides:** Enemy entities, AI updates  
**Dependencies:** Core, queries Terrain for height  
**File:** `modules/enemies/applesauce-enemies.js`

```javascript
export class ApplesauceEnemies {
    constructor(core) {
        this.core = core;
        this.enemies = [];
    }
    
    spawnEnemy(config) {
        const y = this.core.getTerrainHeight(config.x, config.z);
        // Create enemy at ground level
    }
}
```

---

### **7. COLLISION**
**Purpose:** Hit detection for all systems  
**Provides:** Collision checks, damage registration  
**Dependencies:** Core, queries Enemies, Weapons  
**File:** `modules/collision/applesauce-collision.js`

```javascript
export class ApplesauceCollision {
    constructor(core) {
        this.core = core;
    }
    
    init() {
        // Cache references
        this.enemiesModule = this.core.modules.enemies;
        this.weaponsModule = this.core.modules.weapons;
    }
    
    update(core) {
        // Check player vs enemies
        // Check projectiles vs enemies
        // Check player vs level objects
    }
}
```

---

### **8. DESTRUCTION**
**Purpose:** Breakable objects  
**Provides:** Destructible props, debris  
**Dependencies:** Core  
**File:** `modules/destruction/applesauce-destruction.js`

```javascript
export class ApplesauceDestruction {
    constructor(core) {
        this.core = core;
        this.objects = [];
    }
    
    createCrate(config) {
        // Create breakable crate
    }
    
    destroy(object) {
        // Break object, create debris
        this.core.modules.gore?.createDebris(object.position);
    }
}
```

---

### **9. WEATHER**
**Purpose:** Environmental effects (rain, snow, fog)  
**Provides:** Particle systems, atmosphere  
**Dependencies:** Core  
**File:** `modules/weather/applesauce-weather.js`

```javascript
export class ApplesauceWeather {
    constructor(core) {
        this.core = core;
        this.particles = [];
    }
    
    setWeather(type) {
        // 'rain', 'snow', 'fog', etc.
    }
    
    update(deltaTime) {
        // Update weather particles
    }
}
```

---

### **10. DIALOGUE**
**Purpose:** NPC conversations, text display  
**Provides:** Dialogue boxes, choices  
**Dependencies:** Core  
**File:** `modules/dialogue/applesauce-dialogue.js`

```javascript
export class ApplesauceDialogue {
    constructor(core) {
        this.core = core;
        this.activeDialogue = null;
    }
    
    show(npcName, text, choices) {
        // Display dialogue box
        this.core.state.paused = true;
    }
    
    hide() {
        this.core.state.paused = false;
    }
}
```

---

### **11. PAUSE**
**Purpose:** Pause menu, options  
**Provides:** Pause UI, settings  
**Dependencies:** Core  
**File:** `modules/pause/applesauce-pause.js`

```javascript
export class ApplesaucePause {
    constructor(core) {
        this.core = core;
        this.menuOpen = false;
    }
    
    toggle() {
        this.menuOpen = !this.menuOpen;
        this.core.state.paused = this.menuOpen;
        // Show/hide menu UI
    }
}
```

---

### **12. MATERIALS**
**Purpose:** Shared material definitions  
**Provides:** Material library  
**Dependencies:** None  
**File:** `modules/materials/applesauce-materials.js`

```javascript
export class ApplesauceMaterials {
    constructor(core) {
        this.core = core;
        this.library = {};
    }
    
    init() {
        this.library.concrete = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.9
        });
        // etc...
    }
    
    get(name) {
        return this.library[name];
    }
}
```

---

### **13. MUSIC**
**Purpose:** Audio playback, playlists  
**Provides:** Music control  
**Dependencies:** Core  
**File:** `modules/music/applesauce-music.js`

```javascript
export class ApplesauceMusic {
    constructor(core) {
        this.core = core;
        this.playlist = [];
    }
    
    loadPlaylist(context, tracks) {
        // Load music
    }
    
    play(index) {
        // Play track
    }
}
```

---

## 🎮 Putting It All Together

### **Main HTML File Structure**

```html
<!DOCTYPE html>
<html>
<head>
    <title>APPLESAUCE</title>
    <style>
        /* Your styles */
    </style>
</head>
<body>
    <!-- HUD elements -->
    
    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js"
        }
    }
    </script>

    <script type="module">
        // ===================================
        // IMPORTS
        // ===================================
        import * as THREE from 'three';
        
        // Core
        import { ApplesauceCore } from './core/applesauce-core.js';
        
        // Systems (alphabetical)
        import { ApplesauceCollision } from './modules/collision/applesauce-collision.js';
        import { ApplesauceDestruction } from './modules/destruction/applesauce-destruction.js';
        import { ApplesauceDialogue } from './modules/dialogue/applesauce-dialogue.js';
        import { ApplesauceEnemies } from './modules/enemies/applesauce-enemies.js';
        import { ApplesauceGear } from './modules/gear/applesauce-gear.js';
        import { ApplesauceGore } from './modules/gore/applesauce-gore.js';
        import { ApplesauceMaterials } from './modules/materials/applesauce-materials.js';
        import { ApplesauceMusic } from './modules/music/applesauce-music.js';
        import { ApplesaucePause } from './modules/pause/applesauce-pause.js';
        import { ApplesauceTerrain } from './modules/terrain/applesauce-terrain.js';
        import { ApplesauceWeapons } from './modules/weapons/applesauce-weapons.js';
        import { ApplesauceWeather } from './modules/weather/applesauce-weather.js';
        
        // Level Builder (optional, built on terrain)
        import { ApplesauceLevelBuilder } from './modules/materials/applesauce-level-builder.js';
        
        // ===================================
        // INITIALIZATION
        // ===================================
        async function init() {
            // Create core engine
            const core = new ApplesauceCore();
            
            // Register modules (order matters for init!)
            core.modules.materials = new ApplesauceMaterials(core);
            core.modules.terrain = new ApplesauceTerrain(core);
            core.modules.weather = new ApplesauceWeather(core);
            core.modules.gore = new ApplesauceGore(core);
            core.modules.collision = new ApplesauceCollision(core);
            core.modules.enemies = new ApplesauceEnemies(core);
            core.modules.weapons = new ApplesauceWeapons(core);
            core.modules.gear = new ApplesauceGear(core);
            core.modules.destruction = new ApplesauceDestruction(core);
            core.modules.dialogue = new ApplesauceDialogue(core);
            core.modules.pause = new ApplesaucePause(core);
            core.modules.music = new ApplesauceMusic(core);
            
            // Optional: Level builder
            core.modules.levelBuilder = new ApplesauceLevelBuilder(core);
            
            // Initialize modules that need setup
            core.modules.materials.init?.();
            core.modules.gore.init?.();
            core.modules.collision.init();
            core.modules.weapons.init();
            core.modules.gear.init();
            
            // Load level
            await loadLevel(core, MY_LEVEL);
            
            // Start game
            core.start();
        }
        
        // ===================================
        // LEVEL LOADING
        // ===================================
        async function loadLevel(core, levelConfig) {
            // 1. Generate terrain FIRST
            core.modules.terrain.generate(levelConfig.terrain);
            
            // 2. Create player at spawn point
            const spawn = levelConfig.playerStart;
            const groundY = core.getTerrainHeight(spawn.x, spawn.z);
            core.createPlayer(spawn.x, spawn.z, groundY);
            
            // 3. Call level's custom setup
            if (levelConfig.onLevelStart) {
                levelConfig.onLevelStart(core);
            }
        }
        
        // ===================================
        // LEVEL DEFINITION
        // ===================================
        const MY_LEVEL = {
            meta: {
                name: "Test Level",
                description: "Complete system test"
            },
            
            // Terrain config
            terrain: {
                mode: 'flat',  // or 'procedural', 'segments', etc.
                size: 2000,
                color: 0x228B22
            },
            
            // Player spawn
            playerStart: {
                x: 0,
                z: 20
            },
            
            // Custom level setup
            onLevelStart: (core) => {
                // Setup gear
                core.modules.gear.equipByName('helmet', 'gore_spattered');
                
                // Setup weapons
                core.modules.weapons.equipWeapon('primary', 'magic_missile');
                
                // Spawn enemies
                core.modules.enemies.spawnLine(0, -30, 10, 5);
                
                // Setup weather
                core.modules.weather.setWeather('rain');
                
                // Load music
                core.modules.music.loadPlaylist('level1', [
                    { title: "Track 1", artist: "Artist", file: "music.mp3" }
                ]);
            }
        };
        
        // Start game
        window.addEventListener('load', init);
    </script>
</body>
</html>
```

---

## 🏔️ TERRAIN: Bare Minimum Integration

### **Option A: Flat Terrain (Simplest)**

```javascript
const LEVEL = {
    terrain: {
        mode: 'flat',
        size: 2000,
        color: 0x228B22
    },
    playerStart: { x: 0, z: 20 }
};

// In terrain module, add simple flat generation:
generateFlat(config) {
    const size = config.size || 2000;
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshStandardMaterial({
        color: config.color || 0x228B22,
        roughness: 0.9
    });
    
    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.terrainMesh.rotation.x = -Math.PI / 2;
    this.terrainMesh.receiveShadow = true;
    
    this.engine.scene.add(this.terrainMesh);
}
```

### **Option B: Procedural Terrain (Your System)**

```javascript
const LEVEL = {
    terrain: {
        mode: 'procedural',
        size: 2000,
        resolution: 100,
        noise: {
            freq1: 0.01, amp1: 15,
            freq2: 0.05, amp2: 5,
            freq3: 0.1, amp3: 2,
            baseHeight: 0
        }
    },
    playerStart: { x: 0, z: 20 }
};

// Your terrain system already handles this!
// Just call: core.modules.terrain.generate(levelConfig.terrain);
```

### **Option C: Segmented Terrain (Chapters)**

```javascript
const LEVEL = {
    terrain: {
        mode: 'segments',
        segments: [
            { type: 'flat', length: 200 },
            { type: 'hill', length: 100, startHeight: 0, endHeight: 30 },
            { type: 'flat', length: 200 },
            { type: 'valley', length: 150, depth: -20 }
        ]
    },
    playerStart: { x: 0, z: 20 }
};

// Your terrain system handles this too!
```

---

## 🎯 Recommended Approach: Terrain vs LevelBuilder

### **Terrain Module Handles:**
- ✅ Ground geometry (mesh, height data)
- ✅ Natural features (hills, valleys, biomes)
- ✅ World-building (buildings, roads) - if you want
- ✅ `getHeight(x, z)` queries

### **LevelBuilder Module Handles:**
- ✅ Skateable objects (ramps, rails, boxes)
- ✅ Collision registration
- ✅ Interactive props
- ✅ Built ON TOP of terrain

### **Example Level:**

```javascript
onLevelStart: (core) => {
    // 1. Terrain already generated by now
    
    // 2. Build skateable structures on terrain
    const builder = core.modules.levelBuilder;
    
    builder.createQuarterPipe(-15, -30, 0);
    builder.createRail(0, -50, 25, 2);
    builder.createGrindBox(10, -70, 6, 1.5, 3);
    
    // 3. Spawn entities
    core.modules.enemies.spawnLine(0, -100, 10, 5);
    
    // 4. Add destructibles
    core.modules.destruction.createCrate({ position: { x: 5, y: 1, z: -120 } });
}
```

---

## 📊 Module Initialization Order

**CRITICAL: Initialize in this order to avoid dependency issues**

```javascript
// 1. Independent modules (no dependencies)
core.modules.materials.init();

// 2. Terrain (provides ground)
core.modules.terrain.generate(config);

// 3. Visual systems (no game logic)
core.modules.gore.init();
core.modules.weather.init();

// 4. Collision (needs to exist before others register)
core.modules.collision.init();

// 5. Combat systems (register with collision)
core.modules.enemies.init();
core.modules.weapons.init();

// 6. Stat modifiers (modify other systems)
core.modules.gear.init();

// 7. UI systems
core.modules.dialogue.init();
core.modules.pause.init();
core.modules.music.init();

// 8. Level building (uses terrain + collision)
core.modules.levelBuilder.init();
```

---

## 🎮 Update Loop Order

```javascript
update() {
    const deltaTime = this.clock.getDelta();
    
    // 1. Environment
    this.modules.terrain?.update?.(deltaTime);
    this.modules.weather?.update?.(deltaTime);
    
    // 2. Physics & Collision
    this.updatePhysics();
    this.modules.collision?.update?.(this);
    
    // 3. Entities
    this.modules.enemies?.update?.(this);
    this.modules.destruction?.update?.(deltaTime);
    
    // 4. Combat
    this.modules.weapons?.update?.(deltaTime);
    
    // 5. Visual effects
    this.modules.gore?.update?.(deltaTime);
    
    // 6. UI
    this.modules.dialogue?.update?.(deltaTime);
    
    // 7. Camera
    this.updateCamera();
}
```

---

## ✅ Summary

**Terrain = Ground**
- Generates the world mesh
- Provides height queries
- Can include buildings/roads if you want

**LevelBuilder = Skateable Structures**
- Ramps, rails, boxes
- Built on top of terrain
- Auto-registers collisions

**All modules connect through Core, not each other!**

This keeps everything clean, modular, and easy to debug! 🎮✨
