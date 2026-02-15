/**
 * APPLESAUCE Skater Goons System
 * Manages AI enemies with physics-based movement and combat
 */

export class SkaterGoonsManager {
    constructor(scene, havokPlugin) {
        this.scene = scene;
        this.havokPlugin = havokPlugin;
        
        this.goons = [];
        this.maxGoons = 50; // Performance limit
        this.spawnTimer = 0;
        
        // Goon types
        this.goonTypes = new Map();
        
        console.log('👥 Skater Goons Manager initialized');
    }
    
    /**
     * Register a goon type
     */
    registerGoonType(typeData) {
        const type = {
            id: typeData.id,
            name: typeData.name,
            
            // Stats
            health: typeData.health || 100,
            speed: typeData.speed || 5,
            damage: typeData.damage || 10,
            attackRange: typeData.attackRange || 2,
            detectionRange: typeData.detectionRange || 15,
            
            // AI behavior
            aggression: typeData.aggression || 0.5, // 0-1
            retreatThreshold: typeData.retreatThreshold || 0.3, // % health
            
            // Visual
            color: typeData.color || '#8B4513',
            size: typeData.size || { width: 0.8, height: 1.8, depth: 0.5 },
            
            // Custom data
            custom: typeData.custom || {}
        };
        
        this.goonTypes.set(type.id, type);
        console.log(`👥 Registered goon type: ${type.name}`);
        
        return type;
    }
    
    /**
     * Spawn a goon at position
     */
    spawnGoon(typeId, position) {
        if (this.goons.length >= this.maxGoons) {
            console.warn('Max goons reached');
            return null;
        }
        
        const type = this.goonTypes.get(typeId);
        if (!type) {
            console.error('Goon type not found:', typeId);
            return null;
        }
        
        const goon = this.createGoonMesh(type, position);
        this.goons.push(goon);
        
        console.log(`👥 Spawned ${type.name} at (${position.x}, ${position.y}, ${position.z})`);
        
        return goon;
    }
    
    /**
     * Create goon mesh and physics
     */
    createGoonMesh(type, position) {
        // Create body
        const body = BABYLON.MeshBuilder.CreateBox(
            "goon_body",
            type.size,
            this.scene
        );
        body.position = position.clone();
        
        // Material
        const mat = new BABYLON.StandardMaterial("goonMat", this.scene);
        mat.diffuseColor = BABYLON.Color3.FromHexString(type.color);
        body.material = mat;
        
        // Physics
        const aggregate = new BABYLON.PhysicsAggregate(
            body,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 70, restitution: 0.1, friction: 0.4 },
            this.scene
        );
        
        // Create board (visual only)
        const board = BABYLON.MeshBuilder.CreateBox(
            "goon_board",
            { width: 0.6, height: 0.1, depth: 2 },
            this.scene
        );
        board.parent = body;
        board.position.y = -1;
        
        const boardMat = new BABYLON.StandardMaterial("boardMat", this.scene);
        boardMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        board.material = boardMat;
        
        // Goon data
        const goon = {
            type: type,
            mesh: body,
            board: board,
            aggregate: aggregate,
            position: body.position,
            
            // State
            health: type.health,
            maxHealth: type.health,
            isDead: false,
            isRetreating: false,
            
            // AI
            target: null,
            state: 'idle', // idle, chase, attack, retreat
            stateTimer: 0,
            attackCooldown: 0,
            
            // Movement
            velocity: new BABYLON.Vector3(0, 0, 0),
            targetDirection: new BABYLON.Vector3(0, 0, 0)
        };
        
        return goon;
    }
    
    /**
     * Main update loop
     */
    update(deltaTime, player) {
        // Update each goon
        this.goons.forEach(goon => {
            if (!goon.isDead) {
                this.updateGoon(goon, deltaTime, player);
            }
        });
        
        // Remove dead goons
        this.removeDeadGoons();
    }
    
    /**
     * Update individual goon AI and physics
     */
    updateGoon(goon, deltaTime, player) {
        if (!player || !player.collider) return;
        
        const goonPos = goon.position;
        const playerPos = player.collider.position;
        
        // Calculate distance to player
        const toPlayer = playerPos.subtract(goonPos);
        const distance = toPlayer.length();
        
        // Update state based on distance and health
        this.updateGoonState(goon, distance);
        
        // Execute AI based on state
        switch (goon.state) {
            case 'idle':
                this.executeIdleState(goon, deltaTime);
                break;
            case 'chase':
                this.executeChaseState(goon, deltaTime, toPlayer, distance);
                break;
            case 'attack':
                this.executeAttackState(goon, deltaTime, player);
                break;
            case 'retreat':
                this.executeRetreatState(goon, deltaTime, toPlayer);
                break;
        }
        
        // Update cooldowns
        if (goon.attackCooldown > 0) {
            goon.attackCooldown -= deltaTime;
        }
        if (goon.stateTimer > 0) {
            goon.stateTimer -= deltaTime;
        }
    }
    
    /**
     * Update goon AI state
     */
    updateGoonState(goon, distance) {
        const type = goon.type;
        const healthPercent = goon.health / goon.maxHealth;
        
        // Check for retreat
        if (healthPercent < type.retreatThreshold && !goon.isRetreating) {
            goon.state = 'retreat';
            goon.isRetreating = true;
            return;
        }
        
        // State transitions
        if (distance < type.attackRange) {
            if (goon.state !== 'attack') {
                goon.state = 'attack';
                goon.stateTimer = 1.0;
            }
        } else if (distance < type.detectionRange) {
            if (goon.state !== 'chase') {
                goon.state = 'chase';
            }
        } else {
            if (goon.state !== 'idle') {
                goon.state = 'idle';
            }
        }
    }
    
    /**
     * Execute idle state (wander or stand still)
     */
    executeIdleState(goon, deltaTime) {
        // Slowly come to a stop
        if (goon.aggregate && goon.aggregate.body) {
            const velocity = goon.aggregate.body.getLinearVelocity();
            goon.aggregate.body.setLinearVelocity(velocity.scale(0.95));
        }
    }
    
    /**
     * Execute chase state (move toward player)
     */
    executeChaseState(goon, deltaTime, toPlayer, distance) {
        if (!goon.aggregate || !goon.aggregate.body) return;
        
        const type = goon.type;
        
        // Calculate direction
        const direction = toPlayer.normalize();
        
        // Apply force toward player
        const force = direction.scale(type.speed * 30);
        force.y = 0; // Keep on ground
        
        goon.aggregate.body.applyForce(
            force,
            goon.position
        );
        
        // Rotate to face player
        const angle = Math.atan2(direction.x, direction.z);
        goon.mesh.rotation.y = angle;
    }
    
    /**
     * Execute attack state (damage player)
     */
    executeAttackState(goon, deltaTime, player) {
        const type = goon.type;
        
        // Face player
        if (player && player.collider) {
            const toPlayer = player.collider.position.subtract(goon.position);
            const angle = Math.atan2(toPlayer.x, toPlayer.z);
            goon.mesh.rotation.y = angle;
        }
        
        // Attack if off cooldown
        if (goon.attackCooldown <= 0) {
            console.log(`👥 Goon attacks player! ${type.damage} damage`);
            goon.attackCooldown = 1.5; // 1.5 second cooldown
            
            // Apply damage to player (you'll need to implement this)
            if (player.takeDamage) {
                player.takeDamage(type.damage);
            }
            
            // Visual feedback
            this.createAttackFlash(goon);
        }
    }
    
    /**
     * Execute retreat state (run away)
     */
    executeRetreatState(goon, deltaTime, toPlayer) {
        if (!goon.aggregate || !goon.aggregate.body) return;
        
        const type = goon.type;
        
        // Run away from player
        const direction = toPlayer.normalize().scale(-1);
        
        const force = direction.scale(type.speed * 40); // Faster retreat
        force.y = 0;
        
        goon.aggregate.body.applyForce(
            force,
            goon.position
        );
        
        // Face away from player
        const angle = Math.atan2(direction.x, direction.z);
        goon.mesh.rotation.y = angle;
    }
    
    /**
     * Create attack flash effect
     */
    createAttackFlash(goon) {
        const flash = BABYLON.MeshBuilder.CreateSphere(
            "attackFlash",
            { diameter: 2 },
            this.scene
        );
        flash.position = goon.position.clone();
        
        const mat = new BABYLON.StandardMaterial("flashMat", this.scene);
        mat.emissiveColor = new BABYLON.Color3(1, 0, 0);
        mat.alpha = 0.5;
        flash.material = mat;
        
        setTimeout(() => flash.dispose(), 200);
    }
    
    /**
     * Remove dead goons
     */
    removeDeadGoons() {
        const deadGoons = this.goons.filter(g => g.isDead);
        
        deadGoons.forEach(goon => {
            // Fade out
            if (goon.mesh) {
                const startAlpha = goon.mesh.material.alpha || 1;
                let alpha = startAlpha;
                
                const fadeInterval = setInterval(() => {
                    alpha -= 0.05;
                    if (goon.mesh.material) {
                        goon.mesh.material.alpha = alpha;
                    }
                    
                    if (alpha <= 0) {
                        clearInterval(fadeInterval);
                        this.disposeGoon(goon);
                    }
                }, 50);
            } else {
                this.disposeGoon(goon);
            }
        });
        
        // Remove from array
        this.goons = this.goons.filter(g => !g.isDead);
    }
    
    /**
     * Dispose goon meshes
     */
    disposeGoon(goon) {
        if (goon.mesh) goon.mesh.dispose();
        if (goon.board) goon.board.dispose();
        if (goon.aggregate) goon.aggregate.dispose();
    }
    
    /**
     * Spawn wave of goons
     */
    spawnWave(typeId, count, centerPos, radius = 20) {
        console.log(`👥 Spawning wave: ${count} ${typeId} goons`);
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const offset = new BABYLON.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            
            const spawnPos = centerPos.add(offset);
            this.spawnGoon(typeId, spawnPos);
        }
    }
    
    /**
     * Get all living goons
     */
    getAliveGoons() {
        return this.goons.filter(g => !g.isDead);
    }
    
    /**
     * Get goons in range of position
     */
    getGoonsInRange(position, range) {
        return this.goons.filter(g => {
            if (g.isDead) return false;
            const distance = g.position.subtract(position).length();
            return distance <= range;
        });
    }
    
    /**
     * Clear all goons
     */
    clearAll() {
        this.goons.forEach(goon => this.disposeGoon(goon));
        this.goons = [];
        console.log('👥 All goons cleared');
    }
    
    /**
     * Get stats
     */
    getStats() {
        return {
            total: this.goons.length,
            alive: this.getAliveGoons().length,
            dead: this.goons.filter(g => g.isDead).length,
            max: this.maxGoons
        };
    }
}
