/**
 * DESTRUCTIBLES QUICK REFERENCE
 * Easy copy-paste templates for artists!
 */

/*
=====================================================
🪵 CRATES - Wooden boxes that splinter
=====================================================
*/

// BASIC CRATE
{
    position: { x: 0, y: 1, z: 0 },    // Where to place it (y=1 sits on ground)
    size: 2,                            // How big (2 = 2x2x2 meters)
    health: 100,                        // How much damage before break
    breakForce: 50,                     // Minimum hit force to break
    color: 0x8B4513                     // Brown wood color
}

// LARGE CRATE (harder to break)
{
    position: { x: 10, y: 2, z: 0 },
    size: 3,
    health: 150,
    breakForce: 80,
    color: 0x654321
}

// SMALL WEAK CRATE (easy to break)
{
    position: { x: -10, y: 0.5, z: 0 },
    size: 1,
    health: 50,
    breakForce: 20,
    color: 0xA0522D
}

/*
COLOR OPTIONS FOR CRATES:
0x8B4513 - Standard brown
0xA0522D - Lighter wood
0x654321 - Dark wood
0xD2691E - Orange wood
*/


/*
=====================================================
🪟 GLASS - Windows that shatter into shards
=====================================================
*/

// STANDARD WINDOW
{
    position: { x: 0, y: 2, z: 0 },     // Center position
    width: 3,                            // Width (horizontal)
    height: 4,                           // Height (vertical)
    thickness: 0.1,                      // Thin!
    health: 30,                          // Glass is fragile
    breakForce: 20,                      // Easy to break
    color: 0x88CCFF                      // Light blue tint
}

// TALL GLASS PANEL
{
    position: { x: 0, y: 3, z: 0 },
    width: 2,
    height: 6,
    thickness: 0.1,
    health: 40,
    breakForce: 25,
    color: 0xAADDFF
}

// SMALL WINDOW
{
    position: { x: 0, y: 1.5, z: 0 },
    width: 2,
    height: 2,
    thickness: 0.1,
    health: 20,
    breakForce: 15,
    color: 0x66BBEE
}

// STOREFRONT GLASS (wide)
{
    position: { x: 0, y: 2, z: 0 },
    width: 6,
    height: 3,
    thickness: 0.1,
    health: 35,
    breakForce: 30,
    color: 0x99DDFF
}

/*
COLOR OPTIONS FOR GLASS:
0x88CCFF - Light blue (standard)
0xAADDFF - Sky blue
0x66BBEE - Deep blue
0x99EEFF - Cyan
0xFFFFFF - Clear/white (50% opacity)
*/


/*
=====================================================
🧱 WALLS - Brick/concrete that crumbles
=====================================================
*/

// STANDARD BRICK WALL
{
    position: { x: 0, y: 3, z: 0 },     // Center position
    width: 8,                            // Width (horizontal)
    height: 6,                           // Height (vertical)
    thickness: 0.5,                      // Wall thickness
    health: 200,                         // Pretty tough
    breakForce: 100,                     // Need speed to break
    brickPattern: true,                  // Show brick texture
    color: 0x8B4513                      // Brown brick
}

// TALL WALL
{
    position: { x: 0, y: 5, z: 0 },
    width: 10,
    height: 10,
    thickness: 0.5,
    health: 300,
    breakForce: 150,
    brickPattern: true,
    color: 0xA0522D
}

// WEAK BARRIER (like construction barrier)
{
    position: { x: 0, y: 2, z: 0 },
    width: 6,
    height: 4,
    thickness: 0.3,
    health: 80,
    breakForce: 50,
    brickPattern: false,                 // Solid color
    color: 0xFF6600                      // Orange
}

// CONCRETE WALL
{
    position: { x: 0, y: 3, z: 0 },
    width: 12,
    height: 6,
    thickness: 0.6,
    health: 250,
    breakForce: 120,
    brickPattern: false,
    color: 0x808080                      // Gray concrete
}

/*
COLOR OPTIONS FOR WALLS:
0x8B4513 - Brown brick
0xA0522D - Red brick
0x808080 - Gray concrete
0x696969 - Dark concrete
0xFF6600 - Orange (construction barrier)
0xFFFF00 - Yellow (caution barrier)
*/


/*
=====================================================
🛢️ BARRELS - Metal drums, some explosive!
=====================================================
*/

// STANDARD BARREL
{
    position: { x: 0, y: 0.75, z: 0 },  // y = half of height
    radius: 0.5,                         // Barrel width
    height: 1.5,                         // Barrel height
    health: 80,
    breakForce: 40,
    color: 0x8B0000,                     // Dark red
    explosive: false
}

// EXPLOSIVE BARREL (DANGEROUS!)
{
    position: { x: 0, y: 0.75, z: 0 },
    radius: 0.5,
    height: 1.5,
    health: 60,                          // Weaker
    breakForce: 30,
    color: 0xFF4500,                     // Bright red/orange
    explosive: true                      // BOOM! 💥
}

// METAL BARREL (tough)
{
    position: { x: 0, y: 0.75, z: 0 },
    radius: 0.5,
    height: 1.5,
    health: 120,
    breakForce: 60,
    color: 0x404040,                     // Dark gray
    explosive: false
}

// SMALL BARREL
{
    position: { x: 0, y: 0.5, z: 0 },
    radius: 0.3,
    height: 1.0,
    health: 50,
    breakForce: 25,
    color: 0x8B0000,
    explosive: false
}

/*
COLOR OPTIONS FOR BARRELS:
0x8B0000 - Dark red
0xFF4500 - Orange/red (explosive!)
0x404040 - Dark gray (metal)
0x808080 - Light gray
0x228B22 - Green (toxic?)
0x0000CD - Blue
*/


/*
=====================================================
📦 QUICK SETUP TEMPLATES
=====================================================
*/

// WINDOW WALL (row of windows)
const windowWall = [
    { position: { x: 0, y: 2, z: 0 }, width: 3, height: 4, health: 30, color: 0x88CCFF },
    { position: { x: 4, y: 2, z: 0 }, width: 3, height: 4, health: 30, color: 0x88CCFF },
    { position: { x: 8, y: 2, z: 0 }, width: 3, height: 4, health: 30, color: 0x88CCFF },
    { position: { x: 12, y: 2, z: 0 }, width: 3, height: 4, health: 30, color: 0x88CCFF }
];

// CRATE STACK (pyramid)
const cratePyramid = [
    // Bottom row
    { position: { x: 0, y: 1, z: 0 }, size: 2 },
    { position: { x: 3, y: 1, z: 0 }, size: 2 },
    { position: { x: 6, y: 1, z: 0 }, size: 2 },
    // Middle row
    { position: { x: 1.5, y: 3, z: 0 }, size: 2 },
    { position: { x: 4.5, y: 3, z: 0 }, size: 2 },
    // Top
    { position: { x: 3, y: 5, z: 0 }, size: 2 }
];

// BARREL LINE (potential chain explosion!)
const explosiveBarrelLine = [
    { position: { x: 0, y: 0.75, z: 0 }, color: 0xFF4500, explosive: true },
    { position: { x: 3, y: 0.75, z: 0 }, color: 0xFF4500, explosive: true },
    { position: { x: 6, y: 0.75, z: 0 }, color: 0xFF4500, explosive: true },
    { position: { x: 9, y: 0.75, z: 0 }, color: 0xFF4500, explosive: true }
];

// BRICK BARRIER
const brickWallBarrier = [
    { position: { x: -5, y: 3, z: 0 }, width: 8, height: 6, brickPattern: true },
    { position: { x: 5, y: 3, z: 0 }, width: 8, height: 6, brickPattern: true }
];

// OBSTACLE COURSE
const mixedObstacleCourse = [
    { type: 'crate', position: { x: 0, y: 1, z: 0 }, size: 2 },
    { type: 'glass', position: { x: 5, y: 2, z: 0 }, width: 3, height: 4 },
    { type: 'wall', position: { x: 10, y: 3, z: 0 }, width: 6, height: 6 },
    { type: 'barrel', position: { x: 15, y: 0.75, z: 0 }, explosive: false },
    { type: 'crate', position: { x: 20, y: 1, z: 0 }, size: 3 },
    { type: 'barrel', position: { x: 25, y: 0.75, z: 0 }, explosive: true }
];


/*
=====================================================
⚙️ DAMAGE & FORCE REFERENCE
=====================================================

HEALTH VALUES (how much damage to break):
- Glass: 20-40 (very fragile)
- Crates: 50-150 (medium)
- Barrels: 60-120 (medium-strong)
- Walls: 80-300 (very strong)

BREAK FORCE (minimum impact speed):
- Glass: 15-25 (breaks easily)
- Crates: 20-80 (need decent speed)
- Barrels: 25-60 (medium speed)
- Walls: 50-150 (need high speed or tricks)

PLAYER SPEED REFERENCE:
- Walking: ~5 force
- Skating: ~20-40 force
- Fast skating: ~60-80 force
- Landing big air: ~100+ force

TIP: Set breakForce lower than health if you want
     objects to crack/damage before breaking!
*/


/*
=====================================================
🎨 COMMON SCENARIOS
=====================================================
*/

// SCENARIO 1: Skateable street with breakables
const skateStreet = {
    destructibles: {
        // Storefronts on both sides
        glass: [
            { position: { x: -10, y: 2, z: 10 }, width: 4, height: 3 },
            { position: { x: -10, y: 2, z: 20 }, width: 4, height: 3 },
            { position: { x: 10, y: 2, z: 10 }, width: 4, height: 3 },
            { position: { x: 10, y: 2, z: 20 }, width: 4, height: 3 }
        ],
        // Street obstacles
        crates: [
            { position: { x: -5, y: 1, z: 15 }, size: 2 },
            { position: { x: 5, y: 1, z: 15 }, size: 2 }
        ],
        barrels: [
            { position: { x: 0, y: 0.75, z: 25 }, color: 0x404040 }
        ]
    }
};

// SCENARIO 2: Destruction arena (everything breaks!)
const destructionArena = {
    destructibles: {
        crates: [
            { position: { x: -20, y: 1, z: 0 }, size: 2 },
            { position: { x: -15, y: 1, z: 0 }, size: 2 },
            { position: { x: -10, y: 1, z: 0 }, size: 2 }
        ],
        glass: [
            { position: { x: 0, y: 2, z: 0 }, width: 3, height: 4 },
            { position: { x: 5, y: 2, z: 0 }, width: 3, height: 4 }
        ],
        walls: [
            { position: { x: 15, y: 3, z: 0 }, width: 8, height: 6 }
        ],
        barrels: [
            { position: { x: 25, y: 0.75, z: 0 }, explosive: true },
            { position: { x: 30, y: 0.75, z: 0 }, explosive: true }
        ]
    }
};

// SCENARIO 3: Construction site
const constructionSite = {
    destructibles: {
        walls: [
            // Orange construction barriers
            { position: { x: 0, y: 2, z: 0 }, width: 6, height: 4, health: 80, color: 0xFF6600 },
            { position: { x: 10, y: 2, z: 0 }, width: 6, height: 4, health: 80, color: 0xFF6600 }
        ],
        crates: [
            // Building materials
            { position: { x: 5, y: 1, z: 5 }, size: 2, color: 0x654321 },
            { position: { x: 5, y: 1, z: 8 }, size: 2, color: 0x654321 },
            { position: { x: 5, y: 3, z: 6.5 }, size: 2, color: 0x654321 }
        ],
        barrels: [
            // Metal drums
            { position: { x: -5, y: 0.75, z: 5 }, color: 0x404040 }
        ]
    }
};


/*
=====================================================
💡 PRO TIPS
=====================================================

1. STACKING OBJECTS
   - Make sure y position = half the object's height
   - For stacks, add heights together
   - Example: 2m crate on ground = y:1, on top of another = y:3

2. CHAIN REACTIONS
   - Place explosive barrels near other destructibles
   - Explosion radius = 5 meters by default
   - Each explosion can trigger nearby barrels!

3. GLASS WALLS
   - Use multiple glass panels side by side
   - Vary heights for visual interest
   - Thin thickness (0.1) looks best

4. BRICK PATTERNS
   - Set brickPattern: true for walls
   - Works best on larger walls (6+ width)
   - Auto-generates brick texture

5. DIFFICULTY BALANCING
   - Low health + high breakForce = fragile but needs speed
   - High health + low breakForce = tough but breaks eventually
   - Match breakForce to expected player speed

6. VISUAL FEEDBACK
   - Walls show cracks at 75%, 50%, 25% health
   - Glass shatters instantly
   - Crates splinter into chunks
   - Barrels break into staves

7. PERFORMANCE
   - Max 500 debris pieces auto-managed
   - Debris fades after 10 seconds
   - Each broken object creates 10-20 debris
   - Don't go crazy with 1000s of objects!

8. LEVEL DESIGN
   - Place destructibles where players will skate
   - Use as obstacles that can be cleared
   - Reward destruction with score/combos
   - Mix types for variety
*/
