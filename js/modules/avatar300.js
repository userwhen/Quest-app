/* js/modules/avatar300.js - V12.0 Outfit Only */
window.act = window.act || {};

const AvatarEngine = {
    // [1. 獲取衣櫃]
    // 嚴格遵守：商店歸商店，這裡只顯示「已擁有」且「是服裝」的物品
    getWardrobeItems: () => {
        const gs = window.GlobalState;
        const allItems = window.GameConfig.AvatarShop || [];
        
        // 取得已解鎖的 ID 列表
        const unlockedIds = gs.avatar.unlocked || [];
        
        // 篩選：(在全列表中) AND (已解鎖) AND (是服裝)
        return allItems.filter(i => unlockedIds.includes(i.id) && i.type === 'outfit');
    },

    // [2. 換裝]
    tryOn: (itemId) => {
        const gs = window.GlobalState;
        
        // 設定穿著
        gs.avatar.wearing.outfit = itemId;
        
        // 預覽同步
        if (window.TempState) {
            window.TempState.previewWearing = { ...gs.avatar.wearing, outfit: itemId };
        }
        
        act.toast("已更換服裝");
        Core.save();
        
        // 刷新相關視圖
        if (window.view) {
            view.renderWardrobe(); // 刷新衣櫃選中狀態
            view.renderLobby();    // 刷新大廳立繪
            view.renderHUD();      // 刷新頭像
        }
    }
};

window.act.getWardrobeItems = AvatarEngine.getWardrobeItems;
window.act.tryOn = AvatarEngine.tryOn;