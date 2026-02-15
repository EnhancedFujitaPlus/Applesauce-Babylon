/**
 * APPLESAUCE Skater Module - FIXED VERSION
 * Fixed mass properties and damping for better movement
 */

export class BabylonSkater {
    constructor(scene) {
        this.scene = scene;
        this.skaterGroup = null;
        this.deck = null;
        this.body = null;
        this.head = null;
        this.physicsAggregate = null;
        
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
        
        // PHYSICS - FIXED VERSION
        const physicsCollider = BABYLON.MeshBuilder.CreateCapsule(
            "skaterCollider",
            { height: 2, radius: 0.5 },
            this.scene
        );
        physicsCollider.position = new BABYLON.Vector3(x, y, z);
        physicsCollider.isVisible = false;
        
        // Add physics with CORRECTED settings
        const aggregate = new BABYLON.PhysicsAggregate(
            physicsCollider,
            BABYLON.PhysicsShapeType.CAPSULE,
            { 
                mass: 70,
                restitution: 0.1,
                friction: 0.4
            },
            this.scene
        );
        
        // FIXED: Use proper damping values (0-1 range, lower = less damping)
        aggregate.body.setLinearDamping(0.1);   // Was 0.1 - keep this
        aggregate.body.setAngularDamping(0.5);  // Was 0.99 - FIXED! Much lower now
        
        // FIXED: Don't lock inertia - let Havok handle it naturally
        // The old code had: setMassProperties({ inertia: [0, 1, 0] })
        // This was PREVENTING movement! Removed it.
        
        // Optional: Prevent tipping over by locking X and Z rotation
        // But we do this through constraints, not mass properties
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
        
        // Sync visual model to physics collider
        // Capsule height=2, radius=0.5, so total height = 3
        // Capsule center to bottom = 1.5
        // We want wheels (at y=0.15 on visual) to be slightly above ground
        this.skaterRoot.position = this.physicsCollider.position.clone();
        this.skaterRoot.position.y -= 1.35; // Adjusted offset for proper wheel clearance
        
        // Match rotation (only Y axis for turning)
        this.skaterRoot.rotation.y = this.physicsCollider.rotation.y;
    }
    
    moveForward(force = 50) {
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
