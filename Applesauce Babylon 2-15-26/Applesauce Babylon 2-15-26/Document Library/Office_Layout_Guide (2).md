# OFFICE LAYOUT BUILDING GUIDE
## For APPLESAUCE Police Station Level

---

## QUICK START

Every floor is built inside the `loadFloor(floorNum)` function. Look for the floor number you want to edit:
- `if (floorNum === 0)` - Ground floor / Exterior
- `else if (floorNum === 1)` - Floor 1
- `else if (floorNum === 2)` - Floor 2  
- `else if (floorNum === 3)` - Floor 3

---

## BASIC WALL CREATION

### Simple Wall
```javascript
const wall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    MATERIALS.wall
);
wall.position.set(x, floorY + 2, z);  // floorY + 2 = middle of 4-unit tall wall
scene.add(wall);
obstacles.push({ mesh: wall, type: 'wall' });
```

**Wall Orientation:**
- **North/South walls**: BoxGeometry(length, 4, 0.3) - thin on Z-axis
- **East/West walls**: BoxGeometry(0.3, 4, length) - thin on X-axis

---

## BUILDING A SIMPLE ROOM

A 10x10 room with one door:

```javascript
// === OFFICE ROOM (10x10) ===

// Back wall (full width)
const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(10, 4, 0.3),
    MATERIALS.wall
);
backWall.position.set(0, floorY + 2, 15);
scene.add(backWall);

// Left wall (full length)
const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 4, 10),
    MATERIALS.wall
);
leftWall.position.set(-5, floorY + 2, 10);
scene.add(leftWall);

// Right wall (full length)
const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 4, 10),
    MATERIALS.wall
);
rightWall.position.set(5, floorY + 2, 10);
scene.add(rightWall);

// Front wall - SPLIT INTO TWO PARTS FOR DOOR
const frontWallLeft = new THREE.Mesh(
    new THREE.BoxGeometry(3, 4, 0.3),
    MATERIALS.wall
);
frontWallLeft.position.set(-3.5, floorY + 2, 5);
scene.add(frontWallLeft);

const frontWallRight = new THREE.Mesh(
    new THREE.BoxGeometry(3, 4, 0.3),
    MATERIALS.wall
);
frontWallRight.position.set(3.5, floorY + 2, 5);
scene.add(frontWallRight);

// The 3-unit gap in the middle = DOORWAY!

// Add furniture
createDesk(0, 12, 0, floorNum);
```

---

## CREATING A HALLWAY

Hallways are two parallel walls:

```javascript
// === CENTRAL HALLWAY (6 units wide, 40 units long) ===

const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 4, 40),
    MATERIALS.wall
);
leftWall.position.set(-3, floorY + 2, 0);
scene.add(leftWall);

const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 4, 40),
    MATERIALS.wall
);
rightWall.position.set(3, floorY + 2, 0);
scene.add(rightWall);
```

---

## COORDINATE SYSTEM

### Floor Boundaries
- X-axis: **-60 to +60** (120 units total) - INCREASED SCALE
- Z-axis: **-60 to +60** (120 units total) - INCREASED SCALE
- Y-axis: **floorNum × 5** (floor height)

### Important Positions
- **Elevator location**: (0, floorY, 28) - north side of building
- **Center of floor**: (0, floorY, 0)

### Direction Reference
- **North** = Positive Z (toward +60)
- **South** = Negative Z (toward -60)
- **East** = Positive X (toward +60)
- **West** = Negative X (toward -60)

**NOTE:** The scene has been scaled up significantly! Use larger values for positioning.

---

## COMMON ROOM PATTERNS

### 1. CORNER OFFICE (Top-Left)
```javascript
const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(8, 4, 0.3),
    MATERIALS.wall
);
backWall.position.set(-11, floorY + 2, 14);
scene.add(backWall);

const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 4, 8),
    MATERIALS.wall
);
leftWall.position.set(-15, floorY + 2, 10);
scene.add(leftWall);

// Door on the right side
const frontWall = new THREE.Mesh(
    new THREE.BoxGeometry(2, 4, 0.3),
    MATERIALS.wall
);
frontWall.position.set(-13, floorY + 2, 6);
scene.add(frontWall);

createDesk(-11, 10, Math.PI/4, floorNum);
```

### 2. CUBICLE FARM (Open Grid)
```javascript
for (let x = -12; x <= 12; x += 6) {
    for (let z = -12; z <= 12; z += 6) {
        createDesk(x, z, 0, floorNum);
    }
}
```

### 3. CONFERENCE ROOM (Large 15x12)
```javascript
// Build 4 walls like a normal room, but larger
// Then add desks in a table arrangement:

createDesk(-4, 0, Math.PI/2, floorNum);  // Left side
createDesk(0, 0, Math.PI/2, floorNum);   // Center
createDesk(4, 0, Math.PI/2, floorNum);   // Right side
```

### 4. ROW OF OFFICES ALONG HALLWAY
```javascript
// Left side offices (3 rooms)
for (let i = 0; i < 3; i++) {
    const zPos = -10 + (i * 12);  // Space them 12 units apart
    
    // Build back, left, and front walls (hallway = right wall)
    // ... wall creation code ...
    
    createDesk(-10, zPos, Math.PI/2, floorNum);
}
```

---

## FURNITURE PLACEMENT

### Desks
```javascript
createDesk(x, z, rotation, floor);
```

**Rotations:**
- `0` = Facing north
- `Math.PI / 2` = Facing east
- `Math.PI` = Facing south
- `-Math.PI / 2` or `3 * Math.PI / 2` = Facing west
- `Math.PI / 4` = Facing northeast (45°)

### Custom Furniture (Benches, File Cabinets)
```javascript
const bench = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.5, 1),
    MATERIALS.deskWood
);
bench.position.set(x, floorY + 0.25, z);
scene.add(bench);
```

---

## TIPS & TRICKS

1. **Plan on paper first** - Draw your layout before coding
2. **Build in sections** - Do one wing at a time
3. **Use consistent sizes** - Stick to 8x8 or 10x10 for offices
4. **Test incrementally** - Comment out sections to see specific areas
5. **Door width** - 2-3 units is good for doorways
6. **Hallway width** - 4-6 units keeps it skateable

---

## TROUBLESHOOTING

**"I can't see my walls!"**
- Check Y position: `floorY + 2` (middle of 4-unit wall)
- Make sure `scene.add(wall)` is called

**"My doors are blocked!"**
- Ensure wall segments don't overlap
- Leave 2-3 unit gaps between front wall parts

**"Player falls through floor!"**
- Floor mesh at `floorY - 0.1`, player at `floorY + 0.5`

**"Can't grind desks!"**
- Desks need to be near player Y position
- Use `createDesk()` function, don't manually position too high/low

---

## EXAMPLE: COMPLETE DETECTIVE OFFICE FLOOR

```javascript
else if (floorNum === 2) {
    // === CENTRAL BULLPEN ===
    createDesk(-8, 0, 0, 2);
    createDesk(8, 0, Math.PI, 2);
    createDesk(0, -6, Math.PI/2, 2);
    createDesk(0, 6, -Math.PI/2, 2);
    
    // === NORTH HALLWAY ===
    const hallLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 4, 12),
        MATERIALS.wall
    );
    hallLeft.position.set(-3, floorY + 2, 12);
    scene.add(hallLeft);
    
    const hallRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 4, 12),
        MATERIALS.wall
    );
    hallRight.position.set(3, floorY + 2, 12);
    scene.add(hallRight);
    
    // === PRIVATE OFFICE 1 (Top-Left) ===
    // Back wall
    const office1Back = new THREE.Mesh(
        new THREE.BoxGeometry(10, 4, 0.3),
        MATERIALS.wall
    );
    office1Back.position.set(-10, floorY + 2, 17);
    scene.add(office1Back);
    
    // Left wall
    const office1Left = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 4, 10),
        MATERIALS.wall
    );
    office1Left.position.set(-15, floorY + 2, 12);
    scene.add(office1Left);
    
    // Front wall with door
    const office1Front1 = new THREE.Mesh(
        new THREE.BoxGeometry(3, 4, 0.3),
        MATERIALS.wall
    );
    office1Front1.position.set(-12, floorY + 2, 7);
    scene.add(office1Front1);
    
    const office1Front2 = new THREE.Mesh(
        new THREE.BoxGeometry(3, 4, 0.3),
        MATERIALS.wall
    );
    office1Front2.position.set(-8, floorY + 2, 7);
    scene.add(office1Front2);
    
    // Furniture
    createDesk(-10, 13, Math.PI/4, 2);
    
    // Repeat for more offices...
}
```

---

**Happy Building! 🏢**
