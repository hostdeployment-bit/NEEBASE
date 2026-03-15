const { sticker } = require("../lib/sticker"); // Ensure you have a sticker lib

module.exports = {
    cmd: "sticker",
    alias: ["s", "stik"],
    desc: "Convert image/video to sticker",
    category: "convert",
    async execute(conn, m) {
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        if (/image|video/.test(mime)) {
            await m.react("🎨");
            const media = await quoted.download();
            const encMedia = await conn.sendImageAsSticker(m.from, media, m, {
                packname: "POPKID-MD",
                author: "Popkid Kenya"
            });
        } else {
            m.reply("❌ Please reply to an image or short video!");
        }
    }
};
