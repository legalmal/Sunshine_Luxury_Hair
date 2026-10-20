/* =========================================================
   SUNSHINE'S LUXURY HAIR
   CHECKOUT
   ========================================================= */

import { DEFAULT_STORE_SETTINGS, loadStoreSettings, formatStorePrice, formatProductPrice } from "./store-settings.js";
import { loadProducts } from "./product-data.js";

let STORE_SETTINGS = DEFAULT_STORE_SETTINGS;
let CHECKOUT_PRODUCTS = [];


/* =========================================================
   SETTINGS
========================================================= */

let WHATSAPP_NUMBER = STORE_SETTINGS.whatsappNumber || "237681880898";

const CART_KEY = "sunshinesCart";
const DIRECT_CHECKOUT_KEY = "sunshinesDirectCheckout";
const isDirectCheckout = new URLSearchParams(window.location.search).get("direct") === "1";


/* =========================================================
   ELEMENTS
========================================================= */

const checkoutForm =
    document.getElementById("checkoutForm");

const checkoutItems =
    document.getElementById("checkoutItems");

const checkoutItemCount =
    document.getElementById("checkoutItemCount");

const checkoutSubtotal =
    document.getElementById("checkoutSubtotal");

const checkoutDelivery =
    document.getElementById("checkoutDelivery");

const checkoutTotal =
    document.getElementById("checkoutTotal");

const checkoutEmpty =
    document.getElementById("checkoutEmpty");

const checkoutLayout =
    document.querySelector(".checkout-layout");

const placeOrderButton =
    document.getElementById("placeOrderButton");

const cartCount =
    document.getElementById("cartCount");

loadStoreSettings().then(async settings => {
    STORE_SETTINGS = settings;
    WHATSAPP_NUMBER = settings.whatsappNumber || "237681880898";
    CHECKOUT_PRODUCTS = await loadProducts().catch(error => {
        console.warn("Product options could not be loaded for checkout.", error);
        return [];
    });
    const cart = getCart();
    updateCartCount(cart);
    renderCheckoutItems(cart);
});


/* =========================================================
   CART
========================================================= */

function readStoredItems(storage, key) {
    try {
        const cart = JSON.parse(storage.getItem(key) || "[]");

        return Array.isArray(cart) ? cart : [];

    } catch (error) {

        console.error(
            "Unable to read saved order items:",
            error
        );

        return [];
    }
}

function getSavedCart() {
    return readStoredItems(localStorage, CART_KEY);
}

function getCart() {
    return isDirectCheckout
        ? readStoredItems(sessionStorage, DIRECT_CHECKOUT_KEY)
        : getSavedCart();
}

function saveCart(cart) {
    const storage = isDirectCheckout ? sessionStorage : localStorage;
    const key = isDirectCheckout ? DIRECT_CHECKOUT_KEY : CART_KEY;
    storage.setItem(key, JSON.stringify(cart));
}

function getOptionMap(item) {
    const options = item.selectedOptions || item.options || {};
    if (Array.isArray(options)) {
        return Object.fromEntries(options.map(option => {
            if (typeof option === "string") {
                const divider = option.indexOf(":");
                return divider < 0 ? [option, ""] : [option.slice(0, divider).trim(), option.slice(divider + 1).trim()];
            }
            return [option?.name || option?.label || "", option?.value || ""];
        }).filter(([name]) => name));
    }
    return options && typeof options === "object" ? { ...options } : {};
}

function getAvailableCheckoutOptions(item) {
    const product = CHECKOUT_PRODUCTS.find(entry => String(entry.id) === String(item.id || item.productId));
    if (!product) return [];

    const groups = [];
    const options = Array.isArray(product.options)
        ? product.options
        : Object.entries(product.options || {}).map(([name, values]) => ({ name, values }));
    options.forEach(option => {
        const name = String(option.name || option.label || "");
        if (!/length|inch/i.test(name) || !Array.isArray(option.values) || !option.values.length) return;
        groups.push({ name: "Length", sourceName: name, values: option.values });
    });

    const colorOption = options.find(option => /colou?r/i.test(String(option.name || option.label || "")) && Array.isArray(option.values));
    const colors = Array.isArray(product.colors) && product.colors.length
        ? product.colors
        : colorOption?.values;
    if (Array.isArray(colors) && colors.length) {
        groups.unshift({ name: "Color", sourceName: colorOption?.name || "Color", values: colors });
    }
    return groups;
}

checkoutItems?.addEventListener("change", event => {
    const select = event.target.closest("select[data-checkout-option]");
    if (!select) return;
    const cart = getCart();
    const index = Number(select.dataset.cartIndex);
    const item = cart[index];
    if (!item) return;
    const options = getOptionMap(item);
    options[select.dataset.checkoutOption] = select.value;
    item.options = options;
    delete item.selectedOptions;
    saveCart(cart);
});


/* =========================================================
   SAVE CART
========================================================= */

function clearCart() {
    if (isDirectCheckout) {
        sessionStorage.removeItem(DIRECT_CHECKOUT_KEY);
    } else {
        localStorage.removeItem(CART_KEY);
    }
    window.dispatchEvent(new Event("sunshines-cart-updated"));
}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(price) {
    return formatStorePrice(price, STORE_SETTINGS.currency);
}


/* =========================================================
   GET IMAGE
========================================================= */

function getProductImage(item) {

    return (
        item.mainImage ||
        item.image ||
        (Array.isArray(item.images)
            ? item.images[0]
            : "")
    );

}


/* =========================================================
   GET NAME
========================================================= */

function getProductName(item) {

    return (
        item.name ||
        item.productName ||
        "Product"
    );

}


/* =========================================================
   GET QUANTITY
========================================================= */

function getQuantity(item) {

    const quantity =
        Number(item.quantity);

    return quantity > 0
        ? quantity
        : 1;

}


/* =========================================================
   GET OPTIONS
========================================================= */

function getSelectedOptions(item) {

    const options = item.selectedOptions || item.options;

    if (!options) {
        return [];
    }


    if (Array.isArray(options)) {

        return options.map(option => {

            if (
                typeof option === "object" &&
                option !== null
            ) {

                const name =
                    option.name ||
                    option.label ||
                    "";

                return formatCheckoutOption(name, option.value || "");
            }

            const text = String(option);
            const separator = text.indexOf(":");
            return separator < 0
                ? text
                : formatCheckoutOption(text.slice(0, separator), text.slice(separator + 1));

        }).filter(Boolean);
    }


    if (typeof options === "object") {

        return Object.entries(options)
            .filter(([, value]) => value !== undefined && value !== null && String(value).trim())
            .map(([name, value]) => formatCheckoutOption(name, value));
    }


    return [];
}

function formatCheckoutOption(name, value) {
    const label = String(name || "Option").trim();
    let selectedValue = String(value ?? "").trim();
    if (!selectedValue) return "";

    if (/length|inch/i.test(label) && !/(?:\b(?:inches|inch|in)\b|["″])/i.test(selectedValue)) {
        selectedValue = `${selectedValue} inches`;
    }

    return `${label}: ${selectedValue}`;
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
   UPDATE CART COUNT
========================================================= */

function updateCartCount(cart) {

    if (!cartCount) {
        return;
    }

    const badgeItems = isDirectCheckout ? getSavedCart() : cart;
    const count =
        badgeItems.reduce(
            (total, item) =>
                total + getQuantity(item),
            0
        );

    cartCount.textContent = count;

}


/* =========================================================
   CALCULATE TOTAL
========================================================= */

function calculateSubtotal(cart) {

    return cart.reduce(
        (total, item) => {

            const price =
                Number(item.price || 0);

            const quantity =
                getQuantity(item);

            return total + (price * quantity);

        },
        0
    );

}

function getDeliveryFee() {
    const fee = STORE_SETTINGS.deliveryFee;
    if (fee === null || fee === undefined || fee === "") return null;
    const amount = Number(fee);
    return Number.isFinite(amount) && amount >= 0 ? amount : null;
}


/* =========================================================
   RENDER CHECKOUT ITEMS
========================================================= */

function renderCheckoutItems(cart) {

    if (!checkoutItems) {
        return;
    }


    if (cart.length === 0) {

        checkoutItems.innerHTML = "";

        if (checkoutLayout) {
            checkoutLayout.hidden = true;
        }

        if (checkoutEmpty) {
            checkoutEmpty.hidden = false;
        }

        if (checkoutItemCount) {
            checkoutItemCount.textContent = "0";
        }

        if (checkoutSubtotal) {
            checkoutSubtotal.textContent = formatPrice(0);
        }

        if (checkoutTotal) {
            checkoutTotal.textContent = formatPrice(0);
        }

        if (placeOrderButton) {
            placeOrderButton.disabled = true;
        }

        return;
    }


    if (checkoutLayout) {
        checkoutLayout.hidden = false;
    }

    if (checkoutEmpty) {
        checkoutEmpty.hidden = true;
    }


    checkoutItems.innerHTML =
        cart.map((item, index) => {

            const name =
                getProductName(item);

            const image =
                getProductImage(item);

            const quantity =
                getQuantity(item);

            const price =
                Number(item.price || 0);

            const itemTotal =
                price * quantity;

            const options =
                getSelectedOptions(item);

            const optionMap = getOptionMap(item);
            const variantGroups = getAvailableCheckoutOptions(item);
            const variantControls = variantGroups.map(group => {
                const selectedKey = Object.keys(optionMap).find(key =>
                    /colou?r/i.test(key) === /colou?r/i.test(group.sourceName) &&
                    (/length|inch/i.test(key) === /length|inch/i.test(group.sourceName))
                );
                const selectedValue = selectedKey ? String(optionMap[selectedKey]) : "";
                return `<label class="checkout-variant-field">${escapeHTML(group.name)}
                    <select data-checkout-option="${escapeHTML(group.sourceName)}" data-cart-index="${index}">
                        <option value="" disabled ${selectedValue ? "" : "selected"}>Choose ${escapeHTML(group.name.toLowerCase())}</option>
                        ${group.values.map(value => `<option value="${escapeHTML(value)}" ${String(value) === selectedValue ? "selected" : ""}>${escapeHTML(value)}</option>`).join("")}
                    </select>
                </label>`;
            }).join("");
            const otherOptions = options.filter(option => !/^(?:colou?r|length|inch)/i.test(option));


            return `
                <article class="checkout-item" data-product-id="${escapeHTML(item.id || item.productId || "")}">

                    <div class="checkout-item-image">

                        ${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(name)}">` : item.videoUrl ? `<video data-product-id="${escapeHTML(item.id || item.productId || "")}" src="${escapeHTML(item.videoUrl)}" poster="${escapeHTML(item.poster || "")}" controls playsinline preload="metadata" aria-label="${escapeHTML(name)} video"></video>` : ""}

                        <span class="checkout-item-quantity">
                            ${quantity}
                        </span>

                    </div>


                    <div class="checkout-item-info">

                        <h3>
                            ${escapeHTML(name)}
                        </h3>

                        ${variantControls ? `<div class="checkout-variant-fields">${variantControls}</div>` : ""}
                        ${
                            otherOptions.length
                                ? `
                                    <div class="checkout-item-options">

                                        ${otherOptions.map(option => `
                                            <span>
                                                ${escapeHTML(option)}
                                            </span>
                                        `).join("")}

                                    </div>
                                  `
                                : ""
                        }

                        <p>
                            ${formatProductPrice(price, item.compareAtPrice, STORE_SETTINGS.currency)}
                        </p>

                    </div>


                    <strong>
                        ${formatPrice(itemTotal)}
                    </strong>

                </article>
            `;

        }).join("");


    updateCheckoutSummary(cart);

}


/* =========================================================
   SUMMARY
========================================================= */

function updateCheckoutSummary(cart) {

    const itemCount =
        cart.reduce(
            (total, item) =>
                total + getQuantity(item),
            0
        );

    const subtotal =
        calculateSubtotal(cart);
    const deliveryFee = getDeliveryFee();


    if (checkoutItemCount) {
        checkoutItemCount.textContent =
            itemCount;
    }

    if (checkoutSubtotal) {
        checkoutSubtotal.textContent =
            formatPrice(subtotal);
    }

    if (checkoutDelivery) {
        checkoutDelivery.textContent = deliveryFee === null ? "To be confirmed" : formatPrice(deliveryFee);
    }

    if (checkoutTotal) {
        checkoutTotal.textContent = deliveryFee === null ? "To be confirmed" : formatPrice(subtotal + deliveryFee);
    }

}


/* =========================================================
   VALIDATION
========================================================= */

function clearErrors() {

    const fields = [
        "customerName",
        "customerPhone",
        "customerEmail",
        "deliveryCountry",
        "deliveryCity",
        "deliveryState",
        "deliveryAddress"
    ];


    fields.forEach(fieldId => {

        const field =
            document.getElementById(fieldId);

        const error =
            document.getElementById(
                `${fieldId}Error`
            );


        if (field) {
            field.classList.remove(
                "input-error"
            );
        }

        if (error) {
            error.textContent = "";
        }

    });

}


function showError(fieldId, message) {

    const field =
        document.getElementById(fieldId);

    const error =
        document.getElementById(
            `${fieldId}Error`
        );


    if (field) {
        field.classList.add(
            "input-error"
        );
    }

    if (error) {
        error.textContent =
            message;
    }

}


function validateForm() {

    clearErrors();

    let valid = true;


    const name =
        document
            .getElementById("customerName")
            ?.value
            .trim() || "";

    const phone =
        document
            .getElementById("customerPhone")
            ?.value
            .trim() || "";

    const email =
        document
            .getElementById("customerEmail")
            ?.value
            .trim() || "";

    const city =
        document
            .getElementById("deliveryCity")
            ?.value
            .trim() || "";

    const country = document.getElementById("deliveryCountry")?.value.trim() || "";

    const state =
        document
            .getElementById("deliveryState")
            ?.value
            .trim() || "";

    const address =
        document
            .getElementById("deliveryAddress")
            ?.value
            .trim() || "";


    if (name.length < 2) {

        showError(
            "customerName",
            "Please enter your full name."
        );

        valid = false;
    }


    if (phone.length < 7) {

        showError(
            "customerPhone",
            "Please enter a valid phone number."
        );

        valid = false;
    }


    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

        showError(
            "customerEmail",
            "Please enter a valid email address."
        );

        valid = false;
    }


    if (!city) {

        showError(
            "deliveryCity",
            "Please enter your city."
        );

        valid = false;
    }

    if (!country) {
        showError("deliveryCountry", "Please enter your country.");
        valid = false;
    }


    if (!state) {

        showError(
            "deliveryState",
            "Please enter your state or region."
        );

        valid = false;
    }


    if (address.length < 5) {

        showError(
            "deliveryAddress",
            "Please enter your delivery address."
        );

        valid = false;
    }


    if (!valid) {

        const firstError =
            document.querySelector(
                ".input-error"
            );

        if (firstError) {
            firstError.focus();
        }

    }


    return valid;
}

function validateCheckoutVariants() {
    const unselected = Array.from(checkoutItems?.querySelectorAll("select[data-checkout-option]") || [])
        .find(select => !select.value);
    if (!unselected) return true;
    unselected.focus();
    window.showToast?.(`Please select a ${unselected.dataset.checkoutOption.toLowerCase()} for each product.`, "error");
    return false;
}


/* =========================================================
   CREATE WHATSAPP MESSAGE
========================================================= */

function createWhatsAppMessage(
    customer,
    cart,
    subtotal,
    orderNumber,
    deliveryFee
) {

    const productDetails = cart.map(item => {
        const length = getOrderOption(item, /length|inch/i);
        const colour = getOrderOption(item, /colou?r/i) || item.color || item.colour || "Not selected";
        return [
            `Product: ${getProductName(item)}`,
            `Product link: ${getProductLink(item)}`,
            `Length: ${formatOrderLength(length)}`,
            `Colour: ${colour}`,
            `Quantity: ${getQuantity(item)}`
        ].join("\n");
    }).join("\n\n");

    const deliveryLine = deliveryFee === null
        ? "Delivery: To be confirmed through WhatsApp"
        : `Delivery: ${formatWhatsAppPrice(deliveryFee)}`;
    const totalLine = deliveryFee === null
        ? `*TOTAL: ${formatWhatsAppPrice(subtotal)} + delivery*`
        : `*TOTAL: ${formatWhatsAppPrice(subtotal + deliveryFee)}*`;

    return `🌸 *SUNSHINE'S LUXURY HAIR*

🛍️ *NEW ORDER*

━━━━━━━━━━━━━━━━━━

📋 *ORDER NUMBER*
${orderNumber}

👤 *CUSTOMER DETAILS*

Name: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email || "Not provided"}

━━━━━━━━━━━━━━━━━━

📍 *DELIVERY ADDRESS*

Country: ${customer.country}
Region: ${customer.state}
City: ${customer.city}
Street: ${customer.address}
Landmark: ${customer.landmark || "Not provided"}

━━━━━━━━━━━━━━━━━━

💇 *PRODUCT DETAILS*

${productDetails}

━━━━━━━━━━━━━━━━━━

💰 *ORDER SUMMARY*

Product: ${formatWhatsAppPrice(subtotal)}

${deliveryLine}

${totalLine}

━━━━━━━━━━━━━━━━━━

💳 *PAYMENT*

Payment will be arranged through WhatsApp.

Please confirm this order and provide the payment instructions.

Thank you for choosing
*Sunshine's Luxury Hair* ❤️`;

}

function getProductLink(item) {
    const productId = item.id || item.productId;
    if (!productId) return "Not available";
    const url = new URL("product.html", window.location.href);
    url.searchParams.set("id", String(productId));
    return url.href;
}

function getOrderOption(item, matcher) {
    return getSelectedOptions(item).map(option => {
        const separator = option.indexOf(":");
        return separator < 0 ? null : {
            name: option.slice(0, separator).trim(),
            value: option.slice(separator + 1).trim()
        };
    }).find(option => option && matcher.test(option.name))?.value || "";
}

function formatOrderLength(value) {
    const length = String(value || "").trim();
    if (!length) return "Not selected";
    if (/\b(?:inch|inches|in)\b|["″]/i.test(length)) {
        return length.replace(/\s*(?:inches|inch|in)\.?$/i, "inch").replace(/[″"]$/, "inch");
    }
    return `${length}inch`;
}

function formatWhatsAppPrice(value) {
    if (STORE_SETTINGS.currency === "XAF") {
        return `${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} CFA`;
    }
    return formatPrice(value);
}


/* =========================================================
   PLACE ORDER
========================================================= */

async function placeOrder(event) {

    event.preventDefault();


    const cart =
        getCart();


    if (cart.length === 0) {

        window.showToast?.("Your cart is empty. Add an item before placing an order.", "error");

        return;
    }


    if (!validateForm() || !validateCheckoutVariants()) {
        return;
    }


    const customer = {

        name:
            document
                .getElementById("customerName")
                .value
                .trim(),

        phone:
            document
                .getElementById("customerPhone")
                .value
                .trim(),

        email:
            document
                .getElementById("customerEmail")
                .value
                .trim(),

        country:
            document.getElementById("deliveryCountry").value.trim(),

        city:
            document
                .getElementById("deliveryCity")
                .value
                .trim(),

        state:
            document
                .getElementById("deliveryState")
                .value
                .trim(),

        address:
            document
                .getElementById("deliveryAddress")
                .value
                .trim(),

        landmark:
            document.getElementById("deliveryLandmark").value.trim(),

        note:
            document
                .getElementById("orderNote")
                ?.value
                .trim() || ""

    };


    const subtotal =
        calculateSubtotal(cart);
    const deliveryFee = getDeliveryFee();
    const orderNumber = `SLH${Date.now()}`;


    const originalButtonText =
        placeOrderButton
            ? placeOrderButton.textContent
            : "";


    try {

        if (placeOrderButton) {

            placeOrderButton.disabled = true;

            placeOrderButton.textContent =
                "Saving Order...";

        }


        /* =========================================
           PREPARE ORDER ITEMS
        ========================================== */

        const orderItems =
            cart.map(item => ({

                productId:
                    item.id ||
                    item.productId ||
                    null,

                name:
                    getProductName(item),

                price:
                    Number(item.price || 0),

                quantity:
                    getQuantity(item),

                image:
                    getProductImage(item),

                options:
                    item.selectedOptions || item.options || []

            }));

        const { db, collection, addDoc, serverTimestamp } = await import("./firebase.js");


        /* =========================================
           SAVE TO FIRESTORE
        ========================================== */

        const orderData = {

            customer: {

                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                country: customer.country,
                city: customer.city,
                state: customer.state,
                address: customer.address,
                landmark: customer.landmark

            },

            note: customer.note,

            items: orderItems,

            subtotal: subtotal,
            deliveryFee,
            total: deliveryFee === null ? subtotal : subtotal + deliveryFee,
            totalPendingConfirmation: deliveryFee === null,
            orderNumber,

            status: "pending",

            paymentMethod: "whatsapp",

            createdAt:
                serverTimestamp()

        };


        const orderRef =
            await addDoc(
                collection(db, "orders"),
                orderData
            );


        console.log(
            "Order saved successfully:",
            orderRef.id
        );


        /* =========================================
           WHATSAPP
        ========================================== */

        const message =
            createWhatsAppMessage(
                customer,
                cart,
                subtotal,
                orderNumber,
                deliveryFee
            );


        const whatsappURL =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;


        /* =========================================
           CLEAR CART
        ========================================== */

        clearCart();


        /* =========================================
           OPEN WHATSAPP
        ========================================== */

        window.location.href =
            whatsappURL;


    } catch (error) {

        console.error(
            "Order submission failed:",
            error
        );


        window.showToast?.("We couldn't save your order. Check your connection and try again.", "error");


        if (placeOrderButton) {

            placeOrderButton.disabled = false;

            placeOrderButton.textContent =
                originalButtonText ||
                "Continue to WhatsApp";

        }

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const cart =
            getCart();


        updateCartCount(cart);

        renderCheckoutItems(cart);


        if (checkoutForm) {

            checkoutForm.addEventListener(
                "submit",
                placeOrder
            );

        }

    }
);
