const axios = require('axios');
const yts = require('yt-search');

module.exports = {
    cmd: "video",
    alias: ["ytmp4", "playvid"],
    desc: "Download and play videos from YouTube",
    category: "DOWNLOAD",
    async execute(conn, m, { text }) {
        if (!text) return m.reply("🎬 *ᴜꜱᴀɢᴇ:* .video <song name or YouTube link>");

        const DL_API = 'https://api.qasimdev.dpdns.org/api/loaderto/download';
        const API_KEY = 'xbps-install-Syu';

        try {
            let video;
            const query = text.trim();

            // 1. Search Logic
            if (query.includes('youtube.com') || query.includes('youtu.be')) {
                video = { url: query, title: "YouTube Video" };
            } else {
                await m.react("🔍");
                const search = await yts(query);
                video = search.videos[0];
            }

            if (!video) return m.reply("❌ *ɴᴏ ʀᴇꜱᴜʟᴛꜱ ꜰᴏᴜɴᴅ!*");

            // 2. Send Preview Info
            const preview = `🎬 *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐕𝐈𝐃𝐄𝐎* 🎬\n` +
                            `══════════════════\n` +
                            `📌 *ᴛɪᴛʟᴇ:* ${video.title}\n` +
                            `⏱️ *ᴅᴜʀᴀᴛɪᴏɴ:* ${video.timestamp || 'ɴ/ᴀ'}\n` +
                            `🔗 *ʟɪɴᴋ:* ${video.url}\n` +
                            `══════════════════\n` +
                            `⏳ _ᴄᴏɴᴠᴇʀᴛɪɴɢ ᴛᴏ ᴍᴘ𝟺... ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ_`;

            await conn.sendMessage(m.from, {
                image: { url: video.thumbnail || 'https://files.catbox.moe/j9ia5c.png' },
                caption: preview
            }, { quoted: m });

            // 3. Download Logic (Format: mp4)
            const getVideo = async (url) => {
                const { data } = await axios.get(DL_API, {
                    params: { apiKey: API_KEY, format: 'mp4', url },
                    timeout: 120000, // Videos take longer than audio
                });
                if (data?.data?.downloadUrl) return data.data;
                throw new Error('ᴀᴘɪ ᴇʀʀᴏʀ');
            };

            const videoData = await getVideo(video.url);

            // 4. Send Video File
            await conn.sendMessage(m.from, {
                video: { url: videoData.downloadUrl },
                mimetype: 'video/mp4',
                fileName: `${video.title}.mp4`,
                caption: `✅ *${video.title}* \n> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 🇰🇪`
            }, { quoted: m });

            await m.react("✅");

        } catch (err) {
            console.error(err);
            m.reply(`❌ *ᴅᴏᴡɴʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ:* ᴛɪᴍᴇᴏᴜᴛ ᴏʀ ᴀᴘɪ ʟɪᴍɪᴛ.`);
        }
    }
};
