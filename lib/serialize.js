const { getContentType } = require('@whiskeysockets/baileys');

function sms(conn, m) {
    if (!m) return m;
    let M = {};
    if (m.key) {
        M.id = m.key.id;
        M.from = m.key.remoteJid;
        M.isGroup = M.from.endsWith('@g.us');
        M.sender = M.isGroup ? m.key.participant : m.key.remoteJid;
    }
    if (m.message) {
        M.type = getContentType(m.message);
        M.body = (M.type === 'conversation') ? m.message.conversation : (M.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : (M.type === 'imageMessage') ? m.message.imageMessage.caption : (M.type === 'videoMessage') ? m.message.videoMessage.caption : '';
    }
    M.reply = (text) => conn.sendMessage(M.from, { text }, { quoted: m });
    M.react = (emoji) => conn.sendMessage(M.from, { react: { text: emoji, key: m.key } });
    return M;
}
module.exports = { sms };
