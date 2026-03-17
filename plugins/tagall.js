const { isSenderAdmin } = require('../lib/utils')

module.exports = {
    cmd: "tagall",
    alias: ["hidetag", "htag"],
    desc: "Tag all members with a clean list",
    category: "admin",
    isGroup: true,

    async execute(conn, m, { text, isOwner }) {
        try {
            if (!isOwner && !await isSenderAdmin(conn, m.from, m.sender)) {
                return m.reply("❌ *Restricted:* Admins only.")
            }

            const metadata = await conn.groupMetadata(m.from)
            const participants = metadata.participants.map(v => v.id)

            let tagMsg = `📢 *𝐀𝐓𝐓𝐄𝐍𝐓𝐈𝐎𝐍 𝐄𝐕𝐄𝐑𝐘𝐎𝐍𝐄* 📢\n\n`
            if (text) tagMsg += `📝 *Message:* ${text}\n\n`
            tagMsg += `👥 *Total Members:* ${participants.length}\n\n`

            // ✅ Proper mention formatting (shows saved names / usernames)
            for (let mem of participants) {
                const username = mem.split('@')[0]
                tagMsg += ` ❍ @${username}\n`
            }

            tagMsg += `\n> *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ᴇɴɢɪɴᴇ* 🇰🇪`

            await m.react("📢")

            await conn.sendMessage(
                m.from,
                {
                    text: tagMsg,
                    mentions: participants
                },
                { quoted: m }
            )

        } catch (e) {
            console.error(e)
            m.reply("❌ *Failed to tag all members*")
        }
    }
}
