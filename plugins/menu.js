const config = require("../config");
const { formatUptime, getNairobiTime } = require("../lib/utils");

module.exports = {
    cmd: "menu",
    alias: ["help", "list"],
    desc: "Displays the bot command list",
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

        // ─── ᴄᴏᴍᴍᴀɴᴅ ꜱᴇᴄᴛɪᴏɴ ───
        menuText += `*╔══════════════════╗*\n` +
                    `* 🛠️  ᴄᴏᴍᴍᴀɴᴅ ᴘᴀɴᴇʟ      *\n` +
                    `*╚══════════════════╝*\n\n`;

        if (global.plugins.size > 0) {
            const categories = {};
            global.plugins.forEach(p => {
                const cat = p.category ? p.category.toUpperCase() : "ᴍɪꜱᴄ";
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(p.cmd);
            });

            Object.keys(categories).sort().forEach(category => {
                menuText += `*〔 ${category} 〕*\n`;
                categories[category].sort().forEach(cmd => {
                    menuText += ` ◦ ${config.PREFIX}${cmd}\n`;
                });
                menuText += `\n`;
            });
        } else {
            menuText += ` ◦  ɴᴏ ᴘʟᴜɢɪɴꜱ ᴅᴇᴛᴇᴄᴛᴇᴅ.\n\n`;
        }

        // ─── ꜱʏꜱᴛᴇᴍ ꜰᴏᴏᴛᴇʀ ───
        menuText += `══════════════════\n` +
                    `⚙️  *ꜱʏꜱᴛᴇᴍ ꜱᴇᴛᴛɪɴɢꜱ*\n` +
                    `══════════════════\n` +
                    ` ◦ ${config.PREFIX}ping\n` +
                    ` ◦ ${config.PREFIX}runtime\n` +
                    ` ◦ ${config.PREFIX}restart\n\n` +
                    `══════════════════\n` +
                    `*© 𝟤𝟢𝟤𝟨 ᴘᴏᴘᴋɪᴅ ᴋᴇɴʏᴀ* 🇰🇪`;

        await conn.sendMessage(m.from, { 
            image: { url: "https://files.catbox.moe/j9ia5c.png" }, 
            caption: menuText,
            contextInfo: {
                externalAdReply: {
                    title: "𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐎𝐅𝐅ɪ𝐂ɪ𝐀𝐋",
                    body: "ᴇɴɢɪɴᴇ: ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ",
                    thumbnailUrl: "https://files.catbox.moe/j9ia5c.png",
                    sourceUrl: "https://github.com/popkidmd",
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
};
