# 🔧 APPLESAUCE Troubleshooting Guide

## Common Module Loading Errors

### Error: "startGame is not defined"

**Cause:** The module chain failed to load, so `window.startGame` never gets assigned.

**Why it happens:**
1. Missing `three.module.js` file
2. Incorrect file paths in imports
3. Missing other required modules
4. Syntax errors in any imported file

**How to diagnose:**
1. Open browser console (F12)
2. Look for the FIRST error message
3. It will usually say something like: `Failed to load module script: The server responded with a non-JavaScript MIME type`

### Error: "THREE is not defined"

**Cause:** A file is using `THREE` without importing it.

**Fixed in:** `applesauce-materials.js` now has `import * as THREE from './three.module.js'`

**If you still see this:** Check that ALL files using THREE have the import at the top.

---

## Required File Structure

Your directory should look like this:

```
your-project/
├── three.module.js                    ← MUST HAVE THIS
├── applesauce-core_copy_2.js         ← Main engine
├── applesauce-materials.js           ← Material definitions
├── applesauce-level-wildwest.js      ← Level config
├── applesauce-gore-r182.js           ← Gore system
├── applesauce-dialogue.js            ← Dialogue system
├── applesauce-enemies-r182.js        ← Enemy system
├── applesauce-objectives-r182.js     ← Objectives system
├── applesauce-terrain-r182.js        ← Terrain generation
├── applesauce-collision.js           ← Collision detection
├── applesauce-hybrid-gore-r182.js    ← Hybrid gore system
└── wildwest-level.html               ← Game launcher
```

---

## Quick Fixes

### 1. Missing three.module.js

**Solution:** Download Three.js r182 module version

```bash
# Download from CDN (use browser)
https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js

# Or if you have npm
npm install three@0.182.0
# Then copy from node_modules/three/build/three.module.js
```

### 2. Wrong file paths

If your Three.js is in a subfolder, update imports:

```javascript
// In applesauce-materials.js
import * as THREE from './lib/three.module.js';  // If in lib/

// In applesauce-core_copy_2.js
import * as THREE from './vendor/three.module.js';  // If in vendor/
```

### 3. CORS errors when loading locally

**Problem:** Browser blocks local file imports for security.

**Solution:** Use a local web server:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server

# Option 3: VS Code
# Install "Live Server" extension, right-click HTML file → "Open with Live Server"
```

Then open: `http://localhost:8000/wildwest-level.html`

### 4. Check all files are present

The new HTML provides better error messages. When you click START GAME, it will tell you:

- ❌ "Cannot find three.module.js" → Download Three.js
- ❌ "Cannot find applesauce-core_copy_2.js" → Missing core file
- ❌ "Cannot find applesauce-level-wildwest.js" → Missing level file
- ✅ "All modules loaded successfully!" → You're good to go!

---

## Step-by-Step Debugging

### Step 1: Open Console
Press F12 in your browser, click "Console" tab

### Step 2: Click START GAME
Watch the console for messages

### Step 3: Read the FIRST error
Ignore everything after the first error - fix that first

### Step 4: Common error patterns

**"Failed to resolve module specifier"**
→ File path is wrong or file doesn't exist

**"MIME type of text/html"**
→ Server is returning HTML error page instead of JS file (usually 404)

**"Unexpected token '<'"**
→ Trying to load HTML as JavaScript (file doesn't exist)

**"Cannot read property 'X' of undefined"**
→ Module loaded but missing dependency

### Step 5: Verify files exist
In console, try:

```javascript
// Test if files are accessible
fetch('./three.module.js').then(r => console.log('THREE:', r.ok));
fetch('./applesauce-core_copy_2.js').then(r => console.log('CORE:', r.ok));
fetch('./applesauce-materials.js').then(r => console.log('MATERIALS:', r.ok));
```

Should all return `true`

---

## Module Import Chain

Understanding the load order helps debug:

```
wildwest-level.html
  ↓ imports
applesauce-core_copy_2.js
  ↓ imports
  ├── three.module.js              ← If this fails, everything fails
  ├── applesauce-materials.js
  │     ↓ imports
  │     └── three.module.js        ← Needs THREE too!
  ├── applesauce-gore-r182.js
  ├── applesauce-dialogue.js
  ├── applesauce-enemies-r182.js
  ├── applesauce-objectives-r182.js
  ├── applesauce-terrain-r182.js
  ├── applesauce-collision.js
  └── applesauce-hybrid-gore-r182.js

wildwest-level.html also imports:
  └── applesauce-level-wildwest.js
        ↓ imports
        └── (nothing - just exports config)
```

**Key insight:** If `three.module.js` is missing, the ENTIRE chain fails, and you get "startGame is not defined" because the HTML's module never finishes loading.

---

## Testing Individual Modules

To test if a module works in isolation:

```html
<!-- test.html -->
<script type="module">
  import * as THREE from './three.module.js';
  console.log('THREE loaded:', THREE);
  
  import { ApplesauceMaterials } from './applesauce-materials.js';
  console.log('Materials loaded!');
</script>
```

---

## Production Checklist

Before deploying:

- [ ] All files in same directory (or paths updated)
- [ ] Running from web server (not file://)
- [ ] three.module.js is r182 or compatible
- [ ] All files have correct imports
- [ ] No syntax errors (check console)
- [ ] Browser console shows no 404 errors

---

## Still Stuck?

1. Check console for the EXACT error message
2. Verify file names match import statements (case-sensitive!)
3. Make sure you're using a web server, not opening HTML directly
4. Try the updated `wildwest-level.html` - it has better error messages
5. Test `three.module.js` loads by itself first

The new HTML file will now show you exactly what's failing! 🎯
