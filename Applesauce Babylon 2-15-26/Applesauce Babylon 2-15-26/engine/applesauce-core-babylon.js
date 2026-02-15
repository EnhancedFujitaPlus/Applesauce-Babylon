/**
 * APPLESAUCE Core Engine - BABYLON.JS + HAVOK EDITION
 * Complete game engine with physics, input, camera, and level loading
 */

export class ApplesauceCore {
    constructor(config = {}) {
        console.log('🎮 Initializing APPLESAUCE Core (Babylon.js + Havok)...');
        
        this.config = {
            goreEnabled: config.goreEnabled !== false,
            maxSpeed: config.maxSpeed || 150,
            havokPath: config.havokPath || 'https://cdn.babylonjs.com/havok/HavokPhysics_umd.js'
        };
        
        // Core properties
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.havokPlugin = null;
        
        // Game state
        this.state = {
            speed: 0,
            score: 0,
            combo: 0,
            isPlaying: false
        };
        
        // Game objects
        this.player = null;
        this.terrain = null;
        this.npcs = [];
        
        // Input
        this.keys = {};
        this.inputMap = null;
        
        // Level
        this.levelConfig = null;
        
        console.log('✅ APPLESAUCE Core initialized (awaiting Havok)');
    }
    
    /**
     * Initialize Babylon.js engine and Havok physics
     */
    async init() {
        console.log('🔧 Setting up Babylon.js engine...');
        
        // Create canvas
        this.canvas = document.getElementById('renderCanvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'renderCanvas';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.display = 'block';
            document.body.appendChild(this.canvas);
        }
        
        // Create engine
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true
        });
        
        // Create scene
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.53, 0.81, 0.92, 1.0); // Sky blue
        
        // Initialize Havok Physics
        await this.initPhysics();
        
        // Setup core systems
        this.setupCamera();
        this.setupLighting();
        this.setupInput();
        this.setupResize();
        
        console.log('✅ Babylon.js engine ready');
        
        return this;
    }
    
    /**
     * Initialize Havok physics engine
     */
    async initPhysics() {
        console.log('⚡ Loading Havok physics...');
        
        try {
            const havokInstance = await HavokPhysics();
            this.havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
            this.scene.enablePhysics(
                new BABYLON.Vector3(0, -9.81, 0), // Gravity
                this.havokPlugin
            );
            
            console.log('✅ Havok physics enabled');
        } catch (error) {
            console.error('❌ Failed to load Havok:', error);
            throw new Error('Havok physics failed to load. Make sure HavokPhysics is available.');
        }
    }
    
    /**
     * Setup camera
     */
    setupCamera() {
    // 1. Create a Pivot Point (so we don't look at the player's feet)
    this.cameraTarget = new BABYLON.TransformNode("cameraTarget", this.scene);
    this.cameraTarget.parent = this.playerMesh; // Replace with your player variable
    this.cameraTarget.position = new BABYLON.Vector3(0, 1.5, 0); // Eye-level height

    // 2. Initialize ArcRotateCamera
    // Parameters: name, alpha (rotation), beta (pitch), radius, target, scene
    this.camera = new BABYLON.ArcRotateCamera(
        "3rdPersonCam",
        BABYLON.Tools.ToRadians(-90), // Alpha: horizontal angle
        BABYLON.Tools.ToRadians(70),  // Beta: vertical angle (looking down slightly)
        10,                           // Radius: distance from target
        this.cameraTarget.position,   // Target position
        this.scene
    );

    // 3. Link the camera to the pivot node
    this.camera.lockedTarget = this.cameraTarget;

    // 4. Fine-tuning the feel
    this.camera.wheelPrecision = 50;       // Adjust mouse wheel zoom speed
    this.camera.lowerRadiusLimit = 2;      // How close can you zoom in?
    this.camera.upperRadiusLimit = 20;     // How far can you zoom out?
    this.camera.panningSensibility = 0;    // Disable right-click panning (standard for 3rd person)
    
    // 5. Attach controls to the canvas
    this.camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);

    console.log('📷 ArcRotateCamera configured');
}
    
    /**
     * Setup lighting
     */
    setupLighting() {
        // Ambient light
        const ambient = new BABYLON.HemisphericLight(
            "ambient",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambient.intensity = 0.6;
        ambient.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        
        // Directional light (sun)
        const sun = new BABYLON.DirectionalLight(
            "sun",
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        sun.position = new BABYLON.Vector3(50, 100, 50);
        sun.intensity = 0.8;
        
        // Shadows
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, sun);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurScale = 2;
        shadowGenerator.setDarkness(0.4);
        
        this.shadowGenerator = shadowGenerator;
        
        console.log('💡 Lighting configured');
    }
    
    /**
     * Setup keyboard input
     */
    setupInput() {
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    this.keys[kbInfo.event.key.toLowerCase()] = true;
                    this.onKeyDown(kbInfo.event.key);
                    break;
                case BABYLON.KeyboardEventTypes.KEYUP:
                    this.keys[kbInfo.event.key.toLowerCase()] = false;
                    this.onKeyUp(kbInfo.event.key);
                    break;
            }
        });
        
        console.log('⌨️ Input system configured');
    }
    
    /**
     * Setup window resize handler
     */
    setupResize() {
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
    
    /**
     * Load a level configuration
     */
    async loadLevel(levelConfig) {
        console.log('📦 Loading level:', levelConfig.meta?.name || 'Unnamed');
        
        this.levelConfig = levelConfig;
        
        // Clear existing level
        this.clearLevel();
        
        // Create terrain if specified
        if (levelConfig.terrain) {
            await this.createTerrain(levelConfig.terrain);
        }
        
        // Spawn player if specified
        if (levelConfig.playerStart) {
            await this.createPlayer(levelConfig.playerStart);
        }
        
        // Call level's onLevelStart hook
        if (levelConfig.onLevelStart) {
            await levelConfig.onLevelStart(this);
        }
        
        console.log('✅ Level loaded:', levelConfig.meta?.name || 'Unnamed');
    }
    
    /**
     * Create terrain (requires BabylonTerrain module)
     */
    async createTerrain(terrainConfig) {
        console.log('🏔️ Creating terrain...');
        
        // If BabylonTerrain is available, use it
        if (typeof BabylonTerrain !== 'undefined') {
            const { BabylonTerrain } = await import('./terrain/babylon-terrain.js');
            this.terrain = new BabylonTerrain(this.scene, this.havokPlugin);
            this.terrain.generate(terrainConfig);
        } else {
            // Fallback: create simple ground
            const ground = BABYLON.MeshBuilder.CreateGround(
                "ground",
                { width: terrainConfig.size || 200, height: terrainConfig.size || 200 },
                this.scene
            );
            
            const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
            groundMat.diffuseColor = new BABYLON.Color3(0.34, 0.49, 0.27);
            ground.material = groundMat;
            ground.receiveShadow = true;
            
            // Add physics
            new BABYLON.PhysicsAggregate(
                ground,
                BABYLON.PhysicsShapeType.BOX,
                { mass: 0, friction: 0.8 },
                this.scene
            );
        }
        
        console.log('✅ Terrain created');
    }
    
    /**
     * Create player (requires BabylonSkater module)
     */
    async createPlayer(startConfig) {
        console.log('🛹 Creating player...');
        
        // If BabylonSkater is available, use it
        if (typeof BabylonSkater !== 'undefined') {
            const { BabylonSkater } = await import('./engine/skater/babylon-skater-rag.js');
            const skaterModule = new BabylonSkater(this.scene);
            
            this.player = skaterModule.spawn({
                x: startConfig.x || 0,
                y: startConfig.y || 5,
                z: startConfig.z || 0
            });
            
            // Setup camera to follow player collider
            this.camera.lockedTarget = this.player.collider;
            
            // Add to shadow casters
            if (this.shadowGenerator) {
                this.shadowGenerator.addShadowCaster(this.player.root);
            }
            
            // Store skater module for updates
            this.playerModule = skaterModule;
            
        } else {
            // Fallback: create simple player
            const playerBox = BABYLON.MeshBuilder.CreateBox(
                "player",
                { width: 1, height: 2, depth: 0.5 },
                this.scene
            );
            playerBox.position = new BABYLON.Vector3(
                startConfig.x || 0,
                startConfig.y || 5,
                startConfig.z || 0
            );
            
            const playerMat = new BABYLON.StandardMaterial("playerMat", this.scene);
            playerMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
            playerBox.material = playerMat;
            playerBox.castShadow = true;
            
            // Physics
            const aggregate = new BABYLON.PhysicsAggregate(
                playerBox,
                BABYLON.PhysicsShapeType.BOX,
                { mass: 70, restitution: 0.1, friction: 0.4 },
                this.scene
            );
            
            this.player = { collider: playerBox, aggregate: aggregate };
            this.camera.lockedTarget = playerBox;
            
            // CRITICAL FIX: Create a basic playerModule for the fallback player
            // This enables movement controls without needing BabylonSkater
            this.playerModule = this.createFallbackPlayerModule(playerBox, aggregate);
        }
        
        console.log('✅ Player created');
    }
    
    /**
     * Create a basic player module for the fallback player
     * This provides movement methods that work with the simple box player
     */
    createFallbackPlayerModule(collider, aggregate) {
        console.log('🎮 Creating fallback player controller...');
        
        return {
            collider: collider,
            aggregate: aggregate,
            
            /**
             * Update - called every frame to sync physics
             */
            update() {
                // The fallback player doesn't need visual sync since
                // the collider IS the visual mesh
                // But we can add damping to prevent sliding
                const body = aggregate.body;
                const velocity = body.getLinearVelocity();
                
                // Apply ground friction when not moving
                if (velocity.length() > 0.1) {
                    body.setLinearVelocity(velocity.scale(0.98));
                }
            },
            
            /**
             * Move forward in the direction the player is facing
             */
            moveForward(force) {
                const body = aggregate.body;
                
                // Get forward direction based on current rotation
                const forward = new BABYLON.Vector3(
                    Math.sin(collider.rotation.y),
                    0,
                    Math.cos(collider.rotation.y)
                );
                
                // Apply force in forward direction
                body.applyForce(
                    forward.scale(force),
                    collider.position
                );
            },
            
            /**
             * Move backward (slower than forward)
             */
            moveBackward(force) {
                const body = aggregate.body;
                
                // Get backward direction
                const backward = new BABYLON.Vector3(
                    -Math.sin(collider.rotation.y),
                    0,
                    -Math.cos(collider.rotation.y)
                );
                
                // Apply force in backward direction
                body.applyForce(
                    backward.scale(force),
                    collider.position
                );
            },
            
            /**
             * Turn left by rotating the player
             */
            turnLeft(torque) {
                // Rotate the mesh directly (simpler than torque for fallback)
                collider.rotation.y -= 0.05;
            },
            
            /**
             * Turn right by rotating the player
             */
            turnRight(torque) {
                // Rotate the mesh directly
                collider.rotation.y += 0.05;
            },
            
            /**
             * Jump by applying upward force
             */
            jump(force) {
                const body = aggregate.body;
                const velocity = body.getLinearVelocity();
                
                // Only jump if mostly grounded (not already jumping high)
                if (Math.abs(velocity.y) < 2) {
                    body.applyImpulse(
                        new BABYLON.Vector3(0, force, 0),
                        collider.position
                    );
                }
            },
            
            /**
             * Get current speed for HUD display
             */
            getSpeed() {
                const body = aggregate.body;
                const velocity = body.getLinearVelocity();
                
                // Return horizontal speed in a reasonable unit
                const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
                return horizontalSpeed * 2; // Scale to feel like MPH
            },
            
            // Stub methods for advanced features (do nothing in fallback)
            doKickflip() {
                console.log('🛹 Kickflip! (visual trick not available in fallback)');
            },
            
            leanLeft() { /* No visual lean in fallback */ },
            leanRight() { /* No visual lean in fallback */ },
            resetLean() { /* No visual lean in fallback */ },
            resetDeckRotation() { /* No deck in fallback */ }
        };
    }
    
    /**
     * Main update loop
     */
    update() {
        if (!this.state.isPlaying) return;
        
        // CRITICAL: Update player visual position first
        if (this.playerModule && this.playerModule.update) {
            this.playerModule.update();
        }
        
        // Then handle input
        this.updatePlayerControls();
        
        // Call level's onUpdate hook
        if (this.levelConfig && this.levelConfig.onUpdate) {
            this.levelConfig.onUpdate(this);
        }
    }
    
    /**
     * Handle player input
     * 
     * IMPORTANT: This function requires playerModule to exist!
     * - If you're using BabylonSkater, playerModule comes from that
     * - If you're using the fallback player, createFallbackPlayerModule() creates it
     * - Without playerModule, this function returns early and controls don't work
     * 
     * The playerModule provides methods like:
     * - moveForward(force) - Apply forward movement
     * - turnLeft(torque) - Rotate left
     * - jump(force) - Apply upward impulse
     * - getSpeed() - Get current speed for HUD
     */
    updatePlayerControls() {
        if (!this.player || !this.playerModule) return;
        
        const moveForce = 5000;
        const turnTorque = 50;
        
        // Forward/Backward
        if (this.keys['w'] || this.keys['arrowup']) {
            this.playerModule.moveForward(moveForce);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.playerModule.moveBackward(moveForce * 0.6);
        }
        
        // Turn
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.playerModule.turnLeft(turnTorque);
            if (this.playerModule.leanLeft) this.playerModule.leanLeft();
        } else if (this.keys['d'] || this.keys['arrowright']) {
            this.playerModule.turnRight(turnTorque);
            if (this.playerModule.leanRight) this.playerModule.leanRight();
        } else {
            if (this.playerModule.resetLean) this.playerModule.resetLean();
        }
        
        // Reset deck rotation when not doing tricks
        if (this.playerModule.resetDeckRotation) {
            this.playerModule.resetDeckRotation();
        }
        
        // Update speed in state
        if (this.playerModule.getSpeed) {
            this.state.speed = this.playerModule.getSpeed();
        }
    }
    
    /**
     * Key down event
     */
    onKeyDown(key) {
        key = key.toLowerCase();
        
        // Jump
        if (key === ' ') {
            if (this.playerModule && this.playerModule.jump) {
                this.playerModule.jump(300);
            }
        }
        
        // Kickflip
        if (key === 'e') {
            if (this.playerModule && this.playerModule.doKickflip) {
                this.playerModule.doKickflip();
            }
        }
    }
    
    /**
     * Key up event
     */
    onKeyUp(key) {
        // Handle key releases if needed
    }
    
    /**
     * Start the game loop
     */
    start() {
        console.log('🎮 Starting game loop...');
        
        this.state.isPlaying = true;
        
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.render();
        });
        
        console.log('✅ Game loop started');
    }
    
    /**
     * Pause the game
     */
    pause() {
        this.state.isPlaying = false;
        console.log('⏸️ Game paused');
    }
    
    /**
     * Resume the game
     */
    resume() {
        this.state.isPlaying = true;
        console.log('▶️ Game resumed');
    }
    
    /**
     * Clear current level
     */
    clearLevel() {
        // Clear terrain
        if (this.terrain && this.terrain.clear) {
            this.terrain.clear();
        }
        
        // Clear NPCs
        this.npcs.forEach(npc => {
            if (npc.dispose) npc.dispose();
        });
        this.npcs = [];
        
        console.log('🧹 Level cleared');
    }
    
    /**
     * Get delta time
     */
    getDeltaTime() {
        return this.engine.getDeltaTime() / 1000; // Convert to seconds
    }
    
    /**
     * Dispose of the engine
     */
    dispose() {
        if (this.engine) {
            this.engine.dispose();
        }
        
        console.log('🛑 APPLESAUCE Core disposed');
    }
}
