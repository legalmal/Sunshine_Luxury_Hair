import { loadStoreSettings } from "./store-settings.js";

loadStoreSettings().then(settings => {
    const decemberExtra = settings.decemberExtra || {};
    if (decemberExtra.enabled && decemberExtra.image) {
        let imageUrl = "";
        try {
            const parsed = new URL(decemberExtra.image);
            if (parsed.protocol === "https:") imageUrl = parsed.href;
        } catch { /* Ignore invalid saved image links. */ }
        if (imageUrl) {
            const homeFeature = document.getElementById("decemberExtraHome");
            if (homeFeature) {
                document.getElementById("decemberExtraHomeTitle").textContent = decemberExtra.title || "A little Sunshine extra";
                document.getElementById("decemberExtraHomeMessage").textContent = decemberExtra.message || "Every order arrives beautifully packaged in our signature bag, at no extra cost.";
                const image = document.getElementById("decemberExtraHomeImage");
                image.src = imageUrl;
                homeFeature.hidden = false;
            } else {
                const banner = document.createElement("aside");
                banner.className = "december-extra-banner";
                banner.setAttribute("aria-label", "December complimentary extra");
                const image = document.createElement("img");
                image.src = imageUrl;
                image.alt = "Sunshine's Luxury Hair complimentary branded bag";
                image.loading = "lazy";
                const copy = document.createElement("div");
                const title = document.createElement("strong");
                title.textContent = decemberExtra.title || "A little Sunshine extra";
                const message = document.createElement("p");
                message.textContent = decemberExtra.message || "Every order arrives beautifully packaged in our signature bag, at no extra cost.";
                copy.append(title, message);
                banner.append(image, copy);
                document.querySelector("header.site-header")?.insertAdjacentElement("afterend", banner);
            }
        }
    }

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
