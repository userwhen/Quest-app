/* js/view300.js - V17.0 Integrated Fix */

// ==========================================
// [區域 1] UI 高級元件庫 (UI Library)
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
            const translate = isFirstActive ? '0%' : '100%';
            return `
            <div class="sliding-tabs-container">
                <div class="sliding-tabs">
                    <div class="sliding-pill" style="transform: translateX(${translate})"></div>
                    <button class="sliding-tab-btn ${isFirstActive ? 'active' : ''}" onclick="${click1}" style="color: ${isFirstActive ? '#000' : '#888'}">${label1}</button>
                    <button class="sliding-tab-btn ${!isFirstActive ? 'active' : ''}" onclick="${click2}" style="color: ${!isFirstActive ? '#000' : '#888'}">${label2}</button>
                </div>
            </div>`;
        },
        scrollX: (items, activeItem, onClickStr, onAddActionStr = null) => {
            let html = items.map(item => {
                const isActive = activeItem === item;
                const cls = isActive ? 'u-tag active' : 'u-tag';
                return `<button class="${cls}" onclick="${onClickStr}('${item}')">${item}</button>`;
            }).join('');
            if (onAddActionStr) {
                html += `<button class="btn-add-tag" onclick="${onAddActionStr}">+</button>`;
            }
            return `<div class="u-scroll-x">${html}</div>`;
        }
    },

    // 3. 卡片組件
    card: {
        task: (t, isHistory, isExpanded) => {
            let isLocked = false;
            if (t.type !== 'count' && !t.done && t.subs && t.subs.length > 0) {
                const doneCount = t.subs.filter(s => s.done).length;
                if ((t.subRule === 'all' && doneCount < t.subs.length) || (t.subRule === 'any' && doneCount === 0)) isLocked = true;
            }
            
            let tags = ui.badge.matrix(t.importance, t.urgency);
            
            if (t.attrs && t.attrs.length > 0) {
                const gs = window.GlobalState;
                const icons = t.attrs.map(tagName => {
                    let iconChar = '';
                    let titleText = tagName;
                    const tagUpper = tagName.toUpperCase();
                    
                    if (gs.attrs && gs.attrs[tagUpper]) {
                        iconChar = gs.attrs[tagUpper].icon;
                        titleText = gs.attrs[tagUpper].name;
                    } 
                    else if (gs.skills) {
                        const skill = gs.skills.find(s => s.name === tagName);
                        if (skill && skill.parent && gs.attrs[skill.parent.toUpperCase()]) {
                            const parentAttr = gs.attrs[skill.parent.toUpperCase()];
                            iconChar = parentAttr.icon;
                            titleText = parentAttr.name;
                        }
                    }

                    if (iconChar) {
                        return `<div class="u-pill gold" style="padding: 2px 6px; margin-left:4px;" title="${titleText}">${iconChar}</div>`;
                    }
                    return ''; 
                }).join('');
                tags += icons;
            }

            const pinHtml = t.pinned ? `<span class="pin-icon">📌</span>` : '';

            let progressHtml = '';
            let pct = 0; let text = '';
            if (t.type === 'count') {
                const current = t.curr || 0;
                const target = t.target || 1;
                pct = Math.min(100, Math.round((current / target) * 100));
                text = `${current}/${target}`;
            } else if (t.subs && t.subs.length > 0) {
                const done = t.subs.filter(s => s.done).length;
                pct = Math.round((done / t.subs.length) * 100);
                text = `${done}/${t.subs.length}`;
            }

            if (text) {
                progressHtml = `<div class="std-progress-bg"><div class="std-progress-fill" style="width:${pct}%;"></div><div class="progress-text-overlay">${text}</div></div>`;
            } else {
                progressHtml = `<div style="height:14px;"></div>`;
            }

            let statusClass = isHistory ? (t.status === 'success' ? 'status-daily' : 'status-imp') : (t.importance>=3 ? 'status-imp' : 'status-daily');
            let extraClass = isHistory ? 'history-mode' : '';

            let leftContent = '';
            if (isHistory) {
                leftContent = t.status === 'success' ? '✅' : '❌';
            } else {
                const clickAction = (t.type === 'count') ? `window.act.incrementTask('${t.id}')` : `window.act.toggleTask('${t.id}')`;
                leftContent = `<div class="${`chk ${t.done?'visually-checked':''} ${isLocked?'locked':''}`}" onclick="event.stopPropagation(); ${clickAction}"></div>`;
            }

            let rightContent = '';
            if (!isHistory) {
                rightContent = `<button class="btn-ghost-edit" onclick="event.stopPropagation(); window.act.editTask('${t.id}')">⚙️</button>`;
            } else {
                const d = new Date(t.finishDate);
                rightContent = `<div class="card-date-abs">${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}</div>`;
            }

            let expandHtml = '';
            if (isExpanded) {
                let subHtml = '';
                if (t.type !== 'count' && t.subs && t.subs.length > 0) {
                    subHtml = t.subs.map((s, i) => `
                        <div class="subtask-row" 
                             style="cursor:pointer; display:flex; align-items:center; padding:8px 0; border-bottom:1px dashed #eee;"
                             onclick="event.stopPropagation(); window.act.toggleSubtask(event, '${String(t.id)}', ${i});">
                            <div class="chk subtask-chk ${s.done?'visually-checked':''}" style="width:20px; height:20px; font-size:12px;"></div>
                            <span style="text-decoration:${s.done?'line-through':'none'}; color:${s.done?'#999':'#333'}; flex:1; margin-left:8px;">${s.text}</span>
                        </div>`
                    ).join('');
                }
                
                let descText = t.desc ? `<div style="color:#666; margin-bottom:8px; font-size:0.9rem;">${t.desc}</div>` : '';
                let dateBadge = '';
                if (t.deadline) {
                    const d = new Date(t.deadline);
                    dateBadge = `<div class="expand-date-badge">📅 ${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}</div>`;
                }

                expandHtml = `
                <div class="card-expand-content show" style="padding: 10px; background: #fafafa; border-radius: 8px; margin-top: 10px;">
                    ${descText}
                    ${dateBadge}
                    <div style="margin-top:5px;">${subHtml}</div>
                </div>`;
            }

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
                <div class="card-col-right center-v">${rightContent}</div>
                ${expandHtml}
            </div>`;
        },
        
        // [關鍵] 已更新為最終確認版樣式 (左Icon, 右上Edit, 水平SoldOut)
        item: (item, mode, onClick) => {
            const isShop = mode === 'shop';
            const catIcon = item.icon || '📦'; 
            
            let metaHtml = '';
            let soldOutOverlay = '';
            let clickAction = onClick;
            // 設為相對定位
            let cardStyle = 'position:relative; overflow:hidden; min-height: 80px; display:flex; flex-direction:column; justify-content:space-between; padding: 10px;'; 

            if (isShop) {
                const isPaid = item.currency === 'paid';
                const isGem = item.currency === 'gem';
                let priceDisplay = isPaid ? `💳💎 ${item.price}` : (isGem ? `💎 ${item.price}` : `💰 $${item.price}`);
                
                metaHtml = `
                    <div style="display:flex; justify-content:space-between; width:100%; font-size:0.85rem; color:#666; margin-top:5px; border-top:1px dashed #ccc; padding-top:5px;">
                        <span style="font-weight:bold; color:#3e2723;">${priceDisplay}</span>
                        <span>剩: ${item.qty}</span>
                    </div>`;

                if (item.qty <= 0) {
                    clickAction = ''; 
                    soldOutOverlay = `
                        <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.7); z-index:5; display:flex; align-items:center; justify-content:center; pointer-events:none;">
                            <div style="border:2px solid #d32f2f; color:#d32f2f; font-weight:bold; font-size:1rem; padding:2px 8px; background:rgba(255,255,255,0.9); border-radius:4px;">
                                SOLD OUT
                            </div>
                        </div>
                    `;
                }
            } else {
                const count = item.count || 1;
                metaHtml = `
                    <div style="display:flex; justify-content:flex-end; width:100%; font-size:0.85rem; color:#666; margin-top:5px; border-top:1px dashed #ccc; padding-top:5px;">
                        <span style="font-weight:bold;">擁有: ${count}</span>
                    </div>`;
            }

            return `
            <div class="item-card" onclick="${clickAction}" style="${cardStyle}">
                ${soldOutOverlay}
                
                <div class="item-name" style="font-size:1rem; font-weight:bold; display:flex; align-items:center; gap:5px; width:100%;">
                    <span style="font-size:1.2rem;">${catIcon}</span>
                    <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</span>
                </div>
                
                ${metaHtml}
            </div>`;
        },
    },

    // [New] 內部工具：自動 ID 生成器
    _uid: (prefix = 'id') => prefix + '-' + Math.random().toString(36).substr(2, 9),

    // 4. 輸入組件
    input: {
        text: (value, placeholder, onchange, id = null) => {
            const safeId = id || ui._uid('inp-txt');
            return `<input type="text" id="${safeId}" class="inp" value="${value||''}" placeholder="${placeholder}" onchange="${onchange}" aria-label="${placeholder}">`;
        },
        textarea: (value, placeholder, onchange, id = null) => {
            const safeId = id || ui._uid('inp-area');
            return `<textarea id="${safeId}" class="inp" style="height:80px;" placeholder="${placeholder}" onchange="${onchange}" aria-label="${placeholder}">${value||''}</textarea>`;
        },
        datetime: (value, onchange, id = null) => {
            const safeId = id || ui._uid('inp-date');
            return `<input type="datetime-local" id="${safeId}" class="inp" value="${value||''}" onchange="${onchange}" aria-label="Date Time">`;
        },
        number: (value, placeholder, onchange, digits = 4, id = null) => {
            const safeId = id || ui._uid('inp-num');
            const width = digits <= 2 ? '50px' : '80px';
            const validationScript = `let v = this.value.replace(/[^\\d]/g, ''); if (v.length > ${digits}) { v = v.slice(0, ${digits}); act.toast('最多只能輸入 ${digits} 位數哦！'); } this.value = v; ${onchange};`;
            return `<input type="text" id="${safeId}" inputmode="numeric" class="inp inp-num" style="width:${width};" value="${value||''}" placeholder="${placeholder}" oninput="${validationScript}" aria-label="${placeholder}">`;
        },
        select: (options, value, onchange, id = null) => {
            const safeId = id || ui._uid('inp-sel');
            const optsHtml = options.map(opt => {
                const val = (typeof opt === 'object') ? opt.value : opt;
                const label = (typeof opt === 'object') ? opt.label : opt;
                const selected = (val === value) ? 'selected' : '';
                return `<option value="${val}" ${selected}>${label}</option>`;
            }).join('');
            return `<select id="${safeId}" class="inp" onchange="${onchange}" aria-label="Select Option">${optsHtml}</select>`;
        }
    },

    // 5. 按鈕組件
    btn: {
        primary: (text, onclick, cls='', id='') => `<button ${id?`id="${id}"`:''} class="u-btn u-btn-primary ${cls}" onclick="${onclick}">${text}</button>`,
        secondary: (text, onclick, cls='', id='') => `<button ${id?`id="${id}"`:''} class="u-btn u-btn-secondary ${cls}" onclick="${onclick}">${text}</button>`,
        danger: (text, onclick, cls='', id='') => `<button ${id?`id="${id}"`:''} class="u-btn u-btn-danger ${cls}" onclick="${onclick}">${text}</button>`,
        ghost: (html, onclick, cls='', id='') => `<button ${id?`id="${id}"`:''} class="u-btn u-btn-ghost ${cls}" onclick="${onclick}">${html}</button>`,
        sm: (text, onclick, cls='', id='') => `<button ${id?`id="${id}"`:''} class="u-btn u-btn-sm ${cls}" onclick="${onclick}">${text}</button>`
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

    // 7. 通用小元件
    renderProgressBar: (pct, text, id, style="width:80px; height:8px;") => 
        `<div class="u-progress" style="${style}"><div class="u-progress-fill" id="${id}" style="width: ${pct}%"></div><span class="u-progress-text">${text}</span></div>`,
    renderPill: (icon, value, colorClass, id) => 
        `<div class="u-pill ${colorClass}"><span class="u-icon">${icon}</span><span id="${id}">${value}</span></div>`,
    renderAvatar: (id, onClick, content) => 
        `<div class="u-avatar" id="${id}" onclick="${onClick}">${content}</div>`,
    renderIconBtn: (icon, onClick, label) => 
        `<button class="u-btn-icon" onclick="event.stopPropagation(); ${onClick}" aria-label="${label}">${icon}</button>`,
    renderSquareBtn: (icon, onClick, id = '', isActive = false) => 
        `<button class="u-icon-btn ${isActive ? 'active' : ''}" ${id ? `id="${id}"` : ''} onclick="event.stopPropagation(); ${onClick}">${icon}</button>`,
    renderActionBtn: (text, onClick, id = '', colorClass = 'btn-story') => 
        `<button class="${colorClass}" ${id ? `id="${id}"` : ''} onclick="${onClick}">${text}</button>`,
    renderCharStage: (onClick, content) => 
        `<div class="char-stage" id="lobby-stage"><div class="char-container" onclick="${onClick}">${content}</div></div>`,

    // 8. 頁面組裝邏輯
    getHUDHtml: function(data) {
        let avatarContent = '🧑‍🚀'; 
        if (window.Assets && window.Assets.getCharImgTag) {
             avatarContent = window.Assets.getCharImgTag('hud-avatar-img', 'width:100%; height:100%; object-fit:cover;');
        }

        const lv = data.lv || 1;
        const maxExp = lv * 100;
        const currExp = data.exp || 0;
        const pct = Math.min(100, Math.max(0, (currExp / maxExp) * 100));
        const name = data.name || 'Commander';

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
                    ${this.renderIconBtn('≡', "view.renderSettings()", '設定')}
                </div>
            </div>`;
    },
    
    stage: {
        npc: (imgContent, text) => `
            <div class="npc-stage-container">
                <div class="npc-avatar-box">${imgContent}</div>
                <div class="npc-dialogue-box">
                    <div class="npc-text">${text}</div>
                </div>
            </div>`
    },
    
    // 渲染 HUD 執行入口
    renderHUD: function(data) {
        const hudContainer = document.getElementById('hud');
        if (hudContainer) hudContainer.innerHTML = this.getHUDHtml(data || window.GlobalState || {});
    },
    
    // 渲染 Main 執行入口
    renderMain: function(mode) {
		// [關鍵修復] 確保回到大廳時隱藏 FAB
        view.hideFab();
        const container = document.getElementById('page-main');
        if(!container) return;

        const isBasic = window.GlobalState && window.GlobalState.settings && window.GlobalState.settings.mode === 'basic';
        
        let charHtml = '<div class="char-placeholder">🦸</div>';
        if (window.Assets && window.Assets.getCharImgTag) {
            charHtml = window.Assets.getCharImgTag('main-char-img');
        }

        const buttons = [
            { icon: '📜', action: "act.openModal('quick')", id: 'btn-q-task', show: true },
            // [關鍵修正] 直接呼叫 renderBag，避開 act.openModal 覆蓋問題
            { icon: '🎒', action: "if(view.renderBag) view.renderBag()", id: 'btn-q-bag', show: true },
            { icon: '👗', action: "act.navigate('avatar')", id: 'btn-q-avatar', show: !isBasic },
            { icon: '❓', action: "act.showQA()", id: 'btn-q-qa', show: !isBasic }
        ];

        const btnsHtml = buttons
            .filter(b => b.show)
            .map(b => ui.renderSquareBtn(b.icon, b.action, b.id))
            .join('');

        container.innerHTML = `
            <div id="quick-icons-normal" class="quick-area-normal">
                ${btnsHtml}
            </div>

            <div class="char-stage" onclick="act.navigate('stats')">
                ${charHtml}
            </div>

            ${!isBasic ? `<button class="btn-story-mode" onclick="act.enterStoryMode()">🌀 劇情模式</button>` : ''}
        `;
    },
    showToast: function(msg) {
        const old = document.querySelector('.u-toast'); if(old) old.remove();
        const div = document.createElement('div');
        div.innerHTML = `<div class="u-toast show">${msg}</div>`;
        document.body.appendChild(div.firstElementChild);
        setTimeout(() => { const t = document.querySelector('.u-toast'); if(t) t.remove(); }, 3000);
    }
};

window.ui = ui;
window.UI = ui; 

// ==========================================
// [區域 2] 橋接邏輯 (Bridge Logic)
// ==========================================
window.view = window.view || {};
window.act = window.act || {};

view.renderHUD = (data) => ui.renderHUD(data);
view.renderMain = (mode) => ui.renderMain(mode);
act.toast = (msg) => ui.showToast(msg);

view.hideFab = () => {
    const fab = document.getElementById('global-fab');
    if(fab) fab.style.display = 'none';
};

view.renderSystemModal = (type, msg, defVal) => {
    // 1. 準備內容
    const titleText = type === 'confirm' ? '確認操作' : (type === 'prompt' ? '請輸入' : '系統提示');
    
    let bodyContent = `<div style="padding:20px 10px; font-weight:bold; text-align:center;">${msg.replace(/\n/g, '<br>')}</div>`;
    
    // 如果是 Prompt，加入輸入框
    if (type === 'prompt') {
        bodyContent += `<input type="text" id="sys-univ-input" class="inp" value="${defVal||''}" style="text-align:center; margin-top:10px;">`;
    }

    // 2. 準備按鈕
    let footHtml = '';
    if (type === 'alert') {
        footHtml = `<button class="u-btn u-btn-primary" onclick="act.handleSysConfirm(true)">好</button>`;
    } else {
        footHtml = `
            <button class="u-btn u-btn-secondary" onclick="act.handleSysConfirm(false)">取消</button>
            <button class="u-btn u-btn-primary" onclick="act.handleSysConfirm(type==='prompt'?'prompt_submit':true)">確定</button>
        `;
    }

    // 3. 呼叫工廠 (指定 layer 為 'system')
    // 這會自動建立 id="m-system" z-index="9999"
    view.renderModal(titleText, bodyContent, footHtml, 'system');

    // 4. 聚焦輸入框 (如果是 Prompt)
    if (type === 'prompt') {
        setTimeout(() => {
            const el = document.getElementById('sys-univ-input');
            if(el) el.focus();
        }, 100);
    }
};

// V17.5 全動態視窗工廠 (The Window Factory)
view.renderModal = (title, bodyHtml, footHtml, layer = 'overlay') => {
    // 1. 定義層級配置
    const layers = {
        'panel':   { id: 'm-panel',   zIndex: 9000 }, // Layer 1: 底層面板 (背包、設定)
        'overlay': { id: 'm-overlay', zIndex: 9500 }, // Layer 2: 通用疊加 (詳情、購買)
        'system':  { id: 'm-system',  zIndex: 9999 }  // Layer 3: 系統層 (Alert)
    };

    const config = layers[layer] || layers['overlay']; // 預設為 overlay
    const targetId = config.id;

    // 2. DOM 檢查與建立 (Factory Logic)
    let modal = document.getElementById(targetId);
    
    // 如果 DOM 不存在，或者結構不完整 (防呆)，則建立它
    if (!modal || !modal.querySelector('.modal')) {
        if (modal) modal.remove(); // 清除殘骸
        
        modal = document.createElement('div');
        modal.id = targetId;
        modal.className = 'mask';
        modal.style.zIndex = config.zIndex;
        
        // 建立基本骨架
        modal.innerHTML = `
            <div class="modal">
                <div class="m-head">
                    <span class="m-title"></span>
                    <button class="btn-close-red">✕</button>
                </div>
                <div class="m-body"></div>
                <div class="m-foot"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 綁定關閉按鈕 (動態綁定 ID)
        const closeBtn = modal.querySelector('.btn-close-red');
        closeBtn.onclick = () => window.act.closeModal(targetId);
    }

    // 3. 注入內容 (Injection)
    const titleEl = modal.querySelector('.m-title');
    const bodyEl = modal.querySelector('.m-body');
    const footEl = modal.querySelector('.m-foot');

    if (titleEl) titleEl.innerText = title;
    if (bodyEl) bodyEl.innerHTML = bodyHtml;
    
    if (footHtml) {
        footEl.style.display = 'flex';
        footEl.innerHTML = footHtml;
    } else {
        footEl.style.display = 'none';
    }

    // 4. 顯示視窗
    // 這裡我們直接操作 DOM 顯示，確保不依賴 core300.js 的 act.openModal 舊邏輯
    modal.style.display = 'flex';
    // 稍微延遲加 active class 以觸發 CSS transition (如果有寫的話)
    requestAnimationFrame(() => modal.classList.add('active'));
};

view.renderInteraction = (data) => {
    const modal = document.getElementById('m-interaction');
    if (!modal) return;
    act.openModal('interaction');
};

// 注意：不在此處定義空的 renderBag/renderShop，以免覆蓋 shop300.js 的實作
// view.renderShop = () => {}; 
// view.renderBag = () => {};

act.switchTaskTab = function(tab) {
    window.TempState = window.TempState || {};
    window.TempState.taskTab = tab;
    if(view.renderTasks) view.renderTasks(); 
};

view.renderQuick = () => {
    const tasks = TaskEngine.getDailyTasks(); // 假設這是原本就有的邏輯
    // 如果您原本是用 filter 篩選今日任務，請照舊使用

    let listHtml = '';
    if (tasks.length === 0) {
        listHtml = `<div style="text-align:center; color:#999; padding:20px;">🎉 今日任務已全部完成！</div>`;
    } else {
        // 使用 ui.card.task 生成卡片，但隱藏編輯按鈕以簡化畫面
        listHtml = tasks.map(t => ui.card.task(t, false, false)).join('');
    }

    const bodyHtml = `
        <div style="padding:10px;">
            ${listHtml}
        </div>
    `;

    // Quick 是 Layer 1 (Panel)，類似背包
    view.renderModal('📋 任務快覽', bodyHtml, null, 'panel');
};

// ==========================================
// [區域 3] 全域渲染入口 (Master Render Loop)
// ==========================================
view.render = () => { 
    if (typeof window.GlobalState === 'undefined') return;
    
    // 1. 常駐介面 (HUD)
    ui.renderHUD(window.GlobalState);
    
    // 閃爍修復：只有當前在大廳時，才重繪大廳
    const activePage = document.querySelector('.page.active');
    
    if (activePage && activePage.id === 'page-main') {
        const currentMode = window.GlobalState?.settings?.mode || 'basic';
        ui.renderMain(currentMode);
    }
    
    // 2. 預設隱藏 FAB
    view.hideFab();

    // 3. 判斷當前頁面並渲染
    if (!activePage) return;
    const pid = activePage.id;

    if (pid === 'page-task' && view.renderTasks) {
        view.renderTasks(); 
    } 
    else if (pid === 'page-stats' && view.renderStats) {
        view.renderStats();
    }
    else if (pid === 'page-shop' && view.renderShop) {
        view.renderShop();
    }
    // 注意：背包現在是 Modal，不屬於 page-bag，所以不需要在這裡 render
    // 但如果使用者仍在舊的 page-bag 結構中，則保留兼容
    else if (pid === 'page-bag' && view.renderBag) {
        view.renderBag();
    }
    else if (pid === 'page-history' && view.renderHistoryPage) {
        view.renderHistoryPage();
    }
    else if (pid === 'page-milestone' && view.renderMilestonePage) {
        view.renderMilestonePage();
    }
    else if (pid === 'page-avatar' && view.renderAvatar) {
        view.renderAvatar();
    }
    
    if(view.renderLobbyChar && pid === 'page-main') view.renderLobbyChar();
};