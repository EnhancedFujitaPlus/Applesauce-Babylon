/**
 * APPLESAUCE Helmet Inventory UI
 * Manages quick-swap (1-9) and pause menu inventory
 */

export class HelmetInventoryUI {
    constructor(helmetSystem) {
        this.helmetSystem = helmetSystem;
        this.isPaused = false;
        
        // UI elements
        this.quickSwapUI = null;
        this.inventoryModal = null;
        
        this.setupUI();
        this.setupInput();
        
        console.log('🎒 Inventory UI initialized');
    }
    
    /**
     * Setup UI elements
     */
    setupUI() {
        // Create quick-swap bar (always visible)
        this.createQuickSwapBar();
        
        // Create pause menu inventory
        this.createInventoryModal();
    }
    
    /**
     * Create quick-swap bar at bottom of screen
     */
    createQuickSwapBar() {
        const container = document.createElement('div');
        container.id = 'quickSwapBar';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 12px;
            backdrop-filter: blur(10px);
            z-index: 100;
        `;
        
        // Create 9 slots
        for (let i = 0; i < 9; i++) {
            const slot = this.createSlot(i);
            container.appendChild(slot);
        }
        
        document.body.appendChild(container);
        this.quickSwapUI = container;
    }
    
    /**
     * Create individual helmet slot
     */
    createSlot(index) {
        const slot = document.createElement('div');
        slot.className = 'helmet-slot';
        slot.dataset.slot = index;
        slot.style.cssText = `
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        `;
        
        // Slot number
        const number = document.createElement('div');
        number.textContent = index + 1;
        number.style.cssText = `
            position: absolute;
            top: 2px;
            right: 4px;
            font-size: 10px;
            color: rgba(255, 255, 255, 0.6);
            font-family: monospace;
        `;
        slot.appendChild(number);
        
        // Helmet icon (placeholder)
        const icon = document.createElement('div');
        icon.className = 'helmet-icon';
        icon.style.cssText = `
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: none;
        `;
        slot.appendChild(icon);
        
        // Empty text
        const emptyText = document.createElement('div');
        emptyText.textContent = 'Empty';
        emptyText.style.cssText = `
            font-size: 10px;
            color: rgba(255, 255, 255, 0.4);
            font-family: sans-serif;
        `;
        slot.appendChild(emptyText);
        
        // Click handler
        slot.addEventListener('click', () => {
            this.switchToSlot(index);
        });
        
        return slot;
    }
    
    /**
     * Create inventory modal (pause menu)
     */
    createInventoryModal() {
        const modal = document.createElement('div');
        modal.id = 'inventoryModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            z-index: 1000;
            overflow-y: auto;
        `;
        
        // Container
        const container = document.createElement('div');
        container.style.cssText = `
            max-width: 1200px;
            margin: 40px auto;
            padding: 40px;
        `;
        
        // Header
        const header = document.createElement('div');
        header.innerHTML = `
            <h1 style="color: white; font-family: sans-serif; margin-bottom: 10px;">
                🪖 HELMET INVENTORY
            </h1>
            <p style="color: rgba(255,255,255,0.7); font-family: sans-serif; margin-bottom: 30px;">
                Press ESC to close | Click helmets to equip to active slot
            </p>
        `;
        container.appendChild(header);
        
        // Current loadout section
        const loadoutSection = document.createElement('div');
        loadoutSection.innerHTML = `
            <h2 style="color: white; font-family: sans-serif; margin-bottom: 15px;">
                Current Loadout (1-9)
            </h2>
        `;
        const loadoutGrid = document.createElement('div');
        loadoutGrid.id = 'loadoutGrid';
        loadoutGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(9, 1fr);
            gap: 15px;
            margin-bottom: 40px;
        `;
        loadoutSection.appendChild(loadoutGrid);
        container.appendChild(loadoutSection);
        
        // All helmets section
        const allHelmetsSection = document.createElement('div');
        allHelmetsSection.innerHTML = `
            <h2 style="color: white; font-family: sans-serif; margin-bottom: 15px;">
                All Available Helmets
            </h2>
        `;
        const helmetsGrid = document.createElement('div');
        helmetsGrid.id = 'allHelmetsGrid';
        helmetsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
        `;
        allHelmetsSection.appendChild(helmetsGrid);
        container.appendChild(allHelmetsSection);
        
        modal.appendChild(container);
        document.body.appendChild(modal);
        
        this.inventoryModal = modal;
    }
    
    /**
     * Setup keyboard input
     */
    setupInput() {
        document.addEventListener('keydown', (e) => {
            // Number keys 1-9 for quick swap
            if (e.key >= '1' && e.key <= '9') {
                const slot = parseInt(e.key) - 1;
                this.switchToSlot(slot);
            }
            
            // ESC or I for inventory
            if (e.key === 'Escape' || e.key.toLowerCase() === 'i') {
                this.toggleInventory();
            }
        });
    }
    
    /**
     * Update UI to reflect current helmet state
     */
    update() {
        // Update quick-swap bar
        this.updateQuickSwapBar();
        
        // Update combo display if visible
        this.updateComboDisplay();
    }
    
    /**
     * Update quick-swap bar slots
     */
    updateQuickSwapBar() {
        const slots = this.quickSwapUI.querySelectorAll('.helmet-slot');
        const equipped = this.helmetSystem.equippedHelmets;
        const currentSlot = this.helmetSystem.currentSlot;
        
        slots.forEach((slot, index) => {
            const helmet = equipped[index];
            const icon = slot.querySelector('.helmet-icon');
            const emptyText = slot.querySelector('div:last-child');
            
            if (helmet) {
                // Show helmet
                icon.style.display = 'block';
                icon.style.background = helmet.color;
                emptyText.style.display = 'none';
                
                // Tooltip
                slot.title = `${helmet.name}\n${helmet.damage} DMG | ${helmet.range}m range`;
            } else {
                // Show empty
                icon.style.display = 'none';
                emptyText.style.display = 'block';
                slot.title = 'Empty slot';
            }
            
            // Highlight active slot
            if (index === currentSlot) {
                slot.style.border = '2px solid #FFD700';
                slot.style.background = 'rgba(255, 215, 0, 0.2)';
                slot.style.transform = 'scale(1.1)';
            } else {
                slot.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                slot.style.background = 'rgba(255, 255, 255, 0.1)';
                slot.style.transform = 'scale(1)';
            }
        });
    }
    
    /**
     * Update combo display
     */
    updateComboDisplay() {
        const combo = this.helmetSystem.getComboInfo();
        
        if (combo.count > 0) {
            // Show/update combo counter
            let comboDisplay = document.getElementById('comboDisplay');
            
            if (!comboDisplay) {
                comboDisplay = document.createElement('div');
                comboDisplay.id = 'comboDisplay';
                comboDisplay.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 20px;
                    background: rgba(255, 215, 0, 0.9);
                    border-radius: 10px;
                    font-family: sans-serif;
                    font-weight: bold;
                    text-align: center;
                    z-index: 100;
                    animation: pulse 0.5s ease-in-out infinite alternate;
                `;
                
                // Add pulse animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes pulse {
                        from { transform: scale(1); }
                        to { transform: scale(1.1); }
                    }
                `;
                document.head.appendChild(style);
                
                document.body.appendChild(comboDisplay);
            }
            
            comboDisplay.innerHTML = `
                <div style="font-size: 48px; color: #000;">${combo.count}x</div>
                <div style="font-size: 16px; color: #333; margin-top: 5px;">
                    COMBO
                </div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">
                    ${(combo.multiplier * 100).toFixed(0)}% damage
                </div>
            `;
            
        } else {
            // Hide combo display
            const comboDisplay = document.getElementById('comboDisplay');
            if (comboDisplay) {
                comboDisplay.remove();
            }
        }
    }
    
    /**
     * Switch to specific slot
     */
    switchToSlot(slot) {
        const success = this.helmetSystem.switchToSlot(slot);
        
        if (success) {
            this.updateQuickSwapBar();
            this.showNotification(`Equipped: ${this.helmetSystem.getCurrentHelmet().name}`);
        }
    }
    
    /**
     * Toggle inventory modal
     */
    toggleInventory() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.openInventory();
        } else {
            this.closeInventory();
        }
    }
    
    /**
     * Open inventory modal
     */
    openInventory() {
        this.inventoryModal.style.display = 'block';
        this.populateInventory();
        
        // Pause game (you'll need to call your core's pause method)
        if (window.applesauceCore) {
            window.applesauceCore.pause();
        }
    }
    
    /**
     * Close inventory modal
     */
    closeInventory() {
        this.inventoryModal.style.display = 'none';
        
        // Resume game
        if (window.applesauceCore) {
            window.applesauceCore.resume();
        }
    }
    
    /**
     * Populate inventory with helmets
     */
    populateInventory() {
        const loadoutGrid = document.getElementById('loadoutGrid');
        const allGrid = document.getElementById('allHelmetsGrid');
        
        // Clear grids
        loadoutGrid.innerHTML = '';
        allGrid.innerHTML = '';
        
        // Populate loadout
        this.helmetSystem.equippedHelmets.forEach((helmet, index) => {
            const card = this.createHelmetCard(helmet, index, true);
            loadoutGrid.appendChild(card);
        });
        
        // Populate all helmets
        this.helmetSystem.getAllHelmets().forEach(helmet => {
            const card = this.createHelmetCard(helmet, -1, false);
            allGrid.appendChild(card);
        });
    }
    
    /**
     * Create helmet card for inventory
     */
    createHelmetCard(helmet, slotIndex, isLoadout) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: ${helmet ? `linear-gradient(135deg, ${helmet.color}44, ${helmet.color}22)` : 'rgba(255,255,255,0.1)'};
            border: 2px solid ${helmet ? helmet.color : 'rgba(255,255,255,0.3)'};
            border-radius: 10px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: sans-serif;
        `;
        
        if (!helmet) {
            card.innerHTML = `
                <div style="color: rgba(255,255,255,0.5); text-align: center;">
                    ${isLoadout ? `Slot ${slotIndex + 1}` : 'Empty'}
                </div>
            `;
            return card;
        }
        
        card.innerHTML = `
            <div style="width: 60px; height: 60px; background: ${helmet.color}; 
                        border-radius: 50%; margin: 0 auto 10px;"></div>
            <div style="color: white; font-weight: bold; text-align: center; margin-bottom: 5px;">
                ${helmet.name}
            </div>
            <div style="color: rgba(255,255,255,0.8); font-size: 12px; text-align: center; margin-bottom: 10px;">
                ${helmet.element ? `[${helmet.element.toUpperCase()}]` : ''}
            </div>
            <div style="color: rgba(255,255,255,0.7); font-size: 11px;">
                ⚔️ ${helmet.damage} DMG<br>
                📏 ${helmet.range}m range<br>
                💥 ${helmet.knockback} knockback
            </div>
        `;
        
        // Click to equip
        card.addEventListener('click', () => {
            if (!isLoadout) {
                this.equipHelmetToActiveSlot(helmet.id);
            }
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
            card.style.boxShadow = `0 0 20px ${helmet.color}88`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
            card.style.boxShadow = 'none';
        });
        
        return card;
    }
    
    /**
     * Equip helmet to currently active slot
     */
    equipHelmetToActiveSlot(helmetId) {
        const currentSlot = this.helmetSystem.currentSlot;
        this.helmetSystem.equipToSlot(helmetId, currentSlot);
        this.populateInventory();
        this.updateQuickSwapBar();
        
        const helmet = this.helmetSystem.getCurrentHelmet();
        this.showNotification(`Equipped ${helmet.name} to slot ${currentSlot + 1}`);
    }
    
    /**
     * Show notification toast
     */
    showNotification(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 15px 25px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            border-radius: 8px;
            font-family: sans-serif;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-in reverse';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
    
    /**
     * Clean up UI
     */
    dispose() {
        if (this.quickSwapUI) this.quickSwapUI.remove();
        if (this.inventoryModal) this.inventoryModal.remove();
        
        console.log('🎒 Inventory UI disposed');
    }
}
