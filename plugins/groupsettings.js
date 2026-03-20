module.exports = {
    cmd: "gcset",
    alias: ["gsetting", "groupset", "gpset"],
    desc: "Change group settings (lock/unlock messages or info)",
    category: "admin",
    async execute(conn, m, { args, isGroup, isAdmin, isBotAdmin }) {
        // 1. Basic Checks
        if (!isGroup) return m.reply("❌ This command can only be used in groups.");
        if (!isAdmin) return m.reply("❌ You need to be a Group Admin to use this.");
        if (!isBotAdmin) return m.reply("❌ I need to be an Admin to change group settings.");

        const setting = args[0]?.toLowerCase();

        // 2. Help Menu if no setting is provided
        if (!setting) {
            const menu = `╔════════════════╗\n` +
                         `║⚙️ *GROUP SETTINGS* ║\n` +
                         `╚════════════════╝\n\n` +
                         `📌 *Usage:* .gcset <option>\n\n` +
                         `────────────────────\n` +
                         `*💬 MESSAGE PERMISSIONS*\n` +
                         `🔒 *lock* — Only admins can send messages\n` +
                         `🔓 *unlock* — Everyone can send messages\n\n` +
                         `*🛠️ SETTINGS PERMISSIONS*\n` +
                         `🔒 *lockset* — Only admins can edit group info\n` +
                         `🔓 *unlockset* — Everyone can edit group info\n` +
                         `────────────────────\n` +
                         `*POPKID-MD*`;
            return m.reply(menu);
        }

        // 3. Settings Mapping
        const settingsMap = {
            lock: { value: 'announcement', label: '🔒 Only admins can send messages' },
            unlock: { value: 'not_announcement', label: '🔓 Everyone can send messages' },
            lockset: { value: 'locked', label: '🔒 Only admins can edit group info' },
            unlockset: { value: 'unlocked', label: '🔓 Everyone can edit group info' },
        };

        const config = settingsMap[setting];

        if (!config) {
            return m.reply(`❌ Unknown setting: *${setting}*\n\nUse *.gcset* to see valid options.`);
        }

        try {
            // 4. Update the setting
            await conn.groupSettingUpdate(m.chat, config.value);
            
            // 5. Success feedback with reaction
            await m.react("✅");
            return m.reply(`✅ *Success!*\n${config.label}`);

        } catch (e) {
            console.error('[GROUPSETTINGS] Error:', e);
            return m.reply(`❌ Failed to update setting: ${e.message}`);
        }
    }
};
