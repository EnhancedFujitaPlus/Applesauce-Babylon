# HavokRagdoll Integration Guide

## 🎯 What's Different

### Old System (Manual Body Parts)
```javascript
// Manually created body parts
createBodyParts() {
    const head = CreateSphere(...);
    const torso = CreateBox(...);
    // Connect with constraints
}
```
**Problem:** No skeleton, no animation, parts fly apart on spawn

### New System (Skeleton-Based)
```javascript
// Uses actual 3D model skeleton
new HavokRagdoll(skeleton, mesh, boneConfig);
```
**Benefits:** 
- ✅ Proper bone hierarchy
- ✅ Smooth animation → ragdoll transition
- ✅ No explosion on spawn
- ✅ Real limb physics

---

## 📋 Prerequisites

### 1. You Need a 3D Model With Skeleton
The ragdoll system requires a rigged character model (GLTF/GLB with bones).

**Where to get models:**
- Mixamo (free rigged characters)
- Sketchfab (search "rigged humanoid")
- Create your own in Blender

### 2. Bone Names
You need to know your model's bone names. Common naming:
```
Hips (root)
├─ Spine
│  ├─ Spine1
│  │  ├─ Spine2
│  │  │  ├─ Neck
│  │  │  │  └─ Head
│  │  │  ├─ LeftShoulder
│  │  │  │  ├─ LeftArm
│  │  │  │  │  └─ LeftForeArm
│  │  │  │  │     └─ LeftHand
│  │  │  └─ RightShoulder (etc.)
│  ├─ LeftUpLeg
│  │  └─ LeftLeg
│  │     └─ LeftFoot
│  └─ RightUpLeg (etc.)
```

---

## 🔧 Configuration Example

### Basic Humanoid Config
```javascript
const ragdollConfig = [
    // ROOT (Hips)
    {
        bone: "Hips",
        width: 0.3,
        height: 0.3,
        depth: 0.3,
        mass: 15,
        breakForce: 1000 // Very hard to break spine
    },
    
    // SPINE
    {
        bone: "Spine",
        width: 0.4,
        height: 0.5,
        depth: 0.25,
        mass: 20,
        breakForce: 1000
    },
    
    // HEAD
    {
        bone: "Head",
        width: 0.3,
        height: 0.3,
        depth: 0.3,
        mass: 5,
        breakForce: 500, // Easier to decapitate
        joint: BABYLON.Physics6DoFConstraint.LockConstraint(),
        min: -0.5,
        max: 0.5
    },
    
    // LEFT ARM
    {
        bone: "LeftArm",
        width: 0.15,
        height: 0.3,
        depth: 0.15,
        mass: 3,
        breakForce: 300 // Easy to sever
    },
    {
        bone: "LeftForeArm",
        width: 0.12,
        height: 0.25,
        depth: 0.12,
        mass: 2,
        breakForce: 250
    },
    
    // RIGHT ARM (mirror left)
    {
        bone: "RightArm",
        width: 0.15,
        height: 0.3,
        depth: 0.15,
        mass: 3,
        breakForce: 300
    },
    {
        bone: "RightForeArm",
        width: 0.12,
        height: 0.25,
        depth: 0.12,
        mass: 2,
        breakForce: 250
    },
    
    // LEFT LEG
    {
        bone: "LeftUpLeg",
        width: 0.2,
        height: 0.45,
        depth: 0.2,
        mass: 8,
        breakForce: 400
    },
    {
        bone: "LeftLeg",
        width: 0.15,
        height: 0.4,
        depth: 0.15,
        mass: 6,
        breakForce: 350
    },
    
    // RIGHT LEG (mirror left)
    {
        bone: "RightUpLeg",
        width: 0.2,
        height: 0.45,
        depth: 0.2,
        mass: 8,
        breakForce: 400
    },
    {
        bone: "RightLeg",
        width: 0.15,
        height: 0.4,
        depth: 0.15,
        mass: 6,
        breakForce: 350
    }
];
```

---

## 🎮 Usage Examples

### Example 1: Loading a Model
```javascript
// Load GLTF model with skeleton
BABYLON.SceneLoader.ImportMesh(
    "",
    "/models/",
    "character.glb",
    scene,
    (meshes, particleSystems, skeletons) => {
        const mesh = meshes[0];
        const skeleton = skeletons[0];
        
        // Create ragdoll
        const ragdoll = new HavokRagdoll(
            skeleton,
            mesh,
            ragdollConfig,
            scene,
            gorePhysics // Optional: for blood effects
        );
        
        // Initialize
        ragdoll.init();
        
        // Start in animation mode (not ragdoll yet)
        // Ragdoll activates when hit or on command
    }
);
```

### Example 2: Weapon Integration
```javascript
// In WeaponSystem.checkHits()
const hits = weaponSystem.checkHits(enemies, ragdolls);

hits.forEach(hit => {
    if (hit.type === 'ragdoll') {
        // Hit a ragdoll limb
        hit.ragdoll.applyWeaponHit(
            hit.boneName,      // Which bone was hit
            hit.position,      // World position
            forceDirection,    // Direction of swing
            250,               // Force (N)
            true               // Is sharp weapon
        );
    }
});
```

### Example 3: Finding Closest Bone
```javascript
// When weapon hits ragdoll, find which bone was closest
function findClosestBone(ragdoll, hitPosition) {
    let closestBone = null;
    let closestDist = Infinity;
    
    for (let i = 0; i < ragdoll.bones.length; i++) {
        const bonePos = ragdoll.bones[i].getAbsolutePosition(ragdoll.mesh);
        const dist = BABYLON.Vector3.Distance(hitPosition, bonePos);
        
        if (dist < closestDist) {
            closestDist = dist;
            closestBone = ragdoll.boneNames[i];
        }
    }
    
    return closestBone;
}
```

---

## 🔄 Ragdoll State Transitions

### State 1: Animated (Default)
```
Character is animated
├─ Bones follow animation
├─ Physics boxes follow bones
└─ No physics simulation
```

### State 2: Ragdoll (After Hit/Death)
```
Character becomes ragdoll
├─ Bones follow physics boxes
├─ Full physics simulation
└─ Responds to forces
```

### Activation Methods

**Method 1: Manual**
```javascript
ragdoll.activateRagdoll();
```

**Method 2: On First Weapon Hit**
```javascript
// Automatically activates in applyWeaponHit()
ragdoll.applyWeaponHit(...);
```

**Method 3: On Death**
```javascript
if (enemy.health <= 0) {
    enemy.ragdoll.activateRagdoll();
}
```

---

## 🩸 Blood Integration

### Automatic Blood on Hit
```javascript
const ragdoll = new HavokRagdoll(
    skeleton,
    mesh,
    config,
    scene,
    gorePhysics  // Pass gore system!
);

// Now blood automatically spawns on hits
ragdoll.applyWeaponHit(...);
// → Blood spray happens automatically!
```

### Manual Blood Control
```javascript
// Disable auto blood
const ragdoll = new HavokRagdoll(..., null);

// Add blood manually
if (ragdoll.applyWeaponHit(...)) {
    gorePhysics.spawnBlood(
        hitPosition,
        forceMagnitude / 10,
        'SEVERE'
    );
}
```

---

## 🔪 Dismemberment System

### How It Works
```
1. Weapon hits limb
   ↓
2. Convert force to "effective speed"
   effectiveSpeed = force / 15
   ↓
3. Check if speed exceeds breakForce threshold
   if (effectiveSpeed >= breakForce * 0.5) // Sharp weapon bonus
   ↓
4. Remove physics constraint
   parent.body.removeConstraint(child.body)
   ↓
5. Limb flies off!
```

### Break Force Values
```javascript
// Recommended breakForce values:
{
    bone: "Head",
    breakForce: 500  // Medium difficulty
},
{
    bone: "LeftArm",
    breakForce: 300  // Easy to sever
},
{
    bone: "LeftForeArm",
    breakForce: 250  // Very easy
},
{
    bone: "Spine",
    breakForce: 1000 // Very hard (prevents torso split)
}
```

### Force Calculation
```
Weapon swing: 250N force
↓
Effective speed: 250 / 15 = 16.7 m/s
↓
Sharp weapon bonus: 0.5x threshold
breakForce: 300 → threshold: 20 m/s → with bonus: 10 m/s
↓
16.7 >= 10? YES → SEVER!
```

---

## 🎨 Visual Debugging

### Show Collision Boxes
```javascript
// Enable on creation
ragdoll.showBoxes = true;

// Toggle at runtime
ragdoll.toggleShowBoxes();
```

### Console Logging
The system logs everything:
```
🎯 HavokRagdoll created: ragdoll_1234567890
🔧 Created collider for bone: LeftArm
🔗 Joint created: Spine ↔ Head
✅ HavokRagdoll initialized with 12 bones
💀 Activating ragdoll: ragdoll_1234567890
⚔️ HIT: LeftArm | force: 250N | dmg: 75.0 | hp: 25.0
🔪 SEVERED: Spine ↔ LeftArm
☠️ Ragdoll died: ragdoll_1234567890
```

---

## 🐛 Troubleshooting

### "Bones not found"
**Problem:** Bone names in config don't match skeleton
**Fix:** 
```javascript
// List all bone names
console.log(skeleton.bones.map(b => b.name));

// Use exact names in config
```

### "Ragdoll explodes on spawn"
**Problem:** Missing collision filtering
**Fix:** Already handled in `setupCollisionFiltering()`

### "Limbs won't sever"
**Problem:** breakForce too high or force too low
**Fix:**
```javascript
// Lower breakForce values
breakForce: 200  // Instead of 500

// Or increase weapon force
forceMagnitude = 400  // Instead of 250
```

### "No blood appears"
**Problem:** gorePhysics not passed to constructor
**Fix:**
```javascript
const ragdoll = new HavokRagdoll(
    skeleton, mesh, config, scene,
    gorePhysics  // Don't forget this!
);
```

---

## 📊 Performance

### Cost per Ragdoll
- 10-15 bones: ~3-5ms per frame
- Physics constraints: ~0.5ms per joint
- Bone → physics sync: ~0.2ms per bone

### Optimization Tips
1. **Limit active ragdolls:** Max 3-5 at once
2. **Reduce bone count:** Use simplified skeleton
3. **Disable distant ragdolls:** Freeze when far from player
4. **Remove old ragdolls:** After 10 seconds

---

## 🚀 Next Steps

1. **Load a rigged model** (Mixamo, Sketchfab, etc.)
2. **Get bone names** (console.log skeleton)
3. **Create config** (match bone names)
4. **Test with one ragdoll** (spawn, hit, sever)
5. **Integrate with enemies** (death → ragdoll)

---

This system is WAY more stable than manual body parts! No more explosions! 🎉
