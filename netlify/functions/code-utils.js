function normalizeRoleKey(roleKey) {
  const normalizedRole = String(roleKey || "").trim().toUpperCase();
  if (normalizedRole === "W_MANAGER") return "W_MGMT";
  return normalizedRole;
}

function validateCodeForRole(roleKey, code) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  const normalizedRole = normalizeRoleKey(roleKey);

  if (normalizedCode === "W_TBHQ_NICHO") {
    return normalizedRole === "W_OWNER";
  }

  const m = normalizedCode.match(/^W_((?:MGMT|MANAGER)|SELL|CHEF|FISH|GATH|FARM)_(\d{2})$/);
  if (!m) return false;

  const num = parseInt(m[2], 10);
  if (num < 1 || num > 20) return false;

  const codeRole = m[1].toUpperCase() === "MANAGER" ? "W_MGMT" : `W_${m[1].toUpperCase()}`;
  return codeRole === normalizedRole;
}

module.exports = {
  validateCodeForRole
};
