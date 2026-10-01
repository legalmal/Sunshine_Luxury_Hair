import { loadStoreSettings } from "./store-settings.js";

loadStoreSettings().then(settings => {
    const whatsappNumber = String(settings.whatsappNumber || "").replace(/\D/g, "");

    if (whatsappNumber.length >= 8 && whatsappNumber.length <= 15) {
        document.querySelectorAll('a[href*="wa.me/"]').forEach((link) => {
            try {
                const target = new URL(link.href);
                target.pathname = `/${whatsappNumber}`;
                link.href = target.href;
            } catch {
                // Leave malformed or unrelated links as authored.
            }
        });
    }

    if (settings.storeName) {
        document.title = document.title.replace("Sunshine's Luxury Hair", settings.storeName);
        document.querySelectorAll(".site-footer img[alt*='Sunshine']").forEach((logo) => {
            logo.alt = settings.storeName;
        });

        document.querySelectorAll(".site-footer .footer-contact").forEach((contactBlock) => {
            if (settings.supportPhone && !contactBlock.querySelector("[data-store-support-phone]")) {
                const phone = document.createElement("a");
                phone.dataset.storeSupportPhone = "";
                phone.href = `tel:${settings.supportPhone.replace(/[^+\d]/g, "")}`;
                phone.textContent = settings.supportPhone;
                contactBlock.appendChild(phone);
            }
            if (settings.supportEmail && !contactBlock.querySelector("[data-store-support-email]")) {
                const email = document.createElement("a");
                email.dataset.storeSupportEmail = "";
                email.href = `mailto:${settings.supportEmail}`;
                email.textContent = settings.supportEmail;
                contactBlock.appendChild(email);
            }
        });
    }

    const deliveryNote = document.getElementById("storeDeliveryNote");
    if (deliveryNote && settings.deliveryNote) deliveryNote.textContent = settings.deliveryNote;
});
