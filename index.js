/**
 * POPKID MD - MASTER ENGINE 2026
 * Features: Plugin Loader, Auto-Bio, Auto-Follow, High-Stability Connection
 */

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    Browsers, 
    makeCacheableSignalKeyStore,
    getContentType
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const path = require("path");
const fs = require("fs");
const express = require("express");
const qrcode = require("qrcode-terminal");
const { loadSession } = require("./lib/sessionLoader");
const { handleMessages } = require("./handler");
const config = require("./config");

const app = express();
const port = process.env.PORT || 8000;

global.plugins = new Map();

async function startPopkid() {
    // 1. Load Session
    const sessionDir = path.join(__dirname, "sessions");
    await loadSession(config.SESSION_ID, sessionDir);

    // 2. Load Plugins into Global Map
    const pluginsDir = path.join(__dirname, "plugins");
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

    fs.readdirSync(pluginsDir).forEach((file) => {
        if (file.endsWith(".js")) {
            try {
                const plugin = require(path.join(pluginsDir, file));
                if (plugin.cmd) {
                    global.plugins.set(plugin.cmd, plugin);
                    console.log(`🧩 Loaded Plugin: ${plugin.cmd}`);
                }
            } catch (e) { console.error(`❌ Error in ${file}:`, e); }
        }
    });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        }
    });

    // 3. Connection Handler
    conn.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) qrcode.generate(qr, { small: true });

        if (connection === "close") {
            let reason = lastDisconnect.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startPopkid();
        } else if (connection === "open") {
            console.log("✅ POPKID MD: Successfully Connected!");

            // Auto-Follow Channel
            try {
                const channelJid = "120363423997837331@newsletter"; 
                await conn.newsletterFollow(channelJid);
            } catch (err) { console.log("Channel follow verified."); }

            const ownerJid = config.OWNER_NUMBER[0] + "@s.whatsapp.net";
            await conn.sendMessage(ownerJid, { text: `🚀 *POPKID MD IS LIVE!*` });
        }
    });

    conn.ev.on("creds.update", saveCreds);

    // 4. Message Upsert (The Trigger)
    conn.ev.on("messages.upsert", async (chatUpdate) => {
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        // MUST pass raw mek to handleMessages for status logic
        await handleMessages(conn, mek);
    });

    // 5. Auto Bio Interval
    setInterval(async () => {
        if (config.AUTO_BIO === "true" && conn.user) {
            const date = new Date().toLocaleDateString('en-KE', { timeZone: 'Africa/Nairobi' });
            const time = new Date().toLocaleTimeString('en-KE', { timeZone: 'Africa/Nairobi', hour12: false });
            const bioText = `❤️ ᴘᴏᴘᴋɪᴅ xᴍᴅ ʙᴏᴛ 🤖 ɪs ʟɪᴠᴇ ɴᴏᴡ\n📅 ${date}\n⏰ ${time}`;
            try { await conn.updateProfileStatus(bioText); } catch (err) {}
        }
    }, 60000);
}

app.get("/", (req, res) => res.send("POPKID MD ACTIVE"));
app.listen(port, () => startPopkid());
