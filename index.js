/**
 * POPKID MD - MASTER ENGINE 2026 (Unified Edition)
 * Features: Multi-Contact Status View/React, LID-Aware, Plugin Loader, Non-Prefix, Auto-Bio, Always Online
 * Creator: Popkid Kenya 🇰🇪
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
const util = require("util");
const { exec } = require("child_process");
const axios = require("axios"); 
const { File } = require("megajs"); // Required for your session format

// Internal Libraries
const { sms } = require("./lib/serialize");
const { GroupEvents } = require("./lib/groupEvents"); 
const { AntilinkHandler } = require("./lib/antilinkHandler"); 
const { AntideleteHandler } = require("./lib/antidelete"); 
const { handleTagDetection } = require("./lib/tagDetector"); 
const { handleIncomingCall } = require("./lib/callHandler"); 
const config = require("./config");

const app = express();
const port = process.env.PORT || 9090;

// Global Variables
global.plugins = new Map();
let conn; // ✅ GLOBAL conn declaration

async function startPopkid() {
    console.clear();
    console.log("🚀 Starting POPKID-MD Master Engine...");

    // =================== SESSION-AUTH (Your Format) ============================
    const sessionPath = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);

    if (!fs.existsSync(sessionPath + '/creds.json')) {
        if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
        
        console.log("[ 📥 ] Downloading session from MEGA...");
        const sessdata = config.SESSION_ID.replace("POPKID;;;", '');
        const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
        
        await new Promise((resolve, reject) => {
            filer.download((err, data) => {
                if (err) return reject(err);
                fs.writeFile(sessionPath + '/creds.json', data, () => {
                    console.log("[ 📥 ] Session downloaded ✅");
                    resolve();
                });
            });
        });
    }
    // ===========================================================================

    // 2. DYNAMIC PLUGIN LOADER
    const pluginsDir = path.join(__dirname, "plugins");
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

    fs.readdirSync(pluginsDir).forEach((file) => {
        if (file.endsWith(".js")) {
            try {
                const plugin = require(path.join(pluginsDir, file));
                if (plugin.cmd) {
                    global.plugins.set(plugin.cmd, plugin);
                    console.log(`🧩 Plugin Loaded: ${plugin.cmd}`);
                }
            } catch (e) { console.error(`❌ Plugin Load Error [${file}]:`, e.message); }
        }
    });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    // 3. INITIALIZE SOCKET
    conn = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        }
    });

    // 4. CONNECTION UPDATES
    conn.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) qrcode.generate(qr, { small: true });

        if (connection === "close") {
            let reason = lastDisconnect.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startPopkid();
        } else if (connection === "open") {
            console.log("✅ POPKID MD: Successfully Connected to WhatsApp!");
            
            if (config.ALWAYS_ONLINE === "true") {
                await conn.sendPresenceUpdate('available');
            }

            try {
                await conn.newsletterFollow("120363423997837331@newsletter");
            } catch (err) { console.log("Newsletter follow verified."); }

            const ownerJid = config.OWNER_NUMBER[0] + "@s.whatsapp.net";
            await conn.sendMessage(ownerJid, { 
                image: { url: "https://files.catbox.moe/j9ia5c.png" },
                caption: `🚀 *POPKID-MD IS LIVE!* \n\nPrefix: ${config.PREFIX}\nNon-Prefix: ${config.NON_PREFIX}\nStatus View: ${config.AUTO_READ_STATUS}` 
            });
        }
    });

    conn.ev.on("creds.update", saveCreds);

    conn.ev.on('call', async (call) => await handleIncomingCall(conn, call));

    conn.ev.on('group-participants.update', async (anu) => {
        await GroupEvents(conn, anu);
    });

    // 5. MESSAGE HANDLER
    conn.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            // Newsletter Context Injection
            const originalSendMessage = conn.sendMessage;
            conn.sendMessage = async (jid, content, options = {}) => {
                const newsletterContext = {
                    mentionedJid: [mek.key.participant || mek.participant || mek.key.remoteJid],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.NEWSLETTER_JID || '120363423997837331@newsletter',
                        newsletterName: config.OWNER_NAME || 'POPKID',
                        serverMessageId: 1
                    }
                };
                content.contextInfo = content.contextInfo ? { ...newsletterContext, ...content.contextInfo } : newsletterContext;
                return originalSendMessage.apply(conn, [jid, content, options]);
            };

            mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
            const from = mek.key.remoteJid;
            const type = getContentType(mek.message);

            // Status Management
            if (from === 'status@broadcast') {
                const shouldRead = config.AUTO_READ_STATUS === 'true';
                const shouldReact = config.AUTO_REACT_STATUS === 'true';
                const statusParticipant = mek.key.participant || mek.participant || mek.key.remoteJid;

                if (statusParticipant && statusParticipant !== 'status@broadcast') {
                    let realJid = statusParticipant;
                    const resolvedKey = { remoteJid: 'status@broadcast', id: mek.key.id, participant: realJid };

                    if (shouldRead) await conn.readMessages([resolvedKey]);
                    if (shouldReact) {
                        const emojis = ['🧩', '🌸', '💫', '🫀', '🧿', '🤖'];
                        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await conn.sendMessage(from, { react: { key: resolvedKey, text: emoji } }, { statusJidList: [realJid, conn.user.id.split(':')[0] + '@s.whatsapp.net'] });
                    }
                }
                return; 
            }

            // Auto-features for chats
            if (!mek.key.fromMe) {
                if (config.AUTO_TYPING === "true") await conn.sendPresenceUpdate('composing', from);
                if (config.AUTO_READ === "true") await conn.readMessages([mek.key]);
            }

            const m = sms(conn, mek); 
            await AntilinkHandler(conn, m, config.OWNER_NUMBER.includes(m.sender.split('@')[0]));
            await AntideleteHandler(conn, m);
            await handleTagDetection(conn, m);

            const body = m.body || '';
            const isCmd = body.startsWith(config.PREFIX);
            let command = isCmd ? body.slice(config.PREFIX.length).trim().split(' ').shift().toLowerCase() : (config.NON_PREFIX === "true" ? body.trim().split(' ').shift().toLowerCase() : '');
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ');
            const isOwner = config.OWNER_NUMBER.includes(m.sender.split('@')[0]) || m.fromMe;

            // Eval/Exec
            if (isOwner) {
                if (body.startsWith("$")) {
                    try { return m.reply(util.format(await eval(`(async () => { ${body.slice(1)} })()`))); } catch (e) { return m.reply(util.format(e)); }
                }
                if (body.startsWith("%")) {
                    exec(body.slice(1), (err, stdout) => { if (stdout) m.reply(stdout); });
                }
            }

            const plugin = global.plugins.get(command) || [...global.plugins.values()].find(p => p.alias && p.alias.includes(command));
            if (config.BOT_OFF === "true" && !isOwner) return;

            if (plugin) {
                if (plugin.isOwner && !isOwner) return m.reply("❌ Developer Restricted.");
                try { await plugin.execute(conn, m, { text, args, isOwner, isGroup: m.isGroup, pushname: m.pushName }); } catch (e) { console.error(e); }
            }

        } catch (e) { console.error("Event Error:", e.message); }
    });

    // Auto-Bio
    setInterval(async () => {
        if (config.AUTO_BIO === "true" && conn?.user) {
            const time = new Date().toLocaleTimeString('en-KE', { timeZone: 'Africa/Nairobi', hour12: false });
            try { await conn.updateProfileStatus(`❤️ ᴘᴏᴘᴋɪᴅ xᴍᴅ ʙᴏᴛ ɪs ʟɪᴠᴇ ⏰ ${time}`); } catch (err) {}
        }
    }, 60000);
}

// ============ [ ANTI-SLEEP & EXPRESS ] ============
app.get("/", (req, res) => res.send("POPKID-MD MASTER ENGINE ACTIVE ⚡"));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    startPopkid();
});
