// ============================================
// PAUSE MENU WITH HELMET SELECTOR
// ============================================
// Add this to your level HTML file

// HTML for pause menu (add to your level's HTML body)
const pauseMenuHTML = `
<style>
    #pauseMenu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        display: none;
        z-index: 1000;
        justify-content: center;
        align-items: center;
    }

    #pauseMenu.active {
        display: flex;
    }

    .pause-container {
        background: rgba(20, 20, 20, 0.9);
        border: 3px solid #87CEEB;
        padding: 40px;
        max-width: 900px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 0 50px rgba(135, 206, 235, 0.5);
    }

    .pause-title {
        font-size: 3em;
        color: #87CEEB;
        text-align: center;
        margin-bottom: 30px;
        text-shadow: 0 0 20px #87CEEB;
        font-family: 'Courier New', monospace;
    }

    .pause-section {
        margin-bottom: 30px;
        border: 2px solid #1a4d6d;
        padding: 20px;
        background: rgba(0, 0, 0, 0.3);
    }

    .pause-section-title {
        font-size: 1.8em;
        color: #FFD700;
        margin-bottom: 15px;
        border-bottom: 2px solid #FFD700;
        padding-bottom: 10px;
        font-family: 'Courier New', monospace;
    }

    .helmet-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 20px;
    }

    .helmet-card {
        background: rgba(0, 0, 0, 0.6);
        border: 2px solid #87CEEB;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        font-family: 'Courier New', monospace;
    }

    .helmet-card:hover {
        background: rgba(135, 206, 235, 0.2);
        border-color: #FFD700;
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(135, 206, 235, 0.5);
    }

    .helmet-card.active {
        background: rgba(255, 215, 0, 0.3);
        border-color: #FFD700;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
    }

    .helmet-card.empty {
        border-color: #444;
        color: #666;
        cursor: default;
    }

    .helmet-card.empty:hover {
        background: rgba(0, 0, 0, 0.6);
        transform: none;
        box-shadow: none;
    }

    .helmet-name {
        font-size: 1.2em;
        color: #87CEEB;
        margin-bottom: 8px;
        font-weight: bold;
    }

    .helmet-slot-label {
        font-size: 0.9em;
        color: #999;
    }

    .helmet-elements {
        font-size: 0.8em;
        color: #FFD700;
        margin-top: 8px;
    }

    .pause-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-top: 30px;
    }

    .pause-btn {
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid #87CEEB;
        color: #87CEEB;
        padding: 15px;
        font-size: 1.3em;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Courier New', monospace;
    }

    .pause-btn:hover {
        background: #87CEEB;
        color: #000;
        box-shadow: 0 0 20px #87CEEB;
    }

    .pause-btn.editor {
        border-color: #FFD700;
        color: #FFD700;
    }

    .pause-btn.editor:hover {
        background: #FFD700;
        color: #000;
    }

    .pause-btn.quit {
        border-color: #FF4444;
        color: #FF4444;
    }

    .pause-btn.quit:hover {
        background: #FF4444;
    }

    .current-helmet-display {
        background: rgba(0, 0, 0, 0.5);
        border: 2px solid #FFD700;
        padding: 15px;
        margin-bottom: 20px;
        text-align: center;
    }

    .current-helmet-name {
        font-size: 1.5em;
        color: #FFD700;
        font-family: 'Courier New', monospace;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin-top: 20px;
    }

    .stat-box {
        background: rgba(0, 0, 0, 0.5);
        border: 2px solid #87CEEB;
        padding: 15px;
        text-align: center;
    }

    .stat-label {
        font-size: 0.9em;
        color: #999;
        margin-bottom: 5px;
        font-family: 'Courier New', monospace;
    }

    .stat-value {
        font-size: 1.8em;
        color: #87CEEB;
        font-family: 'Courier New', monospace;
        font-weight: bold;
    }

    .pause-container::-webkit-scrollbar {
        width: 10px;
    }

    .pause-container::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.5);
    }

    .pause-container::-webkit-scrollbar-thumb {
        background: #87CEEB;
        border-radius: 5px;
    }
</style>

<div id="pauseMenu">
    <div class="pause-container">
        <div class="pause-title">PAUSED</div>

        <!-- Current Helmet Display -->
        <div class="current-helmet-display">
            <div style="color: #999; font-size: 0.9em; margin-bottom: 5px;">CURRENT HELMET</div>
            <div class="current-helmet-name" id="currentHelmetName">Default Helmet</div>
        </div>

        <!-- Game Stats -->
        <div class="pause-section">
            <div class="pause-section-title">STATS</div>
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-label">SCORE</div>
                    <div class="stat-value" id="pauseScore">0</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">COMBO</div>
                    <div class="stat-value" id="pauseCombo">x0</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">TIME</div>
                    <div class="stat-value" id="pauseTime">0:00</div>
                </div>
            </div>
        </div>

        <!-- Helmet Selection -->
        <div class="pause-section">
            <div class="pause-section-title">CHANGE HELMET</div>
            <div class="helmet-grid" id="helmetGrid"></div>
        </div>

        <!-- Menu Buttons -->
        <div class="pause-buttons">
            <button class="pause-btn" onclick="pauseMenu.resume()">▶️ RESUME</button>
            <button class="pause-btn" onclick="pauseMenu.restart()">🔄 RESTART</button>
            <button class="pause-btn editor" onclick="pauseMenu.openEditor()">🎨 HELMET EDITOR</button>
            <button class="pause-btn quit" onclick="pauseMenu.quitToMenu()">🚪 QUIT TO MENU</button>
        </div>
    </div>
</div>
`;

// JavaScript for pause menu functionality
class PauseMenu {
    constructor(helmetLoader, gameState) {
        this.helmetLoader = helmetLoader;
        this.gameState = gameState; // Reference to your game state object
        this.isPaused = false;
        this.pauseMenuElement = null;
        
        this.init();
    }

    init() {
        // Inject HTML if not already present
        if (!document.getElementById('pauseMenu')) {
            document.body.insertAdjacentHTML('beforeend', pauseMenuHTML);
        }
        
        this.pauseMenuElement = document.getElementById('pauseMenu');
        
        // Setup keyboard listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toggle();
            }
        });

        // Load helmet grid
        this.loadHelmetGrid();
    }

    toggle() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    pause() {
        this.isPaused = true;
        this.pauseMenuElement.classList.add('active');
        
        // Update stats display
        this.updateStats();
        
        // Update current helmet display
        this.updateCurrentHelmet();
        
        // Reload helmet grid in case new helmets were added
        this.loadHelmetGrid();
        
        // Pause game (implement based on your game logic)
        if (this.gameState && this.gameState.pause) {
            this.gameState.pause();
        }
        
        // Stop animation loop or set paused flag
        if (window.gamePaused !== undefined) {
            window.gamePaused = true;
        }
    }

    resume() {
        this.isPaused = false;
        this.pauseMenuElement.classList.remove('active');
        
        // Resume game
        if (this.gameState && this.gameState.resume) {
            this.gameState.resume();
        }
        
        if (window.gamePaused !== undefined) {
            window.gamePaused = false;
        }
    }

    updateStats() {
        // Update with actual game stats
        // Adjust these based on your game's variables
        const scoreEl = document.getElementById('pauseScore');
        const comboEl = document.getElementById('pauseCombo');
        const timeEl = document.getElementById('pauseTime');

        if (scoreEl && window.score !== undefined) {
            scoreEl.textContent = window.score;
        }
        
        if (comboEl && window.combo !== undefined) {
            comboEl.textContent = 'x' + window.combo;
        }
        
        if (timeEl && window.gameTime !== undefined) {
            const minutes = Math.floor(window.gameTime / 60);
            const seconds = Math.floor(window.gameTime % 60);
            timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateCurrentHelmet() {
        const nameEl = document.getElementById('currentHelmetName');
        if (nameEl && this.helmetLoader && this.helmetLoader.currentHelmetData) {
            nameEl.textContent = this.helmetLoader.currentHelmetData.name;
        }
    }

    loadHelmetGrid() {
        const grid = document.getElementById('helmetGrid');
        if (!grid) return;

        grid.innerHTML = '';

        // Get all available helmets
        const availableHelmets = this.helmetLoader ? this.helmetLoader.getAvailableHelmets() : [];
        const activeSlot = this.helmetLoader ? this.helmetLoader.activeSlot : 1;

        // Create cards for all 9 slots
        for (let i = 1; i <= 9; i++) {
            const helmet = availableHelmets.find(h => h.slot === i);
            const card = document.createElement('div');
            
            if (helmet) {
                card.className = 'helmet-card';
                if (i === activeSlot) {
                    card.className += ' active';
                }
                
                const elements = helmet.data.elements || [];
                const elementsText = elements.length > 0 
                    ? elements.slice(0, 3).join(', ') + (elements.length > 3 ? '...' : '')
                    : 'No elements';

                card.innerHTML = `
                    <div class="helmet-name">${helmet.name}</div>
                    <div class="helmet-slot-label">Slot ${i}</div>
                    <div class="helmet-elements">${elementsText}</div>
                `;
                
                card.onclick = () => this.selectHelmet(i);
            } else {
                card.className = 'helmet-card empty';
                card.innerHTML = `
                    <div class="helmet-name">Empty Slot</div>
                    <div class="helmet-slot-label">Slot ${i}</div>
                    <div class="helmet-elements">Create in editor</div>
                `;
            }
            
            grid.appendChild(card);
        }
    }

    selectHelmet(slotNum) {
        // Check if slot has a helmet
        const saved = localStorage.getItem(`helmet_slot_${slotNum}`);
        if (!saved) {
            alert('No helmet in this slot! Create one in the Helmet Editor.');
            return;
        }

        // Change helmet
        if (this.helmetLoader) {
            this.helmetLoader.changeHelmet(slotNum);
            this.updateCurrentHelmet();
            this.loadHelmetGrid(); // Refresh to show new active helmet
            
            // Show notification
            this.showNotification('Helmet Changed!');
        }
    }

    showNotification(message) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 255, 0, 0.9);
            color: #000;
            padding: 15px 30px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 2000;
            font-family: 'Courier New', monospace;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    restart() {
        if (confirm('Restart level? Your progress will be lost.')) {
            window.location.reload();
        }
    }

    openEditor() {
        if (confirm('Open Helmet Editor? Your level progress will be lost.')) {
            window.location.href = 'helmet_editor.html';
        }
    }

    quitToMenu() {
        if (confirm('Quit to main menu? Your progress will be lost.')) {
            window.location.href = 'applesauce_mainmenu.html';
        }
    }
}

// Initialize pause menu (call this in your level's init function)
// Example: let pauseMenu = new PauseMenu(helmetLoader, gameState);
