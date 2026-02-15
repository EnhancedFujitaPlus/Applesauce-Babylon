# 🌌 SKYBOX SYSTEM - QUICK REFERENCE
## Treaty of the Watchtower / South of South Records

---

## INITIALIZATION

```javascript
const skybox = new ApplesauceSkybox(scene);
skybox.loadPreset('default');
```

---

## CORE METHODS

### Skybox Creation
```javascript
skybox.loadCubemap('/path/to/skybox')
skybox.createGradientSky('day')     // 'day', 'sunset', 'night', 'overcast'
skybox.createGradientSky('treaty_blood')  // Treaty modes
skybox.createGradientSky('treaty_void')
```

### Celestial Bodies
```javascript
skybox.createSun()
skybox.createMoon()
skybox.createStarfield('normal')    // 'sparse', 'normal', 'dense'
```

### Weather & Atmosphere
```javascript
skybox.setWeather('rain')           // 'clear', 'rain', 'storm', 'blood_rain'
skybox.createClouds(0.5)            // 0.0 - 1.0 coverage
skybox.enableFog(0.01, color)       // density, optional color
skybox.disableFog()
```

### Time Control
```javascript
skybox.setTime(12)                  // 0-24 hours
skybox.timeSpeed = 0.01             // Hour per second
skybox.paused = false               // Enable/disable auto-advance
```

### Presets
```javascript
skybox.loadPreset('default')        // Day sky with sun
skybox.loadPreset('night')          // Starry night with moon
skybox.loadPreset('sunset')         // Orange sky at dusk
skybox.loadPreset('storm')          // Overcast with rain
skybox.loadPreset('treaty_blood')   // Red horror sky
skybox.loadPreset('treaty_void')    // Black void with stars
```

### Update Loop
```javascript
skybox.update(deltaTime)            // Call every frame
```

### Cleanup
```javascript
skybox.dispose()                    // Remove all elements
```

---

## PROPERTIES

```javascript
skybox.timeOfDay        // 0-24 (float)
skybox.timeSpeed        // Time progression rate
skybox.paused           // boolean
skybox.weather          // Current weather string
skybox.currentPreset    // Current preset name
skybox.currentSkybox    // Main skybox mesh
skybox.starfield        // Starfield mesh
skybox.sun              // Sun mesh
skybox.moon             // Moon mesh
skybox.clouds           // Array of cloud meshes
skybox.weatherParticles // Current weather particle system
```

---

## KEYBOARD SHORTCUTS (Example Integration)

```javascript
window.addEventListener('keydown', (e) => {
    // Time
    if (e.key === '1') skybox.setTime(6);   // Dawn
    if (e.key === '2') skybox.setTime(12);  // Noon
    if (e.key === '3') skybox.setTime(18);  // Dusk
    if (e.key === '4') skybox.setTime(0);   // Midnight
    if (e.key === 't') skybox.paused = !skybox.paused;
    
    // Weather
    if (e.key === '5') skybox.setWeather('clear');
    if (e.key === '6') skybox.setWeather('rain');
    if (e.key === '7') skybox.setWeather('storm');
    if (e.key === '8') skybox.setWeather('blood_rain');
});
```

---

## COMMON PATTERNS

### Basic Day/Night Cycle
```javascript
skybox.createGradientSky('day');
skybox.createSun();
skybox.createMoon();
skybox.createStarfield();
skybox.timeSpeed = 0.01;
skybox.paused = false;
```

### Static Weather Scene
```javascript
skybox.loadPreset('storm');
skybox.paused = true;  // Freeze time
```

### Biome-Reactive Sky
```javascript
const biome = terrain.getBiomeAtPosition(player.x, player.z);
if (biome === 'mountain') {
    skybox.loadPreset('storm');
} else if (biome === 'meadow') {
    skybox.loadPreset('default');
}
```

### Treaty Horror Mode
```javascript
skybox.loadPreset('treaty_blood');
// or
skybox.loadPreset('treaty_void');
```

---

## GRADIENT SKY MODES

| Mode | Top Color | Middle Color | Bottom Color | Use Case |
|------|-----------|--------------|--------------|----------|
| day | Light blue | Sky blue | White | Default daytime |
| sunset | Orange | Orange-yellow | Yellow | Dusk/dawn |
| night | Dark blue | Navy | Purple | Nighttime |
| overcast | Gray | Light gray | White | Cloudy/storm |
| treaty_blood | Dark red | Blood red | Bright red | Horror |
| treaty_void | Black | Dark gray | Gray | Cosmic horror |

---

## WEATHER EFFECTS

| Type | Particles | Fog | Fog Density | Use Case |
|------|-----------|-----|-------------|----------|
| clear | None | No | - | Normal |
| rain | 3000 blue | Yes | 0.008 | Light rain |
| storm | 3000 blue | Yes | 0.015 | Heavy rain |
| blood_rain | 2000 red | Yes | 0.012 | Horror |

---

## PERFORMANCE TIPS

**Mobile Optimization:**
```javascript
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

if (isMobile) {
    // Reduce particle count
    const particleCount = 1000;
    
    // Fewer clouds
    skybox.createClouds(0.2);
    
    // Lower texture resolution
    const textureSize = 256;
}
```

**LOD for Clouds:**
```javascript
// Only create clouds when close
const distanceToPlayer = camera.position.length();
if (distanceToPlayer < 100 && !skybox.clouds) {
    skybox.createClouds(0.3);
} else if (distanceToPlayer >= 100 && skybox.clouds) {
    skybox.clouds.forEach(c => c.dispose());
    skybox.clouds = null;
}
```

---

## CUSTOMIZATION EXAMPLES

### Custom Gradient
```javascript
// In createGradientSky(), add to gradients object:
cyberpunk: { 
    top: '#FF00FF',    // Magenta
    middle: '#00FFFF', // Cyan
    bottom: '#000033'  // Dark blue
}

// Use it:
skybox.createGradientSky('cyberpunk');
```

### Custom Weather
```javascript
// Add to setWeather() switch statement:
case 'snow':
    this.createSnow();  // Your custom function
    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.01;
    break;
```

### Custom Preset
```javascript
// Add to loadPreset() switch statement:
case 'desert':
    this.createGradientSky('sunset');
    this.createSun();
    // No clouds
    this.setWeather('clear');
    this.setTime(16);
    break;
```

---

## INTEGRATION WITH APPLESAUCE

```javascript
// In game init
const skybox = new ApplesauceSkybox(scene);
skybox.loadPreset('default');

// In render loop
engine.runRenderLoop(() => {
    const deltaTime = Date.now() - lastTime;
    
    // Update skybox
    skybox.update(deltaTime);
    
    // React to biome changes
    const currentBiome = terrain.getBiomeAtPosition(
        player.position.x, 
        player.position.z
    );
    
    if (currentBiome !== lastBiome) {
        // Transition sky based on biome
        if (currentBiome === 'mountain') {
            skybox.loadPreset('storm');
        }
        lastBiome = currentBiome;
    }
    
    // Render
    scene.render();
});
```

---

## TROUBLESHOOTING

**Skybox not visible?**
- Check `infiniteDistance = true`
- Verify `backFaceCulling = false` on material

**Time not advancing?**
- Check `skybox.paused === false`
- Verify `skybox.update(deltaTime)` is called

**Particles not showing?**
- Check particle system `.start()` was called
- Verify emitter position is above camera

**Performance issues?**
- Reduce particle counts
- Decrease cloud coverage
- Lower texture resolution

---

## FILES

- `applesauce-skybox-enhanced.js` - Full class (export version)
- `full-integration-demo.html` - Working example with terrain
- `SKYBOX-SYSTEM-DOCS.md` - Complete documentation
- `SKYBOX-QUICK-REF.md` - This file

---

🌌 **Built for Treaty of the Watchtower**
🛹 **Skate through infinite atmospheres**
