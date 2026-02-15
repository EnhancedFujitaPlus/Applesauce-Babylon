# APPLESAUCE Modular System - Quick Start Guide

## 🚀 What This Solves

**Before:** Every time you add a feature to Level 1, you have to manually copy it to Level 2, 3, 4...
**After:** Add a feature once to the core modules, ALL levels get it automatically!

## 📦 Files You Got

### Core Engine Files (edit these to add universal features)
- `applesauce-core.js` - Main game engine
- `applesauce-gore.js` - Blood & gibs system  
- `applesauce-dialogue.js` - NPC conversations
- `applesauce-enemies.js` - Enemy AI & collisions
- `applesauce-objectives.js` - Goal tracking

### Level Files (copy these to make new levels)
- `level-1-config.js` - Level 1 data
- `level-2-config.js` - Level 2 example
- `level-template.html` - Clean HTML template

### Documentation
- `README.md` - Full API documentation
- This file - Quick start guide

## ⚡ Get Started in 3 Steps

### Step 1: Test the Template

1. Open `level-template.html` in your browser
2. It loads Level 1 with all features working
3. All your existing features (gore, dialogue, objectives, boss) are there!

### Step 2: Make Level 2

```bash
# Just update level-template.html to load level-2-config.js instead:
```

Change this line:
```html
<script src="level-1-config.js"></script>
```

To:
```html
<script src="level-2-config.js"></script>
```

And change:
```javascript
initLevel1(game);
```

To:
```javascript
initLevel2(game);
```

**That's it!** Level 2 is now playable with a completely different layout.

### Step 3: Add a New Feature

Want to add a new trick? Just edit `applesauce-core.js`:

```javascript
// Find handleTrickInput() and add:
case 'n':
    trickName = 'NOLLIE!';
    this.state.attemptingKickflip = false;
    break;
```

Now EVERY level automatically has nollies!

## 💡 Common Tasks

### Create Level 3
```bash
cp level-2-config.js level-3-config.js
```

Then just edit the config values in `level-3-config.js`.

### Add More Enemy Types

Edit `applesauce-enemies.js` and add to the Enemy class:
```javascript
behavior: 'chase' // Add this as a new behavior option
```

All levels can now use chase behavior enemies!

### Add New Objective Type

Edit `applesauce-objectives.js`:
```javascript
addCollectObjective(count, description) {
    return this.add({
        id: 'collect',
        description: description,
        type: 'collect',
        target: count,
        checker: (engine) => {
            return engine.state.itemsCollected || 0;
        }
    });
}
```

Now all levels can track item collection!

### Remove Gore (for lighter builds)

Just don't load it:
```html
<!-- Comment out or delete: -->
<!-- <script src="applesauce-gore.js"></script> -->
```

And don't register it:
```javascript
// Comment out:
// game.registerModule('gore', new ApplesauceGore(game));
```

## 🎯 Your Current Features - Where They Are Now

| Feature | Old Location | New Location |
|---------|-------------|--------------|
| Player physics | Level_1.html (embedded) | `applesauce-core.js` |
| Blood particles | Level_1.html (embedded) | `applesauce-gore.js` |
| Gore effects | Level_1.html (embedded) | `applesauce-gore.js` |
| Dialogue system | Level_1.html (embedded) | `applesauce-dialogue.js` |
| NPC interactions | Level_1.html (embedded) | `applesauce-dialogue.js` |
| Enemy AI | Level_1.html (embedded) | `applesauce-enemies.js` |
| Boss fights | Level_1.html (embedded) | `applesauce-enemies.js` |
| Objectives tracking | Level_1.html (embedded) | `applesauce-objectives.js` |
| Level data | Level_1.html (embedded) | `level-N-config.js` |
| HTML/UI | Level_1.html (huge file) | `level-template.html` (clean) |

## 🔧 Migrating Your Existing Levels

### For Level 1:
1. Take your current `Level_1.html`
2. Extract all the level-specific data (obstacle positions, enemy spawns, NPC dialogue)
3. Put that data in `level-1-config.js` format
4. Use `level-template.html` as your new HTML file
5. Done! Same level, now modular

### For Other Levels:
1. Copy `level-1-config.js` to `level-N-config.js`
2. Change the level data
3. Copy `level-template.html` to `level-N.html`
4. Update to load `level-N-config.js`
5. That's it!

## 🎨 Customization Tips

### Want Different Physics Per Level?

Pass config to engine:
```javascript
const game = new ApplesauceCore({
    maxSpeed: 2.0,  // Faster level!
    hillHeight: 100 // Steeper hill!
});
```

### Want Level-Specific Features?

Add them in your `initLevelN()` function:
```javascript
function initLevel3(engine) {
    // Standard setup
    engine.createPlayer(0, 0);
    
    // Level 3 exclusive: RAIN EFFECT
    engine.rainParticles = createRainSystem();
    
    // Level 3 exclusive: TIME LIMIT
    engine.timeLimit = 180; // 3 minutes
}
```

### Want To Test Without All Features?

Minimal setup:
```html
<!-- Just core -->
<script src="applesauce-core.js"></script>
<script src="level-1-config.js"></script>
```

Full setup:
```html
<!-- Everything -->
<script src="applesauce-core.js"></script>
<script src="applesauce-gore.js"></script>
<script src="applesauce-dialogue.js"></script>
<script src="applesauce-enemies.js"></script>
<script src="applesauce-objectives.js"></script>
<script src="level-1-config.js"></script>
```

## 🎮 Next Steps

1. **Test it**: Open `level-template.html` and confirm it works
2. **Migrate Level 1**: Convert your current Level_1.html to use this system
3. **Create Level 2**: Use `level-2-config.js` as a starting point
4. **Add features**: When you add something to core modules, all levels benefit!

## 💪 Power-User Tips

### Debug Individual Modules

```javascript
// In browser console:
game.modules.gore.clear(); // Remove all gore
game.modules.enemies.clear(); // Remove all enemies
game.state.score = 99999; // Change score
```

### Hot-Reload Level Data

Change your config file, then in console:
```javascript
// Clear everything
game.modules.enemies.clear();
game.modules.gore.clear();

// Reload
initLevel1(game);
```

### Performance Profiling

```javascript
// Count active objects
console.log('Blood particles:', game.modules.gore.blood.length);
console.log('Gibs:', game.modules.gore.gibs.length);
console.log('Enemies:', game.modules.enemies.enemies.length);
```

## 🎯 The Big Picture

This modular system means:
- **Faster development**: Add features once, not per-level
- **Easier debugging**: Issues isolated to specific files
- **Better collaboration**: Artists can edit configs without touching engine code
- **Scalability**: 100 levels? Just 100 config files, one engine
- **Maintainability**: Fix a bug in gore? Fixed for ALL levels instantly

## 🚨 Migration Checklist

- [ ] Test `level-template.html` works
- [ ] Create `level-1-config.js` from your Level_1.html data
- [ ] Test Level 1 with new system
- [ ] Migrate other existing levels to config format
- [ ] Add new features to core modules
- [ ] Enjoy never copying code between levels again! 🎉

---

Questions? Check `README.md` for full API documentation.
