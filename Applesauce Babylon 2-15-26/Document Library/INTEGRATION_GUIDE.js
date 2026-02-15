/**
 * FIXING THE NULL ERROR & INTEGRATION GUIDE
 * ===========================================
 */

/**
 * THE PROBLEM
 * -----------
 * Error: Cannot read properties of null (reading 'collected')
 * Location: Level_25.js:303:37
 * 
 * This happens when your render loop callback tries to access a property
 * on a crate object that no longer exists (it was disposed/destroyed).
 */

/**
 * QUICK FIX FOR EXISTING CODE
 * ----------------------------
 * If you want to quickly patch your current Level_25.js without 
 * implementing the full system, add null checks:
 */

// ❌ OLD CODE (causes error):
scene.onBeforeRenderObservable.add(() => {
    if (crate.collected) {  // ERROR if crate is null!
        // do something
    }
});

// ✅ FIXED CODE (safe):
const crateObserver = scene.onBeforeRenderObservable.add(() => {
    // Check if crate exists AND is not disposed
    if (!crate || crate.isDisposed()) {
        // Clean up the observer and exit
        scene.onBeforeRenderObservable.remove(crateObserver);
        return;
    }
    
    if (crate.collected) {
        // do something
    }
});

/**
 * FULL INTEGRATION GUIDE
 * -----------------------
 * 
 * STEP 1: Initialize systems at game start
 */

// In your main game file:
import { SaveSystem } from './applesauce-save-system.js';
import { CollectibleManager } from './applesauce-collectible-manager.js';
import { StoreSystem } from './applesauce-store-system.js';

// Initialize once
const saveSystem = new SaveSystem();
const storeSystem = new StoreSystem(saveSystem);

// Pass to your ApplesauceCore
const core = new ApplesauceCore({
    goreEnabled: true,
    maxSpeed: 150
});

// Store references
core.saveSystem = saveSystem;
core.storeSystem = storeSystem;

await core.init();

/**
 * STEP 2: Use CollectibleManager in your levels
 */

export const YourLevel = {
    meta: {
        id: 'your_level_id',  // IMPORTANT: unique ID for save tracking
        name: 'Your Level Name'
    },
    
    async onLevelStart(core) {
        // Create collectible manager for this level
        this.collectibleManager = new CollectibleManager(core, core.saveSystem);
        this.collectibleManager.setLevel(this.meta.id);
        
        // Spawn crates using the manager (no more null errors!)
        this.collectibleManager.createCrate({
            id: 'crate_001',  // Unique ID for this specific crate
            position: new BABYLON.Vector3(10, 1, 10),
            reward: 5,
            type: 'helmet'
        });
        
        // Spawn multiple crates
        this.collectibleManager.createCrateField([
            { id: 'crate_002', position: new BABYLON.Vector3(-10, 1, 10), reward: 5 },
            { id: 'crate_003', position: new BABYLON.Vector3(0, 1, -10), reward: 10 },
            // etc...
        ]);
    },
    
    onLevelComplete(core) {
        // Mark level as completed in save
        core.saveSystem.completeLevel(this.meta.id);
        
        // Clean up collectibles
        this.collectibleManager.clearAll();
    }
};

/**
 * STEP 3: Add currency display to your HUD
 */

function createHUD(core) {
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    
    // Helmet counter
    const helmetCounter = new BABYLON.GUI.TextBlock();
    helmetCounter.text = `🪖 ${core.saveSystem.getHelmets()}`;
    helmetCounter.color = "gold";
    helmetCounter.fontSize = 24;
    helmetCounter.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    helmetCounter.top = "20px";
    helmetCounter.left = "-20px";
    advancedTexture.addControl(helmetCounter);
    
    // Listen for collectible events
    window.addEventListener('collectible-collected', (event) => {
        helmetCounter.text = `🪖 ${event.detail.total}`;
    });
    
    return advancedTexture;
}

/**
 * STEP 4: Add stores to levels
 */

function addStoreToLevel(core, position) {
    const store = core.storeSystem.createStoreNPC(
        core.scene,
        position,
        'general'
    );
    
    store.onEnter((storeInstance) => {
        openStoreMenu(storeInstance);
    });
    
    return store;
}

/**
 * STEP 5: Create main menu skater editor
 */

import { SkaterEditor } from './example-level-25.js';

const editor = new SkaterEditor(saveSystem, storeSystem);

// Generate UI
document.getElementById('editor-container').innerHTML = editor.generateUI();

// Make editor globally accessible for button clicks
window.editor = editor;

/**
 * STEP 6: Handle level transitions with save persistence
 */

async function loadLevel(levelConfig, core) {
    // Save progress before switching
    core.saveSystem.save();
    
    // Load new level
    await core.loadLevel(levelConfig);
    
    // Collectibles already collected won't spawn (handled by CollectibleManager)
}

/**
 * BENEFITS OF THIS SYSTEM
 * ------------------------
 * 
 * ✅ No more null reference errors
 * ✅ Persistent currency across sessions
 * ✅ Track what's collected per-level
 * ✅ Unlock system for progression
 * ✅ In-level stores
 * ✅ Main menu customization
 * ✅ Stats tracking (kills, tricks, etc.)
 * ✅ Save/load with localStorage
 * ✅ Import/export saves
 * 
 * ADDITIONAL FEATURES YOU CAN ADD
 * --------------------------------
 * 
 * 1. Daily rewards:
 *    - Check timestamps.lastPlayed
 *    - Give bonus helmets for daily login
 * 
 * 2. Achievements:
 *    - Add achievements object to save data
 *    - Check stats against achievement requirements
 * 
 * 3. Leaderboards:
 *    - Export save data
 *    - Send to server for leaderboard
 * 
 * 4. Seasons/events:
 *    - Add seasonal items to store catalog
 *    - Check current date against event dates
 * 
 * 5. Prestige system:
 *    - Reset stats but keep currency multiplier
 *    - Add prestige level to save data
 */

/**
 * DEBUGGING TIPS
 * --------------
 */

// Check current save state
console.log('Current save:', saveSystem.data);

// Check helmet count
console.log('Helmets:', saveSystem.getHelmets());

// Check level progress
console.log('Level progress:', saveSystem.data.levelProgress);

// Check unlocks
console.log('Unlocked items:', saveSystem.data.unlocks);

// Reset save (for testing)
// saveSystem.reset();

// Manually add helmets (for testing)
// saveSystem.addHelmets(1000);

/**
 * SAVE DATA STRUCTURE REFERENCE
 * ------------------------------
 */
const saveDataExample = {
    version: '1.0.0',
    
    currency: {
        helmets: 150,        // Main currency
        skulls: 10,          // Secondary currency
        bloodPoints: 500     // XP points
    },
    
    stats: {
        totalDistance: 5000,
        totalTricks: 200,
        totalKills: 50,
        totalDeaths: 5,
        totalPlayTime: 3600,
        highestCombo: 85,
        levelsCompleted: ['tutorial', 'level_1', 'level_2']
    },
    
    unlocks: {
        decks: ['default', 'skull_deck'],
        helmets: ['default', 'knight_helmet'],
        wheels: ['default'],
        outfits: ['default']
    },
    
    levelProgress: {
        'level_1': {
            helmetsCollected: ['crate_001', 'crate_002'],
            cratesOpened: ['crate_001', 'crate_002', 'crate_003']
        }
    },
    
    equipped: {
        deck: 'skull_deck',
        helmet: 'knight_helmet',
        wheels: 'default',
        outfit: 'default'
    },
    
    settings: {
        goreEnabled: true,
        volume: 0.7,
        difficulty: 'normal'
    },
    
    timestamps: {
        created: 1707494400000,
        lastPlayed: 1707580800000
    }
};
