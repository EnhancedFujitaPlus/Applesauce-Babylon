# 🔧 WEATHER MODULE FIX - Quick Guide

## The Problem
```
TypeError: this.setupWeather is not a function
```

This happens because `applesauce-core-33.js` calls `this.setupWeather()` at line 232, but this method doesn't exist in the ApplesauceCore class.

## The Solution - Two Options:

### ✅ OPTION 1: Add setupWeather to Core (Recommended)

Open `applesauce-core-33.js` and add the following methods to the ApplesauceCore class.

**Where to add:** After the `loadLevel` method (around line 260) and before the `update` method (around line 730)

```javascript
// ===================================
// WEATHER SETUP METHOD
// ===================================
async setupWeather(weatherConfig) {
    if (!this.modules.weather) {
        console.warn('⚠️ Weather module not initialized');
        return;
    }
    
    // Handle different weather configurations
    if (Array.isArray(weatherConfig)) {
        // Multiple weather effects
        weatherConfig.forEach(config => {
            this.addWeatherEffect(config);
        });
    } else if (typeof weatherConfig === 'object') {
        // Single weather configuration
        
        // Check if it's a specific weather type (volcano, tornado, etc.)
        if (weatherConfig.type) {
            this.modules.weather.addWeather(weatherConfig.type, weatherConfig);
        }
        
        // Apply general weather settings (fog, mist, lighting)
        if (weatherConfig.fog) {
            this.applyFogSettings(weatherConfig.fog);
        }
        
        if (weatherConfig.mist) {
            this.applyMistEffect(weatherConfig.mist);
        }
        
        if (weatherConfig.lighting) {
            this.applyWeatherLighting(weatherConfig.lighting);
        }
    }
    
    console.log('🌤️ Weather setup complete');
}

addWeatherEffect(config) {
    if (config.type) {
        this.modules.weather.addWeather(config.type, config);
    }
}

applyFogSettings(fogConfig) {
    if (!fogConfig.enabled) return;
    
    const color = fogConfig.color || 0x9ca7a8;
    const near = fogConfig.near || 50;
    const far = fogConfig.far || 300;
    
    if (this.scene.fog) {
        this.scene.fog.color.setHex(color);
        this.scene.fog.near = near;
        this.scene.fog.far = far;
    } else {
        this.scene.fog = new THREE.Fog(color, near, far);
    }
    
    console.log('🌫️ Fog applied');
}

applyMistEffect(mistConfig) {
    if (!mistConfig.enabled) return;
    
    const particleCount = mistConfig.particles || 500;
    const height = mistConfig.height || 10;
    
    const mistGeometry = new THREE.BufferGeometry();
    const mistPositions = [];
    
    for (let i = 0; i < particleCount; i++) {
        mistPositions.push(
            (Math.random() - 0.5) * 400,
            Math.random() * height,
            (Math.random() - 0.5) * 400
        );
    }
    
    mistGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(mistPositions, 3)
    );
    
    const mistMaterial = new THREE.PointsMaterial({
        color: 0x9ca7a8,
        size: 2,
        transparent: true,
        opacity: 0.3,
        fog: false
    });
    
    const mist = new THREE.Points(mistGeometry, mistMaterial);
    mist.name = 'weather_mist';
    this.scene.add(mist);
    
    mist.userData.movement = mistConfig.movement === 'slow' ? 0.02 : 0.05;
    mist.userData.isMist = true;
    
    console.log('💨 Mist effect applied');
}

applyWeatherLighting(lightingConfig) {
    if (lightingConfig.ambient) {
        const ambientLight = this.scene.children.find(
            child => child.type === 'AmbientLight'
        );
        if (ambientLight) {
            ambientLight.color.setHex(lightingConfig.ambient);
        }
    }
    
    if (lightingConfig.directional) {
        const dirLight = this.scene.children.find(
            child => child.type === 'DirectionalLight'
        );
        
        if (dirLight) {
            if (lightingConfig.directional.color) {
                dirLight.color.setHex(lightingConfig.directional.color);
            }
            if (lightingConfig.directional.intensity !== undefined) {
                dirLight.intensity = lightingConfig.directional.intensity;
            }
            if (lightingConfig.directional.position) {
                const pos = lightingConfig.directional.position;
                dirLight.position.set(pos.x, pos.y, pos.z);
            }
        }
    }
    
    console.log('💡 Weather lighting applied');
}
```

**Then update the `update()` method** (around line 850) to animate the mist:

Find the section where it says:
```javascript
// Update skybox animations
if (this.modules.skybox && this.modules.skybox.update) {
    this.modules.skybox.update(this);
}
```

Add this RIGHT AFTER that section:
```javascript
// Animate mist particles
this.scene.traverse((obj) => {
    if (obj.userData.isMist && obj.geometry) {
        const positions = obj.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * obj.userData.movement;
            positions[i + 2] += (Math.random() - 0.5) * obj.userData.movement;
        }
        obj.geometry.attributes.position.needsUpdate = true;
    }
});
```

---

### ⚡ OPTION 2: Quick Fix (Simpler but less features)

If you just want to get it working quickly without mist effects:

**Find this line in `applesauce-core-33.js` (around line 232):**
```javascript
await this.setupWeather(levelConfig.weather);
```

**Replace it with:**
```javascript
// Setup weather via module
if (this.modules.weather) {
    // Apply fog settings
    if (levelConfig.weather.fog) {
        const fog = levelConfig.weather.fog;
        this.scene.fog = new THREE.Fog(
            fog.color || 0x9ca7a8,
            fog.near || 50,
            fog.far || 300
        );
    }
    
    // Apply lighting
    if (levelConfig.weather.lighting) {
        const lighting = levelConfig.weather.lighting;
        if (lighting.ambient) {
            const ambientLight = this.scene.children.find(c => c.type === 'AmbientLight');
            if (ambientLight) ambientLight.color.setHex(lighting.ambient);
        }
    }
}
```

---

## Testing After Fix

1. Reload `Level_20.html` in your browser
2. You should see:
   - `🌤️ Weather setup complete` in console
   - `🌫️ Fog applied` in console
   - `💡 Weather lighting applied` in console
   - Misty fog effect in the canyon

## Expected Console Output:
```
🛹 APPLESAUCE Core Engine v4.0 (Three.js r182) initialized
📦 Loading level: Outside the Box
🌤️ Weather setup complete
🌫️ Fog applied
💡 Weather lighting applied
✅ Level 20 loaded successfully!
🛹 Game started!
```

## If You Still Get Errors:

**"Cannot read property 'fog' of undefined"**
- Make sure the weather config in level20-config.js has the correct structure

**"Cannot find module"**
- Check that all module files exist in the correct paths

**Mist not appearing**
- Check that mist.enabled is set to true in the level config

---

## Why This Error Happened

The core file was written to call `this.setupWeather()` but this method was never implemented. It's a common pattern in game engines to have setup methods for different systems, but they all need to be implemented!

Option 1 gives you full weather features (fog, mist particles, lighting).
Option 2 is a quick patch to just get it working.

I recommend Option 1 for the full experience! 🌫️
