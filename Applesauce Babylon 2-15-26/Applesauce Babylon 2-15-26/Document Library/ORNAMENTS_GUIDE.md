# 🚀 SKATEBOARD ORNAMENTS SYSTEM
## Hood Ornaments, Rockets, Flags & More!

---

## 🎯 AVAILABLE ORNAMENTS

### 1. 🚀 ROCKET
**Description:** Rocket boosters with glowing exhaust
- Chrome body with red nose cone
- 3 fins for stability
- Glowing orange exhaust effect
- Perfect for: Speed aesthetic

### 2. 🏴 FLAG
**Description:** Skull flag on pole
- Silver pole (0.5 units tall)
- Black cloth flag
- White skull emblem
- Perfect for: Punk/metal style

### 3. 🦅 HOOD ORNAMENT
**Description:** Classic eagle ornament
- Gold metallic finish
- Spread wings design
- Mounted on pedestal
- Perfect for: Classy/vintage look

### 4. 💀 SKULL
**Description:** Detailed skull with glowing eyes
- White bone material
- Red glowing eye sockets
- Moving jaw
- Perfect for: Horror/death metal

### 5. ⚡ SPIKES
**Description:** Row of metal spikes
- 5 sharp spikes
- Chrome metallic
- Evenly spaced
- Perfect for: Aggressive style

### 6. 🔥 FLAMES
**Description:** Multi-layer flame effect
- Orange and gold layers
- Emissive glow
- Animated flicker
- Perfect for: Speed/heat theme

### 7. 📡 ANTENNA
**Description:** Bouncy antenna with ball
- Thin metal rod
- Red rubber ball topper
- Wobbles when moving
- Perfect for: Retro/radio car look

### 8. 🕊️ WINGS
**Description:** Angel wings with feathers
- White material
- 6 feather layers
- Spread design
- Perfect for: Angelic/flight theme

### 9. ⛓️ CHAINS
**Description:** Hanging chain links
- 6 interconnected links
- Chrome metallic
- Swings when moving
- Perfect for: Biker/tough style

### 10. 🔦 LASERS
**Description:** Laser emitter with beam
- Black emitter housing
- Cyan glowing beam
- Lens glow effect
- Perfect for: Sci-fi/tech look

### 11. ❌ NONE
**Description:** Remove all ornaments
- Clean board look
- No accessories
- Pure skating

---

## 📍 MOUNTING POSITIONS

### NOSE
- Front of deck
- Faces forward
- Most visible position
- Perfect for: Rockets, skulls, hood ornaments

### TAIL
- Back of deck
- Faces backward
- Good for flags
- Perfect for: Flags, flames, antennas

### SIDE-LEFT / SIDE-RIGHT
- Mounted on deck rails
- Stick out horizontally
- Can have pair (left + right)
- Perfect for: Spikes, wings, chains

### TOP
- Mounted on grip tape
- Sticks straight up
- Rare position
- Perfect for: Antenna, lasers, flags

---

## 🎨 DATA STRUCTURE

```javascript
ornaments: {
    nose: "skull",           // Ornament type or null
    tail: "flag",            // Ornament type or null
    sides: ["spikes"],       // Array of ornament types
    top: "antenna"           // Ornament type or null
}
```

### Example Setups:

**Aggressive Street:**
```javascript
ornaments: {
    nose: "skull",
    tail: null,
    sides: ["spikes"],
    top: null
}
```

**Speed Demon:**
```javascript
ornaments: {
    nose: "rocket",
    tail: "flames",
    sides: [],
    top: null
}
```

**Punk Rock:**
```javascript
ornaments: {
    nose: "hood-ornament",
    tail: "flag",
    sides: ["chains"],
    top: null
}
```

**Sci-Fi Tech:**
```javascript
ornaments: {
    nose: "lasers",
    tail: "lasers",
    sides: [],
    top: "antenna"
}
```

**Holy Roller:**
```javascript
ornaments: {
    nose: null,
    tail: null,
    sides: ["wings"],
    top: null
}
```

---

## 💡 DESIGN TIPS

### Matching Themes:
- **Speed:** Rocket + Flames + Red colors
- **Metal:** Skull + Chains + Spikes + Black/Silver
- **Retro:** Hood ornament + Antenna + Chrome
- **Tech:** Lasers + Antenna + Blue/Cyan colors
- **Clean:** No ornaments + Pristine deck

### Color Coordination:
Match ornament materials with:
- Truck color (metallic ornaments)
- Deck accent color (painted ornaments)
- Wheel core color (detailed ornaments)

### Performance Balance:
- Heavy ornaments (skull, hood): Visual weight on nose
- Light ornaments (antenna, flag): Minimal visual weight
- Symmetric (wings, spikes): Balanced left/right

---

## 🔧 TECHNICAL DETAILS

### Polygon Counts:
- Rocket: ~100 triangles
- Flag: ~50 triangles
- Hood Ornament: ~120 triangles
- Skull: ~150 triangles
- Spikes: ~40 triangles each
- Flames: ~80 triangles
- Antenna: ~30 triangles
- Wings: ~200 triangles
- Chains: ~60 triangles
- Lasers: ~40 triangles

**Total Impact:** ~200-500 triangles per ornament
Still very lightweight!

### Materials:
- Metallic: Chrome, silver, gold
- Emissive: Flames, lasers, eyes
- Standard: Cloth, bone, rubber

### Shadows:
All ornaments cast shadows for realism

### Animation Potential:
- Antenna: Wobble effect
- Chains: Swing physics
- Flags: Cloth simulation
- Flames: Flicker animation
- Laser beams: Pulse effect

---

## 🎮 IN EDITOR

### Selection:
1. Go to **⭐ ORNAMENTS** tab
2. Click ornament icon
3. Choose position (nose/tail/sides/top)
4. Preview updates instantly

### Visual Feedback:
- Selected ornament: Pink border
- Hover: Cyan border
- None selected: Gray

### Live Preview:
- Rotates automatically
- Press 📷 Reset View to center
- Press 🔄 to toggle auto-rotate

---

## 🚀 FUTURE ENHANCEMENTS

### Possible Additions:
- **Custom ornaments** - Upload 3D models
- **Animated ornaments** - Moving parts
- **Sound effects** - Rocket thrust, chain rattle
- **Particle effects** - Smoke, sparks
- **Multiple ornaments** - Mix and match
- **Ornament colors** - Customize materials
- **Size scaling** - Adjust ornament scale
- **Rotation** - Fine-tune orientation

---

## 💾 SAVING & LOADING

Ornaments are saved with the board:
```javascript
// Save
localStorage.setItem('skateboard_slot_1', JSON.stringify(boardData));

// Load
const board = JSON.parse(localStorage.getItem('skateboard_slot_1'));
// Ornaments automatically recreated!
```

---

## 🎨 EDITOR WORKFLOW

1. **Design Base Board**
   - Choose deck shape
   - Pick colors
   - Set wear level

2. **Configure Components**
   - Trucks height/color
   - Wheel size/hardness
   - Grip pattern

3. **Add Ornaments** ⭐
   - Select ornament type
   - Choose position
   - Preview in 3D

4. **Fine-Tune**
   - Adjust colors to match
   - Test different positions
   - Check all angles

5. **Save**
   - Choose slot (1-9)
   - Hit 💾 SAVE
   - Export JSON if needed

---

## 🛹 IN-GAME USAGE

Once saved, ornaments appear automatically:
```javascript
// Game loads board from slot
game.modules.skateboard.loadSkateboard();

// Ornaments are created and positioned
// No extra code needed!
```

Ornaments follow the skateboard perfectly - they're child objects of the skateboard group.

---

## 🎯 PRO COMBINATIONS

### "DEMON RIDER"
- Deck: Black with red under
- Trucks: Silver low
- Wheels: Red, 101a hard
- Ornaments: Skull (nose) + Flames (tail) + Spikes (sides)

### "SKY RACER"
- Deck: Blue with cyan under
- Trucks: Chrome mid
- Wheels: White, 95a
- Ornaments: Rocket (nose) + Wings (sides) + Antenna (top)

### "DEATH MACHINE"
- Deck: Gray trashed
- Trucks: Black low
- Wheels: Dark gray, heavily worn
- Ornaments: Skull (nose) + Chains (sides)

### "CLEAN CLASSIC"
- Deck: Natural wood bamboo
- Trucks: Silver mid
- Wheels: White classic, 99a
- Ornaments: None (pure board)

### "PUNK DESTROYER"
- Deck: Hot pink with black
- Trucks: Chrome high
- Wheels: Black, 85a soft
- Ornaments: Flag (tail) + Spikes (sides) + Hood ornament (nose)

---

Made with 💀 for South of South Records
**Skate or Die! 🛹🚀**
