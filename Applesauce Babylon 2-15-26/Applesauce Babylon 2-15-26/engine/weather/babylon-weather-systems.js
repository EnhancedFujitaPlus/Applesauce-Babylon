/**
 * ============================================================
 *  APPLESAUCE Weather Systems — BABYLON.JS + HAVOK
 * ============================================================
 *  Modular weather engine that plugs into ApplesauceCore.
 *  Supports escalating storm intensity, historical catastrophic
 *  event presets, and real physics-based wind forces.
 *
 *  USAGE:
 *    import { WeatherSystem } from './weather-systems.js';
 *
 *    // After core.init()
 *    const weather = new WeatherSystem(core.scene, core.havokPlugin);
 *    weather.setPreset('clear');            // calm day
 *    weather.setPreset('cat5_hurricane');   // full catastrophe
 *    weather.transitionTo('thunderstorm', 5);  // 5-second blend
 *
 *    // In your game loop / level onUpdate:
 *    weather.update(core.getDeltaTime(), core.player);
 *
 *  The system is designed to scale from gentle rain all the way
 *  up to timeline-jump catastrophic events (Galveston 1900,
 *  Tri-State Tornado, etc.) so levels can dial intensity to
 *  match the historical moment the player lands in.
 * ============================================================
 */

export class WeatherSystem {

    // ── Constructor ────────────────────────────────────────
    constructor(scene, havokPlugin, config = {}) {
        console.log('🌦️ Initializing APPLESAUCE Weather Systems...');

        this.scene   = scene;
        this.havok   = havokPlugin;

        // ── Master state ───────────────────────────────────
        this.intensity  = 0;        // 0.0 = calm … 1.0 = apocalyptic
        this.windDir    = new BABYLON.Vector3(1, 0, 0.3).normalize();
        this.windSpeed  = 0;        // m/s  (Beaufort-ish feel)
        this.timeOfDay  = 0.5;      // 0 = midnight, 0.5 = noon, 1 = midnight

        // ── Particle emitters (created lazily) ─────────────
        this._rain     = null;
        this._snow     = null;
        this._dust     = null;
        this._debris   = null;
        this._lightning = null;

        // ── Fog & sky references ───────────────────────────
        this._baseClearColor = scene.clearColor.clone();
        this._baseFogColor   = new BABYLON.Color3(0.8, 0.83, 0.85);

        // ── Transition blending ────────────────────────────
        this._transition = null;   // { from, to, elapsed, duration }

        // ── Lights the system will modulate ────────────────
        this._ambient = scene.getLightByName('ambient');
        this._sun     = scene.getLightByName('sun');

        // ── Config overrides ───────────────────────────────
        this.config = {
            maxRainDrops:      config.maxRainDrops     ?? 8000,
            maxSnowFlakes:     config.maxSnowFlakes    ?? 4000,
            maxDustParticles:  config.maxDustParticles  ?? 3000,
            maxDebris:         config.maxDebris         ?? 500,
            windPhysicsScale:  config.windPhysicsScale  ?? 1.0,
            lightningEnabled:  config.lightningEnabled  !== false,
            soundEnabled:      config.soundEnabled      !== false,
        };

        // ── Physics bodies that receive wind force ─────────
        this._windTargets = [];   // [{ body, mass }]

        // ── Lightning cooldown ─────────────────────────────
        this._lightningTimer   = 0;
        this._lightningFlash   = null;  // point light for flash

        console.log('✅ Weather Systems ready');
    }


    // ════════════════════════════════════════════════════════
    //  PRESETS — named weather states
    // ════════════════════════════════════════════════════════

    /**
     * Returns a snapshot object describing every weather param
     * at a named condition.  These are the "keyframes" that
     * transitionTo() blends between.
     */
    static PRESETS = {

        // ── Calm ───────────────────────────────────────────
        clear: {
            intensity:  0,
            windSpeed:  2,
            rain:       0,
            snow:       0,
            dust:       0,
            debris:     0,
            fogDensity: 0,
            skyTint:    [0.53, 0.81, 0.92, 1],
            ambientMul: 1.0,
            sunMul:     1.0,
        },
        overcast: {
            intensity:  0.15,
            windSpeed:  5,
            rain:       0,
            snow:       0,
            dust:       0,
            debris:     0,
            fogDensity: 0.001,
            skyTint:    [0.6, 0.62, 0.65, 1],
            ambientMul: 0.75,
            sunMul:     0.5,
        },

        // ── Rain tiers ─────────────────────────────────────
        light_rain: {
            intensity:  0.2,
            windSpeed:  8,
            rain:       0.25,
            snow:       0,
            dust:       0,
            debris:     0,
            fogDensity: 0.0015,
            skyTint:    [0.45, 0.48, 0.55, 1],
            ambientMul: 0.65,
            sunMul:     0.35,
        },
        heavy_rain: {
            intensity:  0.5,
            windSpeed:  20,
            rain:       0.7,
            snow:       0,
            dust:       0,
            debris:     0,
            fogDensity: 0.004,
            skyTint:    [0.3, 0.32, 0.38, 1],
            ambientMul: 0.4,
            sunMul:     0.15,
        },
        thunderstorm: {
            intensity:  0.65,
            windSpeed:  35,
            rain:       0.9,
            snow:       0,
            dust:       0.1,
            debris:     0.15,
            fogDensity: 0.006,
            skyTint:    [0.2, 0.2, 0.25, 1],
            ambientMul: 0.25,
            sunMul:     0.05,
        },

        // ── Snow tiers ─────────────────────────────────────
        light_snow: {
            intensity:  0.2,
            windSpeed:  6,
            rain:       0,
            snow:       0.3,
            dust:       0,
            debris:     0,
            fogDensity: 0.002,
            skyTint:    [0.7, 0.72, 0.78, 1],
            ambientMul: 0.7,
            sunMul:     0.4,
        },
        blizzard: {
            intensity:  0.75,
            windSpeed:  45,
            rain:       0,
            snow:       1.0,
            dust:       0.2,
            debris:     0.2,
            fogDensity: 0.015,
            skyTint:    [0.85, 0.85, 0.88, 1],
            ambientMul: 0.35,
            sunMul:     0.05,
        },

        // ── Dust / sandstorm ───────────────────────────────
        dust_storm: {
            intensity:  0.6,
            windSpeed:  40,
            rain:       0,
            snow:       0,
            dust:       1.0,
            debris:     0.3,
            fogDensity: 0.012,
            skyTint:    [0.65, 0.5, 0.3, 1],
            ambientMul: 0.45,
            sunMul:     0.15,
        },

        // ── Catastrophic (timeline-jump events) ────────────
        cat5_hurricane: {
            intensity:  1.0,
            windSpeed:  75,     // ~157 mph
            rain:       1.0,
            snow:       0,
            dust:       0.3,
            debris:     1.0,
            fogDensity: 0.02,
            skyTint:    [0.12, 0.12, 0.14, 1],
            ambientMul: 0.15,
            sunMul:     0.0,
        },
        ef5_tornado: {
            intensity:  1.0,
            windSpeed:  90,     // 200+ mph bursts
            rain:       0.8,
            snow:       0,
            dust:       0.6,
            debris:     1.0,
            fogDensity: 0.01,
            skyTint:    [0.15, 0.18, 0.1, 1],   // sickly green
            ambientMul: 0.2,
            sunMul:     0.02,
        },
        volcanic_ashfall: {
            intensity:  0.85,
            windSpeed:  15,
            rain:       0,
            snow:       0,
            dust:       1.0,
            debris:     0.5,
            fogDensity: 0.025,
            skyTint:    [0.25, 0.18, 0.12, 1],   // orange-brown haze
            ambientMul: 0.2,
            sunMul:     0.0,
        },
    };


    // ════════════════════════════════════════════════════════
    //  PUBLIC API
    // ════════════════════════════════════════════════════════

    /**
     * Instantly snap to a named preset (no blend).
     * @param {string} name - Key from WeatherSystem.PRESETS
     */
    setPreset(name) {
        const p = WeatherSystem.PRESETS[name];
        if (!p) {
            console.warn(`⚠️ Weather preset "${name}" not found`);
            return;
        }
        console.log(`🌦️ Weather → ${name}`);
        this._applySnapshot(p);
        this._transition = null;
    }

    /**
     * Smoothly blend from current state to a preset.
     * @param {string}  name     - target preset key
     * @param {number}  duration - seconds to blend
     */
    transitionTo(name, duration = 3) {
        const target = WeatherSystem.PRESETS[name];
        if (!target) {
            console.warn(`⚠️ Weather preset "${name}" not found`);
            return;
        }
        console.log(`🌦️ Transitioning → ${name} over ${duration}s`);
        this._transition = {
            from:     this._captureSnapshot(),
            to:       target,
            elapsed:  0,
            duration: duration,
        };
    }

    /**
     * Register a physics body so wind forces affect it.
     * Call this for the player and any loose objects.
     * @param {BABYLON.PhysicsBody} body
     * @param {number} mass - used to scale wind force
     */
    registerWindTarget(body, mass = 70) {
        this._windTargets.push({ body, mass });
    }

    /**
     * Remove a wind target (e.g. when an object is destroyed).
     */
    unregisterWindTarget(body) {
        this._windTargets = this._windTargets.filter(t => t.body !== body);
    }

    /**
     * Set wind direction (normalized automatically).
     */
    setWindDirection(x, y, z) {
        this.windDir = new BABYLON.Vector3(x, y, z).normalize();
    }

    /**
     * Manually override intensity (0–1).  Useful for scripted
     * ramp-ups during a timeline-jump cutscene.
     */
    setIntensity(value) {
        this.intensity = BABYLON.Scalar.Clamp(value, 0, 1);
    }

    /**
     * Add a custom preset at runtime.
     * Levels can register their own historical-event presets.
     *
     *   weather.addPreset('galveston_1900', {
     *       intensity: 0.95,
     *       windSpeed: 65,
     *       rain: 1.0,
     *       ...
     *   });
     */
    addPreset(name, snapshot) {
        WeatherSystem.PRESETS[name] = snapshot;
        console.log(`🌦️ Registered custom preset: ${name}`);
    }


    // ════════════════════════════════════════════════════════
    //  UPDATE  (call every frame)
    // ════════════════════════════════════════════════════════

    /**
     * @param {number} dt      - delta time in seconds
     * @param {object} player  - core.player  (needs .collider for position)
     */
    update(dt, player) {

        // ── Transition blending ────────────────────────────
        if (this._transition) {
            this._transition.elapsed += dt;
            const t = Math.min(this._transition.elapsed / this._transition.duration, 1);
            const smoothT = t * t * (3 - 2 * t);   // smoothstep
            const blended = this._lerpSnapshot(
                this._transition.from,
                this._transition.to,
                smoothT
            );
            this._applySnapshot(blended);

            if (t >= 1) {
                this._transition = null;
            }
        }

        // ── Move emitter origins to follow player ──────────
        const origin = player?.collider?.position ?? BABYLON.Vector3.Zero();
        this._moveEmitters(origin);

        // ── Wind → physics forces ──────────────────────────
        this._applyWindForces(dt);

        // ── Lightning logic ────────────────────────────────
        if (this.config.lightningEnabled && this.intensity >= 0.5) {
            this._updateLightning(dt);
        }
    }


    // ════════════════════════════════════════════════════════
    //  PARTICLE SYSTEMS (lazy-init)
    // ════════════════════════════════════════════════════════

    /** Rain — angled streaks that fall fast */
    _ensureRain() {
        if (this._rain) return this._rain;

        const emitter = new BABYLON.BoxParticleEmitter();
        emitter.minEmitBox = new BABYLON.Vector3(-40, 30, -40);
        emitter.maxEmitBox = new BABYLON.Vector3( 40, 35,  40);

        const ps = new BABYLON.ParticleSystem('rain', this.config.maxRainDrops, this.scene);
        ps.particleEmitterType = emitter;
        ps.emitter = BABYLON.Vector3.Zero();

        // Texture — a small white streak works great; fall back
        // to the default Babylon.js flare if you have no asset.
        ps.particleTexture = this._getOrCreateTexture('rain');

        ps.minLifeTime = 0.3;
        ps.maxLifeTime = 0.6;
        ps.minSize     = 0.04;
        ps.maxSize     = 0.08;

        ps.direction1 = new BABYLON.Vector3(-0.3, -1, -0.1);
        ps.direction2 = new BABYLON.Vector3( 0.3, -1,  0.1);
        ps.minEmitPower = 40;
        ps.maxEmitPower = 55;

        ps.color1    = new BABYLON.Color4(0.6, 0.65, 0.75, 0.6);
        ps.color2    = new BABYLON.Color4(0.5, 0.55, 0.7,  0.4);
        ps.colorDead = new BABYLON.Color4(0.4, 0.45, 0.6,  0.0);

        ps.gravity   = new BABYLON.Vector3(0, -9.81, 0);
        ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

        ps.emitRate  = 0;   // controlled by _applySnapshot
        ps.start();

        this._rain = ps;
        return ps;
    }

    /** Snow — slow drifting flakes */
    _ensureSnow() {
        if (this._snow) return this._snow;

        const emitter = new BABYLON.BoxParticleEmitter();
        emitter.minEmitBox = new BABYLON.Vector3(-50, 25, -50);
        emitter.maxEmitBox = new BABYLON.Vector3( 50, 35,  50);

        const ps = new BABYLON.ParticleSystem('snow', this.config.maxSnowFlakes, this.scene);
        ps.particleEmitterType = emitter;
        ps.emitter = BABYLON.Vector3.Zero();
        ps.particleTexture = this._getOrCreateTexture('snow');

        ps.minLifeTime = 3;
        ps.maxLifeTime = 6;
        ps.minSize     = 0.06;
        ps.maxSize     = 0.18;

        ps.direction1 = new BABYLON.Vector3(-0.2, -1, -0.2);
        ps.direction2 = new BABYLON.Vector3( 0.2, -1,  0.2);
        ps.minEmitPower = 1;
        ps.maxEmitPower = 3;

        ps.color1    = new BABYLON.Color4(1, 1, 1, 0.9);
        ps.color2    = new BABYLON.Color4(0.9, 0.92, 0.97, 0.7);
        ps.colorDead = new BABYLON.Color4(0.8, 0.82, 0.88, 0);

        ps.gravity   = new BABYLON.Vector3(0, -1.2, 0);
        ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

        ps.emitRate  = 0;
        ps.start();

        this._snow = ps;
        return ps;
    }

    /** Dust / sand / ash — horizontal streaks */
    _ensureDust() {
        if (this._dust) return this._dust;

        const emitter = new BABYLON.BoxParticleEmitter();
        emitter.minEmitBox = new BABYLON.Vector3(-45, 0, -45);
        emitter.maxEmitBox = new BABYLON.Vector3( 45, 8,  45);

        const ps = new BABYLON.ParticleSystem('dust', this.config.maxDustParticles, this.scene);
        ps.particleEmitterType = emitter;
        ps.emitter = BABYLON.Vector3.Zero();
        ps.particleTexture = this._getOrCreateTexture('dust');

        ps.minLifeTime = 1.5;
        ps.maxLifeTime = 4;
        ps.minSize     = 0.3;
        ps.maxSize     = 1.2;

        ps.direction1 = new BABYLON.Vector3(-1, 0.1, -0.5);
        ps.direction2 = new BABYLON.Vector3( 1, 0.4,  0.5);
        ps.minEmitPower = 5;
        ps.maxEmitPower = 15;

        ps.color1    = new BABYLON.Color4(0.6, 0.5, 0.35, 0.35);
        ps.color2    = new BABYLON.Color4(0.5, 0.42, 0.3,  0.2);
        ps.colorDead = new BABYLON.Color4(0.4, 0.35, 0.25, 0);

        ps.gravity   = new BABYLON.Vector3(0, -0.5, 0);
        ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

        ps.emitRate  = 0;
        ps.start();

        this._dust = ps;
        return ps;
    }

    /** Debris — larger chunks flying in catastrophic events */
    _ensureDebris() {
        if (this._debris) return this._debris;

        const emitter = new BABYLON.BoxParticleEmitter();
        emitter.minEmitBox = new BABYLON.Vector3(-30, 0, -30);
        emitter.maxEmitBox = new BABYLON.Vector3( 30, 5,  30);

        const ps = new BABYLON.ParticleSystem('debris', this.config.maxDebris, this.scene);
        ps.particleEmitterType = emitter;
        ps.emitter = BABYLON.Vector3.Zero();
        ps.particleTexture = this._getOrCreateTexture('debris');

        ps.minLifeTime = 1;
        ps.maxLifeTime = 3;
        ps.minSize     = 0.15;
        ps.maxSize     = 0.6;

        ps.minAngularSpeed = -4;
        ps.maxAngularSpeed =  4;

        ps.direction1 = new BABYLON.Vector3(-1, 0.5, -1);
        ps.direction2 = new BABYLON.Vector3( 1, 2,    1);
        ps.minEmitPower = 8;
        ps.maxEmitPower = 25;

        ps.color1    = new BABYLON.Color4(0.35, 0.28, 0.2, 0.9);
        ps.color2    = new BABYLON.Color4(0.25, 0.22, 0.18, 0.7);
        ps.colorDead = new BABYLON.Color4(0.2, 0.18, 0.15, 0);

        ps.gravity   = new BABYLON.Vector3(0, -4, 0);
        ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

        ps.emitRate  = 0;
        ps.start();

        this._debris = ps;
        return ps;
    }


    // ════════════════════════════════════════════════════════
    //  PROCEDURAL TEXTURES (no external assets needed)
    // ════════════════════════════════════════════════════════

    /**
     * Creates tiny runtime textures so the system works with
     * zero external asset dependencies.  Swap these out for
     * real sprites whenever you have art ready.
     */
    _getOrCreateTexture(type) {
        const key = `__weather_tex_${type}`;
        if (this.scene.metadata?.[key]) return this.scene.metadata[key];

        const size = 32;
        const dt   = new BABYLON.DynamicTexture(key, size, this.scene, false);
        const ctx  = dt.getContext();

        switch (type) {
            case 'rain': {
                // Vertical white streak
                ctx.clearRect(0, 0, size, size);
                ctx.strokeStyle = 'rgba(200,210,230,0.8)';
                ctx.lineWidth   = 2;
                ctx.beginPath();
                ctx.moveTo(size / 2, 2);
                ctx.lineTo(size / 2, size - 2);
                ctx.stroke();
                break;
            }
            case 'snow': {
                // Soft white circle
                ctx.clearRect(0, 0, size, size);
                const grad = ctx.createRadialGradient(
                    size/2, size/2, 0, size/2, size/2, size/2
                );
                grad.addColorStop(0, 'rgba(255,255,255,0.9)');
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, size, size);
                break;
            }
            case 'dust': {
                // Blurry tan blob
                ctx.clearRect(0, 0, size, size);
                const g = ctx.createRadialGradient(
                    size/2, size/2, 0, size/2, size/2, size/2
                );
                g.addColorStop(0, 'rgba(180,160,120,0.5)');
                g.addColorStop(1, 'rgba(180,160,120,0)');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, size, size);
                break;
            }
            case 'debris': {
                // Small dark square chunk
                ctx.clearRect(0, 0, size, size);
                ctx.fillStyle = 'rgba(80,65,50,0.85)';
                ctx.fillRect(6, 6, size - 12, size - 12);
                break;
            }
            default: {
                ctx.clearRect(0, 0, size, size);
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, size, size);
            }
        }

        dt.update();
        if (!this.scene.metadata) this.scene.metadata = {};
        this.scene.metadata[key] = dt;
        return dt;
    }


    // ════════════════════════════════════════════════════════
    //  SNAPSHOT HELPERS (capture, apply, lerp)
    // ════════════════════════════════════════════════════════

    /** Capture the current live state into a snapshot object */
    _captureSnapshot() {
        const sc = this.scene.clearColor;
        return {
            intensity:  this.intensity,
            windSpeed:  this.windSpeed,
            rain:       this._rain  ? this._rain.emitRate  / this.config.maxRainDrops    : 0,
            snow:       this._snow  ? this._snow.emitRate  / this.config.maxSnowFlakes   : 0,
            dust:       this._dust  ? this._dust.emitRate  / this.config.maxDustParticles : 0,
            debris:     this._debris? this._debris.emitRate / this.config.maxDebris        : 0,
            fogDensity: this.scene.fogDensity || 0,
            skyTint:    [sc.r, sc.g, sc.b, sc.a],
            ambientMul: this._ambient ? this._ambient.intensity / 0.6 : 1,
            sunMul:     this._sun     ? this._sun.intensity     / 0.8 : 1,
        };
    }

    /** Apply a snapshot object to the live scene */
    _applySnapshot(s) {
        // Intensity & wind
        this.intensity = s.intensity;
        this.windSpeed = s.windSpeed;

        // Particle rates
        if (s.rain   > 0) this._ensureRain().emitRate   = s.rain   * this.config.maxRainDrops;
        else if (this._rain) this._rain.emitRate = 0;

        if (s.snow   > 0) this._ensureSnow().emitRate   = s.snow   * this.config.maxSnowFlakes;
        else if (this._snow) this._snow.emitRate = 0;

        if (s.dust   > 0) this._ensureDust().emitRate   = s.dust   * this.config.maxDustParticles;
        else if (this._dust) this._dust.emitRate = 0;

        if (s.debris > 0) this._ensureDebris().emitRate  = s.debris * this.config.maxDebris;
        else if (this._debris) this._debris.emitRate = 0;

        // Fog
        if (s.fogDensity > 0) {
            this.scene.fogMode    = BABYLON.Scene.FOGMODE_EXP2;
            this.scene.fogDensity = s.fogDensity;
            this.scene.fogColor   = new BABYLON.Color3(
                s.skyTint[0] * 0.9,
                s.skyTint[1] * 0.9,
                s.skyTint[2] * 0.9
            );
        } else {
            this.scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
        }

        // Sky
        this.scene.clearColor = new BABYLON.Color4(
            s.skyTint[0], s.skyTint[1], s.skyTint[2], s.skyTint[3]
        );

        // Lighting
        if (this._ambient) this._ambient.intensity = 0.6 * s.ambientMul;
        if (this._sun)     this._sun.intensity     = 0.8 * s.sunMul;

        // Tilt rain/dust direction with wind
        this._updateParticleWindBias();
    }

    /** Linearly interpolate between two snapshots */
    _lerpSnapshot(a, b, t) {
        const lerp = (x, y) => x + (y - x) * t;
        return {
            intensity:  lerp(a.intensity, b.intensity),
            windSpeed:  lerp(a.windSpeed, b.windSpeed),
            rain:       lerp(a.rain,      b.rain),
            snow:       lerp(a.snow,      b.snow),
            dust:       lerp(a.dust,      b.dust),
            debris:     lerp(a.debris,    b.debris),
            fogDensity: lerp(a.fogDensity, b.fogDensity),
            skyTint: [
                lerp(a.skyTint[0], b.skyTint[0]),
                lerp(a.skyTint[1], b.skyTint[1]),
                lerp(a.skyTint[2], b.skyTint[2]),
                lerp(a.skyTint[3], b.skyTint[3]),
            ],
            ambientMul: lerp(a.ambientMul, b.ambientMul),
            sunMul:     lerp(a.sunMul,     b.sunMul),
        };
    }


    // ════════════════════════════════════════════════════════
    //  WIND → PHYSICS
    // ════════════════════════════════════════════════════════

    /** Push registered physics bodies in the wind direction */
    _applyWindForces(dt) {
        if (this.windSpeed < 1 || this._windTargets.length === 0) return;

        // Wind force scales quadratically (drag equation feel)
        const forceMag = this.windSpeed * this.windSpeed *
                         0.05 * this.config.windPhysicsScale;

        // Add slight gust variation for catastrophic events
        const gustMul = this.intensity > 0.7
            ? 1 + Math.sin(performance.now() * 0.003) * 0.35
            : 1;

        const force = this.windDir.scale(forceMag * gustMul);

        for (const target of this._windTargets) {
            try {
                target.body.applyForce(
                    force.scale(target.mass / 70),  // normalize around human mass
                    target.body.getObjectCenterWorld()
                );
            } catch (_) {
                // Body may have been disposed — we'll prune on next call
            }
        }

        // Prune dead bodies
        this._windTargets = this._windTargets.filter(t => {
            try { t.body.getObjectCenterWorld(); return true; }
            catch { return false; }
        });
    }

    /**
     * Bias rain/dust particle direction to match current wind.
     * Makes rain blow sideways in strong storms.
     */
    _updateParticleWindBias() {
        const bias = this.windDir.scale(this.windSpeed * 0.02);

        if (this._rain) {
            this._rain.direction1 = new BABYLON.Vector3(-0.3 + bias.x, -1, -0.1 + bias.z);
            this._rain.direction2 = new BABYLON.Vector3( 0.3 + bias.x, -1,  0.1 + bias.z);
        }
        if (this._dust) {
            this._dust.direction1 = new BABYLON.Vector3(-1 + bias.x, 0.1, -0.5 + bias.z);
            this._dust.direction2 = new BABYLON.Vector3( 1 + bias.x, 0.4,  0.5 + bias.z);
        }
        if (this._debris) {
            this._debris.direction1 = new BABYLON.Vector3(-1 + bias.x, 0.5, -1 + bias.z);
            this._debris.direction2 = new BABYLON.Vector3( 1 + bias.x, 2,    1 + bias.z);
        }
    }


    // ════════════════════════════════════════════════════════
    //  LIGHTNING
    // ════════════════════════════════════════════════════════

    _updateLightning(dt) {
        this._lightningTimer -= dt;

        // Random strike interval — more frequent at higher intensity
        if (this._lightningTimer <= 0) {
            const minInterval = BABYLON.Scalar.Lerp(8, 1.5, this.intensity);
            const maxInterval = BABYLON.Scalar.Lerp(15, 4, this.intensity);
            this._lightningTimer = minInterval + Math.random() * (maxInterval - minInterval);
            this._triggerLightningFlash();
        }

        // Fade flash light
        if (this._lightningFlash) {
            this._lightningFlash.intensity *= 0.85;  // rapid decay
            if (this._lightningFlash.intensity < 0.01) {
                this._lightningFlash.intensity = 0;
            }
        }
    }

    _triggerLightningFlash() {
        // Create flash light once
        if (!this._lightningFlash) {
            this._lightningFlash = new BABYLON.PointLight(
                'lightning_flash',
                new BABYLON.Vector3(0, 60, 0),
                this.scene
            );
            this._lightningFlash.diffuse  = new BABYLON.Color3(0.85, 0.85, 1);
            this._lightningFlash.range    = 300;
            this._lightningFlash.intensity = 0;
        }

        // Randomize position in sky
        this._lightningFlash.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 120,
            50 + Math.random() * 30,
            (Math.random() - 0.5) * 120
        );

        // FLASH!
        const power = 2 + this.intensity * 6;
        this._lightningFlash.intensity = power;

        // Quick double-flash effect for realism
        setTimeout(() => {
            if (this._lightningFlash) {
                this._lightningFlash.intensity = power * 0.6;
            }
        }, 80);

        console.log('⚡ Lightning strike!');
    }


    // ════════════════════════════════════════════════════════
    //  EMITTER TRACKING (follow player)
    // ════════════════════════════════════════════════════════

    _moveEmitters(origin) {
        const systems = [this._rain, this._snow, this._dust, this._debris];
        for (const ps of systems) {
            if (ps) {
                ps.emitter = origin;
            }
        }
    }


    // ════════════════════════════════════════════════════════
    //  CLEANUP
    // ════════════════════════════════════════════════════════

    dispose() {
        [this._rain, this._snow, this._dust, this._debris].forEach(ps => {
            if (ps) { ps.stop(); ps.dispose(); }
        });
        if (this._lightningFlash) this._lightningFlash.dispose();

        this._windTargets = [];
        console.log('🌦️ Weather Systems disposed');
    }
}
