const GearTemplate = {
    helmet: {
        name: "Gore-Spattered Helmet",
        defense: 5,
        specialBonus: {
            type: "health_regen",
            value: 1 // HP per second
        },
        visualMesh: "helmet_gore_01"
    },
    
    jacket: {
        name: "Skate Punk Jacket",
        defense: 8,
        specialBonus: {
            type: "speed_boost",
            value: 1.2 // 20% faster
        },
        visualMesh: "jacket_punk_01"
    },
    
    board: {
        name: "Demon Deck",
        trickPower: 1.5,
        specialBonus: {
            type: "air_control",
            value: 2.0 // Better mid-air steering
        },
        visualMesh: "board_demon_01"
    }
};

// Calculate total player stats
function calculatePlayerStats(player, equipped) {
    let stats = {
        defense: 0,
        speed: 1.0,
        trickPower: 1.0,
        healthRegen: 0,
        airControl: 1.0
    };
    
    Object.values(equipped).forEach(gear => {
        if (!gear) return;
        
        stats.defense += gear.defense || 0;
        
        if (gear.specialBonus) {
            switch(gear.specialBonus.type) {
                case "speed_boost":
                    stats.speed *= gear.specialBonus.value;
                    break;
                case "health_regen":
                    stats.healthRegen += gear.specialBonus.value;
                    break;
                case "air_control":
                    stats.airControl *= gear.specialBonus.value;
                    break;
                case "trick_power":
                    stats.trickPower *= gear.specialBonus.value;
                    break;
            }
        }
    });
    
    return stats;
}

// Damage reduction calculation
function calculateDamageReduction(incomingDamage, defense) {
    // Asymptotic defense curve
    const damageMultiplier = 100 / (100 + defense);
    return incomingDamage * damageMultiplier;
}