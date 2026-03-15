const axios = require("axios");

module.exports = {
    cmd: "sticker",
    alias: ["s", "stiker"],
    desc: "Convert image/video to sticker via API",
    category: "convert",
    async execute(conn, m) {
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!mime) return m.reply("❌ Please reply to an image or a short video!");

        try {
            await m.react("🎨");

            // 1. Download the media from WhatsApp
            const media = await quoted.download();
            
            // 2. Upload to a temporary file host (Catbox) to get a URL for the API
            const formData = new (require('form-data'))();
            formData.append('fileToUpload', media, { filename: 'sticker_med' });
            formData.append('reqtype', 'fileupload');
            
            const uploadRes = await axios.post('https://catbox.moe/user/api.php', formData, {
                headers: formData.getHeaders()
            });

            const fileUrl = uploadRes.data;

            // 3. Use an API to convert the URL to a WebP Sticker
            // Using a public 2026 API for conversion
            const stickerApi = `https://api.lolhuman.xyz/api/convert/towebp?apikey=GataDios&img=${encodeURIComponent(fileUrl)}`;
            
            const stickerRes = await axios.get(stickerApi, { responseType: 'arraybuffer' });

            // 4. Send the sticker back
            await conn.sendMessage(m.from, { 
                sticker: Buffer.from(stickerRes.data) 
            }, { quoted: m });

            await m.react("✅");

        } catch (e) {
            console.error("Sticker API Error:", e.message);
            m.reply("❌ API Conversion failed. Make sure you have 'form-data' and 'axios' installed.");
        }
    }
};
