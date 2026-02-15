# 🗂️ APPLESAUCE GORE - FILE STRUCTURE

## Recommended Project Layout

```
your-applesauce-project/
│
├── 📁 lib/
│   └── three.module.js          ← Your THREE.js import
│
├── 📁 modules/  (or src/)
│   ├── gore-physics.js          ← 🩸 Gore physics engine
│   └── applesauce-core-gore.js  ← 🎮 Enhanced APPLESAUCE Core
│
├── 📁 levels/
│   ├── level-01.js
│   ├── level-02.js
│   └── gore-test.js             ← Test level with ragdolls
│
├── 📁 assets/
│   ├── 📁 textures/
│   ├── 📁 models/
│   └── 📁 sounds/
│
├── test-gore.html               ← 🧪 Test page (start here!)
└── index.html                   ← Your main game
```

---

## How Files Connect

```
test-gore.html
    │
    ├─► imports applesauce-core-gore.js
    │       │
    │       ├─► imports gore-physics.js
    │       │       │
    │       │       └─► imports THREE from three.module.js
    │       │
    │       └─► extends ApplesauceCore with gore
    │
    └─► defines test level config
```

---

## Minimal Setup (Just to Test)

If you just want to test gore right now:

```
test-folder/
├── three.module.js              ← Download from THREE.js CDN
├── gore-physics.js              ← From outputs
├── applesauce-core-gore.js      ← From outputs
└── test-gore.html               ← From outputs - OPEN THIS!
```

**Steps:**
1. Create a folder
2. Get `three.module.js` from https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js
3. Copy the 3 files from outputs
4. Open `test-gore.html` in browser
5. Press SPACE to spawn ragdolls!

---

## Import Path Examples

### If THREE.js is in a `lib/` folder:

**In gore-physics.js:**
```javascript
import * as THREE from '../lib/three.module.js';
```

**In applesauce-core-gore.js:**
```javascript
import * as THREE from '../lib/three.module.js';
import { GorePhysics } from './gore-physics.js';
```

### If everything is in the same folder:

**In gore-physics.js:**
```javascript
import * as THREE from './three.module.js';
```

**In applesauce-core-gore.js:**
```javascript
import * as THREE from './three.module.js';
import { GorePhysics } from './gore-physics.js';
```

### If you're using a modules folder:

**In gore-physics.js (inside modules/):**
```javascript
import * as THREE from '../lib/three.module.js';
```

**In applesauce-core-gore.js (inside modules/):**
```javascript
import * as THREE from '../lib/three.module.js';
import { GorePhysics } from './gore-physics.js';
```

**In test-gore.html (in root):**
```javascript
import { ApplesauceCore } from './modules/applesauce-core-gore.js';
```

---

## Quick Fix for Import Errors

If you see: `Cannot find module '../three.module.js'`

**Solution:**
1. Find where `three.module.js` actually is in your project
2. Update the import path in BOTH files:
   - `gore-physics.js` (line 1)
   - `applesauce-core-gore.js` (line 1)

**Common paths:**
```javascript
'./three.module.js'           // Same folder
'../three.module.js'          // One folder up
'../lib/three.module.js'      // In lib folder
'../../three.module.js'       // Two folders up
```

---

## Integration with Existing APPLESAUCE

If you already have `applesauce-core-minimal.js`:

### Option 1: Replace It
Use `applesauce-core-gore.js` instead - it has all the same features + gore

### Option 2: Add Gore as Module
Keep your existing core and import gore separately:

```javascript
import { ApplesauceCore } from './applesauce-core-minimal.js';
import { GorePhysics } from './gore-physics.js';

const game = new ApplesauceCore();
const gore = new GorePhysics({ enabled: true });

// Manual integration
function update(deltaTime) {
    gore.update(deltaTime);
    // Your game update
}

// Spawn ragdolls
const ragdoll = gore.createRagdoll(game.scene, position);
```

---

## Don't Overthink It!

**Simplest approach:**
1. Put all 3 files in same folder as `three.module.js`
2. Change imports to `'./three.module.js'`
3. Open `test-gore.html`
4. Done!

Once it works, you can organize files properly.
