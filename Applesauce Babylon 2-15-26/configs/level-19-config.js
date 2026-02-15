/**
 * APPLESAUCE Level 19: SKATEPARK CHAOS
 * Example of how easy it is to create new levels with the modular system
 */

const Level19Config = {
    // Level metadata
    name: "The True Danger",
    levelNumber: 19,
    goreEnabled: true,
    
    // Flat terrain (no hill)
    terrain: {
        hillHeight: 0,
        hillLength: 0,
        hillWidth: 0
    },
    
    // Player spawn in middle of skatepark
    playerStart: {
        x: 0,
        z: 0
    },
    
    // Skatepark-style obstacles
    obstacles: [
        // Central bowl area
        { type: 'quarterPipe', x: -20, z: 0, rotation: Math.PI / 2, width: 15 },
        { type: 'quarterPipe', x: 20, z: 0, rotation: -Math.PI / 2, width: 15 },
        { type: 'quarterPipe', x: 0, z: -20, rotation: Math.PI, width: 15 },
        { type: 'quarterPipe', x: 0, z: 20, rotation: 0, width: 15 },
        
        // Funbox pyramid in center
        { type: 'funbox', x: 0, z: 0 },
        
        // Rails around the perimeter
        { type: 'flatRail', x: -30, z: -15, length: 20, rotation: 0 },
        { type: 'flatRail', x: 30, z: 15, length: 20, rotation: Math.PI },
        { type: 'flatRail', x: -15, z: 30, length: 20, rotation: Math.PI / 2 },
        { type: 'flatRail', x: 15, z: -30, length: 20, rotation: -Math.PI / 2 },
        
        // Stair sets in corners
        { type: 'stairs', x: -25, z: -25, rotation: Math.PI / 4 },
        { type: 'stairs', x: 25, z: 25, rotation: -Math.PI / 4 },
        
        // Ledges for grinding
        { type: 'ledge', x: -35, z: 0, length: 15, height: 1.0 },
        { type: 'ledge', x: 35, z: 0, length: 15, height: 1.0 },
        { type: 'ledge', x: 0, z: 35, length: 15, height: 1.2 },
        { type: 'ledge', x: 0, z: -35, length: 15, height: 1.2 }
    ],
    
    // Concrete skatepark ground
    ground: [
        { type: 'concrete', width: 100, depth: 100, position: { x: 0, y: 0, z: 0 } },
        { type: 'grass', width: 200, depth: 200, position: { x: 0, y: -0.1, z: 0 } },
        { type: 'grass', width: 2000, depth: 2000, position: { x: 0, y: -50, z: 0 } }
    ],
    
    // Props (skatepark aesthetic)
    props: [
        // Surrounding buildings
        { 
            type: 'building', 
            width: 15, 
            height: 25, 
            depth: 15, 
            color: '0x4a4a4a',
            position: { x: -60, y: 12.5, z: -60 }
        },
        { 
            type: 'building', 
            width: 15, 
            height: 30, 
            depth: 15, 
            color: '0x3a3a3a',
            position: { x: 60, y: 15, z: 60 }
        },
        { 
            type: 'building', 
            width: 20, 
            height: 35, 
            depth: 15, 
            color: '0x2a2a2a',
            position: { x: -60, y: 17.5, z: 60 }
        },
        { 
            type: 'building', 
            width: 15, 
            height: 28, 
            depth: 15, 
            color: '0x5a5a5a',
            position: { x: 60, y: 14, z: -60 }
        },
        
        // Skatepark entrance sign
        { 
            type: 'sign', 
            width: 12, 
            height: 6, 
            color: '0xFF1493',
            position: { x: 0, y: 4, z: -50 }
        }
    ],
    
    // NPCs in the skatepark
    npcs: [
        {
            name: "SKATE VETERAN",
            position: { x: -15, y: 0, z: -15 },
            color: 0x0000FF,
            interactRadius: 5,
            dialogue: [
                { speaker: "SKATE VETERAN", text: "Welcome to the chaos zone!" },
                { speaker: "SKATE VETERAN", text: "These enemies are more aggressive here." },
                { speaker: "SKATE VETERAN", text: "Use the bowl to build speed and rack up combos!" },
                { speaker: "YOU", text: "Got it, thanks!" }
            ]
        },
        {
            name: "MYSTERIOUS COACH",
            position: { x: 25, y: 0, z: 25 },
            color: 0x800080,
            interactRadius: 6,
            dialogue: [
                { speaker: "MYSTERIOUS COACH", text: "Your skills are improving..." },
                { speaker: "MYSTERIOUS COACH", text: "But the real test is yet to come." },
                { speaker: "YOU", text: "Bring it on!" }
            ]
        },
        {
            name: "HYPE CROWD",
            position: { x: 40, y: 0, z: 0 },
            color: 0xFFD700,
            interactRadius: 5,
            dialogue: [
                { speaker: "HYPE CROWD", text: "YO! That was SICK!" },
                { speaker: "HYPE CROWD", text: "Keep shredding! We love the carnage!" },
                { speaker: "YOU", text: "Thanks for the support!" }
            ]
        }
    ],
    
    // More aggressive enemy waves in skatepark
    enemies: [
        // Initial crowd around edges
        { type: 'line', x: -40, z: -20, count: 6, spacing: 4 },
        { type: 'line', x: 40, z: 20, count: 6, spacing: 4 },
        
        // Clusters invading the skatepark
        { type: 'cluster', x: -25, z: 0, count: 10, radius: 8 },
        { type: 'cluster', x: 25, z: 0, count: 10, radius: 8 },
        { type: 'cluster', x: 0, z: -25, count: 8, radius: 6 },
        { type: 'cluster', x: 0, z: 25, count: 8, radius: 6 },
        
        // Final assault wave
        { type: 'line', x: 0, z: -45, count: 10, spacing: 3 }
    ],
    
    // Dual boss fight!
    boss: {
        spawn: { x: 0, z: 50 },
        color: 0xFF0000,
        health: 15,
        speed: 0.06,
        triggerCondition: 'roadkillComplete'
    },
    
    // Harder objectives
    objectives: [
        {
            type: 'kill',
            count: 20,
            description: "Roadkill 20 People"
        },
        {
            type: 'trick',
            trickType: 'Kickflip',
            count: 10,
            description: "Land 10 Kickflips"
        },
        {
            type: 'score',
            score: 50000,
            description: "Reach 50,000 Points"
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
function initLevel19(engine) {
    console.log('🎮 Loading Level 19: ' + Level19Config.name);
    
    // Create player
    engine.createPlayer(Level19Config.playerStart.x, Level19Config.playerStart.z);
    
    // Build ground planes
    for (let ground of Level19Config.ground) {
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
    for (let obs of Level19Config.obstacles) {
        switch(obs.type) {
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
    for (let prop of Level19Config.props) {
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
    
    // Setup NPCs
    if (engine.modules.dialogue) {
        for (let npcConfig of Level19Config.npcs) {
            engine.modules.dialogue.createNPC(npcConfig);
        }
    }
    
    // Spawn enemies
    if (engine.modules.enemies) {
        for (let wave of Level19Config.enemies) {
            if (wave.type === 'line') {
                engine.modules.enemies.spawnLine(wave.x, wave.z, wave.count, wave.spacing);
            } else if (wave.type === 'cluster') {
                engine.modules.enemies.spawnCluster(wave.x, wave.z, wave.count, wave.radius);
            }
        }
    }
    
    // Setup objectives
    if (engine.modules.objectives) {
        for (let objConfig of Level19Config.objectives) {
            if (objConfig.type === 'kill') {
                const obj = engine.modules.objectives.addKillObjective(objConfig.count, objConfig.description);
                
                // Boss spawn trigger
                if (Level19Config.boss && Level19Config.boss.triggerCondition === 'roadkillComplete') {
                    obj.onComplete = (engine) => {
                        if (engine.modules.enemies && !engine.modules.enemies.boss) {
                            console.log('🔥 BOSS INCOMING! This one is TOUGH!');
                            engine.modules.enemies.spawnBoss({
                                position: Level19Config.boss.spawn,
                                color: Level19Config.boss.color,
                                health: Level19Config.boss.health,
                                speed: Level19Config.boss.speed
                            });
                        }
                    };
                }
            } else if (objConfig.type === 'trick') {
                engine.modules.objectives.addTrickObjective(objConfig.trickType, objConfig.count, objConfig.description);
            } else if (objConfig.type === 'boss') {
                engine.modules.objectives.addBossObjective(objConfig.description);
            } else if (objConfig.type === 'score') {
                engine.modules.objectives.addScoreObjective(objConfig.score, objConfig.description);
            }
        }
    }
    
    console.log('✅ Level 19 loaded successfully!');
}
