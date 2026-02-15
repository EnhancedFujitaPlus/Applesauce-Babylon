/**
 * APPLESAUCE Core Engine v4.0 - Three.js r182
 * THIS IS NUMBER ONE DID WORK WITH LEVEL1
 * 
 * Modern architecture with dynamic level loading
 * 
 * PATHS FIXED FOR: engine/core/ location
 * NOTE: Adjust paths if your module files are named differently!
 */

// Three.js import
import * as THREE from '/three.module.js';

// Module imports - each goes up to engine/ then into the specific module folder
import { ApplesauceGore } from './gore/applesauce-gore.js';
import { ApplesauceDialogue } from './dialogue/applesauce-dialogue.js';
import { ApplesauceEnemies } from './enemies/applesauce-enemies.js';
import { ApplesauceObjectives } from './objectives/applesauce-objectives.js';
import { ApplesauceTerrain } from './terrain/applesauce-terrain-3.js';
import { ApplesaucePause } from './pause/applesauce-pause.js';
import { ApplesauceGear } from './gear/applesauce-gear.js';
import { ApplesauceMaterials } from './materials/applesauce-materials.js';
import { ApplesauceMusic } from './music/applesauce-music.js';
import { ApplesauceWeapons } from './weapons/applesauce-weapons.js';
import { ApplesauceWeather } from './weather/applesauce-weather.js';
import { ApplesauceCombat } from './combat/applesauce-combat.js';
import { ApplesauceLevelBuilder } from './materials/applesauce-level-builder.js';
import { ApplesauceSkater } from './skater/applesauce-skater.js';
import { ApplesauceSkybox } from './skybox/applesauce-skybox.js';

class ApplesauceCore {
    constructor(config = {}) {
        // Apply configuration
        this.config = {
            goreEnabled: config.goreEnabled !== false,
            maxSpeed: config.maxSpeed || 1.2,
            hillHeight: config.hillHeight || 60,
            hillLength: config.hillLength || 25,
        };

        // Core Three.js setup with r182
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 400);
        this.scene.background = new THREE.Color(0x87CEEB);
        
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: 'high-performance' // NEW in r182
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio); // Better quality
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // NEW in r182: Tone mapping for better colors
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        document.body.appendChild(this.renderer.domElement);
        
        
        // Game arrays
        this.obstacles = [];
        this.rails = [];
        this.keys = {};
        
        // Core game state
        this.state = {
            speed: 0,
            maxSpeed: this.config.maxSpeed,
            acceleration: 0.03,
            friction: 0.98,
            turnSpeed: 0.03,
            rotation: 0,
            jumping: false,
            jumpVelocity: 0,
            gravity: -0.025,
            grounded: true,
            grinding: false,
            currentRail: null,
            score: 0,
            combo: 0,
            comboTimer: 0,
            currentTrick: '',
            trickTimer: 0,
            canTrick: true,
            spinning: false,
            spinRotation: 0,
            kickflips: 0,
            attemptingKickflip: false,
            paused: false
        };
        
        // Level configuration
        this.currentLevel = null;
        this.levelConfig = null;
        
        // Module hooks
        this.modules = {
            player: null,
            materials: null,
            gore: null,
            dialogue: null,
            enemies: null,
            objectives: null,
            terrain: null,
            weather: null,
            weapons: null,
            combat: null,
            gear: null,
            music: null,
            levelBuilder: null

        };

        // Initialize terrain module (always enabled)
        this.modules.terrain = new ApplesauceTerrain(this);
        
        // Initialize modules based on config
        if (this.config.goreEnabled) {
            this.modules.gore = new ApplesauceGore(this);
        }
        
        if (this.config.dialogueEnabled !== false) {
            this.modules.dialogue = new ApplesauceDialogue(this);
        }
        
        if (this.config.enemiesEnabled !== false) {
            this.modules.enemies = new ApplesauceEnemies(this);
        }
        
        if (this.config.objectivesEnabled !== false) {
            this.modules.objectives = new ApplesauceObjectives(this);
        }

        if (this.config.materialsEnabled) {
            this.modules.materials = new ApplesauceMaterials(this);
        }

        // Initialize skater module (replaces old player module)
        this.modules.skater = new ApplesauceSkater(this);

        if (this.config.musicEnabled !== false) {
            this.modules.music = new ApplesauceMusic(this);
        }

        if (this.config.gearEnabled !== false) {
            this.modules.gear = new ApplesauceGear(this);
        }

        if (this.config.weatherEnabled !== false) {
            this.modules.weather = new ApplesauceWeather(this);
        }

        if (this.config.weaponsEnabled !== false) {
            this.modules.weapons = new ApplesauceWeapons(this);
        }

        if (this.config.levelBuilderEnabled !== false) {
            this.modules.levelBuilder = new ApplesauceLevelBuilder(this);
        }

        if (this.config.pauseEnabled !== false) {
            this.modules.pause = new ApplesaucePause(this);
        }

        if (this.config.combatEnabled !== false) {
            this.modules.combat = new ApplesauceCombat(this);
        }

        if (this.config.skyboxEnabled !== false) {
            this.modules.skybox = new ApplesauceSkybox(this);
        }

        // Player reference
        this.player = null;
        this.deck = null;
        
        // Animation
        this.animationId = null;
        this.isRunning = false;
        
        // Setup core systems
        this._setupLighting();
        this._setupControls();
        this._setupResize();
        
        console.log('🛹 APPLESAUCE Core Engine v4.0 (Three.js r182) initialized');
    }
    
    // ===================================
    // DYNAMIC LEVEL LOADING
    // ===================================
    async loadLevel(levelConfig) {
        console.log(`📦 Loading level: ${levelConfig.meta.name}`);
        
        // Clear existing level
        this.clearLevel();
        
        // Store config
        this.levelConfig = levelConfig;
        this.currentLevel = levelConfig.meta.number;
        
        // Apply level-specific settings
        if (levelConfig.scene) {
            if (levelConfig.scene.background) {
                this.scene.background = new THREE.Color(levelConfig.scene.background);
            }
            if (levelConfig.scene.fog) {
                this.scene.fog = new THREE.Fog(
                    levelConfig.scene.fog.color || 0x87CEEB,
                    levelConfig.scene.fog.near || 100,
                    levelConfig.scene.fog.far || 400
                );
            }
        }
        
        // Create terrain via terrain module
        if (this.modules.terrain) {
            this.modules.terrain.generate(levelConfig.terrain || {});
        }
        
        // Setup weather effects (like volcanoes)
        if (levelConfig.weather) {
            await this.setupWeather(levelConfig.weather);
        }
            //skybox
            if (levelConfig.skybox) {
            this.loadSkybox(levelConfig.skybox);
        }
        
        // Create player
        this.createPlayer(
            levelConfig.playerStart?.x || 0,
            levelConfig.playerStart?.z || 10
        );

       
        
        // Initialize objectives
        if (levelConfig.objectives && this.modules.objectives) {
            this.modules.objectives.init(levelConfig.objectives);
        }
        
        // Call level's onLevelStart hook - THIS SPAWNS NPCS AND ENEMIES!
        if (levelConfig.onLevelStart && typeof levelConfig.onLevelStart === 'function') {
            console.log('🎬 Calling level onLevelStart...');
            levelConfig.onLevelStart(this);
            console.log('✅ onLevelStart complete');
        }
        
        console.log(`✅ Level ${levelConfig.meta.number} loaded successfully`);
    }

    
    // ===================================
    // WEATHER SETUP METHOD
    // ===================================
    async setupWeather(weatherConfig) {
        if (!this.modules.weather) {
            console.warn('⚠️ Weather module not initialized');
            return;
        }
        
        console.log('🌤️ Setting up weather...');
        
        // Handle different weather configurations
        if (Array.isArray(weatherConfig)) {
            // Multiple weather effects
            weatherConfig.forEach(config => {
                this.addWeatherEffect(config);
            });
        } else if (typeof weatherConfig === 'object') {
            // Single weather configuration
            
            // Check if it's a specific weather type (volcano, tornado, etc.)
            if (weatherConfig.type) {
                this.modules.weather.addWeather(weatherConfig.type, weatherConfig);
            }
            
            // Apply general weather settings (fog, mist, lighting)
            if (weatherConfig.fog) {
                this.applyFogSettings(weatherConfig.fog);
            }
            
            if (weatherConfig.mist) {
                this.applyMistEffect(weatherConfig.mist);
            }
            
            if (weatherConfig.lighting) {
                this.applyWeatherLighting(weatherConfig.lighting);
            }
        }
        
        console.log('✅ Weather setup complete');
    }
    
    // ===================================
    // WEATHER HELPER METHODS
    // ===================================
    addWeatherEffect(config) {
        if (config.type) {
            this.modules.weather.addWeather(config.type, config);
        }
    }
    
    applyFogSettings(fogConfig) {
        if (!fogConfig.enabled) return;
        
        const color = fogConfig.color || 0x9ca7a8;
        const near = fogConfig.near || 50;
        const far = fogConfig.far || 300;
        
        // Update existing fog or create new one
        if (this.scene.fog) {
            this.scene.fog.color.setHex(color);
            this.scene.fog.near = near;
            this.scene.fog.far = far;
        } else {
            this.scene.fog = new THREE.Fog(color, near, far);
        }
        
        console.log('🌫️ Fog applied:', { color, near, far });
    }
    
    applyMistEffect(mistConfig) {
        if (!mistConfig.enabled) return;
        
        const particleCount = mistConfig.particles || 500;
        const height = mistConfig.height || 10;
        const movement = mistConfig.movement || 'slow';
        
        console.log('💨 Creating mist particles:', particleCount);
        
        // Create mist particles
        const mistGeometry = new THREE.BufferGeometry();
        const mistPositions = [];
        
        for (let i = 0; i < particleCount; i++) {
            mistPositions.push(
                (Math.random() - 0.5) * 400,  // X: spread across level
                Math.random() * height,        // Y: low to ground
                (Math.random() - 0.5) * 400   // Z: spread across level
            );
        }
        
        mistGeometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(mistPositions, 3)
        );
        
        const mistMaterial = new THREE.PointsMaterial({
            color: 0x9ca7a8,
            size: 2,
            transparent: true,
            opacity: 0.3,
            fog: false  // Don't let fog affect the mist itself
        });
        
        const mist = new THREE.Points(mistGeometry, mistMaterial);
        mist.name = 'weather_mist';
        this.scene.add(mist);
        
        // Add animation data
        mist.userData.movement = movement === 'slow' ? 0.02 : 0.05;
        mist.userData.isMist = true;
        
        console.log('✅ Mist effect applied');
    }
    
    applyWeatherLighting(lightingConfig) {
        // Update ambient light
        if (lightingConfig.ambient) {
            const ambientLight = this.scene.children.find(
                child => child.type === 'AmbientLight'
            );
            
            if (ambientLight) {
                ambientLight.color.setHex(lightingConfig.ambient);
                console.log('💡 Ambient light updated:', lightingConfig.ambient.toString(16));
            }
        }
        
        // Update directional light
        if (lightingConfig.directional) {
            const dirLight = this.scene.children.find(
                child => child.type === 'DirectionalLight'
            );
            
            if (dirLight) {
                if (lightingConfig.directional.color) {
                    dirLight.color.setHex(lightingConfig.directional.color);
                }
                if (lightingConfig.directional.intensity !== undefined) {
                    dirLight.intensity = lightingConfig.directional.intensity;
                }
                if (lightingConfig.directional.position) {
                    const pos = lightingConfig.directional.position;
                    dirLight.position.set(pos.x, pos.y, pos.z);
                }
                console.log('☀️ Directional light updated');
            }
        }
        
        console.log('✅ Weather lighting applied');
    }
    
    clearLevel() {
        // Remove all obstacles and rails
        this.obstacles.forEach(obj => this.scene.remove(obj));
        this.rails.forEach(obj => this.scene.remove(obj));
        this.obstacles = [];
        this.rails = [];
        
        // Remove player
        if (this.player) {
            this.scene.remove(this.player);
            this.player = null;
            this.deck = null;
        }
        
        // Clear all modules
        if (this.modules.terrain) {
            this.modules.terrain.clear();
        }
        
        if (this.modules.enemies) {
            this.modules.enemies.clear();
        }
        
        if (this.modules.dialogue) {
            this.modules.dialogue.clear();
        }
        
        if (this.modules.gore) {
            this.modules.gore.clear();
        }
        
        if (this.modules.objectives) {
            this.modules.objectives.clear();
        }
        
        if (this.modules.weather) {
            this.modules.weather.clear();
        }

        if (this.modules.pause) {
            this.modules.pause.clear();
        }

        if (this.modules.combat) {
            this.modules.combat.clear();
        }

        if (this.modules.collision) {
        this.modules.collision.clear();
    }

        
        // Reset state
        this.state.score = 0;
        this.state.combo = 0;
        this.state.speed = 0;
    }

            // Add these helper methods:
        loadSkybox(skyboxConfig) {
            switch(skyboxConfig.type) {
                case 'procedural':
                    this.skybox.createProceduralSkybox(skyboxConfig.preset);
                    break;
                case 'cubemap':
                    this.skybox.loadCubemap(skyboxConfig.paths);
                    break;
                case 'equirectangular':
                    this.skybox.loadEquirectangular(skyboxConfig.path);
                    break;
                case 'solid':
                    this.skybox.setSolidColor(skyboxConfig.color);
                    break;
            }
            
            // Add stars if requested
            if (skyboxConfig.stars?.enabled) {
                this.skybox.createStarfield(skyboxConfig.stars.count || 1000);
            }
        }

        loadCustomMaterials(materialsConfig) {
            for (const [name, config] of Object.entries(materialsConfig)) {
                this.materials.createTexturedMaterial(
                    name,
                    config.textures,
                    config.properties
                );
            }
        }
    
    
    // ===================================
    // LIGHTING SETUP (Enhanced for r182)
    // ===================================
    _setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(50, 200, 50);
        sun.castShadow = true;
        
        // Enhanced shadow settings for r182
        sun.shadow.camera.left = -150;
        sun.shadow.camera.right = 150;
        sun.shadow.camera.top = 150;
        sun.shadow.camera.bottom = -150;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.radius = 2; // Softer shadows
        sun.shadow.bias = -0.0005;
        
        this.scene.add(sun);
        
        // Store reference for level-specific changes
        this.sunLight = sun;
    }
    
    // ===================================
    // CONTROLS SETUP
    // ===================================
    _setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // ESC for pause
            if (e.key === 'Escape') {
                this.togglePause();
                return;
            }
            
            // Don't process game controls if paused
            // Movement and tricks now work during dialogue!
            if (this.state.paused) {
                return;
            }
            
            // Space for jump/ollie
            if (e.key === ' ') {
                e.preventDefault();
                this.handleJump();
            }
            
            // Trick keys
            if (!this.state.grounded && this.state.canTrick) {
                this.handleTrickInput(e.key.toLowerCase());
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Pointer lock for camera control
        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock();
        });

       
    }
    
    handleJump() {
        if (this.state.grinding) {
            this.state.grinding = false;
            this.state.currentRail = null;
            this.state.jumpVelocity = 0.35;
            this.state.jumping = true;
            this.state.grounded = false;
            this.state.canTrick = true;
        } else if (this.state.grounded && !this.state.jumping) {
            this.state.jumping = true;
            this.state.jumpVelocity = 0.35;
            this.state.grounded = false;
            this.state.canTrick = true;
        }
    }
    
    handleTrickInput(key) {
        let trickName = '';
        
        switch(key) {
            case 'q':
                trickName = 'KICKFLIP!';
                this.state.attemptingKickflip = true;
                break;
            case 'e':
                trickName = 'HEELFLIP!';
                this.state.attemptingKickflip = false;
                break;
            case 'b':
                trickName = 'IMPOSSIBLE';
                this.state.attemptingKickflip = false;
                break;
            case 'z':
                trickName = '360 FLIP!';
                this.state.attemptingKickflip = false;
                break;
        }
        
        if (trickName) {
            this.state.currentTrick = trickName;
            this.state.spinning = true;
            this.state.spinRotation = 0;
            this.state.combo++;
            this.state.trickTimer = 60;
            this.state.canTrick = false;
            this.state.score += 100 * this.state.combo;
        }
    }
    
    togglePause() {
        this.state.paused = !this.state.paused;
        console.log(this.state.paused ? 'Game Paused' : 'Game Resumed');
    }
    
    _setupResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    
    // ===================================
    // PLAYER CREATION
    // ===================================
    createPlayer(x = 0, z = 0) {
        // Use the skater module to spawn player
        if (this.modules.skater) {
            this.modules.skater.spawn({
                x: x,
                z: z,
                deckColor: this.config.deckColor || 0xFF1493,
                bodyColor: this.config.bodyColor || 0x333333
            });
            
            // Player reference is set by skater.spawn()
            // this.player is now available
        }
        
        // Position camera
        this.camera.position.set(x, 10, z - 15);
    }
    
    // ===================================
    // RAIL GRINDING CHECK
    // ===================================
    checkGrinding() {
        if (this.state.grounded) return;
        
        for (const rail of this.rails) {
            const worldPos = new THREE.Vector3();
            rail.getWorldPosition(worldPos);
            
            const dx = this.player.position.x - worldPos.x;
            const dy = this.player.position.y - worldPos.y;
            const dz = this.player.position.z - worldPos.z;
            
            const horizontalDist = Math.sqrt(dx * dx + dz * dz);
            
            if (horizontalDist < 1.5 && Math.abs(dy) < 1.5) {
                this.state.grinding = true;
                this.state.currentRail = rail;
                this.state.combo = Math.max(this.state.combo, 1);
                this.state.comboTimer = 10;
                this.state.currentTrick = 'GRINDING!';
                this.state.trickTimer = 999;
                this.player.position.y = worldPos.y;
                break;
            }
        }
    }
    
    // ===================================
    // PHYSICS UPDATE
    // ===================================
    updatePhysics() {
    if (!this.player || this.state.paused) return;
    
    // Movement controls
    if (this.keys['w'] || this.keys['arrowup']) {
        this.state.speed = Math.min(this.state.speed + this.state.acceleration, this.state.maxSpeed);
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
        this.state.speed = Math.max(this.state.speed - this.state.acceleration, -this.state.maxSpeed * 0.5);
    }
    
    if (this.keys['a'] || this.keys['arrowleft']) {
        this.state.rotation += this.state.turnSpeed;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
        this.state.rotation -= this.state.turnSpeed;
    }
    
    // Terrain-based speed boost (downhill acceleration)
    const terrainHeight = this.getTerrainHeight(this.player.position.x, this.player.position.z);
    const nextTerrainHeight = this.getTerrainHeight(
        this.player.position.x + Math.sin(this.state.rotation) * 2,
        this.player.position.z + Math.cos(this.state.rotation) * 2
    );
    
    if (nextTerrainHeight < terrainHeight && this.state.grounded) {
        this.state.speed += 0.02; // Downhill boost
    }
    
    // Apply friction
    this.state.speed *= this.state.friction;
    
    // Movement
    const forward = new THREE.Vector3(
        Math.sin(this.state.rotation),
        0,
        Math.cos(this.state.rotation)
    );
    
    this.player.position.x += forward.x * this.state.speed;
    this.player.position.z += forward.z * this.state.speed;
    this.player.rotation.y = this.state.rotation;
    
    // Jump/Air physics
    if (this.state.jumping || this.state.grinding) {
        if (!this.state.grinding) {
            this.player.position.y += this.state.jumpVelocity;
            this.state.jumpVelocity += this.state.gravity;
        }
        
        const groundLevel = this.getTerrainHeight(this.player.position.x, this.player.position.z) + 1.0;
        
        // Landing detection
        if (this.player.position.y <= groundLevel && !this.state.grinding) {
            this.player.position.y = groundLevel;
            this.state.jumping = false;
            this.state.jumpVelocity = 0;
            this.state.grounded = true;
            
            // Award combo score on landing
            if (this.state.combo > 0) {
                const comboScore = this.state.combo * 100;
                this.state.score += comboScore;
                this.state.comboTimer = 120;
            }
            
            // BAIL SYSTEM - Check if trick was incomplete
            if (this.state.spinning && Math.abs(this.state.spinRotation % (Math.PI * 2)) > 0.5) {
                // Failed to complete rotation - BAIL!
                if (this.modules.gore) {
                    this.modules.gore.createBloodSplatter(this.player.position.clone(), 1.5);
                }
                this.state.combo = 0;
                this.state.currentTrick = 'BAILED!';
                this.state.trickTimer = 60;
                this.state.score = Math.max(0, this.state.score - 500);
            } else if (this.state.spinning && this.state.attemptingKickflip) {
                // Successfully completed kickflip!
                this.state.kickflips++;
                
                // Update objectives if they exist
                if (this.modules.objectives) {
                    const kickflipObj = this.modules.objectives.objectives.find(
                        obj => obj.type === 'trick' && obj.trickType === 'Kickflip'
                    );
                    if (kickflipObj) {
                        kickflipObj.current = Math.min(this.state.kickflips, kickflipObj.target);
                        if (kickflipObj.current >= kickflipObj.target) {
                            kickflipObj.complete = true;
                        }
                    }
                }
            }
            
            // Reset trick state
            this.state.spinning = false;
            this.state.spinRotation = 0;
            if (this.deck) this.deck.rotation.x = 0;
            this.state.attemptingKickflip = false;
        }
    } else {
        // Keep player on ground when not jumping
        const groundLevel = this.getTerrainHeight(this.player.position.x, this.player.position.z) + 1.0;
        this.player.position.y = groundLevel;
    }
    
    // Deck spin animation
    if (this.state.spinning && this.deck) {
        this.state.spinRotation += 0.3;
        this.deck.rotation.x = this.state.spinRotation;
    }
    
    // Check for grinding (only when airborne and descending)
    if (!this.state.grounded && this.state.jumpVelocity < 0.05) {
        this.checkGrinding();
    }
    
    // Grind mechanics
    if (this.state.grinding) {
        this.state.score += 5;
        this.state.combo = Math.max(this.state.combo, 1);
        this.state.comboTimer = 10;
        this.state.grounded = false;
        this.state.jumping = true;
        
        // Check if still near rail
        if (this.state.currentRail) {
            const worldPos = new THREE.Vector3();
            this.state.currentRail.getWorldPosition(worldPos);
            const dx = this.player.position.x - worldPos.x;
            const dz = this.player.position.z - worldPos.z;
            const horizontalDist = Math.sqrt(dx * dx + dz * dz);
            
            // Fall off if too far from rail
            if (horizontalDist > 4) {
                this.state.grinding = false;
                this.state.currentRail = null;
                this.state.jumpVelocity = -0.1;
            }
        }
    }
    
    // Combo timer management
    if (this.state.comboTimer > 0) {
        this.state.comboTimer--;
        if (this.state.comboTimer === 0 && this.state.grounded && !this.state.grinding) {
            this.state.combo = 0;
        }
    }
    
    // Trick display timer
    if (this.state.trickTimer > 0) {
        this.state.trickTimer--;
        if (this.state.trickTimer === 0) {
            this.state.currentTrick = '';
        }
    }
}

checkGrinding() {
    // Don't start grinding if already grounded
    if (this.state.grounded) {
        if (this.state.grinding) {
            this.state.grinding = false;
            this.state.currentRail = null;
        }
        return;
    }
    
    // Only check when airborne and descending
    if (this.state.jumpVelocity > 0.05) return;
    
    for (const rail of this.rails) {
        const worldPos = new THREE.Vector3();
        rail.getWorldPosition(worldPos);
        
        // Check horizontal distance (XZ plane)
        const dx = this.player.position.x - worldPos.x;
        const dz = this.player.position.z - worldPos.z;
        const horizontalDist = Math.sqrt(dx * dx + dz * dz);
        
        // Check vertical distance
        const dy = this.player.position.y - worldPos.y;
        
        // More forgiving collision detection (wider radius)
        if (horizontalDist < 3 && Math.abs(dy) < 2) {
            this.state.grinding = true;
            this.state.currentRail = rail;
            this.state.jumpVelocity = 0;
            this.player.position.y = worldPos.y; // Snap to rail height
            
            // Start combo if not already active
            if (this.state.combo === 0) {
                this.state.combo = 1;
            }
            
            this.state.currentTrick = '50-50 GRIND!';
            this.state.trickTimer = 10;
            return;
        }
    }
}
    
    // ===================================
    // CAMERA UPDATE
    // ===================================
    updateCamera() {
    if (!this.player) return;
    
    // Calculate target camera position
    const cameraDistance = 10;
    const cameraHeight = 7;
    
    const targetCameraPos = new THREE.Vector3(
        this.player.position.x - Math.sin(this.state.rotation) * cameraDistance,
        this.player.position.y + cameraHeight,  // Follow player Y smoothly
        this.player.position.z - Math.cos(this.state.rotation) * cameraDistance
    );
    
    // Smooth interpolation (lerp) for camera position
    // Higher value = snappier, lower = smoother
    this.camera.position.lerp(targetCameraPos, 0.1);
    
    // Look at point slightly above player
    const lookAtPoint = new THREE.Vector3(
        this.player.position.x,
        this.player.position.y + 1, // Look at chest height
        this.player.position.z
    );
    
    this.camera.lookAt(lookAtPoint);
}

    
    // ===================================
    // HUD UPDATE
    // ===================================
    updateHUD() {
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.textContent = `SCORE: ${Math.floor(this.state.score)}`;
        
        const comboEl = document.getElementById('combo');
        if (comboEl) comboEl.textContent = `COMBO: ${this.state.combo}x`;
        
        const trickEl = document.getElementById('trick');
        if (trickEl) trickEl.textContent = this.state.currentTrick;
        
        const speedDisplay = Math.floor(Math.abs(this.state.speed) * 100);
        const speedEl = document.getElementById('speed');
        if (speedEl) {
            const isLethal = speedDisplay >= 20;
            speedEl.style.color = isLethal ? '#FF0000' : '#00FFFF';
            speedEl.textContent = isLethal ? `SPEED: ${speedDisplay} [LETHAL]` : `SPEED: ${speedDisplay}`;
        }
        
        // Level name display
        const levelEl = document.getElementById('level-name');
        if (levelEl && this.levelConfig) {
            levelEl.textContent = this.levelConfig.meta.name;
        }
    }
    
    // ===================================
    // TERRAIN HELPER
    // ===================================
    /**
     * Get terrain height at position
     * Delegates to terrain module or returns default
     */
    getTerrainHeight(x, z) {
        if (this.modules.terrain && this.modules.terrain.getHeight) {
            return this.modules.terrain.getHeight(x, z);
        }
        return 0; // Default ground level
    }
    
    // ===================================
    // MAIN UPDATE LOOP
    // ===================================
    update() {
        if (this.state.paused) return;
        
        // Core physics
        this.updatePhysics();
        
        // Call module updates
        if (this.modules.enemies && this.modules.enemies.update) {
            this.modules.enemies.update(this);
        }
        
        if (this.modules.gore && this.modules.gore.update) {
            this.modules.gore.update(this);
        }
        
        if (this.modules.objectives && this.modules.objectives.update) {
            this.modules.objectives.update(this);
        }
        
        if (this.modules.dialogue && this.modules.dialogue.update) {
            this.modules.dialogue.update(this);
        }
        
        if (this.modules.weather && this.modules.weather.update) {
            this.modules.weather.update(this);
        }

        if (this.state.paused) return;
        
        // NEW: Add collision check (before gore update)
        if (this.modules.collision && this.modules.collision.update) {
            this.modules.collision.update(this);
        }
        
        // Call module updates
        if (this.modules.enemies && this.modules.enemies.update) {
            this.modules.enemies.update(this);
        }
        
        if (this.modules.combat && this.modules.combat.update) {
            this.modules.combat.update(this);
        }

        if (this.modules.pause && this.modules.pause.update) {
            this.modules.pause.update(this);
        }
        
        // Update skater animations
        if (this.modules.skater && this.modules.skater.update) {
            this.modules.skater.update(this);
        }

        // Update skybox animations
        if (this.modules.skybox && this.modules.skybox.update) {
            this.modules.skybox.update(this);
        }

                // Animate mist particles
        this.scene.traverse((obj) => {
            if (obj.userData.isMist && obj.geometry && obj.geometry.attributes.position) {
                const positions = obj.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    // Gentle floating movement
                    positions[i] += (Math.random() - 0.5) * obj.userData.movement;
                    positions[i + 2] += (Math.random() - 0.5) * obj.userData.movement;
                }
                obj.geometry.attributes.position.needsUpdate = true;
            }
        });

        
        // Camera and HUD
        this.updateCamera();
        this.updateHUD();
    }
    
    // ===================================
    // ANIMATION LOOP
    // ===================================
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            this.update();
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
        console.log('🛹 Game started!');
    }
    
    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        console.log('🛹 Game stopped');
    }
    
    // ===================================
    // MODULE REGISTRATION
    // ===================================
    registerModule(name, module) {
        this.modules[name] = module;
        console.log(`📦 Module registered: ${name}`);
    }
}
export { ApplesauceCore };