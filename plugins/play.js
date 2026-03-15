const axios = require("axios");
const yts = require("yt-search");
const config = require("../config");

// Your preferred API Base
const BASE_URL = process.env.BASE_URL || "https://noobs-api.top";

module.exports = {
    cmd: "play",
    alias: ["p", "song", "ytmp3"],
    desc: "Download audio from YouTube",
    category: "download",
    async execute(conn, m, { text, pushname }) {
        if (!text) return m.reply(`❌ Please provide a song name or link!\n\nExample: *${config.PREFIX}play* Calm Down`);

        try {
            // 1. React to show processing
            await m.react("📥");

            // 2. Search YouTube
            const search = await yts(text);
            const video = search.videos[0];
            if (!video) return m.reply("❌ No results found on YouTube.");

            const infoMsg = `🎵 *POPKID-MD AUDIO PLAYER*\n\n` +
                `📝 *Title:* ${video.title}\n` +
                `⏱️ *Duration:* ${video.timestamp}\n` +
                `👤 *Requested by:* ${pushname}\n\n` +
                `⏳ _Uploading to WhatsApp, please wait..._`;

            // 3. Send Info with Thumbnail
            await conn.sendMessage(m.from, { 
                image: { url: video.thumbnail }, 
                caption: infoMsg 
            }, { quoted: m });

            // 4. Fetch Download Link from API
            // Using the ytdl3 endpoint which usually returns { status: 200, downloadLink: "url" }
            const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.url)}&format=mp3`;
            const response = await axios.get(apiURL);
            const data = response.data;
            
            // Flexible link check for different API versions
            const downloadUrl = data.downloadLink || (data.result && data.result.download) || (data.result && data.result.url);

            if (!downloadUrl) {
                return m.reply("❌ Failed to fetch the audio. The API might be down or the file is restricted.");
            }

            // 5. Send the Audio File
            // We use 'audio' key and ensure mimetype is correct
            await conn.sendMessage(m.from, { 
                audio: { url: downloadUrl }, 
                mimetype: "audio/mpeg",
                fileName: `${video.title}.mp3`
            }, { quoted: m });

            // Success React
            await m.react("✅");

        } catch (e) {
            console.error("Play Plugin Error:", e);
            m.reply("⚠️ API Error or Network timeout. Please try again with a different song name.");
        }
    }
};
