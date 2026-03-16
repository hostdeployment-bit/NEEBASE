/**
 * POPKID-MD — ROLE MANAGEMENT SYSTEM
 * Adapted from Vanguard MD Logic
 */

module.exports = {
    cmd: "promote",
    alias: ["demote"],
    desc: "Promote or Demote a member",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { command, isOwner }) {
        const from = m.from;
        const sender = m.sender;

        // 1. FRESH ADMIN CHECKS (Vanguard Logic)
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;

        const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const botInList = participants.find(p => p.id === botId);
        const senderInList = participants.find(p => p.id === sender);

        // Check if Bot is Admin
        if (!botInList || !botInList.admin) {
            return m.reply("❌ I need to be an admin to " + command + " members!");
        }

        // Admins + Owner can use
        const senderIsAdmin = senderInList?.admin;
        if (!isOwner && !senderIsAdmin) {
            return m.reply("❌ Only admins can use this command!");
        }

        // 2. IDENTIFY TARGET (Vanguard Logic)
        let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || null;
        if (!target && m.message?.extendedTextMessage?.contextInfo?.participant) {
            target = m.message.extendedTextMessage.contextInfo.participant;
        }

        if (!target) return m.reply(`❌ Mention or reply to someone to ${command}!\n_Example: .${command} @user_`);
        if (target === sender) return m.reply(`❌ You cannot ${command} yourself!`);

        // 3. CHECK CURRENT STATUS
        const targetInList = participants.find(p => p.id === target);
        const targetIsAdmin = targetInList?.admin;

        if (command === "promote" && targetIsAdmin) {
            return m.reply({
                text: '😌 _@' + target.split('@')[0] + ' is already an Admin 😎_',
                mentions: [target]
            });
        }
        
        if (command === "demote" && !targetIsAdmin) {
            return m.reply({
                text: '❗ _@' + target.split('@')[0] + ' is already not an Admin._',
                mentions: [target]
            });
        }

        // 4. EXECUTION
        try {
            const action = command === "promote" ? "promote" : "demote";
            await conn.groupParticipantsUpdate(from, [target], action);
            
            await m.react("✅");
            await m.reply({
                text: '✅ _Mission Completed Successfully_',
                mentions: [target]
            });
        } catch (err) {
            await m.reply('❌ Failed to ' + command + ': ' + err.message);
        }
    }
};
