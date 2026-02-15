# APPLESAUCE ARCHITECTURE GUIDE
## Understanding How Everything Connects

---

## 📋 TABLE OF CONTENTS
1. The Big Picture - How It All Fits Together
2. File Structure & Dependencies
3. Initialization Flow - Step by Step
4. Game Loop Explained
5. Level System Architecture
6. Module Loading Strategy
7. Common Issues & Solutions
8. Debugging Tips

---

## 🎯 THE BIG PICTURE - HOW IT ALL FITS TOGETHER

Think of your game like a layered cake:

```
┌─────────────────────────────────────────┐
│  HTML PAGE (applesauce-level25.html)    │  ← Entry point, loads everything
├─────────────────────────────────────────┤
│  LEVEL CONFIG (Level_25.js)             │  ← Defines what's in this level
├─────────────────────────────────────────┤
│  CORE ENGINE (applesauce-core-babylon)  │  ← The game engine itself
├─────────────────────────────────────────┤
│  GAME SYSTEMS (helmet, goons, etc.)     │  ← Specialized gameplay modules
├─────────────────────────────────────────┤
│  BABYLON.JS + HAVOK                     │  ← 3D rendering & physics
└─────────────────────────────────────────┘
```

### What Each Layer Does:

**HTML PAGE** - The container
- Creates the canvas for 3D rendering
- Loads external libraries (Babylon, Havok)
- Imports your game modules
- Starts everything up
- Shows HUD overlay

**LEVEL CONFIG** - The blueprint
- Describes what's in this specific level
- Registers helmets and enemies
- Creates the environment (factory floor, crates, etc.)
- Defines spawn waves
- Handles level-specific update logic

**CORE ENGINE** - The framework
- Sets up Babylon.js and physics
- Creates player and camera
- Handles input (keyboard)
- Runs the main game loop
- Loads and manages levels

**GAME SYSTEMS** - The features
- Helmet combat system
- Visual effects
- Enemy AI (goons)
- Inventory UI
- Each is self-contained and reusable

**BABYLON.JS + HAVOK** - The foundation
- 3D rendering (draws everything on screen)
- Physics simulation (gravity, collisions, forces)
- Provided by CDN, not your code

---

## 📁 FILE STRUCTURE & DEPENDENCIES

Your project should look like this:

```
your-project/
│
├── applesauce-level25.html          ← Main HTML file (START HERE)
├── applesauce-core-babylon.js       ← Core engine
├── Level_25.js                      ← Level configuration
│
├── engine/
│   ├── babylon-helmet-system.js     ← Helmet combat mechanics
│   ├── babylon-helmet-effects.js    ← Visual effects for helmets
│   ├── babylon-helmet-inventory.js  ← Helmet UI/inventory
│   └── babylon-skater-goons.js      ← Enemy AI system
│
└── (optional)
    ├── babylon-terrain.js           ← Advanced terrain generation
    └── babylon-skater.js            ← Advanced player controller
```

### Module Dependencies Map:

```
applesauce-level25.html
    │
    ├──> applesauce-core-babylon.js
    │       └──> babylon-skater.js (optional)
    │       └──> babylon-terrain.js (optional)
    │
    └──> Level_25.js
            ├──> engine/babylon-helmet-system.js
            ├──> engine/babylon-helmet-effects.js
            ├──> engine/babylon-helmet-inventory.js
            └──> engine/babylon-skater-goons.js
```

**CRITICAL**: The Level_25.js file dynamically imports the engine/ modules when the level starts. If they're missing, the level won't load properly.

---

## 🔄 INITIALIZATION FLOW - STEP BY STEP

Here's exactly what happens when you open applesauce-level25.html:

### Phase 1: Page Load (< 1 second)
```
1. Browser loads HTML page
2. Browser parses CSS (styling)
3. Browser creates DOM elements (loading screen, HUD)
4. Browser loads external scripts:
   - babylon.js
   - babylonjs.loaders.min.js
   - HavokPhysics_umd.js
   - Level_25.js
5. Browser loads ES6 modules:
   - applesauce-core-babylon.js (main module)
6. initGame() function is called
```

### Phase 2: Engine Initialization (1-2 seconds)
```
7. Create ApplesauceCore instance
   - Set config (gore enabled, max speed, etc.)
   
8. Call game.init()
   - Create canvas element
   - Initialize Babylon.js engine
   - Create scene
   - Load and initialize Havok physics ⚠️ ASYNC - MUST WAIT
   - Setup camera (FollowCamera)
   - Setup lighting (ambient + directional + shadows)
   - Setup keyboard input handlers
   - Setup window resize handler
```

### Phase 3: Level Loading (2-3 seconds)
```
9. Call game.loadLevel(Level25Config)
   - Clear any existing level
   - Create terrain (factory floor)
   - Create player (skater with physics)
   - Call Level25Config.onLevelStart()
   
10. Inside Level25Config.onLevelStart():
    - Import helmet system modules ⚠️ ASYNC
    - Create helmet system manager
    - Create effects manager
    - Create goons manager
    - Register all helmet types
    - Register all goon types
    - Equip starting helmets
    - Create factory environment
    - Create helmet crates
    - Schedule wave 1 to spawn
```

### Phase 4: Game Start (immediate)
```
11. Hide loading screen
12. Show HUD
13. Call game.start()
    - Starts Babylon render loop
    - Game now updates every frame
14. Start HUD update interval
    - Updates stats 10x per second
```

**Total time from page load to playable: ~3-4 seconds**

---

## 🎮 GAME LOOP EXPLAINED

Once the game starts, this happens EVERY FRAME (~60 times per second):

### The Render Loop (Babylon.js)
```javascript
engine.runRenderLoop(() => {
    game.update();      // Your game logic
    scene.render();     // Babylon draws the frame
});
```

### Inside game.update()
```
1. Check if game is playing (state.isPlaying)
   └─> If paused, skip everything

2. Update player visual position
   └─> playerModule.update()
       - Syncs visual mesh with physics body
       - Applies rotations and animations

3. Handle player input
   └─> updatePlayerControls()
       - W/A/S/D for movement
       - Space for jump
       - E for kickflip
       - Apply forces to physics body

4. Call level's onUpdate()
   └─> Level25Config.onUpdate(core)
       - Update helmet system
       - Update inventory UI
       - Update goons (AI, movement, attacks)
       - Check for helmet throw input
       - Check for crate collection
```

### Visual Update Flow:
```
Player Input → Physics Body → Visual Mesh → Camera → Screen

Example:
Press W → Apply forward force to physics body
        → Physics simulates movement
        → playerModule.update() syncs mesh to body
        → Camera follows mesh
        → Scene renders to canvas
        → You see movement on screen
```

**Key Insight**: Physics drives the gameplay, visuals follow physics.

---

## 🏗️ LEVEL SYSTEM ARCHITECTURE

Levels are just configuration objects with hooks. The core engine doesn't know about helmets or goons - the level adds those features.

### Level Config Structure:
```javascript
window.Level25Config = {
    // METADATA - Shown in UI
    meta: {
        name: "...",
        description: "...",
        difficulty: "..."
    },
    
    // TERRAIN - How the core should build the ground
    terrain: {
        type: 'factory',
        size: 150
    },
    
    // PLAYER START - Where to spawn player
    playerStart: { x: 0, y: 5, z: 0 },
    
    // HOOKS - Functions the core calls
    async onLevelStart(core) {
        // Called once when level loads
        // Setup level-specific systems here
    },
    
    onUpdate(core) {
        // Called every frame
        // Update level-specific logic here
    }
};
```

### The Hook System:

**onLevelStart(core)** - Setup phase
- Import modules
- Create managers
- Register types
- Build environment
- Spawn initial objects
- Gets called once

**onUpdate(core)** - Runtime phase
- Update systems
- Handle input
- Check conditions
- Spawn waves
- Gets called every frame

**core parameter** - Your access to everything:
```javascript
core.scene          // Babylon scene
core.player         // Player object
core.camera         // Camera
core.havokPlugin    // Physics engine
core.keys           // Keyboard state
core.state          // Game state (score, speed, etc.)
// Plus any custom properties you add in onLevelStart
```

---

## 📦 MODULE LOADING STRATEGY

Understanding the two ways modules are loaded:

### Method 1: Static Import (in HTML)
```html
<script type="module">
    import { ApplesauceCore } from './applesauce-core-babylon.js';
</script>
```
- Loads when page loads
- Available immediately
- Used for core engine

### Method 2: Dynamic Import (in level)
```javascript
const { BabylonHelmetSystem } = await import('./engine/babylon-helmet-system.js');
```
- Loads when needed
- Must await (it's async)
- Used for level-specific systems
- Allows levels to load different modules

### Why Dynamic?

Levels can have different features:
- Level 25 uses helmets and goons
- Level 10 might use cars and ramps
- Level 30 might use magic spells and portals

By dynamically importing, each level only loads what it needs.

---

## ⚠️ COMMON ISSUES & SOLUTIONS

### Issue 1: "Cannot find module" error
```
ERROR: Failed to load module './engine/babylon-helmet-system.js'
```

**Solution**: 
- Check file exists at exact path
- Check spelling/capitalization
- Make sure path is relative to HTML file
- Verify file is a proper ES6 module (has export)

### Issue 2: Physics not working
```
Player falls through ground, or nothing moves
```

**Solution**:
- Check Havok loaded: `console.log(typeof HavokPhysics)`
- Check physics initialized: `console.log(game.havokPlugin)`
- Check objects have PhysicsAggregate
- Make sure ground has mass: 0 (static)
- Make sure player has mass > 0 (dynamic)

### Issue 3: Player controls not working
```
Pressing keys does nothing
```

**Solution**:
- Check input setup: `console.log(game.keys)`
- Press a key and check: `console.log(game.keys['w'])`
- Make sure game.state.isPlaying === true
- Make sure playerModule exists
- Check browser console for errors

### Issue 4: Black screen, no 3D scene
```
Loading screen disappears but nothing renders
```

**Solution**:
- Check canvas created: `document.getElementById('renderCanvas')`
- Check engine created: `console.log(game.engine)`
- Check scene created: `console.log(game.scene)`
- Check render loop started: game.start() was called
- Open browser DevTools → Console for errors

### Issue 5: Helmets don't register
```
Cannot throw helmets, slots are empty
```

**Solution**:
- Check helmet system created in onLevelStart
- Check helmets registered before equipping
- Check slot numbers: 0-5 (not 1-6)
- Verify in console: `game.helmetSystem.registeredHelmets`

---

## 🔍 DEBUGGING TIPS

### Console Commands

Open browser DevTools (F12), try these:

```javascript
// Check what's loaded
console.log(window.game);              // The game instance
console.log(game.scene.meshes);        // All 3D objects
console.log(game.keys);                // Current key states
console.log(game.helmetSystem);        // Helmet combat system

// Check player state
console.log(game.player);              // Player object
console.log(game.state.speed);         // Current speed
console.log(game.playerModule);        // Player controller

// Manually trigger events
game.helmetSystem.attack([]);          // Throw helmet
game.spawnWave1(game);                 // Spawn enemies

// Pause/resume
game.pause();
game.resume();

// Inspect specific objects
const crates = game.scene.meshes.filter(m => m.name === 'helmetCrate');
console.log(crates);
```

### Visual Debugging

Add this to see physics bodies:
```javascript
// In browser console after game loads
game.scene.enableDebugLayer();
```

### Performance Monitoring

Check FPS:
```javascript
setInterval(() => {
    console.log('FPS:', game.engine.getFps());
}, 1000);
```

---

## 🎓 KEY CONCEPTS SUMMARY

1. **HTML loads everything** - It's the entry point
2. **Core engine is generic** - Works for any level
3. **Levels add features** - Via hooks and dynamic imports
4. **Physics drives gameplay** - Forces move objects
5. **Visuals follow physics** - Meshes sync to bodies
6. **Update loop is key** - Where everything happens
7. **Modules are independent** - Can mix and match

---

## 🚀 NEXT STEPS

Now that you understand the architecture:

1. **Get it running** - Open applesauce-level25.html in browser
2. **Watch the console** - See the initialization steps
3. **Try the controls** - W/A/S/D, Space, J
4. **Experiment** - Modify Level_25.js, see changes
5. **Create Level 26** - Copy Level_25.js, change it up
6. **Build new systems** - Add powerups, vehicles, whatever!

Remember: The core engine stays the same, levels define the experience.

Happy coding! 🎮🛹

---

Questions? Check the console. Still stuck? Look for ERROR messages and trace them back through this guide.
