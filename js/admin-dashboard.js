import {
    db,
    collection,
    getDocs
} from "./firebase.js";


document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENTS
    ========================================= */

    const totalProducts =
        document.getElementById("totalProducts");

    const inStockProducts =
        document.getElementById("inStockProducts");

    const outOfStockProducts =
        document.getElementById("outOfStockProducts");

    const featuredProducts =
        document.getElementById("featuredProducts");

    const totalOrders =
        document.getElementById("totalOrders");

    const pendingOrders =
        document.getElementById("pendingOrders");

    const completedOrders =
        document.getElementById("completedOrders");

    const totalOrderValue =
        document.getElementById("totalOrderValue");

    const recentProducts =
        document.getElementById("recentProducts");

    const recentOrders =
        document.getElementById("recentOrders");

    const recentMessages =
        document.getElementById("recentMessages");


    /* =========================================
       HELPERS
    ========================================= */

    function formatPrice(value) {

        const amount = Number(value) || 0;

        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }).format(amount);
    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getProductImage(product) {

        if (product.mainImage) {
            return product.mainImage;
        }

        if (product.image) {
            return product.image;
        }

        if (
            Array.isArray(product.images) &&
            product.images.length
        ) {
            return product.images[0];
        }

        return "../assets/logos/logo-dark.png";
    }


    function isFeatured(product) {

        return (
            product.featured === true ||
            product.featured === "true" ||
            product.featured === 1
        );
    }


    function getOrderDate(order) {

        if (
            order.createdAt &&
            typeof order.createdAt.toDate === "function"
        ) {
            return order.createdAt.toDate();
        }

        if (order.createdAt) {

            const date = new Date(order.createdAt);

            if (!Number.isNaN(date.getTime())) {
                return date;
            }

        }

        return null;
    }


    function formatOrderDate(order) {

        const date = getOrderDate(order);

        if (!date) {
            return "Date unavailable";
        }

        return date.toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }


    function getCustomerName(order) {

        return (
            order.customer?.name ||
            order.customerName ||
            "Unknown Customer"
        );
    }


    function getOrderTotal(order) {

        return Number(
            order.total ??
            order.subtotal ??
            0
        ) || 0;
    }


    function getOrderStatus(order) {

        return String(
            order.status || "pending"
        ).toLowerCase();

    }


    /* =========================================
       LOAD DASHBOARD
    ========================================= */

    async function loadDashboard() {

        try {

            console.log(
                "Loading dashboard data from Firestore..."
            );


            /* =====================================
               LOAD PRODUCTS
            ===================================== */

            const productsSnapshot =
                await getDocs(
                    collection(db, "products")
                );

            const products =
                productsSnapshot.docs.map(
                    document => ({
                        id: document.id,
                        ...document.data()
                    })
                );


            console.log(
                "Dashboard products:",
                products
            );


            /* =====================================
               PRODUCT STATISTICS
            ===================================== */

            const inStock =
                products.filter(
                    product =>
                        product.status === "in-stock"
                ).length;


            const outOfStock =
                products.filter(
                    product =>
                        product.status === "out-of-stock"
                ).length;


            const featured =
                products.filter(
                    product =>
                        isFeatured(product)
                ).length;


            totalProducts.textContent =
                products.length;

            inStockProducts.textContent =
                inStock;

            outOfStockProducts.textContent =
                outOfStock;

            featuredProducts.textContent =
                featured;


            /* =====================================
               RECENT PRODUCTS
            ===================================== */

            renderRecentProducts(products);


            /* =====================================
               LOAD ORDERS
            ===================================== */

            const ordersSnapshot =
                await getDocs(
                    collection(db, "orders")
                );


            const orders =
                ordersSnapshot.docs.map(
                    document => ({
                        id: document.id,
                        ...document.data()
                    })
                );


            console.log(
                "Dashboard orders:",
                orders
            );


            /* =====================================
               SORT ORDERS
            ===================================== */

            orders.sort((a, b) => {

                const dateA =
                    getOrderDate(a)?.getTime() || 0;

                const dateB =
                    getOrderDate(b)?.getTime() || 0;

                return dateB - dateA;

            });


            /* =====================================
               ORDER STATISTICS
            ===================================== */

            const pending =
                orders.filter(
                    order =>
                        getOrderStatus(order) ===
                        "pending"
                ).length;


            const completed =
                orders.filter(
                    order =>
                        getOrderStatus(order) ===
                        "completed"
                ).length;


            const orderValue =
                orders.reduce(
                    (total, order) =>
                        total + getOrderTotal(order),
                    0
                );


            totalOrders.textContent =
                orders.length;

            pendingOrders.textContent =
                pending;

            completedOrders.textContent =
                completed;

            totalOrderValue.textContent =
                formatPrice(orderValue);


            /* =====================================
               RECENT ORDERS
            ===================================== */

            renderRecentOrders(orders);


            /* =====================================
               LOAD CUSTOMER MESSAGES
            ===================================== */

            try {
                const messagesSnapshot =
                    await getDocs(collection(db, "messages"));

                const messages = messagesSnapshot.docs.map(document => ({
                    id: document.id,
                    ...document.data()
                }));

                messages.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
                    const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
                    return dateB - dateA;
                });

                renderRecentMessages(messages);
            } catch (messageError) {
                console.error("Unable to load customer messages:", messageError);
                if (recentMessages) {
                    recentMessages.innerHTML = `
                        <div class="dashboard-error">
                            <h3>Unable to load messages</h3>
                            <p>Check the Firestore messages read permissions.</p>
                        </div>
                    `;
                }
            }


            console.log(
                "Dashboard loaded successfully."
            );

        } catch (error) {

            console.error(
                "Error loading dashboard:",
                error
            );


            if (recentProducts) {

                recentProducts.innerHTML = `
                    <div class="dashboard-error">
                        <h3>Unable to load dashboard</h3>
                        <p>
                            Please check your internet connection
                            and try again.
                        </p>
                    </div>
                `;

            }


            if (recentOrders) {

                recentOrders.innerHTML = `
                    <div class="dashboard-error">
                        <h3>Unable to load orders</h3>
                        <p>
                            Please try again later.
                        </p>
                    </div>
                `;

            }

        }

    }


    /* =========================================
       RECENT CUSTOMER MESSAGES
    ========================================= */

    function renderRecentMessages(messages) {
        if (!recentMessages) return;

        if (!messages.length) {
            recentMessages.innerHTML = `
                <div class="empty-messages">
                    <div class="empty-icon">✉</div>
                    <h3>No messages yet</h3>
                    <p>Customer enquiries submitted through the contact form will appear here.</p>
                </div>
            `;
            return;
        }

        recentMessages.innerHTML = messages.slice(0, 8).map(message => {
            const date = message.createdAt?.toDate?.();
            const formattedDate = date
                ? date.toLocaleString("en-NG", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                : "Just received";

            return `
                <article class="recent-message-card">
                    <div class="recent-message-heading">
                        <div>
                            <span class="message-received-badge">Message received</span>
                            <h3>${escapeHTML(message.name || "Customer")}</h3>
                            <a href="mailto:${escapeHTML(message.email || "")}">${escapeHTML(message.email || "No email provided")}</a>
                        </div>
                        <time>${escapeHTML(formattedDate)}</time>
                    </div>
                    ${message.subject ? `<strong class="recent-message-subject">${escapeHTML(message.subject)}</strong>` : ""}
                    <p class="recent-message-body">${escapeHTML(message.message || "")}</p>
                </article>
            `;
        }).join("");
    }


    /* =========================================
       RECENT PRODUCTS
    ========================================= */

    function renderRecentProducts(products) {

        if (!recentProducts) return;


        if (!products.length) {

            recentProducts.innerHTML = `
                <div class="empty-products">

                    <div class="empty-icon">
                        ▣
                    </div>

                    <h3>No Products Yet</h3>

                    <p>
                        Add your first product to begin
                        building your store inventory.
                    </p>

                    <a href="add-product.html">
                        Add Your First Product
                    </a>

                </div>
            `;

            return;
        }


        const sortedProducts =
            [...products].sort((a, b) => {

                const dateA =
                    a.createdAt?.toDate?.()?.getTime() || 0;

                const dateB =
                    b.createdAt?.toDate?.()?.getTime() || 0;

                return dateB - dateA;

            });


        const latestProducts =
            sortedProducts.slice(0, 4);


        recentProducts.innerHTML =
            latestProducts.map(product => {

                const image =
                    getProductImage(product);

                const name =
                    product.name || "Unnamed Product";

                const category =
                    product.category || "Uncategorized";

                const price =
                    formatPrice(product.price);

                const status =
                    product.status || "in-stock";


                return `
                    <article
                        class="recent-product-card"
                    >

                        <div class="recent-product-image">

                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(name)}"
                            >

                        </div>


                        <div class="recent-product-info">

                            <span class="recent-product-category">
                                ${escapeHTML(category)}
                            </span>

                            <h3>
                                ${escapeHTML(name)}
                            </h3>

                            <strong>
                                ${price}
                            </strong>

                        </div>


                        <div class="recent-product-status ${escapeHTML(status)}">
                            ${
                                status === "in-stock"
                                    ? "In Stock"
                                    : "Out of Stock"
                            }
                        </div>

                    </article>
                `;

            }).join("");

    }


    /* =========================================
       RECENT ORDERS
    ========================================= */

    function renderRecentOrders(orders) {

        if (!recentOrders) return;


        if (!orders.length) {

            recentOrders.innerHTML = `
                <div class="empty-orders">

                    <div class="empty-icon">
                        ▤
                    </div>

                    <h3>No Orders Yet</h3>

                    <p>
                        Customer orders will appear here
                        when they place an order.
                    </p>

                    <a href="orders.html">
                        View Orders
                    </a>

                </div>
            `;

            return;
        }


        const latestOrders =
            orders.slice(0, 5);


        recentOrders.innerHTML =
            latestOrders.map(order => {

                const customer =
                    getCustomerName(order);

                const status =
                    getOrderStatus(order);

                const total =
                    formatPrice(
                        getOrderTotal(order)
                    );


                const itemCount =
                    Array.isArray(order.items)
                        ? order.items.reduce(
                            (sum, item) =>
                                sum +
                                (
                                    Number(
                                        item.quantity
                                    ) || 0
                                ),
                            0
                        )
                        : 0;


                return `
                    <article
                        class="recent-order-card"
                    >

                        <div class="recent-order-main">

                            <div class="recent-order-icon">
                                ▤
                            </div>

                            <div>

                                <span class="recent-order-id">
                                    #${escapeHTML(
                                        order.id.slice(-8)
                                    )}
                                </span>

                                <h3>
                                    ${escapeHTML(customer)}
                                </h3>

                                <p>
                                    ${itemCount}
                                    ${
                                        itemCount === 1
                                            ? "item"
                                            : "items"
                                    }
                                    ·
                                    ${formatOrderDate(order)}
                                </p>

                            </div>

                        </div>


                        <div class="recent-order-right">

                            <strong>
                                ${total}
                            </strong>

                            <span
                                class="order-status ${escapeHTML(status)}"
                            >
                                ${escapeHTML(status)}
                            </span>

                        </div>

                    </article>
                `;

            }).join("");

    }


    /* =========================================
       MOBILE SIDEBAR
    ========================================= */

    const adminMenuToggle =
        document.getElementById(
            "adminMenuToggle"
        );

    const adminSidebar =
        document.getElementById(
            "adminSidebar"
        );

    const adminOverlay =
        document.getElementById(
            "adminOverlay"
        );


    function closeSidebar() {

        if (adminSidebar) {
            adminSidebar.classList.remove(
                "active"
            );
        }

        if (adminOverlay) {
            adminOverlay.classList.remove(
                "active"
            );
        }

        if (adminMenuToggle) {
            adminMenuToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }

    }


    if (
        adminMenuToggle &&
        adminSidebar
    ) {

        adminMenuToggle.addEventListener(
            "click",
            () => {

                adminSidebar.classList.toggle(
                    "active"
                );

                if (adminOverlay) {

                    adminOverlay.classList.toggle(
                        "active"
                    );

                }

                const isOpen =
                    adminSidebar.classList.contains(
                        "active"
                    );

                adminMenuToggle.setAttribute(
                    "aria-expanded",
                    isOpen
                        ? "true"
                        : "false"
                );

            }
        );

    }


    if (adminOverlay) {

        adminOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    if (adminSidebar) {

        adminSidebar
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    closeSidebar
                );

            });

    }


    /* =========================================
       START
    ========================================= */

    loadDashboard();

});
