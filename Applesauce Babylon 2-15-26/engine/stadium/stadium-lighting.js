class StadiumLighting {
    constructor(scene) {
        this.scene = scene;
        this.setupLights();
    }
    
    setupLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambient);
        
        // Spotlights above rink
        this.spotlights = [];
        const spotPositions = [
            [-15, 25, -10],
            [15, 25, -10],
            [-15, 25, 10],
            [15, 25, 10]
        ];
        
        for (let pos of spotPositions) {
            const spot = new THREE.SpotLight(0xffffff, 1.5);
            spot.position.set(...pos);
            spot.castShadow = true;
            spot.angle = Math.PI / 4;
            spot.penumbra = 0.3;
            spot.decay = 2;
            spot.distance = 100;
            
            spot.shadow.mapSize.width = 1024;
            spot.shadow.mapSize.height = 1024;
            
            this.scene.add(spot);
            this.spotlights.push(spot);
        }
        
        // Directional light for overall illumination
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
        dirLight.position.set(0, 20, 0);
        this.scene.add(dirLight);
    }
    
    goalFlash(teamColor) {
        // Flash all spotlights with team color
        for (let spot of this.spotlights) {
            spot.color.setHex(teamColor);
            spot.intensity = 3.0;
        }
        
        setTimeout(() => {
            for (let spot of this.spotlights) {
                spot.color.setHex(0xffffff);
                spot.intensity = 1.5;
            }
        }, 500);
    }
}