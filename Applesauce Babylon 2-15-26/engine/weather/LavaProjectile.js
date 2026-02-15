// LavaProjectile.js
class LavaProjectile extends PhysicsEntity {
    constructor(config) {
        super({
            ...config,
            type: 'lava',
            color: 0xFF4500,
            collisionRadius: config.size || 1
        });
        
        // Make it glow
        this.mesh.material.emissive = new THREE.Color(0xFF6600);
        this.mesh.material.emissiveIntensity = 0.8;
        
        // Trail effect
        this.trailParticles = [];
    }
    
    update(scene) {
        const alive = super.update(scene);
        
        // Leave trail of particles
        if (Math.random() < 0.3) {
            this.createTrailParticle(scene);
        }
        
        return alive;
    }
    
    createTrailParticle(scene) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.1),
            new THREE.MeshBasicMaterial({ 
                color: 0xFFAA00,
                transparent: true,
                opacity: 0.8
            })
        );
        particle.position.copy(this.position);
        particle.lifetime = 20;
        scene.add(particle);
        
        this.trailParticles.push(particle);
        
        // Fade and remove trail
        setTimeout(() => {
            scene.remove(particle);
        }, 500);
    }
    
    onGroundHit(scene) {
        // Create small crater/scorch mark
        const scorch = new THREE.Mesh(
            new THREE.CircleGeometry(this.size, 16),
            new THREE.MeshBasicMaterial({ 
                color: 0x2a0a0a,
                side: THREE.DoubleSide
            })
        );
        scorch.rotation.x = -Math.PI / 2;
        scorch.position.set(this.position.x, 0.05, this.position.z);
        scene.add(scorch);
        
        // Fade after time
        setTimeout(() => {
            scene.remove(scorch);
        }, 10000);
    }
}