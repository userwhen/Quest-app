/* js/main300.js - V15.5 Anti-Override (Fix Jump Back) */
window.isResetting = false;

// 取得存檔鍵值
const SAVE_KEY = (window.GameConfig && window.GameConfig.System) ? window.GameConfig.System.SaveKey : 'SQ_V103';
const SAVE_INTERVAL = (window.GameConfig && window.GameConfig.System) ? window.GameConfig.System.SaveInterval : 5000;

function fixTs(d) {
    if (typeof d === 'number') return d;
    if (!d) return Date.now();
    return isNaN(new Date(d).getTime()) ? Date.now() : new Date(d).getTime();
}

window.forceSaveNow = function() { 
    if (window.isResetting) return;
    try { 
        if (typeof GlobalState !== 'undefined') localStorage.setItem(SAVE_KEY, JSON.stringify(GlobalState)); 
    } catch (err) { console.error(err); } 
};

// ==========================================
// 1. 讀檔與資料復原 (Load Data)
// ==========================================
try {
    let saved = localStorage.getItem(SAVE_KEY);
    if (saved) { 
        let parsed = JSON.parse(saved);
        
        // 合併預設資料
        window.GlobalState = { ...window.DefaultData, ...parsed }; 
        
        // 深層合併關鍵物件
        if(parsed.shop) GlobalState.shop = { ...DefaultData.shop, ...parsed.shop }; 
        if(parsed.attrs) GlobalState.attrs = { ...DefaultData.attrs, ...parsed.attrs };
        if(parsed.avatar) GlobalState.avatar = { ...DefaultData.avatar, ...parsed.avatar };
        if(parsed.settings) GlobalState.settings = { ...DefaultData.settings, ...parsed.settings };
        
        if(!GlobalState.history) GlobalState.history = [];
        if(!GlobalState.skills) GlobalState.skills = [];

        // Data Patch
        if (GlobalState.history.length > 0) GlobalState.history.forEach(h => h.finishDate = fixTs(h.finishDate));
        if (GlobalState.achievements) GlobalState.achievements.forEach(a => { if(a.done) a.date = fixTs(a.date); });
    
    } else { 
        // 無存檔
        window.GlobalState = JSON.parse(JSON.stringify(window.DefaultData));
    }
} catch (e) { 
    console.error("Save Load Error:", e);
    window.GlobalState = JSON.parse(JSON.stringify(window.DefaultData));
}

// ==========================================
// 2. 引擎初始化 (Engine Init)
// ==========================================
if (window.StatsEngine && window.StatsEngine.init) {
    window.StatsEngine.init();
}

if (window.TaskEngine && window.TaskEngine.init) {
    window.TaskEngine.init(); 
}

if (window.AchEngine && window.AchEngine.init) {
    // 預留
}

// ==========================================
// 3. 啟動序列 (Boot Sequence) - [終極修正]
// ==========================================
if (typeof act !== 'undefined') { 
    
    // 檢查每日重置
    if(act.checkDaily) act.checkDaily();

    if (act.navigate) {
        // 1. 決定目標首頁
        const startPage = (GlobalState.settings && GlobalState.settings.mode === 'basic') ? 'stats' : 'main';
        
        // 2. [防覆蓋檢查]
        // 檢查當前 DOM 狀態。如果目前 Active 的頁面不是 HTML 預設的 'page-main'，
        // 代表使用者已經手動點擊了導航，這時候腳本絕對不能插手！
        const currentActive = document.querySelector('.page.active');
        const isUserMoved = currentActive && currentActive.id !== 'page-main';
        const isAlreadyThere = currentActive && currentActive.id === `page-${startPage}`;

        if (isUserMoved) {
            // 情況 A: 玩家已經跑去別頁了 (例如 Stats) -> 腳本閉嘴，原地渲染就好
            console.log(`[Boot] 偵測到玩家已在 ${currentActive.id}，取消自動導航。`);
            if (window.view && view.render) view.render();
        } 
        else if (!isAlreadyThere) {
            // 情況 B: 玩家還在預設的大廳，但設定說要去 Stats -> 執行導航
            act.navigate(startPage); 
        } 
        else {
            // 情況 C: 玩家在大廳，設定也是大廳 -> 原地渲染
            if (startPage === 'main' && ui.renderMain) ui.renderMain(GlobalState.settings.mode);
            if (startPage === 'stats' && view.renderStats) view.renderStats();
            if (view.renderHUD) view.renderHUD(window.GlobalState);
        }
    }
    
    // [保險機制] 
    setTimeout(() => {
        // 再次確保至少有畫面，但絕不呼叫 navigate
        if (window.view && view.render) view.render();
    }, 50);
    
    if (act.checkTutorial) act.checkTutorial();
}

// ==========================================
// 4. 自動存檔掛載 (Auto Save)
// ==========================================
setInterval(window.forceSaveNow, SAVE_INTERVAL); 
document.addEventListener("visibilitychange", function() { 
    if (document.visibilityState === 'hidden' && !window.isResetting) window.forceSaveNow(); 
});