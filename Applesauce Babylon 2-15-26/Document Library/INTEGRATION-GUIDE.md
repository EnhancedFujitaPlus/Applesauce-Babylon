/**
 * WORLD-BUILDING TERRAIN SYSTEM - INTEGRATION GUIDE
 * How to use the enhanced terrain system in your APPLESAUCE game
 */

/*
==============================================
STEP 1: IMPORT THE MODULES
==============================================
*/

import { ApplesauceTerrain } from './applesauce-terrain-worldbuilding.js';
import { 
    level_downtown_neighborhood, 
    level_procedural_city,
    applyAutoGeneration 
} from './level-downtown-neighborhood.js';


/*
==============================================
STEP 2: INITIALIZE TERRAIN IN YOUR ENGINE
==============================================
*/

// In your game engine initialization:
class ApplesauceEngine {
    constructor() {
        // ... your existing code ...
        
        this.terrain = new ApplesauceTerrain(this);
    }
    
    loadLevel(levelConfig) {
        console.log(`Loading level: ${levelConfig.name}`);
        
        // Generate terrain
        this.terrain.generate(levelConfig.terrain);
        
        // Check for auto-generation
        if (levelConfig.autoGenerate) {
            applyAutoGeneration(this.terrain, levelConfig);
        }
        
        // Setup lighting
        if (levelConfig.lighting) {
            this.setupLighting(levelConfig.lighting);
        }
        
        // Setup atmosphere
        if (levelConfig.atmosphere) {
            this.setupAtmosphere(levelConfig.atmosphere);
        }
        
        // Spawn player
        if (levelConfig.spawn) {
            this.spawnPlayer(levelConfig.spawn);
        }
    }
}


/*
==============================================
STEP 3: LOAD A LEVEL
==============================================
*/

// Option A: Load pre-defined level
engine.loadLevel(level_downtown_neighborhood);

// Option B: Load procedural level
engine.loadLevel(level_procedural_city);

// Option C: Create custom level inline
engine.loadLevel({
    id: 'my_custom_level',
    name: 'My Custom Neighborhood',
    
    terrain: {
        mode: 'procedural',
        size: 2000,
        resolution: 100,
        noise: 'gentle',
        color: 0x567D46
    },
    
    zones: [
        {
            id: 'downtown',
            type: 'commercial',
            position: { x: 0, z: 0 },
            size: { width: 300, depth: 300 }
        }
    ],
    
    roads: [
        {
            type: 'street',
            points: [
                { x: -200, z: -500 },
                { x: -200, z: 500 }
            ]
        }
    ],
    
    buildings: [
        {
            type: 'office',
            position: { x: 0, z: 0 },
            size: { width: 20, height: 50, depth: 20 },
            style: 'modern'
        }
    ],
    
    props: [
        { type: 'tree', position: { x: 50, z: 50 }, scale: 1 }
    ]
});


/*
==============================================
STEP 4: ADVANCED USAGE - PROCEDURAL GENERATION
==============================================
*/

// After generating terrain, you can add more content procedurally:

// Add a grid of roads
terrain.autoGenerateRoadGrid({
    bounds: { minX: -500, maxX: 500, minZ: -500, maxZ: 500 },
    spacing: 100,
    roadType: 'street'
});

// Create a zone and auto-populate it with buildings
terrain.generateZones([{
    id: 'new_district',
    type: 'residential',
    position: { x: 300, z: 300 },
    size: { width: 400, depth: 400 }
}]);

terrain.autoPopulateZoneWithBuildings('new_district', {
    spacing: 40,
    chance: 0.7,
    minSize: { width: 8, height: 10, depth: 8 },
    maxSize: { width: 15, height: 25, depth: 15 }
});

// Scatter trees in an area
terrain.autoScatterProps('tree', 50, {
    minX: -200, maxX: 200,
    minZ: -200, maxZ: 200
});


/*
==============================================
COLLISION DETECTION EXAMPLE
==============================================
*/

// Your player/physics system can check collisions with world objects:

function checkBuildingCollisions(playerX, playerZ, playerRadius = 2) {
    for (let building of engine.terrain.buildings) {
        const bx = building.position.x;
        const bz = building.position.z;
        const bw = building.size.width / 2;
        const bd = building.size.depth / 2;
        
        // Simple AABB collision
        if (playerX + playerRadius > bx - bw &&
            playerX - playerRadius < bx + bw &&
            playerZ + playerRadius > bz - bd &&
            playerZ - playerRadius < bz + bd) {
            return true; // Collision!
        }
    }
    return false;
}


/*
==============================================
TIPS FOR EXPANDING THE SYSTEM
==============================================
*/

/*
1. ADD MORE BUILDING TYPES:
   - In createBuildingMesh(), add cases for:
     * Skyscrapers (extra tall with antennas)
     * Churches (with spires)
     * Shops (with awnings)
     * Garages (wide and short)

2. ADD MORE PROP TYPES:
   - Traffic lights
   - Fire hydrants
   - Mailboxes
   - Trash cans
   - Bus stops
   - Billboard signs

3. ENHANCE ROADS:
   - Add sidewalks alongside roads
   - Add crosswalks at intersections
   - Add lane markings
   - Add parking spaces

4. ZONE ENHANCEMENTS:
   - Add fences around properties
   - Add driveways to houses
   - Add parking lots to commercial zones
   - Add loading docks to industrial zones

5. TERRAIN VARIATION:
   - Add water bodies (lakes, rivers)
   - Add bridges over water
   - Add tunnels through hills
   - Add elevation changes (terraced neighborhoods)

6. OPTIMIZATION:
   - Implement LOD (Level of Detail) for distant buildings
   - Use instanced meshes for repeated objects (trees, lights)
   - Implement frustum culling for off-screen objects
   - Use simplified collision meshes

7. INTERACTIVITY:
   - Make building doors that can open
   - Add grind rails on building edges
   - Add ramps and stairs
   - Add destructible props (trash cans, signs)
*/


/*
==============================================
EXAMPLE: CUSTOM BUILDING TYPE
==============================================
*/

// You can extend the system by adding custom building types:

ApplesauceTerrain.prototype.createSkyscraperMesh = function(building, groundHeight) {
    const group = new THREE.Group();
    
    // Main tower
    const towerGeo = new THREE.BoxGeometry(
        building.size.width,
        building.size.height,
        building.size.depth
    );
    const towerMat = new THREE.MeshStandardMaterial({
        color: building.color,
        roughness: 0.3,
        metalness: 0.7
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = building.size.height / 2;
    tower.castShadow = true;
    group.add(tower);
    
    // Antenna on top
    const antennaGeo = new THREE.CylinderGeometry(0.2, 0.2, 10, 8);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.y = building.size.height + 5;
    group.add(antenna);
    
    // Helipad on roof
    const helipadGeo = new THREE.CylinderGeometry(5, 5, 0.5, 32);
    const helipadMat = new THREE.MeshStandardMaterial({ 
        color: 0xFFFF00,
        emissive: 0xFFFF00,
        emissiveIntensity: 0.3
    });
    const helipad = new THREE.Mesh(helipadGeo, helipadMat);
    helipad.position.y = building.size.height;
    group.add(helipad);
    
    group.position.set(building.position.x, groundHeight, building.position.z);
    return group;
};


/*
==============================================
EXAMPLE: CUSTOM PROP TYPE
==============================================
*/

ApplesauceTerrain.prototype.createTrafficLight = function(scale) {
    const light = new THREE.Group();
    
    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.2 * scale, 0.2 * scale, 6 * scale, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2F2F2F });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3 * scale;
    light.add(pole);
    
    // Light box
    const boxGeo = new THREE.BoxGeometry(0.8 * scale, 2 * scale, 0.5 * scale);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = 6 * scale;
    light.add(box);
    
    // Red light
    const redGeo = new THREE.CircleGeometry(0.3 * scale, 16);
    const redMat = new THREE.MeshBasicMaterial({ 
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 0.5
    });
    const redLight = new THREE.Mesh(redGeo, redMat);
    redLight.position.set(0, 6.6 * scale, 0.26 * scale);
    light.add(redLight);
    
    // Yellow light
    const yellowGeo = new THREE.CircleGeometry(0.3 * scale, 16);
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0x444400 });
    const yellowLight = new THREE.Mesh(yellowGeo, yellowMat);
    yellowLight.position.set(0, 6 * scale, 0.26 * scale);
    light.add(yellowLight);
    
    // Green light
    const greenGeo = new THREE.CircleGeometry(0.3 * scale, 16);
    const greenMat = new THREE.MeshBasicMaterial({ color: 0x004400 });
    const greenLight = new THREE.Mesh(greenGeo, greenMat);
    greenLight.position.set(0, 5.4 * scale, 0.26 * scale);
    light.add(greenLight);
    
    return light;
};


/*
==============================================
PERFORMANCE NOTES
==============================================

For large worlds (4000x4000+), consider:

1. Chunk-based loading
   - Only load/render nearby zones
   - Unload distant zones from memory

2. Instanced rendering
   - Use THREE.InstancedMesh for trees, streetlights, etc.
   - Can render 1000s of identical objects efficiently

3. Simplified collision
   - Use simple bounding boxes for buildings
   - Use grid-based spatial partitioning for fast lookups

4. Texture atlases
   - Combine building textures into one atlas
   - Reduces draw calls significantly

5. Shadow optimization
   - Only enable shadows for nearby objects
   - Use lower shadow map resolution for distant lights
*/
