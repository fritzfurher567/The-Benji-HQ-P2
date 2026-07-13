// DELETE: const fetch = require('node-fetch');
// DO NOT import anything. 'fetch' is now built-in.

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    const { code } = JSON.parse(event.body);
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const REDIRECT_URI = "https://thebenjihq.netlify.app";

    try {
        // 'fetch' is now available globally
        const response = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error_description || data.error);

        const userRes = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${data.access_token}` }
        });
        const user = await userRes.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ ok: true, user })
        };
    } catch (err) {
        return { statusCode: 400, body: JSON.stringify({ ok: false, error: err.message }) };
    }
};