/**
 * PROCEDURAL TERRAIN GUIDE
 * How to make organic, flowing terrain like the forest level
 */

/*
=====================================================
WHAT IS PROCEDURAL TERRAIN?
=====================================================

Procedural terrain uses layered sine/cosine waves (noise) to create
organic, flowing hills and valleys that feel natural - like the
forest level!

Instead of defining flat/hill/mountain segments, you define
FREQUENCIES and AMPLITUDES that create rolling terrain automatically.


=====================================================
HOW IT WORKS - THE MATH
=====================================================

Each point on the terrain gets a height calculated from multiple
layered sine/cosine waves:

    height = sin(x * freq1) * amp1 +    // Large rolling hills
             cos(z * freq1) * amp1 +
             sin(x * freq2) * amp2 +    // Medium variations
             cos(z * freq2) * amp2 +
             sin(x * freq3) * amp3 +    // Small bumps
             cos(z * freq3) * amp3 +
             sin((x+z) * freqDiag1) * ampDiag1 +  // Diagonal flow
             cos((x-z) * freqDiag2) * ampDiag2 +
             baseHeight                  // Offset

FREQUENCY (freq):
    - Lower = Gentle, rolling hills (0.01-0.05)
    - Higher = Sharp, bumpy terrain (0.1-0.2)

AMPLITUDE (amp):
    - Controls height of hills
    - Larger = Taller hills
    - Smaller = Flatter terrain


=====================================================
BASIC TERRAIN CONFIG
=====================================================

terrain: {
    mode: 'procedural',      // USE PROCEDURAL MODE!
    size: 2000,              // World size (2000x2000)
    resolution: 100,         // Detail level (50-150)
    
    noise: {
        // Layer 1: Large rolling hills
        freq1: 0.03,
        amp1: 4,
        
        // Layer 2: Medium variations
        freq2: 0.08,
        amp2: 2,
        
        // Layer 3: Small details
        freq3: 0.15,
        amp3: 0.8,
        
        // Diagonal patterns (organic flow)
        freqDiag1: 0.05,
        ampDiag1: 3,
        freqDiag2: 0.05,
        ampDiag2: 2,
        
        // Base height (ground level)
        baseHeight: 0
    },
    
    // Visual appearance
    color: 0x567D46,         // Grass green
    roughness: 0.9,
    metalness: 0.0
}


=====================================================
TERRAIN PRESETS
=====================================================

Your terrain module has built-in presets! Use them instead
of defining noise manually:

// GENTLE ROLLING HILLS (easy skating)
terrain: {
    mode: 'procedural',
    size: 2000,
    resolution: 100,
    noise: 'gentle',         // USE PRESET NAME!
    color: 0x567D46
}

// AVAILABLE PRESETS:

1. 'gentle'
   - Smooth, easy terrain
   - Perfect for: Beginners, city levels
   - Amplitudes: 3, 1.5, 0.5

2. 'rolling' (DEFAULT - like forest)
   - Moderate hills and valleys
   - Perfect for: General gameplay
   - Amplitudes: 6, 3, 1

3. 'mountainous'
   - Tall peaks and deep valleys
   - Perfect for: Challenges, extreme levels
   - Amplitudes: 12, 6, 2

4. 'rough'
   - Sharp, bumpy terrain
   - Perfect for: Technical levels
   - Amplitudes: 5, 4, 2

5. 'flat_bumpy'
   - Mostly flat with small bumps
   - Perfect for: City streets, trick areas
   - Amplitudes: 1, 1, 0.5

6. 'flat_city' (NEW!)
   - Almost completely flat
   - Perfect for: Urban levels
   - Amplitudes: 0.5, 0.3, 0.2


=====================================================
EXAMPLE: USING PRESETS
=====================================================

// Forest-like terrain
terrain: {
    mode: 'procedural',
    size: 2000,
    resolution: 120,
    noise: 'rolling',        // Forest preset!
    color: 0x2d5a2d          // Dark green
}

// City streets (almost flat)
terrain: {
    mode: 'procedural',
    size: 3000,
    resolution: 80,
    noise: 'flat_city',      // Very flat!
    color: 0x808080          // Gray concrete
}

// Mountain challenge
terrain: {
    mode: 'procedural',
    size: 2500,
    resolution: 150,
    noise: 'mountainous',    // Big hills!
    color: 0x8B7355          // Brown rock
}


=====================================================
CUSTOM NOISE CONFIGURATION
=====================================================

Want full control? Define your own noise config:

terrain: {
    mode: 'procedural',
    size: 2000,
    resolution: 100,
    
    noise: {
        // Experiment with these values!
        
        // LAYER 1: Base landscape
        freq1: 0.02,      // Lower = smoother
        amp1: 8,          // Higher = taller hills
        
        // LAYER 2: Details
        freq2: 0.06,
        amp2: 4,
        
        // LAYER 3: Fine bumps
        freq3: 0.12,
        amp3: 1,
        
        // DIAGONAL FLOW (makes it look organic)
        freqDiag1: 0.04,
        ampDiag1: 5,
        freqDiag2: 0.04,
        ampDiag2: 3,
        
        // OFFSET (raise/lower entire terrain)
        baseHeight: 10    // Positive = higher, negative = lower
    }
}


=====================================================
TIPS FOR GOOD TERRAIN
=====================================================

1. START WITH A PRESET
   Use 'gentle', 'rolling', or 'mountainous' first
   Then tweak if needed

2. FREQUENCY GUIDELINES
   - Keep freq1 between 0.01-0.05 (large features)
   - Keep freq2 between 0.05-0.1 (medium features)
   - Keep freq3 between 0.1-0.2 (small details)

3. AMPLITUDE GUIDELINES
   - amp1 should be largest (2-12)
   - amp2 should be medium (1-6)
   - amp3 should be smallest (0.5-2)

4. DIAGONAL PATTERNS
   - freqDiag values create organic flow
   - Keep them similar to freq1
   - These make terrain feel natural, not grid-like

5. RESOLUTION VS PERFORMANCE
   - resolution: 50 = Fast, chunky
   - resolution: 100 = Balanced (recommended)
   - resolution: 150+ = Smooth but slow

6. SIZE VS LEVEL LENGTH
   - size: 1000 = Small level
   - size: 2000 = Medium level (recommended)
   - size: 3000+ = Large level


=====================================================
COMMON TERRAIN TYPES
=====================================================

// SKATEBOARD PARK (smooth with bumps)
terrain: {
    mode: 'procedural',
    size: 1500,
    resolution: 80,
    noise: {
        freq1: 0.04, amp1: 2,
        freq2: 0.1, amp2: 1,
        freq3: 0.2, amp3: 0.5,
        freqDiag1: 0.06, ampDiag1: 1.5,
        freqDiag2: 0.06, ampDiag2: 1,
        baseHeight: 0
    },
    color: 0x808080  // Concrete
}

// FOREST (like Level 10)
terrain: {
    mode: 'procedural',
    size: 2000,
    resolution: 120,
    noise: {
        freq1: 0.03, amp1: 4,
        freq2: 0.08, amp2: 2,
        freq3: 0.15, amp3: 0.8,
        freqDiag1: 0.05, ampDiag1: 3,
        freqDiag2: 0.05, ampDiag2: 2,
        baseHeight: 0
    },
    color: 0x2d5a2d  // Dark green
}

// DESERT (gentle dunes)
terrain: {
    mode: 'procedural',
    size: 3000,
    resolution: 100,
    noise: {
        freq1: 0.02, amp1: 6,
        freq2: 0.05, amp2: 3,
        freq3: 0.1, amp3: 1,
        freqDiag1: 0.03, ampDiag1: 4,
        freqDiag2: 0.03, ampDiag2: 3,
        baseHeight: 0
    },
    color: 0xC2B280  // Sandy
}

// CITY STREETS (almost flat)
terrain: {
    mode: 'procedural',
    size: 2500,
    resolution: 60,
    noise: 'flat_city',
    color: 0x4a4a4a  // Dark gray
}

// MOUNTAIN CHALLENGE (extreme)
terrain: {
    mode: 'procedural',
    size: 2000,
    resolution: 120,
    noise: {
        freq1: 0.025, amp1: 15,
        freq2: 0.07, amp2: 8,
        freq3: 0.14, amp3: 3,
        freqDiag1: 0.045, ampDiag1: 10,
        freqDiag2: 0.045, ampDiag2: 7,
        baseHeight: 5
    },
    color: 0x696969  // Gray rock
}


=====================================================
TROUBLESHOOTING
=====================================================

PROBLEM: Terrain is too bumpy/crazy
SOLUTION: Lower amp values (especially amp1)

PROBLEM: Terrain is too flat/boring
SOLUTION: Increase amp values or use 'rolling' preset

PROBLEM: Terrain has weird grid pattern
SOLUTION: Adjust diagonal freqs (freqDiag1, freqDiag2)

PROBLEM: Performance is slow
SOLUTION: Lower resolution (try 60-80)

PROBLEM: Level feels too small
SOLUTION: Increase size (try 3000+)

PROBLEM: Can't see terrain at all
SOLUTION: Check that mode: 'procedural' is set
         Check that you're using COMPLETE terrain module


=====================================================
QUICK REFERENCE
=====================================================

COPY-PASTE THIS FOR FOREST-LIKE TERRAIN:

terrain: {
    mode: 'procedural',
    size: 2000,
    resolution: 100,
    noise: 'rolling',
    color: 0x567D46,
    roughness: 0.9,
    metalness: 0.0
}

DONE! That's all you need for organic terrain like the forest! 🌲
*/
