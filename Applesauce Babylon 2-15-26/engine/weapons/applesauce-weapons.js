/**
 * APPLESAUCE Weapons System v1.0
 * Handles all attack types: Projectiles, Rays, Area of Effect, Melee
 * Integrates with ApplesauceCollision for hit detection
 * 
 * ATTACK TYPES:
 * 1. Projectile - Flying objects (magic missiles, thrown items)
 * 2. Ray - Instant hit laser/beam attacks
 * 3. Area of Effect (AoE) - Explosions, shockwaves
 * 4. Melee - Close range board swings
 */
import * as THREE from '../three.module.js';

export class ApplesauceWeapons {
    constructor(core) {
        this.core = core;
        this.collision = null; // Reference to collision module
        
        // Active projectiles and effects
        this.projectiles = [];
        this.rays = [];
        this.aoeEffects = [];
        
        // Visual groups
        this.projectileGroup = new THREE.Group();
        this.projectileGroup.name = 'Projectiles';
        this.effectsGroup = new THREE.Group();
        this.effectsGroup.name = 'Effects';
        
        // Weapon stats tracking
        this.stats = {
            projectilesFired: 0,
            projectileHits: 0,
            raysFired: 0,
            rayHits: 0,
            aoeAttacks: 0,
            meleeSwings: 0,
            totalKills: 0
        };
        
        // Player weapons inventory
        this.equipped = {
            primary: null,   // Main magic weapon
            secondary: null, // Secondary attack
            melee: null      // Board swing
        };
        
        // Cooldowns
        this.cooldowns = {
            primary: 0,
            secondary: 0,
            melee: 0
        };
        
        console.log('🔮 Weapons system loaded');
    }
    
    // ===================================
    // INITIALIZATION
    // ===================================
    
    init() {
        this.collision = this.core.modules.collision;
        this.core.scene.add(this.projectileGroup);
        this.core.scene.add(this.effectsGroup);
        
        // Setup default weapons
        this.equipped.primary = this.createWeapon('magic_missile');
        this.equipped.secondary = this.createWeapon('shockwave');
        this.equipped.melee = this.createWeapon('board_swing');
        
        console.log('🔮 Weapons initialized');
    }
    
    // ===================================
    // WEAPON CREATION
    // ===================================
    
    createWeapon(type) {
        const weapons = {
            // PROJECTILE WEAPONS
            magic_missile: {
                type: 'projectile',
                name: 'Magic Missile',
                damage: 50,
                speed: 1.5,
                size: 0.3,
                color: 0x00FFFF,
                cooldown: 20,  // frames
                lifetime: 180,  // 3 seconds
                pierce: false,
                homing: false,
                mana: 10
            },
            
            fireball: {
                type: 'projectile',
                name: 'Fireball',
                damage: 80,
                speed: 1.0,
                size: 0.5,
                color: 0xFF4500,
                cooldown: 40,
                lifetime: 150,
                pierce: false,
                homing: false,
                mana: 20,
                explosive: true,
                explosionRadius: 5
            },
            
            ice_shard: {
                type: 'projectile',
                name: 'Ice Shard',
                damage: 40,
                speed: 2.0,
                size: 0.4,
                color: 0x88CCFF,
                cooldown: 15,
                lifetime: 120,
                pierce: true,  // Goes through enemies
                homing: false,
                mana: 8
            },
            
            seeking_orb: {
                type: 'projectile',
                name: 'Seeking Orb',
                damage: 60,
                speed: 0.8,
                size: 0.4,
                color: 0xFF00FF,
                cooldown: 30,
                lifetime: 300,
                pierce: false,
                homing: true,  // Tracks enemies
                mana: 15
            },
            
            // RAY WEAPONS
            laser_beam: {
                type: 'ray',
                name: 'Laser Beam',
                damage: 30,
                range: 50,
                width: 0.3,
                color: 0xFF0000,
                cooldown: 10,
                duration: 5,  // Frames beam persists
                mana: 5,
                pierce: true
            },
            
            lightning_bolt: {
                type: 'ray',
                name: 'Jehovahs Battery',
                damage: 100,
                range: 40,
                width: 0.5,
                color: 0xFFFF00,
                cooldown: 60,
                duration: 3,
                mana: 25,
                pierce: false,
                chain: 3  // Jumps to 3 nearby enemies
            },
            
            // AREA OF EFFECT
            shockwave: {
                type: 'aoe',
                name: 'Shockwave',
                damage: 70,
                radius: 8,
                color: 0x00FF00,
                cooldown: 50,
                expandSpeed: 2.0,
                duration: 20,
                mana: 20
            },
            
            explosion: {
                type: 'aoe',
                name: 'Explosion',
                damage: 150,
                radius: 10,
                color: 0xFF4500,
                cooldown: 80,
                expandSpeed: 5.0,
                duration: 15,
                mana: 30
            },
            
            ice_nova: {
                type: 'aoe',
                name: 'Ice Nova',
                damage: 60,
                radius: 12,
                color: 0x88CCFF,
                cooldown: 60,
                expandSpeed: 3.0,
                duration: 25,
                mana: 25,
                slow: true  // Slows enemies
            },
            
            // MELEE
            board_swing: {
                type: 'melee',
                name: 'Board Swing',
                damage: 100,
                range: 2.5,
                arc: Math.PI / 2,  // 90 degree arc
                color: 0xFFFFFF,
                cooldown: 25,
                knockback: 2.0,
                mana: 0  // Free attack
            }
        };
        
        return weapons[type] || weapons.magic_missile;
    }
    
    // ===================================
    // ATTACK EXECUTION
    // ===================================
    
    /**
     * Fire primary weapon
     */
    attackPrimary() {
        if (this.cooldowns.primary > 0) return false;
        if (!this.equipped.primary) return false;
        
        const weapon = this.equipped.primary;
        
        // Check mana (if you have a mana system)
        // if (this.core.state.mana < weapon.mana) return false;
        
        switch (weapon.type) {
            case 'projectile':
                this.fireProjectile(weapon);
                break;
            case 'ray':
                this.fireRay(weapon);
                break;
            case 'aoe':
                this.fireAoE(weapon);
                break;
        }
        
        this.cooldowns.primary = weapon.cooldown;
        return true;
    }
    
    /**
     * Fire secondary weapon
     */
    attackSecondary() {
        if (this.cooldowns.secondary > 0) return false;
        if (!this.equipped.secondary) return false;
        
        const weapon = this.equipped.secondary;
        
        switch (weapon.type) {
            case 'projectile':
                this.fireProjectile(weapon);
                break;
            case 'ray':
                this.fireRay(weapon);
                break;
            case 'aoe':
                this.fireAoE(weapon);
                break;
        }
        
        this.cooldowns.secondary = weapon.cooldown;
        return true;
    }
    
    /**
     * Melee attack (board swing)
     */
    attackMelee() {
        if (this.cooldowns.melee > 0) return false;
        if (!this.equipped.melee) return false;
        
        const weapon = this.equipped.melee;
        
        if (!this.core.player) return false;
        
        const playerPos = this.core.player.position;
        const direction = new THREE.Vector3(
            Math.sin(this.core.state.rotation),
            0,
            Math.cos(this.core.state.rotation)
        );
        
        // Use collision system's melee attack
        if (this.collision) {
            const hitCount = this.collision.boardSwingAttack(
                playerPos,
                direction,
                this.core
            );
            
            if (hitCount > 0) {
                this.stats.totalKills += hitCount;
                console.log(`🛹 Board swing hit ${hitCount} enemies!`);
            }
        }
        
        this.stats.meleeSwings++;
        this.cooldowns.melee = weapon.cooldown;
        
        // Visual effect
        this.createMeleeEffect(playerPos, direction, weapon);
        
        return true;
    }
    
    // ===================================
    // PROJECTILE WEAPONS
    // ===================================
    
    fireProjectile(weapon) {
        if (!this.core.player) return;
        
        const startPos = this.core.player.position.clone();
        startPos.y += 1.5; // Fire from chest height
        
        const direction = new THREE.Vector3(
            Math.sin(this.core.state.rotation),
            0,
            Math.cos(this.core.state.rotation)
        ).normalize();
        
        // Create projectile visual
        const geometry = new THREE.SphereGeometry(weapon.size, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: weapon.color,
            emissive: weapon.color,
            emissiveIntensity: 0.8
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(startPos);
        
        this.projectileGroup.add(mesh);
        
        // Create projectile data
        const projectile = {
            mesh: mesh,
            weapon: weapon,
            position: startPos.clone(),
            velocity: direction.multiplyScalar(weapon.speed),
            lifetime: weapon.lifetime,
            age: 0,
            active: true
        };
        
        this.projectiles.push(projectile);
        this.stats.projectilesFired++;
        
        console.log(`🔮 Fired ${weapon.name}`);
    }
    
    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            
            if (!proj.active) {
                this.projectileGroup.remove(proj.mesh);
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // Update position
            proj.position.add(proj.velocity.clone().multiplyScalar(deltaTime));
            proj.mesh.position.copy(proj.position);
            
            // Homing behavior
            if (proj.weapon.homing) {
                this.applyHoming(proj);
            }
            
            // Check collision with enemies
            if (this.collision) {
                const hit = this.collision.checkProjectileCollision(
                    proj.position,
                    proj.weapon.size
                );
                
                if (hit) {
                    this.handleProjectileHit(proj, hit);
                    
                    if (!proj.weapon.pierce) {
                        proj.active = false;
                    }
                }
            }
            
            // Age and lifetime
            proj.age += deltaTime;
            if (proj.age > proj.lifetime / 60) {  // Convert frames to seconds
                proj.active = false;
            }
            
            // Fade near end of life
            if (proj.age > (proj.lifetime / 60) * 0.8) {
                const fadeProgress = (proj.age - (proj.lifetime / 60) * 0.8) / ((proj.lifetime / 60) * 0.2);
                proj.mesh.material.opacity = 1 - fadeProgress;
                proj.mesh.material.transparent = true;
            }
        }
    }
    
    handleProjectileHit(projectile, enemy) {
        const weapon = projectile.weapon;
        
        // Deal damage via collision system
        if (this.collision) {
            this.collision.handleProjectileKill(
                enemy,
                projectile.position,
                projectile.velocity,
                this.core
            );
        }
        
        this.stats.projectileHits++;
        this.stats.totalKills++;
        
        // Explosive projectiles trigger AoE
        if (weapon.explosive) {
            this.createExplosion(projectile.position, weapon.explosionRadius);
        }
        
        console.log(`💥 ${weapon.name} hit!`);
    }
    
    applyHoming(projectile) {
        if (!this.core.modules.enemies) return;
        
        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDist = Infinity;
        
        for (let enemy of this.core.modules.enemies.enemies) {
            if (!enemy.alive || !enemy.mesh) continue;
            
            const dist = projectile.position.distanceTo(enemy.mesh.position);
            if (dist < 20 && dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        }
        
        if (nearestEnemy) {
            // Steer towards enemy
            const toEnemy = new THREE.Vector3()
                .subVectors(nearestEnemy.mesh.position, projectile.position)
                .normalize();
            
            // Blend current velocity with target direction
            projectile.velocity.lerp(
                toEnemy.multiplyScalar(projectile.weapon.speed),
                0.1
            );
        }
    }
    
    // ===================================
    // RAY WEAPONS
    // ===================================
    
    fireRay(weapon) {
        if (!this.core.player) return;
        
        const startPos = this.core.player.position.clone();
        startPos.y += 1.5;
        
        const direction = new THREE.Vector3(
            Math.sin(this.core.state.rotation),
            0,
            Math.cos(this.core.state.rotation)
        ).normalize();
        
        const endPos = startPos.clone().add(direction.multiplyScalar(weapon.range));
        
        // Create ray visual
        const geometry = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
        const material = new THREE.LineBasicMaterial({
            color: weapon.color,
            linewidth: weapon.width * 2,
            transparent: true,
            opacity: 0.8
        });
        const line = new THREE.Line(geometry, material);
        
        this.effectsGroup.add(line);
        
        // Ray data
        const ray = {
            mesh: line,
            weapon: weapon,
            startPos: startPos,
            endPos: endPos,
            direction: direction,
            duration: weapon.duration,
            age: 0,
            hitEnemies: []  // Track what we've hit (for pierce)
        };
        
        this.rays.push(ray);
        this.stats.raysFired++;
        
        // Instant hit detection
        this.checkRayHits(ray);
        
        console.log(`⚡ Fired ${weapon.name}`);
    }
    
    checkRayHits(ray) {
        if (!this.core.modules.enemies) return;
        
        const weapon = ray.weapon;
        let hits = 0;
        
        for (let enemy of this.core.modules.enemies.enemies) {
            if (!enemy.alive || !enemy.mesh) continue;
            if (ray.hitEnemies.includes(enemy)) continue; // Already hit
            
            // Check if enemy is on the ray line
            const enemyPos = enemy.mesh.position;
            const closestPoint = this.getClosestPointOnLine(
                ray.startPos,
                ray.endPos,
                enemyPos
            );
            
            const dist = enemyPos.distanceTo(closestPoint);
            
            if (dist < 1.0) {  // Hit radius
                // Hit!
                enemy.alive = false;
                ray.hitEnemies.push(enemy);
                hits++;
                
                // Gore effect
                if (this.core.modules.gore) {
                    this.core.modules.gore.createArterialSpray(
                        enemyPos,
                        ray.direction,
                        3
                    );
                    this.core.modules.gore.createBloodSplatter(
                        enemyPos,
                        ray.direction.clone().multiplyScalar(5),
                        80
                    );
                }
                
                this.stats.rayHits++;
                this.stats.totalKills++;
                this.core.state.score += 100;
                
                // Chain lightning
                if (weapon.chain && hits < weapon.chain) {
                    // Continue to next enemy
                } else if (!weapon.pierce) {
                    break; // Stop on first hit
                }
            }
        }
        
        if (hits > 0) {
            console.log(`⚡ ${weapon.name} hit ${hits} enemies!`);
        }
    }
    
    updateRays(deltaTime) {
        for (let i = this.rays.length - 1; i >= 0; i--) {
            const ray = this.rays[i];
            
            ray.age += deltaTime;
            
            // Fade out
            const fadeProgress = ray.age / (ray.duration / 60);
            ray.mesh.material.opacity = 0.8 * (1 - fadeProgress);
            
            if (ray.age > ray.duration / 60) {
                this.effectsGroup.remove(ray.mesh);
                this.rays.splice(i, 1);
            }
        }
    }
    
    // ===================================
    // AREA OF EFFECT WEAPONS
    // ===================================
    
    fireAoE(weapon) {
        if (!this.core.player) return;
        
        const centerPos = this.core.player.position.clone();
        
        this.createAoEEffect(centerPos, weapon);
        
        this.stats.aoeAttacks++;
        
        console.log(`💥 ${weapon.name} activated!`);
    }
    
    createAoEEffect(position, weapon) {
        // Visual sphere
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: weapon.color,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        
        this.effectsGroup.add(mesh);
        
        const aoe = {
            mesh: mesh,
            weapon: weapon,
            position: position.clone(),
            currentRadius: 0.5,
            targetRadius: weapon.radius,
            expandSpeed: weapon.expandSpeed,
            duration: weapon.duration,
            age: 0,
            hasDealtDamage: false
        };
        
        this.aoeEffects.push(aoe);
    }
    
    createExplosion(position, radius) {
        // Use collision system's explosion damage
        if (this.collision) {
            const killCount = this.collision.explosionDamage(
                position,
                radius,
                this.core
            );
            
            this.stats.totalKills += killCount;
        }
        
        // Visual effect
        const weapon = {
            color: 0xFF4500,
            radius: radius,
            expandSpeed: 5.0,
            duration: 15
        };
        
        this.createAoEEffect(position, weapon);
    }
    
    updateAoE(deltaTime) {
        for (let i = this.aoeEffects.length - 1; i >= 0; i--) {
            const aoe = this.aoeEffects[i];
            
            // Expand
            aoe.currentRadius += aoe.expandSpeed * deltaTime;
            aoe.mesh.scale.setScalar(aoe.currentRadius);
            
            // Deal damage when at full size
            if (aoe.currentRadius >= aoe.targetRadius && !aoe.hasDealtDamage) {
                if (this.collision) {
                    const killCount = this.collision.explosionDamage(
                        aoe.position,
                        aoe.targetRadius,
                        this.core
                    );
                    
                    this.stats.totalKills += killCount;
                }
                aoe.hasDealtDamage = true;
            }
            
            // Age and fade
            aoe.age += deltaTime;
            const fadeProgress = aoe.age / (aoe.duration / 60);
            aoe.mesh.material.opacity = 0.6 * (1 - fadeProgress);
            
            if (aoe.age > aoe.duration / 60) {
                this.effectsGroup.remove(aoe.mesh);
                this.aoeEffects.splice(i, 1);
            }
        }
    }
    
    // ===================================
    // MELEE EFFECTS
    // ===================================
    
    createMeleeEffect(position, direction, weapon) {
        // Arc slash visual
        const curve = new THREE.EllipseCurve(
            0, 0,
            weapon.range, weapon.range,
            -weapon.arc / 2, weapon.arc / 2,
            false,
            0
        );
        
        const points = curve.getPoints(20);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: weapon.color,
            transparent: true,
            opacity: 0.8,
            linewidth: 3
        });
        
        const arc = new THREE.Line(geometry, material);
        arc.position.copy(position);
        arc.rotation.y = Math.atan2(direction.x, direction.z);
        arc.position.y += 1.0;
        
        this.effectsGroup.add(arc);
        
        // Fade and remove
        let age = 0;
        const duration = 10; // frames
        
        const fadeInterval = setInterval(() => {
            age++;
            arc.material.opacity = 0.8 * (1 - age / duration);
            
            if (age >= duration) {
                this.effectsGroup.remove(arc);
                clearInterval(fadeInterval);
            }
        }, 16); // ~60fps
    }
    
    // ===================================
    // UPDATE
    // ===================================
    
    update(deltaTime) {
        // Update cooldowns
        this.cooldowns.primary = Math.max(0, this.cooldowns.primary - 1);
        this.cooldowns.secondary = Math.max(0, this.cooldowns.secondary - 1);
        this.cooldowns.melee = Math.max(0, this.cooldowns.melee - 1);
        
        // Update active effects
        this.updateProjectiles(deltaTime);
        this.updateRays(deltaTime);
        this.updateAoE(deltaTime);
    }
    
    // ===================================
    // UTILITIES
    // ===================================
    
    getClosestPointOnLine(lineStart, lineEnd, point) {
        const line = new THREE.Vector3().subVectors(lineEnd, lineStart);
        const len = line.length();
        line.normalize();
        
        const v = new THREE.Vector3().subVectors(point, lineStart);
        const d = v.dot(line);
        
        if (d < 0) return lineStart.clone();
        if (d > len) return lineEnd.clone();
        
        return lineStart.clone().add(line.multiplyScalar(d));
    }
    
    equipWeapon(slot, weaponType) {
        this.equipped[slot] = this.createWeapon(weaponType);
        console.log(`🔮 Equipped ${this.equipped[slot].name} to ${slot}`);
    }
    
    getStats() {
        return { ...this.stats };
    }
    
    clear() {
        // Remove all visuals
        this.projectileGroup.clear();
        this.effectsGroup.clear();
        
        // Clear arrays
        this.projectiles = [];
        this.rays = [];
        this.aoeEffects = [];
        
        console.log('🔮 Weapons cleared');
    }
}
