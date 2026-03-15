const config = require("../config");

module.exports = {
    cmd: "menu",
    alias: ["help", "list"],
    desc: "Displays the categorized bot command list",
    async execute(conn, m, { pushname, isOwner }) {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        // Header Section
        let menuText = `╔════════════════╗\n`;
        menuText += `  🚀 *POPKID-MD DASHBOARD* \n`;
        menuText += `╠════════════════╣\n`;
        menuText += ` 👤 *User:* ${pushname}\n`;
        menuText += ` 🕒 *Uptime:* ${hours}h ${minutes}m ${seconds}s\n`;
        menuText += ` 🔑 *Prefix:* [ ${config.PREFIX} ]\n`;
        menuText += ` 🌍 *Mode:* ${config.MODE}\n`;
        menuText += `╚════════════════╝\n\n`;

        // --- Organize Commands by Category ---
        const categories = {};
        
        global.plugins.forEach((plugin) => {
            const cat = plugin.category ? plugin.category.toUpperCase() : "OTHERS";
            if (!categories[cat]) {
                categories[cat] = [];
            }
            categories[cat].push(plugin.cmd);
        });

        // --- Build Categorized List ---
        const categoryKeys = Object.keys(categories).sort();
        
        categoryKeys.forEach((cat) => {
            menuText += `*──『 ${cat} 』──*\n`;
            categories[cat].sort().forEach((cmd) => {
                menuText += ` ├ ${config.PREFIX}${cmd}\n`;
            });
            menuText += `\n`;
        });

        menuText += `⚙️ *SYSTEM*\n`;
        menuText += ` ├ ${config.PREFIX}ping\n`;
        menuText += ` ├ ${config.PREFIX}runtime\n\n`;
        menuText += `*Created by Popkid Kenya* 🇰🇪`;

        // Sending with the External Ad Reply layout
        await conn.sendMessage(m.from, { 
            image: { url: "https://files.catbox.moe/j9ia5c.png" }, 
            caption: menuText,
            contextInfo: {
                externalAdReply: {
                    title: "POPKID-MD MULTI-DEVICE",
                    body: "Status: Online & Functional",
                    thumbnailUrl: "https://files.catbox.moe/j9ia5c.png",
                    sourceUrl: "https://github.com/popkidmd",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
};
