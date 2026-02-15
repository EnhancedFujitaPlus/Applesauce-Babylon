/**
 * APPLESAUCE Hybrid Gore Manager
 * Intelligent system that uses Verlet for important kills and Traditional for performance
 * Skating-focused collision and trick detection
 */

import * as THREE from './three.module.js';
import { ApplesauceGore } from './applesauce-gore1-r182.js';
import { VerletGoreSystem } from './applesauce-verlet-gore-test.js';

export class HybridGoreManager {
    constructor(engine) {
        this.engine = engine;
        
        // Both gore systems available
        this.traditionalGore = new ApplesauceGore(engine);
        this.verletGore = new VerletGoreSystem(engine, this.traditionalGore);
        
        // Skating-specific state
        this.comboActive = false;
        this.comboMultiplier = 1;
        this.lastTrickTime = 0;
        this.trickTimeout = 3000; // 3 seconds
        
        // Performance monitoring
        this.verletGibCount = 0;
        this.maxVerletGibs = 15; // Performance limit
        this.frameTime = 0;
        this.performanceMode = 'auto'; // 'auto', 'verlet', 'traditional'
        
        // Kill tracking
        this.killTypes = {
            combo: 0,      // Use Verlet - earned it!
            trick: 0,      // Use Verlet - stylish
            grind: 0,      // Use Verlet - satisfying
            impact: 0,     // Use Verlet - brutal
            ambient: 0     // Use Traditional - just cleanup
        };
        
        console.log('🎮 Hybrid Gore Manager initialized');
        console.log('💀 Verlet for important kills, Traditional for performance');
    }

    // ===================================
    // SKATING COLLISION DETECTION
    // ===================================

    /**
     * Handle skater collision with enemy/obstacle
     * Returns gore intensity and type
     */
    detectSkaterCollision(skater, target, collisionData = {}) {
        const {
            velocity = new THREE.Vector3(),
            contactPoint = new THREE.Vector3(),
            contactNormal = new THREE.Vector3(0, 1, 0),
            isGrinding = false,
            isTricking = false,
            airTime = 0
        } = collisionData;

        const speed = velocity.length();
        const impactForce = this._calculateImpactForce(speed, skater, target);
        
        // Determine collision type
        const collisionType = this._classifyCollision({
            speed,
            isGrinding,
            isTricking,
            airTime,
            impactForce,
            normal: contactNormal
        });

        // Update combo status
        this._updateCombo(collisionType);

        // Return gore configuration
        return {
            type: collisionType,
            useVerlet: this._shouldUseVerlet(collisionType, impactForce),
            intensity: this._calculateIntensity(collisionType, impactForce),
            position: contactPoint,
            velocity: velocity,
            direction: contactNormal,
            comboMultiplier: this.comboMultiplier
        };
    }

    _classifyCollision(data) {
        const { speed, isGrinding, isTricking, airTime, impactForce, normal } = data;

        // GRIND KILL - skating on enemy
        if (isGrinding) {
            return 'grind';
        }

        // TRICK KILL - landed a trick on them
        if (isTricking || airTime > 0.5) {
            return 'trick';
        }

        // COMBO KILL - multiple kills in succession
        if (this.comboActive && this.comboMultiplier > 1) {
            return 'combo';
        }

        // HIGH IMPACT - brutal collision
        if (impactForce > 15 || speed > 8) {
            return 'impact';
        }

        // AMBIENT - just ran into them
        return 'ambient';
    }

    _calculateImpactForce(speed, skater, target) {
        const skaterMass = skater.mass || 75; // kg (skater + board)
        const targetMass = target.mass || 70; // kg
        
        // F = ma (simplified)
        const relativeSpeed = speed;
        const reducedMass = (skaterMass * targetMass) / (skaterMass + targetMass);
        
        return reducedMass * relativeSpeed;
    }

    _calculateIntensity(collisionType, impactForce) {
        const baseIntensity = {
            'grind': 2.0,      // Constant grinding damage
            'trick': 2.5,      // Stylish = extra gore
            'combo': 3.0,      // Combo = massive gore
            'impact': 1.5,     // Speed-based
            'ambient': 1.0     // Minimal
        };

        let intensity = baseIntensity[collisionType] || 1.0;
        
        // Scale impact-based kills by force
        if (collisionType === 'impact') {
            intensity *= Math.min(impactForce / 10, 3.0);
        }
        
        // Combo multiplier
        intensity *= this.comboMultiplier;
        
        return Math.min(intensity, 5.0); // Cap at 5x
    }

    _shouldUseVerlet(collisionType, impactForce) {
        // Performance check - don't create more Verlet gibs if at limit
        if (this.verletGibCount >= this.maxVerletGibs) {
            return false;
        }

        // Force traditional mode
        if (this.performanceMode === 'traditional') {
            return false;
        }

        // Force verlet mode
        if (this.performanceMode === 'verlet') {
            return true;
        }

        // Auto mode - use Verlet for important kills
        switch(collisionType) {
            case 'grind':
                return true; // Grind kills are always satisfying
            case 'trick':
                return true; // Trick kills deserve Verlet
            case 'combo':
                return true; // Combo kills are earned
            case 'impact':
                return impactForce > 20; // Only high-impact gets Verlet
            case 'ambient':
                return false; // Never waste Verlet on ambient kills
            default:
                return false;
        }
    }

    _updateCombo(collisionType) {
        const now = Date.now();
        
        // Check if combo expired
        if (now - this.lastTrickTime > this.trickTimeout) {
            this.comboActive = false;
            this.comboMultiplier = 1;
        }

        // Update combo for important kills
        if (collisionType !== 'ambient') {
            this.comboActive = true;
            this.comboMultiplier = Math.min(this.comboMultiplier + 0.5, 5.0);
            this.lastTrickTime = now;
        }
    }

    // ===================================
    // SPECIALIZED SKATING GORE METHODS
    // ===================================

    /**
     * GRIND DAMAGE - Continuous damage while grinding on enemy
     */
    createGrindGore(position, grindDirection, speed) {
        this.killTypes.grind++;
        
        if (this._shouldUseVerlet('grind', speed * 2)) {
            // Verlet blade cut along grind direction
            const cutWidth = 0.3;
            const force = Math.min(speed * 2, 10);
            
            const results = this.verletGore.applyBladeCut(
                position,
                grindDirection,
                force,
                cutWidth
            );
            
            // Blood spray from the cut
            this.traditionalGore.createArterialSpray(
                position,
                grindDirection.clone().multiplyScalar(0.5),
                2
            );

            this.verletGibCount += results.length;
            
            return results;
        } else {
            // Traditional - quick blood spray
            this.traditionalGore.createBloodSplatter(
                position,
                grindDirection,
                50
            );
        }
    }

    /**
     * TRICK LANDING - Vertical impact from landing trick
     */
    createTrickLandingGore(position, velocity, trickName = 'kickflip') {
        this.killTypes.trick++;
        
        const impactForce = velocity.y * -1; // Downward force
        
        if (this._shouldUseVerlet('trick', impactForce)) {
            // Verlet crush damage
            const crushResults = this.verletGore.applyCrush(
                position,
                impactForce * 2,
                0.8
            );
            
            // Massive blood spray upward
            this.traditionalGore.createBloodMist(position, 3 * this.comboMultiplier);
            this.traditionalGore.createBloodSplatter(
                position,
                new THREE.Vector3(0, 1, 0),
                100 * this.comboMultiplier
            );
            
            // Show trick name with blood flash
            this.traditionalGore.createLensSplatter(this.comboMultiplier);
            
            this.verletGibCount += crushResults.length;
            
            return crushResults;
        } else {
            // Traditional impact
            this.traditionalGore.createMassiveSplatter(position, velocity);
        }
    }

    /**
     * COMBO KILL - Extra brutal for combo chains
     */
    createComboGore(position, velocity, comboCount) {
        this.killTypes.combo++;
        
        if (this._shouldUseVerlet('combo', comboCount * 5)) {
            // Create Verlet gib that will be torn apart
            const gib = this.verletGore.createVerletGib(
                position,
                velocity,
                'chunk',
                0.8 + (comboCount * 0.1)
            );
            
            // Apply multiple weapon hits for ultra destruction
            setTimeout(() => {
                this.verletGore.applyExplosion(position, 15 * comboCount, 2.0);
            }, 50);
            
            // Massive blood effects
            this.traditionalGore.createBloodMist(position, 5 * this.comboMultiplier);
            this.traditionalGore.createArterialSpray(
                position,
                velocity,
                5 * this.comboMultiplier
            );
            
            this.verletGibCount++;
            
            return gib;
        } else {
            // Traditional but scaled up
            for (let i = 0; i < comboCount; i++) {
                this.traditionalGore.createMassiveSplatter(
                    position.clone().add(new THREE.Vector3(
                        Math.random() - 0.5,
                        0,
                        Math.random() - 0.5
                    )),
                    velocity
                );
            }
        }
    }

    /**
     * BOARD IMPACT - Skateboard hits enemy
     */
    createBoardImpactGore(position, boardVelocity, hitType = 'swing') {
        this.killTypes.impact++;
        
        const force = boardVelocity.length() * 5; // Board hits hard
        
        if (this._shouldUseVerlet('impact', force)) {
            if (hitType === 'edge') {
                // Board edge = blade cut
                this.verletGore.applyBladeCut(
                    position,
                    boardVelocity.clone().normalize(),
                    force,
                    0.2
                );
            } else {
                // Board swing = blunt impact
                this.verletGore.applyCrush(position, force * 0.8, 0.5);
            }
            
            this.verletGibCount++;
        }
        
        // Always add some blood
        this.traditionalGore.createBloodSplatter(
            position,
            boardVelocity,
            30 * this.comboMultiplier
        );
    }

    /**
     * WALL SPLAT - Enemy hits wall at high speed
     */
    createWallSplatGore(position, velocity, wallNormal) {
        this.killTypes.impact++;
        
        const splatForce = velocity.length() * 2;
        
        if (this._shouldUseVerlet('impact', splatForce)) {
            // Compress against wall
            this.verletGore.applyCrush(position, splatForce, 1.0);
            
            // Sliding gore as they fall down wall
            const slideGib = this.verletGore.createVerletGib(
                position,
                new THREE.Vector3(0, -1, 0),
                'chunk',
                0.6
            );
            
            this.verletGibCount++;
        } else {
            // Traditional wall splat
            this.traditionalGore.createBloodSplatter(
                position,
                wallNormal.clone().negate(),
                100
            );
            
            // Blood trail down wall
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    this.traditionalGore.createPermanentBloodStain(
                        position.clone().add(new THREE.Vector3(0, -i * 0.2, 0)),
                        0.3
                    );
                }, i * 100);
            }
        }
    }

    /**
     * GRINDING RAIL/EDGE - Continuous damage source
     */
    createGrindTrailGore(startPos, endPos, grindType = 'rail') {
        // Sample points along the grind
        const sampleCount = 10;
        const step = endPos.clone().sub(startPos).divideScalar(sampleCount);
        
        for (let i = 0; i < sampleCount; i++) {
            const pos = startPos.clone().add(step.clone().multiplyScalar(i));
            
            // Create blood trail
            this.traditionalGore.createPermanentBloodStain(pos, 0.2 + Math.random() * 0.2);
            
            // Occasional gibs
            if (Math.random() < 0.3) {
                if (this.verletGibCount < this.maxVerletGibs) {
                    const gibVel = step.clone().normalize().multiplyScalar(2);
                    gibVel.y = Math.random() * 1;
                    
                    this.verletGore.createVerletGib(
                        pos,
                        gibVel,
                        'chunk',
                        0.3
                    );
                    this.verletGibCount++;
                } else {
                    // Traditional gib as fallback
                    this.traditionalGore.createGibs(pos, step, 2);
                }
            }
        }
    }

    // ===================================
    // WEAPON-BASED KILLS (for variety)
    // ===================================

    /**
     * Bullet kill - shooting while skating
     */
    createBulletKill(position, direction, caliber = 0.2) {
        const useVerlet = this._shouldUseVerlet('ambient', 10);
        
        if (useVerlet) {
            this.verletGore.applyBulletImpact(position, direction, 15, caliber);
            this.verletGibCount++;
        }
        
        this.traditionalGore.createArterialSpray(position, direction, 2);
    }

    /**
     * Explosion kill - explosive tricks
     */
    createExplosionKill(position, radius = 3.0) {
        const useVerlet = this._shouldUseVerlet('combo', 20);
        
        if (useVerlet) {
            this.verletGore.applyExplosion(position, 20, radius, true);
            this.verletGibCount += 5;
        }
        
        this.traditionalGore.createBloodMist(position, 5);
        this.traditionalGore.createMassiveSplatter(position, new THREE.Vector3(0, 2, 0));
    }

    // ===================================
    // PERFORMANCE MANAGEMENT
    // ===================================

    /**
     * Adaptive quality based on performance
     */
    updatePerformanceMode(deltaTime) {
        this.frameTime = deltaTime;
        
        // If running slow, reduce Verlet usage
        if (deltaTime > 33) { // Below 30 FPS
            this.maxVerletGibs = Math.max(5, this.maxVerletGibs - 1);
        } else if (deltaTime < 16 && this.maxVerletGibs < 20) { // Above 60 FPS
            this.maxVerletGibs++;
        }
        
        // Clean up old Verlet gibs if at limit
        if (this.verletGibCount >= this.maxVerletGibs) {
            this._cullOldestVerletGib();
        }
    }

    _cullOldestVerletGib() {
        if (this.verletGore.verletGibs.length > 0) {
            // Find oldest gib
            let oldest = this.verletGore.verletGibs[0];
            let oldestIndex = 0;
            
            for (let i = 1; i < this.verletGore.verletGibs.length; i++) {
                if (this.verletGore.verletGibs[i].lifetime < oldest.lifetime) {
                    oldest = this.verletGore.verletGibs[i];
                    oldestIndex = i;
                }
            }
            
            // Remove it
            if (oldest.mesh) {
                this.engine.scene.remove(oldest.mesh);
            }
            this.verletGore.verletGibs.splice(oldestIndex, 1);
            this.verletGibCount--;
        }
    }

    /**
     * Set performance mode manually
     */
    setPerformanceMode(mode) {
        if (['auto', 'verlet', 'traditional'].includes(mode)) {
            this.performanceMode = mode;
            console.log(`🎮 Performance mode: ${mode.toUpperCase()}`);
        }
    }

    // ===================================
    // UPDATE & CLEANUP
    // ===================================

    update(engine, deltaTime = 16) {
        // Update both systems
        this.traditionalGore.update(engine);
        this.verletGore.update(engine);
        
        // Performance management
        this.updatePerformanceMode(deltaTime);
        
        // Update actual count
        this.verletGibCount = this.verletGore.verletGibs.length;
    }

    clear() {
        this.traditionalGore.clear();
        this.verletGore.clear();
        this.verletGibCount = 0;
        
        // Reset stats
        for (let key in this.killTypes) {
            this.killTypes[key] = 0;
        }
        
        console.log('🎮 Hybrid Gore cleared');
    }

    // ===================================
    // DEBUG & STATS
    // ===================================

    getStats() {
        return {
            verletGibs: this.verletGore.verletGibs.length,
            traditionalGibs: this.traditionalGore.gibs.length,
            bloodParticles: this.traditionalGore.blood.length,
            maxVerletGibs: this.maxVerletGibs,
            performanceMode: this.performanceMode,
            killTypes: { ...this.killTypes },
            combo: this.comboMultiplier,
            frameTime: this.frameTime.toFixed(2)
        };
    }

    logStats() {
        const stats = this.getStats();
        console.log('🎮 HYBRID GORE STATS:');
        console.log(`  Verlet Gibs: ${stats.verletGibs}/${stats.maxVerletGibs}`);
        console.log(`  Traditional Gibs: ${stats.traditionalGibs}`);
        console.log(`  Blood Particles: ${stats.bloodParticles}`);
        console.log(`  Mode: ${stats.performanceMode}`);
        console.log(`  Frame Time: ${stats.frameTime}ms`);
        console.log('  Kills:', stats.killTypes);
        console.log(`  Combo: ${stats.combo}x`);
    }
}
