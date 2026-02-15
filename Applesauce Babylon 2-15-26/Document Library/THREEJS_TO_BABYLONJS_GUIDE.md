# THREE.JS → BABYLON.JS MIGRATION GUIDE
## Practical Code Conversion Examples

This guide shows you how to convert your Three.js modules to Babylon.js with real examples.

---

## 🎯 PHILOSOPHY DIFFERENCES

### Three.js: "Build it yourself"
- More manual control
- You assemble pieces
- Flexible but verbose

### Babylon.js: "Batteries included"
- More built-in features
- Opinionated structure
- Easier but less flexible

**Good news:** Most concepts translate directly!

---

## 📦 MODULE STRUCTURE COMPARISON

### Three.js Module Pattern

```javascript
// old-three-system.js
import * as THREE from 'three';

class ThreeSystem {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
    }
    
    create() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(0, 0, 0);
        this.scene.add(mesh);
        
        return mesh;
    }
}

export { ThreeSystem };
```

### Babylon.js Module Pattern

```javascript
// babylon-system.js
export class BabylonSystem {
    constructor(scene) {
        // Babylon scene contains everything!
        this.scene = scene;
    }
    
    create() {
        // MeshBuilder creates geometry + mesh in one step
        const mesh = BABYLON.MeshBuilder.CreateBox(
            "box",                    // Name (required)
            { size: 1 },             // Options
            this.scene               // Scene (auto-adds!)
        );
        
        mesh.position = new BABYLON.Vector3(0, 0, 0);
        
        // Material
        const mat = new BABYLON.StandardMaterial("boxMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(1, 0, 0); // RGB 0-1
        mesh.material = mat;
        
        return mesh;
    }
}
```

**Key Differences:**
1. Babylon scene is all you need (no separate camera/renderer refs)
2. MeshBuilder combines geometry + mesh
3. Meshes auto-add to scene
4. Colors use Color3 (0-1 range) instead of hex

---

## 🎨 BASIC MESH CREATION

### Creating Boxes

```javascript
// THREE.JS
const geometry = new THREE.BoxGeometry(width, height, depth);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const box = new THREE.Mesh(geometry, material);
scene.add(box);

// BABYLON.JS
const box = BABYLON.MeshBuilder.CreateBox(
    "box",
    { width: 1, height: 1, depth: 1 },
    scene
);
const mat = new BABYLON.StandardMaterial("mat", scene);
mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
box.material = mat;
// Auto-added to scene!
```

### Creating Spheres

```javascript
// THREE.JS
const geometry = new THREE.SphereGeometry(radius, 32, 32);
const sphere = new THREE.Mesh(geometry, material);

// BABYLON.JS
const sphere = BABYLON.MeshBuilder.CreateSphere(
    "sphere",
    { diameter: radius * 2, segments: 32 },
    scene
);
```

### Creating Cylinders

```javascript
// THREE.JS
const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32);
const cylinder = new THREE.Mesh(geometry, material);

// BABYLON.JS
const cylinder = BABYLON.MeshBuilder.CreateCylinder(
    "cylinder",
    { diameterTop: radiusTop * 2, diameterBottom: radiusBottom * 2, height: height },
    scene
);
```

### Creating Ground Planes

```javascript
// THREE.JS
const geometry = new THREE.PlaneGeometry(width, height);
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2; // Rotate to be horizontal

// BABYLON.JS
const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: width, height: height },
    scene
);
// Already horizontal!
```

---

## 📐 TRANSFORMS (POSITION, ROTATION, SCALE)

### Position

```javascript
// THREE.JS
mesh.position.set(x, y, z);
mesh.position.x = 5;
mesh.position.copy(otherPosition);

// BABYLON.JS
mesh.position = new BABYLON.Vector3(x, y, z);
mesh.position.x = 5;
mesh.position = otherPosition.clone();
```

### Rotation

```javascript
// THREE.JS
mesh.rotation.set(x, y, z);
mesh.rotation.y = Math.PI / 2;

// BABYLON.JS
mesh.rotation = new BABYLON.Vector3(x, y, z);
mesh.rotation.y = Math.PI / 2;
// Same API!
```

### Scale

```javascript
// THREE.JS
mesh.scale.set(x, y, z);
mesh.scale.multiplyScalar(2); // Double size

// BABYLON.JS
mesh.scaling = new BABYLON.Vector3(x, y, z);
mesh.scaling.scaleInPlace(2); // Double size
```

---

## 🎨 MATERIALS

### Basic Materials

```javascript
// THREE.JS
const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: false,
    transparent: true,
    opacity: 0.5
});

// BABYLON.JS
const material = new BABYLON.StandardMaterial("mat", scene);
material.diffuseColor = new BABYLON.Color3(1, 0, 0);
material.wireframe = false;
material.alpha = 0.5; // 0-1 for transparency
```

### Textured Materials

```javascript
// THREE.JS
const texture = textureLoader.load('texture.png');
const material = new THREE.MeshBasicMaterial({ map: texture });

// BABYLON.JS
const material = new BABYLON.StandardMaterial("mat", scene);
material.diffuseTexture = new BABYLON.Texture("texture.png", scene);
```

### Emissive (Glowing) Materials

```javascript
// THREE.JS
material.emissive = new THREE.Color(0xff0000);
material.emissiveIntensity = 0.5;

// BABYLON.JS
material.emissiveColor = new BABYLON.Color3(1, 0, 0);
// Intensity controlled by color brightness
```

---

## ⚡ PHYSICS COMPARISON

### Cannon.js (Three.js) → Havok (Babylon.js)

#### Creating a Physics Body

```javascript
// THREE.JS + CANNON
const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 5, 0)
});
body.addShape(shape);
world.addBody(body);

// BABYLON.JS + HAVOK
const box = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, scene);
box.position = new BABYLON.Vector3(0, 5, 0);

const aggregate = new BABYLON.PhysicsAggregate(
    box,                              // Mesh
    BABYLON.PhysicsShapeType.BOX,    // Shape type
    { mass: 1, restitution: 0.5 },   // Properties
    scene
);
```

#### Applying Forces

```javascript
// THREE.JS + CANNON
body.applyForce(
    new CANNON.Vec3(0, 100, 0),  // Force vector
    body.position                 // Apply point
);

// BABYLON.JS + HAVOK
aggregate.body.applyForce(
    new BABYLON.Vector3(0, 100, 0),  // Force vector
    box.position                      // Apply point
);
```

#### Applying Impulses (Instant force)

```javascript
// THREE.JS + CANNON
body.applyImpulse(
    new CANNON.Vec3(0, 10, 0),
    body.position
);

// BABYLON.JS + HAVOK
aggregate.body.applyImpulse(
    new BABYLON.Vector3(0, 10, 0),
    box.position
);
```

#### Getting Velocity

```javascript
// THREE.JS + CANNON
const velocity = body.velocity;
const speed = velocity.length();

// BABYLON.JS + HAVOK
const velocity = aggregate.body.getLinearVelocity();
const speed = velocity.length();
```

#### Setting Velocity

```javascript
// THREE.JS + CANNON
body.velocity.set(0, 5, 0);

// BABYLON.JS + HAVOK
aggregate.body.setLinearVelocity(new BABYLON.Vector3(0, 5, 0));
```

#### Static vs Dynamic Bodies

```javascript
// THREE.JS + CANNON
const staticBody = new CANNON.Body({ mass: 0 }); // mass: 0 = static
const dynamicBody = new CANNON.Body({ mass: 1 }); // mass > 0 = dynamic

// BABYLON.JS + HAVOK
const staticAggregate = new BABYLON.PhysicsAggregate(
    mesh,
    BABYLON.PhysicsShapeType.BOX,
    { mass: 0 },  // mass: 0 = static
    scene
);

const dynamicAggregate = new BABYLON.PhysicsAggregate(
    mesh,
    BABYLON.PhysicsShapeType.BOX,
    { mass: 1 },  // mass > 0 = dynamic
    scene
);
```

---

## 📷 CAMERA SYSTEMS

### Basic Camera Setup

```javascript
// THREE.JS
const camera = new THREE.PerspectiveCamera(
    75,                                  // FOV
    window.innerWidth / window.innerHeight,  // Aspect
    0.1,                                 // Near
    1000                                 // Far
);
camera.position.set(0, 5, 10);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// BABYLON.JS
const camera = new BABYLON.UniversalCamera(
    "camera",
    new BABYLON.Vector3(0, 5, 10),
    scene
);
camera.setTarget(new BABYLON.Vector3(0, 0, 0));
scene.activeCamera = camera;
```

### Follow Camera (for player)

```javascript
// THREE.JS (Manual)
function updateCamera() {
    const offset = new THREE.Vector3(0, 5, -10);
    camera.position.copy(player.position).add(offset);
    camera.lookAt(player.position);
}

// BABYLON.JS (Built-in!)
const camera = new BABYLON.FollowCamera(
    "followCam",
    new BABYLON.Vector3(0, 10, -15),
    scene
);
camera.radius = 15;           // Distance from target
camera.heightOffset = 8;      // Height above target
camera.lockedTarget = player;  // Auto-follows!
```

---

## 💡 LIGHTING

### Ambient Light

```javascript
// THREE.JS
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// BABYLON.JS
const ambient = new BABYLON.HemisphericLight(
    "ambient",
    new BABYLON.Vector3(0, 1, 0),  // Direction
    scene
);
ambient.intensity = 0.6;
```

### Directional Light (Sun)

```javascript
// THREE.JS
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(50, 100, 50);
scene.add(sunLight);

// BABYLON.JS
const sun = new BABYLON.DirectionalLight(
    "sun",
    new BABYLON.Vector3(-1, -2, -1),  // Direction
    scene
);
sun.position = new BABYLON.Vector3(50, 100, 50);
sun.intensity = 0.8;
```

### Point Light

```javascript
// THREE.JS
const pointLight = new THREE.PointLight(0xff0000, 1, 100);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

// BABYLON.JS
const point = new BABYLON.PointLight(
    "point",
    new BABYLON.Vector3(0, 5, 0),
    scene
);
point.diffuse = new BABYLON.Color3(1, 0, 0);
point.range = 100;
```

---

## 🌫️ ENVIRONMENT EFFECTS

### Fog

```javascript
// THREE.JS
scene.fog = new THREE.Fog(0xcccccc, 10, 500);

// BABYLON.JS
scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
scene.fogColor = new BABYLON.Color3(0.8, 0.8, 0.8);
scene.fogStart = 10;
scene.fogEnd = 500;
```

### Background Color

```javascript
// THREE.JS
scene.background = new THREE.Color(0x87ceeb);

// BABYLON.JS
scene.clearColor = new BABYLON.Color4(0.53, 0.81, 0.92, 1.0);
// Note: Color4 includes alpha!
```

---

## 🎮 INPUT HANDLING

### Keyboard Input

```javascript
// THREE.JS (Manual)
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// BABYLON.JS (Built-in Observable)
const keys = {};
scene.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            keys[kbInfo.event.key.toLowerCase()] = true;
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            keys[kbInfo.event.key.toLowerCase()] = false;
            break;
    }
});
```

---

## 🔄 ANIMATION LOOP

### Update Loop

```javascript
// THREE.JS
function animate() {
    requestAnimationFrame(animate);
    
    // Update physics
    world.step(1/60);
    
    // Update game logic
    updateGame();
    
    // Render
    renderer.render(scene, camera);
}
animate();

// BABYLON.JS
engine.runRenderLoop(() => {
    // Update game logic
    updateGame();
    
    // Physics updates automatically!
    
    // Render (automatic!)
    scene.render();
});
```

**Key Difference:** Babylon's render loop handles rendering and physics automatically!

---

## 📦 PRACTICAL CONVERSION EXAMPLE

Let's convert a complete Three.js enemy system to Babylon.js:

### Three.js Enemy System

```javascript
// enemy-system-three.js
import * as THREE from 'three';
import * as CANNON from 'cannon';

class EnemySystem {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.enemies = [];
    }
    
    spawnEnemy(position) {
        // Create mesh
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        this.scene.add(mesh);
        
        // Create physics
        const shape = new CANNON.Cylinder(0.5, 0.5, 2, 16);
        const body = new CANNON.Body({ mass: 50 });
        body.addShape(shape);
        body.position.copy(position);
        this.world.addBody(body);
        
        this.enemies.push({ mesh, body, health: 100 });
    }
    
    update() {
        // Sync mesh with physics
        this.enemies.forEach(enemy => {
            enemy.mesh.position.copy(enemy.body.position);
            enemy.mesh.quaternion.copy(enemy.body.quaternion);
        });
    }
}
```

### Babylon.js Enemy System

```javascript
// babylon-enemy-system.js
export class BabylonEnemySystem {
    constructor(scene, havokPlugin) {
        this.scene = scene;
        this.havokPlugin = havokPlugin;
        this.enemies = [];
    }
    
    spawnEnemy(position) {
        // Create mesh
        const mesh = BABYLON.MeshBuilder.CreateCylinder(
            "enemy",
            { diameter: 1, height: 2 },
            this.scene
        );
        mesh.position = position;
        
        // Material
        const mat = new BABYLON.StandardMaterial("enemyMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
        mesh.material = mat;
        
        // Physics (auto-syncs mesh!)
        const aggregate = new BABYLON.PhysicsAggregate(
            mesh,
            BABYLON.PhysicsShapeType.CYLINDER,
            { mass: 50 },
            this.scene
        );
        
        this.enemies.push({
            mesh: mesh,
            aggregate: aggregate,
            health: 100
        });
    }
    
    update() {
        // Physics auto-syncs in Babylon - nothing needed!
        // But you can update AI here
        this.enemies.forEach(enemy => {
            // AI logic goes here
        });
    }
}
```

**What's Better in Babylon:**
1. ✅ No manual mesh/physics syncing needed
2. ✅ Less boilerplate code
3. ✅ MeshBuilder is cleaner
4. ✅ Automatic scene management

---

## 🎯 COMMON PATTERNS

### Pattern: Creating Reusable Prefabs

```javascript
// THREE.JS
class EnemyPrefab {
    create(scene) {
        const group = new THREE.Group();
        
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 2),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.3),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        head.position.y = 1.3;
        
        group.add(body);
        group.add(head);
        
        return group;
    }
}

// BABYLON.JS
class BabylonEnemyPrefab {
    create(scene) {
        // Create parent transform node
        const root = new BABYLON.TransformNode("enemy", scene);
        
        const body = BABYLON.MeshBuilder.CreateCylinder(
            "enemyBody",
            { diameter: 1, height: 2 },
            scene
        );
        body.parent = root;
        
        const head = BABYLON.MeshBuilder.CreateSphere(
            "enemyHead",
            { diameter: 0.6 },
            scene
        );
        head.position.y = 1.3;
        head.parent = root;
        
        // Apply material to both
        const mat = new BABYLON.StandardMaterial("enemyMat", scene);
        mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
        body.material = mat;
        head.material = mat;
        
        return root;
    }
}
```

---

## ✅ MIGRATION CHECKLIST

When converting a module:

- [ ] Change imports from Three to Babylon
- [ ] Replace THREE.Mesh with BABYLON.MeshBuilder
- [ ] Update material creation
- [ ] Convert Cannon physics to Havok PhysicsAggregate
- [ ] Update camera if needed
- [ ] Test physics syncing (should be automatic)
- [ ] Update any manual scene.add() calls (not needed)
- [ ] Convert Vector3 operations
- [ ] Test in browser

---

## 🚀 QUICK REFERENCE

### Most Common Conversions

| Three.js | Babylon.js |
|----------|------------|
| `new THREE.Mesh(geo, mat)` | `BABYLON.MeshBuilder.CreateBox(...)` |
| `scene.add(mesh)` | *Automatic* |
| `new THREE.Vector3(x,y,z)` | `new BABYLON.Vector3(x,y,z)` |
| `mesh.position.set(x,y,z)` | `mesh.position = new BABYLON.Vector3(x,y,z)` |
| `0xff0000` (hex color) | `new BABYLON.Color3(1, 0, 0)` (RGB 0-1) |
| `new CANNON.Body()` | `new BABYLON.PhysicsAggregate()` |
| `renderer.render(scene, cam)` | `scene.render()` |

---

## 💡 PRO TIPS

1. **Start Small** - Convert one simple module first to learn the patterns
2. **Use Console** - Log both Three and Babylon objects to compare
3. **Check Docs** - Babylon docs are excellent: doc.babylonjs.com
4. **Use Playground** - Test snippets at playground.babylonjs.com
5. **Keep Structure** - Your class structure can stay mostly the same!

---

## 🎓 LEARNING PATH

1. Convert a simple module (like spawning a box)
2. Add physics to it
3. Add player interaction
4. Convert a complete system
5. Repeat!

Each module you convert teaches you more patterns. After 2-3 modules, you'll be flying! 🚀

---

Happy converting! Remember: The concepts are the same, just the syntax changes. You got this! 💪
