# APPLESAUCE Level Creation Guide

## Quick Start

1. Copy `applesauce-level-template.html` to a new file (e.g., `level-2.html`)
2. Place `applesauce-engine.js` in the same folder
3. Edit the `LEVEL_DATA` object in your new HTML file
4. Open in a web browser

## Level Data Structure

### Spawn Point
```javascript
spawnPoint: {
    x: 0,    // X position
    z: 10    // Z position (forward/back)
}
```

### Terrain
Creates a sloped hill. Optional - remove this section for flat terrain.
```javascript
terrain: {
    type: "hill",
    hillLength: 250,  // Length along Z-axis
    hillWidth: 200,   // Width along X-axis
    hillHeight: 60    // Height at the start
}
```

### Ground Planes
Flat surfaces. Types: "grass", "concrete"
```javascript
ground: [
    {
        type: "grass",
        width: 150,
        depth: 100,
        position: { x: 0, y: 0.01, z: 320 }
    }
]
```

### Obstacles

#### Long Rail (Downhill Rails)
```javascript
{
    type: "longRail",
    xOffset: -8,        // X position
    zStart: 50,         // Starting Z
    zEnd: 250,          // Ending Z
    heightStart: 48,    // Starting height
    heightEnd: 2        // Ending height
}
```

#### Quarter Pipe
```javascript
{
    type: "quarterPipe",
    x: -30,             // X position
    z: 320,             // Z position
    rotation: 0,        // Rotation (0, Math.PI, etc.)
    width: 10           // Width of the ramp
}
```

#### Fun Box
```javascript
{
    type: "funbox",
    x: 0,
    z: 290
}
```

#### Ledge
```javascript
{
    type: "ledge",
    x: -20,
    z: 340,
    length: 12,         // Length of ledge
    height: 1.2         // Height above ground
}
```

#### Stairs
```javascript
{
    type: "stairs",
    x: 0,
    z: 360,
    rotation: 0         // Rotation in radians
}
```

#### Flat Rail
```javascript
{
    type: "flatRail",
    x: -15,
    z: 310,
    length: 15,
    rotation: Math.PI / 4  // Rotation
}
```

### Props

#### Building
```javascript
{
    type: "building",
    width: 40,
    height: 60,
    depth: 40,
    color: "0x2a2a2a",  // Hex color as string
    position: { x: -80, y: 30, z: 380 }
}
```

#### Sign
```javascript
{
    type: "sign",
    width: 15,
    height: 8,
    color: "0xFF0000",
    position: { x: -50, y: 6, z: 300 }
}
```

### Enemies
```javascript
enemies: {
    count: 15,          // Number of enemies
    spawnArea: {        // Rectangular spawn zone
        xMin: -40,
        xMax: 40,
        zMin: 280,
        zMax: 380
    }
}
```

### Objectives
```javascript
objectives: {
    roadkill: {
        target: 10      // Enemies to kill
    },
    kickflips: {
        target: 5       // Kickflips to land
    },
    boss: {
        spawns: true    // Boss spawns when objectives complete
    }
}
```

## Coordinate System

- **X-axis**: Left (-) to Right (+)
- **Y-axis**: Down (-) to Up (+)
- **Z-axis**: Back (-) to Forward (+)

## Common Rotations

- `0` - Facing forward (positive Z)
- `Math.PI / 2` - Facing right (positive X)
- `Math.PI` - Facing backward (negative Z)
- `Math.PI * 1.5` - Facing left (negative X)
- `Math.PI / 4` - 45° angle

## Color Codes

Common hex colors (as strings):
- `"0x000000"` - Black
- `"0xFFFFFF"` - White
- `"0xFF0000"` - Red
- `"0x00FF00"` - Green
- `"0x0000FF"` - Blue
- `"0xFF1493"` - Hot Pink
- `"0x808080"` - Gray
- `"0x2a2a2a"` - Dark Gray

## Tips

1. **Start Small**: Begin with a few obstacles and test
2. **Z Positioning**: Remember positive Z is "forward" from spawn
3. **Symmetry**: Use negative X for left, positive X for right
4. **Testing**: Reload the page to test changes
5. **Enemy Placement**: Place spawn areas away from obstacles
6. **Height Values**: Y=0 is ground level, increase for elevation
7. **Rail Grinding**: Rails need proper height for grinding
8. **Quarter Pipe Rotation**: Face pipes toward player path

## Level Design Ideas

### Street Course
- Lots of ledges and flat rails
- Buildings close together
- Stairs connecting different areas
- Minimal terrain, mostly flat concrete

### Hill Bomb
- Long downhill rails
- Multiple height levels
- Fast-paced descents
- Quarter pipes at bottom

### Park
- Symmetrical design
- Mix of quarter pipes and fun boxes
- Open space for tricks
- Grass borders with concrete center

### Industrial
- Large buildings as props
- Metal (gray) obstacles
- Tight spaces
- Multiple grinding lines

## Controls Reference

- **W/A/S/D** - Move
- **Space** - Jump/Ollie
- **Q** - Kickflip
- **E** - Heelflip
- **Z** - 360 Flip
- **B** - Impossible
- **Mouse** - Camera (click to lock)
- **ESC** - Release mouse

## Troubleshooting

**Player falls through floor**
- Check Y position values (should be > 0)
- Ensure ground planes exist

**Can't grind rails**
- Verify rail heights are reachable
- Check rail positions aren't underground

**Enemies not spawning**
- Check spawn area coordinates
- Ensure count > 0
- Verify area isn't blocked by obstacles

**Obstacles not visible**
- Check position values
- Verify they're not underground (Y < 0)
- Check if they're behind starting position

**Boss not spawning**
- Complete both objectives first
- Check browser console for errors

## Example: Simple Flat Park

```javascript
const LEVEL_DATA = {
    name: "Simple Park",
    spawnPoint: { x: 0, z: 10 },
    
    ground: [{
        type: "concrete",
        width: 100,
        depth: 100,
        position: { x: 0, y: 0.01, z: 50 }
    }],
    
    obstacles: [
        { type: "funbox", x: 0, z: 30 },
        { type: "quarterPipe", x: -20, z: 50, rotation: 0, width: 10 },
        { type: "quarterPipe", x: 20, z: 50, rotation: Math.PI, width: 10 },
        { type: "flatRail", x: 0, z: 60, length: 15, rotation: 0 }
    ],
    
    enemies: {
        count: 10,
        spawnArea: { xMin: -30, xMax: 30, zMin: 40, zMax: 70 }
    },
    
    objectives: {
        roadkill: { target: 5 },
        kickflips: { target: 3 }
    }
};
```

## Next Steps

- Experiment with different obstacle combinations
- Create themed levels (night city, desert, etc.)
- Add more props for atmosphere
- Design challenge areas (narrow rails, big gaps)
- Create progression through multiple levels

---

**Happy Level Building!** 🛹