module.exports = {
    cmd: "archivechat",
    alias: ["archive", "unarchive", "unarchivechat"],
    desc: "Archive or unarchive the current chat",
    category: "OWNER",
    isOwner: true,

    async execute(conn, m, { args }) {
        const chatId = m.chat;
        const body = m.body.toLowerCase();
        const isUnarchiveCmd = body.includes('unarchive');
        
        let action = args[0]?.toLowerCase();
        if (!action) {
            action = isUnarchiveCmd ? 'unarchive' : 'archive';
        }

        if (!['archive', 'unarchive'].includes(action)) {
            return m.reply(`*📦 ARCHIVE CHAT*\n\nUsage: \`.archive\` or \`.unarchive\``);
        }

        const shouldArchive = action === 'archive';

        try {
            // 1. Send the reply FIRST
            // If we send it after archiving, the message will force the chat to unarchive
            await m.reply(shouldArchive ? `📦 *Archiving this chat...*` : `📂 *Unarchiving this chat...*`);

            // 2. Small delay to ensure the message is fully sent and synced
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 3. Execute the modification
            await conn.chatModify({
                archive: shouldArchive,
                lastMessages: [
                    {
                        key: m.key,
                        messageTimestamp: m.messageTimestamp
                    }
                ]
            }, chatId);

        } catch (e) {
            console.error('[ARCHIVECHAT] Error:', e.message);
            m.reply(`❌ *Failed:* ${e.message}`);
        }
    }
};
