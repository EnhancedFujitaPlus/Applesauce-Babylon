/**
 * APPLESAUCE Room Graph System
 * ═══════════════════════════════════════════════════════════════
 * 
 * A directed graph that connects rooms of different types.
 * Each node is a room, each edge is a connection (doorway).
 * The graph auto-calculates world positions via layout().
 * 
 * ROOM TYPES:
 *   hallway    — Narrow corridor, torches on walls
 *   room       — Standard stone room
 *   large_room — Higher ceilings, more windows
 *   courtyard  — Open top (no ceiling), battlements
 *   staircase  — Connects two Y levels (floorLevel 0→1, etc.)
 * 
 * VERTICALITY:
 *   Set floorLevel on any room. Each floor = 6 world units of Y.
 *   Staircases automatically generate steps between connected floors.
 *   The graph supports going DOWN too (negative floorLevel for dungeons).
 * 
 * USAGE:
 *   import { RoomGraph, DungeonLevel } from './applesauce-room-graph.js';
 * 
 *   // Option A: Use a preset layout
 *   const level = DungeonLevel.create('castle_keep', { rays: 'extreme', skybox: 'dawn' });
 *   await engine.loadLevel(level);
 * 
 *   // Option B: Build a custom layout
 *   const graph = new RoomGraph();
 *   const hall = graph.addRoom('hallway', 'Entry Hall');
 *   const throne = graph.addRoom('large_room', 'Throne Room', { floorLevel: 0 });
 *   const stairs = graph.addRoom('staircase', 'Tower Stairs', { floorLevel: 0 });
 *   const tower = graph.addRoom('room', 'Tower Top', { floorLevel: 1, windows: 3 });
 * 
 *   graph.connect(hall.id, throne.id, 'south', 'north');
 *   graph.connect(throne.id, stairs.id, 'east', 'west');
 *   graph.connect(stairs.id, tower.id, 'south', 'north');
 * 
 *   const level = DungeonLevel.createFromGraph(graph, { rays: 'extreme' });
 *   await engine.loadLevel(level);
 * 
 * CONNECTION WALLS:
 *   'north' = -Z side
 *   'south' = +Z side
 *   'east'  = +X side
 *   'west'  = -X side
 * 
 *   connect(A, B, 'south', 'north') means:
 *   "A's south wall connects to B's north wall"
 *   → B is placed south of A
 * 
 * ═══════════════════════════════════════════════════════════════
 */

export class RoomGraph {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this._nextId = 0;
    }

    /**
     * Add a room to the graph.
     * 
     * @param {string} type - 'hallway' | 'room' | 'large_room' | 'courtyard' | 'staircase'
     * @param {string} label - Display name (shown in HUD)
     * @param {Object} opts - Override defaults: width, depth, height, windows, torchCount, floorLevel
     * @returns {Object} The created node (use node.id for connect())
     */
    addRoom(type, label, opts = {}) {
        const defaults = RoomGraph.DEFAULTS[type] || RoomGraph.DEFAULTS.room;
        const node = {
            id: this._nextId++,
            type,
            label: label || type,
            width: opts.width || defaults.width,
            depth: opts.depth || defaults.depth,
            height: opts.height || defaults.height,
            windows: opts.windows !== undefined ? opts.windows : defaults.windows,
            torchCount: opts.torchCount !== undefined ? opts.torchCount : defaults.torchCount,
            openTop: type === 'courtyard',
            floorLevel: opts.floorLevel || 0,
            position: null, // Set by layout()
            ...opts
        };
        this.nodes.push(node);
        return node;
    }

    /**
     * Connect two rooms via a doorway.
     * 
     * @param {number} fromId - Source room ID
     * @param {number} toId - Target room ID
     * @param {string} fromWall - Which wall of source room: 'north'|'south'|'east'|'west'
     * @param {string} toWall - Which wall of target room connects back
     */
    connect(fromId, toId, fromWall = 'south', toWall = 'north') {
        this.edges.push({ from: fromId, to: toId, fromWall, toWall });
    }

    /**
     * Calculate world positions for all rooms by BFS-walking the graph.
     * First room is placed at its floorLevel Y, (0, 0) XZ.
     */
    layout() {
        if (this.nodes.length === 0) return;

        const placed = new Set();
        const queue = [];
        const wt = 0.8; // wall thickness
        const FLOOR_HEIGHT = 6;

        this.nodes[0].position = {
            x: 0,
            y: (this.nodes[0].floorLevel || 0) * FLOOR_HEIGHT,
            z: 0
        };
        placed.add(this.nodes[0].id);
        queue.push(this.nodes[0]);

        while (queue.length > 0) {
            const current = queue.shift();

            const processEdge = (edge, isOutgoing) => {
                const otherId = isOutgoing ? edge.to : edge.from;
                if (placed.has(otherId)) return;

                const target = this.nodes.find(n => n.id === otherId);
                if (!target) return;

                const parentWall = isOutgoing ? edge.fromWall : edge.toWall;
                const childWall = isOutgoing ? edge.toWall : edge.fromWall;

                target.position = this._calcPosition(current, target, parentWall, childWall, wt, FLOOR_HEIGHT);
                placed.add(target.id);
                queue.push(target);
            };

            this.edges.filter(e => e.from === current.id).forEach(e => processEdge(e, true));
            this.edges.filter(e => e.to === current.id).forEach(e => processEdge(e, false));
        }
    }

    _calcPosition(parent, child, parentWall, childWall, wt, floorH) {
        const px = parent.position.x;
        const pz = parent.position.z;
        const cy = (child.floorLevel || 0) * floorH;
        const gap = wt * 2;

        let x = px, z = pz;

        switch (parentWall) {
            case 'south': z = pz + parent.depth / 2 + child.depth / 2 + gap; break;
            case 'north': z = pz - parent.depth / 2 - child.depth / 2 - gap; break;
            case 'east':  x = px + parent.width / 2 + child.width / 2 + gap; break;
            case 'west':  x = px - parent.width / 2 - child.width / 2 - gap; break;
        }

        return { x, y: cy, z };
    }

    /**
     * Get total floor count across all rooms
     */
    getFloorCount() {
        const levels = this.nodes.map(n => n.floorLevel || 0);
        return Math.max(...levels) - Math.min(...levels) + 1;
    }

    /**
     * Get the lowest floor level (for catacombs going underground)
     */
    getMinFloor() {
        return Math.min(...this.nodes.map(n => n.floorLevel || 0));
    }
}

// Default room dimensions by type
RoomGraph.DEFAULTS = {
    hallway:    { width: 4,  depth: 12, height: 4,   windows: 0, torchCount: 2 },
    room:       { width: 14, depth: 10, height: 5.5, windows: 1, torchCount: 4 },
    large_room: { width: 22, depth: 16, height: 7,   windows: 3, torchCount: 6 },
    courtyard:  { width: 20, depth: 20, height: 8,   windows: 0, torchCount: 4 },
    staircase:  { width: 5,  depth: 14, height: 5,   windows: 1, torchCount: 2 }
};


// ═══════════════════════════════════════════════════════════════
// PRESET LAYOUTS
// ═══════════════════════════════════════════════════════════════

export const Presets = {

    castle_keep() {
        const g = new RoomGraph();
        const entrance  = g.addRoom('hallway',    'Entrance Hall',    { floorLevel: 0 });
        const greatHall = g.addRoom('large_room', 'Great Hall',       { floorLevel: 0, windows: 4 });
        const courtyard = g.addRoom('courtyard',  'Inner Courtyard',  { floorLevel: 0 });
        const armory    = g.addRoom('room',       'Armory',           { floorLevel: 0, windows: 1 });
        const stairsUp  = g.addRoom('staircase',  'Spiral Staircase', { floorLevel: 0 });
        const gallery   = g.addRoom('hallway',    'Upper Gallery',    { floorLevel: 1, depth: 16 });
        const throneRm  = g.addRoom('large_room', 'Throne Room',      { floorLevel: 1, windows: 4 });
        const stairs2   = g.addRoom('staircase',  'Tower Stairs',     { floorLevel: 1 });
        const tower     = g.addRoom('room',       'Tower Chamber',    { floorLevel: 2, windows: 3 });

        g.connect(entrance.id, greatHall.id, 'south', 'north');
        g.connect(greatHall.id, courtyard.id, 'south', 'north');
        g.connect(greatHall.id, armory.id, 'east', 'west');
        g.connect(courtyard.id, stairsUp.id, 'east', 'west');
        g.connect(stairsUp.id, gallery.id, 'south', 'north');
        g.connect(gallery.id, throneRm.id, 'south', 'north');
        g.connect(throneRm.id, stairs2.id, 'east', 'west');
        g.connect(stairs2.id, tower.id, 'south', 'north');
        return g;
    },

    tower() {
        const g = new RoomGraph();
        const base    = g.addRoom('room',       'Base Chamber',   { floorLevel: 0, windows: 2 });
        const stairs1 = g.addRoom('staircase',  'Stone Stairs',   { floorLevel: 0 });
        const mid     = g.addRoom('room',       'Guard Room',     { floorLevel: 1, windows: 2 });
        const stairs2 = g.addRoom('staircase',  'Winding Stairs', { floorLevel: 1 });
        const top     = g.addRoom('large_room', 'Observatory',    { floorLevel: 2, windows: 4 });

        g.connect(base.id, stairs1.id, 'south', 'north');
        g.connect(stairs1.id, mid.id, 'south', 'north');
        g.connect(mid.id, stairs2.id, 'south', 'north');
        g.connect(stairs2.id, top.id, 'south', 'north');
        return g;
    },

    catacombs() {
        const g = new RoomGraph();
        const entry   = g.addRoom('hallway',    'Descent',        { floorLevel: 0 });
        const crypt1  = g.addRoom('room',       'Outer Crypt',    { floorLevel: 0 });
        const hall    = g.addRoom('hallway',    'Bone Corridor',  { floorLevel: 0, depth: 16 });
        const chamber = g.addRoom('large_room', 'Burial Chamber', { floorLevel: 0, windows: 0 });
        const stDown  = g.addRoom('staircase',  'Deep Stairs',    { floorLevel: 0 });
        const depths  = g.addRoom('room',       'The Depths',     { floorLevel: -1, windows: 0 });
        const vault   = g.addRoom('large_room', 'Ancient Vault',  { floorLevel: -1, windows: 0 });

        g.connect(entry.id, crypt1.id, 'south', 'north');
        g.connect(crypt1.id, hall.id, 'south', 'north');
        g.connect(hall.id, chamber.id, 'south', 'north');
        g.connect(chamber.id, stDown.id, 'east', 'west');
        g.connect(stDown.id, depths.id, 'south', 'north');
        g.connect(depths.id, vault.id, 'south', 'north');
        return g;
    }
};


// ═══════════════════════════════════════════════════════════════
// DUNGEON LEVEL FACTORY (plugs into ApplesauceCore.loadLevel)
// ═══════════════════════════════════════════════════════════════

export const DungeonLevel = {

    /**
     * Create a level config from a preset name.
     * 
     * @param {string} presetName - 'castle_keep' | 'tower' | 'catacombs'
     * @param {Object} options - { rays: 'extreme'|'medium'|'off', skybox: 'dawn'|'dusk'|'night'|'overcast' }
     * @returns {Object} levelConfig for ApplesauceCore.loadLevel()
     */
    create(presetName, options = {}) {
        const graphFactory = Presets[presetName];
        if (!graphFactory) {
            console.warn(`Unknown preset "${presetName}", using castle_keep`);
            return this.createFromGraph(Presets.castle_keep(), options);
        }
        return this.createFromGraph(graphFactory(), options);
    },

    /**
     * Create a level config from a custom RoomGraph.
     * 
     * @param {RoomGraph} graph - Your custom room graph
     * @param {Object} options - { rays, skybox }
     * @returns {Object} levelConfig for ApplesauceCore.loadLevel()
     */
    createFromGraph(graph, options = {}) {
        const opts = {
            rays: options.rays || 'extreme',
            skybox: options.skybox || 'dawn',
            ...options
        };

        let dungeonBuilder = null;
        let startTime = 0;

        return {
            meta: {
                name: 'Castle Dungeon',
                description: `${graph.nodes.length} rooms across ${graph.getFloorCount()} floors`,
                version: '2.0.0'
            },

            // No terrain — using skybox instead for performance
            terrain: null,

            playerStart: {
                x: 0,
                y: ((graph.nodes[0] || {}).floorLevel || 0) * 6 + 2,
                z: 0
            },

            async onLevelStart(engine) {
                console.log('🏰 Building Castle Dungeon v2...');
                startTime = performance.now();

                // NOTE: DungeonBuilder should be imported alongside this module.
                // In the standalone HTML demo it's inlined; in your project you'd
                // import { DungeonBuilder } from './dungeon-builder.js';
                // For now, this hook expects DungeonBuilder to be globally available
                // or passed via options.BuilderClass

                const BuilderClass = opts.BuilderClass || globalThis.DungeonBuilder;
                if (!BuilderClass) {
                    throw new Error('DungeonBuilder class not found. Import it or pass via options.BuilderClass');
                }

                dungeonBuilder = new BuilderClass(
                    engine.scene, engine.havokPlugin, engine.shadowGenerator
                );

                dungeonBuilder.setupAtmosphere(engine.scene);
                dungeonBuilder.buildFromGraph(graph, opts.rays, engine.camera);

                // Skybox (if createProceduralSkybox is available)
                if (typeof createProceduralSkybox === 'function') {
                    createProceduralSkybox(engine.scene, opts.skybox);
                }

                // Camera for interiors
                if (engine.camera) {
                    engine.camera.lowerRadiusLimit = 1;
                    engine.camera.upperRadiusLimit = 14;
                    engine.camera.lowerBetaLimit = BABYLON.Tools.ToRadians(20);
                    engine.camera.upperBetaLimit = BABYLON.Tools.ToRadians(85);
                }

                console.log(`🏰 Built: ${graph.nodes.length} rooms, ${graph.getFloorCount()} floors`);
            },

            onUpdate(engine) {
                if (dungeonBuilder) {
                    dungeonBuilder.update(performance.now() - startTime);
                }
            },

            dispose() {
                if (dungeonBuilder) {
                    dungeonBuilder.dispose();
                    dungeonBuilder = null;
                }
            }
        };
    }
};
