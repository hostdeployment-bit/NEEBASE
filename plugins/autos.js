const config = require("../config");

module.exports = {
    cmd: "autobio",
    alias: ["autotyping", "autorecording", "nonprefix", "autostatusview", "autoreact", "alwaysonline"],
    desc: "Toggle engine features",
    category: "OWNER",
    isOwner: true,
    async execute(conn, m, { text, command }) {
        // 1. Identify which config key to update based on the command used
        let key;
        let name;

        if (command === "autobio") { key = "AUTO_BIO"; name = "ᴀᴜᴛᴏ ʙɪᴏ"; }
        else if (command === "autotyping") { key = "AUTO_TYPING"; name = "ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ"; }
        else if (command === "autorecording") { key = "AUTO_RECORDING"; name = "ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ"; }
        else if (command === "nonprefix") { key = "NON_PREFIX"; name = "ɴᴏɴ-ᴘʀᴇꜰɪx"; }
        else if (command === "autostatusview") { key = "AUTO_READ_STATUS"; name = "ᴀᴜᴛᴏ ʀᴇᴀᴅ"; }
        else if (command === "autoreact") { key = "AUTO_REACT"; name = "ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ"; }
        else if (command === "alwaysonline") { key = "ALWAYS_ONLINE"; name = "ᴀʟᴡᴀʏꜱ ᴏɴʟɪɴᴇ"; }

        const input = text?.toLowerCase();

        // 2. If no "on" or "off", show current status
        if (input !== 'on' && input !== 'off') {
            const current = config[key] === "true" ? "🟢 ᴏɴ" : "🔴 ᴏꜰꜰ";
            return m.reply(`✨ *${name}* ✨\n\n◦ *ꜱᴛᴀᴛᴜꜱ:* ${current}\n◦ *ᴜꜱᴀɢᴇ:* .${command} on/off`);
        }

        // 3. Update the config
        config[key] = input === 'on' ? "true" : "false";
        
        // 4. Send the reaction and pretty confirmation
        await m.react(config[key] === "true" ? "✅" : "❌");

        const statusLabel = config[key] === "true" ? "🟢 ᴇɴᴀʙʟᴇᴅ" : "🔴 ᴅɪꜱᴀʙʟᴇᴅ";
        
        let feedback = `✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐔𝐏𝐃𝐀𝐓𝐄* ✨\n` +
                       `══════════════════\n` +
                       `✅ *${name}*\n` +
                       `ꜱᴛᴀᴛᴜꜱ: ${statusLabel}\n` +
                       `══════════════════\n` +
                       `> ꜱᴇᴛᴛɪɴɢꜱ ꜱᴀᴠᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ 🚀`;

        return m.reply(feedback);
    }
};
