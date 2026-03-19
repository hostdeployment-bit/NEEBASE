module.exports = {
    cmd: "channelid",
    alias: ["newsletterid", "jidchannel"],
    desc: "Get the internal JID of a WhatsApp Channel from a link",
    category: "GENERAL",

    async execute(conn, m, { args }) {
        try {
            let url = args[0] || "";

            // 1. Handle Quoted Messages (if user replies to a link)
            if (!url && m.quoted) {
                url = m.quoted.text || "";
            }

            // 2. Validation
            if (!url || !url.includes('whatsapp.com/channel/')) {
                return m.reply(`❌ *Invalid Link*\n\nPlease provide a valid WhatsApp Channel URL.\n\n*Example:* \`${m.prefix}channelid https://whatsapp.com/channel/xxxxx\``);
            }

            // 3. Extract the invite code
            const code = url.split('/').pop();

            await m.react("🔍");

            // 4. Fetch Metadata using Baileys newsletterMetadata
            // Note: Use "invite" as the first argument to resolve via link
            const metadata = await conn.newsletterMetadata("invite", code);

            const response = `✨ *CHANNEL FOUND* ✨\n\n` +
                             `📛 *Name:* ${metadata.name || 'Unknown'}\n` +
                             `🆔 *JID:* ${metadata.id}\n` +
                             `👥 *Subscribers:* ${metadata.subscribers || 'Hidden'}\n\n` +
                             `> *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ᴇɴɢɪɴᴇ* 🇰🇪`;

            await conn.sendMessage(m.chat, { text: response }, { quoted: m });

        } catch (err) {
            console.error('Channel ID Error:', err.message);
            m.reply('❌ *Failed to resolve:* This channel might be private, deleted, or the link is invalid.');
        }
    }
};
