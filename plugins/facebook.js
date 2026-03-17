const axios = require('axios');

module.exports = {
    cmd: "facebook",
    alias: ["fb", "fbdl"],
    desc: "Download Facebook videos using Qasim API",
    category: "DOWNLOAD",
    async execute(conn, m, { text }) {
        // Ping-style safety check for input
        let url = (text && typeof text === 'string') ? text.trim() : "";

        if (!url) {
            return m.reply("📘 *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ꜰʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*Usage:* .fb <facebook link>");
        }

        try {
            await m.react("📥");

            // API Endpoint matching your tested JSON structure
            const apiUrl = `https://gtech-api-xtp1.onrender.com/api/video/fb?apikey=APIKEY&url=${encodeURIComponent(url)}`;
            const res = await axios.get(apiUrl, { timeout: 60000 });

            // Extraction path from your JSON: res.data.result.media
            const media = res?.data?.result?.media;

            if (!res.data.status || !media) {
                throw new Error("Video not found or link is private.");
            }

            // Quality selection logic: Prioritize HD High
            const videoUrl = media.video_url_hd || media.video_url_sd;
            const title = media.title || "Facebook Video";

            if (!videoUrl) throw new Error("Could not extract video URL.");

            // Ping-style clean caption
            const caption = `📘 *ꜰᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
                            `🎬 *ᴛɪᴛʟᴇ:* ${title}\n` +
                            `🎞 *ǫᴜᴀʟɪᴛʏ:* ${media.video_url_hd ? 'ʜᴅ ʜɪɢʜ' : 'sᴅ sᴛᴀɴᴅᴀʀᴅ'}\n\n` +
                            `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 𝟤𝟢𝟤𝟨 🇰🇪`;

            await m.react("✅");

            // Execute sending using your smart m.reply branding
            return await m.reply({ 
                video: { url: videoUrl }, 
                mimetype: 'video/mp4', 
                caption: caption 
            });

        } catch (err) {
            console.error('FB DL Error:', err);
            await m.react("❌");
            return m.reply(`❌ *ᴅᴏᴡɴʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ:*\n${err.message}`);
        }
    }
};
