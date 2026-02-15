/**
 * APPLESAUCE Level 17: DOWNHILL BOMB
 * Configuration file for level setup
 */

const Level17Config = {
    // Level metadata
    name: "DOWNHILL BOMB",
    levelNumber: 17,
    goreEnabled: true,
    
    // Terrain settings
    terrain: {
        hillHeight: 60,
        hillLength: 250,
        hillWidth: 100
    },
    
    // Player spawn
    playerStart: {
        x: 0,
        z: 10
    },
    
    // Obstacles layout
    obstacles: [
        // Rails down the hill
        { type: 'longRail', xOffset: -5, zStart: 20, zEnd: 200, heightStart: 50, heightEnd: 5 },
        { type: 'longRail', xOffset: 5, zStart: 30, zEnd: 210, heightStart: 48, heightEnd: 3 },
        
        // Quarter pipes at bottom
        { type: 'quarterPipe', x: -15, z: 220, rotation: Math.PI / 4, width: 10 },
        { type: 'quarterPipe', x: 15, z: 225, rotation: -Math.PI / 4, width: 10 },
        
        // Funbox
        { type: 'funbox', x: 0, z: 240 },
        
        // Stairs
        { type: 'stairs', x: 10, z: 260, rotation: 0 },
        
        // Flat rails
        { type: 'flatRail', x: -8, z: 280, length: 15, rotation: 0 },
        { type: 'flatRail', x: 8, z: 285, length: 12, rotation: Math.PI / 6 },
        
        // Ledges
        { type: 'ledge', x: 0, z: 300, length: 20, height: 1.5 }
    ],
    
    // Ground planes
    ground: [
        { type: 'grass', width: 200, depth: 400, position: { x: 0, y: 0, z: 200 } },
        { type: 'concrete', width: 40, depth: 100, position: { x: 0, y: 0.05, z: 280 } }
    ],
    
    // Props (buildings, signs, etc)
    props: [
        { 
            type: 'building', 
            width: 20, 
            height: 40, 
            depth: 15, 
            color: '0x2a2a2a',
            position: { x: -50, y: 20, z: 250 }
        },
        { 
            type: 'building', 
            width: 15, 
            height: 30, 
            depth: 15, 
            color: '0x3a3a3a',
            position: { x: 50, y: 15, z: 260 }
        },
        { 
            type: 'sign', 
            width: 8, 
            height: 4, 
            color: '0xFF0000',
            position: { x: -20, y: 3, z: 200 }
        }
    ],
    
    // NPCs
    npcs: [
        {
            name: "SKATE RAT",
            position: { x: -3, y: 0, z: 25 },
            color: 0x00FF00,
            interactRadius: 5,
            dialogue: [
                { speaker: "SKATE RAT", text: "Yo! You ready for this gnarly hill?" },
                { speaker: "SKATE RAT", text: "Hit those people at high speed for ROADKILL points!" },
                { speaker: "SKATE RAT", text: "Watch out for the boss at the bottom though..." },
                { speaker: "YOU", text: "Thanks for the warning!" }
            ]
        },
        {
            name: "MYSTERY FIGURE",
            position: { x: 10, y: 0, z: 290 },
            color: 0x800080,
            interactRadius: 6,
            dialogue: [
                { speaker: "MYSTERY FIGURE", text: "You're doing well..." },
                { speaker: "MYSTERY FIGURE", text: "But can you handle what's coming next?" },
                { speaker: "YOU", text: "I guess we'll find out!" }
            ]
        }
    ],
    
    // Enemy waves
    enemies: [
        // Wave 1: Early hill
        { type: 'line', x: 0, z: 50, count: 5, spacing: 4 },
        
        // Wave 2: Mid hill
        { type: 'cluster', x: -5, z: 100, count: 8, radius: 6 },
        
        // Wave 3: Bottom of hill
        { type: 'line', x: 3, z: 180, count: 6, spacing: 5 },
        
        // Wave 4: Final gauntlet
        { type: 'cluster', x: 0, z: 230, count: 10, radius: 8 }
    ],
    
    // Boss fight
    boss: {
        spawn: { x: 0, z: 320 },
        color: 0xFF0000,
        health: 10,
        speed: 0.05,
        triggerCondition: 'roadkillComplete' // Spawn when roadkill objective done
    },
    
    // Level objectives
    objectives: [
        {
            type: 'kill',
            count: 10,
            description: "Roadkill 10 People"
        },
        {
            type: 'trick',
            trickType: 'Kickflip',
            count: 5,
            description: "Land 5 Kickflips"
        },
        {
            type: 'boss',
            description: "Defeat the Boss"
        }
    ]
};

// ===================================
// LEVEL INITIALIZATION FUNCTION
// ===================================
function initLevel17(engine) {
    console.log('🎮 Loading Level 17: ' + Level17Config.name);
    
    // Create player
    engine.createPlayer(Level17Config.playerStart.x, Level17Config.playerStart.z);
    
    // Build terrain
    // Note: Hill generation is handled in the core engine's getTerrainHeight
    // You can extend this to build custom terrain meshes
    
    // Build ground planes
    for (let ground of Level17Config.ground) {
        const geo = new THREE.PlaneGeometry(ground.width, ground.depth);
        const mat = ground.type === 'grass' ? 
            engine.materials.grass : 
            new THREE.MeshLambertMaterial({ color: 0x606060 });
        
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(ground.position.x, ground.position.y, ground.position.z);
        mesh.receiveShadow = true;
        engine.scene.add(mesh);
    }
    
    // Build obstacles
    for (let obs of Level17Config.obstacles) {
        switch(obs.type) {
            case 'longRail':
                engine.createLongRail(obs.xOffset, obs.zStart, obs.zEnd, obs.heightStart, obs.heightEnd);
                break;
            case 'quarterPipe':
                engine.createQuarterPipe(obs.x, obs.z, obs.rotation, obs.width);
                break;
            case 'funbox':
                engine.createFunbox(obs.x, obs.z);
                break;
            case 'ledge':
                engine.createLedge(obs.x, obs.z, obs.length, obs.height);
                break;
            case 'stairs':
                engine.createStairs(obs.x, obs.z, obs.rotation);
                break;
            case 'flatRail':
                engine.createFlatRail(obs.x, obs.z, obs.length, obs.rotation);
                break;
        }
    }
    
    // Build props
    for (let prop of Level17Config.props) {
        if (prop.type === 'building') {
            const geo = new THREE.BoxGeometry(prop.width, prop.height, prop.depth);
            const mat = new THREE.MeshLambertMaterial({ color: parseInt(prop.color) });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(prop.position.x, prop.position.y, prop.position.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            engine.scene.add(mesh);
        } else if (prop.type === 'sign') {
            const geo = new THREE.BoxGeometry(prop.width, prop.height, 0.5);
            const mat = new THREE.MeshLambertMaterial({ color: parseInt(prop.color) });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(prop.position.x, prop.position.y, prop.position.z);
            mesh.castShadow = true;
            engine.scene.add(mesh);
        }
    }
    
    // Setup NPCs (if dialogue module loaded)
    if (engine.modules.dialogue) {
        for (let npcConfig of Level17Config.npcs) {
            engine.modules.dialogue.createNPC(npcConfig);
        }
    }
    
    // Spawn enemies (if enemies module loaded)
    if (engine.modules.enemies) {
        for (let wave of Level17Config.enemies) {
            if (wave.type === 'line') {
                engine.modules.enemies.spawnLine(wave.x, wave.z, wave.count, wave.spacing);
            } else if (wave.type === 'cluster') {
                engine.modules.enemies.spawnCluster(wave.x, wave.z, wave.count, wave.radius);
            }
        }
    }
    
    // Setup objectives (if objectives module loaded)
    if (engine.modules.objectives) {
        for (let objConfig of Level17Config.objectives) {
            if (objConfig.type === 'kill') {
                const obj = engine.modules.objectives.addKillObjective(objConfig.count, objConfig.description);
                
                // Boss spawn trigger
                if (Level17Config.boss && Level17Config.boss.triggerCondition === 'roadkillComplete') {
                    obj.onComplete = (engine) => {
                        if (engine.modules.enemies && !engine.modules.enemies.boss) {
                            console.log('🔥 BOSS INCOMING!');
                            engine.modules.enemies.spawnBoss({
                                position: Level17Config.boss.spawn,
                                color: Level17Config.boss.color,
                                health: Level17Config.boss.health,
                                speed: Level17Config.boss.speed
                            });
                        }
                    };
                }
            } else if (objConfig.type === 'trick') {
                engine.modules.objectives.addTrickObjective(objConfig.trickType, objConfig.count, objConfig.description);
            } else if (objConfig.type === 'boss') {
                engine.modules.objectives.addBossObjective(objConfig.description);
            }
        }
    }
    
    console.log('✅ Level 17 loaded successfully!');
}
