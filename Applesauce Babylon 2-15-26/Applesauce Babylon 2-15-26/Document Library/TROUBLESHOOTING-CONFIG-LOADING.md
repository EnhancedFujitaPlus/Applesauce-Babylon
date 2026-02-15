# 🔧 TROUBLESHOOTING: "Config not found in loaded script"

## The Problem

When you click a level, you get this error:
```
Failed to load level: Config not found in loaded script
```

## Why This Happens

The config file defines a variable using `const` or `let`, which doesn't automatically add it to the global `window` object:

```javascript
// ❌ THIS WON'T WORK
const Level16Config = {
    meta: { name: "MY LEVEL" }
};
```

The main menu tries to access `window.Level16Config`, but it's `undefined`!

## The Solution

Use `window.LevelXXConfig` directly in your config file:

```javascript
// ✅ THIS WORKS!
window.Level16Config = {
    meta: { name: "MY LEVEL" }
};
```

## Quick Fix for Your Files

### Step 1: Open your level config file

For example: `level-16-config-enhanced.js`

### Step 2: Change the first line

**From:**
```javascript
const Level16Config = {
```

**To:**
```javascript
window.Level16Config = {
```

### Step 3: Remove the export at the bottom (if present)

**Remove this:**
```javascript
// Export for module loading
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level16Config;
}
```

**Replace with:**
```javascript
console.log('✅ Level 16 Config Loaded');
```

### Step 4: Save and refresh

That's it! The level should now load.

---

## Testing Your Fix

### 1. Open Browser Console (F12)

When you load the level, you should see:
```
📦 Loading config from: levels/level-16-config-enhanced.js
✅ Script loaded: levels/level-16-config-enhanced.js
✅ Level 16 Config Loaded
✅ Found config as: Level16Config
🎮 Loading PYROCLASTIC PLAYGROUND...
```

### 2. If You Still See Errors

Check the console for:
```
🔍 Looking for config with names: [...]
🔍 Available on window: [...]
```

This tells you:
- What names it tried to find
- What's actually available

---

## Creating New Level Configs

Always use this template:

```javascript
// level-XX-config.js
// IMPORTANT: Use window.LevelXXConfig!

window.LevelXXConfig = {
    meta: {
        name: "YOUR LEVEL NAME",
        number: XX,
        theme: "your-theme",
        description: "Cool description",
        difficulty: "MEDIUM"
    },
    
    scene: {
        background: 0x87CEEB,
        fog: {
            color: 0x87CEEB,
            near: 100,
            far: 400
        }
    },
    
    terrain: {
        size: 500,
        hill: true
    },
    
    obstacles: {
        rails: { count: 5 },
        ramps: { count: 3 }
    },
    
    objectives: {
        survive: { duration: 300 },
        score: { target: 25000 }
    }
};

console.log('✅ Level XX Config Loaded');
```

---

## Naming Convention

The config variable name should match this pattern:
```
level-16-config-enhanced.js  →  window.Level16Config
level-01-config.js           →  window.Level01Config
level-23-volcano.js          →  window.Level23Config
```

**General rule**: `window.LevelXXConfig` where XX is the level number

---

## Common Issues & Solutions

### Issue: "Failed to load config from [path]"
**Cause**: File doesn't exist or path is wrong

**Fix**: 
1. Check the file exists in the right folder
2. Verify path in `LEVEL_REGISTRY` matches actual location
3. Make sure you're running a local server (not file://)

### Issue: Config loads but game doesn't start
**Cause**: Config might be missing required fields

**Fix**: Make sure your config has at minimum:
```javascript
{
    meta: { name: "...", number: X },
    terrain: { size: 500 }
}
```

### Issue: Console shows "undefined" for Level16Config
**Cause**: Not using `window.Level16Config`

**Fix**: Change `const` to `window.` in your config file

---

## Verification Checklist

Before testing a new level:

- [ ] Config file uses `window.LevelXXConfig = {...}`
- [ ] Config has a `meta` section with `name` and `number`
- [ ] Config has a `terrain` section
- [ ] File is saved in the correct location
- [ ] Path in `LEVEL_REGISTRY` matches actual file location
- [ ] Running a local server (not file://)
- [ ] Browser console is open to see any errors

---

## Still Having Issues?

### Debug Mode

Add this to your config file at the top:
```javascript
console.log('🔍 Starting to load config file...');

window.Level16Config = {
    // ... your config
};

console.log('🔍 Config defined:', window.Level16Config);
console.log('🔍 Meta:', window.Level16Config.meta);
```

Then refresh and check the console. You should see:
```
🔍 Starting to load config file...
🔍 Config defined: {meta: {...}, terrain: {...}, ...}
🔍 Meta: {name: "...", number: 16}
```

If you don't see these, the script isn't loading at all (check the file path).

---

## Example: Complete Working Config

Here's a minimal working example you can copy:

```javascript
// level-99-test.js
window.Level99Config = {
    meta: {
        name: "TEST LEVEL",
        number: 99,
        theme: "test"
    },
    terrain: {
        size: 500,
        hill: true
    }
};
console.log('✅ Test Level Loaded');
```

Register it:
```javascript
// In main menu
{
    id: 99,
    name: "TEST LEVEL",
    configPath: "levels/level-99-test.js",
    difficulty: "EASY"
}
```

If this works, your setup is correct!

---

## Pro Tips

1. **Always check browser console** - It will tell you exactly what went wrong
2. **Start simple** - Test with a minimal config first
3. **Use the debug console logs** - They show you what the loader is looking for
4. **Verify paths** - Most issues are just wrong file paths
5. **Use a local server** - file:// protocol won't work

---

## Quick Reference

### ✅ Correct Config Format
```javascript
window.Level16Config = {
    meta: { name: "LEVEL", number: 16 },
    terrain: { size: 500 }
};
```

### ❌ Wrong Config Format
```javascript
const Level16Config = {  // ← Wrong! Not global
    meta: { name: "LEVEL", number: 16 }
};
```

---

## Need More Help?

1. Open browser console (F12)
2. Try to load the level
3. Copy the error messages
4. Check what the debug logs say
5. Verify your config matches the correct format above

The improved error messages will tell you exactly what's wrong! 🎯
