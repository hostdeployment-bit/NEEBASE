const fs = require('fs');
const path = require('path');
const settingsFile = path.join(__dirname, '../database/group_settings.json');

module.exports = {
    cmd: "antilink",
    alias: ["linkmode"],
    desc: "Set Anti-Link action: off / delete / warn / kick",
    category: "group",
    isGroup: true,
    isAdmin: true,
    isBotAdmin: true,
    async execute(conn, m, { text, isOwner }) {
        if (!fs.existsSync(path.join(__dirname, '../database'))) fs.mkdirSync(path.join(__dirname, '../database'));
        let settings = fs.existsSync(settingsFile) ? JSON.parse(fs.readFileSync(settingsFile)) : {};

        // Initialize group settings if empty
        if (!settings[m.from]) settings[m.from] = { antilink: "off", warnings: {} };

        const input = text.toLowerCase().trim();
        const validModes = ["off", "delete", "warn", "kick"];

        // 1. SETTING THE MODE
        if (validModes.includes(input)) {
            settings[m.from].antilink = input;
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
            return m.reply(`🛡️ *Anti-Link Mode set to:* ${input.toUpperCase()}\nAction will be taken on non-admins.`);
        }

        // 2. MONITORING LOGIC (Triggers on every message)
        const body = m.body || '';
        const linkPattern = /chat.whatsapp.com\/|https?:\/\/[^\s]+|www\.[^\s]+/gi;
        const currentMode = settings[m.from].antilink;

        if (currentMode !== "off" && linkPattern.test(body)) {
            const metadata = await conn.groupMetadata(m.from);
            const userIsAdmin = metadata.participants.find(p => p.id === m.sender)?.admin || isOwner;

            if (!userIsAdmin) {
                // ACTION: DELETE (Always done for warn/kick/delete modes)
                await conn.sendMessage(m.from, { delete: m.key });

                if (currentMode === "kick") {
                    await m.reply(`🚫 *Link Detected!* \nRemoving @${m.sender.split('@')[0]} immediately.`);
                    await conn.groupParticipantsUpdate(m.from, [m.sender], "remove");

                } else if (currentMode === "warn") {
                    // Initialize user warnings
                    if (!settings[m.from].warnings[m.sender]) settings[m.from].warnings[m.sender] = 0;
                    settings[m.from].warnings[m.sender] += 1;
                    
                    const count = settings[m.from].warnings[m.sender];
                    if (count >= 3) {
                        await m.reply(`🚫 *Final Warning!* \n@${m.sender.split('@')[0]} reached 3 warnings and is being removed.`);
                        settings[m.from].warnings[m.sender] = 0; // Reset
                        await conn.groupParticipantsUpdate(m.from, [m.sender], "remove");
                    } else {
                        await m.reply(`⚠️ *Link Warning (${count}/3)* \n@${m.sender.split('@')[0]}, do not send links! 3 strikes and you are out.`);
                    }
                    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));

                } else if (currentMode === "delete") {
                    // Just a silent or simple notification delete
                    await conn.sendMessage(m.from, { text: `🚫 *Link Deleted* (Admin only chat)` });
                }
            }
        } else if (!input) {
            return m.reply("💡 *Usage:* .antilink [off/delete/warn/kick]");
        }
    }
};
