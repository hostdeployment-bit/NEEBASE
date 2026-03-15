const { exec } = require("child_process");

module.exports = {
    cmd: "update",
    alias: ["upgrade", "gitpull"],
    desc: "Update POPKID-MD from NEEBASE Repo",
    category: "owner",
    isOwner: true,
    async execute(conn, m) {
        await m.react("📥");

        // The exact Repo URL from your link
        const repoUrl = "https://github.com/hostdeployment-bit/NEEBASE.git";

        // 1. Force the remote to match your NEEBASE repo
        exec(`git remote set-url origin ${repoUrl}`, (remoteErr) => {
            if (remoteErr) {
                // If remote origin doesn't exist, try adding it
                exec(`git remote add origin ${repoUrl}`);
            }

            // 2. Fetch the latest metadata from GitHub
            exec("git fetch origin main", async (fetchErr) => {
                if (fetchErr) return m.reply(`❌ Git Fetch Error: ${fetchErr.message}`);

                // 3. Check for new commits in the 'main' branch
                exec("git log HEAD..origin/main --oneline", async (logErr, stdout) => {
                    if (logErr) return m.reply(`❌ Git Log Error: ${logErr.message}`);

                    // If no output, we are already current
                    if (!stdout || stdout.trim() === "") {
                        await m.react("✅");
                        return m.reply("✅ *POPKID-MD* is already running the latest version of NEEBASE.");
                    }

                    const updateLogs = stdout.trim().split('\n').map(line => `🔹 ${line}`).join('\n');
                    await m.reply(`🚀 *Update Found in NEEBASE!*\n\n*Commits:* \n${updateLogs}\n\n*Applying updates and restarting...*`);

                    // 4. Stash local changes and pull (Clears conflicts automatically)
                    exec("git stash && git pull origin main", async (pullErr) => {
                        if (pullErr) return m.reply(`❌ Pull Error: ${pullErr.message}\n\n_Conflict detected. Try redeploying manually._`);

                        await m.react("🔄");
                        
                        // 2 second delay so you can see the "Success" reaction before restart
                        setTimeout(() => {
                            process.exit();
                        }, 2000);
                    });
                });
            });
        });
    }
};
