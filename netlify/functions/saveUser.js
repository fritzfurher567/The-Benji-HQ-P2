const { db } = require('./db');

exports.handler = async (event) => {
    const { id, username } = JSON.parse(event.body || "{}");

    if (!id) return { statusCode: 400, body: JSON.stringify({ message: "Missing discord id" }) };
    if (!db) return { statusCode: 500, body: JSON.stringify({ message: "Database not configured." }) };

    try {
        await db.execute({
            sql: `INSERT INTO platform_user_profiles (discordId, username, pounds_balance) VALUES (?, ?, 0)
                  ON CONFLICT(discordId) DO UPDATE SET username = excluded.username`,
            args: [id, username || ""]
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "User saved." })
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ message: "Failed to save user." }) };
    }
};
