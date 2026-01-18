/* js/data_scenes.js - V26.0 "Once Upon a Time" Edition */

window.GameConfig = window.GameConfig || {};
// [移除] 舊的靜態 IdleTexts，改用動態生成
window.GameConfig.StoryIdleTexts = []; 

window.StoryData = {
    // ==========================================
    // 1. 故事鏈系統 (Story Chain System)
    // ==========================================
    chain: {
        chance: 0.35, // 35% 機率觸發後續劇情
        connectors: [
            "然而，事情並沒有就此結束...",
            "就在你準備離開時，",
            "突然，情況發生了變化！",
            "你還沒來得及喘口氣，",
            "這時，你發現角落裡還有別的東西...",
            "沒想到，這居然是一個陷阱的開始！"
        ],
        closers: {
            win: [
                "你擦拭了武器上的痕跡，滿意地離開了。",
                "這場勝利讓你信心倍增，你繼續踏上旅程。",
                "你哼著小曲，清點著戰利品離開了現場。"
            ],
            flee: [
                "你氣喘吁吁地逃到了安全的地方。",
                "雖然有些狼狽，但至少保住了性命。",
                "你回頭看了一眼，確認沒有追兵後才敢停下。"
            ],
            neutral: [
                "微風吹過，彷彿什麼都沒發生過。",
                "你拍拍身上的灰塵，繼續探索這片區域。",
                "這裡已經沒有什麼值得留戀的了。",
                "你將這段經歷記在心裡，轉身離去。"
            ]
        }
    },

    // ==========================================
    // 2. 擴充詞庫 (Massive WordBank)
    // ==========================================
    commonWordBank: {
        Weather: [ {text:"晴朗的"}, {text:"陰雨綿綿的"}, {text:"起大霧的"}, {text:"狂風大作的"}, {text:"飄著細雪的"}, {text:"悶熱的"} ],
        Time: [ {text:"清晨"}, {text:"正午"}, {text:"黃昏"}, {text:"深夜"}, {text:"黎明前"}, {text:"午後"} ],
        Atmosphere: [ {text:"空氣中瀰漫著緊張的氣息"}, {text:"周圍安靜得令人發毛"}, {text:"遠處傳來熱鬧的喧囂聲"}, {text:"這裡充滿了腐敗的氣味"}, {text:"空氣中飄來一陣花香"} ],
        Sound: [ {text:"一陣急促的腳步聲"}, {text:"金屬碰撞的聲音"}, {text:"低沉的啜泣聲"}, {text:"詭異的笑聲"}, {text:"草叢的沙沙聲"}, {text:"遠處的鐘聲"} ],
        Adjective: [ {text:"神色慌張的"}, {text:"喝得爛醉的"}, {text:"受傷的"}, {text:"看起來很有錢的"}, {text:"面露兇光的"}, {text:"衣衫襤褸的"}, {text:"全副武裝的"}, {text:"神秘兮兮的"} ]
    },

    wordBanks: {
        // --- 冒險者模式 (RPG風格) ---
        adventurer: {
            Person: [ 
                {text:"衛兵", weight:10}, {text:"醉漢", weight:10}, {text:"流浪商人", weight:8}, 
                {text:"老練的獵人", weight:5}, {text:"吟遊詩人", weight:5}, {text:"賞金獵人", weight:5},
                {text:"哥布林斥候", weight:5}, {text:"強盜", weight:8}, {text:"逃兵", weight:3}, {text:"神秘的法師", weight:2}
            ],
            Place: [ 
                {text:"城鎮廣場"}, {text:"熱鬧的酒館"}, {text:"冒險者公會門口"}, {text:"擁擠的市場"},
                {text:"陰暗的小巷"}, {text:"廢棄礦坑入口"}, {text:"迷霧森林邊緣"}, {text:"泥濘的沼澤地"},
                {text:"古老的遺跡"}, {text:"國境檢查哨"}, {text:"路邊的神龕"}
            ],
            Item: [ 
                {text:"生鏽的短劍"}, {text:"奇怪的藥水"}, {text:"一袋金幣"}, {text:"半張藏寶圖"}, 
                {text:"不知名的獸骨"}, {text:"遺落的日記本"}, {text:"發光的寶石"}, {text:"破損的盾牌"} 
            ]
        },
        // --- [新增] 後宮模式 (宮鬥風格) ---
        harem: {
            Person: [ 
                {text:"小宮女", weight:10}, {text:"敬事房太監", weight:8}, {text:"路過的御醫", weight:5}, 
                {text:"受寵的貴妃", weight:3}, {text:"冷宮棄妃", weight:3}, {text:"巡邏侍衛", weight:8},
                {text:"新進的秀女", weight:5}, {text:"掌事姑姑", weight:5}, {text:"御膳房大廚", weight:4},
                {text:"神秘的黑衣人", weight:1}
            ],
            Place: [ 
                {text:"御花園的涼亭"}, {text:"無人的長廊"}, {text:"冷宮門口"}, {text:"御膳房後門"}, {text:"荷花池畔"},
                {text:"藏書閣"}, {text:"內務府"}, {text:"皇后的寢宮外"}, {text:"假山後面"}, {text:"枯井旁"}
            ],
            Item: [ 
                {text:"精緻的手帕"}, {text:"碎裂的玉佩"}, {text:"一封密信"}, {text:"沾血的髮簪"}, {text:"御賜的糕點"},
                {text:"名貴的胭脂"}, {text:"繡花鞋"}, {text:"香囊"}, {text:"巫蠱娃娃"}
            ]
        }
    },

    // ==========================================
    // 3. 模組化語法 (Modular Grammar)
    // ==========================================
    
    // A. [新增] 氛圍事件 (Ambient) - 用於取代「無事發生」
    // 特點：只有描述，沒有選項，純粹堆疊氣氛
    ambientGrammar: [
        "你走過{Place}，{Atmosphere}。你決定不停留，繼續前進。",
        "在{Place}，你發現了一些{Item}的痕跡，但早已人去樓空。",
        "天色漸暗，{Sound}讓你提高警覺，但什麼也沒發生。",
        "你在{Place}稍作休息，整理了一下裝備。",
        "一陣風吹過，{Place}顯得格外淒涼。",
        "你遇到了一位{Person}，但他匆匆忙忙地離開了，沒有注意到你。"
    ],

    // B. 主要劇情語法 (Main Plot)
    plotGrammar: {
        setups: [
            { text: "這是一個{Weather}{Time}，{Atmosphere}，你在{Place}漫步時，" },
            { text: "當你經過{Place}時，突然聽到{Sound}，" },
            { text: "你在{Place}的角落稍作休息，" },
            { text: "天空突然下起了大雨，你躲在{Place}的屋簷下，" },
            { text: "你無意間在地上撿到了{Item}，正要查看時，" },
            { text: "你迷路了，誤打誤撞來到了一個陌生的{Place}，" }
        ],
        events: [
            { text: "一位{Adjective}{Person}突然從陰影中走了出來。" },
            { text: "你不小心撞到了一位{Person}。" },
            { text: "遠處傳來爭吵聲，一位{Person}向你跑了過來。" },
            { text: "一位{Person}擋住了你的去路。" },
            { text: "你發現一位{Person}正盯著你看。" },
            { text: "你發現地上躺著一位{Adjective}{Person}。" },
            { text: "一位{Person}鬼鬼祟祟地在尋找東西。" }
        ],
        conflicts: [
            // 互動類
            { text: "他看起來遇到了麻煩，詢問你是否能提供幫助。", options: [
                { label: "提供幫助 (消耗 5 精力)", req: { energy: 5 }, rewards: [{type:'exp', val:20}], next: 'event_check_pass' },
                { label: "無視離開", end: true },
                { label: "趁火打劫 (力量)", check: { stat: 'str', val: 10 }, pass: 'event_rob_win', fail: 'event_fight_lose' }
            ]},
            // 衝突類
            { text: "他眼神貪婪，似乎盯上了你身上的財物。", options: [
                { label: "戰鬥 (力量)", check: { stat: 'str', val: 12 }, pass: 'event_fight_win', fail: 'event_fight_lose' },
                { label: "逃跑 (敏捷)", check: { stat: 'dex', val: 10 }, pass: 'event_run_success', fail: 'event_fight_lose' },
                { label: "交出金幣 (50G)", req: { gold: 50 }, rewards: [{type:'gold', val:-50}], next: 'event_robbed' }
            ]},
            // 交易類
            { text: "他神秘兮兮地向你兜售一些「好東西」。", options: [
                { label: "購買 (50G)", req: { gold: 50 }, rewards: [{type:'gold', val:-50}], next: 'event_trade_success' }, 
                { label: "拒絕", end: true },
                { label: "試圖搶劫 (力量)", check: { stat: 'str', val: 14 }, pass: 'event_rob_win', fail: 'event_fight_lose' }
            ]},
            // 誤會類
            { text: "他似乎把你誤認成了別人，情緒非常激動。", options: [
                { label: "解釋 (魅力)", check: { stat: 'chr', val: 12 }, pass: 'event_talk_win', fail: 'event_fight_lose' },
                { label: "動手 (力量)", check: { stat: 'str', val: 12 }, pass: 'event_fight_win', fail: 'event_fight_lose' }
            ]},
            // 物品類
            { text: "他指著那個物品大喊：「那是我的！」", options: [
                { label: "歸還", rewards: [{type:'exp', val:15}], end: true },
                { label: "據為己有 (力量)", check: { stat: 'str', val: 10 }, pass: 'event_item_get', fail: 'event_fight_lose' }
            ]},
            // 傷患類
            { text: "他看起來受了重傷，奄奄一息。", options: [
                { label: "急救 (智力)", check: { stat: 'int', val: 12 }, pass: 'event_check_pass', fail: 'event_check_fail' },
                { label: "搜刮財物", rewards: [{type:'gold', val:30}], grantsTag:['cruel'], end: true },
                { label: "離開", end: true }
            ]}
        ]
    },

    // ==========================================
    // 4. 牌池 (Pools)
    // ==========================================
    pools: {
        adventurer: {
            common: [
                'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR',
                'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR',
                'event_rock', 'event_merchant', 'event_camp', 'event_trap', 'event_chest',
                'tower_start', 'dwarf_mine'
            ],
            main: ['main_adv_0', 'main_adv_1']
        },
        harem: {
            common: [
                'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR',
                'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR',
                'city_meet', 'palace_tea', 'royal_garden'
            ],
            main: ['main_harem_0']
        }
    },

    // ==========================================
    // 5. 劇本字典 (Scenes)
    // ==========================================
    scenes: {
        // 結果類
        'event_robbed': { text: "你破財消災，對方拿著錢滿意地離開了。", end: true },
        'event_check_pass': { text: "你順利解決了問題，對方對你表示感謝。", rewards: [{type:'exp', val:30}], end: true },
        'event_check_fail': { text: "事情搞砸了...你只能狼狽地離開。", rewards: [{type:'energy', val:-5}], end: true },
        'event_run_success': { text: "你腳底抹油，一溜煙就消失在對方視野中。", end: true },
        'event_trade_success': { text: "交易愉快！你獲得了一些物資。", end: true },
        'event_talk_win': { text: "憑藉著三寸不爛之舌，你化解了這場誤會。", rewards: [{type:'exp', val:40}], end: true },
        'event_item_get': { text: "你強行留下了物品，對方敢怒不敢言。", rewards: [{type:'gold', val:50}], grantsTag:['greedy'], end: true },
        'event_rob_win': { text: "你搶走了對方的財物，這下你成了通緝犯。", rewards: [{type:'gold', val:100}], grantsTag: ['wanted'], end: true },
        'event_fight_win': { text: "經過一番激戰，你擊敗了對手！", rewards: [{type:'exp', val:50}, {type:'gold', val:20}], end: true },
        'event_fight_lose': { text: "你被打得鼻青臉腫，身上的錢也被搜刮一空。", rewards: [{type:'energy', val:-10}, {type:'gold', val:-50}], end: true },

        // 小劇本
        'event_camp': { text: "你發現一個廢棄的營地，營火還有餘溫。你在這裡稍作休息。", bg: '🔥', rewards: [{ type: 'energy', val: 15 }], end: true },
        'event_trap': { 
            text: "小心！你腳下踩到了獵人的捕獸夾！", 
            options: [
                { label: "蠻力扳開 (力量)", check: { stat: 'str', val: 12 }, pass: 'trap_esc', fail: 'trap_hurt' },
                { label: "細心解除 (智力)", check: { stat: 'int', val: 12 }, pass: 'trap_esc', fail: 'trap_hurt' }
            ]
        },
        'trap_esc': { text: "你有驚無險地脫困了。", rewards: [{type:'exp', val:20}], end: true },
        'trap_hurt': { text: "夾子咬住了你的腿，你受傷了。", rewards: [{type:'energy', val:-20}], end: true },
        'event_chest': {
            text: "路邊的草叢裡藏著一個舊寶箱。", bg: '📦',
            options: [
                { label: "打開", rewards: [{type:'gold', val:30}], end: true },
                { label: "踢它一腳", check: {stat:'luck', val:10}, pass: 'chest_lucky', fail: 'chest_mimic'}
            ]
        },
        'chest_lucky': { text: "寶箱被踢開了，掉出一顆寶石！", rewards: [{type:'gem', val:1}], end: true },
        'chest_mimic': { text: "那是寶箱怪！它咬了你一口！", rewards: [{type:'energy', val:-15}], end: true },
        'event_merchant': {
            text: "一位旅行商人在路邊休息，他的貨物堆積如山。", bg: '⛺',
            options: [
                { label: "打招呼", end: true },
                { label: "搶劫 (邪惡)", check: { stat: 'str', val: 10 }, pass: 'event_rob_win', fail: 'event_fight_lose' }
            ]
        },
        'event_rock': {
            text: "巨大的落石擋住了去路，看來是最近的山崩造成的。", bg: '🪨',
            options: [
                { label: "推開 (力量)", check: { stat: 'str', val: 10 }, pass: 'rock_win', fail: 'rock_lose' },
                { label: "繞路", end: true }
            ]
        },
        'rock_win': { text: "你推開巨石，發現下面壓著一個寶箱！", rewards: [{type:'gold', val:100}], grantsTag: ['strong_man'], end: true },
        'rock_lose': { text: "巨石紋絲不動，你反而扭傷了腰。", rewards: [{type:'energy', val:-5}], end: true },

        // 副本與主線 (保持原樣)
        'dwarf_mine': { text: "你發現了一個古老的矮人礦坑入口。", bg: '⚒️', options: [{ label: "進入", next: 'mine_explore' }, { label: "離開", end: true }] },
        'mine_explore': { text: "坑道深處有一個巨大的秘銀齒輪鎖。", options: [ { label: "暴力拆解 (力量)", check: { stat: 'str', val: 14 }, pass: 'mine_win', fail: 'mine_lose' }, { label: "解鎖 (智力)", check: { stat: 'int', val: 14 }, pass: 'mine_win', fail: 'mine_trap' } ] },
        'mine_win': { text: "大門轟然開啟，你獲得了矮人的古代秘銀！", rewards: [{type:'gold', val:500}, {type:'exp', val:100}], end: true },
        'mine_lose': { text: "你弄壞了機關，大門永遠鎖死了。", end: true },
        'mine_trap': { text: "觸發了毒氣陷阱！你倉皇逃出。", rewards: [{type:'energy', val:-20}], end: true },
        'tower_start': { text: "荒原上矗立著一座紫色雷電環繞的古塔。", bg: '🗼', options: [ { label: "正面破門", check: { stat: 'str', val: 10 }, pass: 'tower_enter', fail: 'tower_fail' }, { label: "離開", end: true } ] },
        'tower_enter': { text: "你進入了一樓，這裡到處是石像鬼...", options: [{ label: "戰鬥", next: 'tower_end' }] }, 
        'tower_end': { text: "你歷經艱辛抵達塔頂，獲得了寶藏！", rewards: [{type:'gem', val:10}], end: true },
        'tower_fail': { text: "你被塔的防禦魔法轟飛了。", rewards: [{type:'energy', val:-10}], end: true },
        'main_adv_0': { index: 0, title: "序章", bg: '📜', text: "你在公會註冊成為冒險者。會長看著你：「新人，先去森林邊緣調查一下吧。」", options: [{ label: "接受委託", end: true }] },
        'main_adv_1': { index: 1, reqLv: 2, title: "第一章", bg: '🌲', text: "森林裡的野獸變得異常兇猛，你遇到了一隻紅眼的野豬。", options: [{ label: "戰鬥", check: { stat: 'str', val: 12 }, pass: 'main_adv_1_win', fail: 'main_adv_1_lose' }] },
        'main_adv_1_win': { text: "你擊敗了野豬，發現它是被魔氣感染的。", rewards: [{type:'exp', val:200}], end: true },
        'main_adv_1_lose': { text: "野豬太強了，你只能撤退。", end: true },
        'death_scene': { text: "你的視線逐漸模糊，意識陷入了黑暗...\n(你已死亡)", bg: '💀', isDeath: true, end: true }
    }
};