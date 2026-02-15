// level_18.js - COMPLETE FIXED VERSION
// Fixed volcano weather configuration

window.Level22Config = {
    meta: {
        name: "Volcano Island",
        number: 22,
        theme: "volcano",
        description: "Navigate through volcanic terrain and avoid lava!",
        difficulty: "HARD"
    },
    
    scene: {
        background: 0xFF4500, // Orange-red sky
        fog: { 
            color: 0x2A0000, 
            near: 50, 
            far: 300 
        }
    },
    
    playerStart: {
        x: 0,
        z: 10
    },
    
    // Terrain configuration
    terrain: {
        segments: [
            // Starting plateau
            {
                type: 'flat',
                length: 80,
                height: 40,
                width: 200
            },
            // Downward slope
            {
                type: 'hill',
                length: 100,
                startHeight: 40,
                endHeight: 0,
                width: 200
            },
            // Volcanic valley
            {
                type: 'valley',
                length: 150,
                depth: -20,
                width: 200
            },
            // Mountain climb
            {
                type: 'mountain',
                length: 120,
                peakHeight: 80,
                width: 200
            },
            // Final plateau
            {
                type: 'flat',
                length: 150,
                height: 80,
                width: 200
            }
        ]
    },
    
    // Obstacles
    obstacles: {
        rails: { 
            count: 8,
            startZ: 50,
            endZ: 400,
            spacing: 40
        },
        ramps: { 
            count: 5,
            startZ: 100,
            endZ: 400,
            spacing: 60
        }
    },
    
    // Objectives
    objectives: {
        survive: {
            duration: 120, // 2 minutes
            description: "Survive the volcano for 2 minutes"
        },
        score: {
            target: 5000,
            description: "Score 5000 points"
        },
        kills: {
            target: 10,
            description: "Defeat 10 enemies"
        }
    },
    
    // NPCs
    npcs: [
        {
            name: "Volcano Guide",
            position: { x: -10, y: 0, z: 25 },
            color: 0xFF4500,
            interactRadius: 8,
            dialogue: [
                { speaker: "Volcano Guide", text: "Welcome to Volcano Island!" },
                { speaker: "Volcano Guide", text: "Watch out for lava rocks falling from above!" },
                { speaker: "Volcano Guide", text: "The enemies here are extra tough - build up your speed before hitting them!" }
            ]
        }
    ],
    
    // Enemies
    enemies: {
        static: [
            { position: { x: 5, z: 50 }, count: 1 }
        ],
        wander: [
            { position: { x: -10, z: 100 }, count: 3, spacing: 15 },
            { position: { x: 10, z: 200 }, count: 3, spacing: 15 }
        ],
        flee: [
            { position: { x: 0, z: 300 }, count: 5, spacing: 10 }
        ]
    },
    
    // ===================================
    // FIXED: Weather effects (volcano)
    // ===================================
    weather: {
        type: 'volcano',
        intensity: 5,
        // THIS WAS MISSING - Required for volcano weather!
        volcanoes: [
            {
                position: { x: -60, y: 0, z: 150 },
                baseRadius: 25,
                height: 50,
                eruption: {
                    interval: 3000,  // Erupts every 3 seconds
                    projectileCount: 12,
                    spread: 35
                }
            },
            {
                position: { x: 60, y: 0, z: 250 },
                baseRadius: 20,
                height: 40,
                eruption: {
                    interval: 4000,
                    projectileCount: 10,
                    spread: 30
                }
            },
            {
                position: { x: -40, y: 0, z: 350 },
                baseRadius: 18,
                height: 35,
                eruption: {
                    interval: 3500,
                    projectileCount: 8,
                    spread: 25
                }
            }
        ]
    },
    
    // Scoring
    scoring: {
        baseMultiplier: 1.5
    },
    
    // ===================================
    // LEVEL INITIALIZATION
    // ===================================
    onLevelStart: function(game) {
        console.log('🌋 ========== VOLCANO ISLAND ==========');
        console.log('   Level 18: Extreme difficulty!');
        
        // Spawn NPCs
        if (game.modules.dialogue && this.npcs) {
            console.log(`📋 Spawning ${this.npcs.length} NPCs...`);
            this.npcs.forEach(npc => {
                game.modules.dialogue.createNPC(npc);
            });
            console.log('✅ NPCs spawned!');
        }
        
        // Spawn enemies
        if (game.modules.enemies && this.enemies) {
            console.log('📋 Spawning enemies...');
            
            // Static enemies
            if (this.enemies.static) {
                this.enemies.static.forEach(group => {
                    for (let i = 0; i < group.count; i++) {
                        game.modules.enemies.spawnEnemy({
                            position: group.position,
                            behavior: 'static',
                            color: 0xFF0000
                        });
                    }
                });
            }
            
            // Wandering enemies
            if (this.enemies.wander) {
                this.enemies.wander.forEach(group => {
                    game.modules.enemies.spawnLine(
                        group.position.x,
                        group.position.z,
                        group.count,
                        group.spacing
                    );
                });
            }
            
            // Fleeing enemies
            if (this.enemies.flee) {
                this.enemies.flee.forEach(group => {
                    for (let i = 0; i < group.count; i++) {
                        game.modules.enemies.spawnEnemy({
                            position: {
                                x: group.position.x + (Math.random() - 0.5) * 20,
                                z: group.position.z + i * group.spacing
                            },
                            behavior: 'flee',
                            color: 0xFFFF00
                        });
                    }
                });
            }
            
            console.log('✅ Enemies spawned!');
        }
        
        // Check for volcano weather
        if (game.modules.weather) {
            console.log('🌋 Volcano weather active!');
            console.log(`   ${this.weather.volcanoes.length} volcanoes created!`);
            console.log('   Watch for falling lava rocks!');
        }
        
        // Check for gore
        if (game.modules.gore) {
            console.log('🩸 ULTRA Gore enabled!');
        }
        
        console.log('========================================');
    }
};

console.log('✅ Level 18 Config Loaded');
