const axios = require("axios");
const yts = require("yt-search");
const config = require("../config");

module.exports = {
    cmd: "play",
    alias: ["p", "song", "ytmp3"],
    desc: "Download audio using SilvaTech API",
    category: "download",
    async execute(conn, m, { text, pushname }) {
        if (!text) return m.reply(`❌ Please provide a song name or link!\n\nExample: *${config.PREFIX}play* Calm Down`);

        try {
            // 1. React to show processing
            await m.react("📥");

            // 2. Search YouTube to get Video URL and Info
            const search = await yts(text);
            const video = search.videos[0];
            if (!video) return m.reply("❌ No results found on YouTube.");

            const infoMsg = `🎵 *POPKID-MD AUDIO PLAYER*\n\n` +
                `📝 *Title:* ${video.title}\n` +
                `⏱️ *Duration:* ${video.timestamp}\n` +
                `👤 *Requested by:* ${pushname}\n\n` +
                `⏳ _Fetching audio from SilvaTech..._`;

            // 3. Send Info with Thumbnail
            await conn.sendMessage(m.from, { 
                image: { url: video.thumbnail }, 
                caption: infoMsg 
            }, { quoted: m });

            // 4. Fetch Download Link from SilvaTech API
            const apiURL = `https://api.silvatech.co.ke/download/ytmp3?url=${encodeURIComponent(video.url)}`;
            const response = await axios.get(apiURL);
            const data = response.data;

            // Target the dl_link inside the result object
            const downloadUrl = data.result?.dl_link;

            if (!downloadUrl) {
                return m.reply("❌ Failed to fetch the audio link. The API might be down or limited.");
            }

            // 5. Send the Audio File
            await conn.sendMessage(m.from, { 
                audio: { url: downloadUrl }, 
                mimetype: "audio/mpeg",
                fileName: `${video.title}.mp3`
            }, { quoted: m });

            // Success React
            await m.react("✅");

        } catch (e) {
            console.error("SilvaTech Play Error:", e.message);
            m.reply("⚠️ An error occurred while downloading. Please try again later.");
        }
    }
};
