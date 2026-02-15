# Music File Organization Guide

Recommended folder structure for organizing your game's music files.

## Basic Structure

```
applesauce-game/
├── index.html
├── applesauce-core-r182-FINAL.js
├── applesauce-music-r182.js
├── applesauce-gore-r182.js
├── applesauce-dialogue-r182.js
├── playlists.js                    ← Your playlist config
│
└── music/                           ← All audio files here
    ├── menu/                        ← Menu/UI music
    │   ├── main-menu.ogg
    │   ├── character-select.ogg
    │   └── credits.mp3
    │
    ├── level/                       ← Gameplay music
    │   ├── downtown-1.ogg
    │   ├── downtown-2.ogg
    │   ├── skatepark-1.mp3
    │   ├── skatepark-2.mp3
    │   ├── street-1.wav
    │   └── street-2.wav
    │
    └── boss/                        ← Boss fight music
        ├── boss-intro.ogg
        ├── boss-fight.ogg
        └── boss-victory.mp3
```

## South of South Records Structure

For a record label with multiple artists:

```
applesauce-game/
└── music/
    ├── menu/
    │   └── south-of-south-menu-mix.ogg
    │
    ├── level/
    │   ├── artist-1/
    │   │   ├── track-name-1.ogg
    │   │   ├── track-name-2.ogg
    │   │   └── track-name-3.mp3
    │   │
    │   ├── artist-2/
    │   │   ├── another-track.ogg
    │   │   └── cool-song.mp3
    │   │
    │   └── artist-3/
    │       ├── skate-anthem.wav
    │       └── grind-time.ogg
    │
    └── boss/
        └── label-collab-boss-theme.ogg
```

Then in your `playlists.js`:

```javascript
export const PLAYLISTS = {
    level: [
        // Artist 1
        {
            title: "Track Name 1",
            artist: "Artist Name 1",
            file: "./music/level/artist-1/track-name-1.ogg"
        },
        {
            title: "Track Name 2",
            artist: "Artist Name 1",
            file: "./music/level/artist-1/track-name-2.ogg"
        },
        
        // Artist 2
        {
            title: "Another Track",
            artist: "Artist Name 2",
            file: "./music/level/artist-2/another-track.ogg"
        },
        {
            title: "Cool Song",
            artist: "Artist Name 2",
            file: "./music/level/artist-2/cool-song.mp3"
        },
        
        // Artist 3
        {
            title: "Skate Anthem",
            artist: "Artist Name 3",
            file: "./music/level/artist-3/skate-anthem.wav"
        }
    ]
};
```

## File Naming Conventions

### Good File Names ✅
- `downtown-shred.ogg`
- `artist-name-track-title.mp3`
- `menu-theme-01.wav`
- `boss-fight-final.ogg`

### Avoid ❌
- `Track 1.mp3` (spaces cause issues)
- `song.ogg` (not descriptive)
- `FINAL_FINAL_v2_REALLY_FINAL.mp3` (messy)
- `músic.mp3` (special characters can cause problems)

**Best practices:**
- Use lowercase
- Use hyphens instead of spaces
- Be descriptive
- Include artist name or album if relevant
- Use consistent extensions (.ogg recommended for web)

## Audio Format Recommendations

### OGG Vorbis (Recommended) 🌟
```
✅ Best compression
✅ Good quality
✅ Smaller file sizes
✅ Great for web
✅ Open source
```

**Use for:** Level music, background tracks, anything that needs to load fast

**Export settings:** 192 kbps or higher

### MP3
```
✅ Universal support
⚠️ Larger than OGG
⚠️ Patent issues (expired in 2017)
```

**Use for:** If you already have MP3s or need maximum compatibility

**Export settings:** 256 kbps or higher

### WAV
```
✅ Highest quality
✅ No compression artifacts
❌ HUGE file sizes
❌ Slow to load
```

**Use for:** Only if quality is absolutely critical or for very short sounds

**Not recommended for:** Long background music tracks

## File Size Guidelines

Target file sizes for good web performance:

- **Menu tracks:** 2-4 MB (1-2 minutes)
- **Level tracks:** 3-6 MB (2-3 minutes)
- **Boss tracks:** 3-5 MB (2-3 minutes)

**Total music folder:** Keep under 100 MB for decent load times

If your music folder is larger than 100 MB, consider:
1. Converting WAV files to OGG
2. Lowering bitrate slightly (192 kbps is usually fine)
3. Trimming unnecessarily long intros/outros
4. Loading music on-demand instead of all at once

## Example Playlist Configurations

### Single Artist Game
```javascript
// playlists.js
export const PLAYLISTS = {
    menu: [
        { 
            title: "Main Theme", 
            artist: "Your Artist Name",
            file: "./music/menu/main-theme.ogg"
        }
    ],
    
    level: [
        {
            title: "Level 1 - Downtown",
            artist: "Your Artist Name",
            file: "./music/level/01-downtown.ogg"
        },
        {
            title: "Level 2 - Skatepark",
            artist: "Your Artist Name",
            file: "./music/level/02-skatepark.ogg"
        },
        {
            title: "Level 3 - Street",
            artist: "Your Artist Name",
            file: "./music/level/03-street.ogg"
        }
    ],
    
    boss: [
        {
            title: "Boss Battle",
            artist: "Your Artist Name",
            file: "./music/boss/boss-battle.ogg"
        }
    ]
};
```

### Multi-Artist Compilation
```javascript
// playlists.js
export const PLAYLISTS = {
    level: [
        {
            title: "Concrete Dreams",
            artist: "Artist A",
            file: "./music/level/artist-a/concrete-dreams.ogg"
        },
        {
            title: "Rail Rider",
            artist: "Artist B",
            file: "./music/level/artist-b/rail-rider.ogg"
        },
        {
            title: "Kickflip Anthem",
            artist: "Artist C",
            file: "./music/level/artist-c/kickflip-anthem.mp3"
        },
        {
            title: "Street Symphony",
            artist: "Artist A",
            file: "./music/level/artist-a/street-symphony.ogg"
        },
        {
            title: "Grind Time",
            artist: "Artist D",
            file: "./music/level/artist-d/grind-time.wav"
        }
    ]
};
```

## Loading Music Files

### Option 1: All at once (Simple)
```javascript
import { PLAYLISTS } from './playlists.js';

game.modules.music.loadPlaylist('menu', PLAYLISTS.menu);
game.modules.music.loadPlaylist('level', PLAYLISTS.level);
game.modules.music.loadPlaylist('boss', PLAYLISTS.boss);
```

### Option 2: Load on demand (Better for large libraries)
```javascript
// Load menu music immediately
game.modules.music.loadPlaylist('menu', MENU_TRACKS);

// Load level music when level starts
function startLevel(levelNumber) {
    const levelTracks = getLevelTracks(levelNumber);
    game.modules.music.loadPlaylist('level', levelTracks);
    game.modules.music.switchContext('level');
}
```

### Option 3: Fetch from JSON file
```javascript
// music-library.json
{
    "menu": [
        {
            "title": "Main Menu",
            "artist": "Artist",
            "file": "./music/menu/main.ogg"
        }
    ],
    "level": [...]
}

// In your game:
async function loadMusicLibrary() {
    const response = await fetch('./music-library.json');
    const library = await response.json();
    
    game.modules.music.loadPlaylist('menu', library.menu);
    game.modules.music.loadPlaylist('level', library.level);
    game.modules.music.loadPlaylist('boss', library.boss);
}
```

## Checklist Before Launch

- [ ] All audio files are in the `music/` folder
- [ ] File paths in playlists match actual file locations
- [ ] No spaces in file names
- [ ] Total music folder size is reasonable (<100 MB preferred)
- [ ] OGG format used where possible
- [ ] Artist names and track titles are correct
- [ ] Tested all playlists (menu, level, boss)
- [ ] Radio menu works and shows all tracks
- [ ] Now Playing widget displays correctly
- [ ] Volume control works
- [ ] Music fades smoothly between tracks
- [ ] No console errors related to missing files

## Troubleshooting

**Problem:** "Failed to load audio"
**Solution:** Check file path, ensure file exists at that location

**Problem:** Music stops after one track
**Solution:** Make sure playlist has multiple tracks, check for file errors

**Problem:** Can't hear anything
**Solution:** Check browser console, ensure autoplay is allowed, check volume

**Problem:** Files too large, slow loading
**Solution:** Convert WAV to OGG, lower bitrate, optimize file sizes

## Tips for Artists

1. **Export Settings**
   - OGG Vorbis: 192 kbps quality 6-7
   - MP3: 256-320 kbps CBR
   - WAV: 44.1 kHz, 16-bit (only if necessary)

2. **Track Length**
   - Menu: 1-2 minutes (loops anyway)
   - Level: 2-3 minutes (plenty for gameplay)
   - Boss: 2-4 minutes (intense moments)

3. **Mixing Levels**
   - Normalize tracks to similar loudness
   - Leave headroom (don't peak at 0 dB)
   - Consider in-game sound effects volume

4. **Loop Points**
   - Consider seamless loops
   - Avoid awkward endings
   - Test in-game to ensure smooth transitions

Happy skating! 🛹🎵
