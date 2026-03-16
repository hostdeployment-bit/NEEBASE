/**
 * POPKID-MD — ROLE MANAGEMENT SYSTEM
 * Logic: Vanguard MD (High Stability)
 * Base: Popkid Master Engine
 */

const { isBotAdmin, isSenderAdmin, jidToNum } = require('../lib/utils')

module.exports = {
    cmd: "promote",
    alias: ["demote"],
    desc: "Promote or Demote group members",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { command, isOwner }) {
        const jid = m.from
        const sender = m.sender

        // ── 1. Admin + Sudo Checks (Vanguard Logic) ──
        const senderIsAdmin = await isSenderAdmin(conn, jid, sender)
        if (!isOwner && !senderIsAdmin) return m.reply('❌ Only admins can use this command!')

        const botAdmin = await isBotAdmin(conn, jid)
        if (!botAdmin) return m.reply('❌ I need to be an admin to ' + command + ' members!')

        // ── 2. Target Identification ──
        let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || null
        if (!target && m.message?.extendedTextMessage?.contextInfo?.participant) {
            target = m.message.extendedTextMessage.contextInfo.participant
        }

        if (!target) return m.reply(`❌ Mention or reply to someone to ${command}!\n_Example: .${command} @user_`)

        // ── 3. Normalization Fix (From Vanguard Demote) ──
        // This ensures LID and JID formats match perfectly during the update
        const normalize = (j) => (j || '').replace(/:[0-9]+@/, '@')
        const botJid = normalize(conn.user?.id)
        const targetClean = normalize(target)
        
        // Use the raw ID if it's the bot, otherwise use the target
        const targetJid = targetClean === botJid ? conn.user?.id : target

        // ── 4. Execution ──
        try {
            const action = command === "promote" ? "promote" : "demote"
            await conn.groupParticipantsUpdate(jid, [targetJid], action)
            
            await m.react("✅")
            await m.reply({
                text: '✅ _Mission Completed Successfully_',
                mentions: [targetJid],
            })
        } catch (err) {
            await m.reply('❌ Failed to ' + command + ': Ensure I am admin and not targeting the Creator.')
        }
    }
}
