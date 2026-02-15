/**
 * APPLESAUCE Core Engine v4.0 - Three.js r182
 * Modern architecture with dynamic level loading
 */
import * as THREE from './three.module.js';

import { ApplesauceGore } from './gore/applesauce-gore.js';
import { ApplesauceDialogue } from './dialogue/applesauce-dialogue.js';
import { ApplesauceEnemies } from './enemies/applesauce-enemies.js';
import { ApplesauceObjectives } from './objectives/applesauce-objectives.js';
import { ApplesauceTerrain } from './terrain/applesauce-terrain-4.js';
import { ApplesauceMaterials } from './materials/applesauce-materials.js';

class ApplesauceCore {
    constructor(config = {}) {
        // Apply configuration
        this.config = {
            goreEnabled: config.goreEnabled !== false,
            maxSpeed: config.maxSpeed || 1.2,
            hillHeight: config.hillHeight || 60,
            hillLength: config.hillLength || 25,
            ...config
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
        
        // Initialize Materials system
        this.materials = new ApplesauceMaterials(this);
        
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
            gore: null,
            dialogue: null,
            enemies: null,
            objectives: null,
            terrain: null,
            weather: null,
            materials: null
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
        
        // Create terrain
        this.createTerrain(levelConfig.terrain || {});
        
        // Create obstacles
        if (levelConfig.obstacles) {
            this.createObstacles(levelConfig.obstacles);
        }
        
        // Setup weather effects (like volcanoes)
        if (levelConfig.weather) {
            await this.setupWeather(levelConfig.weather);
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

        if (this.modules.materials) {
            this.modules.materials.clear();
        }
        
        if (this.modules.weather) {
            this.modules.weather.clear();
    }

        
        // Reset state
        this.state.score = 0;
        this.state.combo = 0;
        this.state.speed = 0;
    }
    
    // ===================================
    // WEATHER SYSTEM (NEW for Level 16)
    // ===================================
    async setupWeather(weatherConfig) {
        if (weatherConfig.type === 'volcano') {
            if (!this.modules.weather) {
                // Dynamically create weather module
                this.modules.weather = new VolcanoWeather(this, weatherConfig);
            } else {
                this.modules.weather.init(weatherConfig);
            }
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
    // TERRAIN HELPERS
    // ===================================
    getTerrainHeight(x, z) {
        if (this.modules.terrain) {
            return this.modules.terrain.getHeight(x, z);
        }
        return 0;
    }
    
    createTerrain(terrainConfig) {
        console.log('🏔️ Creating terrain from config...');
        
        if (this.modules.terrain) {
            this.modules.terrain.generate(terrainConfig);
        }
    }
    
    createObstacles(obstacleConfig) {
        // Implementation based on config
        if (obstacleConfig.rails) {
            this.createRails(obstacleConfig.rails);
        }
        if (obstacleConfig.ramps) {
            this.createRamps(obstacleConfig.ramps);
        }
    }
    
    createRails(railsConfig) {
        // Create rails based on config
        const count = railsConfig.count || 5;
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 100;
            const z = Math.random() * 200 + 50;
            this.createRail(x, z, 20);
        }
    }
    
    createRail(x, z, length) {
        const railGroup = new THREE.Group();
        
        const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 2);
        const pole1 = new THREE.Mesh(poleGeo, this.materials.metal);
        pole1.position.set(0, 1, -length / 2);
        pole1.castShadow = true;
        
        const pole2 = new THREE.Mesh(poleGeo, this.materials.metal);
        pole2.position.set(0, 1, length / 2);
        pole2.castShadow = true;
        
        const railGeo = new THREE.CylinderGeometry(0.15, 0.15, length);
        const rail = new THREE.Mesh(railGeo, this.materials.metal);
        rail.rotation.x = Math.PI / 2;
        rail.position.y = 2;
        rail.castShadow = true;
        
        railGroup.add(pole1, pole2, rail);
        railGroup.position.set(x, 0, z);
        
        this.scene.add(railGroup);
        this.rails.push(rail);
    }
    
    createRamps(rampsConfig) {
        // Ramp creation logic
    }
    
    // ===================================
    // PLAYER CREATION
    // ===================================
    createPlayer(x = 0, z = 0) {
        this.player = new THREE.Group();
        
        // Deck with enhanced material
        const deckGeo = new THREE.BoxGeometry(0.8, 0.1, 2.5);
        const deckMat = new THREE.MeshStandardMaterial({ 
            color: 0xFF1493,
            roughness: 0.6,
            metalness: 0.1
        });
        this.deck = new THREE.Mesh(deckGeo, deckMat);
        this.deck.position.y = 0.3;
        this.deck.castShadow = true;
        this.player.add(this.deck);
        
        // Body
        const bodyGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.2);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.2;
        body.castShadow = true;
        this.player.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.3);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xFFDBAC });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 2.1;
        head.castShadow = true;
        this.player.add(head);
        
        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1);
        const wheelMat = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            roughness: 0.8
        });
        
        const wheelPositions = [
            [-0.3, 0.15, -0.8],
            [0.3, 0.15, -0.8],
            [-0.3, 0.15, 0.8],
            [0.3, 0.15, 0.8]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.position.set(...pos);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            this.player.add(wheel);
        });
        
        this.player.position.set(x, this.getTerrainHeight(x, z) + 0.5, z);
        this.scene.add(this.player);
        
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
        
        // Dialogue no longer blocks movement - skate while talking!
        
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
        
        // Apply friction
        this.state.speed *= this.state.friction;
        
        // Movement
        const forward = new THREE.Vector3(
            Math.sin(this.state.rotation),
            0,
            Math.cos(this.state.rotation)
        );
        
        this.player.position.add(forward.multiplyScalar(this.state.speed));
        this.player.rotation.y = this.state.rotation;
        
        // Jump physics
        if (this.state.jumping || !this.state.grounded) {
            this.state.jumpVelocity += this.state.gravity;
            this.player.position.y += this.state.jumpVelocity;
        }
        
        // Ground collision
        const groundY = this.getTerrainHeight(this.player.position.x, this.player.position.z) + 1.0;
        
        if (this.player.position.y <= groundY && !this.state.grinding) {
            this.player.position.y = groundY;
            this.state.grounded = true;
            this.state.jumping = false;
            this.state.jumpVelocity = 0;
            
            if (this.state.attemptingKickflip && this.state.spinning) {
                this.state.kickflips++;
                this.state.attemptingKickflip = false;
            }
        } else {
            this.state.grounded = false;
        }
        
        // Deck spin animation
        if (this.state.spinning && this.deck) {
            this.state.spinRotation += 0.3;
            if (this.state.spinRotation >= Math.PI * 2) {
                this.state.spinning = false;
                this.state.spinRotation = 0;
            }
            this.deck.rotation.x = this.state.spinRotation;
        } else if (this.deck) {
            this.deck.rotation.x = 0;
        }
        
        // Check grinding
        this.checkGrinding();
        
        // Grind scoring
        if (this.state.grinding) {
            this.state.score += 5;
            this.state.combo = Math.max(this.state.combo, 1);
            this.state.comboTimer = 10;
            
            if (this.state.currentRail) {
                const worldPos = new THREE.Vector3();
                this.state.currentRail.getWorldPosition(worldPos);
                const dx = this.player.position.x - worldPos.x;
                const dz = this.player.position.z - worldPos.z;
                const horizontalDist = Math.sqrt(dx * dx + dz * dz);
                
                if (horizontalDist > 4) {
                    this.state.grinding = false;
                    this.state.currentRail = null;
                    this.state.jumpVelocity = -0.1;
                }
            }
        }
        
        // Combo timer
        if (this.state.comboTimer > 0) {
            this.state.comboTimer--;
            if (this.state.comboTimer === 0 && this.state.grounded && !this.state.grinding) {
                this.state.combo = 0;
            }
        }
        
        // Trick timer
        if (this.state.trickTimer > 0) {
            this.state.trickTimer--;
            if (this.state.trickTimer === 0) {
                this.state.currentTrick = '';
            }
        }
    }
    
    // ===================================
    // CAMERA UPDATE
    // ===================================
    updateCamera() {
        if (!this.player) return;
        
        const cameraOffset = new THREE.Vector3(
            -Math.sin(this.state.rotation) * 10,
            7,
            -Math.cos(this.state.rotation) * 10
        );
        
        this.camera.position.lerp(
            this.player.position.clone().add(cameraOffset),
            0.1
        );
        
        this.camera.lookAt(this.player.position.clone().add(new THREE.Vector3(0, 1, 0)));
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
        
        if (this.modules.gore && this.modules.gore.update) {
            this.modules.gore.update(this);
        }

        
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

// ===================================
// VOLCANO WEATHER MODULE
// ===================================
class VolcanoWeather {
    constructor(core, config) {
        this.core = core;
        this.volcanoes = [];
        this.projectiles = [];
        this.init(config);
    }
    
    init(config) {
        // Create volcanoes
        config.volcanoes.forEach(volcanoConfig => {
            this.createVolcano(volcanoConfig);
        });
    }
    
    createVolcano(config) {
        const volcanoGroup = new THREE.Group();
        
        // Volcano cone
        const coneGeo = new THREE.ConeGeometry(
            config.baseRadius,
            config.height,
            32
        );
        const coneMat = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.9 
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.y = config.height / 2;
        cone.castShadow = true;
        volcanoGroup.add(cone);
        
        // Lava crater on top
        const craterGeo = new THREE.CylinderGeometry(
            config.baseRadius * 0.3,
            config.baseRadius * 0.4,
            config.height * 0.1,
            32
        );
        const crateMat = new THREE.MeshStandardMaterial({ 
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 0.8
        });
        const crater = new THREE.Mesh(craterGeo, crateMat);
        crater.position.y = config.height;
        volcanoGroup.add(crater);
        
        volcanoGroup.position.copy(config.position);
        this.core.scene.add(volcanoGroup);
        
        // Store volcano data
        this.volcanoes.push({
            group: volcanoGroup,
            config: config,
            nextEruption: config.eruptionInterval,
            erupting: false,
            eruptionTimer: 0
        });
    }
    
    update() {
        this.volcanoes.forEach(volcano => {
            volcano.nextEruption--;
            
            if (volcano.nextEruption <= 0 && !volcano.erupting) {
                this.erupt(volcano);
                volcano.erupting = true;
                volcano.eruptionTimer = volcano.config.eruptionDuration;
                volcano.nextEruption = volcano.config.eruptionInterval;
            }
            
            if (volcano.erupting) {
                volcano.eruptionTimer--;
                if (volcano.eruptionTimer <= 0) {
                    volcano.erupting = false;
                }
            }
        });
        
        // Update projectiles
        this.updateProjectiles();
    }
    
    erupt(volcano) {
        const pos = volcano.group.position;
        const height = volcano.config.height;
        
        for (let i = 0; i < volcano.config.projectileCount; i++) {
            this.launchProjectile(
                pos.x,
                pos.y + height,
                pos.z
            );
        }
    }
    
    launchProjectile(x, y, z) {
        // Create lava rock
        const rockGeo = new THREE.SphereGeometry(0.5 + Math.random() * 0.5);
        const rockMat = new THREE.MeshStandardMaterial({ 
            color: 0xFF4500,
            emissive: 0xFF0000,
            emissiveIntensity: 0.6
        });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(x, y, z);
        rock.castShadow = true;
        
        this.core.scene.add(rock);
        
        // Random trajectory
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.3;
        const upSpeed = 0.5 + Math.random() * 0.5;
        
        this.projectiles.push({
            mesh: rock,
            velocity: new THREE.Vector3(
                Math.cos(angle) * speed,
                upSpeed,
                Math.sin(angle) * speed
            ),
            gravity: -0.02,
            lifetime: 300
        });
    }
    
    updateProjectiles() {
        this.projectiles = this.projectiles.filter(proj => {
            // Apply gravity
            proj.velocity.y += proj.gravity;
            proj.mesh.position.add(proj.velocity);
            
            // Rotation for effect
            proj.mesh.rotation.x += 0.1;
            proj.mesh.rotation.y += 0.1;
            
            // Check ground collision
            if (proj.mesh.position.y <= 0) {
                this.core.scene.remove(proj.mesh);
                return false;
            }
            
            // Check player collision
            if (this.core.player) {
                const dist = proj.mesh.position.distanceTo(this.core.player.position);
                if (dist < 2) {
                    // Hit player!
                    console.log('🌋 HIT BY LAVA!');
                    if (this.core.modules.gore) {
                        // Trigger gore effect - massive splatter for lava death
                        const velocity = proj.velocity.clone().normalize().multiplyScalar(0.3);
                        this.core.modules.gore.createMassiveSplatter(
                            this.core.player.position.clone(),
                            velocity
                        );
                    }
                    this.core.scene.remove(proj.mesh);
                    return false;
                }
            }
            
            // Lifetime
            proj.lifetime--;
            return proj.lifetime > 0;
        });
    }
    
    clear() {
        // Remove all volcanoes
        this.volcanoes.forEach(v => this.core.scene.remove(v.group));
        this.volcanoes = [];
        
        // Remove all projectiles
        this.projectiles.forEach(p => this.core.scene.remove(p.mesh));
        this.projectiles = [];
    }
}
export { ApplesauceCore };