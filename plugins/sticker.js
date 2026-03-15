const axios = require("axios");
const FormData = require("form-data");

module.exports = {
    cmd: "sticker",
    alias: ["s", "stiker"],
    desc: "Convert image/video to sticker",
    category: "convert",
    async execute(conn, m) {
        try {
            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';
            
            // Check for direct media or thumbnail
            const hasThumbnail = quoted.msg?.thumbnail || quoted.msg?.jpegThumbnail;

            if (!/image|video/.test(mime) && !hasThumbnail) {
                return m.reply("❌ Please reply to an image or video!");
            }

            await m.react("🎨");

            // 1. Download Media
            let media = await quoted.download().catch(() => null);
            if (!media && hasThumbnail) media = hasThumbnail; 
            if (!media) return m.reply("❌ Could not download media. Try a newer message.");

            // 2. Upload to Catbox (Temporary Link)
            const form = new FormData();
            form.append('fileToUpload', media, { filename: 'sticker.jpg' });
            form.append('reqtype', 'fileupload');
            
            const upload = await axios.post('https://catbox.moe/user/api.php', form, {
                headers: form.getHeaders()
            });

            const fileUrl = upload.data;

            // 3. Convert via stable 2026 API
            const apiRes = await axios.get(`https://api.lolhuman.xyz/api/convert/towebp?apikey=GataDios&img=${encodeURIComponent(fileUrl)}`, { 
                responseType: 'arraybuffer' 
            });

            // 4. Send Sticker
            await conn.sendMessage(m.from, { 
                sticker: Buffer.from(apiRes.data) 
            }, { quoted: m });

            await m.react("✅");

        } catch (e) {
            console.error("Sticker Error:", e);
            m.reply(`❌ Error: ${e.message}. Ensure 'axios' and 'form-data' are installed.`);
        }
    }
};
