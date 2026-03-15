const config = require("../config");

module.exports = {
    cmd: "menu",
    alias: ["help", "list"],
    desc: "Displays the bot command list",
    async execute(conn, m, { pushName, isOwner }) {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        // Header Section
        let menuText = `╔════════════════╗\n`;
        menuText += `  🚀 *POPKID-MD DASHBOARD* \n`;
        menuText += `╠════════════════╣\n`;
        menuText += ` 👤 *User:* ${pushName}\n`;
        menuText += ` 🕒 *Uptime:* ${hours}h ${minutes}m ${seconds}s\n`;
        menuText += ` 🔑 *Prefix:* [ ${config.PREFIX} ]\n`;
        menuText += ` 🌍 *Mode:* ${isOwner ? 'Developer' : 'Public'}\n`;
        menuText += `╚════════════════╝\n\n`;

        // 🤖 Dynamic Command Collector
        menuText += `🛠 *AVAILABLE COMMANDS*\n`;
        
        if (global.plugins.size > 0) {
            // Sort plugins alphabetically
            const sortedPlugins = Array.from(global.plugins.values()).sort((a, b) => a.cmd.localeCompare(b.cmd));
            
            sortedPlugins.forEach((plugin) => {
                // Simplified to only show the command
                menuText += ` ├ ${config.PREFIX}${plugin.cmd}\n`;
            });
        } else {
            menuText += ` ├ No plugins loaded.\n`;
        }

        menuText += `\n⚙️ *SYSTEM COMMANDS*\n`;
        menuText += ` ├ ${config.PREFIX}ping\n`;
        menuText += ` ├ ${config.PREFIX}runtime\n`;
        menuText += ` ├ ${config.PREFIX}restart\n`;
        menuText += `\n╚════════════════╝\n`;
        menuText += `*Created by Popkid Kenya* 🇰🇪`;

        // Sending with a professional External Ad Reply
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
