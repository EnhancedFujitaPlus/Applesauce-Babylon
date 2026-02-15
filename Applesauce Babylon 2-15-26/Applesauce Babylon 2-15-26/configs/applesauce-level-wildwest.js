/**
 * APPLESAUCE - Level 3: High Noon Showdown
 * Wild West town with train track moral dilemma
 * Reference: Fallout New Vegas train tracks scene
 */
import * as THREE from '../three.module.js';

export const HighNoonShowdown = {
    meta: {
        number: 3,
        name: "High Noon Showdown",
        description: "Start the train, become the villain",
        difficulty: "Medium",
        theme: "wild-west"
    },
    
    scene: {
        background: 0xD2691E, // Dusty orange sky
        fog: {
            color: 0xD2691E,
            near: 50,
            far: 300
        }
    },
    
    playerStart: {
        x: -40,
        z: 0
    },
    
    terrain: {
        type: 'desert',
        size: 200,
        material: 'dirt' // Sandy desert floor
    },
    
    // Town layout
    buildings: [
        // Main Street buildings (one side)
        {
            type: 'saloon',
            position: { x: -30, z: -20 },
            size: { width: 15, height: 12, depth: 8 }
        },
        {
            type: 'general_store',
            position: { x: -10, z: -20 },
            size: { width: 12, height: 10, depth: 8 }
        },
        {
            type: 'bank',
            position: { x: 10, z: -20 },
            size: { width: 10, height: 12, depth: 8 }
        },
        {
            type: 'sheriffs_office',
            position: { x: 30, z: -20 },
            size: { width: 10, height: 8, depth: 8 }
        },
        
        // Other side of street
        {
            type: 'hotel',
            position: { x: -25, z: 20 },
            size: { width: 12, height: 15, depth: 8 }
        },
        {
            type: 'blacksmith',
            position: { x: -5, z: 20 },
            size: { width: 10, height: 8, depth: 8 }
        },
        {
            type: 'stable',
            position: { x: 15, z: 20 },
            size: { width: 15, height: 8, depth: 10 }
        }
    ],
    
    // Train tracks and train
    railroad: {
        trackStart: { x: -60, z: 0 },
        trackEnd: { x: 60, z: 0 },
        trainPosition: { x: -60, z: 0 },
        trainActive: false,
        victimsOnTrack: [
            { x: 20, z: 0 }, // 3 NPCs tied to tracks
            { x: 25, z: 0 },
            { x: 30, z: 0 }
        ]
    },
    
    // Skateable objects
    obstacles: [
        // Rails on porches
        { type: 'rail', start: [-30, 0, -15], end: [-15, 0, -15] },
        { type: 'rail', start: [-10, 0, -15], end: [5, 0, -15] },
        { type: 'rail', start: [10, 0, -15], end: [20, 0, -15] },
        
        // Water troughs (grindable)
        { type: 'box', position: [-20, 0, -10], size: [4, 1, 2], material: 'wood' },
        { type: 'box', position: [15, 0, -10], size: [4, 1, 2], material: 'wood' },
        
        // Hitching posts (manual tricks)
        { type: 'pole', position: [-25, 0, -12], height: 4 },
        { type: 'pole', position: [0, 0, -12], height: 4 },
        { type: 'pole', position: [25, 0, -12], height: 4 },
        
        // Hay bales (quarter pipes)
        { type: 'ramp', position: [-35, 0, 10], size: [6, 3, 6], angle: 45 },
        { type: 'ramp', position: [35, 0, 10], size: [6, 3, 6], angle: 45 }
    ],
    
    objectives: [
        {
            id: 'explore_town',
            description: 'Explore the town (0/7 buildings discovered)',
            type: 'discovery',
            required: 7,
            current: 0
        },
        {
            id: 'find_lever',
            description: 'Find the train lever',
            type: 'objective',
            completed: false
        },
        {
            id: 'start_train',
            description: 'Start the train (???)',
            type: 'moral_choice',
            completed: false,
            hidden: true // Only shows after finding lever
        }
    ],
    
    // NPCs and dialogue
    npcs: [
        {
            name: 'Sheriff',
            position: { x: 32, z: -18 },
            dialogue: [
                "Stranger, we don't take kindly to troublemakers.",
                "Keep your tricks to yourself, skater."
            ],
            hostile: false
        },
        {
            name: 'Bartender',
            position: { x: -28, z: -18 },
            dialogue: [
                "What'll it be, stranger?",
                "Train's been broke for weeks. Town's dying."
            ],
            hostile: false
        },
        {
            name: 'Mysterious Figure',
            position: { x: -50, z: -5 },
            dialogue: [
                "That train lever... it's in the sheriff's office.",
                "Start that train, and you'll save this town...",
                "...or doom it. Choice is yours."
            ],
            hostile: false,
            triggersObjective: 'find_lever'
        }
    ],
    
    // Victims on tracks (tied up NPCs)
    trackVictims: [
        {
            position: { x: 20, z: 0 },
            name: "Innocent Townsperson #1",
            dialogue: ["Help! Please!", "Don't start that train!"]
        },
        {
            position: { x: 25, z: 0 },
            name: "Innocent Townsperson #2", 
            dialogue: ["We're tied up here!", "This is the villain's doing!"]
        },
        {
            position: { x: 30, z: 0 },
            name: "Innocent Townsperson #3",
            dialogue: ["You're not actually going to...", "NO!!!"]
        }
    ],
    
    // Interactive objects
    interactables: [
        {
            type: 'train_lever',
            position: { x: 32, z: -16 }, // Inside sheriff's office
            action: 'start_train',
            prompt: 'Press E to pull lever',
            oneTime: true
        }
    ],
    
    // Level-specific logic
    onLevelStart(core) {
        console.log('🤠 Welcome to High Noon Showdown');
        
        // Verify THREE is available
        if (typeof THREE === 'undefined') {
            console.error('THREE.js not loaded!');
            return;
        }
        
        // Initialize custom objectives
        if (core.modules.objectives) {
            core.modules.objectives.clear();
            
            // Add custom objectives manually
            core.modules.objectives.add({
                id: 'explore_town',
                description: 'Explore the town',
                type: 'discovery',
                target: 7,
                current: 0,
                checker: (engine) => {
                    return engine.buildingsDiscovered || 0;
                }
            });
            
            core.modules.objectives.add({
                id: 'find_lever',
                description: 'Find the train lever',
                type: 'objective',
                target: 1,
                current: 0
            });
            
            core.modules.objectives.add({
                id: 'start_train',
                description: 'Pull the train lever',
                type: 'moral_choice',
                target: 1,
                current: 0
            });
            
            console.log('✅ Wild West objectives loaded');
        }
        
        // Spawn NPCs
        this.npcs.forEach(npc => {
            if (core.modules.dialogue && core.modules.dialogue.createNPC) {
                try {
                    // Convert dialogue array to proper format
                    const formattedDialogue = npc.dialogue.map(text => ({
                        speaker: npc.name,
                        text: typeof text === 'string' ? text : text.text || ''
                    }));
                    
                    core.modules.dialogue.createNPC({
                        position: new THREE.Vector3(npc.position.x, 2, npc.position.z),
                        name: npc.name,
                        dialogue: formattedDialogue,
                        color: npc.hostile ? 0xFF0000 : 0x8B4513 // Brown for friendly
                    });
                } catch (error) {
                    console.warn('Failed to create NPC:', npc.name, error);
                }
            }
        });
        
        // Spawn victims on tracks
        this.trackVictims.forEach((victim, index) => {
            if (core.modules.dialogue && core.modules.dialogue.createNPC) {
                try {
                    // Convert dialogue array to proper format
                    const formattedDialogue = victim.dialogue.map(text => ({
                        speaker: victim.name,
                        text: typeof text === 'string' ? text : text.text || ''
                    }));
                    
                    const npcMesh = core.modules.dialogue.createNPC({
                        position: new THREE.Vector3(victim.position.x, 0.5, victim.position.z),
                        name: victim.name,
                        dialogue: formattedDialogue,
                        color: 0xFFFFFF // White (terrified)
                    });
                    
                    // Make them look tied up (rotate to lying down)
                    if (npcMesh && npcMesh.rotation) {
                        npcMesh.rotation.x = Math.PI / 2;
                    }
                } catch (error) {
                    console.warn('Failed to create victim NPC:', index, error);
                }
            }
        });
        
        // Create town buildings and track them
        core.wildwestBuildings = [];
        core.buildingsDiscovered = 0;
        
        this.buildings.forEach(building => {
            const buildingObj = createBuilding(core, building);
            core.wildwestBuildings.push({
                config: building,
                mesh: buildingObj,
                discovered: false
            });
        });
        
        // Create railroad tracks
        createRailroadTracks(core, this.railroad);
        
        // Create train
        const train = createTrain(core, this.railroad.trainPosition);
        
        // Store train reference for later
        core.wildwestTrain = {
            mesh: train,
            active: false,
            position: this.railroad.trainPosition.x,
            targetPosition: this.railroad.trackEnd.x,
            victims: this.trackVictims
        };
        
        // Train lever interaction
        core.wildwestLever = {
            pulled: false,
            discovered: false,
            position: this.interactables[0].position
        };
        
        // Show initial dialogue
        showLevelDialogue(core, 
            "High Noon Showdown",
            "A dying town. A broken train. And something sinister afoot..."
        );
    },
    
    // Custom update loop
    onUpdate(core) {
        // Update dialogue module (CRITICAL for NPC interactions!)
        if (core.modules.dialogue && core.modules.dialogue.update) {
            core.modules.dialogue.update(core);
        }
        
        if (!core.player) return;
        
        const playerPos = core.player.position;
        
        // ===================================
        // BUILDING DISCOVERY
        // ===================================
        if (core.wildwestBuildings) {
            core.wildwestBuildings.forEach((building, index) => {
                if (building.discovered) return;
                
                const dist = Math.sqrt(
                    Math.pow(playerPos.x - building.config.position.x, 2) + 
                    Math.pow(playerPos.z - building.config.position.z, 2)
                );
                
                // Within 10 units of building
                if (dist < 10) {
                    building.discovered = true;
                    core.buildingsDiscovered = (core.buildingsDiscovered || 0) + 1;
                    
                    updateObjectiveProgress(core, 'explore_town', core.buildingsDiscovered);
                    
                    console.log(`🏠 Discovered: ${building.config.type} (${core.buildingsDiscovered}/7)`);
                    
                    if (core.buildingsDiscovered === 7) {
                        showLevelDialogue(core, "Explorer", "You've explored the whole town!");
                    }
                }
            });
        }
        
        // ===================================
        // TRAIN LEVER DISCOVERY
        // ===================================
        if (!core.wildwestLever.discovered) {
            const leverPos = core.wildwestLever.position;
            const distToLever = Math.sqrt(
                Math.pow(playerPos.x - leverPos.x, 2) + 
                Math.pow(playerPos.z - leverPos.z, 2)
            );
            
            // Within 8 units of lever
            if (distToLever < 8) {
                core.wildwestLever.discovered = true;
                completeObjective(core, 'find_lever');
                
                showLevelDialogue(core, 
                    "Train Lever",
                    "You found the train lever. Press E when close to pull it..."
                );
                
                console.log('🔧 Train lever discovered!');
            }
        }
        
        // ===================================
        // TRAIN LEVER INTERACTION
        // ===================================
        if (!core.wildwestLever.pulled && core.keys['e']) {
            const leverPos = core.wildwestLever.position;
            const dist = Math.sqrt(
                Math.pow(playerPos.x - leverPos.x, 2) + 
                Math.pow(playerPos.z - leverPos.z, 2)
            );
            
            if (dist < 5) {
                pullTrainLever(core);
            }
        }
        
        // Show interaction prompt for lever
        if (!core.wildwestLever.pulled) {
            const leverPos = core.wildwestLever.position;
            const dist = Math.sqrt(
                Math.pow(playerPos.x - leverPos.x, 2) + 
                Math.pow(playerPos.z - leverPos.z, 2)
            );
            
            const promptEl = document.getElementById('interaction-prompt');
            if (promptEl) {
                if (dist < 5) {
                    promptEl.textContent = 'Press E to pull train lever';
                    promptEl.style.display = 'block';
                } else {
                    promptEl.style.display = 'none';
                }
            }
        } else {
            const promptEl = document.getElementById('interaction-prompt');
            if (promptEl) promptEl.style.display = 'none';
        }
        
        // ===================================
        // TRAIN MOVEMENT
        // ===================================
        if (core.wildwestTrain && core.wildwestTrain.active) {
            updateTrain(core);
        }
    }
};

// ===================================
// BUILDING CREATION
// ===================================
function createBuilding(core, config) {
    const group = new THREE.Group();
    
    // Main building structure
    const buildingGeo = new THREE.BoxGeometry(
        config.size.width,
        config.size.height,
        config.size.depth
    );
    
    // Get wood material from core
    const buildingMat = core.materials.getMaterial 
        ? core.materials.getMaterial('woodWeathered')
        : core.materials.wood;
    
    const building = new THREE.Mesh(buildingGeo, buildingMat);
    building.position.y = config.size.height / 2;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);
    
    // Add roof
    const roofGeo = new THREE.ConeGeometry(
        Math.max(config.size.width, config.size.depth) * 0.7,
        config.size.height * 0.3,
        4
    );
    const roof = new THREE.Mesh(roofGeo, buildingMat);
    roof.position.y = config.size.height + (config.size.height * 0.15);
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
    
    // Add porch rail (skateable!)
    if (config.type === 'saloon' || config.type === 'hotel') {
        const railGeo = new THREE.BoxGeometry(config.size.width, 0.2, 0.2);
        const railMat = core.materials.getMaterial 
            ? core.materials.getMaterial('wood')
            : core.materials.wood;
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.y = 2;
        rail.position.z = config.size.depth / 2 + 1;
        group.add(rail);
        
        // Make rail grindable
        core.rails.push(rail);
    }
    
    group.position.set(config.position.x, 0, config.position.z);
    core.scene.add(group);
    core.obstacles.push(group);
    
    return group;  // Return for tracking
}

// ===================================
// RAILROAD CREATION
// ===================================
function createRailroadTracks(core, config) {
    const trackGroup = new THREE.Group();
    
    // Metal material for tracks
    const trackMat = core.materials.getMaterial 
        ? core.materials.getMaterial('metalRusty')
        : core.materials.metal;
    
    // Create two rails
    const railLength = config.trackEnd.x - config.trackStart.x;
    
    for (let offset of [-1, 1]) {
        const railGeo = new THREE.BoxGeometry(railLength, 0.3, 0.3);
        const rail = new THREE.Mesh(railGeo, trackMat);
        rail.position.set(
            (config.trackStart.x + config.trackEnd.x) / 2,
            0.15,
            offset
        );
        rail.castShadow = true;
        trackGroup.add(rail);
    }
    
    // Add wooden ties
    const tieCount = 60;
    const tieMat = core.materials.getMaterial 
        ? core.materials.getMaterial('woodWeathered')
        : core.materials.wood;
    
    for (let i = 0; i < tieCount; i++) {
        const tieGeo = new THREE.BoxGeometry(0.3, 0.2, 3);
        const tie = new THREE.Mesh(tieGeo, tieMat);
        tie.position.set(
            config.trackStart.x + (railLength / tieCount) * i,
            0.1,
            0
        );
        trackGroup.add(tie);
    }
    
    core.scene.add(trackGroup);
}

// ===================================
// TRAIN CREATION
// ===================================
function createTrain(core, position) {
    const trainGroup = new THREE.Group();
    
    const metalMat = core.materials.getMaterial 
        ? core.materials.getMaterial('metalRusty')
        : core.materials.metal;
    
    // Engine
    const engineGeo = new THREE.BoxGeometry(8, 5, 6);
    const engine = new THREE.Mesh(engineGeo, metalMat);
    engine.position.y = 2.5;
    engine.castShadow = true;
    trainGroup.add(engine);
    
    // Smokestack
    const stackGeo = new THREE.CylinderGeometry(0.5, 0.8, 3);
    const stack = new THREE.Mesh(stackGeo, metalMat);
    stack.position.set(-2, 6.5, 0);
    trainGroup.add(stack);
    
    // Cow catcher
    const catcherGeo = new THREE.ConeGeometry(2, 3, 4);
    const catcher = new THREE.Mesh(catcherGeo, metalMat);
    catcher.rotation.z = -Math.PI / 2;
    catcher.position.set(5, 1, 0);
    trainGroup.add(catcher);
    
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(1, 1, 0.5);
    const wheelMat = core.materials.getMaterial 
        ? core.materials.getMaterial('metal')
        : core.materials.metal;
    
    const wheelPositions = [
        [-2, 0, -2.5], [-2, 0, 2.5],
        [2, 0, -2.5], [2, 0, 2.5]
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);
        trainGroup.add(wheel);
    });
    
    trainGroup.position.set(position.x, 0, position.z);
    core.scene.add(trainGroup);
    
    return trainGroup;
}

// ===================================
// TRAIN LEVER INTERACTION
// ===================================
function pullTrainLever(core) {
    core.wildwestLever.pulled = true;
    core.wildwestTrain.active = true;
    
    console.log('🚂 TRAIN STARTED!');
    
    // Show warning dialogue
    showLevelDialogue(core,
        "The Train Lever",
        "The train roars to life. The villagers scream. What have you done?"
    );
    
    // Mark objective complete
    completeObjective(core, 'start_train');
    
    // Play train sound (if you have audio)
    // core.audio.play('train_whistle');
}

// ===================================
// TRAIN UPDATE
// ===================================
function updateTrain(core) {
    const train = core.wildwestTrain;
    
    // Move train forward
    train.mesh.position.x += 0.3; // Slow ominous speed
    
    // Check for victim collisions
    train.victims.forEach((victim, index) => {
        const victimX = victim.position.x;
        
        // Train reaches victim
        if (train.mesh.position.x >= victimX && train.mesh.position.x <= victimX + 2) {
            console.log(`💀 TRAIN HIT VICTIM ${index + 1}`);
            
            // GORE EXPLOSION
            if (core.modules.gore) {
                core.modules.gore.createMassiveSplatter(
                    new THREE.Vector3(victimX, 1, 0),
                    new THREE.Vector3(0.5, 0.3, 0) // Forward velocity
                );
            }
            
            // Remove victim from list
            train.victims[index].hit = true;
            
            // Show dialogue
            showLevelDialogue(core,
                "Consequences",
                "The town will never forgive you."
            );
        }
    });
    
    // Check if train reaches end
    if (train.mesh.position.x >= train.targetPosition) {
        train.active = false;
        
        // LEVEL COMPLETE - But at what cost?
        showLevelDialogue(core,
            "Mission Complete(?)",
            "The train runs again. The town is saved. You are a monster."
        );
        
        console.log('🎬 Level complete - Villain ending achieved');
    }
}

// ===================================
// DIALOGUE HELPER
// ===================================
/**
 * Safely show dialogue regardless of dialogue module API
 * Tries multiple methods and falls back to DOM display
 */
function showLevelDialogue(core, title, message) {
    // Try various dialogue module methods
    if (core.modules.dialogue) {
        // Method 1: show()
        if (typeof core.modules.dialogue.show === 'function') {
            core.modules.dialogue.show(title, message);
            return;
        }
        
        // Method 2: showDialogue()
        if (typeof core.modules.dialogue.showDialogue === 'function') {
            core.modules.dialogue.showDialogue(title, message);
            return;
        }
        
        // Method 3: displayMessage()
        if (typeof core.modules.dialogue.displayMessage === 'function') {
            core.modules.dialogue.displayMessage(title, message);
            return;
        }
        
        // Method 4: showMessage()
        if (typeof core.modules.dialogue.showMessage === 'function') {
            core.modules.dialogue.showMessage(title, message);
            return;
        }
    }
    
    // Fallback: Display via DOM
    const dialogueEl = document.getElementById('dialogue');
    const speakerEl = document.getElementById('dialogue-speaker');
    const textEl = document.getElementById('dialogue-text');
    
    if (dialogueEl && speakerEl && textEl) {
        speakerEl.textContent = title;
        textEl.textContent = message;
        dialogueEl.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            dialogueEl.style.display = 'none';
        }, 5000);
    } else {
        // Ultimate fallback: console
        console.log(`📜 ${title}: ${message}`);
    }
}

// ===================================
// OBJECTIVES HELPER
// ===================================
/**
 * Complete an objective by ID
 * Works with the actual objectives module API
 */
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

/**
 * Update objective progress
 */
function updateObjectiveProgress(core, objectiveId, progress) {
    if (core.modules.objectives) {
        core.modules.objectives.setProgress(objectiveId, progress);
    }
}
