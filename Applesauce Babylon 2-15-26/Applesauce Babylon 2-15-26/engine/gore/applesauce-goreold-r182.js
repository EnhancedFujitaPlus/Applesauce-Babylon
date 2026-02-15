/**
 * APPLESAUCE ULTRA Gore Module for Three.js r182
 * Advanced blood particles, gibs, screen effects, and splatter
 * Ported from UltraGore v0.0.4
 * ES Module version
 */

import * as THREE from './three.module.js';

export class ApplesauceGore {
    constructor(engine) {
        this.engine = engine;
        this.blood = [];
        this.gibs = [];
        this.mist = [];
        this.maxBloodParticles = 20000; // Performance limit
        
        // Combo system
        this.combo = 0;
        this.lastKillTime = 0;
        this.comboTimeout = 3000; // 3 seconds
        
        // Create UI elements for screen effects
        this._createScreenEffects();
        
        console.log('🩸 ULTRA Gore module loaded');
    }

    [ Skin Layer ]   weak, elastic, tears first
[ Muscle Layer ] strong, stretchy, messy
[ Bone Layer ]   rigid, rarely breaks

{
  a: pointA,
  b: pointB,
  restLength: 0.2,
  stiffness: 0.9,
  tearThreshold: 1.6,
  layer: 'muscle'
}

solveConstraint(c) {
    const delta = c.b.position.clone().sub(c.a.position);
    const dist = delta.length();

    // Tear condition
    if (dist > c.restLength * c.tearThreshold) {
        this.tearConstraint(c);
        return;
    }

    const diff = (dist - c.restLength) / dist;
    const correction = delta.multiplyScalar(0.5 * c.stiffness * diff);

    if (!c.a.pinned) c.a.position.add(correction);
    if (!c.b.pinned) c.b.position.sub(correction);
}

tearConstraint(c) {
    const midpoint = c.a.position.clone().add(c.b.position).multiplyScalar(0.5);

    this.createArterialSpray(midpoint, randomDirection(), 2);
    this.weakenNearbyConstraints(c);

    c.torn = true;
}

applyBladeCut(points, planeNormal, force) {
    for (let p of points) {
        const d = planeNormal.dot(p.position.clone().sub(cutOrigin));
        if (Math.abs(d) < 0.3) {
            p.position.add(planeNormal.clone().multiplyScalar(force));
        }
    }
}


    
    // ===================================
    // UI CREATION FOR SCREEN EFFECTS
    // ===================================
    _createScreenEffects() {
        // Check if elements already exist
        if (document.getElementById('bloodFlash')) {
            console.log('🩸 Using existing gore UI elements');
            return;
        }
        
        console.log('🩸 Creating gore UI elements...');
        
        // Create blood flash overlay
        const bloodFlash = document.createElement('div');
        bloodFlash.id = 'bloodFlash';
        bloodFlash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle, rgba(255,0,0,0.6) 0%, rgba(139,0,0,0) 70%);
            pointer-events: none;
            opacity: 0;
            z-index: 50;
            transition: opacity 0.1s;
        `;
        document.body.appendChild(bloodFlash);
        
        // Create combo display
        const comboDisplay = document.createElement('div');
        comboDisplay.id = 'comboDisplay';
        comboDisplay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 80px;
            color: #FF0000;
            text-shadow: 4px 4px 0 #000;
            pointer-events: none;
            opacity: 0;
            z-index: 70;
            font-weight: bold;
            font-family: Impact, Arial Black, sans-serif;
        `;
        document.body.appendChild(comboDisplay);
        
        // Add CSS animations
        const style = document.createElement('style');
        style.id = 'gore-styles';
        style.textContent = `
            .blood-splatter {
                position: fixed;
                width: 150px;
                height: 150px;
                background: radial-gradient(circle, rgba(139,0,0,0.8) 20%, rgba(255,0,0,0.4) 50%, transparent 70%);
                pointer-events: none;
                z-index: 60;
                animation: bloodFade 2s ease-out forwards;
            }
            
            @keyframes bloodFade {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
            
            .combo-show {
                animation: comboPopup 1s ease-out forwards;
            }
            
            @keyframes comboPopup {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        console.log('✅ Gore UI elements created');
    }
    
    // ===================================
    // SCREEN EFFECTS
    // ===================================
    createLensSplatter(intensity = 1) {
        const count = Math.floor(2 + Math.random() * 3) * intensity;
        
        for (let i = 0; i < count; i++) {
            const splatter = document.createElement('div');
            splatter.className = 'blood-splatter';
            
            // Random position on screen edges
            const edge = Math.floor(Math.random() * 4);
            const offset = Math.random() * 80 + 10; // 10-90%
            
            switch(edge) {
                case 0: // Top
                    splatter.style.left = offset + '%';
                    splatter.style.top = '-50px';
                    break;
                case 1: // Right
                    splatter.style.right = '-50px';
                    splatter.style.top = offset + '%';
                    break;
                case 2: // Bottom
                    splatter.style.left = offset + '%';
                    splatter.style.bottom = '-50px';
                    break;
                case 3: // Left
                    splatter.style.left = '-50px';
                    splatter.style.top = offset + '%';
                    break;
            }
            
            // Random size
            const size = 100 + Math.random() * 100;
            splatter.style.width = size + 'px';
            splatter.style.height = size + 'px';
            
            document.body.appendChild(splatter);
            
            // Remove after animation
            setTimeout(() => {
                if (splatter.parentNode) {
                    document.body.removeChild(splatter);
                }
            }, 2000);
        }
    }
    
    updateCombo() {
        const now = Date.now();
        
        // Check if combo expired
        if (now - this.lastKillTime > this.comboTimeout && this.combo > 0) {
            this.combo = 0;
        }
        
        // Update kill
        this.combo++;
        this.lastKillTime = now;
        
        // Display combo if > 1
        if (this.combo > 1) {
            const comboDisplay = document.getElementById('comboDisplay');
            if (comboDisplay) {
                comboDisplay.textContent = this.combo + 'x COMBO!';
                comboDisplay.className = 'combo-show';
                
                // Remove animation class after it finishes
                setTimeout(() => {
                    comboDisplay.className = '';
                }, 1000);
            }
        }
        
        // Return multiplier for gore intensity
        return Math.min(this.combo, 5); // Cap at 5x
    }
    
    updateVerletParticle(p, engine) {
    // Compute velocity from last frame
    const velocity = p.position.clone().sub(p.prevPosition);

    // Store current position
    p.prevPosition.copy(p.position);

    // Apply motion
    p.position.add(velocity);

    // Gravity (scaled for gore weight)
    p.position.y -= 0.015;

    // Ground collision
    const ground = engine.getTerrainHeight(p.position.x, p.position.z) + 0.1;

    if (p.position.y < ground) {
        p.position.y = ground;

        // Dampened splat response
        velocity.multiplyScalar(0.25);

        // Rebuild prevPosition to kill bounce
        p.prevPosition.copy(
            p.position.clone().sub(velocity)
        );

        // Optional: convert to stain
        if (velocity.length() < 0.02) {
            p.isResting = true;
        }
    }
}

createArterialStream(origin, direction, segments = 12) {
    const chain = [];

    let pos = origin.clone();

    for (let i = 0; i < segments; i++) {
        const p = {
            position: pos.clone(),
            prevPosition: pos.clone().sub(direction.clone().multiplyScalar(0.2)),
            isBlood: true
        };

        chain.push(p);
        pos.add(direction.clone().multiplyScalar(0.15));
    }

    this.blood.push(chain);
}
solveConstraints(chain) {
    const restLength = 0.15;

    for (let i = 0; i < chain.length - 1; i++) {
        const a = chain[i];
        const b = chain[i + 1];

        const delta = b.position.clone().sub(a.position);
        const dist = delta.length();
        const diff = (dist - restLength) / dist;

        delta.multiplyScalar(0.5 * diff);

        a.position.add(delta);
        b.position.sub(delta);
    }
}

    
    // ===================================
    // BLOOD MIST
    // ===================================
    createBloodMist(position, radius = 3) {
        const mistCount = 60;
        
        for (let i = 0; i < mistCount; i++) {
            const size = 0.3 + Math.random() * 0.5;
            const geo = new THREE.SphereGeometry(size, 4, 4);
            const mat = new THREE.MeshBasicMaterial({ 
                color: 0xFF0000,
                transparent: true,
                opacity: 0.4
            });
            const particle = new THREE.Mesh(geo, mat);
            
            // Spread in sphere around impact
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius;
            particle.position.set(
                position.x + Math.cos(angle) * dist,
                position.y + Math.random() * 2,
                position.z + Math.sin(angle) * dist
            );
            
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                Math.random() * 0.05,
                (Math.random() - 0.5) * 0.02
            );
            
            particle.lifetime = 80;
            particle.isMist = true;
            
            this.engine.scene.add(particle);
            this.mist.push(particle);
        }
    }
    
    // ===================================
    // ENHANCED BLOOD SPLATTER
    // ===================================
    createBloodSplatter(position, velocity, amount = 200) {
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
        
        // Varied blood colors
        const colorVariants = [0x8B0000, 0xAA0000, 0x660000, 0x990000];
        const color = colorVariants[Math.floor(Math.random() * colorVariants.length)];
        
        const mat = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        const particle = new THREE.Mesh(geo, mat);
        particle.position.copy(position);
        
        // Random velocity spray
        particle.velocity = new THREE.Vector3(
            baseVelocity.x + (Math.random() - 0.5) * 0.2,
            Math.random() * 0.5 + 0.2,
            baseVelocity.z + (Math.random() - 0.5) * 0.2
        );
        
        particle.lifetime = 10000; // Long persistence
        particle.castShadow = true;
        
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
        pool.lifetime = 100000; // Permanent
        pool.isPermanent = true;
        
        this.blood.push(pool);
        this.engine.scene.add(pool);
    }
    
    // ===================================
    // PERMANENT BLOOD STAIN
    // ===================================
    createPermanentBloodStain(position, size = 0.8) {
        const stainGeo = new THREE.CircleGeometry(size, 8);
        const stainMat = new THREE.MeshBasicMaterial({ 
            color: 0x4A0000,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const stain = new THREE.Mesh(stainGeo, stainMat);
        stain.rotation.x = -Math.PI / 2;
        stain.rotation.z = Math.random() * Math.PI * 2; // Random rotation
        stain.position.copy(position);
        stain.position.y = this.engine.getTerrainHeight(position.x, position.z) + 0.01;
        stain.lifetime = 100000; // Permanent
        stain.isPermanent = true;
        
        this.blood.push(stain);
        this.engine.scene.add(stain);
    }
    
    // ===================================
    // ENHANCED GIBS (BODY PARTS)
    // ===================================
    createGibs(position, velocity, count = 12) {
        const gibTypes = ['head', 'arm', 'leg', 'torso', 'bone', 'organ'];
        
        for (let i = 0; i < count; i++) {
            const type = gibTypes[Math.floor(Math.random() * gibTypes.length)];
            const gib = this.createBodyPartGib(type, position, velocity);
            this.gibs.push(gib);
            this.engine.scene.add(gib);
        }
    }
    
    createBodyPartGib(type, position, baseVelocity) {
        let geo, color;
        
        switch(type) {
            case 'head':
                geo = new THREE.SphereGeometry(0.35, 8, 8);
                color = 0xFFDBAC; // Skin tone
                break;
            case 'arm':
                geo = new THREE.BoxGeometry(0.2, 1, 0.2);
                color = 0xFFDBAC;
                break;
            case 'leg':
                geo = new THREE.BoxGeometry(0.25, 1.2, 0.25);
                color = 0xFFDBAC;
                break;
            case 'torso':
                geo = new THREE.BoxGeometry(0.6, 0.8, 0.4);
                color = 0xFF6B6B; // Bloody torso
                break;
            case 'bone':
                geo = new THREE.BoxGeometry(0.15, 0.6, 0.15);
                color = 0xFFFAF0; // Bone white
                break;
            case 'organ':
                geo = new THREE.SphereGeometry(0.3, 6, 6);
                color = 0x8B0000; // Dark red organ
                break;
            default:
                geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
                color = 0xFF0000;
        }
        
        const mat = new THREE.MeshLambertMaterial({ color: color });
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
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4
        );
        
        gib.lifetime = 10000; // Persist longer
        gib.partType = type;
        gib.hasTrail = true;
        
        // Twitching limbs
        if (['arm', 'leg', 'head'].includes(type)) {
            gib.isTwitching = true;
            gib.twitchTimer = 120 + Math.floor(Math.random() * 60); // 2-3 seconds
            gib.twitchIntensity = 0.3 + Math.random() * 0.3;
        }
        
        return gib;
    }

    updateGibVerlet(gib, engine) {
    const vel = gib.position.clone().sub(gib.prevPosition);

    gib.prevPosition.copy(gib.position);
    gib.position.add(vel);
    gib.position.y -= 0.02;

    // Rotational inertia stays the same
    gib.rotation.x += gib.rotationVelocity.x;
    gib.rotation.y += gib.rotationVelocity.y;

    // Ground interaction
    const ground = engine.getTerrainHeight(gib.position.x, gib.position.z) + 0.2;

    if (gib.position.y < ground) {
        gib.position.y = ground;

        vel.multiplyScalar(0.4);
        gib.prevPosition.copy(gib.position.clone().sub(vel));

        // Smear logic
        if (vel.length() > 0.1) {
            this.createGibTrail(gib.position.clone());
        }
    }
}

    
    // ===================================
    // GIB BLOOD TRAIL
    // ===================================
    createGibTrail(position) {
        const trailGeo = new THREE.CircleGeometry(0.2, 6);
        const trailMat = new THREE.MeshBasicMaterial({ 
            color: 0x8B0000,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const trail = new THREE.Mesh(trailGeo, trailMat);
        trail.rotation.x = -Math.PI / 2;
        trail.position.copy(position);
        trail.position.y = this.engine.getTerrainHeight(position.x, position.z) + 0.01;
        trail.lifetime = 8000; // Long lasting trails
        trail.isPermanent = true;
        
        this.engine.scene.add(trail);
        this.blood.push(trail);
    }
    
    // ===================================
    // UPDATE PHYSICS
    // ===================================
    update(engine) {
        // Update blood particles
        for (let i = this.blood.length - 1; i >= 0; i--) {
            const particle = this.blood[i];
            
            if (particle.lifetime !== undefined && !particle.isPermanent) {
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
                    if (!particle.isPermanent && particle.lifetime > 1500) {
                        particle.lifetime = 1500;
                    }
                }
            }
        }
        
        // Update blood mist
        for (let i = this.mist.length - 1; i >= 0; i--) {
            const particle = this.mist[i];
            
            particle.lifetime--;
            if (particle.lifetime <= 0) {
                engine.scene.remove(particle);
                this.mist.splice(i, 1);
                continue;
            }
            
            // Fade out
            if (particle.material.opacity > 0) {
                particle.material.opacity = (particle.lifetime / 800) * 0.4;
            }
            
            // Slow drift
            if (particle.velocity) {
                particle.position.add(particle.velocity);
                particle.velocity.multiplyScalar(0.98); // Slow down
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
            
            // Twitching effect
            if (gib.isTwitching && gib.twitchTimer > 0) {
                gib.twitchTimer--;
                
                // Random twitching
                if (Math.random() < 0.1) {
                    gib.rotation.x += (Math.random() - 0.5) * gib.twitchIntensity;
                    gib.rotation.z += (Math.random() - 0.5) * gib.twitchIntensity;
                }
                
                if (gib.twitchTimer === 0) {
                    gib.isTwitching = false;
                }
            }
            
            // Physics
            if (gib.velocity && gib.velocity.length() > 0.01) {
                gib.position.add(gib.velocity);
                gib.velocity.y -= 0.015; // Gravity
                
                // Tumbling rotation
                gib.rotation.x += gib.rotationVelocity.x;
                gib.rotation.y += gib.rotationVelocity.y;
                gib.rotation.z += gib.rotationVelocity.z;
                
                // Blood trail from fast-moving gibs
                if (gib.hasTrail && gib.velocity.length() > 0.1 && Math.random() < 0.3) {
                    this.createGibTrail(gib.position.clone());
                }
                
                // Ground collision
                const groundLevel = engine.getTerrainHeight(gib.position.x, gib.position.z);
                if (gib.position.y < groundLevel + 0.2) {
                    gib.position.y = groundLevel + 0.2;
                    gib.velocity.y *= -0.3; // Bounce (dampened)
                    gib.velocity.x *= 0.5; // Friction
                    gib.velocity.z *= 0.5;
                    gib.rotationVelocity.multiplyScalar(0.5);
                    
                    // Create splat on landing
                    if (gib.velocity.length() > 0.2) {
                        this.createPermanentBloodStain(gib.position.clone(), 0.5 + Math.random() * 0.5);
                    }
                    
                    // Come to rest
                    if (Math.abs(gib.velocity.y) < 0.08) {
                        gib.velocity.set(0, 0, 0);
                        gib.rotationVelocity.set(0, 0, 0);
                        gib.hasTrail = false;
                    }
                }
            }
        }
    }
    
    // ===================================
    // MASSIVE SPLATTER (ULTIMATE GORE)
    // ===================================
    createMassiveSplatter(position, velocity) {
        // Update combo
        const comboMultiplier = this.updateCombo();
        
        // Screen effects
        this.createLensSplatter(comboMultiplier);
        
        // 3D gore effects
        this.createBloodSplatter(position, velocity, 200 * comboMultiplier);
        this.createArterialSpray(position, velocity, comboMultiplier);
        this.createBloodMist(position, 3 * comboMultiplier);
        this.createBloodPool(position, 2 + comboMultiplier * 0.5);
        this.createGibs(position, velocity, 8 + comboMultiplier * 2);
        
        // Permanent stains
        for (let i = 0; i < 3 * comboMultiplier; i++) {
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            );
            this.createPermanentBloodStain(
                position.clone().add(offset),
                0.5 + Math.random() * 1
            );
        }
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
        
        // Remove all mist
        for (let particle of this.mist) {
            this.engine.scene.remove(particle);
        }
        this.mist = [];
        
        // Remove all gibs
        for (let gib of this.gibs) {
            this.engine.scene.remove(gib);
        }
        this.gibs = [];
        
        // Reset combo
        this.combo = 0;
        this.lastKillTime = 0;
        
        console.log('🩸 ULTRA Gore cleared');
    }
}
