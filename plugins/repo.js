/**
 * NEEBASE Plugin: Repository Info
 * Base: Master Engine 2026 (Unified Edition)
 * Features: GitHub Stats Fetch, Stylish Branding, Direct Links
 */

const axios = require("axios");

module.exports = {
    cmd: "repo",
    alias: ["sc", "script", "source"],
    category: "main",
    desc: "To get the bot repository information",
    use: '.repo',
    filename: __filename,
    execute: async (conn, mek, context) => {
        const { reply, pushname, from } = context;

        try {
            // --- 1. Fetch Live Stats from your GitHub ---
            const repoUrl = "https://github.com/popkidc/AUTO-MD";
            const response = await axios.get(repoUrl);
            const { stargazers_count, forks_count, open_issues_count, owner, created_at } = response.data;

            // --- 2. Build the Stylish Message ---
            let repoText = `✨ *POPKID-MD: OFFICIAL REPOSITORY* ✨\n\n`;
            repoText += `> *The most stable WhatsApp Bot engine in Kenya, optimized for Hugging Face and Vercel.* 🇰🇪\n\n`;
            
            repoText += `👤 *Owner:* ${owner.login}\n`;
            repoText += `⭐ *Stars:* ${stargazers_count}\n`;
            repoText += `🍴 *Forks:* ${forks_count}\n`;
            repoText += `📅 *Created:* ${new Date(created_at).toLocaleDateString()}\n`;
            repoText += `🛡️ *Engine:* Master Engine 2026\n\n`;
            
            repoText += `🔗 *Repo Link:* \nhttps://github.com/popkidc/AUTO-MD\n\n`;
            repoText += `👋 *Hey ${pushname},* feel free to fork the repo and give it a star to show support!`;

            // --- 3. Send with a Thumbnail ---
            // Using your official branding image we saw earlier
            await conn.sendMessage(from, { 
                image: { url: "https://files.catbox.moe/j9ia5c.png" },
                caption: repoText,
                contextInfo: {
                    externalAdReply: {
                        title: "POPKID-MD REPO",
                        body: "Powered by NEEBASE 2026",
                        thumbnailUrl: "https://files.catbox.moe/j9ia5c.png",
                        sourceUrl: "https://github.com/popkidc/AUTO-MD",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: mek });

        } catch (e) {
            console.error('[REPO ERROR]:', e);
            // Fallback if GitHub API is down
            return reply(`🚀 *POPKID-MD REPOSITORY*\n\n🔗 *Link:* https://github.com/popkidc/AUTO-MD\n\n> *Error fetching live stats, but the link is active!*`);
        }
    }
};
