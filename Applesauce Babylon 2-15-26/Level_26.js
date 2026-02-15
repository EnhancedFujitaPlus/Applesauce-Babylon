/**
 * APPLESAUCE Level 26 - Helmet Factory Battle
 * Example level showcasing helmet combat system
 */

window.Level26Config = {
    meta: {
        name: "LEVEL 26 - HELMET FACTORY SHOWDOWN",
        description: "Battle through waves of skater goons in the abandoned helmet factory",
        author: "South of South Records",
        difficulty: "HARD"
    },
    
    terrain: {
        type: 'factory',
        size: 1500,
        theme: 'industrial'
    },
    
    playerStart: {
        x: 0,
        y: 5,
        z: 0
    },
    
    /**
     * Called when level loads
     */
    async onLevelStart(core) {
        console.log('🏭 Initializing Helmet Factory...');
        
        // Setup helmet system
        const { BabylonHelmetSystem } = await import('./engine/babylon-helmet-system.js');
        const { HelmetEffectsManager } = await import('./engine/babylon-helmet-effects.js');
        const { HelmetInventoryUI } = await import('./engine/babylon-helmet-inventory.js');
        const { SkaterGoonsManager } = await import('./engine/babylon-skater-goons.js');
        
        // Create managers
        core.helmetSystem = new BabylonHelmetSystem(core.scene, core.player);
        core.effectsManager = new HelmetEffectsManager(core.scene);
        core.goonsManager = new SkaterGoonsManager(core.scene, core.havokPlugin);
        
        // Link effects to helmet system
        core.helmetSystem.setEffectsManager(core.effectsManager);
        
        // Register helmet types
        this.registerHelmets(core.helmetSystem);
        
        // Register goon types
        this.registerGoons(core.goonsManager);
        
        // Setup initial loadout
        this.setupStartingLoadout(core.helmetSystem);
        
        // Create UI
        core.inventoryUI = new HelmetInventoryUI(core.helmetSystem);
        
        // Create factory environment
        this.createFactoryEnvironment(core);
        
        // Spawn initial wave
        setTimeout(() => {
            this.spawnWave1(core);
        }, 2000);
        
        console.log('âœ… Helmet Factory ready!');
    },
    
    /**
     * Register all helmet types
     */
    registerHelmets(helmetSystem) {
        // BASIC HELMET
        helmetSystem.registerHelmet({
            id: 'basic_red',
            name: 'Red Crusher',
            description: 'Standard issue combat helmet',
            damage: 25,
            range: 3,
            knockback: 2,
            cooldown: 30,
            color: '#FF0000',
            particleColor: '#FF4444'
        });
        
        // FIRE HELMET
        helmetSystem.registerHelmet({
            id: 'fire_orange',
            name: 'Blazer Mk.1',
            description: 'Ignites enemies on impact',
            damage: 30,
            range: 4,
            knockback: 3,
            cooldown: 45,
            element: 'fire',
            color: '#FF4500',
            particleColor: '#FF6600',
            comboMultiplier: 1.3
        });
        
        // ICE HELMET
        helmetSystem.registerHelmet({
            id: 'ice_blue',
            name: 'Frost Dome',
            description: 'Freezes enemies in place',
            damage: 20,
            range: 3.5,
            knockback: 1,
            cooldown: 40,
            element: 'ice',
            color: '#00FFFF',
            particleColor: '#88FFFF',
            special: (helmetSystem, results) => {
                // Slow targets
                results.targets.forEach(target => {
                    if (target.aggregate && target.aggregate.body) {
                        const vel = target.aggregate.body.getLinearVelocity();
                        target.aggregate.body.setLinearVelocity(vel.scale(0.3));
                    }
                });
            }
        });
        
        // ELECTRIC HELMET
        helmetSystem.registerHelmet({
            id: 'electric_yellow',
            name: 'Thunderstrike',
            description: 'Chain lightning to nearby enemies',
            damage: 35,
            range: 5,
            knockback: 4,
            cooldown: 50,
            element: 'electric',
            color: '#FFFF00',
            particleColor: '#FFFF88',
            comboMultiplier: 1.5,
            special: (helmetSystem, results) => {
                // Chain to nearby enemies (you'd implement this)
                console.log('⚡ Chain lightning activated!');
            }
        });
        
        // GORE HELMET
        helmetSystem.registerHelmet({
            id: 'gore_skull',
            name: 'Skullcrusher',
            description: 'Brutal melee devastation',
            damage: 50,
            range: 2.5,
            knockback: 5,
            cooldown: 60,
            element: 'gore',
            color: '#8B0000',
            particleColor: '#AA0000',
            comboMultiplier: 1.4
        });
        
        // SPEED HELMET
        helmetSystem.registerHelmet({
            id: 'speed_green',
            name: 'Velocity Visor',
            description: 'Rapid-fire attacks',
            damage: 15,
            range: 2,
            knockback: 1,
            cooldown: 15, // Very fast
            element: null,
            color: '#00FF00',
            particleColor: '#44FF44',
            comboMultiplier: 1.1
        });
        
        console.log('🪖 All helmets registered');
    },
    
    /**
     * Register goon types
     */
    registerGoons(goonsManager) {
        // BASIC GOON
        goonsManager.registerGoonType({
            id: 'basic_goon',
            name: 'Street Skater',
            health: 75,
            speed: 5,
            damage: 10,
            attackRange: 2,
            detectionRange: 15,
            color: '#8B4513'
        });
        
        // TANK GOON
        goonsManager.registerGoonType({
            id: 'tank_goon',
            name: 'Heavy Crusher',
            health: 150,
            speed: 3,
            damage: 25,
            attackRange: 2.5,
            detectionRange: 20,
            color: '#4B4B4B',
            size: { width: 1.2, height: 2.2, depth: 0.8 }
        });
        
        // FAST GOON
        goonsManager.registerGoonType({
            id: 'fast_goon',
            name: 'Speed Demon',
            health: 50,
            speed: 10,
            damage: 15,
            attackRange: 1.5,
            detectionRange: 25,
            aggression: 0.8,
            color: '#FF4500'
        });
        
        console.log('👥 All goon types registered');
    },
    
    /**
     * Setup starting helmet loadout
     */
    setupStartingLoadout(helmetSystem) {
        // Give player starting helmets
        helmetSystem.equipToSlot('basic_red', 0);      // Slot 1
        helmetSystem.equipToSlot('fire_orange', 1);    // Slot 2
        helmetSystem.equipToSlot('ice_blue', 2);       // Slot 3
        
        console.log('🎒 Starting loadout equipped');
    },
    
    /**
     * Create factory environment
     */
    createFactoryEnvironment(core) {
        // Create factory floor sections
        for (let x = -3; x <= 3; x++) {
            for (let z = -3; z <= 3; z++) {
                const platform = BABYLON.MeshBuilder.CreateBox(
                    `platform_${x}_${z}`,
                    { width: 20, height: 3, depth: 20 },
                    core.scene
                );
                
                platform.position = new BABYLON.Vector3(x * 20, -1, z * 20);
                
                const mat = new BABYLON.StandardMaterial("platformMat", core.scene);
                mat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35);
                platform.material = mat;
                platform.receiveShadow = true;
                
                // Physics
                new BABYLON.PhysicsAggregate(
                    platform,
                    BABYLON.PhysicsShapeType.BOX,
                    { mass: 0, friction: 0.8 },
                    core.scene
                );
            }
        }
        
        // Create helmet storage crates
        this.createHelmetCrates(core);
        
        // Create machinery (decorative)
        this.createMachinery(core);
        
        console.log('🏭 Factory environment created');
    },
    
    /**
     * Create helmet storage crates (collectibles)
     */
    createHelmetCrates(core) {
        const cratePositions = [
            { x: 20, z: 20, helmetId: 'electric_yellow' },
            { x: -20, z: 20, helmetId: 'gore_skull' },
            { x: 20, z: -20, helmetId: 'speed_green' },
            { x: -20, z: -20, helmetId: 'fire_orange' }
        ];
        
        cratePositions.forEach(pos => {
            const crate = BABYLON.MeshBuilder.CreateBox(
                "helmetCrate",
                { width: 2, height: 2, depth: 2 },
                core.scene
            );
            
            crate.position = new BABYLON.Vector3(pos.x, 1, pos.z);
            
            const mat = new BABYLON.StandardMaterial("crateMat", core.scene);
            mat.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2);
            mat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0);
            crate.material = mat;
            
            // Make it collectable
            crate.metadata = { helmetId: pos.helmetId, collected: false };
            
            // Pulse animation
            let rotation = 0;
            core.scene.registerBeforeRender(() => {
                if (!crate.metadata.collected) {
                    rotation += 0.01;
                    crate.rotation.y = rotation;
                    crate.position.y = 1 + Math.sin(rotation * 5) * 0.2;
                }
            });
        });
    },
    
    /**
     * Create factory machinery (decorative)
     */
    createMachinery(core) {
        // Conveyor belts (simple boxes)
        for (let i = 0; i < 4; i++) {
            const belt = BABYLON.MeshBuilder.CreateBox(
                `conveyor_${i}`,
                { width: 30, height: 0.5, depth: 3 },
                core.scene
            );
            
            belt.position = new BABYLON.Vector3(
                -30 + i * 20,
                0.5,
                -40
            );
            
            const mat = new BABYLON.StandardMaterial("beltMat", core.scene);
            mat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            belt.material = mat;
        }
        
        console.log('⚙️ Machinery created');
    },
    
    /**
     * Spawn first wave
     */
    spawnWave1(core) {
        console.log('🌊 WAVE 1 - Basic Assault');
        
        const spawnCenter = new BABYLON.Vector3(30, 2, 0);
        core.goonsManager.spawnWave('basic_goon', 5, spawnCenter, 10);
        
        // Schedule wave 2
        setTimeout(() => this.spawnWave2(core), 15000);
    },
    
    /**
     * Spawn second wave
     */
    spawnWave2(core) {
        console.log('🌊 WAVE 2 - Mixed Forces');
        
        const spawnCenter = new BABYLON.Vector3(-30, 2, 0);
        core.goonsManager.spawnWave('basic_goon', 3, spawnCenter, 12);
        core.goonsManager.spawnWave('fast_goon', 2, spawnCenter, 15);
        
        // Schedule wave 3
        setTimeout(() => this.spawnWave3(core), 20000);
    },
    
    /**
     * Spawn third wave (boss wave)
     */
    spawnWave3(core) {
        console.log('🌊 WAVE 3 - BOSS WAVE');
        
        const spawnCenter = new BABYLON.Vector3(0, 2, 40);
        core.goonsManager.spawnWave('tank_goon', 2, spawnCenter, 8);
        core.goonsManager.spawnWave('fast_goon', 4, spawnCenter, 15);
    },
    
    /**
     * Main update loop
     */
    onUpdate(core) {
        const deltaTime = core.getDeltaTime();
        
        // Update helmet system
        if (core.helmetSystem) {
            core.helmetSystem.update(deltaTime);
        }
        
        // Update inventory UI
        if (core.inventoryUI) {
            core.inventoryUI.update();
        }
        
        // Update goons
        if (core.goonsManager) {
            core.goonsManager.update(deltaTime, core.player);
        }
        
        // Check for attack input
        if ((core.keys[' '] || core.keys['j']) && core.helmetSystem) {
            const targets = core.goonsManager ? core.goonsManager.getAliveGoons() : [];
            core.helmetSystem.attack(targets);
        }
        
        // Check for helmet crate collection
        this.checkCrateCollection(core);
    },
    
    /**
     * Check if player collected any helmet crates
     */
    checkCrateCollection(core) {
        if (!core.player || !core.player.collider) return;
        
        const playerPos = core.player.collider.position;
        const crates = core.scene.meshes.filter(m => 
            m.name === 'helmetCrate' && !m.metadata?.collected
        );
        
        crates.forEach(crate => {
            const distance = crate.position.subtract(playerPos).length();
            
            if (distance < 3) {
                // Collect!
                crate.metadata.collected = true;
                
                // Add helmet to system
                const helmetId = crate.metadata.helmetId;
                const firstEmpty = core.helmetSystem.equippedHelmets.findIndex(h => h === null);
                
                if (firstEmpty !== -1) {
                    core.helmetSystem.equipToSlot(helmetId, firstEmpty);
                    core.inventoryUI.showNotification(`Collected new helmet!`);
                }
                
                // Create collection effect
                core.effectsManager.createImpactBurst(
                    crate.position,
                    '#FFD700'
                );
                
                // Remove crate
                crate.dispose();
            }
        });
    }
};
