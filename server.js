
require('dotenv').config();
// 👇 ADD THESE TWO LINES TO DIAGNOSE 👇
console.log("🔗 DB URL:", process.env.TURSO_DATABASE_URL);
console.log("🔑 Token Loaded:", process.env.TURSO_AUTH_TOKEN ? "YES" : "NO (IT IS BLANK OR UNDEFINED!)");

// ... rest of your code ...
const express = require('express');
const { createClient } = require('@libsql/client');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON data from your website
app.use(express.json());

// 1. CONNECT TO TURSO
const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize database tables automatically
async function initDb() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT,
                total_pounds INTEGER DEFAULT 0
            );
        `);
        console.log("✅ Turso Database tables verified.");
    } catch (err) {
        console.error("❌ Database initialization failed:", err);
    }
}
initDb();

// 2. ROUTE: Add pounds (Replacing addpounds.js)
app.post('/api/addpounds', async (req, res) => {
    const { userId, username, pounds } = req.body;
    const amount = parseInt(pounds) || 0;

    if (!userId || !username) {
        return res.status(400).json({ success: false, message: "Missing tracking variables." });
    }

    try {
        await db.execute({
            sql: `INSERT INTO users (user_id, username, total_pounds) 
                  VALUES (?, ?, ?) 
                  ON CONFLICT(user_id) DO UPDATE SET 
                  total_pounds = total_pounds + excluded.total_pounds;`,
            args: [userId, username, amount]
        });

        const check = await db.execute({
            sql: "SELECT total_pounds FROM users WHERE user_id = ?",
            args: [userId]
        });

        res.json({ success: true, currentPounds: check.rows[0].total_pounds });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database transaction failed." });
    }
});

// 3. ROUTE: Save/Register User Profiles (Replacing saveUser.js)
app.post('/api/saveUser', async (req, res) => {
    const { userId, username } = req.body;

    if (!userId || !username) {
        return res.status(400).json({ success: false, message: "Missing profile details." });
    }

    try {
        await db.execute({
            sql: "INSERT INTO users (user_id, username) VALUES (?, ?) ON CONFLICT(user_id) DO NOTHING;",
            args: [userId, username]
        });
        res.json({ success: true, message: "User checked/saved successfully." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to save user." });
    }
});

// 4. ROUTE: Send Webhook Notifications (Replacing notify-discord.js)
app.post('/api/notify-discord', async (req, res) => {
    const { content, webhookUrl } = req.body;

    if (!content || !webhookUrl) {
        return res.status(400).json({ success: false, message: "Missing content or target webhook link." });
    }

    try {
        // Node 18+ has built-in global fetch
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content })
        });

        if (response.ok) {
            res.json({ success: true, message: "Discord channel notified!" });
        } else {
            res.status(400).json({ success: false, message: "Discord API rejected the payload." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to forward webhook." });
    }
});

// 6. ROUTE: Update/Deduct Credits (Replacing update-creds.js)
app.post('/api/updateCredits', async (req, res) => {
    const { userId, amount } = req.body;
    const changeAmount = parseInt(amount) || 0;

    if (!userId) {
        return res.status(400).json({ success: false, message: "Missing user ID." });
    }

    try {
        // Updates the total_pounds column by adding or subtracting the amount sent
        await db.execute({
            sql: "UPDATE users SET total_pounds = total_pounds + ? WHERE user_id = ?;",
            args: [changeAmount, userId]
        });

        const check = await db.execute({
            sql: "SELECT total_pounds FROM users WHERE user_id = ?",
            args: [userId]
        });

        const currentBalance = check.rows[0] ? check.rows[0].total_pounds : 0;
        res.json({ success: true, currentPounds: currentBalance });
    } catch (err) {
        console.error("❌ Failed to update credits:", err);
        res.status(500).json({ success: false, message: "Database transaction failed." });
    }
});

// 7. ROUTE: Get Tickets (Replacing get-tickets.js)
app.get('/api/get-tickets', async (req, res) => {
    try {
        // Dynamically creates a tickets table if it doesn't exist yet
        await db.execute(`
            CREATE TABLE IF NOT EXISTS tickets (
                ticket_id TEXT PRIMARY KEY,
                user_id TEXT,
                details TEXT,
                status TEXT DEFAULT 'open'
            );
        `);

        const result = await db.execute("SELECT * FROM tickets;");
        res.json({ success: true, tickets: result.rows });
    } catch (err) {
        console.error("❌ Failed to fetch tickets:", err);
        res.status(500).json({ success: false, message: "Failed to retrieve ticketing data." });
    }
});

// 8. ROUTE: Notify Discord (Replacing notify-discord.js)
app.post('/api/notify-discord', async (req, res) => {
    // This extracts whatever content or embed structure your App.jsx is sending
    const payload = req.body;

    // Pulls your secret Discord link safely from your environment variables
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        console.error("❌ DISCORD_WEBHOOK_URL is missing from your .env file!");
        return res.status(500).json({ success: false, message: "Server configuration missing webhook URL." });
    }

    try {
        // Forward the exact data payload over to Discord's official servers
        const discordResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (discordResponse.ok) {
            console.log("🔔 Discord notification dispatched successfully!");
            return res.json({ success: true });
        } else {
            const errorText = await discordResponse.text();
            console.error("❌ Discord API rejected the payload:", errorText);
            return res.status(discordResponse.status).json({ success: false, error: errorText });
        }
    } catch (err) {
        console.error("❌ Network error connecting to Discord:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// 5. START SERVER
app.listen(PORT, () => {
    console.log(`🚀 Unified command center live on http://localhost:${PORT}`);
});