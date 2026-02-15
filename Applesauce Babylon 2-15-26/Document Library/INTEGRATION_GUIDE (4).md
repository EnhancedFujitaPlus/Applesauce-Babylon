# 🩸 GORE INTEGRATION GUIDE

## How to Add Gore Tracking to Your Existing HTML

Your physics engine is already working - you just need to add the **gore tracking layer** on top of it. Here's the super simple way:

---

## Option 1: Quick Drop-In (Easiest)

### Step 1: Replace your entire HTML with `ultrabablyon_gore_enhanced.html`

This file has your exact ragdoll code with gore tracking already integrated. Just:

1. Make sure your physics library is loaded (it references `phy` and `math` objects)
2. Open the file in your browser
3. Watch the console and the stats display in the top-right

---

## Option 2: Manual Integration (If you have custom code)

### Step 1: Add Gore Config at the Top

```javascript
const GORE = {
    enabled: true,
    scale: 1.0,              // Adjust body size
    severSpeed: 15,          // m/s to sever limbs
    damageSpeed: 8,          // m/s to start damage
    headMultiplier: 3.0,     // Headshot damage
    showDamageLog: true      // Console output
};
```

### Step 2: Copy the GoreSystem Class

Copy the entire `GoreSystem` class from `gore_module.js` into your HTML. Put it after the config, before your ragdoll code.

### Step 3: Create Gore Instance

```javascript
const gore = new GoreSystem();
```

### Step 4: Modify Your ragdoll() Function

**BEFORE (your current code):**
```javascript
ragdoll = (o) => {
    // ... your body creation code ...
    
    const b = {}
    for(let n in data) {
        b[n] = phy.add({
            type: 'capsule',
            // ... other properties ...
        })
    }
    
    // ... joint creation ...
}
```

**AFTER (with gore tracking):**
```javascript
ragdoll = (o) => {
    // 1. Generate unique ID
    const ragdollId = `ragdoll_${Date.now()}_${Math.random()}`
    
    // ... your body creation code ...
    
    const b = {}
    for(let n in data) {
        b[n] = phy.add({
            type: 'capsule',
            // ... other properties ...
            
            // 2. Add collision callback
            callback: function(collision) {
                if (GORE.enabled) {
                    gore.onImpact(ragdollId, n);  // n is the body part name
                }
            }
        })
    }
    
    // 3. Store joints in an object
    const joints = {}
    joints.neck = phy.add({ /* neck joint */ })
    joints.spine = phy.add({ /* spine joint */ })
    // ... etc for all joints
    
    // 4. Register with gore system
    gore.registerRagdoll(ragdollId, b, joints);
    
    return ragdollId
}
```

### Step 5: Add Update Loop

```javascript
let lastGoreUpdate = Date.now();
function updateGoreSystem() {
    const now = Date.now();
    const dt = (now - lastGoreUpdate) / 1000;
    lastGoreUpdate = now;
    
    gore.update(dt);
    requestAnimationFrame(updateGoreSystem);
}

// Start it
setTimeout(updateGoreSystem, 1000);
```

### Step 6: Optional Stats Display

```html
<div id="stats">
    Impacts: <span id="impacts">0</span><br>
    Dismemberments: <span id="dismembers">0</span><br>
    Deaths: <span id="deaths">0</span>
</div>

<script>
function updateStatsDisplay() {
    const stats = gore.getStats();
    document.getElementById('impacts').textContent = stats.totalImpacts;
    document.getElementById('dismembers').textContent = stats.totalDismemberments;
    document.getElementById('deaths').textContent = stats.totalDeaths;
}
</script>
```

---

## What Each Part Does

### 1. **GORE Config**
Easy artist-friendly settings at the top. Change these to tune behavior.

### 2. **GoreSystem Class**
The brains - tracks velocities, calculates damage, handles dismemberment logic.

### 3. **gore.registerRagdoll()**
Tells the system "hey, this ragdoll exists, track it".

### 4. **gore.onImpact()**
Called whenever a body part collides. Calculates damage and checks for dismemberment.

### 5. **gore.update()**
Runs every frame to calculate velocities from position changes.

---

## Key Integration Points

### Your Physics Engine Must Support:

1. **Collision Callbacks**
   ```javascript
   callback: function(collision) {
       // Gets called when body collides
   }
   ```

2. **Body Position Access**
   ```javascript
   body.getPosition()  // or however your engine exposes position
   ```

3. **Joint Removal** (for dismemberment)
   ```javascript
   phy.remove(jointReference)  // or your engine's remove method
   ```

---

## Troubleshooting

### "No damage showing in console"

**Check:**
- Is `GORE.enabled = true`?
- Is `GORE.showDamageLog = true`?
- Are collisions actually happening? (add console.log in callback)
- Is the update loop running?

### "Bodies not moving"

The gore system doesn't affect physics - it just tracks. If bodies aren't moving, that's your physics engine setup.

### "Position is undefined"

Your physics engine might expose positions differently. Check:
```javascript
// Common variants:
body.getPosition()      // Method
body.position           // Property
body.pos                // Property
body.userData.position  // Nested
```

Update the `gore.update()` function to match your engine.

### "Joints not severing"

Make sure you're calling `phy.remove()` (or your engine's equivalent) in the gore system's dismemberment code:

```javascript
// In checkDismemberment(), find this:
// REMOVE THE JOINT FROM YOUR PHYSICS ENGINE HERE
const ragdoll = this.ragdolls.get(ragdollId);
if (ragdoll && ragdoll.joints && ragdoll.joints[jointName]) {
    phy.remove(ragdoll.joints[jointName]);  // <-- Add your remove call
}
```

---

## Adjusting for Your Artists

### Make it More Fragile
```javascript
GORE.severSpeed = 10     // Lower = easier to dismember
GORE.headMultiplier = 5  // Higher = more lethal headshots
```

### Make it More Resilient
```javascript
GORE.severSpeed = 25     // Higher = harder to dismember
GORE.damageSpeed = 15    // Need more speed to damage
```

### Disable Gore Temporarily
```javascript
GORE.enabled = false     // Physics still works, no tracking
```

---

## What You Should See

### Console Output
```
🩸 GORE ENGINE ACTIVE
🎯 Registered ragdoll: ragdoll_1738123_abc
💥 legL1 impact: 18.7m/s | dmg: 65.2 | hp: 34.8
🔪 kneeL SEVERED! [SEVERE] 18.7m/s
☠️ Ragdoll ragdoll_1738123_abc DEAD
```

### Stats Display (if added)
```
Impacts: 127
Dismemberments: 23
Deaths: 8
```

---

## Next Steps

1. **Start with ultrabablyon_gore_enhanced.html** - it has everything ready
2. **Test with a few ragdolls first** (set numRagdoll = 5)
3. **Watch the console** to see gore events
4. **Tune GORE config** to get the feel you want
5. **Add visual effects** for blood/dismemberment using the console output as triggers

---

## The Key Insight

The gore system is a **separate tracking layer**. Your physics engine does its thing, and the gore system watches, calculates, and reports. They communicate through:

1. **Registration** - "Here's a ragdoll, track it"
2. **Collision callbacks** - "Something hit, check damage"
3. **Update loop** - "Calculate velocities from positions"

Your physics handles movement, collisions, and rendering.
Gore handles damage, dismemberment logic, and reporting.

Both work together through simple callbacks and tracking!
