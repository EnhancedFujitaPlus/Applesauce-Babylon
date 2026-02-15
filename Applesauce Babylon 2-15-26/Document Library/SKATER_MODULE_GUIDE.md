# 🛹 Babylon Skater Module Usage Guide

## What Changed

Your original Three.js skater module has been converted to work with Babylon.js + Havok physics. The visual appearance is **identical**, but now it has real physics!

## Key Improvements

### Three.js Version (Old)
```javascript
// Manual position updates
player.position.x += Math.sin(rotation) * speed;
player.position.z += Math.cos(rotation) * speed;

// Manual gravity
if (!grounded) {
    jumpVelocity -= 0.02;
}
player.position.y += jumpVelocity;
```

### Babylon.js Version (New)
```javascript
// Physics-based movement
skater.moveForward(50);  // Applies force
skater.jump(300);         // Applies impulse

// Havok handles: gravity, collisions, momentum, friction
```

---

## Using the Module

### Installation

**Option 1: Inline (like in the demo)**
```html
<script type="module">
    // Copy the entire BabylonSkater class into your HTML
    class BabylonSkater { ... }
    
    // Then use it
    const skater = new BabylonSkater(scene);
</script>
```

**Option 2: External Module (recommended)**
```html
<script type="module">
    import { BabylonSkater } from './babylon-skater.js';
    
    const skater = new BabylonSkater(scene);
</script>
```

---

## Basic Usage

### 1. Create and Spawn Skater

```javascript
// After creating scene and enabling Havok physics
const skater = new BabylonSkater(scene);

const skaterData = skater.spawn({
    x: 0,           // Spawn X position
    y: 5,           // Spawn Y position (height)
    z: -150,        // Spawn Z position
    
    // Optional customization
    deckColor: new BABYLON.Color3(1, 0.08, 0.58),  // Hot pink
    bodyColor: new BABYLON.Color3(0.2, 0.2, 0.2),  // Dark gray
    skinColor: new BABYLON.Color3(1, 0.86, 0.67)   // Skin tone
});

// skaterData contains:
// - root: Visual mesh group
// - collider: Physics capsule (invisible)
// - aggregate: Physics body
```

### 2. Movement in Update Loop

```javascript
function update() {
    // WASD movement
    if (keys['w']) {
        skater.moveForward(50);  // Force strength
    }
    if (keys['s']) {
        skater.moveBackward(30);
    }
    if (keys['a']) {
        skater.turnLeft(8);      // Torque strength
        skater.leanLeft();       // Visual lean
    }
    if (keys['d']) {
        skater.turnRight(8);
        skater.leanRight();
    } else {
        skater.resetLean();
    }
    
    // Jump
    if (keys[' ']) {
        skater.jump(300);  // Impulse strength
    }
    
    // CRITICAL: Sync visual to physics
    skater.update();
}
```

### 3. Tricks and Animations

```javascript
// Kickflip
if (keys['q']) {
    skater.doKickflip();
    score += 50;
}

// When not doing tricks, reset rotation
if (!doingTrick) {
    skater.resetDeckRotation();
}
```

### 4. Getting Skater Data

```javascript
// Get current position
const pos = skater.getPosition();
console.log(pos.x, pos.y, pos.z);

// Get velocity
const velocity = skater.getVelocity();

// Get speed (horizontal)
const speed = skater.getSpeed();
console.log("Speed:", speed);
```

---

## Visual Parts Reference

The skater consists of these parts:

```
HEAD (sphere)
    |
  BODY (box)
  /    \
ARM    ARM
  |      |
 LEG    LEG
  \    /
   DECK (box)
   |  |
 WHEELS (4 cylinders)
```

All parts are parented to `skaterRoot`, which follows the physics collider.

---

## Physics Collider

The skater uses an **invisible capsule** for physics:
- **Height:** 2 units
- **Radius:** 0.5 units
- **Mass:** 70 kg (realistic human weight)
- **Friction:** 0.4 (prevents sliding)
- **Damping:** 0.99 angular, 0.1 linear

**Why capsule?**
- Doesn't get stuck on edges
- Smooth movement over terrain
- Can't tip over (high angular damping)

---

## Customization

### Change Colors

```javascript
// Change deck color
skater.setDeckColor(new BABYLON.Color3(0, 1, 0)); // Green

// Change body/clothes color
skater.setBodyColor(new BABYLON.Color3(1, 0, 0)); // Red
```

### Adjust Physics

```javascript
// After spawning, modify physics properties
const aggregate = skaterData.aggregate;

// Make lighter (more floaty)
aggregate.body.setMassProperties({ mass: 50 });

// Make bouncier
aggregate.shape.material.restitution = 0.5;

// More friction (less sliding)
aggregate.shape.material.friction = 0.8;
```

### Adjust Movement Forces

```javascript
// In your game, tune these values:

// Forward movement
if (keys['w']) {
    skater.moveForward(100);  // Increase for faster acceleration
}

// Turning
if (keys['a']) {
    skater.turnLeft(15);  // Increase for sharper turns
}

// Jumping
if (keys[' ']) {
    skater.jump(500);  // Increase for higher jumps
}
```

---

## Camera Following

### Third-Person Camera

```javascript
function update() {
    skater.update(); // Updates visual position
    
    const pos = skater.getPosition();
    const forward = skater.physicsCollider.forward;
    
    // Camera behind and above skater
    const cameraOffset = forward.scale(-20);
    cameraOffset.y = 10;
    
    camera.position = BABYLON.Vector3.Lerp(
        camera.position,
        pos.add(cameraOffset),
        0.1  // Smooth factor (0-1)
    );
    
    // Look at skater
    camera.setTarget(pos.add(new BABYLON.Vector3(0, 2, 0)));
}
```

### First-Person Camera

```javascript
function update() {
    skater.update();
    
    const headPos = skater.getPosition().add(new BABYLON.Vector3(0, 2.1, 0));
    camera.position = headPos;
    
    // Camera looks in skater's direction
    const lookTarget = headPos.add(skater.physicsCollider.forward.scale(10));
    camera.setTarget(lookTarget);
}
```

---

## Collision Detection

### Check if Skater Hit Something

```javascript
function update() {
    const pos = skater.getPosition();
    const velocity = skater.getVelocity();
    const speed = skater.getSpeed();
    
    // Check collision with enemies
    enemies.forEach(enemy => {
        const dist = BABYLON.Vector3.Distance(pos, enemy.position);
        
        if (dist < 2 && speed > 5) {
            // Kill enemy
            console.log("Hit enemy at high speed!");
            killEnemy(enemy);
        }
    });
    
    // Check collision with buildings
    buildings.forEach(building => {
        const dist = BABYLON.Vector3.Distance(pos, building.position);
        
        if (dist < 5 && speed > 10) {
            // Destroy building
            console.log("Crashed through building!");
            destroyBuilding(building);
        }
    });
}
```

### Using Havok Collision Callbacks (Advanced)

```javascript
// Enable collision detection
skater.physicsAggregate.body.setCollisionCallbackEnabled(true);

// Listen for collisions
skater.physicsAggregate.body.getCollisionObservable().add((collision) => {
    const other = collision.collider;
    
    if (other.transformNode.name === "enemy") {
        const velocity = skater.getVelocity();
        const speed = velocity.length();
        
        if (speed > 5) {
            console.log("Collision with enemy at speed:", speed);
            killEnemy(other.transformNode);
        }
    }
});
```

---

## Ground Detection

The skater automatically collides with the ground via Havok. To check if grounded:

```javascript
function isGrounded() {
    const pos = skater.getPosition();
    const velocity = skater.getVelocity();
    
    // If Y velocity is near zero and close to ground
    return Math.abs(velocity.y) < 0.5 && pos.y < 3;
}

// Use it
if (keys[' '] && isGrounded()) {
    skater.jump(300);
}
```

---

## Complete Example

```javascript
// Scene setup
const scene = new BABYLON.Scene(engine);
const havokInstance = await HavokPhysics();
const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
scene.enablePhysics(new BABYLON.Vector3(0, -30, 0), havokPlugin);

// Create skater
const skater = new BabylonSkater(scene);
skater.spawn({ x: 0, y: 5, z: 0 });

// Input tracking
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Game state
let score = 0;
let doingKickflip = false;

// Update loop
function update() {
    // Movement
    if (keys['w']) skater.moveForward(50);
    if (keys['s']) skater.moveBackward(30);
    if (keys['a']) {
        skater.turnLeft(8);
        skater.leanLeft();
    } else if (keys['d']) {
        skater.turnRight(8);
        skater.leanRight();
    } else {
        skater.resetLean();
    }
    
    // Jump
    const pos = skater.getPosition();
    if (keys[' '] && pos.y < 3) {
        skater.jump(300);
        score += 10;
    }
    
    // Kickflip
    if (keys['q'] && !doingKickflip) {
        doingKickflip = true;
        score += 50;
        setTimeout(() => doingKickflip = false, 500);
    }
    
    if (doingKickflip) {
        skater.doKickflip();
    } else {
        skater.resetDeckRotation();
    }
    
    // CRITICAL: Update visual
    skater.update();
    
    // Camera follow
    const forward = skater.physicsCollider.forward;
    const cameraOffset = forward.scale(-20);
    cameraOffset.y = 10;
    camera.position = BABYLON.Vector3.Lerp(
        camera.position,
        pos.add(cameraOffset),
        0.1
    );
    camera.setTarget(pos.add(new BABYLON.Vector3(0, 2, 0)));
}

// Render loop
engine.runRenderLoop(() => {
    update();
    scene.render();
});
```

---

## Common Issues & Fixes

### Issue: Skater Won't Move
**Fix:** Make sure you're calling movement methods in the update loop AND calling `skater.update()` to sync visual to physics.

### Issue: Skater Tips Over
**Fix:** Angular damping should be high (0.99). Check that it's set in spawn().

### Issue: Skater Floats Away
**Fix:** Linear damping controls drift. Set to 0.1-0.2. Also check gravity is enabled in scene.

### Issue: Visual Doesn't Match Physics
**Fix:** Call `skater.update()` EVERY frame in your update loop.

### Issue: Can't Jump
**Fix:** 
1. Check if grounded (Y position < 3)
2. Increase jump force: `skater.jump(500)`
3. Make sure gravity is enabled

---

## Comparison: Three.js vs Babylon.js

| Feature | Three.js (Old) | Babylon.js (New) |
|---------|----------------|------------------|
| **Movement** | Manual position | Forces/impulses |
| **Gravity** | Manual Y velocity | Automatic |
| **Collisions** | Manual distance checks | Automatic |
| **Ground** | Manual height lookup | Automatic |
| **Rotation** | Manual angle math | Torque application |
| **Code** | ~150 lines physics | ~20 lines physics |
| **Realism** | Basic | High (Havok) |

---

## Next Steps

Now that you have a working skater with physics:

1. **Add tricks** - Heelflips, 360s, grinds
2. **Rail grinding** - Detect rail proximity, lock to rail
3. **Combo system** - Chain tricks together
4. **Ragdoll on crash** - Replace skater with ragdoll at high speed crashes
5. **Different skater styles** - Create variants (longboard, penny board)

The skater module is **production-ready** and works seamlessly with:
- Terrain system
- Gore system
- Destruction system
- Enemy system

🛹 Your APPLESAUCE skater is now physics-powered!
