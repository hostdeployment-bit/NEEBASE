module.exports = {
    cmd: "repo",
    alias: ["sc", "script", "source"],
    desc: "Get bot repository link",
    category: "MAIN",
    execute: async (conn, mek, context) => {
        const { reply, pushname } = context;

        const repoText = `🚀 *ᴘᴏᴘᴋɪᴅ-ᴍᴅ: ɴᴇᴇʙᴀsᴇ ʀᴇᴘᴏ*

👋 *Hey ${pushname},*
Here is the official script for the Master Engine 2026.

📂 *Link:* https://github.com/hostdeployment-bit/NEEBASE

> Powered by Popkid Kenya 🇰🇪`.trim();

        return await reply(repoText);
    }
};
