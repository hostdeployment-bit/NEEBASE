const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const FormData = require('form-data');
const { fileTypeFromBuffer } = require('file-type');

module.exports = {
    cmd: "tourl",
    alias: ["url", "upload", "catbox"],
    desc: "Convert media to a permanent link",
    category: "TOOLS",
    async execute(conn, m) {
        try {
            // 1. Identify the actual media message (direct or quoted)
            let q = m.quoted ? m.quoted : m;
            
            // This part ensures we get the correct message type even if it's quoted
            let mime = (q.msg || q).mimetype || q.mediaType || '';

            if (!mime || mime === '') {
                return m.reply("❌ Please reply to an image, video, audio, or document.");
            }

            await m.react("⏳");

            // 2. Download the media
            const buffer = await downloadMediaMessage(
                q,
                'buffer',
                {},
                { 
                    logger: conn.logger, 
                    reuploadRequest: conn.updateMediaMessage 
                }
            );

            if (!buffer) throw new Error("Failed to download media.");

            // 3. Size check (10MB)
            if (buffer.length > 10 * 1024 * 1024) {
                return m.reply("✴️ ꜰɪʟᴇ ᴛᴏᴏ ʟᴀʀɢᴇ. ᴍᴀx ʟɪᴍɪᴛ ɪꜱ 10ᴍʙ.");
            }

            // 4. Detect file type
            const type = await fileTypeFromBuffer(buffer);
            const extension = type ? type.ext : "bin";

            // 5. Upload to Catbox
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', buffer, `popkid.${extension}`);

            const res = await axios.post('https://catbox.moe/user/api.php', form, {
                headers: { ...form.getHeaders() }
            });

            const url = res.data;

            if (!url || typeof url !== 'string' || !url.startsWith('https')) {
                throw new Error("Invalid response from Catbox.");
            }

            // 6. Final success output
            const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
            await m.react("🔗");
            
            return m.reply(`✅ *ᴜᴘʟᴏᴀᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟ*\n\n🔗 *ᴜʀʟ:* ${url}\n💾 *ꜱɪᴢᴇ:* ${sizeMB} MB\n\n> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 🇰🇪`);

        } catch (e) {
            console.error("Upload Error:", e);
            await m.react("❌");
            return m.reply(`❌ *ᴜᴘʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ:* ${e.message}`);
        }
    }
};
