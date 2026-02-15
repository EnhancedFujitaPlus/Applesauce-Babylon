/**
 * ==========================================
 * APPLESAUCE SKYBOX SYSTEM
 * ==========================================
 * Treaty of the Watchtower / South of South Records
 * 
 * Features:
 * - Day/Night cycle
 * - Weather systems (rain, fog, storm)
 * - Biome-specific atmospheres
 * - Procedural starfields
 * - Dynamic lighting
 * - Atmospheric scattering
 * - Custom Treaty aesthetic modes
 */

export class ApplesauceSkybox {
    constructor(scene) {
        this.scene = scene;
        this.currentSkybox = null;
        this.starfield = null;
        this.clouds = null;
        this.sun = null;
        this.moon = null;
        
        // Time system
        this.timeOfDay = 12; // 0-24 hours
        this.timeSpeed = 0.01; // Hour per second (adjust as needed)
        this.paused = false;
        
        // Weather system
        this.weather = 'clear'; // clear, rain, fog, storm, blood_rain
        this.weatherParticles = null;
        
        // Atmosphere
        this.fogEnabled = false;
        this.fogDensity = 0.01;
        
        console.log('🌌 Enhanced Skybox System initialized');
    }

    // ==========================================
    // CUBEMAP SKYBOXES
    // ==========================================
    
    /**
     * Load standard cubemap skybox
     */
    loadCubemap(rootPath) {
        this.dispose();
        
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMat", this.scene);
        
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(rootPath, this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.disableLighting = true;
        
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;
        
        this.currentSkybox = skybox;
        console.log('✅ Cubemap skybox loaded');
        return skybox;
    }

    // ==========================================
    // PROCEDURAL SKIES
    // ==========================================
    
    /**
     * Create procedural sky with Rayleigh/Mie scattering
     */
    createProceduralSky(preset = 'day') {
        this.dispose();
        
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
        
        // Check if SkyMaterial is available
        if (typeof BABYLON.SkyMaterial === 'undefined') {
            console.warn('⚠️ SkyMaterial not loaded, using fallback');
            return this.createGradientSky('day');
        }
        
        const skyMaterial = new BABYLON.SkyMaterial("skyMaterial", this.scene);
        skyMaterial.backFaceCulling = false;
        
        // Apply preset
        this.applySkyPreset(skyMaterial, preset);
        
        skybox.material = skyMaterial;
        skybox.infiniteDistance = true;
        
        this.currentSkybox = skybox;
        console.log(`✅ Procedural sky created: ${preset}`);
        return skybox;
    }
    
    applySkyPreset(material, preset) {
        const presets = {
            day: {
                turbidity: 1,
                luminance: 1,
                inclination: 0.49, // Sun high
                azimuth: 0.25,
                rayleigh: 2
            },
            sunset: {
                turbidity: 10,
                luminance: 1,
                inclination: 0.5, // Horizon
                azimuth: 0.25,
                rayleigh: 3
            },
            night: {
                turbidity: 0.1,
                luminance: 0.1,
                inclination: 0.0, // Sun below horizon
                azimuth: 0.25,
                rayleigh: 0.5
            },
            overcast: {
                turbidity: 20,
                luminance: 0.5,
                inclination: 0.49,
                azimuth: 0.25,
                rayleigh: 1
            }
        };
        
        const config = presets[preset] || presets.day;
        Object.assign(material, config);
    }

    /**
     * Gradient sky (fallback or custom aesthetic)
     */
    createGradientSky(mode = 'day') {
        this.dispose();
        
        const skybox = BABYLON.MeshBuilder.CreateSphere("skySphere", { 
            diameter: 900, 
            segments: 32 
        }, this.scene);
        
        const skyMat = new BABYLON.StandardMaterial("gradientSkyMat", this.scene);
        skyMat.backFaceCulling = false;
        skyMat.disableLighting = true;
        
        // Create dynamic texture for gradient
        const dynamicTexture = new BABYLON.DynamicTexture("skyGradient", 512, this.scene);
        const ctx = dynamicTexture.getContext();
        
        // Draw gradient based on mode
        const gradients = {
            day: { top: '#87CEEB', middle: '#B0E0E6', bottom: '#FFFFFF' },
            sunset: { top: '#FF6B35', middle: '#FF8C42', bottom: '#FFC857' },
            night: { top: '#0B0B45', middle: '#1A1A5E', bottom: '#2A2A7C' },
            treaty_blood: { top: '#4A0000', middle: '#8B0000', bottom: '#FF4444' },
            treaty_void: { top: '#000000', middle: '#0A0A0A', bottom: '#1A1A1A' }
        };
        
        const colors = gradients[mode] || gradients.day;
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, colors.top);
        gradient.addColorStop(0.5, colors.middle);
        gradient.addColorStop(1, colors.bottom);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        dynamicTexture.update();
        
        skyMat.diffuseTexture = dynamicTexture;
        skybox.material = skyMat;
        skybox.infiniteDistance = true;
        
        this.currentSkybox = skybox;
        console.log(`✅ Gradient sky created: ${mode}`);
        return skybox;
    }

    // ==========================================
    // STARFIELD
    // ==========================================
    
    /**
     * Create procedural starfield
     */
    createStarfield(density = 'normal') {
        if (this.starfield) {
            this.starfield.dispose();
        }
        
        const starfieldMesh = BABYLON.MeshBuilder.CreateSphere("stars", { 
            diameter: 950, 
            segments: 32 
        }, this.scene);
        
        const starfieldMat = new BABYLON.StandardMaterial("starfieldMat", this.scene);
        
        // Check if StarfieldProceduralTexture is available
        if (typeof BABYLON.StarfieldProceduralTexture !== 'undefined') {
            const starfieldTexture = new BABYLON.StarfieldProceduralTexture("starfieldTex", 512, this.scene);
            
            const densitySettings = {
                sparse: { saturation: 0.5, darkmatter: 0.5, distfading: 0.7 },
                normal: { saturation: 0.8, darkmatter: 0.2, distfading: 0.8 },
                dense: { saturation: 1.0, darkmatter: 0.1, distfading: 0.9 }
            };
            
            const settings = densitySettings[density] || densitySettings.normal;
            Object.assign(starfieldTexture, settings);
            
            starfieldMat.diffuseTexture = starfieldTexture;
        } else {
            // Fallback: create custom star texture
            const texture = this.createCustomStarTexture(512, density);
            starfieldMat.diffuseTexture = texture;
        }
        
        starfieldMat.backFaceCulling = false;
        starfieldMat.disableLighting = true;
        starfieldMat.alpha = 0; // Start invisible
        
        starfieldMesh.material = starfieldMat;
        starfieldMesh.infiniteDistance = true;
        
        this.starfield = starfieldMesh;
        console.log('✅ Starfield created');
        return starfieldMesh;
    }
    
    createCustomStarTexture(size, density) {
        const dynamicTexture = new BABYLON.DynamicTexture("customStars", size, this.scene);
        const ctx = dynamicTexture.getContext();
        
        // Black background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, size, size);
        
        // Draw stars
        const starCount = {
            sparse: 200,
            normal: 500,
            dense: 1000
        }[density] || 500;
        
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 1.5;
            const brightness = Math.random();
            
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        dynamicTexture.update();
        return dynamicTexture;
    }

    // ==========================================
    // CELESTIAL BODIES
    // ==========================================
    
    /**
     * Add sun to sky
     */
    createSun() {
        if (this.sun) {
            this.sun.dispose();
        }
        
        const sun = BABYLON.MeshBuilder.CreateSphere("sun", { 
            diameter: 50, 
            segments: 16 
        }, this.scene);
        
        const sunMat = new BABYLON.StandardMaterial("sunMat", this.scene);
        sunMat.emissiveColor = new BABYLON.Color3(1, 0.9, 0.6);
        sunMat.disableLighting = true;
        
        sun.material = sunMat;
        sun.infiniteDistance = true;
        
        // Add glow
        const glow = new BABYLON.GlowLayer("sunGlow", this.scene);
        glow.intensity = 0.5;
        glow.addIncludedOnlyMesh(sun);
        
        this.sun = sun;
        this.updateCelestialPositions();
        
        console.log('☀️ Sun created');
        return sun;
    }
    
    /**
     * Add moon to sky
     */
    createMoon() {
        if (this.moon) {
            this.moon.dispose();
        }
        
        const moon = BABYLON.MeshBuilder.CreateSphere("moon", { 
            diameter: 40, 
            segments: 16 
        }, this.scene);
        
        const moonMat = new BABYLON.StandardMaterial("moonMat", this.scene);
        moonMat.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.9);
        moonMat.disableLighting = true;
        
        moon.material = moonMat;
        moon.infiniteDistance = true;
        
        this.moon = moon;
        this.updateCelestialPositions();
        
        console.log('🌙 Moon created');
        return moon;
    }
    
    updateCelestialPositions() {
        const hour = this.timeOfDay % 24;
        const sunAngle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
        const moonAngle = sunAngle + Math.PI;
        
        if (this.sun) {
            this.sun.position = new BABYLON.Vector3(
                Math.cos(sunAngle) * 800,
                Math.sin(sunAngle) * 800,
                0
            );
        }
        
        if (this.moon) {
            this.moon.position = new BABYLON.Vector3(
                Math.cos(moonAngle) * 800,
                Math.sin(moonAngle) * 800,
                0
            );
        }
    }

    // ==========================================
    // CLOUDS
    // ==========================================
    
    /**
     * Create volumetric-style clouds
     */
    createClouds(coverage = 0.5) {
        if (this.clouds) {
            this.clouds.forEach(c => c.dispose());
        }
        
        this.clouds = [];
        const cloudCount = Math.floor(20 * coverage);
        
        for (let i = 0; i < cloudCount; i++) {
            const cloud = this.createSingleCloud();
            
            // Random position
            const angle = Math.random() * Math.PI * 2;
            const distance = 300 + Math.random() * 200;
            const height = 100 + Math.random() * 100;
            
            cloud.position = new BABYLON.Vector3(
                Math.cos(angle) * distance,
                height,
                Math.sin(angle) * distance
            );
            
            cloud.infiniteDistance = true;
            this.clouds.push(cloud);
        }
        
        console.log(`☁️ Created ${cloudCount} clouds`);
        return this.clouds;
    }
    
    createSingleCloud() {
        // Cloud made of multiple spheres
        const cloudGroup = new BABYLON.Mesh("cloud", this.scene);
        
        const cloudMat = new BABYLON.StandardMaterial("cloudMat", this.scene);
        cloudMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        cloudMat.alpha = 0.7;
        cloudMat.disableLighting = true;
        
        // Create puffs
        for (let i = 0; i < 5; i++) {
            const puff = BABYLON.MeshBuilder.CreateSphere(`puff${i}`, {
                diameter: 10 + Math.random() * 10,
                segments: 8
            }, this.scene);
            
            puff.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 20
            );
            
            puff.material = cloudMat;
            puff.parent = cloudGroup;
        }
        
        // Slow rotation
        cloudGroup.metadata = {
            rotationSpeed: Math.random() * 0.002
        };
        
        return cloudGroup;
    }

    // ==========================================
    // WEATHER EFFECTS
    // ==========================================
    
    /**
     * Set weather condition
     */
    setWeather(weatherType) {
        this.weather = weatherType;
        
        // Clear existing weather particles
        if (this.weatherParticles) {
            this.weatherParticles.dispose();
            this.weatherParticles = null;
        }
        
        switch (weatherType) {
            case 'rain':
                this.createRain();
                break;
            case 'storm':
                this.createStorm();
                break;
            case 'blood_rain':
                this.createBloodRain();
                break;
            case 'fog':
                this.enableFog(0.02);
                break;
            case 'clear':
                this.disableFog();
                break;
        }
        
        console.log(`🌦️ Weather set to: ${weatherType}`);
    }
    
    createRain() {
        const rain = new BABYLON.ParticleSystem("rain", 5000, this.scene);
        
        // Emitter (above player)
        rain.emitter = new BABYLON.Vector3(0, 50, 0);
        rain.minEmitBox = new BABYLON.Vector3(-100, 0, -100);
        rain.maxEmitBox = new BABYLON.Vector3(100, 0, 100);
        
        // Particle properties
        rain.particleTexture = new BABYLON.Texture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuM4zml1AAAAAcSURBVBhXY/j//z8DAxgwMjKCaQYwBmMwBSAAAH6/Bv8W5mH7AAAAAElFTkSuQmCC", this.scene);
        
        rain.minSize = 0.1;
        rain.maxSize = 0.3;
        
        rain.minLifeTime = 0.5;
        rain.maxLifeTime = 1.5;
        
        rain.emitRate = 1000;
        
        rain.direction1 = new BABYLON.Vector3(0, -10, 0);
        rain.direction2 = new BABYLON.Vector3(0, -10, 0);
        
        rain.gravity = new BABYLON.Vector3(0, -20, 0);
        
        rain.color1 = new BABYLON.Color4(0.7, 0.7, 0.9, 1);
        rain.color2 = new BABYLON.Color4(0.5, 0.5, 0.7, 1);
        
        rain.start();
        this.weatherParticles = rain;
        
        this.enableFog(0.01);
    }
    
    createStorm() {
        this.createRain();
        
        // Darken sky
        if (this.currentSkybox && this.currentSkybox.material) {
            this.currentSkybox.material.alpha = 0.5;
        }
        
        this.enableFog(0.03);
    }
    
    createBloodRain() {
        const bloodRain = new BABYLON.ParticleSystem("bloodRain", 3000, this.scene);
        
        bloodRain.emitter = new BABYLON.Vector3(0, 50, 0);
        bloodRain.minEmitBox = new BABYLON.Vector3(-100, 0, -100);
        bloodRain.maxEmitBox = new BABYLON.Vector3(100, 0, 100);
        
        bloodRain.minSize = 0.2;
        bloodRain.maxSize = 0.5;
        
        bloodRain.minLifeTime = 1;
        bloodRain.maxLifeTime = 2;
        
        bloodRain.emitRate = 500;
        
        bloodRain.direction1 = new BABYLON.Vector3(0, -8, 0);
        bloodRain.direction2 = new BABYLON.Vector3(0, -10, 0);
        
        bloodRain.gravity = new BABYLON.Vector3(0, -15, 0);
        
        bloodRain.color1 = new BABYLON.Color4(0.8, 0.0, 0.0, 1);
        bloodRain.color2 = new BABYLON.Color4(0.5, 0.0, 0.0, 1);
        
        bloodRain.start();
        this.weatherParticles = bloodRain;
        
        this.enableFog(0.02, new BABYLON.Color3(0.3, 0.0, 0.0));
    }

    // ==========================================
    // ATMOSPHERE
    // ==========================================
    
    enableFog(density = 0.01, color = null) {
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = density;
        this.scene.fogColor = color || new BABYLON.Color3(0.8, 0.8, 0.8);
        this.fogEnabled = true;
        this.fogDensity = density;
    }
    
    disableFog() {
        this.scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
        this.fogEnabled = false;
    }

    // ==========================================
    // TIME SYSTEM
    // ==========================================
    
    /**
     * Set time of day (0-24)
     */
    setTime(hour) {
        this.timeOfDay = hour % 24;
        this.updateCelestialPositions();
        this.updateLightingForTime();
    }
    
    /**
     * Advance time
     */
    advanceTime(deltaSeconds) {
        if (this.paused) return;
        
        this.timeOfDay += this.timeSpeed * deltaSeconds;
        if (this.timeOfDay >= 24) {
            this.timeOfDay -= 24;
        }
        
        this.updateCelestialPositions();
        this.updateLightingForTime();
    }
    
    updateLightingForTime() {
        const hour = this.timeOfDay % 24;
        
        // Update starfield visibility
        if (this.starfield) {
            if (hour < 6 || hour > 18) {
                // Night
                this.starfield.material.alpha = Math.min(1, (hour < 6 ? (6 - hour) / 6 : (hour - 18) / 6));
            } else {
                // Day
                this.starfield.material.alpha = 0;
            }
        }
        
        // Update sun/moon visibility
        if (this.sun) {
            this.sun.setEnabled(hour >= 6 && hour <= 18);
        }
        if (this.moon) {
            this.moon.setEnabled(hour < 6 || hour > 18);
        }
        
        // Update scene ambient light
        const ambientIntensity = this.getAmbientIntensityForTime(hour);
        this.scene.ambientColor = new BABYLON.Color3(
            ambientIntensity,
            ambientIntensity,
            ambientIntensity * 1.1
        );
    }
    
    getAmbientIntensityForTime(hour) {
        if (hour >= 6 && hour <= 18) {
            // Day
            return 0.8;
        } else if (hour < 6) {
            // Dawn
            return 0.2 + (hour / 6) * 0.6;
        } else {
            // Dusk
            return 0.8 - ((hour - 18) / 6) * 0.6;
        }
    }

    // ==========================================
    // PRESETS
    // ==========================================
    
    /**
     * Load complete sky preset
     */
    loadPreset(presetName) {
        console.log(`🎨 Loading preset: ${presetName}`);
        
        switch (presetName) {
            case 'default':
                this.createGradientSky('day');
                this.createSun();
                this.createClouds(0.3);
                this.setTime(12);
                break;
                
            case 'night':
                this.createGradientSky('night');
                this.createStarfield('normal');
                this.createMoon();
                this.setTime(0);
                break;
                
            case 'sunset':
                this.createGradientSky('sunset');
                this.createSun();
                this.createClouds(0.5);
                this.setTime(18);
                break;
                
            case 'storm':
                this.createGradientSky('overcast');
                this.createClouds(0.8);
                this.setWeather('storm');
                this.setTime(14);
                break;
                
            case 'treaty_blood':
                this.createGradientSky('treaty_blood');
                this.createStarfield('sparse');
                this.setWeather('blood_rain');
                this.setTime(0);
                break;
                
            case 'treaty_void':
                this.createGradientSky('treaty_void');
                this.createStarfield('dense');
                this.setTime(0);
                break;
                
            default:
                console.warn(`Unknown preset: ${presetName}`);
                this.loadPreset('default');
        }
    }

    // ==========================================
    // UPDATE & CLEANUP
    // ==========================================
    
    /**
     * Update loop (call from main game loop)
     */
    update(deltaTime) {
        // Rotate skybox slowly
        if (this.currentSkybox) {
            this.currentSkybox.rotation.y += deltaTime * 0.001;
        }
        
        // Rotate starfield
        if (this.starfield) {
            this.starfield.rotation.y += deltaTime * 0.0005;
        }
        
        // Animate clouds
        if (this.clouds) {
            this.clouds.forEach(cloud => {
                if (cloud.metadata && cloud.metadata.rotationSpeed) {
                    cloud.rotation.y += cloud.metadata.rotationSpeed;
                }
            });
        }
        
        // Advance time
        this.advanceTime(deltaTime);
    }
    
    /**
     * Clean up all skybox elements
     */
    dispose() {
        if (this.currentSkybox) {
            this.currentSkybox.dispose();
            this.currentSkybox = null;
        }
        
        if (this.starfield) {
            this.starfield.dispose();
            this.starfield = null;
        }
        
        if (this.clouds) {
            this.clouds.forEach(c => c.dispose());
            this.clouds = null;
        }
        
        if (this.sun) {
            this.sun.dispose();
            this.sun = null;
        }
        
        if (this.moon) {
            this.moon.dispose();
            this.moon = null;
        }
        
        if (this.weatherParticles) {
            this.weatherParticles.dispose();
            this.weatherParticles = null;
        }
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApplesauceSkybox };
}
