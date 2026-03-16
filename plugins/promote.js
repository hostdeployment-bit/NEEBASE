/**
 * POPKID-MD — ROLE MANAGEMENT SYSTEM
 * Logic: Vanguard MD (Fixed for Popkid Base)
 */

const { isBotAdmin, isSenderAdmin, jidToNum } = require('../lib/utils')

module.exports = {
    cmd: "promote",
    alias: ["demote"],
    desc: "Promote or Demote group members",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { command, isOwner }) {
        // --- FIX: Ensure 'command' is not undefined ---
        const cmdAction = m.body.slice(1).trim().split(/ +/).shift().toLowerCase();
        const actionName = cmdAction === 'promote' ? 'promote' : 'demote';
        
        const jid = m.from;
        const sender = m.sender;

        try {
            // ── 1. Admin Checks (Using our Shielded Utils) ──
            const botAdmin = await isBotAdmin(conn, jid);
            if (!botAdmin) return m.reply(`❌ I need to be an admin to ${actionName} members!`);

            const senderIsAdmin = await isSenderAdmin(conn, jid, sender);
            if (!isOwner && !senderIsAdmin) return m.reply(`❌ Only admins can use this command!`);

            // ── 2. Target Identification ──
            let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                         m.message?.extendedTextMessage?.contextInfo?.participant;

            if (!target) return m.reply(`❌ Mention or reply to someone to ${actionName}!\n_Example: .${actionName} @user_`);

            // ── 3. Normalization (LID/JID Fix) ──
            const normalize = (j) => (j || '').replace(/:[0-9]+@/, '@');
            const botJid = normalize(conn.user?.id);
            const targetClean = normalize(target);
            const targetJid = targetClean === botJid ? conn.user?.id : target;

            // ── 4. Execution ──
            await conn.groupParticipantsUpdate(jid, [targetJid], actionName);
            
            await m.react("✅");
            await m.reply({
                text: `✅ _Mission Completed: @${jidToNum(targetJid)} is now ${actionName}d!_`,
                mentions: [targetJid],
            });

        } catch (err) {
            console.error(err);
            await m.reply(`❌ Failed to ${actionName}: Target might be Group Creator or already has that role.`);
        }
    }
}
