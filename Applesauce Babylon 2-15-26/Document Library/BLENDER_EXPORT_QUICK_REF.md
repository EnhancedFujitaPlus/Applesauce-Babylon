# Blender Export Quick Reference Card

## 🎯 For Your Current Wood Texture - 30 Second Method

**YOU ARE HERE:** You have a textured sphere in Blender with wood panels.

**QUICK EXPORT:**
```
1. Click on the Image Texture node in Shader Editor (bottom panel)
2. In the Sidebar (press N): find the image name/path
3. Either:
   A. Image menu → Save As → wood_panels.jpg
   B. Navigate to the source file on your computer and copy it
4. Move to your game folder: ./textures/blender/wood_panels.jpg
5. Done!
```

**USE IN GAME:**
```javascript
const level = {
    customMaterials: {
        wood: {
            textures: {
                color: './textures/blender/wood_panels.jpg',
                colorOptions: { repeat: { x: 8, y: 8 } }
            }
        }
    },
    platforms: [
        { position: [0,0,0], size: [50,1,50], material: 'wood' }
    ]
};
```

---

## 📦 GLTF Export Settings (Copy This!)

### When to Export as GLTF:
- ✅ Complex 3D models (ramps, halfpipes, rails)
- ✅ Entire levels
- ✅ Props with multiple parts
- ✅ Anything you'd struggle to code manually

### Export Process:
```
File → Export → glTF 2.0 (.glb/.gltf)
```

### CRITICAL SETTINGS (Check These!):
```
Format: glTF Binary (.glb)    ← Single file, easiest

✅ Include:
   ☑ Selected Objects (or keep deselected for all)
   ☑ Custom Properties
   
✅ Transform:
   ☑ +Y Up                    ← SUPER IMPORTANT!
   
✅ Geometry:
   ☑ Apply Modifiers
   ☑ UVs
   ☑ Normals
   ☑ Vertex Colors (if using)
   
✅ Materials:
   ☑ Materials
   ☑ Images
   
✅ Compression (Optional):
   ☑ Draco (makes files smaller)
```

---

## 🎨 Material Export Tips

### If Your Material Has:

**Just a Color Texture:**
```
Export: Base Color image only
Use: color: './texture.jpg'
```

**Full PBR (Principled BSDF):**
```
Export images for:
- Base Color    → color.jpg
- Normal Map    → normal.jpg
- Roughness     → roughness.jpg
- Metallic      → metallic.jpg

Use all in material config
```

**Procedural Texture (No Image):**
```
1. Add Image Texture node (Shift+A)
2. Create new image (2048x2048)
3. Select the node
4. Render Properties → Bake → Bake Type: Diffuse
5. Click Bake
6. Save the image
```

---

## 🏗️ Naming Convention for Game Objects

When building levels in Blender, name objects clearly:

**Platforms:**
- `Platform_Main`
- `Platform_01`, `Platform_02`, etc.
- `Floor_Ground`

**Ramps:**
- `Ramp_Quarter_01`
- `Ramp_Halfpipe`
- `Ramp_Bank`

**Rails:**
- `Rail_Grind_01`
- `Rail_Round`

**Collision Meshes (IMPORTANT!):**
- `collision_Platform_Main`
- `collision_Ramp_01`
- Prefix with `collision_` to auto-hide in game

**Collectibles:**
- `Coin_01`, `Coin_02`, etc.
- `Collectible_Star`

**Enemies:**
- `Enemy_Basic_01`
- `NPC_Skater`

The game loader will automatically categorize based on names!

---

## ⚡ Quick Workflows

### Workflow 1: Texture Only (Fastest)
```
Blender: Export texture image
↓
Game: Use in material config
↓
Time: 30 seconds
```

### Workflow 2: Simple Model
```
Blender: Model object → Export GLB
↓
Game: Load with gltfLoader.loadModel()
↓
Time: 2 minutes
```

### Workflow 3: Full Level
```
Blender: Build entire level → Name objects → Export GLB
↓
Game: Load with gltfLoader.loadLevel()
↓
Time: 5-30 minutes
```

---

## 🔧 Common Issues & Fixes

### "Model appears black"
```
Fix: Add lighting in your game
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);
```

### "Model is upside down / rotated wrong"
```
Fix: In Blender export settings, ensure "+Y Up" is checked
     Or in game: rotation: [Math.PI, 0, 0]
```

### "Textures are missing"
```
Fix 1: Export as GLB (embeds textures)
Fix 2: Make sure texture files are in same folder as GLTF
Fix 3: In Blender, Image → Pack: pack all textures
```

### "Model is huge / tiny"
```
Fix: In game config: scale: 0.1 (or whatever works)
     Or in Blender: Apply scale before export
```

### "File is too big"
```
Fix 1: Export with Draco compression
Fix 2: Reduce texture resolution in Blender
Fix 3: Simplify geometry (decimate modifier)
```

---

## 📏 Recommended Sizes

### Texture Resolution:
- Small props: 512x512 or 1024x1024
- Large surfaces: 2048x2048
- Don't go above 4096x4096 (performance!)

### Model Complexity:
- Simple prop: <1,000 polygons
- Medium detail: 1,000-5,000 polygons
- High detail: 5,000-20,000 polygons
- Entire level: <100,000 polygons total

### File Sizes:
- Single model GLB: Aim for <5MB
- Full level GLB: Aim for <20MB
- Textures: JPG for color (smaller), PNG for transparency

---

## 🎮 Integration Checklist

### Before Export:
- [ ] Objects named clearly
- [ ] Materials using Principled BSDF
- [ ] All transforms applied (Ctrl+A)
- [ ] Scale is 1.0 (Apply Scale!)
- [ ] Collision meshes named with "collision_" prefix
- [ ] Textures are reasonably sized (not 8K!)

### Export Settings:
- [ ] Format: GLB
- [ ] +Y Up enabled
- [ ] Apply Modifiers enabled
- [ ] Materials enabled

### After Export:
- [ ] Test load in game
- [ ] Check file size
- [ ] Verify materials look correct
- [ ] Test performance (FPS)

---

## 💡 Pro Tips

1. **Start Simple:** Export one cube first, make sure it works
2. **Test Early:** Don't model for hours before testing export
3. **Keep Originals:** Save .blend files, don't overwrite
4. **Use Collections:** Organize in Blender with collections
5. **Bake Lighting:** For static objects, bake lighting in Blender
6. **UV Unwrap:** Make sure objects are UV unwrapped properly
7. **Origin Points:** Set origin to center or bottom (important for placement)

---

## 📱 Commands Quick Access

### Export Texture:
`Shader Editor → Image Node → Image → Save As`

### Export Model:
`File → Export → glTF 2.0 (.glb)`

### Apply All Transforms:
`Object Mode → Object → Apply → All Transforms` (Ctrl+A)

### Bake Procedural Texture:
`Add Image Texture → New → Select it → Render Props → Bake → Diffuse → Bake`

---

Made with 🛹 for South of South Records
Quick Reference v1.0
