const config = require("../config");
const { formatUptime, getNairobiTime } = require("../lib/utils");

module.exports = {
    cmd: "menu",
    alias: ["help", "list"],
    desc: "Compact Bold Menu",
    async execute(conn, m, { pushName, isOwner }) {
        const uptime = formatUptime(process.uptime());
        const time = getNairobiTime();

        // --- EMOJI MAPPER FOR CATEGORIES ---
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
                       `║ 👤 *ᴜꜱᴇʀ:* ${pushName}\n` +
                       `║ ⏳ *ᴜᴘᴛɪᴍᴇ:* ${uptime}\n` +
                       `║ 🔑 *ᴘʀᴇꜰɪx:* [ ${config.PREFIX} ]\n` +
                       `║ 📅 *ᴛɪᴍᴇ:* ${time}\n` +
                       `╰══════════════════⊷\n\n`;

        if (global.plugins.size > 0) {
            const categories = {};
            global.plugins.forEach(p => {
                const cat = p.category ? p.category.toUpperCase() : "MISC";
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(p.cmd);
            });

            // Building Bold Categories with Rhyming Emojis
            Object.keys(categories).sort().forEach(category => {
                const emoji = categoryEmojis[category] || "💠";
                menuText += `══════════════════\n`;
                menuText += `${emoji} *${category}* ${emoji}\n`;
                menuText += `══════════════════\n`;
                
                categories[category].sort().forEach(cmd => {
                    menuText += ` ❍ ${config.PREFIX}${cmd}\n`;
                });
                menuText += `\n`;
            });
        }

        // ─── ꜱʏꜱᴛᴇᴍ ꜰᴏᴏᴛᴇʀ ───
        menuText += `══════════════════\n` +
                    `⚙️  *ꜱʏꜱᴛᴇᴍ ᴘᴀɴᴇʟ*\n` +
                    `══════════════════\n` +
                    ` ❍ ${config.PREFIX}ping\n` +
                    ` ❍ ${config.PREFIX}runtime\n` +
                    ` ❍ ${config.PREFIX}restart\n\n` +
                    `══════════════════\n` +
                    `*© 𝟤𝟢𝟤𝟨 ᴘᴏᴘᴋɪᴅ ᴋᴇɴʏᴀ* 🇰🇪`;

        // Sending as a simple image to avoid "Read More" issues
        await conn.sendMessage(m.from, { 
            image: { url: "https://files.catbox.moe/j9ia5c.png" }, 
            caption: menuText 
        }, { quoted: m });
    }
};
