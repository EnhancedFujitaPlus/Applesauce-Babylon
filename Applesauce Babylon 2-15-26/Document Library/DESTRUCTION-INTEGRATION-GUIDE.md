/**
 * DESTRUCTION SYSTEM - INTEGRATION GUIDE
 * How to add destruction physics to your APPLESAUCE game
 */

/*
=====================================================
STEP 1: IMPORT AND INITIALIZE
=====================================================
*/

import { DestructionSystem } from './applesauce-destruction-system.js';
import { level_destruction_playground, level_destructible_city } from './level-destruction-examples.js';

class ApplesauceEngine {
    constructor() {
        // ... your existing code ...
        
        // Initialize destruction system
        this.destruction = new DestructionSystem(this);
        this.destruction.initialize();
    }
    
    loadLevel(levelConfig) {
        console.log(`Loading level: ${levelConfig.name}`);
        
        // Generate terrain
        this.terrain.generate(levelConfig.terrain);
        
        // Load destructible objects if defined
        if (levelConfig.destructibles) {
            this.loadDestructibles(levelConfig.destructibles);
        }
        
        // ... rest of level loading ...
    }
    
    loadDestructibles(destructiblesConfig) {
        // Load crates
        if (destructiblesConfig.crates) {
            destructiblesConfig.crates.forEach(cfg => {
                this.destruction.createCrate(cfg);
            });
        }
        
        // Load glass
        if (destructiblesConfig.glass) {
            destructiblesConfig.glass.forEach(cfg => {
                this.destruction.createGlass(cfg);
            });
        }
        
        // Load walls
        if (destructiblesConfig.walls) {
            destructiblesConfig.walls.forEach(cfg => {
                this.destruction.createWall(cfg);
            });
        }
        
        // Load barrels
        if (destructiblesConfig.barrels) {
            destructiblesConfig.barrels.forEach(cfg => {
                this.destruction.createBarrel(cfg);
            });
        }
        
        // Load mixed obstacles
        if (destructiblesConfig.mixedObstacles && destructiblesConfig.mixedObstacles.obstacles) {
            destructiblesConfig.mixedObstacles.obstacles.forEach(cfg => {
                switch(cfg.type) {
                    case 'crate':
                        this.destruction.createCrate(cfg);
                        break;
                    case 'glass':
                        this.destruction.createGlass(cfg);
                        break;
                    case 'wall':
                        this.destruction.createWall(cfg);
                        break;
                    case 'barrel':
                        this.destruction.createBarrel(cfg);
                        break;
                }
            });
        }
        
        console.log(`✅ Loaded ${this.destruction.destructibles.length} destructible objects`);
    }
}


/*
=====================================================
STEP 2: UPDATE LOOP INTEGRATION
=====================================================
*/

class ApplesauceEngine {
    // ... existing code ...
    
    update(deltaTime) {
        // ... your existing update code ...
        
        // Update destruction physics
        if (this.destruction) {
            this.destruction.update(deltaTime);
        }
        
        // Check collisions with destructibles
        if (this.player && this.destruction) {
            this.checkDestructibleCollisions();
        }
    }
    
    checkDestructibleCollisions() {
        const playerPos = this.player.position;
        const playerVel = this.player.velocity;
        const playerRadius = this.player.radius || 0.5;
        
        // Check all destructibles
        const collisions = this.destruction.checkPlayerCollision(
            playerPos,
            playerVel,
            playerRadius
        );
        
        // Handle collision response (push player back, etc.)
        if (collisions.length > 0) {
            // You can add bounce-back, slowdown, or other effects here
            // For now, the destruction system handles the object breaking
        }
    }
}


/*
=====================================================
STEP 3: ADVANCED - TRICK-BASED DESTRUCTION
=====================================================
Make certain tricks break certain objects!
*/

class ApplesauceEngine {
    // ... existing code ...
    
    onTrickLanded(trickName, trickScore) {
        console.log(`Landed ${trickName} for ${trickScore} points!`);
        
        // Check for nearby destructibles
        const playerPos = this.player.position;
        const breakRadius = 3; // How close to trigger trick breaks
        
        for (let obj of this.destruction.destructibles) {
            if (obj.broken) continue;
            
            const distance = obj.mesh.position.distanceTo(playerPos);
            
            if (distance < breakRadius) {
                // Different tricks break different things
                let shouldBreak = false;
                let damageMultiplier = 1;
                
                // Heavy tricks (flips, spins) break harder objects
                if (trickName.includes('Flip') || trickName.includes('360')) {
                    shouldBreak = true;
                    damageMultiplier = 2;
                }
                
                // Grind tricks can break walls and barriers
                if (trickName.includes('Grind') && obj.type === 'wall') {
                    shouldBreak = true;
                    damageMultiplier = 1.5;
                }
                
                // Any trick can shatter glass
                if (obj.type === 'glass') {
                    shouldBreak = true;
                }
                
                if (shouldBreak) {
                    const damage = trickScore * damageMultiplier;
                    const impactVel = this.player.velocity.clone();
                    
                    this.destruction.applyDamage(
                        obj,
                        damage,
                        obj.mesh.position,
                        impactVel
                    );
                    
                    // Bonus points for breaking stuff with tricks!
                    this.addScore(50);
                    console.log(`💥 Trick break bonus! +50 points`);
                }
            }
        }
    }
}


/*
=====================================================
STEP 4: VELOCITY-BASED AUTO-DESTRUCTION
=====================================================
Break through stuff at high speed!
*/

class ApplesauceEngine {
    // ... existing code ...
    
    checkDestructibleCollisions() {
        const playerPos = this.player.position;
        const playerVel = this.player.velocity;
        const playerRadius = this.player.radius || 0.5;
        
        // Calculate player speed
        const speed = Math.sqrt(
            playerVel.x * playerVel.x +
            playerVel.y * playerVel.y +
            playerVel.z * playerVel.z
        );
        
        // Check all destructibles
        for (let obj of this.destruction.destructibles) {
            if (obj.broken) continue;
            
            obj.boundingBox.setFromObject(obj.mesh);
            
            // Check collision
            const closestPoint = new THREE.Vector3();
            closestPoint.x = Math.max(obj.boundingBox.min.x, Math.min(playerPos.x, obj.boundingBox.max.x));
            closestPoint.y = Math.max(obj.boundingBox.min.y, Math.min(playerPos.y, obj.boundingBox.max.y));
            closestPoint.z = Math.max(obj.boundingBox.min.z, Math.min(playerPos.z, obj.boundingBox.max.z));
            
            const distance = closestPoint.distanceTo(playerPos);
            
            if (distance < playerRadius) {
                // Calculate impact force based on speed
                const force = speed * 10;
                
                // Auto-break if going fast enough
                if (force >= obj.config.breakForce) {
                    console.log(`💨 Crashed through at ${speed.toFixed(1)} speed!`);
                    this.destruction.applyDamage(obj, force, closestPoint, playerVel);
                } else {
                    // Just damage it
                    this.destruction.applyDamage(obj, force * 0.5, closestPoint, playerVel);
                    
                    // Slow player down (collision response)
                    playerVel.multiplyScalar(0.7);
                    
                    // Bounce player back a bit
                    const bounceDir = new THREE.Vector3()
                        .subVectors(playerPos, obj.mesh.position)
                        .normalize()
                        .multiplyScalar(0.5);
                    
                    playerPos.add(bounceDir);
                }
            }
        }
    }
}


/*
=====================================================
STEP 5: COMBO SYSTEM INTEGRATION
=====================================================
Award points for destruction chains!
*/

class ApplesauceEngine {
    constructor() {
        // ... existing code ...
        this.destructionCombo = 0;
        this.destructionComboTimer = 0;
        this.destructionComboTimeout = 3; // seconds
    }
    
    update(deltaTime) {
        // ... existing update code ...
        
        // Update destruction combo timer
        if (this.destructionCombo > 0) {
            this.destructionComboTimer -= deltaTime;
            if (this.destructionComboTimer <= 0) {
                console.log(`💥 Destruction combo ended: ${this.destructionCombo}x`);
                this.destructionCombo = 0;
            }
        }
    }
}

// Hook into the destruction system
DestructionSystem.prototype.breakObject = function(obj, impactPoint, impactVelocity) {
    if (obj.broken) return;
    
    console.log(`💥💥💥 ${obj.type.toUpperCase()} DESTROYED!`);
    
    obj.broken = true;
    this.engine.scene.remove(obj.mesh);
    
    // Create debris...
    // (existing debris creation code)
    
    // UPDATE COMBO
    this.engine.destructionCombo++;
    this.engine.destructionComboTimer = this.engine.destructionComboTimeout;
    
    // Award points based on combo
    const basePoints = {
        crate: 10,
        glass: 15,
        wall: 25,
        barrel: 20
    };
    
    const points = basePoints[obj.type] * this.engine.destructionCombo;
    this.engine.addScore(points);
    
    console.log(`💰 +${points} points (${this.engine.destructionCombo}x combo!)`);
    
    // Create effects...
    // (existing particle/sound code)
};


/*
=====================================================
STEP 6: DEBRIS COLLISION (OPTIONAL)
=====================================================
Let debris pieces be collidable for extra chaos!
*/

class ApplesauceEngine {
    checkDebrisCollisions() {
        const playerPos = this.player.position;
        const playerVel = this.player.velocity;
        const playerRadius = this.player.radius || 0.5;
        
        for (let debris of this.destruction.debris) {
            const debrisPos = debris.mesh.position;
            const distance = debrisPos.distanceTo(playerPos);
            
            if (distance < playerRadius + 0.3) {
                // Simple bounce
                const pushDir = new THREE.Vector3()
                    .subVectors(debrisPos, playerPos)
                    .normalize();
                
                debris.velocity.add(pushDir.multiplyScalar(5));
                debris.angularVelocity.multiplyScalar(1.5);
            }
        }
    }
}


/*
=====================================================
STEP 7: SOUND INTEGRATION EXAMPLE
=====================================================
*/

// In your audio system:
class ApplesauceAudio {
    constructor() {
        this.sounds = {
            break_crate: new Audio('./sounds/wood_break.mp3'),
            break_glass: new Audio('./sounds/glass_shatter.mp3'),
            break_wall: new Audio('./sounds/concrete_crumble.mp3'),
            break_barrel: new Audio('./sounds/metal_clang.mp3'),
            explosion: new Audio('./sounds/explosion.mp3')
        };
    }
    
    playSound(soundName, position) {
        if (this.sounds[soundName]) {
            const sound = this.sounds[soundName].cloneNode();
            
            // Optional: Adjust volume based on distance to player
            const distance = position.distanceTo(this.engine.player.position);
            const volume = Math.max(0, 1 - distance / 50);
            sound.volume = volume;
            
            sound.play();
        }
    }
}

// Hook it into destruction system:
DestructionSystem.prototype.onBreakSound = function(type, position) {
    if (this.engine.audio) {
        this.engine.audio.playSound(`break_${type}`, position);
    }
};


/*
=====================================================
EXAMPLE: LOAD A DESTRUCTION LEVEL
=====================================================
*/

// Simple loading
engine.loadLevel(level_destruction_playground);

// Or custom level with destruction
engine.loadLevel({
    id: 'my_destruction_level',
    name: 'My Destruction Level',
    
    terrain: {
        mode: 'procedural',
        size: 1000,
        noise: 'flat_city'
    },
    
    destructibles: {
        crates: [
            { position: { x: 10, y: 1, z: 10 }, size: 2 },
            { position: { x: 15, y: 1, z: 10 }, size: 2 }
        ],
        glass: [
            { position: { x: 0, y: 2, z: 20 }, width: 4, height: 4 }
        ],
        walls: [
            { position: { x: -10, y: 3, z: 30 }, width: 8, height: 6 }
        ]
    }
});


/*
=====================================================
PERFORMANCE TIPS
=====================================================

1. DEBRIS LIMIT
   - System auto-limits to 500 debris pieces
   - Adjust with: destruction.maxDebrisCount = 300;

2. DEBRIS LIFETIME
   - Debris fades after 10 seconds by default
   - Adjust with: destruction.debrisLifetime = 5;

3. PARTICLE COUNT
   - Reduce particles for slower devices
   - Modify createBreakParticles count parameter

4. COLLISION CHECKS
   - Only check nearby destructibles
   - Use spatial partitioning for lots of objects

5. LOD FOR DEBRIS
   - Use simpler geometry for distant debris
   - Reduce polygon count on debris meshes
*/


/*
=====================================================
EXPANDING THE SYSTEM
=====================================================

EASY ADDITIONS:
1. New object types:
   - Fences (thin, splinter into posts)
   - Signs (fall over, bounce)
   - Columns (topple, create dust cloud)
   - Cars (dent, windows shatter, parts fall off)

2. New destruction patterns:
   - Slicing (cut objects in half)
   - Burning (fire spreads to nearby objects)
   - Freezing then shattering
   - Melting

3. Environmental hazards:
   - Falling debris from above
   - Chain reactions
   - Toxic barrels (damage over time)

4. Gameplay mechanics:
   - Score multipliers for clean breaks
   - Time challenges (break all objects)
   - Specific object targets
   - "Don't break the glass" challenges

Example - Add a fence:
*/

DestructionSystem.prototype.createFence = function(config) {
    const defaults = {
        position: { x: 0, y: 0, z: 0 },
        length: 10,
        height: 2,
        health: 60,
        color: 0x8B4513
    };
    
    const cfg = { ...defaults, ...config };
    
    // Create fence posts and rails
    const group = new THREE.Group();
    
    const postCount = Math.floor(cfg.length / 2) + 1;
    for (let i = 0; i < postCount; i++) {
        const postGeo = new THREE.BoxGeometry(0.1, cfg.height, 0.1);
        const postMat = new THREE.MeshStandardMaterial({ color: cfg.color });
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.x = (i / (postCount - 1) - 0.5) * cfg.length;
        post.position.y = cfg.height / 2;
        group.add(post);
    }
    
    // Add horizontal rails
    const railGeo = new THREE.BoxGeometry(cfg.length, 0.1, 0.1);
    const railMat = new THREE.MeshStandardMaterial({ color: cfg.color });
    
    const railTop = new THREE.Mesh(railGeo, railMat);
    railTop.position.y = cfg.height * 0.8;
    group.add(railTop);
    
    const railBottom = new THREE.Mesh(railGeo, railMat);
    railBottom.position.y = cfg.height * 0.3;
    group.add(railBottom);
    
    group.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
    this.engine.scene.add(group);
    
    const destructible = {
        id: `fence_${this.destructibles.length}`,
        type: 'fence',
        mesh: group,
        config: cfg,
        health: cfg.health,
        maxHealth: cfg.health,
        broken: false,
        boundingBox: new THREE.Box3().setFromObject(group)
    };
    
    this.destructibles.push(destructible);
    return destructible;
};

// Then add debris creation for fences:
DestructionSystem.prototype.createFenceDebris = function(obj, impactPoint, impactVelocity) {
    // Break into posts and rail pieces
    // Similar to barrel debris but with splinters
};
