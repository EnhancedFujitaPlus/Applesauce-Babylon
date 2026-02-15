# Player Object Not Found - Troubleshooting Guide

## The Problem

The error `❌ Player object not found!` means your `ApplesauceCore` doesn't create a `game.player` property, or it's named something else.

## Quick Fix - Try This First!

### 1. Open Browser Console (F12)
Run this command:
```javascript
showGameObjects()
```

This will show you all available game properties. Look for something like:
```
✅ game.skater: Vector3 {x: 0, y: 0, z: 0}
✅ game.camera: PerspectiveCamera {...}
```

### 2. If You See game.skater
Your core uses `skater` instead of `player`! The new code should auto-detect this, but if not, run:
```javascript
fixPlayerPosition()
```

This will move whatever player object exists to the spawn point.

### 3. Full Debug
```javascript
debugLevel58()
```

This shows everything: player objects, position, modules loaded, etc.

## What The Code Now Does

The updated HTML file checks multiple possible player object names:
```javascript
const candidates = [
    'player',
    'skater',     // ← Your APPLESAUCE games probably use this!
    'character',
    'controller',
    'playerController'
];
```

It also falls back to using `game.camera` if no player object exists.

## Manual Position Fix

If automatic positioning fails, you can manually fix it from console:

```javascript
// Find what your player object is called
showGameObjects()

// Then manually position it (replace 'skater' with your object name)
game.skater.position.set(0, 2, -90)

// Or use the helper function
fixPlayerPosition()
```

## Check Your ApplesauceCore

Your `applesauce-core-33.js` should create a player object. Look for something like:

```javascript
// In ApplesauceCore constructor or start()
this.skater = new THREE.Group();
// or
this.player = new THREE.Object3D();
// or
this.character = /* ... */
```

### Common Patterns

**Pattern 1: Skater Model**
```javascript
class ApplesauceCore {
    constructor() {
        this.skater = new THREE.Group();
        this.scene.add(this.skater);
    }
}
```

**Pattern 2: First-Person (Camera IS Player)**
```javascript
class ApplesauceCore {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        // Camera moves, no separate player object
    }
}
```

**Pattern 3: Physics Controller**
```javascript
class ApplesauceCore {
    constructor() {
        this.playerController = new PlayerController();
        this.player = this.playerController.mesh;
    }
}
```

## If You're Using the Skater Model

Your core probably has:
```javascript
this.skater = /* THREE.Group with skater mesh */
```

The level file now checks for this! It will find `game.skater` and use it automatically.

## Verify It Works

After the level loads, check the console for:
```
✅ Found player object: game.skater
✅ Player spawned at: 0, 2, -90
```

And the HUD should show:
```
POS: 0.0, 2.0, -90.0
```

## Still Not Working?

### Option 1: Load a Different Level First
Some cores need to load a "default" level before custom levels work. Try:
```javascript
// Load a working level first
await game.loadLevel(workingLevel);
// Then load Level 58
await game.loadLevel(LEVEL_58);
```

### Option 2: Create Player Manually
Add this BEFORE `game.start()`:
```javascript
// Create a simple player object if your core doesn't
if (!game.player && !game.skater) {
    game.player = new THREE.Group();
    game.player.position.set(0, 2, -90);
    game.scene.add(game.player);
    
    // Attach camera to player
    game.player.add(game.camera);
    game.camera.position.set(0, 1.6, 0); // Eye height
}
```

### Option 3: Use loadLevel() If Available
If your core has a `loadLevel()` method:
```javascript
// Instead of manually building the store
await game.loadLevel(LEVEL_58);
```

This might handle player spawning automatically.

## Console Commands Reference

All these are available in the browser console:

```javascript
// Show all game objects and find player
showGameObjects()

// Move player to spawn point
fixPlayerPosition()

// Show comprehensive debug info
debugLevel58()

// Manually position (after checking showGameObjects)
game.skater.position.set(0, 5, 0)
game.camera.position.set(0, 5, 0)
```

## Expected Output When Working

```
🛹 Building department store...
⏳ Waiting for player initialization...
✅ Found player object: game.skater
✅ Player spawned at: 0, 2, -90
📌 Created game.player reference
🌀 Non-Euclidean Department Store Ready!
💡 Debug commands available:
  fixPlayerPosition() - Move player to spawn
  showGameObjects() - List all game objects
  debugLevel58() - Show full debug info
```

## Camera vs Player

Some games use the camera AS the player object (first-person):
- Camera position = player position
- Camera moves, no separate mesh

Others have a separate player object:
- Player has a mesh (the skater)
- Camera follows player
- Camera is child of player OR positioned manually each frame

The code now handles both!

## Next Steps

1. Load the level
2. Open console (F12)
3. Run `showGameObjects()`
4. Look for the player object name
5. Run `fixPlayerPosition()` if needed
6. Report back what you see!

The console output will tell us exactly what your core calls its player object, and we can adjust from there.
