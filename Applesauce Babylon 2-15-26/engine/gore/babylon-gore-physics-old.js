/**
 * APPLESAUCE Gore Physics - BABYLON.JS + HAVOK EDITION
 * Velocity-based damage and dismemberment using real Havok physics collisions
 */

export class BabylonGorePhysics {
    constructor(scene, config = {}) {
        console.log('🩸 Initializing Gore Physics (Havok)...');
        
        this.scene = scene;
        
        this.config = {
            enabled: config.enabled !== false,
            
            // Speed thresholds (m/s)
            damageThreshold: config.damageThreshold || 8,
            severThreshold: config.severThreshold || 15,
            explodeThreshold: config.explodeThreshold || 30,
            
            // Damage multipliers
            headMultiplier: config.headMultiplier || 3.0,
            torsoMultiplier: config.torsoMultiplier || 1.0,
            limbMultiplier: config.limbMultiplier || 0.7,
            
            // Visual
            showBlood: config.showBlood !== false,
            showLogs: config.showLogs !== false,
            particlesPerHit: config.particlesPerHit || 20
        };
        
        // Tracking
        this.ragdolls = new Map();
        this.severedJoints = new Set();
        this.bloodParticles = [];
        
        // Stats
        this.stats = {
            totalImpacts: 0,
            totalDismemberments: 0,
            totalDeaths: 0,
            activeRagdolls: 0
        };
        
        console.log('✅ Gore Physics initialized');
    }
    
    /**
     * Create a ragdoll with Havok physics bodies
     */
    createRagdoll(position = new BABYLON.Vector3(0, 5, 0)) {
        const ragdollId = `ragdoll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`🎯 Creating ragdoll: ${ragdollId}`);
        
        // Create root transform node
        const ragdollRoot = new BABYLON.TransformNode(ragdollId, this.scene);
        ragdollRoot.position = position.clone();
        
        // Body parts with physics
        const bodies = this.createBodyParts(ragdollRoot);
        
        // Create joints (constraints)
        const joints = this.createJoints(bodies);
        
        // Setup collision detection
        this.setupCollisionDetection(ragdollId, bodies);
        
        // Register ragdoll
        this.ragdolls.set(ragdollId, {
            root: ragdollRoot,
            bodies: bodies,
            joints: joints,
            health: 100,
            alive: true,
            created: Date.now()
        });
        
        this.stats.activeRagdolls++;
        
        if (this.config.showLogs) {
            console.log(`🎯 Ragdoll created at [${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}]`);
        }
        
        return ragdollRoot;
    }
    
    /**
     * Create body parts with realistic proportions
     */
    createBodyParts(root) {
        const scale = 1.0;
        const bodies = {};
        
        // Material
        const skinMat = new BABYLON.StandardMaterial("skinMat", this.scene);
        skinMat.diffuseColor = new BABYLON.Color3(1, 0.86, 0.67);
        
        const shirtMat = new BABYLON.StandardMaterial("shirtMat", this.scene);
        shirtMat.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.8);
        
        const pantsMat = new BABYLON.StandardMaterial("pantsMat", this.scene);
        pantsMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        
        // HEAD
        const head = BABYLON.MeshBuilder.CreateSphere(
            "head",
            { diameter: 0.3 * scale, segments: 12 },
            this.scene
        );
        head.position = new BABYLON.Vector3(0, 1.6, 0);
        head.parent = root;
        head.material = skinMat;
        head.castShadow = true;
        
        const headAggregate = new BABYLON.PhysicsAggregate(
            head,
            BABYLON.PhysicsShapeType.SPHERE,
            { mass: 5 * scale, restitution: 0.3, friction: 0.6 },
            this.scene
        );
        
        bodies.head = { mesh: head, aggregate: headAggregate, zone: 'head', mass: 5 };
        
        // UPPER TORSO
        const upperTorso = BABYLON.MeshBuilder.CreateBox(
            "upperTorso",
            { width: 0.4 * scale, height: 0.5 * scale, depth: 0.25 * scale },
            this.scene
        );
        upperTorso.position = new BABYLON.Vector3(0, 1.2, 0);
        upperTorso.parent = root;
        upperTorso.material = shirtMat;
        upperTorso.castShadow = true;
        
        const upperTorsoAggregate = new BABYLON.PhysicsAggregate(
            upperTorso,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 20 * scale, restitution: 0.2, friction: 0.6 },
            this.scene
        );
        
        bodies.upperTorso = { mesh: upperTorso, aggregate: upperTorsoAggregate, zone: 'torso', mass: 20 };
        
        // LOWER TORSO
        const lowerTorso = BABYLON.MeshBuilder.CreateBox(
            "lowerTorso",
            { width: 0.35 * scale, height: 0.4 * scale, depth: 0.25 * scale },
            this.scene
        );
        lowerTorso.position = new BABYLON.Vector3(0, 0.75, 0);
        lowerTorso.parent = root;
        lowerTorso.material = shirtMat;
        lowerTorso.castShadow = true;
        
        const lowerTorsoAggregate = new BABYLON.PhysicsAggregate(
            lowerTorso,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 15 * scale, restitution: 0.2, friction: 0.6 },
            this.scene
        );
        
        bodies.lowerTorso = { mesh: lowerTorso, aggregate: lowerTorsoAggregate, zone: 'torso', mass: 15 };
        
        // ARMS (simplified as capsules)
        ['L', 'R'].forEach(side => {
            const xPos = side === 'L' ? -0.3 : 0.3;
            
            // Upper arm
            const upperArm = BABYLON.MeshBuilder.CreateCapsule(
                `upperArm${side}`,
                { radius: 0.06 * scale, height: 0.3 * scale },
                this.scene
            );
            upperArm.position = new BABYLON.Vector3(xPos, 1.2, 0);
            upperArm.parent = root;
            upperArm.material = skinMat;
            upperArm.castShadow = true;
            
            const upperArmAggregate = new BABYLON.PhysicsAggregate(
                upperArm,
                BABYLON.PhysicsShapeType.CAPSULE,
                { mass: 2.5 * scale, restitution: 0.2, friction: 0.6 },
                this.scene
            );
            
            bodies[`upperArm${side}`] = { 
                mesh: upperArm, 
                aggregate: upperArmAggregate, 
                zone: 'limb', 
                mass: 2.5 
            };
            
            // Lower arm
            const lowerArm = BABYLON.MeshBuilder.CreateCapsule(
                `lowerArm${side}`,
                { radius: 0.05 * scale, height: 0.28 * scale },
                this.scene
            );
            lowerArm.position = new BABYLON.Vector3(side === 'L' ? -0.6 : 0.6, 1.2, 0);
            lowerArm.parent = root;
            lowerArm.material = skinMat;
            lowerArm.castShadow = true;
            
            const lowerArmAggregate = new BABYLON.PhysicsAggregate(
                lowerArm,
                BABYLON.PhysicsShapeType.CAPSULE,
                { mass: 1.5 * scale, restitution: 0.2, friction: 0.6 },
                this.scene
            );
            
            bodies[`lowerArm${side}`] = { 
                mesh: lowerArm, 
                aggregate: lowerArmAggregate, 
                zone: 'limb', 
                mass: 1.5 
            };
        });
        
        // LEGS
        ['L', 'R'].forEach(side => {
            const xPos = side === 'L' ? -0.12 : 0.12;
            
            // Upper leg
            const upperLeg = BABYLON.MeshBuilder.CreateCapsule(
                `upperLeg${side}`,
                { radius: 0.08 * scale, height: 0.45 * scale },
                this.scene
            );
            upperLeg.position = new BABYLON.Vector3(xPos, 0.3, 0);
            upperLeg.parent = root;
            upperLeg.material = pantsMat;
            upperLeg.castShadow = true;
            
            const upperLegAggregate = new BABYLON.PhysicsAggregate(
                upperLeg,
                BABYLON.PhysicsShapeType.CAPSULE,
                { mass: 7 * scale, restitution: 0.2, friction: 0.6 },
                this.scene
            );
            
            bodies[`upperLeg${side}`] = { 
                mesh: upperLeg, 
                aggregate: upperLegAggregate, 
                zone: 'limb', 
                mass: 7 
            };
            
            // Lower leg
            const lowerLeg = BABYLON.MeshBuilder.CreateCapsule(
                `lowerLeg${side}`,
                { radius: 0.06 * scale, height: 0.43 * scale },
                this.scene
            );
            lowerLeg.position = new BABYLON.Vector3(xPos, -0.2, 0);
            lowerLeg.parent = root;
            lowerLeg.material = pantsMat;
            lowerLeg.castShadow = true;
            
            const lowerLegAggregate = new BABYLON.PhysicsAggregate(
                lowerLeg,
                BABYLON.PhysicsShapeType.CAPSULE,
                { mass: 4 * scale, restitution: 0.2, friction: 0.6 },
                this.scene
            );
            
            bodies[`lowerLeg${side}`] = { 
                mesh: lowerLeg, 
                aggregate: lowerLegAggregate, 
                zone: 'limb', 
                mass: 4 
            };
        });
        
        return bodies;
    }
    
    /**
     * Create joints (physics constraints) between body parts
     * NOTE: Havok joints are more complex - this is simplified
     */
    createJoints(bodies) {
        const joints = {};
        
        // Joint definitions with break speeds
        const jointDefs = {
            neck: { part1: 'upperTorso', part2: 'head', breakSpeed: 20 },
            spine: { part1: 'upperTorso', part2: 'lowerTorso', breakSpeed: 25 },
            shoulderL: { part1: 'upperTorso', part2: 'upperArmL', breakSpeed: 15 },
            elbowL: { part1: 'upperArmL', part2: 'lowerArmL', breakSpeed: 13 },
            shoulderR: { part1: 'upperTorso', part2: 'upperArmR', breakSpeed: 15 },
            elbowR: { part1: 'upperArmR', part2: 'lowerArmR', breakSpeed: 13 },
            hipL: { part1: 'lowerTorso', part2: 'upperLegL', breakSpeed: 18 },
            kneeL: { part1: 'upperLegL', part2: 'lowerLegL', breakSpeed: 15 },
            hipR: { part1: 'lowerTorso', part2: 'upperLegR', breakSpeed: 18 },
            kneeR: { part1: 'upperLegR', part2: 'lowerLegR', breakSpeed: 15 }
        };
        
        for (let jointName in jointDefs) {
            joints[jointName] = {
                ...jointDefs[jointName],
                intact: true
            };
        }
        
        return joints;
    }
    
    /**
     * Setup collision detection for all body parts
     */
    setupCollisionDetection(ragdollId, bodies) {
        for (let partName in bodies) {
            const body = bodies[partName];
            
            // Register collision observable
            body.aggregate.body.getCollisionObservable().add((collisionEvent) => {
                this.onCollision(ragdollId, partName, collisionEvent);
            });
        }
    }
    
    /**
     * Handle collision event
     */
    onCollision(ragdollId, partName, collisionEvent) {
        if (!this.config.enabled) return;
        
        const ragdoll = this.ragdolls.get(ragdollId);
        if (!ragdoll || !ragdoll.alive) return;
        
        const body = ragdoll.bodies[partName];
        if (!body) return;
        
        // Get collision velocity (impulse magnitude approximates impact speed)
        const velocity = body.aggregate.body.getLinearVelocity();
        const speed = velocity.length();
        
        // Only process significant impacts
        if (speed < this.config.damageThreshold) return;
        
        // Get damage zone
        const zone = body.zone;
        const multiplier = this.getDamageMultiplier(zone);
        
        // Calculate damage
        const damage = speed * 5 * multiplier;
        ragdoll.health -= damage;
        this.stats.totalImpacts++;
        
        if (this.config.showLogs) {
            console.log(`💥 ${partName} impact: ${speed.toFixed(1)}m/s | dmg: ${damage.toFixed(1)} | hp: ${ragdoll.health.toFixed(1)}`);
        }
        
        // Check for dismemberment
        if (speed >= this.config.severThreshold) {
            this.checkDismemberment(ragdollId, partName, speed, collisionEvent.point);
        }
        
        // Check for death
        if (ragdoll.health <= 0 && ragdoll.alive) {
            ragdoll.alive = false;
            this.stats.totalDeaths++;
            this.stats.activeRagdolls--;
            
            if (this.config.showLogs) {
                console.log(`☠️ Ragdoll ${ragdollId} DEAD from ${partName} impact`);
            }
        }
    }
    
    /**
     * Check if impact should cause dismemberment
     */
    checkDismemberment(ragdollId, partName, speed, position) {
        const ragdoll = this.ragdolls.get(ragdollId);
        if (!ragdoll) return;
        
        // Find connected joints
        const connectedJoints = Object.entries(ragdoll.joints).filter(
            ([jointName, joint]) => joint.part1 === partName || joint.part2 === partName
        );
        
        for (let [jointName, joint] of connectedJoints) {
            if (!joint.intact) continue;
            
            if (speed >= joint.breakSpeed) {
                this.severJoint(ragdollId, jointName, speed, position);
            }
        }
    }
    
    /**
     * Sever a joint (remove constraint, separate limb)
     */
    severJoint(ragdollId, jointName, speed, position) {
        const jointId = `${ragdollId}_${jointName}`;
        
        if (this.severedJoints.has(jointId)) return false;
        
        this.severedJoints.add(jointId);
        this.stats.totalDismemberments++;
        
        const ragdoll = this.ragdolls.get(ragdollId);
        if (ragdoll && ragdoll.joints[jointName]) {
            ragdoll.joints[jointName].intact = false;
        }
        
        const severity = speed >= this.config.explodeThreshold ? 'CATASTROPHIC' :
                        speed >= this.config.severThreshold + 10 ? 'SEVERE' : 'MODERATE';
        
        if (this.config.showLogs) {
            console.log(`🔪 ${jointName} SEVERED! [${severity}] ${speed.toFixed(1)}m/s`);
        }
        
        // Spawn blood
        if (this.config.showBlood) {
            this.spawnBlood(position, speed, severity);
        }
        
        return true;
    }
    
    /**
     * Spawn blood particles
     */
    spawnBlood(position, velocity, severity) {
        const particleCount = severity === 'CATASTROPHIC' ? 50 :
                             severity === 'SEVERE' ? 30 : 15;
        
        if (this.config.showLogs) {
            console.log(`🩸 Blood spray: ${particleCount} particles at ${velocity.toFixed(1)}m/s`);
        }
        
        // TODO: Create actual particle system here
        // For now just tracking in array
        for (let i = 0; i < particleCount; i++) {
            this.bloodParticles.push({
                position: position.clone(),
                velocity: velocity * 0.5,
                life: 2.0
            });
        }
    }
    
    /**
     * Get damage multiplier based on body zone
     */
    getDamageMultiplier(zone) {
        switch (zone) {
            case 'head': return this.config.headMultiplier;
            case 'torso': return this.config.torsoMultiplier;
            case 'limb': return this.config.limbMultiplier;
            default: return 1.0;
        }
    }
    
    /**
     * Get current stats
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Clean up all ragdolls
     */
    cleanup() {
        for (let [id, ragdoll] of this.ragdolls) {
            ragdoll.root.dispose();
            
            for (let partName in ragdoll.bodies) {
                const body = ragdoll.bodies[partName];
                body.mesh.dispose();
                body.aggregate.dispose();
            }
        }
        
        this.ragdolls.clear();
        this.severedJoints.clear();
        this.bloodParticles = [];
        
        this.stats.activeRagdolls = 0;
        
        console.log('🧹 Gore physics cleaned up');
    }
}
