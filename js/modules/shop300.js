/* js/modules/shop300.js - V19.0 Final Optimized */
window.act = window.act || {};

// ==========================================
// [區域 1] 商店邏輯引擎 (ShopEngine)
// ==========================================
const ShopEngine = {
    // 初始化
    init: () => {
        const gs = window.GlobalState;
        if (!gs.shop) gs.shop = { npc: [], user: [] };
        if (!gs.bag) gs.bag = [];
        
        // 預設 NPC 商品 (若無)
        if (gs.shop.npc.length === 0) {
            gs.shop.npc = [
                { id: 'item_potion_s', name: '傷藥', category: '其他', price: 50, qty: 99, maxQty: 99, desc: '恢復 20 HP', icon: '💊', currency: 'gold' },
                { id: 'item_sword_1', name: '鐵劍', category: '其他', price: 500, qty: 1, maxQty: 1, desc: '攻擊力 +5', icon: '⚔️', currency: 'gold' }
            ];
        }
    },

    // 取得圖示
    getCategoryIcon: (cat) => {
        switch (cat) {
            case '熱量': return '🔥';
            case '時間': return '⏳';
            case '金錢': return '💰';
            default: return '✨';
        }
    },

    // 取得商店列表 (含過濾)
    getShopItems: (filterCat) => {
        const gs = window.GlobalState;
        let items = [...(gs.shop.npc || []), ...(gs.shop.user || [])];
        if (filterCat && filterCat !== '全部') items = items.filter(i => i.category === filterCat);
        return items;
    },

    // 取得背包列表 (堆疊顯示)
    getBagItems: (filterCat) => {
        const gs = window.GlobalState;
        const rawBag = gs.bag || [];
        const stackedMap = new Map();
        
        rawBag.forEach(item => {
            if (filterCat && filterCat !== '全部' && item.category !== filterCat) return;
            if (stackedMap.has(item.id)) {
                stackedMap.get(item.id).count++; 
            } else {
                stackedMap.set(item.id, { ...item, count: 1 });
            }
        });
        return Array.from(stackedMap.values());
    },

    // 購買物品
    buyItem: (itemId, qty) => {
        const gs = window.GlobalState;
        const item = gs.shop.npc.find(i => i.id === itemId) || gs.shop.user.find(i => i.id === itemId);
        
        if (!item) return act.toast("❌ 商品不存在");
        if (item.qty < qty) return act.toast("❌ 庫存不足");

        const totalCost = item.price * qty;
        const isPaidOnly = item.currency === 'paid';
        const isGem = item.currency === 'gem';

        // 貨幣檢查與扣款
        if (isPaidOnly) {
            if ((gs.paidGem || 0) < totalCost) return act.toast("💎 付費鑽石不足");
            gs.paidGem -= totalCost;
        } else if (isGem) {
            const totalGem = (gs.freeGem || 0) + (gs.paidGem || 0);
            if (totalGem < totalCost) return act.toast("💎 鑽石不足");
            let cost = totalCost;
            if (gs.freeGem >= cost) { gs.freeGem -= cost; } 
            else { cost -= gs.freeGem; gs.freeGem = 0; gs.paidGem -= cost; }
        } else {
            if ((gs.gold || 0) < totalCost) return act.toast("💰 金幣不足");
            gs.gold -= totalCost;
        }

        // 發貨 (給予唯一 ID)
        for (let i = 0; i < qty; i++) {
            gs.bag.push({ ...item, uid: Date.now() + Math.random().toString(36).substr(2, 5) });
        }
        if (item.maxQty < 999) item.qty -= qty;

        act.save();
        act.toast(`🎉 購買成功！`);
        act.closeModal('overlay'); 
        
        if (window.view) {
            view.renderHUD();
            view.renderShop(); 
        }
    },

    // 使用物品
    useItem: (itemId, useQty, isDiscard = false) => {
        const gs = window.GlobalState;
        const targetIndices = [];
        gs.bag.forEach((item, idx) => {
            if (item.id === itemId && targetIndices.length < useQty) targetIndices.push(idx);
        });

        if (targetIndices.length < useQty) return act.toast("❌ 數量不足");

        if (isDiscard) {
            ShopEngine.consumeFromBag(itemId, useQty);
            act.toast(`🗑️ 已丟棄`);
        } else {
            const itemDef = gs.bag[targetIndices[0]];
            // 簡單的使用邏輯 (可擴充)
            if (itemDef.category === '熱量' && gs.settings.calMode) {
                const val = parseInt(itemDef.val) || 0;
                gs.cal.today += val * useQty;
                gs.cal.logs.unshift(`[使用] ${itemDef.name} +${val*useQty}`);
            }
            ShopEngine.consumeFromBag(itemId, useQty);
            act.toast(`✨ 使用成功`);
        }
        act.closeModal('bag-detail');
    },

    // 從背包移除
    consumeFromBag: (itemId, qty) => {
        const gs = window.GlobalState;
        let removed = 0;
        const newBag = [];
        for (const item of gs.bag) {
            if (item.id === itemId && removed < qty) { removed++; } 
            else { newBag.push(item); }
        }
        gs.bag = newBag;
        act.save();
        if (window.view) {
            view.renderBag();
            view.renderHUD();
        }
    },

    // 上架商品
    submitUpload: () => {
        const name = document.getElementById('up-name').value;
        const desc = document.getElementById('up-desc').value;
        const cat = document.getElementById('up-cat').value;
        const price = parseInt(document.getElementById('up-price').value) || 0;
        const qty = parseInt(document.getElementById('up-qty').value) || 1;
        const perm = document.getElementById('up-perm').value;
        
        if (!name) return act.toast("❌ 請輸入名稱");

        // 動態欄位取值
        let val = 0;
        if (cat === '熱量') val = document.getElementById('up-val-cal')?.value || 0;
        else if (cat === '金錢') val = document.getElementById('up-val-gold')?.value || 0;
        else if (cat === '時間') {
            const h = document.getElementById('up-val-h')?.value || '00';
            const m = document.getElementById('up-val-m')?.value || '00';
            val = `${h.padStart(2,'0')}:${m.padStart(2,'0')}`;
        }

        const gs = window.GlobalState;
        
        // 編輯模式
        if (window.TempState.uploadEditId) {
            const item = gs.shop.user.find(i => i.id === window.TempState.uploadEditId);
            if (item) {
                item.name = name; item.desc = desc; item.category = cat;
                item.price = price; item.qty = qty; item.maxQty = qty;
                item.perm = perm; item.val = val;
                item.icon = ShopEngine.getCategoryIcon(cat);
            }
        } else {
            // 新增模式
            const newItem = {
                id: 'usr_' + Date.now(),
                name, desc, category: cat, price, qty, maxQty: qty, perm, val,
                icon: ShopEngine.getCategoryIcon(cat),
                currency: 'gold'
            };
            gs.shop.user.push(newItem);
        }

        act.save();
        act.toast("✅ 上架成功");
        
        // 關閉視窗
        const modal = document.getElementById('m-upload');
        if(modal) modal.style.display = 'none';

        view.renderShop();
    },

    deleteShopItem: () => {
        const id = window.TempState.uploadEditId;
        if (!id) return;
        const gs = window.GlobalState;
        gs.shop.user = gs.shop.user.filter(i => i.id !== id);
        act.save();
        act.toast("🗑️ 商品已下架");
        act.closeModal('upload');
        view.renderShop();
    },
    
    // 儲值邏輯
    submitPayment: (amount) => {
        const gs = window.GlobalState;
        act.confirm(`確定要花費 NT$ ${amount} 儲值嗎？`, (yes) => {
            if (yes) {
                const gems = amount;
                if (!gs.paidGem) gs.paidGem = 0;
                gs.paidGem += gems;
                
                act.save();
                act.toast(`💎 獲得 ${gems} 鑽石`);
                act.closeModal('overlay');
                
                if (window.view) {
                    view.renderHUD();
                    if (document.getElementById('shop-root')) view.renderShop();
                }
            }
        });
    },
    
    // 購買精力
    buyStamina: (type) => {
        const gs = window.GlobalState;
        let cost = 0;
        let amount = 0;
        let currency = 'gold';

        if (type === 'small') { cost = 20; amount = 20; currency = 'gem'; }
        if (type === 'medium') { cost = 50; amount = 50; currency = 'gem'; }
        if (type === 'large') { cost = 100; amount = 100; currency = 'gem'; }

        if (currency === 'gold' && gs.gold < cost) return act.toast("💰 金幣不足！");
        if (currency === 'gem' && (gs.freeGem + gs.paidGem) < cost) return act.toast("💎 鑽石不足！");

        if (currency === 'gold') {
            gs.gold -= cost;
        } else {
            if (gs.freeGem >= cost) gs.freeGem -= cost;
            else { 
                let remain = cost - gs.freeGem; 
                gs.freeGem = 0; 
                gs.paidGem -= remain; 
            }
        }

        // 連動 StoryEngine
        if (window.StoryEngine && StoryEngine.recoverEnergy) {
            StoryEngine.recoverEnergy(amount);
            act.toast(`⚡ 恢復了 ${amount} 點精力！`);
        } else {
            if (!gs.story) gs.story = { energy: 0, maxEnergy: 100 };
            gs.story.energy = Math.min(gs.story.maxEnergy || 100, gs.story.energy + amount);
            act.toast(`⚡ 精力已恢復 (無劇情模組)`);
        }

        act.save();
        view.renderHUD();
        act.closeModal('overlay');
    },
};

// ==========================================
// [區域 2] 視圖渲染邏輯 (View)
// ==========================================
window.view = window.view || {};

Object.assign(window.view, {

    // 1. 渲染商店主頁
    renderShop: () => {
        let pageContainer = document.getElementById('page-shop');
        if (!pageContainer) return;
        if (pageContainer.innerHTML.trim() === '') pageContainer.innerHTML = `<div id="shop-root" style="height:100%;"></div>`;

        const currentCat = window.TempState.shopCategory || '全部';
        const cats = ['全部', '熱量', '時間', '金錢', '其他'];

        const npcHtml = ui.stage.npc('<div style="font-size:3rem;">🧚</div>', "歡迎光臨！");
        const scrollHtml = ui.tabs.scrollX(cats, currentCat, "act.setShopFilter");
        const toolbarHtml = `
            <div class="filter-container" style="display: flex; align-items: center; gap: 5px; padding: 5px 10px;">
                <div style="flex: 1; overflow: hidden;">${scrollHtml}</div>
                <div style="flex-shrink:0;">${ui.btn.sm('➕ 上架', 'view.renderUploadModal()', 'u-btn-paper')}</div>
            </div>`;

        const headerHtml = `<div style="background:var(--bg-main);">${npcHtml}${toolbarHtml}</div>`;
        const items = ShopEngine.getShopItems(currentCat);
        
        let gridHtml = items.length === 0 ? 
            `<div style="text-align:center; color:#999; padding:40px;">暫無商品</div>` : 
            `<div class="shop-grid" style="grid-template-columns: 1fr 1fr;">` + items.map(item => {
                if (!item.icon) item.icon = ShopEngine.getCategoryIcon(item.category);
                const isUser = item.id.startsWith('usr_');
                
                let cardHtml = ui.card.item(item, 'shop', `view.renderBuyModal('${item.id}')`);

                if (isUser) {
                    const editBtn = `
                        <button class="btn-ghost-edit" 
                                style="position:absolute; top:5px; right:5px; z-index:10; background:rgba(255,255,255,0.9); border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; border:1px solid #ccc; font-size:0.8rem; cursor:pointer;"
                                onclick="event.stopPropagation(); view.renderUploadModal('${item.id}')">
                            ⚙️
                        </button>`;
                    cardHtml = cardHtml.replace('</div>', `${editBtn}</div>`);
                }
                return cardHtml;
            }).join('') + `</div>`;

        document.getElementById('shop-root').innerHTML = ui.layout.scroller(headerHtml, gridHtml + '<div style="height:80px;"></div>', 'shop-scroller');
        if (view.hideFab) view.hideFab();
    },

    // 2. 渲染上架視窗
    renderUploadModal: (editId = null) => {
        window.TempState.uploadEditId = editId;
        const gs = window.GlobalState;
        let data = { name: '', desc: '', category: '熱量', price: '', qty: '', perm: 'daily', val: '' };
        
        if (editId) {
            const item = gs.shop.user.find(i => i.id === editId);
            if (item) data = { ...item };
        }

        const htmlName = ui.input.text(data.name, "商品名稱 (Max 10)", "", "up-name");
        const htmlDesc = ui.input.textarea(data.desc, "描述/備註...", "", "up-desc");

        const htmlRow3 = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div style="min-width: 0;">
                    <label class="section-title">分類</label>
                    ${ui.input.select([
                        {value:'熱量', label:'🔥 熱量'}, {value:'時間', label:'⏳ 時間'}, 
                        {value:'金錢', label:'💰 金錢'}, {value:'其他', label:'📦 其他'}
                    ], data.category, "act.shopUploadChange()", "up-cat")}
                </div>
                <div id="up-dyn-container" style="min-width: 0;"></div>
            </div>`;

        const htmlRow4 = `
            <div style="border-top: 1px dashed #ccc; padding-top: 10px; margin-top: 5px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                    <div style="min-width: 0;">
                        <label class="section-title">價格</label>
                        ${ui.input.number(data.price, "$", "act.validateNumber(this, 9999)", 4, "up-price")}
                    </div>
                    <div style="min-width: 0;">
                        <label class="section-title">庫存</label>
                        ${ui.input.number(data.qty, "Qty", "act.validateNumber(this, 99)", 2, "up-qty")}
                    </div>
                    <div style="min-width: 0;">
                        <label class="section-title">重置</label>
                        ${ui.input.select([{value:'daily', label:'常駐'}, {value:'once', label:'單次'}], data.perm, "", "up-perm")}
                    </div>
                </div>
            </div>`;

        const bodyHtml = `
            <div class="m-head">${editId ? '編輯商品' : '上架商品'} <button class="btn-close-red" onclick="act.closeModal('upload')">✕</button></div>
            <div class="m-body">
                <div class="input-group">${htmlName}</div>
                <div class="input-group">${htmlDesc}</div>
                ${htmlRow3}
                ${htmlRow4}
            </div>
            <div class="m-foot" style="justify-content: flex-end;">
                ${editId ? ui.btn.danger('下架', 'act.deleteShopItem()', 'margin-right:auto;', 'btn-del-shop') : ''}
                ${ui.btn.primary('上架', 'act.submitUpload()')}
            </div>`;

        // 視窗生成
        let modal = document.getElementById('m-upload');
        if (modal && !document.getElementById('m-upload-content')) { modal.remove(); modal = null; }
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'm-upload';
            modal.className = 'mask';
            modal.style.zIndex = '9500';
            modal.innerHTML = `<div class="modal" id="m-upload-content"></div>`;
            document.body.appendChild(modal);
        }
        document.getElementById('m-upload-content').innerHTML = bodyHtml;
        modal.style.display = 'flex';
        setTimeout(() => { act.shopUploadChange(data.val); }, 0);
    },

    // 3. 渲染購買視窗
    renderBuyModal: (itemId) => {
        const gs = window.GlobalState;
        const item = gs.shop.npc.find(i => i.id === itemId) || gs.shop.user.find(i => i.id === itemId);
        if (!item) return;

        window.TempState.buyTargetId = itemId;
        window.TempState.buyQty = 1;
        window.TempState.buyMax = item.qty;

        const isPaid = item.currency === 'paid';
        const isGem = item.currency === 'gem';
        const priceIcon = isPaid ? '💳' : (isGem ? '💎' : '💰');
        const currencyName = isPaid ? '付費鑽石' : (isGem ? '鑽石' : '金幣');
        const userHas = isPaid ? gs.paidGem : (isGem ? (gs.freeGem + gs.paidGem) : gs.gold);

        const infoHtml = `
            <div style="text-align:center; padding-bottom:10px; margin-bottom:10px; border-bottom:1px dashed #ccc;">
                <div style="font-size:3rem; margin-bottom:5px;">${item.icon}</div>
                <div style="font-size:1rem; font-weight:bold; margin-bottom:5px;">${item.name}</div>
                <div style="display:flex; justify-content:center; gap:20px; color:#666; font-size:0.85rem;">
                    <span>單價: <b>${priceIcon}${item.price}</b></span>
                    <span>庫存: <b>${item.qty}</b></span>
                </div>
            </div>`;

        const stepperHtml = `
            <div style="text-align:center; margin-bottom:5px; font-weight:bold; color:#555; font-size:0.9rem;">購買數量</div>
            <div class="box-gray" style="display:flex; justify-content:center; align-items:center; gap:5px; padding:10px;">
                ${ui.btn.sm('MIN', "act.updateBuyQty('min')")}
                ${ui.btn.sm('➖', "act.updateBuyQty(-1)", "u-btn-icon-sm")} 
                ${ui.input.number(1, "1", "act.updateBuyQty(0)", 3, "buy-qty-input").replace('style="width:80px;"', 'style="width:60px; font-size:1.2rem; margin:0; text-align:center; font-weight:bold;"')}
                ${ui.btn.sm('➕', "act.updateBuyQty(1)", "u-btn-icon-sm")}
                ${ui.btn.sm('MAX', "act.updateBuyQty('max')")}
            </div>`;

        const totalHtml = `
            <div style="text-align:center; margin: 10px 0;">
                <div id="buy-total-display" style="font-size:1.2rem; font-weight:bold; color:#d32f2f;">
                    總價: ${item.price}
                </div>
                <div style="font-size:0.8rem; color:#888;">(持有${currencyName}: ${userHas||0})</div>
            </div>`;

        const bodyHtml = infoHtml + stepperHtml + totalHtml;
        const footHtml = `<button class="u-btn u-btn-primary" style="width:100%; padding:10px;" onclick="act.confirmBuy()">確認購買</button>`;

        view.renderModal('購買確認', bodyHtml, footHtml);
    },

    // 4. 渲染物品詳情
    renderItemDetail: (itemId) => {
        const bagItems = ShopEngine.getBagItems();
        const item = bagItems.find(i => i.id === itemId);
        if (!item) return;
        
        window.TempState.useTargetId = itemId;

        const headerHtml = `
            <div style="font-size:1.2rem; font-weight:bold; margin-bottom:10px; display:flex; align-items:center; gap:8px;">
                <span>${item.icon}</span> 
                <span>${item.name}</span>
                <span style="font-size:0.9rem; color:#666; font-weight:normal; margin-left:auto;">(擁有: ${item.count})</span>
            </div>`;

        const descHtml = `
            <div style="background:#f5f5f5; padding:10px; border-radius:8px; color:#555; font-size:0.9rem; min-height:60px; margin-bottom:15px;">
                ${item.desc || '這個物品似乎沒有特別的說明...'}
            </div>`;

        const stepperHtml = `
            <div class="box-gray" style="display:flex; justify-content:center; align-items:center; gap:5px; padding:10px; margin-bottom:0;">
                ${ui.btn.sm('MIN', "act.updateItemQty('min', "+item.count+")")}
                ${ui.btn.sm('➖', "act.updateItemQty(-1, "+item.count+")")}
                ${ui.input.number(1, "1", "", 3, "bd-qty").replace('style="width:80px;"', 'style="width:60px; font-size:1.2rem; margin:0; text-align:center;"')}
                ${ui.btn.sm('➕', "act.updateItemQty(1, "+item.count+")")}
                ${ui.btn.sm('MAX', "act.updateItemQty('max', "+item.count+")")}
            </div>`;

        const footHtml = `
            <div style="display:flex; gap:10px; width:100%; justify-content:flex-end;">
                ${ui.btn.danger('丟棄', 'act.useItem(true)')}
                ${ui.btn.primary('使用', 'act.useItem(false)')}
            </div>`;

        let modal = document.getElementById('m-bag-detail');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'm-bag-detail';
            modal.className = 'mask';
            modal.style.zIndex = '9600'; 
            modal.innerHTML = `<div class="modal" id="m-bag-detail-content"></div>`;
            document.body.appendChild(modal);
        }
        
        const inner = `
            <div class="m-head">物品詳情 <button class="btn-close-red" onclick="act.closeModal('bag-detail')">✕</button></div>
            <div class="m-body">${headerHtml + descHtml + stepperHtml}</div>
            <div class="m-foot">${footHtml}</div>
        `;
        document.getElementById('m-bag-detail-content').innerHTML = inner;
        modal.style.display = 'flex';
    },

    // 5. 渲染背包
    renderBag: () => {
        const currentCat = window.TempState.bagCategory || '全部';
        const cats = ['全部', '熱量', '時間', '金錢', '其他'];
        const items = ShopEngine.getBagItems(currentCat);
        
        const filterHtml = `<div style="padding-bottom:10px;">${ui.tabs.scrollX(cats, currentCat, "act.setBagFilter")}</div>`;
        
        let listHtml = items.length === 0 ? 
            `<div style="text-align:center; color:#999; padding:30px;">背包空空如也</div>` : 
            `<div class="shop-grid" style="grid-template-columns: 1fr 1fr;">` + items.map(item => {
                if (!item.icon) item.icon = ShopEngine.getCategoryIcon(item.category);
                return ui.card.item(item, 'bag', `view.renderItemDetail('${item.id}')`);
            }).join('') + `</div>`;

        const bodyHtml = `${filterHtml}${listHtml}`;
        view.renderModal('🎒 我的背包', bodyHtml, null, 'panel');
    },

    // 6. 渲染儲值
    renderPayment: () => {
        const bodyHtml = `
            <div style="text-align:center; padding:10px;">
                <h3 style="margin-bottom:20px; color:#fbc02d; text-shadow:1px 1px 0 #fff;">💎 儲值中心</h3>
                <p style="color:#666; margin-bottom:15px; font-size:0.9rem;">(測試環境，無實際扣款)</p>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    ${ui.btn.ghost('💎 30 <span style="font-size:0.8rem; color:#666">($30)</span>', 'act.submitPayment(30)')}
                    ${ui.btn.ghost('💎 100 <span style="font-size:0.8rem; color:#666">($100)</span>', 'act.submitPayment(100)')}
                    ${ui.btn.ghost('💎 300 <span style="font-size:0.8rem; color:#666">($300)</span>', 'act.submitPayment(300)')}
                    ${ui.btn.ghost('💎 1000 <span style="font-size:0.8rem; color:#666">($1000)</span>', 'act.submitPayment(1000)')}
                </div>
            </div>`;
        view.renderModal('', bodyHtml, null, 'overlay');
    },

    // 7. 渲染精力商店
    renderStaminaShop: () => {
        const gs = window.GlobalState;
        const currentEnergy = gs.story?.energy || 0;
        const maxEnergy = gs.story?.maxEnergy || 30;

        const cardStyle = `background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px 10px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; gap: 10px;`;
        const titleStyle = `font-size: 1.1rem; font-weight: bold; color: #fff; margin-bottom: 5px;`;
        const iconStyle = `font-size: 2.5rem; margin: 5px 0;`;
        const descStyle = `font-size: 0.9rem; color: #aaa; margin-bottom: 5px;`;

        const bodyHtml = `
            <div style="padding: 10px;">
                <div style="text-align:center; margin-bottom:20px;">
                    <div style="font-size:3rem;">⚡</div>
                    <h3 style="margin:5px 0;">精力補給站</h3>
                    <p style="color:#888; font-size:0.9rem;">
                        目前精力：<span style="color:#ffd700; font-weight:bold;">${currentEnergy} / ${maxEnergy}</span>
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                    <div style="${cardStyle}">
                        <div>
                            <div style="${iconStyle}">🥤</div>
                            <div style="${titleStyle}">小瓶精力</div>
                            <div style="${descStyle}">回復 20 點</div>
                        </div>
                        ${ui.btn.secondary('💎 20', "ShopEngine.buyStamina('small')")}
                    </div>
                    <div style="${cardStyle} border-color: #ffd700; background: rgba(255, 215, 0, 0.1);">
                        <div>
                            <div style="${iconStyle}">🧪</div>
                            <div style="${titleStyle}" style="color:#ffd700;">中瓶能量</div>
                            <div style="${descStyle}">回復 50 點</div>
                        </div>
                        ${ui.btn.primary('💎 50', "ShopEngine.buyStamina('medium')")}
                    </div>
                    <div style="${cardStyle}">
                        <div>
                            <div style="${iconStyle}">⚡</div>
                            <div style="${titleStyle}">皇家全補</div>
                            <div style="${descStyle}">回復 100 點</div>
                        </div>
                        ${ui.btn.ghost('💎 100', "ShopEngine.buyStamina('large')")}
                    </div>
                </div>
                
                <div style="text-align:center; margin-top:20px; font-size:0.8rem; color:#666;">
                    * 超出上限的部分將會保留
                </div>
            </div>`;

        view.renderModal('', bodyHtml, null, 'overlay');
    },
});

// ==========================================
// [區域 3] 交互綁定 (Act Binding)
// ==========================================
Object.assign(window.act, {
    // 商店相關
    shopInit: ShopEngine.init,
    setShopFilter: (cat) => { window.TempState.shopCategory = cat; view.renderShop(); },
    setBagFilter: (cat) => { window.TempState.bagCategory = cat; view.renderBag(); },
    
    // 購買流程
    renderBuyModal: view.renderBuyModal,
    updateBuyQty: (delta) => {
        let el = document.getElementById('buy-qty-input');
        if (!el) return;
        let val = parseInt(el.value) || 1;
        const max = window.TempState.buyMax || 99;

        if (delta === 'min') val = 1;
        else if (delta === 'max') val = max;
        else if (delta === 0) val = parseInt(el.value) || 1;
        else val += delta;

        if (val < 1) val = 1;
        if (val > max) val = max;

        el.value = val;
        window.TempState.buyQty = val;

        const item = window.GlobalState.shop.npc.find(i=>i.id===window.TempState.buyTargetId) || window.GlobalState.shop.user.find(i=>i.id===window.TempState.buyTargetId);
        if (item) {
            document.getElementById('buy-total-display').innerText = `總價: ${item.price * val}`;
        }
    },
    confirmBuy: () => ShopEngine.buyItem(window.TempState.buyTargetId, window.TempState.buyQty),

    // 上架表單
    shopUploadChange: (initVal = null) => {
        const catEl = document.getElementById('up-cat');
        const container = document.getElementById('up-dyn-container');
        if (!catEl || !container) return; 
        
        const cat = catEl.value;
        container.innerHTML = '';
        const label = (txt) => `<label class="section-title">${txt}</label>`;

        if (cat === '熱量') {
            container.innerHTML = `${label('數值 (Kcal)')} ${ui.input.number(initVal||'', "0", "", 4, "up-val-cal")}`;
        } else if (cat === '金錢') {
            container.innerHTML = `${label('數值 ($)')} ${ui.input.number(initVal||'', "0", "", 4, "up-val-gold")}`;
        } else if (cat === '時間') {
            let h = '', m = '';
            if (initVal && typeof initVal === 'string' && initVal.includes(':')) {
                [h, m] = initVal.split(':');
            }
            container.innerHTML = `
                ${label('時間 (時:分)')}
                <div style="display:flex; align-items:center; gap:5px;">
                    ${ui.input.number(h, "00", "", 2, "up-val-h")}
                    <span style="font-weight:bold;">:</span>
                    ${ui.input.number(m, "00", "", 2, "up-val-m")}
                </div>`;
        }
    },
    submitUpload: ShopEngine.submitUpload,
    deleteShopItem: ShopEngine.deleteShopItem,

    // 背包相關
    useItem: (isDiscard) => {
        const qty = parseInt(document.getElementById('bd-qty').value) || 1;
        ShopEngine.useItem(window.TempState.useTargetId, qty, isDiscard);
    },
    validateNumber: (el, max) => {
        let v = parseInt(el.value);
        if (isNaN(v)) v = '';
        else if (v > max) v = max;
        el.value = v;
    },
    updateItemQty: (delta, maxOwned) => {
        let el = document.getElementById('bd-qty');
        if (!el) return;
        let val = parseInt(el.value) || 1;
        const max = maxOwned; 

        if (delta === 'min') val = 1;
        else if (delta === 'max') val = max;
        else if (delta === 0) val = parseInt(el.value) || 1;
        else val += delta;

        if (val < 1) val = 1;
        if (val > max) val = max;

        el.value = val;
    },

    // 資金與精力
    submitPayment: ShopEngine.submitPayment,
    openPayment: view.renderPayment,
    openStaminaShop: view.renderStaminaShop,
    
    // 視窗攔截器
    openModal: (id) => {
        if (id === 'bag') {
            view.renderBag(); 
        } else {
            if (id === 'quick') { if(view.renderQuick) view.renderQuick(); } 
            const m = document.getElementById('m-'+id); 
            if(m) { m.style.display='flex'; m.classList.add('active'); }
        }
    },
});

setTimeout(ShopEngine.init, 100);
window.ShopEngine = ShopEngine;