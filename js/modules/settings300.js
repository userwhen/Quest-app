/* js/modules/settings300.js */

const SettingsEngine = {
    // 儲存設定邏輯
    save: () => {
        // 從 UI 獲取數值
        const mode = document.getElementById('set-mode').value;
        const calMode = document.getElementById('set-cal-mode').checked;
        const strictMode = document.getElementById('set-strict-mode').checked;

        // 寫入 GlobalState
        if (!window.GlobalState.settings) window.GlobalState.settings = {};
        window.GlobalState.settings.mode = mode;
        window.GlobalState.settings.calMode = calMode;
        window.GlobalState.settings.strictMode = strictMode;

        // 執行存檔與導航
        act.save(); // 呼叫 Core 的存檔
        act.toast("✅ 設定已儲存");
        act.closeModal('panel'); // 關閉 Layer 1 面板

        // 根據模式重整介面
        if (mode === 'basic') act.navigate('stats');
        else act.navigate('main');
        
        // 全局重繪以套用新設定
        if (view.render) view.render();
    },

    // 重置邏輯
    resetData: () => {
        act.confirm("⚠️ 確定要重置所有資料嗎？(不可復原)", (yes) => {
            if (yes) {
                window.isResetting = true;
                localStorage.clear();
                location.reload();
            }
        });
    },

    // 匯出邏輯
    exportData: () => {
        const str = JSON.stringify(window.GlobalState);
        // 使用 Prompt 讓用戶複製，或是用特殊的 Copy UI
        // 這裡示範簡單的 Prompt
        act.prompt("複製以下代碼：", str);
    },

    // 匯入邏輯
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
    
    // 卡路里檢查 (當勾選時觸發)
    checkCal: () => {
        const chk = document.getElementById('set-cal-mode');
        if (chk && chk.checked) {
            act.prompt("設定每日目標熱量 (Kcal)", "2000", (val) => {
                const limit = parseInt(val);
                if (limit > 0) {
                    window.GlobalState.settings.calMax = limit;
                } else {
                    chk.checked = false;
                    act.toast("❌ 無效數值");
                }
            });
        }
    }
};

// ==========================================
// View: 動態生成設定視窗 (Layer 1 Panel)
// ==========================================
window.view = window.view || {};

view.renderSettings = () => {
    const s = window.GlobalState.settings || {};
    const mode = s.mode || 'adventurer';
    
    // 1. 模式選擇
    const htmlMode = `
        <label class="section-title">遊戲模式</label>
        ${ui.input.select([
            {value:'adventurer', label:'🛡️ 冒險者模式 (標準)'},
            {value:'harem', label:'💕 后宮模式 (沈浸)'},
            {value:'basic', label:'📊 基礎模式 (純數據)'}
        ], mode, "", "set-mode")}
    `;

    // 2. 開關選項 (Checkbox)
    // 這裡我們手寫 checkbox 因為 ui 庫目前沒有專屬的 switch 元件
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

    // 3. 資料管理區
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
    
    // 4. 其他功能
    const htmlDebug = `
        <div style="margin-top:10px;">
            ${ui.btn.ghost('[Debug] 模擬跨日', 'act.debugDay()', 'u-btn-block')}
        </div>
    `;

    const bodyHtml = `
        <div style="padding:5px;">
            ${htmlMode}
            ${htmlSwitches}
            ${htmlData}
            ${htmlDebug}
        </div>
    `;

    const footHtml = `
        ${ui.btn.primary('儲存設定', 'SettingsEngine.save()', 'u-btn-block')}
    `;

    // ★ 呼叫工廠！使用 'panel' 層級 (Layer 1)
    view.renderModal('⚙️ 設定', bodyHtml, footHtml, 'panel');
};

// 綁定到 window 以便 HTML onclick 呼叫
window.SettingsEngine = SettingsEngine;