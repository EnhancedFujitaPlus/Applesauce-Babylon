# Adding Custom Skater to Wild West Level 🤠

## Quick Example

Here's how to give your Wild West level a themed skater!

### Option 1: Simple Color Change (Add to Level Config)

```javascript
export const HighNoonShowdown = {
    meta: {
        number: 3,
        name: "High Noon Showdown",
        description: "A dying town. A broken train. And something sinister afoot..."
    },
    
    // ADD THIS: Wild West themed skater colors
    skaterConfig: {
        deckColor: 0x8B4513,   // Brown wooden deck
        bodyColor: 0x654321,   // Cowboy duster brown
        skinColor: 0xC68642    // Sun-tanned skin
    },
    
    scene: {
        background: 0xD2691E,
        fog: {
            color: 0xD2691E,
            near: 50,
            far: 300
        }
    },
    
    playerStart: {
        x: -40,
        z: 0
    },
    
    // ... rest of your level config
}
```

### Option 2: Apply Colors In onLevelStart

```javascript
onLevelStart(core) {
    console.log('🤠 Welcome to High Noon Showdown');
    
    // Customize skater for Wild West theme
    if (core.modules.skater) {
        core.modules.skater.setDeckColor(0x8B4513);  // Brown wood
        core.modules.skater.setBodyColor(0x654321);  // Cowboy outfit
    }
    
    // ... rest of your level setup
}
```

### Option 3: Dynamic Color Changes During Gameplay

```javascript
// When train lever is pulled, make skater look villainous
function pullTrainLever(core) {
    core.wildwestLever.pulled = true;
    core.wildwestTrain.active = true;
    
    console.log('🚂 TRAIN STARTED!');
    
    // Change skater to villain colors!
    if (core.modules.skater) {
        core.modules.skater.setDeckColor(0x000000);  // Black deck (villain)
        core.modules.skater.setBodyColor(0x8B0000);  // Dark red (blood)
    }
    
    showLevelDialogue(core,
        "The Train Lever",
        "The train roars to life. The villagers scream. What have you done?"
    );
    
    completeObjective(core, 'start_train');
}
```

## Color Palette Recommendations

### Wild West Themes

```javascript
// Classic Cowboy
skaterConfig: {
    deckColor: 0x8B4513,   // Saddle brown
    bodyColor: 0x2F4F4F,   // Dark slate gray (duster)
    skinColor: 0xC68642    // Tanned
}

// Outlaw  
skaterConfig: {
    deckColor: 0x000000,   // Black
    bodyColor: 0x8B0000,   // Dark red
    skinColor: 0xC68642    // Tanned
}

// Sheriff
skaterConfig: {
    deckColor: 0x4169E1,   // Royal blue
    bodyColor: 0xB8860B,   // Dark goldenrod
    skinColor: 0xFFDBAC    // Light skin
}

// Desert Wanderer
skaterConfig: {
    deckColor: 0xD2B48C,   // Tan
    bodyColor: 0xF4A460,   // Sandy brown
    skinColor: 0x8B4513    // Sun-burnt
}
```

## Complete Integration Example

Here's a full Wild West level with skater theming:

```javascript
export const HighNoonShowdown = {
    meta: {
        number: 3,
        name: "High Noon Showdown"
    },
    
    // Wild West skater theme
    skaterConfig: {
        deckColor: 0x8B4513,   // Wooden deck
        bodyColor: 0x654321,   // Cowboy brown
        skinColor: 0xC68642    // Tanned
    },
    
    playerStart: {
        x: -40,
        z: 0
    },
    
    onLevelStart(core) {
        console.log('🤠 Welcome to High Noon Showdown');
        
        // Apply skater theme
        if (core.modules.skater) {
            // Already applied via skaterConfig!
            // But you can override here if needed
            console.log('🛹 Cowboy skater ready!');
        }
        
        // Create buildings
        core.wildwestBuildings = [];
        core.buildingsDiscovered = 0;
        
        this.buildings.forEach(building => {
            const buildingObj = createBuilding(core, building);
            core.wildwestBuildings.push({
                config: building,
                mesh: buildingObj,
                discovered: false
            });
        });
        
        // ... rest of level setup
    },
    
    onUpdate(core) {
        // Update dialogue
        if (core.modules.dialogue && core.modules.dialogue.update) {
            core.modules.dialogue.update(core);
        }
        
        // Skater animations update automatically!
        // (handled by core)
        
        // Building discovery
        if (core.wildwestBuildings) {
            core.wildwestBuildings.forEach((building, index) => {
                if (building.discovered) return;
                
                const playerPos = core.player.position;
                const dist = Math.sqrt(
                    Math.pow(playerPos.x - building.config.position.x, 2) + 
                    Math.pow(playerPos.z - building.config.position.z, 2)
                );
                
                if (dist < 10) {
                    building.discovered = true;
                    core.buildingsDiscovered++;
                    updateObjectiveProgress(core, 'explore_town', core.buildingsDiscovered);
                }
            });
        }
        
        // ... rest of update logic
    }
};
```

## HTML Loader (Updated)

Your `wildwest-level.html` needs to pass skater config to core:

```javascript
// In wildwest-level.html
async function startGame() {
    const startBtn = document.getElementById('start-btn');
    startBtn.disabled = true;
    startBtn.textContent = 'LOADING...';
    
    try {
        const ApplesauceCore = await loadModules();
        
        document.getElementById('title-screen').style.display = 'none';
        
        // Initialize core
        game = new ApplesauceCore({
            goreEnabled: true,
            dialogueEnabled: true,
            enemiesEnabled: true,
            objectivesEnabled: true,
            collisionEnabled: true,
            maxSpeed: 1.0,
            
            // ADD THIS: Apply level's skater config
            deckColor: levelConfig.skaterConfig?.deckColor,
            bodyColor: levelConfig.skaterConfig?.bodyColor,
            skinColor: levelConfig.skaterConfig?.skinColor
        });
        
        // Load level
        await game.loadLevel(levelConfig);
        
        // ... rest of setup
        
        game.start();
    } catch (error) {
        console.error('Failed to start game:', error);
    }
}
```

## Visual Comparison

### Default Skater
```
Deck:  0xFF1493 (Hot Pink)
Body:  0x333333 (Dark Gray)
Skin:  0xFFDBAC (Light)
Theme: Generic/Neon
```

### Wild West Skater
```
Deck:  0x8B4513 (Brown Wood)
Body:  0x654321 (Cowboy Brown)
Skin:  0xC68642 (Tanned)
Theme: Desert Cowboy
```

### Villain Skater (After Pulling Lever)
```
Deck:  0x000000 (Black)
Body:  0x8B0000 (Blood Red)
Skin:  0xC68642 (Tanned)
Theme: Outlaw/Villain
```

## Testing Colors

```javascript
// In browser console:

// Try different deck colors
game.modules.skater.setDeckColor(0xFF0000);  // Red
game.modules.skater.setDeckColor(0x00FF00);  // Green
game.modules.skater.setDeckColor(0x0000FF);  // Blue
game.modules.skater.setDeckColor(0xFFD700);  // Gold
game.modules.skater.setDeckColor(0x8B4513);  // Brown (Wild West)

// Try different body colors
game.modules.skater.setBodyColor(0x654321);  // Cowboy brown
game.modules.skater.setBodyColor(0x000000);  // Black outlaw
game.modules.skater.setBodyColor(0xFFFFFF);  // White sheriff
```

## Color Picker Tool

Use this HTML to find perfect colors:

```html
<!-- Add to your HTML for easy color picking -->
<div style="position: fixed; top: 10px; right: 10px; z-index: 1000; background: white; padding: 10px;">
    <label>Deck Color: <input type="color" id="deckColorPicker" value="#FF1493"></label><br>
    <label>Body Color: <input type="color" id="bodyColorPicker" value="#333333"></label><br>
    <button onclick="applyColors()">Apply</button>
</div>

<script>
function applyColors() {
    const deckColor = document.getElementById('deckColorPicker').value;
    const bodyColor = document.getElementById('bodyColorPicker').value;
    
    // Convert #RRGGBB to 0xRRGGBB
    const deckHex = parseInt(deckColor.slice(1), 16);
    const bodyHex = parseInt(bodyColor.slice(1), 16);
    
    game.modules.skater.setDeckColor(deckHex);
    game.modules.skater.setBodyColor(bodyHex);
    
    console.log(`deckColor: 0x${deckColor.slice(1).toUpperCase()}`);
    console.log(`bodyColor: 0x${bodyColor.slice(1).toUpperCase()}`);
}
</script>
```

## Summary

✅ **Three Ways to Set Colors:**
1. Add `skaterConfig` to level definition
2. Call `setDeckColor()`/`setBodyColor()` in `onLevelStart()`
3. Change colors dynamically during gameplay

✅ **Wild West Theme:**
- Brown wooden deck
- Cowboy outfit brown
- Sun-tanned skin
- Changes to villain colors when train lever pulled

✅ **Works With:**
- Your existing Wild West level
- Updated core
- Modular skater system

Your cowboy skater is ready to ride! 🤠🛹
