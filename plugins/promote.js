/**
 * POPKID-MD POWER-ADMIN SYSTEM
 * This version uses strict string matching to fix LID/JID mismatches.
 */

module.exports = {
    cmd: "promote",
    alias: ["demote", "kick"],
    desc: "Fixed Group Administration",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { command }) {
        try {
            const from = m.from;
            
            // 1. Get Bot's clean number
            const botNumber = conn.user.id.replace(/:.*@/, "@").split('@')[0];
            const senderNumber = m.sender.replace(/:.*@/, "@").split('@')[0];

            // 2. Fetch Metadata
            const groupMetadata = await conn.groupMetadata(from);
            const participants = groupMetadata.participants;

            // 3. ROBUST ADMIN CHECK (Fixes the JID/LID bug)
            // We search the participants by looking for the number, not the full JID string
            const botInList = participants.find(p => p.id.includes(botNumber));
            const senderInList = participants.find(p => p.id.includes(senderNumber));

            // Check if Bot is Admin
            if (!botInList || !botInList.admin) {
                return m.reply("❌ *POPKID-MD Error:* Make me a **Group Admin** first so I can use my powers!");
            }

            // Check if Sender (You) is Admin OR the specific Owner number
            const isOwner = senderNumber === "254732297194" || m.fromMe;
            if (!senderInList?.admin && !isOwner) {
                return m.reply("❌ *Restricted:* You need to be an **Admin** to use this command.");
            }

            // 4. IDENTIFY TARGET
            const target = m.message?.extendedTextMessage?.contextInfo?.participant || 
                           m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

            if (!target) return m.reply(`📝 Please reply to a message or tag someone to ${command}.`);

            // 5. EXECUTION
            const action = command === "promote" ? "promote" : command === "demote" ? "demote" : "remove";
            
            await conn.groupParticipantsUpdate(from, [target], action);
            
            // Success Feedback
            await m.react("✅");
            if (command !== "kick") {
                m.reply(`✅ Action *${command}* successful for @${target.split('@')[0]}`, { mentions: [target] });
            }

        } catch (e) {
            console.error(e);
            m.reply("⚠️ *Engine Error:* Action failed. Ensure the target is still in the group.");
        }
    }
};
