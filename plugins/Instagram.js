const axios = require('axios');

module.exports = {
    cmd: "instagram",
    alias: ["ig", "igdl"],
    desc: "Download Instagram Photos or Videos",
    category: "DOWNLOAD",
    async execute(conn, m, { text }) {
        // Safe string handling to prevent .match errors
        let input = text || m.body || '';
        if (typeof input !== 'string') input = input.toString();

        // Extract URL
        let url = input.replace(m.prefix + m.command, '').trim();
        
        // Fallback to quoted message if command is sent alone
        if (!url && m.quoted) {
            url = m.quoted.body || m.quoted.text || '';
        }

        if (!url || url.trim() === "") {
            return m.reply("📸 *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ɪɢ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*Usage:* .ig <instagram link>");
        }

        // Final clean-up of the URL
        url = url.trim().split(/\s+/)[0];

        try {
            await m.react("📥");

            // Using the IG API endpoint you provided
            const apiUrl = `https://gtech-api-xtp1.onrender.com/api/download/igdl?url=${encodeURIComponent(url)}&apikey=APIKEY`;
            
            const res = await axios.get(apiUrl, { timeout: 60000 });
            
            // Path based on your JSON: res.data.result.data (which is an array)
            const mediaList = res?.data?.result?.data;

            if (!res.data.status || !mediaList || mediaList.length === 0) {
                throw new Error("No media found. Make sure the link is public.");
            }

            await m.react("✅");

            // Loop through results if it's a carousel, or just send the first one
            for (let i = 0; i < mediaList.length; i++) {
                const mediaUrl = mediaList[i].url;
                const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('video');

                const caption = i === 0 ? `📸 *ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
                                `🎞 *Type:* ${isVideo ? 'Video' : 'Image'}\n` +
                                `📦 *Item:* ${i + 1}/${mediaList.length}\n\n` +
                                `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 𝟤𝟢𝟤𝟨 🇰🇪` : "";

                if (isVideo) {
                    await m.reply({ 
                        video: { url: mediaUrl }, 
                        mimetype: 'video/mp4', 
                        caption: caption 
                    });
                } else {
                    await m.reply({ 
                        image: { url: mediaUrl }, 
                        caption: caption 
                    });
                }
                
                // Slight delay for multiple items to prevent spam kick
                if (mediaList.length > 1) await new Promise(resolve => setTimeout(resolve, 1000));
            }

        } catch (err) {
            console.error('IG DL Error:', err);
            await m.react("❌");
            return m.reply(`❌ *ᴅᴏᴡɴʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ:*\n${err.message}`);
        }
    }
};
