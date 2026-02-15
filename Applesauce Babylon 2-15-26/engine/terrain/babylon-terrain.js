/**
 * APPLESAUCE Babylon.js Terrain System with Havok Physics
 * Clean, minimal baseline focused on terrain generation + physics-reactive objects
 * 
 * v2.0 — Now supports CHUNKED terrain (multiple tiled chunks with edge blending)
 *         alongside the original single-mesh modes.
 * 
 * USAGE:
 *   // Single mesh (original behavior):
 *   terrain.generate({ type: 'procedural', size: 200, resolution: 100 });
 *   terrain.generate({ type: 'skatepark', size: 100, features: [...] });
 *
 *   // Chunked terrain (new):
 *   terrain.generate({ 
 *       type: 'chunked',
 *       chunkSize: 100,
 *       chunkResolution: 40,
 *       layout: [
 *           ['mountains', 'hills',  'mountains'],
 *           ['hills',     'smooth', 'hills'],
 *           ['mountains', 'hills',  'mountains']
 *       ]
 *   });
 *
 *   // Chunked with uniform grid (all same type):
 *   terrain.generate({ type: 'chunked', gridSize: 5, noise: { preset: 'hills' } });
 *
 *   // Infinite streaming (call in render loop):
 *   terrain.generate({ type: 'chunked', streaming: true });
 *   // then in render loop:
 *   terrain.updateChunksAroundPosition(player.position, 3);
 */

export class BabylonTerrain {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        
        // Single-mesh terrain (original modes)
        this.terrainMesh = null;
        this.terrainAggregate = null;
        
        // Chunked terrain
        this.chunks = new Map();        // key -> { mesh, aggregate, cx, cz, mode }
        this.chunkModes = new Map();    // key -> mode string (for neighbor lookups)
        this.allTerrainMeshes = [];     // flat list for raycasting
        this.isChunked = false;
        
        // Shared config
        this.chunkSize = 100;
        this.chunkResolution = 40;
        this.blendRatio = 0.3;          // Edge blend zone = 30% of chunk width
        
        // World objects (buildings, props, etc)
        this.worldObjects = [];
        
        // Noise
        this.noiseConfig = null;
        this._noiseSeed = 12345;
        
        console.log('🏔️ Babylon Terrain System initialized (v2.0 — chunked support)');
    }
    
    // ===================================
    // MAIN TERRAIN GENERATION
    // ===================================
    
    /**
     * Generate terrain based on config
     * Supports: 'flat', 'procedural', 'hills', 'skatepark', 'chunked'
     */
    generate(config) {
        console.log('🏔️ Generating terrain:', config.type || 'flat');
        
        // Clear existing
        this.clear();
        
        // Generate terrain mesh based on type
        switch(config.type) {
            case 'chunked':
                this.generateChunked(config);
                break;
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
        
        // Add physics to terrain (single-mesh modes)
        if (!this.isChunked && this.terrainMesh && config.physics !== false) {
            this.addTerrainPhysics();
        }
        
        // Generate world objects
        if (config.objects) {
            this.spawnObjects(config.objects);
        }
        
        console.log('✅ Terrain generated with Havok physics');
    }
    
    // ===================================
    // SINGLE-MESH TERRAIN TYPES (original)
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
            positions[i + 1] = height;
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
        
        this.generateFlat({ ...config, size });
        
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
    // CHUNKED TERRAIN SYSTEM
    // ===================================
    
    /**
     * Generate tiled terrain chunks that sit side-by-side.
     * Heights are calculated in WORLD space, so edges match.
     * Different modes per chunk are blended at borders.
     * 
     * Config options:
     *   layout:          2D array of noise preset names (e.g. [['hills','smooth'],['mountains','hills']])
     *   gridSize:        NxN uniform grid (alternative to layout)
     *   chunkSize:       world units per chunk (default: 100)
     *   chunkResolution: subdivisions per chunk (default: 40)
     *   blendRatio:      how much of each edge blends (0-0.5, default: 0.3)
     *   streaming:       if true, don't auto-generate — use updateChunksAroundPosition() instead
     *   noise.preset:    preset name for uniform grid mode
     */
    generateChunked(config) {
        this.isChunked = true;
        this.chunkSize = config.chunkSize || 100;
        this.chunkResolution = config.chunkResolution || 40;
        this.blendRatio = config.blendRatio !== undefined ? config.blendRatio : 0.3;
        
        if (config.streaming) {
            // Streaming mode: chunks are generated on-demand via updateChunksAroundPosition()
            console.log('   🌍 Chunked terrain (streaming mode) — call updateChunksAroundPosition() in render loop');
            return;
        }
        
        if (config.layout) {
            // Layout mode: 2D array defines the world
            this._generateFromLayout(config.layout, config);
        } else {
            // Uniform grid mode
            const gridSize = config.gridSize || 3;
            const preset = (config.noise && config.noise.preset) || 'smooth';
            this._generateGrid(gridSize, preset, config);
        }
    }
    
    /**
     * Generate from a 2D layout array.
     * Each cell is a noise preset name string.
     */
    _generateFromLayout(layout, config) {
        const rows = layout.length;
        const cols = layout[0].length;
        const halfR = Math.floor(rows / 2);
        const halfC = Math.floor(cols / 2);
        
        // Pass 1: register all modes so neighbors are known during generation
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cx = col - halfC;
                const cz = row - halfR;
                this.chunkModes.set(`${cx},${cz}`, layout[row][col]);
            }
        }
        
        // Pass 2: generate meshes with edge blending
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cx = col - halfC;
                const cz = row - halfR;
                this._generateChunkTile(cx, cz, layout[row][col], config);
            }
        }
        
        console.log(`   🧩 Chunked terrain: ${rows}x${cols} layout (${this.allTerrainMeshes.length} chunks)`);
    }
    
    /**
     * Generate a uniform NxN grid, all using the same preset
     */
    _generateGrid(gridSize, preset, config) {
        const half = Math.floor(gridSize / 2);
        
        // Pass 1: register modes
        for (let cx = -half; cx <= half; cx++) {
            for (let cz = -half; cz <= half; cz++) {
                this.chunkModes.set(`${cx},${cz}`, preset);
            }
        }
        
        // Pass 2: generate
        for (let cx = -half; cx <= half; cx++) {
            for (let cz = -half; cz <= half; cz++) {
                this._generateChunkTile(cx, cz, preset, config);
            }
        }
        
        console.log(`   🧩 Chunked terrain: ${gridSize}x${gridSize} uniform grid (${this.allTerrainMeshes.length} chunks)`);
    }
    
    /**
     * Generate a single chunk tile at grid position (cx, cz)
     */
    _generateChunkTile(cx, cz, preset, config) {
        const key = `${cx},${cz}`;
        if (this.chunks.has(key)) return this.chunks.get(key);
        
        const size = this.chunkSize;
        const res = this.chunkResolution;
        const worldX = cx * size;
        const worldZ = cz * size;
        
        // Create ground tile
        const ground = BABYLON.MeshBuilder.CreateGround(
            `terrain_${key}`,
            { width: size, height: size, subdivisions: res, updatable: true },
            this.scene
        );
        
        ground.position.x = worldX;
        ground.position.z = worldZ;
        
        // Get noise config for this chunk's preset
        const noiseConf = this.getNoisePreset(preset);
        
        // Deform vertices with edge blending
        const positions = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const halfSize = size / 2;
        const blendDist = halfSize * this.blendRatio;
        
        // Look up neighbor presets
        const neighbors = {
            px: this.chunkModes.get(`${cx + 1},${cz}`) || null,
            nx: this.chunkModes.get(`${cx - 1},${cz}`) || null,
            pz: this.chunkModes.get(`${cx},${cz + 1}`) || null,
            nz: this.chunkModes.get(`${cx},${cz - 1}`) || null,
        };
        
        for (let i = 0; i < positions.length; i += 3) {
            const localX = positions[i];
            const localZ = positions[i + 2];
            const wx = localX + worldX;
            const wz = localZ + worldZ;
            
            // This chunk's height
            let height = this._fractalHeight(wx, wz, noiseConf);
            
            // Edge blending: smoothly lerp into neighbor's height near borders
            // +X edge
            if (neighbors.px && localX > halfSize - blendDist) {
                const t = this._smoothstep((localX - (halfSize - blendDist)) / blendDist);
                const nh = this._fractalHeight(wx, wz, this.getNoisePreset(neighbors.px));
                height = this._lerp(height, nh, t);
            }
            // -X edge
            if (neighbors.nx && localX < -halfSize + blendDist) {
                const t = this._smoothstep(((-halfSize + blendDist) - localX) / blendDist);
                const nh = this._fractalHeight(wx, wz, this.getNoisePreset(neighbors.nx));
                height = this._lerp(height, nh, t);
            }
            // +Z edge
            if (neighbors.pz && localZ > halfSize - blendDist) {
                const t = this._smoothstep((localZ - (halfSize - blendDist)) / blendDist);
                const nh = this._fractalHeight(wx, wz, this.getNoisePreset(neighbors.pz));
                height = this._lerp(height, nh, t);
            }
            // -Z edge
            if (neighbors.nz && localZ < -halfSize + blendDist) {
                const t = this._smoothstep(((-halfSize + blendDist) - localZ) / blendDist);
                const nh = this._fractalHeight(wx, wz, this.getNoisePreset(neighbors.nz));
                height = this._lerp(height, nh, t);
            }
            
            positions[i + 1] = height;
        }
        
        ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        ground.createNormals(true);
        
        // Material
        const material = new BABYLON.StandardMaterial(`terrainMat_${key}`, this.scene);
        const presetColor = this._getPresetColor(preset);
        material.diffuseColor = new BABYLON.Color3(presetColor.r, presetColor.g, presetColor.b);
        material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        material.zOffset = -(cx * 3 + cz * 7) % 5;  // Prevent Z-fighting at edges
        ground.material = material;
        ground.receiveShadow = true;
        
        // Metadata for raycasting and queries
        ground.metadata = {
            isTerrainChunk: true,
            cx, cz, preset,
            worldX, worldZ
        };
        
        // Physics
        const aggregate = new BABYLON.PhysicsAggregate(
            ground,
            BABYLON.PhysicsShapeType.MESH,
            { mass: 0, friction: 0.8 },
            this.scene
        );
        
        const chunk = { mesh: ground, aggregate, cx, cz, preset, key };
        this.chunks.set(key, chunk);
        this.allTerrainMeshes.push(ground);
        
        return chunk;
    }
    
    /**
     * Streaming mode: call this in your render loop to load/unload chunks
     * around the player's current position.
     * 
     * @param {BABYLON.Vector3} worldPos - Player position
     * @param {number} renderDistance - How many chunks out to load (default: 2)
     */
    updateChunksAroundPosition(worldPos, renderDistance = 2) {
        if (!this.isChunked) return;
        
        const pcx = Math.floor(worldPos.x / this.chunkSize);
        const pcz = Math.floor(worldPos.z / this.chunkSize);
        const activeKeys = new Set();
        
        for (let dx = -renderDistance; dx <= renderDistance; dx++) {
            for (let dz = -renderDistance; dz <= renderDistance; dz++) {
                const cx = pcx + dx;
                const cz = pcz + dz;
                const key = `${cx},${cz}`;
                activeKeys.add(key);
                
                if (!this.chunks.has(key)) {
                    const preset = this._getStreamingPreset(cx, cz);
                    this.chunkModes.set(key, preset);
                    this._generateChunkTile(cx, cz, preset, {});
                }
            }
        }
        
        // Unload far chunks
        for (const [key, chunk] of this.chunks) {
            if (!activeKeys.has(key)) {
                this._disposeChunk(key);
            }
        }
    }
    
    /**
     * Override this to control what preset streaming chunks get.
     * Default: distance-based (smooth near origin, hills mid, mountains far)
     */
    _getStreamingPreset(cx, cz) {
        const dist = Math.sqrt(cx * cx + cz * cz);
        if (dist < 2)  return 'smooth';
        if (dist < 4)  return 'hills';
        return 'mountains';
    }
    
    _disposeChunk(key) {
        const chunk = this.chunks.get(key);
        if (!chunk) return;
        
        const idx = this.allTerrainMeshes.indexOf(chunk.mesh);
        if (idx > -1) this.allTerrainMeshes.splice(idx, 1);
        
        if (chunk.aggregate) chunk.aggregate.dispose();
        chunk.mesh.dispose();
        this.chunks.delete(key);
        this.chunkModes.delete(key);
    }
    
    // ===================================
    // SKATEPARK FEATURES
    // ===================================
    
    createRamp(config) {
        const width = config.width || 5;
        const height = config.height || 2;
        const depth = config.depth || 8;
        const position = config.position || { x: 0, y: 0, z: 0 };
        
        const ramp = BABYLON.MeshBuilder.CreateBox(
            "ramp",
            { width, height, depth },
            this.scene
        );
        
        ramp.position = new BABYLON.Vector3(position.x, height / 2, position.z);
        ramp.rotation.z = config.angle || (Math.PI / 6);
        
        const mat = new BABYLON.StandardMaterial("rampMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        ramp.material = mat;
        
        const aggregate = new BABYLON.PhysicsAggregate(
            ramp,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 0, friction: 0.2 },
            this.scene
        );
        
        this.worldObjects.push({ mesh: ramp, aggregate, type: 'ramp' });
        return ramp;
    }
    
    createRail(config) {
        const length = config.length || 10;
        const height = config.height || 1;
        const position = config.position || { x: 0, y: 0, z: 0 };
        
        const rail = BABYLON.MeshBuilder.CreateCylinder(
            "rail",
            { height: length, diameter: 0.1, tessellation: 16 },
            this.scene
        );
        
        rail.position = new BABYLON.Vector3(position.x, height, position.z);
        rail.rotation.x = Math.PI / 2;
        
        const mat = new BABYLON.StandardMaterial("railMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.75);
        mat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        rail.material = mat;
        
        const aggregate = new BABYLON.PhysicsAggregate(
            rail,
            BABYLON.PhysicsShapeType.CYLINDER,
            { mass: 0, friction: 0.05 },
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
        
        const qp = BABYLON.MeshBuilder.CreateBox(
            "quarterpipe",
            { width, height, depth },
            this.scene
        );
        
        qp.position = new BABYLON.Vector3(position.x, height / 2, position.z);
        qp.rotation.z = Math.PI / 4;
        
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
        
        const bowl = BABYLON.MeshBuilder.CreateSphere(
            "bowl",
            { diameter: radius * 2, segments: 32 },
            this.scene
        );
        
        bowl.position = new BABYLON.Vector3(position.x, -depth, position.z);
        bowl.scaling.y = 0.5;
        
        const mat = new BABYLON.StandardMaterial("bowlMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0.45, 0.45, 0.45);
        mat.backFaceCulling = false;
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
            case 'brickwall':
                this.createBrickWall(config);
                return;
            default:
                mesh = this.createBox(config);
        }
        
        if (config.position) {
            mesh.position = new BABYLON.Vector3(
                config.position.x || 0,
                config.position.y || 0,
                config.position.z || 0
            );
        }
        
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
        
        this.worldObjects.push({ mesh, aggregate, type: config.type, config });
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
            { height: config.height || 2, diameter: config.diameter || 1 },
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
            { diameter: config.diameter || 1, segments: config.segments || 16 },
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
        
        const mat = new BABYLON.StandardMaterial("buildingMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.65);
        building.material = mat;
        
        building.receiveShadow = true;
        building.castShadow = true;
        return building;
    }
    
    /**
     * Create a brick wall with physics-enabled individual bricks
     */
    createBrickWall(config) {
        const brickWidth = config.brickWidth || 1.2;
        const brickHeight = config.brickHeight || 0.6;
        const brickDepth = config.brickDepth || 0.6;
        const rows = config.rows || 8;
        const columns = config.columns || 6;
        const position = config.position || { x: 0, y: 0, z: 0 };
        
        const brickColor = config.brickColor || { r: 0.6, g: 0.2, b: 0.2 };
        const brickMass = config.brickMass || 5;
        const restitution = config.restitution || 0.1;
        const friction = config.friction || 0.8;
        
        console.log(`   🧱 Creating brick wall: ${columns}x${rows} at [${position.x}, ${position.y}, ${position.z}]`);
        
        const bricks = [];
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                const brick = BABYLON.MeshBuilder.CreateBox(
                    `brick_${x}_${y}`,
                    { width: brickWidth, height: brickHeight, depth: brickDepth },
                    this.scene
                );
                
                const xOffset = (y % 2 === 0) ? 0 : brickWidth / 2;
                
                brick.position = new BABYLON.Vector3(
                    position.x + (x * brickWidth) + xOffset,
                    position.y + (y * brickHeight) + (brickHeight / 2),
                    position.z
                );
                
                const mat = new BABYLON.StandardMaterial(`brickMat_${x}_${y}`, this.scene);
                mat.diffuseColor = new BABYLON.Color3(brickColor.r, brickColor.g, brickColor.b);
                
                if (config.colorVariation !== false) {
                    mat.diffuseColor.r += (Math.random() - 0.5) * 0.1;
                    mat.diffuseColor.g += (Math.random() - 0.5) * 0.05;
                    mat.diffuseColor.b += (Math.random() - 0.5) * 0.05;
                }
                
                brick.material = mat;
                brick.receiveShadow = true;
                brick.castShadow = true;
                
                const aggregate = new BABYLON.PhysicsAggregate(
                    brick,
                    BABYLON.PhysicsShapeType.BOX,
                    { mass: brickMass, restitution: restitution, friction: friction },
                    this.scene
                );
                
                bricks.push({ mesh: brick, aggregate, type: 'brick' });
                this.worldObjects.push({ mesh: brick, aggregate, type: 'brick' });
            }
        }
        
        console.log(`   ✅ Brick wall created: ${bricks.length} bricks`);
        
        return {
            bricks: bricks,
            position: position,
            dimensions: {
                width: columns * brickWidth,
                height: rows * brickHeight,
                depth: brickDepth
            }
        };
    }
    
    // ===================================
    // PHYSICS HELPERS
    // ===================================
    
    addTerrainPhysics() {
        if (!this.terrainMesh) return;
        
        const shapeType = this.noiseConfig ? 
            BABYLON.PhysicsShapeType.MESH : 
            BABYLON.PhysicsShapeType.BOX;
        
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
            'building': BABYLON.PhysicsShapeType.BOX,
            'brickwall': BABYLON.PhysicsShapeType.BOX
        };
        return shapeMap[type] || BABYLON.PhysicsShapeType.BOX;
    }
    
    // ===================================
    // NOISE SYSTEM
    // ===================================
    
    /**
     * Original sin/cos height calculation (used by single-mesh modes)
     */
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
    
    /**
     * Fractal noise height calculation (used by chunked terrain)
     * Uses world coordinates — same input always gives same output,
     * which is what makes chunk edges seamless.
     */
    _fractalHeight(wx, wz, noiseConf) {
        let height = 0;
        
        // Layer 1: Large features
        height += Math.sin(wx * noiseConf.freq1) * noiseConf.amp1;
        height += Math.cos(wz * noiseConf.freq1) * noiseConf.amp1;
        
        // Layer 2: Medium features
        height += Math.sin(wx * noiseConf.freq2) * noiseConf.amp2;
        height += Math.cos(wz * noiseConf.freq2) * noiseConf.amp2;
        
        // Layer 3: Fine detail
        height += Math.sin(wx * noiseConf.freq3) * noiseConf.amp3;
        height += Math.cos(wz * noiseConf.freq3) * noiseConf.amp3;
        
        // Diagonal variation
        height += Math.sin((wx + wz) * noiseConf.freqDiag) * noiseConf.ampDiag;
        
        // Fractal octaves for extra detail (seeded hash)
        const octaveDetail = this._hashNoise(wx * 0.05, wz * 0.05) * (noiseConf.amp3 || 1);
        height += octaveDetail;
        
        return height;
    }
    
    /**
     * Simple seeded hash noise for extra terrain detail.
     * Deterministic: same (x,z) always returns the same value.
     */
    _hashNoise(x, z) {
        const xi = Math.floor(x);
        const zi = Math.floor(z);
        const xf = x - xi;
        const zf = z - zi;
        
        const hash = (a, b) => {
            let h = this._noiseSeed + a * 374761393 + b * 668265263;
            h = (h ^ (h >> 13)) * 1274126177;
            return (h ^ (h >> 16)) / 2147483648.0;
        };
        
        const n00 = hash(xi, zi);
        const n10 = hash(xi + 1, zi);
        const n01 = hash(xi, zi + 1);
        const n11 = hash(xi + 1, zi + 1);
        
        const u = xf * xf * (3 - 2 * xf);
        const v = zf * zf * (3 - 2 * zf);
        
        const nx0 = n00 * (1 - u) + n10 * u;
        const nx1 = n01 * (1 - u) + n11 * u;
        
        return nx0 * (1 - v) + nx1 * v;
    }
    
    getNoiseConfig(config) {
        if (config.noise) {
            if (config.noise.preset) {
                return this.getNoisePreset(config.noise.preset);
            } else {
                return config.noise;
            }
        }
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
            },
            'desert': {
                freq1: 0.006, freq2: 0.018, freq3: 0.05, freqDiag: 0.012,
                amp1: 6, amp2: 3, amp3: 1, ampDiag: 2
            },
            'swamp': {
                freq1: 0.012, freq2: 0.035, freq3: 0.09, freqDiag: 0.025,
                amp1: 2, amp2: 1, amp3: 0.5, ampDiag: 0.5
            },
            'valley': {
                freq1: 0.007, freq2: 0.02, freq3: 0.05, freqDiag: 0.012,
                amp1: 12, amp2: 5, amp3: 2, ampDiag: 3
            }
        };
        
        return presets[preset] || presets['smooth'];
    }
    
    /**
     * Color associated with each noise preset (used in chunked mode)
     */
    _getPresetColor(preset) {
        const colors = {
            flat:       { r: 0.30, g: 0.60, b: 0.30 },
            smooth:     { r: 0.34, g: 0.49, b: 0.27 },
            hills:      { r: 0.40, g: 0.50, b: 0.35 },
            mountains:  { r: 0.45, g: 0.40, b: 0.35 },
            rough:      { r: 0.40, g: 0.38, b: 0.32 },
            desert:     { r: 0.80, g: 0.70, b: 0.50 },
            swamp:      { r: 0.30, g: 0.40, b: 0.30 },
            valley:     { r: 0.45, g: 0.50, b: 0.40 }
        };
        return colors[preset] || colors.smooth;
    }
    
    // ===================================
    // MATH HELPERS
    // ===================================
    
    _smoothstep(t) {
        t = Math.max(0, Math.min(1, t));
        return t * t * (3 - 2 * t);
    }
    
    _lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // ===================================
    // MATERIAL HELPERS
    // ===================================
    
    applyTerrainMaterial(config) {
        if (!this.terrainMesh) return;
        
        const mat = new BABYLON.StandardMaterial("terrainMat", this.scene);
        
        const color = config.color || { r: 0.34, g: 0.49, b: 0.27 };
        mat.diffuseColor = new BABYLON.Color3(color.r, color.g, color.b);
        mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        mat.roughness = config.roughness || 0.9;
        
        this.terrainMesh.material = mat;
    }
    
    // ===================================
    // UTILITY METHODS
    // ===================================
    
    /**
     * Get height at X,Z position.
     * Works for both single-mesh and chunked terrain.
     */
    getHeightAt(x, z) {
        // Chunked mode: raycast against all chunk meshes
        if (this.isChunked && this.allTerrainMeshes.length > 0) {
            const ray = new BABYLON.Ray(
                new BABYLON.Vector3(x, 200, z),
                new BABYLON.Vector3(0, -1, 0),
                400
            );
            
            const hit = this.scene.pickWithRay(ray, (mesh) => {
                return mesh.metadata && mesh.metadata.isTerrainChunk;
            });
            
            if (hit && hit.hit) {
                return hit.pickedPoint.y;
            }
            
            // Fallback: calculate from nearest chunk's preset
            const cx = Math.floor(x / this.chunkSize + 0.5);
            const cz = Math.floor(z / this.chunkSize + 0.5);
            const preset = this.chunkModes.get(`${cx},${cz}`) || 'smooth';
            return this._fractalHeight(x, z, this.getNoisePreset(preset));
        }
        
        // Single-mesh: use original noise calculation
        if (this.noiseConfig) {
            return this.calculateHeight(x, z, this.noiseConfig);
        }
        
        return 0;
    }
    
    /**
     * Get the biome/preset name at a world position (chunked mode)
     */
    getBiomeAt(x, z) {
        if (!this.isChunked) {
            return this.noiseConfig ? 'procedural' : 'flat';
        }
        
        const cx = Math.floor(x / this.chunkSize + 0.5);
        const cz = Math.floor(z / this.chunkSize + 0.5);
        const key = `${cx},${cz}`;
        const chunk = this.chunks.get(key);
        
        return chunk ? chunk.preset : 'unknown';
    }
    
    /**
     * Get the chunk grid coordinates for a world position
     */
    getChunkAt(x, z) {
        return {
            cx: Math.floor(x / this.chunkSize + 0.5),
            cz: Math.floor(z / this.chunkSize + 0.5)
        };
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
        // Remove single-mesh terrain
        if (this.terrainMesh) {
            this.terrainMesh.dispose();
            this.terrainMesh = null;
        }
        
        if (this.terrainAggregate) {
            this.terrainAggregate.dispose();
            this.terrainAggregate = null;
        }
        
        // Remove chunked terrain
        for (const [key] of this.chunks) {
            this._disposeChunk(key);
        }
        this.chunks.clear();
        this.chunkModes.clear();
        this.allTerrainMeshes = [];
        this.isChunked = false;
        
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
