# 🌲 Forest Destruction System Guide

## What Changed: Three.js → Babylon.js + Havok

### Your Original Forest (Three.js)
- 1000 static trees
- Manual collision detection
- Trees "knocked down" = visual rotation
- No physics simulation
- Trees disappear or rotate when hit
- ~900 lines of manual tree management

### New Forest (Babylon.js + Havok)
- 1000 physics-enabled trees
- Automatic collision detection
- Trees EXPLODE into debris when destroyed
- Real physics simulation for all debris
- Each tree = 8 wood fragments with physics
- Fragments tumble, bounce, settle naturally
- ~600 lines (Havok does the heavy lifting)

---

## How Tree Destruction Works

### 1. Tree Creation
```javascript
class DestructibleTree {
    createTree() {
        // Trunk (cylinder)
        const trunk = BABYLON.MeshBuilder.CreateCylinder(...);
        
        // Canopy (sphere) - attached to trunk
        const canopy = BABYLON.MeshBuilder.CreateSphere(...);
        canopy.parent = trunk;
        
        // Physics: Static until destroyed
        const aggregate = new BABYLON.PhysicsAggregate(
            trunk,
            BABYLON.PhysicsShapeType.CYLINDER,
            { mass: 0 }, // Static = doesn't move
            scene
        );
    }
}
```

**Trees start as static obstacles** - they have physics shape but don't move (mass: 0).

### 2. Collision Detection
```javascript
checkCollision(playerPos, speed) {
    const dist = BABYLON.Vector3.Distance(playerPos, this.position);
    
    // Hit if close enough AND going fast enough
    return dist < (this.trunkRadius + 0.5) && speed > CONFIG.MIN_SPEED_TO_DESTROY;
}
```

**Speed threshold (8)** - Must be going fast to destroy trees. Slow bumps do nothing.

### 3. Destruction → Debris Creation
```javascript
destroy(impactVelocity) {
    // Remove original tree
    this.mesh.dispose();
    this.aggregate.dispose();
    
    // Create 8 wood fragments
    for (let i = 0; i < 8; i++) {
        const fragment = BABYLON.MeshBuilder.CreateBox(...);
        
        // Each fragment gets physics
        const aggregate = new BABYLON.PhysicsAggregate(
            fragment,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 5-15, restitution: 0.3, friction: 0.6 },
            scene
        );
        
        // Explosion force (outward from impact)
        const explosionDir = randomDirection.normalize();
        const force = explosionDir.scale(50-150);
        
        aggregate.body.applyImpulse(force, fragment.position);
        
        // Random spin
        aggregate.body.applyAngularImpulse(randomTorque);
    }
}
```

**What Havok Does Automatically:**
- Debris flies outward from explosion
- Gravity pulls fragments down
- Fragments bounce off ground
- Fragments collide with each other
- Fragments tumble and spin realistically
- Fragments eventually settle on ground

### 4. Debris Cleanup
```javascript
// Each debris piece has lifetime
debris.push({
    mesh: fragment,
    aggregate: aggregate,
    lifetime: 400 + Math.random() * 200 // ~7-10 seconds
});

// In update loop
for (let i = debris.length - 1; i >= 0; i--) {
    debris[i].lifetime--;
    if (debris[i].lifetime <= 0) {
        debris[i].mesh.dispose();
        debris[i].aggregate.dispose(); // CRITICAL: Dispose physics too
        debris.splice(i, 1);
    }
}

// Also limit total debris
while (debris.length > CONFIG.MAX_DEBRIS) {
    const old = debris.shift();
    old.mesh.dispose();
    old.aggregate.dispose();
}
```

---

## Performance Optimization

### The Challenge
- 1000 trees
- 8 debris per tree
- Max possible: 8,000 physics bodies
- That would DESTROY performance

### The Solution: Debris Limits

```javascript
const CONFIG = {
    DEBRIS_PER_TREE: 8,     // Fragments per tree
    MAX_DEBRIS: 500         // Total debris limit
};
```

**How it works:**
1. Destroy tree → create 8 debris
2. If debris count > 500 → remove oldest debris
3. New debris pushes out old debris
4. Only most recent ~60 trees' debris exists at once

**Result:** Never more than 500 physics bodies, smooth 60 FPS

### Tuning Performance

**For BETTER performance (30 FPS → 60 FPS):**
```javascript
CONFIG.DEBRIS_PER_TREE = 4;  // Fewer fragments per tree
CONFIG.MAX_DEBRIS = 300;     // Lower total limit
```

**For MORE destruction (if you have beefy PC):**
```javascript
CONFIG.DEBRIS_PER_TREE = 12; // More fragments
CONFIG.MAX_DEBRIS = 800;     // Higher limit
```

**For MAXIMUM carnage (if GPU is a beast):**
```javascript
CONFIG.DEBRIS_PER_TREE = 16;
CONFIG.MAX_DEBRIS = 1500;
// Warning: May drop to 30 FPS with lots of destruction
```

---

## Haunted Mode

### Activation
```javascript
const percentDestroyed = treesDestroyed / TOTAL_TREES;
if (percentDestroyed >= 0.75) { // 75% destroyed
    activateHauntedMode();
}
```

### Visual Changes
```javascript
function activateHauntedMode() {
    // Red color scheme
    scene.clearColor = new BABYLON.Color3(0.3, 0.1, 0.1);
    scene.fogColor = new BABYLON.Color3(0.3, 0.1, 0.1);
    
    // HUD turns red with glitch effect
    document.getElementById('hud').classList.add('haunted');
    
    // Warning message
    showWarning('THE FOREST IS ANGRY');
}
```

### What You Can Add

**Ghost Enemy (from original):**
```javascript
class ForestGhost {
    constructor(scene, targetPosition) {
        this.mesh = BABYLON.MeshBuilder.CreateSphere(
            "ghost",
            { diameter: 3, segments: 8 },
            scene
        );
        
        const mat = new BABYLON.StandardMaterial("ghostMat", scene);
        mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
        mat.alpha = 0.5; // Semi-transparent
        mat.emissiveColor = new BABYLON.Color3(0.5, 0, 0); // Red glow
        this.mesh.material = mat;
        
        // Physics
        this.aggregate = new BABYLON.PhysicsAggregate(
            this.mesh,
            BABYLON.PhysicsShapeType.SPHERE,
            { mass: 50, restitution: 0.8 }, // Bouncy
            scene
        );
    }
    
    chase(targetPos) {
        const myPos = this.mesh.position;
        const direction = targetPos.subtract(myPos).normalize();
        
        // Apply force toward player
        const chaseForce = direction.scale(200);
        this.aggregate.body.applyForce(
            chaseForce,
            this.mesh.getAbsolutePosition()
        );
    }
}

// Spawn ghost when haunted mode activates
let ghost = null;
function activateHauntedMode() {
    // ... visual changes ...
    
    // Spawn ghost
    ghost = new ForestGhost(scene, skater.getPosition());
}

// In update loop
if (gameState.hauntedMode && ghost) {
    ghost.chase(skater.getPosition());
}
```

---

## Advanced Destruction Features

### 1. Tree Types (Different Destruction)

```javascript
class OakTree extends DestructibleTree {
    constructor(scene, position) {
        super(scene, position);
        this.debrisCount = 12; // More debris
        this.requiredSpeed = 10; // Harder to destroy
    }
}

class PineTree extends DestructibleTree {
    constructor(scene, position) {
        super(scene, position);
        this.debrisCount = 6; // Less debris
        this.requiredSpeed = 6; // Easier to destroy
    }
}

class DeadTree extends DestructibleTree {
    constructor(scene, position) {
        super(scene, position);
        this.debrisCount = 4;
        this.requiredSpeed = 3; // Very easy to destroy
        this.canopyColor = new BABYLON.Color3(0.3, 0.3, 0.2); // Brown
    }
}
```

### 2. Falling Trees (Tipping Over)

Instead of instant explosion, make trees fall like real trees:

```javascript
destroy(impactVelocity) {
    // Convert from static to dynamic
    this.aggregate.dispose();
    
    this.aggregate = new BABYLON.PhysicsAggregate(
        this.mesh,
        BABYLON.PhysicsShapeType.CYLINDER,
        { mass: 100, friction: 0.8 }, // Now it can move!
        this.scene
    );
    
    // Apply force to tip it over
    const tipForce = impactVelocity.clone().scale(50);
    tipForce.y = 20; // Upward component
    
    this.aggregate.body.applyImpulse(
        tipForce,
        this.mesh.getAbsolutePosition().add(new BABYLON.Vector3(0, this.trunkHeight, 0))
    );
    
    // Tree will fall over naturally, then break apart after a delay
    setTimeout(() => {
        this.createDebris();
    }, 2000); // 2 seconds to fall
}
```

### 3. Stump Remains

```javascript
destroy(impactVelocity) {
    // Don't dispose tree, just break off trunk
    const stumpHeight = this.trunkHeight * 0.2;
    
    // Scale trunk down to stump
    this.mesh.scaling.y = 0.2;
    this.mesh.position.y = stumpHeight / 2;
    
    // Remove canopy
    this.mesh.getChildren().forEach(child => child.dispose());
    
    // Create debris from broken part
    this.createDebris();
    
    this.destroyed = true;
}
```

### 4. Chainsaw Weapon

```javascript
class Chainsaw {
    constructor(scene) {
        this.active = false;
        this.damagRadius = 3;
    }
    
    activate(playerPos) {
        this.active = true;
        
        // Find all trees in radius
        trees.forEach(tree => {
            if (tree.destroyed) return;
            
            const dist = BABYLON.Vector3.Distance(playerPos, tree.position);
            if (dist < this.damagRadius) {
                // Destroy instantly, no speed requirement
                tree.destroy(new BABYLON.Vector3(0, 0, 0));
            }
        });
    }
}

// In update
if (keys['c']) { // C = chainsaw
    chainsaw.activate(skater.getPosition());
}
```

### 5. Fire Spread

```javascript
class BurningTree {
    constructor(tree) {
        this.tree = tree;
        this.burnTime = 300; // 5 seconds
        this.spread = true;
    }
    
    update() {
        this.burnTime--;
        
        // Change color to orange/red
        const burnProgress = 1 - (this.burnTime / 300);
        this.tree.mesh.material.emissiveColor = new BABYLON.Color3(
            burnProgress,
            burnProgress * 0.5,
            0
        );
        
        // Destroy when fully burned
        if (this.burnTime <= 0) {
            this.tree.destroy(new BABYLON.Vector3(0, 10, 0)); // Upward explosion
        }
        
        // Spread to nearby trees
        if (this.burnTime % 60 === 0 && this.spread) {
            trees.forEach(other => {
                if (other.destroyed) return;
                const dist = BABYLON.Vector3.Distance(this.tree.position, other.position);
                if (dist < 5) {
                    burningTrees.push(new BurningTree(other));
                }
            });
        }
    }
}
```

---

## Comparing Performance

### Original Three.js Forest
- 1000 static meshes
- No physics simulation
- Instant FPS: 60
- Trees destroyed: Rotate or hide
- Complexity: Low

### Havok Forest (Basic)
- 1000 trees + up to 500 debris
- Full physics simulation
- FPS: 50-60 (depending on destruction)
- Trees destroyed: Explode into realistic debris
- Complexity: Medium

### Havok Forest (Advanced)
- 1000 trees + up to 1500 debris
- Falling trees, fire spread, ragdolls
- FPS: 30-45
- Trees destroyed: Complex multi-stage destruction
- Complexity: High

---

## Configuration Guide

### Balanced (Recommended)
```javascript
const CONFIG = {
    TOTAL_TREES: 1000,
    DEBRIS_PER_TREE: 8,
    MAX_DEBRIS: 500,
    MIN_SPEED_TO_DESTROY: 8,
    HAUNTED_THRESHOLD: 0.75
};
```

### Performance Mode (30+ FPS on any device)
```javascript
const CONFIG = {
    TOTAL_TREES: 500,      // Fewer trees
    DEBRIS_PER_TREE: 4,    // Less debris
    MAX_DEBRIS: 200,       // Lower limit
    MIN_SPEED_TO_DESTROY: 6,
    HAUNTED_THRESHOLD: 0.75
};
```

### Chaos Mode (High-end PC only)
```javascript
const CONFIG = {
    TOTAL_TREES: 2000,     // Dense forest
    DEBRIS_PER_TREE: 12,   // More fragments
    MAX_DEBRIS: 1000,      // Higher limit
    MIN_SPEED_TO_DESTROY: 10, // Harder to destroy
    HAUNTED_THRESHOLD: 0.8    // Later haunting
};
```

---

## Testing Checklist

- [ ] Can move through forest
- [ ] Trees don't move until hit
- [ ] Fast collision destroys trees
- [ ] Slow collision does nothing
- [ ] Debris flies outward realistically
- [ ] Debris bounces off ground
- [ ] Debris tumbles in air
- [ ] Old debris disappears
- [ ] Debris count stays under MAX_DEBRIS
- [ ] FPS stays above 30
- [ ] Haunted mode activates at 75%
- [ ] Visual changes in haunted mode
- [ ] Trees left count updates
- [ ] Score increases with destruction

---

## Next Steps

Now that you have destructible trees:

1. **Add particle effects** - Leaf particles when tree destroyed
2. **Add sound effects** - Wood cracking, tree falling
3. **Add combo system** - Destroy multiple trees = bigger score
4. **Add ghost enemy** - Chases player in haunted mode
5. **Add fire mechanic** - Burn trees for score
6. **Add different tree types** - Oak, pine, dead trees
7. **Add stumps** - Trees leave stumps behind
8. **Add environmental hazards** - Rocks, fallen logs with physics

Your forest is now a **fully physics-simulated destruction sandbox**! 🌲💥
