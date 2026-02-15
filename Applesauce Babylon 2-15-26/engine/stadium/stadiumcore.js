class StadiumLevel {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        
        // Import your existing modules
        this.skater = null;
        this.combat = null;
        this.gore = null;
        this.enemies = null;
        
        // Stadium-specific systems
        this.crowd = null;
        this.rink = null;
        this.stands = null;
        this.scoreboard = null;
        this.audioSystem = null;
        
        // Game state
        this.homeTeamScore = 0;
        this.awayTeamScore = 0;
        this.homeTeamColor = 0xff0000; // Red
        this.awayTeamColor = 0x0000ff; // Blue
        
        this.init();
    }
    
    init() {
        console.log('🏟️ Initializing Stadium Level...');
        
        // Build stadium structure
        this.buildRink();
        this.buildStands();
        this.buildLighting();
        this.buildScoreboard();
        
        // Initialize crowd system
        this.initializeCrowd();
        
        // Setup audio
        this.initializeAudio();
        
        // Spawn enemies (hockey players, security, etc.)
        this.spawnEnemies();
        
        console.log('✅ Stadium Level Ready!');
    }
    
    buildRink() {
        this.rink = new StadiumRink(this.scene, {
            width: 60,
            length: 30,
            surfaceType: 'ice', // or 'concrete' for skating
            centerLogo: true
        });
    }
    
    buildStands() {
        this.stands = new StadiumStands(this.scene, {
            sections: [
                // Home side (Red team)
                {
                    name: 'home-lower',
                    position: { x: -35, y: 0, z: 0 },
                    rotation: Math.PI / 2,
                    rows: 15,
                    seatsPerRow: 60,
                    teamColor: this.homeTeamColor,
                    tier: 'lower'
                },
                {
                    name: 'home-upper',
                    position: { x: -35, y: 8, z: 0 },
                    rotation: Math.PI / 2,
                    rows: 20,
                    seatsPerRow: 80,
                    teamColor: this.homeTeamColor,
                    tier: 'upper'
                },
                
                // Away side (Blue team)
                {
                    name: 'away-lower',
                    position: { x: 35, y: 0, z: 0 },
                    rotation: -Math.PI / 2,
                    rows: 15,
                    seatsPerRow: 60,
                    teamColor: this.awayTeamColor,
                    tier: 'lower'
                },
                {
                    name: 'away-upper',
                    position: { x: 35, y: 8, z: 0 },
                    rotation: -Math.PI / 2,
                    rows: 20,
                    seatsPerRow: 80,
                    teamColor: this.awayTeamColor,
                    tier: 'upper'
                },
                
                // North end (Mixed)
                {
                    name: 'north-end',
                    position: { x: 0, y: 0, z: -20 },
                    rotation: 0,
                    rows: 12,
                    seatsPerRow: 40,
                    teamColor: null, // Mixed fans
                    tier: 'lower'
                },
                
                // South end (Mixed)
                {
                    name: 'south-end',
                    position: { x: 0, y: 0, z: 20 },
                    rotation: Math.PI,
                    rows: 12,
                    seatsPerRow: 40,
                    teamColor: null,
                    tier: 'lower'
                }
            ]
        });
    }
    
    buildLighting() {
        this.lighting = new StadiumLighting(this.scene, {
            spotlights: [
                { position: { x: -20, y: 25, z: -10 }, target: { x: 0, y: 0, z: 0 } },
                { position: { x: 20, y: 25, z: -10 }, target: { x: 0, y: 0, z: 0 } },
                { position: { x: -20, y: 25, z: 10 }, target: { x: 0, y: 0, z: 0 } },
                { position: { x: 20, y: 25, z: 10 }, target: { x: 0, y: 0, z: 0 } }
            ],
            ambient: 0.3,
            rinkBrightness: 1.0
        });
    }
    
    buildScoreboard() {
        this.scoreboard = new StadiumScoreboard(this.scene, {
            position: { x: 0, y: 20, z: -25 },
            width: 15,
            height: 8
        });
    }
    
    initializeCrowd() {
        this.crowd = new StadiumCrowd(this.scene, {
            homeTeamColor: this.homeTeamColor,
            awayTeamColor: this.awayTeamColor
        });
        
        // Generate crowd for each section
        for (let section of this.stands.sections) {
            this.crowd.populateSection(section);
        }
        
        console.log(`👥 Generated ${this.crowd.getTotalFans()} fans!`);
    }
    
    initializeAudio() {
        this.audioSystem = new StadiumAudio({
            baseVolume: 0.5,
            crowdNoise: true,
            organMusic: true
        });
    }
    
    spawnEnemies() {
        // Use your existing enemies module
        // Spawn hockey players, refs, security guards, etc.
        
        // Example: Home team players
        for (let i = 0; i < 5; i++) {
            const enemy = this.game.enemySystem.spawn('hockey-player', {
                position: { x: -10 + i * 5, y: 0, z: 0 },
                team: 'home',
                color: this.homeTeamColor,
                aggressive: true
            });
        }
        
        // Away team players
        for (let i = 0; i < 5; i++) {
            const enemy = this.game.enemySystem.spawn('hockey-player', {
                position: { x: 10 + i * 5, y: 0, z: 0 },
                team: 'away',
                color: this.awayTeamColor,
                aggressive: true
            });
        }
    }
    
    update(deltaTime) {
        const gameTime = this.game.clock.getElapsedTime();
        
        // Update crowd system
        if (this.crowd) {
            this.crowd.update(deltaTime, gameTime);
        }
        
        // Update scoreboard
        if (this.scoreboard) {
            this.scoreboard.update(this.homeTeamScore, this.awayTeamScore);
        }
        
        // Update audio based on crowd mood
        if (this.audioSystem) {
            this.audioSystem.setCrowdVolume(this.crowd.crowdMood);
        }
    }
    
    // GAME EVENTS
    onEnemyKilled(enemy) {
        const isGoal = Math.random() > 0.7; // 30% chance it's a "goal"
        
        if (isGoal) {
            if (enemy.team === 'home') {
                this.awayTeamScore++;
                this.onGoalScored(this.awayTeamColor, enemy.position);
            } else {
                this.homeTeamScore++;
                this.onGoalScored(this.homeTeamColor, enemy.position);
            }
        }
        
        // Crowd reacts to violence
        this.crowd.onFightKill(enemy.position);
    }
    
    onGoalScored(teamColor, position) {
        console.log('🚨 GOAL!!!');
        
        // Trigger crowd reaction
        this.crowd.onGoalScored(teamColor);
        
        // Flash lights
        this.lighting.goalFlash(teamColor);
        
        // Scoreboard animation
        this.scoreboard.playGoalAnimation(teamColor);
        
        // Play goal horn
        this.audioSystem.playGoalHorn();
        
        // Start confetti/fireworks
        this.spawnConfetti(position);
    }
    
    onPlayerHit(damage, position) {
        // Crowd "OOOOOH"
        this.crowd.onBigHit(position, damage);
        this.audioSystem.playCrowdOoh();
    }
    
    onBloodSpill(amount, position) {
        this.crowd.onBloodSplatter(amount);
        
        // Nearby fans get blood on them (visual effect)
        const nearbyFans = this.crowd.getFansNearPosition(position, 3);
        for (let fan of nearbyFans) {
            fan.addBloodSplatter();
        }
    }
    
    startStadiumWave() {
        this.crowd.startStadiumWave(-35, 0, { x: 1, z: 0 });
    }
    
    spawnConfetti(position) {
        // Use your existing particle/gore system for confetti
        if (this.game.goreSystem) {
            this.game.goreSystem.spawnParticles('confetti', position, 100);
        }
    }
}