const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const { File } = require('megajs');

/**
 * sessionLoader - Restores the WhatsApp authentication file
 * @param {string} sessionId - The POPKID~ string from your config
 * @param {string} sessionDir - The path to the sessions folder
 */
async function loadSession(sessionId, sessionDir) {
    const credsPath = path.join(sessionDir, 'creds.json');

    // 1. If creds.json already exists locally, skip loading
    if (fs.existsSync(credsPath)) return true;

    // 2. Ensure the sessions directory exists
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }

    // 3. Validation: Must start with POPKID~
    if (!sessionId || !sessionId.startsWith("POPKID~")) {
        console.log("❌ Invalid or missing SESSION_ID in config.");
        return false;
    }

    const data = sessionId.replace("POPKID~", "");

    try {
        // --- STEP 1: TRY GZIP DECOMPRESSION ---
        // Most modern bots use GZIP to keep the session string small.
        const buffer = Buffer.from(data, 'base64');
        
        // GZIP magic numbers check (0x1f 0x8b)
        if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
            const gunzip = promisify(zlib.gunzip);
            const decompressed = await gunzip(buffer);
            fs.writeFileSync(credsPath, decompressed.toString('utf-8'));
            console.log("✅ Session restored via GZIP.");
            return true;
        }
    } catch (e) {
        // If not GZIP, move to MEGA check
    }

    try {
        // --- STEP 2: TRY MEGA.NZ DOWNLOAD ---
        // If the ID is a MEGA file key, download it.
        if (data.length > 20) { 
            const file = File.fromURL(`https://mega.nz/file/${data}`);
            return new Promise((resolve) => {
                file.download((err, data) => {
                    if (err) {
                        console.log("❌ MEGA Session Download Failed.");
                        resolve(false);
                    } else {
                        fs.writeFileSync(credsPath, data);
                        console.log("✅ Session restored via MEGA.");
                        resolve(true);
                    }
                });
            });
        }
    } catch (error) {
        console.log("❌ Session Loader Error:", error.message);
        return false;
    }

    return false;
}

module.exports = { loadSession };
