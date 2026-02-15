/**
 * APPLESAUCE Integration Guide
 * How to add GLTF Loader to your existing game
 */

// ============================================
// STEP 1: Update your HTML file
// ============================================

// In index_with_helmet.html, update the import section:

/*
<script type="importmap">
{
    "imports": {
        "three": "./three.module.js",
        "three/addons/": "./three/examples/jsm/"   ← ADD THIS LINE
    }
}
</script>
*/

// Then add the GLTF loader script:
// <script src="applesauce-gltf-loader.js"></script>


// ============================================
// STEP 2: Modify applesauce-core-3.js
// ============================================

/*
At the top of applesauce-core-3.js, add:
*/

import { ApplesauceGLTFLoader } from './applesauce-gltf-loader.js';

/*
In the constructor, after creating the scene, add:
*/

constructor(options = {}) {
    // ... existing code ...
    
    this.scene = new THREE.Scene();
    
    // ADD THIS:
    this.gltfLoader = new ApplesauceGLTFLoader(this);
    
    // ... rest of constructor ...
}

/*
Add these new methods to the ApplesauceCore class:
*/

/**
 * Load a single GLTF model
 */
async loadModel(path, options = {}) {
    try {
        const model = await this.gltfLoader.loadModel(path, options);
        console.log(`✅ Model loaded: ${path}`);
        return model;
    } catch (error) {
        console.error(`❌ Failed to load model: ${path}`, error);
        return null;
    }
}

/**
 * Load an entire level from Blender
 */
async loadBlenderLevel(path) {
    try {
        const levelData = await this.gltfLoader.loadLevel(path);
        
        // Process the level data for game logic
        // (add to physics system, set up skateable surfaces, etc.)
        this.processBlenderLevel(levelData);
        
        return levelData;
    } catch (error) {
        console.error(`❌ Failed to load Blender level: ${path}`, error);
        return null;
    }
}

/**
 * Process loaded Blender level data
 */
processBlenderLevel(levelData) {
    // Add platforms to skateable surfaces
    levelData.platforms.forEach(platform => {
        // Add to your physics/collision system
        console.log(`🛹 Registered platform: ${platform.name}`);
    });
    
    // Add ramps
    levelData.ramps.forEach(ramp => {
        console.log(`📐 Registered ramp: ${ramp.name}`);
    });
    
    // Add rails for grinding
    levelData.rails.forEach(rail => {
        console.log(`🛤️ Registered rail: ${rail.name}`);
    });
    
    // Add collectibles to game state
    levelData.collectibles.forEach(collectible => {
        // Add to collectibles array, set up collision detection
        console.log(`💎 Registered collectible: ${collectible.name}`);
    });
    
    console.log('✅ Blender level processed');
}

/*
Update your loadLevel method to handle Blender scenes:
*/

async loadLevel(levelConfig) {
    console.log(`🎮 Loading level: ${levelConfig.name}`);
    
    // Clear existing level
    this.clearLevel();
    
    // Load skybox
    if (levelConfig.skybox) {
        this.skybox.createProceduralSkybox(levelConfig.skybox.preset || 'day');
    }
    
    // Load custom materials
    if (levelConfig.customMaterials) {
        for (const [name, config] of Object.entries(levelConfig.customMaterials)) {
            this.materials.createTexturedMaterial(name, config.textures, config.properties);
        }
    }
    
    // NEW: Load Blender scene if specified
    if (levelConfig.blenderScene) {
        await this.loadBlenderLevel(levelConfig.blenderScene);
    }
    
    // NEW: Load individual Blender models if specified
    if (levelConfig.models && levelConfig.models.length > 0) {
        for (const modelConfig of levelConfig.models) {
            await this.loadModel(modelConfig.path, {
                position: modelConfig.position,
                rotation: modelConfig.rotation,
                scale: modelConfig.scale
            });
        }
    }
    
    // Load code-based platforms (existing system)
    if (levelConfig.platforms) {
        levelConfig.platforms.forEach(platform => {
            this.createPlatform(platform);
        });
    }
    
    // ... rest of level loading ...
    
    console.log('✅ Level loaded!');
}


// ============================================
// STEP 3: Create an Updated Level Config
// ============================================

// Example: Your Level 16 with Blender wood texture

const Level16_WithBlenderTexture = {
    name: "Wild West - Level 16",
    description: "Now with your wood panel texture from Blender!",
    
    skybox: {
        type: 'procedural',
        preset: 'desert'
    },
    
    // Your wood texture from Blender
    customMaterials: {
        woodPanels: {
            textures: {
                color: './textures/blender/wood_panels.jpg',
                colorOptions: { repeat: { x: 8, y: 8 } }
            },
            properties: {
                roughness: 0.8,
                metalness: 0.0
            }
        }
    },
    
    // Use it on platforms
    platforms: [
        // Main ground with your wood texture
        { 
            position: [0, 0, 0], 
            size: [50, 1, 50], 
            material: 'woodPanels'  // ← Your Blender texture!
        },
        // Train platform
        {
            position: [0, 3, -20],
            size: [30, 1, 10],
            material: 'woodPanels'
        }
    ],
    
    // Optional: Add Blender models if you make any
    models: [
        // Example: If you model a train station in Blender
        // {
        //     path: './models/train_station.glb',
        //     position: [0, 0, -25],
        //     scale: 1
        // }
    ]
};


// ============================================
// STEP 4: Usage Examples in Your HTML
// ============================================

/*
In your main initialization script:
*/

// Load level with Blender assets
const game = new ApplesauceCore(options);

// Option 1: Use updated level config
game.loadLevel(Level16_WithBlenderTexture);

// Option 2: Load Blender model manually during gameplay
game.loadModel('./models/bonus_ramp.glb', {
    position: [20, 0, 0],
    scale: 1.5
});

// Option 3: Load entire level from Blender file
game.loadBlenderLevel('./levels/custom_park.glb');


// ============================================
// STEP 5: File Structure
// ============================================

/*
Organize your project like this:

game/
├── index.html
├── three.module.js
├── three/
│   └── examples/
│       └── jsm/
│           └── loaders/
│               ├── GLTFLoader.js
│               └── DRACOLoader.js
├── engine/
│   ├── applesauce-core-3.js
│   ├── applesauce-materials-v2.js
│   ├── applesauce-skybox.js
│   └── applesauce-gltf-loader.js     ← NEW
├── textures/
│   └── blender/
│       ├── wood_panels.jpg            ← Your texture from Blender
│       ├── wood_panels_normal.jpg
│       └── ...
├── models/                             ← NEW folder for GLB files
│   ├── halfpipe.glb
│   ├── rail.glb
│   └── ...
├── levels/                             ← NEW folder for full level GLBs
│   ├── skatepark_01.glb
│   └── ...
└── levels/
    └── level_16.js

*/


// ============================================
// STEP 6: Test It!
// ============================================

/*
1. Export your wood texture from Blender:
   - Shader Editor → Click Image Texture node
   - Image → Save As → wood_panels.jpg
   - Place in: ./textures/blender/wood_panels.jpg

2. Update level_16.js with the new material config

3. Reload the game

4. Your platform should now have the wood texture!

5. Open console, you should see:
   🎨 Materials loaded
   ✅ Texture loaded: ./textures/blender/wood_panels.jpg
*/


// ============================================
// BONUS: Loading Screen
// ============================================

// Add a loading screen while models load:

async loadLevelWithProgress(levelConfig) {
    // Show loading screen
    const loadingDiv = document.getElementById('loading-screen');
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
    }
    
    // Track progress
    let totalModels = 0;
    let loadedModels = 0;
    
    if (levelConfig.models) {
        totalModels = levelConfig.models.length;
    }
    
    // Load with progress tracking
    if (levelConfig.models) {
        for (const modelConfig of levelConfig.models) {
            await this.loadModel(modelConfig.path, {
                ...modelConfig,
                onProgress: (percent) => {
                    console.log(`Loading ${modelConfig.path}: ${percent}%`);
                    // Update progress bar here
                }
            });
            loadedModels++;
            const totalPercent = (loadedModels / totalModels) * 100;
            console.log(`Overall progress: ${totalPercent.toFixed(0)}%`);
        }
    }
    
    // Hide loading screen
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
    
    console.log('✅ All models loaded!');
}


// ============================================
// COMPLETE EXAMPLE: Updated Index HTML
// ============================================

/*
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>APPLESAUCE - With Blender Support</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
        #loading-screen {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0f0;
            font-family: 'Courier New', monospace;
            font-size: 24px;
            z-index: 9999;
        }
    </style>
</head>
<body>
    <div id="loading-screen">
        🛹 LOADING LEVEL...
    </div>
    
    <script type="importmap">
    {
        "imports": {
            "three": "./three.module.js",
            "three/addons/": "./three/examples/jsm/"
        }
    }
    </script>
    
    <script type="module">
        import * as THREE from 'three';
        window.THREE = THREE;
        
        import { ApplesauceCore } from './engine/applesauce-core-3.js';
        
        // Initialize game
        const game = new ApplesauceCore({
            goreEnabled: true,
            maxSpeed: 1.2
        });
        
        // Load level
        await game.loadLevel(Level16_WithBlenderTexture);
        
        // Hide loading screen
        document.getElementById('loading-screen').style.display = 'none';
        
        // Start
        game.start();
        
        console.log('✅ Game ready!');
    </script>
</body>
</html>
*/


// ============================================
// That's it! You're ready to use Blender content!
// ============================================

console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🛹 APPLESAUCE + Blender Integration Complete!          ║
║                                                           ║
║   You can now:                                            ║
║   ✅ Use Blender textures                                ║
║   ✅ Load Blender models (.glb)                          ║
║   ✅ Import entire levels from Blender                   ║
║   ✅ Mix code-based and Blender content                  ║
║                                                           ║
║   Next Steps:                                             ║
║   1. Export your wood texture                             ║
║   2. Add to level config                                  ║
║   3. Test in game                                         ║
║   4. Start modeling cool stuff in Blender!                ║
╚═══════════════════════════════════════════════════════════╝
`);
