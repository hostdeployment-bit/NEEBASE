/**
 * POPKID MD - MASTER HANDLER 2026
 * Features: Plugin Execution, Eval, Auto-Status, Group Protection
 */

const config = require("./config");
const util = require("util");
const { exec } = require("child_process");

async function handleMessages(conn, m) {
    try {
        const { from, sender, body, type, isGroup, pushName } = m;
        if (!body) return;

        // 1. ADVANCED STATUS AUTO-REACT & READ
        if (from === "status@broadcast") {
            if (config.AUTO_READ_STATUS === "true") await conn.readMessages([m.key]);
            if (config.AUTO_REACT_STATUS === "true") {
                const emojis = ["🫀", "🔥", "✨", "🧿", "🌟", "🧬", "⚡", "💎"];
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                await conn.sendMessage(from, { react: { text: emoji, key: m.key } }, { statusJidList: [sender, conn.user.id] });
            }
            return;
        }

        // 2. PREFIX & COMMAND PARSING
        const isCmd = body.startsWith(config.PREFIX);
        const command = isCmd ? body.slice(config.PREFIX.length).trim().split(" ").shift().toLowerCase() : "";
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(" ");
        const isOwner = config.OWNER_NUMBER.includes(sender.split("@")[0]);
        const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';

        // 3. OWNER EVALUATION (Run code directly from WhatsApp)
        if (isOwner) {
            if (body.startsWith("$")) { // Javascript Eval
                try {
                    let evaled = await eval(`(async () => { ${body.slice(1)} })()`);
                    return m.reply(util.format(evaled));
                } catch (e) { return m.reply(util.format(e)); }
            }
            if (body.startsWith("%")) { // Terminal Exec
                exec(body.slice(1), (err, stdout) => {
                    if (err) return m.reply(util.format(err));
                    if (stdout) m.reply(stdout);
                });
            }
        }

        // 4. EXTERNAL PLUGIN EXECUTION
        // This looks into the global.plugins Map we created in index.js
        const plugin = global.plugins.get(command) || [...global.plugins.values()].find(p => p.alias && p.alias.includes(command));

        if (plugin) {
            // Permission Guards
            if (plugin.isOwner && !isOwner) return m.reply("❌ This command is strictly for my Developer!");
            if (plugin.isGroup && !isGroup) return m.reply("❌ This command is only for Groups!");
            if (plugin.isBotAdmin && isGroup) {
                const groupMetadata = await conn.groupMetadata(from);
                const participants = groupMetadata.participants;
                const bot = participants.find(p => p.id === botNumber);
                if (!bot.admin) return m.reply("❌ I need to be an Admin to do that!");
            }

            // Run Plugin
            try {
                return await plugin.execute(conn, m, { text, args, isOwner, isGroup, pushName });
            } catch (e) {
                console.error(e);
                return m.reply(`⚠️ Plugin Error: ${e.message}`);
            }
        }

        // 5. INTERNAL DEFAULT COMMANDS (Fallback)
        switch (command) {
            case "ping":
                const start = Date.now();
                await m.reply("Pinging...");
                const end = Date.now();
                await m.reply(`🚀 *POPKID MD SPEED:* ${end - start}ms`);
                break;

            case "menu":
            case "help":
                let menuText = `╔════════════════╗\n  *POPKID-MD DASHBOARD* \n╠════════════════╣\n`;
                menuText += ` 🤖 *User:* ${pushName}\n`;
                menuText += ` ⏳ *Runtime:* ${process.uptime().toFixed(0)}s\n`;
                menuText += ` 🔑 *Prefix:* ${config.PREFIX}\n\n`;
                menuText += ` 🛠 *Loaded Plugins:*\n`;
                
                global.plugins.forEach((p) => {
                    menuText += ` ├ .${p.cmd}\n`;
                });
                
                menuText += `╚════════════════╝`;
                await conn.sendMessage(from, { 
                    image: { url: "https://files.catbox.moe/j9ia5c.png" }, 
                    caption: menuText 
                }, { quoted: m });
                break;
        }

    } catch (e) {
        console.error("Handler Error:", e);
    }
}

module.exports = { handleMessages };
