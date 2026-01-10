/* js/modules/ach300.js - V12.0 Achievement System */
window.act = window.act || {};

const AchEngine = {
    // [1. 自動解鎖檢查]
    // 建議在 Core.save() 前或特定事件後呼叫
    checkAutoUnlock: () => {
        const gs = window.GlobalState;
        const achs = gs.achievements || [];
        let hasUpdate = false;

        achs.forEach(a => {
            if (a.done) return; // 已完成跳過

            // --- 判斷邏輯 ---
            let unlocked = false;

            // 類型 A: 等級成就 (targetType: 'lv')
            if (a.targetType === 'lv' && gs.lv >= a.targetVal) unlocked = true;

            // 類型 B: 金幣成就 (targetType: 'gold')
            if (a.targetType === 'gold' && gs.gold >= a.targetVal) unlocked = true;
            
            // 類型 C: 屬性極限 (targetType: 'attr_max')
            if (a.targetType === 'attr_max') {
                // 檢查是否有任一屬性 >= 10
                const maxLv = Math.max(...Object.values(gs.attrs).map(at => at.v));
                if (maxLv >= 10) unlocked = true;
            }

            // --- 解鎖執行 ---
            if (unlocked) {
                a.done = true;
                a.date = Date.now();
                hasUpdate = true;
                
                // 彈出通知
                act.alert(`🏆 解鎖成就：[${a.title}]\n\n${a.desc}`);
                
                // 發放獎勵 (若有的話)
                if (a.rewardGem) {
                    gs.freeGem = (gs.freeGem || 0) + a.rewardGem;
                    act.toast(`獲得獎勵：💎 ${a.rewardGem}`);
                }
            }
        });

        if (hasUpdate) {
            Core.save();
            if (window.view) view.renderStats(); // 刷新成就牆
        }
    },

    // [2. 手動建立成就 (除錯或創作者模式用)]
    addAchievement: (title, desc, icon, type, val, reward) => {
        const gs = window.GlobalState;
        gs.achievements.push({
            id: `ach_${Date.now()}`,
            title, desc, icon,
            targetType: type, targetVal: val,
            rewardGem: reward,
            done: false
        });
        Core.save();
    }
};

window.AchEngine = AchEngine;
// 掛載檢查點
window.act.checkAchievements = AchEngine.checkAutoUnlock;