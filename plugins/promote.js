/**
 * POPKID-MD POWER-ADMIN SYSTEM (STALE-CACHE FIX)
 * This version forces a metadata refresh to ensure the Admin Badge is recognized.
 */

module.exports = {
    cmd: "promote",
    alias: ["demote", "kick"],
    desc: "Fixed Group Administration",
    category: "admin",
    isGroup: true,
    async execute(conn, m, { command }) {
        try {
            const from = m.from;
            
            // 1. Get Bot's clean number (The 'me' ID)
            const botNumber = conn.user.id.split(':')[0];
            const senderNumber = m.sender.split(':')[0];

            // 2. FORCE REFRESH: Fetch metadata directly from WhatsApp servers
            // This is the "secret sauce" to stop the stale cache error
            const groupMetadata = await conn.groupMetadata(from).catch(() => null);
            if (!groupMetadata) return m.reply("❌ Failed to fetch group data.");
            
            const participants = groupMetadata.participants;

            // 3. ROBUST SEARCH: Find Bot and Sender by matching number strings
            const botInList = participants.find(p => p.id.startsWith(botNumber));
            const senderInList = participants.find(p => p.id.startsWith(senderNumber));

            // --- THE REAL ADMIN CHECK ---
            if (!botInList || !botInList.admin) {
                // If it fails here, the bot definitely doesn't have the badge in WA's eyes
                return m.reply("❌ *POPKID-MD Error:* I've checked the server, and I still don't have the **Admin Badge**. Please remove me and add me back as Admin.");
            }

            // Super-user bypass for you
            const isOwner = senderNumber.includes("254732297194") || m.fromMe;
            if (!senderInList?.admin && !isOwner) {
                return m.reply("❌ *Restricted:* You need to be an **Admin** to use this.");
            }

            // 4. TARGET SELECTION
            const target = m.message?.extendedTextMessage?.contextInfo?.participant || 
                           m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

            if (!target) return m.reply(`📝 Please reply to a message or tag someone to ${command}.`);

            // 5. EXECUTION
            const action = command === "promote" ? "promote" : command === "demote" ? "demote" : "remove";
            
            await conn.groupParticipantsUpdate(from, [target], action);
            
            await m.react("✅");
            if (command !== "kick") {
                m.reply(`✅ *POPKID-MD:* ${command} successful for @${target.split('@')[0]}`, { mentions: [target] });
            }

        } catch (e) {
            console.error(e);
            m.reply("⚠️ *Engine Error:* Action failed. Try restarting the bot if I was just promoted.");
        }
    }
};
