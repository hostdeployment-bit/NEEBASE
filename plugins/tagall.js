const { isSenderAdmin } = require('../lib/utils')

module.exports = {
    cmd: "tagall",
    desc: "Tag every member with a message",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { text, isOwner }) {
        try {
            if (!isOwner && !await isSenderAdmin(conn, m.from, m.sender)) return m.reply("❌ *Admins only.*")
            const groupMetadata = await conn.groupMetadata(m.from)
            const participants = groupMetadata.participants
            
            let report = `✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃* ✨\n` +
                         `══════════════════\n` +
                         `📢  *ɢʀᴏᴜᴘ ᴛᴀɢ-ᴀʟʟ*\n` +
                         `══════════════════\n\n` +
                         `*Message:* ${text || 'No Message'}\n\n`;

            for (let mem of participants) {
                report += `◦ @${mem.id.split('@')[0]}\n`;
            }

            report += `\n══════════════════\n` +
                      `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀𝗂𝗇𝖾 🇰🇪`;

            await conn.sendMessage(m.from, { text: report, mentions: participants.map(a => a.id) })
        } catch (e) { m.reply("❌ Error") }
    }
}
