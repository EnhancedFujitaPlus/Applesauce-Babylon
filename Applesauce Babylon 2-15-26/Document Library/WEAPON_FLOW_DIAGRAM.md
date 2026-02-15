# WarAxe → Ragdoll System Flow

## 🎯 How It Works (Visual)

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAYER ATTACKS                           │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Click + Hold   │
                    │ Move Mouse     │
                    │ Release        │
                    └────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              WEAPON SYSTEM (WeaponSystem.js)                │
│                                                             │
│  1. Get blade position in world space                      │
│  2. Check distance to all targets                          │
│  3. Find what was hit:                                      │
│     - Enemy (zombie)?    → Standard damage                  │
│     - Ragdoll?          → Find closest limb                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌──────────┐      ┌──────────────┐
            │  ENEMY   │      │   RAGDOLL    │
            │  HIT     │      │   HIT        │
            └──────────┘      └──────────────┘
                    │                 │
                    ▼                 ▼
         ┌─────────────────┐  ┌──────────────────────────┐
         │ Simple Damage   │  │ Find Closest Body Part:  │
         │ - Health -50    │  │  - head                  │
         │ - Check death   │  │  - upperArmL             │
         │ - Blood spray   │  │  - lowerLegR             │
         │                 │  │  - etc...                │
         └─────────────────┘  └──────────────────────────┘
                                        │
                                        ▼
                      ┌──────────────────────────────────┐
                      │  GORE PHYSICS SYSTEM             │
                      │  (BabylonGorePhysics.js)         │
                      │                                  │
                      │  applyWeaponHit():               │
                      │  1. Apply force to limb (250N)   │
                      │  2. Calculate damage             │
                      │  3. Check for severing           │
                      │  4. Spawn blood                  │
                      │  5. Check for death              │
                      └──────────────────────────────────┘
                                        │
                      ┌─────────────────┼─────────────────┐
                      ▼                 ▼                 ▼
              ┌────────────┐    ┌────────────┐   ┌────────────┐
              │   FORCE    │    │   DAMAGE   │   │  SEVERING  │
              │  Physics   │    │  Subtract  │   │  Break     │
              │  Impulse   │    │  from HP   │   │  Joint     │
              └────────────┘    └────────────┘   └────────────┘
                      │                 │                 │
                      ▼                 ▼                 ▼
              ┌────────────┐    ┌────────────┐   ┌────────────┐
              │ Limb flies │    │ HP: 47.5   │   │ Arm flies  │
              │ backward   │    │ (was 100)  │   │ off!       │
              └────────────┘    └────────────┘   └────────────┘
```

---

## 🎯 Hit Detection (Step by Step)

```
STEP 1: Get Blade Position
┌────────────────────────┐
│   Player Camera        │
│         │              │
│         ▼              │
│   ┌─────────┐          │
│   │ WarAxe  │◄─── Position in 3D space
│   │  Blade  │          │
│   └─────────┘          │
└────────────────────────┘

STEP 2: Calculate Distances
┌────────────────────────────────────┐
│  Blade Position: (x, y, z)         │
│                                    │
│  Ragdoll:                          │
│    ├─ Head: 5.2m away   ✗          │
│    ├─ Torso: 3.8m away  ✗          │
│    ├─ ArmL: 1.5m away   ✓ CLOSEST  │
│    ├─ ArmR: 4.1m away   ✗          │
│    └─ Legs: 6.0m away   ✗          │
│                                    │
│  Weapon Reach: 3.0m                │
│  1.5m < 3.0m → HIT!                │
└────────────────────────────────────┘

STEP 3: Apply Effects
┌────────────────────────────────────┐
│  HIT: upperArmL                    │
│                                    │
│  Force: 250N                       │
│  Direction: →                      │
│                                    │
│  Results:                          │
│  ├─ Arm pushed 250N to the right   │
│  ├─ Damage: 250 * 0.3 * 0.7 = 52.5 │
│  ├─ HP: 100 → 47.5                 │
│  ├─ Check joint: 16.7m/s vs 7.5m/s │
│  └─ SEVER! 🔪                      │
└────────────────────────────────────┘
```

---

## 🗡️ Damage Calculation

```
┌─────────────────────────────────────────────┐
│           WEAPON DAMAGE FORMULA             │
├─────────────────────────────────────────────┤
│                                             │
│  damage = force × 0.3 × zone_multiplier     │
│                                             │
│  Example (hitting torso):                   │
│  250N × 0.3 × 1.0 = 75 damage               │
│                                             │
│  Example (hitting head):                    │
│  250N × 0.3 × 3.0 = 225 damage! 💀          │
│                                             │
│  Example (hitting limb):                    │
│  250N × 0.3 × 0.7 = 52.5 damage             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ⚡ Force to Severing

```
┌───────────────────────────────────────────────┐
│         SEVERING CALCULATION                  │
├───────────────────────────────────────────────┤
│                                               │
│  effectiveSpeed = weaponForce / 15            │
│                                               │
│  Example:                                     │
│  250N ÷ 15 = 16.7 m/s equivalent              │
│                                               │
│  Joint Thresholds (with WarAxe):              │
│  ├─ Elbow: 6.5 m/s   → SEVERED! ✓             │
│  ├─ Shoulder: 7.5 m/s → SEVERED! ✓            │
│  ├─ Knee: 7.5 m/s → SEVERED! ✓                │
│  └─ Neck: 10 m/s → SEVERED! ✓                 │
│                                               │
│  16.7 m/s is strong enough to cut             │
│  through ALL joints! 🪓                       │
│                                               │
└───────────────────────────────────────────────┘
```

---

## 🎯 Body Zones

```
        HEAD (3.0x)
           ○
          ╱│╲
         ╱ │ ╲
    ARM ●  │  ● ARM     ← UPPER TORSO (1.0x)
       │   │   │
       │   █   │        ← LOWER TORSO (1.0x)
       │  ╱ ╲  │
       ● ●   ● ●
         │     │
         │     │         ← UPPER LEG (0.7x)
         │     │
         ●     ●
         │     │
         │     │         ← LOWER LEG (0.7x)
         │     │
         ●     ●

DAMAGE MULTIPLIERS:
○ Head:  300% damage
█ Torso: 100% damage  
● Limbs:  70% damage
```

---

## 🔄 Complete Flow Example

```
USER ACTION: Attack ragdoll's left arm
                    │
                    ▼
            Click + Hold
                    │
                    ▼
          Move Mouse Right
                    │
                    ▼
              Release
                    │
                    ▼
┌───────────────────────────────────────┐
│ WeaponSystem.checkHits()              │
│ - Blade at (5, 1.5, 3)                │
│ - Scan ragdolls                       │
│ - Find closest part: upperArmL        │
│ - Distance: 1.2m < 3.0m reach ✓       │
└───────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│ GorePhysics.applyWeaponHit()          │
│ - ragdollId: "ragdoll_12345"          │
│ - partName: "upperArmL"               │
│ - force: 250N                         │
│ - direction: (1, 0, 0) →              │
│ - isSharp: true                       │
└───────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    IMPULSE     DAMAGE      SEVER
    250N →      52.5        Joint
                            Break
                              │
                              ▼
                         🔪 ARM OFF!
                         🩸 BLOOD SPRAY!
```

---

## 📊 Before vs After

### BEFORE (Broken):
```
Spawn Ragdoll
    │
    ▼
Height: 5m
    │
    ▼
Fall Speed: 9.9 m/s
    │
    ▼
Ground Impact
    │
    ▼
💥 EXPLODES! (damage threshold: 8 m/s)
```

### AFTER (Fixed):
```
Spawn Ragdoll
    │
    ▼
Height: 2m
    │
    ▼
Fall Speed: 6.3 m/s
    │
    ▼
Ground Impact
    │
    ▼
✓ Safe Landing (threshold: 12 m/s)
    │
    ▼
Ready for Combat!
```

---

## 🎮 Testing Checklist

```
□ Spawn ragdoll (R key)
    └─ Should land safely at 2m
    
□ Attack standing ragdoll
    └─ Should see hit feedback
    └─ Limb should fly backward
    └─ Console: "🪓 RAGDOLL HIT"
    
□ Attack same limb 3 times
    └─ Should sever on 2nd or 3rd hit
    └─ Console: "🔪 [joint] SEVERED!"
    
□ Fast power swing
    └─ Should sever in 1 hit
    └─ Blood spray on impact
    
□ Headshot
    └─ Massive damage
    └─ Possible instant death
```

---

Ready to test! Press R to spawn a ragdoll and swing that axe! 🪓
