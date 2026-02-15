/**
 * APPLESAUCE Skater Module - FIXED VERSION
 * Fixed mass properties and damping for better movement
 */

export class BabylonSkater {
    constructor(scene, debug = false) {
        this.scene = scene;
        this.skaterGroup = null;
        this.deck = null;
        this.body = null;
        this.head = null;
        this.physicsAggregate = null;
        this.debug = debug;
        this.rayHelper = null;
        
        console.log('🛹 Babylon Skater module loaded (FIXED)');
    }
    
    spawn(config = {}) {
        const x = config.x || 0;
        const y = config.y || 5;
        const z = config.z || 0;
        const deckColor = config.deckColor || new BABYLON.Color3(1, 0.08, 0.58);
        const bodyColor = config.bodyColor || new BABYLON.Color3(0.2, 0.2, 0.2);
        const skinColor = config.skinColor || new BABYLON.Color3(1, 0.86, 0.67);
        
        // Create root transform node
        const skaterRoot = new BABYLON.TransformNode("skaterRoot", this.scene);
        skaterRoot.position = new BABYLON.Vector3(x, y, z);
        
        // SKATEBOARD DECK
        const deck = BABYLON.MeshBuilder.CreateBox(
            "deck",
            { width: 0.8, height: 0.1, depth: 2.5 },
            this.scene
        );
        deck.position = new BABYLON.Vector3(0, 0.3, 0);
        deck.parent = skaterRoot;
        
        const deckMat = new BABYLON.StandardMaterial("deckMat", this.scene);
        deckMat.diffuseColor = deckColor;
        deckMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        deck.material = deckMat;
        deck.castShadow = true;
        
        this.deck = deck;
        
        // WHEELS
        const wheelPositions = [
            { x: -0.3, y: 0.15, z: -0.8 },
            { x: 0.3, y: 0.15, z: -0.8 },
            { x: -0.3, y: 0.15, z: 0.8 },
            { x: 0.3, y: 0.15, z: 0.8 }
        ];
        
        const wheelMat = new BABYLON.StandardMaterial("wheelMat", this.scene);
        wheelMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
        
        wheelPositions.forEach((pos, i) => {
            const wheel = BABYLON.MeshBuilder.CreateCylinder(
                `wheel${i}`,
                { height: 0.1, diameter: 0.3, tessellation: 12 },
                this.scene
            );
            wheel.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);
            wheel.rotation.z = Math.PI / 2;
            wheel.parent = skaterRoot;
            wheel.material = wheelMat;
            wheel.castShadow = true;
        });
        
        // BODY
        const body = BABYLON.MeshBuilder.CreateBox(
            "body",
            { width: 0.6, height: 1.2, depth: 0.4 },
            this.scene
        );
        body.position = new BABYLON.Vector3(0, 1.2, -0.2);
        body.parent = skaterRoot;
        
        const bodyMat = new BABYLON.StandardMaterial("bodyMat", this.scene);
        bodyMat.diffuseColor = bodyColor;
        body.material = bodyMat;
        body.castShadow = true;
        
        this.body = body;
        
        // HEAD
        const head = BABYLON.MeshBuilder.CreateSphere(
            "head",
            { diameter: 0.6, segments: 8 },
            this.scene
        );
        head.position = new BABYLON.Vector3(0, 2.1, -0.2);
        head.parent = skaterRoot;
        
        const headMat = new BABYLON.StandardMaterial("headMat", this.scene);
        headMat.diffuseColor = skinColor;
        head.material = headMat;
        head.castShadow = true;
        
        this.head = head;
        
        // ARMS
        [-1, 1].forEach(side => {
            const arm = BABYLON.MeshBuilder.CreateBox(
                `arm${side}`,
                { width: 0.2, height: 0.8, depth: 0.2 },
                this.scene
            );
            arm.position = new BABYLON.Vector3(side * 0.4, 1.2, -0.2);
            arm.parent = skaterRoot;
            arm.material = bodyMat;
            arm.castShadow = true;
        });
        
        // LEGS
        [-1, 1].forEach(side => {
            const leg = BABYLON.MeshBuilder.CreateBox(
                `leg${side}`,
                { width: 0.2, height: 0.6, depth: 0.2 },
                this.scene
            );
            leg.position = new BABYLON.Vector3(side * 0.2, 0.6, -0.2);
            leg.parent = skaterRoot;
            leg.material = bodyMat;
            leg.castShadow = true;
        });
        
        // PHYSICS - Capsule with proper ground clearance
        const physicsCollider = BABYLON.MeshBuilder.CreateCapsule(
            "skaterCollider",
            { 
                height: 1.5,  // Shorter capsule for better control
                radius: 0.6   // Slightly wider for stability
            },
            this.scene
        );
        physicsCollider.position = new BABYLON.Vector3(x, y, z);
        physicsCollider.isVisible = false;
        
        // Add physics with CORRECTED settings
        const aggregate = new BABYLON.PhysicsAggregate(
            physicsCollider,
            BABYLON.PhysicsShapeType.CAPSULE,
            { 
                mass: 10,
                restitution: 0.1,
                friction: 0.8  // Increased slightly for better control
            },
            this.scene
        );
        
        // FIXED: Use proper damping values (0-1 range, lower = less damping)
        aggregate.body.setLinearDamping(0.15);   // Slight increase for stability
        aggregate.body.setAngularDamping(0.6);   // Prevent excessive spinning
        
        // Lock rotation on X and Z axes to prevent tipping
        aggregate.body.setAngularVelocity(new BABYLON.Vector3(0, aggregate.body.getAngularVelocity().y, 0));
        
        aggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
        
        this.physicsAggregate = aggregate;
        this.physicsCollider = physicsCollider;
        this.skaterRoot = skaterRoot;
        
        console.log(`🛹 Skater spawned at (${x}, ${y}, ${z})`);
        console.log('Physics aggregate:', aggregate);
        console.log('Mass:', aggregate.body.getMassProperties().mass);
        console.log('Motion type:', aggregate.body.getMotionType());
        
        return {
            root: skaterRoot,
            collider: physicsCollider,
            aggregate: aggregate,
            parts: {
                deck: this.deck,
                body: this.body,
                head: this.head
            }
        };
    }
    
    update() {
        if (!this.skaterRoot || !this.physicsCollider) return;
        
        // Keep skater upright - prevent tipping over
        if (this.physicsAggregate) {
            const angVel = this.physicsAggregate.body.getAngularVelocity();
            // Only allow rotation around Y axis (turning), zero out X and Z
            this.physicsAggregate.body.setAngularVelocity(new BABYLON.Vector3(0, angVel.y, 0));
        }
        
        // Get physics collider position
        const colliderPos = this.physicsCollider.position;
        
        // Raycast downward to find ground distance
        const rayStart = colliderPos.clone();
        const rayDirection = new BABYLON.Vector3(0, -1, 0);
        const rayLength = 10;
        
        const ray = new BABYLON.Ray(rayStart, rayDirection, rayLength);
        const hit = this.scene.pickWithRay(ray, (mesh) => {
            // Only hit static physics objects (ground, stairs, etc)
            return mesh !== this.physicsCollider && 
                   mesh !== this.skaterRoot && 
                   mesh.name !== 'skaterCollider' &&
                   !mesh.name.includes('wheel') &&
                   !mesh.name.includes('deck') &&
                   !mesh.name.includes('body') &&
                   !mesh.name.includes('head') &&
                   !mesh.name.includes('arm') &&
                   !mesh.name.includes('leg');
        });
        
        // Debug visualization
        if (this.debug) {
            if (!this.rayHelper) {
                this.rayHelper = new BABYLON.RayHelper(ray);
                this.rayHelper.show(this.scene, new BABYLON.Color3(0, 1, 1));
            } else {
                this.rayHelper.dispose();
                this.rayHelper = new BABYLON.RayHelper(ray);
                this.rayHelper.show(this.scene, new BABYLON.Color3(0, 1, 1));
            }
        }
        
        // Calculate proper offset based on ground distance
        let yOffset = -1.0; // Default offset
        
        if (hit && hit.hit) {
            // Distance from collider center to ground
            const groundDistance = hit.distance;
            
            // Capsule radius is 0.6, and wheels should be at 0.15 above ground
            // So visual model should be: groundDistance - capsule_bottom_to_center - wheel_height
            // Capsule bottom to center = 0.75 (half of height=1.5)
            yOffset = -groundDistance + 0.6; // Keep wheels just above ground
            
            // Clamp to prevent extreme offsets
            yOffset = Math.max(-1.5, Math.min(-0.3, yOffset));
        }
        
        // Sync visual model to physics collider with calculated offset
        this.skaterRoot.position = colliderPos.clone();
        this.skaterRoot.position.y += yOffset;
        
        // Match rotation (only Y axis for turning)
        this.skaterRoot.rotation.y = this.physicsCollider.rotation.y;
    }
    
    moveForward(force = 500) {
        if (!this.physicsAggregate) return;
        
        // Wake up physics body if sleeping
        this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
        
        const forward = this.physicsCollider.forward;
        const forceVec = forward.scale(force);
        
        this.physicsAggregate.body.applyForce(
            forceVec,
            this.physicsCollider.getAbsolutePosition()
        );
    }
    
    moveBackward(force = 30) {
        if (!this.physicsAggregate) return;
        
        // Wake up physics body if sleeping
        this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
        
        const backward = this.physicsCollider.forward.scale(-1);
        const forceVec = backward.scale(force);
        
        this.physicsAggregate.body.applyForce(
            forceVec,
            this.physicsCollider.getAbsolutePosition()
        );
    }
    
    turnLeft(torque = 5) {
        if (!this.physicsAggregate) return;
        
        this.physicsAggregate.body.applyTorque(
            new BABYLON.Vector3(0, torque, 0)
        );
    }
    
    turnRight(torque = 5) {
        if (!this.physicsAggregate) return;
        
        this.physicsAggregate.body.applyTorque(
            new BABYLON.Vector3(0, -torque, 0)
        );
    }
    
    jump(force = 300) {
        if (!this.physicsAggregate) return;
        
        this.physicsAggregate.body.applyImpulse(
            new BABYLON.Vector3(0, force, 0),
            this.physicsCollider.getAbsolutePosition()
        );
    }
    
    getVelocity() {
        if (!this.physicsAggregate) return new BABYLON.Vector3(0, 0, 0);
        return this.physicsAggregate.body.getLinearVelocity();
    }
    
    getSpeed() {
        const vel = this.getVelocity();
        return Math.sqrt(vel.x * vel.x + vel.z * vel.z);
    }
    
    getPosition() {
        return this.physicsCollider ? this.physicsCollider.position : new BABYLON.Vector3(0, 0, 0);
    }
    
    doKickflip() {
        if (!this.deck) return;
        this.deck.rotation.x += 0.3;
    }
    
    resetDeckRotation() {
        if (!this.deck) return;
        this.deck.rotation.x *= 0.9;
        this.deck.rotation.z *= 0.9;
    }
    
    leanLeft() {
        if (!this.deck) return;
        this.deck.rotation.z = Math.min(this.deck.rotation.z + 0.05, 0.2);
    }
    
    leanRight() {
        if (!this.deck) return;
        this.deck.rotation.z = Math.max(this.deck.rotation.z - 0.05, -0.2);
    }
    
    resetLean() {
        if (!this.deck) return;
        this.deck.rotation.z *= 0.9;
    }
    
    setDeckColor(color) {
        if (this.deck && this.deck.material) {
            this.deck.material.diffuseColor = color;
        }
    }
    
    setBodyColor(color) {
        if (this.body && this.body.material) {
            this.body.material.diffuseColor = color;
        }
    }
    
    remove() {
        if (this.skaterRoot) {
            this.skaterRoot.dispose();
        }
        if (this.physicsCollider) {
            this.physicsCollider.dispose();
        }
        if (this.physicsAggregate) {
            this.physicsAggregate.dispose();
        }
        
        console.log('🛹 Skater removed');
    }
}
