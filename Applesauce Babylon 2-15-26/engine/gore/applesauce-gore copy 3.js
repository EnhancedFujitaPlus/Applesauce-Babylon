/**
 * APPLESAUCE Gore Module
 * Blood particles, gibs (body parts), and splatter effects
 */

class ApplesauceGore {
    constructor(engine) {
        this.engine = engine;
        this.blood = [];
        this.gibs = [];
        this.maxBloodParticles = 2000; // Performance limit
        
        console.log('🩸 Gore module loaded');
    }
    
    // ===================================
    // BLOOD SPLATTER
    // ===================================
    createBloodSplatter(position, velocity, amount = 30) {
        for (let i = 0; i < amount; i++) {
            const particle = this.createBloodParticle(position, velocity);
            this.blood.push(particle);
            this.engine.scene.add(particle);
        }
        
        // Keep blood count under control
        while (this.blood.length > this.maxBloodParticles) {
            const old = this.blood.shift();
            this.engine.scene.remove(old);
        }
    }
    
    createBloodParticle(position, baseVelocity) {
        const size = Math.random() * 0.3 + 0.1;
        const geo = new THREE.SphereGeometry(size, 6, 6);
        const mat = new THREE.MeshBasicMaterial({ 
            color: 0x8B0000,
            transparent: true,
            opacity: 0.8
        });
        
        const particle = new THREE.Mesh(geo, mat);
        particle.position.copy(position);
        
        // Random velocity spray
        particle.velocity = new THREE.Vector3(
            baseVelocity.x + (Math.random() - 0.5) * 0.3,
            Math.random() * 0.4 + 0.2,
            baseVelocity.z + (Math.random() - 0.5) * 0.3
        );
        
        particle.lifetime = 1000; // 1000 frames persistence
        
        return particle;
    }
    
    // ===================================
    // BLOOD POOL (GROUND STAIN)
    // ===================================
    createBloodPool(position, size = 2) {
        const poolGeo = new THREE.CircleGeometry(size, 16);
        const poolMat = new THREE.MeshBasicMaterial({ 
            color: 0x660000,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const pool = new THREE.Mesh(poolGeo, poolMat);
        pool.rotation.x = -Math.PI / 2;
        pool.position.copy(position);
        pool.position.y = this.engine.getTerrainHeight(position.x, position.z) + 0.02;
        pool.lifetime = 3000; // Lasts longer than particles
        
        this.blood.push(pool);
        this.engine.scene.add(pool);
    }
    
    // ===================================
    // GIBS (BODY PARTS)
    // ===================================
    createGibs(position, velocity, count = 5) {
        const gibTypes = ['head', 'limb', 'torso'];
        
        for (let i = 0; i < count; i++) {
            const type = gibTypes[Math.floor(Math.random() * gibTypes.length)];
            const gib = this.createGib(type, position, velocity);
            this.gibs.push(gib);
            this.engine.scene.add(gib);
        }
    }
    
    createGib(type, position, baseVelocity) {
        let geo, color;
        
        switch(type) {
            case 'head':
                geo = new THREE.SphereGeometry(0.3, 8, 8);
                color = 0xFFDBAC; // Skin tone
                break;
            case 'limb':
                geo = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 4);
                color = 0xFFDBAC;
                break;
            case 'torso':
                geo = new THREE.BoxGeometry(0.5, 0.7, 0.3);
                color = Math.random() > 0.5 ? 0x3366CC : 0xFF0000; // Random clothing
                break;
        }
        
        const mat = new THREE.MeshLambertMaterial({ color });
        const gib = new THREE.Mesh(geo, mat);
        gib.position.copy(position);
        gib.castShadow = true;
        
        // Randomized physics velocity
        gib.velocity = new THREE.Vector3(
            baseVelocity.x + (Math.random() - 0.5) * 0.5,
            Math.random() * 0.6 + 0.3,
            baseVelocity.z + (Math.random() - 0.5) * 0.5
        );
        
        // Random rotation velocity for tumbling effect
        gib.rotationVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
        );
        
        gib.lifetime = 600; // 10 seconds at 60fps
        
        return gib;
    }
    
    // ===================================
    // UPDATE PHYSICS
    // ===================================
    update(engine) {
        // Update blood particles
        for (let i = this.blood.length - 1; i >= 0; i--) {
            const particle = this.blood[i];
            
            if (particle.lifetime !== undefined) {
                particle.lifetime--;
                if (particle.lifetime <= 0) {
                    engine.scene.remove(particle);
                    this.blood.splice(i, 1);
                    continue;
                }
                
                // Fade out in last 20% of lifetime
                if (particle.material && particle.material.transparent) {
                    const fadeStart = particle.lifetime < 200 ? particle.lifetime / 200 : 1;
                    particle.material.opacity = Math.min(0.8, fadeStart * 0.8);
                }
            }
            
            // Physics for moving particles
            if (particle.velocity) {
                particle.position.add(particle.velocity);
                particle.velocity.y -= 0.015; // Gravity
                
                // Ground collision
                const groundLevel = engine.getTerrainHeight(particle.position.x, particle.position.z);
                if (particle.position.y < groundLevel + 0.1) {
                    particle.position.y = groundLevel + 0.1;
                    particle.velocity.multiplyScalar(0.3); // Friction
                }
                
                // Stop if slow enough
                if (particle.position.y < groundLevel + 0.15 && particle.velocity.length() < 0.02) {
                    particle.velocity = null; // Becomes stain
                    if (!particle.lifetime || particle.lifetime > 1500) {
                        particle.lifetime = 1500;
                    }
                }
            }
        }
        
        // Update gibs (body parts)
        for (let i = this.gibs.length - 1; i >= 0; i--) {
            const gib = this.gibs[i];
            
            gib.lifetime--;
            if (gib.lifetime <= 0) {
                engine.scene.remove(gib);
                this.gibs.splice(i, 1);
                continue;
            }
            
            // Physics
            if (gib.velocity.length() > 0.01) {
                gib.position.add(gib.velocity);
                gib.velocity.y -= 0.015; // Gravity
                
                // Tumbling rotation
                gib.rotation.x += gib.rotationVelocity.x;
                gib.rotation.y += gib.rotationVelocity.y;
                gib.rotation.z += gib.rotationVelocity.z;
                
                // Ground collision
                const groundLevel = engine.getTerrainHeight(gib.position.x, gib.position.z);
                if (gib.position.y < groundLevel + 0.2) {
                    gib.position.y = groundLevel + 0.2;
                    gib.velocity.y *= -0.3; // Bounce (dampened)
                    gib.velocity.x *= 0.5; // Friction
                    gib.velocity.z *= 0.5;
                    gib.rotationVelocity.multiplyScalar(0.5);
                    
                    // Come to rest
                    if (Math.abs(gib.velocity.y) < 0.08) {
                        gib.velocity.set(0, 0, 0);
                        gib.rotationVelocity.set(0, 0, 0);
                    }
                }
            }
        }
    }
    
    // ===================================
    // MASSIVE SPLATTER (for high-speed kills)
    // ===================================
    createMassiveSplatter(position, velocity) {
        // Extra blood for dramatic effect
        this.createBloodSplatter(position, velocity, 50);
        this.createBloodPool(position, 3);
        this.createGibs(position, velocity, 8);
    }
    
    // ===================================
    // CLEANUP
    // ===================================
    clear() {
        // Remove all blood
        for (let particle of this.blood) {
            this.engine.scene.remove(particle);
        }
        this.blood = [];
        
        // Remove all gibs
        for (let gib of this.gibs) {
            this.engine.scene.remove(gib);
        }
        this.gibs = [];
        
        console.log('🩸 Gore cleared');
    }
}
