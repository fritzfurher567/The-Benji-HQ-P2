const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

exports.handler = async (event) => {
    try {
        // --- GET: Fetch all active orders ---
        if (event.httpMethod === 'GET') {
            const result = await client.execute("SELECT * FROM orders WHERE status != 'done'");
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.rows)
            };
        }

        // --- POST: Update Orders ---
        if (event.httpMethod === 'POST') {
            const data = JSON.parse(event.body);

            // Update Status & Assign Seller
            if (data.action === 'updateStatus') {
                await client.execute({
                    sql: "UPDATE orders SET status = ?, seller = ? WHERE id = ?",
                    args: [data.status, data.seller, data.orderId]
                });
            }

            // Update Meetup Location
            if (data.action === 'updateLocation') {
                await client.execute({
                    sql: "UPDATE orders SET meetup = ? WHERE id = ?",
                    args: [data.meetup, data.orderId]
                });
            }

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Update successful" })
            };
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};