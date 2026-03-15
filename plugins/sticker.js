const { downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");
const axios = require("axios");
const Jimp = require("jimp");
const FormData = require("form-data");

module.exports = {
    cmd: "sticker",
    alias: ["s", "stiker"],
    desc: "Convert image to sticker with local processing",
    category: "convert",
    async execute(conn, m) {
        try {
            // 1. Raw extraction of the quoted message
            const messageContent = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
            const type = getContentType(messageContent);
            const mediaMsg = messageContent?.imageMessage || messageContent?.documentMessage;

            if (!mediaMsg || !/image/.test(mediaMsg.mimetype)) {
                return m.reply("❌ Please reply to an image!");
            }

            await m.react("🎨");

            // 2. Direct Raw Download
            const stream = await downloadContentFromMessage(mediaMsg, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 3. Local Pre-processing with Jimp (The Secret Sauce)
            // This crops and resizes the image to 512x512 so the API can't fail
            const image = await Jimp.read(buffer);
            image.cover(512, 512); // Makes it a perfect square for WhatsApp
            const processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

            // 4. Upload to Catbox
            const form = new FormData();
            form.append('fileToUpload', processedBuffer, { filename: 'sticker.jpg' });
            form.append('reqtype', 'fileupload');
            
            const upload = await axios.post('https://catbox.moe/user/api.php', form, {
                headers: form.getHeaders()
            });

            // 5. Final Conversion via API
            const stickerApi = `https://api.lolhuman.xyz/api/convert/towebp?apikey=GataDios&img=${encodeURIComponent(upload.data)}`;
            const stickerRes = await axios.get(stickerApi, { responseType: 'arraybuffer' });

            await conn.sendMessage(m.from, { 
                sticker: Buffer.from(stickerRes.data) 
            }, { quoted: m });

            await m.react("✅");

        } catch (e) {
            console.error("Sticker Error:", e);
            m.reply(`❌ Conversion Error: ${e.message}. Make sure 'form-data' is installed.`);
        }
    }
};
