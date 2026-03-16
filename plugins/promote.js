/**
 * POPKID-MD — PROMOTE COMMAND
 * Logic: Vanguard MD (Fixed for Popkid Base)
 */

const { isBotAdmin, isSenderAdmin, jidToNum } = require('../lib/utils')

module.exports = {
    cmd: "promote",
    desc: "Promote a member to admin",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { isOwner }) {
        const jid = m.from;
        const sender = m.sender;

        try {
            // ── 1. Admin + Sudo Checks ──
            const botAdmin = await isBotAdmin(conn, jid);
            if (!botAdmin) return m.reply("❌ *POPKID-MD:* I need to be an admin to promote members!");

            const senderIsAdmin = await isSenderAdmin(conn, jid, sender);
            if (!isOwner && !senderIsAdmin) return m.reply("❌ *Restricted:* Only admins can use this command!");

            // ── 2. Target Identification (Mentions or Reply) ──
            let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                         m.message?.extendedTextMessage?.contextInfo?.participant;

            if (!target) return m.reply("❌ Mention or reply to someone to promote!\n_Example: .promote @user_");
            if (target === sender) return m.reply("❌ You cannot promote yourself!");

            // ── 3. Normalization (LID/JID Fix) ──
            const normalize = (j) => (j || '').replace(/:[0-9]+@/, '@');
            const botJid = normalize(conn.user?.id);
            const targetClean = normalize(target);
            const targetJid = targetClean === botJid ? conn.user?.id : target;

            // ── 4. Check if Target is already Admin ──
            const targetIsAdmin = await isSenderAdmin(conn, jid, targetJid);
            if (targetIsAdmin) {
                return m.reply({
                    text: `😌 _@${jidToNum(targetJid)} is already an Admin 😎_`,
                    mentions: [targetJid]
                });
            }

            // ── 5. Execution ──
            await conn.groupParticipantsUpdate(jid, [targetJid], 'promote');
            
            await m.react("✅");
            await m.reply({
                text: `✅ _Mission Completed Successfully_\n@${jidToNum(targetJid)} is now an Admin.`,
                mentions: [targetJid],
            });

        } catch (err) {
            console.error(err);
            await m.reply("❌ Failed to promote: " + err.message);
        }
    }
}
