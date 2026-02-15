# APPLESAUCE Modular Engine Architecture

## 📁 File Structure

```
applesauce-core.js          - Main game engine (physics, player, camera, rendering)
applesauce-gore.js          - Blood, gibs, particle effects
applesauce-dialogue.js      - NPC system and dialogue
applesauce-enemies.js       - Enemy AI, collision, boss fights
applesauce-objectives.js    - Level objective tracking

level-1-config.js           - Level 1 data (terrain, obstacles, NPCs, enemies)
level-2-config.js           - Level 2 data
level-N-config.js           - Additional levels...

level-template.html         - Clean HTML that loads everything
```

## 🎯 Key Advantages

1. **Add features once, all levels benefit** - When you add a new trick or enemy behavior to the core modules, every level automatically gets it.

2. **New levels are just config files** - Creating a new level is as simple as:
   - Copy `level-1-config.js` 
   - Rename to `level-N-config.js`
   - Modify terrain, obstacles, enemies, dialogue
   - Update the HTML to load your new config

3. **Modular features** - Don't need gore? Don't load `applesauce-gore.js`. Each module is independent.

4. **Easy debugging** - Issues with gore? Just look at `applesauce-gore.js`. Issues with objectives? Just look at `applesauce-objectives.js`.

## 🚀 How to Create a New Level

### Method 1: Quick Config-Only Approach

1. **Copy the config:**
   ```bash
   cp level-1-config.js level-2-config.js
   ```

2. **Edit level data** in `level-2-config.js`:
   ```javascript
   const Level2Config = {
       name: "SKATEPARK CHAOS",
       levelNumber: 2,
       
       playerStart: { x: 0, z: 0 },
       
       obstacles: [
           { type: 'quarterPipe', x: 10, z: 20, rotation: 0, width: 12 },
           // ... your obstacles
       ],
       
       enemies: [
           { type: 'cluster', x: 0, z: 50, count: 15, radius: 10 }
       ],
       
       objectives: [
           { type: 'kill', count: 20, description: "Roadkill 20 People" },
           { type: 'score', score: 50000, description: "Reach 50,000 points" }
       ]
   };
   ```

3. **Update HTML** (or copy template):
   ```html
   <!-- Change this line: -->
   <script src="level-1-config.js"></script>
   <!-- To: -->
   <script src="level-2-config.js"></script>
   
   <!-- And update initLevel1() to initLevel2() -->
   initLevel2(game);
   ```

4. **Done!** Your new level is ready.

### Method 2: Custom Level Logic

For levels with unique mechanics, you can extend the core:

```javascript
// level-2-config.js
function initLevel2(engine) {
    // Standard setup
    engine.createPlayer(0, 0);
    
    // Custom level-specific code
    engine.specialFeature = true;
    
    // Custom enemy behavior
    if (engine.modules.enemies) {
        engine.modules.enemies.spawnCustomEnemy({
            position: { x: 10, z: 50 },
            behavior: 'unique_pattern'
        });
    }
}
```

## 🛠️ Module API Reference

### ApplesauceCore

```javascript
const game = new ApplesauceCore(config);

// Core methods
game.createPlayer(x, z);
game.createQuarterPipe(x, z, rotation, width);
game.createFunbox(x, z);
game.createLongRail(xOffset, zStart, zEnd, heightStart, heightEnd);
game.createFlatRail(x, z, length, rotation);
game.createLedge(x, z, length, height);
game.createStairs(x, z, rotation);
game.getTerrainHeight(x, z);

// Module registration
game.registerModule('gore', goreModule);

// Control
game.start();
game.stop();
game.togglePause();
```

### ApplesauceGore

```javascript
const gore = new ApplesauceGore(engine);

gore.createBloodSplatter(position, velocity, amount);
gore.createBloodPool(position, size);
gore.createGibs(position, velocity, count);
gore.createMassiveSplatter(position, velocity); // High-speed kills
gore.clear(); // Remove all gore
```

### ApplesauceDialogue

```javascript
const dialogue = new ApplesauceDialogue(engine);

const npc = dialogue.createNPC({
    name: "SKATER DUDE",
    position: { x: 0, y: 0, z: 50 },
    color: 0x00FF00,
    interactRadius: 5,
    dialogue: [
        { speaker: "SKATER DUDE", text: "Hey! Ready to shred?" },
        { speaker: "YOU", text: "Always!" }
    ]
});
```

### ApplesauceEnemies

```javascript
const enemies = new ApplesauceEnemies(engine);

enemies.spawnEnemy({ position: { x: 10, z: 50 } });
enemies.spawnLine(x, z, count, spacing);
enemies.spawnCluster(centerX, centerZ, count, radius);

const boss = enemies.spawnBoss({
    spawn: { x: 0, z: 300 },
    color: 0xFF0000,
    health: 10,
    speed: 0.05
});
```

### ApplesauceObjectives

```javascript
const objectives = new ApplesauceObjectives(engine);

objectives.addKillObjective(10, "Roadkill 10 People");
objectives.addTrickObjective('Kickflip', 5, "Land 5 Kickflips");
objectives.addBossObjective("Defeat the Boss");
objectives.addScoreObjective(10000, "Reach 10,000 points");

// Custom objectives
objectives.add({
    id: 'custom',
    description: "Custom Goal",
    type: 'custom',
    target: 1,
    checker: (engine) => {
        // Return current progress
        return engine.state.someValue;
    },
    onComplete: (engine) => {
        console.log('Custom objective complete!');
    }
});
```

## 🎮 Level Config Format

```javascript
const LevelNConfig = {
    name: "LEVEL NAME",
    levelNumber: N,
    goreEnabled: true,
    
    terrain: {
        hillHeight: 60,
        hillLength: 250,
        hillWidth: 100
    },
    
    playerStart: {
        x: 0,
        z: 10
    },
    
    obstacles: [
        { type: 'longRail', xOffset: -5, zStart: 20, zEnd: 200, heightStart: 50, heightEnd: 5 },
        { type: 'quarterPipe', x: -15, z: 220, rotation: Math.PI/4, width: 10 },
        { type: 'funbox', x: 0, z: 240 },
        { type: 'stairs', x: 10, z: 260, rotation: 0 },
        { type: 'flatRail', x: -8, z: 280, length: 15, rotation: 0 },
        { type: 'ledge', x: 0, z: 300, length: 20, height: 1.5 }
    ],
    
    ground: [
        { type: 'grass', width: 200, depth: 400, position: { x: 0, y: 0, z: 200 } }
    ],
    
    npcs: [
        {
            name: "NPC NAME",
            position: { x: 0, y: 0, z: 50 },
            color: 0x00FF00,
            interactRadius: 5,
            dialogue: [
                { speaker: "NPC NAME", text: "Hello!" }
            ]
        }
    ],
    
    enemies: [
        { type: 'line', x: 0, z: 50, count: 5, spacing: 4 },
        { type: 'cluster', x: 0, z: 100, count: 8, radius: 6 }
    ],
    
    boss: {
        spawn: { x: 0, z: 320 },
        color: 0xFF0000,
        health: 10,
        speed: 0.05,
        triggerCondition: 'roadkillComplete'
    },
    
    objectives: [
        { type: 'kill', count: 10, description: "Roadkill 10 People" },
        { type: 'trick', trickType: 'Kickflip', count: 5, description: "Land 5 Kickflips" },
        { type: 'boss', description: "Defeat the Boss" }
    ]
};
```

## 💡 Tips & Best Practices

### Adding New Features

Want to add a new trick? Add it to `applesauce-core.js` in the `handleTrickInput()` method:

```javascript
handleTrickInput(key) {
    let trickName = '';
    
    switch(key) {
        case 'q':
            trickName = 'KICKFLIP!';
            break;
        case 'n': // NEW TRICK!
            trickName = 'NOLLIE!';
            break;
    }
    // ... rest of logic
}
```

Now ALL levels automatically have the new trick!

### Performance Optimization

If gore is slowing down your game:

```javascript
// In applesauce-gore.js, adjust:
this.maxBloodParticles = 200; // Lower this
particle.lifetime = 500; // Shorter lifetimes
```

### Module Independence

Modules can work alone or together:

```html
<!-- Minimal setup: Just core + one level -->
<script src="applesauce-core.js"></script>
<script src="level-simple.js"></script>

<!-- Full setup: All features -->
<script src="applesauce-core.js"></script>
<script src="applesauce-gore.js"></script>
<script src="applesauce-dialogue.js"></script>
<script src="applesauce-enemies.js"></script>
<script src="applesauce-objectives.js"></script>
```

## 🐛 Debugging

Access game instance in console:

```javascript
// In browser console:
window.game.state.score = 99999;
window.game.state.speed = 2;
window.game.modules.gore.clear();
window.game.modules.enemies.clear();
```

## 📝 Example: Level 2 in 5 Minutes

1. Copy `level-1-config.js` to `level-2-config.js`
2. Change name to "SKATEPARK CHAOS"
3. Remove the hill (set hillHeight to 0)
4. Add more funboxes and quarter pipes
5. Increase enemy count
6. Copy `level-template.html` to `level-2.html`
7. Update script tag to load `level-2-config.js`
8. Done!

## 🎯 Next Steps

- **Add more obstacle types** to `applesauce-core.js`
- **Create custom enemy behaviors** in `applesauce-enemies.js`
- **Add more trick types** to the core controls
- **Build level selector menu** that loads different configs
- **Add power-ups system** as a new module
- **Create save/load system** for progress tracking
