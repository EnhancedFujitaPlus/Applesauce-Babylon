# 🩸 GORE ENGINE V2.0 - ARTIST REFERENCE GUIDE

## Quick Start

Replace your old ragdoll code with the new gore_integration.js file. Everything works with your existing `phy.add()` syntax!

---

## 🎮 Configuration (Top of gore_integration.js)

```javascript
const GORE = {
    scale: 1.0,          // Body size multiplier
    numRagdolls: 50,     // How many bodies to spawn
    debug: false,        // Show joint visualizations
    
    speeds: {
        damage: 8,       // Start taking damage (m/s)
        sever: 15,       // Limbs can detach
        explode: 30      // Catastrophic dismemberment
    },
    
    bloodEnabled: true,
    particlesPerHit: 20,
    
    // Damage multipliers by body zone
    headDamage: 3.0,     // Headshots are lethal
    torsoDamage: 1.0,    // Normal damage
    limbDamage: 0.7      // Less critical
}
```

---

## 📏 Realistic Proportions

The new system uses **realistic human anatomy**:

```
Total Height: 1.75m (5'9")
├── Head: 0.23m (9 inches)
├── Upper Torso: 0.35m
├── Lower Torso: 0.30m
├── Upper Leg: 0.45m
├── Lower Leg: 0.43m
├── Upper Arm: 0.30m
└── Lower Arm: 0.28m
```

**Mass Distribution:**
- Head: 5 kg
- Upper Body: 20 kg
- Lower Body: 15 kg
- Legs: 7kg (thigh), 4kg (calf)
- Arms: 2.5kg (upper), 1.5kg (lower)

---

## 💥 Damage System

### Speed → Damage Calculation

```
Damage = Impact_Speed × 5 × Zone_Multiplier
```

**Example:**
- 10 m/s impact to head = 10 × 5 × 3.0 = **150 damage**
- 10 m/s impact to leg = 10 × 5 × 0.7 = **35 damage**

### Health System
- Each ragdoll starts with **100 health**
- Death occurs at 0 health
- Multiple impacts accumulate damage

---

## 🔪 Dismemberment Mechanics

### Speed Thresholds

| Speed (m/s) | MPH  | Effect               | Visual           |
|-------------|------|----------------------|------------------|
| 8+          | 18   | Damage starts        | None             |
| 15+         | 34   | Limb separation      | Blood spray      |
| 30+         | 67   | Catastrophic break   | Heavy gore       |

### Joint Break Forces

Each joint has a **break threshold** in Newtons:

```javascript
Neck:      5,000 N  (critical - instant death)
Spine:     8,000 N  (critical - instant death)
Shoulders: 3,000 N
Elbows:    2,500 N
Hips:      6,000 N
Knees:     5,000 N
```

**When a critical joint breaks → instant death**

---

## 🎯 Use Cases for Artists

### Scenario 1: Skateboard Roadkill
```javascript
// Character gets hit by skateboard at high speed
// Speed: ~20 m/s (45 mph)

Result:
- Legs sever at knees (break force exceeded)
- ~100 damage to lower body
- Blood spray: 20+ particles
- Ragdoll continues tumbling
```

### Scenario 2: Falling Down Stairs
```javascript
// Multiple impacts as body tumbles
// Speeds: 5-12 m/s per impact

Result:
- Accumulating damage (20-60 per hit)
- No dismemberment (below sever threshold)
- Death after 3-4 major impacts
```

### Scenario 3: High-Speed Collision
```javascript
// Direct impact at 35+ m/s (78 mph)

Result:
- CATASTROPHIC dismemberment
- Multiple limbs severed
- Instant death from trauma
- Maximum blood effects
```

---

## 🛠️ Customization Examples

### Make Bodies Fragile (Glass Cannon Mode)
```javascript
GORE.speeds.sever = 8     // Lower threshold
GORE.headDamage = 5.0     // One-hit headshots
GORE.torsoDamage = 2.0    // Increase body damage
```

### Make Bodies Tank (Terminator Mode)
```javascript
GORE.speeds.sever = 40    // Very hard to dismember
GORE.headDamage = 1.0     // No headshot bonus
GORE.torsoDamage = 0.3    // Reduced damage
```

### Increase Gore
```javascript
GORE.particlesPerHit = 50
GORE.bloodEnabled = true
```

### Testing Mode
```javascript
GORE.debug = true         // Show joint visualizations
GORE.numRagdolls = 1      // Single test body
```

---

## 🔍 Console Output Examples

### Normal Impact
```
💥 legL1 impact: 12.3m/s | dmg: 43.1
```

### Dismemberment
```
💀 SEVERED: r_1738123_kneeL
🔪 kneeL dismembered! [SEVERE] 18.7m/s
🩸 Blood spray at [2.3, 1.1, -0.5] - 18.7m/s
```

### Death
```
☠️ Ragdoll r_1738123 died from head impact
```

---

## 🎨 Integration with Visual Effects

### Blood Particles
The system tracks blood spatters in `tracker.bloodSplatters[]`:

```javascript
{
    pos: {x: 2.3, y: 1.1, z: -0.5},
    vel: 18.7,              // Speed for particle velocity
    count: 20,              // Number of particles
    time: 1738123456        // Timestamp
}
```

You can render these using your particle system.

### Severed Limbs
Check if a joint is severed:

```javascript
if (tracker.isSevered('r_1738123_shoulderL')) {
    // Render separated arm
    // Add trailing blood
    // Physics already handled
}
```

---

## 🧪 Testing Checklist

- [ ] Realistic proportions match 1.75m human
- [ ] Light impacts (8-12 m/s) cause damage but no dismemberment
- [ ] Medium impacts (15-25 m/s) sever non-critical joints
- [ ] Heavy impacts (30+ m/s) cause catastrophic failure
- [ ] Headshots deal 3x damage
- [ ] Critical joints (neck, spine) cause instant death when broken
- [ ] Blood particles spawn at impact points
- [ ] Console shows clear damage/dismemberment feedback

---

## 📊 Performance Tips

### For Smooth 60fps with 50+ Ragdolls:

1. **Reduce substep if lagging**
   ```javascript
   phy.set({ substep: 1 })  // Instead of 2
   ```

2. **Instance your meshes** (already done)
   - Bodies share geometry
   - Lower draw calls

3. **Disable far bodies**
   ```javascript
   // In your update loop
   if (distance > 20) {
       phy.sleep(body)  // Put distant bodies to sleep
   }
   ```

4. **Limit blood particles**
   ```javascript
   GORE.particlesPerHit = 10  // Reduce from 20
   ```

---

## 🎬 Cinematic Features

### Slow Motion on Dismemberment
```javascript
// When limb severs, trigger slow-mo
phy.set({ timeScale: 0.3 })  // 30% speed

setTimeout(() => {
    phy.set({ timeScale: 1.0 })  // Resume
}, 1000)
```

### Camera Shake on Impact
```javascript
function shakeCamera(intensity) {
    // Add to camera position
    camera.position.x += Math.random() * intensity
    camera.position.y += Math.random() * intensity
}

// On heavy impact
if (speed > 25) {
    shakeCamera(0.5)
}
```

---

## 🐛 Troubleshooting

**Bodies too small?**
- Increase `GORE.scale` (try 1.5 or 2.0)

**No dismemberment happening?**
- Check console for impact speeds
- Lower `GORE.speeds.sever` threshold
- Ensure `breakForce` is set on joints

**Too much dismemberment?**
- Raise speed thresholds
- Increase joint break forces

**Performance issues?**
- Reduce `GORE.numRagdolls`
- Lower `GORE.particlesPerHit`
- Decrease `phy.substep`

---

## 💡 Advanced: Custom Damage Zones

Add special zones (e.g., armor):

```javascript
// In body part definition
armL1: {
    ...
    zone: 'armored',  // Custom zone
    armor: 0.2        // 80% damage reduction
}

// In damage calculation
const armor = part.armor || 1.0
damage *= (1 - armor)
```

---

## 🎯 Next Steps

1. **Visual Polish**
   - Add blood decals
   - Particle effects for dismemberment
   - Impact flashes

2. **Audio**
   - Bone crack sounds
   - Splatter effects
   - Impact thuds

3. **Gameplay**
   - Score based on carnage
   - Combo system for multiple hits
   - Slow-mo highlights

---

**Built for South of South Records artists** 🎸
Questions? Check the console output for real-time feedback!
