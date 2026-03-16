/**
 * POPKID-MD POWER-ADMIN SYSTEM
 * Combined: Promote, Demote, Kick
 */

module.exports = {
    cmd: "promote",
    alias: ["demote", "kick"],
    desc: "Precision Group Administration",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { command }) {
        try {
            const from = m.from;
            const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

            // 1. Fetch Fresh Metadata
            const groupMetadata = await conn.groupMetadata(from);
            const participants = groupMetadata.participants;

            // 2. STANDARD CHECK: Find the Bot and the Sender in the list
            // We use .includes to handle LID/JID mismatches
            const bot = participants.find(p => p.id.split('@')[0] === botId.split('@')[0]);
            const sender = participants.find(p => p.id.split('@')[0] === m.sender.split('@')[0]);

            // --- ADMIN VALIDATIONS ---
            if (!bot || !bot.admin) {
                return m.reply("❌ *POPKID-MD Error:* I need the **Admin Badge** to execute this.");
            }

            // Allow if sender is Admin OR if sender is the Owner (Super-bypass)
            const isOwner = m.sender.includes("254732297194") || m.fromMe;
            if (!sender?.admin && !isOwner) {
                return m.reply("❌ *Restricted:* This command is for **Group Admins** only.");
            }

            // 3. IDENTIFY TARGET
            const target = m.message?.extendedTextMessage?.contextInfo?.participant || 
                           m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

            if (!target) return m.reply(`📝 Please reply to a message or tag someone to ${command}.`);
            if (target.split('@')[0] === botId.split('@')[0]) return m.reply("❌ I cannot perform this action on myself.");

            // 4. EXECUTION
            if (command === "promote") {
                await conn.groupParticipantsUpdate(from, [target], "promote");
                await m.react("⬆️");
                m.reply(`✅ @${target.split('@')[0]} promoted to Admin.`, { mentions: [target] });
            } 
            
            else if (command === "demote") {
                await conn.groupParticipantsUpdate(from, [target], "demote");
                await m.react("⬇️");
                m.reply(`✅ @${target.split('@')[0]} demoted.`, { mentions: [target] });
            } 
            
            else if (command === "kick") {
                await conn.groupParticipantsUpdate(from, [target], "remove");
                await m.react("✈️");
                // No reply needed for kick to avoid tagging a ghost
            }

        } catch (e) {
            console.error(e);
            m.reply("⚠️ *Engine Error:* Action failed. Check if I am still an Admin.");
        }
    }
};
