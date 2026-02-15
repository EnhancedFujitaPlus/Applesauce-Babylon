# Desert Heat Level - Complete Setup Guide 🏜️

## What I Changed

Your original level had some outdated configurations. Here's what I updated to work with the new modular APPLESAUCE system:

### ❌ Old Terrain Config (Didn't Work)

```javascript
terrain: {
    type: 'desert',
    hillHeight: 15,
    hillLength: 150,
    color: 0xDEB887
}
```

### ✅ New Terrain Config (Works with Terrain Module!)

```javascript
terrain: {
    mode: 'procedural',          // Use procedural generation
    size: 1000,                   // 1000x1000 unit terrain
    resolution: 80,               // 80x80 segments (good performance)
    noise: {
        preset: 'dunes',          // Sandy wave pattern
        amplitude: 8              // Gentle rolling dunes (not too steep)
    },
    
    // Desert cacti vegetation
    vegetation: {
        type: 'scatter',
        count: 60,
        bounds: { minX: -400, maxX: 400, minZ: -400, maxZ: 400 },
        treeTypes: ['cactus'],    // Only cacti in desert!
        minScale: 1.2,
        maxScale: 2.5
    },
    
    // Scattered desert rocks
    props: [
        { type: 'generic', position: { x: 30, z: 20 }, scale: 2 }
        // More rocks...
    ]
}
```

## What Your Desert Level Now Has

### 🏜️ Procedural Desert Terrain

- **Rolling dunes** - Gentle sandy hills using 'dunes' noise preset
- **1000x1000 units** - Large explorable desert
- **60 cacti** - Scattered randomly across the desert
- **Desert rocks** - Props for atmosphere
- **Sandy beige color** - Automatic from terrain module

### 🎯 4 Objectives

1. **Explore the desert** - Auto-completes after spawn
2. **Score 5,000 points** - Do tricks and combos
3. **Grind a rail** - Hit any of the 4 rails
4. **Get 10x combo** - Chain tricks together

### 🛹 Desert Skate Course

**Starting Area:**
- Gentle ramp (x: 15) - Easy first jump

**First Rail:**
- Weathered wood rail (x: 35, length: 12) - Grindable!

**Canyon Jump:**
- Two ramps (x: 60 and 78) with gap - Jump the dune!

**S-Curve Rails:**
- Two rails in sequence (x: 95, 110) - Technical grind line

**Final Quarter Pipe:**
- Large golden quarter pipe (x: 130) - Big air finale!

### 🗣️ Desert Nomad NPC

Located near spawn (x: 12, z: 8):
- Brown desert outfit
- 4 dialogue lines
- Press F to talk
- Gives desert wisdom

**Dialogue:**
1. "Welcome to the Scorching Dunes, skater."
2. "The desert is harsh, but the rails are smooth. Keep your combo alive!"
3. "Watch out for scorpions - they are deadly in packs."
4. "Master the dunes and prove your worth, skater!"

### 🦂 5 Scorpion Enemies

**Starting Pack (2 scorpions):**
- Position: x: 25, z: 10 and x: 30, z: -8
- Health: 30 each
- Speed: 0.08 (slow)
- Color: Brown (0x8B4513)

**Middle Pack (2 scorpions):**
- Position: x: 70, z: 15 and x: 75, z: -12
- Health: 40 each
- Speed: 0.1 (moderate)
- Color: Dark brown (0x654321)

**Boss Scorpion (1):**
- Position: x: 120, z: 0 (near final quarter pipe)
- Health: 80 (takes multiple hits!)
- Speed: 0.15 (fast!)
- Color: Red (0xFF4500) - **DANGEROUS!**

### 🎨 Desert Theme Styling

**Colors:**
- Sky: Sandy beige (#FFE4B5)
- Fog: Sandy brown (#F4A460)
- NPCs: Desert brown (#D2691E)
- Obstacles: Various browns/tans
- HUD: Gold on brown background

**Visual Effects:**
- Radial gradient overlay (sun glow)
- Pulsing title screen
- Animated dialogue prompts
- Desert-themed borders

## How the Modules Work Together

### 1. Terrain Module

```javascript
// Generates procedural desert terrain
core.modules.terrain.generate({
    mode: 'procedural',
    noise: { preset: 'dunes' },
    vegetation: { treeTypes: ['cactus'] }
})

// Spawns 60 cacti across desert
// Creates rolling dune landscape
// Player positioned on terrain automatically
```

### 2. Dialogue Module

```javascript
// Creates NPC with dialogue
core.modules.dialogue.createNPC({
    name: 'Desert Nomad',
    position: new THREE.Vector3(12, 0, 8),
    dialogue: [...]
})

// Press F when near NPC to talk
// Displays speech bubble UI
// 4 dialogue messages cycle through
```

### 3. Enemies Module

```javascript
// Spawns scorpions
core.modules.enemies.spawn({
    type: 'basic',
    x: 25, z: 10,
    health: 30,
    color: 0x8B4513
})

// 5 scorpions spawn at different locations
// Chase player when in range
// Can be defeated with combat (if enabled)
```

### 4. Objectives Module

```javascript
// Tracks 4 objectives
core.modules.objectives.add({
    id: 'score_5000',
    description: 'Score 5,000 points',
    target: 5000,
    checker: (engine) => engine.state.score
})

// Auto-updates from game state
// Displays in objectives panel
// Marks complete with green checkmark
```

### 5. Gore Module

```javascript
// Automatically triggers on scorpion defeat
core.modules.gore.createSplatter(
    position,
    velocity
)

// Blood particles spray
// Creates desert combat atmosphere
```

### 6. Skater Module

```javascript
// Spawns player automatically
core.modules.skater.spawn({
    x: 0,
    z: 10,
    deckColor: 0xFF1493,  // Hot pink deck
    bodyColor: 0x333333   // Dark gray outfit
})

// Positioned on terrain automatically
// Press ESC to change helmet in pause menu
```

## How To Play

### Controls

```
WASD or Arrow Keys - Move
SPACE - Ollie (jump)
Q - Kickflip
E - Heelflip
F - Interact with NPC / Advance dialogue
ESC - Pause menu
```

### Objectives Order (Recommended)

1. **Talk to Desert Nomad** (press F near brown NPC)
2. **Hit the first ramp** (x: 15) - Get some air!
3. **Grind the first rail** (x: 35) - Completes grind objective
4. **Build combo** - Chain tricks: Jump → Kickflip → Grind → Heelflip
5. **Jump the canyon gap** (x: 60-78) - Big jump!
6. **Grind the S-curves** (x: 95, 110) - Technical section
7. **Hit final quarter pipe** (x: 130) - Massive air!
8. **Defeat scorpions** - Combat bonus points
9. **Score 5,000 points** - Complete final objective!

### Pro Tips

**Combo Building:**
- Grind rails for continuous combo
- Jump between rails without touching ground
- Mix kickflips and heelflips
- Ramp → Trick → Rail → Trick = Big combo!

**Scorpion Strategy:**
- Avoid brown scorpions early on
- Use speed to escape
- Attack when they're isolated
- RED scorpion is BOSS - save for last!

**Points Farming:**
- Grind the long rails (12 units = lots of points)
- Jump the canyon gap repeatedly
- S-curve rails = high difficulty = more points
- Final quarter pipe = highest single trick score

## Debugging & Testing

### Console Commands

```javascript
// Check if everything loaded
console.log('Terrain:', game.modules.terrain);
console.log('NPCs:', game.modules.dialogue);
console.log('Enemies:', game.modules.enemies);
console.log('Objectives:', game.modules.objectives);

// Teleport to areas
game.player.position.set(35, 5, 0);  // First rail
game.player.position.set(70, 5, 0);  // Canyon jump
game.player.position.set(120, 5, 0); // Final area

// Check terrain height
console.log('Height at player:', game.getTerrainHeight(
    game.player.position.x,
    game.player.position.z
));

// Complete objectives instantly
game.modules.objectives.setProgress('score_5000', 5000);
game.modules.objectives.setProgress('grind_rail', 1);
game.modules.objectives.setProgress('combo_10', 10);

// Spawn more scorpions
game.modules.enemies.spawn({
    type: 'basic',
    x: game.player.position.x + 10,
    z: game.player.position.z,
    health: 50
});

// Check cacti count
console.log('Vegetation:', game.modules.terrain.props.length);

// Give points
game.state.score += 1000;
```

### Common Issues

**"Player spawns underground"**
- Terrain generates async - wait for it
- Default spawn height is terrain height + 0.5
- Check console for terrain generation logs

**"Cacti not appearing"**
- They spawn randomly in bounds
- Count: 60 total
- Check: `game.modules.terrain.props`
- May need to move camera to see them

**"NPCs not showing"**
- Check dialogue module loaded: `game.modules.dialogue`
- NPC at position (12, 0, 8)
- Press F within 6 units to interact

**"Scorpions not spawning"**
- Check enemies module: `game.modules.enemies`
- Console should show "5 scorpions spawned"
- They're at specific x positions: 25, 30, 70, 75, 120

**"Objectives not updating"**
- Score objective auto-updates from game.state.score
- Combo objective auto-updates from game.state.combo
- Grind objective requires custom hook (included!)

## Customization Ideas

### More Desert Features

**Add oasis zone:**
```javascript
terrain: {
    zones: [{
        id: 'oasis',
        type: 'park',
        bounds: { x: 200, z: 200, width: 50, height: 50 },
        flatten: true
    }],
    // Add palm trees in oasis
    vegetation: [
        {
            type: 'scatter',
            count: 20,
            bounds: { minX: 180, maxX: 220, minZ: 180, maxZ: 220 },
            treeTypes: ['palm']
        }
    ]
}
```

**Add desert buildings:**
```javascript
terrain: {
    buildings: [
        {
            position: { x: 50, z: 50 },
            type: 'warehouse',
            width: 20,
            height: 15,
            depth: 20,
            color: 0xD2691E  // Sandy brown building
        }
    ]
}
```

**Add dirt roads:**
```javascript
terrain: {
    roads: [{
        start: { x: -100, z: 0 },
        end: { x: 200, z: 0 },
        type: 'street',
        material: 'dirt'  // Dusty desert road
    }]
}
```

### More Enemies

```javascript
// Fast scorpion swarm
for (let i = 0; i < 5; i++) {
    game.modules.enemies.spawn({
        type: 'fast',
        x: 100 + (i * 5),
        z: Math.random() * 20 - 10,
        speed: 0.2,
        health: 20,
        color: 0xFF0000
    });
}
```

### More Obstacles

```javascript
obstacles: [
    // Pyramid ramp
    {
        type: 'ramp',
        x: 150,
        z: 0,
        width: 20,
        height: 12,
        color: 0xF4A460
    },
    
    // Spine transfer
    {
        type: 'quarter',
        x: 180,
        z: -10,
        width: 12,
        height: 6
    },
    {
        type: 'quarter',
        x: 180,
        z: 10,
        width: 12,
        height: 6
    }
]
```

## File Structure

Make sure your files are organized like this:

```
your-project/
├── three.module.js
├── level-1-desert-heat.html  ← Your level file
└── engine/
    ├── applesauce-core-3.js
    ├── gore/
    │   └── applesauce-gore.js
    ├── dialogue/
    │   └── applesauce-dialogue.js
    ├── enemies/
    │   └── applesauce-enemies.js
    ├── objectives/
    │   └── applesauce-objectives.js
    ├── terrain/
    │   └── applesauce-terrain-4.js
    ├── weather/
    │   └── applesauce-weather.js
    ├── pause/
    │   └── applesauce-pause.js
    ├── combat/
    │   └── applesauce-combat.js
    ├── skater/
    │   └── applesauce-skater.js
    └── [other modules...]
```

## Summary

Your desert level now features:

✅ **Procedural terrain** with rolling dunes
✅ **60 cacti** scattered across desert
✅ **Desert rocks** for atmosphere
✅ **5 skateable obstacles** (ramps, rails, quarter pipe)
✅ **Desert Nomad NPC** with 4 dialogue lines
✅ **5 scorpion enemies** (including boss)
✅ **4 objectives** with auto-tracking
✅ **Desert theme** styling and colors
✅ **Full module integration** (terrain, dialogue, enemies, objectives, gore, skater, pause, combat)
✅ **Proper defensive coding** (all modules checked before use)

The level is production-ready and showcases the full power of the APPLESAUCE modular system! 🏜️🛹

Shred those dunes, skater! 🦂
