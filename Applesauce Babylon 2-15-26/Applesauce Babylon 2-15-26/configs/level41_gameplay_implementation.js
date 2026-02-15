/**
 * LEVEL 23 GAMEPLAY IMPLEMENTATION EXAMPLE
 * Add this to make your level fully playable!
 */

// ========================================
// 1. ROADKILL DETECTION
// ========================================

function updateRoadkillDetection(game) {
    if (!game.playerModule || !game.gore) return;
    
    const playerPos = game.playerModule.getPosition();
    const playerSpeed = game.playerModule.getSpeed();
    
    // Only check if moving fast enough
    if (playerSpeed < 10) return;
    
    for (let [id, ragdoll] of game.gore.ragdolls) {
        if (!ragdoll.alive) continue;
        
        const ragdollPos = ragdoll.root.position;
        const distance = BABYLON.Vector3.Distance(playerPos, ragdollPos);
        
        // Collision radius
        if (distance < 2.5) {
            console.log(`💀 ROADKILL! Speed: ${playerSpeed.toFixed(1)}m/s`);
            
            // Kill ragdoll
            ragdoll.alive = false;
            ragdoll.health = 0;
            game.gore.stats.totalDeaths++;
            
            // Increment counter
            game.state.roadkills = (game.state.roadkills || 0) + 1;
            
            // Add score
            game.state.score = (game.state.score || 0) + 500;
            
            // Apply huge force to ragdoll (launch it!)
            const launchDir = ragdollPos.subtract(playerPos).normalize();
            const launchForce = launchDir.scale(playerSpeed * 100);
            
            Object.values(ragdoll.bodies).forEach(part => {
                part.aggregate.body.applyImpulse(
                    launchForce,
                    part.mesh.getAbsolutePosition()
                );
            });
            
            console.log(`📊 Total roadkills: ${game.state.roadkills}/10`);
        }
    }
}

// ========================================
// 2. KICKFLIP TRACKING
// ========================================

function setupKickflipTracking(game) {
    let kickflipActive = false;
    
    game.scene.onKeyboardObservable.add((kbInfo) => {
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            if (kbInfo.event.key.toLowerCase() === 'e') {
                // Start kickflip
                kickflipActive = true;
                game.playerModule.doKickflip();
                
                console.log('🛹 Kickflip started!');
                
                // Check if landed after animation
                setTimeout(() => {
                    if (kickflipActive && game.playerModule.onGround) {
                        // Successful landing!
                        game.state.kickflips = (game.state.kickflips || 0) + 1;
                        game.state.score = (game.state.score || 0) + 1000;
                        
                        console.log(`✅ Kickflip landed! Total: ${game.state.kickflips}/5`);
                        kickflipActive = false;
                    } else if (kickflipActive) {
                        console.log('❌ Kickflip failed - didn\'t land!');
                        kickflipActive = false;
                    }
                }, 800); // Kickflip animation time
            }
        }
    });
}

// ========================================
// 3. ENEMY AI - WANDER BEHAVIOR
// ========================================

function updateWanderAI(game, deltaTime) {
    if (!game.gore) return;
    
    for (let [id, ragdoll] of game.gore.ragdolls) {
        if (!ragdoll.alive || !ragdoll.metadata) continue;
        
        if (ragdoll.metadata.behavior === 'wander') {
            // Initialize wander target if needed
            if (!ragdoll.wanderTarget) {
                ragdoll.wanderTarget = {
                    x: ragdoll.root.position.x + (Math.random() - 0.5) * ragdoll.metadata.wanderRadius * 2,
                    z: ragdoll.root.position.z + (Math.random() - 0.5) * ragdoll.metadata.wanderRadius * 2,
                    timer: 0
                };
            }
            
            // Move toward wander target
            const currentPos = ragdoll.root.position;
            const targetPos = new BABYLON.Vector3(
                ragdoll.wanderTarget.x,
                currentPos.y,
                ragdoll.wanderTarget.z
            );
            
            const direction = targetPos.subtract(currentPos).normalize();
            const force = direction.scale(ragdoll.metadata.speed * 500);
            
            // Apply force to lower torso (main physics body)
            if (ragdoll.bodies.lowerTorso) {
                ragdoll.bodies.lowerTorso.aggregate.body.applyForce(
                    force,
                    ragdoll.bodies.lowerTorso.mesh.getAbsolutePosition()
                );
            }
            
            // Update timer
            ragdoll.wanderTarget.timer += deltaTime;
            
            // Pick new target every 3 seconds
            if (ragdoll.wanderTarget.timer > 3) {
                ragdoll.wanderTarget = null;
            }
        }
    }
}

// ========================================
// 4. ENEMY AI - PATROL BEHAVIOR
// ========================================

function updatePatrolAI(game, deltaTime) {
    if (!game.gore) return;
    
    for (let [id, ragdoll] of game.gore.ragdolls) {
        if (!ragdoll.alive || !ragdoll.metadata) continue;
        
        if (ragdoll.metadata.behavior === 'patrol' && ragdoll.metadata.patrolPoints) {
            // Initialize patrol state
            if (!ragdoll.patrolState) {
                ragdoll.patrolState = {
                    currentIndex: 0,
                    direction: 1
                };
            }
            
            const points = ragdoll.metadata.patrolPoints;
            const currentPoint = points[ragdoll.patrolState.currentIndex];
            const currentPos = ragdoll.root.position;
            
            const targetPos = new BABYLON.Vector3(
                currentPoint.x,
                currentPos.y,
                currentPoint.z
            );
            
            const distance = BABYLON.Vector3.Distance(currentPos, targetPos);
            
            // If reached patrol point, move to next
            if (distance < 2) {
                ragdoll.patrolState.currentIndex += ragdoll.patrolState.direction;
                
                // Reverse direction at ends
                if (ragdoll.patrolState.currentIndex >= points.length - 1) {
                    ragdoll.patrolState.direction = -1;
                } else if (ragdoll.patrolState.currentIndex <= 0) {
                    ragdoll.patrolState.direction = 1;
                }
            }
            
            // Move toward current patrol point
            const direction = targetPos.subtract(currentPos).normalize();
            const force = direction.scale(ragdoll.metadata.speed * 500);
            
            if (ragdoll.bodies.lowerTorso) {
                ragdoll.bodies.lowerTorso.aggregate.body.applyForce(
                    force,
                    ragdoll.bodies.lowerTorso.mesh.getAbsolutePosition()
                );
            }
        }
    }
}

// ========================================
// 5. BOSS AI - AGGRESSIVE CHASE
// ========================================

function updateBossAI(game, deltaTime) {
    if (!game.gore || !game.playerModule) return;
    
    for (let [id, ragdoll] of game.gore.ragdolls) {
        if (!ragdoll.alive || !ragdoll.metadata) continue;
        
        if (ragdoll.metadata.isBoss) {
            const playerPos = game.playerModule.getPosition();
            const bossPos = ragdoll.root.position;
            
            // Calculate direction to player
            const direction = playerPos.subtract(bossPos);
            direction.y = 0; // Don't fly!
            const dir = direction.normalize();
            
            // Apply aggressive force
            const force = dir.scale(ragdoll.metadata.speed * 1000);
            
            if (ragdoll.bodies.lowerTorso) {
                ragdoll.bodies.lowerTorso.aggregate.body.applyForce(
                    force,
                    ragdoll.bodies.lowerTorso.mesh.getAbsolutePosition()
                );
            }
            
            // Check if boss caught player
            const distance = BABYLON.Vector3.Distance(playerPos, bossPos);
            if (distance < 3) {
                console.log('💀 BOSS HIT YOU!');
                // TODO: Damage player, game over, etc
            }
        }
    }
}

// ========================================
// 6. GROUND DETECTION FOR PLAYER
// ========================================

function updateGroundDetection(game) {
    if (!game.playerModule) return;
    
    const playerPos = game.playerModule.getPosition();
    const velocity = game.playerModule.getVelocity();
    
    // Simple ground check - if Y velocity is near zero and low altitude
    game.playerModule.onGround = (Math.abs(velocity.y) < 0.5 && playerPos.y < 5);
}

// ========================================
// 7. HUD UPDATE
// ========================================

function updateHUD(game) {
    // Update roadkill counter
    const roadkillEl = document.getElementById('roadkills');
    if (roadkillEl) {
        roadkillEl.textContent = `${game.state.roadkills || 0}/10`;
    }
    
    // Update kickflip counter
    const kickflipEl = document.getElementById('kickflips');
    if (kickflipEl) {
        kickflipEl.textContent = `${game.state.kickflips || 0}/5`;
    }
    
    // Update score
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
        scoreEl.textContent = game.state.score || 0;
    }
    
    // Check objectives
    const roadkillComplete = (game.state.roadkills || 0) >= 10;
    const kickflipComplete = (game.state.kickflips || 0) >= 5;
    
    if (roadkillComplete && kickflipComplete && !game.bossSpawned) {
        console.log('🎯 ALL OBJECTIVES COMPLETE!');
        console.log('👹 SPAWNING BOSS...');
        // Boss spawn is handled by level config
        game.bossSpawned = true;
    }
}

// ========================================
// INTEGRATION WITH LEVEL
// ========================================

// Add to Level23Config.onLevelStart:
/*
onLevelStart: async function(game) {
    // ... existing code ...
    
    // Setup gameplay systems
    setupKickflipTracking(game);
    
    console.log('✅ Gameplay systems initialized!');
}
*/

// Add to Level23Config.onUpdate:
/*
onUpdate: function(game) {
    const deltaTime = game.getDeltaTime();
    
    // Core gameplay
    updateGroundDetection(game);
    updateRoadkillDetection(game);
    
    // Enemy AI
    updateWanderAI(game, deltaTime);
    updatePatrolAI(game, deltaTime);
    updateBossAI(game, deltaTime);
    
    // UI
    updateHUD(game);
    
    // Check objectives (from level config)
    if (this.checkObjectives) {
        this.checkObjectives();
    }
}
*/

// ========================================
// SIMPLE HUD HTML
// ========================================

/*
Add this to your HTML:

<div id="hud" style="position: absolute; top: 20px; left: 20px; color: #0f0; 
     background: rgba(0,0,0,0.8); padding: 20px; font-family: monospace;">
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">
        🛹 PARADELI PARK
    </div>
    
    <div style="margin: 10px 0;">
        <div style="color: #888; font-size: 12px;">OBJECTIVES</div>
        <div>💀 Roadkills: <span id="roadkills">0/10</span></div>
        <div>🛹 Kickflips: <span id="kickflips">0/5</span></div>
    </div>
    
    <div style="margin: 10px 0; padding-top: 10px; border-top: 1px solid #0f0;">
        <div style="color: #888; font-size: 12px;">SCORE</div>
        <div style="font-size: 20px; color: #ff0;"><span id="score">0</span></div>
    </div>
    
    <div style="margin-top: 15px; font-size: 11px; color: #888;">
        <div>WASD - Move</div>
        <div>SPACE - Jump</div>
        <div>E - Kickflip</div>
    </div>
</div>
*/

console.log('✅ Gameplay implementation loaded');
console.log('📝 Copy functions to Level23Config.onUpdate to activate!');
