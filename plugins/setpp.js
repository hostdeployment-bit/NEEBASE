module.exports = {
    cmd: "setpp",
    alias: ["setbotpp"],
    desc: "Change Bot Profile Picture",
    category: "owner",
    isOwner: true,
    async execute(conn, m) {
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        
        if (!/image/.test(mime)) return m.reply("❌ Please reply to a photo.");
        
        await m.react("📸");
        try {
            const media = await quoted.download();
            const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            
            await conn.updateProfilePicture(botJid, media);
            m.reply("✅ Profile Picture Updated!");
        } catch (e) {
            m.reply("❌ Error: " + e.message);
        }
    }
};
