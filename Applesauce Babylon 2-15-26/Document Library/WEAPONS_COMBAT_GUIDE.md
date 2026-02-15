# APPLESAUCE WEAPONS, ENEMIES & COLLISION GUIDE
## Complete Combat System Integration

---

## 🎯 Understanding Different Collision Types

Your game actually uses **4 DIFFERENT collision systems** that all work together:

### **1. Player → Enemy Collision** (Speed-Based Kills)
- **Type:** Distance check (sphere-to-sphere)
- **System:** `ApplesauceCollision.checkEnemyCollisions()`
- **When:** Player skates into enemy at speed
- **Result:** Roadkill! Gore effects, score bonus

```javascript
// Collision module checks distance each frame
const dist = playerPos.distanceTo(enemy.position);
if (dist < killRadius && speed > minKillSpeed) {
    // ROADKILL!
}
```

### **2. Player → Level Objects** (Blocking/Redirecting)
- **Type:** Bounding box intersection
- **System:** `ApplesauceCollision.checkLevelCollisions()`
- **When:** Player hits walls, ramps, boxes
- **Result:** Block movement, launch from ramps, grind on rails

```javascript
// Check box intersection
const playerBox = new THREE.Box3().setFromObject(player);
const wallBox = new THREE.Box3().setFromObject(wall);
if (playerBox.intersectsBox(wallBox)) {
    // Block, redirect, or grind
}
```

### **3. Projectiles → Enemies** (Magic Weapons)
- **Type:** Distance check per projectile
- **System:** `ApplesauceCollision.checkProjectileCollision()`
- **When:** Magic missile, fireball hits enemy
- **Result:** Enemy dies, gore effects

```javascript
// Each projectile checks all enemies
for (let enemy of enemies) {
    const dist = projectile.position.distanceTo(enemy.position);
    if (dist < projectileRadius) {
        // HIT!
    }
}
```

### **4. Rays → Enemies** (Instant Hit)
- **Type:** Line-to-sphere intersection
- **System:** `ApplesauceWeapons.checkRayHits()`
- **When:** Laser beam, lightning bolt fired
- **Result:** Instant hit, multiple enemies if pierce

```javascript
// Check if enemy is on the ray line
const closestPoint = getClosestPointOnLine(rayStart, rayEnd, enemyPos);
const dist = enemyPos.distanceTo(closestPoint);
if (dist < hitRadius) {
    // HIT!
}
```

### **5. Area of Effect → Enemies** (Explosions)
- **Type:** Radius check from center point
- **System:** `ApplesauceCollision.explosionDamage()`
- **When:** Fireball explodes, shockwave triggers
- **Result:** All enemies in radius die

```javascript
// Check all enemies in radius
for (let enemy of enemies) {
    const dist = explosion.position.distanceTo(enemy.position);
    if (dist < explosionRadius) {
        // Damage based on distance
        const damage = maxDamage * (1 - dist / radius);
    }
}
```

---

## 🔧 System Integration

### **How They Work Together:**

```
┌─────────────────────────────────────────┐
│        APPLESAUCE CORE ENGINE           │
│                                         │
│  ┌────────────────────────────────┐    │
│  │   ApplesauceCollision          │    │
│  │   - Enemy collision (roadkill) │    │
│  │   - Level collision (walls)    │    │
│  │   - Projectile hit detection   │◄───┼── Used by Weapons
│  │   - Explosion damage           │    │
│  │   - Board swing attacks        │    │
│  └────────────────────────────────┘    │
│           ▲                             │
│           │ checks                      │
│           │                             │
│  ┌────────┴───────────┐  ┌───────────┐ │
│  │ ApplesauceEnemies  │  │  Weapons  │ │
│  │ - Enemy AI         │  │  - Magic  │ │
│  │ - Spawning         │  │  - Melee  │ │
│  │ - Health/Death     │  │  - AoE    │ │
│  └────────────────────┘  └───────────┘ │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Start Integration

### **Step 1: Add to Your Core Engine**

```javascript
// In applesauce-core-3.js

// Add imports
import { ApplesauceCollision } from './collision/applesauce-collision-enhanced.js';
import { ApplesauceEnemies } from './enemies/applesauce-enemies-enhanced.js';
import { ApplesauceWeapons } from './weapons/applesauce-weapons.js';

// In constructor modules:
this.modules = {
    collision: null,
    enemies: null,
    weapons: null,
    // ... other modules
};

// In constructor initialization:
this.modules.collision = new ApplesauceCollision(this);
this.modules.enemies = new ApplesauceEnemies(this);
this.modules.weapons = new ApplesauceWeapons(this);

// In init() or loadLevel():
this.modules.collision.init();
this.modules.enemies.init();  // If needed
this.modules.weapons.init();

// In update loop:
if (this.modules.collision) {
    this.modules.collision.update(this);
}
if (this.modules.enemies) {
    this.modules.enemies.update(this);
}
if (this.modules.weapons) {
    this.modules.weapons.update(deltaTime);
}
```

### **Step 2: Setup Controls**

```javascript
// In your controls setup
window.addEventListener('keydown', (e) => {
    if (e.key === 'q') {
        // Primary attack (magic missile)
        core.modules.weapons.attackPrimary();
    }
    if (e.key === 'e') {
        // Secondary attack (shockwave)
        core.modules.weapons.attackSecondary();
    }
    if (e.key === 'f') {
        // Melee attack (board swing)
        core.modules.weapons.attackMelee();
    }
});
```

### **Step 3: Spawn Enemies in Levels**

```javascript
onLevelStart: (core) => {
    const enemies = core.modules.enemies;
    
    // Spawn a line of enemies
    enemies.spawnLine(
        0,      // X position
        -30,    // Z start
        10,     // Count
        5       // Spacing
    );
    
    // Spawn a boss
    enemies.spawnBoss({
        position: { x: 0, y: 0, z: -100 },
        health: 1000,
        behavior: 'chase'
    });
}
```

---

## ⚔️ Weapon Types & Usage

### **Projectile Weapons** (Magic Missiles, Fireballs)

**How They Work:**
1. Fire creates a 3D mesh that moves through space
2. Each frame, check if projectile overlaps any enemy
3. On hit: deal damage, create gore, remove projectile (unless pierce)

**Example:**
```javascript
// Equip magic missile
weapons.equipWeapon('primary', 'magic_missile');

// Fire it
weapons.attackPrimary();

// What happens:
// 1. Creates glowing sphere mesh
// 2. Moves forward at weapon.speed
// 3. Checks collision each frame
// 4. On hit: enemy.alive = false, gore effects
```

**Weapon Options:**
```javascript
magic_missile   // Basic fast projectile
fireball        // Slower, explodes on hit
ice_shard       // Fast, pierces enemies
seeking_orb     // Homes in on nearest enemy
```

**Homing Projectiles:**
```javascript
// Seeking orbs automatically track enemies
if (weapon.homing) {
    // Find nearest enemy within 20 units
    // Steer projectile towards them
}
```

### **Ray Weapons** (Lasers, Lightning)

**How They Work:**
1. Instant hit - no travel time
2. Creates line from player to max range
3. Checks which enemies intersect the line
4. Deals damage immediately

**Example:**
```javascript
// Equip laser beam
weapons.equipWeapon('primary', 'laser_beam');

// Fire it
weapons.attackPrimary();

// What happens:
// 1. Creates line from player forward
// 2. Checks all enemies along line
// 3. Instant hit - no projectile movement
// 4. Visual beam fades out quickly
```

**Weapon Options:**
```javascript
laser_beam       // Continuous beam, pierces
lightning_bolt   // High damage, chains to nearby enemies
```

**Chain Lightning:**
```javascript
// Lightning can jump between enemies
if (weapon.chain) {
    // After hitting enemy 1
    // Find nearest enemy to enemy 1
    // Jump to that enemy
    // Repeat up to weapon.chain times
}
```

### **Area of Effect** (Explosions, Shockwaves)

**How They Work:**
1. Creates expanding sphere at position
2. When reaches target size, damages all enemies in radius
3. Visual effect expands and fades

**Example:**
```javascript
// Equip shockwave
weapons.equipWeapon('secondary', 'shockwave');

// Fire it
weapons.attackSecondary();

// What happens:
// 1. Creates small sphere at player
// 2. Sphere expands outward
// 3. At full size: damage all enemies in radius
// 4. Sphere fades away
```

**Weapon Options:**
```javascript
shockwave    // Medium radius, knockback
explosion    // Large radius, high damage
ice_nova     // Very large, slows enemies
```

### **Melee Weapons** (Board Swing)

**How They Work:**
1. Checks arc in front of player
2. Damages all enemies in that arc
3. Creates slash visual effect

**Example:**
```javascript
// Board swing is default melee
weapons.attackMelee();

// What happens:
// 1. Creates 90° arc in front of player
// 2. Checks enemies within range
// 3. Damages all in arc
// 4. Creates slash visual
```

---

## 🎮 Complete Usage Examples

### **Example 1: Magic Missile Spam**

```javascript
// Level with lots of enemies for magic practice
onLevelStart: (core) => {
    const enemies = core.modules.enemies;
    const weapons = core.modules.weapons;
    
    // Equip fast magic missile
    weapons.equipWeapon('primary', 'magic_missile');
    
    // Spawn lots of stationary targets
    enemies.spawnGrid(
        0, -50,   // Center
        5, 8,     // 5 rows, 8 cols
        5,        // Spacing
        { behavior: 'static' }
    );
    
    console.log('🎯 Magic practice! Press Q to fire');
}

// In update loop or controls:
if (keys['q'] && core.modules.weapons.cooldowns.primary === 0) {
    core.modules.weapons.attackPrimary();
}
```

### **Example 2: Homing Missiles vs Boss**

```javascript
onLevelStart: (core) => {
    const enemies = core.modules.enemies;
    const weapons = core.modules.weapons;
    
    // Equip homing orb
    weapons.equipWeapon('primary', 'seeking_orb');
    
    // Spawn tough boss
    const boss = enemies.spawnBoss({
        position: { x: 0, y: 0, z: -80 },
        health: 2000,
        speed: 0.05,
        behavior: 'chase'
    });
    
    console.log('💀 Boss fight! Seeking orbs will track the boss');
}
```

### **Example 3: Explosive Fireball Chain Reactions**

```javascript
onLevelStart: (core) => {
    const enemies = core.modules.enemies;
    const weapons = core.modules.weapons;
    
    // Equip explosive fireball
    weapons.equipWeapon('primary', 'fireball');
    
    // Spawn tight clusters
    for (let i = 0; i < 5; i++) {
        enemies.spawnCluster(
            (i - 2) * 15,  // X
            -40 - (i * 20), // Z
            8,              // Count
            3               // Tight radius for chain reactions
        );
    }
    
    console.log('💣 Fireball chains! Hit one to blow them all up');
}

// Fireball explodes on hit, damaging nearby enemies
// If enemies are close together, creates chain reaction!
```

### **Example 4: Lightning Storm**

```javascript
onLevelStart: (core) => {
    const enemies = core.modules.enemies;
    const weapons = core.modules.weapons;
    
    // Equip chain lightning
    weapons.equipWeapon('primary', 'lightning_bolt');
    
    // Spawn enemies in a line for chaining
    enemies.spawnLine(0, -30, 15, 4);
    enemies.spawnLine(-10, -35, 12, 4);
    enemies.spawnLine(10, -35, 12, 4);
    
    console.log('⚡ Chain lightning! Hit one to zap multiple');
}

// Lightning chains to up to 3 nearby enemies
// Perfect for tightly packed groups
```

### **Example 5: Mixed Combat**

```javascript
onLevelStart: (core) => {
    const enemies = core.modules.enemies;
    const weapons = core.modules.weapons;
    
    // Setup loadout
    weapons.equipWeapon('primary', 'magic_missile');  // Q key
    weapons.equipWeapon('secondary', 'explosion');     // E key
    // Board swing is default melee (F key)
    
    // Different enemy types
    // Close enemies - use melee
    enemies.spawnCluster(5, -20, 5, 3, {
        behavior: 'static'
    });
    
    // Mid-range enemies - use missiles
    enemies.spawnLine(0, -40, 10, 5, {
        behavior: 'wander'
    });
    
    // Distant cluster - use explosion
    enemies.spawnCluster(0, -80, 15, 8, {
        behavior: 'chase'
    });
    
    console.log('⚔️ Mixed combat!');
    console.log('  Q - Magic missile (ranged)');
    console.log('  E - Explosion (AoE)');
    console.log('  F - Board swing (melee)');
}
```

### **Example 6: Enemy Gauntlet**

```javascript
onLevelStart: (core) => {
    const enemies = core.modules.enemies;
    const weapons = core.modules.weapons;
    
    // Full loadout
    weapons.equipWeapon('primary', 'seeking_orb');
    weapons.equipWeapon('secondary', 'shockwave');
    
    // Wave 1: Stragglers
    enemies.spawnLine(-15, -30, 5, 8, {
        behavior: 'flee',
        speed: 0.03
    });
    
    // Wave 2: Chasers
    enemies.spawnCluster(0, -60, 10, 10, {
        behavior: 'chase',
        speed: 0.025
    });
    
    // Wave 3: Boss
    setTimeout(() => {
        enemies.spawnBoss({
            position: { x: 0, y: 0, z: -100 },
            health: 1500,
            color: 0xFF0000
        });
        console.log('💀 BOSS SPAWNED!');
    }, 15000); // 15 seconds
    
    console.log('🎮 Survive the gauntlet!');
}
```

---

## 🎨 Customizing Weapons

### **Create Your Own Weapon**

```javascript
// In your level or game code
const myWeapon = weapons.createWeapon('custom_type');

// Or define inline
weapons.equipped.primary = {
    type: 'projectile',
    name: 'Shadow Bolt',
    damage: 75,
    speed: 1.2,
    size: 0.4,
    color: 0x9400D3,  // Purple
    cooldown: 25,
    lifetime: 200,
    pierce: true,
    homing: false,
    mana: 12,
    // Custom behavior
    onHit: (enemy, position) => {
        // Spawn mini explosions
        weapons.createExplosion(position, 2);
    }
};
```

### **Modify Existing Weapon**

```javascript
// Make magic missile faster
const missile = weapons.createWeapon('magic_missile');
missile.speed = 2.5;  // Much faster!
missile.cooldown = 10; // Rapid fire!
weapons.equipped.primary = missile;
```

### **Weapon Stats**

```javascript
// Get weapon statistics
const stats = weapons.getStats();
console.log(`Projectiles fired: ${stats.projectilesFired}`);
console.log(`Projectile hits: ${stats.projectileHits}`);
console.log(`Accuracy: ${stats.projectileHits / stats.projectilesFired * 100}%`);
console.log(`Total kills: ${stats.totalKills}`);
```

---

## 🐛 Troubleshooting

### **Issue: Projectiles pass through enemies**

**Cause:** Collision check not happening or projectile too fast

**Fix:**
```javascript
// Increase projectile hitbox
const weapon = weapons.createWeapon('magic_missile');
weapon.size = 0.5; // Bigger hitbox

// OR slow down projectile
weapon.speed = 0.8; // Slower = easier to hit
```

### **Issue: Rays don't hit anything**

**Cause:** Line-to-sphere intersection failing or range too short

**Fix:**
```javascript
// Increase ray range
const laser = weapons.createWeapon('laser_beam');
laser.range = 100; // Much longer

// Check if enemies are actually in front
console.log('Player rotation:', core.state.rotation);
console.log('Enemy position:', enemy.mesh.position);
```

### **Issue: AoE hits nothing**

**Cause:** Radius too small or damage dealt before expansion complete

**Fix:**
```javascript
// Increase radius
const shockwave = weapons.createWeapon('shockwave');
shockwave.radius = 15; // Bigger area

// Check damage timing
console.log('AoE current radius:', aoe.currentRadius);
console.log('AoE target radius:', aoe.targetRadius);
```

### **Issue: Weapons attack when they shouldn't**

**Cause:** Cooldown not being respected

**Fix:**
```javascript
// Always check cooldown before attacking
if (weapons.cooldowns.primary === 0) {
    weapons.attackPrimary();
}

// Cooldowns auto-decrement in update loop
// Make sure weapons.update(deltaTime) is called!
```

### **Issue: No gore effects on weapon kills**

**Cause:** Gore module not initialized or not called

**Fix:**
```javascript
// Make sure gore module exists
if (!core.modules.gore) {
    console.error('Gore module not loaded!');
}

// Collision system handles gore automatically
// Just make sure it's enabled:
if (core.modules.collision) {
    core.modules.collision.goreModule = core.modules.gore;
}
```

---

## 📊 Performance Tips

### **Managing Projectiles**

```javascript
// Limit max projectiles
const MAX_PROJECTILES = 50;

if (weapons.projectiles.length < MAX_PROJECTILES) {
    weapons.attackPrimary();
} else {
    console.log('Too many projectiles!');
}
```

### **Optimizing Enemy Checks**

```javascript
// Spatial partitioning (advanced)
// Group enemies by region
const nearbyEnemies = enemies.getEnemiesInRadius(
    player.position,
    50  // Only check enemies within 50 units
);

// Only check collisions with nearby enemies
```

### **Reducing Visual Effects**

```javascript
// Lower quality mode
if (lowPerformanceMode) {
    // Fewer particles
    weapon.particleCount = 10;  // Instead of 30
    
    // Shorter lifetimes
    projectile.lifetime = 60;   // Instead of 180
    
    // Simpler meshes
    weapon.segments = 4;        // Instead of 8
}
```

---

## 🎓 Advanced Techniques

### **Custom Projectile Behavior**

```javascript
// Projectile that spawns more projectiles
class ClusterMissile {
    onHit(enemy, position, weapons) {
        // Spawn 5 small missiles in circle
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const dir = new THREE.Vector3(
                Math.cos(angle),
                0,
                Math.sin(angle)
            );
            
            // Create sub-projectile
            // (would need to extend weapons system)
        }
    }
}
```

### **Charged Attacks**

```javascript
// Hold to charge, release to fire
let chargeTime = 0;
const MAX_CHARGE = 60; // 1 second

window.addEventListener('keydown', (e) => {
    if (e.key === 'q') {
        // Start charging
        chargeInterval = setInterval(() => {
            chargeTime = Math.min(chargeTime + 1, MAX_CHARGE);
        }, 16);
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'q') {
        clearInterval(chargeInterval);
        
        // Fire with power based on charge
        const weapon = weapons.createWeapon('fireball');
        weapon.damage *= (1 + chargeTime / MAX_CHARGE);
        weapon.size *= (1 + chargeTime / MAX_CHARGE * 0.5);
        
        weapons.equipped.primary = weapon;
        weapons.attackPrimary();
        
        chargeTime = 0;
    }
});
```

### **Combo System**

```javascript
// Different attack based on last attack
let lastAttack = null;
let comboTimer = 0;

function attack() {
    if (comboTimer > 0 && lastAttack === 'primary') {
        // Combo! Do special attack
        weapons.equipWeapon('primary', 'explosion');
        weapons.attackPrimary();
        lastAttack = 'combo';
    } else {
        // Normal attack
        weapons.equipWeapon('primary', 'magic_missile');
        weapons.attackPrimary();
        lastAttack = 'primary';
    }
    
    comboTimer = 30; // 0.5 second window
}

// In update loop
if (comboTimer > 0) comboTimer--;
```

---

## 🎯 Best Practices

1. **Check cooldowns before attacking**
```javascript
if (weapons.cooldowns.primary === 0) {
    weapons.attackPrimary();
}
```

2. **Initialize all modules in order**
```javascript
collision.init();  // First - others depend on it
enemies.init();
weapons.init();
```

3. **Update modules every frame**
```javascript
collision.update(core);
enemies.update(core);
weapons.update(deltaTime);
```

4. **Clear on level change**
```javascript
enemies.clear();
weapons.clear();
```

5. **Use appropriate weapon for situation**
```javascript
// Close range: melee or AoE
// Mid range: projectiles
// Long range: rays
// Groups: AoE or piercing projectiles
```

---

## 🎊 Summary

**You Now Have:**
- ✅ 5 different collision types (player-enemy, player-level, projectile-enemy, ray-enemy, AoE-enemy)
- ✅ 4 weapon attack types (projectile, ray, AoE, melee)
- ✅ Enhanced enemy system with AI behaviors
- ✅ Full integration between all systems
- ✅ Gore effects on all kill types
- ✅ Complete weapon customization
- ✅ Boss enemies with special behaviors

**Collision Flow:**
```
Player Input → Weapons System → Creates Attack
           ↓
Attack moves/appears → Collision System checks
           ↓
Hit detected → Enemy dies → Gore effects → Score
```

**Everything is modular and works together automatically!** 🎮💥
