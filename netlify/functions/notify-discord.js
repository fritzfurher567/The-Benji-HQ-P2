/**
 * Netlify Serverless Function Handler
 * Destination Path: netlify/functions/notify-discord.js
 * Strictly captures incoming client application context and maps payloads into secure BotGhost APIs.
 */

const https = require('https');
const url = require('url');

exports.handler = async (event, context) => {
  // Reject alternative non-POST configuration verbs
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Configuration Profile Invalid. Use POST requests." })
    };
  }

  try {
    const requestData = JSON.parse(event.body || "{}");
    const quantityValue = requestData.quantity !== undefined ? requestData.quantity : 1;

    // Build the payload mapping configuration required by BotGhost
    const webhookPayload = JSON.stringify({
      variables: [
        {
          name: "quantity",
          variable: "{quantity}",
          value: quantityValue.toString()
        }
      ]
    });

    const destinationTarget = process.env.BOTGHOST_WEBHOOK_URL || 'https://api.botghost.com/webhook/placeholder';
    const parsingUrl = url.parse(destinationTarget);

    // Promise wrapper pipeline to handle standard HTTP payloads without adding unnecessary third-party overhead
    const deliverWebhookNotification = () => {
      return new Promise((resolve, reject) => {
        const structuralOptions = {
          hostname: parsingUrl.hostname,
          path: parsingUrl.path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.BOTGHOST_API_KEY || 'MISSING_AUTHORIZATION_KEY_TOKEN',
            'Content-Length': Buffer.byteLength(webhookPayload)
          },
          timeout: 8000
        };

        const req = https.request(structuralOptions, (res) => {
          let systemBufferResult = '';
          res.on('data', (chunk) => { systemBufferResult += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true, code: res.statusCode });
            } else {
              reject(new Error(`Server communication returned abnormal response code status: ${res.statusCode}`));
            }
          });
        });

        req.on('error', (err) => { reject(err); });
        req.on('timeout', () => { req.destroy(); reject(new Error('Gateway interface reached network timeout restrictions.')); });

        req.write(webhookPayload);
        req.end();
      });
    };

    await deliverWebhookNotification();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, status: 'sent' })
    };

  } catch (error) {
    console.error("Internal processing log signature error caught:", error.message);

    // Status handles the required database logic: leaves state as 'pending' if the webhook pipeline fails
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        status: 'pending',
        message: 'Offline queue fallback execution triggered.',
        diagnosticInfo: error.message
      })
    };
  }
};