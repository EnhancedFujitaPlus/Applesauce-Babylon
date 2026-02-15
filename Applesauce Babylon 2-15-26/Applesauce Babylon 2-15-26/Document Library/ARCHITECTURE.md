# APPLESAUCE Modular Level Architecture Guide

## 🎯 Overview

This architecture treats **each level as its own module** that gets loaded into a generic core engine. The core provides the skateboarding mechanics, physics, and systems - while levels provide content, layout, and unique mechanics.

## 📁 File Structure

```
applesauce/
├── applesauce-core_copy_2.js       # Generic engine (physics, rendering, modules)
├── applesauce-materials.js          # Material library (shared across levels)
├── applesauce-level-wildwest.js     # Wild West level config
├── applesauce-level-volcano.js      # Volcano level config
├── applesauce-level-cyberpunk.js    # Cyberpunk level config
└── wildwest-level.html              # HTML wrapper to load level
```

## 🏗️ Architecture Flow

```
HTML File
   ↓
Initializes Core
   ↓
Loads Level Config
   ↓
Level builds itself using Core's systems
   ↓
Game runs with level-specific logic
```

## 🎨 Materials System

The `ApplesauceMaterials` class is imported into the core and provides:

```javascript
// In core
this.materials = new ApplesauceMaterials(this);

// In level building code
const material = core.materials.getMaterial('woodWeathered');
const randomColor = core.materials.getRandomGraffitiColor();
```

### Available Materials

**Terrain:**
- `concrete`, `grass`, `dirt`, `asphalt`

**Skatepark:**
- `metal`, `metalRusty`, `wood`, `woodWeathered`

**Special Effects:**
- `ice`, `lava`, `blood`, `flesh`

**Collectibles:**
- `coin`, `gem`

**Enemies:**
- `enemyBasic`, `enemyArmored`

**Wild West:**
- `sandstone`, `dustyWood`, `rustyIron`, `desert`, `trainSmoke`

## 📋 Level Config Structure

Every level is an exported object with this structure:

```javascript
export const LevelName = {
    meta: {
        number: 1,
        name: "Level Name",
        description: "Description",
        difficulty: "Easy/Medium/Hard",
        theme: "theme-name"
    },
    
    scene: {
        background: 0xHEXCOLOR,
        fog: {
            color: 0xHEXCOLOR,
            near: 50,
            far: 300
        }
    },
    
    playerStart: {
        x: 0,
        z: 10
    },
    
    terrain: {
        type: 'flat', // or 'hills', 'desert', etc.
        size: 200,
        material: 'grass' // material name
    },
    
    obstacles: [
        // Skateable objects
        { type: 'rail', start: [x, y, z], end: [x, y, z] },
        { type: 'box', position: [x, y, z], size: [w, h, d], material: 'wood' },
        { type: 'ramp', position: [x, y, z], size: [w, h, d], angle: 45 }
    ],
    
    objectives: [
        {
            id: 'objective_id',
            description: 'Do something',
            type: 'score/discovery/moral_choice',
            required: 100,
            current: 0
        }
    ],
    
    // Level-specific data
    customProperty: {
        // Any level-specific data
    },
    
    // Initialization hook
    onLevelStart(core) {
        // Spawn NPCs
        // Create custom objects
        // Set up level-specific systems
        
        console.log('Level started!');
    },
    
    // Per-frame update hook
    onUpdate(core) {
        // Custom game logic
        // Check for interactions
        // Update level-specific systems
    }
};
```

## 🎮 Building a Level (Step-by-Step)

### 1. Create the Level File

```javascript
// applesauce-level-myLevel.js
export const MyLevel = {
    meta: {
        number: 5,
        name: "My Awesome Level",
        description: "Short description"
    },
    
    // ... rest of config
};
```

### 2. Define Scene Properties

```javascript
scene: {
    background: 0x87CEEB, // Sky blue
    fog: {
        color: 0x87CEEB,
        near: 100,
        far: 400
    }
},
```

### 3. Create Custom Objects in onLevelStart

```javascript
onLevelStart(core) {
    // Access materials system
    const woodMat = core.materials.getMaterial('wood');
    
    // Create a building
    const buildingGeo = new THREE.BoxGeometry(20, 15, 10);
    const building = new THREE.Mesh(buildingGeo, woodMat);
    building.position.set(0, 7.5, -20);
    building.castShadow = true;
    core.scene.add(building);
    
    // Make it an obstacle for collision
    core.obstacles.push(building);
    
    // Spawn an NPC
    if (core.modules.dialogue) {
        core.modules.dialogue.createNPC({
            position: new THREE.Vector3(5, 2, -15),
            name: "Townsperson",
            dialogue: ["Hello skater!", "Watch out for trouble."],
            color: 0x00FF00
        });
    }
    
    // Store level-specific data
    core.myLevelData = {
        customValue: 100,
        interactables: []
    };
},
```

### 4. Add Custom Update Logic

```javascript
onUpdate(core) {
    // Check for custom interactions
    if (core.keys['e']) {
        const playerPos = core.player.position;
        
        // Check proximity to interactive object
        const dist = playerPos.distanceTo(someObject.position);
        if (dist < 5) {
            triggerInteraction(core);
        }
    }
    
    // Update custom systems
    if (core.myLevelData) {
        core.myLevelData.customValue -= 1;
    }
}
```

### 5. Create HTML Wrapper

```html
<script type="module">
    import { ApplesauceCore } from './applesauce-core_copy_2.js';
    import { MyLevel } from './applesauce-level-myLevel.js';
    
    const game = new ApplesauceCore({
        goreEnabled: true,
        dialogueEnabled: true
    });
    
    await game.loadLevel(MyLevel);
    
    // Add custom update hook
    const originalUpdate = game.update.bind(game);
    game.update = function() {
        originalUpdate();
        if (MyLevel.onUpdate) {
            MyLevel.onUpdate(game);
        }
    };
    
    game.start();
</script>
```

## 🚂 Wild West Level Example

The High Noon Showdown demonstrates:

1. **Custom Materials** - Desert sand, rusty metal, weathered wood
2. **Building System** - Function to create town buildings
3. **Interactive Objects** - Train lever that triggers events
4. **Moral Choice** - Start train → kill people → become villain
5. **Dynamic Events** - Train movement, victim collisions, gore
6. **Dialogue Integration** - NPCs that tell story
7. **Objectives System** - Track player progress

### Key Components:

```javascript
// Train system
core.wildwestTrain = {
    mesh: trainMesh,
    active: false,
    position: startX,
    targetPosition: endX,
    victims: []
};

// Lever interaction
if (core.keys['e'] && playerNearLever) {
    pullTrainLever(core);
}

// Train update
if (train.active) {
    train.mesh.position.x += 0.3;
    checkVictimCollisions(train);
}
```

## 🎯 Recommendations for Wild West Level

### Scene Enhancements

1. **Add tumbleweeds** that roll across the desert
2. **Dust particles** that kick up when skating
3. **Dynamic shadows** that move with time of day
4. **Wanted posters** on buildings that react to your actions

### Skateable Objects

1. **Saloon porch rails** (already have this!)
2. **Water troughs** for grinding
3. **Hitching posts** for manual tricks
4. **Hay bales** for quarter pipes
5. **Train cars** for rail slides

### NPCs & Interactions

1. **Sheriff** who becomes hostile after train incident
2. **Bartender** who gives hints about the train
3. **Mysterious villain** who orchestrated the trap
4. **Townspeople** who react to your reputation

### Audio Suggestions

```javascript
// In onLevelStart
core.audio = {
    ambient: 'western_wind.mp3',
    trainWhistle: 'train_whistle.mp3',
    scream: 'npc_scream.mp3',
    guitarStrum: 'western_guitar.mp3'
};

// Play when needed
// core.audio.trainWhistle.play();
```

### Visual Polish

1. **Particle system** for train smoke
2. **Crows** flying overhead
3. **Cactus** obstacles
4. **Old wanted posters** as graffiti replacement
5. **Sunset lighting** (warm orange)

## 🔧 Common Patterns

### Spawning Enemies

```javascript
onLevelStart(core) {
    if (core.modules.enemies) {
        core.modules.enemies.spawn({
            position: new THREE.Vector3(10, 0, -10),
            type: 'basic',
            health: 3,
            speed: 0.05
        });
    }
}
```

### Creating Grindable Rails

```javascript
const railGeo = new THREE.BoxGeometry(length, 0.3, 0.3);
const railMat = core.materials.getMaterial('metal');
const rail = new THREE.Mesh(railGeo, railMat);
rail.position.set(x, y, z);
core.scene.add(rail);
core.rails.push(rail); // Makes it grindable!
```

### Triggering Dialogue

```javascript
if (core.modules.dialogue) {
    core.modules.dialogue.show(
        "Speaker Name",
        "Dialogue text here"
    );
}
```

### Checking Objectives

```javascript
if (core.modules.objectives) {
    core.modules.objectives.completeObjective('objective_id');
    
    // Or update progress
    const obj = core.modules.objectives.getObjective('collect_coins');
    obj.current++;
}
```

## 🚀 Benefits of This Architecture

1. **Separation of Concerns** - Core handles mechanics, levels handle content
2. **Reusability** - Materials and systems shared across levels
3. **Easy Iteration** - Modify level without touching core
4. **Custom Mechanics** - Each level can have unique systems
5. **Maintainable** - Clear structure, easy to debug
6. **Scalable** - Add infinite levels without bloating core

## 💡 Tips

- Always call `core.scene.add()` for visible objects
- Add to `core.obstacles` for collision detection
- Add to `core.rails` for grinding
- Use `core.modules.X` to access engine systems
- Store level-specific data in `core.levelName` properties
- Clean up in level transitions if needed

## 🎬 Next Steps

1. Test the Wild West level
2. Tweak train speed and victim placement
3. Add more skateable objects
4. Polish the NPC dialogue
5. Add sound effects
6. Create reputation system that tracks player actions
7. Add multiple endings based on choices

---

Happy skating, cowboy! 🤠🛹
