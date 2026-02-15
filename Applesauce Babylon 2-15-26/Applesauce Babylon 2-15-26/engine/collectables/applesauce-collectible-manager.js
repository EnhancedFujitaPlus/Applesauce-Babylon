/**
 * APPLESAUCE Collectible Manager
 * Handles crates, helmets, and other pickups with proper cleanup
 * Fixes the null reference error
 */

export class CollectibleManager {
    constructor(core, saveSystem) {
        this.core = core;
        this.scene = core.scene;
        this.saveSystem = saveSystem;
        
        // Track active collectibles
        this.activeCollectibles = new Map(); // id -> collectible object
        
        // Current level ID (set by level)
        this.currentLevelId = null;
        
        console.log('📦 Collectible Manager initialized');
    }
    
    /**
     * Set the current level (called by level onLevelStart)
     */
    setLevel(levelId) {
        this.currentLevelId = levelId;
        console.log(`📍 Set level: ${levelId}`);
    }
    
    /**
     * Create a collectible crate
     * 
     * @param {Object} config - Crate configuration
     * @param {string} config.id - Unique ID for this crate
     * @param {BABYLON.Vector3} config.position - World position
     * @param {number} config.reward - How many helmets it contains
     * @param {string} config.type - Type of crate ('helmet', 'skull', 'secret')
     */
    createCrate(config) {
        const {
            id,
            position = new BABYLON.Vector3(0, 1, 0),
            reward = 5,
            type = 'helmet'
        } = config;
        
        // Check if already collected in this level
        if (this.saveSystem.isItemCollected(this.currentLevelId, id, 'crate')) {
            console.log(`⏭️ Crate ${id} already collected, skipping spawn`);
            return null;
        }
        
        // Create crate mesh
        const crate = BABYLON.MeshBuilder.CreateBox(
            `crate_${id}`,
            { size: 1.5 },
            this.scene
        );
        crate.position = position.clone();
        
        // Material based on type
        const mat = new BABYLON.StandardMaterial(`crateMat_${id}`, this.scene);
        switch (type) {
            case 'helmet':
                mat.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.2); // Gold
                mat.emissiveColor = new BABYLON.Color3(0.2, 0.15, 0.05);
                break;
            case 'skull':
                mat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9); // White/bone
                mat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
                break;
            case 'secret':
                mat.diffuseColor = new BABYLON.Color3(0.5, 0.2, 0.8); // Purple
                mat.emissiveColor = new BABYLON.Color3(0.2, 0.05, 0.3);
                break;
        }
        crate.material = mat;
        
        // Add physics (trigger only, no collision)
        const aggregate = new BABYLON.PhysicsAggregate(
            crate,
            BABYLON.PhysicsShapeType.BOX,
            {
                mass: 0, // Static
                restitution: 0
            },
            this.scene
        );
        aggregate.body.setCollisionCallbackEnabled(true);
        
        // Floating animation
        let time = Math.random() * Math.PI * 2;
        const startY = position.y;
        
        const animationObserver = this.scene.onBeforeRenderObservable.add(() => {
            // CRITICAL: Check if crate still exists before animating
            if (!crate || crate.isDisposed()) {
                // Clean up observer if crate is gone
                if (animationObserver) {
                    this.scene.onBeforeRenderObservable.remove(animationObserver);
                }
                return;
            }
            
            time += this.core.getDeltaTime();
            crate.position.y = startY + Math.sin(time * 2) * 0.2;
            crate.rotation.y += 0.01;
        });
        
        // Store collectible data
        const collectibleData = {
            mesh: crate,
            aggregate: aggregate,
            id: id,
            type: type,
            reward: reward,
            collected: false, // This is the property that was null!
            animationObserver: animationObserver,
            
            // Method to safely mark as collected
            collect: () => {
                // Prevent double collection
                if (collectibleData.collected) {
                    console.log(`⚠️ Crate ${id} already collected!`);
                    return false;
                }
                
                collectibleData.collected = true;
                
                // Mark as collected in save system
                const wasNew = this.saveSystem.collectItem(
                    this.currentLevelId,
                    id,
                    'crate'
                );
                
                // Add currency if it's a new collection
                if (wasNew) {
                    this.saveSystem.addHelmets(reward);
                    this.showCollectionEffect(crate.position, type, reward);
                }
                
                // Clean up
                this.removeCrate(id);
                
                return wasNew;
            }
        };
        
        // Store in active collectibles
        this.activeCollectibles.set(id, collectibleData);
        
        // Set up collision detection
        aggregate.body.getCollisionObservable().add((collision) => {
            // CRITICAL: Check if collectible data still exists
            if (!this.activeCollectibles.has(id)) {
                return;
            }
            
            const data = this.activeCollectibles.get(id);
            
            // CRITICAL: Check if already collected before accessing properties
            if (!data || data.collected) {
                return;
            }
            
            // Check if player collided with crate
            const otherMesh = collision.collider === crate ? 
                              collision.collidedAgainst : collision.collider;
            
            if (otherMesh === this.core.player) {
                data.collect();
            }
        });
        
        console.log(`📦 Created ${type} crate: ${id} (${reward} helmets)`);
        return collectibleData;
    }
    
    /**
     * Safely remove a crate (fixes the null error)
     */
    removeCrate(id) {
        if (!this.activeCollectibles.has(id)) {
            return;
        }
        
        const data = this.activeCollectibles.get(id);
        
        // Remove animation observer FIRST
        if (data.animationObserver) {
            this.scene.onBeforeRenderObservable.remove(data.animationObserver);
            data.animationObserver = null;
        }
        
        // Dispose physics
        if (data.aggregate) {
            data.aggregate.dispose();
            data.aggregate = null;
        }
        
        // Dispose mesh
        if (data.mesh && !data.mesh.isDisposed()) {
            data.mesh.dispose();
            data.mesh = null;
        }
        
        // Remove from tracking
        this.activeCollectibles.delete(id);
        
        console.log(`🗑️ Removed crate: ${id}`);
    }
    
    /**
     * Show visual effect when collecting
     */
    showCollectionEffect(position, type, amount) {
        // Create particle effect
        const particleSystem = new BABYLON.ParticleSystem(
            "collectEffect",
            50,
            this.scene
        );
        
        // Particle texture
        particleSystem.particleTexture = new BABYLON.Texture(
            "https://assets.babylonjs.com/textures/flare.png",
            this.scene
        );
        
        // Position
        particleSystem.emitter = position;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.2, 0, -0.2);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.2, 0.5, 0.2);
        
        // Colors based on type
        switch (type) {
            case 'helmet':
                particleSystem.color1 = new BABYLON.Color4(1, 0.8, 0.2, 1);
                particleSystem.color2 = new BABYLON.Color4(1, 0.6, 0, 1);
                break;
            case 'skull':
                particleSystem.color1 = new BABYLON.Color4(0.9, 0.9, 0.9, 1);
                particleSystem.color2 = new BABYLON.Color4(0.7, 0.7, 0.7, 1);
                break;
            case 'secret':
                particleSystem.color1 = new BABYLON.Color4(0.8, 0.2, 1, 1);
                particleSystem.color2 = new BABYLON.Color4(0.5, 0, 0.8, 1);
                break;
        }
        
        // Size
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;
        
        // Lifetime
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 0.8;
        
        // Emission
        particleSystem.emitRate = 50;
        
        // Speed
        particleSystem.minEmitPower = 2;
        particleSystem.maxEmitPower = 5;
        particleSystem.updateSpeed = 0.01;
        
        // Gravity
        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
        
        // Start and auto-dispose
        particleSystem.start();
        
        setTimeout(() => {
            particleSystem.stop();
            setTimeout(() => {
                particleSystem.dispose();
            }, 1000);
        }, 500);
        
        // Show UI notification
        this.showUINotification(type, amount);
    }
    
    /**
     * Show UI notification for collection
     */
    showUINotification(type, amount) {
        // This would integrate with your UI system
        // For now, just console log
        const emoji = type === 'helmet' ? '🪖' : 
                     type === 'skull' ? '💀' : '✨';
        
        console.log(`${emoji} +${amount} ${type}s! Total: ${this.saveSystem.getHelmets()}`);
        
        // You can dispatch a custom event for your UI to catch
        window.dispatchEvent(new CustomEvent('collectible-collected', {
            detail: { type, amount, total: this.saveSystem.getHelmets() }
        }));
    }
    
    /**
     * Create multiple crates at once
     */
    createCrateField(crates) {
        crates.forEach(crateConfig => {
            this.createCrate(crateConfig);
        });
    }
    
    /**
     * Clear all collectibles (called when changing levels)
     */
    clearAll() {
        const ids = Array.from(this.activeCollectibles.keys());
        ids.forEach(id => this.removeCrate(id));
        
        console.log('🧹 Cleared all collectibles');
    }
    
    /**
     * Get collection stats for current level
     */
    getLevelStats() {
        if (!this.currentLevelId) return null;
        
        const total = this.activeCollectibles.size;
        const collected = this.saveSystem.data.levelProgress[this.currentLevelId]?.cratesOpened?.length || 0;
        
        return {
            total: total,
            collected: collected,
            remaining: total - collected,
            percentage: total > 0 ? Math.floor((collected / total) * 100) : 0
        };
    }
}
