// WeatherSystem.js

import * as THREE from '../three.module.js';

export class ApplesauceWeather {
    constructor(scene, eventBus) {
        this.scene = scene;
        this.eventBus = eventBus;
        this.activeWeather = [];
        this.destructibles = []; // Trees, buildings, etc.
        this.hazards = []; // Active projectiles, lava flows, etc.
    }
    
    // Register objects that can be destroyed
    registerDestructible(object, properties) {
        this.destructibles.push({
            mesh: object,
            health: properties.health || 100,
            type: properties.type, // 'tree', 'building', 'prop'
            onDestroy: properties.onDestroy || null
        });
    }
    
    // Add weather phenomenon
    addWeather(weatherType, config) {
        let weather;
        switch(weatherType) {
            case 'volcano':
                weather = new VolcanoSystem(this.scene, config, this);
                break;
            case 'hurricane':
                weather = new HurricaneSystem(this.scene, config, this);
                break;
            // ...etc
        }
        this.activeWeather.push(weather);
        return weather;
    }
    
    update(playerPosition, delta) {
        // Update all active weather
        this.activeWeather.forEach(weather => weather.update(playerPosition, delta));
        
        // Update physics hazards
        this.updateHazards(playerPosition);
        
        // Check hazard collisions
        this.checkHazardCollisions(playerPosition);
    }
    
    updateHazards(playerPosition) {
        for (let i = this.hazards.length - 1; i >= 0; i--) {
            const hazard = this.hazards[i];
            
            if (hazard.update(this.scene)) {
                // Check if it hit anything destructible
                this.checkDestructibleCollisions(hazard);
            } else {
                // Remove expired hazard
                this.scene.remove(hazard.mesh);
                this.hazards.splice(i, 1);
            }
        }
    }
    
    checkHazardCollisions(playerPosition) {
        this.hazards.forEach(hazard => {
            const dist = hazard.mesh.position.distanceTo(playerPosition);
            if (dist < hazard.collisionRadius) {
                this.eventBus.emit('playerHitByHazard', {
                    hazard: hazard,
                    damage: hazard.damage,
                    position: hazard.mesh.position
                });
                
                // Create impact effects
                this.createImpactEffect(hazard.mesh.position, hazard.type);
            }
        });
    }
    
    checkDestructibleCollisions(hazard) {
        this.destructibles.forEach(destructible => {
            const dist = hazard.mesh.position.distanceTo(destructible.mesh.position);
            if (dist < 3) { // Collision threshold
                destructible.health -= hazard.damage;
                
                if (destructible.health <= 0) {
                    this.destroyObject(destructible);
                }
            }
        });
    }
    
    destroyObject(destructible) {
        // Remove from scene
        this.scene.remove(destructible.mesh);
        
        // Create destruction effects
        this.createDebris(destructible.mesh.position, destructible.type);
        
        // Remove from tracking
        const index = this.destructibles.indexOf(destructible);
        if (index > -1) this.destructibles.splice(index, 1);
        
        // Fire callback
        if (destructible.onDestroy) {
            destructible.onDestroy();
        }
        
        this.eventBus.emit('objectDestroyed', {
            type: destructible.type,
            position: destructible.mesh.position
        });
    }
    
    createDebris(position, objectType) {
        // Create 5-10 debris chunks
        const count = 5 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < count; i++) {
            const debris = new PhysicsEntity({
                position: position.clone(),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.4,
                    Math.random() * 0.5 + 0.2,
                    (Math.random() - 0.5) * 0.4
                ),
                size: Math.random() * 0.5 + 0.3,
                color: objectType === 'tree' ? 0x8B4513 : 0x808080,
                lifetime: 300
            });
            
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
        }
    }
    
    createLavaImpact(position) {
        // Glowing orange/red particles
        for (let i = 0; i < 20; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.1),
                new THREE.MeshBasicMaterial({ 
                    color: Math.random() > 0.5 ? 0xFF4500 : 0xFFD700,
                    emissive: 0xFF4500
                })
            );
            particle.position.copy(position);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.4,
                (Math.random() - 0.5) * 0.3
            );
            particle.lifetime = 60;
            
            this.scene.add(particle);
            // Add to hazards for physics updates
            this.hazards.push({
                mesh: particle,
                velocity: particle.velocity,
                lifetime: particle.lifetime,
                update: function() {
                    this.mesh.position.add(this.velocity);
                    this.velocity.y -= 0.02;
                    this.lifetime--;
                    return this.lifetime > 0;
                }
            });
        }
    }
}