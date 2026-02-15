// ===================================
// VOLCANO WEATHER MODULE
// ===================================
class VolcanoWeather {
    constructor(core, config) {
        this.core = core;
        this.volcanoes = [];
        this.projectiles = [];
        this.init(config);
    }
    
    init(config) {
        // Create volcanoes
        config.volcanoes.forEach(volcanoConfig => {
            this.createVolcano(volcanoConfig);
        });
    }
    
    createVolcano(config) {
        const volcanoGroup = new THREE.Group();
        
        // Volcano cone
        const coneGeo = new THREE.ConeGeometry(
            config.baseRadius,
            config.height,
            32
        );
        const coneMat = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.9 
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.y = config.height / 2;
        cone.castShadow = true;
        volcanoGroup.add(cone);
        
        // Lava crater on top
        const craterGeo = new THREE.CylinderGeometry(
            config.baseRadius * 0.3,
            config.baseRadius * 0.4,
            config.height * 0.1,
            32
        );
        const crateMat = new THREE.MeshStandardMaterial({ 
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 0.8
        });
        const crater = new THREE.Mesh(craterGeo, crateMat);
        crater.position.y = config.height;
        volcanoGroup.add(crater);
        
        volcanoGroup.position.copy(config.position);
        this.core.scene.add(volcanoGroup);
        
        // Store volcano data
        this.volcanoes.push({
            group: volcanoGroup,
            config: config,
            nextEruption: config.eruptionInterval,
            erupting: false,
            eruptionTimer: 0
        });
    }
    
    update() {
        this.volcanoes.forEach(volcano => {
            volcano.nextEruption--;
            
            if (volcano.nextEruption <= 0 && !volcano.erupting) {
                this.erupt(volcano);
                volcano.erupting = true;
                volcano.eruptionTimer = volcano.config.eruptionDuration;
                volcano.nextEruption = volcano.config.eruptionInterval;
            }
            
            if (volcano.erupting) {
                volcano.eruptionTimer--;
                if (volcano.eruptionTimer <= 0) {
                    volcano.erupting = false;
                }
            }
        });
        
        // Update projectiles
        this.updateProjectiles();
    }
    
    erupt(volcano) {
        const pos = volcano.group.position;
        const height = volcano.config.height;
        
        for (let i = 0; i < volcano.config.projectileCount; i++) {
            this.launchProjectile(
                pos.x,
                pos.y + height,
                pos.z
            );
        }
    }
    
    launchProjectile(x, y, z) {
        // Create lava rock
        const rockGeo = new THREE.SphereGeometry(0.5 + Math.random() * 0.5);
        const rockMat = new THREE.MeshStandardMaterial({ 
            color: 0xFF4500,
            emissive: 0xFF0000,
            emissiveIntensity: 0.6
        });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(x, y, z);
        rock.castShadow = true;
        
        this.core.scene.add(rock);
        
        // Random trajectory
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.3;
        const upSpeed = 0.5 + Math.random() * 0.5;
        
        this.projectiles.push({
            mesh: rock,
            velocity: new THREE.Vector3(
                Math.cos(angle) * speed,
                upSpeed,
                Math.sin(angle) * speed
            ),
            gravity: -0.02,
            lifetime: 300
        });
    }
    
    updateProjectiles() {
        this.projectiles = this.projectiles.filter(proj => {
            // Apply gravity
            proj.velocity.y += proj.gravity;
            proj.mesh.position.add(proj.velocity);
            
            // Rotation for effect
            proj.mesh.rotation.x += 0.1;
            proj.mesh.rotation.y += 0.1;
            
            // Check ground collision
            if (proj.mesh.position.y <= 0) {
                this.core.scene.remove(proj.mesh);
                return false;
            }
            
            // Check player collision
            if (this.core.player) {
                const dist = proj.mesh.position.distanceTo(this.core.player.position);
                if (dist < 2) {
                    // Hit player!
                    console.log('🌋 HIT BY LAVA!');
                    if (this.core.modules.gore) {
                        // Trigger gore effect - massive splatter for lava death
                        const velocity = proj.velocity.clone().normalize().multiplyScalar(0.3);
                        this.core.modules.gore.createMassiveSplatter(
                            this.core.player.position.clone(),
                            velocity
                        );
                    }
                    this.core.scene.remove(proj.mesh);
                    return false;
                }
            }
            
            // Lifetime
            proj.lifetime--;
            return proj.lifetime > 0;
        });
    }
    
    clear() {
        // Remove all volcanoes
        this.volcanoes.forEach(v => this.core.scene.remove(v.group));
        this.volcanoes = [];
        
        // Remove all projectiles
        this.projectiles.forEach(p => this.core.scene.remove(p.mesh));
        this.projectiles = [];
    }
}