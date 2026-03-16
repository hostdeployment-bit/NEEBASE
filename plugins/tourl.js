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
            // 1. PRO MEDIA HUNTER
            // We dig into the quoted message or the current message to find the media content
            let q = m.quoted ? m.quoted : m;
            
            // This looks for the content inside imageMessage, videoMessage, etc.
            let mime = (q.msg || q).mimetype || '';
            let mediaData = q.msg || (q.message ? q.message[Object.keys(q.message)[0]] : q);

            // Validation: Ensure we actually have a mimetype to work with
            if (!mime && !mediaData.mimetype) {
                return m.reply("❌ Error: Media not detected. Please reply directly to the image or video!");
            }

            const finalMime = mime || mediaData.mimetype;
            await m.react("⏳");

            // 2. STICKER-STYLE DOWNLOAD LOGIC
            // This is the manual stream method that you confirmed works for stickers
            const messageType = finalMime.split('/')[0].replace('application', 'document');
            const stream = await downloadContentFromMessage(mediaData, messageType);
            
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            if (!buffer || buffer.length === 0) throw new Error("File buffer is empty.");

            // 3. Size Check (10MB)
            if (buffer.length > 10 * 1024 * 1024) {
                return m.reply("✴️ *ꜰɪʟᴇ ᴛᴏᴏ ʟᴀʀɢᴇ.* ᴍᴀx ʟɪᴍɪᴛ ɪꜱ 10ᴍʙ.");
            }

            // 4. Detect Extension & Upload to Catbox
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
                throw new Error("Invalid API response from Catbox.");
            }

            // 5. Success Output
            const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
            await m.react("🔗");

            return m.reply(
                `✅ *ᴜᴘʟᴏᴀᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟ*\n\n` +
                `🔗 *ᴜʀʟ:* ${url}\n` +
                `💾 *ꜱɪᴢᴇ:* ${sizeMB} MB\n\n` +
                `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 🇰🇪`
            );

        } catch (e) {
            console.error("Final URL Error:", e);
            await m.react("❌");
            return m.reply(`❌ *ᴜᴘʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ:* ${e.message}`);
        }
    }
};
