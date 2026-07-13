exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
  }

  try {
    const { code } = JSON.parse(event.body || "{}");
    if (!code) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Invalid OAuth: missing code" }) };
    }

    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      // Discord returns things like "invalid_grant" here — usually a stale/reused
      // code or a redirect_uri that doesn't exactly match the Developer Portal entry.
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          error: `Invalid OAuth: ${tokenData.error_description || tokenData.error || "token exchange failed"}`
        })
      };
    }

    const meRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `${tokenData.token_type} ${tokenData.access_token}` }
    });

    const me = await meRes.json();
    if (!meRes.ok) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Invalid OAuth: could not fetch Discord user" }) };
    }

    const username = me.username + (me.discriminator && me.discriminator !== "0" ? `#${me.discriminator}` : "");

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        user: { id: me.id, username }
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Invalid OAuth: server error" }) };
  }
};