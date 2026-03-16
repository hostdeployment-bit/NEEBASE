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
            // 1. Determine the target message (direct or quoted)
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || '';

            if (!mime) return m.reply("❌ Please reply to an image, video, audio, or document.");

            await m.react("⏳");
            m.reply("🚀 *ᴜᴘʟᴏᴀᴅɪɴɢ ᴛᴏ ᴄᴀᴛʙᴏx...*");

            // 2. Download the media into a buffer
            const buffer = await downloadMediaMessage(
                q,
                'buffer',
                {},
                { 
                    logger: conn.logger, 
                    reuploadRequest: conn.updateMediaMessage 
                }
            );

            if (!buffer) throw new Error("Could not download media.");

            // 3. Check file size (10MB Limit for stability)
            if (buffer.length > 10 * 1024 * 1024) {
                return m.reply("✴️ ꜰɪʟᴇ ᴛᴏᴏ ʟᴀʀɢᴇ. ᴍᴀx ʟɪᴍɪᴛ ɪꜱ 10ᴍʙ.");
            }

            // 4. Detect file extension
            const type = await fileTypeFromBuffer(buffer);
            const extension = type ? type.ext : "bin";

            // 5. Upload to Catbox API
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', buffer, `popkid.${extension}`);

            const res = await axios.post('https://catbox.moe/user/api.php', form, {
                headers: { ...form.getHeaders() }
            });

            const url = res.data;

            if (!url || typeof url !== 'string' || !url.startsWith('https')) {
                throw new Error("Invalid API response.");
            }

            // 6. Success Output
            const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
            const successMsg = `✅ *ᴜᴘʟᴏᴀᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟ*\n\n` +
                               `🔗 *ᴜʀʟ:* ${url}\n` +
                               `💾 *ꜱɪᴢᴇ:* ${sizeMB} MB\n\n` +
                               `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 🇰🇪`;

            await m.react("🔗");
            return m.reply(successMsg);

        } catch (e) {
            console.error("Upload Error:", e);
            await m.react("❌");
            return m.reply(`❌ *ᴜᴘʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ:* ${e.message}`);
        }
    }
};
