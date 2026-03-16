const { getContentType, downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
    cmd: "save",
    alias: ["getstatus", "downloadstatus"],
    desc: "Download and save a contact's status",
    category: "tools",
    async execute(conn, m) {
        try {
            // 1. Check if you are replying to a status
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted) return m.reply("❌ *Please reply to the status you want to save!*");

            // 2. Identify media type (Status can be Image, Video, or Text/Conversation)
            const type = getContentType(quoted);
            
            // If it's just a text status
            if (type === 'conversation' || type === 'extendedTextMessage') {
                const statusText = quoted.conversation || quoted.extendedTextMessage.text;
                const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
                await conn.sendMessage(botJid, { text: `📝 *SAVED STATUS TEXT:*\n\n${statusText}` });
                return m.reply("✅ Text status saved to your DM!");
            }

            // 3. Handle Media Status (Photo/Video)
            if (/imageMessage|videoMessage/.test(type)) {
                await m.react("⏳");
                
                const mediaData = quoted[type];
                const stream = await downloadContentFromMessage(mediaData, type.replace('Message', ''));
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                // 4. Send to your own DM
                const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
                const mediaType = type.replace('Message', '');
                
                await conn.sendMessage(botJid, {
                    [mediaType]: buffer,
                    caption: `📥 *SAVED STATUS*\n\n👤 *From:* ${m.message.extendedTextMessage.contextInfo.participant.split('@')[0]}\n📝 *Caption:* ${mediaData.caption || "No caption"}`
                });

                await m.react("✅");
                return m.reply("✅ Status media sent to your DM!");
            } else {
                return m.reply("❌ The bot couldn't find media in that status.");
            }

        } catch (e) {
            console.error(e);
            m.reply("⚠️ *Error:* Failed to save status. It may have expired or been deleted.");
        }
    }
};
