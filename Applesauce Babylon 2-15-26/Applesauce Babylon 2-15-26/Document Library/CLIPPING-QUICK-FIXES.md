/**
 * QUICK CLIPPING FIX - COPY & PASTE SOLUTIONS
 * Use these if you're still seeing clipping after installing v2
 */

/*
=====================================================
SCENARIO 1: CLIPPING INTO STEEP MOUNTAINS
=====================================================

Find these lines in applesauce-core-r182-EXTREME-TERRAIN.js around line 660:

REPLACE:
    const baseClearance = 0.5;
    const slopeClearance = Math.min(totalSlope * 0.15, 0.4);

WITH:
    const baseClearance = 0.7;  // Higher base
    const slopeClearance = Math.min(totalSlope * 0.2, 0.7);  // More on slopes

This gives you:
- 0.7 base height (was 0.5)
- Up to 0.7 extra on steep slopes (was 0.4)
- Maximum clearance: 1.4 units
*/

/*
=====================================================
SCENARIO 2: CLIPPING INTO VALLEY FLOORS
=====================================================

Find around line 685:

REPLACE:
    const clippingBuffer = 0.1;

WITH:
    const clippingBuffer = 0.25;  // Larger safety margin

This makes you "land" 0.25 units before hitting ground,
preventing overshooting into valley floors.
*/

/*
=====================================================
SCENARIO 3: CLIPPING ON BUMPY/ROCKY TERRAIN
=====================================================

Find around line 617:

REPLACE:
    const boardLength = 1.25;
    const boardWidth = 0.4;

WITH:
    const boardLength = 1.6;   // Longer board
    const boardWidth = 0.5;    // Wider board

Longer/wider board samples more area = catches more bumps.
*/

/*
=====================================================
SCENARIO 4: FLOATING TOO HIGH (OPPOSITE PROBLEM)
=====================================================

If board floats above ground:

Find around line 660:

REPLACE:
    const baseClearance = 0.5;
    const slopeClearance = Math.min(totalSlope * 0.15, 0.4);

WITH:
    const baseClearance = 0.3;   // Lower
    const slopeClearance = Math.min(totalSlope * 0.1, 0.2);  // Less

And around line 685:

REPLACE:
    const clippingBuffer = 0.1;

WITH:
    const clippingBuffer = 0.0;  // No buffer
*/

/*
=====================================================
SCENARIO 5: PERFECT SETTINGS FOR MULTI-BIOME LEVEL
=====================================================

For Level 38 (Forest → Mountains → Desert → Beach):

Around line 617:
    const boardLength = 1.4;    // Good for varied terrain
    const boardWidth = 0.45;

Around line 660:
    const baseClearance = 0.6;  // Balanced
    const slopeClearance = Math.min(totalSlope * 0.18, 0.5);

Around line 685:
    const clippingBuffer = 0.15;  // Good safety margin
*/

/*
=====================================================
SCENARIO 6: NUCLEAR OPTION - NO CLIPPING EVER
=====================================================

If nothing else works, use these VERY conservative settings:

Around line 617:
    const boardLength = 2.0;    // Very long board
    const boardWidth = 0.6;     // Very wide

Around line 660:
    const baseClearance = 1.0;  // Very high
    const slopeClearance = Math.min(totalSlope * 0.3, 1.0);  // Maximum

Around line 685:
    const clippingBuffer = 0.3;  // Large buffer

WARNING: Board will float noticeably higher than terrain!
But you WILL NOT clip through anything.
*/

/*
=====================================================
SCENARIO 7: REALISTIC SIM MODE
=====================================================

For the most realistic ground contact (may have slight clipping):

Around line 617:
    const boardLength = 1.25;
    const boardWidth = 0.4;

Around line 660:
    const baseClearance = 0.25;  // Very close to ground
    const slopeClearance = Math.min(totalSlope * 0.12, 0.3);

Around line 685:
    const clippingBuffer = 0.05;  // Minimal buffer

Most realistic but requires smooth terrain (high resolution).
*/

/*
=====================================================
FINDING THE RIGHT BALANCE
=====================================================

Start with DEFAULT (already in v2):
    boardLength = 1.25
    boardWidth = 0.4
    baseClearance = 0.5
    slopeClearance cap = 0.4
    clippingBuffer = 0.1

STILL CLIPPING?
→ Increase baseClearance by 0.1
→ Test again
→ Repeat until no clipping

FLOATING TOO MUCH?
→ Decrease baseClearance by 0.1
→ Test again
→ Repeat until good

Find your sweet spot!
*/

/*
=====================================================
COPY-PASTE TEMPLATE
=====================================================

Copy this entire section and paste it around line 615 in the core:

        // ===== CUSTOM TERRAIN SETTINGS =====
        // Adjust these values for your terrain type
        
        const boardLength = 1.4;     // 1.0-2.0 (board length)
        const boardWidth = 0.45;     // 0.3-0.6 (board width)
        
        // ... (leave the sampling code alone) ...
        
        // Around line 660:
        const baseClearance = 0.6;   // 0.3-1.0 (height above terrain)
        const slopeClearance = Math.min(totalSlope * 0.18, 0.5);  // slope factor
        
        // ... (leave the rotation code alone) ...
        
        // Around line 685:
        const clippingBuffer = 0.15;  // 0.0-0.3 (safety margin)
        
        // ===== END CUSTOM SETTINGS =====

Then adjust the numbers to taste!
*/
