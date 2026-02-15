/**
 * APPLESAUCE Music System - MINIMAL UI VERSION
 */

class ApplesauceMusic {
    constructor(core, config = {}) {
        this.core = core;
        this.config = {
            volume: config.volume || 0.28,
            autoplay: config.autoplay !== false,
            keyBind: 'm' // Press 'M' to toggle menu
        };
        
        this.audio = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        
        // UI Elements
        this.uiContainer = null;
        this.isMenuOpen = false;
        
        this._setupStyles();
        this._createUI();
        this._setupEventListeners();

        console.log('🎵 Music System with UI initialized. Press "M" for menu.');
    }

    // --- NEW: UI CREATION ---
    _setupStyles() {
        const styleId = 'applesauce-music-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .music-ui-container {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 250px;
                background: rgba(0, 0, 0, 0.85);
                color: #00FF00;
                font-family: 'Courier New', monospace;
                padding: 15px;
                border: 2px solid #00FF00;
                border-radius: 4px;
                z-index: 10000;
                display: none;
                box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
            }
            .music-ui-header {
                font-weight: bold;
                border-bottom: 1px solid #00FF00;
                margin-bottom: 10px;
                padding-bottom: 5px;
                display: flex;
                justify-content: space-between;
            }
            .track-list { list-style: none; padding: 0; margin: 0; }
            .track-item {
                padding: 5px;
                cursor: pointer;
                font-size: 0.85em;
                opacity: 0.7;
            }
            .track-item:hover { background: rgba(0, 255, 0, 0.1); opacity: 1; }
            .track-item.active {
                opacity: 1;
                font-weight: bold;
                background: rgba(0, 255, 0, 0.2);
            }
            .music-toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                font-family: sans-serif;
                pointer-events: none;
                transition: opacity 0.5s;
                opacity: 0;
                z-index: 10001;
            }
        `;
        document.head.appendChild(style);
    }

    _createUI() {
        // Create Menu
        this.uiContainer = document.createElement('div');
        this.uiContainer.className = 'music-ui-container';
        document.body.appendChild(this.uiContainer);

        // Create Toast Notification
        this.toast = document.createElement('div');
        this.toast.className = 'music-toast';
        document.body.appendChild(this.toast);
    }

    _setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === this.config.keyBind) {
                this.toggleMenu();
            }
        });
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.uiContainer.style.display = this.isMenuOpen ? 'block' : 'none';
        if (this.isMenuOpen) this.renderPlaylist();
    }

    showToast(message) {
        this.toast.innerText = message;
        this.toast.style.opacity = '1';
        setTimeout(() => { this.toast.style.opacity = '0'; }, 3000);
    }

    renderPlaylist() {
        const currentTrack = this.playlist[this.currentIndex];
        this.uiContainer.innerHTML = `
            <div class="music-ui-header">
                <span>TRACKLISTING</span>
                <span style="font-size: 0.7em; cursor: pointer;" onclick="window.musicToggle()">[X]</span>
            </div>
            <ul class="track-list">
                ${this.playlist.map((track, i) => `
                    <li class="track-item ${i === this.currentIndex ? 'active' : ''}" 
                        onclick="window.musicPlayTrack(${i})">
                        ${i + 1}. ${track.title} <br/>
                        <small style="color: #aaa;">${track.artist}</small>
                    </li>
                `).join('')}
            </ul>
        `;
        
        // Expose functions globally for the simple HTML onclicks
        window.musicPlayTrack = (index) => this.play(index);
        window.musicToggle = () => this.toggleMenu();
    }

    // --- MODIFIED EXISTING METHODS ---

    loadPlaylist(context, tracks) {
        this.playlist = tracks;
        this.currentIndex = 0;
        console.log(`🎵 Loaded ${tracks.length} tracks`);
        if (this.isMenuOpen) this.renderPlaylist();
    }

    switchContext(context) {
        if (!this.playlist || this.playlist.length === 0) return;
        this.play(0);
    }

    play(index) {
        if (!this.playlist || this.playlist.length === 0) return;
        
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
        
        this.currentIndex = index !== undefined ? index : this.currentIndex;
        const track = this.playlist[this.currentIndex];
        
        this.audio = new Audio(track.file);
        this.audio.volume = this.config.volume;
        this.audio.addEventListener('ended', () => this.playNext());
        this.audio.addEventListener('error', () => this.playNext());
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.showToast(`Now Playing: ${track.title}`);
            if (this.isMenuOpen) this.renderPlaylist();
        }).catch(err => console.error('Playback failed:', err));
    }

    playNext() {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.play(this.currentIndex);
    }

    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
            this.isPlaying = false;
        }
    }

    clear() {
        this.stop();
        this.playlist = [];
        this.uiContainer.innerHTML = '';
    }
}

export { ApplesauceMusic };