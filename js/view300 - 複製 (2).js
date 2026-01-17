/* js/view300.js - V9.0.Final (B-Version Art & Logic Integrated) */

// ==========================================
// [區域 1] UI 高級元件庫 (B-Version Art)
// ==========================================
const ui = {
    // 1. 佈局與捲動
    layout: {
        scroller: (header, content, bodyId) => `
            <div style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
                <div style="flex-shrink:0;">${header}</div>
                <div id="${bodyId}" class="u-scroll-y" style="flex:1; overflow-y:auto; padding-bottom:80px;">
                    ${content}
                </div>
            </div>`
    },

    // 2. 頁籤與導航
    tabs: {
        sliding: (label1, label2, isFirstActive, click1, click2) => {
            // 計算滑塊位置：左邊是 0%，右邊是 100%
            const translate = isFirstActive ? '0%' : '100%';
            
            return `
            <div class="sliding-tabs-container">
                <div class="sliding-tabs">
                    <div class="sliding-pill" style="transform: translateX(${translate})"></div>
                    
                    <button class="sliding-tab-btn ${isFirstActive ? 'active' : ''}" 
                            onclick="${click1}" 
                            style="color: ${isFirstActive ? '#000' : '#888'}">
                        ${label1}
                    </button>
                    
                    <button class="sliding-tab-btn ${!isFirstActive ? 'active' : ''}" 
                            onclick="${click2}"
                            style="color: ${!isFirstActive ? '#000' : '#888'}">
                        ${label2}
                    </button>
                </div>
            </div>`;
        },
        scrollX: (items, activeItem, onClickStr, onAddActionStr = null) => {
            let html = items.map(item => {
                const isActive = activeItem === item;
                const cls = isActive ? 'u-tag active' : 'u-tag';
                return `<button class="${cls}" onclick="${onClickStr}('${item}')">${item}</button>`;
            }).join('');

            // 如果有傳入新增功能的 JS 字串，就多加一顆按鈕
            if (onAddActionStr) {
                html += `<button class="btn-add-tag" onclick="${onAddActionStr}">+</button>`;
            }

            return `<div class="u-scroll-x">${html}</div>`;
        }
    },


    // 3. 卡片組件 (標準化 V10.4)
    card: {
        task: (t, isHistory, isExpanded) => {
    // A. 鎖定與標籤
    let isLocked = false;
    // 只有在非計次任務且有子任務時，才計算鎖定狀態
    if (t.type !== 'count' && !t.done && t.subs && t.subs.length > 0) {
        const doneCount = t.subs.filter(s => s.done).length;
        if ((t.subRule === 'all' && doneCount < t.subs.length) || (t.subRule === 'any' && doneCount === 0)) isLocked = true;
    }
    
    let tags = ui.badge.matrix(t.importance, t.urgency);
    if (t.attrs) tags += t.attrs.map(n => `<span class="badge-bronze">💪</span>`).join('');

    // 📌 釘選 (在標題列最右邊)
    const pinHtml = t.pinned ? `<span class="pin-icon">📌</span>` : '';

    // B. [關鍵修改] 進度條邏輯：優先判斷 type === 'count'
    let progressHtml = '';
    let pct = 0; let text = '';

    if (t.type === 'count') {
        // 1. 如果是計次任務，優先顯示次數 (不管有沒有殘留子任務)
        const current = t.curr || 0;
        const target = t.target || 1;
        pct = Math.min(100, Math.round((current / target) * 100));
        text = `${current}/${target}`;
    } else if (t.subs && t.subs.length > 0) {
        // 2. 否則才看有沒有子任務
        const done = t.subs.filter(s => s.done).length;
        pct = Math.round((done / t.subs.length) * 100);
        text = `${done}/${t.subs.length}`;
    }

    if (text) {
        progressHtml = `<div class="std-progress-bg"><div class="std-progress-fill" style="width:${pct}%;"></div><div class="progress-text-overlay">${text}</div></div>`;
    } else {
        progressHtml = `<div style="height:14px;"></div>`;
    }

    // C. 狀態與左欄 (Checkbox 生成)
    let statusClass = isHistory ? (t.status === 'success' ? 'status-daily' : 'status-imp') : (t.importance>=3 ? 'status-imp' : 'status-daily');
    let extraClass = isHistory ? 'history-mode' : '';

    let leftContent = '';
    if (isHistory) {
        leftContent = t.status === 'success' ? '✅' : '❌';
    } else {
        // 判斷點擊行為：計次任務呼叫 increment，一般任務呼叫 toggle
        const clickAction = (t.type === 'count') 
            ? `window.act.incrementTask('${t.id}')` 
            : `window.act.toggleTask('${t.id}')`;

        leftContent = `<div class="${`chk ${t.done?'visually-checked':''} ${isLocked?'locked':''}`}" 
                       onclick="event.stopPropagation(); ${clickAction}"></div>`;
    }

    // D. 右欄：只保留齒輪
    let rightContent = '';
    if (!isHistory) {
        const editBtn = `<button class="btn-ghost-edit" onclick="event.stopPropagation(); window.act.editTask('${t.id}')">⚙️</button>`;
        rightContent = editBtn;
    } else {
        const d = new Date(t.finishDate);
        rightContent = `<div class="card-date-abs">${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}</div>`;
    }

    // E. [關鍵修改] 展開內容
    let expandHtml = '';
    if (isExpanded) {
        // 只有「非計次任務」才顯示子任務列表
        // 這樣就算資料庫有殘留資料，切換成計次後也不會顯示出來干擾視覺
        let subHtml = '';
        if (t.type !== 'count' && t.subs && t.subs.length > 0) {
            subHtml = t.subs.map((s, i) => `
                <div class="subtask-row" 
                     style="cursor:pointer; display:flex; align-items:center; padding:4px 0;"
                     onclick="event.preventDefault(); event.stopImmediatePropagation(); window.act.toggleSubtask(event, '${String(t.id)}', ${i}); return false;">
                     
                    <input type="checkbox" class="subtask-chk" ${s.done?'checked':''} disabled style="pointer-events:none;"> 
                    
                    <span style="text-decoration:${s.done?'line-through':'none'}; color:${s.done?'#999':'#333'}; flex:1; margin-left:8px;">
                        ${s.text}
                    </span>
                </div>`
            ).join('');
        }

        // 描述與到期日
        let descText = t.desc || '<span style="color:#aaa;">無描述</span>';
        let dateBadge = '';
        if (t.deadline) {
            const d = new Date(t.deadline);
            const isOverdue = d < new Date() && !t.done;
            const colorStyle = isOverdue ? 'color:red;' : '';
            dateBadge = `<div class="expand-date-badge" style="${colorStyle}">📅 ${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}</div>`;
        }

        expandHtml = `
        <div class="card-expand-content show">
            <div class="expand-header">
                <div class="expand-desc">${descText}</div>
                ${dateBadge}
            </div>
            ${subHtml}
        </div>`;
    }

    // F. 回傳組合
    return `
    <div class="std-card ${statusClass} ${extraClass}" onclick="window.act.toggleTaskDetail('${t.id}')">
        <div class="card-col-left">${leftContent}</div>
        <div class="card-col-center">
            <div class="card-info-row">
                <div class="card-title" style="${t.done||isHistory?'text-decoration:line-through;color:#aaa;':''}">${t.title}</div>
                ${tags}
                ${pinHtml}
            </div>
            <div class="card-progress-row">${progressHtml}</div>
        </div>
        <div class="card-col-right center-v">
            ${rightContent}
        </div>
        ${expandHtml}
    </div>`;
}
    },

    // 4. 輸入組件
    input: {
        // ... (text, textarea, datetime 保持不變) ...
        text: (value, placeholder, onchange) => 
            `<input type="text" class="inp" value="${value||''}" placeholder="${placeholder}" onchange="${onchange}">`,
        
        textarea: (value, placeholder, onchange) => 
            `<textarea class="inp" style="height:80px;" placeholder="${placeholder}" onchange="${onchange}">${value||''}</textarea>`,

        datetime: (value, onchange) => 
            `<input type="datetime-local" class="inp" value="${value||''}" onchange="${onchange}">`,

        // [重寫] 數字輸入 (嚴格限制位數 + 遊戲內提示)
        // digits: 限制位數 (預設4)
        number: (value, placeholder, onchange, digits=4) => {
            const width = digits <= 2 ? '50px' : '80px';
            
            // 這段 JS 會被注入到 oninput 事件中
            // 1. replace(/[^\d]/g, ''): 只准輸入 0-9，其他符號刪掉
            // 2. slice(0, digits): 超過位數直接切掉
            // 3. 檢查長度並觸發 Toast
            const validationScript = `
                let v = this.value.replace(/[^\\d]/g, '');
                if (v.length > ${digits}) {
                    v = v.slice(0, ${digits});
                    act.toast('最多只能輸入 ${digits} 位數哦！'); 
                }
                this.value = v; 
                ${onchange}; 
            `;

            // 使用 type="text" + inputmode="numeric" 喚起手機數字鍵盤，但避開瀏覽器驗證
            return `<input type="text" inputmode="numeric" class="inp inp-num" 
                           style="width:${width};" 
                           value="${value||''}" 
                           placeholder="${placeholder}" 
                           oninput="${validationScript}">`;
        }
    },

    // 5. 按鈕組件
    btn: {
        primary: (text, onclick) => `<button class="u-btn u-btn-primary" onclick="${onclick}">${text}</button>`,
        secondary: (text, onclick) => `<button class="u-btn u-btn-secondary" onclick="${onclick}">${text}</button>`,
        danger: (text, onclick) => `<button class="u-btn u-btn-danger" onclick="${onclick}">${text}</button>`,
        ghost: (html, onclick, cls='') => `<button class="u-btn u-btn-ghost ${cls}" onclick="${onclick}">${html}</button>`,
        sm: (text, onclick, cls='') => `<button class="u-btn u-btn-sm ${cls}" onclick="${onclick}">${text}</button>`
    },

    // 6. 徽章與標籤
    badge: {
        skill: (name, active, parentIcon = '❓', onclick) => {
            const style = active ? 'border-color:#009688; background:#e0f2f1; color:#00695c;' : 'opacity:0.6;';
            return `<div class="badge-bronze" style="${style} border:1px solid #ccc; border-radius:12px; padding:4px 8px; font-size:0.85rem; cursor:pointer;" onclick="${onclick}">${parentIcon} ${name}</div>`;
        },
        matrix: (imp, urg) => {
            if(imp >= 3 && urg >= 3) return '<span class="matrix-tag-flat" style="color:#d32f2f; background:#ffebee; padding:2px 6px; border-radius:4px; font-size:0.75rem;">🔥 危機</span>';
            if(imp >= 3) return '<span class="matrix-tag-flat" style="color:#0288d1; background:#e1f5fe; padding:2px 6px; border-radius:4px; font-size:0.75rem;">💎 願景</span>';
            if(urg >= 3) return '<span class="matrix-tag-flat" style="color:#ef6c00; background:#fff3e0; padding:2px 6px; border-radius:4px; font-size:0.75rem;">⚡ 突發</span>';
            return '<span class="matrix-tag-flat" style="color:#757575; background:#f5f5f5; padding:2px 6px; border-radius:4px; font-size:0.75rem;">🍂 雜務</span>';
        },
        count: (curr, target) => `<span class="count-pill" style="font-size:0.8rem; color:#666; margin-left:5px;">(${curr}/${target})</span>`
    },
	
	
    
    // 7. 基礎渲染積木 (UI Components) - [合併重構版]
    
    // [更新] 通用進度條 (改用 .u-progress)
    // 參數變更: pct(百分比), text(顯示文字), id(DOM ID), style(可選CSS)
    renderProgressBar: (pct, text, id, style="width:80px; height:8px;") => `
        <div class="u-progress" style="${style}">
            <div class="u-progress-fill" id="${id}" style="width: ${pct}%"></div>
            <span class="u-progress-text">${text}</span>
        </div>`,

    // [更新] 通用膠囊 (改用 .u-pill)
    renderPill: (icon, value, colorClass, id) => `
        <div class="u-pill ${colorClass}">
            <span class="u-icon">${icon}</span>
            <span id="${id}">${value}</span>
        </div>`,

    // [更新] 通用頭像 (改用 .u-avatar)
    renderAvatar: (id, onClick, content) => `
        <div class="u-avatar" id="${id}" onclick="${onClick}">
            ${content}
        </div>`,

    // [更新] 通用圖標按鈕 (改用 .u-btn-icon)
    // 加入了 event.stopPropagation() 以防誤觸背景
    renderIconBtn: (icon, onClick, label) => `
        <button class="u-btn-icon" onclick="event.stopPropagation(); ${onClick}" aria-label="${label}">
            ${icon}
        </button>`,

    // [保留] 以下組件維持原樣 (尚未重構部分)
    renderSquareBtn: (icon, onClick, id = '', isActive = false) => `<button class="icon-btn ${isActive ? 'active' : ''}" ${id ? `id="${id}"` : ''} onclick="event.stopPropagation(); ${onClick}">${icon}</button>`,
    renderActionBtn: (text, onClick, id = '', colorClass = 'btn-story') => `<button class="${colorClass}" ${id ? `id="${id}"` : ''} onclick="${onClick}">${text}</button>`,
    renderCharStage: (onClick, content = '<div class="char-placeholder">🦸</div>') => `<div class="char-stage" id="lobby-stage"><div class="char-container" onclick="${onClick}">${content}</div></div>`,
    
    // 8. 組裝邏輯 (Blueprints)
    getHUDHtml: function(data) {
        // A. 準備頭像內容 (Fallback 機制)
        let avatarContent = '🧑‍🚀'; // 預設 Emoji
        if (data.avatar) {
            const gender = data.avatar.gender || 'm';
            if (window.Asset && window.Asset.resolve) {
                // 如果有資源載入器，嘗試載入圖片
                try {
                    const src = window.Asset.resolve(gender, 'icon');
                    avatarContent = `<img src="${src}" alt="Avatar">`;
                } catch(e) { 
                    // 載入失敗則用 Emoji
                    avatarContent = gender === 'f' ? '👩' : '👨'; 
                }
            } else {
                // 沒有 Asset 模組時
                avatarContent = gender === 'f' ? '👩' : '👨';
            }
        }

        // B. 計算數據
        const lv = data.lv || 1;
        const maxExp = lv * 100;
        const currExp = data.exp || 0;
        const pct = Math.min(100, Math.max(0, (currExp / maxExp) * 100));
        const name = data.name || 'Commander';

        // C. 拼接 HTML (完全對應 CSS 結構)
        return `
            <div class="hud-left">
                ${this.renderAvatar('hud-avatar', "act.navigate('stats')", avatarContent)}
                
                <div class="hud-info">
                    <div class="hud-name">${name}</div>
                    <div class="hud-lv-row">
                        <div class="hud-lv-txt">Lv.<span id="ui-lv">${lv}</span></div>
                        ${this.renderProgressBar(pct, `${currExp}/${maxExp}`, 'ui-exp-bar', 'height:12px;')}
                    </div>
                </div>
            </div>

            <div class="hud-right">
                <div class="res-row" onclick="act.openPayment()">
                    ${this.renderPill('💎', data.freeGem || 0, 'blue', 'ui-gem')}
                    ${this.renderPill('💠', data.paidGem || 0, 'purple', 'ui-p-gem')}
                </div>
                
                <div class="res-row" style="justify-content: flex-end;">
                    ${this.renderPill('💰', data.gold || 0, 'gold', 'ui-gold')}
                    ${this.renderIconBtn('≡', "act.openModal('settings')", '設定')}
                </div>
            </div>
        `;
    },
    
    getMainSceneHtml: function(mode) {
        const isHarem = mode === 'harem';
        const icons = { task: isHarem ? '📜' : '📝', bag: isHarem ? '📦' : '🎒', avatar: isHarem ? '👘' : '👗', qa: isHarem ? '🏮' : '❓' };
        return `
            <div class="quick-icons" id="main-icons">
                ${this.renderSquareBtn(icons.task, "act.openModal('quick')", 'btn-q-task')}
                ${this.renderSquareBtn(icons.bag, "act.openModal('bag')", 'btn-q-bag')}
                ${this.renderSquareBtn(icons.avatar, "act.navigate('avatar')", 'btn-q-avatar')}
                ${this.renderSquareBtn(icons.qa, "act.showQA()", 'btn-q-qa')}
            </div>
            ${this.renderCharStage("act.navigate('stats')")}
            ${this.renderActionBtn('🌀 劇情模式', "act.enterStoryMode()", 'btn-story-mode')}
        `;
    },

    showToast: function(msg) {
        const old = document.querySelector('.u-toast'); if(old) old.remove();
        const div = document.createElement('div');
        div.innerHTML = `<div class="u-toast show">${msg}</div>`;
        document.body.appendChild(div.firstElementChild);
        setTimeout(() => { const t = document.querySelector('.u-toast'); if(t) t.remove(); }, 3000);
    },
    
    // 渲染 HUD 執行入口
    renderHUD: function(data) {
        const hudContainer = document.getElementById('hud');
        if (hudContainer) hudContainer.innerHTML = this.getHUDHtml(data || window.GlobalState || {});
    },
    
    // 渲染 Main 執行入口
    renderMain: function(mode) {
        const container = document.querySelector('.main-scene');
        if(container) container.innerHTML = this.getMainSceneHtml(mode);
    }
};

// 雙向相容
window.ui = ui;
window.UI = ui;

// ==========================================
// [區域 2] 橋接邏輯 (Bridge Logic)
// ==========================================
window.view = window.view || {};

view.renderHUD = (data) => ui.renderHUD(data);

view.renderMain = (mode) => ui.renderMain(mode);

view.renderSystemModal = (type, msg, defVal) => {
    let title = '系統提示';
    let bodyHtml = `<div class="sys-msg-body">${msg.replace(/\n/g, '<br>')}</div>`;
    let footHtml = '';

    // 根據類型配置
    if (type === 'alert') {
        title = '提示';
        footHtml = `
            <button class="u-btn u-btn-primary" style="width:100%;" onclick="act.handleSysConfirm(true)">好</button>
        `;
    } 
    else if (type === 'confirm') {
        title = '確認';
        footHtml = `
            <button class="u-btn u-btn-secondary" onclick="act.handleSysConfirm(false)">取消</button>
            <button class="u-btn u-btn-primary" onclick="act.handleSysConfirm(true)">確定</button>
        `;
    } 
    else if (type === 'prompt') {
        title = '輸入';
        bodyHtml += `
            <div class="input-group" style="margin-top:-10px;">
                <input type="text" id="sys-univ-input" class="inp" value="${defVal||''}" style="text-align:center;">
            </div>
        `;
        footHtml = `
            <button class="u-btn u-btn-secondary" onclick="act.handleSysConfirm(null)">取消</button>
            <button class="u-btn u-btn-primary" onclick="act.handleSysConfirm('prompt_submit')">確定</button>
        `;
    }

    // 呼叫通用渲染器 (利用既有的 renderModal)
    view.renderModal(title, bodyHtml, footHtml);

    // Prompt 模式自動聚焦
    if (type === 'prompt') {
        setTimeout(() => {
            const inp = document.getElementById('sys-univ-input');
            if(inp) { inp.focus(); inp.select(); }
        }, 100);
    }
};

view.renderModal = (title, bodyHtml, footHtml) => {
    const modal = document.getElementById('m-universal');
    if (!modal) return;

    // 1. 填入標題與內容
    document.getElementById('univ-title').innerText = title;
    document.getElementById('univ-body').innerHTML = bodyHtml;

    // 2. 處理 Footer
    const foot = document.getElementById('univ-foot');
    if (footHtml) {
        foot.style.display = 'flex';
        foot.innerHTML = footHtml;
    } else {
        foot.style.display = 'none';
    }

    // 3. [關鍵修正] 只有當視窗「還沒」顯示時，才呼叫 openModal
    // 這能防止你在編輯視窗內切換選項時，視窗動畫重新播放 (導致閃爍或焦點重置)
    if (!modal.classList.contains('active')) {
        act.openModal('universal');
    }
};

// [V10.2] 任務頁面渲染 (分離佈局 + 統一跳頁邏輯)
view.renderTasks = () => {
    const container = document.getElementById('task-list');
    if(!container) return;
    
    // --- [關鍵 1] 記錄舊的捲軸位置 ---
    const oldFilterScroll = document.querySelector('#task-list .u-scroll-x');
    if (oldFilterScroll) {
        window.TempState.mainListScrollX = oldFilterScroll.scrollLeft;
    }

    const currentTab = window.TempState.taskTab || 'list'; 
    const isList = currentTab === 'list';
    
    // Header
    const headerHtml = ui.tabs.sliding('📋 任務列表', '🏆 榮譽成就', isList, "act.switchTaskTab('list')", "act.switchTaskTab('ach')");
    
    let contentHtml = '';
    
    if (isList) {
        // --- A. 任務列表模式 ---
        const currentCat = window.TempState.filterCategory || '全部';
        const cats = window.GlobalState.taskCats || ['全部', '每日', '工作'];
        const allCats = ['全部', ...cats.filter(c => c !== '全部')];
        
        let tasks = (window.act && act.getSortedTasks) ? act.getSortedTasks(false, currentCat) : [];

        // [1] 生成捲動條 HTML
        const scrollHtml = ui.tabs.scrollX(allCats, currentCat, "act.setTaskFilter");

        // [2] 組裝：左邊是捲動條，右邊是歷史按鈕
        const filterHtml = `
            <div class="filter-container">
                ${scrollHtml} <div class="filter-action-btn">
                    <button class="u-btn u-btn-sm u-btn-paper" onclick="act.navigate('history')">📜 歷史</button>
                </div>
            </div>`;

        let listHtml = tasks.length === 0 ? `<div style="text-align:center;color:#888;padding:40px;">暫無任務</div>` : tasks.map(t => ui.card.task(t, false, window.TempState.expandedTaskId === t.id)).join('');
        
        contentHtml = filterHtml + listHtml + '<div style="height: 80px;"></div>';

    } else {
        // --- B. 成就列表模式 ---
        const currentAchCat = window.TempState.achFilter || '全部';
        // 定義成就分類
        const achCats = ['全部', '每日', '里程碑', '官方']; 
        
        // 準備數據與過濾
        let achs = window.GlobalState.achievements || [];
        let displayAchs = achs;
        
        if (currentAchCat === '每日') displayAchs = achs.filter(a => a.type === 'check_in');
        else if (currentAchCat === '里程碑') displayAchs = achs.filter(a => a.type !== 'check_in' && !a.isSystem);
        else if (currentAchCat === '官方') displayAchs = achs.filter(a => a.isSystem);
        
        // 排序
        displayAchs.sort((a, b) => {
            const aReady = (a.curr >= a.targetVal && !a.done) || (a.type==='check_in' && !a.done);
            const bReady = (b.curr >= b.targetVal && !b.done) || (b.type==='check_in' && !b.done);
            if (aReady && !bReady) return -1;
            if (!aReady && bReady) return 1;
            return 0;
        });

        // [1] 生成捲動條 HTML (注意：點擊觸發 updateAchFilter)
        // 我們需要一個簡單的切換函式，如果 act 沒有，我們可以暫時用 window.TempState 直接切換並重繪
        const onClickStr = "((cat)=>{window.TempState.achFilter=cat; view.renderTasks();})";
        const scrollHtml = ui.tabs.scrollX(achCats, currentAchCat, onClickStr);

        // [2] 組裝：左邊是捲動條，右邊是殿堂按鈕
        const toolbar = `
            <div class="filter-container">
                ${scrollHtml}
                <div class="filter-action-btn">
                    <button class="u-btn u-btn-sm u-btn-paper" onclick="act.navigate('milestone')">🏆 殿堂</button>
                </div>
            </div>`;

        // 卡片渲染器 (修復按鈕顯示問題)
        const renderAch = (a) => {
    // 計算進度
    const pct = a.targetVal > 0 ? Math.min(100, (a.curr / a.targetVal) * 100) : 0;
    
    // 狀態判斷
    const isCompleted = a.curr >= a.targetVal; // 是否數值達標
    const isCheckIn = a.type === 'check_in';
    
    // 按鈕邏輯
    let btnHtml = '';
    if (isCheckIn) {
        // 簽到：若 !done 顯示可簽，若 done 顯示已簽(鎖定)
        btnHtml = !a.done ? 
            `<button class="btn-action-std can-do" onclick="window.act.doCheckIn('${a.id}')">可簽到</button>` : 
            `<button class="btn-action-std locked" disabled>已簽到</button>`;
    } else {
        // 一般成就：
        // 若達標且未 done -> 顯示領取 (Claim)
        // 若未達標 -> 顯示進度
        // 注意：因為列表已過濾掉 claimed，所以這裡不會有「已歸檔」的狀態
        btnHtml = (isCompleted && !a.done) ? 
            `<button class="btn-action-std claim" onclick="window.act.claimAchievement('${a.id}')">🎁領取</button>` : 
            `<button class="btn-action-std locked" disabled>進行中</button>`;
    }

    // [核心需求] 齒輪鎖定邏輯
    // 如果已達標 (isCompleted) 且不是簽到類型 (check_in)，則隱藏齒輪
    // 因為簽到是重複性的，可能還需要改標題，所以保留齒輪；但一次性成就達成後就只能領獎
    let gearBtn = `<button class="btn-ghost-edit" onclick="window.act.editAchievement('${a.id}')">⚙️</button>`;
    if (isCompleted && !isCheckIn) {
        gearBtn = ''; // 達成後隱藏編輯按鈕
    }

    // 進度條 HTML
    const progressText = `${a.curr}/${a.targetVal}`;
    const progressHtml = `<div class="u-progress" style="width:100%; height:14px;"><div class="u-progress-fill" style="width:${pct}%;"></div><span class="u-progress-text">${progressText}</span></div>`;

    return `
    <div class="std-card ${isCompleted && !a.done ? 'status-done' : ''}">
        <div class="card-col-left" style="font-size:1.2rem;">🏆</div>
        <div class="card-col-center">
            <div class="card-info-row">
                <div class="card-title">${a.title}</div>
                <div style="font-size:0.8rem; color:#f57c00;">💰${a.reward.gold}</div>
            </div>
            <div class="card-progress-row">${progressHtml}</div>
        </div>
        <div class="card-col-right inline">
            ${btnHtml}
            ${gearBtn}
        </div>
    </div>`;
};

        let achHtml = '<div style="padding:0 5px;">';
        if (displayAchs.length === 0) achHtml += `<div style="text-align:center;color:#aaa;padding:40px;">此分類暫無成就</div>`;
        else achHtml += displayAchs.map(renderAch).join('');
        achHtml += '</div>';
        
        contentHtml = toolbar + achHtml;
    }
    
    // 寫入並留白給 FAB
    container.innerHTML = ui.layout.scroller(headerHtml, contentHtml + '<div style="height:80px;"></div>', 'task-scroll-area');

    // --- 2. [鎖定] 恢復捲軸位置 ---
    setTimeout(() => {
        const newFilterScroll = document.querySelector('#task-list .u-scroll-x');
        if (newFilterScroll && typeof window.TempState.mainListScrollX === 'number') {
            newFilterScroll.scrollLeft = window.TempState.mainListScrollX;
        }
    }, 0);

    // --- 3. [FAB 控制 - 你的核心邏輯] ---
    const fab = document.getElementById('global-fab');
    if(fab) {
        fab.style.display = 'flex'; // 只要渲染這頁，FAB 一定顯示
        
        // 使用 cloneNode 清除舊的 Event Listener
        const newFab = fab.cloneNode(true);
        fab.parentNode.replaceChild(newFab, fab);

        if (!isList) { 
            // --- 成就頁 FAB (金色) ---
            newFab.classList.add('fab-gold');
            newFab.innerHTML = '🏆';
            newFab.onclick = () => {
                // [修正] 直接呼叫渲染函式，它會自動開啟 universal 視窗
                // 不需要再呼叫 act.openModal('create-ach')，那是舊邏輯
                if(view.renderCreateAchForm) view.renderCreateAchForm(null);
            };
        } else { 
            // --- 任務頁 FAB (綠色) ---
            newFab.classList.remove('fab-gold');
            newFab.innerHTML = '+';
            newFab.onclick = () => {
                window.TempState.editingTask = null;
                // [修正] 直接呼叫渲染函式
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
            const icon = window.GlobalState.attrs?.[s.parent]?.icon || '❓';
            const style = active 
                ? 'border:1px solid var(--color-acc); background:#e0f2f1; color:var(--color-acc);' 
                : 'border:1px solid #ccc; opacity:0.6;';
            return `<button class="u-btn u-btn-sm" style="${style} margin-right:5px; margin-bottom:5px; border-radius:12px;"
                    onclick="view.toggleSkillSelect('${s.name}')">${icon} ${s.name}</button>`;
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
view.toggleSkillSelect = (skillName) => {
    if (window.TempState && window.TempState.editingTask) {
        const t = window.TempState.editingTask;
        if (!t.attrs) t.attrs = [];
        
        const idx = t.attrs.indexOf(skillName);
        if (idx > -1) t.attrs.splice(idx, 1);
        else t.attrs.push(skillName);
        
        view.renderCreateTaskForm(t.id);
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

view.renderCreateAchForm = (achId = null) => {
    // 1. 準備數據
    const achs = window.GlobalState.achievements || [];
    const ach = achId ? achs.find(a => a.id === achId) : null;
    const isEdit = !!achId;
    
    // 初始化暫存 (若切換不同成就或新增時重置)
    if (!window.TempState.editingAch || window.TempState.editingAch.id !== achId) {
        window.TempState.editingAch = ach ? JSON.parse(JSON.stringify(ach)) : {
            id: null, title: '', desc: '', type: 'manual', targetVal: 1, targetKey: '', 
            isSystem: false, reward: { gold: 0, exp: 0, freeGem: 0 }
        };
    }
    const data = window.TempState.editingAch;

    // [關鍵] 定義重新渲染指令：當下拉選單改變時，寫入 TempState 並立即重繪視窗
    // 這樣可以確保欄位動態顯示，且不會丟失已輸入的標題
    const renderCall = `view.renderCreateAchForm('${achId || ''}')`;

    // 2. Body HTML
    let bodyHtml = `
    <div class="input-group">
        <label class="section-title">成就名稱</label>
        <input type="text" class="inp" value="${data.title}" placeholder="例如: 存第一桶金" 
               oninput="window.TempState.editingAch.title = this.value">
    </div>
    
    <div class="input-group">
        <label class="section-title">描述</label>
        <textarea class="inp" style="height:60px" placeholder="描述達成條件..." 
                  oninput="window.TempState.editingAch.desc = this.value">${data.desc}</textarea>
    </div>

    <div class="box-gray">
        <label class="section-title">達成條件類型</label>
        <select class="inp" onchange="window.TempState.editingAch.type = this.value; ${renderCall}">
            <option value="manual" ${data.type==='manual'?'selected':''}>手動勾選 (一次性)</option>
            <option value="check_in" ${data.type==='check_in'?'selected':''}>每日簽到 (重複性)</option>
            <option value="custom" ${data.type==='custom'?'selected':''}>自定義計數</option>
            <option value="task_count" ${data.type==='task_count'?'selected':''}>任務次數監聽</option>
            <option value="attr_lv" ${data.type==='attr_lv'?'selected':''}>屬性等級監聽</option>
        </select>

        ${(data.type === 'custom' || data.type === 'task_count' || data.type === 'attr_lv') ? `
            <div style="margin-top:10px; display:flex; gap:10px; align-items:center;">
                <div style="flex:1;">
                    <label class="section-title">目標值</label>
                    <input type="text" inputmode="numeric" class="inp inp-num" value="${data.targetVal}" 
                           placeholder="${data.type==='attr_lv'?'目標等級':'次數'}"
                           onchange="window.TempState.editingAch.targetVal = parseInt(this.value)||1">
                </div>
                ${data.type !== 'custom' ? `
                <div style="flex:1;">
                    <label class="section-title">${data.type==='attr_lv'?'屬性名稱':'任務標籤'}</label>
                    <input type="text" class="inp" value="${data.targetKey}" 
                           placeholder="${data.type==='attr_lv'?'如: 力量':'如: 運動'}"
                           onchange="window.TempState.editingAch.targetKey = this.value">
                </div>` : ''}
            </div>
        ` : ''}
    </div>
    
    <div class="box-gray" style="border-left:4px solid gold;">
        <div class="section-title">🏆 完成獎勵</div>
        <div style="display:flex; gap:10px;">
            <div style="flex:1;">
                <label class="section-title">💰 金幣</label>
                <input type="text" inputmode="numeric" class="inp inp-num" value="${data.reward?.gold || 0}" 
                       onchange="if(!window.TempState.editingAch.reward) window.TempState.editingAch.reward={}; window.TempState.editingAch.reward.gold = parseInt(this.value)">
            </div>
            <div style="flex:1;">
                <label class="section-title">✨ 經驗</label>
                <input type="text" inputmode="numeric" class="inp inp-num" value="${data.reward?.exp || 0}" 
                       onchange="if(!window.TempState.editingAch.reward) window.TempState.editingAch.reward={}; window.TempState.editingAch.reward.exp = parseInt(this.value)">
            </div>
        </div>
    </div>
    `;

    // 3. Footer HTML
    let footHtml = `
        ${isEdit ? `<button class="u-btn u-btn-danger" onclick="act.deleteAchievement('${achId}')">刪除</button>` : ''}
        <button class="u-btn u-btn-primary" style="${isEdit?'':'width:100%'}" onclick="act.submitAchievement()">儲存</button>
    `;

    view.renderModal(isEdit ? '編輯成就' : '新增成就', bodyHtml, footHtml);
};

// =========================================================
// View 擴充 (Stats 頁面渲染)
// =========================================================
view.renderStats = () => { 
    let pageContainer = document.getElementById('stats-view-container');
    if (!pageContainer) {
        pageContainer = document.getElementById('page-stats');
        if(pageContainer) pageContainer.innerHTML = ''; 
    }
    if (!pageContainer) return;

    const gs = window.GlobalState; 
    if (!gs || !gs.attrs) { StatsEngine.init(); return; }

    const showCalMode = gs.settings && gs.settings.calMode;
    const currentTab = window.TempState.statsTab || 'attr'; 

    // --- Header ---
    let headerHtml = `
        <div class="stats-header-area">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <h3 style="margin:0; font-size:1.1rem; color:#3e2723; border-left:4px solid #ffb300; padding-left:8px;">
                    ${currentTab === 'attr' ? '屬性狀態' : '熱量監控'}
                </h3>
                <button class="u-btn u-btn-sm u-btn-paper" onclick="act.navigate('main')">↩ 返回</button>
            </div>
            <div class="dynamic-display-box">
    `;

    if (currentTab === 'attr' || !showCalMode) {
        headerHtml += `<canvas id="radar"></canvas>`;
    } else {
        const maxCal = (gs.settings && gs.settings.calMax) || 2000;
        const currentCal = gs.cal ? gs.cal.today : 0;
        const diff = maxCal - currentCal;
        const statusText = diff >= 0 ? `還能攝取 ${diff}` : `⚠️ 超標 ${Math.abs(diff)}`;
        const statusColor = diff >= 0 ? '#2e7d32' : '#d32f2f';

        headerHtml += `
            <div class="cal-dashboard-display">
                <div style="font-size:1rem; color:#8d6e63; margin-bottom:5px;">🔥 今日攝取總量</div>
                <div class="cal-hero-num">${currentCal} <span style="font-size:1.2rem;">kcal</span></div>
                <div class="cal-sub-info" style="color:${statusColor}; border:1px solid ${statusColor};">
                    目標 ${maxCal} / ${statusText}
                </div>
            </div>
        `;
    }
    headerHtml += `</div>`; 

    if (showCalMode) {
        headerHtml += ui.tabs.sliding('● 能力值', '● 熱量監控', currentTab === 'attr', "act.switchTab('attr')", "act.switchTab('cal')");
    }
    headerHtml += `</div>`; 

    // --- Body ---
    let contentHtml = '';

    if (currentTab === 'attr' || !showCalMode) {
        // A. 屬性 (透明極簡)
        let attrGridHtml = '<div class="attr-grid">';
        for (const [key, attr] of Object.entries(gs.attrs)) { 
            const max = attr.v * 100;
            const pct = Math.min(100, (attr.exp / max) * 100); 
            // [修正] 統一使用 ui.renderProgressBar
            attrGridHtml += `
            <div class="attr-minimal">
                <div class="attr-top-row">
                    <span>${attr.icon} ${attr.name} <span style="color:#aaa; font-weight:normal;">${key}</span></span>
                    <span class="attr-lv">Lv.${attr.v}</span>
                </div>
                ${ui.renderProgressBar(pct, `${attr.exp}/${max}`, '', 'height:6px; width:100%; border-radius:3px;')}
            </div>`;
        }
        attrGridHtml += '</div>';
        contentHtml += attrGridHtml;

        // B. 技能列表 (使用通用卡片 .std-card)
        contentHtml += `
            <div class="section-header">
                <h3>技能熟練度</h3>
                <button class="u-btn u-btn-sm u-btn-primary" onclick="act.openAddSkill()">+ 新增</button>
            </div>
            <div class="skill-list-area">`;
            
        if (!gs.skills || gs.skills.length === 0) { 
            contentHtml += '<div style="color:#888; font-size:0.9rem; text-align:center; padding:20px; font-style:italic;">( 尚未學習任何技能 )</div>'; 
        } else { 
            gs.skills.forEach(s => { 
                const pAttr = gs.attrs[s.parent]; 
                const max = s.lv * 10; 
                const pct = Math.min(100, (s.exp / max) * 100); 
                
                // [修正 1] 使用 .std-card 通用結構 (Grid Layout)
                contentHtml += `
                <div class="std-card" style="padding:10px; margin-bottom:8px; grid-template-columns: 32px 1fr auto;">
                    <div class="card-col-left" style="font-size:1.4rem; border:none; padding-right:0;">
                        ${pAttr ? pAttr.icon : '❓'}
                    </div>
                    
                    <div class="card-col-center">
                        <div class="card-info-row">
                            <div class="card-title" style="font-size:0.95rem;">${s.name}</div>
                            <div style="font-size:0.8rem; color:#00897b; font-weight:bold; margin-left:auto;">Lv.${s.lv}</div>
                        </div>
                        ${ui.renderProgressBar(pct, `${s.exp}/${max}`, '', 'height:10px; width:100%;')}
                    </div>
                    
                    <div class="card-col-right center-v">
                        <button class="btn-ghost-edit" onclick="act.editSkill('${s.name}')">⚙️</button>
                    </div>
                </div>`; 
            }); 
        } 
        contentHtml += '</div>';

    } else {
        // C. 熱量日誌
        const logsHtml = (gs.cal && gs.cal.logs && gs.cal.logs.length > 0)
            ? gs.cal.logs.map(logStr => {
                const match = logStr.match(/([+-]?\d+)$/);
                const val = match ? parseInt(match[1]) : 0;
                const cssClass = val >= 0 ? 'val-pos' : 'val-neg';
                const text = logStr.replace(/([+-]?\d+)$/, '');
                return `<tr class="cal-row"><td>${text}</td><td style="text-align:right;" class="${cssClass}">${val > 0 ? '+'+val : val}</td></tr>`;
            }).join('')
            : '<tr><td colspan="2" style="text-align:center; padding:30px; color:#aaa;">今日尚無紀錄 🍂</td></tr>';

        contentHtml += `<div style="padding: 10px;"><table class="cal-ledger-table"><thead><tr class="cal-header-row"><td style="border-top-left-radius:8px;">項目說明</td><td style="text-align:right; border-top-right-radius:8px;">卡路里</td></tr></thead><tbody>${logsHtml}</tbody></table></div>`;
    }

    pageContainer.innerHTML = ui.layout.scroller(headerHtml, contentHtml, 'stats-scroll-area');

    if (currentTab === 'attr' || !showCalMode) {
        setTimeout(() => {
            const cv = document.getElementById('radar');
            if(cv && window.Chart) { 
                try {
                    const dataValues = Object.values(gs.attrs).map(a => Number(a.v) || 1);
                    const config = { 
                        type: 'radar', 
                        data: { 
                            labels: Object.values(gs.attrs).map(a => a.name), 
                            datasets:[{ label: '能力', data: dataValues, backgroundColor: 'rgba(0,137,123,0.4)', borderColor: '#00897b', borderWidth: 2, pointRadius: 0 }] 
                        }, 
                        options: { 
                            animation: false, maintainAspectRatio: false, 
                            scales: { r: { min: 0, max: Math.max(10, ...dataValues) + 1, grid: { color: 'rgba(62, 39, 35, 0.1)' }, ticks: { display: false }, pointLabels: { font: { size: 14, weight:'bold' }, color: '#5d4037' } } }, 
                            plugins: { legend: { display: false } } 
                        } 
                    };
                    if (window.myChart) { window.myChart.destroy(); }
                    window.myChart = new Chart(cv, config); 
                } catch(e) {}
            } 
        }, 50);
    }
};

view.render = () => { 
    if (typeof window.GlobalState === 'undefined') return;
    ui.renderHUD(window.GlobalState);
    const currentMode = window.GlobalState?.settings?.mode || 'basic';
    ui.renderMain(currentMode);
    if(view.renderTasks) view.renderTasks(); 
    if(view.renderShop) view.renderShop(); 
    if(view.renderBag) view.renderBag();
    if(view.updateModeUI) view.updateModeUI();
    if(document.getElementById('page-history')?.classList.contains('active') && view.renderHistoryPage) view.renderHistoryPage();
    if(document.getElementById('page-milestone')?.classList.contains('active') && view.renderMilestonePage) view.renderMilestonePage();
    if(view.renderStats) view.renderStats(); 
    if(view.renderLobbyChar) view.renderLobbyChar();
};

// 補丁：讓 act.toast 運作
window.act = window.act || {};
window.act.toast = (msg) => ui.showToast(msg);
// 補丁：空殼
view.renderInteraction = (data) => {
    // data 格式: { title, desc, choices: [{text, action, value}], npc: '🧚' }
    const modal = document.getElementById('m-interaction');
    if (!modal) return;

    // 1. 設定文字
    const elTitle = document.getElementById('int-title');
    const elDesc = document.getElementById('int-desc');
    const elNpc = document.getElementById('int-npc-icon');
    
    if(elTitle) elTitle.innerText = data.title || '系統提示';
    if(elDesc) elDesc.innerHTML = data.desc || '...'; // 允許 HTML
    if(elNpc) elNpc.innerText = data.npc || '🧚';

    // 2. 處理選項 (這裡簡化處理，先讓它能跑)
    const btnAction = document.getElementById('int-btn-action');
    if(btnAction) {
        btnAction.innerText = (data.choices && data.choices[0] && data.choices[0].text) || '確定';
        btnAction.onclick = () => {
            if (data.choices && data.choices[0] && data.choices[0].action) {
                // 執行傳入的 callback
                const fn = new Function(data.choices[0].action); 
                fn();
            }
            act.closeModal('interaction');
        };
    }

    // 3. 顯示
    act.openModal('interaction');
};

// ==========================================
// [修復 2] 聰明的 FAB 全域控制器
// ==========================================
// 這會取代原本亂七八糟的 onclick
window.act = window.act || {};




view.hideFab = () => {
    const fab = document.getElementById('global-fab');
    if(fab) fab.style.display = 'none';
};

// 覆寫 renderShop 與 renderBag 來觸發隱藏
view.renderShop = () => {
    view.hideFab();
    // (這裡未來會放商店的渲染邏輯)
};

view.renderBag = () => {
    view.hideFab();
    // (這裡未來會放背包的渲染邏輯)
};

view.renderMain = (mode) => {
    ui.renderMain(mode);
    view.hideFab(); // 大廳如果要 FAB 可以改這裡，目前先隱藏
};

// 確保切換頁籤時會觸發渲染
window.act = window.act || {};
act.switchTaskTab = function(tab) {
    window.TempState = window.TempState || {};
    window.TempState.taskTab = tab;
    // 因為邏輯都在 renderTasks 裡，所以只要重新渲染，FAB 就會自動變更
    view.renderTasks(); 
};