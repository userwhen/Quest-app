/* js/modules/story300.js - V36.1 Ultimate Fix (Button Display Restored) */
window.act = window.act || {};

// =========================================================================
// [Engine] 劇情引擎核心
// =========================================================================
const StoryEngine = {
    
    // [Init] 進入模式
    enterMode: () => {
        Core.navigate('story');
        if(window.view && view.renderStoryPage) view.renderStoryPage();
        
        StoryEngine.updateEnergyUI(); 

        if (!window.TempState.currentSceneData) {
             StoryEngine.renderTextAndOptions("你來到了冒險的起點。準備好探索了嗎？", [
                 { label: '🔍 探索 (5精力)', onclick: 'act.exploreAdventure()' }
             ]);
        } else {
             const data = window.TempState.currentSceneData;
             if (data.options && data.options.length > 0) {
                 StoryEngine.showOptions(data.options);
             } else {
                 StoryEngine.showContinue(data);
             }
        }
    },

    // [Core 1] 探索
    explore: () => {
        const gs = window.GlobalState;
        
        if (gs.story.energy < 5) {
            act.toast("⚡ 精力不足 (需要 5 點)");
            return;
        }

        const today = new Date().toDateString();
        if (gs.story.lastExploreDate !== today) {
            gs.story.dailyExploreCount = 0;
            gs.story.lastExploreDate = today;
        }

        gs.story.energy -= 5;
        gs.story.dailyExploreCount++;
        Core.save();
        StoryEngine.updateEnergyUI();

        const chance = Math.max(0.1, 1.0 - (gs.story.dailyExploreCount * 0.01));
        console.log(`🎲 [Story] 探索機率: ${(chance*100).toFixed(0)}% (今日第 ${gs.story.dailyExploreCount} 次)`);
        
        view.updateStoryActions([]); // 防止連點

        if (Math.random() > chance) {
            StoryEngine.renderEmptyEvent();
        } else {
            StoryEngine.drawAndPlay();
        }
    },

    // [Core 2] 抽牌系統
    drawAndPlay: () => {
        const gs = window.GlobalState;
        const mode = gs.settings.mode || 'adventurer';
        
        // 1. 隨機劇本 (30%)
        if (Math.random() < 0.3) {
            const rndScene = StoryEngine.generateRandomScene();
            if (rndScene) {
                StoryEngine.startSceneData(rndScene);
                return;
            }
        }

        // 2. 準備牌庫
        if (!gs.story.deck) gs.story.deck = [];
        if (!gs.story.discard) gs.story.discard = [];
        if (!gs.story.archive) gs.story.archive = [];
        
        if (!window.StoryData || !window.StoryData.pools) {
            act.toast("資料庫載入中..."); return;
        }
        
        const poolData = window.StoryData.pools[mode];
        if (!poolData) {
            StoryEngine.renderEmptyEvent("此模式尚無劇情...");
            return;
        }

        // 3. 洗牌機制 (剩餘 < 20%)
        const total = gs.story.deck.length + gs.story.discard.length;
        if (gs.story.deck.length === 0 || (total > 0 && gs.story.deck.length / total < 0.2)) {
            if (gs.story.discard.length > 0) {
                console.warn(`🔀 [Deck] 洗牌觸發！回收 ${gs.story.discard.length} 張。`);
                act.toast("🔄 故事重組中...(洗牌)");
                gs.story.deck = [...gs.story.deck, ...gs.story.discard];
                gs.story.discard = [];
                gs.story.deck.sort(() => Math.random() - 0.5);
            } else if (gs.story.deck.length === 0) {
                gs.story.deck = [...poolData.common];
            }
        }

        // 4. 抽牌迴圈
        let cardId = null;
        let attempts = 0;
        while (attempts < gs.story.deck.length + 5) {
            if (gs.story.deck.length === 0) break;
            
            const candidateId = gs.story.deck.shift();
            const sceneData = window.StoryData.scenes[candidateId];
            
            // 主線鎖
            if (poolData.main.includes(candidateId) || (sceneData && sceneData.index !== undefined)) {
                if (sceneData.index === gs.story.mainProgress) {
                    cardId = candidateId;
                    break;
                } else {
                    gs.story.deck.push(candidateId);
                }
            } else {
                cardId = candidateId;
                break;
            }
            attempts++;
        }

        if (cardId) {
            StoryEngine.startScene(cardId);
        } else {
            StoryEngine.renderEmptyEvent("探索了很久，但什麼也沒發現...");
        }
    },

// [New] 隨機劇本生成器 (已改用 StoryData 資料源)
    generateRandomScene: () => {
        // ▼ 修改點 1：指向新的模板位置
        const templates = window.StoryData.randomTemplates; 
        const validTemplates = templates.filter(t => !t.reqTag || StoryEngine.hasTag(t.reqTag));
        
        if (validTemplates.length === 0) return null;
        const t = validTemplates[Math.floor(Math.random() * validTemplates.length)];
        
        let finalText = t.text;
        let grantedTags = t.grantsTag ? [...t.grantsTag] : [];
        let finalRewards = t.rewards ? JSON.parse(JSON.stringify(t.rewards)) : [];

        // ▼ 修改點 2：指向新的詞庫位置
        const wb = window.StoryData.wordBank; 

        const regex = /\{(\w+)(\.(\w+))?\}/g;
        finalText = finalText.replace(regex, (match, type, _, subtype) => {
            const category = wb[type]; // 改從 wb (StoryData.wordBank) 讀取
            if (!category) return match;
            let candidates = Array.isArray(category) ? category : (category[subtype || 'common'] || category['common']);
            const selected = StoryEngine.pickWeightedWord(candidates);
            if (selected.grant) grantedTags.push(selected.grant);
            return selected.text;
        });

        // ▼ 修改點 3：指向新的 Action 詞庫位置
        const actions = [...wb.Action]; 
        for (let i = actions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [actions[i], actions[j]] = [actions[j], actions[i]];
        }
        
        const createOption = (action) => {
            return { 
                label: action.text, 
                onclick: () => {
                    StoryEngine.renderTextAndOptions(
                        `\n\n> 你決定${action.text}。\n事情就這樣告一段落了。`, 
                        [{ label: "▼ 繼續", onclick: () => StoryEngine.finishScene(null) }],
                        true 
                    );
                }
            };
        };

        return {
            id: `rnd_${Date.now()}`,
            text: finalText,
            realOptions: [ createOption(actions[0]), createOption(actions[1]) ],
            grantsTag: grantedTags,
            rewards: finalRewards
        };
    },

    pickWeightedWord: (candidates) => {
        let totalWeight = 0;
        const weightedList = candidates.map(w => {
            let weight = w.baseWeight || 10;
            if (w.req && !StoryEngine.hasTag(w.req)) return null;
            if (w.bonus && StoryEngine.hasTag(w.bonus.tag)) weight += w.bonus.add;
            totalWeight += weight;
            return { word: w, weight: weight };
        }).filter(item => item !== null);

        if (weightedList.length === 0) return { text: "???" };
        let random = Math.random() * totalWeight;
        for (const item of weightedList) {
            if (random < item.weight) return item.word;
            random -= item.weight;
        }
        return weightedList[0].word;
    },

    // [Core 3] 場景渲染
    startScene: (sceneId) => {
        const scene = StoryEngine.getVariant(sceneId);
        if (!scene) return;
        StoryEngine.startSceneData(scene);
    },

    startSceneData: (scene) => {
        window.TempState.currentSceneData = scene;
        let fullText = scene.title ? `【${scene.title}】\n${scene.text}` : scene.text;
        
        if (scene.rewards) StoryEngine.giveRewards(scene.rewards);
        if (scene.grantsTag) StoryEngine.grantTags(scene.grantsTag);
        
        const actualOptions = scene.realOptions || scene.options;
        StoryEngine.renderTextAndOptions(fullText, actualOptions, false);
    },

    showContinue: (scene) => {
        const actualOptions = scene.realOptions || scene.options;
        view.updateStoryActions([{
            label: "▼",
            onclick: () => {
                StoryEngine.showOptions(actualOptions);
            }
        }]);
    },

 // [Visual] 統一渲染入口 (關鍵修復：補回選項顯示邏輯 + 安全網)
    renderTextAndOptions: (text, options, append = false) => {
        const textBox = document.getElementById('story-text');
        
        if (!append && textBox) textBox.innerHTML = '';
        view.updateStoryActions([]); // 1. 先隱藏所有按鈕

        if (window.view && view.appendStoryText) {
            // 2. 開始打字
            view.appendStoryText(text, () => {
                // 3. 打字結束，決定顯示什麼按鈕
                if (options && options.length > 0) {
                    // 正常情況：顯示劇本指定的選項
                    StoryEngine.showOptions(options);
                } else {
                    // 【關鍵修改】安全網：如果沒有選項，顯示預設的繼續按鈕
                    // 這樣玩家按下去後會呼叫 finishScene(null)，從而顯示「繼續探索」
                    StoryEngine.showOptions([{ 
                        label: "▼", 
                        onclick: () => StoryEngine.finishScene(null) 
                    }]);
                }
            });
        }
    },

    showOptions: (options) => {
        if (!options || options.length === 0) {
            StoryEngine.finishScene(null);
            return;
        }

        const buttons = [];
        options.forEach(opt => {
            let locked = false;
            if (opt.req) {
                const gs = window.GlobalState;
                if (opt.req.gold && gs.gold < opt.req.gold) locked = true;
                if (opt.req.energy && gs.story.energy < opt.req.energy) locked = true;
                if (opt.req.gem && (gs.freeGem + gs.paidGem) < opt.req.gem) locked = true;
            }
            
            let clickHandler = null;
            if (typeof opt.onclick === 'function') {
                clickHandler = opt.onclick;
            } else if (typeof opt.onclick === 'string') {
                if (opt.onclick.includes('act.')) {
                    clickHandler = () => { eval(opt.onclick); }; 
                } else {
                    clickHandler = () => StoryEngine.handleOption(opt);
                }
            } else {
                clickHandler = () => StoryEngine.handleOption(opt);
            }

            buttons.push({
                label: opt.label,
                style: opt.style || 'normal',
                disabled: locked,
                onclick: clickHandler
            });
        });
        view.updateStoryActions(buttons);
    },

    handleOption: (opt) => {
        const gs = window.GlobalState;
        
        if (opt.req) {
            if (opt.req.gold) gs.gold -= opt.req.gold;
            if (opt.req.energy) gs.story.energy -= opt.req.energy; 
            if (opt.req.gem) {
                let cost = opt.req.gem;
                if (gs.freeGem >= cost) { gs.freeGem -= cost; }
                else { cost -= gs.freeGem; gs.freeGem = 0; gs.paidGem -= cost; }
            }
            StoryEngine.updateEnergyUI(); 
            if (window.view) view.renderHUD();
        }

        if (opt.next) {
            const nextScene = StoryEngine.getVariant(opt.next);
            if (nextScene.type === 'check') {
                StoryEngine.runCheck(nextScene);
            } else {
                StoryEngine.startSceneData(nextScene);
            }
        } else {
            StoryEngine.finishScene(opt);
        }
    },

    // [Core 3.5] 檢定系統 (純文字版)
    runCheck: (scene) => {
        const check = scene.check;
        const gs = window.GlobalState;
        
        StoryEngine.renderTextAndOptions(scene.text + "\n", [], true); 

        setTimeout(() => {
            const attrVal = gs.attrs[check.attr] ? gs.attrs[check.attr].v : 1;
            const d20 = Math.floor(Math.random() * 20) + 1;
            const bonus = Math.floor(attrVal * 1.5);
            const isPass = (d20 + bonus) >= check.dc;
            const attrName = (window.DefaultData && window.DefaultData.attrs) ? window.DefaultData.attrs[check.attr].name : check.attr;

            const resultText = `\n> 🎲 檢定 ${attrName}\n> 擲骰: ${d20} + 加值 ${bonus} = ${d20+bonus} (難度: ${check.dc})\n> 結果: ${isPass ? '✅ 成功' : '❌ 失敗'}\n`;
            
            const nextId = isPass ? check.pass : check.fail;
            const nextScene = StoryEngine.getVariant(nextId);
            
            StoryEngine.renderTextAndOptions(resultText, [{
                label: "▼ 繼續",
                onclick: () => {
                    if (nextScene.reset) { 
                        StoryEngine.deathReset(); 
                    } else { 
                        StoryEngine.startSceneData(nextScene); 
                    } 
                }
            }], true);

        }, 800);
    },

    // [Fix] 結束時保留最後一段劇情文字
    finishScene: (opt) => {
        const gs = window.GlobalState;
        const currentId = window.TempState.currentSceneId;
        
        if (currentId && !currentId.startsWith('rnd_')) {
            const poolData = window.StoryData.pools[gs.settings.mode || 'adventurer'];
            if (poolData && poolData.main.includes(currentId)) {
                gs.story.archive.push(currentId);
                gs.story.mainProgress++;
            } else {
                gs.story.discard.push(currentId);
            }
        }
        Core.save();
        window.TempState.currentSceneData = null;
        
        // ▼ 修改重點：傳入 null，告訴 renderEmptyEvent 不要覆蓋畫面文字
        StoryEngine.renderEmptyEvent(null);
    },

    renderEmptyEvent: (text) => {
        const textBox = document.getElementById('story-text');
        
        // 如果有傳入文字 (例如 "什麼也沒發現") 才覆蓋，傳入 null 就不動
        if (text && textBox) {
            textBox.innerHTML = text;
        } else if (text === undefined && textBox) {
             // 如果完全沒傳參數，給個預設值
            textBox.innerHTML = "你探索了一番，但什麼也沒發現...";
        }

        // ▼ 修改重點：設定結束後的按鈕文字 ▼
        view.updateStoryActions([{ 
            label: '🔍 繼續探索',  // 這裡設定您想要的按鈕文字
            onclick: 'act.exploreAdventure()' 
        }]);
    },

    // [Fix] 修復版 giveRewards：只改數值，不重繪介面
    giveRewards: (rewards) => {
        const gs = window.GlobalState;
        if (!rewards) return;
        let msg = [];
        rewards.forEach(r => {
            const val = parseInt(r.val, 10) || 0;

            if (r.type === 'gold') { gs.gold += val; msg.push(`💰 ${val}`); }
            if (r.type === 'exp') { gs.exp += val; msg.push(`✨ ${val} Exp`); }
            
            // ▼▼▼ 修改重點：直接改數據，不呼叫 act.recoverEnergy ▼▼▼
            if (r.type === 'energy') { 
                gs.story.energy = Math.min(gs.story.maxEnergy, gs.story.energy + val);
                // 手動更新左上角文字 (假設 story300.js 有定義 updateEnergyUI，若無請手動補上或直接操作 DOM)
                const el = document.getElementById('story-energy-val');
                if(el) {
                    el.innerText = `${gs.story.energy}/${gs.story.maxEnergy}`;
                    el.style.color = gs.story.energy < 5 ? '#ff5252' : '#ffb74d';
                }
                msg.push(`⚡ ${val > 0 ? '+' : ''}${val}`);
            }
            // ▲▲▲ 修改結束 ▲▲▲

            if (r.type === 'item') {
                const item = gs.shop.npc.find(i => i.id === r.id);
                if (item) {
                    gs.bag.push({ ...item, uid: Date.now() });
                    msg.push(`📦 ${item.name}`);
                }
            }
            if (r.type === 'stat' && gs.attrs[r.key]) {
                gs.attrs[r.key].v += val;
                msg.push(`🆙 ${gs.attrs[r.key].name} +${val}`);
            }
        });
        
        if (msg.length > 0) act.toast("獲得: " + msg.join(", "));
        if (window.view && view.renderHUD) view.renderHUD();
    },

    updateEnergyUI: () => {
        const el = document.getElementById('story-energy-val');
        const gs = window.GlobalState;
        if(el && gs) {
            el.innerText = `${gs.story.energy}/${gs.story.maxEnergy}`;
            el.style.color = gs.story.energy < 5 ? '#ff5252' : '#ffb74d';
        }
    },

    getVariant: (sceneId) => {
        if (!window.StoryData || !window.StoryData.scenes) return null;
        const raw = window.StoryData.scenes[sceneId];
        if (!raw) return null;
        if (raw.type === 'variant') {
            for (const v of raw.variants) {
                if (StoryEngine.hasTag(v.reqTag)) return { ...v, id: sceneId };
            }
            return { ...raw.default, id: sceneId };
        }
        return { ...raw, id: sceneId };
    },

    hasTag: (tag) => {
        return window.GlobalState.story.tags && window.GlobalState.story.tags.includes(tag);
    },

    grantTags: (tags) => {
        if (!tags) return;
        tags.forEach(t => {
            if (!StoryEngine.hasTag(t)) {
                window.GlobalState.story.tags.push(t);
                act.toast(`🏷️ 獲得特性: [${t}]`);
            }
        });
    },
    
    deathReset: () => {
        const gs = window.GlobalState;
        act.alert("☠️ 你已死亡！\n\n劇情進度已重置，但你的等級與能力保留了下來。");
        
        gs.story.energy = gs.story.maxEnergy;
        gs.story.tags = [];
        gs.story.deck = [];
        gs.story.discard = [];
        gs.story.archive = [];
        gs.story.mainProgress = 0;

        const pool = window.StoryData.pools[gs.settings.mode || 'adventurer'];
        gs.story.deck = [...pool.common];

        for (let lv = 5; lv <= gs.lv; lv += 5) {
            const idx = (lv / 5) - 1;
            if (pool.main[idx]) {
                gs.story.deck.push(pool.main[idx]);
            }
        }

        Core.save();
        StoryEngine.updateEnergyUI();
        view.updateStoryActions([{ label: '🔄 重新開始', onclick: 'act.exploreAdventure()' }]);
    }
};

window.act.enterStoryMode = StoryEngine.enterMode;
window.act.exploreAdventure = StoryEngine.explore;
window.StoryEngine = StoryEngine;

// [Fix] 強制精力恢復邏輯
window.act.recoverEnergy = (val) => {
    const gs = window.GlobalState;
    gs.story.energy = Math.min(gs.story.maxEnergy, gs.story.energy + val);
    StoryEngine.updateEnergyUI(); 
    act.toast(`⚡ 精力恢復 ${val}`);

    const scene = window.TempState.currentSceneData;
    if (scene) {
        // 如果有暫存的真實選項，優先顯示
        const opts = scene.realOptions || scene.options;
        if(opts && opts.length > 0) {
            StoryEngine.showOptions(opts);
        } else {
             // 否則顯示離開
             view.updateStoryActions([{ label: '🔍 繼續探索', onclick: 'act.exploreAdventure()' }]);
        }
    } else {
        view.updateStoryActions([{ label: '🔍 繼續探索', onclick: 'act.exploreAdventure()' }]);
    }
};