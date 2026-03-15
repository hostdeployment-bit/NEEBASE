/**
 * POPKID MD - MASTER HANDLER
 * Features: Auto-Status, Eval, Dynamic Commands, Group Guard
 */

const config = require("./config");
const { exec } = require("child_process");
const util = require("util");

async function handleMessages(conn, m) {
    try {
        const { from, sender, body, type, isGroup } = m;
        if (!body) return;

        // 1. ADVANCED STATUS AUTO-REACT/READ
        if (from === "status@broadcast") {
            if (config.AUTO_READ_STATUS === "true") await conn.readMessages([m.key]);
            if (config.AUTO_REACT_STATUS === "true") {
                const emojis = ["🫀", "🔥", "✨", "🧿", "🌟"];
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

        // 3. OWNER EVALUATION ($ for JS, > for Code, % for Exec)
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

        // 4. FUNCTIONAL COMMANDS
        switch (command) {
            case "ping":
                const start = Date.now();
                await m.reply("Testing speed...");
                const end = Date.now();
                await m.reply(`🚀 *POPKID MD SPEED:* ${end - start}ms`);
                break;

            case "menu":
                const uptime = process.uptime();
                const h = Math.floor(uptime / 3600);
                const menu = `╔════════════════╗\n  *POPKID-MD DASHBOARD* \n╠════════════════╣\n 🤖 *Version:* 1.5.0\n ⏳ *Uptime:* ${h} hours\n 🔑 *Prefix:* ${config.PREFIX}\n\n 🛠 *Commands:*\n ├ .ping\n ├ .owner\n ├ .runtime\n ├ .restart\n╚════════════════╝`;
                await conn.sendMessage(from, { text: menu }, { quoted: m });
                break;

            case "owner":
                const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + config.OWNER_NAME + '\n' + 'ORG:Popkid MD;\n' + 'TEL;type=CELL;type=VOICE;waid=' + config.OWNER_NUMBER[0] + ':+' + config.OWNER_NUMBER[0] + '\n' + 'END:VCARD';
                await conn.sendMessage(from, { contacts: { displayName: config.OWNER_NAME, contacts: [{ vcard }] } });
                break;
                
            case "restart":
                if (!isOwner) return m.reply("Owner only!");
                await m.reply("Restarting POPKID MD...");
                process.exit();
                break;
        }

    } catch (e) {
        console.error("Handler Error:", e);
    }
}

module.exports = { handleMessages };
