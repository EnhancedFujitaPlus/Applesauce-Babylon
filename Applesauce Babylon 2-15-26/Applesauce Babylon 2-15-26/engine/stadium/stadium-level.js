class StadiumLevel {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        
        // Team colors
        this.homeTeamColor = 0xff0000; // Red
        this.awayTeamColor = 0x0000ff; // Blue
        
        // Scores
        this.homeTeamScore = 0;
        this.awayTeamScore = 0;
        
        // Stadium components
        this.rink = null;
        this.stands = null;
        this.crowd = null;
        this.lighting = null;
        
        this.init();
    }
    
    init() {
        console.log('🏟️ Building Stadium...');
        
        // Build rink (ice surface)
        this.rink = new StadiumRink(this.scene, {
            width: 90,
            length: 50
        });
        
        // Build stands (bleachers)
        this.stands = new StadiumStands(this.scene);
        
        // Build lighting
        this.lighting = new StadiumLighting(this.scene);
        
        // Generate crowd
        this.initializeCrowd();
        
        console.log('✅ Stadium complete!');
    }
    
    initializeCrowd() {
        this.crowd = new StadiumCrowd(this.scene, {
            homeTeamColor: this.homeTeamColor,
            awayTeamColor: this.awayTeamColor
        });
        
        // Define crowd sections based on your old Level_11.html
        const crowdSpecs = {
            sections: [
                // Home side (left) - RED TEAM
                {
                    name: 'home-lower',
                    startX: 35,
                    startY: 20,
                    startZ: 120,
                    rows: 15,
                    seatsPerRow: 50,
                    spacingX: 0.5,
                    spacingY: 0.5,
                    spacingZ: 0.5,
                    rotation: Math.PI /24, // Face center
                    teamColorA: this.homeTeamColor,
                    teamColorB: 0xffffff
                },
                {
                    name: 'home-upper',
                    startX: 35,
                    startY: -10,
                    startZ: -12,
                    rows: 20,
                    seatsPerRow: 600,
                    spacingX: 0.5,
                    spacingY: 0.5,
                    spacingZ: 0.5,
                    rotation: Math.PI / 2,
                    teamColorA: this.homeTeamColor,
                    teamColorB: 0xffffff
                },
                
                // Away side (right) - BLUE TEAM
                {
                    name: 'away-lower',
                    startX: 35,
                    startY: 2,
                    startZ: -12,
                    rows: 15,
                    seatsPerRow: 50,
                    spacingX: 0.5,
                    spacingY: 0.5,
                    spacingZ: 0.5,
                    rotation: -Math.PI / 2,
                    teamColorA: this.awayTeamColor,
                    teamColorB: 0xffffff
                },
                {
                    name: 'away-upper',
                    startX: 35,
                    startY: 10,
                    startZ: -12,
                    rows: 20,
                    seatsPerRow: 60,
                    spacingX: 0.5,
                    spacingY: 0.5,
                    spacingZ: 0.5,
                    rotation: -Math.PI / 2,
                    teamColorA: this.awayTeamColor,
                    teamColorB: 0xffffff
                },
                
                // North end - MIXED
                {
                    name: 'north',
                    startX: -15,
                    startY: 2,
                    startZ: -25,
                    rows: 10,
                    seatsPerRow: 30,
                    spacingX: 0.5,
                    spacingY: 0.5,
                    spacingZ: 0.5,
                    rotation: -Math.PI / -180,
                    teamColorA: this.homeTeamColor,
                    teamColorB: this.awayTeamColor
                },
                
                // South end - MIXED
                {
                    name: 'south',
                    startX: -15,
                    startY: 2,
                    startZ: 20,
                    rows: 10,
                    seatsPerRow: 30,
                    spacingX: 0.5,
                    spacingY: 0.5,
                    spacingZ: 0.5,
                    rotation: Math.PI / 2,
                    teamColorA: this.homeTeamColor,
                    teamColorB: this.awayTeamColor
                }
            ]
        };
        
        // Generate the crowd!
        this.crowd.generateCrowd(crowdSpecs);
        
        console.log(`👥 ${this.crowd.getTotalFans()} fans generated!`);
    }
    
    update(deltaTime, gameTime) {
        // Update crowd animations
        if (this.crowd) {
            this.crowd.update(deltaTime, gameTime);
        }
    }
    
    // =============================
    // GAME EVENT HANDLERS
    // =============================
    
    onEnemyKilled(enemy) {
        // Random goal scoring
        if (Math.random() > 0.6) {
            const scoringTeam = Math.random() > 0.5 ? 'home' : 'away';
            
            if (scoringTeam === 'home') {
                this.homeTeamScore++;
                this.onGoalScored(this.homeTeamColor, enemy.position);
            } else {
                this.awayTeamScore++;
                this.onGoalScored(this.awayTeamColor, enemy.position);
            }
        }
        
        // Crowd loves violence
        this.crowd.onFightKill(enemy.position);
    }
    
    onGoalScored(teamColor, position) {
        console.log('🚨 GOAL SCORED!');
        this.crowd.onGoalScored(teamColor);
        
        // Flash the lights
        if (this.lighting) {
            this.lighting.goalFlash(teamColor);
        }
    }
    
    onPlayerHit(damage, position) {
        this.crowd.onBigHit(position, damage);
    }
    
    onBloodSpill(amount, position) {
        this.crowd.onBloodSplatter(amount);
        
        // Splatter on nearby fans
        const nearbyFans = this.crowd.getFansNearPosition(position, 5);
        for (let fan of nearbyFans) {
            this.addBloodToFan(fan, amount);
        }
    }
    
    addBloodToFan(fan, amount) {
        if (!fan.hasBlood) {
            fan.hasBlood = true;
            fan.bloodAmount = 0;
        }
        
        fan.bloodAmount = Math.min(fan.bloodAmount + amount * 0.1, 1.0);
        
        // Darken material with blood
        fan.mesh.material.emissive.setHex(0x660000);
        fan.mesh.material.emissiveIntensity = fan.bloodAmount * 0.5;
    }
    
    startStadiumWave() {
        console.log('🌊 STARTING STADIUM WAVE!');
        this.crowd.startStadiumWave(-35, 0, { x: 1, z: 0 });
    }
}