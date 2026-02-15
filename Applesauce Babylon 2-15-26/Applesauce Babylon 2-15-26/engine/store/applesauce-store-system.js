/**
 * APPLESAUCE Store System
 * Handles in-level stores and main menu shop
 */

export class StoreSystem {
    constructor(saveSystem) {
        this.saveSystem = saveSystem;
        
        // Item catalog
        this.catalog = this.buildCatalog();
        
        console.log('🛒 Store System initialized');
    }
    
    /**
     * Build the item catalog
     * Each item has: id, name, category, price, description, unlockRequirement
     */
    buildCatalog() {
        return {
            // DECKS
            decks: [
                {
                    id: 'default',
                    name: 'Treaty Board',
                    category: 'decks',
                    price: 0,
                    description: 'Your starter deck. Reliable and sturdy.',
                    unlockRequirement: null
                },
                {
                    id: 'skull_deck',
                    name: 'Skull Crusher',
                    category: 'decks',
                    price: 100,
                    description: 'A deck painted with bones. Intimidating.',
                    stats: { speed: 5, control: 3, durability: 4 }
                },
                {
                    id: 'gore_deck',
                    name: 'Bloodstained',
                    category: 'decks',
                    price: 250,
                    description: 'Splattered with the evidence of your crimes.',
                    stats: { speed: 7, control: 4, durability: 3 },
                    unlockRequirement: { stat: 'totalKills', value: 50 }
                },
                {
                    id: 'watchtower_deck',
                    name: 'Watchtower Relic',
                    category: 'decks',
                    price: 500,
                    description: 'A board forged from the tower itself.',
                    stats: { speed: 8, control: 8, durability: 8 },
                    unlockRequirement: { level: 'watchtower_finale' }
                }
            ],
            
            // HELMETS
            helmets: [
                {
                    id: 'default',
                    name: 'Standard Dome',
                    category: 'helmets',
                    price: 0,
                    description: 'Basic protection. Better than nothing.',
                    unlockRequirement: null
                },
                {
                    id: 'knight_helmet',
                    name: 'Knight Visor',
                    category: 'helmets',
                    price: 75,
                    description: 'Medieval protection for modern carnage.'
                },
                {
                    id: 'skull_mask',
                    name: 'Death Mask',
                    category: 'helmets',
                    price: 150,
                    description: 'Let them know what they\'re dealing with.'
                },
                {
                    id: 'crown',
                    name: 'Bloody Crown',
                    category: 'helmets',
                    price: 300,
                    description: 'Earned through violence, worn with pride.',
                    unlockRequirement: { stat: 'highestCombo', value: 100 }
                }
            ],
            
            // WHEELS
            wheels: [
                {
                    id: 'default',
                    name: 'Standard Wheels',
                    category: 'wheels',
                    price: 0,
                    description: 'They roll. That\'s all you need.',
                    unlockRequirement: null
                },
                {
                    id: 'speed_wheels',
                    name: 'Speed Demons',
                    category: 'wheels',
                    price: 120,
                    description: 'Go fast. Break things.',
                    stats: { speed: 8, control: 4 }
                },
                {
                    id: 'grip_wheels',
                    name: 'Death Grip',
                    category: 'wheels',
                    price: 120,
                    description: 'Maximum control for precise carnage.',
                    stats: { speed: 4, control: 8 }
                }
            ],
            
            // OUTFITS
            outfits: [
                {
                    id: 'default',
                    name: 'Street Clothes',
                    category: 'outfits',
                    price: 0,
                    description: 'What you started with.',
                    unlockRequirement: null
                },
                {
                    id: 'armor',
                    name: 'Treaty Armor',
                    category: 'outfits',
                    price: 200,
                    description: 'Protection from the watchtower guards.',
                    unlockRequirement: { level: 'watchtower_entrance' }
                },
                {
                    id: 'gore_outfit',
                    name: 'Butcher\'s Apron',
                    category: 'outfits',
                    price: 350,
                    description: 'Might as well dress for the job.',
                    unlockRequirement: { stat: 'totalKills', value: 100 }
                }
            ],
            
            // SPECIAL ITEMS (consumables, boosts, etc.)
            special: [
                {
                    id: 'speed_boost',
                    name: 'Speed Tonic',
                    category: 'special',
                    price: 25,
                    description: 'Temporary speed increase. Single use.',
                    consumable: true
                },
                {
                    id: 'invincibility',
                    name: 'Blood Shield',
                    category: 'special',
                    price: 50,
                    description: 'Brief invulnerability. Single use.',
                    consumable: true
                },
                {
                    id: 'level_skip',
                    name: 'Treaty Pass',
                    category: 'special',
                    price: 100,
                    description: 'Skip any level you\'re stuck on.',
                    consumable: true
                }
            ]
        };
    }
    
    /**
     * Get all items in a category
     */
    getCategory(category) {
        return this.catalog[category] || [];
    }
    
    /**
     * Get a specific item by ID and category
     */
    getItem(category, itemId) {
        const items = this.catalog[category] || [];
        return items.find(item => item.id === itemId);
    }
    
    /**
     * Check if player meets unlock requirements for an item
     */
    meetsRequirements(item) {
        if (!item.unlockRequirement) return true;
        
        const req = item.unlockRequirement;
        const stats = this.saveSystem.data.stats;
        
        // Stat requirement
        if (req.stat) {
            return stats[req.stat] >= req.value;
        }
        
        // Level completion requirement
        if (req.level) {
            return stats.levelsCompleted.includes(req.level);
        }
        
        return true;
    }
    
    /**
     * Check if an item can be purchased
     */
    canPurchase(category, itemId) {
        const item = this.getItem(category, itemId);
        if (!item) {
            return { success: false, reason: 'Item not found' };
        }
        
        // Already unlocked?
        if (this.saveSystem.isUnlocked(category, itemId)) {
            return { success: false, reason: 'Already owned' };
        }
        
        // Meets requirements?
        if (!this.meetsRequirements(item)) {
            return { success: false, reason: 'Requirements not met', requirement: item.unlockRequirement };
        }
        
        // Can afford?
        if (!this.saveSystem.canAfford(item.price)) {
            return { success: false, reason: 'Not enough helmets', cost: item.price, has: this.saveSystem.getHelmets() };
        }
        
        return { success: true };
    }
    
    /**
     * Purchase an item
     */
    purchase(category, itemId) {
        const check = this.canPurchase(category, itemId);
        
        if (!check.success) {
            console.log(`❌ Cannot purchase ${itemId}:`, check.reason);
            return check;
        }
        
        const item = this.getItem(category, itemId);
        
        // Deduct currency
        this.saveSystem.removeHelmets(item.price);
        
        // Unlock item
        this.saveSystem.unlock(category, itemId);
        
        console.log(`✅ Purchased ${item.name} for ${item.price} helmets!`);
        
        return { success: true, item: item };
    }
    
    /**
     * Get all purchasable items (filtered by requirements and ownership)
     */
    getShopInventory() {
        const inventory = {
            available: [],    // Can purchase now
            locked: [],       // Meets requirements but can't afford
            unavailable: []   // Doesn't meet requirements
        };
        
        // Check all categories
        for (const category in this.catalog) {
            this.catalog[category].forEach(item => {
                // Skip if already owned
                if (this.saveSystem.isUnlocked(category, item.id)) {
                    return;
                }
                
                // Check requirements
                if (!this.meetsRequirements(item)) {
                    inventory.unavailable.push({ ...item, category });
                    return;
                }
                
                // Check affordability
                if (this.saveSystem.canAfford(item.price)) {
                    inventory.available.push({ ...item, category });
                } else {
                    inventory.locked.push({ ...item, category });
                }
            });
        }
        
        return inventory;
    }
    
    /**
     * Create an in-level store NPC/booth
     * Returns a mesh and interaction handler
     */
    createStoreNPC(scene, position, storeType = 'general') {
        // Create store booth mesh
        const booth = BABYLON.MeshBuilder.CreateBox(
            'store_booth',
            { width: 3, height: 3, depth: 2 },
            scene
        );
        booth.position = position;
        
        // Material
        const mat = new BABYLON.StandardMaterial('storeMat', scene);
        mat.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.6);
        mat.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0.15);
        booth.material = mat;
        
        // Add sign mesh
        const sign = BABYLON.MeshBuilder.CreatePlane(
            'store_sign',
            { width: 2, height: 0.8 },
            scene
        );
        sign.position = new BABYLON.Vector3(0, 2, -1.1);
        sign.parent = booth;
        
        // Sign texture (you'd replace with actual texture)
        const signMat = new BABYLON.StandardMaterial('signMat', scene);
        signMat.diffuseColor = new BABYLON.Color3(1, 0.9, 0.7);
        signMat.emissiveColor = new BABYLON.Color3(0.2, 0.18, 0.14);
        sign.material = signMat;
        
        // Interaction trigger
        const trigger = BABYLON.MeshBuilder.CreateBox(
            'store_trigger',
            { width: 5, height: 4, depth: 4 },
            scene
        );
        trigger.position = position;
        trigger.visibility = 0; // Invisible
        
        // Add physics for collision detection
        const aggregate = new BABYLON.PhysicsAggregate(
            trigger,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 0 },
            scene
        );
        
        return {
            booth: booth,
            trigger: trigger,
            aggregate: aggregate,
            storeType: storeType,
            
            // Interaction handler
            onEnter: (callback) => {
                aggregate.body.getCollisionObservable().add((collision) => {
                    callback(this);
                });
            }
        };
    }
}
