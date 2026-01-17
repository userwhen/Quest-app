/* js/modules/story300.js - V18.0 Ultimate Edition */
window.act = window.act || {};

// ==========================================
// [Part 1] 視圖 (View) - 全螢幕 & 動態背景
// ==========================================
window.view = window.view || {};

Object.assign(window.view, {
    renderStoryPage: () => {
        const container = document.getElementById('page-story');
        if (!container) return;
        
        const gs = window.GlobalState;
        const currentMax = window.StoryEngine ? StoryEngine.calculateMaxEnergy() : 30;
        const energy = Math.min(gs.story?.energy ?? currentMax, currentMax);
        
        // 預設背景 (之後會被 updateBackground 覆蓋)
        const bgStyle = `background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('assets/bg_dungeon.jpg');`; 
        
        // 全螢幕布局 (配合 Core 隱藏 Navbar)
        const layoutStyle = `
            display: flex; flex-direction: column; 
            width: 100%; height: 100%; 
            background: #111; color: #fff; 
            overflow: hidden; box-sizing: border-box;
            position: relative;
        `;
        
        container.innerHTML = `
            <div style="${layoutStyle}" id="story-layout-inner">
                <div id="story-bg-layer" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:0; background-size:cover; background-position:center; ${bgStyle} transition: all 0.5s;"></div>
                <div id="story-bg-emoji" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:10rem; opacity:0.2; z-index:0; pointer-events:none;"></div>

                <div style="position:relative; z-index:1; display:flex; flex-direction:column; height:100%;">
                    <div class="story-top-bar" style="height:60px; padding:10px; display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3);">
                        <div class="story-res-grp" style="font-size:1.1rem; color:#ffd700;">
                            <span>⚡ <span id="s-energy">${energy}/${currentMax}</span></span>
                            ${ui.btn.sm('+', 'act.openStaminaShop()', 'u-btn-icon-sm')}
                        </div>
                        <div>${ui.btn.secondary('↩ 返回', "act.navigate('main')")}</div>
                    </div>

                    <div class="story-text-area" id="story-text-box" 
     style="flex:1; padding:20px; overflow-y:auto; font-size:1.1rem; line-height:1.6; text-shadow:1px 1px 2px black; white-space: pre-wrap;">
    <div id="story-content"></div>
    <div id="story-caret" class="story-caret" style="opacity:0; text-align:center; margin-top:10px;">▼</div>
</div>

                    <div class="story-action-area" id="story-actions" style="padding:15px; background:rgba(0,0,0,0.8); max-height:40vh; overflow-y:auto; display:grid; gap:10px;">
                        </div>
                </div>
            </div>
        `;
        
        // 若無內容，顯示探索按鈕
        if (!document.getElementById('story-content').innerHTML) {
             view.updateStoryActions([{ label: '🔍 開始探索', onclick: 'act.exploreAdventure()', style: 'primary' }]);
        }
    },

    updateBackground: (bg) => {
        const bgLayer = document.getElementById('story-bg-layer');
        const emojiLayer = document.getElementById('story-bg-emoji');
        if (!bgLayer || !bg) return;

        // 判斷是 Emoji 還是 圖片路徑
        // 簡單判斷：如果包含 .jpg/.png 或是路徑符號 / 則為圖片，否則視為 Emoji
        if (bg.includes('.') || bg.includes('/')) {
            bgLayer.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${bg}')`;
            emojiLayer.innerText = '';
        } else {
            // 是 Emoji
            bgLayer.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8))`; // 純黑底
            emojiLayer.innerText = bg;
        }
    },

    appendStoryText: (text) => {
        const box = document.getElementById('story-content');
        const caret = document.getElementById('story-caret');
        const area = document.getElementById('story-actions');
        if (!box) return;

        // 鎖定操作
        if (area) { area.style.pointerEvents = 'none'; area.style.opacity = '0.7'; }
        if (caret) caret.style.opacity = '0';

        box.innerHTML = ''; // 清空舊文字 (翻頁感)
        
        // [修正] 不再替換 <br>，直接拆分字串，依靠 CSS pre-wrap 處理換行
        let i = 0;
        const chars = text.split(''); 
        
        function type() {
            if (i < chars.length) {
                box.textContent += chars[i]; // 使用 textContent 防止 HTML 標籤被拆解顯示
                i++;
                const container = document.getElementById('story-text-box');
                if(container) container.scrollTop = container.scrollHeight; // 自動捲動到底部
                setTimeout(type, 15); // 打字速度
            } else {
                // 打字結束，解鎖
                if (caret) caret.style.opacity = '1';
                if (area) { area.style.pointerEvents = 'auto'; area.style.opacity = '1'; }
            }
        }
        type();
    },

    updateStoryActions: (actions) => {
        const area = document.getElementById('story-actions');
        if (!area) return;
        area.style.gridTemplateColumns = `repeat(${actions.length}, 1fr)`;
        area.innerHTML = actions.map((btn, idx) => {
            const style = `width:100%; min-height:50px; padding:10px; font-size:1rem;`;
            let btnClass = 'u-btn-primary';
            if(btn.style === 'danger') btnClass = 'u-btn-danger';
            if(btn.style === 'secondary') btnClass = 'u-btn-secondary';
            
            // 支援 onclick 是字串或函式
            const click = typeof btn.onclick === 'string' ? `onclick="${btn.onclick}"` : `id="s-btn-${idx}"`;
            const disabled = btn.disabled ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';
            return `<button class="u-btn ${btnClass}" style="${style}" ${click} ${disabled}>${btn.label}</button>`;
        }).join('');

        // 綁定函式事件
        actions.forEach((btn, idx) => {
            if (typeof btn.onclick === 'function' && !btn.disabled) {
                document.getElementById(`s-btn-${idx}`).onclick = btn.onclick;
            }
        });
    },

    showD20Roll: (data, cb) => {
        const box = document.getElementById('story-content');
        const rollId = 'd20-' + Date.now();
        box.innerHTML += `
            <div style="margin-top:20px; border:1px dashed #666; padding:10px; text-align:center;">
                <div style="font-size:0.9rem; color:#aaa;">${data.attrName} 檢定 (DC ${data.dc})</div>
                <div id="${rollId}" style="font-size:2rem; font-weight:bold; margin:10px 0;">🎲 ...</div>
            </div>
        `;
        document.getElementById('story-text-box').scrollTop = 9999;

        // 2D 震動動畫
        let steps = 0;
        const el = document.getElementById(rollId);
        const timer = setInterval(() => {
            el.innerText = Math.floor(Math.random()*20)+1;
            el.style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
            steps++;
            if(steps > 15) {
                clearInterval(timer);
                el.style.transform = 'none';
                const color = data.isSuccess ? '#4caf50' : '#f44336';
                el.innerHTML = `<span style="color:${color}">${data.total}</span> <span style="font-size:1rem; color:#888;">(🎲${data.roll} + ${data.bonus})</span>`;
                box.innerHTML += `<div style="text-align:center; color:${color}; font-weight:bold;">${data.isSuccess ? "✨ 成功！" : "💀 失敗..."}</div>`;
                document.getElementById('story-text-box').scrollTop = 9999;
                setTimeout(cb, 500);
            }
        }, 60);
    },

    updateStoryHUD: () => {
        const el = document.getElementById('s-energy');
        const max = window.StoryEngine ? StoryEngine.calculateMaxEnergy() : 30;
        const curr = window.GlobalState?.story?.energy ?? 0;
        if(el) el.innerText = `${curr}/${max}`;
    }
});

// ==========================================
// [Part 2] 引擎核心 (Engine) - V18 Logic
// ==========================================
const StoryEngine = {
    
    // 1. 初始化
    enterMode: () => {
        const gs = window.GlobalState;
        act.navigate('story'); 

        // 資料結構初始化
        if (!gs.story) gs.story = { energy: 30, maxEnergy: 30, dailyExploreCount: 0 };
        if (!gs.story.deck) gs.story.deck = [];
        if (!gs.story.discard) gs.story.discard = [];
        if (!gs.story.archive) gs.story.archive = [];
        if (!gs.story.tags) gs.story.tags = [];
        if (typeof gs.story.mainProgress === 'undefined') gs.story.mainProgress = 0;

        // 強制更新上限
        StoryEngine.calculateMaxEnergy();
        if (typeof gs.story.energy === 'undefined') gs.story.energy = gs.story.maxEnergy;

        StoryEngine.checkEnergyLoop();
        view.renderStoryPage();
        
        // 若無進行中劇本，顯示閒置
        if (!window.TempState.currentSceneData) {
            StoryEngine.showIdleText();
        }
    },

    calculateMaxEnergy: () => {
        const gs = window.GlobalState;
        const lv = Math.max(1, gs.lv || 1);
        let max = 30 + ((lv - 1) * 2); 
        if (max > 100) max = 100;
        if(gs.story) gs.story.maxEnergy = max;
        return max;
    },

    // 2. 探索 (每日機率遞減 + 扣體)
    explore: () => {
        const gs = window.GlobalState;
        if (gs.story.energy < 5) {
            act.toast("⚡ 精力不足");
            act.openStaminaShop(); return;
        }

        // 每日重置
        const today = new Date().toDateString();
        if (gs.story.lastExploreDate !== today) {
            gs.story.dailyExploreCount = 0;
            gs.story.lastExploreDate = today;
        }

        gs.story.energy -= 5;
        gs.story.dailyExploreCount++;
        act.save();
        view.updateStoryHUD();

        // [修改] 機率調整：每次減少 0.1% (0.001)，最低 10%
        const chance = Math.max(0.1, 1.0 - (gs.story.dailyExploreCount * 0.001));
        
        console.log(`🎲 探索機率: ${(chance*100).toFixed(1)}% (次數: ${gs.story.dailyExploreCount})`);

        if (Math.random() <= chance) {
            StoryEngine.drawAndPlay();
        } else {
            StoryEngine.showIdleText();
        }
    },

   // 3. 抽牌核心 (洗牌 + 主線注入 + 立即存檔)
    drawAndPlay: () => {
        const gs = window.GlobalState;
        const mode = gs.settings.mode || 'adventurer';

        if (!window.StoryData || !window.StoryData.pools) return view.appendStoryText("❌ 資料庫載入失敗");
        const poolData = window.StoryData.pools[mode];
        if (!poolData) return act.toast(`❌ 模式 [${mode}] 無劇本資料`);

        // A. 主線嚴格序列注入
        if (poolData.main) {
            const nextMainId = poolData.main[gs.story.mainProgress];
            if (nextMainId) {
                const inArchive = gs.story.archive.includes(nextMainId);
                const inDeck = gs.story.deck.includes(nextMainId);
                const inDiscard = gs.story.discard.includes(nextMainId);
                
                // 確保這張卡完全不在循環中才注入
                if (!inArchive && !inDeck && !inDiscard) {
                    const insertIdx = Math.floor(Math.random() * (gs.story.deck.length + 1));
                    gs.story.deck.splice(insertIdx, 0, nextMainId);
                    act.save(); 
                    console.log("📜 主線注入 (已存檔):", nextMainId);
                }
            }
        }

        // B. 洗牌檢核
        const total = gs.story.deck.length + gs.story.discard.length;
        if ((gs.story.deck.length === 0 && gs.story.discard.length > 0) || 
            (total > 0 && gs.story.deck.length / total < 0.2 && gs.story.discard.length > 0)) {
            gs.story.deck = [...gs.story.deck, ...gs.story.discard];
            gs.story.discard = [];
            // Shuffle
            for (let i = gs.story.deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [gs.story.deck[i], gs.story.deck[j]] = [gs.story.deck[j], gs.story.deck[i]];
            }
            act.save();
            act.toast("🔀 牌庫重洗");
        } else if (gs.story.deck.length === 0 && gs.story.discard.length === 0) {
            if (poolData.common) gs.story.deck = [...poolData.common];
            act.save();
        }

        // C. 抽牌
        const cardId = gs.story.deck.shift();
        act.save(); 

        // [關鍵修復] 記錄這張卡是「根源卡」，之後不管跳轉到哪，結算都認這張
        window.TempState.rootSceneId = cardId;

        console.log("🃏 抽到卡片:", cardId);

        if (cardId === 'GEN_TEMPLATE') {
            StoryEngine.generateScene();
        } else if (cardId) {
            StoryEngine.startScene(cardId);
        } else {
            StoryEngine.showIdleText();
        }
    },

    // 4. 生成器 (Procedural Generation)
    generateScene: () => {
        const templates = window.StoryData.randomTemplates || [];
        if (templates.length === 0) return StoryEngine.showIdleText();

        // 隨機選模板 (可加入權重邏輯)
        const tpl = templates[Math.floor(Math.random() * templates.length)];
        
        // 解析文字 {Type.category}
        let finalType = 'normal';
        let finalText = tpl.text.replace(/\{(\w+)\.(\w+)\}/g, (match, type, cat) => {
            return StoryEngine.getWord(type, cat);
        }).replace(/\{(\w+)\}/g, (match, type) => {
            // 處理 {Item} 這種沒寫 category 的，預設 common
            return StoryEngine.getWord(type, 'common');
        });

        // 檢查 Extensions (Tag 觸發)
        let options = [{ label: "繼續", end: true }];
        if (tpl.extensions) {
            for (const ext of tpl.extensions) {
                if (StoryEngine.hasTag(ext.reqTag)) {
                    finalText += ext.appendText;
                    options = ext.options; // 覆蓋選項
                    break; 
                }
            }
        }

        // 構建場景物件
        const generatedScene = {
            id: 'generated_' + Date.now(),
            text: finalText,
            options: options,
            bg: '🎲' // 隨機劇本標示
        };

        StoryEngine.renderSceneContent(generatedScene);
    },

    getWord: (type, cat) => {
        const wb = window.StoryData.wordBank;
        if (!wb || !wb[type]) return "???";
        
        let list = wb[type][cat];
        if (!list && Array.isArray(wb[type])) list = wb[type]; // 兼容 Item: []
        if (!list) return "???";

        // 權重計算
        let totalW = 0;
        const candidates = list.map(item => {
            let w = item.weight || item.baseWeight || 1;
            // 動態權重 bonus
            if (item.bonus && StoryEngine.hasTag(item.bonus.tag)) {
                w += item.bonus.add;
            }
            totalW += w;
            return { text: item.text, w: w };
        });

        let rnd = Math.random() * totalW;
        for (const cand of candidates) {
            rnd -= cand.w;
            if (rnd <= 0) return cand.text;
        }
        return candidates[0].text;
    },

    // 5. 啟動場景 (變體 + 背景)
    startScene: (sceneId) => {
        // getVariant 會回傳 { ...raw, id: sceneId } <--- 這裡會把 ID 塞進物件
        const scene = StoryEngine.getVariant(sceneId);
        
        if (!scene) {
            console.error("Missing scene:", sceneId);
            return StoryEngine.showIdleText();
        }

        // 動態背景
        if (scene.bg) view.updateBackground(scene.bg);
        else view.updateBackground('assets/bg_dungeon.jpg');

        StoryEngine.renderSceneContent(scene);
    },

    renderSceneContent: (scene) => {
        // [關鍵修復] 必須明確記錄當前場景 ID，結算時才找得到人
        window.TempState.currentSceneData = scene;
        if (scene.id) window.TempState.currentSceneId = scene.id; 
        
        console.log("🎬 渲染場景:", scene.id); // Debug 用，確認 ID 有被記錄

        // 標題與內文
        let txt = scene.title ? `【${scene.title}】\n` : "";
        txt += scene.text;
        view.appendStoryText(txt);

        // 獎勵與標籤
        if (scene.rewards) StoryEngine.giveRewards(scene.rewards);
        if (scene.grantsTag) StoryEngine.grantTags(scene.grantsTag);

        // 選項處理
        if (!scene.options || scene.options.length === 0) {
            // 若無選項且是 end，顯示離開
            if (scene.end) {
                view.updateStoryActions([{ label: '🔍 繼續探索', onclick: 'act.exploreAdventure()', style: 'primary' }]);
                StoryEngine.finishScene(); // 這裡不傳參數，讓它讀 TempState
            } else {
                // 異常防呆
                view.updateStoryActions([{ label: '離開', onclick: 'act.exploreAdventure()' }]);
            }
            return;
        }

        const buttons = scene.options.map(opt => {
            // 資源檢查 (Tag 檢查)
            let disabled = false;
            let label = opt.label || opt.text;
            
            // Item 檢查 (Tag)
            if (opt.req) {
                if (opt.req.gold && window.GlobalState.gold < opt.req.gold) disabled = true;
                if (opt.req.tag && !StoryEngine.hasTag(opt.req.tag)) disabled = true;
            }

            return {
                label: label,
                style: opt.style || 'primary',
                disabled: disabled,
                onclick: () => StoryEngine.handleOption(opt)
            };
        });
        view.updateStoryActions(buttons);
    },

    handleOption: (opt) => {
        const gs = window.GlobalState;
        
        // 1. 扣除資源
        if (opt.req && opt.req.gold) {
            gs.gold -= opt.req.gold;
            view.updateStoryHUD();
        }

        // 2. 優先處理 Check (檢定)
        if (opt.check) return StoryEngine.runInlineCheck(opt);

        // 3. 處理 Next (跳轉)
        if (opt.next) {
            const nextScene = StoryEngine.getVariant(opt.next);
            if (nextScene) {
                if (nextScene.type === 'check') StoryEngine.runCheck(nextScene);
                else StoryEngine.renderSceneContent(nextScene);
            } else {
                console.error("Next scene not found:", opt.next);
                StoryEngine.finishScene(); // 防呆
            }
        } 
        // 4. 處理 End (結束)
        else {
            // 無論有沒有寫 end: true，只要沒有 next/check 都視為結束
            StoryEngine.finishScene();
        }
    },

    // 7. 檢定 (Inline)
    runInlineCheck: (opt) => {
        const check = opt.check;
        const attrKey = (check.stat || check.attr).toUpperCase();
        const attrVal = (window.GlobalState.attrs?.[attrKey]?.v) || 1;
        
        // [新增] 鎖定按鈕，防止重複點擊
        const actionArea = document.getElementById('story-actions');
        if (actionArea) actionArea.style.pointerEvents = 'none';

        view.appendStoryText(`\n(進行 ${attrKey} 檢定...)`);

        const roll = Math.floor(Math.random()*20)+1;
        const bonus = Math.floor(attrVal / 2);
        const total = roll + bonus;
        const isSuccess = total >= (check.val || check.dc);

        view.showD20Roll({
            attrName: attrKey, roll, bonus, total, dc: check.val||check.dc, isSuccess
        }, () => {
            // [新增] 動畫結束後解鎖 (雖然之後會刷新按鈕，但習慣上解鎖比較安全)
            if (actionArea) actionArea.style.pointerEvents = 'auto';

            const nextId = isSuccess ? opt.pass : opt.fail;
            const nextScene = StoryEngine.getVariant(nextId);
            
            if(nextScene) {
                if(nextScene.reset) StoryEngine.deathReset();
                else StoryEngine.renderSceneContent(nextScene);
            } else {
                StoryEngine.finishScene();
            }
        });
    },

    // 8. 結束與歸檔 (使用 RootID)
    finishScene: () => {
        const gs = window.GlobalState;
        // [關鍵] 結算時只看最初抽到的那張卡 (Root ID)，忽略中間跳轉的過程卡
        const rootId = window.TempState.rootSceneId;
        const mode = gs.settings.mode || 'adventurer';
        const poolData = window.StoryData.pools[mode];

        console.log(`🏁 結算根源卡: ${rootId}`);

        if (rootId) {
            let isMain = false;
            // 檢查 RootID 是否為主線
            if (poolData && poolData.main && poolData.main.includes(rootId)) {
                isMain = true;
                if (!gs.story.archive.includes(rootId)) {
                    gs.story.archive.push(rootId);
                    gs.story.mainProgress = (gs.story.mainProgress || 0) + 1;
                    console.log("✅ 主線歸檔，進度+1");
                    
                    // 確保牌庫乾淨
                    gs.story.deck = gs.story.deck.filter(id => id !== rootId);
                    gs.story.discard = gs.story.discard.filter(id => id !== rootId);
                }
            } 
            
            // 如果不是主線，也不是生成卡，就放入棄牌堆
            if (!isMain && !rootId.startsWith('generated_')) {
                // 避免重複放入
                if (!gs.story.discard.includes(rootId)) {
                    gs.story.discard.push(rootId);
                }
            }
        }
        
        // 清理狀態
        window.TempState.currentSceneData = null;
        window.TempState.currentSceneId = null;
        window.TempState.rootSceneId = null; // 清除根源

        act.save();
        
        setTimeout(() => {
            const box = document.getElementById('story-content');
            if(box) {
                box.innerHTML += '<div style="margin-top:30px; padding-top:10px; border-top:1px dashed #444; color:#888; text-align:center; font-size:0.9rem;">(探索結束)</div>';
                document.getElementById('story-text-box').scrollTop = 9999;
            }
            view.updateStoryActions([{ label: '🔍 繼續探索', onclick: 'act.exploreAdventure()', style: 'primary' }]);
        }, 300);
    },

    // Helpers
    getVariant: (id) => {
        const raw = window.StoryData.scenes[id];
        if (!raw) return null;
        if (raw.type === 'variant' && raw.variants) {
            for (const v of raw.variants) {
                if (StoryEngine.hasTag(v.reqTag)) return { ...v, id: id };
            }
            return { ...raw.default, id: id };
        }
        return { ...raw, id: id };
    },

    hasTag: (tag) => (window.GlobalState.story.tags || []).includes(tag),
    
    grantTags: (tags) => {
        const gs = window.GlobalState;
        if(!gs.story.tags) gs.story.tags = [];
        tags.forEach(t => {
            if(!gs.story.tags.includes(t)) {
                gs.story.tags.push(t);
                act.toast(`🏷️ [${t}]`);
            }
        });
    },

    giveRewards: (rwds) => {
        const gs = window.GlobalState;
        rwds.forEach(r => {
            if(r.type==='gold') gs.gold += r.val;
            if(r.type==='exp') gs.exp += r.val;
            if(r.type==='energy') StoryEngine.recoverEnergy(r.val);
        });
        view.updateStoryHUD();
        act.toast("獲得獎勵");
    },

    showIdleText: () => {
        const texts = window.GameConfig.StoryIdleTexts;
        const txt = texts[Math.floor(Math.random()*texts.length)];
        view.appendStoryText(txt);
        view.updateStoryActions([{ label: '🔍 繼續探索', onclick: 'act.exploreAdventure()', style: 'primary' }]);
    },

    checkEnergyLoop: () => {
        const gs = window.GlobalState;
        if(!gs) return;
        if(!gs.story.lastRecTime) gs.story.lastRecTime = Date.now();
        const doCheck = () => {
            const now = Date.now();
            const elapsed = now - gs.story.lastRecTime;
            if(elapsed >= 360000) { // 6min
                const pt = Math.floor(elapsed/360000);
                if(pt > 0) {
                    StoryEngine.recoverEnergy(pt);
                    gs.story.lastRecTime = now - (elapsed % 360000);
                    act.save();
                }
            }
        };
        doCheck();
        setInterval(doCheck, 10000);
    },

    recoverEnergy: (pt) => {
        const gs = window.GlobalState;
        const max = StoryEngine.calculateMaxEnergy();
        gs.story.energy = Math.min(max, gs.story.energy + pt);
        if(window.view) view.updateStoryHUD();
    },

    deathReset: () => {
        const gs = window.GlobalState;
        act.alert("☠️ 你已死亡！劇情進度重置。");
        gs.story.energy = gs.story.maxEnergy;
        gs.story.tags = [];
        gs.story.deck = [];
        gs.story.discard = [];
        gs.story.archive = [];
        gs.story.mainProgress = 0;
        act.save();
        view.renderStoryPage();
    }
};

window.act.enterStoryMode = StoryEngine.enterMode;
window.act.exploreAdventure = StoryEngine.explore;
window.StoryEngine = StoryEngine;