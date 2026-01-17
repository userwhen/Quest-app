/* js/modules/stats300.js - V19.0 Stable (Ghost Killer & Crash Fix) */
window.act = window.act || {};

// =========================================================
// 1. 邏輯引擎 (StatsEngine)
// =========================================================
const StatsEngine = {
    init: () => {
        const gs = window.GlobalState;
        if (!gs) return;

        // 1. 定義標準白名單
        const defaults = {
            STR: { name: '力量', icon: '🏋️' },
            INT: { name: '智力', icon: '🧠' },
            AGI: { name: '敏捷', icon: '👟' },
            CHR: { name: '魅力', icon: '✨' },
            VIT: { name: '耐力', icon: '🛡️' },
            LUK: { name: '幸運', icon: '🍀' }
        };

        // 2. 資料結構修復 (外科手術式清除)
        if (!gs.attrs) gs.attrs = {};
        
        // A. 刪除幽靈資料 (不在白名單內的 Key 全部殺掉)
        const validKeys = Object.keys(defaults);
        Object.keys(gs.attrs).forEach(currentKey => {
            if (!validKeys.includes(currentKey)) {
                // 如果這是小寫的 key (str)，且大寫 (STR) 還沒資料，先搬過去再殺
                const upper = currentKey.toUpperCase();
                if (validKeys.includes(upper) && !gs.attrs[upper]) {
                    gs.attrs[upper] = gs.attrs[currentKey];
                }
                // 刪除不合規的 key (包含 DEX, LUC, str 等)
                delete gs.attrs[currentKey];
            }
        });

        // B. 補齊缺失資料 (保留等級，只補 ICON 和 Name)
        validKeys.forEach(k => {
            if (!gs.attrs[k]) {
                // 如果完全沒有該屬性，新建 Lv.1
                gs.attrs[k] = { ...defaults[k], v: 1, exp: 0 };
            } else {
                // 如果有屬性，補齊顯示資料
                gs.attrs[k].name = defaults[k].name;
                gs.attrs[k].icon = defaults[k].icon;
                // 確保數值存在
                if (typeof gs.attrs[k].v === 'undefined') gs.attrs[k].v = 1;
                if (typeof gs.attrs[k].exp === 'undefined') gs.attrs[k].exp = 0;
            }
        });

        // 3. 技能指向修復
        if (gs.skills) {
            gs.skills.forEach(s => {
                if (s.parent) s.parent = s.parent.toUpperCase();
                // 舊別名自動歸位
                if (s.parent === 'DEX') s.parent = 'AGI';
                if (s.parent === 'LUC') s.parent = 'LUK';
                // 防呆歸位
                if (!gs.attrs[s.parent]) s.parent = 'STR';
            });
        }

        // 4. 其他初始化
        if (!gs.archivedSkills) gs.archivedSkills = [];
        if (!gs.cal) gs.cal = { today: 0, logs: [] };
        if (typeof gs.lv === 'undefined') gs.lv = 1;
        if (typeof gs.exp === 'undefined') gs.exp = 0;
        
        // 5. 不強制存檔，避免寫入錯誤瞬間。
        // 等玩家操作後自然存檔即可。
    },

    // 經驗分配
    distributeExp: (totalExp, skillNames) => {
        const gs = window.GlobalState;
        if (!skillNames || skillNames.length === 0) return;
        
        const expPerAttr = Math.floor(totalExp / skillNames.length);
        
        skillNames.forEach(name => {
            let skill = gs.skills.find(s => s.name === name);
            let parentAttrKey = null;

            if (skill) {
                parentAttrKey = skill.parent;
            } else {
                const archived = gs.archivedSkills.find(s => s.name === name);
                if(archived) parentAttrKey = archived.parent;
            }

            if (parentAttrKey) parentAttrKey = parentAttrKey.toUpperCase();

            if (parentAttrKey && gs.attrs[parentAttrKey]) {
                const attr = gs.attrs[parentAttrKey];
                attr.exp += expPerAttr;
                
                const max = attr.v * 100;
                if (attr.exp >= max) {
                    attr.exp -= max;
                    attr.v++;
                    act.toast(`🎉 ${attr.name} 提升至 Lv.${attr.v}！`);
                }
            }
        });
    },

    // 技能熟練度
    addSkillProficiency: (skillName) => {
        const gs = window.GlobalState;
        const skillIndex = gs.skills.findIndex(s => s.name === skillName);
        
        if (skillIndex > -1) {
            const skill = gs.skills[skillIndex];
            skill.exp += 1;
            const max = skill.lv * 10; 
            
            if (skill.exp >= max) {
                skill.exp = 0;
                skill.lv++;
                act.toast(`💡 技能 [${skill.name}] Lv.${skill.lv}！`);
                if (skill.lv >= 10) {
                    StatsEngine.archiveSkill(skill, skillIndex);
                }
            }
        }
    },

    // 大師化
    archiveSkill: (skill, index) => {
        const gs = window.GlobalState;
        gs.skills.splice(index, 1);
        gs.archivedSkills.push(skill);
        act.alert(`🎉 恭喜！\n技能 [${skill.name}] 已大師化！`);
        
        const ach = gs.achievements ? gs.achievements.find(a => a.targetKey === skill.name) : null;
        if (ach && !ach.done) {
            ach.curr = ach.targetVal;
            ach.done = true; 
        }
        if (window.view && view.renderStats) view.renderStats();
    },

    // 經驗倒扣
    deductExp: (totalExp, skillNames) => {
        const gs = window.GlobalState;
        if (!skillNames || skillNames.length === 0) return;
        const expPerAttr = Math.floor(totalExp / skillNames.length);
        
        skillNames.forEach(name => {
            let skill = gs.skills.find(s => s.name === name) || gs.archivedSkills.find(s => s.name === name);
            if (skill && skill.parent) {
                const pKey = skill.parent.toUpperCase();
                if (gs.attrs[pKey]) {
                    const attr = gs.attrs[pKey];
                    attr.exp -= expPerAttr;
                    while (attr.exp < 0 && attr.v > 1) {
                        attr.v--;
                        attr.exp += (attr.v * 100); 
                    }
                    if (attr.v === 1 && attr.exp < 0) attr.exp = 0;
                }
            }
        });
    },

    checkLevelUp: () => {
        const gs = window.GlobalState;
        const max = gs.lv * 100;
        if (gs.exp >= max) {
            gs.exp -= max;
            gs.lv++;
            act.toast(`🆙 升級！Lv.${gs.lv}`);
            StatsEngine.checkLevelUp();
        }
    },

    handleExpLoss: (isStrict) => {
        const gs = window.GlobalState;
        if (isStrict) {
            while (gs.exp < 0 && gs.lv > 1) {
                gs.lv -= 1;
                gs.exp += (gs.lv * 100); 
                act.toast(`💔 降級至 Lv.${gs.lv}`);
            }
            if (gs.lv === 1 && gs.exp < 0) gs.exp = 0; 
        } else {
            if (gs.exp < 0) gs.exp = 0; 
        }
    },

    openAddSkill: () => {
        const limit = 10;
        if (window.GlobalState.skills.length >= limit) return act.toast(`技能已達上限 (${limit})`);
        window.TempState.editSkillId = null;
        StatsEngine.renderSkillModal('新增技能');
    },

    editSkill: (name) => {
        const s = window.GlobalState.skills.find(k => k.name === name);
        if(!s) return;
        window.TempState.editSkillId = name;
        StatsEngine.renderSkillModal('編輯技能', s);
    },

    renderSkillModal: (title, skill = null) => {
        const gs = window.GlobalState;
        const attrOptions = Object.keys(gs.attrs).map(k => 
            `<option value="${k}" ${skill && skill.parent && skill.parent.toUpperCase()===k ? 'selected' : ''}>${gs.attrs[k].name}</option>`
        ).join('');

        const bodyHtml = `
            <div class="input-group">
                <label class="section-title">技能名稱</label>
                <input type="text" id="skill-input-name" class="inp" value="${skill ? skill.name : ''}" placeholder="例如: 程式設計">
            </div>
            <div class="input-group">
                <label class="section-title">綁定屬性</label>
                <select id="skill-input-attr" class="inp">
                    ${attrOptions}
                </select>
            </div>
        `;

        let footHtml = '';
        if (skill) {
            footHtml = `
                <button class="u-btn u-btn-danger" onclick="act.deleteSkill()">刪除</button>
                <button class="u-btn u-btn-primary" onclick="act.submitNewSkill()">保存</button>
            `;
        } else {
            footHtml = `
                <button class="u-btn u-btn-primary" style="width:100%" onclick="act.submitNewSkill()">新增</button>
            `;
        }

        if(view.renderModal) view.renderModal(title, bodyHtml, footHtml);
    },

    submitNewSkill: () => {
        const elName = document.getElementById('skill-input-name');
        const elAttr = document.getElementById('skill-input-attr');
        if(!elName || !elAttr) return;

        const name = elName.value.trim();
        const attr = elAttr.value; 
        if(!name) return act.toast("請輸入名稱");
        
        const gs = window.GlobalState;
        const exists = gs.skills.find(s => s.name === name && s.name !== window.TempState.editSkillId);
        if(exists) return act.toast("名稱重複");
        
        if(window.TempState.editSkillId) {
            const skill = gs.skills.find(s => s.name === window.TempState.editSkillId);
            if(skill) {
                const oldName = skill.name;
                skill.name = name; 
                skill.parent = attr;
                
                const ach = gs.achievements ? gs.achievements.find(a => a.targetKey === oldName) : null;
                if(ach) { ach.targetKey = name; ach.title = `成為${name}大師!`; ach.desc = `將 ${name} 升至 Lv.10`; }
                
                gs.tasks.forEach(t => {
                    if(t.attrs && t.attrs.includes(oldName)) {
                        t.attrs = t.attrs.map(n => n === oldName ? name : n);
                    }
                });
            }
        } else {
            gs.skills.push({ name: name, parent: attr, lv: 1, exp: 0 });
            const achId = 'mst_' + Date.now();
            if(!gs.achievements) gs.achievements = [];
            gs.achievements.unshift({ 
                id: achId, title: `成為${name}大師!`, desc: `將 ${name} 升至 Lv.10`, 
                type: 'attr_lv', targetKey: name, targetVal: 10, 
                reward: { freeGem: 50, exp: 500 }, done: false, isSystem: true, curr: 1 
            });
            act.toast(`新增技能「${name}」`);
        }
        act.save(); 
        act.closeModal('overlay'); 
        if(window.view && view.renderStats) view.renderStats(); 
    },

    deleteSkill: () => {
        const name = window.TempState.editSkillId;
        if(!name) return;
        act.confirm(`確定刪除 [${name}]?`, (yes) => {
            if(yes) {
                window.GlobalState.skills = window.GlobalState.skills.filter(s => s.name !== name);
                window.GlobalState.tasks.forEach(t => {
                    if(t.attrs && t.attrs.includes(name)) t.attrs = t.attrs.filter(n => n !== name);
                });
                act.closeModal('overlay'); 
                act.save(); 
                if(window.view && view.renderStats) view.renderStats();
                act.toast("已刪除");
            }
        });
    }
};

// =========================================================
// 2. View 渲染
// =========================================================
view.renderStats = () => { 
    if (view.hideFab) view.hideFab();
    
    // [關鍵修正] 確保容器存在，如果不存在，不要嘗試渲染（避免崩潰）
    let pageContainer = document.getElementById('stats-view-container');
    if (!pageContainer) {
        pageContainer = document.getElementById('page-stats');
        if(pageContainer) {
            pageContainer.innerHTML = ''; 
        } else {
            // 如果連 page-stats 都找不到，代表 DOM 還沒準備好，直接返回避免報錯
            return;
        }
    }

    const gs = window.GlobalState; 
    // [關鍵修正] 這裡只執行 init，不要直接 return，讓後續代碼有機會執行
    if (!gs || !gs.attrs) { 
        StatsEngine.init(); 
    }
    
    // 二次檢查：如果 init 失敗，才停止
    if (!gs || !gs.attrs) return;

    const showCalMode = gs.settings && gs.settings.calMode;
    const currentTab = window.TempState.statsTab || 'attr'; 

    let headerHtml = `
        <div class="stats-header-area">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <h3 style="margin:0; font-size:1.1rem; color:#3e2723; border-left:4px solid #ffb300; padding-left:8px;">
                    ${currentTab === 'attr' ? '能力分析' : '熱量監控'}
                </h3>
                <button class="u-btn u-btn-sm u-btn-paper" onclick="act.navigate('main')">↩ 返回</button>
            </div>
            <div class="dynamic-display-box">
    `;

    if (currentTab === 'attr' || !showCalMode) {
        headerHtml += `<canvas id="radar" style="max-height:180px;"></canvas>`;
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
        headerHtml += ui.tabs.sliding('● 能力值', '● 熱量監控', currentTab === 'attr', "act.switchStatsTab('attr')", "act.switchStatsTab('cal')");
    }
    headerHtml += `</div>`; 

    let contentHtml = '';

    if (currentTab === 'attr' || !showCalMode) {
        let attrGridHtml = '<div class="attr-grid">';
        // [安全渲染] 確保 attr 存在才渲染，避免跳回大廳
        if(gs.attrs) {
            for (const [key, attr] of Object.entries(gs.attrs)) { 
                const max = attr.v * 100;
                const pct = Math.min(100, (attr.exp / max) * 100); 
                attrGridHtml += `
                <div class="attr-minimal">
                    <div class="attr-top-row">
                        <span>${attr.icon} ${attr.name} <span style="color:#aaa; font-weight:normal;">${key}</span></span>
                        <span class="attr-lv">Lv.${attr.v}</span>
                    </div>
                    ${ui.renderProgressBar(pct, `${attr.exp}/${max}`, '', 'height:6px; width:100%; border-radius:3px;')}
                </div>`;
            }
        }
        attrGridHtml += '</div>';
        contentHtml += attrGridHtml;

        contentHtml += `
            <div class="section-header">
                <h3>📜 修練中的技能</h3>
                <button class="u-btn u-btn-sm u-btn-primary" onclick="act.openAddSkill()">+ 新增</button>
            </div>
            <div class="skill-list-area">`;
            
        if (!gs.skills || gs.skills.length === 0) { 
            contentHtml += '<div style="color:#888; font-size:0.9rem; text-align:center; padding:20px; font-style:italic;">( 尚未學習任何技能，快去新增吧！ )</div>'; 
        } else { 
            gs.skills.forEach(s => { 
                const pAttrKey = s.parent ? s.parent.toUpperCase() : 'STR';
                // [安全檢查] 如果找不到屬性，預設回傳一個假物件避免報錯
                const pAttr = gs.attrs[pAttrKey] || {icon:'❓', name:'未知'}; 
                
                const max = s.lv * 10; 
                const pct = Math.min(100, (s.exp / max) * 100); 
                
                contentHtml += `
                <div class="std-card" style="padding:10px; margin-bottom:8px; grid-template-columns: 32px 1fr auto;">
                    <div class="card-col-left" style="font-size:1.4rem; border:none; padding-right:0;">
                        ${pAttr.icon}
                    </div>
                    <div class="card-col-center">
                        <div class="card-info-row">
                            <div class="card-title" style="font-size:0.95rem;">${s.name}</div>
                            <div style="font-size:0.8rem; color:#00897b; font-weight:bold; margin-left:auto;">Lv.${s.lv}</div>
                        </div>
                        ${ui.renderProgressBar(pct, `${s.exp}/${max}次`, '', 'height:10px; width:100%;')}
                    </div>
                    <div class="card-col-right center-v">
                        <button class="btn-ghost-edit" onclick="act.editSkill('${s.name}')">⚙️</button>
                    </div>
                </div>`; 
            }); 
        } 
        contentHtml += '</div>';

    } else {
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
            if(cv && window.Chart && gs.attrs) { 
                try {
                    const dataValues = Object.values(gs.attrs).map(a => Number(a.v) || 1);
                    const displayValues = dataValues.map(v => v);
                    const config = { 
                        type: 'radar', 
                        data: { 
                            labels: Object.values(gs.attrs).map(a => a.name), 
                            datasets:[{ label: '能力值', data: displayValues, backgroundColor: 'rgba(255, 179, 0, 0.4)', borderColor: '#ff6f00', borderWidth: 2, pointRadius: 1 }] 
                        }, 
                        options: { 
                            animation: false, maintainAspectRatio: false, 
                            scales: { r: { min: 0, max: Math.max(5, ...dataValues) + 2, grid: { color: 'rgba(62, 39, 35, 0.1)' }, ticks: { display: false }, pointLabels: { font: { size: 12, weight:'bold' }, color: '#5d4037' } } }, 
                            plugins: { legend: { display: false } } 
                        } 
                    };
                    if (window.myChart) { window.myChart.destroy(); }
                    window.myChart = new Chart(cv, config); 
                } catch(e) { console.error("Chart error", e); }
            } 
        }, 50);
    }
};

window.act.switchStatsTab = (tab) => {
    window.TempState.statsTab = tab;
    if (window.view && view.renderStats) view.renderStats();
};

Object.assign(window.act, {
    openAddSkill: StatsEngine.openAddSkill,
    editSkill: StatsEngine.editSkill,
    submitNewSkill: StatsEngine.submitNewSkill,
    deleteSkill: StatsEngine.deleteSkill
});

setTimeout(StatsEngine.init, 500);
window.StatsEngine = StatsEngine;