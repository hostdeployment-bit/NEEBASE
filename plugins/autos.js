const config = require("../config");

// --- HELPER FUNCTION FOR CLEAN UI ---
const toggle = async (conn, m, key, name, text) => {
    const input = text?.toLowerCase();
    if (input !== 'on' && input !== 'off') {
        const current = config[key] === "true" ? "🟢 ᴏɴ" : "🔴 ᴏꜰꜰ";
        return m.reply(`✨ *${name}* ✨\n\n◦ *ᴄᴜʀʀᴇɴᴛ:* ${current}\n◦ *ᴜꜱᴀɢᴇ:* .${name.toLowerCase().replace(/ /g, '')} on/off`);
    }
    
    config[key] = input === 'on' ? "true" : "false";
    await m.react(config[key] === "true" ? "✅" : "❌");
    
    const status = config[key] === "true" ? "🟢 ᴇɴᴀʙʟᴇᴅ" : "🔴 ᴅɪꜱᴀʙʟᴇᴅ";
    return m.reply(`✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐔𝐏𝐃𝐀𝐓𝐄* ✨\n══════════════════\n✅ *${name}*\nꜱᴛᴀᴛᴜꜱ: ${status}\n══════════════════`);
};

// --- EXPORTING INDIVIDUAL COMMANDS ---
module.exports = [
    {
        cmd: "autobio",
        desc: "Toggle Auto Bio",
        category: "OWNER",
        isOwner: true,
        async execute(conn, m, { text }) { await toggle(conn, m, "AUTO_BIO", "ᴀᴜᴛᴏ ʙɪᴏ", text); }
    },
    {
        cmd: "autotyping",
        desc: "Toggle Auto Typing",
        category: "OWNER",
        isOwner: true,
        async execute(conn, m, { text }) { await toggle(conn, m, "AUTO_TYPING", "ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ", text); }
    },
    {
        cmd: "autorecording",
        desc: "Toggle Auto Recording",
        category: "OWNER",
        isOwner: true,
        async execute(conn, m, { text }) { await toggle(conn, m, "AUTO_RECORDING", "ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ", text); }
    },
    {
        cmd: "autostatusview",
        desc: "Toggle Auto Read Status",
        category: "OWNER",
        isOwner: true,
        async execute(conn, m, { text }) { await toggle(conn, m, "AUTO_READ_STATUS", "ᴀᴜᴛᴏ ʀᴇᴀᴅ", text); }
    },
    {
        cmd: "autoreact",
        desc: "Toggle Auto React Status",
        category: "OWNER",
        isOwner: true,
        async execute(conn, m, { text }) { await toggle(conn, m, "AUTO_REACT_STATUS", "ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ", text); }
    },
    {
        cmd: "nonprefix",
        desc: "Toggle Non-Prefix Mode",
        category: "OWNER",
        isOwner: true,
        async execute(conn, m, { text }) { await toggle(conn, m, "NON_PREFIX", "ɴᴏɴ-ᴘʀᴇꜰɪx", text); }
    },
    {
        cmd: "alwaysonline",
        desc: "Toggle Always Online",
        category: "OWNER",
        isOwner: true,
        async execute(conn, m, { text }) { await toggle(conn, m, "ALWAYS_ONLINE", "ᴀʟᴡᴀʏꜱ ᴏɴʟɪɴᴇ", text); }
    }
];
