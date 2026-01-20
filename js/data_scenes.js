/* js/data_scenes.js - V30.1 Cleaned & Balanced for D20 Engine */

// 確保全域物件存在
window.SCENE_DB = window.SCENE_DB || {};

// ============================================================
// 固定劇本資料庫 (Fixed Scenes Database)
// 這些劇本會透過 StoryEngine.loadSceneDB() 注入到混合引擎中
// ============================================================
window.SCENE_DB = {
    
    // 🛡️ 冒險者模式 (Adventurer)
    adventurer: {
        // --- 基礎森林事件 ---
        'forest_start': {
            text: "你走進了幽暗的森林。樹葉摩擦發出沙沙聲，似乎有什麼東西在草叢中移動...",
            bg: '🌲', 
            options: [
                { text: "深入調查異音", next: 'bear_encounter' },
                { text: "感覺不妙，返回", next: 'leave_safe' }
            ]
        },
        'leave_safe': { text: "你決定不冒險，轉身離開了森林。什麼事也沒發生。", end: true },
        
        'bear_encounter': {
            text: "你撥開草叢，驚見一隻巨大的野熊正準備撲向一名受傷的村民！",
            npc: '🐻', 
            options: [
                // [D20平衡] str 2 -> 10 (普通難度)
                { text: "拔劍戰鬥！(體能檢定)", check: { stat: 'str', val: 10 }, pass: 'save_villager', fail: 'game_over_bear' },
                { text: "太危險了，逃跑", next: 'leave_coward' }
            ]
        },
        'leave_coward': { text: "你選擇了自保，轉身逃跑。身後傳來了村民的慘叫聲...", end: true },
        'game_over_bear': { text: "【檢定失敗】野熊一掌將你拍飛... (死亡)", bg: '💀', isDeath: true, end: true },
        
        'save_villager': {
            text: "【檢定通過】你擊退了野熊！村民驚魂未定地看著你... (幸運檢定)",
            npc: '👨‍🌾',
            // [D20平衡] luc 2 -> 10
            check: { stat: 'luc', val: 10, pass: 'good_villager', fail: 'bad_villager' }
        },
        'good_villager': { text: "【幸運高】村民感激涕零，塞給你一袋金幣。", reward: { gold: 200 }, end: true },
        'bad_villager': { text: "【幸運低】村民大喊是你引來野熊的，並偷走了你的錢。", reward: { gold: -50 }, end: true },

        'well_start': {
            text: "你在森林深處發現一口爬滿青苔的古井，井底隱約閃爍著藍光。",
            bg: '🕳️',
            options: [
                { text: "攀爬下去 (靈巧檢定)", check: { stat: 'dex', val: 11 }, pass: 'well_bottom', fail: 'well_fall' },
                { text: "丟顆石頭聽聲音", next: 'well_echo' }
            ]
        },
        'well_echo': { text: "石頭落地很久才傳來回音。這裡太深了，你決定不冒險。", end: true },
        'well_fall': { text: "【檢定失敗】青苔太滑了！你失足跌落井底... (死亡)", bg: '💀', isDeath: true, end: true },
        'well_bottom': {
            text: "【檢定通過】你靈活地降落井底。面前有一扇刻滿符文的石門，似乎需要解謎。",
            bg: '🚪',
            options: [
                { text: "解讀符文 (智慧檢定)", check: { stat: 'int', val: 12 }, pass: 'door_open', fail: 'door_trap' },
                { text: "暴力破門 (體能檢定)", check: { stat: 'str', val: 14 }, pass: 'door_open', fail: 'door_trap' }
            ]
        },
        'door_trap': { text: "【檢定失敗】你觸發了機關！毒氣噴湧而出，你不得不狼狽逃離。", end: true },
        'door_open': { text: "【檢定通過】石門緩緩打開，裡面堆滿了古代冒險者留下的寶藏！", reward: { gold: 500, exp: 200 }, end: true },

        // --- 格鬥者之巔 ---
        'fight_start': { 
            text: "你站在「格鬥者之巔」的入口。唯有連勝三場才能帶走傳說中的『龍血之杯』。", 
            bg: '🏟️', 
            options: [ 
                { text: "報名參加 (敏捷檢定)", check: { stat: 'dex', val: 10 }, pass: 'round_1', fail: 'disqualified' }, 
                { text: "觀眾席觀察 (智力檢定)", check: { stat: 'int', val: 11 }, pass: 'scout_advantage', fail: 'round_1' } 
            ] 
        },
        'disqualified': { text: "你甚至沒能通過入場測試。", npc: '🛡️', end: true },
        'scout_advantage': { text: "你發現了第一輪對手的破綻！", npc: '🧐', options: [ { text: "進入第一輪", next: 'round_1_easy' } ] },
        'round_1': { text: "第一輪：對手是『碎岩者』巴庫！", npc: '🧔', options: [ { text: "硬碰硬 (力量檢定)", check: { stat: 'str', val: 12 }, pass: 'victory_normal', fail: 'eliminated' } ] },
        'round_1_easy': { text: "因為情報，你輕鬆絆倒了對手晉級！", npc: '🧔', options: [ { text: "領取獎勵", next: 'victory_normal' } ] },
        'victory_normal': { text: "恭喜獲得勝利！", reward: { gold: 300, exp: 100 }, end: true },
        'eliminated': { text: "你被打出了場外。", npc: '💀', end: true },

        // --- 巨龍的試煉 ---
        'dragon_trial': {
            text: "你抵達了紅龍巢穴，巨龍「奧古斯圖斯」睜開一隻眼看著你，問道：『凡人，你為何而來？』",
            bg: '🌋', npc: '🐲',
            options: [
                { text: "實話實說，為了財寶 (魅力)", check: { stat: 'chr', val: 13 }, pass: 'dragon_amused', fail: 'dragon_dinner' },
                { text: "拔劍屠龍 (力量)", check: { stat: 'str', val: 16 }, pass: 'dragon_slayer', fail: 'dragon_dinner' }
            ]
        },
        'dragon_amused': { text: "巨龍覺得你的誠實很有趣，隨手丟給你一塊金磚。", reward: { gold: 1000 }, end: true },
        'dragon_slayer': { text: "你精準地刺入巨龍心臟，成為史詩英雄！", reward: { gold: 5000, exp: 2000 }, end: true },
        'dragon_dinner': { text: "你成了巨龍的下午茶。", bg: '💀', isDeath: true, end: true },

        // --- 矮人地宮 ---
        'dwarf_mine': {
            text: "地宮深處有一個旋轉的齒輪鎖。牆上的古文寫著：『智慧是開門的唯一鑰匙。』",
            bg: '⚒️',
            options: [
                { text: "暴力拆解 (力量)", check: { stat: 'str', val: 14 }, pass: 'mine_treasure', fail: 'mine_cave_in' },
                { text: "分析機械結構 (智力)", check: { stat: 'int', val: 12 }, pass: 'mine_treasure', fail: 'mine_trap' }
            ]
        },
        'mine_treasure': { text: "門開了，裡面堆滿了精煉礦石！", reward: { gold: 400, exp: 150 }, end: true },
        'mine_cave_in': { text: "地宮崩塌了，你被埋在了土石之下。", bg: '💀', isDeath: true, end: true },
        'mine_trap': { text: "暗箭射出，你受傷撤退。", end: true },

        // --- 幽靈船 ---
        'ghost_ship': {
            text: "迷霧中出現一艘破爛的木船，幽靈船長向你招手。你想登船嗎？",
            bg: '🚢', npc: '👻',
            options: [
                { text: "登船尋寶 (運氣)", check: { stat: 'luc', val: 11 }, pass: 'ghost_gold', fail: 'ghost_curse' },
                { text: "無視並繞道", next: 'ghost_leave' }
            ]
        },
        'ghost_gold': { text: "船長送你了幾枚靈魂金幣後消失了。", reward: { gold: 300 }, end: true },
        'ghost_curse': { text: "船長將你變成了新的船員，永世漂泊。", bg: '💀', isDeath: true, end: true },
        'ghost_leave': { text: "你平安回到了岸邊。", end: true },

        // --- 精靈之森 ---
        'elf_forest': {
            text: "精靈女王在月光下彈琴，她要求你接下一段旋律。",
            bg: '🌙', npc: '🧝‍♀️',
            options: [
                { text: "隨機撥動琴弦 (運氣)", check: { stat: 'luc', val: 14 }, pass: 'elf_blessing', fail: 'elf_banish' },
                { text: "優雅地歌唱 (魅力)", check: { stat: 'chr', val: 12 }, pass: 'elf_blessing', fail: 'elf_banish' }
            ]
        },
        'elf_blessing': { text: "女王對你大加讚許，賜予你森林之靈的力量。", reward: { exp: 500 }, end: true },
        'elf_banish': { text: "精靈們覺得你褻瀆了藝術，將你驅逐。", end: true },

        // --- 盜賊工會 ---
        'thief_test': {
            text: "你需要從守衛腰間偷走鑰匙而不被發現。",
            npc: '👮',
            options: [
                { text: "輕手輕腳 (敏捷)", check: { stat: 'dex', val: 12 }, pass: 'thief_win', fail: 'thief_jail' }
            ]
        },
        'thief_win': { text: "完美到手！你現在是工會的一員了。", reward: { gold: 200, exp: 300 }, end: true },
        'thief_jail': { text: "守衛抓住了你的手。你在地牢度過了餘生。", bg: '💀', isDeath: true, end: true },
        
        // --- 詛咒高塔 (5層) ---
        'tower_start': {
            text: "荒原上矗立著一座被紫色雷電環繞的古塔。傳說塔頂有許願石，但進去的人都瘋了。",
            bg: '🗼',
            options: [
                { text: "正面破門 (力量)", check: { stat: 'str', val: 12 }, pass: 'tower_f1_combat', fail: 'tower_fail_entry' },
                { text: "尋找側窗 (靈巧)", check: { stat: 'dex', val: 12 }, pass: 'tower_f1_sneak', fail: 'tower_fail_fall' }
            ]
        },
        'tower_fail_entry': { text: "大門的反擊魔法將你轟成了灰燼。", bg: '💀', isDeath: true, end: true },
        'tower_fail_fall': { text: "你沒抓穩，從塔壁摔落，粉身碎骨。", bg: '💀', isDeath: true, end: true },

        // Layer 2
        'tower_f1_combat': {
            text: "你擊碎大門，但守門的石像鬼甦醒了！",
            npc: '🗿',
            options: [
                { text: "硬碰硬 (體能)", check: { stat: 'str', val: 13 }, pass: 'tower_f2', fail: 'tower_dead_fight' },
                { text: "尋找核心弱點 (智慧)", check: { stat: 'int', val: 11 }, pass: 'tower_f2', fail: 'tower_dead_smart' }
            ]
        },
        'tower_f1_sneak': {
            text: "你溜進二樓，但地板充滿了壓力陷阱。",
            options: [
                { text: "輕功跳躍 (靈巧)", check: { stat: 'dex', val: 13 }, pass: 'tower_f2', fail: 'tower_dead_trap' },
                { text: "解除機關 (智慧)", check: { stat: 'int', val: 11 }, pass: 'tower_f2', fail: 'tower_dead_trap' }
            ]
        },
        'tower_dead_fight': { text: "石像鬼把你砸扁了。", bg: '💀', isDeath: true, end: true },
        'tower_dead_smart': { text: "你分析太慢，被石化光線擊中。", bg: '💀', isDeath: true, end: true },
        'tower_dead_trap': { text: "萬箭穿心。", bg: '💀', isDeath: true, end: true },

        // Layer 3
        'tower_f2': {
            text: "你來到了圖書館層，這裡飄浮著一本會說話的魔導書。『回答我的謎題，或是留下你的靈魂。』",
            npc: '📖',
            options: [
                { text: "接受謎題挑戰 (智慧)", check: { stat: 'int', val: 14 }, pass: 'tower_f3', fail: 'tower_soul_taken' },
                { text: "我只相信拳頭 (體能)", check: { stat: 'str', val: 15 }, pass: 'tower_f3_brute', fail: 'tower_soul_taken' }
            ]
        },
        'tower_soul_taken': { text: "你的靈魂被吸入書中，成為第 1001 個故事。", bg: '💀', isDeath: true, end: true },

        // Layer 4
        'tower_f3': {
            text: "通過考驗，你獲得了魔導書的指引，直接傳送到了塔頂前廳。面前有兩杯水，一杯毒藥，一杯聖水。",
            options: [
                { text: "憑運氣喝左邊 (幸運)", check: { stat: 'luc', val: 12 }, pass: 'tower_top', fail: 'tower_poison' },
                { text: "觀察液體顏色 (智慧)", check: { stat: 'int', val: 13 }, pass: 'tower_top', fail: 'tower_poison' }
            ]
        },
        'tower_f3_brute': {
            text: "你撕碎了魔導書，但在塔頂前廳遭遇了它的守護者——魅魔。",
            npc: '😈',
            options: [
                { text: "抵抗誘惑 (毅力)", check: { stat: 'vit', val: 14 }, pass: 'tower_top', fail: 'tower_charmed' },
                { text: "反向誘惑 (魅力)", check: { stat: 'chr', val: 14 }, pass: 'tower_top_harem', fail: 'tower_charmed' }
            ]
        },
        'tower_poison': { text: "你選錯了，這是劇毒。", bg: '💀', isDeath: true, end: true },
        'tower_charmed': { text: "你成為了魅魔的僕人，永遠留在了塔裡。", bg: '💀', isDeath: true, end: true },

        // Layer 5 (Endings)
        'tower_top': {
            text: "你終於抵達塔頂，許願石就在眼前！",
            bg: '💎',
            options: [
                { text: "許願無盡財富", next: 'tower_end_gold' },
                { text: "許願無上力量", next: 'tower_end_exp' }
            ]
        },
        'tower_top_harem': {
            text: "魅魔愛上了你，並將許願石雙手奉上。",
            bg: '💕',
            options: [
                { text: "帶著魅魔與寶石離開", next: 'tower_end_legend' }
            ]
        },
        'tower_end_gold': { text: "你帶著金山銀山回鄉，成為首富。", reward: { gold: 5000 }, end: true },
        'tower_end_exp': { text: "你獲得了神力，身體充滿了能量！", reward: { exp: 3000 }, end: true },
        'tower_end_legend': { text: "【隱藏結局】你不僅獲得了寶藏，還收服了魔物，你的傳奇將被吟遊詩人傳唱百年！", reward: { gold: 5000, exp: 5000 }, end: true },
        
        // --- 魔戒遠征 (8層) ---
        'lotr_start': {
            text: "你們站在迷霧山脈的絕壁前，面前是傳說中的杜林之門。月光下，精靈語銘文閃閃發光。",
            bg: '🏔️',
            options: [
                { text: "嘗試解讀銘文 (智慧)", check: { stat: 'int', val: 12 }, pass: 'lotr_door_open', fail: 'lotr_watcher' },
                { text: "尋找機關 (靈巧)", check: { stat: 'dex', val: 13 }, pass: 'lotr_door_mech', fail: 'lotr_watcher' }
            ]
        },
        'lotr_watcher': { text: "你解謎太久，水中的觸手怪物「監視者」抓住了你！", bg: '🐙', isDeath: true, end: true },
        'lotr_door_mech': { text: "你觸發了隱藏的槓桿，石門轟然開啟。", next: 'lotr_hall' },
        'lotr_door_open': { text: "你念出了口令『Mellon』，石門緩緩滑開。", next: 'lotr_hall' },

        'lotr_hall': {
            text: "進入礦坑，腐朽的氣息撲面而來。遠處傳來半獸人的鼓聲。",
            bg: '🌑',
            options: [
                { text: "點燃火把前進 (勇氣)", check: { stat: 'vit', val: 10 }, pass: 'lotr_combat_skirmish', fail: 'lotr_ambush' },
                { text: "摸黑潛得 (靈巧)", check: { stat: 'dex', val: 14 }, pass: 'lotr_stealth_path', fail: 'lotr_fall_pit' }
            ]
        },
        'lotr_fall_pit': { text: "黑暗中你踩空了，跌入無底深淵。", bg: '💀', isDeath: true, end: true },
        'lotr_ambush': { text: "火光引來了箭雨，你們在毫無防備下被射殺。", bg: '💀', isDeath: true, end: true },

        'lotr_combat_skirmish': {
            text: "遭遇一小隊哥布林斥候！拔劍吧！",
            npc: '👺',
            options: [
                { text: "旋風斬 (力量)", check: { stat: 'str', val: 13 }, pass: 'lotr_tomb', fail: 'lotr_dead_fight' },
                { text: "魔法飛彈 (智慧)", check: { stat: 'int', val: 13 }, pass: 'lotr_tomb', fail: 'lotr_dead_magic' }
            ]
        },
        'lotr_stealth_path': {
            text: "你像影子一樣穿過了迴廊，發現了一條通往舊礦區的捷徑。",
            options: [
                { text: "探索舊礦區 (幸運)", check: { stat: 'luc', val: 13 }, pass: 'lotr_mithril', fail: 'lotr_lost' }
            ]
        },
        'lotr_dead_fight': { text: "哥布林數量太多，你力竭而亡。", bg: '💀', isDeath: true, end: true },
        'lotr_dead_magic': { text: "魔法反噬，你炸飛了自己。", bg: '💀', isDeath: true, end: true },
        'lotr_lost': { text: "你在舊礦區迷路，最終餓死在黑暗中。", bg: '💀', isDeath: true, end: true },

        'lotr_mithril': {
            text: "你發現了未被開採的秘銀礦脈！",
            reward: { gold: 2000 },
            next: 'lotr_bridge_approach'
        },
        'lotr_tomb': {
            text: "你們來到了一間石室，中央是一具白色的石棺。這時，沉重的腳步聲傳來...是食人妖！",
            npc: '🧟‍♂️',
            options: [
                { text: "正面防禦 (毅力)", check: { stat: 'vit', val: 14 }, pass: 'lotr_bridge_approach', fail: 'lotr_smash' },
                { text: "利用柱子周旋 (靈巧)", check: { stat: 'dex', val: 14 }, pass: 'lotr_bridge_approach', fail: 'lotr_smash' }
            ]
        },
        'lotr_smash': { text: "食人妖的大棒將你砸成了肉泥。", bg: '💀', isDeath: true, end: true },

        'lotr_bridge_approach': {
            text: "前方是深淵上的細橋。背後，一股灼熱的氣息逼近。陰影與火焰...是炎魔！",
            bg: '🔥',
            options: [
                { text: "快跑！過橋！ (靈巧)", check: { stat: 'dex', val: 15 }, pass: 'lotr_escape', fail: 'lotr_fall_bridge' },
                { text: "YOU SHALL NOT PASS! (智慧+力量)", check: { stat: 'int', val: 16 }, pass: 'lotr_stand_ground', fail: 'lotr_dragged_down' }
            ]
        },
        'lotr_fall_bridge': { text: "橋斷了，你沒能跳過去。", bg: '💀', isDeath: true, end: true },
        'lotr_dragged_down': { text: "你成功阻擋了炎魔，但它的火鞭纏住了你的腳踝，將你一同拖入深淵。", bg: '💀', isDeath: true, end: true },

        'lotr_escape': {
            text: "你衝出了東門，看著身後的山脈，慶幸自己活了下來。",
            bg: '⛅',
            options: [
                { text: "前往羅斯洛立安", next: 'lotr_end_survivor' }
            ]
        },
        'lotr_stand_ground': {
            text: "你用盡全力擊碎了橋樑，炎魔墜入深淵！你力竭倒地，但成為了傳說。",
            bg: '✨',
            options: [
                { text: "接受白袍巫師的晉升", next: 'lotr_end_legend' }
            ]
        },
        'lotr_end_survivor': { 
            text: "【倖存者結局】雖然失去了部分隊友，但你帶回了矮人的寶藏與地圖。", 
            reward: { gold: 3000, exp: 2000 }, 
            end: true 
        },
        'lotr_end_legend': { 
            text: "【邁雅結局】你經歷了死亡與重生，現在你是白袍行者，中土世界的守護者。", 
            reward: { gold: 0, exp: 10000 }, 
            end: true 
        }
    },

    // 💕 后宮模式 (Harem)
    harem: {
        'city_meet': {
            text: "在繁華的市集轉角，你撞到了一位抱著書本的少女。",
            bg: '🏙️', npc: '👧',
            options: [
                { text: "溫柔地扶起她 (魅力檢定)", check: { stat: 'chr', val: 10 }, pass: 'meet_good', fail: 'meet_bad' },
                { text: "匆忙道歉離開", next: 'meet_ignore' }
            ]
        },
        'meet_ignore': { text: "你匆匆離開了，少女望著你的背影發呆。", end: true },
        'meet_bad': { text: "【魅力不足】你笨手笨腳地撞翻了更多的書，少女生氣地跑開了。", end: true },
        'meet_good': { text: "【魅力通過】少女臉紅了：「謝...謝謝你。」她似乎對你有好感。", reward: { exp: 50 }, end: true },

        'palace_tea': {
            text: "貴妃在茶中放了不明粉末，眼神閃爍地看著你：「妹妹，喝下這杯茶。」",
            bg: '🍵', npc: '👸',
            options: [
                { text: "藉故打翻茶杯 (敏捷)", check: { stat: 'dex', val: 12 }, pass: 'tea_safe', fail: 'tea_poisoned' },
                { text: "婉言謝絕 (魅力)", check: { stat: 'chr', val: 13 }, pass: 'tea_safe', fail: 'tea_forced' }
            ]
        },
        'tea_safe': { text: "你巧妙躲過一劫，貴妃咬牙切齒卻無可奈何。", reward: { exp: 100 }, end: true },
        'tea_poisoned': { text: "你喝下毒茶，當晚暴斃宮中。", bg: '💀', isDeath: true, end: true },
        'tea_forced': { text: "拒絕無效，貴妃以不敬之名命人掌嘴。", end: true },

        'royal_select': {
            text: "皇帝讓你作詩一首以展才情。",
            bg: '🏮', npc: '🤴',
            options: [
                { text: "吟誦詠花詩 (智力)", check: { stat: 'int', val: 12 }, pass: 'select_concubine', fail: 'select_maid' },
                { text: "大膽直視龍顏 (魅力)", check: { stat: 'chr', val: 14 }, pass: 'select_queen', fail: 'select_death' }
            ]
        },
        'select_queen': { text: "皇上驚艷於你的膽識，冊封你為貴妃！", reward: { gold: 2000, exp: 1000 }, end: true },
        'select_concubine': { text: "皇上點了點頭，冊封你為答應。", reward: { gold: 500 }, end: true },
        'select_maid': { text: "皇上覺得無趣，讓你去浣衣局當差。", end: true },
        'select_death': { text: "大不敬！你被拖出去斬了。", bg: '💀', isDeath: true, end: true },

        'jail_accuse': {
            text: "有人誣陷你偷了皇后的東珠，太監總管要你招認。",
            bg: '🕸️', npc: '🕵️',
            options: [
                { text: "據理力爭 (智力)", check: { stat: 'int', val: 13 }, pass: 'jail_innocent', fail: 'jail_torture' },
                { text: "重金賄賂 (財力/運氣)", check: { stat: 'luc', val: 14 }, pass: 'jail_bribe', fail: 'jail_torture' }
            ]
        },
        'jail_innocent': { text: "你找出了證詞的漏洞，反將一軍！", reward: { gold: 300, exp: 500 }, end: true },
        'jail_bribe': { text: "總管收了錢，放你一馬。", reward: { gold: -200 }, end: true },
        'jail_torture': { text: "你在拷問下含冤而死。", bg: '💀', isDeath: true, end: true },

        'winter_charcoal': {
            text: "冬日炭火被剋扣，侍女凍得發抖，你決定去找內務府理論。",
            bg: '❄️', npc: '🧴',
            options: [
                { text: "以德服人 (魅力)", check: { stat: 'chr', val: 11 }, pass: 'winter_warm', fail: 'winter_cold' },
                { text: "威脅總管 (力量)", check: { stat: 'str', val: 10 }, pass: 'winter_warm', fail: 'winter_cold' }
            ]
        },
        'winter_warm': { text: "內務府乖乖送來紅羅炭，你獲得了人心。", reward: { exp: 200 }, end: true },
        'winter_cold': { text: "不但沒要到炭，還被羞辱了一番。", end: true },

        'royal_baby': {
            text: "你懷孕了，但有人想在你的安胎藥裡下毒。藥碗端到了你面前，味道似乎有點不對...",
            bg: '👶',
            options: [
                { text: "仔細檢查藥渣 (智力)", check: { stat: 'int', val: 14 }, pass: 'baby_safe', fail: 'baby_lost' },
                { text: "相信太醫，喝下", next: 'baby_lost' }
            ]
        },
        'baby_safe': { text: "你機警地發現了藥味異常，將計就計扳倒了皇后！", reward: { gold: 1000, exp: 2000 }, end: true },
        'baby_lost': { text: "你沒能察覺，孩子沒了，你也心碎而死。", bg: '💀', isDeath: true, end: true },

        // --- 月下密會 ---
        'moon_invite': {
            text: "深夜，你收到了一張沒有署名的紙條，約你在御花園荷花池畔相見。",
            bg: '🌙',
            options: [
                { text: "可能是陷阱，不去", next: 'moon_safe' },
                { text: "好奇心驅使，前往", next: 'moon_garden' }
            ]
        },
        'moon_safe': { text: "你燒掉了紙條睡大覺。平安無事的一夜。", end: true },
        'moon_garden': {
            text: "你來到池畔，發現是一個黑影。",
            options: [
                { text: "躲在假山後觀察 (靈巧)", check: { stat: 'dex', val: 11 }, pass: 'moon_spy', fail: 'moon_caught' },
                { text: "大方現身 (魅力)", check: { stat: 'chr', val: 11 }, pass: 'moon_talk', fail: 'moon_caught' }
            ]
        },
        'moon_caught': { text: "你被巡邏侍衛發現，以宵禁之罪杖責二十。", end: true },
        'moon_spy': {
            text: "你發現那是當朝太子！他似乎在等人，但表情痛苦。",
            npc: '🤴',
            options: [
                { text: "現身安慰 (魅力)", check: { stat: 'chr', val: 13 }, pass: 'moon_comfort', fail: 'moon_awkward' },
                { text: "繼續偷聽 (幸運)", check: { stat: 'luc', val: 12 }, pass: 'moon_secret', fail: 'moon_sneeze' }
            ]
        },
        'moon_talk': {
            text: "黑影轉身，竟然是太子！他驚訝地看著你。",
            npc: '🤴',
            options: [
                { text: "謊稱賞月 (智慧)", check: { stat: 'int', val: 12 }, pass: 'moon_chat', fail: 'moon_suspect' }
            ]
        },
        'moon_sneeze': { text: "你忍不住打了個噴嚏。太子大怒，將你趕走。", end: true },
        'moon_awkward': { text: "你的安慰顯得很生硬，太子覺得被打擾，轉身離去。", end: true },
        'moon_suspect': { text: "太子懷疑你是刺客，雖然解釋清楚了，但印象分大減。", end: true },
        'moon_comfort': {
            text: "太子對你敞開心扉，原來他被皇帝責罵。氣氛正好。",
            bg: '🌸',
            options: [
                { text: "大膽握住他的手 (魅力)", check: { stat: 'chr', val: 15 }, pass: 'moon_romance', fail: 'moon_reject' },
                { text: "靜靜傾聽 (毅力)", check: { stat: 'vit', val: 11 }, pass: 'moon_friend', fail: 'moon_boring' }
            ]
        },
        'moon_secret': {
            text: "你聽到太子在自言自語關於傳國玉璽的藏匿點！",
            bg: '🤫',
            options: [
                { text: "以此情報要挾 (智慧)", check: { stat: 'int', val: 14 }, pass: 'moon_blackmail', fail: 'moon_killed' },
                { text: "將情報賣給敵對親王", next: 'moon_traitor' }
            ]
        },
        'moon_chat': {
            text: "你們聊起了詩詞歌賦，頗為投機。",
            options: [
                { text: "贈送隨身香囊 (財力/魅力)", next: 'moon_gift' }
            ]
        },
        'moon_reject': { text: "太子抽回了手：「請自重。」好感度歸零。", end: true },
        'moon_boring': { text: "太子說完就累了，讓你退下。", end: true },
        'moon_killed': { text: "你知道得太多了。第二天你失蹤了。", bg: '💀', isDeath: true, end: true },
        'moon_romance': { text: "【完美結局】月光下，太子吻了你。你是未來的太子妃了。", reward: { gold: 2000, exp: 1000 }, end: true },
        'moon_friend': { text: "【知己結局】太子視你為知己，此後你在宮中有了靠山。", reward: { exp: 500 }, end: true },
        'moon_blackmail': { text: "【權謀結局】太子被迫答應你的條件，你獲得了大量封口費。", reward: { gold: 3000 }, end: true },
        'moon_traitor': { text: "【背叛結局】親王給了你榮華富貴，但你背負了罵名。", reward: { gold: 5000 }, end: true },
        'moon_gift': { text: "【好感結局】太子收下了香囊，對你微微一笑。", reward: { exp: 300 }, end: true },

        // --- 紅樓夢迴 ---
        'red_start': {
            text: "你拿著一封泛黃的薦書，站在榮國府那兩座威嚴的大石獅子前。朱門緊閉，只開了角門。",
            bg: '⛩️',
            options: [
                { text: "遞上紅包給門房 (財力)", next: 'red_bribe_entry' },
                { text: "高聲報上家門 (魅力)", check: { stat: 'chr', val: 11 }, pass: 'red_entry_formal', fail: 'red_entry_fail' },
                { text: "假裝是採買的夥計 (靈巧)", check: { stat: 'dex', val: 12 }, pass: 'red_entry_sneak', fail: 'red_entry_beat' }
            ]
        },
        'red_entry_fail': { text: "門房看你寒酸，連推帶趕把你轟走了。你在京城流落街頭。", bg: '🍂', isDeath: true, end: true },
        'red_entry_beat': { text: "你被識破了，被家丁打了一頓扔在亂葬崗。", bg: '💀', isDeath: true, end: true },
        'red_bribe_entry': { text: "門房掂了掂銀子，換了副笑臉：「原來是表少爺/小姐，快請進！」", next: 'red_hall' },
        'red_entry_formal': { text: "你的氣度不凡，門房不敢怠慢，引你入內。", next: 'red_hall' },
        'red_entry_sneak': { text: "你混進了後廚，正好聽到丫鬟們在傳菜，決定藉機混入宴席。", next: 'red_garden_path' },

        'red_hall': {
            text: "剛入穿堂，便聽見一陣爽朗笑聲。一位丹鳳眼、柳葉眉的少婦（鳳姐）在一群媳婦簇擁下走來。",
            npc: '👩‍🦰',
            options: [
                { text: "上前恭維奉承 (智慧)", check: { stat: 'int', val: 12 }, pass: 'red_meet_feng', fail: 'red_feng_mock' },
                { text: "不卑不亢行禮 (魅力)", check: { stat: 'chr', val: 13 }, pass: 'red_meet_feng_respect', fail: 'red_feng_ignore' }
            ]
        },
        'red_feng_mock': { text: "鳳姐笑道：「這嘴倒是甜，只是油了些。」她把你打發去了柴房。", bg: '🧹', isDeath: true, end: true },
        'red_feng_ignore': { text: "鳳姐眼皮都沒抬，你被晾在一邊，最後無趣離開。", isDeath: true, end: true },
        'red_meet_feng': { text: "鳳姐被你哄得開心：「倒是個機靈鬼，今晚老祖宗在藕香榭擺宴，你也來伺候吧。」", next: 'red_garden_entry' },
        'red_meet_feng_respect': { text: "鳳姐點頭道：「是個懂規矩的。」准你入席。", next: 'red_garden_entry' },
        'red_garden_path': { text: "你端著一盤精緻的茄鯗，在迷宮般的大觀園裡迷路了。", next: 'red_bamboo_forest' },

        'red_garden_entry': {
            text: "大觀園內琉璃世界，白雪紅梅。你在沁芳橋頭遇到一位摔玉的公子（寶玉）。",
            npc: '👦',
            options: [
                { text: "幫他撿玉並安慰 (魅力)", check: { stat: 'chr', val: 12 }, pass: 'red_baoyu_friend', fail: 'red_baoyu_cry' },
                { text: "談論詩詞轉移注意 (智慧)", check: { stat: 'int', val: 13 }, pass: 'red_baoyu_poem', fail: 'red_baoyu_bore' }
            ]
        },
        'red_bamboo_forest': {
            text: "你誤入瀟湘館，聽見裡面傳來幽幽哭聲與咳嗽聲。",
            npc: '🎋',
            options: [
                { text: "在窗外對詩 (智慧)", check: { stat: 'int', val: 14 }, pass: 'red_daiyu_friend', fail: 'red_daiyu_angry' },
                { text: "悄悄離開", next: 'red_banquet_start' }
            ]
        },
        'red_baoyu_cry': { text: "他哭得更厲害了，引來了老祖宗，你被責怪驚擾了寶玉。", bg: '💢', end: true },
        'red_baoyu_bore': { text: "他覺得你言語無味，轉身跑了。", next: 'red_banquet_start' },
        'red_daiyu_angry': { text: "裡面的人嗔怒：「哪來的俗人窺探！」令丫鬟把你趕走。", end: true },
        'red_baoyu_friend': { text: "寶玉拉著你的手一同入席，眾人對你另眼相看。", reward: { exp: 500 }, next: 'red_banquet_event' },
        'red_baoyu_poem': { text: "寶玉大喜，引你為知己，邀你入席。", reward: { exp: 600 }, next: 'red_banquet_event' },
        'red_daiyu_friend': { text: "林姑娘推窗見你，覺你才情不俗，邀你一同前往宴席。", reward: { exp: 800 }, next: 'red_banquet_event' },
        'red_banquet_start': { text: "你混在末席，看著觥籌交錯，小心翼翼。", next: 'red_banquet_event' },

        'red_banquet_event': {
            text: "酒過三巡，老祖宗突然驚呼：「我的金鴛鴦酒杯怎麼不見了？」氣氛瞬間凝固。",
            bg: '🍷',
            options: [
                { text: "主動請纓搜查 (智慧)", check: { stat: 'int', val: 15 }, pass: 'red_detective', fail: 'red_blamed' },
                { text: "行酒令轉移焦點 (魅力)", check: { stat: 'chr', val: 14 }, pass: 'red_performer', fail: 'red_awkward' }
            ]
        },
        'red_blamed': { text: "你沒查出結果，反而被懷疑是賊喊捉賊。被拖下去打了四十大板。", bg: '💀', isDeath: true, end: true },
        'red_awkward': { text: "你的笑話沒人笑，場面更加尷尬，鳳姐讓你退下。", end: true },
        'red_detective': {
            text: "你觀察入微，發現一個小丫鬟神色慌張，袖口鼓囊。",
            options: [
                { text: "當眾揭發 (威嚴)", check: { stat: 'str', val: 12 }, pass: 'red_solve_public', fail: 'red_servant_deny' },
                { text: "私下勸她交出 (魅力)", check: { stat: 'chr', val: 14 }, pass: 'red_solve_private', fail: 'red_servant_run' }
            ]
        },
        'red_servant_deny': { text: "丫鬟死不承認，還反咬你一口，場面混亂。", end: true },
        'red_servant_run': { text: "丫鬟趁亂跑了，死無對證。", end: true },
        'red_performer': {
            text: "你即興賦詩一首，藉古諷今，逗得老祖宗轉怒為喜，不再追究酒杯之事。",
            bg: '📜',
            options: [
                { text: "乘勝追擊，挑戰聯詩 (智慧)", check: { stat: 'int', val: 16 }, pass: 'red_poem_king', fail: 'red_poem_fail' }
            ]
        },
        'red_poem_fail': { text: "下一句你卡殼了，才子形象崩塌。", end: true },
        'red_solve_public': { text: "【幹練結局】你找回了酒杯，鳳姐對你刮目相看，提拔你為管家助手。", reward: { gold: 3000, exp: 1000 }, end: true },
        'red_solve_private': { text: "【仁德結局】你保全了丫鬟的名聲又找回了寶物。寶玉和黛玉都覺得你是個溫柔的人。", reward: { gold: 1000, exp: 3000 }, end: true },
        'red_poem_king': { text: "【傳奇結局】你的才名在大觀園傳開，人稱「詩仙再世」，成為了園子裡的常駐貴客。", reward: { gold: 5000, exp: 5000 }, end: true }
    },

    // 基礎模式
    basic: {}
};

// 閒置文字庫
window.IDLE_TEXTS = [
    "微風吹過，一切都很平靜。",
    "今天似乎是個探險的好日子。",
    "你在周圍徘徊，猶豫著是否要深入。",
    "空氣很清新，但總覺得有人在盯著你..."
];

// ============================================
// [AUTO-FIX] 自動修復指令
// 確保引擎不會因為存檔裡有舊卡片 (event_camp) 而報錯
// ============================================
setTimeout(() => {
    const gs = window.GlobalState;
    if (gs && gs.story && gs.story.deck) {
        // 檢查牌庫裡是否有 'event_camp' 這種已刪除的 ID
        const hasLegacy = gs.story.deck.some(id => id === 'event_camp' || id === 'common_find_coin');
        
        if (hasLegacy) {
            console.warn("⚠️ 偵測到舊版存檔卡片，正在重置牌庫...");
            gs.story.deck = []; // 清空
            gs.story.discard = [];
            // 如果 StoryEngine 已載入，則重載
            if (window.StoryEngine && StoryEngine.reloadDeck) {
                StoryEngine.reloadDeck();
            }
        }
    }
}, 1000);