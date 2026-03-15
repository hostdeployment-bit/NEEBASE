const config = require("../config");

module.exports = {
    cmd: "settings",
    alias: ["config", "setup", "botset"],
    desc: "Turn bot features ON or OFF",
    category: "owner",
    isOwner: true, // Restricted to you
    async execute(conn, m, { text, args }) {
        // List of toggleable features
        const features = [
            "AUTO_READ_STATUS",
            "AUTO_REACT_STATUS",
            "AUTO_TYPING",
            "AUTO_RECORDING",
            "AUTO_BIO",
            "AUTO_REACT",
            "NON_PREFIX"
        ];

        // 1. If no arguments, show the current Dashboard
        if (!args[0]) {
            let menu = `⚙️ *POPKID-MD SETTINGS* \n\n`;
            features.forEach((feat) => {
                const status = config[feat] === "true" ? "✅ ON" : "❌ OFF";
                menu += `🔹 *${feat}:* ${status}\n`;
            });
            menu += `\n💡 *Usage:* .settings [feature] [on/off]\nExample: *.settings auto_bio off*`;
            
            return m.reply(menu);
        }

        // 2. Process Toggle
        const targetFeature = args[0].toUpperCase();
        const action = args[1] ? args[1].toLowerCase() : null;

        if (!features.includes(targetFeature)) {
            return m.reply(`❌ Invalid feature. Choose from:\n${features.join(", ")}`);
        }

        if (action === "on" || action === "true") {
            config[targetFeature] = "true";
            await m.react("✅");
            return m.reply(`✅ *${targetFeature}* has been turned *ON*`);
        } else if (action === "off" || action === "false") {
            config[targetFeature] = "false";
            await m.react("❌");
            return m.reply(`❌ *${targetFeature}* has been turned *OFF*`);
        } else {
            return m.reply(`❓ Please specify *on* or *off*.\nExample: *.settings ${targetFeature} on*`);
        }
    }
};
