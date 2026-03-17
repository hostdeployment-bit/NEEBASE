const { isBotAdmin, isSenderAdmin, jidToNum } = require('../lib/utils')

module.exports = {
    cmd: "kick",
    alias: ["remove", "vuta"],
    desc: "Remove a member",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { isOwner, participants }) {
        try {
            // 1. Check Bot & Sender Permissions
            if (!await isBotAdmin(conn, m.from)) return m.reply("❌ *ᴇʀʀᴏʀ:* I need Admin rights.")
            if (!isOwner && !await isSenderAdmin(conn, m.from, m.sender)) return m.reply("❌ *ᴀᴅᴍɪɴs ᴏɴʟʏ*")

            // 2. THE ADVANCED TARGET FIX: Checks mentions, then quoted, then text
            let target = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
            
            // Extra check: if user typed the number manually (e.g., .kick 254...)
            if (!target && m.text) {
                let input = m.text.replace(/[^0-9]/g, '');
                if (input.length >= 10) target = input + '@s.whatsapp.net';
            }

            if (!target) return m.reply("⚠️ *ᴛᴀɢ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ*")

            // 3. Prevent Self-Kick or Owner-Kick
            const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            if (target === botId) return m.reply("🚫 *ɪ ᴄᴀɴɴᴏᴛ ᴋɪᴄᴋ ᴍʏsᴇʟꜰ!*")
            // Assuming your owner number is in config
            // if (target.includes(config.OWNER_NUMBER)) return m.reply("🚫 *ɪ ᴄᴀɴɴᴏᴛ ᴋɪᴄᴋ ᴍʏ ᴄʀᴇᴀᴛᴏʀ!*")

            await m.react("👞")
            await conn.groupParticipantsUpdate(m.from, [target], 'remove')
            
            const successText = `✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐔𝐏𝐃𝐀𝐓𝐄* ✨\n\n` +
                                `👞 *ᴀᴄᴛɪᴏɴ:* User Kick\n` +
                                `👤 *ᴜsᴇʀ:* @${jidToNum(target)}\n` +
                                `✅ *sᴛᴀᴛᴜs:* Successfully Removed\n\n` +
                                `> *Mission Completed* 🛡️`;

            m.reply(successText, { mentions: [target] })
        } catch (e) { 
            console.error(e)
            m.reply("❌ *ᴀᴄᴛɪᴏɴ ꜰᴀɪʟᴇᴅ:* Ensure the target is still in the group.") 
        }
    }
}
