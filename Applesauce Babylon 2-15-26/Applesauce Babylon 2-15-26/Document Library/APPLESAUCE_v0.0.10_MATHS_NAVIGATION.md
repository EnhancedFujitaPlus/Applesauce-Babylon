# APPLESAUCE v0.0.10 - MATHS & NAVIGATION GUIDE
## Architectural Organization for Modular Game Systems

---

## 🎯 CURRENT STATE ANALYSIS

### What You Have (Good!)
- **Modular Engine Structure** - Separate concerns into focused scripts
- **Core Physics** - Skateboarding mechanics foundation
- **Multiple Editors** - Helmet, jacket, skateboard, level editors
- **Content Systems** - Enemies, dialogue, objectives, NPCs
- **Visual Systems** - Gore, materials, weather
- **Infrastructure** - Level registry, changelog, pause menu

### What Needs Reorganization
1. **Core bloat** - Materials and weather logic mixed with skater physics
2. **Missing systems** - Weapons, full equipment manager, music integration
3. **No clear data flow** - How do systems talk to each other?

---

## 📂 RECOMMENDED FILE STRUCTURE

### Core Systems (Physics & Player)
```
engine/
├── applesauce-core.js          # ONLY skater physics & input
├── applesauce-player.js         # Player state, health, inventory
└── applesauce-camera.js         # Camera follow, angles, shake
```

### World & Environment
```
engine/
├── applesauce-terrain.js        # Height maps, collision
├── applesauce-materials.js      # Material definitions, textures
├── applesauce-weather_system.js # Weather states, transitions
└── applesauce-world-loader.js   # Load/unload level chunks
```

### Combat & Interaction
```
engine/
├── applesauce-weapons.js        # Weapon system, attacks, special abilities
├── applesauce-enemies.js        # Enemy AI, behaviors, drops
├── applesauce-combat.js         # Damage calc, hit detection, combos
└── applesauce-objectives.js     # Quest/objective tracking
```

### UI & Menus
```
engine/
├── applesauce-pause-menu.js     # Main pause interface
├── applesauce-gear.js           # Equipment screen, stats, preview
├── applesauce-music.js          # Radio player, track management
└── applesauce-dialogue.js       # NPC conversations, cutscenes
```

### Supporting Systems
```
engine/
├── applesauce-audio-manager.js  # Sound effects, music, 3D audio
├── applesauce-particle-system.js # Gore, weather, tricks effects
├── applesauce-save-system.js    # Save/load game state
└── level-registry.js            # Level metadata, unlocks
```

---

## 🔄 SYSTEM COMMUNICATION ARCHITECTURE

### The Hub Model
Each major system should communicate through a central game state object:

```javascript
// applesauce-game-state.js
const GameState = {
    player: {
        position: {x, y, z},
        velocity: {x, y, z},
        health: 100,
        inventory: [],
        equipped: {
            helmet: null,
            jacket: null,
            board: null,
            weapon: null
        },
        stats: {
            speed: 1.0,
            trickPower: 1.0,
            defense: 1.0
        }
    },
    world: {
        currentLevel: "level_16",
        weather: "clear",
        timeOfDay: 0.5,
        activeEnemies: [],
        collectibles: []
    },
    ui: {
        paused: false,
        activeMenu: null,
        musicPlaying: false
    }
};
```

### Event Bus Pattern
```javascript
// applesauce-events.js
const Events = {
    listeners: {},
    
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    },
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
};

// Usage in different systems:
// weapons.js emits "weaponFired"
// enemies.js listens for "weaponFired"
// combat.js calculates damage
```

---

## 🎮 CORE PHYSICS MATHS

### Skateboarding Physics (applesauce-core.js)
```javascript
// Basic movement
velocity.x += input.left_right * acceleration * deltaTime;
velocity.z += input.forward_back * acceleration * deltaTime;

// Apply friction
velocity.x *= (1 - friction * deltaTime);
velocity.z *= (1 - friction * deltaTime);

// Gravity
velocity.y -= gravity * deltaTime;

// Speed limit
const speed = Math.sqrt(velocity.x**2 + velocity.z**2);
if (speed > maxSpeed) {
    velocity.x = (velocity.x / speed) * maxSpeed;
    velocity.z = (velocity.z / speed) * maxSpeed;
}

// Terrain following
const terrainHeight = getTerrainHeight(position.x, position.z);
if (position.y <= terrainHeight) {
    position.y = terrainHeight;
    velocity.y = 0;
    onGround = true;
}

// Slope influence
const slopeAngle = getTerrainSlopeAngle(position.x, position.z);
const slopeDirection = getTerrainSlopeDirection(position.x, position.z);
velocity.x += Math.sin(slopeDirection) * slopeAngle * slopeInfluence * deltaTime;
velocity.z += Math.cos(slopeDirection) * slopeAngle * slopeInfluence * deltaTime;
```

---

## ⚔️ WEAPON SYSTEM MATHS

### Weapon Base Stats
```javascript
const WeaponTemplate = {
    name: "Tornado Deck",
    type: "melee", // or "ranged"
    damage: 15,
    range: 2.5,
    cooldown: 0.5, // seconds
    specialAbility: "tornado_blast",
    specialCooldown: 5.0,
    weatherAffinity: "wind", // wind, lightning, rain, snow
    
    // Attack pattern
    attackPattern: [
        { time: 0.0, damage: 0.5, knockback: 0.2 },
        { time: 0.15, damage: 1.0, knockback: 0.5 },
        { time: 0.3, damage: 0.8, knockback: 0.3 }
    ]
};
```

### Attack Hit Detection
```javascript
function checkWeaponHit(player, weapon, enemies) {
    const attackDirection = {
        x: Math.sin(player.rotation.y),
        z: Math.cos(player.rotation.y)
    };
    
    const attackPoint = {
        x: player.position.x + attackDirection.x * weapon.range,
        z: player.position.z + attackDirection.z * weapon.range
    };
    
    enemies.forEach(enemy => {
        const distance = Math.sqrt(
            (enemy.position.x - attackPoint.x)**2 +
            (enemy.position.z - attackPoint.z)**2
        );
        
        if (distance < weapon.range) {
            // Calculate angle to ensure enemy is in front
            const toEnemy = {
                x: enemy.position.x - player.position.x,
                z: enemy.position.z - player.position.z
            };
            
            const dot = 
                attackDirection.x * toEnemy.x + 
                attackDirection.z * toEnemy.z;
            
            const angle = Math.acos(dot / (
                Math.sqrt(toEnemy.x**2 + toEnemy.z**2) * 
                Math.sqrt(attackDirection.x**2 + attackDirection.z**2)
            ));
            
            // Hit if within 90 degrees (π/2 radians)
            if (angle < Math.PI / 2) {
                dealDamage(enemy, weapon.damage);
                applyKnockback(enemy, attackDirection, weapon.knockback);
            }
        }
    });
}
```

### Knockback Physics
```javascript
function applyKnockback(target, direction, force) {
    const normalizedDir = {
        x: direction.x / Math.sqrt(direction.x**2 + direction.z**2),
        z: direction.z / Math.sqrt(direction.x**2 + direction.z**2)
    };
    
    target.velocity.x += normalizedDir.x * force * 10;
    target.velocity.z += normalizedDir.z * force * 10;
    target.velocity.y += force * 5; // Pop them up
}
```

---

## 🌪️ WEATHER ABILITY MATHS

### Tornado Blast (Wind Affinity)
```javascript
function tornadoBlast(player, weapon) {
    const duration = 2.0; // seconds
    const radius = 5.0;
    const rotationSpeed = 5.0; // radians per second
    const liftForce = 8.0;
    const pullForce = 3.0;
    
    const tornado = {
        position: { ...player.position },
        startTime: currentTime,
        active: true
    };
    
    function updateTornado(deltaTime) {
        const elapsed = currentTime - tornado.startTime;
        if (elapsed > duration) {
            tornado.active = false;
            return;
        }
        
        // Affect all entities in radius
        enemies.forEach(enemy => {
            const dx = enemy.position.x - tornado.position.x;
            const dz = enemy.position.z - tornado.position.z;
            const distance = Math.sqrt(dx**2 + dz**2);
            
            if (distance < radius) {
                const strength = 1 - (distance / radius); // Stronger at center
                
                // Circular motion
                const angle = Math.atan2(dz, dx);
                const tangentAngle = angle + Math.PI / 2;
                
                enemy.velocity.x += Math.cos(tangentAngle) * rotationSpeed * strength;
                enemy.velocity.z += Math.sin(tangentAngle) * rotationSpeed * strength;
                
                // Pull toward center
                enemy.velocity.x -= (dx / distance) * pullForce * strength;
                enemy.velocity.z -= (dz / distance) * pullForce * strength;
                
                // Lift up
                enemy.velocity.y += liftForce * strength * deltaTime;
                
                // Damage over time
                dealDamage(enemy, weapon.damage * 0.1 * deltaTime);
            }
        });
    }
    
    return tornado;
}
```

### Lightning Storm (Electric Affinity)
```javascript
function lightningStorm(player, weapon) {
    const strikeCount = 5;
    const strikeInterval = 0.3; // seconds between strikes
    const strikeRadius = 1.5;
    const strikeDamage = weapon.damage * 2.0;
    const chainRadius = 4.0;
    const maxChains = 3;
    
    function strikeEnemy(target, chainDepth = 0) {
        dealDamage(target, strikeDamage * (0.8 ** chainDepth));
        target.stunned = true;
        target.stunDuration = 1.0;
        
        // Visual effect at target position
        spawnLightningBolt(player.position.y + 10, target.position);
        
        // Chain to nearby enemies
        if (chainDepth < maxChains) {
            const nearby = enemies.filter(e => 
                e !== target && 
                !e.hit &&
                distance(e.position, target.position) < chainRadius
            );
            
            if (nearby.length > 0) {
                const next = nearby[0];
                next.hit = true;
                setTimeout(() => strikeEnemy(next, chainDepth + 1), 100);
            }
        }
    }
    
    // Strike sequence
    for (let i = 0; i < strikeCount; i++) {
        setTimeout(() => {
            const target = findNearestEnemy(player.position, 10.0);
            if (target) {
                target.hit = true;
                strikeEnemy(target, 0);
                
                // Reset hit flags after strike resolves
                setTimeout(() => {
                    enemies.forEach(e => e.hit = false);
                }, 500);
            }
        }, i * strikeInterval * 1000);
    }
}
```

### Freeze Wave (Ice/Snow Affinity)
```javascript
function freezeWave(player, weapon) {
    const waveSpeed = 8.0;
    const maxRadius = 15.0;
    const freezeDuration = 3.0;
    const slowAmount = 0.3; // 70% speed reduction
    
    const wave = {
        position: { ...player.position },
        radius: 0,
        startTime: currentTime
    };
    
    function updateWave(deltaTime) {
        wave.radius += waveSpeed * deltaTime;
        
        if (wave.radius > maxRadius) {
            return false; // Wave finished
        }
        
        enemies.forEach(enemy => {
            if (enemy.frozen) return;
            
            const distance = Math.sqrt(
                (enemy.position.x - wave.position.x)**2 +
                (enemy.position.z - wave.position.z)**2
            );
            
            // Hit enemies at wave radius
            if (Math.abs(distance - wave.radius) < 1.0) {
                enemy.frozen = true;
                enemy.frozenUntil = currentTime + freezeDuration;
                enemy.speedMultiplier = slowAmount;
                enemy.tint = 0x88ccff; // Blue tint
                
                dealDamage(enemy, weapon.damage * 0.5);
            }
        });
        
        return true; // Wave continues
    }
    
    return wave;
}
```

---

## 🎒 EQUIPMENT & GEAR SYSTEM

### Gear Stats & Modifications
```javascript
const GearTemplate = {
    helmet: {
        name: "Gore-Spattered Helmet",
        defense: 5,
        specialBonus: {
            type: "health_regen",
            value: 1 // HP per second
        },
        visualMesh: "helmet_gore_01"
    },
    
    jacket: {
        name: "Skate Punk Jacket",
        defense: 8,
        specialBonus: {
            type: "speed_boost",
            value: 1.2 // 20% faster
        },
        visualMesh: "jacket_punk_01"
    },
    
    board: {
        name: "Demon Deck",
        trickPower: 1.5,
        specialBonus: {
            type: "air_control",
            value: 2.0 // Better mid-air steering
        },
        visualMesh: "board_demon_01"
    }
};

// Calculate total player stats
function calculatePlayerStats(player, equipped) {
    let stats = {
        defense: 0,
        speed: 1.0,
        trickPower: 1.0,
        healthRegen: 0,
        airControl: 1.0
    };
    
    Object.values(equipped).forEach(gear => {
        if (!gear) return;
        
        stats.defense += gear.defense || 0;
        
        if (gear.specialBonus) {
            switch(gear.specialBonus.type) {
                case "speed_boost":
                    stats.speed *= gear.specialBonus.value;
                    break;
                case "health_regen":
                    stats.healthRegen += gear.specialBonus.value;
                    break;
                case "air_control":
                    stats.airControl *= gear.specialBonus.value;
                    break;
                case "trick_power":
                    stats.trickPower *= gear.specialBonus.value;
                    break;
            }
        }
    });
    
    return stats;
}

// Damage reduction calculation
function calculateDamageReduction(incomingDamage, defense) {
    // Asymptotic defense curve
    const damageMultiplier = 100 / (100 + defense);
    return incomingDamage * damageMultiplier;
}
```

---

## 🎵 MUSIC SYSTEM INTEGRATION

### Radio Player with Gameplay Effects
```javascript
const MusicSystem = {
    tracks: [],
    currentTrack: null,
    volume: 0.7,
    
    // Musical weapons boost when on-beat
    beatSync: {
        bpm: 120,
        lastBeat: 0,
        beatWindow: 0.1 // seconds of leeway
    },
    
    isOnBeat() {
        const beatInterval = 60 / this.beatSync.bpm;
        const timeSinceLastBeat = currentTime - this.beatSync.lastBeat;
        const timeUntilNextBeat = beatInterval - timeSinceLastBeat;
        
        return timeUntilNextBeat < this.beatSync.beatWindow;
    },
    
    // Weapon attack on-beat bonus
    getAttackMultiplier() {
        if (this.isOnBeat()) {
            return 1.5; // 50% damage boost
        }
        return 1.0;
    },
    
    // Trick score multiplier
    getTrickMultiplier() {
        if (this.isOnBeat()) {
            return 2.0; // Double points
        }
        return 1.0;
    }
};

// In pause menu, tab between:
// [Equipment] [Music] [Objectives] [Map]
```

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1: Core Cleanup (Week 1)
1. **Split materials from core**
   - Move material definitions to applesauce-materials.js
   - Keep only skater physics in core
   
2. **Create game state manager**
   - Central hub for all system data
   - Event bus for cross-system communication
   
3. **Implement proper pause menu**
   - Equipment tab with gear preview
   - Music tab with playlist
   - Stats display

### Phase 2: Combat Foundation (Week 2)
1. **Basic weapon system**
   - Melee attacks with hit detection
   - Damage calculation
   - Cooldown timers
   
2. **Enemy drops**
   - Loot tables
   - Gear pickup system
   - Inventory management

### Phase 3: Special Abilities (Week 3)
1. **Weather-based attacks**
   - Tornado blast (complete)
   - Lightning storm (complete)
   - Freeze wave (complete)
   
2. **Musical weapon mechanics**
   - Beat detection
   - On-beat bonuses
   - Combo system

### Phase 4: Polish & Balance (Week 4)
1. **Particle effects**
   - Weapon trails
   - Impact effects
   - Weather visuals
   
2. **Sound design**
   - Weapon sounds
   - Hit effects
   - Ability audio
   
3. **Balance testing**
   - Damage numbers
   - Enemy difficulty
   - Ability cooldowns

---

## 🧮 USEFUL MATH FORMULAS

### Distance & Direction
```javascript
// 2D distance
const distance = Math.sqrt(dx**2 + dz**2);

// 3D distance
const distance3D = Math.sqrt(dx**2 + dy**2 + dz**2);

// Normalize direction
const length = Math.sqrt(x**2 + z**2);
const normalized = { x: x/length, z: z/length };

// Dot product (for angles)
const dot = (a.x * b.x) + (a.z * b.z);

// Angle between vectors
const angle = Math.acos(dot / (lengthA * lengthB));
```

### Interpolation
```javascript
// Linear interpolation
const lerp = (a, b, t) => a + (b - a) * t;

// Smooth step (ease in/out)
const smoothstep = (t) => t * t * (3 - 2 * t);

// Ease out (fast start, slow end)
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
```

### Circular Motion
```javascript
// Point on circle
const x = centerX + radius * Math.cos(angle);
const z = centerZ + radius * Math.sin(angle);

// Rotate vector
const rotatedX = x * Math.cos(angle) - z * Math.sin(angle);
const rotatedZ = x * Math.sin(angle) + z * Math.cos(angle);
```

### Spring Physics (for camera, UI)
```javascript
function spring(current, target, velocity, springConstant, damping, dt) {
    const force = (target - current) * springConstant;
    velocity += force * dt;
    velocity *= (1 - damping);
    current += velocity * dt;
    return { current, velocity };
}
```

---

## 📝 NEXT STEPS

1. **Immediate**: Create applesauce-materials.js and move material code
2. **Today**: Implement basic pause menu with equipment tab
3. **This Week**: Get weapon system working with one melee weapon
4. **Next Week**: Add tornado blast ability
5. **Ongoing**: Build out level content as systems solidify

---

## 🎮 DEVELOPMENT PHILOSOPHY

**Yes, lots of .js files is normal!** Professional game engines have hundreds or thousands. The key is:

- **Single Responsibility**: Each file does ONE thing well
- **Clear Dependencies**: Know what depends on what
- **Documented Interfaces**: Comment what each system exports
- **Incremental Testing**: Test each piece before combining

You're building this the right way. Now it's time to organize what you have and fill in the gaps systematically.

---

**Remember**: Rome wasn't built in a day, but they were laying bricks every hour. Pick one system, get it working, then move to the next. The math is here, the architecture is here, now it's just execution.

🛹💀⚡
