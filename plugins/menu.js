const config = require("../config");
const { formatUptime, getNairobiTime } = require("../lib/utils");

module.exports = {
    cmd: "menu",
    alias: ["help", "list"],
    desc: "Clean Image Menu",
    async execute(conn, m, { pushName, isOwner }) {
        const uptime = formatUptime(process.uptime());
        const time = getNairobiTime();

        // ─── ᴘʀᴇᴍɪᴜᴍ ʙᴏx ʜᴇᴀᴅᴇʀ ───
        let menuText = `╭══════════════════⊷\n` +
                       `║   ✨  *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐕𝟑* ✨\n` +
                       `╠══════════════════⊷\n` +
                       `║ 👤  *ᴜꜱᴇʀ:* ${pushName}\n` +
                       `║ ⏳  *ᴜᴘᴛɪᴍᴇ:* ${uptime}\n` +
                       `║ 🔑  *ᴘʀᴇꜰɪx:* [  ${config.PREFIX}  ]\n` +
                       `║ 🌍  *ᴍᴏᴅᴇ:* ${isOwner ? 'ᴅᴇᴠᴇʟᴏᴘᴇʀ' : 'ᴘᴜʙʟɪᴄ'}\n` +
                       `║ 📅  *ᴛɪᴍᴇ:* ${time}\n` +
                       `╰══════════════════⊷\n\n`;

        if (global.plugins.size > 0) {
            const categories = {};
            global.plugins.forEach(p => {
                const cat = p.category ? p.category.toUpperCase() : "ᴍɪꜱᴄ";
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(p.cmd);
            });

            // Building categories with Double Lines
            Object.keys(categories).sort().forEach(category => {
                menuText += `══════════════════\n`;
                menuText += `*❍ ${category} ❍*\n`;
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
                    ` ◦ ${config.PREFIX}ping\n` +
                    ` ◦ ${config.PREFIX}runtime\n` +
                    ` ◦ ${config.PREFIX}restart\n\n` +
                    `══════════════════\n` +
                    `*© 𝟤𝟢𝟤𝟨 ᴘᴏᴘᴋɪᴅ ᴋᴇɴʏᴀ* 🇰🇪`;

        // Sending with a simple image and caption
        await conn.sendMessage(m.from, { 
            image: { url: "https://files.catbox.moe/j9ia5c.png" }, 
            caption: menuText 
        }, { quoted: m });
    }
};
