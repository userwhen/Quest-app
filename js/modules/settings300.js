const SettingsEngine = {
    // 定義商店內販售的模式商品
    shopItems: [
        {
            id: 'harem',
            name: '💕 后宮模式',
            desc: '沈浸式體驗，專注於角色互動與好感度培養。<br>享受更多親密劇情與特殊事件。',
            price: 50,
            currencyType: 'free', // 免費鑽 (儲值鑽可補)
            color: '#e91e63',
            bg: '#fce4ec',
            border: '#f48fb1',
            badge: 'NEW'
        },
        {
            id: 'learning',
            name: '📚 語言學習模組',
            desc: '解鎖日、韓、英、法、西多語言劇情。<br>開啟獨家 <b>[MIX] 混沌模式</b>。',
            price: 100,
            currencyType: 'paid', // 僅限儲值鑽
            color: '#f57f17',
            bg: '#fff8e1',
            border: '#ffb300',
            badge: 'HOT'
        }
    ],

    // 1. 儲存設定 (包含模式互斥邏輯)
    save: () => {
        const modeEl = document.getElementById('set-mode');
        const calEl = document.getElementById('set-cal-mode');
        const strictEl = document.getElementById('set-strict-mode');
        
        const mode = modeEl ? modeEl.value : 'adventurer';
        const calMode = calEl ? calEl.checked : false;
        const strictMode = strictEl ? strictEl.checked : false;
        
        if (!window.GlobalState.settings) window.GlobalState.settings = {};
        const s = window.GlobalState.settings;

        s.mode = mode;
        s.calMode = calMode;
        s.strictMode = strictMode;
        
        // [修改] 模式互斥邏輯：只有當前模式為 'learning' 時，learningMode 才為 true
        if (mode === 'learning') {
            s.learningMode = true;
            if (!s.targetLang) s.targetLang = 'mix';
        } else {
            s.learningMode = false; // 切換到其他模式，強制關閉學習功能
        }

        act.save();
        act.toast("✅ 設定已儲存");
        act.closeModal('m-panel');

        // 刷新頁面
        if (document.getElementById('page-story') && document.getElementById('page-story').style.display === 'block') {
             if(window.view && window.view.renderStoryPage) window.view.renderStoryPage();
        }
        if (mode === 'basic') act.navigate('stats');
        else act.navigate('main');
        if (view.render) view.render();
    },

    // 2. 購買功能 (雙貨幣邏輯)
    buyItem: (itemId) => {
        const gs = window.GlobalState;
        const item = SettingsEngine.shopItems.find(i => i.id === itemId);
        if (!item) return;

        // 確保數值安全
        const freeGem = gs.freeGem || 0;     // 💎 免費鑽
        const paidGem = gs.paidGem || 0;     // 💠 儲值鑽

        // --- 邏輯 A: 儲值鑽限定 ---
        if (item.currencyType === 'paid') {
            if (paidGem < item.price) {
                act.toast(`❌ 儲值鑽不足 (需要 ${item.price} 💠)`);
                return;
            }
            gs.paidGem -= item.price;
        } 
        // --- 邏輯 B: 免費鑽 (儲值鑽可補) ---
        else {
            const totalAssets = freeGem + paidGem;
            if (totalAssets < item.price) {
                act.toast(`❌ 鑽石總額不足 (需要 ${item.price} 💎)`);
                return;
            }
            // 扣款順序：先扣免費，不夠的扣儲值
            let cost = item.price;
            if (freeGem >= cost) {
                gs.freeGem -= cost;
            } else {
                cost -= freeGem; // 扣光免費鑽後的剩餘款項
                gs.freeGem = 0;
                gs.paidGem -= cost;
            }
        }
        
        // 解鎖與自動切換
        if (!gs.unlocks) gs.unlocks = {};
        gs.unlocks[itemId] = true;
        
        // 購買後直接切換到該模式
        gs.settings.mode = itemId;
        if (itemId === 'learning') {
            gs.settings.learningMode = true;
            gs.settings.targetLang = 'mix';
        } else {
            gs.settings.learningMode = false;
        }

        act.save();
        act.toast(`🎉 購買成功！已解鎖 ${item.name}`);
        
        // 刷新商店 (停留在當前卡片)
        SettingsEngine.openShopModal(SettingsEngine.shopItems.findIndex(i => i.id === itemId));
        // 刷新設定頁 (更新下拉選單)
        view.renderSettings();
    },

    // 3. 開啟商店 (輪播介面)
    openShopModal: (index = 0) => {
        const gs = window.GlobalState;
        const items = SettingsEngine.shopItems;
        
        // 索引循環
        if (index < 0) index = items.length - 1;
        if (index >= items.length) index = 0;

        const currentItem = items[index];
        const isUnlocked = gs.unlocks && gs.unlocks[currentItem.id];

        // 導航按鈕
        const prevBtn = items.length > 1 ? `<button onclick="SettingsEngine.openShopModal(${index - 1})" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#888; padding:0 10px;">◀</button>` : '';
        const nextBtn = items.length > 1 ? `<button onclick="SettingsEngine.openShopModal(${index + 1})" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#888; padding:0 10px;">▶</button>` : '';

        // 價格顯示字串
        let priceDisplay = '';
        if (isUnlocked) {
            priceDisplay = '✅ 已擁有';
        } else {
            priceDisplay = currentItem.currencyType === 'paid' ? 
                `💠 ${currentItem.price}` : `💎 ${currentItem.price}`;
        }

        // 卡片 HTML
        const cardHtml = `
            <div style="flex:1; border:2px solid ${currentItem.border}; border-radius:10px; padding:15px; background:${currentItem.bg}; text-align:left; position:relative; min-height:160px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h3 style="margin:0; color:${currentItem.color}; font-size:1.1rem;">${currentItem.name}</h3>
                        ${currentItem.badge ? `<span style="background:${currentItem.border}; color:#000; padding:2px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">${currentItem.badge}</span>` : ''}
                    </div>
                    <p style="font-size:0.9rem; color:#555; margin-bottom:15px; line-height:1.6;">
                        ${currentItem.desc}
                    </p>
                </div>
                <div style="font-size:1.4rem; font-weight:bold; color:${currentItem.color}; text-align:right;">
                    ${priceDisplay}
                </div>
            </div>
        `;

        const bodyHtml = `
            <div style="text-align:center; padding:5px;">
                <div style="font-size:0.9rem; font-weight:bold; margin-bottom:15px; color:#333; display:flex; justify-content:center; gap:15px;">
                    <span>💎 免費: <span style="color:#0288d1;">${gs.freeGem||0}</span></span>
                    <span>💠 儲值: <span style="color:#9c27b0;">${gs.paidGem||0}</span></span>
                </div>
                
                <div style="display:flex; align-items:center; justify-content:center; gap:5px;">
                    ${prevBtn}
                    ${cardHtml}
                    ${nextBtn}
                </div>
                
                <div style="margin-top:10px; font-size:0.8rem; color:#999;">
                    (${index + 1} / ${items.length})
                </div>
            </div>
        `;

        // Footer 按鈕邏輯
        let footHtml = '';
        if (isUnlocked) {
            footHtml = ui.btn.secondary('已購買', "act.closeModal('m-overlay')", 'u-btn-block');
        } else {
            const myPaid = gs.paidGem || 0;
            const myFree = gs.freeGem || 0;
            const price = currentItem.price;
            let canAfford = false;
            let btnText = '';

            if (currentItem.currencyType === 'paid') {
                canAfford = myPaid >= price;
                btnText = canAfford ? `立即購買 (-${price}💠)` : `儲值鑽不足 (需 ${price})`;
            } else {
                canAfford = (myFree + myPaid) >= price;
                btnText = canAfford ? `立即購買 (-${price}💎)` : `鑽石不足 (需 ${price})`;
            }

            const btnClass = canAfford ? 'u-btn-block' : 'u-btn-block u-btn-secondary';
            footHtml = ui.btn.primary(btnText, `SettingsEngine.buyItem('${currentItem.id}')`, btnClass);
        }

        view.renderModal('🛒 模式商店', bodyHtml, footHtml, 'overlay');
    },

    // 4. 重置資料
    resetData: () => {
        const body = `<div style="padding:20px; text-align:center; color:#d32f2f; font-weight:bold;">⚠️ 確定要重置所有資料嗎？<br>(此操作不可復原)</div>`;
        const footer = `
            ${ui.btn.secondary('取消', "act.closeModal('m-system')", 'u-btn-block')}
            ${ui.btn.danger('確定重置', "SettingsEngine.performReset()", 'u-btn-block')}
        `;
        view.renderModal('危險操作', body, footer, 'system');
    },

    performReset: () => {
        act.closeModal('m-system');
        window.isResetting = true;
        localStorage.clear();
        location.reload();
    },

    // 5. 匯出存檔
    exportData: () => {
        const str = JSON.stringify(window.GlobalState);
        const body = `
            <div style="padding:10px;">
                <p style="font-size:0.9rem; color:#666; margin-bottom:5px;">請複製以下代碼：</p>
                ${ui.input.textarea(str, '', '', 'inp-export-area')}
            </div>`;
        const footer = ui.btn.primary('關閉', "act.closeModal('m-overlay')", 'u-btn-block');
        view.renderModal('匯出存檔', body, footer, 'overlay');
        setTimeout(() => { const el = document.getElementById('inp-export-area'); if(el) el.select(); }, 200);
    },

    // 6. 匯入存檔
    importData: () => {
        const body = `
            <div style="padding:10px;">
                <p style="font-size:0.9rem; color:#666; margin-bottom:5px;">請貼上存檔代碼：</p>
                ${ui.input.textarea('', '在此貼上 JSON 代碼...', '', 'inp-import-area')}
            </div>`;
        const footer = ui.btn.primary('確認匯入', "SettingsEngine.processImport()", 'u-btn-block');
        view.renderModal('匯入存檔', body, footer, 'overlay');
    },

    processImport: () => {
        const el = document.getElementById('inp-import-area');
        const val = el ? el.value : '';
        if (!val) { act.toast("❌ 內容為空"); return; }
        try {
            const data = JSON.parse(val);
            if (data && (data.lv || data.gold || data.settings)) {
                window.GlobalState = data;
                act.save();
                act.closeModal('m-overlay');
                act.toast("✅ 匯入成功，正在重載...");
                setTimeout(() => location.reload(), 1000);
            } else {
                act.toast("❌ 存檔格式錯誤");
            }
        } catch (e) {
            act.toast("❌ 無效的 JSON 格式");
        }
    },

    // 7. 卡路里設定
    checkCal: () => {
        const chk = document.getElementById('set-cal-mode');
        if (chk && chk.checked) {
            const currentMax = window.GlobalState.settings?.calMax || 2000;
            const body = `
                <div style="padding:20px; text-align:center;">
                    <p style="margin-bottom:10px;">設定每日目標熱量 (Kcal)</p>
                    ${ui.input.number(currentMax, '例如: 2000', '', 5, 'inp-cal-target')}
                </div>
            `;
            const cancelAction = "document.getElementById('set-cal-mode').checked = false; act.closeModal('m-overlay');";
            const footer = `
                ${ui.btn.secondary('取消', cancelAction, 'u-btn-block')}
                ${ui.btn.primary('確定', "SettingsEngine.saveCal()", 'u-btn-block')}
            `;
            view.renderModal('🔥 卡路里設定', body, footer, 'overlay');
            setTimeout(() => {
                const closeBtn = document.querySelector('#m-overlay .btn-close-red');
                if(closeBtn) closeBtn.onclick = () => { eval(cancelAction); };
            }, 50);
        }
    },

    saveCal: () => {
        const el = document.getElementById('inp-cal-target');
        const limit = parseInt(el.value);
        if (limit > 0) {
            if(!window.GlobalState.settings) window.GlobalState.settings = {};
            window.GlobalState.settings.calMax = limit;
            act.toast(`✅ 目標已更新: ${limit} Kcal`);
            act.closeModal('m-overlay');
        } else {
            act.toast("❌ 請輸入有效的數值");
        }
    }
};

view.renderSettings = () => {
    const s = window.GlobalState.settings || {};
    const unlocks = window.GlobalState.unlocks || {};
    
    // 1. 構建遊戲模式選項
    let modeOptions = [
        {value:'adventurer', label:'🛡️ 冒險者模式 (標準)'},
        {value:'basic', label:'📊 基礎模式 (純數據)'}
    ];

    // 動態加入：已解鎖的模式
    if (unlocks.harem) modeOptions.splice(1, 0, {value:'harem', label:'💕 后宮模式 (沈浸)'});
    if (unlocks.learning) modeOptions.push({value:'learning', label:'📚 語言學習模式 (Mix)'});

    const currentMode = s.mode || 'adventurer';

    // 核心設定區
    const htmlCore = `
        <label class="section-title">核心設定</label>
        <div style="margin-bottom:15px;">
            <div style="font-size:0.9rem; color:#666; margin-bottom:5px;">遊戲模式</div>
            ${ui.input.select(modeOptions, currentMode, "", "set-mode")}
        </div>
        
        <div onclick="SettingsEngine.openShopModal()" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #ffb300; background:#fff8e1; border-radius:8px; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.5rem;">🛒</span>
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:bold; color:#f57f17; font-size:1rem;">前往模式商店</span>
                    <span style="font-size:0.8rem; color:#888;">解鎖更多遊戲體驗</span>
                </div>
            </div>
            <div style="font-size:1.2rem; color:#f57f17; font-weight:bold;">&gt;</div>
        </div>
    `;

    // 微調開關區
    const htmlTweaks = `
        <div style="margin-top:20px;">
            <label class="section-title">微調開關</label>
            <div style="display:flex; gap:10px;">
                <label style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:12px; background:#f5f5f5; border:1px solid #ddd; border-radius:8px; cursor:pointer;">
                    <input type="checkbox" id="set-cal-mode" ${s.calMode?'checked':''} onchange="SettingsEngine.checkCal()" style="transform:scale(1.2);"> 
                    <span style="font-weight:bold; color:#555;">🔥 卡路里</span>
                </label>
                <label style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:12px; background:#f5f5f5; border:1px solid #ddd; border-radius:8px; cursor:pointer;">
                    <input type="checkbox" id="set-strict-mode" ${s.strictMode?'checked':''} style="transform:scale(1.2);"> 
                    <span style="font-weight:bold; color:#555;">⚡ 嚴格模式</span>
                </label>
            </div>
        </div>
    `;

    // 資料管理區 (新佈局：兩行，每行兩個按鈕平分)
    const htmlData = `
        <div style="margin-top:25px; padding-top:15px; border-top:1px dashed #ccc;">
            <label class="section-title">系統與資料</label>
            
            <div style="display:flex; gap:10px; margin-bottom:10px;">
                <div style="flex:1;">${ui.btn.secondary('📥 匯入存檔', 'SettingsEngine.importData()', 'u-btn-block')}</div>
                <div style="flex:1;">${ui.btn.secondary('📤 匯出存檔', 'SettingsEngine.exportData()', 'u-btn-block')}</div>
            </div>
            
            <div style="display:flex; gap:10px;">
                <div style="flex:1;">${ui.btn.danger('⚠️ 重置資料', 'SettingsEngine.resetData()', 'u-btn-block')}</div>
                <div style="flex:1;">${ui.btn.ghost('🐞 Debug', 'act.debugDay()', 'u-btn-block')}</div>
            </div>
        </div>
    `;
    
    const bodyHtml = `<div style="padding:10px 5px;">${htmlCore}${htmlTweaks}${htmlData}</div>`;
    const footHtml = `${ui.btn.primary('儲存設定', 'SettingsEngine.save()', 'u-btn-block')}`;

    view.renderModal('⚙️ 設定', bodyHtml, footHtml, 'panel');
};