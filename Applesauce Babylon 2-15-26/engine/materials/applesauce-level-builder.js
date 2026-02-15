/**
 * APPLESAUCE Level Builder v2.0 - WITH COLLISION INTEGRATION
 * Creates physical level objects AND registers them for collision
 * Works with ApplesauceCollision v2.0
 */
import * as THREE from 'three';

export class ApplesauceLevelBuilder {
    constructor(core) {
        this.core = core;
        this.scene = core.scene;
        this.materials = core.modules.materials;
        this.collision = core.modules.collision; // NEW: Reference to collision module
        
        // Track created objects for cleanup
        this.builtObjects = [];
        
        // NEW: Auto-register for collision by default
        this.autoRegisterCollision = true;
        
        console.log('🗂️ Level Builder v2.0 ready (with collision)');
    }
    
    // ===================================
    // CONFIGURATION
    // ===================================
    
    /**
     * Enable or disable automatic collision registration
     */
    setAutoCollision(enabled) {
        this.autoRegisterCollision = enabled;
        console.log(`🗂️ Auto-collision: ${enabled ? 'ON' : 'OFF'}`);
    }
    
    // ===================================
    // RAILS (WITH COLLISION)
    // ===================================
    
    createRail(x, z, length, height = 2, grindable = true) {
        const railGroup = new THREE.Group();
        
        // Support poles
        const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, height);
        const pole1 = new THREE.Mesh(poleGeo, this.materials.getMaterial('metal'));
        pole1.position.set(0, height / 2, -length / 2);
        pole1.castShadow = true;
        
        const pole2 = new THREE.Mesh(poleGeo, this.materials.getMaterial('metal'));
        pole2.position.set(0, height / 2, length / 2);
        pole2.castShadow = true;
        
        // The grindable rail
        const railGeo = new THREE.CylinderGeometry(0.15, 0.15, length);
        const rail = new THREE.Mesh(railGeo, this.materials.getMaterial('metal'));
        rail.rotation.x = Math.PI / 2;
        rail.position.y = height;
        rail.castShadow = true;
        rail.userData.isGrindable = true;
        
        railGroup.add(pole1, pole2, rail);
        railGroup.position.set(x, 0, z);
        
        this.scene.add(railGroup);
        this.core.rails.push(rail);
        this.builtObjects.push(railGroup);
        
        // NEW: Register for collision
        if (this.autoRegisterCollision && this.collision) {
            // Poles are blocking
            this.collision.registerObject(pole1, {
                type: 'obstacle',
                blocking: true,
                canSlide: false
            });
            this.collision.registerObject(pole2, {
                type: 'obstacle',
                blocking: true,
                canSlide: false
            });
            
            // Rail is grindable but not blocking (you skate under it)
            if (grindable) {
                this.collision.registerObject(rail, {
                    type: 'obstacle',
                    blocking: false,
                    grindable: true
                });
            }
        }
        
        return railGroup;
    }
    
    createRails(config) {
        const count = config.count || 5;
        const spread = config.spread || 100;
        const zStart = config.zStart || 50;
        const zRange = config.zRange || 200;
        
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * spread;
            const z = Math.random() * zRange + zStart;
            const length = config.length || 20;
            this.createRail(x, z, length);
        }
    }
    
    // ===================================
    // RAMPS (WITH COLLISION)
    // ===================================
    
    createQuarterPipe(x, z, rotation = 0, width = 8) {
        const pipe = new THREE.Group();
        
        // Main ramp geometry
        const rampGeo = new THREE.BoxGeometry(6, 4, width);
        const ramp = new THREE.Mesh(rampGeo, this.materials.getMaterial('concrete'));
        ramp.position.set(3, 2, 0);
        ramp.rotation.z = Math.PI / 4;
        ramp.castShadow = true;
        ramp.receiveShadow = true;
        pipe.add(ramp);
        
        // Coping (grindable edge)
        const copingGeo = new THREE.CylinderGeometry(0.08, 0.08, width, 12);
        const coping = new THREE.Mesh(copingGeo, this.materials.getMaterial('metal'));
        coping.rotation.x = Math.PI / 2;
        coping.position.set(4.2, 4.2, 0);
        coping.castShadow = true;
        coping.userData.isGrindable = true;
        pipe.add(coping);
        
        pipe.position.set(x, 0, z);
        pipe.rotation.y = rotation;
        
        this.scene.add(pipe);
        this.core.rails.push(coping);
        this.builtObjects.push(pipe);
        
        // NEW: Register for collision
        if (this.autoRegisterCollision && this.collision) {
            // Ramp launches player
            this.collision.registerObject(ramp, {
                type: 'ramp',
                blocking: false,
                canSlide: true
            });
            
            // Coping is grindable
            this.collision.registerObject(coping, {
                type: 'obstacle',
                blocking: false,
                grindable: true
            });
        }
        
        return pipe;
    }
    
    createHalfPipe(x, z, rotation = 0, width = 20, height = 6) {
        const halfPipe = new THREE.Group();
        
        // Create quarter pipes (they handle their own collision)
        const left = this.createQuarterPipe(0, 0, 0, width);
        left.position.x = -10;
        halfPipe.add(left);
        
        const right = this.createQuarterPipe(0, 0, Math.PI, width);
        right.position.x = 10;
        halfPipe.add(right);
        
        // Flat bottom
        const bottomGeo = new THREE.BoxGeometry(20, 0.5, width);
        const bottom = new THREE.Mesh(bottomGeo, this.materials.getMaterial('concrete'));
        bottom.position.y = 0.25;
        bottom.receiveShadow = true;
        halfPipe.add(bottom);
        
        halfPipe.position.set(x, 0, z);
        halfPipe.rotation.y = rotation;
        
        this.scene.add(halfPipe);
        this.builtObjects.push(halfPipe);
        
        // Bottom doesn't need special collision (just flat ground)
        
        return halfPipe;
    }
    
    createLaunchRamp(x, z, rotation = 0, width = 10, height = 3) {
        const ramp = new THREE.Group();
        
        // Ramp slope
        const slopeGeo = new THREE.BoxGeometry(width, height, width);
        const slope = new THREE.Mesh(slopeGeo, this.materials.getMaterial('wood'));
        slope.rotation.x = -Math.PI / 6;
        slope.position.set(0, height / 2, 0);
        slope.castShadow = true;
        slope.receiveShadow = true;
        ramp.add(slope);
        
        ramp.position.set(x, 0, z);
        ramp.rotation.y = rotation;
        
        this.scene.add(ramp);
        this.builtObjects.push(ramp);
        
        // NEW: Register as ramp for collision
        if (this.autoRegisterCollision && this.collision) {
            this.collision.registerObject(slope, {
                type: 'ramp',
                blocking: false,
                canSlide: true
            });
        }
        
        return ramp;
    }
    
    // ===================================
    // FENCES & WALLS (WITH COLLISION)
    // ===================================
    
    createFence(x, z, length, rotation = 0, grindable = true) {
        const fence = new THREE.Group();
        
        // Fence posts
        const posts = [];
        for (let i = 0; i <= length; i += 5) {
            const postGeo = new THREE.BoxGeometry(0.3, 2, 0.3);
            const post = new THREE.Mesh(postGeo, this.materials.getMaterial('wood'));
            post.position.set(i, 1, 0);
            post.castShadow = true;
            fence.add(post);
            posts.push(post);
        }
        
        // Horizontal rails
        const rails = [];
        for (let h of [0.5, 1.5]) {
            const railGeo = new THREE.BoxGeometry(length, 0.2, 0.2);
            const rail = new THREE.Mesh(railGeo, this.materials.getMaterial('wood'));
            rail.position.set(length / 2, h, 0);
            rail.castShadow = true;
            
            if (grindable) {
                rail.userData.isGrindable = true;
                this.core.rails.push(rail);
            }
            
            fence.add(rail);
            rails.push(rail);
        }
        
        fence.position.set(x, 0, z);
        fence.rotation.y = rotation;
        
        this.scene.add(fence);
        this.builtObjects.push(fence);
        
        // NEW: Register for collision
        if (this.autoRegisterCollision && this.collision) {
            // Posts are blocking
            posts.forEach(post => {
                this.collision.registerObject(post, {
                    type: 'obstacle',
                    blocking: true,
                    canSlide: false
                });
            });
            
            // Rails can be ground or just block
            rails.forEach(rail => {
                this.collision.registerObject(rail, {
                    type: 'obstacle',
                    blocking: !grindable,
                    grindable: grindable
                });
            });
        }
        
        return fence;
    }
    
    /**
     * NEW: Create a solid wall (fully blocking)
     */
    createWall(x, z, width = 10, height = 5, rotation = 0) {
        const wall = new THREE.Group();
        
        const wallGeo = new THREE.BoxGeometry(width, height, 0.5);
        const wallMesh = new THREE.Mesh(wallGeo, this.materials.getMaterial('concrete'));
        wallMesh.position.set(0, height / 2, 0);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        wall.add(wallMesh);
        
        wall.position.set(x, 0, z);
        wall.rotation.y = rotation;
        
        this.scene.add(wall);
        this.builtObjects.push(wall);
        
        // NEW: Register as blocking wall
        if (this.autoRegisterCollision && this.collision) {
            this.collision.registerObject(wallMesh, {
                type: 'wall',
                blocking: true,
                canSlide: false,
                bouncy: false
            });
        }
        
        return wall;
    }
    
    // ===================================
    // BOXES & PLATFORMS (WITH COLLISION)
    // ===================================
    
    createGrindBox(x, z, width = 4, height = 1, depth = 2) {
        const box = new THREE.Group();
        
        // Main box
        const boxGeo = new THREE.BoxGeometry(width, height, depth);
        const boxMesh = new THREE.Mesh(boxGeo, this.materials.getMaterial('wood'));
        boxMesh.position.y = height / 2;
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        box.add(boxMesh);
        
        // Metal edges (grindable)
        const edges = [];
        const edgeConfigs = [
            { x: width / 2, z: 0, rotation: 0 },      // Right edge
            { x: -width / 2, z: 0, rotation: 0 },     // Left edge
            { x: 0, z: depth / 2, rotation: Math.PI / 2 },    // Front edge
            { x: 0, z: -depth / 2, rotation: Math.PI / 2 }    // Back edge
        ];
        
        edgeConfigs.forEach(cfg => {
            const edgeGeo = new THREE.BoxGeometry(0.1, 0.1, cfg.rotation === 0 ? depth : width);
            const edgeMesh = new THREE.Mesh(edgeGeo, this.materials.getMaterial('metal'));
            edgeMesh.position.set(cfg.x, height, cfg.z);
            edgeMesh.rotation.y = cfg.rotation;
            edgeMesh.userData.isGrindable = true;
            edgeMesh.castShadow = true;
            box.add(edgeMesh);
            this.core.rails.push(edgeMesh);
            edges.push(edgeMesh);
        });
        
        box.position.set(x, 0, z);
        
        this.scene.add(box);
        this.builtObjects.push(box);
        
        // NEW: Register for collision
        if (this.autoRegisterCollision && this.collision) {
            // Main box is blocking at sides, but you can grind on top
            this.collision.registerObject(boxMesh, {
                type: 'box',
                blocking: true,
                grindable: true  // Top edge can be ground
            });
            
            // Edges are explicitly grindable
            edges.forEach(edge => {
                this.collision.registerObject(edge, {
                    type: 'obstacle',
                    blocking: false,
                    grindable: true
                });
            });
        }
        
        return box;
    }
    
    /**
     * NEW: Create a simple platform (can jump onto)
     */
    createPlatform(x, z, width = 8, depth = 8, height = 2) {
        const platform = new THREE.Group();
        
        const platformGeo = new THREE.BoxGeometry(width, height, depth);
        const platformMesh = new THREE.Mesh(platformGeo, this.materials.getMaterial('concrete'));
        platformMesh.position.y = height / 2;
        platformMesh.castShadow = true;
        platformMesh.receiveShadow = true;
        platform.add(platformMesh);
        
        platform.position.set(x, 0, z);
        
        this.scene.add(platform);
        this.builtObjects.push(platform);
        
        // Register as solid obstacle
        if (this.autoRegisterCollision && this.collision) {
            this.collision.registerObject(platformMesh, {
                type: 'obstacle',
                blocking: true,
                canSlide: false
            });
        }
        
        return platform;
    }
    
    // ===================================
    // SPECIAL OBSTACLES
    // ===================================
    
    createSpeedBoost(x, z, direction = 0, boostMultiplier = 1.5) {
        const boost = new THREE.Group();
        
        // Visual indicator
        const arrowGeo = new THREE.ConeGeometry(1, 2, 3);
        const arrow = new THREE.Mesh(arrowGeo, this.materials.getSpeedMaterial(1.0));
        arrow.rotation.x = Math.PI / 2;
        arrow.position.y = 0.5;
        boost.add(arrow);
        
        // Collision zone
        const zoneGeo = new THREE.CylinderGeometry(2, 2, 0.5);
        const zone = new THREE.Mesh(zoneGeo, this.materials.getMaterial('concrete'));
        zone.position.y = 0.25;
        zone.userData.isSpeedBoost = true;
        zone.userData.boostMultiplier = boostMultiplier;
        boost.add(zone);
        
        boost.position.set(x, 0, z);
        boost.rotation.y = direction;
        
        this.scene.add(boost);
        this.builtObjects.push(boost);
        
        // NEW: Register with custom callback
        if (this.autoRegisterCollision && this.collision) {
            this.collision.registerObject(zone, {
                type: 'obstacle',
                blocking: false,
                callback: (core, collisionData) => {
                    // Apply speed boost
                    core.state.speed = Math.min(
                        core.state.speed * boostMultiplier,
                        core.state.maxSpeed * 1.5
                    );
                    console.log(`⚡ Speed boost! ${boostMultiplier}x`);
                }
            });
        }
        
        return boost;
    }
    
    createCheckpoint(x, z, checkpointNumber) {
        const checkpoint = new THREE.Group();
        
        // Archway
        const leftPole = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 5, 0.5),
            this.materials.getMaterial('metal')
        );
        leftPole.position.set(-3, 2.5, 0);
        leftPole.castShadow = true;
        checkpoint.add(leftPole);
        
        const rightPole = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 5, 0.5),
            this.materials.getMaterial('metal')
        );
        rightPole.position.set(3, 2.5, 0);
        rightPole.castShadow = true;
        checkpoint.add(rightPole);
        
        // Top banner
        const banner = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.5, 0.5),
            this.materials.getSpeedMaterial(1.0)
        );
        banner.position.set(0, 5, 0);
        checkpoint.add(banner);
        
        // Trigger zone
        const trigger = new THREE.Mesh(
            new THREE.BoxGeometry(6, 5, 1),
            new THREE.MeshBasicMaterial({ 
                color: 0x00FF00, 
                transparent: true, 
                opacity: 0.3,
                wireframe: true 
            })
        );
        trigger.position.set(0, 2.5, 0);
        trigger.userData.isCheckpoint = true;
        trigger.userData.checkpointNumber = checkpointNumber;
        checkpoint.add(trigger);
        
        checkpoint.position.set(x, 0, z);
        
        this.scene.add(checkpoint);
        this.builtObjects.push(checkpoint);
        
        // NEW: Register poles as obstacles
        if (this.autoRegisterCollision && this.collision) {
            this.collision.registerObject(leftPole, {
                type: 'obstacle',
                blocking: true
            });
            this.collision.registerObject(rightPole, {
                type: 'obstacle',
                blocking: true
            });
            
            // Trigger zone with custom callback
            this.collision.registerObject(trigger, {
                type: 'obstacle',
                blocking: false,
                callback: (core) => {
                    console.log(`✓ Checkpoint ${checkpointNumber} reached!`);
                    // Hook for checkpoint system
                    if (core.modules.objectives) {
                        // Trigger checkpoint event
                    }
                }
            });
        }
        
        return checkpoint;
    }
    
    // ===================================
    // BATCH CREATION HELPERS (NEW)
    // ===================================
    
    /**
     * Create a line of obstacles
     */
    createObstacleLine(startX, startZ, endX, endZ, obstacleType, count) {
        const obstacles = [];
        
        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);
            const x = startX + (endX - startX) * t;
            const z = startZ + (endZ - startZ) * t;
            
            let obstacle;
            switch (obstacleType) {
                case 'box':
                    obstacle = this.createGrindBox(x, z);
                    break;
                case 'wall':
                    obstacle = this.createWall(x, z, 5, 3);
                    break;
                case 'platform':
                    obstacle = this.createPlatform(x, z, 4, 4, 1);
                    break;
                default:
                    console.warn(`Unknown obstacle type: ${obstacleType}`);
                    continue;
            }
            
            obstacles.push(obstacle);
        }
        
        return obstacles;
    }
    
    /**
     * Create a grid of obstacles
     */
    createObstacleGrid(centerX, centerZ, rows, cols, spacing, obstacleType) {
        const obstacles = [];
        
        const totalWidth = (cols - 1) * spacing;
        const totalDepth = (rows - 1) * spacing;
        const startX = centerX - totalWidth / 2;
        const startZ = centerZ - totalDepth / 2;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * spacing;
                const z = startZ + row * spacing;
                
                let obstacle;
                switch (obstacleType) {
                    case 'box':
                        obstacle = this.createGrindBox(x, z);
                        break;
                    case 'platform':
                        obstacle = this.createPlatform(x, z, 3, 3, 1);
                        break;
                    default:
                        continue;
                }
                
                obstacles.push(obstacle);
            }
        }
        
        return obstacles;
    }
    
    // ===================================
    // UTILITY
    // ===================================
    
    clearAll() {
        // Unregister all collision objects if collision module exists
        if (this.collision) {
            this.builtObjects.forEach(obj => {
                obj.traverse(child => {
                    if (child.isMesh) {
                        this.collision.unregisterObject(child);
                    }
                });
            });
        }
        
        // Remove from scene
        this.builtObjects.forEach(obj => {
            this.scene.remove(obj);
        });
        
        this.builtObjects = [];
        console.log('🗂️ Level builder cleared (collision unregistered)');
    }
}
