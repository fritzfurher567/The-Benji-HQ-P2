/**
 * Netlify Serverless Function Handler
 * Destination Path: netlify/functions/notify-discord.js
 *
 * AUTOMATED MULTI-TOOL:
 * Automatically formats incoming POST requests into Discord Webhook Embeds.
 * Fully supports Orders, Transfer Tickets, and Logistics without code changes.
 */

const https = require('https');
const url = require('url');

exports.handler = async (event, context) => {
  // 1. Reject anything that isn't a POST request
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Invalid. Use POST requests." })
    };
  }

  try {
    // 2. Parse the data sent from your frontend
    const requestData = JSON.parse(event.body || "{}");

    // 3. Determine the type of ticket to customize the Embed Title and Color
    // It looks for a "type" or "actionType" from your fetch request
    const actionType = requestData.actionType || requestData.type || "Ticket";
    const isTransfer = actionType.toLowerCase().includes("transfer");
    const isLogistics = actionType.toLowerCase().includes("logistics");

    let embedTitle = "💼 New " + actionType;
    let embedColor = 0xff6a00; // Baseline Orange

    if (isTransfer) {
        embedTitle = "🔄 Transfer Ticket Processed";
        embedColor = 0x3498db; // Blue for Transfers
    } else if (isLogistics) {
        embedTitle = "📦 Logistics Submission";
        embedColor = 0x9b59b6; // Purple for Logistics
    } else if (requestData.orderCode || requestData.quantity) {
        embedTitle = "🛒 New Order Receipt";
        embedColor = 0x2ecc71; // Green for Orders
    }

    // 4. Dynamically build the Discord fields based on exactly what the frontend sends
    // This guarantees your Transfer features and Logistics inputs work immediately.
    const embedFields = [];
    const ignoreKeys = ['actionType', 'type'];

    for (const [key, value] of Object.entries(requestData)) {
      if (!ignoreKeys.includes(key) && value !== "" && value !== null) {
        // Turn camelCase keys into Clean Titles (e.g., "orderCode" -> "Order Code")
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        embedFields.push({
          name: formattedKey,
          value: String(value),
          inline: true
        });
      }
    }

    // Fallback if an empty ticket is sent
    if (embedFields.length === 0) {
      embedFields.push({ name: "System Message", value: "Ticket triggered with no readable data.", inline: false });
    }

    // 5. Construct the final Discord Native Payload
    const webhookPayload = JSON.stringify({
      embeds: [{
        title: embedTitle,
        color: embedColor,
        fields: embedFields,
        timestamp: new Date().toISOString(),
        footer: { text: "Benji HQ Automated System" }
      }]
    });

    // 6. Securely pull the Webhook URL from Netlify Environment Variables
    const destinationTarget = process.env.DISCORD_WEBHOOK_URL;

    if (!destinationTarget) {
        throw new Error("DISCORD_WEBHOOK_URL environment variable is missing in Netlify.");
    }

    const parsingUrl = url.parse(destinationTarget);

    // 7. Deliver the Webhook to Discord directly
    const deliverWebhookNotification = () => {
      return new Promise((resolve, reject) => {
        const structuralOptions = {
          hostname: parsingUrl.hostname,
          path: parsingUrl.path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
              reject(new Error(`Discord API returned abnormal response code: ${res.statusCode} - ${systemBufferResult}`));
            }
          });
        });

        req.on('error', (err) => { reject(err); });
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Gateway interface reached network timeout restrictions.'));
        });

        req.write(webhookPayload);
        req.end();
      });
    };

    await deliverWebhookNotification();

    // 8. Return success to the frontend
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ success: true, status: 'sent' })
    };

  } catch (error) {
    console.error("Internal processing error caught:", error.message);

    // 9. Fail safely and leave the database state 'pending'
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: false,
        status: 'pending',
        message: 'Offline queue fallback execution triggered.',
        diagnosticInfo: error.message
      })
    };
  }
};

async function sendToDiscord(data) {
    try {
        const response = await fetch('/.netlify/functions/notify-discord', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            console.log("Ticket successfully dispatched to Discord.");
        }
    } catch (error) {
        console.error("Transmission failed:", error);
    }
}