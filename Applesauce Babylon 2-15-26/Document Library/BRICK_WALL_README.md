# Brick Wall Integration - Terrain.js Update

## What's New? 🧱

Your `babylon-terrain.js` module now includes a **brick wall creation system** integrated from your HTML test! Each brick is a fully physics-enabled object that can be knocked down, broken apart, and interacted with realistically.

---

## Features Added

### 1. `createBrickWall(config)` Method

A new method that creates walls made of individual physics-enabled bricks:

```javascript
terrain.createBrickWall({
    position: { x: 0, y: 0, z: 10 },     // Wall position
    rows: 8,                              // Height in bricks
    columns: 6,                           // Width in bricks
    brickWidth: 1.2,                      // Individual brick dimensions
    brickHeight: 0.6,
    brickDepth: 0.6,
    brickColor: { r: 0.6, g: 0.2, b: 0.2 },  // Red-brown brick color
    brickMass: 5,                         // Physics mass per brick
    friction: 0.8,                        // Surface friction
    restitution: 0.1,                     // Bounciness
    colorVariation: true                  // Adds slight color randomness
});
```

### 2. Integrated into `spawnObjects` System

You can now add brick walls through your terrain config:

```javascript
terrain.generate({
    type: 'flat',
    size: 100,
    objects: [
        {
            type: 'brickwall',
            position: { x: -3, y: 0, z: 8 },
            rows: 8,
            columns: 6,
            brickColor: { r: 0.6, g: 0.2, b: 0.2 }
        }
    ]
});
```

---

## Key Features

### Physics Integration
- **Each brick is a separate dynamic physics object**
- Uses Havok physics for realistic collisions
- Proper mass, friction, and restitution settings
- Bricks stack with alternating rows (realistic brick pattern)

### Material System
- Matches the brick material from your HTML test
- Red-brown default color (`{ r: 0.6, g: 0.2, b: 0.2 }`)
- Optional color variation for realistic appearance
- Proper shadow casting and receiving

### Smart Construction
- Alternating row offsets for stability
- Automatic positioning based on brick dimensions
- Returns wall metadata (total bricks, dimensions, position)
- All bricks tracked in `terrain.worldObjects` array

---

## Usage Examples

### Basic Wall
```javascript
terrain.generate({
    type: 'flat',
    objects: [
        {
            type: 'brickwall',
            position: { x: 0, y: 0, z: 10 }
        }
    ]
});
```

### Custom Wall
```javascript
terrain.generate({
    type: 'flat',
    objects: [
        {
            type: 'brickwall',
            position: { x: 5, y: 0, z: 15 },
            rows: 12,              // Taller wall
            columns: 10,           // Wider wall
            brickMass: 8,          // Heavier bricks
            brickColor: { r: 0.4, g: 0.25, b: 0.15 }, // Dark brown
            colorVariation: true   // Varied colors
        }
    ]
});
```

### Multiple Walls
```javascript
terrain.generate({
    type: 'flat',
    objects: [
        {
            type: 'brickwall',
            position: { x: -10, y: 0, z: 10 },
            rows: 6,
            columns: 4
        },
        {
            type: 'brickwall',
            position: { x: 10, y: 0, z: 10 },
            rows: 8,
            columns: 6,
            brickColor: { r: 0.5, g: 0.3, b: 0.2 }
        }
    ]
});
```

---

## What Changed in terrain.js?

### Added Methods
1. **`createBrickWall(config)`** - Main brick wall creation (lines ~512-625)
2. **Updated `spawnObject(config)`** - Added 'brickwall' case (line ~372)
3. **Updated `getPhysicsShapeForType(type)`** - Added brickwall mapping (line ~631)

### Material Handling
- Brick material matches your HTML test exactly
- Color: `new BABYLON.Color3(0.6, 0.2, 0.2)` (red-brown)
- Optional color variation adds realism
- Shadows properly configured

### Physics Properties (from HTML)
- Mass: 5 per brick (configurable)
- Restitution: 0.1 (minimal bounce)
- Friction: 0.8 (high grip)
- Shape: BOX (per brick)

---

## Demo Files

### `terrain-brickwall-demo.html`
Complete working demo showing:
- Terrain system initialization
- Multiple brick walls
- First-person player with physics
- W/A/S/D movement + SPACE to jump
- Brick collision counter

Run it with:
```bash
# Serve locally
python -m http.server 8000
# Visit: http://localhost:8000/terrain-brickwall-demo.html
```

---

## Integration Notes

### Compared to Original HTML Test
- ✅ Same brick dimensions (1.2 × 0.6 × 0.6)
- ✅ Same alternating row pattern
- ✅ Same material colors (red-brown)
- ✅ Same physics properties (mass: 5, friction: 0.8)
- ✅ Integrated into modular terrain system
- ✅ Configurable through terrain generation

### Advantages
- **Modular**: Part of terrain system, not standalone
- **Configurable**: All properties customizable
- **Reusable**: Create multiple walls with different configs
- **Tracked**: All bricks in `terrain.worldObjects` array
- **Clean**: Uses existing terrain material system

---

## Technical Details

### Wall Construction
```javascript
// Alternating rows for stability
const xOffset = (y % 2 === 0) ? 0 : brickWidth / 2;

// Position calculation
brick.position = new BABYLON.Vector3(
    position.x + (x * brickWidth) + xOffset,
    position.y + (y * brickHeight) + (brickHeight / 2),
    position.z
);
```

### Color Variation
```javascript
if (config.colorVariation !== false) {
    mat.diffuseColor.r += (Math.random() - 0.5) * 0.1;
    mat.diffuseColor.g += (Math.random() - 0.5) * 0.05;
    mat.diffuseColor.b += (Math.random() - 0.5) * 0.05;
}
```

### Return Value
```javascript
return {
    bricks: [...],           // Array of brick objects
    position: { x, y, z },   // Wall origin
    dimensions: {            // Total wall size
        width: columns * brickWidth,
        height: rows * brickHeight,
        depth: brickDepth
    }
};
```

---

## Performance Notes

- Each brick is a separate physics object
- Default 8×6 wall = 48 physics bodies
- Keep total bricks <500 for smooth performance
- Use larger brick sizes for bigger walls

---

## Future Enhancements

Potential additions:
- Pre-broken wall states
- Mortar between bricks
- Textured brick materials
- Damage/cracking system
- Wall collapse triggers

---

## South of South Records 🎵

Built for APPLESAUCE and the Treaty of the Watchtower universe.
Artist-first technology, always.
