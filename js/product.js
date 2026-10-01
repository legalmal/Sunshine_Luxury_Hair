/* =========================================================
   SUNSHINE'S LUXURY HAIR
   PRODUCT DETAILS PAGE
   FIRESTORE VERSION
   ========================================================= */

import { loadProduct as loadProductRecord } from "./product-data.js";
import { loadStoreSettings, formatStorePrice, formatProductPrice } from "./store-settings.js";

const STORE_SETTINGS = await loadStoreSettings();


/* =========================================================
   GET PRODUCT ID FROM URL
   ========================================================= */

const urlParams =
    new URLSearchParams(window.location.search);

const productId =
    urlParams.get("id");


/* =========================================================
   ELEMENTS
   ========================================================= */

const productContainer =
    document.getElementById("productContainer");

const productNotFound =
    document.getElementById("productNotFound");

const mainProductImage =
    document.getElementById("mainProductImage");

const mainProductVideo =
    document.getElementById("mainProductVideo");

const productVideoError = document.getElementById("productVideoError");

if (mainProductVideo && productVideoError) {
    mainProductVideo.addEventListener("error", () => {
        if (mediaItems[currentMediaIndex]?.type !== "video") return;
        productVideoError.textContent = "This video could not be played. Please try another video or contact us for help.";
        productVideoError.hidden = false;
    });
    mainProductVideo.addEventListener("loadeddata", () => {
        productVideoError.hidden = true;
        productVideoError.textContent = "";
    });
}

const productThumbnails =
    document.getElementById("productThumbnails");

const productName =
    document.getElementById("productName");

const productCategory =
    document.getElementById("productCategory");

const productPrice =
    document.getElementById("productPrice");

const productRatingDisplay = document.getElementById("productRatingDisplay");

const productDescription =
    document.getElementById("productDescription");

const productOptions =
    document.getElementById("productOptions");

const productMetaCategory =
    document.getElementById(
        "productMetaCategory"
    );

const breadcrumbProduct =
    document.getElementById(
        "breadcrumbProduct"
    );

const quantityInput =
    document.getElementById(
        "quantityInput"
    );

const quantityMinus =
    document.getElementById(
        "quantityMinus"
    );

const quantityPlus =
    document.getElementById(
        "quantityPlus"
    );

const addToCartButton =
    document.getElementById(
        "addToCartButton"
    );

const whatsappButton =
    document.getElementById(
        "whatsappButton"
    );

const galleryPrev =
    document.getElementById(
        "galleryPrev"
    );

const galleryNext =
    document.getElementById(
        "galleryNext"
    );


/* =========================================================
   PRODUCT STATE
   ========================================================= */

let product = null;

let mediaItems = [];


function setAddToCartButtonIcon(iconClass, label) {

    if (!addToCartButton) {
        return;
    }


    addToCartButton.setAttribute(
        "aria-label",
        label
    );

    addToCartButton.title = label;

    addToCartButton.innerHTML = `
        <i class="${iconClass}" aria-hidden="true"></i>
        <span class="add-cart-label">${label}</span>
    `;
}

let currentMediaIndex = 0;


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatPrice(price) {
    return formatStorePrice(price, STORE_SETTINGS.currency);
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

function getPlayableVideoUrl(url) {
    try {
        const playableUrl = new URL(url, window.location.href);
        if (!/(^|\.)res\.cloudinary\.com$/i.test(playableUrl.hostname)) return url;

        const uploadPath = "/video/upload/";
        if (!playableUrl.pathname.includes(uploadPath)) return url;

        // Deliver uploaded MOV/WebM/MP4 videos as broadly supported H.264 MP4.
        playableUrl.pathname = playableUrl.pathname.replace(
            uploadPath,
            `${uploadPath}f_mp4,vc_h264:baseline:3.1/`
        ).replace(/\.(mov|webm|m4v|mp4)$/i, ".mp4");
        return playableUrl.href;
    } catch (error) {
        console.warn("Could not prepare the product video URL.", error);
        return url;
    }
}


/* =========================================================
   LOAD PRODUCT FROM FIRESTORE
   ========================================================= */

async function loadProduct() {

    try {

        if (!productId) {

            showProductNotFound();

            return;

        }


        console.log(
            "Loading product:",
            productId
        );


        const foundProduct = await loadProductRecord(productId);


        if (!foundProduct) {

            console.error(
                "Product not found:",
                productId
            );

            showProductNotFound();

            return;

        }


        product = foundProduct;

        const mainProductMedia = document.querySelector(".product-main-media");
        if (mainProductMedia) mainProductMedia.dataset.productId = product.id;
        if (mainProductVideo) mainProductVideo.dataset.productId = product.id;


        console.log(
            "Product loaded:",
            product
        );


        displayProduct();


    } catch (error) {

        console.error(
            "Error loading product:",
            error
        );


        showProductNotFound();

    }

}


/* =========================================================
   SHOW PRODUCT NOT FOUND
   ========================================================= */

function showProductNotFound() {

    if (productContainer) {

        productContainer.hidden = true;

    }


    if (productNotFound) {

        productNotFound.hidden = false;

    }

}


/* =========================================================
   DISPLAY PRODUCT
   ========================================================= */

function displayProduct() {

    if (!product) {
        return;
    }


    if (productContainer) {

        productContainer.hidden = false;

    }


    if (productNotFound) {

        productNotFound.hidden = true;

    }


    /* Product name */

    if (productName) {

        productName.textContent =
            product.name || "Product";

    }

    const rating = getDisplayRating(product);
    if (productRatingDisplay) {
        const stars = Array.from({ length: 5 }, (_, index) => index < Math.round(rating) ? "★" : "☆").join("");
        productRatingDisplay.textContent = `${stars} ${rating.toFixed(1)} / 5`;
        productRatingDisplay.setAttribute("aria-label", `Rated ${rating.toFixed(1)} out of 5`);
        productRatingDisplay.hidden = false;
    }


    /* Category */

    if (productCategory) {

        productCategory.textContent =
            formatCategory(
                product.category
            );

    }


    if (productMetaCategory) {

        productMetaCategory.textContent =
            formatCategory(
                product.category
            );

    }


    /* Price */

    if (productPrice) {

        productPrice.innerHTML =
            formatProductPrice(product.price, product.compareAtPrice, STORE_SETTINGS.currency);

    }


    /* Description */

    if (productDescription) {

        productDescription.textContent =
            product.description ||
            "Premium luxury hair from Sunshine's Luxury Hair.";

    }



    /* Breadcrumb */

    if (breadcrumbProduct) {

        breadcrumbProduct.textContent =
            product.name || "Product";

    }


    /* Browser title */

    document.title =
        `${product.name || "Product"} | Sunshine's Luxury Hair`;


    /* Gallery */

    createMediaGallery();


    /* Options */

    createProductOptions();


    /* Stock */

    updateStockState();

}

function getDisplayRating(item) {
    const saved = Number(item.rating);
    if (Number.isFinite(saved) && saved >= 4.5 && saved <= 5) return saved >= 4.75 ? 5 : 4.5;
    const key = String(item.id || item.name || "product");
    return [...key].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 2 ? 5 : 4.5;
}


/* =========================================================
   FORMAT CATEGORY
   ========================================================= */

function formatCategory(category) {

    if (!category) {

        return "Luxury Hair";

    }


    return String(category)
        .charAt(0)
        .toUpperCase() +
        String(category).slice(1);

}


/* =========================================================
   CREATE MEDIA GALLERY
   ========================================================= */

function createMediaGallery() {

    mediaItems = [];


    /*
        Main image
    */

    if (product.mainImage) {

        mediaItems.push({

            type: "image",

            src: product.mainImage

        });

    }


    /*
        Additional images
    */

    if (
        Array.isArray(product.images)
    ) {

        product.images.forEach(
            image => {

                if (
                    image &&
                    image !== product.mainImage
                ) {

                    mediaItems.push({

                        type: "image",

                        src: image

                    });

                }

            }
        );

    }


    /*
        Video
    */

    const storedVideos = Array.isArray(product.videos)
        ? product.videos.map(video => typeof video === "string" ? video : video?.url).filter(Boolean)
        : [];
    const legacyMainVideo = product.mainVideo || product.videoUrl || product.video || "";
    const videoUrls = [...new Set([legacyMainVideo, ...storedVideos].filter(Boolean))];
    videoUrls.forEach(videoUrl => {
        mediaItems.push({
            type: "video",
            src: getPlayableVideoUrl(videoUrl),
            poster: product.mainImage || product.image || product.images?.[0] || ""
        });
    });


    renderThumbnails();


    if (mediaItems.length > 0) {

        showMedia(0);

    } else {

        showNoMedia();

    }

}


/* =========================================================
   SHOW NO MEDIA
   ========================================================= */

function showNoMedia() {

    if (mainProductImage) {

        mainProductImage.style.display =
            "none";

    }


    if (mainProductVideo) {

        mainProductVideo.style.display =
            "none";

    }


    if (productThumbnails) {

        productThumbnails.innerHTML = "";

    }

}


/* =========================================================
   RENDER THUMBNAILS
   ========================================================= */

function renderThumbnails() {

    if (!productThumbnails) {
        return;
    }


    productThumbnails.innerHTML = "";


    mediaItems.forEach(
        (media, index) => {

            const thumbnail =
                document.createElement(
                    "button"
                );


            thumbnail.type = "button";


            thumbnail.className =
                "product-thumbnail";


            if (index === 0) {

                thumbnail.classList.add(
                    "active"
                );

            }


            if (media.type === "image") {

                thumbnail.innerHTML = `

                    <img
                        src="${escapeHTML(media.src)}"
                        alt="${escapeHTML(product.name || "Product")}"
                    >

                `;

            } else {

                thumbnail.innerHTML = `

                    <div class="video-thumbnail">

                        ${media.poster ? `<img src="${escapeHTML(media.poster)}" alt="${escapeHTML(product.name || "Product")} video thumbnail">` : ""}

                        <span>
                            ▶
                        </span>

                        <small>
                            VIDEO
                        </small>

                    </div>

                `;

            }


            thumbnail.addEventListener(
                "click",
                () => {

                    showMedia(index);

                }
            );


            productThumbnails.appendChild(
                thumbnail
            );

        }
    );

}


/* =========================================================
   SHOW MEDIA
   ========================================================= */

function showMedia(index) {

    if (!mediaItems.length) {

        return;

    }


    if (index < 0) {

        index =
            mediaItems.length - 1;

    }


    if (
        index >= mediaItems.length
    ) {

        index = 0;

    }


    currentMediaIndex = index;


    const media =
        mediaItems[index];


    /* Hide both */

    if (mainProductImage) {

        mainProductImage.style.display =
            "none";

    }


    if (mainProductVideo) {

        mainProductVideo.style.display =
            "none";

        mainProductVideo.pause();

    }


    /* IMAGE */

    if (media.type === "image") {

        if (mainProductImage) {

            mainProductImage.src =
                media.src;

            mainProductImage.alt =
                product.name || "Product";

            mainProductImage.style.display =
                "block";

        }

    }


    /* VIDEO */

    else {

        if (mainProductVideo) {

            if (productVideoError) {
                productVideoError.hidden = true;
                productVideoError.textContent = "";
            }

            mainProductVideo.poster = media.poster || "";

            const source =
                mainProductVideo.querySelector(
                    "source"
                );


            if (source) {

                source.src =
                    media.src;

                // Detect the response MIME type so MOV and WebM aren't
                // mistakenly treated as MP4 files.
                source.removeAttribute("type");

            }


            mainProductVideo.load();


            mainProductVideo.style.display =
                "block";

        }

    }


    updateActiveThumbnail();

}


/* =========================================================
   ACTIVE THUMBNAIL
   ========================================================= */

function updateActiveThumbnail() {

    const thumbnails =
        document.querySelectorAll(
            ".product-thumbnail"
        );


    thumbnails.forEach(
        (thumbnail, index) => {

            thumbnail.classList.toggle(
                "active",
                index === currentMediaIndex
            );

        }
    );

}


/* =========================================================
   NEXT MEDIA
   ========================================================= */

if (galleryNext) {

    galleryNext.addEventListener(
        "click",
        () => {

            showMedia(
                currentMediaIndex + 1
            );

        }
    );

}


/* =========================================================
   PREVIOUS MEDIA
   ========================================================= */

if (galleryPrev) {

    galleryPrev.addEventListener(
        "click",
        () => {

            showMedia(
                currentMediaIndex - 1
            );

        }
    );

}


/* =========================================================
   CREATE PRODUCT OPTIONS
   ========================================================= */

function createProductOptions() {

    if (!productOptions) {
        return;
    }


    productOptions.innerHTML = "";


    /*
        New Firestore format:

        options: [
            {
                name: "Length",
                values: ["16", "18", "20"]
            }
        ]
    */

    if (
        Array.isArray(product.options)
    ) {

        product.options.forEach(
            optionData => {

                if (
                    !optionData ||
                    !optionData.name ||
                    !Array.isArray(
                        optionData.values
                    )
                ) {

                    return;

                }


                createOptionSelect(
                    optionData.name,
                    optionData.values
                );

            }
        );

    }


    /*
        Backwards compatibility
        with old object format
    */

    else if (
        product.options &&
        typeof product.options === "object"
    ) {

        Object.entries(
            product.options
        ).forEach(
            ([optionName, values]) => {

                if (
                    Array.isArray(values)
                ) {

                    createOptionSelect(
                        optionName,
                        values
                    );

                }

            }
        );

    }


    /*
        Colors
    */

    if (
        Array.isArray(product.colors) &&
        product.colors.length > 0
    ) {

        createOptionSelect(
            "Color",
            product.colors
        );

    }

}


/* =========================================================
   CREATE OPTION SELECT
   ========================================================= */

function createOptionSelect(
    optionName,
    values
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "product-option";


    const label =
        document.createElement(
            "label"
        );


    label.textContent =
        optionName;


    wrapper.appendChild(
        label
    );


    const select =
        document.createElement(
            "select"
        );


    select.dataset.option =
        optionName;


    values.forEach(
        value => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                value;


            option.textContent =
                value;


            select.appendChild(
                option
            );

        }
    );


    wrapper.appendChild(
        select
    );


    productOptions.appendChild(
        wrapper
    );

}


/* =========================================================
   STOCK STATE
   ========================================================= */

function updateStockState() {

    if (!product) {
        return;
    }


    if (!addToCartButton) {
        return;
    }


    const status =
        String(
            product.status || ""
        ).toLowerCase();


    const stock =
        Number(product.stock);


    const outOfStock =
        status === "out-of-stock" ||
        (
            !isNaN(stock) &&
            stock <= 0
        );


    if (outOfStock) {

        addToCartButton.disabled =
            true;

        setAddToCartButtonIcon(
            "fa-solid fa-ban",
            "Out of stock"
        );

    }

}


/* =========================================================
   QUANTITY
   ========================================================= */

if (quantityMinus) {

    quantityMinus.addEventListener(
        "click",
        () => {

            let quantity =
                Number(
                    quantityInput.value
                );


            if (
                isNaN(quantity) ||
                quantity < 1
            ) {

                quantity = 1;

            }


            if (quantity > 1) {

                quantity--;

            }


            quantityInput.value =
                quantity;

        }
    );

}


if (quantityPlus) {

    quantityPlus.addEventListener(
        "click",
        () => {

            let quantity =
                Number(
                    quantityInput.value
                );


            if (
                isNaN(quantity) ||
                quantity < 1
            ) {

                quantity = 1;

            }


            if (quantity < 99) {

                quantity++;

            }


            quantityInput.value =
                quantity;

        }
    );

}


if (quantityInput) {

    quantityInput.addEventListener(
        "change",
        () => {

            let quantity =
                Number(
                    quantityInput.value
                );


            if (
                isNaN(quantity) ||
                quantity < 1
            ) {

                quantity = 1;

            }


            if (quantity > 99) {

                quantity = 99;

            }


            quantityInput.value =
                quantity;

        }
    );

}


/* =========================================================
   GET SELECTED OPTIONS
   ========================================================= */

function getSelectedOptions() {

    const selected = {};


    const selects =
        document.querySelectorAll(
            "[data-option]"
        );


    selects.forEach(
        select => {

            selected[
                select.dataset.option
            ] = select.value;

        }
    );


    return selected;

}


/* =========================================================
   ADD TO CART
   ========================================================= */

if (addToCartButton) {

    addToCartButton.addEventListener(
        "click",
        () => {

            if (!product) {
                return;
            }


            const quantity =
                Number(
                    quantityInput?.value
                ) || 1;


            const selectedOptions =
                getSelectedOptions();


            const image =
                product.mainImage ||
                (
                    Array.isArray(
                        product.images
                    )
                        ? product.images[0]
                        : ""
                );


            const cartItem = {

                id: product.id,

                name: product.name,

                price: Number(
                    product.price
                ) || 0,

                compareAtPrice: Number(product.compareAtPrice) || null,

                image: image,

                videoUrl: product.videoUrl || product.video || "",

                poster: product.mainImage || product.image || product.images?.[0] || "",

                category: product.category || "",

                description: product.description || "",

                quantity: quantity,

                options: selectedOptions

            };


            let cart =
                JSON.parse(
                    localStorage.getItem(
                        "sunshinesCart"
                    )
                ) || [];


            cart.push(cartItem);


            localStorage.setItem(
                "sunshinesCart",
                JSON.stringify(cart)
            );
            window.dispatchEvent(new Event("sunshines-cart-updated"));


            setAddToCartButtonIcon(
                "fa-solid fa-check",
                "Added to cart"
            );


            setTimeout(
                () => {

                    /*
                        Only restore text if
                        the product is still in stock.
                    */

                    const status =
                        String(
                            product.status || ""
                        ).toLowerCase();


                    if (
                        status !==
                        "out-of-stock"
                    ) {

                        setAddToCartButtonIcon(
                            "fa-solid fa-cart-shopping",
                            "Add to cart"
                        );

                    }

                },
                2000
            );


            updateCartCount();

        }
    );

}


/* =========================================================
   CART COUNT
   ========================================================= */

function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {
        return;
    }


    const cart =
        JSON.parse(
            localStorage.getItem(
                "sunshinesCart"
            )
        ) || [];


    const total =
        cart.reduce(
            (
                sum,
                item
            ) =>
                sum +
                (
                    Number.isFinite(Number(item.quantity)) &&
                    Number(item.quantity) > 0
                        ? Math.floor(Number(item.quantity))
                        : 1
                ),
            0
        );


    cartCount.textContent =
        total;

}


/* =========================================================
   WHATSAPP ORDER
   ========================================================= */

if (whatsappButton) {

    whatsappButton.addEventListener(
        "click",
        () => {

            if (!product) {
                return;
            }


            const quantity =
                Number(
                    quantityInput?.value
                ) || 1;


            const selectedOptions =
                getSelectedOptions();


            let message =
                `Hello Sunshine's Luxury Hair,\n\n` +
                `I would like to order:\n\n`;


            message +=
                `Product: ${product.name}\n`;


            message +=
                `Price: ${
                    formatPrice(product.price)
                }\n`;


            message +=
                `Quantity: ${quantity}\n`;


            Object.entries(
                selectedOptions
            ).forEach(
                ([name, value]) => {

                    message +=
                        `${name}: ${value}\n`;

                }
            );


            /*
                REPLACE THIS WITH
                YOUR REAL WHATSAPP NUMBER.

                Nigeria example:

                2348012345678

                Do NOT include + or spaces.
            */

            const phoneNumber = STORE_SETTINGS.whatsappNumber || "237681880898";


            const whatsappURL =
                `https://wa.me/${phoneNumber}?text=${
                    encodeURIComponent(message)
                }`;


            window.open(
                whatsappURL,
                "_blank"
            );

        }
    );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

loadProduct();

updateCartCount();
