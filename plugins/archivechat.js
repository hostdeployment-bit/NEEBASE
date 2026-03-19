module.exports = {
    cmd: "archivechat",
    alias: ["archive", "unarchive", "unarchivechat"],
    desc: "Archive or unarchive the current chat",
    category: "OWNER",
    isOwner: true, // Restricted to Popkid (Owner)

    async execute(conn, m, { args, text }) {
        const chatId = m.chat;
        const body = m.body.toLowerCase();

        // 1. Auto-detect action from the command used
        // Check if the user typed .unarchive or .unarchivechat
        const isUnarchiveCmd = body.includes('unarchive');
        
        let action = args[0]?.toLowerCase();
        if (!action) {
            action = isUnarchiveCmd ? 'unarchive' : 'archive';
        }

        // 2. Validation
        if (!['archive', 'unarchive'].includes(action)) {
            return m.reply(`*📦 ARCHIVE CHAT*\n\n*Usage:*\n• \`.archivechat archive\`\n• \`.archivechat unarchive\`\n\n_Or use aliases: \`.archive\` / \`.unarchive\`_`);
        }

        const shouldArchive = action === 'archive';

        try {
            // 3. Execute Chat Modification
            await conn.chatModify({
                archive: shouldArchive,
                lastMessages: [
                    {
                        key: m.key,
                        messageTimestamp: m.messageTimestamp
                    }
                ]
            }, chatId);

            // 4. Success Message
            const response = shouldArchive 
                ? `📦 *Chat archived successfully!*` 
                : `📂 *Chat unarchived successfully!*`;
            
            await m.reply(response);

        } catch (e) {
            console.error('[ARCHIVECHAT] Error:', e.message);
            m.reply(`❌ *Failed to ${action} chat:* ${e.message}`);
        }
    }
};
