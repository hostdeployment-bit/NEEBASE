module.exports = {
    cmd: "promote",
    alias: ["demote"],
    desc: "Promote or Demote a member",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { command }) {
        try {
            const from = m.from;
            const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

            // 1. Fetch Fresh Metadata to avoid cache errors
            const groupMetadata = await conn.groupMetadata(from);
            const participants = groupMetadata.participants;
            
            // 2. Check if the BOT is Admin
            const bot = participants.find(p => p.id === botId);
            if (!bot || !bot.admin) {
                return m.reply("❌ *Error:* I need to be an Admin myself to promote or demote others.");
            }

            // 3. Check if the SENDER (You) is Admin
            const sender = participants.find(p => p.id === m.sender);
            const isOwner = m.sender.includes("254732297194"); // Your number fallback
            
            if (!sender?.admin && !isOwner) {
                return m.reply("❌ *Admin Only:* This command is restricted to group admins.");
            }

            // 4. Identify Target (Reply or Mention)
            const target = m.message?.extendedTextMessage?.contextInfo?.participant || 
                           m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

            if (!target) return m.reply(`❌ Please reply to a message or mention the user to ${command}.`);

            // 5. Execute Action
            const action = command === "promote" ? "promote" : "demote";
            await conn.groupParticipantsUpdate(from, [target], action);
            
            await m.react("✅");
            const status = action === "promote" ? "is now an Admin! ⬆️" : "is no longer an Admin. ⬇️";
            return m.reply(`@${target.split('@')[0]} ${status}`, { mentions: [target] });

        } catch (e) {
            console.error(e);
            m.reply("⚠️ *Error:* Make sure I am an admin and the user is still in the group.");
        }
    }
};
