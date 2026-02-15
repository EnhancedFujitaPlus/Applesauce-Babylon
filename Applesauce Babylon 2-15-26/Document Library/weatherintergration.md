// In your main game file
const weatherSystem = new WeatherSystem(scene, eventBus);

// Register all trees/buildings as destructible
propManager.props.forEach(prop => {
    if (prop.userData.type === 'tree' || prop.userData.type === 'building') {
        weatherSystem.registerDestructible(prop, {
            health: prop.userData.type === 'tree' ? 50 : 200,
            type: prop.userData.type,
            onDestroy: () => {
                state.score += 100; // Bonus for environmental destruction
            }
        });
    }
});

// Add volcanoes
Level16Config.weather.volcanoes.forEach(volcanoConfig => {
    weatherSystem.addWeather('volcano', volcanoConfig);
});

// In game loop
function update() {
    // ...existing code...
    
    weatherSystem.update(player.position, delta);
    
    // ...existing code...
}

// Listen for events
eventBus.on('playerHitByHazard', (data) => {
    state.health -= data.damage;
    // Camera shake, blood flash, etc.
});

eventBus.on('playerInLava', (data) => {
    state.health -= data.damage;
    // Fire effect on player
});

eventBus.on('volcanoErupting', (data) => {
    // Camera shake effect
    camera.position.x += (Math.random() - 0.5) * 0.2;
    camera.position.y += (Math.random() - 0.5) * 0.2;
});