module.exports = {
    cmd: "newgroup",
    alias: ["creategroup"],
    desc: "Create a new group with the bot",
    category: "owner",
    async execute(conn, m, { text, isOwner }) {
        if (!isOwner) return m.reply("👑 *Owner Only*")
        if (!text) return m.reply("📝 *Usage:* .newgroup [Name]")

        try {
            await m.react("🏗️")

            // 1. CLEAN THE JID: Remove the :suffix from m.sender if it exists
            const myJid = m.sender.split(':')[0] + '@s.whatsapp.net'

            // 2. CREATE GROUP: We must pass an array [myJid]
            // We use text.trim() to ensure the name is clean
            const group = await conn.groupCreate(text.trim(), [myJid])

            // 3. FETCH LINK: Sometimes there is a small delay, so we wait a second
            await new Promise(resolve => setTimeout(resolve, 1000))
            const code = await conn.groupInviteCode(group.id)

            const successMsg = `✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐆𝐑𝐎𝐔𝐏 𝐂𝐑𝐄𝐀𝐓𝐎𝐑* ✨\n\n` +
                               `✅ *Status:* Group Created\n` +
                               `📝 *Name:* ${text}\n` +
                               `🔗 *Link:* https://chat.whatsapp.com/${code}\n\n` +
                               `> *Powered by Popkid Kenya* 🇰🇪`

            m.reply(successMsg)

        } catch (e) {
            console.error("Newgroup Error:", e)
            // Specific error check
            if (e.toString().includes('406')) {
                return m.reply("❌ *Failed:* Check if your number allows being added to groups by others.")
            }
            m.reply("❌ *Failed to create group:* Ensure the name isn't too long or containing illegal characters.")
        }
    }
}
