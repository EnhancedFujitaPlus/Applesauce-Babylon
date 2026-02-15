# APPLESAUCE Music System v1.0

A modular music system for the Applesauce skateboarding game with playlist management, in-game radio controls, and seamless transitions.

## Features

✨ **Modular Architecture** - Plugs into existing Applesauce Core with zero engine changes  
🎵 **Multi-Format Support** - OGG, WAV, MP3  
🎮 **Context-Aware Playlists** - Separate music for menu, levels, and boss fights  
📻 **In-Game Radio Menu** - Enable/disable tracks on the fly (Press M)  
🎨 **Now Playing Widget** - Shows current track info in bottom-right corner  
🔊 **Web Audio API** - Smooth crossfades and volume control  
💾 **Player Preferences** - Disabled tracks persist via localStorage  
🎚️ **Volume Control** - Adjustable volume with fade effects  

---

## Installation

### 1. Add the Music Module File

Copy `applesauce-music-r182.js` to your project directory alongside your other Applesauce modules.

### 2. Import in Your Main Game File

```javascript
import { ApplesauceMusic } from './applesauce-music-r182.js';
```

### 3. Initialize After Creating Core

```javascript
const game = new ApplesauceCore({
    goreEnabled: true,
    // ... other config
});

// Add music module
game.modules.music = new ApplesauceMusic(game, {
    volume: 0.7,
    fadeTime: 1500,
    autoplay: true,
    showNowPlaying: true,
    enableRadioMenu: true
});
```

### 4. Load Your Playlists

```javascript
game.modules.music.loadPlaylist('menu', [
    {
        title: "Skate or Die",
        artist: "South of South Records",
        file: "./music/menu/skate-or-die.ogg"
    }
]);
```

That's it! **No changes to the core engine required.**

---

## Usage Guide

### Basic Controls

```javascript
// Switch music context (auto-plays next track)
game.modules.music.switchContext('menu');   // Menu music
game.modules.music.switchContext('level');  // Level music
game.modules.music.switchContext('boss');   // Boss fight music

// Manual playback control
game.modules.music.play();      // Play current track
game.modules.music.pause();     // Pause with fade out
game.modules.music.resume();    // Resume playback
game.modules.music.stop();      // Stop completely
game.modules.music.playNext();  // Skip to next track

// Volume control
game.modules.music.setVolume(0.5); // 0.0 (silent) to 1.0 (full)
```

### In-Game Controls

- **M** - Open/close Radio Menu
- **N** - Skip to next track
- **ESC** - Close Radio Menu

### Radio Menu

Press **M** during gameplay to open the radio menu. Players can:
- See all loaded tracks organized by context
- Enable/disable specific tracks
- Preferences save automatically to localStorage

Disabled tracks are skipped during playback and won't play until re-enabled.

---

## Configuration Options

```javascript
new ApplesauceMusic(game, {
    volume: 0.7,              // Initial volume (0.0 - 1.0)
    fadeTime: 1500,           // Fade duration in milliseconds
    autoplay: true,           // Auto-play when switching contexts
    showNowPlaying: true,     // Show "Now Playing" widget
    enableRadioMenu: true     // Enable in-game radio menu
});
```

---

## Playlist Structure

### Track Object Format

```javascript
{
    title: "Track Title",     // Display name
    artist: "Artist Name",    // Display artist
    file: "./path/to/file.ogg" // Path to audio file
}
```

### Playlist Contexts

- **menu** - Main menu / menus
- **level** - General gameplay
- **boss** - Boss fights / intense moments

### Example Playlist File

Create `playlists.js`:

```javascript
export const PLAYLISTS = {
    menu: [
        { title: "Menu Theme", artist: "Artist", file: "./music/menu1.ogg" },
        { title: "Loading Screen", artist: "Artist", file: "./music/menu2.mp3" }
    ],
    
    level: [
        { title: "Downtown", artist: "Artist", file: "./music/level1.ogg" },
        { title: "Skatepark", artist: "Artist", file: "./music/level2.wav" },
        { title: "Street", artist: "Artist", file: "./music/level3.mp3" }
    ],
    
    boss: [
        { title: "Final Boss", artist: "Artist", file: "./music/boss1.ogg" }
    ]
};
```

Then load it:

```javascript
import { PLAYLISTS } from './playlists.js';

game.modules.music.loadPlaylist('menu', PLAYLISTS.menu);
game.modules.music.loadPlaylist('level', PLAYLISTS.level);
game.modules.music.loadPlaylist('boss', PLAYLISTS.boss);
```

---

## Integration Patterns

### Pattern 1: Simple Menu → Level Transition

```javascript
function startGame() {
    // Switch from menu to level music
    game.modules.music.switchContext('level');
    game.loadLevel(LEVEL_1);
    game.start();
}
```

### Pattern 2: Boss Fight Trigger

```javascript
function onBossSpawn() {
    game.modules.music.switchContext('boss');
    spawnBoss();
}

function onBossDefeated() {
    game.modules.music.switchContext('level');
    showVictoryScreen();
}
```

### Pattern 3: Pause/Resume Integration

```javascript
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        game.state.paused = !game.state.paused;
        
        if (game.state.paused) {
            game.modules.music.pause();
            showPauseMenu();
        } else {
            game.modules.music.resume();
            hidePauseMenu();
        }
    }
});
```

### Pattern 4: Dynamic Music Based on Gameplay

```javascript
// In your update loop
function updateDynamicMusic() {
    const speed = Math.abs(game.state.speed * 100);
    const combo = game.state.combo;
    
    // Switch to intense music during high-speed combos
    if (speed > 60 && combo > 5) {
        if (game.modules.music.currentContext !== 'boss') {
            game.modules.music.switchContext('boss');
        }
    } else {
        if (game.modules.music.currentContext !== 'level') {
            game.modules.music.switchContext('level');
        }
    }
}
```

---

## File Organization

Recommended folder structure:

```
your-game/
├── applesauce-core-r182-FINAL.js
├── applesauce-music-r182.js       ← Music system
├── applesauce-gore-r182.js
├── applesauce-dialogue-r182.js
├── playlists.js                   ← Your playlist config (optional)
├── music/
│   ├── menu/
│   │   ├── track1.ogg
│   │   └── track2.mp3
│   ├── level/
│   │   ├── track1.ogg
│   │   ├── track2.wav
│   │   └── track3.mp3
│   └── boss/
│       └── boss-theme.ogg
└── index.html
```

---

## Artist-Friendly Features

### For Record Label Distribution

The music system is designed to showcase artists properly:

1. **Visible Attribution** - Artist names always displayed in Now Playing widget
2. **Track Control** - Players can enable/disable tracks (helps with licensing)
3. **Persistent Preferences** - Disabled tracks saved, great for player choice
4. **Clean Metadata** - Easy to update artist info without code changes

### Example: South of South Records Integration

```javascript
// Load your label's roster
const SOUTH_OF_SOUTH_TRACKS = [
    {
        title: "Concrete Dreams",
        artist: "Artist Name 1",
        file: "./music/label/artist1-track.ogg"
    },
    {
        title: "Grind Time",
        artist: "Artist Name 2",
        file: "./music/label/artist2-track.mp3"
    }
];

game.modules.music.loadPlaylist('level', SOUTH_OF_SOUTH_TRACKS);
```

---

## Technical Details

### Web Audio API

The system uses the Web Audio API for:
- Precise volume control with `GainNode`
- Smooth crossfade transitions
- Better performance than HTML5 audio alone

Falls back gracefully to HTML5 Audio if Web Audio isn't supported.

### Audio Format Support

- **OGG** - Best compression, recommended for web
- **MP3** - Universal support, larger files
- **WAV** - Uncompressed, highest quality, largest size

Recommendation: Use OGG for web deployment, keep WAV masters for production.

### Memory Management

- Only current track is loaded in memory
- Previous tracks are garbage collected
- No memory leaks during long play sessions

### localStorage

Disabled tracks are saved as JSON array:
```javascript
// Key: 'applesauce_disabled_tracks'
// Value: ["menu_./music/menu/track1.ogg", "level_./music/level/track2.mp3"]
```

---

## Troubleshooting

### Music doesn't play

**Issue:** Browsers block autoplay until user interaction.

**Solution:** The system handles this automatically, but ensure:
1. User clicks somewhere on the page first
2. Check browser console for autoplay policy errors
3. Try clicking "Resume" or manually triggering playback

### Tracks skip immediately

**Issue:** File path incorrect or file not found.

**Solution:** 
- Check browser console for 404 errors
- Verify file paths are correct
- Ensure audio files are in the right directory

### Now Playing widget not showing

**Issue:** Widget initialization failed or CSS conflict.

**Solution:**
- Check `showNowPlaying: true` in config
- Look for JavaScript errors in console
- Check for CSS z-index conflicts

### Radio menu won't open

**Issue:** Keyboard controls not working.

**Solution:**
- Ensure `enableRadioMenu: true` in config
- Click inside the game canvas first
- Check for keyboard event conflicts

---

## Advanced Usage

### Custom UI Styling

The Now Playing widget and Radio Menu use inline styles. To customize:

```javascript
// After creating the music module
const widget = document.getElementById('now-playing-widget');
widget.style.bottom = '100px';  // Move widget
widget.style.background = 'rgba(255, 0, 0, 0.8)';  // Red theme

const menu = document.getElementById('radio-menu');
menu.style.borderColor = '#FF00FF';  // Purple border
```

### Extending the Module

The `ApplesauceMusic` class can be extended:

```javascript
class MyCustomMusic extends ApplesauceMusic {
    constructor(core, config) {
        super(core, config);
        this.visualizer = this.createVisualizer();
    }
    
    createVisualizer() {
        // Add audio visualization
    }
}
```

### Event Hooks

```javascript
// Listen for track changes
const originalLoadTrack = game.modules.music.loadAndPlayTrack.bind(game.modules.music);
game.modules.music.loadAndPlayTrack = function(track) {
    console.log('Track changed:', track.title);
    originalLoadTrack(track);
};
```

---

## License & Credits

Created for **South of South Records** artist tools and **APPLESAUCE** game series.

Compatible with Three.js r182 and the APPLESAUCE Core Engine v4.0.

---

## Support

For issues, feature requests, or integration help, check the examples in:
- `integration-example.js` - Full integration example
- `applesauce-playlists-example.js` - Playlist structure examples

Happy skating! 🛹🎵
