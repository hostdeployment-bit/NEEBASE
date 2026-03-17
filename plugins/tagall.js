const { isSenderAdmin, jidToNum } = require('../lib/utils')

module.exports = {
    cmd: "tagall",
    desc: "Tag all members with a list",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { text, isOwner }) {
        try {
            if (!isOwner && !await isSenderAdmin(conn, m.from, m.sender)) return m.reply("❌ *Restricted:* Admins only.")
            
            const metadata = await conn.groupMetadata(m.from)
            const participants = metadata.participants.map(v => v.id)
            
            let tagMsg = `📢 *𝐀𝐓𝐓𝐄𝐍𝐓𝐈𝐎𝐍 𝐄𝐕𝐄𝐑𝐘𝐎𝐍𝐄* 📢\n\n`
            tagMsg += text ? `📝 *Message:* ${text}\n\n` : ''
            tagMsg += `👥 *Total:* ${participants.length}\n\n`
            
            for (let mem of participants) {
                tagMsg += ` ❍ @${jidToNum(mem)}\n`
            }
            
            await m.react("📢")
            await conn.sendMessage(m.from, { text: tagMsg, mentions: participants }, { quoted: m })
        } catch (e) {
            m.reply("❌ *Failed to tag all*")
        }
    }
}
