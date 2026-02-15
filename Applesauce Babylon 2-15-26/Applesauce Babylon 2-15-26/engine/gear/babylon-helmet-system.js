/**
 * APPLESAUCE Babylon Helmet System
 * Manages helmets as weapons with stats, effects, and switching
 */

export class BabylonHelmetSystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        
        // Helmet database
        this.helmetLibrary = new Map();
        
        // Active helmets (1-9 slots)
        this.equippedHelmets = new Array(9).fill(null);
        this.currentSlot = 0;
        
        // Attack state
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        
        // Visual elements
        this.currentHelmetMesh = null;
        this.effectsManager = null;
        
        console.log('🪖 Helmet System initialized');
    }
    
    /**
     * Register a helmet type in the library
     */
    registerHelmet(helmetData) {
        const helmet = {
            id: helmetData.id,
            name: helmetData.name,
            description: helmetData.description || '',
            
            // Combat stats
            damage: helmetData.damage || 25,
            range: helmetData.range || 3,
            knockback: helmetData.knockback || 2,
            cooldown: helmetData.cooldown || 30, // frames
            comboMultiplier: helmetData.comboMultiplier || 1.2,
            
            // Special properties
            element: helmetData.element || null, // 'fire', 'ice', 'electric', 'gore'
            special: helmetData.special || null, // Custom function
            
            // Visual
            color: helmetData.color || '#FF0000',
            particleColor: helmetData.particleColor || helmetData.color,
            meshUrl: helmetData.meshUrl || null, // Custom mesh
            
            // Custom data
            custom: helmetData.custom || {}
        };
        
        this.helmetLibrary.set(helmet.id, helmet);
        console.log(`🪖 Registered helmet: ${helmet.name}`);
        
        return helmet;
    }
    
    /**
     * Equip helmet to a slot (1-9)
     */
    equipToSlot(helmetId, slot) {
        if (slot < 0 || slot > 8) {
            console.error('Invalid slot:', slot);
            return false;
        }
        
        const helmet = this.helmetLibrary.get(helmetId);
        if (!helmet) {
            console.error('Helmet not found:', helmetId);
            return false;
        }
        
        this.equippedHelmets[slot] = helmet;
        console.log(`🪖 Equipped ${helmet.name} to slot ${slot + 1}`);
        
        // Switch to this slot if it's the first helmet
        if (this.getCurrentHelmet() === null) {
            this.switchToSlot(slot);
        }
        
        return true;
    }
    
    /**
     * Switch to a specific slot
     */
    switchToSlot(slot) {
        if (slot < 0 || slot > 8) return false;
        
        const helmet = this.equippedHelmets[slot];
        if (!helmet) {
            console.log(`Slot ${slot + 1} is empty`);
            return false;
        }
        
        this.currentSlot = slot;
        this.updateHelmetVisual(helmet);
        
        console.log(`🪖 Switched to ${helmet.name}`);
        return true;
    }
    
    /**
     * Get currently active helmet
     */
    getCurrentHelmet() {
        return this.equippedHelmets[this.currentSlot];
    }
    
    /**
     * Update visual representation of helmet on player
     */
    updateHelmetVisual(helmet) {
        // Remove old helmet mesh
        if (this.currentHelmetMesh) {
            this.currentHelmetMesh.dispose();
            this.currentHelmetMesh = null;
        }
        
        if (!this.player || !this.player.root) return;
        
        // Create new helmet mesh
        if (helmet.meshUrl) {
            // Load custom mesh
            BABYLON.SceneLoader.ImportMesh(
                "",
                "",
                helmet.meshUrl,
                this.scene,
                (meshes) => {
                    this.currentHelmetMesh = meshes[0];
                    this.attachHelmetToPlayer();
                }
            );
        } else {
            // Create default helmet (sphere for now)
            this.currentHelmetMesh = BABYLON.MeshBuilder.CreateSphere(
                "helmet",
                { diameter: 1.2 },
                this.scene
            );
            
            const helmetMat = new BABYLON.StandardMaterial("helmetMat", this.scene);
            helmetMat.diffuseColor = BABYLON.Color3.FromHexString(helmet.color);
            helmetMat.emissiveColor = BABYLON.Color3.FromHexString(helmet.color).scale(0.3);
            this.currentHelmetMesh.material = helmetMat;
            
            this.attachHelmetToPlayer();
        }
    }
    
    /**
     * Attach helmet mesh to player
     */
    attachHelmetToPlayer() {
        if (!this.currentHelmetMesh || !this.player || !this.player.root) return;
        
        this.currentHelmetMesh.parent = this.player.root;
        this.currentHelmetMesh.position = new BABYLON.Vector3(0, 1.5, 0);
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        // Update cooldowns
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime * 60; // Convert to frames
            if (this.attackCooldown < 0) {
                this.attackCooldown = 0;
                this.isAttacking = false;
            }
        }
        
        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                this.resetCombo();
            }
        }
    }
    
    /**
     * Perform attack with current helmet
     */
    attack(targets = []) {
        const helmet = this.getCurrentHelmet();
        if (!helmet) {
            console.log('No helmet equipped');
            return null;
        }
        
        if (this.attackCooldown > 0) {
            console.log('Attack on cooldown');
            return null;
        }
        
        console.log(`⚔️ Attacking with ${helmet.name}`);
        
        this.isAttacking = true;
        this.attackCooldown = helmet.cooldown;
        
        // Calculate damage with combo multiplier
        const baseDamage = helmet.damage;
        const comboDamage = baseDamage * Math.pow(helmet.comboMultiplier, this.comboCount);
        
        // Get attack results
        const results = this.checkHits(helmet, comboDamage, targets);
        
        // Update combo
        if (results.hits > 0) {
            this.comboCount++;
            this.comboTimer = 2.0; // 2 second combo window
        }
        
        // Trigger special effects
        this.triggerAttackEffects(helmet, results);
        
        // Call special ability if exists
        if (helmet.special) {
            helmet.special(this, results);
        }
        
        return results;
    }
    
    /**
     * Check for hits on targets
     */
    checkHits(helmet, damage, targets) {
        const results = {
            hits: 0,
            targets: [],
            damage: damage
        };
        
        if (!this.player || !this.player.collider) return results;
        
        const playerPos = this.player.collider.position;
        const playerRot = this.player.collider.rotation || new BABYLON.Vector3(0, 0, 0);
        
        // Calculate attack direction
        const attackDir = new BABYLON.Vector3(
            Math.sin(playerRot.y),
            0,
            Math.cos(playerRot.y)
        );
        
        // Attack cone parameters
        const range = helmet.range;
        const coneAngle = Math.PI / 3; // 60 degrees
        
        targets.forEach(target => {
            if (!target || !target.position || target.isDead) return;
            
            const targetPos = target.position;
            const toTarget = targetPos.subtract(playerPos);
            const distance = toTarget.length();
            
            // Check if in range
            if (distance > range) return;
            
            // Check if in attack cone
            const toTargetNorm = toTarget.normalize();
            const dot = BABYLON.Vector3.Dot(attackDir, toTargetNorm);
            const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
            
            if (angle > coneAngle / 2) return;
            
            // HIT!
            results.hits++;
            results.targets.push(target);
            
            // Apply damage
            this.dealDamage(target, damage, helmet);
            
            // Apply knockback
            this.applyKnockback(target, attackDir, helmet.knockback);
        });
        
        return results;
    }
    
    /**
     * Deal damage to target
     */
    dealDamage(target, damage, helmet) {
        if (!target.health) target.health = 100;
        
        target.health -= damage;
        
        console.log(`💥 Dealt ${damage.toFixed(0)} damage! (${target.health.toFixed(0)} HP left)`);
        
        // Check for death
        if (target.health <= 0) {
            target.isDead = true;
            console.log('💀 Target defeated!');
            
            // Trigger death effects
            this.triggerDeathEffects(target, helmet);
        }
    }
    
    /**
     * Apply knockback using Havok physics
     */
    applyKnockback(target, direction, force) {
        if (!target.aggregate || !target.aggregate.body) return;
        
        const knockbackForce = direction.scale(force * 100);
        knockbackForce.y = force * 50; // Pop them up
        
        target.aggregate.body.applyImpulse(
            knockbackForce,
            target.position
        );
    }
    
    /**
     * Trigger visual effects for attack
     */
    triggerAttackEffects(helmet, results) {
        if (!this.effectsManager) return;
        
        // Create particle burst at attack point
        const playerPos = this.player.collider.position;
        const playerRot = this.player.collider.rotation || new BABYLON.Vector3(0, 0, 0);
        
        const attackDir = new BABYLON.Vector3(
            Math.sin(playerRot.y),
            0,
            Math.cos(playerRot.y)
        );
        
        const attackPos = playerPos.add(attackDir.scale(helmet.range * 0.5));
        
        // Create effect based on element
        if (helmet.element) {
            this.effectsManager.createElementalBurst(
                attackPos,
                helmet.element,
                helmet.particleColor
            );
        } else {
            this.effectsManager.createImpactBurst(
                attackPos,
                helmet.particleColor
            );
        }
        
        // Hit effects on each target
        results.targets.forEach(target => {
            if (target.position) {
                this.effectsManager.createHitEffect(
                    target.position,
                    helmet.element,
                    helmet.particleColor
                );
            }
        });
    }
    
    /**
     * Trigger death effects
     */
    triggerDeathEffects(target, helmet) {
        if (!this.effectsManager || !target.position) return;
        
        // Create death explosion
        this.effectsManager.createDeathExplosion(
            target.position,
            helmet.element,
            helmet.particleColor
        );
        
        // Gore if enabled
        if (helmet.element === 'gore') {
            this.effectsManager.createGoreSplatter(
                target.position,
                new BABYLON.Vector3(0, 1, 0)
            );
        }
    }
    
    /**
     * Reset combo counter
     */
    resetCombo() {
        if (this.comboCount > 0) {
            console.log(`🎯 Combo ended at ${this.comboCount}x`);
        }
        this.comboCount = 0;
        this.comboTimer = 0;
    }
    
    /**
     * Get combo info
     */
    getComboInfo() {
        return {
            count: this.comboCount,
            timeLeft: this.comboTimer,
            multiplier: Math.pow(
                this.getCurrentHelmet()?.comboMultiplier || 1,
                this.comboCount
            )
        };
    }
    
    /**
     * Set effects manager
     */
    setEffectsManager(manager) {
        this.effectsManager = manager;
    }
    
    /**
     * Get all equipped helmets
     */
    getEquippedHelmets() {
        return this.equippedHelmets.filter(h => h !== null);
    }
    
    /**
     * Get all available helmets from library
     */
    getAllHelmets() {
        return Array.from(this.helmetLibrary.values());
    }
    
    /**
     * Save current loadout
     */
    saveLoadout() {
        const loadout = this.equippedHelmets.map(h => h ? h.id : null);
        localStorage.setItem('applesauce_helmet_loadout', JSON.stringify(loadout));
        console.log('💾 Loadout saved');
    }
    
    /**
     * Load saved loadout
     */
    loadLoadout() {
        const saved = localStorage.getItem('applesauce_helmet_loadout');
        if (!saved) return false;
        
        try {
            const loadout = JSON.parse(saved);
            loadout.forEach((helmetId, slot) => {
                if (helmetId) {
                    this.equipToSlot(helmetId, slot);
                }
            });
            console.log('📂 Loadout loaded');
            return true;
        } catch (e) {
            console.error('Failed to load loadout:', e);
            return false;
        }
    }
}
