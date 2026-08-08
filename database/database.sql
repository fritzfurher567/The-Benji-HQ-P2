-- ==========================================
-- Benji HQ — database schema
-- ==========================================
-- This file is a reference mirror of what api.js already creates
-- automatically (see ensureSchema() in api.js) — you do NOT need to
-- run this manually. Turso/libSQL is SQLite-compatible, so this uses
-- SQLite syntax (TEXT/INTEGER, no SERIAL, no VARCHAR(n) limits).
--
-- If a table name or column here doesn't match api.js, api.js wins —
-- this file should always be kept in sync with it, not the other way
-- around.

-- 1. Customer Discord profiles + pounds balance
CREATE TABLE IF NOT EXISTS platform_user_profiles (
  discordId TEXT PRIMARY KEY,
  username TEXT,
  pounds_balance INTEGER NOT NULL DEFAULT 0
);

-- 2. Benji orders placed from the storefront
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customerDiscord TEXT,
  customerDiscordId TEXT,
  paymentMethod TEXT,
  qty INTEGER,
  tip INTEGER,
  total INTEGER,
  status TEXT,          -- order_received | making_order | order_done
  seller TEXT,
  meetup TEXT,
  created_at INTEGER,
  discountCode TEXT
);

-- 3. "Load Pounds" requests from customers
CREATE TABLE IF NOT EXISTS bank_load_requests (
  id TEXT PRIMARY KEY,
  customerDiscord TEXT,
  customerDiscordId TEXT,
  amount INTEGER,
  status TEXT,           -- pending | approved | declined
  created_at INTEGER
);

-- 4. Staff login codes — registered individually by the owner.
--    Nothing here is pre-seeded; the roster starts empty and the
--    owner adds real people from the owner panel.
CREATE TABLE IF NOT EXISTS worker_codes (
  code TEXT PRIMARY KEY,       -- e.g. W_SELL_01
  username TEXT,
  discordId TEXT,
  roleKey TEXT,                -- W_MGMT | W_SELL | W_CHEF | W_FISH | W_GATH | W_FARM | W_OWNER
  status TEXT,                 -- Active | Revoked
  created_at INTEGER,
  fired_at INTEGER,
  purge_at INTEGER             -- revoked codes auto-delete 7 days after this
);

-- 5. Transfer tickets (Gatherer/Farmer/Chef/Fisher/Manager -> Manager/Owner)
CREATE TABLE IF NOT EXISTS transfer_tickets (
  id TEXT PRIMARY KEY,
  requesterUsername TEXT,
  requesterRole TEXT,          -- Gatherer | Farmer | Chef | Fisher | Manager
  item TEXT,
  amount INTEGER,
  unitPrice INTEGER,           -- null for Chef (no per-unit rate)
  totalPrice INTEGER,          -- null for Chef
  fromLocation TEXT,
  toLocation TEXT,
  notes TEXT,
  status TEXT,                 -- Pending | Approved | Declined
  reviewedBy TEXT,
  created_at INTEGER,
  reviewed_at INTEGER
);

-- 6. Each worker's own on-hand stock, keyed by username + item
CREATE TABLE IF NOT EXISTS personal_stock (
  username TEXT,
  item TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (username, item)
);

-- 7. Discount codes the owner can hand out (public) or keep private
CREATE TABLE IF NOT EXISTS discount_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  isPublic INTEGER NOT NULL DEFAULT 1,
  fakePrice INTEGER NOT NULL DEFAULT 0,
  realPrice INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER
);

-- 8. App-wide key/value settings — this is where the owner's webhook
--    URLs and the global Benji stock number live. Only getOwnerSettings/
--    saveOwnerSettings in api.js ever read or write the webhook values,
--    so they never reach a customer's or worker's browser.
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,        -- order_webhook_url | transfer_webhook_url | global_stock
  value TEXT
);