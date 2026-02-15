/**
 * APPLESAUCE Pause Module
 * Pause menu with stats, helmet selection, and navigation
 */

export class ApplesaucePause {
    constructor(core) {
        this.core = core;
        this.isPaused = false;
        this.pauseMenuElement = null;
        
        // Auto-initialize
        this.init();
        
        console.log('⏸️ Pause module loaded');
    }
    
    /**
     * Initialize pause menu
     */
    init() {
        // Create pause menu HTML if not exists
        if (!document.getElementById('pauseMenu')) {
            this.injectHTML();
        }
        
        this.pauseMenuElement = document.getElementById('pauseMenu');
        
        // Setup keyboard listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toggle();
            }
        });

        // Expose methods globally for button onclick
        window.pauseMenu = {
            resume: () => this.resume(),
            restart: () => this.restart(),
            openEditor: () => this.openEditor(),
            quitToMenu: () => this.quitToMenu(),
            selectHelmet: (slot) => this.selectHelmet(slot)
        };
        
        console.log('⏸️ Pause menu initialized (Press ESC)');
    }
    
    /**
     * Update (called every frame)
     */
    update(core) {
        // Update stats if paused
        if (this.isPaused) {
            this.updateStats();
        }
    }
    
    /**
     * Toggle pause state
     */
    toggle() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    /**
     * Pause the game
     */
    pause() {
        this.isPaused = true;
        this.core.state.paused = true;
        
        if (this.pauseMenuElement) {
            this.pauseMenuElement.classList.add('active');
        }
        
        // Update displays
        this.updateStats();
        this.updateCurrentHelmet();
        this.loadHelmetGrid();
        
        console.log('⏸️ Game paused');
    }

    /**
     * Resume the game
     */
    resume() {
        this.isPaused = false;
        this.core.state.paused = false;
        
        if (this.pauseMenuElement) {
            this.pauseMenuElement.classList.remove('active');
        }
        
        console.log('▶️ Game resumed');
    }

    /**
     * Update stats display
     */
    updateStats() {
        const scoreEl = document.getElementById('pauseScore');
        const comboEl = document.getElementById('pauseCombo');
        const timeEl = document.getElementById('pauseTime');

        if (scoreEl && this.core.state.score !== undefined) {
            scoreEl.textContent = Math.floor(this.core.state.score);
        }
        
        if (comboEl && this.core.state.combo !== undefined) {
            comboEl.textContent = 'x' + this.core.state.combo;
        }
        
        if (timeEl) {
            const frames = this.core.state.frameCount || 0;
            const seconds = Math.floor(frames / 60);
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timeEl.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Update current helmet display
     */
    updateCurrentHelmet() {
        const nameEl = document.getElementById('currentHelmetName');
        if (nameEl) {
            // Check if gear module has helmet info
            if (this.core.modules.gear && this.core.modules.gear.currentHelmet) {
                nameEl.textContent = this.core.modules.gear.currentHelmet.name || 'Default Helmet';
            } else {
                nameEl.textContent = 'Default Helmet';
            }
        }
    }

    /**
     * Load helmet grid from saved helmets
     */
    loadHelmetGrid() {
        const grid = document.getElementById('helmetGrid');
        if (!grid) return;

        grid.innerHTML = '';

        // Get active slot from gear module
        const activeSlot = this.core.modules.gear?.activeSlot || 1;

        // Create cards for all 9 slots
        for (let i = 1; i <= 9; i++) {
            const saved = localStorage.getItem(`helmet_slot_${i}`);
            const card = document.createElement('div');
            
            if (saved) {
                const helmet = JSON.parse(saved);
                card.className = 'helmet-card';
                if (i === activeSlot) {
                    card.className += ' active';
                }
                
                const elements = helmet.elements || [];
                const elementsText = elements.length > 0 
                    ? elements.slice(0, 3).join(', ') + (elements.length > 3 ? '...' : '')
                    : 'No elements';

                card.innerHTML = `
                    <div class="helmet-name">${helmet.name || 'Helmet ' + i}</div>
                    <div class="helmet-slot-label">Slot ${i}</div>
                    <div class="helmet-elements">${elementsText}</div>
                `;
                
                card.onclick = () => window.pauseMenu.selectHelmet(i);
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

    /**
     * Select a helmet from a slot
     */
    selectHelmet(slotNum) {
        const saved = localStorage.getItem(`helmet_slot_${slotNum}`);
        if (!saved) {
            alert('No helmet in this slot! Create one in the Helmet Editor.');
            return;
        }

        // Change helmet via gear module
        if (this.core.modules.gear && this.core.modules.gear.changeHelmet) {
            this.core.modules.gear.changeHelmet(slotNum);
            this.updateCurrentHelmet();
            this.loadHelmetGrid();
            
            this.showNotification('Helmet Changed!');
            console.log(`⚔️ Changed to helmet slot ${slotNum}`);
        }
    }

    /**
     * Show temporary notification
     */
    showNotification(message) {
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

    /**
     * Restart current level
     */
    restart() {
        if (confirm('Restart level? Your progress will be lost.')) {
            window.location.reload();
        }
    }

    /**
     * Open helmet editor
     */
    openEditor() {
        if (confirm('Open Helmet Editor? Your level progress will be lost.')) {
            window.location.href = 'helmet_editor.html';
        }
    }

    /**
     * Quit to main menu
     */
    quitToMenu() {
        if (confirm('Quit to main menu? Your progress will be lost.')) {
            window.location.href = 'applesauce_mainmenu.html';
        }
    }
    
    /**
     * Clear pause state
     */
    clear() {
        this.resume();
        console.log('⏸️ Pause cleared');
    }
    
    /**
     * Inject pause menu HTML into page
     */
    injectHTML() {
        const html = `
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
        document.body.insertAdjacentHTML('beforeend', html);
    }
}
