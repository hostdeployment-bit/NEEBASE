const axios = require('axios');

module.exports = {
    cmd: "facebook",
    alias: ["fb", "fbdl"],
    desc: "Download Facebook videos with Pro Branding",
    category: "DOWNLOAD",
    async execute(conn, m, { text }) {
        // --- THE ULTIMATE FIX FOR .MATCH ERROR ---
        // 1. Try to get text from arguments
        // 2. Fallback to the message body (m.body)
        // 3. Fallback to quoted message text
        let url = (text && typeof text === 'string') ? text.trim() : 
                  (m.body && m.body.includes(' ')) ? m.body.split(' ').slice(1).join(' ') : 
                  (m.quoted && m.quoted.body) ? m.quoted.body : "";

        // Ensure we only have the link (clean up any extra text)
        url = url.trim();

        if (!url || url === "") {
            return m.reply("📘 *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ꜰʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*Usage:* .fb <facebook link>");
        }

        // Basic validation check before API call
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
            if (!videoUrl) throw new Error("Could not extract video URL.");

            const caption = `📘 *𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*\n\n` +
                            `🎬 *Title:* ${media.title || "Facebook Video"}\n` +
                            `🎞 *Quality:* ${media.video_url_hd ? 'HD High' : 'SD Standard'}\n\n` +
                            `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 𝟤𝟢𝟤𝟨 🇰🇪`;

            await m.react("✅");

            // Use the smart m.reply from serialize.js to show Newsletter branding
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
