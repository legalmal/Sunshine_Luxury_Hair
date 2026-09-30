/* =========================================
   SUNSHINE'S LUXURY HAIR
   ADD PRODUCT
   Main Image + Gallery Images + Video
========================================= */

import {
    db,
    collection,
    addDoc,
    serverTimestamp
} from "./firebase.js";

import {
    uploadProductImage,
    uploadProductVideo
} from "./cloudinary.js";


document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENTS
    ========================================= */

    const productForm =
        document.getElementById("productForm");

    const mainImageInput =
        document.getElementById("mainProductImage");

    const mainImagePreview =
        document.getElementById("mainImagePreview");

    const galleryInput =
        document.getElementById("productImages");

    const galleryPreview =
        document.getElementById("imagePreview");

    const videoInput =
        document.getElementById("productVideo");

    const videoPreview =
        document.getElementById("videoPreview");

    const addOptionBtn =
        document.getElementById("addOptionBtn");

    const optionsContainer =
        document.getElementById("optionsContainer");

    const saveButton =
        document.getElementById("saveProductBtn");


    /* =========================================
       SELECTED FILES
    ========================================= */

    let selectedMainImage = null;
    let selectedGalleryImages = [];
    let selectedMainVideoIndex = 0;


    /* =========================================
       CHECK FORM
    ========================================= */

    if (!productForm) {

        console.error(
            "ERROR: #productForm was not found."
        );

        return;
    }


    /* =========================================
       HELPER: FORMAT FILE SIZE
    ========================================= */

    function formatFileSize(bytes) {

        if (!bytes) {
            return "0 KB";
        }

        const kb = bytes / 1024;

        if (kb < 1024) {
            return `${kb.toFixed(1)} KB`;
        }

        const mb = kb / 1024;

        return `${mb.toFixed(2)} MB`;
    }


    /* =========================================
       HELPER: SHOW STATUS
    ========================================= */

    function showStatus(message, type = "info") {

        let status =
            document.getElementById("productUploadStatus");


        if (!status) {

            status =
                document.createElement("div");

            status.id =
                "productUploadStatus";

            status.className =
                "product-upload-status";

            productForm.prepend(status);
        }


        status.className =
            `product-upload-status ${type}`;
        status.setAttribute("role", type === "error" ? "alert" : "status");
        status.setAttribute("aria-live", type === "error" ? "assertive" : "polite");

        const icon = document.createElement("i");
        icon.className = type === "success"
            ? "fa-solid fa-circle-check"
            : type === "error"
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-spinner fa-spin";
        icon.setAttribute("aria-hidden", "true");

        const messageText = document.createElement("span");
        messageText.textContent = message;
        status.replaceChildren(icon, messageText);

        status.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }


    /* =========================================
       HELPER: CLEAR STATUS
    ========================================= */

    function clearStatus() {

        const status =
            document.getElementById(
                "productUploadStatus"
            );

        if (status) {
            status.remove();
        }
    }


    /* =========================================
       MAIN IMAGE PREVIEW
    ========================================= */

    if (mainImageInput) {

        mainImageInput.addEventListener(
            "change",
            () => {

                const file =
                    mainImageInput.files?.[0];

                selectedMainImage =
                    file || null;


                if (mainImagePreview) {
                    mainImagePreview.innerHTML = "";
                }

                const videoPreviewElement = videoPreview?.querySelector("video");
                if (videoPreviewElement) {
                    videoPreviewElement.poster = file?.type.startsWith("image/")
                        ? URL.createObjectURL(file)
                        : "";
                }


                if (!file) {
                    return;
                }


                /* Validate image */

                if (!file.type.startsWith("image/")) {

                    selectedMainImage = null;

                    mainImageInput.value = "";

                    showStatus(
                        "Please select a valid image file.",
                        "error"
                    );

                    return;
                }


                /* Create preview */

                const wrapper =
                    document.createElement("div");

                wrapper.className =
                    "main-preview-card";


                const img =
                    document.createElement("img");

                img.alt =
                    "Main product image preview";


                const reader =
                    new FileReader();


                reader.onload =
                    event => {

                        img.src =
                            event.target.result;

                    };


                reader.readAsDataURL(file);


                const information =
                    document.createElement("div");

                information.className =
                    "preview-file-info";


                information.innerHTML = `
                    <strong>
                        ${file.name}
                    </strong>

                    <span>
                        ${formatFileSize(file.size)}
                    </span>

                    <span class="preview-main-badge">
                        MAIN IMAGE
                    </span>
                `;


                wrapper.appendChild(img);

                wrapper.appendChild(information);


                mainImagePreview.appendChild(
                    wrapper
                );

            }
        );

    }


    /* =========================================
       GALLERY IMAGE PREVIEW
    ========================================= */

    if (galleryInput) {

        galleryInput.addEventListener(
            "change",
            () => {

                const files =
                    Array.from(
                        galleryInput.files || []
                    );


                /* Maximum 3 gallery images */

                if (files.length > 3) {

                    selectedGalleryImages =
                        files.slice(0, 3);

                    showStatus(
                        "You can upload a maximum of 3 gallery images. The first 3 were selected.",
                        "error"
                    );

                } else {

                    selectedGalleryImages =
                        files;
                }


                /* Clear preview */

                if (galleryPreview) {
                    galleryPreview.innerHTML = "";
                }


                /* Validate */

                selectedGalleryImages =
                    selectedGalleryImages.filter(
                        file => {

                            if (
                                !file.type.startsWith(
                                    "image/"
                                )
                            ) {

                                return false;
                            }

                            return true;
                        }
                    );


                /* Create previews */

                selectedGalleryImages.forEach(
                    (file, index) => {

                        const wrapper =
                            document.createElement(
                                "div"
                            );

                        wrapper.className =
                            "preview-image";


                        const img =
                            document.createElement(
                                "img"
                            );


                        img.alt =
                            `Gallery image ${index + 1}`;


                        const reader =
                            new FileReader();


                        reader.onload =
                            event => {

                                img.src =
                                    event.target.result;

                            };


                        reader.readAsDataURL(file);


                        wrapper.appendChild(img);


                        const number =
                            document.createElement(
                                "span"
                            );

                        number.className =
                            "gallery-image-number";

                        number.textContent =
                            `${index + 1}`;


                        wrapper.appendChild(
                            number
                        );


                        galleryPreview.appendChild(
                            wrapper
                        );

                    }
                );

            }
        );

    }


    /* =========================================
       VIDEO PREVIEW
    ========================================= */

    function renderVideoPreview() {
        if (!videoPreview) return;
        videoPreview.innerHTML = "";
        const files = Array.from(videoInput?.files || []);
        if (!files.length) return;

        files.forEach((file, index) => {
            if (!file.type.startsWith("video/")) return;
            const wrapper = document.createElement("div");
            wrapper.className = "video-preview-card";
            const video = document.createElement("video");
            video.controls = true;
            video.preload = "metadata";
            video.src = URL.createObjectURL(file);
            wrapper.appendChild(video);

            const information = document.createElement("div");
            information.className = "preview-file-info";
            const name = document.createElement("strong");
            name.textContent = file.name;
            const size = document.createElement("span");
            size.textContent = formatFileSize(file.size);
            const mainLabel = document.createElement("label");
            const mainChoice = document.createElement("input");
            mainChoice.type = "radio";
            mainChoice.name = "mainProductVideoChoice";
            mainChoice.value = String(index);
            mainChoice.checked = index === selectedMainVideoIndex;
            mainChoice.setAttribute("aria-label", `Set ${file.name} as the main video`);
            mainChoice.addEventListener("change", () => {
                selectedMainVideoIndex = index;
                renderVideoPreview();
            });
            mainLabel.append(mainChoice, document.createTextNode(" Main video"));
            information.append(name, size, mainLabel);
            wrapper.appendChild(information);
            videoPreview.appendChild(wrapper);
        });
    }

    if (videoInput) {
        videoInput.addEventListener("change", () => {
            const files = Array.from(videoInput.files || []);
            if (files.some(file => !file.type.startsWith("video/"))) {
                videoInput.value = "";
                showStatus("Please select valid video files.", "error");
                return;
            }
            selectedMainVideoIndex = 0;
            renderVideoPreview();
        });
    }


    /* =========================================
       ADD PRODUCT OPTION
    ========================================= */

    if (
        addOptionBtn &&
        optionsContainer
    ) {

        addOptionBtn.addEventListener(
            "click",
            () => {

                const option =
                    document.createElement(
                        "div"
                    );


                option.className =
                    "product-option";


                option.innerHTML = `

                    <div class="option-fields">

                        <div class="form-group">

                            <label>
                                Option Name
                            </label>

                            <input
                                type="text"
                                class="option-name"
                                placeholder="e.g. Texture"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Option Values
                            </label>

                            <input
                                type="text"
                                class="option-values"
                                placeholder="e.g. Straight, Body Wave, Curly"
                            >

                            <small>
                                Separate values with commas.
                            </small>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="remove-option"
                    >

                        <i class="fa-solid fa-trash"></i>

                        Remove

                    </button>

                `;


                optionsContainer.appendChild(
                    option
                );


                setupRemoveButton(
                    option.querySelector(
                        ".remove-option"
                    )
                );

            }
        );

    }


    /* =========================================
       REMOVE OPTION
    ========================================= */

    function setupRemoveButton(button) {

        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            () => {

                const option =
                    button.closest(
                        ".product-option"
                    );


                if (option) {
                    option.remove();
                }

            }
        );

    }


    document
        .querySelectorAll(
            ".remove-option"
        )
        .forEach(
            button => {
                setupRemoveButton(button);
            }
        );


    /* =========================================
       CREATE SLUG
    ========================================= */

    function createSlug(name) {

        return name
            .toLowerCase()
            .trim()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                "");

    }


    /* =========================================
       SUBMIT PRODUCT
    ========================================= */

    productForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            try {

                /* =================================
                   DISABLE BUTTON
                ================================= */

                if (saveButton) {

                    saveButton.disabled =
                        true;

                    saveButton.innerHTML = `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Preparing...
                    `;

                }


                clearStatus();


                /* =================================
                   GET FORM FIELDS
                ================================= */

                const nameInput =
                    document.getElementById(
                        "productName"
                    );

                const priceInput =
                    document.getElementById(
                        "productPrice"
                    );

                const categoryInput =
                    document.getElementById(
                        "productCategory"
                    );

                const descriptionInput =
                    document.getElementById(
                        "productDescription"
                    );

                const colorsInput =
                    document.getElementById(
                        "productColors"
                    );

                const statusInput =
                    document.getElementById(
                        "productStatus"
                    );

                const stockInput =
                    document.getElementById(
                        "productStock"
                    );

                const featuredInput =
                    document.getElementById(
                        "productFeatured"
                    );


                /* =================================
                   VALIDATE FIELDS
                ================================= */

                if (!nameInput?.value.trim()) {

                    throw new Error(
                        "Please enter a product name."
                    );

                }


                const name =
                    nameInput.value.trim();


                const price =
                    Number(
                        priceInput.value
                    );


                if (
                    Number.isNaN(price) ||
                    price < 0
                ) {

                    throw new Error(
                        "Please enter a valid product price."
                    );

                }


                const category =
                    categoryInput.value;


                if (!category) {

                    throw new Error(
                        "Please select a product category."
                    );

                }


                const description =
                    descriptionInput.value.trim();


                if (!description) {

                    throw new Error(
                        "Please enter a product description."
                    );

                }


                const stock =
                    Number(
                        stockInput.value
                    );


                if (
                    Number.isNaN(stock) ||
                    stock < 0
                ) {

                    throw new Error(
                        "Please enter a valid stock quantity."
                    );

                }


                /* =================================
                   MAIN IMAGE VALIDATION
                ================================= */

                if (
                    !selectedMainImage &&
                    selectedGalleryImages.length === 0 &&
                    !videoInput?.files?.length
                ) {

                    throw new Error(
                        "Please add at least one product image or video."
                    );

                }


                /* =================================
                   GALLERY VALIDATION
                ================================= */

                if (
                    selectedGalleryImages.length >
                    3
                ) {

                    throw new Error(
                        "You can upload a maximum of 3 gallery images."
                    );

                }


                /* =================================
                   COLORS
                ================================= */

                const colors =
                    colorsInput.value
                        .split(",")
                        .map(
                            color =>
                                color.trim()
                        )
                        .filter(Boolean);


                /* =================================
                   PRODUCT OPTIONS
                ================================= */

                const options = [];


                document
                    .querySelectorAll(
                        ".product-option"
                    )
                    .forEach(option => {

                        const nameElement =
                            option.querySelector(
                                ".option-name"
                            );

                        const valuesElement =
                            option.querySelector(
                                ".option-values"
                            );


                        if (
                            !nameElement ||
                            !valuesElement
                        ) {

                            return;

                        }


                        const optionName =
                            nameElement.value.trim();


                        const optionValues =
                            valuesElement.value
                                .split(",")
                                .map(
                                    value =>
                                        value.trim()
                                )
                                .filter(Boolean);


                        if (
                            optionName &&
                            optionValues.length
                        ) {

                            options.push({

                                name:
                                    optionName,

                                values:
                                    optionValues

                            });

                        }

                    });


                /* =================================
                   UPLOAD MAIN IMAGE
                ================================= */

                let mainImage = "";

                if (selectedMainImage) {
                    if (saveButton) {
                        saveButton.innerHTML = `
                            <i class="fa-solid fa-spinner fa-spin"></i>
                            Uploading Main Image...
                        `;
                    }

                    showStatus("Uploading main product image...", "info");

                    const mainImageResult = await uploadProductImage(selectedMainImage);

                    if (!mainImageResult?.url) {
                        throw new Error("Main image upload failed.");
                    }

                    mainImage = mainImageResult.url;
                }


                /* =================================
                   UPLOAD GALLERY IMAGES
                ================================= */

                const galleryImages = [];


                for (
                    let i = 0;
                    i < selectedGalleryImages.length;
                    i++
                ) {

                    const file =
                        selectedGalleryImages[i];


                    if (saveButton) {

                        saveButton.innerHTML = `
                            <i class="fa-solid fa-spinner fa-spin"></i>
                            Gallery ${i + 1}/${selectedGalleryImages.length}
                        `;

                    }


                    showStatus(
                        `Uploading gallery image ${i + 1} of ${selectedGalleryImages.length}...`,
                        "info"
                    );


                    const result =
                        await uploadProductImage(
                            file
                        );


                    if (
                        !result ||
                        !result.url
                    ) {

                        throw new Error(
                            `Gallery image ${i + 1} upload failed.`
                        );

                    }


                    galleryImages.push(
                        result.url
                    );

                }


                /* =================================
                   COMBINE IMAGES
                ================================= */

                const allImages = [
                    ...(mainImage ? [mainImage] : []),
                    ...galleryImages
                ];

                if (!mainImage && galleryImages.length) {
                    mainImage = galleryImages[0];
                }


                /* =================================
                   UPLOAD VIDEO
                ================================= */

                const videoFiles = Array.from(videoInput?.files || []);
                const videos = [];
                for (let i = 0; i < videoFiles.length; i++) {
                    if (saveButton) {
                        saveButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading Video ${i + 1} of ${videoFiles.length}...`;
                    }
                    showStatus(`Uploading product video ${i + 1} of ${videoFiles.length}...`, "info");
                    const uploaded = await uploadProductVideo(videoFiles[i]);
                    if (!uploaded?.url) throw new Error(`Product video ${i + 1} upload failed.`);
                    videos.push(uploaded.url);
                }
                const mainVideo = videos.length
                    ? videos[Math.min(selectedMainVideoIndex, videos.length - 1)]
                    : "";


                /* =================================
                   CREATE PRODUCT OBJECT
                ================================= */

                if (saveButton) {

                    saveButton.innerHTML = `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Saving Product...
                    `;

                }


                showStatus(
                    "Saving product to your store...",
                    "info"
                );


                const product = {

                    name,

                    slug:
                        createSlug(name),

                    category,

                    description,

                    price,

                    compareAtPrice:
                        null,

                    stock,

                    status:
                        stock === 0
                            ? "out-of-stock"
                            : statusInput.value,

                    featured:
                        featuredInput.checked,

                    /*
                     * MAIN IMAGE
                     * Used by homepage and
                     * large product image.
                     */

                    mainImage,

                    /*
                     * ALL PRODUCT IMAGES
                     * First image is always
                     * the main image.
                     */

                    images:
                        allImages,

                    videos,

                    mainVideo,

                    // Keep the legacy field for existing product cards and integrations.
                    videoUrl: mainVideo,

                    colors,

                    options,

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                };


                console.log(
                    "Product ready for Firestore:",
                    product
                );


                /* =================================
                   SAVE TO FIRESTORE
                ================================= */

                await addDoc(
                    collection(
                        db,
                        "products"
                    ),
                    product
                );


                /* =================================
                   SUCCESS
                ================================= */

                showStatus(
                    "Product added successfully!",
                    "success"
                );


                if (saveButton) {

                    saveButton.innerHTML = `
                        <i class="fa-solid fa-circle-check"></i>
                        Product Saved
                    `;

                }


                /*
                 * Give the success message
                 * a moment before redirecting.
                 */

                setTimeout(
                    () => {

                        window.location.href =
                            "products.html";

                    },
                    1000
                );

            }


            catch (error) {

                console.error(
                    "ADD PRODUCT ERROR:",
                    error
                );


                showStatus(
                    error.message ||
                    "Something went wrong while adding the product.",
                    "error"
                );


                if (saveButton) {

                    saveButton.disabled =
                        false;

                    saveButton.innerHTML = `
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        Save Product
                    `;

                }

            }

        }
    );


});
