# 🩸 TRICK & BAIL SYSTEM GUIDE

## Overview

Your skater now has a **full trick system** with **bail detection** and **blood splatter effects**! Land tricks clean for points, or eat pavement for gore! 💀

---

## How Tricks Work

### 1. **Jump** (Space)
```javascript
skater.jump()
```
- Only works when grounded
- Sets `jumpVelocity = 0.35`
- Enables tricks (`canTrick = true`)

### 2. **Do Trick** (Q or E while airborne)
```javascript
if (!skater.isGrounded()) {
    skater.doTrick('KICKFLIP!');  // Q key
    skater.doTrick('HEELFLIP!');  // E key
}
```
- Starts deck spinning
- Can only do ONE trick per jump
- Builds combo counter

### 3. **Landing Detection** (Automatic)

When you land, the skater checks the **deck rotation**:

```javascript
// In babylon-skater-arcade.js update()
const rotationMod = Math.abs(this.deck.rotation.x) % (Math.PI * 2);
const cleanLanding = rotationMod < 0.5 || rotationMod > (Math.PI * 2 - 0.5);

if (!cleanLanding) {
    // BAILED! Deck sideways
    this.state.bailed = true;
} else {
    // Clean landing! Wheels down
    this.state.landedClean = true;
}
```

**Clean Landing:**
- Deck rotation close to 0° or 360°
- Awards combo points
- Deck auto-levels

**Bail:**
- Deck rotation at weird angle (board sideways)
- Blood splatter!
- Combo reset to 0

---

## Bail Detection Logic

### What Counts as a Bail?

The deck rotation is checked against a **tolerance of 0.5 radians** (~28°):

```
CLEAN:  |rotation| < 0.5  OR  |rotation| > (2π - 0.5)
        ▓▓▓▓▓▓▓▓              ▓▓▓▓▓▓▓▓
        0°─────28°            332°───360°
        
BAIL:   Everything in between
        ████████████████████████████████
        28°──────────────────────────332°
```

### Visual Examples:

```
✅ CLEAN LANDING (wheels down):
    ════════
    🛹 Deck
    ════════
    
❌ BAIL (deck sideways):
    ║
    🛹 Deck
    ║
```

---

## Blood Splatter System

### When Blood Spawns:

```javascript
if (skater.didBail()) {
    createBloodSplatter(skaterPos, 1.5);  // Intensity 1.5
}
```

### What Gets Created:

**1. Blood Droplets (20-30 particles):**
```javascript
const droplet = BABYLON.MeshBuilder.CreateSphere(
    "blood",
    { diameter: 0.1 + Math.random() * 0.15 },
    scene
);

droplet.velocity = new BABYLON.Vector3(
    Math.cos(angle) * power,  // X direction
    Math.random() * 0.4 + 0.2, // Y (up)
    Math.sin(angle) * power    // Z direction
);
```
- Red spheres
- Shoot out in random directions
- Fall with gravity
- Bounce on ground
- Fade out after 300-500 frames

**2. Blood Pool (ground decal):**
```javascript
const pool = BABYLON.MeshBuilder.CreateDisc(
    "bloodPool",
    { radius: 0.8 * intensity },
    scene
);
pool.position.y = 0.02; // Just above ground
```
- Red disc on floor
- Stays for 1500 frames
- Fades out slowly

---

## Trick Combo System

### Building Combos:

1. **Jump** → Combo ready
2. **Do trick** → Combo += 1
3. **Land clean** → Score += combo × 100
4. **Bail** → Combo = 0 (reset!)

### Example Combo:

```
Jump 1:  Kickflip  → Combo = 1
Land:    Clean     → +100 points
Jump 2:  Heelflip  → Combo = 2
Land:    Clean     → +200 points
Jump 3:  Kickflip  → Combo = 3
Land:    BAIL!     → 💀 Combo reset, no points
```

### Combo Timer:

```javascript
gameState.comboTimer = 120;  // ~2 seconds at 60fps

// Decreases each frame when grounded
if (comboTimer === 0 && grounded && !grinding) {
    combo = 0;
}
```

Keep chaining tricks before timer runs out!

---

## Blood Physics

### Droplet Movement:

```javascript
// Each frame:
particle.position.addInPlace(particle.velocity);
particle.velocity.y -= 0.015; // Gravity

// Ground collision:
if (particle.position.y < 0.1) {
    particle.velocity.y *= -0.3;   // Bounce (30% energy)
    particle.velocity.x *= 0.5;    // Friction
    particle.velocity.z *= 0.5;
}
```

### Lifecycle:

```javascript
particle.lifetime = 300 + Math.floor(Math.random() * 200);

// Each frame:
particle.lifetime--;

// Fade out last 100 frames:
if (particle.lifetime < 100) {
    particle.material.alpha = particle.lifetime / 100;
}

// Remove when dead:
if (particle.lifetime <= 0) {
    particle.dispose();
}
```

---

## Adjusting Bail Sensitivity

### Make Bails Easier (More Forgiving):

```javascript
// In babylon-skater-arcade.js, line ~250
const cleanLanding = rotationMod < 1.0 || rotationMod > (Math.PI * 2 - 1.0);
//                                 ^^^                                  ^^^
//                          Increase tolerance to 1.0 (~57°)
```

### Make Bails Harder (Strict Landing):

```javascript
const cleanLanding = rotationMod < 0.2 || rotationMod > (Math.PI * 2 - 0.2);
//                                 ^^^                                  ^^^
//                          Decrease tolerance to 0.2 (~11°)
```

---

## Increasing Blood Intensity

### More Blood:

```javascript
// In helmet_factory.html, createBloodSplatter function
const particleCount = Math.floor(50 * intensity);  // Up from 20
```

### Bigger Splatters:

```javascript
const droplet = BABYLON.MeshBuilder.CreateSphere(
    "blood",
    { diameter: 0.2 + Math.random() * 0.3 },  // Bigger droplets
    scene
);
```

### More Power:

```javascript
const power = 0.5 + Math.random() * 0.5;  // Shoots further
```

### Longer Lifetime:

```javascript
droplet.lifetime = 600 + Math.floor(Math.random() * 400);  // Stays longer
```

---

## Debug Info

### Console Messages:

```
✅ Clean landing! +200 points
💀 BAILED! Blood everywhere!
💀 Blood splatter created!
```

### HUD Display:

```
Blood: 47 particles
```

### Checking State:

```javascript
console.log('Grounded:', skater.isGrounded());
console.log('Spinning:', skater.isSpinning());
console.log('Trick:', skater.getCurrentTrick());
```

---

## Common Issues & Fixes

### Issue: Tricks Don't Start

**Problem:** Pressing Q/E does nothing

**Fix:**
- Make sure you're **airborne** (not grounded)
- Check console for "Grounded: false"
- Only ONE trick per jump

### Issue: Always Bailing

**Problem:** Every landing = bail

**Fix:**
- Increase tolerance (see "Adjusting Bail Sensitivity")
- Board might be spinning too fast
- Try shorter jumps

### Issue: Never Bailing

**Problem:** Can't trigger bails

**Fix:**
- Decrease tolerance for stricter detection
- Make sure you're doing tricks (Q/E in air)
- Check deck rotation in debug

### Issue: No Blood Appears

**Problem:** Bailing but no blood

**Fix:**
- Check console for "Blood splatter created!"
- Verify `gameState.blood` array exists
- Make sure `createBloodSplatter()` is called

---

## Advanced: Custom Tricks

Want more trick types? Easy!

### Add New Trick:

```javascript
// In input handler:
if (!skater.isGrounded() && e.key.toLowerCase() === 'r') {
    if (skater.doTrick('IMPOSSIBLE!')) {
        gameState.currentTrick = 'IMPOSSIBLE!';
        gameState.score += 300 * gameState.combo;
    }
}
```

### Different Deck Rotations:

```javascript
// In babylon-skater-arcade.js:
doTrick(trickType) {
    if (trickType === 'HEELFLIP!') {
        this.deck.rotationSpeed = -0.3;  // Opposite direction
    } else {
        this.deck.rotationSpeed = 0.3;   // Normal
    }
    // ...
}
```

---

## Testing Checklist

- [ ] Jump (Space) - Should go up smoothly
- [ ] Press Q in air - Deck spins
- [ ] Land clean - Deck levels, points awarded
- [ ] Press Q in air again
- [ ] Land at angle - Blood splatter!
- [ ] Check HUD for "BAILED!"
- [ ] Blood droplets fall and bounce
- [ ] Blood pool appears on ground
- [ ] Blood fades out over time
- [ ] Combo resets on bail
- [ ] Combo builds on clean landings

---

## Summary

**Flow:**
1. Jump (Space)
2. Trick (Q or E)
3. Deck spins
4. Land:
   - **Clean** (wheels down) → Points! ✅
   - **Bail** (sideways) → Blood! 💀

**Key Parameters:**
- Bail tolerance: `0.5 radians` (~28°)
- Blood particles: `20 per bail`
- Combo multiplier: `×100 points`
- Blood lifetime: `300-500 frames`

---

**NOW GO SHRED AND BLEED! 🛹💀🩸**
