# QUICK INTEGRATION REFERENCE

## What Gets Added:

### 1. **Systems Added (before PlayerController class)**
- `InventorySystem` - Tracks items and coins
- `LootDropManager` - Creates loot drops with physics
- `MerchantShop` - GUI shop interface
- `MerchantShack` - Physical building with Havok physics

### 2. **Game Class Properties Added**
```javascript
this.inventory = null;
this.lootManager = null;
this.merchantShack = null;
this.merchantShop = null;
```

### 3. **Key Integration Points**

**Enemy Death:**
```javascript
die() {
    this.scene.lootManager.spawnLoot(this.mesh.position.clone(), 'zombie');
    // ... existing death code
}
```

**Game Update Loop:**
```javascript
update(deltaTime) {
    // ... existing updates
    this.lootManager.checkPickup(this.camera.position, 2.5);
    
    const nearMerchant = this.merchantShack.checkPlayerProximity(this.camera.position);
    document.getElementById('interaction-prompt').style.display = nearMerchant ? 'block' : 'none';
}
```

**Keyboard Handler:**
```javascript
if (e.key === 'e' || e.key === 'E') {
    if (this.merchantShack.checkPlayerProximity(this.camera.position)) {
        this.merchantShop.openShop();
    }
}
```

**Scene Init:**
```javascript
this.inventory = new InventorySystem();
this.lootManager = new LootDropManager(this.scene, this.inventory);
this.scene.lootManager = this.lootManager; // Make accessible to enemies

const shackPosition = new BABYLON.Vector3(20, 0, 0);
this.merchantShack = new MerchantShack(this.scene, shackPosition);

const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
this.merchantShop = new MerchantShop(this.scene, this.inventory, advancedTexture);
```

## New UI Elements:
- Currency display (top left, below health)
- Loot pickup notifications (right side)
- Merchant interaction prompt (bottom center)

## Testing:
- **Test Loot:** Spawn menu → "Test Loot Drop"
- **Add Coins:** Spawn menu → "+100 Coins"
- **Open Shop:** Walk to shack (20,0,0), press **E**
- **Collapse Shack:** Press **C** for physics destruction test

## Loot Tables:
- **Zombies:** Drop scrap metal, energy cells, weapons (10-30 coins)
- **Ragdolls:** Drop better loot, void essence (20-50 coins)

## Core Loop:
Kill → Loot Drops → Auto-Pickup → Sell at Shop → Buy Better Gear → Repeat
