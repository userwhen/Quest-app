/* js/data300.js - V12.0 Stable Data */
window.DefaultData = {
    name: 'Commander', 
    gold: 500, 
    freeGem: 0, 
    paidGem: 0, 
    lv: 1, 
    exp: 0,
    loginStreak: 0, 
    lastLoginDate: "", 
    
    // 屬性狀態
    attrs: { 
        str: {name:'體能', v:1, exp:0, icon:'💪'}, 
        int: {name:'智慧', v:1, exp:0, icon:'🧠'}, 
        vit: {name:'毅力', v:1, exp:0, icon:'🔥'}, 
        chr: {name:'魅力', v:1, exp:0, icon:'✨'}, 
        dex: {name:'靈巧', v:1, exp:0, icon:'👐'}, 
        luc: {name:'幸運', v:1, exp:0, icon:'🍀'} 
    },
    
    // 任務與背包
    tasks: [], 
    achievements: [], 
    history: [], 
    bag: [],
    
    // 劇情狀態
    story: { 
        energy: 30, 
        maxEnergy: 30, 
        tags: [], 
        exploreCount: 0 
    },
    
    // 紙娃娃
    avatar: { 
        gender: 'm',
        unlocked: ['o1'], 
        wearing: { outfit: 'o1' } 
    }, 
    
    // 商店庫存
    shop: { 
        npc: [ 
            { id: 'item_energy_s', name: '🥤 能量飲', price: 50, currency:'gold', category: '熱量', desc: '恢復 10 點精力', effect:'energy', val: 10, qty: 99, perm: 'daily', icon:'🥤' }, 
            { id: 'item_ticket', name: '🎟️ 快速通關', price: 100, currency:'gold', category: '道具', desc: '略過一次檢定', qty: 5, perm: 'daily', icon:'🎟️' },
            { id: 'o1', name: '👔 knight', price: 500, currency:'gold', category: '其他', type:'outfit', desc: '正式場合穿著', qty: 1, perm: 'once', icon:'👔' },
            { id: 'o2', name: '🥋 wizard', price: 300, currency:'gold', category: '其他', type:'outfit', desc: '練功專用', qty: 1, perm: 'once', icon:'🥋' }
        ], 
        user: [] 
    },
    
    settings: { mode: 'adventurer', calMode: false, calMax: 2000 },
    cal: { today: 0, logs: [] }
}; 

// 難度設定 (獨立變數)
window.DIFFICULTY_DEFS = { 
    1: { label: '簡單', baseGold: 15, baseExp: 10, color: '#81c784' }, 
    2: { label: '中等', baseGold: 35, baseExp: 25, color: '#4db6ac' }, 
    3: { label: '困難', baseGold: 80, baseExp: 60, color: '#ffb74d' }, 
    4: { label: '史詩', baseGold: 200, baseExp: 150, color: '#e57373' },
    5: { label: '傳說', baseGold: 500, baseExp: 400, color: '#d32f2f' }
};

// 初始化 State
window.GlobalState = JSON.parse(JSON.stringify(window.DefaultData));
window.TempState = { filterCategory: '全部', shopCategory: '全部', editingTask: null };

// 衣櫃定義
window.GameConfig = window.GameConfig || {};
window.GameConfig.AvatarShop = [
    { id:'o1', type:'outfit', icon:'👕', name: '休閒T恤' },
    { id:'o2', type:'outfit', icon:'👔', name: '西裝' },
    { id:'o3', type:'outfit', icon:'🥋', name: '道服' }
];