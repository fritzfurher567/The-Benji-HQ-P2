const { createClient } = require('@libsql/client');

exports.handler = async () => {
    const db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    try {
        const rs = await db.execute("SELECT * FROM tickets WHERE status = 'pending'");
        return {
            statusCode: 200,
            body: JSON.stringify(rs.rows)
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};