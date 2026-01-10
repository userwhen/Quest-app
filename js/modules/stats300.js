/* js/modules/stats300.js - V14.0 Stats */
window.act = window.act || {};

const StatsEngine = {
    distributeExp: (amount, skillNames) => {
        const gs = window.GlobalState;
        if (!skillNames || skillNames.length === 0) return;
        const perSkill = Math.floor(amount / skillNames.length);
        skillNames.forEach(name => {
            const skill = gs.skills.find(s => s.name === name);
            if (skill && gs.attrs[skill.parent]) {
                const attr = gs.attrs[skill.parent];
                attr.exp += perSkill;
                if (attr.exp >= attr.v * 100) {
                    attr.exp -= attr.v * 100; attr.v++;
                    act.toast(`💪 [${attr.name}] Lv.${attr.v}`);
                    gs.freeGem += 5;
                }
            }
        });
    },
    deductExp: (amount, skillNames) => {
        const gs = window.GlobalState;
        if (!skillNames || skillNames.length === 0) return;
        const perSkill = Math.floor(amount / skillNames.length);
        skillNames.forEach(name => {
            const skill = gs.skills.find(s => s.name === name);
            if (skill && gs.attrs[skill.parent]) {
                const attr = gs.attrs[skill.parent];
                attr.exp = Math.max(0, attr.exp - perSkill);
            }
        });
    },
    addSkillProficiency: (skillName) => {
        const gs = window.GlobalState;
        const skill = gs.skills.find(s => s.name === skillName);
        if(!skill) return;
        if(typeof skill.prof === 'undefined') skill.prof = 0;
        skill.prof += 1; 
        if (skill.prof >= 10) {
            skill.prof = 0; skill.lv++;
            act.toast(`📚 [${skill.name}] 升級 (Lv.${skill.lv})`);
            if (skill.lv >= 10) StatsEngine.retireSkill(skill);
        }
    },
    checkLevelUp: () => {
        const gs = window.GlobalState;
        while (gs.exp >= gs.lv * 100) {
            gs.exp -= gs.lv * 100; gs.lv++;
            gs.freeGem += 10; gs.story.maxEnergy += 5;
            act.toast(`🎉 升級！Lv.${gs.lv}`);
        }
    },
    handleExpLoss: () => {
        const gs = window.GlobalState;
        if (gs.settings.strict && gs.exp < 0) {
            if (gs.lv > 1) {
                gs.lv--; gs.exp = (gs.lv * 100) + gs.exp; 
                act.toast(`💔 等級下降至 Lv.${gs.lv}`);
            } else gs.exp = 0; 
        } else if (!gs.settings.strict) gs.exp = Math.max(0, gs.exp);
    },
    openAddSkill: () => { 
        act.openInputModal('輸入技能名稱', (name) => {
             if(name) {
                 document.getElementById('new-skill-name').value = name;
                 act.openModal('add-skill'); // Assume add-skill modal exists or handles logic
                 // If no separate modal exists, directly add:
                 // const attr = 'str'; // Default or prompt again
                 // ... logic to add skill ...
             }
        });
    },
    submitNewSkill: () => {
        const name = document.getElementById('new-skill-name').value;
        const attr = document.getElementById('new-skill-attr').value;
        const gs = window.GlobalState;
        if(!name) { act.toast("輸入名稱"); return; }
        if(gs.skills.some(s=>s.name===name)) { act.toast("已存在"); return; }
        gs.skills.push({ name: name, parent: attr, lv: 1, prof: 0, exp: 0 });
        act.save(); act.closeModal('add-skill'); act.toast("已學習"); view.renderStats();
    },
    retireSkill: (skill) => {
        const gs = window.GlobalState;
        if (!gs.archivedSkills) gs.archivedSkills = [];
        gs.archivedSkills.push({ ...skill, retireDate: Date.now() });
        gs.skills = gs.skills.filter(s => s.name !== skill.name);
        act.alert(`🏆 恭喜！[${skill.name}] 已進入榮譽殿堂！`);
    }
};

window.StatsEngine = StatsEngine;
window.act.checkLevelUp = StatsEngine.checkLevelUp;
window.act.openAddSkill = StatsEngine.openAddSkill;
window.act.submitNewSkill = StatsEngine.submitNewSkill;