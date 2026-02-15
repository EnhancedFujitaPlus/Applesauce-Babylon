# 🛹 SKATEBOARD CUSTOMIZATION SYSTEM
## Complete Integration Guide

---

## 🎯 OVERVIEW

The skateboard loader provides **in-depth customization** of all major skateboard components:

### Components:
1. **DECK** - Shape, color, graphics, wear
2. **TRUCKS** - Color, material, height, bushings
3. **WHEELS** - Size, color, hardness, wear/coning
4. **GRIP TAPE** - Color, pattern, custom graphics
5. **BEARINGS** - Visible details, ABEC rating, shields

---

## 📁 FILE STRUCTURE

```
your-game/
├── game.html                         ← Add skateboard init here
├── skateboard_loader.js              ← NEW FILE
├── helmet_loader.js
├── jacket_loader.js
├── applesauce-core-r182-FIXED.js
└── assets/
    ├── deck-graphics/                ← Deck graphics
    └── grip-patterns/                ← Custom grip patterns
```

---

## 🚀 INTEGRATION STEPS

### Step 1: Add to game.html

Add skateboard loader script BEFORE the game engine module:

```html
<!-- CUSTOMIZATION LOADERS -->
<script src="helmet_loader.js"></script>
<script src="jacket_loader.js"></script>
<script src="skateboard_loader.js"></script>  <!-- ⭐ ADD THIS -->
```

### Step 2: Initialize in game.html

In the game initialization section (after player is created):

```javascript
// ⭐ Skateboard System
if (typeof SkateboardLoader !== 'undefined' && game.player) {
    console.log('🛹 Initializing skateboard system...');
    game.modules.skateboard = new SkateboardLoader(game.scene, game.player);
    game.modules.skateboard.loadSkateboard();
    console.log('✅ Skateboard loaded!');
} else if (typeof SkateboardLoader === 'undefined') {
    console.warn('⚠️ SkateboardLoader not found');
}
```

### Step 3: Add Controls

Add keyboard controls for skateboard switching:

```javascript
// B key - cycle skateboards
if (e.key.toLowerCase() === 'b' && game.modules.skateboard && !game.state.paused) {
    const currentSlot = game.modules.skateboard.activeSlot;
    const nextSlot = (currentSlot % 9) + 1;
    game.modules.skateboard.changeSkateboard(nextSlot);
    console.log(`🛹 Switched to skateboard slot ${nextSlot}`);
}

// Alt+1-9 - direct slot selection
if (e.altKey && e.key >= '1' && e.key <= '9' && 
    game.modules.skateboard && !game.state.paused) {
    const slotNum = parseInt(e.key);
    game.modules.skateboard.changeSkateboard(slotNum);
    console.log(`🛹 Switched to skateboard slot ${slotNum}`);
}
```

### Step 4: Add HUD (Optional)

```html
<div id="skateboard-hud">
    <h3>🛹 BOARD</h3>
    <div id="skateboard-name">Loading...</div>
    <div id="skateboard-slot">Slot: -</div>
    <div>B = Switch | Alt+1-9 = Slot</div>
</div>
```

### Step 5: Update in Game Loop

Add to your update loop for wheel animation:

```javascript
// In game.start() or main update loop
if (game.modules.skateboard) {
    game.modules.skateboard.update(game.state.speed);
}
```

---

## 🎨 SKATEBOARD DATA STRUCTURE

### Complete Example:

```javascript
{
    name: "Pro Street Setup",
    
    deck: {
        shape: "popsicle",              // popsicle, cruiser, oldschool, shaped
        width: 0.8,
        length: 2.5,
        concave: "medium",              // low, medium, high
        color: "#FF1493",               // Top color
        underColor: "#000000",          // Bottom color
        graphic: "./assets/flames.png", // Deck graphic
        graphicScale: 1,
        graphicPosition: { x: 0, y: 0 },
        material: "maple",              // maple, bamboo, carbon
        wear: "pristine"                // pristine, used, beaten, trashed
    },
    
    trucks: {
        color: "#C0C0C0",               // Truck color
        material: "aluminum",           // aluminum, titanium, hollow
        height: "mid",                  // low, mid, high
        width: 0.8,
        bushings: "#FF0000"             // Bushing color
    },
    
    wheels: {
        diameter: 0.15,                 // Wheel size
        width: 0.1,
        color: "#222222",               // Wheel color
        coreColor: "#FFFFFF",           // Core color
        hardness: 99,                   // 78-101 (softer-harder)
        wear: 0,                        // 0-100 (wheel coning)
        graphics: false
    },
    
    griptape: {
        color: "#000000",
        pattern: "solid",               // solid, perforated, clear, colored
        wear: 0,                        // 0-100
        custom: null                    // URL to custom pattern
    },
    
    bearings: {
        visible: true,                  // Show bearings?
        rating: "ABEC-7",               // ABEC-1/3/5/7/9, Ceramic
        color: "#FFD700",               // Bearing color
        shields: true                   // Show bearing shields?
    }
}
```

---

## 🎯 COMPONENT DETAILS

### 1. DECK

**Shapes:**
- `popsicle` - Standard street deck (default)
- `cruiser` - Wider, shorter for cruising
- `oldschool` - Wide tail, retro style
- `shaped` - Custom shaped deck

**Materials:**
- `maple` - Standard 7-ply (default)
- `bamboo` - Lighter, flexible
- `carbon` - Stiff, high-tech look

**Wear Levels:**
- `pristine` - Brand new
- `used` - Some wear
- `beaten` - Heavy wear
- `trashed` - Barely functional

**Graphics:**
- Set `graphic` to image URL
- Adjust `graphicScale` (0.5-2.0)
- Position with `graphicPosition` {x, y}

---

### 2. TRUCKS

**Heights:**
- `low` - 0.12 units - Better for flip tricks
- `mid` - 0.15 units - All-around (default)
- `high` - 0.18 units - Carving, big wheels

**Materials:**
- `aluminum` - Standard (default)
- `titanium` - Lighter, stronger
- `hollow` - Lightest option

**Bushings:**
- Any hex color for bushing rubber
- Common: `#FF0000` (red), `#00FF00` (green), `#FFD700` (yellow)

---

### 3. WHEELS

**Diameter:**
- Small: 0.12-0.14 (street, technical)
- Medium: 0.15 (default, all-around)
- Large: 0.16-0.18 (transition, cruising)

**Hardness (durometer):**
- 78-87: Soft (cruiser wheels) → Blue indicator
- 88-95: Medium (street/park) → Green indicator
- 96-101: Hard (street skating) → Red indicator

**Wear (Coning):**
- 0: Brand new, flat
- 50: Some coning visible
- 100: Heavily coned, needs replacement

**Core Color:**
- Inner circle visible on wheels
- Common: White, Black, matching truck color

---

### 4. GRIP TAPE

**Patterns:**
- `solid` - Standard black grip (default)
- `perforated` - Holes for lighter weight
- `clear` - See-through grip (shows deck)
- `colored` - Colored grip tape

**Custom Patterns:**
- Set `custom` to image URL
- Great for logos, designs, cutouts

**Wear:**
- 0-100 scale
- Higher = darker, less grippy appearance

---

### 5. BEARINGS

**ABEC Ratings:**
- `ABEC-1` - Lowest precision
- `ABEC-3` - Recreational
- `ABEC-5` - Standard skating
- `ABEC-7` - High performance (default)
- `ABEC-9` - Race quality
- `Ceramic` - Highest quality

**Visual Options:**
- `visible: true` - Show bearing rings on wheels
- `shields: true` - Show bearing shields
- `color` - Bearing ring color

---

## ⌨️ KEYBOARD CONTROLS

```
B             - Cycle skateboards (1→2→3...→9→1)
Alt+1-9       - Jump to specific skateboard slot
```

Suggested control scheme:
- **H** = Helmet
- **J** = Jacket
- **B** = Board (skateboard)

---

## 🧪 TESTING

### Create Test Skateboards:

```javascript
// Test Setup 1: Street Setup
const streetSetup = {
    name: "Street Beast",
    deck: {
        shape: "popsicle",
        width: 0.8,
        length: 2.5,
        concave: "high",
        color: "#FF0000",
        underColor: "#000000",
        material: "maple",
        wear: "used"
    },
    trucks: {
        color: "#333333",
        material: "aluminum",
        height: "low",
        width: 0.8,
        bushings: "#00FF00"
    },
    wheels: {
        diameter: 0.14,
        width: 0.1,
        color: "#FFFFFF",
        coreColor: "#FF0000",
        hardness: 99,
        wear: 30
    },
    griptape: {
        color: "#000000",
        pattern: "solid",
        wear: 40
    },
    bearings: {
        visible: true,
        rating: "ABEC-9",
        color: "#FFD700",
        shields: true
    }
};

localStorage.setItem('skateboard_slot_1', JSON.stringify(streetSetup));
```

### Test in Console:

```javascript
// List all skateboards
skateboardAPI.list()

// Switch board
skateboardAPI.switchTo(2)

// Check loaded board
game.modules.skateboard.currentSkateboardData

// Test wheel rotation
game.modules.skateboard.update(0.5)
```

---

## 🎮 ANIMATION FEATURES

### Wheel Rotation:
Wheels automatically rotate based on player speed:
```javascript
// Called in game update loop
skateboard.update(playerSpeed);
```

### Bearing Spin:
Bearings spin faster than wheels for visual detail

### Visible Details:
- Trucks flex (future feature)
- Bushings compress (future feature)
- Wheel wear affects shape (coning)

---

## 💡 PRO TIPS

### 1. Realistic Setups:
Match components realistically:
- Small wheels (0.12-0.14) + Low trucks = Street setup
- Large wheels (0.16-0.18) + High trucks = Cruiser setup

### 2. Wear & Tear:
Create progression systems:
- Start with `pristine` gear
- Unlock `trashed` aesthetic after challenges

### 3. Performance Differences:
You could add gameplay effects:
- Low trucks = easier flip tricks
- High trucks = better turning
- Soft wheels = more grip
- Hard wheels = faster slides

### 4. Graphics:
Use transparent PNGs for deck graphics:
- Company logos
- Custom art
- Flames, skulls, etc.

### 5. Grip Patterns:
Create recognizable patterns:
- Brand logos
- Cutouts
- Custom designs

---

## 🔧 ADVANCED: REPLACE DEFAULT BOARD

The skateboard loader **automatically removes** the default deck and wheels from the player object and replaces them with the custom board.

This means:
- ✅ No duplicate boards
- ✅ Custom board IS the player's board
- ✅ Fully integrated with game physics

---

## 📊 PERFORMANCE

### Polygon Counts:
- Deck: ~100 triangles
- Trucks (×2): ~200 triangles each
- Wheels (×4): ~150 triangles each
- Total: ~1,200 triangles per board

Very lightweight! Won't impact performance.

---

## 🎨 CREATING A SKATEBOARD EDITOR

Next step: Build `skateboard_editor.html` with:
1. **Deck Designer** - Colors, graphics, wear
2. **Truck Selector** - Height, color, material
3. **Wheel Customizer** - Size, hardness, color
4. **Grip Designer** - Patterns, colors
5. **Bearing Selector** - Rating, color
6. **Live 3D Preview** - See changes in real-time
7. **Save/Load System** - 9 slots

Would you like me to create the editor next?

---

## 🚨 IMPORTANT NOTES

### Deck Replacement:
The loader finds and removes default deck/wheels from player:
```javascript
// Looks for BoxGeometry with depth=2.5 (deck)
// Looks for CylinderGeometry with radius=0.15 (wheels)
// Removes them before adding custom board
```

### Update in Game Loop:
Don't forget to call `update()` for wheel animation:
```javascript
if (game.modules.skateboard) {
    game.modules.skateboard.update(game.state.speed);
}
```

### Cleanup:
When changing levels, skateboard is automatically removed with player

---

## 🛹 CONSOLE API

```javascript
window.skateboardAPI = {
    list: () => { /* List all boards */ },
    switchTo: (slot) => { /* Switch to slot */ },
    clear: (slot) => { /* Delete board */ },
    export: (slot) => { /* Export JSON */ },
    import: (data) => { /* Import JSON */ }
};
```

---

Made with 💀 for South of South Records
**Skate or Die! 🛹**
