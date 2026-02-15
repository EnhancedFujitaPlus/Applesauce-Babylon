/**
 * APPLESAUCE Enemies Module v2.0
 * Enhanced enemy AI with proper collision integration
 * Works with ApplesauceCollision v2.0 and ApplesauceWeapons
 */
import * as THREE from '../three.module.js';

export class ApplesauceEnemies {
    constructor(engine) {
        this.engine = engine;
        this.enemies = [];
        this.boss = null;
        
        // Stats
        this.stats = {
            spawned: 0,
            killed: 0,
            killedByPlayer: 0,
            killedByWeapon: 0
        };
        
        // Enemy configuration
        this.config = {
            maxEnemies: 50,  // Performance limit
            spawnDistance: 100,  // How far ahead to spawn
            despawnDistance: 150,  // When to remove
            enableAI: true
        };
        
        console.log('👹 Enemies module v2.0 loaded');
    }
    
    // ===================================
    // ENEMY SPAWNING
    // ===================================
    
    /**
     * Spawn a basic enemy
     */
    spawnEnemy(config = {}) {
        if (this.enemies.length >= this.config.maxEnemies) {
            console.warn('Max enemies reached');
            return null;
        }
        
        const enemy = new Enemy(config, this.engine);
        this.enemies.push(enemy);
        this.stats.spawned++;
        
        return enemy;
    }
    
    /**
     * Spawn a boss enemy
     */
    spawnBoss(config = {}) {
        this.boss = new Boss(config, this.engine);
        this.enemies.push(this.boss);
        this.stats.spawned++;
        
        return this.boss;
    }
    
    /**
     * Spawn enemies in a line
     */
    spawnLine(startX, startZ, count, spacing = 3, config = {}) {
        const enemies = [];
        
        for (let i = 0; i < count; i++) {
            const enemy = this.spawnEnemy({
                ...config,
                position: {
                    x: startX,
                    y: 0,
                    z: startZ - (i * spacing)
                }
            });
            
            if (enemy) enemies.push(enemy);
        }
        
        return enemies;
    }
    
    /**
     * Spawn enemies in a cluster
     */
    spawnCluster(centerX, centerZ, count, radius = 5, config = {}) {
        const enemies = [];
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const z = centerZ + Math.sin(angle) * radius;
            
            const enemy = this.spawnEnemy({
                ...config,
                position: { x, y: 0, z }
            });
            
            if (enemy) enemies.push(enemy);
        }
        
        return enemies;
    }
    
    /**
     * Spawn enemies in a grid
     */
    spawnGrid(centerX, centerZ, rows, cols, spacing = 5, config = {}) {
        const enemies = [];
        
        const totalWidth = (cols - 1) * spacing;
        const totalDepth = (rows - 1) * spacing;
        const startX = centerX - totalWidth / 2;
        const startZ = centerZ - totalDepth / 2;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * spacing;
                const z = startZ + row * spacing;
                
                const enemy = this.spawnEnemy({
                    ...config,
                    position: { x, y: 0, z }
                });
                
                if (enemy) enemies.push(enemy);
            }
        }
        
        return enemies;
    }
    
    /**
     * Spawn enemies along a path
     */
    spawnAlongPath(points, enemiesPerSegment = 2, config = {}) {
        const enemies = [];
        
        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];
            
            for (let j = 0; j < enemiesPerSegment; j++) {
                const t = j / enemiesPerSegment;
                const x = start.x + (end.x - start.x) * t;
                const z = start.z + (end.z - start.z) * t;
                
                const enemy = this.spawnEnemy({
                    ...config,
                    position: { x, y: 0, z }
                });
                
                if (enemy) enemies.push(enemy);
            }
        }
        
        return enemies;
    }
    
    // ===================================
    // UPDATE & AI
    // ===================================
    
    update(engine) {
        const deltaTime = 1 / 60; // Assume 60fps
        
        // Update all enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Remove dead enemies that have finished death animation
            if (!enemy.alive && enemy.deathTimer <= 0) {
                enemy.remove();
                this.enemies.splice(i, 1);
                continue;
            }
            
            // Despawn enemies that are too far away
            if (engine.player) {
                const dist = enemy.mesh.position.distanceTo(engine.player.position);
                if (dist > this.config.despawnDistance) {
                    enemy.remove();
                    this.enemies.splice(i, 1);
                    continue;
                }
            }
            
            // Update enemy
            enemy.update(engine, deltaTime);
        }
    }
    
    // ===================================
    // ENEMY MANAGEMENT
    // ===================================
    
    /**
     * Kill an enemy (called by collision system)
     */
    killEnemy(enemy, source = 'player') {
        if (!enemy.alive) return;
        
        enemy.alive = false;
        enemy.deathTimer = 120; // 2 seconds
        
        this.stats.killed++;
        if (source === 'player') {
            this.stats.killedByPlayer++;
        } else if (source === 'weapon') {
            this.stats.killedByWeapon++;
        }
        
        // Hide mesh immediately (gore is handled by collision/weapons)
        enemy.mesh.visible = false;
        
        console.log(`💀 Enemy killed by ${source}`);
    }
    
    /**
     * Get nearest enemy to a position
     */
    getNearestEnemy(position, maxDistance = Infinity) {
        let nearest = null;
        let nearestDist = maxDistance;
        
        for (let enemy of this.enemies) {
            if (!enemy.alive || !enemy.mesh) continue;
            
            const dist = enemy.mesh.position.distanceTo(position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }
        
        return nearest;
    }
    
    /**
     * Get all enemies within radius
     */
    getEnemiesInRadius(position, radius) {
        const found = [];
        
        for (let enemy of this.enemies) {
            if (!enemy.alive || !enemy.mesh) continue;
            
            const dist = enemy.mesh.position.distanceTo(position);
            if (dist < radius) {
                found.push(enemy);
            }
        }
        
        return found;
    }
    
    /**
     * Get enemy count
     */
    getAliveCount() {
        return this.enemies.filter(e => e.alive).length;
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
        
        console.log('👹 Enemies cleared');
    }
    
    getStats() {
        return {
            ...this.stats,
            alive: this.getAliveCount(),
            total: this.enemies.length
        };
    }
}

// ===================================
// ENEMY CLASS
// ===================================
class Enemy {
    constructor(config, engine) {
        this.engine = engine;
        
        // Position
        this.position = config.position || { x: 0, y: 0, z: 50 };
        
        // Stats
        this.health = config.health || 100;
        this.maxHealth = this.health;
        this.speed = config.speed || 0.02;
        this.damage = config.damage || 10;
        
        // Visuals
        this.color = config.color || 0xFF6666;
        this.size = config.size || 1.0;
        
        // AI
        this.behavior = config.behavior || 'wander'; // 'wander', 'static', 'flee', 'chase'
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.wanderTimer = 0;
        this.aggroRange = config.aggroRange || 20;
        
        // State
        this.alive = true;
        this.deathTimer = 0;
        this.damageFlashTimer = 0;
        
        // Create mesh
        this.mesh = this.createMesh();
        this.updatePosition();
        engine.scene.add(this.mesh);
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.CylinderGeometry(
            0.3 * this.size,
            0.3 * this.size,
            1.2 * this.size,
            8
        );
        const bodyMat = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.8,
            metalness: 0.2
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.6 * this.size;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.3 * this.size, 12, 12);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0xFFDBAC,
            roughness: 0.9,
            metalness: 0.0
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.5 * this.size;
        head.castShadow = true;
        group.add(head);
        
        return group;
    }
    
    update(engine, deltaTime) {
        if (!this.alive) {
            this.deathTimer--;
            return;
        }
        
        // Damage flash effect
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer--;
            this.mesh.children[0].material.emissive.setHex(0xFF0000);
        } else {
            this.mesh.children[0].material.emissive.setHex(0x000000);
        }
        
        // AI behavior
        if (this.engine.modules.enemies && this.engine.modules.enemies.config.enableAI) {
            switch (this.behavior) {
                case 'wander':
                    this.updateWander(deltaTime);
                    break;
                case 'flee':
                    this.updateFlee(engine, deltaTime);
                    break;
                case 'chase':
                    this.updateChase(engine, deltaTime);
                    break;
                case 'static':
                    // Don't move
                    break;
            }
        }
        
        this.updatePosition();
    }
    
    updateWander(deltaTime) {
        this.wanderTimer -= deltaTime;
        
        if (this.wanderTimer <= 0) {
            this.wanderAngle = Math.random() * Math.PI * 2;
            this.wanderTimer = Math.random() * 2 + 1; // 1-3 seconds
        }
        
        this.position.x += Math.sin(this.wanderAngle) * this.speed;
        this.position.z += Math.cos(this.wanderAngle) * this.speed;
    }
    
    updateFlee(engine, deltaTime) {
        if (!engine.player) return;
        
        const dx = this.position.x - engine.player.position.x;
        const dz = this.position.z - engine.player.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < this.aggroRange) {
            // Run away!
            this.position.x += (dx / distance) * this.speed * 2;
            this.position.z += (dz / distance) * this.speed * 2;
        }
    }
    
    updateChase(engine, deltaTime) {
        if (!engine.player) return;
        
        const dx = engine.player.position.x - this.position.x;
        const dz = engine.player.position.z - this.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < this.aggroRange && distance > 1.5) {
            // Move towards player
            this.position.x += (dx / distance) * this.speed;
            this.position.z += (dz / distance) * this.speed;
        }
    }
    
    updatePosition() {
        const groundY = this.engine.getTerrainHeight 
            ? this.engine.getTerrainHeight(this.position.x, this.position.z)
            : 0;
        
        this.mesh.position.set(this.position.x, groundY, this.position.z);
    }
    
    takeDamage(amount) {
        this.health -= amount;
        this.damageFlashTimer = 0.1; // Flash for 6 frames
        
        if (this.health <= 0) {
            this.alive = false;
            this.deathTimer = 120;
        }
    }
    
    remove() {
        this.engine.scene.remove(this.mesh);
    }
}

// ===================================
// BOSS CLASS
// ===================================
class Boss extends Enemy {
    constructor(config, engine) {
        super({
            ...config,
            health: config.health || 500,
            speed: config.speed || 0.03,
            size: config.size || 2.0,
            color: config.color || 0xFF0000,
            behavior: 'chase'
        }, engine);
        
        this.maxHealth = this.health;
        this.attackCooldown = config.attackCooldown || 120;
        this.attackTimer = 0;
        this.attackRange = config.attackRange || 3.0;
        this.attackDamage = config.attackDamage || 50;
        
        // Boss-specific
        this.phase = 1;
        this.rageThreshold = 0.5; // Go into rage at 50% HP
        this.inRage = false;
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        // Larger body
        const bodyGeo = new THREE.CylinderGeometry(
            0.6 * this.size,
            0.6 * this.size,
            2.0 * this.size,
            8
        );
        const bodyMat = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.7,
            metalness: 0.3,
            emissive: 0x330000,
            emissiveIntensity: 0.3
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.0 * this.size;
        body.castShadow = true;
        group.add(body);
        
        // Menacing head
        const headGeo = new THREE.SphereGeometry(0.5 * this.size, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0x8B0000,
            roughness: 0.8,
            metalness: 0.2
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 2.5 * this.size;
        head.castShadow = true;
        group.add(head);
        
        return group;
    }
    
    update(engine, deltaTime) {
        if (!this.alive) {
            this.deathTimer--;
            return;
        }
        
        // Check for rage mode
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent < this.rageThreshold && !this.inRage) {
            this.enterRage();
        }
        
        // Damage flash
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer--;
            this.mesh.children[0].material.emissive.setHex(0xFF0000);
            this.mesh.children[0].material.emissiveIntensity = 0.8;
        } else {
            this.mesh.children[0].material.emissive.setHex(0x330000);
            this.mesh.children[0].material.emissiveIntensity = 0.3;
        }
        
        // Boss AI - always chases player
        if (engine.player) {
            const dx = engine.player.position.x - this.position.x;
            const dz = engine.player.position.z - this.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            // Move towards player
            const moveSpeed = this.inRage ? this.speed * 1.5 : this.speed;
            this.position.x += (dx / distance) * moveSpeed;
            this.position.z += (dz / distance) * moveSpeed;
            
            // Attack if in range
            if (distance < this.attackRange) {
                this.attackTimer--;
                if (this.attackTimer <= 0) {
                    this.attack(engine);
                    this.attackTimer = this.inRage ? 
                        this.attackCooldown * 0.5 :  // Attack faster in rage
                        this.attackCooldown;
                }
            }
        }
        
        this.updatePosition();
    }
    
    enterRage() {
        this.inRage = true;
        console.log('😡 BOSS ENTERED RAGE MODE!');
        
        // Visual feedback
        this.mesh.children[0].material.emissive.setHex(0xFF0000);
        this.mesh.children[0].material.emissiveIntensity = 0.6;
        
        // Increase stats
        this.speed *= 1.5;
        this.attackDamage *= 1.5;
    }
    
    attack(engine) {
        console.log('💥 Boss attacked!');
        
        // Simple melee attack - pushes player back
        if (engine.player) {
            const direction = new THREE.Vector3(
                engine.player.position.x - this.position.x,
                0,
                engine.player.position.z - this.position.z
            ).normalize();
            
            // Push player
            engine.state.speed = -0.5;
            
            // Damage player (if you have a health system)
            if (engine.state.health !== undefined) {
                engine.state.health -= this.attackDamage;
            }
        }
    }
    
    takeDamage(amount) {
        super.takeDamage(amount);
        
        if (!this.alive) {
            console.log('🎉 BOSS DEFEATED!');
        }
    }
}
