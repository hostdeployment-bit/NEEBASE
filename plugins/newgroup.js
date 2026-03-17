module.exports = {
    cmd: "newgroup",
    alias: ["creategroup"],
    desc: "Create a new group",
    category: "owner",
    async execute(conn, m, { text, isOwner }) {
        if (!isOwner) return m.reply("👑 *Owner Only*")
        if (!text) return m.reply("📝 *Usage:* .newgroup [Name]")
        
        try {
            await m.react("🏗️")
            const group = await conn.groupCreate(text, [m.sender])
            const code = await conn.groupInviteCode(group.id)
            
            m.reply(`✅ *Group Created Successfully!*\n\n🔗 *Link:* https://chat.whatsapp.com/${code}`)
        } catch (e) {
            m.reply("❌ *Failed to create group*")
        }
    }
}
