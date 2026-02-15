/**
 * APPLESAUCE Weather Module
 * Handles weather effects, destructibles, and environmental hazards
 */

import * as THREE from '../three.module.js';

export class ApplesauceWeather {
    constructor(core) {
        this.core = core;
        this.scene = core.scene;
        this.activeWeather = [];
        this.destructibles = []; // Trees, buildings, etc.
        this.hazards = []; // Active projectiles, lava flows, etc.
        
        console.log('🌪️ Weather module loaded');
    }
    
    /**
     * Update weather systems (called every frame)
     */
    update(core) {
        // Get player position
        const playerPosition = core.player ? core.player.position : new THREE.Vector3(0, 0, 0);
        const delta = 1/60; // Assuming 60fps
        
        // Update all active weather
        this.activeWeather.forEach(weather => {
            if (weather.update) {
                weather.update(playerPosition, delta);
            }
        });
        
        // Update physics hazards
        this.updateHazards(playerPosition);
        
        // Check hazard collisions
        this.checkHazardCollisions(playerPosition);
    }
    
    /**
     * Clear all weather effects (called when level changes)
     */
    clear() {
        // Remove all active weather
        this.activeWeather.forEach(weather => {
            if (weather.clear) {
                weather.clear();
            }
        });
        this.activeWeather = [];
        
        // Remove all hazards from scene
        this.hazards.forEach(hazard => {
            if (hazard.mesh) {
                this.scene.remove(hazard.mesh);
            }
        });
        this.hazards = [];
        
        // Clear destructibles
        this.destructibles = [];
        
        console.log('🌪️ Weather cleared');
    }
    
    // ===================================
    // DESTRUCTIBLE OBJECTS
    // ===================================
    
    /**
     * Register objects that can be destroyed
     */
    registerDestructible(object, properties) {
        this.destructibles.push({
            mesh: object,
            health: properties.health || 100,
            type: properties.type, // 'tree', 'building', 'prop'
            onDestroy: properties.onDestroy || null
        });
    }
    
    // ===================================
    // WEATHER SYSTEMS
    // ===================================
    
    /**
     * Add weather phenomenon
     */
    addWeather(weatherType, config) {
        let weather;
        switch(weatherType) {
            case 'volcano':
                // weather = new VolcanoSystem(this.scene, config, this);
                console.log('🌋 Volcano system would spawn here');
                break;
            case 'hurricane':
                // weather = new HurricaneSystem(this.scene, config, this);
                console.log('🌀 Hurricane system would spawn here');
                break;
            case 'tornado':
                console.log('🌪️ Tornado system would spawn here');
                break;
            case 'meteor':
                console.log('☄️ Meteor shower would spawn here');
                break;
            default:
                console.warn(`Unknown weather type: ${weatherType}`);
                return null;
        }
        
        if (weather) {
            this.activeWeather.push(weather);
        }
        return weather;
    }
    
    // ===================================
    // HAZARD MANAGEMENT
    // ===================================
    
    updateHazards(playerPosition) {
        for (let i = this.hazards.length - 1; i >= 0; i--) {
            const hazard = this.hazards[i];
            
            if (hazard.update && hazard.update(this.scene)) {
                // Check if it hit anything destructible
                this.checkDestructibleCollisions(hazard);
            } else {
                // Remove expired hazard
                if (hazard.mesh) {
                    this.scene.remove(hazard.mesh);
                }
                this.hazards.splice(i, 1);
            }
        }
    }
    
    checkHazardCollisions(playerPosition) {
        this.hazards.forEach(hazard => {
            if (!hazard.mesh) return;
            
            const dist = hazard.mesh.position.distanceTo(playerPosition);
            if (dist < (hazard.collisionRadius || 1)) {
                // Player hit by hazard
                if (this.core.modules.combat) {
                    // Deal damage via combat system
                    console.log(`⚠️ Player hit by ${hazard.type || 'hazard'}! Damage: ${hazard.damage || 10}`);
                }
                
                // Create impact effects
                this.createImpactEffect(hazard.mesh.position, hazard.type);
            }
        });
    }
    
    checkDestructibleCollisions(hazard) {
        if (!hazard.mesh) return;
        
        this.destructibles.forEach(destructible => {
            const dist = hazard.mesh.position.distanceTo(destructible.mesh.position);
            if (dist < 3) { // Collision threshold
                destructible.health -= (hazard.damage || 10);
                
                if (destructible.health <= 0) {
                    this.destroyObject(destructible);
                }
            }
        });
    }
    
    // ===================================
    // DESTRUCTION & EFFECTS
    // ===================================
    
    destroyObject(destructible) {
        // Remove from scene
        this.scene.remove(destructible.mesh);
        
        // Create destruction effects
        this.createDebris(destructible.mesh.position, destructible.type);
        
        // Remove from tracking
        const index = this.destructibles.indexOf(destructible);
        if (index > -1) {
            this.destructibles.splice(index, 1);
        }
        
        // Fire callback
        if (destructible.onDestroy) {
            destructible.onDestroy();
        }
        
        console.log(`💥 Destroyed ${destructible.type}`);
    }
    
    createDebris(position, objectType) {
        // Create 5-10 debris chunks
        const count = 5 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < count; i++) {
            const size = Math.random() * 0.5 + 0.3;
            const debrisGeo = new THREE.BoxGeometry(size, size, size);
            const debrisMat = new THREE.MeshLambertMaterial({
                color: objectType === 'tree' ? 0x8B4513 : 0x808080
            });
            const debrisMesh = new THREE.Mesh(debrisGeo, debrisMat);
            
            debrisMesh.position.copy(position);
            debrisMesh.castShadow = true;
            
            this.scene.add(debrisMesh);
            
            // Add physics
            const debris = {
                mesh: debrisMesh,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.4,
                    Math.random() * 0.5 + 0.2,
                    (Math.random() - 0.5) * 0.4
                ),
                lifetime: 300, // 5 seconds at 60fps
                update: function(scene) {
                    this.mesh.position.add(this.velocity);
                    this.velocity.y -= 0.02; // Gravity
                    this.lifetime--;
                    
                    if (this.lifetime <= 0) {
                        return false; // Remove
                    }
                    return true; // Keep
                }
            };
            
            this.hazards.push(debris);
        }
    }
    
    createImpactEffect(position, hazardType) {
        // Different effects for different hazards
        switch(hazardType) {
            case 'lava':
                this.createLavaImpact(position);
                break;
            case 'debris':
                this.createDebrisImpact(position);
                break;
            case 'water':
                this.createWaterImpact(position);
                break;
            default:
                this.createGenericImpact(position);
        }
    }
    
    createLavaImpact(position) {
        // Glowing orange/red particles
        for (let i = 0; i < 20; i++) {
            const particleGeo = new THREE.SphereGeometry(0.1);
            const particleMat = new THREE.MeshBasicMaterial({ 
                color: Math.random() > 0.5 ? 0xFF4500 : 0xFFD700,
                emissive: 0xFF4500
            });
            const particle = new THREE.Mesh(particleGeo, particleMat);
            
            particle.position.copy(position);
            this.scene.add(particle);
            
            // Add to hazards for physics updates
            this.hazards.push({
                mesh: particle,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * 0.4,
                    (Math.random() - 0.5) * 0.3
                ),
                lifetime: 60,
                type: 'particle',
                update: function(scene) {
                    this.mesh.position.add(this.velocity);
                    this.velocity.y -= 0.02; // Gravity
                    this.lifetime--;
                    
                    if (this.lifetime <= 0) {
                        return false;
                    }
                    return true;
                }
            });
        }
    }
    
    createDebrisImpact(position) {
        // Dust cloud effect
        console.log('💨 Debris impact at', position);
    }
    
    createWaterImpact(position) {
        // Water splash effect
        console.log('💦 Water impact at', position);
    }
    
    createGenericImpact(position) {
        // Generic explosion effect
        console.log('💥 Impact at', position);
    }
}
