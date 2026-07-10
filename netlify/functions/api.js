// =====================================================================
// BENJI HQ FRONTEND WEBHOOK ROUTING & LOGIC (NO NODE.JS REQUIRED)
// =====================================================================

// Your Webhooks
const MANAGEMENT_WEBHOOK_URL = "https://discord.com/api/webhooks/1519404043364073513/h8TVIzirZaZ2CEwBYin-SZJ5LhfWgiG7wXdkgTABkwrAu29IF-U_e6pa7OOsfFEDtgsY";
const SELLER_WEBHOOK_URL     = "https://discord.com/api/webhooks/1519403301374787666/CDzN1oODxyQA4zQeCidemB58d4bjVwtFU8XfCPZwW4zBlnuhjKmXSDt7oyZ7GYhBjdxJ";
// Add your private Owner channel webhook here for completed transfers
const OWNER_WEBHOOK_URL      = "https://discord.com/api/webhooks/1519403176930054329/t0hT6O936JluOaD476NiwyEzseafVFEPH8rUgxVE0wfPKAZAGLCM2aCDzin2TkOrRSpo";

/**
 * Universal dispatcher using the browser's native fetch API.
 */
async function sendDiscordAlert(webhookUrl, messagePayload) {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messagePayload)
        });
        if (response.ok) {
            console.log("Successfully sent to Discord!");
            return true;
        } else {
            console.error("Discord rejected the webhook.");
            return false;
        }
    } catch (error) {
        console.error("Critical Webhook Dispatch Failure:", error);
        return false;
    }
}

/**
 * Helper function to generate a random Ticket ID (e.g. TRN-8A2F)
 */
function generateTicketId() {
    return 'TRN-' + Math.random().toString(36).substr(2, 4).toUpperCase();
}

// =====================================================================
// RESOURCE TICKETS (FARMERS, FISHERS, GATHERERS)
// =====================================================================

async function handleFisherSubmission(workerCode, fishCount) {
    const totalPayout = fishCount * 200;
    const embedPayload = {
        embeds: [{
            title: "🐟 New Fishing Resource Ticket Created",
            color: 30455,
            fields: [
                { name: "Worker Instance Reference", value: `\`${workerCode}\``, inline: true },
                { name: "Total Caught Quantity", value: `${fishCount} Tuna Units`, inline: true },
                { name: "Calculated Gross Compensation Due", value: `£${totalPayout.toLocaleString()}`, inline: false }
            ],
            footer: { text: "Benji HQ Supply Network Automation Systems" },
            timestamp: new Date().toISOString()
        }]
    };
    return await sendDiscordAlert(MANAGEMENT_WEBHOOK_URL, embedPayload);
}

async function handleGathererSubmission(workerCode, saltCount) {
    const totalPayout = saltCount * 15;
    const embedPayload = {
        embeds: [{
            title: "🧂 New Gathering Resource Ticket Created",
            color: 10309086,
            fields: [
                { name: "Worker Instance Reference", value: `\`${workerCode}\``, inline: true },
                { name: "Total Harvested Quantity", value: `${saltCount} Salt Packs`, inline: true },
                { name: "Calculated Gross Compensation Due", value: `£${totalPayout.toLocaleString()}`, inline: false }
            ],
            footer: { text: "Benji HQ Supply Network Automation Systems" },
            timestamp: new Date().toISOString()
        }]
    };
    return await sendDiscordAlert(MANAGEMENT_WEBHOOK_URL, embedPayload);
}

async function handleFarmerSubmission(workerCode, cropType, cropCount) {
    const totalPayout = cropCount * 25;
    const embedPayload = {
        embeds: [{
            title: `🧑‍🌾 New Agricultural Ticket (${cropType})`,
            color: 2792847,
            fields: [
                { name: "Worker Instance Reference", value: `\`${workerCode}\``, inline: true },
                { name: "Total Yield Quantity", value: `${cropCount} Units`, inline: true },
                { name: "Calculated Gross Compensation Due", value: `£${totalPayout.toLocaleString()}`, inline: false }
            ],
            footer: { text: "Benji HQ Supply Network Automation Systems" },
            timestamp: new Date().toISOString()
        }]
    };
    return await sendDiscordAlert(MANAGEMENT_WEBHOOK_URL, embedPayload);
}

// =====================================================================
// SELLER / BUYER ENGINE LOGIC
// =====================================================================

function processClientInvoiceCalculation(benjiQuantity) {
    let pricePerBenji = 350;

    if (benjiQuantity >= 10 && benjiQuantity <= 19) pricePerBenji = 340;
    else if (benjiQuantity >= 20 && benjiQuantity <= 29) pricePerBenji = 330;
    else if (benjiQuantity >= 30 && benjiQuantity <= 39) pricePerBenji = 320;
    else if (benjiQuantity >= 40 && benjiQuantity <= 49) pricePerBenji = 310;
    else if (benjiQuantity >= 50) pricePerBenji = 300;

    let subtotal = benjiQuantity * pricePerBenji;
    let finalTotal = subtotal;

    if (benjiQuantity >= 55) {
        finalTotal = subtotal * 0.90;
    }

    return {
        unitRate: pricePerBenji,
        grossSubtotal: subtotal,
        netTotalInvoiceValue: finalTotal,
        hasBulkDiscountApplied: benjiQuantity >= 55
    };
}

async function handleSellerSubmission(clientUsername, benjiQuantity, orderCode) {
    const calculation = processClientInvoiceCalculation(benjiQuantity);

    const embedPayload = {
        content: "🚨 **NEW ACTIVE BUYER INCOMING** 🚨",
        embeds: [{
            title: "💼 Active Storefront Ticket Dispatched",
            color: 0x00ff00,
            fields: [
                { name: "Customer Username", value: `${clientUsername}`, inline: true },
                { name: "Quantity Demanded", value: `${benjiQuantity} Benjis`, inline: true },
                { name: "Order Code", value: `${orderCode}`, inline: true },
                { name: "Calculated Unit Value Rate", value: `£${calculation.unitRate} each`, inline: true },
                { name: "Final Invoice Ledger Total", value: `£${calculation.netTotalInvoiceValue.toLocaleString()}`, inline: true },
                { name: "Bulk Special Status", value: calculation.hasBulkDiscountApplied ? "✅ 10% Discount Applied" : "No discount", inline: false }
            ],
            footer: { text: "Benji HQ Sales Engine" },
            timestamp: new Date().toISOString()
        }]
    };

    return await sendDiscordAlert(SELLER_WEBHOOK_URL, embedPayload);
}

// =====================================================================
// LOGISTICS & TRANSFER MANAGER (STEP 1: MANAGER REQUESTS)
// =====================================================================

async function handleTransferTicket(managerName, origin, destination, itemsTransferred, customMessage, selectedWebhookUrl) {
    const ticketId = generateTicketId(); // Generates the code you will use in the Owner Panel

    const transferPayload = {
        content: "🔔 **PENDING OWNER ACTION: WAREHOUSE TRANSFER** 🔔",
        embeds: [{
            title: `📦 Transfer Request: ${ticketId}`,
            color: 16753920, // Orange/Yellow to indicate "Pending"
            description: `**Manager Note:**\n${customMessage}\n\n*Awaiting Owner approval and in-game loading.*`,
            fields: [
                { name: "Authorized By", value: managerName, inline: true },
                { name: "Item(s) in Transit", value: itemsTransferred, inline: true },
                { name: "Ticket ID", value: `**${ticketId}**`, inline: true },
                { name: "From (Origin)", value: origin, inline: true },
                { name: "To (Destination)", value: destination, inline: true }
            ],
            footer: { text: "Benji HQ Multi-Island Logistics System" },
            timestamp: new Date().toISOString()
        }]
    };

    return await sendDiscordAlert(selectedWebhookUrl, transferPayload);
}

// =====================================================================
// LOGISTICS & TRANSFER MANAGER (STEP 2: OWNER COMPLETION)
// =====================================================================

// You will link this to a button on your Owner Panel HTML
async function handleOwnerTransferComplete(ticketId, ownerNotes) {
    const completionPayload = {
        embeds: [{
            title: `✅ Transfer Complete: ${ticketId}`,
            color: 0x00ff00, // Green to indicate it's done
            description: `The owner has successfully loaded the warehouse and completed the deal in-game.\n\n**Owner Notes:**\n${ownerNotes || "No additional notes."}`,
            fields: [
                { name: "Status", value: "Fully Loaded & Completed", inline: true },
                { name: "Ticket ID", value: `**${ticketId}**`, inline: true }
            ],
            footer: { text: "Benji HQ Owner Terminal" },
            timestamp: new Date().toISOString()
        }]
    };

    // Sends the completion receipt to your private Owner channel
    return await sendDiscordAlert(OWNER_WEBHOOK_URL, completionPayload);
}

// Inside api.js
app.post('/purchase', async (req, res) => {
    const { userId, item, price } = req.body;
    // Here you would run your SQL to update the user's balance
    // Example: db.run("UPDATE platform_user_profiles SET pounds_balance = ...")
    res.json({ status: 'success', message: 'Item purchased!' });
});

import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function handler(event) {
    const method = event.httpMethod;

    // 1. GET Request (Used by your Seller Panel to load orders)
    if (method === 'GET') {
        try {
            const result = await db.execute("SELECT * FROM orders WHERE status != 'done'");
            return {
                statusCode: 200,
                body: JSON.stringify(result.rows)
            };
        } catch (error) {
            return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
        }
    }

    // 2. POST Request (Used by Storefront to add orders, or Panel to update status)
    if (method === 'POST') {
        const data = JSON.parse(event.body);

        if (data.action === 'createOrder') {
            await db.execute({
                sql: "INSERT INTO orders (id, customerDiscord, meetup, seller, status) VALUES (?, ?, 'TBD', 'Pending', 'active')",
                args: [data.orderId, data.customerDiscord, 'Pending']
            });
            return { statusCode: 200, body: "Order created" };
        }

        if (data.action === 'updateStatus') {
            await db.execute({
                sql: "UPDATE orders SET status = ? WHERE id = ?",
                args: [data.status, data.orderId]
            });
            return { statusCode: 200, body: "Status updated" };
        }
    }

    return { statusCode: 405, body: "Method Not Allowed" };
}