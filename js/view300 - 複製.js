/* js/view300.js - V5.8.Data.Centralized */
window.view = window.view || {};

const view = {
    // [功能：介面渲染與輸出 - 主渲染器]
    render: () => { 
        if (typeof window.GlobalState === 'undefined') return;
        view.renderHUD(); view.renderTasks(); view.renderShop(); if(view.renderBag) view.renderBag();
        view.updateModeUI();
        if(document.getElementById('page-history').classList.contains('active')) view.renderHistoryPage();
        if(document.getElementById('page-milestone').classList.contains('active')) view.renderMilestonePage();
        view.renderStats(); 
        view.renderLobbyChar();
    },
    
    getCharImgTag: (className, style='') => {
        if (window.Assets) { return window.Assets.getCharImgTag(className, style); } 
        else { return `<span class="${className}" style="${style}">👤</span>`; }
    },

    // [功能：介面渲染與輸出 - HUD & Navigation]
    renderHUD: () => {
        const gs = window.GlobalState;
        document.querySelector('.hud-info .name').innerText = gs.name || 'Commander';
        document.getElementById('ui-gold').innerText = gs.gold; 
        document.getElementById('ui-lv').innerText = gs.lv;
        document.getElementById('ui-gem').innerText = gs.freeGem || 0;
        document.getElementById('ui-p-gem').innerText = gs.paidGem || 0;
        document.body.className = 'mode-' + gs.settings.mode;
        
        const max = gs.lv * 100;
        const expPct = Math.min(100, (gs.exp / max) * 100);
        const expBar = document.getElementById('ui-exp-bar'); if(expBar) expBar.style.width = expPct + '%';
        const expTxt = document.getElementById('ui-exp-text'); if(expTxt) expTxt.innerText = `${gs.exp}/${max}`;
        
        const btnStatsBack = document.getElementById('btn-stats-back');
        if(btnStatsBack) btnStatsBack.style.display = (gs.settings.mode === 'basic') ? 'none' : 'flex';

        const hudAvatar = document.getElementById('hud-avatar');
        if(hudAvatar) {
            hudAvatar.innerHTML = view.getCharImgTag('', 'width:100%;height:100%;object-fit:cover;object-position:top 15%;transform:scale(1.4);');
        }
        
        const char = document.querySelector('.char-container');
        if(char) char.onclick = () => { act.navigate('stats'); };
    },

    updateModeUI: () => {
        const mode = window.GlobalState.settings.mode;
        const icons = { task: mode === 'harem' ? '📜' : '📝', bag: mode === 'harem' ? '📦' : '🎒', avatar: mode === 'harem' ? '👘' : '👗', qa: mode === 'harem' ? '🏮' : '❓' };
        const setIcon = (id, icon) => { const el = document.getElementById(id); if(el) el.innerHTML = `<span class="u-icon">${icon}</span>`; };
        setIcon('btn-q-task', icons.task);
        setIcon('btn-q-bag', icons.bag); setIcon('btn-q-avatar', icons.avatar); setIcon('btn-q-qa', icons.qa);
    },

    // [功能：介面渲染與輸出 - 核心立繪渲染]
    renderAvatarStage: (containerId, wearingData, genderData) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const gs = window.GlobalState;
        const gender = genderData || gs.avatar?.gender || 'm';
        const wearing = wearingData || {}; 
        const baseImgPath = window.Assets ? window.Assets.getAvatarPath(gs.settings.mode, gender) : '';
        
        let layersHtml = '';
        layersHtml += `<img src="${baseImgPath}" class="av-layer layer-body">`;
        if (wearing.bottom) layersHtml += `<div class="av-layer layer-bottom" style="display:flex;justify-content:center;align-items:center;font-size:50px;">${wearing.bottom}</div>`;
        if (wearing.top) layersHtml += `<div class="av-layer layer-top" style="display:flex;justify-content:center;align-items:center;font-size:50px;">${wearing.top}</div>`;
        if (wearing.hair) {
            if (wearing.hair.includes('.')) layersHtml += `<img src="${wearing.hair}" class="av-layer layer-hair">`;
            else layersHtml += `<div class="av-layer layer-hair" style="display:flex;justify-content:center;align-items:flex-start;padding-top:10%;font-size:50px;">${wearing.hair}</div>`;
        }
        if (wearing.acc) layersHtml += `<div class="av-layer layer-acc" style="display:flex;justify-content:center;align-items:flex-start;padding-top:20%;font-size:40px;">${wearing.acc}</div>`;
        container.innerHTML = `<div class="avatar-stage-container">${layersHtml}</div>`;
    },

    renderLobbyChar: () => {
        const lobbyPlace = document.querySelector('#lobby-stage .char-placeholder');
        if (lobbyPlace) {
            lobbyPlace.id = 'lobby-avatar-target';
            view.renderAvatarStage('lobby-avatar-target', {}, window.GlobalState.avatar.gender);
        }
    },

    // [功能：介面渲染與輸出 - 任務/商店/其他]
    renderInteraction: (config) => {
        const m = document.getElementById('m-interaction');
        const npcIcon = document.getElementById('int-npc-icon'); const title = document.getElementById('int-title'); const desc = document.getElementById('int-desc'); const boxInput = document.getElementById('int-mode-input'); const boxSelect = document.getElementById('int-mode-select');
        const btn = document.getElementById('int-btn-action'); const inp = document.getElementById('int-inp-text');
        npcIcon.innerHTML = config.icon || '🧚'; title.innerText = config.title || '系統提示';
        desc.innerText = config.desc || '';
        if(config.btnText) { btn.style.display = 'block'; btn.innerText = config.btnText; } else { btn.style.display = 'none'; }
        boxInput.style.display = 'none'; boxSelect.style.display = 'none'; window.TempState.interactData = null;
        if (config.type === 'input') { boxInput.style.display = 'block'; inp.value = config.defValue || ''; inp.placeholder = config.placeholder || ''; inp.focus(); } 
        else if (config.type === 'select') { boxSelect.style.display = 'grid';
        boxSelect.innerHTML = ''; config.options.forEach((opt, idx) => { const div = document.createElement('div'); div.className = 'sel-card'; if (idx === 0) { div.classList.add('active'); window.TempState.interactData = opt.value; } div.innerHTML = `<div class="sel-icon">${opt.icon}</div><div class="sel-label">${opt.label}</div>`; div.onclick = () => { document.querySelectorAll('.sel-card').forEach(c => c.classList.remove('active')); div.classList.add('active'); window.TempState.interactData = opt.value; }; boxSelect.appendChild(div); }); }
        btn.onclick = () => { let result = null;
        if (config.type === 'input') result = inp.value; else result = window.TempState.interactData; if (result) { config.onConfirm(result); act.closeModal('interaction'); } else { act.alert("請完成選擇或輸入"); } };
        act.openModal('interaction');
    },

    renderQuick: () => {
        const list = document.getElementById('quick-list');
        if(!list) return; list.innerHTML = '';
        const d = new Date(); const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const tasks = window.GlobalState.tasks.filter(t => { const isToday = t.deadline && t.deadline.startsWith(todayStr); return (t.cat === '每日' || t.pinned || isToday) && !t.done; });
        if(tasks.length === 0) { list.innerHTML = '<div style="text-align:center;color:#888;margin-top:20px;">🎉 今日無待辦事項</div>'; return; }
        const defs = window.DIFFICULTY_DEFS || {};
        tasks.forEach(t => {
            const div = document.createElement('div'); const diffDef = defs[t.difficulty] || defs[2];
            div.className = 't-card'; div.style.padding = '12px'; div.style.borderLeft = `5px solid ${diffDef.color}`;
            div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:bold;font-size:1.1rem;">${t.pinned?'📌 ':''}${t.title}</span><div class="chk" onclick="this.classList.add('visually-checked'); act.toggleTask('${t.id}')"></div></div>`;
            list.appendChild(div);
        });
    },

    renderTasks: () => {
        const list = document.getElementById('task-list');
        list.innerHTML = '';
        if (window.TempState.taskTab === 'ach') { view.renderAchievements(list); return; }
        const cats = ['全部', ...window.GlobalState.cats];
        const catsRow = document.getElementById('task-cats-row');
        if(catsRow) { catsRow.innerHTML = cats.map(c => `<span class="tag-btn ${window.TempState.filterCategory===c?'active':''}" onclick="TempState.filterCategory='${c}';view.renderTasks()">${c}</span>`).join(''); }
        
        // [Refactored] Use logic getter
        const tasks = act.getSortedTasks();
        
        if (tasks.length === 0) { list.innerHTML = '<div style="text-align:center;color:#666;margin-top:20px">暫無任務</div>'; return; }
        
        const defs = window.DIFFICULTY_DEFS || {};
        tasks.forEach(t => {
            const div = document.createElement('div'); const diffDef = defs[t.difficulty] || defs[2];
            div.className = `t-card ${t.done ? 'done' : ''}`; div.style.borderLeft = `6px solid ${diffDef.color}`;
            let progressBar = '';
            if (t.subs && t.subs.length > 0) { const doneCount = t.subs.filter(s => s.done).length; const pct = Math.round((doneCount / t.subs.length) * 100); progressBar = `<div class="progress-track" style="position:relative; margin-top:8px; height:6px; background:#eee; border-radius:3px;"><div class="progress-fill" style="width:${pct}%; height:100%; background:${diffDef.color}; border-radius:3px;"></div></div>`; }
            let attrTags = '';
            if(t.attrs && t.attrs.length > 0) { attrTags = t.attrs.map(sn => { const sk = window.GlobalState.skills.find(s=>s.name===sn) || window.GlobalState.archivedSkills.find(s=>s.name===sn); const icon = sk ? (window.GlobalState.attrs[sk.parent]?.icon || '') : ''; return `<span class="tag-btn" style="font-size:0.8rem; background:#eee; padding:2px 6px; margin-left:5px;">${sn} <span class="u-icon">${icon}</span></span>`; }).join(''); }
            const subList = (t.subs && t.subs.length) ? `<div class="t-subs">` + t.subs.map((s,i) => `<div class="sub-row"><div class="chk-sm ${s.done?'checked':''}" onclick="event.stopPropagation();act.toggleSubtask('${t.id}',${i})"></div><span>${s.text}</span></div>`).join('') + `</div>` : '';
            const countDisplay = t.type === 'count' ? `<span style="font-size:0.9rem;color:#666;margin-left:5px;">(${t.curr}/${t.target})</span>` : '';
            div.innerHTML = `<div class="t-top"><div class="t-title-container" onclick="act.toggleTask('${t.id}')"><div class="chk ${t.done?'checked':''}"></div><div class="t-title">${t.pinned ? '📌 ' : ''}${t.title}${countDisplay}<div style="margin-top:4px; font-weight:normal; font-size:0.85rem; color:#666;">${diffDef.label} ${attrTags}</div></div></div>${t.isUser ? `<button class="btn-icon-flat" onclick="event.stopPropagation();act.editTask('${t.id}')">⚙️</button>` : ''}</div>${progressBar}${subList}`;
            list.appendChild(div);
        });
    },

    renderShop: () => {
        const list = document.getElementById('shop-list'); if(!list) return; list.innerHTML = '';
        const shopTabs = document.getElementById('shop-tabs');
        if(shopTabs) { const cats = ['全部', '熱量', '時間', '金錢', '其他']; shopTabs.innerHTML = cats.map(c => `<span class="tag-btn ${window.TempState.shopCategory===c?'active':''}" onclick="TempState.shopCategory='${c}';view.renderShop()">${c}</span>`).join(''); }
        
        // [Refactored] Use logic getter
        const items = act.getFilteredShopItems();

        items.forEach(i => {
            const div = document.createElement('div');
            div.className = `s-item ${i.qty<=0?'sold-out':''}`;
            const isNpc = i.id.startsWith('def_') || i.id.startsWith('sp_');
            const manageBtn = isNpc ? '' : `<button class="s-manage-btn" onclick="event.stopPropagation();act.editShopItem('${i.id}')">⚙️</button>`;
            let priceDisplay = `$${i.price}`;
            let priceColor = 'gold';
            if (i.currency === 'paid') { priceDisplay = `💳 ${i.price}`; priceColor = '#e91e63'; } 
            else if (i.currency === 'gem') { priceDisplay = `💎 ${i.price}`; priceColor = '#29b6f6'; }
            div.innerHTML = `${manageBtn}<div>${i.name}</div><div style="color:${priceColor}; font-weight:bold;">${priceDisplay}</div><span style="font-size:0.8rem;color:#888;">剩:${i.qty}</span>`;
            div.onclick = () => { if(window.act.buy) window.act.buy(i); };
            list.appendChild(div);
        });
    },

    renderBag: () => { const grid = document.getElementById('bag-grid'); if(!grid) return; grid.innerHTML = '';
        const counts = {}; window.GlobalState.bag.forEach(i => counts[i.name] = (counts[i.name]||0)+1); if(Object.keys(counts).length === 0) { grid.innerHTML = '<div style="width:200%;text-align:center;color:#888;">背包是空的</div>'; return; } Object.keys(counts).forEach(n => { const div = document.createElement('div'); div.className = 's-item'; div.innerHTML = `<div>${n}</div><div style="font-weight:bold;">x${counts[n]}</div>`; div.setAttribute('onclick', `act.openBagDetail('${n}')`); grid.appendChild(div); });
    },
    
    renderStats: () => { 
        const list = document.getElementById('attr-list');
        if (!list) return; list.innerHTML = ''; 
        const gs = window.GlobalState; 
        const tabs = document.getElementById('stats-tabs'); const calSec = document.getElementById('sec-cal');
        const attrSec = document.getElementById('sec-attr'); 
        if (gs.settings.calMode) { tabs.style.display = 'flex'; document.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); if (window.TempState.statsTab === 'cal') { document.getElementById('tb-cal').classList.add('active'); calSec.style.display = 'block'; attrSec.style.display = 'none'; } else { document.getElementById('tb-attr').classList.add('active'); calSec.style.display = 'none'; attrSec.style.display = 'block'; } } else { tabs.style.display = 'none'; calSec.style.display = 'none'; attrSec.style.display = 'block'; } 
        for (const [key, attr] of Object.entries(gs.attrs)) { const max = attr.v * 100;
        const pct = Math.min(100, (attr.exp / max) * 100); list.innerHTML += `<div class="attr-item"><div class="attr-row-top"><span><span class="u-icon">${attr.icon}</span> ${attr.name} <span style="font-size:0.8rem;color:#888;">Lv.${attr.v}</span></span></div><div class="bar-box"><div class="bar-fill" style="width:${pct}%"></div><div class="bar-text">${attr.exp}/${max}</div></div></div>`; } 
        document.getElementById('ui-cal-val').innerText = gs.cal.today; document.getElementById('ui-cal-max').innerText = gs.settings.calMax || 2000;
        document.getElementById('cal-logs').innerHTML = gs.cal.logs.map(l => `<div>${l}</div>`).join(''); 
        const skillList = document.getElementById('skill-list'); if(skillList) { skillList.innerHTML = '';
        if (gs.skills.length === 0) { skillList.innerHTML = '<div style="color:#888;font-size:0.9rem; text-align:center;">(暫無技能，請點擊新增)</div>'; } else { gs.skills.forEach(s => { const pAttr = gs.attrs[s.parent]; const max = s.lv * 100; const pct = Math.min(100, (s.exp / max) * 100); skillList.innerHTML += `<div class="skill-row"><div class="skill-top"><span><span class="u-icon">${pAttr?pAttr.icon:''}</span> ${s.name} <span style="font-size:0.8rem;color:#666;">Lv.${s.lv}</span></span><div><span class="skill-edit-btn" onclick="act.editSkill('${s.name}')">⚙️</span></div></div><div class="bar-box" style="height:12px;"><div class="bar-fill" style="width:${pct}%; background:#4db6ac;"></div><div class="bar-text" style="line-height:12px; font-size:0.7rem;">${s.exp}/${max}</div></div></div>`; }); } } 
        
        const cv = document.getElementById('radar');
        if(cv && window.Chart) { 
            const dataValues = Object.values(gs.attrs).map(a => Number(a.v) || 1);
            if (window.myChart) {
                window.myChart.data.datasets[0].data = dataValues;
                window.myChart.update('none'); 
            } else {
                window.myChart = new Chart(cv, { 
                    type: 'radar', 
                    data: { 
                        labels: Object.values(gs.attrs).map(a => a.name), 
                        datasets:[{ label: '能力值', data: dataValues, backgroundColor: 'rgba(0,137,123,0.2)', borderColor: '#00897b', borderWidth: 2, pointRadius: 3 }] 
                    }, 
                    options: { 
                        animation: false, maintainAspectRatio: false, 
                        scales: { r: { min: 0, max: 10, grid: { color: '#ccc' }, ticks: { display: false, maxTicksLimit: 5 }, pointLabels: { font: { size: 14 }, color: '#3e2723' } } }, 
                        plugins: { legend: { display: false } } 
                    } 
                });
            }
        } 
    },

    renderAchievements: (container) => { container.innerHTML = '';
        if (window.GlobalState.achievements.length === 0) { container.innerHTML = '<div style="text-align:center;color:#666;margin-top:20px">暫無成就</div>'; return; } 
        
        // [Refactored] Use logic getter
        const achs = act.getSortedAchievements();

        if (achs.length === 0) container.innerHTML = '<div style="text-align:center;color:#888;margin-top:20px;">所有成就已完成！請前往里程碑查看</div>'; achs.forEach(a => { const div = document.createElement('div'); div.className = 't-card ach'; div.style.flexDirection = 'row'; div.style.alignItems = 'center'; div.style.padding = '10px'; let progress = ''; if(a.type !== 'manual' && a.type !== 'check_in' && a.targetVal >= 1) { const curr = a.curr || 0; const pct = Math.min(100, Math.round((curr/a.targetVal)*100)); progress = `<div class="progress-track" style="height:14px; position:relative;"><div class="progress-fill" style="width:${pct}%;"></div><div class="progress-text">${curr}/${a.targetVal}</div></div>`; } else if (a.type === 'check_in') { progress = `<div style="font-weight:bold; color:orange; margin-top:5px;">🔥 連續簽到: ${a.curr||0} 天</div>`; } const desc = a.desc || ''; const left = `<div style="flex:3;"><div class="t-title">${a.title}</div><div style="font-size:0.8rem;color:#666;">${desc}</div>${progress}</div>`; let right = ''; if (a.type === 'check_in') { right = a.done ? `<button class="btn-ach-action" disabled>已簽</button>` : `<button class="btn-ach-action" onclick="act.doCheckIn('${a.id}')">簽到</button>`; } else if (a.type === 'custom') { right = a.curr >= a.targetVal ? `<button class="btn-ach-action claimed" onclick="act.claimAchievement('${a.id}')">✨ 達成</button>` : `<button class="btn-ach-action" onclick="act.incrementAch('${a.id}')">+1</button>`; } else if (a.type === 'manual') { right = `<button class="btn-ach-action claimed" onclick="act.claimAchievement('${a.id}')">完成</button>`; } else if (a.curr >= a.targetVal && !a.done) { right = `<button class="btn-ach-action claimed" onclick="act.claimAchievement('${a.id}')">✨ 達成</button>`; } else { right = `<span style="font-size:0.8rem; color:#aaa;">進行中</span>`; } const editBtn = `<button class="btn-icon-flat" style="margin-left:5px;" onclick="act.editAchievement('${a.id}')">⚙️</button>`;
        div.innerHTML = left + `<div style="flex:1.5; display:flex; justify-content:flex-end; align-items:center;">${right}${editBtn}</div>`; container.appendChild(div); });
    },
    renderMilestonePage: () => { const badgeArea = document.getElementById('milestone-corkboard'); const list = document.getElementById('milestone-list'); list.innerHTML = '';
        badgeArea.innerHTML = ''; const gs = window.GlobalState; if (gs.archivedSkills) { gs.archivedSkills.forEach(s => { const icon = gs.attrs[s.parent]?.icon || '🏆'; badgeArea.innerHTML += `<div class="badge-item" title="${s.name}"><span class="u-icon">${icon}</span></div>`; }); } const historyItems = []; if (gs.archivedSkills) { gs.archivedSkills.forEach(s => { let dateVal = (typeof s.retireDate === 'number') ? s.retireDate : new Date(s.retireDate).getTime(); if(isNaN(dateVal)) dateVal = 0; historyItems.push({ type: 'skill', date: dateVal, text: `${s.name} 大師`, sub: `累積經驗: ${s.exp}` }); }); } if (gs.achievements) { gs.achievements.filter(a => a.done && a.type !== 'check_in').forEach(a => { let dateVal = (typeof a.date === 'number') ? a.date : new Date(a.date).getTime(); if(isNaN(dateVal)) dateVal = 0; historyItems.push({ type: 'ach', date: dateVal, text: a.title, sub: a.desc }); }); } historyItems.sort((a,b) => b.date - a.date); if (historyItems.length === 0) { list.innerHTML = '<div style="text-align:center;color:#888;margin-top:20px;">尚未有榮譽紀錄</div>'; return; } historyItems.forEach(i => { const d = document.createElement('div'); d.className = 't-card'; d.style.opacity = '0.9'; let dateDisplay = i.date > 0 ? new Date(i.date).toLocaleDateString() : '未知時間'; d.innerHTML = `<div style="font-weight:bold;">${i.text}</div><div style="font-size:0.8rem;color:#666;">${dateDisplay} | ${i.sub}</div>`; list.appendChild(d); });
    },
    renderHistoryPage: () => { const list = document.getElementById('history-list'); list.innerHTML = ''; const gs = window.GlobalState;
        if (!gs.history || gs.history.length === 0) { list.innerHTML = '<div style="text-align:center;color:#888;margin-top:20px;">暫無紀錄</div>'; return; } const sorted = [...gs.history].sort((a,b) => { const tA = (typeof a.finishDate === 'number') ? a.finishDate : new Date(a.finishDate).getTime() || 0; const tB = (typeof b.finishDate === 'number') ? b.finishDate : new Date(b.finishDate).getTime() || 0; return tB - tA; });
        sorted.forEach(h => { const d = document.createElement('div'); d.className = 't-card'; if (h.status === 'failed') { d.classList.add('failed'); d.style.borderLeft = '5px solid #d32f2f'; } let dateStr = '未知'; try { const ts = (typeof h.finishDate === 'number') ? h.finishDate : new Date(h.finishDate).getTime(); if(ts) dateStr = new Date(ts).toLocaleDateString(); } catch(e){} const isFail = h.status === 'failed'; d.innerHTML = `<div>${h.title}</div><div style="font-size:0.8rem;color:${isFail?'#d32f2f':(h.done?'green':'#666')};font-weight:${isFail?'bold':'normal'};">${dateStr} ${isFail ? '❌ 失敗 (過期)' : ''}</div>`; list.appendChild(d); });
    },

    // --- [Avatar System View] ---
    renderWardrobeList: (items, previewState, unlockedList, currentWearing) => {
        const list = document.getElementById('wardrobe-list');
        if(!list) return; 
        list.innerHTML = '';

        items.forEach(item => {
            const isOwned = unlockedList.includes(item.id); 
            // 判斷按鈕狀態：正式存檔中是否已穿著
            const isOfficiallyWearing = currentWearing[item.type] === item.icon || currentWearing[item.type] === item.id;
            // 判斷卡片狀態：預覽中是否選中
            const isPreviewing = previewState[item.type] === item.icon || previewState[item.type] === item.id;
    
            const div = document.createElement('div'); 
            // [還原] 使用 av-card 類別
            div.className = `av-card ${isPreviewing ? 'previewing' : ''}`;
            
            // 點擊卡片 -> 觸發預覽
            div.onclick = () => act.previewItem(item);

            let btn = '';
            // [還原] 按鈕邏輯
            if (isOwned) {
                if (isOfficiallyWearing) {
                    btn = `<button class="av-btn wearing" disabled>穿戴中</button>`;
                } else {
                    btn = `<button class="av-btn wear" onclick="event.stopPropagation(); act.wearItem('${item.id}');">穿戴</button>`;
                }
            } else {
                // [還原] 購買按鈕樣式 (注意：這裡顯示 item.price，邏輯端扣 PaidGem)
                btn = `<button class="av-btn buy" style="background:#e91e63; color:#fff;" onclick="event.stopPropagation(); act.buyAvatarItem('${item.id}')">💳 ${item.price}</button>`;
            }
            
            // [還原] HTML 結構
            div.innerHTML = `<div class="av-icon">${item.icon}</div>${btn}`; 
            list.appendChild(div);
        });
    },

    updateWardrobeTabs: (activeTab) => {
        document.querySelectorAll('.av-tab').forEach(e => e.classList.remove('active'));
        // 映射 tab 名稱到索引 (還原原始邏輯)
        const map = {'hair':0,'top':1,'bottom':2,'acc':3}; 
        const btns = document.querySelectorAll('.av-tab'); 
        if(btns[map[activeTab]]) btns[map[activeTab]].classList.add('active'); 
    },

    // --- [Story System View] ---
    updateStoryView: (inEvent, storyData) => {
        const domStatus = document.getElementById('story-status-text');
        const domText = document.getElementById('story-text');
        const domNpc = document.getElementById('story-npc-char');
        const domPlayer = document.getElementById('story-player-char'); 
        const domCtrl = document.querySelector('.story-ctrl');
        const domStage = document.querySelector('.story-stage');

        if(domStatus) domStatus.innerText = `探索次數: ${storyData.exploreCount}`;

        if (domPlayer && view.getCharImgTag) {
            domPlayer.innerHTML = view.getCharImgTag('', 'height:280px; width:auto; filter:drop-shadow(0 0 5px rgba(255,255,255,0.5));');
            domPlayer.style.zIndex = "5"; 
        }

        if (!inEvent) {
            // [還原] 閒置狀態樣式
            if (domStage) { domStage.classList.add('idle'); domStage.classList.remove('event'); }
            
            // [還原] 探索按鈕 (您指出的缺失部分)
            if (domCtrl) domCtrl.innerHTML = `<button class="btn-explore-lg" onclick="act.exploreStory()">🔍 繼續探索</button>`;
            
            if (domNpc) domNpc.style.display = 'none';
            
            // [修改] 從 GameConfig 讀取，完全移除寫死的內容
            const defaultTexts = ["準備好迎接新的冒險了嗎？"];
            const idleTexts = (window.GameConfig && window.GameConfig.StoryIdleTexts) ? window.GameConfig.StoryIdleTexts : defaultTexts;
            const randomIdle = idleTexts[Math.floor(Math.random() * idleTexts.length)];
            
            // 只有當文字框為空或顯示特定狀態時才刷新文字 (避免覆蓋玩家剛看到的訊息)
            if (domText && (!domText.innerText || domText.innerText.includes("【") || domText.innerText.includes("離開") || domText.innerText === '...')) {
                domText.innerText = randomIdle;
            }
        } else {
            // [還原] 事件狀態樣式
            if (domStage) { domStage.classList.remove('idle'); domStage.classList.add('event'); }
        }
    },

    // [還原] 場景渲染 (對應 renderScene)
    renderStoryScene: (scene) => {
        const domNpc = document.getElementById('story-npc-char');
        const domCtrl = document.querySelector('.story-ctrl');

        // 文字部分交給 typeWriter 處理 (外部呼叫)

        // NPC 顯示
        if (domNpc) {
            domNpc.style.display = scene.npc ? 'block' : 'none';
            if(scene.npc) domNpc.innerText = scene.npc; // 這裡假設 Assets 處理在 Module 層或直接顯示文字
        }

        // 按鈕控制區
        if (domCtrl) {
            domCtrl.innerHTML = '';
            
            // 結束/離開按鈕
            if (scene.end) {
                const btn = document.createElement('button');
                btn.className = 'btn-explore-lg';
                btn.innerText = scene.reset ? "💀 重新輪迴" : "離開";
                btn.onclick = () => {
                    act.endEvent();
                    if (scene.reset && document.getElementById('story-text')) {
                        document.getElementById('story-text').innerText = "你已重生，一切重新開始...";
                    }
                };
                domCtrl.appendChild(btn);
                return;
            }

            // 選項按鈕
            if (scene.options) {
                const optContainer = document.createElement('div');
                optContainer.className = 'story-opt-row'; // [還原] 正確的 class 名稱
                
                scene.options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-std';
                    btn.innerText = opt.text;
                    btn.onclick = () => {
                        // 禁用所有按鈕
                        const allBtns = document.querySelectorAll('.story-opt-row button');
                        allBtns.forEach(b => b.disabled = true);
                        
                        // 執行邏輯
                        if (opt.check) act.handleCheck(opt.check.stat, opt.check.val, opt.pass, opt.fail); 
                        else if (opt.next) act.renderScene(opt.next); 
                    };
                    optContainer.appendChild(btn);
                });
                domCtrl.appendChild(optContainer);
            }
        }
    },

    // [還原] 打字機效果 (移至 View 層)
    typeWriter: (text) => {
        const el = document.getElementById('story-text');
        if (el) {
            el.innerText = text;
            el.style.opacity = 0;
            requestAnimationFrame(() => {
                el.style.transition = 'opacity 0.3s';
                el.style.opacity = 1;
            });
        }
    },
    
    appendStoryText: (text) => {
        const el = document.getElementById('story-text');
        if (el) el.innerText += text;
    },
};
window.view = view;