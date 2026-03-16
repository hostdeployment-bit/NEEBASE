const pkg = require('api-qasim');
const axios = require('axios');

module.exports = {
    cmd: "app",
    alias: ["apk", "apkdl", "playstore"],
    desc: "Search and download Android Apps (APKs)",
    category: "DOWNLOAD",
    async execute(conn, m, { text }) {
        if (!text) return m.reply("📱 *ᴜꜱᴀɢᴇ:* .app <app name>\n*Example:* .app WhatsApp");

        try {
            await m.react("🔍");
            
            const res = await pkg.apksearch(text);
            if (!res?.data || res.data.length === 0) {
                return m.reply("❌ *ɴᴏ ᴀᴘᴋꜱ ꜰᴏᴜɴᴅ.*");
            }

            const results = res.data.slice(0, 10);
            let caption = `╭══════════════════⊷\n` +
                          `║   ✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐀𝐏𝐊 𝐒𝐓𝐎𝐑𝐄* ✨\n` +
                          `╠══════════════════⊷\n` +
                          `║ 🔍 *ꜱᴇᴀʀᴄʜ:* ${text.toUpperCase()}\n` +
                          `║ 📝 *ɪɴꜰᴏ:* ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ\n` +
                          `╰══════════════════⊷\n\n`;

            results.forEach((item, i) => {
                caption += `*${i + 1}.* ${item.judul}\n   ⭐ *ʀᴀᴛɪɴɢ:* ${item.rating}\n\n`;
            });

            caption += `> ꜱᴇʟᴇᴄᴛɪᴏɴ ᴇxᴘɪʀᴇꜱ ɪɴ 𝟧 ᴍɪɴᴜᴛᴇꜱ ⏳`;

            const sentMsg = await conn.sendMessage(m.from, { 
                image: { url: results[0].thumb }, 
                caption: caption 
            }, { quoted: m });

            // Define the listener properly to prevent crashes
            const listener = async ({ messages }) => {
                const msg = messages[0];
                if (!msg.message || !msg.key.remoteJid || msg.key.remoteJid !== m.from) return;
                
                const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
                if (!quotedMsg || quotedMsg.stanzaId !== sentMsg.key.id) return;

                const replyText = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
                const choice = parseInt(replyText.trim());
                
                if (!isNaN(choice) && choice > 0 && choice <= results.length) {
                    // Stop listening immediately to save memory/prevent crash
                    conn.ev.off('messages.upsert', listener);

                    const selected = results[choice - 1];
                    await m.react("⏳");
                    m.reply(`⬇️ *ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ:* ${selected.judul}...`);

                    try {
                        const apiUrl = `https://discardapi.dpdns.org/api/apk/dl/android1?apikey=guru&url=${encodeURIComponent(selected.link)}`;
                        const dlRes = await axios.get(apiUrl);
                        const apk = dlRes.data?.result;

                        if (!apk?.url) return m.reply("❌ *ꜰᴀɪʟᴇᴅ ᴛᴏ ɢᴇᴛ ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋ.*");

                        await conn.sendMessage(m.from, { 
                            document: { url: apk.url }, 
                            fileName: `${apk.name}.apk`, 
                            mimetype: 'application/vnd.android.package-archive', 
                            caption: `📦 *${apk.name}* ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ.\n> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 🇰🇪`
                        }, { quoted: msg });
                        
                        await m.react("✅");
                    } catch (e) {
                        m.reply("❌ *ᴇʀʀᴏʀ ᴅᴜʀɪɴɢ ᴅᴏᴡɴʟᴏᴀᴅ.*");
                    }
                }
            };

            conn.ev.on('messages.upsert', listener);

            // Force kill listener after 5 mins to prevent memory overload
            setTimeout(() => {
                conn.ev.off('messages.upsert', listener);
            }, 300000);

        } catch (err) {
            m.reply("❌ *ᴀᴘᴘ ꜱᴇᴀʀᴄʜ ꜰᴀɪʟᴇᴅ!*");
        }
    }
};
