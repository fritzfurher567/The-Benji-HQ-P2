const { db } = require("./db");

exports.handler = async (event) => {
    // We are now receiving 'targetUsername' instead of 'targetId'
    const { targetUsername, amount, adminPassword } = JSON.parse(event.body);

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return { statusCode: 403, body: JSON.stringify({ message: "Access denied. Owner only!" }) };
    }

    if (!db) return { statusCode: 500, body: JSON.stringify({ message: "Database not configured." }) };

    try {
        // Find the user by their username and update their pounds balance
        const result = await db.execute({
            sql: "UPDATE platform_user_profiles SET pounds_balance = pounds_balance + ? WHERE username = ?",
            args: [parseInt(amount), targetUsername]
        });

        // Check if the user actually existed in the database
        if (result.rowsAffected === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: `User '${targetUsername}' not found in database.` })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Successfully added ${amount} pounds!` })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Database connection error." })
        };
    }
}
