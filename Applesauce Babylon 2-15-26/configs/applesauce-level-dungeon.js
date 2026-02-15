/**
 * APPLESAUCE Level: Castle Dungeon
 * ═══════════════════════════════════════════════════════════════
 * 
 * ARCHITECTURE PATTERN — LEVEL AS MODULE
 * ───────────────────────────────────────
 * This file is SELF-CONTAINED. It doesn't modify the core engine.
 * It plugs in via the levelConfig hooks that ApplesauceCore.loadLevel() expects:
 * 
 *   - meta:          { name, description, author }
 *   - terrain:        terrain config (passed to BabylonTerrain)
 *   - playerStart:    { x, y, z }
 *   - onLevelStart:   async (engine) => { ... }   ← build the dungeon here
 *   - onUpdate:       (engine) => { ... }          ← per-frame logic here
 * 
 * The core engine handles: canvas, render loop, physics, input, camera.
 * This level handles: dungeon geometry, procedural textures, lighting, light shafts.
 * 
 * If another level needs a skatepark, it brings its OWN onLevelStart that builds
 * ramps and rails — no dungeon code polluting that level, no skatepark code here.
 * 
 * FEATURES:
 *   ▪ Procedural stone/brick textures (DynamicTexture — no external images)
 *   ▪ Modular room + corridor generation
 *   ▪ Windows looking out at terrain with volumetric light shafts
 *   ▪ Torch lighting with flicker animation
 *   ▪ Fog and atmospheric post-processing
 * 
 * USAGE:
 *   import { DungeonLevel } from './applesauce-level-dungeon.js';
 *   const level = DungeonLevel.create({ rooms: 5, corridorLength: 20 });
 *   await engine.loadLevel(level);
 * 
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────
// PROCEDURAL TEXTURE GENERATORS
// ─────────────────────────────────────────────
// These create textures entirely from code — no image files needed.
// Each returns a BABYLON.DynamicTexture painted via 2D canvas context.

const ProceduralTextures = {

    /**
     * Stone wall texture — irregular blocks with mortar lines
     */
    stoneWall(scene, size = 512) {
        const tex = new BABYLON.DynamicTexture("stoneTex", size, scene, true);
        const ctx = tex.getContext();

        // Base stone color
        ctx.fillStyle = '#3a3632';
        ctx.fillRect(0, 0, size, size);

        // Draw irregular stone blocks
        const blockRows = 8;
        const blockCols = 4;
        const bw = size / blockCols;
        const bh = size / blockRows;
        const mortarWidth = 3;

        for (let row = 0; row < blockRows; row++) {
            const offset = (row % 2) * (bw * 0.5); // Staggered rows
            for (let col = -1; col <= blockCols; col++) {
                const x = col * bw + offset + (Math.random() - 0.5) * 4;
                const y = row * bh + (Math.random() - 0.5) * 3;
                const w = bw - mortarWidth + (Math.random() - 0.5) * 6;
                const h = bh - mortarWidth + (Math.random() - 0.5) * 4;

                // Stone face — varied grey-brown
                const shade = 0.22 + Math.random() * 0.15;
                const warm = Math.random() * 0.03;
                ctx.fillStyle = `rgb(${Math.floor((shade + warm) * 255)}, ${Math.floor(shade * 255)}, ${Math.floor((shade - 0.02) * 255)})`;
                ctx.fillRect(x + mortarWidth, y + mortarWidth, w, h);

                // Surface noise — speckles for rough stone look
                for (let i = 0; i < 30; i++) {
                    const sx = x + mortarWidth + Math.random() * w;
                    const sy = y + mortarWidth + Math.random() * h;
                    const brightness = Math.random() * 0.08;
                    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 255 : 0}, ${brightness})`;
                    ctx.fillRect(sx, sy, 1 + Math.random() * 3, 1 + Math.random() * 3);
                }
            }
        }

        // Mortar lines — dark gaps between stones
        ctx.strokeStyle = '#1a1816';
        ctx.lineWidth = mortarWidth;
        for (let row = 1; row < blockRows; row++) {
            ctx.beginPath();
            ctx.moveTo(0, row * bh + (Math.random() - 0.5) * 2);
            ctx.lineTo(size, row * bh + (Math.random() - 0.5) * 2);
            ctx.stroke();
        }

        tex.update();
        return tex;
    },

    /**
     * Floor stone texture — larger, flatter slabs
     */
    stoneFloor(scene, size = 512) {
        const tex = new BABYLON.DynamicTexture("floorTex", size, scene, true);
        const ctx = tex.getContext();

        ctx.fillStyle = '#2d2a28';
        ctx.fillRect(0, 0, size, size);

        const slabSize = size / 4;
        const gap = 4;

        for (let row = 0; row < 4; row++) {
            const offset = (row % 2) * (slabSize * 0.5);
            for (let col = -1; col <= 4; col++) {
                const x = col * slabSize + offset;
                const y = row * slabSize;

                const shade = 0.18 + Math.random() * 0.1;
                ctx.fillStyle = `rgb(${Math.floor(shade * 255)}, ${Math.floor((shade - 0.01) * 255)}, ${Math.floor((shade - 0.02) * 255)})`;
                ctx.fillRect(x + gap, y + gap, slabSize - gap * 2, slabSize - gap * 2);

                // Wear marks
                for (let i = 0; i < 15; i++) {
                    ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.12})`;
                    const wx = x + gap + Math.random() * (slabSize - gap * 2);
                    const wy = y + gap + Math.random() * (slabSize - gap * 2);
                    ctx.fillRect(wx, wy, Math.random() * 8, Math.random() * 8);
                }
            }
        }

        // Mortar/gap lines
        ctx.strokeStyle = '#100e0d';
        ctx.lineWidth = gap;
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * slabSize);
            ctx.lineTo(size, i * slabSize);
            ctx.stroke();
        }

        tex.update();
        return tex;
    },

    /**
     * Ceiling texture — dark rough stone with moisture stains
     */
    ceiling(scene, size = 512) {
        const tex = new BABYLON.DynamicTexture("ceilTex", size, scene, true);
        const ctx = tex.getContext();

        ctx.fillStyle = '#1a1917';
        ctx.fillRect(0, 0, size, size);

        // Rough patches
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const s = 2 + Math.random() * 12;
            const shade = Math.random() * 0.06;
            ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 200 : 50}, ${Math.random() > 0.5 ? 180 : 40}, ${Math.random() > 0.5 ? 160 : 30}, ${shade})`;
            ctx.fillRect(x, y, s, s);
        }

        // Moisture stain blotches
        for (let i = 0; i < 8; i++) {
            const cx = Math.random() * size;
            const cy = Math.random() * size;
            const r = 20 + Math.random() * 60;
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            gradient.addColorStop(0, 'rgba(30, 50, 35, 0.15)');
            gradient.addColorStop(1, 'rgba(30, 50, 35, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        }

        tex.update();
        return tex;
    },

    /**
     * Wood texture — for doors, barrels, beams
     */
    wood(scene, size = 256) {
        const tex = new BABYLON.DynamicTexture("woodTex", size, scene, true);
        const ctx = tex.getContext();

        ctx.fillStyle = '#4a3525';
        ctx.fillRect(0, 0, size, size);

        // Wood grain lines
        for (let i = 0; i < 40; i++) {
            const y = Math.random() * size;
            ctx.strokeStyle = `rgba(${60 + Math.random() * 30}, ${40 + Math.random() * 20}, ${20 + Math.random() * 15}, ${0.2 + Math.random() * 0.3})`;
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(0, y);
            // Wavy grain
            for (let x = 0; x < size; x += 10) {
                ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 3);
            }
            ctx.stroke();
        }

        tex.update();
        return tex;
    }
};


// ─────────────────────────────────────────────
// DUNGEON GEOMETRY BUILDER
// ─────────────────────────────────────────────
// Constructs rooms, corridors, walls, windows, etc.
// All geometry is added to the scene and tracked for cleanup.

class DungeonBuilder {
    constructor(scene, havokPlugin, shadowGenerator) {
        this.scene = scene;
        this.havokPlugin = havokPlugin;
        this.shadowGenerator = shadowGenerator;
        this.meshes = [];       // Track all created meshes for cleanup
        this.lights = [];       // Track all dungeon lights
        this.torchAnims = [];   // Track torch flicker animations
        this.windows = [];      // Track window openings (for light shaft placement)

        // Generate textures once, reuse everywhere
        this.textures = {
            wall: ProceduralTextures.stoneWall(scene),
            floor: ProceduralTextures.stoneFloor(scene),
            ceiling: ProceduralTextures.ceiling(scene),
            wood: ProceduralTextures.wood(scene)
        };

        // Create shared materials
        this.materials = this._createMaterials();
    }

    _createMaterials() {
        const s = this.scene;

        const wallMat = new BABYLON.StandardMaterial("dungeonWall", s);
        wallMat.diffuseTexture = this.textures.wall;
        wallMat.diffuseTexture.uScale = 2;
        wallMat.diffuseTexture.vScale = 2;
        wallMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        wallMat.roughness = 0.95;

        const floorMat = new BABYLON.StandardMaterial("dungeonFloor", s);
        floorMat.diffuseTexture = this.textures.floor;
        floorMat.diffuseTexture.uScale = 3;
        floorMat.diffuseTexture.vScale = 3;
        floorMat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);

        const ceilMat = new BABYLON.StandardMaterial("dungeonCeil", s);
        ceilMat.diffuseTexture = this.textures.ceiling;
        ceilMat.diffuseTexture.uScale = 2;
        ceilMat.diffuseTexture.vScale = 2;
        ceilMat.specularColor = new BABYLON.Color3(0.02, 0.02, 0.02);

        const woodMat = new BABYLON.StandardMaterial("dungeonWood", s);
        woodMat.diffuseTexture = this.textures.wood;
        woodMat.specularColor = new BABYLON.Color3(0.1, 0.08, 0.06);

        return { wall: wallMat, floor: floorMat, ceiling: ceilMat, wood: woodMat };
    }

    // ── Room Construction ──────────────────────

    /**
     * Build a rectangular room with floor, ceiling, and 4 walls.
     * Walls can have window cutouts.
     * 
     * @param {Object} config
     * @param {number} config.width     - Room width (X axis)
     * @param {number} config.depth     - Room depth (Z axis)
     * @param {number} config.height    - Wall height (Y axis)
     * @param {Object} config.position  - { x, y, z } center of room floor
     * @param {Array}  config.windows   - [{ wall: 'north'|'south'|'east'|'west', position: 0-1, width: n, height: n }]
     * @param {Array}  config.torches   - [{ wall: 'north'|..., position: 0-1, height: n }]
     * @param {Array}  config.openings  - [{ wall: 'north'|..., position: 0-1, width: n, height: n }] for doorways
     */
    buildRoom(config) {
        const { width, depth, height, position } = config;
        const pos = position || { x: 0, y: 0, z: 0 };
        const wallThickness = 0.8;
        const roomMeshes = [];

        // ── Floor ──
        const floor = BABYLON.MeshBuilder.CreateBox("floor", {
            width: width, height: wallThickness, depth: depth
        }, this.scene);
        floor.position = new BABYLON.Vector3(pos.x, pos.y - wallThickness / 2, pos.z);
        floor.material = this.materials.floor;
        floor.receiveShadow = true;
        this._addPhysics(floor, 0);
        roomMeshes.push(floor);

        // ── Ceiling ──
        const ceil = BABYLON.MeshBuilder.CreateBox("ceiling", {
            width: width, height: wallThickness, depth: depth
        }, this.scene);
        ceil.position = new BABYLON.Vector3(pos.x, pos.y + height + wallThickness / 2, pos.z);
        ceil.material = this.materials.ceiling;
        ceil.receiveShadow = true;
        this._addPhysics(ceil, 0);
        roomMeshes.push(ceil);

        // ── Walls ──
        const walls = [
            { name: 'north', w: width, h: height, d: wallThickness, 
              px: pos.x, py: pos.y + height / 2, pz: pos.z - depth / 2 - wallThickness / 2, 
              normalDir: new BABYLON.Vector3(0, 0, 1) },
            { name: 'south', w: width, h: height, d: wallThickness, 
              px: pos.x, py: pos.y + height / 2, pz: pos.z + depth / 2 + wallThickness / 2,
              normalDir: new BABYLON.Vector3(0, 0, -1) },
            { name: 'east',  w: wallThickness, h: height, d: depth, 
              px: pos.x + width / 2 + wallThickness / 2, py: pos.y + height / 2, pz: pos.z,
              normalDir: new BABYLON.Vector3(-1, 0, 0) },
            { name: 'west',  w: wallThickness, h: height, d: depth, 
              px: pos.x - width / 2 - wallThickness / 2, py: pos.y + height / 2, pz: pos.z,
              normalDir: new BABYLON.Vector3(1, 0, 0) }
        ];

        walls.forEach(wallDef => {
            // Check for openings on this wall (doorways)
            const wallOpenings = (config.openings || []).filter(o => o.wall === wallDef.name);
            // Check for windows on this wall
            const wallWindows = (config.windows || []).filter(w => w.wall === wallDef.name);

            if (wallOpenings.length === 0 && wallWindows.length === 0) {
                // Solid wall — simple box
                const wall = BABYLON.MeshBuilder.CreateBox(`wall_${wallDef.name}`, {
                    width: wallDef.w, height: wallDef.h, depth: wallDef.d
                }, this.scene);
                wall.position = new BABYLON.Vector3(wallDef.px, wallDef.py, wallDef.pz);
                wall.material = this.materials.wall;
                wall.receiveShadow = true;
                wall.castShadow = true;
                if (this.shadowGenerator) this.shadowGenerator.addShadowCaster(wall);
                this._addPhysics(wall, 0);
                roomMeshes.push(wall);
            } else {
                // Wall with holes — build as segments around the openings
                // For simplicity, we build the wall with a window/door hole using CSG-like approach
                // (multiple box segments around the opening)
                this._buildWallWithOpenings(wallDef, wallOpenings, wallWindows, pos, height, roomMeshes);
            }

            // Place torches on this wall
            const wallTorches = (config.torches || []).filter(t => t.wall === wallDef.name);
            wallTorches.forEach(torchConfig => {
                this._placeTorch(wallDef, torchConfig, pos, width, depth, height);
            });
        });

        this.meshes.push(...roomMeshes);
        return roomMeshes;
    }

    /**
     * Build a wall with window/door openings by constructing segments around holes
     */
    _buildWallWithOpenings(wallDef, openings, windows, roomPos, roomHeight, meshList) {
        const allHoles = [
            ...openings.map(o => ({ ...o, isWindow: false })),
            ...windows.map(w => ({ ...w, isWindow: true }))
        ];

        // Determine wall's primary axis
        const isXWall = wallDef.name === 'north' || wallDef.name === 'south';
        const wallLength = isXWall ? wallDef.w : wallDef.d;

        // Sort holes by position along wall
        allHoles.sort((a, b) => (a.position || 0.5) - (b.position || 0.5));

        allHoles.forEach(hole => {
            const holeWidth = hole.width || 2;
            const holeHeight = hole.height || (hole.isWindow ? 1.5 : roomHeight * 0.8);
            const holeBottom = hole.isWindow ? (roomHeight * 0.5) : 0; // Windows at mid-height, doors at floor
            const holePosAlongWall = (hole.position || 0.5) * wallLength - wallLength / 2;

            // We build 4 segments: left, right, above, below the hole
            const segments = [];

            // Left segment
            const leftWidth = (wallLength / 2 + holePosAlongWall - holeWidth / 2);
            if (leftWidth > 0.1) {
                segments.push({
                    w: isXWall ? leftWidth : wallDef.w,
                    h: wallDef.h,
                    d: isXWall ? wallDef.d : leftWidth,
                    offsetMain: -wallLength / 2 + leftWidth / 2,
                    offsetY: 0
                });
            }

            // Right segment
            const rightStart = holePosAlongWall + holeWidth / 2;
            const rightWidth = wallLength / 2 - rightStart;
            if (rightWidth > 0.1) {
                segments.push({
                    w: isXWall ? rightWidth : wallDef.w,
                    h: wallDef.h,
                    d: isXWall ? wallDef.d : rightWidth,
                    offsetMain: rightStart + rightWidth / 2,
                    offsetY: 0
                });
            }

            // Above hole (lintel)
            const aboveHeight = roomHeight - (holeBottom + holeHeight);
            if (aboveHeight > 0.1) {
                segments.push({
                    w: isXWall ? holeWidth : wallDef.w,
                    h: aboveHeight,
                    d: isXWall ? wallDef.d : holeWidth,
                    offsetMain: holePosAlongWall,
                    offsetY: (holeBottom + holeHeight + aboveHeight / 2) - roomHeight / 2
                });
            }

            // Below hole (sill) — only for windows
            if (holeBottom > 0.1) {
                segments.push({
                    w: isXWall ? holeWidth : wallDef.w,
                    h: holeBottom,
                    d: isXWall ? wallDef.d : holeWidth,
                    offsetMain: holePosAlongWall,
                    offsetY: (holeBottom / 2) - roomHeight / 2
                });
            }

            segments.forEach((seg, i) => {
                const mesh = BABYLON.MeshBuilder.CreateBox(`wall_${wallDef.name}_seg${i}`, {
                    width: seg.w, height: seg.h, depth: seg.d
                }, this.scene);

                // Position: wall base position + offsets
                let px = wallDef.px;
                let pz = wallDef.pz;
                if (isXWall) {
                    px += seg.offsetMain;
                } else {
                    pz += seg.offsetMain;
                }

                mesh.position = new BABYLON.Vector3(px, wallDef.py + seg.offsetY, pz);
                mesh.material = this.materials.wall;
                mesh.receiveShadow = true;
                mesh.castShadow = true;
                if (this.shadowGenerator) this.shadowGenerator.addShadowCaster(mesh);
                this._addPhysics(mesh, 0);
                meshList.push(mesh);
            });

            // Track window for light shaft placement
            if (hole.isWindow) {
                const windowCenter = new BABYLON.Vector3(
                    wallDef.px + (isXWall ? holePosAlongWall : 0),
                    wallDef.py + holeBottom + holeHeight / 2 - roomHeight / 2,
                    wallDef.pz + (isXWall ? 0 : holePosAlongWall)
                );
                this.windows.push({
                    position: windowCenter,
                    normal: wallDef.normalDir,
                    width: holeWidth,
                    height: holeHeight
                });
            }
        });
    }

    // ── Corridor Construction ──────────────────

    /**
     * Build a corridor connecting two points
     */
    buildCorridor(config) {
        const { start, end, width, height } = config;
        const corridorWidth = width || 4;
        const corridorHeight = height || 4;
        const wallThickness = 0.8;

        // Calculate corridor direction and length
        const dx = end.x - start.x;
        const dz = end.z - start.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);

        const centerX = (start.x + end.x) / 2;
        const centerZ = (start.z + end.z) / 2;
        const baseY = start.y || 0;

        // Floor
        const floor = BABYLON.MeshBuilder.CreateBox("corridor_floor", {
            width: corridorWidth, height: wallThickness, depth: length
        }, this.scene);
        floor.position = new BABYLON.Vector3(centerX, baseY - wallThickness / 2, centerZ);
        floor.rotation.y = angle;
        floor.material = this.materials.floor;
        floor.receiveShadow = true;
        this._addPhysics(floor, 0);
        this.meshes.push(floor);

        // Ceiling
        const ceil = BABYLON.MeshBuilder.CreateBox("corridor_ceil", {
            width: corridorWidth, height: wallThickness, depth: length
        }, this.scene);
        ceil.position = new BABYLON.Vector3(centerX, baseY + corridorHeight + wallThickness / 2, centerZ);
        ceil.rotation.y = angle;
        ceil.material = this.materials.ceiling;
        this._addPhysics(ceil, 0);
        this.meshes.push(ceil);

        // Left wall
        const leftWall = BABYLON.MeshBuilder.CreateBox("corridor_left", {
            width: wallThickness, height: corridorHeight, depth: length
        }, this.scene);
        // Offset perpendicular to corridor direction
        const perpX = Math.cos(angle) * (corridorWidth / 2 + wallThickness / 2);
        const perpZ = -Math.sin(angle) * (corridorWidth / 2 + wallThickness / 2);
        leftWall.position = new BABYLON.Vector3(centerX + perpX, baseY + corridorHeight / 2, centerZ + perpZ);
        leftWall.rotation.y = angle;
        leftWall.material = this.materials.wall;
        leftWall.receiveShadow = true;
        leftWall.castShadow = true;
        if (this.shadowGenerator) this.shadowGenerator.addShadowCaster(leftWall);
        this._addPhysics(leftWall, 0);
        this.meshes.push(leftWall);

        // Right wall
        const rightWall = BABYLON.MeshBuilder.CreateBox("corridor_right", {
            width: wallThickness, height: corridorHeight, depth: length
        }, this.scene);
        rightWall.position = new BABYLON.Vector3(centerX - perpX, baseY + corridorHeight / 2, centerZ - perpZ);
        rightWall.rotation.y = angle;
        rightWall.material = this.materials.wall;
        rightWall.receiveShadow = true;
        rightWall.castShadow = true;
        if (this.shadowGenerator) this.shadowGenerator.addShadowCaster(rightWall);
        this._addPhysics(rightWall, 0);
        this.meshes.push(rightWall);

        return { floor, ceil, leftWall, rightWall };
    }

    // ── Torch Placement & Lighting ─────────────

    /**
     * Place a torch on a wall with flickering point light
     */
    _placeTorch(wallDef, torchConfig, roomPos, roomWidth, roomDepth, roomHeight) {
        const isXWall = wallDef.name === 'north' || wallDef.name === 'south';
        const wallLength = isXWall ? roomWidth : roomDepth;
        const posAlongWall = (torchConfig.position || 0.5) * wallLength - wallLength / 2;
        const torchHeight = torchConfig.height || (roomHeight * 0.65);

        // Calculate torch world position (slightly offset from wall toward room interior)
        let tx = wallDef.px;
        let tz = wallDef.pz;
        const inset = 0.3;

        if (isXWall) {
            tx += posAlongWall;
            tz += wallDef.normalDir.z * inset;
        } else {
            tz += posAlongWall;
            tx += wallDef.normalDir.x * inset;
        }
        const ty = roomPos.y + torchHeight;

        // Torch bracket mesh (small cylinder)
        const bracket = BABYLON.MeshBuilder.CreateCylinder("torch_bracket", {
            height: 0.4, diameter: 0.1, tessellation: 8
        }, this.scene);
        bracket.position = new BABYLON.Vector3(tx, ty - 0.15, tz);
        bracket.material = this.materials.wood;
        this.meshes.push(bracket);

        // Torch head (small box for the flame holder)
        const head = BABYLON.MeshBuilder.CreateBox("torch_head", {
            width: 0.15, height: 0.2, depth: 0.15
        }, this.scene);
        head.position = new BABYLON.Vector3(tx, ty + 0.1, tz);
        head.material = this.materials.wood;
        this.meshes.push(head);

        // Point light — warm flickering fire
        const light = new BABYLON.PointLight(
            `torchLight_${wallDef.name}_${torchConfig.position}`,
            new BABYLON.Vector3(tx, ty + 0.3, tz),
            this.scene
        );
        light.diffuse = new BABYLON.Color3(1.0, 0.65, 0.3);
        light.specular = new BABYLON.Color3(0.5, 0.3, 0.1);
        light.intensity = 0.8;
        light.range = 15;

        // Store base intensity for flicker animation
        light._baseIntensity = 0.8;
        light._flickerOffset = Math.random() * 1000; // Randomize flicker phase

        this.lights.push(light);
        this.torchAnims.push(light);

        // Flame particle effect (optional — simple emissive sphere as fallback)
        const flame = BABYLON.MeshBuilder.CreateSphere("flame", {
            diameter: 0.12, segments: 8
        }, this.scene);
        flame.position = new BABYLON.Vector3(tx, ty + 0.25, tz);
        const flameMat = new BABYLON.StandardMaterial("flameMat", this.scene);
        flameMat.emissiveColor = new BABYLON.Color3(1.0, 0.5, 0.1);
        flameMat.disableLighting = true;
        flame.material = flameMat;
        this.meshes.push(flame);
    }

    /**
     * Place a standalone torch at a specific position (for corridors, etc.)
     */
    placeTorchAt(x, y, z) {
        const light = new BABYLON.PointLight(
            `torch_${x}_${z}`,
            new BABYLON.Vector3(x, y + 0.3, z),
            this.scene
        );
        light.diffuse = new BABYLON.Color3(1.0, 0.65, 0.3);
        light.specular = new BABYLON.Color3(0.5, 0.3, 0.1);
        light.intensity = 0.7;
        light.range = 12;
        light._baseIntensity = 0.7;
        light._flickerOffset = Math.random() * 1000;

        this.lights.push(light);
        this.torchAnims.push(light);

        // Flame visual
        const flame = BABYLON.MeshBuilder.CreateSphere("flame", {
            diameter: 0.1, segments: 6
        }, this.scene);
        flame.position = new BABYLON.Vector3(x, y + 0.25, z);
        const flameMat = new BABYLON.StandardMaterial("flameMat_standalone", this.scene);
        flameMat.emissiveColor = new BABYLON.Color3(1.0, 0.5, 0.1);
        flameMat.disableLighting = true;
        flame.material = flameMat;
        this.meshes.push(flame);
    }

    // ── Light Shafts (God Rays) ────────────────

    /**
     * Create volumetric light shafts through windows.
     * Uses Babylon's VolumetricLightScatteringPostProcess for god rays,
     * with a bright plane placed at each window to act as the light source.
     */
    createLightShafts(camera) {
        this.windows.forEach((win, i) => {
            // Create a bright emissive plane at the window to represent sunlight
            const lightPlane = BABYLON.MeshBuilder.CreatePlane(`lightSource_${i}`, {
                width: win.width * 0.8,
                height: win.height * 0.8
            }, this.scene);
            lightPlane.position = win.position.clone();

            // Orient the plane to face into the room
            if (Math.abs(win.normal.z) > 0.5) {
                lightPlane.rotation.y = win.normal.z > 0 ? 0 : Math.PI;
            } else {
                lightPlane.rotation.y = win.normal.x > 0 ? Math.PI / 2 : -Math.PI / 2;
            }

            const lightPlaneMat = new BABYLON.StandardMaterial(`lightSourceMat_${i}`, this.scene);
            lightPlaneMat.emissiveColor = new BABYLON.Color3(1.0, 0.95, 0.8);
            lightPlaneMat.disableLighting = true;
            lightPlaneMat.alpha = 0.6;
            lightPlane.material = lightPlaneMat;
            this.meshes.push(lightPlane);

            // Volumetric Light Scattering post-process (god rays)
            try {
                const godrays = new BABYLON.VolumetricLightScatteringPostProcess(
                    `godrays_${i}`,
                    1.0,             // ratio
                    camera,
                    lightPlane,      // mesh that acts as the "sun"
                    50,              // samples — lower = faster
                    BABYLON.Texture.BILINEAR_SAMPLINGMODE,
                    this.scene.getEngine(),
                    false            // reusable
                );

                godrays.exposure = 0.25;
                godrays.decay = 0.97;
                godrays.weight = 0.6;
                godrays.density = 0.8;

                console.log(`   ☀️ Light shaft created at window ${i}`);
            } catch (e) {
                console.warn(`   ⚠️ VolumetricLightScattering not available, using fallback glow for window ${i}`);
                // Fallback: just a spotlight through the window
                const spotlight = new BABYLON.SpotLight(
                    `windowSpot_${i}`,
                    win.position.add(win.normal.scale(-1)),
                    win.normal.scale(1),
                    Math.PI / 3,  // angle
                    2,            // exponent
                    this.scene
                );
                spotlight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.85);
                spotlight.intensity = 1.5;
                spotlight.range = 25;
                this.lights.push(spotlight);
            }

            // Directional light through window for actual illumination
            const windowLight = new BABYLON.SpotLight(
                `windowLight_${i}`,
                win.position.add(win.normal.scale(-2)),
                win.normal.scale(1),
                Math.PI / 4,
                3,
                this.scene
            );
            windowLight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.85);
            windowLight.intensity = 1.2;
            windowLight.range = 20;
            this.lights.push(windowLight);
        });
    }

    // ── Atmospheric Setup ──────────────────────

    /**
     * Configure dungeon atmosphere: fog, ambient light, scene color
     */
    setupAtmosphere(scene) {
        // Dark scene background
        scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.03, 1.0);

        // Fog
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        scene.fogDensity = 0.015;
        scene.fogColor = new BABYLON.Color3(0.05, 0.04, 0.06);

        // Very dim ambient light — most illumination comes from torches/windows
        const ambient = scene.getLightByName("ambient");
        if (ambient) {
            ambient.intensity = 0.08;
            ambient.diffuse = new BABYLON.Color3(0.15, 0.12, 0.2);
            ambient.groundColor = new BABYLON.Color3(0.05, 0.04, 0.06);
        }

        // Disable/dim the sun — we're underground
        const sun = scene.getLightByName("sun");
        if (sun) {
            sun.intensity = 0.05;
        }

        console.log('   🌫️ Dungeon atmosphere configured');
    }

    // ── Update Loop ────────────────────────────

    /**
     * Per-frame updates: torch flicker, etc.
     * Call this from onUpdate.
     */
    update(time) {
        // Torch flicker animation
        this.torchAnims.forEach(light => {
            const t = time * 0.001 + light._flickerOffset;
            // Combine multiple sine waves for organic flicker
            const flicker = 1.0
                + Math.sin(t * 8.3) * 0.08
                + Math.sin(t * 13.7) * 0.05
                + Math.sin(t * 23.1) * 0.03
                + (Math.random() - 0.5) * 0.04; // Tiny random jitter
            light.intensity = light._baseIntensity * flicker;
        });
    }

    // ── Utilities ──────────────────────────────

    _addPhysics(mesh, mass) {
        if (!this.havokPlugin) return;
        try {
            new BABYLON.PhysicsAggregate(
                mesh,
                BABYLON.PhysicsShapeType.BOX,
                { mass: mass, friction: 0.8 },
                this.scene
            );
        } catch (e) {
            // Physics may fail on some geometries — non-fatal
        }
    }

    /**
     * Clean up all dungeon meshes and lights
     */
    dispose() {
        this.meshes.forEach(m => { if (m && !m.isDisposed()) m.dispose(); });
        this.lights.forEach(l => l.dispose());
        this.meshes = [];
        this.lights = [];
        this.torchAnims = [];
        this.windows = [];
        console.log('🏰 Dungeon disposed');
    }
}


// ─────────────────────────────────────────────
// DUNGEON LEVEL CONFIG FACTORY
// ─────────────────────────────────────────────
// This is what you pass to engine.loadLevel().
// It's the clean interface between the core engine and this level.

export const DungeonLevel = {

    /**
     * Create a dungeon level config object.
     * 
     * @param {Object} options
     * @param {number} options.rooms          - Number of rooms (default: 3)
     * @param {number} options.roomWidth      - Width of each room (default: 16)
     * @param {number} options.roomDepth      - Depth of each room (default: 12)
     * @param {number} options.roomHeight     - Wall height (default: 6)
     * @param {number} options.corridorLength - Corridor length between rooms (default: 10)
     * @param {boolean} options.showTerrain   - Show terrain outside windows (default: true)
     * @param {boolean} options.lightShafts   - Enable volumetric light shafts (default: true)
     * 
     * @returns {Object} levelConfig compatible with ApplesauceCore.loadLevel()
     */
    create(options = {}) {
        const opts = {
            rooms: options.rooms || 3,
            roomWidth: options.roomWidth || 16,
            roomDepth: options.roomDepth || 12,
            roomHeight: options.roomHeight || 6,
            corridorLength: options.corridorLength || 10,
            corridorWidth: options.corridorWidth || 4,
            showTerrain: options.showTerrain !== false,
            lightShafts: options.lightShafts !== false,
            ...options
        };

        // Internal state — the builder instance lives here
        let dungeonBuilder = null;
        let startTime = 0;

        return {
            // ── Meta ──
            meta: {
                name: 'Castle Dungeon',
                description: 'A dark stone dungeon with procedural textures and light shafts',
                author: 'APPLESAUCE Level System',
                version: '1.0.0'
            },

            // ── Terrain ── (visible through windows)
            terrain: opts.showTerrain ? {
                type: 'procedural',
                size: 300,
                resolution: 60,
                noise: { preset: 'hills' },
                color: { r: 0.25, g: 0.35, b: 0.2 }
            } : null,

            // ── Player Start ── (center of first room, slightly above floor)
            playerStart: {
                x: 0,
                y: 2,
                z: 0
            },

            // ── Level Start Hook ── 
            // This is where ALL dungeon construction happens.
            // The core engine calls this after setting up the scene.
            async onLevelStart(engine) {
                console.log('🏰 Building Castle Dungeon...');
                startTime = performance.now();

                dungeonBuilder = new DungeonBuilder(
                    engine.scene,
                    engine.havokPlugin,
                    engine.shadowGenerator
                );

                // Set dungeon atmosphere
                dungeonBuilder.setupAtmosphere(engine.scene);

                // ── Generate Room Layout ──
                // Rooms are placed in a line along Z axis with corridors between them
                let currentZ = 0;
                const totalSpan = opts.roomDepth + opts.corridorLength;

                for (let i = 0; i < opts.rooms; i++) {
                    const roomZ = currentZ;

                    // Determine which walls get windows
                    // East and west walls get windows for light shafts
                    const roomWindows = [];
                    if (i === 0 || i === opts.rooms - 1) {
                        // First and last rooms: windows on east wall
                        roomWindows.push({ wall: 'east', position: 0.5, width: 2.0, height: 1.8 });
                    }
                    if (i % 2 === 0) {
                        // Even rooms: window on west wall
                        roomWindows.push({ wall: 'west', position: 0.5, width: 1.8, height: 1.5 });
                    }

                    // Determine doorway openings
                    const roomOpenings = [];
                    if (i > 0) {
                        // Opening on north wall (connects to previous corridor)
                        roomOpenings.push({ wall: 'north', position: 0.5, width: opts.corridorWidth, height: opts.roomHeight * 0.75 });
                    }
                    if (i < opts.rooms - 1) {
                        // Opening on south wall (connects to next corridor)
                        roomOpenings.push({ wall: 'south', position: 0.5, width: opts.corridorWidth, height: opts.roomHeight * 0.75 });
                    }

                    // Place torches
                    const roomTorches = [
                        { wall: 'east', position: 0.25, height: opts.roomHeight * 0.6 },
                        { wall: 'west', position: 0.75, height: opts.roomHeight * 0.6 }
                    ];

                    dungeonBuilder.buildRoom({
                        width: opts.roomWidth,
                        depth: opts.roomDepth,
                        height: opts.roomHeight,
                        position: { x: 0, y: 0, z: roomZ },
                        windows: roomWindows,
                        openings: roomOpenings,
                        torches: roomTorches
                    });

                    console.log(`   🏰 Room ${i + 1} built at Z=${roomZ}`);

                    // Build corridor to next room
                    if (i < opts.rooms - 1) {
                        const corridorStartZ = roomZ + opts.roomDepth / 2;
                        const corridorEndZ = roomZ + totalSpan - opts.roomDepth / 2;

                        dungeonBuilder.buildCorridor({
                            start: { x: 0, y: 0, z: corridorStartZ },
                            end: { x: 0, y: 0, z: corridorEndZ },
                            width: opts.corridorWidth,
                            height: opts.roomHeight * 0.8
                        });

                        // Torch in corridor
                        dungeonBuilder.placeTorchAt(
                            opts.corridorWidth / 2 - 0.5,
                            opts.roomHeight * 0.5,
                            (corridorStartZ + corridorEndZ) / 2
                        );
                    }

                    currentZ += totalSpan;
                }

                // ── Light Shafts ──
                if (opts.lightShafts && dungeonBuilder.windows.length > 0) {
                    dungeonBuilder.createLightShafts(engine.camera);
                }

                // ── Camera Adjustments for Interior ──
                if (engine.camera) {
                    engine.camera.lowerRadiusLimit = 1;
                    engine.camera.upperRadiusLimit = 12;
                    engine.camera.wheelPrecision = 80;
                    // Tighter beta limits to avoid clipping through ceiling
                    engine.camera.lowerBetaLimit = BABYLON.Tools.ToRadians(30);
                    engine.camera.upperBetaLimit = BABYLON.Tools.ToRadians(85);
                }

                console.log(`🏰 Castle Dungeon built! (${opts.rooms} rooms, ${dungeonBuilder.windows.length} windows, ${dungeonBuilder.lights.length} lights)`);
            },

            // ── Per-Frame Update Hook ──
            // Called every frame by the core engine's update loop.
            onUpdate(engine) {
                if (dungeonBuilder) {
                    dungeonBuilder.update(performance.now() - startTime);
                }
            },

            // ── Cleanup ──
            // Called by engine.clearLevel() before loading a new level
            dispose() {
                if (dungeonBuilder) {
                    dungeonBuilder.dispose();
                    dungeonBuilder = null;
                }
            }
        };
    }
};
