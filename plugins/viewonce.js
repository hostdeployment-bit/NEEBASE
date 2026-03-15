const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
    cmd: "vv",
    alias: ["viewonce", "retrive"],
    desc: "Download and resend View-Once media",
    category: "utility",
    async execute(conn, m) {
        // 1. Get the quoted message
        const quoted = m.quoted ? m.quoted : null;
        if (!quoted) return m.reply("❌ Please reply to a *View Once* message.");

        // 2. Advanced check for View Once properties
        const msgType = Object.keys(quoted.message || {})[0];
        const content = quoted.message[msgType];
        
        // This covers both V1 and V2 View Once structures
        const isViewOnce = quoted.message?.viewOnceMessage || 
                           quoted.message?.viewOnceMessageV2 || 
                           content?.viewOnce;

        if (!isViewOnce) return m.reply("❌ Please reply to a *View Once* message.");

        await m.react("⏳");

        try {
            // 3. Extract the real media content
            const realMsg = quoted.message.viewOnceMessage?.message || 
                            quoted.message.viewOnceMessageV2?.message || 
                            quoted.message;
            
            const mediaType = Object.keys(realMsg)[0];
            const mediaData = realMsg[mediaType];

            // 4. Download and buffer
            const stream = await downloadContentFromMessage(
                mediaData,
                mediaType === 'imageMessage' ? 'image' : 'video'
            );

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 5. Send back as normal media
            const cap = mediaData.caption ? `📩 *POPKID-MD VV BYPASS*\n\n📝 *Caption:* ${mediaData.caption}` : "📩 *POPKID-MD VV BYPASS*";

            if (mediaType === 'imageMessage') {
                await conn.sendMessage(m.from, { image: buffer, caption: cap }, { quoted: m });
            } else {
                await conn.sendMessage(m.from, { video: buffer, caption: cap }, { quoted: m });
            }

            await m.react("✅");

        } catch (e) {
            console.error("VV Error:", e);
            m.reply("❌ Failed to download. The media might have already been viewed or expired.");
        }
    }
};
