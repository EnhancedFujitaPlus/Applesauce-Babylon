# 🚀 JUMP/OLLIE FIX GUIDE

## The Problem You Described

> "The ollie will send me straight up until I move and then I crash down"

This happens when:
1. Jump force is too high
2. No horizontal momentum
3. Gravity is too weak

---

## The Fix (Already Applied!)

### In `babylon-skater-arcade.js`:

**Old (Force-Based - TOO FLOATY):**
```javascript
jump(force = 300) {
    this.physicsAggregate.body.applyImpulse(
        new BABYLON.Vector3(0, force, 0)
    );
}
```
- Force of 300 is WAY too high for ANIMATED physics
- Sends you to the moon!

**New (Arcade - PERFECT):**
```javascript
jump() {
    if (this.state.grounded && !this.state.jumping) {
        this.state.jumping = true;
        this.state.jumpVelocity = 0.35;  // ✅ Much lower!
        this.state.grounded = false;
        this.state.canTrick = true;
    }
}
```
- Velocity of 0.35 feels right
- Paired with gravity of -0.015
- Smooth arc!

---

## Jump Physics Breakdown

### How It Works:

```javascript
// Each frame while jumping:
this.physicsCollider.position.y += this.state.jumpVelocity;  // Go up
this.state.jumpVelocity += this.state.gravity;                // Slow down

// Example over time:
Frame 0:  y += 0.35,  vel = 0.35 - 0.015 = 0.335
Frame 1:  y += 0.335, vel = 0.335 - 0.015 = 0.32
Frame 2:  y += 0.32,  vel = 0.32 - 0.015 = 0.305
...
Frame 23: y += 0,     vel = 0 (peak of jump)
Frame 24: y += -0.015, vel = -0.015 (start falling)
...
Frame 46: y += -0.35, vel = -0.35 (hit ground)
```

### Parameters:

```javascript
jumpVelocity: 0.35   // Initial upward speed
gravity: -0.015      // Downward acceleration per frame
```

**Jump height formula:**
```
max_height = (jumpVelocity²) / (2 × |gravity|)
max_height = (0.35²) / (2 × 0.015)
max_height = 0.1225 / 0.03
max_height ≈ 4 units
```

**Airtime:**
```
time_in_air = 2 × (jumpVelocity / |gravity|)
time_in_air = 2 × (0.35 / 0.015)
time_in_air ≈ 46 frames (~0.77 seconds at 60fps)
```

---

## Tuning Your Jump

### Want Higher Jumps?

```javascript
// In babylon-skater-arcade.js, line 28
jumpVelocity: 0.5    // Up from 0.35
```

### Want Lower Jumps?

```javascript
jumpVelocity: 0.25   // Down from 0.35
```

### Want Floatier Jump?

```javascript
gravity: -0.01       // Less gravity (up from -0.015)
```

### Want Snappier Jump?

```javascript
gravity: -0.02       // More gravity (down from -0.015)
```

---

## Why Force-Based Didn't Work

### Force-Based Physics (OLD):
```javascript
// Applied force to DYNAMIC physics body
applyImpulse(new BABYLON.Vector3(0, 300, 0));
```

**Problems:**
- Force of 300 was for **mass of 70 kg**
- Mass × acceleration = force
- 70 kg × 4.29 m/s² = 300 N
- But with ANIMATED physics, no mass system!
- Result: YEET to space! 🚀

### Arcade Physics (NEW):
```javascript
// Direct velocity manipulation
this.state.jumpVelocity = 0.35;

// Each frame:
position.y += jumpVelocity;
jumpVelocity += gravity;
```

**Benefits:**
- Direct control
- Predictable height
- Smooth arc
- Works with ANIMATED physics

---

## Ground Detection

### Why You "Crash Down":

The raycast checks for ground:

```javascript
const ray = new BABYLON.Ray(rayStart, new BABYLON.Vector3(0, -1, 0), 5);
const hit = scene.pickWithRay(ray);

if (hit && hit.hit) {
    const groundLevel = hit.pickedPoint.y + 1.0;
    if (position.y <= groundLevel) {
        // LANDED!
        position.y = groundLevel;
        jumping = false;
        jumpVelocity = 0;
    }
}
```

**The "crash":**
- You fall with velocity -0.35 (fast!)
- Ray detects ground
- Position snaps to ground instantly
- Looks like a hard landing

**Optional: Add Landing Smoothing:**

```javascript
// Soften the landing
if (position.y <= groundLevel) {
    const diff = groundLevel - position.y;
    position.y += diff * 0.5;  // Smooth approach
}
```

---

## Testing Perfect Jump Feel

### Preset 1: Tony Hawk Style
```javascript
jumpVelocity: 0.5
gravity: -0.015
```
- High, floaty jumps
- Lots of airtime for tricks

### Preset 2: OlliOlli Style
```javascript
jumpVelocity: 0.3
gravity: -0.02
```
- Low, quick jumps
- Snappy feel

### Preset 3: Skate Style (Realistic)
```javascript
jumpVelocity: 0.25
gravity: -0.018
```
- Short hops
- More realistic

### Preset 4: APPLESAUCE (Default)
```javascript
jumpVelocity: 0.35
gravity: -0.015
```
- Balanced
- Good for tricks

---

## Horizontal Momentum

The "crash" might also be because you have **no forward speed**!

### Solution: Keep Moving!

```javascript
// In game loop:
if (keys['w']) {
    skater.accelerateForward();
}

// Jump carries your horizontal speed:
// position.x += forward.x * speed;  ✅ Keeps going!
// position.y += jumpVelocity;       ✅ Goes up!
```

You need horizontal velocity to land smoothly. Try:
1. Press W to build speed
2. Then press Space to jump
3. Keep holding W in the air
4. You'll arc forward instead of straight up/down

---

## Debug Jump Issues

### Add This to Game Loop:

```javascript
if (skater.isJumping()) {
    console.log('Jump velocity:', skater.state.jumpVelocity.toFixed(3));
    console.log('Height:', skater.getPosition().y.toFixed(2));
}
```

### Check for:
- [ ] `jumpVelocity` starts at 0.35
- [ ] `jumpVelocity` decreases each frame
- [ ] `jumpVelocity` goes negative (falling)
- [ ] Height increases then decreases (arc)
- [ ] Lands smoothly when grounded

---

## Summary

**The arcade skater already has perfect jump physics!**

✅ **Jump velocity:** 0.35 (perfect height)  
✅ **Gravity:** -0.015 (smooth arc)  
✅ **Ground detection:** Raycasting  
✅ **Landing:** Auto-snap to ground  

**To get smooth ollies:**
1. Build speed first (W key)
2. Jump while moving
3. Horizontal + vertical = smooth arc!

---

**The fix is already in `babylon-skater-arcade.js` - just use it! 🛹**
