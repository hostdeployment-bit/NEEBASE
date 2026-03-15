const os = require('os');
const { performance } = require('perf_hooks');

module.exports = {
    cmd: "ping",
    alias: ["speed", "p"],
    desc: "Check bot speed and server status",
    category: "system", // Added to match your categorized menu
    async execute(conn, m) {
        const start = performance.now();
        
        // Initial "checking" message
        const { key } = await conn.sendMessage(m.from, { text: "⚡ *POPKID-MD Checking Speed...*" }, { quoted: m });

        const end = performance.now();
        const latency = (end - start).toFixed(2);

        // Get Server Info
        const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
        const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
        const usedMem = (totalMem - freeMem).toFixed(2);
        
        // Handling CPU model display safely
        const cpus = os.cpus();
        const cpuModel = cpus && cpus.length > 0 ? cpus[0].model.split(' ')[0] : "Generic";

        const response = `🏓 *PONG!* \n\n` +
            `🚀 *Latency:* ${latency}ms\n` +
            `💻 *Platform:* ${os.platform()} (${cpuModel})\n` +
            `🧠 *RAM Usage:* ${usedMem}GB / ${totalMem}GB\n\n` +
            `_POPKID-MD is running smoothly!_`;

        // Edit the previous message with the results
        await conn.sendMessage(m.from, { text: response, edit: key });
    }
};
