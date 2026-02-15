# APPLESAUCE Skater Module Guide 🛹

## Overview

The `ApplesauceSkater` module creates a reusable skateboard player that can be imported into any level. This replaces the old hardcoded player creation with a modular, customizable system.

## File Structure

```
your-project/
├── three.module.js
├── applesauce-core-3.js              ← Updated core with skater integration
├── player/
│   └── applesauce-skater.js          ← NEW: Skater module
└── levels/
    └── applesauce-level-wildwest.js  ← Your levels
```

## What The Skater Module Provides

### Player Model Components

The skater is made of:
- **Skateboard deck** (customizable color)
- **4 wheels** (black)
- **Body** (customizable color)
- **Head** (skin tone)
- **2 arms**
- **2 legs**

All parts have proper shadows and physics!

## How It's Integrated Into The Core

### 1. Import (Already Done)
```javascript
// In applesauce-core-3.js
import { ApplesauceSkater } from './player/applesauce-skater.js';
```

### 2. Initialize (Already Done)
```javascript
// In constructor
this.modules.skater = new ApplesauceSkater(this);
```

### 3. Spawn Player (Already Done)
```javascript
// In createPlayer()
this.modules.skater.spawn({
    x: x,
    z: z,
    deckColor: this.config.deckColor || 0xFF1493,
    bodyColor: this.config.bodyColor || 0x333333
});
```

### 4. Update Animations (Already Done)
```javascript
// In update()
if (this.modules.skater && this.modules.skater.update) {
    this.modules.skater.update(this);
}
```

## Using Skater In Your Levels

### Basic Usage (Default Colors)

Your Wild West level already works! The core automatically spawns the skater:

```javascript
// In your level config
playerStart: {
    x: -40,
    z: 0
}

// Core automatically calls:
// core.createPlayer(-40, 0);
// Which spawns the skater at that position!
```

### Custom Colors Per Level

Add color config to your level:

```javascript
export const HighNoonShowdown = {
    meta: {
        number: 3,
        name: "High Noon Showdown"
    },
    
    // Custom skater colors for this level
    skaterConfig: {
        deckColor: 0x8B4513,  // Brown deck (wild west theme)
        bodyColor: 0x654321,  // Cowboy outfit brown
        skinColor: 0xFFDBAC   // Skin tone
    },
    
    playerStart: {
        x: -40,
        z: 0
    },
    
    // ... rest of level
}
```

Then in your level loader:

```javascript
// When loading level
if (levelConfig.skaterConfig) {
    core.config.deckColor = levelConfig.skaterConfig.deckColor;
    core.config.bodyColor = levelConfig.skaterConfig.bodyColor;
    core.config.skinColor = levelConfig.skaterConfig.skinColor;
}
```

## Skater Module API

### spawn(config)

Creates the player at specified position.

```javascript
core.modules.skater.spawn({
    x: 10,              // X position (default: 0)
    z: 5,               // Z position (default: 0)
    deckColor: 0xFF0000,   // Red deck (default: 0xFF1493 hot pink)
    bodyColor: 0x0000FF,   // Blue body (default: 0x333333 dark gray)
    skinColor: 0xFFDBAC    // Skin tone (default: 0xFFDBAC)
});
```

**Returns:** The player THREE.Group

**Side effects:**
- Sets `core.player` reference
- Adds player to scene
- Positions at terrain height

### update(core)

Updates player animations every frame.

```javascript
// Called automatically in core.update()
core.modules.skater.update(core);
```

**Animations:**
- Deck spin during kickflips
- Lean during turns (A/D keys)
- Smooth return to center

### remove()

Removes player from scene.

```javascript
core.modules.skater.remove();
```

**Side effects:**
- Removes from scene
- Clears `core.player` reference
- Clears internal references

### setDeckColor(color)

Changes deck color after spawn.

```javascript
// Make deck gold when level complete
core.modules.skater.setDeckColor(0xFFD700);
```

### setBodyColor(color)

Changes body/clothes color after spawn.

```javascript
// Change outfit to red
core.modules.skater.setBodyColor(0xFF0000);
```

## Built-In Animations

### Kickflip Animation

When player presses Q:
- Deck spins on X-axis
- Automatic smooth spin
- Reset when trick lands

### Turn Lean

When player turns:
- Press A → Lean left
- Press D → Lean right
- Auto-return to center
- Subtle realistic lean (0.2 radians max)

### You Can Add More!

Edit `update()` in `applesauce-skater.js`:

```javascript
update(core) {
    if (!this.player || !this.deck) return;
    
    // Your custom animations here!
    
    // Example: Jump animation
    if (core.state.jumping) {
        // Tuck legs during jump
        this.player.children.forEach(child => {
            if (child.geometry?.type === 'BoxGeometry' && 
                child.position.y < 1) {
                child.position.y += 0.1;  // Pull legs up
            }
        });
    }
}
```

## Customization Examples

### Level-Specific Skater Themes

```javascript
// Cyberpunk level - neon skater
skaterConfig: {
    deckColor: 0x00FFFF,  // Cyan deck
    bodyColor: 0xFF00FF,  // Magenta outfit
}

// Desert level - sandy skater  
skaterConfig: {
    deckColor: 0xD2691E,  // Chocolate deck
    bodyColor: 0xF4A460,  // Sandy brown outfit
}

// Ice level - frozen skater
skaterConfig: {
    deckColor: 0x87CEEB,  // Sky blue deck
    bodyColor: 0xFFFFFF,  // White outfit
}
```

### Dynamic Color Changes

```javascript
// In level update
if (playerEntersLavaZone) {
    // Make deck glow red
    core.modules.skater.setDeckColor(0xFF0000);
}

if (playerGetsCoated) {
    // Change to gold
    core.modules.skater.setDeckColor(0xFFD700);
    core.modules.skater.setBodyColor(0xFFD700);
}
```

### Power-Up Visual Feedback

```javascript
// Collect speed boost
if (playerGetsSpeedBoost) {
    core.modules.skater.setDeckColor(0xFF4500);  // Orange-red
    
    setTimeout(() => {
        core.modules.skater.setDeckColor(0xFF1493);  // Back to normal
    }, 5000);
}
```

## Accessing Player Parts

The skater stores references you can use:

```javascript
// Access the deck
const deck = core.modules.skater.deck;
deck.rotation.x = Math.PI;  // Flip it!

// Access the whole player group
const player = core.modules.skater.player;
player.scale.set(2, 2, 2);  // Make player huge!

// Access individual parts
player.children.forEach(child => {
    if (child.geometry?.type === 'SphereGeometry') {
        // This is the head!
        child.material.color.setHex(0x00FF00);  // Green alien head
    }
});
```

## Wild West Level Integration

Your Wild West level now automatically uses the skater! Here's what happens:

```javascript
// 1. Level loads
await game.loadLevel(HighNoonShowdown);

// 2. Core creates player at playerStart
core.createPlayer(
    HighNoonShowdown.playerStart.x,  // -40
    HighNoonShowdown.playerStart.z   // 0
);

// 3. Skater spawns
core.modules.skater.spawn({
    x: -40,
    z: 0,
    deckColor: 0xFF1493,  // Default hot pink
    bodyColor: 0x333333   // Default gray
});

// 4. Player appears in town!
```

## Testing Your Skater

### Console Commands

```javascript
// Check if skater exists
console.log(game.modules.skater);

// Check player reference
console.log(game.player);

// Teleport skater
game.player.position.set(0, 5, 0);

// Change colors
game.modules.skater.setDeckColor(0xFF0000);  // Red deck
game.modules.skater.setBodyColor(0x0000FF);  // Blue body

// Remove and respawn
game.modules.skater.remove();
game.modules.skater.spawn({ x: 0, z: 0 });

// Make skater huge
game.player.scale.set(3, 3, 3);

// Make skater tiny
game.player.scale.set(0.5, 0.5, 0.5);
```

## Common Issues

### "Player not appearing"
- Check `game.player` exists: `console.log(game.player)`
- Check position: `console.log(game.player.position)`
- Make sure terrain height is calculated correctly

### "Player is underground"
- The spawn method uses `getTerrainHeight()`
- If terrain module not loaded, it defaults to y=0
- Check: `console.log(game.getTerrainHeight(0, 0))`

### "Deck not spinning during kickflip"
- Make sure update is being called: check console for errors
- Check: `console.log(game.modules.skater.deck)`
- Verify `core.state.attemptingKickflip` is being set

### "Can't see player"
- Check camera position: `console.log(game.camera.position)`
- Player might be behind camera
- Try: `game.camera.position.set(0, 20, -30)`

## Advanced: Creating Alternative Player Models

You can create multiple player modules!

```javascript
// applesauce-bmx-rider.js
export class ApplesauceBMXRider {
    spawn(config) {
        // Create BMX bike instead of skateboard
        const player = new THREE.Group();
        // ... BMX model
        return player;
    }
}

// applesauce-hoverboard.js  
export class ApplesauceHoverboard {
    spawn(config) {
        // Create sci-fi hoverboard
        const player = new THREE.Group();
        // ... hoverboard model
        return player;
    }
}
```

Then in your core, choose which to use:

```javascript
if (levelConfig.vehicleType === 'skateboard') {
    this.modules.skater = new ApplesauceSkater(this);
} else if (levelConfig.vehicleType === 'bmx') {
    this.modules.skater = new ApplesauceBMXRider(this);
} else if (levelConfig.vehicleType === 'hoverboard') {
    this.modules.skater = new ApplesauceHoverboard(this);
}
```

## Summary

✅ **What Changed:**
1. Created `applesauce-skater.js` module
2. Updated core to import and use skater
3. Core now spawns player via skater module
4. Skater updates automatically for animations

✅ **Benefits:**
- Reusable player across all levels
- Customizable colors per level
- Easy to modify/extend
- Consistent player model
- Modular architecture

✅ **What You Need:**
- Put `applesauce-skater.js` in your `player/` folder
- Use updated `applesauce-core-3.js`
- Your levels work automatically!

Your Wild West level will now have the modular skater system! 🤠🛹
