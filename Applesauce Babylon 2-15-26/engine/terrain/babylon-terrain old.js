/**
 * APPLESAUCE Babylon.js Terrain System with Havok Physics
 * Clean, minimal baseline focused on terrain generation + physics-reactive objects
 * Replaces the 1,600 line Three.js manual physics approach
 */

export class BabylonTerrain {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        
        // Core terrain
        this.terrainMesh = null;
        this.terrainAggregate = null;
        
        // World objects (buildings, props, etc)
        this.worldObjects = [];
        
        // Noise config for procedural generation
        this.noiseConfig = null;
        
        console.log('🏔️ Babylon Terrain System initialized');
    }
    
    // ===================================
    // MAIN TERRAIN GENERATION
    // ===================================
    
    /**
     * Generate terrain based on config
     * Supports: 'flat', 'procedural', 'hills', 'skatepark'
     */
    generate(config) {
        console.log('🏔️ Generating terrain:', config.type || 'flat');
        
        // Clear existing
        this.clear();
        
        // Generate terrain mesh based on type
        switch(config.type) {
            case 'procedural':
                this.generateProcedural(config);
                break;
            case 'hills':
                this.generateHills(config);
                break;
            case 'skatepark':
                this.generateSkatepark(config);
                break;
            case 'flat':
            default:
                this.generateFlat(config);
                break;
        }
        
        // Add physics to terrain
        if (this.terrainMesh && config.physics !== false) {
            this.addTerrainPhysics();
        }
        
        // Generate world objects
        if (config.objects) {
            this.spawnObjects(config.objects);
        }
        
        console.log('✅ Terrain generated with Havok physics');
    }
    
    // ===================================
    // TERRAIN TYPES
    // ===================================
    
    /**
     * Flat ground plane - simplest option
     */
    generateFlat(config) {
        const size = config.size || 100;
        
        this.terrainMesh = BABYLON.MeshBuilder.CreateGround(
            "terrain",
            { width: size, height: size, subdivisions: config.subdivisions || 1 },
            this.scene
        );
        
        this.applyTerrainMaterial(config);
        this.terrainMesh.receiveShadow = true;
        
        console.log(`   ▪️ Flat terrain: ${size}x${size}`);
    }
    
    /**
     * Procedural terrain with noise-based height
     */
    generateProcedural(config) {
        const size = config.size || 200;
        const resolution = config.resolution || 100;
        
        // Create high-res plane
        const ground = BABYLON.MeshBuilder.CreateGround(
            "terrain",
            { 
                width: size, 
                height: size, 
                subdivisions: resolution 
            },
            this.scene
        );
        
        // Get noise config
        this.noiseConfig = this.getNoiseConfig(config);
        
        // Apply procedural height to vertices
        const positions = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            
            const height = this.calculateHeight(x, z, this.noiseConfig);
            positions[i + 1] = height; // Y is height
        }
        
        ground.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        ground.createNormals(true);
        
        this.terrainMesh = ground;
        this.applyTerrainMaterial(config);
        this.terrainMesh.receiveShadow = true;
        
        console.log(`   🌊 Procedural terrain: ${size}x${size}, ${resolution} subdivisions`);
    }
    
    /**
     * Hills/mountains terrain
     */
    generateHills(config) {
        const size = config.size || 200;
        const resolution = config.resolution || 80;
        const amplitude = config.amplitude || 15;
        
        this.generateProcedural({
            ...config,
            size,
            resolution,
            noise: {
                amplitude: amplitude,
                preset: 'hills'
            }
        });
        
        console.log(`   ⛰️ Hill terrain with amplitude ${amplitude}`);
    }
    
    /**
     * Skatepark-style terrain with ramps and bowls
     */
    generateSkatepark(config) {
        const size = config.size || 100;
        
        // Start with flat base
        this.generateFlat({ ...config, size });
        
        // Add skatepark features as separate objects
        if (config.features) {
            config.features.forEach(feature => {
                switch(feature.type) {
                    case 'ramp':
                        this.createRamp(feature);
                        break;
                    case 'rail':
                        this.createRail(feature);
                        break;
                    case 'quarterpipe':
                        this.createQuarterpipe(feature);
                        break;
                    case 'bowl':
                        this.createBowl(feature);
                        break;
                }
            });
        }
        
        console.log('   🛹 Skatepark terrain generated');
    }
    
    // ===================================
    // SKATEPARK FEATURES
    // ===================================
    
    createRamp(config) {
        const width = config.width || 5;
        const height = config.height || 2;
        const depth = config.depth || 8;
        const position = config.position || { x: 0, y: 0, z: 0 };
        
        // Create ramp as angled box
        const ramp = BABYLON.MeshBuilder.CreateBox(
            "ramp",
            { width, height, depth },
            this.scene
        );
        
        ramp.position = new BABYLON.Vector3(position.x, height / 2, position.z);
        ramp.rotation.z = config.angle || (Math.PI / 6); // 30° default
        
        // Material
        const mat = new BABYLON.StandardMaterial("rampMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        ramp.material = mat;
        
        // Physics - static ramp
        const aggregate = new BABYLON.PhysicsAggregate(
            ramp,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 0, friction: 0.2 }, // Low friction for sliding
            this.scene
        );
        
        this.worldObjects.push({ mesh: ramp, aggregate, type: 'ramp' });
        
        return ramp;
    }
    
    createRail(config) {
        const length = config.length || 10;
        const height = config.height || 1;
        const position = config.position || { x: 0, y: 0, z: 0 };
        
        // Rail as thin cylinder
        const rail = BABYLON.MeshBuilder.CreateCylinder(
            "rail",
            { 
                height: length, 
                diameter: 0.1,
                tessellation: 16
            },
            this.scene
        );
        
        rail.position = new BABYLON.Vector3(position.x, height, position.z);
        rail.rotation.x = Math.PI / 2; // Horizontal
        
        // Metallic material
        const mat = new BABYLON.StandardMaterial("railMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.75);
        mat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        rail.material = mat;
        
        // Physics - static rail with low friction
        const aggregate = new BABYLON.PhysicsAggregate(
            rail,
            BABYLON.PhysicsShapeType.CYLINDER,
            { mass: 0, friction: 0.05 }, // Very low friction for grinds
            this.scene
        );
        
        this.worldObjects.push({ mesh: rail, aggregate, type: 'rail' });
        
        return rail;
    }
    
    createQuarterpipe(config) {
        const width = config.width || 6;
        const height = config.height || 3;
        const depth = config.depth || 4;
        const position = config.position || { x: 0, y: 0, z: 0 };
        
        // Simplified quarterpipe as curved surface
        // For now, use a box approximation
        const qp = BABYLON.MeshBuilder.CreateBox(
            "quarterpipe",
            { width, height, depth },
            this.scene
        );
        
        qp.position = new BABYLON.Vector3(
            position.x,
            height / 2,
            position.z
        );
        qp.rotation.z = Math.PI / 4; // 45° angle
        
        const mat = new BABYLON.StandardMaterial("qpMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        qp.material = mat;
        
        const aggregate = new BABYLON.PhysicsAggregate(
            qp,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 0, friction: 0.3 },
            this.scene
        );
        
        this.worldObjects.push({ mesh: qp, aggregate, type: 'quarterpipe' });
        
        return qp;
    }
    
    createBowl(config) {
        const radius = config.radius || 8;
        const depth = config.depth || 3;
        const position = config.position || { x: 0, y: 0, z: 0 };
        
        // Bowl as sphere cut in half
        const bowl = BABYLON.MeshBuilder.CreateSphere(
            "bowl",
            { diameter: radius * 2, segments: 32 },
            this.scene
        );
        
        bowl.position = new BABYLON.Vector3(
            position.x,
            -depth,
            position.z
        );
        
        // Only show bottom half
        bowl.scaling.y = 0.5;
        
        const mat = new BABYLON.StandardMaterial("bowlMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0.45, 0.45, 0.45);
        mat.backFaceCulling = false; // See inside
        bowl.material = mat;
        
        const aggregate = new BABYLON.PhysicsAggregate(
            bowl,
            BABYLON.PhysicsShapeType.SPHERE,
            { mass: 0, friction: 0.4 },
            this.scene
        );
        
        this.worldObjects.push({ mesh: bowl, aggregate, type: 'bowl' });
        
        return bowl;
    }
    
    // ===================================
    // WORLD OBJECTS (Props, Buildings, etc)
    // ===================================
    
    /**
     * Spawn objects on terrain with automatic physics
     */
    spawnObjects(objects) {
        objects.forEach(obj => {
            this.spawnObject(obj);
        });
        
        console.log(`   📦 Spawned ${objects.length} objects with physics`);
    }
    
    /**
     * Spawn a single object
     */
    spawnObject(config) {
        let mesh;
        
        // Create mesh based on type
        switch(config.type) {
            case 'box':
                mesh = this.createBox(config);
                break;
            case 'cylinder':
                mesh = this.createCylinder(config);
                break;
            case 'sphere':
                mesh = this.createSphere(config);
                break;
            case 'building':
                mesh = this.createBuilding(config);
                break;
            default:
                mesh = this.createBox(config); // Default to box
        }
        
        // Position
        if (config.position) {
            mesh.position = new BABYLON.Vector3(
                config.position.x || 0,
                config.position.y || 0,
                config.position.z || 0
            );
        }
        
        // Add physics
        const physicsShape = this.getPhysicsShapeForType(config.type);
        const mass = config.mass !== undefined ? config.mass : 1;
        const friction = config.friction || 0.6;
        const restitution = config.restitution || 0.3;
        
        const aggregate = new BABYLON.PhysicsAggregate(
            mesh,
            physicsShape,
            { mass, friction, restitution },
            this.scene
        );
        
        // Store reference
        this.worldObjects.push({
            mesh,
            aggregate,
            type: config.type,
            config
        });
        
        return mesh;
    }
    
    // ===================================
    // OBJECT CREATORS
    // ===================================
    
    createBox(config) {
        const size = config.size || { width: 1, height: 1, depth: 1 };
        
        const box = BABYLON.MeshBuilder.CreateBox(
            config.name || "box",
            size,
            this.scene
        );
        
        if (config.color) {
            const mat = new BABYLON.StandardMaterial("boxMat", this.scene);
            mat.diffuseColor = new BABYLON.Color3(
                config.color.r || 0.5,
                config.color.g || 0.5,
                config.color.b || 0.5
            );
            box.material = mat;
        }
        
        box.receiveShadow = true;
        box.castShadow = true;
        
        return box;
    }
    
    createCylinder(config) {
        const cylinder = BABYLON.MeshBuilder.CreateCylinder(
            config.name || "cylinder",
            {
                height: config.height || 2,
                diameter: config.diameter || 1
            },
            this.scene
        );
        
        if (config.color) {
            const mat = new BABYLON.StandardMaterial("cylMat", this.scene);
            mat.diffuseColor = new BABYLON.Color3(
                config.color.r || 0.5,
                config.color.g || 0.5,
                config.color.b || 0.5
            );
            cylinder.material = mat;
        }
        
        cylinder.receiveShadow = true;
        cylinder.castShadow = true;
        
        return cylinder;
    }
    
    createSphere(config) {
        const sphere = BABYLON.MeshBuilder.CreateSphere(
            config.name || "sphere",
            {
                diameter: config.diameter || 1,
                segments: config.segments || 16
            },
            this.scene
        );
        
        if (config.color) {
            const mat = new BABYLON.StandardMaterial("sphereMat", this.scene);
            mat.diffuseColor = new BABYLON.Color3(
                config.color.r || 0.5,
                config.color.g || 0.5,
                config.color.b || 0.5
            );
            sphere.material = mat;
        }
        
        sphere.receiveShadow = true;
        sphere.castShadow = true;
        
        return sphere;
    }
    
    createBuilding(config) {
        const width = config.width || 5;
        const height = config.height || 10;
        const depth = config.depth || 5;
        
        const building = BABYLON.MeshBuilder.CreateBox(
            config.name || "building",
            { width, height, depth },
            this.scene
        );
        
        // Building material
        const mat = new BABYLON.StandardMaterial("buildingMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.65);
        building.material = mat;
        
        building.receiveShadow = true;
        building.castShadow = true;
        
        return building;
    }
    
    // ===================================
    // PHYSICS HELPERS
    // ===================================
    
    addTerrainPhysics() {
        if (!this.terrainMesh) return;
        
        // Use MESH shape for procedural terrain, BOX for flat
        const shapeType = this.noiseConfig ? 
            BABYLON.PhysicsShapeType.MESH : 
            BABYLON.PhysicsShapeType.BOX;
        
        // Terrain is static (mass: 0)
        this.terrainAggregate = new BABYLON.PhysicsAggregate(
            this.terrainMesh,
            shapeType,
            { mass: 0, friction: 0.8 },
            this.scene
        );
        
        console.log(`   ⚡ Terrain physics enabled (${shapeType === BABYLON.PhysicsShapeType.MESH ? 'MESH' : 'BOX'} shape)`);
    }
    
    getPhysicsShapeForType(type) {
        const shapeMap = {
            'box': BABYLON.PhysicsShapeType.BOX,
            'cylinder': BABYLON.PhysicsShapeType.CYLINDER,
            'sphere': BABYLON.PhysicsShapeType.SPHERE,
            'building': BABYLON.PhysicsShapeType.BOX
        };
        
        return shapeMap[type] || BABYLON.PhysicsShapeType.BOX;
    }
    
    // ===================================
    // PROCEDURAL NOISE HELPERS
    // ===================================
    
    calculateHeight(x, z, config) {
        let height = 0;
        
        // Layer 1: Large rolling hills
        height += Math.sin(x * config.freq1) * config.amp1;
        height += Math.cos(z * config.freq1) * config.amp1;
        
        // Layer 2: Medium variations
        height += Math.sin(x * config.freq2) * config.amp2;
        height += Math.cos(z * config.freq2) * config.amp2;
        
        // Layer 3: Small details
        height += Math.sin(x * config.freq3) * config.amp3;
        height += Math.cos(z * config.freq3) * config.amp3;
        
        // Diagonal patterns
        height += Math.sin((x + z) * config.freqDiag) * config.ampDiag;
        
        return height;
    }
    
    getNoiseConfig(config) {
        if (config.noise) {
            if (config.noise.preset) {
                return this.getNoisePreset(config.noise.preset);
            } else {
                return config.noise;
            }
        }
        
        // Default smooth hills
        return this.getNoisePreset('smooth');
    }
    
    getNoisePreset(preset) {
        const presets = {
            'flat': {
                freq1: 0, freq2: 0, freq3: 0, freqDiag: 0,
                amp1: 0, amp2: 0, amp3: 0, ampDiag: 0
            },
            'smooth': {
                freq1: 0.01, freq2: 0.03, freq3: 0.08, freqDiag: 0.02,
                amp1: 8, amp2: 3, amp3: 1, ampDiag: 2
            },
            'hills': {
                freq1: 0.008, freq2: 0.02, freq3: 0.06, freqDiag: 0.015,
                amp1: 15, amp2: 6, amp3: 2, ampDiag: 4
            },
            'mountains': {
                freq1: 0.005, freq2: 0.015, freq3: 0.04, freqDiag: 0.01,
                amp1: 30, amp2: 12, amp3: 4, ampDiag: 8
            },
            'rough': {
                freq1: 0.02, freq2: 0.06, freq3: 0.15, freqDiag: 0.04,
                amp1: 5, amp2: 8, amp3: 3, ampDiag: 4
            }
        };
        
        return presets[preset] || presets['smooth'];
    }
    
    // ===================================
    // MATERIAL HELPERS
    // ===================================
    
    applyTerrainMaterial(config) {
        if (!this.terrainMesh) return;
        
        const mat = new BABYLON.StandardMaterial("terrainMat", this.scene);
        
        // Color
        const color = config.color || { r: 0.34, g: 0.49, b: 0.27 }; // Grass green
        mat.diffuseColor = new BABYLON.Color3(color.r, color.g, color.b);
        
        // Surface properties
        mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        mat.roughness = config.roughness || 0.9;
        
        this.terrainMesh.material = mat;
    }
    
    // ===================================
    // UTILITY METHODS
    // ===================================
    
    /**
     * Get height at X,Z position (for AI pathfinding, etc)
     * NOTE: With Havok, you usually don't need this for physics!
     * But it's useful for placing objects or AI navigation
     */
    getHeightAt(x, z) {
        if (!this.terrainMesh) return 0;
        
        // For procedural terrain
        if (this.noiseConfig) {
            return this.calculateHeight(x, z, this.noiseConfig);
        }
        
        // For flat terrain
        return 0;
    }
    
    /**
     * Find object by name
     */
    findObject(name) {
        return this.worldObjects.find(obj => obj.mesh.name === name);
    }
    
    /**
     * Remove object by reference
     */
    removeObject(obj) {
        const index = this.worldObjects.indexOf(obj);
        if (index > -1) {
            obj.mesh.dispose();
            obj.aggregate.dispose();
            this.worldObjects.splice(index, 1);
        }
    }
    
    // ===================================
    // CLEANUP
    // ===================================
    
    clear() {
        // Remove terrain
        if (this.terrainMesh) {
            this.terrainMesh.dispose();
            this.terrainMesh = null;
        }
        
        if (this.terrainAggregate) {
            this.terrainAggregate.dispose();
            this.terrainAggregate = null;
        }
        
        // Remove all world objects
        this.worldObjects.forEach(obj => {
            obj.mesh.dispose();
            if (obj.aggregate) {
                obj.aggregate.dispose();
            }
        });
        
        this.worldObjects = [];
        this.noiseConfig = null;
        
        console.log('🏔️ Terrain cleared');
    }
}
