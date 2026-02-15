// level-16-terrain-showcase.js
// Demonstrates the new chunk-based terrain system WITH MUSIC!

window.Level16Config = {
    meta: {
        name: "TERRAIN SHOWCASE",
        number: 16,
        theme: "adventure",
        description: "Experience all terrain types!",
        difficulty: "MEDIUM"
    },
    
    scene: {
        background: 0x87CEEB,  // Sky blue
        fog: {
            color: 0xA0C4E8,
            near: 100,
            far: 500
        }
    },
    
    playerStart: {
        x: 0,
        z: 10
    },
    
    // ===================================
    // 🎵 MUSIC CONFIGURATION - NEW!
    // ===================================
    music: [
        {
            title: "A Sequetorial Editation to Suicide",
            artist: "South of South Records",
            file: "./music/levels/mixdown.ogg"
        },
    ],
    
    // Optional: Boss music for intense moments
    bossMusic: [
        {
            title: "Final Challenge",
            artist: "South of South Records",
            file: "./music/boss/mixdown.ogg"
        }
    ],
    
    // ===================================
    // NEW CHUNK-BASED TERRAIN!
    // ===================================
    terrain: {
        segments: [
            // Section 1: Starting plateau
            {
                type: 'flat',
                length: 80,
                height: 40,
                width: 200
            },
            
            // Section 2: Downhill run
            {
                type: 'hill',
                length: 200,
                startHeight: 40,
                endHeight: 0,
                width: 200
            },
            
            // Section 3: Flat valley floor
            {
                type: 'flat',
                length: 100,
                height: 0,
                width: 200
            },
            
            // Section 4: Mountain climb
            {
                type: 'mountain',
                length: 180,
                peakHeight: 70,
                width: 200
            },
            
            // Section 5: Down into valley
            {
                type: 'valley',
                length: 150,
                depth: -18,
                width: 200
            },
            
            // Section 6: Final uphill challenge
            {
                type: 'hill',
                length: 150,
                startHeight: -10,
                endHeight: 20,
                width: 200
            },
            
            // Section 7: Victory plateau
            {
                type: 'flat',
                length: 140,
                height: 20,
                width: 200
            }
        ]
    },
    
    obstacles: {
        rails: {
            count: 12
        },
        ramps: {
            count: 8
        }
    },
    
    // ===================================
    // OBJECTIVES
    // ===================================
    objectives: {
        score: {
            target: 50000,
            description: "Reach 50,000 points"
        },
        tricks: {
            kickflips: 10,
            description: "Land 10 kickflips"
        },
        kills: {
            count: 15,
            description: "Roadkill 15 enemies"
        }
    },
    
    // ===================================
    // NPCs - Guide posts throughout level
    // ===================================
    npcs: [
        {
            name: "Starting Guide",
            position: { x: -8, y: 0, z: 20 },
            color: 0x00FF00,
            interactRadius: 6,
            dialogue: [
                { speaker: "Starting Guide", text: "Welcome to the Terrain Showcase!" },
                { speaker: "Starting Guide", text: "This level features EVERY terrain type!" },
                { speaker: "Starting Guide", text: "Flats, hills, mountains, and valleys!" },
                { speaker: "Starting Guide", text: "NPCs and enemies now spawn perfectly!" },
                { speaker: "Starting Guide", text: "Press M to open the music menu!" }  // NEW!
            ]
        },
        {
            name: "Hill Master",
            position: { x: 10, y: 0, z: 150 },
            color: 0xFFD700,
            interactRadius: 5,
            dialogue: [
                { speaker: "Hill Master", text: "Nice downhill, right?" },
                { speaker: "Hill Master", text: "The new terrain system is smooth!" },
                { speaker: "Hill Master", text: "No more weird cylinder blobs!" },
                { speaker: "Hill Master", text: "Loving the soundtrack? Press N to skip!" }  // NEW!
            ]
        },
        {
            name: "Valley Dweller",
            position: { x: -12, y: 0, z: 550 },
            color: 0x9400D3,
            interactRadius: 5,
            dialogue: [
                { speaker: "Valley Dweller", text: "You made it to the valley!" },
                { speaker: "Valley Dweller", text: "The terrain system handles negative heights!" },
                { speaker: "Valley Dweller", text: "Pretty cool, huh?" }
            ]
        },
        {
            name: "Finish Line",
            position: { x: 0, y: 0, z: 850 },
            color: 0xFF1493,
            interactRadius: 8,
            dialogue: [
                { speaker: "Finish Line", text: "Congratulations!" },
                { speaker: "Finish Line", text: "You experienced all terrain types!" },
                { speaker: "Finish Line", text: "Now use this system in your own levels!" }
            ]
        }
    ],
    
    // ===================================
    // ENEMIES - Distributed across terrain
    // ===================================
    enemies: {
        // Starting plateau enemies
        plateau: {
            position: { x: 0, z: 40 },
            count: 3,
            spacing: 8,
            behavior: 'wander'
        },
        
        // Downhill enemies (they'll slide down!)
        downhill: {
            position: { x: -10, z: 180 },
            count: 4,
            spacing: 10,
            behavior: 'static'
        },
        
        // Valley floor cluster
        valley1: {
            position: { x: 5, z: 320 },
            count: 5,
            spacing: 8,
            behavior: 'wander'
        },
        
        // Mountain guards
        mountain: {
            position: { x: 0, z: 480 },
            count: 3,
            spacing: 12,
            behavior: 'flee'
        },
        
        // Valley bottom cluster
        valley2: {
            position: { x: -8, z: 600 },
            count: 4,
            spacing: 10,
            behavior: 'wander'
        },
        
        // Final section enemies
        final: {
            position: { x: 10, z: 800 },
            count: 3,
            spacing: 15,
            behavior: 'static'
        }
    },
    
    // ===================================
    // LEVEL INITIALIZATION
    // ===================================
    onLevelStart: function(game) {
        console.log('🎮 TERRAIN SHOWCASE LEVEL');
        console.log('   Demonstrating chunk-based terrain system');
        
        // ========== 🎵 LOAD LEVEL MUSIC - NEW! ==========
        if (game.modules.music && this.music) {
            console.log('🎵 Loading level music...');
            
            // Load this level's specific tracks
            game.modules.music.loadPlaylist('level', this.music);
            
            // Optional: Load boss music if defined
            if (this.bossMusic) {
                game.modules.music.loadPlaylist('boss', this.bossMusic);
            }
            
            // Start playing level music
            game.modules.music.switchContext('level');
            
            console.log(`✅ ${this.music.length} tracks loaded and playing`);
        }
        
        // ========== SPAWN NPCS ==========
        if (game.modules.dialogue && this.npcs) {
            console.log(`💬 Spawning ${this.npcs.length} NPCs...`);
            this.npcs.forEach(npcConfig => {
                const npc = game.modules.dialogue.createNPC(npcConfig);
                console.log(`  ✅ Spawned ${npcConfig.name} at z=${npcConfig.position.z}`);
            });
        }
        
        // ========== SPAWN ENEMIES ==========
        if (game.modules.enemies) {
            console.log('👀 Spawning enemies across terrain...');
            let totalEnemies = 0;
            
            // Spawn each enemy group
            Object.keys(this.enemies).forEach(groupName => {
                const group = this.enemies[groupName];
                
                for (let i = 0; i < group.count; i++) {
                    game.modules.enemies.spawnEnemy({
                        position: {
                            x: group.position.x + (i * group.spacing),
                            z: group.position.z
                        },
                        behavior: group.behavior || 'wander',
                        speed: 0.02,
                        color: group.behavior === 'flee' ? 0xFFFF00 : 
                               group.behavior === 'static' ? 0xFF0000 : 0xFF6666
                    });
                    totalEnemies++;
                }
                
                console.log(`  ✅ Spawned ${group.count} ${group.behavior} enemies at z=${group.position.z}`);
            });
            
            console.log(`✅ Total enemies spawned: ${totalEnemies}`);
        }
        
        // ========== TERRAIN INFO ==========
        if (game.modules.terrain) {
            console.log('🏔️ Terrain chunks:');
            game.modules.terrain.chunks.forEach((chunk, i) => {
                console.log(`  ${i + 1}. ${chunk.type.toUpperCase()} (z: ${chunk.startZ} → ${chunk.endZ})`);
            });
        }
        
        // ========== GORE CHECK ==========
        if (game.modules.gore) {
            console.log('✅ Gore system active');
        }
        
        console.log('🎮 Level ready! All systems operational!');
        console.log('🎵 Music controls: M = Radio Menu, N = Skip Track');
    },
    
    scoring: {
        baseMultiplier: 1.5
    }
};

console.log('✅ Level 16 Terrain Showcase Config Loaded');
