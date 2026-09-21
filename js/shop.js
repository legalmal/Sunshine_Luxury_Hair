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


/* =========================================================
   ELEMENTS
   ========================================================= */

const productGrid =
    document.getElementById("productGrid");

const productSearch =
    document.getElementById("productSearch");

const productSort =
    document.getElementById("productSort");

const filterButtons =
    document.querySelectorAll(".filter-button");

const productResultCount =
    document.getElementById("productResultCount");

const emptyProducts =
    document.getElementById("emptyProducts");


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


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatPrice(price) {

    return new Intl.NumberFormat("en-NG", {

        style: "currency",

        currency: "NGN",

        maximumFractionDigits: 0

    }).format(Number(price) || 0);

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

function createProductCard(product) {

    const image =
        product.mainImage ||
        product.image ||
        "assets/logo/logo-light.png";


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


                <button
                    class="quick-view-button"
                    type="button"
                    data-quick-view="${escapeHTML(product.id)}"
                >
                    Quick View
                </button>


                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(product.name || "Product")}"
                    class="product-card-image"
                    loading="lazy"
                    onerror="this.style.display='none'; this.parentElement.classList.add('image-missing');"
                >


                <div class="missing-image">

                    <span>
                        SUNSHINE'S
                    </span>

                    <strong>
                        LUXURY HAIR
                    </strong>

                </div>

            </div>


            <div class="product-card-info">

                <p class="product-card-category">
                    ${escapeHTML(formatCategory(product.category))}
                </p>


                <h2>
                    ${escapeHTML(product.name || "Unnamed Product")}
                </h2>


                <p class="product-card-price">
                    ${formatPrice(product.price)}
                </p>

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

function renderProducts() {

    if (!productGrid) {
        return;
    }


    const filteredProducts =
        getFilteredProducts();


    productGrid.innerHTML = "";


    /* -----------------------------------------------------
       EMPTY STATE
    ----------------------------------------------------- */

    if (filteredProducts.length === 0) {

        if (emptyProducts) {
            emptyProducts.hidden = false;
        }

        if (productResultCount) {
            productResultCount.textContent =
                products.length === 0
                    ? "No products available"
                    : "No products found";
        }

        return;

    }


    if (emptyProducts) {
        emptyProducts.hidden = true;
    }


    if (productResultCount) {

        productResultCount.textContent =
            `Showing ${filteredProducts.length} product${
                filteredProducts.length === 1 ? "" : "s"
            }`;

    }


    filteredProducts.forEach(product => {

        productGrid.insertAdjacentHTML(
            "beforeend",
            createProductCard(product)
        );

    });


    attachProductEvents();

}


/* =========================================================
   PRODUCT EVENTS
   ========================================================= */

function attachProductEvents() {

    const productCards =
        document.querySelectorAll(".product-card");


    productCards.forEach(card => {

        card.addEventListener("click", event => {

            /*
                Do not open product details
                when Quick View is clicked.
            */

            if (
                event.target.closest(
                    ".quick-view-button"
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

            renderProducts();

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