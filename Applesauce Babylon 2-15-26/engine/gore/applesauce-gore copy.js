/**
 * APPLESAUCE Hybrid Gore Module
 * Combines Verlet physics and Traditional systems
 * Drop-in replacement/upgrade for ApplesauceGore
 */

import * as THREE from './three.module.js';
import { ApplesauceGore } from './applesauce-gore1-r182.js';
import { VerletGoreSystem } from './applesauce-verlet-gore-test.js';

export class ApplesauceHybridGore {
    constructor(core) {
        this.core = core;
        
        // Initialize both gore systems
        this.traditional = new ApplesauceGore(core);
        this.verlet = new VerletGoreSystem(core, this.traditional);
        
        // Performance settings
        this.settings = {
            useVerlet: true,              // Master toggle for Verlet
            maxVerletGibs: 15,           // Performance limit
            autoPerformance: true,        // Automatically adjust based on FPS
            targetFPS: 30,               // Minimum acceptable FPS
            verletPriority: {            // When to use Verlet
                grind: true,
                trick: true,
                combo: true,
                impact: 'auto',          // Auto = based on force
                ambient: false
            }
        };
        
        // Performance tracking
        this.performance = {
            frameTime: 0,
            frameCount: 0,
            lastFPSCheck: Date.now()
        };
        
        // Combo tracking
        this.combo = {
            multiplier: 1.0,
            lastKillTime: 0,
            timeout: 3000  // 3 seconds
        };
        
        console.log('🩸 APPLESAUCE Hybrid Gore Module initialized');
        console.log('   ⚡ Verlet for important kills');
        console.log('   💨 Traditional for performance');
    }
    
    // ===================================
    // MODULE LIFECYCLE
    // ===================================
    
    init() {
        // Any initialization needed
        console.log('🩸 Hybrid Gore ready');
    }
    
    update(core) {
        // Update both systems
        this.traditional.update(core);
        this.verlet.update(core);
        
        // Performance monitoring
        if (this.settings.autoPerformance) {
            this.monitorPerformance();
        }
        
        // Combo decay
        this.updateCombo();
    }
    
    clear() {
        this.traditional.clear();
        this.verlet.clear();
        this.combo.multiplier = 1.0;
        
        console.log('🩸 Hybrid Gore cleared');
    }
    
    // ===================================
    // INTELLIGENT GORE SELECTION
    // ===================================
    
    shouldUseVerlet(killType, force = 1.0) {
        // Master toggle
        if (!this.settings.useVerlet) return false;
        
        // Performance check
        if (this.verlet.verletGibs.length >= this.settings.maxVerletGibs) {
            return false;
        }
        
        // Check priority settings
        const priority = this.settings.verletPriority[killType];
        
        if (priority === true) return true;
        if (priority === false) return false;
        if (priority === 'auto') {
            // Use Verlet for high-force impacts
            return force > 5.0;
        }
        
        return false;
    }
    
    // ===================================
    // COMBO SYSTEM
    // ===================================
    
    updateCombo() {
        const now = Date.now();
        if (now - this.combo.lastKillTime > this.combo.timeout) {
            this.combo.multiplier = Math.max(1.0, this.combo.multiplier - 0.01);
        }
    }
    
    increaseCombo(killType) {
        if (killType !== 'ambient') {
            this.combo.multiplier = Math.min(this.combo.multiplier + 0.5, 5.0);
            this.combo.lastKillTime = Date.now();
        }
    }
    
    // ===================================
    // SKATING-SPECIFIC GORE METHODS
    // ===================================
    
    /**
     * Grind kill gore - blade cut along grind direction
     */
    createGrindGore(position, direction, speed) {
        const useVerlet = this.shouldUseVerlet('grind', speed * 2);
        
        if (useVerlet) {
            // Verlet blade cut
            this.verlet.applyBladeCut(
                position,
                direction.clone().normalize(),
                Math.min(speed * 2, 10),
                0.3
            );
        }
        
        // Always add traditional blood effects
        this.traditional.createArterialSpray(
            position,
            direction.clone().normalize(),
            2 * this.combo.multiplier
        );
        
        this.traditional.createBloodSplatter(
            position,
            direction,
            50 * this.combo.multiplier
        );
    }
    
    /**
     * Trick landing gore - crushing impact
     */
    createTrickLandingGore(position, velocity, trickName = '') {
        const force = Math.abs(velocity.y) * 5;
        const useVerlet = this.shouldUseVerlet('trick', force);
        
        if (useVerlet) {
            // Verlet crush
            this.verlet.applyCrush(
                position,
                force * 2,
                0.8
            );
        }
        
        // Traditional effects
        this.traditional.createBloodMist(position, 3 * this.combo.multiplier);
        this.traditional.createBloodSplatter(
            position,
            new THREE.Vector3(0, 2, 0),
            100 * this.combo.multiplier
        );
        
        // Screen effects for combos
        if (this.combo.multiplier > 1) {
            this.traditional.createLensSplatter(this.combo.multiplier);
        }
    }
    
    /**
     * Combo kill gore - ultra brutal
     */
    createComboGore(position, velocity, comboCount) {
        const useVerlet = this.shouldUseVerlet('combo', comboCount * 5);
        
        if (useVerlet) {
            // Create Verlet gib that will be torn apart
            const gib = this.verlet.createVerletGib(
                position,
                velocity,
                'chunk',
                0.8 + (comboCount * 0.1)
            );
            
            // Explosion after brief delay
            setTimeout(() => {
                this.verlet.applyExplosion(position, 15 * comboCount, 2.0);
            }, 50);
        }
        
        // Massive traditional effects
        for (let i = 0; i < Math.min(comboCount, 5); i++) {
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            );
            
            this.traditional.createMassiveSplatter(
                position.clone().add(offset),
                velocity
            );
        }
        
        this.traditional.createBloodMist(position, 5 * this.combo.multiplier);
    }
    
    /**
     * Impact gore - high-speed collision
     */
    createImpactGore(position, velocity, speed) {
        const useVerlet = this.shouldUseVerlet('impact', speed);
        
        if (useVerlet) {
            // Verlet impact with directional force
            const direction = velocity.clone().normalize();
            this.verlet.applyBulletImpact(
                position,
                direction,
                speed * 3,
                0.5
            );
        }
        
        // Traditional effects
        this.traditional.createArterialSpray(
            position,
            velocity.clone().normalize(),
            4
        );
        
        this.traditional.createBloodSplatter(
            position,
            velocity,
            120
        );
        
        this.traditional.createGibs(position, velocity, 8);
    }
    
    /**
     * Board swing gore - blunt weapon impact
     */
    createBoardImpactGore(position, velocity, hitType = 'swing') {
        const force = velocity.length() * 5;
        const useVerlet = this.shouldUseVerlet('impact', force);
        
        if (useVerlet) {
            if (hitType === 'edge') {
                // Board edge = blade cut
                this.verlet.applyBladeCut(
                    position,
                    velocity.clone().normalize(),
                    force,
                    0.2
                );
            } else {
                // Blunt impact
                this.verlet.applyCrush(position, force * 0.8, 0.5);
            }
        }
        
        // Traditional blood
        this.traditional.createBloodSplatter(
            position,
            velocity,
            60 * this.combo.multiplier
        );
    }
    
    /**
     * Grind trail gore - continuous damage along grind
     */
    createGrindTrailGore(startPos, endPos) {
        const sampleCount = 10;
        const step = endPos.clone().sub(startPos).divideScalar(sampleCount);
        
        for (let i = 0; i < sampleCount; i++) {
            const pos = startPos.clone().add(step.clone().multiplyScalar(i));
            
            // Blood trail
            this.traditional.createPermanentBloodStain(
                pos,
                0.2 + Math.random() * 0.2
            );
            
            // Occasional small gibs
            if (Math.random() < 0.3) {
                const gibVel = step.clone().normalize().multiplyScalar(2);
                gibVel.y = Math.random();
                
                if (this.verlet.verletGibs.length < this.settings.maxVerletGibs) {
                    this.verlet.createVerletGib(pos, gibVel, 'chunk', 0.3);
                } else {
                    this.traditional.createGibs(pos, gibVel, 2);
                }
            }
        }
    }
    
    // ===================================
    // WEAPON-BASED GORE
    // ===================================
    
    /**
     * Bullet impact gore
     */
    createBulletKill(position, direction, caliber = 0.2) {
        const useVerlet = this.shouldUseVerlet('impact', 10);
        
        if (useVerlet) {
            this.verlet.applyBulletImpact(
                position,
                direction,
                15,
                caliber
            );
        }
        
        this.traditional.createArterialSpray(position, direction, 2);
    }
    
    /**
     * Explosion gore
     */
    createExplosionKill(position, radius = 3.0) {
        const useVerlet = this.shouldUseVerlet('combo', 20);
        
        if (useVerlet) {
            this.verlet.applyExplosion(position, 20, radius, true);
        }
        
        this.traditional.createBloodMist(position, 5);
        this.traditional.createMassiveSplatter(
            position,
            new THREE.Vector3(0, 2, 0)
        );
    }
    
    /**
     * Shotgun blast gore
     */
    createShotgunBlast(position, direction, pelletCount = 12) {
        const useVerlet = this.shouldUseVerlet('impact', 15);
        
        if (useVerlet) {
            this.verlet.applyShotgunBlast(position, direction, pelletCount, 0.3, 10);
        }
        
        // Traditional effects
        for (let i = 0; i < pelletCount; i++) {
            const spread = direction.clone();
            spread.x += (Math.random() - 0.5) * 0.3;
            spread.y += (Math.random() - 0.5) * 0.3;
            spread.z += (Math.random() - 0.5) * 0.3;
            spread.normalize();
            
            this.traditional.createBloodSplatter(position, spread, 20);
        }
    }
    
    // ===================================
    // BACKWARDS COMPATIBILITY
    // (Methods from original ApplesauceGore)
    // ===================================
    
    /**
     * Original createMassiveSplatter - enhanced with hybrid
     */
    createMassiveSplatter(position, velocity) {
        // Use original implementation but with potential Verlet upgrade
        const useVerlet = this.shouldUseVerlet('ambient', velocity.length());
        
        if (useVerlet) {
            this.verlet.createVerletGib(position, velocity, 'chunk', 0.8);
        }
        
        // Always call traditional for consistent behavior
        this.traditional.createMassiveSplatter(position, velocity);
    }
    
    // Proxy other traditional gore methods for backwards compatibility
    createArterialSpray(position, direction, intensity) {
        return this.traditional.createArterialSpray(position, direction, intensity);
    }
    
    createBloodSplatter(position, velocity, count) {
        return this.traditional.createBloodSplatter(position, velocity, count);
    }
    
    createBloodMist(position, intensity) {
        return this.traditional.createBloodMist(position, intensity);
    }
    
    createBloodPool(position, size) {
        return this.traditional.createBloodPool(position, size);
    }
    
    createGibs(position, velocity, count) {
        return this.traditional.createGibs(position, velocity, count);
    }
    
    createPermanentBloodStain(position, size) {
        return this.traditional.createPermanentBloodStain(position, size);
    }
    
    createLensSplatter(intensity) {
        return this.traditional.createLensSplatter(intensity);
    }
    
    updateCombo() {
        return this.traditional.updateCombo();
    }
    
    // ===================================
    // PERFORMANCE MANAGEMENT
    // ===================================
    
    monitorPerformance() {
        this.performance.frameCount++;
        const now = Date.now();
        const elapsed = now - this.performance.lastFPSCheck;
        
        if (elapsed >= 1000) {
            const fps = (this.performance.frameCount * 1000) / elapsed;
            
            // Adjust Verlet usage based on FPS
            if (fps < this.settings.targetFPS) {
                // Performance struggling - reduce Verlet
                this.settings.maxVerletGibs = Math.max(5, this.settings.maxVerletGibs - 1);
                console.log(`⚠️ Low FPS (${fps.toFixed(1)}) - reducing Verlet to ${this.settings.maxVerletGibs}`);
            } else if (fps > 50 && this.settings.maxVerletGibs < 20) {
                // Performance good - increase Verlet
                this.settings.maxVerletGibs++;
            }
            
            // Reset counters
            this.performance.frameCount = 0;
            this.performance.lastFPSCheck = now;
        }
    }
    
    /**
     * Manual performance mode control
     */
    setPerformanceMode(mode) {
        switch(mode) {
            case 'verlet':
                this.settings.useVerlet = true;
                this.settings.verletPriority = {
                    grind: true,
                    trick: true,
                    combo: true,
                    impact: true,
                    ambient: true
                };
                console.log('🩸 Performance: VERLET ONLY');
                break;
                
            case 'traditional':
                this.settings.useVerlet = false;
                console.log('🩸 Performance: TRADITIONAL ONLY');
                break;
                
            case 'auto':
            default:
                this.settings.useVerlet = true;
                this.settings.autoPerformance = true;
                this.settings.verletPriority = {
                    grind: true,
                    trick: true,
                    combo: true,
                    impact: 'auto',
                    ambient: false
                };
                console.log('🩸 Performance: AUTO (Hybrid)');
        }
    }
    
    // ===================================
    // STATS & DEBUG
    // ===================================
    
    getStats() {
        return {
            verletGibs: this.verlet.verletGibs.length,
            maxVerletGibs: this.settings.maxVerletGibs,
            traditionalGibs: this.traditional.gibs.length,
            bloodParticles: this.traditional.blood.length,
            combo: this.combo.multiplier,
            useVerlet: this.settings.useVerlet,
            autoPerformance: this.settings.autoPerformance
        };
    }
    
    logStats() {
        const stats = this.getStats();
        console.log('🩸 HYBRID GORE STATS:');
        console.log(`  Verlet Gibs: ${stats.verletGibs}/${stats.maxVerletGibs}`);
        console.log(`  Traditional Gibs: ${stats.traditionalGibs}`);
        console.log(`  Blood Particles: ${stats.bloodParticles}`);
        console.log(`  Combo: ${stats.combo.toFixed(1)}x`);
        console.log(`  Mode: ${stats.useVerlet ? 'HYBRID' : 'TRADITIONAL'}`);
    }
}
