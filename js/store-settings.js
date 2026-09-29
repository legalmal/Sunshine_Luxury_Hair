import { db, doc, getDoc } from "./firebase.js";

export const DEFAULT_STORE_SETTINGS = Object.freeze({
    storeName: "Sunshine's Luxury Hair",
    supportEmail: "",
    supportPhone: "",
    whatsappNumber: "237681880898",
    storeLocationAddress: "",
    currency: "NGN",
    lowStockThreshold: 5,
    deliveryNote: "Nationwide delivery available."
});

let settingsPromise;

export function loadStoreSettings() {
    if (!settingsPromise) {
        settingsPromise = getDoc(doc(db, "settings", "storefront"))
            .then(snapshot => snapshot.exists()
                ? { ...DEFAULT_STORE_SETTINGS, ...snapshot.data() }
                : { ...DEFAULT_STORE_SETTINGS })
            .catch(error => {
                console.warn("Store settings could not be loaded; using defaults.", error);
                return { ...DEFAULT_STORE_SETTINGS };
            });
    }
    return settingsPromise;
}

export function formatStorePrice(value, currency = "NGN") {
    const amount = Number(value) || 0;
    if (currency === "XAF") {
        return `${amount.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA`;
    }
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(amount);
}
