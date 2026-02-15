# APPLESAUCE CSS & Import Setup Guide

## Overview
This guide explains the new modular CSS structure and how to properly load scripts for APPLESAUCE levels.

---

## File Structure

```
applesauce-styles.css        → Main stylesheet (ALL UI styles)
level-template-updated.html  → Clean HTML template (no inline CSS)
applesauce-dialogue-updated.js → Updated dialogue module (no CSS creation)
```

---

## CSS Organization

### applesauce-styles.css Contains:

1. **Base Styles** - Reset and body styles
2. **HUD Elements** - Score, combo, trick display, speed, kills
3. **Controls Display** - Bottom-left control instructions
4. **Objectives Panel** - Top-right objectives tracker
5. **Title Screen** - Level intro splash screen
6. **Speech Bubble** - Dialogue display (right side)
7. **Interact Prompt** - "Press F" prompt (bottom center)
8. **Terrain Themes** - Background styles for different level types

---

## Using Terrain Themes

Add a class to the `<body>` tag in your HTML to apply a terrain theme:

### Available Themes:

```html
<!-- Desert -->
<body class="terrain-desert">

<!-- Ice -->
<body class="terrain-ice">

<!-- Lava -->
<body class="terrain-lava">

<!-- Graveyard -->
<body class="terrain-graveyard">

<!-- Neon City -->
<body class="terrain-neon">
```

### Adding New Terrain Themes:

Add to the bottom of `applesauce-styles.css`:

```css
/* YOUR THEME NAME */
.terrain-yourtheme body {
    background: linear-gradient(180deg, #color1 0%, #color2 100%);
}

/* You can also override HUD colors for specific themes */
.terrain-yourtheme #score {
    color: #CUSTOMCOLOR;
}
```

---

## Script Loading: Two Options

### Option 1: Traditional Scripts (Simpler)

If your modules are **NOT** ES modules, use regular script tags:

```html
<link rel="stylesheet" href="applesauce-styles.css">

<script src="three.js.r182/three.core.js"></script>
<script src="applesauce-core.js"></script>
<script src="applesauce-gore.js"></script>
<script src="applesauce-dialogue.js"></script>
<!-- etc... -->
```

**Important:** Use the non-module dialogue.js version (creates its own styles).

---

### Option 2: ES Modules (Recommended)

If using ES modules (like the updated dialogue.js):

```html
<link rel="stylesheet" href="applesauce-styles.css">

<script type="importmap">
    {
        "imports": {
            "three": "./three.js.r182/three.module.js"
        }
    }
</script>

<script type="module">
    import * as THREE from 'three';
    window.THREE = THREE; // Make available globally
    
    // Import ES modules
    import { ApplesauceDialogue } from './applesauce-dialogue-updated.js';
    
    // Load other scripts...
</script>
```

**Advantage:** Cleaner code, no duplicate CSS creation.

---

## Quick Start: Creating a New Level

1. **Copy the template:**
   ```
   cp level-template-updated.html level-XX.html
   ```

2. **Update the title:**
   ```html
   <title>APPLESAUCE - Level XX</title>
   <h1>APPLESAUCE</h1>
   <p>Level XX: Your Level Name</p>
   ```

3. **Choose a terrain theme:**
   ```html
   <body class="terrain-desert">
   ```

4. **Create your level config:**
   ```javascript
   const LevelXXConfig = {
       goreEnabled: true,
       terrain: {
           hillHeight: 15,
           hillLength: 150
       }
   };
   ```

5. **Build your level:**
   ```javascript
   function initLevelXX(game) {
       // Add ramps, rails, enemies, NPCs, etc.
   }
   ```

---

## Customizing Per Level

### Option A: Add to applesauce-styles.css

For permanent themes used across multiple levels:

```css
.terrain-custom body {
    background: #yourcolor;
}
```

### Option B: Inline Style in HTML

For one-off level-specific styling:

```html
<style>
    /* Level-specific overrides */
    #score {
        color: #CUSTOM;
    }
</style>
```

Put this AFTER the `<link rel="stylesheet">` so it overrides.

---

## Troubleshooting

### "Can't find THREE"
- Make sure Three.js loads BEFORE your game scripts
- Check the path to three.module.js is correct
- If using modules, use the importmap setup

### "Dialogue styles not working"
- Check that applesauce-styles.css is linked in HTML
- Clear browser cache
- Verify CSS file path is correct

### "Elements not showing"
- Check browser console for errors
- Verify all HTML elements are in the template
- Make sure z-index values aren't conflicting

---

## File Checklist

✅ applesauce-styles.css - Linked in HTML `<head>`
✅ level-template-updated.html - Clean template
✅ applesauce-dialogue-updated.js - No CSS creation
✅ Three.js loaded before game scripts
✅ Body class set for terrain theme (optional)

---

## Next Steps

1. Test the updated template
2. Create terrain-specific configs
3. Build out different level types with themes
4. Add custom terrain classes as needed

Good luck building! 🛹💀
