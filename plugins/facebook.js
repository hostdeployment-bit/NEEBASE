const axios = require('axios');

module.exports = {
    cmd: "facebook",
    alias: ["fb", "fbdl"],
    desc: "Download Facebook videos with Pro Branding",
    category: "DOWNLOAD",
    async execute(conn, m, { text }) {
        // --- SAFETY FIX FOR THE .MATCH ERROR ---
        // This ensures 'url' is always a string before we test it with Regex
        let url = (text && typeof text === 'string') ? text.trim() : "";

        if (!url) {
            return m.reply("📘 *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ꜰʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*Usage:* .fb <facebook link>");
        }

        if (!/facebook\.com|fb\.watch/i.test(url)) {
            return m.reply("❌ *ɪɴᴠᴀʟɪᴅ ʟɪɴᴋ.* ᴘʟᴇᴀꜱᴇ ꜱᴇɴᴅ ᴀ ᴠᴀʟɪᴅ ꜰᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ ᴜʀʟ.");
        }

        try {
            await m.react("📥");

            const apiUrl = `https://gtech-api-xtp1.onrender.com/api/video/fb?apikey=APIKEY&url=${encodeURIComponent(url)}`;
            const res = await axios.get(apiUrl, { timeout: 60000 });

            const media = res?.data?.result?.media;

            if (!res.data.status || !media) {
                throw new Error("Video not found or link is private.");
            }

            const videoUrl = media.video_url_hd || media.video_url_sd;
            const title = media.title || "Facebook Video";

            if (!videoUrl) throw new Error("Could not extract video URL.");

            const caption = `📘 *𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*\n\n` +
                            `🎬 *Title:* ${title}\n` +
                            `🎞 *Quality:* ${media.video_url_hd ? 'HD High' : 'SD Standard'}\n\n` +
                            `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 𝟤𝟢𝟤𝟨 🇰🇪`;

            await m.react("✅");

            // Using the smart m.reply from your serialize.js for branding
            return await m.reply({ 
                video: { url: videoUrl }, 
                mimetype: 'video/mp4', 
                caption: caption 
            });

        } catch (err) {
            console.error('FB DL Error:', err);
            await m.react("❌");
            // If the error persists, it might be the API endpoint itself failing
            return m.reply(`❌ *ᴅᴏᴡɴʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ:*\n${err.message}`);
        }
    }
};
