import {
    db,
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "./firebase.js";
import { loadStoreSettings, formatStorePrice } from "./store-settings.js";

const STORE_SETTINGS = await loadStoreSettings();


/* =========================================
   DOM ELEMENTS
========================================= */

const ordersContainer =
    document.getElementById("ordersContainer");

const ordersLoading =
    document.getElementById("ordersLoading");

const ordersEmpty =
    document.getElementById("ordersEmpty");

const totalOrders =
    document.getElementById("totalOrders");

const pendingOrders =
    document.getElementById("pendingOrders");

const confirmedOrders =
    document.getElementById("confirmedOrders");

const completedOrders =
    document.getElementById("completedOrders");

const orderSearch =
    document.getElementById("orderSearch");

const orderStatusFilter =
    document.getElementById("orderStatusFilter");

/* =========================================
   DATA
========================================= */

let orders = [];


/* =========================================
   FORMAT PRICE
========================================= */

function formatPrice(value) {
    return formatStorePrice(value, STORE_SETTINGS.currency);
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(timestamp) {

    if (!timestamp) {
        return "—";
    }

    try {

        let date;

        if (typeof timestamp.toDate === "function") {
            date = timestamp.toDate();
        } else {
            date = new Date(timestamp);
        }

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });

    } catch (error) {

        return "—";

    }

}


/* =========================================
   WHATSAPP NUMBER
========================================= */

function cleanPhoneNumber(phone) {

    return String(phone || "")
        .replace(/[^\d+]/g, "")
        .replace(/^0/, "234");

}


/* =========================================
   ORDER STATUS
========================================= */

function normalizeStatus(status) {

    const validStatuses = [
        "pending",
        "confirmed",
        "completed",
        "cancelled"
    ];

    const normalized =
        String(status || "pending").toLowerCase();

    return validStatuses.includes(normalized)
        ? normalized
        : "pending";

}


/* =========================================
   STATUS LABEL
========================================= */

function statusLabel(status) {

    const labels = {
        pending: "Pending",
        confirmed: "Confirmed",
        completed: "Completed",
        cancelled: "Cancelled"
    };

    return labels[status] || "Pending";

}


/* =========================================
   LOAD ORDERS
========================================= */

async function loadOrders() {

    try {

        ordersLoading.hidden = false;

        ordersEmpty.hidden = true;

        ordersContainer.innerHTML = "";

        console.log("Loading orders from Firestore...");


        const snapshot =
            await getDocs(
                collection(db, "orders")
            );


        orders =
            snapshot.docs.map(orderDocument => ({

                id: orderDocument.id,

                ...orderDocument.data()

            }));


        /* Newest first */

        orders.sort((a, b) => {

            const dateA =
                getTimestampValue(a.createdAt);

            const dateB =
                getTimestampValue(b.createdAt);

            return dateB - dateA;

        });


        console.log(
            "Orders loaded:",
            orders
        );


        updateStats();

        renderOrders();


    } catch (error) {

        console.error(
            "Error loading orders:",
            error
        );

        ordersLoading.hidden = true;

        ordersContainer.innerHTML = `
            <div class="orders-error">
                <h2>Unable to load orders</h2>
                <p>
                    Please check your connection and try again.
                </p>
                <button
                    type="button"
                    id="retryOrdersButton"
                >
                    Try Again
                </button>
            </div>
        `;


        const retryButton =
            document.getElementById(
                "retryOrdersButton"
            );

        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadOrders
            );

        }

    }

}


/* =========================================
   TIMESTAMP VALUE
========================================= */

function getTimestampValue(timestamp) {

    if (!timestamp) {
        return 0;
    }

    try {

        if (typeof timestamp.toDate === "function") {
            return timestamp.toDate().getTime();
        }

        const date =
            new Date(timestamp);

        return Number.isNaN(date.getTime())
            ? 0
            : date.getTime();

    } catch {

        return 0;

    }

}


/* =========================================
   UPDATE STATS
========================================= */

function updateStats() {

    const pending =
        orders.filter(
            order =>
                normalizeStatus(order.status) === "pending"
        ).length;


    const confirmed =
        orders.filter(
            order =>
                normalizeStatus(order.status) === "confirmed"
        ).length;


    const completed =
        orders.filter(
            order =>
                normalizeStatus(order.status) === "completed"
        ).length;


    totalOrders.textContent =
        orders.length;

    pendingOrders.textContent =
        pending;

    confirmedOrders.textContent =
        confirmed;

    completedOrders.textContent =
        completed;

}


/* =========================================
   FILTER ORDERS
========================================= */

function getFilteredOrders() {

    const search =
        orderSearch.value
            .trim()
            .toLowerCase();

    const status =
        orderStatusFilter.value;


    return orders.filter(order => {

        const customer =
            order.customer || {};

        const customerName =
            String(customer.name || "")
                .toLowerCase();

        const customerPhone =
            String(customer.phone || "")
                .toLowerCase();

        const orderId =
            String(order.id || "")
                .toLowerCase();


        const matchesSearch =
            !search ||
            customerName.includes(search) ||
            customerPhone.includes(search) ||
            orderId.includes(search);


        const matchesStatus =
            status === "all" ||
            normalizeStatus(order.status) === status;


        return matchesSearch && matchesStatus;

    });

}


/* =========================================
   RENDER ORDERS
========================================= */

function renderOrders() {

    ordersLoading.hidden = true;

    const filteredOrders =
        getFilteredOrders();


    ordersContainer.innerHTML = "";


    if (!filteredOrders.length) {

        ordersEmpty.hidden = false;

        return;

    }


    ordersEmpty.hidden = true;


    filteredOrders.forEach(order => {

        ordersContainer.insertAdjacentHTML(
            "beforeend",
            createOrderCard(order)
        );

    });

}


/* =========================================
   CREATE ORDER CARD
========================================= */

function createOrderCard(order) {

    const customer =
        order.customer || {};

    const status =
        normalizeStatus(order.status);

    const items =
        Array.isArray(order.items)
            ? order.items
            : [];


    const orderItemsHTML =
        items.length
            ? items.map(item => {

                const quantity =
                    Number(item.quantity) || 1;

                const itemPrice =
                    Number(item.price) || 0;

                const itemTotal =
                    itemPrice * quantity;

                const optionsHTML =
                    createOptionsHTML(
                        item.options
                    );


                return `
                    <div class="admin-order-item">

                        <div class="admin-order-item-info">

                            <strong>
                                ${escapeHTML(
                                    item.name ||
                                    "Product"
                                )}
                            </strong>

                            ${optionsHTML}

                            <span>
                                ${quantity}
                                ×
                                ${formatPrice(itemPrice)}
                            </span>

                        </div>

                        <strong class="admin-order-item-total">
                            ${formatPrice(itemTotal)}
                        </strong>

                    </div>
                `;

            }).join("")
            : `
                <p class="no-order-items">
                    No product information available.
                </p>
            `;


    const phone =
        cleanPhoneNumber(customer.phone);


    const whatsappLink =
        phone
            ? `https://wa.me/${phone}`
            : "#";


    return `
        <article
            class="admin-order-card"
            data-order-id="${escapeHTML(order.id)}"
        >

            <!-- ORDER HEADER -->

            <div class="admin-order-header">

                <div>

                    <p class="admin-order-label">
                        ORDER
                    </p>

                    <h2>
                        #${escapeHTML(
                            order.id.slice(-8).toUpperCase()
                        )}
                    </h2>

                    <span class="admin-order-date">
                        ${formatDate(order.createdAt)}
                    </span>

                </div>


                <div class="admin-order-status-area">

                    <span
                        class="order-status status-${status}"
                    >
                        ${statusLabel(status)}
                    </span>

                    <select
                        class="order-status-select"
                        data-action="status"
                        data-order-id="${escapeHTML(order.id)}"
                    >

                        <option
                            value="pending"
                            ${status === "pending" ? "selected" : ""}
                        >
                            Pending
                        </option>

                        <option
                            value="confirmed"
                            ${status === "confirmed" ? "selected" : ""}
                        >
                            Confirmed
                        </option>

                        <option
                            value="completed"
                            ${status === "completed" ? "selected" : ""}
                        >
                            Completed
                        </option>

                        <option
                            value="cancelled"
                            ${status === "cancelled" ? "selected" : ""}
                        >
                            Cancelled
                        </option>

                    </select>

                </div>

            </div>


            <!-- CUSTOMER -->

            <div class="admin-order-section">

                <div class="order-section-heading">
                    Customer
                </div>

                <div class="customer-details">

                    <div>
                        <span>Name</span>
                        <strong>
                            ${escapeHTML(
                                customer.name || "—"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Phone</span>
                        <strong>
                            ${escapeHTML(
                                customer.phone || "—"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Email</span>
                        <strong>
                            ${escapeHTML(
                                customer.email || "—"
                            )}
                        </strong>
                    </div>

                </div>


                ${
                    phone
                        ? `
                            <a
                                href="${whatsappLink}"
                                target="_blank"
                                rel="noopener"
                                class="order-whatsapp"
                            >
                                WhatsApp Customer
                            </a>
                        `
                        : ""
                }

            </div>


            <!-- DELIVERY -->

            <div class="admin-order-section">

                <div class="order-section-heading">
                    Delivery Information
                </div>

                <div class="delivery-details">

                    <div>
                        <span>City</span>
                        <strong>
                            ${escapeHTML(
                                customer.city || "—"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>State</span>
                        <strong>
                            ${escapeHTML(
                                customer.state || "—"
                            )}
                        </strong>
                    </div>

                    <div class="delivery-address">
                        <span>Address</span>
                        <strong>
                            ${escapeHTML(
                                customer.address || "—"
                            )}
                        </strong>
                    </div>

                </div>

            </div>


            <!-- PRODUCTS -->

            <div class="admin-order-section">

                <div class="order-section-heading">
                    Products
                </div>

                <div class="admin-order-items">
                    ${orderItemsHTML}
                </div>

            </div>


            <!-- NOTE -->

            ${
                order.note
                    ? `
                        <div class="admin-order-note">

                            <span>
                                Customer Note
                            </span>

                            <p>
                                ${escapeHTML(order.note)}
                            </p>

                        </div>
                    `
                    : ""
            }


            <!-- TOTAL -->

            <div class="admin-order-footer">

                <div>

                    <span>
                        Order Total
                    </span>

                    <strong>
                        ${formatPrice(order.total)}
                    </strong>

                </div>


                <button
                    type="button"
                    class="delete-order-button"
                    data-action="delete"
                    data-order-id="${escapeHTML(order.id)}"
                >
                    Delete Order
                </button>

            </div>

        </article>
    `;

}


/* =========================================
   OPTIONS
========================================= */

function createOptionsHTML(options) {

    if (!options) {
        return "";
    }


    if (Array.isArray(options)) {

        const values =
            options
                .map(option => {

                    if (
                        option &&
                        typeof option === "object"
                    ) {

                        return `${option.name || ""}: ${option.value || ""}`;

                    }

                    return String(option);

                })
                .filter(Boolean);


        return values.length
            ? `
                <div class="admin-order-options">
                    ${escapeHTML(values.join(" • "))}
                </div>
            `
            : "";

    }


    if (typeof options === "object") {

        const values =
            Object.entries(options)
                .map(
                    ([name, value]) =>
                        `${name}: ${value}`
                );


        return values.length
            ? `
                <div class="admin-order-options">
                    ${escapeHTML(values.join(" • "))}
                </div>
            `
            : "";

    }


    return `
        <div class="admin-order-options">
            ${escapeHTML(options)}
        </div>
    `;

}


/* =========================================
   UPDATE ORDER STATUS
========================================= */

async function updateOrderStatus(
    orderId,
    newStatus
) {

    try {

        const orderRef =
            doc(
                db,
                "orders",
                orderId
            );


        await updateDoc(
            orderRef,
            {
                status: newStatus
            }
        );


        const order =
            orders.find(
                item => item.id === orderId
            );


        if (order) {
            order.status = newStatus;
        }


        updateStats();

        renderOrders();


        console.log(
            "Order status updated:",
            orderId,
            newStatus
        );


    } catch (error) {

        console.error(
            "Error updating order:",
            error
        );

        alert(
            "Unable to update the order status."
        );

        renderOrders();

    }

}


/* =========================================
   DELETE ORDER
========================================= */

async function deleteOrder(orderId) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this order?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "orders",
                orderId
            )
        );


        orders =
            orders.filter(
                order => order.id !== orderId
            );


        updateStats();

        renderOrders();


    } catch (error) {

        console.error(
            "Error deleting order:",
            error
        );

        alert(
            "Unable to delete this order."
        );

    }

}


/* =========================================
   EVENTS
========================================= */

orderSearch.addEventListener(
    "input",
    renderOrders
);


orderStatusFilter.addEventListener(
    "change",
    renderOrders
);


/* =========================================
   ORDER ACTIONS
========================================= */

ordersContainer.addEventListener(
    "change",
    event => {

        const select =
            event.target.closest(
                '[data-action="status"]'
            );


        if (!select) {
            return;
        }


        const orderId =
            select.dataset.orderId;

        const newStatus =
            select.value;


        updateOrderStatus(
            orderId,
            newStatus
        );

    }
);


ordersContainer.addEventListener(
    "click",
    event => {

        const deleteButton =
            event.target.closest(
                '[data-action="delete"]'
            );


        if (!deleteButton) {
            return;
        }


        deleteOrder(
            deleteButton.dataset.orderId
        );

    }
);


/* =========================================
   START
========================================= */

loadOrders();
