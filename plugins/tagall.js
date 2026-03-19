const { isSenderAdmin } = require('../lib/utils')

module.exports = {
    cmd: "tagall",
    alias: ["hidetag", "htag"],
    desc: "Tag all members with names",
    category: "admin",
    isGroup: true,

    async execute(conn, m, { text, isOwner }) {
        try {
            if (!isOwner && !await isSenderAdmin(conn, m.from, m.sender)) {
                return m.reply("❌ *Restricted:* Admins only.")
            }

            const metadata = await conn.groupMetadata(m.from)
            const participants = metadata.participants

            let tagMsg = `💜 *𝐀𝐓𝐓𝐄𝐍𝐓𝐈𝐎𝐍 𝐄𝐕𝐄𝐑𝐘𝐎𝐍𝐄* 💜\n\n`
            if (text) tagMsg += `📝 *Message:* ${text}\n\n`
            tagMsg += `👥 *Total Members:* ${participants.length}\n\n`

            for (let participant of participants) {
                const jid = participant.id
                
                // 1. Try to get name from the bot's contact store
                // 2. Fallback to metadata notify name
                // 3. Last resort: split the JID number
                const contact = conn.contacts[jid] || {}
                const name = contact.notify || contact.name || participant.notify || jid.split('@')[0]
                
                tagMsg += `@${name}\n`
            }

            tagMsg += `\n> *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ᴇɴɢɪɴᴇ* 🇰🇪`

            await m.react("📢")

            await conn.sendMessage(
                m.from,
                {
                    text: tagMsg,
                    mentions: participants.map(a => a.id)
                },
                { quoted: m }
            )

        } catch (e) {
            console.error(e)
            m.reply("❌ *Failed to tag all members*")
        }
    }
}
