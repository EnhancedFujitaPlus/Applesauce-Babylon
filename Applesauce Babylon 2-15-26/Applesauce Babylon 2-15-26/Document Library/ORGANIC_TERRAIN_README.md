# APPLESAUCE Terrain System - Organic Flow Upgrade

## 🌊 What's New?

The terrain system now supports **organic, flowing terrain** like the Forest level! No more rigid chunks—get smooth, natural-looking hills using layered sine/cosine waves.

---

## 🎯 Two Modes Available

### 1. **SEGMENTED MODE** (Original)
- Chunk-based terrain (flat, hill, mountain, valley)
- Good for structured levels with specific sections
- **NEW:** Can now include `organic` chunks!

### 2. **PROCEDURAL MODE** (New!)
- Continuous, seamless terrain like the Forest level
- Uses layered noise for natural flow
- Perfect for exploration levels

---

## 🚀 Quick Start

### Pure Procedural Terrain (Forest Style)

```javascript
window.MyLevel = {
    terrain: {
        mode: 'procedural',
        size: 2000,
        resolution: 100,
        preset: 'rolling' // or 'gentle', 'mountainous', 'rough', 'flat_bumpy'
    }
};
```

### Segmented with Organic Chunks

```javascript
window.MyLevel = {
    terrain: {
        mode: 'segments',
        segments: [
            { type: 'flat', length: 100, height: 40, width: 200 },
            { type: 'hill', length: 150, startHeight: 40, endHeight: 0, width: 200 },
            
            // ⭐ NEW: Organic chunk!
            { 
                type: 'organic', 
                length: 300, 
                width: 200,
                preset: 'rolling'
            },
            
            { type: 'valley', length: 150, depth: -15, width: 200 }
        ]
    }
};
```

---

## 🎨 Noise Presets

Use these presets for quick terrain styles:

- **`gentle`** - Soft rolling hills, easy skating
- **`rolling`** - Medium hills, balanced gameplay (default)
- **`mountainous`** - Large dramatic peaks and valleys
- **`rough`** - Bumpy, challenging terrain
- **`flat_bumpy`** - Mostly flat with small bumps

---

## 🔧 Custom Noise Configuration

For full control, define your own noise:

```javascript
terrain: {
    mode: 'procedural',
    size: 2000,
    resolution: 100,
    
    noise: {
        // Large rolling hills (low frequency = big waves)
        freq1: 0.03,
        amp1: 6,
        
        // Medium variations
        freq2: 0.08,
        amp2: 3,
        
        // Small details
        freq3: 0.15,
        amp3: 1,
        
        // Diagonal flow patterns (creates organic look)
        freqDiag1: 0.05,
        ampDiag1: 4,
        freqDiag2: 0.05,
        ampDiag2: 3,
        
        // Optional: raise/lower entire terrain
        baseHeight: 0
    }
}
```

### Understanding Noise Parameters

**Frequency (freq):**
- Lower values (0.01-0.03) = Large, gentle hills
- Medium values (0.06-0.10) = Rolling terrain
- Higher values (0.15-0.20) = Small bumps and details

**Amplitude (amp):**
- Controls how tall the waves are
- Higher = more dramatic terrain
- Stack multiple layers for complexity

**Diagonal Patterns:**
- `freqDiag1` and `freqDiag2` create natural, flowing patterns
- These make terrain look organic instead of grid-like

---

## 📊 Resolution vs Performance

```javascript
resolution: 60   // Fast, lower quality
resolution: 100  // Balanced (RECOMMENDED)
resolution: 120  // High quality, good performance
resolution: 150+ // Beautiful but may slow down
```

Higher resolution = smoother terrain but more polygons.

---

## 🎮 Using Terrain Heights in Your Level

### Single Point Height

```javascript
const height = game.modules.terrain.getHeight(x, z);
```

### Multi-Point Sampling (Better for Player!)

```javascript
// Samples 5 points (center, front, back, left, right)
// Creates realistic board tilt on slopes
const height = game.modules.terrain.getPlayerHeight(
    playerX,
    playerZ,
    playerRotation,
    boardLength,  // optional, default 1.25
    boardWidth    // optional, default 0.4
);
```

The multi-point sampling is **recommended for player collision** because it:
- Makes the board tilt naturally on slopes
- Prevents "floating" on bumpy terrain
- Matches how a real skateboard contacts the ground

---

## 🎨 Visual Customization

```javascript
terrain: {
    mode: 'procedural',
    size: 2000,
    resolution: 100,
    
    // Visual settings
    color: 0x567D46,      // Grass green (hex color)
    roughness: 0.9,       // Surface roughness (0-1)
    metalness: 0.0,       // Metallic look (0-1)
    flatShading: false,   // Angular vs smooth shading
    castShadow: false     // Whether terrain casts shadows
}
```

---

## 🏔️ Terrain Type Reference

### Segmented Mode Types

```javascript
// Flat
{ type: 'flat', length: 100, height: 40, width: 200 }

// Hill (downhill or uphill)
{ type: 'hill', length: 200, startHeight: 60, endHeight: 0, width: 200 }

// Mountain (peak in center)
{ type: 'mountain', length: 180, peakHeight: 80, width: 200 }

// Valley (dip in center)
{ type: 'valley', length: 150, depth: -20, width: 200 }

// ⭐ NEW: Organic (procedural chunk)
{ 
    type: 'organic', 
    length: 300, 
    width: 200,
    preset: 'rolling' // or custom noise config
}
```

---

## 💡 Design Tips

### For Park/Street Levels
- Use mostly flat with organic chunks for natural flow
- `gentle` or `flat_bumpy` presets work well
- Lower amplitudes (2-4) for skateable terrain

### For Mountain Levels
- Use `mountainous` preset
- Higher amplitudes (8-12) for dramatic peaks
- Mix with traditional `mountain` chunks for variety

### For Forest/Wilderness
- Use pure procedural mode
- `rolling` preset is perfect
- Large size (2000-3000) for exploration

### For Racing Levels
- Use segmented mode for control
- Add organic chunks between checkpoints for variety
- Medium amplitudes (4-6) for challenge without frustration

---

## 🔄 Migration from Old Terrain

Your existing levels will work unchanged! The old chunk-based system is preserved.

To upgrade a level:

**Before:**
```javascript
terrain: {
    segments: [
        { type: 'flat', length: 100, height: 40, width: 200 },
        { type: 'hill', length: 200, startHeight: 40, endHeight: 0, width: 200 }
    ]
}
```

**After (Add organic flow):**
```javascript
terrain: {
    segments: [
        { type: 'flat', length: 100, height: 40, width: 200 },
        { type: 'organic', length: 300, width: 200, preset: 'rolling' }, // ⭐
        { type: 'hill', length: 200, startHeight: 40, endHeight: 0, width: 200 }
    ]
}
```

---

## 📦 Example Configs

See `organic-terrain-examples.js` for:
- Pure procedural forest level
- Hybrid park-to-wilderness level
- Custom desert dunes terrain
- And more!

---

## 🐛 Troubleshooting

**Terrain looks blocky:**
- Increase `resolution` value (try 120)
- Make sure `flatShading: false`

**Performance is slow:**
- Decrease `resolution` (try 80-90)
- Reduce terrain `size`
- Use LOD systems for distant terrain

**Player sinks into terrain:**
- Use `getPlayerHeight()` instead of `getHeight()`
- Check that player Y position is updated each frame

**Terrain is too bumpy:**
- Lower amplitude values
- Use `gentle` or `flat_bumpy` presets
- Reduce high-frequency layers (freq3, amp3)

**Terrain is too flat:**
- Increase amplitude values
- Use `mountainous` or `rough` presets
- Add more diagonal patterns

---

## 🎓 How It Works

The organic terrain uses **layered sine/cosine waves** at different frequencies:

```
height = 
    sin(x * 0.03) * 4      // Large hills (east-west)
  + cos(z * 0.03) * 4      // Large hills (north-south)
  + sin(x * 0.08) * 2      // Medium bumps
  + cos(z * 0.08) * 2      // Medium bumps
  + sin(x * 0.15) * 0.8    // Small details
  + cos(z * 0.15) * 0.8    // Small details
  + sin((x+z) * 0.05) * 3  // Diagonal flow 1
  + cos((x-z) * 0.05) * 2  // Diagonal flow 2
```

This creates **natural-looking terrain** that flows organically without seams!

---

## 🚀 Performance Notes

- Procedural mode has **no seams** = no loading between chunks
- Height calculations are **very fast** (just math operations)
- Geometry is generated **once** at level start
- Multi-point sampling adds minimal overhead

---

## 📚 See Also

- `applesauce-terrain-r182-organic.js` - The terrain module
- `organic-terrain-examples.js` - Full example configs
- `level_16.js` - Example level using the system

---

Happy skating! 🛹
