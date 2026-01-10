/* js/data_scenes.js - V12.0 Story Database (Deck & Variants) */

window.StoryData = {
    // 1. [新] 隨機詞庫 (注意格式： wordBank 接冒號)
    wordBank: {
        Person: {
            common: [
                { text: "衛兵", baseWeight: 10 },
                { text: "醉漢", baseWeight: 10 },
                { text: "流浪商人", baseWeight: 5 },
                { text: "村長", baseWeight: 5 }
            ],
            noble: [
                { text: "國王", baseWeight: 1, bonus: { tag: "lucky", add: 50 } }, 
                { text: "伯爵", baseWeight: 5 },
                { text: "傲慢的貴婦", baseWeight: 5 }
            ],
            danger: [
                { text: "刺客", baseWeight: 5, req: "wanted" }, 
                { text: "強盜", baseWeight: 10 },
                { text: "哥布林", baseWeight: 8 }
            ]
        },
        Place: {
            common: [ { text: "廣場" }, { text: "酒館" }, { text: "市場" }, { text: "大路" } ],
            danger: [ { text: "暗巷" }, { text: "廢棄礦坑" }, { text: "陰森森林" }, { text: "沼澤" } ]
        },
        Item: [
            { text: "金懷錶", baseWeight: 2, bonus: { tag: "rich", add: 100 }, grant: "rich" }, 
            { text: "生鏽的短劍", baseWeight: 10 },
            { text: "奇怪的藥水", baseWeight: 5, grant: "poisoned" }, 
            { text: "情書", baseWeight: 5 },
            { text: "一袋金幣", baseWeight: 3, grant: "rich" }
        ],
        Action: [
            { text: "大聲斥責" }, 
            { text: "偷偷塞給他東西" }, 
            { text: "試圖兜售商品" }, 
            { text: "驚慌地逃跑" }, 
            { text: "對他點頭致意" },
            { text: "無視他" },
            { text: "邀請他喝一杯" }
        ]
    }, // <--- 這裡記得加逗號！

    // 2. [新] 隨機模板 (注意格式： randomTemplates 接冒號)
    randomTemplates: [
        {
            id: "rnd_01",
            text: "在{Place.common}的角落，你發現了{Item}。正當你撿起來時，一位{Person.common}走過來對你{Action}。",
            weight: 10
        },
        {
            id: "rnd_02",
            text: "你迷路走進了{Place.danger}，陰影中一位{Person.danger}出現了！",
            weight: 5,
            reqTag: "unlucky" 
        },
        {
            id: "rnd_03",
            text: "這是一個美好的日子，{Person.noble}在{Place.common}巡視，似乎在尋找{Item}。",
            weight: 5
        }
    ],
	
    // [1. 牌池定義]
    // 根據 settings.mode (預設 adventurer) 決定讀取哪一區
    pools: {
        adventurer: {
            // 常駐卡：無限循環，洗牌時會回到牌庫
            common: [
                'event_rock', 
                'event_merchant', 
                'event_camp', 
                'event_strange_statue'
            ],
            // 主線卡：一次性，依序觸發 (index 0 -> 1 -> ...)，升級時解鎖注入
            main: [
                'main_adv_0', // Lv.5 解鎖
                'main_adv_1', // Lv.10 解鎖
                'main_adv_2'  // Lv.15 解鎖
            ]
        },
        // (預留) 后宮模式牌池
        harem: {
            common: ['event_tea_party', 'event_gossip'],
            main: ['main_harem_0']
        }
    },

    // [2. 劇本字典]
    // 所有的事件內容都在這裡
    scenes: {
        
        // --- [範例 A] 變體劇本 (蝴蝶效應核心) ---
        // ID: event_merchant
        // 邏輯：根據玩家身上的 Tag 顯示完全不同的劇情
        'event_merchant': {
            type: 'variant', 
            variants: [
                {
                    reqTag: 'wanted', // [蝴蝶效應 1] 如果你是通緝犯
                    text: "守衛認出了你的臉，大喊：「抓住他！」",
                    options: [
                        { label: "拔腿就跑", next: 'event_run_away' },
                        { label: "戰鬥 (D20)", next: 'event_fight_guard', style: 'danger' }
                    ]
                },
                {
                    reqTag: 'saved_merchant', // [蝴蝶效應 2] 如果你救過商人
                    text: "守衛認得你是救了商人的英雄，恭敬地放行，並塞給你一袋謝禮。",
                    rewards: [
                        { type: 'gold', val: 50 },
                        { type: 'reputation', val: 10 }
                    ],
                    next: null // 結束事件
                }
            ],
            // 預設劇情 (若無特殊 Tag)
            default: {
                text: "你在城門口遇到一位守衛，他面無表情地看著你。",
                options: [
                    { label: "點頭致意", next: null },
                    { 
                        label: "賄賂 (10 Gold)", 
                        req: { gold: 10 }, // 資源需求
                        next: 'event_bribe_guard' 
                    }
                ]
            }
        },
        
        // --- 變體的分支事件 ---
        'event_run_away': {
            type: 'normal',
            text: "你氣喘吁吁地逃到了巷子裡，總算甩掉了守衛。",
            next: null
        },
        'event_fight_guard': {
            type: 'check', // 戰鬥通常是檢定
            text: "守衛拔劍衝來！你需要足夠的武力才能突圍。",
            check: { attr: 'str', dc: 12, pass: 'event_fight_win', fail: 'event_fight_lose' }
        },
        'event_fight_win': {
            type: 'normal',
            text: "你擊倒了守衛，並從他身上搜出了一些金幣。",
            rewards: [{ type: 'gold', val: 30 }],
            next: null
        },
        'event_fight_lose': {
            type: 'normal',
            text: "你被打得鼻青臉腫，被關進大牢... (死亡重置)",
            reset: true // [死亡觸發]
        },
        'event_bribe_guard': {
            type: 'normal',
            text: "守衛收下了金幣，告訴你一條通往黑市的捷徑。",
            cost: { gold: 10 }, // 扣除金幣
            grantsTag: ['knows_blackmarket'], // 給予新 Tag
            next: null
        },

        // --- [範例 B] 檢定劇本 (D20) ---
        // ID: event_rock
        'event_rock': {
            type: 'normal', // 先顯示前言，再按選項進入檢定
            text: "前方山路被一塊巨大的落石擋住了。",
            options: [
                { label: "推開巨石 (體能)", next: 'event_rock_check' },
                { label: "繞路離開", next: null }
            ]
        },
        'event_rock_check': {
            type: 'check',
            text: "你氣沉丹田，試圖推動這塊千斤巨石...",
            check: { 
                attr: 'str', 
                dc: 10, 
                pass: 'event_rock_win', 
                fail: 'event_rock_lose' 
            }
        },
        'event_rock_win': {
            type: 'normal',
            text: "巨石轟然滾落！你發現巨石下壓著一個補給箱。",
            rewards: [
                { type: 'item', id: 'item_energy_s' }, // 獲得道具
                { type: 'exp', val: 20 }
            ],
            // 蝴蝶效應起點：獲得「大力士」標籤，未來可能有用
            grantsTag: ['strong_man'], 
            next: null
        },
        'event_rock_lose': {
            type: 'normal',
            text: "巨石紋絲不動，你反而扭傷了腰 (-5 精力)。",
            rewards: [{ type: 'energy', val: -5 }], // 懲罰
            next: null
        },

        // --- [範例 C] 主線劇本 (Sequence) ---
        // 必須包含 index 屬性，用於 StoryEngine 比對 mainProgress
        'main_adv_0': {
            type: 'normal',
            index: 0, // 第一章
            title: "主線：初出茅廬",
            text: "你在公會櫃台完成了註冊，終於成為一名正式的冒險者。會長交給你第一個任務：調查森林異變。",
            options: [
                { label: "接受任務", next: 'main_adv_0_accept' }
            ]
        },
        'main_adv_0_accept': {
            type: 'normal',
            text: "你接過了委託書。這將是你傳奇的開始...",
            rewards: [{ type: 'gold', val: 100 }, { type: 'gem', val: 5 }],
            next: null 
            // 結束後，System 會自動將此卡移入 Archive，並將 mainProgress + 1
        },

        'main_adv_1': {
            type: 'check',
            index: 1, // 第二章
            title: "主線：森林深處",
            text: "你深入森林，發現一隻狂暴的野豬擋在路中間！(Lv.5 強度)",
            check: { attr: 'str', dc: 15, pass: 'main_adv_1_win', fail: 'main_adv_1_lose' }
        },
        'main_adv_1_win': {
            type: 'normal',
            text: "你成功擊退了野豬，發現牠的眼睛呈現詭異的紅色...這背後一定有黑幕。",
            rewards: [{ type: 'exp', val: 100 }],
            next: null
        },
        'main_adv_1_lose': {
            type: 'normal',
            text: "野豬太強了，你只能狼狽逃回公會。",
            // 注意：主線失敗通常不會推進進度 (System 不會 archive)，
            // 這樣玩家下次抽牌時，還會再抽到這張 'main_adv_1'，直到通過為止。
            next: null 
        },

        // --- [範例 D] 純福利/純文本 ---
        'event_camp': {
            type: 'normal',
            text: "你發現一個廢棄的營地，稍微休息了一下。",
            rewards: [{ type: 'energy', val: 5 }],
            next: null
        },
        'event_strange_statue': {
            type: 'choice',
            text: "路邊有一尊奇怪的雕像，似乎缺了一隻眼睛。",
            options: [
                { 
                    label: "放入寶石 (1000 Gold)", // 修正 Label 以匹配 Req
                    req: { gold: 1000 }, 
                    next: 'event_statue_reward' 
                },
                { label: "無視", next: null }
            ]
        },
        
        'event_statue_reward': {
            type: 'normal',
            cost: { gold: 1000 },
            text: "雕像的眼睛發出光芒，你感覺力量湧現！",
            // 蝴蝶效應起點：獲得「大力士」標籤 (未來可用於解鎖 event_rock_win 變體)
            grantsTag: ['strong_man'],  
            next: null
        }
    }
};