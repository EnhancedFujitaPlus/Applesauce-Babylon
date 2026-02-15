/**
 * APPLESAUCE Dialogue Module for Three.js r182
 * NPC system and letter-by-letter dialogue display
 * SELF-CONTAINED: Creates its own UI elements!
 * ES Module version
 */

import * as THREE from './three.module.js';

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
        
        console.log('💬 Dialogue module loaded (self-contained UI)');
    }
    
    _ensureUIElements() {
        // Check if elements already exist
        if (document.getElementById('speechBubble')) {
            console.log('💬 Using existing dialogue UI elements');
            return;
        }
        
        console.log('💬 Creating dialogue UI elements...');
        
        // Create CSS styles
        this._createStyles();
        
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
        
        console.log('✅ Dialogue UI elements created');
    }
    
    _createStyles() {
        // Check if styles already exist
        if (document.getElementById('dialogue-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'dialogue-styles';
        style.textContent = `
            /* SPEECH BUBBLE - RIGHT SIDE */
            #speechBubble {
                position: absolute;
                right: 40px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.95);
                border: 4px solid #000;
                border-radius: 20px;
                padding: 25px 30px;
                max-width: 400px;
                display: none;
                z-index: 150;
                box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.5);
            }
            
            #speechBubble.active {
                display: block;
                animation: bubblePop 0.3s ease-out;
            }
            
            @keyframes bubblePop {
                0% { transform: translateY(-50%) scale(0); }
                60% { transform: translateY(-50%) scale(1.1); }
                100% { transform: translateY(-50%) scale(1); }
            }
            
            #speakerName {
                font-size: 24px;
                color: #000;
                font-weight: bold;
                margin-bottom: 10px;
                text-shadow: none;
            }
            
            #speechText {
                font-size: 18px;
                color: #000;
                line-height: 1.5;
                font-family: Arial, sans-serif;
                text-shadow: none;
                min-height: 60px;
            }
            
            #dialoguePrompt {
                font-size: 14px;
                color: #666;
                margin-top: 10px;
                text-align: right;
                font-family: Arial, sans-serif;
            }
            
            /* INTERACT PROMPT - BOTTOM CENTER */
            #interactPrompt {
                position: absolute;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                color: #FFD700;
                font-size: 24px;
                text-shadow: 3px 3px 0 #000;
                display: none;
                z-index: 100;
                animation: bounce 0.5s infinite alternate;
            }
            
            @keyframes bounce {
                0% { transform: translateX(-50%) translateY(0); }
                100% { transform: translateX(-50%) translateY(-10px); }
            }
        `;
        
        document.head.appendChild(style);
    }
    
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
    start(dialogue) {
        this.isActive = true;
        this.currentDialogue = dialogue;
        this.currentIndex = 0;
        this.showLine(0);
        this.bubble.classList.add('active');
    }
    
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
    
    advance() {
        if (this.isTyping) {
            // Skip typing animation
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
    createNPC(config) {
        const npc = new NPC(config, this.engine);
        this.npcs.push(npc);
        return npc;
    }
    
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
class NPC {
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
    
    updatePosition() {
        // Get terrain height at NPC's position
        const groundY = this.engine.getTerrainHeight(this.position.x, this.position.z);
        this.mesh.position.set(this.position.x, groundY, this.position.z);
    }
    
    canInteract(playerX, playerZ) {
        const dx = playerX - this.position.x;
        const dz = playerZ - this.position.z;
        return Math.sqrt(dx * dx + dz * dz) < this.interactRadius;
    }
    
    remove() {
        this.engine.scene.remove(this.mesh);
    }
}
