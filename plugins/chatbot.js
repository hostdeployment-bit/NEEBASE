const axios = require('axios');
const fs = require('fs');
const path = require('path');
const settingsFile = path.join(__dirname, '../database/group_settings.json');

module.exports = {
    cmd: "chatbot",
    alias: ["autoai", "popkidai"],
    desc: "Autonomous AI Chatbot Toggle",
    category: "ai",
    async execute(conn, m, { text, pushname }) {
        const dbDir = path.join(__dirname, '../database');
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
        let settings = fs.existsSync(settingsFile) ? JSON.parse(fs.readFileSync(settingsFile)) : {};

        // --- PART 1: THE TOGGLE COMMAND ---
        // If the user types ".chatbot on" or ".chatbot off"
        if (text === "on") {
            settings[m.from] = { ...settings[m.from], autoai: true };
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
            return m.reply("🤖 *POPKID-MD AI:* Auto-reply is now **ENABLED** for this chat.");
        } 
        
        if (text === "off") {
            settings[m.from] = { ...settings[m.from], autoai: false };
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
            return m.reply("😴 *POPKID-MD AI:* Auto-reply is now **DISABLED**.");
        }

        // --- PART 2: THE AUTO-REPLY LOGIC ---
        // This part runs if the user ISN'T typing a command, but normal text
        const isAutoOn = settings[m.from]?.autoai;
        const isCommand = m.body.startsWith('.') || m.body.startsWith('!') || m.body.startsWith('/');

        // Only reply if Auto-AI is ON, it's NOT a command, and NOT from the bot itself
        if (isAutoOn && !isCommand && !m.key.fromMe && m.body) {
            const AI_API = 'https://api.qasimdev.dpdns.org/api/gemini/flash';
            const API_KEY = 'xbps-install-Syu';

            try {
                // Show typing status
                await conn.sendPresenceUpdate('composing', m.from);

                const { data } = await axios.get(AI_API, {
                    params: { query: m.body, apiKey: API_KEY }
                });

                if (data?.data?.response) {
                    await conn.sendMessage(m.from, { text: data.data.response }, { quoted: m });
                }
            } catch (e) {
                console.log("Chatbot Plugin Error:", e.message);
            }
            return; // Stop execution here so it doesn't try to process as a command
        }

        // If no text is provided and it's not auto-replying, show status
        if (!text) {
            const status = isAutoOn ? "ACTIVE ✅" : "INACTIVE ❌";
            return m.reply(`🤖 *POPKID-MD CHATBOT*\n\nStatus: ${status}\n\n*Usage:* .chatbot on/off`);
        }
    }
};
