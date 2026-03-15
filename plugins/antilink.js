const fs = require('fs');
const path = require('path');
const settingsFile = path.join(__dirname, '../database/group_settings.json');

module.exports = {
    cmd: "antilink",
    alias: ["linkmode", "link"],
    desc: "Set Anti-Link action: off / delete / warn / kick",
    category: "group",
    isGroup: true,
    isAdmin: true, // Only group admins can use this command
    async execute(conn, m, { text, isOwner }) {
        // 1. Database Setup
        const dbDir = path.join(__dirname, '../database');
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
        let settings = fs.existsSync(settingsFile) ? JSON.parse(fs.readFileSync(settingsFile)) : {};

        // 2. Precise Bot Admin Check
        const groupMetadata = await conn.groupMetadata(m.from);
        const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const botParticipant = groupMetadata.participants.find(p => p.id === botNumber);
        const isBotAdmin = botParticipant?.admin || botParticipant?.isSuperAdmin || false;

        // If bot isn't admin, it can't execute any protective actions
        if (!isBotAdmin) {
            return m.reply("❌ *POPKID-MD Error:* I need to be a **Group Admin** to delete links or kick users. Please promote me first.");
        }

        // Initialize settings for this group if they don't exist
        if (!settings[m.from]) {
            settings[m.from] = { antilink: "off", warnings: {} };
        }

        const input = text.toLowerCase().trim();
        const validModes = ["off", "delete", "warn", "kick"];

        // 3. Mode Setting Logic
        if (validModes.includes(input)) {
            settings[m.from].antilink = input;
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
            return m.reply(`🛡️ *Anti-Link Protection Update*\n\n✅ *Status:* ${input.toUpperCase()}\n👤 *Target:* Non-Admins\n\n*POPKID-MD MASTER ENGINE* 🇰🇪`);
        }

        // 4. Monitoring Logic (Detecting the link)
        const body = m.body || '';
        const linkPattern = /chat.whatsapp.com\/|https?:\/\/[^\s]+|www\.[^\s]+/gi;
        const currentMode = settings[m.from].antilink;

        if (currentMode !== "off" && linkPattern.test(body)) {
            // Check if the sender is an admin (Admins are immune)
            const senderParticipant = groupMetadata.participants.find(p => p.id === m.sender);
            const userIsAdmin = senderParticipant?.admin || isOwner;

            if (!userIsAdmin) {
                // DELETE is the baseline action for all active modes
                await conn.sendMessage(m.from, { delete: m.key });

                if (currentMode === "kick") {
                    await m.reply(`🚫 *Link Detected!* \nRemoving @${m.sender.split('@')[0]} for violating group rules.`);
                    await conn.groupParticipantsUpdate(m.from, [m.sender], "remove");

                } else if (currentMode === "warn") {
                    if (!settings[m.from].warnings) settings[m.from].warnings = {};
                    if (!settings[m.from].warnings[m.sender]) settings[m.from].warnings[m.sender] = 0;
                    
                    settings[m.from].warnings[m.sender] += 1;
                    const count = settings[m.from].warnings[m.sender];

                    if (count >= 3) {
                        await m.reply(`🚫 *Final Warning!* \n@${m.sender.split('@')[0]} reached 3/3 warnings and is being removed.`);
                        settings[m.from].warnings[m.sender] = 0; // Reset
                        await conn.groupParticipantsUpdate(m.from, [m.sender], "remove");
                    } else {
                        await m.reply(`⚠️ *Link Warning (${count}/3)* \n@${m.sender.split('@')[0]}, do not send links! 3 strikes and you are out.`);
                    }
                    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));

                } else if (currentMode === "delete") {
                    await conn.sendMessage(m.from, { text: `🚫 *Link Deleted:* External links are not allowed here.` });
                }
            }
        } else if (!input) {
            // Show help menu if no input is given
            let menu = `🛡️ *POPKID-MD ANTILINK SETTINGS*\n\n`;
            menu += `Current Mode: *${currentMode.toUpperCase()}*\n\n`;
            menu += `Available Commands:\n`;
            menu += `• *.antilink delete* (Only delete)\n`;
            menu += `• *.antilink warn* (Delete + Warn)\n`;
            menu += `• *.antilink kick* (Immediate Kick)\n`;
            menu += `• *.antilink off* (Disable)`;
            return m.reply(menu);
        }
    }
};
