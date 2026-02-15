# 🩸 APPLESAUCE GORE PHYSICS - SETUP GUIDE

## What You Got

I've built a **complete gore physics system** specifically for your **APPLESAUCE Core engine** (THREE.js based). This replaces the old Babylon.js "phy" system with something modern and clean.

---

## 📁 File Structure

```
your-project/
├── three.module.js              (Your THREE.js import)
├── gore-physics.js              (Gore physics module)
├── applesauce-core-gore.js      (Enhanced APPLESAUCE Core)
└── test-gore.html               (Test page - ready to run!)
```

---

## 🚀 Quick Start

### Option 1: Test It Right Now

1. Make sure you have `three.module.js` in your project (the file that imports THREE.js)
2. Open `test-gore.html` in your browser
3. Press **SPACE** to spawn ragdolls
4. Watch them fall and take impact damage

**That's it!** You should see:
- Ragdolls spawning and falling
- Console logs showing impacts
- Stats display in top-right corner
- Dismemberment when they hit hard enough

### Option 2: Integrate with Your Existing Code

If you want to add gore to your current APPLESAUCE setup:

```javascript
import { ApplesauceCore } from './applesauce-core-gore.js';

const game = new ApplesauceCore({
    goreEnabled: true,
    maxSpeed: 1.0
});

// Spawn a ragdoll
game.spawnRagdoll();

// Or create one manually
const ragdoll = game.gore.createRagdoll(
    game.scene,
    new THREE.Vector3(0, 10, 0)
);
```

---

## 🎮 How It Works

### The System

**gore-physics.js** = Core gore module
- Tracks velocity of every body part
- Calculates impact damage
- Handles dismemberment logic
- Manages blood particles

**applesauce-core-gore.js** = Your engine + gore
- Standard APPLESAUCE Core
- Gore physics integrated
- Helper methods for spawning ragdolls
- Stats display built-in

### What Happens

1. **Ragdoll spawns** at a height
2. **Gravity pulls it down** (simple physics simulation)
3. **Velocity tracker** monitors every body part's speed
4. **Ground collision** triggers impact check
5. **Damage calculated** based on speed × zone multiplier
6. **Dismemberment checked** if speed > threshold
7. **Joints sever** and blood spawns if speed is high enough

---

## ⚙️ Configuration

Edit at the top of `applesauce-core-gore.js`:

```javascript
this.gore = new GorePhysics({
    enabled: true,
    damageThreshold: 8,      // m/s to start damage
    severThreshold: 15,      // m/s to sever limbs
    explodeThreshold: 30,    // m/s for catastrophic
    showLogs: true,          // Console output
    showBlood: true,         // Blood particles
    headMultiplier: 3.0,     // 3x damage to head
    torsoMultiplier: 1.0,    // Normal torso damage
    limbMultiplier: 0.7      // 0.7x damage to limbs
});
```

### Example Tweaks

**More Gore (Glass Cannon Mode)**
```javascript
damageThreshold: 5,
severThreshold: 10,
headMultiplier: 5.0
```

**Less Gore (Tank Mode)**
```javascript
damageThreshold: 15,
severThreshold: 30,
headMultiplier: 2.0
```

**No Dismemberment (Damage Only)**
```javascript
severThreshold: 999,
showBlood: false
```

---

## 🎯 Creating Ragdolls

### Method 1: Built-in Helper (Easiest)

```javascript
// Spawn at random position
game.spawnRagdoll();
```

### Method 2: Manual Creation

```javascript
const position = new THREE.Vector3(5, 20, -3);
const ragdoll = game.gore.createRagdoll(game.scene, position);

// Ragdoll is a THREE.Group with all body parts
ragdoll.position.set(10, 15, 0);  // Move it
```

### Method 3: Access Individual Parts

```javascript
const ragdoll = game.gore.createRagdoll(game.scene, position);

// Get the ragdoll data
const ragdollId = ragdoll.name;
const ragdollData = game.gore.ragdolls.get(ragdollId);

// Access individual body parts
const head = ragdollData.bodies.head;
const leftArm = ragdollData.bodies.upperArmL;

// Modify them
head.material.color.setHex(0xFF0000);  // Red head
```

---

## 📊 Getting Stats

```javascript
const stats = game.gore.getStats();

console.log(`Active: ${stats.activeRagdolls}`);
console.log(`Impacts: ${stats.totalImpacts}`);
console.log(`Dismemberments: ${stats.totalDismemberments}`);
console.log(`Deaths: ${stats.totalDeaths}`);
```

The stats display updates automatically in the top-right corner.

---

## 🔧 Understanding the Physics

### Velocity Tracking

Every frame, the system:
1. Records current position of each body part
2. Compares to last frame's position
3. Calculates velocity: `(currentPos - lastPos) / deltaTime`
4. Stores speed: `velocity.length()`

### Damage Calculation

```javascript
damage = impactSpeed × 5 × zoneMultiplier

Example:
- Head impact at 20 m/s = 20 × 5 × 3.0 = 300 damage
- Leg impact at 20 m/s = 20 × 5 × 0.7 = 70 damage

Health starts at 100, so that head impact = instant death!
```

### Dismemberment Logic

Each joint has a `breakSpeed`:

```javascript
neck: 20 m/s
spine: 25 m/s
shoulders: 15 m/s
elbows: 13 m/s
hips: 18 m/s
knees: 15 m/s
```

When impact speed exceeds joint's breakSpeed → limb severs!

### Blood Particles

```javascript
// Spawned on dismemberment
{
    position: worldPosition,
    velocity: randomDirection × speed × 0.5,
    life: 1.0,
    maxLife: 2.0
}

// Updates every frame
velocity += gravity × deltaTime
position += velocity × deltaTime
life -= deltaTime
```

---

## 🎨 Adding Visual Blood Effects

The blood particles are tracked but not rendered. To render them:

```javascript
// In your update loop or gore module:
const bloodGeometry = new THREE.SphereGeometry(0.05);
const bloodMaterial = new THREE.MeshBasicMaterial({ color: 0x8B0000 });

game.gore.bloodParticles.forEach(particle => {
    const blood = new THREE.Mesh(bloodGeometry, bloodMaterial);
    blood.position.copy(particle.position);
    
    // Optional: fade based on life
    blood.material.opacity = particle.life / particle.maxLife;
    blood.material.transparent = true;
    
    game.scene.add(blood);
});
```

Or use a particle system like THREE.Points for better performance.

---

## 🛠️ Customization for Artists

### Make Bodies Bigger/Smaller

Edit `createBodyParts()` in `gore-physics.js`:

```javascript
const scale = 1.5;  // 1.5x bigger humans

// Or make specific parts bigger
head: {
    radius: 0.20 * scale,  // Bigger heads
    ...
}
```

### Change Body Colors

Edit `createBodyPartMesh()` in `gore-physics.js`:

```javascript
material = new THREE.MeshStandardMaterial({
    color: partDef.zone === 'head' ? 0xFFCCBB :  // Flesh tone
           partDef.zone === 'torso' ? 0x0000FF :  // Blue shirt
           0xFF0000,  // Red pants
    roughness: 0.8
});
```

### Add Custom Collisions

Currently only ground collision is implemented. To add more:

```javascript
// In applySimplePhysics()
for (let obstacle of game.obstacles) {
    if (bodyIntersects(body, obstacle)) {
        // Trigger impact
        const impactSpeed = velocity.length();
        game.gore.onImpact(ragdollId, partName, impactSpeed, position);
    }
}
```

---

## 🐛 Troubleshooting

### "Nothing renders"

**Check:**
1. Is `three.module.js` in the right place?
2. Open browser console - are there import errors?
3. Try the test-gore.html file first to verify paths

### "Ragdolls spawn but don't move"

**Check:**
1. Is `game.start()` called?
2. Is `game.gore.update(deltaTime)` being called in update loop?
3. Check console for errors

### "No damage showing"

**Check:**
1. Is `showLogs: true` in gore config?
2. Are ragdolls actually hitting the ground? (y position should hit 0)
3. Is velocity high enough? (need 8+ m/s for damage)

### "Import error: Cannot find module"

**Fix your paths:**
```javascript
// If THREE.js is in a different folder:
import * as THREE from './lib/three.module.js';

// If gore-physics is in a subfolder:
import { GorePhysics } from './modules/gore-physics.js';
```

---

## 🎯 Next Steps

### 1. Test the System
Run `test-gore.html` and verify it works

### 2. Integrate with Your Levels
Use your existing level loading system but spawn ragdolls:

```javascript
levelConfig.onLevelStart = (game) => {
    // Your level setup
    
    // Add gore test
    game.spawnRagdoll();
};
```

### 3. Add Player Collision
Make the player skateboard able to hit ragdolls:

```javascript
// In player update
checkCollisionWithRagdolls(player, game.gore.ragdolls);
```

### 4. Roadkill System
When player hits ragdoll at speed:

```javascript
const playerSpeed = game.state.speed * 10;  // Convert to m/s
if (playerSpeed > 15) {  // Fast enough to kill
    game.gore.onImpact(ragdollId, 'head', playerSpeed, position);
}
```

---

## 💡 Why This Is Better Than the Old System

**Old System (Babylon.js "phy"):**
- Abstract API that hides physics
- Hard to debug
- Rendering issues
- Complex integration

**New System (THREE.js + Gore):**
- Direct THREE.js objects (you can see everything)
- Clean, documented code
- Works with your APPLESAUCE engine
- Easy to customize
- Actually renders!

---

## 🎮 Controls in Test

- **WASD / Arrow Keys** - Move player
- **SPACE** - Spawn ragdoll
- **Watch** - Ragdolls fall and take damage

---

## 📝 Summary

You now have a **complete gore physics system** built specifically for **APPLESAUCE Core**. It:

✅ Uses THREE.js (not Babylon)
✅ Actually renders (no more white screens!)
✅ Tracks velocity and calculates realistic damage
✅ Handles dismemberment at speed thresholds
✅ Works with your existing engine
✅ Easy for artists to configure

Start with `test-gore.html` and work from there!
