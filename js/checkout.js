/* =========================================================
   SUNSHINE'S LUXURY HAIR
   CHECKOUT
   ========================================================= */

import {
    db,
    collection,
    addDoc,
    serverTimestamp
} from "./firebase.js";
import { loadStoreSettings, formatStorePrice } from "./store-settings.js";

const STORE_SETTINGS = await loadStoreSettings();


/* =========================================================
   SETTINGS
========================================================= */

// IMPORTANT:
// Replace this with Sunshine's real WhatsApp number.
// Include country code, without + or spaces.
//
// Example Cameroon:
// 237690000000
//
const WHATSAPP_NUMBER = STORE_SETTINGS.whatsappNumber || "237XXXXXXXXX";

const CART_KEY = "sunshinesCart";


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


/* =========================================================
   CART
========================================================= */

function getCart() {
    try {
        const cart =
            JSON.parse(
                localStorage.getItem(CART_KEY)
            );

        return Array.isArray(cart) ? cart : [];

    } catch (error) {

        console.error(
            "Unable to read cart:",
            error
        );

        return [];
    }
}


/* =========================================================
   SAVE CART
========================================================= */

function clearCart() {
    localStorage.removeItem(CART_KEY);
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

    const options = item.options;

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

                const value =
                    option.value ||
                    "";

                if (name && value) {
                    return `${name}: ${value}`;
                }

                return value || name;
            }

            return String(option);

        }).filter(Boolean);
    }


    if (typeof options === "object") {

        return Object.entries(options)
            .map(([name, value]) =>
                `${name}: ${value}`
            );
    }


    return [];
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

    const count =
        cart.reduce(
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
        cart.map(item => {

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


            return `
                <article class="checkout-item">

                    <div class="checkout-item-image">

                        ${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(name)}">` : item.videoUrl ? `<video src="${escapeHTML(item.videoUrl)}" poster="${escapeHTML(item.poster || "")}" controls playsinline preload="metadata" aria-label="${escapeHTML(name)} video"></video>` : ""}

                        <span class="checkout-item-quantity">
                            ${quantity}
                        </span>

                    </div>


                    <div class="checkout-item-info">

                        <h3>
                            ${escapeHTML(name)}
                        </h3>

                        ${
                            options.length
                                ? `
                                    <div class="checkout-item-options">

                                        ${options.map(option => `
                                            <span>
                                                ${escapeHTML(option)}
                                            </span>
                                        `).join("")}

                                    </div>
                                  `
                                : ""
                        }

                        <p>
                            ${formatPrice(price)}
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


    if (checkoutItemCount) {
        checkoutItemCount.textContent =
            itemCount;
    }

    if (checkoutSubtotal) {
        checkoutSubtotal.textContent =
            formatPrice(subtotal);
    }

    if (checkoutTotal) {
        checkoutTotal.textContent =
            formatPrice(subtotal);
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


/* =========================================================
   CREATE WHATSAPP MESSAGE
========================================================= */

function createWhatsAppMessage(
    customer,
    cart,
    subtotal,
    orderId
) {

    let message =
`Hello Sunshine's Luxury Hair 👋

I would like to place an order.

ORDER ID:
${orderId}

CUSTOMER DETAILS
Name: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email || "Not provided"}

DELIVERY DETAILS
City: ${customer.city}
State/Region: ${customer.state}
Address: ${customer.address}

ORDER ITEMS
`;


    cart.forEach((item, index) => {

        const name =
            getProductName(item);

        const quantity =
            getQuantity(item);

        const price =
            Number(item.price || 0);

        const total =
            price * quantity;

        const options =
            getSelectedOptions(item);


        message +=
`
${index + 1}. ${name}
Quantity: ${quantity}
Price: ${formatPrice(price)}
Total: ${formatPrice(total)}
`;


        if (options.length) {

            message +=
`Options: ${options.join(", ")}
`;

        }

    });


    message +=
`
ORDER TOTAL
Subtotal: ${formatPrice(subtotal)}
Total: ${formatPrice(subtotal)}

Order Note:
${customer.note || "None"}

Thank you.`;

    return message;

}


/* =========================================================
   PLACE ORDER
========================================================= */

async function placeOrder(event) {

    event.preventDefault();


    const cart =
        getCart();


    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;
    }


    if (!validateForm()) {
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

        note:
            document
                .getElementById("orderNote")
                ?.value
                .trim() || ""

    };


    const subtotal =
        calculateSubtotal(cart);


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
                    item.options || []

            }));


        /* =========================================
           SAVE TO FIRESTORE
        ========================================== */

        const orderData = {

            customer: {

                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                city: customer.city,
                state: customer.state,
                address: customer.address

            },

            note: customer.note,

            items: orderItems,

            subtotal: subtotal,

            total: subtotal,

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
                orderRef.id
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


        alert(
            "We could not save your order. Please check your internet connection and try again."
        );


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
