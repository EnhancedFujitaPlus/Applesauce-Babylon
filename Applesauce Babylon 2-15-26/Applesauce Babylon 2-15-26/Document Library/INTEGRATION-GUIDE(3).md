# BABYLON.JS INTEGRATION GUIDE
## For Existing APPLESAUCE Setup

Your errors were caused by trying to use Three.js modules when you need Babylon.js. Here's how to fix it:

---

## 📁 File Structure

```
applesauce/
├── index.html              (your menu)
├── game.html               ← REPLACE with game-babylon.html
├── levels/
│   ├── level_24.js         ← Example helmet combat level
│   ├── level_XX.js         (your other levels)
│   └── engine/
│       └── (your existing engine files)
```

---

## 🔧 Setup Steps

### Step 1: Replace game.html

**Old (Three.js):**
```html
<script type="module">
import * as THREE from 'three';  // ← This caused the error
</script>
```

**New (Babylon.js):**
```html
<!-- Load Babylon.js from CDN -->
<script src="https://cdn.babylonjs.com/babylon.js"></script>
<script src="https://cdn.babylonjs.com/havok/HavokPhysics_umd.js"></script>

<!-- Helmet system loaded as regular scripts (not modules) -->
<script>
class BabylonHelmetSystem { ... }
window.BabylonHelmetSystem = BabylonHelmetSystem;
</script>
```

**Action:**
1. Rename your current `game.html` to `game-threejs.html` (backup)
2. Rename `game-babylon.html` to `game.html`

---

### Step 2: Update Your Level Configs

Your level files should use the **window.Level24Config** format (non-module):

**CORRECT Format:**
```javascript
// levels/level_24.js
window.Level24Config = {
    meta: {
        name: "LEVEL 24 - HELMET FACTORY",
        // ...
    },
    
    async onLevelStart(game) {
        // Setup helmet system
        game.modules.helmets = new BabylonHelmetSystem(game.scene, game.player);
        game.modules.effects = new HelmetEffectsManager(game.scene);
        
        // Register helmets
        game.modules.helmets.registerHelmet({
            id: 'my_helmet',
            name: 'My Helmet',
            damage: 25,
            range: 3,
            // ...
        });
        
        // Equip to slots
        game.modules.helmets.equipToSlot('my_helmet', 0);
    },
    
    onUpdate(game) {
        // Update helmet system
        game.modules.helmets.update(game.getDeltaTime());
        
        // Check for attack input
        if (game.keys['j']) {
            game.modules.helmets.attack(game.enemies);
        }
    }
};
```

**WRONG Format (causes export error):**
```javascript
export const Level24Config = { ... }  // ❌ NO EXPORT!
```

---

### Step 3: Test It

1. Open `game.html?id=24`
2. You should see:
   - Babylon.js and Havok loading
   - Level 24 config loading
   - Game starting with helmet combat

**Controls:**
- W/A/S/D - Move
- SPACE - Jump
- J - Attack
- 1/2/3 - Switch helmets

---

## 🪖 Creating Custom Helmet Levels

### Minimal Template

```javascript
window.Level25Config = {
    meta: {
        name: "MY LEVEL",
        description: "Custom helmet level"
    },
    
    async onLevelStart(game) {
        // 1. Setup basic scene
        this.setupCamera(game);
        this.setupLighting(game);
        this.createGround(game);
        await this.createPlayer(game);
        
        // 2. Initialize helmet system
        game.modules.helmets = new BabylonHelmetSystem(game.scene, game.player);
        game.modules.effects = new HelmetEffectsManager(game.scene);
        game.modules.helmets.setEffectsManager(game.modules.effects);
        
        // 3. Register your helmets
        game.modules.helmets.registerHelmet({
            id: 'starter',
            name: 'Starter Helmet',
            damage: 30,
            range: 4,
            knockback: 2,
            cooldown: 30,
            element: null,  // or 'fire', 'ice', 'electric'
            color: '#FF0000'
        });
        
        // 4. Equip helmets
        game.modules.helmets.equipToSlot('starter', 0);
        
        // 5. Initialize enemies
        game.enemies = [];
        this.spawnEnemies(game);
    },
    
    setupCamera(game) {
        game.camera = new BABYLON.FollowCamera("cam", new BABYLON.Vector3(0, 10, -15), game.scene);
        game.camera.radius = 15;
        game.camera.heightOffset = 8;
        game.scene.activeCamera = game.camera;
    },
    
    setupLighting(game) {
        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), game.scene);
    },
    
    createGround(game) {
        const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 200, height: 200 }, game.scene);
        ground.material = new BABYLON.StandardMaterial("groundMat", game.scene);
        ground.material.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.3);
        
        new BABYLON.PhysicsAggregate(
            ground,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 0, friction: 0.8 },
            game.scene
        );
    },
    
    async createPlayer(game) {
        const box = BABYLON.MeshBuilder.CreateBox("player", { width: 1, height: 2, depth: 0.5 }, game.scene);
        box.position = new BABYLON.Vector3(0, 5, 0);
        box.material = new BABYLON.StandardMaterial("playerMat", game.scene);
        box.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        
        const aggregate = new BABYLON.PhysicsAggregate(
            box,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 70, restitution: 0.1, friction: 0.4 },
            game.scene
        );
        
        game.player = {
            collider: box,
            root: box,
            aggregate: aggregate,
            position: box.position
        };
        
        game.camera.lockedTarget = box;
    },
    
    spawnEnemies(game) {
        for (let i = 0; i < 5; i++) {
            const enemy = BABYLON.MeshBuilder.CreateBox("enemy", { width: 0.8, height: 1.8, depth: 0.5 }, game.scene);
            enemy.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 40,
                2,
                (Math.random() - 0.5) * 40
            );
            
            enemy.material = new BABYLON.StandardMaterial("enemyMat", game.scene);
            enemy.material.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1);
            
            const aggregate = new BABYLON.PhysicsAggregate(
                enemy,
                BABYLON.PhysicsShapeType.BOX,
                { mass: 70, restitution: 0.1, friction: 0.4 },
                game.scene
            );
            
            game.enemies.push({
                mesh: enemy,
                aggregate: aggregate,
                position: enemy.position,
                health: 75,
                isDead: false
            });
        }
    },
    
    onUpdate(game) {
        const deltaTime = game.getDeltaTime();
        
        // Update helmet system
        if (game.modules.helmets) {
            game.modules.helmets.update(deltaTime);
        }
        
        // Player controls
        if (game.player && game.player.aggregate) {
            const body = game.player.aggregate.body;
            const force = 50;
            
            if (game.keys['w']) body.applyForce(new BABYLON.Vector3(0, 0, force), game.player.position);
            if (game.keys['s']) body.applyForce(new BABYLON.Vector3(0, 0, -force), game.player.position);
            if (game.keys['a']) body.applyForce(new BABYLON.Vector3(-force, 0, 0), game.player.position);
            if (game.keys['d']) body.applyForce(new BABYLON.Vector3(force, 0, 0), game.player.position);
            
            if (game.keys[' '] && !this.jumpCooldown) {
                body.applyImpulse(new BABYLON.Vector3(0, 300, 0), game.player.position);
                this.jumpCooldown = true;
                setTimeout(() => this.jumpCooldown = false, 500);
            }
        }
        
        // Attack
        if (game.keys['j'] && game.modules.helmets) {
            const aliveEnemies = game.enemies.filter(e => !e.isDead);
            game.modules.helmets.attack(aliveEnemies);
        }
        
        // Switch helmets
        if (game.keys['1']) game.modules.helmets.switchToSlot(0);
        if (game.keys['2']) game.modules.helmets.switchToSlot(1);
        if (game.keys['3']) game.modules.helmets.switchToSlot(2);
    }
};
```

---

## 🎨 Helmet Properties Reference

```javascript
game.modules.helmets.registerHelmet({
    id: 'unique_id',           // Required - unique identifier
    name: 'Display Name',      // Required - shown in UI
    description: 'Text',       // Optional - flavor text
    
    // Combat stats
    damage: 25,                // Base damage
    range: 3,                  // Attack range (meters)
    knockback: 2,              // Knockback force
    cooldown: 30,              // Frames between attacks (~0.5 sec)
    comboMultiplier: 1.2,      // Damage scaling per combo hit
    
    // Element (affects particles)
    element: null,             // null, 'fire', 'ice', 'electric', 'gore'
    
    // Visual
    color: '#FF0000',          // Helmet color
    particleColor: '#FF4444', // Particle color (defaults to color)
    
    // Special ability (optional)
    special: (helmetSystem, results) => {
        // Custom code when this helmet hits
        console.log('Special ability!');
    }
});
```

---

## 🐛 Troubleshooting

### "Unexpected token 'export'"
**Problem:** Level file has `export const`  
**Solution:** Use `window.Level24Config = { ... }` instead

### "Failed to resolve module specifier 'three'"
**Problem:** Old Three.js references  
**Solution:** Use new game-babylon.html

### "BABYLON is not defined"
**Problem:** Babylon.js CDN didn't load  
**Solution:** Check internet connection, wait for scripts to load

### "HavokPhysics is not defined"
**Problem:** Havok didn't load  
**Solution:** Make sure both Babylon.js and Havok CDN scripts are loaded

### Helmet attacks not working
**Problem:** Enemies not in `game.enemies` array  
**Solution:** Make sure you're passing enemies to `attack(game.enemies)`

### Player not moving
**Problem:** Physics not initialized or no aggregate  
**Solution:** Check that Havok loaded and player has aggregate

---

## 📊 Game Object Structure

Your `game` object now has:

```javascript
game = {
    // Babylon.js
    engine: BABYLON.Engine,
    scene: BABYLON.Scene,
    havokPlugin: BABYLON.HavokPlugin,
    camera: BABYLON.FollowCamera,
    canvas: HTMLCanvasElement,
    
    // Game state
    state: {
        score: 0,
        combo: 0,
        speed: 0,
        kills: 0,
        isPlaying: true
    },
    
    // Input
    keys: {},  // game.keys['w'] = true/false
    
    // Player
    player: {
        collider: BABYLON.Mesh,
        root: BABYLON.Mesh,
        aggregate: BABYLON.PhysicsAggregate,
        position: BABYLON.Vector3
    },
    
    // Modules
    modules: {
        helmets: BabylonHelmetSystem,
        effects: HelmetEffectsManager
    },
    
    // Enemies
    enemies: [],  // Array of enemy objects
    
    // Level config
    levelConfig: window.Level24Config,
    
    // Methods
    start(),
    loadLevel(config),
    getDeltaTime()
};
```

---

## 🚀 Next Steps

1. **Test Level 24** - Run `game.html?id=24` to see helmet combat in action
2. **Create Custom Helmets** - Add more helmet types with different stats
3. **Build Your Levels** - Use the template above for levels 25, 26, etc.
4. **Add More Features** - Integrate with your existing music system, objectives, etc.

---

## 💡 Tips

- **Performance:** Keep max ~50 enemies for good framerates
- **Particles:** They auto-dispose, no manual cleanup needed
- **Combos:** Chain hits within 2 seconds for multiplier
- **Elements:** Each element has different particle behavior
- **Custom Abilities:** Use `special` function for unique effects

---

**Need help?** Check the full helmet combat README for advanced usage!
