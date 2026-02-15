# APPLESAUCE Stadium Mayhem Package

## 🏈 What's Included

This package contains everything you need to run the epic football stadium level with massive crowds!

### Files:

1. **applesauce-engine-stadium.js** - Enhanced engine with:
   - Collectible system
   - Audio system (beeps + sound file support)
   - Football player NPCs with AI
   - Knockback mechanics
   - Crowd generation system
   - Advanced collision detection

2. **stadium-level.html** - Complete playable level featuring:
   - Full football field with endzones
   - 21 football players (offense + defense)
   - 7,200+ crowd members in bleachers
   - Collectible football at center field
   - 60-second survival challenge
   - Objectives system
   - Full HUD and UI

3. **STADIUM-GUIDE.md** - Comprehensive documentation on:
   - All new features
   - How to customize the stadium
   - Creating different sports arenas
   - Performance optimization
   - Troubleshooting

## 🎮 How to Play

1. Place both files in the same folder
2. Open `stadium-level.html` in a web browser
3. Click to lock mouse
4. Skate to center field
5. Press **F** to grab the football
6. **SURVIVE!**

## ⚠️ Important Mechanics

**Football Players:**
- Require AERIAL TRICKS to damage (must be mid-air doing a trick)
- Take 3 hits to knockout
- Give MASSIVE KNOCKBACK if you hit them while grounded
- Chase you after you grab the football

**Controls:**
- WASD - Move
- Space - Jump
- Q/E/Z/B - Air tricks
- F - Grab football

## 🎯 Objectives

1. ✅ Grab the football
2. ✅ Survive 60 seconds
3. ✅ Knockout 5 players with aerial tricks

## 🏟️ The Crowd

The stadium generates **7,200 fans** in two massive bleacher sections!

Performance tested and optimized. If you experience lag:
- Reduce `rows` and `seatsPerRow` in the crowd config
- See STADIUM-GUIDE.md for optimization tips

## 🔊 Audio System

The engine supports sound files! To add:

```javascript
// Load sound
await game.loadSound('crowd', 'path/to/crowd.mp3');

// Play sound
game.playSound('crowd', 1.0);
```

Currently uses beeps for testing (no files needed).

## 🛠️ Customization

Want to create your own stadium? Edit `stadium-level.html`:

- Change field size in `ground` array
- Adjust player formations in `footballPlayers`
- Modify crowd sections in `crowd.sections`
- Add props for scoreboards, walls, etc.

See **STADIUM-GUIDE.md** for detailed examples!

## 📊 Performance Stats

**Crowd Size:** 7,200 members
**Football Players:** 21 NPCs
**Total Props:** 20+ stadium structures
**Runs at:** 30-60 FPS (depending on hardware)

## 🎨 Future Ideas

- Add halftime show NPCs
- Marching band obstacles
- Cheerleader NPCs
- Stadium announcer audio
- Multiple quarters/rounds
- Team scoring system

---

**HAVE FUN CAUSING CHAOS IN THE STADIUM!** 🛹🏈
