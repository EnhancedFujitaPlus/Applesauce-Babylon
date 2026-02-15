/**
 * TORNADO SYSTEM FOR APPLESAUCE
 * Three.js-based tornado with visual effects, physics, and terrain deformation
 * Designed for Level 8: THE FARMS
 */

class TornadoSystem {
    constructor(scene, terrain, config = {}) {
        this.scene = scene;
        this.terrain = terrain; // Reference to terrain with deform() method
        
        // Tornado properties
        this.position = new THREE.Vector3(
            config.startX || 0,
            0,
            config.startZ || 0
        );
        
        this.velocity = new THREE.Vector3(
            config.velocityX || 0.1,
            0,
            config.velocityZ || 0.05
        );
        
        this.radius = config.radius || 8;          // Funnel radius
        this.height = config.height || 35;         // Funnel height
        this.strength = config.strength || 0.3;    // Suction strength
        this.rotationSpeed = config.rotationSpeed || 0.15;
        this.deformRate = config.deformRate || 0.02; // How much it carves terrain
        
        // Visual components
        this.funnel = null;
        this.debris = [];
        this.dustParticles = [];
        this.cloudTop = null;
        
        // Physics
        this.rotation = 0;
        this.lifetime = config.lifetime || Infinity;
        this.age = 0;
        
        // Sound would go here if you add audio
        this.isActive = true;
        
        this.buildVisuals();
    }
    
    /**
     * BUILD THE TORNADO VISUALS
     * Creates a swirling funnel using geometry and particles
     */
    buildVisuals() {
        // === FUNNEL (Main tornado cone) ===
        const funnelGeometry = new THREE.CylinderGeometry(
            this.radius * 0.3,  // Top radius (narrower)
            this.radius,        // Bottom radius (wider)
            this.height,        // Height
            16,                 // Radial segments
            20,                 // Height segments
            true                // Open-ended
        );
        
        // Spiral UV mapping for animated texture
        const uvs = funnelGeometry.attributes.uv.array;
        for (let i = 0; i < uvs.length; i += 2) {
            uvs[i] += Math.sin(uvs[i + 1] * Math.PI * 4) * 0.2;
        }
        
        // Semi-transparent dark gray material
        const funnelMaterial = new THREE.MeshBasicMaterial({
            color: 0x404040,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            wireframe: false
        });
        
        this.funnel = new THREE.Mesh(funnelGeometry, funnelMaterial);
        this.funnel.position.copy(this.position);
        this.funnel.position.y = this.height / 2;
        this.scene.add(this.funnel);
        
        // === CLOUD TOP (Dark storm cloud) ===
        const cloudGeometry = new THREE.SphereGeometry(this.radius * 1.5, 16, 16);
        const cloudMaterial = new THREE.MeshBasicMaterial({
            color: 0x2a2a2a,
            transparent: true,
            opacity: 0.8
        });
        
        this.cloudTop = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.cloudTop.position.copy(this.position);
        this.cloudTop.position.y = this.height + 3;
        this.cloudTop.scale.y = 0.4; // Flatten it
        this.scene.add(this.cloudTop);
        
        // === DEBRIS PARTICLES (Flying objects) ===
        this.createDebrisField();
        
        // === DUST PARTICLES (Ground-level swirl) ===
        this.createDustParticles();
    }
    
    /**
     * CREATE DEBRIS FIELD
     * Objects caught in the tornado's vortex
     */
    createDebrisField() {
        const debrisCount = 30;
        
        for (let i = 0; i < debrisCount; i++) {
            const size = Math.random() * 0.4 + 0.2;
            const geometry = new THREE.BoxGeometry(size, size, size);
            const material = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0x8B4513 : 0x654321 // Brown debris
            });
            
            const debris = new THREE.Mesh(geometry, material);
            
            // Initial position in spiral around tornado
            const angle = (i / debrisCount) * Math.PI * 2;
            const heightRatio = Math.random();
            const spiralRadius = this.radius * (1 - heightRatio * 0.5);
            
            debris.userData = {
                angle: angle,
                heightRatio: heightRatio,
                orbitRadius: spiralRadius,
                orbitSpeed: 0.05 + Math.random() * 0.05,
                bobSpeed: Math.random() * 0.03,
                bobPhase: Math.random() * Math.PI * 2
            };
            
            this.debris.push(debris);
            this.scene.add(debris);
        }
    }
    
    /**
     * CREATE DUST PARTICLES
     * Ground-level swirling dust
     */
    createDustParticles() {
        const dustCount = 50;
        
        for (let i = 0; i < dustCount; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 4, 4);
            const material = new THREE.MeshBasicMaterial({
                color: 0xD2B48C, // Tan/dust color
                transparent: true,
                opacity: 0.5
            });
            
            const dust = new THREE.Mesh(geometry, material);
            
            dust.userData = {
                angle: Math.random() * Math.PI * 2,
                radius: Math.random() * this.radius,
                speed: 0.1 + Math.random() * 0.1,
                height: Math.random() * 3,
                bobPhase: Math.random() * Math.PI * 2
            };
            
            this.dustParticles.push(dust);
            this.scene.add(dust);
        }
    }
    
    /**
     * UPDATE TORNADO
     * Handles movement, rotation, physics effects, and terrain deformation
     */
    update(playerPosition, delta = 1) {
        if (!this.isActive) return false;
        
        this.age += delta;
        if (this.age > this.lifetime) {
            this.destroy();
            return false;
        }
        
        // === MOVEMENT ===
        this.position.add(this.velocity);
        
        // Keep tornado on the ground
        if (this.terrain && this.terrain.getHeight) {
            this.position.y = this.terrain.getHeight(this.position.x, this.position.z);
        }
        
        // Update funnel position
        this.funnel.position.copy(this.position);
        this.funnel.position.y += this.height / 2;
        
        // Update cloud position
        this.cloudTop.position.copy(this.position);
        this.cloudTop.position.y = this.position.y + this.height + 3;
        
        // === ROTATION ===
        this.rotation += this.rotationSpeed;
        this.funnel.rotation.y = this.rotation;
        this.cloudTop.rotation.y = this.rotation * 0.5;
        
        // === TERRAIN DEFORMATION ===
        // Carve a path as the tornado moves
        if (this.terrain && this.terrain.deform) {
            this.terrain.deform(
                this.position.x,
                this.position.z,
                this.radius * 0.6,  // Deform radius
                this.deformRate     // Depth per frame
            );
        }
        
        // === UPDATE DEBRIS ===
        this.debris.forEach(debris => {
            const data = debris.userData;
            
            // Spiral upward
            data.angle += data.orbitSpeed;
            data.heightRatio = (data.heightRatio + 0.003) % 1;
            
            // Calculate position in vortex
            const currentRadius = data.orbitRadius * (1 - data.heightRatio * 0.5);
            const x = this.position.x + Math.cos(data.angle) * currentRadius;
            const z = this.position.z + Math.sin(data.angle) * currentRadius;
            const y = this.position.y + data.heightRatio * this.height + 
                     Math.sin(data.bobPhase) * 0.5;
            
            debris.position.set(x, y, z);
            
            // Rotate debris
            debris.rotation.x += 0.05;
            debris.rotation.y += 0.03;
            data.bobPhase += data.bobSpeed;
        });
        
        // === UPDATE DUST PARTICLES ===
        this.dustParticles.forEach(dust => {
            const data = dust.userData;
            
            // Spiral motion
            data.angle += data.speed;
            
            const x = this.position.x + Math.cos(data.angle) * data.radius;
            const z = this.position.z + Math.sin(data.angle) * data.radius;
            const y = this.position.y + data.height + Math.sin(data.bobPhase) * 0.3;
            
            dust.position.set(x, y, z);
            data.bobPhase += 0.05;
        });
        
        // === PLAYER PHYSICS ===
        if (playerPosition) {
            this.applyPhysicsToObject(playerPosition, 'player');
        }
        
        return true; // Still active
    }
    
    /**
     * APPLY PHYSICS TO OBJECTS
     * Pulls objects toward tornado vortex
     */
    applyPhysicsToObject(objectPosition, objectType = 'generic') {
        const dx = this.position.x - objectPosition.x;
        const dz = this.position.z - objectPosition.z;
        const distanceXZ = Math.sqrt(dx * dx + dz * dz);
        
        // Within tornado radius?
        if (distanceXZ < this.radius * 1.5) {
            const force = (1 - distanceXZ / (this.radius * 1.5)) * this.strength;
            
            // Return force object that the game can apply to velocity
            return {
                pullX: (dx / distanceXZ) * force,
                pullZ: (dz / distanceXZ) * force,
                lift: force * 0.5, // Upward lift
                spin: this.rotationSpeed * force // Spinning effect
            };
        }
        
        return null;
    }
    
    /**
     * CHECK IF POSITION IS INSIDE TORNADO
     */
    isInsideTornado(position) {
        const dx = position.x - this.position.x;
        const dz = position.z - this.position.z;
        const distanceXZ = Math.sqrt(dx * dx + dz * dz);
        
        return distanceXZ < this.radius;
    }
    
    /**
     * GET TORNADO FORCE AT POSITION
     * Returns strength value 0-1
     */
    getForceAtPosition(position) {
        const dx = position.x - this.position.x;
        const dz = position.z - this.position.z;
        const distanceXZ = Math.sqrt(dx * dx + dz * dz);
        
        if (distanceXZ >= this.radius * 1.5) return 0;
        
        return (1 - distanceXZ / (this.radius * 1.5)) * this.strength;
    }
    
    /**
     * DESTROY TORNADO
     * Clean up all visuals
     */
    destroy() {
        this.isActive = false;
        
        // Remove main visuals
        if (this.funnel) {
            this.scene.remove(this.funnel);
            this.funnel.geometry.dispose();
            this.funnel.material.dispose();
        }
        
        if (this.cloudTop) {
            this.scene.remove(this.cloudTop);
            this.cloudTop.geometry.dispose();
            this.cloudTop.material.dispose();
        }
        
        // Remove debris
        this.debris.forEach(debris => {
            this.scene.remove(debris);
            debris.geometry.dispose();
            debris.material.dispose();
        });
        
        // Remove dust
        this.dustParticles.forEach(dust => {
            this.scene.remove(dust);
            dust.geometry.dispose();
            dust.material.dispose();
        });
        
        this.debris = [];
        this.dustParticles = [];
    }
    
    /**
     * CHANGE TORNADO PATH
     * Useful for AI-controlled movement
     */
    setVelocity(x, z) {
        this.velocity.set(x, 0, z);
    }
    
    /**
     * INTENSIFY TORNADO
     * Makes it stronger/larger
     */
    intensify(multiplier = 1.2) {
        this.strength *= multiplier;
        this.radius *= multiplier;
        this.rotationSpeed *= multiplier;
    }
}

// ========================================
// INTEGRATION HELPER FOR LEVEL 8
// ========================================

/**
 * How to add tornado to your level:
 * 
 * 1. After terrain is created, initialize tornado:
 * 
 *    const tornado = new TornadoSystem(scene, terrain, {
 *        startX: 0,
 *        startZ: 50,
 *        velocityX: 0.15,
 *        velocityZ: 0.1,
 *        radius: 10,
 *        strength: 0.4
 *    });
 * 
 * 2. In your update() loop, update tornado:
 * 
 *    tornado.update(player.position);
 * 
 * 3. Apply tornado physics to player:
 * 
 *    const tornadoForce = tornado.applyPhysicsToObject(player.position, 'player');
 *    if (tornadoForce) {
 *        state.velocityX += tornadoForce.pullX;
 *        state.velocityZ += tornadoForce.pullZ;
 *        state.jumpVelocity += tornadoForce.lift;
 *        state.rotation += tornadoForce.spin;
 *    }
 * 
 * 4. Optional: Apply to cows and other objects
 * 
 *    cows.forEach(cow => {
 *        const force = tornado.applyPhysicsToObject(cow.position, 'cow');
 *        if (force && !cow.userData.tipped) {
 *            // Tornado tips the cow!
 *            tipCow(cow, true);
 *        }
 *    });
 */
