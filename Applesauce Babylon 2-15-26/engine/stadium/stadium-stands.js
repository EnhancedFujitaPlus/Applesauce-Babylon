class StadiumStands {
    constructor(scene) {
        this.scene = scene;
        this.buildStands();
    }
    
    buildStands() {
        // Simple bleacher geometry for now
        const standMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x444444 
        });
        
        // Home side stands
        const homeStand = new THREE.Mesh(
            new THREE.BoxGeometry(2, 15, 30),
            standMaterial
        );
        homeStand.position.set(-36, 7, 0);
        homeStand.castShadow = true;
        homeStand.receiveShadow = true;
        this.scene.add(homeStand);
        
        // Away side stands
        const awayStand = new THREE.Mesh(
            new THREE.BoxGeometry(2, 15, 30),
            standMaterial
        );
        awayStand.position.set(36, 7, 0);
        awayStand.castShadow = true;
        awayStand.receiveShadow = true;
        this.scene.add(awayStand);
        
        // End stands
        const northStand = new THREE.Mesh(
            new THREE.BoxGeometry(70, 10, 2),
            standMaterial
        );
        northStand.position.set(0, 5, -26);
        northStand.castShadow = true;
        this.scene.add(northStand);
        
        const southStand = new THREE.Mesh(
            new THREE.BoxGeometry(70, 10, 2),
            standMaterial
        );
        southStand.position.set(0, 5, 26);
        southStand.castShadow = true;
        this.scene.add(southStand);
    }
}