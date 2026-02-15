/**
 * APPLESAUCE GORE MODULE
 * Velocity-based damage and dismemberment system for THREE.js
 * Compatible with APPLESAUCE Core Engine
 */

import * as THREE from '../three.module.js';

export class GorePhysics {
    constructor(config = {}) {
        console.log('🩸 Initializing Gore Physics Module...');
        
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
        this.velocities = new Map();
        this.lastPositions = new Map();
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
     * Create a ragdoll with physics bodies
     * Returns a THREE.Group with physics properties
     */
    createRagdoll(scene, position = new THREE.Vector3(0, 5, 0)) {
        const ragdollId = `ragdoll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create ragdoll group
        const ragdollGroup = new THREE.Group();
        ragdollGroup.name = ragdollId;
        ragdollGroup.position.copy(position);
        
        // Body parts with realistic proportions
        const parts = this.createBodyParts();
        const bodies = {};
        
        // Create each body part
        for (let partName in parts) {
            const part = parts[partName];
            const mesh = this.createBodyPartMesh(part);
            
            mesh.name = `${ragdollId}_${partName}`;
            mesh.position.copy(part.localPos);
            mesh.userData.partName = partName;
            mesh.userData.zone = part.zone;
            mesh.userData.mass = part.mass;
            mesh.userData.velocity = new THREE.Vector3();
            mesh.userData.health = 100;
            
            ragdollGroup.add(mesh);
            bodies[partName] = mesh;
            
            // Track this body
            this.trackBody(mesh);
        }
        
        // Create joints (for visual/logic tracking - not real physics constraints)
        const joints = this.createJointDefinitions();
        
        // Register ragdoll
        this.ragdolls.set(ragdollId, {
            group: ragdollGroup,
            bodies: bodies,
            joints: joints,
            health: 100,
            alive: true,
            created: Date.now()
        });
        
        scene.add(ragdollGroup);
        this.stats.activeRagdolls++;
        
        if (this.config.showLogs) {
            console.log(`🎯 Created ragdoll: ${ragdollId}`);
        }
        
        return ragdollGroup;
    }
    
    createBodyParts() {
        const scale = 1.0;
        
        return {
            head: {
                type: 'sphere',
                radius: 0.15 * scale,
                localPos: new THREE.Vector3(0, 1.6, 0),
                mass: 5,
                zone: 'head'
            },
            upperTorso: {
                type: 'box',
                size: new THREE.Vector3(0.4, 0.5, 0.25).multiplyScalar(scale),
                localPos: new THREE.Vector3(0, 1.2, 0),
                mass: 20,
                zone: 'torso'
            },
            lowerTorso: {
                type: 'box',
                size: new THREE.Vector3(0.35, 0.4, 0.25).multiplyScalar(scale),
                localPos: new THREE.Vector3(0, 0.75, 0),
                mass: 15,
                zone: 'torso'
            },
            upperArmL: {
                type: 'capsule',
                radius: 0.06 * scale,
                length: 0.3 * scale,
                localPos: new THREE.Vector3(-0.3, 1.2, 0),
                rotation: new THREE.Euler(0, 0, Math.PI / 2),
                mass: 2.5,
                zone: 'limb'
            },
            lowerArmL: {
                type: 'capsule',
                radius: 0.05 * scale,
                length: 0.28 * scale,
                localPos: new THREE.Vector3(-0.6, 1.2, 0),
                rotation: new THREE.Euler(0, 0, Math.PI / 2),
                mass: 1.5,
                zone: 'limb'
            },
            upperArmR: {
                type: 'capsule',
                radius: 0.06 * scale,
                length: 0.3 * scale,
                localPos: new THREE.Vector3(0.3, 1.2, 0),
                rotation: new THREE.Euler(0, 0, Math.PI / 2),
                mass: 2.5,
                zone: 'limb'
            },
            lowerArmR: {
                type: 'capsule',
                radius: 0.05 * scale,
                length: 0.28 * scale,
                localPos: new THREE.Vector3(0.6, 1.2, 0),
                rotation: new THREE.Euler(0, 0, Math.PI / 2),
                mass: 1.5,
                zone: 'limb'
            },
            upperLegL: {
                type: 'capsule',
                radius: 0.08 * scale,
                length: 0.45 * scale,
                localPos: new THREE.Vector3(-0.12, 0.3, 0),
                mass: 7,
                zone: 'limb'
            },
            lowerLegL: {
                type: 'capsule',
                radius: 0.06 * scale,
                length: 0.43 * scale,
                localPos: new THREE.Vector3(-0.12, -0.2, 0),
                mass: 4,
                zone: 'limb'
            },
            upperLegR: {
                type: 'capsule',
                radius: 0.08 * scale,
                length: 0.45 * scale,
                localPos: new THREE.Vector3(0.12, 0.3, 0),
                mass: 7,
                zone: 'limb'
            },
            lowerLegR: {
                type: 'capsule',
                radius: 0.06 * scale,
                length: 0.43 * scale,
                localPos: new THREE.Vector3(0.12, -0.2, 0),
                mass: 4,
                zone: 'limb'
            }
        };
    }
    
    createBodyPartMesh(partDef) {
        let geometry, material;
        
        material = new THREE.MeshStandardMaterial({
            color: partDef.zone === 'head' ? 0xFFCCBB :
                   partDef.zone === 'torso' ? 0x4444FF : 0xFF4444,
            roughness: 0.8
        });
        
        if (partDef.type === 'sphere') {
            geometry = new THREE.SphereGeometry(partDef.radius, 16, 16);
        } else if (partDef.type === 'box') {
            geometry = new THREE.BoxGeometry(
                partDef.size.x,
                partDef.size.y,
                partDef.size.z
            );
        } else if (partDef.type === 'capsule') {
            geometry = new THREE.CapsuleGeometry(
                partDef.radius,
                partDef.length,
                4, 8
            );
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        if (partDef.rotation) {
            mesh.rotation.copy(partDef.rotation);
        }
        
        return mesh;
    }
    
    createJointDefinitions() {
        return {
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
    }
    
    trackBody(mesh) {
        const id = mesh.name;
        this.velocities.set(id, new THREE.Vector3());
        this.lastPositions.set(id, mesh.getWorldPosition(new THREE.Vector3()).clone());
    }
    
    /**
     * Update all ragdoll physics - call this every frame
     */
    update(deltaTime = 0.016) {
        if (!this.config.enabled) return;
        
        // Update velocities for all tracked bodies
        for (let [ragdollId, ragdoll] of this.ragdolls) {
            if (!ragdoll.alive) continue;
            
            for (let partName in ragdoll.bodies) {
                const body = ragdoll.bodies[partName];
                const id = body.name;
                
                // Get world position
                const currentPos = body.getWorldPosition(new THREE.Vector3());
                const lastPos = this.lastPositions.get(id);
                
                if (lastPos) {
                    // Calculate velocity
                    const velocity = currentPos.clone().sub(lastPos).divideScalar(deltaTime);
                    this.velocities.set(id, velocity);
                    body.userData.velocity.copy(velocity);
                    body.userData.speed = velocity.length();
                }
                
                // Update last position
                this.lastPositions.set(id, currentPos.clone());
            }
        }
        
        // Simple physics simulation (gravity + ground collision)
        this.applySimplePhysics(deltaTime);
        
        // Update blood particles
        this.updateBloodParticles(deltaTime);
    }
    
    applySimplePhysics(deltaTime) {
        const gravity = new THREE.Vector3(0, -9.81, 0);
        
        for (let [ragdollId, ragdoll] of this.ragdolls) {
            if (!ragdoll.alive) continue;
            
            for (let partName in ragdoll.bodies) {
                const body = ragdoll.bodies[partName];
                const velocity = body.userData.velocity;
                
                // Apply gravity
                velocity.add(gravity.clone().multiplyScalar(deltaTime));
                
                // Update position
                const worldPos = body.getWorldPosition(new THREE.Vector3());
                worldPos.add(velocity.clone().multiplyScalar(deltaTime));
                
                // Ground collision
                if (worldPos.y < 0) {
                    worldPos.y = 0;
                    
                    // Check for impact
                    const impactSpeed = Math.abs(velocity.y);
                    if (impactSpeed > this.config.damageThreshold) {
                        this.onImpact(ragdollId, partName, impactSpeed, worldPos);
                    }
                    
                    // Bounce
                    velocity.y = -velocity.y * 0.3;
                    velocity.x *= 0.8;
                    velocity.z *= 0.8;
                }
                
                // Update mesh position in local space
                ragdoll.group.worldToLocal(worldPos);
                body.position.copy(worldPos);
            }
        }
    }
    
    /**
     * Handle impact/collision
     */
    onImpact(ragdollId, partName, impactSpeed, position) {
        const ragdoll = this.ragdolls.get(ragdollId);
        if (!ragdoll || !ragdoll.alive) return;
        
        const body = ragdoll.bodies[partName];
        const zone = body.userData.zone;
        
        // Get damage multiplier
        const multiplier = zone === 'head' ? this.config.headMultiplier :
                          zone === 'torso' ? this.config.torsoMultiplier :
                          this.config.limbMultiplier;
        
        // Calculate damage
        const damage = impactSpeed * 5 * multiplier;
        ragdoll.health -= damage;
        this.stats.totalImpacts++;
        
        if (this.config.showLogs) {
            console.log(`💥 ${partName} impact: ${impactSpeed.toFixed(1)}m/s | dmg: ${damage.toFixed(1)} | hp: ${ragdoll.health.toFixed(1)}`);
        }
        
        // Check for dismemberment
        if (impactSpeed >= this.config.severThreshold) {
            this.checkDismemberment(ragdollId, partName, impactSpeed, position);
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
        
        return {
            damage,
            speed: impactSpeed,
            isDead: !ragdoll.alive,
            health: ragdoll.health
        };
    }
    
    checkDismemberment(ragdollId, partName, speed, position) {
        const ragdoll = this.ragdolls.get(ragdollId);
        if (!ragdoll) return;
        
        // Find connected joints
        const connectedJoints = Object.entries(ragdoll.joints).filter(
            ([jointName, joint]) => joint.part1 === partName || joint.part2 === partName
        );
        
        for (let [jointName, joint] of connectedJoints) {
            const jointId = `${ragdollId}_${jointName}`;
            
            if (this.severedJoints.has(jointId)) continue;
            
            if (speed >= joint.breakSpeed) {
                this.severJoint(ragdollId, jointName, speed, position);
            }
        }
    }
    
    severJoint(ragdollId, jointName, speed, position) {
        const jointId = `${ragdollId}_${jointName}`;
        
        if (this.severedJoints.has(jointId)) return false;
        
        this.severedJoints.add(jointId);
        this.stats.totalDismemberments++;
        
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
    
    spawnBlood(position, velocity, severity) {
        const particleCount = severity === 'CATASTROPHIC' ? 50 :
                             severity === 'SEVERE' ? 30 : 15;
        
        for (let i = 0; i < particleCount; i++) {
            this.bloodParticles.push({
                position: position.clone(),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * velocity * 0.5,
                    Math.random() * velocity * 0.3,
                    (Math.random() - 0.5) * velocity * 0.5
                ),
                life: 1.0,
                maxLife: 2.0
            });
        }
        
        if (this.config.showLogs) {
            console.log(`🩸 Blood spray: ${particleCount} particles at ${velocity.toFixed(1)}m/s`);
        }
    }
    
    updateBloodParticles(deltaTime) {
        const gravity = new THREE.Vector3(0, -9.81, 0);
        
        for (let i = this.bloodParticles.length - 1; i >= 0; i--) {
            const particle = this.bloodParticles[i];
            
            // Update physics
            particle.velocity.add(gravity.clone().multiplyScalar(deltaTime));
            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            
            // Update life
            particle.life -= deltaTime;
            
            // Remove dead particles
            if (particle.life <= 0 || particle.position.y < -1) {
                this.bloodParticles.splice(i, 1);
            }
        }
    }
    
    /**
     * Get current statistics
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Clean up all ragdolls
     */
    cleanup(scene) {
        for (let [id, ragdoll] of this.ragdolls) {
            scene.remove(ragdoll.group);
        }
        
        this.ragdolls.clear();
        this.velocities.clear();
        this.lastPositions.clear();
        this.severedJoints.clear();
        this.bloodParticles = [];
        
        this.stats.activeRagdolls = 0;
    }
}
