import { db, doc, getDoc, setDoc, serverTimestamp } from "./firebase.js";
import { DEFAULT_STORE_SETTINGS } from "./store-settings.js";

const form = document.getElementById("settingsForm");
const status = document.getElementById("settingsStatus");
const saveButton = document.getElementById("settingsSave");
const settingsRef = doc(db, "settings", "storefront");

function setStatus(message, type = "") {
    status.textContent = message;
    status.className = `settings-status ${type}`.trim();
}

function populate(settings) {
    document.getElementById("settingStoreName").value = settings.storeName || "";
    document.getElementById("settingSupportEmail").value = settings.supportEmail || "";
    document.getElementById("settingSupportPhone").value = settings.supportPhone || "";
    document.getElementById("settingWhatsapp").value = settings.whatsappNumber || "";
    document.getElementById("settingCurrency").value = settings.currency === "XAF" ? "XAF" : "NGN";
    document.getElementById("settingStockThreshold").value = Number(settings.lowStockThreshold ?? 5);
    document.getElementById("settingDeliveryNote").value = settings.deliveryNote || "";
}

async function loadSettings() {
    try {
        const snapshot = await getDoc(settingsRef);
        populate(snapshot.exists() ? { ...DEFAULT_STORE_SETTINGS, ...snapshot.data() } : DEFAULT_STORE_SETTINGS);
    } catch (error) {
        console.error("Unable to load store settings:", error);
        populate(DEFAULT_STORE_SETTINGS);
        setStatus("Could not load saved settings. Check your connection and permissions before saving.", "error");
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const phone = document.getElementById("settingWhatsapp").value.replace(/\D/g, "");
    if (phone && (phone.length < 8 || phone.length > 15)) {
        setStatus("Enter a WhatsApp number with country code, using 8 to 15 digits.", "error");
        return;
    }

    const data = {
        storeName: document.getElementById("settingStoreName").value.trim(),
        supportEmail: document.getElementById("settingSupportEmail").value.trim(),
        supportPhone: document.getElementById("settingSupportPhone").value.trim(),
        whatsappNumber: phone,
        currency: document.getElementById("settingCurrency").value,
        lowStockThreshold: Number(document.getElementById("settingStockThreshold").value),
        deliveryNote: document.getElementById("settingDeliveryNote").value.trim(),
        updatedAt: serverTimestamp()
    };

    saveButton.disabled = true;
    saveButton.textContent = "Saving…";
    setStatus("Saving your store settings…");

    try {
        await setDoc(settingsRef, data, { merge: true });
        setStatus("Settings saved successfully.", "success");
    } catch (error) {
        console.error("Unable to save store settings:", error);
        setStatus("Settings could not be saved. Check your connection and Firestore permissions.", "error");
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Save settings";
    }
});

document.getElementById("settingsReset").addEventListener("click", () => {
    populate(DEFAULT_STORE_SETTINGS);
    setStatus("Default values restored. Save settings to apply them.");
});

loadSettings();
