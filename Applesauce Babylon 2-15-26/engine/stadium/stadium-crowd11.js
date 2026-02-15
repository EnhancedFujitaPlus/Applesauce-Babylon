class StadiumCrowd {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        
        this.crowdMembers = [];
        this.sections = new Map(); // section name -> fans array
        
        this.crowdMood = 0.5;
        this.homeTeamColor = config.homeTeamColor;
        this.awayTeamColor = config.awayTeamColor;
    }
    
    populateSection(section) {
        const fans = [];
        const focalPoint = { x: 0, y: 0, z: 0 }; // Center of rink
        
        for (let row = 0; row < section.rows; row++) {
            for (let seat = 0; seat < section.seatsPerRow; seat++) {
                // Calculate position
                const x = section.position.x + (seat * 0.5) - (section.seatsPerRow * 0.25);
                const y = section.position.y + (row * 0.5);
                const z = section.position.z + (row * 0.5) * Math.sin(section.rotation);
                
                // Determine fan color
                let color;
                if (section.teamColor) {
                    // Dedicated section - mostly team color with some variance
                    color = Math.random() > 0.2 ? section.teamColor : 0xffffff;
                } else {
                    // Mixed section - random team colors
                    color = Math.random() > 0.5 ? this.homeTeamColor : this.awayTeamColor;
                }
                
                // Calculate rotation to look at center
                const rotation = Math.atan2(
                    focalPoint.x - x,
                    focalPoint.z - z
                );
                
                const fan = this.createFan(x, y, z, color, rotation, section.name);
                fans.push(fan);
            }
        }
        
        this.sections.set(section.name, fans);
        console.log(`  Section ${section.name}: ${fans.length} fans`);
    }
    
    createFan(x, y, z, color, rotation, sectionName) {
        const fan = {
            position: new THREE.Vector3(x, y, z),
            rotation: rotation,
            color: color,
            section: sectionName,
            mesh: null,
            
            // Personality
            personality: {
                enthusiasm: 0.3 + Math.random() * 0.7,
                reactSpeed: 0.5 + Math.random() * 1.5,
                conformity: Math.random(),
                drunkness: Math.random() * 0.3
            },
            
            // Animation state
            state: 'idle',
            stateTimer: Math.random() * 5,
            animationPhase: Math.random() * Math.PI * 2,
            
            baseY: y,
            currentY: y,
            velocityY: 0,
            
            armWavePhase: Math.random() * Math.PI * 2,
            
            hasBlood: false,
            bloodAmount: 0,
            
            radius: 0.25,
            active: true
        };
        
        // Create mesh (r182 has CapsuleGeometry!)
        const geometry = new THREE.CapsuleGeometry(0.15, 0.4, 4, 8);
        const material = new THREE.MeshLambertMaterial({ 
            color,
            emissive: color,
            emissiveIntensity: 0.05
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.copy(fan.position);
        mesh.rotation.y = rotation;
        mesh.userData.crowdMember = fan;
        fan.mesh = mesh;
        
        this.scene.add(mesh);
        this.crowdMembers.push(fan);
        
        return fan;
    }
    
    update(deltaTime, gameTime) {
        // Decay mood
        if (this.crowdMood > 0.5) {
            this.crowdMood -= deltaTime * 0.05;
        } else if (this.crowdMood < 0.5) {
            this.crowdMood += deltaTime * 0.05;
        }
        
        // Update each fan
        for (let fan of this.crowdMembers) {
            if (!fan.active) continue;
            
            this.updateFanState(fan, deltaTime);
            this.animateFan(fan, gameTime, deltaTime);
        }
    }
    
    updateFanState(fan, deltaTime) {
        fan.stateTimer -= deltaTime;
        
        if (fan.stateTimer <= 0) {
            const moodInfluence = this.crowdMood * fan.personality.conformity;
            const randomness = (1 - fan.personality.conformity) * Math.random();
            const totalExcitement = moodInfluence + randomness;
            
            if (totalExcitement > 0.8) {
                fan.state = 'jumping';
                fan.stateTimer = 2 + Math.random() * 2;
            } else if (totalExcitement > 0.6) {
                fan.state = 'cheering';
                fan.stateTimer = 3 + Math.random() * 3;
            } else if (totalExcitement < 0.2) {
                fan.state = 'booing';
                fan.stateTimer = 1 + Math.random() * 2;
            } else {
                fan.state = 'idle';
                fan.stateTimer = 3 + Math.random() * 5;
            }
        }
    }
    
    animateFan(fan, gameTime, deltaTime) {
        switch(fan.state) {
            case 'idle':
                const breath = Math.sin(gameTime * 2 + fan.animationPhase) * 0.02;
                fan.mesh.scale.y = 1 + breath;
                break;
                
            case 'cheering':
                const bounce = Math.abs(Math.sin(gameTime * 3 + fan.animationPhase)) * 0.15;
                fan.mesh.position.y = fan.currentY + bounce;
                const pulse = 1 + Math.sin(gameTime * 5 + fan.animationPhase) * 0.05;
                fan.mesh.scale.set(pulse, pulse, pulse);
                break;
                
            case 'booing':
                fan.mesh.scale.y = 0.95;
                const shake = Math.sin(gameTime * 8 + fan.animationPhase) * 0.1;
                fan.mesh.rotation.x = shake;
                break;
                
            case 'jumping':
                const gravity = -9.8;
                fan.velocityY += gravity * deltaTime * 0.3;
                fan.currentY += fan.velocityY * deltaTime;
                
                if (fan.currentY <= fan.baseY) {
                    fan.currentY = fan.baseY;
                    fan.velocityY = 2 + fan.personality.enthusiasm * 2;
                }
                
                fan.mesh.position.y = fan.currentY;
                break;
        }
        
        // Drunk swaying
        if (fan.personality.drunkness > 0.1) {
            const sway = Math.sin(gameTime * 0.5 + fan.animationPhase) * 
                         fan.personality.drunkness * 0.1;
            fan.mesh.rotation.z = sway;
        }
        
        // Blood effect
        if (fan.hasBlood) {
            fan.mesh.material.emissive.setHex(0x660000);
            fan.mesh.material.emissiveIntensity = fan.bloodAmount * 0.3;
        }
    }
    
    // EVENTS
    onGoalScored(teamColor) {
        console.log('Crowd reacting to GOAL!');
        this.crowdMood = 1.0;
        
        for (let fan of this.crowdMembers) {
            if (fan.color === teamColor) {
                // Supporters EXPLODE with joy
                fan.state = 'jumping';
                fan.stateTimer = 8;
                
                fan.mesh.material.emissiveIntensity = 0.5;
                setTimeout(() => {
                    fan.mesh.material.emissiveIntensity = 0.05;
                }, 300);
            } else {
                // Opponents boo
                fan.state = 'booing';
                fan.stateTimer = 4;
            }
        }
    }
    
    onFightKill(position) {
        this.crowdMood = Math.min(this.crowdMood + 0.2, 1.0);
        
        for (let fan of this.crowdMembers) {
            const dist = fan.position.distanceTo(position);
            if (dist < 15) {
                fan.state = 'cheering';
                fan.stateTimer = 5;
            }
        }
    }
    
    onBigHit(position, damage) {
        const hype = damage / 100;
        this.crowdMood = Math.min(this.crowdMood + hype * 0.1, 1.0);
    }
    
    onBloodSplatter(amount) {
        this.crowdMood = Math.min(this.crowdMood + amount * 0.05, 1.0);
    }
    
    startStadiumWave(startX, startZ, direction) {
        for (let fan of this.crowdMembers) {
            const dx = fan.position.x - startX;
            const dz = fan.position.z - startZ;
            const distance = dx * direction.x + dz * direction.z;
            const delay = distance * 0.1;
            
            if (delay > 0) {
                setTimeout(() => {
                    fan.state = 'jumping';
                    fan.stateTimer = 1.5;
                    fan.velocityY = 3;
                }, delay * 1000);
            }
        }
    }
    
    getFansNearPosition(position, radius) {
        return this.crowdMembers.filter(fan => 
            fan.position.distanceTo(position) < radius
        );
    }
    
    getTotalFans() {
        return this.crowdMembers.length;
    }
}