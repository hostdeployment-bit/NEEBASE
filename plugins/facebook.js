const axios = require('axios');

module.exports = {
    cmd: "facebook",
    alias: ["fb", "fbdl"],
    desc: "Download Facebook videos with Pro Branding",
    category: "DOWNLOAD",
    async execute(conn, m, { text }) {
        // --- MATCHING THE URL.JS STYLE ---
        // Ensures input is strictly treated as a string to avoid .match/split errors
        let url = (text && typeof text === 'string') ? text.trim() : "";

        if (!url) {
            return m.reply("📘 *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ꜰʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*Usage:* .fb <facebook link>");
        }

        // Basic Regex check for Facebook domains
        if (!/facebook\.com|fb\.watch/i.test(url)) {
            return m.reply("❌ *ɪɴᴠᴀʟɪᴅ ʟɪɴᴋ.* ᴘʟᴇᴀꜱᴇ ꜱᴇɴᴅ ᴀ ᴠᴀʟɪᴅ ꜰᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ ᴜʀʟ.");
        }

        try {
            await m.react("📥");

            // Qasim API Endpoint (Matches your successful JSON test)
            const apiUrl = `https://gtech-api-xtp1.onrender.com/api/video/fb?apikey=APIKEY&url=${encodeURIComponent(url)}`;
            const res = await axios.get(apiUrl, { timeout: 60000 });

            // Targeted path: res.data.result.media
            const media = res?.data?.result?.media;

            if (!res.data.status || !media) {
                throw new Error("Video not found or link is private.");
            }

            // Quality selection logic
            const videoUrl = media.video_url_hd || media.video_url_sd;
            if (!videoUrl) throw new Error("Could not extract video URL.");

            const caption = `📘 *𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*\n\n` +
                            `🎬 *Title:* ${media.title || "Facebook Video"}\n` +
                            `🎞 *Quality:* ${media.video_url_hd ? 'HD High' : 'SD Standard'}\n\n` +
                            `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 𝟤𝟢𝟤𝟨 🇰🇪`;

            await m.react("✅");

            // --- THE AUTO-BRANDING FIX ---
            // Just like url.js, we pass the object to m.reply
            // This forces serialize.js to attach the newsletter context automatically
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
