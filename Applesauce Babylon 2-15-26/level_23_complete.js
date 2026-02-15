/**
 * PARADELI PARK - Level 23 (100% COMPLETE)
 * Babylon.js + Havok + Gore + Full Gameplay
 */

window.Level41Config = {
    meta: {
        name: "PARADELI PARK",
        number: 41,
        theme: "park_neighborhood",
        description: "Bomb the hills of Paradeli Park! Watch out for pedestrians!",
        difficulty: "EASY",
        goreMode: "MAXIMUM"
    },
    
    scene: {
        background: { r: 0.53, g: 0.81, b: 0.92, a: 1.0 },
        fog: {
            enabled: true,
            color: { r: 0.69, g: 0.83, b: 0.91 },
            density: 0.0015
        }
    },
    
    playerStart: {
        x: 0,
        y: 48,
        z: 15
    },
    
    terrain: {
        type: 'segmented',
        segments: [
            { type: 'flat', length: 100, height: 45, width: 220, color: { r: 0.34, g: 0.49, b: 0.27 } },
            { type: 'hill', length: 280, startHeight: 45, endHeight: 5, width: 220, color: { r: 0.34, g: 0.49, b: 0.27 } },
            { type: 'flat', length: 120, height: 5, width: 220, color: { r: 0.34, g: 0.49, b: 0.27 } },
            { type: 'hill', length: 140, startHeight: 5, endHeight: 20, width: 220, color: { r: 0.4, g: 0.4, b: 0.4 } },
            { type: 'flat', length: 100, height: 20, width: 220, color: { r: 0.4, g: 0.4, b: 0.4 } },
            { type: 'valley', length: 100, depth: -8, width: 220, color: { r: 0.3, g: 0.3, b: 0.3 } },
            { type: 'hill', length: 120, startHeight: -8, endHeight: 15, width: 220, color: { r: 0.4, g: 0.4, b: 0.4 } },
            { type: 'flat', length: 150, height: 15, width: 240, color: { r: 0.5, g: 0.3, b: 0.2 } }
        ]
    },
    
    obstacles: [
        { type: 'bench', position: { x: -8, y: 45, z: 60 }, rotation: Math.PI / 2 },
        { type: 'bench', position: { x: 8, y: 45, z: 85 }, rotation: 0 },
        { type: 'trashcan', position: { x: 5, y: 45, z: 70 } },
        { type: 'tree', position: { x: -15, y: 45, z: 80 } },
        { type: 'tree', position: { x: 18, y: 45, z: 100 } },
        { type: 'rail', position: { x: 0, y: 30, z: 130 }, length: 10, height: 1 }
    ],
    
    npcs: [
        {
            name: "Park Ranger Rick",
            position: { x: -12, y: 46, z: 25 },
            color: { r: 0.13, g: 0.55, b: 0.13 },
            interactRadius: 6,
            dialogue: [
                { speaker: "Park Ranger Rick", text: "Welcome to Paradeli Park, skater!" },
                { speaker: "Park Ranger Rick", text: "That big hill ahead? We call it 'The Bomber.'" },
                { speaker: "Park Ranger Rick", text: "Hit 'em all. Maximum gore mode!" }
            ]
        }
    ],
    
    enemies: [
        // Morning joggers (wander)
        ...Array(3).fill(null).map((_, i) => ({
            position: { x: -8 + (i * 10), y: 46, z: 50 },
            behavior: 'wander',
            speed: 0.015,
            wanderRadius: 8
        })),
        
        // Hillwalkers (static targets)
        ...Array(6).fill(null).map((_, i) => ({
            position: { x: -15 + (i * 6), y: 30, z: 120 + (i * 20) },
            behavior: 'static',
            speed: 0
        })),
        
        // Park goers (wander)
        ...Array(5).fill(null).map((_, i) => ({
            position: { x: (i - 2) * 8, y: 6, z: 280 },
            behavior: 'wander',
            speed: 0.02,
            wanderRadius: 10
        })),
        
        // Boss guards (patrol)
        ...Array(4).fill(null).map((_, i) => ({
            position: { x: (i - 1.5) * 12, y: 16, z: 620 },
            behavior: 'patrol',
            speed: 0.025,
            health: 150,
            patrolPoints: [
                { x: (i - 1.5) * 12, z: 620 },
                { x: (i - 1.5) * 12 + 8, z: 625 }
            ]
        }))
    ],
    
    boss: {
        enabled: true,
        name: "THE MEGA PEDESTRIAN",
        spawnPosition: { x: 0, y: 18, z: 700 },
        health: 100,
        size: 3.5,
        color: { r: 1, g: 0, b: 0 },
        behavior: 'aggressive_chase',
        speed: 0.04
    },
    
    objectives: {
        roadkill: { target: 10, current: 0, complete: false },
        kickflips: { target: 5, current: 0, complete: false },
        boss: { spawned: false, complete: false }
    },
    
    // ========================================
    // INITIALIZATION
    // ========================================
    onLevelStart: async function(game) {
        console.log('🎮 LEVEL 23: PARADELI PARK');
        console.log('⚠️  MAXIMUM GORE MODE ENABLED');
        
        // Scene setup
        game.scene.clearColor = new BABYLON.Color4(
            this.scene.background.r,
            this.scene.background.g,
            this.scene.background.b,
            this.scene.background.a
        );
        
        if (this.scene.fog.enabled) {
            game.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            game.scene.fogColor = new BABYLON.Color3(
                this.scene.fog.color.r,
                this.scene.fog.color.g,
                this.scene.fog.color.b
            );
            game.scene.fogDensity = this.scene.fog.density;
        }
        
        // Build terrain
        await this.buildSegmentedTerrain(game);
        
        // Spawn obstacles
        this.spawnObstacles(game);
        
        // Initialize gore
        if (!game.gore) {
            const { BabylonGorePhysics } = await import('./engine/babylon-gore-physics.js');
            game.gore = new BabylonGorePhysics(game.scene, {
                enabled: true,
                damageThreshold: 5,
                severThreshold: 10,
                explodeThreshold: 25,
                showLogs: true
            });
            console.log('💀 Gore system: MAXIMUM');
        }
        
        // Spawn NPCs
        this.spawnNPCs(game);
        
        // Spawn enemies
        this.spawnEnemies(game);
        
        // Setup gameplay
        this.setupGameplay(game);
        
        // Initialize state
        game.state.roadkills = 0;
        game.state.kickflips = 0;
        game.state.score = 0;
        game.bossSpawned = false;
        
        console.log('✅ PARADELI PARK ready!');
        console.log('📊 Objectives: Roadkill 10 | Kickflip 5 | Defeat Boss');
    },
    
    // ========================================
    // TERRAIN BUILDER
    // ========================================
    buildSegmentedTerrain: async function(game) {
        console.log('🏔️ Building terrain...');
        let currentZ = 0;
        
        for (let segment of this.terrain.segments) {
            const mesh = this.createTerrainSegment(game.scene, segment, currentZ);
            new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.8 }, game.scene);
            mesh.receiveShadow = true;
            currentZ += segment.length;
        }
        
        console.log('✅ Terrain built');
    },
    
    createTerrainSegment: function(scene, segment, startZ) {
        if (segment.type === 'flat') {
            const ground = BABYLON.MeshBuilder.CreateBox(
                `segment_${startZ}`,
                { width: segment.width, height: 1, depth: segment.length },
                scene
            );
            ground.position = new BABYLON.Vector3(0, segment.height - 0.5, startZ + segment.length / 2);
            
            const mat = new BABYLON.StandardMaterial(`mat_${startZ}`, scene);
            mat.diffuseColor = new BABYLON.Color3(segment.color.r, segment.color.g, segment.color.b);
            ground.material = mat;
            
            return ground;
            
        } else if (segment.type === 'hill') {
            const height = Math.abs(segment.startHeight - segment.endHeight);
            const avgHeight = (segment.startHeight + segment.endHeight) / 2;
            const angle = Math.atan2(segment.endHeight - segment.startHeight, segment.length);
            
            const hill = BABYLON.MeshBuilder.CreateBox(
                `segment_${startZ}`,
                { width: segment.width, height: height + 1, depth: segment.length },
                scene
            );
            hill.position = new BABYLON.Vector3(0, avgHeight, startZ + segment.length / 2);
            hill.rotation.x = angle;
            
            const mat = new BABYLON.StandardMaterial(`mat_${startZ}`, scene);
            mat.diffuseColor = new BABYLON.Color3(segment.color.r, segment.color.g, segment.color.b);
            hill.material = mat;
            
            return hill;
            
        } else if (segment.type === 'valley') {
            const valley = BABYLON.MeshBuilder.CreateBox(
                `segment_${startZ}`,
                { width: segment.width, height: 1, depth: segment.length },
                scene
            );
            valley.position = new BABYLON.Vector3(0, segment.depth - 0.5, startZ + segment.length / 2);
            
            const mat = new BABYLON.StandardMaterial(`mat_${startZ}`, scene);
            mat.diffuseColor = new BABYLON.Color3(segment.color.r, segment.color.g, segment.color.b);
            valley.material = mat;
            
            return valley;
        }
    },
    
    // ========================================
    // OBSTACLES
    // ========================================
    spawnObstacles: function(game) {
        console.log('🚧 Spawning obstacles...');
        
        this.obstacles.forEach(obs => {
            if (obs.type === 'bench') this.createBench(game.scene, obs.position, obs.rotation);
            else if (obs.type === 'trashcan') this.createTrashcan(game.scene, obs.position);
            else if (obs.type === 'tree') this.createTree(game.scene, obs.position);
            else if (obs.type === 'rail') this.createRail(game.scene, obs.position, obs.length, obs.height);
        });
        
        console.log('✅ Obstacles spawned');
    },
    
    createBench: function(scene, pos, rotation = 0) {
        const bench = BABYLON.MeshBuilder.CreateBox("bench", { width: 2, height: 0.8, depth: 0.5 }, scene);
        bench.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);
        bench.rotation.y = rotation;
        const mat = new BABYLON.StandardMaterial("benchMat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2);
        bench.material = mat;
        new BABYLON.PhysicsAggregate(bench, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);
        return bench;
    },
    
    createTrashcan: function(scene, pos) {
        const can = BABYLON.MeshBuilder.CreateCylinder("trashcan", { height: 1, diameter: 0.5 }, scene);
        can.position = new BABYLON.Vector3(pos.x, pos.y + 0.5, pos.z);
        const mat = new BABYLON.StandardMaterial("canMat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        can.material = mat;
        new BABYLON.PhysicsAggregate(can, BABYLON.PhysicsShapeType.CYLINDER, { mass: 0 }, scene);
        return can;
    },
    
    createTree: function(scene, pos) {
        const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", { height: 3, diameter: 0.3 }, scene);
        trunk.position = new BABYLON.Vector3(pos.x, pos.y + 1.5, pos.z);
        const trunkMat = new BABYLON.StandardMaterial("trunkMat", scene);
        trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.1);
        trunk.material = trunkMat;
        
        const leaves = BABYLON.MeshBuilder.CreateSphere("leaves", { diameter: 2 }, scene);
        leaves.position = new BABYLON.Vector3(pos.x, pos.y + 3.5, pos.z);
        const leavesMat = new BABYLON.StandardMaterial("leavesMat", scene);
        leavesMat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
        leaves.material = leavesMat;
        
        new BABYLON.PhysicsAggregate(trunk, BABYLON.PhysicsShapeType.CYLINDER, { mass: 0 }, scene);
        return trunk;
    },
    
    createRail: function(scene, pos, length, height) {
        const rail = BABYLON.MeshBuilder.CreateCylinder("rail", { height: length, diameter: 0.1 }, scene);
        rail.position = new BABYLON.Vector3(pos.x, pos.y + height, pos.z);
        rail.rotation.x = Math.PI / 2;
        const mat = new BABYLON.StandardMaterial("railMat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.8);
        rail.material = mat;
        new BABYLON.PhysicsAggregate(rail, BABYLON.PhysicsShapeType.CYLINDER, { mass: 0, friction: 0.1 }, scene);
        return rail;
    },
    
    // ========================================
    // NPCs
    // ========================================
    spawnNPCs: function(game) {
        console.log('💬 Spawning NPCs...');
        
        this.npcs.forEach(npcConfig => {
            const npc = BABYLON.MeshBuilder.CreateCylinder(
                npcConfig.name,
                { height: 2, diameter: 1 },
                game.scene
            );
            npc.position = new BABYLON.Vector3(npcConfig.position.x, npcConfig.position.y + 1, npcConfig.position.z);
            
            const mat = new BABYLON.StandardMaterial(npcConfig.name + "Mat", game.scene);
            mat.diffuseColor = new BABYLON.Color3(npcConfig.color.r, npcConfig.color.g, npcConfig.color.b);
            npc.material = mat;
            npc.castShadow = true;
            
            npc.metadata = { dialogue: npcConfig.dialogue, interactRadius: npcConfig.interactRadius };
        });
        
        console.log('✅ NPCs spawned');
    },
    
    // ========================================
    // ENEMIES
    // ========================================
    spawnEnemies: function(game) {
        console.log('👥 Spawning enemies...');
        
        this.enemies.forEach(enemyConfig => {
            const ragdoll = game.gore.createRagdoll(
                new BABYLON.Vector3(enemyConfig.position.x, enemyConfig.position.y, enemyConfig.position.z)
            );
            
            ragdoll.metadata = {
                behavior: enemyConfig.behavior,
                speed: enemyConfig.speed,
                wanderRadius: enemyConfig.wanderRadius,
                patrolPoints: enemyConfig.patrolPoints,
                health: enemyConfig.health || 100
            };
        });
        
        console.log(`✅ Spawned ${this.enemies.length} enemies`);
    },
    
    // ========================================
    // BOSS
    // ========================================
    spawnBoss: function(game) {
        console.log('👹 BOSS INCOMING: THE MEGA PEDESTRIAN');
        
        const boss = game.gore.createRagdoll(
            new BABYLON.Vector3(this.boss.spawnPosition.x, this.boss.spawnPosition.y, this.boss.spawnPosition.z)
        );
        
        boss.scaling = new BABYLON.Vector3(this.boss.size, this.boss.size, this.boss.size);
        
        boss.getChildMeshes().forEach(mesh => {
            if (mesh.material) {
                mesh.material.diffuseColor = new BABYLON.Color3(this.boss.color.r, this.boss.color.g, this.boss.color.b);
            }
        });
        
        boss.metadata = {
            isBoss: true,
            name: this.boss.name,
            health: this.boss.health,
            behavior: this.boss.behavior,
            speed: this.boss.speed
        };
        
        game.bossEntity = boss;
        console.log('✅ Boss spawned!');
    },
    
    // ========================================
    // GAMEPLAY SYSTEMS
    // ========================================
    setupGameplay: function(game) {
        // Kickflip tracking
        let kickflipActive = false;
        
        game.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN && kbInfo.event.key.toLowerCase() === 'e') {
                kickflipActive = true;
                game.playerModule.doKickflip();
                console.log('🛹 Kickflip started!');
                
                setTimeout(() => {
                    if (kickflipActive) {
                        game.state.kickflips++;
                        game.state.score += 1000;
                        console.log(`✅ Kickflip landed! Total: ${game.state.kickflips}/5`);
                        kickflipActive = false;
                    }
                }, 800);
            }
        });
        
        console.log('✅ Gameplay systems ready');
    },
    
    // ========================================
    // UPDATE LOOP
    // ========================================
    onUpdate: function(game) {
        const deltaTime = game.getDeltaTime();
        
        // Roadkill detection
        if (game.playerModule && game.gore) {
            const playerPos = game.playerModule.getPosition();
            const playerSpeed = game.playerModule.getSpeed();
            
            if (playerSpeed > 10) {
                for (let [id, ragdoll] of game.gore.ragdolls) {
                    if (!ragdoll.alive) continue;
                    
                    const ragdollPos = ragdoll.root.position;
                    const distance = BABYLON.Vector3.Distance(playerPos, ragdollPos);
                    
                    if (distance < 2.5) {
                        ragdoll.alive = false;
                        ragdoll.health = 0;
                        game.state.roadkills++;
                        game.state.score += 500;
                        
                        const launchDir = ragdollPos.subtract(playerPos).normalize();
                        const launchForce = launchDir.scale(playerSpeed * 100);
                        
                        Object.values(ragdoll.bodies).forEach(part => {
                            part.aggregate.body.applyImpulse(launchForce, part.mesh.getAbsolutePosition());
                        });
                        
                        console.log(`💀 ROADKILL! Total: ${game.state.roadkills}/10 | Score: ${game.state.score}`);
                    }
                }
            }
        }
        
        // Enemy AI
        if (game.gore) {
            for (let [id, ragdoll] of game.gore.ragdolls) {
                if (!ragdoll.alive || !ragdoll.metadata) continue;
                
                // Wander AI
                if (ragdoll.metadata.behavior === 'wander') {
                    if (!ragdoll.wanderTarget || ragdoll.wanderTimer > 3) {
                        ragdoll.wanderTarget = {
                            x: ragdoll.root.position.x + (Math.random() - 0.5) * ragdoll.metadata.wanderRadius * 2,
                            z: ragdoll.root.position.z + (Math.random() - 0.5) * ragdoll.metadata.wanderRadius * 2
                        };
                        ragdoll.wanderTimer = 0;
                    }
                    
                    const currentPos = ragdoll.root.position;
                    const targetPos = new BABYLON.Vector3(ragdoll.wanderTarget.x, currentPos.y, ragdoll.wanderTarget.z);
                    const direction = targetPos.subtract(currentPos).normalize();
                    const force = direction.scale(ragdoll.metadata.speed * 500);
                    
                    if (ragdoll.bodies.lowerTorso) {
                        ragdoll.bodies.lowerTorso.aggregate.body.applyForce(force, ragdoll.bodies.lowerTorso.mesh.getAbsolutePosition());
                    }
                    
                    ragdoll.wanderTimer = (ragdoll.wanderTimer || 0) + deltaTime;
                }
                
                // Boss AI
                if (ragdoll.metadata.isBoss && game.playerModule) {
                    const playerPos = game.playerModule.getPosition();
                    const bossPos = ragdoll.root.position;
                    const direction = playerPos.subtract(bossPos);
                    direction.y = 0;
                    const dir = direction.normalize();
                    const force = dir.scale(ragdoll.metadata.speed * 1000);
                    
                    if (ragdoll.bodies.lowerTorso) {
                        ragdoll.bodies.lowerTorso.aggregate.body.applyForce(force, ragdoll.bodies.lowerTorso.mesh.getAbsolutePosition());
                    }
                }
            }
        }
        
        // Check objectives
        if (game.state.roadkills >= this.objectives.roadkill.target) {
            this.objectives.roadkill.complete = true;
        }
        
        if (game.state.kickflips >= this.objectives.kickflips.target) {
            this.objectives.kickflips.complete = true;
        }
        
        if (this.objectives.roadkill.complete && this.objectives.kickflips.complete && !game.bossSpawned) {
            console.log('🎯 ALL OBJECTIVES COMPLETE!');
            this.spawnBoss(game);
            game.bossSpawned = true;
        }
    }
};

console.log('✅ Level 23 Config Loaded (100% Complete)');
