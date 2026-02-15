/**
 * APPLESAUCE Terrain Module r182 - ORGANIC FLOW EDITION
 * Supports both chunk-based and procedural noise terrain
 * ES Module version
 */

import * as THREE from '../three.module.js';

export class ApplesauceTerrain {
    constructor(engine) {
        this.engine = engine;
        this.chunks = [];
        this.heightMap = new Map();
        this.chunkSize = 100;
        this.terrainMesh = null;
        this.mode = 'segments'; // 'segments' or 'procedural'
        
        console.log('🏔️ Terrain module loaded (Organic Flow Edition)');
    }
    
    // ===================================
    // TERRAIN GENERATION - DISPATCHER
    // ===================================
    generate(config) {
        console.log('🏔️ Generating terrain...');
        
        // Clear existing terrain
        this.clear();
        
        // Determine mode
        if (config.mode === 'procedural' || config.procedural) {
            this.mode = 'procedural';
            this.generateProcedural(config);
        } else {
            this.mode = 'segments';
            this.generateSegmented(config);
        }
        
        console.log(`✅ Terrain generated in ${this.mode} mode`);
    }
    
    // ===================================
    // PROCEDURAL TERRAIN (ORGANIC FLOW)
    // ===================================
    generateProcedural(config) {
        const size = config.size || 1000;
        const resolution = config.resolution || 100;
        const noiseConfig = config.noise || this.getDefaultNoiseConfig();
        
        console.log(`🌊 Creating procedural terrain: ${size}x${size}, ${resolution} segments`);
        
        // Create high-resolution plane
        const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);
        const positions = geometry.attributes.position;
        
        // Apply layered noise to vertices
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i); // PlaneGeometry uses Y for depth
            
            const height = this.calculateProceduralHeight(x, z, noiseConfig);
            positions.setZ(i, height);
        }
        
        geometry.computeVertexNormals();
        
        // Create material
        const material = new THREE.MeshStandardMaterial({
            color: config.color || 0x567D46,
            roughness: config.roughness || 0.9,
            metalness: config.metalness || 0.0,
            flatShading: config.flatShading || false
        });
        
        // Create mesh
        this.terrainMesh = new THREE.Mesh(geometry, material);
        this.terrainMesh.rotation.x = -Math.PI / 2;
        this.terrainMesh.receiveShadow = true;
        this.terrainMesh.castShadow = config.castShadow || false;
        
        this.engine.scene.add(this.terrainMesh);
        
        // Store noise config for height lookups
        this.noiseConfig = noiseConfig;
        
        console.log('✅ Procedural terrain created');
    }
    
    /**
     * Calculate height using layered sine/cosine waves
     * This creates organic, flowing terrain like the forest level
     */
    calculateProceduralHeight(x, z, config) {
        let height = 0;
        
        // Layer 1: Large rolling hills (lowest frequency)
        height += Math.sin(x * config.freq1) * config.amp1;
        height += Math.cos(z * config.freq1) * config.amp1;
        
        // Layer 2: Medium variations
        height += Math.sin(x * config.freq2) * config.amp2;
        height += Math.cos(z * config.freq2) * config.amp2;
        
        // Layer 3: Small bumps and details
        height += Math.sin(x * config.freq3) * config.amp3;
        height += Math.cos(z * config.freq3) * config.amp3;
        
        // Layer 4: Diagonal patterns (creates organic flow)
        height += Math.sin((x + z) * config.freqDiag1) * config.ampDiag1;
        height += Math.cos((x - z) * config.freqDiag2) * config.ampDiag2;
        
        // Optional: Add base height offset
        height += config.baseHeight || 0;
        
        return height;
    }
    
    getDefaultNoiseConfig() {
        return {
            // Large rolling hills
            freq1: 0.03,
            amp1: 4,
            
            // Medium variations
            freq2: 0.08,
            amp2: 2,
            
            // Small details
            freq3: 0.15,
            amp3: 0.8,
            
            // Diagonal patterns
            freqDiag1: 0.05,
            ampDiag1: 3,
            freqDiag2: 0.05,
            ampDiag2: 2,
            
            // Base height
            baseHeight: 0
        };
    }
    
    /**
     * Get preset noise configurations for different terrain styles
     */
    getNoisePreset(preset) {
        const presets = {
            gentle: {
                freq1: 0.02, amp1: 3,
                freq2: 0.06, amp2: 1.5,
                freq3: 0.12, amp3: 0.5,
                freqDiag1: 0.04, ampDiag1: 2,
                freqDiag2: 0.04, ampDiag2: 1.5,
                baseHeight: 0
            },
            
            rolling: {
                freq1: 0.03, amp1: 6,
                freq2: 0.08, amp2: 3,
                freq3: 0.15, amp3: 1,
                freqDiag1: 0.05, ampDiag1: 4,
                freqDiag2: 0.05, ampDiag2: 3,
                baseHeight: 0
            },
            
            mountainous: {
                freq1: 0.025, amp1: 12,
                freq2: 0.07, amp2: 6,
                freq3: 0.14, amp3: 2,
                freqDiag1: 0.045, ampDiag1: 8,
                freqDiag2: 0.045, ampDiag2: 6,
                baseHeight: 5
            },
            
            rough: {
                freq1: 0.04, amp1: 5,
                freq2: 0.10, amp2: 4,
                freq3: 0.20, amp3: 2,
                freqDiag1: 0.06, ampDiag1: 4,
                freqDiag2: 0.06, ampDiag2: 3,
                baseHeight: 0
            },
            
            flat_bumpy: {
                freq1: 0.02, amp1: 1,
                freq2: 0.08, amp2: 1,
                freq3: 0.15, amp3: 0.5,
                freqDiag1: 0.04, ampDiag1: 0.8,
                freqDiag2: 0.04, ampDiag2: 0.6,
                baseHeight: 0
            }
        };
        
        return presets[preset] || this.getDefaultNoiseConfig();
    }
    
    // ===================================
    // SEGMENTED TERRAIN (CHUNK-BASED)
    // ===================================
    generateSegmented(config) {
        const segments = config.segments || this.createDefaultSegments(config);
        
        let currentZ = 0;
        
        segments.forEach((segment, index) => {
            const chunk = this.createChunk(segment, currentZ, index);
            this.chunks.push(chunk);
            currentZ += segment.length || this.chunkSize;
        });
        
        console.log(`✅ Generated ${this.chunks.length} terrain chunks`);
    }
    
    createDefaultSegments(config) {
        const totalLength = config.size || 500;
        const segments = [];
        
        if (config.hill) {
            segments.push({
                type: 'hill',
                length: 200,
                startHeight: config.hillHeight || 60,
                endHeight: 0,
                steepness: 'medium'
            });
            segments.push({
                type: 'flat',
                length: totalLength - 200,
                height: 0
            });
        } else {
            segments.push({
                type: 'flat',
                length: totalLength,
                height: 0
            });
        }
        
        return segments;
    }
    
    // ===================================
    // CHUNK CREATION (SEGMENTED MODE)
    // ===================================
    createChunk(segment, startZ, index) {
        const chunk = {
            type: segment.type,
            startZ: startZ,
            endZ: startZ + (segment.length || this.chunkSize),
            mesh: null,
            heightData: []
        };
        
        switch (segment.type) {
            case 'flat':
                chunk.mesh = this.createFlatChunk(segment, startZ);
                chunk.heightData = this.generateFlatHeightData(segment, startZ);
                break;
            case 'hill':
                chunk.mesh = this.createHillChunk(segment, startZ);
                chunk.heightData = this.generateHillHeightData(segment, startZ);
                break;
            case 'mountain':
                chunk.mesh = this.createMountainChunk(segment, startZ);
                chunk.heightData = this.generateMountainHeightData(segment, startZ);
                break;
            case 'valley':
                chunk.mesh = this.createValleyChunk(segment, startZ);
                chunk.heightData = this.generateValleyHeightData(segment, startZ);
                break;
            case 'organic':
                // NEW: Organic chunk with procedural noise
                chunk.mesh = this.createOrganicChunk(segment, startZ);
                chunk.heightData = this.generateOrganicHeightData(segment, startZ);
                break;
        }
        
        if (chunk.mesh) {
            this.engine.scene.add(chunk.mesh);
        }
        
        // Store height data in map
        chunk.heightData.forEach(point => {
            const key = `${Math.floor(point.x)},${Math.floor(point.z)}`;
            this.heightMap.set(key, point.y);
        });
        
        return chunk;
    }
    
    // ===================================
    // ORGANIC CHUNK (NEW!)
    // ===================================
    createOrganicChunk(segment, startZ) {
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const noiseConfig = segment.noise || this.getNoisePreset('rolling');
        
        const widthSegments = 64;
        const lengthSegments = 64;
        
        const geometry = new THREE.PlaneGeometry(
            width, 
            length, 
            widthSegments, 
            lengthSegments
        );
        
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i);
            
            // Calculate world Z position
            const worldZ = startZ + length / 2 + z;
            
            // Apply procedural height
            const height = this.calculateProceduralHeight(x, worldZ, noiseConfig);
            
            positions.setZ(i, height);
        }
        
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({ 
            color: segment.color || 0x2d5a2d,
            roughness: 0.9,
            flatShading: false
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, 0, startZ + length / 2);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return mesh;
    }
    
    generateOrganicHeightData(segment, startZ) {
        const data = [];
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const noiseConfig = segment.noise || this.getNoisePreset('rolling');
        const resolution = 2;
        
        for (let x = -width / 2; x <= width / 2; x += resolution) {
            for (let z = startZ; z <= startZ + length; z += resolution) {
                const height = this.calculateProceduralHeight(x, z, noiseConfig);
                data.push({ x, y: height, z });
            }
        }
        
        return data;
    }
    
    // ===================================
    // EXISTING CHUNK TYPES (PRESERVED)
    // ===================================
    createFlatChunk(segment, startZ) {
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const height = segment.height || 0;
        
        const geometry = new THREE.PlaneGeometry(width, length, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x2d5a2d,
            roughness: 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, height, startZ + length / 2);
        mesh.receiveShadow = true;
        
        return mesh;
    }
    
    generateFlatHeightData(segment, startZ) {
        const data = [];
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const height = segment.height || 0;
        const resolution = 5;
        
        for (let x = -width / 2; x <= width / 2; x += resolution) {
            for (let z = startZ; z <= startZ + length; z += resolution) {
                data.push({ x, y: height, z });
            }
        }
        
        return data;
    }
    
    createHillChunk(segment, startZ) {
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const startHeight = segment.startHeight || 60;
        const endHeight = segment.endHeight || 0;
        
        const widthSegments = 64;
        const lengthSegments = 64;
        
        const geometry = new THREE.PlaneGeometry(
            width, 
            length, 
            widthSegments, 
            lengthSegments
        );
        
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i);
            
            const normalizedZ = (z + length / 2) / length;
            const height = startHeight + (endHeight - startHeight) * normalizedZ;
            
            const widthFactor = 1 - Math.abs(x / (width / 2)) * 0.2;
            
            positions.setZ(i, height * widthFactor);
        }
        
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x2d5a2d,
            roughness: 0.9,
            flatShading: false
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, 0, startZ + length / 2);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return mesh;
    }
    
    generateHillHeightData(segment, startZ) {
        const data = [];
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const startHeight = segment.startHeight || 60;
        const endHeight = segment.endHeight || 0;
        const resolution = 2;
        
        for (let x = -width / 2; x <= width / 2; x += resolution) {
            for (let z = startZ; z <= startZ + length; z += resolution) {
                const normalizedZ = (z - startZ) / length;
                const height = startHeight + (endHeight - startHeight) * normalizedZ;
                const widthFactor = 1 - Math.abs(x / (width / 2)) * 0.2;
                const finalHeight = height * widthFactor;
                
                data.push({ x, y: finalHeight, z });
            }
        }
        
        return data;
    }
    
    createMountainChunk(segment, startZ) {
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const peakHeight = segment.peakHeight || 80;
        
        const widthSegments = 64;
        const lengthSegments = 64;
        
        const geometry = new THREE.PlaneGeometry(
            width, 
            length, 
            widthSegments, 
            lengthSegments
        );
        
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i);
            
            const normalizedZ = (z + length / 2) / length;
            const normalizedX = x / (width / 2);
            
            const centerDistance = Math.sqrt(
                Math.pow(normalizedX, 2) + 
                Math.pow(normalizedZ - 0.5, 2) * 4
            );
            
            const height = peakHeight * Math.max(0, 1 - centerDistance);
            
            positions.setZ(i, height);
        }
        
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x8B7355,
            roughness: 0.95
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, 0, startZ + length / 2);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return mesh;
    }
    
    generateMountainHeightData(segment, startZ) {
        const data = [];
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const peakHeight = segment.peakHeight || 80;
        const resolution = 2;
        
        for (let x = -width / 2; x <= width / 2; x += resolution) {
            for (let z = startZ; z <= startZ + length; z += resolution) {
                const normalizedZ = (z - startZ) / length;
                const normalizedX = x / (width / 2);
                
                const centerDistance = Math.sqrt(
                    Math.pow(normalizedX, 2) + 
                    Math.pow(normalizedZ - 0.5, 2) * 4
                );
                
                const height = peakHeight * Math.max(0, 1 - centerDistance);
                
                data.push({ x, y: height, z });
            }
        }
        
        return data;
    }
    
    createValleyChunk(segment, startZ) {
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const depth = segment.depth || -20;
        
        const widthSegments = 64;
        const lengthSegments = 64;
        
        const geometry = new THREE.PlaneGeometry(
            width, 
            length, 
            widthSegments, 
            lengthSegments
        );
        
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const normalizedX = Math.abs(x / (width / 2));
            
            const height = depth * (1 - normalizedX);
            
            positions.setZ(i, height);
        }
        
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x3d6b3d,
            roughness: 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, 0, startZ + length / 2);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return mesh;
    }
    
    generateValleyHeightData(segment, startZ) {
        const data = [];
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const depth = segment.depth || -20;
        const resolution = 2;
        
        for (let x = -width / 2; x <= width / 2; x += resolution) {
            for (let z = startZ; z <= startZ + length; z += resolution) {
                const normalizedX = Math.abs(x / (width / 2));
                const height = depth * (1 - normalizedX);
                
                data.push({ x, y: height, z });
            }
        }
        
        return data;
    }

        generateCanyonBasin(config) {
        console.log('🏔️ Generating canyon basin terrain...');
        
        const basin = config.basin || {};
        const ground = config.ground || {};
        const walls = config.walls || {};
        
        // ==========================================
        // 1. CREATE BASIN FLOOR
        // ==========================================
        const floorGeometry = new THREE.PlaneGeometry(
            basin.width || 400,
            basin.depth || 400,
            50,  // Width segments for detail
            50   // Depth segments for detail
        );
        
        // Create depression in center
        const centerDepth = basin.centerDepth || -15;
        const positions = floorGeometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i);  // Note: In PlaneGeometry, Y is the depth dimension
            
            // Calculate distance from center
            const distFromCenter = Math.sqrt(x * x + z * z);
            const maxDist = Math.sqrt((basin.width/2)**2 + (basin.depth/2)**2);
            
            // Create bowl shape - deeper in center, rising to edges
            const depthFactor = 1 - (distFromCenter / maxDist);
            const height = centerDepth * depthFactor;
            
            // Add some noise for natural variation
            const noise = (Math.random() - 0.5) * 2;
            
            positions.setZ(i, height + noise);
        }
        
        positions.needsUpdate = true;
        floorGeometry.computeVertexNormals();  // Recalculate normals for lighting
        
        // Material for forest floor
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: ground.color || 0x3d4f3a,
            roughness: ground.roughness || 0.9,
            metalness: 0.1
        });
        
        const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
        floorMesh.rotation.x = -Math.PI / 2;  // Rotate to be horizontal
        floorMesh.receiveShadow = true;
        floorMesh.name = 'basin_floor';
        
        this.game.scene.add(floorMesh);
        
        // ==========================================
        // 2. CREATE RIDGE WALLS
        // ==========================================
        const wallPositions = walls.positions || [];
        
        wallPositions.forEach((wall, index) => {
            const wallGroup = new THREE.Group();
            wallGroup.name = `ridge_wall_${index}`;
            
            // Create wall geometry
            const wallGeometry = new THREE.BoxGeometry(
                wall.width || 100,
                wall.height || 30,
                20  // Thickness
            );
            
            // Apply slope/steepness
            const steepness = basin.wallSteepness || 0.7;
            const wallPositions = wallGeometry.attributes.position;
            
            for (let i = 0; i < wallPositions.count; i++) {
                const y = wallPositions.getY(i);
                
                // Only modify top vertices
                if (y > 0) {
                    const x = wallPositions.getX(i);
                    // Slope inward based on steepness
                    const newX = x * (1 - steepness * 0.3);
                    wallPositions.setX(i, newX);
                }
            }
            
            wallPositions.needsUpdate = true;
            wallGeometry.computeVertexNormals();
            
            const wallMaterial = new THREE.MeshStandardMaterial({
                color: walls.color || 0x5a5045,
                roughness: walls.roughness || 0.8,
                metalness: 0.2
            });
            
            const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
            wallMesh.position.set(wall.x, wall.height / 2, wall.z);
            wallMesh.castShadow = true;
            wallMesh.receiveShadow = true;
            
            wallGroup.add(wallMesh);
            this.game.scene.add(wallGroup);
            
            // Add rocky texture variation
            this.addRockyDetails(wallMesh, wall.height);
        });
        
        // ==========================================
        // 3. ADD COVER ELEMENTS
        // ==========================================
        if (config.cover) {
            config.cover.forEach(coverItem => {
                switch(coverItem.type) {
                    case 'tree_line':
                        this.createTreeLine(coverItem);
                        break;
                    case 'boulder':
                        this.createBoulder(coverItem);
                        break;
                    case 'brush':
                        this.createBrush(coverItem);
                        break;
                }
            });
        }
        
        // ==========================================
        // 4. CREATE AMERICAN CAMP
        // ==========================================
        if (config.camp) {
            this.createMilitaryCamp(config.camp);
        }
        
        console.log('✅ Canyon basin terrain generated');
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    addRockyDetails(wallMesh, wallHeight) {
        // Add random rock protrusions for visual interest
        const rockCount = Math.floor(Math.random() * 5) + 3;
        
        for (let i = 0; i < rockCount; i++) {
            const rockGeometry = new THREE.DodecahedronGeometry(
                Math.random() * 3 + 1,  // Random size
                0  // Low detail for performance
            );
            
            const rockMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a4237,
                roughness: 0.95
            });
            
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.3) * wallHeight,
                (Math.random() - 0.5) * 15
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            
            wallMesh.parent.add(rock);
        }
    }

    createTreeLine(config) {
        const count = config.count || 20;
        const spread = config.spread || 200;
        
        for (let i = 0; i < count; i++) {
            const tree = this.createTree();
            
            // Position along a line with spread
            const linePos = (i / count - 0.5) * spread;
            const randomOffset = (Math.random() - 0.5) * 30;
            
            tree.position.set(
                config.x + randomOffset,
                0,
                config.z + linePos
            );
            
            this.game.scene.add(tree);
        }
    }

    createTree() {
        const tree = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 8, 6);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3728,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 4;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Foliage (simple cone for performance)
        const foliageGeometry = new THREE.ConeGeometry(3, 8, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5016,
            roughness: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 10;
        foliage.castShadow = true;
        tree.add(foliage);
        
        // Random rotation
        tree.rotation.y = Math.random() * Math.PI * 2;
        
        return tree;
    }

    createBoulder(config) {
        const scale = config.scale || 2;
        
        // Irregular rock shape
        const boulderGeometry = new THREE.DodecahedronGeometry(scale, 0);
        const boulderMaterial = new THREE.MeshStandardMaterial({
            color: 0x6b6459,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const boulder = new THREE.Mesh(boulderGeometry, boulderMaterial);
        boulder.position.set(config.x, scale * 0.5, config.z);
        boulder.rotation.set(
            Math.random() * 0.5,
            Math.random() * Math.PI * 2,
            Math.random() * 0.5
        );
        boulder.castShadow = true;
        boulder.receiveShadow = true;
        
        this.game.scene.add(boulder);
    }

    createBrush(config) {
        const density = config.density || 'medium';
        const count = density === 'high' ? 15 : density === 'medium' ? 10 : 5;
        
        const brushGroup = new THREE.Group();
        
        for (let i = 0; i < count; i++) {
            const brushGeometry = new THREE.SphereGeometry(
                Math.random() * 0.5 + 0.5,
                4,
                4
            );
            const brushMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a5c3a,
                roughness: 0.9
            });
            
            const brush = new THREE.Mesh(brushGeometry, brushMaterial);
            brush.position.set(
                (Math.random() - 0.5) * 10,
                0.5,
                (Math.random() - 0.5) * 10
            );
            brush.scale.y = Math.random() * 0.5 + 0.5;
            
            brushGroup.add(brush);
        }
        
        brushGroup.position.set(config.x, 0, config.z);
        this.game.scene.add(brushGroup);
    }

    createMilitaryCamp(config) {
        const campGroup = new THREE.Group();
        campGroup.name = 'american_camp';
        
        // Create tents in a rough circle
        const tents = config.tents || 20;
        const radius = config.radius || 40;
        
        for (let i = 0; i < tents; i++) {
            const angle = (i / tents) * Math.PI * 2;
            const dist = radius * (0.5 + Math.random() * 0.5);
            
            const tent = this.createTent();
            tent.position.set(
                Math.cos(angle) * dist,
                config.centerDepth || -13,  // On basin floor
                Math.sin(angle) * dist
            );
            tent.rotation.y = Math.random() * Math.PI * 2;
            
            campGroup.add(tent);
        }
        
        // Add campfires
        const fires = config.campfires || 5;
        for (let i = 0; i < fires; i++) {
            const fire = this.createCampfire();
            const angle = (i / fires) * Math.PI * 2;
            
            fire.position.set(
                Math.cos(angle) * radius * 0.3,
                config.centerDepth || -13,
                Math.sin(angle) * radius * 0.3
            );
            
            campGroup.add(fire);
        }
        
        // Add wagons
        const wagons = config.wagons || 8;
        for (let i = 0; i < wagons; i++) {
            const wagon = this.createWagon();
            const angle = (i / wagons) * Math.PI * 2;
            
            wagon.position.set(
                Math.cos(angle) * radius * 0.8,
                config.centerDepth || -13,
                Math.sin(angle) * radius * 0.8
            );
            wagon.rotation.y = angle;
            
            campGroup.add(wagon);
        }
        
        campGroup.position.set(config.x, 0, config.z);
        this.game.scene.add(campGroup);
    }

    createTent() {
        const tent = new THREE.Group();
        
        // Tent body (pyramid shape)
        const tentGeometry = new THREE.ConeGeometry(2, 3, 4);
        const tentMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,  // Canvas tan
            roughness: 0.8,
            side: THREE.DoubleSide
        });
        
        const tentMesh = new THREE.Mesh(tentGeometry, tentMaterial);
        tentMesh.position.y = 1.5;
        tentMesh.rotation.y = Math.PI / 4;
        tentMesh.castShadow = true;
        
        tent.add(tentMesh);
        
        return tent;
    }

    createCampfire() {
        const fire = new THREE.Group();
        
        // Stones in circle
        const stoneGeometry = new THREE.DodecahedronGeometry(0.3, 0);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.9
        });
        
        for (let i = 0; i < 8; i++) {
            const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
            const angle = (i / 8) * Math.PI * 2;
            stone.position.set(
                Math.cos(angle) * 0.8,
                0.15,
                Math.sin(angle) * 0.8
            );
            fire.add(stone);
        }
        
        // Fire light (point light)
        const fireLight = new THREE.PointLight(0xff6600, 2, 10);
        fireLight.position.y = 1;
        fireLight.castShadow = false;  // Performance
        fire.add(fireLight);
        
        // Optional: Add flickering animation in update loop
        fire.userData.fireLight = fireLight;
        fire.userData.isFireLight = true;
        
        return fire;
    }

    createWagon() {
        const wagon = new THREE.Group();
        
        // Wagon bed
        const bedGeometry = new THREE.BoxGeometry(3, 1, 2);
        const bedMaterial = new THREE.MeshStandardMaterial({
            color: 0x6b5d4f,
            roughness: 0.85
        });
        
        const bed = new THREE.Mesh(bedGeometry, bedMaterial);
        bed.position.y = 1;
        bed.castShadow = true;
        wagon.add(bed);
        
        // Wheels (simplified)
        const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d2f1f,
            roughness: 0.9
        });
        
        const positions = [
            [-1.2, 0.5, -1],
            [-1.2, 0.5, 1],
            [1.2, 0.5, -1],
            [1.2, 0.5, 1]
        ];
        
        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(...pos);
            wheel.rotation.z = Math.PI / 2;
            wagon.add(wheel);
        });
        
        return wagon;
    }
    
    // ===================================
    // HEIGHT LOOKUP - ENHANCED
    // ===================================
    getHeight(x, z) {
        // Use procedural mode if active
        if (this.mode === 'procedural' && this.noiseConfig) {
            return this.calculateProceduralHeight(x, z, this.noiseConfig);
        }
        
        // Otherwise use chunk-based lookup
        const key = `${Math.floor(x)},${Math.floor(z)}`;
        
        if (this.heightMap.has(key)) {
            return this.heightMap.get(key);
        }
        
        // Find nearest chunk and interpolate
        for (let chunk of this.chunks) {
            if (z >= chunk.startZ && z <= chunk.endZ) {
                let nearest = null;
                let minDist = Infinity;
                
                for (let point of chunk.heightData) {
                    const dist = Math.sqrt(
                        Math.pow(x - point.x, 2) + 
                        Math.pow(z - point.z, 2)
                    );
                    
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = point;
                    }
                }
                
                if (nearest) {
                    return nearest.y;
                }
            }
        }
        
        return 0;
    }
    
    /**
     * Multi-point height sampling for better player/board contact
     * Like the forest level - samples 5 points for realistic board tilt
     */
    getPlayerHeight(x, z, rotation, boardLength = 1.25, boardWidth = 0.4) {
        const forward = {
            x: Math.sin(rotation),
            z: Math.cos(rotation)
        };
        const right = {
            x: Math.cos(rotation),
            z: -Math.sin(rotation)
        };
        
        // Sample 5 points
        const hCenter = this.getHeight(x, z);
        const hFront = this.getHeight(
            x + forward.x * boardLength,
            z + forward.z * boardLength
        );
        const hBack = this.getHeight(
            x - forward.x * boardLength,
            z - forward.z * boardLength
        );
        const hLeft = this.getHeight(
            x - right.x * boardWidth,
            z - right.z * boardWidth
        );
        const hRight = this.getHeight(
            x + right.x * boardWidth,
            z + right.z * boardWidth
        );
        
        // Weighted average (center gets more weight)
        return (hCenter * 3 + hFront + hBack + hLeft + hRight) / 7;
    }
    
    // ===================================
    // CLEANUP
    // ===================================
    clear() {
        // Remove procedural terrain
        if (this.terrainMesh) {
            this.engine.scene.remove(this.terrainMesh);
            this.terrainMesh = null;
        }
        
        // Remove chunk-based terrain
        for (let chunk of this.chunks) {
            if (chunk.mesh) {
                this.engine.scene.remove(chunk.mesh);
            }
        }
        
        this.chunks = [];
        this.heightMap.clear();
        this.noiseConfig = null;
        
        console.log('🏔️ Terrain cleared');
    }
}
