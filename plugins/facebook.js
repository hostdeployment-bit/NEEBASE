const axios = require('axios');

module.exports = {
    cmd: "facebook",
    alias: ["fb", "fbdl"],
    desc: "Download Facebook videos with Pro Branding",
    category: "DOWNLOAD",
    async execute(conn, m, { text }) {
        // --- THE PRO FIX: NO MORE .MATCH ERROR ---
        // We force the input to be a string immediately
        let input = text || m.body || '';
        if (typeof input !== 'string') input = input.toString();

        // Extract the URL from the input string
        let url = input.replace(m.prefix + m.command, '').trim();
        
        // Fallback: If still empty, check if we are replying to a link
        if (!url && m.quoted) {
            url = m.quoted.body || m.quoted.text || '';
        }

        if (!url || url.trim() === "") {
            return m.reply("📘 *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ꜰʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*Usage:* .fb <link>");
        }

        // Final URL cleaning
        url = url.trim().split(/\s+/)[0]; 

        try {
            await m.react("📥");

            // API Endpoint using the working Qasim structure
            const apiUrl = `https://gtech-api-xtp1.onrender.com/api/video/fb?apikey=APIKEY&url=${encodeURIComponent(url)}`;
            const res = await axios.get(apiUrl, { timeout: 60000 });
            const media = res?.data?.result?.media;

            if (!res.data.status || !media) {
                throw new Error("Video not found or link is private.");
            }

            const videoUrl = media.video_url_hd || media.video_url_sd;
            const caption = `📘 *𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*\n\n` +
                            `🎬 *Title:* ${media.title || "FB Video"}\n` +
                            `🎞 *Quality:* ${media.video_url_hd ? 'HD High' : 'SD Standard'}\n\n` +
                            `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 𝟤𝟢𝟤𝟨 🇰🇪`;

            await m.react("✅");

            // Smart m.reply automatically handles the Newsletter context
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
