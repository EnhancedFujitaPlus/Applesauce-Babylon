// level16-config.js
const Level16Config = {
    meta: {
        name: "PYROCLASTIC PLAYGROUND",
        number: 16,
        theme: "volcanic"
    },
    
    weather: {
        type: 'volcano',
        volcanoes: [
            {
                position: new THREE.Vector3(100, 0, 100),
                height: 50,
                baseRadius: 35,
                eruptionInterval: 400,
                eruptionDuration: 200,
                projectileCount: 20
            },
            {
                position: new THREE.Vector3(-120, 0, -80),
                height: 40,
                baseRadius: 28,
                eruptionInterval: 500,
                eruptionDuration: 150,
                projectileCount: 15
            }
        ]
    },
    
    destructibles: {
        enableDestruction: true,
        trees: { health: 50, destructible: true },
        buildings: { health: 200, destructible: true }
    },
    
    objectives: {
        survive: { duration: 300 }, // Survive 300 seconds
        score: { target: 50000 },
        dodgeLava: { target: 100 } // Dodge 100 lava rocks
    }
};