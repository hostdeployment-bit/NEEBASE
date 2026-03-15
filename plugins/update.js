const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    cmd: "update",
    alias: ["upgrade", "gitpull"],
    desc: "Force update all files from NEEBASE",
    category: "owner",
    isOwner: true,
    async execute(conn, m) {
        await m.react("📥");

        const repoUrl = "https://github.com/hostdeployment-bit/NEEBASE.git";
        
        // Command is hidden from stdout using 'q' or redirecting to /dev/null
        const updateCmd = `
            git init -q && 
            git remote remove origin || true && 
            git remote add origin ${repoUrl} && 
            git fetch origin main -q && 
            git log HEAD..origin/main --oneline
        `;

        exec(updateCmd, async (err, stdout) => {
            if (err) {
                // Ignore the 'empty secondary path' non-error
                if (!err.message.includes("secondary path")) {
                    return m.reply(`❌ Git Sync Error: ${err.message}`);
                }
            }

            // Filter out system messages so only real commits remain
            const cleanCommits = stdout
                .trim()
                .split('\n')
                .filter(line => !line.toLowerCase().includes('reinitialized') && line.length > 5)
                .map(line => `🔹 ${line}`)
                .join('\n');

            if (!cleanCommits || cleanCommits === "") {
                await m.react("✅");
                return m.reply("✅ *POPKID-MD* is already fully synced with NEEBASE.");
            }

            await m.reply(`🚀 *Update Found!*\n\n*Latest Changes:* \n${cleanCommits}\n\n*Synchronizing all files...*`);

            // Force reset and pull
            exec("git reset --hard origin/main && git pull origin main", async (finalErr) => {
                if (finalErr) return m.reply(`❌ Final Sync Failed: ${finalErr.message}`);

                await m.react("🔄");
                await m.reply("✅ *Engine Synchronized!* Restarting now...");
                
                setTimeout(() => { 
                    process.exit(); 
                }, 2000);
            });
        });
    }
};
