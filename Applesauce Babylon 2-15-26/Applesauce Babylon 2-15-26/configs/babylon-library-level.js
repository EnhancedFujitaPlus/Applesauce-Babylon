/**
 * APPLESAUCE - THE LIBRARY LEVEL
 * 
 * A grand procedural library representing the merge of old ideas (Three.js)
 * into new ones (Babylon.js). The world became meshed through time.
 * 
 * This level uses Babylon.js 8's procedural texture system to create
 * a vast, atmospheric library without external texture files.
 * 
 * PROCEDURAL TEXTURES AVAILABLE IN BABYLON:
 * - WoodProceduralTexture (bookshelves, floors)
 * - MarbleProceduralTexture (pillars, walls)
 * - BrickProceduralTexture (walls)
 * - CloudProceduralTexture (atmospheric effects)
 * - GrassProceduralTexture (if we want exterior areas)
 * - FireProceduralTexture (torches, atmosphere)
 * - Custom noise-based textures
 */

export class LibraryLevel {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        
        // Library components
        this.floor = null;
        this.walls = [];
        this.pillars = [];
        this.bookshelves = [];
        this.books = [];
        this.ceiling = null;
        
        // Procedural materials cache
        this.materials = {
            wood: null,
            darkWood: null,
            marble: null,
            brick: null,
            paper: null,
            leather: null
        };
        
        // Library dimensions
        this.config = {
            width: 150,      // Massive library
            depth: 200,      
            height: 25,      // Cathedral-like ceiling
            shelfHeight: 12, // Tall bookshelves
            aisleWidth: 6,   // Wide aisles for skateboarding
            numRows: 8,      // Rows of shelves
            numCols: 12      // Columns of shelves
        };
        
        console.log('📚 Library Level initialized - Procedural textures ready');
    }
    
    // ===================================
    // MAIN BUILD METHOD
    // ===================================
    
    /**
     * Build the entire library
     */
    build(config = {}) {
        console.log('📚 Building The Grand Library...');
        
        // Override defaults with config
        Object.assign(this.config, config);
        
        // Create all procedural materials first
        this.createProceduralMaterials();
        
        // Build library components
        this.buildFloor();
        this.buildWalls();
        this.buildPillars();
        this.buildCeiling();
        this.buildBookshelves();
        this.addAtmosphere();
        
        console.log('✅ The Grand Library has been built');
        console.log(`   📐 Dimensions: ${this.config.width}x${this.config.depth}x${this.config.height}`);
        console.log(`   📚 Bookshelves: ${this.bookshelves.length}`);
        console.log(`   🏛️ Pillars: ${this.pillars.length}`);
    }
    
    // ===================================
    // PROCEDURAL MATERIALS
    // ===================================
    
    /**
     * Create all procedural materials
     * This is where the magic happens - no texture files needed!
     */
    createProceduralMaterials() {
        console.log('🎨 Creating procedural materials...');
        
        // WOOD TEXTURE - for bookshelves and floors
        const woodTexture = new BABYLON.WoodProceduralTexture("woodTexture", 512, this.scene);
        woodTexture.woodColor = new BABYLON.Color3(0.4, 0.25, 0.15); // Rich brown
        woodTexture.ampScale = 80.0; // Grain intensity
        
        this.materials.wood = new BABYLON.StandardMaterial("woodMat", this.scene);
        this.materials.wood.diffuseTexture = woodTexture;
        this.materials.wood.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        this.materials.wood.ambientColor = new BABYLON.Color3(0.3, 0.2, 0.15);
        
        // DARK WOOD - for contrast
        const darkWoodTexture = new BABYLON.WoodProceduralTexture("darkWoodTexture", 512, this.scene);
        darkWoodTexture.woodColor = new BABYLON.Color3(0.2, 0.12, 0.08);
        darkWoodTexture.ampScale = 100.0;
        
        this.materials.darkWood = new BABYLON.StandardMaterial("darkWoodMat", this.scene);
        this.materials.darkWood.diffuseTexture = darkWoodTexture;
        this.materials.darkWood.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        
        // MARBLE TEXTURE - for pillars and grand features
        const marbleTexture = new BABYLON.MarbleProceduralTexture("marbleTexture", 512, this.scene);
        marbleTexture.numberOfTilesHeight = 3;
        marbleTexture.numberOfTilesWidth = 3;
        marbleTexture.jointColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        
        this.materials.marble = new BABYLON.StandardMaterial("marbleMat", this.scene);
        this.materials.marble.diffuseTexture = marbleTexture;
        this.materials.marble.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        this.materials.marble.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        // BRICK TEXTURE - for walls
        const brickTexture = new BABYLON.BrickProceduralTexture("brickTexture", 512, this.scene);
        brickTexture.numberOfBricksHeight = 6;
        brickTexture.numberOfBricksWidth = 8;
        brickTexture.brickColor = new BABYLON.Color3(0.4, 0.3, 0.25); // Old library brick
        brickTexture.jointColor = new BABYLON.Color3(0.3, 0.25, 0.2);
        
        this.materials.brick = new BABYLON.StandardMaterial("brickMat", this.scene);
        this.materials.brick.diffuseTexture = brickTexture;
        this.materials.brick.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        
        // PAPER/PARCHMENT - for books (using custom procedural)
        this.materials.paper = this.createPaperMaterial();
        
        // LEATHER - for book spines (using simple color)
        this.materials.leather = new BABYLON.StandardMaterial("leatherMat", this.scene);
        this.materials.leather.diffuseColor = new BABYLON.Color3(0.3, 0.15, 0.1);
        this.materials.leather.specularColor = new BABYLON.Color3(0.2, 0.15, 0.1);
        this.materials.leather.roughness = 0.9;
        
        console.log('   ✅ All procedural materials created');
    }
    
    /**
     * Create custom paper material using noise
     */
    createPaperMaterial() {
        const paperMat = new BABYLON.StandardMaterial("paperMat", this.scene);
        
        // Use CustomProceduralTexture for paper-like noise
        const paperTexture = new BABYLON.CustomProceduralTexture(
            "paperTexture",
            "./paperShader", // We'll need to define this, or use a simple approach
            512,
            this.scene
        );
        
        // Fallback: simple beige color if shader not available
        paperMat.diffuseColor = new BABYLON.Color3(0.95, 0.92, 0.85);
        paperMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        paperMat.roughness = 0.95;
        
        return paperMat;
    }
    
    // ===================================
    // FLOOR
    // ===================================
    
    buildFloor() {
        console.log('   🪵 Building floor...');
        
        const floor = BABYLON.MeshBuilder.CreateGround(
            "libraryFloor",
            { 
                width: this.config.width, 
                height: this.config.depth,
                subdivisions: 10
            },
            this.scene
        );
        
        floor.position.y = 0;
        floor.material = this.materials.darkWood;
        floor.receiveShadows = true;
        
        // Add physics
        const floorAggregate = new BABYLON.PhysicsAggregate(
            floor,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 0, friction: 0.8 },
            this.scene
        );
        
        this.floor = floor;
        
        // Add decorative rug in center using a simple pattern
        this.addCenterRug();
    }
    
    addCenterRug() {
        const rug = BABYLON.MeshBuilder.CreateGround(
            "centerRug",
            { width: 40, height: 60, subdivisions: 1 },
            this.scene
        );
        
        rug.position.y = 0.05; // Slightly above floor
        
        // Create patterned material for rug
        const rugMat = new BABYLON.StandardMaterial("rugMat", this.scene);
        rugMat.diffuseColor = new BABYLON.Color3(0.5, 0.1, 0.15); // Deep red
        rugMat.specularColor = new BABYLON.Color3(0.1, 0.05, 0.05);

        const noiseTexture = new BABYLON.NoiseProceduralTexture("perlin", 256, this.scene);
        
        rug.material = rugMat;
    }
    
    // ===================================
    // WALLS
    // ===================================
    
    buildWalls() {
        console.log('   🧱 Building walls...');
        
        const wallHeight = this.config.height;
        const wallThickness = 2;
        
        // North wall
        const northWall = BABYLON.MeshBuilder.CreateBox(
            "northWall",
            { 
                width: this.config.width, 
                height: wallHeight, 
                depth: wallThickness 
            },
            this.scene
        );
        northWall.position = new BABYLON.Vector3(
            0, 
            wallHeight / 2, 
            this.config.depth / 2
        );
        northWall.material = this.materials.brick;
        northWall.receiveShadows = true;
        
        // South wall
        const southWall = northWall.clone("southWall");
        southWall.position.z = -this.config.depth / 2;
        
        // East wall
        const eastWall = BABYLON.MeshBuilder.CreateBox(
            "eastWall",
            { 
                width: wallThickness, 
                height: wallHeight, 
                depth: this.config.depth 
            },
            this.scene
        );
        eastWall.position = new BABYLON.Vector3(
            this.config.width / 2, 
            wallHeight / 2, 
            0
        );
        eastWall.material = this.materials.brick;
        eastWall.receiveShadows = true;
        
        // West wall
        const westWall = eastWall.clone("westWall");
        westWall.position.x = -this.config.width / 2;
        
        this.walls = [northWall, southWall, eastWall, westWall];
        
        // Add physics to walls
        this.walls.forEach(wall => {
            new BABYLON.PhysicsAggregate(
                wall,
                BABYLON.PhysicsShapeType.BOX,
                { mass: 0 },
                this.scene
            );
        });
    }
    
    // ===================================
    // PILLARS
    // ===================================
    
    buildPillars() {
        console.log('   🏛️ Building marble pillars...');
        
        const pillarRadius = 1.5;
        const pillarHeight = this.config.height - 20;
        const spacing = 25; // Distance between pillars
        
        // Create pillars in a grid pattern
        for (let x = -this.config.width / 2 + spacing; x < this.config.width / 2; x += spacing) {
            for (let z = -this.config.depth / 2 + spacing; z < this.config.depth / 2; z += spacing) {
                const pillar = BABYLON.MeshBuilder.CreateCylinder(
                    `pillar_${this.pillars.length}`,
                    {
                        height: pillarHeight,
                        diameter: pillarRadius * 2,
                        tessellation: 16
                    },
                    this.scene
                );
                
                pillar.position = new BABYLON.Vector3(x, pillarHeight / 2, z);
                pillar.material = this.materials.marble;
                pillar.receiveShadows = true;
                pillar.castShadow = true;
                
                // Add ornate capital (top)
                const capital = BABYLON.MeshBuilder.CreateCylinder(
                    `capital_${this.pillars.length}`,
                    {
                        height: 1,
                        diameterTop: pillarRadius * 3,
                        diameterBottom: pillarRadius * 2,
                        tessellation: 16
                    },
                    this.scene
                );
                capital.position = new BABYLON.Vector3(
                    x, 
                    pillarHeight - 0.5, 
                    z
                );
                capital.material = this.materials.marble;
                capital.parent = pillar;
                
                // Add physics
                new BABYLON.PhysicsAggregate(
                    pillar,
                    BABYLON.PhysicsShapeType.CYLINDER,
                    { mass: 0 },
                    this.scene
                );
                
                this.pillars.push(pillar);
            }
        }
        
        console.log(`   ✅ Created ${this.pillars.length} pillars`);
    }
    
    // ===================================
    // CEILING
    // ===================================
    
    buildCeiling() {
        console.log('   🏛️ Building vaulted ceiling...');
        
        const ceiling = BABYLON.MeshBuilder.CreateGround(
            "ceiling",
            { 
                width: this.config.width, 
                height: this.config.depth,
                subdivisions: 1
            },
            this.scene
        );
        
        ceiling.position.y = this.config.height;
        ceiling.rotation.z = Math.PI; // Flip it
        
        // Dark stone material
        const ceilingMat = new BABYLON.StandardMaterial("ceilingMat", this.scene);
        ceilingMat.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.27);
        ceilingMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        ceiling.material = ceilingMat;
        
        this.ceiling = ceiling;
    }
    
    // ===================================
    // BOOKSHELVES
    // ===================================
    
    buildBookshelves() {
        console.log('   📚 Building bookshelves...');
        
        const shelfWidth = 8;
        const shelfDepth = 1.5;
        const shelfHeight = this.config.shelfHeight;
        const numShelves = 6; // Shelves per bookcase
        
        const startX = -this.config.width / 2 + 10;
        const startZ = -this.config.depth / 2 + 10;
        const spacing = shelfWidth + this.config.aisleWidth;
        
        // Create rows of bookshelves
        for (let row = 0; row < this.config.numRows; row++) {
            for (let col = 0; col < this.config.numCols; col++) {
                const x = startX + (col * spacing);
                const z = startZ + (row * spacing);
                
                // Skip center area (boss battle space)
                const distFromCenter = Math.sqrt(x * x + z * z);
                if (distFromCenter < 30) continue;
                
                this.createBookshelf(x, z, shelfWidth, shelfDepth, shelfHeight, numShelves);
            }
        }
        
        console.log(`   ✅ Created ${this.bookshelves.length} bookshelves`);
    }
    
    /**
     * Create a single bookshelf unit with books
     */
    createBookshelf(x, z, width, depth, height, numShelves) {
        // Main frame
        const frame = BABYLON.MeshBuilder.CreateBox(
            `shelf_frame_${this.bookshelves.length}`,
            { width: width, height: height, depth: depth },
            this.scene
        );
        
        frame.position = new BABYLON.Vector3(x, height / 2, z);
        frame.material = this.materials.wood;
        frame.receiveShadows = true;
        frame.castShadow = true;
        
        // Add physics
        new BABYLON.PhysicsAggregate(
            frame,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 0 },
            this.scene
        );
        
        // Create individual shelves
        const shelfSpacing = height / (numShelves + 1);
        
        for (let i = 1; i <= numShelves; i++) {
            const shelf = BABYLON.MeshBuilder.CreateBox(
                `shelf_${this.bookshelves.length}_${i}`,
                { width: width - 0.2, height: 0.1, depth: depth - 0.2 },
                this.scene
            );
            
            shelf.position = new BABYLON.Vector3(
                x,
                i * shelfSpacing,
                z
            );
            shelf.material = this.materials.darkWood;
            shelf.parent = frame;
            
            // Add books to this shelf
            this.addBooksToShelf(shelf, width - 0.4, depth - 0.4);
        }
        
        this.bookshelves.push(frame);
    }
    
    /**
     * Add procedural books to a shelf
     */
    addBooksToShelf(shelf, availableWidth, depth) {
        const numBooks = Math.floor(availableWidth / 0.6); // Books are ~0.6 wide
        const bookHeight = Math.random() * 0.8 + 0.4; // Vary height
        
        for (let i = 0; i < numBooks; i++) {
            const bookWidth = Math.random() * 0.3 + 0.3;
            const bookDepth = depth * 0.8;
            const thisBookHeight = bookHeight + (Math.random() - 0.5) * 0.3;
            
            const book = BABYLON.MeshBuilder.CreateBox(
                `book_${this.books.length}`,
                { 
                    width: bookWidth, 
                    height: thisBookHeight, 
                    depth: bookDepth 
                },
                this.scene
            );
            
            // Position on shelf
            const offsetX = (i - numBooks / 2) * (bookWidth + 0.05);
            book.position = new BABYLON.Vector3(
                shelf.position.x + offsetX,
                shelf.position.y + thisBookHeight / 2 + 0.1,
                shelf.position.z
            );
            
            // Random rotation for realism
            book.rotation.y = (Math.random() - 0.5) * 0.2;
            
            // Random book color (leather spines)
            const bookMat = new BABYLON.StandardMaterial(`bookMat_${this.books.length}`, this.scene);
            const hue = Math.random();
            if (hue < 0.3) {
                bookMat.diffuseColor = new BABYLON.Color3(0.3, 0.15, 0.1); // Brown
            } else if (hue < 0.6) {
                bookMat.diffuseColor = new BABYLON.Color3(0.1, 0.2, 0.3); // Blue
            } else {
                bookMat.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.15); // Green
            }
            bookMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            
            book.material = bookMat;
            book.parent = shelf;
            
            this.books.push(book);
        }
    }
    
    // ===================================
    // ATMOSPHERE
    // ===================================
    
    addAtmosphere() {
        console.log('   ✨ Adding atmosphere...');
        
        // Fog for depth
        this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        this.scene.fogColor = new BABYLON.Color3(0.15, 0.15, 0.17);
        this.scene.fogStart = 50;
        this.scene.fogEnd = 150;
        
        // Ambient light - dim library lighting
        const ambientLight = new BABYLON.HemisphericLight(
            "ambient",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.3;
        ambientLight.diffuse = new BABYLON.Color3(0.7, 0.7, 0.8);
        ambientLight.groundColor = new BABYLON.Color3(0.3, 0.25, 0.2);
        
        // Add point lights near pillars
        const lightPositions = [
            { x: -40, z: -60 },
            { x: 40, z: -60 },
            { x: -40, z: 60 },
            { x: 40, z: 60 },
            { x: 0, z: 0 } // Center light
        ];
        
        lightPositions.forEach((pos, i) => {
            const light = new BABYLON.PointLight(
                `pillarLight_${i}`,
                new BABYLON.Vector3(pos.x, 8, pos.z),
                this.scene
            );
            light.intensity = 0.5;
            light.diffuse = new BABYLON.Color3(1.0, 0.9, 0.7); // Warm light
            light.range = 40;
            
            // Optional: Add visible sphere for light source
            const lightSphere = BABYLON.MeshBuilder.CreateSphere(
                `lightSphere_${i}`,
                { diameter: 0.5 },
                this.scene
            );
            lightSphere.position = light.position.clone();
            
            const emissiveMat = new BABYLON.StandardMaterial(`lightMat_${i}`, this.scene);
            emissiveMat.emissiveColor = new BABYLON.Color3(1, 0.9, 0.7);
            lightSphere.material = emissiveMat;
        });
        
        console.log('   ✅ Atmosphere added - fog, lighting');
    }
    
    // ===================================
    // BOSS BATTLE PREP
    // ===================================
    
    /**
     * Get the center arena position (for boss spawn)
     */
    getArenaCenter() {
        return new BABYLON.Vector3(0, 0, 0);
    }
    
    /**
     * Clear center area for boss battle
     */
    clearCenterArena(radius = 30) {
        console.log(`   🎯 Clearing center arena (radius: ${radius})`);
        
        // Remove any bookshelves in the center
        this.bookshelves = this.bookshelves.filter(shelf => {
            const dist = Math.sqrt(
                shelf.position.x * shelf.position.x + 
                shelf.position.z * shelf.position.z
            );
            
            if (dist < radius) {
                shelf.dispose();
                return false;
            }
            return true;
        });
    }
    
    // ===================================
    // UTILITY
    // ===================================
    
    /**
     * Get random spawn point in an aisle
     */
    getRandomSpawnPoint() {
        const x = (Math.random() - 0.5) * this.config.width * 0.8;
        const z = (Math.random() - 0.5) * this.config.depth * 0.8;
        const y = 5; // Above ground
        
        return new BABYLON.Vector3(x, y, z);
    }
    
    /**
     * Dispose of entire library
     */
    dispose() {
        console.log('📚 Disposing library...');
        
        if (this.floor) this.floor.dispose();
        this.walls.forEach(w => w.dispose());
        this.pillars.forEach(p => p.dispose());
        this.bookshelves.forEach(s => s.dispose());
        this.books.forEach(b => b.dispose());
        if (this.ceiling) this.ceiling.dispose();
        
        // Dispose materials
        Object.values(this.materials).forEach(mat => {
            if (mat) mat.dispose();
        });
        
        console.log('   ✅ Library disposed');
    }
}
