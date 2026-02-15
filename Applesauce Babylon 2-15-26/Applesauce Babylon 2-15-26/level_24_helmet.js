/**
 * LEVEL 24 - HELMET FACTORY BATTLE
 * Example level using Babylon.js + Helmet Combat System
 * 
 * This uses the traditional window.Level24Config format
 * (non-module) to match your existing APPLESAUCE structure
 */

window.Level24Config = {
    meta: {
        name: "LEVEL 24 - HELMET FACTORY SHOWDOWN",
        description: "Battle through waves of skater goons in the abandoned helmet factory",
        author: "South of South Records",
        difficulty: "HARD",
        theme: "industrial"
    },
    
    /**
     * Called when level starts
     * @param {Object} game - Game instance
     */
    async onLevelStart(game) {
        console.log('🏭 Initializing Helmet Factory Battle...');
        
        // Setup camera
        this.setupCamera(game);
        
        // Setup lighting
        this.setupLighting(game);
        
        // Create environment
        this.createFactoryFloor(game);
        
        // Create player
        await this.createPlayer(game);
        
        // Initialize helmet combat system
        this.initHelmetSystem(game);
        
        // Spawn first wave after delay
        setTimeout(() => {
            this.spawnWave1(game);
        }, 2000);
        
        // Setup HUD updates
        this.setupHUD(game);
        
        console.log('✅ Helmet Factory ready!');
    },
    
    /**
     * Setup camera
     */
    setupCamera(game) {
        game.camera = new BABYLON.FollowCamera(
            "followCam",
            new BABYLON.Vector3(0, 10, -15),
            game.scene
        );
        
        game.camera.radius = 15;
        game.camera.heightOffset = 8;
        game.camera.rotationOffset = 0;
        game.camera.cameraAcceleration = 0.05;
        game.camera.maxCameraSpeed = 20;
        
        game.scene.activeCamera = game.camera;
        
        console.log('📷 Camera configured');
    },
    
    /**
     * Setup lighting
     */
    setupLighting(game) {
        const ambient = new BABYLON.HemisphericLight(
            "ambient",
            new BABYLON.Vector3(0, 1, 0),
            game.scene
        );
        ambient.intensity = 0.6;
        ambient.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        
        const sun = new BABYLON.DirectionalLight(
            "sun",
            new BABYLON.Vector3(-1, -2, -1),
            game.scene
        );
        sun.position = new BABYLON.Vector3(50, 100, 50);
        sun.intensity = 0.8;
        
        console.log('💡 Lighting configured');
    },
    
    /**
     * Create factory floor
     */
    createFactoryFloor(game) {
        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            { width: 200, height: 200 },
            game.scene
        );
        
        const groundMat = new BABYLON.StandardMaterial("groundMat", game.scene);
        groundMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35);
        ground.material = groundMat;
        ground.receiveShadow = true;
        
        new BABYLON.PhysicsAggregate(
            ground,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 0, friction: 0.8 },
            game.scene
        );
        
        // Add some platforms
        for (let i = 0; i < 5; i++) {
            const platform = BABYLON.MeshBuilder.CreateBox(
                `platform_${i}`,
                { width: 15, height: 2, depth: 15 },
                game.scene
            );
            
            platform.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 80,
                1,
                (Math.random() - 0.5) * 80
            );
            
            const platMat = new BABYLON.StandardMaterial("platMat", game.scene);
            platMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.5);
            platform.material = platMat;
            
            new BABYLON.PhysicsAggregate(
                platform,
                BABYLON.PhysicsShapeType.BOX,
                { mass: 0, friction: 0.8 },
                game.scene
            );
        }
        
        console.log('🏭 Factory floor created');
    },
    
    /**
     * Create player
     */
    async createPlayer(game) {
        const playerBox = BABYLON.MeshBuilder.CreateBox(
            "player",
            { width: 1, height: 2, depth: 0.5 },
            game.scene
        );
        playerBox.position = new BABYLON.Vector3(0, 5, 0);
        
        const playerMat = new BABYLON.StandardMaterial("playerMat", game.scene);
        playerMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
        playerBox.material = playerMat;
        
        const aggregate = new BABYLON.PhysicsAggregate(
            playerBox,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 70, restitution: 0.1, friction: 0.4 },
            game.scene
        );
        
        // Create player object
        game.player = {
            collider: playerBox,
            root: playerBox,
            aggregate: aggregate,
            position: playerBox.position,
            rotation: playerBox.rotation
        };
        
        game.camera.lockedTarget = playerBox;
        
        console.log('🛹 Player created');
    },
    
    /**
     * Initialize helmet combat system
     */
    initHelmetSystem(game) {
        // Create helmet system
        game.modules.helmets = new BabylonHelmetSystem(game.scene, game.player);
        game.modules.effects = new HelmetEffectsManager(game.scene);
        
        game.modules.helmets.setEffectsManager(game.modules.effects);
        
        // Register helmets
        this.registerHelmets(game.modules.helmets);
        
        // Setup starting loadout
        game.modules.helmets.equipToSlot('basic_red', 0);
        game.modules.helmets.equipToSlot('fire_orange', 1);
        game.modules.helmets.equipToSlot('ice_blue', 2);
        
        // Initialize enemies array
        game.enemies = [];
        
        console.log('🪖 Helmet system initialized');
    },
    
    /**
     * Register helmet types
     */
    registerHelmets(helmetSystem) {
        helmetSystem.registerHelmet({
            id: 'basic_red',
            name: 'Red Crusher',
            damage: 25,
            range: 3,
            knockback: 2,
            cooldown: 30,
            color: '#FF0000'
        });
        
        helmetSystem.registerHelmet({
            id: 'fire_orange',
            name: 'Blazer Mk.1',
            damage: 30,
            range: 4,
            knockback: 3,
            cooldown: 45,
            element: 'fire',
            color: '#FF4500'
        });
        
        helmetSystem.registerHelmet({
            id: 'ice_blue',
            name: 'Frost Dome',
            damage: 20,
            range: 3.5,
            knockback: 1,
            cooldown: 40,
            element: 'ice',
            color: '#00FFFF'
        });
        
        helmetSystem.registerHelmet({
            id: 'electric_yellow',
            name: 'Thunderstrike',
            damage: 35,
            range: 5,
            knockback: 4,
            cooldown: 50,
            element: 'electric',
            color: '#FFFF00'
        });
        
        console.log('🪖 Helmets registered');
    },
    
    /**
     * Setup HUD updates
     */
    setupHUD(game) {
        const scoreEl = document.getElementById('score');
        const comboEl = document.getElementById('combo');
        const speedEl = document.getElementById('speed');
        const killsEl = document.getElementById('kills');
        
        // Update function
        game.updateHUD = () => {
            if (scoreEl) scoreEl.textContent = `SCORE: ${game.state.score}`;
            if (killsEl) killsEl.textContent = `KILLS: ${game.state.kills}`;
            
            if (game.modules.helmets) {
                const comboInfo = game.modules.helmets.getComboInfo();
                if (comboEl) {
                    comboEl.textContent = `COMBO: ${comboInfo.count}x`;
                    comboEl.style.color = comboInfo.count > 0 ? '#FF1493' : '#666';
                }
            }
            
            if (game.player && game.player.aggregate) {
                const vel = game.player.aggregate.body.getLinearVelocity();
                const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
                if (speedEl) speedEl.textContent = `SPEED: ${speed.toFixed(1)}`;
            }
        };
    },
    
    /**
     * Spawn enemy
     */
    spawnEnemy(game, position, type = 'basic') {
        const enemy = BABYLON.MeshBuilder.CreateBox(
            "enemy",
            { width: 0.8, height: 1.8, depth: 0.5 },
            game.scene
        );
        
        enemy.position = position.clone();
        
        const mat = new BABYLON.StandardMaterial("enemyMat", game.scene);
        mat.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1);
        enemy.material = mat;
        
        const aggregate = new BABYLON.PhysicsAggregate(
            enemy,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 70, restitution: 0.1, friction: 0.4 },
            game.scene
        );
        
        const enemyObj = {
            mesh: enemy,
            aggregate: aggregate,
            position: enemy.position,
            health: 75,
            maxHealth: 75,
            isDead: false,
            type: type
        };
        
        game.enemies.push(enemyObj);
        
        return enemyObj;
    },
    
    /**
     * Wave spawning
     */
    spawnWave1(game) {
        console.log('🌊 WAVE 1 - Basic Assault');
        
        const spawnCenter = new BABYLON.Vector3(30, 2, 0);
        
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5;
            const offset = new BABYLON.Vector3(
                Math.cos(angle) * 10,
                0,
                Math.sin(angle) * 10
            );
            
            this.spawnEnemy(game, spawnCenter.add(offset));
        }
        
        // Schedule wave 2
        setTimeout(() => this.spawnWave2(game), 15000);
    },
    
    spawnWave2(game) {
        console.log('🌊 WAVE 2 - Reinforcements');
        
        const spawnCenter = new BABYLON.Vector3(-30, 2, 0);
        
        for (let i = 0; i < 7; i++) {
            const angle = (Math.PI * 2 * i) / 7;
            const offset = new BABYLON.Vector3(
                Math.cos(angle) * 12,
                0,
                Math.sin(angle) * 12
            );
            
            this.spawnEnemy(game, spawnCenter.add(offset));
        }
    },
    
    /**
     * Main update loop
     */
    onUpdate(game) {
        const deltaTime = game.getDeltaTime();
        
        // Update helmet system
        if (game.modules.helmets) {
            game.modules.helmets.update(deltaTime);
        }
        
        // Handle player input
        this.handlePlayerInput(game);
        
        // Update enemies (simple AI)
        this.updateEnemies(game, deltaTime);
        
        // Remove dead enemies
        this.removeDeadEnemies(game);
        
        // Update HUD
        if (game.updateHUD) {
            game.updateHUD();
        }
    },
    
    /**
     * Handle player input
     */
    handlePlayerInput(game) {
        if (!game.player || !game.player.aggregate) return;
        
        const moveForce = 50;
        const body = game.player.aggregate.body;
        
        // Movement
        if (game.keys['w'] || game.keys['arrowup']) {
            const forward = new BABYLON.Vector3(0, 0, moveForce);
            body.applyForce(forward, game.player.position);
        }
        if (game.keys['s'] || game.keys['arrowdown']) {
            const backward = new BABYLON.Vector3(0, 0, -moveForce * 0.6);
            body.applyForce(backward, game.player.position);
        }
        if (game.keys['a'] || game.keys['arrowleft']) {
            const left = new BABYLON.Vector3(-moveForce * 0.8, 0, 0);
            body.applyForce(left, game.player.position);
        }
        if (game.keys['d'] || game.keys['arrowright']) {
            const right = new BABYLON.Vector3(moveForce * 0.8, 0, 0);
            body.applyForce(right, game.player.position);
        }
        
        // Jump
        if (game.keys[' '] && !this.jumpCooldown) {
            const jump = new BABYLON.Vector3(0, 300, 0);
            body.applyImpulse(jump, game.player.position);
            this.jumpCooldown = true;
            setTimeout(() => this.jumpCooldown = false, 500);
        }
        
        // Attack
        if (game.keys['j'] && game.modules.helmets) {
            const aliveEnemies = game.enemies.filter(e => !e.isDead);
            const results = game.modules.helmets.attack(aliveEnemies);
            
            if (results && results.hits > 0) {
                game.state.score += results.hits * 10;
            }
        }
        
        // Switch helmets (1-3 keys)
        if (game.keys['1']) game.modules.helmets.switchToSlot(0);
        if (game.keys['2']) game.modules.helmets.switchToSlot(1);
        if (game.keys['3']) game.modules.helmets.switchToSlot(2);
    },
    
    /**
     * Simple enemy AI
     */
    updateEnemies(game, deltaTime) {
        if (!game.player) return;
        
        const playerPos = game.player.position;
        
        game.enemies.forEach(enemy => {
            if (enemy.isDead) return;
            
            const toPlayer = playerPos.subtract(enemy.position);
            const distance = toPlayer.length();
            
            // Chase player if in range
            if (distance < 20 && enemy.aggregate && enemy.aggregate.body) {
                const direction = toPlayer.normalize();
                const force = direction.scale(20);
                force.y = 0;
                
                enemy.aggregate.body.applyForce(force, enemy.position);
            }
        });
    },
    
    /**
     * Remove dead enemies
     */
    removeDeadEnemies(game) {
        const deadEnemies = game.enemies.filter(e => e.isDead);
        
        deadEnemies.forEach(enemy => {
            if (enemy.mesh && enemy.mesh.material) {
                enemy.mesh.material.alpha = Math.max(0, (enemy.mesh.material.alpha || 1) - 0.02);
                
                if (enemy.mesh.material.alpha <= 0) {
                    if (enemy.mesh) enemy.mesh.dispose();
                    if (enemy.aggregate) enemy.aggregate.dispose();
                    
                    const index = game.enemies.indexOf(enemy);
                    if (index > -1) {
                        game.enemies.splice(index, 1);
                        game.state.kills++;
                    }
                }
            }
        });
    }
};

console.log('✅ Level 24 config loaded');
