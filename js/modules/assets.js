/* js/modules/assets.js - V5.9.Clean.Configured */
window.Assets = window.Assets || {
    // [資料抽離] Helper：安全讀取配置
    getConf: function() {
        return (window.GameConfig && window.GameConfig.Assets) ? window.GameConfig.Assets : {
            basePath: 'img/', defExt: '.png', avatars: { adventurer: {m:'adventurer_m', f:'adventurer_f'} }
        };
    },
    
    getAvatarPath: function(mode, gender) {
        const conf = this.getConf();
        const m = mode || 'adventurer';
        // 防呆：如果 gender 是 null/undefined，預設為 'm'
        const g = (gender === 'f' || gender === '👩') ? 'f' : 'm';
        
        // 讀取對應模式的 map
        const modeMap = (conf.avatars && conf.avatars[m]) ? conf.avatars[m] : conf.avatars['adventurer'];
        const file = modeMap ? modeMap[g] : 'adventurer_m';
        
        return `${conf.basePath}${file}${conf.defExt}`;
    },

    getCharImgTag: function(className='', style='') {
        const gs = window.GlobalState;
        if (!gs) return ''; 
        
        const gender = gs.avatar?.gender || 'm';
        const path = this.getAvatarPath(gs.settings.mode, gender);
        const fallbackEmoji = (gender === 'f') ? '👩' : '🧑';
        
        return `<img src="${path}" class="${className}" style="${style}" onerror="this.outerHTML='<span class=${className} style=${style} font-size:80px; display:flex; justify-content:center; align-items:center;'>${fallbackEmoji}</span>'">`;
    }
};