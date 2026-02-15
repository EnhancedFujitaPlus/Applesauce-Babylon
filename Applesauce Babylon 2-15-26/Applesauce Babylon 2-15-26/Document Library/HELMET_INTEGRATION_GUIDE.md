# 🪖 HELMET LOADER INTEGRATION GUIDE
# For APPLESAUCE Game Engine

## QUICK START

### 1️⃣ ADD HELMET LOADER TO YOUR HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>APPLESAUCE</title>
</head>
<body>
    <!-- Load Three.js first -->
    <script type="importmap">
    {
        "imports": {
            "three": "./three.module.js"
        }
    }
    </script>
    
    <!-- Load helmet loader BEFORE your level configs -->
    <script src="helmet_loader.js"></script>
    
    <!-- Load your level configs -->
    <script src="level_16.js"></script>
    
    <!-- Load game engine -->
    <script type="module" src="applesauce-core-r182-FINAL.js"></script>
    
    <!-- Initialize game -->
    <script type="module">
        import { ApplesauceCore } from './applesauce-core-r182-FINAL.js';
        
        const game = new ApplesauceCore({
            goreEnabled: true,
            dialogueEnabled: true,
            enemiesEnabled: true
        });
        
        // Load level
        game.loadLevel(window.Level16Config);
        game.start();
    </script>
</body>
</html>
```

---

## INTEGRATION METHOD 1: IN LEVEL CONFIG (RECOMMENDED)
**Best for:** Simple integration, level-specific helmets

Add helmet loading directly to your level's `onLevelStart`:

```javascript
onLevelStart: function(game) {
    console.log('🎮 LEVEL START');
    
    // ✅ Load helmet after player is created
    if (typeof HelmetLoader !== 'undefined' && game.player) {
        game.modules.helmet = new HelmetLoader(game.scene, game.player);
        game.modules.helmet.loadHelmet();
        console.log('✅ Helmet loaded!');
    }
    
    // Rest of your level init...
}
```

---

## INTEGRATION METHOD 2: AS A GAME MODULE
**Best for:** Persistent helmets across all levels, advanced features

### Step 1: Modify ApplesauceCore constructor

Add helmet module initialization:

```javascript
// In applesauce-core-r182-FINAL.js
constructor(config = {}) {
    // ... existing code ...
    
    // Module hooks
    this.modules = {
        gore: null,
        dialogue: null,
        enemies: null,
        objectives: null,
        terrain: null,
        weather: null,
        helmet: null  // ⭐ ADD THIS
    };
    
    // ... existing module initialization ...
}
```

### Step 2: Add helmet initialization in loadLevel()

```javascript
// In loadLevel() method, after createPlayer():
async loadLevel(levelConfig) {
    // ... existing code ...
    
    // Create player
    this.createPlayer(
        levelConfig.playerStart?.x || 0,
        levelConfig.playerStart?.z || 10
    );
    
    // ⭐ Initialize helmet module
    if (typeof HelmetLoader !== 'undefined' && this.player) {
        if (!this.modules.helmet) {
            this.modules.helmet = new HelmetLoader(this.scene, this.player);
        } else {
            // Update reference to new player
            this.modules.helmet.playerObject = this.player;
            this.modules.helmet.remove(); // Remove old helmet
        }
        this.modules.helmet.loadHelmet();
        console.log('✅ Helmet loaded');
    }
    
    // ... rest of level loading ...
}
```

### Step 3: Add helmet controls to _setupControls()

```javascript
_setupControls() {
    document.addEventListener('keydown', (e) => {
        this.keys[e.key.toLowerCase()] = true;
        
        // ... existing controls ...
        
        // ⭐ H key to switch helmets
        if (e.key.toLowerCase() === 'h' && this.modules.helmet) {
            const currentSlot = this.modules.helmet.activeSlot;
            const nextSlot = (currentSlot % 9) + 1;
            this.modules.helmet.changeHelmet(nextSlot);
            console.log(`🪖 Switched to helmet slot ${nextSlot}`);
        }
    });
    
    // ... rest of controls ...
}
```

### Step 4: Clear helmet in clearLevel()

```javascript
clearLevel() {
    // ... existing clear code ...
    
    // ⭐ Clear helmet
    if (this.modules.helmet) {
        this.modules.helmet.remove();
    }
    
    // ... rest of clear code ...
}
```

---

## KEYBOARD CONTROLS

Once integrated, add these controls:

- **H** - Switch helmet (cycles through slots 1-9)
- **Shift+1-9** - Jump directly to helmet slot

### Optional: Add number key switching

```javascript
// In your keydown handler
if (e.key >= '1' && e.key <= '9' && e.shiftKey && this.modules.helmet) {
    const slotNum = parseInt(e.key);
    this.modules.helmet.changeHelmet(slotNum);
    console.log(`🪖 Switched to helmet slot ${slotNum}`);
}
```

---

## HELMET DATA STRUCTURE

Helmets are stored in localStorage with this structure:

```javascript
{
    name: "My Cool Helmet",
    colors: {
        shell: "#FF0000",    // Main helmet color
        visor: "#000000",    // Visor color
        accent: "#FFD700"    // Accent stripe
    },
    material: "chrome",      // standard, glossy, metallic, chrome, rough
    decal: {
        image: "path/to/image.png",
        scale: 1,
        rotation: 0,
        opacity: 100
    },
    elements: ["spikes", "wings"],  // Array of 3D elements
    elementScale: 1.5
}
```

### Available 3D Elements:
- `spikes` - Ring of spikes around helmet
- `mohawk` - Mohawk down center
- `horns` - Devil horns on sides
- `wings` - Side wings
- `chains` - Hanging chains
- `flames` - Flame decals
- `concave` - Top cylinder
- `vents` - Side vents
- `antennae` - Top antenna with red tip

---

## TESTING YOUR INTEGRATION

### Quick Test Script

Add this to your HTML after game initialization:

```javascript
// Test helmet system
if (game.modules.helmet) {
    console.log('🪖 Helmet System Active');
    console.log('Available helmets:', game.modules.helmet.getAvailableHelmets());
    
    // Create test helmet
    const testHelmet = {
        name: "Test Helmet",
        colors: { shell: "#00FF00", visor: "#000000", accent: "#FFD700" },
        material: "metallic",
        elements: ["spikes"],
        elementScale: 1
    };
    
    localStorage.setItem('helmet_slot_1', JSON.stringify(testHelmet));
    game.modules.helmet.loadHelmet();
}
```

---

## COMMON ISSUES & FIXES

### ❌ Helmet doesn't appear
**Fix:** Make sure helmet is initialized AFTER player creation:
```javascript
// ✅ CORRECT
this.createPlayer(0, 10);
this.modules.helmet = new HelmetLoader(this.scene, this.player);

// ❌ WRONG
this.modules.helmet = new HelmetLoader(this.scene, this.player);
this.createPlayer(0, 10); // Player doesn't exist yet!
```

### ❌ Helmet floats away from player
**Fix:** The helmet should attach as a child of player (already handled in HelmetLoader)

### ❌ Helmet doesn't persist between levels
**Fix:** Use Integration Method 2 and update playerObject reference in loadLevel()

### ❌ Console shows "HelmetLoader not defined"
**Fix:** Load helmet_loader.js BEFORE your game initialization

---

## PERFORMANCE TIPS

1. **Helmet complexity:** Keep element count reasonable (max 3-4 elements)
2. **Decal size:** Use optimized images (<500KB)
3. **Material choice:** Chrome/metallic materials are more GPU-intensive
4. **Update calls:** The helmet.update() is now OPTIONAL (helmet follows player automatically)

---

## ADVANCED: HELMET EVENTS

Add custom helmet change events:

```javascript
// In your level config
onLevelStart: function(game) {
    if (game.modules.helmet) {
        // Store original changeHelmet method
        const originalChange = game.modules.helmet.changeHelmet.bind(game.modules.helmet);
        
        // Wrap with custom behavior
        game.modules.helmet.changeHelmet = function(slotNum) {
            originalChange(slotNum);
            // Custom behavior
            console.log('🎉 Helmet changed!');
            game.state.score += 100; // Bonus points!
        };
    }
}
```

---

## HELMET CREATOR TOOL

To create helmets, you'll need a separate helmet editor. Example structure:

```html
<!-- helmet-editor.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Helmet Creator</title>
</head>
<body>
    <div id="editor">
        <h1>🪖 Helmet Creator</h1>
        <input type="text" id="helmetName" placeholder="Helmet Name">
        <input type="color" id="shellColor" value="#FF0000">
        <!-- Add more controls -->
        <button onclick="saveHelmet()">Save to Slot 1</button>
    </div>
    
    <script src="three.module.js"></script>
    <script src="helmet_loader.js"></script>
    <script>
        function saveHelmet() {
            const helmetData = {
                name: document.getElementById('helmetName').value,
                colors: {
                    shell: document.getElementById('shellColor').value,
                    // etc...
                }
            };
            localStorage.setItem('helmet_slot_1', JSON.stringify(helmetData));
            alert('Helmet saved!');
        }
    </script>
</body>
</html>
```

---

## FILE STRUCTURE

Your project should look like:

```
game/
├── index.html
├── three.module.js
├── helmet_loader.js ⭐
├── applesauce-core-r182-FINAL.js
├── applesauce-gore-r182.js
├── applesauce-dialogue-r182.js
├── applesauce-enemies-r182.js
├── applesauce-objectives-r182.js
├── applesauce-terrain-r182.js
├── level_16.js
├── level_17.js
└── music/
    └── levels/
```

---

## 🎯 FINAL CHECKLIST

- [ ] helmet_loader.js loaded in HTML
- [ ] HelmetLoader initialized AFTER player creation
- [ ] Player object passed to HelmetLoader constructor
- [ ] loadHelmet() called after initialization
- [ ] Keyboard controls added for helmet switching
- [ ] clearLevel() removes helmet properly
- [ ] Tested with at least one helmet in localStorage

---

## EXAMPLE: COMPLETE INTEGRATION

See `level_16_with_helmet.js` for a fully working example!

---

Made with 💀 for South of South Records
