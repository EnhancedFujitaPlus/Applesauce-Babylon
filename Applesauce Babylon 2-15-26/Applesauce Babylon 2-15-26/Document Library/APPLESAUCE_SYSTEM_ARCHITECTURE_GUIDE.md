# APPLESAUCE SYSTEM ARCHITECTURE GUIDE
## "Wait, how does this all actually work?" - The Clear Answer

---

## 🎯 THE CORE QUESTION YOU'RE ASKING

**"I have all these files, but how do they actually connect? What does each one DO?"**

Let me break it down in the simplest possible way:

---

## 📦 THE THREE LAYERS

Think of APPLESAUCE like a building:

### 1. THE ENGINE (Bottom Layer - The Foundation)
**File: `applesauce-core.js`**

This is the ORCHESTRATOR. It:
- Sets up Three.js (scene, camera, renderer, lights)
- Runs the game loop (60 times per second)
- Handles player physics (movement, jumping, grinding)
- Loads levels
- Calls all the other modules
- Updates the camera
- Updates the HUD

**What it DOESN'T do:**
- ❌ Create specific obstacles (that's LevelBuilder's job)
- ❌ Define what materials look like (that's Materials' job)
- ❌ Know about specific levels (that's the level files' job)

### 2. THE MODULES (Middle Layer - The Tools)
**Files: `applesauce-materials.js`, `applesauce-level-builder.js`, etc.**

These are TOOLS that the engine uses. Each one has a specific job:

- **`applesauce-materials.js`**: Defines what things LOOK like
  - Concrete is gray and rough
  - Metal is shiny
  - Blood is dark red
  - Wood is brown
  
- **`applesauce-level-builder.js`**: Creates physical OBJECTS
  - Rails
  - Ramps
  - Fences
  - Checkpoints
  - Uses materials from the Materials module

- **`applesauce-enemies.js`**: Handles enemies
  - Spawning
  - AI behavior
  - Taking damage

- **`applesauce-gore.js`**: Gore effects
  - Blood splatter
  - Body parts

(etc for other modules)

### 3. THE LEVELS (Top Layer - The Content)
**Files: `level_01.js`, `level_16.js`, `level_speedrun_example.js`**

These are BLUEPRINTS for specific levels. Each level file:
- Describes the level (name, description, author)
- Sets the scene (background color, fog, terrain)
- Has an `onLevelStart()` function that USES the modules to build the level
- Can have custom update logic

---

## 🔄 THE DATA FLOW (How It All Connects)

Let's trace what happens when you load a level:

```
1. game.html loads
   ↓
2. game.html creates ApplesauceCore
   ↓
3. ApplesauceCore initializes ALL modules
   - Materials module loads
   - LevelBuilder module loads (and connects to Materials)
   - Enemy module loads
   - Gore module loads
   - etc.
   ↓
4. game.html tells core to load a specific level
   ↓
5. ApplesauceCore.loadLevel(level_16) is called
   ↓
6. Core reads level_16's configuration
   ↓
7. Core creates terrain based on level_16.terrain
   ↓
8. Core calls level_16.onLevelStart(core)
   ↓
9. level_16.onLevelStart() uses the LevelBuilder to create obstacles:
   - builder.createRail(-5, 20, 15)
   - builder.createQuarterPipe(10, 50, 0)
   - builder.createCheckpoint(0, 80, 1)
   ↓
10. LevelBuilder uses Materials to make things look right:
    - rail uses materials.getMaterial('metal')
    - ramp uses materials.getMaterial('concrete')
   ↓
11. Everything is now in the scene!
   ↓
12. Core starts the game loop:
    - updatePhysics() moves the player
    - enemies.update() makes enemies move
    - gore.update() animates blood
    - updateCamera() follows player
    - updateHUD() shows score
    - REPEAT 60 times per second
```

---

## 🏗️ WHAT EACH FILE IS RESPONSIBLE FOR

### `applesauce-core.js`
**Responsibility**: The brain. Coordinates everything.

**Contains:**
- Three.js setup
- Game loop
- Player physics (ONLY the core movement/jumping/grinding math)
- Module management
- Level loading system

**Does NOT contain:**
- Specific level content
- Material definitions
- Obstacle creation functions

**Imports:**
```javascript
import { ApplesauceMaterials } from './applesauce-materials.js';
import { ApplesauceLevelBuilder } from './applesauce-level-builder.js';
import { ApplesauceEnemies } from './applesauce-enemies.js';
// etc...
```

**Creates:**
```javascript
this.modules = {
    materials: new ApplesauceMaterials(this),
    levelBuilder: new ApplesauceLevelBuilder(this),
    enemies: new ApplesauceEnemies(this),
    // etc...
};
```

---

### `applesauce-materials.js`
**Responsibility**: Define what things look like.

**Contains:**
```javascript
this.materials = {
    concrete: new THREE.MeshStandardMaterial({ color: 0x808080, ... }),
    metal: new THREE.MeshStandardMaterial({ color: 0x888888, ... }),
    wood: new THREE.MeshStandardMaterial({ color: 0x8B4513, ... }),
    // etc...
};
```

**Provides:**
```javascript
getMaterial(name)          // Returns a material
getRandomGraffitiColor()   // Returns a color
getSpeedMaterial(speed)    // Returns speed-based material
```

**Does NOT contain:**
- Any building functions
- Any obstacle creation
- Any geometry creation

---

### `applesauce-level-builder.js`
**Responsibility**: Create physical objects using materials.

**Contains:**
- `createRail(x, z, length, height)`
- `createQuarterPipe(x, z, rotation, width)`
- `createGrindBox(x, z, width, height, depth)`
- `createCheckpoint(x, z, number)`
- `createSpeedBoost(x, z, direction)`
- etc...

**Uses:**
```javascript
const rail = new THREE.Mesh(
    railGeometry,
    this.materials.getMaterial('metal')  // ← Gets material from Materials module
);
```

**Accessed by:**
```javascript
// In a level's onLevelStart():
const builder = core.modules.levelBuilder;
builder.createRail(0, 50, 20);
```

---

### `level_XX.js` (Level Files)
**Responsibility**: Blueprint for a specific level.

**Structure:**
```javascript
export const level_16 = {
    meta: {
        number: 16,
        name: "VOLCANO VALLEY",
        description: "Skate down an active volcano!"
    },
    
    scene: {
        background: 0xFF4500,
        fog: { color: 0xFF4500, near: 50, far: 300 }
    },
    
    terrain: {
        type: 'hills',
        width: 200,
        length: 400
    },
    
    playerStart: {
        x: 0,
        z: 10
    },
    
    onLevelStart: function(core) {
        // THIS is where you BUILD the level
        const builder = core.modules.levelBuilder;
        
        builder.createRail(-10, 30, 25);
        builder.createQuarterPipe(15, 50, Math.PI / 2, 10);
        builder.createCheckpoint(0, 100, 1);
        
        // Spawn enemies
        if (core.modules.enemies) {
            core.modules.enemies.spawn(20, 50, 'grunt');
        }
    },
    
    onLevelUpdate: function(core) {
        // Optional: Custom per-frame logic for this level
    }
};
```

---

## 🎮 HOW TO BUILD A GAME.HTML

Here's the complete structure:

```html
<!DOCTYPE html>
<html>
<head>
    <title>APPLESAUCE - Game</title>
    <style>
        body { margin: 0; overflow: hidden; background: #000; }
        canvas { display: block; }
        
        /* HUD */
        #hud {
            position: fixed;
            top: 20px;
            left: 20px;
            font-family: 'Courier New', monospace;
            color: #00FFFF;
            text-shadow: 0 0 10px #00FFFF;
            font-size: 18px;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <!-- HUD Elements -->
    <div id="hud">
        <div id="level-name"></div>
        <div id="score"></div>
        <div id="combo"></div>
        <div id="speed"></div>
        <div id="trick"></div>
    </div>

    <script type="module">
        // 1. IMPORT THE ENGINE
        import { ApplesauceCore } from './engine/applesauce-core.js';
        
        // 2. IMPORT THE LEVEL YOU WANT TO LOAD
        import { level_16 } from './levels/level_16.js';
        
        // 3. CREATE THE ENGINE WITH CONFIG
        const game = new ApplesauceCore({
            goreEnabled: true,
            maxSpeed: 1.2,
            enemiesEnabled: true,
            objectivesEnabled: true,
            materialsEnabled: true,      // ← IMPORTANT!
            levelBuilderEnabled: true,   // ← IMPORTANT!
            // etc...
        });
        
        // 4. LOAD THE LEVEL
        await game.loadLevel(level_16);
        
        // 5. START THE GAME
        game.start();
        
        // Make game global for debugging
        window.game = game;
    </script>
</body>
</html>
```

---

## 🚀 SPEEDRUN LEVEL DESIGN TIPS

### Essential Elements for Good Speedruns:

1. **Checkpoints** - Mark progress, allow time splits
   ```javascript
   builder.createCheckpoint(x, z, checkpointNumber);
   ```

2. **Multiple Routes** - Risk vs Reward
   - **Safe Route**: Longer but easier
   - **Shortcut Route**: Shorter but harder (gaps, high rails, precise grinds)

3. **Speed Boosts** - Placed strategically
   ```javascript
   builder.createSpeedBoost(x, z, direction);
   ```

4. **Timer System** - Track times, save best runs
   ```javascript
   // In onLevelStart:
   core.speedrunData = {
       startTime: Date.now(),
       checkpoints: [],
       bestTime: localStorage.getItem('level_best') || null
   };
   
   // In onLevelUpdate:
   const elapsed = (Date.now() - core.speedrunData.startTime) / 1000;
   // Update timer display
   ```

5. **Clear Visual Language**
   - Color code routes (safe = green, shortcut = red)
   - Use materials to show speed zones
   - Arrows to guide optimal paths

### Speedrun Structure Formula:

```
START
  ↓
[Tutorial Section] - Learn mechanics (10-15% of level)
  ↓
[CHECKPOINT 1]
  ↓
[Open Section] - Multiple route choices (30-40%)
  ↓
[CHECKPOINT 2]
  ↓
[Technical Section] - Precision required (20-30%)
  ↓
[CHECKPOINT 3]
  ↓
[Final Sprint] - Speed and style (20-30%)
  ↓
[FINISH]
```

---

## ✅ YOUR ACTION PLAN (Step by Step)

### TODAY:
1. **Clean up your materials.js**
   - Replace your current materials.js with the clean one I provided
   - Remove ALL building functions from it

2. **Add LevelBuilder to core.js**
   ```javascript
   // In applesauce-core.js imports:
   import { ApplesauceLevelBuilder } from './applesauce-level-builder.js';
   
   // In constructor, after materials init:
   if (this.config.levelBuilderEnabled !== false) {
       this.modules.levelBuilder = new ApplesauceLevelBuilder(this);
   }
   ```

3. **Update one existing level**
   - Pick level_16.js or your current working level
   - Rewrite its `onLevelStart()` to use `builder.createXXX()` functions
   - Test it!

### THIS WEEK:
1. **Build your speedrun level**
   - Use `level_speedrun_example.js` as a template
   - Add checkpoints
   - Create main route + shortcut
   - Add timer system

2. **Test and iterate**
   - Play your own level
   - Time yourself
   - Adjust difficulty
   - Add more shortcuts if too easy

### NEXT WEEK:
1. **Create 2-3 more speedrun levels**
2. **Add leaderboard system** (saves to localStorage)
3. **Ghost replays** (record best run, show ghost player)

---

## 🧠 UNDERSTANDING CHECK

**Can you answer these?**

1. Q: Where does the player physics live?
   A: In `applesauce-core.js` in the `updatePhysics()` method

2. Q: Where do I create a rail?
   A: Call `core.modules.levelBuilder.createRail()` in your level's `onLevelStart()`

3. Q: Where do I define what metal looks like?
   A: In `applesauce-materials.js` in the `materials` object

4. Q: How does LevelBuilder know what material to use?
   A: It calls `this.materials.getMaterial('metal')` which gets it from the Materials module

5. Q: When does `onLevelStart()` run?
   A: Once, when `core.loadLevel(myLevel)` is called

6. Q: When does `onLevelUpdate()` run?
   A: Every frame (60 times per second) during the game loop

---

## 🎯 THE KEY INSIGHT

**SEPARATION OF CONCERNS**

Each file has ONE job:
- Core = Coordinate everything
- Materials = Define appearances
- LevelBuilder = Create objects
- Levels = Use the builder to make content

They work together through **dependency injection**:
- Core creates Materials
- Core creates LevelBuilder and gives it Materials
- Levels receive Core (which has builder, which has materials)

```
Core → Materials
  ↓
Core → LevelBuilder → Materials
  ↓
Core → Level → LevelBuilder → Materials
```

---

## 💡 WHEN YOU GET CONFUSED AGAIN

Come back to this simple checklist:

1. **Is it about LOOKS?** → Materials
2. **Is it about BUILDING?** → LevelBuilder
3. **Is it about PHYSICS?** → Core
4. **Is it about SPECIFIC CONTENT?** → Level file

**Still confused?**
- Print this guide
- Draw a diagram
- Build one tiny level from scratch
- Add ONE rail, test it
- Add ONE ramp, test it
- Build up slowly

---

## 🛹 YOU GOT THIS

The structure you have is GOOD. You're not building it wrong - you just needed to see how it all connects.

Now go build that speedrun level! 🏁

---

**Questions to ask yourself when coding:**
- "Which file should this go in?"
- "Does this belong in the engine or in a level?"
- "Am I defining how it looks or how to build it?"

**Remember:** Yes, lots of .js files is normal. Professional games have THOUSANDS. You're doing it right! 💀🛹⚡
