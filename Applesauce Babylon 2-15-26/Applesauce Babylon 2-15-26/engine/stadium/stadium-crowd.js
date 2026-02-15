class StadiumCrowd {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.crowdMembers = [];
        this.crowdMood = 0.5; // 0 = bored, 1 = hyped
    }
    
    generateCrowd(specs) {
        console.log('Generating massive crowd...');
        let count = 0;
        
        for (let section of specs.sections) {
            for (let row = 0; row < section.rows; row++) {
                for (let seat = 0; seat < section.seatsPerRow; seat++) {
                    const x = section.startX + (seat * section.spacingX);
                    const y = section.startY + (row * section.spacingY);
                    const z = section.startZ + (row * section.spacingZ);
                    
                    // Team colors
                    const color = Math.random() > 0.5 ? 
                        section.teamColorA : section.teamColorB;
                    
                    this.createCrowdMember(x, y, z, color, section.rotation, section.name);
                    count++;
                }
            }
        }
        
        console.log(`✅ Created ${count} crowd members!`);
    }
    
    createCrowdMember(x, y, z, color, rotation, sectionName) {
        const member = {
            position: new THREE.Vector3(x, y, z),
            rotation: rotation,
            color: color,
            section: sectionName,
            mesh: null,
            
            personality: {
                enthusiasm: 0.3 + Math.random() * 0.7,
                reactSpeed: 0.5 + Math.random() * 1.5,
                conformity: Math.random(),
                drunkness: Math.random() * 0.3
            },
            
            state: 'idle',
            stateTimer: Math.random() * 5,
            animationPhase: Math.random() * Math.PI * 2,
            
            baseY: y,
            currentY: y,
            velocityY: 0,
            
            hasBlood: false,
            bloodAmount: 0,
            
            radius: 0.25,
            active: true
        };
        
        // r182 has CapsuleGeometry!
        const geometry = new THREE.CylinderGeometry(0.15, 0.4, 4, 8);
        const material = new THREE.MeshLambertMaterial({ 
            color,
            emissive: color,
            emissiveIntensity: 0.05
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.copy(member.position);
        mesh.rotation.y = rotation;
        mesh.castShadow = true;
        mesh.userData.crowdMember = member;
        member.mesh = mesh;
        
        this.scene.add(mesh);
        this.crowdMembers.push(member);
        
        return member;
    }
    
    update(deltaTime, gameTime) {
        // Mood decay
        if (this.crowdMood > 0.5) {
            this.crowdMood -= deltaTime * 0.05;
        } else if (this.crowdMood < 0.5) {
            this.crowdMood += deltaTime * 0.05;
        }
        
        // Update each fan
        for (let member of this.crowdMembers) {
            if (!member.active) continue;
            
            this.updateMemberState(member, deltaTime);
            this.animateMember(member, gameTime, deltaTime);
        }
    }
    
    updateMemberState(member, deltaTime) {
        member.stateTimer -= deltaTime;
        
        if (member.stateTimer <= 0) {
            const excitement = this.crowdMood * member.personality.conformity + 
                             (1 - member.personality.conformity) * Math.random();
            
            if (excitement > 0.8) {
                member.state = 'jumping';
                member.stateTimer = 2 + Math.random() * 2;
            } else if (excitement > 0.6) {
                member.state = 'cheering';
                member.stateTimer = 3 + Math.random() * 3;
            } else if (excitement < 0.2) {
                member.state = 'booing';
                member.stateTimer = 1 + Math.random() * 2;
            } else {
                member.state = 'idle';
                member.stateTimer = 3 + Math.random() * 5;
            }
        }
    }
    
    animateMember(member, gameTime, deltaTime) {
        switch(member.state) {
            case 'idle':
                const breath = Math.sin(gameTime * 2 + member.animationPhase) * 0.02;
                member.mesh.scale.y = 1 + breath;
                break;
                
            case 'cheering':
                const bounce = Math.abs(Math.sin(gameTime * 3 + member.animationPhase)) * 0.15;
                member.mesh.position.y = member.currentY + bounce;
                break;
                
            case 'booing':
                member.mesh.scale.y = 0.95;
                break;
                
            case 'jumping':
                member.velocityY += -9.8 * deltaTime * 0.3;
                member.currentY += member.velocityY * deltaTime;
                
                if (member.currentY <= member.baseY) {
                    member.currentY = member.baseY;
                    member.velocityY = 2 + member.personality.enthusiasm * 2;
                }
                
                member.mesh.position.y = member.currentY;
                break;
        }
        
        // Drunk swaying
        if (member.personality.drunkness > 0.1) {
            const sway = Math.sin(gameTime * 0.5 + member.animationPhase) * 
                         member.personality.drunkness * 0.1;
            member.mesh.rotation.z = sway;
        }
    }
    
    // Event reactions
    onGoalScored(teamColor) {
        this.crowdMood = 1.0;
        
        for (let member of this.crowdMembers) {
            if (member.color === teamColor) {
                member.state = 'jumping';
                member.stateTimer = 8;
            } else {
                member.state = 'booing';
                member.stateTimer = 4;
            }
        }
    }
    
    onFightKill(position) {
        this.crowdMood = Math.min(this.crowdMood + 0.2, 1.0);
    }
    
    onBigHit(position, damage) {
        this.crowdMood = Math.min(this.crowdMood + damage * 0.001, 1.0);
    }
    
    onBloodSplatter(amount) {
        this.crowdMood = Math.min(this.crowdMood + amount * 0.05, 1.0);
    }
    
    startStadiumWave(startX, startZ, direction) {
        for (let member of this.crowdMembers) {
            const dx = member.position.x - startX;
            const dz = member.position.z - startZ;
            const distance = dx * direction.x + dz * direction.z;
            const delay = distance * 0.1;
            
            if (delay > 0) {
                setTimeout(() => {
                    member.state = 'jumping';
                    member.stateTimer = 1.5;
                    member.velocityY = 3;
                }, delay * 1000);
            }
        }
    }
    
    getFansNearPosition(position, radius) {
        return this.crowdMembers.filter(m => 
            m.position.distanceTo(position) < radius
        );
    }
    
    getTotalFans() {
        return this.crowdMembers.length;
    }
}