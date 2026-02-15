// ============================================
// GORE TRACKER MODULE - Paste this at the top of your existing HTML
// ============================================

const GORE = {
    enabled: true,
    
    // Easy artist controls
    scale: 1.0,                    // Body size (1.0 = realistic human)
    severSpeed: 15,                // m/s needed to sever limbs
    explodeSpeed: 30,              // m/s for catastrophic dismemberment
    damageSpeed: 8,                // m/s to start taking damage
    
    // Damage multipliers
    headMultiplier: 3.0,
    torsoMultiplier: 1.0,
    limbMultiplier: 0.7,
    
    // Visual
    showDamageLog: true,
    bloodParticles: true
};

class GoreSystem {
    constructor() {
        this.ragdolls = new Map();      // Track all ragdolls
        this.bodyVelocities = new Map(); // Track velocities
        this.lastPositions = new Map();  // For velocity calculation
        this.severedJoints = new Set();  // Track what's been severed
        
        this.stats = {
            totalImpacts: 0,
            totalDismemberments: 0,
            totalDeaths: 0
        };
    }
    
    // Register a new ragdoll
    registerRagdoll(ragdollId, bodies, joints) {
        this.ragdolls.set(ragdollId, {
            bodies: bodies,
            joints: joints,
            health: 100,
            alive: true,
            created: Date.now()
        });
        
        // Initialize tracking for each body part
        for (let partName in bodies) {
            const bodyId = `${ragdollId}_${partName}`;
            this.bodyVelocities.set(bodyId, { speed: 0, vx: 0, vy: 0, vz: 0 });
        }
        
        if (GORE.showDamageLog) {
            console.log(`🎯 Registered ragdoll: ${ragdollId}`);
        }
    }
    
    // Update velocities (call this every frame)
    update(deltaTime = 0.016) {
        for (let [ragdollId, ragdoll] of this.ragdolls) {
            if (!ragdoll.alive) continue;
            
            for (let partName in ragdoll.bodies) {
                const body = ragdoll.bodies[partName];
                const bodyId = `${ragdollId}_${partName}`;
                
                // Get current position
                if (!body || !body.position) continue;
                
                const currentPos = {
                    x: body.position.x || 0,
                    y: body.position.y || 0,
                    z: body.position.z || 0
                };
                
                const lastPos = this.lastPositions.get(bodyId) || currentPos;
                
                // Calculate velocity
                const vx = (currentPos.x - lastPos.x) / deltaTime;
                const vy = (currentPos.y - lastPos.y) / deltaTime;
                const vz = (currentPos.z - lastPos.z) / deltaTime;
                const speed = Math.sqrt(vx*vx + vy*vy + vz*vz);
                
                // Store velocity
                this.bodyVelocities.set(bodyId, { speed, vx, vy, vz });
                this.lastPositions.set(bodyId, { ...currentPos });
            }
        }
    }
    
    // Handle collision/impact
    onImpact(ragdollId, partName, impactSpeed = null) {
        const ragdoll = this.ragdolls.get(ragdollId);
        if (!ragdoll || !ragdoll.alive) return;
        
        const bodyId = `${ragdollId}_${partName}`;
        
        // Get speed from tracking if not provided
        const velocityData = this.bodyVelocities.get(bodyId);
        const speed = impactSpeed || (velocityData ? velocityData.speed : 0);
        
        if (speed < GORE.damageSpeed) return; // Too slow to cause damage
        
        // Determine body zone
        const zone = this.getBodyZone(partName);
        const multiplier = this.getDamageMultiplier(zone);
        
        // Calculate damage
        const baseDamage = speed * 5;
        const actualDamage = baseDamage * multiplier;
        
        ragdoll.health -= actualDamage;
        this.stats.totalImpacts++;
        
        if (GORE.showDamageLog) {
            console.log(`💥 ${partName} impact: ${speed.toFixed(1)}m/s | dmg: ${actualDamage.toFixed(1)} | hp: ${ragdoll.health.toFixed(1)}`);
        }
        
        // Check for dismemberment
        if (speed >= GORE.severSpeed) {
            this.checkDismemberment(ragdollId, partName, speed);
        }
        
        // Check for death
        if (ragdoll.health <= 0 && ragdoll.alive) {
            ragdoll.alive = false;
            this.stats.totalDeaths++;
            
            if (GORE.showDamageLog) {
                console.log(`☠️ Ragdoll ${ragdollId} died! (${partName} impact)`);
            }
        }
        
        return {
            damage: actualDamage,
            speed: speed,
            isDead: !ragdoll.alive,
            health: ragdoll.health
        };
    }
    
    // Check if impact should cause dismemberment
    checkDismemberment(ragdollId, partName, speed) {
        const ragdoll = this.ragdolls.get(ragdollId);
        if (!ragdoll) return;
        
        // Find joints connected to this body part
        const connectedJoints = this.findConnectedJoints(ragdollId, partName);
        
        for (let jointName of connectedJoints) {
            const jointId = `${ragdollId}_${jointName}`;
            
            // Skip if already severed
            if (this.severedJoints.has(jointId)) continue;
            
            // Calculate if joint should break
            const breakThreshold = this.getJointBreakSpeed(jointName);
            
            if (speed >= breakThreshold) {
                this.severJoint(ragdollId, jointName, speed);
            }
        }
    }
    
    // Sever a joint
    severJoint(ragdollId, jointName, speed) {
        const jointId = `${ragdollId}_${jointName}`;
        
        if (this.severedJoints.has(jointId)) return false;
        
        this.severedJoints.add(jointId);
        this.stats.totalDismemberments++;
        
        const severity = speed >= GORE.explodeSpeed ? 'CATASTROPHIC' :
                        speed >= GORE.severSpeed + 10 ? 'SEVERE' : 'MODERATE';
        
        if (GORE.showDamageLog) {
            console.log(`🔪 ${jointName} severed! [${severity}] ${speed.toFixed(1)}m/s`);
        }
        
        if (GORE.bloodParticles) {
            const particleCount = severity === 'CATASTROPHIC' ? 50 : 
                                 severity === 'SEVERE' ? 30 : 15;
            console.log(`🩸 Blood spray: ${particleCount} particles at ${(speed * 0.3).toFixed(1)}m/s`);
        }
        
        return true;
    }
    
    // Helper: determine body zone
    getBodyZone(partName) {
        if (partName.includes('head')) return 'head';
        if (partName.includes('body')) return 'torso';
        return 'limb';
    }
    
    // Helper: get damage multiplier
    getDamageMultiplier(zone) {
        switch(zone) {
            case 'head': return GORE.headMultiplier;
            case 'torso': return GORE.torsoMultiplier;
            case 'limb': return GORE.limbMultiplier;
            default: return 1.0;
        }
    }
    
    // Helper: find joints connected to a body part
    findConnectedJoints(ragdollId, partName) {
        // Common joint mapping
        const jointMap = {
            'head': ['neck'],
            'body1': ['neck', 'spine', 'shoulderL', 'shoulderR'],
            'body2': ['spine', 'hipL', 'hipR'],
            'armL1': ['shoulderL', 'elbowL'],
            'armL2': ['elbowL'],
            'armR1': ['shoulderR', 'elbowR'],
            'armR2': ['elbowR'],
            'legL1': ['hipL', 'kneeL'],
            'legL2': ['kneeL'],
            'legR1': ['hipR', 'kneeR'],
            'legR2': ['kneeR']
        };
        
        return jointMap[partName] || [];
    }
    
    // Helper: get speed needed to break a joint
    getJointBreakSpeed(jointName) {
        const breakSpeeds = {
            'neck': GORE.severSpeed + 5,      // 20 m/s
            'spine': GORE.severSpeed + 10,    // 25 m/s
            'shoulderL': GORE.severSpeed,     // 15 m/s
            'shoulderR': GORE.severSpeed,
            'elbowL': GORE.severSpeed - 2,    // 13 m/s
            'elbowR': GORE.severSpeed - 2,
            'hipL': GORE.severSpeed + 3,      // 18 m/s
            'hipR': GORE.severSpeed + 3,
            'kneeL': GORE.severSpeed,
            'kneeR': Gore.severSpeed
        };
        
        return breakSpeeds[jointName] || GORE.severSpeed;
    }
    
    // Check if a joint is severed
    isJointSevered(ragdollId, jointName) {
        return this.severedJoints.has(`${ragdollId}_${jointName}`);
    }
    
    // Get ragdoll status
    getRagdollStatus(ragdollId) {
        const ragdoll = this.ragdolls.get(ragdollId);
        if (!ragdoll) return null;
        
        return {
            health: ragdoll.health,
            alive: ragdoll.alive,
            dismemberments: Array.from(this.severedJoints)
                .filter(j => j.startsWith(ragdollId))
                .length
        };
    }
    
    // Get all stats
    getStats() {
        return {
            ...this.stats,
            activeRagdolls: Array.from(this.ragdolls.values())
                .filter(r => r.alive).length,
            totalRagdolls: this.ragdolls.size
        };
    }
}

// Create global gore system
const gore = new GoreSystem();

// Auto-update loop (call this in your main loop or let it run)
let lastGoreUpdate = Date.now();
function updateGoreSystem() {
    const now = Date.now();
    const dt = (now - lastGoreUpdate) / 1000;
    lastGoreUpdate = now;
    
    gore.update(dt);
    requestAnimationFrame(updateGoreSystem);
}

// Start the gore update loop
setTimeout(() => {
    updateGoreSystem();
    console.log('🩸 GORE SYSTEM ONLINE');
}, 500);
