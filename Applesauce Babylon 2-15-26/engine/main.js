/**
 * APPLESAUCE Helmet Combat Integration Guide
 * How to use the new helmet combat system with Babylon.js core
 */

/**
 * STEP 1: Initialize the core engine with Havok
 */
async function initializeGame() {
    // Load Havok first
    const havokScript = document.createElement('script');
    havokScript.src = 'https://cdn.babylonjs.com/havok/HavokPhysics_umd.js';
    document.head.appendChild(havokScript);
    
    await new Promise(resolve => {
        havokScript.onload = resolve;
    });
    
    // Load Babylon.js
    const babylonScript = document.createElement('script');
    babylonScript.src = 'https://cdn.babylonjs.com/babylon.js';
    document.head.appendChild(babylonScript);
    
    await new Promise(resolve => {
        babylonScript.onload = resolve;
    });
    
    console.log('✅ Dependencies loaded');
}

/**
 * STEP 2: Create and setup the game
 */
async function setupGame() {
    // Import core
    const { ApplesauceCore } = await import('./applesauce-core-babylon.js');
    
    // Create core instance
    const core = new ApplesauceCore({
        goreEnabled: true,
        maxSpeed: 50
    });
    
    // Initialize engine and Havok
    await core.init();
    
    // Make core globally accessible (for UI)
    window.applesauceCore = core;
    
    return core;
}

/**
 * STEP 3: Load a level
 */
async function loadLevel(core) {
    // Import level
    const { Level25_HelmetFactory } = await import('./Level_25.js');
    
    // Load into core
    await core.loadLevel(Level25_HelmetFactory);
    
    return Level25_HelmetFactory;
}

/**
 * STEP 4: Start the game
 */
function startGame(core) {
    core.start();
    console.log('🎮 Game started!');
}

/**
 * COMPLETE INITIALIZATION
 */
async function main() {
    try {
        console.log('🚀 Starting APPLESAUCE...');
        
        // Step 1: Load dependencies
        await initializeGame();
        
        // Step 2: Setup core
        const core = await setupGame();
        
        // Step 3: Load level
        await loadLevel(core);
        
        // Step 4: Start
        startGame(core);
        
        console.log('✅ APPLESAUCE ready to play!');
        console.log('----------------------------');
        console.log('CONTROLS:');
        console.log('W/A/S/D or Arrows - Move');
        console.log('SPACE - Jump');
        console.log('J or SPACE - Attack');
        console.log('1-9 - Switch helmets');
        console.log('I or ESC - Inventory');
        console.log('----------------------------');
        
    } catch (error) {
        console.error('❌ Failed to start game:', error);
    }
}

// Auto-start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}

/**
 * ADVANCED USAGE EXAMPLES
 */

// Example: Creating custom helmets
function createCustomHelmet(core) {
    core.helmetSystem.registerHelmet({
        id: 'custom_rainbow',
        name: 'Rainbow Devastator',
        description: 'Unleashes rainbow fury',
        damage: 40,
        range: 4.5,
        knockback: 3.5,
        cooldown: 40,
        element: 'fire', // Use existing element or create new effects
        color: '#FF00FF',
        particleColor: '#00FFFF',
        comboMultiplier: 1.6,
        special: (helmetSystem, results) => {
            // Custom special ability
            console.log('🌈 Rainbow explosion!');
            results.targets.forEach(target => {
                // Apply rainbow effect
                if (target.mesh && target.mesh.material) {
                    target.mesh.material.emissiveColor = new BABYLON.Color3(
                        Math.random(),
                        Math.random(),
                        Math.random()
                    );
                }
            });
        }
    });
}

// Example: Creating custom goon type
function createCustomGoon(core) {
    core.goonsManager.registerGoonType({
        id: 'ninja_goon',
        name: 'Shadow Skater',
        health: 60,
        speed: 12,
        damage: 20,
        attackRange: 3,
        detectionRange: 30,
        aggression: 1.0,
        retreatThreshold: 0.1,
        color: '#000000',
        size: { width: 0.7, height: 1.6, depth: 0.4 }
    });
}

// Example: Triggering custom wave
function spawnCustomWave(core) {
    const playerPos = core.player.collider.position;
    const spawnPos = playerPos.add(new BABYLON.Vector3(20, 0, 0));
    
    // Spawn mixed wave
    core.goonsManager.spawnWave('basic_goon', 3, spawnPos, 8);
    core.goonsManager.spawnWave('fast_goon', 2, spawnPos, 12);
    core.goonsManager.spawnGoon('tank_goon', spawnPos);
}

// Example: Checking combat stats
function getCombatStats(core) {
    const helmetInfo = core.helmetSystem.getCurrentHelmet();
    const comboInfo = core.helmetSystem.getComboInfo();
    const goonStats = core.goonsManager.getStats();
    
    console.log('Current Helmet:', helmetInfo?.name);
    console.log('Combo:', comboInfo.count, 'x', comboInfo.multiplier);
    console.log('Goons:', goonStats.alive, '/', goonStats.total);
    
    return {
        helmet: helmetInfo,
        combo: comboInfo,
        enemies: goonStats
    };
}

// Example: Save/Load helmet loadout
function saveLoadout(core) {
    core.helmetSystem.saveLoadout();
    console.log('💾 Loadout saved to localStorage');
}

function loadLoadout(core) {
    const success = core.helmetSystem.loadLoadout();
    if (success) {
        console.log('📂 Loadout loaded from localStorage');
    } else {
        console.log('❌ No saved loadout found');
    }
}

/**
 * DEBUGGING HELPERS
 */

// Show all registered helmets
function listHelmets(core) {
    const helmets = core.helmetSystem.getAllHelmets();
    console.table(helmets.map(h => ({
        name: h.name,
        damage: h.damage,
        range: h.range,
        element: h.element || 'none'
    })));
}

// Show goon stats
function listGoons(core) {
    const goons = core.goonsManager.getAliveGoons();
    console.table(goons.map(g => ({
        type: g.type.name,
        health: g.health.toFixed(0),
        state: g.state,
        distance: g.position.subtract(core.player.collider.position).length().toFixed(1)
    })));
}

// Export helpers globally for debugging
window.APPLESAUCE_DEBUG = {
    createCustomHelmet,
    createCustomGoon,
    spawnCustomWave,
    getCombatStats,
    saveLoadout,
    loadLoadout,
    listHelmets,
    listGoons
};

console.log('💡 Debug helpers available at window.APPLESAUCE_DEBUG');

/**
 * HTML TEMPLATE
 * 
 * Create an index.html with this structure:
 */

/*
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>APPLESAUCE - Helmet Combat Edition</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background: #000;
            font-family: 'Courier New', monospace;
        }
        
        #renderCanvas {
            width: 100%;
            height: 100%;
            display: block;
            outline: none;
        }
        
        #loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 24px;
            z-index: 9999;
        }
        
        .hidden {
            display: none !important;
        }
    </style>
</head>
<body>
    <div id="loading">Loading APPLESAUCE...</div>
    <canvas id="renderCanvas"></canvas>
    
    <!-- Load in order -->
    <script src="https://cdn.babylonjs.com/babylon.js"></script>
    <script src="https://cdn.babylonjs.com/havok/HavokPhysics_umd.js"></script>
    
    <!-- Your modules -->
    <script type="module" src="./applesauce-core-babylon.js"></script>
    <script type="module" src="./babylon-helmet-system.js"></script>
    <script type="module" src="./babylon-helmet-effects.js"></script>
    <script type="module" src="./babylon-helmet-inventory.js"></script>
    <script type="module" src="./babylon-skater-goons.js"></script>
    <script type="module" src="./level13-helmet-factory.js"></script>
    
    <!-- Main entry point -->
    <script type="module" src="./main.js"></script>
</body>
</html>
*/
