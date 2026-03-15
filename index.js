/**
 * POPKID MD - MASTER ENGINE 2026
 * Features: Multi-Platform Support, Auto-Reconnect, Session Loader
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

async function startPopkid() {
    const sessionDir = path.join(__dirname, "sessions");
    await loadSession(config.SESSION_ID, sessionDir);

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
        },
        getMessage: async (key) => { return { conversation: 'POPKID MD' } } // Fix for Revoke/Delete
    });

    conn.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            let reason = lastDisconnect.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startPopkid();
        } else if (connection === "open") {
            console.log("✅ POPKID MD: Successfully Connected!");
            
            // Notify Owner
            const ownerJid = config.OWNER_NUMBER[0] + "@s.whatsapp.net";
            await conn.sendMessage(ownerJid, { 
                text: `🚀 *POPKID MD IS LIVE!*\n\n*Prefix:* ${config.PREFIX}\n*Mode:* Public\n*Owner:* ${config.OWNER_NAME}`,
                contextInfo: { externalAdReply: { title: "POPKID MD 2026", body: "Connected Successfully", previewType: "PHOTO", thumbnail: fs.readFileSync("./lib/thumb.jpg") }}
            });
        }
    });

    conn.ev.on("creds.update", saveCreds);

    conn.ev.on("messages.upsert", async (chatUpdate) => {
        const msg = chatUpdate.messages[0];
        if (!msg.message) return;
        const m = sms(conn, msg);
        await handleMessages(conn, m);
    });

    // Auto-Bio Function
    setInterval(async () => {
        if (config.AUTO_BIO === "true" && conn.user) {
            const date = new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
            await conn.updateProfileStatus(`POPKID MD 🤖 | Active Since: ${date}`);
        }
    }, 60000);
}

app.get("/", (req, res) => res.send("POPKID MD RUNNING..."));
app.listen(port, () => startPopkid());
