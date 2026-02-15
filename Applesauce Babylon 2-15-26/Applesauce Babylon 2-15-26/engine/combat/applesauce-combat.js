/**
 * APPLESAUCE Combat Module
 * Handles weapon attacks, damage, and knockback
 */
import * as THREE from '../three.module.js';

export class ApplesauceCombat {
    constructor(core) {
        this.core = core;
        this.attackCooldown = 0;
        this.isAttacking = false;
        
        console.log('⚔️ Combat module loaded');
    }
    
    /**
     * Main update loop - checks for attacks
     */
    update(core) {
        // Reduce cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        
        // Check for attack input (spacebar or left mouse)
        if ((core.keys[' '] || core.keys['j']) && this.attackCooldown === 0) {
            this.performAttack(core);
        }
        
        // Reset attacking flag
        if (this.isAttacking && this.attackCooldown === 0) {
            this.isAttacking = false;
        }
    }
    
    /**
     * Performs an attack with current weapon
     */
    performAttack(core) {
        // Get current weapon from weapons module
        const weapon = core.modules.weapons?.getCurrentWeapon();
        
        if (!weapon) {
            console.log('⚔️ No weapon equipped');
            return;
        }
        
        console.log(`⚔️ Attacking with ${weapon.name}`);
        
        this.isAttacking = true;
        this.attackCooldown = weapon.cooldown || 30; // Default 30 frames (~0.5 sec)
        
        // Check for hits
        if (core.modules.enemies && core.modules.enemies.enemies) {
            this.checkWeaponHit(
                core.player,
                weapon,
                core.modules.enemies.enemies
            );
        }
    }
    
    /**
     * Checks if weapon hit any enemies
     * @param {Object} player - Player object
     * @param {Object} weapon - Weapon data
     * @param {Array} enemies - Array of enemies
     */
    checkWeaponHit(player, weapon, enemies) {
        if (!player) return;
        
        const attackDirection = {
            x: Math.sin(player.rotation.y),
            z: Math.cos(player.rotation.y)
        };
        
        const attackPoint = {
            x: player.position.x + attackDirection.x * weapon.range,
            z: player.position.z + attackDirection.z * weapon.range
        };
        
        enemies.forEach(enemy => {
            if (enemy.isDead) return; // Skip dead enemies
            
            const distance = Math.sqrt(
                (enemy.position.x - attackPoint.x)**2 +
                (enemy.position.z - attackPoint.z)**2
            );
            
            if (distance < weapon.range) {
                // Calculate angle to ensure enemy is in front
                const toEnemy = {
                    x: enemy.position.x - player.position.x,
                    z: enemy.position.z - player.position.z
                };
                
                const dot = 
                    attackDirection.x * toEnemy.x + 
                    attackDirection.z * toEnemy.z;
                
                const magnitude = Math.sqrt(toEnemy.x**2 + toEnemy.z**2) * 
                                Math.sqrt(attackDirection.x**2 + attackDirection.z**2);
                
                if (magnitude === 0) return; // Avoid division by zero
                
                const angle = Math.acos(dot / magnitude);
                
                // Hit if within 90 degrees (π/2 radians)
                if (angle < Math.PI / 2) {
                    this.dealDamage(enemy, weapon.damage);
                    this.applyKnockback(enemy, attackDirection, weapon.knockback || 1);
                    
                    console.log(`⚔️ Hit enemy! Damage: ${weapon.damage}`);
                }
            }
        });
    }
    
    /**
     * Deals damage to an enemy
     * @param {Object} enemy - Enemy to damage
     * @param {number} damage - Amount of damage
     */
    dealDamage(enemy, damage) {
        enemy.health = (enemy.health || 100) - damage;
        
        if (enemy.health <= 0) {
            enemy.isDead = true;
            console.log('💀 Enemy defeated!');
            
            // Trigger gore if enabled
            if (this.core.modules.gore && enemy.mesh) {
                this.core.modules.gore.createSplatter(
                    enemy.mesh.position.clone(),
                    new THREE.Vector3(0, 0.2, 0)
                );
            }
        }
    }
    
    /**
     * Applies knockback force to target
     * @param {Object} target - Target to knockback
     * @param {Object} direction - Direction vector {x, z}
     * @param {number} force - Knockback strength
     */
    applyKnockback(target, direction, force) {
        const normalizedDir = {
            x: direction.x / Math.sqrt(direction.x**2 + direction.z**2),
            z: direction.z / Math.sqrt(direction.x**2 + direction.z**2)
        };
        
        // Initialize velocity if it doesn't exist
        if (!target.velocity) {
            target.velocity = { x: 0, y: 0, z: 0 };
        }
        
        target.velocity.x += normalizedDir.x * force * 10;
        target.velocity.z += normalizedDir.z * force * 10;
        target.velocity.y += force * 5; // Pop them up
    }
    
    /**
     * Clears combat state
     */
    clear() {
        this.attackCooldown = 0;
        this.isAttacking = false;
        console.log('⚔️ Combat cleared');
    }
}
