const { db } = require('./db');

exports.handler = async () => {
    if (!db) return { statusCode: 500, body: JSON.stringify({ error: "Database not configured" }) };

    try {
        const rs = await db.execute("SELECT * FROM transfer_tickets WHERE status = 'Pending' ORDER BY created_at DESC");
        return {
            statusCode: 200,
            body: JSON.stringify(rs.rows)
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
