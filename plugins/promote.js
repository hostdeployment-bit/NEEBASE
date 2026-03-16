module.exports = {
    cmd: "promote",
    alias: ["demote"],
    desc: "Promote or Demote without admin checks",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { command }) {
        try {
            const from = m.from;
            const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

            // 1. We still need to check if the BOT is admin (Server requirement)
            const groupMetadata = await conn.groupMetadata(from);
            const bot = groupMetadata.participants.find(p => p.id === botId);
            
            if (!bot || !bot.admin) {
                return m.reply("❌ *POPKID-MD Error:* I cannot change roles unless you make me an Admin first.");
            }

            // 2. Target Identification (Reply or Mention)
            const target = m.message?.extendedTextMessage?.contextInfo?.participant || 
                           m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

            if (!target) return m.reply(`❌ Reply to someone or tag them to ${command}.`);

            // 3. Direct Execution (No user-admin check here)
            const action = command === "promote" ? "promote" : "demote";
            await conn.groupParticipantsUpdate(from, [target], action);
            
            await m.react("✅");
            return m.reply(`✅ @${target.split('@')[0]} ${action === "promote" ? "promoted to Admin" : "demoted"} successfully.`, { mentions: [target] });

        } catch (e) {
            // This catches cases where you try to promote an already-admin or demote the owner
            m.reply("⚠️ *Action Failed:* Ensure the user is still in the group and I have full permissions.");
        }
    }
};
