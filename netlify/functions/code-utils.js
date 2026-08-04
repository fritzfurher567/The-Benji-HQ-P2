function normalizeRoleKey(roleKey) {
  const normalizedRole = String(roleKey || "").trim().toUpperCase();
  if (normalizedRole === "W_MANAGER") return "W_MGMT";
  return normalizedRole;
}

function normalizeCode(code) {
  return String(code || "").trim().toUpperCase();
}

function getBootstrapOwnerCode() {
  return "W_TBHQ_NICHO";
}

function isBootstrapOwnerCode(code) {
  return normalizeCode(code) === getBootstrapOwnerCode();
}

function canRegisterWorker(roleKey, code) {
  const normalizedRole = normalizeRoleKey(roleKey);
  const normalizedCode = normalizeCode(code);

  if (normalizedRole === "W_OWNER") {
    return isBootstrapOwnerCode(normalizedCode);
  }

  return !isBootstrapOwnerCode(normalizedCode);
}

function validateCodeForRole(roleKey, code) {
  const normalizedCode = normalizeCode(code);
  const normalizedRole = normalizeRoleKey(roleKey);

  if (isBootstrapOwnerCode(normalizedCode)) {
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
  validateCodeForRole,
  getBootstrapOwnerCode,
  isBootstrapOwnerCode,
  canRegisterWorker
};
