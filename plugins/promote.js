module.exports = {
    cmd: "promote",
    alias: ["demote"],
    desc: "Promote or Demote a member",
    category: "admin",
    isGroup: true,
    isBotAdmin: true,
    async execute(conn, m, { command }) {
        // 1. Check if the user executing the command is an Admin
        const groupMetadata = await conn.groupMetadata(m.from);
        const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
        const isUserAdmin = groupAdmins.includes(m.sender);

        if (!isUserAdmin) return m.reply("❌ *Admin Only:* You need to be an admin to use this.");

        // 2. Identify the target (Reply or Mention)
        const target = m.message?.extendedTextMessage?.contextInfo?.participant || 
                       m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!target) return m.reply(`❌ Please reply to a message or mention the user to ${command}.`);

        // 3. Execution
        const action = command === "promote" ? "promote" : "demote";
        
        try {
            await conn.groupParticipantsUpdate(m.from, [target], action);
            
            const emoji = action === "promote" ? "⬆️" : "⬇️";
            const text = action === "promote" ? "is now an Admin!" : "is no longer an Admin.";

            await m.react("✅");
            return m.reply(`${emoji} @${target.split('@')[0]} ${text}`, { mentions: [target] });

        } catch (e) {
            console.error(`${command} Error:`, e);
            m.reply("⚠️ *Error:* Could not complete the action. The user might already be in that state.");
        }
    }
};
