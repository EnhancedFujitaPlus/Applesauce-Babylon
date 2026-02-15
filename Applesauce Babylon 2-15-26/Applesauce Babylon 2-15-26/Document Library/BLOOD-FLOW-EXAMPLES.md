/**
 * BLOOD FLOW VISUAL DEMONSTRATIONS
 * See exactly how terrain-aware gore behaves
 */

/*
=====================================================
SCENARIO 1: MOUNTAIN KILL
=====================================================

Before (Old System):
    ⛰️
   /  \
  /    \     🩸 Blood lands
 /  ●●  \    ● Stays where it lands
/________\   (No flow, just drops)

After (Terrain-Aware):
    ⛰️
   /  \
  / 🩸 \      🩸 Lands on slope
 /  ↓   \     ↓  Flows down
/___●●●_\     ●●● Pools at bottom

Result: Realistic blood trail down mountain!


=====================================================
SCENARIO 2: VALLEY KILL
=====================================================

Before (Old System):
      🩸
  \   ●   /   Blood scattered
   \  ●  /    No accumulation
    \ ● /     All same size
     \_/

After (Terrain-Aware):
      🩸
  \   ↓   /   Blood flows inward
   \ ↓↓↓ /    All flows to center
    \↓↓↓/     Creates large pool
     \_●_/    + Satellite pools

Result: Blood accumulates in lowest point!


=====================================================
SCENARIO 3: STEEP SLOPE
=====================================================

Old System:
    /
   /  🩸 ●
  /   (drops and stops)
 /
/

New System:
    /
   /  🩸
  /    ↘️
 /      ↘️
/________● (flows all the way down)

Shows: Blood velocity increases as it flows!


=====================================================
SCENARIO 4: BUMPY TERRAIN
=====================================================

Old:           New:
^  ●           ^
 \/●\/         \/
  ^●^           ^●
   \/●          \/●
                  ●

Blood finds    Blood collects
random spots   in every low spot


=====================================================
SCENARIO 5: FLAT vs SLOPE COMPARISON
=====================================================

FLAT GROUND:
━━━━━━━━━
  ● ● ●     Blood stops immediately
━━━━━━━━━   Small scattered pools

SLOPED GROUND:
   ╱╲
  ╱  ╲ 🩸
 ╱    ↘️    Blood rolls
╱______●    Large pool at end


=====================================================
SCENARIO 6: MULTI-KILL IN VALLEY
=====================================================

Time progression:

T=0: Enemies killed around valley
      🎮     🎮
   \    🎮    /
    \        /
     \______/

T=1: Blood begins flowing
      🩸     🩸
   \  ↓  🩸  ↓ /
    \  ↓↓↓  /
     \______/

T=2: Blood accumulates
         🩸
   \    ↓↓↓   /
    \  ↓↓↓  /
     \__●__/

T=3: Large pool forms
         
   \        /
    \  ●  /    ← Big dark pool
     \_●●_/    ← Satellite pools

Result: Dramatic blood accumulation!


=====================================================
SCENARIO 7: DOWNHILL CHASE
=====================================================

Player skating downhill killing enemies:

     🎮 Kill 1
    /    🩸
   /    /  ↓
  /    /    ● Pool 1
 /    /
/  🎮 Kill 2
    /  🩸
   /  /  ↓
  /  /    ● Pool 2
 /  /      ↓
/  /        ↓
  /          ↓
 /            ↓
/_____________●● All blood ends at bottom!

Creates: Blood river effect down the hill


=====================================================
SCENARIO 8: CLIFF EDGE
=====================================================

Old System:
    ●●● Blood stops at edge
   |
   |
   |

New System:
    🩸🩸🩸 Blood flows over
    ↓↓↓
   |↓↓↓
   |↓↓↓
   |●●● Pools at bottom


=====================================================
SCENARIO 9: NATURAL TERRAIN
=====================================================

Forest with varied elevation:

      Tree
       🌲
    /     \
   /   ●   \  Small pool in dip
  /         \
 / 🩸        \
/   ↓         \
   ●●●        | Blood flows to
  (large       | lowest points
   pool)       |
              /
             ● Another pool


=====================================================
SCENARIO 10: GORE TRAIL
=====================================================

Player leaving carnage trail:

Path: ━━━━━╲━━━━━━╱━━━━━
      ●     ╲     ╱     ●
             ↘️  ↙️
              ●●●
        (Blood pools in center dip)


=====================================================
REAL GAMEPLAY SCENARIOS
=====================================================

SKATEBOARDING DOWN MOUNTAIN:
    - Kill enemies on way down
    - Blood flows ahead of you
    - Creates blood river to bottom
    - Satisfying visual effect!

ARENA FIGHT IN VALLEY:
    - Valley becomes kill zone
    - Blood from all kills pools in center
    - Creates massive dark pool
    - Shows total carnage!

FOREST HUNT:
    - Blood in every depression
    - Natural pooling in terrain
    - Realistic aftermath
    - Every low spot has blood!

CLIFF JUMP KILLS:
    - Kill enemies at top
    - Blood flows over edge
    - Pools at bottom
    - Dramatic effect!


=====================================================
POOL SIZE REFERENCE
=====================================================

FLAT GROUND POOL:
    ●
  (size 1.0)

SMALL VALLEY POOL:
    ●●
  (size 1.3)

DEEP VALLEY POOL:
    ●●●
   ●●●●●
    ●●●
  (size 1.3 + satellites)


=====================================================
BLOOD COLOR PROGRESSION
=====================================================

Fresh Blood:     0x8B0000 (bright red)
Moving:          0x660000 (dark red)
Pooled (flat):   0x660000 (dark red)
Pooled (valley): 0x550000 (very dark)
Old stain:       0x4A0000 (almost black)

Valleys = Darkest blood (most accumulated)


=====================================================
FLOW SPEED EXAMPLES
=====================================================

GENTLE SLOPE (flowStrength = 0.003):
    🩸
     ↘️ (slow trickle)
      ●

NORMAL SLOPE (flowStrength = 0.008):
    🩸
      ↘️↘️ (steady flow)
        ●

STEEP SLOPE (flowStrength = 0.015):
    🩸
       ↘️↘️↘️ (rushing blood)
           ●


=====================================================
EXPECTED VISUAL RESULTS
=====================================================

When everything is working correctly:

✅ Blood lands and begins rolling
✅ Follows terrain contours
✅ Speeds up going downhill
✅ Slows down going uphill
✅ Stops in flat areas or valleys
✅ Creates larger pools in low spots
✅ Pools are darker in valleys
✅ Multiple pools in natural depressions
✅ No clipping through terrain
✅ Smooth, realistic movement

If you don't see this, check:
- Terrain module is loaded
- Using MULTI-BIOME terrain module
- Terrain has actual slopes/variation
- flowStrength > 0


=====================================================
BEST LEVELS TO DEMONSTRATE
=====================================================

LEVEL 38 (Multi-Biome):
✅ Mountains: Blood flows down peaks
✅ Valleys: Blood accumulates
✅ Desert dunes: Shows flow clearly
✅ Forest: Natural pooling

Perfect for showing all features!


Kill enemies on mountains → Watch blood river
Kill in valleys → Watch accumulation
Kill everywhere → See natural pooling

Realistic gore achieved! 🩸
*/
