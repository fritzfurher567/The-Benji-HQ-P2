const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeDiscountCode, resolveDiscountForOrder } = require('./discount-utils');

test('normalizes code values before matching', () => {
  assert.equal(normalizeDiscountCode(' Benji10 '), 'BENJI10');
});

test('applies a public discount and adds tip back on top', () => {
  const result = resolveDiscountForOrder({
    code: 'BENJI10',
    baseTotal: 1000,
    tip: 50,
    discount: { code: 'BENJI10', isPublic: 1, fakePrice: 1000, realPrice: 800 }
  });

  assert.equal(result.applied, true);
  assert.equal(result.total, 850);
  assert.equal(result.discountAmount, 200);
});

test('rejects private codes unless they are explicitly marked usable', () => {
  const result = resolveDiscountForOrder({
    code: 'PRIVATE10',
    baseTotal: 1000,
    tip: 50,
    discount: { code: 'PRIVATE10', isPublic: 0, fakePrice: 1000, realPrice: 800 }
  });

  assert.equal(result.applied, false);
  assert.equal(result.total, 1050);
});
