/**
 * APPLESAUCE Save System
 * Handles persistent progression, currency, unlocks, and stats
 * For Treaty of the Watchtower universe
 */

export class SaveSystem {
    constructor() {
        this.saveKey = 'APPLESAUCE_SAVE_DATA';
        this.data = this.load();
        
        console.log('💾 Save System initialized');
        console.log('Current helmets:', this.data.currency.helmets);
    }
    
    /**
     * Default save data structure
     */
    getDefaultData() {
        return {
            version: '1.0.0',
            
            // Currency & Collectibles
            currency: {
                helmets: 0,          // Main currency
                skulls: 0,           // Secondary currency (could be for premium items)
                bloodPoints: 0       // XP/ranking points
            },
            
            // Player Stats
            stats: {
                totalDistance: 0,
                totalTricks: 0,
                totalKills: 0,
                totalDeaths: 0,
                totalPlayTime: 0,
                highestCombo: 0,
                levelsCompleted: []
            },
            
            // Unlocks
            unlocks: {
                decks: ['default'],
                trucks: ['default'],
                wheels: ['default'],
                grip: ['default'],
                helmets: ['default'],
                outfits: ['default'],
                levels: ['tutorial', 'level_1']
            },
            
            // Per-level collectibles tracking
            levelProgress: {
                // Format: 'level_1': { helmetsCollected: [id1, id2], secretsFound: [id1] }
            },
            
            // Customization (current equipped items)
            equipped: {
                deck: 'default',
                trucks: 'default',
                wheels: 'default',
                grip: 'default',
                helmet: 'default',
                outfit: 'default'
            },
            
            // Settings
            settings: {
                goreEnabled: true,
                volume: 0.7,
                musicVolume: 0.5,
                difficulty: 'normal'
            },
            
            // Timestamps
            timestamps: {
                created: Date.now(),
                lastPlayed: Date.now()
            }
        };
    }
    
    /**
     * Load save data from localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem(this.saveKey);
            if (saved) {
                const data = JSON.parse(saved);
                console.log('✅ Save data loaded');
                return this.migrate(data); // Handle version updates
            }
        } catch (error) {
            console.error('❌ Failed to load save:', error);
        }
        
        console.log('📝 Creating new save file');
        return this.getDefaultData();
    }
    
    /**
     * Save data to localStorage
     */
    save() {
        try {
            this.data.timestamps.lastPlayed = Date.now();
            localStorage.setItem(this.saveKey, JSON.stringify(this.data));
            console.log('💾 Game saved');
            return true;
        } catch (error) {
            console.error('❌ Failed to save:', error);
            return false;
        }
    }
    
    /**
     * Migrate old save versions to current version
     */
    migrate(data) {
        // Add any missing fields from default data
        const defaults = this.getDefaultData();
        return this.deepMerge(defaults, data);
    }
    
    /**
     * Deep merge two objects (defaults + saved data)
     */
    deepMerge(defaults, saved) {
        const result = { ...defaults };
        
        for (const key in saved) {
            if (typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
                result[key] = this.deepMerge(defaults[key] || {}, saved[key]);
            } else {
                result[key] = saved[key];
            }
        }
        
        return result;
    }
    
    // ============================================
    // CURRENCY METHODS
    // ============================================
    
    /**
     * Add helmets (main currency)
     */
    addHelmets(amount) {
        this.data.currency.helmets += amount;
        this.save();
        console.log(`💰 +${amount} helmets (Total: ${this.data.currency.helmets})`);
        return this.data.currency.helmets;
    }
    
    /**
     * Remove helmets (for purchases)
     */
    removeHelmets(amount) {
        if (this.data.currency.helmets >= amount) {
            this.data.currency.helmets -= amount;
            this.save();
            console.log(`💸 -${amount} helmets (Total: ${this.data.currency.helmets})`);
            return true;
        }
        console.log('❌ Not enough helmets!');
        return false;
    }
    
    /**
     * Check if player can afford something
     */
    canAfford(amount) {
        return this.data.currency.helmets >= amount;
    }
    
    /**
     * Get current helmet count
     */
    getHelmets() {
        return this.data.currency.helmets;
    }
    
    // ============================================
    // COLLECTIBLE TRACKING
    // ============================================
    
    /**
     * Mark a collectible as collected in a specific level
     * Returns false if already collected (prevents double-collection)
     */
    collectItem(levelId, itemId, itemType = 'helmet') {
        // Initialize level progress if needed
        if (!this.data.levelProgress[levelId]) {
            this.data.levelProgress[levelId] = {
                helmetsCollected: [],
                secretsFound: [],
                cratesOpened: []
            };
        }
        
        const level = this.data.levelProgress[levelId];
        const collectionArray = level[`${itemType}sCollected`] || level.helmetsCollected;
        
        // Check if already collected
        if (collectionArray.includes(itemId)) {
            console.log(`⚠️ Item ${itemId} already collected in ${levelId}`);
            return false;
        }
        
        // Add to collected items
        collectionArray.push(itemId);
        this.save();
        
        console.log(`✅ Collected ${itemType} ${itemId} in ${levelId}`);
        return true;
    }
    
    /**
     * Check if an item was already collected in a level
     */
    isItemCollected(levelId, itemId, itemType = 'helmet') {
        if (!this.data.levelProgress[levelId]) return false;
        
        const level = this.data.levelProgress[levelId];
        const collectionArray = level[`${itemType}sCollected`] || level.helmetsCollected;
        
        return collectionArray.includes(itemId);
    }
    
    /**
     * Get completion percentage for a level
     */
    getLevelCompletion(levelId, totalCollectibles) {
        if (!this.data.levelProgress[levelId]) return 0;
        
        const level = this.data.levelProgress[levelId];
        const collected = (level.helmetsCollected?.length || 0) + 
                         (level.secretsFound?.length || 0);
        
        return Math.floor((collected / totalCollectibles) * 100);
    }
    
    // ============================================
    // UNLOCK SYSTEM
    // ============================================
    
    /**
     * Unlock an item (deck, helmet, etc.)
     */
    unlock(category, itemId) {
        if (!this.data.unlocks[category]) {
            this.data.unlocks[category] = [];
        }
        
        if (!this.data.unlocks[category].includes(itemId)) {
            this.data.unlocks[category].push(itemId);
            this.save();
            console.log(`🔓 Unlocked ${category}: ${itemId}`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if an item is unlocked
     */
    isUnlocked(category, itemId) {
        return this.data.unlocks[category]?.includes(itemId) || false;
    }
    
    /**
     * Equip an item (if unlocked)
     */
    equip(category, itemId) {
        if (this.isUnlocked(category + 's', itemId)) {
            this.data.equipped[category] = itemId;
            this.save();
            console.log(`👕 Equipped ${category}: ${itemId}`);
            return true;
        }
        
        console.log(`❌ ${itemId} is not unlocked yet!`);
        return false;
    }
    
    /**
     * Get currently equipped items
     */
    getEquipped() {
        return { ...this.data.equipped };
    }
    
    // ============================================
    // STATS TRACKING
    // ============================================
    
    /**
     * Update a stat
     */
    updateStat(statName, value) {
        if (this.data.stats[statName] !== undefined) {
            this.data.stats[statName] += value;
            this.save();
        }
    }
    
    /**
     * Complete a level
     */
    completeLevel(levelId) {
        if (!this.data.stats.levelsCompleted.includes(levelId)) {
            this.data.stats.levelsCompleted.push(levelId);
            this.save();
            console.log(`🏁 Level completed: ${levelId}`);
        }
    }
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    /**
     * Reset all save data
     */
    reset() {
        this.data = this.getDefaultData();
        this.save();
        console.log('🔄 Save data reset');
    }
    
    /**
     * Export save data as JSON string (for sharing/backup)
     */
    export() {
        return JSON.stringify(this.data, null, 2);
    }
    
    /**
     * Import save data from JSON string
     */
    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.data = this.migrate(imported);
            this.save();
            console.log('📥 Save data imported');
            return true;
        } catch (error) {
            console.error('❌ Failed to import save:', error);
            return false;
        }
    }
}
