/* js/modules/tutorial300.js - V12.0 Onboarding Flow */
window.act = window.act || {};

const TutorialEngine = {
    // [1. 啟動檢查]
    init: () => {
        const gs = window.GlobalState;
        // 判斷條件：等級 1 且 名字仍為預設值 'Commander' (或可新增專屬 flag)
        if (gs.lv === 1 && gs.name === 'Commander') {
            setTimeout(() => TutorialEngine.startStep1(), 500);
        }
    },

    // [2. 步驟一：命名與歡迎]
    startStep1: () => {
        act.prompt("👋 歡迎來到 LevLife！\n首先，請告訴我你的名字？", "冒險者", (name) => {
            if (name) {
                window.GlobalState.name = name;
                Core.save();
                if (window.view) view.renderHUD();
                
                // 接續步驟二
                setTimeout(() => TutorialEngine.startStep2(), 500);
            }
        });
    },

    // [3. 步驟二：引導任務]
    startStep2: () => {
        act.alert(`你好，${window.GlobalState.name}！\n\n這是你的冒險起點。試著點擊下方的 [任務] 按鈕，建立你的第一個目標吧！`, () => {
            // 這裡可以做更進階的 DOM Highlighting，目前先簡單引導
            const navTask = document.getElementById('nav-task');
            if (navTask) {
                navTask.style.border = "2px solid gold";
                navTask.style.animation = "pulse 1s infinite";
                
                // 監聽點擊後移除特效
                navTask.onclick = () => {
                    act.navigate('task');
                    navTask.style.border = "none";
                    navTask.style.animation = "none";
                };
            }
        });
    }
};

// 掛載到 act 以供 Core.init 呼叫
window.act.checkTutorial = TutorialEngine.init;