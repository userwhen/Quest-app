/* js/data300.js - V5.9.Final.Config.Complete */
window.DefaultData = {
    name: 'Commander', 
    gold: 100, freeGem: 0, paidGem: 0, lv: 1, exp: 0,
    loginStreak: 0, lastLoginDate: "", 
    attrs: { str: {name:'體能', v:1, exp:0, icon:'💪'}, int: {name:'智慧', v:1, exp:0, icon:'🧠'}, vit: {name:'毅力', v:1, exp:0, icon:'🔥'}, chr: {name:'魅力', v:1, exp:0, icon:'✨'}, agi: {name:'靈巧', v:1, exp:0, icon:'👐'}, luk: {name:'幸運', v:1, exp:0, icon:'🍀'} },
    skills: [], archivedSkills: [], 
    tasks: [], achievements: [], history: [], bag: [],
    story: { hp: 100, maxHp: 100, san: 100, exploreCount: 0, hasDied: false, permEvents: [], clearedEvents: [], inventory: [], relationships: {}, progress: 0 },
    avatar: { unlocked: ['h1', 't1', 'b1', 'a1'], wearing: { hair:'🧑', top:'👕', bottom:'👖', acc:'👓' } }, 
    wardrobe: [], 
    shop: { npc: [ 
        { id: 'def_1', name: '🥤 手搖飲', price: 60, category: '熱量', desc: '快樂泉源', val: 500, qty: 99, maxQty: 99, perm: 'daily' }, 
        { id: 'def_2', name: '🎮 耍廢一小時', price: 150, category: '時間', desc: '休息', val: '01:00', qty: 99, maxQty: 99, perm: 'daily' }, 
        { id: 'sp_rename', name: '📜 易名契約', price: 100, currency:'gem', category: '其他', desc: '修改暱稱', qty: 1, maxQty: 1, perm: 'daily' },
        { id: 'sp_gender', name: '🎭 幻形面具', price: 100, currency:'gem', category: '其他', desc: '重置外觀形象', qty: 1, maxQty: 1, perm: 'daily' }
    ], user: [] },
    settings: { mode: 'adventurer', calMode: false, calMax: 2000, strictMode: false },
    cal: { today: 0, logs: [], date: "" },
    cats: ['每日', '工作', '待辦', '願望'],
    stats: { clickCount: 0, taskCount: 0 } 
};

window.DIFFICULTY_DEFS = { 1: { label: '簡單', baseGold: 15, baseExp: 10, color: '#81c784' }, 2: { label: '中等', baseGold: 35, baseExp: 25, color: '#4db6ac' }, 3: { label: '困難', baseGold: 80, baseExp: 60, color: '#ffb74d' }, 4: { label: '史詩', baseGold: 200, baseExp: 150, color: '#e57373' } };

// 初始化 GlobalState
window.GlobalState = JSON.parse(JSON.stringify(window.DefaultData));
window.TempState = { filterCategory: '全部', shopCategory: '全部', taskTab: 'task', wardrobeTab: 'hair', achSort: 'time', editTaskId: null, editAchId: null, editSkillId: null, settings: {}, statsTab: 'attr' };

// ==========================================
// [New] 遊戲靜態配置中心 (Game Configuration)
// ==========================================
window.GameConfig = window.GameConfig || {};

// 0. 系統設定
window.GameConfig.System = {
    SaveKey: 'SQ_V103', // 統一管理存檔名稱
    SaveInterval: 5000  // 自動存檔間隔 (ms)
};

// 1. 紙娃娃商店列表 (原 avatar300.js)
window.GameConfig.AvatarShop = [ 
    { id:'h1', type:'hair', layer:'hair', icon:'🎩', price: 100, name: '紳士帽' }, 
    { id:'h2', type:'hair', layer:'hair', icon:'👒', price: 150, name: '草帽' }, 
    { id:'t1', type:'top', layer:'top', icon:'👕', price: 100, name: 'T恤' }, 
    { id:'b1', type:'bottom', layer:'bottom', icon:'👖', price: 100, name: '牛仔褲' }, 
    { id:'a1', type:'acc', layer:'acc', icon:'👓', price: 200, name: '眼鏡' } 
];

// 2. 劇情模式文本 (原 view300.js & story300.js)
window.GameConfig.StoryIdleTexts = [ "準備好迎接新的冒險了嗎？", "風平浪靜...", "整裝待發。", "四周很安靜。", "遠方傳來未知的聲音...", "今天天氣真不錯。" ];
window.GameConfig.StoryFlavorTexts = [ "四周很安靜...", "似乎沒有什麼特別的...", "繼續前行...", "微風吹過...", "什麼也沒發現。", "走了一段路，風景依舊。" ];

// 3. 資源路徑配置 (原 assets.js)
window.GameConfig.Assets = {
    basePath: 'img/',
    defExt: '.png',
    fallback: '🧚',
    avatars: { 
        adventurer: { m: 'adventurer_m', f: 'adventurer_f' }, 
        harem: { m: 'harem_m', f: 'harem_f' }, 
        basic: { m: 'adventurer_m', f: 'adventurer_f' } 
    },
    npcs: { guide: 'npc_guide', shop: 'npc_shop', bear: 'npc_bear' }
};

// 4. 技能與屬性配置 (原 stats300.js)
window.GameConfig.Stats = {
    skillLimit: 10,
    newSkillReward: { freeGem: 50, exp: 500 }
};

// 5. 新手教學文案 (原 tutorial300.js)
window.GameConfig.Tutorial = {
    guideNpc: '🧚',
    step0_intro: { title: '✨ 歡迎來到 LevLife', desc: '我是你的引導小精靈。\n首先，請告訴我你的名字？', placeholder: '輸入暱稱...', btn: '確認' },
    step0_avatar: { title: '建立角色外觀', desc: '請選擇一個喜歡的形象', btn: '確認形象' },
    step1_lobby: { text: '點擊「角色立繪」\n查看你的屬性狀態。' },
    step1_addSkill: { text: '這是你的屬性面板。\n現在，點擊 [+ 新增] 來建立第一個技能！' },
    step2_navTask: { text: '太棒了！\n現在點擊下方的 [任務] 分頁。' },
    step2_addTask: { text: '點擊右下角的 [+] 按鈕\n新增一項每日任務。', modalHint: '輸入任務標題並點擊儲存' },
    step2_complete: { text: '試著完成剛剛建立的任務。\n(點擊左側圓圈)' },
    step3_navShop: { text: '完成任務獲得了金幣！\n我們去商店看看吧。' },
    step3_buyFail: { text: '這裡有很多神奇的道具。\n試著購買「易名契約」或「幻形面具」！', dialog: '哇！忘記你現在身上沒有鑽石呢...\n(點擊下方按鈕去賺點外快)', btn: '前往成就' },
    step4_addAch: { text: '我們來這裡領取特別獎勵。\n先點擊 [+] 新增一個成就。', modalHint: '隨便建立一個成就\n(例如：第一次探索)' },
    step4_claim: { text: '點擊按鈕完成它！', dialogReward: '恭喜完成第一個成就！\n抱歉剛剛造成你的困擾~\n這是給我補給你的特別獎勵 💎100！', dialogDone: '恭喜完成成就！\n(你已經領過新手禮包囉，這次就不重複發送了)', btn: '太棒了', btnContinue: '繼續' },
    step5_realBuy: { text: '現在有錢了！\n把剛剛想買的東西買下來吧！', success: '購買成功！\n物品已放入背包。' },
    step6_end: { dialog: '🎉 新手教學完成！\n\n你可以自由探索了。\n記得每天回來完成任務喔！', btn: '開始冒險' },
    restartConfirm: "重看教學？(不會重置角色進度)"
};