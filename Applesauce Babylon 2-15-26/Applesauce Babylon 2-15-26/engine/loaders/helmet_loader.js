// ============================================
// HELMET LOADER MODULE
// ============================================
// Add this script to your level files to enable custom helmets
// This module loads helmet data from localStorage and applies it to the player

class HelmetLoader {
    constructor(scene, playerObject) {
        this.scene = scene;
        this.playerObject = playerObject;
        this.helmetGroup = null;
        this.currentHelmetData = null;
        this.activeSlot = this.getActiveSlot();
    }

    // Get the currently active helmet slot (defaults to 1)
    getActiveSlot() {
        return parseInt(localStorage.getItem('active_helmet_slot') || '1');
    }

    // Set which helmet slot is active
    setActiveSlot(slotNum) {
        localStorage.setItem('active_helmet_slot', slotNum);
        this.activeSlot = slotNum;
    }

    // Load helmet from current active slot
    loadHelmet() {
        const saved = localStorage.getItem(`helmet_slot_${this.activeSlot}`);
        
        if (!saved) {
            console.log('No helmet in active slot, loading default');
            this.loadDefaultHelmet();
            return;
        }

        try {
            this.currentHelmetData = JSON.parse(saved);
            this.buildHelmet(this.currentHelmetData);
            console.log('Loaded custom helmet:', this.currentHelmetData.name);
        } catch (error) {
            console.error('Failed to load helmet:', error);
            this.loadDefaultHelmet();
        }
    }

    // Load default helmet if no custom one exists
    loadDefaultHelmet() {
        this.currentHelmetData = {
            name: 'Default Helmet',
            colors: {
                shell: '#FF0000',
                visor: '#000000',
                accent: '#FFD700'
            },
            material: 'standard',
            decal: { image: null, scale: 1, rotation: 0, opacity: 100 },
            elements: [],
            elementScale: 1
        };
        this.buildHelmet(this.currentHelmetData);
    }

    // Build the helmet mesh from data
    buildHelmet(data) {
        // Remove existing helmet
        if (this.helmetGroup) {
            this.scene.remove(this.helmetGroup);
        }

        this.helmetGroup = new THREE.Group();

        // Create shell
        const shellGeometry = new THREE.SphereGeometry(0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const shellMaterial = this.createMaterial(data.colors.shell, data.material);
        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        shell.name = 'shell';
        this.helmetGroup.add(shell);

        // Create visor
        const visorGeometry = new THREE.SphereGeometry(0.51, 32, 16, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.3);
        const visorMaterial = new THREE.MeshStandardMaterial({
            color: data.colors.visor,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.7
        });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.name = 'visor';
        this.helmetGroup.add(visor);

        // Create accent stripe
        const stripeGeometry = new THREE.TorusGeometry(0.48, 0.03, 16, 100, Math.PI * 2);
        const stripeMaterial = new THREE.MeshStandardMaterial({
            color: data.colors.accent,
            metalness: 0.5,
            roughness: 0.5
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.rotation.x = Math.PI / 2;
        stripe.position.y = 0.1;
        stripe.name = 'accent';
        this.helmetGroup.add(stripe);

        // Add decal if exists
        if (data.decal && data.decal.image) {
            this.addDecal(data.decal);
        }

        // Add 3D elements
        if (data.elements && data.elements.length > 0) {
            data.elements.forEach(elementType => {
                this.addElement(elementType, data.colors.accent, data.elementScale);
            });
        }

        // Position helmet on player
        this.attachToPlayer();
        
        // DON'T add to scene - it's now a child of player
        // this.scene.add(this.helmetGroup);
    }

    // Create material based on type
    createMaterial(color, materialType) {
        const props = { color: color };

        switch(materialType) {
            case 'standard':
                props.metalness = 0.2;
                props.roughness = 0.7;
                break;
            case 'glossy':
                props.metalness = 0.1;
                props.roughness = 0.2;
                break;
            case 'metallic':
                props.metalness = 0.8;
                props.roughness = 0.3;
                break;
            case 'chrome':
                props.metalness = 1.0;
                props.roughness = 0.0;
                break;
            case 'rough':
                props.metalness = 0.0;
                props.roughness = 1.0;
                break;
            default:
                props.metalness = 0.2;
                props.roughness = 0.7;
        }

        return new THREE.MeshStandardMaterial(props);
    }

    // Add decal to helmet
    addDecal(decalData) {
        if (!decalData.image) return;

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(decalData.image, (texture) => {
            const decalGeometry = new THREE.PlaneGeometry(0.3, 0.3);
            const decalMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                opacity: decalData.opacity / 100
            });
            const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
            
            // Scale to match editor size ratio
            const scale = decalData.scale * 0.3;
            decalMesh.scale.set(scale, scale, 1);
            
            // Position on front of helmet
            decalMesh.position.set(0, 0.15, 0.5);
            decalMesh.rotation.z = decalData.rotation * Math.PI / 180;
            decalMesh.name = 'decal';
            
            this.helmetGroup.add(decalMesh);
        }, undefined, (error) => {
            console.error('Failed to load decal:', error);
        });
    }

    // Add 3D element to helmet (scaled down for player)
    addElement(type, accentColor, scale = 1) {
        let element;
        const baseScale = 0.3 * scale; // Scale down for player size

        switch(type) {
            case 'spikes':
                const spikeGroup = new THREE.Group();
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const spike = new THREE.Mesh(
                        new THREE.ConeGeometry(0.03 * baseScale, 0.15 * baseScale, 8),
                        new THREE.MeshStandardMaterial({ color: accentColor })
                    );
                    spike.position.set(
                        Math.cos(angle) * 0.43,
                        0.27,
                        Math.sin(angle) * 0.43
                    );
                    spike.rotation.x = Math.PI;
                    spikeGroup.add(spike);
                }
                element = spikeGroup;
                break;

            case 'mohawk':
                const mohawkGroup = new THREE.Group();
                for (let i = 0; i < 7; i++) {
                    const spike = new THREE.Mesh(
                        new THREE.ConeGeometry(0.045 * baseScale, 0.18 * baseScale, 8),
                        new THREE.MeshStandardMaterial({ color: accentColor })
                    );
                    spike.position.set(0, 0.15 + i * 0.045, -0.3 + i * 0.09);
                    spike.rotation.x = Math.PI + Math.PI * 0.2;
                    mohawkGroup.add(spike);
                }
                element = mohawkGroup;
                break;

            case 'horns':
                const hornGroup = new THREE.Group();
                const horn1 = new THREE.Mesh(
                    new THREE.ConeGeometry(0.045 * baseScale, 0.24 * baseScale, 8),
                    new THREE.MeshStandardMaterial({ color: accentColor })
                );
                horn1.position.set(-0.27, 0.27, 0);
                horn1.rotation.z = -Math.PI * 0.2;
                
                const horn2 = horn1.clone();
                horn2.position.set(0.27, 0.27, 0);
                horn2.rotation.z = Math.PI * 0.2;
                
                hornGroup.add(horn1, horn2);
                element = hornGroup;
                break;

            case 'wings':
                const wingGroup = new THREE.Group();
                const wing1 = new THREE.Mesh(
                    new THREE.BoxGeometry(0.45 * baseScale, 0.015 * baseScale, 0.15 * baseScale),
                    new THREE.MeshStandardMaterial({ color: accentColor })
                );
                wing1.position.set(-0.45, 0, 0);
                wing1.rotation.y = -Math.PI * 0.3;
                
                const wing2 = wing1.clone();
                wing2.position.set(0.45, 0, 0);
                wing2.rotation.y = Math.PI * 0.3;
                
                wingGroup.add(wing1, wing2);
                element = wingGroup;
                break;

            case 'chains':
                const chainGroup = new THREE.Group();
                for (let i = 0; i < 12; i++) {
                    const link = new THREE.Mesh(
                        new THREE.TorusGeometry(0.024 * baseScale, 0.009 * baseScale, 8, 16),
                        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 })
                    );
                    link.position.y = 0.15 - i * 0.045;
                    link.position.z = 0.36;
                    link.rotation.x = Math.PI / 2;
                    chainGroup.add(link);
                }
                element = chainGroup;
                break;

            case 'flames':
                const flameGroup = new THREE.Group();
                for (let i = 0; i < 5; i++) {
                    const flame = new THREE.Mesh(
                        new THREE.ConeGeometry(0.045 * baseScale, 0.15 * baseScale, 4),
                        new THREE.MeshStandardMaterial({ 
                            color: i % 2 === 0 ? 0xff4500 : 0xffd700,
                            emissive: 0xff4500,
                            emissiveIntensity: 0.5
                        })
                    );
                    flame.position.set(-0.18 + i * 0.09, -0.06, 0.42);
                    flame.rotation.x = Math.PI / 2;
                    flameGroup.add(flame);
                }
                element = flameGroup;
                break;

            case 'concave':
                element = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.12 * baseScale, 0.12 * baseScale, 0.09 * baseScale, 32),
                    new THREE.MeshStandardMaterial({ 
                        color: 0x333333,
                        metalness: 0.5,
                        roughness: 0.5
                    })
                );
                element.position.set(0, 0.36, 0);
                break;

            case 'vents':
                const ventGroup = new THREE.Group();
                for (let i = 0; i < 4; i++) {
                    const vent = new THREE.Mesh(
                        new THREE.BoxGeometry(0.18 * baseScale, 0.015 * baseScale, 0.03 * baseScale),
                        new THREE.MeshStandardMaterial({ color: 0x222222 })
                    );
                    vent.position.set(0, 0.09 - i * 0.06, 0.435);
                    ventGroup.add(vent);
                }
                element = ventGroup;
                break;

            case 'antennae':
                const antennaGroup = new THREE.Group();
                const antenna = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.006 * baseScale, 0.006 * baseScale, 0.45 * baseScale, 8),
                    new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 })
                );
                antenna.position.set(0, 0.45, 0);
                
                const tip = new THREE.Mesh(
                    new THREE.SphereGeometry(0.024 * baseScale, 8, 8),
                    new THREE.MeshStandardMaterial({ 
                        color: 0xff0000,
                        emissive: 0xff0000,
                        emissiveIntensity: 0.5
                    })
                );
                tip.position.set(0, 0.675, 0);
                
                antennaGroup.add(antenna, tip);
                element = antennaGroup;
                break;
        }

        if (element) {
            element.name = type;
            this.helmetGroup.add(element);
        }
    }

    // Attach helmet to player object
    // Attach helmet to player object
    attachToPlayer() {
        if (!this.playerObject) {
            console.warn('No player object provided, helmet will be at origin');
            // Fallback: add to scene at origin
            this.scene.add(this.helmetGroup);
            return;
        }

        // Add helmet as a CHILD of the player
        // This ensures zero-lag transform updates
        this.playerObject.add(this.helmetGroup);
        
        // Set LOCAL position (relative to player, not world)
        // Adjust this Y value based on your player's height
        this.helmetGroup.position.set(0, 2, 0);
        
        // Reset rotation to match player's local space
        this.helmetGroup.rotation.set(0, 0, 0);
        
        console.log('✅ Helmet attached to player as child object');
    }

    // Update helmet position each frame (NOW OPTIONAL - only needed for special effects)
    update() {
        // The helmet now automatically follows the player because it's a child object!
        // This method is kept for backwards compatibility and special effects.
        // You can remove the helmetLoader.update() call from your game loop if you want.
        
        // Optional: Add any per-frame effects here (bobbing, rotation, etc.)
        // Example: this.helmetGroup.rotation.y += 0.01; // Spin helmet
    }

    // Change helmet to different slot
    changeHelmet(slotNum) {
        this.setActiveSlot(slotNum);
        this.loadHelmet();
    }

    // Get all available helmets
    getAvailableHelmets() {
        const helmets = [];
        
        for (let i = 1; i <= 9; i++) {
            const saved = localStorage.getItem(`helmet_slot_${i}`);
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    helmets.push({
                        slot: i,
                        name: data.name,
                        data: data
                    });
                } catch (error) {
                    console.error(`Failed to parse helmet slot ${i}:`, error);
                }
            }
        }
        
        return helmets;
    }

    // Remove helmet from player/scene
    remove() {
        if (this.helmetGroup) {
            // Remove from parent (either player or scene)
            if (this.helmetGroup.parent) {
                this.helmetGroup.parent.remove(this.helmetGroup);
            }
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HelmetLoader;
}
