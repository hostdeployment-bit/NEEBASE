const fs = require('fs');
const path = require('path');
const settingsFile = path.join(__dirname, '../database/group_settings.json');

module.exports = {
    cmd: "antidelete",
    alias: ["ad", "nodelete"],
    desc: "Toggle Anti-delete for this specific chat",
    category: "general",
    async execute(conn, m, { text }) {
        const dbDir = path.join(__dirname, '../database');
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
        
        let settings = fs.existsSync(settingsFile) ? JSON.parse(fs.readFileSync(settingsFile)) : {};

        const mode = text.toLowerCase().trim();

        if (mode === "on") {
            settings[m.from] = { ...settings[m.from], antidelete: true };
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
            return m.reply("🛡️ *POPKID-MD:* Anti-delete is now **ENABLED** for this chat.");
        } 
        
        if (mode === "off") {
            settings[m.from] = { ...settings[m.from], antidelete: false };
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
            return m.reply("🔓 *POPKID-MD:* Anti-delete is now **DISABLED**.");
        }

        const status = settings[m.from]?.antidelete ? "ACTIVE ✅" : "INACTIVE ❌";
        m.reply(`🛡️ *ANTI-DELETE ENGINE*\n\nStatus: ${status}\n\n*Usage:* .antidelete on/off`);
    }
};
