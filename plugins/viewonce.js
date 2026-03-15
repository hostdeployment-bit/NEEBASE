const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
    cmd: "vv",
    alias: ["viewonce", "retrive"],
    desc: "Download and resend View-Once media",
    category: "utility",
    async execute(conn, m) {
        // 1. Check if the message is a View-Once or if it's replying to one
        const quoted = m.quoted ? m.quoted : m;
        const msgType = Object.keys(quoted.message || {})[0];
        
        // Ensure it is a view-once message
        const isViewOnce = quoted.message?.[msgType]?.viewOnce || 
                           msgType === 'viewOnceMessage' || 
                           msgType === 'viewOnceMessageV2';

        if (!isViewOnce) return m.reply("❌ Please reply to a *View Once* message.");

        await m.react("⏳");

        try {
            // 2. Extract the actual media message (image/video)
            const viewOnceContent = quoted.message.viewOnceMessage?.message || 
                                   quoted.message.viewOnceMessageV2?.message || 
                                   quoted.message;
            
            const actualType = Object.keys(viewOnceContent)[0];
            const mediaMessage = viewOnceContent[actualType];

            // 3. Download the media
            const stream = await downloadContentFromMessage(
                mediaMessage,
                actualType === 'imageMessage' ? 'image' : 'video'
            );

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 4. Resend the media as a standard message
            const caption = mediaMessage.caption ? `📩 *POPKID-MD VV BYPASS*\n\n📝 *Caption:* ${mediaMessage.caption}` : "📩 *POPKID-MD VV BYPASS*";

            if (actualType === 'imageMessage') {
                await conn.sendMessage(m.from, { image: buffer, caption: caption }, { quoted: m });
            } else if (actualType === 'videoMessage') {
                await conn.sendMessage(m.from, { video: buffer, caption: caption }, { quoted: m });
            }

            await m.react("✅");

        } catch (e) {
            console.error("VV Plugin Error:", e);
            m.reply("❌ Failed to download View Once media. It might have expired.");
        }
    }
};
