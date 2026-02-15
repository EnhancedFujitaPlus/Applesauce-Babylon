# 🚀 QUICK DEBUG SETUP - Get Visibility in 5 Minutes

## Step 1: Add Debug Files (1 min)

Create a folder: `engine/debug/`

Place these files there:
- `applesauce-debug.js` (debug overlay)
- `core-checker.js` (initialization checker)

## Step 2: Update Your Level_20.html (2 min)

Replace your initialization code with this:

```html
<script type="module">
    import { ApplesauceCore } from './engine/core/applesauce-core-33.js';
    import { ApplesauceDebug } from './engine/debug/applesauce-debug.js';
    import { CoreChecker } from './engine/debug/core-checker.js';
    import { Level20Config } from './levels/level20-config.js';
    // Alternative minimal test level:
    // import { MinimalTestLevel } from './levels/minimal-test-level.js';
    
    async function initGame() {
        try {
            console.log('🎮 Initializing APPLESAUCE...');
            
            // Create game instance
            const game = new ApplesauceCore({
                goreEnabled: true,
                dialogueEnabled: true,
                enemiesEnabled: true,
                objectivesEnabled: true,
                materialsEnabled: true,
                musicEnabled: true,
                gearEnabled: true,
                weatherEnabled: true,
                weaponsEnabled: true,
                combatEnabled: true,
                pauseEnabled: true,
                skyboxEnabled: true,
                levelBuilderEnabled: true
            });
            
            // ⭐ ADD DEBUG OVERLAY
            game.debug = new ApplesauceDebug(game);
            
            // ⭐ EXPOSE GAME GLOBALLY FOR CONSOLE ACCESS
            window.game = game;
            
            // Load level
            await game.loadLevel(Level20Config);
            // For testing, use: await game.loadLevel(MinimalTestLevel);
            
            // ⭐ RUN INITIALIZATION CHECK
            const checker = new CoreChecker();
            await checker.runFullCheck(game);
            
            // Start game
            game.start();
            
            // Hide loading screen
            const loader = document.getElementById('loading');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 500);
            }
            
            console.log('✅ Game initialization complete!');
            console.log('💡 Debug overlay visible (press ` to toggle)');
            console.log('💡 Console commands: debugApplesauce.scene(), .modules(), .camera()');
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            document.getElementById('loading').innerHTML = 
                '<div style="color: #ff6b6b;">ERROR LOADING LEVEL<br>' + 
                error.message + '<br>' + error.stack + '</div>';
        }
    }
    
    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
</script>
```

## Step 3: Refresh and Read Debug Info (2 min)

1. Open Level_20.html in browser
2. Open console (F12)
3. Look at the initialization check results
4. Look at the debug overlay (top-left, green text)

## What You'll See

### ✅ GOOD - Everything Working:
```
🎮 Initializing APPLESAUCE...
🔍 Debug overlay initialized (Press ` to toggle)
🛹 APPLESAUCE Core Engine v4.0 (Three.js r182) initialized
📦 Loading level: Outside the Box
✅ Level Outside the Box loaded!

🔍 RUNNING CORE INITIALIZATION CHECK
═══════════════════════════════════════════════════

✅ Renderer Setup (4/4)
  ✅ Renderer exists
  ✅ Renderer attached to DOM
  ✅ Renderer has correct size
  ✅ Shadow map enabled

✅ Scene Setup (4/4)
  ✅ Scene exists
  ✅ Scene has objects - Found 12 objects
  ✅ Scene has background
  ✅ Scene has fog

✅ Camera Setup (5/5)
  ✅ Camera exists
  ✅ Camera has valid position
  ✅ Camera not at origin
  ✅ Camera aspect ratio correct
  ✅ Camera frustum valid

✅ Lighting Setup (4/4)
  ✅ Scene has lights - Found 2 light(s)
  ✅ Has ambient light
  ✅ Has directional light
  ✅ Sufficient light intensity

... etc ...

TOTAL: 30 passed, 0 failed

💡 RECOMMENDATIONS:
🎉 ALL CHECKS PASSED! Your core is properly initialized.
```

**Debug Overlay Shows:**
```
🛹 APPLESAUCE DEBUG
RENDERING:
FPS: 60
Scene Objects: 12
Lights: 2 | Meshes: 5
Renderer: ✅

CAMERA:
Position: (0.0, 50.0, 100.0)

PLAYER:
Player Exists: ✅
Deck Exists: ✅

MODULES:
terrain: ✅🔄
weather: ✅🔄
...
```

### ⚠️ BAD - Common Issues:

**Issue 1: No Player**
```
❌ Player Setup (0/4)
  ❌ Player object exists - Player missing - check createPlayer()
```
→ **Fix:** createPlayer() method not being called in loadLevel()

**Issue 2: No Lights**
```
❌ Lighting Setup (1/4)
  ✅ Scene has lights - Found 0 light(s)
  ❌ Has ambient light
```
→ **Fix:** Add _setupLighting() call in constructor

**Issue 3: Camera at Origin**
```
⚠️ Camera Setup (4/5)
  ❌ Camera not at origin
```
→ **Fix:** Camera position not set after player creation

**Issue 4: Not Running**
```
❌ Animation Loop (1/3)
  ❌ Game is running - ⚠️ Game not started!
```
→ **Fix:** game.start() not being called

## Step 4: Use Console Commands

Once loaded, run these in console:

```javascript
// See everything in the scene
debugApplesauce.scene()

// Check all module states
debugApplesauce.modules()

// Check camera position
debugApplesauce.camera()

// Check game state
debugApplesauce.state()

// Access game directly
game.player            // Player object
game.scene.children    // All scene objects
game.camera.position   // Camera position

// Run initialization check again
const c = new CoreChecker();
c.runFullCheck(game);
```

## Step 5: Emergency Visibility Test

If still black screen, add this at the END of your loadLevel() method:

```javascript
// EMERGENCY: Force something visible
console.log('🚨 EMERGENCY VISIBILITY TEST');

// Super bright light
const testLight = new THREE.AmbientLight(0xffffff, 10.0);
this.scene.add(testLight);

// Giant red cube
const cubeGeo = new THREE.BoxGeometry(30, 30, 30);
const cubeMat = new THREE.MeshBasicMaterial({ 
    color: 0xff0000,
    wireframe: true
});
const cube = new THREE.Mesh(cubeGeo, cubeMat);
this.scene.add(cube);

// Green floor
const floorGeo = new THREE.PlaneGeometry(300, 300);
const floorMat = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,
    side: THREE.DoubleSide
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
this.scene.add(floor);

// Force camera to see it
this.camera.position.set(0, 50, 100);
this.camera.lookAt(0, 0, 0);

console.log('You should see: RED WIREFRAME CUBE on GREEN FLOOR');
```

**Result:**
- ✅ Can see cube + floor → Rendering works, issue is in level generation
- ❌ Still black → Renderer or canvas issue

## Common Fixes

### Fix 1: Terrain Not Generating
Your terrain module might not support canyon_basin type:

```javascript
// In terrain module generate() method:
generate(config) {
    console.log('Terrain config:', config);
    
    if (config.type === 'canyon_basin') {
        this.generateCanyonBasin(config);
    } else {
        // FALLBACK
        this.createSimpleGround();
    }
}

createSimpleGround() {
    const geo = new THREE.PlaneGeometry(200, 200);
    const mat = new THREE.MeshStandardMaterial({ color: 0x3d4f3a });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.game.scene.add(ground);
    console.log('✅ Simple ground created');
}
```

### Fix 2: Player Underground
Check createPlayer():

```javascript
createPlayer(x, z) {
    // ... create player ...
    this.player.position.set(x, 10, z); // Force Y=10
    console.log('Player spawned at:', this.player.position);
}
```

### Fix 3: No Lighting
Add to constructor:

```javascript
_setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambient);
    
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    this.scene.add(sun);
    
    console.log('💡 Lighting setup');
}
```

## Debug Overlay Controls

- **Press `** (backtick) - Toggle overlay on/off
- **FPS** - Should be ~60
- **Scene Objects** - Should be 10+
- **Lights** - Should be 2+
- **Player Exists** - Should be ✅
- **Modules** - All should be ✅ or ✅🔄

## Next Steps

Once you see the debug overlay and initialization passes:

1. Check what's showing as ❌
2. Read the recommendations
3. Run console commands to inspect
4. Use emergency test if needed
5. Check BLACK_SCREEN_DEBUG.md for detailed fixes

Good luck! The debug overlay will tell you exactly what's wrong! 🎮
