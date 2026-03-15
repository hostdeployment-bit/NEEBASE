const axios = require('axios');
const fs = require('fs');
const path = require('path');
const settingsFile = path.join(__dirname, '../database/group_settings.json');

// Memory cache to prevent multiple listeners on restart
if (!global.chatbotInitialized) {
    global.chatbotInitialized = true;
}

module.exports = {
    cmd: "chatbot",
    alias: ["autoai", "popkidai"],
    desc: "Autonomous AI Chatbot Toggle",
    category: "ai",
    async execute(conn, m, { text }) {
        const dbDir = path.join(__dirname, '../database');
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
        let settings = fs.existsSync(settingsFile) ? JSON.parse(fs.readFileSync(settingsFile)) : {};

        // --- PART 1: COMMAND LOGIC (ON/OFF) ---
        if (text === "on") {
            settings[m.from] = { ...settings[m.from], autoai: true };
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
            return m.reply("🤖 *POPKID-MD AI:* Chatbot is now **ON**. I will reply to all messages in this chat.");
        } 
        
        if (text === "off") {
            settings[m.from] = { ...settings[m.from], autoai: false };
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
            return m.reply("😴 *POPKID-MD AI:* Chatbot is now **OFF**.");
        }

        if (!text) {
            const status = settings[m.from]?.autoai ? "ACTIVE ✅" : "INACTIVE ❌";
            return m.reply(`🤖 *POPKID-MD CHATBOT*\n\nStatus: ${status}\n\n*Usage:* .chatbot on/off`);
        }
    }
};

// --- PART 2: THE BACKGROUND LISTENER ---
// This hooks into your bot's connection to watch EVERY message arriving
// This is what makes it "Automatic" even without a prefix
setTimeout(() => {
    // We wait for the connection to be ready
    const conn = global.conn; // Ensure your index.js makes conn global
    if (!conn) return;

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.fromMe) return;

            const from = mek.key.remoteJid;
            const body = mek.message.conversation || mek.message.extendedTextMessage?.text;

            if (!body || body.startsWith('.') || body.startsWith('!') || body.startsWith('/')) return;

            // Check database settings
            if (!fs.existsSync(settingsFile)) return;
            let settings = JSON.parse(fs.readFileSync(settingsFile));
            if (!settings[from]?.autoai) return;

            // Show typing...
            await conn.sendPresenceUpdate('composing', from);

            // Call the Gemini API from your screenshot
            const { data } = await axios.get('https://api.qasimdev.dpdns.org/api/gemini/flash', {
                params: {
                    text: body,
                    apiKey: 'xbps-install-Syu',
                    GeminiKey: 'xbps-install-Syu'
                }
            });

            if (data?.data?.response) {
                await conn.sendMessage(from, { text: data.data.response }, { quoted: mek });
            }
        } catch (e) {
            // Silently handle errors to prevent crashing
        }
    });
}, 5000);
