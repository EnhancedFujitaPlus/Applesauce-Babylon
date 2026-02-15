/**
 * KICKFLIP FIX - What Was Wrong & How It's Fixed
 */

/*
=====================================================
THE PROBLEM
=====================================================

After adding terrain-aware skateboard following, tricks stopped working!

SYMPTOM:
- Press Space to kickflip
- Deck doesn't spin properly
- Trick animation looks broken or jittery

WHY IT HAPPENED:
The terrain following system was running EVEN DURING TRICKS, which interfered with the kickflip rotation.

Here's what was happening:

OLD CODE (Line 624):
    if (this.modules.terrain && !this.state.grinding) {
        // Apply terrain rotation to player
        this.player.rotation.x = terrainPitch;
        this.player.rotation.z = terrainRoll;
    }

MEANWHILE (Lines 734-742):
    if (this.state.spinning && this.deck) {
        this.deck.rotation.x = spinRotation;  // Kickflip spin!
    }

THE CONFLICT:
1. You press Space to kickflip
2. state.spinning = true
3. Deck starts spinning on rotation.x
4. BUT terrain system is ALSO setting player.rotation.x
5. The two rotations fought each other!
6. Result: Broken trick animation


=====================================================
THE FIX
=====================================================

SIMPLE SOLUTION:
Disable terrain rotation when spinning (doing tricks)!

NEW CODE (Line 626):
    if (this.modules.terrain) {
        // ALWAYS sample terrain (need height for collision)
        // ... sample terrain heights ...
        
        // BUT only apply rotation when NOT spinning or grinding
        if (!this.state.grinding && !this.state.spinning) {
            this.player.rotation.x = terrainPitch;
            this.player.rotation.z = terrainRoll;
        }
    }

Now:
✅ Terrain sampling still happens (needed for ground collision)
✅ Terrain rotation SKIPPED during tricks
✅ Kickflip animation runs freely
✅ Tricks work perfectly!


=====================================================
WHAT CHANGED IN THE CODE
=====================================================

BEFORE:
    if (terrain && !grinding) {
        sample terrain
        apply rotation  ← PROBLEM: This ran during tricks!
    }

AFTER:
    if (terrain) {
        sample terrain  ← Always happens (needed!)
        
        if (!grinding && !spinning) {
            apply rotation  ← Only when NOT doing tricks!
        }
    }


=====================================================
WHY THIS FIX WORKS
=====================================================

The terrain rotation and trick rotation are now SEPARATED:

TRICK ROTATION (deck.rotation.x):
- Controlled by state.spinning
- Runs during tricks
- Never interrupted

TERRAIN ROTATION (player.rotation.x):
- Controlled by terrain system
- SKIPPED during tricks
- Resumes when trick ends

They don't interfere with each other!


=====================================================
TESTING THE FIX
=====================================================

To verify tricks work:

1. Load any level
2. Press Space to kickflip
3. Deck should spin smoothly
4. Complete full 360° rotation
5. Land and continue riding
6. Terrain following still works when not doing tricks

Expected behavior:
✅ Kickflips spin smoothly
✅ Deck completes full rotation
✅ No jittering or stuttering
✅ Tricks feel responsive
✅ Terrain following works between tricks


=====================================================
ADDITIONAL CONTEXT
=====================================================

The terrain system needs to keep sampling heights even during tricks because:
- Ground collision still needs to know where ground is
- When you land from a trick, you need immediate ground detection
- Adaptive clearance calculations need terrain data

But rotation application is skipped because:
- Tricks need full control over rotation
- Terrain tilt would interfere with spin animation
- Player should appear level during tricks (realistic)


=====================================================
BEFORE vs AFTER
=====================================================

BEFORE FIX:
    Kickflip → Deck tries to spin
                ↓
           Terrain system fights it
                ↓
           Jittery/broken animation
                ↓
           Trick doesn't complete

AFTER FIX:
    Kickflip → Deck spins freely
                ↓
           Terrain rotation paused
                ↓
           Smooth 360° rotation
                ↓
           Land perfectly


=====================================================
RELATED SYSTEMS
=====================================================

This fix also benefits:
✅ Other tricks (if you add them)
✅ Rail grinding (already skipped terrain rotation)
✅ Any future aerial maneuvers
✅ Jump animations

The pattern is: Disable terrain rotation when player needs animation control.


=====================================================
FILE TO USE
=====================================================

Replace your core with:
    applesauce-core-r182-TRICKS-FIXED.js

This includes:
✅ Terrain-aware skateboard following
✅ Multi-point terrain sampling
✅ Blood pooling compatibility
✅ Trick animations that actually work!


=====================================================
QUICK REFERENCE
=====================================================

Line 626: Terrain sampling (always runs)
Line 695: Terrain rotation (skips if spinning or grinding)
Line 734: Trick animation (runs during spinning)

The fix is one added condition:
    !this.state.spinning

That's it! Tricks are fixed! 🛹
*/
