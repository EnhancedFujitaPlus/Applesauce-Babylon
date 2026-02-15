/**
 * APPLESAUCE Skater Module
 * Reusable player model for all levels
 * Import this into any level to get the skater!
 */
import * as THREE from '../three.module.js';

export class ApplesauceSkater {
    constructor(core) {
        this.core = core;
        this.player = null;
        this.deck = null;
        
        console.log('🛹 Skater module loaded');
    }
    
    /**
     * Creates and spawns the player skater
     * @param {Object} config - Spawn configuration
     * @param {number} config.x - X position
     * @param {number} config.z - Z position
     * @param {number} config.deckColor - Hex color for deck (optional)
     * @param {number} config.bodyColor - Hex color for body (optional)
     * @returns {THREE.Group} The player group
     */
    spawn(config = {}) {
        // Default configuration
        const x = config.x || 0;
        const z = config.z || 0;
        const deckColor = config.deckColor || 0xFF1493;  // Hot pink
        const bodyColor = config.bodyColor || 0x333333;   // Dark gray
        const skinColor = config.skinColor || 0xFFDBAC;   // Skin tone
        
        // Create player group
        const player = new THREE.Group();
        
        // ===================================
        // SKATEBOARD DECK
        // ===================================
        const deckGeo = new THREE.BoxGeometry(0.8, 0.1, 2.5);
        const deckMat = new THREE.MeshLambertMaterial({ color: deckColor });
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.position.y = 0.3;
        deck.castShadow = true;
        player.add(deck);
        
        // Store deck reference for tricks
        this.deck = deck;
        
        // ===================================
        // WHEELS (4 wheels)
        // ===================================
        const wheelPositions = [
            [-0.3, 0.15, -0.8],  // Front left
            [0.3, 0.15, -0.8],   // Front right
            [-0.3, 0.15, 0.8],   // Back left
            [0.3, 0.15, 0.8]     // Back right
        ];
        
        for (let pos of wheelPositions) {
            const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12);
            const wheelMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.position.set(...pos);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            player.add(wheel);
        }
        
        // ===================================
        // SKATER BODY
        // ===================================
        const bodyGeo = new THREE.BoxGeometry(0.6, 1.2, 0.4);
        const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.set(0, 1.2, -0.2);
        body.castShadow = true;
        player.add(body);
        
        // ===================================
        // HEAD
        // ===================================
        const headGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const headMat = new THREE.MeshLambertMaterial({ color: skinColor });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 2.1, -0.2);
        head.castShadow = true;
        player.add(head);
        
        // ===================================
        // ARMS (left and right)
        // ===================================
        for (let side of [-1, 1]) {
            const armGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
            const arm = new THREE.Mesh(armGeo, bodyMat);
            arm.position.set(side * 0.4, 1.2, -0.2);
            arm.castShadow = true;
            player.add(arm);
        }
        
        // ===================================
        // LEGS (left and right)
        // ===================================
        for (let side of [-1, 1]) {
            const legGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
            const leg = new THREE.Mesh(legGeo, bodyMat);
            leg.position.set(side * 0.2, 0.6, -0.2);
            leg.castShadow = true;
            player.add(leg);
        }
        
        // Position player at spawn point
        let groundY = 1; // Default height
        
        // Try to get terrain height from terrain module
        if (this.core.modules && this.core.modules.terrain && this.core.modules.terrain.getHeight) {
            groundY = this.core.modules.terrain.getHeight(x, z);
        } else if (this.core.getTerrainHeight) {
            // Fallback to core method if it exists
            groundY = this.core.getTerrainHeight(x, z);
        }
        
        player.position.set(x, groundY + 0.5, z);
        
        // Add to scene
        this.core.scene.add(player);
        
        // Store reference
        this.player = player;
        this.core.player = player;
        
        console.log(`🛹 Skater spawned at (${x}, ${z})`);
        
        return player;
    }
    
    /**
     * Updates player model for tricks (optional animations)
     */
    update(core) {
        if (!this.player || !this.deck) return;
        
        // Kickflip animation
        if (core.state.attemptingKickflip) {
            this.deck.rotation.x += 0.3;  // Spin the deck
        } else {
            // Reset deck rotation when not doing tricks
            this.deck.rotation.x *= 0.9;  // Smooth return to normal
        }
        
        // Leaning during turns (subtle animation)
        if (core.keys['a'] || core.keys['ArrowLeft']) {
            this.deck.rotation.z = Math.min(this.deck.rotation.z + 0.05, 0.2);
        } else if (core.keys['d'] || core.keys['ArrowRight']) {
            this.deck.rotation.z = Math.max(this.deck.rotation.z - 0.05, -0.2);
        } else {
            this.deck.rotation.z *= 0.9;  // Return to center
        }
    }
    
    /**
     * Removes the player from the scene
     */
    remove() {
        if (this.player) {
            this.core.scene.remove(this.player);
            this.player = null;
            this.deck = null;
            this.core.player = null;
            console.log('🛹 Skater removed');
        }
    }
    
    /**
     * Changes deck color
     */
    setDeckColor(color) {
        if (this.deck) {
            this.deck.material.color.setHex(color);
        }
    }
    
    /**
     * Changes body color
     */
    setBodyColor(color) {
        if (this.player) {
            this.player.children.forEach(child => {
                if (child.material && child.geometry.type !== 'CylinderGeometry') {
                    child.material.color.setHex(color);
                }
            });
        }
    }
}
