const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// If you are using an older version of Node.js that doesn't have fetch built-in,
// you will need to uncomment the line below and run 'npm install node-fetch'
// const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// =====================================================================
// BENJI HQ BACKEND WEB COMPONENT CONNECTIONS & WEBHOOK ROUTING LOGIC
// =====================================================================

const MANAGEMENT_WEBHOOK_URL = "https://discord.com/api/webhooks/1518750569509158976/qrPxgKYr4Cw95rrAgVKnICrbVo6CcTop5UJhKT6el1FWCoBGXsUTibPsXJyKkYn3npn7";
const SELLER_WEBHOOK_URL     = "https://discord.com/api/webhooks/1518747199293358170/98WSV1uVc6ePnPL60r3KQjLLObEV6hxHR0YMiNiX3sDCfbhuc02tgLtSDtFeYWHH0qU6";

const BACKUP_FILE = path.join(__dirname, 'ticket_backup.txt');
const SALES_LOG_FILE = path.join(__dirname, 'sales_log.txt');

/**
 * Common dispatch handler to pass data streams to Discord instantly,
 * bypassing any offline bot dependencies.
 */
async function sendDiscordAlert(webhookUrl, messagePayload) {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messagePayload)
        });
        return response.ok;
    } catch (error) {
        console.error("Critical Webhook Dispatch Failure:", error);
        return false;
    }
}

/**
 * 🐟 CODES: W_FISH_01 to W_FISH_20
 */
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

/**
 * 🧂 CODES: W_GATH_01 to W_GATH_20
 */
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

/**
 * 🧑‍🌾 CODES: W_FARM_01 to W_FARM_20
 */
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

/**
 * 💼 BUYER ENGINE INVOICE CALCULATOR
 */
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

/**
 * 🚨 SELLER ALERT ROUTER
 */
const embedPayload = {
        content: "🚨 **NEW ACTIVE BUYER INCOMING** 🚨",
        embeds: [{
            title: "💼 Active Storefront Ticket Dispatched",
            color: 15167313,
            fields: [
                { name: "Customer Username", value: `${clientUsername}`, inline: true },
                { name: "Quantity Demanded", value: `${benjiQuantity} Benjis`, inline: true },
                { name: "Calculated Unit Value Rate", value: `£${calculation.unitRate} each`, inline: true },
                { name: "Final Invoice Ledger Total", value: `£${calculation.netTotalInvoiceValue.toLocaleString()}`, inline: false },
                { name: "Bulk Special Status", value: calculation.hasBulkDiscountApplied ? "✅ 10% Total Discount Checked & Deducted" : "No discount" }
            ]
        }]
    };

// This is the part of your code that builds the Discord message
const embedPayload = {
    embeds: [{
        title: "New Active Buyer Incoming",
        color: 0x00ff00, // Green color for a successful order
        fields: [
            { name: "Customer Name", value: clientUsername, inline: true },
            { name: "Order Amount", value: calculation.toString(), inline: true },
            { name: "Order Code", value: orderCode, inline: true } // This sends your code
        ],
        timestamp: new Date()
    }]
};