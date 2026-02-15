class StadiumRink {
    constructor(scene, config) {
        this.scene = scene;
        
        // Ice surface with realistic material
        const iceGeometry = new THREE.PlaneGeometry(config.width, config.length);
        const iceMaterial = new THREE.MeshStandardMaterial({
            color: 0xd0e7f0,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x334455,
            emissiveIntensity: 0.1
        });
        
        const ice = new THREE.Mesh(iceGeometry, iceMaterial);
        ice.rotation.x = -Math.PI / 2;
        ice.receiveShadow = true;
        scene.add(ice);
        
        // Add hockey lines
        this.addHockeyLines(config.width, config.length);
        
        // Boards around rink
        this.addBoards(config.width, config.length);
    }
    
    addHockeyLines(width, length) {
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        
        // Center red line
        const centerLine = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, length),
            lineMaterial
        );
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.y = 0.01;
        this.scene.add(centerLine);
        
        // Blue lines
        const blueLineMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        
        const blueLine1 = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, length),
            blueLineMaterial
        );
        blueLine1.rotation.x = -Math.PI / 2;
        blueLine1.position.set(-width * 0.25, 0.01, 0);
        this.scene.add(blueLine1);
        
        const blueLine2 = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, length),
            blueLineMaterial
        );
        blueLine2.rotation.x = -Math.PI / 2;
        blueLine2.position.set(width * 0.25, 0.01, 0);
        this.scene.add(blueLine2);
    }
    
    addBoards(width, length) {
        const boardHeight = 1.2;
        const boardMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            emissive: 0x333333,
            emissiveIntensity: 0.1
        });
        
        // Four walls
        const walls = [
            new THREE.BoxGeometry(width, boardHeight, 0.2),
            new THREE.BoxGeometry(width, boardHeight, 0.2),
            new THREE.BoxGeometry(0.2, boardHeight, length),
            new THREE.BoxGeometry(0.2, boardHeight, length)
        ];
        
        const positions = [
            [0, boardHeight/2, length/2],
            [0, boardHeight/2, -length/2],
            [width/2, boardHeight/2, 0],
            [-width/2, boardHeight/2, 0]
        ];
        
        for (let i = 0; i < walls.length; i++) {
            const wall = new THREE.Mesh(walls[i], boardMaterial);
            wall.position.set(...positions[i]);
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.scene.add(wall);
        }
    }
}