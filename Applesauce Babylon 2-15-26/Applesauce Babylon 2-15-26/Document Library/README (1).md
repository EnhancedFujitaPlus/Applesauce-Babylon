# APPLESAUCE - Helmet Combat System
## Babylon.js + Havok Physics Edition

A complete helmet-based combat system for the APPLESAUCE skateboarding game, featuring physics-driven battles, particle effects, and scalable enemy waves.

---

## 🎮 System Overview

### Core Concept
Helmets are the primary weapons in APPLESAUCE. Players collect, equip, and switch between different helmet types, each with unique stats, elements, and special abilities. Combat is physics-based using Havok, with vibrant particle effects and combo systems.

### Architecture

```
┌─────────────────────────────────────────────────────┐
│           APPLESAUCE CORE (Babylon.js)              │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  BabylonHelmetSystem                         │   │
│  │  - Helmet database                           │   │
│  │  - Quick-swap (1-9 slots)                    │   │
│  │  - Attack detection                          │   │
│  │  - Combo tracking                            │   │
│  └──────────┬───────────────────────────────────┘   │
│             │                                         │
│  ┌──────────▼──────────────┐  ┌─────────────────┐  │
│  │ HelmetEffectsManager    │  │ HelmetInventoryUI│  │
│  │ - Particle systems       │  │ - Quick-swap bar │  │
│  │ - Elemental effects      │  │ - Pause menu     │  │
│  │ - Death explosions       │  │ - Notifications  │  │
│  └─────────────────────────┘  └─────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  SkaterGoonsManager                          │   │
│  │  - Enemy spawning                            │   │
│  │  - AI behaviors                              │   │
│  │  - Wave management                           │   │
│  │  - Physics-based movement                    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Module Breakdown

### 1. **BabylonHelmetSystem** (`babylon-helmet-system.js`)
**Purpose:** Core helmet management and combat mechanics

**Features:**
- Helmet registration and database
- 9-slot quick-swap system
- Attack hit detection with cone-based targeting
- Combo system with damage multipliers
- Knockback physics using Havok
- Elemental effect triggers
- Loadout save/load

**Key Methods:**
```javascript
registerHelmet(helmetData)      // Add new helmet type
equipToSlot(helmetId, slot)     // Equip to slot 1-9
switchToSlot(slot)              // Switch active helmet
attack(targets)                 // Perform attack
getCurrentHelmet()              // Get active helmet
getComboInfo()                  // Get combo stats
```

### 2. **HelmetEffectsManager** (`babylon-helmet-effects.js`)
**Purpose:** Visual effects and particle systems

**Features:**
- Particle system management
- Elemental effects (fire, ice, electric, gore)
- Impact bursts and explosions
- Death animations
- Ice shards and lightning arcs

**Effects Types:**
- `createImpactBurst()` - Default attack effect
- `createFireBurst()` - Rising flames
- `createIceBurst()` - Falling ice + shards
- `createElectricBurst()` - Lightning + arcs
- `createGoreBurst()` - Blood spray
- `createDeathExplosion()` - Large dramatic blast

### 3. **HelmetInventoryUI** (`babylon-helmet-inventory.js`)
**Purpose:** User interface for helmet management

**Features:**
- Always-visible quick-swap bar (bottom of screen)
- Full inventory pause menu (I or ESC)
- Helmet cards with stats
- Combo counter display
- Toast notifications
- Click-to-equip system

**UI Elements:**
- Quick-swap bar: 9 slots showing equipped helmets
- Inventory modal: Grid view of all helmets
- Combo display: Animated counter (top-right)
- Notifications: Slide-in toasts

### 4. **SkaterGoonsManager** (`babylon-skater-goons.js`)
**Purpose:** Enemy AI and wave management

**Features:**
- Goon type registration
- Physics-based AI movement
- State machine (idle/chase/attack/retreat)
- Wave spawning system
- Health and damage tracking
- Fade-out death animations

**AI States:**
- **Idle:** Wander or stand still
- **Chase:** Move toward player
- **Attack:** Deal damage when in range
- **Retreat:** Flee when low health

**Key Methods:**
```javascript
registerGoonType(typeData)              // Add enemy type
spawnGoon(typeId, position)             // Spawn single enemy
spawnWave(typeId, count, center, radius)// Spawn circle wave
update(deltaTime, player)                // AI update
getAliveGoons()                          // Get living enemies
```

### 5. **Level13_HelmetFactory** (`level13-helmet-factory.js`)
**Purpose:** Example level demonstrating all systems

**Features:**
- Factory environment generation
- 6 pre-configured helmets
- 3 goon types
- 3-wave progression system
- Collectible helmet crates
- Full integration example

---

## 🪖 Helmet System

### Helmet Properties
```javascript
{
    id: 'unique_id',
    name: 'Display Name',
    description: 'Flavor text',
    
    // Combat
    damage: 25,              // Base damage
    range: 3,                // Attack range (meters)
    knockback: 2,            // Knockback force
    cooldown: 30,            // Frames between attacks
    comboMultiplier: 1.2,    // Damage scaling per combo
    
    // Element
    element: 'fire',         // 'fire'|'ice'|'electric'|'gore'|null
    
    // Visual
    color: '#FF0000',
    particleColor: '#FF4444',
    meshUrl: null,           // Optional custom mesh
    
    // Special
    special: (system, results) => {
        // Custom ability code
    }
}
```

### Built-in Helmets (Level 13)

| Helmet | Damage | Range | Element | Special |
|--------|--------|-------|---------|---------|
| Red Crusher | 25 | 3m | None | Basic |
| Blazer Mk.1 | 30 | 4m | Fire | Rising flames |
| Frost Dome | 20 | 3.5m | Ice | Slows targets |
| Thunderstrike | 35 | 5m | Electric | Chain lightning |
| Skullcrusher | 50 | 2.5m | Gore | High damage |
| Velocity Visor | 15 | 2m | None | Fast cooldown |

---

## 👥 Goon System

### Goon Properties
```javascript
{
    id: 'unique_id',
    name: 'Display Name',
    
    // Stats
    health: 100,
    speed: 5,
    damage: 10,
    attackRange: 2,
    detectionRange: 15,
    
    // AI
    aggression: 0.5,        // 0-1 (higher = more aggressive)
    retreatThreshold: 0.3,  // Health % to retreat
    
    // Visual
    color: '#8B4513',
    size: { width: 0.8, height: 1.8, depth: 0.5 }
}
```

### Built-in Goon Types

| Type | HP | Speed | Damage | Behavior |
|------|----|----|--------|----------|
| Street Skater | 75 | 5 | 10 | Balanced |
| Heavy Crusher | 150 | 3 | 25 | Tank |
| Speed Demon | 50 | 10 | 15 | Fast & aggressive |

---

## 🎮 Controls

### Movement
- **W/↑** - Forward
- **S/↓** - Backward
- **A/←** - Turn left
- **D/→** - Turn right
- **SPACE** - Jump

### Combat
- **J or SPACE** - Attack with current helmet
- **1-9** - Switch to helmet slot
- **I or ESC** - Open inventory

---

## 🔧 Integration Guide

### Quick Start
```javascript
// 1. Load dependencies (Babylon.js + Havok)
// 2. Create core
const core = new ApplesauceCore({ goreEnabled: true });
await core.init();

// 3. Load level
await core.loadLevel(Level13_HelmetFactory);

// 4. Start game
core.start();
```

### Adding Custom Helmets
```javascript
core.helmetSystem.registerHelmet({
    id: 'my_helmet',
    name: 'My Custom Helmet',
    damage: 40,
    range: 4,
    knockback: 3,
    element: 'fire',
    color: '#FF00FF',
    special: (system, results) => {
        console.log('Special ability activated!');
        // Your custom code here
    }
});

// Equip to slot
core.helmetSystem.equipToSlot('my_helmet', 0);
```

### Spawning Enemies
```javascript
// Single enemy
const goon = core.goonsManager.spawnGoon(
    'basic_goon',
    new BABYLON.Vector3(10, 2, 10)
);

// Wave of enemies
core.goonsManager.spawnWave(
    'fast_goon',     // Type
    5,               // Count
    centerPos,       // Spawn center
    10               // Spread radius
);
```

### Custom Level Creation
```javascript
export const MyLevel = {
    meta: {
        name: "MY LEVEL",
        description: "Custom level description"
    },
    
    async onLevelStart(core) {
        // Setup helmet system
        const { BabylonHelmetSystem } = await import('./babylon-helmet-system.js');
        core.helmetSystem = new BabylonHelmetSystem(core.scene, core.player);
        
        // Register helmets
        // Create environment
        // Spawn enemies
    },
    
    onUpdate(core) {
        // Update loop
        core.helmetSystem.update(core.getDeltaTime());
        core.goonsManager.update(core.getDeltaTime(), core.player);
    }
};
```

---

## 📊 Performance Considerations

### Optimization Tips
1. **Enemy Limit:** Default max 50 goons - adjust `maxGoons` in SkaterGoonsManager
2. **Particle Pooling:** Effects auto-dispose after animation
3. **Physics:** Use `mass: 0` for static objects
4. **Draw Calls:** Combine meshes where possible
5. **LOD:** Implement for distant goons

### Recommended Limits
- **Goons:** 50 simultaneous
- **Particles:** 10 active systems
- **Helmets:** Unlimited (only 9 equipped at once)

---

## 🎨 Customization

### Element System
Elements determine visual effects and behavior:
- **fire** - Orange flames, rises upward
- **ice** - Blue particles, creates shards, slows targets
- **electric** - Yellow sparks, no gravity, can chain
- **gore** - Red blood, heavy gravity
- **null** - Default white impact

### Creating New Elements
1. Add effect method to `HelmetEffectsManager`
2. Reference in helmet's `element` property
3. Implement custom behavior in helmet's `special` function

### Visual Customization
```javascript
// Custom helmet mesh
helmetSystem.registerHelmet({
    id: 'custom_mesh',
    meshUrl: '/path/to/helmet.babylon',
    // ... other properties
});

// Custom particle colors
helmetSystem.registerHelmet({
    id: 'rainbow',
    particleColor: '#FF00FF',
    special: (system, results) => {
        // Animate color over time
    }
});
```

---

## 🐛 Debugging

### Debug Console
```javascript
// Available at window.APPLESAUCE_DEBUG

APPLESAUCE_DEBUG.listHelmets(core);    // Show all helmets
APPLESAUCE_DEBUG.listGoons(core);      // Show goon stats
APPLESAUCE_DEBUG.getCombatStats(core); // Combat info
APPLESAUCE_DEBUG.spawnCustomWave(core);// Spawn test wave
```

### Common Issues

**Goons not spawning:**
- Check Havok initialized: `core.havokPlugin !== null`
- Verify goon type registered
- Check max goons limit

**Combat not working:**
- Ensure helmet equipped: `core.helmetSystem.getCurrentHelmet()`
- Check attack cooldown
- Verify targets array passed to `attack()`

**UI not showing:**
- Check inventory UI created in level
- Verify DOM elements appended
- Check z-index conflicts

**Physics weird:**
- Havok loads asynchronously - use `await core.init()`
- Check mass values (0 = static, >0 = dynamic)
- Verify friction/restitution values

---

## 🚀 Future Enhancements

### Potential Features
- [ ] Helmet crafting system
- [ ] Elemental combos (fire + ice = steam)
- [ ] Charged attacks (hold to power up)
- [ ] Aerial combat mechanics
- [ ] Boss goons with unique patterns
- [ ] Co-op multiplayer support
- [ ] Helmet upgrade system
- [ ] Challenge modes (speed runs, survival)
- [ ] Custom helmet editor integration
- [ ] Replay system

---

## 📝 File Structure

```
applesauce-helmet-combat/
├── applesauce-core-babylon.js      # Core engine
├── babylon-helmet-system.js         # Helmet management
├── babylon-helmet-effects.js        # Visual effects
├── babylon-helmet-inventory.js      # UI system
├── babylon-skater-goons.js          # Enemy AI
├── level13-helmet-factory.js        # Example level
├── main.js                          # Integration & init
└── README.md                        # This file
```

---

## 🎵 Credits

**Developer:** South of South Records  
**Engine:** Babylon.js + Havok Physics  
**Concept:** Helmet-based skateboard combat

---

## 📄 License

Part of the APPLESAUCE game series.  
© South of South Records

---

**Ready to skate and destroy! 🛹💥🪖**
