/* js/data_learning.js - V29.5 DIAGNOSTIC FIXED VERSION */

window.LearningData = window.LearningData || {};

// ==========================================
// 1. 閒置氛圍文本
// ==========================================
window.LearningData.idleLines = [
    {
        zh: "微風吹過樹梢，發出沙沙的聲響... 你在這裡暫時休息，調整呼吸。",
        en: "A breeze rustles through the treetops... You rest here for a moment, catching your breath.",
        jp: "木の梢を風が吹き抜け、さらさらと音を立てる… ここで少し休み、呼吸を整える。"
    },
    {
        zh: "四周一片寧靜，遠處偶爾傳來鳥鳴... 你整理了一下背包，思考著下一步。",
        en: "It is quiet all around, with occasional bird calls... You organize your pack, thinking about your next move.",
        jp: "あたりは静寂に包まれ、時折鳥の鳴き声が聞こえる… 荷物を整理しながら、次の行動を考える。"
    },
    {
        zh: "陽光灑在地上，帶來一絲暖意... 目前看起來很安全，你可以隨時整裝出發。",
        en: "Sunlight spills on the ground, bringing warmth... It seems safe for now, you can head out whenever ready.",
        jp: "陽の光が地面に降り注ぎ、暖かさを感じる… 今のところ安全そうだ、いつでも出発できる。"
    },
    {
        zh: "空氣中飄散著一種古老塵土的味道... 你感覺到這裡隱藏著許多祕密。",
        en: "The scent of ancient dust lingers in the air... You feel that many secrets are hidden here.",
        jp: "空気中に古びた埃の匂いが漂っている… ここには多くの秘密が隠されていると感じる。"
    },
    {
        zh: "遠處傳來不知名野獸的低吼聲，提醒你這裡並不完全安全。",
        en: "The low growl of an unknown beast echoes in the distance, reminding you that this place is not entirely safe.",
        jp: "遠くから正体不明の獣の唸り声が聞こえ、ここが完全に安全ではないことを思い出させる。"
    },
    {
        zh: "你找了一塊乾淨的石頭坐下，擦拭著武器，隨時準備應對突發狀況。",
        en: "You find a clean rock to sit on, wiping your weapon, ready for any sudden situation.",
        jp: "手頃な岩を見つけて腰を下ろし、武器を磨きながら、不測の事態に備える。"
    }
]; // <--- [CHECK 1] 這裡要有分號

// ==========================================
// 2. 結語模板
// ==========================================
window.LearningData.outroLines = {
    victory: {
        zh: "戰鬥結束了。你擦拭掉武器上的灰塵，確認戰利品後，準備繼續前進。",
        en: "The battle is over. You wipe the dust off your weapon, check your loot, and prepare to move on.",
        jp: "戦いは終わった。武器の埃を払い、戦利品を確認して、先へ進む準備をする。"
    },
    escape: {
        zh: "你氣喘吁吁地跑了一段路，確認後方沒有追兵後，終於鬆了一口氣。",
        en: "You ran for a while, gasping for air. After confirming no one is following, you finally relax.",
        jp: "息を切らしてしばらく走った。追手がいないことを確認し、ようやくほっと息をつく。"
    },
    generic: {
        zh: "事件告一段落。你整理了一下裝備，狀態良好，隨時可以繼續旅程。",
        en: "The event has concluded. You adjusted your gear; you are in good shape and ready to continue.",
        jp: "イベントは一段落した。装備を整え、体調も万全、いつでも旅を続けられる。"
    },
    trade: {
        zh: "交易愉快地完成了。你清點著新獲得的物資，對這次的收穫感到滿意。",
        en: "The trade was completed happily. You count your new supplies, satisfied with the gain.",
        jp: "取引は快く完了した。新しく手に入れた物資を確認し、今回の収穫に満足している。"
    },
    heal: {
        zh: "經過一番休整，你感覺體力恢復了不少，精神也變得更好了。",
        en: "After some rest, you feel your strength recovering and your spirit lifting.",
        jp: "休息を経て、体力がだいぶ回復し、気分も良くなったと感じる。"
    },
    curse: {
        zh: "雖然離開了那裡，但你感覺身體沉重，似乎沾染了一些不潔的氣息...",
        en: "Although you left there, your body feels heavy, as if tainted by something unclean...",
        jp: "そこを離れたものの、体が重く感じられ、何か不浄な気配を纏ってしまったようだ…"
    }
}; // <--- [CHECK 2] 這裡要有分號

// ==========================================
// 3. 單字庫
// ==========================================
window.LearningData.wordBanks = {
    Actor: [
        { id: 'bear', text: { zh:"棕熊", en:"Brown Bear", jp:"ヒグマ" }, contextTags: ['beast','hostile','danger'], weight: 3 },
        { id: 'wolf', text: { zh:"恐狼", en:"Dire Wolf", jp:"ダイアウルフ" }, contextTags: ['beast','hostile','fast'], weight: 3 },
        { id: 'goblin', text: { zh:"哥布林", en:"Goblin", jp:"ゴブリン" }, contextTags: ['humanoid','hostile','weak'], weight: 5 },
        { id: 'bandit', text: { zh:"強盜", en:"Bandit", jp:"山賊" }, contextTags: ['human','hostile','criminal'], weight: 4 },
        { id: 'slime', text: { zh:"史萊姆", en:"Slime", jp:"スライム" }, contextTags: ['monster','hostile','magic'], weight: 6 },
        { id: 'ghost', text: { zh:"幽靈", en:"Ghost", jp:"幽霊" }, contextTags: ['undead','hostile','spooky'], weight: 2 },
        { id: 'maid', text: { zh:"迷路的宮女", en:"Lost Maid", jp:"迷子の女官" }, contextTags: ['human','friendly','weak'], weight: 3 },
        { id: 'merchant', text: { zh:"旅行商人", en:"Merchant", jp:"旅の商人" }, contextTags: ['human','friendly','trade'], weight: 4 },
        { id: 'guard', text: { zh:"巡邏衛兵", en:"Patrol Guard", jp:"巡回兵" }, contextTags: ['human','neutral','law'], weight: 4 },
        { id: 'bard', text: { zh:"吟遊詩人", en:"Bard", jp:"吟遊詩人" }, contextTags: ['human','friendly','music'], weight: 2 },
        { id: 'hunter', text: { zh:"老獵人", en:"Old Hunter", jp:"老狩人" }, contextTags: ['human','neutral','expert'], weight: 3 }
    ],
    Place: [
        { id: 'forest', text: { zh:"迷霧森林", en:"Misty Forest", jp:"霧の森" }, weight: 5 },
        { id: 'market', text: { zh:"熱鬧市集", en:"Bustling Market", jp:"賑やかな市場" }, weight: 4 },
        { id: 'dungeon', text: { zh:"陰暗地牢", en:"Dark Dungeon", jp:"薄暗い地下牢" }, weight: 2 },
        { id: 'ruins', text: { zh:"古代遺跡", en:"Ancient Ruins", jp:"古代の遺跡" }, weight: 3 },
        { id: 'cave', text: { zh:"潮濕洞穴", en:"Damp Cave", jp:"湿った洞窟" }, weight: 3 },
        { id: 'tavern', text: { zh:"路邊酒館", en:"Roadside Tavern", jp:"道端の酒場" }, weight: 4 },
        { id: 'temple', text: { zh:"荒廢神殿", en:"Abandoned Temple", jp:"荒廃した神殿" }, weight: 2 },
        { id: 'lake', text: { zh:"寧靜湖畔", en:"Quiet Lakeside", jp:"静かな湖畔" }, weight: 3 }
    ],
    Item: [
        { id: 'coin', text: { zh:"金幣袋", en:"Bag of Coins", jp:"金貨袋" }, contextTags: ['treasure','small'], playerTag:'item_coin', weight: 6 },
        { id: 'gem', text: { zh:"紅寶石", en:"Ruby", jp:"ルビー" }, contextTags: ['treasure','valuable'], playerTag:'item_gem', weight: 2 },
        { id: 'ring', text: { zh:"銀戒指", en:"Silver Ring", jp:"銀の指輪" }, contextTags: ['treasure','accessory'], playerTag:'item_ring', weight: 3 },
        { id: 'meat', text: { zh:"生肉塊", en:"Raw Meat", jp:"生肉の塊" }, contextTags: ['food','scent'], playerTag:'item_meat', weight: 4 },
        { id: 'potion', text: { zh:"回復藥水", en:"Healing Potion", jp:"回復薬" }, contextTags: ['potion','magic'], playerTag:'item_potion', weight: 3 },
        { id: 'apple', text: { zh:"紅蘋果", en:"Red Apple", jp:"赤いリンゴ" }, contextTags: ['food','fruit'], playerTag:'item_apple', weight: 5 },
        { id: 'sword', text: { zh:"鐵劍", en:"Iron Sword", jp:"鉄の剣" }, contextTags: ['weapon','sharp'], playerTag:'item_sword', weight: 3 },
        { id: 'torch', text: { zh:"火把", en:"Torch", jp:"松明" }, contextTags: ['tool','light'], playerTag:'item_torch', weight: 4 },
        { id: 'map', text: { zh:"舊地圖", en:"Old Map", jp:"古い地図" }, contextTags: ['tool','paper'], playerTag:'item_map', weight: 3 }
    ],
    Adjective: [
        { id: 'mysterious', text: { zh:"神祕的", en:"mysterious", jp:"神秘的な" }, weight: 4 },
        { id: 'dangerous', text: { zh:"危險的", en:"dangerous", jp:"危険な" }, weight: 4 },
        { id: 'quiet', text: { zh:"安靜的", en:"quiet", jp:"静かな" }, weight: 3 },
        { id: 'noisy', text: { zh:"吵雜的", en:"noisy", jp:"騒がしい" }, weight: 3 },
        { id: 'beautiful', text: { zh:"美麗的", en:"beautiful", jp:"美しい" }, weight: 2 },
        { id: 'creepy', text: { zh:"令人毛骨悚然的", en:"creepy", jp:"不気味な" }, weight: 2 }
    ],
    Action: [
        { id: 'observe', text: { zh:"觀察", en:"Observe", jp:"観察する" }, weight: 5 },
        { id: 'touch', text: { zh:"觸摸", en:"Touch", jp:"触れる" }, weight: 3 },
        { id: 'attack', text: { zh:"攻擊", en:"Attack", jp:"攻撃する" }, weight: 4 },
        { id: 'talk', text: { zh:"交談", en:"Talk to", jp:"話しかける" }, weight: 4 }
    ]
}; // <--- [CHECK 3] 這裡要有分號

// ==========================================
// 4. 劇本模板
// ==========================================
window.LearningData.grammarPatterns = {
    setups: [
        { id: 's1', templates: { zh:"今天的 {Place} 天氣真好。", en:"The weather in {Place} is nice today.", jp:"今日の {Place} はいい天気だ。" } },
        { id: 's2', templates: { zh:"{Place} 瀰漫著一股 {Adjective} 氣氛。", en:"There is a {Adjective} atmosphere in {Place}.", jp:"{Place} には {Adjective} 雰囲気が漂っている。" } },
        { id: 's3', templates: { zh:"你獨自走在 {Place} 的小徑上。", en:"You are walking alone on a path in {Place}.", jp:"{Place} の小道を一人で歩いている。" } },
        { id: 's4', templates: { zh:"經過長途跋涉，你終於來到了 {Place}。", en:"After a long journey, you finally arrived at {Place}.", jp:"長い旅の末、ついに {Place} に到着した。" } },
        { id: 's5', templates: { zh:"這座 {Place} 據說隱藏著古代的寶藏。", en:"This {Place} is said to hide ancient treasures.", jp:"この {Place} には古代の宝が隠されていると言われている。" } },
        { id: 's6', templates: { zh:"夜幕低垂，{Place} 變得格外安靜。", en:"As night falls, {Place} becomes exceptionally quiet.", jp:"夜の帳が下り、{Place} は格別に静かになった。" } },
        { id: 's7', templates: { zh:"你感覺有人在 {Place} 盯著你。", en:"You feel someone watching you in {Place}.", jp:"{Place} で誰かに見られている気がする。" } },
        { id: 's8', templates: { zh:"空氣中充滿了 {Adjective} 魔力波動。", en:"The air is filled with {Adjective} magical fluctuations.", jp:"空気は {Adjective} 魔力の波動で満ちている。" } },
        { id: 's9', templates: { zh:"這裡曾經繁華，現在卻只是個荒涼的 {Place}。", en:"This was once prosperous, but now it is just a desolate {Place}.", jp:"かつては繁栄していたが、今は荒涼とした {Place} に過ぎない。" } },
        { id: 's10',templates: { zh:"突然，你在 {Place} 聽到了一聲尖叫。", en:"Suddenly, you heard a scream in {Place}.", jp:"突然、{Place} で悲鳴が聞こえた。" } }
    ],
    conflicts: [
        { id: 'c1', templates: { zh:"突然，一名 {Actor} 衝了出來！", en:"Suddenly, a {Actor} rushed out!", jp:"突然、{Actor} が飛び出してきた！" } },
        { id: 'c2', templates: { zh:"你在角落發現了 {Item}，但旁邊有個 {Actor}。", en:"You found {Item} in the corner, but there is a {Actor} nearby.", jp:"隅で {Item} を見つけたが、そばに {Actor} がいる。" } },
        { id: 'c3', templates: { zh:"一個 {Adjective} {Actor} 擋住了你的去路。", en:"A {Adjective} {Actor} blocked your way.", jp:"{Adjective} {Actor} があなたの道を塞いだ。" } },
        { id: 'c4', templates: { zh:"地上掉落著 {Item}，看起來很誘人。", en:"{Item} is lying on the ground, looking tempting.", jp:"地面に {Item} が落ちていて、魅力的だ。" } },
        { id: 'c5', templates: { zh:"那名 {Actor} 似乎想對你說些什麼。", en:"That {Actor} seems to want to say something to you.", jp:"その {Actor} はあなたに何か言いたそうだ。" } },
        { id: 'c6', templates: { zh:"你感覺口袋一輕，原來是 {Actor} 偷走了東西！", en:"Your pocket feels lighter; it turns out a {Actor} stole something!", jp:"ポケットが軽くなった気がした。{Actor} に何か盗まれたのだ！" } },
        { id: 'c7', templates: { zh:"{Actor} 正守護著一個 {Item}。", en:"The {Actor} is guarding a {Item}.", jp:"{Actor} は {Item} を守っている。" } },
        { id: 'c8', templates: { zh:"你被 {Actor} 的視線鎖定了。", en:"You are locked in the {Actor}'s sight.", jp:"{Actor} の視線にロックオンされた。" } },
        { id: 'c9', templates: { zh:"這是一個陷阱！{Actor} 帶著同伴包圍了你。", en:"It's a trap! The {Actor} surrounded you with companions.", jp:"罠だ！ {Actor} が仲間と共にあなたを包囲した。" } },
        { id: 'c10',templates: { zh:"那個 {Actor} 看起來受傷了，需要幫助。", en:"That {Actor} looks injured and needs help.", jp:"その {Actor} は怪我をしていて、助けを求めているようだ。" } }
    ]
}; // <--- [CHECK 4] 這裡要有分號

// ==========================================
// 5. 選項規則
// ==========================================
// ==========================================
// 5. 選項規則 (V30.4 Cleaned Data)
// ==========================================
window.LearningData.optionRules = [
    // --- 遇到武器 ---
    {
        reqTag: 'weapon', 
        options: [
            {
                // [Clean] 去掉樣式，只保留核心動作描述
                label: { zh:"裝備 {Item} 戰鬥", en:"Equip {Item}", jp:"{Item} を装備する" },
                priority: 'high',
                style: 'danger', 
                action: 'pickup_generated_item',
                outro: 'victory'
            }
        ]
    },
    // --- 遇到寶藏/物品 ---
    {
        reqTag: 'treasure',
        options: [
            {
                label: { zh:"鑑定價值", en:"Appraise", jp:"鑑定する" },
                priority: 'low',
                style: 'secondary',
                check: { stat:'int', val:12 },
                pass: 'appraise_success', 
                fail: 'appraise_fail',
                rewards: [{type:'exp', val:20}], 
                outro: 'generic'
            },
            {
                label: { zh:"拿走 {Item}", en:"Take {Item}", jp:"{Item} を拾う" },
                priority: 'high',
                style: 'primary',
                action: 'pickup_generated_item', 
                outro: 'generic'
            }
        ]
    },
    // --- 遇到敵人 (Hostile) ---
    {
        reqTag: 'hostile',
        options: [
            {
                label: { zh:"拔武攻擊", en:"Attack", jp:"攻撃する" }, 
                priority: 'high', style: 'danger', 
                check: { stat:'str', val:11 }, 
                grantTags: ['fame_brave'], 
                rewards: [{type:'exp', val:50}],
                pass: 'win', fail: 'lose', outro: 'victory' 
            },
            {
                label: { zh:"火球術 (魔法)", en:"Fireball (Req:Magic)", jp:"火球 (魔法)" },
                priority: 'high', style: 'danger',
                reqSkillTag: 'skill_magic', 
                rewards: [{type:'exp', val:80}],
                outro: 'victory'
            },
            {

                label: { zh:"背刺 (盜賊)", en:"Backstab (Req:Thief)", jp:"バックスタブ (盗賊)" },
                priority: 'high', style: 'danger',
                reqSkillTag: 'class_thief', 
                check: { stat:'dex', val:10 }, 
                rewards: [{type:'gold', val:20}, {type:'exp', val:60}],
                pass: 'win', fail: 'lose', outro: 'victory'
            },
            { 
                label: { zh:"轉身逃跑", en:"Run away", jp:"逃げる" }, 
                priority: 'low', style: 'normal', 
                type: 'flee', outro: 'escape' 
            }
        ]
    },
    // --- 遇到友善 NPC (Friendly) ---
    {
        reqTag: 'friendly',
        options: [
            { 
                label: { zh:"聊天", en:"Chat", jp:"話す" }, 
                priority: 'high', style: 'primary', 
                rewards: [{type:'exp', val:15}], 
                grantTags: ['info_rumor'],
                outro: 'generic' 
            },
            { 
                // [Clean] 保留金幣需求說明，因為這不是屬性檢定
                label: { zh:"交易 (需$10)", en:"Trade (-$10)", jp:"取引 (-$10)" }, 
                priority: 'low', style: 'primary', 
                reqTag: 'trade', 
                req: { gold: 10 }, 
                rewards: [{type:'item', val:1}], 
                outro: 'trade' 
            },
            {
                // [Clean]
                label: { zh:"偷竊 (盜賊)", en:"Steal (Req:Thief)", jp:"盗む (盗賊)" },
                priority: 'high', style: 'danger',
                reqSkillTag: 'class_thief', 
                check: { stat:'dex', val:13 },
                rewards: [{type:'gold', val:50}], 
                pass: 'steal_win', fail: 'steal_fail', outro: 'escape'
            },
            {
                // [Clean]
                label: { zh:"魅惑 (魅惑)", en:"Charm (Req:Charm)", jp:"魅了 (魅了)" },
                priority: 'low', style: 'secondary',
                reqSkillTag: 'skill_charm', 
                grantTags: ['npc_lover'], 
                rewards: [{type:'exp', val:100}],
                outro: 'generic'
            }
        ]
    },
    // --- 遇到野獸 (Beast) ---
    {
        reqTag: 'beast',
        options: [
            {
                label: { zh:"餵食 (消耗:生肉)", en:"Feed (Cost:Meat)", jp:"餌をやる (生肉)" },
                priority: 'high', style: 'primary',
                reqTag: 'hostile', 
                req: { tag: 'item_meat' }, 
                rewards: [{type:'exp', val:50}],
                grantTags: ['animal_friend'], 
                outro: 'victory' 
            }
        ]
    }
];

// ==========================================
// 6. 注入函數
// ==========================================
window.LearningData.inject = function() {
    if (!window.StoryData) {
        setTimeout(window.LearningData.inject, 500); 
        return;
    }
    
    console.log("📚 V29.5 Learning Data Injected (Massive Content).");
    
    window.StoryData.learningRules = {
        wordBanks: window.LearningData.wordBanks,
        patterns: window.LearningData.grammarPatterns,
        optionRules: window.LearningData.optionRules,
        idleLines: window.LearningData.idleLines,
        outroLines: window.LearningData.outroLines
    };
    
    if (!window.GlobalState.unlocks) window.GlobalState.unlocks = {};
    if (!window.GlobalState.settings) window.GlobalState.settings = {};
};

if(typeof window.StoryData !== 'undefined') {
    window.LearningData.inject();
} else {
    window.addEventListener('load', () => {
        if(!window.StoryData?.learningRules) window.LearningData.inject();
    });
}