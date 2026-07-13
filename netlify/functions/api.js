const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let schemaReady = false;
async function ensureSchema() {
  if (schemaReady) return;
  await db.execute(`
    CREATE TABLE IF NOT EXISTS platform_user_profiles (
      discordId TEXT PRIMARY KEY,
      username TEXT,
      pounds_balance INTEGER NOT NULL DEFAULT 0
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customerDiscord TEXT,
      customerDiscordId TEXT,
      paymentMethod TEXT,
      qty INTEGER,
      tip INTEGER,
      total INTEGER,
      status TEXT,
      created_at INTEGER
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS bank_load_requests (
      id TEXT PRIMARY KEY,
      customerDiscord TEXT,
      customerDiscordId TEXT,
      amount INTEGER,
      status TEXT,
      created_at INTEGER
    )
  `);
  schemaReady = true;
}

function ok(body) {
  return { statusCode: 200, body: JSON.stringify({ ok: true, ...body }) };
}
function fail(statusCode, error) {
  return { statusCode, body: JSON.stringify({ ok: false, error }) };
}

exports.handler = async (event) => {
  try {
    await ensureSchema();

    if (event.httpMethod === "GET") {
      const result = await db.execute("SELECT * FROM orders WHERE status != 'done' ORDER BY created_at DESC");
      return ok({ orders: result.rows });
    }

    if (event.httpMethod !== "POST") {
      return fail(405, "Method not allowed");
    }

    const data = JSON.parse(event.body || "{}");
    const { action } = data;

    switch (action) {
      case "getUserProfile": {
        const { discordId, username } = data;
        if (!discordId) return fail(400, "Missing discordId");

        let result = await db.execute({
          sql: "SELECT * FROM platform_user_profiles WHERE discordId = ?",
          args: [discordId]
        });

        if (result.rows.length === 0) {
          await db.execute({
            sql: "INSERT INTO platform_user_profiles (discordId, username, pounds_balance) VALUES (?, ?, 0)",
            args: [discordId, username || ""]
          });
          return ok({ profile: { discordId, username, pounds_balance: 0 } });
        }

        return ok({ profile: result.rows[0] });
      }

      case "listOrdersByUser": {
        const { discordId } = data;
        if (!discordId) return fail(400, "Missing discordId");
        const result = await db.execute({
          sql: "SELECT * FROM orders WHERE customerDiscordId = ? ORDER BY created_at DESC",
          args: [discordId]
        });
        return ok({ orders: result.rows });
      }

      case "createOrder": {
        const { orderId, customerDiscord, customerDiscordId, paymentMethod, qty, tip, total, status } = data;
        if (!orderId || !customerDiscordId) return fail(400, "Missing orderId or customerDiscordId");

        await db.execute({
          sql: `INSERT INTO orders (id, customerDiscord, customerDiscordId, paymentMethod, qty, tip, total, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [orderId, customerDiscord, customerDiscordId, paymentMethod, qty, tip, total, status || "order_received", Date.now()]
        });
        return ok({ orderId });
      }

      case "updateStatus": {
        const { orderId, status } = data;
        if (!orderId || !status) return fail(400, "Missing orderId or status");
        await db.execute({
          sql: "UPDATE orders SET status = ? WHERE id = ?",
          args: [status, orderId]
        });
        return ok({});
      }

      case "debitUserBalance": {
        const { discordId, username, amount } = data;
        if (!discordId || !amount || amount <= 0) return fail(400, "Missing discordId or invalid amount");

        const result = await db.execute({
          sql: "SELECT pounds_balance FROM platform_user_profiles WHERE discordId = ?",
          args: [discordId]
        });

        const currentBalance = result.rows.length ? Number(result.rows[0].pounds_balance) : 0;
        if (result.rows.length === 0) {
          return fail(400, "No profile found for this user");
        }
        if (currentBalance < amount) {
          return fail(400, "Insufficient balance");
        }

        await db.execute({
          sql: "UPDATE platform_user_profiles SET pounds_balance = pounds_balance - ? WHERE discordId = ?",
          args: [amount, discordId]
        });
        return ok({ newBalance: currentBalance - amount });
      }

      case "listBankLoadRequestsByUser": {
        const { discordId } = data;
        if (!discordId) return fail(400, "Missing discordId");
        const result = await db.execute({
          sql: "SELECT * FROM bank_load_requests WHERE customerDiscordId = ? ORDER BY created_at DESC",
          args: [discordId]
        });
        return ok({ requests: result.rows });
      }

      case "createBankLoadRequest": {
        const { customerDiscord, customerDiscordId, amount } = data;
        if (!customerDiscordId || !amount || amount <= 0) return fail(400, "Missing customerDiscordId or invalid amount");

        const id = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await db.execute({
          sql: `INSERT INTO bank_load_requests (id, customerDiscord, customerDiscordId, amount, status, created_at)
                VALUES (?, ?, ?, ?, 'pending', ?)`,
          args: [id, customerDiscord, customerDiscordId, amount, Date.now()]
        });
        return ok({ id });
      }

      default:
        return fail(400, `Unknown action: ${action}`);
    }
  } catch (err) {
    return fail(500, err.message || "Server error");
  }
};