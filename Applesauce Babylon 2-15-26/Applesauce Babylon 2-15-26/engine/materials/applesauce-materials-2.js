/**
 * APPLESAUCE Materials v1.0
 * THREE.js material definitions only - no building logic
 */
import * as THREE from '../three.module.js';

export class ApplesauceMaterials {
    constructor(core) {
        this.core = core;
        
        // Basic materials
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
            
            // Gore Materials (for enemies/splatter)
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
        
        // Speed-based materials (for visual feedback)
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
        
        console.log('🎨 Materials loaded');
    }
    
    // Helper method to get material by name
    getMaterial(name) {
        return this.materials[name] || this.materials.concrete;
    }
    
    // Get random graffiti color
    getRandomGraffitiColor() {
        return this.graffitiColors[Math.floor(Math.random() * this.graffitiColors.length)];
    }
    
    // Get speed-appropriate material for visual feedback
    getSpeedMaterial(speed) {
        const absSpeed = Math.abs(speed);
        if (absSpeed > 0.8) return this.speedMaterials.fast;
        if (absSpeed > 0.4) return this.speedMaterials.medium;
        return this.speedMaterials.slow;
    }
}
