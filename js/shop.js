/* =========================================================
   SUNSHINE'S LUXURY HAIR
   SHOP PAGE
   FIRESTORE VERSION
   ========================================================= */

import {
    db,
    collection,
    getDocs
} from "./firebase.js";
import { loadStoreSettings, formatStorePrice } from "./store-settings.js";

const STORE_SETTINGS = await loadStoreSettings();


/* =========================================================
   ELEMENTS
   ========================================================= */

const productGrid =
    document.getElementById("productGrid");

const productSearch =
    document.getElementById("productSearch");

const productSearchButton =
    document.getElementById(
        "productSearchButton"
    );

const productSort =
    document.getElementById("productSort");

const filterButtons =
    document.querySelectorAll(".filter-button");

const productResultCount =
    document.getElementById("productResultCount");

const emptyProducts =
    document.getElementById("emptyProducts");

const shopVideos =
    document.getElementById("shopVideos");

const shopVideoGrid =
    document.getElementById("shopVideoGrid");

const shopPagination =
    document.getElementById("shopPagination");

// Shop order buttons put their product in the cart before opening checkout.
document.addEventListener("click", event => {
    const orderLink = event.target.closest("[data-checkout-product]");
    if (!orderLink) return;

    const product = products.find(item => String(item.id) === orderLink.dataset.checkoutProduct);
    if (!product) return;

    event.preventDefault();

    let cart = [];
    try {
        const storedCart = JSON.parse(localStorage.getItem("sunshinesCart") || "[]");
        if (Array.isArray(storedCart)) cart = storedCart;
    } catch (error) {
        console.warn("Could not read the existing cart; starting a new checkout cart.", error);
    }

    const image = product.mainImage || product.image || product.images?.[0] || "";
    cart.push({
        id: product.id,
        name: product.name || "Luxury hair",
        price: Number(product.price) || 0,
        image,
        videoUrl: product.videoUrl || product.video || "",
        poster: image,
        category: product.category || "",
        description: product.description || "",
        quantity: 1,
        options: []
    });

    localStorage.setItem("sunshinesCart", JSON.stringify(cart));
    window.dispatchEvent(new Event("sunshines-cart-updated"));
    window.location.href = "checkout.html";
});


/* =========================================================
   QUICK VIEW ELEMENTS
   ========================================================= */

const quickViewModal =
    document.getElementById("quickViewModal");

const quickViewImage =
    document.getElementById("quickViewImage");

const quickViewClose =
    document.getElementById("quickViewClose");

const quickViewBackdrop =
    document.getElementById("quickViewBackdrop");


/* =========================================================
   STATE
   ========================================================= */

let products = [];

let currentCategory = "all";

let currentSearch = "";

let currentSort = "featured";

let currentPage = 1;

const PRODUCTS_PER_PAGE = 8;

const VIDEOS_PER_PAGE = 4;


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatPrice(price) {
    return formatStorePrice(price, STORE_SETTINGS.currency);
}


/* =========================================================
   FORMAT CATEGORY
   ========================================================= */

function formatCategory(category) {

    if (!category) {
        return "Uncategorized";
    }

    return category
        .charAt(0)
        .toUpperCase() +
        category.slice(1);

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
   CREATE PRODUCT CARD
   ========================================================= */

function getProductDetails(product) {

    const colors =
        Array.isArray(product.colors)
            ? product.colors
            : [];

    const color =
        colors[0] ||
        product.color ||
        product.colour ||
        "Premium quality";


    const lengthOption =
        Array.isArray(product.options)
            ? product.options.find(option => {

                const optionName =
                    String(option.name || "")
                        .toLowerCase();

                return (
                    optionName.includes("length") ||
                    optionName.includes("inch")
                );

            })
            : null;

    let length =
        product.length ||
        product.size ||
        lengthOption?.values?.[0] ||
        "Available lengths";


    if (
        length !== "Available lengths" &&
        !String(length).toLowerCase().includes("inch")
    ) {
        length = `${length} inch`;
    }


    return {
        color,
        length
    };

}


function createProductCard(product) {

    const image =
        product.mainImage ||
        product.image ||
        (Array.isArray(product.images) ? product.images[0] : "") || "";

    const video = product.videoUrl || product.video || "";

    const details =
        getProductDetails(product);

    const productId =
        encodeURIComponent(product.id || "");

    return `

        <article
            class="product-card"
            data-product-id="${escapeHTML(product.id)}"
        >

            <div class="product-image-container">

                ${
                    product.featured
                    ?
                    `
                    <span class="product-card-badge">
                        Featured
                    </span>
                    `
                    :
                    ""
                }

                ${!image && video ? `
                <video class="product-card-video" controls playsinline preload="metadata" poster="${escapeHTML(product.mainImage || product.image || product.images?.[0] || "")}" aria-label="${escapeHTML(product.name || "Product")} video">
                    <source src="${escapeHTML(video)}">
                </video>
                ` : image ? `<img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(product.name || "Product")}"
                    class="product-card-image"
                    loading="lazy"
                    onerror="this.style.display='none'; this.parentElement.classList.add('image-missing');"
                >` : `<div class="missing-image image-missing"><span>SUNSHINE'S</span><strong>LUXURY HAIR</strong></div>`}


                ${image ? `<div class="missing-image">

                    <span>
                        SUNSHINE'S
                    </span>

                    <strong>
                        LUXURY HAIR
                    </strong>

                </div>` : ""}

            </div>


            <div class="product-card-info">

                <p class="product-card-category">
                    ${escapeHTML(formatCategory(product.category))}
                </p>


                <h2>
                    ${escapeHTML(product.name || "Unnamed Product")}
                </h2>


                <p class="product-card-details">
                    <span>
                        ${escapeHTML(details.color)}
                    </span>

                    <span>
                        ${escapeHTML(details.length)}
                    </span>
                </p>


                <p class="product-card-price">
                    ${formatPrice(product.price)}
                </p>


                <div class="product-card-actions">

                    <a
                        href="product.html?id=${productId}"
                        class="product-view-details"
                    >
                        View Details
                    </a>

                    <a
                        href="checkout.html"
                        class="product-order-button"
                        data-checkout-product="${escapeHTML(product.id)}"
                    >
                        Place Order Now
                    </a>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   GET FILTERED PRODUCTS
   ========================================================= */

function getFilteredProducts() {

    let filteredProducts = [...products];


    /* -----------------------------------------------------
       CATEGORY
    ----------------------------------------------------- */

    if (currentCategory !== "all") {

        filteredProducts =
            filteredProducts.filter(
                product =>
                    String(product.category || "").toLowerCase() ===
                    currentCategory.toLowerCase()
            );

    }


    /* -----------------------------------------------------
       SEARCH
    ----------------------------------------------------- */

    if (currentSearch.trim() !== "") {

        const search =
            currentSearch
                .toLowerCase()
                .trim();


        filteredProducts =
            filteredProducts.filter(product => {

                const name =
                    String(product.name || "")
                        .toLowerCase();

                const category =
                    String(product.category || "")
                        .toLowerCase();

                const description =
                    String(product.description || "")
                        .toLowerCase();


                return (
                    name.includes(search) ||
                    category.includes(search) ||
                    description.includes(search)
                );

            });

    }


    /* -----------------------------------------------------
       SORTING
    ----------------------------------------------------- */

    if (currentSort === "price-low") {

        filteredProducts.sort(
            (a, b) =>
                Number(a.price || 0) -
                Number(b.price || 0)
        );

    }


    else if (currentSort === "price-high") {

        filteredProducts.sort(
            (a, b) =>
                Number(b.price || 0) -
                Number(a.price || 0)
        );

    }


    else if (currentSort === "name") {

        filteredProducts.sort(
            (a, b) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || "")
                    )
        );

    }


    else if (currentSort === "featured") {

        filteredProducts.sort(
            (a, b) =>
                Number(Boolean(b.featured)) -
                Number(Boolean(a.featured))
        );

    }


    return filteredProducts;

}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderVideos(pageProducts) {

    if (!shopVideos || !shopVideoGrid) {
        return;
    }


    const videoProducts =
        pageProducts
            .filter(product => {

                return Boolean(
                    product.videoUrl ||
                    product.video
                );

            })
            .slice(0, VIDEOS_PER_PAGE);


    if (!videoProducts.length) {
        shopVideoGrid.innerHTML = "";

        shopVideos.hidden = true;

        return;
    }


    shopVideoGrid.innerHTML =
        videoProducts
            .map(product => {

                const video =
                    product.videoUrl ||
                    product.video ||
                    "";

                const name =
                    product.name ||
                    "Luxury hair video";

                const details = getProductDetails(product);
                return `
                    <article class="shop-video-card">
                        <video
                            controls
                            playsinline
                            preload="metadata"
                            poster="${escapeHTML(product.mainImage || product.image || product.images?.[0] || "")}"
                            aria-label="${escapeHTML(name)} video"
                        >
                            <source src="${escapeHTML(video)}">
                            Your browser does not support video playback.
                        </video>
                        <div class="shop-video-info">
                            <p class="product-card-category">${escapeHTML(formatCategory(product.category))}</p>
                            <h3>${escapeHTML(name)}</h3>
                            <p>${escapeHTML(product.description || "")}</p>
                            <p class="shop-video-product-details">${escapeHTML(details.color)} · ${escapeHTML(details.length)}</p>
                            <strong>${formatPrice(product.price)}</strong>
                            <div class="product-card-actions">
                                <a href="product.html?id=${encodeURIComponent(product.id || "")}" class="product-view-details">View Details</a>
                                <a href="checkout.html" class="product-order-button" data-checkout-product="${escapeHTML(product.id)}">Place Order</a>
                            </div>
                        </div>
                    </article>
                `;

            })
            .join("");

    shopVideos.hidden = false;

}


function renderPagination(totalPages) {

    if (!shopPagination) {
        return;
    }


    if (totalPages < 1) {
        shopPagination.innerHTML = "";

        shopPagination.hidden = true;

        return;
    }


    const pageButtons =
        Array.from(
            { length: totalPages },
            (_, index) => {

                const page = index + 1;

                const isCurrentPage =
                    page === currentPage;


                return `
                    <button
                        type="button"
                        data-page="${page}"
                        ${
                            isCurrentPage
                                ? 'aria-current="page"'
                                : ""
                        }
                        aria-label="Page ${page}"
                    >
                        ${page}
                    </button>
                `;

            }
        ).join("");


    shopPagination.innerHTML = `
        <button
            type="button"
            data-page="${currentPage - 1}"
            aria-label="Previous page"
            ${currentPage === 1 ? "disabled" : ""}
        >
            ‹
        </button>

        ${pageButtons}

        <button
            type="button"
            data-page="${currentPage + 1}"
            aria-label="Next page"
            ${
                currentPage === totalPages
                    ? "disabled"
                    : ""
            }
        >
            ›
        </button>
    `;

    shopPagination.hidden = false;

}


function renderProducts() {

    if (!productGrid) {
        return;
    }


    const filteredProducts =
        getFilteredProducts();


    /* -----------------------------------------------------
       EMPTY STATE
    ----------------------------------------------------- */

    if (filteredProducts.length === 0) {

        productGrid.innerHTML = "";

        if (emptyProducts) {
            emptyProducts.hidden = false;
        }

        if (productResultCount) {
            productResultCount.textContent =
                products.length === 0
                    ? "No products available"
                    : "No products found";
        }

        renderVideos([]);

        renderPagination(0);

        return;

    }


    if (emptyProducts) {
        emptyProducts.hidden = true;
    }


    const totalPages =
        Math.ceil(
            filteredProducts.length /
            PRODUCTS_PER_PAGE
        );


    if (currentPage > totalPages) {
        currentPage = totalPages;
    }


    const startIndex =
        (currentPage - 1) * PRODUCTS_PER_PAGE;

    const pageProducts =
        filteredProducts.slice(
            startIndex,
            startIndex + PRODUCTS_PER_PAGE
        );


    if (productResultCount) {

        const finalProduct =
            startIndex + pageProducts.length;

        productResultCount.textContent =
            `Showing ${startIndex + 1}–${finalProduct} of ${
                filteredProducts.length
            } products`;

    }


    productGrid.innerHTML = "";


    pageProducts.forEach(product => {

        productGrid.insertAdjacentHTML(
            "beforeend",
            createProductCard(product)
        );

    });


    attachProductEvents();

    renderVideos(pageProducts);

    renderPagination(totalPages);

}


/* =========================================================
   PRODUCT EVENTS
   ========================================================= */

function attachProductEvents() {

    const productCards =
        document.querySelectorAll(".product-card");


    productCards.forEach(card => {

        card.addEventListener("click", event => {

            if (
                event.target.closest(
                    "a, button"
                )
            ) {

                return;

            }


            const productId =
                card.dataset.productId;


            if (!productId) {
                return;
            }


            window.location.href =
                `product.html?id=${encodeURIComponent(productId)}`;

        });

    });


    const quickViewButtons =
        document.querySelectorAll(
            "[data-quick-view]"
        );


    quickViewButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                const productId =
                    button.dataset.quickView;


                openQuickView(productId);

            }
        );

    });

}


/* =========================================================
   QUICK VIEW
   ========================================================= */

function openQuickView(productId) {

    const product =
        products.find(
            item => item.id === productId
        );


    if (!product) {
        return;
    }


    const image =
        product.mainImage ||
        product.image ||
        "assets/logo/logo-light.png";


    if (quickViewImage) {

        quickViewImage.innerHTML = `

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(product.name || "Product")}"
            >

        `;

    }


    if (quickViewModal) {

        quickViewModal.classList.add("active");

        quickViewModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    document.body.style.overflow = "hidden";

}


/* =========================================================
   CLOSE QUICK VIEW
   ========================================================= */

function closeQuickView() {

    if (quickViewModal) {

        quickViewModal.classList.remove("active");

        quickViewModal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    document.body.style.overflow = "";

}


/* =========================================================
   FILTER BUTTONS
   ========================================================= */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(item => {

                item.classList.remove("active");

            });


            button.classList.add("active");


            currentCategory =
                button.dataset.category || "all";


            currentPage = 1;

            renderProducts();

        }
    );

});


/* =========================================================
   SEARCH
   ========================================================= */

if (productSearch) {

    productSearch.addEventListener(
        "input",
        event => {

            currentSearch =
                event.target.value;


            currentPage = 1;

            renderProducts();

        }
    );

}


if (productSearchButton) {

    productSearchButton.addEventListener(
        "click",
        () => {

            currentSearch =
                productSearch?.value || "";

            currentPage = 1;

            renderProducts();

        }
    );

}

/* =========================================================
   SORT
   ========================================================= */

if (productSort) {

    productSort.addEventListener(
        "change",
        event => {

            currentSort =
                event.target.value;

            currentPage = 1;

            renderProducts();

        }
    );

}


if (shopPagination) {

    shopPagination.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest("[data-page]");


            if (button?.disabled) {
                return;
            }


            const page =
                Number(button?.dataset.page);


            if (!Number.isInteger(page) || page < 1) {
                return;
            }


            currentPage = page;

            renderProducts();


            document.querySelector(
                ".shop-heading"
            )?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


/* =========================================================
   QUICK VIEW CLOSE EVENTS
   ========================================================= */

if (quickViewClose) {

    quickViewClose.addEventListener(
        "click",
        closeQuickView
    );

}


if (quickViewBackdrop) {

    quickViewBackdrop.addEventListener(
        "click",
        closeQuickView
    );

}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            quickViewModal &&
            quickViewModal.classList.contains("active")
        ) {

            closeQuickView();

        }

    }
);


/* =========================================================
   LOAD PRODUCTS FROM FIRESTORE
   ========================================================= */

async function loadProducts() {

    try {

        if (productGrid) {

            productGrid.innerHTML = `
                <div class="products-loading">
                    Loading products...
                </div>
            `;

        }


        console.log("Loading products from Firestore...");


        const productsSnapshot =
            await getDocs(
                collection(db, "products")
            );


        products =
            productsSnapshot.docs.map(
                document => ({

                    id: document.id,

                    ...document.data()

                })
            );

        window.dispatchEvent(new CustomEvent("sunshine-shop-products-loaded", {
            detail: { products }
        }));

        console.log(
            "Products loaded from Firestore:",
            products
        );


        renderProducts();


    } catch (error) {

        console.error(
            "Error loading products from Firestore:",
            error
        );


        if (productGrid) {

            productGrid.innerHTML = `
                <div class="products-loading">
                    <p>Unable to load products.</p>
                    <p>Please try again later.</p>
                </div>
            `;

        }

        if (productResultCount) {

            productResultCount.textContent =
                "Unable to load products";

        }

    }

}


/* =========================================================
   INITIALIZE SHOP
   ========================================================= */

loadProducts();
