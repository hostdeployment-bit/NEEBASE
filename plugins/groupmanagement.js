const { isBotAdmin, isSenderAdmin, jidToNum } = require('../lib/utils')

module.exports = [
    {
        cmd: "join",
        desc: "Make the bot join a group via link",
        category: "owner",
        async execute(conn, m, { text, isOwner }) {
            if (!isOwner) return m.reply("👑 *ᴏᴡɴᴇʀ ᴏɴʟʏ:* This command is restricted.")
            let link = text?.match(/(https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]+)/g)?.[0]
            if (!link) return m.reply("🔗 *ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴡʜᴀᴛsᴀᴘᴘ ɢʀᴏᴜᴘ ʟɪɴᴋ*")
            
            try {
                const code = link.split('https://chat.whatsapp.com/')[1]
                await conn.groupAcceptInvite(code)
                await m.react("✅")
                m.reply("🚀 *Successfully Joined the Group!*")
            } catch (e) { m.reply("❌ *ꜰᴀɪʟᴇᴅ:* Link might be expired or bot is banned.") }
        }
    },
    {
        cmd: "link",
        alias: ["grouplink", "glink"],
        desc: "Get the current group invite link",
        category: "admin",
        isGroup: true,
        async execute(conn, m, { isOwner }) {
            if (!await isBotAdmin(conn, m.from)) return m.reply("❌ *ᴇʀʀᴏʀ:* I need Admin rights.")
            try {
                const code = await conn.groupInviteCode(m.from)
                const response = `🔗 *ɢʀᴏᴜᴘ ɪɴᴠɪᴛᴇ ʟɪɴᴋ*\n\nhttps://chat.whatsapp.com/${code}\n\n> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 𝟤𝟢𝟤𝟨 🇰🇪`
                m.reply(response)
            } catch (e) { m.reply("❌ *ꜰᴀɪʟᴇᴅ:* Make sure I am an admin.") }
        }
    },
    {
        cmd: "resetlink",
        alias: ["revoke", "resetglink"],
        desc: "Reset/Revoke the group invite link",
        category: "admin",
        isGroup: true,
        async execute(conn, m, { isOwner }) {
            if (!await isBotAdmin(conn, m.from)) return m.reply("❌ *ᴇʀʀᴏʀ:* I need Admin rights.")
            if (!isOwner && !await isSenderAdmin(conn, m.from, m.sender)) return m.reply("❌ *ʀᴇsᴛʀɪᴄᴛᴇᴅ:* Admins only.")
            try {
                await conn.groupRevokeInvite(m.from)
                await m.react("🔄")
                m.reply("🔄 *ɢʀᴏᴜᴘ ʟɪɴᴋ ʜᴀs ʙᴇᴇɴ ʀᴇsᴇᴛ sᴜᴄᴄᴇssꜰᴜʟʟʏ!*")
            } catch (e) { m.reply("❌ *ꜰᴀɪʟᴇᴅ:* Action could not be completed.") }
        }
    },
    {
        cmd: "tagall",
        alias: ["hidetag", "htag"],
        desc: "Tag all members with a message",
        category: "admin",
        isGroup: true,
        async execute(conn, m, { text, isOwner }) {
            if (!isOwner && !await isSenderAdmin(conn, m.from, m.sender)) return m.reply("❌ *ʀᴇsᴛʀɪᴄᴛᴇᴅ:* Admins only.")
            try {
                const metadata = await conn.groupMetadata(m.from)
                const participants = metadata.participants.map(v => v.id)
                let msg = `📢 *ᴀᴛᴛᴇɴᴛɪᴏɴ ᴇᴠᴇʀʏᴏɴᴇ*\n\n`
                msg += text ? `📝 *ᴍᴇssᴀɢᴇ:* ${text}\n\n` : ''
                msg += `👤 *ᴛᴏᴛᴀʟ ᴍᴇᴍʙᴇʀs:* ${participants.length}\n\n`
                
                participants.forEach(p => { msg += ` ❍ @${jidToNum(p)}\n` })
                
                await m.react("📢")
                conn.sendMessage(m.from, { text: msg, mentions: participants }, { quoted: m })
            } catch (e) { m.reply("❌ *ꜰᴀɪʟᴇᴅ ᴛᴏ ᴛᴀɢ ᴀʟʟ*") }
        }
    },
    {
        cmd: "gstatus",
        alias: ["groupstatus", "ginfo"],
        desc: "Get detailed group information",
        category: "misc",
        isGroup: true,
        async execute(conn, m) {
            try {
                const metadata = await conn.groupMetadata(m.from)
                const admins = metadata.participants.filter(v => v.admin !== null).length
                const createdAt = new Date(metadata.creation * 1000).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' })
                
                let status = `📊 *${metadata.subject} sᴛᴀᴛᴜs*\n\n` +
                             `🆔 *ɪᴅ:* ${metadata.id}\n` +
                             `📅 *ᴄʀᴇᴀᴛᴇᴅ:* ${createdAt}\n` +
                             `👑 *ᴏᴡɴᴇʀ:* @${jidToNum(metadata.owner || metadata.id.split('-')[0] + '@s.whatsapp.net')}\n` +
                             `👥 *ᴍᴇᴍʙᴇʀs:* ${metadata.participants.length}\n` +
                             `🛡️ *ᴀᴅᴍɪɴs:* ${admins}\n` +
                             `📝 *ᴅᴇsᴄ:* ${metadata.desc || 'No description'}\n\n` +
                             `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 𝟤𝟢𝟤𝟨 🇰🇪`
                
                m.reply(status, { mentions: [metadata.owner] })
            } catch (e) { m.reply("❌ *Could not fetch status*") }
        }
    },
    {
        cmd: "newgroup",
        alias: ["creategroup"],
        desc: "Create a new group with the bot",
        category: "owner",
        async execute(conn, m, { text, isOwner }) {
            if (!isOwner) return m.reply("👑 *ᴏᴡɴᴇʀ ᴏɴʟʏ:* Only you can make me create groups.")
            if (!text) return m.reply("📝 *ᴜsᴀɢᴇ:* .newgroup Name")
            try {
                await m.react("🏗️")
                const group = await conn.groupCreate(text, [m.sender])
                const link = await conn.groupInviteCode(group.id)
                m.reply(`✅ *ɢʀᴏᴜᴘ ᴄʀᴇᴀᴛᴇᴅ sᴜᴄᴄᴇssꜰᴜʟʟʏ!*\n\n🔗 *ʟɪɴᴋ:* https://chat.whatsapp.com/${link}`)
            } catch (e) { m.reply("❌ *ꜰᴀɪʟᴇᴅ ᴛᴏ ᴄʀᴇᴀᴛᴇ ɢʀᴏᴜᴘ*") }
        }
    }
]
