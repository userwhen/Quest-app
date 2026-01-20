/* js/modules/settings300.js - V28.1 UI: Integrated Shop & Learning */

const SettingsEngine = {
    // 儲存設定
    save: () => {
        const mode = document.getElementById('set-mode').value;
        const calMode = document.getElementById('set-cal-mode').checked;
        const strictMode = document.getElementById('set-strict-mode').checked;
        
        // 獲取學習模式開關 (如果元素存在)
        const learningEl = document.getElementById('set-learning-mode');
        const learningMode = learningEl ? learningEl.checked : (window.GlobalState.settings?.learningMode || false);

        if (!window.GlobalState.settings) window.GlobalState.settings = {};
        window.GlobalState.settings.mode = mode;
        window.GlobalState.settings.calMode = calMode;
        window.GlobalState.settings.strictMode = strictMode;
        window.GlobalState.settings.learningMode = learningMode;

        // 開啟學習模式若無語言，預設 MIX
        if (learningMode && !window.GlobalState.settings.targetLang) {
            window.GlobalState.settings.targetLang = 'mix';
        }

        act.save();
        act.toast("✅ 設定已儲存");
        act.closeModal('panel');

        // 刷新劇情頁 TopBar
        if (document.getElementById('page-story') && document.getElementById('page-story').style.display === 'block') {
             if(window.view && window.view.renderStoryPage) window.view.renderStoryPage();
        }

        if (mode === 'basic') act.navigate('stats');
        else act.navigate('main');
        
        if (view.render) view.render();
    },

    // 購買學習模式
    buyLearningMode: () => {
        const gs = window.GlobalState;
        if ((gs.gems || 0) < 100) {
            act.toast("❌ 鑽石不足 (需要 100)");
            return;
        }
        
        gs.gems -= 100;
        if (!gs.unlocks) gs.unlocks = {};
        gs.unlocks.learningMode = true;
        
        // 自動開啟並設定 MIX
        if (!gs.settings) gs.settings = {};
        gs.settings.learningMode = true;
        gs.settings.targetLang = 'mix';

        act.save();
        act.toast("🎉 購買成功！學習模式已解鎖");
        
        // 關閉商店並重繪設定頁
        const shop = document.getElementById('modal-shop');
        if(shop) shop.remove();
        view.renderSettings(); 
    },

    // 測試領鑽
    addTestGems: () => {
        const gs = window.GlobalState;
        gs.gems = (gs.gems || 0) + 100;
        act.save();
        const el = document.getElementById('shop-gems');
        if(el) el.innerText = gs.gems;
        act.toast("🎁 +100 鑽石");
    },
    
    // ... (保留 resetData, exportData, importData, checkCal 邏輯)
    resetData: () => {
        act.confirm("⚠️ 確定要重置所有資料嗎？(不可復原)", (yes) => {
            if (yes) {
                window.isResetting = true;
                localStorage.clear();
                location.reload();
            }
        });
    },
    exportData: () => {
        const str = JSON.stringify(window.GlobalState);
        act.prompt("複製以下代碼：", str);
    },
    importData: () => {
        act.prompt("請貼上存檔代碼：", "", (val) => {
            if (!val) return;
            try {
                const data = JSON.parse(val);
                if (data && (data.lv || data.gold || data.settings)) {
                    window.GlobalState = data;
                    act.save();
                    act.toast("✅ 匯入成功，正在重載...");
                    setTimeout(() => location.reload(), 1000);
                } else {
                    act.toast("❌ 存檔格式錯誤");
                }
            } catch (e) {
                act.toast("❌ 無效的 JSON");
            }
        });
    },
    checkCal: () => {
        const chk = document.getElementById('set-cal-mode');
        if (chk && chk.checked) {
            act.prompt("設定每日目標熱量 (Kcal)", "2000", (val) => {
                const limit = parseInt(val);
                if (limit > 0) window.GlobalState.settings.calMax = limit;
                else { chk.checked = false; act.toast("❌ 無效數值"); }
            });
        }
    }
};

window.SettingsEngine = SettingsEngine;

// View: 設定視窗
window.view = window.view || {};

view.renderSettings = () => {
    const s = window.GlobalState.settings || {};
    const unlocks = window.GlobalState.unlocks || {};
    const mode = s.mode || 'adventurer';
    
    // 模式選擇
    const htmlMode = `
        <label class="section-title">遊戲模式</label>
        ${ui.input.select([
            {value:'adventurer', label:'🛡️ 冒險者模式 (標準)'},
            {value:'harem', label:'💕 后宮模式 (沈浸)'},
            {value:'basic', label:'📊 基礎模式 (純數據)'}
        ], mode, "", "set-mode")}
    `;

    // 學習模式區塊
    let htmlLearning = '';
    if (unlocks.learningMode) {
        htmlLearning = `
            <div style="margin-top:15px; padding:10px; border:1px solid #ffd700; border-radius:8px; background:rgba(255,215,0,0.1);">
                <div style="color:#f57f17; font-weight:bold; margin-bottom:5px;">📚 語言學習模組 (已擁有)</div>
                <label style="display:flex; align-items:center; cursor:pointer;">
                    <input type="checkbox" id="set-learning-mode" ${s.learningMode ? 'checked' : ''} style="width:18px; height:18px; margin-right:8px;">
                    <span>啟用學習模式 (Mix Mode)</span>
                </label>
            </div>
        `;
    } else {
        htmlLearning = `
            <div style="margin-top:15px; padding:10px; border:1px dashed #aaa; border-radius:8px;">
                <div style="color:#666; font-weight:bold; margin-bottom:5px;">📚 語言學習模組 (未解鎖)</div>
                <button onclick="view.renderShop()" style="width:100%; padding:8px; background:linear-gradient(45deg, #ffb300, #f57f17); color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">
                    🛒 前往模式商店
                </button>
            </div>
        `;
    }

    // 一般開關
    const htmlSwitches = `
        <div style="display:flex; gap:15px; margin-top:15px;">
            <label class="card-btn" style="flex:1; justify-content:center;">
                <input type="checkbox" id="set-cal-mode" ${s.calMode?'checked':''} onchange="SettingsEngine.checkCal()"> 🔥 卡路里
            </label>
            <label class="card-btn" style="flex:1; justify-content:center;">
                <input type="checkbox" id="set-strict-mode" ${s.strictMode?'checked':''}> ⚡ 嚴格模式
            </label>
        </div>
    `;

    // 資料管理
    const htmlData = `
        <div style="margin-top:20px; padding-top:10px; border-top:1px dashed #ccc;">
            <label class="section-title">資料管理</label>
            <div style="display:flex; gap:10px; margin-top:5px;">
                ${ui.btn.secondary('匯出存檔', 'SettingsEngine.exportData()', 'u-btn-block')}
                ${ui.btn.secondary('匯入存檔', 'SettingsEngine.importData()', 'u-btn-block')}
            </div>
            <div style="margin-top:10px;">
                ${ui.btn.danger('重置所有資料', 'SettingsEngine.resetData()', 'u-btn-block')}
            </div>
        </div>
    `;
    
    const htmlDebug = `<div style="margin-top:10px;">${ui.btn.ghost('[Debug] 模擬跨日', 'act.debugDay()', 'u-btn-block')}</div>`;

    const bodyHtml = `<div style="padding:5px;">${htmlMode}${htmlLearning}${htmlSwitches}${htmlData}${htmlDebug}</div>`;
    const footHtml = `${ui.btn.primary('儲存設定', 'SettingsEngine.save()', 'u-btn-block')}`;

    view.renderModal('⚙️ 設定', bodyHtml, footHtml, 'panel');
};

// 模式商店 (獨立視窗)
view.renderShop = () => {
    act.closeModal('panel');
    const gs = window.GlobalState;
    if (!gs.gems) gs.gems = 0;

    let modal = document.createElement('div');
    modal.id = 'modal-shop';
    modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10000; display:flex; justify-content:center; align-items:center;`;

    modal.innerHTML = `
        <div style="background:#fff; width:90%; max-width:380px; border-radius:12px; padding:25px; position:relative; text-align:center;">
            <h2 style="color:#f57f17; margin-top:0;">🛒 模式商店</h2>
            <div style="margin-bottom:20px; font-size:1.1rem; font-weight:bold;">持有: 💎 <span id="shop-gems">${gs.gems}</span></div>
            
            <div style="border:2px solid #ffb300; border-radius:10px; padding:15px; background:#fff8e1; margin-bottom:20px;">
                <h3 style="margin:0 0 10px 0;">📚 語言學習模組</h3>
                <p style="font-size:0.9rem; color:#666; margin-bottom:15px; line-height:1.5;">
                    解鎖日、韓、英、法、西多語言劇情。<br>
                    開啟獨家 <b>[MIX] 混沌模式</b>。
                </p>
                <div style="font-size:1.4rem; font-weight:bold; color:#f57f17; margin-bottom:15px;">💎 100</div>
                <button onclick="SettingsEngine.buyLearningMode()" style="width:100%; padding:12px; background:#ffb300; color:#000; font-weight:bold; border:none; border-radius:8px; cursor:pointer; font-size:1rem;">立即購買</button>
            </div>
            
            <button onclick="SettingsEngine.addTestGems()" style="font-size:0.8rem; color:#999; background:none; border:none; cursor:pointer; margin-bottom:15px;">(測試) 領取鑽石</button>
            <div><button onclick="this.closest('#modal-shop').remove(); view.renderSettings();" style="background:none; border:none; color:#666; text-decoration:underline; cursor:pointer;">返回設定</button></div>
        </div>
    `;
    document.body.appendChild(modal);
};