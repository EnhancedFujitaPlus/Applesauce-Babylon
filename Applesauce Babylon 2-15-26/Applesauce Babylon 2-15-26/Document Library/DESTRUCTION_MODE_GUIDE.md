# 💥 DESTRUCTION ARCADE GALLERY - FEATURE GUIDE

## 🎉 What's New!

### ✅ FIXED: Launch Functionality
- **Better path detection** - tries multiple locations
- **Detailed error messages** - tells you exactly what's wrong
- **Debug logging** - see every step in the debug console
- **Popup blocker detection** - alerts you if blocked

### 🎬 NEW: Video Support
- **Videos on cabinet screens!** - MP4, WebM support
- **Auto-play and loop** - videos start automatically
- **Fallback to images** - if video fails, shows image instead
- **Muted by default** - no audio chaos with multiple videos

### 🎯 NEW: Free-Roam Destruction Mode
- **FPS controls** - WASD + mouse look
- **Physics-based destruction** - punch cabinets!
- **Jump and interact** - full 3D exploration
- **Reset physics** - put everything back

### 🎮 NEW: Dual Mode System
- **Gallery Mode** - Click and browse (original)
- **Destruction Mode** - Free-roam and smash things!
- **Switch anytime** - one button toggle

---

## 🎬 Adding Video Support

### In your art_data.json:

```json
{
  "your_project.html": {
    "title": "Your Cool Project",
    "description": "Description here",
    "category": "Games",
    "tags": ["cool", "project"],
    "type": "game",
    "coverVideo": "./cover_art/your_video.mp4",  ← NEW!
    "coverArt": "./cover_art/your_image.png",    ← Fallback
    "version": "1.0"
  }
}
```

### Video Requirements:

**Supported Formats:**
- MP4 (H.264) - **BEST** - Works everywhere
- WebM (VP8/VP9) - Good for modern browsers
- OGG (Theora) - Older format

**Recommended Settings:**
- **Resolution**: 512x512 or 1024x1024 (square)
- **Framerate**: 24-30 fps
- **Bitrate**: 2-5 Mbps (lower = smaller file)
- **Duration**: 5-30 seconds (loop-friendly)
- **File size**: Under 10MB for best performance

**Creating Loop-Friendly Videos:**
1. Make first and last frame identical
2. Smooth transitions
3. Continuous motion works best

### Folder Structure:

```
your-project/
├── destruction_arcade_gallery.html
├── art_data.json
├── htmls/
│   └── your_files.html
└── cover_art/
    ├── your_video.mp4    ← Videos here!
    ├── your_image.png    ← Fallback images
    └── ...
```

### Converting Videos (FFmpeg):

```bash
# Convert to web-friendly MP4
ffmpeg -i input.mov -c:v libx264 -preset slow -crf 22 -vf "scale=512:512" -an output.mp4

# Make it loop-friendly (crossfade)
ffmpeg -i input.mp4 -filter_complex "[0:v]trim=0:5,setpts=PTS-STARTPTS[v1];[0:v]trim=5:10,setpts=PTS-STARTPTS[v2];[v1][v2]xfade=transition=fade:duration=1:offset=4" output_loop.mp4
```

---

## 🎮 How to Use Gallery Mode

**Default mode when you load the page.**

### Controls:
- **Arrow Keys** → Navigate projects
- **Click Cabinet** → Select project  
- **Enter** → Launch selected project
- **Auto-Rotate** → Camera spins around

### Features:
- View project info
- See cover art/video
- Launch projects in new tabs
- Browse collection safely

---

## 💥 How to Use Destruction Mode

**Free-roam FPS mode - Smash things!**

### Entering Destruction Mode:
1. Click **"🎯 SWITCH TO DESTRUCTION MODE"** button
2. Click canvas to enable pointer lock (look around)
3. Start exploring!

### Controls:
| Key | Action |
|-----|--------|
| **W A S D** | Move around |
| **MOUSE** | Look around |
| **SPACE** | Jump |
| **LEFT CLICK** | Punch cabinet (apply force) |
| **E** | Interact / Launch project |
| **R** | Reset physics (fix cabinets) |
| **ESC** | Release mouse lock |

### What You Can Do:
1. **Walk around** the arcade
2. **Punch cabinets** to knock them over
3. **Jump** on top of them
4. **Watch physics** - cabinets fall realistically
5. **Interact (E)** to launch projects from any angle
6. **Reset (R)** when things get too chaotic

### Tips:
- Punch cabinets from different angles
- Jump and punch from above for max destruction
- Stack cabinets by pushing them together
- Reset often to test different scenarios
- The physics is handled by **Havok** - super realistic!

---

## 🚀 Fixed Launch System

### What's Improved:

**1. Better Path Detection:**
```javascript
// Tries in order:
1. project.links.source from art_data.json
2. ./htmls/project.filename
3. Tells you which one failed
```

**2. Detailed Error Messages:**
```
❌ Could not open ./htmls/YourFile.html

Possible issues:
1. Popup blocker is active
2. File doesn't exist at: ./htmls/YourFile.html
3. Filename case mismatch

Check browser console (F12) for detailed errors.
```

**3. Debug Console Integration:**
```
🚀 Attempting to launch: ./htmls/Applesauce.html
   Project: APPLESAUCE
   Filename: Applesauce.html
✅ Launched successfully: APPLESAUCE
```

### Troubleshooting Launch Issues:

**Issue: "Could not open file"**

**Check 1: File exists?**
```bash
ls htmls/YourFile.html
# Should see the file
```

**Check 2: Case match?**
```json
// In art_data.json
"Applesauce.html"  ← Must match exactly!

// File must be:
htmls/Applesauce.html  ← Not applesauce.html!
```

**Check 3: Path in art_data.json?**
```json
{
  "YourFile.html": {
    "links": {
      "source": "./htmls/YourFile.html"  ← Correct path?
    }
  }
}
```

**Check 4: Debug console**
1. Click **"🐛 DEBUG INFO"** button
2. Look for launch attempts
3. Shows exact path being tried

---

## 🔧 Debug Console

### How to Use:

1. **Click** "🐛 DEBUG INFO" button (top-right controls)
2. **Red box appears** in top-left
3. **See everything** happening in real-time

### What It Shows:
```
[ARCADE] 📂 Loading art_data.json...
[ARCADE] ✅ JSON loaded successfully
[ARCADE] 📦 Loaded: APPLESAUCE
[ARCADE] 📦 Loaded: Treaty of the Watchtower
[ARCADE] ✅ Total projects loaded: 8
[ARCADE] 🖼️ Loading image: ./cover_art/applesauce.png
[ARCADE] ✅ Image loaded: APPLESAUCE
[ARCADE] 🎬 Loading video: ./cover_art/demo.mp4
[ARCADE] ✅ Video loaded: Demo Project
[ARCADE] 🚀 Attempting to launch: ./htmls/Applesauce.html
[ARCADE] ✅ Launched successfully: APPLESAUCE
```

### Common Debug Messages:

**✅ Success:**
- `JSON loaded successfully`
- `Image loaded: ProjectName`
- `Video loaded: ProjectName`
- `Launched successfully: ProjectName`

**❌ Errors:**
- `ERROR: Failed to load art_data.json: HTTP 404`
  - Solution: Put art_data.json in same folder as HTML
  
- `ERROR: Image failed: ./cover_art/image.png`
  - Solution: Check file exists and path is correct
  
- `ERROR: Video failed: ./cover_art/video.mp4`
  - Solution: Check video format and path
  
- `ERROR: Launch failed: ./htmls/file.html`
  - Solution: Check file exists, case matches

---

## 🎯 Mode Comparison

### Gallery Mode (Default):
✅ Safe browsing  
✅ Auto-rotate camera  
✅ Project info panels  
✅ Click to select  
✅ Enter to launch  
❌ Can't move freely  
❌ Can't interact physically  

### Destruction Mode (FPS):
✅ Free movement (WASD)  
✅ Physics destruction  
✅ Jump and explore  
✅ Punch cabinets  
✅ Interact from anywhere (E key)  
❌ No auto-rotate  
❌ No info panels (use E to launch)  

**Best of both:** Switch between them anytime!

---

## 📁 Complete File Structure

```
your-arcade/
├── destruction_arcade_gallery.html   ← The main file
├── art_data.json                     ← Your project database
│
├── htmls/                            ← Your HTML projects
│   ├── applesauce.html
│   ├── treaty_terminal.html
│   ├── symb_studio.html
│   └── ...
│
└── cover_art/                        ← Media files
    ├── Videos (NEW!)
    │   ├── applesauce.mp4
    │   ├── demo_gameplay.webm
    │   └── ...
    │
    └── Images (Fallbacks)
        ├── applesauce.png
        ├── treaty.png
        └── ...
```

---

## 🎬 Video Examples

### Example 1: Gameplay Capture
```json
{
  "skateboard_game.html": {
    "title": "Skateboard Mayhem",
    "coverVideo": "./cover_art/skateboard_gameplay.mp4",
    "coverArt": "./cover_art/skateboard_thumb.png"
  }
}
```
Shows 15-second gameplay clip looping on cabinet.

### Example 2: Animated Logo
```json
{
  "my_tool.html": {
    "title": "Audio Tool",
    "coverVideo": "./cover_art/audio_visualizer.mp4",
    "coverArt": "./cover_art/audio_static.png"
  }
}
```
Shows audio waveform animation on cabinet.

### Example 3: Static Image (No Video)
```json
{
  "classic_game.html": {
    "title": "Classic Game",
    "coverArt": "./cover_art/classic.png"
  }
}
```
Works exactly like before - just an image.

---

## 💡 Pro Tips

### Videos:
1. **Keep them short** (5-15 seconds)
2. **Make them loop** - edit first/last frames to match
3. **Compress well** - target 2-5MB per video
4. **Test first** - make sure they play in browser
5. **Always provide fallback image** in case video fails

### Destruction Mode:
1. **Reset often** (R key) - prevents performance issues
2. **Punch from above** - jump and hit for max effect
3. **Use E to launch** - works from any distance/angle
4. **Stack cabinets** - push them together for fun
5. **Explore the space** - walk around the whole arena

### Performance:
1. **Limit videos** - 3-5 videos max for best FPS
2. **Or use images** - faster loading, less memory
3. **Reset physics** - clears forces, improves FPS
4. **Toggle particles** - if laggy, disable in settings

### Debugging:
1. **Always check debug console** first
2. **Look for red ERROR messages**
3. **Check file paths** are exactly right
4. **Test in different browsers** if issues persist

---

## 🚀 Quick Start Checklist

### First Time Setup:

- [ ] Put `destruction_arcade_gallery.html` in your folder
- [ ] Put `art_data.json` in same folder
- [ ] Create `htmls/` folder
- [ ] Create `cover_art/` folder
- [ ] Add your HTML files to `htmls/`
- [ ] Add your videos/images to `cover_art/`
- [ ] Update `art_data.json` with correct paths
- [ ] Start local server: `python -m http.server 8000`
- [ ] Open: `http://localhost:8000/destruction_arcade_gallery.html`
- [ ] Click 🐛 DEBUG INFO to check everything loaded
- [ ] Test Gallery Mode first
- [ ] Click MODE TOGGLE
- [ ] Test Destruction Mode
- [ ] Try punching cabinets!
- [ ] Press E to launch projects
- [ ] Press R to reset

### If Something's Wrong:

1. Check DEBUG console (click 🐛 DEBUG INFO button)
2. Look for ERROR messages in red
3. Check browser console (F12)
4. Verify file structure matches guide
5. Check all paths in art_data.json
6. Test with just images first (no videos)
7. Then add videos one at a time

---

## 🎮 Gameplay Ideas

### Destruction Challenges:
- See how many cabinets you can knock over in 30 seconds
- Stack all cabinets in one corner
- Create an obstacle course
- Jump from cabinet to cabinet
- Punch them into neat rows

### Practical Uses:
- **Testing physics** for your own games
- **Showcasing projects** with video demos
- **Interactive portfolio** for artists
- **Stress testing** Havok integration
- **Learning FPS controls** for game dev

---

## 🔮 What's Next?

Potential additions you could make:
- Add weapons (like Watchtower game)
- Scoring system for destruction
- Multiplayer (share destruction states)
- More cabinet types (different shapes/sizes)
- Particle effects on impact
- Sound effects for punches
- Cabinet health bars
- Explosion effects
- Time trials
- Save/load destruction layouts

---

**You now have:**
✅ Gallery with video support  
✅ Free-roam FPS mode  
✅ Havok physics destruction  
✅ Better launch system  
✅ Debug tools  
✅ Dual-mode toggle  

**This is your ultimate arcade + destruction test hub!** 💥🎮
