// ============================================
// ADVANCED BIOME & TRANSITION SYSTEM
// For South of South Records / Treaty Tech
// ============================================

/**
 * BIOME TRANSITION SYSTEM
 * 
 * Handles smooth transitions between different terrain types
 * Uses "segway chunks" that blend adjacent biomes
 */

class BiomeSystem {
    constructor() {
        this.biomes = {
            grass: {
                foliageTypes: [
                    { type: 'grass', weight: 0.6, scaleRange: [0.5, 1.0] },
                    { type: 'bush', weight: 0.3, scaleRange: [0.8, 1.2] },
                    { type: 'tree', weight: 0.1, scaleRange: [0.8, 1.4] }
                ],
                density: 25,
                groundColor: new BABYLON.Color3(0.3, 0.6, 0.3),
                height: 0
            },
            forest: {
                foliageTypes: [
                    { type: 'grass', weight: 0.2, scaleRange: [0.4, 0.8] },
                    { type: 'bush', weight: 0.3, scaleRange: [1.0, 1.5] },
                    { type: 'tree', weight: 0.5, scaleRange: [1.2, 2.0] }
                ],
                density: 35,
                groundColor: new BABYLON.Color3(0.2, 0.4, 0.2),
                height: 2
            },
            mountain: {
                foliageTypes: [
                    { type: 'grass', weight: 0.1, scaleRange: [0.3, 0.6] },
                    { type: 'bush', weight: 0.2, scaleRange: [0.6, 1.0] },
                    { type: 'tree', weight: 0.4, scaleRange: [0.8, 1.2] },
                    { type: 'rock', weight: 0.3, scaleRange: [1.0, 2.5] }
                ],
                density: 20,
                groundColor: new BABYLON.Color3(0.4, 0.4, 0.35),
                height: 20
            },
            desert: {
                foliageTypes: [
                    { type: 'cactus', weight: 0.7, scaleRange: [0.8, 1.6] },
                    { type: 'rock', weight: 0.3, scaleRange: [0.5, 1.2] }
                ],
                density: 8,
                groundColor: new BABYLON.Color3(0.7, 0.6, 0.4),
                height: 0
            }
        };
        
        // Define which biomes can transition to each other
        this.transitions = {
            'grass-forest': { smooth: true, width: 1 },
            'grass-mountain': { smooth: true, width: 2 },
            'forest-mountain': { smooth: true, width: 1 },
            'grass-desert': { smooth: true, width: 2 },
            'forest-desert': { smooth: false, width: 1 } // Sharp boundary
        };
    }
    
    /**
     * Determine biome for a chunk based on world position
     */
    getBiomeForChunk(chunkX, chunkZ) {
        const x = chunkX;
        const z = chunkZ;
        const distance = Math.sqrt(x * x + z * z);
        
        // Central area: grass
        if (distance < 3) return 'grass';
        
        // Ring of forest
        if (distance < 6) return 'forest';
        
        // Mountains in specific quadrants
        if (distance < 10 && (x > 5 || z > 5)) return 'mountain';
        
        // Desert in another quadrant
        if (x < -5 && z < -5) return 'desert';
        
        // Default to grass
        return 'grass';
    }
    
    /**
     * Check if chunk is a transition zone
     * Returns: null | { from: 'biome1', to: 'biome2', ratio: 0.0-1.0 }
     */
    getTransitionInfo(chunkX, chunkZ) {
        const currentBiome = this.getBiomeForChunk(chunkX, chunkZ);
        
        // Check neighbors
        const neighbors = [
            { x: chunkX + 1, z: chunkZ, dir: 'east' },
            { x: chunkX - 1, z: chunkZ, dir: 'west' },
            { x: chunkX, z: chunkZ + 1, dir: 'north' },
            { x: chunkX, z: chunkZ - 1, dir: 'south' }
        ];
        
        for (const neighbor of neighbors) {
            const neighborBiome = this.getBiomeForChunk(neighbor.x, neighbor.z);
            
            if (neighborBiome !== currentBiome) {
                // Found a transition!
                const transitionKey = [currentBiome, neighborBiome].sort().join('-');
                const transitionData = this.transitions[transitionKey];
                
                if (transitionData && transitionData.smooth) {
                    return {
                        from: currentBiome,
                        to: neighborBiome,
                        ratio: 0.5, // Could be calculated based on position within chunk
                        direction: neighbor.dir
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * Generate foliage for a transition chunk
     */
    generateTransitionFoliage(chunkX, chunkZ, transitionInfo) {
        const fromBiome = this.biomes[transitionInfo.from];
        const toBiome = this.biomes[transitionInfo.to];
        const ratio = transitionInfo.ratio;
        
        // Blend density
        const density = Math.round(
            fromBiome.density * (1 - ratio) + toBiome.density * ratio
        );
        
        const foliageData = [];
        
        for (let i = 0; i < density; i++) {
            // Position within chunk
            const localX = Math.random();
            const localZ = Math.random();
            
            // Determine which biome to use based on position
            let sourceBiome;
            if (transitionInfo.direction === 'east' || transitionInfo.direction === 'west') {
                // Transition along X axis
                sourceBiome = localX < ratio ? toBiome : fromBiome;
            } else {
                // Transition along Z axis
                sourceBiome = localZ < ratio ? toBiome : fromBiome;
            }
            
            // Select foliage type from source biome
            const foliageType = this.selectFoliageType(sourceBiome.foliageTypes);
            
            foliageData.push({
                type: foliageType.type,
                localX: localX,
                localZ: localZ,
                scale: this.randomInRange(foliageType.scaleRange),
                rotation: Math.random() * Math.PI * 2
            });
        }
        
        return foliageData;
    }
    
    /**
     * Generate foliage for a normal (non-transition) chunk
     */
    generateBiomeFoliage(chunkX, chunkZ) {
        const biomeType = this.getBiomeForChunk(chunkX, chunkZ);
        const biome = this.biomes[biomeType];
        
        const foliageData = [];
        
        for (let i = 0; i < biome.density; i++) {
            const foliageType = this.selectFoliageType(biome.foliageTypes);
            
            foliageData.push({
                type: foliageType.type,
                localX: Math.random(),
                localZ: Math.random(),
                scale: this.randomInRange(foliageType.scaleRange),
                rotation: Math.random() * Math.PI * 2
            });
        }
        
        return foliageData;
    }
    
    /**
     * Weighted random selection of foliage type
     */
    selectFoliageType(types) {
        const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const type of types) {
            random -= type.weight;
            if (random <= 0) return type;
        }
        
        return types[0]; // Fallback
    }
    
    randomInRange([min, max]) {
        return min + Math.random() * (max - min);
    }
    
    /**
     * Get terrain height for a position (for varying chunk heights)
     */
    getTerrainHeight(chunkX, chunkZ, localX, localZ) {
        const biomeType = this.getBiomeForChunk(chunkX, chunkZ);
        const biome = this.biomes[biomeType];
        
        // Add noise for variation
        const noise = Math.sin(chunkX * 0.1 + localX) * Math.cos(chunkZ * 0.1 + localZ);
        const variation = noise * 2;
        
        return biome.height + variation;
    }
}

// ============================================
// INTEGRATION EXAMPLE
// ============================================

/**
 * Enhanced ChunkManager with biome system
 */
class EnhancedChunkManager extends ChunkManager {
    constructor(scene, physicsPlugin) {
        super(scene, physicsPlugin);
        this.biomeSystem = new BiomeSystem();
    }
    
    generateChunk(chunkX, chunkZ) {
        const key = this.getChunkKey(chunkX, chunkZ);
        
        if (this.chunks.has(key)) {
            return this.chunks.get(key);
        }
        
        // Check if this is a transition chunk
        const transitionInfo = this.biomeSystem.getTransitionInfo(chunkX, chunkZ);
        
        let foliageData;
        if (transitionInfo) {
            console.log(`🌍 Generating transition chunk ${key}: ${transitionInfo.from} → ${transitionInfo.to}`);
            foliageData = this.biomeSystem.generateTransitionFoliage(chunkX, chunkZ, transitionInfo);
        } else {
            const biomeType = this.biomeSystem.getBiomeForChunk(chunkX, chunkZ);
            console.log(`🌍 Generating ${biomeType} chunk ${key}`);
            foliageData = this.biomeSystem.generateBiomeFoliage(chunkX, chunkZ);
        }
        
        const chunk = {
            x: chunkX,
            z: chunkZ,
            key: key,
            foliage: [],
            physicsActive: false,
            biome: transitionInfo ? 'transition' : this.biomeSystem.getBiomeForChunk(chunkX, chunkZ)
        };
        
        // Create instances from foliage data
        const offsetX = chunkX * CONFIG.chunkSize;
        const offsetZ = chunkZ * CONFIG.chunkSize;
        
        foliageData.forEach((data, i) => {
            const x = offsetX + data.localX * CONFIG.chunkSize;
            const z = offsetZ + data.localZ * CONFIG.chunkSize;
            
            // Get terrain height at this position
            const y = this.biomeSystem.getTerrainHeight(chunkX, chunkZ, data.localX, data.localZ);
            
            // Create instance (check if template exists)
            if (!this.templates[data.type]) {
                console.warn(`Missing template for ${data.type}`);
                return;
            }
            
            const instance = this.templates[data.type].createInstance(`${data.type}_${key}_${i}`);
            instance.position = new BABYLON.Vector3(x, y + data.scale * 0.5, z);
            instance.scaling = new BABYLON.Vector3(data.scale, data.scale, data.scale);
            instance.rotation.y = data.rotation;
            
            // Determine mass based on type
            let mass;
            switch(data.type) {
                case 'grass': mass = 0.1; break;
                case 'bush': mass = 5; break;
                case 'tree': mass = 50; break;
                case 'rock': mass = 100; break;
                case 'cactus': mass = 20; break;
                default: mass = 1;
            }
            
            instance.metadata = {
                chunkKey: key,
                type: data.type,
                mass: mass,
                scale: data.scale,
                destroyed: false,
                hasPhysics: false
            };
            
            chunk.foliage.push(instance);
            this.foliageInstances.push(instance);
        });
        
        this.chunks.set(key, chunk);
        return chunk;
    }
}

// ============================================
// PROCEDURAL NOISE FOR TERRAIN
// ============================================

/**
 * Simple Perlin-like noise for terrain variation
 */
class NoiseGenerator {
    constructor(seed = 12345) {
        this.seed = seed;
    }
    
    // Simple hash function
    hash(x, y) {
        let h = this.seed + x * 374761393 + y * 668265263;
        h = (h ^ (h >> 13)) * 1274126177;
        return (h ^ (h >> 16)) / 2147483648.0;
    }
    
    // Smooth interpolation
    smoothstep(t) {
        return t * t * (3 - 2 * t);
    }
    
    // 2D noise
    noise(x, y) {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const xf = x - xi;
        const yf = y - yi;
        
        const n00 = this.hash(xi, yi);
        const n10 = this.hash(xi + 1, yi);
        const n01 = this.hash(xi, yi + 1);
        const n11 = this.hash(xi + 1, yi + 1);
        
        const nx0 = n00 * (1 - xf) + n10 * xf;
        const nx1 = n01 * (1 - xf) + n11 * xf;
        
        return nx0 * (1 - yf) + nx1 * yf;
    }
    
    // Fractal noise (multiple octaves)
    fractal(x, y, octaves = 4) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            value += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        
        return value / maxValue;
    }
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Replace ChunkManager with EnhancedChunkManager in your init():

const chunkManager = new EnhancedChunkManager(scene, plugin);

// Add rock and cactus templates to createFoliageTemplates():

createFoliageTemplates() {
    const templates = {};
    
    // ... existing grass, bush, tree code ...
    
    // Rock
    const rock = BABYLON.MeshBuilder.CreateSphere("rockTemplate", {
        diameter: 2,
        segments: 6
    }, this.scene);
    rock.position.y = -1000;
    rock.scaling = new BABYLON.Vector3(1.2, 0.8, 1.0);
    const rockMat = new BABYLON.StandardMaterial("rockMat", this.scene);
    rockMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    rock.material = rockMat;
    templates.rock = rock;
    
    // Cactus
    const cactus = BABYLON.MeshBuilder.CreateCylinder("cactusTemplate", {
        height: 3,
        diameterTop: 0.4,
        diameterBottom: 0.5,
        tessellation: 8
    }, this.scene);
    cactus.position.y = -1000;
    const cactusMat = new BABYLON.StandardMaterial("cactusMat", this.scene);
    cactusMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2);
    cactus.material = cactusMat;
    templates.cactus = cactus;
    
    return templates;
}

// For heightmap-based terrain:

const noise = new NoiseGenerator(42);

function getTerrainHeight(x, z) {
    return noise.fractal(x * 0.05, z * 0.05, 4) * 20; // Scale factor 20
}

// Apply to ground mesh:
const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
    "ground",
    "heightmap.png", // Or generate procedurally
    {
        width: 1000,
        height: 1000,
        subdivisions: 250,
        minHeight: 0,
        maxHeight: 50
    },
    scene
);
*/

// ============================================
// ADVANCED: DYNAMIC BIOME BLENDING
// ============================================

/**
 * Shader-based biome blending for ground textures
 */
const createBlendedGroundMaterial = (scene) => {
    const material = new BABYLON.StandardMaterial("blendedGround", scene);
    
    // Create textures for each biome
    const grassTexture = new BABYLON.GrassProceduralTexture("grass", 512, scene);
    const sandTexture = new BABYLON.Texture("sand.jpg", scene); // Replace with actual texture
    const rockTexture = new BABYLON.Texture("rock.jpg", scene);
    
    // You would need a custom shader material for true blending
    // For now, use the dominant biome texture
    
    material.diffuseTexture = grassTexture;
    
    return material;
};

// Export for use in main system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BiomeSystem,
        EnhancedChunkManager,
        NoiseGenerator
    };
}
