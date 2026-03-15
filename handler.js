/**
 * POPKID MD - MASTER HANDLER 2026
 * Features: Smart Prefix/Non-Prefix, LID-Aware Status, Modular Plugin Routing
 */

const config = require("./config");
const util = require("util");
const { exec } = require("child_process");
const { getContentType } = require("@whiskeysockets/baileys");
const { sms } = require("./lib/serialize");

async function handleMessages(conn, mek) {
    try {
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
        const from = mek.key.remoteJid;
        const type = getContentType(mek.message);

        // ============ 1. STATUS VIEW & REACT (HIGH STABILITY) ============
        if (from === 'status@broadcast') {
            try {
                const shouldRead = config.AUTO_READ_STATUS === 'true';
                const shouldReact = config.AUTO_REACT_STATUS === 'true';
                const statusParticipant = mek.key.participant || null;

                if (statusParticipant) {
                    let realJid = statusParticipant;
                    if (statusParticipant.endsWith('@lid')) {
                        const rawPn = mek.key?.participantPn || mek.key?.senderPn;
                        if (rawPn) {
                            realJid = rawPn.includes('@') ? rawPn : `${rawPn}@s.whatsapp.net`;
                        } else {
                            const resolved = await conn.getJidFromLid(statusParticipant).catch(() => null);
                            if (resolved) realJid = resolved;
                        }
                    }

                    const resolvedKey = { remoteJid: 'status@broadcast', id: mek.key.id, participant: realJid };
                    if (shouldRead) await conn.readMessages([resolvedKey]);
                    if (shouldReact) {
                        const reactableTypes = ['imageMessage', 'videoMessage', 'extendedTextMessage', 'conversation', 'audioMessage'];
                        if (reactableTypes.includes(type)) {
                            const emojis = ['🧩', '💜', '🌸', '💫', '🫀', '🧿', '🚩', '🥰', '🗿', '💙', '🌝', '🖤', '💚'];
                            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                            await conn.sendMessage(from, { react: { key: resolvedKey, text: emoji } }, { statusJidList: [realJid, conn.user.id] });
                        }
                    }
                }
            } catch (e) { console.error("Status Error:", e); }
            return; 
        }

        // ============ 2. SMART COMMAND PARSING ============
        const m = sms(conn, mek);
        const body = m.body || '';
        const pushname = m.pushName || 'User';
        
        const isCmd = body.startsWith(config.PREFIX);
        let command = '';
        let args = [];

        if (isCmd) {
            // Handle prefixed command: .play song
            command = body.slice(config.PREFIX.length).trim().split(' ').shift().toLowerCase();
            args = body.trim().split(/ +/).slice(1);
        } else if (config.NON_PREFIX === "true") {
            // Handle non-prefix command: play song
            command = body.trim().split(' ').shift().toLowerCase();
            args = body.trim().split(/ +/).slice(1);
        }

        const text = args.join(' ');
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

        // 4. PLUGIN ROUTING
        const plugin = global.plugins.get(command) || [...global.plugins.values()].find(p => p.alias && p.alias.includes(command));

        if (plugin) {
            // If NON_PREFIX is false, we ignore calls that don't start with the prefix
            if (!isCmd && config.NON_PREFIX !== "true") return;

            if (plugin.isOwner && !isOwner) return m.reply("❌ Owner only!");
            if (plugin.isGroup && !m.isGroup) return m.reply("❌ Group only!");
            
            if (plugin.isBotAdmin && m.isGroup) {
                const groupMetadata = await conn.groupMetadata(from);
                const bot = groupMetadata.participants.find(p => p.id === botNumber);
                if (!bot || !bot.admin) return m.reply("❌ I need Admin!");
            }

            try {
                return await plugin.execute(conn, m, { text, args, isOwner, isGroup: m.isGroup, pushname });
            } catch (e) { console.error("Plugin Execute Error:", e); }
        }

    } catch (e) { console.error("Handler Error:", e); }
}

module.exports = { handleMessages };
