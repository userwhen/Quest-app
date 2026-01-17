/* js/core300.js - V18.0 Slim & Modular Core */
window.act = window.act || {};
window.TempState = window.TempState || {};
window.GlobalState = window.GlobalState || {};

const coreAct = {
    // =============================================================
    // [1] 介面系統：系統彈窗 (System Modals)
    // =============================================================
    // 這些是系統層級的攔截，優先使用 View 渲染，若無則退回原生
    showSysModal: (type, msg, val, callback) => {
        window.TempState.sysCallback = callback;
        if(window.view && view.renderSystemModal) {
            view.renderSystemModal(type, msg, val);
        } else {
            console.warn("View module missing, using native modal.");
            if(type === 'alert') { alert(msg); if(callback) callback(); }
            else if(type === 'confirm') { const r = confirm(msg); if(callback) callback(r); }
            else if(type === 'prompt') { const r = prompt(msg, val); if(callback) callback(r); }
        }
    },

    alert: (msg, cb) => coreAct.showSysModal('alert', msg, null, cb),
    confirm: (msg, cb) => coreAct.showSysModal('confirm', msg, null, cb),
    prompt: (msg, def, cb) => coreAct.showSysModal('prompt', msg, def, cb),
    
    // 處理系統彈窗的回傳
    handleSysConfirm: (result) => {
        if (result === 'prompt_submit') {
            const el = document.getElementById('sys-univ-input');
            result = el ? el.value : '';
        }
        if (window.TempState.sysCallback) {
            window.TempState.sysCallback(result);
            window.TempState.sysCallback = null;
        }
        // 關閉系統視窗 (轉向新的 system ID)
        if (window.act && window.act.closeModal) {
            window.act.closeModal('system');
        }
    },
    
    toast: (msg) => {
        // 直接轉發給 UI 庫處理，Core 不負責 DOM
        if (window.ui && ui.showToast) {
            ui.showToast(msg);
        } else {
            console.log("[Toast]", msg);
        }
    },

    // =============================================================
    // [2] 介面系統：導航與視窗管理 (Window Manager)
    // =============================================================
    navigate: (pageId) => {
        const targetId = pageId.startsWith('page-') ? pageId : `page-${pageId}`;
        const shortId = pageId.replace('page-', '');

        // 防重複導航
        const activePage = document.querySelector('.page.active');
        if (activePage && activePage.id === targetId && shortId !== 'main') return;

        // 1. 隱藏所有頁面
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none'; 
        });

        // 2. 顯示目標
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.classList.add('active');
            targetEl.style.display = 'flex'; // 確保是 flex 佈局
        } else {
            console.error("Target page not found:", targetId);
            return;
        }

        // ============================================================
        // [關鍵修改] 全螢幕模式控制 (Story / Avatar)
        // ============================================================
        const navbar = document.getElementById('navbar');
        const contentArea = document.getElementById('content-area'); // 或者是您的主容器 ID
        const isFullScreenMode = ['story', 'avatar'].includes(shortId);

        if (navbar && contentArea) {
            if (isFullScreenMode) {
                // 進入全螢幕：隱藏 Navbar，讓內容區填滿高度
                navbar.style.display = 'none';
                contentArea.style.height = '100%'; 
                contentArea.style.paddingBottom = '0'; // 移除底部留白
            } else {
                // 回到一般模式：顯示 Navbar，恢復內容區高度
                navbar.style.display = 'flex';
                // 恢復原本的高度設定 (假設 CSS 是 calc(100% - 60px) 或類似設定)
                // 這裡直接清空 inline style 讓 CSS 接手即可
                contentArea.style.height = ''; 
                contentArea.style.paddingBottom = '';
            }
        }
        // ============================================================

        // 3. 更新導航列 Active 狀態 (如果 Navbar 顯示的話)
        if (!isFullScreenMode) {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            const btn = document.getElementById(`nav-${shortId}`);
            if (btn) btn.classList.add('active');
        }

        // 4. 觸發各模組渲染
        if (window.view) {
            if(view.renderHUD) view.renderHUD(window.GlobalState); 

            if (shortId === 'task') {
                window.TempState.taskTab = 'list'; 
                if(view.renderTasks) view.renderTasks();
            } 
            else if (shortId === 'history' && view.renderHistoryPage) view.renderHistoryPage();
            else if (shortId === 'milestone' && view.renderMilestonePage) view.renderMilestonePage();
            else if (shortId === 'stats' && view.renderStats) view.renderStats();
            else if (shortId === 'shop' && view.renderShop) view.renderShop();
            else if (shortId === 'avatar' && view.renderAvatar) view.renderAvatar();
            else if (shortId === 'story' && view.renderStoryPage) {
                // 進入劇情模式時，確保調用渲染
                view.renderStoryPage();
            }
            else if (shortId === 'main') {
                const mode = window.GlobalState?.settings?.mode || 'basic';
                if(ui && ui.renderMain) ui.renderMain(mode);
            }
        }
    },
    
    // 快捷導航
    navToHistory: () => coreAct.navigate('history'),
    navToMilestone: () => coreAct.navigate('milestone'),
    
    // [重要] 通用開啟視窗入口 (Router for Modals)
    // 這裡負責將舊的 ID 轉發給新的動態渲染函數
    openModal: (id) => { 
        // 1. 設定 (Settings) -> 轉發給 Settings Module
        if (id === 'settings') {
            if (window.view && view.renderSettings) {
                view.renderSettings();
                return;
            }
        }
        
        // 2. 背包 (Bag) -> 轉發給 Shop Module
        if (id === 'bag') {
            if (window.view && view.renderBag) {
                view.renderBag();
                return;
            }
        }

        // 3. 任務快覽 (Quick) -> 轉發給 Task Module (未來做)
        if (id === 'quick' && window.view && view.renderQuick) {
            view.renderQuick();
            return; // Quick 目前通常也是動態的，若保留靜態則往下走
        }

        // 4. 舊式/靜態視窗 Fallback (相容性)
        // 嘗試直接尋找 DOM 開啟 (例如 m-quick 如果尚未遷移)
        const m = document.getElementById('m-'+id); 
        if(m) { 
            m.style.display='flex'; 
            m.classList.add('active'); 
        } else {
            console.warn(`Modal [${id}] handler not found in Core.`);
        }
    },

    // [重要] 通用關閉視窗入口
    closeModal: (id) => { 
        let targetId = 'm-' + id;

        // [相容性轉換] 處理舊代碼的 ID
        if (id === 'universal') targetId = 'm-overlay'; // 舊通用視窗 -> 新 Overlay (Layer 2)
        if (id === 'system') targetId = 'm-system';     // 系統視窗 (Layer 3)
        if (id === 'bag') targetId = 'm-panel';         // 背包 -> Panel (Layer 1)
        if (id === 'settings') targetId = 'm-panel';    // 設定 -> Panel (Layer 1)
        
        if (id.startsWith('m-')) targetId = id;

        const m = document.getElementById(targetId); 
        if(m) { 
            m.style.display='none'; 
            m.classList.remove('active'); 
            // 如果是 Overlay/Universal，關閉時可能需要清理內容
            // m.className = 'mask'; // Reset classes if needed
        } 
    },

    // =============================================================
    // [3] 資料存取與工具 (Utils)
    // =============================================================
    save: () => { 
        // 觸發 main300.js 定義的寫入 localStorage
        if(!window.isResetting && typeof window.forceSaveNow === 'function') window.forceSaveNow(); 
    },
    
    // 生成隨機 ID
    generateId: (prefix='id') => prefix + '_' + Date.now() + Math.random().toString(36).substr(2, 9),
    
    // 數字驗證工具 (Input用)
    validateNumber: (el, max) => { 
        let v=parseInt(el.value); 
        if(isNaN(v)) v=''; 
        else if(max && v>max) v=max; 
        el.value = v; 
    },

    // QA/新手教學入口 (暫留於 Core，或可移至 Main)
    showQA: () => { 
        coreAct.confirm("要重新觀看新手教學嗎?", (yes)=>{ 
            if(yes && window.act.restartTutorial) window.act.restartTutorial(); 
            else coreAct.alert("冒險者指南:\n完成每日任務來獲得經驗與金幣。"); 
        }); 
    }
};

Object.assign(window.act, coreAct);