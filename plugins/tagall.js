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

            let tagMsg = `📢 *𝐀𝐓𝐓𝐄𝐍𝐓𝐈𝐎𝐍 𝐄𝐕𝐄𝐑𝐘𝐎𝐍𝐄* 📢\n\n`
            if (text) tagMsg += `📝 *Message:* ${text}\n\n`
            tagMsg += `👥 *Total Members:* ${participants.length}\n\n`

            // ✅ Logic to fetch Name first, then fallback to ID split
            for (let participant of participants) {
                // Get the name if available, otherwise use the number split style
                const name = participant.notify || participant.name || participant.id.split('@')[0]
                tagMsg += `@${name}\n`
            }

            tagMsg += `\n> *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ᴇɴɢɪɴᴇ* 🇰🇪`

            await m.react("📢")

            await conn.sendMessage(
                m.from,
                {
                    text: tagMsg,
                    mentions: participants.map(a => a.id) // This keeps the blue 'tag' functionality
                },
                { quoted: m }
            )

        } catch (e) {
            console.error(e)
            m.reply("❌ *Failed to tag all members*")
        }
    }
}
