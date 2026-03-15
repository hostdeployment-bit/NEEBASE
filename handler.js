/**
 * POPKID MD - MASTER HANDLER 2026
 * Features: Direct Status View Fix, Plugin Support, Eval System
 */

const config = require("./config");
const util = require("util");
const { exec } = require("child_process");
const { getContentType } = require("@whiskeysockets/baileys");
const { sms } = require("./lib/serialize");

async function handleMessages(conn, mek) {
    try {
        const from = mek.key.remoteJid;
        const pushname = mek.pushName || 'User';

        // 1. DIRECT STATUS VIEW & REACT (THE FIX) ✅
        if (from === 'status@broadcast') {
            try {
                if (config.AUTO_READ_STATUS === 'true') {
                    // Using raw key directly to fix "0 views" bug
                    await conn.readMessages([mek.key]);
                }

                if (config.AUTO_REACT_STATUS === 'true') {
                    const emojis = ['🧩', '🌸', '🪴', '💊', '💫', '🫀', '🧿', '🤖', '🚩', '🥰', '🗿', '💜', '💙', '🌝', '🖤', '💚'];
                    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await conn.sendMessage(from, { 
                        react: { key: mek.key, text: emoji } 
                    }, { 
                        statusJidList: [mek.key.participant, conn.user.id] 
                    });
                }
            } catch (e) { console.error("Status Error:", e); }
            return; // Stop here for status
        }

        // 2. PRE-PROCESS FOR PLUGINS & COMMANDS
        const m = sms(conn, mek); 
        const body = m.body || '';
        const isCmd = body.startsWith(config.PREFIX);
        const command = isCmd ? body.slice(config.PREFIX.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');
        
        const isOwner = config.OWNER_NUMBER.includes(m.sender.split('@')[0]) || m.fromMe;
        const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';

        // 3. OWNER EVAL ($ & %)
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

        // 4. PLUGIN EXECUTION
        const plugin = global.plugins.get(command) || [...global.plugins.values()].find(p => p.alias && p.alias.includes(command));

        if (plugin) {
            if (plugin.isOwner && !isOwner) return m.reply("❌ Owner only!");
            if (plugin.isGroup && !m.isGroup) return m.reply("❌ Group only!");
            
            if (plugin.isBotAdmin && m.isGroup) {
                const groupMetadata = await conn.groupMetadata(from);
                const bot = groupMetadata.participants.find(p => p.id === botNumber);
                if (!bot || !bot.admin) return m.reply("❌ I need Admin rights!");
            }

            try {
                return await plugin.execute(conn, m, { text, args, isOwner, isGroup: m.isGroup, pushname });
            } catch (e) { console.error("Plugin Error:", e); }
        }

        // 5. INTERNAL FALLBACK COMMANDS
        switch (command) {
            case "ping":
                const start = Date.now();
                await m.reply(`🚀 *POPKID MD SPEED:* ${Date.now() - start}ms`);
                break;
                
            case "menu":
            case "help":
                // If menu plugin exists, this will be skipped by the plugin loader above
                let menuText = `╔════════════════╗\n  *POPKID-MD DASHBOARD* \n╠════════════════╣\n`;
                menuText += ` 🤖 *User:* ${pushname}\n`;
                menuText += ` 🔑 *Prefix:* ${config.PREFIX}\n\n`;
                menuText += ` 🛠 *Commands:*\n`;
                global.plugins.forEach((p) => { menuText += ` ├ ${config.PREFIX}${p.cmd}\n`; });
                menuText += `╚════════════════╝`;
                await conn.sendMessage(from, { image: { url: "https://files.catbox.moe/j9ia5c.png" }, caption: menuText }, { quoted: mek });
                break;
        }

    } catch (e) { console.error("Handler Error:", e); }
}

module.exports = { handleMessages };
