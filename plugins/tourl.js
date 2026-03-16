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
            // 1. UNIVERSAL MEDIA DETECTOR
            // This checks both direct messages and quoted messages for any media key
            let q = m.quoted ? m.quoted : m;
            let msg = q.msg || q;
            
            // Look for the actual media object inside the message
            let mediaObj = q.message?.imageMessage || q.imageMessage || 
                           q.message?.videoMessage || q.videoMessage || 
                           q.message?.audioMessage || q.audioMessage || 
                           q.message?.stickerMessage || q.stickerMessage ||
                           q.message?.documentMessage || q.documentMessage ||
                           (q.msg && q.msg.mimetype ? q.msg : null);

            if (!mediaObj || !mediaObj.mimetype) {
                return m.reply("❌ Error: I can't see the media. Please reply directly to the image/video!");
            }

            await m.react("⏳");

            // 2. EXTRACTION LOGIC
            const mime = mediaObj.mimetype;
            const messageType = mime.split('/')[0].replace('application', 'document');
            
            // 3. MANUAL DOWNLOAD STREAM
            const stream = await downloadContentFromMessage(mediaObj, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            if (!buffer || buffer.length === 0) throw new Error("File download failed.");

            // 4. Size check (10MB)
            if (buffer.length > 10 * 1024 * 1024) {
                return m.reply("✴️ *ꜰɪʟᴇ ᴛᴏᴏ ʟᴀʀɢᴇ.* ᴍᴀx ʟɪᴍɪᴛ ɪꜱ 10ᴍʙ.");
            }

            // 5. Detect extension and Upload
            const type = await fileTypeFromBuffer(buffer);
            const extension = type ? type.ext : "bin";

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
