const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');

/**
 * Converts Image/Video Buffer to WebP Sticker Buffer
 */
async function writeExif(media, type) {
    const tmpIn = path.join(__dirname, `../tmp/${crypto.randomBytes(3).toString('hex')}.${type === 'video' ? 'mp4' : 'jpg'}`);
    const tmpOut = path.join(__dirname, `../tmp/${crypto.randomBytes(3).toString('hex')}.webp`);

    fs.writeFileSync(tmpIn, media);

    const ffmpegCmd = type === 'video' 
        ? `ffmpeg -i ${tmpIn} -vcodec libwebp -filter_complex "[0:v] fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,split [a][b];[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];[b][p] paletteuse" -loop 0 -ss 00:00:00 -t 00:00:06 -preset default -an -vsync 0 ${tmpOut}`
        : `ffmpeg -i ${tmpIn} -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ${tmpOut}`;

    return new Promise((resolve, reject) => {
        exec(ffmpegCmd, (err) => {
            if (err) return reject(err);
            const buff = fs.readFileSync(tmpOut);
            if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
            if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
            resolve(buff);
        });
    });
}

module.exports = { writeExif };
