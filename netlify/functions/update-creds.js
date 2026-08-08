const { db } = require('./db');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405 };

    const { username, amount, action } = JSON.parse(event.body);

    if (!db) return { statusCode: 500, body: JSON.stringify({ error: "Database not configured" }) };

    try {
        const operator = (action === 'add') ? '+' : '-';

        await db.execute({
            sql: `UPDATE platform_user_profiles SET pounds_balance = pounds_balance ${operator} ? WHERE username = ?`,
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
