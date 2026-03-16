const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
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
            // 1. Identify source (Direct or Quoted) - Using deep-scan logic
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || '';
            
            if (!mime) {
                return m.reply("❌ Please reply to an image, video, audio, or document!");
            }

            await m.react("⏳");

            // 2. DOWNLOAD LOGIC (Copied from your working sticker.js)
            const messageType = mime.split('/')[0].replace('application', 'document');
            const stream = await downloadContentFromMessage(q.msg || q, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            if (!buffer || buffer.length === 0) throw new Error("Buffer is empty.");

            // 3. Size check (10MB)
            if (buffer.length > 10 * 1024 * 1024) {
                return m.reply("✴️ *ꜰɪʟᴇ ᴛᴏᴏ ʟᴀʀɢᴇ.* ᴍᴀx ʟɪᴍɪᴛ ɪꜱ 10ᴍʙ.");
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

            // 6. Success Output
            const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
            await m.react("🔗");

            return m.reply(
                `✅ *ᴜᴘʟᴏᴀᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟ*\n\n` +
                `🔗 *ᴜʀʟ:* ${url}\n` +
                `💾 *ꜱɪᴢᴇ:* ${sizeMB} MB\n\n` +
                `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 🇰🇪`
            );

        } catch (e) {
            console.error("Catbox Upload Error:", e);
            await m.react("❌");
            return m.reply(`❌ *ᴜᴘʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ:* ${e.message}`);
        }
    }
};
