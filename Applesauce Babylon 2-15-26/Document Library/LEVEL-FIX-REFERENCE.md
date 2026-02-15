/**
 * LEVEL TERRAIN FIX - QUICK REFERENCE
 * What was wrong and how to fix it
 */

/*
=====================================================
PROBLEM 1: LEVEL 36 - SYNTAX ERROR
=====================================================

ERROR: "Uncaught SyntaxError: Unexpected token 'export'"

CAUSE:
Your level_36.js was using ES6 module syntax:
    export const level_downtown_neighborhood = { ... }

But your game expects the old-school format:
    window.Level36Config = { ... }

FIX:
Changed from:
    export const level_downtown_neighborhood = { ... }
To:
    window.Level36Config = { ... }

This makes it load as a global variable that your game can find!


=====================================================
PROBLEM 2: LEVEL 16 - TERRAIN NOT SHOWING
=====================================================

ERROR: Terrain config exists but nothing appears

CAUSE:
The terrain config was defined correctly, BUT the critical line
to actually GENERATE the terrain was missing in onLevelStart!

Without this line, the terrain data just sits there unused.

FIX:
Added this to onLevelStart():

    if (game.modules.terrain && this.terrain) {
        console.log('🏔️ Generating terrain...');
        
        // THIS IS THE KEY LINE!
        game.modules.terrain.generate(this.terrain);
        
        console.log('✅ Terrain generated!');
    }

This actually calls the terrain system to build the chunks!


=====================================================
KEY LESSON: LEVEL FILE CHECKLIST
=====================================================

For a level to work properly, it needs:

1. ✅ Correct naming format
   window.Level[NUMBER]Config = { ... }
   NOT: export const level_name = { ... }

2. ✅ Meta data
   meta: { name, number, theme, description, difficulty }

3. ✅ Terrain config
   terrain: { segments: [...] }

4. ✅ onLevelStart function that ACTUALLY GENERATES terrain:
   onLevelStart: function(game) {
       // CRITICAL: Generate terrain
       if (game.modules.terrain && this.terrain) {
           game.modules.terrain.generate(this.terrain);
       }
       
       // Then spawn NPCs, enemies, etc.
   }

5. ✅ Final console.log at bottom
   console.log('✅ Level [NUMBER] Config Loaded');


=====================================================
TERRAIN SEGMENT TYPES
=====================================================

Your terrain system supports these segment types:

1. FLAT
   {
       type: 'flat',
       length: 100,     // How long
       height: 0,       // Y position
       width: 200       // How wide
   }

2. HILL (slope up or down)
   {
       type: 'hill',
       length: 200,
       startHeight: 40,  // Starting Y
       endHeight: 0,     // Ending Y
       width: 200
   }

3. MOUNTAIN (peak in middle)
   {
       type: 'mountain',
       length: 180,
       peakHeight: 70,   // How tall the peak
       width: 200
   }

4. VALLEY (dip in middle)
   {
       type: 'valley',
       length: 150,
       depth: -18,       // Negative = below ground
       width: 200
   }


=====================================================
TESTING YOUR LEVELS
=====================================================

When testing a new level:

1. Check browser console for errors
2. Look for these log messages:
   - "✅ Level [NUMBER] Config Loaded" (level file loaded)
   - "🏔️ Generating terrain..." (terrain starting)
   - "✅ Terrain generated!" (terrain finished)
   - "📊 Terrain chunks:" (shows what was created)

3. If you see "❌ Level config not found!"
   → Check the window.Level[NUMBER]Config format
   → Make sure number matches URL (?id=36)

4. If level loads but no terrain:
   → Check onLevelStart has game.modules.terrain.generate()
   → Check terrain config exists
   → Check console for terrain errors


=====================================================
QUICK COPY-PASTE TEMPLATE
=====================================================

Use this as a starting point for new levels:

window.Level[NUMBER]Config = {
    meta: {
        name: "YOUR LEVEL NAME",
        number: [NUMBER],
        theme: "adventure",
        description: "Level description!",
        difficulty: "MEDIUM"
    },
    
    scene: {
        background: 0x87CEEB,
        fog: { color: 0xA0C4E8, near: 100, far: 500 }
    },
    
    playerStart: {
        x: 0,
        z: 10
    },
    
    terrain: {
        segments: [
            {
                type: 'flat',
                length: 500,
                height: 0,
                width: 200
            }
        ]
    },
    
    npcs: [],
    enemies: {},
    
    onLevelStart: function(game) {
        console.log('🎮 YOUR LEVEL NAME');
        
        // GENERATE TERRAIN - CRITICAL!
        if (game.modules.terrain && this.terrain) {
            game.modules.terrain.generate(this.terrain);
            console.log('✅ Terrain generated!');
        }
        
        // Spawn NPCs if you have them
        if (game.modules.dialogue && this.npcs) {
            this.npcs.forEach(npc => {
                game.modules.dialogue.createNPC(npc);
            });
        }
        
        // Spawn enemies if you have them
        if (game.modules.enemies && this.enemies) {
            Object.keys(this.enemies).forEach(groupName => {
                const group = this.enemies[groupName];
                for (let i = 0; i < group.count; i++) {
                    game.modules.enemies.spawnEnemy({
                        position: {
                            x: group.position.x + (i * group.spacing),
                            z: group.position.z
                        },
                        behavior: group.behavior || 'wander'
                    });
                }
            });
        }
        
        console.log('✅ Level ready!');
    },
    
    scoring: {
        baseMultiplier: 1.0
    }
};

console.log('✅ Level [NUMBER] Config Loaded');
*/
