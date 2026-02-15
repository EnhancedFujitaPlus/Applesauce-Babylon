/**
 * APPLESAUCE Helmet Effects Manager
 * Handles particles, explosions, and elemental effects
 */

export class HelmetEffectsManager {
    constructor(scene) {
        this.scene = scene;
        this.particleSystems = [];
        this.meshPool = [];
        
        console.log('✨ Effects Manager initialized');
    }
    
    /**
     * Create impact burst (default attack effect)
     */
    createImpactBurst(position, color = '#FFFFFF') {
        const particleSystem = new BABYLON.ParticleSystem(
            "impactBurst",
            500,
            this.scene
        );
        
        // Texture
        particleSystem.particleTexture = new BABYLON.Texture(
            "https://www.babylonjs-playground.com/textures/flare.png",
            this.scene
        );
        
        // Emitter
        particleSystem.emitter = position.clone();
        particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
        
        // Colors
        const baseColor = BABYLON.Color3.FromHexString(color);
        particleSystem.color1 = new BABYLON.Color4(baseColor.r, baseColor.g, baseColor.b, 1);
        particleSystem.color2 = new BABYLON.Color4(baseColor.r * 0.5, baseColor.g * 0.5, baseColor.b * 0.5, 0.5);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        // Size
        particleSystem.minSize = 0.3;
        particleSystem.maxSize = 0.8;
        
        // Lifetime
        particleSystem.minLifeTime = 0.2;
        particleSystem.maxLifeTime = 0.5;
        
        // Emission
        particleSystem.emitRate = 500;
        particleSystem.manualEmitCount = 50;
        
        // Speed
        particleSystem.minEmitPower = 5;
        particleSystem.maxEmitPower = 15;
        particleSystem.updateSpeed = 0.01;
        
        // Direction
        particleSystem.direction1 = new BABYLON.Vector3(-1, 0.5, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
        
        // Gravity
        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
        
        // Start and auto-dispose
        particleSystem.start();
        
        setTimeout(() => {
            particleSystem.stop();
            setTimeout(() => {
                particleSystem.dispose();
            }, 1000);
        }, 100);
        
        return particleSystem;
    }
    
    /**
     * Create elemental burst (fire, ice, electric)
     */
    createElementalBurst(position, element, color = null) {
        switch (element) {
            case 'fire':
                return this.createFireBurst(position, color || '#FF4500');
            case 'ice':
                return this.createIceBurst(position, color || '#00FFFF');
            case 'electric':
                return this.createElectricBurst(position, color || '#FFFF00');
            case 'gore':
                return this.createGoreBurst(position, color || '#8B0000');
            default:
                return this.createImpactBurst(position, color || '#FFFFFF');
        }
    }
    
    /**
     * Fire burst effect
     */
    createFireBurst(position, color) {
        const fire = new BABYLON.ParticleSystem("fire", 800, this.scene);
        
        fire.particleTexture = new BABYLON.Texture(
            "https://www.babylonjs-playground.com/textures/flare.png",
            this.scene
        );
        
        fire.emitter = position.clone();
        fire.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
        fire.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5);
        
        // Fire colors
        fire.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
        fire.color2 = new BABYLON.Color4(1, 0.2, 0, 1);
        fire.colorDead = new BABYLON.Color4(0.2, 0.1, 0, 0);
        
        fire.minSize = 0.5;
        fire.maxSize = 1.5;
        
        fire.minLifeTime = 0.3;
        fire.maxLifeTime = 0.8;
        
        fire.emitRate = 1000;
        fire.manualEmitCount = 100;
        
        fire.minEmitPower = 3;
        fire.maxEmitPower = 8;
        fire.updateSpeed = 0.015;
        
        fire.direction1 = new BABYLON.Vector3(-2, 2, -2);
        fire.direction2 = new BABYLON.Vector3(2, 4, 2);
        
        fire.gravity = new BABYLON.Vector3(0, 5, 0); // Fire rises
        
        fire.start();
        setTimeout(() => {
            fire.stop();
            setTimeout(() => fire.dispose(), 1000);
        }, 150);
        
        return fire;
    }
    
    /**
     * Ice burst effect
     */
    createIceBurst(position, color) {
        const ice = new BABYLON.ParticleSystem("ice", 600, this.scene);
        
        ice.particleTexture = new BABYLON.Texture(
            "https://www.babylonjs-playground.com/textures/flare.png",
            this.scene
        );
        
        ice.emitter = position.clone();
        ice.minEmitBox = new BABYLON.Vector3(0, 0, 0);
        ice.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
        
        // Ice colors (cyan/white)
        ice.color1 = new BABYLON.Color4(0, 1, 1, 1);
        ice.color2 = new BABYLON.Color4(0.5, 0.8, 1, 0.8);
        ice.colorDead = new BABYLON.Color4(1, 1, 1, 0);
        
        ice.minSize = 0.2;
        ice.maxSize = 0.6;
        
        ice.minLifeTime = 0.5;
        ice.maxLifeTime = 1.2;
        
        ice.emitRate = 800;
        ice.manualEmitCount = 80;
        
        ice.minEmitPower = 2;
        ice.maxEmitPower = 6;
        ice.updateSpeed = 0.01;
        
        ice.direction1 = new BABYLON.Vector3(-1, -0.5, -1);
        ice.direction2 = new BABYLON.Vector3(1, 0.5, 1);
        
        ice.gravity = new BABYLON.Vector3(0, -15, 0); // Ice falls fast
        
        // Create ice shards (temporary meshes)
        this.createIceShards(position);
        
        ice.start();
        setTimeout(() => {
            ice.stop();
            setTimeout(() => ice.dispose(), 1500);
        }, 100);
        
        return ice;
    }
    
    /**
     * Electric burst effect
     */
    createElectricBurst(position, color) {
        const electric = new BABYLON.ParticleSystem("electric", 400, this.scene);
        
        electric.particleTexture = new BABYLON.Texture(
            "https://www.babylonjs-playground.com/textures/flare.png",
            this.scene
        );
        
        electric.emitter = position.clone();
        electric.minEmitBox = new BABYLON.Vector3(-0.3, -0.3, -0.3);
        electric.maxEmitBox = new BABYLON.Vector3(0.3, 0.3, 0.3);
        
        // Electric colors (yellow/white)
        electric.color1 = new BABYLON.Color4(1, 1, 0, 1);
        electric.color2 = new BABYLON.Color4(1, 1, 1, 0.8);
        electric.colorDead = new BABYLON.Color4(0.5, 0.5, 0.5, 0);
        
        electric.minSize = 0.1;
        electric.maxSize = 0.4;
        
        electric.minLifeTime = 0.1;
        electric.maxLifeTime = 0.3;
        
        electric.emitRate = 2000;
        electric.manualEmitCount = 60;
        
        electric.minEmitPower = 10;
        electric.maxEmitPower = 20;
        electric.updateSpeed = 0.005;
        
        electric.direction1 = new BABYLON.Vector3(-3, -3, -3);
        electric.direction2 = new BABYLON.Vector3(3, 3, 3);
        
        electric.gravity = new BABYLON.Vector3(0, 0, 0); // No gravity
        
        // Create lightning arc
        this.createLightningArc(position);
        
        electric.start();
        setTimeout(() => {
            electric.stop();
            setTimeout(() => electric.dispose(), 500);
        }, 80);
        
        return electric;
    }
    
    /**
     * Gore burst effect
     */
    createGoreBurst(position, color) {
        const gore = new BABYLON.ParticleSystem("gore", 300, this.scene);
        
        gore.particleTexture = new BABYLON.Texture(
            "https://www.babylonjs-playground.com/textures/flare.png",
            this.scene
        );
        
        gore.emitter = position.clone();
        gore.minEmitBox = new BABYLON.Vector3(-0.2, 0, -0.2);
        gore.maxEmitBox = new BABYLON.Vector3(0.2, 0.5, 0.2);
        
        // Blood colors
        gore.color1 = new BABYLON.Color4(0.6, 0, 0, 1);
        gore.color2 = new BABYLON.Color4(0.8, 0.1, 0.1, 0.9);
        gore.colorDead = new BABYLON.Color4(0.2, 0, 0, 0);
        
        gore.minSize = 0.3;
        gore.maxSize = 0.7;
        
        gore.minLifeTime = 0.8;
        gore.maxLifeTime = 1.5;
        
        gore.emitRate = 500;
        gore.manualEmitCount = 40;
        
        gore.minEmitPower = 3;
        gore.maxEmitPower = 8;
        gore.updateSpeed = 0.012;
        
        gore.direction1 = new BABYLON.Vector3(-1, 1, -1);
        gore.direction2 = new BABYLON.Vector3(1, 3, 1);
        
        gore.gravity = new BABYLON.Vector3(0, -20, 0);
        
        gore.start();
        setTimeout(() => {
            gore.stop();
            setTimeout(() => gore.dispose(), 2000);
        }, 120);
        
        return gore;
    }
    
    /**
     * Create hit effect on target
     */
    createHitEffect(position, element, color) {
        // Small burst at hit location
        const hitEffect = new BABYLON.ParticleSystem("hit", 200, this.scene);
        
        hitEffect.particleTexture = new BABYLON.Texture(
            "https://www.babylonjs-playground.com/textures/flare.png",
            this.scene
        );
        
        hitEffect.emitter = position.clone();
        hitEffect.minEmitBox = new BABYLON.Vector3(0, 0, 0);
        hitEffect.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
        
        const baseColor = BABYLON.Color3.FromHexString(color || '#FFFFFF');
        hitEffect.color1 = new BABYLON.Color4(baseColor.r, baseColor.g, baseColor.b, 1);
        hitEffect.color2 = new BABYLON.Color4(1, 1, 1, 0.5);
        hitEffect.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        hitEffect.minSize = 0.2;
        hitEffect.maxSize = 0.5;
        
        hitEffect.minLifeTime = 0.2;
        hitEffect.maxLifeTime = 0.4;
        
        hitEffect.emitRate = 1000;
        hitEffect.manualEmitCount = 30;
        
        hitEffect.minEmitPower = 2;
        hitEffect.maxEmitPower = 5;
        
        hitEffect.direction1 = new BABYLON.Vector3(-1, 0, -1);
        hitEffect.direction2 = new BABYLON.Vector3(1, 2, 1);
        
        hitEffect.gravity = new BABYLON.Vector3(0, -10, 0);
        
        hitEffect.start();
        setTimeout(() => {
            hitEffect.stop();
            setTimeout(() => hitEffect.dispose(), 600);
        }, 50);
        
        return hitEffect;
    }
    
    /**
     * Create death explosion
     */
    createDeathExplosion(position, element, color) {
        // Large dramatic explosion
        const explosion = new BABYLON.ParticleSystem("death", 1000, this.scene);
        
        explosion.particleTexture = new BABYLON.Texture(
            "https://www.babylonjs-playground.com/textures/flare.png",
            this.scene
        );
        
        explosion.emitter = position.clone();
        explosion.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5);
        explosion.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);
        
        const baseColor = BABYLON.Color3.FromHexString(color || '#FF0000');
        explosion.color1 = new BABYLON.Color4(baseColor.r, baseColor.g, baseColor.b, 1);
        explosion.color2 = new BABYLON.Color4(1, 1, 0, 0.8);
        explosion.colorDead = new BABYLON.Color4(0.1, 0.1, 0.1, 0);
        
        explosion.minSize = 0.5;
        explosion.maxSize = 2.0;
        
        explosion.minLifeTime = 0.5;
        explosion.maxLifeTime = 1.5;
        
        explosion.emitRate = 2000;
        explosion.manualEmitCount = 150;
        
        explosion.minEmitPower = 5;
        explosion.maxEmitPower = 20;
        
        explosion.direction1 = new BABYLON.Vector3(-3, -1, -3);
        explosion.direction2 = new BABYLON.Vector3(3, 5, 3);
        
        explosion.gravity = new BABYLON.Vector3(0, -15, 0);
        
        explosion.start();
        setTimeout(() => {
            explosion.stop();
            setTimeout(() => explosion.dispose(), 2000);
        }, 200);
        
        return explosion;
    }
    
    /**
     * Create gore splatter (blood spray)
     */
    createGoreSplatter(position, direction) {
        const splatter = new BABYLON.ParticleSystem("splatter", 500, this.scene);
        
        splatter.particleTexture = new BABYLON.Texture(
            "https://www.babylonjs-playground.com/textures/flare.png",
            this.scene
        );
        
        splatter.emitter = position.clone();
        splatter.minEmitBox = new BABYLON.Vector3(-0.3, 0, -0.3);
        splatter.maxEmitBox = new BABYLON.Vector3(0.3, 0.3, 0.3);
        
        splatter.color1 = new BABYLON.Color4(0.7, 0, 0, 1);
        splatter.color2 = new BABYLON.Color4(0.5, 0.05, 0.05, 0.9);
        splatter.colorDead = new BABYLON.Color4(0.2, 0, 0, 0);
        
        splatter.minSize = 0.2;
        splatter.maxSize = 0.8;
        
        splatter.minLifeTime = 1.0;
        splatter.maxLifeTime = 2.5;
        
        splatter.emitRate = 800;
        splatter.manualEmitCount = 80;
        
        splatter.minEmitPower = 5;
        splatter.maxEmitPower = 15;
        
        // Spray in direction
        const baseDir = direction.normalize();
        splatter.direction1 = baseDir.scale(0.5);
        splatter.direction2 = baseDir.scale(2);
        
        splatter.gravity = new BABYLON.Vector3(0, -25, 0);
        
        splatter.start();
        setTimeout(() => {
            splatter.stop();
            setTimeout(() => splatter.dispose(), 3000);
        }, 300);
        
        return splatter;
    }
    
    /**
     * Create ice shards (temporary geometry)
     */
    createIceShards(position) {
        const shardCount = 8;
        
        for (let i = 0; i < shardCount; i++) {
            const shard = BABYLON.MeshBuilder.CreateBox(
                "iceShard",
                { width: 0.1, height: 0.4, depth: 0.1 },
                this.scene
            );
            
            shard.position = position.clone();
            
            const mat = new BABYLON.StandardMaterial("shardMat", this.scene);
            mat.diffuseColor = new BABYLON.Color3(0.5, 0.8, 1);
            mat.emissiveColor = new BABYLON.Color3(0.2, 0.4, 0.5);
            mat.alpha = 0.7;
            shard.material = mat;
            
            // Random velocity
            const angle = (Math.PI * 2 * i) / shardCount;
            const velocity = new BABYLON.Vector3(
                Math.cos(angle) * 3,
                Math.random() * 5 + 2,
                Math.sin(angle) * 3
            );
            
            // Animate
            const startTime = Date.now();
            const animateShard = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                if (elapsed > 1.5) {
                    shard.dispose();
                    return;
                }
                
                shard.position.addInPlace(velocity.scale(0.016));
                velocity.y -= 0.3; // Gravity
                shard.rotation.x += 0.1;
                shard.rotation.z += 0.15;
                
                mat.alpha = 0.7 * (1 - elapsed / 1.5);
                
                requestAnimationFrame(animateShard);
            };
            animateShard();
        }
    }
    
    /**
     * Create lightning arc (temporary line)
     */
    createLightningArc(position) {
        const segments = 10;
        const points = [position.clone()];
        
        // Generate jagged lightning path
        let currentPos = position.clone();
        for (let i = 0; i < segments; i++) {
            currentPos = currentPos.add(new BABYLON.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ));
            points.push(currentPos.clone());
        }
        
        const lightning = BABYLON.MeshBuilder.CreateLines(
            "lightning",
            { points: points },
            this.scene
        );
        
        lightning.color = new BABYLON.Color3(1, 1, 0);
        
        // Fade out and dispose
        setTimeout(() => lightning.dispose(), 150);
    }
    
    /**
     * Dispose all active effects
     */
    dispose() {
        this.particleSystems.forEach(ps => {
            if (ps && ps.dispose) ps.dispose();
        });
        this.particleSystems = [];
        
        console.log('✨ Effects Manager disposed');
    }
}
