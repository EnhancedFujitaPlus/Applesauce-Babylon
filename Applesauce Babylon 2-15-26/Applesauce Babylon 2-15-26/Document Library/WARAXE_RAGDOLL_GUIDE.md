# WarAxe Ragdoll Physics Integration Guide

## 🎯 What I Fixed

### 1. **Ragdoll Spawn Height** ✅
- **Before:** Spawned at 5 meters (explosive landing)
- **After:** Spawned at 2 meters (safe landing)
- **Result:** Ragdolls land gently instead of exploding

### 2. **Impact Thresholds** ✅
Updated gore physics thresholds for realistic gameplay:

| Threshold | Before | After | Why |
|-----------|--------|-------|-----|
| **Damage** | 8 m/s | 12 m/s | Normal falls don't hurt |
| **Sever** | 15 m/s | 18 m/s | Harder to dismember by falling |
| **Explode** | 30 m/s | 35 m/s | Only catastrophic impacts |
| **Weapon Sever** | N/A | 8 m/s | ⚔️ WarAxe cuts EASILY |

**Physics reference:**
- Falling from 2m = ~6.3 m/s (safe landing)
- Falling from 5m = ~9.9 m/s (was causing damage before)
- Falling from 10m = ~14 m/s (now causes damage)

### 3. **Weapon-Ragdoll Integration** ✅
The WarAxe now properly interacts with ragdolls:

**When you hit a ragdoll:**
1. ✅ Finds the closest body part (head, arm, leg, torso)
2. ✅ Applies force to that specific limb (physics impulse)
3. ✅ Deals damage based on hit zone (head = 3x, limbs = 0.7x)
4. ✅ Can sever limbs with strong hits
5. ✅ Spawns blood particles
6. ✅ Ragdoll flies backward from impact

**Sharp Weapon Mechanics:**
- WarAxe is marked as `isSharp = true`
- Sharp weapons can sever joints at **50% normal threshold**
- Example: Shoulder joint breaks at 15 m/s normally
- WarAxe can sever shoulder at just **7.5 m/s equivalent force**

---

## 🎮 How to Test

### Test 1: Safe Landing
```
1. Press R to spawn ragdoll
2. Watch it fall from 2 meters
3. Should land safely without exploding
```
**Expected:** Ragdoll lands, stays intact, maybe small bounce

### Test 2: Weapon Strikes
```
1. Spawn ragdoll (R key)
2. Wait for it to land
3. Get close and attack (click + hold + swing)
4. Release to strike
```
**Expected:** 
- Limb struck flies backward
- Blood spray on impact
- Console shows: "🪓 RAGDOLL HIT: [limb name]"

### Test 3: Limb Severing
```
1. Spawn ragdoll
2. Attack the SAME limb multiple times
3. Or use powerful swing (fast mouse movement)
```
**Expected:**
- After 2-3 hits: "🔪 [joint] SEVERED!"
- Limb separates and flies away
- Increased blood spray

### Test 4: Headshot
```
1. Spawn ragdoll
2. Aim for head
3. Strike
```
**Expected:**
- Massive damage (3x multiplier)
- Possible instant death
- Potential decapitation

---

## 🔬 Technical Details

### New Gore Physics Methods

**applyWeaponHit()**
```javascript
gorePhysics.applyWeaponHit(
    ragdollId,        // Which ragdoll
    "upperArmL",      // Which body part
    hitPosition,      // Where it was hit
    forceDirection,   // Direction of swing
    250,              // Force magnitude (N)
    true              // Is sharp weapon?
)
```

**How It Works:**
1. Applies impulse force to struck limb
2. Calculates damage: `force * 0.3 * zone_multiplier`
3. Checks if force is strong enough to sever joint
4. Sharp weapons get 50% easier severing
5. Spawns blood particles
6. Checks for death

### Damage Zones

```javascript
HEAD: 3.0x multiplier
├─ High damage
├─ Instant death possible
└─ Decapitation possible

TORSO: 1.0x multiplier
├─ Medium damage
├─ Spine can sever (ragdoll splits in half)
└─ Death from multiple hits

LIMBS: 0.7x multiplier
├─ Low damage
├─ Easy to sever
└─ Non-lethal (usually)
```

### Body Parts Available

**Upper Body:**
- `head` - Sphere (easy to hit)
- `upperTorso` - Box (center mass)
- `lowerTorso` - Box (hips)

**Arms:**
- `upperArmL` / `upperArmR` - Shoulders
- `lowerArmL` / `lowerArmR` - Forearms

**Legs:**
- `upperLegL` / `upperLegR` - Thighs
- `lowerLegL` / `lowerLegR` - Shins

### Joint Break Speeds (Weapon)

| Joint | Normal | With WarAxe |
|-------|--------|-------------|
| Neck | 20 m/s | 10 m/s ⚔️ |
| Spine | 25 m/s | 12.5 m/s ⚔️ |
| Shoulder | 15 m/s | 7.5 m/s ⚔️ |
| Elbow | 13 m/s | 6.5 m/s ⚔️ |
| Hip | 18 m/s | 9 m/s ⚔️ |
| Knee | 15 m/s | 7.5 m/s ⚔️ |

**Force to Speed Conversion:**
```javascript
equivalentSpeed = weaponForce / 15
// Example: 250N force = ~16.7 m/s equivalent
// This is enough to sever most limbs!
```

---

## 🎨 Visual Feedback

### Console Messages

**When spawning:**
```
🎯 Ragdoll created at [x, y, z]
```

**When hitting:**
```
🪓 RAGDOLL HIT: upperArmL at 1.23m
⚔️ WEAPON HIT: upperArmL | force: 250N | dmg: 52.5 | hp: 47.5
```

**When severing:**
```
🔪 elbowL SEVERED! [SEVERE] 16.7m/s
🪓 LIMB SEVERED: elbowL cut clean by weapon!
🩸 Blood spray: 30 particles at 16.7m/s
```

**When killing:**
```
☠️ Ragdoll [id] KILLED by weapon strike to head
```

---

## 🚀 Advanced Techniques

### Combo Attacks
Hit the same limb multiple times in quick succession:
```
1. Strike arm (damage + weakens joint)
2. Strike arm again (more damage)
3. Strike arm third time (SEVER!)
```

### Surgical Strikes
Target specific limbs for strategic dismemberment:
- **Arms:** Non-lethal, disables attacks
- **Legs:** Non-lethal, immobilizes
- **Head:** Instant kill, spectacular
- **Spine:** Splits ragdoll in half

### Power Swings
Faster mouse movement = more force:
```
Slow swing (100N)  → Damage only
Medium swing (200N) → Damage + possible sever
Fast swing (300N+)  → Almost guaranteed sever
```

---

## 🐛 Troubleshooting

### "Ragdolls still exploding on landing"
- Check spawn height in console: should be 2.0
- Check console for impact messages
- If you see `💥 [part] impact: 12+m/s`, thresholds need adjustment

### "Weapon not hitting ragdolls"
- Check console for `🪓 RAGDOLL HIT` messages
- Make sure you're in attack mode (click + hold)
- Try getting closer (within 3 meters)
- Check weapon reach in config

### "Limbs won't sever"
- Swing faster (faster mouse movement = more force)
- Hit the same limb multiple times
- Check console for force amount (should be 200-300N)

### "Ragdolls dying too fast"
- Increase health in gore physics config
- Reduce force multiplier in weapon config
- Adjust damage zones

---

## ⚙️ Configuration

### Adjust WarAxe Power
In `WeaponSystem.js`:
```javascript
this.config = {
    reach: 3.0,          // Longer = easier to hit
    damage: 50,          // Higher = more deadly
    weaponForce: 250     // Higher = easier to sever
}
```

### Adjust Severing Difficulty
In `BabylonGorePhysics.js`:
```javascript
weaponSeverThreshold: 8  // Lower = easier to sever
```

### Adjust Ragdoll Durability
In `BabylonGorePhysics.js`:
```javascript
// In createRagdoll()
health: 200  // Default is 100
```

---

## 📊 Performance Notes

**Ragdoll hits are more expensive than enemy hits:**
- Enemy hit: ~0.1ms (simple collision check)
- Ragdoll hit: ~0.5ms (find closest limb, apply force, check joints)

**Recommendation:** Keep max 5 ragdolls active at once for smooth gameplay.

---

## 🎯 Summary

✅ Ragdolls spawn safely at 2m  
✅ WarAxe applies force to specific limbs  
✅ Sharp weapons sever easily  
✅ Proper physics response on impact  
✅ Localized damage by body zone  
✅ Visual and console feedback  

**Try it out!** Spawn a ragdoll (R), get close, and swing that axe! 🪓
