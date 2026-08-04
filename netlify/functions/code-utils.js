function validateCodeForRole(roleKey, code) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  const normalizedRole = String(roleKey || "").trim().toUpperCase();

  if (normalizedCode === "W_TBHQ_NICHO") {
    return normalizedRole === "W_OWNER";
  }

  const m = normalizedCode.match(/^W_(MGMT|SELL|CHEF|FISH|GATH|FARM)_(\d{2})$/);
  if (!m) return false;

  const num = parseInt(m[2], 10);
  if (num < 1 || num > 20) return false;
  return `W_${m[1]}` === normalizedRole;
}

module.exports = {
  validateCodeForRole
};
