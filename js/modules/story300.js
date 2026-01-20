/* js/modules/story300.js - V29.5 Integrated Fix */

// ==========================================
// [Part 1] 視圖 (View) - 完整合併版
// ==========================================
window.view = window.view || {};

// 1. 渲染劇情頁面框架 (使用新版全域 UI 結構 + Top Bar)
view.renderStoryPage = function() {
    const container = document.getElementById('page-story');
    if (!container) return;
    
    container.style.display = 'block';
    
    const gs = window.GlobalState;
    const currentMax = window.StoryEngine ? StoryEngine.calculateMaxEnergy() : 30;
    const energy = Math.max(0, Math.min(gs.story?.energy ?? currentMax, currentMax));
    const locName = gs.story?.locationName || '🌲 未知區域';

    // 準備語言選擇器
    let langSelectorHtml = "";
    if (window.StoryEngine && StoryEngine.isLearningActive()) {
        const currentLang = gs.settings.targetLang || 'mix';
        langSelectorHtml = `
            <select id="story-lang-select" onchange="act.setLang(this.value)" style="margin-right:8px; padding:2px; font-size:0.8rem; border-radius:4px; background:rgba(255,255,255,0.9); font-weight:bold; height:28px;">
                <option value="mix" ${currentLang==='mix'?'selected':''}>😵 MIX</option>
                <option value="jp" ${currentLang==='jp'?'selected':''}>🇯🇵 JP</option>
                <option value="en" ${currentLang==='en'?'selected':''}>🇺🇸 EN</option>
                <option value="kr" ${currentLang==='kr'?'selected':''}>🇰🇷 KR</option>
                <option value="fr" ${currentLang==='fr'?'selected':''}>🇫🇷 FR</option>
                <option value="es" ${currentLang==='es'?'selected':''}>🇪🇸 ES</option>
            </select>
        `;
    }

    const btnStamina = window.ui ? ui.btn.sm('+', 'act.openStaminaShop()', 'u-btn-icon-sm') : '<button onclick="act.openStaminaShop()">+</button>';
    const btnBack = window.ui ? ui.btn.secondary('↩', "act.navigate('main')") : '<button onclick="act.navigate(\'main\')">↩</button>';

    container.innerHTML = `
        <div id="story-layout-inner" style="display: flex; flex-direction: column; width: 100%; height: 100%; position: relative;">
            <div id="story-bg-layer"></div>
            
            <div class="story-top-bar" style="
    position:relative; 
    z-index:2; 
    height:60px; 
    padding:0 15px; 
    display:flex;             /* 關鍵 1 */
    justify-content:space-between; 
    align-items:center;       /* 關鍵 2：垂直置中 */
    background:rgba(0,0,0,0.8); 
    border-bottom:1px solid rgba(255,255,255,0.1); 
    flex-shrink:0;">

    <div class="story-res-grp" style="
        font-size:1.1rem; 
        color:#ffd700; 
        font-weight:bold; 
        display:flex;         /* 關鍵 3：內層也要 flex */
        align-items:center;   /* 關鍵 4：內層垂直置中 */
        gap:5px;
        height: 100%;">       <span>⚡ <span id="s-energy">${energy}/${currentMax}</span></span>
        ${btnStamina}
    </div>

    <div id="story-location-display" style="
        position:absolute; 
        left:50%; 
        top: 50%;             /* 關鍵 5 */
        transform:translate(-50%, -50%); /* 關鍵 6：完全置中 */
        white-space:nowrap; 
        pointer-events:none; 
        text-shadow: 0 2px 4px black; 
        color:#fff; 
        font-weight:bold;">
        ${locName}
    </div>

    <div style="
        display:flex;         /* 關鍵 7 */
        align-items:center;   /* 關鍵 8 */
        height: 100%;">
        
        ${langSelectorHtml}
        ${btnBack}
    </div>
</div>

            <div id="story-text-box" style="flex:1; position:relative; margin:10px 15px; padding:15px; background:rgba(30, 30, 30, 0.6); border-radius:8px; border:1px solid rgba(255,255,255,0.1); overflow-y:auto; backdrop-filter:blur(2px);">
                <div id="story-content" style="color:#eee; line-height:1.6; font-size:1.05rem; text-shadow:1px 1px 2px #000;"></div>
                <button id="story-next-hint" class="btn btn-sm" 
        style="position:absolute; bottom:5px; left:50%; transform:translateX(-50%); 
               background:transparent; border:none; color:#ffd700; font-size:1.5rem; 
               animation:bounce 1s infinite; display:none; z-index: 100;">
        ▼
    </button>
	</div>
            
            <div id="story-actions" style="height: 200px; flex-shrink: 0; padding: 10px 15px; box-sizing: border-box; overflow-y: auto; box-sizing: border-box;"></div>

            <div id="tag-drawer-unit">
                <div id="tag-drawer-handle" onclick="view.toggleTagDrawer(true)">◁</div>
                <div id="tag-drawer-body"><div style="color:#666; text-align:center; padding:20px;">(暫無標籤)</div></div>
                <div id="tag-drawer-close" onclick="view.toggleTagDrawer(false)">▷</div>
            </div>
        </div>`;
    
    view.updateBackground(gs.story.locationBg || 'assets/bg_dungeon.jpg');
    
    // 綁定點擊換頁
    const textBox = document.getElementById('story-text-box');
    if(textBox) {
        textBox.onclick = () => {
            if (window.TempState.isRendering) { window.TempState.skipRendering = true; return; }
            if (window.TempState.waitingForPageClick && window.TempState.nextPageFunc) { window.TempState.nextPageFunc(); }
        };
    }
    view.renderTags();
};

// 2. HUD 更新 (修復報錯缺失的功能)
view.updateStoryHUD = function() {
    const gs = window.GlobalState;
    if (!gs || !gs.story) return;

    // 更新精力文字
    const elEnergy = document.getElementById('s-energy');
    if (elEnergy) {
        const currentMax = window.StoryEngine ? StoryEngine.calculateMaxEnergy() : 30;
        const currentVal = Math.floor(gs.story.energy || 0);
        elEnergy.innerText = `${currentVal}/${currentMax}`;
    }

    // 同步更新全域 HUD (如果存在)
    if (view.renderHUD) view.renderHUD(gs);
};

// 3. 更新位置顯示
view.updateLocationDisplay = function(name) {
    const el = document.getElementById('story-location-display');
    if (el) el.innerText = name;
};

// 4. 背景更新 (合併舊版邏輯與新版遮罩)
view.updateBackground = function(url) {
    // 1. [關鍵] 必須先定義 layer 是什麼
    const layer = document.getElementById('story-bg-layer');
    
    // 2. 防呆：如果找不到元素，就直接結束，避免報錯
    if (!layer) return;
    
    // 3. 設定樣式
    // 如果 url 是空的或是 null，就給一個預設值
    const safeUrl = url || 'assets/bg_dungeon.jpg'; 
    
    layer.style.backgroundImage = `url('${safeUrl}')`;
    layer.style.backgroundColor = '#1a1a1a'; // 圖片載入失敗時的底色 (深灰)
    layer.style.backgroundSize = 'cover';
    layer.style.backgroundPosition = 'center';
    layer.style.backgroundRepeat = 'no-repeat';
};

// 5. 按鈕更新 (新版：嚴格紅綠邏輯 + UI Library)
view.updateStoryActions = function(actions) {
    const area = document.getElementById('story-actions');
    if (!area) return;
    
    // 改用 Flex Column 佈局
    area.style.display = 'flex';
    area.style.flexDirection = 'column';
    area.style.justifyContent = 'center'; // 如果按鈕少，置中顯示
    area.style.gap = '10px';              // 按鈕間距
    area.style.padding = '10px 15px';     // 維持您要求的 padding
    
    window.TempState.isActionLocked = false;
    area.style.pointerEvents = 'auto'; 
    area.style.opacity = '1';
    
    view.setDrawerHandleMode('drawer');
    view.toggleTagDrawer(false); 

    area.innerHTML = actions.map((btn, idx) => {
        let renderBtnFunc = ui.btn.primary; 
        if (btn.style === 'danger') renderBtnFunc = ui.btn.danger;
        
        const label = view.parseRuby(btn.label);
        const clickAttr = typeof btn.onclick === 'string' ? `onclick="${btn.onclick}"` : `id="s-btn-${idx}"`;
        const disabledAttr = btn.disabled ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';
        
        const baseClass = (btn.style === 'danger') ? 'u-btn u-btn-danger' : 'u-btn u-btn-primary';
        
        // [關鍵樣式]
        // flex: 1 -> 自動填滿空間
        // max-height: 50px -> 限制最大高度，確保 3 個按鈕能放入 180px 空間 (50*3 + 10*2 = 170 < 180)
        // min-height: 40px -> 確保不會縮得太小
        const customStyle = `
            width: 100%; 
            flex: 1; 
            max-height: 50px; 
            min-height: 40px; 
            font-size: 1.05rem; 
            border-radius: 12px; 
            font-weight: bold; 
            box-shadow: 0 4px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        return `<button class="${baseClass}" style="${customStyle}" ${clickAttr} ${disabledAttr}>${label}</button>`;
    }).join('');
    
    actions.forEach((btn, idx) => { 
        if (typeof btn.onclick === 'function' && !btn.disabled) { 
            const el = document.getElementById(`s-btn-${idx}`);
            if(el) el.onclick = btn.onclick; 
        } 
    });
};

// 6. 鎖定按鈕 (來自舊版功能，防止重複點擊)
view.lockActions = function() {
    const area = document.getElementById('story-actions');
    if (!area) return;
    const btns = area.querySelectorAll('button');
    btns.forEach(b => b.disabled = true);
    window.TempState.isActionLocked = true;
};

// 7. 閒置模式 (新版：保留對話框，不使用 Action Grid)
view.setIdleText = function(text) {
    view.setStoryMode('event'); // 確保顯示對話框
    
    view.appendStoryText(text, () => {
        // 文字打完後，顯示唯一的綠色按鈕
        view.updateStoryActions([{
            label: "繼續旅程",
            style: 'primary',
            onclick: 'StoryEngine.transitToEncounter()'
        }]);
    });
};

// 8. 模式切換 (簡化版：始終顯示 Text Box)
view.setStoryMode = function(mode) {
    const textBox = document.getElementById('story-text-box');
    const actions = document.getElementById('story-actions');
    
    if(textBox) textBox.style.display = 'block';
    
    // 如果是進入事件，先清空按鈕等待文字生成
    if (mode === 'event' && actions) {
        actions.innerHTML = '';
    }
};

// 9. Tag 抽屜 (來自舊版，功能完整)
view.renderTags = function() {
    const body = document.getElementById('tag-drawer-body');
    if (!body) return;
    const tags = window.GlobalState.story?.tags || [];
    const tagDefs = window.StoryData?.tags || {}; 
    
    if (tags.length === 0) {
        body.innerHTML = `<div style="color:#888; text-align:center; grid-column:1/-1; padding-top:20px;">背包空空如也...</div>`;
        return;
    }
    const html = tags.map(t => {
        const def = tagDefs[t] || { name: t }; 
        return `<div class="u-tag-pill">${def.name}</div>`;
    }).join('');
    body.innerHTML = html;
};

view.toggleTagDrawer = function(isOpen) {
    const drawer = document.getElementById('tag-drawer-unit');
    if (!drawer) return;
    if (isOpen) {
        drawer.classList.add('open');
        view.renderTags();
    } else {
        drawer.classList.remove('open');
    }
};

view.setDrawerHandleMode = function(mode) {
    const handle = document.getElementById('tag-drawer-handle');
    if (!handle) return;
    handle.innerHTML = '◁';
    handle.onclick = () => view.toggleTagDrawer(true);
};

// =========================================================
// [CRITICAL FIX] 恢復文字打字機引擎與 Ruby 解析 (解決 TypeError)
// =========================================================

// 10. Ruby 解析 (來自舊版)
view.parseRuby = function(text) {
    if (!text) return "";
    return text.replace(/([\u4e00-\u9fa5]+)\[(.+?)\]/g, '<ruby>$1<rt>$2</rt></ruby>');
};

// 11. 核心打字機函式 (來自舊版，完整保留)
// [View Mod] 融合版：保留 Ruby 與分頁功能，並加入自訂速度支援
view.appendStoryText = function(text, onComplete, customSpeed) { // <--- 1. 新增第三個參數
    const box = document.getElementById('story-content');
    const hint = document.getElementById('story-next-hint');
    if (!box) return;
    
    // [設定] 決定打字速度：如果有傳 customSpeed 就用，否則預設 20ms (原版速度)
    const typingSpeed = customSpeed || 20; 

    // 重置狀態
    window.TempState.isRendering = false;
    window.TempState.skipRendering = false;
    window.TempState.waitingForPageClick = false;

    // 1. Ruby 處理 (保持原樣 - 重要！)
    const processedText = view.parseRuby(text);
    if (processedText.includes('<ruby>')) {
        box.innerHTML = processedText;
        if (typeof onComplete === 'function') onComplete();
        return;
    }

    // 2. 智慧斷句邏輯 (保持原樣 - 重要！)
    const rawChunks = text.match(/[^。！？.!?\n]*[。！？.!?\n]*/g) || [text];
    const cleanChunks = rawChunks.filter(c => c && c.trim().length > 0); // 過濾掉空行
	
    let pages = [];
    let currentPage = "";
    const MAX_CHARS = 150; 

    for (let chunk of cleanChunks) {
        if ((currentPage.length + chunk.length > MAX_CHARS) && currentPage.length > 0) {
            pages.push(currentPage);
            currentPage = chunk;
        } else {
            currentPage += chunk;
        }
    }
    if (currentPage.length > 0) pages.push(currentPage);
	if (pages.length === 0) pages = [text];
    let pageIndex = 0;

    function showPage() {
        box.innerHTML = ''; 
        if(hint) hint.style.display = 'none'; 
        window.TempState.waitingForPageClick = false;
        window.TempState.isRendering = true; 
        
        const chars = pages[pageIndex].split(''); 
        let i = 0; 
        
        function type() {
            if (window.TempState.skipRendering) {
                // 如果玩家點擊跳過，瞬間顯示剩餘內容
                box.textContent += chars.slice(i).join('');
                finishTyping();
                return;
            }
            if (i < chars.length) { 
                box.textContent += chars[i]; 
                i++; 
                // [關鍵修改] 這裡使用變數 typingSpeed，而不是寫死的 20
                setTimeout(type, typingSpeed); 
            } else {
                finishTyping();
            }
        }

        function finishTyping() {
            window.TempState.isRendering = false; 
            window.TempState.skipRendering = false;
            pageIndex++;
            
            if (pageIndex < pages.length - 1) { // 注意這裡的 -1
                if(hint) hint.style.display = 'block'; // 顯示三角形
                window.TempState.nextPageFunc = () => {
                    pageIndex++;
                    showPage(); // 翻頁
                };
            } else {
                // 是最後一頁了 -> 隱藏三角形，執行結束回呼 (顯示選項)
                if(hint) hint.style.display = 'none'; 
                if (typeof onComplete === 'function') onComplete();
            }
        }
        type();
    }
    
    // 開始顯示第一頁
    if (pages.length > 0) showPage();
    else if (typeof onComplete === 'function') onComplete();
};

// 12. 檢定結果顯示 (來自舊版)
view.appendInlineCheckResult = function(attrKey, total, isSuccess) {
    const box = document.getElementById('story-content');
    if (!box) return;
    const div = document.createElement('div'); 
    div.style.marginTop = '10px';
    const color = isSuccess ? '#4caf50' : '#f44336';
    div.innerHTML = `<span style="color:#aaa;">(🎲) (${attrKey}判定)... ${total} ...</span><span style="color:${color}; font-weight:bold;">${isSuccess ? '成功' : '失敗'}</span>`;
    box.appendChild(div);
    const con = document.getElementById('story-text-box');
    if(con) con.scrollTop = con.scrollHeight;
};

// ==========================================
// [Part 2] 引擎核心 (Engine) - V30.0 Hybrid Edition
// 混合引擎：結合 V29 生成技術 + V26 牌庫管理
// ==========================================
const StoryEngine = {
    
    // 1. 初始化與進入
    enterMode: () => {
    const gs = window.GlobalState;
    if (window.act.navigate) window.act.navigate('story');
    else { document.querySelectorAll('.page').forEach(p => p.style.display = 'none'); const p = document.getElementById('page-story'); if (p) p.style.display = 'block'; }

    // [New] 载入固定剧本数据
    StoryEngine.loadSceneDB();

    // 初始化基础结构
    if (!gs.story) gs.story = { energy: 30, maxEnergy: 30, dailyExploreCount: 0 };
    ['deck', 'discard', 'archive', 'tags'].forEach(k => { if(!gs.story[k]) gs.story[k] = []; });
    
    window.TempState.currentSceneId = null; 
    window.TempState.generatedContext = {}; 
    
    // 初始化牌库
    if (gs.story.deck.length === 0 && gs.story.discard.length === 0) {
        StoryEngine.reloadDeck();
    }

    StoryEngine.calculateMaxEnergy();
    if (typeof gs.story.energy === 'undefined') gs.story.energy = gs.story.maxEnergy;
    
    StoryEngine.checkEnergyLoop();
    if(view.renderStoryPage) view.renderStoryPage();
    StoryEngine.showLocationIdle();
},

// [Mod] 資料適配器
    loadSceneDB: () => {
        window.StoryData = window.StoryData || {};
        window.StoryData.scenes = window.StoryData.scenes || {};
        window.StoryData.pools = window.StoryData.pools || {};

        // === ⚙️ 機率設定區 ===
        const RANDOM_RATIO = 9; // <--- 必須要有這一行
        // ===================
        
        console.log(`🔧 [設定] 隨機倍率已生效: ${RANDOM_RATIO}`);

        if (window.SCENE_DB) {
            for (const [mode, scenes] of Object.entries(window.SCENE_DB)) {
                // 強制重置牌池
                window.StoryData.pools[mode] = { common: [] };
                
                let startSceneCount = 0;
                for (const [id, sceneData] of Object.entries(scenes)) {
                    window.StoryData.scenes[id] = sceneData;
                    if (id.includes('_start') || id.includes('_meet')) {
                        window.StoryData.pools[mode].common.push(id);
                        startSceneCount++;
                    }
                }
                
                // 使用倍率計算
                const targetRandomCount = Math.max(5, startSceneCount * RANDOM_RATIO);
                
                for(let i=0; i < targetRandomCount; i++) {
                    window.StoryData.pools[mode].common.push('GEN_MODULAR');
                }
                
                console.log(`✅ [${mode}] 牌池建構完成: 固定 ${startSceneCount} / 隨機 ${targetRandomCount}`);
            }
        }
    },

    // [Hybrid] 重載牌庫
    reloadDeck: () => {
        const gs = window.GlobalState;
        const mode = gs.settings.mode || 'adventurer';
        
        // 嘗試從 StoryData 讀取設定的牌組
        let pool = [];
        if (window.StoryData && window.StoryData.pools && window.StoryData.pools[mode]) {
            pool = [...window.StoryData.pools[mode].common];
            // 如果有主線進度，也可以在這裡插入 main
        } else {
            // Fallback: 如果沒有設定檔，預設全是隨機生成卡
            pool = ['GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR'];
        }
        // [關鍵新增] Fisher-Yates 洗牌演算法
        // 確保剛載入的牌庫不是「固定在前，隨機在後」，而是徹底打亂
        console.log("🎲 正在對新牌庫進行初始洗牌...");
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
		
        gs.story.deck = pool;
        gs.story.discard = [];
        console.log(`🎴 牌庫已重置，模式: ${mode}，張數: ${pool.length}`);
    },

    // 2. 過場 (Transit)
    transitToEncounter: () => {
        const gs = window.GlobalState;
        if(gs.story.energy < 5){ act.toast("❌ 精力不足 (需要 5)"); act.openStaminaShop(); return; }
        
        gs.story.energy -= 5; 
        gs.story.dailyExploreCount++; 
        act.save(); 
        view.updateStoryHUD();

        view.setStoryMode('event'); 
        view.updateStoryActions([]); 
        
        const loadingText = "探索中......";
        const speed = 80; // 慢速

        // --- 第一遍 ---
        view.appendStoryText(loadingText, () => {
            
            // 停頓 0.5 秒
            setTimeout(() => {
                
                // --- 第二遍 (嵌套在裡面) ---
                // 注意：這裡直接再次呼叫 appendStoryText，它會自動清空畫面重打
                view.appendStoryText(loadingText, () => {
                    
                    // 停頓 1 秒後進入劇情
                    setTimeout(() => {
                        StoryEngine.drawAndPlay();
                    }, 500);

                }, speed); // 第二遍的速度

            }, 250); // 第一遍打完後的停頓

        }, speed); // 第一遍的速度
    },
	
    // 3. [Hybrid Core] 抽牌與分流
    drawAndPlay: () => {
        const gs = window.GlobalState;
        
        // A. 洗牌邏輯 (如果牌庫空了)
        if (gs.story.deck.length === 0) {
            if (gs.story.discard.length > 0) {
                // 將棄牌堆洗回牌庫
                gs.story.deck = [...gs.story.discard];
                gs.story.discard = [];
                // Fisher-Yates Shuffle
                for (let i = gs.story.deck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [gs.story.deck[i], gs.story.deck[j]] = [gs.story.deck[j], gs.story.deck[i]];
                }
                view.appendStoryText("\n(命運的齒輪轉動了... [洗牌])");
            } else {
                // 萬一棄牌也空了 (防呆)，重新載入
                StoryEngine.reloadDeck();
            }
        }

        // B. 抽牌
        const cardId = gs.story.deck.shift();
        window.TempState.currentSceneId = cardId; // 記錄當前卡片 ID 以便歸檔

        console.log(`🎴 抽到卡片: ${cardId}`);

        // C. 分流邏輯
        if (cardId === 'GEN_MODULAR') {
            // -> 走 V29.5 生成邏輯
            StoryEngine.generateModularScene();
        } else {
            // -> 走 V26.8 固定劇本邏輯
            StoryEngine.startFixedScene(cardId);
        }
    },

    // 4. [Fixed Path] 讀取固定劇本 (V26.8 Logic)
    startFixedScene: (sceneId) => {
        const rawScene = window.StoryData?.scenes?.[sceneId];
        
        if (!rawScene) {
            console.warn(`⚠️ 找不到劇本 ID: ${sceneId}，轉為隨機生成。`);
            StoryEngine.generateModularScene();
            return;
        }

        // 處理文本 (支援 {Place} 等簡單替換，如果 V26.8 有用到的話)
        let text = rawScene.text || "(內容缺失)";
        
        // 顯示文本
        view.appendStoryText(text, () => {
            // 發放立即獎勵
            if (rawScene.rewards) StoryEngine.giveRewards(rawScene.rewards);
            if (rawScene.grantsTag) StoryEngine.grantTags(rawScene.grantsTag);

            // 處理選項
            StoryEngine.renderFixedOptions(rawScene);
        });
    },
	
	// [New] 数据适配器：将 SCENE_DB 转换为引擎可读格式
loadSceneDB: () => {
        window.StoryData = window.StoryData || {};
        window.StoryData.scenes = window.StoryData.scenes || {};
        window.StoryData.pools = window.StoryData.pools || {};

        // === [新增] 這裡補上缺失的倍率設定 ===
        const RANDOM_RATIO = 25; 
        // ===================================
        
        console.log(`🔧 [設定] 隨機倍率已生效: ${RANDOM_RATIO}`);

        if (window.SCENE_DB) {
            for (const [mode, scenes] of Object.entries(window.SCENE_DB)) {
                // 強制重置牌池
                window.StoryData.pools[mode] = { common: [] };
                
                let startSceneCount = 0;
                for (const [id, sceneData] of Object.entries(scenes)) {
                    window.StoryData.scenes[id] = sceneData;
                    if (id.includes('_start') || id.includes('_meet')) {
                        window.StoryData.pools[mode].common.push(id);
                        startSceneCount++;
                    }
                }
                
                // === [修正] 使用變數計算數量，不再寫死為 5 ===
                const targetRandomCount = Math.max(5, startSceneCount * RANDOM_RATIO);
                
                for(let i=0; i < targetRandomCount; i++) {
                    window.StoryData.pools[mode].common.push('GEN_MODULAR');
                }
                // ===========================================
                
                console.log(`✅ [${mode}] 牌池建構完成: 固定 ${startSceneCount} / 隨機 ${targetRandomCount}`);
            }
        }
    },

    // 5. [Fixed Path] 渲染固定選項
    renderFixedOptions: (scene) => {
        const gs = window.GlobalState;
        
        // 1. 死亡或結束處理
        if (scene.isDeath) {
            view.updateStoryActions([{ label: "💀 重新開始", style: 'danger', onclick: 'StoryEngine.deathReset()' }]);
            return;
        }
        if (!scene.options || scene.options.length === 0 || scene.end) {
            view.updateStoryActions([{ label: "離開", style: 'primary', onclick: 'StoryEngine.finishScene()' }]);
            return;
        }

        // 2. 選項過濾與格式化
        let visibleOptions = [];

        scene.options.forEach(opt => {
            let label = opt.label || opt.text || "選項";
            let disabled = false;
            let style = opt.style || 'primary';

            // --- A. 硬性隱藏邏輯 (Hidden Requirements) ---
            // 如果劇本要求某個 TAG (如 skill_charm)，而玩家沒有，則直接"不顯示"此選項
            if (opt.req && opt.req.tag) {
                const hasTag = (gs.story.tags || []).includes(opt.req.tag);
                if (!hasTag) return; // [關鍵] 直接跳過，不加入 visibleOptions
                
                // 如果有該技能，自動加上圖示
                label = `🔒 ${label}`; 
            }

            // --- B. 軟性鎖定邏輯 (Disable Requirements) ---
            // 如果是錢不夠、精力不夠、屬性不夠(若是明寫要求)，則顯示但反灰
            if (opt.req) {
                if (opt.req.gold && gs.gold < opt.req.gold) { disabled = true; label += ` (缺金幣)`; }
                if (opt.req.energy && gs.story.energy < opt.req.energy) { disabled = true; label += ` (缺精力)`; }
            }

            // --- C. 檢定提示 (D20 Check) ---
            // 如果有 check 屬性，自動加上骰子圖示，讓玩家知道這是機率性事件
            if (opt.check) {
                // 這裡可以做成只顯示 "🎲 體能檢定"，或是顯示詳細 "🎲 體能 (DC12)"
                // 為了不讓玩家混淆，建議統一格式
                const statName = {str:'體能', dex:'靈巧', int:'智慧', cha:'魅力', chr:'魅力'}[opt.check.stat] || opt.check.stat;
                label = `🎲 ${label} (${statName})`; 
                style = 'secondary'; // 檢定通常用不同顏色
            }

            visibleOptions.push({
                label: label,
                style: style,
                disabled: disabled,
                onclick: () => StoryEngine.handleFixedOption(opt)
            });
        });

        // 3. 渲染
        view.updateStoryActions(visibleOptions);
    },

    // 6. [Fixed Path] 處理固定選項點擊
    handleFixedOption: (opt) => {
        const gs = window.GlobalState;

        // 扣除消耗
        if (opt.req) {
            if (opt.req.gold) gs.gold -= opt.req.gold;
            if (opt.req.energy) gs.story.energy -= opt.req.energy;
            view.updateStoryHUD();
        }

        // 獲得獎勵
        if (opt.rewards) StoryEngine.giveRewards(opt.rewards);
        if (opt.grantsTag) StoryEngine.grantTags(opt.grantsTag);

        // A. 檢定邏輯 (Check)
        if (opt.check) {
            StoryEngine.runFixedCheck(opt);
            return;
        }

        // B. 跳轉邏輯 (Next)
        if (opt.next) {
            StoryEngine.startFixedScene(opt.next);
            return;
        }

        // C. 結束邏輯 (End)
        if (opt.end) {
            StoryEngine.finishScene();
            return;
        }
        
        // 預設結束
        StoryEngine.finishScene();
    },

    // 7. [Fixed Path] 固定劇本的 D20 檢定
    runFixedCheck: (opt) => {
        const check = opt.check;
        const key = (check.stat || check.attr || 'str').toUpperCase();
        const val = (window.GlobalState.attrs?.[key]?.v) || 1; 
        
        const roll = Math.floor(Math.random() * 20) + 1;
        const bonus = Math.floor(val/2);
        const total = roll + bonus;
        const isSuccess = total >= (check.val || 10);

        view.appendInlineCheckResult(key, total, isSuccess);
        
        setTimeout(() => {
            const nextSceneId = isSuccess ? opt.pass : opt.fail;
            if (nextSceneId) {
                StoryEngine.startFixedScene(nextSceneId);
            } else {
                // 如果沒有指定跳轉，就結束
                StoryEngine.finishScene();
            }
        }, 1200);
    },

    // 8. [Ending] 結束場景與歸檔 (混合引擎關鍵)
    finishScene: () => {
        const gs = window.GlobalState;
        const currentId = window.TempState.currentSceneId;
        
        // 歸檔邏輯：
        // 如果是 GEN_MODULAR，直接進棄牌堆 (或者不進，看您想不想重複抽到隨機卡)
        // 為了讓隨機卡能循環，我們把它放回棄牌堆
        if (currentId) {
            gs.story.discard.push(currentId);
        }
        
        // 回到閒置
        StoryEngine.showLocationIdle();
    },

    // ============================================
    // 以下為 V29.5 原有的生成模組 (Generative Modules)
    // ============================================

    showLocationIdle: () => {
        // 從資料庫隨機抓一句氛圍句
        const lines = window.StoryData.learningRules?.idleLines;
        let idleText = "...";
        
        if (lines && lines.length > 0) {
            const lineObj = lines[Math.floor(Math.random() * lines.length)];
            // 閒置時使用設定語言或預設中文 (這裡加入強制中文鎖)
            if (!StoryEngine.isLearningActive()) {
                idleText = lineObj['zh'];
            } else {
                const lang = window.GlobalState.settings.targetLang === 'mix' ? 'zh' : (window.GlobalState.settings.targetLang || 'zh');
                idleText = lineObj[lang] || lineObj['zh'] || "...";
            }
        }

        view.setIdleText(idleText);
        view.setStoryMode('idle'); 
    },

    generateModularScene: () => {
        window.TempState.generatedContext = {}; 
        const rules = window.StoryData.learningRules;
        
        if (!rules || !rules.patterns) {
             view.setStoryMode('event');
             view.appendStoryText("資料讀取中...");
             return;
        }

        let narrativeLang = 'zh'; 
        if (StoryEngine.isLearningActive()) {
            narrativeLang = window.GlobalState.settings.targetLang || 'mix';
            if (narrativeLang === 'mix') {
                const pool = ['jp', 'en', 'kr', 'fr', 'es'];
                narrativeLang = pool[Math.floor(Math.random() * pool.length)];
            }
        }
        window.TempState.narrativeLang = narrativeLang; 

        const setupPats = rules.patterns.setups;
        const confPats = rules.patterns.conflicts;
        const sPat = setupPats[Math.floor(Math.random() * setupPats.length)];
        const cPat = confPats[Math.floor(Math.random() * confPats.length)];

        const sText = StoryEngine.getLocaleText(sPat.templates, narrativeLang);
        const cText = StoryEngine.getLocaleText(cPat.templates, narrativeLang);
        
        let fullText = sText + "\n\n" + cText;
        fullText = StoryEngine.parseTags(fullText, narrativeLang);

        const dynamicOptions = StoryEngine.generateContextOptions();

        const sc = { 
            id: 'gen_mod_' + Date.now(), 
            text: fullText, 
            options: dynamicOptions
        };
        StoryEngine.renderSceneContent(sc);
    },

    generateContextOptions: () => {
        const ctx = window.TempState.generatedContext || {};
        const rules = window.StoryData.learningRules?.optionRules || [];
        
        let allTags = [];
        Object.values(ctx).forEach(obj => { if (obj.contextTags) allTags.push(...obj.contextTags); });

        let possibleOptions = [];

        rules.forEach(rule => {
            // 1. 規則層級檢查
            if (allTags.includes(rule.reqTag)) {
                if (rule.reqSkillTag && !StoryEngine.hasTag(rule.reqSkillTag)) return; 

                rule.options.forEach(opt => {
                    let newOpt = { ...opt };

                    // 2. 選項層級檢查 (沒技能就隱藏)
                    if (newOpt.reqSkillTag && !StoryEngine.hasTag(newOpt.reqSkillTag)) {
                        return; 
                    }

                    // 3. [視覺優化] 自動添加前綴與後綴
                    const statMap = { 
                        zh: { str:'體能', dex:'靈巧', int:'智力', cha:'魅力', chr:'魅力' },
                        en: { str:'STR', dex:'DEX', int:'INT', cha:'CHA', chr:'CHA' },
                        jp: { str:'筋力', dex:'敏捷', int:'知力', cha:'魅力', chr:'魅力' }
                    };

                    ['zh','en','jp'].forEach(k => {
                         if (!newOpt.label[k]) return;

                         // A. 處理技能前綴 (✨)
                         if(newOpt.reqSkillTag && !newOpt.label[k].includes('✨')) {
                             newOpt.label[k] = `✨ ${newOpt.label[k]}`;
                         }
                         
                         // B. [關鍵新增] 處理檢定後綴 (🎲)
                         // 如果有 check 屬性，自動補上 (🎲靈巧)
                         if (newOpt.check) {
                             const statKey = newOpt.check.stat;
                             const statName = statMap[k][statKey] || statKey.toUpperCase();
                             // 防止重複添加
                             if (!newOpt.label[k].includes('🎲')) {
                                 newOpt.label[k] += ` (🎲${statName})`;
                             }
                         }
                    });

                    // 4. 處理物品撿取邏輯
                    if (newOpt.action === 'pickup_generated_item') {
                          newOpt.onclick = () => {
                              const itemObj = ctx['Item'];
                              if (itemObj && itemObj.playerTag) {
                                  StoryEngine.grantTags([itemObj.playerTag]);
                                  const itemName = StoryEngine.getLocaleText(itemObj.text);
                                  if(window.act && act.toast) act.toast(`🎁 獲得 ${itemName}`);
                              }
                              StoryEngine.showOutro(newOpt.outro || 'generic');
                          };
                    }
                    possibleOptions.push(newOpt);
                });
            }
        });

        const highPrio = possibleOptions.filter(o => o.priority === 'high');
        const lowPrio = possibleOptions.filter(o => o.priority !== 'high');
        let finalOptions = [];

        highPrio.sort(() => Math.random() - 0.5);
        lowPrio.sort(() => Math.random() - 0.5);

        finalOptions.push(...highPrio.slice(0, 2));

        if (lowPrio.length > 0) {
            finalOptions.push(lowPrio[0]);
        } else if (highPrio.length > 2) {
            finalOptions.push(highPrio[2]);
        }

        while (finalOptions.length < 3) {
            const remainingHigh = highPrio.slice(2).filter(o => !finalOptions.includes(o));
            if (remainingHigh.length > 0) { finalOptions.push(remainingHigh[0]); continue; }
            const remainingLow = lowPrio.slice(1).filter(o => !finalOptions.includes(o));
            if (remainingLow.length > 0) { finalOptions.push(remainingLow[0]); continue; }
            break; 
        }

        if (finalOptions.length === 0) {
            finalOptions.push({ 
                label: { zh:"離開", en:"Leave", jp:"立ち去る" }, 
                style:'normal',
                onclick: () => StoryEngine.showOutro("generic")
            });
        }
        return finalOptions;
    },

    renderSceneContent: (s) => { 
        window.TempState.currentSceneData = s; 
        let text = StoryEngine.getLocaleText(s.text, window.TempState.narrativeLang);
        text = StoryEngine.parseTags(text, window.TempState.narrativeLang);
        view.updateStoryActions([]); 
        view.appendStoryText(text, () => StoryEngine.onTextComplete(s, s.options)); 
    },

    onTextComplete: (s, options) => {
        const btns = options.map(o => {
            let lbl = StoryEngine.parseTags(StoryEngine.getLocaleText(o.label));
            let clickFunc = o.onclick; 
            if (!clickFunc) clickFunc = () => StoryEngine.handleOption(o);

            return { 
                label: lbl, 
                style: o.style || 'normal', 
                priority: o.priority,
                disabled: false, 
                onclick: clickFunc 
            };
        });
        view.updateStoryActions(btns);
    },

    handleOption: (opt) => {
        if (window.TempState.isRendering) return;
        const gs = window.GlobalState;
        
        if (opt.req) {
            if (opt.req.gold && gs.gold < opt.req.gold) { act.toast(`❌ 金幣不足`); return; }
            if (opt.req.energy && gs.story.energy < opt.req.energy) { act.toast(`❌ 精力不足`); return; }
            if (opt.req.tag && !StoryEngine.hasTag(opt.req.tag)) { act.toast(`❌ 條件未滿足`); return; }
            
            if (opt.req.gold) gs.gold -= opt.req.gold;
            if (opt.req.energy) { gs.story.energy -= opt.req.energy; view.updateStoryHUD(); }
        }

        view.lockActions();
        
        if (opt.check) {
            StoryEngine.runInlineCheck(opt);
            return;
        }
        StoryEngine.resolveAction(opt);
    },

    resolveAction: (opt) => {
        if (opt.rewards) StoryEngine.giveRewards(opt.rewards);
        if (opt.grantTags) StoryEngine.grantTags(opt.grantTags);

        const outroType = opt.outro || 'generic';
        setTimeout(() => {
            StoryEngine.showOutro(outroType);
        }, 500);
    },

    showOutro: (type) => {
        const outroLib = window.StoryData.learningRules?.outroLines;
        if (!outroLib) { StoryEngine.showLocationIdle(); return; } 

        const templateObj = outroLib[type] || outroLib['generic'];
        
        // 確保結語語言與本場景一致 (如果是學習模式)
        const lang = window.TempState.narrativeLang || 'zh';
        let text = templateObj['zh'];

        // [Fix] 強制鎖定檢查
        if (StoryEngine.isLearningActive()) {
            text = templateObj[lang] || templateObj['en'] || templateObj['zh'];
        }

        view.appendStoryText(text, () => {
            view.updateStoryActions([{
                label: { zh:"離開", en:"Leave", jp:"立ち去る" }[lang] || "Leave",
                style: 'primary',
                onclick: () => StoryEngine.finishScene() // 這裡會觸發歸檔與回到 Idle
            }]);
        });
    },

    runInlineCheck: (opt) => {
        const check = opt.check;
        const key = (check.stat || check.attr).toUpperCase();
        const val = (window.GlobalState.attrs?.[key]?.v) || 1; 
        
        const roll = Math.floor(Math.random() * 20) + 1;
        const bonus = Math.floor(val/2);
        const total = roll + bonus;
        const isSuccess = total >= (check.val || 10);

        view.appendInlineCheckResult(key, total, isSuccess);
        
        setTimeout(() => {
            if (isSuccess) {
                StoryEngine.resolveAction({ ...opt, outro: opt.outro || 'victory' }); 
            } else {
                StoryEngine.showOutro('escape');
            }
        }, 1200);
    },

    // 輔助函式
    isLearningActive: () => { const gs=window.GlobalState; return gs.unlocks?.learningMode && gs.settings?.learningMode; },
    
    getLocaleText: (content, forceLang) => {
        if (!content) return "";
        if (typeof content === 'string') return content;
        if (!StoryEngine.isLearningActive()) return content['zh'] || Object.values(content)[0];
        if (forceLang) return content[forceLang] || content['en'] || "???";
        const lang = window.GlobalState.settings.targetLang || 'mix';
        if (lang === 'mix') {
            const pool = ['jp', 'en', 'kr', 'fr', 'es'];
            return content[pool[Math.floor(Math.random() * pool.length)]] || content['zh'];
        }
        return content[lang] || content['zh'];
    },

    parseTags: (text, forceLang) => {
        if (!text) return "";
        return text.replace(/\{(\w+)\}/g, (match, tag) => {
            const ctx = window.TempState.generatedContext;
            if (ctx && ctx[tag]) return StoryEngine.getLocaleText(ctx[tag].text, forceLang);
            return StoryEngine.getWord(tag, forceLang);
        });
    },

    getWord: (type, forceLang) => { 
        const wb = window.StoryData; 
        if (wb.learningRules?.wordBanks?.[type]) return StoryEngine.pickRichWord(wb.learningRules.wordBanks[type], type, forceLang);
        return "???";
    },

    pickRichWord: (list, type, forceLang) => {
        let total = list.reduce((a,b)=>a+(b.weight||1),0);
        let r = Math.random() * total;
        let selected = list[0];
        for (const i of list) { r -= (i.weight||1); if (r<=0) { selected=i; break; } }
        if (!window.TempState.generatedContext) window.TempState.generatedContext = {};
        window.TempState.generatedContext[type] = selected;
        return StoryEngine.getLocaleText(selected.text, forceLang);
    },

    hasTag: (t) => (window.GlobalState.story.tags || []).includes(t),
    grantTags: (ts) => { const gs = window.GlobalState; if (!gs.story.tags) gs.story.tags = []; ts.forEach(t => { if (!gs.story.tags.includes(t)) { gs.story.tags.push(t); } }); },
    giveRewards: (rewards) => {
        const gs = window.GlobalState;
        if (!rewards || rewards.length === 0) return;

        let msgParts = []; // 用來收集獎勵文字

        rewards.forEach(r => {
            if (r.type === 'gold') { 
                gs.gold += r.val; 
                msgParts.push(`💰 金幣 +${r.val}`);
            }
            if (r.type === 'exp') { 
                gs.exp += r.val; 
                msgParts.push(`✨ 經驗 +${r.val}`);
                StoryEngine.checkLevelUp(); // 檢查是否升級
            }
            if (r.type === 'energy') { 
                StoryEngine.recoverEnergy(r.val);
                msgParts.push(`⚡ 精力 +${r.val}`);
            }
            if (r.type === 'item') {
                // 如果有道具系統，這裡擴充
                msgParts.push(`🎁 獲得道具`); 
            }
        });

        // 更新介面
        view.updateStoryHUD();

        // 彈出 Toast
        if (msgParts.length > 0 && window.act && act.toast) {
            act.toast(msgParts.join("，"));
        }
    },
    calculateMaxEnergy: () => 30 + (Math.max(1, window.GlobalState.lv||1)-1)*2,
    checkLevelUp: () => { const gs=window.GlobalState; if(!gs.maxExp)gs.maxExp=100; while(gs.exp>=gs.maxExp){ gs.exp-=gs.maxExp; gs.lv=(gs.lv||1)+1; gs.maxExp=Math.floor(gs.maxExp*1.2); act.toast(`🎉 升級！Lv.${gs.lv}`); act.save(); } },
    checkEnergyLoop: () => { const gs = window.GlobalState; if (!gs) return; if (!gs.story.lastRecTime) gs.story.lastRecTime = Date.now(); const chk = () => { const now = Date.now(); const el = now - gs.story.lastRecTime; if (el >= 360000) { const pt = Math.floor(el / 360000); if (pt > 0) { StoryEngine.recoverEnergy(pt); gs.story.lastRecTime = now - (el % 360000); act.save(); } } }; chk(); setInterval(chk, 10000); },
    recoverEnergy: (pt) => { const gs = window.GlobalState; const max = StoryEngine.calculateMaxEnergy(); const current = Math.max(0, gs.story.energy); gs.story.energy = Math.min(max, current + pt); if (window.view) view.updateStoryHUD(); },
    debugInfo: () => console.log(window.GlobalState.story),
    
    // [Fix] 語言切換
    setLang: (val) => {
        const gs = window.GlobalState;
        if (!gs.settings) gs.settings = {};
        gs.settings.targetLang = val;
        act.save();
        console.log(`語言已切換為: ${val}`);
    },
    
    // [Fix] 死亡重置 (讓舊劇本的 Death Scene 能呼叫)
    deathReset: () => {
        const gs = window.GlobalState;
        act.toast("☠️ 你已死亡！進度重置。");
        gs.story.energy = 30;
        gs.story.tags = [];
        gs.story.deck = [];
        gs.story.discard = [];
        StoryEngine.enterMode();
    }
};

window.act.enterStoryMode = StoryEngine.enterMode;
window.act.exploreAdventure = StoryEngine.explore;
window.act.setLang = StoryEngine.setLang;
window.StoryEngine = StoryEngine;