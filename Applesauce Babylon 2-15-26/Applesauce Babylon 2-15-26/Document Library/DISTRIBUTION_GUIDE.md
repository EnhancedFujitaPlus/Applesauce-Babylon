# ARCADE GALLERY - DISTRIBUTION GUIDE

## 🎮 What You've Got

A fully self-contained Babylon.js arcade gallery that displays your projects as 3D arcade cabinets with cover art. It's browser-based, so it works anywhere!

## 📦 Distribution Options

### OPTION 1: Simple Web Hosting (RECOMMENDED)
**Best for: Sharing with artists, embedding on South of South Records site**

1. Upload to your web server:
   - `arcade_gallery.html` (the main file)
   - `art_data.json` (your project data)
   - `cover_art/` folder (with your cover images)

2. Access at: `https://yoursite.com/arcade_gallery.html`

3. Share the link with artists!

**Pros:**
- No installation needed
- Works on phones, tablets, desktops
- Easy to update (just edit files on server)
- Can embed in other pages with iframe

### OPTION 2: Local File System
**Best for: Personal use, offline access**

1. Create a folder structure:
   ```
   arcade_gallery/
   ├── arcade_gallery.html
   ├── art_data.json
   └── cover_art/
       ├── applesauce.png
       ├── treaty.png
       └── symb.png
   ```

2. Double-click `arcade_gallery.html` to open in browser

**Pros:**
- Works offline
- No server needed
- Portable (USB drive, etc)

**Cons:**
- Some browsers restrict local file access
- Need to update files manually

### OPTION 3: GitHub Pages (FREE HOSTING)
**Best for: Public showcase, portfolio**

1. Create a GitHub repository
2. Upload your files
3. Enable GitHub Pages in settings
4. Access at: `https://yourusername.github.io/arcade-gallery/`

**Pros:**
- Free hosting
- Version control
- Easy collaboration
- Professional URL

### OPTION 4: Netlify Drop (EASIEST)
**Best for: Quick deployment, drag-and-drop**

1. Go to https://app.netlify.com/drop
2. Drag your folder
3. Get instant URL: `https://random-name.netlify.app`

**Pros:**
- Literally 30 seconds to deploy
- Free hosting
- Automatic HTTPS
- Can customize domain

## 🔧 Converting Your Python Data

Your current `art_data.json` from the Python gallery can be used directly! Just need to add cover art URLs.

### Current Format (Python):
```json
{
  "applesauce_level13.html": {
    "tags": ["babylon.js", "physics"],
    "category": "Games",
    "type": "game"
  }
}
```

### Enhanced Format (Arcade):
```json
{
  "applesauce_level13.html": {
    "title": "APPLESAUCE Level 13",
    "description": "Helmet Factory with advanced physics...",
    "tags": ["babylon.js", "physics"],
    "category": "Games",
    "type": "game",
    "coverArt": "./cover_art/applesauce.png",
    "version": "2.0"
  }
}
```

## 🎨 Adding Cover Art

### Quick Method: Use Placeholders
The demo uses placeholder images. To add real cover art:

1. Create a `cover_art/` folder
2. Add images (PNG/JPG): `applesauce.png`, `treaty.png`, etc.
3. Update `coverArt` paths in `art_data.json`

### Cover Art Tips:
- Square images work best (512x512 or 1024x1024)
- PNG with transparency looks cool with neon glow
- Use bright colors (they pop in the arcade aesthetic)
- Can be album art, screenshots, logos, or custom graphics

### Automated Cover Art:
If you don't have cover art, you can:
- Screenshot your HTML projects
- Use first frame of your games
- Create text-based graphics (matches your terminal aesthetic)
- Use AI generation (matching your style)

## 📝 Loading Your Data Dynamically

Replace the hardcoded `PROJECTS` array with JSON loading:

```javascript
// Add this before createScene()
async function loadProjects() {
    try {
        const response = await fetch('art_data.json');
        const data = await response.json();
        
        // Convert your format to arcade format
        const projects = Object.entries(data).map(([filename, info]) => ({
            filename: filename,
            title: info.title || filename.replace('.html', ''),
            description: info.description || 'No description available',
            category: info.category || 'Uncategorized',
            tags: info.tags || [],
            type: info.type || 'tool',
            coverArt: info.coverArt || 'https://via.placeholder.com/512',
            version: info.version || '1.0'
        }));
        
        return projects;
    } catch (error) {
        console.error('Error loading projects:', error);
        return []; // Fallback to demo data
    }
}

// Then modify the script:
loadProjects().then(projects => {
    if (projects.length > 0) {
        PROJECTS = projects;
    }
    scene = createScene();
    // ... rest of render loop
});
```

## 🚀 Integration with Artist Tools

### Embed in Website:
```html
<iframe src="arcade_gallery.html" 
        width="100%" 
        height="800px" 
        frameborder="0">
</iframe>
```

### Link from Terminal Gallery:
Add an option in your Python gallery:
```python
elif cmd_lower == "arcade":
    webbrowser.open("arcade_gallery.html")
```

### Auto-Generate from Python:
Create a script to export your Python data to arcade format:

```python
import json

def export_to_arcade():
    with open('art_data.json', 'r') as f:
        data = json.load(f)
    
    arcade_data = {}
    for filename, info in data.items():
        arcade_data[filename] = {
            **info,
            'title': filename.replace('.html', '').title(),
            'description': 'Generated from terminal gallery',
            'coverArt': f'./cover_art/{filename.replace(".html", ".png")}'
        }
    
    with open('arcade_data.json', 'w') as f:
        json.dump(arcade_data, f, indent=2)
```

## 🎯 Customization

### Change Theme Colors:
Edit the CSS variables and Babylon.js colors in the HTML file.

### Add More Cabinets:
Just add more entries to `PROJECTS` or `art_data.json` - the circle automatically adjusts.

### Different Layouts:
- Grid layout: Position cabinets in rows/columns
- Hallway: Linear arcade hall
- Rotating carousel: Current circular design

### Add Sound:
```javascript
const clickSound = new BABYLON.Sound("click", "sounds/click.mp3", scene);
clickSound.play(); // On cabinet selection
```

## 💡 Performance Tips

- Keep cover art under 1MB each
- Use JPEG for photos, PNG for graphics
- Limit to ~20 cabinets for smooth performance
- Consider lazy-loading cover art for large collections

## 🐛 Troubleshooting

**Issue: Cover art not loading**
- Check file paths (case-sensitive!)
- Ensure CORS is enabled if on different domain
- Use browser dev tools to check network tab

**Issue: Slow performance**
- Reduce particle count
- Lower cover art resolution
- Disable auto-rotate on mobile

**Issue: Can't click cabinets**
- Ensure `actionManager` is attached
- Check browser console for errors

## 📱 Mobile Considerations

The gallery is mobile-friendly, but consider:
- Touch controls for rotation (built-in with Babylon.js)
- Larger buttons for touchscreens
- Simplified particle effects on mobile
- Responsive UI scaling

## 🔗 Next Steps

1. Create cover art for your projects
2. Export your Python data to enhanced format
3. Choose a distribution method
4. Share with your artists!

For South of South Records, I'd recommend:
- Host on your main site
- Add to artist onboarding
- Use as portfolio showcase
- Embed in social media posts (screenshots/videos)

Need help with any of these? Let me know!