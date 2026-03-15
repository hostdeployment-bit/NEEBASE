const axios = require("axios");
const yts = require("yt-search");
const config = require("../config");

module.exports = {
    cmd: "play",
    alias: ["p", "song", "ytmp3"],
    desc: "Download audio using GiftedTech API",
    category: "download",
    async execute(conn, m, { text, pushname }) {
        if (!text) return m.reply(`❌ Please provide a song name or link!\n\nExample: *${config.PREFIX}play* Maa To Mara`);

        try {
            // 1. React to show processing
            await m.react("📥");

            // 2. Search YouTube to get Video Info
            const search = await yts(text);
            const video = search.videos[0];
            if (!video) return m.reply("❌ No results found on YouTube.");

            // Ensure we have a clean URL for the API
            const cleanUrl = video.url.split('&')[0];

            const infoMsg = `🎵 *POPKID-MD AUDIO PLAYER*\n\n` +
                `📝 *Title:* ${video.title}\n` +
                `⏱️ *Duration:* ${video.timestamp}\n` +
                `👤 *Requested by:* ${pushname}\n\n` +
                `⏳ _Fetching audio from popkidapi..._`;

            // 3. Send Info with Thumbnail
            await conn.sendMessage(m.from, { 
                image: { url: video.thumbnail }, 
                caption: infoMsg 
            }, { quoted: m });

            // 4. Fetch Download Link from GiftedTech API
            // Using the structure: data.result.download_url
            const apiURL = `https://api.giftedtech.co.ke/api/download/ytmp3?apikey=gifted&url=${encodeURIComponent(cleanUrl)}&quality=128kbps`;
            const response = await axios.get(apiURL);
            const data = response.data;

            const downloadUrl = data.result?.download_url;

            if (!downloadUrl) {
                console.log("GiftedTech Response Error:", data);
                return m.reply("❌ Failed to fetch the audio link. The API might be down or video restricted.");
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
            console.error("GiftedTech Play Error:", e.message);
            m.reply("⚠️ An error occurred. Please try again later or check your API connection.");
        }
    }
};
