/* ========================================
   SUNSHINE'S LUXURY HAIR
   ADMIN PRODUCT MANAGEMENT
   FIRESTORE VERSION
======================================== */

import {
    db,
    auth,
    collection,
    getDocs,
    doc,
    deleteDoc,
    signOut,
    onAuthStateChanged
} from "./firebase.js";


/* ========================================
   DOM ELEMENTS
======================================== */

const productsTableBody =
    document.getElementById(
        "productsTableBody"
    );

const productsEmpty =
    document.getElementById(
        "productsEmpty"
    );

const productSearch =
    document.getElementById(
        "productSearch"
    );

const stockFilter =
    document.getElementById(
        "stockFilter"
    );

const featuredFilter =
    document.getElementById(
        "featuredFilter"
    );

const adminSidebar =
    document.getElementById(
        "adminSidebar"
    );

const adminMenuToggle =
    document.getElementById(
        "adminMenuToggle"
    );

const adminOverlay =
    document.getElementById(
        "adminOverlay"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


/* ========================================
   PRODUCT DATA
======================================== */

let allProducts = [];


/* ========================================
   AUTHENTICATION
======================================== */

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            window.location.href =
                "login.html";

        }

    }
);


/* ========================================
   GET PRODUCTS FROM FIRESTORE
======================================== */

async function getProducts() {

    try {

        console.log(
            "Getting products from Firestore..."
        );


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        allProducts = [];


        snapshot.forEach(
            (docSnapshot) => {

                allProducts.push({

                    id:
                        docSnapshot.id,

                    ...docSnapshot.data()

                });

            }
        );


        console.log(
            "Firestore products:",
            allProducts
        );


        return allProducts;


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );


        alert(
            "Unable to load products.\n\n" +
            error.message
        );


        return [];

    }

}


/* ========================================
   FORMAT PRICE
======================================== */

function formatPrice(price) {

    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }
    ).format(
        Number(price) || 0
    );

}


/* ========================================
   ESCAPE HTML
======================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ========================================
   DISPLAY PRODUCTS
======================================== */

function displayProducts(
    products
) {

    if (!productsTableBody) {
        return;
    }


    productsTableBody.innerHTML =
        "";


    if (
        !products ||
        products.length === 0
    ) {

        if (productsEmpty) {

            productsEmpty.classList.add(
                "visible"
            );

        }

        return;

    }


    if (productsEmpty) {

        productsEmpty.classList.remove(
            "visible"
        );

    }


    products.forEach(
        (product) => {

            const row =
                document.createElement(
                    "tr"
                );


            /* ==============================
               PRODUCT IMAGE
            ============================== */

            const image =
                product.mainImage ||
                (
                    Array.isArray(
                        product.images
                    )
                        ? product.images[0]
                        : ""
                );


            const imageHTML =
                image

                    ? `
                        <img
                            class="product-table-image"
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(
                                product.name ||
                                "Product"
                            )}"
                        >
                    `

                    : `
                        <div
                            class="product-table-image product-image-placeholder"
                        >
                            No Image
                        </div>
                    `;


            /* ==============================
               COLORS
            ============================== */

            const colors =
                Array.isArray(
                    product.colors
                )
                    ? product.colors
                    : [];


            const colorsHTML =
                colors.length > 0

                    ? colors
                        .map(
                            (color) => `
                                <span
                                    class="product-color"
                                >
                                    ${escapeHTML(
                                        color
                                    )}
                                </span>
                            `
                        )
                        .join("")

                    : `
                        <span
                            class="product-color"
                        >
                            No colors
                        </span>
                    `;


            /* ==============================
               STATUS
            ============================== */

            const isInStock =
                product.status ===
                "in-stock";


            const statusHTML =
                isInStock

                    ? `
                        <span
                            class="product-status in-stock"
                        >
                            <span
                                class="status-dot"
                            ></span>

                            In Stock
                        </span>
                    `

                    : `
                        <span
                            class="product-status out-of-stock"
                        >
                            <span
                                class="status-dot"
                            ></span>

                            Out of Stock
                        </span>
                    `;


            /* ==============================
               FEATURED
            ============================== */

            const featuredHTML =
                product.featured === true

                    ? `
                        <span
                            class="featured-star"
                        >
                            ★
                        </span>
                    `

                    : `
                        <span
                            class="not-featured"
                        >
                            —
                        </span>
                    `;


            /* ==============================
               TABLE ROW
            ============================== */

            row.innerHTML = `

                <td>

                    <div
                        class="product-table-info"
                    >

                        ${imageHTML}

                        <div>

                            <div
                                class="product-table-name"
                            >
                                ${escapeHTML(
                                    product.name ||
                                    "Unnamed Product"
                                )}
                            </div>

                            <div
                                class="product-table-category"
                            >
                                ${escapeHTML(
                                    product.category ||
                                    "Uncategorized"
                                )}
                            </div>

                        </div>

                    </div>

                </td>


                <td>

                    <span
                        class="product-price"
                    >
                        ${formatPrice(
                            product.price
                        )}
                    </span>

                </td>


                <td>

                    <div
                        class="product-colors"
                    >
                        ${colorsHTML}
                    </div>

                </td>


                <td>
                    ${statusHTML}
                </td>


                <td>
                    ${product.stock ?? 0}
                </td>


                <td>
                    ${featuredHTML}
                </td>


                <td>

                    <div
                        class="product-actions"
                    >

                        <button
                            class="product-action-btn"
                            title="Edit Product"
                            data-edit-id="${escapeHTML(
                                product.id
                            )}"
                        >
                            ✎
                        </button>


                        <button
                            class="product-action-btn delete"
                            title="Delete Product"
                            data-delete-id="${escapeHTML(
                                product.id
                            )}"
                        >
                            ×
                        </button>

                    </div>

                </td>

            `;


            productsTableBody.appendChild(
                row
            );

        }
    );


    /* =================================
       EDIT BUTTONS
    ================================= */

    document
        .querySelectorAll(
            "[data-edit-id]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        editProduct(
                            button.dataset.editId
                        );

                    }
                );

            }
        );


    /* =================================
       DELETE BUTTONS
    ================================= */

    document
        .querySelectorAll(
            "[data-delete-id]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteProduct(
                            button.dataset.deleteId
                        );

                    }
                );

            }
        );

}


/* ========================================
   FILTER PRODUCTS
======================================== */

function filterProducts() {

    const search =
        productSearch
            ? productSearch.value
                .trim()
                .toLowerCase()
            : "";


    const stock =
        stockFilter
            ? stockFilter.value
            : "all";


    const featured =
        featuredFilter
            ? featuredFilter.value
            : "all";


    const filtered =
        allProducts.filter(
            (product) => {

                const name =
                    (
                        product.name ||
                        ""
                    )
                        .toLowerCase();


                const category =
                    (
                        product.category ||
                        ""
                    )
                        .toLowerCase();


                const matchesSearch =
                    name.includes(search) ||
                    category.includes(search);


                const matchesStock =
                    stock === "all" ||
                    product.status === stock;


                const matchesFeatured =
                    featured === "all" ||

                    (
                        featured === "yes" &&
                        product.featured === true
                    ) ||

                    (
                        featured === "no" &&
                        product.featured !== true
                    );


                return (
                    matchesSearch &&
                    matchesStock &&
                    matchesFeatured
                );

            }
        );


    displayProducts(
        filtered
    );

}


/* ========================================
   EDIT PRODUCT
======================================== */

function editProduct(
    productId
) {

    localStorage.setItem(
        "editingProductId",
        productId
    );


    window.location.href =
"/admin/adit-product.html";

}


/* ========================================
   DELETE PRODUCT
======================================== */

async function deleteProduct(
    productId
) {

    const product =
        allProducts.find(
            item =>
                item.id === productId
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${product.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "products",
                productId
            )
        );


        /*
           Remove it from our local
           array immediately.
        */

        allProducts =
            allProducts.filter(
                item =>
                    item.id !== productId
            );


        filterProducts();


        alert(
            "Product deleted successfully."
        );


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        alert(
            "Failed to delete product.\n\n" +
            error.message
        );

    }

}


/* ========================================
   SEARCH
======================================== */

if (productSearch) {

    productSearch.addEventListener(
        "input",
        filterProducts
    );

}


/* ========================================
   STOCK FILTER
======================================== */

if (stockFilter) {

    stockFilter.addEventListener(
        "change",
        filterProducts
    );

}


/* ========================================
   FEATURED FILTER
======================================== */

if (featuredFilter) {

    featuredFilter.addEventListener(
        "change",
        filterProducts
    );

}


/* ========================================
   MOBILE SIDEBAR
======================================== */

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

                adminOverlay.style.display =
                    adminSidebar.classList.contains(
                        "active"
                    )
                        ? "block"
                        : "none";

            }

        }
    );

}


if (
    adminOverlay &&
    adminSidebar
) {

    adminOverlay.addEventListener(
        "click",
        () => {

            adminSidebar.classList.remove(
                "active"
            );

            adminOverlay.style.display =
                "none";

        }
    );

}


/* ========================================
   LOGOUT
======================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Unable to log out."
                );

            }

        }
    );

}


/* ========================================
   LOAD PRODUCTS
======================================== */

async function initializeProducts() {

    const products =
        await getProducts();


    displayProducts(
        products
    );

}


initializeProducts();