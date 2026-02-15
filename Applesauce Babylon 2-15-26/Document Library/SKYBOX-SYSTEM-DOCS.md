# 🌌 APPLESAUCE SKYBOX SYSTEM DOCUMENTATION
## Treaty of the Watchtower / South of South Records

---

## TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Integration Guide](#integration-guide)
3. [Skybox Types](#skybox-types)
4. [Day/Night Cycle](#daynight-cycle)
5. [Weather System](#weather-system)
6. [Presets](#presets)
7. [Customization](#customization)
8. [Treaty Aesthetic Modes](#treaty-aesthetic-modes)
9. [Performance Tips](#performance-tips)
10. [Advanced Features](#advanced-features)

---

## SYSTEM OVERVIEW

The ApplesauceSkybox system provides:

- **Multiple Skybox Types**: Cubemaps, procedural gradients, starfields
- **Day/Night Cycle**: Automatic time progression with sun/moon
- **Weather Effects**: Rain, storms, fog, blood rain (Treaty mode)
- **Atmospheric Effects**: Fog, clouds, particle systems
- **Presets**: Quick-load complete sky configurations
- **Biome Integration**: Sky can react to player's biome location

**Key Features:**
- ✅ Fully self-contained class
- ✅ Minimal dependencies (just Babylon.js core)
- ✅ Easy integration with existing projects
- ✅ Customizable presets for different aesthetics
- ✅ Performance-optimized particle systems

---

## INTEGRATION GUIDE

### Basic Setup

```javascript
// 1. Import or include the class
import { ApplesauceSkybox } from './applesauce-skybox-enhanced.js';

// 2. Create instance after scene is ready
const skybox = new ApplesauceSkybox(scene);

// 3. Load a preset
skybox.loadPreset('default');

// 4. Update in render loop
engine.runRenderLoop(() => {
    const deltaTime = Date.now() - lastTime;
    skybox.update(deltaTime);
    scene.render();
});
```

### With Existing Terrain System

```javascript
// After terrain is generated
const terrain = new TerrainSystem(scene, config);
terrain.generate('procedural');

// Create skybox
const skybox = new ApplesauceSkybox(scene);

// Match skybox to biome
const biome = terrain.getBiomeAtPosition(player.position.x, player.position.z);
if (biome === 'mountain') {
    skybox.loadPreset('storm');
} else if (biome === 'meadow') {
    skybox.loadPreset('default');
}
```

---

## SKYBOX TYPES

### 1. Cubemap Skybox

Traditional 6-sided box with images.

```javascript
skybox.loadCubemap('/path/to/skybox');
```

**Required files:**
- skybox_px.jpg (positive X)
- skybox_nx.jpg (negative X)
- skybox_py.jpg (positive Y)
- skybox_ny.jpg (negative Y)
- skybox_pz.jpg (positive Z)
- skybox_nz.jpg (negative Z)

**When to use:**
- High-quality realistic skies
- 360° panoramic images
- Static sky backgrounds

### 2. Gradient Sky

Procedurally generated color gradients.

```javascript
skybox.createGradientSky('day');
```

**Available modes:**
- `'day'` - Blue sky
- `'sunset'` - Orange/pink gradient
- `'night'` - Dark blue to purple
- `'overcast'` - Gray clouds
- `'treaty_blood'` - Red horror aesthetic
- `'treaty_void'` - Pure black void

**When to use:**
- Stylized aesthetics
- Low memory footprint
- Easy to customize colors
- Treaty-specific moods

### 3. Starfield

Procedural stars for night skies.

```javascript
skybox.createStarfield('normal');
```

**Density options:**
- `'sparse'` - Few stars, distant
- `'normal'` - Balanced
- `'dense'` - Packed starfield

**Features:**
- Automatically fades in/out based on time
- Rotates slowly for subtle movement
- Works with or without main skybox

---

## DAY/NIGHT CYCLE

### Time System

Time is represented as 0-24 hours (float).

```javascript
// Set specific time
skybox.setTime(12);  // Noon
skybox.setTime(18);  // 6 PM
skybox.setTime(0);   // Midnight

// Advance time automatically
skybox.timeSpeed = 0.01;  // 0.01 hour per second
skybox.paused = false;    // Enable auto-advance

// Pause/resume
skybox.paused = true;
```

### Celestial Bodies

**Sun:**
```javascript
skybox.createSun();
// Automatically positioned based on time
// Visible during day (6 AM - 6 PM)
```

**Moon:**
```javascript
skybox.createMoon();
// Automatically positioned opposite sun
// Visible during night
```

### How Time Affects Scene

| Time | Sun/Moon | Starfield | Ambient Light |
|------|----------|-----------|---------------|
| 0-6  | Moon | Visible (fading) | 0.15 → 0.6 |
| 6-18 | Sun | Hidden | 0.6 (day) |
| 18-24 | Moon | Visible (fading in) | 0.6 → 0.15 |

### Lighting Integration

```javascript
updateLightingForTime() {
    const hour = this.timeOfDay % 24;
    
    // Adjust directional light
    if (directionalLight) {
        const intensity = hour >= 6 && hour <= 18 ? 0.8 : 0.2;
        directionalLight.intensity = intensity;
    }
    
    // Update fog color for time of day
    if (hour >= 6 && hour <= 18) {
        scene.fogColor = new BABYLON.Color3(0.8, 0.8, 0.9); // Day
    } else {
        scene.fogColor = new BABYLON.Color3(0.1, 0.1, 0.2); // Night
    }
}
```

---

## WEATHER SYSTEM

### Available Weather Types

**Clear:**
```javascript
skybox.setWeather('clear');
// No particles, no fog
```

**Rain:**
```javascript
skybox.setWeather('rain');
// 3000 rain particles
// Light fog (density: 0.008)
// Gray fog color
```

**Storm:**
```javascript
skybox.setWeather('storm');
// Heavy rain
// Dense fog (density: 0.015)
// Dark sky
```

**Blood Rain (Treaty Mode):**
```javascript
skybox.setWeather('blood_rain');
// Red particles
// Red fog
// Horror aesthetic
```

### Custom Weather

Create your own weather effect:

```javascript
createSnow() {
    const snow = new BABYLON.ParticleSystem("snow", 2000, this.scene);
    
    snow.emitter = new BABYLON.Vector3(0, 50, 0);
    snow.minEmitBox = new BABYLON.Vector3(-80, 0, -80);
    snow.maxEmitBox = new BABYLON.Vector3(80, 0, 80);
    
    snow.minSize = 0.3;
    snow.maxSize = 0.8;
    
    snow.minLifeTime = 3;
    snow.maxLifeTime = 6;
    
    snow.emitRate = 300;
    
    // Slow falling, slight drift
    snow.direction1 = new BABYLON.Vector3(-1, -2, -1);
    snow.direction2 = new BABYLON.Vector3(1, -3, 1);
    
    snow.gravity = new BABYLON.Vector3(0, -2, 0);
    
    snow.color1 = new BABYLON.Color4(1, 1, 1, 1);
    snow.color2 = new BABYLON.Color4(0.9, 0.9, 0.9, 1);
    
    snow.start();
    this.weatherParticles = snow;
    
    // Add fog
    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.01;
    this.scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.95);
}
```

### Clouds

```javascript
skybox.createClouds(0.5);
// coverage: 0.0 - 1.0 (50% coverage)

// Clouds automatically:
// - Follow camera (infinite distance)
// - Rotate slowly
// - Made of multiple sphere "puffs"
```

**Customize cloud appearance:**
```javascript
createCustomCloud() {
    const cloudGroup = new BABYLON.Mesh("cloud", this.scene);
    
    const cloudMat = new BABYLON.StandardMaterial("cloudMat", this.scene);
    cloudMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Dark storm clouds
    cloudMat.alpha = 0.8;
    
    // Create more puffs for denser clouds
    for (let i = 0; i < 8; i++) {
        const puff = BABYLON.MeshBuilder.CreateSphere(`puff${i}`, {
            diameter: 12 + Math.random() * 15,
            segments: 8
        }, this.scene);
        
        puff.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 25
        );
        
        puff.material = cloudMat;
        puff.parent = cloudGroup;
    }
    
    return cloudGroup;
}
```

---

## PRESETS

Presets combine skybox type, time, weather, and celestial bodies.

### Available Presets

**1. Default**
```javascript
skybox.loadPreset('default');
// - Day sky (blue gradient)
// - Sun
// - Scattered clouds
// - Time: 12:00 (noon)
// - Auto time cycle enabled
```

**2. Night**
```javascript
skybox.loadPreset('night');
// - Dark blue night sky
// - Starfield (normal density)
// - Moon
// - Time: 00:00 (midnight)
```

**3. Sunset**
```javascript
skybox.loadPreset('sunset');
// - Orange/pink gradient
// - Sun at horizon
// - More clouds
// - Time: 18:00 (6 PM)
// - Slower time cycle
```

**4. Storm**
```javascript
skybox.loadPreset('storm');
// - Overcast gray sky
// - Dense clouds
// - Storm weather (rain + fog)
// - Time: 14:00 (fixed)
```

**5. Treaty Blood**
```javascript
skybox.loadPreset('treaty_blood');
// - Red/crimson gradient
// - Sparse stars
// - Blood rain weather
// - Time: midnight (fixed)
// - Horror aesthetic
```

**6. Treaty Void**
```javascript
skybox.loadPreset('treaty_void');
// - Pure black gradient
// - Dense starfield
// - No weather
// - Cosmic horror vibe
```

### Creating Custom Presets

```javascript
loadPreset(presetName) {
    switch (presetName) {
        case 'my_custom_preset':
            this.createGradientSky('day');
            this.createStarfield('dense');
            this.createSun();
            this.createMoon();
            this.createClouds(0.7);
            this.setWeather('rain');
            this.setTime(15);
            this.timeSpeed = 0.02; // Faster time
            break;
            
        case 'desert_sunset':
            // Yellow/orange sky
            this.createGradientSky('sunset');
            this.createSun();
            // No clouds (desert)
            this.setWeather('clear');
            // Add heat haze fog
            this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
            this.scene.fogStart = 50;
            this.scene.fogEnd = 200;
            this.scene.fogColor = new BABYLON.Color3(1, 0.9, 0.7);
            this.setTime(17);
            break;
    }
}
```

---

## CUSTOMIZATION

### Custom Gradient Colors

Edit the gradient colors in `createGradientSky()`:

```javascript
const gradients = {
    // Your custom gradient
    cyberpunk: { 
        top: '#FF00FF',    // Magenta
        middle: '#00FFFF', // Cyan
        bottom: '#000033'  // Dark blue
    },
    
    toxic: {
        top: '#AAFF00',    // Acid green
        middle: '#66CC00',
        bottom: '#003300'
    },
    
    hellscape: {
        top: '#330000',    // Dark red
        middle: '#660000',
        bottom: '#FF6600'  // Orange flames
    }
};
```

### Custom Sun/Moon Appearance

```javascript
createBlackHoleSun() {
    const sun = BABYLON.MeshBuilder.CreateSphere("blackHole", { 
        diameter: 80, 
        segments: 32 
    }, this.scene);
    
    const sunMat = new BABYLON.StandardMaterial("blackHoleMat", this.scene);
    sunMat.emissiveColor = new BABYLON.Color3(0.8, 0, 1); // Purple
    sunMat.disableLighting = true;
    
    // Add event horizon ring
    const ring = BABYLON.MeshBuilder.CreateTorus("horizon", {
        diameter: 100,
        thickness: 2,
        tessellation: 32
    }, this.scene);
    ring.parent = sun;
    ring.rotation.x = Math.PI / 2;
    
    const ringMat = new BABYLON.StandardMaterial("ringMat", this.scene);
    ringMat.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
    ring.material = ringMat;
    
    sun.material = sunMat;
    sun.infiniteDistance = true;
    
    this.sun = sun;
}
```

### Biome-Reactive Skies

```javascript
updateSkyForBiome(biome) {
    switch(biome) {
        case 'meadow':
            this.loadPreset('default');
            break;
            
        case 'forest':
            this.createGradientSky('day');
            this.createClouds(0.6); // More clouds in forest
            this.setWeather('clear');
            break;
            
        case 'mountain':
            this.createGradientSky('overcast');
            this.createClouds(0.9);
            this.setWeather('fog');
            break;
            
        case 'desert':
            this.createGradientSky('sunset');
            // No clouds
            this.setWeather('clear');
            // Heat haze
            this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
            this.scene.fogStart = 80;
            this.scene.fogEnd = 250;
            break;
    }
}
```

---

## TREATY AESTHETIC MODES

### Blood Rain Mode

Perfect for horror/gore levels:

```javascript
skybox.loadPreset('treaty_blood');

// Features:
// - Deep red sky gradient
// - Sparse starfield (cosmic horror)
// - Red particle rain
// - Red fog atmosphere
// - Fixed at midnight
```

**Customize blood intensity:**
```javascript
createHeavyBloodRain() {
    const bloodRain = new BABYLON.ParticleSystem("heavyBlood", 5000, this.scene);
    
    // Thicker, slower droplets
    bloodRain.minSize = 0.4;
    bloodRain.maxSize = 0.8;
    
    bloodRain.emitRate = 1000; // More particles
    
    // Blood color variations
    bloodRain.color1 = new BABYLON.Color4(0.9, 0.0, 0.0, 1);  // Bright
    bloodRain.color2 = new BABYLON.Color4(0.3, 0.0, 0.0, 1);  // Dark
    
    bloodRain.start();
}
```

### Void Mode

Cosmic horror / empty space:

```javascript
skybox.loadPreset('treaty_void');

// Features:
// - Pure black sky
// - Dense starfield
// - No weather
// - Oppressive emptiness
```

**Add cosmic anomalies:**
```javascript
createCosmicRift() {
    // Create swirling portal
    const rift = BABYLON.MeshBuilder.CreateTorus("rift", {
        diameter: 100,
        thickness: 10,
        tessellation: 64
    }, this.scene);
    
    const riftMat = new BABYLON.StandardMaterial("riftMat", this.scene);
    riftMat.emissiveColor = new BABYLON.Color3(0.5, 0, 1);
    riftMat.alpha = 0.6;
    rift.material = riftMat;
    
    // Position in sky
    rift.position = new BABYLON.Vector3(300, 400, 200);
    rift.infiniteDistance = true;
    
    // Rotate continuously
    scene.registerBeforeRender(() => {
        rift.rotation.z += 0.01;
    });
}
```

### Skateboard Gore Integration

Combine with APPLESAUCE destruction:

```javascript
// When player destroys something
onGoreEvent(position, intensity) {
    // Intensify blood rain temporarily
    if (skybox.weather === 'blood_rain' && skybox.weatherParticles) {
        const originalRate = skybox.weatherParticles.emitRate;
        skybox.weatherParticles.emitRate = originalRate * (1 + intensity);
        
        setTimeout(() => {
            skybox.weatherParticles.emitRate = originalRate;
        }, 2000);
    }
    
    // Darken sky slightly
    if (skybox.currentSkybox) {
        skybox.currentSkybox.material.alpha = 0.8;
        setTimeout(() => {
            skybox.currentSkybox.material.alpha = 1.0;
        }, 1000);
    }
}
```

---

## PERFORMANCE TIPS

### Optimization Strategies

**1. Particle System Limits**
```javascript
// Reduce particle count for mobile
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
const rainCount = isMobile ? 1000 : 3000;

const rain = new BABYLON.ParticleSystem("rain", rainCount, scene);
```

**2. Cloud LOD**
```javascript
// Fewer cloud puffs at distance
createOptimizedClouds() {
    const cloudCount = 10; // Reduced from 20
    for (let i = 0; i < cloudCount; i++) {
        const puffCount = 3; // Reduced from 5
        // ... create cloud with fewer puffs
    }
}
```

**3. Conditional Features**
```javascript
// Only add starfield at night
if (this.timeOfDay < 6 || this.timeOfDay > 18) {
    if (!this.starfield) {
        this.createStarfield();
    }
} else {
    if (this.starfield) {
        this.starfield.dispose();
        this.starfield = null;
    }
}
```

**4. Texture Resolution**
```javascript
// Lower res for gradient textures
const textureSize = 256; // Instead of 512
const dynamicTexture = new BABYLON.DynamicTexture("skyGradient", textureSize, scene);
```

### Performance Monitoring

```javascript
// Check FPS and adjust
scene.registerBeforeRender(() => {
    const fps = engine.getFps();
    
    if (fps < 30) {
        // Reduce effects
        if (skybox.weatherParticles) {
            skybox.weatherParticles.emitRate *= 0.8;
        }
        if (skybox.clouds && skybox.clouds.length > 10) {
            // Remove some clouds
            const removed = skybox.clouds.pop();
            removed.dispose();
        }
    }
});
```

---

## ADVANCED FEATURES

### Dynamic Fog Distance

Fog that changes based on biome/weather:

```javascript
updateFogForBiome(biome, weather) {
    if (weather === 'storm') {
        scene.fogDensity = 0.02;
    } else if (biome === 'mountain') {
        scene.fogDensity = 0.01;
    } else if (biome === 'meadow') {
        scene.fogDensity = 0.005;
    } else {
        scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
    }
}
```

### Lightning Flashes (Storm)

```javascript
createLightning() {
    const lightning = new BABYLON.PointLight("lightning", 
        new BABYLON.Vector3(0, 100, 0), this.scene);
    lightning.intensity = 0;
    lightning.diffuse = new BABYLON.Color3(0.8, 0.8, 1);
    
    // Random flashes
    setInterval(() => {
        if (this.weather === 'storm' && Math.random() < 0.1) {
            lightning.intensity = 10;
            setTimeout(() => {
                lightning.intensity = 0;
            }, 100);
        }
    }, 1000);
}
```

### Aurora Borealis

```javascript
createAurora() {
    const aurora = BABYLON.MeshBuilder.CreatePlane("aurora", {
        width: 500,
        height: 100
    }, this.scene);
    
    aurora.position = new BABYLON.Vector3(0, 200, 400);
    aurora.rotation.x = -Math.PI / 4;
    
    const auroraMat = new BABYLON.StandardMaterial("auroraMat", this.scene);
    auroraMat.emissiveColor = new BABYLON.Color3(0, 1, 0.5);
    auroraMat.alpha = 0.3;
    auroraMat.disableLighting = true;
    
    aurora.material = auroraMat;
    aurora.infiniteDistance = true;
    
    // Animate waves
    scene.registerBeforeRender(() => {
        const time = Date.now() * 0.001;
        auroraMat.emissiveColor = new BABYLON.Color3(
            0.5 + Math.sin(time) * 0.5,
            1,
            0.5 + Math.cos(time * 1.3) * 0.5
        );
    });
}
```

### Skybox Transitions

Smooth fade between presets:

```javascript
transitionToPreset(newPreset, duration = 2000) {
    const oldSkybox = this.currentSkybox;
    
    // Load new preset
    this.loadPreset(newPreset);
    const newSkybox = this.currentSkybox;
    
    // Fade transition
    if (oldSkybox && newSkybox) {
        newSkybox.material.alpha = 0;
        
        const startTime = Date.now();
        const fadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            newSkybox.material.alpha = progress;
            oldSkybox.material.alpha = 1 - progress;
            
            if (progress >= 1) {
                clearInterval(fadeInterval);
                oldSkybox.dispose();
            }
        }, 16);
    }
}
```

---

## USAGE EXAMPLES

### Complete Integration Example

```javascript
// Initialize
const scene = new BABYLON.Scene(engine);
const skybox = new ApplesauceSkybox(scene);
const terrain = new TerrainSystem(scene, config);

// Setup default sky
skybox.loadPreset('default');

// React to player location
scene.registerBeforeRender(() => {
    const biome = terrain.getBiomeAtPosition(
        player.position.x, 
        player.position.z
    );
    
    // Change sky when entering new biome
    if (biome !== currentBiome) {
        currentBiome = biome;
        
        if (biome === 'mountain') {
            skybox.transitionToPreset('storm', 3000);
        } else if (biome === 'meadow') {
            skybox.transitionToPreset('default', 3000);
        }
    }
});

// Update in render loop
engine.runRenderLoop(() => {
    const deltaTime = Date.now() - lastTime;
    skybox.update(deltaTime);
    scene.render();
});
```

### Input Controls Example

```javascript
window.addEventListener('keydown', (e) => {
    // Time controls
    if (e.key === '1') skybox.setTime(6);   // Dawn
    if (e.key === '2') skybox.setTime(12);  // Noon
    if (e.key === '3') skybox.setTime(18);  // Dusk
    if (e.key === '4') skybox.setTime(0);   // Midnight
    if (e.key === 't') skybox.paused = !skybox.paused;
    
    // Weather controls
    if (e.key === '5') skybox.setWeather('clear');
    if (e.key === '6') skybox.setWeather('rain');
    if (e.key === '7') skybox.setWeather('storm');
    if (e.key === '8') skybox.setWeather('blood_rain');
    
    // Preset controls
    if (e.key === 'p') {
        const presets = ['default', 'night', 'sunset', 'storm', 
                        'treaty_blood', 'treaty_void'];
        const current = presets.indexOf(skybox.currentPreset);
        const next = (current + 1) % presets.length;
        skybox.loadPreset(presets[next]);
    }
});
```

---

## TROUBLESHOOTING

### Common Issues

**Skybox not visible:**
- Check `infiniteDistance = true` is set
- Verify camera is inside skybox
- Check material alpha (should be 1.0)

**Starfield not fading:**
- Ensure starfield material alpha starts at 0
- Check `updateLighting()` is being called
- Verify time is advancing

**Weather particles not appearing:**
- Check particle emitter position
- Verify particle system is started
- Ensure particle texture is loaded

**Performance issues:**
- Reduce particle count
- Decrease cloud count
- Lower texture resolution
- Disable features on mobile

---

## NEXT STEPS

1. **Add Biome-Specific Skies** - Different sky per terrain type
2. **Implement Seasons** - Change colors based on game calendar
3. **Dynamic Events** - Meteors, eclipses, flying creatures
4. **Audio Integration** - Wind, thunder, ambient sounds
5. **VFX Layers** - God rays, atmospheric scattering
6. **Procedural Nebulae** - For space/void levels

---

**Built for the Treaty of the Watchtower**  
**South of South Records**  
🌌 Skate through infinite skies 🛹
