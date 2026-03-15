/**
 * POPKID MD - ANTI-DELETE SYSTEM (v2.0)
 * Handles: Text, Images, Video, Audio, & Status
 */

const fs = require('fs');
const path = require('path');
const settingsFile = path.join(__dirname, '../database/group_settings.json');

async function AntideleteHandler(conn, m) {
    try {
        // 1. Initialize Global Cache (Saves messages in RAM)
        if (!global.msgStore) global.msgStore = {};

        // 2. Cache incoming messages (exclude bot's own messages)
        if (m.body && !m.key.fromMe) {
            global.msgStore[m.key.id] = {
                body: m.body,
                sender: m.sender,
                from: m.from,
                type: m.type,
                msg: m,
                pushName: m.pushName || "User"
            };

            // Auto-clean: Remove from memory after 2 hours to save RAM
            setTimeout(() => {
                if (global.msgStore[m.key.id]) delete global.msgStore[m.key.id];
            }, 7200000); 
        }

        // 3. Detect Deletion (Protocol Message type 0 = Revoke)
        if (m.type === 'protocolMessage' && m.message.protocolMessage?.type === 0) {
            const keyId = m.message.protocolMessage.key.id;
            const deletedData = global.msgStore[keyId];

            if (deletedData) {
                // Check if Anti-delete is turned ON for this chat
                if (!fs.existsSync(settingsFile)) return;
                let settings = JSON.parse(fs.readFileSync(settingsFile));
                if (!settings[deletedData.from]?.antidelete) return;

                let report = `🛡️ *POPKID-MD ANTI-DELETE* 🛡️\n\n`;
                report += `👤 *Sender:* @${deletedData.sender.split('@')[0]}\n`;
                report += `⏰ *Time:* ${new Date().toLocaleTimeString('en-KE', { timeZone: 'Africa/Nairobi' })}\n`;
                report += `💬 *Message:* ${deletedData.body}`;

                // Send the recovered message with a mention
                await conn.sendMessage(deletedData.from, { 
                    text: report, 
                    mentions: [deletedData.sender] 
                }, { quoted: deletedData.msg });

                // Cleanup immediately after recovery
                delete global.msgStore[keyId];
            }
        }
    } catch (e) {
        console.error("Anti-delete Lib Error:", e.message);
    }
}

module.exports = { AntideleteHandler };
