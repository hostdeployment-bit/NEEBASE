/**
 * POPKID-MD MASTER UTILS 
 * Optimized & Complete for Engine V3 🇰🇪
 */

const fs = require('fs');
const path = require('path');

// ── 1. JID & ID Handling ─────────────────────────────────────
const extractJidForms = (jid) => {
    if (!jid) return { full: '', numeric: '' };
    const full = jid;
    const numeric = jid.split('@')[0].split(':')[0];
    return { full, numeric };
};

const jidToNum = (jid) => {
    return jid ? jid.split('@')[0].split(':')[0] : '';
};

const numToJid = (num) => {
    const clean = num.replace(/[^0-9]/g, '');
    return `${clean}@s.whatsapp.net`;
};

// ── 2. Administrative Checks ─────────────────────────────────
const isBotAdmin = async (conn, jid) => {
    try {
        const meta = await conn.groupMetadata(jid);
        const participants = meta.participants || [];
        const bot = extractJidForms(conn.user.id);

        return participants.some(p => {
            const pId = extractJidForms(p.id);
            const match = (bot.full === pId.full || bot.numeric === pId.numeric);
            return match && (p.admin === 'admin' || p.admin === 'superadmin');
        });
    } catch { return false; }
};

const isSenderAdmin = async (conn, jid, sender) => {
    try {
        const meta = await conn.groupMetadata(jid);
        const participants = meta.participants || [];
        const user = extractJidForms(sender);

        return participants.some(p => {
            const pId = extractJidForms(p.id);
            const match = (user.full === pId.full || user.numeric === pId.numeric);
            return match && (p.admin === 'admin' || p.admin === 'superadmin');
        });
    } catch { return false; }
};

// ── 3. Time & Formatting ─────────────────────────────────────
const formatUptime = (seconds) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
};

const getNairobiTime = () => {
    return new Date().toLocaleString('en-KE', {
        timeZone: 'Africa/Nairobi',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

// ── 4. File & Media Helpers ──────────────────────────────────
const getSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// ── 5. General Utilities ─────────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const capitalize = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

module.exports = {
    extractJidForms,
    jidToNum,
    numToJid,
    isBotAdmin,
    isSenderAdmin,
    formatUptime,
    getNairobiTime,
    getSize,
    sleep,
    randItem,
    capitalize
};
