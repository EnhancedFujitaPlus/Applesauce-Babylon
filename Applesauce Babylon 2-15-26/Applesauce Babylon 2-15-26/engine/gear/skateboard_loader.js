// ============================================
// SKATEBOARD LOADER MODULE
// ============================================
// Load custom skateboard data from localStorage and apply to player

class SkateboardLoader {
    constructor(scene, playerObject) {
        this.scene = scene;
        this.playerObject = playerObject;
        this.skateboardGroup = null;
        this.currentSkateboardData = null;
        this.activeSlot = this.getActiveSlot();
        
        // Store references to animatable parts
        this.wheels = [];
        this.bearings = [];
    }

    // Get the currently active skateboard slot (defaults to 1)
    getActiveSlot() {
        return parseInt(localStorage.getItem('active_skateboard_slot') || '1');
    }

    // Set which skateboard slot is active
    setActiveSlot(slotNum) {
        localStorage.setItem('active_skateboard_slot', slotNum);
        this.activeSlot = slotNum;
    }

    // Load skateboard from current active slot
    loadSkateboard() {
        const saved = localStorage.getItem(`skateboard_slot_${this.activeSlot}`);
        
        if (!saved) {
            console.log('No skateboard in active slot, loading default');
            this.loadDefaultSkateboard();
            return;
        }

        try {
            this.currentSkateboardData = JSON.parse(saved);
            this.buildSkateboard(this.currentSkateboardData);
            console.log('Loaded custom skateboard:', this.currentSkateboardData.name);
        } catch (error) {
            console.error('Failed to load skateboard:', error);
            this.loadDefaultSkateboard();
        }
    }

    // Load default skateboard if no custom one exists
    loadDefaultSkateboard() {
        this.currentSkateboardData = {
            name: 'Default Deck',
            deck: {
                shape: 'popsicle',      // popsicle, cruiser, oldschool, shaped
                width: 0.8,
                length: 2.5,
                concave: 'medium',      // low, medium, high
                color: '#FF1493',
                underColor: '#000000',
                graphic: null,          // URL to graphic image
                graphicScale: 1,
                graphicPosition: { x: 0, y: 0 },
                material: 'maple',      // maple, bamboo, carbon
                wear: 'pristine'        // pristine, used, beaten, trashed
            },
            trucks: {
                color: '#C0C0C0',
                material: 'aluminum',   // aluminum, titanium, hollow
                height: 'mid',          // low, mid, high
                width: 0.8,
                bushings: '#FF0000'     // Bushing color
            },
            wheels: {
                diameter: 0.15,
                width: 0.1,
                color: '#222222',
                coreColor: '#FFFFFF',
                hardness: 99,           // 78-101 (softer-harder)
                wear: 0,                // 0-100 (pristine-coned)
                graphics: false
            },
            griptape: {
                color: '#000000',
                pattern: 'solid',       // solid, perforated, clear, colored, cutout
                wear: 0,                // 0-100
                custom: null            // URL to custom grip pattern
            },
            bearings: {
                visible: true,
                rating: 'ABEC-7',       // ABEC-1, ABEC-3, ABEC-5, ABEC-7, ABEC-9, Ceramic
                color: '#FFD700',
                shields: true           // Show bearing shields
            }
        };
        this.buildSkateboard(this.currentSkateboardData);
    }

    // Build the complete skateboard from data
    buildSkateboard(data) {
        // Remove existing skateboard
        if (this.skateboardGroup) {
            this.scene.remove(this.skateboardGroup);
        }

        this.skateboardGroup = new THREE.Group();
        this.wheels = [];
        this.bearings = [];

        // Build components (order matters for layering)
        const deck = this.createDeck(data.deck);
        this.skateboardGroup.add(deck);

        const griptape = this.createGriptape(data.deck, data.griptape);
        this.skateboardGroup.add(griptape);

        const trucks = this.createTrucks(data.trucks, data.deck);
        trucks.forEach(truck => this.skateboardGroup.add(truck));

        const wheelAssemblies = this.createWheels(data.wheels, data.bearings);
        wheelAssemblies.forEach(assembly => this.skateboardGroup.add(assembly));

        // Apply wear/damage to deck
        this.applyDeckWear(deck, data.deck.wear);

        // Attach to player
        this.attachToPlayer();
    }

    // =========================================
    // DECK CREATION
    // =========================================
    createDeck(deckData) {
        const group = new THREE.Group();
        
        // Main deck shape
        let deckGeo;
        switch(deckData.shape) {
            case 'cruiser':
                // Wider, shorter
                deckGeo = new THREE.BoxGeometry(
                    deckData.width * 1.2, 
                    0.1, 
                    deckData.length * 0.8
                );
                break;
            case 'oldschool':
                // Wider tail
                deckGeo = new THREE.BoxGeometry(
                    deckData.width * 1.3, 
                    0.1, 
                    deckData.length * 0.9
                );
                break;
            case 'shaped':
                // Custom shape (simplified)
                deckGeo = new THREE.BoxGeometry(
                    deckData.width * 1.1, 
                    0.1, 
                    deckData.length * 0.95
                );
                break;
            case 'popsicle':
            default:
                // Standard popsicle shape
                deckGeo = new THREE.BoxGeometry(
                    deckData.width, 
                    0.1, 
                    deckData.length
                );
        }

        // Material properties based on deck material
        const deckMat = this.createDeckMaterial(deckData);
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.position.y = 0.3;
        deck.castShadow = true;
        deck.receiveShadow = true;
        deck.name = 'deck';
        group.add(deck);

        // Under deck (bottom color)
        const underGeo = deckGeo.clone();
        const underMat = new THREE.MeshStandardMaterial({ 
            color: deckData.underColor,
            roughness: 0.7,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        const under = new THREE.Mesh(underGeo, underMat);
        under.position.y = 0.29;  // Slightly below deck
        under.castShadow = true;
        under.name = 'under-deck';
        group.add(under);

        // Add deck graphic if present
        if (deckData.graphic) {
            this.addDeckGraphic(group, deckData);
        }

        // Nose/tail distinction (subtle color difference)
        this.addNoseTail(group, deckData);

        return group;
    }

    createDeckMaterial(deckData) {
        const baseProps = {
            color: deckData.color,
            roughness: 0.6,
            metalness: 0.1
        };

        switch(deckData.material) {
            case 'bamboo':
                baseProps.roughness = 0.7;
                baseProps.color = this.adjustColor(deckData.color, 1.1); // Lighter
                break;
            case 'carbon':
                baseProps.roughness = 0.3;
                baseProps.metalness = 0.4;
                break;
            case 'maple':
            default:
                // Standard wood properties
                break;
        }

        return new THREE.MeshStandardMaterial(baseProps);
    }

    addNoseTail(group, deckData) {
        const noseGeo = new THREE.BoxGeometry(
            deckData.width, 
            0.11, 
            0.3
        );
        const noseMat = new THREE.MeshStandardMaterial({ 
            color: this.adjustColor(deckData.color, 0.9), // Slightly darker
            roughness: 0.7
        });
        
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 0.3, -deckData.length / 2 + 0.15);
        nose.castShadow = true;
        group.add(nose);

        const tail = nose.clone();
        tail.position.z = deckData.length / 2 - 0.15;
        group.add(tail);
    }

    addDeckGraphic(group, deckData) {
        if (!deckData.graphic) return;

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(deckData.graphic, (texture) => {
            const graphicGeo = new THREE.PlaneGeometry(
                deckData.width * 0.8 * deckData.graphicScale, 
                deckData.length * 0.8 * deckData.graphicScale
            );
            const graphicMat = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            const graphic = new THREE.Mesh(graphicGeo, graphicMat);
            
            graphic.position.set(
                deckData.graphicPosition.x, 
                0.31,  // Just above deck
                deckData.graphicPosition.y
            );
            graphic.rotation.x = -Math.PI / 2;
            graphic.name = 'deck-graphic';
            group.add(graphic);
        }, undefined, (error) => {
            console.error('Failed to load deck graphic:', error);
        });
    }

    applyDeckWear(deckGroup, wearLevel) {
        deckGroup.traverse((child) => {
            if (child.isMesh && child.material) {
                switch(wearLevel) {
                    case 'used':
                        child.material.roughness = Math.min(1, child.material.roughness * 1.2);
                        child.material.color.multiplyScalar(0.95);
                        break;
                    case 'beaten':
                        child.material.roughness = 1.0;
                        child.material.color.multiplyScalar(0.8);
                        break;
                    case 'trashed':
                        child.material.roughness = 1.0;
                        child.material.color.multiplyScalar(0.6);
                        // Add some "dirt"
                        if (!child.material.emissive) {
                            child.material.emissive = new THREE.Color(0x2a1a0a);
                            child.material.emissiveIntensity = 0.1;
                        }
                        break;
                }
            }
        });
    }

    // =========================================
    // GRIPTAPE CREATION
    // =========================================
    createGriptape(deckData, griptapeData) {
        const group = new THREE.Group();
        
        const gripGeo = new THREE.PlaneGeometry(
            deckData.width * 0.95, 
            deckData.length * 0.95
        );
        
        let gripMat;
        
        if (griptapeData.pattern === 'clear') {
            // Semi-transparent grip
            gripMat = new THREE.MeshStandardMaterial({
                color: griptapeData.color,
                transparent: true,
                opacity: 0.3,
                roughness: 1.0,
                side: THREE.DoubleSide
            });
        } else if (griptapeData.pattern === 'perforated') {
            // Rough black with holes (simplified)
            gripMat = new THREE.MeshStandardMaterial({
                color: griptapeData.color,
                roughness: 1.0,
                metalness: 0,
                side: THREE.DoubleSide
            });
        } else {
            // Solid grip
            gripMat = new THREE.MeshStandardMaterial({
                color: griptapeData.color,
                roughness: 1.0,  // Very rough for grip
                metalness: 0,
                side: THREE.DoubleSide
            });
        }
        
        const grip = new THREE.Mesh(gripGeo, gripMat);
        grip.position.y = 0.36;  // On top of deck
        grip.rotation.x = -Math.PI / 2;
        grip.receiveShadow = true;
        grip.name = 'griptape';
        
        // Apply wear to griptape
        if (griptapeData.wear > 0) {
            const wearFactor = griptapeData.wear / 100;
            gripMat.color.multiplyScalar(1 - wearFactor * 0.4);  // Darken with wear
            gripMat.roughness = Math.max(0.7, 1 - wearFactor * 0.3);  // Less grippy when worn
        }
        
        group.add(grip);
        
        // Add custom grip pattern if present
        if (griptapeData.custom) {
            this.addCustomGrip(group, deckData, griptapeData.custom);
        }
        
        return group;
    }

    addCustomGrip(group, deckData, customPattern) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(customPattern, (texture) => {
            const patternGeo = new THREE.PlaneGeometry(
                deckData.width * 0.9, 
                deckData.length * 0.9
            );
            const patternMat = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            const pattern = new THREE.Mesh(patternGeo, patternMat);
            pattern.position.y = 0.37;  // Above griptape
            pattern.rotation.x = -Math.PI / 2;
            pattern.name = 'grip-pattern';
            group.add(pattern);
        });
    }

    // =========================================
    // TRUCKS CREATION
    // =========================================
    createTrucks(truckData, deckData) {
        const trucks = [];
        const truckHeight = this.getTruckHeight(truckData.height);
        
        // Front truck
        const frontTruck = this.createSingleTruck(truckData, truckHeight, deckData.width);
        frontTruck.position.set(0, 0.15, -0.8);  // Front position
        trucks.push(frontTruck);
        
        // Back truck
        const backTruck = this.createSingleTruck(truckData, truckHeight, deckData.width);
        backTruck.position.set(0, 0.15, 0.8);   // Back position
        trucks.push(backTruck);
        
        return trucks;
    }

    createSingleTruck(truckData, height, deckWidth) {
        const group = new THREE.Group();
        
        // Truck material
        const truckMat = this.createTruckMaterial(truckData);
        
        // Baseplate (mounts to deck)
        const baseplateGeo = new THREE.BoxGeometry(0.2, 0.02, 0.15);
        const baseplate = new THREE.Mesh(baseplateGeo, truckMat);
        baseplate.position.y = height;
        baseplate.castShadow = true;
        group.add(baseplate);
        
        // Hanger (main axle body)
        const hangerGeo = new THREE.CylinderGeometry(0.04, 0.04, truckData.width, 12);
        const hanger = new THREE.Mesh(hangerGeo, truckMat);
        hanger.rotation.z = Math.PI / 2;
        hanger.position.y = height - 0.05;
        hanger.castShadow = true;
        group.add(hanger);
        
        // Axle ends (where wheels attach)
        const axleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8);
        const leftAxle = new THREE.Mesh(axleGeo, truckMat);
        leftAxle.rotation.z = Math.PI / 2;
        leftAxle.position.set(-truckData.width / 2 - 0.025, height - 0.05, 0);
        leftAxle.castShadow = true;
        group.add(leftAxle);
        
        const rightAxle = leftAxle.clone();
        rightAxle.position.x = truckData.width / 2 + 0.025;
        group.add(rightAxle);
        
        // Kingpin (bolt in center)
        const kingpinGeo = new THREE.CylinderGeometry(0.015, 0.015, height * 1.5, 8);
        const kingpinMat = new THREE.MeshStandardMaterial({ 
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.2
        });
        const kingpin = new THREE.Mesh(kingpinGeo, kingpinMat);
        kingpin.position.y = height * 0.5;
        kingpin.castShadow = true;
        group.add(kingpin);
        
        // Bushings (colorful rubber)
        const bushingGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12);
        const bushingMat = new THREE.MeshStandardMaterial({ 
            color: truckData.bushings,
            roughness: 0.8,
            metalness: 0
        });
        
        const topBushing = new THREE.Mesh(bushingGeo, bushingMat);
        topBushing.position.y = height + 0.01;
        group.add(topBushing);
        
        const bottomBushing = topBushing.clone();
        bottomBushing.position.y = height - 0.08;
        group.add(bottomBushing);
        
        group.name = 'truck';
        return group;
    }

    getTruckHeight(heightType) {
        switch(heightType) {
            case 'low':
                return 0.12;
            case 'high':
                return 0.18;
            case 'mid':
            default:
                return 0.15;
        }
    }

    createTruckMaterial(truckData) {
        const baseProps = {
            color: truckData.color,
            roughness: 0.3,
            metalness: 0.7
        };

        switch(truckData.material) {
            case 'titanium':
                baseProps.metalness = 0.9;
                baseProps.roughness = 0.2;
                baseProps.color = this.adjustColor(truckData.color, 1.1);  // Lighter
                break;
            case 'hollow':
                baseProps.metalness = 0.7;
                baseProps.roughness = 0.4;
                break;
            case 'aluminum':
            default:
                // Standard aluminum properties
                break;
        }

        return new THREE.MeshStandardMaterial(baseProps);
    }

    // =========================================
    // WHEELS CREATION
    // =========================================
    createWheels(wheelData, bearingData) {
        const assemblies = [];
        
        const wheelPositions = [
            { x: -0.3, y: 0.15, z: -0.8, name: 'front-left' },
            { x: 0.3, y: 0.15, z: -0.8, name: 'front-right' },
            { x: -0.3, y: 0.15, z: 0.8, name: 'back-left' },
            { x: 0.3, y: 0.15, z: 0.8, name: 'back-right' }
        ];

        wheelPositions.forEach(pos => {
            const assembly = this.createWheelAssembly(wheelData, bearingData, pos.name);
            assembly.position.set(pos.x, pos.y, pos.z);
            assemblies.push(assembly);
        });

        return assemblies;
    }

    createWheelAssembly(wheelData, bearingData, wheelName) {
        const group = new THREE.Group();
        group.name = `wheel-assembly-${wheelName}`;
        
        // Main wheel
        const wheelGeo = new THREE.CylinderGeometry(
            wheelData.diameter, 
            wheelData.diameter, 
            wheelData.width, 
            24
        );
        
        // Apply wear to wheel shape (coning)
        if (wheelData.wear > 0) {
            const wearFactor = wheelData.wear / 100;
            const innerRadius = wheelData.diameter * (1 - wearFactor * 0.3);
            wheelGeo.dispose();
            const wornGeo = new THREE.CylinderGeometry(
                innerRadius,  // Inner radius smaller (coned)
                wheelData.diameter,  // Outer radius same
                wheelData.width,
                24
            );
            wheelGeo.copy(wornGeo);
        }
        
        const wheelMat = new THREE.MeshStandardMaterial({ 
            color: wheelData.color,
            roughness: 0.8,
            metalness: 0.1
        });
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        wheel.name = 'wheel';
        group.add(wheel);
        this.wheels.push(wheel);  // Store for animation
        
        // Wheel core (inner circle)
        const coreGeo = new THREE.CylinderGeometry(
            wheelData.diameter * 0.5, 
            wheelData.diameter * 0.5, 
            wheelData.width * 0.9, 
            16
        );
        const coreMat = new THREE.MeshStandardMaterial({ 
            color: wheelData.coreColor,
            roughness: 0.6,
            metalness: 0.2
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.rotation.z = Math.PI / 2;
        core.name = 'wheel-core';
        group.add(core);
        
        // Bearings (if visible)
        if (bearingData.visible) {
            const bearingAssembly = this.createBearings(bearingData, wheelData.width);
            group.add(bearingAssembly);
        }
        
        // Add hardness indicator (subtle ring)
        this.addHardnessIndicator(group, wheelData);
        
        return group;
    }

    createBearings(bearingData, wheelWidth) {
        const group = new THREE.Group();
        
        const bearingMat = new THREE.MeshStandardMaterial({ 
            color: bearingData.color,
            metalness: 0.9,
            roughness: 0.1
        });
        
        // Bearing rings (visible on sides)
        const bearingGeo = new THREE.TorusGeometry(0.015, 0.005, 8, 16);
        
        // Left bearing
        const leftBearing = new THREE.Mesh(bearingGeo, bearingMat);
        leftBearing.position.x = -wheelWidth / 2 - 0.01;
        leftBearing.rotation.y = Math.PI / 2;
        leftBearing.name = 'bearing-left';
        group.add(leftBearing);
        this.bearings.push(leftBearing);
        
        // Right bearing
        const rightBearing = leftBearing.clone();
        rightBearing.position.x = wheelWidth / 2 + 0.01;
        rightBearing.name = 'bearing-right';
        group.add(rightBearing);
        this.bearings.push(rightBearing);
        
        // Bearing shields (if enabled)
        if (bearingData.shields) {
            const shieldGeo = new THREE.CircleGeometry(0.018, 12);
            const shieldMat = new THREE.MeshStandardMaterial({ 
                color: this.adjustColor(bearingData.color, 0.8),
                metalness: 0.8,
                roughness: 0.2,
                side: THREE.DoubleSide
            });
            
            const leftShield = new THREE.Mesh(shieldGeo, shieldMat);
            leftShield.position.x = -wheelWidth / 2 - 0.015;
            leftShield.rotation.y = Math.PI / 2;
            group.add(leftShield);
            
            const rightShield = leftShield.clone();
            rightShield.position.x = wheelWidth / 2 + 0.015;
            group.add(rightShield);
        }
        
        group.name = 'bearings';
        return group;
    }

    addHardnessIndicator(wheelGroup, wheelData) {
        // Add colored ring based on hardness
        // Softer (78-90) = Blue tint
        // Medium (91-95) = Green tint  
        // Hard (96-101) = Red tint
        
        let indicatorColor;
        if (wheelData.hardness < 90) {
            indicatorColor = 0x0066FF;  // Blue (soft)
        } else if (wheelData.hardness < 96) {
            indicatorColor = 0x00FF00;  // Green (medium)
        } else {
            indicatorColor = 0xFF0000;  // Red (hard)
        }
        
        const ringGeo = new THREE.TorusGeometry(
            wheelData.diameter * 0.7, 
            0.005, 
            8, 
            24
        );
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: indicatorColor,
            transparent: true,
            opacity: 0.3
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.z = Math.PI / 2;
        ring.name = 'hardness-indicator';
        wheelGroup.add(ring);
    }

    // =========================================
    // UTILITY FUNCTIONS
    // =========================================
    adjustColor(hexColor, factor) {
        // Adjust color brightness
        const color = new THREE.Color(hexColor);
        color.r = Math.min(1, color.r * factor);
        color.g = Math.min(1, color.g * factor);
        color.b = Math.min(1, color.b * factor);
        return color.getHex();
    }

    // Attach skateboard to player object
    attachToPlayer() {
        if (!this.playerObject) {
            console.warn('No player object provided, skateboard will be at origin');
            this.scene.add(this.skateboardGroup);
            return;
        }

        // IMPORTANT: Remove existing deck/wheels from player first!
        // Find and remove the default deck and wheels
        const childrenToRemove = [];
        this.playerObject.children.forEach(child => {
            if (child.geometry && child.geometry.type === 'BoxGeometry' && 
                child.geometry.parameters.depth === 2.5) {
                // This is the default deck
                childrenToRemove.push(child);
            } else if (child.geometry && child.geometry.type === 'CylinderGeometry' &&
                child.geometry.parameters.radiusTop === 0.15) {
                // This is a default wheel
                childrenToRemove.push(child);
            }
        });
        
        childrenToRemove.forEach(child => {
            this.playerObject.remove(child);
        });

        // Add custom skateboard as child of player
        this.playerObject.add(this.skateboardGroup);
        
        // Position at origin (replaces default deck/wheels)
        this.skateboardGroup.position.set(0, 0, 0);
        this.skateboardGroup.rotation.set(0, 0, 0);
        
        console.log('✅ Custom skateboard attached to player');
    }

    // Update skateboard each frame (for wheel rotation, bearing spin)
    update(speed) {
        if (!this.skateboardGroup) return;
        
        // Rotate wheels based on player speed
        if (speed && this.wheels.length > 0) {
            const rotationSpeed = speed * 5;  // Adjust multiplier for visual effect
            this.wheels.forEach(wheel => {
                wheel.rotation.x += rotationSpeed;
            });
        }
        
        // Spin bearings (faster than wheels for visual effect)
        if (speed && this.bearings.length > 0) {
            const bearingSpeed = speed * 8;
            this.bearings.forEach(bearing => {
                bearing.rotation.z += bearingSpeed;
            });
        }
    }

    // Change skateboard to different slot
    changeSkateboard(slotNum) {
        this.setActiveSlot(slotNum);
        this.loadSkateboard();
    }

    // Get all available skateboards
    getAvailableSkateboards() {
        const skateboards = [];
        
        for (let i = 1; i <= 9; i++) {
            const saved = localStorage.getItem(`skateboard_slot_${i}`);
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    skateboards.push({
                        slot: i,
                        name: data.name,
                        data: data
                    });
                } catch (error) {
                    console.error(`Failed to parse skateboard slot ${i}:`, error);
                }
            }
        }
        
        return skateboards;
    }

    // Remove skateboard from player/scene
    remove() {
        if (this.skateboardGroup) {
            if (this.skateboardGroup.parent) {
                this.skateboardGroup.parent.remove(this.skateboardGroup);
            }
        }
        this.wheels = [];
        this.bearings = [];
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkateboardLoader;
}
