module.exports = {
    cmd: "setpp",
    alias: ["setbotpp"],
    desc: "Change Bot Profile Picture",
    category: "owner",
    isOwner: true,
    async execute(conn, m) {
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        
        if (!/image/.test(mime)) return m.reply("❌ Please reply to an image.");
        
        await m.react("📸");
        const media = await quoted.download();
        await conn.updateProfilePicture(conn.user.id, media);
        m.reply("✅ Bot Profile Picture updated successfully!");
    }
};
