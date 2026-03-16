const { isBotAdmin, isSenderAdmin, jidToNum } = require('../lib/utils');

module.exports = {
    cmd: "promote",
    alias: ["demote"],
    desc: "Change member roles in the group",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { command, isOwner }) {
        try {
            const jid = m.from;

            // 1. Check if Bot is Admin (Using our new Utils)
            const botAdmin = await isBotAdmin(conn, jid);
            if (!botAdmin) {
                return m.reply("❌ *POPKID-MD Error:* I need the **Admin Badge** to change roles!");
            }

            // 2. Check if Sender (You) is Admin or Owner
            const senderAdmin = await isSenderAdmin(conn, jid, m.sender);
            if (!isOwner && !senderAdmin) {
                return m.reply("❌ *Restricted:* This command is for **Group Admins** only.");
            }

            // 3. Identify Target (Reply or Mention)
            let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                         m.message?.extendedTextMessage?.contextInfo?.participant;

            if (!target) return m.reply(`📝 Please reply to a message or tag someone to ${command}.`);

            // 4. Execution
            const action = command === "promote" ? "promote" : "demote";
            await conn.groupParticipantsUpdate(jid, [target], action);
            
            // 5. Stylish Success Feedback
            await m.react("✅");
            const targetNum = jidToNum(target);
            const statusText = action === "promote" ? "is now an Admin! ⬆️" : "is no longer an Admin. ⬇️";

            await conn.sendMessage(jid, {
                text: `✨ *@${targetNum}* ${statusText}\n\n> *𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀𝗂𝗇𝖾* 🇰🇪`,
                mentions: [target]
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply("⚠️ *Engine Error:* Action failed. The user might have left or is already an admin.");
        }
    }
};
