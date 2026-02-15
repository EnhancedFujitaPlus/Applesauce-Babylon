# 🪖🧥 HELMET & JACKET INTEGRATION GUIDE
## Complete Character Customization System

---

## 🎯 QUICK START

### Files You Need:
```
your-game/
├── game.html ← Replace with game_WITH_HELMET_AND_JACKET.html
├── helmet_loader.js ← Your helmet loader
├── jacket_loader.js ← Your jacket loader
├── three.module.js
├── applesauce-core-r182-FINAL.js
└── levels/
```

### Loading Order (Critical!):
```html
1. helmet_loader.js (line 190)
2. jacket_loader.js (line 191)
3. Level configs (line 197+)
4. Game engine module (line 217+)
```

---

## ⌨️ KEYBOARD CONTROLS

### In-Game:
```
H             - Cycle helmets (1→2→3...→9→1)
J             - Cycle jackets (1→2→3...→9→1)

Shift+1-9     - Jump to helmet slot directly
Ctrl+Shift+1-9 - Jump to jacket slot directly

ESC           - Return to menu
```

### Why These Keys?
- **H** = Helmet (easy to remember)
- **J** = Jacket (right next to H)
- **Shift** = Helmet slots (easier than Ctrl)
- **Ctrl+Shift** = Jacket slots (requires both hands, less accidental)

---

## 🎨 HUD LAYOUT

```
┌─────────────────────────────────────────────────────┐
│  SCORE: 50000    [🪖 HELMET]  [🧥 JACKET]  OBJECTIVES│
│  COMBO: 5x       [Slot info]  [Slot info]  ............│
│  SPEED: 1.2                                ............│
│  KILLS: 10                                 ............│
└─────────────────────────────────────────────────────┘
```

**Left:** Game stats
**Center-Right:** Customization info
**Right:** Objectives

---

## 🎮 HOW IT WORKS

### Initialization Flow:

```javascript
1. Load helmet_loader.js and jacket_loader.js
   ↓
2. Load level config
   ↓
3. Create game engine
   ↓
4. Load level (creates player)
   ↓
5. Wait 200ms
   ↓
6. Initialize helmet system (attaches to player)
   ↓
7. Initialize jacket system (attaches to player)
   ↓
8. Update HUD
   ↓
9. Start game loop
```

### Player Hierarchy:
```
player (THREE.Group)
├── deck (Mesh)
├── body (Mesh)
├── head (Mesh)
├── wheels (4x Mesh)
├── helmetGroup (Group) ← Attached at Y=2.0
│   ├── shell (Mesh)
│   ├── visor (Mesh)
│   ├── accent (Mesh)
│   └── elements (Group)
└── jacketGroup (Group) ← Attached at Y=1.2
    ├── torso (Group)
    ├── sleeves (2x Mesh)
    ├── collar (Mesh)
    ├── closure (Group)
    └── pockets (2x Mesh)
```

Both follow player automatically because they're **child objects**!

---

## 💾 LOCALSTORAGE STRUCTURE

### Helmet Slots (1-9):
```javascript
localStorage.setItem('helmet_slot_1', JSON.stringify({
    name: "Red Racer",
    colors: {
        shell: "#FF0000",
        visor: "#000000",
        accent: "#FFD700"
    },
    material: "chrome",
    elements: ["spikes"],
    elementScale: 1
}));
```

### Jacket Slots (1-9):
```javascript
localStorage.setItem('jacket_slot_1', JSON.stringify({
    name: "Battle Vest",
    sleeveType: "sleeveless",
    jacketType: "vest",
    colors: {
        base: "#1a1a1a",
        accent: "#FF0000",
        trim: "#666666"
    },
    material: "leather",
    damage: {
        burns: 20,
        scratches: 30,
        blood: 10,
        dirt: 15
    },
    wear: "battle-scarred",
    studs: 12,
    physics: {
        simulation: "none",
        stiffness: 70,
        wind: 0
    }
}));
```

### Active Slots:
```javascript
localStorage.getItem('active_helmet_slot') // "1"-"9"
localStorage.getItem('active_jacket_slot')  // "1"-"9"
```

---

## 🧪 CONSOLE TESTING

### Check Everything:
```javascript
// List all customizations
helmetAPI.list()
jacketAPI.list()

// Switch items
helmetAPI.switchTo(2)
jacketAPI.switchTo(3)

// Check loaded items
game.modules.helmet.currentHelmetData
game.modules.jacket.currentJacketData

// Clear slots
helmetAPI.clear(1)
jacketAPI.clear(1)
```

### Debug Commands:
```javascript
// Check if systems loaded
typeof HelmetLoader  // Should be "function"
typeof JacketLoader  // Should be "function"

// Check if systems initialized
game.modules.helmet  // Should be HelmetLoader instance
game.modules.jacket  // Should be JacketLoader instance

// Check player exists
game.player          // Should be THREE.Group

// Check visibility
game.modules.helmet.helmetGroup.visible
game.modules.jacket.jacketGroup.visible
```

---

## 🎨 TEST ITEMS INCLUDED

### Test Helmets (Auto-created):
1. **Red Racer** - Chrome with spikes
2. **Green Machine** - Metallic with mohawk
3. **Blue Devil** - Glossy with horns & wings

### Test Jackets (Auto-created):
1. **Battle Vest** - Leather, battle-scarred, studs
2. **Neon Hoodie** - Nylon, pristine, physics enabled
3. **Bomber Classic** - Leather, worn, classic style

Press **H** and **J** to cycle through them!

---

## 🎯 CUSTOMIZATION OPTIONS

### Helmet Options:
```javascript
colors: {
    shell: "#RRGGBB",   // Main color
    visor: "#RRGGBB",   // Visor tint
    accent: "#RRGGBB"   // Stripe color
}

material: "standard" | "glossy" | "metallic" | "chrome" | "rough"

elements: [
    "spikes",      // Ring of spikes
    "mohawk",      // Center mohawk
    "horns",       // Devil horns
    "wings",       // Side wings
    "chains",      // Hanging chains
    "flames",      // Flame decals
    "concave",     // Top cylinder
    "vents",       // Side vents
    "antennae"     // Top antenna
]

elementScale: 0.5 to 2.0
```

### Jacket Options:
```javascript
sleeveType: "sleeveless" | "short" | "long" | "hoodie"

jacketType: "vest" | "bomber" | "hoodie" | "leather"

colors: {
    base: "#RRGGBB",    // Main jacket color
    accent: "#RRGGBB",  // Buttons/zippers
    trim: "#RRGGBB"     // Collar/pockets
}

material: "fabric" | "leather" | "denim" | "nylon" | "metallic"

damage: {
    burns: 0-100,       // Burn marks
    scratches: 0-100,   // Scratch intensity
    blood: 0-100,       // Blood stains
    dirt: 0-100         // Dirt/grime
}

wear: "pristine" | "worn" | "battle-scarred" | "destroyed"

physics: {
    simulation: "none" | "simple",
    stiffness: 0-100,
    wind: 0-100
}
```

---

## 🔧 CUSTOMIZATION EDITORS

You'll want to create editor pages for these. Basic structure:

### helmet_editor.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>Helmet Creator</title>
    <script src="three.module.js"></script>
    <script src="helmet_loader.js"></script>
</head>
<body>
    <h1>🪖 Helmet Creator</h1>
    
    <!-- Preview canvas -->
    <canvas id="preview"></canvas>
    
    <!-- Controls -->
    <input type="text" id="name" placeholder="Helmet Name">
    <input type="color" id="shellColor" value="#FF0000">
    <input type="color" id="visorColor" value="#000000">
    <input type="color" id="accentColor" value="#FFD700">
    
    <select id="material">
        <option value="standard">Standard</option>
        <option value="glossy">Glossy</option>
        <option value="metallic">Metallic</option>
        <option value="chrome">Chrome</option>
        <option value="rough">Rough</option>
    </select>
    
    <!-- Element checkboxes -->
    <label><input type="checkbox" value="spikes"> Spikes</label>
    <label><input type="checkbox" value="mohawk"> Mohawk</label>
    <!-- etc... -->
    
    <!-- Save button -->
    <select id="saveSlot">
        <option value="1">Slot 1</option>
        <!-- ... -->
        <option value="9">Slot 9</option>
    </select>
    <button onclick="saveHelmet()">Save Helmet</button>
    
    <script>
        // Preview and save logic
        function saveHelmet() {
            const helmetData = {
                name: document.getElementById('name').value,
                colors: {
                    shell: document.getElementById('shellColor').value,
                    visor: document.getElementById('visorColor').value,
                    accent: document.getElementById('accentColor').value
                },
                material: document.getElementById('material').value,
                // ... collect all data
            };
            
            const slot = document.getElementById('saveSlot').value;
            localStorage.setItem(`helmet_slot_${slot}`, JSON.stringify(helmetData));
            alert(`Helmet saved to slot ${slot}!`);
        }
    </script>
</body>
</html>
```

Same structure for `jacket_editor.html`!

---

## ⚠️ TROUBLESHOOTING

### Neither helmet nor jacket appears:
```javascript
// Check in console:
window.THREE        // Should be defined
game.player         // Should exist
game.modules.helmet // Should exist
game.modules.jacket // Should exist
```

### Helmet appears but jacket doesn't (or vice versa):
```javascript
// Check which loader failed:
typeof HelmetLoader  // "function" or "undefined"
typeof JacketLoader  // "function" or "undefined"

// Check errors in console
```

### Items don't follow player:
This shouldn't happen since they're child objects. If it does:
```javascript
// Check attachment:
game.modules.helmet.helmetGroup.parent === game.player  // Should be true
game.modules.jacket.jacketGroup.parent === game.player  // Should be true
```

### Keyboard controls don't work:
```javascript
// Check if game is paused:
game.state.paused  // Should be false

// Try in console:
game.modules.helmet.changeHelmet(2)
game.modules.jacket.changeJacket(2)
```

### HUD doesn't update:
The HUD updates when you switch items. If stuck:
```javascript
// Manual refresh:
document.getElementById('helmet-name').textContent = 
    game.modules.helmet.currentHelmetData.name;
document.getElementById('jacket-name').textContent = 
    game.modules.jacket.currentJacketData.name;
```

---

## 🚀 ADVANCED: LEVEL-SPECIFIC CUSTOMIZATION

Add to your level configs:

```javascript
// In level_XX.js
onLevelStart: function(game) {
    // ... your existing code ...
    
    // Force specific customizations for this level
    if (game.modules.helmet) {
        game.modules.helmet.changeHelmet(3); // Blue Devil for this level
    }
    
    if (game.modules.jacket) {
        game.modules.jacket.changeJacket(1); // Battle Vest for this level
    }
    
    // Or create level-specific temporary items:
    if (game.modules.helmet) {
        const bossHelmet = {
            name: "Boss Battle Helmet",
            colors: { shell: "#FF0000", visor: "#000000", accent: "#FFD700" },
            material: "chrome",
            elements: ["horns", "flames"],
            elementScale: 1.5
        };
        game.modules.helmet.buildHelmet(bossHelmet);
    }
}
```

---

## 📊 PERFORMANCE TIPS

### Both systems are lightweight:
- **Helmet**: ~200 triangles
- **Jacket**: ~400 triangles
- **Total**: <1% GPU impact on modern hardware

### If you need optimization:
1. Reduce element count
2. Use simpler materials (standard > chrome)
3. Disable jacket physics simulation
4. Limit to 1-2 elements per helmet

---

## 🎨 EXTENDING THE SYSTEM

### Want to add more customization?

Easy! Just follow the same pattern:

1. Create `shoes_loader.js` (same structure)
2. Add to game.html: `<script src="shoes_loader.js"></script>`
3. Initialize: `game.modules.shoes = new ShoesLoader(...)`
4. Add controls: `if (e.key === 's') { ... }`
5. Add HUD panel

The system is modular!

---

## 📝 QUICK REFERENCE CARD

```
╔════════════════════════════════════════════════════╗
║  APPLESAUCE CHARACTER CUSTOMIZATION               ║
╠════════════════════════════════════════════════════╣
║  CONTROLS:                                         ║
║    H              Cycle helmets                    ║
║    J              Cycle jackets                    ║
║    Shift+1-9      Helmet slot                      ║
║    Ctrl+Shift+1-9 Jacket slot                      ║
║                                                    ║
║  CONSOLE:                                          ║
║    helmetAPI.list()      Show helmets             ║
║    jacketAPI.list()      Show jackets             ║
║    helmetAPI.switchTo(N) Switch helmet            ║
║    jacketAPI.switchTo(N) Switch jacket            ║
║                                                    ║
║  SLOTS: 1-9 available for each type               ║
║  Storage: localStorage (persistent)               ║
╚════════════════════════════════════════════════════╝
```

---

Made with 💀 for South of South Records
