const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    cmd: "update",
    alias: ["upgrade", "gitpull"],
    desc: "Update POPKID-MD from NEEBASE Repo",
    category: "owner",
    isOwner: true,
    async execute(conn, m) {
        await m.react("📥");

        const repoUrl = "https://github.com/hostdeployment-bit/NEEBASE.git";
        const gitFolder = path.join(__dirname, "../.git");

        // Function to run the actual update logic
        const runUpdate = () => {
            exec("git fetch origin main", async (fetchErr) => {
                if (fetchErr) return m.reply(`❌ Git Fetch Error: ${fetchErr.message}`);

                exec("git log HEAD..origin/main --oneline", async (logErr, stdout) => {
                    if (logErr) return m.reply(`❌ Git Log Error: ${logErr.message}`);

                    if (!stdout || stdout.trim() === "") {
                        await m.react("✅");
                        return m.reply("✅ *POPKID-MD* is already up to date.");
                    }

                    const updateLogs = stdout.trim().split('\n').map(line => `🔹 ${line}`).join('\n');
                    await m.reply(`🚀 *Update Found!*\n\n*Commits:* \n${updateLogs}\n\n*Updating...*`);

                    // Reset and Pull (Best for panels)
                    exec("git reset --hard origin/main && git pull origin main", async (pullErr) => {
                        if (pullErr) return m.reply(`❌ Pull Error: ${pullErr.message}`);

                        await m.react("🔄");
                        setTimeout(() => { process.exit(); }, 2000);
                    });
                });
            });
        };

        // --- CHECK IF IT'S A REPO ---
        if (!fs.existsSync(gitFolder)) {
            await m.reply("🛠️ *Git not initialized.* Fixing repository links...");
            
            const initCmd = `git init && git remote add origin ${repoUrl} && git fetch origin && git checkout -f main`;
            
            exec(initCmd, (initErr) => {
                if (initErr) return m.reply(`❌ Initialization Failed: ${initErr.message}`);
                runUpdate();
            });
        } else {
            // It is a repo, just ensure the URL is correct and update
            exec(`git remote set-url origin ${repoUrl}`, () => {
                runUpdate();
            });
        }
    }
};
