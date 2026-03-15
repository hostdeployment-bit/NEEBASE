const { jidNormalizedUser, getContentType } = require('@whiskeysockets/baileys');

/**
 * serialize - Standardizes messages from all platforms (iOS/Android/Web)
 */
function sms(conn, m) {
    if (!m) return m;
    let M = {};
    if (m.key) {
        M.key = m.key;
        M.id = m.key.id;
        M.from = m.key.remoteJid;
        M.isGroup = M.from.endsWith('@g.us');
        M.sender = jidNormalizedUser(m.key.participant || m.key.remoteJid);
        M.fromMe = m.key.fromMe;
    }

    if (m.message) {
        M.type = getContentType(m.message);
        M.message = (M.type === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message;
        
        // Extracting body text from different message types
        M.body = (M.type === 'conversation') ? m.message.conversation : 
                 (M.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                 (M.type === 'imageMessage') ? m.message.imageMessage.caption : 
                 (M.type === 'videoMessage') ? m.message.videoMessage.caption : 
                 (M.type === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : 
                 (M.type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                 (M.type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';
        
        M.msg = m.message[M.type];
    }

    M.pushName = m.pushName || 'User';
    M.messageTimestamp = m.messageTimestamp;

    // --- QUICK SHORTCUTS ---
    M.reply = (text) => conn.sendMessage(M.from, { text: text }, { quoted: m });
    M.react = (emoji) => conn.sendMessage(M.from, { react: { text: emoji, key: m.key } });

    return M;
}

module.exports = { sms };
