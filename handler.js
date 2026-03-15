/**
 * POPKID MD - MASTER HANDLER 2026
 * Features: High-Stability Status Handler (LID Aware), Plugin Execution, Eval
 */

const config = require("./config");
const util = require("util");
const { exec } = require("child_process");
const { getContentType } = require("@whiskeysockets/baileys");

async function handleMessages(conn, mek) {
    try {
        const from = mek.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const type = getContentType(mek.message);
        const pushname = mek.pushName || 'User';
        
        // 1. AUTO READ & REACT STATUS (YOUR UPDATED LOGIC) ✅
        if (mek.key && mek.key.remoteJid === 'status@broadcast') {
            try {
                const shouldRead = config.AUTO_READ_STATUS === 'true';
                const shouldReact = config.AUTO_REACT_STATUS === 'true';
                const statusParticipant = mek.key.participant || null;

                if (statusParticipant) {
                    let realJid = statusParticipant;

                    // Resolve LID → real phone JID logic
                    if (statusParticipant.endsWith('@lid')) {
                        const rawPn = mek.key?.participantPn || mek.key?.senderPn;
                        if (rawPn) {
                            realJid = rawPn.includes('@') ? rawPn : `${rawPn}@s.whatsapp.net`;
                        } else {
                            const contacts = conn.contacts || {};
                            const matchedEntry = Object.values(contacts).find(c =>
                                c?.lid === statusParticipant ||
                                c?.lid === statusParticipant.split('@')[0]
                            );
                            if (matchedEntry?.id) {
                                realJid = matchedEntry.id;
                            } else {
                                try {
                                    const resolved = await conn.getJidFromLid(statusParticipant);
                                    if (resolved) realJid = resolved;
                                } catch {}
                            }
                        }
                    }

                    const resolvedKey = { ...mek.key, participant: realJid };
                    const statusType = getContentType(mek.message) || 'unknown';

                    if (shouldRead || shouldReact) {
                        await conn.readMessages([resolvedKey]);
                    }

                    const reactableTypes = [
                        'imageMessage', 'videoMessage', 'extendedTextMessage',
                        'conversation', 'audioMessage', 'documentMessage',
                        'stickerMessage', 'contactMessage', 'locationMessage'
                    ];

                    if (shouldReact && reactableTypes.includes(statusType)) {
                        const emojis = ['🧩', '🍉', '💜', '🌸', '🪴', '💊', '💫', '🍂', '🌟', '🎋', '😶‍🌫️', '🫀', '🧿', '👀', '🤖', '🚩', '🥰', '🗿', '💜', '💙', '🌝', '🖤', '💚'];
                        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await conn.sendMessage(
                            mek.key.remoteJid,
                            { react: { key: resolvedKey, text: emoji } },
                            { statusJidList: [realJid, conn.user.id] }
                        );
                    }
                }
            } catch (_) {}
            return; // Stop processing further for status
        }

        // 2. PRE-PROCESSING MESSAGES
        // Standardize body for commands
        const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type === 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type === 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : '';
        const isCmd = body.startsWith(config.PREFIX);
        const command = isCmd ? body.slice(config.PREFIX.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (mek.key.participant || from);
        const senderNumber = sender.split('@')[0];
        const isOwner = config.OWNER_NUMBER.includes(senderNumber) || mek.key.fromMe;
        const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';

        // 3. OWNER EVALUATION ($ & %)
        if (isOwner) {
            if (body.startsWith("$")) {
                try {
                    let evaled = await eval(`(async () => { ${body.slice(1)} })()`);
                    return conn.sendMessage(from, { text: util.format(evaled) }, { quoted: mek });
                } catch (e) { 
                    return conn.sendMessage(from, { text: util.format(e) }, { quoted: mek }); 
                }
            }
            if (body.startsWith("%")) {
                exec(body.slice(1), (err, stdout) => {
                    if (err) return conn.sendMessage(from, { text: util.format(err) }, { quoted: mek });
                    if (stdout) conn.sendMessage(from, { text: stdout }, { quoted: mek });
                });
            }
        }

        // 4. EXTERNAL PLUGIN EXECUTION
        const plugin = global.plugins.get(command) || [...global.plugins.values()].find(p => p.alias && p.alias.includes(command));

        if (plugin) {
            // Permission Guards
            if (plugin.isOwner && !isOwner) return conn.sendMessage(from, { text: "❌ This is an Owner-only command!" }, { quoted: mek });
            if (plugin.isGroup && !isGroup) return conn.sendMessage(from, { text: "❌ This command only works in groups!" }, { quoted: mek });
            
            if (plugin.isBotAdmin && isGroup) {
                const groupMetadata = await conn.groupMetadata(from);
                const bot = groupMetadata.participants.find(p => p.id === botNumber);
                if (!bot || !bot.admin) return conn.sendMessage(from, { text: "❌ I need to be an Admin to do that!" }, { quoted: mek });
            }

            // Run Plugin
            try {
                // Pass standard objects to the plugin
                const m = require("./lib/serialize").sms(conn, mek);
                return await plugin.execute(conn, mek, { m, text, args, isOwner, isGroup, pushname });
            } catch (e) {
                console.error("Plugin Execution Error:", e);
            }
        }

        // 5. INTERNAL DEFAULT COMMANDS (Fallback)
        switch (command) {
            case "ping":
                const start = Date.now();
                await conn.sendMessage(from, { text: "Pinging..." }, { quoted: mek });
                await conn.sendMessage(from, { text: `🚀 *POPKID MD SPEED:* ${Date.now() - start}ms` }, { quoted: mek });
                break;
                
            case "menu":
            case "help":
                let menuText = `╔════════════════╗\n  *POPKID-MD DASHBOARD* \n╠════════════════╣\n`;
                menuText += ` 🤖 *User:* ${pushname}\n`;
                menuText += ` ⏳ *Runtime:* ${(process.uptime() / 60).toFixed(1)} mins\n`;
                menuText += ` 🔑 *Prefix:* ${config.PREFIX}\n\n`;
                menuText += ` 🛠 *Commands:*\n`;
                
                global.plugins.forEach((p) => {
                    menuText += ` ├ ${config.PREFIX}${p.cmd}\n`;
                });
                
                menuText += `╚════════════════╝`;
                await conn.sendMessage(from, { 
                    image: { url: "https://files.catbox.moe/j9ia5c.png" }, 
                    caption: menuText 
                }, { quoted: mek });
                break;
        }

    } catch (e) {
        console.error("Handler Error:", e);
    }
}

module.exports = { handleMessages };
