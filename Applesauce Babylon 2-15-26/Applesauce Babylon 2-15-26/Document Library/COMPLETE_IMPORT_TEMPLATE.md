# COMPLETE MODULE IMPORT TEMPLATE
## Ready-to-use HTML with ALL systems

---

## 📦 File Structure You Need

```
your-game/
├── index.html                              # Main file (this template)
├── three.module.js                         # Three.js library
│
├── core/
│   └── applesauce-core.js                 # Main engine
│
└── modules/
    ├── collision/
    │   └── applesauce-collision-enhanced.js
    ├── destruction/
    │   └── applesauce-destruction-system.js
    ├── dialogue/
    │   └── applesauce-dialogue.js         # (you'll create)
    ├── enemies/
    │   └── applesauce-enemies-enhanced.js
    ├── gear/
    │   ├── applesauce-gear-enhanced.js
    │   └── helmet_loader.js
    ├── gore/
    │   └── applesauce-gore.js             # (your gore system)
    ├── materials/
    │   ├── applesauce-materials.js
    │   └── applesauce-level-builder-enhanced.js
    ├── music/
    │   └── applesauce-music-MINIMAL.js
    ├── pause/
    │   └── applesauce-pause.js            # (you'll create)
    ├── terrain/
    │   └── applesauce-terrain-4.js        # YOUR TERRAIN SYSTEM
    ├── weapons/
    │   └── applesauce-weapons.js
    └── weather/
        └── applesauce-weather.js          # (you'll create)
```

---

## 🎮 Complete HTML Template

Save this as `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>APPLESAUCE - Full Game</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Courier New', monospace;
            overflow: hidden;
            background: #000;
            color: #00FF00;
        }

        canvas {
            display: block;
        }

        /* HUD */
        #hud {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 100;
            font-size: 16px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            pointer-events: none;
        }

        #hud > div {
            margin-bottom: 8px;
            padding: 5px 10px;
            background: rgba(0, 0, 0, 0.6);
            border-left: 3px solid #00FF00;
        }

        /* Loading screen */
        #loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            transition: opacity 0.5s;
        }

        #loading h1 {
            font-size: 48px;
            color: #FF6600;
            margin-bottom: 20px;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 102, 0, 0.3);
            border-top: 5px solid #FF6600;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-top: 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Controls panel */
        #controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px;
            border: 2px solid #00FF00;
            font-size: 13px;
            z-index: 100;
            max-width: 300px;
        }

        #controls h3 {
            margin-bottom: 10px;
            color: #FF6600;
        }

        #controls kbd {
            background: #333;
            padding: 2px 6px;
            border-radius: 3px;
            color: #FFF;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <!-- Loading Screen -->
    <div id="loading">
        <h1>🛹 APPLESAUCE 🛹</h1>
        <p>Loading all systems...</p>
        <div class="spinner"></div>
        <p id="loading-status" style="margin-top: 20px; color: #888;">Initializing...</p>
    </div>

    <!-- HUD -->
    <div id="hud">
        <div id="score">SCORE: 0</div>
        <div id="combo">COMBO: 0x</div>
        <div id="speed">SPEED: 0</div>
        <div id="height">HEIGHT: 0</div>
        <div id="health">HEALTH: 100</div>
    </div>

    <!-- Controls -->
    <div id="controls">
        <h3>🎮 CONTROLS</h3>
        <div style="margin: 10px 0;">
            <strong>Movement:</strong><br>
            <kbd>W/S</kbd> or <kbd>↑/↓</kbd> - Speed<br>
            <kbd>A/D</kbd> or <kbd>←/→</kbd> - Turn<br>
            <kbd>SPACE</kbd> - Jump
        </div>
        <div style="margin: 10px 0;">
            <strong>Combat:</strong><br>
            <kbd>Q</kbd> - Primary<br>
            <kbd>E</kbd> - Secondary<br>
            <kbd>F</kbd> - Melee
        </div>
        <div style="margin: 10px 0;">
            <strong>System:</strong><br>
            <kbd>M</kbd> - Music<br>
            <kbd>P</kbd> - Pause
        </div>
    </div>

    <!-- Three.js Import Map -->
    <script type="importmap">
    {
        "imports": {
            "three": "./three.module.js"
        }
    }
    </script>

    <script type="module">
        /**
         * ==========================================
         * APPLESAUCE COMPLETE SYSTEM
         * ==========================================
         * All modules properly imported and initialized
         */

        import * as THREE from 'three';

        // ===================================
        // MODULE IMPORTS
        // ===================================
        
        // Core Engine
        import { ApplesauceCore } from './core/applesauce-core.js';
        
        // Systems (alphabetical order)
        import { ApplesauceCollision } from './modules/collision/applesauce-collision-enhanced.js';
        import { ApplesauceDestruction } from './modules/destruction/applesauce-destruction-system.js';
        import { ApplesauceDialogue } from './modules/dialogue/applesauce-dialogue.js';
        import { ApplesauceEnemies } from './modules/enemies/applesauce-enemies-enhanced.js';
        import { ApplesauceGear } from './modules/gear/applesauce-gear-enhanced.js';
        import { ApplesauceGore } from './modules/gore/applesauce-gore.js';
        import { ApplesauceMaterials } from './modules/materials/applesauce-materials.js';
        import { ApplesauceLevelBuilder } from './modules/materials/applesauce-level-builder-enhanced.js';
        import { ApplesauceMusic } from './modules/music/applesauce-music-MINIMAL.js';
        import { ApplesaucePause } from './modules/pause/applesauce-pause.js';
        import { ApplesauceTerrain } from './modules/terrain/applesauce-terrain-4.js';
        import { ApplesauceWeapons } from './modules/weapons/applesauce-weapons.js';
        import { ApplesauceWeather } from './modules/weather/applesauce-weather.js';

        // Update loading status
        function updateStatus(message) {
            const el = document.getElementById('loading-status');
            if (el) el.textContent = message;
        }

        // ===================================
        // INITIALIZATION
        // ===================================
        async function init() {
            try {
                console.log('🎮 Starting APPLESAUCE...');
                
                updateStatus('Creating core engine...');
                const core = new ApplesauceCore();
                
                updateStatus('Registering modules...');
                
                // Register all modules
                // Order matters for initialization!
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
                core.modules.levelBuilder = new ApplesauceLevelBuilder(core);
                
                updateStatus('Initializing systems...');
                
                // Initialize modules that need setup
                core.modules.materials.init?.();
                core.modules.gore.initialize?.();
                core.modules.collision.init();
                core.modules.weapons.init();
                core.modules.gear.init();
                
                updateStatus('Loading level...');
                
                // Load level
                await loadLevel(core, GAME_LEVEL);
                
                updateStatus('Starting game...');
                
                // Hide loading screen
                setTimeout(() => {
                    const loading = document.getElementById('loading');
                    loading.style.opacity = '0';
                    setTimeout(() => loading.style.display = 'none', 500);
                }, 500);
                
                // Start game
                core.start();
                
                console.log('✅ APPLESAUCE ready!');
                
            } catch (error) {
                console.error('❌ Initialization failed:', error);
                updateStatus('ERROR: ' + error.message);
            }
        }

        // ===================================
        // LEVEL LOADING
        // ===================================
        async function loadLevel(core, levelConfig) {
            console.log(`📦 Loading: ${levelConfig.meta.name}`);
            
            // 1. TERRAIN FIRST (provides ground)
            core.modules.terrain.generate(levelConfig.terrain);
            
            // 2. CREATE PLAYER
            const spawn = levelConfig.playerStart;
            const groundY = core.getTerrainHeight(spawn.x, spawn.z);
            core.createPlayer(spawn.x, spawn.z, groundY);
            
            // 3. CUSTOM LEVEL SETUP
            if (levelConfig.onLevelStart) {
                levelConfig.onLevelStart(core);
            }
            
            console.log('✅ Level loaded');
        }

        // ===================================
        // LEVEL DEFINITION
        // ===================================
        const GAME_LEVEL = {
            meta: {
                name: "Test Level",
                description: "Complete system test with all modules"
            },
            
            // TERRAIN CONFIG
            terrain: {
                // Choose one mode:
                
                // Option 1: Flat terrain (simplest)
                // mode: 'flat',
                // size: 2000,
                // color: 0x228B22
                
                // Option 2: Procedural terrain (rolling hills)
                mode: 'procedural',
                size: 2000,
                resolution: 100,
                color: 0x567D46,
                noise: {
                    freq1: 0.01, amp1: 15,
                    freq2: 0.05, amp2: 5,
                    freq3: 0.1, amp3: 2,
                    baseHeight: 0
                }
                
                // Option 3: Segmented terrain (chapters)
                // mode: 'segments',
                // segments: [
                //     { type: 'flat', length: 200 },
                //     { type: 'hill', length: 100, startHeight: 0, endHeight: 30 },
                //     { type: 'flat', length: 200 }
                // ]
            },
            
            // PLAYER SPAWN
            playerStart: {
                x: 0,
                z: 20
            },
            
            // CUSTOM LEVEL SETUP
            onLevelStart: (core) => {
                console.log('🎨 Setting up level...');
                
                // ===== GEAR =====
                const gear = core.modules.gear;
                gear.equipByName('helmet', 'gore_spattered');
                gear.equipByName('jacket', 'demon_hunter');
                gear.equipByName('pants', 'hunter');
                gear.equipByName('shoes', 'demon_steps');
                gear.equipByName('skateboard', 'demon_deck');
                gear.equipByName('weapon', 'fire_rune');
                
                console.log('👕 Gear equipped:', gear.getEquipped());
                
                // ===== WEAPONS =====
                const weapons = core.modules.weapons;
                weapons.equipWeapon('primary', 'magic_missile');
                weapons.equipWeapon('secondary', 'explosion');
                
                console.log('⚔️ Weapons equipped');
                
                // ===== LEVEL OBJECTS =====
                const builder = core.modules.levelBuilder;
                
                // Section 1: Starting area
                builder.createQuarterPipe(-15, -30, 0);
                builder.createQuarterPipe(15, -30, Math.PI);
                
                // Section 2: Grind boxes
                builder.createGrindBox(-8, -50, 6, 1.5, 3);
                builder.createGrindBox(0, -50, 6, 1.5, 3);
                builder.createGrindBox(8, -50, 6, 1.5, 3);
                
                // Section 3: Rails
                builder.createRail(-10, -70, 25, 2);
                builder.createRail(10, -70, 25, 2);
                
                console.log('🏗️ Level objects built');
                
                // ===== DESTRUCTIBLES =====
                const destruction = core.modules.destruction;
                
                for (let i = 0; i < 10; i++) {
                    destruction.createCrate({
                        position: {
                            x: (i - 5) * 3,
                            y: 1,
                            z: -100 - (i * 5)
                        }
                    });
                }
                
                // Explosive barrels
                destruction.createBarrel({
                    position: { x: -10, y: 0.75, z: -150 },
                    explosive: true
                });
                destruction.createBarrel({
                    position: { x: 10, y: 0.75, z: -150 },
                    explosive: true
                });
                
                console.log('💥 Destructibles placed');
                
                // ===== ENEMIES =====
                const enemies = core.modules.enemies;
                
                // Wave 1
                enemies.spawnLine(0, -30, 8, 5, {
                    behavior: 'static'
                });
                
                // Wave 2
                enemies.spawnCluster(-15, -80, 10, 8, {
                    behavior: 'chase'
                });
                
                // Boss
                enemies.spawnBoss({
                    position: { x: 0, y: 0, z: -200 },
                    health: 2000
                });
                
                console.log(`👹 Enemies spawned: ${enemies.getAliveCount()}`);
                
                // ===== WEATHER =====
                const weather = core.modules.weather;
                weather.setWeather?.('clear'); // or 'rain', 'snow', etc.
                
                console.log('🌤️ Weather set');
                
                // ===== MUSIC =====
                const music = core.modules.music;
                
                music.loadPlaylist('level1', [
                    {
                        title: "Track 1",
                        artist: "Your Artist",
                        file: "./assets/music/track1.mp3"
                    },
                    {
                        title: "Track 2",
                        artist: "Your Artist",
                        file: "./assets/music/track2.mp3"
                    }
                ]);
                
                console.log('🎵 Music loaded');
                
                console.log('✅ Level setup complete!');
            }
        };

        // ===================================
        // START GAME
        // ===================================
        window.addEventListener('load', init);
    </script>
</body>
</html>
```

---

## 🔧 What to Create (Modules You Don't Have Yet)

### **1. Dialogue Module** (`modules/dialogue/applesauce-dialogue.js`)

```javascript
export class ApplesauceDialogue {
    constructor(core) {
        this.core = core;
        this.activeDialogue = null;
        this.uiElement = null;
        this._createUI();
    }
    
    _createUI() {
        // Create dialogue box UI
    }
    
    show(npcName, text, choices) {
        // Display dialogue
        this.core.state.paused = true;
    }
    
    hide() {
        this.core.state.paused = false;
    }
    
    update(deltaTime) {
        // Handle dialogue progression
    }
}
```

### **2. Pause Module** (`modules/pause/applesauce-pause.js`)

```javascript
export class ApplesaucePause {
    constructor(core) {
        this.core = core;
        this.menuOpen = false;
        this._createUI();
        this._setupControls();
    }
    
    _createUI() {
        // Create pause menu
    }
    
    _setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'p') {
                this.toggle();
            }
        });
    }
    
    toggle() {
        this.menuOpen = !this.menuOpen;
        this.core.state.paused = this.menuOpen;
        // Show/hide menu
    }
}
```

### **3. Weather Module** (`modules/weather/applesauce-weather.js`)

```javascript
export class ApplesauceWeather {
    constructor(core) {
        this.core = core;
        this.particles = [];
        this.currentWeather = 'clear';
    }
    
    setWeather(type) {
        // 'clear', 'rain', 'snow', 'fog'
        this.currentWeather = type;
        this.clear();
        
        if (type === 'rain') {
            this.createRain();
        } else if (type === 'snow') {
            this.createSnow();
        }
    }
    
    createRain() {
        // Create rain particles
    }
    
    createSnow() {
        // Create snow particles
    }
    
    update(deltaTime) {
        // Update weather particles
    }
    
    clear() {
        // Remove all particles
    }
}
```

---

## ✅ Quick Start Checklist

1. **Download/organize your files** according to structure above
2. **Copy this HTML template** as `index.html`
3. **Verify Three.js** is at `./three.module.js`
4. **Create missing modules** (dialogue, pause, weather) OR comment them out
5. **Adjust terrain config** in GAME_LEVEL (flat/procedural/segments)
6. **Open `index.html`** in a browser
7. **Test!** 🎮

---

## 🎯 Terrain Integration Summary

**Your terrain system (`applesauce-terrain-4.js`) is complete and ready to use!**

Just pick a mode in your level config:

```javascript
// FLAT (simplest)
terrain: {
    mode: 'flat',
    size: 2000,
    color: 0x228B22
}

// PROCEDURAL (rolling hills)
terrain: {
    mode: 'procedural',
    size: 2000,
    resolution: 100,
    noise: { /* config */ }
}

// SEGMENTED (chapters)
terrain: {
    mode: 'segments',
    segments: [
        { type: 'flat', length: 200 },
        { type: 'hill', length: 100, startHeight: 0, endHeight: 30 }
    ]
}

// BIOMES (multi-region)
terrain: {
    mode: 'procedural',
    biomes: [
        { name: 'Forest', zStart: -1000, zEnd: 0, color: 0x228B22 },
        { name: 'Desert', zStart: 0, zEnd: 1000, color: 0xC2B280 }
    ]
}
```

**That's it! Everything else is handled by the system!** 🏔️✨
