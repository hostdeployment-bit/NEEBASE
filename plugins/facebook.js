const axios = require('axios');
const config = require("../config");

module.exports = {
    cmd: "facebook",
    alias: ["fb", "fbdl"],
    desc: "Download Facebook videos with Full Newsletter branding",
    category: "DOWNLOAD",
    async execute(conn, m, { text }) {
        // Safety check to prevent .match/split errors
        let url = (text && typeof text === 'string') ? text.trim() : "";

        if (!url) {
            return m.reply("📘 *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ꜰʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n*Usage:* .fb <facebook link>");
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
            const caption = `📘 *𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*\n\n` +
                            `🎬 *Title:* ${media.title || "FB Video"}\n` +
                            `🎞 *Quality:* ${media.video_url_hd ? 'HD High' : 'SD Standard'}\n\n` +
                            `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 𝟤𝟢𝟤𝟨 🇰🇪`;

            await m.react("✅");

            // --- THE PRO FIX FOR NEWSLETTER DISPLAY ---
            return await conn.sendMessage(m.from, { 
                video: { url: videoUrl }, 
                mimetype: 'video/mp4', 
                caption: caption,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    // These 3 lines are what trigger the Newsletter name display
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.NEWSLETTER_JID || '120363423997837331@newsletter',
                        newsletterName: config.OWNER_NAME || '𝐏𝐎𝐏𝐊𝐈𝐃',
                        serverMessageId: 1
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('FB DL Error:', err);
            await m.react("❌");
            return m.reply(`❌ *ᴅᴏᴡɴʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ:*\n${err.message}`);
        }
    }
};
