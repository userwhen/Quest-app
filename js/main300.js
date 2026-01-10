/* js/main300.js - V12.0 System Daemon */

// 配置
const SYSTEM_CONFIG = {
    saveInterval: 10000, // 每 10 秒自動存檔
    debug: false
};
const SAVE_KEY = 'LQ_V1'; // 強制統一

// [任務 1] 自動存檔循環
setInterval(() => {
    if (window.Core && window.Core.save) {
        if (SYSTEM_CONFIG.debug) console.log("💾 Auto-saving...");
        Core.save();
    }
}, SYSTEM_CONFIG.saveInterval);

// [任務 2] 頁面隱藏/關閉時強制存檔
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'hidden') {
        if (window.Core && window.Core.save) {
            console.log("⏸️ App suspended, forcing save.");
            Core.save();
        }
    }
});

// [任務 3] 錯誤捕捉 (選用)
window.onerror = function(message, source, lineno, colno, error) {
    console.error("🚨 System Error:", message);
    // 可在此處加入彈出錯誤視窗的邏輯
    // if(act && act.alert) act.alert("系統發生錯誤，請重新整理");
};