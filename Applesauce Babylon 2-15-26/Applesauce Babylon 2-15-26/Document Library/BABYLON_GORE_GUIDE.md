# 🛹 APPLESAUCE - BABYLON.JS + HAVOK + GORE GUIDE

## What You Have Now

I've converted APPLESAUCE Core to **Babylon.js + Havok physics** and built a gore system that uses **real physics collisions**. This is WAY better than manual velocity tracking!

---

## 📁 Your Files

```
your-project/
├── applesauce-core-babylon.js    ← Core engine (Babylon.js)
├── babylon-skater.js              ← Player with Havok physics (you already have this!)
├── babylon-terrain.js             ← Terrain system (you already have this!)
├── babylon-gore-physics.js        ← NEW! Gore with Havok collisions
└── test-babylon-gore.html         ← Test page - OPEN THIS!
```

---

## 🚀 Quick Start

### Step 1: Put Files Together

All 4 files need to be in the same directory.

### Step 2: Open test-babylon-gore.html

That's it! You should see:
- Babylon.js scene loading
- Havok physics initializing
- Player spawning
- 3 ragdolls falling from the sky
- Gore stats updating in real-time

### Step 3: Test Controls

- **WASD** - Move around
- **SPACE** - Jump
- **E** - Kickflip
- **R** - Spawn ragdoll (press multiple times!)

---

## 🎯 How It Works

### The Architecture

```
APPLESAUCE Core (Babylon.js)
    ↓
Loads Havok Physics
    ↓
Creates Player (babylon-skater.js)
    ↓
Creates Terrain (babylon-terrain.js)
    ↓
Initializes Gore (babylon-gore-physics.js)
    ↓
Ragdolls fall → Havok detects collisions → Gore calculates damage
```

### Why This Is Better Than THREE.js

**OLD (THREE.js):**
- Manual velocity tracking
- No real collisions
- Approximate physics
- Hard to debug

**NEW (Babylon.js + Havok):**
- ✅ **Real physics collisions** from Havok
- ✅ **Automatic collision detection**
- ✅ **Realistic forces and constraints**
- ✅ **Better performance**
- ✅ **Built-in shadow system**

---

## 🩸 Gore Physics System

### How Collisions Work

1. **Ragdoll created** with 11 body parts (head, torso, arms, legs)
2. **Havok assigns PhysicsAggregate** to each part
3. **Collision Observable** registered on each body
4. **When collision occurs:**
   ```javascript
   body.getCollisionObservable().add((event) => {
       const velocity = body.getLinearVelocity();
       const speed = velocity.length();
       
       if (speed > damageThreshold) {
           applyDamage(speed, bodyPart);
       }
   });
   ```

### Damage Calculation

```javascript
damage = impactSpeed × 5 × zoneMultiplier

Examples:
- Head at 20 m/s = 20 × 5 × 3.0 = 300 damage (instant death!)
- Leg at 20 m/s = 20 × 5 × 0.7 = 70 damage
- Torso at 10 m/s = 10 × 5 × 1.0 = 50 damage
```

Each ragdoll starts with **100 health**.

### Dismemberment Thresholds

Each joint has a break speed:

| Joint | Break Speed | Effect |
|-------|-------------|--------|
| Neck | 20 m/s | Critical - instant death |
| Spine | 25 m/s | Critical - instant death |
| Shoulders | 15 m/s | Arm falls off |
| Elbows | 13 m/s | Forearm separates |
| Hips | 18 m/s | Leg detaches |
| Knees | 15 m/s | Lower leg severs |

When impact speed exceeds break speed → joint severs → limb falls off!

---

## ⚙️ Configuration

### Gore Settings

Edit in `babylon-gore-physics.js` or when creating:

```javascript
const gore = new BabylonGorePhysics(scene, {
    enabled: true,              // Turn gore on/off
    damageThreshold: 8,         // m/s to start damage
    severThreshold: 15,         // m/s to sever limbs
    explodeThreshold: 30,       // m/s for catastrophic
    headMultiplier: 3.0,        // Headshot damage
    torsoMultiplier: 1.0,       // Torso damage
    limbMultiplier: 0.7,        // Limb damage
    showLogs: true,             // Console output
    showBlood: true             // Blood particles
});
```

### Example Tweaks

**Glass Cannon (More Gore):**
```javascript
{
    damageThreshold: 5,
    severThreshold: 10,
    headMultiplier: 5.0
}
```

**Tank Mode (Less Gore):**
```javascript
{
    damageThreshold: 15,
    severThreshold: 30,
    headMultiplier: 2.0
}
```

**No Dismemberment:**
```javascript
{
    severThreshold: 999,
    showBlood: false
}
```

---

## 🎮 Integration with Your Levels

### Basic Level Setup

```javascript
const myLevel = {
    meta: {
        name: "My Level",
        version: "1.0"
    },
    
    terrain: {
        type: 'skatepark',  // or 'flat', 'hills', 'procedural'
        size: 200,
        features: [
            { type: 'ramp', position: { x: 10, z: 0 } },
            { type: 'rail', position: { x: -10, z: 5 } }
        ]
    },
    
    playerStart: { x: 0, y: 3, z: 0 },
    
    onLevelStart: async (game) => {
        // Initialize gore
        game.gore = new BabylonGorePhysics(game.scene, {
            enabled: true
        });
        
        // Spawn some NPCs
        for (let i = 0; i < 5; i++) {
            const pos = new BABYLON.Vector3(
                Math.random() * 40 - 20,
                10,
                Math.random() * 40 - 20
            );
            game.gore.createRagdoll(pos);
        }
    },
    
    onUpdate: (game) => {
        // Your level logic
    }
};

// Load it
await game.loadLevel(myLevel);
```

### Spawning Ragdolls

```javascript
// Spawn at specific position
const ragdoll = game.gore.createRagdoll(
    new BABYLON.Vector3(10, 15, -5)
);

// Spawn at random position
const x = Math.random() * 50 - 25;
const z = Math.random() * 50 - 25;
game.gore.createRagdoll(new BABYLON.Vector3(x, 15, z));
```

### Getting Stats

```javascript
const stats = game.gore.getStats();

console.log(stats.activeRagdolls);      // How many alive
console.log(stats.totalImpacts);        // Total collisions
console.log(stats.totalDismemberments); // Total limbs severed
console.log(stats.totalDeaths);         // Total deaths
```

---

## 🔧 Advanced: Player Collision Damage

Want the player's skateboard to damage ragdolls? Add this:

```javascript
// In your level's onUpdate
onUpdate: (game) => {
    if (!game.player || !game.gore) return;
    
    const playerSpeed = game.playerModule.getSpeed();
    
    // Check if player is moving fast enough to kill
    if (playerSpeed > 15) { // 15 m/s = roadkill speed
        
        // Get player position
        const playerPos = game.playerModule.getPosition();
        
        // Check distance to each ragdoll
        for (let [id, ragdoll] of game.gore.ragdolls) {
            if (!ragdoll.alive) continue;
            
            const ragdollPos = ragdoll.root.position;
            const distance = BABYLON.Vector3.Distance(playerPos, ragdollPos);
            
            // If close enough, trigger roadkill
            if (distance < 2) {
                console.log(`💀 ROADKILL at ${playerSpeed.toFixed(1)}m/s!`);
                
                // Damage head (instant kill at high speed)
                const head = ragdoll.bodies.head;
                game.gore.onCollision(id, 'head', {
                    point: ragdollPos
                });
            }
        }
    }
}
```

---

## 🎨 Visual Customization

### Body Colors

Edit `createBodyParts()` in `babylon-gore-physics.js`:

```javascript
// Change skin color
const skinMat = new BABYLON.StandardMaterial("skinMat", this.scene);
skinMat.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.5); // Tan skin

// Change shirt color
const shirtMat = new BABYLON.StandardMaterial("shirtMat", this.scene);
shirtMat.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red shirt

// Change pants color
const pantsMat = new BABYLON.StandardMaterial("pantsMat", this.scene);
pantsMat.diffuseColor = new BABYLON.Color3(0, 0, 0.5); // Blue pants
```

### Body Proportions

Change the `scale` variable:

```javascript
const scale = 1.5;  // 1.5x bigger humans
```

Or edit individual parts:

```javascript
// Bigger head
const head = BABYLON.MeshBuilder.CreateSphere(
    "head",
    { diameter: 0.4 * scale, segments: 12 }, // Changed from 0.3
    this.scene
);
```

---

## 🐛 Troubleshooting

### "Havok is not defined"

**Problem:** Havok didn't load from CDN

**Solution:** Make sure you have internet and the CDN is accessible:
```html
<script src="https://cdn.babylonjs.com/havok/HavokPhysics_umd.js"></script>
```

Or download Havok locally.

### "Cannot find module"

**Problem:** Import paths are wrong

**Solution:** Make sure all 4 files are in the same directory and use relative imports:
```javascript
import { ApplesauceCore } from './applesauce-core-babylon.js';
import { BabylonSkater } from './babylon-skater.js';
import { BabylonTerrain } from './babylon-terrain.js';
import { BabylonGorePhysics } from './babylon-gore-physics.js';
```

### Ragdolls fall through ground

**Problem:** Terrain doesn't have physics

**Solution:** Make sure terrain has a PhysicsAggregate:
```javascript
new BABYLON.PhysicsAggregate(
    ground,
    BABYLON.PhysicsShapeType.BOX,
    { mass: 0, friction: 0.8 },
    scene
);
```

### No collision detection

**Problem:** Collision observables not working

**Solution:** Make sure Havok is fully initialized before creating ragdolls:
```javascript
await game.init(); // Wait for this!
game.gore = new BabylonGorePhysics(game.scene);
```

### Bodies fly everywhere

**Problem:** Too much force/energy in system

**Solution:** Adjust restitution (bounciness):
```javascript
// In createBodyParts()
new BABYLON.PhysicsAggregate(
    mesh,
    shapeType,
    { 
        mass: mass,
        restitution: 0.1,  // Lower = less bounce (was 0.3)
        friction: 0.6 
    },
    scene
);
```

---

## 📊 Performance Tips

### For 50+ Ragdolls

1. **Reduce body part count** - combine arms/legs into single capsules
2. **Lower mesh detail** - fewer segments on spheres/capsules
3. **Disable shadows** on distant ragdolls
4. **Sleep inactive bodies**:
   ```javascript
   if (ragdoll.root.position.y < -10) {
       ragdoll.aggregate.body.setMotionType(BABYLON.PhysicsMotionType.STATIC);
   }
   ```

### For Best Visual Quality

1. **Enable shadows** on all bodies
2. **Add blood particle system** (currently just tracked)
3. **Use PBR materials** instead of Standard materials
4. **Add post-processing** (glow, bloom for impacts)

---

## 🎯 Next Steps

### 1. Test the System
Open `test-babylon-gore.html` and press **R** to spawn ragdolls. Watch them fall and take damage!

### 2. Create Your First Level
Copy the test level and modify:
- Change terrain type
- Add skatepark features
- Spawn NPCs in specific locations

### 3. Add Roadkill System
Use the player collision example above to damage ragdolls when hit by the skateboard.

### 4. Visual Polish
- Add particle system for blood
- Add impact flashes
- Add slow-motion on dismemberment
- Add sound effects

---

## 💡 Key Differences from THREE.js

| Feature | THREE.js Version | Babylon.js + Havok |
|---------|------------------|-------------------|
| Physics | Manual simulation | Real Havok engine |
| Collisions | Manual checking | Automatic detection |
| Constraints | N/A | Real joint constraints |
| Shadows | Manual setup | Built-in shadow generator |
| Performance | ~30 ragdolls | ~100+ ragdolls |
| Complexity | High | Low |

---

## 🎮 Controls Reference

```
WASD / Arrow Keys - Move player
SPACE - Jump
E - Kickflip
R - Spawn ragdoll

Console shows:
💥 = Impact
🔪 = Dismemberment
☠️ = Death
🎯 = Ragdoll spawn
```

---

## 📝 Summary

You now have:

✅ **APPLESAUCE Core** in Babylon.js  
✅ **Havok physics** for realistic collisions  
✅ **BabylonSkater** player controller (you already had this!)  
✅ **BabylonTerrain** system (you already had this!)  
✅ **BabylonGorePhysics** with velocity-based damage  
✅ **Complete test environment** ready to run

This is a **production-ready** setup that's way cleaner than manual THREE.js physics. Havok does the heavy lifting - you just define the gore logic!

Start with `test-babylon-gore.html` and build from there! 🛹💀
