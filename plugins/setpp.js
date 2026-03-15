module.exports = {
    cmd: "setpp",
    alias: ["setbotpp"],
    desc: "Change Bot Profile Picture",
    category: "owner",
    isOwner: true,
    async execute(conn, m) {
        // 1. Better detection for quoted media
        const quoted = m.quoted ? m.quoted : m;
        
        // We check for mimetype in several places to be safe
        const mime = (quoted.msg || quoted).mimetype || quoted.mimetype || '';
        const isImage = /image/.test(mime) || quoted.imageMessage || (quoted.msg && quoted.msg.imageMessage);
        
        if (!isImage) {
            return m.reply("❌ Please reply to an actual image.");
        }
        
        await m.react("📸");

        try {
            // 2. Download the buffer properly
            const media = await quoted.download();
            if (!media) return m.reply("❌ Failed to download the image. Try again.");

            // 3. Update the Profile Picture
            // Using conn.user.id ensures we target the bot's own JID
            const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            await conn.updateProfilePicture(botJid, media);
            
            await m.react("✅");
            m.reply("✅ *POPKID-MD* profile picture has been updated!");
            
        } catch (e) {
            console.error("SetPP Error:", e);
            m.reply(`❌ Error updating PP: ${e.message}`);
        }
    }
};
