const VISITOR_KEY = "sunshine-favorite-visitor-id";
const FAVORITES_KEY = "sunshine-product-favorites";

function makeId() {
    return globalThis.crypto?.randomUUID?.() ||
        `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readFavorites() {
    try {
        const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "{}");
        return value && typeof value === "object" ? value : {};
    } catch {
        return {};
    }
}

function getVisitorId() {
    try {
        let id = localStorage.getItem(VISITOR_KEY);
        if (!id) {
            id = makeId();
            localStorage.setItem(VISITOR_KEY, id);
        }
        return id;
    } catch {
        return makeId();
    }
}

const visitorId = getVisitorId();
let favorites = readFavorites();

function productIdFor(container) {
    return container.dataset.productId ||
        container.closest("[data-product-id]")?.dataset.productId ||
        container.querySelector("video[data-product-id]")?.dataset.productId ||
        "";
}

function syncButton(button, productId) {
    const active = Boolean(favorites[productId]);
    button.classList.toggle("is-favorite", active);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", active ? "Remove from favorites" : "Add to favorites");
    button.title = active ? "Remove from favorites" : "Add to favorites";
    button.innerHTML = `<span aria-hidden="true">${active ? "♥" : "♡"}</span>`;
}

function addFavoriteButtons(root = document) {
    const selector = ".home-product-image, .product-image-container, .product-main-media, .product-video-stage, .cart-item-image, .checkout-item-image";
    const containers = [];
    if (root.matches?.(selector)) containers.push(root);
    containers.push(...(root.querySelectorAll?.(selector) || []));
    containers.forEach(container => {
        const productId = productIdFor(container);
        if (!productId) return;

        const existingButton = container.querySelector(":scope > .product-favorite-toggle");
        if (existingButton) {
            existingButton.dataset.productId = productId;
            syncButton(existingButton, productId);
            return;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "product-favorite-toggle";
        button.dataset.productId = productId;
        syncButton(button, productId);
        container.append(button);
    });
}

document.addEventListener("click", async event => {
    const button = event.target.closest?.(".product-favorite-toggle");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const productId = button.dataset.productId;
    if (!productId) return;

    const nextValue = !Boolean(favorites[productId]);
    favorites = { ...favorites, [productId]: nextValue };
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch { /* Keep the current page interaction working if storage is unavailable. */ }
    syncButton(button, productId);
    button.disabled = true;

    try {
        const { db, doc, serverTimestamp, setDoc } = await import("./firebase.js");
        const favoriteId = `${productId}_${visitorId}`;
        await setDoc(doc(db, "favorites", favoriteId), {
            productId,
            visitorId,
            liked: nextValue,
            updatedAt: serverTimestamp()
        });
        button.classList.remove("favorite-save-error");
    } catch (error) {
        console.error("Unable to save product favorite:", error);
        favorites = { ...favorites, [productId]: !nextValue };
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        } catch { /* Ignore storage failures. */ }
        syncButton(button, productId);
        button.classList.add("favorite-save-error");
        button.title = "Could not save favorite. Please try again.";
        window.showToast?.("We couldn't save your favorite. Please try again.", "error");
    } finally {
        button.disabled = false;
    }
}, true);

window.addEventListener("storage", event => {
    if (event.key !== FAVORITES_KEY) return;
    favorites = readFavorites();
    addFavoriteButtons();
    document.querySelectorAll(".product-favorite-toggle").forEach(button => {
        syncButton(button, button.dataset.productId);
    });
});

addFavoriteButtons();
new MutationObserver(records => {
    for (const record of records) {
        if (record.type === "attributes") {
            addFavoriteButtons(record.target);
            continue;
        }
        record.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                addFavoriteButtons(node.closest?.(".product-video-stage") || node);
            }
        });
    }
}).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-product-id"]
});
