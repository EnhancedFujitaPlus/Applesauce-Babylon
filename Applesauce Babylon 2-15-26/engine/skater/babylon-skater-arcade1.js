/**
 * APPLESAUCE Skater Module - ARCADE PHYSICS VERSION
 * 
 * Uses velocity-based movement for fast, responsive arcade feel
 * Matches the original Three.js movement system
 */

export class BabylonSkater {
    constructor(scene, debug = false) {
        this.scene = scene;
        this.skaterRoot = null;
        this.deck = null;
        this.body = null;
        this.head = null;
        this.physicsAggregate = null;
        this.physicsCollider = null;
        this.debug = debug;
        this.rayHelper = null;
        
        // ARCADE MOVEMENT STATE
        this.state = {
            speed: 0,
            rotation: 0,
            acceleration: 0.015,
            maxSpeed: 0.8,
            friction: 0.97,
            turnSpeed: 0.04,
            gravity: -0.015,
            jumpVelocity: 0,
            jumping: false,
            grounded: false,
            grinding: false,
            currentRail: null,
            canTrick: false,
            spinning: false,
            spinRotation: 0
        };
        
        console.log('🛹 Babylon Skater ARCADE module loaded');
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
        deck.checkCollisions = false;
        
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
            wheel.checkCollisions = false;
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
        body.checkCollisions = false;
        
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
        head.checkCollisions = false;
        
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
            arm.checkCollisions = false;
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
            leg.checkCollisions = false;
        });
        
        // PHYSICS - Simple capsule for collision only
        const physicsCollider = BABYLON.MeshBuilder.CreateCapsule(
            "skaterCollider",
            { 
                height: 1.5,
                radius: 0.6
            },
            this.scene
        );
        physicsCollider.position = new BABYLON.Vector3(x, y, z);
        physicsCollider.isVisible = false;
        
        // Add physics with kinematic motion (we control movement manually)
        const aggregate = new BABYLON.PhysicsAggregate(
            physicsCollider,
            BABYLON.PhysicsShapeType.CAPSULE,
            { 
                mass: 1,
                restitution: 0,
                friction: 0
            },
            this.scene
        );
        
        // Use ANIMATED motion type - we move it manually, but it still collides
        aggregate.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
        aggregate.body.disablePreStep = false;
        
        this.physicsAggregate = aggregate;
        this.physicsCollider = physicsCollider;
        this.skaterRoot = skaterRoot;
        
        // Initialize rotation
        this.state.rotation = 0;
        
        console.log(`🛹 Skater spawned at (${x}, ${y}, ${z}) - ARCADE MODE`);
        
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
        
        // Apply friction
        this.state.speed *= this.state.friction;
        
        // Calculate forward direction
        const forward = new BABYLON.Vector3(
            Math.sin(this.state.rotation),
            0,
            Math.cos(this.state.rotation)
        );
        
        // Update position based on speed
        this.physicsCollider.position.x += forward.x * this.state.speed;
        this.physicsCollider.position.z += forward.z * this.state.speed;
        
        // Update rotation
        this.physicsCollider.rotation.y = this.state.rotation;
        
        // GROUND DETECTION with raycast
        const rayStart = this.physicsCollider.position.clone();
        const rayDirection = new BABYLON.Vector3(0, -1, 0);
        const rayLength = 5;
        
        const ray = new BABYLON.Ray(rayStart, rayDirection, rayLength);
        const hit = this.scene.pickWithRay(ray, (mesh) => {
            return mesh !== this.physicsCollider && 
                   mesh !== this.skaterRoot && 
                   mesh.name !== 'skaterCollider' &&
                   !mesh.name.includes('wheel') &&
                   !mesh.name.includes('deck') &&
                   !mesh.name.includes('body') &&
                   !mesh.name.includes('head') &&
                   !mesh.name.includes('arm') &&
                   !mesh.name.includes('leg') &&
                   !mesh.name.includes('helmet');
        });
        
        // Debug ray
        if (this.debug) {
            if (this.rayHelper) {
                this.rayHelper.dispose();
            }
            this.rayHelper = new BABYLON.RayHelper(ray);
            this.rayHelper.show(this.scene, new BABYLON.Color3(0, 1, 1));
        }
        
        // JUMP AND GRAVITY
        if (this.state.jumping || this.state.grinding) {
            if (!this.state.grinding) {
                // Apply gravity
                this.physicsCollider.position.y += this.state.jumpVelocity;
                this.state.jumpVelocity += this.state.gravity;
            }
            
            // Check if landed
            if (hit && hit.hit) {
                const groundLevel = hit.pickedPoint.y + 1.0; // Offset for skater height
                
                if (this.physicsCollider.position.y <= groundLevel && !this.state.grinding) {
                    this.physicsCollider.position.y = groundLevel;
                    this.state.jumping = false;
                    this.state.jumpVelocity = 0;
                    this.state.grounded = true;
                    this.state.spinning = false;
                    this.state.spinRotation = 0;
                    this.deck.rotation.x = 0;
                }
            }
        } else {
            // On ground, match terrain
            if (hit && hit.hit) {
                const groundLevel = hit.pickedPoint.y + 1.0;
                this.physicsCollider.position.y = groundLevel;
                this.state.grounded = true;
            } else {
                // No ground detected, start falling
                this.state.grounded = false;
                this.state.jumping = true;
                this.state.jumpVelocity = 0;
            }
        }
        
        // TRICK ANIMATION
        if (this.state.spinning) {
            this.state.spinRotation += 0.3;
            this.deck.rotation.x = this.state.spinRotation;
        }
        
        // Sync visual model to physics position
        this.skaterRoot.position = this.physicsCollider.position.clone();
        this.skaterRoot.position.y -= 1.0; // Offset for visual
        this.skaterRoot.rotation.y = this.state.rotation;
    }
    
    // ARCADE MOVEMENT METHODS
    accelerateForward() {
        this.state.speed = Math.min(this.state.speed + this.state.acceleration, this.state.maxSpeed);
    }
    
    accelerateBackward() {
        this.state.speed = Math.max(this.state.speed - this.state.acceleration, -this.state.maxSpeed * 0.5);
    }
    
    turnLeft() {
        this.state.rotation += this.state.turnSpeed;
    }
    
    turnRight() {
        this.state.rotation -= this.state.turnSpeed;
    }
    
    jump() {
        if (this.state.grounded && !this.state.jumping) {
            this.state.jumping = true;
            this.state.jumpVelocity = 0.35;
            this.state.grounded = false;
            this.state.canTrick = true;
        }
    }
    
    doTrick(trickType = 'kickflip') {
        if (!this.state.grounded && this.state.canTrick) {
            this.state.spinning = true;
            this.state.spinRotation = 0;
            this.state.canTrick = false;
            return true;
        }
        return false;
    }
    
    // Add downhill boost
    addDownhillBoost(amount = 0.02) {
        this.state.speed += amount;
    }
    
    // GRINDING
    checkGrinding(rails) {
        // Don't start grinding if already grounded
        if (this.state.grounded) {
            if (this.state.grinding) {
                this.state.grinding = false;
                this.state.currentRail = null;
            }
            return false;
        }
        
        // Only check when airborne and descending
        if (this.state.jumpVelocity > 0.05) return false;
        
        for (let rail of rails) {
            const railPos = rail.position;
            const dx = this.physicsCollider.position.x - railPos.x;
            const dz = this.physicsCollider.position.z - railPos.z;
            const horizontalDist = Math.sqrt(dx * dx + dz * dz);
            
            const dy = this.physicsCollider.position.y - railPos.y;
            
            // Collision detection
            if (horizontalDist < 3 && Math.abs(dy) < 2) {
                this.state.grinding = true;
                this.state.currentRail = rail;
                this.state.jumpVelocity = 0;
                this.physicsCollider.position.y = railPos.y + 1.0;
                return true;
            }
        }
        
        return false;
    }
    
    updateGrinding() {
        if (this.state.grinding && this.state.currentRail) {
            const railPos = this.state.currentRail.position;
            const dx = this.physicsCollider.position.x - railPos.x;
            const dz = this.physicsCollider.position.z - railPos.z;
            const horizontalDist = Math.sqrt(dx * dx + dz * dz);
            
            // Fall off if too far
            if (horizontalDist > 4) {
                this.state.grinding = false;
                this.state.currentRail = null;
                this.state.jumpVelocity = -0.1;
                return false;
            }
            return true;
        }
        return false;
    }
    
    jumpOffGrind() {
        if (this.state.grinding) {
            this.state.grinding = false;
            this.state.currentRail = null;
            this.state.jumpVelocity = 0.35;
            this.state.jumping = true;
            this.state.grounded = false;
            this.state.canTrick = true;
        }
    }
    
    // GETTERS
    getVelocity() {
        const forward = new BABYLON.Vector3(
            Math.sin(this.state.rotation),
            0,
            Math.cos(this.state.rotation)
        );
        return forward.scale(this.state.speed);
    }
    
    getSpeed() {
        return Math.abs(this.state.speed);
    }
    
    getPosition() {
        return this.physicsCollider ? this.physicsCollider.position : new BABYLON.Vector3(0, 0, 0);
    }
    
    isGrounded() {
        return this.state.grounded;
    }
    
    isGrinding() {
        return this.state.grinding;
    }
    
    isSpinning() {
        return this.state.spinning;
    }
    
    getRotation() {
        return this.state.rotation;
    }
    
    // VISUAL EFFECTS
    leanLeft() {
        if (this.deck) {
            this.deck.rotation.z = Math.min(this.deck.rotation.z + 0.05, 0.2);
        }
    }
    
    leanRight() {
        if (this.deck) {
            this.deck.rotation.z = Math.max(this.deck.rotation.z - 0.05, -0.2);
        }
    }
    
    resetLean() {
        if (this.deck) {
            this.deck.rotation.z *= 0.9;
        }
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
        if (this.rayHelper) {
            this.rayHelper.dispose();
        }
        
        console.log('🛹 Skater removed');
    }
}
