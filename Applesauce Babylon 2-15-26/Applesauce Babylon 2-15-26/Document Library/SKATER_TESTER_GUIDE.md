# Skater Model Tester - User Guide

## Overview
The Skater Model Tester is an interactive tool for testing and customizing skater models for APPLESAUCE. It combines your test_player_spawn.html with the ApplesauceSkater module to create a complete testing environment.

## Features

### 🎮 Model Controls
- **Spawn Skater** - Creates a skater with current settings
- **Remove Skater** - Removes the skater from scene
- **Reset Camera** - Returns camera to default position

### 🎨 Color Customization
Real-time color pickers for:
- Deck color (default: Hot Pink #FF1493)
- Body/clothing color (default: Dark Gray #333333)
- Skin color (default: Peach #FFDAAC)

### 📍 Position Controls
Live sliders to adjust:
- X position (-20 to 20)
- Y position (0 to 10, height above ground)
- Z position (-20 to 20)

### 🧪 Test Actions
- **Kickflip** - Deck spins 360° around X axis
- **Ollie** - Skater jumps up 2 units
- **Rotate 360°** - Spins skater around Y axis

### 📷 Camera Controls
- **Mouse drag** - Rotate camera around skater
- **Mouse wheel** - Zoom in/out
- **Reset button** - Return to default view

## Quick Start

1. Load `skater_model_tester.html` in your browser
2. Wait for initialization (green log messages)
3. Click "🛹 Spawn Skater"
4. Use color pickers and sliders to customize
5. Test animations with action buttons

## Test Environment

The scene includes:
- **Ground plane** - 100x100 grid
- **Ramp** - Test obstacle at X=10
- **Rail** - Test obstacle at X=-8
- **Lighting** - Ambient + directional + hemisphere

## Creating Custom Skater Models

### Method 1: Modify ApplesauceSkater.js

The current skater is built from basic THREE.js primitives:
```javascript
// Deck (the skateboard)
const deckGeo = new THREE.BoxGeometry(0.8, 0.1, 2.5);

// Body
const bodyGeo = new THREE.BoxGeometry(0.6, 1.2, 0.4);

// Head
const headGeo = new THREE.SphereGeometry(0.3, 8, 8);

// Wheels (4 cylinders)
const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12);
```

**To create a new model:**
1. Copy `applesauce-skater.js` to a new file (e.g., `applesauce-skater-pro.js`)
2. Modify the geometry in the `spawn()` method
3. Change colors, sizes, add new parts
4. Import your new model in the tester

### Method 2: Create a Model Class

Create a new skater module with the same interface:

```javascript
// applesauce-skater-anime.js
export class ApplesauceSkaterAnime {
    constructor(core) {
        this.core = core;
        this.player = null;
        this.deck = null;
    }
    
    spawn(config = {}) {
        const player = new THREE.Group();
        
        // Your custom geometry here
        // Example: Bigger head, thinner body for anime style
        const headGeo = new THREE.SphereGeometry(0.5, 16, 16); // Bigger!
        const bodyGeo = new THREE.BoxGeometry(0.4, 1.4, 0.3);  // Thinner!
        
        // ... create your model
        
        this.player = player;
        this.core.player = player;
        return player;
    }
    
    update(core) {
        // Optional: animations
    }
    
    remove() {
        if (this.player) {
            this.core.scene.remove(this.player);
            this.player = null;
        }
    }
}
```

### Method 3: Load External Models

For more complex models (GLTF/GLB):

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ApplesauceSkaterGLTF {
    constructor(core) {
        this.core = core;
        this.player = null;
        this.loader = new GLTFLoader();
    }
    
    async spawn(config = {}) {
        return new Promise((resolve, reject) => {
            this.loader.load('./models/skater.glb', (gltf) => {
                this.player = gltf.scene;
                
                // Position and scale
                this.player.position.set(config.x || 0, 0, config.z || 0);
                this.player.scale.set(0.5, 0.5, 0.5);
                
                // Add to scene
                this.core.scene.add(this.player);
                this.core.player = this.player;
                
                resolve(this.player);
            }, undefined, reject);
        });
    }
}
```

## Testing Your Custom Model

### Step 1: Update Import
In `skater_model_tester.html`, change:
```javascript
// OLD
import { ApplesauceSkater } from './engine/applesauce-skater.js';

// NEW
import { ApplesauceSkaterPro } from './engine/applesauce-skater-pro.js';
```

### Step 2: Update Instantiation
```javascript
// OLD
window.skaterModule = new ApplesauceSkater(game);

// NEW
window.skaterModule = new ApplesauceSkaterPro(game);
```

### Step 3: Test
1. Reload the page
2. Click "Spawn Skater"
3. Verify your model appears
4. Test all animations
5. Export config when satisfied

## Model Requirements

Your custom skater must:

### Required Properties
```javascript
this.core     // Reference to ApplesauceCore
this.player   // THREE.Group containing the model
this.deck     // Reference to skateboard deck (for tricks)
```

### Required Methods
```javascript
spawn(config)  // Creates and returns player group
remove()       // Removes player from scene
```

### Optional Methods
```javascript
update(core)      // Called each frame for animations
setDeckColor(hex) // Changes deck color
setBodyColor(hex) // Changes body/clothing color
```

## Example: Simple Stick Figure Skater

```javascript
export class ApplesauceSkaterStick {
    constructor(core) {
        this.core = core;
        this.player = null;
        this.deck = null;
    }
    
    spawn(config = {}) {
        const player = new THREE.Group();
        
        // Super simple stick figure
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
        
        // Body (vertical line)
        const bodyPoints = [
            new THREE.Vector3(0, 0.5, 0),
            new THREE.Vector3(0, 1.8, 0)
        ];
        const bodyGeo = new THREE.BufferGeometry().setFromPoints(bodyPoints);
        const body = new THREE.Line(bodyGeo, lineMat);
        player.add(body);
        
        // Head (small sphere)
        const headGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 2.0;
        player.add(head);
        
        // Simple deck
        const deckGeo = new THREE.BoxGeometry(0.6, 0.1, 2.0);
        const deckMat = new THREE.MeshBasicMaterial({ 
            color: config.deckColor || 0xff0000 
        });
        this.deck = new THREE.Mesh(deckGeo, deckMat);
        this.deck.position.y = 0.3;
        player.add(this.deck);
        
        // Position
        player.position.set(config.x || 0, 1, config.z || 0);
        
        // Add to scene
        this.core.scene.add(player);
        this.player = player;
        this.core.player = player;
        
        return player;
    }
    
    remove() {
        if (this.player) {
            this.core.scene.remove(this.player);
            this.player = null;
        }
    }
}
```

## Advanced: Multiple Models

You can create a model switcher:

```javascript
import { ApplesauceSkater } from './engine/applesauce-skater.js';
import { ApplesauceSkaterPro } from './engine/applesauce-skater-pro.js';
import { ApplesauceSkaterAnime } from './engine/applesauce-skater-anime.js';

const MODELS = {
    'default': ApplesauceSkater,
    'pro': ApplesauceSkaterPro,
    'anime': ApplesauceSkaterAnime
};

let currentModel = 'default';

function switchModel(modelName) {
    // Remove current skater
    if (skaterModule?.player) {
        skaterModule.remove();
    }
    
    // Create new skater module
    const ModelClass = MODELS[modelName];
    skaterModule = new ModelClass(game);
    
    // Spawn with current settings
    spawnSkater();
}
```

Add to HTML:
```html
<select onchange="switchModel(this.value)">
    <option value="default">Default Skater</option>
    <option value="pro">Pro Skater</option>
    <option value="anime">Anime Skater</option>
</select>
```

## Tips for Model Creation

### Scale Guidelines
- Player height: ~2 units (0-2 on Y axis)
- Deck length: 2-3 units
- Deck width: 0.6-0.8 units
- Wheel diameter: 0.3 units

### Performance
- Keep polygon count under 5,000 for smooth performance
- Use `MeshLambertMaterial` instead of `MeshStandardMaterial`
- Disable shadows on small details
- Use instancing for repeated elements (wheels)

### Animation Tips
- Store references to moving parts (`this.deck`, `this.arms`, etc.)
- Use smooth interpolation for realistic motion
- Reset rotations after tricks complete
- Add easing for natural movement

### Color System
Standard hex colors work:
```javascript
0xFF1493  // Hot pink
0x333333  // Dark gray
0xFFDBAC  // Skin tone
```

Convert from HTML color picker:
```javascript
const hexString = "#FF1493";
const hexNumber = parseInt(hexString.replace('#', '0x'));
```

## Debug Tools

### Console Commands
Available in browser console:
```javascript
showDebugInfo()    // Display all object info
exportModel()      // Export current configuration
clearLog()         // Clear the log panel
```

### Log Output
Watch the log panel (bottom) for:
- ✅ Success messages (green)
- ⚠️ Warnings (yellow)
- ❌ Errors (red)
- 📍 Info (cyan)

## Integration with Level 58

Once you've tested your skater model:

1. Export the configuration
2. Add to Level 58 initialization:

```javascript
// In level_58_noneuclid.html
import { ApplesauceSkaterPro } from './engine/applesauce-skater-pro.js';

async function startDemo() {
    // ... existing code ...
    
    // Create skater module
    game.modules.skater = new ApplesauceSkaterPro(game);
    
    // Spawn at level start position
    game.modules.skater.spawn({
        x: LEVEL_58.playerStart.x,
        z: LEVEL_58.playerStart.z,
        deckColor: 0xFF1493,
        bodyColor: 0x333333
    });
    
    // ... rest of code ...
}
```

## Troubleshooting

**Skater spawns underground:**
- Check Y position slider (should be > 0)
- Verify terrain height calculation

**Colors not applying:**
- Make sure skater is spawned first
- Check console for material errors

**Animations jerky:**
- Reduce animation speed (smaller increment values)
- Add easing functions for smoothness

**Model not appearing:**
- Check console for loading errors
- Verify file paths are correct
- Check scale (might be too small/large)

## Next Steps

1. Test the default skater model
2. Experiment with colors and positions
3. Try creating a simple modified version
4. Test animations and tricks
5. Export and use in your levels

The tester is your sandbox for all skater development!
