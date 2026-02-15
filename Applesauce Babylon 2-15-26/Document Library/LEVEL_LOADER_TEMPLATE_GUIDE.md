# UNIVERSAL LEVEL LOADER TEMPLATE
## How to Create HTML Files for Any APPLESAUCE Level

---

## 🎯 YES, EVERY LEVEL HTML IS VERY SIMILAR!

The HTML structure is **almost identical** for all levels. You only change a few key things:

1. **Level number and name** (in titles and HUD)
2. **Level config import** (`level_23.js` vs `Level_25.js`)
3. **Level-specific modules** (gore, helmets, etc.)
4. **Custom HUD elements** (objectives, boss health, etc.)

**Everything else stays the same!** The core engine, Babylon.js, Havok, and initialization flow are universal.

---

## 📋 UNIVERSAL TEMPLATE

Save this as a starting point for any new level:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- ⚙️ CHANGE THIS: Level name in browser tab -->
    <title>APPLESAUCE - Level XX: YOUR LEVEL NAME</title>
    
    <style>
        /* ============================================
           UNIVERSAL STYLING (SAME FOR ALL LEVELS)
           ============================================ */
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            font-family: 'Courier New', monospace;
            background: #000;
        }
        
        #renderCanvas {
            width: 100%;
            height: 100%;
            display: block;
            touch-action: none;
        }
        
        #hud {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
            color: #fff;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        
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
            z-index: 200;
            color: #fff;
        }
        
        /* ⚙️ ADD CUSTOM STYLES HERE FOR YOUR LEVEL
           Examples: special HUD elements, boss health bars, etc. */
    </style>
</head>
<body>
    <!-- ============================================
         LOADING SCREEN
         ============================================ -->
    <div id="loading">
        <h1>🍎 APPLESAUCE</h1>
        
        <!-- ⚙️ CHANGE THIS: Your level name -->
        <h2>LEVEL XX - YOUR LEVEL NAME</h2>
        
        <p id="loadStatus">Initializing physics engine...</p>
    </div>
    
    <!-- ============================================
         HUD OVERLAY
         ============================================ -->
    <div id="hud" style="display: none;">
        <!-- ⚙️ CHANGE THIS: Your level title in HUD -->
        <div id="levelTitle">YOUR LEVEL NAME</div>
        
        <!-- ⚙️ ADD LEVEL-SPECIFIC HUD ELEMENTS HERE
           Examples:
           - Objectives display
           - Boss health bar
           - Collectibles counter
           - Time remaining
           - Helmet slots
           - etc.
        -->
        
        <!-- Standard stats (usually same for all levels) -->
        <div id="stats">
            <div>SPEED: <span id="speedDisplay">0</span> mph</div>
            <div>SCORE: <span id="scoreDisplay">0</span></div>
            <div>COMBO: <span id="comboDisplay">0</span>x</div>
        </div>
        
        <!-- Controls guide (customize based on level features) -->
        <div id="controls">
            <div><strong>MOVEMENT:</strong></div>
            <div>W/↑ - Forward | S/↓ - Backward</div>
            <div>A/← - Turn Left | D/→ - Turn Right</div>
            <div><strong>ACTIONS:</strong></div>
            <div>SPACE - Jump | E - Kickflip</div>
            <!-- ⚙️ Add level-specific controls here -->
        </div>
    </div>
    
    <!-- ============================================
         EXTERNAL LIBRARIES (SAME FOR ALL LEVELS)
         ============================================ -->
    <script src="https://cdn.babylonjs.com/babylon.js"></script>
    <script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
    <script src="https://cdn.babylonjs.com/havok/HavokPhysics_umd.js"></script>
    
    <!-- ============================================
         MAIN GAME INITIALIZATION
         ============================================ -->
    <script type="module">
        // UNIVERSAL IMPORTS (same for all levels)
        import { ApplesauceCore } from './applesauce-core-babylon.js';
        
        let game = null;
        
        // UNIVERSAL HUD UPDATE (customize for your level's stats)
        function updateHUD() {
            if (!game || !game.state) return;
            
            // Standard stats
            document.getElementById('speedDisplay').textContent = Math.round(game.state.speed);
            document.getElementById('scoreDisplay').textContent = game.state.score;
            document.getElementById('comboDisplay').textContent = game.state.combo;
            
            // ⚙️ ADD YOUR LEVEL-SPECIFIC HUD UPDATES HERE
            // Examples:
            // - Update objectives
            // - Update boss health
            // - Update collectibles
            // - Update timer
        }
        
        // UNIVERSAL INITIALIZATION (mostly same for all levels)
        async function initGame() {
            try {
                const loadStatus = document.getElementById('loadStatus');
                
                // Create core engine
                loadStatus.textContent = 'Creating game engine...';
                game = new ApplesauceCore({
                    goreEnabled: true,     // ⚙️ Set based on your level
                    maxSpeed: 50,          // ⚙️ Adjust for your level
                });
                
                // Initialize Babylon + Havok
                loadStatus.textContent = 'Initializing physics...';
                await game.init();
                
                // ⚙️ LOAD LEVEL-SPECIFIC MODULES HERE
                // Examples:
                // - Gore system: const { BabylonGorePhysics } = await import('./engine/babylon-gore-physics.js');
                // - Helmet system: const { BabylonHelmetSystem } = await import('./engine/babylon-helmet-system.js');
                // - Custom systems: await import('./engine/your-system.js');
                
                // Load level config
                loadStatus.textContent = 'Loading level...';
                
                // ⚙️ CHANGE THIS: Your level config name
                await game.loadLevel(window.LevelXXConfig);
                
                // Show HUD and start
                document.getElementById('loading').style.display = 'none';
                document.getElementById('hud').style.display = 'block';
                game.start();
                
                // Start HUD updates
                setInterval(updateHUD, 100);
                
                console.log('✅ Game ready!');
                window.game = game;
                
            } catch (error) {
                console.error('❌ Failed to initialize:', error);
                document.getElementById('loadStatus').textContent = 'ERROR: ' + error.message;
            }
        }
        
        // Start when page loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initGame);
        } else {
            initGame();
        }
    </script>
    
    <!-- ⚙️ CHANGE THIS: Your level config file -->
    <script src="level_XX.js"></script>
</body>
</html>
```

---

## 🔧 CUSTOMIZATION GUIDE: WHAT TO CHANGE FOR YOUR LEVEL

### 1. **Titles and Names**

Find and replace all instances of:
- `Level XX` → Your level number
- `YOUR LEVEL NAME` → Your actual level name
- `LevelXXConfig` → Your actual config object name

**Example for Level 30:**
```html
<title>APPLESAUCE - Level 30: Cyber City</title>
<h2>LEVEL 30 - CYBER CITY</h2>
await game.loadLevel(window.Level30Config);
<script src="level_30.js"></script>
```

---

### 2. **Level-Specific Modules**

Add module imports based on what your level uses:

**Gore System (ragdolls, dismemberment):**
```javascript
loadStatus.textContent = 'Loading gore system...';
const { BabylonGorePhysics } = await import('./engine/babylon-gore-physics.js');
game.gore = new BabylonGorePhysics(game.scene, game.havokPlugin);
```

**Helmet Combat System:**
```javascript
loadStatus.textContent = 'Loading combat system...';
const { BabylonHelmetSystem } = await import('./engine/babylon-helmet-system.js');
// Level's onLevelStart will handle the rest
```

**Custom Vehicle System:**
```javascript
loadStatus.textContent = 'Loading vehicle system...';
const { VehicleSystem } = await import('./engine/vehicle-system.js');
game.vehicles = new VehicleSystem(game.scene, game.havokPlugin);
```

**Multiple Systems:**
```javascript
loadStatus.textContent = 'Loading level systems...';
const { BabylonGorePhysics } = await import('./engine/babylon-gore-physics.js');
const { WeaponSystem } = await import('./engine/weapon-system.js');
const { PowerupManager } = await import('./engine/powerup-manager.js');

game.gore = new BabylonGorePhysics(game.scene, game.havokPlugin);
game.weapons = new WeaponSystem(game.scene);
game.powerups = new PowerupManager(game.scene);
```

---

### 3. **Custom HUD Elements**

Add level-specific UI based on features:

**Objectives Display:**
```html
<div id="objectives">
    <h3>📋 OBJECTIVES</h3>
    <div class="objective incomplete" id="obj1">
        🎯 Collect 10 pizzas: <span id="pizzaCount">0</span>/10
    </div>
    <div class="objective incomplete" id="obj2">
        💥 Destroy 5 cars: <span id="carCount">0</span>/5
    </div>
</div>
```

**Boss Health Bar:**
```html
<div id="bossHealth" style="display: none;">
    <div class="boss-name">👹 MEGA BOSS</div>
    <div class="health-bar">
        <div class="health-fill" id="bossHealthFill" style="width: 100%;"></div>
    </div>
</div>
```

**Timer:**
```html
<div id="timer">
    ⏱️ Time: <span id="timeDisplay">0:00</span>
</div>
```

**Collectibles:**
```html
<div id="collectibles">
    🪙 Coins: <span id="coinCount">0</span>/50
    ⭐ Stars: <span id="starCount">0</span>/3
</div>
```

---

### 4. **HUD Update Function**

Customize `updateHUD()` to update your level's UI:

**Example: Objectives**
```javascript
function updateHUD() {
    // Standard stats
    document.getElementById('speedDisplay').textContent = Math.round(game.state.speed);
    document.getElementById('scoreDisplay').textContent = game.state.score;
    
    // Objectives
    const pizzaCount = document.getElementById('pizzaCount');
    if (pizzaCount) {
        pizzaCount.textContent = game.state.pizzas || 0;
        
        // Mark complete if target reached
        if (game.state.pizzas >= 10) {
            document.getElementById('obj1').classList.add('complete');
        }
    }
}
```

**Example: Boss Health**
```javascript
function updateHUD() {
    // ... standard updates ...
    
    // Boss health
    if (game.bossEntity && game.bossEntity.metadata) {
        const bossHealth = document.getElementById('bossHealth');
        const healthFill = document.getElementById('bossHealthFill');
        
        if (bossHealth && healthFill) {
            bossHealth.style.display = 'block';
            const healthPercent = (game.bossEntity.metadata.health / 100) * 100;
            healthFill.style.width = healthPercent + '%';
        }
    }
}
```

---

## 🎮 COMMON LEVEL TYPES & THEIR REQUIREMENTS

### **Type 1: Gore/Combat Level** (Like Level 23)
**Requires:**
- `babylon-gore-physics.js`
- Objectives display
- Roadkill/kill counter

**Example:** Paradeli Park

---

### **Type 2: Helmet Combat Level** (Like Level 25)
**Requires:**
- `babylon-helmet-system.js`
- `babylon-helmet-effects.js`
- `babylon-helmet-inventory.js`
- `babylon-skater-goons.js`
- Helmet HUD
- Enemy counter

**Example:** Helmet Factory

---

### **Type 3: Racing/Speed Level**
**Requires:**
- Timer display
- Checkpoint counter
- Speed boost indicators

**Example:** Downtown Dash

---

### **Type 4: Collection Level**
**Requires:**
- Collectibles counter
- Optional timer
- Completion percentage

**Example:** Pizza Delivery

---

### **Type 5: Boss Battle Level**
**Requires:**
- Boss health bar
- Phase indicators
- Attack warnings

**Example:** Final Showdown

---

## 📝 QUICK CHECKLIST FOR NEW LEVEL HTML

When creating HTML for a new level:

- [ ] Copy the universal template
- [ ] Update all titles (browser tab, loading screen, HUD)
- [ ] Change level config import (`level_XX.js`)
- [ ] Add required module imports in `initGame()`
- [ ] Add level-specific HUD elements
- [ ] Customize `updateHUD()` function
- [ ] Add level-specific CSS if needed
- [ ] Update controls guide for level's features
- [ ] Test that it loads without errors

---

## 🔍 FILE NAMING CONVENTIONS

**Recommendation:** Keep it consistent!

```
applesauce-level23.html    ← HTML loader
level_23.js                ← Level config
```

Or use your own pattern:
```
level-23-loader.html
Level_23.js
```

Just stay consistent across your project!

---

## 💡 PRO TIPS

### 1. **Create a Base Template**
Save the universal template as `_level-template.html` and copy it each time you make a new level.

### 2. **Use Comments**
Mark sections with `⚙️ CHANGE THIS:` so you remember what to customize.

### 3. **Test with Fallbacks**
The core engine has fallbacks, so levels work even without advanced modules. Test both ways!

### 4. **Modular Modules**
Keep level-specific systems in separate files so you can mix and match:
```javascript
// Level 30 uses gore + vehicles
import { BabylonGorePhysics } from './engine/babylon-gore-physics.js';
import { VehicleSystem } from './engine/vehicle-system.js';

// Level 31 uses helmets + powerups
import { BabylonHelmetSystem } from './engine/babylon-helmet-system.js';
import { PowerupManager } from './engine/powerup-manager.js';
```

### 5. **Debug in Console**
All HTML files expose `window.game`, so you can debug any level:
```javascript
console.log(window.game);
console.log(window.game.gore);
console.log(window.game.state);
```

---

## 🎯 COMMON MISTAKES TO AVOID

❌ **Forgetting to change level config name**
```javascript
// Wrong - still loading Level23Config for Level 30!
await game.loadLevel(window.Level23Config);

// Right
await game.loadLevel(window.Level30Config);
```

❌ **Not importing required modules**
```javascript
// Level uses gore but forgot to import it
// Level will crash when trying to spawn enemies!
```

❌ **Mismatched script src**
```html
<!-- Wrong - file is level_30.js but loading level_23.js -->
<script src="level_23.js"></script>

<!-- Right -->
<script src="level_30.js"></script>
```

❌ **HUD updates referencing non-existent elements**
```javascript
// Element doesn't exist in HTML
document.getElementById('bossHealth').textContent = ...;
// Error: Cannot read property 'textContent' of null
```

---

## ✅ SUMMARY

**YES** - Every level HTML is very similar!

**SAME FOR ALL LEVELS:**
- Basic HTML structure
- External library imports (Babylon, Havok)
- Core engine initialization
- Start/resume/pause logic
- Canvas setup

**DIFFERENT FOR EACH LEVEL:**
- Level name/number
- Level config import
- Required modules
- HUD elements
- Custom stats/objectives

**WORKFLOW:**
1. Copy universal template
2. Find/replace level name
3. Add required modules
4. Customize HUD
5. Test!

That's it! 🎮

---

Happy level building! 🍎🛹
