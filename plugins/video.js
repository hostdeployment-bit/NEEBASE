const axios = require("axios");
const yts = require("yt-search");
const config = require("../config");

module.exports = {
    cmd: "video",
    alias: ["v", "mp4", "ytmp4"],
    desc: "Download MP4 video using GiftedTech API",
    category: "download",
    async execute(conn, m, { text, pushname }) {
        if (!text) return m.reply(`❌ Please provide a video name or link!\n\nExample: *${config.PREFIX}video* Madolla Kenna`);

        try {
            // 1. React to show processing
            await m.react("🎥");

            // 2. Search YouTube
            const search = await yts(text);
            const video = search.videos[0];
            if (!video) return m.reply("❌ No results found on YouTube.");

            const cleanUrl = video.url.split('&')[0];

            const infoMsg = `🎥 *POPKID-MD VIDEO PLAYER*\n\n` +
                `📝 *Title:* ${video.title}\n` +
                `⏱️ *Duration:* ${video.timestamp}\n` +
                `👤 *Requested by:* ${pushname}\n\n` +
                `⏳ _Fetching 720p video from GiftedTech..._`;

            // 3. Send Thumbnail and Info
            await conn.sendMessage(m.from, { 
                image: { url: video.thumbnail }, 
                caption: infoMsg 
            }, { quoted: m });

            // 4. Fetch Download Link
            // API parameters: apikey=gifted, quality=720p
            const apiURL = `https://api.giftedtech.co.ke/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(cleanUrl)}&quality=720p`;
            const response = await axios.get(apiURL);
            const data = response.data;

            const downloadUrl = data.result?.download_url;

            if (!downloadUrl) {
                console.log("GiftedTech Video Error:", data);
                return m.reply("❌ Failed to fetch video. The server might be busy or the file size is too large.");
            }

            // 5. Send the Video File
            await conn.sendMessage(m.from, { 
                video: { url: downloadUrl }, 
                caption: `🎥 *${video.title}*\n\n*POPKID-MD MASTER ENGINE*`,
                mimetype: "video/mp4"
            }, { quoted: m });

            await m.react("✅");

        } catch (e) {
            console.error("GiftedTech Video Error:", e.message);
            m.reply("⚠️ An error occurred while fetching the video. Try again later.");
        }
    }
};
