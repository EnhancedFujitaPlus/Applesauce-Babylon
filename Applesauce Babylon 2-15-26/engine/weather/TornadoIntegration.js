/**
 * LEVEL 8 TORNADO INTEGRATION
 * Add these code blocks to your Level_8.html
 */

// ============================================
// STEP 1: Add TornadoSystem.js to your HTML
// ============================================
// In the <head> section, after Three.js script tag, add:
/*
<script src="TornadoSystem.js"></script>
*/


// ============================================
// STEP 2: Initialize Tornado After Terrain
// ============================================
// After you create the terrain (around line 220), add:

let tornado = null;

// Create tornado that moves across the farm
function initializeTornado() {
    tornado = new TornadoSystem(scene, terrain, {
        startX: -50,           // Start off to the side
        startZ: 100,           // Far away initially
        velocityX: 0.12,       // Move across the level
        velocityZ: -0.08,      // Move toward player
        radius: 10,            // Big enough to be scary
        height: 40,            // Tall funnel
        strength: 0.5,         // Strong pull
        rotationSpeed: 0.2,    // Fast spin
        deformRate: 0.03,      // Carves deep grooves
        lifetime: 5000         // Lasts ~83 seconds
    });
    
    console.log("🌪️ TORNADO SPAWNED! Watch out!");
}

// Call this after terrain is created (around line 250)
initializeTornado();


// ============================================
// STEP 3: Update Tornado in Game Loop
// ============================================
// In your update() function (around line 1200), add tornado update:

function update() {
    // ... existing code ...
    
    // === TORNADO UPDATE ===
    if (tornado && tornado.isActive) {
        // Update tornado position and visuals
        tornado.update(player.position);
        
        // Apply tornado physics to player
        const tornadoForce = tornado.applyPhysicsToObject(player.position, 'player');
        
        if (tornadoForce) {
            // Pull player toward tornado
            state.velocityX += tornadoForce.pullX;
            state.velocityZ += tornadoForce.pullZ;
            
            // Lift player upward
            if (state.grounded) {
                state.jumpVelocity = tornadoForce.lift * 0.8;
                state.grounded = false;
                state.jumping = true;
            }
            
            // Spin the player!
            state.rotation += tornadoForce.spin;
            
            // Visual feedback
            if (tornado.isInsideTornado(player.position)) {
                // Player is INSIDE the tornado - crazy effects!
                deck.rotation.z += 0.1; // Spin the deck
                
                // Flash the screen (optional)
                scene.fog.color.setHex(0x404040);
                setTimeout(() => {
                    scene.fog.color.setHex(0x87CEEB);
                }, 100);
            }
        }
        
        // Apply tornado to cows
        cows.forEach(cow => {
            if (!cow.userData.tipped) {
                const cowForce = tornado.applyPhysicsToObject(cow.position, 'cow');
                
                if (cowForce && cowForce.pullX !== undefined) {
                    // Tornado tips cows automatically!
                    const forceStrength = tornado.getForceAtPosition(cow.position);
                    
                    if (forceStrength > 0.3) {
                        tipCow(cow, true); // Auto-tip from tornado
                        
                        // Add cow to tornado debris (optional)
                        cow.userData.inTornado = true;
                        cow.userData.tornadoAngle = Math.random() * Math.PI * 2;
                    }
                }
            }
            
            // Animate cows caught in tornado
            if (cow.userData.inTornado) {
                cow.userData.tornadoAngle += 0.1;
                const dist = 5;
                cow.position.x = tornado.position.x + Math.cos(cow.userData.tornadoAngle) * dist;
                cow.position.z = tornado.position.z + Math.sin(cow.userData.tornadoAngle) * dist;
                cow.position.y += 0.15; // Lift upward
                cow.rotation.x += 0.05;
                cow.rotation.z += 0.08;
            }
        });
        
        // Optional: Destroy objects in tornado's path
        buildings.forEach(building => {
            if (tornado.isInsideTornado(building.position)) {
                // Create destruction effects
                createDebris(building.position, 'building', 15);
                scene.remove(building);
                buildings = buildings.filter(b => b !== building);
            }
        });
    }
    
    // ... rest of existing code ...
}


// ============================================
// STEP 4: Advanced Features (Optional)
// ============================================

// Create debris when tornado destroys things
function createDebris(position, type, count = 10) {
    for (let i = 0; i < count; i++) {
        const size = Math.random() * 0.5 + 0.2;
        const debris = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            new THREE.MeshBasicMaterial({
                color: type === 'building' ? 0x8B4513 : 0x654321
            })
        );
        
        debris.position.copy(position);
        debris.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            Math.random() * 0.4 + 0.2,
            (Math.random() - 0.5) * 0.3
        );
        debris.lifetime = 200;
        
        scene.add(debris);
        state.gibs.push(debris); // Add to existing gibs system
    }
}


// Spawn multiple tornados at different times
function spawnTornadoWave() {
    const tornado1 = new TornadoSystem(scene, terrain, {
        startX: -60,
        startZ: 120,
        velocityX: 0.15,
        velocityZ: -0.1,
        radius: 8
    });
    
    setTimeout(() => {
        const tornado2 = new TornadoSystem(scene, terrain, {
            startX: 60,
            startZ: 150,
            velocityX: -0.12,
            velocityZ: -0.15,
            radius: 12,
            strength: 0.6
        });
    }, 10000); // Second tornado after 10 seconds
}


// Make tornado chase the player
function updateTornadoAI() {
    if (tornado && tornado.isActive) {
        const dx = player.position.x - tornado.position.x;
        const dz = player.position.z - tornado.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > 30) {
            // Chase player when far away
            tornado.setVelocity(
                (dx / distance) * 0.15,
                (dz / distance) * 0.15
            );
        } else {
            // Circle around player when close
            const angle = Math.atan2(dz, dx) + 0.02;
            tornado.setVelocity(
                Math.cos(angle) * 0.1,
                Math.sin(angle) * 0.1
            );
        }
    }
}


// ============================================
// STEP 5: HUD Updates
// ============================================

// Add tornado warning to HUD
// Add this div to your HTML:
/*
<div id="tornadoWarning" style="
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 48px;
    color: #FF0000;
    text-shadow: 3px 3px 0 #000;
    display: none;
    animation: pulse 1s infinite;
">
    ⚠️ TORNADO WARNING ⚠️
</div>

<style>
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
</style>
*/

// Show warning when tornado is near
function checkTornadoWarning() {
    if (tornado && tornado.isActive) {
        const dx = player.position.x - tornado.position.x;
        const dz = player.position.z - tornado.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        const warning = document.getElementById('tornadoWarning');
        if (distance < 30) {
            warning.style.display = 'block';
        } else {
            warning.style.display = 'none';
        }
    }
}

// Call in update loop:
// checkTornadoWarning();


// ============================================
// STEP 6: Scoring System
// ============================================

// Award points for surviving near tornado
function updateTornadoScore() {
    if (tornado && tornado.isActive) {
        const force = tornado.getForceAtPosition(player.position);
        
        if (force > 0.2) {
            // Player is near tornado - award danger points!
            state.score += Math.floor(force * 100);
            
            if (force > 0.6) {
                state.currentTrick = "🌪️ TORNADO SURFING!";
                state.trickTimer = 60;
            }
        }
    }
}


// ============================================
// TESTING CHECKLIST
// ============================================
/*
Test these features:

✅ Tornado spawns and moves across terrain
✅ Terrain deforms as tornado passes (check for grooves)
✅ Player gets pulled toward tornado
✅ Player gets lifted when inside tornado
✅ Cows get tipped by tornado
✅ Debris particles swirl in tornado
✅ Visual effects (funnel, cloud, dust) animate
✅ Tornado eventually dissipates after lifetime
✅ Performance stays smooth (30+ FPS)

Debug tips:
- console.log tornado position each frame
- Add visual markers to see tornado radius
- Slow down velocity to observe deformation
- Check terrain.deform() is being called
*/
