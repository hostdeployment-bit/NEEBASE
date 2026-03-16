const { isBotAdmin, isSenderAdmin, jidToNum } = require('../lib/utils')

module.exports = {
    cmd: "demote",
    desc: "Demote an admin to member",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { isOwner }) {
        const jid = m.from;
        try {
            if (!await isBotAdmin(conn, jid)) return m.reply("❌ I need admin rights!");
            if (!isOwner && !await isSenderAdmin(conn, jid, m.sender)) return m.reply("❌ Admin only!");

            let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                         m.message?.extendedTextMessage?.contextInfo?.participant;

            if (!target) return m.reply("❌ Mention or reply to someone to demote!");

            const normalize = (j) => (j || '').replace(/:[0-9]+@/, '@');
            const targetJid = normalize(target) === normalize(conn.user?.id) ? conn.user?.id : target;

            await conn.groupParticipantsUpdate(jid, [targetJid], 'demote');
            await m.react("⬇️");
            m.reply({ text: `✅ Demoted @${jidToNum(targetJid)}`, mentions: [targetJid] });
        } catch (e) { m.reply("❌ Failed to demote."); }
    }
}
