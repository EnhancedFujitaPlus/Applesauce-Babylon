# 🔍 BLACK SCREEN DEBUGGING GUIDE

## Quick Diagnosis (5 Minutes)

### Step 1: Add Debug Overlay
Open your `Level_20.html` and modify the initialization:

```javascript
import { ApplesauceCore } from './engine/core/applesauce-core-33.js';
import { ApplesauceDebug } from './engine/debug/applesauce-debug.js'; // ADD THIS
import { Level20Config } from './levels/level20-config.js';

async function initGame() {
    const game = new ApplesauceCore({ /* config */ });
    
    // ADD THIS - Make debug overlay
    game.debug = new ApplesauceDebug(game);
    window.game = game; // Expose for console access
    
    await game.loadLevel(Level20Config);
    game.start();
}
```

### Step 2: Check the Overlay
After refreshing, you'll see a green debug panel. Check these key indicators:

```
✅ GOOD         ❌ BAD
─────────────────────────────────────
FPS: 60         FPS: 0 (not rendering)
Scene: 15+      Scene: 0-3 (nothing created)
Lights: 2+      Lights: 0 (too dark)
Player: ✅      Player: ❌ (no player)
terrain: ✅🔄    terrain: ❌ (no terrain)
```

### Step 3: Run Console Commands
Open browser console (F12) and run:

```javascript
// Check scene contents
debugApplesauce.scene()

// Check module loading
debugApplesauce.modules()

// Check camera position
debugApplesauce.camera()

// Check game state
debugApplesauce.state()
```

---

## Common Black Screen Causes

### 🎥 CAUSE 1: Camera Problems (Most Common!)

**Symptoms:**
- Black screen
- FPS counter shows 60
- Scene has objects

**Diagnosis:**
```javascript
debugApplesauce.camera()
```

**Common Issues:**
- Camera inside terrain (Y position is negative)
- Camera looking wrong direction
- Camera too far from scene
- Camera near/far planes wrong

**Fix Options:**

**Option A - Quick Test Camera Position:**
Add this to your core's `createPlayer` method (around line 400):

```javascript
createPlayer(x, z) {
    // ... existing player creation ...
    
    // TEMP: Force camera to known good position
    this.camera.position.set(0, 50, 100);
    this.camera.lookAt(0, 0, 0);
    console.log('🎥 Camera forced to test position');
}
```

**Option B - Check Player Height:**
The player might be spawning underground! Add logging:

```javascript
createPlayer(x, z) {
    console.log('Creating player at:', x, z);
    
    // ... player creation ...
    
    console.log('Player position:', this.player.position);
    console.log('Player Y:', this.player.position.y);
    
    if (this.player.position.y < -10) {
        console.error('❌ PLAYER UNDERGROUND!');
    }
}
```

---

### 💡 CAUSE 2: No Lighting

**Symptoms:**
- Debug shows "Lights: 0"
- Everything is black

**Diagnosis:**
Check your `_setupLighting()` method exists and is being called.

**Fix:**
Add this method to your core if missing:

```javascript
_setupLighting() {
    // Ambient light (general illumination)
    const ambientLight = new THREE.AmbientLight(0x606060, 1.0);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    this.scene.add(dirLight);
    
    console.log('💡 Lighting setup complete');
}
```

---

### 🏔️ CAUSE 3: No Terrain Created

**Symptoms:**
- Debug shows "terrain: ❌" or "Scene: 3" (only camera + lights)
- Module shows loaded but no geometry

**Diagnosis:**
```javascript
debugApplesauce.scene()
// Look for terrain-related objects
```

**Fix:**
The terrain module might not implement `canyon_basin` type!

Add this temporary simple terrain:

```javascript
// In your terrain module's generate() method
generate(config) {
    console.log('🏔️ Terrain generate called with:', config);
    
    if (config.type === 'canyon_basin') {
        this.generateCanyonBasin(config);
    } else {
        // FALLBACK: Simple ground plane
        console.log('⚠️ Unknown terrain type, creating simple ground');
        this.createSimpleGround();
    }
}

createSimpleGround() {
    const groundGeo = new THREE.PlaneGeometry(500, 500, 10, 10);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x3d4f3a,
        roughness: 0.9
    });
    
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'simple_ground';
    
    this.game.scene.add(ground);
    console.log('✅ Simple ground created');
}
```

---

### 🎮 CAUSE 4: Player/Deck Not Created

**Symptoms:**
- Debug shows "Player: ❌"
- No skateboard model

**Diagnosis:**
```javascript
console.log('Player:', game.player);
console.log('Deck:', game.deck);
```

**Fix:**
Check your `createPlayer()` method is being called:

```javascript
createPlayer(x, z) {
    console.log('🛹 createPlayer called!', x, z);
    
    // Player body
    const playerGeo = new THREE.SphereGeometry(1);
    const playerMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.player = new THREE.Mesh(playerGeo, playerMat);
    this.player.position.set(x, 5, z); // Start 5 units up
    this.player.castShadow = true;
    this.scene.add(this.player);
    
    // Deck
    const deckGeo = new THREE.BoxGeometry(2, 0.2, 6);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    this.deck = new THREE.Mesh(deckGeo, deckMat);
    this.deck.position.y = -1;
    this.player.add(this.deck);
    
    console.log('✅ Player created at:', this.player.position);
}
```

---

### 🎨 CAUSE 5: Renderer Not Working

**Symptoms:**
- FPS shows 0
- Everything else looks OK

**Diagnosis:**
```javascript
console.log('Renderer:', game.renderer);
console.log('Rendering:', game.isRunning);
```

**Fix:**
Check your render loop in `start()`:

```javascript
start() {
    if (this.isRunning) {
        console.log('⚠️ Already running!');
        return;
    }
    
    this.isRunning = true;
    
    const animate = () => {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame(animate);
        
        // UPDATE
        this.update();
        
        // RENDER
        this.renderer.render(this.scene, this.camera);
    };
    
    animate();
    console.log('🛹 Game loop started!');
}
```

---

## Step-by-Step Debugging Process

### Phase 1: Verify Basics (2 min)
1. ✅ Open console - any errors?
2. ✅ Check debug overlay appears
3. ✅ Check FPS > 0
4. ✅ Check Scene objects > 5

### Phase 2: Check Rendering (3 min)
5. ✅ Run `debugApplesauce.scene()` - see objects?
6. ✅ Run `debugApplesauce.camera()` - position reasonable?
7. ✅ Run `debugApplesauce.modules()` - all ✅?

### Phase 3: Module Check (5 min)
8. ✅ terrain module loaded and has update?
9. ✅ Player exists in scene?
10. ✅ Lights exist (count >= 2)?

### Phase 4: Force Visibility (10 min)
11. ✅ Add temporary bright ambient light:
```javascript
const testLight = new THREE.AmbientLight(0xffffff, 3.0);
this.scene.add(testLight);
```

12. ✅ Add test cube at origin:
```javascript
const testGeo = new THREE.BoxGeometry(10, 10, 10);
const testMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const testCube = new THREE.Mesh(testGeo, testMat);
this.scene.add(testCube);
console.log('🎲 Test cube added at origin');
```

13. ✅ Force camera to see test cube:
```javascript
this.camera.position.set(0, 20, 50);
this.camera.lookAt(0, 0, 0);
```

If you can see the RED CUBE → Camera/lighting issue
If you still can't see anything → Renderer issue

---

## Emergency "Get Something Visible" Code

Add this to your core's `loadLevel()` method at the very end:

```javascript
async loadLevel(levelConfig) {
    // ... all your existing code ...
    
    // EMERGENCY DEBUG GEOMETRY
    console.log('🚨 Adding emergency debug objects...');
    
    // Super bright light
    const emergencyLight = new THREE.AmbientLight(0xffffff, 5.0);
    this.scene.add(emergencyLight);
    
    // Giant red cube at origin
    const cubeGeo = new THREE.BoxGeometry(20, 20, 20);
    const cubeMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        wireframe: true
    });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.name = 'EMERGENCY_DEBUG_CUBE';
    this.scene.add(cube);
    
    // Green floor
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.name = 'EMERGENCY_DEBUG_FLOOR';
    this.scene.add(floor);
    
    // Force camera position
    this.camera.position.set(0, 30, 60);
    this.camera.lookAt(0, 0, 0);
    
    console.log('✅ Emergency debug objects added');
    console.log('You should see: RED WIREFRAME CUBE on GREEN FLOOR');
}
```

If you can see the RED CUBE and GREEN FLOOR → Your rendering works!
Now you know it's a module initialization issue, not a rendering problem.

---

## Console Commands Reference

```javascript
// Scene inspection
debugApplesauce.scene()      // Show all objects in scene
debugApplesauce.modules()    // Show module states
debugApplesauce.camera()     // Show camera info
debugApplesauce.state()      // Show game state

// Direct access (if window.game is set)
game.scene.children          // All scene objects
game.modules                 // All modules
game.player                  // Player object
game.camera.position         // Camera position
```

---

## Expected Good State

When everything works, you should see:

**Debug Overlay:**
```
🛹 APPLESAUCE DEBUG
RENDERING:
FPS: 60
Scene Objects: 15+
Lights: 2 | Meshes: 8+
Renderer: ✅

CAMERA:
Position: (0.0, 50.0, 100.0)
Rotation: (-26.6°, 0.0°, 0.0°)

PLAYER:
Player Exists: ✅
Deck Exists: ✅
Position: (-150.0, 25.0, -170.0)
Speed: 0.00
Grounded: ✅

MODULES:
terrain: ✅🔄
gore: ✅🔄
weather: ✅🔄
enemies: ✅🔄
skater: ✅🔄
...
```

**Visual:**
- Grid and axis helpers visible
- Terrain/ground visible
- Fog effects
- Mist particles floating
- Player/deck model

---

Good luck! Start with the debug overlay and work through the checklist. 90% of black screens are camera or lighting issues! 🎥💡
