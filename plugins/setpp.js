const { getContentType } = require("@whiskeysockets/baileys");

module.exports = {
    cmd: "setpp",
    alias: ["setbotpp"],
    desc: "Force Change Bot PP",
    category: "owner",
    isOwner: true,
    async execute(conn, m) {
        try {
            // 1. Manually extract the quoted message from the raw source
            const messageContent = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!messageContent) {
                return m.reply("❌ Please reply to an image!");
            }

            // 2. Look for the image data inside the raw object
            const type = getContentType(messageContent);
            const isImage = type === 'imageMessage' || 
                            messageContent?.imageMessage || 
                            messageContent?.documentMessage?.mimetype?.includes('image');

            if (!isImage) {
                return m.reply("❌ The bot sees the reply but doesn't find a photo. Make sure you are replying to a Gallery image.");
            }

            await m.react("⏳");

            // 3. Use the raw download provider
            const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
            const imageMsg = messageContent.imageMessage || messageContent.documentMessage;
            
            const stream = await downloadContentFromMessage(imageMsg, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 4. Force Update
            const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            await conn.updateProfilePicture(botJid, buffer);
            
            await m.react("✅");
            m.reply("✅ *POPKID-MD* PP successfully forced!");

        } catch (e) {
            console.error("Critical SetPP Error:", e);
            m.reply(`❌ Internal Error: ${e.message}`);
        }
    }
};
