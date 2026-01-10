/* js/core300.js - V44.0 Core Logic Adapter */

window.act = window.act || {};

const Core = {
    // -------------------------------------------------------------------------
    // [Init] 系統初始化
    // -------------------------------------------------------------------------
    init: () => {
        console.log("🚀 LevLife Engine (Shell Arch V44) Ready.");
        
        // 1. 載入資料
        if (!window.DefaultData) { console.error("Data Load Failed"); return; }
        Core.load();
        Core.repairData();
        
        // 2. 綁定全域介面
        window.act.openModal = Core.openModal;
        window.act.closeModal = Core.closeModal;
        window.act.navigate = Core.navigate;
        window.act.alert = Core.alert;
        window.act.toast = Core.toast;
        window.act.confirm = Core.confirm;
        
        // 3. 初始導航 (預設進大廳)
        if (window.view) {
            view.renderHUD();
            Core.navigate('lobby'); 
        }
        
        // 4. 啟動後台服務 (精力恢復)
        Core.checkEnergyLoop(); 
        
        // 5. 教學檢查 (如有)
        if (window.act && act.checkTutorial) act.checkTutorial();
    },

    // -------------------------------------------------------------------------
    // [Data] 資料存取
    // -------------------------------------------------------------------------
    load: () => {
        const saved = localStorage.getItem('LQ_V1');
        if (saved && saved !== "undefined") {
            try { window.GlobalState = { ...window.DefaultData, ...JSON.parse(saved) }; }
            catch (e) { window.GlobalState = JSON.parse(JSON.stringify(window.DefaultData)); }
        } else { window.GlobalState = JSON.parse(JSON.stringify(window.DefaultData)); }
    },

    save: () => {
        if (window.GlobalState) localStorage.setItem('LQ_V1', JSON.stringify(window.GlobalState));
    },

    repairData: () => {
        const gs = window.GlobalState;
        if(!gs.settings) gs.settings = { mode: 'adventurer' };
        if(!gs.avatar) gs.avatar = window.DefaultData.avatar;
        if(!gs.story) gs.story = window.DefaultData.story;
    },

    // -------------------------------------------------------------------------
    // [Navigation] 頁面導航系統 (適配 Shell 架構)
    // -------------------------------------------------------------------------
    navigate: (pageId) => {
        // 1. 關閉所有彈窗
        document.querySelectorAll('.mask').forEach(el => {
             el.classList.remove('active');
             el.style.display = 'none';
        });

        // 2. 判斷是否為 Layer Top 頁面 (劇情/紙娃娃)
        const topLayers = ['story', 'avatar']; 
        const isTop = topLayers.includes(pageId);

        if (isTop) {
            // A. 開啟覆蓋層
            const target = document.getElementById(`page-${pageId}`);
            if (target) {
                target.style.display = 'flex'; 
                if(pageId === 'story' && view.renderStoryPage) view.renderStoryPage();
                if(pageId === 'avatar' && view.renderWardrobe) view.renderWardrobe();
            }
        } else {
            // A. 關閉所有 Layer Top
            document.querySelectorAll('.page-shell.layer-top').forEach(el => el.style.display = 'none');

            // B. 切換主層 Shell (使用 .page-shell)
            const shells = document.querySelectorAll('#app-main .page-shell');
            shells.forEach(el => el.classList.remove('active')); 

            const target = document.getElementById(`page-${pageId}`);
            if (target) {
                target.classList.add('active'); 
            }

            // C. 更新底部 Nav
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            const navBtn = document.getElementById(`nav-${pageId}`);
            if (navBtn) navBtn.classList.add('active');

            // D. 觸發 View 渲染
            if (window.view && view.render) view.render();
        }
    },

    // 捷徑
    enterStoryMode: () => { Core.navigate('story'); },
    
    // 返回功能
    back: () => {
        document.querySelectorAll('.page-shell.layer-top').forEach(el => el.style.display = 'none');
        if (window.view && view.render) view.render();
    },

    // -------------------------------------------------------------------------
    // [UI Control] 彈窗與互動
    // -------------------------------------------------------------------------
    openModal: (id) => { 
        const el = document.getElementById('m-'+id);
        if(el) {
            el.classList.add('active');
            el.style.display = 'flex'; 
        }
    },
    closeModal: (id) => { 
        const el = document.getElementById('m-'+id);
        if(el) {
            el.classList.remove('active');
            el.style.display = 'none';
        }
    },
    
    handleFab: () => Core.openModal('create'),

    // -------------------------------------------------------------------------
    // [Logic] 精力恢復循環
    // -------------------------------------------------------------------------
    checkEnergyLoop: () => {
        const gs = window.GlobalState;
        if (!gs) return;
        
        const INTERVAL = 6 * 60 * 1000; // 6分鐘
        if (!gs.story.lastRecTime) gs.story.lastRecTime = Date.now();

        const doCheck = () => {
            const now = Date.now();
            const elapsed = now - gs.story.lastRecTime;
            
            console.log(`⚡ [Energy] 累積: ${Math.floor(elapsed/1000)}s / 360s | MP: ${gs.story.energy}/${gs.story.maxEnergy}`);

            if (elapsed >= INTERVAL) {
                const recoverPoints = Math.floor(elapsed / INTERVAL);
                if (recoverPoints > 0) {
                    Core.recoverEnergy(recoverPoints);
                    console.warn(`⚡ [Energy] 自動恢復 +${recoverPoints} 點`);
                    gs.story.lastRecTime = now - (elapsed % INTERVAL);
                    Core.save();
                }
            }
        };

        doCheck();
        setInterval(doCheck, 10000); 
    },

    recoverEnergy: (amount = 9999) => {
        const gs = window.GlobalState;
        const oldVal = gs.story.energy;
        const absoluteMax = 100; 
        const currentMax = Math.min(absoluteMax, gs.story.maxEnergy);
        
        gs.story.energy = Math.min(currentMax, gs.story.energy + amount);
        const diff = gs.story.energy - oldVal;
        
        if(diff > 0 && amount > 1) Core.toast(`⚡ 精力已恢復 (+${diff})`);
        
        const el = document.getElementById('story-energy-val');
        if(el) {
            el.innerText = `${gs.story.energy}/${gs.story.maxEnergy}`;
            el.style.color = gs.story.energy < 5 ? '#ff5252' : '#ffb74d';
        }
    },

    // -------------------------------------------------------------------------
    // [System UI] 通用提示框
    // -------------------------------------------------------------------------
    showSysModal: (htmlContent) => {
        const body = document.getElementById('sys-msg-body');
        if(body) {
            body.innerHTML = htmlContent;
            Core.openModal('system');
        }
    },

    alert: (msg, callback) => {
        Core.showSysModal(`
            <div style="text-align:center; padding:10px;">
                <div style="margin-bottom:20px; font-weight:bold; font-size:1.1rem;">${msg.replace(/\n/g, '<br>')}</div>
                <button class="u-btn u-btn-primary u-btn-lg" onclick="act.closeModal('system'); if(window._cb) window._cb();">確定</button>
            </div>
        `);
        window._cb = callback;
    },

    confirm: (msg, callback) => {
        Core.showSysModal(`
            <div style="text-align:center; padding:10px;">
                <div style="margin-bottom:20px; font-weight:bold;">${msg.replace(/\n/g, '<br>')}</div>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button class="u-btn u-btn-secondary" onclick="act.closeModal('system'); if(window._cb) window._cb(false);">取消</button>
                    <button class="u-btn u-btn-primary" onclick="act.closeModal('system'); if(window._cb) window._cb(true);">確定</button>
                </div>
            </div>
        `);
        window._cb = callback;
    },

    toast: (msg) => {
        let t = document.getElementById('toast-box');
        if (!t) {
            t = document.createElement('div');
            t.id = 'toast-box';
            t.className = 'u-toast';
            document.body.appendChild(t);
        }
        t.innerText = msg;
        t.classList.add('show');
        if (window._toastTimer) clearTimeout(window._toastTimer);
        window._toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
    }
};

window.Core = Core;
window.act = { ...window.act, ...Core };