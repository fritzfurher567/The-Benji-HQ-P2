const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCodeForRole } = require('../netlify/functions/code-utils');

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

test('rejects mismatched roles and invalid formats', () => {
  assert.equal(validateCodeForRole('W_MGMT', 'W_SELL_01'), false);
  assert.equal(validateCodeForRole('W_OWNER', 'W_MGMT_01'), false);
  assert.equal(validateCodeForRole('W_OWNER', 'BAD_CODE'), false);
});
