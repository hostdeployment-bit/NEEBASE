module.exports = {
    cmd: "setpp",
    alias: ["setbotpp"],
    desc: "Change Bot Profile Picture (Raw Mode)",
    category: "owner",
    isOwner: true,
    async execute(conn, m) {
        try {
            // 1. Dig into the raw message structure
            const quoted = m.quoted ? m.quoted : m;
            
            // Check every possible location for an image indicator
            const isImage = 
                m.type === 'imageMessage' || 
                quoted.type === 'imageMessage' || 
                (quoted.msg && quoted.msg.mimetype && quoted.msg.mimetype.includes('image')) ||
                m.msg?.mimetype?.includes('image');

            if (!isImage) {
                return m.reply("❌ Bot still can't 'see' the image. Try this: Send the photo to the bot, THEN reply to it.");
            }

            await m.react("⏳");

            // 2. Direct download from the source
            const media = await quoted.download().catch(() => null);
            
            if (!media) {
                return m.reply("❌ Download failed. The image data is missing from the server.");
            }

            // 3. Apply to Profile
            const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            await conn.updateProfilePicture(botJid, media);
            
            await m.react("✅");
            m.reply("✅ *POPKID-MD* Profile Picture updated!");

        } catch (e) {
            console.error("SetPP Critical Error:", e);
            m.reply(`❌ System Error: ${e.message}`);
        }
    }
};
