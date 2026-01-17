/* js/modules/debug300.js - V10.0 (Integrated Dev Tools) */
window.Debug = window.Debug || {};
window.act = window.act || {};

// 定義 Dev 狀態 (預設關閉)
window.GlobalState = window.GlobalState || {};
if (!window.GlobalState.settings) window.GlobalState.settings = {};
window.GlobalState.settings.devMode = false; // 預設關閉

Object.assign(window.Debug, {
    devClickCount: 0,

    // [核心] 顯示開發者選單
    showMenu: () => {
        act.showSysModal('prompt', '🛠️ 開發者控制台', '', (val) => {}); 
        const txt = document.getElementById('sys-msg');
        
        // 注入功能按鈕
        txt.innerHTML = `
            <div style="display:grid; gap:10px; grid-template-columns: 1fr 1fr;">
                <button class="u-btn u-btn-primary" onclick="Debug.debugDay()">📅 模擬跨日</button>
                <button class="u-btn u-btn-primary" onclick="Debug.restoreEnergy()">⚡ 精力全滿</button>
                <button class="u-btn u-btn-secondary" onclick="Debug.toggleDevMode()">🔓 DevMode: ${window.GlobalState.settings.devMode ? 'ON' : 'OFF'}</button>
                <button class="u-btn u-btn-secondary" onclick="location.reload()">🔄 重載</button>
            </div>
        `;
        
        // 隱藏不需要的元件
        if(document.getElementById('sys-input')) document.getElementById('sys-input').style.display = 'none';
        if(document.getElementById('sys-ok')) document.getElementById('sys-ok').style.display = 'none';
        if(document.getElementById('sys-cancel')) {
            document.getElementById('sys-cancel').style.display = 'block';
            document.getElementById('sys-cancel').innerText = '關閉';
        }
    },

    // [功能] 切換 Dev Mode (影響成就視窗顯示)
    toggleDevMode: () => {
        window.GlobalState.settings.devMode = !window.GlobalState.settings.devMode;
        act.alert(`DevMode 已${window.GlobalState.settings.devMode ? '開啟' : '關閉'} (請重開成就視窗生效)`);
        window.Debug.showMenu(); // 刷新按鈕狀態
    },

    // [功能] 模擬跨日
    debugDay: () => { 
        const d = new Date();
        d.setDate(d.getDate()-1); 
        window.GlobalState.lastLoginDate = d.toISOString().split('T')[0]; 
        act.save(); 
        act.checkDaily(); 
        act.alert("已模擬昨日登入，請重整或觸發檢查");
    },

    // [功能] 精力全滿 (劇情模式用)
    restoreEnergy: () => {
        if (!window.GlobalState.story) window.GlobalState.story = {};
        window.GlobalState.story.energy = 100;
        act.save();
        act.alert("精力已恢復至 100%");
    },

    // [觸發器] 綁定在某個隱藏角落 (例如設定頁標題)
    triggerDevMode: () => { 
        window.Debug.devClickCount++; 
        if (window.Debug.devClickCount >= 5) { 
            window.Debug.devClickCount = 0;
            window.Debug.showMenu();
        } 
    }
});

// 掛載到 act 以便 HTML 呼叫
Object.assign(window.act, {
    triggerDevMode: window.Debug.triggerDevMode,
    debugDay: window.Debug.debugDay
});