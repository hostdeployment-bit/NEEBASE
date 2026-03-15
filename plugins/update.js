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
        
        // This command sequence:
        // 1. Initializes git if missing
        // 2. Forces the remote URL to the correct one
        // 3. Fetches the latest code
        // 4. Overwrites EVERYTHING locally with the GitHub version
        const updateCmd = `
            git init && 
            git remote remove origin || true && 
            git remote add origin ${repoUrl} && 
            git fetch origin main && 
            git log HEAD..origin/main --oneline
        `;

        exec(updateCmd, async (err, stdout) => {
            if (err && !err.message.includes("fatal: empty secondary path")) {
                // If it's a real error, report it
                if (!stdout) return m.reply(`❌ Git Sync Error: ${err.message}`);
            }

            if (!stdout || stdout.trim() === "") {
                await m.react("✅");
                return m.reply("✅ *POPKID-MD* is already fully synced with NEEBASE.");
            }

            const commits = stdout.trim().split('\n').map(line => `🔹 ${line}`).join('\n');
            await m.reply(`🚀 *Deep Update Found!*\n\n*Changes in index, plugins, and core:* \n${commits}\n\n*Overwriting all files...*`);

            // THE NUCLEAR OPTION: Force reset matches GitHub exactly
            exec("git reset --hard origin/main && git pull origin main", async (finalErr) => {
                if (finalErr) return m.reply(`❌ Final Sync Failed: ${finalErr.message}`);

                await m.react("🔄");
                await m.reply("✅ *All files updated successfully!* Restarting engine...");
                
                setTimeout(() => { 
                    process.exit(); 
                }, 2000);
            });
        });
    }
};
