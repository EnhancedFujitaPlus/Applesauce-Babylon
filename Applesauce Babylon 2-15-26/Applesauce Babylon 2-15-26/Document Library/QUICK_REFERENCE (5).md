# APPLESAUCE Skybox & Texture Quick Reference

## 🚀 Copy-Paste Examples

### Procedural Skybox (Zero Setup!)
```javascript
// In your level config:
skybox: {
    type: 'procedural',
    preset: 'sunset'  // or 'day', 'night', 'cyberpunk', 'horror', 'desert', 'toxic'
}
```

### Custom Colors Skybox
```javascript
skybox: {
    type: 'procedural',
    preset: {
        topColor: 0x000033,    // Dark blue
        bottomColor: 0xFF00FF  // Pink
    }
}
```

### Add Stars
```javascript
skybox: { type: 'procedural', preset: 'night' },
stars: { enabled: true, count: 1000 }
```

### Solid Color Background
```javascript
skybox: {
    type: 'solid',
    color: 0x87CEEB  // Sky blue
}
```

---

## 🎨 Textured Materials

### With Downloaded Textures
```javascript
customMaterials: {
    myFloor: {
        textures: {
            color: './textures/concrete/color.jpg',
            normal: './textures/concrete/normal.jpg',
            roughness: './textures/concrete/roughness.jpg',
            colorOptions: { repeat: { x: 10, y: 10 } }  // Tile it
        },
        properties: {
            roughness: 0.9,
            metalness: 0.1
        }
    }
}
```

### Procedural Textures (No Downloads!)
```javascript
// In your game initialization:
import { ProceduralTextures } from './applesauce-materials-v2.js';

const gridTex = ProceduralTextures.createGridTexture(32, '#ffffff', '#000000');
const noiseTex = ProceduralTextures.createNoiseTexture(512, 512);
const graffitiTex = ProceduralTextures.createGraffitiTexture(512, 512);

// Apply to material:
material.map = gridTex;
```

---

## 📋 Integration Checklist

- [ ] Add `applesauce-skybox.js` to your project
- [ ] Replace old materials with `applesauce-materials-v2.js`
- [ ] Add skybox initialization to game core
- [ ] Update level configs with skybox settings
- [ ] Test with procedural skybox first
- [ ] (Optional) Download textures from Poly Haven
- [ ] (Optional) Add custom textured materials

---

## 🎯 Best Practices

### Start Simple
1. Use procedural skybox first (no downloads)
2. Use basic materials to test
3. Add procedural textures if needed
4. Only download real textures if you need photorealism

### Performance
- Keep textures under 2K resolution
- Use JPG for color maps (smaller)
- Tile textures instead of making huge ones
- Cache textures (built into ApplesauceMaterials)

### Organization
```
/textures/
  /concrete/
  /wood/
  /metal/
  /skybox/
```

---

## 🔗 Free Resources

**Best Texture Sites:**
- Poly Haven (https://polyhaven.com) - FREE PBR textures
- AmbientCG (https://ambientcg.com) - FREE, public domain
- FreePBR.com - Good quality, free to use

**For Skyboxes:**
- Poly Haven HDRIs (https://polyhaven.com/hdris)
- Or just use procedural! They look great.

---

## ⚡ Quick Test

1. Open `skybox_texture_demo.html` in browser
2. Click different skybox buttons
3. See how it works without any downloads!
4. Copy the code patterns to your game

---

Made with 🛹 for South of South Records
