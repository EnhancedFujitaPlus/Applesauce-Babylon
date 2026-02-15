/**
 * APPLESAUCE Terrain Module - WORLD BUILDING EDITION
 * Enhanced terrain system with zones, buildings, roads, and props
 * For creating full neighborhoods and city environments
 */

import * as THREE from './three.module.js';

export class ApplesauceTerrain {
    constructor(engine) {
        this.engine = engine;
        this.chunks = [];
        this.heightMap = new Map();
        this.chunkSize = 100;
        this.terrainMesh = null;
        this.mode = 'segments';
        
        // World-building additions
        this.zones = [];
        this.buildings = [];
        this.roads = [];
        this.props = [];
        this.worldObjects = new THREE.Group();
        this.worldObjects.name = 'WorldObjects';
        
        console.log('🏔️ Terrain module loaded (World Building Edition)');
    }
    
    // ===================================
    // TERRAIN GENERATION - DISPATCHER
    // ===================================
    generate(config) {
        console.log('🏔️ Generating terrain world...');
        
        // Clear existing terrain
        this.clear();
        
        // Add world objects group to scene
        this.engine.scene.add(this.worldObjects);
        
        // Determine mode
        if (config.mode === 'procedural' || config.procedural) {
            this.mode = 'procedural';
            this.generateProcedural(config);
        } else {
            this.mode = 'segments';
            this.generateSegmented(config);
        }
        
        // Generate world features after terrain is created
        if (config.zones) {
            this.generateZones(config.zones);
        }
        
        if (config.roads) {
            this.generateRoads(config.roads);
        }
        
        if (config.buildings) {
            this.generateBuildings(config.buildings);
        }
        
        if (config.props) {
            this.generateProps(config.props);
        }
        
        console.log(`✅ Terrain world generated in ${this.mode} mode`);
        console.log(`   📍 ${this.zones.length} zones, 🏢 ${this.buildings.length} buildings, 🛣️ ${this.roads.length} roads, 🌳 ${this.props.length} props`);
    }
    
    // ===================================
    // PROCEDURAL TERRAIN (ORGANIC FLOW)
    // ===================================
    generateProcedural(config) {
        const size = config.size || 2000;
        const resolution = config.resolution || 100;
        const noiseConfig = config.noise || this.getDefaultNoiseConfig();
        
        console.log(`🌊 Creating procedural terrain: ${size}x${size}, ${resolution} segments`);
        
        // Create high-resolution plane
        const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);
        const positions = geometry.attributes.position;
        
        // Apply layered noise to vertices
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i);
            
            const height = this.calculateProceduralHeight(x, z, noiseConfig);
            positions.setZ(i, height);
        }
        
        geometry.computeVertexNormals();
        
        // Create material with vertex colors support
        const material = new THREE.MeshStandardMaterial({
            color: config.color || 0x567D46,
            roughness: config.roughness || 0.9,
            metalness: config.metalness || 0.0,
            flatShading: config.flatShading || false,
            vertexColors: config.vertexColors || false
        });
        
        // Create mesh
        this.terrainMesh = new THREE.Mesh(geometry, material);
        this.terrainMesh.rotation.x = -Math.PI / 2;
        this.terrainMesh.receiveShadow = true;
        this.terrainMesh.castShadow = config.castShadow || false;
        
        this.engine.scene.add(this.terrainMesh);
        
        // Store noise config for height lookups
        this.noiseConfig = noiseConfig;
        
        console.log('✅ Procedural terrain created');
    }
    
    calculateProceduralHeight(x, z, config) {
        let height = 0;
        
        // Layer 1: Large rolling hills
        height += Math.sin(x * config.freq1) * config.amp1;
        height += Math.cos(z * config.freq1) * config.amp1;
        
        // Layer 2: Medium variations
        height += Math.sin(x * config.freq2) * config.amp2;
        height += Math.cos(z * config.freq2) * config.amp2;
        
        // Layer 3: Small bumps and details
        height += Math.sin(x * config.freq3) * config.amp3;
        height += Math.cos(z * config.freq3) * config.amp3;
        
        // Layer 4: Diagonal patterns
        height += Math.sin((x + z) * config.freqDiag1) * config.ampDiag1;
        height += Math.cos((x - z) * config.freqDiag2) * config.ampDiag2;
        
        // Base height offset
        height += config.baseHeight || 0;
        
        return height;
    }
    
    getDefaultNoiseConfig() {
        return {
            freq1: 0.03, amp1: 4,
            freq2: 0.08, amp2: 2,
            freq3: 0.15, amp3: 0.8,
            freqDiag1: 0.05, ampDiag1: 3,
            freqDiag2: 0.05, ampDiag2: 2,
            baseHeight: 0
        };
    }
    
    getNoisePreset(preset) {
        const presets = {
            gentle: {
                freq1: 0.02, amp1: 3,
                freq2: 0.06, amp2: 1.5,
                freq3: 0.12, amp3: 0.5,
                freqDiag1: 0.04, ampDiag1: 2,
                freqDiag2: 0.04, ampDiag2: 1.5,
                baseHeight: 0
            },
            flat_city: {
                freq1: 0.01, amp1: 0.5,
                freq2: 0.03, amp2: 0.3,
                freq3: 0.08, amp3: 0.2,
                freqDiag1: 0.02, ampDiag1: 0.3,
                freqDiag2: 0.02, ampDiag2: 0.2,
                baseHeight: 0
            },
            rolling: {
                freq1: 0.03, amp1: 6,
                freq2: 0.08, amp2: 3,
                freq3: 0.15, amp3: 1,
                freqDiag1: 0.05, ampDiag1: 4,
                freqDiag2: 0.05, ampDiag2: 3,
                baseHeight: 0
            },
            mountainous: {
                freq1: 0.025, amp1: 12,
                freq2: 0.07, amp2: 6,
                freq3: 0.14, amp3: 2,
                freqDiag1: 0.045, ampDiag1: 8,
                freqDiag2: 0.045, ampDiag2: 6,
                baseHeight: 5
            }
        };
        
        return presets[preset] || this.getDefaultNoiseConfig();
    }
    
    // ===================================
    // ZONE GENERATION
    // ===================================
    generateZones(zoneConfigs) {
        console.log(`📍 Generating ${zoneConfigs.length} zones...`);
        
        zoneConfigs.forEach((config, index) => {
            const zone = {
                id: config.id || `zone_${index}`,
                type: config.type || 'mixed', // residential, commercial, industrial, park, mixed
                position: config.position || { x: 0, z: 0 },
                size: config.size || { width: 200, depth: 200 },
                terrainModifier: config.terrainModifier || 'flatten',
                color: config.color || this.getZoneColor(config.type),
                objects: []
            };
            
            // Modify terrain for this zone if needed
            if (zone.terrainModifier === 'flatten') {
                this.flattenZone(zone);
            }
            
            // Create visual zone marker (optional, for debugging)
            if (config.showMarker) {
                this.createZoneMarker(zone);
            }
            
            this.zones.push(zone);
        });
        
        console.log(`✅ Zones generated`);
    }
    
    flattenZone(zone) {
        // Calculate average height in zone
        const samples = 20;
        let totalHeight = 0;
        let count = 0;
        
        for (let ix = 0; ix < samples; ix++) {
            for (let iz = 0; iz < samples; iz++) {
                const x = zone.position.x - zone.size.width/2 + (zone.size.width * ix / samples);
                const z = zone.position.z - zone.size.depth/2 + (zone.size.depth * iz / samples);
                totalHeight += this.getHeight(x, z);
                count++;
            }
        }
        
        zone.baseHeight = totalHeight / count;
    }
    
    getZoneColor(type) {
        const colors = {
            residential: 0x90EE90,
            commercial: 0x87CEEB,
            industrial: 0xD3D3D3,
            park: 0x228B22,
            mixed: 0xFFD700
        };
        return colors[type] || 0xFFFFFF;
    }
    
    createZoneMarker(zone) {
        const geometry = new THREE.PlaneGeometry(zone.size.width, zone.size.depth);
        const material = new THREE.MeshBasicMaterial({
            color: zone.color,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        
        const marker = new THREE.Mesh(geometry, material);
        marker.rotation.x = -Math.PI / 2;
        marker.position.set(zone.position.x, zone.baseHeight + 0.1, zone.position.z);
        
        this.worldObjects.add(marker);
    }
    
    // ===================================
    // ROAD GENERATION
    // ===================================
    generateRoads(roadConfigs) {
        console.log(`🛣️ Generating ${roadConfigs.length} roads...`);
        
        roadConfigs.forEach((config, index) => {
            const road = {
                id: config.id || `road_${index}`,
                type: config.type || 'street', // highway, street, alley, path
                points: config.points || [],
                width: config.width || this.getRoadWidth(config.type),
                material: config.material || 'asphalt',
                mesh: null
            };
            
            // Generate road mesh
            if (road.points.length >= 2) {
                road.mesh = this.createRoadMesh(road);
                this.worldObjects.add(road.mesh);
            }
            
            this.roads.push(road);
        });
        
        console.log(`✅ Roads generated`);
    }
    
    getRoadWidth(type) {
        const widths = {
            highway: 12,
            street: 8,
            alley: 4,
            path: 2
        };
        return widths[type] || 6;
    }
    
    createRoadMesh(road) {
        const group = new THREE.Group();
        
        // Create road segments between points
        for (let i = 0; i < road.points.length - 1; i++) {
            const start = road.points[i];
            const end = road.points[i + 1];
            
            const length = Math.sqrt(
                Math.pow(end.x - start.x, 2) + 
                Math.pow(end.z - start.z, 2)
            );
            
            const angle = Math.atan2(end.x - start.x, end.z - start.z);
            
            const geometry = new THREE.PlaneGeometry(road.width, length);
            const material = new THREE.MeshStandardMaterial({
                color: this.getRoadColor(road.material),
                roughness: 0.8,
                metalness: 0.1
            });
            
            const segment = new THREE.Mesh(geometry, material);
            segment.rotation.x = -Math.PI / 2;
            segment.rotation.z = angle;
            
            const midX = (start.x + end.x) / 2;
            const midZ = (start.z + end.z) / 2;
            const height = this.getHeight(midX, midZ);
            
            segment.position.set(midX, height + 0.05, midZ);
            segment.receiveShadow = true;
            
            group.add(segment);
        }
        
        return group;
    }
    
    getRoadColor(material) {
        const colors = {
            asphalt: 0x2F2F2F,
            concrete: 0x808080,
            dirt: 0x8B4513,
            cobblestone: 0x696969
        };
        return colors[material] || 0x404040;
    }
    
    // ===================================
    // BUILDING GENERATION
    // ===================================
    generateBuildings(buildingConfigs) {
        console.log(`🏢 Generating ${buildingConfigs.length} buildings...`);
        
        buildingConfigs.forEach((config, index) => {
            const building = {
                id: config.id || `building_${index}`,
                type: config.type || 'generic',
                position: config.position || { x: 0, z: 0 },
                size: config.size || { width: 10, height: 15, depth: 10 },
                style: config.style || 'modern',
                color: config.color || this.getBuildingColor(config.type),
                mesh: null
            };
            
            // Get ground height at building position
            const groundHeight = this.getHeight(building.position.x, building.position.z);
            
            // Create building mesh
            building.mesh = this.createBuildingMesh(building, groundHeight);
            this.worldObjects.add(building.mesh);
            
            this.buildings.push(building);
        });
        
        console.log(`✅ Buildings generated`);
    }
    
    getBuildingColor(type) {
        const colors = {
            residential: 0xD2B48C,
            commercial: 0x4682B4,
            industrial: 0x696969,
            office: 0xC0C0C0,
            generic: 0xBCBCBC
        };
        return colors[type] || 0xA0A0A0;
    }
    
    createBuildingMesh(building, groundHeight) {
        const group = new THREE.Group();
        
        // Main building body
        const geometry = new THREE.BoxGeometry(
            building.size.width,
            building.size.height,
            building.size.depth
        );
        
        const material = new THREE.MeshStandardMaterial({
            color: building.color,
            roughness: 0.7,
            metalness: 0.2
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = building.size.height / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        group.add(mesh);
        
        // Add windows based on style
        if (building.style === 'modern') {
            this.addModernWindows(group, building);
        } else if (building.style === 'classic') {
            this.addClassicWindows(group, building);
        }
        
        // Position building on terrain
        group.position.set(building.position.x, groundHeight, building.position.z);
        
        return group;
    }
    
    addModernWindows(group, building) {
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x87CEEB,
            roughness: 0.1,
            metalness: 0.8,
            emissive: 0x4682B4,
            emissiveIntensity: 0.2
        });
        
        const floors = Math.floor(building.size.height / 3);
        const windowsPerFloor = Math.floor(building.size.width / 2);
        
        // Front and back faces
        for (let floor = 0; floor < floors; floor++) {
            for (let win = 0; win < windowsPerFloor; win++) {
                const windowGeo = new THREE.BoxGeometry(1.5, 2, 0.1);
                const window1 = new THREE.Mesh(windowGeo, windowMaterial);
                const window2 = new THREE.Mesh(windowGeo, windowMaterial);
                
                const x = -building.size.width/2 + 1 + (win * 2);
                const y = 1 + (floor * 3);
                
                window1.position.set(x, y, building.size.depth/2 + 0.05);
                window2.position.set(x, y, -building.size.depth/2 - 0.05);
                
                group.add(window1);
                group.add(window2);
            }
        }
    }
    
    addClassicWindows(group, building) {
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFDD,
            emissive: 0xFFFF99,
            emissiveIntensity: 0.3
        });
        
        const floors = Math.floor(building.size.height / 4);
        
        for (let floor = 0; floor < floors; floor++) {
            const windowGeo = new THREE.BoxGeometry(1, 1.5, 0.1);
            
            for (let i = 0; i < 3; i++) {
                const window1 = new THREE.Mesh(windowGeo, windowMaterial);
                window1.position.set(
                    -building.size.width/2 + 2 + (i * 3),
                    2 + (floor * 4),
                    building.size.depth/2 + 0.05
                );
                group.add(window1);
            }
        }
    }
    
    // ===================================
    // PROP GENERATION (TREES, LIGHTS, ETC)
    // ===================================
    generateProps(propConfigs) {
        console.log(`🌳 Generating ${propConfigs.length} props...`);
        
        propConfigs.forEach((config, index) => {
            const prop = {
                id: config.id || `prop_${index}`,
                type: config.type || 'tree',
                position: config.position || { x: 0, z: 0 },
                scale: config.scale || 1,
                mesh: null
            };
            
            // Get ground height
            const groundHeight = this.getHeight(prop.position.x, prop.position.z);
            
            // Create prop mesh based on type
            prop.mesh = this.createPropMesh(prop, groundHeight);
            this.worldObjects.add(prop.mesh);
            
            this.props.push(prop);
        });
        
        console.log(`✅ Props generated`);
    }
    
    createPropMesh(prop, groundHeight) {
        const group = new THREE.Group();
        
        switch(prop.type) {
            case 'tree':
                group.add(this.createTree(prop.scale));
                break;
            case 'streetlight':
                group.add(this.createStreetlight(prop.scale));
                break;
            case 'bench':
                group.add(this.createBench(prop.scale));
                break;
            case 'sign':
                group.add(this.createSign(prop.scale));
                break;
            default:
                group.add(this.createGenericProp(prop.scale));
        }
        
        group.position.set(prop.position.x, groundHeight, prop.position.z);
        return group;
    }
    
    createTree(scale) {
        const tree = new THREE.Group();
        
        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, 4 * scale, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2 * scale;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Foliage (3 spheres)
        const foliageMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        
        for (let i = 0; i < 3; i++) {
            const foliageGeo = new THREE.SphereGeometry(1.5 * scale, 8, 8);
            const foliage = new THREE.Mesh(foliageGeo, foliageMat);
            foliage.position.y = 3.5 * scale + (i * 0.5 * scale);
            foliage.position.x = (Math.random() - 0.5) * scale;
            foliage.position.z = (Math.random() - 0.5) * scale;
            foliage.castShadow = true;
            tree.add(foliage);
        }
        
        return tree;
    }
    
    createStreetlight(scale) {
        const light = new THREE.Group();
        
        // Pole
        const poleGeo = new THREE.CylinderGeometry(0.15 * scale, 0.15 * scale, 5 * scale, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x404040 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 2.5 * scale;
        pole.castShadow = true;
        light.add(pole);
        
        // Lamp
        const lampGeo = new THREE.SphereGeometry(0.4 * scale, 8, 8);
        const lampMat = new THREE.MeshStandardMaterial({
            color: 0xFFFF99,
            emissive: 0xFFFF99,
            emissiveIntensity: 0.5
        });
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.y = 5 * scale;
        light.add(lamp);
        
        // Point light
        const pointLight = new THREE.PointLight(0xFFFFAA, 1, 20 * scale);
        pointLight.position.y = 5 * scale;
        pointLight.castShadow = true;
        light.add(pointLight);
        
        return light;
    }
    
    createBench(scale) {
        const bench = new THREE.Group();
        
        // Seat
        const seatGeo = new THREE.BoxGeometry(2 * scale, 0.2 * scale, 0.8 * scale);
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const seat = new THREE.Mesh(seatGeo, woodMat);
        seat.position.y = 0.5 * scale;
        bench.add(seat);
        
        // Back
        const backGeo = new THREE.BoxGeometry(2 * scale, 1 * scale, 0.1 * scale);
        const back = new THREE.Mesh(backGeo, woodMat);
        back.position.y = 1 * scale;
        back.position.z = -0.35 * scale;
        bench.add(back);
        
        return bench;
    }
    
    createSign(scale) {
        const sign = new THREE.Group();
        
        // Post
        const postGeo = new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 2 * scale, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.y = 1 * scale;
        sign.add(post);
        
        // Sign board
        const boardGeo = new THREE.BoxGeometry(1.5 * scale, 1 * scale, 0.1 * scale);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.y = 2.5 * scale;
        sign.add(board);
        
        return sign;
    }
    
    createGenericProp(scale) {
        const geo = new THREE.BoxGeometry(scale, scale, scale);
        const mat = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = scale / 2;
        return mesh;
    }
    
    // ===================================
    // PROCEDURAL WORLD GENERATION HELPERS
    // ===================================
    
    /**
     * Automatically generate a grid of buildings in a zone
     */
    autoPopulateZoneWithBuildings(zoneId, config = {}) {
        const zone = this.zones.find(z => z.id === zoneId);
        if (!zone) return;
        
        const spacing = config.spacing || 25;
        const buildingChance = config.chance || 0.7;
        const minSize = config.minSize || { width: 8, height: 10, depth: 8 };
        const maxSize = config.maxSize || { width: 15, height: 25, depth: 15 };
        
        const buildings = [];
        
        for (let x = zone.position.x - zone.size.width/2 + spacing/2; 
             x < zone.position.x + zone.size.width/2; 
             x += spacing) {
            for (let z = zone.position.z - zone.size.depth/2 + spacing/2; 
                 z < zone.position.z + zone.size.depth/2; 
                 z += spacing) {
                
                if (Math.random() < buildingChance) {
                    buildings.push({
                        type: zone.type === 'residential' ? 'residential' : 'commercial',
                        position: { x, z },
                        size: {
                            width: minSize.width + Math.random() * (maxSize.width - minSize.width),
                            height: minSize.height + Math.random() * (maxSize.height - minSize.height),
                            depth: minSize.depth + Math.random() * (maxSize.depth - minSize.depth)
                        },
                        style: Math.random() > 0.5 ? 'modern' : 'classic'
                    });
                }
            }
        }
        
        this.generateBuildings(buildings);
    }
    
    /**
     * Create a grid road network
     */
    autoGenerateRoadGrid(config = {}) {
        const bounds = config.bounds || { minX: -500, maxX: 500, minZ: -500, maxZ: 500 };
        const spacing = config.spacing || 100;
        const roadType = config.roadType || 'street';
        
        const roads = [];
        
        // Horizontal roads
        for (let z = bounds.minZ; z <= bounds.maxZ; z += spacing) {
            roads.push({
                type: roadType,
                points: [
                    { x: bounds.minX, z },
                    { x: bounds.maxX, z }
                ]
            });
        }
        
        // Vertical roads
        for (let x = bounds.minX; x <= bounds.maxX; x += spacing) {
            roads.push({
                type: roadType,
                points: [
                    { x, z: bounds.minZ },
                    { x, z: bounds.maxZ }
                ]
            });
        }
        
        this.generateRoads(roads);
    }
    
    /**
     * Scatter props randomly in an area
     */
    autoScatterProps(propType, count, bounds = {}) {
        const area = bounds || { minX: -500, maxX: 500, minZ: -500, maxZ: 500 };
        const props = [];
        
        for (let i = 0; i < count; i++) {
            props.push({
                type: propType,
                position: {
                    x: area.minX + Math.random() * (area.maxX - area.minX),
                    z: area.minZ + Math.random() * (area.maxZ - area.minZ)
                },
                scale: 0.8 + Math.random() * 0.4
            });
        }
        
        this.generateProps(props);
    }
    
    // ===================================
    // HEIGHT LOOKUP
    // ===================================
    getHeight(x, z) {
        if (this.mode === 'procedural' && this.noiseConfig) {
            return this.calculateProceduralHeight(x, z, this.noiseConfig);
        }
        
        const key = `${Math.floor(x)},${Math.floor(z)}`;
        if (this.heightMap.has(key)) {
            return this.heightMap.get(key);
        }
        
        return 0;
    }
    
    getPlayerHeight(x, z, rotation, boardLength = 1.25, boardWidth = 0.4) {
        const forward = {
            x: Math.sin(rotation),
            z: Math.cos(rotation)
        };
        const right = {
            x: Math.cos(rotation),
            z: -Math.sin(rotation)
        };
        
        const hCenter = this.getHeight(x, z);
        const hFront = this.getHeight(x + forward.x * boardLength, z + forward.z * boardLength);
        const hBack = this.getHeight(x - forward.x * boardLength, z - forward.z * boardLength);
        const hLeft = this.getHeight(x - right.x * boardWidth, z - right.z * boardWidth);
        const hRight = this.getHeight(x + right.x * boardWidth, z + right.z * boardWidth);
        
        return (hCenter * 3 + hFront + hBack + hLeft + hRight) / 7;
    }
    
    // ===================================
    // SEGMENTED TERRAIN (LEGACY SUPPORT)
    // ===================================
    generateSegmented(config) {
        const segments = config.segments || this.createDefaultSegments(config);
        
        let currentZ = 0;
        segments.forEach((segment, index) => {
            const chunk = this.createChunk(segment, currentZ, index);
            this.chunks.push(chunk);
            currentZ += segment.length || this.chunkSize;
        });
        
        console.log(`✅ Generated ${this.chunks.length} terrain chunks`);
    }
    
    createDefaultSegments(config) {
        return [{
            type: 'flat',
            length: config.size || 500,
            height: 0
        }];
    }
    
    createChunk(segment, startZ, index) {
        const chunk = {
            type: segment.type,
            startZ: startZ,
            endZ: startZ + (segment.length || this.chunkSize),
            mesh: null,
            heightData: []
        };
        
        // Actually create the visual mesh based on type!
        switch(segment.type) {
            case 'flat':
                chunk.mesh = this.createFlatChunk(segment, startZ);
                chunk.heightData = this.generateFlatHeightData(segment, startZ);
                break;
            case 'hill':
                chunk.mesh = this.createHillChunk(segment, startZ);
                chunk.heightData = this.generateHillHeightData(segment, startZ);
                break;
            case 'mountain':
                chunk.mesh = this.createMountainChunk(segment, startZ);
                chunk.heightData = this.generateMountainHeightData(segment, startZ);
                break;
            case 'valley':
                chunk.mesh = this.createValleyChunk(segment, startZ);
                chunk.heightData = this.generateValleyHeightData(segment, startZ);
                break;
            default:
                console.warn(`Unknown terrain type: ${segment.type}`);
                chunk.mesh = this.createFlatChunk(segment, startZ);
                chunk.heightData = this.generateFlatHeightData(segment, startZ);
        }
        
        // Add mesh to scene if it was created
        if (chunk.mesh) {
            this.engine.scene.add(chunk.mesh);
        }
        
        // Store height data in heightMap for quick lookups
        chunk.heightData.forEach(point => {
            const key = `${Math.floor(point.x)},${Math.floor(point.z)}`;
            this.heightMap.set(key, point.y);
        });
        
        return chunk;
    }
    
    // ===================================
    // CHUNK MESH CREATION
    // ===================================
    
    createFlatChunk(segment, startZ) {
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const height = segment.height || 0;
        
        const geometry = new THREE.PlaneGeometry(width, length, 1, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x567D46,
            roughness: 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, height, startZ + length / 2);
        mesh.receiveShadow = true;
        
        return mesh;
    }
    
    generateFlatHeightData(segment, startZ) {
        const data = [];
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const height = segment.height || 0;
        const resolution = 5;
        
        for (let x = -width / 2; x <= width / 2; x += resolution) {
            for (let z = startZ; z <= startZ + length; z += resolution) {
                data.push({ x, y: height, z });
            }
        }
        
        return data;
    }
    
    createHillChunk(segment, startZ) {
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const startHeight = segment.startHeight || 0;
        const endHeight = segment.endHeight || 0;
        
        const widthSegments = 32;
        const lengthSegments = 64;
        
        const geometry = new THREE.PlaneGeometry(
            width, 
            length, 
            widthSegments, 
            lengthSegments
        );
        
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i); // PlaneGeometry uses Y for depth
            
            const normalizedZ = (z + length / 2) / length;
            const height = startHeight + (endHeight - startHeight) * normalizedZ;
            const widthFactor = 1 - Math.abs(x / (width / 2)) * 0.1;
            const finalHeight = height * widthFactor;
            
            positions.setZ(i, finalHeight);
        }
        
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x567D46,
            roughness: 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, 0, startZ + length / 2);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return mesh;
    }
    
    generateHillHeightData(segment, startZ) {
        const data = [];
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const startHeight = segment.startHeight || 0;
        const endHeight = segment.endHeight || 0;
        const resolution = 2;
        
        for (let x = -width / 2; x <= width / 2; x += resolution) {
            for (let z = startZ; z <= startZ + length; z += resolution) {
                const normalizedZ = (z - startZ) / length;
                const height = startHeight + (endHeight - startHeight) * normalizedZ;
                const widthFactor = 1 - Math.abs(x / (width / 2)) * 0.1;
                const finalHeight = height * widthFactor;
                
                data.push({ x, y: finalHeight, z });
            }
        }
        
        return data;
    }
    
    createMountainChunk(segment, startZ) {
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const peakHeight = segment.peakHeight || 80;
        
        const widthSegments = 64;
        const lengthSegments = 64;
        
        const geometry = new THREE.PlaneGeometry(
            width, 
            length, 
            widthSegments, 
            lengthSegments
        );
        
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getY(i);
            
            const normalizedZ = (z + length / 2) / length;
            const normalizedX = x / (width / 2);
            
            const centerDistance = Math.sqrt(
                Math.pow(normalizedX, 2) + 
                Math.pow(normalizedZ - 0.5, 2) * 4
            );
            
            const height = peakHeight * Math.max(0, 1 - centerDistance);
            
            positions.setZ(i, height);
        }
        
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x8B7355,
            roughness: 0.95
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, 0, startZ + length / 2);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return mesh;
    }
    
    generateMountainHeightData(segment, startZ) {
        const data = [];
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const peakHeight = segment.peakHeight || 80;
        const resolution = 2;
        
        for (let x = -width / 2; x <= width / 2; x += resolution) {
            for (let z = startZ; z <= startZ + length; z += resolution) {
                const normalizedZ = (z - startZ) / length;
                const normalizedX = x / (width / 2);
                
                const centerDistance = Math.sqrt(
                    Math.pow(normalizedX, 2) + 
                    Math.pow(normalizedZ - 0.5, 2) * 4
                );
                
                const height = peakHeight * Math.max(0, 1 - centerDistance);
                
                data.push({ x, y: height, z });
            }
        }
        
        return data;
    }
    
    createValleyChunk(segment, startZ) {
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const depth = segment.depth || -20;
        
        const widthSegments = 64;
        const lengthSegments = 64;
        
        const geometry = new THREE.PlaneGeometry(
            width, 
            length, 
            widthSegments, 
            lengthSegments
        );
        
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const normalizedX = Math.abs(x / (width / 2));
            
            const height = depth * (1 - normalizedX);
            
            positions.setZ(i, height);
        }
        
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x3d6b3d,
            roughness: 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, 0, startZ + length / 2);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return mesh;
    }
    
    generateValleyHeightData(segment, startZ) {
        const data = [];
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const depth = segment.depth || -20;
        const resolution = 2;
        
        for (let x = -width / 2; x <= width / 2; x += resolution) {
            for (let z = startZ; z <= startZ + length; z += resolution) {
                const normalizedX = Math.abs(x / (width / 2));
                const height = depth * (1 - normalizedX);
                
                data.push({ x, y: height, z });
            }
        }
        
        return data;
    }
    
    // ===================================
    // CLEANUP
    // ===================================
    clear() {
        if (this.terrainMesh) {
            this.engine.scene.remove(this.terrainMesh);
            this.terrainMesh = null;
        }
        
        for (let chunk of this.chunks) {
            if (chunk.mesh) {
                this.engine.scene.remove(chunk.mesh);
            }
        }
        
        if (this.worldObjects) {
            this.engine.scene.remove(this.worldObjects);
            this.worldObjects.clear();
        }
        
        this.chunks = [];
        this.zones = [];
        this.buildings = [];
        this.roads = [];
        this.props = [];
        this.heightMap.clear();
        this.noiseConfig = null;
        
        console.log('🏔️ Terrain world cleared');
    }
}
