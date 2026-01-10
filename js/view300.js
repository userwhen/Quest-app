/* js/view300.js - V44.0 Fixed Layout Integration */

// =========================================================================
// [1. Asset 資源橋接器]
// =========================================================================
window.Asset = window.Asset || {
    resolve: (id, type) => {
        if (window.Assets && window.Assets.getAvatarPath) {
            const gender = (id.includes('f') || id === 'f') ? 'f' : 'm';
            return window.Assets.getAvatarPath('adventurer', gender, type);
        }
        return `img/${type}/${id}.png`; 
    },
    getImgTag: (src, fallback, cls, style) => {
        return `<img src="${src}" class="${cls}" style="${style}" alt="${fallback}">`;
    }
};

// =========================================================================
// [2. UI 元件工廠] (嚴格對應 style300.css)
// =========================================================================
const ui = {
    icon: (emoji) => `<span class="ui-icon">${emoji}</span>`,
    
    // --- 佈局系統 (修正：對應 CSS 的 ui-scroller 系列) ---
    layout: {
        // [核心] 奶蓋佈局：Header 固定，Body 滾動
        foam: (header, body, bodyId = "") => {
            return `
            <div class="ui-scroller-fixed">${header}</div>
            <div class="ui-scroller-body hide-scrollbar" id="${bodyId}">
                ${body}
            </div>`;
        },
        // 網格佈局 (商店/衣櫃)
        grid: (content) => `<div class="grid-container">${content}</div>`
    },

    // --- 標籤與按鈕 ---
    tabs: {
        chips: (items, active, onSelect, containerId = "") => {
            const html = items.map(item => {
                const isActive = item === active;
                return `<button class="u-chip ${isActive?'active':''}" onclick="${onSelect}('${item}')">${item}</button>`;
            }).join('');
            const idAttr = containerId ? `id="${containerId}"` : '';
            return `<div ${idAttr} class="scroll-row hide-scrollbar" style="cursor:grab;">${html}</div>`;
        }
    },

    btn: {
        primary: (t, act) => `<button class="u-btn u-btn-primary" onclick="${act}">${t}</button>`,
        secondary: (t, act) => `<button class="u-btn u-btn-secondary" onclick="${act}">${t}</button>`,
        ghost: (icon, act) => `<button class="u-btn u-btn-ghost" onclick="${act}">${icon}</button>`,
        danger: (t, act) => `<button class="u-btn u-btn-danger" onclick="${act}">${t}</button>`,
        sm: (t, act) => `<button class="u-btn u-btn-sm u-btn-primary" onclick="${act}">${t}</button>`
    },

    // --- 數值與進度 ---
    pill: {
        resource: (type, val) => {
            const iconMap = { 'gold': '💰', 'gem-free': '💎', 'gem-paid': '💎' };
            return `<div class="res-pill ${type}">${iconMap[type]||''} ${val}</div>`;
        }
    },

    progress: {
        text: (val, max, color = "var(--acc)", height = "18px") => {
            const pct = Math.min(100, Math.max(0, (val / (max||1)) * 100));
            return `<div class="u-progress-box" style="height:${height};"><div class="u-progress-text">${val} / ${max}</div><div class="u-progress-fill" style="width:${pct}%; background:${color};"></div></div>`;
        }
    },

    // --- 輸入元件 ---
    input: {
        std: (label, val, onchange, placeholder="") => {
            const id = `inp_${Math.random().toString(36).substr(2,9)}`;
            return `<div><label class="section-title">${label}</label><input id="${id}" class="inp" value="${val||''}" placeholder="${placeholder}" onchange="${onchange}"></div>`;
        },
        textarea: (label, val, onchange) => {
            const id = `txt_${Math.random().toString(36).substr(2,9)}`;
            return `<div><label class="section-title">${label}</label><textarea id="${id}" class="inp" style="min-height:60px" onchange="${onchange}">${val||''}</textarea></div>`;
        },
        numberUnit: (label, val, unit, onchange) => {
            const id = `num_${Math.random().toString(36).substr(2,9)}`;
            return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><label>${label}</label><input id="${id}" type="number" class="inp" style="width:80px;margin:0" value="${val}" onchange="${onchange}"><span>${unit}</span></div>`;
        },
        range: (label, val, min, max, onchange, valId) => {
             const rngId = `rng_${valId}_${Math.random().toString(36).substr(2, 5)}`;
             return `<div style="margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;"><span>${label}</span><b id="${valId}">${val}</b></div>
                <input id="${rngId}" style="width:100%" type="range" min="${min}" max="${max}" value="${val}" oninput="${onchange}; document.getElementById('${valId}').innerText=this.value;">
             </div>`;
        }
    },
    
    // --- 複合卡片 ---
    card: {
        task: (t, isHistory) => {
            let tags = '';
            if(t.importance >=3 && t.urgency >=3) tags += `<span class="u-chip active" style="padding:2px 8px;font-size:0.7rem;background:#ffebee;color:#d32f2f;">🔥 危機</span>`;
            else if(t.importance >=3) tags += `<span class="u-chip" style="padding:2px 8px;font-size:0.7rem;background:#e1f5fe;color:#0288d1;">💎 願景</span>`;
            
            let progressHtml = '';
            if (t.subs && t.subs.length > 0) {
                const doneCount = t.subs.filter(s => s.done).length;
                progressHtml = `<div style="margin-top:8px;">${ui.progress.text(doneCount, t.subs.length, 'var(--acc)', '14px')}</div>`;
            } else if (t.type === 'count') {
                progressHtml = `<div style="margin-top:8px;">${ui.progress.text(t.curr, t.target, '#4caf50', '14px')}</div>`;
            }

            const chk = `<div class="chk ${t.done?'visually-checked':''}" onclick="event.stopPropagation(); act.toggleTask('${t.id}')"></div>`;
            
            return `
            <div class="t-card ${t.done?'done':''}" onclick="act.toggleTaskDetail('${t.id}')">
                <div style="display:flex; align-items:center; gap:10px;">
                    ${!isHistory ? chk : ''}
                    <div style="font-weight:bold; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.title}</div>
                    <div style="display:flex;gap:5px;">${tags}</div>
                    ${!isHistory ? ui.btn.ghost('⚙️', `event.stopPropagation(); act.editTask('${t.id}')`) : ''}
                </div>
                ${progressHtml}
                <div id="task-detail-${t.id}" style="display:${window.TempState.expandedTaskId===t.id?'block':'none'}; margin-top:10px; padding-top:10px; border-top:1px dashed #ccc;">
                    <div style="color:#666;font-size:0.9rem;">${t.desc || '無詳細說明'}</div>
                    ${(t.subs||[]).map((s,i)=>`<div style="display:flex;gap:5px;margin-top:5px;align-items:center;"><input type="checkbox" ${s.done?'checked':''} onchange="act.toggleSubtask('${t.id}',${i})" onclick="event.stopPropagation()"><span>${s.text}</span></div>`).join('')}
                </div>
            </div>`;
        },
        
        item: (i, onClick) => {
            const imgTag = window.Asset ? window.Asset.getImgTag(`img/item/${i.id}.png`, '📦', '', 'width:40px') : '📦';
            return `<div class="s-item" onclick="${onClick}">
                <div style="font-size:2rem; margin-bottom:5px;">${imgTag}</div>
                <div style="font-size:0.8rem; height:2.4em; overflow:hidden;">${i.name}</div>
                <div style="color:var(--gold); font-weight:bold;">$${i.price}</div>
            </div>`;
        },

        stat: (a) => {
             return `<div class="t-card">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                    <strong>${a.icon} ${a.name}</strong><span style="color:#666">Lv.${a.v}</span>
                </div>
                ${ui.progress.text(a.exp, a.v * 100)}
             </div>`;
        }
    },

    // --- Avatar 生成器 ---
    avatar: {
        getHTML: (gender, wearing, scale = 1) => {
            const resolve = window.Asset.resolve;
            const g = gender === 'f' ? 'f' : 'm';
            
            const bodySrc = resolve(`body_${g}`, 'body');
            const outfitSrc = wearing.outfit ? resolve(wearing.outfit, 'outfit') : null;
            const accSrc = wearing.acc ? resolve(wearing.acc, 'acc') : null;

            const mkImg = (src, z) => window.Asset.getImgTag(src, '', '', `position:absolute; z-index:${z}; width:100%; bottom:0; left:0; pointer-events:none;`);

            let html = `<div class="avatar-body" style="transform:scale(${scale}); transform-origin:bottom center; position:relative; width:100px; height:200px; margin:0 auto; pointer-events:none;">`;
            html += mkImg(bodySrc, 10);
            if(outfitSrc) html += mkImg(outfitSrc, 20);
            if(accSrc) html += mkImg(accSrc, 30);
            html += `</div>`;
            return html;
        }
    },

    // --- 工具 Tool ---
    tools: {
        enableDragScroll: (id) => {
            const el = document.getElementById(id); if (!el) return;
            let isDown=false, startX, scrollLeft;
            el.addEventListener('mousedown',e=>{isDown=true;startX=e.pageX-el.offsetLeft;scrollLeft=el.scrollLeft; el.style.cursor='grabbing';});
            el.addEventListener('mouseleave',()=>{isDown=false; el.style.cursor='grab';});
            el.addEventListener('mouseup',()=>{isDown=false; el.style.cursor='grab';});
            el.addEventListener('mousemove',e=>{if(!isDown)return;e.preventDefault();const x=e.pageX-el.offsetLeft;const walk=(x-startX)*2;el.scrollLeft=scrollLeft-walk;});
        }
    },
    
    // --- Badge & Container (補全) ---
    badge: {
        skill: (name, active, icon, onclick) => {
            const style = active ? 'background:#e0f2f1; color:#00897b; border:1px solid #00897b;' : 'opacity:0.6; border:1px solid #ccc;';
            return `<span class="u-chip" style="${style} padding:2px 8px; font-size:0.8rem;" onclick="${onclick}">${icon} ${name}</span>`;
        },
        matrix: (imp, urg) => {
            if(imp >= 3 && urg >= 3) return '<span style="color:#d32f2f">🔥 危機</span>';
            if(imp >= 3) return '<span style="color:#0288d1">💎 願景</span>';
            if(urg >= 3) return '<span style="color:#ef6c00">⚡ 突發</span>';
            return '<span style="color:#757575">🍂 雜務</span>';
        },
        count: (c, t) => `<span style="background:#eee;padding:2px 6px;border-radius:10px;font-size:0.7rem;">${c}/${t}</span>`
    },
    container: {
        gray: (c, s="") => `<div class="box-gray" style="${s}">${c}</div>`,
        flexRow: (c, gap="8px") => `<div style="display:flex;align-items:center;gap:${gap}">${c}</div>`,
        section: (t, c) => `<div style="margin-bottom:15px"><div class="section-title">${t}</div>${c}</div>`,
        splitHeader: (t, b) => `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;"><span class="section-title" style="margin:0">${t}</span>${b}</div>`
    }
};

// =========================================================================
// [3. View 渲染核心]
// =========================================================================
window.TempState = window.TempState || { editingTask: null, viewHistoryMode: false, filterCategory: '全部', taskTab: 'list', expandedTaskId: null, shopCategory: '全部', previewWearing: null };
window.view = window.view || {};

const viewMethods = {
    // 主渲染入口
    render: () => {
        if (!window.GlobalState) return;
        view.renderHUD();
        
        const shells = ['page-lobby', 'page-task', 'page-shop', 'page-stats', 'page-story', 'page-avatar'];
        shells.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.classList.contains('active')) {
                if(id === 'page-lobby') view.renderLobby();
                if(id === 'page-task') view.renderTasks();
                if(id === 'page-shop') view.renderShop();
                if(id === 'page-stats') view.renderStats();
                // 覆蓋層
                if(id === 'page-story') view.renderStoryPage();
                if(id === 'page-avatar') view.renderWardrobe();
            }
        });
        
        // 特殊處理覆蓋層
        const story = document.getElementById('page-story');
        if(story && story.style.display !== 'none') view.renderStoryPage();
        const ward = document.getElementById('page-avatar');
        if(ward && ward.style.display !== 'none') view.renderWardrobe();
    },

    renderHUD: () => {
        const gs = window.GlobalState;
        const set = (id, v) => { const el=document.getElementById(id); if(el) el.innerText=v; };
        set('hud-name', gs.name); set('hud-lv', gs.lv);
        set('hud-gold', gs.gold); set('hud-gem-free', gs.freeGem); set('hud-gem-paid', gs.paidGem);
        
        const pct = Math.min(100, Math.max(0, (gs.exp / (gs.lv * 100)) * 100));
        const bar = document.getElementById('hud-exp-bar'); if(bar) bar.style.width = `${pct}%`;
        
        const avatarFrame = document.getElementById('hud-avatar');
        if(avatarFrame) {
            const rawHtml = ui.avatar.getHTML(gs.avatar.gender, gs.avatar.wearing, 1.2);
            avatarFrame.innerHTML = `<div style="margin-top:15px; margin-left:3px;">${rawHtml}</div>`;
        }
    },

    // --- [Shell 1] 大廳 ---
    renderLobby: () => {
        const container = document.getElementById('page-lobby'); if(!container) return;
        const gs = window.GlobalState;
        
        const charHtml = ui.avatar.getHTML(gs.avatar.gender, gs.avatar.wearing, 1.6);
        
        container.innerHTML = `
            <div class="main-scene">
                <div class="quick-icons">
                    <button class="icon-btn" onclick="act.openModal('bag')">🎒</button>
                    <button class="icon-btn" onclick="act.navigate('avatar')">👗</button>
                </div>
                
                <div class="char-stage" onclick="act.navigate('stats')" style="cursor:pointer;">
                    ${charHtml}
                </div>
                
                <div style="margin-bottom:30px;">
                    <button class="btn-story-entry" onclick="act.enterStoryMode()">🌀 進入劇情模式</button>
                </div>
            </div>
        `;
        
        const fab = document.getElementById('global-fab'); 
        if(fab) fab.style.display = 'flex';
    },

    // --- [Shell 2] 任務 (Milk Foam) ---
    renderTasks: () => {
        const container = document.getElementById('page-task'); if(!container) return;
        
        const isHistory = window.TempState.viewHistoryMode || false;
        const cats = ['全部', ...(window.GlobalState.taskCats || [])];
        const curCat = window.TempState.filterCategory || '全部';

        // Header
        const chipsHtml = ui.tabs.chips(cats, !isHistory ? curCat : '', 'view.updateEditCategory', 'task-cat-scroll');
        const histBtn = ui.btn.sm(isHistory ? '返回' : '歷史', 'act.toggleHistoryMode()');
        
        const headerHtml = `
            <div style="display:flex; gap:10px; align-items:center;">
                <div style="flex:1; overflow:hidden;">${chipsHtml}</div>
                ${histBtn}
            </div>`;

        // Body
        let tasks = (window.act && act.getSortedTasks) ? act.getSortedTasks(isHistory, curCat) : [];
        const bodyHtml = tasks.length > 0 
            ? `<div id="task-list">${tasks.map(t => ui.card.task(t, isHistory)).join('')}</div>`
            : `<div style="text-align:center; padding:40px; color:#888;">${isHistory ? '尚無紀錄' : '暫無任務'}</div>`;

        // Inject
        container.innerHTML = ui.layout.foam(headerHtml, bodyHtml, 'task-scroll-area');
        
        ui.tools.enableDragScroll('task-cat-scroll');
        const fab = document.getElementById('global-fab'); 
        if(fab) fab.style.display = 'flex';
    },

    // --- [Shell 3] 商店 ---
    renderShop: () => {
        const container = document.getElementById('page-shop'); if(!container) return;
        const cats = ['全部', '熱量', '時間', '其他'];
        const curCat = window.TempState.shopCategory || '全部';

        const headerHtml = `
            <div class="npc-area">
                <div class="npc-avatar">🧙‍♀️</div>
                <div class="npc-bubble">歡迎光臨！</div>
            </div>
            ${ui.tabs.chips(cats, curCat, "view.updateShopCategory", "shop-cat-scroll")}
        `;
        
        const items = (window.GlobalState.shop.npc||[]).filter(i => curCat==='全部'||i.category===curCat);
        const gridHtml = ui.layout.grid(items.map(i => ui.card.item(i, `act.buyShopItem('${i.id}')`)).join(''));

        container.innerHTML = ui.layout.foam(headerHtml, gridHtml, 'shop-scroll-area');
        ui.tools.enableDragScroll('shop-cat-scroll');
        const fab = document.getElementById('global-fab'); if(fab) fab.style.display = 'none';
    },

    // --- [Shell 4] 屬性 ---
    renderStats: () => {
        const container = document.getElementById('page-stats'); if(!container) return;
        const gs = window.GlobalState;

        const headerHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2 class="section-title" style="margin:0; font-size:1.2rem;">📊 屬性狀態</h2>
                ${ui.btn.ghost('↩', "act.navigate('lobby')")}
            </div>`;
            
        const bodyHtml = `
            <div style="padding:20px; text-align:center;">
                <canvas id="radar" style="max-width:300px; margin:0 auto;"></canvas>
            </div>
            <div id="attr-list">
                ${Object.values(gs.attrs).map(a => ui.card.stat(a)).join('')}
            </div>
            <div style="margin-top:20px;">
                <div class="section-title">🏆 成就勳章</div>
                <div class="grid-container">
                    ${gs.achievements.filter(a=>a.done).length===0 ? '<div style="color:#999">尚未獲得</div>' : ''}
                    ${gs.achievements.filter(a=>a.done).map(a=>`<div class="s-item" onclick="act.alert('${a.title}')">${a.icon}</div>`).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = ui.layout.foam(headerHtml, bodyHtml, 'stats-scroll-area');
        
        if(window.Chart) {
            const cv = document.getElementById('radar');
            if(cv) {
                const data = Object.values(gs.attrs).map(a => a.v);
                new Chart(cv, { type: 'radar', data: { labels: Object.values(gs.attrs).map(a => a.name), datasets: [{ label: '能力', data: data, backgroundColor: 'rgba(0, 137, 123, 0.2)', borderColor: '#00897b', borderWidth: 2, pointRadius: 0 }] }, options: { scales: { r: { suggestMin: 0, suggestedMax: 10, ticks: { display: false } } }, plugins: { legend: { display: false } }, animation: false } });
            }
        }
        const fab = document.getElementById('global-fab'); if(fab) fab.style.display = 'none';
    },

    // --- [Shell 5] 劇情 ---
    renderStoryPage: () => {
        const container = document.getElementById('page-story'); if(!container) return;
        const gs = window.GlobalState;

        const headerHtml = `
            <div class="story-header">
                <div class="story-energy-box">
                    ⚡ <span id="story-energy-val">${gs.story.energy}/${gs.story.maxEnergy}</span>
                    ${ui.btn.sm('+', "act.openModal('shop-energy')", "btn-add-energy")}
                </div>
                ${ui.btn.ghost('✕', 'act.back()', 'text-white')}
            </div>`;

        const currentText = (document.getElementById('story-text') && document.getElementById('story-text').innerHTML) 
                          ? document.getElementById('story-text').innerHTML : "...";

        const bodyHtml = `
            <div class="story-stage-area">
                <div class="story-dialog-container">
                    <div class="story-dialog-box">
                        <p id="story-text">${currentText}</p>
                        <div id="story-caret" style="display:none;">▼</div>
                    </div>
                </div>
                <div class="story-stage">
                    <div id="story-char-left" class="stage-char">
                        ${ui.avatar.getHTML(gs.avatar.gender, gs.avatar.wearing, 1.2)}
                    </div>
                    <div class="stage-spacer" style="flex:1"></div>
                    <div id="story-char-right" class="stage-char"></div>
                </div>
                <div class="story-actions"></div>
            </div>
        `;

        // 關鍵：使用 foam 生成基本結構，但要鎖定 body 捲動，由內部 story-dialog-box 負責
        container.innerHTML = ui.layout.foam(headerHtml, bodyHtml, 'story-layout');
        const bodyEl = document.getElementById('story-layout');
        if(bodyEl) bodyEl.style.overflow = 'hidden'; 
    },

    updateStoryActions: (actions) => {
        const area = document.querySelector('.story-actions'); if (!area) return;
        area.innerHTML = actions.map(b => b.disabled 
            ? `<button class="u-btn btn-story-opt" disabled style="opacity:0.5">${b.label}</button>` 
            : `<button class="u-btn btn-story-opt" onclick="${typeof b.onclick==='string'?b.onclick:''}">${b.label}</button>`
        ).join('');
        const buttons = area.querySelectorAll('button');
        buttons.forEach((el, i) => { if(!actions[i].disabled && typeof actions[i].onclick === 'function') el.onclick = actions[i].onclick; });
    },
    
    appendStoryText: (text, onComplete) => {
        const box = document.getElementById('story-text'); 
        const caret = document.getElementById('story-caret');
        if(!box) return;
        
        if (window.currentTypingTimer) { clearTimeout(window.currentTypingTimer); window.currentTypingTimer = null; }
        if(caret) caret.style.display = 'none';

        const rawText = text || ''; 
        const formattedText = rawText.replace(/\n/g, '<br>');

        if (formattedText.length < 2) {
             box.innerHTML += formattedText;
             if(caret) caret.style.display = 'block';
             if(onComplete) onComplete();
             return;
        }

        let i = 0; 
        function type() { 
            if (!document.getElementById('story-text')) return;
            if(i < formattedText.length) { 
                if (formattedText.substring(i, i+4) === '<br>') { box.innerHTML += '<br>'; i += 4; } 
                else { box.innerHTML += formattedText.charAt(i); i++; }
                // 自動捲動對話框
                const dialogBox = document.querySelector('.story-dialog-box');
                if(dialogBox) dialogBox.scrollTop = dialogBox.scrollHeight;
                window.currentTypingTimer = setTimeout(type, 20); 
            } else {
                window.currentTypingTimer = null; 
                if(caret) caret.style.display = 'block'; 
                if(onComplete) onComplete();
            }
        } 
        type();
    },

    // --- [Shell 6] 衣櫃 ---
    renderWardrobe: () => {
        const container = document.getElementById('page-avatar'); if(!container) return;
        
        const headerHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; color:#fff;">
                <h2>👗 更衣室</h2>
                ${ui.btn.ghost('✕', 'act.navigate('lobby')', 'text-white')}
            </div>`;

        const bodyHtml = `
            <div style="text-align:center; padding:20px; background:radial-gradient(circle, #444, #111);">
                <div id="avatar-preview-char">
                    ${ui.avatar.getHTML(window.GlobalState.avatar.gender, window.TempState.previewWearing||window.GlobalState.avatar.wearing, 1.4)}
                </div>
            </div>
            <div style="background:#fff; border-radius:20px 20px 0 0; padding:15px; color:#333; min-height:400px;">
                <div style="margin-bottom:10px; font-weight:bold;">我的衣櫃</div>
                ${ui.layout.grid((act.getWardrobeItems()||[]).map(i=>ui.card.item(i, `act.tryOn('${i.id}')`)).join(''))}
            </div>
        `;
        
        container.innerHTML = ui.layout.foam(headerHtml, bodyHtml, 'wardrobe-scroll-area');
    },

    // --- 彈窗渲染 ---
    renderCreateTaskForm: (taskId = null) => {
        const body = document.getElementById('m-create-body');
        if(!body) return;

        const savedScrollLeft = document.getElementById('create-cat-scroll')?.scrollLeft || 0;
        const gs = window.GlobalState;
        
        if (!window.TempState.editingTask || window.TempState.editingTask.id !== taskId) {
            const task = taskId ? gs.tasks.find(t=>t.id===taskId) : null;
            const defaultData = { title:'', desc:'', importance:2, urgency:2, difficulty:2, type:'normal', attrs:[], cat:'每日', deadline:'', target: 10, subs: [], subRule: 'all', pinned: false };
            window.TempState.editingTask = task ? JSON.parse(JSON.stringify(task)) : defaultData;
            window.TempState.editingTask.id = taskId;
        }
        const data = window.TempState.editingTask;

        let html = '';
        
        const pinBtn = ui.btn.ghost(`<span style="font-size:1.2rem; opacity:${data.pinned?1:0.3}">📌</span>`, "act.togglePin()");
        html += ui.container.flexRow(
            ui.input.std("任務名稱", data.title, "view.updateEditField('title', this.value)", "例如：喝水") + 
            `<div style="margin-top:18px">${pinBtn}</div>`
        );

        html += ui.input.textarea("詳細說明", data.desc, "view.updateEditField('desc', this.value)");

        const catChips = ui.tabs.chips(gs.taskCats||[], data.cat, "view.updateEditCategory", "create-cat-scroll");
        const addCatBtn = ui.btn.sm("+", "act.addNewCategory()");
        html += ui.container.section("分組標籤", ui.container.flexRow(catChips + `<div style="flex-shrink:0">${addCatBtn}</div>`));

        if (data.cat === '運動') {
            html += ui.input.numberUnit("🔥 消耗預計", data.burn, "kcal", "view.updateEditField('burn', this.value)");
        }
        
        const isCount = data.type === 'count';
        const typeControl = `
            <div style="display:flex; gap:10px; align-items:center; background:#f5f5f5; padding:8px; border-radius:10px;">
                <label><input type="radio" name="nt-type" value="normal" ${!isCount?'checked':''} onchange="view.updateEditField('type', 'normal')"> 一般</label>
                <label><input type="radio" name="nt-type" value="count" ${isCount?'checked':''} onchange="view.updateEditField('type', 'count')"> 計次</label>
                <input type="number" class="inp" style="width:60px;margin:0;text-align:center" value="${isCount?data.target:''}" ${!isCount?'disabled':''} placeholder="10" onchange="view.updateEditField('target', this.value)">
            </div>`;
        html += ui.container.gray(typeControl);

        if (!isCount) {
            const subRows = (data.subs || []).map((s, i) => 
                `<div style="display:flex; gap:5px; margin-bottom:5px;">
                    <input class="inp" style="margin:0" value="${s.text}" onchange="act.updateSubtaskText(${i}, this.value)" placeholder="步驟 ${i+1}">
                    <button class="btn-clean" style="color:red;" onclick="act.removeSubtask(${i})">✕</button>
                </div>`
            ).join('');
            html += ui.container.gray(
                ui.container.splitHeader("🔨 子任務", ui.btn.sm("+ 新增", "act.addSubtask()")) + subRows
            );
        }

        const skills = (gs.skills || []).map(s => ui.badge.skill(s.name, data.attrs.includes(s.name), '❓', `view.toggleSkillSelect('${s.name}')`)).join('');
        html += ui.container.section("📚 綁定技能", ui.container.gray(skills || '無技能', "display:flex;flex-wrap:wrap;gap:5px;"));

        const ranges = ui.input.range("重要", data.importance, 1, 4, "view.updateEditField('importance', this.value)", "val-imp") +
                       ui.input.range("緊急", data.urgency, 1, 4, "view.updateEditField('urgency', this.value)", "val-urg");
        html += ui.container.gray(
            `<div class="section-title" style="display:flex;justify-content:space-between;"><span>📊 價值評估</span><span id="matrix-tag-preview">${ui.badge.matrix(data.importance,data.urgency)}</span></div>` + ranges
        );

        const dlId = `inp_deadline_${Math.random().toString(36).substr(2, 5)}`;
        html += `<div><label class="section-title">📅 到期日</label><input id="${dlId}" type="datetime-local" class="inp" value="${data.deadline || ''}" onchange="view.updateEditField('deadline', this.value)"></div>`;

        body.innerHTML = html;

        const foot = document.getElementById('m-create-foot');
        if(foot) {
            foot.innerHTML = taskId 
                ? `${ui.btn.danger("刪除", `act.deleteTask('${taskId}')`)} ${ui.btn.secondary("複製", "act.copyTask()")} ${ui.btn.primary("保存", "act.submitTask()")}` 
                : ui.btn.primary("新增任務", "act.submitTask()");
        }

        const newCatScroll = document.getElementById('create-cat-scroll');
        if (newCatScroll) {
            newCatScroll.scrollLeft = savedScrollLeft;
            ui.tools.enableDragScroll('create-cat-scroll');
        }
    },

    updateEditField: (field, val) => {
        if(window.TempState.editingTask) {
            window.TempState.editingTask[field] = val;
            if(field==='importance'||field==='urgency') { view.renderCreateTaskForm(window.TempState.editingTask.id); return; }
            if(field==='type'||field==='cat') view.renderCreateTaskForm(window.TempState.editingTask.id);
        }
    },
    updateEditCategory: (c) => { view.updateEditField('cat', c); },
    updateShopCategory: (c) => { window.TempState.shopCategory = c; view.renderShop(); },
    toggleSkillSelect: (name) => {
        const t = window.TempState.editingTask;
        if(t.attrs.includes(name)) t.attrs = t.attrs.filter(x => x !== name);
        else { if(t.attrs.length >= 3) { act.toast("最多綁定3個"); return; } t.attrs.push(name); }
        view.renderCreateTaskForm(t.id);
    }
};

Object.assign(window.view, viewMethods);