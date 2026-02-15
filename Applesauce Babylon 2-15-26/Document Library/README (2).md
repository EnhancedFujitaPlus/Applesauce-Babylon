# 🎮 ARCADE GALLERY - South of South Records

> Transform your Terminal Gallery into an immersive 3D arcade experience

A Babylon.js-powered showcase for your projects, tools, and releases with 3D arcade cabinets, cover art, and neon aesthetics.

## ✨ Features

- **3D Arcade Cabinets** - Each project gets its own glowing cabinet
- **Cover Art Display** - Showcase album covers, screenshots, or custom graphics
- **Interactive Navigation** - Click, keyboard, or auto-rotate through projects
- **Project Details** - Descriptions, tags, categories, and version tracking
- **Retro Aesthetic** - Neon colors, CRT effects, and arcade vibes
- **Mobile Friendly** - Works on phones, tablets, and desktops
- **Easy Distribution** - Single HTML file or full web hosting

## 🚀 Quick Start

### Method 1: Fresh Setup

1. Run the setup script:
   ```bash
   python converter.py setup
   ```

2. Add your HTML projects to `htmls/` folder

3. Add cover art to `cover_art/` folder

4. Open `arcade_gallery.html` in a browser

### Method 2: Convert from Terminal Gallery

If you already have the Python Terminal Gallery:

1. Convert your data:
   ```bash
   python converter.py convert
   ```

2. Add cover art images to `cover_art/`

3. Open `arcade_gallery.html`

## 📁 File Structure

```
your-project/
├── arcade_gallery.html          # Main gallery (Babylon.js)
├── art_data.json               # Your project database
├── arcade_data.json            # Enhanced format (auto-generated)
├── converter.py                # Setup & conversion tool
├── DISTRIBUTION_GUIDE.md       # How to deploy
│
├── htmls/                      # Your HTML projects
│   ├── applesauce_level13.html
│   ├── treaty_terminal.html
│   └── symb_studio.html
│
└── cover_art/                  # Project cover images
    ├── applesauce.png
    ├── treaty.png
    └── symb.png
```

## 🎨 Creating Cover Art

### Quick Options:

1. **Screenshot** your projects
2. **Album covers** for music tools
3. **Logo/branding** graphics
4. **AI-generated** artwork
5. **Text-based** graphics (matches terminal aesthetic)

### Requirements:
- Square images (512x512 or 1024x1024)
- PNG (transparency works great) or JPG
- Keep under 1MB for performance

### Placeholder Generator:
```bash
python converter.py covers
```
This creates colorful placeholder images you can replace later.

## ⚙️ Customization

### Change Colors/Theme

Edit the CSS in `arcade_gallery.html`:

```css
/* Neon colors */
--primary: #ff00ff;    /* Magenta */
--secondary: #0ff;     /* Cyan */
--accent: #ffff00;     /* Yellow */
```

### Modify Cabinet Layout

In `createArcadeCabinets()` function:
- Change `radius` for circle size
- Modify cabinet dimensions
- Adjust lighting colors

### Add More Projects

Just add entries to `art_data.json`:

```json
{
  "your_project.html": {
    "title": "Your Project Name",
    "description": "What makes this project awesome...",
    "category": "Tools",
    "tags": ["javascript", "web"],
    "type": "tool",
    "coverArt": "./cover_art/your_project.png"
  }
}
```

## 🎮 Controls

### Mouse/Touch:
- **Click cabinet** - Select project
- **Drag** - Rotate camera
- **Scroll** - Zoom in/out

### Keyboard:
- **Left/Right Arrows** - Navigate projects
- **Enter/Space** - Launch selected project

### UI Buttons:
- **Previous/Next** - Navigate through cabinets
- **Auto Rotate** - Toggle automatic rotation
- **Reset View** - Return camera to default position

## 🌐 Distribution Options

See [DISTRIBUTION_GUIDE.md](DISTRIBUTION_GUIDE.md) for detailed instructions on:

1. **Web Hosting** - Upload to your server
2. **GitHub Pages** - Free hosting
3. **Netlify Drop** - Drag-and-drop deployment
4. **Local Files** - Offline/USB drive usage

### Quick Deploy to Netlify:

1. Go to https://app.netlify.com/drop
2. Drag your project folder
3. Get instant URL!

## 🔗 Integration

### Embed in Website:
```html
<iframe src="arcade_gallery.html" width="100%" height="800px"></iframe>
```

### Link from Terminal Gallery:
Add this to your Python gallery:
```python
elif cmd_lower == "arcade":
    webbrowser.open("http://localhost:8000/arcade_gallery.html")
```

### Launch from Command Line:
```bash
# Python server
python -m http.server 8000

# Node.js
npx http-server
```

Then visit: `http://localhost:8000/arcade_gallery.html`

## 🎯 Use Cases

### For South of South Records:

1. **Artist Onboarding** - Showcase available tools
2. **Portfolio** - Display completed projects
3. **Release Showcase** - Feature new music/tools
4. **Demo Gallery** - Let artists try tools interactively
5. **Social Media** - Create promotional videos/screenshots

### Benefits for Artists:

- Visual way to discover tools
- Try before downloading
- See what's popular (featured projects)
- Mobile access to your tools
- Professional presentation

## 🛠️ Technical Details

- **Engine**: Babylon.js 6.x
- **Format**: Single HTML file + JSON data
- **Requirements**: Modern browser (Chrome, Firefox, Safari, Edge)
- **Size**: ~50KB HTML + your project files
- **Performance**: Smooth on most devices
- **Dependencies**: None (loads Babylon.js from CDN)

## 📊 Loading Your Own Data

The gallery looks for `arcade_data.json` by default. To load dynamically:

```javascript
// Add this to arcade_gallery.html
async function loadProjects() {
    const response = await fetch('arcade_data.json');
    return await response.json();
}

// Use loaded data
loadProjects().then(data => {
    PROJECTS = Object.entries(data).map(([filename, info]) => ({
        filename,
        ...info
    }));
    scene = createScene();
});
```

## 🐛 Troubleshooting

### Cover art not showing?
- Check file paths (case-sensitive!)
- Ensure files exist in `cover_art/`
- Use browser dev tools (F12) to check network errors

### Projects not launching?
- Verify files exist in `htmls/` folder
- Check file paths in `art_data.json`
- Test files individually first

### Slow performance?
- Reduce cover art file sizes (< 500KB)
- Lower particle count in code
- Disable auto-rotate on mobile

### Can't see 3D scene?
- Check browser console for errors
- Ensure WebGL is supported (most modern browsers)
- Try different browser

## 🔄 Updating from Terminal Gallery

The Arcade Gallery works alongside your Python Terminal Gallery:

1. Keep using Terminal Gallery for management
2. Run converter when you want to update arcade
3. Both use the same `art_data.json` file
4. Artists get both interfaces!

## 🎨 Style Variations

The gallery supports multiple themes. Edit the `THEMES` object:

```javascript
const THEMES = {
    synthwave: {
        primary: '#ff00ff',
        secondary: '#0ff',
        background: '#0a0a1a'
    },
    retro: {
        primary: '#00ff00',
        secondary: '#ffff00',
        background: '#000000'
    },
    minimal: {
        primary: '#ffffff',
        secondary: '#cccccc',
        background: '#222222'
    }
};
```

## 📝 Version History

- **v1.0** - Initial arcade gallery
  - 3D cabinet displays
  - Cover art integration
  - Interactive navigation
  - Mobile support

## 🤝 Contributing

Ideas for improvements:
- VR/AR support for immersive experience
- Multiplayer browsing (see what others are viewing)
- Music preview integration (Symb player)
- Advanced filtering (by tag, category, date)
- Save favorite projects
- User ratings/reviews

## 📧 Support

For South of South Records projects, this gallery provides:
- Professional showcase platform
- Mobile-friendly interface
- Easy deployment
- Integration with existing tools
- Artist-friendly presentation

## 🎵 Perfect For:

- **Music labels** showcasing artist tools
- **Game developers** displaying portfolio
- **Creative technologists** building tools
- **Interactive portfolios**
- **Product showcases**
- **Educational resources**

---

Built with 💜 for **South of South Records**  
*Fair compensation for artists, accessible tools for creators*

**Next Steps:**
1. Run `python converter.py setup`
2. Add your projects and cover art
3. Open in browser
4. Deploy to the web!

See [DISTRIBUTION_GUIDE.md](DISTRIBUTION_GUIDE.md) for deployment options.