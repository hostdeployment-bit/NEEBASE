/**
 * NEEBASE Plugin: Group Joiner & Info Scout
 * Base: Master Engine 2026
 * Features: Invite Code Extraction, Pre-join Info, Owner Restricted
 */

module.exports = {
    cmd: 'joingroup',
    alias: ['join', 'gcjoin', 'groupinfo'],
    category: 'owner',
    description: 'Join a group via invite link or get group info from link',
    execute: async (sock, m, context) => {
        // Standard NEEBASE context mapping
        const { text, args, isOwner } = context;
        const msgArgs = text ? text.split(' ') : args;
        
        // Ensure this stays Owner Only as per your requirement
        if (!isOwner) return m.reply("❌ This is a Developer-Restricted command, Popkid.");

        const pluginContext = {
            chatId: m.chat,
            senderId: m.sender,
            senderIsOwnerOrSudo: isOwner,
            rawText: m.body, // Passing raw text to check if it's .groupinfo
            channelInfo: {}, 
            ...context
        };

        return await handler(sock, m, msgArgs, pluginContext);
    }
};

async function handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    
    // Logic to check which command was actually called
    const rawText = (context.rawText || '').toLowerCase();
    const isInfo = rawText.includes('groupinfo');
    
    const input = args[0];

    if (!input) {
        return await sock.sendMessage(chatId, {
            text: `*${isInfo ? '🔍 NEEBASE INFO SCOUT' : '🚪 NEEBASE GROUP JOINER'}*\n\n` +
                `*Usage:*\n` +
                `• \`.joingroup <link/code>\` \n` +
                `• \`.groupinfo <link/code>\` (Scout without joining)`,
            ...channelInfo
        }, { quoted: message });
    }

    // Clean the link to get just the code
    const code = input.replace('https://chat.whatsapp.com/', '').trim();

    try {
        if (isInfo) {
            // Fetching info without joining
            const info = await sock.groupGetInviteInfo(code);
            const members = info.participants?.length || 0;
            
            return await sock.sendMessage(chatId, {
                text: `╔═══════════════════════╗\n` +
                    `║    🔍 *GROUP SCOUT* ║\n` +
                    `╚═══════════════════════╝\n\n` +
                    `*Name:* ${info.subject || 'Unknown'}\n` +
                    `*Desc:* ${info.desc || 'No description'}\n` +
                    `*Members:* ${members}\n` +
                    `*Created:* ${info.creation ? new Date(info.creation * 1000).toLocaleDateString() : 'Unknown'}\n\n` +
                    `*ID:* \`${info.id}\``,
                ...channelInfo
            }, { quoted: message });
            
        } else {
            // Accepting the invite
            const response = await sock.groupAcceptInvite(code);
            
            return await sock.sendMessage(chatId, {
                text: `✅ *NEEBASE JOINED SUCCESSFULLY!*\n\n*Target JID:* \`${response}\``,
                ...channelInfo
            }, { quoted: message });
        }
    }
    catch (e) {
        console.error('[JOINGROUP] Error:', e.message);
        await sock.sendMessage(chatId, {
            text: `❌ *NEEBASE Error:* ${e.message}`,
            ...channelInfo
        }, { quoted: message });
    }
}
