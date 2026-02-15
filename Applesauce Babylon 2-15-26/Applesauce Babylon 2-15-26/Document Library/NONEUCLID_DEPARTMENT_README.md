# Level 58: Endless Department of Sound

## Overview
This level combines your APPLESAUCE music system with the NonEuclid module to create an infinite department store that loops on itself. The aisles extend forever through non-euclidean space tricks.

## What I Fixed & Added

### 1. **Proper Department Store Setup**
- Created a complete shelf generation system with `createShelf()` function
- Built 5 aisles with shelves spaced evenly
- Added product boxes on shelves for visual variety
- Implemented floor, walls, and ceiling with lighting
- Added variation (wobble, damage) to shelves for realism

### 2. **NonEuclid Integration**
The level now uses your `applesauce-noneuclid.js` module with:
- **Loop triggers**: Walk past Z=200 or Z=-200 and you teleport back seamlessly
- **Infinite aisles**: The department store appears endless
- **Camera drift**: Subtle disorientation effect
- **Loop counter**: Tracks how many times you've looped

### 3. **Music System**
- Fully integrated ApplesauceMusic module
- Three contexts: menu, level, boss
- Playlist management with UI controls
- Volume control and track skipping

## Non-Euclidean Features You Can Expand

### Current Triggers
```javascript
// Forward loop (go too far forward, teleport back)
condition: player.position.z > 200
action: player.position.z -= 400

// Backward loop (go too far backward, teleport back) 
condition: player.position.z < -200
action: player.position.z += 400
```

### Ideas for More Non-Euclidean Effects

**1. Aisle Switching**
```javascript
game.modules.noneuclid.addTrigger({
    id: 'aisle-switch',
    condition: (engine) => {
        // If player goes into left wall area
        return engine.player.position.x < -25;
    },
    action: (engine) => {
        // Teleport them to right side
        engine.player.position.x = 25;
        // Maybe flip the camera for disorientation
        engine.modules.noneuclid.flipCameraYaw(Math.PI);
    }
});
```

**2. Expanding Aisles**
```javascript
game.modules.noneuclid.addTrigger({
    id: 'expanding-store',
    condition: (engine) => loopCount > 5,
    action: (engine) => {
        // After 5 loops, make aisles wider
        // This would require rebuilding geometry
        console.log('The store is getting bigger...');
    },
    once: true
});
```

**3. Layer Switching (Different "Dimensions")**
```javascript
// Create two versions of the store
const normalStore = buildDepartmentStore();
const darkStore = buildDepartmentStore(); // Make it darker/creepier

game.modules.noneuclid.addLayer('normal', normalStore);
game.modules.noneuclid.addLayer('dark', darkStore);

// Switch between them
game.modules.noneuclid.setLayerActive('normal', false);
game.modules.noneuclid.setLayerActive('dark', true);
```

**4. Recursive Mirrors**
```javascript
game.modules.noneuclid.addTrigger({
    id: 'mirror-hall',
    condition: (engine) => {
        // Enter specific aisle
        return Math.abs(engine.player.position.x - 12) < 2;
    },
    action: (engine) => {
        // Create mirror effect - flip X position
        engine.player.position.x = -engine.player.position.x;
    }
});
```

## File Structure Needed

```
your-project/
├── engine/
│   ├── applesauce-core-33.js
│   ├── applesauce-noneuclid.js
│   └── music/
│       └── applesauce-music.js
├── music/
│   ├── menu/
│   │   ├── mixdown.ogg
│   │   └── character-select.mp3
│   ├── level/
│   │   ├── downtown.ogg
│   │   ├── skatepark.mp3
│   │   └── urban.wav
│   └── boss/
│       ├── showdown.ogg
│       └── last-stand.mp3
└── level_58_noneuclid.html
```

## How It Works

### Loop System
When you walk forward past the trigger point (Z > 200):
1. NonEuclid module detects position
2. Smoothly teleports you back (Z -= 400)
3. Updates loop counter
4. Player doesn't notice the seam because geometry is identical

### Shelf System
- Shelves are created procedurally in a loop
- Variation added randomly (wobble, damage, products)
- Spacing is consistent for seamless looping
- Products randomly placed for visual interest

### The Illusion
The key to non-euclidean spaces is making the teleport **invisible**:
- Geometry matches perfectly at loop points
- No visual pop or glitch
- Lighting is consistent
- Player maintains momentum

## Customization Options

### Change Store Size
```javascript
const LEVEL_58 = {
    storeWidth: 60,      // Width of store
    aisleLength: 200,    // Length before loop
    numAisles: 5,        // Number of parallel aisles
    shelfHeight: 12,     // Height of shelves
    shelfSpacing: 8,     // Distance between shelves
};
```

### Change Loop Triggers
```javascript
// Make loops happen sooner/later
const loopDistance = LEVEL_58.aisleLength; // Default: 200
```

### Add More Products
```javascript
// In createShelfProducts(), change:
const numProducts = Math.floor(Math.random() * 5) + 2; // More items
```

## Artist Tools Integration

This level is perfect for your artists because:
1. **Music showcasing**: Different tracks for different moods
2. **Endless exploration**: Players can skate/explore infinitely
3. **Atmospheric**: Lighting and space create eerie retail vibes
4. **Modular**: Easy to add more non-euclidean tricks

## Next Steps

1. Add more trigger types (time-based, combo-based)
2. Create "zones" with different music contexts
3. Add interactive elements (checkout lanes, carts)
4. Create multiple "layers" players can shift between
5. Add enemies that use non-euclidean movement

The NonEuclid module gives you a lot of power - you can make impossible spaces, endless loops, mirror dimensions, and more!
