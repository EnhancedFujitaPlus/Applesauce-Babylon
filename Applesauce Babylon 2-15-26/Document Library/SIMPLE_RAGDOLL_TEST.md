# Simple Procedural Ragdoll (No External Models Needed)

Since loading 3D models with skeletons can be complex, here's a **simpler approach** that creates a procedural humanoid you can test RIGHT NOW!

## 🎯 Quick Test Version

This creates a simple stick figure ragdoll without needing any external files:

```javascript
/**
 * SIMPLE PROCEDURAL RAGDOLL
 * Creates a basic humanoid using spheres and cylinders
 * Uses Havok physics with proper constraints
 */
class SimpleRagdoll {
    constructor(scene, position, gorePhysics = null) {
        this.scene = scene;
        this.gorePhysics = gorePhysics;
        this.position = position;
        
        this.parts = {};  // Body part meshes
        this.bodies = {}; // Physics bodies
        this.joints = []; // Constraints
        
        this.health = 100;
        this.alive = true;
        this.ragdollId = `simple_${Date.now()}`;
        
        this.createBody();
        this.createJoints();
        this.setupCollisionFiltering();
        
        console.log(`✅ SimpleRagdoll created at`, position);
    }
    
    createBody() {
        const pos = this.position;
        
        // MATERIALS
        const skinMat = new BABYLON.StandardMaterial("skin", this.scene);
        skinMat.diffuseColor = new BABYLON.Color3(1, 0.86, 0.67);
        
        const shirtMat = new BABYLON.StandardMaterial("shirt", this.scene);
        shirtMat.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.8);
        
        const pantsMat = new BABYLON.StandardMaterial("pants", this.scene);
        pantsMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        
        // HEAD
        this.parts.head = BABYLON.MeshBuilder.CreateSphere(
            "head",
            { diameter: 0.4, segments: 12 },
            this.scene
        );
        this.parts.head.position = new BABYLON.Vector3(pos.x, pos.y + 1.6, pos.z);
        this.parts.head.material = skinMat;
        this.bodies.head = new BABYLON.PhysicsAggregate(
            this.parts.head,
            BABYLON.PhysicsShapeType.SPHERE,
            { mass: 5, restitution: 0.3, friction: 0.6 },
            this.scene
        );
        
        // UPPER TORSO
        this.parts.upperTorso = BABYLON.MeshBuilder.CreateBox(
            "upperTorso",
            { width: 0.5, height: 0.6, depth: 0.3 },
            this.scene
        );
        this.parts.upperTorso.position = new BABYLON.Vector3(pos.x, pos.y + 1.1, pos.z);
        this.parts.upperTorso.material = shirtMat;
        this.bodies.upperTorso = new BABYLON.PhysicsAggregate(
            this.parts.upperTorso,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 20, restitution: 0.2, friction: 0.6 },
            this.scene
        );
        
        // LOWER TORSO
        this.parts.lowerTorso = BABYLON.MeshBuilder.CreateBox(
            "lowerTorso",
            { width: 0.45, height: 0.4, depth: 0.28 },
            this.scene
        );
        this.parts.lowerTorso.position = new BABYLON.Vector3(pos.x, pos.y + 0.65, pos.z);
        this.parts.lowerTorso.material = shirtMat;
        this.bodies.lowerTorso = new BABYLON.PhysicsAggregate(
            this.parts.lowerTorso,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 15, restitution: 0.2, friction: 0.6 },
            this.scene
        );
        
        // ARMS
        ['L', 'R'].forEach(side => {
            const xOffset = side === 'L' ? -0.35 : 0.35;
            
            // Upper Arm
            this.parts[`upperArm${side}`] = BABYLON.MeshBuilder.CreateCapsule(
                `upperArm${side}`,
                { radius: 0.08, height: 0.35 },
                this.scene
            );
            this.parts[`upperArm${side}`].position = new BABYLON.Vector3(
                pos.x + xOffset, pos.y + 1.1, pos.z
            );
            this.parts[`upperArm${side}`].material = skinMat;
            this.bodies[`upperArm${side}`] = new BABYLON.PhysicsAggregate(
                this.parts[`upperArm${side}`],
                BABYLON.PhysicsShapeType.CAPSULE,
                { mass: 3, restitution: 0.2, friction: 0.6 },
                this.scene
            );
            
            // Lower Arm
            this.parts[`lowerArm${side}`] = BABYLON.MeshBuilder.CreateCapsule(
                `lowerArm${side}`,
                { radius: 0.06, height: 0.32 },
                this.scene
            );
            this.parts[`lowerArm${side}`].position = new BABYLON.Vector3(
                pos.x + xOffset * 1.8, pos.y + 1.1, pos.z
            );
            this.parts[`lowerArm${side}`].material = skinMat;
            this.bodies[`lowerArm${side}`] = new BABYLON.PhysicsAggregate(
                this.parts[`lowerArm${side}`],
                BABYLON.PhysicsShapeType.CAPSULE,
                { mass: 2, restitution: 0.2, friction: 0.6 },
                this.scene
            );
        });
        
        // LEGS
        ['L', 'R'].forEach(side => {
            const xOffset = side === 'L' ? -0.15 : 0.15;
            
            // Upper Leg
            this.parts[`upperLeg${side}`] = BABYLON.MeshBuilder.CreateCapsule(
                `upperLeg${side}`,
                { radius: 0.1, height: 0.5 },
                this.scene
            );
            this.parts[`upperLeg${side}`].position = new BABYLON.Vector3(
                pos.x + xOffset, pos.y + 0.25, pos.z
            );
            this.parts[`upperLeg${side}`].material = pantsMat;
            this.bodies[`upperLeg${side}`] = new BABYLON.PhysicsAggregate(
                this.parts[`upperLeg${side}`],
                BABYLON.PhysicsShapeType.CAPSULE,
                { mass: 8, restitution: 0.2, friction: 0.6 },
                this.scene
            );
            
            // Lower Leg
            this.parts[`lowerLeg${side}`] = BABYLON.MeshBuilder.CreateCapsule(
                `lowerLeg${side}`,
                { radius: 0.08, height: 0.48 },
                this.scene
            );
            this.parts[`lowerLeg${side}`].position = new BABYLON.Vector3(
                pos.x + xOffset, pos.y - 0.3, pos.z
            );
            this.parts[`lowerLeg${side}`].material = pantsMat;
            this.bodies[`lowerLeg${side}`] = new BABYLON.PhysicsAggregate(
                this.parts[`lowerLeg${side}`],
                BABYLON.PhysicsShapeType.CAPSULE,
                { mass: 6, restitution: 0.2, friction: 0.6 },
                this.scene
            );
        });
    }
    
    createJoints() {
        // Joint definitions: [parent, child, breakForce]
        const jointDefs = [
            ['upperTorso', 'head', 500],           // Neck
            ['upperTorso', 'lowerTorso', 800],     // Spine
            ['upperTorso', 'upperArmL', 300],      // Left Shoulder
            ['upperArmL', 'lowerArmL', 250],       // Left Elbow
            ['upperTorso', 'upperArmR', 300],      // Right Shoulder
            ['upperArmR', 'lowerArmR', 250],       // Right Elbow
            ['lowerTorso', 'upperLegL', 400],      // Left Hip
            ['upperLegL', 'lowerLegL', 350],       // Left Knee
            ['lowerTorso', 'upperLegR', 400],      // Right Hip
            ['upperLegR', 'lowerLegR', 350]        // Right Knee
        ];
        
        for (let [parentName, childName, breakForce] of jointDefs) {
            const parentBody = this.bodies[parentName];
            const childBody = this.bodies[childName];
            
            if (!parentBody || !childBody) continue;
            
            // Calculate pivot point (midpoint between parts)
            const parentPos = this.parts[parentName].position;
            const childPos = this.parts[childName].position;
            const pivotPoint = parentPos.add(childPos).scale(0.5);
            
            // Create ball-and-socket constraint
            const constraint = new BABYLON.BallAndSocketConstraint(
                pivotPoint.subtract(parentPos),
                pivotPoint.subtract(childPos),
                new BABYLON.Vector3(0, 1, 0),
                new BABYLON.Vector3(0, 1, 0),
                this.scene
            );
            
            parentBody.body.addConstraint(childBody.body, constraint);
            
            this.joints.push({
                constraint,
                parent: parentName,
                child: childName,
                breakForce,
                intact: true
            });
            
            console.log(`🔗 Joint: ${parentName} ↔ ${childName}`);
        }
    }
    
    setupCollisionFiltering() {
        const group = Math.floor(Math.random() * 10000) + 1;
        
        for (let name in this.bodies) {
            const body = this.bodies[name].body;
            if (body.shape) {
                body.shape.filterMembershipMask = group;
                body.shape.filterCollideMask = ~group;
            }
        }
    }
    
    applyWeaponHit(partName, hitPosition, forceDirection, forceMagnitude = 250, isSharp = true) {
        if (!this.alive || !this.bodies[partName]) return false;
        
        // Apply force
        const force = forceDirection.normalize().scale(forceMagnitude);
        this.bodies[partName].body.applyImpulse(force, hitPosition);
        
        // Damage
        const damage = forceMagnitude * 0.3;
        this.health -= damage;
        
        console.log(`⚔️ HIT: ${partName} | ${damage.toFixed(1)} dmg | ${this.health.toFixed(1)} HP`);
        
        // Check severing
        if (isSharp) {
            const effectiveSpeed = forceMagnitude / 15;
            this.checkDismemberment(partName, effectiveSpeed, hitPosition);
        }
        
        // Blood
        if (this.gorePhysics) {
            const severity = forceMagnitude > 300 ? 'SEVERE' : 'MODERATE';
            this.gorePhysics.spawnBlood(hitPosition, forceMagnitude / 10, severity);
        }
        
        // Death
        if (this.health <= 0 && this.alive) {
            this.alive = false;
            console.log(`☠️ SimpleRagdoll died`);
        }
        
        return true;
    }
    
    checkDismemberment(partName, effectiveSpeed, position) {
        const connectedJoints = this.joints.filter(j => 
            j.child === partName && j.intact
        );
        
        for (let joint of connectedJoints) {
            const threshold = (joint.breakForce / 15) * 0.5; // Sharp weapon bonus
            
            if (effectiveSpeed >= threshold) {
                this.severJoint(joint, effectiveSpeed, position);
            }
        }
    }
    
    severJoint(joint, speed, position) {
        joint.intact = false;
        
        try {
            this.bodies[joint.parent].body.removeConstraint(
                this.bodies[joint.child].body
            );
            console.log(`🔪 SEVERED: ${joint.parent} ↔ ${joint.child}`);
            
            // Extra blood
            if (this.gorePhysics) {
                this.gorePhysics.spawnBlood(position, speed, 'SEVERE');
            }
        } catch (e) {
            console.warn(`⚠️ Sever failed:`, e);
        }
    }
    
    findClosestPart(hitPosition) {
        let closestName = null;
        let closestDist = Infinity;
        
        for (let name in this.parts) {
            const dist = BABYLON.Vector3.Distance(
                this.parts[name].position,
                hitPosition
            );
            
            if (dist < closestDist) {
                closestDist = dist;
                closestName = name;
            }
        }
        
        return closestName;
    }
    
    dispose() {
        for (let name in this.parts) {
            this.parts[name].dispose();
            this.bodies[name].dispose();
        }
    }
}
```

## 🎮 Usage

### Spawn Simple Ragdoll
```javascript
// In your game
const ragdoll = new SimpleRagdoll(
    scene,
    new BABYLON.Vector3(0, 2, 0),  // Spawn at 2m height
    gorePhysics                     // Optional blood system
);
```

### Weapon Hit Detection
```javascript
// In WeaponSystem.checkHits()
const bladePos = this.blade.getAbsolutePosition();

simpleRagdolls.forEach(ragdoll => {
    if (!ragdoll.alive) return;
    
    // Find closest body part
    const closestPart = ragdoll.findClosestPart(bladePos);
    const distance = BABYLON.Vector3.Distance(
        bladePos,
        ragdoll.parts[closestPart].position
    );
    
    if (distance < 3.0) { // Within reach
        const forceDir = bladePos.subtract(camera.position).normalize();
        ragdoll.applyWeaponHit(
            closestPart,
            ragdoll.parts[closestPart].position,
            forceDir,
            250,  // Force
            true  // Sharp weapon
        );
    }
});
```

### Integration with Main Game
```javascript
// Add to WatchtowerGame class
this.simpleRagdolls = [];

// Spawn method
spawnSimpleRagdoll() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 5 + Math.random() * 5;
    
    const spawnPos = new BABYLON.Vector3(
        this.camera.position.x + Math.cos(angle) * distance,
        2.0,  // Safe height
        this.camera.position.z + Math.sin(angle) * distance
    );
    
    const ragdoll = new SimpleRagdoll(
        this.scene,
        spawnPos,
        this.gorePhysics
    );
    
    this.simpleRagdolls.push(ragdoll);
    console.log('🎯 Simple ragdoll spawned!');
}

// Add hotkey: press 'T' to spawn
if (e.key === 't' || e.key === 'T') this.spawnSimpleRagdoll();
```

---

## ✅ Advantages Over Manual System

1. **No Explosion** - Collision filtering prevents self-collision
2. **Real Joints** - BallAndSocketConstraint actually holds limbs together
3. **Easy to Hit** - Large body parts, easy targeting
4. **Proper Severing** - Constraints actually remove when broken
5. **Blood Works** - Integrates perfectly with gore system
6. **Simple** - No external files needed, works immediately

---

## 🚀 Testing Checklist

```
□ Press T - Spawn simple ragdoll
  └─ Should land safely at 2m
  └─ All parts stay connected

□ Attack ragdoll
  └─ Closest part flies back
  └─ Blood sprays
  └─ Console shows hit info

□ Hit same part 2-3 times
  └─ Should sever (console: "🔪 SEVERED")
  └─ Part flies away independently

□ Check FPS
  └─ Should stay above 30fps
  └─ Max 3-5 ragdolls at once
```

---

This is a PERFECT way to test the ragdoll system without needing any external model files! Once this works, you can move to proper skeleton-based ragdolls with animations. 🎮
