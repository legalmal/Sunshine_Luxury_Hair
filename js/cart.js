/* =========================================================
   SUNSHINE'S LUXURY HAIR
   CART JAVASCRIPT
   ========================================================= */

import { loadStoreSettings, formatStorePrice } from "./store-settings.js";

const STORE_SETTINGS = await loadStoreSettings();

const CART_KEY = "sunshinesCart";

const cartItemsContainer = document.getElementById("cartItems");
const cartLayout = document.getElementById("cartLayout");
const emptyCart = document.getElementById("emptyCart");

const cartCount = document.getElementById("cartCount");
const itemCount = document.getElementById("itemCount");

const summaryItems = document.getElementById("summaryItems");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTotal = document.getElementById("cartTotal");

const clearCartButton = document.getElementById("clearCartButton");
const checkoutButton = document.getElementById("checkoutButton");


/* =========================================================
   GET CART
   ========================================================= */

function getCart() {
    try {
        const savedCart = localStorage.getItem(CART_KEY);

        if (!savedCart) {
            return [];
        }

        const cart = JSON.parse(savedCart);

        return Array.isArray(cart) ? cart : [];

    } catch (error) {

        console.error("Unable to read cart:", error);

        return [];
    }
}


/* =========================================================
   SAVE CART
   ========================================================= */

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("sunshines-cart-updated"));
}


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatPrice(price) {

    return formatStorePrice(price, STORE_SETTINGS.currency);
}


/* =========================================================
   GET PRODUCT IMAGE
   ========================================================= */

function getProductImage(item) {

    return (
        item.mainImage ||
        item.image ||
        (Array.isArray(item.images) && item.images.length
            ? item.images[0]
            : "")
    );
}


/* =========================================================
   GET ITEM NAME
   ========================================================= */

function getItemName(item) {

    return item.name || "Luxury Hair";
}


/* =========================================================
   GET ITEM CATEGORY
   ========================================================= */

function getItemCategory(item) {

    return item.category || "Luxury Hair";
}


/* =========================================================
   GET QUANTITY
   ========================================================= */

function getQuantity(item) {

    const quantity = Number(item.quantity);

    if (!Number.isFinite(quantity) || quantity < 1) {
        return 1;
    }

    return Math.floor(quantity);
}


/* =========================================================
   CREATE UNIQUE CART ITEM KEY
   ========================================================= */

function getCartItemKey(item, index) {

    if (item.cartItemId) {
        return item.cartItemId;
    }

    if (item.id) {

        const options = item.options || item.selectedOptions || {};

        return `${item.id}-${JSON.stringify(options)}`;
    }

    return `cart-item-${index}`;
}


/* =========================================================
   GET SELECTED OPTIONS
   ========================================================= */

function getSelectedOptions(item) {

    const options =
        item.selectedOptions ||
        item.options ||
        {};

    if (Array.isArray(options)) {

        return options
            .map(option => {

                if (!option) {
                    return "";
                }

                if (typeof option === "string") {
                    return option;
                }

                if (option.name && option.value) {
                    return `${option.name}: ${option.value}`;
                }

                return "";
            })
            .filter(Boolean);
    }

    if (typeof options === "object") {

        return Object.entries(options)
            .map(([name, value]) => {

                if (
                    value === undefined ||
                    value === null ||
                    value === ""
                ) {
                    return "";
                }

                return `${name}: ${value}`;
            })
            .filter(Boolean);
    }

    return [];
}


/* =========================================================
   RENDER CART
   ========================================================= */

function renderCart() {

    const cart = getCart();

    /*
       Empty cart
    */

    if (cart.length === 0) {

        if (cartLayout) {
            cartLayout.hidden = true;
        }

        if (emptyCart) {
            emptyCart.hidden = false;
        }

        updateCartSummary([]);

        return;
    }


    /*
       Cart has products
    */

    if (cartLayout) {
        cartLayout.hidden = false;
    }

    if (emptyCart) {
        emptyCart.hidden = true;
    }


    if (!cartItemsContainer) {
        return;
    }


    cartItemsContainer.innerHTML = cart
        .map((item, index) => {

            const quantity = getQuantity(item);
            const price = Number(item.price) || 0;
            const total = price * quantity;

            const image = getProductImage(item);
            const name = getItemName(item);
            const category = getItemCategory(item);

            const itemKey = getCartItemKey(item, index);

            const options = getSelectedOptions(item);

            return `
                <article
                    class="cart-item"
                    data-cart-key="${escapeHTML(itemKey)}"
                >

                    <div class="cart-item-image">
                        ${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(name)}" loading="lazy">` : item.videoUrl ? `<video src="${escapeHTML(item.videoUrl)}" poster="${escapeHTML(item.poster || "")}" controls playsinline preload="metadata" aria-label="${escapeHTML(name)} video"></video>` : ""}
                    </div>


                    <div class="cart-item-info">

                        <p class="cart-item-category">
                            ${escapeHTML(category)}
                        </p>

                        <h3>
                            ${escapeHTML(name)}
                        </h3>

                        <p class="cart-item-price">
                            ${formatPrice(price)}
                        </p>

                        ${
                            options.length
                                ? `
                                    <div class="cart-item-options">
                                        ${options
                                            .map(option => `
                                                <span class="cart-item-option">
                                                    ${escapeHTML(option)}
                                                </span>
                                            `)
                                            .join("")}
                                    </div>
                                  `
                                : ""
                        }

                    </div>


                    <div class="cart-item-actions">

                        <strong class="cart-item-total">
                            ${formatPrice(total)}
                        </strong>


                        <div class="cart-quantity">

                            <button
                                type="button"
                                class="cart-quantity-minus"
                                data-cart-key="${escapeHTML(itemKey)}"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>


                            <input
                                type="number"
                                value="${quantity}"
                                min="1"
                                max="99"
                                class="cart-quantity-input"
                                data-cart-key="${escapeHTML(itemKey)}"
                                aria-label="Quantity"
                            >


                            <button
                                type="button"
                                class="cart-quantity-plus"
                                data-cart-key="${escapeHTML(itemKey)}"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>

                        </div>


                        <button
                            type="button"
                            class="remove-cart-item"
                            data-cart-key="${escapeHTML(itemKey)}"
                        >
                            Remove
                        </button>

                    </div>

                </article>
            `;

        })
        .join("");


    updateCartSummary(cart);
}


/* =========================================================
   UPDATE SUMMARY
   ========================================================= */

function updateCartSummary(cart) {

    let totalItems = 0;
    let subtotal = 0;


    cart.forEach(item => {

        const quantity = getQuantity(item);
        const price = Number(item.price) || 0;

        totalItems += quantity;
        subtotal += price * quantity;

    });


    if (cartCount) {
        cartCount.textContent = totalItems;
    }

    if (itemCount) {
        itemCount.textContent = totalItems;
    }

    if (summaryItems) {
        summaryItems.textContent = totalItems;
    }

    if (cartSubtotal) {
        cartSubtotal.textContent = formatPrice(subtotal);
    }

    if (cartTotal) {
        cartTotal.textContent = formatPrice(subtotal);
    }


    /*
       Disable checkout when cart is empty
    */

    if (checkoutButton) {

        if (totalItems === 0) {

            checkoutButton.style.pointerEvents = "none";
            checkoutButton.style.opacity = "0.5";

        } else {

            checkoutButton.style.pointerEvents = "";
            checkoutButton.style.opacity = "";

        }
    }
}


/* =========================================================
   UPDATE QUANTITY
   ========================================================= */

function updateQuantity(cartKey, newQuantity) {

    const cart = getCart();

    const index = cart.findIndex(
        (item, itemIndex) =>
            getCartItemKey(item, itemIndex) === cartKey
    );


    if (index === -1) {
        return;
    }


    let quantity = Number(newQuantity);

    if (!Number.isFinite(quantity)) {
        quantity = 1;
    }

    quantity = Math.floor(quantity);

    if (quantity < 1) {
        quantity = 1;
    }

    if (quantity > 99) {
        quantity = 99;
    }


    cart[index].quantity = quantity;

    saveCart(cart);

    renderCart();
}


/* =========================================================
   REMOVE ITEM
   ========================================================= */

function removeCartItem(cartKey) {

    const cart = getCart();

    const updatedCart = cart.filter(
        (item, index) =>
            getCartItemKey(item, index) !== cartKey
    );

    saveCart(updatedCart);

    renderCart();
}


/* =========================================================
   CLEAR CART
   ========================================================= */

function clearCart() {

    const cart = getCart();

    if (cart.length === 0) {
        return;
    }


    const confirmed = window.confirm(
        "Are you sure you want to clear your cart?"
    );

    if (!confirmed) {
        return;
    }


    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event("sunshines-cart-updated"));

    renderCart();
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   CART CLICK EVENTS
   ========================================================= */

if (cartItemsContainer) {

    cartItemsContainer.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest("button");

            if (!button) {
                return;
            }


            const cartKey =
                button.dataset.cartKey;

            if (!cartKey) {
                return;
            }


            /*
               Decrease
            */

            if (
                button.classList.contains(
                    "cart-quantity-minus"
                )
            ) {

                const cart = getCart();

                const index = cart.findIndex(
                    (item, itemIndex) =>
                        getCartItemKey(item, itemIndex) === cartKey
                );

                if (index === -1) {
                    return;
                }

                const currentQuantity =
                    getQuantity(cart[index]);

                updateQuantity(
                    cartKey,
                    currentQuantity - 1
                );

                return;
            }


            /*
               Increase
            */

            if (
                button.classList.contains(
                    "cart-quantity-plus"
                )
            ) {

                const cart = getCart();

                const index = cart.findIndex(
                    (item, itemIndex) =>
                        getCartItemKey(item, itemIndex) === cartKey
                );

                if (index === -1) {
                    return;
                }

                const currentQuantity =
                    getQuantity(cart[index]);

                updateQuantity(
                    cartKey,
                    currentQuantity + 1
                );

                return;
            }


            /*
               Remove
            */

            if (
                button.classList.contains(
                    "remove-cart-item"
                )
            ) {

                removeCartItem(cartKey);
            }

        }
    );
}


/* =========================================================
   QUANTITY INPUT
   ========================================================= */

if (cartItemsContainer) {

    cartItemsContainer.addEventListener(
        "change",
        event => {

            if (
                !event.target.classList.contains(
                    "cart-quantity-input"
                )
            ) {
                return;
            }


            const cartKey =
                event.target.dataset.cartKey;

            const quantity =
                event.target.value;


            if (!cartKey) {
                return;
            }


            updateQuantity(
                cartKey,
                quantity
            );

        }
    );
}


/* =========================================================
   CLEAR CART BUTTON
   ========================================================= */

if (clearCartButton) {

    clearCartButton.addEventListener(
        "click",
        clearCart
    );
}


/* =========================================================
   UPDATE WHEN PAGE BECOMES VISIBLE
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (!document.hidden) {
            renderCart();
        }

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderCart();

    }
);
