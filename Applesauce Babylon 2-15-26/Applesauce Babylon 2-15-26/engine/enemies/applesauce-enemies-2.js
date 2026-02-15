/**
 * APPLESAUCE Enemies Module for Three.js r182
 * Enemy AI, collision detection, and roadkill system
 * ES Module version
 */

import * as THREE from './three.module.js';

export class ApplesauceEnemies {
    constructor(engine) {
        this.engine = engine;
        this.enemies = [];
        this.boss = null;
        this.kills = 0;
        this.killThresholdSpeed = 0.2; // Minimum speed for lethal collision
        
        console.log('👀 Enemies module loaded');
    }
    
    // ===================================
    // ENEMY SPAWNING
    // ===================================
    spawnEnemy(config) {
        const enemy = new Enemy(config, this.engine);
        this.enemies.push(enemy);
        return enemy;
    }
    
    spawnBoss(config) {
        this.boss = new Boss(config, this.engine);
        this.enemies.push(this.boss);
        return this.boss;
    }
    
    // Spawn enemies in a line formation
    spawnLine(startX, startZ, count, spacing = 3) {
        for (let i = 0; i < count; i++) {
            this.spawnEnemy({
                position: { x: startX, z: startZ + (i * spacing) }
            });
        }
    }
    
    // Spawn enemies in a cluster
    spawnCluster(centerX, centerZ, count, radius = 5) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const z = centerZ + Math.sin(angle) * radius;
            
            this.spawnEnemy({
                position: { x, z }
            });
        }
    }
    
    // ===================================
    // UPDATE & COLLISION
    // ===================================
    update(engine) {
        // Update all enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.isDead) {
                // Cleanup dead enemy
                if (enemy.deathTimer <= 0) {
                    enemy.remove();
                    this.enemies.splice(i, 1);
                }
                continue;
            }
            
            enemy.update(engine);
        }
        
        // Check collisions
        this.checkCollisions(engine);
        
        // Update kills HUD
        const killsEl = document.getElementById('kills');
        if (killsEl) {
            killsEl.textContent = `KILLS: ${this.kills}`;
        }
    }
    
    checkCollisions(engine) {
        if (!engine.player) return;
        
        const playerSpeed = Math.abs(engine.state.speed);
        const isLethal = playerSpeed >= this.killThresholdSpeed;
        
        for (let enemy of this.enemies) {
            if (enemy.isDead) continue;
            
            const distance = enemy.mesh.position.distanceTo(engine.player.position);
            
            if (distance < 2) { // Collision radius
                if (isLethal) {
                    // ROADKILL!
                    this.killEnemy(enemy, engine);
                    engine.state.score += 500 * (engine.state.combo || 1);
                    engine.state.combo = Math.max(engine.state.combo, 1);
                    engine.state.comboTimer = 60;
                } else {
                    // Just bump into them (or take damage)
                    this.bumpPlayer(engine);
                }
            }
        }
    }
    
    killEnemy(enemy, engine) {
        enemy.isDead = true;
        enemy.deathTimer = 180; // 3 seconds
        this.kills++;
        
        // Gore effects
        if (engine.modules.gore) {
            const velocity = new THREE.Vector3(
                Math.sin(engine.state.rotation) * engine.state.speed,
                0,
                Math.cos(engine.state.rotation) * engine.state.speed
            );
            
            // Massive splatter for high-speed kills
            if (Math.abs(engine.state.speed) > 0.5) {
                engine.modules.gore.createMassiveSplatter(enemy.mesh.position.clone(), velocity);
            } else {
                engine.modules.gore.createBloodSplatter(enemy.mesh.position.clone(), velocity, 30);
                engine.modules.gore.createGibs(enemy.mesh.position.clone(), velocity, 5);
            }
        }
        
        // Hide mesh (could also play death animation)
        enemy.mesh.visible = false;
        
        console.log('👀 ROADKILL!');
    }
    
    bumpPlayer(engine) {
        // Push player back slightly
        engine.state.speed *= 0.5;
        console.log('⚠️ Bump!');
    }
    
    // ===================================
    // CLEANUP
    // ===================================
    clear() {
        for (let enemy of this.enemies) {
            enemy.remove();
        }
        this.enemies = [];
        this.boss = null;
        this.kills = 0;
        
        console.log('👀 Enemies cleared');
    }
}

// ===================================
// ENEMY CLASS
// ===================================
class Enemy {
    constructor(config, engine) {
        this.engine = engine;
        this.position = config.position || { x: 0, z: 50 };
        this.color = config.color || 0xFF6666;
        this.speed = config.speed || 0.02;
        this.behavior = config.behavior || 'wander'; // 'wander', 'static', 'flee'
        this.health = config.health || 1;
        this.isDead = false;
        this.deathTimer = 0;
        
        // AI state
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.wanderTimer = 0;
        
        this.mesh = this.createMesh();
        this.updatePosition();
        engine.scene.add(this.mesh);
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        // Body (using cylinder - compatible with r182)
        const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
        const bodyMat = new THREE.MeshLambertMaterial({ color: this.color });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xFFDBAC });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.8;
        head.castShadow = true;
        group.add(head);
        
        return group;
    }
    
    update(engine) {
        if (this.isDead) {
            this.deathTimer--;
            return;
        }
        
        // AI behavior
        switch(this.behavior) {
            case 'wander':
                this.updateWander();
                break;
            case 'flee':
                this.updateFlee(engine);
                break;
            case 'static':
                // Don't move
                break;
        }
        
        this.updatePosition();
    }
    
    updateWander() {
        // Simple wandering AI
        this.wanderTimer--;
        
        if (this.wanderTimer <= 0) {
            // Pick new direction
            this.wanderAngle = Math.random() * Math.PI * 2;
            this.wanderTimer = Math.random() * 120 + 60; // 1-3 seconds
        }
        
        this.position.x += Math.sin(this.wanderAngle) * this.speed;
        this.position.z += Math.cos(this.wanderAngle) * this.speed;
    }
    
    updateFlee(engine) {
        // Flee from player
        if (!engine.player) return;
        
        const dx = this.position.x - engine.player.position.x;
        const dz = this.position.z - engine.player.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < 20) {
            // Run away!
            this.position.x += (dx / distance) * this.speed * 2;
            this.position.z += (dz / distance) * this.speed * 2;
        }
    }
    
    updatePosition() {
        const groundY = this.engine.getTerrainHeight(this.position.x, this.position.z);
        this.mesh.position.set(this.position.x, groundY, this.position.z);
    }
    
    remove() {
        this.engine.scene.remove(this.mesh);
    }
}

// ===================================
// BOSS CLASS (extends Enemy)
// ===================================
class Boss extends Enemy {
    constructor(config, engine) {
        super(config, engine);
        this.health = config.health || 10;
        this.maxHealth = this.health;
        this.damageFlashTimer = 0;
        this.attackTimer = 0;
        this.attackCooldown = 120; // 2 seconds
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        // Larger, more intimidating body (using cylinder - compatible with r182)
        const bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.4, 8);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.5;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const headMat = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 3.2;
        head.castShadow = true;
        group.add(head);
        
        // Scale up
        group.scale.set(1.5, 1.5, 1.5);
        
        return group;
    }
    
    update(engine) {
        if (this.isDead) {
            this.deathTimer--;
            return;
        }
        
        // Boss always chases player aggressively
        if (engine.player) {
            const dx = engine.player.position.x - this.position.x;
            const dz = engine.player.position.z - this.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            // Move towards player
            this.position.x += (dx / distance) * this.speed * 1.5;
            this.position.z += (dz / distance) * this.speed * 1.5;
            
            // Attack if close
            if (distance < 3) {
                this.attackTimer--;
                if (this.attackTimer <= 0) {
                    this.attack(engine);
                    this.attackTimer = this.attackCooldown;
                }
            }
        }
        
        // Damage flash effect
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer--;
            this.mesh.children[0].material.emissive.setHex(0xFF0000);
        } else {
            this.mesh.children[0].material.emissive.setHex(0x000000);
        }
        
        this.updatePosition();
    }
    
    takeDamage(amount) {
        this.health -= amount;
        this.damageFlashTimer = 10;
        
        if (this.health <= 0) {
            this.isDead = true;
            this.deathTimer = 300; // 5 seconds
            console.log('🎉 BOSS DEFEATED!');
        }
    }
    
    attack(engine) {
        // Simple melee attack - pushes player back
        engine.state.speed *= -0.3;
        console.log('💥 Boss attacked!');
    }
}
