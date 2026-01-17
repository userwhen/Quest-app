/* js/modules/ach300.js - V11.0 Integrated Achievement Logic */
window.act = window.act || {};

const achLogic = {
    // 1. 核心排序
    getSortedAchievements: () => {
        if (!window.GlobalState || !window.GlobalState.achievements) return [];
        let achs = window.GlobalState.achievements.filter(a => !a.done || a.type === 'check_in');
        achs.sort((a,b) => { 
            if (a.type === 'check_in') return -1; 
            if (b.type === 'check_in') return 1; 
            const aReady = a.curr >= a.targetVal && !a.done;
            const bReady = b.curr >= b.targetVal && !b.done;
            if (aReady && !bReady) return -1;
            if (!aReady && bReady) return 1;
            return 0; 
        });
        return achs;
    },

    // 2. 簽到
    doCheckIn: (id) => {
        const ach = window.GlobalState.achievements.find(a => a.id === id);
        if(ach && !ach.done) {
            ach.done = true; 
            ach.curr = (ach.curr || 0) + 1;
            act.claimAchievement(id); 
        }
    },

    // 3. 領取獎勵
    claimAchievement: (id) => {
        const ach = window.GlobalState.achievements.find(a => a.id === id);
        if (!ach) return;
        
        // 發獎
        const r = ach.reward || {};
        if(r.gold) window.GlobalState.gold = (window.GlobalState.gold||0) + r.gold;
        if(r.exp) window.GlobalState.exp = (window.GlobalState.exp||0) + r.exp;
        if(r.freeGem) window.GlobalState.freeGem = (window.GlobalState.freeGem||0) + r.freeGem;

        // 狀態更新
        if (ach.type === 'check_in') {
            ach.done = true;
            act.alert(`簽到成功！獲得: 💰${r.gold||0}`);
        } else {
            ach.done = true;      
            ach.claimed = true;   
            ach.date = Date.now(); 
            act.alert(`成就達成！獲得: 💰${r.gold||0}`);
        }
        
        act.save();
        if(window.view) { 
            view.renderHUD(); 
            view.renderTasks(); 
            // 刷新殿堂
            if(document.getElementById('page-milestone')?.classList.contains('active')) {
                view.renderMilestonePage();
            }
        }
    },

    // 4. 編輯/刪除
    editAchievement: (id) => {
        // [Check] 確保 view 函式存在
        if(window.view && view.renderCreateAchForm) {
            view.renderCreateAchForm(id); 
        } else {
            console.error("View function 'renderCreateAchForm' missing!");
        }
    },

    deleteAchievement: (id) => {
        act.confirm("確定要刪除此成就嗎？", (yes) => {
            if(yes) {
                window.GlobalState.achievements = window.GlobalState.achievements.filter(a => a.id !== id);
                act.save();
                act.closeModal('universal');
                if(window.view && view.renderTasks) view.renderTasks();
                act.toast("🗑️ 成就已刪除");
            }
        });
    },

    // 5. 提交/保存 (安全性修正版)
    submitAchievement: () => {
        const data = window.TempState.editingAch;
        if (!data || !data.title) return act.toast("請輸入標題"); // 改用 Toast
        
        if (!window.GlobalState.achievements) window.GlobalState.achievements = [];
        
        const isEdit = !!data.id;
        const newId = isEdit ? data.id : `ach_${Date.now()}`;
        const targetVal = parseInt(data.targetVal) || 1;

        // [Fix] 使用 Object.assign 確保不覆蓋潛在欄位，或建立新物件
        let ach = isEdit ? window.GlobalState.achievements.find(a => a.id === newId) : {
            id: newId, curr: 0, done: false, claimed: false
        };

        if (!ach && isEdit) return; // 編輯模式找不到物件，異常

        // 更新欄位
        Object.assign(ach, {
            title: data.title,
            desc: data.desc,
            type: data.type,
            targetKey: data.targetKey || '',
            targetVal: targetVal,
            isSystem: !!data.isSystem,
            reward: { 
                gold: parseInt(data.reward?.gold) || 0, 
                exp: parseInt(data.reward?.exp) || 0,
                freeGem: parseInt(data.reward?.freeGem) || 0
            }
        });

        // 如果是新增，推入陣列
        if (!isEdit) window.GlobalState.achievements.unshift(ach);
        
        act.save();
        act.closeModal('overlay');
        act.toast("已保存");
        if(window.view) view.renderTasks();
    },
};
// 統一的資料更新入口 (模仿 task 的 updateEditField)
view.updateEditAchField = (field, val) => {
    if (window.TempState && window.TempState.editingAch) {
        // 1. 更新資料
        window.TempState.editingAch[field] = val;
        
        // 2. 特殊邏輯：如果是更新類型 (type)，需要重繪視窗以顯示不同欄位
        if (field === 'type') {
            // 使用 setTimeout 確保 UI 反應順暢
            setTimeout(() => view.renderCreateAchForm(window.TempState.editingAch.id), 0);
        }
    }
};
// 統一的獎勵更新入口
view.updateEditAchReward = (type, val) => {
    if (window.TempState && window.TempState.editingAch) {
        if (!window.TempState.editingAch.reward) window.TempState.editingAch.reward = {};
        window.TempState.editingAch.reward[type] = parseInt(val) || 0;
    }
};
view.renderCreateAchForm = (achId = null) => {
    // 1. 準備數據
    const achs = window.GlobalState.achievements || [];
    const ach = achId ? achs.find(a => a.id === achId) : null;
    const isEdit = !!achId;

    // 初始化暫存
    if (!window.TempState.editingAch || window.TempState.editingAch.id !== achId) {
        window.TempState.editingAch = ach ? JSON.parse(JSON.stringify(ach)) : {
            id: null, title: '', desc: '', type: 'manual', targetVal: 1, targetKey: '', 
            isSystem: false, reward: { gold: 0, exp: 0, freeGem: 0 }
        };
    }
    const data = window.TempState.editingAch;

    // 定義更新函式 helper (減少重複代碼)
    const updateField = (field, val) => {
        window.TempState.editingAch[field] = val;
    };
    
    // 定義特殊更新：當類型改變時，除了寫入值，還要重繪視窗
    // 注意：這裡使用 setTimeout 0 讓 UI 先反應完再重繪，體驗較好
    const updateTypeAndRender = (val) => {
        window.TempState.editingAch.type = val;
        setTimeout(() => view.renderCreateAchForm(achId), 0);
    };

    // 定義獎勵更新 helper
    const updateReward = (key, val) => {
        if(!window.TempState.editingAch.reward) window.TempState.editingAch.reward = {};
        window.TempState.editingAch.reward[key] = parseInt(val) || 0;
    };

    // 2. 構建 HTML
    let bodyHtml = '';

    // (A) 標題與描述
    bodyHtml += `
        <div class="input-group">
            <label class="section-title">成就名稱</label>
            ${ui.input.text(data.title, "例如: 存第一桶金", "view.updateEditAchField('title', this.value)")}
        </div>
        <div class="input-group">
            <label class="section-title">描述</label>
            ${ui.input.textarea(data.desc, "描述達成條件...", "view.updateEditAchField('desc', this.value)")}
        </div>`;

    // (B) 條件類型 (使用新的 ui.input.select)
    const typeOptions = [
        { value: 'manual', label: '手動勾選 (一次性)' },
        { value: 'check_in', label: '每日簽到 (重複性)' },
        { value: 'custom', label: '自定義計數' },
        { value: 'task_count', label: '任務次數監聽' },
        { value: 'attr_lv', label: '屬性等級監聽' }
    ];

    bodyHtml += `
        <div class="box-gray">
            <label class="section-title">達成條件類型</label>
            ${/* 下拉選單改為呼叫 updateEditAchField */ ''}
            ${ui.input.select(typeOptions, data.type, "view.updateEditAchField('type', this.value)")}

            ${(data.type === 'custom' || data.type === 'task_count' || data.type === 'attr_lv') ? `
                <div style="margin-top:10px; display:flex; gap:10px; align-items:center;">
                    <div style="flex:1;">
                        <label class="section-title">目標值</label>
                        ${ui.input.number(data.targetVal, "次數/等級", "view.updateEditAchField('targetVal', parseInt(this.value)||1)", 2)}
                    </div>
                    ${data.type !== 'custom' ? `
                    <div style="flex:1;">
                        <label class="section-title">${data.type==='attr_lv'?'屬性名稱':'任務標籤'}</label>
                        ${ui.input.text(data.targetKey, "關鍵字", "view.updateEditAchField('targetKey', this.value)")}
                    </div>` : ''}
                </div>
            ` : ''}
        </div>`;

    // (C) 獎勵設定
    bodyHtml += `
        <div class="box-gray" style="border-left:4px solid gold;">
            <div class="section-title">🏆 完成獎勵</div>
            <div style="display:flex; gap:10px;">
                <div style="flex:1;">
                    <label class="section-title">💰 金幣</label>
                    ${ui.input.number(data.reward?.gold || 0, "0", "view.updateEditAchReward('gold', this.value)", 4)}
                </div>
                <div style="flex:1;">
                    <label class="section-title">✨ 經驗</label>
                    ${ui.input.number(data.reward?.exp || 0, "0", "view.updateEditAchReward('exp', this.value)", 4)}
                </div>
            </div>
        </div>`;

    // 3. Footer 按鈕
    const footHtml = `
        ${isEdit ? `<button class="u-btn u-btn-danger" onclick="act.deleteAchievement('${achId}')">刪除</button>` : ''}
        <button class="u-btn u-btn-primary" onclick="act.submitAchievement()">儲存</button>
    `;

    view.renderModal(isEdit ? '編輯成就' : '新增成就', bodyHtml, footHtml);
};

// 安全合併
if (window.act) Object.assign(window.act, achLogic);