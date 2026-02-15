#!/bin/bash
# setup-applesauce-modular.sh
# Quick setup script for APPLESAUCE Modular Edition

echo "🛹 APPLESAUCE Modular Setup"
echo "================================"
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p applesauce-modular
cd applesauce-modular

mkdir -p levels
mkdir -p modules
mkdir -p sounds
mkdir -p thumbnails

echo "✅ Directories created"
echo ""

# Create a simple README
cat > README.md << 'EOF'
# APPLESAUCE Modular Edition

## Quick Start

### 1. Setup
Place your files in this structure:
```
applesauce-modular/
├── applesauce-main-menu-modular.html (main file)
├── applesauce-core-r182.js
├── levels/
│   ├── level-01-config.js
│   ├── level-16-config-enhanced.js
│   └── ...
├── modules/
│   └── (optional modules)
└── sounds/
    └── (audio files)
```

### 2. Run a Local Server

**Option A: Python (easiest)**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option B: Node.js**
```bash
npx http-server -p 8000
```

**Option C: PHP**
```bash
php -S localhost:8000
```

**Option D: VS Code**
Install "Live Server" extension and click "Go Live"

### 3. Open in Browser
Navigate to: `http://localhost:8000/applesauce-main-menu-modular.html`

### 4. Play!
Select a level from the menu and start skating! 🛹

## Adding New Levels

1. Create `levels/level-XX-config.js`
2. Add entry to `LEVEL_REGISTRY` in main menu
3. Refresh and play!

## Troubleshooting

### CORS Errors
- Make sure you're using a local server (not file://)
- Check browser console for specific errors

### Level Won't Load
- Verify config file path in LEVEL_REGISTRY
- Check console for loading errors
- Ensure config variable name matches

### Three.js Not Found
- Check internet connection (using CDN)
- Or download three.min.js locally

## Features

✅ No CORS issues
✅ Three.js r182 features
✅ Dynamic level loading
✅ Modular architecture
✅ Easy to add levels
✅ Volcano weather system
✅ Enhanced physics

Enjoy! 🎮
EOF

echo "✅ README created"
echo ""

# Create a simple level template
cat > levels/level-template.js << 'EOF'
// Level Template
// Copy this file and modify for your level

const LevelXXConfig = {
    meta: {
        name: "LEVEL NAME",
        number: XX,
        theme: "theme-name",
        description: "Level description",
        difficulty: "MEDIUM"
    },
    
    scene: {
        background: 0x87CEEB,  // Sky blue
        fog: {
            color: 0x87CEEB,
            near: 100,
            far: 400
        }
    },
    
    playerStart: {
        x: 0,
        z: 10
    },
    
    terrain: {
        size: 500,
        hill: true
    },
    
    obstacles: {
        rails: {
            count: 5,
            positions: [
                // { x: 30, z: 50, length: 25, rotation: 0 }
            ]
        },
        ramps: {
            count: 3,
            positions: [
                // { x: 20, z: 70, width: 15, height: 8 }
            ]
        }
    },
    
    objectives: {
        survive: { 
            duration: 300,
            description: "Survive 5 minutes"
        },
        score: { 
            target: 25000,
            description: "Reach 25,000 points"
        }
    },
    
    scoring: {
        baseMultiplier: 1.0
    }
};

// Don't forget to export!
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LevelXXConfig;
}
EOF

echo "✅ Level template created in levels/"
echo ""

# Create example server launch files
cat > start-python.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Python server on port 8000..."
python3 -m http.server 8000
EOF

cat > start-python.bat << 'EOF'
@echo off
echo Starting Python server on port 8000...
python -m http.server 8000
pause
EOF

cat > start-node.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Node.js server on port 8000..."
npx http-server -p 8000
EOF

cat > start-node.bat << 'EOF'
@echo off
echo Starting Node.js server on port 8000...
npx http-server -p 8000
pause
EOF

chmod +x start-python.sh
chmod +x start-node.sh

echo "✅ Server launch scripts created"
echo ""

echo "================================"
echo "✨ Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Copy your HTML, JS files into this directory"
echo "2. Run a local server:"
echo "   - Linux/Mac: ./start-python.sh or ./start-node.sh"
echo "   - Windows: start-python.bat or start-node.bat"
echo "3. Open http://localhost:8000/applesauce-main-menu-modular.html"
echo ""
echo "📚 See MODULAR-ARCHITECTURE-GUIDE.md for full documentation"
echo "================================"
EOF
