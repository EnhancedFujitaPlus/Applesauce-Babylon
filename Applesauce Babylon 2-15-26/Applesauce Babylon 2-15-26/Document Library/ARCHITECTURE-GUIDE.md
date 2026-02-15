# APPLESAUCE Level Architecture - No Config Files Needed!

## File Structure
```
applesauce/
├── index.html                    ← Launcher/Menu
├── three.module.js               ← Three.js library
├── applesauce-core.js            ← Engine (scene, player, physics)
├── applesauce-styles.css         ← All UI styles
│
├── MODULES (imported as needed):
├── applesauce-gore.js
├── applesauce-dialogue.js
├── applesauce-enemies.js
├── applesauce-objectives.js
├── applesauce-materials.js
├── applesauce-level-builder.js
├── applesauce-terrain.js
├── applesauce-weather.js
├── applesauce-player.js
└── ... (other modules)
│
└── LEVELS (self-contained HTML):
    ├── level-01-desert.html
    ├── level-02-ice.html
    ├── level-03-lava.html
    └── level-XX-name.html
```

## How It Works

### 1. index.html (Launcher)
```html
<!DOCTYPE html>
<html>
<head>
    <title>APPLESAUCE</title>
    <style>
        /* Menu styling */
    </style>
</head>
<body>
    <h1>APPLESAUCE</h1>
    <div id="level-select">
        <button onclick="location.href='level-01-desert.html'">Level 1: Desert Heat</button>
        <button onclick="location.href='level-02-ice.html'">Level 2: Frozen Wasteland</button>
        <button onclick="location.href='level-03-lava.html'">Level 3: Volcano Run</button>
    </div>
</body>
</html>
```

### 2. level-XX.html (Self-Contained Level)
Each level HTML contains EVERYTHING:
- Link to CSS
- Import core engine
- Import needed modules
- Define level config INLINE
- Build the level
- Initialize game

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="applesauce-styles.css">
    <title>APPLESAUCE - Level 1</title>
</head>
<body class="terrain-desert">
    <!-- HUD elements -->
    
    <script type="importmap">
        {
            "imports": {
                "three": "./three.module.js"
            }
        }
    </script>
    
    <script type="module">
        // 1. IMPORT ENGINE & MODULES
        import { ApplesauceCore } from './applesauce-core.js';
        
        // 2. DEFINE LEVEL CONFIG INLINE (no separate file!)
        const levelConfig = {
            meta: {
                number: 1,
                name: "Desert Heat"
            },
            scene: {
                background: 0xFFE4B5,
                fog: { color: 0xF4A460, near: 100, far: 300 }
            },
            terrain: {
                type: 'desert',
                hillHeight: 15,
                hillLength: 150
            },
            playerStart: { x: 0, z: 10 },
            obstacles: [
                { type: 'ramp', x: 20, z: 0 },
                { type: 'rail', x: 40, z: 0, length: 10 }
            ],
            objectives: [
                { text: 'Score 10,000 points', type: 'score', target: 10000 }
            ],
            onLevelStart: (game) => {
                // Spawn NPCs
                game.modules.dialogue.createNPC({
                    name: 'Desert Nomad',
                    position: { x: 10, y: 0, z: 5 },
                    dialogue: [...]
                });
                
                // Spawn enemies
                game.modules.enemies.spawn(...)
            }
        };
        
        // 3. INITIALIZE GAME
        const game = new ApplesauceCore({
            goreEnabled: true,
            maxSpeed: 1.2
        });
        
        // 4. LOAD LEVEL
        await game.loadLevel(levelConfig);
        
        // 5. START
        game.start();
        
        window.game = game; // Debug access
    </script>
</body>
</html>
```

## What Gets Imported Where

### applesauce-core.js imports:
✅ All modules at the top (it already does this!)
✅ Provides game engine, scene, player, physics

### level-XX.html imports:
✅ Only the core engine
✅ Defines level config inline
✅ No separate config file needed!

### CSS:
✅ One external stylesheet for all levels
✅ Use body classes for terrain themes

## Why This Works

1. **Self-contained levels** - Everything for a level is in one HTML file
2. **No config files** - Config defined inline in the level HTML
3. **Core handles everything** - Engine imports all modules, level just uses them
4. **Clean separation** - HTML = level, JS = engine/modules, CSS = styling
5. **Easy to maintain** - Edit one file to change a level
6. **Artist-friendly** - Level designers just edit the HTML file

## Flow Diagram

```
User clicks level button in index.html
↓
Browser loads level-XX.html
↓
HTML imports applesauce-core.js
↓
Core imports all modules (gore, dialogue, enemies, etc.)
↓
Level defines config object inline
↓
Level calls game.loadLevel(config)
↓
Core processes config:
  - Creates terrain
  - Spawns obstacles
  - Calls onLevelStart() which spawns NPCs/enemies
↓
Level calls game.start()
↓
GAME RUNNING!
```

## Answer to Your Question

**Q: Does it need level-x-config.js?**

**A: NO!** 

Define the config INLINE in the level HTML as a JavaScript object. The core's `loadLevel()` method accepts a config object - it doesn't care if it comes from a separate file or is defined inline.

This is cleaner because:
- One file per level = easier to manage
- No extra files cluttering the directory
- Level designers see everything in one place
- Still modular - core + modules are separate
