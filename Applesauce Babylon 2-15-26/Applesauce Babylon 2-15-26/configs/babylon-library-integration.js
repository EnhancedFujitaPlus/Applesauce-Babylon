/**
 * APPLESAUCE - Library Level Integration Example
 * 
 * Shows how to integrate the procedural library with the existing
 * Babylon terrain and skater systems.
 * 
 * This represents the narrative moment where the Three.js conflict
 * is destroyed and the world merges into Babylon.js
 */

import { BabylonTerrain } from '../engine/terrain/babylon-terrain.js';
import { BabylonSkater } from '../engine/skater/babylon-skater.js';
import { LibraryLevel } from './babylon-library-level.js';

export class LibraryLevelController {
    constructor() {
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        
        // Game systems
        this.terrain = null;
        this.skater = null;
        this.library = null;
        
        // Boss battle state (for later)
        this.bossActive = false;
        this.bossEntity = null;
    }
    
    /**
     * Initialize the library level
     */
    async init(canvasId = 'renderCanvas') {
        console.log('🎮 Initializing Library Level...');
        
        // Get canvas
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error('Canvas not found: ' + canvasId);
        }
        
        // Create engine
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true
        });
        
        // Create scene
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.12, 1); // Dark atmosphere
        
        // Enable physics with Havok
        const havokInstance = await HavokPhysics();
        const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
        this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), havokPlugin);
        
        console.log('   ✅ Havok physics enabled');
        
        // Setup camera
        this.setupCamera();
        
        // Initialize game systems
        this.terrain = new BabylonTerrain(this.scene, havokPlugin);
        this.skater = new BabylonSkater(this.scene, false);
        this.library = new LibraryLevel(this.scene, havokPlugin);
        
        // Build the library!
        this.buildLibrary();
        
        // Spawn the skater
        this.spawnSkater();
        
        // Setup controls
        this.setupControls();
        
        // Start render loop
        this.startRenderLoop();
        
        console.log('✅ Library Level ready!');
    }
    
    /**
     * Setup the camera
     */
    setupCamera() {
        // Third-person follow camera
        this.camera = new BABYLON.UniversalCamera(
            "camera",
            new BABYLON.Vector3(0, 10, -20),
            this.scene
        );
        
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(this.canvas, true);
        
        // Camera settings
        this.camera.speed = 0.5;
        this.camera.angularSensibility = 2000;
        this.camera.fov = 0.8;
        
        // Camera limits
        this.camera.lowerRadiusLimit = 5;
        this.camera.upperRadiusLimit = 50;
    }
    
    /**
     * Build the procedural library
     */
    buildLibrary() {
        console.log('📚 Building THE LIBRARY...');
        
        // Build with custom config
        this.library.build({
            width: 150,
            depth: 200,
            height: 25,
            shelfHeight: 12,
            aisleWidth: 8, // Wide for skateboarding
            numRows: 8,
            numCols: 12
        });
        
        // Clear the center for potential boss battle
        this.library.clearCenterArena(35);
        
        console.log('   ✅ Library complete - ready for conflict');
    }
    
    /**
     * Spawn the skater
     */
    spawnSkater() {
        console.log('🛹 Spawning skater...');
        
        // Spawn in a random aisle
        const spawnPoint = this.library.getRandomSpawnPoint();
        
        this.skater.spawn({
            x: spawnPoint.x,
            y: spawnPoint.y,
            z: spawnPoint.z,
            deckColor: new BABYLON.Color3(1, 0.08, 0.58), // Hot pink
            bodyColor: new BABYLON.Color3(0.1, 0.1, 0.1)
        });
        
        console.log(`   🛹 Skater spawned at (${spawnPoint.x.toFixed(1)}, ${spawnPoint.y.toFixed(1)}, ${spawnPoint.z.toFixed(1)})`);
    }
    
    /**
     * Setup keyboard controls
     */
    setupControls() {
        const keys = {};
        
        window.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;
            
            // Tricks
            if (e.key === 'f' || e.key === 'F') {
                this.skater.doTrick('kickflip');
            }
            if (e.key === 'g' || e.key === 'G') {
                this.skater.doTrick('heelflip');
            }
            if (e.key === 'h' || e.key === 'H') {
                this.skater.doTrick('360flip');
            }
            
            // Jump
            if (e.key === ' ') {
                this.skater.jump();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });
        
        // Store keys for update loop
        this.keys = keys;
    }
    
    /**
     * Start the render loop
     */
    startRenderLoop() {
        this.engine.runRenderLoop(() => {
            // Update skater movement
            this.updateSkaterControls();
            
            // Update skater physics
            this.skater.update();
            
            // Update camera to follow skater
            this.updateCamera();
            
            // Update boss (if active)
            if (this.bossActive && this.bossEntity) {
                this.updateBoss();
            }
            
            // Render scene
            this.scene.render();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
    
    /**
     * Update skater based on keyboard input
     */
    updateSkaterControls() {
        if (!this.keys) return;
        
        // Movement
        if (this.keys['w'] || this.keys['arrowup']) {
            this.skater.accelerate();
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.skater.brake();
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.skater.turnLeft();
            this.skater.leanLeft();
        } else if (this.keys['d'] || this.keys['arrowright']) {
            this.skater.turnRight();
            this.skater.leanRight();
        } else {
            this.skater.resetLean();
        }
    }
    
    /**
     * Update camera to follow skater
     */
    updateCamera() {
        if (!this.skater.skaterRoot) return;
        
        const skaterPos = this.skater.getPosition();
        const skaterRot = this.skater.getRotation();
        
        // Camera offset behind and above skater
        const offset = new BABYLON.Vector3(
            Math.sin(skaterRot) * -15,
            8,
            Math.cos(skaterRot) * -15
        );
        
        // Smooth camera follow
        const targetPos = skaterPos.add(offset);
        this.camera.position = BABYLON.Vector3.Lerp(
            this.camera.position,
            targetPos,
            0.1
        );
        
        // Look at skater
        const lookTarget = skaterPos.add(new BABYLON.Vector3(0, 2, 0));
        this.camera.setTarget(lookTarget);
    }
    
    // ===================================
    // BOSS BATTLE METHODS (FOR LATER)
    // ===================================
    
    /**
     * Trigger the boss battle
     * Call this when ready to add boss mechanics
     */
    triggerBossBattle() {
        console.log('⚔️ BOSS BATTLE TRIGGERED!');
        
        this.bossActive = true;
        
        // Spawn boss at arena center
        const arenaCenter = this.library.getArenaCenter();
        
        // TODO: Create boss entity here
        // this.bossEntity = new LibraryBoss(this.scene, arenaCenter);
        
        console.log('   🎯 Boss spawned at arena center');
    }
    
    /**
     * Update boss AI/mechanics
     */
    updateBoss() {
        if (!this.bossEntity) return;
        
        // TODO: Boss update logic
        // - Track player position
        // - Execute attacks
        // - Handle damage
    }
    
    /**
     * End boss battle
     */
    defeatBoss() {
        console.log('🎉 BOSS DEFEATED!');
        
        this.bossActive = false;
        
        if (this.bossEntity) {
            // TODO: Boss defeat animation/cleanup
            this.bossEntity = null;
        }
    }
    
    // ===================================
    // UTILITY
    // ===================================
    
    /**
     * Cleanup
     */
    dispose() {
        if (this.library) this.library.dispose();
        if (this.skater) this.skater.remove();
        if (this.terrain) this.terrain.clear();
        if (this.scene) this.scene.dispose();
        if (this.engine) this.engine.dispose();
    }
}

// ===================================
// EASY STARTUP
// ===================================

// Auto-start if this is the main script
if (typeof window !== 'undefined') {
    window.startLibraryLevel = async function() {
        const controller = new LibraryLevelController();
        await controller.init('renderCanvas');
        
        // Expose for debugging
        window.library = controller;
        
        console.log('🎮 Use WASD to move, SPACE to jump, F/G/H for tricks');
        console.log('🎮 Access via window.library in console');
        
        return controller;
    };
}
