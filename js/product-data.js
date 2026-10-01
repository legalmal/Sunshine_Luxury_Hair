import { db, collection, getDocs, doc, getDoc } from "./firebase.js";

const CACHE_KEY = "sunshinesProductsCache";
const CACHE_TTL_MS = 60 * 1000;
let productsRequest;

function readCache() {
    try {
        const entry = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (!entry || !Array.isArray(entry.products)) return null;
        return entry;
    } catch {
        return null;
    }
}

function saveCache(products) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            savedAt: Date.now(),
            products
        }));
    } catch (error) {
        console.warn("Product cache could not be saved.", error);
    }
}

function isFresh(entry) {
    return Boolean(entry && Date.now() - Number(entry.savedAt) < CACHE_TTL_MS);
}

export async function loadProducts() {
    const cached = readCache();
    if (isFresh(cached)) return cached.products;
    if (productsRequest) return productsRequest;

    productsRequest = getDocs(collection(db, "products"))
        .then(snapshot => {
            const products = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
            saveCache(products);
            return products;
        })
        .catch(error => {
            if (cached?.products?.length) {
                console.warn("Using cached products because the store could not be reached.", error);
                return cached.products;
            }
            throw error;
        })
        .finally(() => {
            productsRequest = null;
        });

    return productsRequest;
}

export async function loadProduct(productId) {
    if (!productId) return null;

    const cached = readCache();
    if (isFresh(cached)) {
        const product = cached.products.find(item => String(item.id) === String(productId));
        if (product) return product;
    }

    try {
        const snapshot = await getDoc(doc(db, "products", String(productId)));
        if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() };
    } catch (error) {
        const staleProduct = cached?.products?.find(item => String(item.id) === String(productId));
        if (staleProduct) {
            console.warn("Using cached product details because the store could not be reached.", error);
            return staleProduct;
        }
        throw error;
    }

    return cached?.products?.find(item => String(item.id) === String(productId)) || null;
}
