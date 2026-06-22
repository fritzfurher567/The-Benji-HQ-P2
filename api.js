// =====================================================================
// BENJI HQ BACKEND WEB COMPONENT CONNECTIONS & WEBHOOK ROUTING LOGIC
// =====================================================================

// PASTE YOUR DISCORD WEBHOOK SECRETS HERE
const MANAGEMENT_WEBHOOK_URL = "https://discord.com/api/webhooks/1518750569509158976/qrPxgKYr4Cw95rrAgVKnICrbVo6CcTop5UJhKT6el1FWCoBGXsUTibPsXJyKkYn3npn7";
const SELLER_WEBHOOK_URL     = "https://discord.com/api/webhooks/1518747199293358170/98WSV1uVc6ePnPL60r3KQjLLObEV6hxHR0YMiNiX3sDCfbhuc02tgLtSDtFeYWHH0qU6";

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
 * Fires directly when a fisher submits a tuna count on the web panel.
 */
async function handleFisherSubmission(workerCode, fishCount) {
    const totalPayout = fishCount * 200;

    const embedPayload = {
        embeds: [{
            title: "🐟 New Fishing Resource Ticket Created",
            color: 30455, // Blue
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
 * Fires directly when a gatherer logs salt returns.
 */
async function handleGathererSubmission(workerCode, saltCount) {
    const totalPayout = saltCount * 15;

    const embedPayload = {
        embeds: [{
            title: "🧂 New Gathering Resource Ticket Created",
            color: 10309086, // Purple
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
 * Fires when a farmer logs bean or pepper outputs.
 * Math Logic: Balanced explicitly at £5,000 per 200 items (£25/unit).
 */
async function handleFarmerSubmission(workerCode, cropType, cropCount) {
    const totalPayout = cropCount * 25; // Updated from 50 to 25

    const embedPayload = {
        embeds: [{
            title: `🧑‍🌾 New Agricultural Ticket (${cropType})`,
            color: 2792847, // Green
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
 * Matches pricing tiers perfectly and enforces the 55+ bulk order 10% discount check.
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
        finalTotal = subtotal * 0.90; // Enforces the 10% discount rule
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
 * Notifies the sales team when an active buyer order is dispatched via web interface.
 */
async function handleCustomerOrderNotification(clientUsername, benjiQuantity) {
    const calculation = processClientInvoiceCalculation(benjiQuantity);

    const embedPayload = {
        content: "🚨 **NEW ACTIVE BUYER INCOMING** 🚨",
        embeds: [{
            title: "💼 Active Storefront Ticket Dispatched",
            color: 15167313, // Coral Orange
            fields: [
                { name: "Customer Username", value: `\`${clientUsername}\``, inline: true },
                { name: "Quantity Demanded", value: `${benjiQuantity} Benjis`, inline: true },
                { name: "Calculated Unit Value Rate", value: `£${calculation.unitRate} each`, inline: true },
                { name: "Final Invoice Ledger Total", value: `£${calculation.netTotalInvoiceValue.toLocaleString()}`, inline: false },
                { name: "Bulk Special Status (55+ Order)", value: calculation.hasBulkDiscountApplied ? "✅ 10% Total Discount Checked & Deducted" : "❌ Regular Scale Rates Applied", inline: false }
            ],
            footer: { text: "Benji HQ Sales Office Interface Manager" },
            timestamp: new Date().toISOString()
        }]
    };

    return await sendDiscordAlert(SELLER_WEBHOOK_URL, embedPayload);
}