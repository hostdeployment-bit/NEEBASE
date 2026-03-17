const config = require("../config");
const os = require('os');
const { formatUptime, getNairobiTime } = require("../lib/utils");

module.exports = {
    cmd: "menu",
    alias: ["help", "list"],
    desc: "Double-Line Boxed Menu",
    async execute(conn, m, { pushName, isOwner }) {
        const uptime = formatUptime(process.uptime());
        
        // --- ADVANCED DATE & TIME SPLIT ---
        const fullTime = getNairobiTime(); 
        const date = fullTime.split(' at ')[0];
        const time = fullTime.split(' at ')[1];

        const totalPlugins = global.plugins.size;

        // --- SYSTEM METRICS ---
        const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
        const platform = os.platform() === 'linux' ? 'ʟɪɴᴜx' : 'ᴡɪɴᴅᴏᴡs';

        // --- CATEGORY EMOJIS ---
        const categoryEmojis = {
            ADMIN: "🛡️",
            DOWNLOAD: "📥",
            TOOLS: "🛠️",
            OWNER: "👑",
            GROUP: "👥",
            SEARCH: "🔍",
            MISC: "🌀",
            AI: "🤖"
        };

        // ─── ᴘʀᴇᴍɪᴜᴍ ʙᴏx ʜᴇᴀᴅᴇʀ ───
        let menuText = `╭══════════════════⊷\n` +
                       `║   ✨  *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐕𝟑* ✨\n` +
                       `╠══════════════════⊷\n` +
                       `║ 👤 *ᴜꜱᴇʀ:* ${pushName || 'User'}\n` +
                       `║ 🚀 *ᴘʟᴜɢɪɴꜱ:* ${totalPlugins}\n` +
                       `║ ⏳ *ᴜᴘᴛɪᴍᴇ:* ${uptime}\n` +
                       `║ 📅 *ᴅᴀᴛᴇ:* ${date}\n` +
                       `║ ⌚ *ᴛɪᴍᴇ:* ${time}\n` +
                       `║ 🔑 *ᴘʀᴇꜰɪx:* [ ${config.PREFIX} ]\n` +
                       `║ 💻 *ʜᴏꜱᴛ:* ${platform}\n` +
                       `║ 📊 *ʀᴀᴍ:* ${ramUsage}ᴍʙ / ${totalRam}ɢʙ\n` +
                       `║ 🌐 *ᴍᴏᴅᴇ:* ${config.MODE || 'Public'}\n` +
                       `║ 👨‍💻 *ᴅᴇᴠ:* ᴘᴏᴘᴋɪᴅ ᴋᴇɴʏᴀ\n` +
                       `╰══════════════════⊷\n\n`;

        if (totalPlugins > 0) {
            const categories = {};
            global.plugins.forEach(p => {
                const cat = p.category ? p.category.toUpperCase() : "MISC";
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(p.cmd);
            });

            // Building Category Boxes with Double Lines
            Object.keys(categories).sort().forEach(category => {
                const emoji = categoryEmojis[category] || "💠";
                menuText += `╔══════════════════⊷\n`;
                menuText += `║ ${emoji}  *${category}*\n`;
                menuText += `╠══════════════════⊷\n`;
                
                categories[category].sort().forEach(cmd => {
                    menuText += `║ ◈ ${config.PREFIX}${cmd}\n`;
                });
                menuText += `╚══════════════════⊷\n`; // Removed extra newline to kill Read More
            });
        }

        // ─── ꜱʏꜱᴛᴇᴍ ꜰᴏᴏᴛᴇʀ ───
        menuText += `\n╭══════════════════⊷\n` +
                    `║   ⚙️  *ꜱʏꜱᴛᴇᴍ ᴘᴀɴᴇʟ*\n` +
                    `╠══════════════════⊷\n` +
                    `║ ◈ ${config.PREFIX}ping\n` +
                    `║ ◈ ${config.PREFIX}runtime\n` +
                    `║ ◈ ${config.PREFIX}restart\n` +
                    `╰══════════════════⊷\n\n` +
                    `*© 𝟤𝟢𝟤𝟨 ᴘᴏᴘᴋɪᴅ ᴋᴇɴʏᴀ* 🇰🇪`;

        // Optimization: Small delay to ensure memory is cleared before sending
        await conn.sendMessage(m.from, { 
            image: { url: "https://files.catbox.moe/j9ia5c.png" }, 
            caption: menuText 
        }, { quoted: m });
    }
};
