const config = require("../config");

module.exports = {
    cmd: "menu",
    alias: ["help", "list"],
    desc: "Displays the categorized bot command list",
    async execute(conn, m, { pushname }) {
        // 1. Optimized Uptime Calculation
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((uptime % 3600) / 60).toString().padStart(2, '0');
        const seconds = Math.floor(uptime % 60).toString().padStart(2, '0');
        
        // 2. Count total commands from the global.plugins Map
        const totalCommands = global.plugins.size;

        // --- Styled Header Section ---
        let menuText = `╭━━━〔 𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 〕━⊷\n`;
        menuText += `┃ 👤 𝚄𝚜𝚎𝚛: ${pushname}\n`;
        menuText += `┃ ⏳ 𝚄𝚙𝚝𝚒𝚖𝚎: ${hours}𝚑 ${minutes}𝚖 ${seconds}𝚜\n`;
        menuText += `┃ 🤖 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜: ${totalCommands}\n`;
        menuText += `┃ 🔑 𝙿𝚛𝚎𝚏𝚒𝚡: [ ${config.PREFIX} ]\n`;
        menuText += `┃ 🌍 𝙼𝚘𝚍𝚎: ${config.MODE}\n`;
        menuText += `╰━━━━━━━━━━━━━━━━⊷\n\n`;

        // 3. Organize Commands by Category
        const categories = {};
        global.plugins.forEach((plugin) => {
            if (!plugin.cmd) return;
            const cat = (plugin.category || "General").toUpperCase();
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(plugin.cmd);
        });

        // 4. Build Categorized List
        const categoryKeys = Object.keys(categories).sort();
        
        categoryKeys.forEach((cat) => {
            menuText += `╔══✪  『 *${cat}* 』\n`;
            
            const sortedCmds = categories[cat].sort();
            sortedCmds.forEach((cmd, index) => {
                const isLast = index === sortedCmds.length - 1;
                menuText += `${isLast ? "╚" : "╠"} ➩ ${config.PREFIX}${cmd}\n`;
            });
            menuText += `\n`;
        });

        // --- Footer ---
        const ping = Date.now() - (m.messageTimestamp * 1000);
        menuText += `✨ 𝚂𝚢𝚜𝚝𝚎𝚖 𝙸𝚗𝚏𝚘:\n`;
        menuText += `⚡ 𝙿𝚒𝚗𝚐: ${ping}𝚖𝚜\n`;
        menuText += `🇰🇪 *ᴘᴏᴘᴋɪᴅ ᴋᴇɴʏᴀ*`;

        // 5. Sending as Text with External Ad Reply
        await conn.sendMessage(m.from, { 
            text: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "ᴘᴏᴘᴋɪᴅ-ᴍᴅ ᴀᴜᴛᴏᴍᴀᴛɪᴏɴ",
                    body: `Latency: ${ping}ms | Status: Active`,
                    thumbnailUrl: "https://files.catbox.moe/j9ia5c.png",
                    sourceUrl: "https://whatsapp.com/channel/0029VacgxK96hENmSRMRxx1r",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });
    }
};
