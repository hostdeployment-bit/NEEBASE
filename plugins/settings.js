const config = require("../config");

module.exports = {
    cmd: "settings",
    alias: ["status", "panel"],
    desc: "Engine configuration",
    category: "OWNER",
    isOwner: true,
    async execute(conn, m) {
        const engine = [
            { name: "ᴀᴜᴛᴏ ʀᴇᴀᴅ ꜱᴛᴀᴛᴜꜱ", val: config.AUTO_READ_STATUS },
            { name: "ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ ꜱᴛᴀᴛᴜꜱ", val: config.AUTO_REACT_STATUS },
            { name: "ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ", val: config.AUTO_TYPING },
            { name: "ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ", val: config.AUTO_RECORDING },
            { name: "ᴀᴜᴛᴏ ʙɪᴏ", val: config.AUTO_BIO },
            { name: "ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ", val: config.AUTO_REACT },
            { name: "ɴᴏɴ-ᴘʀᴇꜰɪx ᴍᴏᴅᴇ", val: config.NON_PREFIX },
            { name: "ᴀʟᴡᴀʏꜱ ᴏɴʟɪɴᴇ", val: config.ALWAYS_ONLINE }
        ];

        let dashboard = `╭══════════════════⊷\n` +
                        `║   ✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃* ✨\n` +
                        `╠══════════════════⊷\n` +
                        `║ 👤 *ᴏᴡɴᴇʀ:* ${config.OWNER_NAME}\n` +
                        `║ 🌐 *ᴍᴏᴅᴇ:* ${config.MODE.toUpperCase()}\n` +
                        `╰══════════════════⊷\n\n`;

        engine.forEach((feat) => {
            const state = feat.val === "true" ? "🟢 ᴏɴ" : "🔴 ᴏꜰꜰ";
            dashboard += ` ◦ *${feat.name}:* ${state}\n`;
        });

        dashboard += `\n══════════════════⊷\n` +
                     `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 𝟤𝟢𝟤𝟨 🇰🇪`;

        await m.react("⚙️");
        await conn.sendMessage(m.from, { text: dashboard }, { quoted: m });
    }
};
