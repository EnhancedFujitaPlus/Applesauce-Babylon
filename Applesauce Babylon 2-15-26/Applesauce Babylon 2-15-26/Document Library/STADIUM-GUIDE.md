# APPLESAUCE Stadium Edition Guide

## 🏈 Overview

The Stadium Edition adds massive crowds, collectible items, advanced NPC AI, knockback mechanics, and audio systems to APPLESAUCE. Perfect for creating sports-themed chaos!

## New Features

### 1. **Collectible System**
Items that can be picked up with the F key.

### 2. **Football Players**
Advanced NPCs with:
- Team formations
- Play patterns (QB, RB, WR movement)
- Aerial hit requirement (must be doing tricks)
- MASSIVE knockback when hit while grounded
- Chase mechanics after football is grabbed
- 3 HP each

### 3. **Crowd Generation**
Create thousands of spectators automatically:
- Configurable sections, rows, and seats
- Team color distribution
- Packed like sardines!

### 4. **Audio System**
- Load and play sound files
- Generate beeps for testing
- Event-triggered sounds

### 5. **Knockback Mechanics**
Football players send you FLYING if you hit them while on the ground.

## Stadium Level Structure

### Football Field Setup

```javascript
ground: [
    // Main field (green grass)
    {
        type: "grass",
        color: 0x228B22,  // Bright green
        width: 160,
        depth: 360,
        position: { x: 0, y: 0, z: 0 }
    },
    // End zones (team colors)
    {
        type: "grass",
        color: 0x0000FF,  // Blue endzone
        width: 160,
        depth: 30,
        position: { x: 0, y: 0.01, z: -165 }
    }
]
```

### Creating the Football

```javascript
collectibles: [
    {
        type: 'football',
        x: 0,              // Center field
        z: 0,
        data: {
            sound: null,   // Sound file (or null for beep)
            onCollect: function() {
                // Custom code when collected
                console.log('FOOTBALL GRABBED!');
            }
        }
    }
]
```

## Football Player Configuration

### Basic Setup

```javascript
footballPlayers: [
    {
        x: 0,                    // X position
        z: -10,                  // Z position
        team: 'home',            // 'home' or 'away'
        position: 'QB',          // Position name (QB, RB, WR, etc)
        data: {
            playPattern: 'qb',   // Movement pattern
            knockbackStrength: 4.0  // How hard they hit
        }
    }
]
```

### Play Patterns

**'qb' (Quarterback):**
- Moves backward (dropback)
- Then forward (scramble)
- Loops every 120 frames

**'rb' (Running Back):**
- Runs straight forward
- Returns to start after 100 frames

**'wr' (Wide Receiver):**
- Runs forward 40 frames
- Cuts sideways 40 frames
- Returns to start

**'idle' (Linemen):**
- Stays in position
- Best for defensive/offensive lines

### Team Colors

- **home**: Blue (0x0000FF)
- **away**: Red (0xFF0000)

### Knockback Strength

Recommended values:
- **QB/Skilled positions**: 3.0 - 4.0
- **Linebackers/RBs**: 3.5 - 4.5
- **Linemen**: 5.0+ (BRUTAL)

### How Football Players Work

**Before Football Grabbed:**
- Execute their play patterns
- Can be hit with aerial tricks (3 hits to kill)
- Don't actively chase player

**After Football Grabbed:**
- ALL players switch to chase mode
- Pursue player relentlessly
- Massive knockback if they hit grounded player
- Still require aerial tricks to damage

## Crowd Generation System

### Crowd Configuration

```javascript
crowd: {
    sections: [
        {
            rows: 20,              // Number of rows
            seatsPerRow: 180,      // Seats in each row
            startX: -130,          // Starting X position
            startY: 5,             // Starting Y (height)
            startZ: -175,          // Starting Z position
            spacingX: 0.5,         // Space between seats (X)
            spacingY: 1,           // Space between rows (Y)
            spacingZ: 2,           // Space between rows (Z)
            teamColorA: 0x0000FF,  // First team color
            teamColorB: 0xFF0000   // Second team color
        }
    ]
}
```

### Creating Massive Crowds

**The stadium level creates 7,200 crowd members!**

West bleachers: 20 rows × 180 seats = 3,600 fans
East bleachers: 20 rows × 180 seats = 3,600 fans

**Performance Tips:**
- Start with fewer rows (10-15) and test
- Reduce seatsPerRow if laggy
- Spacing affects visual density
- Simple geometry keeps it fast

**Example - Small Crowd:**
```javascript
{
    rows: 10,
    seatsPerRow: 50,
    // ... positions
}
// Creates 500 fans
```

**Example - MASSIVE Crowd:**
```javascript
{
    rows: 30,
    seatsPerRow: 200,
    // ... positions
}
// Creates 6,000 fans per section!
```

## Stadium Props

### Goalposts

```javascript
// Vertical posts
{ type: 'box', width: 2, height: 20, depth: 2, color: "0xFFFF00", 
  position: { x: -9, y: 10, z: -180 } },
{ type: 'box', width: 2, height: 20, depth: 2, color: "0xFFFF00", 
  position: { x: 9, y: 10, z: -180 } },

// Crossbar
{ type: 'box', width: 20, height: 2, depth: 2, color: "0xFFFF00", 
  position: { x: 0, y: 20, z: -180 } }
```

### Bleacher Supports

Create tiered seating:
```javascript
{ type: 'box', width: 40, height: 2, depth: 360, color: "0x808080", 
  position: { x: -110, y: 5, z: 0 } },
{ type: 'box', width: 40, height: 2, depth: 360, color: "0x808080", 
  position: { x: -110, y: 10, z: 0 } },
// Continue up to create tiers
```

### Scoreboard

```javascript
{ type: 'box', width: 60, height: 30, depth: 5, color: "0x000000", 
  position: { x: 0, y: 50, z: -200 } }
```

## Audio System

### Loading Sounds

```javascript
// In your game initialization
await game.loadSound('crowd_cheer', 'sounds/crowd.mp3');
await game.loadSound('hit', 'sounds/impact.wav');
await game.loadSound('whistle', 'sounds/whistle.mp3');
```

### Playing Sounds

```javascript
// Play loaded sound
game.playSound('crowd_cheer', 1.0);  // volume 0.0 - 1.0

// Play test beep (no file needed)
game.playBeep(440, 200);  // frequency, duration in ms
```

### Sound in Collectibles

```javascript
collectibles: [
    {
        type: 'football',
        x: 0, z: 0,
        data: {
            sound: 'whistle',  // Sound name
            onCollect: function() {
                // Custom code
            }
        }
    }
]
```

## Gameplay Mechanics

### How to Hit Football Players

1. **Jump** with Space
2. **Do a trick** with Q/E/Z/B while airborne
3. **Hit them from above** while trick is active
4. Each player takes **3 aerial hits**

### What NOT to Do

**DO NOT hit them while grounded!**
- You'll get MASSIVE knockback
- Launched several units away
- Potentially into danger

### Survival Strategy

After grabbing the football:
1. **Keep moving** - they chase you
2. **Use aerial tricks** to fight back
3. **Grind rails** to maintain distance
4. **Avoid getting cornered**
5. **Watch your surroundings**

## Customization Examples

### Basketball Court Stadium

```javascript
const BASKETBALL_STADIUM = {
    ground: [
        // Wood court
        {
            type: "concrete",
            color: 0xDEB887,  // Wood color
            width: 94,
            depth: 50,
            position: { x: 0, y: 0, z: 0 }
        }
    ],
    collectibles: [
        {
            type: 'football',  // Using same system
            x: 0, z: 0
        }
    ],
    footballPlayers: [
        // Basketball players (smaller teams)
        { x: -20, z: -10, team: 'home', position: 'PG', data: { playPattern: 'idle', knockbackStrength: 3.0 } },
        // ... 4 more home players
        // ... 5 away players
    ],
    crowd: {
        sections: [
            // Court-side seats
            {
                rows: 5,
                seatsPerRow: 60,
                startX: -50,
                startY: 1,
                startZ: -27,
                spacingX: 0.8,
                spacingY: 0.8,
                spacingZ: 0.8,
                teamColorA: 0xFFA500,
                teamColorB: 0x800080
            }
        ]
    }
};
```

### Soccer Stadium

```javascript
const SOCCER_STADIUM = {
    ground: [
        {
            type: "grass",
            color: 0x228B22,
            width: 230,
            depth: 345,
            position: { x: 0, y: 0, z: 0 }
        }
    ],
    footballPlayers: [
        // 11 vs 11 formation
        // Goalkeeper, defenders, midfield, forwards
    ],
    crowd: {
        sections: [
            // 360-degree seating
            // North, South, East, West stands
        ]
    }
};
```

### Death Arena

```javascript
const DEATH_ARENA = {
    ground: [
        {
            type: "concrete",
            color: 0x8B0000,  // Blood red
            width: 200,
            depth: 200,
            position: { x: 0, y: 0, z: 0 }
        }
    ],
    footballPlayers: [
        // Gladiators in circular formation
        { x: 30, z: 0, team: 'away', position: 'GLADIATOR', 
          data: { playPattern: 'idle', knockbackStrength: 8.0 } },
        // ... more in circle
    ],
    collectibles: [
        {
            type: 'football',  // Could be a weapon
            x: 0, z: 0
        }
    ]
};
```

## Performance Optimization

### If Stadium Lags

**Reduce Crowd:**
```javascript
rows: 10,          // Was 20
seatsPerRow: 100,  // Was 180
```

**Reduce Football Players:**
```javascript
// Keep only key positions
// Remove some linemen
```

**Disable Shadows:**
```javascript
// In engine, set:
renderer.shadowMap.enabled = false;
```

**Lower Resolution:**
```javascript
// In HTML, reduce canvas size
renderer.setSize(
    window.innerWidth * 0.75, 
    window.innerHeight * 0.75
);
```

## Objectives System

The stadium level tracks:

1. **Grab the Football** - Collect the item
2. **Survive 60 Seconds** - Timer starts on collection
3. **Knockout 5 Players** - Aerial trick kills

You can modify these:

```javascript
// In HTML, update objectives
const obj2 = document.getElementById('obj-survive');
const timeLeft = Math.max(0, 30 - Math.floor(survivalTimer));  // Changed to 30s
```

## Tips for Level Designers

1. **Test Crowd Size Incrementally**
   - Start with 1,000 fans
   - Increase until performance drops
   - That's your limit

2. **Balance Knockback**
   - Too high = frustrating
   - Too low = not threatening
   - 3.0-5.0 is the sweet spot

3. **Space Out Players**
   - Give room for aerial tricks
   - Clustered = impossible to hit

4. **Use Play Patterns**
   - Mix movement types
   - Creates dynamic field
   - More interesting than static

5. **Sound Enhances Everything**
   - Crowd roar on football grab
   - Impact sounds on hits
   - Victory music on completion

## Common Issues

**Crowd not appearing:**
- Check console for count
- Verify section positions
- Ensure not underground (Y > 0)

**Can't hit football players:**
- Must be AIRBORNE
- Must have ACTIVE TRICK
- Must be within range

**Getting launched too far:**
- Reduce knockbackStrength
- Stay airborne more
- Use grinding for safety

**Football not grabbable:**
- Press F when close
- Check nearCollectible in console
- Verify position not blocked

## Next Level Ideas

- **Multi-Sport Complex** - Different fields
- **Monster Truck Rally** - Giant NPCs
- **Concert Venue** - Music-themed
- **Gladiator Arena** - Circular combat
- **Race Track** - Speed-based survival

---

**ENJOY THE CARNAGE! 🏈**

*Remember: The crowd is watching. Make it spectacular.*