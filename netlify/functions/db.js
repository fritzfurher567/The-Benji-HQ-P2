// Single shared Turso connection. Every function that touches the
// database imports { db } from here instead of calling createClient()
// itself, so there is exactly one place that wires up Turso.
const { createClient } = require("@libsql/client");

const hasDbConfig = Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);

const db = hasDbConfig
  ? createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : null;

module.exports = { db, hasDbConfig };
