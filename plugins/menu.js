const config = require("../config");

module.exports = {
    cmd: "menu",
    alias: ["help", "list"],
    desc: "Displays the categorized bot command list",
    async execute(conn, m, { pushname, isOwner }) {
        // Optimized Uptime Calculation
        const uptime = process.uptime();
        const timestr = [
            Math.floor(uptime / 3600),
            Math.floor((uptime % 3600) / 60),
            Math.floor(uptime % 60)
        ].map(v => v.toString().padStart(2, '0'));

        // Header with cleaner UI
        let menuText = `╭═══〔 *POPKID-MD* 〕═══⊷\n`;
        menuText += `┃ 👤 *User:* ${pushname}\n`;
        menuText += `┃ 🕒 *Uptime:* ${timestr[0]}h ${timestr[1]}m ${timestr[2]}s\n`;
        menuText += `┃ 🔑 *Prefix:* [ ${config.PREFIX} ]\n`;
        menuText += `┃ 🌍 *Mode:* ${config.MODE}\n`;
        menuText += `╰══════════════════⊷\n\n`;

        // Organize Commands Efficiently
        const categories = {};
        global.plugins.forEach((plugin) => {
            if (!plugin.cmd) return;
            const cat = (plugin.category || "OTHERS").toUpperCase();
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(plugin.cmd);
        });

        // Build Categorized List using Array joining (Better performance)
        const sortedCategories = Object.keys(categories).sort();
        const categorySections = sortedCategories.map(cat => {
            const cmds = categories[cat]
                .sort()
                .map(cmd => `  ◦ ${config.PREFIX}${cmd}`)
                .join("\n");
            return `┌──『 *${cat}* 』\n${cmds}\n└───────────────⊷`;
        });

        menuText += categorySections.join("\n\n");
        
        menuText += `\n\n⚙️ *SYSTEM*\n`;
        menuText += `  ◦ ${config.PREFIX}ping\n`;
        menuText += `  ◦ ${config.PREFIX}runtime\n\n`;
        menuText += `*Created by Popkid Kenya* 🇰🇪`;

        // Sending with Enhanced Context
        await conn.sendMessage(m.from, { 
            image: { url: "https://files.catbox.moe/j9ia5c.png" }, 
            caption: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: "POPKID-MD V3",
                    body: "The Best WhatsApp Bot Experience",
                    thumbnailUrl: "https://files.catbox.moe/j9ia5c.png",
                    sourceUrl: "https://github.com/popkidmd",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
};
