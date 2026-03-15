const { downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");

module.exports = {
    cmd: "vv",
    alias: ["retrive", "viewonce"],
    desc: "Retrieve/Leak View-Once media",
    category: "tools",
    async execute(conn, m) {
        // 1. Check if the user is replying to a message
        const quoted = m.quoted ? m.quoted : null;
        if (!quoted) return m.reply("❌ *Please reply to a View-Once message!*");

        // 2. Identify if the quoted message is View-Once
        const msgType = getContentType(quoted.message);
        const isViewOnce = quoted.message?.viewOnceMessageV2 || quoted.message?.viewOnceMessage;

        if (!isViewOnce) return m.reply("❌ *That is not a View-Once message.*");

        try {
            await m.react("⏳");

            // 3. Extract the actual media message (Image or Video)
            const viewOnceContent = quoted.message.viewOnceMessageV2?.message || quoted.message.viewOnceMessage?.message;
            const mediaType = getContentType(viewOnceContent); // imageMessage or videoMessage
            const mediaData = viewOnceContent[mediaType];

            // 4. Download the media
            const stream = await downloadContentFromMessage(mediaData, mediaType.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 5. Send it back as a normal message
            const caption = `🔓 *POPKID-MD VIEW-ONCE LEAK*\n\n` +
                            `👤 *From:* @${quoted.sender.split('@')[0]}\n` +
                            `📝 *Caption:* ${mediaData.caption || "No caption"}\n\n` +
                            `*MASTER ENGINE 2026* 🇰🇪`;

            await conn.sendMessage(m.from, {
                [mediaType.replace('Message', '')]: buffer,
                caption: caption,
                mentions: [quoted.sender]
            }, { quoted: m });

            await m.react("✅");

        } catch (e) {
            console.error("VV Error:", e);
            m.reply("⚠️ *Error:* Failed to retrieve the media. It might have expired.");
        }
    }
};
