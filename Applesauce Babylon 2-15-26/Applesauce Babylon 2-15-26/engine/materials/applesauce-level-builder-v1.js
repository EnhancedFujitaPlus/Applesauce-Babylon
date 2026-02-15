/**
 * APPLESAUCE Level Builder v1.0
 * Creates physical level objects (rails, ramps, obstacles)
 * Uses materials from ApplesauceMaterials
 */
import * as THREE from './three.module.js';

export class ApplesauceLevelBuilder {
    constructor(core) {
        this.core = core;
        this.scene = core.scene;
        this.materials = core.modules.materials;
        
        // Track created objects for cleanup
        this.builtObjects = [];
        
        console.log('🏗️ Level Builder ready');
    }
    
    // ===================================
    // RAILS
    // ===================================
    createRail(x, z, length, height = 2) {
        const railGroup = new THREE.Group();
        
        // Support poles
        const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, height);
        const pole1 = new THREE.Mesh(poleGeo, this.materials.getMaterial('metal'));
        pole1.position.set(0, height / 2, -length / 2);
        pole1.castShadow = true;
        
        const pole2 = new THREE.Mesh(poleGeo, this.materials.getMaterial('metal'));
        pole2.position.set(0, height / 2, length / 2);
        pole2.castShadow = true;
        
        // The grindable rail
        const railGeo = new THREE.CylinderGeometry(0.15, 0.15, length);
        const rail = new THREE.Mesh(railGeo, this.materials.getMaterial('metal'));
        rail.rotation.x = Math.PI / 2;
        rail.position.y = height;
        rail.castShadow = true;
        rail.userData.isGrindable = true;
        
        railGroup.add(pole1, pole2, rail);
        railGroup.position.set(x, 0, z);
        
        this.scene.add(railGroup);
        this.core.rails.push(rail); // Register for grinding detection
        this.builtObjects.push(railGroup);
        
        return railGroup;
    }
    
    // Create multiple rails from config
    createRails(config) {
        const count = config.count || 5;
        const spread = config.spread || 100;
        const zStart = config.zStart || 50;
        const zRange = config.zRange || 200;
        
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * spread;
            const z = Math.random() * zRange + zStart;
            const length = config.length || 20;
            this.createRail(x, z, length);
        }
    }
    
    // ===================================
    // RAMPS
    // ===================================
    createQuarterPipe(x, z, rotation = 0, width = 8) {
        const pipe = new THREE.Group();
        
        // Main ramp geometry
        const rampGeo = new THREE.BoxGeometry(6, 4, width);
        const ramp = new THREE.Mesh(rampGeo, this.materials.getMaterial('concrete'));
        ramp.position.set(3, 2, 0);
        ramp.rotation.z = Math.PI / 4;
        ramp.castShadow = true;
        ramp.receiveShadow = true;
        pipe.add(ramp);
        
        // Coping (grindable edge)
        const copingGeo = new THREE.CylinderGeometry(0.08, 0.08, width, 12);
        const coping = new THREE.Mesh(copingGeo, this.materials.getMaterial('metal'));
        coping.rotation.x = Math.PI / 2;
        coping.position.set(4.2, 4.2, 0);
        coping.castShadow = true;
        coping.userData.isGrindable = true;
        pipe.add(coping);
        
        pipe.position.set(x, 0, z);
        pipe.rotation.y = rotation;
        
        this.scene.add(pipe);
        this.core.rails.push(coping); // Coping is grindable
        this.builtObjects.push(pipe);
        
        return pipe;
    }
    
    createHalfPipe(x, z, rotation = 0, width = 20, height = 6) {
        const halfPipe = new THREE.Group();
        
        // Left quarter pipe
        const left = this.createQuarterPipe(0, 0, 0, width);
        left.position.x = -10;
        halfPipe.add(left);
        
        // Right quarter pipe
        const right = this.createQuarterPipe(0, 0, Math.PI, width);
        right.position.x = 10;
        halfPipe.add(right);
        
        // Flat bottom
        const bottomGeo = new THREE.BoxGeometry(20, 0.5, width);
        const bottom = new THREE.Mesh(bottomGeo, this.materials.getMaterial('concrete'));
        bottom.position.y = 0.25;
        bottom.receiveShadow = true;
        halfPipe.add(bottom);
        
        halfPipe.position.set(x, 0, z);
        halfPipe.rotation.y = rotation;
        
        this.scene.add(halfPipe);
        this.builtObjects.push(halfPipe);
        
        return halfPipe;
    }
    
    createLaunchRamp(x, z, rotation = 0, width = 10, height = 3) {
        const ramp = new THREE.Group();
        
        // Ramp slope
        const slopeGeo = new THREE.BoxGeometry(width, height, width);
        const slope = new THREE.Mesh(slopeGeo, this.materials.getMaterial('wood'));
        slope.rotation.x = -Math.PI / 6; // 30 degree angle
        slope.position.set(0, height / 2, 0);
        slope.castShadow = true;
        slope.receiveShadow = true;
        ramp.add(slope);
        
        ramp.position.set(x, 0, z);
        ramp.rotation.y = rotation;
        
        this.scene.add(ramp);
        this.builtObjects.push(ramp);
        
        return ramp;
    }
    
    // ===================================
    // FENCES & WALLS
    // ===================================
    createFence(x, z, length, rotation = 0, grindable = true) {
        const fence = new THREE.Group();
        
        // Fence posts
        for (let i = 0; i <= length; i += 5) {
            const postGeo = new THREE.BoxGeometry(0.3, 2, 0.3);
            const post = new THREE.Mesh(postGeo, this.materials.getMaterial('wood'));
            post.position.set(i, 1, 0);
            post.castShadow = true;
            fence.add(post);
        }
        
        // Horizontal rails
        for (let h of [0.5, 1.5]) {
            const railGeo = new THREE.BoxGeometry(length, 0.2, 0.2);
            const rail = new THREE.Mesh(railGeo, this.materials.getMaterial('wood'));
            rail.position.set(length / 2, h, 0);
            rail.castShadow = true;
            
            if (grindable) {
                rail.userData.isGrindable = true;
                this.core.rails.push(rail);
            }
            
            fence.add(rail);
        }
        
        fence.position.set(x, 0, z);
        fence.rotation.y = rotation;
        
        this.scene.add(fence);
        this.builtObjects.push(fence);
        
        return fence;
    }
    
    // ===================================
    // BOXES & PLATFORMS
    // ===================================
    createGrindBox(x, z, width = 4, height = 1, depth = 2) {
        const box = new THREE.Group();
        
        // Main box
        const boxGeo = new THREE.BoxGeometry(width, height, depth);
        const boxMesh = new THREE.Mesh(boxGeo, this.materials.getMaterial('wood'));
        boxMesh.position.y = height / 2;
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        box.add(boxMesh);
        
        // Metal edges (grindable)
        const edges = [
            { x: width / 2, z: 0 },    // Right edge
            { x: -width / 2, z: 0 },   // Left edge
            { x: 0, z: depth / 2 },    // Front edge
            { x: 0, z: -depth / 2 }    // Back edge
        ];
        
        edges.forEach(edge => {
            const edgeGeo = new THREE.BoxGeometry(0.1, 0.1, edge.x === 0 ? depth : width);
            const edgeMesh = new THREE.Mesh(edgeGeo, this.materials.getMaterial('metal'));
            edgeMesh.position.set(edge.x, height, edge.z);
            if (edge.x === 0) edgeMesh.rotation.y = Math.PI / 2;
            edgeMesh.userData.isGrindable = true;
            edgeMesh.castShadow = true;
            box.add(edgeMesh);
            this.core.rails.push(edgeMesh);
        });
        
        box.position.set(x, 0, z);
        
        this.scene.add(box);
        this.builtObjects.push(box);
        
        return box;
    }
    
    // ===================================
    // SPECIAL OBSTACLES
    // ===================================
    createSpeedBoost(x, z, direction = 0) {
        const boost = new THREE.Group();
        
        // Visual indicator
        const arrowGeo = new THREE.ConeGeometry(1, 2, 3);
        const arrow = new THREE.Mesh(arrowGeo, this.materials.getSpeedMaterial(1.0));
        arrow.rotation.x = Math.PI / 2;
        arrow.position.y = 0.5;
        boost.add(arrow);
        
        // Collision zone
        const zoneGeo = new THREE.CylinderGeometry(2, 2, 0.5);
        const zone = new THREE.Mesh(zoneGeo, this.materials.getMaterial('concrete'));
        zone.position.y = 0.25;
        zone.userData.isSpeedBoost = true;
        zone.userData.boostMultiplier = 1.5;
        boost.add(zone);
        
        boost.position.set(x, 0, z);
        boost.rotation.y = direction;
        
        this.scene.add(boost);
        this.builtObjects.push(boost);
        
        return boost;
    }
    
    createCheckpoint(x, z, checkpointNumber) {
        const checkpoint = new THREE.Group();
        
        // Archway
        const leftPole = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 5, 0.5),
            this.materials.getMaterial('metal')
        );
        leftPole.position.set(-3, 2.5, 0);
        leftPole.castShadow = true;
        checkpoint.add(leftPole);
        
        const rightPole = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 5, 0.5),
            this.materials.getMaterial('metal')
        );
        rightPole.position.set(3, 2.5, 0);
        rightPole.castShadow = true;
        checkpoint.add(rightPole);
        
        // Top banner
        const banner = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.5, 0.5),
            this.materials.getSpeedMaterial(1.0)
        );
        banner.position.set(0, 5, 0);
        checkpoint.add(banner);
        
        // Trigger zone
        const trigger = new THREE.Mesh(
            new THREE.BoxGeometry(6, 5, 1),
            new THREE.MeshBasicMaterial({ 
                color: 0x00FF00, 
                transparent: true, 
                opacity: 0.3,
                wireframe: true 
            })
        );
        trigger.position.set(0, 2.5, 0);
        trigger.userData.isCheckpoint = true;
        trigger.userData.checkpointNumber = checkpointNumber;
        checkpoint.add(trigger);
        
        checkpoint.position.set(x, 0, z);
        
        this.scene.add(checkpoint);
        this.builtObjects.push(checkpoint);
        
        return checkpoint;
    }
    
    // ===================================
    // UTILITY
    // ===================================
    clearAll() {
        this.builtObjects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.builtObjects = [];
        console.log('🗑️ Level builder cleared');
    }
}
