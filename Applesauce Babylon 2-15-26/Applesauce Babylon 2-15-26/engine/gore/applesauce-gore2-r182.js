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
    
    
    // ===================================
    // ARTERIAL BLOOD SPRAY
    // ===================================
    createArterialSpray(position, direction, intensity = 10) {
        const sprayCount = Math.floor(40 * intensity);
        
        for (let i = 0; i < sprayCount; i++) {
            const size = 0.15 + Math.random() * 0.3;
            const geo = new THREE.SphereGeometry(size, 4, 4);
            const mat = new THREE.MeshBasicMaterial({ color: 0xAA0000 });
            const particle = new THREE.Mesh(geo, mat);
            
            particle.position.copy(position);
            
            // Spray in the impact direction with spread
            const spread = 0.3;
            particle.velocity = new THREE.Vector3(
                direction.x + (Math.random() - 0.5) * spread,
                0.3 + Math.random() * 0.4,
                direction.z + (Math.random() - 0.5) * spread
            ).multiplyScalar(0.4 * intensity);
            
            particle.lifetime = 2000;
            particle.castShadow = true;
            particle.arterial = true;
            
            this.engine.scene.add(particle);
            this.blood.push(particle);
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
    // CONVERT BLOOD PARTICLE TO POOL
    // Called when blood stops moving in a valley
    // ===================================
    convertToPool(particle, engine) {
        if (!particle || particle.isPool) return;
        
        particle.isPool = true;
        
        // Make it flat and terrain-conforming
        const terrainModule = engine.modules.terrain;
        if (terrainModule) {
            const px = particle.position.x;
            const pz = particle.position.z;
            
            // Sample terrain to conform pool to ground
            const groundHeight = terrainModule.getHeight(px, pz);
            particle.position.y = groundHeight + 0.01;
            
            // Flatten the particle geometry
            if (particle.geometry && particle.geometry.type === 'SphereGeometry') {
                // Replace sphere with flat circle
                particle.geometry.dispose();
                particle.geometry = new THREE.CircleGeometry(particle.scale.x * 0.3, 8);
            }
            
            // Rotate to lay flat
            particle.rotation.x = -Math.PI / 2;
            
            // Darken the blood as it pools
            if (particle.material) {
                particle.material.color.set(0x4A0000);
                particle.material.opacity = 0.8;
            }
        }
    }
    
    // ===================================
    // TERRAIN-AWARE BLOOD POOL
    // Conforms to terrain and pools in valleys
    // ===================================
    createBloodPool(position, size = 2) {
        const terrainModule = this.engine.modules.terrain;
        
        if (!terrainModule) {
            // Fallback to simple pool
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
            pool.lifetime = 100000;
            pool.isPermanent = true;
            
            this.blood.push(pool);
            this.engine.scene.add(pool);
            return;
        }
        
        // ===================================
        // ENHANCED TERRAIN-CONFORMING POOL
        // ===================================
        
        // Sample terrain around pool center
        const px = position.x;
        const pz = position.z;
        const sampleRadius = size * 0.5;
        
        // Check if we're in a valley (accumulation point)
        const hCenter = terrainModule.getHeight(px, pz);
        const hNorth = terrainModule.getHeight(px, pz + sampleRadius);
        const hSouth = terrainModule.getHeight(px, pz - sampleRadius);
        const hEast = terrainModule.getHeight(px + sampleRadius, pz);
        const hWest = terrainModule.getHeight(px - sampleRadius, pz);
        
        // Calculate if this is a low spot (valley/depression)
        const avgSurroundingHeight = (hNorth + hSouth + hEast + hWest) / 4;
        const isValley = hCenter < avgSurroundingHeight;
        
        // Larger pools in valleys (blood accumulates)
        const poolSize = isValley ? size * 1.3 : size;
        
        // Create pool geometry
        const poolGeo = new THREE.CircleGeometry(poolSize, 24); // More segments for terrain conforming
        
        // Calculate terrain slope for pool rotation
        const slopeX = (hEast - hWest) / (sampleRadius * 2);
        const slopeZ = (hNorth - hSouth) / (sampleRadius * 2);
        
        const poolMat = new THREE.MeshBasicMaterial({ 
            color: isValley ? 0x550000 : 0x660000, // Darker in valleys
            transparent: true,
            opacity: isValley ? 0.85 : 0.7, // More opaque in valleys
            side: THREE.DoubleSide
        });
        
        const pool = new THREE.Mesh(poolGeo, poolMat);
        
        // Rotate to match terrain slope
        pool.rotation.x = -Math.PI / 2 + Math.atan(slopeZ);
        pool.rotation.z = Math.atan(slopeX);
        
        pool.position.copy(position);
        pool.position.y = hCenter + 0.02;
        pool.lifetime = 100000; // Permanent
        pool.isPermanent = true;
        pool.isValley = isValley;
        pool.poolSize = poolSize;
        
        this.blood.push(pool);
        this.engine.scene.add(pool);
        
        // Create additional pooling effect in valleys
        if (isValley) {
            // Add extra small pools around the main one
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                const offsetDist = poolSize * 0.6;
                const offsetX = Math.cos(angle) * offsetDist;
                const offsetZ = Math.sin(angle) * offsetDist;
                
                this.createSmallPool(
                    new THREE.Vector3(px + offsetX, 0, pz + offsetZ),
                    poolSize * 0.4
                );
            }
        }
    }
    
    // ===================================
    // SMALL BLOOD POOL (FOR ACCUMULATION)
    // ===================================
    createSmallPool(position, size = 0.5) {
        const terrainModule = this.engine.modules.terrain;
        if (!terrainModule) return;
        
        const groundHeight = terrainModule.getHeight(position.x, position.z);
        
        const poolGeo = new THREE.CircleGeometry(size, 12);
        const poolMat = new THREE.MeshBasicMaterial({ 
            color: 0x4A0000,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const pool = new THREE.Mesh(poolGeo, poolMat);
        pool.rotation.x = -Math.PI / 2;
        pool.position.set(position.x, groundHeight + 0.015, position.z);
        pool.lifetime = 100000;
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
        // ===================================
        // ENHANCED BLOOD PARTICLE PHYSICS
        // Terrain-aware with slope flow
        // ===================================
        for (let i = this.blood.length - 1; i >= 0; i--) {
            const particle = this.blood[i];
            
            // Lifetime management
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
            
            // ===================================
            // TERRAIN-AWARE BLOOD PHYSICS
            // ===================================
            if (particle.velocity) {
                // Apply gravity
                particle.velocity.y -= 0.015;
                
                // Move particle
                particle.position.add(particle.velocity);
                
                // Multi-point terrain sampling (like skateboard system)
                const terrainModule = engine.modules.terrain;
                if (terrainModule) {
                    const px = particle.position.x;
                    const pz = particle.position.z;
                    const sampleRadius = 0.3; // Small radius for blood droplets
                    
                    // Sample 5 points around the particle
                    const hCenter = terrainModule.getHeight(px, pz);
                    const hFront = terrainModule.getHeight(px, pz + sampleRadius);
                    const hBack = terrainModule.getHeight(px, pz - sampleRadius);
                    const hLeft = terrainModule.getHeight(px - sampleRadius, pz);
                    const hRight = terrainModule.getHeight(px + sampleRadius, pz);
                    
                    // Use maximum height to prevent clipping
                    const groundLevel = Math.max(hCenter, hFront, hBack, hLeft, hRight);
                    
                    // ===================================
                    // TERRAIN SLOPE FLOW (BLOOD RUNS DOWNHILL)
                    // ===================================
                    if (particle.position.y <= groundLevel + 0.15) {
                        // Calculate terrain slope
                        const slopeX = (hRight - hLeft) / (sampleRadius * 2);
                        const slopeZ = (hFront - hBack) / (sampleRadius * 2);
                        
                        // Blood flows downhill!
                        const flowStrength = 0.008; // How fast blood flows
                        particle.velocity.x -= slopeX * flowStrength;
                        particle.velocity.z -= slopeZ * flowStrength;
                        
                        // Apply friction when on ground
                        particle.velocity.multiplyScalar(0.92);
                    }
                    
                    // Ground collision with terrain awareness
                    if (particle.position.y < groundLevel + 0.1) {
                        particle.position.y = groundLevel + 0.1;
                        
                        // Heavy friction on impact
                        particle.velocity.multiplyScalar(0.3);
                        
                        // Stop vertical velocity
                        if (particle.velocity.y < 0) {
                            particle.velocity.y = 0;
                        }
                    }
                    
                    // ===================================
                    // POOLING BEHAVIOR
                    // Blood stops and pools in low spots
                    // ===================================
                    if (particle.position.y < groundLevel + 0.15 && particle.velocity.length() < 0.02) {
                        // Check if we're in a valley (surrounded by higher terrain)
                        const isInValley = (hFront > hCenter && hBack > hCenter) ||
                                          (hLeft > hCenter && hRight > hCenter);
                        
                        // Become a pool in valleys
                        if (isInValley || particle.velocity.length() < 0.01) {
                            particle.velocity = null; // Stops moving
                            
                            // Convert to permanent pool
                            if (!particle.isPool) {
                                this.convertToPool(particle, engine);
                            }
                            
                            // Shorten lifetime for regular particles
                            if (!particle.isPermanent && particle.lifetime > 1500) {
                                particle.lifetime = 1500;
                            }
                        }
                    }
                } else {
                    // Fallback if terrain module not available
                    const groundLevel = engine.getTerrainHeight(particle.position.x, particle.position.z);
                    if (particle.position.y < groundLevel + 0.1) {
                        particle.position.y = groundLevel + 0.1;
                        particle.velocity.multiplyScalar(0.3);
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
