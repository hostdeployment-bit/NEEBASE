const fs = require('fs');
const path = require('path');
const settingsFile = path.join(__dirname, '../database/group_settings.json');

module.exports = {
    cmd: "antilink",
    alias: ["linkmode", "link"],
    desc: "Set Anti-Link action: off / delete / warn / kick",
    category: "group",
    isGroup: true,
    isAdmin: true, // You still need to be an admin to use the command
    async execute(conn, m, { text, isOwner }) {
        try {
            // 1. Database Setup
            const dbDir = path.join(__dirname, '../database');
            if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
            let settings = fs.existsSync(settingsFile) ? JSON.parse(fs.readFileSync(settingsFile)) : {};

            if (!settings[m.from]) {
                settings[m.from] = { antilink: "off", warnings: {} };
            }

            const input = text.toLowerCase().trim();
            const validModes = ["off", "delete", "warn", "kick"];

            // 2. Setting the Mode
            if (validModes.includes(input)) {
                settings[m.from].antilink = input;
                if (!settings[m.from].warnings) settings[m.from].warnings = {};
                fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
                return m.reply(`🛡️ *POPKID-MD Anti-Link* is now set to: *${input.toUpperCase()}*`);
            }

            // 3. Monitoring Logic
            const body = m.body || '';
            const linkPattern = /chat.whatsapp.com\/|https?:\/\/[^\s]+|www\.[^\s]+/gi;
            const currentMode = settings[m.from].antilink;

            if (currentMode !== "off" && linkPattern.test(body)) {
                // Check if sender is admin (Admins can send links)
                const groupMetadata = await conn.groupMetadata(m.from);
                const isUserAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin || isOwner;

                if (!isUserAdmin) {
                    // Try to delete (will only work if bot is admin)
                    await conn.sendMessage(m.from, { delete: m.key }).catch(() => null);

                    if (currentMode === "kick") {
                        await m.reply(`🚫 *Link Policy:* Removing @${m.sender.split('@')[0]}`);
                        await conn.groupParticipantsUpdate(m.from, [m.sender], "remove").catch(() => null);

                    } else if (currentMode === "warn") {
                        if (!settings[m.from].warnings[m.sender]) settings[m.from].warnings[m.sender] = 0;
                        settings[m.from].warnings[m.sender] += 1;
                        
                        const count = settings[m.from].warnings[m.sender];
                        if (count >= 3) {
                            await m.reply(`🚫 *Final Strike:* @${m.sender.split('@')[0]} reached 3 warnings.`);
                            settings[m.from].warnings[m.sender] = 0;
                            await conn.groupParticipantsUpdate(m.from, [m.sender], "remove").catch(() => null);
                        } else {
                            await m.reply(`⚠️ *Warning (${count}/3):* @${m.sender.split('@')[0]}, no links allowed!`);
                        }
                        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
                    }
                }
            } else if (!input) {
                return m.reply(`🛡️ *POPKID-MD ANTILINK*\n\nStatus: *${currentMode.toUpperCase()}*\n\nUsage:\n.antilink delete\n.antilink warn\n.antilink kick\n.antilink off`);
            }

        } catch (e) {
            console.error("Antilink Plugin Error:", e);
        }
    }
};
