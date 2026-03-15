module.exports = {
    cmd: "setpp",
    alias: ["setbotpp"],
    desc: "Change Bot Profile Picture",
    category: "owner",
    isOwner: true,
    async execute(conn, m) {
        // 1. Get the quoted message or the message itself
        const quoted = m.quoted ? m.quoted : m;
        
        // 2. Comprehensive check for ANY image data (Photo, Document-Image, or Thumbnail)
        const mime = (quoted.msg || quoted).mimetype || '';
        const isImage = /image/.test(mime);
        const hasImgMsg = quoted.imageMessage || (quoted.msg && quoted.msg.imageMessage);
        const hasThumbnail = quoted.msg?.thumbnail || quoted.msg?.jpegThumbnail;

        if (!isImage && !hasImgMsg && !hasThumbnail) {
            return m.reply("❌ Please reply to an image (either as a photo or a document).");
        }
        
        await m.react("📸");

        try {
            // 3. Robust download logic
            let media;
            if (quoted.download) {
                media = await quoted.download();
            } else if (hasThumbnail && !isImage) {
                media = hasThumbnail; // Fallback to thumbnail if download fails
            }

            if (!media) return m.reply("❌ Could not extract image data. Please try sending the image again.");

            // 4. Update the Profile Picture
            const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            await conn.updateProfilePicture(botJid, media);
            
            await m.react("✅");
            m.reply("✅ *POPKID-MD* profile picture updated successfully!");
            
        } catch (e) {
            console.error("SetPP Error:", e);
            m.reply(`❌ Error: ${e.message}`);
        }
    }
};
