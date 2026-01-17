/* js/modules/avatar300.js - V5.8.Data.Centralized */
window.act = window.act || {};

// [Data Removed] 資料已移至 data300.js (window.GameConfig.AvatarShop)

Object.assign(window.act, {
    initAvatarSession: () => {
        TempState.preview = JSON.parse(JSON.stringify(GlobalState.avatar.wearing || {}));
        TempState.previewGender = GlobalState.avatar.gender || 'm';
        if(!TempState.wardrobeTab) TempState.wardrobeTab = 'hair';
        act.refreshWardrobeUI();
    },

    switchWardrobeTab: (tab) => { 
        TempState.wardrobeTab = tab; 
        act.refreshWardrobeUI();
    },

    refreshWardrobeUI: () => {
        const tab = TempState.wardrobeTab;
        
        // [修改] 從 GameConfig 讀取資料
        const shopData = (window.GameConfig && window.GameConfig.AvatarShop) ? window.GameConfig.AvatarShop : [];
        const items = shopData.filter(i => i.type === tab);
        
        // 傳遞 currentWearing (正式存檔) 給 View，以判斷按鈕狀態
        if(window.view && view.renderWardrobeList) {
            view.renderWardrobeList(
                items, 
                TempState.preview || {}, 
                GlobalState.avatar.unlocked || [],
                GlobalState.avatar.wearing || {}
            );
            view.updateWardrobeTabs(tab);
            view.renderAvatarStage('avatar-preview-char', TempState.preview, TempState.previewGender);
        }
    },

    previewItem: (item) => {
        if (!TempState.preview) TempState.preview = {};
        TempState.preview[item.type] = item.icon; 
        act.refreshWardrobeUI();
    },

    wearItem: (id) => {
        // [修改] 從 GameConfig 讀取
        const shopData = (window.GameConfig && window.GameConfig.AvatarShop) ? window.GameConfig.AvatarShop : [];
        const item = shopData.find(i => i.id === id); if(!item) return;
        
        if(!GlobalState.avatar.wearing) GlobalState.avatar.wearing = {};
        GlobalState.avatar.wearing[item.type] = item.icon;
        if(!TempState.preview) TempState.preview = {};
        TempState.preview[item.type] = item.icon;
        act.save();
        act.refreshWardrobeUI(); 
        if(window.view) view.renderHUD();
    },

    buyAvatarItem: (id) => { 
        // [修改] 從 GameConfig 讀取
        const shopData = (window.GameConfig && window.GameConfig.AvatarShop) ? window.GameConfig.AvatarShop : [];
        const item = shopData.find(i => i.id === id); if(!item) return; 
        
        if((GlobalState.paidGem || 0) >= item.price) { 
            GlobalState.paidGem -= item.price; 
            if(!GlobalState.avatar.unlocked) GlobalState.avatar.unlocked = [];
            if(!GlobalState.avatar.unlocked.includes(id)) GlobalState.avatar.unlocked.push(id);
            act.wearItem(id);
            act.alert(`購買成功！\n(扣除 ${item.price} 付費鑽石)`);
        } else {
            act.alert(`付費鑽石不足！\n(持有: ${GlobalState.paidGem || 0})`);
        } 
    }
});