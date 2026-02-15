# APPLESAUCE MENU SYSTEM - SETUP GUIDE

## 🎮 KEYBOARD CONTROLS

### Main Menu
- **↑ / W** - Navigate up
- **↓ / S** - Navigate down  
- **ENTER / SPACE** - Select menu item

### Campaign Menu
- **← / A** - Navigate left through levels
- **→ / D** - Navigate right through levels
- **↑ / W** - Navigate up in level grid
- **↓ / S** - Navigate down in level grid
- **1 / 2 / 3** - Switch to Chapter 1/2/3
- **ENTER / SPACE** - Launch selected mission
- **H** - View high scores for selected level
- **ESC** - Return to main menu

### Global Controls
- **F1** - Toggle keyboard controls help overlay
- **? Button** - Click help button in bottom-right

---

## 🚀 LEVEL LAUNCHING METHODS

The menu system provides 4 different ways to launch levels. Choose the one that works best for your setup!

### METHOD 1: Separate HTML Files Per Level
**Best for:** Simple projects with distinct level files

```javascript
// In launchMission() function, use:
window.location.href = `level_${selectedLevel.id}.html`;
```

**File structure:**
```
/your-game-folder/
  ├── applesauce_menu.html
  ├── level_1.html
  ├── level_2.html
  ├── level_3.html
  └── ...
```

**Pros:** 
- Simple and straightforward
- Each level is independent
- Easy to test individual levels

**Cons:**
- Lots of duplicate code
- Harder to maintain


### METHOD 2: Single Level File with URL Parameters (RECOMMENDED)
**Best for:** Most projects - clean and flexible

```javascript
// In launchMission() function, use:
window.location.href = `level.html?id=${selectedLevel.id}&chapter=${currentChapter}&name=${encodeURIComponent(selectedLevel.name)}`;
```

**In your level.html, receive the data:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const levelId = urlParams.get('id');        // "1", "2", etc.
const chapterId = urlParams.get('chapter'); // "1", "2", "3"
const levelName = urlParams.get('name');    // "Tutorial Run", etc.

// Use levelId to load the correct level configuration
loadLevel(levelId);
```

**Pros:**
- Single level file to maintain
- Easy to pass data
- URL is shareable (users can bookmark specific levels)

**Cons:**
- All data must be URL-safe


### METHOD 3: localStorage for Complex Data
**Best for:** Passing complex level configurations

```javascript
// In launchMission() function, use:
localStorage.setItem('selectedLevel', JSON.stringify(selectedLevel));
localStorage.setItem('currentChapter', currentChapter);
window.location.href = 'level.html';
```

**In your level.html, receive the data:**
```javascript
const levelData = JSON.parse(localStorage.getItem('selectedLevel'));
const currentChapter = localStorage.getItem('currentChapter');

console.log(levelData); 
// { id: 1, name: "Tutorial Run", difficulty: "Easy", ... }

// Clear the data after use (optional)
localStorage.removeItem('selectedLevel');
```

**Pros:**
- Can pass complex objects and arrays
- No URL limitations
- Persists even if user refreshes

**Cons:**
- Data persists between sessions (unless cleared)
- Not shareable via URL


### METHOD 4: Open in New Tab (Testing/Development)
**Best for:** Testing while keeping menu open

```javascript
// In launchMission() function, use:
window.open(`level_${selectedLevel.id}.html`, '_blank');
```

**Pros:**
- Menu stays open for quick testing
- Easy to switch between levels

**Cons:**
- Creates multiple tabs
- Not ideal for production


---

## 📁 RECOMMENDED PROJECT STRUCTURE

```
/applesauce-game/
  ├── index.html              (or rename applesauce_menu.html to this)
  ├── level.html              (main game/level file)
  ├── editor.html             (level editor)
  ├── settings.html           (settings menu)
  │
  ├── /css/
  │   └── styles.css          (optional: extract CSS)
  │
  ├── /js/
  │   ├── menu.js             (optional: extract JS)
  │   ├── game.js             (your main game logic)
  │   └── level-loader.js     (level loading logic)
  │
  ├── /assets/
  │   ├── /videos/
  │   │   └── mainmenudemo.mp4
  │   ├── /images/
  │   │   ├── level_previews/
  │   │   │   ├── level1_preview.jpg
  │   │   │   ├── level2_preview.jpg
  │   │   │   └── ...
  │   │   └── gameplay/
  │   │       └── placeholder_gameplay.jpg
  │   ├── /sounds/
  │   │   ├── hover.mp3
  │   │   ├── click.mp3
  │   │   ├── navigate.mp3
  │   │   ├── back.mp3
  │   │   └── chapter.mp3
  │   └── /models/
  │       └── (your 3D models)
  │
  └── /levels/
      ├── level_1.json        (level data files)
      ├── level_2.json
      └── ...
```

---

## 🎯 LEVEL DATA FORMAT EXAMPLES

### JSON Level File Example (levels/level_1.json)
```json
{
  "id": 1,
  "name": "Tutorial Run",
  "chapter": 1,
  "difficulty": "Easy",
  "timeLimit": null,
  "objectives": [
    "Complete 3 unique trick combinations",
    "Find the hidden helmet fragment",
    "Achieve a score of 50,000 points"
  ],
  "geometry": {
    "obstacles": [
      { "type": "ramp", "position": [0, 0, 0], "rotation": [0, 0, 0] },
      { "type": "rail", "position": [10, 0, 5], "rotation": [0, 45, 0] }
    ],
    "checkpoints": [[0, 0, 0], [20, 0, 10], [40, 0, 0]],
    "bounds": { "min": [-50, -10, -50], "max": [50, 50, 50] }
  },
  "lighting": {
    "ambient": "#87CEEB",
    "directional": "#FFD700"
  }
}
```

### Loading JSON Levels in level.html
```javascript
async function loadLevel(levelId) {
    try {
        const response = await fetch(`levels/level_${levelId}.json`);
        const levelData = await response.json();
        
        // Use the level data to build your Three.js scene
        buildScene(levelData.geometry);
        setLighting(levelData.lighting);
        setupObjectives(levelData.objectives);
        
        if (levelData.timeLimit) {
            startTimer(levelData.timeLimit);
        }
        
        return levelData;
    } catch (error) {
        console.error('Failed to load level:', error);
        return null;
    }
}
```

---

## 💾 SAVING PROGRESS & HIGH SCORES

### Save Level Completion
```javascript
function completeLevel(levelId, score, time, stats) {
    // Mark as completed
    localStorage.setItem(`level_${levelId}_completed`, 'true');
    
    // Save score if it's a high score
    const highScoreKey = `level_${levelId}_highscore`;
    const currentHigh = parseInt(localStorage.getItem(highScoreKey)) || 0;
    
    if (score > currentHigh) {
        localStorage.setItem(highScoreKey, score);
        localStorage.setItem(`level_${levelId}_time`, time);
        localStorage.setItem(`level_${levelId}_stats`, JSON.stringify(stats));
    }
    
    // Unlock next level
    const nextLevelId = levelId + 1;
    localStorage.setItem(`level_${nextLevelId}_unlocked`, 'true');
}
```

### Check if Level is Unlocked (in menu)
```javascript
function isLevelUnlocked(levelId) {
    if (levelId === 1) return true; // First level always unlocked
    return localStorage.getItem(`level_${levelId}_unlocked`) === 'true';
}

// Update level status display
function updateLevelStatus(levelId) {
    const completed = localStorage.getItem(`level_${levelId}_completed`) === 'true';
    const unlocked = isLevelUnlocked(levelId);
    
    if (completed) return '✓';
    if (!unlocked) return '🔒';
    return '';
}
```

---

## 🎨 CUSTOMIZING THE MENU

### Change Color Schemes
In the CSS `:root` section, modify the chapter colors:

```css
:root {
    /* Chapter 1 - Your custom colors */
    --ch1-primary: #87CEEB;
    --ch1-secondary: #FFD700;
    --ch1-dark: #1a4d6d;
    
    /* Chapter 2 */
    --ch2-primary: #8B0000;
    --ch2-secondary: #4a4a4a;
    --ch2-dark: #2a0000;
    
    /* Chapter 3 */
    --ch3-primary: #9370DB;
    --ch3-secondary: #00FF00;
    --ch3-dark: #2d1b4e;
}
```

### Add More Levels
In the `levelData` object in applesauce_menu.html:

```javascript
const levelData = {
    chapter1: [
        {
            id: 1,
            name: "Your Level Name",
            difficulty: "Easy",
            objectives: "3",
            timeLimit: "5:00",
            status: "",
            image: "level1_preview.jpg",
            description: "Your level description here..."
        },
        // Add more levels...
    ],
    chapter2: [ /* ... */ ],
    chapter3: [ /* ... */ ]
};
```

---

## 🔊 ADDING SOUND EFFECTS

### Setup Sound Files
1. Create a `/sounds/` folder
2. Add these sound files:
   - hover.mp3 (subtle UI sound)
   - click.mp3 (button click)
   - navigate.mp3 (arrow key navigation)
   - back.mp3 (back/escape sound)
   - chapter.mp3 (chapter switch sound)
   - locked.mp3 (trying to access locked level)

### Enable Sound in the Code
In `playSound()` function, uncomment:

```javascript
function playSound(soundName) {
    const audio = new Audio(`sounds/${soundName}.mp3`);
    audio.volume = 0.3; // Adjust volume (0.0 to 1.0)
    audio.play().catch(e => console.log('Sound play failed:', e));
}
```

---

## 🐛 TROUBLESHOOTING

### Levels Won't Launch
- Check that your level files exist in the correct location
- Verify the file names match exactly (case-sensitive)
- Open browser console (F12) to see error messages

### Keyboard Controls Not Working
- Make sure no other element has focus
- Check browser console for JavaScript errors
- Try clicking on the page first to give it focus

### Video Background Not Playing
- Verify video file path is correct
- Check video format (MP4 is most compatible)
- Some browsers block autoplay - user may need to interact first

### Images Not Loading
- Check image file paths in levelData
- Verify images exist in the correct folder
- Use relative paths, not absolute paths

---

## 🚀 QUICK START CHECKLIST

1. ✅ Set your background video path
2. ✅ Choose a level launching method (Method 2 recommended)
3. ✅ Create your level.html file (use level_example.html as template)
4. ✅ Add your level preview images
5. ✅ Update levelData with your actual levels
6. ✅ (Optional) Add sound effects
7. ✅ Test keyboard navigation
8. ✅ Hook up to your actual game engine

---

## 📚 NEXT STEPS

- Integrate with your existing Three.js skateboarding game
- Implement level editor functionality
- Add settings menu (graphics, audio, controls)
- Create achievement/trophy system
- Add replay system for best runs
- Implement online leaderboards

---

Good luck with APPLESAUCE! 🛹💀
