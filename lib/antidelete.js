const { downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");
const config = require("../config");

// In-memory store for tracking messages
if (!global.msgCache) global.msgCache = new Map();

async function AntideleteHandler(conn, m) {
    try {
        if (!m.message || m.key.remoteJid === 'status@broadcast') return;

        const from = m.key.remoteJid;
        const mode = config.ANTIDELETE || 'inchat'; // Read from config

        // 1. CACHE MESSAGE: Save if not a deletion or from the bot
        if (!m.message.protocolMessage && !m.key.fromMe) {
            global.msgCache.set(m.key.id, {
                msg: m,
                from: from,
                sender: m.key.participant || from,
                pushName: m.pushName || "User",
                timestamp: Date.now()
            });

            // Auto-clear cache after 1 hour
            setTimeout(() => global.msgCache.delete(m.key.id), 3600000);
        }

        // 2. DETECT DELETION
        const type = getContentType(m.message);
        if (type === 'protocolMessage' && m.message.protocolMessage.type === 0) {
            
            if (mode === 'false') return; // Feature is disabled globally

            const deletedId = m.message.protocolMessage.key.id;
            const chatData = global.msgCache.get(deletedId);

            if (!chatData) return;

            // Determine Destination
            const ownerJid = config.OWNER_NUMBER[0] + "@s.whatsapp.net";
            const targetJid = (mode === 'indm') ? ownerJid : from;

            const deletedMsg = chatData.msg;
            const sender = chatData.sender;
            const time = new Date().toLocaleTimeString('en-KE', { timeZone: 'Africa/Nairobi' });

            const reportHeader = `🛡️ *𝙿𝙾𝙿𝙺𝙸𝙳-𝙼𝙳 𝙰𝙽𝚃𝙸-𝙳𝙴𝙻𝙴𝚃𝙴*\n\n` +
                                `👤 *Sender:* @${sender.split('@')[0]}\n` +
                                `🕑 *Time:* ${time}\n` +
                                `💬 *Origin:* ${from.endsWith('@g.us') ? 'Group Chat' : 'Private DM'}\n\n`;

            const msgType = getContentType(deletedMsg.message);

            // RECOVER TEXT
            if (msgType === 'conversation' || msgType === 'extendedTextMessage') {
                const text = deletedMsg.message.conversation || deletedMsg.message.extendedTextMessage.text;
                await conn.sendMessage(targetJid, { 
                    text: reportHeader + `📝 *Content:* ${text}`, 
                    mentions: [sender] 
                }, { quoted: deletedMsg });
            } 
            // RECOVER MEDIA
            else if (/imageMessage|videoMessage|audioMessage/.test(msgType)) {
                try {
                    const mediaType = msgType.replace('Message', '');
                    const stream = await downloadContentFromMessage(deletedMsg.message[msgType], mediaType);
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }

                    await conn.sendMessage(targetJid, {
                        [mediaType]: buffer,
                        caption: reportHeader + (deletedMsg.message[msgType].caption || ''),
                        mentions: [sender]
                    }, { quoted: deletedMsg });
                } catch (err) {
                    console.error("Media recovery failed:", err.message);
                }
            }

            // Remove from cache after recovery
            global.msgCache.delete(deletedId);
        }
    } catch (e) {
        console.error("Antidelete Error:", e.message);
    }
}

module.exports = { AntideleteHandler };
