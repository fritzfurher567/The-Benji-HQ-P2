const test = require('node:test');
const assert = require('node:assert/strict');

function loadApiHandler() {
  delete process.env.TURSO_DATABASE_URL;
  delete process.env.TURSO_AUTH_TOKEN;
  delete require.cache[require.resolve('../netlify/functions/api')];
  return require('../netlify/functions/api').handler;
}

test('owner login works without database config', async () => {
  const handler = loadApiHandler();
  const res = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({ action: 'validateWorkerCode', code: 'w_tbhq_nicho' })
  });

  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.deepEqual(body.worker, { username: 'Owner', roleKey: 'W_OWNER' });
});

test('registers workers in fallback mode', async () => {
  const handler = loadApiHandler();
  const registerRes = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({ action: 'registerWorker', username: 'Test', discordId: '123', roleKey: 'W_MGMT', code: 'W_MGMT_01' })
  });
  assert.equal(registerRes.statusCode, 200);

  const listRes = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({ action: 'listWorkers' })
  });
  assert.equal(listRes.statusCode, 200);
  const listBody = JSON.parse(listRes.body);
  assert.equal(listBody.workers.length, 1);
  assert.equal(listBody.workers[0].code, 'W_MGMT_01');
});
