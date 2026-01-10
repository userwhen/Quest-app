/* js/modules/assets.js - V36.0 Dual Naming Logic (Body/Icon vs Outfit) */
window.Assets = {
    // 取得基礎配置
    getConf: () => (window.GameConfig && window.GameConfig.Assets) ? window.GameConfig.Assets : { basePath: 'img/', defExt: '.png' },

    // 解析立繪路徑
    getAvatarPath: (mode, gender, part) => {
        const conf = window.Assets.getConf();
        const m = mode || 'adventurer';
        const g = (gender === 'f') ? 'f' : 'm';
        
        // ---------------------------------------------------------
        // [邏輯 A] 素體與頭像 (Body & Icon) -> 結構: {mode}_{type}_{gender}
        // ---------------------------------------------------------
        // 說明: 這些檔案通常有分男女，所以結尾要加 _m 或 _f
			if (part === 'body' || part === 'nude' || part === 'icon') {
            // [Fix] 強制將 'icon' 和 'nude' 都轉譯成檔名 'body' (共用同一張圖)
            let realPart = 'body'; 
            
            return `${conf.basePath}${m}_${realPart}_${g}${conf.defExt}`;
        }

        // ---------------------------------------------------------
        // [邏輯 B] 服裝與物品 (Outfit) -> 結構: {mode}_{id}
        // ---------------------------------------------------------
        // 說明: 您的命名邏輯是 adventurer_o1_knight，這裡 part 預期接收 "o1_knight"
        if (part && part !== 'outfit') {
            // 產出: img/adventurer_o1_knight.png
            return `${conf.basePath}${m}_${part}${conf.defExt}`;
        }

        // [防呆] 如果 part 是空值或 "outfit" (代表未裝備)，回傳 null 避免 404
        return null;
    },

    // 圖片標籤生成 (無 onerror 安全版)
    getImgTag: (src, fallbackEmoji, className = '', style = '') => {
        if (!src) {
            // 如果沒有圖片路徑 (例如沒穿衣服)，直接回傳透明區塊或 Emoji
            return `<span class="${className}" style="${style}; display:flex; justify-content:center; align-items:center;">${fallbackEmoji}</span>`;
        }
        return `<img src="${src}" class="${className}" style="${style}" alt="${fallbackEmoji}">`;
    }
};

