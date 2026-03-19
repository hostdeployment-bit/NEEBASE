module.exports = {
    cmd: "newsletter",
    alias: ["channelid", "chid"],
    desc: "Get detailed information about a WhatsApp Channel",
    category: "GENERAL",

    async execute(conn, m, { args, text }) {
        try {
            const q = text || (m.quoted ? m.quoted.text : "");
            
            if (!q) return m.reply("❎ Please provide a WhatsApp Channel link.\n\n*Example:* .cinfo https://whatsapp.com/channel/123456789");

            // 1. Precise Regex for extraction
            const match = q.match(/whatsapp\.com\/channel\/([\w-]+)/);
            if (!match) return m.reply("⚠️ *Invalid channel link format.*\n\nMake sure it looks like:\nhttps://whatsapp.com/channel/xxxxxxxxx");

            const inviteId = match[1];
            await m.react("📡");

            // 2. Fetch Metadata
            let metadata;
            try {
                metadata = await conn.newsletterMetadata("invite", inviteId);
            } catch (e) {
                return m.reply("❌ Failed to fetch channel metadata. Make sure the link is correct.");
            }

            if (!metadata || !metadata.id) return m.reply("❌ Channel not found or inaccessible.");

            // 3. Construct the Info Text
            const infoText = `\`📡 Channel Info\`\n\n` +
                `🛠️ *ID:* ${metadata.id}\n` +
                `📌 *Name:* ${metadata.name}\n` +
                `👥 *Followers:* ${metadata.subscribers?.toLocaleString() || "N/A"}\n` +
                `📅 *Created on:* ${metadata.creation_time ? new Date(metadata.creation_time * 1000).toLocaleString("en-KE") : "Unknown"}\n\n` +
                `> *ᴘᴏᴘᴋɪᴅ-ᴍᴅ ᴇɴɢɪɴᴇ* 🇰🇪`;

            // 4. Send with Preview Image if available
            if (metadata.preview) {
                await conn.sendMessage(m.chat, {
                    image: { url: `https://pps.whatsapp.net${metadata.preview}` },
                    caption: infoText
                }, { quoted: m });
            } else {
                await m.reply(infoText);
            }

        } catch (error) {
            console.error("❌ Error in .cinfo plugin:", error);
            m.reply("⚠️ An unexpected error occurred.");
        }
    }
};
