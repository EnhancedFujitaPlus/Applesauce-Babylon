/**
 * LEVEL 20 - ST. CLAIR'S DEFEAT
 * November 4, 1791 - Ohio Territory
 * 
 * One of the worst defeats in U.S. military history
 * Playing as Native American confederation forces
 * Canyon basin battlefield with tactical advantages
 */

const Level20Config = {
    meta: {
        number: 20,
        name: "Outside the Box",
        subtitle: "St. Clair's Defeat - 1791",
        description: "The American camp lies vulnerable in the canyon basin. Strike swiftly.",
        difficulty: "HARD",
        historicalContext: {
            date: "November 4, 1791",
            location: "Wabash River, Ohio Territory",
            forces: {
                native: "Little Turtle's Confederation (1,100 warriors)",
                american: "General Arthur St. Clair (1,400 soldiers + 200 camp followers)"
            },
            casualties: {
                native: "~21 killed, 40 wounded",
                american: "~632 killed, 264 wounded (69% casualty rate)"
            }
        }
    },
    
    // Scene atmosphere - cold November morning
    scene: {
        background: 0x4a5859,      // Misty grey-blue dawn
        fog: {
            color: 0x4a5859,
            near: 50,
            far: 300              // Limited visibility in morning mist
        }
    },
    
    // Skybox - Early morning overcast
    skybox: {
        type: 'gradient',
        topColor: 0x6b7c7d,       // Dark grey
        bottomColor: 0x4a5859,    // Misty blue-grey
        atmosphere: 'heavy'
    },
    
    // Canyon Basin Terrain
    terrain: {
        type: 'canyon_basin',
        
        // Large basin surrounded by ridges
        basin: {
            width: 400,
            depth: 400,
            centerDepth: -15,      // Basin floor 15 units below surrounding terrain
            wallHeight: 35,        // Ridge walls 35 units high
            wallSteepness: 0.7     // Moderate slopes for tactical movement
        },
        
        // Ground texture
        ground: {
            color: 0x3d4f3a,       // Dark forest floor
            roughness: 0.9,
            texture: 'forest_floor'
        },
        
        // Canyon walls with strategic positions
        walls: {
            color: 0x5a5045,       // Rocky grey-brown
            roughness: 0.8,
            positions: [
                // North ridge (main native position)
                { x: 0, z: -180, height: 35, width: 300 },
                // South ridge
                { x: 0, z: 180, height: 30, width: 280 },
                // East ridge
                { x: 180, z: 0, height: 32, width: 250 },
                // West ridge
                { x: -180, z: 0, height: 28, width: 250 }
            ]
        },
        
        // Scattered cover elements
        cover: [
            // Trees along ridges
            { type: 'tree_line', x: 0, z: -160, count: 30, spread: 250 },
            { type: 'tree_line', x: 0, z: 160, count: 25, spread: 230 },
            
            // Boulders for cover in basin
            { type: 'boulder', x: -50, z: 20, scale: 3 },
            { type: 'boulder', x: 60, z: -30, scale: 2.5 },
            { type: 'boulder', x: -80, z: -40, scale: 2.8 },
            { type: 'boulder', x: 40, z: 50, scale: 2.2 },
            
            // Brush clusters
            { type: 'brush', x: -30, z: -20, density: 'medium' },
            { type: 'brush', x: 70, z: 30, density: 'high' }
        ],
        
        // American camp in center of basin
        camp: {
            x: 0,
            z: 0,
            radius: 40,
            tents: 20,
            campfires: 5,
            wagons: 8,
            color: 0x8b7355      // Canvas tan
        }
    },
    
    // Weather - Cold, misty dawn
    weather: {
        fog: {
            enabled: true,
            density: 0.015,
            color: 0x9ca7a8
        },
        
        mist: {
            enabled: true,
            height: 10,
            movement: 'slow',
            particles: 500
        },
        
        temperature: 'cold',
        
        // Morning light breaking through
        lighting: {
            ambient: 0x606870,   // Dim morning light
            directional: {
                color: 0xffd4a3,  // Pale morning sun
                intensity: 0.6,
                position: { x: -100, y: 80, z: -100 }
            }
        }
    },
    
    // Player starting position - North ridge overlooking camp
    playerStart: {
        x: -150,
        y: 25,               // On the ridge
        z: -170,
        rotation: Math.PI * 0.3  // Facing toward camp
    },
    
    // Enemy forces - American soldiers
    enemies: [
        // Camp sentries (unprepared)
        {
            type: 'soldier_unprepared',
            position: { x: -35, y: -12, z: -35 },
            patrol: 'sentry',
            awareness: 'low'
        },
        {
            type: 'soldier_unprepared',
            position: { x: 35, y: -12, z: 35 },
            patrol: 'sentry',
            awareness: 'low'
        },
        
        // Main camp soldiers (waking up)
        {
            type: 'soldier_camp',
            position: { x: -20, y: -13, z: 10 },
            state: 'sleeping',
            group: 'infantry_1'
        },
        {
            type: 'soldier_camp',
            position: { x: 15, y: -13, z: -15 },
            state: 'sleeping',
            group: 'infantry_2'
        },
        {
            type: 'soldier_camp',
            position: { x: 0, y: -13, z: 25 },
            state: 'sleeping',
            group: 'infantry_3'
        },
        
        // Officers (react faster)
        {
            type: 'officer',
            position: { x: 0, y: -12, z: 0 },
            name: 'General St. Clair',
            awareness: 'high',
            health: 200
        },
        
        // Artillery positions (vulnerable)
        {
            type: 'artillery_crew',
            position: { x: -40, y: -12, z: 0 },
            weapon: 'cannon',
            count: 3
        },
        {
            type: 'artillery_crew',
            position: { x: 40, y: -12, z: 0 },
            weapon: 'cannon',
            count: 3
        },
        
        // Camp followers (non-combatants)
        {
            type: 'civilian',
            position: { x: -10, y: -13, z: 30 },
            behavior: 'flee',
            count: 5
        }
    ],
    
    // Mission objectives
    objectives: [
        {
            id: 'surprise_attack',
            name: 'Execute Surprise Attack',
            description: 'Strike before the camp can organize a defense',
            type: 'timed',
            timeLimit: 120,        // 2 minutes before camp fully awakens
            reward: 5000,
            required: true
        },
        {
            id: 'capture_artillery',
            name: 'Capture the Artillery',
            description: 'Neutralize both cannon positions',
            type: 'defeat_group',
            targets: ['artillery_crew'],
            reward: 3000,
            required: true
        },
        {
            id: 'tactical_position',
            name: 'Hold the High Ground',
            description: 'Maintain control of the northern ridge',
            type: 'area_control',
            area: { x: 0, z: -170, radius: 50 },
            duration: 60,
            reward: 2000
        },
        {
            id: 'minimize_casualties',
            name: 'Swift Victory',
            description: 'Complete the battle with minimal allied casualties',
            type: 'condition',
            condition: 'low_allied_casualties',
            reward: 4000
        },
        {
            id: 'spare_civilians',
            name: 'Honor in Battle',
            description: 'Do not harm non-combatants',
            type: 'condition',
            condition: 'no_civilian_casualties',
            reward: 2500,
            optional: true
        }
    ],
    
    // Dialogue/Context
    dialogue: [
        {
            trigger: 'level_start',
            speaker: 'Little Turtle',
            text: "The soldiers camp in our hunting grounds, blind to our presence. The ridge gives us advantage - strike swiftly and the battle is won before it begins."
        },
        {
            trigger: 'first_shot',
            speaker: 'Little Turtle',
            text: "Now! Before they can form ranks!"
        },
        {
            trigger: 'objective_complete:surprise_attack',
            speaker: 'Warrior',
            text: "Chaos in their ranks! Press forward!"
        },
        {
            trigger: 'objective_complete:capture_artillery',
            speaker: 'Blue Jacket',
            text: "Their thunder-weapons are ours! Victory is within reach!"
        },
        {
            trigger: 'player_death',
            speaker: 'Little Turtle',
            text: "Fall back to the ridge! Regroup!"
        },
        {
            trigger: 'level_complete',
            speaker: 'Little Turtle',
            text: "A complete victory. They will remember this day - remember what happens when they tread on sacred ground. But more will come..."
        }
    ],
    
    // Gear/Weapons available
    gear: [
        {
            id: 'tomahawk',
            name: 'War Tomahawk',
            damage: 35,
            range: 'melee',
            special: 'fast_strikes',
            equipped: true
        },
        {
            id: 'war_club',
            name: 'War Club',
            damage: 50,
            range: 'melee',
            special: 'heavy_impact'
        },
        {
            id: 'bow',
            name: 'Longbow',
            damage: 40,
            range: 'long',
            ammo: 30,
            special: 'silent'
        },
        {
            id: 'musket_captured',
            name: 'Captured Musket',
            damage: 60,
            range: 'long',
            ammo: 10,
            special: 'loud',
            unlockCondition: 'defeat_soldier'
        }
    ],
    
    // Combat configuration
    combat: {
        goreEnabled: true,
        difficultyMultiplier: 1.5,
        enemyAwareness: 'low',      // Starts low due to surprise
        awarenessIncrease: 'rapid', // Quickly becomes alerted
        
        // Tactical advantages
        heightAdvantage: {
            enabled: true,
            damageBonus: 0.25,      // 25% more damage from high ground
            accuracyBonus: 0.15     // 15% better accuracy
        }
    },
    
    // Music/Audio
    music: {
        intro: 'dawn_silence',
        combat: 'battle_drums',
        victory: 'victory_chant',
        defeat: 'retreat_call'
    },
    
    // Special mechanics
    special: {
        // Surprise mechanic
        surprise: {
            enabled: true,
            duration: 120,          // 2 minutes of surprise advantage
            effects: {
                enemyReactionTime: 3.0,  // Enemies react much slower
                enemyAccuracy: 0.3       // Enemies much less accurate
            }
        },
        
        // Morale system
        morale: {
            enabled: true,
            american: {
                start: 50,          // Low initial morale (surprise attack)
                breakPoint: 20,     // Below this, soldiers flee
                recoveryRate: 5     // Slow recovery
            },
            native: {
                start: 100,         // High morale (tactical advantage)
                breakPoint: 40,
                recoveryRate: 15    // Fast recovery
            }
        }
    },
    
    // Level completion conditions
    completion: {
        primary: [
            'surprise_attack',
            'capture_artillery'
        ],
        optional: [
            'tactical_position',
            'minimize_casualties',
            'spare_civilians'
        ],
        
        // Win conditions
        victory: {
            type: 'any',
            conditions: [
                { type: 'objective_complete', objectives: ['surprise_attack', 'capture_artillery'] },
                { type: 'enemy_morale', threshold: 10 },
                { type: 'enemies_remaining', threshold: 5 }
            ]
        },
        
        // Fail conditions
        defeat: {
            type: 'any',
            conditions: [
                { type: 'player_death' },
                { type: 'time_expired', time: 600 },  // 10 minutes max
                { type: 'morale_broken', faction: 'native' }
            ]
        }
    }
};

export { Level20Config };
