/**
 * Example Level Implementation
 * Shows how to use SaveSystem, CollectibleManager, and StoreSystem
 * with proper error handling (fixes the null reference bug)
 */

import { SaveSystem } from './engine/save/applesauce-save-system.js';
import { CollectibleManager } from './engine/collectibles/applesauce-collectible-manager.js';
import { StoreSystem } from './engine/store/applesauce-store-system.js';

// Initialize systems (do this ONCE at game start)
const saveSystem = new SaveSystem();
const storeSystem = new StoreSystem(saveSystem);

// Example Level Configuration
window.Level25Config = {
    meta: {
        id: 'level_25',
        name: 'The Helmet Fields',
        description: 'A field of crates awaits. Collect them all.',
        difficulty: 'medium'
    },
    
    terrain: {
        size: 200,
        complexity: 0.6
    },
    
    playerStart: {
        position: new BABYLON.Vector3(0, 2, 0)
    },
    
    // ============================================
    // LEVEL INITIALIZATION
    // ============================================
    
    async onLevelStart(core) {
        console.log('🎮 Level 25: The Helmet Fields');
        
        // Initialize collectible manager for this level
        this.collectibleManager = new CollectibleManager(core, saveSystem);
        this.collectibleManager.setLevel(this.meta.id);
        
        // Spawn crates
        this.spawnCrates(core);
        
        // Spawn store
        this.spawnStore(core);
        
        // Setup UI
        this.setupUI(core);
    },
    
    // ============================================
    // SPAWNING COLLECTIBLES
    // ============================================
    
    spawnCrates(core) {
        // Define crate locations
        const crateConfigs = [
            {
                id: 'crate_01',
                position: new BABYLON.Vector3(10, 1, 10),
                reward: 5,
                type: 'helmet'
            },
            {
                id: 'crate_02',
                position: new BABYLON.Vector3(-10, 1, 10),
                reward: 5,
                type: 'helmet'
            },
            {
                id: 'crate_03',
                position: new BABYLON.Vector3(10, 1, -10),
                reward: 10,
                type: 'helmet'
            },
            {
                id: 'crate_secret',
                position: new BABYLON.Vector3(0, 1, -20),
                reward: 25,
                type: 'secret'
            },
            {
                id: 'crate_skull',
                position: new BABYLON.Vector3(-15, 1, -15),
                reward: 15,
                type: 'skull'
            }
        ];
        
        // Spawn all crates using the manager
        this.collectibleManager.createCrateField(crateConfigs);
        
        console.log(`📦 Spawned ${crateConfigs.length} crates`);
    },
    
    // ============================================
    // SPAWNING STORE
    // ============================================
    
    spawnStore(core) {
        const storePosition = new BABYLON.Vector3(20, 0, 0);
        
        const store = storeSystem.createStoreNPC(
            core.scene,
            storePosition,
            'general'
        );
        
        // Handle player entering store
        store.onEnter((storeInstance) => {
            console.log('🛒 Player entered store!');
            this.openStoreUI(storeInstance);
        });
        
        this.store = store;
    },
    
    // ============================================
    // UI SYSTEM
    // ============================================
    
    setupUI(core) {
        // Create HUD overlay
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        // Helmet counter
        const helmetText = new BABYLON.GUI.TextBlock();
        helmetText.text = `🪖 ${saveSystem.getHelmets()}`;
        helmetText.color = "gold";
        helmetText.fontSize = 24;
        helmetText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        helmetText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        helmetText.top = "20px";
        helmetText.left = "-20px";
        advancedTexture.addControl(helmetText);
        
        // Collection counter
        const collectionText = new BABYLON.GUI.TextBlock();
        collectionText.color = "white";
        collectionText.fontSize = 18;
        collectionText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        collectionText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        collectionText.top = "20px";
        collectionText.left = "20px";
        advancedTexture.addControl(collectionText);
        
        // Update collection counter
        const updateCollectionCounter = () => {
            const stats = this.collectibleManager.getLevelStats();
            if (stats) {
                collectionText.text = `Collected: ${stats.collected}/${stats.total} (${stats.percentage}%)`;
            }
        };
        
        updateCollectionCounter();
        
        // Listen for collection events
        window.addEventListener('collectible-collected', (event) => {
            // Update helmet counter
            helmetText.text = `🪖 ${event.detail.total}`;
            
            // Update collection counter
            updateCollectionCounter();
            
            // Show notification
            this.showNotification(advancedTexture, event.detail);
        });
        
        this.ui = {
            texture: advancedTexture,
            helmetText: helmetText,
            collectionText: collectionText
        };
    },
    
    showNotification(advancedTexture, detail) {
        // Create notification
        const notification = new BABYLON.GUI.TextBlock();
        notification.text = `+${detail.amount} ${detail.type}s!`;
        notification.color = detail.type === 'helmet' ? 'gold' : 
                           detail.type === 'skull' ? 'white' : 'purple';
        notification.fontSize = 32;
        notification.top = "-100px";
        
        advancedTexture.addControl(notification);
        
        // Animate in
        let alpha = 1;
        let yOffset = -100;
        
        const animate = () => {
            alpha -= 0.02;
            yOffset -= 2;
            
            notification.alpha = alpha;
            notification.top = `${yOffset}px`;
            
            if (alpha > 0) {
                requestAnimationFrame(animate);
            } else {
                advancedTexture.removeControl(notification);
            }
        };
        
        animate();
    },
    
    openStoreUI(storeInstance) {
        // This would open your store UI
        // For now, just log available items
        const inventory = storeSystem.getShopInventory();
        
        console.log('🛒 STORE INVENTORY:');
        console.log('Available to buy:', inventory.available);
        console.log('Can\'t afford:', inventory.locked);
        console.log('Locked:', inventory.unavailable);
        
        // Example purchase
        if (inventory.available.length > 0) {
            const item = inventory.available[0];
            console.log(`Press E to buy ${item.name} for ${item.price} helmets`);
            
            // You would set up a key listener here
            const buyHandler = (e) => {
                if (e.key === 'e') {
                    const result = storeSystem.purchase(item.category, item.id);
                    if (result.success) {
                        console.log(`✅ Bought ${result.item.name}!`);
                        
                        // Update UI
                        this.ui.helmetText.text = `🪖 ${saveSystem.getHelmets()}`;
                    }
                    
                    document.removeEventListener('keydown', buyHandler);
                }
            };
            
            document.addEventListener('keydown', buyHandler);
        }
    },
    
    // ============================================
    // LEVEL UPDATE LOOP
    // ============================================
    
    onUpdate(core) {
        // CRITICAL: The render loop callback must check if objects exist
        // before accessing their properties!
        
        // This is handled automatically by CollectibleManager now,
        // but here's what your old code might have looked like:
        
        // ❌ BAD (causes null error):
        // if (crate.collected) { ... }
        
        // ✅ GOOD (checks if crate exists first):
        // if (crate && !crate.isDisposed() && crate.collected) { ... }
        
        // Even better: let CollectibleManager handle it
    },
    
    // ============================================
    // LEVEL COMPLETION
    // ============================================
    
    onLevelComplete(core) {
        // Mark level as completed
        saveSystem.completeLevel(this.meta.id);
        
        // Get final stats
        const stats = this.collectibleManager.getLevelStats();
        
        console.log('🏁 Level Complete!');
        console.log(`Collected: ${stats.collected}/${stats.total}`);
        console.log(`Total Helmets: ${saveSystem.getHelmets()}`);
        
        // Clean up
        this.collectibleManager.clearAll();
    }
};

// ============================================
// MAIN MENU / SKATER EDITOR
// ============================================

export class SkaterEditor {
    constructor(saveSystem, storeSystem) {
        this.saveSystem = saveSystem;
        this.storeSystem = storeSystem;
        
        this.equipped = saveSystem.getEquipped();
    }
    
    /**
     * Equip an item from the menu
     */
    equipItem(category, itemId) {
        if (this.saveSystem.equip(category, itemId)) {
            this.equipped = this.saveSystem.getEquipped();
            this.updatePreview();
            return true;
        }
        return false;
    }
    
    /**
     * Buy an item from the menu shop
     */
    buyItem(category, itemId) {
        const result = this.storeSystem.purchase(category, itemId);
        
        if (result.success) {
            // Auto-equip purchased item
            this.equipItem(category, itemId);
        }
        
        return result;
    }
    
    /**
     * Get all owned items in a category
     */
    getOwnedItems(category) {
        const allItems = this.storeSystem.getCategory(category);
        return allItems.filter(item => 
            this.saveSystem.isUnlocked(category, item.id)
        );
    }
    
    /**
     * Update the 3D preview of the skater
     */
    updatePreview() {
        console.log('👕 Updated preview with:', this.equipped);
        // This would update your 3D model
    }
    
    /**
     * Generate HTML for the editor UI
     */
    generateUI() {
        const html = `
            <div class="skater-editor">
                <div class="currency">
                    <h2>🪖 Helmets: ${this.saveSystem.getHelmets()}</h2>
                </div>
                
                <div class="categories">
                    ${this.generateCategoryUI('decks')}
                    ${this.generateCategoryUI('helmets')}
                    ${this.generateCategoryUI('wheels')}
                    ${this.generateCategoryUI('outfits')}
                </div>
            </div>
        `;
        
        return html;
    }
    
    generateCategoryUI(category) {
        const items = this.storeSystem.getCategory(category);
        const owned = this.getOwnedItems(category);
        
        let html = `<div class="category" data-category="${category}">`;
        html += `<h3>${category.toUpperCase()}</h3>`;
        
        items.forEach(item => {
            const isOwned = this.saveSystem.isUnlocked(category, item.id);
            const isEquipped = this.equipped[category.slice(0, -1)] === item.id;
            const canBuy = this.storeSystem.canPurchase(category, item.id);
            
            html += `
                <div class="item ${isOwned ? 'owned' : 'locked'} ${isEquipped ? 'equipped' : ''}">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    ${!isOwned ? `<p class="price">🪖 ${item.price}</p>` : ''}
                    ${isOwned && !isEquipped ? `<button onclick="editor.equipItem('${category}', '${item.id}')">Equip</button>` : ''}
                    ${!isOwned && canBuy.success ? `<button onclick="editor.buyItem('${category}', '${item.id}')">Buy</button>` : ''}
                </div>
            `;
        });
        
        html += `</div>`;
        return html;
    }
}
