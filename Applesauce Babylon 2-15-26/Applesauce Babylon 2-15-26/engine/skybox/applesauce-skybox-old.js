/**
 * APPLESAUCE Skybox System v1.0
 * Handles both image-based and procedural skyboxes
 */

import * as THREE from 'three';

export class ApplesauceSkybox {
    constructor(core) {
        this.core = core;
        this.scene = core.scene;
        this.currentSkybox = null;
        
        console.log('🌌 Skybox system initialized');
    }
    
    /**
     * Load a cubemap skybox from 6 images
     * @param {Object} paths - Object with px, nx, py, ny, pz, nz image paths
     */
    loadCubemap(paths) {
        const loader = new THREE.CubeTextureLoader();
        
        // Standard order: +X, -X, +Y, -Y, +Z, -Z
        const urls = [
            paths.px || paths.right,
            paths.nx || paths.left,
            paths.py || paths.top,
            paths.nz || paths.bottom,
            paths.pz || paths.front,
            paths.nz || paths.back
        ];
        
        const texture = loader.load(urls, 
            () => {
                console.log('✅ Skybox cubemap loaded');
            },
            undefined,
            (err) => {
                console.error('❌ Skybox load failed:', err);
                this.createFallbackSkybox();
            }
        );
        
        this.scene.background = texture;
        this.currentSkybox = texture;
        
        return texture;
    }
    
    /**
     * Load an equirectangular (360°) skybox
     * @param {string} imagePath - Path to equirectangular image
     */
    loadEquirectangular(imagePath) {
        const loader = new THREE.TextureLoader();
        
        loader.load(imagePath, (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.background = texture;
            this.currentSkybox = texture;
            console.log('✅ Equirectangular skybox loaded');
        }, undefined, (err) => {
            console.error('❌ Skybox load failed:', err);
            this.createFallbackSkybox();
        });
    }
    
    /**
     * Create a procedural gradient skybox (no images needed!)
     * @param {string} preset - 'sunset', 'night', 'day', 'cyberpunk', 'horror', or custom colors
     */
    createProceduralSkybox(preset = 'day') {
        const presets = {
            day: {
                topColor: 0x87CEEB,    // Sky blue
                bottomColor: 0xFFFFFF   // White horizon
            },
            sunset: {
                topColor: 0x1a0033,    // Deep purple
                bottomColor: 0xff6b35  // Orange
            },
            night: {
                topColor: 0x000011,    // Very dark blue
                bottomColor: 0x1a1a2e  // Dark gray
            },
            cyberpunk: {
                topColor: 0x0a0015,    // Dark purple
                bottomColor: 0xff00ff  // Hot pink
            },
            horror: {
                topColor: 0x1a0000,    // Dark red
                bottomColor: 0x000000  // Black
            },
            desert: {
                topColor: 0x87CEEB,    // Blue sky
                bottomColor: 0xD2B48C  // Sandy tan
            },
            toxic: {
                topColor: 0x001a00,    // Dark green
                bottomColor: 0x00ff00  // Toxic green
            }
        };
        
        const colors = typeof preset === 'string' ? presets[preset] : preset;
        
        if (!colors) {
            console.warn('⚠️ Unknown skybox preset, using day');
            return this.createProceduralSkybox('day');
        }
        
        // Create gradient using a sphere with custom shader
        const vertexShader = `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        
        const fragmentShader = `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            varying vec3 vWorldPosition;
            
            void main() {
                float h = normalize(vWorldPosition).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(h, 0.0)), 1.0);
            }
        `;
        
        const uniforms = {
            topColor: { value: new THREE.Color(colors.topColor) },
            bottomColor: { value: new THREE.Color(colors.bottomColor) }
        };
        
        const skyGeo = new THREE.SphereGeometry(1000, 32, 15);
        const skyMat = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: uniforms,
            side: THREE.BackSide
        });
        
        // Remove old skybox if exists
        if (this.currentSkybox && this.currentSkybox.isMesh) {
            this.scene.remove(this.currentSkybox);
        }
        
        const sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(sky);
        this.currentSkybox = sky;
        
        console.log(`🌌 Procedural skybox created: ${preset}`);
        return sky;
    }
    
    /**
     * Create a starfield (great for night/space levels)
     */
    createStarfield(count = 1000) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        
        for (let i = 0; i < count; i++) {
            const x = THREE.MathUtils.randFloatSpread(2000);
            const y = THREE.MathUtils.randFloatSpread(2000);
            const z = THREE.MathUtils.randFloatSpread(2000);
            vertices.push(x, y, z);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 2,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
        
        console.log('⭐ Starfield created with ' + count + ' stars');
        return stars;
    }
    
    /**
     * Quick fallback - solid color background
     */
    setSolidColor(color) {
        this.scene.background = new THREE.Color(color);
        console.log('🎨 Solid color skybox set');
    }
    
    /**
     * Fallback skybox when loading fails
     */
    createFallbackSkybox() {
        console.log('🔄 Creating fallback procedural skybox');
        this.createProceduralSkybox('day');
    }
    
    /**
     * Animate the skybox (for dynamic effects)
     */
    update(deltaTime) {
        if (this.currentSkybox && this.currentSkybox.isMesh) {
            // Slowly rotate the skybox for subtle effect
            this.currentSkybox.rotation.y += deltaTime * 0.01;
        }
    }
}

// Convenience function for level configs
export function createSkyboxConfig(type, options = {}) {
    return {
        type: type, // 'procedural', 'cubemap', 'equirectangular', 'starfield', 'solid'
        ...options
    };
}
