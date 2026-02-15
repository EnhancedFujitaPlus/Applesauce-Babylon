/**
 * APPLESAUCE Skater Module - BABYLON.JS + HAVOK EDITION
 * Reusable player model for all levels
 * Now with real physics!
 */

export class BabylonSkater {
    constructor(scene) {
        this.scene = scene;
        this.skaterGroup = null;
        this.deck = null;
        this.body = null;
        this.head = null;
        this.physicsAggregate = null;
        
        console.log('🛹 Babylon Skater module loaded');
    }
    
    /**
     * Creates and spawns the skater with Havok physics
     * @param {Object} config - Spawn configuration
     * @returns {Object} { mesh, aggregate, parts }
     */
    spawn(config = {}) {
        const x = config.x || 0;
        const y = config.y || 5;
        const z = config.z || 0;
        const deckColor = config.deckColor || new BABYLON.Color3(1, 0.08, 0.58); // Hot pink
        const bodyColor = config.bodyColor || new BABYLON.Color3(0.2, 0.2, 0.2); // Dark gray
        const skinColor = config.skinColor || new BABYLON.Color3(1, 0.86, 0.67); // Skin tone
        
        // Create root transform node for the skater
        const skaterRoot = new BABYLON.TransformNode("skaterRoot", this.scene);
        skaterRoot.position = new BABYLON.Vector3(x, y, z);
        
        // ===================================
        // SKATEBOARD DECK
        // ===================================
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
        
        // ===================================
        // WHEELS (4 wheels)
        // ===================================
        const wheelPositions = [
            { x: -0.3, y: 0.15, z: -0.8 },  // Front left
            { x: 0.3, y: 0.15, z: -0.8 },   // Front right
            { x: -0.3, y: 0.15, z: 0.8 },   // Back left
            { x: 0.3, y: 0.15, z: 0.8 }     // Back right
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
            wheel.rotation.z = Math.PI / 2; // Rotate to horizontal
            wheel.parent = skaterRoot;
            wheel.material = wheelMat;
            wheel.castShadow = true;
        });
        
        // ===================================
        // SKATER BODY
        // ===================================
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
        
        // ===================================
        // HEAD
        // ===================================
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
        
        // ===================================
        // ARMS (left and right)
        // ===================================
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
        
        // ===================================
        // LEGS (left and right)
        // ===================================
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
        
        // ===================================
        // PHYSICS - Simple Capsule Collider
        // ===================================
        
        // Create invisible capsule for physics
        const physicsCollider = BABYLON.MeshBuilder.CreateCapsule(
            "skaterCollider",
            { height: 2, radius: 0.5 },
            this.scene
        );
        physicsCollider.position = new BABYLON.Vector3(x, y, z);
        physicsCollider.isVisible = false; // Invisible collision shape
        
        // Add physics
        const aggregate = new BABYLON.PhysicsAggregate(
            physicsCollider,
            BABYLON.PhysicsShapeType.CAPSULE,
            { 
                mass: 70,           // Realistic human weight
                restitution: 0.1,   // Low bounce
                friction: 0.4       // Medium friction
            },
            this.scene
        );
        
        // Prevent capsule from tipping over
        aggregate.body.setAngularDamping(0.99);
        aggregate.body.setLinearDamping(0.1);
        
        // Lock rotation on X and Z axes (only allow Y rotation for turning)
        aggregate.body.setMassProperties({
            inertia: new BABYLON.Vector3(0, 1, 0) // Only allow Y-axis rotation
        });
        
        this.physicsAggregate = aggregate;
        this.physicsCollider = physicsCollider;
        this.skaterRoot = skaterRoot;
        
        console.log(`🛹 Skater spawned at (${x}, ${y}, ${z})`);
        
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
    
    /**
     * Update skater visual position to match physics collider
     */
    update() {
        if (!this.skaterRoot || !this.physicsCollider) return;
        
        // Sync visual model to physics collider
        this.skaterRoot.position = this.physicsCollider.position.clone();
        this.skaterRoot.position.y -= 0.8; // Offset so feet are at collider bottom
        
        // Match rotation (only Y axis for turning)
        this.skaterRoot.rotation.y = this.physicsCollider.rotation.y;
    }
    
    /**
     * Apply movement force
     */
    moveForward(force = 50) {
        if (!this.physicsAggregate) return;
        
        const forward = this.physicsCollider.forward;
        const forceVec = forward.scale(force);
        
        this.physicsAggregate.body.applyForce(
            forceVec,
            this.physicsCollider.getAbsolutePosition()
        );
    }
    
    moveBackward(force = 30) {
        if (!this.physicsAggregate) return;
        
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
    
    /**
     * Jump (apply upward impulse)
     */
    jump(force = 300) {
        if (!this.physicsAggregate) return;
        
        this.physicsAggregate.body.applyImpulse(
            new BABYLON.Vector3(0, force, 0),
            this.physicsCollider.getAbsolutePosition()
        );
    }
    
    /**
     * Get current velocity
     */
    getVelocity() {
        if (!this.physicsAggregate) return new BABYLON.Vector3(0, 0, 0);
        return this.physicsAggregate.body.getLinearVelocity();
    }
    
    /**
     * Get current speed (magnitude of horizontal velocity)
     */
    getSpeed() {
        const vel = this.getVelocity();
        return Math.sqrt(vel.x * vel.x + vel.z * vel.z);
    }
    
    /**
     * Get position
     */
    getPosition() {
        return this.physicsCollider ? this.physicsCollider.position : new BABYLON.Vector3(0, 0, 0);
    }
    
    /**
     * Kickflip animation
     */
    doKickflip() {
        if (!this.deck) return;
        
        // Animate deck rotation
        this.deck.rotation.x += 0.3;
    }
    
    /**
     * Reset deck rotation (smooth)
     */
    resetDeckRotation() {
        if (!this.deck) return;
        this.deck.rotation.x *= 0.9;
        this.deck.rotation.z *= 0.9;
    }
    
    /**
     * Lean animation during turns
     */
    leanLeft() {
        if (!this.deck) return;
        this.deck.rotation.z = Math.min(this.deck.rotation.z + 0.05, 0.2);
    }
    
    leanRight() {
        if (!this.deck) return;
        this.deck.rotation.z = Math.max(this.deck.rotation.z - 0.05, -0.2);
    }
    
    /**
     * Return to center lean
     */
    resetLean() {
        if (!this.deck) return;
        this.deck.rotation.z *= 0.9;
    }
    
    /**
     * Change deck color
     */
    setDeckColor(color) {
        if (this.deck && this.deck.material) {
            this.deck.material.diffuseColor = color;
        }
    }
    
    /**
     * Change body color
     */
    setBodyColor(color) {
        if (this.body && this.body.material) {
            this.body.material.diffuseColor = color;
        }
    }
    
    /**
     * Remove skater from scene
     */
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
