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
            
            // 1. Search Logic
            const res = await pkg.apksearch(text);
            if (!res?.data || !Array.isArray(res.data) || res.data.length === 0) {
                return m.reply("❌ *ɴᴏ ᴀᴘᴋꜱ ꜰᴏᴜɴᴅ.*");
            }

            const results = res.data.slice(0, 10); // Limit to top 10 results
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

            // Send results with thumbnail of the first result
            const sentMsg = await conn.sendMessage(m.from, { 
                image: { url: results[0].thumb }, 
                caption: caption 
            }, { quoted: m });

            // 2. Setup Listener (Concept from your provided script)
            const timeout = setTimeout(async () => {
                conn.ev.off('messages.upsert', listener);
            }, 5 * 60 * 1000);

            const listener = async ({ messages }) => {
                const msg = messages[0];
                if (!msg.message || msg.key.remoteJid !== m.from) return;
                
                const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
                if (!quotedMsg || quotedMsg.stanzaId !== sentMsg.key.id) return;

                const choice = parseInt(msg.message.conversation || msg.message.extendedTextMessage?.text);
                
                if (!isNaN(choice) && choice > 0 && choice <= results.length) {
                    clearTimeout(timeout);
                    conn.ev.off('messages.upsert', listener);

                    const selected = results[choice - 1];
                    await m.react("⏳");
                    m.reply(`⬇️ *ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ:* ${selected.judul}...\n_ᴛʜɪꜱ ᴍᴀʏ ᴛᴀᴋᴇ ᴀ ᴍᴏᴍᴇɴᴛ._`);

                    // 3. Download Logic
                    const apiUrl = `https://discardapi.dpdns.org/api/apk/dl/android1?apikey=guru&url=${encodeURIComponent(selected.link)}`;
                    const dlRes = await axios.get(apiUrl);
                    const apk = dlRes.data?.result;

                    if (!apk?.url) return m.reply("❌ *ꜰᴀɪʟᴇᴅ ᴛᴏ ɢᴇᴛ ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋ.*");

                    const apkCaption = `📦 *𝐀𝐏𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐃* 📦\n` +
                                     `══════════════════\n` +
                                     `📛 *ɴᴀᴍᴇ:* ${apk.name}\n` +
                                     `⚖️ *ꜱɪᴢᴇ:* ${apk.size}\n` +
                                     `📱 *ᴀɴᴅʀᴏɪᴅ:* ${apk.requirement}\n` +
                                     `══════════════════\n` +
                                     `> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 🇰🇪`;

                    await conn.sendMessage(m.from, { 
                        document: { url: apk.url }, 
                        fileName: `${apk.name}.apk`, 
                        mimetype: 'application/vnd.android.package-archive', 
                        caption: apkCaption 
                    }, { quoted: msg });
                    
                    await m.react("✅");
                }
            };

            conn.ev.on('messages.upsert', listener);

        } catch (err) {
            console.error(err);
            m.reply("❌ *ᴀᴘᴘ ꜱᴇᴀʀᴄʜ ꜰᴀɪʟᴇᴅ!*");
        }
    }
};
