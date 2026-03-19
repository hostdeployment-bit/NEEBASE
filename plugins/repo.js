/**
 * NEEBASE Plugin: Simple Repository
 * Base: Master Engine 2026 (Unified Edition)
 */

module.exports = {
    cmd: "repo",
    alias: ["sc", "script", "source"],
    category: "main",
    desc: "To get the bot repository link",
    execute: async (conn, mek, context) => {
        const { reply, pushname } = context;

        const repoText = `
🚀 *POPKID-MD: NEEBASE REPO*

👋 *Hey ${pushname},*
Here is the official script for the Master Engine 2026.

📂 *Link:* https://github.com/popkidc/AUTO-MD

> Powered by Popkid Kenya 🇰🇪
`.trim();

        try {
            // Sending as a simple text message to ensure it never fails
            return await reply(repoText);
        } catch (e) {
            console.error('[REPO SIMPLE ERROR]:', e);
        }
    }
};
