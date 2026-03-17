const config = require("../config");
const os = require('os');
const { formatUptime, getNairobiTime } = require("../lib/utils");

module.exports = {
    cmd: "menu",
    alias: ["help", "list"],
    desc: "Vertical Double-Line Menu with GitHub Image",
    async execute(conn, m, { pushName }) {
        const uptime = formatUptime(process.uptime());
        
        // --- CLEAN DATE & TIME SPLIT ---
        const fullTime = getNairobiTime(); 
        const date = fullTime.split(' at ')[0].replace('Tuesday, ', ''); 
        const time = fullTime.split(' at ')[1];

        const totalPlugins = global.plugins.size;
        const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

        const catEmojis = { ADMIN: "🛡️", DOWNLOAD: "📥", TOOLS: "🛠️", OWNER: "👑", GROUP: "👥", SEARCH: "🔍", MISC: "🌀", AI: "🤖" };

        // ─── PREMIUM BOX HEADER ───
        let menuText = `╭══════════════════⊷\n` +
                       `║   ✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐕𝟑* ✨\n` +
                       `╠══════════════════⊷\n` +
                       `║ 👤 *ᴜꜱᴇʀ:* ${pushName || 'User'}\n` +
                       `║ 🚀 *ᴘʟᴜɢɪɴꜱ:* ${totalPlugins}\n` +
                       `║ ⏳ *ᴜᴘᴛɪᴍᴇ:* ${uptime}\n` +
                       `║ 📅 *ᴅᴀᴛᴇ:* ${date}\n` +
                       `║ ⌚ *ᴛɪᴍᴇ:* ${time}\n` +
                       `║ 📊 *ʀᴀᴍ:* ${ram}ᴍʙ\n` +
                       `║ 🌐 *ᴍᴏᴅᴇ:* ${config.MODE || 'Public'}\n` +
                       `╰══════════════════⊷\n\n`;

        if (totalPlugins > 0) {
            const categories = {};
            global.plugins.forEach(p => {
                const cat = (p.category || "MISC").toUpperCase();
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(p.cmd);
            });

            // Building Category Boxes (Commands going downwards)
            Object.keys(categories).sort().forEach(category => {
                const emoji = catEmojis[category] || "💠";
                menuText += `╔══════════════════⊷\n`;
                menuText += `║ ${emoji}  *${category}*\n`;
                menuText += `╠══════════════════⊷\n`;
                
                categories[category].sort().forEach(cmd => {
                    menuText += `║ ◈ ${config.PREFIX}${cmd}\n`;
                });
                menuText += `╚══════════════════⊷\n`; 
            });
        }

        menuText += `\n*© 𝟤𝟢𝟤𝟨 ᴘᴏᴘᴋɪᴅ ᴋᴇɴʏᴀ* 🇰🇪`;

        // ─── THE GITHUB IMAGE FIX ───
        // Use the RAW link of your GitHub image here for speed
        const githubImageUrl = "https://raw.githubusercontent.com/hostdeployment-bit/NEEBASE/main/popkid.jpg";

        return await conn.sendMessage(m.from, { 
            image: { url: githubImageUrl }, 
            caption: menuText 
        }, { quoted: m });
    }
};
