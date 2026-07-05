const { createClient } = require('@libsql/client');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405 };

    const { username, amount, action } = JSON.parse(event.body);

    // Ensure these match your Netlify variable names exactly
    const db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    try {
        const operator = (action === 'add') ? '+' : '-';

        // This assumes you have a table named 'users' with 'balance' and 'username' columns
        await db.execute({
            sql: `UPDATE users SET balance = balance ${operator} ? WHERE username = ?`,
            args: [amount, username]
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: "Balance updated" })
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};