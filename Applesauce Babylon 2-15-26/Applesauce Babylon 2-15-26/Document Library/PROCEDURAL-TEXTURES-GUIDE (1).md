# BABYLON.JS PROCEDURAL TEXTURES - COMPREHENSIVE GUIDE

## What Are Procedural Textures?

Procedural textures are **mathematically generated textures** created at runtime using algorithms instead of loading image files. They:
- Generate patterns using code (shaders)
- Take up minimal file size (just the algorithm)
- Can be parameterized and customized
- Scale infinitely without quality loss
- Create consistent, tileable patterns

## Available Procedural Textures in Babylon.js 8

### 1. **WoodProceduralTexture**
Creates realistic wood grain patterns.

```javascript
const woodTexture = new BABYLON.WoodProceduralTexture("wood", 512, scene);

// Customize wood appearance
woodTexture.woodColor = new BABYLON.Color3(0.4, 0.25, 0.15); // Base wood color
woodTexture.ampScale = 80.0; // Grain intensity (1-100)

// Apply to material
const material = new BABYLON.StandardMaterial("woodMat", scene);
material.diffuseTexture = woodTexture;
```

**Parameters:**
- `woodColor`: Base color of the wood (Color3)
- `ampScale`: Controls grain detail (higher = more pronounced grain)

**Use Cases:** Floors, furniture, bookshelves, decks, crates

---

### 2. **MarbleProceduralTexture**
Creates marble-like stone patterns with veins.

```javascript
const marbleTexture = new BABYLON.MarbleProceduralTexture("marble", 512, scene);

// Customize marble
marbleTexture.numberOfTilesHeight = 3;
marbleTexture.numberOfTilesWidth = 3;
marbleTexture.amplitude = 9.0;
marbleTexture.marbleColor = new BABYLON.Color3(0.9, 0.9, 0.9); // White marble
marbleTexture.jointColor = new BABYLON.Color3(0.7, 0.7, 0.7);  // Vein color

const material = new BABYLON.StandardMaterial("marbleMat", scene);
material.diffuseTexture = marbleTexture;
```

**Parameters:**
- `numberOfTilesHeight`: Vertical tile count
- `numberOfTilesWidth`: Horizontal tile count  
- `amplitude`: Vein intensity
- `marbleColor`: Main marble color
- `jointColor`: Vein/crack color

**Use Cases:** Pillars, statues, floors, walls, monuments

---

### 3. **BrickProceduralTexture**
Creates brick wall patterns with mortar joints.

```javascript
const brickTexture = new BABYLON.BrickProceduralTexture("brick", 512, scene);

// Customize brick wall
brickTexture.numberOfBricksHeight = 6;
brickTexture.numberOfBricksWidth = 8;
brickTexture.brickColor = new BABYLON.Color3(0.6, 0.3, 0.2); // Red brick
brickTexture.jointColor = new BABYLON.Color3(0.4, 0.4, 0.4); // Gray mortar

const material = new BABYLON.StandardMaterial("brickMat", scene);
material.diffuseTexture = brickTexture;
```

**Parameters:**
- `numberOfBricksHeight`: Vertical brick count
- `numberOfBricksWidth`: Horizontal brick count
- `brickColor`: Color of bricks
- `jointColor`: Color of mortar between bricks

**Use Cases:** Walls, buildings, chimneys, paths

---

### 4. **GrassProceduralTexture**
Creates grass/ground patterns.

```javascript
const grassTexture = new BABYLON.GrassProceduralTexture("grass", 512, scene);

// Customize grass
grassTexture.grassColors = [
    new BABYLON.Color3(0.29, 0.62, 0.26),
    new BABYLON.Color3(0.25, 0.56, 0.22),
    new BABYLON.Color3(0.20, 0.48, 0.18)
];
grassTexture.groundColor = new BABYLON.Color3(0.15, 0.30, 0.12);

const material = new BABYLON.StandardMaterial("grassMat", scene);
material.diffuseTexture = grassTexture;
```

**Parameters:**
- `grassColors`: Array of Color3 for grass variation
- `groundColor`: Base ground/dirt color

**Use Cases:** Ground, fields, parks, outdoor areas

---

### 5. **CloudProceduralTexture**
Creates cloud/noise patterns.

```javascript
const cloudTexture = new BABYLON.CloudProceduralTexture("cloud", 512, scene);

// Customize clouds
cloudTexture.skyColor = new BABYLON.Color3(0.6, 0.8, 1.0);     // Sky blue
cloudTexture.cloudColor = new BABYLON.Color3(1.0, 1.0, 1.0);   // White clouds

const material = new BABYLON.StandardMaterial("cloudMat", scene);
material.diffuseTexture = cloudTexture;
// Or use as emissive for sky
material.emissiveTexture = cloudTexture;
```

**Parameters:**
- `skyColor`: Background sky color
- `cloudColor`: Cloud color

**Use Cases:** Skyboxes, atmosphere, fog effects, abstract backgrounds

---

### 6. **FireProceduralTexture**
Creates animated fire/flame patterns.

```javascript
const fireTexture = new BABYLON.FireProceduralTexture("fire", 512, scene);

// Customize fire
fireTexture.fireColors = [
    new BABYLON.Color3(1.0, 0.8, 0.0),  // Yellow
    new BABYLON.Color3(1.0, 0.4, 0.0),  // Orange
    new BABYLON.Color3(0.8, 0.0, 0.0)   // Red
];

// Note: Fire texture animates automatically!

const material = new BABYLON.StandardMaterial("fireMat", scene);
material.diffuseTexture = fireTexture;
material.emissiveTexture = fireTexture; // Makes it glow
material.opacityTexture = fireTexture;  // For transparent flames
```

**Parameters:**
- `fireColors`: Array of Color3 for flame gradient
- `speed`: Animation speed (Vector2)

**Use Cases:** Torches, fires, lava, energy effects, magical auras

---

### 7. **RoadProceduralTexture**
Creates road/path patterns with lines.

```javascript
const roadTexture = new BABYLON.RoadProceduralTexture("road", 512, scene);

// Customize road
roadTexture.roadColor = new BABYLON.Color3(0.2, 0.2, 0.2);  // Asphalt
roadTexture.lineColor = new BABYLON.Color3(1.0, 1.0, 0.0);  // Yellow lines

const material = new BABYLON.StandardMaterial("roadMat", scene);
material.diffuseTexture = roadTexture;
```

**Use Cases:** Roads, tracks, racing games, paths

---

### 8. **NormalProceduralTexture**
Creates bump/normal maps procedurally.

```javascript
const normalTexture = new BABYLON.NormalProceduralTexture("normal", 512, scene);

const material = new BABYLON.StandardMaterial("bumpMat", scene);
material.bumpTexture = normalTexture;
```

**Use Cases:** Add surface detail without geometry, enhance lighting

---

## Creating Custom Procedural Textures

You can create your own procedural textures using **CustomProceduralTexture**:

```javascript
const customTexture = new BABYLON.CustomProceduralTexture(
    "custom",
    "./shaders/myCustomShader", // Path to shader files
    512,
    scene
);

// Set uniforms (parameters)
customTexture.setFloat("time", 0);
customTexture.setColor3("color1", new BABYLON.Color3(1, 0, 0));

// Update in render loop
scene.registerBeforeRender(() => {
    customTexture.setFloat("time", performance.now() / 1000);
});
```

You'll need to create shader files:
- `myCustomShader.fragment.fx` (fragment shader)
- `myCustomShader.vertex.fx` (vertex shader - optional)

---

## Advanced Techniques

### 1. **Combining Multiple Textures**

```javascript
const material = new BABYLON.StandardMaterial("combined", scene);

// Base color from wood
material.diffuseTexture = woodTexture;

// Surface detail from normal map
material.bumpTexture = normalTexture;

// Reflectivity from marble
material.specularTexture = marbleTexture;
```

### 2. **UV Mapping Control**

```javascript
// Scale texture
woodTexture.uScale = 2.0;  // Repeat 2x horizontally
woodTexture.vScale = 3.0;  // Repeat 3x vertically

// Offset texture
woodTexture.uOffset = 0.5;
woodTexture.vOffset = 0.25;

// Rotate texture
woodTexture.wAng = Math.PI / 4; // 45 degrees
```

### 3. **Texture Coordinates**

```javascript
// Use different UV channels
woodTexture.coordinatesIndex = 0; // Use UV0
// Or coordinatesIndex = 1 for UV1, etc.

// Coordinate mode
woodTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
// Options: EXPLICIT_MODE, SPHERICAL_MODE, PLANAR_MODE, etc.
```

### 4. **Performance Optimization**

```javascript
// Lower resolution for distant objects
const distantTexture = new BABYLON.WoodProceduralTexture("wood", 256, scene);

// Disable mipmaps if not needed (saves memory)
const texture = new BABYLON.WoodProceduralTexture("wood", 512, scene);
texture.generateMipMaps = false;

// Update frequency (for animated textures)
fireTexture.refreshRate = 2; // Update every 2 frames instead of every frame
```

---

## Best Practices

### 1. **Resolution Selection**
- **256x256**: Mobile, low-end devices, distant objects
- **512x512**: Standard desktop use (good balance)
- **1024x1024**: High-quality, close-up objects
- **2048x2048**: Ultra detail (use sparingly)

### 2. **Material Caching**
```javascript
// Create materials once, reuse them
class MaterialLibrary {
    constructor(scene) {
        this.scene = scene;
        this.cache = {};
    }
    
    getWood() {
        if (!this.cache.wood) {
            const texture = new BABYLON.WoodProceduralTexture("wood", 512, this.scene);
            const material = new BABYLON.StandardMaterial("wood", this.scene);
            material.diffuseTexture = texture;
            this.cache.wood = material;
        }
        return this.cache.wood;
    }
}

// Use it
const matLib = new MaterialLibrary(scene);
mesh1.material = matLib.getWood();
mesh2.material = matLib.getWood(); // Reuses same material!
```

### 3. **Color Consistency**
```javascript
// Define color palette at top of file
const COLORS = {
    DARK_WOOD: new BABYLON.Color3(0.2, 0.12, 0.08),
    LIGHT_WOOD: new BABYLON.Color3(0.4, 0.25, 0.15),
    WHITE_MARBLE: new BABYLON.Color3(0.9, 0.9, 0.9),
    RED_BRICK: new BABYLON.Color3(0.6, 0.3, 0.2)
};

// Use consistently
woodTexture.woodColor = COLORS.LIGHT_WOOD;
```

---

## Example: Building a Complete Scene

```javascript
class ProceduralScene {
    constructor(scene) {
        this.scene = scene;
        this.materials = {};
        this.initMaterials();
    }
    
    initMaterials() {
        // Wood floor
        const floorTexture = new BABYLON.WoodProceduralTexture("floor", 512, this.scene);
        floorTexture.woodColor = new BABYLON.Color3(0.3, 0.2, 0.15);
        floorTexture.ampScale = 100;
        
        this.materials.floor = new BABYLON.StandardMaterial("floor", this.scene);
        this.materials.floor.diffuseTexture = floorTexture;
        
        // Brick walls
        const brickTexture = new BABYLON.BrickProceduralTexture("brick", 512, this.scene);
        brickTexture.numberOfBricksHeight = 8;
        brickTexture.numberOfBricksWidth = 10;
        
        this.materials.wall = new BABYLON.StandardMaterial("wall", this.scene);
        this.materials.wall.diffuseTexture = brickTexture;
        
        // Marble columns
        const marbleTexture = new BABYLON.MarbleProceduralTexture("marble", 512, this.scene);
        
        this.materials.column = new BABYLON.StandardMaterial("column", this.scene);
        this.materials.column.diffuseTexture = marbleTexture;
    }
    
    build() {
        // Floor
        const floor = BABYLON.MeshBuilder.CreateGround("floor", {width: 100, height: 100}, this.scene);
        floor.material = this.materials.floor;
        
        // Walls
        const wall = BABYLON.MeshBuilder.CreateBox("wall", {width: 100, height: 10, depth: 2}, this.scene);
        wall.position.z = 50;
        wall.material = this.materials.wall;
        
        // Columns
        for (let i = -40; i <= 40; i += 20) {
            const column = BABYLON.MeshBuilder.CreateCylinder("column", {
                height: 10,
                diameter: 2
            }, this.scene);
            column.position.x = i;
            column.position.y = 5;
            column.material = this.materials.column;
        }
    }
}

// Use it
const proceduralScene = new ProceduralScene(scene);
proceduralScene.build();
```

---

## Common Issues & Solutions

### Issue: Texture looks blurry
**Solution:** Increase resolution or add better lighting
```javascript
const texture = new BABYLON.WoodProceduralTexture("wood", 1024, scene); // Higher res
material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3); // Add specular
```

### Issue: Texture looks too repetitive
**Solution:** Scale UV coordinates or combine patterns
```javascript
texture.uScale = 1.5;
texture.vScale = 2.3; // Non-uniform scaling breaks obvious repetition
```

### Issue: Performance is slow
**Solution:** Reduce resolution, use fewer unique textures
```javascript
const texture = new BABYLON.WoodProceduralTexture("wood", 256, scene); // Lower res
// Reuse materials instead of creating new ones
```

---

## Next Steps for Your Library Level

1. **Add variation to bookshelves**
   - Mix wood colors (light/dark)
   - Vary book colors more
   - Add weathering/aging effects

2. **Enhance atmosphere**
   - Use fire textures for torches
   - Cloud textures for dust motes
   - Custom shader for "old library" ambiance

3. **Boss battle effects**
   - Fire textures for attacks
   - Custom procedural for energy shields
   - Animated textures for portals/rifts

4. **Performance optimization**
   - Lower resolution for distant shelves
   - Reuse materials aggressively
   - Consider LOD (Level of Detail) system

---

## Resources

- [Babylon.js Procedural Textures Docs](https://doc.babylonjs.com/extensions/Procedural_textures)
- [Shader Examples](https://www.babylonjs-playground.com/)
- [Material Playground](https://www.babylonjs.com/demos/)

---

**Remember:** Procedural textures are powerful because they're:
- ✅ Small file size (just code)
- ✅ Infinitely scalable
- ✅ Customizable at runtime
- ✅ Perfect for generated worlds

Good luck building your library! 📚✨
