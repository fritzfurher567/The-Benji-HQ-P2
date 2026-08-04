exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
  }

  try {
    const { code, redirectUri } = JSON.parse(event.body || "{}");
    if (!code) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Invalid OAuth: missing code" }) };
    }

    const resolvedRedirectUri = redirectUri || process.env.DISCORD_REDIRECT_URI || "https://thebenjihq.netlify.app/";

    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: resolvedRedirectUri
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      // Discord returns things like "invalid_grant" here — usually a stale/reused
      // code, a client_secret mismatch, or a redirect_uri that doesn't exactly
      // match the Developer Portal entry.
      console.error("Discord token exchange failed:", tokenData);
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

    // CRITICAL: check meRes.ok BEFORE touching `me` — otherwise a 401 error
    // body from Discord (e.g. {"message":"401: Unauthorized","code":0}) gets
    // treated as if it were a real user object further down.
    if (!meRes.ok || !me.id) {
      console.error("Discord /users/@me failed:", me);
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: `Invalid OAuth: could not fetch Discord user (${me.message || meRes.status})` })
      };
    }

    const username = me.global_name || me.username || "Discord User";
    const displayName = me.global_name || me.username || "Discord User";

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        user: {
          id: me.id,
          username,
          displayName,
          avatar: me.avatar || null
        }
      })
    };
  } catch (err) {
    console.error("discord-auth crash:", err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Invalid OAuth: server error" }) };
  }
};