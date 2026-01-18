/* js/modules/story300.js - V25.0 Fixed Navigation Logic */
window.act = window.act || {};

// ==========================================
// [Part 1] 視圖 (View) - 保持 V21.0 的穩定 UI
// ==========================================
window.view = window.view || {};

Object.assign(window.view, {
    renderStoryPage: () => {
        const container = document.getElementById('page-story');
        if (!container) return;
        
        const gs = window.GlobalState;
        const currentMax = window.StoryEngine ? StoryEngine.calculateMaxEnergy() : 30;
        const energy = Math.max(0, Math.min(gs.story?.energy ?? currentMax, currentMax));
        const bgStyle = `background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('assets/bg_dungeon.jpg');`; 
        
        const layoutStyle = `
            display: flex; flex-direction: column; 
            width: 100%; height: 100%; 
            background: #111; color: #fff; 
            overflow: hidden; box-sizing: border-box;
            position: relative;
        `;
        
        container.innerHTML = `
            <div style="${layoutStyle}" id="story-layout-inner">
                
                <div class="story-top-bar" style="position:relative; z-index:2; height:60px; padding:0 15px; display:flex; justify-content:space-between; align-items:center; background:rgba(20,20,20,0.95); border-bottom:1px solid #333; flex-shrink:0;">
                    <div class="story-res-grp" style="font-size:1.1rem; color:#ffd700; font-weight:bold;">
                        <span>⚡ <span id="s-energy">${energy}/${currentMax}</span></span>
                        ${ui.btn.sm('+', 'act.openStaminaShop()', 'u-btn-icon-sm')}
                    </div>
                    <div>${ui.btn.secondary('↩', "act.navigate('main')")}</div>
                </div>

                <div class="story-text-area" id="story-text-box" 
                     style="position:relative; z-index:2; flex-shrink: 0; 
                            height: 230px; 
                            margin: 0; padding: 25px 25px; 
                            background: rgba(0, 0, 0, 0.85); 
                            border: 2px solid rgba(255, 215, 0, 0.3); 
                            border-radius: 12px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
                            font-size: 1.2rem; line-height: 1.6; color: #eee; 
                            text-shadow: 1px 1px 2px #000; white-space: pre-wrap;
                            overflow: hidden; cursor: pointer;">
                    <div id="story-content"></div>
                    <div id="story-next-hint" style="position:absolute; bottom:10px; right:20px; color:#ffd700; font-size:1.2rem; animation:bounce 1s infinite; display:none;">▼</div>
                </div>

                <div class="story-stage" style="position:relative; z-index:1; flex: 1; min-height: 0; overflow:hidden; background:#000;">
                     <div id="story-bg-layer" style="position:absolute; top:0; left:0; width:100%; height:100%; background-size:cover; background-position:center; ${bgStyle} transition: all 0.5s;"></div>
                     <div id="story-bg-emoji" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:10rem; opacity:0.2; pointer-events:none;"></div>
                </div>

                <div class="story-action-area" id="story-actions" 
                     style="position:relative; z-index:2; flex-shrink: 0;
                            height: 200px;
                            padding: 15px 20px; 
                            background: rgba(20, 20, 20, 0.95); 
                            border-top: 1px solid rgba(255, 255, 255, 0.1);
                            display: grid; gap: 10px; 
                            align-content: stretch;">
                </div>
            </div>
        `;
        
        if (!document.getElementById('story-content').innerHTML) {
             view.updateStoryActions([{ label: '🔍 開始探索', onclick: 'act.exploreAdventure()', style: 'primary' }]);
        }
        window.TempState.isActionLocked = false;
        
        const textBox = document.getElementById('story-text-box');
        if(textBox) {
            textBox.onclick = () => {
                if (window.TempState.waitingForPageClick && window.TempState.nextPageFunc) {
                    window.TempState.nextPageFunc();
                }
            };
        }
    },

    updateBackground: (bg) => {
        const bgLayer = document.getElementById('story-bg-layer');
        const emojiLayer = document.getElementById('story-bg-emoji');
        if (!bgLayer || !bg) return;
        if (bg.includes('.') || bg.includes('/')) {
            bgLayer.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${bg}')`;
            emojiLayer.innerText = '';
        } else {
            bgLayer.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8))`;
            emojiLayer.innerText = bg;
        }
    },

    appendStoryText: (text, onComplete) => {
        const box = document.getElementById('story-content');
        const hint = document.getElementById('story-next-hint');
        if (!box) return;
        
        const CHARS_PER_PAGE = 80; 
        let chunks = [];
        for (let i = 0; i < text.length; i += CHARS_PER_PAGE) {
            chunks.push(text.substring(i, i + CHARS_PER_PAGE));
        }

        let chunkIndex = 0;

        function showChunk() {
            box.innerHTML = ''; 
            hint.style.display = 'none';
            window.TempState.waitingForPageClick = false;
            
            const chars = chunks[chunkIndex].split('');
            let i = 0;
            window.TempState.isTyping = true;

            function type() {
                if (i < chars.length) {
                    box.textContent += chars[i];
                    i++;
                    setTimeout(type, 30); 
                } else {
                    window.TempState.isTyping = false;
                    chunkIndex++;
                    if (chunkIndex < chunks.length) {
                        hint.style.display = 'block';
                        window.TempState.waitingForPageClick = true;
                        window.TempState.nextPageFunc = showChunk;
                    } else {
                        if (onComplete) onComplete();
                    }
                }
            }
            type();
        }
        showChunk();
    },

    appendInlineCheckResult: (attrKey, total, isSuccess) => {
        const box = document.getElementById('story-content');
        if (!box) return;
        const div = document.createElement('div');
        div.style.marginTop = '10px';
        const color = isSuccess ? '#4caf50' : '#f44336';
        div.innerHTML = `<span style="color:#aaa;">(🎲) (${attrKey}判定)....</span><span style="color:${color}; font-weight:bold;">${isSuccess ? '成功' : '失敗'}</span>`;
        box.appendChild(div);
    },

    updateStoryActions: (actions) => {
        const area = document.getElementById('story-actions');
        if (!area) return;
        
        window.TempState.isActionLocked = false;
        area.style.pointerEvents = 'auto';
        area.style.opacity = '1';

        if (actions.length === 1) {
            area.style.gridTemplateRows = `90px`; 
            area.style.alignContent = 'center'; 
        } else {
            area.style.gridTemplateRows = `repeat(${actions.length}, 1fr)`;
            area.style.alignContent = 'stretch';
        }

        area.innerHTML = actions.map((btn, idx) => {
            const style = `width:100%; height:100%; font-size:1.2rem; border-radius:12px; font-weight:bold; box-shadow:0 4px 8px rgba(0,0,0,0.4);`;
            let btnClass = 'u-btn-primary';
            if(btn.style === 'danger') btnClass = 'u-btn-danger';
            if(btn.style === 'secondary') btnClass = 'u-btn-secondary';
            
            const click = typeof btn.onclick === 'string' ? `onclick="${btn.onclick}"` : `id="s-btn-${idx}"`;
            const disabled = btn.disabled ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';
            return `<button class="u-btn ${btnClass}" style="${style}" ${click} ${disabled}>${btn.label}</button>`;
        }).join('');

        actions.forEach((btn, idx) => {
            if (typeof btn.onclick === 'function' && !btn.disabled) {
                document.getElementById(`s-btn-${idx}`).onclick = btn.onclick;
            }
        });
    },
    
    lockActions: () => { const a=document.getElementById('story-actions'); if(a){ window.TempState.isActionLocked=true; a.style.pointerEvents='none'; a.style.opacity='0.6'; } },
    
    updateStoryHUD: () => { 
        const e=document.getElementById('s-energy'); 
        const max=window.StoryEngine?StoryEngine.calculateMaxEnergy():30; 
        const raw=window.GlobalState?.story?.energy??0;
        const display=Math.max(0, raw);
        if(e)e.innerText=`${display}/${max}`; 
    }
});

// ==========================================
// [Part 2] 引擎核心 (Engine) - 修正版
// ==========================================
const StoryEngine = {
    
    // [核心修正] 進入模式
    enterMode: () => {
        const gs = window.GlobalState;
        
        // 1. 【關鍵修正】這裡必須切換頁面！
        if (window.act.navigate) {
            window.act.navigate('story');
        } else {
            // 如果找不到 navigate，手動強制切換
            document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
            const page = document.getElementById('page-story');
            if (page) page.style.display = 'block';
        }

        // 2. 初始化
        if (!gs.story) gs.story = { energy: 30, maxEnergy: 30, dailyExploreCount: 0 };
        ['deck', 'discard', 'archive', 'tags'].forEach(k => { if(!gs.story[k]) gs.story[k] = []; });
        if (typeof gs.story.mainProgress === 'undefined') gs.story.mainProgress = 0;
        
        // 3. 自動清洗隨機池 (Auto-Flush)
        console.log("🧹 正在清洗隨機劇本池...");
        gs.story.deck = [];      
        gs.story.discard = [];   
        
        // 4. 解卡死：移除殘留的非主線劇本
        const currentId = window.TempState.currentSceneId;
        const mode = gs.settings.mode || 'adventurer';
        if (window.StoryData && window.StoryData.pools) {
            const pool = window.StoryData.pools[mode];
            if (currentId && pool) {
                const isMain = pool.main && pool.main.includes(currentId);
                if (!isMain) {
                    console.warn(`⚠️ 移除殘留隨機劇本 [${currentId}]`);
                    window.TempState.currentSceneData = null;
                    window.TempState.currentSceneId = null;
                    window.TempState.rootSceneId = null;
                }
            }
        }

        act.save();

        StoryEngine.calculateMaxEnergy();
        if (typeof gs.story.energy === 'undefined') gs.story.energy = gs.story.maxEnergy;
        gs.story.energy = Math.max(0, gs.story.energy);

        StoryEngine.checkEnergyLoop();
        view.renderStoryPage();
        
        // [修改] 如果沒有劇情，使用氛圍生成器，而不是 IdleText
        if (!window.TempState.currentSceneData) StoryEngine.generateAmbientScene(); 
        else StoryEngine.renderSceneContent(window.TempState.currentSceneData);
        StoryEngine.debug();
    },
	generateAmbientScene: () => {
        const grammar = window.StoryData.ambientGrammar;
        if (!grammar || grammar.length === 0) return StoryEngine.showIdleText();
        
        const raw = grammar[Math.floor(Math.random() * grammar.length)];
        const full = raw.replace(/\{(\w+)\}/g, (m,t) => StoryEngine.getWord(t));
        
        const scene = {
            id: 'ambient_' + Date.now(),
            text: full,
            bg: '🍃',
            end: true // 氛圍事件直接結束，但可以觸發 Chain
        };
        StoryEngine.renderSceneContent(scene);
    },
    // [新功能] F12 診斷
    debug: () => {
        const gs = window.GlobalState;
        const chance = Math.max(0.1, 1.0 - (gs.story.dailyExploreCount * 0.001));
        console.group("🕵️‍♂️ Story Engine 診斷");
        console.log(`%c🎲 機率: ${(chance * 100).toFixed(1)}%`, "color:green");
        console.log("🏷️ Tags:", gs.story.tags.length ? gs.story.tags : "(無)");
        console.log("📚 Deck:", gs.story.deck.length, "| Discard:", gs.story.discard.length);
        console.log("🎬 Scene:", window.TempState.currentSceneId || "Idle");
        console.groupEnd();
    },

    calculateMaxEnergy: () => {
        const gs = window.GlobalState;
        const lv = Math.max(1, gs.lv || 1);
        let max = 30 + ((lv - 1) * 2); 
        if (max > 100) max = 100;
        gs.story.maxEnergy = max;
        return max;
    },

    checkLevelUp: () => {
        const gs = window.GlobalState;
        if (!gs.maxExp) gs.maxExp = 100;
        while (gs.exp >= gs.maxExp) {
            gs.exp -= gs.maxExp;
            gs.lv = (gs.lv || 1) + 1;
            gs.maxExp = Math.floor(gs.maxExp * 1.2);
            gs.story.energy = StoryEngine.calculateMaxEnergy();
            act.toast(`🎉 升級！Lv.${gs.lv}`);
            act.save();
        }
    },

    // [修改] 探索邏輯：失敗時觸發 Ambient
    explore: () => {
        const gs = window.GlobalState;
        if(gs.story.energy<5){ act.toast("⚡ 精力不足"); act.openStaminaShop(); return; }
        const today=new Date().toDateString(); if(gs.story.lastExploreDate!==today){ gs.story.dailyExploreCount=0; gs.story.lastExploreDate=today; }
        gs.story.energy-=5; gs.story.dailyExploreCount++; act.save(); view.updateStoryHUD();
        
        const chance = Math.max(0.1, 1.0 - (gs.story.dailyExploreCount * 0.001));
        if (Math.random() <= chance) StoryEngine.drawAndPlay();
        else StoryEngine.generateAmbientScene(); // [修改]
    },

    drawAndPlay: () => {
        const gs = window.GlobalState;
        const mode = gs.settings.mode || 'adventurer';

        if (!window.StoryData || !window.StoryData.pools) return view.appendStoryText("❌ DB Error");
        const poolData = window.StoryData.pools[mode];
        if (!poolData) return act.toast(`❌ Mode Error`);

        // A. 主線注入
        if (poolData.main) {
            const nextMainId = poolData.main[gs.story.mainProgress];
            if (nextMainId) {
                const inArchive = gs.story.archive.includes(nextMainId);
                const inDeck = gs.story.deck.includes(nextMainId);
                const inDiscard = gs.story.discard.includes(nextMainId);
                if (!inArchive && !inDeck && !inDiscard) {
                    const insertIdx = Math.floor(Math.random() * (gs.story.deck.length + 1));
                    gs.story.deck.splice(insertIdx, 0, nextMainId);
                    act.save(); 
                }
            }
        }

        // B. 洗牌 (Auto-Flush 保證了這裡通常是乾淨的，需要填充)
        if (gs.story.deck.length === 0 && gs.story.discard.length === 0) {
            if (poolData.common) {
                gs.story.deck = [...poolData.common];
                act.save();
            }
        } else if (gs.story.deck.length === 0 && gs.story.discard.length > 0) {
            // 棄牌堆回收
            gs.story.deck = [...gs.story.discard];
            gs.story.discard = [];
            // Shuffle
            for (let i = gs.story.deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [gs.story.deck[i], gs.story.deck[j]] = [gs.story.deck[j], gs.story.deck[i]];
            }
            act.save();
        }

        // C. 抽牌
        const cardId = gs.story.deck.shift();
        act.save(); 

        window.TempState.rootSceneId = cardId; 

        if (cardId === 'GEN_MODULAR') {
            StoryEngine.generateModularScene(); 
        } else if (cardId) {
            StoryEngine.startScene(cardId);
        } else {
            StoryEngine.showIdleText();
        }
    },

    // [修改] 模組生成器：支援 connector (用於故事鏈)
    generateModularScene: (connector = null) => {
        const g = window.StoryData.plotGrammar;
        if (!g) return StoryEngine.showIdleText();
        const s = g.setups[Math.floor(Math.random() * g.setups.length)];
        const e = g.events[Math.floor(Math.random() * g.events.length)];
        const c = g.conflicts[Math.floor(Math.random() * g.conflicts.length)];
        
        let raw = s.text + e.text + "\n" + c.text;
        if (connector) raw = connector + "\n" + raw; // 如果有連接詞，加在最前面

        const full = raw.replace(/\{(\w+)\}/g, (m,t)=>StoryEngine.getWord(t));
        const sc = { id: 'gen_mod_' + Date.now(), text: full, options: c.options, bg: '🎲' };
        StoryEngine.renderSceneContent(sc);
    },
    
    getWord: (type) => { const mode=window.GlobalState.settings.mode||'adventurer'; const wb=window.StoryData; if(!wb)return "???"; let list=wb.commonWordBank[type]||[]; if(wb.wordBanks[mode]&&wb.wordBanks[mode][type]) list=list.concat(wb.wordBanks[mode][type]); if(list.length===0)return "???"; let total=0; const cands=list.map(i=>{ let w=i.weight||1; if(i.bonus&&StoryEngine.hasTag(i.bonus.tag))w+=i.bonus.add; total+=w; return {text:i.text, w:w}; }); let r=Math.random()*total; for(const c of cands){ r-=c.w; if(r<=0)return c.text; } return cands[0].text; },
    startScene: (id) => { const s=StoryEngine.getVariant(id); if(!s)return StoryEngine.showIdleText(); if(s.bg)view.updateBackground(s.bg); else view.updateBackground('assets/bg_dungeon.jpg'); StoryEngine.renderSceneContent(s); },
    renderSceneContent: (s) => { window.TempState.currentSceneData=s; if(s.id)window.TempState.currentSceneId=s.id; let txt=s.title?`【${s.title}】\n`:""; txt+=s.text; view.updateStoryActions([]); view.appendStoryText(txt, ()=>StoryEngine.onTextComplete(s)); },

    // [核心邏輯] 處理結束、後續 (Chain) 與 收尾 (Closer)
    onTextComplete: (s) => {
        if (s.rewards) StoryEngine.giveRewards(s.rewards);
        if (s.grantsTag) StoryEngine.grantTags(s.grantsTag);
        
        // 如果是結束節點 (End Node)
        if (!s.options || s.options.length === 0) {
            if (s.end) {
                if (s.isDeath) {
                    StoryEngine.finishScene(true);
                } else {
                    // [故事鏈判定]
                    StoryEngine.tryTriggerChain(s);
                }
            } else {
                view.updateStoryActions([{ label: '離開', onclick: 'act.exploreAdventure()', style: 'primary' }]);
            }
            return;
        }
        
        // 標準選項渲染
        const btns = s.options.map(o => {
            let dis = false; let lbl = o.label || o.text;
            if (o.req) {
                if (o.req.gold && window.GlobalState.gold < o.req.gold) dis = true;
                if (o.req.energy && window.GlobalState.story.energy < o.req.energy) dis = true;
                if (o.req.tag && !StoryEngine.hasTag(o.req.tag)) dis = true;
            }
            return { label: lbl, style: o.style || 'primary', disabled: dis, onclick: () => StoryEngine.handleOption(o) };
        });
        view.updateStoryActions(btns);
    },

    // [新功能] 嘗試觸發連鎖
    tryTriggerChain: (currentScene) => {
        const chainData = window.StoryData.chain;
        if (chainData && Math.random() < chainData.chance) {
            // 觸發連鎖！
            const connector = chainData.connectors[Math.floor(Math.random() * chainData.connectors.length)];
            // 生成一個新的隨機事件，並帶入連接詞
            StoryEngine.generateModularScene(connector);
        } else {
            // 沒觸發，正常結束
            StoryEngine.appendCloser(currentScene);
        }
    },

    // [新功能] 追加收尾句
    appendCloser: (scene) => {
        const closers = window.StoryData.chain?.closers;
        if (!closers) return StoryEngine.finishScene(false);

        // 簡單判斷類型 (如果文本包含特定關鍵字)
        let type = 'neutral';
        if (scene.text.includes('擊敗') || scene.text.includes('勝利') || scene.text.includes('獲得')) type = 'win';
        if (scene.text.includes('逃跑') || scene.text.includes('撤退')) type = 'flee';

        const list = closers[type] || closers.neutral;
        const txt = list[Math.floor(Math.random() * list.length)];
        
        // 追加文字，然後顯示離開按鈕
        const box = document.getElementById('story-content');
        if(box) {
            const span = document.createElement('div');
            span.style.marginTop = '15px';
            span.style.color = '#aaa';
            span.style.fontStyle = 'italic';
            span.innerText = txt;
            box.appendChild(span);
            // 捲動到底部
            const con = document.getElementById('story-text-box');
            if(con) con.scrollTop = con.scrollHeight;
        }
        
        // 顯示離開按鈕
        view.updateStoryActions([{ label: '離開', onclick: 'act.exploreAdventure()', style: 'primary' }]);
        
        // 這裡不呼叫 finishScene，直到玩家點擊「離開」按鈕時，exploreAdventure 會自動處理清理
        // 但為了存檔一致性，我們先標記結束
        window.TempState.currentSceneData = null;
        act.save();
    },
    // [核心修復] 在點擊時，實際扣除
    handleOption: (opt) => {
        if (window.TempState.isActionLocked) return;
        view.lockActions();
        const gs = window.GlobalState;
        
        if (opt.req) {
            // 扣除金幣
            if (opt.req.gold) gs.gold -= opt.req.gold;
            // [新增] 扣除精力
            if (opt.req.energy) gs.story.energy -= opt.req.energy;
            
            view.updateStoryHUD();
        }

        if (opt.check) return StoryEngine.runInlineCheck(opt);

        if (opt.next) {
            const n = StoryEngine.getVariant(opt.next);
            if (n) {
                if (n.type === 'check') StoryEngine.runCheck(n);
                else StoryEngine.renderSceneContent(n);
            } else {
                StoryEngine.finishScene();
            }
        } else {
            StoryEngine.finishScene();
        }
    },

    runInlineCheck: (opt) => {
        const check = opt.check;
        const key = (check.stat || check.attr).toUpperCase();
        const val = (window.GlobalState.attrs?.[key]?.v) || 1;
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 20) + 1;
            const bonus = Math.floor(val / 2);
            const total = roll + bonus;
            const success = total >= (check.val || check.dc);
            view.appendInlineCheckResult(key, total, success);
            setTimeout(() => {
                const nid = success ? opt.pass : opt.fail;
                const ns = StoryEngine.getVariant(nid);
                if (ns) {
                    if (ns.reset) StoryEngine.deathReset();
                    else StoryEngine.renderSceneContent(ns);
                } else {
                    StoryEngine.finishScene();
                }
            }, 1000);
        }, 600);
    },

    finishScene: (isDeath) => {
        const gs=window.GlobalState; const rid=window.TempState.rootSceneId; const mode=gs.settings.mode||'adventurer'; const pool=window.StoryData.pools[mode]; 
        if(rid){ let isMain=false; if(pool&&pool.main&&pool.main.includes(rid)){ isMain=true; if(!gs.story.archive.includes(rid)){ gs.story.archive.push(rid); gs.story.mainProgress=(gs.story.mainProgress||0)+1; gs.story.deck=gs.story.deck.filter(i=>i!==rid); gs.story.discard=gs.story.discard.filter(i=>i!==rid); } } if(!isMain&&!rid.startsWith('gen_')){ if(!gs.story.discard.includes(rid)) gs.story.discard.push(rid); } }
        window.TempState.currentSceneData=null; window.TempState.currentSceneId=null; window.TempState.rootSceneId=null; act.save();
        if(isDeath){ view.updateStoryActions([{label:'🔄 重生 (Restart)', onclick:'act.rebirth()', style:'danger'}]); } 
        else { 
            // 這裡通常是玩家點擊了離開，或者系統強制結束
            const box=document.getElementById('story-content'); 
            if(box) box.innerHTML+=`<div style="margin-top:20px; padding-top:10px; border-top:1px dashed #666; color:#888; text-align:center; font-size:0.8rem;">(探索結束)</div>`; 
            const con=document.getElementById('story-text-box'); if(con) con.scrollTop=con.scrollHeight; 
            view.updateStoryActions([{label:'🔍 繼續探索', onclick:'act.exploreAdventure()', style:'primary'}]); 
        }
    },

    getVariant: (id) => { const raw = window.StoryData.scenes[id]; if (!raw) return null; if (raw.type === 'variant' && raw.variants) { for (const v of raw.variants) { if (StoryEngine.hasTag(v.reqTag)) return { ...v, id: id }; } return { ...raw.default, id: id }; } return { ...raw, id: id }; },
    hasTag: (t) => (window.GlobalState.story.tags || []).includes(t),
    grantTags: (ts) => { const gs = window.GlobalState; if (!gs.story.tags) gs.story.tags = []; ts.forEach(t => { if (!gs.story.tags.includes(t)) { gs.story.tags.push(t); act.toast(`🏷️ [${t}]`); } }); },
    
    giveRewards: (rs) => { 
        const gs = window.GlobalState; 
        rs.forEach(r => { 
            if (r.type === 'gold') gs.gold += r.val; 
            if (r.type === 'exp') { gs.exp += r.val; StoryEngine.checkLevelUp(); } 
            if (r.type === 'energy') { gs.story.energy = Math.max(0, gs.story.energy + r.val); } 
        }); 
        view.updateStoryHUD(); 
    },
    
    showIdleText: () => { const txts = window.GameConfig.StoryIdleTexts; const t = txts[Math.floor(Math.random() * txts.length)]; view.appendStoryText(t, () => { view.updateStoryActions([{ label: '🔍 繼續探索', onclick: 'act.exploreAdventure()', style: 'primary' }]); }); },
    
    checkEnergyLoop: () => { const gs = window.GlobalState; if (!gs) return; if (!gs.story.lastRecTime) gs.story.lastRecTime = Date.now(); const chk = () => { const now = Date.now(); const el = now - gs.story.lastRecTime; if (el >= 360000) { const pt = Math.floor(el / 360000); if (pt > 0) { StoryEngine.recoverEnergy(pt); gs.story.lastRecTime = now - (el % 360000); act.save(); } } }; chk(); setInterval(chk, 10000); },
    
    recoverEnergy: (pt) => { const gs = window.GlobalState; const max = StoryEngine.calculateMaxEnergy(); const current = Math.max(0, gs.story.energy); gs.story.energy = Math.min(max, current + pt); if (window.view) view.updateStoryHUD(); },
    
    deathReset: () => { StoryEngine.startScene('death_scene'); },
    
    rebirth: () => { const gs = window.GlobalState; act.toast("🔄 輪迴開始..."); gs.story.energy = gs.story.maxEnergy; gs.story.deck = []; gs.story.discard = []; gs.story.mainProgress = 0; gs.story.archive = []; gs.story.tags = []; act.save(); StoryEngine.enterMode(); },
    
    debugInfo: () => StoryEngine.debug()
};

// 綁定到 window.act
window.act.enterStoryMode = StoryEngine.enterMode;
window.act.exploreAdventure = StoryEngine.explore;
window.act.rebirth = StoryEngine.rebirth;
window.act.debugStory = StoryEngine.debug;
window.StoryEngine = StoryEngine;