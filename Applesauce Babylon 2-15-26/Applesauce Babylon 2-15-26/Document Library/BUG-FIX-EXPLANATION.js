/**
 * 🐛 BUG FIX: Music System Lag & Empty Radio Menu
 * 
 * PROBLEM IDENTIFIED:
 * You were loading playlists in TWO places, causing conflicts!
 */

// ============================================
// THE ISSUE
// ============================================

/*
Your code flow was:

1. game.html creates music system ✅
2. game.html loads playlist with 3 tracks ❌ (WRONG!)
3. game.html tries to switchContext('level') ❌ (TOO EARLY!)
4. Level loads
5. level_16.js tries to load DIFFERENT playlist with 1 track ❌ (CONFLICT!)
6. level_16.js tries to switchContext('level') again ❌ (DUPLICATE!)

Result:
- Playlists conflicting with each other
- Music trying to start before files loaded
- Radio menu confused about which tracks to show
- Possible lag from multiple audio contexts
*/


// ============================================
// THE FIX
// ============================================

/*
RULE: Only ONE place should load playlists - the LEVEL!

✅ CORRECT FLOW:

1. game.html creates music system (but doesn't load any tracks)
2. Level loads
3. level_16.js loads its playlist in onLevelStart
4. level_16.js calls switchContext('level') to start music

This way:
- Each level controls its own music
- No conflicts
- Clean separation of concerns
*/


// ============================================
// FIXED: game.html
// ============================================

// ❌ WRONG (your original):
/*
            game.modules.music = new ApplesauceMusic(game, { ... });
            
            // DON'T DO THIS IN game.html!
            game.modules.music.loadPlaylist('level', [
                { title: "Track 1", artist: "Artist", file: "./music/track1.ogg" },
                { title: "Track 2", artist: "Artist", file: "./music/track2.ogg" },
            ]);
            
            game.loadLevel(levelConfig);
            
            // DON'T DO THIS IN game.html!
            game.modules.music.switchContext('level');
*/

// ✅ CORRECT (fixed version):
/*
            // Just initialize the music system
            game.modules.music = new ApplesauceMusic(game, {
                volume: 0.7,
                fadeTime: 1500,
                autoplay: true,
                showNowPlaying: true,
                enableRadioMenu: true
            });
            
            console.log('🎵 Music system initialized (waiting for level to load tracks...)');
            
            // ... later ...
            
            game.loadLevel(levelConfig);
            // Level's onLevelStart will handle music loading and starting!
*/


// ============================================
// FIXED: level_16.js
// ============================================

// ✅ CORRECT (this part was already good!):
/*
    music: [
        {
            title: "Track 1",
            artist: "Artist",
            file: "./music/levels/track1.ogg"
        },
        {
            title: "Track 2",
            artist: "Artist",
            file: "./music/levels/track2.ogg"
        },
        {
            title: "Track 3",
            artist: "Artist",
            file: "./music/levels/track3.ogg"
        }
    ],
    
    onLevelStart: function(game) {
        // Load this level's music
        if (game.modules.music && this.music) {
            game.modules.music.loadPlaylist('level', this.music);
            game.modules.music.switchContext('level');
        }
        
        // ... rest of level setup
    }
*/


// ============================================
// WHY IT WAS LAGGY
// ============================================

/*
Possible causes of lag:

1. DOUBLE LOADING: Two playlists trying to load at once
   - game.html loading 3 tracks
   - level_16.js loading 1 track (replacing the first 3)
   - Audio files loading multiple times

2. TIMING ISSUES: Music starting before level ready
   - game.html calling switchContext before level loaded
   - Audio context trying to play non-existent tracks

3. FILE ERRORS: If music files don't exist
   - Browser trying to load missing files
   - Multiple retry attempts causing lag

4. AUDIO CONTEXT CONFLICTS: Multiple switches happening too fast
   - First switchContext in game.html
   - Second switchContext in level's onLevelStart
   - Audio system getting confused
*/


// ============================================
// WHY RADIO MENU WAS EMPTY
// ============================================

/*
The radio menu shows tracks from the CURRENT playlist.

Your flow was:
1. game.html loads 3 tracks → Radio menu would show 3 tracks
2. level_16.js loads 1 track → This REPLACES the playlist!
3. Radio menu now shows only 1 track

But because of timing issues, the menu might have been showing:
- Empty (if called before any tracks loaded)
- Wrong tracks (if showing game.html's tracks instead of level's)
- Broken state (if context switched during loading)
*/


// ============================================
// SOLUTION SUMMARY
// ============================================

/*
✅ DO THIS:

1. In game.html:
   - Initialize music system only
   - DON'T load any playlists
   - DON'T call switchContext

2. In each level file (level_16.js, level_17.js, etc):
   - Define music array with all tracks for that level
   - In onLevelStart, load the playlist
   - In onLevelStart, call switchContext

❌ DON'T DO THIS:

1. Don't load playlists in game.html
2. Don't call switchContext in game.html
3. Don't load the same playlist twice
4. Don't call switchContext multiple times quickly
*/


// ============================================
// HOW TO USE THE FIXED FILES
// ============================================

/*
I've created two fixed files for you:

1. game-FIXED.html
   - Removed playlist loading
   - Removed switchContext call
   - Only initializes music system

2. level_16-FIXED.js
   - Added all 3 of your tracks to the music array
   - Already has correct onLevelStart music loading

STEPS:
1. Replace your game.html with game-FIXED.html
2. Replace your level_16.js with level_16-FIXED.js
3. Refresh your browser
4. Load level 16

The music should now:
- Load properly
- Show all 3 tracks in radio menu (Press M)
- Play without lag
- Allow skipping (Press N)
*/


// ============================================
// TESTING CHECKLIST
// ============================================

/*
After applying the fix:

□ Game loads without lag
□ Press M to open radio menu
□ Radio menu shows 3 tracks:
  - "A Sequetorial Editation to Suicide"
  - "Final Challenge"
  - "Boss"
□ Tracks can be enabled/disabled in menu
□ Press N to skip to next track
□ Now Playing widget shows current track
□ Music plays smoothly
□ No console errors
*/


// ============================================
// FOR FUTURE LEVELS
// ============================================

/*
When creating new levels, follow this pattern:

// In level_XX.js:
window.LevelXXConfig = {
    meta: { ... },
    
    music: [
        { title: "Track 1", artist: "Artist", file: "./music/levelXX/track1.ogg" },
        { title: "Track 2", artist: "Artist", file: "./music/levelXX/track2.ogg" }
    ],
    
    onLevelStart: function(game) {
        // Load this level's music
        if (game.modules.music && this.music) {
            game.modules.music.loadPlaylist('level', this.music);
            game.modules.music.switchContext('level');
        }
        
        // ... rest of level setup
    }
};

DON'T modify game.html - it's already set up correctly!
*/


// ============================================
// COMMON MISTAKES TO AVOID
// ============================================

/*
❌ MISTAKE 1: Loading playlist in both game.html AND level
Solution: Only load in level's onLevelStart

❌ MISTAKE 2: Calling switchContext before playlist loaded
Solution: Load playlist first, then call switchContext

❌ MISTAKE 3: Music array is empty or has only 1 track
Solution: Add multiple tracks so radio menu isn't empty

❌ MISTAKE 4: File paths are wrong
Solution: Check console for 404 errors, verify paths

❌ MISTAKE 5: Calling switchContext multiple times
Solution: Only call it once in onLevelStart
*/


// ============================================
// DEBUGGING TIPS
// ============================================

/*
If you still have issues:

1. Open browser console (F12)
2. Look for these messages:
   ✅ "🎵 Music system initialized (waiting for level to load tracks...)"
   ✅ "🎵 Loading level music..."
   ✅ "✅ 3 tracks loaded and playing"
   ✅ "🎵 Now playing: [Track Title] - [Artist]"

3. Check for errors:
   ❌ "Failed to load audio" → File path wrong
   ❌ "Cannot read property of undefined" → Music system not initialized
   ❌ "No playlist loaded" → Music array is empty

4. Press M and check radio menu:
   - Should show "Level Tracks" section
   - Should list all your tracks
   - Each track should have Enable/Disable button

5. Check Network tab in console:
   - Look for .ogg/.mp3/.wav file requests
   - 404 = file not found (wrong path)
   - 200 = file loaded successfully
*/
