/**
 * APPLESAUCE - Level: Circuit Breaker
 * Racing track eco-warrior level
 * Destroy all non-renewable energy vehicles
 */
import * as THREE from 'three.module.js';

export const CircuitBreaker = {
    meta: {
        number: 4,
        name: "Circuit Breaker",
        description: "Destroy the fossil fuel machines",
        difficulty: "Hard",
        theme: "racing-track"
    },
    
    scene: {
        background: 0x87CEEB, // Sky blue
        fog: {
            color: 0x87CEEB,
            near: 50,
            far: 400
        }
    },
    
    playerStart: {
        x: 0,
        z: -60 // Start in the infield
    },
    
    terrain: {
        type: 'asphalt',
        size: 300,
        material: 'concrete' // Race track surface
    },
    
    // Track infrastructure (replaces buildings)
    buildings: [
        // Main grandstand
        {
            type: 'grandstand',
            position: { x: 0, z: -80 },
            size: { width: 60, height: 20, depth: 10 }
        },
        // Pit row buildings
        {
            type: 'pit_garage',
            position: { x: -40, z: -70 },
            size: { width: 15, height: 8, depth: 10 }
        },
        {
            type: 'pit_garage',
            position: { x: -20, z: -70 },
            size: { width: 15, height: 8, depth: 10 }
        },
        {
            type: 'pit_garage',
            position: { x: 0, z: -70 },
            size: { width: 15, height: 8, depth: 10 }
        },
        {
            type: 'pit_garage',
            position: { x: 20, z: -70 },
            size: { width: 15, height: 8, depth: 10 }
        },
        {
            type: 'pit_garage',
            position: { x: 40, z: -70 },
            size: { width: 15, height: 8, depth: 10 }
        },
        // Control tower
        {
            type: 'control_tower',
            position: { x: -50, z: -90 },
            size: { width: 8, height: 25, depth: 8 }
        },
        // VIP boxes
        {
            type: 'vip_box',
            position: { x: 30, z: -85 },
            size: { width: 12, height: 15, depth: 8 }
        }
    ],
    
    // Race track layout (replaces railroad)
    racetrack: {
        // Oval track with banking
        type: 'oval',
        radius: 70,
        width: 15,
        bankingAngle: 15, // Degrees of banking in turns
        segments: 64, // Smoothness
        
        // Racing cars (replaces train)
        racingCars: [
            { 
                id: 'racer_1',
                type: 'gas_guzzler',
                position: 0, // Position on track (0-1)
                speed: 0.008, // Speed around track
                color: 0xFF0000,
                destroyed: false
            },
            { 
                id: 'racer_2',
                type: 'diesel_truck',
                position: 0.2,
                speed: 0.007,
                color: 0x0000FF,
                destroyed: false
            },
            { 
                id: 'racer_3',
                type: 'gas_guzzler',
                position: 0.4,
                speed: 0.009,
                color: 0xFFFF00,
                destroyed: false
            },
            { 
                id: 'racer_4',
                type: 'coal_roller',
                position: 0.6,
                speed: 0.006,
                color: 0x00FF00,
                destroyed: false
            },
            { 
                id: 'racer_5',
                type: 'gas_guzzler',
                position: 0.8,
                speed: 0.008,
                color: 0xFF00FF,
                destroyed: false
            }
        ],
        
        // Parked cars in pit area (like victims on tracks)
        parkedCars: [
            { x: -35, z: -65, type: 'suv', destroyed: false },
            { x: -25, z: -65, type: 'pickup', destroyed: false },
            { x: -15, z: -65, type: 'sports_car', destroyed: false },
            { x: -5, z: -65, type: 'sedan', destroyed: false },
            { x: 5, z: -65, type: 'suv', destroyed: false },
            { x: 15, z: -65, type: 'truck', destroyed: false },
            { x: 25, z: -65, type: 'sports_car', destroyed: false },
            { x: 35, z: -65, type: 'van', destroyed: false }
        ]
    },
    
    // Skateable objects (racing themed)
    obstacles: [
        // Pit wall rails
        { type: 'rail', start: [-50, 0, -65], end: [-30, 0, -65] },
        { type: 'rail', start: [-25, 0, -65], end: [-5, 0, -65] },
        { type: 'rail', start: [5, 0, -65], end: [25, 0, -65] },
        { type: 'rail', start: [30, 0, -65], end: [50, 0, -65] },
        
        // Tire barriers (grindable)
        { type: 'box', position: [-60, 0, 20], size: [6, 2, 3], material: 'rubber' },
        { type: 'box', position: [60, 0, 20], size: [6, 2, 3], material: 'rubber' },
        { type: 'box', position: [-60, 0, -20], size: [6, 2, 3], material: 'rubber' },
        { type: 'box', position: [60, 0, -20], size: [6, 2, 3], material: 'rubber' },
        
        // Flag poles
        { type: 'pole', position: [-55, 0, -75], height: 8 },
        { type: 'pole', position: [0, 0, -75], height: 8 },
        { type: 'pole', position: [55, 0, -75], height: 8 },
        
        // Ramps at track entrance
        { type: 'ramp', position: [-50, 0, -50], size: [8, 4, 8], angle: 30 },
        { type: 'ramp', position: [50, 0, -50], size: [8, 4, 8], angle: 30 }
    ],
    
    objectives: [
        {
            id: 'explore_track',
            description: 'Explore the race track (0/8 areas discovered)',
            type: 'discovery',
            required: 8,
            current: 0
        },
        {
            id: 'destroy_parked',
            description: 'Destroy all parked gas vehicles (0/8)',
            type: 'destruction',
            required: 8,
            current: 0
        },
        {
            id: 'destroy_racers',
            description: 'Destroy all racing gas vehicles (0/5)',
            type: 'destruction',
            required: 5,
            current: 0
        },
        {
            id: 'sabotage_complete',
            description: 'Cleanse the circuit of fossil fuels',
            type: 'final',
            completed: false,
            hidden: true // Only shows after destroying all vehicles
        }
    ],
    
    // NPCs and dialogue (racing themed)
    npcs: [
        {
            name: 'Track Official',
            position: { x: -48, z: -88 },
            dialogue: [
                "Welcome to the Grand Prix! No skating on the track!",
                "Those cars are corporate property. Don't touch them."
            ],
            hostile: false
        },
        {
            name: 'Pit Crew Chief',
            position: { x: 10, z: -68 },
            dialogue: [
                "These machines are engineering marvels!",
                "Each one burns through gallons of premium fuel per lap."
            ],
            hostile: false
        },
        {
            name: 'Eco-Activist',
            position: { x: -70, z: 0 },
            dialogue: [
                "These gas-guzzlers are killing the planet.",
                "Someone needs to stop this madness...",
                "If only there was a way to destroy them all..."
            ],
            hostile: false,
            triggersObjective: 'destroy_parked'
        },
        {
            name: 'Angry Driver',
            position: { x: 35, z: -68 },
            dialogue: [
                "My car better not have a scratch on it!",
                "These vehicles are worth millions!"
            ],
            hostile: true // Will chase player if too close
        }
    ],
    
    // Interactive objects
    interactables: [
        {
            type: 'info_sign',
            position: { x: 0, z: -75 },
            action: 'read_sign',
            prompt: 'Press E to read',
            message: 'GRAND PRIX CIRCUIT - SPONSORED BY BIG OIL CO.'
        },
        {
            type: 'eco_flyer',
            position: { x: -70, z: -5 },
            action: 'read_flyer',
            prompt: 'Press E to read',
            message: 'END FOSSIL FUEL RACING! The planet cannot wait!'
        }
    ],
    
    // Level-specific logic
    onLevelStart(core) {
        console.log('🏎️ Welcome to Circuit Breaker');
        
        // Verify THREE is available
        if (typeof THREE === 'undefined') {
            console.error('THREE.js not loaded!');
            return;
        }
        
        // Initialize custom objectives
        if (core.modules.objectives) {
            core.modules.objectives.clear();
            
            core.modules.objectives.add({
                id: 'explore_track',
                description: 'Explore the race track',
                type: 'discovery',
                target: 8,
                current: 0,
                checker: (engine) => {
                    return engine.areasDiscovered || 0;
                }
            });
            
            core.modules.objectives.add({
                id: 'destroy_parked',
                description: 'Destroy parked gas vehicles',
                type: 'destruction',
                target: 8,
                current: 0
            });
            
            core.modules.objectives.add({
                id: 'destroy_racers',
                description: 'Destroy racing gas vehicles',
                type: 'destruction',
                target: 5,
                current: 0
            });
            
            core.modules.objectives.add({
                id: 'sabotage_complete',
                description: 'Circuit cleansed of fossil fuels!',
                type: 'final',
                target: 1,
                current: 0
            });
            
            console.log('✅ Circuit Breaker objectives loaded');
        }
        
        // Spawn NPCs
        this.npcs.forEach(npc => {
            if (core.modules.dialogue && core.modules.dialogue.createNPC) {
                try {
                    const formattedDialogue = npc.dialogue.map(text => ({
                        speaker: npc.name,
                        text: typeof text === 'string' ? text : text.text || ''
                    }));
                    
                    core.modules.dialogue.createNPC({
                        position: new THREE.Vector3(npc.position.x, 2, npc.position.z),
                        name: npc.name,
                        dialogue: formattedDialogue,
                        color: npc.hostile ? 0xFF0000 : 0x0066CC // Blue for friendly, red for hostile
                    });
                } catch (error) {
                    console.warn('Failed to create NPC:', npc.name, error);
                }
            }
        });
        
        // Build race track
        createRaceTrack(core, this.racetrack);
        
        // Spawn racing cars on track
        core.racingCars = [];
        this.racetrack.racingCars.forEach(carData => {
            const car = createRacingCar(core, carData);
            core.racingCars.push(car);
        });
        
        // Spawn parked cars in pit area
        core.parkedCars = [];
        this.racetrack.parkedCars.forEach(carData => {
            const car = createParkedCar(core, carData);
            core.parkedCars.push(car);
        });
        
        // Build track infrastructure (replaces Wild West buildings)
        this.buildings.forEach(building => {
            createTrackBuilding(core, building);
        });
        
        console.log('🏁 Race track loaded with', core.racingCars.length, 'racing cars and', core.parkedCars.length, 'parked vehicles');
    },
    
    onUpdate(core) {
        // Update racing cars circling the track
        if (core.racingCars) {
            core.racingCars.forEach(car => {
                if (!car.destroyed) {
                    updateRacingCar(core, car);
                    checkCarCollision(core, car);
                }
            });
        }
        
        // Check if all vehicles destroyed
        if (core.racingCars && core.parkedCars) {
            const allRacersDestroyed = core.racingCars.every(car => car.destroyed);
            const allParkedDestroyed = core.parkedCars.every(car => car.destroyed);
            
            if (allRacersDestroyed && allParkedDestroyed) {
                if (core.modules.objectives) {
                    const finalObj = core.modules.objectives.getObjective('sabotage_complete');
                    if (finalObj && !finalObj.complete) {
                        completeObjective(core, 'sabotage_complete');
                        showLevelDialogue(core,
                            "Mission Complete",
                            "The circuit is clean. No more fossil fuel pollution here. The future is electric! 🌱⚡"
                        );
                        console.log('✅ Level complete - All gas vehicles destroyed!');
                    }
                }
            }
        }
    }
};

// ===================================
// RACE TRACK CREATION
// ===================================
function createRaceTrack(core, config) {
    const trackGroup = new THREE.Group();
    
    // Create oval track path
    const trackShape = new THREE.Shape();
    const points = [];
    
    // Generate oval points
    for (let i = 0; i <= config.segments; i++) {
        const angle = (i / config.segments) * Math.PI * 2;
        // Oval formula (wider on straight sections)
        const x = Math.cos(angle) * config.radius * 1.5;
        const z = Math.sin(angle) * config.radius;
        points.push(new THREE.Vector2(x, z));
    }
    
    // Create track surface
    const trackMat = new THREE.MeshStandardMaterial({
        color: 0x333333, // Dark asphalt
        roughness: 0.9,
        metalness: 0.1
    });
    
    // Inner track
    const innerCurve = new THREE.CatmullRomCurve3(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
    );
    innerCurve.closed = true;
    
    // Create track mesh using extrude
    const extrudeSettings = {
        steps: config.segments,
        bevelEnabled: false,
        extrudePath: innerCurve
    };
    
    // Track surface (simplified - just a wide ribbon)
    for (let i = 0; i < config.segments; i++) {
        const angle1 = (i / config.segments) * Math.PI * 2;
        const angle2 = ((i + 1) / config.segments) * Math.PI * 2;
        
        const x1 = Math.cos(angle1) * config.radius * 1.5;
        const z1 = Math.sin(angle1) * config.radius;
        const x2 = Math.cos(angle2) * config.radius * 1.5;
        const z2 = Math.sin(angle2) * config.radius;
        
        const segmentGeo = new THREE.PlaneGeometry(config.width, 
            Math.hypot(x2 - x1, z2 - z1));
        const segment = new THREE.Mesh(segmentGeo, trackMat);
        
        segment.rotation.x = -Math.PI / 2;
        segment.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
        segment.lookAt((x1 + x2) / 2, 0, (z1 + z2) / 2 + 1);
        segment.receiveShadow = true;
        
        trackGroup.add(segment);
    }
    
    // Add track markings (white lines)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    for (let i = 0; i < config.segments; i += 4) {
        const angle = (i / config.segments) * Math.PI * 2;
        const x = Math.cos(angle) * config.radius * 1.5;
        const z = Math.sin(angle) * config.radius;
        
        const lineGeo = new THREE.BoxGeometry(2, 0.1, 0.3);
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(x, 0.05, z);
        trackGroup.add(line);
    }
    
    core.scene.add(trackGroup);
    
    // Store track path for car movement
    core.trackPath = points;
    core.trackRadius = config.radius;
    
    console.log('🏁 Race track created with', config.segments, 'segments');
}

// ===================================
// RACING CAR CREATION
// ===================================
function createRacingCar(core, carData) {
    const carGroup = new THREE.Group();
    
    // Car body
    const bodyGeo = new THREE.BoxGeometry(4, 1.5, 2);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: carData.color,
        metalness: 0.8,
        roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    body.castShadow = true;
    carGroup.add(body);
    
    // Cockpit/windshield
    const cockpitGeo = new THREE.BoxGeometry(2, 1, 1.8);
    const cockpitMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.5,
        roughness: 0.3
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 2, 0);
    carGroup.add(cockpit);
    
    // Spoiler
    const spoilerGeo = new THREE.BoxGeometry(0.2, 0.8, 2.5);
    const spoiler = new THREE.Mesh(spoilerGeo, bodyMat);
    spoiler.position.set(-2.2, 2, 0);
    carGroup.add(spoiler);
    
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.7,
        roughness: 0.3
    });
    
    const wheelPositions = [
        [1.3, 0.5, -1.2], [1.3, 0.5, 1.2],
        [-1.3, 0.5, -1.2], [-1.3, 0.5, 1.2]
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);
        carGroup.add(wheel);
    });
    
    // Store car data
    carGroup.userData = {
        id: carData.id,
        type: carData.type,
        position: carData.position, // 0-1 around track
        speed: carData.speed,
        destroyed: false,
        isRacer: true
    };
    
    core.scene.add(carGroup);
    return carGroup;
}

// ===================================
// PARKED CAR CREATION
// ===================================
function createParkedCar(core, carData) {
    const carGroup = new THREE.Group();
    
    // Simpler parked car design
    const colors = [0xFF4444, 0x4444FF, 0x44FF44, 0xFFFF44, 0xFF44FF];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const bodyGeo = new THREE.BoxGeometry(3.5, 1.5, 2);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: randomColor,
        metalness: 0.6,
        roughness: 0.4
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    body.castShadow = true;
    carGroup.add(body);
    
    // Windows
    const windowGeo = new THREE.BoxGeometry(2, 1, 1.8);
    const windowMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.3,
        roughness: 0.5
    });
    const windows = new THREE.Mesh(windowGeo, windowMat);
    windows.position.set(0, 2, 0);
    carGroup.add(windows);
    
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    
    [[1.2, 0.4, -1.1], [1.2, 0.4, 1.1], [-1.2, 0.4, -1.1], [-1.2, 0.4, 1.1]].forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);
        carGroup.add(wheel);
    });
    
    carGroup.position.set(carData.x, 0, carData.z);
    
    carGroup.userData = {
        type: carData.type,
        destroyed: false,
        isParked: true
    };
    
    core.scene.add(carGroup);
    return carGroup;
}

// ===================================
// UPDATE RACING CAR
// ===================================
function updateRacingCar(core, car) {
    if (!core.trackPath || car.userData.destroyed) return;
    
    // Move car along track
    car.userData.position += car.userData.speed;
    if (car.userData.position > 1) car.userData.position -= 1;
    
    // Get position on track
    const trackIndex = Math.floor(car.userData.position * core.trackPath.length);
    const point = core.trackPath[trackIndex];
    const nextPoint = core.trackPath[(trackIndex + 1) % core.trackPath.length];
    
    // Position car
    car.position.x = point.x;
    car.position.z = point.y;
    
    // Rotate car to face direction of travel
    const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);
    car.rotation.y = -angle - Math.PI / 2;
    
    // Animate wheels
    car.children.forEach(child => {
        if (child.geometry && child.geometry.type === 'CylinderGeometry') {
            child.rotation.x += 0.2;
        }
    });
}

// ===================================
// COLLISION DETECTION
// ===================================
function checkCarCollision(core, car) {
    if (!core.player || car.userData.destroyed) return;
    
    const playerPos = core.player.position;
    const carPos = car.position;
    const distance = Math.hypot(
        playerPos.x - carPos.x,
        playerPos.z - carPos.z
    );
    
    // Collision threshold
    if (distance < 3 && Math.abs(core.state.speed) > 0.3) {
        destroyCar(core, car);
    }
}

// ===================================
// DESTROY CAR
// ===================================
function destroyCar(core, car) {
    if (car.userData.destroyed) return;
    
    car.userData.destroyed = true;
    console.log('💥 CAR DESTROYED:', car.userData.type);
    
    // GORE EXPLOSION
    if (core.modules.gore) {
        core.modules.gore.createMassiveSplatter(
            car.position.clone(),
            new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                1,
                (Math.random() - 0.5) * 2
            )
        );
    }
    
    // Create explosion effect
    createExplosion(core, car.position);
    
    // Remove car from scene
    core.scene.remove(car);
    
    // Update objectives
    if (car.userData.isRacer) {
        updateObjectiveProgress(core, 'destroy_racers', 
            core.racingCars.filter(c => c.userData.destroyed).length
        );
    } else if (car.userData.isParked) {
        updateObjectiveProgress(core, 'destroy_parked',
            core.parkedCars.filter(c => c.userData.destroyed).length
        );
    }
    
    // Award points
    if (core.state) {
        core.state.score += 1000;
    }
}

// ===================================
// EXPLOSION EFFECT
// ===================================
function createExplosion(core, position) {
    // Create fireball
    const explosionGeo = new THREE.SphereGeometry(3, 16, 16);
    const explosionMat = new THREE.MeshBasicMaterial({
        color: 0xFF4500,
        transparent: true,
        opacity: 1
    });
    const explosion = new THREE.Mesh(explosionGeo, explosionMat);
    explosion.position.copy(position);
    explosion.position.y += 2;
    core.scene.add(explosion);
    
    // Animate explosion
    let scale = 1;
    let opacity = 1;
    const explosionInterval = setInterval(() => {
        scale += 0.3;
        opacity -= 0.1;
        
        explosion.scale.set(scale, scale, scale);
        explosion.material.opacity = opacity;
        
        if (opacity <= 0) {
            clearInterval(explosionInterval);
            core.scene.remove(explosion);
        }
    }, 50);
    
    // Create smoke particles
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const smokeGeo = new THREE.SphereGeometry(0.5, 8, 8);
            const smokeMat = new THREE.MeshBasicMaterial({
                color: 0x444444,
                transparent: true,
                opacity: 0.7
            });
            const smoke = new THREE.Mesh(smokeGeo, smokeMat);
            smoke.position.copy(position);
            smoke.position.y += 2;
            smoke.position.x += (Math.random() - 0.5) * 4;
            smoke.position.z += (Math.random() - 0.5) * 4;
            core.scene.add(smoke);
            
            // Smoke rises and fades
            let smokeY = 2;
            let smokeOpacity = 0.7;
            const smokeInterval = setInterval(() => {
                smokeY += 0.2;
                smokeOpacity -= 0.05;
                smoke.position.y += 0.2;
                smoke.material.opacity = smokeOpacity;
                
                if (smokeOpacity <= 0) {
                    clearInterval(smokeInterval);
                    core.scene.remove(smoke);
                }
            }, 50);
        }, i * 50);
    }
}

// ===================================
// TRACK BUILDING CREATION
// ===================================
function createTrackBuilding(core, config) {
    const group = new THREE.Group();
    
    // Different building types
    let material;
    switch (config.type) {
        case 'grandstand':
            material = new THREE.MeshStandardMaterial({ 
                color: 0xCCCCCC,
                metalness: 0.3,
                roughness: 0.7
            });
            break;
        case 'pit_garage':
            material = new THREE.MeshStandardMaterial({ 
                color: 0x888888,
                metalness: 0.4,
                roughness: 0.6
            });
            break;
        case 'control_tower':
            material = new THREE.MeshStandardMaterial({ 
                color: 0xFFFFFF,
                metalness: 0.2,
                roughness: 0.8
            });
            break;
        case 'vip_box':
            material = new THREE.MeshStandardMaterial({ 
                color: 0xFFD700,
                metalness: 0.6,
                roughness: 0.3
            });
            break;
        default:
            material = new THREE.MeshStandardMaterial({ color: 0x999999 });
    }
    
    const buildingGeo = new THREE.BoxGeometry(
        config.size.width,
        config.size.height,
        config.size.depth
    );
    const building = new THREE.Mesh(buildingGeo, material);
    building.position.y = config.size.height / 2;
    building.castShadow = true;
    building.receiveShadow = true;
    
    group.add(building);
    group.position.set(config.position.x, 0, config.position.z);
    core.scene.add(group);
    core.obstacles.push(group);
    
    return group;
}

// ===================================
// HELPER FUNCTIONS
// ===================================
function showLevelDialogue(core, title, message) {
    if (core.modules.dialogue) {
        if (typeof core.modules.dialogue.show === 'function') {
            core.modules.dialogue.show(title, message);
            return;
        }
    }
    
    const dialogueEl = document.getElementById('dialogue');
    const speakerEl = document.getElementById('dialogue-speaker');
    const textEl = document.getElementById('dialogue-text');
    
    if (dialogueEl && speakerEl && textEl) {
        speakerEl.textContent = title;
        textEl.textContent = message;
        dialogueEl.style.display = 'block';
        
        setTimeout(() => {
            dialogueEl.style.display = 'none';
        }, 5000);
    } else {
        console.log(`📜 ${title}: ${message}`);
    }
}

function completeObjective(core, objectiveId) {
    if (core.modules.objectives) {
        const obj = core.modules.objectives.getObjective(objectiveId);
        if (obj && !obj.complete) {
            obj.complete = true;
            obj.current = obj.target;
            core.modules.objectives.updateDisplay();
            console.log(`✅ Objective completed: ${obj.description}`);
        }
    }
}

function updateObjectiveProgress(core, objectiveId, progress) {
    if (core.modules.objectives) {
        core.modules.objectives.setProgress(objectiveId, progress);
    }
}
