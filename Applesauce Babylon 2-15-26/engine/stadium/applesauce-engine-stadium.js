/**
 * APPLESAUCE Game Engine - STADIUM EDITION
 * New Features: Collectibles, Audio, Advanced NPC AI, Knockback, Crowd System
 */

class ApplesauceEngine {
    constructor(containerId = 'game-container') {
        // Core Three.js setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);
        this.scene.background = new THREE.Color(0x87CEEB);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        const container = document.getElementById(containerId);
        if (container) {
            container.appendChild(this.renderer.domElement);
        } else {
            document.body.appendChild(this.renderer.domElement);
        }
        
        // Materials
        this.concreteMat = new THREE.MeshLambertMaterial({ color: 0x808080 });
        this.grassMat = new THREE.MeshLambertMaterial({ color: 0x2d5a2d });
        this.metalMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 });
        this.graffitiColors = [0xFF1493, 0x00FF00, 0xFFD700, 0xFF4500, 0x00FFFF];
        
        // Game arrays
        this.obstacles = [];
        this.keys = {};
        this.npcs = [];
        this.collectibles = []; // NEW: Collectible items
        this.footballPlayers = []; // NEW: Football player NPCs
        this.crowd = []; // NEW: Crowd members
        
        // Game state
        this.state = {
            speed: 0,
            maxSpeed: 1.2,
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
            blood: [],
            enemies: [],
            gibs: [],
            kills: 0,
            kickflips: 0,
            attemptingKickflip: false,
            nearNPC: null,
            nearCollectible: null, // NEW: Track nearby collectible
            hasFootball: false, // NEW: Football possession
            footballPlayersChasing: false, // NEW: Chase state
            objectives: {
                roadkill: { complete: false, current: 0, target: 10 },
                kickflips: { complete: false, current: 0, target: 5 },
                boss: { complete: false, spawned: false }
            },
            boss: null
        };
        
        // Player reference
        this.player = null;
        this.deck = null;
        
        // Animation frame
        this.animationId = null;

        //currentlevel
        this.currentLevel = null;
        
        // NEW: Audio system
        this.audioContext = null;
        this.sounds = {};
        
        // NEW: Dialogue System
        this.dialogueSystem = new DialogueSystem();
        
        // Setup
        this._setupLighting();
        this._setupControls();
        this._setupResize();
        this._initAudio();
    }
    
    // === NEW: AUDIO SYSTEM ===
    _initAudio() {
        // Audio context will be created on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('Audio system initialized');
            }
        }, { once: true });
    }
    
    // Load sound from URL
    async loadSound(name, url) {
        if (!this.audioContext) {
            console.warn('Audio context not initialized yet');
            return;
        }
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds[name] = audioBuffer;
            console.log(`Sound loaded: ${name}`);
        } catch (error) {
            console.error(`Failed to load sound ${name}:`, error);
        }
    }
    
    // Play a loaded sound
    playSound(name, volume = 1.0) {
        if (!this.audioContext || !this.sounds[name]) {
            console.warn(`Sound not available: ${name}`);
            return;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds[name];
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start(0);
    }
    
    // Simple beep for testing (no file needed)
    playBeep(frequency = 440, duration = 200) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    _setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(50, 200, 50);
        sun.castShadow = true;
        sun.shadow.camera.left = -200;
        sun.shadow.camera.right = 200;
        sun.shadow.camera.top = 200;
        sun.shadow.camera.bottom = -200;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        this.scene.add(sun);
    }
    
    _setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // F key for interactions
            if (e.key.toLowerCase() === 'f') {
                if (this.state.nearNPC && !this.dialogueSystem.isActive) {
                    this.dialogueSystem.start(this.state.nearNPC.dialogue);
                } else if (this.dialogueSystem.isActive) {
                    this.dialogueSystem.advance();
                } else if (this.state.nearCollectible) {
                    this.collectItem(this.state.nearCollectible);
                }
            }
            
            if (e.key === ' ') {
                if (this.dialogueSystem.isActive) {
                    e.preventDefault();
                    return;
                }
                
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
            
            if (!this.state.grounded && this.state.canTrick && !this.dialogueSystem.isActive) {
                if (e.key.toLowerCase() === 'q') {
                    this.state.currentTrick = 'KICKFLIP!';
                    this.state.spinning = true;
                    this.state.spinRotation = 0;
                    this.state.combo++;
                    this.state.trickTimer = 60;
                    this.state.canTrick = false;
                    this.state.attemptingKickflip = true;
                }
                if (e.key.toLowerCase() === 'e') {
                    this.state.currentTrick = 'HEELFLIP!';
                    this.state.spinning = true;
                    this.state.spinRotation = 0;
                    this.state.combo++;
                    this.state.trickTimer = 60;
                    this.state.canTrick = false;
                    this.state.attemptingKickflip = false;
                }
                if (e.key.toLowerCase() === 'b') {
                    this.state.currentTrick = 'IMPOSSIBLE';
                    this.state.spinning = true;
                    this.state.spinRotation = 0;
                    this.state.combo++;
                    this.state.trickTimer = 60;
                    this.state.canTrick = false;
                    this.state.attemptingKickflip = false;
                }
                if (e.key.toLowerCase() === 'z') {
                    this.state.currentTrick = '360 Flip!';
                    this.state.spinning = true;
                    this.state.spinRotation = 0;
                    this.state.combo++;
                    this.state.trickTimer = 60;
                    this.state.canTrick = false;
                    this.state.attemptingKickflip = false;
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock();
        });
    }
    
    _setupResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    getTerrainHeight(x, z) {
        return 0; // Flat for stadium
    }
    
    // === PLAYER CREATION ===
    createPlayer(x = 0, z = 10) {
        this.player = new THREE.Group();
        
        const deckGeo = new THREE.BoxGeometry(0.8, 0.1, 2.5);
        const deckMat = new THREE.MeshLambertMaterial({ color: 0xFF1493 });
        this.deck = new THREE.Mesh(deckGeo, deckMat);
        this.deck.position.y = 0.3;
        this.player.add(this.deck);
        
        for (let pos of [[-0.3, 0.15, -0.8], [0.3, 0.15, -0.8], [-0.3, 0.15, 0.8], [0.3, 0.15, 0.8]]) {
            const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12);
            const wheelMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.position.set(...pos);
            wheel.rotation.z = Math.PI / 2;
            this.player.add(wheel);
        }
        
        const y = this.getTerrainHeight(x, z) + 0.5;
        this.player.position.set(x, y, z);
        this.player.rotation.y = this.state.rotation;
        this.scene.add(this.player);
        
        this.camera.position.set(x, y + 7, z - 10);
        this.camera.lookAt(this.player.position);
    }
    
    // === NEW: COLLECTIBLE SYSTEM ===
    createCollectible(x, z, type, data = {}) {
        const collectible = new THREE.Group();
        
        if (type === 'football') {
            // Football shape (brown oval)
            const ballGeo = new THREE.SphereGeometry(0.4, 8, 6);
            ballGeo.scale(1, 1.3, 1); // Make it oval
            const ballMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const ball = new THREE.Mesh(ballGeo, ballMat);
            
            // Laces
            const laceGeo = new THREE.BoxGeometry(0.05, 0.6, 0.1);
            const laceMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
            const lace = new THREE.Mesh(laceGeo, laceMat);
            lace.position.y = 0.4;
            collectible.add(ball);
            collectible.add(lace);
            
            // Floating animation data
            collectible.userData.floatOffset = Math.random() * Math.PI * 2;
            collectible.userData.baseY = 2;
        }
        
        const y = this.getTerrainHeight(x, z) + (collectible.userData.baseY || 1);
        collectible.position.set(x, y, z);
        collectible.castShadow = true;
        
        this.scene.add(collectible);
        
        const collectibleObject = {
            mesh: collectible,
            type: type,
            position: { x, z },
            collected: false,
            data: data,
            canCollect: function(playerX, playerZ) {
                if (this.collected) return false;
                const dx = playerX - this.position.x;
                const dz = playerZ - this.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                return dist < 3;
            }
        };
        
        this.collectibles.push(collectibleObject);
        return collectibleObject;
    }
    
    collectItem(collectible) {
        if (collectible.collected) return;
        
        collectible.collected = true;
        this.scene.remove(collectible.mesh);
        
        // Handle football collection
        if (collectible.type === 'football') {
            this.state.hasFootball = true;
            this.state.footballPlayersChasing = true;
            
            // Play sound
            if (collectible.data.sound) {
                this.playSound(collectible.data.sound);
            } else {
                this.playBeep(880, 500); // High beep if no sound
            }
            
            // Trigger chase event
            if (collectible.data.onCollect) {
                collectible.data.onCollect();
            }
            
            console.log('FOOTBALL GRABBED! RUN!');
        }
    }
    
    updateCollectibles() {
        for (let collectible of this.collectibles) {
            if (collectible.collected) continue;
            
            // Floating animation
            if (collectible.mesh.userData.floatOffset !== undefined) {
                const time = Date.now() * 0.001;
                const offset = Math.sin(time * 2 + collectible.mesh.userData.floatOffset) * 0.3;
                collectible.mesh.position.y = collectible.mesh.userData.baseY + offset;
                collectible.mesh.rotation.y += 0.02;
            }
        }
    }
    
    // === NEW: FOOTBALL PLAYER NPCs ===
    createFootballPlayer(x, z, team, position, data = {}) {
        const player = new THREE.Group();
        
        // Larger body
        const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.5, 8);
        const teamColor = team === 'home' ? 0x0000FF : 0xFF0000;
        const bodyMat = new THREE.MeshLambertMaterial({ color: teamColor });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.25;
        body.castShadow = true;
        player.add(body);
        
        // Helmet
        const helmGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const helmMat = new THREE.MeshLambertMaterial({ color: teamColor });
        const helm = new THREE.Mesh(helmGeo, helmMat);
        helm.position.y = 2.8;
        helm.castShadow = true;
        player.add(helm);
        
        // Face mask
        const maskGeo = new THREE.BoxGeometry(0.4, 0.1, 0.6);
        const maskMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const mask = new THREE.Mesh(maskGeo, maskMat);
        mask.position.set(0, 2.6, 0.3);
        player.add(mask);
        
        // Number on jersey
        const numGeo = new THREE.BoxGeometry(0.6, 0.6, 0.05);
        const numMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const num = new THREE.Mesh(numGeo, numMat);
        num.position.set(0, 1.5, 0.55);
        player.add(num);
        
        const y = this.getTerrainHeight(x, z);
        player.position.set(x, y, z);
        this.scene.add(player);
        
        const footballPlayer = {
            mesh: player,
            team: team,
            position: position, // QB, RB, WR, etc
            homePosition: { x, z },
            currentPosition: { x, z },
            velocity: new THREE.Vector3(0, 0, 0),
            health: 3, // Takes 3 aerial hits
            isAlive: true,
            state: 'playing', // 'playing' or 'chasing'
            playPattern: data.playPattern || 'idle',
            playTimer: 0,
            speed: 0.08,
            chaseSpeed: 0.15,
            knockbackStrength: data.knockbackStrength || 3.0,
            requiresAerial: true,
            canInteract: function(playerX, playerZ) {
                const dx = playerX - this.currentPosition.x;
                const dz = playerZ - this.currentPosition.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                return dist < 8;
            }
        };
        
        this.footballPlayers.push(footballPlayer);
        return footballPlayer;
    }
    
    updateFootballPlayers() {
        if (!this.player) return;
        
        for (let fp of this.footballPlayers) {
            if (!fp.isAlive) continue;
            
            if (this.state.footballPlayersChasing && fp.state === 'playing') {
                fp.state = 'chasing';
                console.log(`${fp.position} is now chasing!`);
            }
            
            if (fp.state === 'playing') {
                // Simple football movement patterns
                fp.playTimer++;
                
                if (fp.playPattern === 'qb') {
                    // Quarterback: move back, then forward
                    if (fp.playTimer < 60) {
                        fp.velocity.z = -0.05;
                    } else if (fp.playTimer < 120) {
                        fp.velocity.z = 0.03;
                    } else {
                        fp.playTimer = 0;
                    }
                } else if (fp.playPattern === 'rb') {
                    // Running back: run forward
                    fp.velocity.z = 0.06;
                    if (fp.playTimer > 100) {
                        fp.playTimer = 0;
                        fp.mesh.position.set(fp.homePosition.x, fp.mesh.position.y, fp.homePosition.z);
                    }
                } else if (fp.playPattern === 'wr') {
                    // Wide receiver: run routes
                    if (fp.playTimer < 40) {
                        fp.velocity.z = 0.08;
                    } else if (fp.playTimer < 80) {
                        fp.velocity.x = fp.team === 'home' ? 0.06 : -0.06;
                        fp.velocity.z = 0;
                    } else {
                        fp.playTimer = 0;
                        fp.mesh.position.set(fp.homePosition.x, fp.mesh.position.y, fp.homePosition.z);
                        fp.velocity.set(0, 0, 0);
                    }
                } else {
                    // Default: stay in position
                    fp.velocity.set(0, 0, 0);
                }
                
            } else if (fp.state === 'chasing') {
                // Chase the player!
                const dx = this.player.position.x - fp.mesh.position.x;
                const dz = this.player.position.z - fp.mesh.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist > 2) {
                    fp.velocity.x = (dx / dist) * fp.chaseSpeed;
                    fp.velocity.z = (dz / dist) * fp.chaseSpeed;
                    fp.mesh.rotation.y = Math.atan2(dx, dz);
                }
            }
            
            // Apply velocity
            fp.mesh.position.add(fp.velocity);
            fp.currentPosition.x = fp.mesh.position.x;
            fp.currentPosition.z = fp.mesh.position.z;
            
            // Ground level
            const groundLevel = this.getTerrainHeight(fp.mesh.position.x, fp.mesh.position.z);
            fp.mesh.position.y = groundLevel;
        }
    }
    
    checkFootballPlayerCollisions() {
        if (!this.player) return;
        
        for (let fp of this.footballPlayers) {
            if (!fp.isAlive) continue;
            
            const dx = this.player.position.x - fp.mesh.position.x;
            const dz = this.player.position.z - fp.mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < 2) {
                // Check if player is doing an aerial trick
                if (!this.state.grounded && this.state.currentTrick !== '') {
                    // Successful aerial hit!
                    fp.health--;
                    this.state.score += 500 * this.state.combo;
                    
                    if (fp.health <= 0) {
                        fp.isAlive = false;
                        this.createGoreExplosion(fp.mesh.position);
                        this.scene.remove(fp.mesh);
                        this.state.kills++;
                        console.log(`${fp.position} is DOWN!`);
                    } else {
                        // Hit but not dead - small gore
                        this.createBloodSplatter(fp.mesh.position, 5);
                    }
                } else {
                    // Player hit while grounded - MASSIVE KNOCKBACK
                    const knockbackAngle = Math.atan2(dx, dz);
                    this.player.position.x += Math.sin(knockbackAngle) * fp.knockbackStrength;
                    this.player.position.z += Math.cos(knockbackAngle) * fp.knockbackStrength;
                    this.state.jumpVelocity = 0.5; // Launch player up
                    this.state.jumping = true;
                    this.state.grounded = false;
                    
                    this.playBeep(220, 200); // Low thud sound
                    console.log('MASSIVE HIT! Knocked back!');
                }
            }
        }
    }
    
    // === NEW: CROWD SYSTEM ===
    createCrowdMember(x, y, z, color) {
        const crowd = new THREE.Group();
        
        // Simple body
        const bodyGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 6);
        const bodyMat = new THREE.MeshLambertMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.4;
        crowd.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.15, 6, 6);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xFFDBB5 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1;
        crowd.add(head);
        
        crowd.position.set(x, y, z);
        this.scene.add(crowd);
        
        this.crowd.push(crowd);
        return crowd;
    }
    
    // Generate massive crowd
    generateCrowd(specs) {
        console.log('Generating crowd...');
        let count = 0;
        //crowd direction
        const focalPoint = specs.focalPoint || { x: 0, y: 0, z: 0 };
        
        for (let section of specs.sections) {
            const rows = section.rows;
            const seatsPerRow = section.seatsPerRow;
            const startX = section.startX;
            const startY = section.startY;
            const startZ = section.startZ;
            const spacingX = section.spacingX || 0.5;
            const spacingY = section.spacingY || 0.5;
            const spacingZ = section.spacingZ || 0.5;

            // Section-specific rotation (in radians)
        const sectionRotation = section.rotation || null;
            
            for (let row = 0; row < rows; row++) {
                for (let seat = 0; seat < seatsPerRow; seat++) {
                    const x = startX + (seat * spacingX);
                    const y = startY + (row * spacingY);
                    const z = startZ + (row * spacingZ);
                    
                    // Random team colors
                    const color = Math.random() > 0.5 ? section.teamColorA : section.teamColorB;
                    
                     // Calculate rotation
                let rotation;
                if (sectionRotation !== null) {
                    // Use fixed section rotation
                    rotation = sectionRotation;
                } else if (specs.lookAtFocalPoint) {
                    // Calculate rotation to look at focal point
                    rotation = Math.atan2(
                        focalPoint.x - x,
                        focalPoint.z - z
                    );
                } else {
                    // Default forward-facing
                    rotation = 0;
                }

                    this.createCrowdMember(x, y, z, color, rotation);
                    count++;
                }
            }
        }
        
        console.log(`Created ${count} crowd members!`);
    }

        // CapsuleGeometry doesn't exist in r128, so create it manually
    createCrowdMember(x, y, z, color, rotation = 0) {
        // Option 1: Simple cylinder (fastest)
        const geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 8);
        
        // Option 2: Cylinder + spheres for rounded capsule look
        const group = new THREE.Group();
        
        // Body
        const bodyGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 8);
        const material = new THREE.MeshLambertMaterial({ color });
        const body = new THREE.Mesh(bodyGeom, material);
        group.add(body);
        
        // Top sphere (head)
        const headGeom = new THREE.SphereGeometry(0.2, 8, 6);
        const head = new THREE.Mesh(headGeom, material);
        head.position.y = 0.3;
        group.add(head);
        
        // Bottom sphere (feet) - optional
        const feetGeom = new THREE.SphereGeometry(0.2, 8, 4);
        const feet = new THREE.Mesh(feetGeom, material);
        feet.position.y = -0.3;
        group.add(feet);
        
        group.position.set(x, y, z);
        group.rotation.y = rotation;
        
        // Collision data
        group.userData.isCollider = true;
        group.userData.radius = 0.2;
        
        this.scene.add(group);
        this.crowdMembers.push(group);
        
        return group;
    }
    
    // === BLOOD AND GORE ===
    createBloodSplatter(position, count = 10) {
        for (let i = 0; i < count; i++) {
            const size = Math.random() * 0.1 + 0.03;
            const geo = new THREE.SphereGeometry(size, 4, 4);
            const mat = new THREE.MeshLambertMaterial({ 
                color: 0x8B0000,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(geo, mat);
            
            particle.position.copy(position);
            particle.position.y += 1;
            
            const speed = Math.random() * 0.2 + 0.05;
            const angle = Math.random() * Math.PI * 2;
            const upward = Math.random() * 0.3 + 0.1;
            
            particle.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                upward,
                Math.sin(angle) * speed
            );
            
            particle.lifetime = Math.floor(Math.random() * 300 + 300);
            
            this.scene.add(particle);
            this.state.blood.push(particle);
        }
    }
    
    createGoreExplosion(position) {
        // Blood splatter
        for (let i = 0; i < 30; i++) {
            const size = Math.random() * 0.15 + 0.05;
            const geo = new THREE.SphereGeometry(size, 4, 4);
            const mat = new THREE.MeshLambertMaterial({ 
                color: 0x8B0000,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(geo, mat);
            
            particle.position.copy(position);
            particle.position.y += 1;
            
            const speed = Math.random() * 0.3 + 0.1;
            const angle = Math.random() * Math.PI * 2;
            const upward = Math.random() * 0.4 + 0.2;
            
            particle.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                upward,
                Math.sin(angle) * speed
            );
            
            particle.lifetime = Math.floor(Math.random() * 500 + 500);
            
            this.scene.add(particle);
            this.state.blood.push(particle);
        }
        
        // Gibs
        const gibTypes = [
            { size: [0.3, 0.3, 0.6], color: 0xFFDBB5 },
            { size: [0.4, 0.4, 0.4], color: 0xFF6B6B },
            { size: [0.25, 0.25, 0.25], color: 0x8B0000 }
        ];
        
        for (let i = 0; i < 6; i++) {
            const gibType = gibTypes[Math.floor(Math.random() * gibTypes.length)];
            const geo = new THREE.BoxGeometry(...gibType.size);
            const mat = new THREE.MeshLambertMaterial({ color: gibType.color });
            const gib = new THREE.Mesh(geo, mat);
            
            gib.position.copy(position);
            gib.position.y += 1;
            
            const speed = Math.random() * 0.4 + 0.2;
            const angle = Math.random() * Math.PI * 2;
            const upward = Math.random() * 0.5 + 0.3;
            
            gib.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                upward,
                Math.sin(angle) * speed
            );
            
            gib.rotationVelocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3
            );
            
            gib.lifetime = Math.floor(Math.random() * 400 + 600);
            gib.castShadow = true;
            
            this.scene.add(gib);
            this.state.gibs.push(gib);
        }
    }
    
    updateBloodAndGibs() {
        for (let i = this.state.blood.length - 1; i >= 0; i--) {
            const particle = this.state.blood[i];
            
            if (particle.lifetime !== undefined) {
                particle.lifetime--;
                if (particle.lifetime <= 0) {
                    this.scene.remove(particle);
                    this.state.blood.splice(i, 1);
                    continue;
                }
                
                if (particle.material && particle.material.transparent) {
                    const fadeStart = particle.lifetime < 100 ? particle.lifetime / 100 : 1;
                    particle.material.opacity = Math.min(0.8, fadeStart * 0.8);
                }
            }
            
            if (particle.velocity) {
                particle.position.add(particle.velocity);
                particle.velocity.y -= 0.015;
                
                const groundLevel = this.getTerrainHeight(particle.position.x, particle.position.z);
                if (particle.position.y < groundLevel + 0.1) {
                    particle.position.y = groundLevel + 0.1;
                    particle.velocity.multiplyScalar(0.3);
                }
                
                if (particle.position.y < groundLevel + 0.15 && particle.velocity.length() < 0.02) {
                    particle.velocity = null;
                }
            }
        }
        
        for (let i = this.state.gibs.length - 1; i >= 0; i--) {
            const gib = this.state.gibs[i];
            
            gib.lifetime--;
            if (gib.lifetime <= 0) {
                this.scene.remove(gib);
                this.state.gibs.splice(i, 1);
                continue;
            }
            
            if (gib.velocity.length() > 0.01) {
                gib.position.add(gib.velocity);
                gib.velocity.y -= 0.015;
                
                gib.rotation.x += gib.rotationVelocity.x;
                gib.rotation.y += gib.rotationVelocity.y;
                gib.rotation.z += gib.rotationVelocity.z;
                
                const groundLevel = this.getTerrainHeight(gib.position.x, gib.position.z);
                if (gib.position.y < groundLevel + 0.2) {
                    gib.position.y = groundLevel + 0.2;
                    gib.velocity.y *= -0.3;
                    gib.velocity.x *= 0.5;
                    gib.velocity.z *= 0.5;
                    gib.rotationVelocity.multiplyScalar(0.5);
                    
                    if (Math.abs(gib.velocity.y) < 0.08) {
                        gib.velocity.set(0, 0, 0);
                        gib.rotationVelocity.set(0, 0, 0);
                    }
                }
            }
        }
    }
    
    // === OBSTACLES (Basic stadium version) ===
    createFlatRail(x, z, length, rotation = 0) {
        const railGeo = new THREE.CylinderGeometry(0.08, 0.08, length, 8);
        const rail = new THREE.Mesh(railGeo, this.metalMat);
        rail.position.set(x, this.getTerrainHeight(x, z) + 1, z);
        rail.rotation.set(0, rotation, Math.PI / 2);
        rail.userData.isRail = true;
        rail.castShadow = true;
        
        this.scene.add(rail);
        this.obstacles.push(rail);
    }
    
    checkGrinding() {
        if (!this.player || this.state.grinding) return;
        
        for (let obstacle of this.obstacles) {
            if (!obstacle.userData.isRail) continue;
            
            const dist = this.player.position.distanceTo(obstacle.position);
            if (dist < 2) {
                const heightDiff = Math.abs(this.player.position.y - obstacle.position.y);
                if (heightDiff < 1.5 && this.state.speed > 0.1) {
                    this.state.grinding = true;
                    this.state.currentRail = obstacle;
                    this.state.grounded = false;
                    this.state.jumping = true;
                    break;
                }
            }
        }
    }
    
    // === GAME LOOP ===
    update() {
        if (!this.player) return;
        
        // Skip movement during dialogue
        if (!this.dialogueSystem.isActive) {
            // Movement
            if (this.keys['w'] || this.keys['arrowup']) {
                this.state.speed = Math.min(this.state.speed + this.state.acceleration, this.state.maxSpeed);
            } else if (this.keys['s'] || this.keys['arrowdown']) {
                this.state.speed = Math.max(this.state.speed - this.state.acceleration, -this.state.maxSpeed / 2);
            } else {
                this.state.speed *= this.state.friction;
            }
            
            if (this.keys['a'] || this.keys['arrowleft']) {
                this.state.rotation += this.state.turnSpeed;
            }
            if (this.keys['d'] || this.keys['arrowright']) {
                this.state.rotation -= this.state.turnSpeed;
            }
            
            const moveX = Math.sin(this.state.rotation) * this.state.speed;
            const moveZ = Math.cos(this.state.rotation) * this.state.speed;
            
            this.player.position.x += moveX;
            this.player.position.z += moveZ;
            this.player.rotation.y = this.state.rotation;
        }
        
        // Physics
        if (this.state.jumping) {
            this.player.position.y += this.state.jumpVelocity;
            this.state.jumpVelocity += this.state.gravity;
            
            const groundLevel = this.getTerrainHeight(this.player.position.x, this.player.position.z) + 0.5;
            if (this.player.position.y <= groundLevel) {
                this.player.position.y = groundLevel;
                this.state.jumping = false;
                this.state.jumpVelocity = 0;
                this.state.grounded = true;
                this.state.canTrick = true;
                
                if (this.state.spinning) {
                    this.state.score += 100 * this.state.combo;
                }
                
                if (this.state.attemptingKickflip && this.state.spinning) {
                    this.state.kickflips++;
                    this.state.objectives.kickflips.current++;
                    if (this.state.objectives.kickflips.current >= this.state.objectives.kickflips.target) {
                        this.state.objectives.kickflips.complete = true;
                    }
                }
                
                if (this.state.spinning) {
                    this.state.spinning = false;
                    this.state.spinRotation = 0;
                    this.deck.rotation.x = 0;
                    this.state.attemptingKickflip = false;
                }
            }
        } else {
            const groundLevel = this.getTerrainHeight(this.player.position.x, this.player.position.z) + 0.5;
            this.player.position.y = groundLevel;
        }
        
        if (this.state.spinning) {
            this.state.spinRotation += 0.3;
            this.deck.rotation.x = this.state.spinRotation;
        }
        
        this.checkGrinding();
        
        if (this.state.grinding) {
            this.state.score += 5;
            this.state.combo = Math.max(this.state.combo, 1);
            this.state.comboTimer = 10;
            this.state.grounded = false;
            this.state.jumping = true;
            
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
        
        if (this.state.comboTimer > 0) {
            this.state.comboTimer--;
            if (this.state.comboTimer === 0 && this.state.grounded && !this.state.grinding) {
                this.state.combo = 0;
            }
        }
        
        if (this.state.trickTimer > 0) {
            this.state.trickTimer--;
            if (this.state.trickTimer === 0) {
                this.state.currentTrick = '';
            }
        }
        
        // Update game systems
        this.updateCollectibles();
        this.updateFootballPlayers();
        this.checkFootballPlayerCollisions();
        this.updateBloodAndGibs();
        
        // Check collectible proximity
        this.state.nearCollectible = null;
        for (let collectible of this.collectibles) {
            if (collectible.canCollect(this.player.position.x, this.player.position.z)) {
                this.state.nearCollectible = collectible;
                break;
            }
        }
        
        // Camera
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
    
    start() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            this.update();
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // === LEVEL LOADING ===
    loadLevelFromData(levelData) {
        console.log(`Loading level: ${levelData.name}`);
        
        if (levelData.ground) {
            levelData.ground.forEach(ground => {
                this._buildGround(ground);
            });
        }
        
        if (levelData.obstacles) {
            levelData.obstacles.forEach(obstacle => {
                if (obstacle.type === 'flatRail') {
                    this.createFlatRail(obstacle.x, obstacle.z, obstacle.length, obstacle.rotation || 0);
                }
            });
        }
        
        if (levelData.props) {
            levelData.props.forEach(prop => {
                this._buildProp(prop);
            });
        }
        
        const spawn = levelData.spawnPoint || { x: 0, z: 10 };
        this.createPlayer(spawn.x, spawn.z);
        
        // NEW: Load collectibles
        if (levelData.collectibles) {
            levelData.collectibles.forEach(item => {
                this.createCollectible(item.x, item.z, item.type, item.data || {});
            });
        }
        
        // NEW: Load football players
        if (levelData.footballPlayers) {
            levelData.footballPlayers.forEach(fp => {
                this.createFootballPlayer(fp.x, fp.z, fp.team, fp.position, fp.data || {});
            });
        }
        
        // NEW: Generate crowd
        if (levelData.crowd) {
            this.generateCrowd(levelData.crowd);
        }
        
        console.log('Level loaded successfully!');
    }
    
    _buildGround(groundData) {
        const geo = new THREE.PlaneGeometry(groundData.width, groundData.depth);
        let mat;
        
        if (groundData.type === 'grass') {
            mat = new THREE.MeshLambertMaterial({ color: groundData.color || 0x2d5a2d });
        } else if (groundData.type === 'concrete') {
            mat = new THREE.MeshLambertMaterial({ color: groundData.color || 0x606060 });
        } else {
            mat = this.concreteMat;
        }
        
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(
            groundData.position.x,
            groundData.position.y || 0.01,
            groundData.position.z
        );
        mesh.receiveShadow = true;
        this.scene.add(mesh);
    }
    
    _buildProp(propData) {
        if (propData.type === 'building' || propData.type === 'box') {
            const geo = new THREE.BoxGeometry(propData.width, propData.height, propData.depth);
            const color = parseInt(propData.color) || 0x2a2a2a;
            const mat = new THREE.MeshLambertMaterial({ color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(propData.position.x, propData.position.y, propData.position.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        }
    }
}

// ============================================================
// DIALOGUE SYSTEM CLASS
// ============================================================
class DialogueSystem {
    constructor() {
        this.isActive = false;
        this.isTyping = false;
        this.currentDialogue = [];
        this.currentIndex = 0;
        this.currentText = "";
        this.typingSpeed = 30;
        this.typingTimer = null;
        
        this.bubble = document.getElementById('speechBubble');
        this.speakerName = document.getElementById('speakerName');
        this.speechText = document.getElementById('speechText');
    }
    
    start(dialogue) {
        this.isActive = true;
        this.currentDialogue = dialogue;
        this.currentIndex = 0;
        this.showLine(0);
        if (this.bubble) this.bubble.classList.add('active');
    }
    
    showLine(index) {
        if (index >= this.currentDialogue.length) {
            this.end();
            return;
        }
        
        const line = this.currentDialogue[index];
        if (this.speakerName) this.speakerName.textContent = line.speaker;
        if (this.speechText) this.speechText.textContent = "";
        this.currentText = "";
        
        this.isTyping = true;
        this.typeText(line.text, 0);
    }
    
    typeText(fullText, charIndex) {
        if (charIndex < fullText.length) {
            this.currentText += fullText[charIndex];
            if (this.speechText) this.speechText.textContent = this.currentText;
            
            this.typingTimer = setTimeout(() => {
                this.typeText(fullText, charIndex + 1);
            }, this.typingSpeed);
        } else {
            this.isTyping = false;
        }
    }
    
    advance() {
        if (this.isTyping) {
            clearTimeout(this.typingTimer);
            if (this.speechText) this.speechText.textContent = this.currentDialogue[this.currentIndex].text;
            this.currentText = this.currentDialogue[this.currentIndex].text;
            this.isTyping = false;
        } else {
            this.currentIndex++;
            this.showLine(this.currentIndex);
        }
    }
    
    end() {
        this.isActive = false;
        this.isTyping = false;
        this.currentDialogue = [];
        this.currentIndex = 0;
        if (this.bubble) this.bubble.classList.remove('active');
        clearTimeout(this.typingTimer);
    }
}