const config = require("../config");

module.exports = {
    cmd: "autostatusview",
    alias: ["autoreact", "autotyping", "autorecording", "autobio", "nonprefix"],
    desc: "Direct toggle for all engine features",
    category: "OWNER",
    isOwner: true,
    async execute(conn, m, { text, command }) {
        // --- MAPPING SHORT COMMANDS TO CONFIG KEYS ---
        const cmdMap = {
            "autostatusview": "AUTO_READ_STATUS",
            "autoreact": "AUTO_REACT_STATUS",
            "autotyping": "AUTO_TYPING",
            "autorecording": "AUTO_RECORDING",
            "autobio": "AUTO_BIO",
            "nonprefix": "NON_PREFIX"
        };

        const targetConfig = cmdMap[command];
        const input = text?.toLowerCase();

        // 1. DASHBOARD (If you just type the command without on/off)
        if (!input || (input !== 'on' && input !== 'off')) {
            const status = config[targetConfig] === "true" ? "🟢 ᴀᴄᴛɪᴠᴇ" : "🔴 ɪɴᴀᴄᴛɪᴠᴇ";
            return m.reply(
                `✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐀𝐔𝐓𝐎* ✨\n` +
                `══════════════════\n` +
                `🤖 *ꜰᴇᴀᴛᴜʀᴇ:* ${command.toUpperCase()}\n` +
                `📊 *ꜱᴛᴀᴛᴜꜱ:* ${status}\n` +
                `══════════════════\n` +
                `💡 _Usage: .${command} on | off_\n` +
                `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀𝗂ɴᴇ 🇰🇪`
            );
        }

        // 2. TOGGLE LOGIC
        if (input === 'on') {
            config[targetConfig] = "true";
            await m.react("✅");
        } else {
            config[targetConfig] = "false";
            await m.react("❌");
        }

        // 3. SUCCESS CARD
        const finalStatus = config[targetConfig] === "true" ? "🟢 ᴇɴᴀʙʟᴇᴅ" : "🔴 ᴅɪꜱᴀʙʟᴇᴅ";
        const successMsg = 
            `✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐂𝐎𝐍𝐅𝐈𝐆* ✨\n` +
            `══════════════════\n` +
            `✅ *${command.toUpperCase()}*\n` +
            `ꜱᴛᴀᴛᴜꜱ ᴜᴘᴅᴀᴛᴇᴅ ᴛᴏ: ${finalStatus}\n` +
            `══════════════════\n` +
            `> ꜱᴇᴛᴛɪɴɢꜱ ᴀᴘᴘʟɪᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ 🚀`;

        m.reply(successMsg);
    }
};
