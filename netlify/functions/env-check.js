// TEMPORARY DEBUG FILE — delete this once the env var issue is resolved.
// It never returns actual secret values, only true/false for whether each
// one is set, plus safe non-secret values (like the redirect URI) so we can
// see if they're correct without leaking anything.

exports.handler = async () => {
  const check = (key) => {
    const val = process.env[key];
    return {
      present: val !== undefined && val !== "",
      length: val ? val.length : 0
    };
  };

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      DISCORD_CLIENT_ID: check("DISCORD_CLIENT_ID"),
      DISCORD_CLIENT_SECRET: check("DISCORD_CLIENT_SECRET"),
      DISCORD_REDIRECT_URI: check("DISCORD_REDIRECT_URI"),
      TURSO_DATABASE_URL: check("TURSO_DATABASE_URL"),
      TURSO_AUTH_TOKEN: check("TURSO_AUTH_TOKEN"),
      OWNER_BOOTSTRAP_CODE: check("OWNER_BOOTSTRAP_CODE"),
      // Safe to show in full — not secret, just needs to match index.html exactly
      DISCORD_REDIRECT_URI_VALUE: process.env.DISCORD_REDIRECT_URI || null,
      DISCORD_CLIENT_ID_VALUE: process.env.DISCORD_CLIENT_ID || null
    }, null, 2)
  };
};