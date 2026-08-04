function normalizeDiscountCode(code) {
  return String(code || '').trim().toUpperCase();
}

function resolveDiscountForOrder({ code, baseTotal, tip, discount, allowPrivate = false }) {
  const normalizedCode = normalizeDiscountCode(code);
  const base = Number(baseTotal || 0);
  const tipAmount = Number(tip || 0);

  if (!discount || !normalizedCode) {
    return { applied: false, total: base + tipAmount, discountAmount: 0, code: normalizedCode };
  }

  const normalizedDiscountCode = normalizeDiscountCode(discount.code);
  const isMatchingCode = normalizedDiscountCode && normalizedDiscountCode === normalizedCode;
  const isPublic = Number(discount.isPublic || 0) === 1;
  const canUse = isMatchingCode && (isPublic || allowPrivate);

  if (!canUse) {
    return { applied: false, total: base + tipAmount, discountAmount: 0, code: normalizedCode };
  }

  const fakePrice = Number(discount.fakePrice || 0);
  const realPrice = Number(discount.realPrice || 0);
  const discountAmount = Math.max(0, fakePrice - realPrice);
  const discountedTotal = Math.max(0, realPrice) + tipAmount;

  return {
    applied: true,
    total: discountedTotal,
    discountAmount,
    code: normalizedCode,
    fakePrice,
    realPrice
  };
}

module.exports = {
  normalizeDiscountCode,
  resolveDiscountForOrder
};
