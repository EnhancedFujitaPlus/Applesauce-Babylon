# 🌲 CHUNK-BASED FOLIAGE SYSTEM DOCUMENTATION
## Treaty of the Watchtower Tech | South of South Records

---

## SYSTEM ARCHITECTURE

### Core Concepts

**Chunk System**: World divided into fixed-size chunks (50x50 units). Only chunks near player are loaded.

**Instance Management**: Foliage uses Babylon.js instancing - one base mesh, thousands of GPU-efficient copies.

**Physics Activation Zones**: 
- Render Distance (2 chunks): Foliage visible
- Physics Distance (1 chunk): Physics bodies active
- Beyond: Unloaded/inactive

**Destruction System**: Temporary physics activation on destroyed foliage for realistic falling/explosion effects.

---

## KEY COMPONENTS

### 1. ChunkManager Class

Main orchestrator for all foliage operations:

```javascript
const chunkManager = new ChunkManager(scene, physicsPlugin);
chunkManager.update(playerPosition); // Call every frame
```

**Methods:**
- `generateChunk(x, z, biome)` - Create chunk with procedural foliage
- `activateChunkPhysics(chunk)` - Enable physics bodies
- `deactivateChunkPhysics(chunk)` - Remove physics to save GPU
- `destroyFoliageNear(position, radius)` - Destruction in radius
- `update(playerPosition)` - Main update loop

### 2. Foliage Templates

Base meshes for instancing (created once, reused thousands of times):

- **Grass**: Small cylinders (mass: 0.1kg)
- **Bush**: Flattened spheres (mass: 5kg)
- **Tree**: Cylinder + sphere foliage (mass: 50kg)

Each instance stores metadata:
```javascript
instance.metadata = {
    chunkKey: "x,z",
    type: "grass|bush|tree",
    mass: 5,
    scale: 1.2,
    destroyed: false,
    hasPhysics: false
};
```

### 3. Physics Cache

Map of instances to physics aggregates:
```javascript
this.physicsCache = new Map();
// Stores: instance -> PhysicsAggregate
```

Physics bodies created/destroyed dynamically based on player proximity.

---

## CONFIGURATION

```javascript
const CONFIG = {
    chunkSize: 50,              // Chunk dimensions
    renderDistance: 2,          // Chunks visible (5x5 grid)
    physicsDistance: 1,         // Chunks with physics (3x3 grid)
    foliageDensity: 20,         // Items per chunk
    destructionRadius: 5,       // Range for destruction
    lodDistances: [20, 50, 100] // Future: LOD switching
};
```

**Performance Tuning:**
- Increase `renderDistance` for more visible foliage (GPU cost)
- Decrease `physicsDistance` for better performance (less realistic)
- Adjust `foliageDensity` for sparse/dense worlds
- Modify `chunkSize` for larger/smaller chunks

---

## BIOME SYSTEM

Current implementation uses position-based biomes:

```javascript
// In generateChunk()
let biome = 'grass';
if (Math.abs(x) > 3 || Math.abs(z) > 3) {
    biome = 'forest';
}
```

**Extending Biomes:**

Add to `generateChunk()`:
```javascript
// Mountain biome: more trees, less grass
if (biomeType === 'mountain') {
    const rand = Math.random();
    if (rand < 0.2) type = 'grass';      // 20% grass
    else if (rand < 0.5) type = 'bush';   // 30% bush
    else type = 'tree';                   // 50% trees
}

// Desert biome: cacti, sparse
else if (biomeType === 'desert') {
    CONFIG.foliageDensity = 5; // Sparse
    type = 'cactus'; // Add cactus template
}
```

**Chunk Transition/Segway:**

For smooth transitions (flat -> mountain):
```javascript
// Create transition chunk type
generateTransitionChunk(fromBiome, toBiome, x, z) {
    // Blend foliage types
    const blendRatio = 0.5; // 50/50 mix
    
    for (let i = 0; i < CONFIG.foliageDensity; i++) {
        let type;
        if (Math.random() < blendRatio) {
            type = this.getBiomeFoliage(fromBiome);
        } else {
            type = this.getBiomeFoliage(toBiome);
        }
        // Generate instance...
    }
}
```

---

## DESTRUCTION PHYSICS

### How It Works

1. Player presses E key
2. `destroyFoliageNear()` finds instances in radius
3. For each instance:
   - Mark as destroyed
   - Apply physics impulse (upward + random horizontal)
   - Fade out over 2 seconds
   - Dispose physics body and mesh

### Code Flow

```javascript
destroyFoliage(instance) {
    instance.metadata.destroyed = true;
    
    const aggregate = this.physicsCache.get(instance);
    if (aggregate) {
        // Explosion effect
        const impulse = new BABYLON.Vector3(
            (Math.random() - 0.5) * 100,  // Random X
            Math.random() * 200,           // Up
            (Math.random() - 0.5) * 100   // Random Z
        );
        aggregate.body.applyImpulse(impulse, instance.position);
        
        // Cleanup after 2s
        setTimeout(() => {
            aggregate.dispose();
            instance.dispose();
        }, 2000);
    }
}
```

### Advanced Destruction Ideas

**1. Directional Destruction** (skateboard impact):
```javascript
destroyWithDirection(instance, direction, force) {
    const impulse = direction.scale(force);
    aggregate.body.applyImpulse(impulse, instance.position);
}
```

**2. Chain Reaction** (falling tree destroys nearby):
```javascript
// In render loop, check destroyed foliage collisions
scene.onBeforePhysicsObservable.add(() => {
    // Check physics contacts
    // If destroyed foliage hits live foliage, destroy it
});
```

**3. Particle Effects** (leaves, debris):
```javascript
const particleSystem = new BABYLON.ParticleSystem("particles", 50, scene);
particleSystem.particleTexture = new BABYLON.Texture("leaf.png", scene);
particleSystem.emitter = instance.position;
particleSystem.start();
```

---

## PERFORMANCE OPTIMIZATIONS

### Current Optimizations

1. **Instancing**: All foliage uses instances (GPU efficient)
2. **Zone-based Physics**: Only nearby chunks have physics
3. **Lazy Loading**: Chunks generated on-demand
4. **Aggressive Unloading**: Far chunks removed from memory

### Additional Optimizations

**1. LOD (Level of Detail) System:**

```javascript
updateLOD(instance, distanceToPlayer) {
    if (distanceToPlayer < CONFIG.lodDistances[0]) {
        instance.setEnabled(true);
        instance.renderingGroupId = 0; // Full detail
    } else if (distanceToPlayer < CONFIG.lodDistances[1]) {
        instance.setEnabled(true);
        instance.renderingGroupId = 1; // Medium detail
        // Reduce polygon count
    } else if (distanceToPlayer < CONFIG.lodDistances[2]) {
        instance.setEnabled(true);
        instance.renderingGroupId = 2; // Low detail (billboard)
    } else {
        instance.setEnabled(false); // Culled
    }
}
```

**2. Occlusion Culling:**

```javascript
// Use Babylon's occlusion queries
instance.occlusionQueryAlgorithmType = 
    BABYLON.AbstractMesh.OCCLUSION_ALGORITHM_TYPE_ACCURATE;
instance.occlusionType = 
    BABYLON.AbstractMesh.OCCLUSION_TYPE_OPTIMISTIC;
```

**3. Thin Instances (Ultra-fast):**

```javascript
// For static foliage (no individual physics)
const thinInstanceBuffer = [];
for (let i = 0; i < 1000; i++) {
    const matrix = BABYLON.Matrix.Translation(x, y, z);
    thinInstanceBuffer.push(matrix);
}
grassTemplate.thinInstanceSetBuffer("matrix", 
    Float32Array.from(thinInstanceBuffer));
```

---

## INTEGRATION WITH YOUR APPLESAUCE GAME

### Skateboard Destruction

```javascript
// In your skateboard collision handler:
onSkateboardImpact(impactPoint, velocity) {
    const force = velocity.length();
    
    // Destroy foliage based on speed
    if (force > 10) {
        const radius = Math.min(force / 2, 10);
        chunkManager.destroyFoliageNear(impactPoint, radius);
        
        // Add score for destruction
        player.score += 10;
    }
}
```

### Gore System Integration

```javascript
// Create blood/gore foliage in chunk
createGoreFoliage(position, type) {
    const instance = templates.gore.createInstance("gore");
    instance.position = position;
    instance.metadata = {
        type: 'gore',
        decayTime: Date.now() + 30000, // 30s decay
        mass: 1
    };
    
    // Add to current chunk
    const chunk = worldToChunk(position.x, position.z);
    chunk.foliage.push(instance);
}
```

---

## KNOWN ISSUES & SOLUTIONS

### Issue: Physics bodies "sleep" and don't wake
**Solution**: 
```javascript
aggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
aggregate.body.disablePreStep = false;
```

### Issue: Too many draw calls
**Solution**: Merge nearby foliage into single mesh per chunk
```javascript
const merged = BABYLON.Mesh.MergeMeshes(
    chunk.foliage, 
    true, // dispose source
    true  // allow multi-material
);
```

### Issue: Memory leaks on chunk unload
**Solution**: Dispose everything explicitly
```javascript
chunk.foliage.forEach(instance => {
    instance.dispose();
    instance.material?.dispose();
});
chunk.foliage = [];
```

---

## FUTURE ENHANCEMENTS

1. **Procedural Trees** with branches via L-systems
2. **Wind Animation** using vertex shaders
3. **Seasonal Changes** (color variation by biome time)
4. **Procedural Textures** for variety without memory cost
5. **Audio Zones** (rustling grass, creaking trees)
6. **Wildlife AI** spawned per chunk (birds, insects)
7. **Dynamic Weather** (rain bends grass, wind affects trees)

---

## API REFERENCE

### ChunkManager

```javascript
constructor(scene, physicsPlugin)

generateChunk(chunkX, chunkZ, biomeType)
  Returns: chunk object

getChunkKey(x, z)
  Returns: string "x,z"

worldToChunk(worldX, worldZ)
  Returns: {x, z}

activateChunkPhysics(chunk)
  Enables physics for all foliage in chunk

deactivateChunkPhysics(chunk)
  Disables physics for chunk

update(playerPosition)
  Main loop - call every frame

destroyFoliageNear(position, radius)
  Returns: number of destroyed instances

destroyFoliage(instance)
  Destroys single instance with physics
```

### Instance Metadata

```javascript
instance.metadata = {
    chunkKey: string,
    type: string,
    mass: number,
    scale: number,
    destroyed: boolean,
    hasPhysics: boolean
}
```

---

## CONTACT & CREDITS

**Developer**: Cam @ South of South Records
**Engine**: Babylon.js 7.0+ with Havok Physics
**License**: Use for Treaty projects & label artists
**Support**: Check the docs or hit me up

---

**Remember**: Performance is king. Test on target hardware. Start with low density, increase as needed. GPU can handle millions of instances but physics bodies are expensive. Balance is everything.

🌲 Happy foliage building! 🌲
