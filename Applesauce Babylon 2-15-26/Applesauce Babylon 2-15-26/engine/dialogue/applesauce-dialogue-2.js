/**
 * APPLESAUCE Dialogue Module for Three.js r182
 * NPC system and letter-by-letter dialogue display
 * SELF-CONTAINED: Creates UI elements if they don't exist
 * Expects styles to be loaded from applesauce-styles.css
 * ES Module version
 */
import * as THREE from '../three.module.js';

export class ApplesauceDialogue {
    constructor(engine) {
        this.engine = engine;
        this.isActive = false;
        this.isTyping = false;
        this.currentDialogue = [];
        this.currentIndex = 0;
        this.currentText = "";
        this.typingSpeed = 30; // milliseconds per character
        this.typingTimer = null;
        this.npcs = [];
        this.nearNPC = null;
        
        // Create UI elements if they don't exist
        this._ensureUIElements();
        
        // Get DOM elements
        this.bubble = document.getElementById('speechBubble');
        this.speakerName = document.getElementById('speakerName');
        this.speechText = document.getElementById('speechText');
        this.interactPrompt = document.getElementById('interactPrompt');
        
        // Setup F key listener
        this._setupControls();
        
        console.log('💬 Dialogue module loaded');
    }
    
    /**
     * Creates HTML elements if they don't already exist in the DOM
     * Assumes CSS styles are loaded from applesauce-styles.css
     */
    _ensureUIElements() {
        // Check if elements already exist
        if (document.getElementById('speechBubble')) {
            console.log('💬 Using existing dialogue UI elements');
            return;
        }
        
        console.log('💬 Creating dialogue UI elements...');
        
        // Create speech bubble
        const bubble = document.createElement('div');
        bubble.id = 'speechBubble';
        
        const speakerName = document.createElement('div');
        speakerName.id = 'speakerName';
        speakerName.textContent = 'SPEAKER';
        
        const speechText = document.createElement('div');
        speechText.id = 'speechText';
        speechText.textContent = 'Dialogue text goes here...';
        
        const dialoguePrompt = document.createElement('div');
        dialoguePrompt.id = 'dialoguePrompt';
        dialoguePrompt.textContent = '[Press F to continue...]';
        
        bubble.appendChild(speakerName);
        bubble.appendChild(speechText);
        bubble.appendChild(dialoguePrompt);
        
        // Create interact prompt
        const interactPrompt = document.createElement('div');
        interactPrompt.id = 'interactPrompt';
        interactPrompt.textContent = 'Press F to interact';
        
        // Add to document
        document.body.appendChild(bubble);
        document.body.appendChild(interactPrompt);
        
        console.log('✅ Dialogue UI elements created (using external CSS)');
    }
    
    /**
     * Sets up keyboard controls for dialogue interaction
     */
    _setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'f') {
                if (this.nearNPC && !this.isActive) {
                    // Start dialogue with nearby NPC
                    this.start(this.nearNPC.dialogue);
                } else if (this.isActive) {
                    // Advance dialogue
                    this.advance();
                }
            }
        });
    }
    
    // ===================================
    // DIALOGUE CONTROL
    // ===================================
    
    /**
     * Starts a new dialogue sequence
     * @param {Array} dialogue - Array of {speaker, text} objects
     */
    start(dialogue) {
        this.isActive = true;
        this.currentDialogue = dialogue;
        this.currentIndex = 0;
        this.showLine(0);
        this.bubble.classList.add('active');
    }
    
    /**
     * Displays a specific line of dialogue with typing animation
     * @param {number} index - Index of the dialogue line to show
     */
    showLine(index) {
        if (index >= this.currentDialogue.length) {
            this.end();
            return;
        }
        
        const line = this.currentDialogue[index];
        this.speakerName.textContent = line.speaker;
        this.speechText.textContent = "";
        this.currentText = "";
        
        this.isTyping = true;
        this.typeText(line.text, 0);
    }
    
    /**
     * Types out text character by character
     * @param {string} fullText - The complete text to type
     * @param {number} charIndex - Current character position
     */
    typeText(fullText, charIndex) {
        if (charIndex < fullText.length) {
            this.currentText += fullText[charIndex];
            this.speechText.textContent = this.currentText;
            
            this.typingTimer = setTimeout(() => {
                this.typeText(fullText, charIndex + 1);
            }, this.typingSpeed);
        } else {
            this.isTyping = false;
        }
    }
    
    /**
     * Advances to the next dialogue line or skips typing animation
     */
    advance() {
        if (this.isTyping) {
            // Skip typing animation - show full text immediately
            clearTimeout(this.typingTimer);
            this.speechText.textContent = this.currentDialogue[this.currentIndex].text;
            this.currentText = this.currentDialogue[this.currentIndex].text;
            this.isTyping = false;
        } else {
            // Move to next line
            this.currentIndex++;
            this.showLine(this.currentIndex);
        }
    }
    
    /**
     * Ends the current dialogue sequence
     */
    end() {
        this.isActive = false;
        this.isTyping = false;
        this.currentDialogue = [];
        this.currentIndex = 0;
        this.bubble.classList.remove('active');
        clearTimeout(this.typingTimer);
    }
    
    // ===================================
    // NPC MANAGEMENT
    // ===================================
    
    /**
     * Creates a new NPC in the game world
     * @param {Object} config - NPC configuration object
     * @param {string} config.name - NPC's display name
     * @param {Array} config.dialogue - Array of dialogue lines
     * @param {Object} config.position - {x, y, z} world position
     * @param {number} config.color - Hex color for NPC body
     * @param {number} config.interactRadius - Distance for interaction
     * @returns {NPC} The created NPC instance
     */
    createNPC(config) {
        const npc = new NPC(config, this.engine);
        this.npcs.push(npc);
        return npc;
    }
    
    /**
     * Updates dialogue system each frame
     * Checks for nearby NPCs and shows/hides interact prompt
     * @param {Object} engine - Reference to game engine
     */
    update(engine) {
        // Check for nearby NPCs
        this.nearNPC = null;
        
        if (!engine.player) return;
        
        for (let npc of this.npcs) {
            const distance = npc.mesh.position.distanceTo(engine.player.position);
            
            if (distance < npc.interactRadius) {
                this.nearNPC = npc;
                break;
            }
        }
        
        // Show/hide interact prompt
        if (this.interactPrompt) {
            if (this.nearNPC && !this.isActive) {
                this.interactPrompt.style.display = 'block';
                this.interactPrompt.textContent = `Press F to talk to ${this.nearNPC.name}`;
            } else {
                this.interactPrompt.style.display = 'none';
            }
        }
    }
    
    /**
     * Removes all NPCs from the scene
     */
    clear() {
        // Remove all NPCs
        for (let npc of this.npcs) {
            npc.remove();
        }
        this.npcs = [];
        this.nearNPC = null;
        
        console.log('💬 Dialogue cleared');
    }
}

// ===================================
// NPC CLASS
// ===================================
/**
 * Non-Player Character with dialogue capabilities
 */
class NPC {
    /**
     * Creates a new NPC
     * @param {Object} config - Configuration object
     * @param {Object} engine - Reference to game engine
     */
    constructor(config, engine) {
        this.name = config.name || "NPC";
        this.dialogue = config.dialogue || [];
        this.position = config.position || { x: 0, y: 0, z: 0 };
        this.color = config.color || 0x00FF00;
        this.interactRadius = config.interactRadius || 5;
        this.engine = engine;
        
        this.mesh = this.createMesh();
        
        // Position NPC at correct terrain height
        this.updatePosition();
        
        engine.scene.add(this.mesh);
        
        console.log(`✅ NPC "${this.name}" spawned at (${this.position.x}, ${this.mesh.position.y}, ${this.position.z})`);
    }
    
    /**
     * Creates the 3D mesh for the NPC
     * @returns {THREE.Group} The NPC's mesh group
     */
    createMesh() {
        const group = new THREE.Group();
        
        // Body (using cylinder - compatible with r182)
        const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
        const bodyMat = new THREE.MeshLambertMaterial({ color: this.color });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xFFDBAC });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.8;
        head.castShadow = true;
        group.add(head);
        
        return group;
    }
    
    /**
     * Updates NPC position to match terrain height
     */
    updatePosition() {
        // Get terrain height at NPC's position
        const groundY = this.engine.getTerrainHeight(this.position.x, this.position.z);
        this.mesh.position.set(this.position.x, groundY, this.position.z);
    }
    
    /**
     * Checks if player is close enough to interact
     * @param {number} playerX - Player's X position
     * @param {number} playerZ - Player's Z position
     * @returns {boolean} True if player can interact
     */
    canInteract(playerX, playerZ) {
        const dx = playerX - this.position.x;
        const dz = playerZ - this.position.z;
        return Math.sqrt(dx * dx + dz * dz) < this.interactRadius;
    }
    
    /**
     * Removes the NPC from the scene
     */
    remove() {
        this.engine.scene.remove(this.mesh);
    }
}
