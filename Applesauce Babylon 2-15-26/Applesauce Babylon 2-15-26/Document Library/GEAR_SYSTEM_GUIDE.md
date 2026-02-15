

 # APPLESAUCE GEAR SYSTEM GUIDE
## Complete Equipment System with Weapon Integration

---

## 🎯 Architecture Overview

```
GEAR SYSTEM FLOW:
───────────────────

Player equips gear
        ↓
Gear stats calculated (defense, speed, weapon bonuses)
        ↓
    ┌───┴───┐
    ↓       ↓
Player     Weapons
Stats      Stats
Modified   Modified
```

**Key Principle:** Gear is a **separate module** that acts as a bridge:
- It's NOT part of Player
- It's NOT part of Weapons
- It **modifies both** based on equipped items

---

## 🎮 Quick Start Integration

### **Step 1: Add Gear Module to Core**

```javascript
// In applesauce-core-3.js

// Import
import { ApplesauceGear } from './gear/applesauce-gear-enhanced.js';

// In constructor
this.modules = {
    gear: null,
    weapons: null,
    // ... other modules
};

// Initialize
this.modules.gear = new ApplesauceGear(this);

// In loadLevel() or init()
this.modules.gear.init();
```

### **Step 2: Equip Gear in Your Level**

```javascript
onLevelStart: (core) => {
    const gear = core.modules.gear;
    
    // Equip a complete set
    gear.equipByName('helmet', 'gore_spattered');
    gear.equipByName('jacket', 'demon_hunter');
    gear.equipByName('pants', 'hunter');
    gear.equipByName('shoes', 'demon_steps');
    gear.equipByName('skateboard', 'demon_deck');
    gear.equipByName('weapon', 'fire_rune');
    
    // Now player has boosted stats and weapons are enhanced!
}
```

### **Step 3: Check Your Bonuses**

```javascript
// Get current stats
const stats = core.modules.gear.getStats();
console.log('Weapon damage:', stats.weaponDamage);  // e.g., 1.6× (60% more damage!)
console.log('Speed:', stats.speed);                  // e.g., 1.3× (30% faster!)
console.log('Defense:', stats.defense);              // e.g., 45 (damage reduction)

// Check equipped gear
const equipped = core.modules.gear.getEquipped();
console.log('Wearing:', equipped);

// Check set bonuses
const sets = core.modules.gear.getSetBonusInfo();
console.log('Set bonuses:', sets);
```

---

## 🗂️ Gear Slots & Their Effects

### **1. Helmet** 🪖
**Affects:** Defense, Health Regen, Crit Chance

```javascript
// Examples from library
'gore_spattered'  → +8 defense, +1 HP/sec
'speed_demon'     → +6 defense, +15% speed, +20% air control
'tank'            → +15 defense, +10 extra defense
'assassin'        → +4 defense, +25% crit, +10% weapon damage
```

### **2. Jacket** 👕
**Affects:** Defense, Speed, Weapon Damage, Lifesteal

```javascript
'skate_punk'      → +12 defense, +20% speed, +15% trick power
'demon_hunter'    → +15 defense, +25% weapon damage, 10% lifesteal
'armor_plated'    → +25 defense, +15 extra defense
'shadow_cloak'    → +8 defense, +15% crit, 15% faster attacks
```

### **3. Pants** 👖
**Affects:** Defense, Stamina, Jump Power, Weapon Range

```javascript
'cargo'           → +10 defense, +30% stamina, +10% jump
'reinforced'      → +20 defense, +8 extra defense
'hunter'          → +12 defense, +20% weapon range, +10% speed
'ninja'           → +6 defense, +25% speed, +10% crit
```

### **4. Shoes** 👟
**Affects:** Defense, Jump Power, Air Control, Weapon Speed

```javascript
'air_max'         → +5 defense, +40% jump, +30% air control
'steel_toe'       → +12 defense, +5 extra defense, +20% grind
'demon_steps'     → +6 defense, +15% speed, +20% projectile speed
'shadow_walkers'  → +4 defense, +20% speed, +20% crit
```

### **5. Skateboard** 🛹
**Affects:** Trick Power, Air Control, Grind Bonus, Crit

```javascript
'demon_deck'      → +1.5× tricks, +2× air control, +30% grind
'speed_runner'    → +30% speed, +20% tricks
'tank_board'      → +8 defense, +12 extra defense (slower tricks)
'assassin_blade'  → +30% crit, +20% weapon damage, +30% tricks
```

### **6. Weapon Enchant** ✨
**Affects:** Weapon Damage, Cooldown, Speed, Effects

```javascript
'fire_rune'       → +30% damage, +20% projectile speed
'ice_rune'        → +20% damage, 30% faster attacks
'lightning_rune'  → +40% damage, +25% crit, +50% speed
'vampire_rune'    → +15% damage, 25% lifesteal
```

---

## 🎁 Set Bonuses

Wear multiple pieces from the same set for powerful bonuses!

### **Demon Slayer Set**
```
2 pieces: +15% weapon damage, +2 HP/sec
3 pieces: +25% weapon damage, +4 HP/sec, 15% lifesteal
4 pieces: +40% weapon damage, +8 HP/sec, 25% lifesteal
5 pieces: +60% weapon damage, +12 HP/sec, 35% lifesteal, +15% crit
```

**Pieces:** gore_spattered, demon_hunter, hunter, demon_steps, demon_deck

### **Velocity Set**
```
2 pieces: +15% speed, +20% air control
3 pieces: +25% speed, +40% air control, +20% tricks
4 pieces: +40% speed, +60% air control, +35% tricks
5 pieces: +60% speed, +100% air control, +50% tricks, +50% jump
```

**Pieces:** speed_demon, skate_punk, cargo, air_max, speed_runner

### **Fortress Set**
```
2 pieces: +15 defense
3 pieces: +30 defense, +3 HP/sec
4 pieces: +50 defense, +6 HP/sec
5 pieces: +75 defense, +10 HP/sec, +20% weapon damage
```

**Pieces:** tank, armor_plated, reinforced, steel_toe, tank_board

### **Shadow Strike Set**
```
2 pieces: +15% crit, 10% faster attacks
3 pieces: +25% crit, 20% faster attacks, +20% weapon damage
4 pieces: +40% crit, 30% faster attacks, +35% weapon damage
5 pieces: +60% crit, 40% faster attacks, +50% weapon damage, +20% speed
```

**Pieces:** assassin, shadow_cloak, ninja, shadow_walkers, assassin_blade

---

## ⚔️ How Gear Affects Weapons

### **Weapon Stat Modification**

When you equip gear with weapon bonuses, it modifies your weapons:

```javascript
// Base weapon
magic_missile = {
    damage: 50,
    speed: 1.5,
    cooldown: 20
}

// After equipping "Demon Slayer" set (5 pieces)
magic_missile = {
    damage: 50,
    modifiedDamage: 80,        // 60% more from gear!
    speed: 1.5,
    modifiedSpeed: 1.5,
    cooldown: 20,
    modifiedCooldown: 20,
    critChance: 15,            // Added from gear
    lifesteal: 35              // Added from gear
}
```

### **Real Example**

```javascript
// Setup level with gear
onLevelStart: (core) => {
    const gear = core.modules.gear;
    const weapons = core.modules.weapons;
    
    // Equip Demon Slayer set (focus: weapon damage + lifesteal)
    gear.equipByName('helmet', 'gore_spattered');
    gear.equipByName('jacket', 'demon_hunter');
    gear.equipByName('pants', 'hunter');
    gear.equipByName('shoes', 'demon_steps');
    gear.equipByName('skateboard', 'demon_deck');
    
    // Add weapon enchant
    gear.equipByName('weapon', 'lightning_rune');
    
    // Equip actual weapon
    weapons.equipWeapon('primary', 'magic_missile');
    
    // Check final stats
    const stats = gear.getStats();
    console.log('Final weapon damage:', stats.weaponDamage);  // ~2.24× damage!
    console.log('Final crit chance:', stats.critChance);      // ~55%
    console.log('Final lifesteal:', stats.lifesteal);         // ~35%
    
    // Your magic missiles now:
    // - Hit 2.24× harder
    // - Have 55% crit chance
    // - Heal you for 35% of damage dealt
    // - Projectiles move 50% faster
}
```

---

## 🎨 Custom Gear Loading (Your Loader Pattern)

### **When to Use Loaders vs Runtime Creation**

**Use Loaders When:**
- ✅ Loading user-created gear from editors
- ✅ Gear has complex visual data (colors, decals, 3D elements)
- ✅ Need to save/load from localStorage
- ✅ Gear is customizable by players

**Use Runtime Creation When:**
- ✅ Gear is defined in level code
- ✅ Stats are more important than visuals
- ✅ Procedural gear generation
- ✅ Loot drops or random gear

### **Integrating Your HelmetLoader**

```javascript
// In your level file

import { HelmetLoader } from './helmet_loader.js';

onLevelStart: (core) => {
    const gear = core.modules.gear;
    
    // Option 1: Use loader for custom visual helmet
    const helmetLoader = new HelmetLoader(
        core.scene,
        core.player
    );
    helmetLoader.loadHelmet(); // Loads from localStorage
    
    // Get the stats from loaded helmet
    const helmetData = helmetLoader.currentHelmetData;
    
    // Create gear data with stats
    const customHelmet = {
        name: helmetData.name || 'Custom Helmet',
        defense: 10,  // Base defense
        bonuses: {
            speed: 1.1,  // Example bonus
            // Add more based on helmet type
        },
        visual: 'custom',  // Flag for custom visual
        customLoader: helmetLoader  // Store reference
    };
    
    // Equip it
    gear.equip('helmet', customHelmet);
    
    // Option 2: Just use runtime gear
    gear.equipByName('jacket', 'demon_hunter');
    gear.equipByName('pants', 'hunter');
}
```

### **Creating a Generic Gear Loader**

```javascript
// gear_loader.js
class GearLoader {
    constructor(scene, playerObject) {
        this.scene = scene;
        this.playerObject = playerObject;
        this.gearType = null;  // 'helmet', 'jacket', etc.
    }
    
    loadGear(gearType, slotNumber = 1) {
        this.gearType = gearType;
        
        // Load from localStorage
        const saved = localStorage.getItem(`${gearType}_slot_${slotNumber}`);
        
        if (!saved) {
            return this.getDefaultGear(gearType);
        }
        
        try {
            const data = JSON.parse(saved);
            return this.buildGear(data);
        } catch (error) {
            console.error('Failed to load gear:', error);
            return this.getDefaultGear(gearType);
        }
    }
    
    buildGear(data) {
        // Create 3D mesh based on data
        const mesh = this.createMesh(data);
        
        // Attach to player
        this.playerObject.add(mesh);
        
        // Return gear data for ApplesauceGear
        return {
            name: data.name,
            defense: data.defense || 5,
            bonuses: data.bonuses || {},
            visual: 'custom',
            visualMesh: mesh
        };
    }
    
    createMesh(data) {
        // Your 3D creation logic
        // Similar to your HelmetLoader
    }
    
    getDefaultGear(type) {
        const defaults = {
            helmet: { name: 'Basic Helmet', defense: 5, bonuses: {} },
            jacket: { name: 'Basic Jacket', defense: 10, bonuses: {} },
            pants: { name: 'Basic Pants', defense: 8, bonuses: {} },
            shoes: { name: 'Basic Shoes', defense: 4, bonuses: {} },
            skateboard: { name: 'Basic Board', defense: 0, bonuses: { trickPower: 1.0 } }
        };
        
        return defaults[type] || defaults.helmet;
    }
}
```

---

## 💡 Complete Workflow Examples

### **Example 1: Pure Runtime Gear (No Loaders)**

```javascript
// Simple setup with library gear
onLevelStart: (core) => {
    const gear = core.modules.gear;
    const weapons = core.modules.weapons;
    
    // Equip Shadow Strike set for speed + crits
    gear.equipByName('helmet', 'assassin');
    gear.equipByName('jacket', 'shadow_cloak');
    gear.equipByName('pants', 'ninja');
    gear.equipByName('shoes', 'shadow_walkers');
    gear.equipByName('skateboard', 'assassin_blade');
    gear.equipByName('weapon', 'lightning_rune');
    
    // Equip fast weapon
    weapons.equipWeapon('primary', 'magic_missile');
    
    // Result: Super fast, high crit build
    const stats = gear.getStats();
    console.log('Attack speed:', stats.weaponCooldown);  // 0.6× (40% faster!)
    console.log('Crit chance:', stats.critChance);       // 60%
    console.log('Movement speed:', stats.speed);         // 1.65×
}
```

### **Example 2: Mixed Custom + Runtime**

```javascript
// Load custom helmet, use runtime for rest
onLevelStart: (core) => {
    const gear = core.modules.gear;
    
    // Load custom helmet (from editor)
    const helmetLoader = new HelmetLoader(core.scene, core.player);
    helmetLoader.loadHelmet();
    
    const customHelmet = {
        name: helmetLoader.currentHelmetData.name,
        defense: 12,
        bonuses: {
            healthRegen: 3,
            weaponDamage: 1.15
        },
        visual: 'custom',
        loader: helmetLoader
    };
    
    gear.equip('helmet', customHelmet);
    
    // Use runtime gear for everything else
    gear.equipByName('jacket', 'demon_hunter');
    gear.equipByName('pants', 'hunter');
    gear.equipByName('shoes', 'demon_steps');
    gear.equipByName('skateboard', 'demon_deck');
}
```

### **Example 3: Procedural Gear (Loot Drops)**

```javascript
// Generate random gear
function generateRandomGear(gearType) {
    const rarities = ['common', 'rare', 'epic', 'legendary'];
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    
    const baseDefense = {
        common: 5,
        rare: 10,
        epic: 20,
        legendary: 35
    };
    
    const bonusCount = {
        common: 1,
        rare: 2,
        epic: 3,
        legendary: 4
    };
    
    const possibleBonuses = [
        { stat: 'speed', value: 1.1 + Math.random() * 0.2 },
        { stat: 'weaponDamage', value: 1.1 + Math.random() * 0.3 },
        { stat: 'healthRegen', value: Math.floor(Math.random() * 5) + 1 },
        { stat: 'critChance', value: Math.floor(Math.random() * 20) + 5 },
        { stat: 'lifesteal', value: Math.floor(Math.random() * 15) + 5 }
    ];
    
    // Pick random bonuses
    const bonuses = {};
    for (let i = 0; i < bonusCount[rarity]; i++) {
        const bonus = possibleBonuses[Math.floor(Math.random() * possibleBonuses.length)];
        bonuses[bonus.stat] = bonus.value;
    }
    
    return {
        name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${gearType}`,
        defense: baseDefense[rarity],
        bonuses: bonuses,
        rarity: rarity
    };
}

// Use in level
onLevelStart: (core) => {
    const gear = core.modules.gear;
    
    // Generate random set
    ['helmet', 'jacket', 'pants', 'shoes', 'skateboard'].forEach(slot => {
        const randomGear = generateRandomGear(slot);
        gear.equip(slot, randomGear);
    });
    
    console.log('Random gear equipped!');
    console.log(gear.getEquipped());
}
```

### **Example 4: Gear Shop System**

```javascript
// Simple gear shop
class GearShop {
    constructor(gearModule) {
        this.gear = gearModule;
        this.inventory = [
            { type: 'helmet', name: 'gore_spattered', price: 500 },
            { type: 'jacket', name: 'demon_hunter', price: 750 },
            { type: 'weapon', name: 'fire_rune', price: 1000 },
            { type: 'skateboard', name: 'demon_deck', price: 1200 }
        ];
    }
    
    buyGear(itemIndex, playerGold) {
        const item = this.inventory[itemIndex];
        
        if (!item) return false;
        if (playerGold < item.price) {
            console.log('Not enough gold!');
            return false;
        }
        
        // Purchase and equip
        this.gear.equipByName(item.type, item.name);
        
        console.log(`✅ Purchased ${item.name} for ${item.price} gold`);
        return true;
    }
}

// Use in level
onLevelStart: (core) => {
    const shop = new GearShop(core.modules.gear);
    
    // Bind to UI buttons
    document.getElementById('buy-helmet').onclick = () => {
        shop.buyGear(0, core.state.gold);
    };
}
```

---

## 🎯 Best Practices

### **1. Stat Inheritance**

```javascript
// GOOD: Stats cascade properly
gear.equip('helmet', myHelmet);  // +20% weapon damage
gear.equip('weapon', fireRune);  // +30% weapon damage
// Result: 1.2 × 1.3 = 1.56× total weapon damage

// BAD: Don't manually apply stats
weapons.equipped.primary.damage *= 1.2;  // Breaks gear system!
```

### **2. Recalculation Timing**

```javascript
// GOOD: Equip all gear, then recalculate once
gear.equip('helmet', h1);
gear.equip('jacket', j1);
gear.equip('pants', p1);
// Recalculation happens automatically after each equip

// BETTER: Batch equip if implementing
gear.equipSet([
    { slot: 'helmet', gear: h1 },
    { slot: 'jacket', gear: j1 },
    { slot: 'pants', gear: p1 }
]);  // Recalculate once at end
```

### **3. Loader vs Runtime Decision**

```javascript
// Use loader when:
if (needsCustomVisuals && hasLocalStorage && isPlayerCreated) {
    const loader = new GearLoader(scene, player);
    const customGear = loader.loadGear('helmet', slotNum);
    gear.equip('helmet', customGear);
}

// Use runtime when:
if (levelDefined || proceduralGeneration || justNeedStats) {
    gear.equipByName('helmet', 'gore_spattered');
}
```

### **4. Set Bonus Optimization**

```javascript
// GOOD: Check which sets you're close to completing
const setCounts = {};
Object.values(gear.equipped).forEach(item => {
    if (item && item.setName) {
        setCounts[item.setName] = (setCounts[item.setName] || 0) + 1;
    }
});

console.log('Set progress:', setCounts);
// e.g., { "Demon Slayer": 3, "Velocity": 1 }
// You need 2 more Demon Slayer pieces for 5-piece bonus!
```

---

## 🐛 Troubleshooting

### **Issue: Gear doesn't affect weapons**

**Cause:** applyStatsToModules() not called or weapons not initialized

**Fix:**
```javascript
// Make sure weapons are initialized first
weapons.init();
gear.init();

// Or manually trigger
gear.recalculateStats();
gear.applyStatsToModules();
```

### **Issue: Set bonuses not working**

**Cause:** Gear missing setName property

**Fix:**
```javascript
// Make sure gear has setName
const myGear = {
    name: "Custom Helmet",
    defense: 10,
    bonuses: { speed: 1.2 },
    setName: "Demon Slayer"  // <-- Add this!
};
```

### **Issue: Custom loader gear doesn't show stats**

**Cause:** Loader returns visual data but no game stats

**Fix:**
```javascript
// Loader should return game-compatible format
const customGear = {
    name: visualData.name,
    defense: 10,  // Add game stats
    bonuses: {    // Add bonuses
        speed: 1.15
    },
    visual: 'custom',
    visualMesh: mesh  // Attach visual separately
};
```

---

## 📊 Stat Reference

### **Multiplicative Stats** (multiply together)
- speed
- trickPower
- jumpPower
- airControl
- grindBonus
- weaponDamage
- weaponCooldown
- weaponRange
- weaponSpeed
- stamina

**Example:** 1.2× from helmet + 1.3× from jacket = 1.56× total

### **Additive Stats** (add together)
- defense
- healthRegen
- critChance
- lifesteal

**Example:** 10 from helmet + 15 from jacket = 25 total

---

## 🎊 Summary

**Gear System Flow:**
```
1. Create gear (library, loader, or procedural)
2. Equip gear to slots
3. Stats auto-recalculate
4. Stats apply to player AND weapons
5. Enjoy bonuses!
```

**What You Get:**
- ✅ 6 equipment slots
- ✅ 30+ pre-made items
- ✅ 4 complete gear sets with bonuses
- ✅ Weapon stat modification
- ✅ Support for custom loaders
- ✅ Procedural gear generation
- ✅ Set bonus system

**Gear affects:**
- ✅ Player movement (speed, jump, control)
- ✅ Player defense (damage reduction)
- ✅ Player survival (health regen)
- ✅ Weapon damage (multipliers)
- ✅ Weapon speed (cooldown, projectile speed)
- ✅ Weapon effects (crit, lifesteal)

**Your helmet loader pattern is perfect for custom visual gear!** Use it alongside the gear system for the best of both worlds - custom visuals + game stats! 🎮✨
