const { isBotAdmin, isSenderAdmin, jidToNum } = require('../lib/utils')
const config = require('../config')

module.exports = {
    cmd: "kick",
    alias: ["remove", "vuta"],
    desc: "Remove a member",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { isOwner }) {
        try {
            if (!await isBotAdmin(conn, m.from)) return m.reply("❌ *ᴇʀʀᴏʀ:* I need Admin rights.")
            if (!isOwner && !await isSenderAdmin(conn, m.from, m.sender)) return m.reply("❌ *ʀᴇsᴛʀɪᴄᴛᴇᴅ:* Admins only.")

            let target = m.quoted ? m.quoted.sender : m.mentionedJid?.[0]
            if (!target) return m.reply("⚠️ *ᴛᴀɢ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ*")
            if (target.includes(config.OWNER_NUMBER)) return m.reply("🚫 *ʀᴇsᴛʀɪᴄᴛᴇᴅ:* I cannot kick my Creator.")

            await conn.groupParticipantsUpdate(m.from, [target], 'remove')
            await m.react("👞")
            m.reply(`✨ *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ᴜᴘᴅᴀᴛᴇ* ✨\n\n👞 *ᴀᴄᴛɪᴏɴ:* Kick\n👤 *ᴜsᴇʀ:* @${jidToNum(target)}`, { mentions: [target] })
        } catch (e) { m.reply("❌ *Action Failed*") }
    }
}
