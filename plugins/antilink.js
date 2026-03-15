const fs = require('fs');
const path = require('path');
const settingsFile = path.join(__dirname, '../database/group_settings.json');

module.exports = {
    cmd: "antilink",
    alias: ["linkmode", "link"],
    desc: "Set Anti-Link action: off / delete / warn / kick",
    category: "group",
    isGroup: true,
    isAdmin: true,
    async execute(conn, m, { text, isOwner }) {
        try {
            // 1. Force a fresh fetch of group data
            const groupMetadata = await conn.groupMetadata(m.from).catch(() => null);
            if (!groupMetadata) return m.reply("❌ Failed to fetch group metadata.");

            const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const botParticipant = groupMetadata.participants.find(p => p.id === botNumber);
            const isBotAdmin = botParticipant?.admin || botParticipant?.isSuperAdmin || false;

            // 2. The Check
            if (!isBotAdmin) {
                return m.reply("❌ *POPKID-MD Error:* I need to be a **Group Admin** to delete links or kick users. Please promote me first.");
            }

            // 3. Database Setup
            const dbDir = path.join(__dirname, '../database');
            if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
            let settings = fs.existsSync(settingsFile) ? JSON.parse(fs.readFileSync(settingsFile)) : {};

            if (!settings[m.from]) {
                settings[m.from] = { antilink: "off", warnings: {} };
            }

            const input = text.toLowerCase().trim();
            const validModes = ["off", "delete", "warn", "kick"];

            // 4. Action Logic
            if (validModes.includes(input)) {
                settings[m.from].antilink = input;
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
                return m.reply(`🛡️ *Anti-Link Protection Update*\n\n✅ *Status:* ${input.toUpperCase()}\n\n*POPKID-MD MASTER ENGINE* 🇰🇪`);
            }

            if (!input) {
                let currentMode = settings[m.from].antilink || "OFF";
                let menu = `🛡️ *POPKID-MD ANTILINK*\n\n`;
                menu += `Current Mode: *${currentMode.toUpperCase()}*\n\n`;
                menu += `Commands:\n`;
                menu += `• .antilink delete\n`;
                menu += `• .antilink warn\n`;
                menu += `• .antilink kick\n`;
                menu += `• .antilink off`;
                return m.reply(menu);
            }

        } catch (e) {
            console.error(e);
            m.reply("⚠️ System Error: " + e.message);
        }
    }
};
