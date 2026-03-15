const { writeExif } = require('../lib/sticker');

module.exports = {
    cmd: "sticker",
    alias: ["s", "stiker"],
    desc: "Convert image/video to sticker",
    category: "convert",
    async execute(conn, m) {
        // 1. Detect if the user replied to media or sent media with the command
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!mime) return m.reply("❌ Please reply to an image or a short video!");

        try {
            await m.react("🎨");

            // 2. Download the media buffer
            const media = await quoted.download();
            
            // 3. Convert to WebP
            let stickerBuffer;
            if (/image/.test(mime)) {
                stickerBuffer = await writeExif(media, 'image');
            } else if (/video/.test(mime)) {
                // Ensure video isn't too long (Baileys usually limits this anyway)
                stickerBuffer = await writeExif(media, 'video');
            } else {
                return m.reply("❌ Unsupported file type!");
            }

            // 4. Send the sticker
            await conn.sendMessage(m.from, { 
                sticker: stickerBuffer 
            }, { quoted: m });

            await m.react("✅");

        } catch (e) {
            console.error("Sticker Error:", e);
            m.reply("❌ Conversion failed. Make sure FFMPEG is installed on your panel.");
        }
    }
};
