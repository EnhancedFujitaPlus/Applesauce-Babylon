# APPLESAUCE Module Architecture
## How Collision & Hybrid Gore Fit Into Your Engine

---

## 📐 CURRENT ARCHITECTURE (Your Setup)

```
┌─────────────────────────────────────────────────────────┐
│                   ApplesauceCore                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • Scene, Renderer, Camera                         │  │
│  │ • Player physics (movement, jumping, grinding)    │  │
│  │ • Main update loop                                │  │
│  │ • Module registration system                      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────── MODULES ───────────────────┐         │
│  │                                             │         │
│  │  ┌────────────────┐   ┌─────────────────┐ │         │
│  │  │   Terrain      │   │    Enemies      │ │         │
│  │  │   Module       │   │    Module       │ │         │
│  │  └────────────────┘   └─────────────────┘ │         │
│  │                                             │         │
│  │  ┌────────────────┐   ┌─────────────────┐ │         │
│  │  │   Gore         │   │   Dialogue      │ │         │
│  │  │   Module       │   │   Module        │ │         │
│  │  └────────────────┘   └─────────────────┘ │         │
│  │                                             │         │
│  │  ┌────────────────┐   ┌─────────────────┐ │         │
│  │  │  Objectives    │   │   Weather       │ │         │
│  │  │   Module       │   │   Module        │ │         │
│  │  └────────────────┘   └─────────────────┘ │         │
│  │                                             │         │
│  └─────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

---

## 📐 NEW ARCHITECTURE (With Collision + Hybrid Gore)

```
┌─────────────────────────────────────────────────────────┐
│                   ApplesauceCore                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • Scene, Renderer, Camera                         │  │
│  │ • Player physics (movement, jumping, grinding)    │  │
│  │ • Main update loop                                │  │
│  │ • Module registration system                      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────── MODULES ───────────────────┐         │
│  │                                             │         │
│  │  ┌────────────────┐   ┌─────────────────┐ │         │
│  │  │   Terrain      │   │    Enemies      │ │         │
│  │  │   Module       │   │    Module       │ │         │
│  │  └────────────────┘   └─────────────────┘ │         │
│  │          ▲                      ▲          │         │
│  │          │                      │          │         │
│  │          │    ┌─────────────────┴────┐    │         │
│  │          │    │   🆕 COLLISION       │    │         │
│  │          │    │      MODULE          │◄───┼─────────┤
│  │          │    └──────────────────────┘    │         │
│  │          │             │                   │         │
│  │          │             ▼                   │         │
│  │  ┌───────┴────────────────────────────┐   │         │
│  │  │   🆕 HYBRID GORE MODULE            │   │         │
│  │  │  ┌──────────────────────────────┐  │   │         │
│  │  │  │  Traditional Gore            │  │   │         │
│  │  │  │  (ApplesauceGore)            │  │   │         │
│  │  │  └──────────────────────────────┘  │   │         │
│  │  │  ┌──────────────────────────────┐  │   │         │
│  │  │  │  Verlet Physics              │  │   │         │
│  │  │  │  (VerletGoreSystem)          │  │   │         │
│  │  │  └──────────────────────────────┘  │   │         │
│  │  └────────────────────────────────────┘   │         │
│  │                                             │         │
│  │  ┌────────────────┐   ┌─────────────────┐ │         │
│  │  │   Dialogue     │   │   Objectives    │ │         │
│  │  │   Module       │   │   Module        │ │         │
│  │  └────────────────┘   └─────────────────┘ │         │
│  │                                             │         │
│  │  ┌────────────────┐                        │         │
│  │  │   Weather      │                        │         │
│  │  │   Module       │                        │         │
│  │  └────────────────┘                        │         │
│  │                                             │         │
│  └─────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 DATA FLOW

### Every Frame:

```
1. Core.update() called
   │
   ├─► updatePhysics()
   │   └─► Updates player position, velocity, grinding state
   │
   ├─► Collision.update(core) ◄── NEW MODULE
   │   ├─► Reads player position/velocity from core
   │   ├─► Checks distance to enemies
   │   ├─► Classifies kill type (grind/trick/combo/impact)
   │   └─► Calls appropriate gore method ───┐
   │                                          │
   ├─► Enemies.update(core)                  │
   │   └─► Removes dead enemies              │
   │                                          ▼
   ├─► HybridGore.update(core) ◄─────────────┘
   │   ├─► Decides: Verlet or Traditional?
   │   ├─► Creates appropriate gore effects
   │   ├─► Updates combo multiplier
   │   └─► Monitors performance
   │
   └─► ... other modules ...
```

---

## 🎯 KEY FEATURES

### ApplesauceCollision Module:

**What it does:**
- ✅ Detects when player hits enemies
- ✅ Determines kill type based on player state
- ✅ Calls appropriate gore methods
- ✅ Updates score and combo
- ✅ Tracks kill statistics

**What it reads from Core:**
- `core.player.position` - Player location
- `core.state.speed` - How fast player is moving
- `core.state.grinding` - Is player grinding?
- `core.state.grounded` - Is player on ground?
- `core.state.currentTrick` - Current trick being performed

**What it writes to Core:**
- `core.state.score` - Adds points for kills
- `core.state.combo` - Increases combo multiplier
- `core.state.comboTimer` - Resets combo timeout

---

### ApplesauceHybridGore Module:

**What it does:**
- ✅ Wraps your existing gore + new Verlet physics
- ✅ Intelligently chooses which system to use
- ✅ Backwards compatible with all existing gore calls
- ✅ Automatically adjusts performance
- ✅ Provides skating-specific gore methods

**Performance Logic:**
```javascript
Kill Type         | Use Verlet?
─────────────────┼──────────────────────
Grind Kill       | ✅ Always (looks awesome)
Trick Landing    | ✅ Always (earned it!)
Combo Kill       | ✅ Always (spectacular)
High-Speed Hit   | ⚖️ Auto (if fast enough)
Ambient Bump     | ❌ Never (waste of CPU)
```

**Backwards Compatible:**
All existing gore calls work:
```javascript
// These still work exactly as before
this.modules.gore.createMassiveSplatter(pos, vel);
this.modules.gore.createArterialSpray(pos, dir, 3);
this.modules.gore.createBloodMist(pos, 2);
// etc.
```

**New Methods:**
```javascript
// Skating-specific gore
this.modules.gore.createGrindGore(pos, dir, speed);
this.modules.gore.createTrickLandingGore(pos, vel, trick);
this.modules.gore.createComboGore(pos, vel, combo);
```

---

## 🔌 INTEGRATION POINTS

### 1. Module Registration (Constructor)
```javascript
// Add to modules object
this.modules = {
    gore: null,
    collision: null,  // ← ADD THIS
    // ... others
};

// Initialize
this.modules.gore = new ApplesauceHybridGore(this);
this.modules.collision = new ApplesauceCollision(this);
this.modules.collision.init();
```

### 2. Update Loop
```javascript
update() {
    this.updatePhysics();
    
    // ADD THIS (before gore update)
    if (this.modules.collision) {
        this.modules.collision.update(this);
    }
    
    if (this.modules.gore) {
        this.modules.gore.update(this);
    }
    
    // ... rest
}
```

### 3. Level Clear
```javascript
clearLevel() {
    // ... existing clears ...
    
    // ADD THIS
    if (this.modules.collision) {
        this.modules.collision.clear();
    }
}
```

---

## ⚡ WHY THIS ARCHITECTURE?

### ✅ Modular
- Each system is independent
- Easy to enable/disable
- Can swap implementations

### ✅ Maintainable
- Clear separation of concerns
- Collision logic separate from physics
- Gore effects separate from collision

### ✅ Backwards Compatible
- Existing gore calls still work
- Existing enemy system unchanged
- No breaking changes

### ✅ Performance Aware
- Hybrid gore adapts to FPS
- Collision checks are efficient
- Can disable Verlet entirely if needed

### ✅ Extensible
- Easy to add new kill types
- Easy to add new gore effects
- Easy to add new weapon types

---

## 🎮 RESULT

After integration, your game automatically:
- 🛹 **Detects kills** when skating into enemies
- 💀 **Classifies kills** (grind/trick/combo/impact)
- 🩸 **Creates appropriate gore** (Verlet or Traditional)
- 🎯 **Updates score & combos** automatically
- ⚡ **Adapts performance** based on FPS

**Zero manual intervention required!**

Just skate around and kill enemies - the modules handle everything else.
