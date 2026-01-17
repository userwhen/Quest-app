/* js/data_scenes.js - V18.0 Integrated Data (Structure + Content) */

// 確保 Config 存在 (閒置文本)
window.GameConfig = window.GameConfig || {};
window.GameConfig.StoryIdleTexts = [
    "微風吹過，一切都很平靜。",
    "今天似乎是個探險的好日子。",
    "你在周圍徘徊，猶豫著是否要深入。",
    "空氣很清新，但總覺得有人在盯著你..."
];

window.StoryData = {
    // ==========================================
    // 1. 動態詞庫 (Living WordBank)
    // 引擎會根據 bonus 中的 tag 動態調整權重
    // ==========================================
    wordBank: {
        Person: {
            common: [
                { text: "衛兵", weight: 10 },
                { text: "醉漢", weight: 10 },
                { text: "流浪商人", weight: 5 },
                { text: "村長", weight: 5 }
            ],
            noble: [
                { text: "國王", weight: 1, bonus: { tag: "lucky", add: 50 } }, 
                { text: "伯爵", weight: 5 },
                { text: "傲慢的貴婦", weight: 5 }
            ],
            danger: [
                { text: "刺客", weight: 5, bonus: { tag: "wanted", add: 100 } }, // 通緝犯容易遇到刺客
                { text: "強盜", weight: 10 },
                { text: "哥布林", weight: 8 },
                { text: "賈府家丁", weight: 0, bonus: { tag: "offended_feng", add: 50 } } // 得罪鳳姐後才會出現
            ]
        },
        Place: {
            common: [ { text: "廣場" }, { text: "酒館" }, { text: "市場" }, { text: "大路" } ],
            danger: [ { text: "暗巷" }, { text: "廢棄礦坑" }, { text: "陰森森林" }, { text: "沼澤" } ]
        },
        Item: [
            { text: "金懷錶", weight: 2, bonus: { tag: "rich", add: 100 } }, 
            { text: "生鏽的短劍", weight: 10 },
            { text: "情書", weight: 5 },
            { text: "一袋金幣", weight: 3 }
        ],
        Action: [
            { text: "大聲斥責" }, { text: "偷偷塞給他東西" }, { text: "試圖兜售商品" },
            { text: "驚慌地逃跑" }, { text: "對他點頭致意" }, { text: "無視他" }
        ]
    },

    // ==========================================
    // 2. 隨機生成模板 (With Extensions)
    // ==========================================
    randomTemplates: [
        {
            id: "rnd_01",
            text: "在{Place.common}的角落，你發現了{Item}。正當你撿起來時，一位{Person.common}走過來對你{Action}。",
            weight: 10,
            // [新功能] 模板延伸：如果玩家有特定 Tag，追加劇情與選項
            extensions: [
                {
                    reqTag: "wanted",
                    appendText: "\n...等等，他好像認出你是通緝犯了！",
                    options: [
                        { label: "逃跑", next: "event_run_away" }, // 連接到固定劇本
                        { label: "滅口 (戰鬥)", check: { stat: 'str', val: 12 }, pass: 'event_fight_win', fail: 'event_fight_lose' }
                    ]
                }
            ]
        },
        {
            id: "rnd_02",
            text: "你迷路走進了{Place.danger}，陰影中一位{Person.danger}出現了！",
            weight: 5,
            reqTag: "unlucky" 
        }
    ],

    // ==========================================
    // 3. 牌池定義 (Pools)
    // GEN_TEMPLATE 代表「生成指令卡」
    // ==========================================
    pools: {
        adventurer: {
            // 常駐池 (隨機事件 + 副本入口 + 生成指令)
            common: [
                'GEN_TEMPLATE', 'GEN_TEMPLATE', 'GEN_TEMPLATE', // 放入多張以提高生成機率
                'event_rock', 'event_merchant', 'event_camp', // 單發事件
                'tower_start', 'lotr_start', 'dwarf_mine'     // 長篇副本入口
            ],
            // 主線池 (按順序解鎖)
            main: [
                'main_adv_0', // Lv.1
                'main_adv_1', // Lv.5
                'main_adv_2'  // Lv.10
            ]
        },
        harem: {
            common: [
                'GEN_TEMPLATE', 'GEN_TEMPLATE',
                'city_meet', 'palace_tea', 'royal_select',
                'moon_invite', 'red_start'
            ],
            main: ['main_harem_0']
        }
    },

    // ==========================================
    // 4. 劇本字典 (Scenes - Flattened)
    // ==========================================
    scenes: {
        // --- 通用單發事件 ---
        'event_run_away': { text: "你使出吃奶的力氣狂奔，總算甩掉了麻煩。", end: true },
        'event_camp': { text: "你發現一個廢棄的營地，稍微休息了一下。", bg: '🔥', rewards: [{ type: 'energy', val: 10 }], end: true },
        
        // [變體示範] 商人事件
        'event_merchant': {
            type: 'variant',
            variants: [
                {
                    reqTag: 'wanted',
                    text: "守衛認出了你的通緝令，拔劍衝了過來！",
                    options: [
                        { label: "戰鬥 (力量)", check: { stat: 'str', val: 12 }, pass: 'event_fight_win', fail: 'event_fight_lose' }
                    ]
                }
            ],
            default: {
                text: "一位旅行商人在路邊休息。",
                bg: '⛺',
                options: [
                    { label: "打招呼", end: true },
                    { label: "搶劫 (邪惡)", check: { stat: 'str', val: 10 }, pass: 'event_rob_win', fail: 'event_fight_lose' }
                ]
            }
        },
        'event_fight_win': { text: "你擊敗了對手，搜刮了一些戰利品。", rewards: [{type:'gold', val:50}], end: true },
        'event_fight_lose': { text: "你被打倒在地，身上的錢被搶光了。", rewards: [{type:'gold', val:-100}], reset: true, end: true }, // reset 代表死亡
        'event_rob_win': { text: "你搶走了商人的貨物，獲得了惡名。", rewards: [{type:'gold', val:200}], grantsTag: ['wanted'], end: true },

        // --- 巨石事件 (推石頭) ---
        'event_rock': {
            text: "巨大的落石擋住了去路。",
            bg: '🪨',
            options: [
                { label: "推開 (力量)", check: { stat: 'str', val: 10 }, pass: 'rock_win', fail: 'rock_lose' },
                { label: "繞路", end: true }
            ]
        },
        'rock_win': { text: "你推開巨石，發現下面壓著寶藏！", rewards: [{type:'gold', val:100}], grantsTag: ['strong_man'], end: true },
        'rock_lose': { text: "巨石紋絲不動，你反而扭傷了腰。", rewards: [{type:'energy', val:-5}], end: true },

        // --- [主線] 冒險者 ---
        'main_adv_0': {
            index: 0, 
            title: "序章：冒險起點",
            bg: '📜',
            text: "你在公會註冊成為冒險者。會長看著你：「新人，先去森林邊緣調查一下吧。」",
            options: [{ label: "接受委託", end: true }] // 結束後自動歸檔 Main
        },
        'main_adv_1': {
            index: 1, reqLv: 5,
            title: "第一章：森林異變",
            bg: '🌲',
            text: "森林裡的野獸變得異常兇猛，你遇到了一隻紅眼的野豬。",
            options: [{ label: "戰鬥", check: { stat: 'str', val: 12 }, pass: 'main_adv_1_win', fail: 'main_adv_1_lose' }]
        },
        'main_adv_1_win': { text: "你擊敗了野豬，發現它是被魔氣感染的。", rewards: [{type:'exp', val:200}], end: true },
        'main_adv_1_lose': { text: "野豬太強了，你只能撤退。", end: true }, // 失敗不歸檔，下次還會抽到
			
		'main_adv_2': {
            index: 2, 
            reqLv: 10, // 假設 10 等
            title: "第二章：迷霧深處",
            bg: '🌫️',
            text: "解決了森林邊緣的騷動後，公會委託你深入迷霧山脈調查源頭。",
            options: [
                { label: "整裝出發", check: { stat: 'vit', val: 12 }, pass: 'main_adv_2_start', fail: 'main_adv_2_tired' }
            ]
        },
        'main_adv_2_start': { text: "你精神飽滿地踏入了山區。", rewards: [{type:'exp', val:300}], end: true },
        'main_adv_2_tired': { text: "山路崎嶇，你還沒到目的地就累壞了。", rewards: [{type:'energy', val:-10}], end: true },
		
        // --- [副本] 詛咒高塔 (簡化版 Entry) ---
        'tower_start': {
            text: "荒原上矗立著一座紫色雷電環繞的古塔。傳說塔頂有許願石。",
            bg: '🗼',
            options: [
                { label: "正面破門 (力量)", check: { stat: 'str', val: 8 }, pass: 'tower_f1', fail: 'tower_dead' },
                { label: "離開", end: true }
            ]
        },
        'tower_f1': { text: "你進入了一樓，這裡到處是石像鬼...", options: [{ label: "繼續上樓", next: 'tower_end' }] }, // 簡化連接
        'tower_end': { text: "你抵達塔頂獲得了寶藏！", rewards: [{type:'gem', val:10}], end: true },
        'tower_dead': { text: "你被塔的防禦魔法轟成了灰燼。", reset: true, end: true },

        // --- [副本] 紅樓夢 (簡化版 Entry) ---
        'red_start': {
            text: "你站在榮國府的大門前。",
            bg: '⛩️',
            options: [
                { label: "遞上紅包 (10G)", req: { gold: 10 }, next: 'red_hall' },
                { label: "硬闖", check: { stat: 'str', val: 15 }, pass: 'red_hall', fail: 'red_beat' }
            ]
        },
        'red_hall': { text: "鳳姐笑著迎了出來：「這位稀客，快請進。」", grantsTag: ['met_feng'], end: true },
        'red_beat': { text: "你被家丁亂棍打出，並且得罪了賈府。", grantsTag: ['offended_feng'], rewards: [{type:'energy', val:-20}], end: true }
    }
};