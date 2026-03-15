const fs = require('fs');
const path = require('path');
const settingsFile = path.join(__dirname, '../database/group_settings.json');

module.exports = {
    cmd: "antidelete",
    alias: ["ad", "nodelete", "ghost"],
    desc: "Toggle Anti-delete for the current chat",
    category: "admin",
    isGroup: true,
    isAdmin: true,
    async execute(conn, m, { text }) {
        const dbDir = path.join(__dirname, '../database');
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
        
        let settings = fs.existsSync(settingsFile) ? JSON.parse(fs.readFileSync(settingsFile)) : {};

        const mode = text.toLowerCase().trim();

        if (mode === "on") {
            settings[m.from] = { ...settings[m.from], antidelete: true };
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
            return m.reply("🛡️ *POPKID-MD:* Anti-delete is now **ENABLED**. Ghosting is no longer allowed! 👻");
        } 
        
        if (mode === "off") {
            settings[m.from] = { ...settings[m.from], antidelete: false };
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
            return m.reply("🔓 *POPKID-MD:* Anti-delete is now **DISABLED**.");
        }

        // Status view if no arg is provided
        const status = settings[m.from]?.antidelete ? "ACTIVE ✅" : "INACTIVE ❌";
        m.reply(`🛡️ *ANTI-DELETE ENGINE STATUS*\n\nStatus: ${status}\n\n*Usage:*\n.antidelete on\n.antidelete off`);
    }
};
