const ORANGE = 0xf97316;

function getTransferWebhookSettingKeyForRole(role) {
  if (!role) return 'transfer_webhook_url';
  const normalized = String(role).toLowerCase();
  if (normalized.includes('gather')) return 'gatherer_transfer_webhook_url';
  if (normalized.includes('fish')) return 'fisher_transfer_webhook_url';
  if (normalized.includes('chef')) return 'chef_transfer_webhook_url';
  if (normalized.includes('manager')) return 'manager_transfer_webhook_url';
  if (normalized.includes('farm')) return 'farmer_transfer_webhook_url';
  return 'transfer_webhook_url';
}

function buildOrderWebhookPayload({ customerDiscord, qty, tip, total, paymentMethod, orderId }) {
  return {
    embeds: [{
      title: `🛒 Benji Order ${orderId ? `(${orderId})` : ''}`.trim(),
      description: 'A fresh Benji order has just landed.',
      color: ORANGE,
      thumbnail: { url: 'https://cdn-icons-png.flaticon.com/512/857/857681.png' },
      fields: [
        { name: 'Customer', value: String(customerDiscord || 'Unknown'), inline: true },
        { name: 'Benjis', value: `${Number(qty || 0)}x`, inline: true },
        { name: 'Tip', value: `${Number(tip || 0).toLocaleString()}p`, inline: true },
        { name: 'Method', value: String(paymentMethod || '-'), inline: true },
        { name: 'Total', value: `${Number(total || 0).toLocaleString()}p`, inline: true }
      ],
      timestamp: new Date().toISOString()
    }]
  };
}

function buildPoundsWebhookPayload({ customerDiscord, amount }) {
  return {
    embeds: [{
      title: '💳 Pounds Added',
      description: `A pending pounds load request for ${Number(amount || 0).toLocaleString()}p has been submitted.`,
      color: ORANGE,
      fields: [
        { name: 'Username', value: String(customerDiscord || 'Unknown'), inline: true },
        { name: 'Amount', value: `${Number(amount || 0).toLocaleString()}p`, inline: true },
        { name: 'Status', value: 'Pending Review', inline: true }
      ],
      timestamp: new Date().toISOString()
    }]
  };
}

function buildTransferWebhookPayload({ requesterUsername, requesterRole, item, amount, totalPrice, fromLocation, toLocation, notes }) {
  return {
    embeds: [{
      title: `🔁 ${requesterRole || 'Transfer'} Ticket`,
      description: `A ${String(requesterRole || 'worker').toLowerCase()} transfer request has been created.`,
      color: ORANGE,
      fields: [
        { name: 'Username', value: String(requesterUsername || 'Unknown'), inline: true },
        { name: 'Role', value: String(requesterRole || 'Unknown'), inline: true },
        { name: 'Item', value: String(item || '-'), inline: true },
        { name: 'Amount', value: String(amount || '-'), inline: true },
        { name: 'Pay', value: totalPrice != null ? `${Number(totalPrice).toLocaleString()}p` : '-', inline: true },
        { name: 'From', value: String(fromLocation || '-'), inline: true },
        { name: 'To', value: String(toLocation || '-'), inline: true },
        { name: 'Notes', value: String(notes || 'No notes provided.'), inline: false }
      ],
      timestamp: new Date().toISOString()
    }]
  };
}

module.exports = {
  ORANGE,
  getTransferWebhookSettingKeyForRole,
  buildOrderWebhookPayload,
  buildPoundsWebhookPayload,
  buildTransferWebhookPayload
};
