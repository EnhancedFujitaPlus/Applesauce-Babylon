# 🩸 Three.js → Babylon.js + Havok Gore Migration Guide

## What Just Happened

You now have **ULTRABABYlon Goring Testing Facility** - a working demo that shows:
- Real Havok physics for blood particles and gibs
- Screen effects (blood flash, lens splatters, combo system)
- Physics-based body parts with twitching
- Blood stains on ground
- Camera shake
- Performance-optimized particle management

## Key Differences: Your Gore System vs Babylon Version

### Three.js (Your Current System)
```javascript
// You manually manage physics
particle.position.add(particle.velocity);
particle.velocity.y -= 0.015; // Manual gravity
// Manual ground collision
if (particle.position.y < groundLevel + 0.1) { ... }
```

### Babylon.js + Havok
```javascript
// Havok handles physics automatically
const aggregate = new BABYLON.PhysicsAggregate(
    blood,
    BABYLON.PhysicsShapeType.SPHERE,
    { mass: 0.01, restitution: 0.3, friction: 0.8 },
    scene
);
aggregate.body.applyImpulse(velocity, blood.getAbsolutePosition());
// Havok does: gravity, collisions, bouncing, friction, rotation
```

**Translation:**
- Your `particle.velocity` → Havok's `applyImpulse()` 
- Your manual ground collision → Havok's collision detection
- Your rotation math → Havok's `applyAngularImpulse()`

## Core Babylon.js Concepts (vs Three.js)

### 1. Scene Setup
```javascript
// Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Babylon.js
const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.UniversalCamera("cam", position, scene);
// No separate renderer - engine handles it
```

### 2. Materials
```javascript
// Three.js
const material = new THREE.MeshStandardMaterial({ color: 0x8B0000 });

// Babylon.js
const material = new BABYLON.StandardMaterial("mat", scene);
material.diffuseColor = new BABYLON.Color3(0.54, 0, 0); // RGB 0-1
material.emissiveColor = new BABYLON.Color3(0.3, 0, 0); // Self-glow
```

### 3. Geometry
```javascript
// Three.js
const geometry = new THREE.SphereGeometry(0.5, 8, 8);
const mesh = new THREE.Mesh(geometry, material);

// Babylon.js (more streamlined)
const mesh = BABYLON.MeshBuilder.CreateSphere(
    "sphere", 
    { diameter: 1, segments: 8 }, 
    scene
);
mesh.material = material;
```

### 4. Physics (THE BIG WIN)
```javascript
// Your Three.js approach - manual everything
updateParticle(particle) {
    particle.position.add(particle.velocity);
    particle.velocity.y -= 0.015; // Gravity
    particle.velocity.multiplyScalar(0.98); // Air resistance
    
    // Ground collision
    const groundLevel = this.getTerrainHeight(particle.position.x, particle.position.z);
    if (particle.position.y < groundLevel) {
        particle.position.y = groundLevel;
        particle.velocity.y *= -0.3; // Bounce
        particle.velocity.x *= 0.5; // Friction
    }
}

// Babylon.js + Havok - automatic
const aggregate = new BABYLON.PhysicsAggregate(
    mesh,
    BABYLON.PhysicsShapeType.SPHERE,
    { 
        mass: 0.01,           // Controls how gravity affects it
        restitution: 0.3,     // Bounciness (0 = no bounce, 1 = perfect bounce)
        friction: 0.8         // How much it drags on surfaces
    },
    scene
);

// Apply force once, Havok handles the rest
aggregate.body.applyImpulse(velocity, mesh.getAbsolutePosition());
```

## Porting Your Gore Features

### Blood Particles ✅
**Status:** Fully ported  
**Difference:** Havok handles physics, you just set initial impulse

### Gibs (Body Parts) ✅
**Status:** Fully ported with upgrades  
**Upgrades:** 
- Real physics tumbling (no manual rotation needed)
- Collision with other gibs
- Twitching via angular impulses

### Blood Stains ✅
**Status:** Ported  
**Note:** No physics needed, just disc meshes on ground

### Arterial Spray ⏳
**Not Yet Ported:** But easy to add
```javascript
createArterialSpray(position, direction) {
    for (let i = 0; i < 50; i++) {
        const blood = BABYLON.MeshBuilder.CreateSphere(...);
        const aggregate = new BABYLON.PhysicsAggregate(...);
        
        // Spray direction with spread
        const vel = direction.clone().scale(15);
        vel.x += (Math.random() - 0.5) * 2;
        vel.z += (Math.random() - 0.5) * 2;
        
        aggregate.body.applyImpulse(vel, blood.getAbsolutePosition());
    }
}
```

### Blood Mist ⏳
**Not Yet Ported:** No physics needed
```javascript
createBloodMist(position, intensity) {
    for (let i = 0; i < 10 * intensity; i++) {
        const mist = BABYLON.MeshBuilder.CreateSphere(...);
        const mistMat = new BABYLON.StandardMaterial("mist", scene);
        mistMat.diffuseColor = new BABYLON.Color3(0.5, 0, 0);
        mistMat.alpha = 0.4; // Semi-transparent
        mist.material = mistMat;
        
        // Slow drift, no physics needed
        mist.customVelocity = new BABYLON.Vector3(
            (Math.random() - 0.5) * 0.02,
            Math.random() * 0.05,
            (Math.random() - 0.5) * 0.02
        );
        
        // In update loop:
        mist.position.addInPlace(mist.customVelocity);
    }
}
```

## Building From Here: Level Expansion

### 1. Add More Geometry (Ramps, Rails, Obstacles)
```javascript
// Skate ramp
const ramp = BABYLON.MeshBuilder.CreateBox(
    "ramp", 
    { width: 5, height: 2, depth: 10 }, 
    scene
);
ramp.position = new BABYLON.Vector3(10, 1, 0);
ramp.rotation.z = Math.PI / 6; // 30° angle

// Physics for ramp
new BABYLON.PhysicsAggregate(
    ramp,
    BABYLON.PhysicsShapeType.BOX,
    { mass: 0 }, // mass: 0 = static (won't move)
    scene
);
```

### 2. Skater Character (Basic Version)
```javascript
// Capsule for skater body
const skater = BABYLON.MeshBuilder.CreateCapsule(
    "skater",
    { height: 1.8, radius: 0.3 },
    scene
);
skater.position.y = 2;

const skaterAggregate = new BABYLON.PhysicsAggregate(
    skater,
    BABYLON.PhysicsShapeType.CAPSULE,
    { mass: 70, friction: 0.1 }, // Low friction = slippery
    scene
);

// Apply forward impulse on key press
if (keys.forward) {
    const forward = camera.getForwardRay().direction.scale(50);
    skaterAggregate.body.applyImpulse(forward, skater.getAbsolutePosition());
}
```

### 3. Trick System (Ollies, Grinds)
```javascript
// Ollie = upward impulse
if (keys.space && skater.position.y < 1) {
    const jumpForce = new BABYLON.Vector3(0, 500, 0);
    skaterAggregate.body.applyImpulse(jumpForce, skater.getAbsolutePosition());
}

// Grind detection (collision callback)
skaterAggregate.body.setCollisionCallbackEnabled(true);
scene.onBeforePhysicsObservable.add(() => {
    // Check if skater is touching rail
    // If yes, apply side-to-side stabilization
    // Lock to rail geometry
});
```

### 4. Enemy System with Ragdoll Physics
```javascript
createRagdollEnemy(position) {
    // Head
    const head = BABYLON.MeshBuilder.CreateSphere("head", { diameter: 0.5 }, scene);
    const headBody = new BABYLON.PhysicsAggregate(head, BABYLON.PhysicsShapeType.SPHERE, { mass: 5 }, scene);
    
    // Torso
    const torso = BABYLON.MeshBuilder.CreateBox("torso", { width: 0.6, height: 1, depth: 0.4 }, scene);
    const torsoBody = new BABYLON.PhysicsAggregate(torso, BABYLON.PhysicsShapeType.BOX, { mass: 30 }, scene);
    
    // Arms, legs... (same pattern)
    
    // Connect with constraints (THIS IS THE MAGIC)
    const neckJoint = new BABYLON.Physics6DoFConstraint(
        { 
            pivotA: new BABYLON.Vector3(0, 0.5, 0),  // Top of torso
            pivotB: new BABYLON.Vector3(0, -0.25, 0) // Bottom of head
        },
        [headBody.body, torsoBody.body],
        scene
    );
    
    // This creates a realistic ragdoll that flops around when you hit it!
}
```

### 5. Combo Scoring with Tricks
```javascript
class ComboSystem {
    constructor() {
        this.tricks = [];
        this.multiplier = 1;
    }
    
    addTrick(trickName, basePoints) {
        this.tricks.push(trickName);
        this.multiplier = Math.min(this.multiplier + 0.2, 5);
        return basePoints * this.multiplier;
    }
    
    addKill() {
        return this.addTrick("KILL", 100);
    }
    
    addOllie() {
        return this.addTrick("OLLIE", 50);
    }
    
    addGrind(duration) {
        return this.addTrick("GRIND", duration * 10);
    }
}
```

## Performance Optimization

### Havok Physics Limits
```javascript
// Havok can handle WAY more than manual physics
// But you should still limit:
const MAX_BLOOD_PARTICLES = 2000;  // Was 500 in demo
const MAX_GIBS = 200;              // Was 50 in demo
const MAX_RAGDOLLS = 20;

// Remove old particles when limit reached
if (this.bloodParticles.length > MAX_BLOOD_PARTICLES) {
    const toRemove = this.bloodParticles.splice(0, 100);
    toRemove.forEach(p => {
        p.mesh.dispose();
        p.aggregate.dispose(); // IMPORTANT: Dispose physics body too
    });
}
```

### Sleeping Bodies
```javascript
// Havok automatically puts still objects to "sleep" to save CPU
// You can force wake them:
aggregate.body.setLinearVelocity(new BABYLON.Vector3(0, 1, 0)); // Wakes it up

// Or manually sleep:
aggregate.body.disablePreStep = false; // Sleeps it
```

## Next Steps: From Demo → Full APPLESAUCE Game

### Phase 1: Core Movement (1-2 days)
- [ ] Add skater capsule with physics
- [ ] WASD movement with impulses
- [ ] Ollie/jump mechanic
- [ ] Camera follow system

### Phase 2: Level Geometry (2-3 days)
- [ ] Import .obj/.gltf level models OR
- [ ] Build modular ramp system
- [ ] Add grindable rails
- [ ] Quarterpipes, bowls, stairs

### Phase 3: Trick System (3-4 days)
- [ ] Grind detection + rail locking
- [ ] Flip tricks (rotation tracking)
- [ ] Combo scoring
- [ ] Speed multipliers

### Phase 4: Enemies + Gore (2-3 days)
- [ ] Enemy spawning system
- [ ] Ragdoll creation (use testing facility code)
- [ ] Kill triggers (collision → gore)
- [ ] Port all gore effects from your Three.js system

### Phase 5: Polish (ongoing)
- [ ] Sound effects
- [ ] Music integration
- [ ] UI/HUD system
- [ ] Level progression
- [ ] Save/load system

## Making It Offline-Ready

```javascript
// 1. Download Babylon.js files
// From: https://cdn.babylonjs.com/babylon.js
// Save as: libs/babylon.js

// 2. Download Havok
// From: https://cdn.babylonjs.com/havok/HavokPhysics_umd.js
// Save as: libs/HavokPhysics_umd.js

// 3. Update HTML references
<script src="libs/HavokPhysics_umd.js"></script>
<script src="libs/babylon.js"></script>

// 4. Package everything in a folder:
APPLESAUCE_OFFLINE/
├── index.html
├── libs/
│   ├── babylon.js
│   └── HavokPhysics_umd.js
├── assets/
│   ├── models/
│   ├── textures/
│   └── sounds/
└── js/
    ├── gore.js
    ├── skater.js
    └── levels.js

// 5. For .exe distribution, use Electron:
npm install electron
// Wrap your HTML in Electron app
// Build for Windows/Mac/Linux
```

## Why Babylon.js Wins for APPLESAUCE

1. **Havok Physics** - Industry-grade ragdolls, destruction
2. **Mobile Performance** - Better optimization than Three.js for phones
3. **Built-in Tools** - Inspector, particle system, animation system
4. **One Codebase** - PC + Mobile from same HTML
5. **Active Development** - Babylon.js 8 is cutting edge

## Common Pitfalls (Things I Learned)

### Dispose Physics Bodies!
```javascript
// BAD - Memory leak
particle.mesh.dispose();

// GOOD
particle.mesh.dispose();
particle.aggregate.dispose(); // Free physics body too
```

### Vectors Are Not Reusable
```javascript
// BAD - Modifies original
const vel = velocity.scale(2);

// GOOD
const vel = velocity.clone().scale(2);
```

### Mass Matters
```javascript
// Blood particles: mass 0.01 (light, floaty)
// Body parts: mass 0.5-1 (meaty, heavy)
// Skater: mass 70 (realistic weight)
// Ground/walls: mass 0 (immovable)
```

## Resources

- Babylon.js Docs: https://doc.babylonjs.com/
- Havok Physics: https://doc.babylonjs.com/features/featuresDeepDive/physics/havokPlugin
- Examples: https://playground.babylonjs.com/
- That demo you linked (if it loads): Lo-th's physics experiments

---

**TL;DR:** Your gore system translates beautifully to Babylon.js. The testing facility proves Havok can handle your particle counts. Next step: build the skater character and level geometry using the same physics approach. You'll have a working game in weeks, not months.

🩸 Ready to make APPLESAUCE the most disgustingly awesome skating game ever made.
