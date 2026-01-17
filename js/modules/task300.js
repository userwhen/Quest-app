/* js/modules/task300.js - V25.0 Integrated (Logic + View) */
window.act = window.act || {};

const TaskEngine = {
    // =========================================
    // 1. 資料邏輯 (Data Logic)
    // =========================================
    init: () => {
        const gs = window.GlobalState;
        if (!gs) return;
        if (!gs.taskCats) gs.taskCats = ['每日', '運動', '工作', '待辦', '願望'];
        if (!gs.settings) gs.settings = {};
        if (typeof gs.settings.calMode === 'undefined') gs.settings.calMode = false;
        if (typeof gs.settings.strict === 'undefined') gs.settings.strict = false;

        const today = new Date().toDateString();
        // [關鍵修正] 檢查日期變更
        if (gs.lastLoginDate !== today) {
            if (gs.tasks) {
                gs.tasks.forEach(t => {
                    if (t.cat === '每日') { t.done = false; if (t.type === 'count') t.curr = 0; }
                });
            }
            if (gs.calories) { gs.calories.in = 0; gs.calories.out = 0; gs.calories.history = []; }
            gs.lastLoginDate = today;
            console.log("📅 新的一天！每日任務已重置 ");
        }
    },

    editTask: (taskId = null) => {
        if (window.view && view.renderCreateTaskForm) view.renderCreateTaskForm(taskId);
    },

    submitTask: () => {
        const temp = window.TempState.editingTask;
        if (!temp || !temp.title) { act.toast("標題必填"); return; }
        
        const gs = window.GlobalState;
        let task = temp.id ? gs.tasks.find(t => t.id === temp.id) : null;
        if (!task) {
            task = { id: 't' + Date.now(), done: false, createDate: Date.now() };
            gs.tasks.push(task);
        }

        Object.assign(task, {
            title: temp.title,
            desc: temp.desc,
            cat: temp.cat,
            type: temp.type,
            target: parseInt(temp.target),
            curr: temp.curr || 0,
            burn: (temp.cat === '運動') ? (parseInt(temp.calories) || 0) : 0,
            importance: temp.importance,
            urgency: temp.urgency,
            attrs: [...(temp.attrs || [])],
            subs: temp.subs ? JSON.parse(JSON.stringify(temp.subs)) : [],
            pinned: temp.pinned || false,
            subRule: temp.subRule || 'all',
            deadline: temp.deadline || ''
        });

        if (window.Core) Core.save();
        act.closeModal('overlay');
        act.toast("已保存");
        if (window.view) view.renderTasks();
    },

    resolveTask: (taskId) => {
        if (!window.StatsEngine) console.error("StatsEngine not found!");
        const gs = window.GlobalState;
        const task = gs.tasks.find(t => t.id === taskId);
        if (!task) return;

        // 子任務擋修
        if (!task.done && task.subs && task.subs.length > 0 && task.type !== 'count') {
            const doneCount = task.subs.filter(s => s.done).length;
            const rule = task.subRule || 'all';
            if (rule === 'all' && doneCount < task.subs.length) { act.toast("🔒 請先完成所有步驟"); return; }
            if (rule === 'any' && doneCount === 0) { act.toast("🔒 請至少完成一個步驟"); return; }
        }

        task.done = !task.done;

        if (task.done) {
            // [A] 完成任務
            task.doneTime = Date.now();
            const r = TaskEngine.previewRewards(task.importance, task.urgency);
            task.lastReward = { gold: r.gold, exp: r.exp };

            gs.gold = (gs.gold || 0) + r.gold;
            gs.exp = (gs.exp || 0) + r.exp;

            if (task.attrs && task.attrs.length > 0 && window.StatsEngine) {
                StatsEngine.distributeExp(r.exp, task.attrs);
                task.attrs.forEach(name => StatsEngine.addSkillProficiency(name));
            }

            // 熱量扣除
            if (gs.settings.calMode && task.burn > 0) {
                if (!gs.cal) gs.cal = { today: 0, logs: [] };
                gs.cal.today -= task.burn;
                const timeStr = new Date().toTimeString().substring(0, 5);
                gs.cal.logs.unshift(`${timeStr} 運動: ${task.title} -${task.burn}`);
                if (gs.cal.logs.length > 50) gs.cal.logs.pop();
            }

            if (window.StatsEngine) StatsEngine.checkLevelUp();
            if (window.view) view.renderHUD();
            act.toast(`完成！+${r.gold}💰 +${r.exp}✨`);

        } else {
            // [B] 取消任務
            task.doneTime = null;
            if (task.lastReward) {
                const r = task.lastReward;
                const isStrict = gs.settings && gs.settings.strict;

                if (isStrict) { gs.gold -= r.gold; } else { gs.gold = Math.max(0, gs.gold - r.gold); }
                
                gs.exp -= r.exp;
                if (window.StatsEngine && StatsEngine.handleExpLoss) {
                    StatsEngine.handleExpLoss(isStrict);
                } else {
                    if (!isStrict) gs.exp = Math.max(0, gs.exp);
                }

                if (task.attrs && window.StatsEngine) StatsEngine.deductExp(r.exp, task.attrs);

                // 熱量回滾 (乾淨移除)
                if (gs.settings.calMode && task.burn > 0) {
                    if (gs.cal) {
                        gs.cal.today += task.burn;
                        const targetValStr = `-${task.burn}`;
                        const idx = gs.cal.logs.findIndex(log => log.includes(task.title) && log.includes(targetValStr));
                        if (idx !== -1) gs.cal.logs.splice(idx, 1);
                    }
                }

                if (window.view) view.renderHUD();
                const penaltyMsg = isStrict ? " (已扣除/負債)" : " (已回收)";
                task.lastReward = null;
                act.toast(`已取消${penaltyMsg}`);
            } else {
                act.toast("已取消");
            }
        }

        if (window.view) view.renderTasks();
        if (window.Core) Core.save();
    },

    previewRewards: (imp, urg) => {
        const defs = window.DIFFICULTY_DEFS || { 1: { baseGold: 10, baseExp: 10 } };
        const cfg = defs[1];
        const w = (imp * 1.5) + (urg * 0.5);
        return { gold: Math.floor(cfg.baseGold * w), exp: Math.floor(cfg.baseExp * w) };
    },
	
	toggleTaskDetail: (id) => {
        window.TempState.expandedTaskId = (window.TempState.expandedTaskId === id) ? null : id;
        if(window.view && view.renderTasks) view.renderTasks();
    },

    // [Fix] 子任務切換 (支援編輯預覽 & 列表操作)
    toggleSubtask: (e, taskId, subIdx) => {
        if (e) {
            if(e.stopPropagation) e.stopPropagation();
            if(e.preventDefault) e.preventDefault();
        }

        // 檢查通用視窗是否開啟
        const modal = document.getElementById('m-universal');
        const isEditModalOpen = modal && modal.classList.contains('active') && modal.style.display !== 'none';

        // 情境 A: 編輯模式預覽 (只有在視窗開啟，且 ID 吻合時才執行)
        if (isEditModalOpen && window.TempState.editingTask && window.TempState.editingTask.id === taskId) {
            const t = window.TempState.editingTask;
            if (t.subs[subIdx]) {
                t.subs[subIdx].done = !t.subs[subIdx].done;
                // 這裡重繪視窗，顯示打勾變化
                view.renderCreateTaskForm(taskId);
            }
            return;
        }

        // 情境 B: 列表模式操作 (直接修改全域資料並存檔)
        const gs = window.GlobalState;
        const task = gs.tasks.find(t => t.id === taskId);
        if (!task || !task.subs[subIdx]) return;

        task.subs[subIdx].done = !task.subs[subIdx].done;

        if (window.Core) Core.save();
        // 這裡只重繪列表，不會彈出視窗
        if (window.view) view.renderTasks();
    },

    addSubtask: () => {
        const t = window.TempState.editingTask;
        if (!t) return;
        if (!t.subs) t.subs = [];
        t.subs.push({ text: '', done: false });
        if (t.type === 'count') t.type = 'normal';
        view.renderCreateTaskForm(t.id);
    },

    removeSubtask: (i) => {
        const t = window.TempState.editingTask;
        if (t && t.subs) {
            t.subs.splice(i, 1);
            view.renderCreateTaskForm(t.id);
        }
    },

    updateSubtaskText: (i, val) => {
        const t = window.TempState.editingTask;
        if (t && t.subs && t.subs[i]) {
            t.subs[i].text = val;
        }
    },

    togglePin: () => {
        if (window.TempState.editingTask) {
            window.TempState.editingTask.pinned = !window.TempState.editingTask.pinned;
            view.renderCreateTaskForm(window.TempState.editingTask.id);
        }
    },

    addNewCategory: () => {
        act.openInputModal("新增分類標籤", "請輸入類別名稱...", (name) => {
            if (name && name.trim()) {
                const gs = window.GlobalState;
                if (!gs.taskCats.includes(name)) {
                    gs.taskCats.push(name);
                    if (window.TempState.editingTask) {
                        window.TempState.editingTask.cat = name;
                        view.renderCreateTaskForm(window.TempState.editingTask.id);
                    }
                    if (window.view && view.renderTasks) view.renderTasks();
                    act.toast(`已新增類別: ${name}`);
                } else {
                    act.toast("該類別已存在");
                }
            }
        });
    },

    deleteTask: (id) => {
        act.confirm("確定刪除此任務?", (yes) => {
            if (yes) {
                const gs = window.GlobalState;
                gs.tasks = gs.tasks.filter(t => t.id !== id);
                if (window.Core) Core.save();
                act.closeModal('overlay');
                view.renderTasks();
                act.toast("🗑️ 任務已刪除");
            }
        });
    },

    copyTask: (id) => {
        const temp = window.TempState.editingTask;
        if (!temp) return;
        const newTask = JSON.parse(JSON.stringify(temp));
        newTask.id = 't_' + Date.now();
        newTask.title = temp.title + " (副本)";
        newTask.done = false;
        newTask.finishDate = null;
        newTask.curr = 0;
        if (newTask.subs) newTask.subs.forEach(s => s.done = false);
        
        window.GlobalState.tasks.unshift(newTask);
        act.save();
        act.closeModal('overlay');
        act.toast("任務已複製");
        if (window.view && view.renderTasks) view.renderTasks();
    },

    incrementTask: (id) => {
        const gs = window.GlobalState;
        if (!gs || !gs.tasks) return;
        const t = gs.tasks.find(x => x.id === id);
        if (!t || t.done || t.type !== 'count') return;

        t.curr = (t.curr || 0) + 1;
        if (t.curr >= t.target) {
            t.curr = t.target;
            TaskEngine.resolveTask(id);
        } else {
            window.act.save();
            if (window.view && view.renderTasks) view.renderTasks();
        }
    },

    getSortedTasks: (isHistory, cat) => {
        const tasks = window.GlobalState.tasks || [];
        const now = new Date();
        const todayStr = now.toDateString();
        const isDoneToday = (t) => t.done && t.doneTime && new Date(t.doneTime).toDateString() === todayStr;

        let filtered = tasks.filter(t => {
            if (isHistory) {
                const isOldDone = t.done && !isDoneToday(t) && t.cat !== '每日';
                const isExpired = t.deadline && new Date(t.deadline) < now && !t.done;
                return isOldDone || isExpired;
            } else {
                if (cat !== '全部' && t.cat !== cat) return false;
                if (!t.done) return true;
                if (t.cat === '每日') return true;
                if (isDoneToday(t)) return true;
                return false;
            }
        });
        return filtered.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            if (a.done !== b.done) return a.done ? 1 : -1;
            const wA = (a.importance * 1.5) + (a.urgency * 0.5);
            const wB = (b.importance * 1.5) + (b.urgency * 0.5);
            return wB - wA;
        });
    },

    // 視窗橋接 (這些 View 邏輯搬過來了)
    openInputModal: (title, placeholder, callback) => {
        window.TempState.inputCallback = callback;
        const bodyHtml = `<div class="input-group"><input type="text" id="univ-input-val" class="inp" placeholder="${placeholder}" autofocus></div>`;
        const footHtml = `<button class="u-btn u-btn-primary" onclick="act.submitInputModal()">確定</button>`;
        view.renderModal(title, bodyHtml, footHtml);
        setTimeout(() => { document.getElementById('univ-input-val')?.focus(); }, 100);
    },

    submitInputModal: () => {
        const el = document.getElementById('univ-input-val');
        if (!el) return;
        const val = el.value;
        if (window.TempState.inputCallback) {
            window.TempState.inputCallback(val);
            window.TempState.inputCallback = null;
        }
        act.closeModal('overlay');
    }
};

// =========================================
// 2. View 渲染邏輯 (Integrated View)
// =========================================
window.view = window.view || {};

view.renderTasks = () => {
    const container = document.getElementById('task-list');
    if (!container) return;

    // 恢復捲軸位置
    const oldFilterScroll = document.querySelector('#task-list .u-scroll-x');
    if (oldFilterScroll) window.TempState.mainListScrollX = oldFilterScroll.scrollLeft;

    const currentTab = window.TempState.taskTab || 'list';
    const isList = currentTab === 'list';

    // Header (Tab 切換)
    const headerHtml = ui.tabs.sliding('📋 任務列表', '🏆 榮譽成就', isList, "act.switchTaskTab('list')", "act.switchTaskTab('ach')");

    let contentHtml = '';

    if (isList) {
        // [A] 任務列表
        const currentCat = window.TempState.filterCategory || '全部';
        const cats = window.GlobalState.taskCats || ['全部', '每日', '工作'];
        const allCats = ['全部', ...cats.filter(c => c !== '全部')];
        let tasks = TaskEngine.getSortedTasks(false, currentCat);

        const scrollHtml = ui.tabs.scrollX(allCats, currentCat, "act.setTaskFilter");
        const filterHtml = `<div class="filter-container">${scrollHtml}<div class="filter-action-btn"><button class="u-btn u-btn-sm u-btn-paper" onclick="act.navigate('history')">📜 歷史</button></div></div>`;
        
        let listHtml = tasks.length === 0 ? `<div style="text-align:center;color:#888;padding:40px;">暫無任務</div>` : tasks.map(t => ui.card.task(t, false, window.TempState.expandedTaskId === t.id)).join('');
        
        contentHtml = filterHtml + listHtml + '<div style="height: 80px;"></div>';

    } else {
        // [B] 成就列表
        const currentAchCat = window.TempState.achFilter || '全部';
        const achCats = ['全部', '每日', '里程碑', '官方'];
        let achs = window.GlobalState.achievements || [];
        let displayAchs = achs.filter(a => {
            if(currentAchCat==='每日') return a.type==='check_in';
            if(currentAchCat==='里程碑') return a.type!=='check_in' && !a.isSystem;
            if(currentAchCat==='官方') return a.isSystem;
            return true;
        });

        const onClickStr = "((cat)=>{window.TempState.achFilter=cat; view.renderTasks();})";
        const scrollHtml = ui.tabs.scrollX(achCats, currentAchCat, onClickStr);
        const toolbar = `<div class="filter-container">${scrollHtml}<div class="filter-action-btn"><button class="u-btn u-btn-sm u-btn-paper" onclick="act.navigate('milestone')">🏆 殿堂</button></div></div>`;

        const renderAch = (a) => {
            const pct = a.targetVal > 0 ? Math.min(100, (a.curr / a.targetVal) * 100) : 0;
            const isCompleted = a.curr >= a.targetVal;
            const isCheckIn = a.type === 'check_in';
            let btnHtml = isCheckIn 
                ? (!a.done ? `<button class="btn-action-std can-do" onclick="window.act.doCheckIn('${a.id}')">可簽到</button>` : `<button class="btn-action-std locked" disabled>已簽到</button>`)
                : (isCompleted && !a.done ? `<button class="btn-action-std claim" onclick="window.act.claimAchievement('${a.id}')">🎁領取</button>` : `<button class="btn-action-std locked" disabled>進行中</button>`);
            
            let gearBtn = (isCompleted && !isCheckIn) ? '' : `<button class="btn-ghost-edit" onclick="window.act.editAchievement('${a.id}')">⚙️</button>`;
            
            return `<div class="std-card ${isCompleted && !a.done ? 'status-done' : ''}"><div class="card-col-left" style="font-size:1.2rem;">🏆</div><div class="card-col-center"><div class="card-info-row"><div class="card-title">${a.title}</div><div style="font-size:0.8rem; color:#f57c00;">💰${a.reward.gold}</div></div><div class="card-progress-row">${ui.renderProgressBar(pct, `${a.curr}/${a.targetVal}`, '', 'width:100%; height:14px;')}</div></div><div class="card-col-right inline">${btnHtml}${gearBtn}</div></div>`;
        };

        let achHtml = '<div style="padding:0 5px;">' + (displayAchs.length === 0 ? `<div style="text-align:center;color:#aaa;padding:40px;">此分類暫無成就</div>` : displayAchs.map(renderAch).join('')) + '</div>';
        contentHtml = toolbar + achHtml;
    }

    container.innerHTML = ui.layout.scroller(headerHtml, contentHtml, 'task-scroll-area');

    // 捲軸位置恢復
    setTimeout(() => {
        const newFilterScroll = document.querySelector('#task-list .u-scroll-x');
        if (newFilterScroll && typeof window.TempState.mainListScrollX === 'number') {
            newFilterScroll.scrollLeft = window.TempState.mainListScrollX;
        }
    }, 0);

    // [FAB 控制邏輯]
    const fab = document.getElementById('global-fab');
    if (fab) {
        fab.style.display = 'flex'; // 只要渲染這頁，FAB 一定顯示
        const newFab = fab.cloneNode(true);
        fab.parentNode.replaceChild(newFab, fab);

        if (!isList) {
            newFab.classList.add('fab-gold');
            newFab.innerHTML = '🏆';
            newFab.onclick = () => { if(view.renderCreateAchForm) view.renderCreateAchForm(null); };
        } else {
            newFab.classList.remove('fab-gold');
            newFab.innerHTML = '+';
            newFab.onclick = () => { 
                window.TempState.editingTask = null; 
                if(view.renderCreateTaskForm) view.renderCreateTaskForm(null); 
            };
        }
    }
};

// 2. 歷史紀錄頁面 (Page History)
view.renderHistoryPage = () => {
    const container = document.getElementById('history-list');
    if(!container) return;

    // [按鈕變身邏輯] 重建 Header，但把按鈕改成「返回」
    // 注意：這裡為了視覺一致，我們手動加上 header html
    const headerHtml = `
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#f5f5f5; border-bottom:1px solid #e0e0e0;">
            <h2 style="margin:0; font-size:1.2rem; color:#5d4037;">📜 歷史紀錄</h2>
            <button class="u-btn u-btn-sm u-btn-paper" onclick="act.navigate('task')">↩ 返回</button>
        </div>`;
    

    const history = window.GlobalState.history || [];
    const sortedHistory = [...history].reverse();

    let listHtml = '';
    if (sortedHistory.length === 0) {
        listHtml = `<div style="text-align:center;color:#888;padding:50px;">📜 無歷史紀錄</div>`;
    } else {
        listHtml = `<div style="padding-top: 10px;">` + sortedHistory.map(t => {
            return ui.card.task(t, true, false);
        }).join('') + `</div>`;
    }

    // [修正] 移除 toolbar 參數
    container.innerHTML = ui.layout.scroller(headerHtml, listHtml + '<div style="height:50px;"></div>', 'history-scroll-area');
    
    // 隱藏 FAB
    const fab = document.getElementById('global-fab');
    if(fab) fab.style.display = 'none';
};

// 3. 榮譽殿堂頁面 (Page Milestone)
view.renderMilestonePage = () => {
    const listContainer = document.getElementById('milestone-list');
    if(!listContainer) return;

    // 1. 標題與返回
    const headerHtml = `
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#f5f5f5; border-bottom:1px solid #e0e0e0;">
            <h2 style="margin:0; font-size:1.2rem; color:#5d4037;">🏆 榮譽殿堂</h2>
            <button class="u-btn u-btn-sm u-btn-paper" onclick="act.navigate('task')">↩ 返回</button>
        </div>`;

    // 2. 準備數據 (這裡定義了 doneAch，解決報錯)
    const achs = window.GlobalState.achievements || [];
    const doneAch = achs.filter(a => a.done && a.type !== 'check_in'); 

    // 3. 大師木板 (省略，維持原樣)
    const archivedSkills = window.GlobalState.archivedSkills || [];
    const masterBoardHtml = `<div class="wood-board"><div class="board-title">✨ 大師勳章 ✨</div><div class="master-badge-container">${archivedSkills.length===0?'<div style="color:rgba(255,255,255,0.5);font-size:0.8rem;">尚未有技能達到 Lv.10</div>':archivedSkills.map(s=>`<div class="master-badge">${window.GlobalState.attrs?.[s.parent]?.icon||'❓'}</div>`).join('')}</div></div>`;

    // 4. 列表渲染 (使用標準 .std-card 結構)
    let listHtml = '';
    if (doneAch.length === 0) {
        listHtml = `<div style="text-align:center;color:#888;padding:20px;">尚無已完成成就</div>`;
    } else {
        listHtml = `<div style="padding:10px;">` + doneAch.map(a => {
            const d = new Date(a.date || Date.now());
            const dateStr = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
            
            // [殿堂卡片] 無進度條、無按鈕、無齒輪，只有日期
            return `
            <div class="std-card status-done">
                <div class="card-col-left" style="font-size:1.5rem;">🏅</div>
                <div class="card-col-center">
                    <div class="card-info-row">
                        <div class="card-title">${a.title}</div>
                    </div>
                    <div class="card-progress-row" style="font-size:0.85rem; color:#666;">${a.desc}</div>
                </div>
                <div class="card-col-right space-v">
                    <div class="card-date-tag">${dateStr}</div>
                </div>
            </div>`;
        }).join('') + `</div>`;
    }

    listContainer.innerHTML = ui.layout.scroller(headerHtml, masterBoardHtml + listHtml + '<div style="height:50px;"></div>', 'milestone-scroll-area');
    
    // 隱藏 FAB
    const fab = document.getElementById('global-fab');
    if(fab) fab.style.display = 'none';
};

// [V12.1] 任務表單 (修復類型切換延遲 + UI 微調)
view.renderCreateTaskForm = (taskId = null) => {
    // 1. 鎖定卷軸位置
    const oldScrollBox = document.querySelector('#m-universal .u-scroll-x');
    if (oldScrollBox) window.TempState.editScrollX = oldScrollBox.scrollLeft;
	const mask = document.getElementById('m-universal');
    if (mask) mask.classList.remove('sys-mode');
    // 2. 資料準備
    window.GlobalState = window.GlobalState || { tasks: [], skills: [], taskCats: ['每日', '工作'] };
    window.TempState = window.TempState || {};
    const gs = window.GlobalState;
    const task = taskId ? gs.tasks.find(t => t.id === taskId) : null;
    const defaultData = { 
        id: taskId, title: '', desc: '', importance: 2, urgency: 2, 
        type: 'normal', attrs: [], cat: '每日', target: 10, subs: [], 
        pinned: false, calories: 0, deadline: '', subRule: 'all' 
    };
    
    if (!window.TempState.editingTask || window.TempState.editingTask.id !== taskId) {
        window.TempState.editingTask = task ? JSON.parse(JSON.stringify(task)) : defaultData;
    }
    const data = window.TempState.editingTask;
	if (!data.attrs) data.attrs = [];
    // ID 生成 (用於 Radio)
    const uid = (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 6)}`;
    const ids = { typeN: uid('tn'), typeC: uid('tc'), ruleAll: uid('ra'), ruleAny: uid('rn') };

    try {
        let bodyHtml = '';

        // --- A. 標題與置頂 (嚴格維持原樣) ---
        bodyHtml += `
        <div class="input-group">
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="flex:1;">
                    <label class="section-title">任務名稱</label>
                    ${ui.input.text(data.title, "要做什麼呢？", "view.updateEditField('title', this.value)")}
                </div>
                <div style="padding-top:20px;">
                    <button class="u-btn u-btn-ghost" 
					style="font-size:1.2rem; padding:5px 10px; border:none; opacity:${data.pinned ? '1' : '0.3'}; transition:opacity 0.2s;"
					onclick="view.updateEditField('pinned', !${data.pinned})"> 📌
                    </button>
                </div>
            </div>
        </div>`;

        // --- B. 詳細說明 (嚴格維持原樣) ---
        bodyHtml += `
        <div class="input-group">
            <label class="section-title">詳細說明</label>
            ${ui.input.textarea(data.desc, "備註...", "view.updateEditField('desc', this.value)")}
        </div>`;

        // --- C. 分類與熱量 (嚴格維持原樣) ---
        const scrollContent = ui.tabs.scrollX((gs.taskCats || ['預設']), data.cat, "view.updateEditCategory", "act.addNewCategory()");
        
        let caloriesInput = '';
        if (data.cat === '運動') {
            caloriesInput = `
                <div style="display:flex; align-items:center; gap:5px; background:#fff3e0; padding:2px 8px; border-radius:15px; border:1px solid #ffe0b2;">
                    <span style="font-size:0.9rem;">🔥</span>
                    ${ui.input.number(data.calories, "0", "view.updateEditField('calories', parseInt(this.value)||0)", 4)}
                    <span style="font-size:0.8rem; color:#f57c00;">Kcal</span>
                </div>
            `;
        }

        bodyHtml += `
        <div class="input-group">
            <div style="display:flex; align-items:center; gap:8px; width:100%; overflow:hidden;">
                <label class="section-title" style="margin:0; flex-shrink:0;">分類:</label>
                <div style="flex:1; overflow:hidden; min-width:0; display:flex; align-items:center; gap:10px;">
                    <div style="flex:1; min-width:0;">${scrollContent}</div>
                    ${caloriesInput} 
                </div>
            </div>
        </div>`;

        // --- D. 類型與設定 (更新重點) ---
        const isCount = data.type === 'count';
        
        // 準備右側設定區塊 HTML
        let rightSettingHtml = '';
        if (!isCount) {
            // [UI] 一般任務 -> 顯示規則 Radio (全部/擇一)
            rightSettingHtml = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:0.9rem; color:#666;">規則:</span>
                    <div style="display:flex; gap:10px;">
                        <label style="display:flex; align-items:center; cursor:pointer;">
                            <input type="radio" name="sub_rule" ${data.subRule==='all'?'checked':''} onclick="view.updateEditField('subRule', 'all')">
                            <span style="margin-left:4px; font-size:0.9rem;">全部</span>
                        </label>
                        <label style="display:flex; align-items:center; cursor:pointer;">
                            <input type="radio" name="sub_rule" ${data.subRule==='any'?'checked':''} onclick="view.updateEditField('subRule', 'any')">
                            <span style="margin-left:4px; font-size:0.9rem;">擇一</span>
                        </label>
                    </div>
                </div>
            `;
        } else {
            // [UI] 計次任務 -> 顯示目標輸入 (無標題)
            rightSettingHtml = `
                <div style="display:flex; align-items:center; gap:5px;">
                    ${ui.input.number(data.target, "10", "view.updateEditField('target', this.value)", 2)}
                    <span style="font-size:0.9rem; color:#555;">次</span>
                </div>
            `;
        }

        bodyHtml += `
        <div class="box-gray" style="padding:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div class="radio-pill-group">
                    <input type="radio" id="${ids.typeN}" name="task_type" ${!isCount?'checked':''} onclick="view.updateEditField('type', 'normal')">
                    <label for="${ids.typeN}">📝 一般</label>
                    
                    <input type="radio" id="${ids.typeC}" name="task_type" ${isCount?'checked':''} onclick="view.updateEditField('type', 'count')">
                    <label for="${ids.typeC}">🔢 計次</label>
                </div>

                ${rightSettingHtml}
            </div>

            ${!isCount ? `
            <div style="margin-top:10px; border-top:1px dashed #ddd; padding-top:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div class="section-title" style="margin:0;">🔨 子任務</div>
                    <button class="u-btn u-btn-paper u-btn-sm" onclick="act.addSubtask()">+ 新增步驟</button>
                </div>

                ${(data.subs || []).map((s, i) => `
                <div style="display:flex; gap:5px; margin-bottom:5px; align-items:center;">
                    ${ui.input.text(s.text, `步驟 ${i+1}`, `act.updateSubtaskText(${i}, this.value)`)}
                    <button class="u-btn u-btn-ghost u-btn-sm" style="color:var(--color-danger);" onclick="act.removeSubtask(${i})">✕</button>
                </div>`).join('')}
                
                ${(!data.subs || data.subs.length === 0) ? '<div style="text-align:center; color:#999; font-size:0.85rem; padding:5px;">尚無步驟</div>' : ''}
            </div>
            ` : ''}
        </div>`;

        // --- F. 技能綁定 (嚴格維持原樣) ---
        const skillHtml = (gs.skills || []).map(s => {
    const active = data.attrs.includes(s.name);
    
    // [關鍵修正] 加入 ?.toUpperCase() 確保能對應到 stats300 的大寫屬性
    const icon = window.GlobalState.attrs?.[s.parent?.toUpperCase()]?.icon || '❓';
    
    const style = active 
        ? 'border:1px solid var(--color-acc); background:#e0f2f1; color:var(--color-acc);' 
        : 'border:1px solid #ccc; opacity:0.6;';
    return `<button class="u-btn u-btn-sm" 
        style="${style} margin-right:5px; margin-bottom:5px; border-radius:12px;"
        onclick="view.toggleSkillSelect('${s.name}', this)"> ${icon} ${s.name}</button>`;
}).join('');

        bodyHtml += `
        <div class="input-group">
            <div class="section-title">📚 綁定技能</div>
            <div class="box-gray" style="display:flex; flex-wrap:wrap;">
                ${skillHtml || '<span style="color:#888;font-size:0.8rem">無可用技能，請至屬性頁新增</span>'}
            </div>
        </div>`;

        // --- G. 價值評估 (嚴格維持原樣) ---
        bodyHtml += `
        <div class="box-gray" style="border-left: 4px solid var(--color-gold);">
            <div class="section-title">📊 價值評估</div>
            <div style="margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <label>重要性</label>
                    <span id="val-imp" style="font-weight:bold; color:var(--color-acc);">${data.importance}</span>
                </div>
                <input type="range" min="1" max="4" value="${data.importance}" style="width:100%; accent-color: var(--color-acc);"
                       oninput="view.updateEditField('importance', parseInt(this.value))">
            </div>
            <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <label>緊急性</label>
                    <span id="val-urg" style="font-weight:bold; color:var(--color-danger);">${data.urgency}</span>
                </div>
                <input type="range" min="1" max="4" value="${data.urgency}" style="width:100%; accent-color: var(--color-danger);"
                       oninput="view.updateEditField('urgency', parseInt(this.value))">
            </div>
            <div id="matrix-tag-preview" style="text-align:right; font-size:0.9rem; margin-top:10px; padding-top:5px; border-top:1px dashed #ccc; color:#666;">預覽載入中...</div>
        </div>`;

        // --- H. 到期日 (嚴格維持原樣) ---
        bodyHtml += `
        <div class="input-group">
            <label class="section-title">📅 到期時間</label>
            ${ui.input.datetime(data.deadline, "view.updateEditField('deadline', this.value)")}
        </div>`;

        // 3. Footer 按鈕
        let footHtml = '';
        if (taskId) {
            footHtml = `
                <button class="u-btn u-btn-danger" onclick="act.deleteTask('${taskId}')">刪除</button>
                <button class="u-btn u-btn-secondary" onclick="act.copyTask('${taskId}')">複製</button>
                <button class="u-btn u-btn-primary" onclick="act.submitTask()">保存</button>
            `;
        } else {
            footHtml = `
                <button class="u-btn u-btn-primary" onclick="act.submitTask()">新增</button>
            `;
        }

        view.renderModal(taskId ? '編輯任務' : '新增任務', bodyHtml, footHtml);
        setTimeout(() => view.updateMatrixPreview(), 0);

        // 恢復捲軸
        setTimeout(() => {
            const newScrollBox = document.querySelector('#m-universal .u-scroll-x');
            if (newScrollBox && typeof window.TempState.editScrollX === 'number') {
                newScrollBox.scrollLeft = window.TempState.editScrollX;
            }
        }, 0);

    } catch (e) {
        console.error("表單渲染失敗:", e);
        view.renderModal('錯誤', `<div style="color:red; padding:20px;">渲染失敗：${e.message}</div>`, '');
    }
};

view.updateEditField = (field, val) => {
    if (window.TempState && window.TempState.editingTask) {
        window.TempState.editingTask[field] = val;
        
        // 1. 數值顯示更新 (價值評估不重繪，直接改 DOM)
        if(field === 'importance' || field === 'urgency') {
             const el = document.getElementById(`val-${field.substring(0,3)}`);
             if(el) el.innerText = val;
             // 強制呼叫矩陣預覽
             if(view.updateMatrixPreview) view.updateMatrixPreview();
             return; 
        }
        
        // 2. [關鍵] 類型、分類、釘選、子任務規則改變時，強制重繪
        // 使用 setTimeout 確保 UI 反應完成後再重繪，解決 "點擊無效" 問題
        if(['type', 'cat', 'pinned', 'subRule'].includes(field)) {
            // 如果當前有焦點在按鈕上，強制失焦，避免 renderModal 誤判
            if(document.activeElement) document.activeElement.blur();

            setTimeout(() => {
                view.renderCreateTaskForm(window.TempState.editingTask.id);
            }, 0);
        }
    }
};

// 更新分類 (給 ui.tabs.scrollX 用的)
view.updateEditCategory = (cat) => {
    if (window.TempState && window.TempState.editingTask) {
        const oldCat = window.TempState.editingTask.cat; // 1. 先記住舊的
        window.TempState.editingTask.cat = cat;          // 2. 設定新的

        // 3. 判斷是否需要「結構性重繪」
        // 如果「原本是運動」(要隱藏輸入框) 或者 「現在變運動」(要顯示輸入框)
        // 這種情況必須重繪，否則輸入框不會出現/消失
        if (oldCat === '運動' || cat === '運動') {
            if(document.activeElement) document.activeElement.blur(); // 失焦以防殘留
            setTimeout(() => {
                view.renderCreateTaskForm(window.TempState.editingTask.id);
            }, 0);
        } else {
            // 4. 普通情況 (例如：每日 -> 工作)
            // 結構不用變，只改按鈕顏色，這樣就不會閃爍
            const scrollContainer = document.querySelector('#m-universal .u-scroll-x');
            if(scrollContainer) {
                const btns = scrollContainer.querySelectorAll('button');
                btns.forEach(b => {
                    if (b.innerText === cat) {
                        b.classList.add('active'); 
                    } else {
                        b.classList.remove('active');
                    }
                });
            }
        }
    }
};

// 切換技能選擇
view.toggleSkillSelect = (skillName, btnEl) => {
    if (window.TempState && window.TempState.editingTask) {
        const t = window.TempState.editingTask;
        if (!t.attrs) t.attrs = [];

        const idx = t.attrs.indexOf(skillName);

        // 限制 3 個
        if (idx === -1 && t.attrs.length >= 3) {
            return act.toast("⚠️ 最多綁定 3 個技能");
        }

        // 執行切換
        if (idx > -1) t.attrs.splice(idx, 1);
        else t.attrs.push(skillName);

        // [關鍵] 直接修改點擊按鈕的樣式
        if (btnEl) {
            const isActive = t.attrs.includes(skillName);
            if (isActive) {
                btnEl.style.border = '1px solid var(--color-acc)';
                btnEl.style.background = '#e0f2f1';
                btnEl.style.color = 'var(--color-acc)';
                btnEl.style.opacity = '1';
            } else {
                btnEl.style.border = '1px solid #ccc';
                btnEl.style.background = '';
                btnEl.style.color = '';
                btnEl.style.opacity = '0.6';
                    }
                }
            }
        };

// 更新價值預覽 (解決報錯的主角)
view.updateMatrixPreview = () => {
    const t = window.TempState?.editingTask;
    const tagBox = document.getElementById('matrix-tag-preview');
    
    // 檢查是否有 TaskEngine 支援 (如果沒有就顯示簡易版)
    if(tagBox && t) {
        let label = "🍂 雜務"; let color = "#757575";
        if(t.importance>=3 && t.urgency>=3) { label="🔥 危機"; color="#d32f2f"; }
        else if(t.importance>=3) { label="💎 願景"; color="#0288d1"; }
        else if(t.urgency>=3) { label="⚡ 突發"; color="#ef6c00"; }
        
        let rewardText = "";
        if(window.TaskEngine && window.TaskEngine.previewRewards) {
            const r = window.TaskEngine.previewRewards(t.importance, t.urgency);
            rewardText = ` 預期獎勵: 💰${r.gold} ✨${r.exp}`;
        }
        
        tagBox.innerHTML = `<span style="color:${color};font-weight:bold;">${label}</span>${rewardText}`;
    }
};

// =========================================
// 3. Act 綁定
// =========================================
window.act.editTask = TaskEngine.editTask;
window.act.submitTask = TaskEngine.submitTask;
window.act.resolveTask = TaskEngine.resolveTask;
window.act.toggleTask = TaskEngine.resolveTask; // 雙向綁定
window.act.toggleTaskDetail = TaskEngine.toggleTaskDetail;
window.act.toggleSubtask = TaskEngine.toggleSubtask;
window.act.addSubtask = TaskEngine.addSubtask;
window.act.removeSubtask = TaskEngine.removeSubtask;
window.act.updateSubtaskText = TaskEngine.updateSubtaskText;
window.act.copyTask = TaskEngine.copyTask;
window.act.deleteTask = TaskEngine.deleteTask;
window.act.incrementTask = TaskEngine.incrementTask;
window.act.taskInit = TaskEngine.init;
window.act.addNewCategory = TaskEngine.addNewCategory;
window.act.togglePin = TaskEngine.togglePin;
window.act.getSortedTasks = TaskEngine.getSortedTasks;
window.act.openInputModal = TaskEngine.openInputModal;
window.act.submitInputModal = TaskEngine.submitInputModal;

// [Fix] 統一的 Tab 切換入口
window.act.switchTaskTab = (tab) => {
    window.TempState = window.TempState || {};
    window.TempState.taskTab = tab;
    // 因為渲染邏輯和 FAB 控制都在 renderTasks 裡面，所以這裡只要呼叫 renderTasks 即可
    view.renderTasks(); 
};

// Filter 切換
window.act.setTaskFilter = (cat) => { 
    window.TempState.filterCategory = cat; 
    window.TempState.viewHistoryMode = false; 
    view.renderTasks(); 
};

// 初始化
setTimeout(TaskEngine.init, 100);
window.TaskEngine = TaskEngine;