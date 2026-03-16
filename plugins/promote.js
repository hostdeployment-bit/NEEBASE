const { isBotAdmin, isSenderAdmin, jidToNum } = require('../lib/utils')

module.exports = {
    cmd: "promote",
    desc: "Promote member to admin",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { isOwner }) {
        try {
            if (!await isBotAdmin(conn, m.from)) return m.reply("❌ I need Admin rights.")
            if (!isOwner && !await isSenderAdmin(conn, m.from, m.sender)) return m.reply("❌ Admins only.")

            let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant
            if (!target) return m.reply("⚠️ Tag or reply to a user")

            // Vanguard Normalization
            const targetJid = target.replace(/:[0-9]+@/, '@')

            await conn.groupParticipantsUpdate(m.from, [targetJid], 'promote')
            await m.react("⭐")

            m.reply(`✅ *@${jidToNum(targetJid)}* is now an Admin.`, { mentions: [targetJid] })

        } catch (e) {
            m.reply("❌ Action Failed")
        }
    }
}
