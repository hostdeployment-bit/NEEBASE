/**
 * POPKID MD - UNIVERSAL ANTI-DELETE (DMs + Groups)
 */

const fs = require('fs');
const path = require('path');
const settingsFile = path.join(__dirname, '../database/group_settings.json');

async function AntideleteHandler(conn, m) {
    try {
        if (!global.msgStore) global.msgStore = {};

        // 1. Cache every incoming message (DMs and Groups)
        if (m.body && !m.key.fromMe) {
            global.msgStore[m.key.id] = {
                body: m.body,
                sender: m.sender,
                from: m.from,
                type: m.type,
                msg: m,
                pushName: m.pushName || "User"
            };

            // Auto-clean RAM after 2 hours
            setTimeout(() => {
                if (global.msgStore[m.key.id]) delete global.msgStore[m.key.id];
            }, 7200000); 
        }

        // 2. Detect Deletion
        if (m.type === 'protocolMessage' && m.message.protocolMessage?.type === 0) {
            const keyId = m.message.protocolMessage.key.id;
            const deletedData = global.msgStore[keyId];

            if (deletedData) {
                // Check settings (Global or per-chat)
                let settings = {};
                if (fs.existsSync(settingsFile)) {
                    settings = JSON.parse(fs.readFileSync(settingsFile));
                }
                
                // If it's a DM, it might not have a setting yet, so we allow it if turned on globally
                if (!settings[deletedData.from]?.antidelete) return;

                let report = `🛡️ *POPKID-MD ANTI-DELETE* 🛡️\n\n`;
                report += `👤 *Sender:* ${deletedData.pushName}\n`;
                report += `⏰ *Time:* ${new Date().toLocaleTimeString('en-KE', { timeZone: 'Africa/Nairobi' })}\n`;
                report += `💬 *Message:* ${deletedData.body}`;

                await conn.sendMessage(deletedData.from, { 
                    text: report, 
                    mentions: [deletedData.sender] 
                }, { quoted: deletedData.msg });

                delete global.msgStore[keyId];
            }
        }
    } catch (e) {
        console.error("Anti-delete Lib Error:", e.message);
    }
}

module.exports = { AntideleteHandler };
