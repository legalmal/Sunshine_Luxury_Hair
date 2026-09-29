const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");

initializeApp();

const db = getFirestore();
const smtpHost = defineSecret("SMTP_HOST");
const smtpPort = defineSecret("SMTP_PORT");
const smtpUser = defineSecret("SMTP_USER");
const smtpPassword = defineSecret("SMTP_PASSWORD");
const emailFrom = defineSecret("ORDER_EMAIL_FROM");

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatItems(items) {
    if (!Array.isArray(items) || items.length === 0) return "No item details were included.";
    return items.map(item => {
        const name = String(item?.name || "Product");
        const quantity = Math.max(1, Number(item?.quantity) || 1);
        const price = Number(item?.price) || 0;
        return `${name} × ${quantity} — ${price.toLocaleString("en-NG")}`;
    }).join("\n");
}

exports.emailAdminOnOrderCreated = onDocumentCreated({
    document: "orders/{orderId}",
    region: "us-central1",
    retry: true,
    secrets: [smtpHost, smtpPort, smtpUser, smtpPassword, emailFrom]
}, async event => {
    const order = event.data?.data();
    if (!order) return;

    const settingsSnapshot = await db.doc("settings/adminNotifications").get();
    const recipient = String(settingsSnapshot.get("orderNotificationEmail") || "").trim();
    if (!recipient) {
        logger.warn("Order notification skipped: configure an email in Admin > Settings.", {
            orderId: event.params.orderId
        });
        return;
    }

    const customer = order.customer || {};
    const orderId = event.params.orderId;
    const itemsText = formatItems(order.items);
    const total = (Number(order.total) || 0).toLocaleString("en-NG");
    const address = [customer.address, customer.city, customer.state].filter(Boolean).join(", ");
    const htmlItems = (Array.isArray(order.items) ? order.items : []).map(item => {
        const name = escapeHtml(item?.name || "Product");
        const quantity = Math.max(1, Number(item?.quantity) || 1);
        const price = (Number(item?.price) || 0).toLocaleString("en-NG");
        return `<li>${name} × ${quantity} — ${price}</li>`;
    }).join("");

    const port = Number(smtpPort.value()) || 587;
    const transporter = nodemailer.createTransport({
        host: smtpHost.value(),
        port,
        secure: port === 465,
        auth: { user: smtpUser.value(), pass: smtpPassword.value() }
    });

    await transporter.sendMail({
        from: emailFrom.value(),
        to: recipient,
        subject: `New order received — ${orderId}`,
        text: [
            `A new order has been placed.`,
            `Order: ${orderId}`,
            `Customer: ${customer.name || "Not provided"}`,
            `Phone: ${customer.phone || "Not provided"}`,
            `Email: ${customer.email || "Not provided"}`,
            `Delivery address: ${address || "Not provided"}`,
            "Items:", itemsText,
            `Total: ${total}`,
            `Status: ${order.status || "pending"}`
        ].join("\n"),
        html: `<div style="font-family:Arial,sans-serif;color:#222;line-height:1.6"><h2>New order received</h2><p><strong>Order:</strong> ${escapeHtml(orderId)}</p><p><strong>Customer:</strong> ${escapeHtml(customer.name || "Not provided")}<br><strong>Phone:</strong> ${escapeHtml(customer.phone || "Not provided")}<br><strong>Email:</strong> ${escapeHtml(customer.email || "Not provided")}<br><strong>Delivery address:</strong> ${escapeHtml(address || "Not provided")}</p><h3>Items</h3><ul>${htmlItems || "<li>No item details were included.</li>"}</ul><p><strong>Total:</strong> ${escapeHtml(total)}<br><strong>Status:</strong> ${escapeHtml(order.status || "pending")}</p></div>`
    });

    logger.info("Admin order notification sent.", { orderId });
});
