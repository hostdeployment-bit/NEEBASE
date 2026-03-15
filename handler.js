/**
 * POPKID MD - MASTER HANDLER 2026
 * Logic: Raw-Key Status Viewing + Modular Plugin Routing
 */

const config = require("./config");
const util = require("util");
const { exec } = require("child_process");
const { getContentType } = require("@whiskeysockets/baileys");
const { sms } = require("./lib/serialize");

async function handleMessages(conn, mek) {
    try {
        // Prepare Raw Data
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
        const from = mek.key.remoteJid;
        const type = getContentType(mek.message);

        // ============ 1. STATUS VIEW & REACT (MASTER FIX) ============
        if (from === 'status@broadcast') {
            try {
                const shouldRead = config.AUTO_READ_STATUS === 'true';
                const shouldReact = config.AUTO_REACT_STATUS === 'true';
                const statusParticipant = mek.key.participant || null;

                if (statusParticipant) {
                    let realJid = statusParticipant;
                    
                    // Resolve LID for 2026 Android/iPhone Stability
                    if (statusParticipant.endsWith('@lid')) {
                        const rawPn = mek.key?.participantPn || mek.key?.senderPn;
                        if (rawPn) {
                            realJid = rawPn.includes('@') ? rawPn : `${rawPn}@s.whatsapp.net`;
                        } else {
                            const resolved = await conn.getJidFromLid(statusParticipant).catch(() => null);
                            if (resolved) realJid = resolved;
                        }
                    }

                    // Create the stable key required for 'readMessages'
                    const resolvedKey = { 
                        remoteJid: 'status@broadcast', 
                        id: mek.key.id, 
                        participant: realJid 
                    };

                    if (shouldRead) await conn.readMessages([resolvedKey]);

                    if (shouldReact) {
                        const reactableTypes = ['imageMessage', 'videoMessage', 'extendedTextMessage', 'conversation', 'audioMessage'];
                        if (reactableTypes.includes(type)) {
                            const emojis = ['🧩', '💜', '🌸', '💫', '🫀', '🧿', '🤖', '🚩', '🥰', '🗿', '💙', '🌝', '🖤', '💚'];
                            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                            await conn.sendMessage(from, { react: { key: resolvedKey, text: emoji } }, { statusJidList: [realJid, conn.user.id] });
                        }
                    }
                }
            } catch (e) { console.error("Status Logic Error:", e); }
            return; // Stop processing status as a command
        }

        // ============ 2. COMMAND ROUTING ============
        const m = sms(conn, mek); // Standardized object for plugins
        const body = m.body || '';
        const isCmd = body.startsWith(config.PREFIX);
        const command = isCmd ? body.slice(config.PREFIX.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');
        const pushname = m.pushName || 'User';
        
        const isOwner = config.OWNER_NUMBER.includes(m.sender.split('@')[0]) || m.fromMe;
        const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';

        // 3. OWNER EVALUATION ($ & %)
        if (isOwner) {
            if (body.startsWith("$")) {
                try {
                    let evaled = await eval(`(async () => { ${body.slice(1)} })()`);
                    return m.reply(util.format(evaled));
                } catch (e) { return m.reply(util.format(e)); }
            }
            if (body.startsWith("%")) {
                exec(body.slice(1), (err, stdout) => {
                    if (err) return m.reply(util.format(err));
                    if (stdout) m.reply(stdout);
                });
            }
        }

        // 4. PLUGIN EXECUTION (PLUGINS ARE EXTERNAL)
        const plugin = global.plugins.get(command) || [...global.plugins.values()].find(p => p.alias && p.alias.includes(command));

        if (plugin) {
            if (plugin.isOwner && !isOwner) return m.reply("❌ This command is restricted to the Owner!");
            if (plugin.isGroup && !m.isGroup) return m.reply("❌ This command is only for Groups!");
            
            if (plugin.isBotAdmin && m.isGroup) {
                const groupMetadata = await conn.groupMetadata(from);
                const bot = groupMetadata.participants.find(p => p.id === botNumber);
                if (!bot || !bot.admin) return m.reply("❌ I need to be an Admin to perform this action!");
            }

            try {
                // All plugins receive these standardized variables
                return await plugin.execute(conn, m, { text, args, isOwner, isGroup: m.isGroup, pushname });
            } catch (e) { console.error(`Plugin Error [${command}]:`, e); }
        }

    } catch (e) { console.error("Main Handler Error:", e); }
}

module.exports = { handleMessages };
