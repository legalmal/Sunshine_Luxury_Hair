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
const SETTINGS_CACHE_KEY = "sunshinesStoreSettingsCache";
const SETTINGS_CACHE_TTL_MS = 60 * 1000;

function readCachedSettings() {
    try {
        const cache = JSON.parse(localStorage.getItem(SETTINGS_CACHE_KEY) || "null");
        return cache?.settings && typeof cache.settings === "object" ? cache : null;
    } catch {
        return null;
    }
}

function cacheSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), settings }));
    } catch (error) {
        console.warn("Store settings cache could not be saved.", error);
    }
}

export function loadStoreSettings() {
    if (!settingsPromise) {
        const cached = readCachedSettings();
        const cacheIsFresh = cached && Date.now() - Number(cached.savedAt) < SETTINGS_CACHE_TTL_MS;

        if (cacheIsFresh) {
            settingsPromise = Promise.resolve({ ...DEFAULT_STORE_SETTINGS, ...cached.settings });
        } else {
            settingsPromise = import("./firebase.js")
                .then(({ db, doc, getDoc }) => getDoc(doc(db, "settings", "storefront")))
                .then(snapshot => {
                    const settings = snapshot.exists()
                        ? { ...DEFAULT_STORE_SETTINGS, ...snapshot.data() }
                        : { ...DEFAULT_STORE_SETTINGS };
                    cacheSettings(settings);
                    return settings;
                })
                .catch(error => {
                    console.warn("Store settings could not be loaded; using cached settings or defaults.", error);
                    return cached
                        ? { ...DEFAULT_STORE_SETTINGS, ...cached.settings }
                        : { ...DEFAULT_STORE_SETTINGS };
                });
        }
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

export function formatProductPrice(value, compareAtPrice, currency = "NGN") {
    const current = formatStorePrice(value, currency);
    const compare = Number(compareAtPrice);
    return `<span class="price-current">${current}</span>${Number.isFinite(compare) && compare > Number(value) ? ` <del class="price-compare">${formatStorePrice(compare, currency)}</del>` : ""}`;
}
