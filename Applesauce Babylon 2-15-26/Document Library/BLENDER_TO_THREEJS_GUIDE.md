# Blender to Three.js Workflow Guide for APPLESAUCE

## 🎯 Three Main Approaches

### 1. Export Textures Only (Fastest for your current case)
### 2. Export Entire Scene as GLTF (Best for complex levels)
### 3. Export + Generate Code (Most integrated)

---

## Method 1: Export Just the Texture (Quick & Easy)

### A. Extract Texture from Blender Material

**Option 1: Save Image Directly**
```
1. In Blender, go to Shader Editor (bottom panel in your screenshot)
2. Click on the Image Texture node (the one with your wood texture)
3. In the sidebar (press N if hidden), you'll see the image name
4. Go to: Image → Save As → Choose location
5. Save as JPG or PNG
```

**Option 2: Bake the Texture (if it's procedural)**
```
1. Select your object (the sphere)
2. Go to Shading workspace
3. Add a new Image Texture node (Shift+A → Texture → Image Texture)
4. Click "New" and create a new image (2048x2048 recommended)
5. Select this new image node (important!)
6. Go to Render Properties → Bake
7. Set Bake Type to "Diffuse" (or "Combined" for everything)
8. Click "Bake"
9. Go to Image → Save As
```

**Then use it in your game:**
```javascript
const woodMaterial = {
    textures: {
        color: './textures/wood_panels.jpg',
        colorOptions: { repeat: { x: 4, y: 4 } }
    },
    properties: {
        roughness: 0.7,
        metalness: 0.0
    }
};
```

---

## Method 2: Export Entire Scene as GLTF (Recommended!)

This is THE standard way to get Blender content into Three.js.

### Step-by-Step GLTF Export

**1. Prepare Your Scene in Blender**
```
- Clean up your scene (delete cameras/lights you don't need)
- Apply all transforms: Object → Apply → All Transforms
- Name objects clearly ("Ramp_01", "Platform_Main", etc.)
- Make sure materials are using Principled BSDF shader
```

**2. Export Settings**
```
File → Export → glTF 2.0 (.glb/.gltf)

CRITICAL SETTINGS:
☑ Remember Export Settings
☑ Include → Selected Objects (or all if you want everything)
☑ Transform → +Y Up (this is important!)
☑ Geometry → Apply Modifiers
☑ Geometry → UVs
☑ Geometry → Normals
☑ Materials → Export
☑ Compression → Draco (optional, makes files smaller)

Format: Choose GLB (single file) or GLTF (separate files)
- GLB = One file with everything (easier)
- GLTF = Multiple files (textures separate, more flexible)
```

**3. Load in Three.js**

Here's a complete GLTF loader for APPLESAUCE:

```javascript
// applesauce-gltf-loader.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ApplesauceGLTFLoader {
    constructor(core) {
        this.core = core;
        this.loader = new GLTFLoader();
        this.loadedModels = {};
    }
    
    /**
     * Load a GLTF/GLB model
     * @param {string} path - Path to the .glb or .gltf file
     * @param {object} options - Loading options
     */
    async loadModel(path, options = {}) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => {
                    console.log(`✅ Model loaded: ${path}`);
                    
                    const model = gltf.scene;
                    
                    // Apply options
                    if (options.scale) {
                        model.scale.set(options.scale, options.scale, options.scale);
                    }
                    
                    if (options.position) {
                        model.position.set(...options.position);
                    }
                    
                    if (options.rotation) {
                        model.rotation.set(...options.rotation);
                    }
                    
                    // Add to scene
                    if (options.addToScene !== false) {
                        this.core.scene.add(model);
                    }
                    
                    // Cache it
                    this.loadedModels[path] = gltf;
                    
                    resolve(gltf);
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total) * 100;
                    console.log(`Loading ${path}: ${percent.toFixed(0)}%`);
                },
                (error) => {
                    console.error(`❌ Failed to load ${path}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Load an entire level from GLTF
     */
    async loadLevel(path, levelConfig = {}) {
        const gltf = await this.loadModel(path, { addToScene: false });
        const level = gltf.scene;
        
        // Process each child object
        level.traverse((child) => {
            if (child.isMesh) {
                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Check for collision meshes (name them "collision_" in Blender)
                if (child.name.startsWith('collision_')) {
                    child.visible = false; // Hide collision meshes
                    // Add to physics system here
                }
                
                // Check for platform tags
                if (child.name.includes('platform')) {
                    // This is a skateable surface
                    console.log(`🛹 Found platform: ${child.name}`);
                }
            }
        });
        
        this.core.scene.add(level);
        
        console.log('🎮 Level loaded from Blender!');
        return gltf;
    }
}
```

**4. Use in Your Game**

```javascript
// In applesauce-core-3.js, add GLTF loader
import { ApplesauceGLTFLoader } from './applesauce-gltf-loader.js';

constructor(options = {}) {
    // ... existing setup ...
    
    this.gltfLoader = new ApplesauceGLTFLoader(this);
}

// Load a level
async loadBlenderLevel(path) {
    await this.gltfLoader.loadLevel(path);
}

// Or load individual models
async loadModel(path, options) {
    return await this.gltfLoader.loadModel(path, options);
}
```

**5. In Your Level Config**

```javascript
const Level_FromBlender = {
    name: "My Blender Level",
    
    // Load entire level from Blender
    blenderScene: './levels/skatepark_01.glb',
    
    // Or load individual pieces
    models: [
        { path: './models/ramp.glb', position: [0, 0, 0] },
        { path: './models/rail.glb', position: [10, 0, 0] }
    ],
    
    skybox: {
        type: 'procedural',
        preset: 'day'
    }
};
```

---

## Method 3: Blender → Three.js Code Generator

This is more advanced but super powerful - you can generate actual JavaScript code from Blender.

### Using three.js Exporter

**Install the Three.js Exporter Addon:**
```
1. Download: https://github.com/mrdoob/three.js/tree/dev/utils/exporters/blender
2. In Blender: Edit → Preferences → Add-ons → Install
3. Select the three.js exporter .py file
4. Enable the addon
```

**Export as Three.js JSON:**
```
File → Export → Three.js (.json)

This creates a JSON file that can be loaded with THREE.ObjectLoader
```

But honestly, **GLTF is better** - it's the industry standard and has better support.

---

## 🎯 For Your Current Wood Texture - Best Workflow

**Quickest Method (30 seconds):**

1. In Blender Shader Editor, click your Image Texture node
2. Look at the file path shown in the node
3. Navigate to that file on your computer
4. Copy it to your game's `textures/` folder
5. Use it:

```javascript
const woodFloor = {
    textures: {
        color: './textures/wood_panels.jpg',
        colorOptions: { repeat: { x: 10, y: 10 } }
    },
    properties: {
        roughness: 0.7,
        metalness: 0.0
    }
};
```

**If you want normal/roughness maps too:**

1. In Blender, look at your shader nodes
2. You might have Normal Map, Roughness Map, etc.
3. Save each one individually (Image → Save As)
4. Export them all:

```javascript
const woodFloorPBR = {
    textures: {
        color: './textures/wood/color.jpg',
        normal: './textures/wood/normal.jpg',
        roughness: './textures/wood/roughness.jpg',
        colorOptions: { repeat: { x: 10, y: 10 } }
    },
    properties: {
        roughness: 0.7,
        metalness: 0.0
    }
};
```

---

## 📦 Complete Example: Wood Panel Platform

**1. Export your wood texture from Blender**

**2. Create a textured platform in your level config:**

```javascript
const Level_WoodSkatepark = {
    name: "Wooden Warehouse",
    
    skybox: {
        type: 'procedural',
        preset: 'day'
    },
    
    customMaterials: {
        woodenFloor: {
            textures: {
                color: './textures/wood_panels_from_blender.jpg',
                colorOptions: { repeat: { x: 8, y: 8 } }
            },
            properties: {
                roughness: 0.8,
                metalness: 0.0
            }
        }
    },
    
    platforms: [
        { 
            position: [0, 0, 0], 
            size: [50, 1, 50], 
            material: 'woodenFloor'  // Use your custom material!
        }
    ]
};
```

---

## 🏗️ Building Entire Levels in Blender (Advanced)

**Workflow:**

1. **Build your level in Blender**
   - Model ramps, platforms, rails
   - Apply materials
   - Name objects clearly ("Platform_01", "Ramp_Quarter", etc.)

2. **Set up collision meshes**
   - Duplicate complex shapes
   - Simplify the duplicates (they'll be invisible collision boxes)
   - Name them "collision_[objectname]"

3. **Export as GLB**
   - File → Export → glTF 2.0
   - Choose GLB format
   - Make sure materials are included

4. **Load in game:**

```javascript
// In your game initialization
await game.loadBlenderLevel('./levels/my_awesome_skatepark.glb');

// The loader automatically:
// - Adds all meshes to the scene
// - Sets up shadows
// - Identifies collision meshes
// - Preserves all your materials and textures
```

**Advantages:**
- Design in 3D (easier to visualize)
- Real lighting preview
- Complex geometry is easy
- Materials come with the model
- Single file export

**Disadvantages:**
- Larger file sizes
- Need to reload model to make changes
- Less dynamic (harder to modify at runtime)

---

## 🎯 My Recommendation for APPLESAUCE

**For now:** Export textures only, use them with your existing material system
**Next level:** Start exporting individual props as GLB (ramps, rails, obstacles)
**Eventually:** Build entire levels in Blender, export as GLB

**Hybrid Approach (Best of both worlds):**
```javascript
const HybridLevel = {
    name: "Mixed Approach",
    
    // Use Blender for complex 3D models
    models: [
        { path: './models/halfpipe.glb', position: [0, 0, -10] },
        { path: './models/rail_grind.glb', position: [5, 0, 5] }
    ],
    
    // Use code for simple platforms (easier to modify)
    platforms: [
        { position: [0, 0, 0], size: [50, 1, 50], material: 'woodenFloor' }
    ],
    
    // Use Blender texture exports
    customMaterials: {
        woodenFloor: {
            textures: {
                color: './textures/from_blender/wood.jpg'
            }
        }
    },
    
    // Use procedural skybox (fast and flexible)
    skybox: {
        type: 'procedural',
        preset: 'sunset'
    }
};
```

---

## 📝 Quick Command Reference

**Export Texture from Blender:**
1. Shader Editor → Click Image Texture node
2. Image menu → Save As → wood_panels.jpg

**Export Model from Blender:**
1. File → Export → glTF 2.0 (.glb)
2. Choose GLB, enable +Y Up, Apply Modifiers
3. Export

**Load in Three.js:**
```javascript
await game.gltfLoader.loadModel('./models/yourmodel.glb', {
    position: [0, 0, 0],
    scale: 1
});
```

---

Made with 🛹 for South of South Records
