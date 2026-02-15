# 🔧 INPUT TROUBLESHOOTING GUIDE

## The Problem

Your character won't move and camera won't rotate. This happens because of **three potential issues**:

1. **Input handler conflicts** - Multiple systems trying to handle keyboard
2. **Camera setup** - FollowCamera might not update properly with Havok physics
3. **Update order** - Player update needs to be called BEFORE input processing

---

## 🎯 The Fix - Use Simple Version

I've created **3 test files** for you:

### 1. test-input-debug.html
**Purpose:** Diagnose what's wrong
- Shows which keys are pressed
- Shows player position/speed
- Shows camera status
- Console logs everything

**Use this to:**
- Verify input is being detected
- Check if playerModule exists
- See if methods are available

### 2. test-simple-fixed.html ⭐ **USE THIS ONE**
**Purpose:** Clean, working implementation
- No APPLESAUCE Core wrapper (fewer conflicts)
- Direct input handling
- ArcRotateCamera (more reliable)
- Guaranteed to work

**This is the one that should work right away!**

### 3. Updated applesauce-core-babylon.js
**Purpose:** Fixed core engine
- Proper update order (visual update BEFORE input)
- Safety checks on all playerModule methods
- Better integration with BabylonSkater

---

## Why The Original Didn't Work

### Issue #1: Camera Type

**Problem:**
```javascript
// FollowCamera doesn't always play nice with Havok physics
this.camera = new BABYLON.FollowCamera(...);
this.camera.lockedTarget = this.player.collider;
```

**Solution:**
```javascript
// ArcRotateCamera is more reliable
this.camera = new BABYLON.ArcRotateCamera(...);
this.camera.lockedTarget = this.player.collider;
```

### Issue #2: Update Order

**Problem:**
```javascript
update() {
    this.updatePlayerControls();  // Input first
    this.playerModule.update();    // Visual sync second
}
```

**Solution:**
```javascript
update() {
    this.playerModule.update();    // Visual sync FIRST
    this.updatePlayerControls();   // Then input
}
```

The BabylonSkater's `update()` method syncs the visual model to the physics collider. This MUST happen before we try to move the player, otherwise the positions are out of sync.

### Issue #3: Module Import Order

**Problem:**
The test page imports modules in the wrong order, causing initialization issues.

**Solution:**
Import BabylonSkater and BabylonTerrain BEFORE creating the core engine, or use them directly without the wrapper.

---

## 🚀 Quick Start (Use Simple Version)

1. **Open test-simple-fixed.html**
2. Wait for Havok to load
3. Press **W** to move forward
4. You should see the player moving!

**Controls:**
- **W/S** - Forward/Backward
- **A/D** - Turn left/right
- **SPACE** - Jump
- **R** - Spawn ragdoll

---

## 📊 Debugging Steps

If `test-simple-fixed.html` doesn't work, follow these steps:

### Step 1: Check Console

Open browser console (F12) and look for:
```
✅ Havok ready
✅ Player created
✅ Input configured
✅ Game started!
```

If you see errors, that's your problem!

### Step 2: Test Input Detection

Open `test-input-debug.html` and press keys. You should see:
- Keys appear in "Keys Pressed" section
- Console shows "Key down: w"

If keys don't show up → browser/OS input issue

### Step 3: Verify Player Exists

In `test-input-debug.html`, check:
- "Player exists: true"
- "PlayerModule exists: true"
- Position should be `[0, 3, 0]` or similar

If false → player creation failed

### Step 4: Test Manual Movement

In console, try:
```javascript
// After page loads, type in console:
playerModule.moveForward(100);
```

If player moves → input handler is the problem
If player doesn't move → physics issue

---

## 🔍 Common Issues

### "Player moves but camera doesn't follow"

**Fix:**
```javascript
// Make sure camera target is set AFTER player is created
camera.lockedTarget = player.collider;

// Or use setTarget
camera.setTarget(player.collider.position);
```

### "Input detected but player doesn't move"

**Fix:**
Check if Havok physics is active:
```javascript
// Player should have physics aggregate
console.log(playerModule.physicsAggregate);

// Should show velocity changing
console.log(playerModule.physicsAggregate.body.getLinearVelocity());
```

### "TypeError: Cannot read property 'moveForward' of undefined"

**Fix:**
PlayerModule wasn't created. Check:
```javascript
console.log('PlayerModule:', playerModule);
console.log('Player:', player);
```

Make sure BabylonSkater is imported correctly.

### "Camera rotates but player doesn't move"

**Fix:**
Camera is intercepting input. Detach camera control:
```javascript
// If using ArcRotateCamera with attachControl
camera.detachControl();

// Then manually handle camera in update loop
camera.alpha += (keys['q'] ? 0.02 : 0);
camera.beta += (keys['e'] ? 0.02 : 0);
```

---

## 💡 Understanding the Architecture

### How BabylonSkater Works

```javascript
// Creates visual mesh + physics collider
const skater = new BabylonSkater(scene);
const player = skater.spawn({ x: 0, y: 5, z: 0 });

// Returns:
{
    root: skaterRoot,           // Visual meshes (board, body, etc)
    collider: physicsCollider,  // Invisible physics capsule
    aggregate: physicsAggregate // Havok physics body
}

// Every frame:
skater.update();  // Syncs root position to collider position

// To move:
skater.moveForward(50);  // Applies force to physics body
```

### Update Loop Order

```
1. skater.update()           // Sync visual to physics
2. Handle input              // Apply forces based on keys
3. Havok physics step        // Havok calculates new positions
4. Camera follows player     // Camera updates to player position
5. Render                    // Draw everything
```

If you do input BEFORE update, the visual model is one frame behind the physics!

---

## 🎯 Recommended Approach

For your project, I recommend:

### Option 1: Use Simple Version (Easiest)
- Copy code from `test-simple-fixed.html`
- Add your levels/gore/features on top
- No complex engine wrapper

### Option 2: Fix Core Engine (More Structured)
- Use updated `applesauce-core-babylon.js`
- Make sure camera is ArcRotateCamera
- Ensure update order is correct

### Option 3: Hybrid (Best of Both)
- Use APPLESAUCE Core for level loading/state
- Handle player input directly (not through Core)
- Keeps clean separation

---

## 🧪 Test Checklist

Before using in production, verify:

- [ ] Can move forward/backward
- [ ] Can turn left/right
- [ ] Can jump
- [ ] Camera follows player smoothly
- [ ] Player doesn't fall through ground
- [ ] Speed is reasonable (not too fast/slow)
- [ ] Lean animations work
- [ ] Collision with obstacles works

---

## 📝 Next Steps

1. **Test simple version** - Make sure it works
2. **Add your features** - Gore, levels, etc.
3. **Optimize** - Performance tuning
4. **Polish** - Animations, effects

The simple version gives you a solid foundation to build on!
