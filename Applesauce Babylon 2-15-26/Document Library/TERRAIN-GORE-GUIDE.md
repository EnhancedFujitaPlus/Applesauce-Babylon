/**
 * TERRAIN-AWARE GORE SYSTEM
 * Blood physics with gravity pooling and realistic flow
 */

/*
=====================================================
WHAT'S NEW - TERRAIN-AWARE GORE
=====================================================

The gore system now has realistic terrain physics!

OLD SYSTEM:
❌ Blood just checked one point for ground
❌ Particles stopped on flat ground anywhere
❌ No slope awareness
❌ Pools were flat circles at terrain height
❌ No accumulation effects

NEW SYSTEM:
✅ Multi-point terrain sampling (like skateboard)
✅ Blood flows downhill following slopes
✅ Pools accumulate in valleys
✅ Pools conform to terrain shape
✅ Automatic pooling in low spots
✅ Larger, darker pools in valleys


=====================================================
FEATURE 1: DOWNHILL BLOOD FLOW
=====================================================

Blood now FLOWS DOWNHILL with gravity!

How it works:
1. Samples terrain slope around each blood droplet
2. Calculates downhill direction
3. Adds flow velocity in that direction
4. Blood runs down mountains into valleys

Example:
    Mountain slope:
         ╱
        ╱ 🩸 ← Blood flows down
       ╱  ↓
      ╱   ↓
     ╱____● Pool forms at bottom

Code:
    const slopeX = (hRight - hLeft) / (sampleRadius * 2);
    const slopeZ = (hFront - hBack) / (sampleRadius * 2);
    particle.velocity.x -= slopeX * flowStrength;
    particle.velocity.z -= slopeZ * flowStrength;

Settings:
    flowStrength = 0.008  // How fast blood flows downhill
    
    Increase (0.015) = Blood flows faster
    Decrease (0.003) = Blood flows slower


=====================================================
FEATURE 2: VALLEY DETECTION & POOLING
=====================================================

Blood automatically pools in low spots!

Valley detection:
    Checks if center is LOWER than surroundings
    
    Not a valley:    Valley:
       \  /             \  ●  /
        \/               \___/
         ●               Blood accumulates!

When blood stops in a valley:
✅ Converts to permanent pool
✅ Creates larger pool (1.3x size)
✅ Darker color (0x550000 vs 0x660000)
✅ Higher opacity (0.85 vs 0.7)
✅ Spawns 3 additional small pools around it

Code:
    const avgSurroundingHeight = (hNorth + hSouth + hEast + hWest) / 4;
    const isValley = hCenter < avgSurroundingHeight;
    
    if (isValley) {
        poolSize *= 1.3;  // Bigger pools in valleys
        color = 0x550000;  // Darker blood
    }


=====================================================
FEATURE 3: TERRAIN-CONFORMING POOLS
=====================================================

Pools now match the terrain shape!

OLD:                    NEW:
Flat circle:           Tilted to match slope:
    ____                   ╱‾‾‾╲
    ‾‾‾‾                  ╱     ╲
    (floating)           (conforms to terrain)

The system:
1. Samples terrain slope
2. Calculates tilt angles
3. Rotates pool to match
4. Positions at exact ground height

Code:
    const slopeX = (hEast - hWest) / (sampleRadius * 2);
    const slopeZ = (hNorth - hSouth) / (sampleRadius * 2);
    
    pool.rotation.x = -Math.PI / 2 + Math.atan(slopeZ);
    pool.rotation.z = Math.atan(slopeX);


=====================================================
FEATURE 4: MULTI-POINT TERRAIN SAMPLING
=====================================================

Blood particles use 5-point sampling (like skateboard):

    Sample pattern:
         Front
           ●
    Left ●   ● Center   ● Right
           ●
         Back

Benefits:
✅ Prevents clipping through bumps
✅ Detects slopes accurately
✅ Smooth flow over terrain
✅ Catches terrain features

Code:
    const hCenter = terrain.getHeight(px, pz);
    const hFront = terrain.getHeight(px, pz + sampleRadius);
    const hBack = terrain.getHeight(px, pz - sampleRadius);
    const hLeft = terrain.getHeight(px - sampleRadius, pz);
    const hRight = terrain.getHeight(px + sampleRadius, pz);
    
    const groundLevel = Math.max(hCenter, hFront, hBack, hLeft, hRight);


=====================================================
FEATURE 5: AUTOMATIC PARTICLE TO POOL CONVERSION
=====================================================

When blood stops moving, it becomes a pool!

Conditions:
- Velocity < 0.02 (almost stopped)
- On ground (< 0.15 units above terrain)
- In a valley OR very slow

Conversion process:
1. Marks particle as pool
2. Flattens geometry (sphere → circle)
3. Rotates to lay flat
4. Darkens color (0x4A0000)
5. Increases opacity (0.8)

Visual:
    Moving:  🩸 (sphere, flying)
           ↓
    Stopped: ● (flat circle, pooled)


=====================================================
REALISTIC BLOOD BEHAVIOR
=====================================================

SCENARIO 1: Blood on a Hill
    1. Droplets land on slope
    2. Begin rolling downhill
    3. Accelerate as they roll
    4. Pool at the bottom
    
    Result: Streak of blood down hill → Large pool at base

SCENARIO 2: Blood in Valley
    1. Droplets land around valley
    2. All flow toward center
    3. Accumulate in lowest point
    4. Create large, dark pool with satellites
    
    Result: Multiple pools converging in valley

SCENARIO 3: Blood on Flat Ground
    1. Droplets land with velocity
    2. Friction slows them quickly
    3. Stop and become flat stains
    4. No flow or pooling
    
    Result: Scattered flat blood stains

SCENARIO 4: Blood on Rough Terrain
    1. Droplets bounce over bumps
    2. Follow terrain contours
    3. Collect in depressions
    4. Create pools in every low spot
    
    Result: Blood in every crack and crevice


=====================================================
VISUAL DIFFERENCES
=====================================================

BEFORE (Old Gore):
🩸 Blood lands → stops wherever
● Pools are flat circles
All pools look the same
Blood doesn't flow anywhere

AFTER (Terrain-Aware Gore):
🩸 Blood lands → flows downhill
🩸 → 🩸 → 🩸 → ● Pools in valleys
Pools conform to terrain
Larger/darker in low spots
Realistic gravity flow


=====================================================
SETTINGS & TUNING
=====================================================

All settings in applesauce-gore-r182-TERRAIN-AWARE.js:

FLOW SPEED (Line ~504):
    const flowStrength = 0.008;
    
    0.003 = Slow trickle
    0.008 = Realistic flow (default)
    0.015 = Fast rushing blood

VALLEY POOL SIZE (Line ~396):
    const poolSize = isValley ? size * 1.3 : size;
    
    1.3 = 30% larger in valleys (default)
    1.5 = 50% larger
    2.0 = Double size in valleys

POOL DARKNESS (Line ~399):
    color: isValley ? 0x550000 : 0x660000
    
    0x550000 = Very dark (default for valleys)
    0x660000 = Medium dark (default for flat)
    0x770000 = Lighter blood

POOL OPACITY (Line ~401):
    opacity: isValley ? 0.85 : 0.7
    
    0.85 = More opaque in valleys (default)
    1.0 = Completely opaque
    0.6 = More transparent

STOPPING THRESHOLD (Line ~516):
    if (particle.velocity.length() < 0.02)
    
    0.02 = Stops quickly (default)
    0.01 = Stops very easily
    0.05 = Keeps moving longer

SAMPLE RADIUS (Line ~493):
    const sampleRadius = 0.3;
    
    0.3 = Default (responsive)
    0.5 = Larger area (smoother)
    0.1 = Tiny area (more detail)


=====================================================
PERFORMANCE IMPACT
=====================================================

OLD: 1 terrain check per blood particle
NEW: 5 terrain checks per blood particle

Performance hit: ~5-10% more CPU for gore
Worth it: YES! Much more realistic

Optimization tips:
- Limit max blood particles (line 16)
    this.maxBloodParticles = 20000 → 10000
- Reduce particle lifetime
- Use on powerful systems


=====================================================
TESTING SCENARIOS
=====================================================

To see the new gore in action:

1. MOUNTAIN TEST
   - Skate to a mountain
   - Kill enemies on slope
   - Watch blood flow downhill
   - See pool form at base

2. VALLEY TEST
   - Find a valley or depression
   - Kill enemies around edges
   - Blood flows into valley
   - Creates large dark pool

3. ROUGH TERRAIN TEST
   - Forest with bumpy ground
   - Kill enemies
   - Blood finds every low spot
   - Multiple small pools

4. FLAT GROUND TEST
   - City or beach level
   - Kill enemies
   - Blood stops quickly
   - Creates flat stains


=====================================================
TROUBLESHOOTING
=====================================================

BLOOD NOT FLOWING?
- Check terrain module is loaded
- Verify using MULTI-BIOME terrain module
- Increase flowStrength (0.008 → 0.015)
- Check terrain has actual slopes

BLOOD CLIPPING THROUGH TERRAIN?
- Using multi-point sampling should prevent this
- If still happens, increase sampleRadius (0.3 → 0.5)
- Check terrain resolution is adequate

POOLS NOT FORMING IN VALLEYS?
- Terrain might not have clear valleys
- Lower stopping threshold (0.02 → 0.01)
- Increase valley detection sensitivity

BLOOD FLOWING TOO FAST?
- Decrease flowStrength (0.008 → 0.003)
- Increase friction (0.92 → 0.85)
- Decrease gravity (0.015 → 0.01)

POOLS TOO SMALL/BIG?
- Adjust valley pool multiplier (1.3 → your value)
- Change base pool size in createBloodPool call
- Modify satellite pool count (3 → your value)


=====================================================
COMPATIBILITY
=====================================================

Requires:
✅ applesauce-terrain-r182-MULTI-BIOME.js (with getHeight)
✅ Three.js r182

Works with:
✅ All terrain types (procedural, segmented, multi-biome)
✅ All existing gore features
✅ Existing levels

Optional enhancements:
- Combine with EXTREME-TERRAIN core for best results
- Use high terrain resolution (120+) for best flow
- Multi-biome levels show flow well


=====================================================
INSTALLATION
=====================================================

1. Replace your gore module:
   Old: applesauce-gore-r182.js
   New: applesauce-gore-r182-TERRAIN-AWARE.js

2. Make sure you have terrain module:
   File: applesauce-terrain-r182-MULTI-BIOME.js

3. Test on varied terrain (Level 38 is perfect)

4. Watch blood flow downhill and pool in valleys!

Realistic gore physics achieved! 🩸🏔️
*/
