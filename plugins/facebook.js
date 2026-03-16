const axios = require('axios');

module.exports = {
    cmd: "facebook",
    alias: ["fb", "fbdl"],
    desc: "Download high-quality Facebook videos",
    category: "DOWNLOAD",
    async execute(conn, m, { text }) {
        const url = text;

        if (!url) {
            return m.reply("📘 *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ꜰʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*Usage:* .fb <facebook video link>");
        }

        if (!/facebook\.com|fb\.watch/i.test(url)) {
            return m.reply("❌ *ɪɴᴠᴀʟɪᴅ ʟɪɴᴋ.* ᴘʟᴇᴀꜱᴇ ꜱᴇɴᴅ ᴀ ᴠᴀʟɪᴅ ꜰᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ ᴜʀʟ.");
        }

        try {
            await m.react("📥");

            // Using the API you provided
            const apiUrl = `https://gtech-api-xtp1.onrender.com/api/download/fb?url=${encodeURIComponent(url)}&apikey=APIKEY`;
            
            const res = await axios.get(apiUrl, {
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Accept': 'application/json, text/plain, */*'
                }
            });

            const videos = res?.data?.data?.data;

            if (!res?.data?.status || !Array.isArray(videos) || !videos.length) {
                throw new Error('No downloadable video found');
            }

            // Sort to get the highest resolution (Pro Touch)
            const sorted = videos.sort((a, b) => {
                const qa = parseInt(a.resolution, 10) || 0;
                const qb = parseInt(b.resolution, 10) || 0;
                return qb - qa;
            });

            const selected = sorted[0];
            const videoUrl = selected.url.startsWith('http')
                ? selected.url
                : `https://gtech-api-xtp1.onrender.com${selected.url}`;

            const caption = `📘 *ꜰᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
                            `🎞 *Quality:* ${selected.resolution || 'Auto'}\n\n` +
                            `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 𝟤𝟢𝟤𝟨 🇰🇪`;

            await m.react("✅");
            
            // Sending the video with your global newsletter context (handled by serialize.js)
            return await conn.sendMessage(m.from, { 
                video: { url: videoUrl }, 
                mimetype: 'video/mp4', 
                caption: caption 
            }, { quoted: m });

        } catch (err) {
            console.error('Facebook DL Error:', err);
            await m.react("❌");
            return m.reply("❌ *ꜰᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏ.*\nᴛʜᴇ ᴀᴘɪ ᴍɪɢʜᴛ ʙᴇ ᴅᴏᴡɴ ᴏʀ ᴛʜᴇ ᴠɪᴅᴇᴏ ɪꜱ ᴘʀɪᴠᴀᴛᴇ.");
        }
    }
};
