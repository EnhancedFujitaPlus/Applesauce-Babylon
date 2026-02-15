/**
 * APPLESAUCE Materials v2.0
 * THREE.js materials with texture support
 */

import * as THREE from 'three';

export class ApplesauceMaterials {
    constructor(core) {
        this.core = core;
        this.textureLoader = new THREE.TextureLoader();
        this.loadedTextures = {};
        
        // Initialize materials (will be filled with either textured or basic materials)
        this.materials = {};
        
        // Create basic materials first
        this.createBasicMaterials();
        
        console.log('🎨 Materials loaded - ' + Object.keys(this.materials).length + ' materials available');
    }
    
    /**
     * Load a texture and cache it
     */
    loadTexture(path, options = {}) {
        // Return cached texture if already loaded
        if (this.loadedTextures[path]) {
            return this.loadedTextures[path];
        }
        
        const texture = this.textureLoader.load(
            path,
            (tex) => {
                console.log('✅ Texture loaded:', path);
            },
            undefined,
            (err) => {
                console.warn('⚠️ Texture load failed:', path);
            }
        );
        
        // Apply texture options
        if (options.repeat) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1);
        }
        
        if (options.offset) {
            texture.offset.set(options.offset.x || 0, options.offset.y || 0);
        }
        
        // Cache it
        this.loadedTextures[path] = texture;
        
        return texture;
    }
    
    /**
     * Create a material from texture paths
     */
    createTexturedMaterial(name, texturePaths, materialOptions = {}) {
        const matConfig = {
            roughness: materialOptions.roughness || 0.8,
            metalness: materialOptions.metalness || 0.0,
            ...materialOptions
        };
        
        // Load main texture (color map)
        if (texturePaths.color || texturePaths.map) {
            matConfig.map = this.loadTexture(
                texturePaths.color || texturePaths.map,
                texturePaths.colorOptions || {}
            );
        }
        
        // Load normal map
        if (texturePaths.normal) {
            matConfig.normalMap = this.loadTexture(
                texturePaths.normal,
                texturePaths.normalOptions || {}
            );
        }
        
        // Load roughness map
        if (texturePaths.roughness) {
            matConfig.roughnessMap = this.loadTexture(
                texturePaths.roughness,
                texturePaths.roughnessOptions || {}
            );
        }
        
        // Load metalness map
        if (texturePaths.metalness) {
            matConfig.metalnessMap = this.loadTexture(
                texturePaths.metalness,
                texturePaths.metalnessOptions || {}
            );
        }
        
        // Load AO (ambient occlusion) map
        if (texturePaths.ao) {
            matConfig.aoMap = this.loadTexture(
                texturePaths.ao,
                texturePaths.aoOptions || {}
            );
        }
        
        // Load displacement/height map
        if (texturePaths.displacement) {
            matConfig.displacementMap = this.loadTexture(
                texturePaths.displacement,
                texturePaths.displacementOptions || {}
            );
            matConfig.displacementScale = materialOptions.displacementScale || 0.1;
        }
        
        const material = new THREE.MeshStandardMaterial(matConfig);
        this.materials[name] = material;
        
        console.log(`🎨 Created textured material: ${name}`);
        return material;
    }
    
    /**
     * Create all basic materials (fallback if no textures)
     */
    createBasicMaterials() {
        this.materials = {
            // Terrain & Ground
            concrete: new THREE.MeshStandardMaterial({ 
                color: 0x808080,
                roughness: 0.8,
                metalness: 0.2
            }),
            grass: new THREE.MeshStandardMaterial({ 
                color: 0x2d5a2d,
                roughness: 0.9,
                metalness: 0.0
            }),
            dirt: new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                roughness: 1.0,
                metalness: 0.0
            }),
            asphalt: new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 0.95,
                metalness: 0.0
            }),
            
            // Skatepark Materials
            metal: new THREE.MeshStandardMaterial({ 
                color: 0x888888, 
                metalness: 0.9,
                roughness: 0.2 
            }),
            metalRusty: new THREE.MeshStandardMaterial({
                color: 0x654321,
                metalness: 0.6,
                roughness: 0.8
            }),
            wood: new THREE.MeshStandardMaterial({ 
                color: 0x8B4513,
                roughness: 0.7,
                metalness: 0.0
            }),
            woodWeathered: new THREE.MeshStandardMaterial({
                color: 0x6B4423,
                roughness: 0.9,
                metalness: 0.0
            }),
            
            // Special Effects
            ice: new THREE.MeshStandardMaterial({
                color: 0xAADDFF,
                roughness: 0.1,
                metalness: 0.3,
                transparent: true,
                opacity: 0.8
            }),
            lava: new THREE.MeshStandardMaterial({
                color: 0xFF4400,
                emissive: 0xFF2200,
                emissiveIntensity: 0.5,
                roughness: 0.5
            }),
            
            // Gore Materials
            blood: new THREE.MeshStandardMaterial({
                color: 0x8B0000,
                roughness: 0.8,
                metalness: 0.1
            }),
            flesh: new THREE.MeshStandardMaterial({
                color: 0xFFCCCC,
                roughness: 0.9,
                metalness: 0.0
            }),
            
            // Collectibles
            coin: new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                metalness: 1.0,
                roughness: 0.2,
                emissive: 0xFFD700,
                emissiveIntensity: 0.3
            }),
            gem: new THREE.MeshStandardMaterial({
                color: 0x00FFFF,
                metalness: 0.8,
                roughness: 0.0,
                transparent: true,
                opacity: 0.9
            }),
            
            // Enemy Materials
            enemyBasic: new THREE.MeshStandardMaterial({
                color: 0xFF1493,
                roughness: 0.7,
                metalness: 0.0
            }),
            enemyArmored: new THREE.MeshStandardMaterial({
                color: 0x444444,
                metalness: 0.8,
                roughness: 0.3
            }),
            
            // Wild West Materials
            sandstone: new THREE.MeshStandardMaterial({
                color: 0xC2B280,
                roughness: 0.95,
                metalness: 0.0
            }),
            dustyWood: new THREE.MeshStandardMaterial({
                color: 0x8B7355,
                roughness: 0.9,
                metalness: 0.0
            }),
            rustyIron: new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                metalness: 0.6,
                roughness: 0.9
            }),
            desert: new THREE.MeshStandardMaterial({
                color: 0xD2B48C,
                roughness: 1.0,
                metalness: 0.0
            }),
            trainSmoke: new THREE.MeshStandardMaterial({
                color: 0x555555,
                transparent: true,
                opacity: 0.6,
                roughness: 1.0
            })
        };
        
        // Graffiti color palette
        this.graffitiColors = [
            0xFF1493, // Hot pink
            0x00FF00, // Lime
            0xFFD700, // Gold
            0xFF4500, // Orange-red
            0x00FFFF, // Cyan
            0xFF00FF, // Magenta
            0xFFFF00  // Yellow
        ];
        
        // Speed-based materials
        this.speedMaterials = {
            slow: new THREE.MeshStandardMaterial({
                color: 0x00FF00,
                emissive: 0x00FF00,
                emissiveIntensity: 0.2
            }),
            medium: new THREE.MeshStandardMaterial({
                color: 0xFFFF00,
                emissive: 0xFFFF00,
                emissiveIntensity: 0.3
            }),
            fast: new THREE.MeshStandardMaterial({
                color: 0xFF0000,
                emissive: 0xFF0000,
                emissiveIntensity: 0.5
            })
        };
    }
    
    /**
     * Load a texture pack - batch load related textures for a material
     */
    loadTexturePack(packName, basePath, materialOptions = {}) {
        const texturePaths = {
            color: `${basePath}/color.jpg`,
            normal: `${basePath}/normal.jpg`,
            roughness: `${basePath}/roughness.jpg`,
            ao: `${basePath}/ao.jpg`
        };
        
        // Add repeat tiling for terrain materials
        if (materialOptions.tiling) {
            const repeat = { x: materialOptions.tiling, y: materialOptions.tiling };
            texturePaths.colorOptions = { repeat };
            texturePaths.normalOptions = { repeat };
            texturePaths.roughnessOptions = { repeat };
            texturePaths.aoOptions = { repeat };
        }
        
        return this.createTexturedMaterial(packName, texturePaths, materialOptions);
    }
    
    // Helper method to get material by name
    getMaterial(name) {
        if (!this.materials[name]) {
            console.warn(`⚠️ Material "${name}" not found, using concrete as fallback`);
            return this.materials.concrete;
        }
        return this.materials[name];
    }
    
    // Get random graffiti color
    getRandomGraffitiColor() {
        return this.graffitiColors[Math.floor(Math.random() * this.graffitiColors.length)];
    }
    
    // Get speed-appropriate material
    getSpeedMaterial(speed) {
        const absSpeed = Math.abs(speed);
        if (absSpeed > 0.8) return this.speedMaterials.fast;
        if (absSpeed > 0.4) return this.speedMaterials.medium;
        return this.speedMaterials.slow;
    }
    
    // List all available materials
    listMaterials() {
        console.log('📋 Available materials:', Object.keys(this.materials));
        return Object.keys(this.materials);
    }
}

/**
 * Helper function to create procedural textures (no image files needed!)
 */
export class ProceduralTextures {
    static createNoiseTexture(width = 256, height = 256, scale = 0.1) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const value = Math.random() * 255;
            imageData.data[i] = value;
            imageData.data[i + 1] = value;
            imageData.data[i + 2] = value;
            imageData.data[i + 3] = 255;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        return texture;
    }
    
    static createGridTexture(width = 256, height = 256, gridSize = 16, color1 = '#ffffff', color2 = '#cccccc') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        for (let y = 0; y < height; y += gridSize) {
            for (let x = 0; x < width; x += gridSize) {
                ctx.fillStyle = ((x / gridSize + y / gridSize) % 2 === 0) ? color1 : color2;
                ctx.fillRect(x, y, gridSize, gridSize);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        return texture;
    }
    
    static createGraffitiTexture(width = 512, height = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Random graffiti splatters
        const colors = ['#FF1493', '#00FF00', '#FFD700', '#00FFFF'];
        
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.globalAlpha = Math.random() * 0.5 + 0.3;
            
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 50 + 10;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
}
