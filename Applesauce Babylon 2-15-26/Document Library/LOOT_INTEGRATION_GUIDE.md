# TREATY OF THE WATCHTOWER - LOOT & ECONOMY INTEGRATION GUIDE

This guide shows you exactly where to paste code into your existing `watchtower_modular_main_UPDATED.html` file.

## STEP 1: Add Currency Display to HTML (line ~110)

**FIND** (around line 110, after the #health-container style):
```css
#health-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: bold;
    text-shadow: 2px 2px 4px #000;
}
```

**ADD AFTER**:
```css
/* CURRENCY UI */
#currency-container {
    position: absolute;
    top: 60px;
    left: 20px;
    background: rgba(0,0,0,0.7);
    padding: 8px 15px;
    border: 2px solid #ffd700;
    border-radius: 4px;
}

#currency-display {
    color: #ffd700;
    font-size: 20px;
    font-weight: bold;
    text-shadow: 2px 2px 4px #000;
}

/* INTERACTION PROMPT */
#interaction-prompt {
    position: absolute;
    bottom: 150px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.9);
    color: #ffff00;
    padding: 12px 24px;
    border: 2px solid #ffff00;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    text-shadow: 2px 2px 4px #000;
    display: none;
    z-index: 200;
}

/* LOOT PICKUP NOTIFICATION */
#loot-notifications {
    position: absolute;
    top: 50%;
    right: 30px;
    transform: translateY(-50%);
    text-align: right;
    pointer-events: none;
    z-index: 150;
}

.loot-notification {
    background: rgba(0,0,0,0.8);
    padding: 8px 12px;
    margin: 5px 0;
    border-left: 3px solid #0f0;
    animation: slideIn 0.3s, fadeOut 0.3s 2.7s;
    font-size: 14px;
    text-shadow: 1px 1px 2px #000;
}

@keyframes slideIn {
    from {
        transform: translateX(100px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}
```

## STEP 2: Add UI Elements to HTML Body (line ~246)

**FIND** (around line 246, after `<div id="kick-indicator">KICK!</div>`):

**ADD AFTER**:
```html
<div id="interaction-prompt">Press E to open shop</div>

<!-- Currency Display -->
<div id="currency-container">
    <div id="currency-display">💰 0</div>
</div>

<!-- Loot Notifications -->
<div id="loot-notifications"></div>
```

## STEP 3: Update Stats Section (line ~260)

**FIND**:
```html
<div id="stats">
    <div>Enemies: <span id="enemy-count">0</span></div>
    ...
</div>
```

**CHANGE** the position in CSS from `top: 80px` to `top: 130px` to make room for currency.

## STEP 4: Update Spawn Menu (line ~275)

**FIND** the last section in spawn menu (before "Clear All"):

**ADD BEFORE** the Clear All section:
```html
<div class="menu-section">
    <div class="menu-title">ECONOMY TEST</div>
    <button class="spawn-btn" onclick="game.addCoins(100)">+100 Coins</button>
    <button class="spawn-btn" onclick="game.testLootDrop()">Test Loot Drop</button>
</div>
```

## STEP 5: Update Controls Display (line ~300)

**FIND**:
```html
WASD - Move | Mouse - Look | LMB - Attack<br>
F - Kick | R - Reload
```

**CHANGE TO**:
```html
WASD - Move | Mouse - Look | LMB - Attack<br>
F - Kick | R - Reload | E - Interact with Shop<br>
Shift - Sprint | Space - Jump
```

## STEP 6: Add Item Definitions (line ~320, AFTER the <script> tag but BEFORE PlayerController)

**ADD THIS ENTIRE BLOCK**:

```javascript
// ==========================================
// ITEM DEFINITIONS & LOOT TABLES
// ==========================================

const ItemTypes = {
    WEAPON: 'weapon',
    CONSUMABLE: 'consumable',
    MATERIAL: 'material'
};

const ItemRarity = {
    COMMON: { name: 'Common', color: '#ffffff', glow: 0.3 },
    UNCOMMON: { name: 'Uncommon', color: '#1eff00', glow: 0.5 },
    RARE: { name: 'Rare', color: '#0070dd', glow: 0.7 },
    EPIC: { name: 'Epic', color: '#a335ee', glow: 0.9 },
    LEGENDARY: { name: 'Legendary', color: '#ff8000', glow: 1.2 }
};

const ITEMS = {
    'scrap_metal': {
        id: 'scrap_metal',
        name: 'Scrap Metal',
        type: ItemTypes.MATERIAL,
        rarity: ItemRarity.COMMON,
        buyPrice: 5,
        sellPrice: 2,
        description: 'Twisted fragments'
    },
    'energy_cell': {
        id: 'energy_cell',
        name: 'Energy Cell',
        type: ItemTypes.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        buyPrice: 25,
        sellPrice: 10,
        description: 'Still charged'
    },
    'void_essence': {
        id: 'void_essence',
        name: 'Void Essence',
        type: ItemTypes.MATERIAL,
        rarity: ItemRarity.RARE,
        buyPrice: 150,
        sellPrice: 60,
        description: 'Crystallized darkness'
    },
    'rusty_pistol': {
        id: 'rusty_pistol',
        name: 'Rusty Pistol',
        type: ItemTypes.WEAPON,
        rarity: ItemRarity.COMMON,
        damage: 10,
        buyPrice: 50,
        sellPrice: 20
    },
    'combat_rifle': {
        id: 'combat_rifle',
        name: 'Combat Rifle',
        type: ItemTypes.WEAPON,
        rarity: ItemRarity.UNCOMMON,
        damage: 25,
        buyPrice: 200,
        sellPrice: 80
    },
    'plasma_cannon': {
        id: 'plasma_cannon',
        name: 'Plasma Cannon',
        type: ItemTypes.WEAPON,
        rarity: ItemRarity.RARE,
        damage: 50,
        buyPrice: 800,
        sellPrice: 320
    },
    'health_pack': {
        id: 'health_pack',
        name: 'Health Pack',
        type: ItemTypes.CONSUMABLE,
        rarity: ItemRarity.COMMON,
        healAmount: 50,
        buyPrice: 30,
        sellPrice: 10
    }
};

// Enemy loot tables
const ENEMY_LOOT_TABLES = {
    'zombie': {
        possibleDrops: [
            { itemId: 'scrap_metal', chance: 0.7, quantity: [1, 2] },
            { itemId: 'energy_cell', chance: 0.3, quantity: [1, 1] },
            { itemId: 'rusty_pistol', chance: 0.1, quantity: [1, 1] },
            { itemId: 'health_pack', chance: 0.2, quantity: [1, 1] }
        ],
        coinDrop: [10, 30]
    },
    'ragdoll': {
        possibleDrops: [
            { itemId: 'scrap_metal', chance: 0.5, quantity: [2, 3] },
            { itemId: 'energy_cell', chance: 0.5, quantity: [1, 2] },
            { itemId: 'void_essence', chance: 0.2, quantity: [1, 1] },
            { itemId: 'combat_rifle', chance: 0.15, quantity: [1, 1] }
        ],
        coinDrop: [20, 50]
    }
};

// ==========================================
// INVENTORY SYSTEM
// ==========================================

class InventorySystem {
    constructor() {
        this.items = new Map();
        this.currency = 100; // Starting coins
        this.maxStackSize = 99;
    }

    addItem(itemId, quantity = 1) {
        const current = this.items.get(itemId) || 0;
        this.items.set(itemId, Math.min(current + quantity, this.maxStackSize));
        return true;
    }

    removeItem(itemId, quantity = 1) {
        const current = this.items.get(itemId) || 0;
        if (current >= quantity) {
            const newAmount = current - quantity;
            if (newAmount === 0) {
                this.items.delete(itemId);
            } else {
                this.items.set(itemId, newAmount);
            }
            return true;
        }
        return false;
    }

    hasItem(itemId, quantity = 1) {
        return (this.items.get(itemId) || 0) >= quantity;
    }

    addCurrency(amount) {
        this.currency += amount;
        this.updateUI();
    }

    removeCurrency(amount) {
        if (this.currency >= amount) {
            this.currency -= amount;
            this.updateUI();
            return true;
        }
        return false;
    }

    getInventoryList() {
        const list = [];
        this.items.forEach((quantity, itemId) => {
            list.push({ item: ITEMS[itemId], quantity });
        });
        return list;
    }

    updateUI() {
        document.getElementById('currency-display').textContent = `💰 ${this.currency}`;
    }
}

// ==========================================
// LOOT DROP MANAGER
// ==========================================

class LootDropManager {
    constructor(scene, inventory) {
        this.scene = scene;
        this.inventory = inventory;
        this.droppedItems = [];
        this.glowLayer = new BABYLON.GlowLayer("lootGlow", this.scene);
    }

    rollLoot(enemyType) {
        const lootTable = ENEMY_LOOT_TABLES[enemyType];
        if (!lootTable) return { items: [], coins: 0 };

        const drops = [];
        
        lootTable.possibleDrops.forEach(drop => {
            if (Math.random() < drop.chance) {
                const quantity = Math.floor(
                    Math.random() * (drop.quantity[1] - drop.quantity[0] + 1) + drop.quantity[0]
                );
                drops.push({ itemId: drop.itemId, quantity });
            }
        });

        const coins = Math.floor(
            Math.random() * (lootTable.coinDrop[1] - lootTable.coinDrop[0] + 1) + lootTable.coinDrop[0]
        );

        return { items: drops, coins };
    }

    spawnLoot(position, enemyType) {
        const loot = this.rollLoot(enemyType);
        
        loot.items.forEach((drop) => {
            const item = ITEMS[drop.itemId];
            const lootMesh = this.createLootMesh(item, drop.quantity);
            
            const offset = new BABYLON.Vector3(
                (Math.random() - 0.5) * 2,
                0.5,
                (Math.random() - 0.5) * 2
            );
            lootMesh.position = position.add(offset);
            
            if (lootMesh.physicsBody) {
                const impulse = new BABYLON.Vector3(
                    (Math.random() - 0.5) * 5,
                    Math.random() * 3 + 2,
                    (Math.random() - 0.5) * 5
                );
                lootMesh.physicsBody.applyImpulse(impulse, lootMesh.position);
            }
            
            this.droppedItems.push({
                mesh: lootMesh,
                itemId: drop.itemId,
                quantity: drop.quantity
            });
        });

        if (loot.coins > 0) {
            const coinMesh = this.createCoinMesh(loot.coins);
            coinMesh.position = position.clone();
            coinMesh.position.y = 0.5;
            
            this.droppedItems.push({
                mesh: coinMesh,
                coins: loot.coins
            });
        }

        return loot;
    }

    createLootMesh(item, quantity) {
        const mesh = BABYLON.MeshBuilder.CreateBox(
            `loot_${item.id}_${Date.now()}`,
            { size: 0.4 },
            this.scene
        );

        const material = new BABYLON.StandardMaterial(`lootMat_${item.id}`, this.scene);
        material.emissiveColor = BABYLON.Color3.FromHexString(item.rarity.color);
        material.diffuseColor = BABYLON.Color3.FromHexString(item.rarity.color);
        mesh.material = material;

        this.glowLayer.addIncludedOnlyMesh(mesh);
        this.glowLayer.intensity = item.rarity.glow;

        const physicsBody = new BABYLON.PhysicsBody(
            mesh,
            BABYLON.PhysicsMotionType.DYNAMIC,
            false,
            this.scene
        );
        const physicsShape = new BABYLON.PhysicsShapeBox(
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Quaternion(0, 0, 0, 1),
            new BABYLON.Vector3(0.4, 0.4, 0.4),
            this.scene
        );
        physicsShape.material = { friction: 0.5, restitution: 0.3 };
        physicsBody.shape = physicsShape;
        physicsBody.setMassProperties({ mass: 0.5 });
        mesh.physicsBody = physicsBody;

        mesh.rotationAnimation = 0;
        this.scene.registerBeforeRender(() => {
            if (mesh && !mesh.isDisposed()) {
                mesh.rotationAnimation += 0.02;
                mesh.rotation.y = mesh.rotationAnimation;
            }
        });

        return mesh;
    }

    createCoinMesh(amount) {
        const mesh = BABYLON.MeshBuilder.CreateCylinder(
            `coins_${Date.now()}`,
            { diameter: 0.3, height: 0.1 },
            this.scene
        );

        const material = new BABYLON.StandardMaterial("coinMat", this.scene);
        material.emissiveColor = new BABYLON.Color3(1, 0.84, 0);
        material.diffuseColor = new BABYLON.Color3(1, 0.84, 0);
        mesh.material = material;

        this.glowLayer.addIncludedOnlyMesh(mesh);

        return mesh;
    }

    checkPickup(playerPosition, pickupRadius = 2) {
        const pickedUp = [];
        
        this.droppedItems = this.droppedItems.filter(drop => {
            if (!drop.mesh || drop.mesh.isDisposed()) return false;
            
            const distance = BABYLON.Vector3.Distance(playerPosition, drop.mesh.position);
            
            if (distance < pickupRadius) {
                if (drop.itemId) {
                    this.inventory.addItem(drop.itemId, drop.quantity);
                    pickedUp.push({ 
                        name: ITEMS[drop.itemId].name, 
                        quantity: drop.quantity,
                        rarity: ITEMS[drop.itemId].rarity
                    });
                }
                
                if (drop.coins) {
                    this.inventory.addCurrency(drop.coins);
                    pickedUp.push({ 
                        name: `${drop.coins} Coins`, 
                        quantity: 1,
                        rarity: { color: '#ffd700' }
                    });
                }
                
                drop.mesh.dispose();
                return false;
            }
            
            return true;
        });

        if (pickedUp.length > 0) {
            this.showLootNotifications(pickedUp);
        }
    }

    showLootNotifications(items) {
        const container = document.getElementById('loot-notifications');
        
        items.forEach(item => {
            const notif = document.createElement('div');
            notif.className = 'loot-notification';
            notif.style.borderColor = item.rarity.color;
            notif.style.color = item.rarity.color;
            notif.textContent = item.quantity > 1 
                ? `+${item.quantity}x ${item.name}` 
                : `+${item.name}`;
            
            container.appendChild(notif);
            
            setTimeout(() => notif.remove(), 3000);
        });
    }
}

// ==========================================
// MERCHANT SHOP SYSTEM
// ==========================================

class MerchantShop {
    constructor(scene, inventory, advancedTexture) {
        this.scene = scene;
        this.inventory = inventory;
        this.advancedTexture = advancedTexture;
        this.isOpen = false;
        this.shopUI = null;
        
        this.merchantStock = [
            { itemId: 'rusty_pistol', quantity: 5 },
            { itemId: 'combat_rifle', quantity: 3 },
            { itemId: 'plasma_cannon', quantity: 1 },
            { itemId: 'health_pack', quantity: 10 },
            { itemId: 'energy_cell', quantity: 8 }
        ];
    }

    createShopUI() {
        const panel = new BABYLON.GUI.Rectangle("shopPanel");
        panel.width = "800px";
        panel.height = "600px";
        panel.thickness = 4;
        panel.cornerRadius = 10;
        panel.color = "#00ff00";
        panel.background = "rgba(0, 0, 0, 0.95)";
        
        const title = new BABYLON.GUI.TextBlock("shopTitle");
        title.text = "=== THE REMNANT TRADER ===";
        title.color = "#00ff00";
        title.fontSize = 28;
        title.fontFamily = "monospace";
        title.top = "-260px";
        panel.addControl(title);

        const closeBtn = BABYLON.GUI.Button.CreateSimpleButton("closeShop", "X");
        closeBtn.width = "40px";
        closeBtn.height = "40px";
        closeBtn.color = "red";
        closeBtn.background = "rgba(255, 0, 0, 0.3)";
        closeBtn.top = "-260px";
        closeBtn.left = "360px";
        closeBtn.onPointerClickObservable.add(() => this.closeShop());
        panel.addControl(closeBtn);

        const buyTab = this.createBuyTab();
        buyTab.top = "-200px";
        buyTab.left = "-300px";
        panel.addControl(buyTab);

        const sellTab = this.createSellTab();
        sellTab.top = "-200px";
        sellTab.left = "100px";
        panel.addControl(sellTab);

        this.shopUI = panel;
        return panel;
    }

    createBuyTab() {
        const container = new BABYLON.GUI.Rectangle("buyContainer");
        container.width = "350px";
        container.height = "450px";
        container.thickness = 2;
        container.color = "#00ff00";
        container.background = "rgba(0, 50, 0, 0.5)";

        const header = new BABYLON.GUI.TextBlock();
        header.text = "BUY";
        header.color = "#00ff00";
        header.fontSize = 20;
        header.top = "-200px";
        container.addControl(header);

        let yPos = -150;
        this.merchantStock.forEach((stock) => {
            const item = ITEMS[stock.itemId];
            
            const itemBtn = BABYLON.GUI.Button.CreateSimpleButton(
                `buy_${item.id}`,
                `${item.name} - ${item.buyPrice}c [${stock.quantity}]`
            );
            itemBtn.width = "320px";
            itemBtn.height = "40px";
            itemBtn.color = item.rarity.color;
            itemBtn.background = "rgba(0, 0, 0, 0.7)";
            itemBtn.top = `${yPos}px`;
            itemBtn.fontSize = 14;
            itemBtn.fontFamily = "monospace";
            
            itemBtn.onPointerClickObservable.add(() => {
                this.buyItem(stock.itemId);
            });
            
            container.addControl(itemBtn);
            yPos += 50;
        });

        return container;
    }

    createSellTab() {
        const container = new BABYLON.GUI.Rectangle("sellContainer");
        container.width = "350px";
        container.height = "450px";
        container.thickness = 2;
        container.color = "#00ff00";
        container.background = "rgba(50, 0, 0, 0.5)";

        const header = new BABYLON.GUI.TextBlock();
        header.text = "SELL";
        header.color = "#ff0000";
        header.fontSize = 20;
        header.top = "-200px";
        container.addControl(header);

        this.updateSellTab(container);

        return container;
    }

    updateSellTab(container) {
        container.children.forEach(child => {
            if (child.name && child.name.startsWith('sell_')) {
                container.removeControl(child);
            }
        });

        let yPos = -150;
        const inventoryList = this.inventory.getInventoryList();
        
        inventoryList.forEach((entry) => {
            const item = entry.item;
            
            const itemBtn = BABYLON.GUI.Button.CreateSimpleButton(
                `sell_${item.id}`,
                `${item.name} x${entry.quantity} - ${item.sellPrice}c each`
            );
            itemBtn.width = "320px";
            itemBtn.height = "40px";
            itemBtn.color = item.rarity.color;
            itemBtn.background = "rgba(0, 0, 0, 0.7)";
            itemBtn.top = `${yPos}px`;
            itemBtn.fontSize = 14;
            itemBtn.fontFamily = "monospace";
            
            itemBtn.onPointerClickObservable.add(() => {
                this.sellItem(item.id);
            });
            
            container.addControl(itemBtn);
            yPos += 50;
        });
    }

    buyItem(itemId) {
        const item = ITEMS[itemId];
        const stock = this.merchantStock.find(s => s.itemId === itemId);
        
        if (stock && stock.quantity > 0) {
            if (this.inventory.removeCurrency(item.buyPrice)) {
                this.inventory.addItem(itemId, 1);
                stock.quantity--;
                this.refreshShopUI();
                console.log(`✅ Purchased ${item.name} for ${item.buyPrice} coins`);
            } else {
                console.log('❌ Not enough coins!');
            }
        }
    }

    sellItem(itemId) {
        const item = ITEMS[itemId];
        
        if (this.inventory.removeItem(itemId, 1)) {
            this.inventory.addCurrency(item.sellPrice);
            
            const stock = this.merchantStock.find(s => s.itemId === itemId);
            if (stock) {
                stock.quantity++;
            } else {
                this.merchantStock.push({ itemId, quantity: 1 });
            }
            
            this.refreshShopUI();
            console.log(`💰 Sold ${item.name} for ${item.sellPrice} coins`);
        }
    }

    refreshShopUI() {
        if (this.isOpen && this.shopUI) {
            this.advancedTexture.removeControl(this.shopUI);
            this.shopUI = this.createShopUI();
            this.advancedTexture.addControl(this.shopUI);
        }
    }

    openShop() {
        if (!this.isOpen) {
            this.isOpen = true;
            this.shopUI = this.createShopUI();
            this.advancedTexture.addControl(this.shopUI);
            console.log('🏪 Shop opened');
        }
    }

    closeShop() {
        if (this.isOpen) {
            this.isOpen = false;
            if (this.shopUI) {
                this.advancedTexture.removeControl(this.shopUI);
                this.shopUI = null;
            }
            console.log('🏪 Shop closed');
        }
    }
}

// ==========================================
// MERCHANT SHACK (Physical Building)
// ==========================================

class MerchantShack {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position;
        this.parts = [];
        this.isCollapsed = false;
        this.interactionZone = null;
        
        this.buildShack();
        this.createInteractionZone();
    }

    buildShack() {
        // Foundation
        const foundation = BABYLON.MeshBuilder.CreateBox(
            "foundation",
            { width: 6, height: 0.3, depth: 5 },
            this.scene
        );
        foundation.position = this.position.clone();
        foundation.position.y = 0.15;
        
        const foundationMat = new BABYLON.StandardMaterial("foundationMat", this.scene);
        foundationMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
        foundation.material = foundationMat;
        
        this.addPhysics(foundation, { width: 6, height: 0.3, depth: 5 }, 100);
        this.parts.push(foundation);

        // Walls
        const wallMat = new BABYLON.StandardMaterial("wallMat", this.scene);
        wallMat.diffuseColor = new BABYLON.Color3(0.5, 0.4, 0.3);

        const backWall = BABYLON.MeshBuilder.CreateBox(
            "backWall",
            { width: 6, height: 3, depth: 0.2 },
            this.scene
        );
        backWall.position = this.position.clone();
        backWall.position.y = 1.8;
        backWall.position.z = -2.5;
        backWall.material = wallMat;
        this.addPhysics(backWall, { width: 6, height: 3, depth: 0.2 }, 50);
        this.parts.push(backWall);

        const leftWall = BABYLON.MeshBuilder.CreateBox(
            "leftWall",
            { width: 0.2, height: 3, depth: 5 },
            this.scene
        );
        leftWall.position = this.position.clone();
        leftWall.position.y = 1.8;
        leftWall.position.x = -3;
        leftWall.material = wallMat;
        this.addPhysics(leftWall, { width: 0.2, height: 3, depth: 5 }, 50);
        this.parts.push(leftWall);

        const rightWall = BABYLON.MeshBuilder.CreateBox(
            "rightWall",
            { width: 0.2, height: 3, depth: 5 },
            this.scene
        );
        rightWall.position = this.position.clone();
        rightWall.position.y = 1.8;
        rightWall.position.x = 3;
        rightWall.material = wallMat;
        this.addPhysics(rightWall, { width: 0.2, height: 3, depth: 5 }, 50);
        this.parts.push(rightWall);

        const roof = BABYLON.MeshBuilder.CreateBox(
            "roof",
            { width: 6.5, height: 0.2, depth: 5.5 },
            this.scene
        );
        roof.position = this.position.clone();
        roof.position.y = 3.4;
        
        const roofMat = new BABYLON.StandardMaterial("roofMat", this.scene);
        roofMat.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
        roof.material = roofMat;
        this.addPhysics(roof, { width: 6.5, height: 0.2, depth: 5.5 }, 40);
        this.parts.push(roof);

        // Sign
        const sign = BABYLON.MeshBuilder.CreatePlane(
            "sign",
            { width: 2, height: 0.5 },
            this.scene
        );
        sign.position = this.position.clone();
        sign.position.y = 3.8;
        sign.position.z = -2.3;
        
        const signMat = new BABYLON.StandardMaterial("signMat", this.scene);
        signMat.emissiveColor = new BABYLON.Color3(0, 1, 0);
        sign.material = signMat;
        this.parts.push(sign);
    }

    addPhysics(mesh, size, mass) {
        const body = new BABYLON.PhysicsBody(
            mesh,
            BABYLON.PhysicsMotionType.DYNAMIC,
            false,
            this.scene
        );
        const shape = new BABYLON.PhysicsShapeBox(
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Quaternion(0, 0, 0, 1),
            new BABYLON.Vector3(size.width, size.height, size.depth),
            this.scene
        );
        shape.material = { friction: 0.8, restitution: 0.1 };
        body.shape = shape;
        body.setMassProperties({ mass });
        mesh.physicsBody = body;
    }

    createInteractionZone() {
        this.interactionZone = BABYLON.MeshBuilder.CreateCylinder(
            "interactionZone",
            { diameter: 5, height: 0.1 },
            this.scene
        );
        this.interactionZone.position = this.position.clone();
        this.interactionZone.position.y = 0.05;
        this.interactionZone.visibility = 0.2;
        
        const zoneMat = new BABYLON.StandardMaterial("zoneMat", this.scene);
        zoneMat.emissiveColor = new BABYLON.Color3(0, 1, 0);
        zoneMat.alpha = 0.3;
        this.interactionZone.material = zoneMat;
    }

    collapseShack() {
        if (!this.isCollapsed) {
            this.isCollapsed = true;
            
            this.parts.forEach(part => {
                if (part.physicsBody) {
                    const impulse = new BABYLON.Vector3(
                        (Math.random() - 0.5) * 200,
                        Math.random() * 100,
                        (Math.random() - 0.5) * 200
                    );
                    part.physicsBody.applyImpulse(impulse, part.position);
                }
            });
            
            console.log('💥 SHACK COLLAPSED!');
        }
    }

    checkPlayerProximity(playerPosition) {
        if (!this.interactionZone) return false;
        const distance = BABYLON.Vector3.Distance(playerPosition, this.interactionZone.position);
        return distance < 3;
    }
}
```

## STEP 7: Modify Enemy Class (Find your Enemy class, probably around line 600)

**IN YOUR Enemy CLASS**, **FIND** the `die()` method and **MODIFY IT**:

```javascript
die() {
    this.isAlive = false;
    
    // 🆕 SPAWN LOOT AT DEATH POSITION
    if (this.scene.lootManager) {
        this.scene.lootManager.spawnLoot(this.mesh.position.clone(), 'zombie');
    }
    
    // Existing death code...
    this.mesh.dispose();
}
```

## STEP 8: Modify SimpleRagdoll Dispose (around line 650)

**IN YOUR SimpleRagdoll CLASS**, **FIND** the `dispose()` method and **ADD**:

```javascript
dispose() {
    // 🆕 SPAWN LOOT ON DISPOSAL
    if (this.alive && this.scene.lootManager) {
        this.scene.lootManager.spawnLoot(this.parts.head.position.clone(), 'ragdoll');
    }
    
    this.alive = false;
    
    // Existing disposal code...
    Object.values(this.parts).forEach(part => {
        if (part && !part.isDisposed()) {
            if (part.physicsAggregate) {
                part.physicsAggregate.dispose();
            }
            part.dispose();
        }
    });
    // etc...
}
```

## STEP 9: Modify WatchtowerGame Constructor (around line 750)

**IN YOUR WatchtowerGame CLASS constructor**, **ADD THESE PROPERTIES**:

```javascript
constructor() {
    this.canvas = document.getElementById('renderCanvas');
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = null;
    this.camera = null;
    
    // Existing systems...
    this.playerController = null;
    this.weaponSystem = null;
    // ... etc
    
    // 🆕 NEW ECONOMY SYSTEMS
    this.inventory = null;
    this.lootManager = null;
    this.merchantShack = null;
    this.merchantShop = null;
    
    // ... rest of constructor
}
```

## STEP 10: Initialize Economy Systems in createScene() (around line 800)

**IN YOUR createScene() METHOD**, **ADD AFTER** you create the ground:

```javascript
// 🆕 INITIALIZE ECONOMY SYSTEMS
this.inventory = new InventorySystem();
this.lootManager = new LootDropManager(this.scene, this.inventory);

// Make lootManager accessible from scene
this.scene.lootManager = this.lootManager;

// Create merchant shack
const shackPosition = new BABYLON.Vector3(20, 0, 0);
this.merchantShack = new MerchantShack(this.scene, shackPosition);

// Setup GUI for shop
const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
this.merchantShop = new MerchantShop(this.scene, this.inventory, advancedTexture);

this.inventory.updateUI();
```

## STEP 11: Add E Key Handler in setupEventListeners() (around line 810)

**FIND** your keydown event listener and **ADD**:

```javascript
window.addEventListener('keydown', (e) => {
    // 🆕 E - Open shop
    if (e.key === 'e' || e.key === 'E') {
        if (this.merchantShack.checkPlayerProximity(this.camera.position)) {
            if (!this.merchantShop.isOpen) {
                this.merchantShop.openShop();
            }
        }
    }
    
    // Existing keys...
    // ... your other key handlers
});
```

## STEP 12: Add Pickup Check in update() (around line 850)

**IN YOUR update() METHOD**, **ADD AFTER** weapon/enemy updates:

```javascript
update(deltaTime) {
    // ... existing update code ...
    
    // 🆕 AUTO-PICKUP LOOT
    this.lootManager.checkPickup(this.camera.position, 2.5);
    
    // 🆕 CHECK MERCHANT PROXIMITY
    const nearMerchant = this.merchantShack.checkPlayerProximity(this.camera.position);
    const prompt = document.getElementById('interaction-prompt');
    prompt.style.display = nearMerchant ? 'block' : 'none';
    
    // ... rest of update method ...
}
```

## STEP 13: Add Test Methods (around line 1000)

**ADD THESE TWO NEW METHODS** to your WatchtowerGame class:

```javascript
// 🆕 ECONOMY TEST METHODS
addCoins(amount) {
    this.inventory.addCurrency(amount);
    console.log(`💰 Added ${amount} coins!`);
}

testLootDrop() {
    const spawnPos = this.camera.position.clone();
    spawnPos.addInPlace(this.camera.getDirection(BABYLON.Axis.Z).scale(5));
    spawnPos.y = 2;
    
    this.lootManager.spawnLoot(spawnPos, 'ragdoll');
    console.log('🎁 Test loot spawned!');
}
```

## STEP 14: Update clearAll() (around line 1020)

**IN YOUR clearAll() METHOD**, **ADD AT THE END**:

```javascript
clearAll() {
    // ... existing clear code ...
    
    // 🆕 Clear dropped loot
    this.lootManager.droppedItems.forEach(drop => {
        if (drop.mesh) drop.mesh.dispose();
    });
    this.lootManager.droppedItems = [];
    
    console.log('🧹 Cleared all entities!');
}
```

---

## THAT'S IT!

Now you have a fully integrated loot & economy system! The core loop works like this:

1. **Kill enemies/ragdolls** → They spawn loot automatically
2. **Walk near loot** → Auto-pickup with notifications
3. **Walk to merchant shack** (at position 20, 0, 0) → Yellow prompt appears
4. **Press E** → Shop opens
5. **Sell items** → Get coins
6. **Buy weapons** → Spend coins
7. **Repeat!**

The merchant shack is a **fully physics-based destructible building** that you can collapse for testing. All loot has **rarity-colored glowing effects** and uses Havok physics for realistic scatter.
