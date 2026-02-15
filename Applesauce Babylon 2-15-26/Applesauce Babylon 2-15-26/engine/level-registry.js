// ============================================
// APPLESAUCE LEVEL REGISTRY
// Supports both .html and .js level formats
// ============================================

const ApplesauceLevelRegistry = {
    // Level data organized by chapter
    levelData: {
        chapter1: [
            {
                id: 1,
                name: "Park",
                difficulty: "Beginner",
                objectives: "3",
                timeLimit: "No Limit",
                status: "✓",
                image: "images/level1_preview.png",
                description: "You got a skatepark with the music venue next door. The promoter plays security, looking for the next best combo package of heart of steel and brain of mush. Repositioning the geography may incidate the stories of your hometown. Proceed with caution. Unregulated skating leads to disorder.",
                type: "html", // ⭐ NEW: Level type
                file: "level_1.html" // ⭐ NEW: Specific file name
            },
            {
                id: 2,
                name: "Rave",
                difficulty: "Beginner",
                objectives: "5",
                timeLimit: "No Limit",
                status: "",
                image: "images/level2_preview.png",
                description: "Shred through floating platforms high above the city. Chain tricks across gaps while managing your momentum. The clouds are beautiful... until you fall.",
                type: "html",
                file: "Level_2.html"
            },
            {
                id: 3,
                name: "The Descent",
                difficulty: "Medium",
                objectives: "4",
                timeLimit: "3:30",
                status: "",
                image: "images/level3_preview.png",
                description: "You fell into their trap! How do you figure you get out? By skating? Wild.",
                type: "html",
                file: "Level_3.html"
            },
            {
                id: 4,
                name: "Parking Lot",
                difficulty: "Easy",
                objectives: "6",
                timeLimit: "4:00",
                status: "",
                image: "images/level4_preview.png",
                description: "They put me in a box? And left me on the side of the road? What is this a movie for kids?",
                type: "html",
                file: "Level_4.html"
            },
            {
                id: 5,
                name: "Amusement",
                difficulty: "Easy",
                objectives: "6",
                timeLimit: "4:00",
                status: "",
                image: "images/level5_preview.png",
                description: "They even got a loaded gun?",
                type: "html",
                file: "Level_5.html"
            },
            {
                id: 6,
                name: "The Level Formerly Known as Island",
                difficulty: "Hard",
                objectives: "5",
                timeLimit: "6:00",
                status: "",
                image: "images/level6_preview.png",
                description: "This island has a cult. How do I get away from these people?",
                type: "html",
                file: "Level_6.html"
            },
            {
                id: 7,
                name: "Aspen",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "🔒",
                image: "images/level7_preview.png",
                description: "how many bodies do you think are still in the rockies?.",
                type: "html",
                file: "Level_7.html"
            },
            {
                id: 8,
                name: "Farms",
                difficulty: "Extreme",
                objectives: "8",
                timeLimit: "4:00",
                status: "🔒",
                image: "images/level8_preview.png",
                description: "We put a piece of wood on 4 bales of hay call it true american.",
                type: "html",
                file: "Level_8.html"
            },
            {
                id: 9,
                name: "Police Station",
                difficulty: "Smooth",
                objectives: "6",
                timeLimit: "4:00",
                status: "",
                image: "images/level14_preview.png",
                description: "Did we go too deep? Does anything matter?",
                type: "html",
                file: "Level_9.html"
            },
            {
                id: 10,
                name: "Forest",
                difficulty: "Mental",
                objectives: "6",
                timeLimit: "5:30",
                status: "🔒",
                image: "images/level10_preview.png",
                description: "Don't do anything stupid.",
                type: "html",
                file: "Level_10.html"
            },
            {
                id: 11,
                name: "Stadium",
                difficulty: "Mental",
                objectives: "6",
                timeLimit: "4:00",
                status: "",
                image: "images/level11_preview.png",
                description: "theres not even a joke in this text, CTE cover-up in America is brutal. Both the NFL and Military are sponsored to target kids in school.",
                type: "html",
                file: "Level_11.html"
            },
            {
                id: 12,
                name: "Corporate",
                difficulty: "Mental",
                objectives: "9",
                timeLimit: "7:00",
                status: "🔒",
                image: "images/level12_preview.png",
                description: "Theres gotta be somewhere around here.",
                type: "html",
                file: "Level_12.html"
            },
            {
                id: 13,
                name: "Distribution Center",
                difficulty: "Hard",
                objectives: "6",
                timeLimit: "4:00",
                status: "",
                image: "images/level13_preview.png",
                description: "Time to check those containers myself.",
                type: "html",
                file: "Level_13.html"
            },
            {
                id: 14,
                name: "Library",
                difficulty: "Mental",
                objectives: "5",
                timeLimit: "No more time",
                status: "🔒",
                image: "images/level9_preview.png",
                description: "The worst they can say is your story isn't good enough, right?",
                type: "html",
                file: "levels/Level_14.html"
            }
        ],
        
        chapter2: [
            {
                id: 15,
                name: "Home",
                difficulty: "Hard",
                objectives: "5",
                timeLimit: "6:00",
                status: "",
                image: "images/level1_preview.png",
                description: "Tuesdays Gone?",
                type: "html",
                file: "levels/level_15.html"
            },
            {
                id: 16,
                name: "TERRAIN SHOWCASE",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level2_preview.png",
                description: "I don't think we're in the summer anymore, Ferb?.",
                type: "js",
                file: "levels/level_16.js"
            },
            {
                id: 17,
                name: "THE PASS",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level3_preview.png",
                description: "I saw this in a dream last night. I died and then woke up so im gonna go and shred it again, Fate be damned I'll get over this dam?.",
                type: "html",
                file: "levels/level_17_preview.html"
            },
            {
                id: 18,
                name: "Check it Chicken",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level3_preview.png",
                description: "I saw this in a dream last night. I died and then woke up so im gonna go and shred it again, Fate be damned I'll get over this dam?.",
                type: "js",
                file: "levels/level_17.js"
            },
            {
                id: 19,
                name: "Home but Sherbange",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level3_preview.png",
                description: "I saw this in a dream last night. I died and then woke up so im gonna go and shred it again, Fate be damned I'll get over this dam?.",
                type: "js",
                file: "levels/level_19.js"
            },
            {
                id: 20,
                name: "St Clairs Defeat",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level3_preview.png",
                description: "Well where the heck does the ground if it doesn't go up there ?.",
                type: "js",
                file: "levels/level_36.js"
            },
            {
                id: 21,
                name: "Bloody Winter",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level21_preview.png",
                description: "I told you last time you shouldn't have gone there last time before last time nightmare nightmare.",
                type: "html",
                file: "levels/level_21.html"
            },
            // Add more Chapter 2 levels here
        ],
        
        chapter3: [
            {
                id: 21,
                name: "Blood in the Snow",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level21_preview.png",
                description: "I saw this in a dream last night. I died and then woke up so im gonna go and shred it again, Fate be damned I'll get over this dam?.",
                type: "html",
                file: "levels/level_21.html"
            },
            {
                id: 22,
                name: "Maybe",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level3_preview.png",
                description: "I saw this in a dream last night. I died and then woke up so im gonna go and shred it again, Fate be damned I'll get over this dam?.",
                type: "js",
                file: "levels/level_22.js"
            },
            {
                id: 23,
                name: "Home but Sherbange",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level3_preview.png",
                description: "I saw this in a dream last night. I died and then woke up so im gonna go and shred it again, Fate be damned I'll get over this dam?.",
                type: "js",
                file: "levels/level_23.js"
            },
            {
                id: 24,
                name: "Home of the Helmet Factory",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level3_preview.png",
                description: "They tore down the helmet factory? How is it still here then? My map says current but my mind says Kāntihara.",
                type: "js",
                file: "levels/level_24.js"
            },
            {
                id: 25,
                name: "A Fact or Real",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level3_preview.png",
                description: "I saw this in a dream last night. I died and then woke up so im gonna go and shred it again, Fate be damned I'll get over this dam?.",
                type: "js",
                file: "level_25_FactOrReal.js"
            },
        ],
        chapter4: [
            {
                id: 31,
                name: "Home but Sherbange",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level3_preview.png",
                description: "I saw this in a dream last night. I died and then woke up so im gonna go and shred it again, Fate be damned I'll get over this dam?.",
                type: "js",
                file: "levels/level_31.js"
            },
        ],
        chapter5: [
            {
                id: 41,
                name: "How Telling",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level3_preview.png",
                description: "I saw this in a dream last night. I died and then woke up so im gonna go and shred it again, Fate be damned I'll get over this dam?.",
                type: "html",
                file: "levels/level_41.html"
            },
        ],
        chapter6: [
            {
                id: 51,
                name: "Home but Sherbange",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level3_preview.png",
                description: "I saw this in a dream last night. I died and then woke up so im gonna go and shred it again, Fate be damned I'll get over this dam?.",
                type: "html",
                file: "levels/level_51.html"
            },
        ],
        chapter7: [
            {
                id: 61,
                name: "Test your Strength",
                difficulty: "Hard",
                objectives: "7",
                timeLimit: "5:00",
                status: "",
                image: "images/level3_preview.png",
                description: "A Damn? What about giving me money.",
                type: "js",
                file: "levels/level_61.js"
            },
        ],
        chapter8: [],
        chapter9: [],
        chapter10: []
    },
    
    // ===================================
    // LAUNCH LEVEL (SMART ROUTING)
    // ===================================
    launchLevel: function(level) {
        if (!level) {
            console.error('❌ No level provided to launch');
            return;
        }
        
        if (level.status === '🔒') {
            alert(`LEVEL LOCKED\n\nComplete previous missions to unlock "${level.name}"`);
            return;
        }
        
        console.log(`🚀 Launching Level ${level.id}: ${level.name}`);
        console.log(`   Type: ${level.type}`);
        console.log(`   File: ${level.file}`);
        
        // Route based on level type
        if (level.type === 'html') {
            // Direct load HTML file
            window.location.href = level.file;
        } else if (level.type === 'js') {
            // Use universal loader (game.html)
            const levelId = level.id;
            const levelName = encodeURIComponent(level.name);
            window.location.href = `game.html?id=${levelId}&name=${levelName}`;
        } else {
            console.error('❌ Unknown level type:', level.type);
            alert('ERROR: Unknown level type!');
        }
    },
    
    // ===================================
    // GET LEVEL BY ID
    // ===================================
    getLevelById: function(id) {
        for (let chapter in this.levelData) {
            const level = this.levelData[chapter].find(l => l.id == id);
            if (level) return level;
        }
        return null;
    },
    
    // ===================================
    // GET CHAPTER LEVELS
    // ===================================
    getChapterLevels: function(chapterNum) {
        const chapterKey = `chapter${chapterNum}`;
        return this.levelData[chapterKey] || [];
    },
    
    // ===================================
    // ADD LEVEL (FOR EXPANSION)
    // ===================================
    addLevel: function(chapterNum, levelConfig) {
        const chapterKey = `chapter${chapterNum}`;
        if (!this.levelData[chapterKey]) {
            this.levelData[chapterKey] = [];
        }
        this.levelData[chapterKey].push(levelConfig);
        console.log(`✅ Added level ${levelConfig.id} to ${chapterKey}`);
    },
    
    // ===================================
    // UPDATE LEVEL STATUS
    // ===================================
    updateLevelStatus: function(id, status) {
        const level = this.getLevelById(id);
        if (level) {
            level.status = status;
            console.log(`✅ Updated Level ${id} status to ${status}`);
        }
    },
    
    // ===================================
    // GET ALL LEVELS
    // ===================================
    getAllLevels: function() {
        let allLevels = [];
        for (let chapter in this.levelData) {
            allLevels = allLevels.concat(this.levelData[chapter]);
        }
        return allLevels;
    },
    
    // ===================================
    // SEARCH LEVELS
    // ===================================
    searchLevels: function(query) {
        const allLevels = this.getAllLevels();
        return allLevels.filter(level => 
            level.name.toLowerCase().includes(query.toLowerCase()) ||
            level.description.toLowerCase().includes(query.toLowerCase())
        );
    }
};

// Make it globally accessible
window.ApplesauceLevelRegistry = ApplesauceLevelRegistry;

console.log('✅ APPLESAUCE Level Registry Loaded');
console.log(`📊 Total Levels: ${ApplesauceLevelRegistry.getAllLevels().length}`);
