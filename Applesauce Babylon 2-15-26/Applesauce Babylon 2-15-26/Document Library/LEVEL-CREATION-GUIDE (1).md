# Quick Level Creation Guide

## To Create a New Level:

### 1. Copy the Template
```bash
cp level-01-desert.html level-XX-yourname.html
```

### 2. Update These Sections

#### A. Page Title & Body Class
```html
<title>APPLESAUCE - Level XX: Your Name</title>
<body class="terrain-yourtype">
```

**Available terrain classes:**
- `terrain-desert` - Sandy/orange
- `terrain-ice` - Blue/white
- `terrain-lava` - Red/black
- `terrain-graveyard` - Purple/dark
- `terrain-neon` - Cyan/purple

#### B. Title Screen
```html
<div id="title">
    <h1>APPLESAUCE</h1>
    <p>Level XX: Your Level Name</p>
    <p style="font-size: 16px; margin-top: 10px;">🎯 YOUR TAGLINE 🎯</p>
</div>
```

#### C. Level Config Object
```javascript
const levelXXConfig = {
    meta: {
        number: XX,
        name: "Your Level Name",
        description: "Brief description"
    },
    
    scene: {
        background: 0xCOLOR,
        fog: {
            color: 0xCOLOR,
            near: 100,
            far: 300
        }
    },
    
    terrain: {
        type: 'yourtype',
        hillHeight: 15,    // How tall hills are
        hillLength: 150,   // How long terrain sections are
        color: 0xCOLOR
    },
    
    playerStart: {
        x: 0,
        z: 10
    },
    
    obstacles: [
        // Add your obstacles here
    ],
    
    objectives: [
        // Add your objectives here
    ],
    
    onLevelStart: (game) => {
        // Spawn NPCs and enemies here
    }
};
```

---

## Obstacle Types

### Ramps
```javascript
{ 
    type: 'ramp', 
    x: 20, 
    z: 0, 
    width: 8,   // How wide
    height: 3   // How tall
}
```

### Rails
```javascript
{ 
    type: 'rail', 
    x: 40, 
    z: 0, 
    length: 10,     // How long
    color: 0x8B4513 // Optional
}
```

### Quarter Pipes
```javascript
{ 
    type: 'quarter', 
    x: 60, 
    z: 0, 
    width: 10, 
    height: 5 
}
```

### Half Pipes
```javascript
{ 
    type: 'halfpipe', 
    x: 80, 
    z: 0, 
    width: 12, 
    height: 6 
}
```

---

## Objective Types

### Score Target
```javascript
{
    id: 'score_10k',
    text: 'Score 10,000 points',
    type: 'score',
    target: 10000,
    completed: false
}
```

### Grind Target
```javascript
{
    id: 'grind_5',
    text: 'Grind 5 rails',
    type: 'grind',
    target: 5,
    completed: false
}
```

### Combo Target
```javascript
{
    id: 'combo_20',
    text: 'Get a 20x combo',
    type: 'combo',
    target: 20,
    completed: false
}
```

### Kill Target
```javascript
{
    id: 'kill_10',
    text: 'Eliminate 10 enemies',
    type: 'kill',
    target: 10,
    completed: false
}
```

---

## NPCs

```javascript
onLevelStart: (game) => {
    if (game.modules.dialogue) {
        game.modules.dialogue.createNPC({
            name: 'NPC Name',
            position: { x: 10, y: 0, z: 5 },
            color: 0xHEXCOLOR,
            interactRadius: 8,
            dialogue: [
                {
                    speaker: 'NPC Name',
                    text: 'First line of dialogue'
                },
                {
                    speaker: 'NPC Name',
                    text: 'Second line of dialogue'
                }
            ]
        });
    }
}
```

---

## Enemies

```javascript
onLevelStart: (game) => {
    if (game.modules.enemies) {
        game.modules.enemies.spawn({
            type: 'enemy',
            x: 30,
            z: 0,
            speed: 0.1,
            health: 1,
            color: 0xRED
        });
    }
}
```

---

## Color Palette

### Desert
- Background: `0xFFE4B5` (sandy beige)
- Fog: `0xF4A460` (sandy brown)
- Terrain: `0xDEB887` (burlywood)

### Ice
- Background: `0xE0F6FF` (light blue)
- Fog: `0x87CEEB` (sky blue)
- Terrain: `0xF0F8FF` (alice blue)

### Lava
- Background: `0x1a0000` (dark red)
- Fog: `0x330000` (darker red)
- Terrain: `0x8B0000` (dark red)

### Graveyard
- Background: `0x1a1a2e` (dark purple)
- Fog: `0x0f0f1e` (darker purple)
- Terrain: `0x2d2d44` (gray purple)

### Neon
- Background: `0x0a0015` (dark purple)
- Fog: `0x1a0030` (purple)
- Terrain: `0x1a1a2e` (dark blue)

---

## Testing Your Level

1. Open `index.html` in browser
2. Add your level to the menu:
```html
<button class="level-button" onclick="location.href='level-XX-yourname.html'">
    <span class="level-number">LEVEL XX</span>
    <span class="level-name">Your Name</span>
    <span class="level-desc">🎯 Description</span>
</button>
```
3. Click your level button
4. Test gameplay
5. Open browser console (F12) for debug info

---

## Debug Access

While level is running:
```javascript
// Access game engine
window.game

// Check modules
window.game.modules.dialogue
window.game.modules.enemies
window.game.modules.objectives

// Check state
window.game.state.score
window.game.state.combo
```

---

## Common Issues

### "Can't find module"
- Check file paths in imports
- Make sure all .js files are in the same folder

### "No terrain showing"
- Check terrain config in levelXXConfig
- Make sure terrain module is initialized

### "NPC/Enemy not spawning"
- Check if module exists: `if (game.modules.dialogue)`
- Check console for errors

### "Objectives not tracking"
- Make sure objectives module is initialized
- Check objective IDs are unique

---

## Pro Tips

1. **Start Simple** - Begin with basic terrain and a few obstacles
2. **Test Often** - Reload after each major change
3. **Use Console** - Check for errors in browser console (F12)
4. **Copy Examples** - Use level-01-desert.html as reference
5. **Unique IDs** - Give each objective a unique ID
6. **Color Scheme** - Match colors to your terrain theme

---

Happy level building! 🛹💀
