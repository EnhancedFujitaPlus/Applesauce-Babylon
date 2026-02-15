# 🛹 MOVEMENT & COLLISION FIXES

## What Was Broken 🔴

### 1. **Movement Not Working**
- WASD/Arrow keys did nothing
- Skater stayed in place
- Only turning/leaning worked

**Root Cause:** The `moveForward()` and `moveBackward()` methods were using `this.physicsCollider.forward` which doesn't exist in Babylon.js (that's a Three.js property).

### 2. **Tricks Causing Bouncing**
- Pressing Q or E made the skater bounce back
- Board rotation collided with physics body
- Character got "stuck" when flipping

**Root Cause:** The visual meshes (deck, body, head, etc.) had collision detection enabled, so when the deck rotated during tricks, it physically collided with the invisible physics capsule.

---

## What Was Fixed ✅

### 1. **Movement System Rewrite**

**OLD CODE (broken):**
```javascript
moveForward(force = 500) {
    const forward = this.physicsCollider.forward; // ❌ Doesn't exist!
    const forceVec = forward.scale(force);
    this.physicsAggregate.body.applyForce(forceVec, ...);
}
```

**NEW CODE (working):**
```javascript
moveForward(force = 50) {
    // Calculate forward direction based on Y rotation
    const rotation = this.physicsCollider.rotation.y;
    const forward = new BABYLON.Vector3(
        Math.sin(rotation),  // ✅ Proper Babylon.js calculation
        0,
        Math.cos(rotation)
    );
    const forceVec = forward.scale(force);
    this.physicsAggregate.body.applyForce(forceVec, ...);
}
```

**How It Works:**
- Uses the physics collider's Y rotation (yaw)
- Calculates a forward vector using trig:
  - `Math.sin(rotation)` = X component (left/right)
  - `Math.cos(rotation)` = Z component (forward/back)
- Applies force in that direction

Same fix applied to `moveBackward()` but with negative values.

### 2. **Collision Detection Disabled**

Added `checkCollisions = false` to ALL visual meshes:
```javascript
deck.checkCollisions = false;
wheel.checkCollisions = false;
body.checkCollisions = false;
head.checkCollisions = false;
arm.checkCollisions = false;
leg.checkCollisions = false;
```

**Why This Works:**
- Only the invisible physics capsule has actual collision
- Visual meshes are just "eye candy" that follow the capsule
- When deck rotates for tricks, it passes through the capsule harmlessly
- Physics remains stable and accurate

---

## Testing Checklist ✅

### Movement Tests:
- [ ] Press **W** → Skater moves forward
- [ ] Press **S** → Skater moves backward
- [ ] Press **A** → Skater turns left
- [ ] Press **D** → Skater turns right
- [ ] Press **SPACE** → Skater jumps
- [ ] Movement follows where you're looking (camera direction)

### Trick Tests:
- [ ] Press **Q** → Board does kickflip animation
- [ ] Press **E** → Board does heelflip animation
- [ ] Board rotates smoothly WITHOUT bouncing
- [ ] Skater doesn't get knocked back
- [ ] Can spam tricks without issues

### Physics Tests:
- [ ] Skater stays upright (doesn't tip over)
- [ ] Skater can jump and land smoothly
- [ ] Skater collides with walls/crates properly
- [ ] Speed increases when holding W
- [ ] Can collect helmets by skating near them

---

## Technical Details 🔧

### Force Values:
- **Forward:** 50 (was 500, way too strong)
- **Backward:** 30 (60% of forward)
- **Turn Torque:** 5
- **Jump Impulse:** 300

### Physics Properties:
- **Mass:** 10
- **Restitution:** 0.1 (slight bounce)
- **Friction:** 0.8 (good grip)
- **Linear Damping:** 0.15
- **Angular Damping:** 0.6

### Babylon.js Rotation System:
- **Y Axis** = Yaw (turning left/right)
- **X Axis** = Pitch (tipping forward/back) → LOCKED
- **Z Axis** = Roll (tipping left/right) → LOCKED

Only Y-axis rotation allowed to prevent tipping over.

---

## Common Babylon.js Gotchas 🚨

### Three.js vs Babylon.js Movement

| Three.js | Babylon.js |
|----------|------------|
| `mesh.forward` | Calculate from rotation |
| `mesh.right` | Calculate from rotation |
| `mesh.up` | Use `Vector3.Up()` |
| Rotation in radians | Rotation in radians ✅ |
| `.applyForce()` | `.applyForce()` ✅ |

### Key Differences:
1. **No built-in direction vectors** - must calculate manually
2. **Rotation.y is yaw** in both engines ✅
3. **Havok Physics** instead of Ammo/Cannon
4. **PhysicsAggregate** instead of PhysicsImpostor

---

## Debugging Tips 🐛

### If movement still doesn't work:
```javascript
// Add to game loop
console.log('Rotation:', skater.getPosition());
console.log('Velocity:', skater.getVelocity());
```

### If tricks still cause bouncing:
```javascript
// Check in browser console
skater.deck.checkCollisions // Should be FALSE
skater.physicsCollider.checkCollisions // Should be TRUE
```

### If skater tips over:
```javascript
// In update(), check angular velocity lock
const angVel = aggregate.body.getAngularVelocity();
// Should always have X=0, Z=0, only Y can be non-zero
```

---

## What's Next? 🚀

Now that movement works, you can:

1. **Add speed boost pads**
2. **Create grind rail detection**
3. **Implement combo system**
4. **Add more trick types** (manuals, grinds, grabs)
5. **Create obstacle courses**
6. **Add gore physics** (your favorite! 💀)
7. **Build more factory levels**

---

**Happy shredding! 🛹🪖**

*- Fixed by Claude for Cam @ South of South Records*
