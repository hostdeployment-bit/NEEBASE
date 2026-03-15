const { getContentType, downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
    cmd: "vv",
    alias: ["retrive", "viewonce"],
    desc: "Retrieve/Leak View-Once media",
    category: "tools",
    async execute(conn, m) {
        try {
            // 1. Get the content of the replied message (same as your setpp logic)
            const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) return m.reply("❌ *Please reply to a View-Once message!*");

            // 2. Identify the View-Once container
            const isViewOnce = quotedMsg.viewOnceMessageV2 || quotedMsg.viewOnceMessage;
            if (!isViewOnce) return m.reply("❌ *That is not a View-Once message.*");

            // 3. Extract actual media content (Image or Video)
            const mediaContent = isViewOnce.message;
            const mediaType = getContentType(mediaContent); // 'imageMessage' or 'videoMessage'
            const mediaData = mediaContent[mediaType];

            await m.react("⏳");

            // 4. Download media stream (Same logic as your setpp)
            const stream = await downloadContentFromMessage(mediaData, mediaType.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 5. Send back as permanent media
            const caption = `🔓 *POPKID-MD VIEW-ONCE LEAK*\n\n` +
                            `📝 *Caption:* ${mediaData.caption || "No caption"}\n\n` +
                            `*MASTER ENGINE 2026* 🇰🇪`;

            const finalType = mediaType.replace('Message', ''); // 'image' or 'video'
            
            await conn.sendMessage(m.from, {
                [finalType]: buffer,
                caption: caption
            }, { quoted: m });

            await m.react("✅");

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Error:* ${e.message}`);
        }
    }
};
