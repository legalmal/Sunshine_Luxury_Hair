/* =========================================================
   SUNSHINE'S LUXURY HAIR
   HOME PAGE
   FEATURED PRODUCTS + LATEST VIDEOS
   ========================================================= */

import {
    db,
    collection,
    getDocs
} from "./firebase.js";
import { loadStoreSettings, formatStorePrice, formatProductPrice } from "./store-settings.js";


/* =========================================================
   SETTINGS
========================================================= */

const STORE_SETTINGS = await loadStoreSettings();
const WHATSAPP_NUMBER = STORE_SETTINGS.whatsappNumber || "237681880898";

const MAX_FEATURED_PRODUCTS = 4;
const MAX_LATEST_VIDEOS = 3;


/* =========================================================
   DOM
========================================================= */

const featuredGrid =
    document.getElementById("featuredGrid");

const latestVideosGrid =
    document.getElementById("latestVideosGrid");


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadFeaturedProducts() {

    if (!featuredGrid) {
        console.error("featuredGrid was not found.");
        return;
    }

    try {

        featuredGrid.innerHTML = `
            <div class="home-products-loading">
                Loading our collection...
            </div>
        `;


        const snapshot = await getDocs(
            collection(db, "products")
        );


        const products = [];


        snapshot.forEach((documentSnapshot) => {

            const product = documentSnapshot.data();

            products.push({
                id: documentSnapshot.id,
                ...product
            });

        });


        /* =================================================
           RENDER LATEST VIDEOS
        ================================================== */

        renderLatestVideos(products);


        /* =================================================
           SORT PRODUCTS
        ================================================== */

        const featuredProducts = products.filter(isFeaturedProduct);
        window.dispatchEvent(new CustomEvent("sunshine-products-loaded", {
            detail: { products: featuredProducts }
        }));

        featuredProducts.sort((a, b) => {

            if (a.featured === b.featured) {
                return 0;
            }

            return a.featured ? -1 : 1;

        });


        /* =================================================
           FEATURED PRODUCTS ONLY
        ================================================== */

        const homepageProducts = featuredProducts.slice(0, MAX_FEATURED_PRODUCTS);


        if (homepageProducts.length === 0) {

            featuredGrid.innerHTML = `
                <div class="home-products-empty">
                    <p>No featured products available yet.</p>
                </div>
            `;

            return;
        }


        renderFeaturedProducts(
            homepageProducts
        );


    } catch (error) {

        console.error(
            "Error loading homepage products:",
            error
        );


        featuredGrid.innerHTML = `
            <div class="home-products-error">
                <p>
                    Unable to load products right now.
                </p>
            </div>
        `;


        if (latestVideosGrid) {

            latestVideosGrid.innerHTML = `
                <p class="home-empty-message">
                    Unable to load videos right now.
                </p>
            `;

        }

    }

}


function isFeaturedProduct(product) {
    return product.featured === true || product.featured === "true" || product.featured === 1;
}


/* =========================================================
   RENDER FEATURED PRODUCTS
========================================================= */

function renderFeaturedProducts(products) {

    featuredGrid.innerHTML = "";


    products.forEach((product) => {

        const card =
            createProductCard(product);

        featuredGrid.appendChild(card);

    });

}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const card =
        document.createElement("article");

    card.className =
        "home-product-card";
    card.dataset.productId = product.id || "";


    /* =====================================================
       PRODUCT DATA
    ===================================================== */

    const name =
        product.name ||
        "Luxury Hair";


    const category =
        product.category ||
        "Luxury Collection";


    const description =
        product.description ||
        "Premium luxury hair";


    const price =
        Number(product.price) || 0;


    const image =
        product.mainImage ||
        (
            Array.isArray(product.images)
                ? product.images[0]
                : ""
        ) || "";

    const video = product.videoUrl || product.video || "";


    const productId =
        product.id || "";


    /* =====================================================
       GET LENGTH
    ===================================================== */

    let length = "";


    if (
        Array.isArray(product.options) &&
        product.options.length > 0
    ) {

        const lengthOption =
            product.options.find((option) => {

                const optionName =
                    String(option.name || "")
                        .toLowerCase();

                return (
                    optionName.includes("length") ||
                    optionName.includes("inch")
                );

            });


        if (
            lengthOption &&
            Array.isArray(lengthOption.values) &&
            lengthOption.values.length > 0
        ) {

            length =
                lengthOption.values[0];

        }

    }


    /* =====================================================
       FALLBACK LENGTH
    ===================================================== */

    if (!length && product.length) {

        length =
            product.length;

    }


    if (!length && product.size) {

        length =
            product.size;

    }


    /* =====================================================
       CLEAN LENGTH
    ===================================================== */

    if (length) {

        length =
            String(length);


        if (
            !length
                .toLowerCase()
                .includes("inch")
        ) {

            length += " inch";

        }

    } else {

        length =
            "Available lengths";

    }


    /* =====================================================
       CATEGORY
    ===================================================== */

    const categoryName =
        formatCategory(category);


    /* =====================================================
       DESCRIPTION
    ===================================================== */

    const shortDescription =
        getShortDescription(
            description
        );


    /* =====================================================
       PRICE
    ===================================================== */

    const formattedPrice =
        formatProductPrice(price, product.compareAtPrice, STORE_SETTINGS.currency);

    const rating = getDisplayRating(product);
    const ratingStars = Array.from({ length: 5 }, (_, index) => index < Math.round(rating) ? "★" : "☆").join("");


    /* =====================================================
       WHATSAPP
    ===================================================== */

    const whatsappMessage =
        encodeURIComponent(
            `Hello, I would like to order the ${name}.`
        );


    const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;


    /* =====================================================
       CARD HTML
    ===================================================== */

    card.innerHTML = `

        <div class="home-product-image">

            ${!image && video ? `
                <video class="home-product-video" data-product-id="${escapeHTML(productId)}" controls playsinline preload="metadata" aria-label="${escapeHTML(name)} video">
                    <source src="${escapeHTML(video)}">
                </video>
            ` : image ? `

            <div
                class="home-product-image-link"
                data-image="${escapeHTML(image)}"
                data-name="${escapeHTML(name)}"
                role="button"
                tabindex="0"
                aria-label="View ${escapeHTML(name)} image"
            >

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                    onerror="this.src='assets/images/product-placeholder.jpg'"
                >

            </div>
            ` : `
                <div class="home-product-media-empty">Product media unavailable</div>
            `}

        </div>


        <div class="home-product-info">

            <div class="home-product-category">
                ${escapeHTML(categoryName)}
            </div>


            <h3 class="home-product-name">
                ${escapeHTML(name)}
            </h3>

            <p class="home-product-rating" aria-label="Rated ${rating.toFixed(1)} out of 5"><span aria-hidden="true">${ratingStars}</span> ${rating.toFixed(1)} / 5</p>


            <p class="home-product-length">
                ${escapeHTML(length)}
            </p>


            <p class="home-product-description">
                ${escapeHTML(shortDescription)}
            </p>


            <div class="home-product-price">
                ${formattedPrice}
            </div>


            <div class="home-product-actions">

                <a
                    href="shop.html?id=${encodeURIComponent(productId)}"
                    class="home-view-details"
                >
                    Visit Our Gallery
                </a>

            </div>

        </div>

    `;


    return card;

}


/* =========================================================
   LATEST VIDEOS
========================================================= */

function renderLatestVideos(products) {

    if (!latestVideosGrid) {

        console.warn(
            "latestVideosGrid was not found."
        );

        return;

    }


    /*
     * Find products that have a video.
     *
     * Your product data currently appears to support
     * both videoUrl and video.
     */

    const videoProducts =
        products
            .filter((product) => {

                return Boolean(
                    isFeaturedProduct(product) &&
                    (product.videoUrl || product.video)
                );

            })
            .slice(
                0,
                MAX_LATEST_VIDEOS
            );


    /* =====================================================
       NO VIDEOS
    ===================================================== */

    if (!videoProducts.length) {

        latestVideosGrid.innerHTML = `

            <p class="home-empty-message">

                New videos coming soon.

            </p>

        `;

        return;

    }


    /* =====================================================
       RENDER VIDEOS
    ===================================================== */

    latestVideosGrid.innerHTML =
        videoProducts
            .map((product) => {

                const video =
                    product.videoUrl ||
                    product.video ||
                    "";


                const name =
                    product.name ||
                    "Luxury Hair";


                const category =
                    product.category ||
                    "New Collection";

                const lengthOption = Array.isArray(product.options)
                    ? product.options.find(option => /length|inch/i.test(String(option.name || "")))
                    : null;
                const length = product.length || product.size || lengthOption?.values?.[0] || "";


                const description =
                    product.description ||
                    "Discover our latest luxury hair collection.";


                const safeDescription =
                    String(description)
                        .replace(/\s+/g, " ")
                        .trim();


                const shortDescription =
                    safeDescription.length > 90
                        ? safeDescription.substring(0, 90) + "..."
                        : safeDescription;


                return `

                    <article
                        class="latest-video-card"
                    >

                        <div
                            class="latest-video-media"
                        >

                            <video
                                controls
                                playsinline
                                preload="metadata"
                                poster="${escapeHTML(product.mainImage || product.image || product.images?.[0] || "")}"
                            >

                                <source
                                    src="${escapeHTML(video)}"
                                >

                                Your browser does not support
                                video playback.

                            </video>

                        </div>


                        <div
                            class="latest-video-info"
                        >

                            <p
                                class="latest-video-category"
                            >
                                ${escapeHTML(category)}
                            </p>


                            <h3>
                                ${escapeHTML(name)}
                            </h3>


                            <p>
                                ${escapeHTML(
                                    shortDescription
                                )}
                            </p>

                            ${length ? `<p class="latest-video-length">${escapeHTML(length)}</p>` : ""}

                            <p class="latest-video-rating" aria-label="Rated ${getDisplayRating(product).toFixed(1)} out of 5"><span aria-hidden="true">${Array.from({length: 5}, (_, index) => index < Math.round(getDisplayRating(product)) ? "★" : "☆").join("")}</span> ${getDisplayRating(product).toFixed(1)} / 5</p>
                            <strong class="latest-video-price">${formatProductPrice(product.price, product.compareAtPrice, STORE_SETTINGS.currency)}</strong>

                            <a class="latest-video-details" href="product.html?id=${encodeURIComponent(product.id || "")}">View Product</a>

                        </div>

                    </article>

                `;

            })
            .join("");

}


/* =========================================================
   FORMAT CATEGORY
========================================================= */

function formatCategory(category) {

    if (!category) {

        return "Luxury Collection";

    }


    return String(category)
        .replace(/[-_]/g, " ")
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        );

}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(price) {
    if (!price || Number.isNaN(Number(price))) return "Price on request";
    return formatStorePrice(price, STORE_SETTINGS.currency);
}

function getDisplayRating(product) {
    const saved = Number(product.rating);
    if (Number.isFinite(saved) && saved >= 4.5 && saved <= 5) return saved >= 4.75 ? 5 : 4.5;
    const key = String(product.id || product.name || "product");
    return [...key].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 2 ? 5 : 4.5;
}


/* =========================================================
   SHORT DESCRIPTION
========================================================= */

function getShortDescription(description) {

    if (!description) {

        return "Premium luxury hair";

    }


    const text =
        String(description)
            .replace(/\s+/g, " ")
            .trim();


    if (text.length <= 55) {

        return text;

    }


    return (
        text.substring(0, 55) +
        "..."
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
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


/* =========================================================
   PRODUCT IMAGE LIGHTBOX
========================================================= */

function createImageLightbox() {

    if (
        document.getElementById(
            "homeImageLightbox"
        )
    ) {

        return;

    }


    const lightbox =
        document.createElement("div");


    lightbox.id =
        "homeImageLightbox";


    lightbox.className =
        "home-image-lightbox";


    lightbox.innerHTML = `

        <button
            type="button"
            class="home-lightbox-close"
            aria-label="Close image"
        >
            &times;
        </button>


        <div class="home-lightbox-content">

            <img
                class="home-lightbox-image"
                src=""
                alt=""
            >

        </div>

    `;


    document.body.appendChild(
        lightbox
    );


    const closeButton =
        lightbox.querySelector(
            ".home-lightbox-close"
        );


    closeButton.addEventListener(
        "click",
        closeImageLightbox
    );


    lightbox.addEventListener(
        "click",
        (event) => {

            if (
                event.target === lightbox ||
                event.target.classList.contains(
                    "home-lightbox-content"
                )
            ) {

                closeImageLightbox();

            }

        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                lightbox.classList.contains(
                    "active"
                )
            ) {

                closeImageLightbox();

            }

        }
    );

}


/* =========================================================
   OPEN IMAGE LIGHTBOX
========================================================= */

function openImageLightbox(
    imageURL,
    imageName
) {

    createImageLightbox();


    const lightbox =
        document.getElementById(
            "homeImageLightbox"
        );


    const image =
        lightbox.querySelector(
            ".home-lightbox-image"
        );


    image.src =
        imageURL;


    image.alt =
        imageName;


    lightbox.classList.add(
        "active"
    );


    document.body.classList.add(
        "image-lightbox-open"
    );

}


/* =========================================================
   CLOSE IMAGE LIGHTBOX
========================================================= */

function closeImageLightbox() {

    const lightbox =
        document.getElementById(
            "homeImageLightbox"
        );


    if (!lightbox) {

        return;

    }


    lightbox.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "image-lightbox-open"
    );

}


/* =========================================================
   IMAGE CLICK EVENTS
========================================================= */

function setupHomeImageLightbox() {

    document.addEventListener(
        "click",
        (event) => {

            const imageContainer =
                event.target.closest(
                    ".home-product-image-link"
                );


            if (!imageContainer) {

                return;

            }


            const imageURL =
                imageContainer.dataset.image;


            const imageName =
                imageContainer.dataset.name ||
                "Product image";


            if (!imageURL) {

                return;

            }


            openImageLightbox(
                imageURL,
                imageName
            );

        }
    );


    /* =====================================================
       KEYBOARD ACCESSIBILITY
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Enter" &&
                event.key !== " "
            ) {

                return;

            }


            const imageContainer =
                event.target.closest(
                    ".home-product-image-link"
                );


            if (!imageContainer) {

                return;

            }


            event.preventDefault();


            openImageLightbox(
                imageContainer.dataset.image,
                imageContainer.dataset.name ||
                "Product image"
            );

        }
    );

}


/* =========================================================
   START
========================================================= */

setupHomeImageLightbox();

loadFeaturedProducts();
