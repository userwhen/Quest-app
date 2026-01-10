/* js/modules/shop300.js - V12.0 Commerce & Payment System */
window.act = window.act || {};

const ShopEngine = {
    // [1. 商品獲取與過濾]
    getShopItems: () => {
        const cat = window.TempState?.shopCategory || '全部'; // 全部, 熱量, 道具, 玩家
        const gs = window.GlobalState;
        
        // 玩家商店分流
        if (cat === '玩家') {
            return gs.shop.user || [];
        }

        // NPC 商店過濾
        let items = gs.shop.npc;
        if (cat !== '全部' && cat !== '玩家') {
            items = items.filter(i => i.category === cat);
        }
        return items;
    },

    // [2. 購買邏輯]
    buyItem: (itemId, isUserShop = false) => {
        const gs = window.GlobalState;
        // 根據來源搜尋商品
        const list = isUserShop ? gs.shop.user : gs.shop.npc;
        const item = list.find(i => i.id === itemId);
        
        if (!item) return act.alert("商品不存在或已下架");
        if (item.qty <= 0 && item.perm !== 'infinity') return act.alert("此商品已售完");

        // 檢查貨幣 (優先扣免費鑽)
        let cost = item.price;
        let currencyType = item.currency || 'gold'; // gold, gem, paid
        
        if (currencyType === 'gold') {
            if (gs.gold < cost) return act.alert("金幣不足！");
            gs.gold -= cost;
        } else {
            // 鑽石扣款邏輯：免費 -> 付費
            const totalGem = (gs.freeGem || 0) + (gs.paidGem || 0);
            if (totalGem < cost) return act.alert("鑽石不足！");
            
            if (gs.freeGem >= cost) {
                gs.freeGem -= cost;
            } else {
                cost -= gs.freeGem;
                gs.freeGem = 0;
                gs.paidGem -= cost;
            }
        }

        // 庫存處理
        if (item.perm !== 'infinity') {
            item.qty--;
            // 若是玩家商品，售完即移除
            if (isUserShop && item.qty <= 0) {
                gs.shop.user = gs.shop.user.filter(i => i.id !== itemId);
            }
        }

        // 入背包
        ShopEngine.addToBag(item);
        
        act.toast(`購買成功：${item.name}`);
        Core.save();
        
        if (window.view) {
            view.renderShop();
            view.renderHUD();
        }
    },

    // [3. 玩家上架 (模擬)]
    sellItem: () => {
        // 簡單實作：將背包第一個物品上架 (實際應有選擇介面)
        const gs = window.GlobalState;
        if (gs.bag.length === 0) return act.alert("背包沒有可上架的物品");
        
        const item = gs.bag[0];
        act.prompt(`設定 [${item.name}] 的售價`, "100", (val) => {
            const price = parseInt(val);
            if (!price || price <= 0) return act.alert("價格無效");
            
            // 移出背包
            item.count--;
            if(item.count <= 0) gs.bag.shift();

            // 加入玩家商店
            gs.shop.user.push({
                ...item,
                id: `u_${Date.now()}`,
                price: price,
                currency: 'gold',
                qty: 1,
                perm: 'once',
                seller: gs.name
            });
            
            act.alert("上架成功！至 [商店 > 玩家] 查看");
            Core.save();
            if(window.view) view.renderShop();
        });
    },

    // [4. 儲值系統]
    openPayment: () => {
        const m = document.getElementById('m-system');
        const body = document.getElementById('sys-msg-body');
        if(!m || !body) return;
        
        m.classList.add('active');
        body.innerHTML = `
            <div style="text-align:center;">
                <h3 style="color:#00897b; margin-bottom:15px;">💎 儲值中心</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                    <button class="btn-std" onclick="act.submitPayment(30)">$30 (30鑽)</button>
                    <button class="btn-std" onclick="act.submitPayment(100)">$100 (105鑽)</button>
                    <button class="btn-std" onclick="act.submitPayment(300)">$300 (320鑽)</button>
                    <button class="btn-std" onclick="act.submitPayment(1000)">$1000 (1100鑽)</button>
                </div>
                <div style="font-size:0.8rem; color:#888;">(模擬環境：點擊即充值)</div>
                <button class="btn-cancel" style="width:100%; margin-top:10px;" onclick="act.closeModal('system')">取消</button>
            </div>
        `;
    },

    submitPayment: (amount) => {
        const gs = window.GlobalState;
        let gems = amount;
        // 贈送邏輯
        if(amount >= 100) gems += 5;
        if(amount >= 300) gems += 20;
        if(amount >= 1000) gems += 100;

        gs.paidGem = (gs.paidGem || 0) + gems;
        act.toast(`儲值成功！獲得 ${gems} 鑽石`);
        act.closeModal('system');
        Core.save();
        if(window.view) view.renderHUD();
    },

    // Helper: 入背包
    addToBag: (item) => {
        const gs = window.GlobalState;
        const existing = gs.bag.find(b => b.name === item.name); // 簡單用名稱堆疊
        if (existing) {
            existing.count = (existing.count || 1) + 1;
        } else {
            gs.bag.push({
                id: `bag_${Date.now()}`,
                name: item.name,
                icon: item.icon,
                desc: item.desc,
                category: item.category,
                count: 1
            });
        }
    }
};

// 掛載
window.act.buyShopItem = ShopEngine.buyItem;
window.act.sellItem = ShopEngine.sellItem;
window.act.openPayment = ShopEngine.openPayment;
window.act.submitPayment = ShopEngine.submitPayment;
window.act.openQuickEnergy = ShopEngine.openQuickEnergy;
window.act.refreshEnergyDisplay = ShopEngine.refreshEnergyDisplay;