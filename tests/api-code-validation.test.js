const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCodeForRole, canRegisterWorker, getBootstrapOwnerCode } = require('../netlify/functions/code-utils');

test('accepts the owner code supplied for owner logins', () => {
  assert.equal(validateCodeForRole('W_OWNER', 'W_TBHQ_nicho'), true);
  assert.equal(validateCodeForRole('W_OWNER', 'w_tbhq_nicho'), true);
});

test('accepts the staff roster codes for their roles', () => {
  assert.equal(validateCodeForRole('W_MGMT', 'W_MGMT_01'), true);
  assert.equal(validateCodeForRole('W_SELL', 'W_SELL_20'), true);
  assert.equal(validateCodeForRole('W_CHEF', 'W_CHEF_12'), true);
  assert.equal(validateCodeForRole('W_FISH', 'W_FISH_05'), true);
  assert.equal(validateCodeForRole('W_GATH', 'W_GATH_10'), true);
  assert.equal(validateCodeForRole('W_FARM', 'W_FARM_15'), true);
});

test('accepts manager aliases so owner registration can use clearer manager codes', () => {
  assert.equal(validateCodeForRole('W_MGMT', 'W_MANAGER_01'), true);
  assert.equal(validateCodeForRole('W_MANAGER', 'W_MANAGER_01'), true);
  assert.equal(validateCodeForRole('W_MANAGER', 'W_MGMT_02'), true);
});

test('locks the bootstrap owner code so it can only be used for owner access', () => {
  assert.equal(getBootstrapOwnerCode(), 'W_TBHQ_NICHO');
  assert.equal(canRegisterWorker('W_OWNER', 'W_TBHQ_NICHO'), true);
  assert.equal(canRegisterWorker('W_OWNER', 'W_MGMT_01'), false);
  assert.equal(canRegisterWorker('W_MGMT', 'W_TBHQ_NICHO'), false);
});

test('rejects mismatched roles and invalid formats', () => {
  assert.equal(validateCodeForRole('W_MGMT', 'W_SELL_01'), false);
  assert.equal(validateCodeForRole('W_OWNER', 'W_MGMT_01'), false);
  assert.equal(validateCodeForRole('W_OWNER', 'BAD_CODE'), false);
});
