const { isBotAdmin, isSenderAdmin, jidToNum } = require('../lib/utils')

module.exports = {
    cmd: "promote",
    desc: "Promote member to admin",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { isOwner }) {
        try {
            if (!await isBotAdmin(conn, m.from)) return m.reply("❌ *Error:* I need Admin rights.")
            if (!isOwner && !await isSenderAdmin(conn, m.from, m.sender)) return m.reply("❌ *Restricted:* Admins only.")

            let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant
            if (!target) return m.reply("⚠️ *Tag or reply to a user*")

            const targetJid = target.replace(/:[0-9]+@/, '@')
            
            // --- FETCHING THE USERNAME ---
            const groupMetadata = await conn.groupMetadata(m.from)
            const user = groupMetadata.participants.find(p => p.id === targetJid)
            const username = user?.notify || user?.verifiedName || jidToNum(targetJid)

            await conn.groupParticipantsUpdate(m.from, [targetJid], 'promote')
            await m.react("⭐")

            const successText = `✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐔𝐏𝐃𝐀𝐓𝐄* ✨\n\n` +
                                `🌟 *Role:* Admin Promotion\n` +
                                `👤 *User:* ${username}\n` +
                                `✅ *Status:* Successfully Promoted\n\n` +
                                `> *Mission Completed* 🛡️`;

            m.reply(successText, { mentions: [targetJid] })

        } catch (e) {
            m.reply("❌ *Action Failed*")
        }
    }
}
