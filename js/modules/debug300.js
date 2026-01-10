/* js/modules/debug.js - V12.0 Debug Tools */
window.act = window.act || {};

Object.assign(window.act, {
    // [數據重置]
    resetGame: () => {
        if (confirm("⚠️ 確定要重置所有數據嗎？此操作無法還原！")) {
            const key = window.GameConfig.System.SaveKey || 'SQ_V1';
            localStorage.removeItem(key);
            location.reload(); // 重新整理網頁以讀取 DefaultData
        }
    },

    // [存盤完整性檢查]
    validateState: () => {
        const gs = window.GlobalState;
        const def = window.DefaultData;
        let fixed = false;

        // 遞迴檢查缺失欄位並補齊
        const checkKeys = (target, reference) => {
            for (let key in reference) {
                if (target[key] === undefined) {
                    target[key] = JSON.parse(JSON.stringify(reference[key]));
                    fixed = true;
                    console.warn(`Debug: Missing key [${key}] fixed.`);
                } else if (typeof reference[key] === 'object' && reference[key] !== null) {
                    checkKeys(target[key], reference[key]);
                }
            }
        };

        checkKeys(gs, def);
        if (fixed) Core.save();
    }
});