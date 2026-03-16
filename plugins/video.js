const axios = require('axios');
const yts = require('yt-search');

module.exports = {
    cmd: "video",
    alias: ["ytmp4", "vid"],
    desc: "Download and play videos from YouTube",
    category: "DOWNLOAD",
    async execute(conn, m, { text }) {
        if (!text) return m.reply("🎬 *ᴜꜱᴀɢᴇ:* .video <song name or YouTube link>");

        const DL_API = 'https://api.qasimdev.dpdns.org/api/loaderto/download';
        const API_KEY = 'xbps-install-Syu';

        try {
            let video;
            const query = text.trim();

            // 1. Search Logic (Same as your working play command)
            if (query.includes('youtube.com') || query.includes('youtu.be')) {
                video = { url: query, title: "YouTube Video" };
            } else {
                await m.react("🔍");
                const search = await yts(query);
                video = search.videos[0];
            }

            if (!video) return m.reply("❌ *ɴᴏ ʀᴇꜱᴜʟᴛꜱ ꜰᴏᴜɴᴅ!*");

            // 2. Send Preview Card
            const preview = `🎬 *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐕𝐈𝐃𝐄𝐎* 🎬\n` +
                            `══════════════════\n` +
                            `📌 *ᴛɪᴛʟᴇ:* ${video.title}\n` +
                            `⏱️ *ᴅᴜʀᴀᴛɪᴏɴ:* ${video.timestamp || 'ɴ/ᴀ'}\n` +
                            `🔗 *ʟɪɴᴋ:* ${video.url}\n` +
                            `══════════════════\n` +
                            `⏳ _ᴄᴏɴᴠᴇʀᴛɪɴɢ... ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ_`;

            await conn.sendMessage(m.from, {
                image: { url: video.thumbnail || 'https://files.catbox.moe/j9ia5c.png' },
                caption: preview
            }, { quoted: m });

            // 3. Optimized Download Logic
            const { data } = await axios.get(DL_API, {
                params: { 
                    apiKey: API_KEY, 
                    format: 'mp4', // Specifically asking for MP4
                    url: video.url 
                },
                timeout: 300000, // Increased to 5 minutes for heavy video processing
            });

            if (!data?.data?.downloadUrl) throw new Error('API_LIMIT');

            // 4. Send the Video File
            await conn.sendMessage(m.from, {
                video: { url: data.data.downloadUrl },
                mimetype: 'video/mp4',
                fileName: `${video.title}.mp4`,
                caption: `✅ *${video.title}* ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ.\n> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 🇰🇪`
            }, { quoted: m });

            await m.react("✅");

        } catch (err) {
            console.error(err);
            // Friendly error message for the user
            m.reply(`❌ *ᴅᴏᴡɴʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ:*\n\n_ᴛʜᴇ ᴠɪᴅᴇᴏ ᴍɪɢʜᴛ ʙᴇ ᴛᴏᴏ ʟᴀʀɢᴇ ᴏʀ ᴛʜᴇ ᴀᴘɪ ɪꜱ ʙᴜꜱʏ. ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ɪɴ ᴀ ᴍᴏᴍᴇɴᴛ._`);
        }
    }
};
