const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ORANGE,
  getTransferWebhookSettingKeyForRole,
  buildOrderWebhookPayload,
  buildPoundsWebhookPayload,
  buildTransferWebhookPayload
} = require('../netlify/functions/webhook-utils');

test('routes worker tickets to the matching webhook key', () => {
  assert.equal(getTransferWebhookSettingKeyForRole('Gatherer'), 'gatherer_transfer_webhook_url');
  assert.equal(getTransferWebhookSettingKeyForRole('Fisher'), 'fisher_transfer_webhook_url');
  assert.equal(getTransferWebhookSettingKeyForRole('Chef'), 'chef_transfer_webhook_url');
  assert.equal(getTransferWebhookSettingKeyForRole('Manager'), 'manager_transfer_webhook_url');
  assert.equal(getTransferWebhookSettingKeyForRole('Unknown'), 'transfer_webhook_url');
});

test('builds an orange order embed with the right fields', () => {
  const payload = buildOrderWebhookPayload({ customerDiscord: 'Mina', qty: 3, tip: 50, total: 1200, paymentMethod: 'Cash/Pounds' });
  assert.equal(payload.embeds[0].color, ORANGE);
  assert.equal(payload.embeds[0].fields[0].name, 'Customer');
  assert.equal(payload.embeds[0].fields[1].name, 'Benjis');
  assert.equal(payload.embeds[0].fields[2].name, 'Tip');
});

test('builds a pounds request embed using the requested amount', () => {
  const payload = buildPoundsWebhookPayload({ customerDiscord: 'Mina', amount: 250 });
  assert.equal(payload.embeds[0].color, ORANGE);
  assert.equal(payload.embeds[0].fields[0].name, 'Username');
  assert.equal(payload.embeds[0].fields[1].name, 'Amount');
  assert.match(payload.embeds[0].description, /250/);
});

test('builds a modern transfer embed with route and payout fields', () => {
  const payload = buildTransferWebhookPayload({ requesterUsername: 'Mina', requesterRole: 'Fisher', item: 'Tuna', amount: 8, totalPrice: 2400, fromLocation: 'Dock', toLocation: 'Manager', notes: 'Fresh catch' });
  assert.equal(payload.embeds[0].color, ORANGE);
  assert.equal(payload.embeds[0].fields[0].name, 'Username');
  assert.equal(payload.embeds[0].fields[3].name, 'Amount');
  assert.equal(payload.embeds[0].fields[4].name, 'Pay');
  assert.equal(payload.embeds[0].fields[5].name, 'From');
});
