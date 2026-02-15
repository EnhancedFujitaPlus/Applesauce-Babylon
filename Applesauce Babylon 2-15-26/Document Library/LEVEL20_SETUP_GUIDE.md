# LEVEL 20 - Setup Guide for core-33
## St. Clair's Defeat - Canyon Basin Battle

### 📁 File Structure Required

Your project should be organized like this:

```
your-game/
├── Level_20.html                    (main HTML file)
├── levels/
│   └── level20-config.js           (level configuration)
└── engine/
    ├── three.module.js             (Three.js r182 ES6 module)
    └── core/
        ├── applesauce-core-33.js   (your core engine)
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
        ├── skater/
        │   └── applesauce-skater.js
        └── skybox/
            └── applesauce-skybox.js
```

### 🔧 Core-33 Path Adjustments

Your `applesauce-core-33.js` currently has these imports:

```javascript
import * as THREE from '../three.module.js';
import { ApplesauceGore } from './gore/applesauce-gore.js';
// etc...
```

This assumes the file is located at `engine/core/applesauce-core-33.js`

**If your structure is different:**
1. Adjust the import paths in core-33
2. Make sure `three.module.js` is at `engine/three.module.js`
3. All module folders should be at `engine/core/[module-name]/`

### 🌐 Three.js r182 - Import Map vs. Local

The HTML file uses a CDN import map for Three.js r182:

```html
<script type="importmap">
{
    "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js"
    }
}
</script>
```

**To use local Three.js instead:**

1. Download Three.js r182 from: https://github.com/mrdoob/three.js/releases/tag/r182
2. Extract `three.module.js` to `engine/three.module.js`
3. Change import map to:
```javascript
"three": "./engine/three.module.js"
```

4. Update core-33.js import to use the import map alias:
```javascript
import * as THREE from 'three';  // Instead of '../three.module.js'
```

### 🎮 Module Requirements

Each module file needs to export its class. For example:

**applesauce-terrain-3.js:**
```javascript
import * as THREE from 'three';

class ApplesauceTerrain {
    constructor(game) {
        this.game = game;
    }
    
    generate(config) {
        // Terrain generation based on config.type
        if (config.type === 'canyon_basin') {
            this.generateCanyonBasin(config);
        }
    }
    
    generateCanyonBasin(config) {
        // Create basin floor
        // Create ridge walls
        // Add cover elements
        // etc.
    }
}

export { ApplesauceTerrain };
```

### 🏔️ Canyon Basin Terrain Features

The level config defines a `canyon_basin` terrain type with:

**Basin:**
- 400x400 unit play area
- Center depression (-15 units)
- Ridge walls (35 units high)
- Strategic high ground positions

**Elements to implement in terrain module:**
- `basin.centerDepth` - how deep the basin floor is
- `walls.positions` - array of ridge positions
- `cover` - trees, boulders, brush
- `camp` - American military camp in center

### ⚔️ Combat Mechanics

**Height Advantage:**
```javascript
// In combat module, check player vs enemy height
if (player.position.y > enemy.position.y + 5) {
    damage *= 1.25;  // 25% damage bonus from high ground
}
```

**Surprise Attack:**
```javascript
// First 120 seconds, enemies react slowly
if (game.state.battleTime < 120) {
    enemyReactionTime = 3.0;  // seconds
    enemyAccuracy = 0.3;      // 30% normal accuracy
}
```

**Morale System:**
```javascript
// Track faction morale
if (americanMorale < 20) {
    // Enemies start fleeing
    enemy.behavior = 'flee';
}
```

### 🎯 Objectives Implementation

The level has 5 objectives that your objectives module needs to track:

1. **surprise_attack** - Timed (120s)
2. **capture_artillery** - Defeat specific enemy groups
3. **tactical_position** - Area control
4. **minimize_casualties** - Condition check
5. **spare_civilians** - Condition check

### 🚀 Quick Start

1. Place files in correct directories
2. Make sure all module files exist and export their classes
3. Open Level_20.html in a modern browser (Chrome, Firefox, Edge)
4. Check browser console for any import errors

### 🐛 Common Issues

**"Failed to resolve module specifier"**
- Check file paths in import statements
- Make sure all files exist
- Verify import map is correct

**"Module not found"**
- Module file doesn't exist
- Path is incorrect relative to core-33.js
- File not exported properly

**"THREE is not defined"**
- Import map not loading
- three.module.js not found
- Import statement using wrong path

**Terrain not appearing:**
- Terrain module not implementing canyon_basin type
- Check console for terrain.generate() calls
- Verify config is being passed correctly

### 📝 Testing Checklist

- [ ] Level loads without console errors
- [ ] Terrain (canyon basin) renders
- [ ] Player spawns on north ridge
- [ ] Enemies spawn in camp below
- [ ] Fog/weather effects visible
- [ ] Objectives appear in UI
- [ ] Combat system responds to height advantage
- [ ] Dialogue triggers on events
- [ ] Morale system affects enemy behavior

### 🎨 Visual Style Notes

**Color Palette:**
- Background: `0x4a5859` (misty grey-blue)
- Ground: `0x3d4f3a` (dark forest floor)
- Walls: `0x5a5045` (rocky grey-brown)
- Fog: `0x9ca7a8` (light mist)

**Atmosphere:**
- Cold November dawn
- Heavy mist in basin
- Pale morning sunlight from east
- Limited visibility (fog far: 300 units)

### 🔄 Next Steps

1. Implement canyon_basin terrain type in terrain module
2. Add height advantage calculations to combat module
3. Add morale system to enemies module
4. Test surprise attack timing
5. Add historical dialogue and context

### 📚 Historical Context

St. Clair's Defeat (November 4, 1791) was one of the worst defeats of the U.S. Army by Native Americans. Led by Little Turtle and Blue Jacket, a confederation of Miami, Shawnee, and Delaware warriors executed a perfectly coordinated surprise attack on General Arthur St. Clair's poorly prepared camp. The level recreates this tactical brilliance - emphasizing surprise, terrain advantage, and coordinated assault.

---

Good luck with your level! The canyon basin setup should give you great tactical gameplay with the high ground mechanics. 🏔️⚔️
