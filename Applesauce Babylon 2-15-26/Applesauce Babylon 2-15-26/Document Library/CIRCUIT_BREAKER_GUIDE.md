# Circuit Breaker - Racing Track Level Setup Guide

## Overview
Circuit Breaker is an eco-warrior themed racing track level where you destroy fossil fuel vehicles. It's a transformation of the Wild West level structure, maintaining the same game mechanics while completely changing the setting and objectives.

## What Changed from Wild West → Racing Track

### Theme & Setting
- **Was:** Wild West town with train tracks
- **Now:** Professional racing circuit with oval track

### Main Objective
- **Was:** Moral dilemma - start train to save town but kill victims
- **Now:** Eco-activism - destroy all gas-powered vehicles to "cleanse" the circuit

### Environment
- **Buildings:** Saloon/bank/hotel → Grandstand/pit garages/control tower
- **Railroad:** Straight train tracks → Circular racing oval
- **Moving Objects:** One train moving forward → 5 racing cars circling track
- **Static Targets:** 3 victims tied to tracks → 8 parked cars in pit area

### Mechanics
- **Was:** Pull lever to start train, watch carnage unfold
- **Now:** Ram into cars at speed to explode them

### Victory Condition
- **Was:** Train reaches end (dark ending)
- **Now:** Destroy all 13 vehicles (racing cars + parked cars)

## File Structure

```
/your-game-directory/
  ├── level_circuit_breaker.html          # Main HTML file
  ├── applesauce-level-racetrack.js       # Level configuration
  ├── engine/
  │   └── applesauce-core_copy_2.js       # Core engine (reused)
  └── three.module.js                     # THREE.js library (reused)
```

## Code Reuse from Wild West Level

### What Was Kept (Same Structure)
1. ✅ **Level config format** - Same meta, scene, objectives structure
2. ✅ **NPC system** - Same dialogue format and interaction
3. ✅ **Building placement** - Same positioning logic, different types
4. ✅ **Objectives system** - Same tracking mechanism
5. ✅ **Gore system** - Same explosion/splatter effects
6. ✅ **Interactables** - Same "Press E" interaction system

### What Was Transformed
1. 🔄 **Railroad → Race Track**
   - Straight tracks → Circular oval path
   - Single train → Multiple cars circling
   - Train speed constant → Cars have individual speeds
   
2. 🔄 **Victims → Parked Cars**
   - NPCs tied to tracks → Static car meshes
   - Dialogue before death → No dialogue (they're cars!)
   - Hit by train → Hit by player
   
3. 🔄 **Lever → Collision Destruction**
   - One-time action → Continuous gameplay
   - Passive watching → Active ramming
   
4. 🔄 **Moral Choice → Eco Mission**
   - "Villain or hero?" → "Save the planet!"
   - Dark ending → Triumphant ending

## Key Features

### Racing Cars (5 total)
- Constantly circle the oval track at different speeds
- Different colors for visual variety
- Types: gas_guzzler, diesel_truck, coal_roller
- Each worth 1000 points when destroyed

### Parked Cars (8 total)
- Static targets in pit area
- Various types: SUV, pickup, sports car, sedan, van
- Random colors for variety
- Also worth 1000 points each

### Track Design
- Oval shape (wider on straightaways)
- 70-unit radius
- 15-unit width
- White center line markings
- Asphalt texture

### Objectives
1. **Explore the track** - Discover 8 areas
2. **Destroy parked vehicles** - 8 targets
3. **Destroy racing vehicles** - 5 targets
4. **Final objective** - Unlocks when all destroyed

### NPCs
- **Track Official** - Warns you not to skate
- **Pit Crew Chief** - Talks about the gas guzzlers
- **Eco-Activist** - Gives you the mission
- **Angry Driver** - Hostile NPC that chases you

## How to Play

### Controls
- **WASD** - Move around
- **SPACE** - Jump
- **Q/E** - Tricks
- **F** - Talk to NPCs
- **E** - Interact with objects

### Destruction Mechanic
1. Build up speed by skating around
2. Approach a car at high velocity (>0.3 speed)
3. Get within 3 units distance
4. **COLLISION = EXPLOSION**
5. Car explodes with gore effects
6. +1000 points

### Strategy Tips
- Racing cars are moving targets - time your approach
- Parked cars are easy targets to build your combo
- Use ramps in pit area to gain speed
- Complete exploration objective first for practice
- Save the fast racing cars for last (they're hardest)

## Visual Theme

### Colors
- **Track:** Dark asphalt (#333333)
- **UI:** Green tech theme (#00FF00)
- **Explosions:** Orange/red fireball effects
- **Buildings:** Gray/silver industrial
- **Cars:** Various vibrant colors

### Atmosphere
- Cyberpunk eco-warrior aesthetic
- Modern racing facility
- Clean tech vs. fossil fuels
- Triumphant, rebellious tone

## Customization Ideas

### Easy Changes
1. **Add more cars** - Increase racingCars or parkedCars arrays
2. **Change track shape** - Modify the oval formula in createRaceTrack
3. **Adjust difficulty** - Change car speeds or collision threshold
4. **New building types** - Add VIP lounges, media centers, etc.

### Medium Changes
1. **Multiple lap requirement** - Track player laps before allowing destruction
2. **Time limit** - Add countdown timer for urgency
3. **Car AI** - Make cars dodge or accelerate when player approaches
4. **Power-ups** - Add speed boosts or temporary invincibility

### Advanced Changes
1. **Electric vs. Gas mode** - Don't destroy electric vehicles
2. **Chain reactions** - Cars explode nearby cars
3. **Police chase** - Security vehicles pursue you after first destruction
4. **Different track layouts** - Figure-8, city circuit, drag strip

## Technical Notes

### Performance
- ~13 car objects (5 racing + 8 parked)
- Each car: ~100 vertices (simple geometry)
- Continuous update loop for 5 racing cars
- Explosion effects cleaned up automatically

### Collision Detection
```javascript
// Simple distance-based collision
const distance = Math.hypot(
    playerPos.x - carPos.x,
    playerPos.z - carPos.z
);
if (distance < 3 && speed > 0.3) {
    destroyCar(car);
}
```

### Track Path System
```javascript
// Cars follow pre-calculated oval path
car.userData.position += car.userData.speed; // 0-1 around track
const trackIndex = Math.floor(position * trackPath.length);
car.position = trackPath[trackIndex];
```

## Troubleshooting

### Cars not moving
- Check `updateRacingCar()` is being called in `onUpdate()`
- Verify `core.trackPath` is populated
- Ensure car speed values > 0

### No explosions
- Confirm gore module is enabled in ApplesauceCore init
- Check `createExplosion()` function is called
- Verify THREE.js materials support transparency

### Objectives not updating
- Check objectives module is initialized
- Verify `updateObjectiveProgress()` calls
- Ensure objective IDs match between config and code

### Cars falling through floor
- Verify terrain is created before cars
- Check car y-position is > 0
- Ensure collision bounds are correct

## Future Expansion Ideas

### Environmental Storytelling
- Protest signs around track perimeter
- Eco-activist banners in grandstand
- "Future is Electric" graffiti
- Abandoned gas stations

### Gameplay Additions
- **Combo system** - Destroy multiple cars quickly
- **Style points** - Perform tricks while destroying
- **Hidden objectives** - Secret eco-friendly sponsor to find
- **Multiple endings** - Peaceful protest vs. violent sabotage

### Artistic Enhancements
- Animated crowd reactions
- Dynamic weather (rain = harder skating)
- Day/night cycle
- Victory parade with electric vehicles

## Credits & Attribution
Based on the APPLESAUCE skateboarding engine by South of South Records
Wild West level structure adapted for eco-warrior racing track theme
Created for artists and game developers to remix and expand

---

**Have fun destroying those gas guzzlers! The planet thanks you. 🌱⚡**
