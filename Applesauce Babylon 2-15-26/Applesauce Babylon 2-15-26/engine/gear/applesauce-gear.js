/**
 * APPLESAUCE Gear System v1.0
 * Complete equipment system with visual representation
 * Affects both player stats AND weapon stats
 * Supports custom gear loading from localStorage
 * 
 * GEAR SLOTS:
 * - Helmet: Defense, Health Regen
 * - Jacket: Speed, Armor
 * - Pants: Stamina, Movement
 * - Shoes: Jump, Agility
 * - Skateboard: Trick Power, Control
 * - Weapon: Damage, Cooldown, Special Effects
 */

export class ApplesauceGear {
    constructor(core) {
        this.core = core;
        
        // Equipment slots
        this.equipped = {
            helmet: null,
            jacket: null,
            pants: null,
            shoes: null,
            skateboard: null,
            weapon: null
        };
        
        // Visual meshes for equipped gear
        this.visuals = {
            helmet: null,
            jacket: null,
            pants: null,
            shoes: null,
            skateboard: null,
            weapon: null
        };
        
        // Calculated stats from all gear
        this.stats = {
            // Player stats
            defense: 0,
            speed: 1.0,
            healthRegen: 0,
            jumpPower: 1.0,
            stamina: 1.0,
            airControl: 1.0,
            
            // Trick stats
            trickPower: 1.0,
            grindBonus: 1.0,
            
            // Weapon stats
            weaponDamage: 1.0,
            weaponCooldown: 1.0,  // Multiplier (lower = faster)
            weaponRange: 1.0,
            weaponSpeed: 1.0,
            critChance: 0,
            lifesteal: 0
        };
        
        // Gear loaders for custom gear
        this.loaders = {
            helmet: null,
            jacket: null,
            pants: null,
            shoes: null,
            skateboard: null,
            weapon: null
        };
        
        // Set bonuses (when wearing multiple pieces from same set)
        this.sets = {};
        this.activeSetBonuses = [];
        
        console.log('👕 Gear system loaded');
    }
    
    // ===================================
    // INITIALIZATION
    // ===================================
    
    init() {
        // Load default gear
        this.equipDefaultGear();
        
        // Try to load custom gear from localStorage
        this.loadCustomGear();
        
        // Recalculate all stats
        this.recalculateStats();
        
        console.log('👕 Gear initialized');
    }
    
    // ===================================
    // GEAR LIBRARY
    // ===================================
    
    /**
     * Create gear from template
     */
    createGear(type, itemName) {
        const library = this.getGearLibrary();
        
        if (!library[type] || !library[type][itemName]) {
            console.warn(`Gear not found: ${type}.${itemName}`);
            return null;
        }
        
        return { ...library[type][itemName] };
    }
    
    /**
     * Gear library with all available items
     */
    getGearLibrary() {
        return {
            helmet: {
                // Basic helmets
                basic: {
                    name: "Basic Helmet",
                    defense: 5,
                    bonuses: {},
                    visual: "helmet_basic"
                },
                
                gore_spattered: {
                    name: "Gore-Spattered Helmet",
                    defense: 8,
                    bonuses: {
                        healthRegen: 1  // 1 HP/sec
                    },
                    visual: "helmet_gore",
                    setName: "Demon Slayer"
                },
                
                speed_demon: {
                    name: "Speed Demon Helmet",
                    defense: 6,
                    bonuses: {
                        speed: 1.15,  // 15% faster
                        airControl: 1.2
                    },
                    visual: "helmet_speed",
                    setName: "Velocity"
                },
                
                tank: {
                    name: "Tank Helmet",
                    defense: 15,
                    bonuses: {
                        defense: 10  // Extra defense
                    },
                    visual: "helmet_tank",
                    setName: "Fortress"
                },
                
                assassin: {
                    name: "Assassin's Hood",
                    defense: 4,
                    bonuses: {
                        critChance: 25,  // 25% crit chance
                        weaponDamage: 1.1
                    },
                    visual: "helmet_assassin",
                    setName: "Shadow Strike"
                }
            },
            
            jacket: {
                basic: {
                    name: "Basic Jacket",
                    defense: 10,
                    bonuses: {},
                    visual: "jacket_basic"
                },
                
                skate_punk: {
                    name: "Skate Punk Jacket",
                    defense: 12,
                    bonuses: {
                        speed: 1.2,  // 20% faster
                        trickPower: 1.15
                    },
                    visual: "jacket_punk",
                    setName: "Velocity"
                },
                
                demon_hunter: {
                    name: "Demon Hunter Coat",
                    defense: 15,
                    bonuses: {
                        weaponDamage: 1.25,  // 25% more damage
                        lifesteal: 10  // 10% lifesteal
                    },
                    visual: "jacket_demon",
                    setName: "Demon Slayer"
                },
                
                armor_plated: {
                    name: "Armor-Plated Jacket",
                    defense: 25,
                    bonuses: {
                        defense: 15
                    },
                    visual: "jacket_armor",
                    setName: "Fortress"
                },
                
                shadow_cloak: {
                    name: "Shadow Cloak",
                    defense: 8,
                    bonuses: {
                        critChance: 15,
                        weaponCooldown: 0.85  // 15% faster attacks
                    },
                    visual: "jacket_shadow",
                    setName: "Shadow Strike"
                }
            },
            
            pants: {
                basic: {
                    name: "Basic Pants",
                    defense: 8,
                    bonuses: {},
                    visual: "pants_basic"
                },
                
                cargo: {
                    name: "Cargo Pants",
                    defense: 10,
                    bonuses: {
                        stamina: 1.3,  // 30% more stamina
                        jumpPower: 1.1
                    },
                    visual: "pants_cargo",
                    setName: "Velocity"
                },
                
                reinforced: {
                    name: "Reinforced Leggings",
                    defense: 20,
                    bonuses: {
                        defense: 8
                    },
                    visual: "pants_reinforced",
                    setName: "Fortress"
                },
                
                hunter: {
                    name: "Hunter's Leggings",
                    defense: 12,
                    bonuses: {
                        weaponRange: 1.2,  // 20% more range
                        speed: 1.1
                    },
                    visual: "pants_hunter",
                    setName: "Demon Slayer"
                },
                
                ninja: {
                    name: "Ninja Pants",
                    defense: 6,
                    bonuses: {
                        speed: 1.25,
                        critChance: 10
                    },
                    visual: "pants_ninja",
                    setName: "Shadow Strike"
                }
            },
            
            shoes: {
                basic: {
                    name: "Basic Sneakers",
                    defense: 4,
                    bonuses: {},
                    visual: "shoes_basic"
                },
                
                air_max: {
                    name: "Air Max Pro",
                    defense: 5,
                    bonuses: {
                        jumpPower: 1.4,  // 40% higher jumps
                        airControl: 1.3
                    },
                    visual: "shoes_airmax",
                    setName: "Velocity"
                },
                
                steel_toe: {
                    name: "Steel-Toe Boots",
                    defense: 12,
                    bonuses: {
                        defense: 5,
                        grindBonus: 1.2
                    },
                    visual: "shoes_steel",
                    setName: "Fortress"
                },
                
                demon_steps: {
                    name: "Demon Steps",
                    defense: 6,
                    bonuses: {
                        speed: 1.15,
                        weaponSpeed: 1.2  // Projectiles move faster
                    },
                    visual: "shoes_demon",
                    setName: "Demon Slayer"
                },
                
                shadow_walkers: {
                    name: "Shadow Walkers",
                    defense: 4,
                    bonuses: {
                        speed: 1.2,
                        critChance: 20
                    },
                    visual: "shoes_shadow",
                    setName: "Shadow Strike"
                }
            },
            
            skateboard: {
                basic: {
                    name: "Basic Board",
                    defense: 0,
                    bonuses: {
                        trickPower: 1.0
                    },
                    visual: "board_basic"
                },
                
                demon_deck: {
                    name: "Demon Deck",
                    defense: 2,
                    bonuses: {
                        trickPower: 1.5,  // 50% better tricks
                        airControl: 2.0,
                        grindBonus: 1.3
                    },
                    visual: "board_demon",
                    setName: "Demon Slayer"
                },
                
                speed_runner: {
                    name: "Speed Runner",
                    defense: 1,
                    bonuses: {
                        speed: 1.3,  // 30% faster
                        trickPower: 1.2
                    },
                    visual: "board_speed",
                    setName: "Velocity"
                },
                
                tank_board: {
                    name: "Tank Board",
                    defense: 8,
                    bonuses: {
                        defense: 12,
                        trickPower: 0.9  // Slower tricks but tankier
                    },
                    visual: "board_tank",
                    setName: "Fortress"
                },
                
                assassin_blade: {
                    name: "Assassin's Blade",
                    defense: 1,
                    bonuses: {
                        critChance: 30,
                        weaponDamage: 1.2,
                        trickPower: 1.3
                    },
                    visual: "board_assassin",
                    setName: "Shadow Strike"
                }
            },
            
            weapon: {
                // These enhance the weapon module's weapons
                basic_enchant: {
                    name: "Basic Enchantment",
                    defense: 0,
                    bonuses: {
                        weaponDamage: 1.1
                    },
                    visual: null
                },
                
                fire_rune: {
                    name: "Fire Rune",
                    defense: 0,
                    bonuses: {
                        weaponDamage: 1.3,
                        weaponSpeed: 1.2  // Projectiles faster
                    },
                    visual: "rune_fire",
                    effect: "fire_trail"  // Visual effect on projectiles
                },
                
                ice_rune: {
                    name: "Ice Rune",
                    defense: 0,
                    bonuses: {
                        weaponDamage: 1.2,
                        weaponCooldown: 0.7  // 30% faster attacks
                    },
                    visual: "rune_ice",
                    effect: "ice_trail"
                },
                
                lightning_rune: {
                    name: "Lightning Rune",
                    defense: 0,
                    bonuses: {
                        weaponDamage: 1.4,
                        critChance: 25,
                        weaponSpeed: 1.5
                    },
                    visual: "rune_lightning",
                    effect: "lightning_trail"
                },
                
                vampire_rune: {
                    name: "Vampire Rune",
                    defense: 0,
                    bonuses: {
                        lifesteal: 25,  // 25% lifesteal
                        weaponDamage: 1.15
                    },
                    visual: "rune_vampire",
                    effect: "blood_trail"
                }
            }
        };
    }
    
    /**
     * Get set bonuses
     */
    getSetBonuses() {
        return {
            "Demon Slayer": {
                2: { weaponDamage: 1.15, healthRegen: 2 },
                3: { weaponDamage: 1.25, healthRegen: 4, lifesteal: 15 },
                4: { weaponDamage: 1.4, healthRegen: 8, lifesteal: 25 },
                5: { weaponDamage: 1.6, healthRegen: 12, lifesteal: 35, critChance: 15 }
            },
            
            "Velocity": {
                2: { speed: 1.15, airControl: 1.2 },
                3: { speed: 1.25, airControl: 1.4, trickPower: 1.2 },
                4: { speed: 1.4, airControl: 1.6, trickPower: 1.35 },
                5: { speed: 1.6, airControl: 2.0, trickPower: 1.5, jumpPower: 1.5 }
            },
            
            "Fortress": {
                2: { defense: 15 },
                3: { defense: 30, healthRegen: 3 },
                4: { defense: 50, healthRegen: 6 },
                5: { defense: 75, healthRegen: 10, weaponDamage: 1.2 }
            },
            
            "Shadow Strike": {
                2: { critChance: 15, weaponCooldown: 0.9 },
                3: { critChance: 25, weaponCooldown: 0.8, weaponDamage: 1.2 },
                4: { critChance: 40, weaponCooldown: 0.7, weaponDamage: 1.35 },
                5: { critChance: 60, weaponCooldown: 0.6, weaponDamage: 1.5, speed: 1.2 }
            }
        };
    }
    
    // ===================================
    // EQUIPPING GEAR
    // ===================================
    
    /**
     * Equip a piece of gear
     */
    equip(slot, gearData) {
        if (!this.equipped.hasOwnProperty(slot)) {
            console.error(`Invalid gear slot: ${slot}`);
            return false;
        }
        
        // Unequip current gear in slot
        if (this.equipped[slot]) {
            this.unequip(slot);
        }
        
        // Equip new gear
        this.equipped[slot] = gearData;
        
        // Create visual if specified
        if (gearData.visual && this.core.player) {
            this.attachVisual(slot, gearData);
        }
        
        // Recalculate all stats
        this.recalculateStats();
        
        // Apply to player and weapons
        this.applyStatsToModules();
        
        console.log(`✅ Equipped: ${gearData.name}`);
        return true;
    }
    
    /**
     * Equip gear by name from library
     */
    equipByName(slot, itemName) {
        const gear = this.createGear(slot, itemName);
        if (gear) {
            return this.equip(slot, gear);
        }
        return false;
    }
    
    /**
     * Unequip gear from slot
     */
    unequip(slot) {
        if (!this.equipped[slot]) return;
        
        console.log(`🗑️ Unequipped: ${this.equipped[slot].name}`);
        
        // Remove visual
        if (this.visuals[slot]) {
            this.core.player.remove(this.visuals[slot]);
            this.visuals[slot] = null;
        }
        
        // Clear slot
        this.equipped[slot] = null;
        
        // Recalculate stats
        this.recalculateStats();
        this.applyStatsToModules();
    }
    
    /**
     * Equip default gear set
     */
    equipDefaultGear() {
        this.equipByName('helmet', 'basic');
        this.equipByName('jacket', 'basic');
        this.equipByName('pants', 'basic');
        this.equipByName('shoes', 'basic');
        this.equipByName('skateboard', 'basic');
    }
    
    // ===================================
    // STAT CALCULATION
    // ===================================
    
    /**
     * Recalculate all stats from equipped gear
     */
    recalculateStats() {
        // Reset to base
        this.stats = {
            defense: 0,
            speed: 1.0,
            healthRegen: 0,
            jumpPower: 1.0,
            stamina: 1.0,
            airControl: 1.0,
            trickPower: 1.0,
            grindBonus: 1.0,
            weaponDamage: 1.0,
            weaponCooldown: 1.0,
            weaponRange: 1.0,
            weaponSpeed: 1.0,
            critChance: 0,
            lifesteal: 0
        };
        
        // Apply bonuses from each piece
        Object.values(this.equipped).forEach(gear => {
            if (!gear) return;
            
            // Add defense
            if (gear.defense) {
                this.stats.defense += gear.defense;
            }
            
            // Apply bonuses
            if (gear.bonuses) {
                Object.entries(gear.bonuses).forEach(([stat, value]) => {
                    if (this.stats.hasOwnProperty(stat)) {
                        // Multiplicative stats (multiply)
                        if (['speed', 'trickPower', 'jumpPower', 'airControl', 
                             'grindBonus', 'weaponDamage', 'weaponCooldown', 
                             'weaponRange', 'weaponSpeed', 'stamina'].includes(stat)) {
                            this.stats[stat] *= value;
                        }
                        // Additive stats (add)
                        else {
                            this.stats[stat] += value;
                        }
                    }
                });
            }
        });
        
        // Calculate and apply set bonuses
        this.calculateSetBonuses();
        
        console.log('📊 Stats recalculated:', this.stats);
    }
    
    /**
     * Calculate set bonuses from equipped gear
     */
    calculateSetBonuses() {
        // Count pieces per set
        const setCounts = {};
        
        Object.values(this.equipped).forEach(gear => {
            if (gear && gear.setName) {
                setCounts[gear.setName] = (setCounts[gear.setName] || 0) + 1;
            }
        });
        
        // Apply set bonuses
        this.activeSetBonuses = [];
        const setBonuses = this.getSetBonuses();
        
        Object.entries(setCounts).forEach(([setName, count]) => {
            if (!setBonuses[setName]) return;
            
            // Apply bonuses for each threshold met
            Object.entries(setBonuses[setName]).forEach(([threshold, bonuses]) => {
                if (count >= parseInt(threshold)) {
                    this.activeSetBonuses.push({
                        set: setName,
                        pieces: threshold,
                        bonuses: bonuses
                    });
                    
                    // Apply bonuses
                    Object.entries(bonuses).forEach(([stat, value]) => {
                        if (this.stats.hasOwnProperty(stat)) {
                            if (['speed', 'trickPower', 'jumpPower', 'airControl', 
                                 'grindBonus', 'weaponDamage', 'weaponCooldown', 
                                 'weaponRange', 'weaponSpeed', 'stamina'].includes(stat)) {
                                this.stats[stat] *= value;
                            } else {
                                this.stats[stat] += value;
                            }
                        }
                    });
                }
            });
        });
        
        if (this.activeSetBonuses.length > 0) {
            console.log('🎁 Set bonuses active:', this.activeSetBonuses);
        }
    }
    
    /**
     * Apply calculated stats to other modules
     */
    applyStatsToModules() {
        // Apply to player
        if (this.core.state) {
            this.core.state.maxSpeed *= this.stats.speed;
            this.core.state.jumpPower = (this.core.state.jumpPower || 1.0) * this.stats.jumpPower;
            // Add other player stats as needed
        }
        
        // Apply to weapons
        if (this.core.modules.weapons) {
            this.applyWeaponStats();
        }
        
        console.log('✅ Stats applied to modules');
    }
    
    /**
     * Apply gear stats to weapons
     */
    applyWeaponStats() {
        const weapons = this.core.modules.weapons;
        if (!weapons) return;
        
        // Modify equipped weapons
        ['primary', 'secondary', 'melee'].forEach(slot => {
            const weapon = weapons.equipped[slot];
            if (!weapon) return;
            
            // Apply damage multiplier
            if (weapon.damage) {
                weapon.modifiedDamage = weapon.damage * this.stats.weaponDamage;
            }
            
            // Apply cooldown multiplier
            if (weapon.cooldown) {
                weapon.modifiedCooldown = Math.floor(weapon.cooldown * this.stats.weaponCooldown);
            }
            
            // Apply range multiplier
            if (weapon.range) {
                weapon.modifiedRange = weapon.range * this.stats.weaponRange;
            }
            
            // Apply speed multiplier
            if (weapon.speed) {
                weapon.modifiedSpeed = weapon.speed * this.stats.weaponSpeed;
            }
            
            // Add crit chance
            weapon.critChance = this.stats.critChance;
            
            // Add lifesteal
            weapon.lifesteal = this.stats.lifesteal;
        });
        
        console.log('⚔️ Weapon stats modified by gear');
    }
    
    // ===================================
    // VISUAL ATTACHMENT
    // ===================================
    
    /**
     * Attach visual mesh to player
     */
    attachVisual(slot, gearData) {
        // This is a placeholder - you'd implement actual mesh creation
        // based on the visual string
        
        // For now, just log
        console.log(`🎨 Would create visual: ${gearData.visual}`);
        
        // You could integrate with your HelmetLoader pattern here
        if (slot === 'helmet' && this.loaders.helmet) {
            // Use custom loader
            this.loaders.helmet.loadHelmet();
        }
        
        // Or create simple placeholder mesh
        // this.visuals[slot] = this.createPlaceholderMesh(slot, gearData);
    }
    
    // ===================================
    // CUSTOM GEAR LOADING
    // ===================================
    
    /**
     * Load custom gear from localStorage
     */
    loadCustomGear() {
        Object.keys(this.equipped).forEach(slot => {
            const customGear = this.loadCustomGearFromStorage(slot);
            if (customGear) {
                this.equip(slot, customGear);
            }
        });
    }
    
    /**
     * Load specific gear from localStorage
     */
    loadCustomGearFromStorage(slot) {
        try {
            const activeSlot = localStorage.getItem(`active_${slot}_slot`) || '1';
            const saved = localStorage.getItem(`${slot}_slot_${activeSlot}`);
            
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error(`Failed to load custom ${slot}:`, error);
        }
        
        return null;
    }
    
    /**
     * Initialize gear loader for a slot
     */
    initializeLoader(slot, LoaderClass) {
        if (!this.core.player) {
            console.warn('Cannot initialize loader without player object');
            return;
        }
        
        this.loaders[slot] = new LoaderClass(
            this.core.scene,
            this.core.player
        );
        
        this.loaders[slot].loadHelmet(); // Or loadGear() for generic
        
        console.log(`🔧 Initialized ${slot} loader`);
    }
    
    // ===================================
    // UTILITIES
    // ===================================
    
    /**
     * Get current total stats
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Get equipped gear list
     */
    getEquipped() {
        const list = {};
        Object.entries(this.equipped).forEach(([slot, gear]) => {
            list[slot] = gear ? gear.name : 'None';
        });
        return list;
    }
    
    /**
     * Get active set bonuses
     */
    getSetBonusInfo() {
        return this.activeSetBonuses.map(bonus => ({
            set: bonus.set,
            pieces: bonus.pieces,
            bonuses: Object.entries(bonus.bonuses).map(([stat, value]) => 
                `${stat}: ${value > 1 ? `×${value}` : `+${value}`}`
            ).join(', ')
        }));
    }
    
    /**
     * Damage reduction calculation
     */
    calculateDamageReduction(incomingDamage) {
        // Asymptotic defense curve
        const damageMultiplier = 100 / (100 + this.stats.defense);
        return incomingDamage * damageMultiplier;
    }
    
    /**
     * Clear all gear
     */
    clear() {
        Object.keys(this.equipped).forEach(slot => {
            this.unequip(slot);
        });
        
        console.log('👕 All gear cleared');
    }
}
