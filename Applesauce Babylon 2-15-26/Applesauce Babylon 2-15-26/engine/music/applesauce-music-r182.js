/**
 * APPLESAUCE Music System v1.0
 * Modular music player with playlist management and in-game radio controls
 */

class ApplesauceMusic {
    constructor(core, config = {}) {
        this.core = core;
        this.config = {
            volume: config.volume || 0.7,
            fadeTime: config.fadeTime || 1000, // milliseconds
            autoplay: config.autoplay !== false,
            showNowPlaying: config.showNowPlaying !== false,
            enableRadioMenu: config.enableRadioMenu !== false,
            ...config
        };
        
        // Audio context (Web Audio API for better control)
        this.audioContext = null;
        this.gainNode = null;
        
        // Current playback state
        this.currentTrack = null;
        this.currentAudio = null;
        this.currentSource = null;
        this.isPlaying = false;
        this.isFading = false;
        
        // Playlists
        this.playlists = {
            menu: [],
            level: [],
            boss: []
        };
        this.currentPlaylist = null;
        this.currentContext = null; // 'menu', 'level', or 'boss'
        this.currentTrackIndex = 0;
        
        // Track preferences (disabled tracks)
        this.disabledTracks = this.loadDisabledTracks();
        
        // UI elements
        this.nowPlayingWidget = null;
        this.radioMenu = null;
        this.radioMenuOpen = false;
        
        // Initialize
        this.init();
        
        console.log('🎵 APPLESAUCE Music System initialized');
    }
    
    // ===================================
    // INITIALIZATION
    // ===================================
    init() {
        // Initialize Web Audio API (must be triggered by user interaction)
        this.setupAudioContext();
        
        // Create UI elements
        if (this.config.showNowPlaying) {
            this.createNowPlayingWidget();
        }
        
        if (this.config.enableRadioMenu) {
            this.createRadioMenu();
            this.setupRadioControls();
        }
    }
    
    setupAudioContext() {
        // Web Audio API for better volume control and crossfading
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.config.volume;
        } catch (e) {
            console.warn('Web Audio API not supported, falling back to HTML5 audio');
        }
    }
    
    // ===================================
    // PLAYLIST MANAGEMENT
    // ===================================
    
    /**
     * Load a playlist configuration
     * @param {string} context - 'menu', 'level', or 'boss'
     * @param {Array} tracks - Array of track objects {title, artist, file, enabled}
     */
    loadPlaylist(context, tracks) {
        this.playlists[context] = tracks.map(track => ({
            title: track.title || 'Unknown Track',
            artist: track.artist || 'Unknown Artist',
            file: track.file,
            enabled: track.enabled !== false,
            id: `${context}_${track.file}` // Unique ID for preferences
        }));
        
        console.log(`🎵 Loaded ${tracks.length} tracks for ${context} playlist`);
        
        // Apply user preferences (disabled tracks)
        this.applyDisabledTracks();
    }
    
    /**
     * Switch to a different playlist context
     * @param {string} context - 'menu', 'level', or 'boss'
     */
    switchContext(context) {
        if (!this.playlists[context] || this.playlists[context].length === 0) {
            console.warn(`No playlist loaded for context: ${context}`);
            return;
        }
        
        const wasPlaying = this.isPlaying;
        
        // Fade out current track
        if (this.currentAudio) {
            this.fadeOut(() => {
                this.currentContext = context;
                this.currentPlaylist = this.playlists[context];
                this.currentTrackIndex = 0;
                
                if (wasPlaying && this.config.autoplay) {
                    this.playNext();
                }
            });
        } else {
            this.currentContext = context;
            this.currentPlaylist = this.playlists[context];
            this.currentTrackIndex = 0;
            
            if (this.config.autoplay) {
                this.playNext();
            }
        }
    }
    
    // ===================================
    // PLAYBACK CONTROL
    // ===================================
    
    play(trackIndex = null) {
        if (!this.currentPlaylist || this.currentPlaylist.length === 0) {
            console.warn('No playlist loaded');
            return;
        }
        
        if (trackIndex !== null) {
            this.currentTrackIndex = trackIndex;
        }
        
        // Get next enabled track
        const track = this.getNextEnabledTrack();
        if (!track) {
            console.log('No enabled tracks to play');
            return;
        }
        
        this.currentTrack = track;
        this.loadAndPlayTrack(track);
    }
    
    playNext() {
        this.currentTrackIndex++;
        if (this.currentTrackIndex >= this.currentPlaylist.length) {
            this.currentTrackIndex = 0; // Loop playlist
        }
        this.play();
    }
    
    pause() {
        if (this.currentAudio) {
            this.fadeOut(() => {
                if (this.currentAudio) {
                    this.currentAudio.pause();
                }
                this.isPlaying = false;
            });
        }
    }
    
    resume() {
        if (this.currentAudio && !this.isPlaying) {
            this.currentAudio.play();
            this.fadeIn();
            this.isPlaying = true;
        } else if (!this.currentAudio) {
            this.play();
        }
    }
    
    stop() {
        this.fadeOut(() => {
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
                this.currentAudio = null;
            }
            this.currentTrack = null;
            this.isPlaying = false;
        });
    }
    
    setVolume(volume) {
        this.config.volume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.value = this.config.volume;
        } else if (this.currentAudio) {
            this.currentAudio.volume = this.config.volume;
        }
    }
    
    // ===================================
    // INTERNAL PLAYBACK
    // ===================================
    
    loadAndPlayTrack(track) {
        // Clean up previous audio
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        // Create new audio element
        this.currentAudio = new Audio(track.file);
        this.currentAudio.preload = 'auto';
        
        // Connect to Web Audio API if available
        if (this.audioContext && this.gainNode) {
            // Resume audio context (required for autoplay policies)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Create media source
            if (!this.currentSource || this.currentSource.mediaElement !== this.currentAudio) {
                this.currentSource = this.audioContext.createMediaElementSource(this.currentAudio);
                this.currentSource.connect(this.gainNode);
            }
        } else {
            // Fallback to HTML5 audio
            this.currentAudio.volume = this.config.volume;
        }
        
        // Set up event listeners
        this.currentAudio.addEventListener('ended', () => this.onTrackEnded());
        this.currentAudio.addEventListener('error', (e) => this.onTrackError(e));
        
        // Play with fade in
        this.currentAudio.play()
            .then(() => {
                this.isPlaying = true;
                this.fadeIn();
                this.updateNowPlayingWidget();
                console.log(`🎵 Now playing: ${track.title} - ${track.artist}`);
            })
            .catch(err => {
                console.error('Playback error:', err);
                // Try next track
                this.playNext();
            });
    }
    
    getNextEnabledTrack() {
        if (!this.currentPlaylist || this.currentPlaylist.length === 0) {
            return null;
        }
        
        const startIndex = this.currentTrackIndex;
        let attempts = 0;
        
        while (attempts < this.currentPlaylist.length) {
            const track = this.currentPlaylist[this.currentTrackIndex];
            
            if (track.enabled && !this.isTrackDisabled(track.id)) {
                return track;
            }
            
            // Move to next track
            this.currentTrackIndex++;
            if (this.currentTrackIndex >= this.currentPlaylist.length) {
                this.currentTrackIndex = 0;
            }
            
            attempts++;
        }
        
        console.warn('No enabled tracks found in playlist');
        return null;
    }
    
    onTrackEnded() {
        console.log('🎵 Track ended, playing next...');
        this.playNext();
    }
    
    onTrackError(e) {
        console.error('Track playback error:', e);
        this.playNext();
    }
    
    // ===================================
    // FADE EFFECTS
    // ===================================
    
    fadeIn() {
        if (!this.gainNode || this.isFading) return;
        
        this.isFading = true;
        const fadeTime = this.config.fadeTime / 1000; // Convert to seconds
        
        this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(
            this.config.volume,
            this.audioContext.currentTime + fadeTime
        );
        
        setTimeout(() => {
            this.isFading = false;
        }, this.config.fadeTime);
    }
    
    fadeOut(callback) {
        if (!this.gainNode || !this.currentAudio) {
            if (callback) callback();
            return;
        }
        
        this.isFading = true;
        const fadeTime = this.config.fadeTime / 1000;
        
        this.gainNode.gain.setValueAtTime(
            this.gainNode.gain.value,
            this.audioContext.currentTime
        );
        this.gainNode.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + fadeTime
        );
        
        setTimeout(() => {
            this.isFading = false;
            if (callback) callback();
        }, this.config.fadeTime);
    }
    
    // ===================================
    // USER PREFERENCES
    // ===================================
    
    toggleTrack(trackId) {
        if (this.disabledTracks.has(trackId)) {
            this.disabledTracks.delete(trackId);
        } else {
            this.disabledTracks.add(trackId);
            
            // If currently playing track was disabled, skip it
            if (this.currentTrack && this.currentTrack.id === trackId) {
                this.playNext();
            }
        }
        
        this.saveDisabledTracks();
        this.updateRadioMenu();
    }
    
    isTrackDisabled(trackId) {
        return this.disabledTracks.has(trackId);
    }
    
    loadDisabledTracks() {
        try {
            const saved = localStorage.getItem('applesauce_disabled_tracks');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch (e) {
            console.warn('Failed to load disabled tracks:', e);
            return new Set();
        }
    }
    
    saveDisabledTracks() {
        try {
            localStorage.setItem(
                'applesauce_disabled_tracks',
                JSON.stringify([...this.disabledTracks])
            );
        } catch (e) {
            console.warn('Failed to save disabled tracks:', e);
        }
    }
    
    applyDisabledTracks() {
        // Mark tracks as enabled/disabled based on user preferences
        Object.values(this.playlists).forEach(playlist => {
            playlist.forEach(track => {
                track.enabled = !this.isTrackDisabled(track.id);
            });
        });
    }
    
    // ===================================
    // UI - NOW PLAYING WIDGET
    // ===================================
    
    createNowPlayingWidget() {
        this.nowPlayingWidget = document.createElement('div');
        this.nowPlayingWidget.id = 'now-playing-widget';
        this.nowPlayingWidget.innerHTML = `
            <div class="np-icon">🎵</div>
            <div class="np-info">
                <div class="np-title">No track playing</div>
                <div class="np-artist"></div>
            </div>
        `;
        
        // Styling
        const style = document.createElement('style');
        style.textContent = `
            #now-playing-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.85);
                border: 2px solid #00FFFF;
                border-radius: 8px;
                padding: 12px 16px;
                font-family: 'Courier New', monospace;
                color: #00FFFF;
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 250px;
                max-width: 350px;
                pointer-events: none;
                z-index: 1000;
                opacity: 0.9;
                transition: opacity 0.3s;
            }
            
            #now-playing-widget:hover {
                opacity: 1;
            }
            
            .np-icon {
                font-size: 24px;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .np-info {
                flex: 1;
                overflow: hidden;
            }
            
            .np-title {
                font-weight: bold;
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .np-artist {
                font-size: 12px;
                color: #00AAAA;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.nowPlayingWidget);
    }
    
    updateNowPlayingWidget() {
        if (!this.nowPlayingWidget || !this.currentTrack) return;
        
        const titleEl = this.nowPlayingWidget.querySelector('.np-title');
        const artistEl = this.nowPlayingWidget.querySelector('.np-artist');
        
        if (titleEl) titleEl.textContent = this.currentTrack.title;
        if (artistEl) artistEl.textContent = this.currentTrack.artist;
    }
    
    // ===================================
    // UI - RADIO MENU
    // ===================================
    
    createRadioMenu() {
        this.radioMenu = document.createElement('div');
        this.radioMenu.id = 'radio-menu';
        this.radioMenu.style.display = 'none';
        
        this.radioMenu.innerHTML = `
            <div class="radio-header">
                <h2>🎵 RADIO MENU</h2>
                <button class="radio-close">×</button>
            </div>
            <div class="radio-content">
                <div class="radio-context" data-context="menu">
                    <h3>Menu Tracks</h3>
                    <div class="track-list"></div>
                </div>
                <div class="radio-context" data-context="level">
                    <h3>Level Tracks</h3>
                    <div class="track-list"></div>
                </div>
                <div class="radio-context" data-context="boss">
                    <h3>Boss Tracks</h3>
                    <div class="track-list"></div>
                </div>
            </div>
        `;
        
        // Styling
        const style = document.createElement('style');
        style.textContent = `
            #radio-menu {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                border: 3px solid #00FFFF;
                border-radius: 12px;
                padding: 0;
                font-family: 'Courier New', monospace;
                color: #00FFFF;
                z-index: 2000;
                max-width: 600px;
                max-height: 80vh;
                overflow: auto;
                box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
            }
            
            .radio-header {
                background: rgba(0, 255, 255, 0.1);
                padding: 15px 20px;
                border-bottom: 2px solid #00FFFF;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            .radio-header h2 {
                margin: 0;
                font-size: 20px;
            }
            
            .radio-close {
                background: none;
                border: 2px solid #00FFFF;
                color: #00FFFF;
                font-size: 24px;
                width: 35px;
                height: 35px;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .radio-close:hover {
                background: #00FFFF;
                color: #000;
            }
            
            .radio-content {
                padding: 20px;
            }
            
            .radio-context {
                margin-bottom: 25px;
            }
            
            .radio-context h3 {
                color: #00AAAA;
                margin: 0 0 10px 0;
                font-size: 16px;
                border-bottom: 1px solid #00AAAA;
                padding-bottom: 5px;
            }
            
            .track-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .track-item {
                background: rgba(0, 255, 255, 0.05);
                border: 1px solid #00AAAA;
                border-radius: 6px;
                padding: 10px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s;
            }
            
            .track-item:hover {
                background: rgba(0, 255, 255, 0.1);
                border-color: #00FFFF;
            }
            
            .track-item.disabled {
                opacity: 0.5;
                background: rgba(255, 0, 0, 0.05);
                border-color: #AA0000;
            }
            
            .track-info {
                flex: 1;
            }
            
            .track-title {
                font-weight: bold;
                font-size: 14px;
            }
            
            .track-artist {
                font-size: 12px;
                color: #00AAAA;
            }
            
            .track-toggle {
                background: none;
                border: 2px solid #00FFFF;
                color: #00FFFF;
                padding: 6px 12px;
                cursor: pointer;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                transition: all 0.2s;
            }
            
            .track-toggle:hover {
                background: #00FFFF;
                color: #000;
            }
            
            .track-item.disabled .track-toggle {
                border-color: #FF0000;
                color: #FF0000;
            }
            
            .track-item.disabled .track-toggle:hover {
                background: #FF0000;
                color: #FFF;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.radioMenu);
    }
    
    setupRadioControls() {
        // Close button
        const closeBtn = this.radioMenu.querySelector('.radio-close');
        closeBtn.addEventListener('click', () => this.toggleRadioMenu());
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.radioMenuOpen) {
                this.toggleRadioMenu();
            }
        });
        
        // M key to toggle radio menu (when not in input)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'm' && !e.target.matches('input, textarea') && !this.core.state.paused) {
                this.toggleRadioMenu();
            }
        });
    }
    
    toggleRadioMenu() {
        this.radioMenuOpen = !this.radioMenuOpen;
        this.radioMenu.style.display = this.radioMenuOpen ? 'block' : 'none';
        
        if (this.radioMenuOpen) {
            this.updateRadioMenu();
            this.core.state.paused = true;
        } else {
            this.core.state.paused = false;
        }
    }
    
    updateRadioMenu() {
        ['menu', 'level', 'boss'].forEach(context => {
            const playlist = this.playlists[context];
            const contextEl = this.radioMenu.querySelector(`[data-context="${context}"]`);
            const listEl = contextEl.querySelector('.track-list');
            
            if (!playlist || playlist.length === 0) {
                listEl.innerHTML = '<p style="color: #AA0000; font-style: italic;">No tracks loaded</p>';
                return;
            }
            
            listEl.innerHTML = playlist.map(track => {
                const disabled = this.isTrackDisabled(track.id);
                return `
                    <div class="track-item ${disabled ? 'disabled' : ''}" data-track-id="${track.id}">
                        <div class="track-info">
                            <div class="track-title">${track.title}</div>
                            <div class="track-artist">${track.artist}</div>
                        </div>
                        <button class="track-toggle" data-track-id="${track.id}">
                            ${disabled ? 'ENABLE' : 'DISABLE'}
                        </button>
                    </div>
                `;
            }).join('');
            
            // Add event listeners to toggle buttons
            listEl.querySelectorAll('.track-toggle').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.toggleTrack(btn.dataset.trackId);
                });
            });
        });
    }
    
    // ===================================
    // MODULE LIFECYCLE
    // ===================================
    
    update() {
        // Music system doesn't need frame-by-frame updates
        // All playback is event-driven
    }
    
    clear() {
        this.stop();
        
        // Remove UI elements
        if (this.nowPlayingWidget) {
            this.nowPlayingWidget.remove();
            this.nowPlayingWidget = null;
        }
        
        if (this.radioMenu) {
            this.radioMenu.remove();
            this.radioMenu = null;
        }
        
        // Clear playlists
        this.playlists = { menu: [], level: [], boss: [] };
        this.currentPlaylist = null;
        this.currentContext = null;
        
        console.log('🎵 Music system cleared');
    }
}

export { ApplesauceMusic };
