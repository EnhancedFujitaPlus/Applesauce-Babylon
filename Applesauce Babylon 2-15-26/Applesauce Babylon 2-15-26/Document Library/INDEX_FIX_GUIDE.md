# INDEX.HTML FIX & UPGRADE GUIDE

## 🐛 **IMMEDIATE FIX - Line 1607 Error**

### The Problem
Line 1607 tries to access `event.target` but the `event` parameter isn't passed to the function.

```javascript
// Line 1587 (CURRENT - BROKEN):
levelBtn.onclick = () => selectLevel(level);

// Line 1607 (TRIES TO USE):
event.target.closest('.level-btn').classList.add('selected');
// ❌ ERROR: event is not defined!
```

### Quick Fix Option 1: Pass Event

**FIND (around line 1587):**
```javascript
levelBtn.onclick = () => selectLevel(level);
```

**REPLACE WITH:**
```javascript
levelBtn.onclick = (event) => selectLevel(level, event);
```

**FIND (around line 1600):**
```javascript
function selectLevel(level) {
```

**REPLACE WITH:**
```javascript
function selectLevel(level, event) {
```

### Quick Fix Option 2: Use This Reference (RECOMMENDED)

**FIND (around line 1587):**
```javascript
const levelBtn = document.createElement('div');
levelBtn.className = 'level-btn';
levelBtn.onclick = () => selectLevel(level);
```

**REPLACE WITH:**
```javascript
const levelBtn = document.createElement('div');
levelBtn.className = 'level-btn';
levelBtn.onclick = function() { selectLevel(level, this); };
```

**FIND (around line 1600-1607):**
```javascript
function selectLevel(level) {
    selectedLevel = level;
    
    // Update selected button visual
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.closest('.level-btn').classList.add('selected');
```

**REPLACE WITH:**
```javascript
function selectLevel(level, buttonElement) {
    selectedLevel = level;
    
    // Update selected button visual
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    if (buttonElement) {
        buttonElement.classList.add('selected');
    }
```

---

## 🚀 **FULL UPGRADE - Modular System**

For a cleaner, more maintainable setup, integrate the new modular files:

### Step 1: Add Script References to index.html

**FIND (in <head> section, before closing </head>):**
```html
</head>
```

**ADD BEFORE IT:**
```html
    <!-- ⭐ NEW: Modular data files -->
    <script src="level-registry.js"></script>
    <script src="changelog.js"></script>
</head>
```

### Step 2: Replace levelData Object

**FIND (around line 902):**
```javascript
const levelData = {
    chapter1: [ ... hundreds of lines ... ],
    chapter2: [ ... ],
    // etc
};
```

**REPLACE ENTIRE BLOCK WITH:**
```javascript
// ⭐ Use modular level registry instead
const levelData = ApplesauceLevelRegistry.levelData;
```

**Note:** This single line replaces hundreds of lines!

### Step 3: Update launchMission Function

**FIND (around line 1734):**
```javascript
function launchMission() {
    if (selectedLevel) {
        if (selectedLevel.status === '🔒') {
            alert(`LEVEL LOCKED\n\nComplete previous missions to unlock "${selectedLevel.name}"`);
        } else {
            // Old logic
            const levelId = selectedLevel.id;
            const levelName = encodeURIComponent(selectedLevel.name);
            window.location.href = `game.html?id=${levelId}&name=${levelName}`;
        }
    }
}
```

**REPLACE WITH:**
```javascript
function launchMission() {
    if (selectedLevel) {
        // ⭐ Use smart level registry launcher
        ApplesauceLevelRegistry.launchLevel(selectedLevel);
    }
}
```

### Step 4: Update Changelog Display

**FIND (where the update log HTML is defined - probably a huge string):**
```javascript
// Probably around line 800-900
document.getElementById('updateLog').innerHTML = `
    <div>v0.0.8 - ...</div>
    <div>v0.0.7 - ...</div>
    // ... hundreds of lines ...
`;
```

**REPLACE WITH:**
```javascript
// ⭐ Use modular changelog
document.getElementById('updateLog').innerHTML = ApplesauceChangelog.getFormattedHTML();
```

---

## 📁 **File Organization**

Your project structure should now look like:

```
project/
├── index.html (main menu)
├── game.html (universal .js level loader)
├── level-registry.js ⭐ NEW
├── changelog.js ⭐ NEW
│
├── levels/
│   ├── level_1.js (modular config)
│   ├── level_16.js (modular config)
│   ├── Level_2.html (monolithic)
│   ├── Level_3.html (monolithic)
│   └── ... (rest of your levels)
│
├── applesauce-core-r182-FINAL.js
├── applesauce-terrain-r182-organic.js
├── applesauce-gore-r182.js
├── applesauce-dialogue-r182.js
├── applesauce-enemies-r182.js
└── ... (other modules)
```

---

## 🎯 **How It Works**

### For .html Levels (Old System)
```javascript
// In level-registry.js:
{
    id: 2,
    name: "Rave",
    type: "html",  // ⭐ Direct load
    file: "Level_2.html"
}

// When launched:
ApplesauceLevelRegistry.launchLevel(level);
// → window.location.href = "Level_2.html"
```

### For .js Levels (New System)
```javascript
// In level-registry.js:
{
    id: 1,
    name: "Park",
    type: "js",  // ⭐ Use game.html loader
    file: "level_1.js"
}

// When launched:
ApplesauceLevelRegistry.launchLevel(level);
// → window.location.href = "game.html?id=1&name=Park"
// → game.html loads levels/level_1.js
// → window.Level1Config is parsed
// → Core engine uses the config
```

---

## ⚙️ **Advanced: Updating game.html**

Your `game.html` already supports .js levels! But you can enhance it:

**FIND (around line 266):**
```javascript
script.src = `./levels/level_${levelId}.js`;
```

**OPTIONAL: Add better error handling:**
```javascript
script.src = `./levels/level_${levelId}.js`;
script.onerror = function() {
    console.error('❌ Failed to load level file!');
    
    // ⭐ NEW: Try alternative naming
    const altScript = document.createElement('script');
    altScript.src = `./Level_${levelId}.js`;
    altScript.onerror = function() {
        document.getElementById('loading-text').textContent = 'ERROR!';
        document.getElementById('loading-details').textContent = 
            `Cannot find level_${levelId}.js or Level_${levelId}.js`;
    };
    document.body.appendChild(altScript);
};
```

---

## 📝 **Adding New Levels**

### Add a .html Level:
```javascript
// In level-registry.js:
ApplesauceLevelRegistry.addLevel(1, {
    id: 99,
    name: "Test Level",
    difficulty: "Easy",
    objectives: "5",
    timeLimit: "4:00",
    status: "",
    image: "images/level99_preview.png",
    description: "A test level.",
    type: "html",
    file: "Level_99.html"
});
```

### Add a .js Level:
```javascript
ApplesauceLevelRegistry.addLevel(1, {
    id: 100,
    name: "Modular Test",
    difficulty: "Easy",
    objectives: "5",
    timeLimit: "4:00",
    status: "",
    image: "images/level100_preview.png",
    description: "A modular test level.",
    type: "js",
    file: "level_100.js"
});
```

Then create `levels/level_100.js` with:
```javascript
window.Level100Config = {
    meta: {
        name: "Modular Test",
        number: 100,
        theme: "test"
    },
    terrain: { /* ... */ },
    // ... rest of config
};
```

---

## 🔄 **Migration Path**

### Phase 1 (Immediate - 5 minutes)
1. ✅ Fix the line 1607 error (Quick Fix Option 2)
2. ✅ Test that level selection works
3. ✅ Done! Everything still works

### Phase 2 (Clean Up - 15 minutes)
1. ✅ Add level-registry.js to project
2. ✅ Add changelog.js to project
3. ✅ Update index.html script references
4. ✅ Replace levelData with registry
5. ✅ Replace launchMission logic
6. ✅ Test both .html and .js levels

### Phase 3 (Gradual Migration - Ongoing)
1. ✅ Convert levels to .js as you update them
2. ✅ Update level-registry.js for each conversion
3. ✅ Keep .html versions as fallback
4. ✅ Eventually all levels are modular!

---

## 🐛 **Troubleshooting**

### "Level won't launch!"
- Check `type` in level-registry.js ('html' or 'js')
- Verify file path is correct
- Check browser console for errors

### "Descriptions not showing!"
- Make sure selectLevel gets buttonElement parameter
- Check that level object has 'description' property
- Verify innerHTML assignment works

### ".js level shows 'Cannot find level file'"
- Check file is in `levels/` folder
- Verify filename matches registry exactly
- Check browser Network tab for 404 errors

### "Both systems mixed up!"
- .html levels go straight to the file
- .js levels go through game.html
- Check the `type` field in registry

---

## 📊 **Benefits**

| Feature | Before | After |
|---------|--------|-------|
| Line count | 2000+ in index.html | ~500 (with modules) |
| Maintainability | Hard to find levels | Centralized registry |
| Flexibility | One system only | Both .html & .js |
| Updates | Edit huge file | Edit small modules |
| Changelog | Embedded in HTML | Separate file |
| Adding levels | Copy/paste 50+ lines | Add small object |

---

## 🎉 **You're Done!**

Your index is now:
- ✅ Bug-free (no more line 1607 error)
- ✅ Organized (separate data files)
- ✅ Flexible (supports both level types)
- ✅ Maintainable (easy to update)
- ✅ Scalable (easy to add levels)

Ready to build those worlds! 🌍🛹
