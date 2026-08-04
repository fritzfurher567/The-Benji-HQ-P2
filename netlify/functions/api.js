const { createClient } = require("@libsql/client");
const {
  ORANGE,
  getTransferWebhookSettingKeyForRole,
  buildOrderWebhookPayload,
  buildPoundsWebhookPayload,
  buildTransferWebhookPayload
} = require("./webhook-utils");
const { normalizeDiscountCode, resolveDiscountForOrder } = require("./discount-utils");
const { validateCodeForRole, getBootstrapOwnerCode, isBootstrapOwnerCode, canRegisterWorker } = require("./code-utils");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_ORDER_WEBHOOK_URL = process.env.BENJI_ORDER_WEBHOOK_URL || "https://discord.com/api/webhooks/1519403301374787666/CDzN1oODxyQA4zQeCidemB58d4bjVwtFU8XfCPZwW4zBlnuhjKmXSDt7oyZ7GYhBjdxJ";
const DEFAULT_POUNDS_WEBHOOK_URL = process.env.BENJI_POUNDS_WEBHOOK_URL || "https://discord.com/api/webhooks/1519403176930054329/t0hT6O936JluOaD476NiwyEzseafVFEPH8rUgxVE0wfPKAZAGLCM2aCDzin2TkOrRSpo";
const DEFAULT_TRANSFER_WEBHOOK_URL = process.env.BENJI_TRANSFER_WEBHOOK_URL || "https://discord.com/api/webhooks/1518747199293358170/98WSV1uVc6ePnPL60r3KQjLLObEV6hxHR0YMiNiX3sDCfbhuc02tgLtSDtFeYWHH0qU6";

let schemaReady = false;
async function ensureSchema() {
  if (schemaReady) return;
  await db.execute(`CREATE TABLE IF NOT EXISTS platform_user_profiles (
    discordId TEXT PRIMARY KEY, username TEXT, pounds_balance INTEGER NOT NULL DEFAULT 0
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, customerDiscord TEXT, customerDiscordId TEXT, paymentMethod TEXT,
    qty INTEGER, tip INTEGER, total INTEGER, status TEXT, seller TEXT, meetup TEXT, created_at INTEGER
  )`);
  try {
    await db.execute("ALTER TABLE orders ADD COLUMN discountCode TEXT");
  } catch (e) {
    if (!String(e.message || "").includes("already exists") && !String(e.message || "").includes("duplicate column")) {
      console.warn("Could not add discountCode column to orders", e.message);
    }
  }
  await db.execute(`CREATE TABLE IF NOT EXISTS bank_load_requests (
    id TEXT PRIMARY KEY, customerDiscord TEXT, customerDiscordId TEXT, amount INTEGER, status TEXT, created_at INTEGER
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS worker_codes (
    code TEXT PRIMARY KEY, username TEXT, discordId TEXT, roleKey TEXT, status TEXT,
    created_at INTEGER, fired_at INTEGER, purge_at INTEGER
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS transfer_tickets (
    id TEXT PRIMARY KEY, requesterUsername TEXT, requesterRole TEXT, item TEXT, amount INTEGER,
    unitPrice INTEGER, totalPrice INTEGER, fromLocation TEXT, toLocation TEXT, notes TEXT,
    status TEXT, reviewedBy TEXT, created_at INTEGER, reviewed_at INTEGER
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS personal_stock (
    username TEXT, item TEXT, quantity INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (username, item)
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS discount_codes (
    id TEXT PRIMARY KEY, code TEXT UNIQUE, isPublic INTEGER NOT NULL DEFAULT 1,
    fakePrice INTEGER NOT NULL DEFAULT 0, realPrice INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY, value TEXT
  )`);
  schemaReady = true;
}

function ok(body) { return { statusCode: 200, body: JSON.stringify({ ok: true, ...body }) }; }
function fail(statusCode, error) { return { statusCode, body: JSON.stringify({ ok: false, error }) }; }

async function getSetting(key, fallback = null) {
  const r = await db.execute({ sql: "SELECT value FROM app_settings WHERE key = ?", args: [key] });
  return r.rows.length ? r.rows[0].value : fallback;
}
async function setSetting(key, value) {
  await db.execute({
    sql: "INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    args: [key, String(value)]
  });
}

async function postWebhook(url, payload) {
  if (!url) return;
  try {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  } catch (e) {
    console.warn("Webhook dispatch failed", e);
  }
}

async function purgeExpiredWorkers() {
  const now = Date.now();
  await db.execute({
    sql: "DELETE FROM worker_codes WHERE status = 'Revoked' AND purge_at IS NOT NULL AND purge_at <= ?",
    args: [now]
  });
}

exports.handler = async (event) => {
  try {
    await ensureSchema();

    if (event.httpMethod === "GET") {
      const result = await db.execute("SELECT * FROM orders WHERE status != 'order_done' ORDER BY created_at DESC");
      return ok({ orders: result.rows });
    }
    if (event.httpMethod !== "POST") return fail(405, "Method not allowed");

    const data = JSON.parse(event.body || "{}");
    const { action } = data;

    switch (action) {

      // ---------- CUSTOMER PROFILE / ORDERS ----------
      case "getUserProfile": {
        const { discordId, username } = data;
        if (!discordId) return fail(400, "Missing discordId");
        let result = await db.execute({ sql: "SELECT * FROM platform_user_profiles WHERE discordId = ?", args: [discordId] });
        if (result.rows.length === 0) {
          await db.execute({ sql: "INSERT INTO platform_user_profiles (discordId, username, pounds_balance) VALUES (?, ?, 0)", args: [discordId, username || ""] });
          return ok({ profile: { discordId, username, pounds_balance: 0 } });
        }
        return ok({ profile: result.rows[0] });
      }

      case "listOrdersByUser": {
        const { discordId } = data;
        if (!discordId) return fail(400, "Missing discordId");
        const result = await db.execute({ sql: "SELECT * FROM orders WHERE customerDiscordId = ? ORDER BY created_at DESC", args: [discordId] });
        return ok({ orders: result.rows });
      }

      case "createOrder": {
        const { orderId, customerDiscord, customerDiscordId, paymentMethod, qty, tip, total, discountCode, status } = data;
        if (!orderId || !customerDiscordId) return fail(400, "Missing orderId or customerDiscordId");

        await db.execute({
          sql: `INSERT INTO orders (id, customerDiscord, customerDiscordId, paymentMethod, qty, tip, total, discountCode, status, seller, meetup, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', ?)`,
          args: [orderId, customerDiscord, customerDiscordId, paymentMethod, qty, tip, total, discountCode || "", status || "order_received", Date.now()]
        });

        const webhookUrl = await getSetting("order_webhook_url", DEFAULT_ORDER_WEBHOOK_URL);
        await postWebhook(webhookUrl, buildOrderWebhookPayload({ customerDiscord, qty, tip, total, paymentMethod, orderId }));

        return ok({ orderId });
      }

      case "listOrders": {
        const result = await db.execute("SELECT * FROM orders WHERE status != 'order_done' ORDER BY created_at DESC");
        return ok({ orders: result.rows });
      }

      case "updateOrderStatus": {
        const { orderId, status, seller } = data;
        if (!orderId || !status) return fail(400, "Missing orderId or status");
        await db.execute({ sql: "UPDATE orders SET status = ?, seller = ? WHERE id = ?", args: [status, seller || "", orderId] });
        return ok({});
      }

      case "updateOrderMeetup": {
        const { orderId, meetup } = data;
        if (!orderId) return fail(400, "Missing orderId");
        await db.execute({ sql: "UPDATE orders SET meetup = ? WHERE id = ?", args: [meetup || "", orderId] });
        return ok({});
      }

      case "debitUserBalance": {
        const { discordId, amount } = data;
        if (!discordId || !amount || amount <= 0) return fail(400, "Missing discordId or invalid amount");
        const result = await db.execute({ sql: "SELECT pounds_balance FROM platform_user_profiles WHERE discordId = ?", args: [discordId] });
        if (result.rows.length === 0) return fail(400, "No profile found for this user");
        const currentBalance = Number(result.rows[0].pounds_balance);
        if (currentBalance < amount) return fail(400, "Insufficient balance");
        await db.execute({ sql: "UPDATE platform_user_profiles SET pounds_balance = pounds_balance - ? WHERE discordId = ?", args: [amount, discordId] });
        return ok({ newBalance: currentBalance - amount });
      }

      case "listBankLoadRequestsByUser": {
        const { discordId } = data;
        if (!discordId) return fail(400, "Missing discordId");
        const result = await db.execute({ sql: "SELECT * FROM bank_load_requests WHERE customerDiscordId = ? ORDER BY created_at DESC", args: [discordId] });
        return ok({ requests: result.rows });
      }

      case "createBankLoadRequest": {
        const { customerDiscord, customerDiscordId, amount } = data;
        if (!customerDiscordId || !amount || amount <= 0) return fail(400, "Missing customerDiscordId or invalid amount");
        const id = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await db.execute({
          sql: `INSERT INTO bank_load_requests (id, customerDiscord, customerDiscordId, amount, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)`,
          args: [id, customerDiscord, customerDiscordId, amount, Date.now()]
        });

        const webhookUrl = await getSetting("pounds_webhook_url", DEFAULT_POUNDS_WEBHOOK_URL);
        await postWebhook(webhookUrl, buildPoundsWebhookPayload({ customerDiscord, amount }));

        return ok({ id });
      }

      // ---------- STOCK ----------
      case "getStock": {
        const stock = await getSetting("global_stock", "0");
        return ok({ stock: Number(stock) });
      }

      case "setStock": {
        const { value } = data;
        if (value === undefined || Number(value) < 0) return fail(400, "Invalid stock value");
        await setSetting("global_stock", Number(value));
        return ok({});
      }

      case "getPersonalStock": {
        const { username } = data;
        if (!username) return fail(400, "Missing username");
        const result = await db.execute({ sql: "SELECT item, quantity FROM personal_stock WHERE username = ?", args: [username] });
        const map = {};
        result.rows.forEach(r => { map[r.item] = Number(r.quantity); });
        return ok({ stock: map });
      }

      case "savePersonalStock": {
        const { username, stock } = data;
        if (!username || typeof stock !== "object") return fail(400, "Missing username or stock");
        for (const [item, qty] of Object.entries(stock)) {
          await db.execute({
            sql: `INSERT INTO personal_stock (username, item, quantity) VALUES (?, ?, ?)
                  ON CONFLICT(username, item) DO UPDATE SET quantity = excluded.quantity`,
            args: [username, item, Math.max(0, Number(qty) || 0)]
          });
        }
        return ok({});
      }

      case "listDiscountCodes": {
        const result = await db.execute("SELECT * FROM discount_codes ORDER BY created_at DESC, code ASC");
        return ok({ discounts: result.rows });
      }

      case "createDiscountCode": {
        const { code, isPublic, fakePrice, realPrice } = data;
        const normalizedCode = normalizeDiscountCode(code);
        if (!normalizedCode) return fail(400, "Missing discount code");
        const id = `DISC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const publicFlag = isPublic === true || isPublic === 1 || isPublic === "1" ? 1 : 0;
        await db.execute({
          sql: `INSERT INTO discount_codes (id, code, isPublic, fakePrice, realPrice, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(code) DO UPDATE SET isPublic = excluded.isPublic, fakePrice = excluded.fakePrice, realPrice = excluded.realPrice, created_at = excluded.created_at`,
          args: [id, normalizedCode, publicFlag, Math.max(0, Number(fakePrice) || 0), Math.max(0, Number(realPrice) || 0), Date.now()]
        });
        return ok({ id });
      }

      case "deleteDiscountCode": {
        const { code } = data;
        const normalizedCode = normalizeDiscountCode(code);
        if (!normalizedCode) return fail(400, "Missing discount code");
        await db.execute({ sql: "DELETE FROM discount_codes WHERE code = ?", args: [normalizedCode] });
        return ok({});
      }

      case "resolveDiscountCode": {
        const { code, baseTotal, tip, allowPrivate } = data;
        const normalizedCode = normalizeDiscountCode(code);
        if (!normalizedCode) return ok({ applied: false, total: Number(baseTotal || 0) + Number(tip || 0), discountAmount: 0, code: normalizedCode });
        const result = await db.execute({ sql: "SELECT * FROM discount_codes WHERE code = ?", args: [normalizedCode] });
        const discount = result.rows[0];
        const resolved = resolveDiscountForOrder({ code: normalizedCode, baseTotal, tip, discount, allowPrivate: Boolean(allowPrivate) });
        return ok({ ...resolved, isPublic: discount ? Number(discount.isPublic || 0) : 0 });
      }

      // ---------- WORKER CODES ----------
      case "validateWorkerCode": {
        const { code } = data;
        if (!code) return fail(400, "Missing code");
        const upper = String(code).trim().toUpperCase();
        const bootstrapOwnerCode = getBootstrapOwnerCode();

        if (upper === bootstrapOwnerCode) {
          return ok({ worker: { username: "Owner", roleKey: "W_OWNER" } });
        }

        await purgeExpiredWorkers();
        const result = await db.execute({ sql: "SELECT * FROM worker_codes WHERE code = ? AND status = 'Active'", args: [upper] });
        if (!result.rows.length) return fail(400, "Invalid or revoked code.");
        const w = result.rows[0];
        return ok({ worker: { username: w.username, roleKey: w.roleKey } });
      }

      case "registerWorker": {
        const { username, discordId, roleKey, code } = data;
        if (!username || !code) return fail(400, "Username and code are required.");
        if (!validateCodeForRole(roleKey, code)) return fail(400, "Code format invalid for selected role. Example: W_SELL_01 to W_SELL_20");
        if (!canRegisterWorker(roleKey, code)) return fail(400, "Owner access is locked to the bootstrap owner code.");

        const upper = String(code).trim().toUpperCase();
        const existing = await db.execute({ sql: "SELECT code FROM worker_codes WHERE code = ?", args: [upper] });
        if (existing.rows.length) return fail(400, "That code already exists.");

        if (upper === getBootstrapOwnerCode()) {
          const existingOwner = await db.execute({ sql: "SELECT code FROM worker_codes WHERE roleKey = 'W_OWNER'" });
          if (existingOwner.rows.length) return fail(400, "The owner code is already registered.");
        }

        await db.execute({
          sql: `INSERT INTO worker_codes (code, username, discordId, roleKey, status, created_at) VALUES (?, ?, ?, ?, 'Active', ?)`,
          args: [upper, username, discordId || "", roleKey, Date.now()]
        });
        return ok({});
      }

      case "listWorkers": {
        await purgeExpiredWorkers();
        const result = await db.execute("SELECT * FROM worker_codes ORDER BY created_at DESC");
        return ok({ workers: result.rows });
      }

      case "setWorkerStatus": {
        const { code, status } = data;
        if (!code || !status) return fail(400, "Missing code or status");
        if (isBootstrapOwnerCode(code)) return fail(400, "The owner code is locked and cannot be changed.");
        if (status === "Revoked") {
          await db.execute({
            sql: "UPDATE worker_codes SET status = 'Revoked', fired_at = ?, purge_at = ? WHERE code = ?",
            args: [Date.now(), Date.now() + 7 * DAY_MS, code]
          });
        } else {
          await db.execute({
            sql: "UPDATE worker_codes SET status = 'Active', fired_at = NULL, purge_at = NULL WHERE code = ?",
            args: [code]
          });
        }
        return ok({});
      }

      // ---------- TRANSFER TICKETS ----------
      case "createTransferTicket": {
        const { requesterUsername, requesterRole, item, amount, unitPrice, totalPrice, fromLocation, toLocation, notes } = data;
        if (!requesterUsername || !requesterRole || !item) return fail(400, "Missing ticket fields");

        const id = `TR-${Math.floor(100000 + Math.random() * 900000)}`;
        await db.execute({
          sql: `INSERT INTO transfer_tickets (id, requesterUsername, requesterRole, item, amount, unitPrice, totalPrice, fromLocation, toLocation, notes, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
          args: [id, requesterUsername, requesterRole, item, amount, unitPrice ?? null, totalPrice ?? null, fromLocation || "", toLocation || "", notes || "", Date.now()]
        });

        const webhookKey = getTransferWebhookSettingKeyForRole(requesterRole);
        const webhookUrl = await getSetting(webhookKey, await getSetting("transfer_webhook_url", DEFAULT_TRANSFER_WEBHOOK_URL));
        await postWebhook(webhookUrl, buildTransferWebhookPayload({ requesterUsername, requesterRole, item, amount, totalPrice, fromLocation, toLocation, notes }));

        return ok({ id });
      }

      case "listTransferTicketsByUser": {
        const { username, role } = data;
        if (!username || !role) return fail(400, "Missing username or role");
        const result = await db.execute({
          sql: "SELECT * FROM transfer_tickets WHERE requesterUsername = ? AND requesterRole = ? ORDER BY created_at DESC",
          args: [username, role]
        });
        return ok({ tickets: result.rows });
      }

      case "listTransferTickets": {
        const result = await db.execute("SELECT * FROM transfer_tickets ORDER BY created_at DESC");
        return ok({ tickets: result.rows });
      }

      case "decideTransferTicket": {
        const { id, decision, reviewedBy } = data;
        if (!id || !decision) return fail(400, "Missing id or decision");
        const status = decision === "approve" ? "Approved" : "Declined";
        await db.execute({
          sql: "UPDATE transfer_tickets SET status = ?, reviewedBy = ?, reviewed_at = ? WHERE id = ?",
          args: [status, reviewedBy || "", Date.now(), id]
        });

        const ticketResult = await db.execute({ sql: "SELECT * FROM transfer_tickets WHERE id = ?", args: [id] });
        const t = ticketResult.rows[0];
        if (t) {
          const webhookUrl = await getSetting("transfer_webhook_url");
          await postWebhook(webhookUrl, {
            embeds: [{
              title: `Owner ${status}: ${t.id}`,
              color: decision === "approve" ? 3066993 : 15158332,
              fields: [
                { name: "Discord Username", value: String(t.requesterUsername || "Unknown"), inline: true },
                { name: "Role", value: String(t.requesterRole || "Unknown"), inline: true },
                { name: "Item", value: String(t.item || "-"), inline: true },
                { name: "Amount", value: String(t.amount || "-"), inline: true },
                { name: "Pay", value: t.totalPrice != null ? `${Number(t.totalPrice).toLocaleString()}p` : "-", inline: true },
                { name: "Route", value: `${t.fromLocation || "-"} -> ${t.toLocation || "-"}`, inline: false },
                { name: "Notes", value: t.notes || "None", inline: false }
              ],
              timestamp: new Date().toISOString()
            }]
          });
        }

        return ok({});
      }

      // ---------- OWNER SETTINGS (webhook URLs never returned outside these two actions) ----------
      case "getOwnerSettings": {
        const orderWebhook = await getSetting("order_webhook_url", DEFAULT_ORDER_WEBHOOK_URL);
        const transferWebhook = await getSetting("transfer_webhook_url", DEFAULT_TRANSFER_WEBHOOK_URL);
        const poundsWebhook = await getSetting("pounds_webhook_url", DEFAULT_POUNDS_WEBHOOK_URL);
        const gathererTransferWebhook = await getSetting("gatherer_transfer_webhook_url", DEFAULT_TRANSFER_WEBHOOK_URL);
        const fisherTransferWebhook = await getSetting("fisher_transfer_webhook_url", DEFAULT_TRANSFER_WEBHOOK_URL);
        const farmerTransferWebhook = await getSetting("farmer_transfer_webhook_url", DEFAULT_TRANSFER_WEBHOOK_URL);
        const chefTransferWebhook = await getSetting("chef_transfer_webhook_url", DEFAULT_TRANSFER_WEBHOOK_URL);
        const managerTransferWebhook = await getSetting("manager_transfer_webhook_url", DEFAULT_TRANSFER_WEBHOOK_URL);
        const stock = await getSetting("global_stock", "0");
        return ok({ settings: {
          order_webhook_url: orderWebhook,
          transfer_webhook_url: transferWebhook,
          pounds_webhook_url: poundsWebhook,
          gatherer_transfer_webhook_url: gathererTransferWebhook,
          fisher_transfer_webhook_url: fisherTransferWebhook,
          farmer_transfer_webhook_url: farmerTransferWebhook,
          chef_transfer_webhook_url: chefTransferWebhook,
          manager_transfer_webhook_url: managerTransferWebhook,
          global_stock: Number(stock)
        } });
      }

      case "saveOwnerSettings": {
        const { order_webhook_url, transfer_webhook_url, pounds_webhook_url, gatherer_transfer_webhook_url, fisher_transfer_webhook_url, farmer_transfer_webhook_url, chef_transfer_webhook_url, manager_transfer_webhook_url, global_stock } = data;
        if (order_webhook_url !== undefined) await setSetting("order_webhook_url", order_webhook_url);
        if (transfer_webhook_url !== undefined) await setSetting("transfer_webhook_url", transfer_webhook_url);
        if (pounds_webhook_url !== undefined) await setSetting("pounds_webhook_url", pounds_webhook_url);
        if (gatherer_transfer_webhook_url !== undefined) await setSetting("gatherer_transfer_webhook_url", gatherer_transfer_webhook_url);
        if (fisher_transfer_webhook_url !== undefined) await setSetting("fisher_transfer_webhook_url", fisher_transfer_webhook_url);
        if (farmer_transfer_webhook_url !== undefined) await setSetting("farmer_transfer_webhook_url", farmer_transfer_webhook_url);
        if (chef_transfer_webhook_url !== undefined) await setSetting("chef_transfer_webhook_url", chef_transfer_webhook_url);
        if (manager_transfer_webhook_url !== undefined) await setSetting("manager_transfer_webhook_url", manager_transfer_webhook_url);
        if (global_stock !== undefined) await setSetting("global_stock", Number(global_stock));
        return ok({});
      }

      default:
        return fail(400, `Unknown action: ${action}`);
    }
  } catch (err) {
    return fail(500, err.message || "Server error");
  }
};