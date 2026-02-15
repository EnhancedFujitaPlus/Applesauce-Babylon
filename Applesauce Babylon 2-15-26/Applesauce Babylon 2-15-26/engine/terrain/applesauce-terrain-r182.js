/**
 * APPLESAUCE Terrain Module for Three.js r182
 * Chunk-based procedural terrain generation
 * ES Module version
 */

import * as THREE from './three.module.js';

export class ApplesauceTerrain {
    constructor(engine) {
        this.engine = engine;
        this.chunks = [];
        this.heightMap = new Map(); // Store height data for quick lookup
        this.chunkSize = 100; // Size of each chunk
        
        console.log('🏔️ Terrain module loaded');
    }
    
    // ===================================
    // TERRAIN GENERATION
    // ===================================
    generate(config) {
        console.log('🏔️ Generating terrain...');
        
        // Clear existing terrain
        this.clear();
        
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
        // Create default terrain based on simple config
        const totalLength = config.size || 500;
        const segments = [];
        
        if (config.hill) {
            // Classic downhill setup
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
            // Flat terrain
            segments.push({
                type: 'flat',
                length: totalLength,
                height: 0
            });
        }
        
        return segments;
    }
    
    // ===================================
    // CHUNK CREATION
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
        }
        
        if (chunk.mesh) {
            this.engine.scene.add(chunk.mesh);
        }
        
        // Store height data in map for quick lookup
        chunk.heightData.forEach(point => {
            const key = `${Math.floor(point.x)},${Math.floor(point.z)}`;
            this.heightMap.set(key, point.y);
        });
        
        return chunk;
    }
    
    // ===================================
    // FLAT TERRAIN
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
        const resolution = 5; // Sample every 5 units
        
        for (let x = -width / 2; x <= width / 2; x += resolution) {
            for (let z = startZ; z <= startZ + length; z += resolution) {
                data.push({ x, y: height, z });
            }
        }
        
        return data;
    }
    
    // ===================================
    // HILL TERRAIN
    // ===================================
    createHillChunk(segment, startZ) {
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const startHeight = segment.startHeight || 60;
        const endHeight = segment.endHeight || 0;
        
        // Create geometry with proper height variation
        const widthSegments = 64;
        const lengthSegments = 64;
        
        const geometry = new THREE.PlaneGeometry(
            width, 
            length, 
            widthSegments, 
            lengthSegments
        );
        
        // Modify vertices to create slope
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            
            // Calculate height based on Z position (creates downhill slope)
            const normalizedZ = (z + length / 2) / length; // 0 to 1
            const height = startHeight + (endHeight - startHeight) * normalizedZ;
            
            // Add some width variation for natural look
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
        const resolution = 2; // Higher resolution for hills
        
        for (let x = -width / 2; x <= width / 2; x += resolution) {
            for (let z = startZ; z <= startZ + length; z += resolution) {
                const normalizedZ = (z - startZ) / length;
                const height = startHeight + (endHeight - startHeight) * normalizedZ;
                
                // Width variation
                const widthFactor = 1 - Math.abs(x / (width / 2)) * 0.2;
                const finalHeight = height * widthFactor;
                
                data.push({ x, y: finalHeight, z });
            }
        }
        
        return data;
    }
    
    // ===================================
    // MOUNTAIN TERRAIN
    // ===================================
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
            const z = positions.getZ(i);
            
            // Create mountain peak in center
            const normalizedZ = (z + length / 2) / length;
            const normalizedX = x / (width / 2);
            
            // Mountain shape: high in center, low at edges
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
    
    // ===================================
    // VALLEY TERRAIN
    // ===================================
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
            
            // Valley: low in center, high at edges
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
    
    // ===================================
    // HEIGHT LOOKUP
    // ===================================
    getHeight(x, z) {
        // Round to nearest sampled point
        const key = `${Math.floor(x)},${Math.floor(z)}`;
        
        if (this.heightMap.has(key)) {
            return this.heightMap.get(key);
        }
        
        // Fallback: find nearest chunk and interpolate
        for (let chunk of this.chunks) {
            if (z >= chunk.startZ && z <= chunk.endZ) {
                // Find nearest height data point
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
        
        // Default fallback
        return 0;
    }
    
    // ===================================
    // CLEANUP
    // ===================================
    clear() {
        for (let chunk of this.chunks) {
            if (chunk.mesh) {
                this.engine.scene.remove(chunk.mesh);
            }
        }
        
        this.chunks = [];
        this.heightMap.clear();
        
        console.log('🏔️ Terrain cleared');
    }
}
