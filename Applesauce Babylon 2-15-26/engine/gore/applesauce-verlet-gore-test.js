/**
 * APPLESAUCE Verlet Gore Test Module
 * Test implementation of Verlet integration for soft-body gore physics
 * Designed to run alongside existing gore system for comparison
 */

/**
 * Verlet Point - Basic physics point with position and previous position
 */
import * as THREE from '../three.module.js';

class VerletPoint {
    constructor(x, y, z, pinned = false) {
        this.position = new THREE.Vector3(x, y, z);
        this.prevPosition = this.position.clone();
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.pinned = pinned;
        this.mass = 1.0;
    }

    update(dt = 1.0, damping = 0.99) {
        if (this.pinned) return;

        // Verlet integration
        const velocity = this.position.clone().sub(this.prevPosition).multiplyScalar(damping);
        this.prevPosition.copy(this.position);
        
        this.position.add(velocity).add(
            this.acceleration.clone().multiplyScalar(dt * dt)
        );

        // Reset acceleration
        this.acceleration.set(0, 0, 0);
    }

    applyForce(force) {
        if (this.pinned) return;
        this.acceleration.add(force.clone().divideScalar(this.mass));
    }
}

/**
 * Verlet Constraint - Connection between two points with physics properties
 */
class VerletConstraint {
    constructor(pointA, pointB, config = {}) {
        this.a = pointA;
        this.b = pointB;
        this.restLength = config.restLength || pointA.position.distanceTo(pointB.position);
        this.stiffness = config.stiffness || 0.9;
        this.tearThreshold = config.tearThreshold || 2.0;
        this.layer = config.layer || 'muscle'; // 'skin', 'muscle', 'bone'
        this.torn = false;
        this.health = 1.0; // For progressive damage
    }

    solve() {
        if (this.torn) return;

        const delta = this.b.position.clone().sub(this.a.position);
        const dist = delta.length();

        // Check for tearing
        if (dist > this.restLength * this.tearThreshold) {
            return this.tear();
        }

        // Apply constraint
        const diff = (dist - this.restLength) / dist;
        const correction = delta.multiplyScalar(0.5 * this.stiffness * diff);

        if (!this.a.pinned) this.a.position.add(correction);
        if (!this.b.pinned) this.b.position.sub(correction);

        return false; // Not torn
    }

    tear() {
        this.torn = true;
        return {
            torn: true,
            position: this.a.position.clone().add(this.b.position).multiplyScalar(0.5),
            layer: this.layer
        };
    }

    damage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            return this.tear();
        }
        return false;
    }
}

/**
 * Verlet Gib - A soft-body gib made of points and constraints
 */
class VerletGib {
    constructor(position, size = 1.0, type = 'chunk') {
        this.position = position.clone();
        this.points = [];
        this.constraints = [];
        this.mesh = null;
        this.lifetime = 10000;
        this.type = type; // 'chunk', 'limb', 'organ'
        this.bloodiness = 1.0;

        this._createStructure(size, type);
    }

    _createStructure(size, type) {
        // Create different structures based on type
        switch(type) {
            case 'chunk':
                this._createChunk(size);
                break;
            case 'limb':
                this._createLimb(size);
                break;
            case 'organ':
                this._createOrgan(size);
                break;
        }
    }

    _createChunk(size) {
        // Create a deformable cube of flesh
        const gridSize = 3;
        const spacing = size / gridSize;

        // Create grid of points
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    const point = new VerletPoint(
                        this.position.x + (x - gridSize/2) * spacing,
                        this.position.y + (y - gridSize/2) * spacing,
                        this.position.z + (z - gridSize/2) * spacing
                    );
                    this.points.push(point);
                }
            }
        }

        // Connect points with constraints
        // Create a layered system: skin, muscle, bone
        const pointsPerLayer = gridSize * gridSize;
        
        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                const dist = this.points[i].position.distanceTo(this.points[j].position);
                
                // Only connect nearby points
                if (dist < spacing * 1.5) {
                    // Determine layer based on position
                    const isEdge = i < pointsPerLayer || j < pointsPerLayer;
                    const isCenter = i >= pointsPerLayer * (gridSize - 1) || 
                                   j >= pointsPerLayer * (gridSize - 1);
                    
                    let layer = 'muscle';
                    let stiffness = 0.8;
                    let tearThreshold = 1.6;
                    
                    if (isEdge) {
                        layer = 'skin';
                        stiffness = 0.6;
                        tearThreshold = 1.3;
                    } else if (isCenter) {
                        layer = 'bone';
                        stiffness = 0.95;
                        tearThreshold = 2.5;
                    }
                    
                    this.constraints.push(new VerletConstraint(
                        this.points[i],
                        this.points[j],
                        { layer, stiffness, tearThreshold }
                    ));
                }
            }
        }
    }

    _createLimb(size) {
        // Create an elongated structure for limbs
        const segments = 5;
        const radius = size * 0.3;

        for (let i = 0; i < segments; i++) {
            const y = i * size / segments;
            
            // Create ring of points for each segment
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
                const point = new VerletPoint(
                    this.position.x + Math.cos(angle) * radius,
                    this.position.y + y,
                    this.position.z + Math.sin(angle) * radius
                );
                this.points.push(point);
            }
        }

        // Connect points
        const pointsPerRing = 6;
        for (let i = 0; i < this.points.length - pointsPerRing; i++) {
            // Connect to next segment
            this.constraints.push(new VerletConstraint(
                this.points[i],
                this.points[i + pointsPerRing],
                { layer: 'muscle', stiffness: 0.85, tearThreshold: 1.8 }
            ));
            
            // Connect within segment
            const nextInRing = (i % pointsPerRing === pointsPerRing - 1) ? 
                              i - pointsPerRing + 1 : i + 1;
            if (nextInRing < this.points.length) {
                this.constraints.push(new VerletConstraint(
                    this.points[i],
                    this.points[nextInRing],
                    { layer: 'skin', stiffness: 0.7, tearThreshold: 1.4 }
                ));
            }
        }
    }

    _createOrgan(size) {
        // Create a squishy blob
        const points = 8;
        for (let i = 0; i < points; i++) {
            const phi = Math.acos(2 * i / points - 1);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            
            const point = new VerletPoint(
                this.position.x + size * Math.sin(phi) * Math.cos(theta),
                this.position.y + size * Math.sin(phi) * Math.sin(theta),
                this.position.z + size * Math.cos(phi)
            );
            this.points.push(point);
        }

        // Fully connected soft structure
        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                this.constraints.push(new VerletConstraint(
                    this.points[i],
                    this.points[j],
                    { layer: 'muscle', stiffness: 0.5, tearThreshold: 1.2 }
                ));
            }
        }
    }

    update(dt = 1.0) {
        // Update all points
        for (let point of this.points) {
            // Apply gravity
            point.applyForce(new THREE.Vector3(0, -0.98, 0));
            point.update(dt, 0.98);
        }

        // Solve constraints multiple times for stability
        for (let iteration = 0; iteration < 3; iteration++) {
            for (let constraint of this.constraints) {
                const result = constraint.solve();
                
                // If constraint tore, this would be where you create blood effects
                if (result && result.torn) {
                    // Return tear info for gore system to handle
                    return result;
                }
            }
        }

        // Update lifetime
        this.lifetime--;

        return null;
    }

    applyForce(force, position, radius = 0.5) {
        // Apply force to nearby points
        for (let point of this.points) {
            const dist = point.position.distanceTo(position);
            if (dist < radius) {
                const falloff = 1 - (dist / radius);
                point.applyForce(force.clone().multiplyScalar(falloff));
            }
        }
    }

    getCenterPosition() {
        if (this.points.length === 0) return this.position;
        
        const center = new THREE.Vector3();
        for (let point of this.points) {
            center.add(point.position);
        }
        return center.divideScalar(this.points.length);
    }
}

/**
 * Main Verlet Gore System
 */
export class VerletGoreSystem {
    constructor(engine, traditionalGore) {
        this.engine = engine;
        this.traditionalGore = traditionalGore; // Reference to existing gore system
        this.verletGibs = [];
        this.enabled = true;
        
        console.log('🧪 Verlet Gore Test System initialized');
    }

    // ===================================
    // WEAPON INTERACTIONS
    // ===================================

    /**
     * BLADE CUT - Creates a cutting plane that slices through constraints
     */
    applyBladeCut(position, direction, force = 5.0, width = 0.5) {
        const cutPlane = {
            origin: position.clone(),
            normal: direction.clone().normalize()
        };

        const tearResults = [];

        for (let gib of this.verletGibs) {
            // Check each constraint if it crosses the cut plane
            for (let constraint of gib.constraints) {
                if (constraint.torn) continue;

                const midpoint = constraint.a.position.clone()
                    .add(constraint.b.position).multiplyScalar(0.5);
                
                const distToPlane = Math.abs(
                    cutPlane.normal.dot(midpoint.clone().sub(cutPlane.origin))
                );

                // If constraint crosses the blade
                if (distToPlane < width) {
                    // Apply cutting force perpendicular to blade
                    const cutForce = cutPlane.normal.clone()
                        .multiplyScalar(force * (1 - distToPlane / width));
                    
                    constraint.a.applyForce(cutForce.clone());
                    constraint.b.applyForce(cutForce.clone().negate());

                    // Damage or sever constraint based on layer
                    const damageAmount = constraint.layer === 'skin' ? 0.8 : 
                                       constraint.layer === 'muscle' ? 0.5 : 0.2;
                    
                    const result = constraint.damage(damageAmount);
                    if (result) {
                        tearResults.push({
                            ...result,
                            gib: gib,
                            weaponType: 'blade'
                        });
                    }
                }
            }

            // Apply directional force to nearby points
            gib.applyForce(
                direction.clone().multiplyScalar(force * 0.5),
                position,
                width * 2
            );
        }

        return tearResults;
    }

    /**
     * BULLET IMPACT - Creates a small penetration with cavitation
     */
    applyBulletImpact(position, direction, force = 15.0, caliber = 0.2) {
        const tearResults = [];

        for (let gib of this.verletGibs) {
            const center = gib.getCenterPosition();
            const dist = center.distanceTo(position);

            // Only affect nearby gibs
            if (dist > 2.0) continue;

            // Create entry wound - focused high force
            const entryForce = direction.clone().multiplyScalar(force);
            gib.applyForce(entryForce, position, caliber);

            // Cavitation effect - explosive force along bullet path
            const cavitationPoint = position.clone().add(
                direction.clone().multiplyScalar(0.5 + Math.random() * 0.3)
            );
            const cavitationForce = new THREE.Vector3(
                (Math.random() - 0.5) * force * 0.8,
                (Math.random() - 0.5) * force * 0.8,
                (Math.random() - 0.5) * force * 0.8
            );
            gib.applyForce(cavitationForce, cavitationPoint, caliber * 3);

            // Damage constraints along bullet path
            for (let constraint of gib.constraints) {
                if (constraint.torn) continue;

                const midpoint = constraint.a.position.clone()
                    .add(constraint.b.position).multiplyScalar(0.5);
                
                // Distance to bullet line
                const toMidpoint = midpoint.clone().sub(position);
                const projection = direction.clone().multiplyScalar(
                    toMidpoint.dot(direction)
                );
                const distToLine = toMidpoint.sub(projection).length();

                if (distToLine < caliber * 2) {
                    const result = constraint.damage(0.6);
                    if (result) {
                        tearResults.push({
                            ...result,
                            gib: gib,
                            weaponType: 'bullet'
                        });
                    }
                }
            }
        }

        return tearResults;
    }

    /**
     * EXPLOSION - Radial force with falloff
     */
    applyExplosion(position, force = 20.0, radius = 3.0, shrapnel = true) {
        const tearResults = [];

        for (let gib of this.verletGibs) {
            const center = gib.getCenterPosition();
            const dist = center.distanceTo(position);

            if (dist > radius) continue;

            // Radial force with falloff
            const direction = center.clone().sub(position).normalize();
            const falloff = 1 - (dist / radius);
            const explosiveForce = direction.multiplyScalar(force * falloff * falloff);

            // Apply to all points (explosions affect everything)
            for (let point of gib.points) {
                const pointDist = point.position.distanceTo(position);
                const pointFalloff = 1 - (pointDist / radius);
                const pointDirection = point.position.clone().sub(position).normalize();
                
                point.applyForce(
                    pointDirection.multiplyScalar(force * pointFalloff * pointFalloff)
                );
            }

            // Shrapnel damage - random constraint damage
            if (shrapnel) {
                const damageCount = Math.floor(gib.constraints.length * 0.3 * falloff);
                for (let i = 0; i < damageCount; i++) {
                    const randomConstraint = gib.constraints[
                        Math.floor(Math.random() * gib.constraints.length)
                    ];
                    if (!randomConstraint.torn) {
                        const result = randomConstraint.damage(0.4);
                        if (result) {
                            tearResults.push({
                                ...result,
                                gib: gib,
                                weaponType: 'explosion'
                            });
                        }
                    }
                }
            }
        }

        return tearResults;
    }

    /**
     * SHOTGUN BLAST - Multiple bullet paths with spread
     */
    applyShotgunBlast(position, direction, pelletCount = 12, spread = 0.3, force = 10.0) {
        const allTearResults = [];

        for (let i = 0; i < pelletCount; i++) {
            // Random spread
            const spreadDir = direction.clone();
            spreadDir.x += (Math.random() - 0.5) * spread;
            spreadDir.y += (Math.random() - 0.5) * spread;
            spreadDir.z += (Math.random() - 0.5) * spread;
            spreadDir.normalize();

            // Each pellet acts like a small bullet
            const results = this.applyBulletImpact(
                position, 
                spreadDir, 
                force,
                0.1 // Small caliber
            );
            allTearResults.push(...results);
        }

        return allTearResults;
    }

    /**
     * CRUSH - Compression force (for stomping, crushing, etc)
     */
    applyCrush(position, force = 8.0, radius = 0.8) {
        const tearResults = [];

        for (let gib of this.verletGibs) {
            // Compress points toward center
            for (let point of gib.points) {
                const dist = point.position.distanceTo(position);
                if (dist < radius) {
                    const falloff = 1 - (dist / radius);
                    const direction = position.clone().sub(point.position).normalize();
                    point.applyForce(
                        direction.multiplyScalar(force * falloff)
                    );
                }
            }

            // High chance of constraint failure under compression
            for (let constraint of gib.constraints) {
                if (constraint.torn) continue;

                const midpoint = constraint.a.position.clone()
                    .add(constraint.b.position).multiplyScalar(0.5);
                const dist = midpoint.distanceTo(position);

                if (dist < radius) {
                    const falloff = 1 - (dist / radius);
                    if (Math.random() < falloff * 0.5) {
                        const result = constraint.damage(0.7);
                        if (result) {
                            tearResults.push({
                                ...result,
                                gib: gib,
                                weaponType: 'crush'
                            });
                        }
                    }
                }
            }
        }

        return tearResults;
    }

    // ===================================
    // GIB CREATION
    // ===================================

    createVerletGib(position, velocity, type = 'chunk', size = 0.8) {
        const gib = new VerletGib(position, size, type);
        
        // Apply initial velocity to all points
        for (let point of gib.points) {
            const offset = point.position.clone().sub(position).multiplyScalar(0.1);
            const initialVel = velocity.clone().add(offset);
            point.prevPosition.copy(point.position.clone().sub(initialVel));
        }

        this.verletGibs.push(gib);
        
        // Create visual mesh for the gib
        this._createGibVisuals(gib);

        return gib;
    }

    _createGibVisuals(gib) {
        // Create a mesh based on the point cloud
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(gib.points.length * 3);
        
        for (let i = 0; i < gib.points.length; i++) {
            positions[i * 3] = gib.points[i].position.x;
            positions[i * 3 + 1] = gib.points[i].position.y;
            positions[i * 3 + 2] = gib.points[i].position.z;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Create indices for a convex hull (simplified)
        const indices = [];
        for (let i = 0; i < gib.points.length - 2; i++) {
            indices.push(0, i + 1, i + 2);
        }
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x8B0000,
            roughness: 0.9,
            metalness: 0.1
        });

        gib.mesh = new THREE.Mesh(geometry, material);
        this.engine.scene.add(gib.mesh);
    }

    _updateGibVisuals(gib) {
        if (!gib.mesh) return;

        const positions = gib.mesh.geometry.attributes.position.array;
        
        for (let i = 0; i < gib.points.length; i++) {
            positions[i * 3] = gib.points[i].position.x;
            positions[i * 3 + 1] = gib.points[i].position.y;
            positions[i * 3 + 2] = gib.points[i].position.z;
        }
        
        gib.mesh.geometry.attributes.position.needsUpdate = true;
        gib.mesh.geometry.computeVertexNormals();
    }

    // ===================================
    // UPDATE & INTEGRATION
    // ===================================

    update(engine) {
        if (!this.enabled) return;

        for (let i = this.verletGibs.length - 1; i >= 0; i--) {
            const gib = this.verletGibs[i];
            
            // Update physics
            const tearResult = gib.update(1.0);
            
            // If constraint tore, create blood effects using traditional system
            if (tearResult && this.traditionalGore) {
                const bloodIntensity = tearResult.layer === 'artery' ? 3 : 1;
                this.traditionalGore.createArterialSpray(
                    tearResult.position,
                    new THREE.Vector3(
                        Math.random() - 0.5,
                        Math.random(),
                        Math.random() - 0.5
                    ),
                    bloodIntensity
                );
            }

            // Ground collision for all points
            for (let point of gib.points) {
                const groundLevel = engine.getTerrainHeight(point.position.x, point.position.z);
                if (point.position.y < groundLevel + 0.1) {
                    point.position.y = groundLevel + 0.1;
                    // Bounce with friction
                    const vel = point.position.clone().sub(point.prevPosition);
                    vel.y *= -0.2;
                    vel.x *= 0.7;
                    vel.z *= 0.7;
                    point.prevPosition.copy(point.position.clone().sub(vel));
                }
            }

            // Update visuals
            this._updateGibVisuals(gib);

            // Lifetime management
            if (gib.lifetime <= 0) {
                if (gib.mesh) {
                    engine.scene.remove(gib.mesh);
                }
                this.verletGibs.splice(i, 1);
            }
        }
    }

    // ===================================
    // TESTING UTILITIES
    // ===================================

    /**
     * Create a test scenario with a Verlet gib
     */
    createTestScenario(type = 'chunk') {
        const pos = new THREE.Vector3(0, 5, 0);
        const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 2,
            (Math.random() - 0.5) * 2
        );
        
        return this.createVerletGib(pos, vel, type, 1.0);
    }

    /**
     * Toggle between Verlet and traditional gore
     */
    toggle() {
        this.enabled = !this.enabled;
        console.log(`🧪 Verlet Gore ${this.enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    /**
     * Cleanup
     */
    clear() {
        for (let gib of this.verletGibs) {
            if (gib.mesh) {
                this.engine.scene.remove(gib.mesh);
            }
        }
        this.verletGibs = [];
        console.log('🧪 Verlet Gore cleared');
    }
}
