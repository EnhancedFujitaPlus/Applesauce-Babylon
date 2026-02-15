// ============================================
// JACKET LOADER MODULE
// ============================================
// Load custom jacket data from localStorage and apply to player

class JacketLoader {
    constructor(scene, playerObject) {
        this.scene = scene;
        this.playerObject = playerObject;
        this.jacketGroup = null;
        this.currentJacketData = null;
        this.activeSlot = this.getActiveSlot();
    }

    // Get the currently active jacket slot (defaults to 1)
    getActiveSlot() {
        return parseInt(localStorage.getItem('active_jacket_slot') || '1');
    }

    // Set which jacket slot is active
    setActiveSlot(slotNum) {
        localStorage.setItem('active_jacket_slot', slotNum);
        this.activeSlot = slotNum;
    }

    // Load jacket from current active slot
    loadJacket() {
        const saved = localStorage.getItem(`jacket_slot_${this.activeSlot}`);
        
        if (!saved) {
            console.log('No jacket in active slot, loading default');
            this.loadDefaultJacket();
            return;
        }

        try {
            this.currentJacketData = JSON.parse(saved);
            this.buildJacket(this.currentJacketData);
            console.log('Loaded custom jacket:', this.currentJacketData.name);
        } catch (error) {
            console.error('Failed to load jacket:', error);
            this.loadDefaultJacket();
        }
    }

    // Load default jacket if no custom one exists
    loadDefaultJacket() {
        this.currentJacketData = {
            name: 'Default Jacket',
            sleeveType: 'sleeveless',
            jacketType: 'vest',
            colors: {
                base: '#1a1a1a',
                accent: '#FFD700',
                trim: '#666666'
            },
            material: 'fabric',
            damage: {
                burns: 0,
                scratches: 0,
                blood: 0,
                dirt: 0
            },
            wear: 'pristine',
            studs: 0,
            physics: {
                simulation: 'none',
                stiffness: 50,
                wind: 0
            }
        };
        this.buildJacket(this.currentJacketData);
    }

    // Build the jacket mesh from data
    buildJacket(data) {
        // Remove existing jacket
        if (this.jacketGroup) {
            this.scene.remove(this.jacketGroup);
        }

        this.jacketGroup = new THREE.Group();

        // Create torso
        const torso = this.createTorso(data);
        this.jacketGroup.add(torso);

        // Create sleeves
        if (data.sleeveType !== 'sleeveless') {
            const sleeves = this.createSleeves(data);
            this.jacketGroup.add(...sleeves);
        }

        // Create collar
        const collar = this.createCollar(data);
        this.jacketGroup.add(collar);

        // Create closure (zipper/buttons)
        const closure = this.createClosure(data);
        this.jacketGroup.add(closure);

        // Create pockets
        const pockets = this.createPockets(data);
        this.jacketGroup.add(...pockets);

        // Apply damage effects
        this.applyDamageEffects(data);

        // Attach to player
        this.attachToPlayer();
    }

    // Create torso mesh
    createTorso(data) {
        const group = new THREE.Group();
        const baseScale = 0.3; // Scale down for player
        
        // Main body
        const bodyGeo = new THREE.BoxGeometry(1.8 * baseScale, 2 * baseScale, 0.6 * baseScale);
        const bodyMat = this.createMaterial(data.colors.base, data.material);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.castShadow = true;
        group.add(body);

        // Back piece
        const backGeo = new THREE.BoxGeometry(1.8 * baseScale, 2 * baseScale, 0.05 * baseScale);
        const backMat = this.createMaterial(data.colors.base, data.material);
        const back = new THREE.Mesh(backGeo, backMat);
        back.position.z = -0.3 * baseScale;
        back.castShadow = true;
        group.add(back);

        return group;
    }

    // Create sleeves
    createSleeves(data) {
        const sleeves = [];
        const baseScale = 0.3;
        const mat = this.createMaterial(data.colors.base, data.material);
        
        let sleeveLength;
        switch(data.sleeveType) {
            case 'short':
                sleeveLength = 0.6;
                break;
            case 'long':
                sleeveLength = 1.5;
                break;
            case 'hoodie':
                sleeveLength = 1.8;
                break;
            default:
                return sleeves;
        }
        
        sleeveLength *= baseScale;

        // Left sleeve
        const sleeveGeo = new THREE.CylinderGeometry(
            0.25 * baseScale, 
            0.22 * baseScale, 
            sleeveLength, 
            16
        );
        const leftSleeve = new THREE.Mesh(sleeveGeo, mat);
        leftSleeve.position.set(-1.1 * baseScale, 0.4 * baseScale, 0);
        leftSleeve.rotation.z = Math.PI / 2;
        leftSleeve.castShadow = true;
        sleeves.push(leftSleeve);

        // Right sleeve
        const rightSleeve = leftSleeve.clone();
        rightSleeve.position.set(1.1 * baseScale, 0.4 * baseScale, 0);
        sleeves.push(rightSleeve);

        // Add hood if hoodie
        if (data.sleeveType === 'hoodie') {
            const hood = this.createHood(data, baseScale);
            sleeves.push(hood);
        }

        return sleeves;
    }

    // Create hood
    createHood(data, baseScale) {
        const mat = this.createMaterial(data.colors.base, data.material);
        
        const hoodGeo = new THREE.SphereGeometry(
            0.6 * baseScale, 
            16, 
            16, 
            0, 
            Math.PI * 2, 
            0, 
            Math.PI * 0.6
        );
        const hood = new THREE.Mesh(hoodGeo, mat);
        hood.position.set(0, 1.4 * baseScale, -0.3 * baseScale);
        hood.castShadow = true;

        return hood;
    }

    // Create collar
    createCollar(data) {
        const baseScale = 0.3;
        const collarGeo = new THREE.TorusGeometry(
            0.4 * baseScale, 
            0.08 * baseScale, 
            8, 
            16, 
            Math.PI
        );
        const collarMat = new THREE.MeshStandardMaterial({ 
            color: data.colors.trim,
            roughness: 0.6,
            metalness: 0.2
        });
        const collar = new THREE.Mesh(collarGeo, collarMat);
        collar.position.set(0, 1 * baseScale, 0.3 * baseScale);
        collar.rotation.x = Math.PI / 2;
        collar.castShadow = true;

        return collar;
    }

    // Create closure (zipper/buttons)
    createClosure(data) {
        const group = new THREE.Group();
        const baseScale = 0.3;

        for (let i = 0; i < 8; i++) {
            const buttonGeo = new THREE.SphereGeometry(0.04 * baseScale, 8, 8);
            const buttonMat = new THREE.MeshStandardMaterial({ 
                color: data.colors.accent,
                metalness: 0.8,
                roughness: 0.2
            });
            const button = new THREE.Mesh(buttonGeo, buttonMat);
            button.position.set(
                0, 
                (0.8 - i * 0.22) * baseScale, 
                0.31 * baseScale
            );
            button.castShadow = true;
            group.add(button);
        }

        return group;
    }

    // Create pockets
    createPockets(data) {
        const pockets = [];
        const baseScale = 0.3;
        const pocketMat = new THREE.MeshStandardMaterial({ 
            color: data.colors.trim,
            roughness: 0.7
        });

        // Left pocket
        const pocketGeo = new THREE.BoxGeometry(
            0.4 * baseScale, 
            0.35 * baseScale, 
            0.08 * baseScale
        );
        const leftPocket = new THREE.Mesh(pocketGeo, pocketMat);
        leftPocket.position.set(-0.5 * baseScale, -0.4 * baseScale, 0.32 * baseScale);
        leftPocket.castShadow = true;
        pockets.push(leftPocket);

        // Right pocket
        const rightPocket = leftPocket.clone();
        rightPocket.position.set(0.5 * baseScale, -0.4 * baseScale, 0.32 * baseScale);
        pockets.push(rightPocket);

        return pockets;
    }

    // Create material based on type
    createMaterial(color, materialType) {
        const props = { color: color };

        switch(materialType) {
            case 'fabric':
                props.roughness = 0.9;
                props.metalness = 0;
                break;
            case 'leather':
                props.roughness = 0.5;
                props.metalness = 0.2;
                break;
            case 'denim':
                props.roughness = 0.8;
                props.metalness = 0;
                break;
            case 'nylon':
                props.roughness = 0.3;
                props.metalness = 0.1;
                break;
            case 'metallic':
                props.roughness = 0.2;
                props.metalness = 0.9;
                break;
            default:
                props.roughness = 0.7;
                props.metalness = 0;
        }

        return new THREE.MeshStandardMaterial(props);
    }

    // Apply damage effects to materials
    applyDamageEffects(data) {
        if (!this.jacketGroup) return;

        const damage = data.damage;

        this.jacketGroup.traverse((child) => {
            if (child.isMesh && child.material) {
                // Burns - add emissive glow
                if (damage.burns > 0) {
                    const burnFactor = damage.burns / 100;
                    child.material.emissive = new THREE.Color(0x332200);
                    child.material.emissiveIntensity = burnFactor * 0.3;
                }

                // Scratches/dirt - increase roughness
                const damageRoughness = (damage.scratches + damage.dirt) / 200;
                child.material.roughness = Math.min(1, child.material.roughness + damageRoughness);

                // Blood - tint red
                if (damage.blood > 0) {
                    const bloodTint = new THREE.Color(0x8B0000);
                    child.material.color.lerp(bloodTint, damage.blood / 500);
                }

                // Overall wear darkening
                switch(data.wear) {
                    case 'worn':
                        child.material.color.multiplyScalar(0.9);
                        break;
                    case 'battle-scarred':
                        child.material.color.multiplyScalar(0.7);
                        break;
                    case 'destroyed':
                        child.material.color.multiplyScalar(0.5);
                        break;
                }
            }
        });
    }

    // Attach jacket to player object
    attachToPlayer() {
        if (!this.playerObject) {
            console.warn('No player object provided, jacket will be at origin');
            this.scene.add(this.jacketGroup);
            return;
        }

        // Add jacket as child of player
        this.playerObject.add(this.jacketGroup);
        
        // Position on torso (adjust based on your player model)
        this.jacketGroup.position.set(0, 1.2, 0);
        this.jacketGroup.rotation.set(0, 0, 0);
        
        console.log('✅ Jacket attached to player as child object');
    }

    // Update jacket each frame (optional - for physics)
    update() {
        // Jacket follows player automatically since it's a child object
        // This method is for future cloth physics updates
        
        if (this.currentJacketData && 
            this.currentJacketData.physics.simulation !== 'none') {
            // TODO: Update cloth physics here
            this.updateClothPhysics();
        }
    }

    // Cloth physics placeholder
    updateClothPhysics() {
        // TODO: Implement verlet integration or simple animation
        
        // Simple wind animation example:
        if (this.jacketGroup && this.currentJacketData.physics.wind > 0) {
            const windStrength = this.currentJacketData.physics.wind / 100;
            const time = Date.now() * 0.001;
            
            // Slight swaying motion
            this.jacketGroup.rotation.z = Math.sin(time * 2) * windStrength * 0.05;
        }
    }

    // Change jacket to different slot
    changeJacket(slotNum) {
        this.setActiveSlot(slotNum);
        this.loadJacket();
    }

    // Get all available jackets
    getAvailableJackets() {
        const jackets = [];
        
        for (let i = 1; i <= 9; i++) {
            const saved = localStorage.getItem(`jacket_slot_${i}`);
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    jackets.push({
                        slot: i,
                        name: data.name,
                        data: data
                    });
                } catch (error) {
                    console.error(`Failed to parse jacket slot ${i}:`, error);
                }
            }
        }
        
        return jackets;
    }

    // Remove jacket from player/scene
    remove() {
        if (this.jacketGroup) {
            if (this.jacketGroup.parent) {
                this.jacketGroup.parent.remove(this.jacketGroup);
            }
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JacketLoader;
}
