/* js/modules/task300.js - V43.0 Refactored Architecture */

window.act = window.act || {};

// ============================================================
// 【LAYER 1: 純邏輯層 (MODEL / LOGIC)】
// 職責：只負責計算、數據變更、存檔。
// 規則：嚴禁出現 view, act.toast, alert, prompt。
// ============================================================
const TaskLogic = {
    // --- 1. 初始化與修復 ---
    checkAndReset: () => {
        const gs = window.GlobalState;
        if(!gs) return;
        
        // 結構補全
        if (!gs.taskCats) gs.taskCats = ['每日', '運動', '工作', '待辦', '願望'];
        if (!gs.settings) gs.settings = { calMode: false, strict: false };
        if (!gs.tasks) gs.tasks = [];

        // 跨日重置
        const today = new Date().toDateString();
        if (gs.lastLoginDate !== today) {
            gs.tasks.forEach(t => {
                if (t.cat === '每日') { 
                    t.done = false; 
                    if(t.type === 'count') t.curr = 0; 
                }
            });
            // 重置熱量
            if(gs.calories) { 
                gs.calories.in = 0; 
                gs.calories.out = 0; 
                gs.calories.history = []; 
            }
            gs.lastLoginDate = today;
            if(window.Core) Core.save();
        }
    },

    // --- 2. 數據準備與查詢 ---
    createNewDraft: () => ({ 
        title: '', desc: '', cat: '每日', type: 'normal', 
        target: 1, curr: 0, importance: 1, urgency: 1, 
        skills: [], burn: 0, subs: [], subRule: 'all', pinned: false 
    }),

    getTaskCopy: (id) => {
        const t = window.GlobalState.tasks.find(x => x.id === id);
        return t ? JSON.parse(JSON.stringify(t)) : null;
    },

    // 取得排序後的列表 (Query)
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

    // --- 3. CRUD 操作 (回傳結果物件) ---
    saveTask: (temp) => {
        if (!temp || !temp.title) return { success: false, msg: "標題必填" };

        const gs = window.GlobalState;
        let task = temp.id ? gs.tasks.find(t => t.id === temp.id) : null;

        if (!task) {
            task = { id: 't' + Date.now(), done: false, createDate: Date.now() };
            gs.tasks.push(task);
        }

        Object.assign(task, {
            title: temp.title, desc: temp.desc, cat: temp.cat, type: temp.type,
            target: parseInt(temp.target) || 1, curr: temp.curr || 0,
            burn: (temp.cat === '運動') ? (parseInt(temp.burn) || 0) : 0,
            importance: parseInt(temp.importance) || 1, urgency: parseInt(temp.urgency) || 1,
            skills: [...(temp.skills || [])],
            subs: temp.subs ? JSON.parse(JSON.stringify(temp.subs)) : [],
            subRule: temp.subRule || 'all',
            pinned: temp.pinned || false
        });

        if(window.Core) Core.save();
        return { success: true };
    },

    deleteTask: (id) => {
        const gs = window.GlobalState;
        gs.tasks = gs.tasks.filter(t => t.id !== id);
        if(window.Core) Core.save();
        return { success: true };
    },

    copyTask: (temp) => {
        if (!temp) return { success: false };
        const newTask = JSON.parse(JSON.stringify(temp));
        newTask.id = 't_' + Date.now();
        newTask.title = temp.title + " (副本)";
        newTask.done = false; newTask.doneTime = null; 
        newTask.curr = 0; newTask.lastReward = null;
        if (newTask.subs) newTask.subs.forEach(s => s.done = false);
        
        window.GlobalState.tasks.unshift(newTask);
        if(window.Core) Core.save();
        return { success: true };
    },

    addCategory: (name) => {
        const gs = window.GlobalState;
        if (!gs.taskCats.includes(name)) {
            gs.taskCats.push(name);
            return { success: true, name: name };
        }
        return { success: false };
    },

    // --- 4. 狀態切換與獎勵 (複雜邏輯) ---
    toggleStatus: (taskId) => {
        const gs = window.GlobalState;
        const task = gs.tasks.find(t => t.id === taskId);
        if(!task) return { success: false, msg: "任務不存在" };

        // 擋修檢查
        if (!task.done && task.subs && task.subs.length > 0) {
            const doneCount = task.subs.filter(s => s.done).length;
            const rule = task.subRule || 'all';
            if (rule === 'all' && doneCount < task.subs.length) return { success: false, msg: "🔒 請先完成所有步驟" };
            if (rule === 'any' && doneCount === 0) return { success: false, msg: "🔒 請至少完成一個步驟" };
        }

        // 切換
        task.done = !task.done;

        if (task.done) {
            // 發放獎勵
            task.doneTime = Date.now();
            const imp = task.importance || 1; 
            const urg = task.urgency || 1;
            const w = (imp * 1.5) + (urg * 0.5);
            const gold = Math.floor(10 * w); 
            const exp = Math.floor(10 * w);
            
            task.lastReward = { gold, exp };
            gs.gold += gold;
            gs.exp += exp;

            if (task.attrs && window.StatsEngine) StatsEngine.distributeExp(exp, task.attrs);
            if (window.StatsEngine) StatsEngine.checkLevelUp();
            
            // 熱量
            if (gs.settings.calMode && task.burn > 0) {
                if(!gs.calories) gs.calories = { in: 0, out: 0, history: [] };
                gs.calories.out += task.burn;
            }

            if(window.Core) Core.save();
            return { success: true, action: 'done', reward: task.lastReward };
        } else {
            // 回收獎勵
            task.doneTime = null;
            let refund = null;
            if (task.lastReward) {
                refund = task.lastReward;
                gs.gold = Math.max(0, gs.gold - refund.gold);
                gs.exp = Math.max(0, gs.exp - refund.exp);
                
                if (window.StatsEngine) {
                    StatsEngine.handleExpLoss();
                    if (task.attrs) StatsEngine.deductExp(refund.exp, task.attrs);
                }
                task.lastReward = null;
            }
            if(window.Core) Core.save();
            return { success: true, action: 'undone', refund: refund };
        }
    },

    // --- 5. 子任務與屬性微調 ---
    subtaskAction: (taskId, subIdx, action, value) => {
        // 判斷目標：正在編輯的 TempTask 還是列表中的 GlobalTask
        let target = null;
        let isTemp = false;

        if (window.TempState.editingTask && window.TempState.editingTask.id === taskId) {
            target = window.TempState.editingTask;
            isTemp = true;
        } else {
            target = window.GlobalState.tasks.find(t => t.id === taskId);
        }

        if (!target) return { success: false };
        if (!target.subs) target.subs = [];

        // 執行邏輯
        if (action === 'toggle' && target.subs[subIdx]) {
            target.subs[subIdx].done = !target.subs[subIdx].done;
        } else if (action === 'add') {
            target.subs.push({ text: '', done: false });
        } else if (action === 'remove') {
            target.subs.splice(subIdx, 1);
        } else if (action === 'update' && target.subs[subIdx]) {
            target.subs[subIdx].text = value;
        } else if (action === 'pin') {
            target.pinned = !target.pinned;
        }

        if (!isTemp && window.Core) Core.save(); // 只有改 Global 才存檔
        return { success: true, isTemp: isTemp };
    }
};

// ============================================================
// 【LAYER 2: 控制器層 (CONTROLLER)】
// 職責：接收 HTML 指令，呼叫 Logic，指揮 View 渲染。
// 規則：這裡是 Logic 與 View 的橋樑。
// ============================================================
const TaskController = {
    // 1. 初始化
    init: () => {
        TaskLogic.checkAndReset();
        // 這裡不需要呼叫 render，因為通常主程式會呼叫頁面初始化
    },

    // 2. 編輯與提交
    openCreateModal: (taskId = null) => {
        // 呼叫 Logic 準備數據
        if (taskId) {
            window.TempState.editingTask = TaskLogic.getTaskCopy(taskId);
        } else {
            window.TempState.editingTask = TaskLogic.createNewDraft();
        }
        // 指揮 View
        if(window.act.openModal) act.openModal('create'); 
        if(window.view) view.renderCreateTaskForm(taskId);
    },

    submitTask: () => {
        const result = TaskLogic.saveTask(window.TempState.editingTask);
        if (result.success) {
            if(window.act.closeModal) act.closeModal('create');
            if(window.act.toast) act.toast("已保存");
            if(window.view) view.renderTasks();
        } else {
            if(window.act.toast) act.toast(result.msg);
        }
    },

    // 3. 完成/取消任務
    resolveTask: (taskId) => {
        const result = TaskLogic.toggleStatus(taskId);
        
        if (!result.success) {
            if(window.act.toast) act.toast(result.msg);
            return;
        }

        // 成功後的 UI 反饋
        if (result.action === 'done') {
            const r = result.reward;
            if(window.act.toast) act.toast(`完成！+${r.gold}💰 +${r.exp}✨`);
        } else {
            if (result.refund) {
                if(window.act.toast) act.toast("已取消 (回收獎勵)");
            } else {
                if(window.act.toast) act.toast("已取消");
            }
        }

        // 刷新介面
        if(window.view) {
            view.renderHUD(); // 更新金幣/經驗條
            view.renderTasks(); // 更新列表
        }
    },

    // 4. 刪除與複製
    deleteTask: (id) => {
        if(window.act.confirm) {
            act.confirm("確定刪除此任務？", (yes) => {
                if(yes) {
                    TaskLogic.deleteTask(id);
                    if(window.act.closeModal) act.closeModal('create');
                    if(window.view) view.renderTasks();
                    act.toast("任務已刪除");
                }
            });
        }
    },

    copyTask: () => {
        const result = TaskLogic.copyTask(window.TempState.editingTask);
        if (result.success) {
            if(window.act.closeModal) act.closeModal('create');
            if(window.act.toast) act.toast("任務已複製");
            if(window.view) view.renderTasks();
        }
    },

    // 5. 子任務與其他互動
    handleSubtask: (taskId, idx, action, val) => {
        const result = TaskLogic.subtaskAction(taskId, idx, action, val);
        if (!result.success) return;

        // 決定要刷新哪個畫面
        if (result.isTemp) {
            // 如果是在編輯視窗中操作
            if(window.view) view.renderCreateTaskForm(taskId);
        } else {
            // 如果是在外部列表中操作
            if(window.view) view.renderTasks();
        }
    },

    // 釘選
    togglePin: () => {
        const temp = window.TempState.editingTask;
        if(temp) {
            TaskLogic.subtaskAction(temp.id, 0, 'pin');
            if(window.view) view.renderCreateTaskForm(temp.id);
        }
    },

    // 新增類別
    addNewCategory: () => {
        if(window.Core && Core.prompt) {
            Core.prompt("輸入新類別名稱", "", (name) => {
                if (name && name.trim()) {
                    const res = TaskLogic.addCategory(name);
                    if (res.success) {
                        // 如果正在編輯，自動選中新類別
                        if (window.TempState.editingTask) { 
                            window.TempState.editingTask.cat = name; 
                            if(window.view) view.renderCreateTaskForm(window.TempState.editingTask.id); 
                        }
                        if(window.view) view.renderTasks();
                        act.toast(`已新增類別: ${name}`);
                    }
                }
            });
        }
    }
};

// ============================================================
// 【LAYER 3: 綁定層 (BINDING)】
// 職責：將 Controller 的方法掛載到 window.act 供 HTML 呼叫。
// ============================================================
Object.assign(window.act, {
    // 核心
    taskInit: TaskController.init,
    
    // 任務主要操作
    editTask: TaskController.openCreateModal,
    submitTask: TaskController.submitTask,
    resolveTask: TaskController.resolveTask,
    toggleTask: TaskController.resolveTask, // Checkbox 相容
    deleteTask: TaskController.deleteTask,
    copyTask: TaskController.copyTask,
    
    // 子任務操作 (轉發給 handleSubtask)
    toggleSubtask: (id, idx) => TaskController.handleSubtask(id, idx, 'toggle'),
    addSubtask: () => TaskController.handleSubtask(window.TempState.editingTask?.id, 0, 'add'),
    removeSubtask: (idx) => TaskController.handleSubtask(window.TempState.editingTask?.id, idx, 'remove'),
    updateSubtaskText: (idx, val) => TaskController.handleSubtask(window.TempState.editingTask?.id, idx, 'update', val),
    
    // 輔助
    togglePin: TaskController.togglePin,
    addNewCategory: TaskController.addNewCategory,
    
    // 查詢供 View 使用 (直接暴露 Logic 的查詢功能)
    getSortedTasks: TaskLogic.getSortedTasks,

    // 純 View 切換 (不涉及邏輯，直接操作狀態並刷新)
    switchTaskTab: (tab) => { window.TempState.taskTab = tab; if(window.view) view.renderTasks(); },
    setTaskFilter: (cat) => { window.TempState.filterCategory = cat; window.TempState.viewHistoryMode = false; if(window.view) view.renderTasks(); },
    toggleHistoryMode: () => { window.TempState.viewHistoryMode = !window.TempState.viewHistoryMode; if(window.view) view.renderTasks(); },
    toggleTaskDetail: (id) => { window.TempState.expandedTaskId = (window.TempState.expandedTaskId === id) ? null : id; if(window.view) view.renderTasks(); }
});

// 啟動
setTimeout(TaskController.init, 100);
window.TaskEngine = { Logic: TaskLogic, Controller: TaskController }; // 方便除錯用