/**
 * APPLESAUCE Gore Physics - BABYLON.JS + HAVOK EDITION
 * Velocity-based damage and dismemberment using real Havok physics collisions
 * 
 * FIX NOTES:
 * - Body parts are NO LONGER parented to root (prevents Havok vs transform conflicts)
 * - Actual BABYLON.Physics6DoFConstraint joints are created between body parts
 * - Constraints use proper pivot points so parts spawn connected, not overlapping
 * - Dismemberment now actually disposes the physics constraint
 * - Self-collisions between ragdoll parts are filtered out
 * - Blood uses real Babylon ParticleSystem
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
            particlesPerHit: config.particlesPerHit || 2000
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
        
        // Root is for tracking/reference only — NOT used as a mesh parent
        const ragdollRoot = new BABYLON.TransformNode(ragdollId, this.scene);
        ragdollRoot.position = position.clone();
        
        // Body parts positioned in WORLD SPACE (no parenting)
        const bodies = this.createBodyParts(position);
        
        // Create REAL Havok physics constraints
        const joints = this.createJoints(bodies);
        
        // Setup collision detection (with self-collision filter)
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
     * Create body parts positioned in WORLD SPACE.
     * 
     * IMPORTANT: Meshes are NOT parented to a transform node.
     * Havok fully owns their positions. Parenting + physics = explosion.
     */
    createBodyParts(origin) {
        const scale = 1.0;
        const bodies = {};
        const uid = Date.now();
        
        // Unique materials per ragdoll to avoid shared-material issues
        const skinMat = new BABYLON.StandardMaterial(`skinMat_${uid}`, this.scene);
        skinMat.diffuseColor = new BABYLON.Color3(1, 0.86, 0.67);
        
        const shirtMat = new BABYLON.StandardMaterial(`shirtMat_${uid}`, this.scene);
        shirtMat.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.8);
        
        const pantsMat = new BABYLON.StandardMaterial(`pantsMat_${uid}`, this.scene);
        pantsMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        
        /**
         * Helper — creates a mesh + PhysicsAggregate at a world position.
         * No parent is set. The mesh lives in world space so Havok is the
         * sole authority on its transform.
         */
        const createPart = (name, meshFn, shapeType, physicsOpts, localOffset, material, zone) => {
            const worldPos = origin.add(localOffset);
            const mesh = meshFn(`${name}_${uid}`, this.scene);
            mesh.position = worldPos;
            mesh.material = material;
            mesh.receiveShadows = true;
            
            const aggregate = new BABYLON.PhysicsAggregate(
                mesh,
                shapeType,
                physicsOpts,
                this.scene
            );
            
            return { mesh, aggregate, zone, mass: physicsOpts.mass };
        };
        
        // ===== HEAD =====
        bodies.head = createPart(
            "head",
            (n, s) => BABYLON.MeshBuilder.CreateSphere(n, { diameter: 0.3 * scale, segments: 12 }, s),
            BABYLON.PhysicsShapeType.SPHERE,
            { mass: 5 * scale, restitution: 0.3, friction: 0.6 },
            new BABYLON.Vector3(0, 1.6, 0),
            skinMat, 'head'
        );
        
        // ===== UPPER TORSO =====
        bodies.upperTorso = createPart(
            "upperTorso",
            (n, s) => BABYLON.MeshBuilder.CreateBox(n, { width: 0.4 * scale, height: 0.5 * scale, depth: 0.25 * scale }, s),
            BABYLON.PhysicsShapeType.BOX,
            { mass: 20 * scale, restitution: 0.2, friction: 0.6 },
            new BABYLON.Vector3(0, 1.2, 0),
            shirtMat, 'torso'
        );
        
        // ===== LOWER TORSO =====
        bodies.lowerTorso = createPart(
            "lowerTorso",
            (n, s) => BABYLON.MeshBuilder.CreateBox(n, { width: 0.35 * scale, height: 0.4 * scale, depth: 0.25 * scale }, s),
            BABYLON.PhysicsShapeType.BOX,
            { mass: 15 * scale, restitution: 0.2, friction: 0.6 },
            new BABYLON.Vector3(0, 0.75, 0),
            shirtMat, 'torso'
        );
        
        // ===== ARMS =====
        ['L', 'R'].forEach(side => {
            const xSign = side === 'L' ? -1 : 1;
            
            bodies[`upperArm${side}`] = createPart(
                `upperArm${side}`,
                (n, s) => BABYLON.MeshBuilder.CreateCapsule(n, { radius: 0.06 * scale, height: 0.3 * scale }, s),
                BABYLON.PhysicsShapeType.CAPSULE,
                { mass: 2.5 * scale, restitution: 0.2, friction: 0.6 },
                new BABYLON.Vector3(xSign * 0.35, 1.2, 0),
                skinMat, 'limb'
            );
            
            bodies[`lowerArm${side}`] = createPart(
                `lowerArm${side}`,
                (n, s) => BABYLON.MeshBuilder.CreateCapsule(n, { radius: 0.05 * scale, height: 0.28 * scale }, s),
                BABYLON.PhysicsShapeType.CAPSULE,
                { mass: 1.5 * scale, restitution: 0.2, friction: 0.6 },
                new BABYLON.Vector3(xSign * 0.6, 1.2, 0),
                skinMat, 'limb'
            );
        });
        
        // ===== LEGS =====
        ['L', 'R'].forEach(side => {
            const xSign = side === 'L' ? -1 : 1;
            
            bodies[`upperLeg${side}`] = createPart(
                `upperLeg${side}`,
                (n, s) => BABYLON.MeshBuilder.CreateCapsule(n, { radius: 0.08 * scale, height: 0.45 * scale }, s),
                BABYLON.PhysicsShapeType.CAPSULE,
                { mass: 5 * scale, restitution: 0.2, friction: 0.6 },
                new BABYLON.Vector3(xSign * 0.12, 0.3, 0),
                pantsMat, 'limb'
            );
            
            bodies[`lowerLeg${side}`] = createPart(
                `lowerLeg${side}`,
                (n, s) => BABYLON.MeshBuilder.CreateCapsule(n, { radius: 0.06 * scale, height: 0.43 * scale }, s),
                BABYLON.PhysicsShapeType.CAPSULE,
                { mass: 4 * scale, restitution: 0.2, friction: 0.6 },
                new BABYLON.Vector3(xSign * 0.12, -0.15, 0),
                pantsMat, 'limb'
            );
        });
        
        return bodies;
    }
    
    /**
     * Create REAL Havok 6DoF constraints between body parts.
     * 
     * pivotA / pivotB = local-space offset from each body's center to the
     * connection point. angularLimits clamp rotation so joints behave like
     * real anatomy (elbows/knees are hinge-like, shoulders are ball-like).
     */
    createJoints(bodies) {
        const joints = {};
        
        const jointDefs = {
            neck: {
                part1: 'upperTorso', part2: 'head',
                pivotA: new BABYLON.Vector3(0, 0.25, 0),
                pivotB: new BABYLON.Vector3(0, -0.15, 0),
                breakSpeed: 20,
                limits: [-0.5, 0.5, -0.3, 0.3, -0.5, 0.5]
            },
            spine: {
                part1: 'upperTorso', part2: 'lowerTorso',
                pivotA: new BABYLON.Vector3(0, -0.25, 0),
                pivotB: new BABYLON.Vector3(0, 0.2, 0),
                breakSpeed: 25,
                limits: [-0.4, 0.4, -0.2, 0.2, -0.4, 0.4]
            },
            shoulderL: {
                part1: 'upperTorso', part2: 'upperArmL',
                pivotA: new BABYLON.Vector3(-0.2, 0.15, 0),
                pivotB: new BABYLON.Vector3(0, 0.15, 0),
                breakSpeed: 15,
                limits: [-1.5, 1.5, -1.0, 1.0, -1.5, 1.5]
            },
            shoulderR: {
                part1: 'upperTorso', part2: 'upperArmR',
                pivotA: new BABYLON.Vector3(0.2, 0.15, 0),
                pivotB: new BABYLON.Vector3(0, 0.15, 0),
                breakSpeed: 15,
                limits: [-1.5, 1.5, -1.0, 1.0, -1.5, 1.5]
            },
            elbowL: {
                part1: 'upperArmL', part2: 'lowerArmL',
                pivotA: new BABYLON.Vector3(0, -0.15, 0),
                pivotB: new BABYLON.Vector3(0, 0.14, 0),
                breakSpeed: 13,
                limits: [-0.1, 2.5, -0.1, 0.1, -0.1, 0.1]
            },
            elbowR: {
                part1: 'upperArmR', part2: 'lowerArmR',
                pivotA: new BABYLON.Vector3(0, -0.15, 0),
                pivotB: new BABYLON.Vector3(0, 0.14, 0),
                breakSpeed: 13,
                limits: [-0.1, 2.5, -0.1, 0.1, -0.1, 0.1]
            },
            hipL: {
                part1: 'lowerTorso', part2: 'upperLegL',
                pivotA: new BABYLON.Vector3(-0.12, -0.2, 0),
                pivotB: new BABYLON.Vector3(0, 0.225, 0),
                breakSpeed: 18,
                limits: [-1.2, 1.2, -0.5, 0.5, -0.8, 0.8]
            },
            hipR: {
                part1: 'lowerTorso', part2: 'upperLegR',
                pivotA: new BABYLON.Vector3(0.12, -0.2, 0),
                pivotB: new BABYLON.Vector3(0, 0.225, 0),
                breakSpeed: 18,
                limits: [-1.2, 1.2, -0.5, 0.5, -0.8, 0.8]
            },
            kneeL: {
                part1: 'upperLegL', part2: 'lowerLegL',
                pivotA: new BABYLON.Vector3(0, -0.225, 0),
                pivotB: new BABYLON.Vector3(0, 0.215, 0),
                breakSpeed: 15,
                limits: [-2.5, 0.1, -0.1, 0.1, -0.1, 0.1]
            },
            kneeR: {
                part1: 'upperLegR', part2: 'lowerLegR',
                pivotA: new BABYLON.Vector3(0, -0.225, 0),
                pivotB: new BABYLON.Vector3(0, 0.215, 0),
                breakSpeed: 15,
                limits: [-2.5, 0.1, -0.1, 0.1, -0.1, 0.1]
            }
        };
        
        for (const jointName in jointDefs) {
            const def = jointDefs[jointName];
            const bodyA = bodies[def.part1];
            const bodyB = bodies[def.part2];
            
            if (!bodyA || !bodyB) {
                console.warn(`⚠️ Skipping joint ${jointName}: missing body part`);
                continue;
            }
            
            try {
                const constraint = new BABYLON.Physics6DoFConstraint(
                    {
                        pivotA: def.pivotA,
                        pivotB: def.pivotB,
                        axisA: new BABYLON.Vector3(0, 1, 0),
                        axisB: new BABYLON.Vector3(0, 1, 0),
                        perpAxisA: new BABYLON.Vector3(1, 0, 0),
                        perpAxisB: new BABYLON.Vector3(1, 0, 0),
                    },
                    [
                        { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: def.limits[0], maxLimit: def.limits[1] },
                        { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: def.limits[2], maxLimit: def.limits[3] },
                        { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: def.limits[4], maxLimit: def.limits[5] },
                    ],
                    this.scene
                );
                
                // Wire it up between the two Havok bodies
                bodyA.aggregate.body.addConstraint(bodyB.aggregate.body, constraint);
                
                joints[jointName] = {
                    part1: def.part1,
                    part2: def.part2,
                    constraint: constraint,
                    breakSpeed: def.breakSpeed,
                    intact: true
                };
                
                if (this.config.showLogs) {
                    console.log(`🔗 Joint: ${jointName} (${def.part1} ↔ ${def.part2})`);
                }
            } catch (e) {
                console.error(`❌ Joint ${jointName} failed:`, e);
            }
        }
        
        return joints;
    }
    
    /**
     * Setup collision detection — filters out self-collisions between
     * parts of the same ragdoll so they don't damage themselves on spawn.
     */
    setupCollisionDetection(ragdollId, bodies) {
        for (const partName in bodies) {
            const body = bodies[partName];
            
            body.aggregate.body.setCollisionCallbackEnabled(true);
            
            body.aggregate.body.getCollisionObservable().add((collisionEvent) => {
                // Filter self-collisions
                const otherNode = collisionEvent.collidedAgainst?.transformNode;
                if (otherNode) {
                    const isSelf = Object.values(bodies).some(b => b.mesh === otherNode);
                    if (isSelf) return;
                }
                
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
        
        const velocity = body.aggregate.body.getLinearVelocity();
        const speed = velocity.length();
        
        if (speed < this.config.damageThreshold) return;
        
        const zone = body.zone;
        const multiplier = this.getDamageMultiplier(zone);
        const damage = speed * 5 * multiplier;
        ragdoll.health -= damage;
        this.stats.totalImpacts++;
        
        if (this.config.showLogs) {
            console.log(`💥 ${partName} impact: ${speed.toFixed(1)}m/s | dmg: ${damage.toFixed(1)} | hp: ${ragdoll.health.toFixed(1)}`);
        }
        
        if (speed >= this.config.severThreshold) {
            this.checkDismemberment(ragdollId, partName, speed, collisionEvent.point);
        }
        
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
        
        const connectedJoints = Object.entries(ragdoll.joints).filter(
            ([_, joint]) => joint.part1 === partName || joint.part2 === partName
        );
        
        for (const [jointName, joint] of connectedJoints) {
            if (!joint.intact) continue;
            if (speed >= joint.breakSpeed) {
                this.severJoint(ragdollId, jointName, speed, position);
            }
        }
    }
    
    /**
     * Sever a joint — DISPOSE the Havok constraint so the limb detaches,
     * then apply a separation impulse and spawn blood.
     */
    severJoint(ragdollId, jointName, speed, position) {
        const jointId = `${ragdollId}_${jointName}`;
        if (this.severedJoints.has(jointId)) return false;
        
        this.severedJoints.add(jointId);
        this.stats.totalDismemberments++;
        
        const ragdoll = this.ragdolls.get(ragdollId);
        if (!ragdoll || !ragdoll.joints[jointName]) return false;
        
        const joint = ragdoll.joints[jointName];
        joint.intact = false;
        
        // *** Dispose the actual Havok constraint ***
        if (joint.constraint) {
            try {
                joint.constraint.dispose();
                joint.constraint = null;
            } catch (e) {
                console.warn(`⚠️ Could not dispose constraint ${jointName}:`, e);
            }
        }
        
        // Apply separation impulse to the freed part
        const detached = ragdoll.bodies[joint.part2];
        const parent = ragdoll.bodies[joint.part1];
        if (detached && parent) {
            const dir = detached.mesh.position.subtract(parent.mesh.position).normalize();
            const mag = Math.min(speed * 2, 50);
            detached.aggregate.body.applyImpulse(
                dir.scale(mag),
                detached.mesh.getAbsolutePosition()
            );
        }
        
        const severity = speed >= this.config.explodeThreshold ? 'CATASTROPHIC' :
                        speed >= this.config.severThreshold + 10 ? 'SEVERE' : 'MODERATE';
        
        if (this.config.showLogs) {
            console.log(`🔪 ${jointName} SEVERED! [${severity}] ${speed.toFixed(1)}m/s`);
        }
        
        if (this.config.showBlood && position) {
            this.spawnBlood(position, speed, severity);
        }
        
        return true;
    }
    
            /**
             * Spawn blood using a real Babylon ParticleSystem
             */
            spawnBlood(position, velocity, severity) {
            const particleCount = severity === 'CATASTROPHIC' ? 4000 : 1500;
            
            const ps = new BABYLON.ParticleSystem("blood", particleCount, this.scene);
            ps.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", this.scene);
            
            // Emitter Setup — use the factory method on the particle system
            ps.emitter = position;
            ps.particleEmitterType = ps.createDirectedSphereEmitter(0.1, new BABYLON.Vector3(-1, 0.5, -1), new BABYLON.Vector3(1, 1, 1));
            
            // Color: Deep red to dark drying blood
            ps.color1 = new BABYLON.Color4(0.7, 0, 0, 1);
            ps.color2 = new BABYLON.Color4(0.4, 0, 0, 1);
            ps.colorDead = new BABYLON.Color4(0.2, 0, 0, 0);
            
            // Physics
            ps.gravity = new BABYLON.Vector3(0, -15, 0); // Heavier gravity for "liquid"
            ps.minEmitPower = velocity * 0.5;
            ps.maxEmitPower = velocity * 1.5;
            ps.updateSpeed = 0.015;
            
            // Size and Life
            ps.minSize = 0.05;
            ps.maxSize = 0.15;
            ps.minLifeTime = 0.2;
            ps.maxLifeTime = 0.8;
            
            ps.targetStopDuration = 0.2;
            ps.disposeOnStop = true;
            ps.start();

            // Leave a permanent splatter mark on nearby surfaces
            this.spawnSplatterDecal(position);
        }
    
        /**
         * Spawn a blood splatter decal on the nearest surface below the impact point.
         * Uses a downward raycast to find the ground/step, then projects a decal.
         */
        spawnSplatterDecal(position) {
            const ray = new BABYLON.Ray(position, new BABYLON.Vector3(0, -1, 0), 5);
            const hit = this.scene.pickWithRay(ray, (mesh) => {
                // Only hit level geometry, not ragdoll parts
                return mesh.name.includes('Platform') ||
                       mesh.name.includes('platform') ||
                       mesh.name.includes('step') ||
                       mesh.name.includes('wall') ||
                       mesh.name.includes('ground');
            });
            
            if (!hit || !hit.hit || !hit.pickedMesh) return;
            
            const size = 0.5 + Math.random() * 1.5;
            
            // Create a flat disc as splatter
            const splat = BABYLON.MeshBuilder.CreateDisc(
                `bloodSplat_${Date.now()}`,
                { radius: size * 0.5, tessellation: 8 },
                this.scene
            );
            
            // Position slightly above surface to avoid z-fighting
            splat.position = hit.pickedPoint.clone();
            splat.position.y += 0.02;
            
            // Align to surface normal
            const normal = hit.getNormal(true);
            if (normal) {
                const up = new BABYLON.Vector3(0, 0, 0);
                const axis = BABYLON.Vector3.Cross(up, normal);
                const angle = Math.acos(BABYLON.Vector3.Dot(up, normal));
                if (axis.length() > 0.001) {
                    splat.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis.normalize(), angle);
                }
            } else {
                // Default: flat on horizontal surface
                splat.rotation.x = Math.PI / 2;
            }
            
            // Random spin for variety
            splat.rotation.y = Math.random() * Math.PI * 2;
            
            const splatMat = new BABYLON.StandardMaterial(`splatMat_${Date.now()}`, this.scene);
            splatMat.diffuseColor = new BABYLON.Color3(
                0.3 + Math.random() * 0.3,
                0,
                0
            );
            splatMat.specularColor = new BABYLON.Color3(0.2, 0, 0);
            splatMat.alpha = 0.7 + Math.random() * 0.3;
            splatMat.backFaceCulling = false;
            splat.material = splatMat;
        }
    
    getDamageMultiplier(zone) {
        switch (zone) {
            case 'head': return this.config.headMultiplier;
            case 'torso': return this.config.torsoMultiplier;
            case 'limb': return this.config.limbMultiplier;
            default: return 1.0;
        }
    }
    
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Clean up — dispose constraints FIRST, then bodies, then meshes
     */
    cleanup() {
        for (const [id, ragdoll] of this.ragdolls) {
            for (const jointName in ragdoll.joints) {
                const joint = ragdoll.joints[jointName];
                if (joint.constraint) {
                    try { joint.constraint.dispose(); } catch(e) {}
                }
            }
            
            for (const partName in ragdoll.bodies) {
                const body = ragdoll.bodies[partName];
                try {
                    body.aggregate.dispose();
                    body.mesh.dispose();
                } catch(e) {}
            }
            
            ragdoll.root.dispose();
        }
        
        this.ragdolls.clear();
        this.severedJoints.clear();
        this.bloodParticles = [];
        this.stats.activeRagdolls = 0;
        
        console.log('🧹 Gore physics cleaned up');
    }
}
