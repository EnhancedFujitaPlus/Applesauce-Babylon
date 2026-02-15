# WebGL Texture Limit Fix - Level 58

## What Was Wrong

You hit WebGL's **maximum texture unit limit**. The error was:
```
THREE.WebGLProgram: Shader Error 0
FRAGMENT shader texture image units count exceeds MAX_TEXTURE_IMAGE_UNITS(16)
```

### The Problem
Every `MeshStandardMaterial` you create can use multiple texture slots (for color, roughness, metalness, normal maps, etc.). We were creating:
- A new material for EVERY shelf (~100+ shelves)
- A new material for EVERY product box (~100+ boxes)
- Materials for floor, walls, lights

This quickly exceeded the 16 texture unit limit!

## What I Fixed

### 1. **Shared Materials**
Instead of creating a new material for each object, I created a **material pool**:

```javascript
const SHARED_MATERIALS = {
    shelf: new THREE.MeshLambertMaterial({ color: 0x222222 }),
    shelfDamaged: new THREE.MeshLambertMaterial({ color: 0x181818 }),
    floor: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
    wall: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
    light: new THREE.MeshBasicMaterial({ color: 0xffffee }),
    products: [
        // 6 reusable product colors
        new THREE.MeshLambertMaterial({ color: 0xff4444 }),
        new THREE.MeshLambertMaterial({ color: 0x44ff44 }),
        // ... etc
    ]
};
```

Now 100 shelves share **1 material**, not 100 different ones!

### 2. **Simpler Materials**
Changed from `MeshStandardMaterial` to `MeshLambertMaterial`:
- **MeshStandardMaterial**: Uses ~5+ texture slots (roughness, metalness, etc.)
- **MeshLambertMaterial**: Uses 1-2 texture slots
- **MeshBasicMaterial**: Uses 0-1 texture slots (no lighting)

### 3. **Disabled Shadows**
```javascript
shelf.castShadow = false;
shelf.receiveShadow = false;
```
Shadows require additional render targets which consume resources.

### 4. **Fewer Lights**
Reduced from a light every 20x30 units to every 30x40 units, and disabled shadows on all lights.

## Why This Works

**Before:**
- 100 shelves × 5 texture slots each = 500 texture slots needed ❌
- Way over the 16 limit!

**After:**
- 1 shelf material × 5 texture slots = 5 slots
- 1 damaged shelf material × 5 slots = 5 slots  
- 6 product materials × 5 slots = 30 slots total
- All 100+ objects share these materials ✅

## General Rules to Avoid This

### DO ✅
- **Reuse materials** whenever possible
- Use `MeshLambertMaterial` or `MeshPhongMaterial` for most objects
- Use `MeshBasicMaterial` for simple unlit objects
- Create a material library/pool at the start
- Use `InstancedMesh` for repeated geometry with same material

### DON'T ❌
- Create new materials in loops
- Use `MeshStandardMaterial` for everything
- Create unique materials for every object
- Enable shadows on everything

## Code Pattern for Material Sharing

```javascript
// ❌ BAD - Creates new material each time
function createShelf() {
    const material = new THREE.MeshStandardMaterial({ color: 0x222222 });
    return new THREE.Mesh(geometry, material);
}

// ✅ GOOD - Reuses shared material
const SHELF_MATERIAL = new THREE.MeshLambertMaterial({ color: 0x222222 });

function createShelf() {
    return new THREE.Mesh(geometry, SHELF_MATERIAL);
}
```

## If You Still Get Texture Errors

### 1. Check Your Materials
```javascript
// Count materials in your scene
const materials = new Set();
scene.traverse((obj) => {
    if (obj.material) {
        materials.add(obj.material);
    }
});
console.log('Unique materials:', materials.size);
```

### 2. Use InstancedMesh for Repeated Objects
If you have 100 identical shelves:
```javascript
const geometry = new THREE.BoxGeometry(6, 12, 2);
const material = new THREE.MeshLambertMaterial({ color: 0x222222 });
const instancedMesh = new THREE.InstancedMesh(geometry, material, 100);

// Position each instance
const matrix = new THREE.Matrix4();
for (let i = 0; i < 100; i++) {
    matrix.setPosition(x, y, z);
    instancedMesh.setMatrixAt(i, matrix);
}
```

This is **1 draw call** instead of 100!

### 3. Check WebGL Limits
```javascript
const gl = renderer.getContext();
console.log('Max texture units:', gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
console.log('Max vertex textures:', gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
```

## Performance Tips

### Lighting
- Use 1-2 ambient/hemisphere lights for base illumination
- Add 3-5 point/spot lights for accents
- Disable shadows unless absolutely needed
- Consider baked lighting for static scenes

### Materials
- MeshBasicMaterial: Fastest (no lighting calculations)
- MeshLambertMaterial: Fast (simple lighting)
- MeshPhongMaterial: Medium (specular highlights)
- MeshStandardMaterial: Slowest (PBR, most realistic)

### Geometry
- Merge similar geometries together
- Use `BufferGeometry` instead of `Geometry`
- Use LOD (Level of Detail) for distant objects
- Cull objects outside camera view

## Your Level 58 Now Uses

- **7 total materials** (shelf, damaged shelf, floor, wall, light, 6 product colors)
- **MeshLambertMaterial** for most objects (simple, efficient)
- **MeshBasicMaterial** for lights (no lighting needed)
- **No shadows** (huge performance gain)
- **Fewer lights** (30x40 spacing instead of 20x30)

This should work on most GPUs and browsers! 🎮
