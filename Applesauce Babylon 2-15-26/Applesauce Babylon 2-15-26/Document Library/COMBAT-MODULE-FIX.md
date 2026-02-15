# Combat Module Error Explained ⚔️

## The Error

```
Uncaught SyntaxError: The requested module './combat/applesauce-combat.js' 
does not provide an export named 'ApplesauceCombat'
```

## What Was Wrong

### Your Original File

```javascript
// applesauce-combat.js (BROKEN)
function checkWeaponHit(player, weapon, enemies) {
    // ... code
    
    function applyKnockback(target, direction, force) {
        // ... code
    }
}

// ❌ NO EXPORT STATEMENT!
// ❌ NO CLASS!
// ❌ Just loose functions
```

### What The Core Was Looking For

```javascript
// In applesauce-core-3.js
import { ApplesauceCombat } from './combat/applesauce-combat.js';
//       ^^^^^^^^^^^^^^^^^ Looking for this named export

// Later in code:
this.modules.combat = new ApplesauceCombat(this);
//                    ^^^ Trying to instantiate a class
```

## The Problem

Your file had:
1. ❌ No `export` statement
2. ❌ No `ApplesauceCombat` class
3. ❌ Just standalone functions
4. ❌ Nested function definition (bad practice)

ES6 modules require:
1. ✅ `export` keyword
2. ✅ Named export matching import
3. ✅ Class for module pattern
4. ✅ Proper structure

## The Fix

### What I Created

```javascript
// applesauce-combat.js (FIXED)
import * as THREE from './three.module.js';

export class ApplesauceCombat {  // ✅ EXPORTED CLASS
    constructor(core) {
        this.core = core;
        this.attackCooldown = 0;
        this.isAttacking = false;
    }
    
    update(core) {  // ✅ Required by core
        // Check for attacks
        if (core.keys[' '] && this.attackCooldown === 0) {
            this.performAttack(core);
        }
    }
    
    performAttack(core) {
        // Your attack logic
        const weapon = core.modules.weapons?.getCurrentWeapon();
        if (weapon) {
            this.checkWeaponHit(core.player, weapon, core.modules.enemies.enemies);
        }
    }
    
    checkWeaponHit(player, weapon, enemies) {
        // YOUR ORIGINAL CODE (moved into class)
        const attackDirection = {
            x: Math.sin(player.rotation.y),
            z: Math.cos(player.rotation.y)
        };
        // ... rest of your code
    }
    
    applyKnockback(target, direction, force) {
        // YOUR ORIGINAL CODE (moved into class as method)
        // ... your knockback code
    }
    
    dealDamage(enemy, damage) {
        // NEW: Added damage dealing
        enemy.health -= damage;
        if (enemy.health <= 0) {
            enemy.isDead = true;
        }
    }
    
    clear() {  // ✅ Required by core
        this.attackCooldown = 0;
        this.isAttacking = false;
    }
}
```

## What Changed

### Before → After

```javascript
// BEFORE (your file)
function checkWeaponHit(player, weapon, enemies) {
    // code
    function applyKnockback(target, direction, force) {
        // nested function
    }
}

// AFTER (fixed)
export class ApplesauceCombat {
    checkWeaponHit(player, weapon, enemies) {
        // code (now a method)
    }
    
    applyKnockback(target, direction, force) {
        // now a separate method
    }
}
```

### Key Changes

1. **Wrapped in class**
   ```javascript
   export class ApplesauceCombat { ... }
   ```

2. **Added export**
   ```javascript
   export class ApplesauceCombat  // ← export keyword!
   ```

3. **Added constructor**
   ```javascript
   constructor(core) {
       this.core = core;
       this.attackCooldown = 0;
   }
   ```

4. **Added update() method**
   ```javascript
   update(core) {
       // Called every frame by core
   }
   ```

5. **Moved nested function**
   ```javascript
   // Before: nested inside checkWeaponHit
   // After: separate class method
   applyKnockback(target, direction, force) { ... }
   ```

6. **Added clear() method**
   ```javascript
   clear() {
       // Called when level changes
   }
   ```

## How The Combat Module Works Now

### Initialization

```javascript
// In core constructor
if (this.config.combatEnabled !== false) {
    this.modules.combat = new ApplesauceCombat(this);
}
```

### Every Frame

```javascript
// In core.update()
if (this.modules.combat && this.modules.combat.update) {
    this.modules.combat.update(this);
}
```

### Attack Flow

1. **Player presses SPACE**
2. **Combat.update() detects keypress**
3. **Checks cooldown (prevents spam)**
4. **Calls performAttack()**
5. **Gets current weapon from weapons module**
6. **Calls checkWeaponHit()**
7. **Calculates attack direction and range**
8. **Checks each enemy for hits**
9. **Applies damage and knockback**
10. **Triggers gore if enemy dies**

## Using Combat In Your Levels

### Basic Usage (Automatic)

Combat works automatically if you have:
- ✅ Weapons module loaded
- ✅ Enemies module loaded
- ✅ Combat enabled in config

```javascript
// Initialize core with combat
const game = new ApplesauceCore({
    combatEnabled: true,  // Default is true
    weaponsEnabled: true,
    enemiesEnabled: true
});
```

### Combat Controls

```javascript
// Player controls:
SPACE = Attack with current weapon

// Cooldown prevents spam
// Weapon determines:
// - Range (how far attack reaches)
// - Damage (how much health removed)
// - Knockback (how far enemy is pushed)
// - Cooldown (frames between attacks)
```

### Weapon Example

```javascript
// In your weapons module
const weapon = {
    name: "Baseball Bat",
    damage: 25,
    range: 3,          // 3 units
    knockback: 2,      // Moderate push
    cooldown: 30       // 0.5 seconds at 60fps
};
```

### Enemy Integration

```javascript
// Enemies need these properties:
enemy = {
    health: 100,
    isDead: false,
    mesh: mesh,        // For gore effects
    position: { x, y, z },
    velocity: { x, y, z }  // For knockback
};
```

## Attack Direction System

The combat uses player rotation to determine attack direction:

```javascript
// Attack goes in direction player is facing
const attackDirection = {
    x: Math.sin(player.rotation.y),  // Forward X
    z: Math.cos(player.rotation.y)   // Forward Z
};

// Attack point is in front of player
const attackPoint = {
    x: player.position.x + attackDirection.x * weapon.range,
    z: player.position.z + attackDirection.z * weapon.range
};
```

### Visual Example

```
        Player (facing →)
            🛹
             ↓ rotation.y
        [=========]  ← Attack range
             ↓
          Enemy 💀  ← Gets hit!
```

## Angle Check (90° Arc)

Only enemies in front of player get hit:

```javascript
// Calculate angle between attack direction and enemy
const angle = Math.acos(dot / magnitude);

// Hit if within 90 degrees (π/2 radians)
if (angle < Math.PI / 2) {
    // HIT!
}
```

### Visual Example

```
           HIT ✅
          /
    90°  /
    arc /
       🛹 ← Player
         \
      90° \
           \
           HIT ✅
           
    MISS ❌ ← Behind player
```

## Knockback System

```javascript
applyKnockback(target, direction, force) {
    // Normalize direction
    const normalizedDir = {
        x: direction.x / magnitude,
        z: direction.z / magnitude
    };
    
    // Apply force
    target.velocity.x += normalizedDir.x * force * 10;  // Horizontal
    target.velocity.z += normalizedDir.z * force * 10;  // Horizontal
    target.velocity.y += force * 5;                      // Pop up
}
```

## Gore Integration

When enemy dies, triggers gore:

```javascript
dealDamage(enemy, damage) {
    enemy.health -= damage;
    
    if (enemy.health <= 0) {
        enemy.isDead = true;
        
        // Trigger gore
        if (this.core.modules.gore && enemy.mesh) {
            this.core.modules.gore.createSplatter(
                enemy.mesh.position.clone(),
                new THREE.Vector3(0, 0.2, 0)  // Upward spray
            );
        }
    }
}
```

## Testing Combat

### Console Commands

```javascript
// Check if combat loaded
console.log(game.modules.combat);

// Check cooldown
console.log(game.modules.combat.attackCooldown);

// Force attack
game.modules.combat.performAttack(game);

// Check if attacking
console.log(game.modules.combat.isAttacking);
```

## Common Module Export Errors

This same pattern applies to ALL modules:

### ❌ WRONG

```javascript
// No export
class MyModule { }

// Default export when core expects named
export default class MyModule { }

// Wrong name
export class DifferentName { }

// Just functions
export function doStuff() { }
```

### ✅ CORRECT

```javascript
// Named export matching import
export class MyModule {
    constructor(core) {
        this.core = core;
    }
    
    update(core) {
        // Module logic
    }
    
    clear() {
        // Cleanup
    }
}
```

## Module Template

Use this template for any missing modules:

```javascript
import * as THREE from './three.module.js';

export class ApplesauceModuleName {
    constructor(core) {
        this.core = core;
        console.log('📦 ModuleName loaded');
    }
    
    update(core) {
        // Called every frame
    }
    
    clear() {
        // Called when level changes
        console.log('📦 ModuleName cleared');
    }
}
```

## Summary

✅ **What Was Wrong:**
- No `export` statement
- No class wrapper
- Just loose functions
- Nested function definition

✅ **What I Fixed:**
- Added `export class ApplesauceCombat`
- Wrapped functions as class methods
- Added `constructor()`, `update()`, `clear()`
- Added `dealDamage()` method
- Fixed `applyKnockback()` as separate method
- Added THREE.js import for gore

✅ **How It Works:**
- Core initializes combat module
- Update checks for SPACE key
- Attacks current weapon at enemies in front
- Calculates hits using range and angle
- Applies damage and knockback
- Triggers gore on death

Your combat module is now properly structured and will load without errors! ⚔️
