/**
 * APPLESAUCE Room Graph System — Expanded
 * ═══════════════════════════════════════════════════════════════
 * 
 * Extension of the base room graph to support Frutiger Aero /
 * modern brutalist aesthetics. Adds new room types, outdoor
 * terrain zones, procedural material generation, and tri-planar
 * mapping for large architectural surfaces.
 * 
 * NEW ROOM TYPES:
 *   gallery    — Extra-long corridor, floor-to-ceiling window wall on one side
 *   terrace    — Open-air platform with glass railing, cantilevered
 *   atrium     — Double/triple-height room with skylight grid
 *   loggia     — Covered walkway, open on one long side (colonnade)
 *   pool_deck  — Open courtyard variant with reflective water plane
 *   mezzanine  — Half-floor balcony overlooking a connected large_room or atrium
 *   ramp       — Gentle slope connection (replaces staircase for ADA/modern feel)
 * 
 * UPDATED ROOM TYPES:
 *   hallway    — Now supports `windowWall` option ('east'|'west'|'both'|'none')
 *   courtyard  — Now supports `terrain` option for procedural ground cover
 *   staircase  — Now supports `style`: 'floating'|'switchback'|'spiral'|'cantilever'
 * 
 * MATERIAL PALETTE (Frutiger Aero × Brutalist):
 *   Board-formed concrete (heavy grain texture, warm grey)
 *   Polished concrete (light, almost white)
 *   Floor-to-ceiling glass (reflective, slight green tint)
 *   Brushed steel / raw aluminum
 *   Warm wood (walnut planks — the "aero" softness)
 *   Terrazzo flooring (aggregate chips in polished concrete)
 *   Water (reflective/refractive plane for pools and features)
 * 
 * TERRAIN TYPES (for courtyards, terraces, exteriors):
 *   landscaped  — Manicured grass, gravel paths, succulents (LA vibe)
 *   hillside    — Sloped terrain, the building cascades down
 *   rooftop     — Flat with pavers, planter boxes
 *   cliff       — Dramatic drop-off, cantilevered rooms over edge
 * 
 * TRI-PLANAR MAPPING:
 *   Large concrete/stone surfaces use tri-planar projection so
 *   textures don't stretch on vertical walls or angled surfaces.
 *   The shader blends XY, XZ, YZ projections based on surface normal.
 * 
 * ═══════════════════════════════════════════════════════════════
 */


// ═══════════════════════════════════════════════════════════════
// EXTENDED ROOM DEFAULTS
// ═══════════════════════════════════════════════════════════════

export const ROOM_DEFAULTS = {
    // --- Original types (updated for new aesthetic) ---
    hallway:    { width: 4,  depth: 14, height: 4.5, windows: 0, torchCount: 0, windowWall: 'none',  material: 'polished_concrete' },
    room:       { width: 14, depth: 10, height: 4.5, windows: 1, torchCount: 0, material: 'board_formed' },
    large_room: { width: 22, depth: 16, height: 5.5, windows: 3, torchCount: 0, material: 'board_formed' },
    courtyard:  { width: 24, depth: 24, height: 0,   windows: 0, torchCount: 0, terrain: 'landscaped', material: 'terrazzo' },
    staircase:  { width: 5,  depth: 14, height: 5,   windows: 1, torchCount: 0, style: 'floating',   material: 'polished_concrete' },

    // --- New types ---
    gallery: {
        width: 4.5,
        depth: 28,         // Extra long — the whole point
        height: 5,
        windows: 0,        // Uses windowWall instead of discrete windows
        windowWall: 'east', // Full glass wall on one side
        torchCount: 0,
        material: 'polished_concrete',
        floorMaterial: 'terrazzo'
    },
    terrace: {
        width: 18,
        depth: 12,
        height: 1.2,       // Just the railing height
        windows: 0,
        torchCount: 0,
        openTop: true,
        openSides: ['south'],   // Which sides have no wall (glass railing only)
        material: 'brushed_steel',
        floorMaterial: 'wood_deck',
        canOverhang: true       // Can extend past the floor below
    },
    atrium: {
        width: 16,
        depth: 16,
        height: 14,         // Double or triple height
        windows: 0,
        torchCount: 0,
        skylight: true,      // Glass ceiling grid
        skylightGrid: [4, 4], // 4×4 panes
        material: 'board_formed',
        floorMaterial: 'terrazzo',
        spansFloors: 2        // How many floorLevels this room occupies vertically
    },
    loggia: {
        width: 4,
        depth: 20,
        height: 4.5,
        windows: 0,
        torchCount: 0,
        openSide: 'south',   // One long side is open (columns only)
        columnSpacing: 4,     // Distance between columns
        columnRadius: 0.25,   // Thin circular columns — brutalist
        material: 'board_formed',
        floorMaterial: 'polished_concrete'
    },
    pool_deck: {
        width: 20,
        depth: 30,
        height: 0,
        windows: 0,
        torchCount: 0,
        openTop: true,
        terrain: 'rooftop',
        waterBody: {
            shape: 'rectangular', // 'rectangular' | 'infinity' | 'L_shaped'
            width: 14,
            depth: 6,
            offsetX: 0,
            offsetZ: 4
        },
        material: 'polished_concrete',
        floorMaterial: 'stone_paver'
    },
    mezzanine: {
        width: 14,
        depth: 6,
        height: 4.5,
        windows: 0,
        torchCount: 0,
        railing: 'glass',      // 'glass' | 'steel' | 'cable'
        overlooksRoom: null,    // Set to the id of the room it overlooks
        material: 'polished_concrete',
        floorMaterial: 'wood_plank'
    },
    ramp: {
        width: 4,
        depth: 18,
        height: 5,
        windows: 1,
        torchCount: 0,
        slope: 'gradual',       // 'gradual' (1:12) | 'moderate' (1:8) 
        windowWall: 'east',
        material: 'polished_concrete',
        floorMaterial: 'polished_concrete'
    }
};


// ═══════════════════════════════════════════════════════════════
// PROCEDURAL MATERIAL SYSTEM
// ═══════════════════════════════════════════════════════════════

/**
 * Generates Babylon.js materials with procedural textures.
 * All large-surface materials use tri-planar mapping by default
 * so they work on walls, floors, ceilings, and angled surfaces
 * without UV stretching.
 * 
 * USAGE:
 *   const matSystem = new ProceduralMaterials(scene);
 *   const concrete = matSystem.get('board_formed');
 *   mesh.material = concrete;
 */
export class ProceduralMaterials {
    constructor(scene) {
        this.scene = scene;
        this._cache = {};
    }

    /**
     * Get or create a material by palette name.
     * Returns a PBR material with procedural textures.
     */
    get(name, opts = {}) {
        const key = `${name}_${JSON.stringify(opts)}`;
        if (this._cache[key]) return this._cache[key];

        const factory = this._factories[name];
        if (!factory) {
            console.warn(`Unknown material "${name}", falling back to polished_concrete`);
            return this.get('polished_concrete', opts);
        }

        const mat = factory.call(this, opts);
        this._cache[key] = mat;
        return mat;
    }

    /**
     * Apply tri-planar mapping to a material's textures.
     * This replaces standard UV mapping with world-space projection
     * blended across three axes based on surface normal.
     * 
     * @param {BABYLON.PBRMaterial} mat - The material to modify
     * @param {number} scale - Texture scale in world units (default 2.0)
     * @param {number} sharpness - Blend sharpness (higher = sharper transitions, default 4.0)
     */
    applyTriPlanar(mat, scale = 2.0, sharpness = 4.0) {
        // Tri-planar is applied via a custom shader chunk injected into
        // Babylon's PBR pipeline using onCompiled + customShaderNameResolve
        // 
        // The key idea:
        //   1. In the vertex shader, pass worldPos and worldNormal to fragment
        //   2. In the fragment shader, sample the texture 3 times:
        //      - XY plane (using worldPos.xy) — catches Z-facing surfaces
        //      - XZ plane (using worldPos.xz) — catches Y-facing surfaces (floors/ceilings)
        //      - YZ plane (using worldPos.yz) — catches X-facing surfaces
        //   3. Blend the three samples using abs(worldNormal) as weights
        //      raised to `sharpness` power for crisp transitions

        mat._triPlanarScale = scale;
        mat._triPlanarSharpness = sharpness;
        mat._triPlanarEnabled = true;

        // Store the GLSL chunk for the builder to inject
        mat.metadata = mat.metadata || {};
        mat.metadata.triPlanar = {
            enabled: true,
            scale,
            sharpness,
            // The actual GLSL is injected by the DungeonBuilder when it
            // compiles the material. Here's the fragment logic for reference:
            fragmentChunk: TRI_PLANAR_FRAGMENT
        };

        return mat;
    }

    // ─── Material Factories ──────────────────────────────────

    get _factories() {
        return {
            board_formed: (opts) => this._boardFormedConcrete(opts),
            polished_concrete: (opts) => this._polishedConcrete(opts),
            glass: (opts) => this._architecturalGlass(opts),
            brushed_steel: (opts) => this._brushedSteel(opts),
            wood_plank: (opts) => this._woodPlank(opts),
            wood_deck: (opts) => this._woodDeck(opts),
            terrazzo: (opts) => this._terrazzo(opts),
            stone_paver: (opts) => this._stonePaver(opts),
            water: (opts) => this._water(opts)
        };
    }

    /**
     * Board-formed concrete — heavy wood grain imprint, warm grey.
     * The signature brutalist texture. Procedurally generated with
     * layered Perlin noise for the grain pattern + subtle color variation.
     */
    _boardFormedConcrete(opts = {}) {
        const mat = new BABYLON.PBRMaterial('mat_board_formed', this.scene);

        // Base color: warm grey (not cold — this is LA, not London)
        const baseColor = opts.color || new BABYLON.Color3(0.72, 0.70, 0.67);
        mat.albedoColor = baseColor;
        mat.metallic = 0.0;
        mat.roughness = 0.85;

        // Procedural texture for the board grain pattern
        const albedoTex = this._generateBoardFormedTexture(512, baseColor);
        mat.albedoTexture = albedoTex;

        // Normal map from the same noise (offset for depth)
        const normalTex = this._generateBoardFormedNormal(512);
        mat.bumpTexture = normalTex;
        mat.bumpTexture.level = 0.6;

        // Tri-planar so it works on walls AND floors
        this.applyTriPlanar(mat, opts.scale || 3.0, 6.0);

        return mat;
    }

    /**
     * Polished concrete — smooth, light, almost white.
     * Very subtle noise for surface imperfections.
     */
    _polishedConcrete(opts = {}) {
        const mat = new BABYLON.PBRMaterial('mat_polished_concrete', this.scene);
        mat.albedoColor = opts.color || new BABYLON.Color3(0.88, 0.87, 0.85);
        mat.metallic = 0.02;
        mat.roughness = 0.25; // Polished = low roughness

        const tex = this._generatePolishedConcreteTexture(512);
        mat.albedoTexture = tex;

        this.applyTriPlanar(mat, opts.scale || 2.0, 4.0);
        return mat;
    }

    /**
     * Floor-to-ceiling architectural glass.
     * Slight green tint, high reflectivity, used for window walls.
     */
    _architecturalGlass(opts = {}) {
        const mat = new BABYLON.PBRMaterial('mat_glass', this.scene);
        mat.albedoColor = new BABYLON.Color3(0.85, 0.92, 0.88); // Slight green
        mat.metallic = 0.0;
        mat.roughness = 0.05;
        mat.alpha = opts.alpha || 0.15;
        mat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;

        // Reflections are key for glass — relies on environment/skybox
        mat.environmentIntensity = 1.4;
        mat.directIntensity = 0.6;

        // Fresnel: more reflective at glancing angles
        mat.subSurface.isRefractionEnabled = true;
        mat.subSurface.refractionIntensity = 0.6;
        mat.subSurface.indexOfRefraction = 1.52; // Standard glass

        return mat;
    }

    /**
     * Brushed steel — for railings, columns, structural elements.
     */
    _brushedSteel(opts = {}) {
        const mat = new BABYLON.PBRMaterial('mat_brushed_steel', this.scene);
        mat.albedoColor = new BABYLON.Color3(0.77, 0.78, 0.80);
        mat.metallic = 0.95;
        mat.roughness = 0.35;

        // Anisotropic brushed look
        mat.anisotropy.isEnabled = true;
        mat.anisotropy.intensity = 0.7;
        mat.anisotropy.direction = new BABYLON.Vector2(0, 1); // Vertical brush

        this.applyTriPlanar(mat, 0.5, 8.0);
        return mat;
    }

    /**
     * Walnut wood plank — warm, rich, the "aero" softness element.
     * Procedural wood grain using domain-warped noise.
     */
    _woodPlank(opts = {}) {
        const mat = new BABYLON.PBRMaterial('mat_wood_plank', this.scene);
        mat.albedoColor = new BABYLON.Color3(0.45, 0.30, 0.18);
        mat.metallic = 0.0;
        mat.roughness = 0.55;

        const tex = this._generateWoodTexture(512, 'walnut');
        mat.albedoTexture = tex;

        // Wood normal map for grain depth
        const normalTex = this._generateWoodNormal(512);
        mat.bumpTexture = normalTex;
        mat.bumpTexture.level = 0.3;

        // Wood uses standard UV on floors, tri-planar on walls
        if (opts.triPlanar !== false) {
            this.applyTriPlanar(mat, 1.5, 4.0);
        }

        return mat;
    }

    /**
     * Exterior wood deck — lighter, weathered, wider planks.
     */
    _woodDeck(opts = {}) {
        const mat = this._woodPlank({ ...opts, triPlanar: false });
        mat.name = 'mat_wood_deck';
        mat.albedoColor = new BABYLON.Color3(0.55, 0.45, 0.35);
        mat.roughness = 0.7; // More weathered
        return mat;
    }

    /**
     * Terrazzo floor — polished concrete with aggregate chips.
     * Procedurally scatters colored chip shapes across the surface.
     */
    _terrazzo(opts = {}) {
        const mat = new BABYLON.PBRMaterial('mat_terrazzo', this.scene);
        mat.albedoColor = new BABYLON.Color3(0.90, 0.88, 0.84);
        mat.metallic = 0.02;
        mat.roughness = 0.18; // Very polished

        const tex = this._generateTerrazzoTexture(1024);
        mat.albedoTexture = tex;

        this.applyTriPlanar(mat, 2.0, 4.0);
        return mat;
    }

    /**
     * Stone paver — for pool decks, terraces.
     */
    _stonePaver(opts = {}) {
        const mat = new BABYLON.PBRMaterial('mat_stone_paver', this.scene);
        mat.albedoColor = new BABYLON.Color3(0.78, 0.76, 0.72);
        mat.metallic = 0.0;
        mat.roughness = 0.65;

        const tex = this._generatePaverTexture(512);
        mat.albedoTexture = tex;
        const normalTex = this._generatePaverNormal(512);
        mat.bumpTexture = normalTex;
        mat.bumpTexture.level = 0.4;

        this.applyTriPlanar(mat, 1.5, 4.0);
        return mat;
    }

    /**
     * Water material — reflective/refractive plane for pools.
     */
    _water(opts = {}) {
        const mat = new BABYLON.PBRMaterial('mat_water', this.scene);
        mat.albedoColor = new BABYLON.Color3(0.15, 0.35, 0.45);
        mat.metallic = 0.0;
        mat.roughness = 0.05;
        mat.alpha = 0.6;
        mat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;

        mat.subSurface.isRefractionEnabled = true;
        mat.subSurface.refractionIntensity = 0.8;
        mat.subSurface.indexOfRefraction = 1.33; // Water IOR
        mat.subSurface.tintColor = new BABYLON.Color3(0.1, 0.4, 0.5);

        // Animated normal map for ripples would go here
        // (see _animateWater in the builder)

        return mat;
    }

    // ─── Procedural Texture Generators ───────────────────────
    //
    // These use BABYLON.DynamicTexture (canvas-based) for maximum
    // compatibility. For GPU-side generation, swap these for
    // BABYLON.ProceduralTexture with custom shaders.

    _generateBoardFormedTexture(size, baseColor) {
        const tex = new BABYLON.DynamicTexture('tex_board_formed', size, this.scene, true);
        const ctx = tex.getContext();

        // Base fill
        const r = Math.floor(baseColor.r * 255);
        const g = Math.floor(baseColor.g * 255);
        const b = Math.floor(baseColor.b * 255);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, 0, size, size);

        // Board grain lines — horizontal bands with noise
        const boardHeight = size / 8; // ~8 boards across texture
        for (let board = 0; board < 8; board++) {
            const y0 = board * boardHeight;

            // Each board has slightly different base color
            const shift = (Math.random() - 0.5) * 15;
            ctx.fillStyle = `rgb(${r + shift},${g + shift},${b + shift})`;
            ctx.fillRect(0, y0, size, boardHeight - 2);

            // Wood grain lines within each board
            for (let line = 0; line < 12; line++) {
                const ly = y0 + Math.random() * boardHeight;
                const alpha = 0.03 + Math.random() * 0.06;
                ctx.strokeStyle = `rgba(60, 50, 40, ${alpha})`;
                ctx.lineWidth = 1 + Math.random() * 2;
                ctx.beginPath();
                ctx.moveTo(0, ly);
                // Wavy line for organic grain feel
                for (let x = 0; x < size; x += 8) {
                    ctx.lineTo(x, ly + Math.sin(x * 0.02 + board) * 2);
                }
                ctx.stroke();
            }

            // Seam between boards
            ctx.strokeStyle = 'rgba(40, 35, 30, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, y0);
            ctx.lineTo(size, y0);
            ctx.stroke();
        }

        // Subtle overall noise for concrete feel
        const imageData = ctx.getImageData(0, 0, size, size);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 8;
            imageData.data[i] += noise;
            imageData.data[i + 1] += noise;
            imageData.data[i + 2] += noise;
        }
        ctx.putImageData(imageData, 0, 0);

        tex.update();
        tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
        return tex;
    }

    _generateBoardFormedNormal(size) {
        // Generate a simple normal map from the board grain
        const tex = new BABYLON.DynamicTexture('nrm_board_formed', size, this.scene, true);
        const ctx = tex.getContext();

        // Flat normal base (pointing up: 128, 128, 255 in normal map space)
        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, size, size);

        // Board seams create slight depth
        const boardHeight = size / 8;
        for (let board = 0; board < 8; board++) {
            const y0 = board * boardHeight;
            // Shadow side of seam
            ctx.fillStyle = 'rgb(128, 100, 255)';
            ctx.fillRect(0, y0, size, 2);
            // Light side of seam
            ctx.fillStyle = 'rgb(128, 155, 255)';
            ctx.fillRect(0, y0 + 2, size, 1);
        }

        // Grain bump noise
        const imageData = ctx.getImageData(0, 0, size, size);
        for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] += (Math.random() - 0.5) * 4;     // R (X normal)
            imageData.data[i + 1] += (Math.random() - 0.5) * 6; // G (Y normal)
        }
        ctx.putImageData(imageData, 0, 0);

        tex.update();
        tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
        return tex;
    }

    _generatePolishedConcreteTexture(size) {
        const tex = new BABYLON.DynamicTexture('tex_polished', size, this.scene, true);
        const ctx = tex.getContext();

        ctx.fillStyle = 'rgb(224, 222, 217)';
        ctx.fillRect(0, 0, size, size);

        // Very subtle aggregate visibility
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 1 + Math.random() * 3;
            const shade = 200 + Math.floor(Math.random() * 30);
            ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 5})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Pixel noise
        const imageData = ctx.getImageData(0, 0, size, size);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const n = (Math.random() - 0.5) * 5;
            imageData.data[i] += n;
            imageData.data[i + 1] += n;
            imageData.data[i + 2] += n;
        }
        ctx.putImageData(imageData, 0, 0);

        tex.update();
        tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
        return tex;
    }

    _generateTerrazzoTexture(size) {
        const tex = new BABYLON.DynamicTexture('tex_terrazzo', size, this.scene, true);
        const ctx = tex.getContext();

        // Cream/off-white base
        ctx.fillStyle = 'rgb(230, 225, 215)';
        ctx.fillRect(0, 0, size, size);

        // Scatter aggregate chips — mix of colors
        const chipColors = [
            'rgb(180, 60, 50)',   // Terracotta red
            'rgb(60, 60, 60)',    // Dark grey
            'rgb(200, 195, 180)', // Cream
            'rgb(140, 150, 130)', // Sage green
            'rgb(100, 90, 85)',   // Warm dark
            'rgb(220, 200, 170)', // Sandy
        ];

        for (let i = 0; i < 600; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const color = chipColors[Math.floor(Math.random() * chipColors.length)];
            ctx.fillStyle = color;

            // Irregular polygon chips
            ctx.beginPath();
            const sides = 3 + Math.floor(Math.random() * 4);
            const chipSize = 2 + Math.random() * 6;
            const angleOff = Math.random() * Math.PI * 2;
            for (let s = 0; s <= sides; s++) {
                const angle = angleOff + (s / sides) * Math.PI * 2;
                const r = chipSize * (0.6 + Math.random() * 0.4);
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        }

        tex.update();
        tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
        return tex;
    }

    _generateWoodTexture(size, woodType = 'walnut') {
        const tex = new BABYLON.DynamicTexture(`tex_wood_${woodType}`, size, this.scene, true);
        const ctx = tex.getContext();

        // Wood base colors by type
        const palettes = {
            walnut: { base: [115, 77, 46], dark: [80, 50, 28], light: [140, 100, 65] },
            oak:    { base: [170, 140, 100], dark: [130, 100, 65], light: [200, 175, 140] },
            ash:    { base: [210, 195, 170], dark: [180, 160, 130], light: [230, 220, 200] }
        };
        const pal = palettes[woodType] || palettes.walnut;

        ctx.fillStyle = `rgb(${pal.base.join(',')})`;
        ctx.fillRect(0, 0, size, size);

        // Wood grain: domain-warped horizontal lines
        for (let y = 0; y < size; y++) {
            const t = y / size;
            // Mix between light and dark based on sine pattern
            const wave = Math.sin(t * 40 + Math.sin(t * 8) * 3) * 0.5 + 0.5;
            const r = Math.floor(pal.dark[0] + (pal.light[0] - pal.dark[0]) * wave);
            const g = Math.floor(pal.dark[1] + (pal.light[1] - pal.dark[1]) * wave);
            const b = Math.floor(pal.dark[2] + (pal.light[2] - pal.dark[2]) * wave);

            ctx.strokeStyle = `rgba(${r},${g},${b}, 0.4)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
            ctx.stroke();
        }

        // Knot holes (sparse)
        if (Math.random() > 0.5) {
            const kx = size * 0.3 + Math.random() * size * 0.4;
            const ky = size * 0.3 + Math.random() * size * 0.4;
            const kr = 6 + Math.random() * 10;
            const grad = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr);
            grad.addColorStop(0, `rgb(${pal.dark.join(',')})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(kx, ky, kr, 0, Math.PI * 2);
            ctx.fill();
        }

        tex.update();
        tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
        return tex;
    }

    _generateWoodNormal(size) {
        const tex = new BABYLON.DynamicTexture('nrm_wood', size, this.scene, true);
        const ctx = tex.getContext();
        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, size, size);

        // Horizontal grain bumps
        for (let y = 0; y < size; y += 3) {
            const intensity = Math.random() * 10;
            ctx.fillStyle = `rgb(128, ${128 + intensity}, 255)`;
            ctx.fillRect(0, y, size, 1);
        }

        tex.update();
        tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
        return tex;
    }

    _generatePaverTexture(size) {
        const tex = new BABYLON.DynamicTexture('tex_paver', size, this.scene, true);
        const ctx = tex.getContext();
        ctx.fillStyle = 'rgb(195, 190, 182)';
        ctx.fillRect(0, 0, size, size);

        // Grid of pavers with grout lines
        const paverSize = size / 4;
        const groutWidth = 4;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const x = col * paverSize + groutWidth / 2;
                const y = row * paverSize + groutWidth / 2;
                const shade = 180 + Math.floor(Math.random() * 25);
                ctx.fillStyle = `rgb(${shade + 5}, ${shade + 2}, ${shade})`;
                ctx.fillRect(x, y, paverSize - groutWidth, paverSize - groutWidth);
            }
        }

        // Grout is just the darker background showing through

        tex.update();
        tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
        return tex;
    }

    _generatePaverNormal(size) {
        const tex = new BABYLON.DynamicTexture('nrm_paver', size, this.scene, true);
        const ctx = tex.getContext();
        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, size, size);

        const paverSize = size / 4;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const x = col * paverSize;
                const y = row * paverSize;
                // Beveled edges via normal offset
                ctx.fillStyle = 'rgb(148, 148, 255)'; // top edge
                ctx.fillRect(x, y, paverSize, 3);
                ctx.fillStyle = 'rgb(108, 108, 255)'; // bottom edge
                ctx.fillRect(x, y + paverSize - 3, paverSize, 3);
            }
        }

        tex.update();
        tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
        return tex;
    }
}


// ═══════════════════════════════════════════════════════════════
// TRI-PLANAR MAPPING SHADER CHUNK
// ═══════════════════════════════════════════════════════════════
//
// This GLSL gets injected into Babylon's PBR fragment shader
// for materials with triPlanar enabled. The DungeonBuilder
// hooks into material.onCompiled to patch the shader.

export const TRI_PLANAR_FRAGMENT = /* glsl */ `
// --- Tri-Planar Mapping ---
// Called in place of standard texture2D() for albedo + normal
//
// Inputs:
//   sampler2D tex     - the texture to sample
//   vec3 worldPos     - fragment world position
//   vec3 worldNormal  - fragment world normal (normalized)
//   float texScale    - world-space tiling (1.0 / scale)
//   float sharpness   - blend exponent (higher = less blending)
//
// Returns: vec4 blended color

vec4 triPlanarSample(sampler2D tex, vec3 worldPos, vec3 worldNormal, float texScale, float sharpness) {
    // Compute blend weights from world normal
    vec3 blend = abs(worldNormal);
    blend = pow(blend, vec3(sharpness));
    blend /= (blend.x + blend.y + blend.z); // Normalize so weights sum to 1

    // Sample texture along each projection plane
    vec4 xProj = texture2D(tex, worldPos.yz * texScale); // X-facing surfaces
    vec4 yProj = texture2D(tex, worldPos.xz * texScale); // Y-facing surfaces (floors)
    vec4 zProj = texture2D(tex, worldPos.xy * texScale); // Z-facing surfaces

    // Blend
    return xProj * blend.x + yProj * blend.y + zProj * blend.z;
}

// For normal maps, we need to reorient the sampled normals
// back to the correct tangent space for each projection axis
vec3 triPlanarNormal(sampler2D normalTex, vec3 worldPos, vec3 worldNormal, float texScale, float sharpness) {
    vec3 blend = abs(worldNormal);
    blend = pow(blend, vec3(sharpness));
    blend /= (blend.x + blend.y + blend.z);

    // Unpack normals (0..1 → -1..1)
    vec3 xN = texture2D(normalTex, worldPos.yz * texScale).xyz * 2.0 - 1.0;
    vec3 yN = texture2D(normalTex, worldPos.xz * texScale).xyz * 2.0 - 1.0;
    vec3 zN = texture2D(normalTex, worldPos.xy * texScale).xyz * 2.0 - 1.0;

    // Swizzle normals to world space for each axis
    xN = vec3(0, xN.yx);         // X-facing: YZ plane
    yN = vec3(yN.x, 0, yN.y);   // Y-facing: XZ plane
    zN = vec3(zN.xy, 0);         // Z-facing: XY plane

    // Flip to align with surface normal direction
    xN *= sign(worldNormal.x);
    yN *= sign(worldNormal.y);
    zN *= sign(worldNormal.z);

    return normalize(xN * blend.x + yN * blend.y + zN * blend.z + worldNormal);
}
`;


// ═══════════════════════════════════════════════════════════════
// TERRAIN GENERATOR (for courtyards, pool decks, exteriors)
// ═══════════════════════════════════════════════════════════════

export class TerrainGenerator {
    /**
     * Generate terrain geometry for a room with terrain enabled.
     * 
     * @param {Object} room - Room node from RoomGraph
     * @param {BABYLON.Scene} scene 
     * @param {ProceduralMaterials} materials
     * @returns {BABYLON.Mesh[]} Array of generated meshes
     */
    static generate(room, scene, materials) {
        const terrainType = room.terrain || 'landscaped';
        const factory = TerrainGenerator._factories[terrainType];
        if (!factory) {
            console.warn(`Unknown terrain "${terrainType}", using landscaped`);
            return TerrainGenerator._factories.landscaped(room, scene, materials);
        }
        return factory(room, scene, materials);
    }

    static get _factories() {
        return {
            landscaped: TerrainGenerator._landscaped,
            hillside: TerrainGenerator._hillside,
            rooftop: TerrainGenerator._rooftop,
            cliff: TerrainGenerator._cliff
        };
    }

    /**
     * Landscaped — manicured LA mansion garden.
     * Flat grass plane with gravel path strips, planter boxes,
     * and scattered succulent clusters (simplified geo).
     */
    static _landscaped(room, scene, materials) {
        const meshes = [];
        const w = room.width;
        const d = room.depth;
        const pos = room.position || { x: 0, y: 0, z: 0 };

        // Ground plane — grass
        const ground = BABYLON.MeshBuilder.CreateGround('terrain_grass', {
            width: w, height: d, subdivisions: 16
        }, scene);
        ground.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);

        // Procedural grass material
        const grassMat = new BABYLON.PBRMaterial('mat_grass', scene);
        grassMat.albedoColor = new BABYLON.Color3(0.35, 0.55, 0.25);
        grassMat.roughness = 0.9;
        grassMat.metallic = 0.0;
        ground.material = grassMat;
        meshes.push(ground);

        // Gravel path — center strip
        const path = BABYLON.MeshBuilder.CreateGround('terrain_path', {
            width: w * 0.2, height: d * 0.8, subdivisions: 4
        }, scene);
        path.position = new BABYLON.Vector3(pos.x, pos.y + 0.02, pos.z);
        const gravelMat = new BABYLON.PBRMaterial('mat_gravel', scene);
        gravelMat.albedoColor = new BABYLON.Color3(0.75, 0.72, 0.68);
        gravelMat.roughness = 0.95;
        path.material = gravelMat;
        meshes.push(path);

        // Planter boxes along edges (simplified as boxes)
        const planterPositions = [
            { x: pos.x - w * 0.35, z: pos.z - d * 0.3 },
            { x: pos.x - w * 0.35, z: pos.z + d * 0.3 },
            { x: pos.x + w * 0.35, z: pos.z - d * 0.3 },
            { x: pos.x + w * 0.35, z: pos.z + d * 0.3 },
        ];
        planterPositions.forEach((pp, i) => {
            const planter = BABYLON.MeshBuilder.CreateBox(`planter_${i}`, {
                width: 2.5, height: 0.8, depth: 2.5
            }, scene);
            planter.position = new BABYLON.Vector3(pp.x, pos.y + 0.4, pp.z);
            planter.material = materials.get('board_formed', { scale: 0.5 });
            meshes.push(planter);

            // Succulent "ball" on top (sphere placeholder)
            const plant = BABYLON.MeshBuilder.CreateSphere(`succulent_${i}`, {
                diameter: 1.2, segments: 8
            }, scene);
            plant.position = new BABYLON.Vector3(pp.x, pos.y + 1.2, pp.z);
            const plantMat = new BABYLON.PBRMaterial(`mat_plant_${i}`, scene);
            plantMat.albedoColor = new BABYLON.Color3(0.3, 0.6, 0.35);
            plantMat.roughness = 0.8;
            plant.material = plantMat;
            meshes.push(plant);
        });

        return meshes;
    }

    /**
     * Hillside — sloped terrain that the building sits on/cascades down.
     * Uses a heightmap-style ground with vertex displacement.
     */
    static _hillside(room, scene, materials) {
        const meshes = [];
        const w = room.width * 2; // Terrain extends past room bounds
        const d = room.depth * 2;
        const pos = room.position || { x: 0, y: 0, z: 0 };

        const ground = BABYLON.MeshBuilder.CreateGround('terrain_hill', {
            width: w, height: d, subdivisions: 32, updatable: true
        }, scene);
        ground.position = new BABYLON.Vector3(pos.x, pos.y - 1, pos.z);

        // Displace vertices to create slope
        const positions = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            // Slope down toward +Z (south), with some noise
            const slope = z * 0.15;
            const noise = Math.sin(x * 0.3) * Math.cos(z * 0.2) * 0.5;
            positions[i + 1] += slope + noise;
        }
        ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        ground.createNormals(true);

        const hillMat = new BABYLON.PBRMaterial('mat_hillside', scene);
        hillMat.albedoColor = new BABYLON.Color3(0.4, 0.55, 0.3);
        hillMat.roughness = 0.85;
        ground.material = hillMat;
        meshes.push(ground);

        return meshes;
    }

    /**
     * Rooftop — flat with concrete pavers, planter boxes, maybe a fire pit.
     */
    static _rooftop(room, scene, materials) {
        const meshes = [];
        const pos = room.position || { x: 0, y: 0, z: 0 };

        const deck = BABYLON.MeshBuilder.CreateGround('terrain_roof', {
            width: room.width, height: room.depth, subdivisions: 4
        }, scene);
        deck.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);
        deck.material = materials.get('stone_paver');
        meshes.push(deck);

        // Low parapet wall around edges
        const wallThickness = 0.3;
        const wallHeight = 1.0;
        const sides = [
            { w: room.width, d: wallThickness, x: 0, z: -room.depth / 2 },
            { w: room.width, d: wallThickness, x: 0, z: room.depth / 2 },
            { w: wallThickness, d: room.depth, x: -room.width / 2, z: 0 },
            { w: wallThickness, d: room.depth, x: room.width / 2, z: 0 },
        ];
        sides.forEach((s, i) => {
            const wall = BABYLON.MeshBuilder.CreateBox(`parapet_${i}`, {
                width: s.w, height: wallHeight, depth: s.d
            }, scene);
            wall.position = new BABYLON.Vector3(
                pos.x + s.x, pos.y + wallHeight / 2, pos.z + s.z
            );
            wall.material = materials.get('polished_concrete');
            meshes.push(wall);
        });

        return meshes;
    }

    /**
     * Cliff — dramatic drop-off for cantilevered rooms.
     * Creates a cliff face mesh below the room's floor level.
     */
    static _cliff(room, scene, materials) {
        const meshes = [];
        const pos = room.position || { x: 0, y: 0, z: 0 };

        // Flat top platform
        const top = BABYLON.MeshBuilder.CreateGround('cliff_top', {
            width: room.width * 1.5, height: room.depth * 0.5, subdivisions: 8
        }, scene);
        top.position = new BABYLON.Vector3(pos.x, pos.y, pos.z - room.depth * 0.25);
        const rockMat = new BABYLON.PBRMaterial('mat_cliff_rock', scene);
        rockMat.albedoColor = new BABYLON.Color3(0.6, 0.58, 0.55);
        rockMat.roughness = 0.9;
        top.material = rockMat;
        meshes.push(top);

        // Cliff face — a tilted plane
        const face = BABYLON.MeshBuilder.CreateGround('cliff_face', {
            width: room.width * 1.5, height: 20, subdivisions: 16, updatable: true
        }, scene);
        face.rotation.x = Math.PI * 0.35; // Tilt to be nearly vertical
        face.position = new BABYLON.Vector3(
            pos.x, pos.y - 8, pos.z + room.depth * 0.5
        );
        face.material = materials.get('board_formed', { color: new BABYLON.Color3(0.55, 0.53, 0.50) });
        meshes.push(face);

        return meshes;
    }
}


// ═══════════════════════════════════════════════════════════════
// EXPANDED PRESETS (Frutiger Aero × Brutalist)
// ═══════════════════════════════════════════════════════════════

export const ModernPresets = {

    /**
     * LA Hilltop Mansion — the showcase level.
     * Multi-level brutalist home cascading down a hillside.
     * Board-formed concrete, floor-to-ceiling glass, cantilevered terraces.
     * 
     * Layout (side view):
     *    [Gallery]───[Atrium]───[Master Suite]     Floor 2
     *         │          │
     *    [Ramp]     [Void/2F]                      
     *         │          │
     *    [Entry]────[Living]────[Kitchen]           Floor 1
     *                    │          │
     *               [Terrace]  [Pool Deck]          Floor 0 (outdoor)
     *                    │
     *               [Hillside]
     */
    la_hilltop() {
        const g = new RoomGraph();

        // --- Floor 1: Main Living Level ---
        const entry    = g.addRoom('hallway', 'Entry',           { floorLevel: 1, depth: 10, windowWall: 'west', material: 'polished_concrete' });
        const living   = g.addRoom('large_room', 'Living Room',  { floorLevel: 1, width: 18, depth: 14, height: 5.5, windows: 0, material: 'board_formed' });
        const kitchen  = g.addRoom('room', 'Kitchen',            { floorLevel: 1, width: 12, depth: 10, material: 'polished_concrete', floorMaterial: 'terrazzo' });

        // --- Floor 2: Upper Level ---
        const rampUp   = g.addRoom('ramp', 'Upper Ramp',        { floorLevel: 1, windowWall: 'east' });
        const gallery  = g.addRoom('gallery', 'Gallery Walk',    { floorLevel: 2, depth: 24, windowWall: 'west' });
        const atrium   = g.addRoom('atrium', 'Central Atrium',   { floorLevel: 1, height: 12, spansFloors: 2 });
        const master   = g.addRoom('large_room', 'Master Suite', { floorLevel: 2, width: 16, depth: 12, material: 'wood_plank' });

        // --- Floor 0: Outdoor Lower Level ---
        const terrace  = g.addRoom('terrace', 'Main Terrace',    { floorLevel: 0, width: 18, depth: 8, openSides: ['south', 'west'] });
        const pool     = g.addRoom('pool_deck', 'Pool',          { floorLevel: 0, width: 22, depth: 16, terrain: 'hillside' });

        // --- Connections ---
        // Floor 1 horizontal
        g.connect(entry.id, living.id, 'south', 'north');
        g.connect(living.id, kitchen.id, 'east', 'west');
        g.connect(living.id, atrium.id, 'south', 'north');

        // Floor 1 → 2 vertical
        g.connect(entry.id, rampUp.id, 'east', 'west');
        g.connect(rampUp.id, gallery.id, 'south', 'north');
        g.connect(gallery.id, atrium.id, 'east', 'west');  // Gallery overlooks atrium
        g.connect(atrium.id, master.id, 'east', 'west');

        // Floor 1 → 0 (down to outdoor)
        g.connect(living.id, terrace.id, 'south', 'north');
        g.connect(kitchen.id, pool.id, 'south', 'north');

        return g;
    },

    /**
     * Concrete Tower — vertical brutalist monument.
     * A single tower with spiraling gallery ramps and glass walls.
     */
    concrete_tower() {
        const g = new RoomGraph();

        const base     = g.addRoom('atrium', 'Ground Atrium',  { floorLevel: 0, width: 14, depth: 14, height: 10, spansFloors: 2 });
        const ramp1    = g.addRoom('ramp', 'Ramp 1',           { floorLevel: 0, windowWall: 'both' });
        const gallery1 = g.addRoom('gallery', 'Gallery 1',     { floorLevel: 1, depth: 20, windowWall: 'both' });
        const ramp2    = g.addRoom('ramp', 'Ramp 2',           { floorLevel: 1, windowWall: 'both' });
        const gallery2 = g.addRoom('gallery', 'Gallery 2',     { floorLevel: 2, depth: 20, windowWall: 'both' });
        const ramp3    = g.addRoom('ramp', 'Ramp 3',           { floorLevel: 2, windowWall: 'both' });
        const obs      = g.addRoom('large_room', 'Observatory', { floorLevel: 3, width: 14, depth: 14, windows: 8, material: 'glass' });

        g.connect(base.id, ramp1.id, 'east', 'west');
        g.connect(ramp1.id, gallery1.id, 'south', 'north');
        g.connect(gallery1.id, ramp2.id, 'east', 'west');
        g.connect(ramp2.id, gallery2.id, 'south', 'north');
        g.connect(gallery2.id, ramp3.id, 'east', 'west');
        g.connect(ramp3.id, obs.id, 'south', 'north');

        return g;
    },

    /**
     * Cliffside Retreat — cantilevered over a cliff face.
     * Minimal rooms, maximum drama. Think Stahl House meets Tadao Ando.
     */
    cliffside() {
        const g = new RoomGraph();

        const approach = g.addRoom('loggia', 'Covered Approach', { floorLevel: 1, depth: 16, openSide: 'east' });
        const living   = g.addRoom('large_room', 'Living Space',  { floorLevel: 1, width: 16, depth: 12, material: 'board_formed' });
        const terrace  = g.addRoom('terrace', 'Infinity Terrace', { floorLevel: 1, width: 20, depth: 6, openSides: ['south', 'east', 'west'], terrain: 'cliff' });
        const stDown   = g.addRoom('staircase', 'Cliff Stairs',   { floorLevel: 1, style: 'cantilever' });
        const poolLvl  = g.addRoom('pool_deck', 'Infinity Pool',  { floorLevel: 0, width: 18, depth: 10, terrain: 'cliff' });
        const bedroom  = g.addRoom('room', 'Bedroom',             { floorLevel: 1, width: 10, depth: 10, material: 'wood_plank' });

        g.connect(approach.id, living.id, 'south', 'north');
        g.connect(living.id, terrace.id, 'south', 'north');
        g.connect(living.id, bedroom.id, 'east', 'west');
        g.connect(terrace.id, stDown.id, 'east', 'west');
        g.connect(stDown.id, poolLvl.id, 'south', 'north');

        return g;
    }
};


// ═══════════════════════════════════════════════════════════════
// EXPANDED DUNGEON LEVEL FACTORY
// ═══════════════════════════════════════════════════════════════
//
// Extends the original DungeonLevel to support the new material
// system, terrain generation, and modern presets.

export const ModernLevel = {

    /**
     * Create from a modern preset.
     * @param {string} presetName - 'la_hilltop' | 'concrete_tower' | 'cliffside'
     * @param {Object} options - { rays, skybox, materialOverrides }
     */
    create(presetName, options = {}) {
        const factory = ModernPresets[presetName];
        if (!factory) {
            console.warn(`Unknown preset "${presetName}", using la_hilltop`);
            return this.createFromGraph(ModernPresets.la_hilltop(), options);
        }
        return this.createFromGraph(factory(), options);
    },

    /**
     * Create from a custom RoomGraph using the modern material pipeline.
     */
    createFromGraph(graph, options = {}) {
        const opts = {
            rays: options.rays || 'extreme',
            skybox: options.skybox || 'golden_hour',   // LA afternoon light
            environmentIntensity: options.environmentIntensity || 1.2,
            ...options
        };

        let materials = null;
        let terrainMeshes = [];
        let startTime = 0;

        return {
            meta: {
                name: opts.levelName || 'Modern Level',
                description: `${graph.nodes.length} spaces across ${graph.getFloorCount()} levels`,
                style: 'frutiger_brutalist',
                version: '3.0.0'
            },

            terrain: null, // Handled per-room by TerrainGenerator

            playerStart: {
                x: 0,
                y: ((graph.nodes[0] || {}).floorLevel || 0) * 6 + 2,
                z: 0
            },

            async onLevelStart(engine) {
                console.log('🏗️ Building Modern Level v3...');
                startTime = performance.now();

                // Initialize procedural material system
                materials = new ProceduralMaterials(engine.scene);

                // Get builder class
                const BuilderClass = opts.BuilderClass || globalThis.DungeonBuilder;
                if (!BuilderClass) {
                    throw new Error('DungeonBuilder class not found');
                }

                const builder = new BuilderClass(
                    engine.scene, engine.havokPlugin, engine.shadowGenerator
                );

                // Modern atmosphere (no torches — use ambient + directional)
                this._setupModernLighting(engine.scene, opts);

                // Build rooms with material overrides
                graph.nodes.forEach(node => {
                    // Apply material from node config to the builder
                    if (node.material) {
                        node._resolvedMaterial = materials.get(node.material);
                    }
                    if (node.floorMaterial) {
                        node._resolvedFloorMaterial = materials.get(node.floorMaterial);
                    }
                });

                builder.buildFromGraph(graph, opts.rays, engine.camera);

                // Generate terrain for rooms that have it
                graph.nodes.forEach(node => {
                    if (node.terrain) {
                        const meshes = TerrainGenerator.generate(node, engine.scene, materials);
                        terrainMeshes.push(...meshes);
                    }
                    // Generate water planes for pool_deck rooms
                    if (node.waterBody) {
                        this._createWaterPlane(node, engine.scene, materials);
                    }
                });

                // Skybox for modern setting
                if (typeof createProceduralSkybox === 'function') {
                    createProceduralSkybox(engine.scene, opts.skybox);
                }

                // Camera settings for modern interiors (wider FOV, closer near plane)
                if (engine.camera) {
                    engine.camera.fov = BABYLON.Tools.ToRadians(75);
                    engine.camera.minZ = 0.1;
                    engine.camera.lowerRadiusLimit = 0.5;
                    engine.camera.upperRadiusLimit = 20;
                }

                const elapsed = (performance.now() - startTime).toFixed(0);
                console.log(`🏗️ Built: ${graph.nodes.length} spaces, ${graph.getFloorCount()} levels (${elapsed}ms)`);
            },

            _setupModernLighting(scene, opts) {
                // Hemisphere light for ambient fill (warm sky, cool ground)
                const hemi = new BABYLON.HemisphericLight(
                    'hemiLight', new BABYLON.Vector3(0, 1, 0), scene
                );
                hemi.intensity = 0.6;
                hemi.diffuse = new BABYLON.Color3(1.0, 0.95, 0.85);    // Warm
                hemi.groundColor = new BABYLON.Color3(0.4, 0.45, 0.5); // Cool bounce

                // Directional sun — golden hour angle
                const sun = new BABYLON.DirectionalLight(
                    'sunLight', new BABYLON.Vector3(-0.5, -0.8, 0.3), scene
                );
                sun.intensity = 1.4;
                sun.diffuse = new BABYLON.Color3(1.0, 0.92, 0.75); // Golden

                // Environment intensity for reflections (glass, steel, water)
                scene.environmentIntensity = opts.environmentIntensity || 1.2;
            },

            _createWaterPlane(node, scene, materials) {
                const wb = node.waterBody;
                const pos = node.position || { x: 0, y: 0, z: 0 };

                const waterMesh = BABYLON.MeshBuilder.CreateGround('water_plane', {
                    width: wb.width, height: wb.depth, subdivisions: 16
                }, scene);
                waterMesh.position = new BABYLON.Vector3(
                    pos.x + (wb.offsetX || 0),
                    pos.y + 0.05, // Slightly above ground
                    pos.z + (wb.offsetZ || 0)
                );
                waterMesh.material = materials.get('water');
            },

            onUpdate(engine) {
                // Animate water ripples (if any water materials exist)
                const elapsed = performance.now() - startTime;
                // Water normal animation would go here via shader uniform update
            },

            dispose() {
                terrainMeshes.forEach(m => m.dispose());
                terrainMeshes = [];
                materials = null;
            }
        };
    }
};
