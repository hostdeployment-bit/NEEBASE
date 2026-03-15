/**
 * POPKID MD - MASTER ENGINE 2026
 * Features: Plugin Loader, Multi-Platform Support, Auto-Reconnect
 */

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    Browsers, 
    makeCacheableSignalKeyStore 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const path = require("path");
const fs = require("fs");
const express = require("express");
const { loadSession } = require("./lib/sessionLoader");
const { sms } = require("./lib/serialize");
const { handleMessages } = require("./handler");
const config = require("./config");

const app = express();
const port = process.env.PORT || 8000;

// Global variable to store plugins
global.plugins = new Map();

async function startPopkid() {
    const sessionDir = path.join(__dirname, "sessions");
    await loadSession(config.SESSION_ID, sessionDir);

    // --- PLUGIN LOADER LOGIC ---
    const pluginsDir = path.join(__dirname, "plugins");
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

    const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith(".js"));
    for (const file of pluginFiles) {
        try {
            const plugin = require(path.join(pluginsDir, file));
            if (plugin.cmd) {
                global.plugins.set(plugin.cmd, plugin);
                console.log(`🧩 Plugin Loaded: ${plugin.cmd}`);
            }
        } catch (e) {
            console.error(`❌ Error loading plugin ${file}:`, e);
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        browser: Browsers.macOS("Desktop"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        }
    });

    conn.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            let reason = lastDisconnect.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startPopkid();
        } else if (connection === "open") {
            console.log("✅ POPKID MD: Successfully Connected!");
            const ownerJid = config.OWNER_NUMBER[0] + "@s.whatsapp.net";
            await conn.sendMessage(ownerJid, { text: `🚀 *POPKID MD IS LIVE!*` });
        }
    });

    conn.ev.on("creds.update", saveCreds);

    conn.ev.on("messages.upsert", async (chatUpdate) => {
        const msg = chatUpdate.messages[0];
        if (!msg.message) return;
        const m = sms(conn, msg);
        await handleMessages(conn, m);
    });
}

app.get("/", (req, res) => res.send("POPKID MD ACTIVE"));
app.listen(port, () => startPopkid());
