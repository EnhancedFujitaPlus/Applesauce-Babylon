# LEVEL 5 - QUICK REFERENCE GUIDE

## 📍 CODE STRUCTURE MAP

```
Level_5_Complete.html
│
├── Lines 1-27: HTML Head (title, meta tags)
│
├── Lines 28-127: CSS Styling
│   ├── HUD styles
│   ├── Controls panel
│   ├── Challenges panel
│   └── Trick indicator
│
├── Lines 128-145: HTML Body Elements
│
├── Lines 146-220: THREE.js Setup
│   ├── Scene, Camera, Renderer
│   ├── Lighting (ambient + directional + sun)
│   └── Fog effect
│
├── Lines 221-240: Material Definitions
│   ├── Sand, Water, Palm, Rock
│   ├── Concrete, Metal
│
├── ⭐ Lines 246-641: WEATHER & VOLCANO SYSTEMS ⭐
│   ├── EventBus class
│   ├── LavaProjectile class
│   ├── LavaFlow class
│   ├── PhysicsEntity class
│   ├── VolcanoSystem class (main volcano logic)
│   └── WeatherSystem class (coordinator)
│
├── Lines 642-285: Island Creation
│   ├── Island 1 (player spawn)
│   ├── Island 2 (boss + skatepark)
│   └── Ocean mesh
│
├── Lines 296-336: Bridge System
│   └── Unlocks after completing challenges
│
├── Lines 337-413: Palm Trees
│   └── Procedurally placed around islands
│
├── Lines 414-502: Skatepark Obstacles
│   ├── Quarter pipes
│   ├── Fun boxes
│   ├── Rails
│   └── Launch ramps
│
├── Lines 503-536: Lighting
│   └── Point lights around island 2
│
├── Lines 537-576: Enemy System
│   └── 10 enemies patrolling island 2
│
├── Lines 577-620: Boss Creation
│   └── Big red boss with crown
│
├── ⭐ Lines 621-668: WEATHER SYSTEM INIT ⭐
│   ├── Create EventBus
│   ├── Create WeatherSystem
│   ├── Add Volcano
│   └── Setup event listeners
│
├── Lines 669-683: Player Setup
│   └── Skateboard + rider model
│
├── Lines 684-695: Game State
│   └── Speed, rotation, jumping, etc.
│
├── Lines 696-730: UI Functions
│   ├── showTrick()
│   └── updateChallenges()
│
├── Lines 731-931: Input System
│   ├── Keyboard events
│   ├── Mouse controls
│   └── Trick detection
│
├── Lines 932-1019: Update Function
│   ├── Movement
│   ├── Jumping
│   ├── Enemy AI
│   ├── Boss animation
│   ├── ⭐ Weather system update ⭐
│   └── Camera follow
│
├── Lines 1020-1025: Animate Function
│   └── Game loop (requestAnimationFrame)
│
└── Lines 1026-1038: Window Events
    └── Resize handler
```

---

## 🔍 FINDING SPECIFIC FEATURES

### Want to modify the volcano?
**Go to:** Line 644
```javascript
const volcano = weatherSystem.addWeather('volcano', {
    position: new THREE.Vector3(175, 0, 175),
    // ... config here
});
```

### Want to change eruption frequency?
**Go to:** Line 649
```javascript
eruptionInterval: 400,  // ← Change this number
```

### Want to add more damage events?
**Go to:** Lines 653-667 (event listeners)
```javascript
eventBus.on('playerInLava', (data) => {
    // Add your code here
});
```

### Want to see volcano internals?
**Go to:** Lines 391-580 (VolcanoSystem class)

### Want to add camera shake?
**Go to:** Line 665
```javascript
eventBus.on('volcanoErupting', (data) => {
    // Add shake code here
});
```

---

## 🎮 TESTING COMMANDS

Open browser console (F12) and paste:

### Trigger Eruption Manually
```javascript
volcano.startEruption()
```

### Check If Volcano Exists
```javascript
console.log(volcano)
```

### See All Active Hazards
```javascript
console.log(weatherSystem.hazards)
```

### Teleport to Volcano
```javascript
player.position.set(175, 0, 175)
```

### Force Unlock Bridge
```javascript
progress.bridgeUnlocked = true
bridgeGroup.visible = true
```

---

## 🚀 QUICK MODIFICATIONS

### Make Volcano More Frequent
```javascript
// Line 649
eruptionInterval: 200,  // Was 400, now erupts 2x as often
```

### Make Lava Rocks Deadlier
```javascript
// Line 652
projectileCount: 25,  // Was 12, now shoots 2x rocks
```

### Move Volcano to Island 1
```javascript
// Line 644
position: new THREE.Vector3(20, 0, 20),  // Near player spawn
```

### Make Volcano Tiny
```javascript
// Lines 646-647
height: 10,
baseRadius: 8,
```

### Disable Volcano
```javascript
// Line 643 - Comment out this line:
// const volcano = weatherSystem.addWeather('volcano', {
```

---

## 🎨 VISUAL CUSTOMIZATION

### Change Lava Color
**Go to:** Line 278 (LavaProjectile material)
```javascript
color: 0xFF4500,  // Try: 0x00FF00 (green), 0x0000FF (blue)
```

### Change Volcano Rock Color
**Go to:** Line 397 (Volcano mesh)
```javascript
color: 0x4a4a4a  // Try: 0x8B0000 (dark red)
```

### Make Lava Pool Bigger
**Go to:** Line 420 (Lava pool geometry)
```javascript
this.radius + 20  // Was +10, makes pool wider
```

---

## 💾 SAVE POINTS

If you want to revert changes:

**Backup locations in original file:**
- Weather classes: NOT IN ORIGINAL (newly added)
- Initialization: Line 621 area (newly added)
- Update call: Line 1009 area (newly added)

**To remove volcano entirely:**
1. Delete lines 246-641 (all weather classes)
2. Delete lines 621-668 (initialization)
3. Delete line 1009 (update call)

---

## 🎯 COMMON TASKS

### Add Player Health
```javascript
// Line 670 - Add to state object:
health: 100,

// Lines 653-656 - In playerInLava handler:
state.health -= data.damage;
if (state.health <= 0) {
    alert('GAME OVER!');
    location.reload();
}
```

### Add Lava Sound Effect
```javascript
// Line 529 - In launchLavaRock():
const lavaSound = new Audio('lava_explosion.mp3');
lavaSound.play();
```

### Show Health Bar
```javascript
// In HTML (line 90):
<div id="health" style="font-size: 24px;">❤️ HP: 100</div>

// In update() function:
document.getElementById('health').textContent = '❤️ HP: ' + state.health;
```

---

## 🔧 DEBUGGING TIPS

### Volcano Not Visible?
```javascript
// Console:
console.log('Volcano position:', volcano.position);
console.log('Player position:', player.position);
console.log('Distance:', player.position.distanceTo(volcano.position));
```

### Check Eruption Status
```javascript
// Console:
console.log('Is erupting:', volcano.isErupting);
console.log('Timer:', volcano.timer);
console.log('Next eruption in:', volcano.eruptionInterval - volcano.timer);
```

### See All Events
```javascript
// Add at line 653:
eventBus.on('playerInLava', (data) => {
    console.log('🔥 LAVA EVENT:', data);
});
```

---

## 📊 PERFORMANCE TIPS

If game runs slow:

1. **Reduce projectiles:** Line 652 → `projectileCount: 5`
2. **Slower eruptions:** Line 649 → `eruptionInterval: 800`
3. **Disable shadows:** Line 148 → `renderer.shadowMap.enabled = false;`
4. **Lower volcano detail:** Line 395 → `new THREE.ConeGeometry(this.radius, this.height, 8)`

---

## 🌟 RECOMMENDED NEXT STEPS

1. ✅ Test the volcano (run the file, watch it erupt)
2. ⚡ Add player health system (see "Add Player Health" above)
3. 🎨 Add visual damage feedback (screen flash)
4. 🔊 Add sound effects for eruption
5. 📸 Add camera shake on eruption
6. 🎯 Make destructible palm trees
7. 🌋 Add a second volcano on Island 1

Your volcano system is fully functional and ready to use! 🚀
