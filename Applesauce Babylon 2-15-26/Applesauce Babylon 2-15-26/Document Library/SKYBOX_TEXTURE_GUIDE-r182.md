# APPLESAUCE Skybox & Texture Integration Guide

## 🚀 Quick Start

### 1. Add Skybox Module to Your Game Core

In your `applesauce-core-3.js`, add the skybox module:

```javascript
// At the top with other imports
import { ApplesauceSkybox } from './applesauce-skybox.js';

// In your constructor, after creating the scene:
constructor(options = {}) {
    // ... existing scene setup ...
    
    // Initialize skybox system
    this.skybox = new ApplesauceSkybox(this);
    
    // ... rest of initialization ...
}

// In your loadLevel method:
loadLevel(levelConfig) {
    // ... existing level loading ...
    
    // Load skybox if specified in level config
    if (levelConfig.skybox) {
        this.loadSkybox(levelConfig.skybox);
    }
    
    // Load custom materials if specified
    if (levelConfig.customMaterials) {
        this.loadCustomMaterials(levelConfig.customMaterials);
    }
}

// Add these helper methods:
loadSkybox(skyboxConfig) {
    switch(skyboxConfig.type) {
        case 'procedural':
            this.skybox.createProceduralSkybox(skyboxConfig.preset);
            break;
        case 'cubemap':
            this.skybox.loadCubemap(skyboxConfig.paths);
            break;
        case 'equirectangular':
            this.skybox.loadEquirectangular(skyboxConfig.path);
            break;
        case 'solid':
            this.skybox.setSolidColor(skyboxConfig.color);
            break;
    }
    
    // Add stars if requested
    if (skyboxConfig.stars?.enabled) {
        this.skybox.createStarfield(skyboxConfig.stars.count || 1000);
    }
}

loadCustomMaterials(materialsConfig) {
    for (const [name, config] of Object.entries(materialsConfig)) {
        this.materials.createTexturedMaterial(
            name,
            config.textures,
            config.properties
        );
    }
}

// In your update loop (if you want animated skybox):
update(deltaTime) {
    // ... existing update logic ...
    
    if (this.skybox) {
        this.skybox.update(deltaTime);
    }
}
```

### 2. Update Your HTML File

Replace the old materials import with the new one:

```html
<!-- OLD -->
<script src="applesauce-materials.js"></script>

<!-- NEW -->
<script type="module">
    import { ApplesauceMaterials } from './applesauce-materials-v2.js';
    import { ApplesauceSkybox } from './applesauce-skybox.js';
    
    // ... rest of your initialization ...
</script>
```

### 3. Use in Level Configs

```javascript
const MyLevel = {
    name: "My Cool Level",
    
    // Easy procedural skybox (no images needed!)
    skybox: {
        type: 'procedural',
        preset: 'sunset'
    },
    
    // Your platforms and stuff
    platforms: [...]
};
```

---

## 🎨 Where to Get Textures

### Free Texture Resources

#### 1. **Poly Haven** (Best for PBR textures)
- URL: https://polyhaven.com/textures
- FREE, no attribution required
- High quality PBR texture sets (Color, Normal, Roughness, etc.)
- Download as ZIP, includes all maps
- Great for: Concrete, brick, wood, metal, stone

#### 2. **AmbientCG** (Formerly CC0 Textures)
- URL: https://ambientcg.com
- FREE, public domain (CC0)
- Huge library of seamless PBR materials
- Easy downloads in various resolutions
- Great for: Everything - very comprehensive

#### 3. **Texture Haven** (Same as Poly Haven)
- Part of the Poly Haven family
- Specialized in outdoor/nature textures

#### 4. **FreePBR.com**
- URL: https://freepbr.com
- FREE for personal and commercial use
- Quality PBR materials
- Good variety of surfaces

#### 5. **3D Textures**
- URL: https://3dtextures.me
- FREE with attribution
- Good selection of basic materials
- Easy to download

### Skybox Resources

#### 1. **Poly Haven HDRIs** (Best for realistic skies)
- URL: https://polyhaven.com/hdris
- FREE, CC0 license
- Can be converted to equirectangular
- Download 2K or 4K versions

#### 2. **HDRIHaven** (Same as above)
- Dedicated to HDRI environments

#### 3. **sIBL Archive**
- URL: http://www.hdrlabs.com/sibl/archive.html
- FREE HDRIs for environments

#### 4. **Humus Skyboxes**
- URL: http://www.humus.name/index.php?page=Textures
- Classic cubemap skyboxes
- Free to use

---

## 🛠️ Creating Your Own Textures

### Method 1: Generate with AI (Easiest!)

**Using Free AI Tools:**
1. **Leonardo.AI** - Free tier available
2. **Stable Diffusion** - Run locally for free
3. **DALL-E** - Limited free credits

**Prompts for skateboard textures:**
```
"seamless concrete texture, top down view, 4K resolution"
"seamless worn asphalt road texture, realistic, tileable"
"seamless graffiti covered wall, urban, colorful"
"seamless wooden skateboard ramp texture, weathered"
```

### Method 2: Procedural Textures (No Downloads!)

Use the built-in `ProceduralTextures` class:

```javascript
import { ProceduralTextures } from './applesauce-materials-v2.js';

// In your materials initialization:
const noiseTexture = ProceduralTextures.createNoiseTexture(512, 512);
const gridTexture = ProceduralTextures.createGridTexture(256, 256, 16, '#ffffff', '#000000');
const graffitiTexture = ProceduralTextures.createGraffitiTexture(512, 512);

// Apply to material:
material.map = noiseTexture;
```

### Method 3: Convert Images to Textures

**Free Tools:**
- **NormalMap-Online** - https://cpetry.github.io/NormalMap-Online/
  - Upload any image, generates normal map
- **Material Maker** - Free Blender-like node editor
  - Create procedural PBR materials
- **Materialize** - Desktop app for creating PBR from photos

---

## 📁 File Structure

Organize your textures like this:

```
game/
├── index.html
├── engine/
│   ├── applesauce-core-3.js
│   ├── applesauce-materials-v2.js
│   └── applesauce-skybox.js
├── textures/
│   ├── concrete/
│   │   ├── color.jpg
│   │   ├── normal.jpg
│   │   ├── roughness.jpg
│   │   └── ao.jpg
│   ├── wood/
│   │   ├── color.jpg
│   │   └── normal.jpg
│   ├── metal/
│   │   └── color.jpg
│   └── skybox/
│       ├── sunset_px.jpg
│       ├── sunset_nx.jpg
│       ├── sunset_py.jpg
│       ├── sunset_ny.jpg
│       ├── sunset_pz.jpg
│       └── sunset_nz.jpg
└── levels/
    └── level_16.js
```

---

## 🎯 Optimization Tips

### Texture Sizes
- **Small details (coins, props):** 256x256 or 512x512
- **Floors/walls:** 1024x1024 (1K)
- **Large surfaces:** 2048x2048 (2K) max
- **Skybox:** 2048x2048 per face (or 4K equirectangular)

### Format Recommendations
- **JPG** - For color maps (smaller file size)
- **PNG** - For maps with transparency
- **WebP** - Best compression, but check browser support

### Loading Performance
```javascript
// Preload all textures at level start
async preloadTextures(textureList) {
    const promises = textureList.map(path => 
        this.materials.loadTexture(path)
    );
    await Promise.all(promises);
    console.log('✅ All textures loaded!');
}
```

---

## 🎨 Style Recommendations for APPLESAUCE

### Cyberpunk Aesthetic
```javascript
skybox: {
    type: 'procedural',
    preset: 'cyberpunk'
},
customMaterials: {
    floor: {
        textures: { color: './textures/metal_grid/color.jpg' },
        properties: {
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0xFF00FF,
            emissiveIntensity: 0.3
        }
    }
}
```

### Horror/Gore Theme
```javascript
skybox: {
    type: 'procedural',
    preset: 'horror'
},
stars: { enabled: true, count: 500 }
```

### Wild West (Level 16 style)
```javascript
skybox: {
    type: 'procedural',
    preset: 'desert'
},
customMaterials: {
    sand: {
        textures: {
            color: './textures/sand/color.jpg',
            normal: './textures/sand/normal.jpg'
        }
    }
}
```

---

## 🔧 Troubleshooting

### Textures not loading?
1. Check console for errors
2. Verify file paths (use relative paths: `./textures/...`)
3. Make sure files are actually in the directory
4. Check CORS - serve via HTTP, not `file://`

### Skybox looks weird?
1. Make sure cubemap images are in correct order (px, nx, py, ny, pz, nz)
2. For equirectangular, image must be 2:1 aspect ratio
3. Try procedural skybox as fallback

### Performance issues?
1. Reduce texture resolution
2. Use JPG instead of PNG
3. Limit number of unique materials
4. Enable texture caching (built-in to ApplesauceMaterials)

---

## 🎮 Quick Examples

### Fastest Setup (No Downloads)
```javascript
const QuickLevel = {
    name: "Quick Test",
    skybox: { type: 'procedural', preset: 'day' },
    platforms: [
        { position: [0,0,0], size: [50,1,50], material: 'concrete' }
    ]
};
```

### Medium Effort (Procedural + Some Textures)
```javascript
const MediumLevel = {
    name: "Textured Park",
    skybox: { type: 'procedural', preset: 'sunset' },
    customMaterials: {
        ground: {
            textures: { 
                color: './textures/asphalt/color.jpg',
                colorOptions: { repeat: { x: 10, y: 10 } }
            }
        }
    },
    platforms: [
        { position: [0,0,0], size: [50,1,50], material: 'ground' }
    ]
};
```

### Full Quality (All PBR Maps + Custom Sky)
```javascript
const HighQualityLevel = {
    name: "Studio Quality",
    skybox: {
        type: 'equirectangular',
        path: './textures/skybox/sunset_4k.hdr'
    },
    customMaterials: {
        floor: {
            textures: {
                color: './textures/concrete/color.jpg',
                normal: './textures/concrete/normal.jpg',
                roughness: './textures/concrete/roughness.jpg',
                ao: './textures/concrete/ao.jpg',
                colorOptions: { repeat: { x: 10, y: 10 } }
            },
            properties: { roughness: 0.9, metalness: 0.1 }
        }
    },
    platforms: [
        { position: [0,0,0], size: [50,1,50], material: 'floor' }
    ]
};
```

---

## 📚 Additional Resources

- **Three.js Texture Docs:** https://threejs.org/docs/#api/en/textures/Texture
- **PBR Material Guide:** https://marmoset.co/posts/basic-theory-of-physically-based-rendering/
- **Blender to Web:** Export textures from Blender using "Bake" function

---

Made with 🛹 for South of South Records
