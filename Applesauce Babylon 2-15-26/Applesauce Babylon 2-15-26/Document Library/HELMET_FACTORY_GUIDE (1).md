# 🪖 HELMET FACTORY - Babylon.js Level Guide

## Overview
This is a complete Babylon.js conversion of your warehouse level, now themed as a helmet factory! It properly integrates your `babylon-skater.js` module with full scene and camera functionality.

## Key Features ✨

### 1. **Scene Setup** (Lines 69-75)
```javascript
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);
scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
```
- Creates the Babylon scene
- Sets dark factory atmosphere with fog

### 2. **Havok Physics Integration** (Lines 77-81)
```javascript
const havokInstance = await HavokPhysics();
const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
scene.enablePhysics(new BABYLON.Vector3(0, -30, 0), havokPlugin);
```
- Initializes Havok physics engine
- Gravity set to -30 for skateboarding feel

### 3. **Camera System** (Lines 87-105)
```javascript
camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 10, -15), scene);
camera.setTarget(new BABYLON.Vector3(0, 2, 0));
camera.attachControl(canvas, true);
```
**Mouse Look:**
- Click canvas to lock pointer
- Move mouse to look around
- Smooth camera following in game loop (lines 434-451)

### 4. **Skater Module Integration** (Lines 279-292)
```javascript
skater = new BabylonSkater(scene, true); // debug = true

skaterInstance = skater.spawn({
    x: 0, y: 5, z: 0,
    deckColor: new BABYLON.Color3(1, 0.08, 0.58),
    bodyColor: new BABYLON.Color3(0.1, 0.1, 0.1),
    skinColor: new BABYLON.Color3(1, 0.86, 0.67)
});
```
**Important:** Your skater module is imported as ES6 module (line 63)

### 5. **Game Loop** (Lines 331-455)
The `scene.registerBeforeRender()` callback runs every frame:
- **Update skater physics** → `skater.update()`
- **Handle input** → WASD movement, tricks, jumps
- **Camera follow** → Smooth third-person camera
- **Helmet collection** → Check distance and collect
- **HUD updates** → Score, combo, speed, etc.

## How It All Works Together 🔧

### Physics Flow:
1. **Havok** handles physics simulation
2. **babylon-skater.js** applies forces/impulses to physics body
3. **update()** syncs visual model to physics collider
4. **Camera** follows the skater smoothly

### Camera Follow System (Lines 434-451):
```javascript
const targetPos = skaterPos.clone();
targetPos.y += 2; // Look slightly above skater

// Calculate camera orbit with mouse control
const camDistance = 15;
const camHeight = 7;
const offsetX = Math.sin(mouseX) * camDistance;
const offsetZ = Math.cos(mouseX) * camDistance;

// Smooth interpolation
camera.position = BABYLON.Vector3.Lerp(camera.position, idealCamPos, 0.1);
camera.setTarget(targetPos);
```

## File Structure 📁

**You need these files in the same directory:**
```
helmet_factory.html
babylon-skater.js
```

## Controls 🎮

- **WASD/Arrows** - Move
- **SPACE** - Jump/Ollie
- **Q** - Kickflip
- **E** - Heelflip
- **Mouse** - Look around (after clicking canvas)

## What's Different from Three.js? 🔄

### Scene Setup:
- ❌ `new THREE.Scene()` 
- ✅ `new BABYLON.Scene(engine)`

### Camera:
- ❌ `THREE.PerspectiveCamera`
- ✅ `BABYLON.UniversalCamera`

### Physics:
- ❌ Manual gravity/collision
- ✅ Havok physics with `PhysicsAggregate`

### Materials:
- ❌ `THREE.MeshLambertMaterial`
- ✅ `BABYLON.StandardMaterial`

### Render Loop:
- ❌ `requestAnimationFrame` + `renderer.render()`
- ✅ `engine.runRenderLoop()` + `scene.render()`

## Debug Mode 🐛

The skater is spawned with `debug = true`:
- Shows cyan raycast line for ground detection
- Displays position, velocity, grounded status

## Customization Ideas 💡

1. **Add more helmets:**
```javascript
helmets.push(createHelmet(new BABYLON.Vector3(x, 2, z)));
```

2. **Change factory colors:**
```javascript
groundMat.diffuseColor = new BABYLON.Color3(r, g, b);
```

3. **Adjust physics:**
```javascript
scene.enablePhysics(new BABYLON.Vector3(0, -50, 0), havokPlugin); // Stronger gravity
```

4. **More crates/ramps:**
```javascript
createCrate({ x: 5, y: 5, z: 5 }, new BABYLON.Vector3(x, y, z));
createRamp(width, height, depth, position, rotation);
```

## Troubleshooting 🔧

**Skater not moving?**
- Check console for physics initialization
- Make sure Havok loaded: `havokInstance` should not be null

**Camera weird?**
- Click canvas to lock pointer
- Check `mouseX` and `mouseY` are updating

**No shadows?**
- Shadows use `shadowGenerator.addShadowCaster(mesh)`
- Ground needs `receiveShadows = true`

## Next Steps 🚀

1. Add more interactive factory elements
2. Implement grinding system
3. Add enemies/workers
4. Create assembly line obstacles
5. Add helmet crafting station

---

**Built for APPLESAUCE by Cam @ South of South Records**

🛹 Keep shredding! 🪖
