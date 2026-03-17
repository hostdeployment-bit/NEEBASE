const { isBotAdmin, isSenderAdmin, jidToNum } = require('../lib/utils')

module.exports = [
    {
        cmd: "leave",
        alias: ["out", "exit", "left"],
        desc: "Make the bot leave the current group",
        category: "owner",
        isGroup: true,
        async execute(conn, m, { isOwner }) {
            // Only the Owner (Popkid) should be able to make the bot leave
            if (!isOwner) return m.reply("👑 *ᴏᴡɴᴇʀ ᴏɴʟʏ:* You cannot tell me to leave.")
            
            try {
                await m.react("👋")
                await m.reply("👋 *ɢᴏᴏᴅʙʏᴇ ᴇᴠᴇʀʏᴏɴᴇ!* \n\nᴘᴏᴘᴋɪᴅ-ᴍᴅ ɪs ɴᴏᴡ ʟᴇᴀᴠɪɴɢ ᴛʜɪs ᴄʜᴀᴛ. 🇰🇪")
                
                // Slight delay to ensure the message is sent before leaving
                await new Promise(resolve => setTimeout(resolve, 2000))
                
                await conn.groupLeave(m.from)
            } catch (e) {
                console.error("Leave Error:", e)
                m.reply("❌ *ꜰᴀɪʟᴇᴅ:* I couldn't leave the group.")
            }
        }
    },
    {
        cmd: "kick",
        alias: ["remove", "vuta"],
        desc: "Remove a member from the group",
        category: "admin",
        isGroup: true,
        async execute(conn, m, { isOwner }) {
            try {
                // Check permissions
                if (!await isBotAdmin(conn, m.from)) return m.reply("❌ *ᴇʀʀᴏʀ:* I need Admin rights.")
                if (!isOwner && !await isSenderAdmin(conn, m.from, m.sender)) return m.reply("❌ *ʀᴇsᴛʀɪᴄᴛᴇᴅ:* Admins only.")

                // Identify target (Tag or Reply)
                let target = m.quoted ? m.quoted.sender : m.mentionedJid?.[0]
                if (!target) return m.reply("⚠️ *ᴛᴀɢ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴘᴇʀsᴏɴ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ᴋɪᴄᴋ*")

                // Prevent the bot from kicking the Owner or itself
                if (target.includes(config.OWNER_NUMBER)) return m.reply("🚫 *ʀᴇsᴛʀɪᴄᴛᴇᴅ:* I cannot kick my Creator.")
                
                await m.react("👞")
                await conn.groupParticipantsUpdate(m.from, [target], 'remove')

                const kickText = `✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐔𝐏𝐃𝐀𝐓𝐄* ✨\n\n` +
                                 `👞 *ᴀᴄᴛɪᴏɴ:* User Kick\n` +
                                 `👤 *ᴜsᴇʀ:* @${jidToNum(target)}\n` +
                                 `✅ *sᴛᴀᴛᴜs:* Successfully Removed\n\n` +
                                 `> *Mission Completed* 🛡️`;

                m.reply(kickText, { mentions: [target] })

            } catch (e) {
                console.error("Kick Error:", e)
                m.reply("❌ *ᴀᴄᴛɪᴏɴ ꜰᴀɪʟᴇᴅ:* Ensure the target is still in the group.")
            }
        }
    }
]
