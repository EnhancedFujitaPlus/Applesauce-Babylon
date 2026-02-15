/**
 * WIND & WEATHER CONTROLLER
 * Manages multiple tornados, ambient wind, and atmospheric effects
 * Integrates with your WeatherSystem.js
 */

class WindWeatherController {
    constructor(scene, terrain, eventBus) {
        this.scene = scene;
        this.terrain = terrain;
        this.eventBus = eventBus;
        
        // Active tornado instances
        this.tornados = [];
        
        // Ambient wind
        this.ambientWind = {
            direction: new THREE.Vector2(1, 0), // Wind blows east
            speed: 0.02,
            gustTimer: 0,
            gustStrength: 0
        };
        
        // Wind particles (visual only)
        this.windParticles = [];
        this.createWindParticles();
        
        // Weather state
        this.weatherIntensity = 0; // 0 = calm, 1 = extreme
        this.transitionTarget = 0;
        this.transitionSpeed = 0.001;
    }
    
    /**
     * CREATE AMBIENT WIND PARTICLES
     * Horizontal lines showing wind direction
     */
    createWindParticles() {
        for (let i = 0; i < 100; i++) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array([
                0, 0, 0,
                1, 0, 0
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const material = new THREE.LineBasicMaterial({
                color: 0xCCCCCC,
                transparent: true,
                opacity: 0.3
            });
            
            const line = new THREE.Line(geometry, material);
            
            line.userData = {
                resetX: Math.random() * 200 - 100,
                resetY: Math.random() * 30 + 5,
                resetZ: Math.random() * 200 - 100,
                speed: 0.5 + Math.random() * 0.5
            };
            
            line.position.set(
                line.userData.resetX,
                line.userData.resetY,
                line.userData.resetZ
            );
            
            this.windParticles.push(line);
            this.scene.add(line);
        }
    }
    
    /**
     * SPAWN A NEW TORNADO
     */
    spawnTornado(config = {}) {
        const tornado = new TornadoSystem(this.scene, this.terrain, config);
        this.tornados.push(tornado);
        
        // Emit event
        if (this.eventBus) {
            this.eventBus.emit('tornadoSpawned', { tornado });
        }
        
        console.log(`🌪️ Tornado #${this.tornados.length} spawned!`);
        return tornado;
    }
    
    /**
     * RANDOM TORNADO SPAWN
     * Creates tornado at random location
     */
    spawnRandomTornado() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        
        return this.spawnTornado({
            startX: Math.cos(angle) * distance,
            startZ: Math.sin(angle) * distance,
            velocityX: (Math.random() - 0.5) * 0.2,
            velocityZ: (Math.random() - 0.5) * 0.2,
            radius: 6 + Math.random() * 8,
            strength: 0.3 + Math.random() * 0.3
        });
    }
    
    /**
     * SET WEATHER INTENSITY
     * Smoothly transitions weather from calm to extreme
     */
    setWeatherIntensity(target, speed = 0.002) {
        this.transitionTarget = Math.max(0, Math.min(1, target));
        this.transitionSpeed = speed;
    }
    
    /**
     * UPDATE ALL WIND SYSTEMS
     */
    update(playerPosition, delta = 1) {
        // === SMOOTH WEATHER TRANSITION ===
        if (Math.abs(this.weatherIntensity - this.transitionTarget) > 0.001) {
            if (this.weatherIntensity < this.transitionTarget) {
                this.weatherIntensity += this.transitionSpeed;
            } else {
                this.weatherIntensity -= this.transitionSpeed;
            }
            this.weatherIntensity = Math.max(0, Math.min(1, this.weatherIntensity));
        }
        
        // === UPDATE TORNADOS ===
        for (let i = this.tornados.length - 1; i >= 0; i--) {
            const tornado = this.tornados[i];
            
            if (!tornado.update(playerPosition, delta)) {
                // Tornado expired - remove it
                tornado.destroy();
                this.tornados.splice(i, 1);
                
                if (this.eventBus) {
                    this.eventBus.emit('tornadoDissipated', { index: i });
                }
            }
        }
        
        // === UPDATE AMBIENT WIND ===
        this.updateAmbientWind(delta);
        
        // === UPDATE WIND PARTICLES ===
        this.updateWindParticles();
        
        // === APPLY WIND TO PLAYER ===
        return this.calculateWindForce(playerPosition);
    }
    
    /**
     * UPDATE AMBIENT WIND
     * Changes direction and creates gusts
     */
    updateAmbientWind(delta) {
        // Slowly rotate wind direction
        const rotationSpeed = 0.0005 * this.weatherIntensity;
        const angle = Math.atan2(this.ambientWind.direction.y, this.ambientWind.direction.x);
        const newAngle = angle + rotationSpeed;
        
        this.ambientWind.direction.set(
            Math.cos(newAngle),
            Math.sin(newAngle)
        );
        
        // Create random gusts
        this.ambientWind.gustTimer--;
        if (this.ambientWind.gustTimer <= 0) {
            this.ambientWind.gustStrength = Math.random() * this.weatherIntensity;
            this.ambientWind.gustTimer = 60 + Math.random() * 120;
        }
        
        // Fade out gust
        if (this.ambientWind.gustStrength > 0) {
            this.ambientWind.gustStrength *= 0.98;
        }
    }
    
    /**
     * UPDATE WIND PARTICLE VISUALS
     */
    updateWindParticles() {
        const windSpeed = this.ambientWind.speed + this.ambientWind.gustStrength;
        
        this.windParticles.forEach(particle => {
            const data = particle.userData;
            
            // Move with wind
            particle.position.x += this.ambientWind.direction.x * data.speed * windSpeed;
            particle.position.z += this.ambientWind.direction.y * data.speed * windSpeed;
            
            // Reset when particle goes too far
            const distance = Math.sqrt(
                particle.position.x * particle.position.x +
                particle.position.z * particle.position.z
            );
            
            if (distance > 150) {
                particle.position.set(data.resetX, data.resetY, data.resetZ);
            }
            
            // Opacity based on weather intensity
            particle.material.opacity = 0.2 + this.weatherIntensity * 0.5;
        });
    }
    
    /**
     * CALCULATE TOTAL WIND FORCE AT POSITION
     * Combines ambient wind + all tornado forces
     */
    calculateWindForce(position) {
        let totalForce = {
            pullX: this.ambientWind.direction.x * (this.ambientWind.speed + this.ambientWind.gustStrength),
            pullZ: this.ambientWind.direction.y * (this.ambientWind.speed + this.ambientWind.gustStrength),
            lift: 0,
            spin: 0
        };
        
        // Add tornado forces
        this.tornados.forEach(tornado => {
            const tornadoForce = tornado.applyPhysicsToObject(position);
            
            if (tornadoForce) {
                totalForce.pullX += tornadoForce.pullX;
                totalForce.pullZ += tornadoForce.pullZ;
                totalForce.lift += tornadoForce.lift;
                totalForce.spin += tornadoForce.spin;
            }
        });
        
        return totalForce;
    }
    
    /**
     * GET ALL TORNADOS NEAR POSITION
     */
    getTornadosNearPosition(position, maxDistance = 50) {
        return this.tornados.filter(tornado => {
            const dx = tornado.position.x - position.x;
            const dz = tornado.position.z - position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            return distance < maxDistance;
        });
    }
    
    /**
     * DESTROY ALL TORNADOS
     */
    clearAllTornados() {
        this.tornados.forEach(tornado => tornado.destroy());
        this.tornados = [];
    }
    
    /**
     * APPLY WIND TO OBJECT
     * Helper for affecting cows, debris, etc.
     */
    applyWindToObject(object, mass = 1) {
        const force = this.calculateWindForce(object.position);
        
        // Apply force based on mass
        const resistance = 1 / mass;
        
        return {
            deltaX: force.pullX * resistance,
            deltaZ: force.pullZ * resistance,
            deltaY: force.lift * resistance,
            deltaRotation: force.spin * resistance
        };
    }
}


// ========================================
// EVENT BUS (if you don't have one)
// ========================================

class SimpleEventBus {
    constructor() {
        this.listeners = {};
    }
    
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}


// ========================================
// USAGE EXAMPLE FOR LEVEL 8
// ========================================
/*

// Initialize weather controller
const eventBus = new SimpleEventBus();
const windWeather = new WindWeatherController(scene, terrain, eventBus);

// Listen to events
eventBus.on('tornadoSpawned', (data) => {
    console.log('New tornado!', data.tornado);
    // Show warning message
});

eventBus.on('tornadoDissipated', (data) => {
    console.log('Tornado dissipated!');
});

// Start with calm weather
windWeather.setWeatherIntensity(0.2, 0.001);

// Spawn initial tornado
windWeather.spawnTornado({
    startX: -50,
    startZ: 100,
    velocityX: 0.15,
    velocityZ: -0.1
});

// In update loop:
function update() {
    // Update weather
    const windForce = windWeather.update(player.position);
    
    // Apply to player
    state.velocityX += windForce.pullX;
    state.velocityZ += windForce.pullZ;
    
    if (windForce.lift > 0.1) {
        state.jumpVelocity += windForce.lift * 0.5;
    }
    
    state.rotation += windForce.spin;
    
    // Apply to cows
    cows.forEach(cow => {
        const cowWind = windWeather.applyWindToObject(cow, 2); // Mass = 2
        cow.position.x += cowWind.deltaX;
        cow.position.z += cowWind.deltaZ;
    });
}

// Trigger weather events
function startStorm() {
    windWeather.setWeatherIntensity(0.8, 0.005);
    
    // Spawn multiple tornados
    setInterval(() => {
        if (Math.random() < 0.3) {
            windWeather.spawnRandomTornado();
        }
    }, 5000);
}

// End storm
function endStorm() {
    windWeather.setWeatherIntensity(0.1, 0.002);
    windWeather.clearAllTornados();
}

*/
