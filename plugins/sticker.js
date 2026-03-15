const { downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");
const axios = require("axios");

module.exports = {
    cmd: "sticker",
    alias: ["s", "stiker"],
    desc: "Convert image/video to sticker",
    category: "convert",
    async execute(conn, m) {
        try {
            // 1. Raw extraction of the quoted message
            const messageContent = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
            const type = getContentType(messageContent);
            const mediaMsg = messageContent?.imageMessage || messageContent?.videoMessage || messageContent?.documentMessage;

            if (!mediaMsg || !/image|video/.test(mediaMsg.mimetype)) {
                return m.reply("❌ Please reply to an image or short video!");
            }

            await m.react("🎨");

            // 2. Direct Raw Download
            const stream = await downloadContentFromMessage(mediaMsg, /image/.test(mediaMsg.mimetype) ? 'image' : 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 3. Use API for encoding (No FFMPEG needed on your panel)
            const formData = new (require('form-data'))();
            formData.append('fileToUpload', buffer, { filename: 'popkid.jpg' });
            formData.append('reqtype', 'fileupload');
            
            const upload = await axios.post('https://catbox.moe/user/api.php', formData, {
                headers: formData.getHeaders()
            });

            const stickerApi = `https://api.lolhuman.xyz/api/convert/towebp?apikey=GataDios&img=${encodeURIComponent(upload.data)}`;
            const stickerRes = await axios.get(stickerApi, { responseType: 'arraybuffer' });

            await conn.sendMessage(m.from, { sticker: Buffer.from(stickerRes.data) }, { quoted: m });
            await m.react("✅");

        } catch (e) {
            console.error(e);
            m.reply("❌ Sticker conversion failed. Try a smaller file!");
        }
    }
};
