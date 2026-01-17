/* js/modules/tutorial300.js - V5.0 Safe Check (No More Forced Jumps) */
window.act = window.act || {};

const Tutorial = {
    // ===================================
    // 檢查是否需要啟動教學
    // ===================================
    checkTutorial: () => {
        const gs = window.GlobalState;
        if (!gs) return;

        // 1. 初始化設定欄位
        if (!gs.settings) gs.settings = {};
        if (typeof gs.settings.tutorialDone === 'undefined') gs.settings.tutorialDone = false;

        // 2. [老手保護] 如果等級 > 1，視為已完成教學，直接標記為 true 並退出
        // 這能防止舊存檔被強制進入教學
        if (gs.lv > 1 && !gs.settings.tutorialDone) {
            console.log("檢測到老手玩家，自動跳過新手教學");
            gs.settings.tutorialDone = true;
            act.save();
            return;
        }

        // 3. 如果教學已完成，直接退出
        if (gs.settings.tutorialDone) return;

        // 4. [防干擾檢查] 如果真的要開始教學...
        // 先給一點緩衝，確認玩家沒有正在操作其他頁面
        setTimeout(() => {
            // 如果玩家已經跑去別的頁面 (例如屬性頁)，不要強制拉回大廳，暫緩教學
            const currentActive = document.querySelector('.page.active');
            if (currentActive && currentActive.id !== 'page-main') {
                console.log("玩家正在瀏覽其他頁面，暫緩新手教學");
                return;
            }

            // 只有當玩家還在大廳發呆時，才開始教學
            console.log("開始新手教學...");
            act.navigate('main'); // 確保在大廳
            Tutorial.startFlow();
        }, 500);
    },

    // ===================================
    // 教學流程 (簡化版)
    // ===================================
    startFlow: () => {
        // 第一步：歡迎視窗
        act.showSysModal('alert', "👋 歡迎來到 Questory！\n\n這是一個結合「待辦事項」與「RPG養成」的系統。\n完成現實生活中的任務，來培養你的角色吧！", null, () => {
            // 第二步：引導任務
            Tutorial.step2_Task();
        });
    },

    step2_Task: () => {
        act.showSysModal('alert', "📜 任務系統\n\n點擊下方的「任務」選單，新增你的第一條待辦事項。\n設定好重要性與緊急性，完成後可獲得金幣與經驗！", null, () => {
            // 第三步：完成
            Tutorial.finish();
        });
    },

    finish: () => {
        const gs = window.GlobalState;
        gs.settings.tutorialDone = true;
        
        // 送一點見面禮
        if (!gs.gold) gs.gold = 0;
        gs.gold += 100;
        
        act.save();
        act.toast("🎉 教學完成！獲得 100 金幣");
        
        // 刷新介面顯示金幣
        if(window.view && view.renderHUD) view.renderHUD(gs);
    }
};

// ===================================
// Act 綁定
// ===================================
window.act.checkTutorial = Tutorial.checkTutorial;

window.act.restartTutorial = () => {
    // 手動重看教學
    if(confirm("確定要重看新手教學嗎？")) {
        window.GlobalState.settings.tutorialDone = false;
        act.navigate('main');
        Tutorial.startFlow();
    }
};