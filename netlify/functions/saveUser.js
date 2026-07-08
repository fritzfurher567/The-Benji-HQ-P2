exports.handler = async (event) => {
    // 1. Get the data sent from your website
    const { id, username } = JSON.parse(event.body);


// for the value stored under "TURSO_DATABASE_URL"
const url = `${process.env.TURSO_DATABASE_URL}/v2/pipeline`;

    // 3. Send the request to your database
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.TURSO_AUTH_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            requests: [
                {
                    type: "execute",
                    stmt: {
                        sql: "INSERT OR REPLACE INTO users (discord_id, username) VALUES (?, ?)",
                        args: [{ type: "text", value: id }, { type: "text", value: username }]
                    }
                }
            ]
        })
    });

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "User saved via HTTP API!" })
    };
};

async function saveUserToDatabase(user) {
    const response = await ('http://localhost:3000/api/saveUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Send the Discord ID and username as a JSON object
        body: JSON.stringify({
            id: user.id,
            username: user.username
        })
    });

    const result = await response.json();
    console.log(result.message); // Should print "User saved via HTTP API!"
}